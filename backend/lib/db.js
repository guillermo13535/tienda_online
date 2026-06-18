/* =========================================================
   TecnoShop API - Persistencia (base de datos en archivo JSON)
   En producción se reemplaza por PostgreSQL/MySQL/MongoDB.
   ========================================================= */
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const SEED_PATH = path.join(DATA_DIR, "seed-products.json");

let data = { products: [], users: [], orders: [] };

function load() {
  if (fs.existsSync(DB_PATH)) {
    data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } else {
    const products = fs.existsSync(SEED_PATH)
      ? JSON.parse(fs.readFileSync(SEED_PATH, "utf8"))
      : [];
    data = { products, users: [], orders: [] };
    save();
  }
}

function save() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
  get data() { return data; },
  load,
  save
};
