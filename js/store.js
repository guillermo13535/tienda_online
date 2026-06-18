/* =========================================================
   TecnoShop - Lógica compartida (estructura estilo Mercado Libre)
   - Carrito, productos (persistentes), usuarios, pedidos
   - Header con buscador + barra de categorías + cuenta
   - Footer multi-columna
   Se carga DESPUÉS de products.js en todas las páginas.
   ========================================================= */

(function () {
  "use strict";

  const CART_KEY = "tecnoshop_carrito";
  const PRODUCTS_KEY = "tecnoshop_productos";
  const USERS_KEY = "tecnoshop_usuarios";
  const SESSION_KEY = "tecnoshop_sesion";
  const ORDERS_KEY = "tecnoshop_pedidos";

  // Copia del catálogo original (para poder restablecerlo desde Admin)
  const SEED = JSON.parse(JSON.stringify(PRODUCTS));

  /* ---------- Persistencia de productos ---------- */
  function loadProducts() {
    try {
      const stored = JSON.parse(localStorage.getItem(PRODUCTS_KEY));
      if (Array.isArray(stored) && stored.length) {
        PRODUCTS.length = 0;
        stored.forEach((p) => PRODUCTS.push(p));
      }
    } catch (_) {}
  }
  function saveProducts() {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(PRODUCTS));
  }
  function resetProducts() {
    PRODUCTS.length = 0;
    JSON.parse(JSON.stringify(SEED)).forEach((p) => PRODUCTS.push(p));
    saveProducts();
  }
  loadProducts();

  /* ---------- Helpers de formato ---------- */
  const money = (n) => "$" + Number(n).toLocaleString("es-CL");
  function findProduct(id) { return PRODUCTS.find((p) => p.id === Number(id)); }
  function stars(n) { return "★".repeat(n) + "☆".repeat(5 - n); }
  function discountPct(p) {
    if (!p.oldPrice || p.oldPrice <= p.price) return 0;
    return Math.round((1 - p.price / p.oldPrice) * 100);
  }
  function installmentText(p) {
    if (!p.installments || p.installments <= 1) return "";
    const cuota = Math.round(p.price / p.installments);
    return `${p.installments}x ${money(cuota)} sin interés`;
  }

  // Detecta la marca de un producto (campo brand, specs.Marca o por el nombre)
  function brandOf(p) {
    if (p.brand) return p.brand;
    if (p.specs && p.specs["Marca"]) return p.specs["Marca"];
    const n = (p.name || "").toLowerCase();
    const map = [
      ["iphone", "Apple"], ["macbook", "Apple"], ["apple", "Apple"],
      ["galaxy", "Samsung"], ["samsung", "Samsung"],
      ["redmi", "Xiaomi"], ["xiaomi", "Xiaomi"],
      ["motorola", "Motorola"], ["moto ", "Motorola"],
      ["pixel", "Google"], ["google", "Google"],
      ["realme", "Realme"], ["honor", "Honor"],
      ["jbl", "JBL"], ["bose", "Bose"],
      ["playstation", "Sony"], ["sony", "Sony"],
      ["xbox", "Xbox"], ["nintendo", "Nintendo"], ["switch", "Nintendo"],
      ["steam deck", "Valve"],
      ["lenovo", "Lenovo"], ["asus", "ASUS"], ["dell", "Dell"], ["hp ", "HP"],
      ["hyperx", "HyperX"], ["razer", "Razer"], ["redragon", "Redragon"],
      ["logitech", "Logitech"], ["cougar", "Cougar"],
      ["lg ", "LG"], ["aoc", "AOC"], ["benq", "BenQ"], ["tp-link", "TP-Link"]
    ];
    for (const [k, b] of map) if (n.includes(k)) return b;
    return "Otros";
  }

  /* ---------- Carrito ---------- */
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }
  function addToCart(id, qty = 1) {
    id = Number(id);
    qty = Math.max(1, parseInt(qty, 10) || 1);
    const p = findProduct(id);
    if (!p) return;
    if (p.stock <= 0) { showToast("😕 Producto agotado"); return; }
    const cart = getCart();
    const item = cart.find((i) => i.id === id);
    const actual = item ? item.qty : 0;
    let nuevo = actual + qty;
    if (nuevo > p.stock) {
      nuevo = p.stock;
      if (item) item.qty = nuevo; else cart.push({ id, qty: nuevo });
      saveCart(cart);
      showToast(`Solo quedan ${p.stock} unidades disponibles`);
      return;
    }
    if (item) item.qty = nuevo; else cart.push({ id, qty: nuevo });
    saveCart(cart);
    showToast(`✓ ${p.name} agregado al carrito`);
  }
  function setQty(id, qty) {
    id = Number(id);
    const p = findProduct(id);
    let cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    let q = parseInt(qty, 10) || 0;
    if (p && q > p.stock) { q = p.stock; showToast(`Stock máximo: ${p.stock} unidades`); }
    item.qty = q;
    if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
    saveCart(cart);
  }
  function changeQty(id, delta) {
    const item = getCart().find((i) => i.id === Number(id));
    setQty(id, (item ? item.qty : 0) + delta);
  }
  function removeFromCart(id) { saveCart(getCart().filter((i) => i.id !== Number(id))); }
  function clearCart() { saveCart([]); }
  function cartTotals() {
    let count = 0, total = 0;
    getCart().forEach((i) => {
      const p = findProduct(i.id);
      if (!p) return;
      count += i.qty; total += p.price * i.qty;
    });
    return { count, total };
  }
  function updateCartCount() {
    const { count } = cartTotals();
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? "grid" : "none";
    });
  }
  // Descontar stock al concretar una compra
  function decrementStock(cart) {
    cart.forEach((i) => {
      const p = findProduct(i.id);
      if (p) p.stock = Math.max(0, p.stock - i.qty);
    });
    saveProducts();
  }

  /* ---------- Autenticación de usuarios ---------- */
  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch { return []; }
  }
  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
  function ensureAdmin() {
    const users = getUsers();
    if (!users.some((u) => u.role === "admin")) {
      users.push({ nombre: "Administrador", apellido: "", email: "admin@tecnoshop.cl", password: "admin123", role: "admin" });
      saveUsers(users);
    }
  }
  const Auth = {
    register({ nombre, apellido, email, password }) {
      email = email.trim().toLowerCase();
      const users = getUsers();
      if (users.some((u) => u.email === email)) {
        return { ok: false, error: "Ya existe una cuenta con ese correo." };
      }
      users.push({ nombre, apellido, email, password, role: "cliente" });
      saveUsers(users);
      return { ok: true };
    },
    login(email, password) {
      email = email.trim().toLowerCase();
      const user = getUsers().find((u) => u.email === email && u.password === password);
      if (!user) return { ok: false, error: "Correo o contraseña incorrectos." };
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, nombre: user.nombre, role: user.role }));
      return { ok: true, user };
    },
    // Inicio de sesión con un perfil externo (Google)
    loginWithProfile({ nombre, apellido, email }) {
      email = (email || "").trim().toLowerCase();
      const users = getUsers();
      let user = users.find((u) => u.email === email);
      if (!user) {
        user = { nombre: nombre || "Usuario", apellido: apellido || "", email, password: "", role: "cliente", provider: "google" };
        users.push(user);
        saveUsers(users);
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, nombre: user.nombre, role: user.role }));
      return user;
    },
    logout() { localStorage.removeItem(SESSION_KEY); },
    current() {
      try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
      catch { return null; }
    },
    isAdmin() { const u = this.current(); return !!u && u.role === "admin"; }
  };
  ensureAdmin();

  /* ---------- Pedidos ---------- */
  const Orders = {
    all() { try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; } catch { return []; } },
    add(order) { const list = this.all(); list.unshift(order); localStorage.setItem(ORDERS_KEY, JSON.stringify(list)); },
    forCurrent() {
      const u = Auth.current();
      const list = this.all();
      if (!u) return [];
      if (u.role === "admin") return list;
      return list.filter((o) => o.email === u.email);
    }
  };

  /* ---------- Toast ---------- */
  let toastTimer;
  function showToast(msg) {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast"; el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
  }

  function goSearch(q) {
    const term = (q || "").trim();
    window.location.href = "productos.html" + (term ? "?q=" + encodeURIComponent(term) : "");
  }

  /* ---------- Pantalla de bienvenida (tras iniciar sesión) ---------- */
  function showWelcome(name) {
    const ov = document.createElement("div");
    ov.className = "welcome-overlay";
    ov.innerHTML = `
      <div class="welcome-box">
        <div class="welcome-logo">
          <span class="brand__icon">⬢</span>
          <span class="brand__text">TECNO<span>SHOP</span></span>
        </div>
        <h2>¡Bienvenido(a), ${name}! 🎉</h2>
        <p>Nos alegra tenerte aquí. Disfruta la mejor tecnología y gaming al mejor precio.</p>
        <button class="btn btn--primary" id="welcomeClose">Comenzar a comprar</button>
      </div>`;
    document.body.appendChild(ov);
    requestAnimationFrame(() => ov.classList.add("show"));
    const close = () => { ov.classList.remove("show"); setTimeout(() => ov.remove(), 350); };
    ov.querySelector("#welcomeClose").addEventListener("click", close);
    ov.addEventListener("click", (e) => { if (e.target === ov) close(); });
    setTimeout(close, 6000);
  }

  /* ---------- Header y footer ---------- */
  function renderChrome() {
    const page = document.body.dataset.page || "";
    const user = Auth.current();

    const catLinks = Object.entries(CATEGORIES)
      .map(([key, c]) => `<a href="productos.html?cat=${key}">${c.label}</a>`)
      .join("");

    const accountHtml = user
      ? `<a href="pedidos.html">Hola, ${user.nombre}</a>
         <a href="pedidos.html">Mis pedidos</a>
         ${user.role === "admin" ? '<a href="admin.html">Admin</a>' : ""}
         <a href="#" id="logoutLink">Salir</a>`
      : `<a href="registro.html">Crear cuenta</a><a href="login.html">Ingresar</a>`;

    const header = document.querySelector("[data-include='header']");
    if (header) {
      header.outerHTML = `
        <header class="ml-header">
          <div class="ml-header__top">
            <div class="container ml-header__row">
              <a href="index.html" class="brand">
                <span class="brand__icon">⬢</span>
                <span class="brand__text">TECNO<span>SHOP</span></span>
              </a>
              <form class="ml-search" id="searchForm" role="search">
                <input type="search" id="searchInput" class="ml-search__input"
                       placeholder="Buscar productos, marcas y más..." aria-label="Buscar" />
                <button type="submit" class="ml-search__btn" aria-label="Buscar">🔍</button>
              </form>
              <div class="ml-header__actions">
                <div class="ml-shipping">
                  <span class="ml-shipping__ico">📍</span>
                  <div><small>Enviar a</small><strong>Santiago, Chile</strong></div>
                </div>
                <nav class="ml-account">${accountHtml}</nav>
                <a href="carrito.html" class="ml-cart" aria-label="Carrito">
                  🛒 <span class="ml-cart__count" data-cart-count>0</span>
                </a>
                <button class="menu-toggle" id="menuToggle" aria-label="Menú">☰</button>
              </div>
            </div>
          </div>
          <div class="ml-header__nav">
            <div class="container ml-catnav" id="catNav">
              <a href="productos.html" ${page === "productos" ? 'class="active"' : ""}>📂 Categorías</a>
              ${catLinks}
              <a href="productos.html?cat=all">Ofertas</a>
              <a href="integraciones.html" ${page === "integraciones" ? 'class="active"' : ""}>Integraciones</a>
              <span class="ml-catnav__spacer"></span>
              <a href="index.html" ${page === "home" ? 'class="active"' : ""}>Inicio</a>
            </div>
          </div>
        </header>`;

      const form = document.getElementById("searchForm");
      if (form) form.addEventListener("submit", (e) => {
        e.preventDefault();
        goSearch(document.getElementById("searchInput").value);
      });
      const toggle = document.getElementById("menuToggle");
      if (toggle) toggle.addEventListener("click", () =>
        document.getElementById("catNav").classList.toggle("open"));
      const logout = document.getElementById("logoutLink");
      if (logout) logout.addEventListener("click", (e) => {
        e.preventDefault();
        Auth.logout();
        showToast("Sesión cerrada");
        setTimeout(() => (window.location.href = "index.html"), 700);
      });
    }

    const footer = document.querySelector("[data-include='footer']");
    if (footer) {
      const year = new Date().getFullYear();
      footer.outerHTML = `
        <footer class="ml-footer">
          <div class="container ml-footer__top">
            <div>
              <h5>Acerca de TecnoShop</h5>
              <a href="#">Quiénes somos</a>
              <a href="#">Trabaja con nosotros</a>
              <a href="#">Términos y condiciones</a>
            </div>
            <div>
              <h5>Mi cuenta</h5>
              <a href="login.html">Iniciar sesión</a>
              <a href="registro.html">Crear cuenta</a>
              <a href="pedidos.html">Mis pedidos</a>
            </div>
            <div>
              <h5>Otros sitios</h5>
              <a href="admin.html">Administración</a>
              <a href="integraciones.html">Integraciones / APIs</a>
            </div>
            <div>
              <h5>Redes sociales</h5>
              <a href="#">Twitch</a><a href="#">YouTube</a><a href="#">Instagram</a>
            </div>
            <div>
              <h5>Medios de pago</h5>
              <div class="ml-paychips">
                <span>💳 Visa</span><span>💳 Mastercard</span>
                <span>🏦 Transferencia</span><span>💙 Mercado Pago</span>
              </div>
            </div>
          </div>
          <p class="ml-footer__copy">© ${year} TecnoShop - Proyecto demostrativo. Tienda de tecnología y artículos gamer · Santiago, Chile.</p>
        </footer>`;
    }
  }

  /* ---------- API pública ---------- */
  window.Store = {
    money, stars, findProduct, discountPct, installmentText, brandOf,
    getCart, addToCart, setQty, changeQty, removeFromCart, clearCart,
    cartTotals, updateCartCount, showToast,
    saveProducts, resetProducts, decrementStock,
    Auth, Orders
  };

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    renderChrome();
    updateCartCount();
    // Mostrar bienvenida si se acaba de iniciar sesión
    const welcome = localStorage.getItem("tecnoshop_welcome");
    if (welcome) {
      localStorage.removeItem("tecnoshop_welcome");
      showWelcome(welcome);
    }
  });
})();
