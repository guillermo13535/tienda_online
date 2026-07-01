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
// Compara teléfonos ignorando espacios/código de país (uno termina en el otro)
function phoneEq(a, b) {
  a = String(a || "").replace(/\D/g, "");
  b = String(b || "").replace(/\D/g, "");
  if (a.length < 8 || b.length < 8) return false;
  return a === b || a.endsWith(b) || b.endsWith(a);
}
function normPhone(t) { return String(t || "").replace(/\D/g, ""); }
const otpStore = {}; // { telefonoDigits: { code, exp } }

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
    const { nombre, apellido, email, password, telefono } = await readBody(req);
    if (!email || !password) return json(res, 400, { error: "Faltan datos" });
    const mail = String(email).toLowerCase().trim();
    const tel = String(telefono || "").trim();
    const dup = db.data.users.some((u) => u.email === mail || phoneEq(u.telefono, tel));
    if (dup) return json(res, 409, { error: "Ya existe una cuenta con ese correo o teléfono" });
    const id = Math.max(0, ...db.data.users.map((u) => u.id)) + 1;
    db.data.users.push({ id, nombre, apellido: apellido || "", email: mail, telefono: tel, password: auth.hashPassword(password), role: "cliente" });
    db.save();
    return json(res, 201, { ok: true });
  }
  if (p === "/api/auth/login" && m === "POST") {
    const { email, password } = await readBody(req);
    const id = String(email || "").toLowerCase().trim();
    const user = db.data.users.find((u) => u.email === id || phoneEq(u.telefono, id));
    if (!user || !auth.verifyPassword(password, user.password)) return json(res, 401, { error: "Correo/teléfono o contraseña incorrectos" });
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
      estado: "Pagado",
      historial: [{ estado: "Pagado", fecha: new Date().toISOString() }],
      fecha: new Date().toISOString()
    };
    db.data.orders.unshift(order); db.save();
    return json(res, 201, order);
  }

  // PEDIDOS: actualizar estado (solo admin) -> Pagado / Despachado / En camino / Entregado
  const oem = p.match(/^\/api\/orders\/([\w-]+)\/estado$/);
  if (oem && m === "PUT") {
    const u = currentUser(req);
    if (!u || u.role !== "admin") return json(res, 403, { error: "Solo administradores" });
    const { estado } = await readBody(req);
    const o = db.data.orders.find((x) => x.id === oem[1]);
    if (!o) return json(res, 404, { error: "Pedido no encontrado" });
    o.estado = estado;
    (o.historial = o.historial || []).push({ estado, fecha: new Date().toISOString() });
    db.save();
    return json(res, 200, o);
  }

  // OTP por SMS: enviar código (usa Twilio si hay credenciales; si no, modo demo)
  if (p === "/api/otp/send" && m === "POST") {
    const { telefono } = await readBody(req);
    const key = normPhone(telefono);
    if (key.length < 8) return json(res, 400, { error: "Teléfono inválido" });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    otpStore[key] = { code, exp: Date.now() + 5 * 60 * 1000 };
    const sid = process.env.TWILIO_SID, token = process.env.TWILIO_TOKEN, from = process.env.TWILIO_FROM;
    if (sid && token && from) {
      try {
        const body = new URLSearchParams({ To: "+" + key, From: from, Body: `Tu código de verificación TecnoShop es: ${code}` });
        const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
          method: "POST",
          headers: { "Authorization": "Basic " + Buffer.from(sid + ":" + token).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString()
        });
        if (!r.ok) { const e = await r.json().catch(() => ({})); return json(res, 502, { error: "No se pudo enviar el SMS", detalle: e }); }
        return json(res, 200, { ok: true, canal: "sms" });
      } catch (e) { return json(res, 502, { error: "Error al enviar SMS: " + e.message }); }
    }
    return json(res, 200, { ok: true, demo: true, code }); // sin Twilio: devolvemos el código para mostrarlo
  }

  // OTP por SMS: verificar código
  if (p === "/api/otp/verify" && m === "POST") {
    const { telefono, code } = await readBody(req);
    const key = Object.keys(otpStore).find((k) => phoneEq(k, telefono));
    const rec = key ? otpStore[key] : null;
    if (!rec || rec.exp < Date.now()) return json(res, 400, { ok: false, error: "El código expiró. Solicítalo de nuevo." });
    if (String(code) !== rec.code) return json(res, 400, { ok: false, error: "Código incorrecto." });
    delete otpStore[key];
    return json(res, 200, { ok: true });
  }

  // MERCADO PAGO: crear preferencia de pago (seguro, con el Access Token del servidor)
  if (p === "/api/pago/preferencia" && m === "POST") {
    const token = process.env.MP_ACCESS_TOKEN;
    const { items } = await readBody(req);
    if (!token) {
      // Sin credenciales: responder en modo demostración
      return json(res, 200, { demo: true, message: "Define MP_ACCESS_TOKEN para activar el pago real" });
    }
    // Construir los ítems con precios tomados del servidor (no se confía en el front)
    const mpItems = [];
    for (const it of (items || [])) {
      const prod = db.data.products.find((x) => x.id === Number(it.id));
      if (prod) mpItems.push({ title: prod.name, quantity: it.qty, unit_price: prod.price, currency_id: "CLP" });
    }
    if (!mpItems.length) return json(res, 400, { error: "Carrito vacío" });
    const host = req.headers.host;
    try {
      const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({
          items: mpItems,
          back_urls: {
            success: `http://${host}/pedidos.html`,
            failure: `http://${host}/carrito.html`,
            pending: `http://${host}/pedidos.html`
          },
          auto_return: "approved"
        })
      });
      const data = await r.json();
      if (!r.ok) return json(res, 502, { error: "Error de Mercado Pago", detalle: data });
      return json(res, 200, { id: data.id, init_point: data.init_point, sandbox_init_point: data.sandbox_init_point });
    } catch (e) {
      return json(res, 502, { error: "No se pudo conectar con Mercado Pago: " + e.message });
    }
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
