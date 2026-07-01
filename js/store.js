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

  /* ---------- Capa de API REST (con respaldo a localStorage) ---------- */
  const TOKEN_KEY = "tecnoshop_token";
  function getToken() { return localStorage.getItem(TOKEN_KEY) || ""; }
  let apiOnline = false;

  async function api(path, { method = "GET", body } = {}) {
    const headers = { "Content-Type": "application/json" };
    const tk = getToken();
    if (tk) headers.Authorization = "Bearer " + tk;
    const res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const e = new Error((data && data.error) || ("HTTP " + res.status));
      e.status = res.status; e.data = data;
      throw e;
    }
    return data;
  }

  // Trae el catálogo desde la API; si el backend no está, usa el local
  async function syncProducts() {
    try {
      const list = await api("/api/products");
      if (Array.isArray(list) && list.length) {
        PRODUCTS.length = 0;
        list.forEach((p) => PRODUCTS.push(p));
        saveProducts();
        apiOnline = true;
        document.dispatchEvent(new CustomEvent("tecnoshop:products"));
      }
    } catch (_) {
      apiOnline = false; // backend no disponible -> seguimos con datos locales
    }
    return apiOnline;
  }
  function isApiOnline() { return apiOnline; }

  /* ---------- Helpers de formato ---------- */
  const money = (n) => "$" + Number(n).toLocaleString("es-CL");
  function findProduct(id) { return PRODUCTS.find((p) => p.id === Number(id)); }
  function stars(n) { return "★".repeat(n) + "☆".repeat(5 - n); }
  // Compara teléfonos ignorando espacios/código de país (uno termina en el otro)
  function phoneEq(a, b) {
    a = String(a || "").replace(/\D/g, "");
    b = String(b || "").replace(/\D/g, "");
    if (a.length < 8 || b.length < 8) return false;
    return a === b || a.endsWith(b) || b.endsWith(a);
  }
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
    async register({ nombre, apellido, email, password, telefono }) {
      email = (email || "").trim().toLowerCase();
      telefono = (telefono || "").trim();
      let apiOk = false;
      // 1) Intentar vía API (backend)
      try {
        await api("/api/auth/register", { method: "POST", body: { nombre, apellido, email, password, telefono } });
        apiOk = true;
      } catch (e) {
        if (e.status === 409) return { ok: false, error: "Ya existe una cuenta con ese correo o teléfono." };
        // 404 / 500 / sin backend -> seguimos con registro local
      }
      // 2) Guardar copia local (así puede iniciar sesión con o sin backend)
      const users = getUsers();
      const existeLocal = users.some((u) => u.email === email || phoneEq(u.telefono, telefono));
      if (existeLocal && !apiOk) return { ok: false, error: "Ya existe una cuenta con ese correo o teléfono." };
      if (!existeLocal) {
        users.push({ nombre, apellido, email, telefono, password, role: "cliente" });
        saveUsers(users);
      }
      return { ok: true };
    },
    async login(identificador, password) {
      const id = (identificador || "").trim().toLowerCase();
      // 1) Intentar vía API (acepta correo o teléfono)
      try {
        const d = await api("/api/auth/login", { method: "POST", body: { email: id, password } });
        localStorage.setItem(TOKEN_KEY, d.token);
        localStorage.setItem(SESSION_KEY, JSON.stringify(d.user));
        return { ok: true, user: d.user, via: "api" };
      } catch (e) {
        // Cualquier fallo de la API -> probar respaldo local
      }
      // 2) Respaldo local: buscar por correo O por teléfono
      const user = getUsers().find((u) =>
        u.password === password && (u.email === id || phoneEq(u.telefono, id)));
      if (!user) return { ok: false, error: "Correo/teléfono o contraseña incorrectos." };
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, nombre: user.nombre, role: user.role }));
      return { ok: true, user };
    },
    // Inicio de sesión con un perfil externo (Google) - local
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
    logout() { localStorage.removeItem(SESSION_KEY); localStorage.removeItem(TOKEN_KEY); },
    current() {
      try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
      catch { return null; }
    },
    // Devuelve el registro completo del usuario actual (con teléfono, dirección, etc.)
    fullUser() {
      const s = this.current();
      if (!s) return null;
      return getUsers().find((u) => u.email === s.email) || s;
    },
    isAdmin() { const u = this.current(); return !!u && u.role === "admin"; },
    // Actualiza datos del perfil (teléfono, dirección, etc.) en el usuario local
    updateProfile(datos) {
      const sess = this.current();
      if (!sess) return null;
      const users = getUsers();
      const u = users.find((x) => x.email === sess.email);
      if (u) {
        Object.assign(u, datos);
        saveUsers(users);
        if (datos.nombre) {
          sess.nombre = datos.nombre;
          localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
        }
      }
      return u;
    }
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
    },
    // API: crear pedido (el servidor valida stock y total)
    createRemote(items, metodo) {
      return api("/api/orders", { method: "POST", body: { items, metodo } });
    },
    // API: listar pedidos del usuario (o todos si es admin)
    listRemote() { return api("/api/orders"); },
    // Actualizar estado del pedido (admin) con respaldo local
    async updateEstado(id, estado) {
      try {
        return await api("/api/orders/" + id + "/estado", { method: "PUT", body: { estado } });
      } catch (e) {
        if (e.status) throw e; // error real del servidor
      }
      const list = this.all();
      const o = list.find((x) => x.id === id);
      if (o) {
        o.estado = estado;
        (o.historial = o.historial || []).push({ estado, fecha: new Date().toISOString() });
        localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
      }
      return o;
    }
  };

  /* ---------- Estados de pedido y notificaciones ---------- */
  const ESTADOS = ["Pagado", "Despachado", "En camino", "Entregado"];
  const NOTIF_KEY = "tecnoshop_notifs";
  const SEEN_KEY = "tecnoshop_notif_seen";

  function getNotifs() { try { return JSON.parse(localStorage.getItem(NOTIF_KEY)) || []; } catch { return []; } }
  function saveNotifs(l) { localStorage.setItem(NOTIF_KEY, JSON.stringify(l.slice(0, 30))); }
  function estadoMsg(estado, id) {
    return ({
      "Pagado": `🛒 ¡Compra realizada! Tu pedido ${id} fue confirmado.`,
      "Despachado": `📦 El vendedor despachó tu pedido ${id}.`,
      "En camino": `🚚 ¡Tu pedido ${id} está en camino! El repartidor va hacia ti.`,
      "Entregado": `✅ Tu pedido ${id} fue entregado. ¡Gracias por comprar!`
    })[estado] || `Tu pedido ${id} cambió a "${estado}".`;
  }
  function pushNotif(estado, id) {
    const l = getNotifs();
    l.unshift({ id, estado, msg: estadoMsg(estado, id), fecha: Date.now(), leido: false });
    saveNotifs(l);
  }
  function notifyPurchase(id) {
    pushNotif("Pagado", id);
    let seen = {};
    try { seen = JSON.parse(localStorage.getItem(SEEN_KEY)) || {}; } catch (_) {}
    seen[id] = "Pagado";
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    renderBell();
  }
  async function checkOrderUpdates() {
    if (!Auth.current()) return;
    let orders = [];
    try { orders = await api("/api/orders"); } catch { orders = Orders.forCurrent(); }
    let seen = {};
    try { seen = JSON.parse(localStorage.getItem(SEEN_KEY)) || {}; } catch (_) {}
    let cambio = false;
    orders.forEach((o) => {
      const est = o.estado || "Pagado";
      if (seen[o.id] === undefined) seen[o.id] = est;        // primera vez: no notificar pedidos antiguos
      else if (seen[o.id] !== est) { pushNotif(est, o.id); seen[o.id] = est; cambio = true; }
    });
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    renderBell();
    if (cambio) { const n = getNotifs().find((x) => !x.leido); if (n) showToast(n.msg); }
  }
  function markNotifsRead() {
    const l = getNotifs().map((n) => ({ ...n, leido: true }));
    saveNotifs(l); renderBell();
  }
  function renderBell() {
    const count = getNotifs().filter((n) => !n.leido).length;
    document.querySelectorAll("[data-bell]").forEach((el) => {
      el.textContent = count; el.style.display = count > 0 ? "grid" : "none";
    });
    const list = document.getElementById("bellList");
    if (list) {
      const notifs = getNotifs();
      list.innerHTML = notifs.length
        ? notifs.map((n) => `<div class="bell-item ${n.leido ? "" : "unread"}">${n.msg}<small>${new Date(n.fecha).toLocaleString("es-CL")}</small></div>`).join("")
        : `<p class="bell-empty">No tienes notificaciones.</p>`;
    }
  }

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
        <h2>¡Bienvenido(a), ${name}!</h2>
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

  /* ---------- Cierre de sesión por inactividad (el carrito se conserva) ---------- */
  const INACTIVITY_MS = 120000; // 2 minutos sin actividad
  let inactivityTimer, countdownInterval, countdownActive = false;

  function resetInactivity() {
    if (countdownActive || !Auth.current()) return;
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(showInactivityCountdown, INACTIVITY_MS);
  }

  function showInactivityCountdown() {
    if (!Auth.current() || document.getElementById("inactivityOverlay")) return;
    countdownActive = true;
    let s = 15;
    const ov = document.createElement("div");
    ov.id = "inactivityOverlay";
    ov.className = "welcome-overlay show";
    ov.innerHTML = `
      <div class="welcome-box">
        <div class="welcome-logo"><span class="brand__icon" style="font-size:3.5rem">⏳</span></div>
        <h2>¿Sigues ahí?</h2>
        <p>Tu sesión se cerrará por inactividad en <strong id="invCount">${s}</strong> segundos.<br>Tu carrito quedará guardado.</p>
        <button class="btn btn--primary" id="stayBtn">Seguir conectado</button>
      </div>`;
    document.body.appendChild(ov);
    document.getElementById("stayBtn").addEventListener("click", () => {
      clearInterval(countdownInterval);
      ov.remove();
      countdownActive = false;
      resetInactivity();
    });
    countdownInterval = setInterval(() => {
      s--;
      const el = document.getElementById("invCount");
      if (el) el.textContent = s;
      if (s <= 0) {
        clearInterval(countdownInterval);
        Auth.logout(); // solo borra la sesión; el carrito (otra clave) se mantiene
        window.location.replace("login.html");
      }
    }, 1000);
  }

  /* ---------- Header y footer ---------- */
  function renderChrome() {
    const page = document.body.dataset.page || "";
    const user = Auth.current();

    const catLinks = Object.entries(CATEGORIES)
      .map(([key, c]) => `<a href="productos.html?cat=${key}">${c.label}</a>`)
      .join("");

    const accountHtml = user
      ? `<a href="perfil.html">Hola, ${user.nombre}</a>
         <a href="perfil.html">Mi perfil</a>
         <a href="pedidos.html">Mis pedidos</a>
         ${user.role === "admin" ? '<a href="admin.html">Admin</a>' : ""}
         <a href="#" id="logoutLink">Salir</a>`
      : `<a href="registro.html">Crear cuenta</a><a href="login.html">Ingresar</a>`;

    const bellHtml = user
      ? `<div class="bell-wrap">
           <button class="bell-btn" id="bellBtn" aria-label="Notificaciones">🔔<span class="bell-count" data-bell>0</span></button>
           <div class="bell-panel" id="bellPanel"><div class="bell-head">Notificaciones</div><div id="bellList"></div></div>
         </div>`
      : "";

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
                ${bellHtml}
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

      // Campana de notificaciones
      const bellBtn = document.getElementById("bellBtn");
      if (bellBtn) {
        bellBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const panel = document.getElementById("bellPanel");
          const abrir = !panel.classList.contains("open");
          panel.classList.toggle("open", abrir);
          if (abrir) markNotifsRead();
        });
        document.addEventListener("click", () => {
          const panel = document.getElementById("bellPanel");
          if (panel) panel.classList.remove("open");
        });
        renderBell();
      }
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
    api, syncProducts, isApiOnline,
    ESTADOS, notifyPurchase, checkOrderUpdates, renderBell, getNotifs,
    Auth, Orders
  };

  /* ---------- 🤖 TecnoBot: asistente virtual de compras ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  function initAssistant() {
    const page = document.body.dataset.page || "";
    if (["login", "registro"].includes(page)) return;
    if (document.getElementById("botFab")) return;

    const fab = document.createElement("button");
    fab.id = "botFab";
    fab.className = "bot-fab";
    fab.innerHTML = "🤖";
    fab.setAttribute("aria-label", "Asistente virtual");

    const panel = document.createElement("div");
    panel.id = "botPanel";
    panel.className = "bot-panel";
    panel.innerHTML = `
      <div class="bot-head">
        <span>🤖 TecnoBot <small>asistente</small></span>
        <button id="botClose" aria-label="Cerrar">✕</button>
      </div>
      <div class="bot-msgs" id="botMsgs"></div>
      <div class="bot-quick" id="botQuick"></div>
      <form class="bot-input" id="botForm">
        <input id="botText" placeholder="Escribe lo que buscas..." autocomplete="off" />
        <button aria-label="Enviar">➤</button>
      </form>`;

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    const msgs = panel.querySelector("#botMsgs");
    const quick = panel.querySelector("#botQuick");

    function add(html, who) {
      const d = document.createElement("div");
      d.className = "bot-msg " + who;
      d.innerHTML = html;
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
    }
    function chips(arr) {
      quick.innerHTML = arr.map((t) => `<button class="bot-chip">${t}</button>`).join("");
    }
    function open() {
      panel.classList.add("open");
      fab.classList.add("hidden");
      if (!msgs.dataset.init) {
        msgs.dataset.init = "1";
        const u = Auth.current();
        add(`¡Hola${u ? " " + u.nombre : ""}! 👋 Soy <strong>TecnoBot</strong>. Te ayudo a encontrar lo que buscas. ¿Qué necesitas hoy?`, "bot");
        chips(["🔥 Ofertas", "⭐ Más vendidos", "📱 Celulares", "💸 Algo barato"]);
      }
    }
    function close() { panel.classList.remove("open"); fab.classList.remove("hidden"); }

    fab.addEventListener("click", open);
    panel.querySelector("#botClose").addEventListener("click", close);
    panel.querySelector("#botForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const inp = panel.querySelector("#botText");
      const t = inp.value.trim();
      if (!t) return;
      add(escapeHtml(t), "user");
      inp.value = "";
      setTimeout(() => respond(t), 260);
    });
    quick.addEventListener("click", (e) => {
      const b = e.target.closest(".bot-chip");
      if (!b) return;
      add(b.textContent, "user");
      setTimeout(() => respond(b.textContent.replace(/^[^\wáéíóúÁÉÍÓÚ]+/, "").trim()), 220);
    });

    function cardLine(p) {
      return `<a class="bot-prod" href="producto.html?id=${p.id}">
        <img src="${p.image}" onerror="this.onerror=null;this.src='assets/placeholder.svg'" alt="">
        <span><strong>${p.name}</strong><small>${money(p.price)}${discountPct(p) > 0 ? ` · ${discountPct(p)}% OFF` : ""}</small></span></a>`;
    }
    function showList(list, intro) {
      if (!list.length) { add("No encontré productos para eso 😕. Prueba con otra palabra o una categoría.", "bot"); return; }
      add(intro + list.slice(0, 4).map(cardLine).join(""), "bot");
    }

    function respond(text) {
      const t = text.toLowerCase();
      if (/hola|buenas|hey|holi|saludos/.test(t)) {
        add("¡Hola! 😊 Dime una categoría (celulares, audio, gamer...), una marca, 'ofertas' o un precio máximo.", "bot");
        return;
      }
      if (/gracias|grasias/.test(t)) { add("¡De nada! 🙌 ¿Te ayudo con algo más?", "bot"); return; }
      if (/oferta|descuento|rebaj|promo/.test(t)) {
        showList(PRODUCTS.filter((p) => discountPct(p) > 0).sort((a, b) => discountPct(b) - discountPct(a)), "🔥 Estas son las mejores ofertas:");
        return;
      }
      if (/vendido|popular|recomi|mejor/.test(t)) {
        showList([...PRODUCTS].sort((a, b) => b.sold - a.sold), "⭐ Los más vendidos:");
        return;
      }
      if (/carrito/.test(t)) {
        const { count, total } = cartTotals();
        add(count ? `Tienes <strong>${count}</strong> producto(s) por <strong>${money(total)}</strong>. <a href="carrito.html">Ver carrito →</a>` : "Tu carrito está vacío. ¿Te recomiendo algo? 😉", "bot");
        return;
      }
      if (/(barat|económ|economic|menos de|bajo|hasta|presupuesto)/.test(t)) {
        let max = null;
        const num = t.replace(/\./g, "").match(/(\d{4,7})/);
        if (num) max = +num[1];
        let list = [...PRODUCTS].sort((a, b) => a.price - b.price);
        if (max) list = list.filter((p) => p.price <= max);
        showList(list, max ? `💸 Productos hasta ${money(max)}:` : "💸 Los más económicos:");
        return;
      }
      const brands = [...new Set(PRODUCTS.map((p) => brandOf(p)))];
      const bMatch = brands.find((b) => b !== "Otros" && t.includes(b.toLowerCase()));
      if (bMatch) { showList(PRODUCTS.filter((p) => brandOf(p) === bMatch), `Productos <strong>${bMatch}</strong>:`); return; }
      const catMap = [["celular", "smartphones"], ["tel", "smartphones"], ["smartphone", "smartphones"], ["note", "laptops"], ["laptop", "laptops"], ["computador", "laptops"], ["audíf", "audio"], ["audif", "audio"], ["audio", "audio"], ["parlante", "audio"], ["consola", "consolas"], ["play", "consolas"], ["xbox", "consolas"], ["nintendo", "consolas"], ["monitor", "monitores"], ["gamer", "gamer"], ["teclado", "gamer"], ["mouse", "gamer"], ["accesorio", "accesorios"], ["cargador", "accesorios"]];
      const c = catMap.find(([k]) => t.includes(k));
      if (c) { showList(PRODUCTS.filter((p) => p.category === c[1]), `Mira estos de <strong>${CATEGORIES[c[1]].label}</strong>:`); return; }
      const found = PRODUCTS.filter((p) => t.split(/\s+/).some((w) => w.length > 2 && p.name.toLowerCase().includes(w)));
      if (found.length) { showList(found, "Encontré esto para ti:"); return; }
      add("Mmm, no estoy seguro 🤔. Puedes pedirme: <em>ofertas</em>, <em>celulares</em>, <em>audífonos</em>, una <em>marca</em> o <em>algo barato</em>.", "bot");
      chips(["🔥 Ofertas", "📱 Celulares", "🎧 Audio", "🎮 Gamer"]);
    }
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    renderChrome();
    updateCartCount();
    initAssistant();

    // Conectar con el backend: traer el catálogo desde la API (si está disponible)
    syncProducts();

    // Mostrar bienvenida con el logo si se acaba de iniciar sesión
    const welcome = localStorage.getItem("tecnoshop_welcome");
    if (welcome) {
      localStorage.removeItem("tecnoshop_welcome");
      showWelcome(welcome);
    }

    // Sesión activa: notificaciones de pedidos + control de inactividad
    if (Auth.current()) {
      checkOrderUpdates();
      ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach((ev) =>
        document.addEventListener(ev, resetInactivity, { passive: true }));
      resetInactivity();
    }
  });
})();
