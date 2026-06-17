/* =========================================================
   TecnoGamer - Renderizado por página (estructura Mercado Libre)
   ========================================================= */

(function () {
  "use strict";

  const S = window.Store;
  const { money, stars, findProduct, getCart, cartTotals, discountPct, installmentText } = S;

  /* ---------- Tarjeta de producto estilo ML ---------- */
  function productCard(p) {
    const off = discountPct(p);
    const inst = installmentText(p);
    return `
      <article class="ml-card">
        <a href="producto.html?id=${p.id}" class="ml-card__media">
          ${p.full ? `<span class="ml-tag-full">FULL</span>` : ""}
          <img src="${p.image}" alt="${p.name}" loading="lazy">
        </a>
        <div class="ml-card__body">
          ${p.oldPrice && off > 0 ? `<span class="ml-card__old">${money(p.oldPrice)}</span>` : ""}
          <div class="ml-card__priceline">
            <span class="ml-card__price">${money(p.price)}</span>
            ${off > 0 ? `<span class="ml-card__off">${off}% OFF</span>` : ""}
          </div>
          ${inst ? `<div class="ml-card__inst">en ${inst}</div>` : ""}
          <a href="producto.html?id=${p.id}" class="ml-card__title">${p.name}</a>
          <div class="ml-card__meta">
            <span class="ml-card__rating">${stars(p.rating)}</span>
            <span class="ml-card__sold">${p.sold} vendidos</span>
          </div>
          ${p.freeShipping ? `<div class="ml-card__ship">Envío gratis</div>` : ""}
          <button class="btn btn--primary ml-card__add" data-add="${p.id}">Agregar al carrito</button>
        </div>
      </article>`;
  }

  /* ---------- Página: inicio ---------- */
  function initHome() {
    // Accesos de categorías (círculos)
    const cats = document.getElementById("catCircles");
    if (cats) {
      cats.innerHTML = Object.entries(CATEGORIES)
        .map(([key, c]) => `
          <a href="productos.html?cat=${key}" class="cat-circle">
            <span class="cat-circle__ico">${c.icon}</span>
            <span class="cat-circle__lbl">${c.label}</span>
          </a>`).join("");
    }

    // Sección Ofertas (productos con descuento, ordenados por % OFF)
    const ofertas = document.getElementById("ofertasGrid");
    if (ofertas) {
      const list = PRODUCTS.filter((p) => discountPct(p) > 0)
        .sort((a, b) => discountPct(b) - discountPct(a))
        .slice(0, 4);
      ofertas.innerHTML = list.map(productCard).join("");
    }

    // Sección Más vendidos
    const vendidos = document.getElementById("vendidosGrid");
    if (vendidos) {
      const list = [...PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 4);
      vendidos.innerHTML = list.map(productCard).join("");
    }
  }

  /* ---------- Página: catálogo / resultados ---------- */
  function initCatalog() {
    const grid = document.getElementById("products");
    if (!grid) return;
    const emptyMsg = document.getElementById("emptyMsg");
    const titleEl = document.getElementById("catalogTitle");
    const countEl = document.getElementById("resultCount");

    const params = new URLSearchParams(location.search);
    const state = {
      filter: params.get("cat") || "all",
      search: params.get("q") || "",
      sort: "default"
    };

    // Reflejar búsqueda en el título y en el input del header
    const headerSearch = document.getElementById("searchInput");
    if (headerSearch && state.search) headerSearch.value = state.search;

    // Marcar chip activo
    function syncChips() {
      document.querySelectorAll("#filters .chip").forEach((c) => {
        c.classList.toggle("active", c.dataset.filter === state.filter);
      });
    }

    function visible() {
      let list = PRODUCTS.filter((p) => {
        const mf = state.filter === "all" || p.category === state.filter;
        const ms = p.name.toLowerCase().includes(state.search.toLowerCase());
        return mf && ms;
      });
      if (state.sort === "price-asc") list.sort((a, b) => a.price - b.price);
      if (state.sort === "price-desc") list.sort((a, b) => b.price - a.price);
      if (state.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
      if (state.sort === "sold") list.sort((a, b) => b.sold - a.sold);
      return list;
    }

    function render() {
      const list = visible();
      if (emptyMsg) emptyMsg.hidden = list.length !== 0;
      if (titleEl) {
        titleEl.textContent = state.search
          ? `Resultados para "${state.search}"`
          : (CATEGORIES[state.filter] ? CATEGORIES[state.filter].label : "Todos los productos");
      }
      if (countEl) countEl.textContent = `${list.length} resultado${list.length === 1 ? "" : "s"}`;
      grid.innerHTML = list.map(productCard).join("");
    }

    const filters = document.getElementById("filters");
    if (filters) {
      filters.addEventListener("click", (e) => {
        const btn = e.target.closest(".chip");
        if (!btn) return;
        state.filter = btn.dataset.filter;
        state.search = "";
        syncChips();
        render();
      });
    }
    const sort = document.getElementById("sortSelect");
    if (sort) sort.addEventListener("change", (e) => { state.sort = e.target.value; render(); });

    syncChips();
    render();
  }

  /* ---------- Página: detalle de producto (estilo ML) ---------- */
  function initDetail() {
    const root = document.getElementById("detail");
    if (!root) return;
    const id = Number(new URLSearchParams(location.search).get("id"));
    const p = findProduct(id);

    if (!p) {
      root.innerHTML = `<div class="empty-msg">Producto no encontrado.
        <br><a class="btn btn--primary" href="productos.html" style="margin-top:16px">Volver a productos</a></div>`;
      return;
    }

    document.title = `${p.name} | TecnoGamer`;
    const off = discountPct(p);
    const inst = installmentText(p);
    const catLabel = CATEGORIES[p.category] ? CATEGORIES[p.category].label : p.category;

    const specsHtml = Object.entries(p.specs)
      .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
      .join("");

    // Opciones de cantidad según stock
    const maxOpt = Math.min(p.stock, 6);
    let qtyOptions = "";
    for (let n = 1; n <= maxOpt; n++) {
      qtyOptions += `<option value="${n}">${n} unidad${n > 1 ? "es" : ""}</option>`;
    }

    root.innerHTML = `
      <nav class="breadcrumb">
        <a href="index.html">Inicio</a> ›
        <a href="productos.html?cat=${p.category}">${catLabel}</a> ›
        <span>${p.name}</span>
      </nav>

      <div class="pdp">
        <!-- Galería -->
        <div class="pdp__gallery">
          <div class="pdp__main">
            <img src="${p.image}" alt="${p.name}" id="mainImg">
          </div>
          <div class="pdp__thumbs">
            ${p.gallery.map((g, i) =>
              `<button class="pdp__thumb ${i === 0 ? "active" : ""}" data-img="${g}"><img src="${g}" alt="vista ${i + 1}"></button>`
            ).join("")}
          </div>
        </div>

        <!-- Info central -->
        <div class="pdp__center">
          <p class="pdp__cond">${p.condition} | ${p.sold} vendidos</p>
          <h1 class="pdp__title">${p.name}</h1>
          <div class="pdp__rating">${stars(p.rating)} <span>(${p.rating}.0)</span></div>
          ${p.oldPrice && off > 0 ? `<p class="pdp__old">${money(p.oldPrice)}</p>` : ""}
          <div class="pdp__priceline">
            <span class="pdp__price">${money(p.price)}</span>
            ${off > 0 ? `<span class="pdp__off">${off}% OFF</span>` : ""}
          </div>
          ${inst ? `<p class="pdp__inst">en ${inst}</p>` : ""}
          <a href="#" class="pdp__paylink">Ver los medios de pago</a>

          <div class="pdp__desc">
            <h3>Descripción</h3>
            <p>${p.description}</p>
          </div>

          <div class="pdp__specs">
            <h3>Características principales</h3>
            <table class="spec-table"><tbody>${specsHtml}</tbody></table>
          </div>
        </div>

        <!-- Caja de compra -->
        <aside class="pdp__buybox">
          ${p.freeShipping ? `<p class="buybox__ship">🚚 <strong>Envío gratis</strong> a todo el país</p>` : `<p class="buybox__ship muted">Costo de envío a calcular</p>`}
          ${p.full ? `<p class="buybox__full"><span class="ml-tag-full">FULL</span> Llega más rápido</p>` : ""}
          <p class="buybox__stock">Stock disponible <small>(${p.stock} unidades)</small></p>

          <div class="buybox__qty">
            <label for="detailQty">Cantidad:</label>
            <select id="detailQty" class="select">${qtyOptions}</select>
          </div>

          <button class="btn btn--primary btn--block" data-buy="${p.id}" data-qty-from="detailQty">Comprar ahora</button>
          <button class="btn btn--outline btn--block" data-add="${p.id}" data-qty-from="detailQty" style="margin-top:10px">Agregar al carrito</button>

          <div class="buybox__seller">
            <p>Vendido por <strong>TecnoGamer Oficial</strong></p>
            <p class="muted">+1000 ventas · ⭐ Tienda oficial</p>
          </div>
          <ul class="buybox__perks">
            <li>↩️ Devolución gratis. Tienes 30 días.</li>
            <li>🛡️ Compra Protegida.</li>
            <li>🏅 ${p.specs["Garantía"] || "Garantía del vendedor"}.</li>
          </ul>
        </aside>
      </div>

      <!-- Relacionados -->
      <section class="block">
        <h2 class="section-title">Productos relacionados</h2>
        <div class="products" id="relatedGrid"></div>
      </section>`;

    // Galería: cambiar imagen al hacer clic en miniatura
    root.querySelectorAll(".pdp__thumb").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.getElementById("mainImg").src = btn.dataset.img;
        root.querySelectorAll(".pdp__thumb").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    // Relacionados (misma categoría)
    const related = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
    const relGrid = document.getElementById("relatedGrid");
    if (relGrid) relGrid.innerHTML = (related.length ? related : PRODUCTS.filter((x) => x.id !== p.id).slice(0, 4))
      .map(productCard).join("");
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
        <div class="cart-layout">
          <div>
            <table class="cart-table">
              <thead>
                <tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <button class="btn btn--danger" id="clearCart">Vaciar carrito</button>
          </div>

          <aside class="panel cart-resume">
            <h3>Resumen de compra</h3>
            <p class="cart-resume__row"><span>Productos</span><span>${money(total)}</span></p>
            <p class="cart-resume__row"><span>Envío</span><span class="ship-free">Gratis</span></p>
            <p class="cart-resume__total"><span>Total</span><strong>${money(total)}</strong></p>
            <div class="field" style="margin-top:14px">
              <label for="payMethod">Medio de pago</label>
              <select id="payMethod" class="select" style="width:100%">
                <option value="Tarjeta de Crédito/Débito">Tarjeta de Crédito / Débito</option>
                <option value="PayPal">PayPal</option>
                <option value="Transferencia">Transferencia Bancaria</option>
              </select>
            </div>
            <button class="btn btn--primary btn--block" id="checkoutBtn" style="margin-top:14px">Continuar compra</button>
          </aside>
        </div>`;

      document.getElementById("clearCart").addEventListener("click", () => { S.clearCart(); render(); });
      document.getElementById("checkoutBtn").addEventListener("click", () => {
        const metodo = document.getElementById("payMethod").value;
        S.showToast(`¡Compra realizada con ${metodo}! 🎉 Total: ${money(total)}`);
        S.clearCart();
        render();
      });
    }

    wrap.addEventListener("click", (e) => {
      const t = e.target;
      if (t.dataset.plus) { S.changeQty(t.dataset.plus, 1); render(); }
      if (t.dataset.minus) { S.changeQty(t.dataset.minus, -1); render(); }
      if (t.dataset.remove) { S.removeFromCart(t.dataset.remove); render(); }
    });

    render();
  }

  /* ---------- Delegación global: Agregar / Comprar ahora ---------- */
  function readQty(btn) {
    let qty = 1;
    if (btn.dataset.qtyFrom) {
      const input = document.getElementById(btn.dataset.qtyFrom);
      if (input) qty = input.value;
    }
    return qty;
  }

  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) { S.addToCart(addBtn.dataset.add, readQty(addBtn)); return; }

    const buyBtn = e.target.closest("[data-buy]");
    if (buyBtn) {
      S.addToCart(buyBtn.dataset.buy, readQty(buyBtn));
      setTimeout(() => (window.location.href = "carrito.html"), 500);
    }
  });

  /* ---------- Bootstrap por página ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;
    if (page === "home") initHome();
    if (page === "productos") initCatalog();
    if (page === "producto") initDetail();
    if (page === "carrito") initCart();
  });
})();
