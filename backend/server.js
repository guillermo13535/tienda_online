/* =========================================================
   TecnoShop API - Servidor REST + sitio estático
   Node.js sin dependencias externas. Ejecutar: node server.js
   ========================================================= */
const http = require("http");
const fs = require("fs");
const path = require("path");
const db = require("./lib/db");
const auth = require("./lib/auth");

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, ".."); // raíz del front-end

db.load();

// Crear administrador por defecto si no existe
if (!db.data.users.some((u) => u.role === "admin")) {
  db.data.users.push({
    id: 1, nombre: "Administrador", apellido: "", email: "admin@tecnoshop.cl",
    password: auth.hashPassword("admin123"), role: "admin"
  });
  db.save();
  console.log("👤 Admin creado: admin@tecnoshop.cl / admin123");
}

/* ---------- Helpers ---------- */
function json(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve) => {
    let b = "";
    req.on("data", (c) => (b += c));
    req.on("end", () => { try { resolve(b ? JSON.parse(b) : {}); } catch { resolve({}); } });
  });
}
function currentUser(req) {
  const h = req.headers["authorization"] || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  const payload = auth.verify(token);
  if (!payload) return null;
  return db.data.users.find((u) => u.id === payload.id) || null;
}
function publicUser(u) {
  return { id: u.id, nombre: u.nombre, email: u.email, role: u.role };
}

/* ---------- Archivos estáticos (sirve el sitio) ---------- */
const MIME = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".mp4": "video/mp4"
};
function serveStatic(req, res, urlPath) {
  if (urlPath.startsWith("/backend")) return json(res, 403, { error: "Prohibido" });
  let rel = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.normalize(path.join(ROOT, decodeURIComponent(rel)));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end("Prohibido"); }
  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end("No encontrado"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });
}

/* ---------- API REST ---------- */
async function api(req, res, p) {
  const m = req.method;

  // PRODUCTOS
  if (p === "/api/products" && m === "GET") return json(res, 200, db.data.products);
  if (p === "/api/products" && m === "POST") {
    const u = currentUser(req);
    if (!u || u.role !== "admin") return json(res, 403, { error: "Solo administradores" });
    const body = await readBody(req);
    if (!body.name || !body.price) return json(res, 400, { error: "Faltan nombre o precio" });
    const id = Math.max(0, ...db.data.products.map((x) => x.id)) + 1;
    const prod = {
      id, sold: 0, full: false, condition: "Nuevo",
      gallery: [body.image || "assets/placeholder.svg"], specs: {}, ...body
    };
    db.data.products.push(prod); db.save();
    return json(res, 201, prod);
  }
  const pm = p.match(/^\/api\/products\/(\d+)$/);
  if (pm) {
    const id = Number(pm[1]);
    const idx = db.data.products.findIndex((x) => x.id === id);
    if (m === "PUT") {
      const u = currentUser(req);
      if (!u || u.role !== "admin") return json(res, 403, { error: "Solo administradores" });
      if (idx < 0) return json(res, 404, { error: "Producto no encontrado" });
      const body = await readBody(req);
      db.data.products[idx] = { ...db.data.products[idx], ...body, id };
      db.save(); return json(res, 200, db.data.products[idx]);
    }
    if (m === "DELETE") {
      const u = currentUser(req);
      if (!u || u.role !== "admin") return json(res, 403, { error: "Solo administradores" });
      if (idx < 0) return json(res, 404, { error: "Producto no encontrado" });
      const removed = db.data.products.splice(idx, 1)[0]; db.save();
      return json(res, 200, removed);
    }
  }

  // AUTENTICACIÓN
  if (p === "/api/auth/register" && m === "POST") {
    const { nombre, apellido, email, password } = await readBody(req);
    if (!email || !password) return json(res, 400, { error: "Faltan datos" });
    const mail = String(email).toLowerCase().trim();
    if (db.data.users.some((u) => u.email === mail)) return json(res, 409, { error: "Ya existe una cuenta con ese correo" });
    const id = Math.max(0, ...db.data.users.map((u) => u.id)) + 1;
    db.data.users.push({ id, nombre, apellido: apellido || "", email: mail, password: auth.hashPassword(password), role: "cliente" });
    db.save();
    return json(res, 201, { ok: true });
  }
  if (p === "/api/auth/login" && m === "POST") {
    const { email, password } = await readBody(req);
    const mail = String(email || "").toLowerCase().trim();
    const user = db.data.users.find((u) => u.email === mail);
    if (!user || !auth.verifyPassword(password, user.password)) return json(res, 401, { error: "Correo o contraseña incorrectos" });
    return json(res, 200, { token: auth.sign({ id: user.id, role: user.role }), user: publicUser(user) });
  }
  if (p === "/api/auth/me" && m === "GET") {
    const u = currentUser(req);
    if (!u) return json(res, 401, { error: "No autenticado" });
    return json(res, 200, publicUser(u));
  }

  // PEDIDOS
  if (p === "/api/orders" && m === "GET") {
    const u = currentUser(req);
    if (!u) return json(res, 401, { error: "No autenticado" });
    const list = u.role === "admin" ? db.data.orders : db.data.orders.filter((o) => o.userId === u.id);
    return json(res, 200, list);
  }
  if (p === "/api/orders" && m === "POST") {
    const u = currentUser(req);
    if (!u) return json(res, 401, { error: "Debes iniciar sesión para comprar" });
    const { items, metodo } = await readBody(req);
    if (!Array.isArray(items) || !items.length) return json(res, 400, { error: "El carrito está vacío" });

    // Validar stock y calcular total EN EL SERVIDOR (no se confía en el front)
    let total = 0; const detail = [];
    for (const it of items) {
      const prod = db.data.products.find((x) => x.id === Number(it.id));
      if (!prod) return json(res, 400, { error: "Producto inexistente: " + it.id });
      if (prod.stock < it.qty) return json(res, 409, { error: "Sin stock suficiente de " + prod.name });
      total += prod.price * it.qty;
      detail.push({ id: prod.id, nombre: prod.name, qty: it.qty, price: prod.price });
    }
    // Descontar stock
    for (const it of items) {
      const prod = db.data.products.find((x) => x.id === Number(it.id));
      prod.stock -= it.qty;
    }
    const order = {
      id: "TS-" + Date.now().toString().slice(-8), userId: u.id, email: u.email,
      cliente: u.nombre, items: detail, total, metodo: metodo || "Tarjeta",
      fecha: new Date().toISOString()
    };
    db.data.orders.unshift(order); db.save();
    return json(res, 201, order);
  }

  return json(res, 404, { error: "Ruta no encontrada" });
}

/* ---------- Servidor ---------- */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  // CORS (por si el front corre en otro origen/puerto)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }

  if (url.pathname.startsWith("/api/")) {
    try { return await api(req, res, url.pathname); }
    catch (e) { console.error(e); return json(res, 500, { error: "Error interno del servidor" }); }
  }
  return serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`\n🚀 TecnoShop API + sitio en http://localhost:${PORT}`);
  console.log(`   API REST disponible en http://localhost:${PORT}/api\n`);
});
