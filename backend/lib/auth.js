/* =========================================================
   TecnoShop API - Seguridad (hashing de contraseñas + tokens)
   Usa solo módulos nativos de Node (crypto), sin dependencias.
   ========================================================= */
const crypto = require("crypto");

const SECRET = process.env.JWT_SECRET || "tecnoshop-dev-secret-cambia-esto-en-produccion";

// --- Contraseñas: hash con scrypt + salt ---
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const calc = crypto.scryptSync(String(password), salt, 64).toString("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(calc, "hex"));
  } catch {
    return false;
  }
}

// --- Token tipo JWT (HMAC SHA-256), sin dependencias ---
function b64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

function sign(payload, expiresInMs = 1000 * 60 * 60 * 24 * 7) {
  const body = { ...payload, iat: Date.now(), exp: Date.now() + expiresInMs };
  const data = b64url({ alg: "HS256", typ: "JWT" }) + "." + b64url(body);
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return data + "." + sig;
}

function verify(token) {
  try {
    const [h, p, s] = token.split(".");
    const expected = crypto.createHmac("sha256", SECRET).update(h + "." + p).digest("base64url");
    if (s !== expected) return null;
    const payload = JSON.parse(Buffer.from(p, "base64url").toString());
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

module.exports = { hashPassword, verifyPassword, sign, verify };
