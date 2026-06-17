/* =========================================================
   TecnoGamer - Renderizado por página
   Detecta data-page del <body> y renderiza lo que corresponda.
   ========================================================= */

(function () {
  "use strict";

  const { money, stars, findProduct, getCart, cartTotals } = window.Store;

  function productCard(p) {
    return `
      <article class="card">
        <a href="producto.html?id=${p.id}" class="card__media">
          ${p.badge ? `<span class="card__badge">${p.badge}</span>` : ""}
          <img src="${p.image}" alt="${p.name}" loading="lazy">
        </a>
        <div class="card__body">
          <span class="card__cat">${p.category}</span>
          <a href="producto.html?id=${p.id}"><h3 class="card__name">${p.name}</h3></a>
          <div class="card__rating">${stars(p.rating)}</div>
          <div class="card__price">${money(p.price)}</div>
          <div class="card__actions">
            <input type="number" class="qty-input" value="1" min="1" max="20" aria-label="Cantidad" id="qty-${p.id}">
            <button class="btn btn--primary card__add" data-add="${p.id}">Agregar</button>
          </div>
        </div>
      </article>`;
  }

  /* ---------- Página: catálogo / destacados ---------- */
  function initCatalog(opts) {
    const grid = document.getElementById("products");
    if (!grid) return;
    const emptyMsg = document.getElementById("emptyMsg");
    const limit = opts && opts.limit;

    let state = { filter: "all", search: "", sort: "default" };

    function visible() {
      let list = PRODUCTS.filter((p) => {
        const mf = state.filter === "all" || p.category === state.filter;
        const ms = p.name.toLowerCase().includes(state.search.toLowerCase());
        return mf && ms;
      });
      if (state.sort === "price-asc") list.sort((a, b) => a.price - b.price);
      if (state.sort === "price-desc") list.sort((a, b) => b.price - a.price);
      if (state.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
      if (limit) list = list.slice(0, limit);
      return list;
    }

    function render() {
      const list = visible();
      if (emptyMsg) emptyMsg.hidden = list.length !== 0;
      grid.innerHTML = list.map(productCard).join("");
    }

    // Filtros
    const filters = document.getElementById("filters");
    if (filters) {
      filters.addEventListener("click", (e) => {
        const btn = e.target.closest(".chip");
        if (!btn) return;
        state.filter = btn.dataset.filter;
        filters.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        render();
      });
    }
    // Buscador
    const search = document.getElementById("searchInput");
    if (search) search.addEventListener("input", (e) => { state.search = e.target.value; render(); });
    // Orden
    const sort = document.getElementById("sortSelect");
    if (sort) sort.addEventListener("change", (e) => { state.sort = e.target.value; render(); });

    render();
  }

  /* ---------- Página: detalle de producto ---------- */
  function initDetail() {
    const root = document.getElementById("detail");
    if (!root) return;
    const id = Number(new URLSearchParams(location.search).get("id"));
    const p = findProduct(id);

    if (!p) {
      root.innerHTML = `<div class="empty-msg">Producto no encontrado.
        <br><a class="btn btn--outline" href="productos.html" style="margin-top:16px">Volver a productos</a></div>`;
      return;
    }

    document.title = `${p.name} | TecnoGamer`;
    const specsHtml = Object.entries(p.specs)
      .map(([k, v]) => `<li><span>${k}</span><strong>${v}</strong></li>`)
      .join("");

    root.innerHTML = `
      <div class="detail__gallery">
        <img src="${p.image}" alt="${p.name}" id="mainImg">
      </div>
      <div class="detail__info">
        <span class="detail__cat">${p.category}</span>
        <h1 class="detail__title">${p.name}</h1>
        <div class="card__rating">${stars(p.rating)}</div>
        <div class="detail__price">${money(p.price)}</div>
        <p class="detail__desc">${p.description}</p>
        <div class="detail__buy">
          <input type="number" class="qty-input" value="1" min="1" max="20" id="detailQty" aria-label="Cantidad">
          <button class="btn btn--primary" data-add="${p.id}" data-qty-from="detailQty">🛒 Agregar al carrito</button>
          <a class="btn btn--outline" href="productos.html">Seguir comprando</a>
        </div>
        <div class="specs">
          <h3>Especificaciones</h3>
          <ul>${specsHtml}</ul>
        </div>
      </div>`;
  }

  /* ---------- Página: carrito ---------- */
  function initCart() {
    const wrap = document.getElementById("cartContent");
    if (!wrap) return;

    function render() {
      const cart = getCart();
      const { total } = cartTotals();

      if (cart.length === 0) {
        wrap.innerHTML = `
          <div class="cart-empty">
            <p style="font-size:3rem">🛒</p>
            <p>Tu carrito está vacío.</p>
            <a class="btn btn--primary" href="productos.html" style="margin-top:16px">Ir a productos</a>
          </div>`;
        return;
      }

      const rows = cart.map((i) => {
        const p = findProduct(i.id);
        if (!p) return "";
        const sub = p.price * i.qty;
        return `
          <tr>
            <td data-label="Producto">
              <div class="prod-cell">
                <img src="${p.image}" alt="${p.name}">
                <a href="producto.html?id=${p.id}">${p.name}</a>
              </div>
            </td>
            <td data-label="Precio">${money(p.price)}</td>
            <td data-label="Cantidad">
              <span class="cart-qty">
                <button data-minus="${p.id}" aria-label="Restar">−</button>
                <span>${i.qty}</span>
                <button data-plus="${p.id}" aria-label="Sumar">+</button>
              </span>
            </td>
            <td data-label="Subtotal">${money(sub)}</td>
            <td data-label=""><button class="link-remove" data-remove="${p.id}">Eliminar</button></td>
          </tr>`;
      }).join("");

      wrap.innerHTML = `
        <table class="cart-table">
          <thead>
            <tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="cart-summary">
          <button class="btn btn--danger" id="clearCart">Vaciar carrito</button>
          <p class="total">Total: <span>${money(total)}</span></p>
        </div>

        <div class="panel">
          <h3>Finalizar compra</h3>
          <div class="field">
            <label for="payMethod">Método de pago</label>
            <select id="payMethod" class="select" style="width:100%">
              <option value="tarjeta">Tarjeta de Crédito / Débito</option>
              <option value="paypal">PayPal</option>
              <option value="transferencia">Transferencia Bancaria</option>
            </select>
          </div>
          <button class="btn btn--primary btn--block" id="checkoutBtn">Pagar ${money(total)}</button>
        </div>`;

      document.getElementById("clearCart").addEventListener("click", () => {
        window.Store.clearCart();
        render();
      });
      document.getElementById("checkoutBtn").addEventListener("click", () => {
        const metodo = document.getElementById("payMethod").value;
        window.Store.showToast(`¡Compra realizada con ${metodo}! 🎉 Total: ${money(total)}`);
        window.Store.clearCart();
        render();
      });
    }

    // Delegación para +, -, eliminar dentro del carrito
    wrap.addEventListener("click", (e) => {
      const t = e.target;
      if (t.dataset.plus) { window.Store.changeQty(t.dataset.plus, 1); render(); }
      if (t.dataset.minus) { window.Store.changeQty(t.dataset.minus, -1); render(); }
      if (t.dataset.remove) { window.Store.removeFromCart(t.dataset.remove); render(); }
    });

    render();
  }

  /* ---------- Delegación global: botones "Agregar" ---------- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const id = btn.dataset.add;
    let qty = 1;
    if (btn.dataset.qtyFrom) {
      const input = document.getElementById(btn.dataset.qtyFrom);
      if (input) qty = input.value;
    } else {
      const input = document.getElementById("qty-" + id);
      if (input) qty = input.value;
    }
    window.Store.addToCart(id, qty);
  });

  /* ---------- Bootstrap por página ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;
    if (page === "home") initCatalog({ limit: 4 });
    if (page === "productos") initCatalog();
    if (page === "producto") initDetail();
    if (page === "carrito") initCart();
  });
})();
