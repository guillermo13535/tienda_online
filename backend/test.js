/* =========================================================
   TecnoShop - Pruebas automatizadas de la API REST
   Ejecutar: 1) node server.js   2) node test.js
   Usa el runner nativo de Node (node:test), sin dependencias.
   ========================================================= */
const { test } = require("node:test");
const assert = require("node:assert");

const BASE = process.env.BASE || "http://localhost:3000";

async function req(path, opts = {}) {
  const r = await fetch(BASE + path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) }
  });
  return { status: r.status, body: await r.json().catch(() => null) };
}

let token;

test("CP-A1: GET /api/products devuelve el catálogo", async () => {
  const r = await req("/api/products");
  assert.strictEqual(r.status, 200);
  assert.ok(Array.isArray(r.body));
  assert.ok(r.body.length >= 50, "debe haber al menos 50 productos");
});

test("CP-A2: POST /api/auth/register crea un usuario", async () => {
  const email = "qa" + Date.now() + "@test.cl";
  const r = await req("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ nombre: "QA", email, password: "123456" })
  });
  assert.strictEqual(r.status, 201);
  assert.strictEqual(r.body.ok, true);
});

test("CP-A3: POST /api/auth/login (admin) devuelve token", async () => {
  const r = await req("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@tecnoshop.cl", password: "admin123" })
  });
  assert.strictEqual(r.status, 200);
  assert.ok(r.body.token, "debe devolver un token");
  token = r.body.token;
});

test("CP-A4: login con clave incorrecta es rechazado (401)", async () => {
  const r = await req("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@tecnoshop.cl", password: "incorrecta" })
  });
  assert.strictEqual(r.status, 401);
});

test("CP-A5: POST /api/orders crea pedido y descuenta stock", async () => {
  const antes = (await req("/api/products")).body.find((p) => p.id === 14).stock;
  const r = await req("/api/orders", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body: JSON.stringify({ items: [{ id: 14, qty: 2 }], metodo: "Tarjeta" })
  });
  assert.strictEqual(r.status, 201);
  assert.ok(r.body.id, "el pedido debe tener id");
  const despues = (await req("/api/products")).body.find((p) => p.id === 14).stock;
  assert.strictEqual(despues, antes - 2, "el stock debe bajar en 2");
});

test("CP-A6: un cliente NO puede crear productos (403)", async () => {
  const email = "cli" + Date.now() + "@test.cl";
  await req("/api/auth/register", { method: "POST", body: JSON.stringify({ nombre: "Cli", email, password: "123456" }) });
  const login = await req("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password: "123456" }) });
  const r = await req("/api/products", {
    method: "POST",
    headers: { Authorization: "Bearer " + login.body.token },
    body: JSON.stringify({ name: "Producto pirata", price: 1 })
  });
  assert.strictEqual(r.status, 403);
});

test("CP-A7: pedido sin sesión es rechazado (401)", async () => {
  const r = await req("/api/orders", { method: "POST", body: JSON.stringify({ items: [{ id: 1, qty: 1 }] }) });
  assert.strictEqual(r.status, 401);
});
