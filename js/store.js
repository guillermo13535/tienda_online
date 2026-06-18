/* =========================================================
   TecnoShop - Lógica compartida (estructura estilo Mercado Libre)
   - Carrito (localStorage)
   - Header con buscador + barra de categorías
   - Footer multi-columna
   - Helpers de formato, descuentos y cuotas
   Se carga DESPUÉS de products.js en todas las páginas.
   ========================================================= */

(function () {
  "use strict";

  const CART_KEY = "tecnoshop_carrito";

  /* ---------- Helpers de formato ---------- */
  const money = (n) => "$" + Number(n).toLocaleString("es-CL");

  function findProduct(id) {
    return PRODUCTS.find((p) => p.id === Number(id));
  }

  function stars(n) {
    return "★".repeat(n) + "☆".repeat(5 - n);
  }

  // Porcentaje de descuento a partir del precio anterior
  function discountPct(p) {
    if (!p.oldPrice || p.oldPrice <= p.price) return 0;
    return Math.round((1 - p.price / p.oldPrice) * 100);
  }

  // Texto de cuotas estilo ML: "12x $83.332 sin interés"
  function installmentText(p) {
    if (!p.installments || p.installments <= 1) return "";
    const cuota = Math.round(p.price / p.installments);
    return `${p.installments}x ${money(cuota)} sin interés`;
  }

  /* ---------- Estado del carrito ---------- */
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
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
      if (item) item.qty = nuevo;
      else cart.push({ id, qty: nuevo });
      saveCart(cart);
      showToast(`Solo quedan ${p.stock} unidades disponibles`);
      return;
    }

    if (item) item.qty = nuevo;
    else cart.push({ id, qty: nuevo });
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
    if (p && q > p.stock) {
      q = p.stock;
      showToast(`Stock máximo: ${p.stock} unidades`);
    }
    item.qty = q;
    if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
    saveCart(cart);
  }

  function changeQty(id, delta) {
    const item = getCart().find((i) => i.id === Number(id));
    setQty(id, (item ? item.qty : 0) + delta);
  }

  function removeFromCart(id) {
    saveCart(getCart().filter((i) => i.id !== Number(id)));
  }

  function clearCart() {
    saveCart([]);
  }

  function cartTotals() {
    let count = 0, total = 0;
    getCart().forEach((i) => {
      const p = findProduct(i.id);
      if (!p) return;
      count += i.qty;
      total += p.price * i.qty;
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

  /* ---------- Toast ---------- */
  let toastTimer;
  function showToast(msg) {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
  }

  /* ---------- Buscador: redirige a productos.html?q= ---------- */
  function goSearch(q) {
    const term = (q || "").trim();
    window.location.href = "productos.html" + (term ? "?q=" + encodeURIComponent(term) : "");
  }

  /* ---------- Header y footer estilo Mercado Libre ---------- */
  function renderChrome() {
    const page = document.body.dataset.page || "";
    const sesion = localStorage.getItem("tecnoshop_sesion");

    const catLinks = Object.entries(CATEGORIES)
      .map(([key, c]) =>
        `<a href="productos.html?cat=${key}">${c.label}</a>`)
      .join("");

    const header = document.querySelector("[data-include='header']");
    if (header) {
      header.outerHTML = `
        <header class="ml-header">
          <!-- Fila superior: logo + buscador + cuenta + carrito -->
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
                  <div>
                    <small>Enviar a</small>
                    <strong>Santiago, Chile</strong>
                  </div>
                </div>
                <nav class="ml-account">
                  ${sesion
                    ? `<a href="#" id="logoutLink">Hola, ${sesion.split("@")[0]}</a>`
                    : `<a href="registro.html">Crear cuenta</a><a href="login.html">Ingresar</a>`}
                  <a href="admin.html">Mi cuenta</a>
                </nav>
                <a href="carrito.html" class="ml-cart" aria-label="Carrito">
                  🛒 <span class="ml-cart__count" data-cart-count>0</span>
                </a>
                <button class="menu-toggle" id="menuToggle" aria-label="Menú">☰</button>
              </div>
            </div>
          </div>

          <!-- Fila inferior: categorías -->
          <div class="ml-header__nav">
            <div class="container ml-catnav" id="catNav">
              <a href="productos.html" ${page === "productos" ? 'class="active"' : ""}>📂 Categorías</a>
              ${catLinks}
              <a href="productos.html?cat=all">Ofertas</a>
              <span class="ml-catnav__spacer"></span>
              <a href="index.html" ${page === "home" ? 'class="active"' : ""}>Inicio</a>
            </div>
          </div>
        </header>`;

      // Eventos del header
      const form = document.getElementById("searchForm");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          goSearch(document.getElementById("searchInput").value);
        });
      }
      const toggle = document.getElementById("menuToggle");
      if (toggle) toggle.addEventListener("click", () =>
        document.getElementById("catNav").classList.toggle("open"));

      const logout = document.getElementById("logoutLink");
      if (logout) logout.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("tecnoshop_sesion");
        showToast("Sesión cerrada");
        setTimeout(() => location.reload(), 800);
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
              <a href="#">Promociones</a>
            </div>
            <div>
              <h5>Otros sitios</h5>
              <a href="admin.html">Vender</a>
              <a href="#">Desarrolladores</a>
              <a href="#">Tendencias</a>
            </div>
            <div>
              <h5>Ayuda</h5>
              <a href="#">Comprar</a>
              <a href="#">Medios de pago</a>
              <a href="#">Cómo cuidamos tu privacidad</a>
            </div>
            <div>
              <h5>Redes sociales</h5>
              <a href="#">Twitch</a>
              <a href="#">YouTube</a>
              <a href="#">Instagram</a>
              <a href="#">X / Twitter</a>
            </div>
            <div>
              <h5>Medios de pago</h5>
              <div class="ml-paychips">
                <span>💳 Visa</span><span>💳 Mastercard</span>
                <span>🏦 Transferencia</span><span>💰 PayPal</span>
              </div>
            </div>
          </div>
          <p class="ml-footer__copy">© ${year} TecnoShop - Proyecto demostrativo. Tienda de tecnología y artículos gamer · Santiago, Chile.</p>
        </footer>`;
    }
  }

  /* ---------- API pública ---------- */
  window.Store = {
    money, stars, findProduct, discountPct, installmentText,
    getCart, addToCart, setQty, changeQty, removeFromCart, clearCart,
    cartTotals, updateCartCount, showToast
  };

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    renderChrome();
    updateCartCount();
  });
})();
