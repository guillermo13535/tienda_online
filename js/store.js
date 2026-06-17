/* =========================================================
   TecnoGamer - Lógica compartida
   - Carrito (localStorage)
   - Navbar y footer reutilizables
   - Helpers de formato y notificaciones
   Se carga DESPUÉS de products.js en todas las páginas.
   ========================================================= */

(function () {
  "use strict";

  const CART_KEY = "tecnogamer_carrito";

  /* ---------- Helpers ---------- */
  const money = (n) => "$" + Number(n).toLocaleString("es-CL");

  function findProduct(id) {
    return PRODUCTS.find((p) => p.id === Number(id));
  }

  function stars(n) {
    return "★".repeat(n) + "☆".repeat(5 - n);
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
    const cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (item) {
      item.qty += qty;
    } else {
      cart.push({ id, qty });
    }
    saveCart(cart);
    const p = findProduct(id);
    showToast(`✓ ${p ? p.name : "Producto"} agregado al carrito`);
  }

  function setQty(id, qty) {
    id = Number(id);
    let cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    item.qty = parseInt(qty, 10) || 0;
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

  /* ---------- Navbar y footer reutilizables ---------- */
  function renderChrome() {
    const page = document.body.dataset.page || "";

    const header = document.querySelector("[data-include='header']");
    if (header) {
      header.outerHTML = `
        <header class="header">
          <div class="container navbar">
            <a href="index.html" class="brand">
              <span class="brand__icon">⬢</span>
              <span class="brand__text">TECNO<span>GAMER</span></span>
            </a>
            <nav class="nav-links" id="navLinks">
              <a href="index.html" ${page === "home" ? 'class="active"' : ""}>Inicio</a>
              <a href="productos.html" ${page === "productos" ? 'class="active"' : ""}>Productos</a>
              <a href="registro.html" ${page === "registro" ? 'class="active"' : ""}>Registrarse</a>
              <a href="login.html" ${page === "login" ? 'class="active"' : ""}>Iniciar Sesión</a>
              <a href="admin.html" ${page === "admin" ? 'class="active"' : ""}>Admin</a>
            </nav>
            <div class="nav-actions">
              <a href="carrito.html" class="cart-link" aria-label="Carrito">
                🛒 <span class="cart-link__count" data-cart-count>0</span>
              </a>
              <button class="menu-toggle" id="menuToggle" aria-label="Menú">☰</button>
            </div>
          </div>
        </header>`;
      const toggle = document.getElementById("menuToggle");
      toggle.addEventListener("click", () =>
        document.getElementById("navLinks").classList.toggle("open")
      );
    }

    const footer = document.querySelector("[data-include='footer']");
    if (footer) {
      const year = new Date().getFullYear();
      footer.outerHTML = `
        <footer class="footer">
          <div class="container footer__inner">
            <div>
              <h5 class="brand__text">TECNO<span>GAMER</span></h5>
              <p>Tu tienda de tecnología y artículos gamer. Calidad, garantía y los mejores precios.</p>
            </div>
            <div>
              <h5>Enlaces</h5>
              <a href="index.html">Inicio</a>
              <a href="productos.html">Productos</a>
              <a href="carrito.html">Carrito</a>
            </div>
            <div>
              <h5>Cuenta</h5>
              <a href="login.html">Iniciar sesión</a>
              <a href="registro.html">Registrarse</a>
              <a href="admin.html">Administración</a>
            </div>
            <div>
              <h5>Contacto</h5>
              <p>📧 ventas@tecnogamer.cl</p>
              <p>📱 +56 9 1234 5678</p>
              <p>📍 Santiago, Chile</p>
            </div>
          </div>
          <p class="footer__copy">© ${year} TecnoGamer. Proyecto demostrativo. Todos los derechos reservados.</p>
        </footer>`;
    }
  }

  /* ---------- API pública ---------- */
  window.Store = {
    money, stars, findProduct,
    getCart, addToCart, setQty, changeQty, removeFromCart, clearCart,
    cartTotals, updateCartCount, showToast
  };

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    renderChrome();
    updateCartCount();
  });
})();
