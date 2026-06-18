/* =========================================================
   TecnoShop - Renderizado por página (estructura Mercado Libre)
   ========================================================= */

(function () {
  "use strict";

  const S = window.Store;
  const { money, stars, findProduct, getCart, cartTotals, discountPct, installmentText } = S;

  /* ---------- Tarjeta de producto estilo ML ---------- */
  const FB = `onerror="this.onerror=null;this.src='assets/placeholder.svg'"`;

  function stockNote(p) {
    if (p.stock <= 0) return `<div class="ml-card__nostock">Sin stock</div>`;
    if (p.stock <= 5) return `<div class="ml-card__low">¡Últimas ${p.stock} unidades!</div>`;
    return "";
  }

  function productCard(p) {
    const off = discountPct(p);
    const inst = installmentText(p);
    const agotado = p.stock <= 0;
    return `
      <article class="ml-card ${agotado ? "is-out" : ""}">
        <a href="producto.html?id=${p.id}" class="ml-card__media">
          ${p.full ? `<span class="ml-tag-full">FULL</span>` : ""}
          ${agotado ? `<span class="ml-tag-out">AGOTADO</span>` : ""}
          <img src="${p.image}" alt="${p.name}" loading="lazy" ${FB}>
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
          ${stockNote(p)}
          <button class="btn btn--primary ml-card__add" data-add="${p.id}" ${agotado ? "disabled" : ""}>
            ${agotado ? "Sin stock" : "Agregar al carrito"}
          </button>
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

  /* ---------- Generación de boleta ---------- */
  function buildBoletaHTML(order) {
    const fecha = new Date(order.fecha).toLocaleString("es-CL");
    const rows = order.items.map((it) =>
      `<tr><td>${it.qty}</td><td>${it.nombre}</td><td class="r">${money(it.price)}</td><td class="r">${money(it.price * it.qty)}</td></tr>`
    ).join("");
    const neto = Math.round(order.total / 1.19);
    const iva = order.total - neto;
    return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>Boleta ${order.id}</title>
<style>
  *{box-sizing:border-box;font-family:Arial,Helvetica,sans-serif}
  body{margin:0;padding:24px;color:#222;background:#f3f3f3}
  .boleta{max-width:640px;margin:0 auto;background:#fff;border:1px solid #ddd;border-radius:10px;overflow:hidden}
  .b-head{background:#0d0d16;color:#fff;padding:22px 24px;display:flex;justify-content:space-between;align-items:center}
  .b-logo{font-weight:900;font-size:1.4rem;letter-spacing:1px}
  .b-logo span{color:#00e0b8}
  .b-tag{color:#00e0b8;font-weight:bold;text-align:right;font-size:.9rem}
  .b-body{padding:24px}
  .b-meta{display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:.9rem;color:#555;margin-bottom:18px}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  th,td{padding:9px 8px;border-bottom:1px solid #eee;font-size:.9rem;text-align:left}
  th{background:#f7f7f7;text-transform:uppercase;font-size:.72rem;color:#666}
  .r{text-align:right}
  .tot{margin-left:auto;width:260px}
  .tot div{display:flex;justify-content:space-between;padding:5px 0;font-size:.92rem}
  .tot .grand{border-top:2px solid #0d0d16;margin-top:6px;padding-top:8px;font-size:1.15rem;font-weight:bold}
  .b-foot{background:#f7f7f7;padding:16px 24px;text-align:center;color:#777;font-size:.82rem}
  @media print{body{background:#fff;padding:0}.boleta{border:none}}
</style></head><body>
  <div class="boleta">
    <div class="b-head">
      <div class="b-logo">TECNO<span>SHOP</span></div>
      <div class="b-tag">BOLETA ELECTRÓNICA<br>N° ${order.id}</div>
    </div>
    <div class="b-body">
      <div class="b-meta">
        <div><strong>Cliente:</strong> ${order.cliente || "Cliente"}<br><strong>Correo:</strong> ${order.correo || "-"}</div>
        <div style="text-align:right"><strong>Fecha:</strong> ${fecha}<br><strong>Medio de pago:</strong> ${order.metodo}</div>
      </div>
      <table>
        <thead><tr><th>Cant.</th><th>Producto</th><th class="r">P. unit.</th><th class="r">Subtotal</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="tot">
        <div><span>Neto</span><span>${money(neto)}</span></div>
        <div><span>IVA (19%)</span><span>${money(iva)}</span></div>
        <div><span>Envío</span><span>Gratis</span></div>
        <div class="grand"><span>TOTAL</span><span>${money(order.total)}</span></div>
      </div>
    </div>
    <div class="b-foot">
      Gracias por tu compra en TecnoShop · ventas@tecnoshop.cl · Santiago, Chile<br>
      Documento de demostración (sin validez tributaria).
    </div>
  </div>
</body></html>`;
  }

  function descargarBoleta(html, orden) {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => { try { w.print(); } catch (_) {} }, 500);
    } else {
      const blob = new Blob([html], { type: "text/html" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `boleta-${orden}.html`;
      a.click();
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

    // Construir chips de filtro dinámicamente desde CATEGORIES
    const filters = document.getElementById("filters");
    if (filters && !filters.children.length) {
      filters.innerHTML = Object.entries(CATEGORIES)
        .map(([key, c]) => `<button class="chip" data-filter="${key}">${c.label}</button>`)
        .join("");
    }

    // Reflejar búsqueda en el input del header
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

    const filtersEl = document.getElementById("filters");
    if (filtersEl) {
      filtersEl.addEventListener("click", (e) => {
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

    document.title = `${p.name} | TecnoShop`;
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
            <img src="${p.image}" alt="${p.name}" id="mainImg" ${FB}>
          </div>
          <div class="pdp__thumbs">
            ${p.gallery.map((g, i) =>
              `<button class="pdp__thumb ${i === 0 ? "active" : ""}" data-img="${g}"><img src="${g}" alt="vista ${i + 1}" ${FB}></button>`
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
          ${p.stock > 0
            ? `<p class="buybox__stock">Stock disponible <small>(${p.stock} unidades)</small></p>
               <div class="buybox__qty">
                 <label for="detailQty">Cantidad:</label>
                 <select id="detailQty" class="select">${qtyOptions}</select>
               </div>
               <button class="btn btn--primary btn--block" data-buy="${p.id}" data-qty-from="detailQty">Comprar ahora</button>
               <button class="btn btn--outline btn--block" data-add="${p.id}" data-qty-from="detailQty" style="margin-top:10px">Agregar al carrito</button>`
            : `<p class="buybox__out">😕 Producto agotado</p>
               <button class="btn btn--block" disabled style="background:var(--line);color:var(--muted);cursor:not-allowed">Sin stock</button>`}

          <div class="buybox__seller">
            <p>Vendido por <strong>TecnoShop Oficial</strong></p>
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
                <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src='assets/placeholder.svg'">
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
            <a class="btn btn--primary btn--block" href="checkout.html" style="margin-top:14px">Continuar compra</a>
          </aside>
        </div>`;

      document.getElementById("clearCart").addEventListener("click", () => { S.clearCart(); render(); });
    }

    wrap.addEventListener("click", (e) => {
      const t = e.target;
      if (t.dataset.plus) { S.changeQty(t.dataset.plus, 1); render(); }
      if (t.dataset.minus) { S.changeQty(t.dataset.minus, -1); render(); }
      if (t.dataset.remove) { S.removeFromCart(t.dataset.remove); render(); }
    });

    render();
  }

  /* ---------- Página: checkout (pasarela de pago demo) ---------- */
  function luhnValid(num) {
    const digits = num.replace(/\s+/g, "");
    if (!/^\d{13,19}$/.test(digits)) return false;
    let sum = 0, alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n; alt = !alt;
    }
    return sum % 10 === 0;
  }

  function initCheckout() {
    const wrap = document.getElementById("checkoutContent");
    if (!wrap) return;

    const cart = getCart();
    const { total } = cartTotals();

    if (cart.length === 0) {
      wrap.innerHTML = `
        <div class="cart-empty">
          <p style="font-size:3rem">🛒</p>
          <p>No tienes productos para pagar.</p>
          <a class="btn btn--primary" href="productos.html" style="margin-top:16px">Ir a productos</a>
        </div>`;
      return;
    }

    const itemsHtml = cart.map((i) => {
      const p = findProduct(i.id);
      if (!p) return "";
      return `<div class="co-item">
        <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src='assets/placeholder.svg'">
        <div><span>${p.name}</span><small>${i.qty} x ${money(p.price)}</small></div>
        <strong>${money(p.price * i.qty)}</strong>
      </div>`;
    }).join("");

    wrap.innerHTML = `
      <div class="checkout-layout">
        <section class="panel">
          <h3>Medio de pago</h3>
          <div class="pay-methods" id="payMethods">
            <label class="pay-method active"><input type="radio" name="pm" value="tarjeta" checked> 💳 Tarjeta de crédito / débito</label>
            <label class="pay-method"><input type="radio" name="pm" value="mercadopago"> 💙 Mercado Pago</label>
            <label class="pay-method"><input type="radio" name="pm" value="transferencia"> 🏦 Transferencia bancaria</label>
          </div>

          <!-- Formulario tarjeta -->
          <form id="cardForm" class="pay-panel" novalidate>
            <div class="field">
              <label for="cardNum">Número de tarjeta</label>
              <input type="text" id="cardNum" inputmode="numeric" maxlength="19" placeholder="1234 5678 9012 3456" autocomplete="cc-number">
              <span class="error" id="errCardNum"></span>
            </div>
            <div class="field">
              <label for="cardName">Nombre en la tarjeta</label>
              <input type="text" id="cardName" placeholder="Como aparece en la tarjeta" autocomplete="cc-name">
              <span class="error" id="errCardName"></span>
            </div>
            <div class="co-row">
              <div class="field">
                <label for="cardExp">Vencimiento (MM/AA)</label>
                <input type="text" id="cardExp" maxlength="5" placeholder="MM/AA" autocomplete="cc-exp">
                <span class="error" id="errCardExp"></span>
              </div>
              <div class="field">
                <label for="cardCvv">CVV</label>
                <input type="text" id="cardCvv" inputmode="numeric" maxlength="4" placeholder="123" autocomplete="cc-csc">
                <span class="error" id="errCardCvv"></span>
              </div>
            </div>
            <p class="muted" style="font-size:.82rem">💡 Prueba con una tarjeta válida de test: <strong>4111 1111 1111 1111</strong></p>
          </form>

          <!-- Mercado Pago -->
          <div id="mpPanel" class="pay-panel" hidden>
            <p>Paga de forma segura con Mercado Pago (tarjetas, débito, saldo y más).</p>
            <div id="mpBtns" style="margin-top:10px"></div>
          </div>

          <!-- Transferencia -->
          <div id="transferPanel" class="pay-panel" hidden>
            <p>Realiza la transferencia a la siguiente cuenta:</p>
            <ul class="bank-data">
              <li><span>Banco</span><strong>Banco TecnoShop</strong></li>
              <li><span>Cuenta Corriente</span><strong>0012 3456 7890</strong></li>
              <li><span>RUT</span><strong>76.543.210-K</strong></li>
              <li><span>Email</span><strong>pagos@tecnoshop.cl</strong></li>
            </ul>
          </div>
        </section>

        <aside class="panel cart-resume">
          <h3>Tu pedido</h3>
          <div class="co-items">${itemsHtml}</div>
          <p class="cart-resume__row"><span>Productos</span><span>${money(total)}</span></p>
          <p class="cart-resume__row"><span>Envío</span><span class="ship-free">Gratis</span></p>
          <p class="cart-resume__total"><span>Total</span><strong>${money(total)}</strong></p>
          <div class="field" style="margin-top:12px">
            <label for="buyerEmail">Correo para tu boleta</label>
            <input type="email" id="buyerEmail" class="input" style="width:100%" value="${(S.Auth.current() && S.Auth.current().email) || ""}" placeholder="tucorreo@ejemplo.com">
          </div>
          <button class="btn btn--outline btn--block" id="geoBtn" style="margin-top:10px">📍 Calcular envío a mi ubicación</button>
          <div class="integra-result" id="geoShip"></div>
          <button class="btn btn--primary btn--block" id="payBtn" style="margin-top:14px">Pagar ${money(total)}</button>
          <a href="carrito.html" class="co-back">← Volver al carrito</a>
        </aside>
      </div>`;

    // Cambiar panel según método
    const panels = { tarjeta: "cardForm", mercadopago: "mpPanel", transferencia: "transferPanel" };
    let mpRendered = false;

    async function renderMP() {
      const box = document.getElementById("mpBtns");
      const I = window.Integrations;

      function demoButton(msg) {
        box.innerHTML = `<p class="muted" style="font-size:.85rem">${msg}</p>
          <button class="btn btn--primary btn--block" id="mpDemo">Pagar con Mercado Pago (demo)</button>`;
        document.getElementById("mpDemo").addEventListener("click", () => finalizar("Mercado Pago"));
      }

      if (mpRendered) return;
      mpRendered = true;

      // Si Mercado Pago está configurado, crear preferencia en el backend y mostrar el botón oficial
      if (I && I.mpConfigured && I.mpConfigured()) {
        box.innerHTML = "<p class='muted'>Cargando Mercado Pago...</p>";
        try {
          const pref = await I.crearPreferencia(getCart());
          if (pref && pref.demo) { demoButton("Mercado Pago en modo demostración (falta configurar el Access Token en el servidor)."); return; }
          box.innerHTML = '<div id="mp-container"></div>';
          await I.renderMercadoPago("mp-container", pref.id);
        } catch (e) {
          demoButton("No se pudo iniciar Mercado Pago (" + e.message + ").");
        }
      } else {
        demoButton("Mercado Pago en modo demostración (configura tu Public Key para el pago real).");
      }
    }

    function showPanel(method) {
      Object.values(panels).forEach((id) => { document.getElementById(id).hidden = true; });
      document.getElementById(panels[method]).hidden = false;
      wrap.querySelectorAll(".pay-method").forEach((l) =>
        l.classList.toggle("active", l.querySelector("input").value === method));
      const payBtn = document.getElementById("payBtn");
      if (method === "mercadopago") { payBtn.style.display = "none"; renderMP(); }
      else { payBtn.style.display = ""; }
    }
    wrap.querySelectorAll('input[name="pm"]').forEach((r) =>
      r.addEventListener("change", (e) => showPanel(e.target.value)));

    // Formateo automático del número de tarjeta
    const cardNum = document.getElementById("cardNum");
    cardNum.addEventListener("input", () => {
      let v = cardNum.value.replace(/\D/g, "").slice(0, 16);
      cardNum.value = v.replace(/(.{4})/g, "$1 ").trim();
    });
    const cardExp = document.getElementById("cardExp");
    cardExp.addEventListener("input", () => {
      let v = cardExp.value.replace(/\D/g, "").slice(0, 4);
      if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
      cardExp.value = v;
    });
    document.getElementById("cardCvv").addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "");
    });

    function validarTarjeta() {
      const set = (id, msg) => (document.getElementById(id).textContent = msg);
      let ok = true;
      set("errCardNum", ""); set("errCardName", ""); set("errCardExp", ""); set("errCardCvv", "");

      if (!luhnValid(cardNum.value)) { set("errCardNum", "Número de tarjeta no válido."); ok = false; }
      if (document.getElementById("cardName").value.trim().length < 3) { set("errCardName", "Ingresa el nombre del titular."); ok = false; }

      const exp = cardExp.value;
      const m = exp.match(/^(\d{2})\/(\d{2})$/);
      if (!m || +m[1] < 1 || +m[1] > 12) {
        set("errCardExp", "Fecha inválida (MM/AA)."); ok = false;
      } else {
        const now = new Date();
        const expDate = new Date(2000 + +m[2], +m[1]);
        if (expDate <= now) { set("errCardExp", "La tarjeta está vencida."); ok = false; }
      }
      if (!/^\d{3,4}$/.test(document.getElementById("cardCvv").value)) { set("errCardCvv", "CVV inválido."); ok = false; }
      return ok;
    }

    function finalizar(metodoLabel) {
      const orden = "TS-" + Date.now().toString().slice(-8);
      const user = S.Auth.current();
      const emailField = document.getElementById("buyerEmail");
      const correo = (emailField && emailField.value.trim()) || (user && user.email) || "";
      const cartSnapshot = getCart();
      const items = cartSnapshot.map((i) => {
        const p = findProduct(i.id);
        return { id: i.id, nombre: p ? p.name : "", qty: i.qty, price: p ? p.price : 0 };
      });

      const order = {
        id: orden, email: correo || (user ? user.email : "invitado"), correo,
        cliente: user ? user.nombre : "Cliente",
        items, total, metodo: metodoLabel, fecha: new Date().toISOString()
      };

      // Guardar el pedido (historial "Mis pedidos")
      S.Orders.add(order);
      // Descontar el stock comprado
      S.decrementStock(cartSnapshot);

      // Webhook: notificar la compra a un sistema externo (POST)
      if (window.Integrations) {
        window.Integrations.sendWebhook("https://jsonplaceholder.typicode.com/posts", {
          evento: "compra_realizada", orden, metodo: metodoLabel, total, items, fecha: order.fecha
        }).then((r) => console.log("Webhook enviado, HTTP", r.status))
          .catch((e) => console.warn("Webhook falló:", e.message));
      }

      // Generar la boleta
      const boletaHtml = buildBoletaHTML(order);

      wrap.innerHTML = `
        <div class="checkout-success">
          <div class="checkout-success__ico">✅</div>
          <h2>¡Compra realizada con éxito!</h2>
          <p>Gracias por tu compra en TecnoShop.</p>
          <div class="checkout-success__box">
            <p><span>N° de boleta</span><strong>${orden}</strong></p>
            <p><span>Medio de pago</span><strong>${metodoLabel}</strong></p>
            <p><span>Total pagado</span><strong>${money(total)}</strong></p>
          </div>
          <p class="email-status" id="emailStatus">📧 Preparando el envío de tu boleta...</p>
          <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-top:18px">
            <button class="btn btn--primary" id="btnBoleta">🧾 Descargar / Imprimir boleta</button>
            <a href="pedidos.html" class="btn btn--outline">Ver mis pedidos</a>
            <a href="index.html" class="btn btn--outline">Volver al inicio</a>
          </div>
          <p class="muted" style="margin-top:14px">(Demostración: no se realizó ningún cobro real.)</p>
        </div>`;
      S.clearCart();

      // Botón de descarga/impresión de la boleta
      document.getElementById("btnBoleta").addEventListener("click", () => descargarBoleta(boletaHtml, orden));

      // Envío de la boleta por correo (EmailJS)
      const status = document.getElementById("emailStatus");
      const I = window.Integrations;
      if (!correo) {
        status.innerHTML = "🧾 Tu boleta está lista para descargar.";
      } else if (I && I.emailConfigured && I.emailConfigured()) {
        status.textContent = `📤 Enviando boleta a ${correo}...`;
        const resumen = items.map((it) => `${it.qty} x ${it.nombre} — ${money(it.price * it.qty)}`).join("\n");
        I.sendBoletaEmail({
          to_email: correo, cliente: order.cliente, orden,
          fecha: new Date(order.fecha).toLocaleString("es-CL"),
          metodo: metodoLabel, total: money(total), detalle: resumen
        }).then(() => { status.innerHTML = `✅ Boleta enviada a <strong>${correo}</strong>`; })
          .catch(() => { status.innerHTML = `🧾 No se pudo enviar el correo. Descarga tu boleta con el botón.`; });
      } else {
        status.innerHTML = `🧾 Boleta lista. <small class="muted">(Para enviarla automáticamente a ${correo}, configura EmailJS en js/integrations.js)</small>`;
      }
    }

    document.getElementById("payBtn").addEventListener("click", () => {
      const method = wrap.querySelector('input[name="pm"]:checked').value;
      if (method === "tarjeta") {
        if (!validarTarjeta()) { S.showToast("Revisa los datos de la tarjeta"); return; }
        finalizar("Tarjeta de crédito/débito");
      } else if (method === "transferencia") {
        finalizar("Transferencia bancaria");
      }
      // Mercado Pago usa su propio botón (se renderiza en renderMP)
    });

    // Georreferenciación: calcular envío + clima a la ubicación del cliente
    const geoBtn = document.getElementById("geoBtn");
    if (geoBtn) {
      geoBtn.addEventListener("click", async () => {
        const out = document.getElementById("geoShip");
        out.className = "integra-result";
        out.textContent = "📡 Detectando tu ubicación...";
        if (!window.Integrations) { out.textContent = "Integraciones no disponibles."; return; }
        try {
          const { lat, lon } = await window.Integrations.getPosition();
          let ciudad = "tu ubicación";
          try {
            const g = await window.Integrations.reverseGeocode(lat, lon);
            ciudad = (g.address && (g.address.city || g.address.town || g.address.village || g.address.state)) || ciudad;
          } catch (_) {}
          let clima = "";
          try {
            const w = await window.Integrations.getWeather(lat, lon);
            const [t, e] = window.Integrations.weatherText(w.current.weather_code);
            clima = ` · ${e} ${w.current.temperature_2m}°C`;
          } catch (_) {}
          out.className = "integra-result ok";
          out.innerHTML = `🚚 Envío gratis a <strong>${ciudad}</strong>${clima}<br><small>Entrega estimada: 2 a 4 días hábiles</small>`;
        } catch (e) {
          out.className = "integra-result warn";
          out.textContent = "⚠️ " + e.message;
        }
      });
    }
  }

  /* ---------- Página: Mis pedidos ---------- */
  function initPedidos() {
    const wrap = document.getElementById("pedidosContent");
    if (!wrap) return;
    const user = S.Auth.current();
    if (!user) {
      wrap.innerHTML = `<div class="cart-empty"><p style="font-size:3rem">🔒</p>
        <p>Debes iniciar sesión para ver tus pedidos.</p>
        <a class="btn btn--primary" href="login.html" style="margin-top:14px">Iniciar sesión</a></div>`;
      return;
    }
    const orders = S.Orders.forCurrent();
    if (!orders.length) {
      wrap.innerHTML = `<div class="cart-empty"><p style="font-size:3rem">📦</p>
        <p>Aún no tienes pedidos.</p>
        <a class="btn btn--primary" href="productos.html" style="margin-top:14px">Ir a comprar</a></div>`;
      return;
    }
    wrap.innerHTML = orders.map((o) => {
      const fecha = new Date(o.fecha).toLocaleString("es-CL");
      const itemsHtml = o.items.map((it) =>
        `<li><span>${it.qty} x ${it.nombre}</span><strong>${money(it.price * it.qty)}</strong></li>`).join("");
      return `<div class="order-card">
        <div class="order-card__head">
          <div><strong>Orden ${o.id}</strong><br><small class="muted">${fecha}${user.role === "admin" ? " · " + o.email : ""}</small></div>
          <div class="order-card__total">${money(o.total)}</div>
        </div>
        <ul class="order-card__items">${itemsHtml}</ul>
        <div class="order-card__foot">💳 ${o.metodo} · <span class="badge-ok">✓ Confirmado</span>
          <button class="btn btn--outline btn-sm" data-boleta="${o.id}" style="margin-left:auto">🧾 Descargar boleta</button>
        </div>
      </div>`;
    }).join("");

    wrap.querySelectorAll("[data-boleta]").forEach((b) =>
      b.addEventListener("click", () => {
        const o = orders.find((x) => x.id === b.dataset.boleta);
        if (o) descargarBoleta(buildBoletaHTML(o), o.id);
      }));
  }

  /* ---------- Página: Admin (CRUD de productos, protegido) ---------- */
  function initAdmin() {
    const wrap = document.getElementById("adminContent");
    if (!wrap) return;
    if (!S.Auth.isAdmin()) {
      wrap.innerHTML = `<h2 class="section-title">Acceso restringido</h2>
        <div class="cart-empty"><p style="font-size:3rem">🔒</p>
        <p>Debes iniciar sesión como administrador.</p>
        <p class="muted">Demo: admin@tecnoshop.cl / admin123</p>
        <a class="btn btn--primary" href="login.html" style="margin-top:14px">Iniciar sesión</a></div>`;
      return;
    }
    let editId = null;

    function render() {
      const totalProductos = PRODUCTS.length;
      const categorias = new Set(PRODUCTS.map((p) => p.category)).size;
      const valorInventario = PRODUCTS.reduce((s, p) => s + p.price * p.stock, 0);
      const sinStock = PRODUCTS.filter((p) => p.stock <= 0).length;
      const pedidos = S.Orders.all().length;

      wrap.innerHTML = `
        <h2 class="section-title">Panel de Administración</h2>
        <div class="stat-row">
          <div class="stat"><div class="num">${totalProductos}</div><div class="lbl">Productos</div></div>
          <div class="stat"><div class="num">${categorias}</div><div class="lbl">Categorías</div></div>
          <div class="stat"><div class="num">${money(valorInventario)}</div><div class="lbl">Valor inventario</div></div>
          <div class="stat"><div class="num">${pedidos}</div><div class="lbl">Pedidos</div></div>
          <div class="stat"><div class="num">${sinStock}</div><div class="lbl">Sin stock</div></div>
        </div>

        <div class="admin-bar">
          <h2 class="section-title" style="margin:0">Gestión de productos</h2>
          <div style="display:flex; gap:10px; flex-wrap:wrap">
            <button class="btn btn--primary" id="btnNuevo">+ Nuevo producto</button>
            <button class="btn btn--outline" id="btnReset">Restablecer catálogo</button>
          </div>
        </div>

        <div id="formBox"></div>

        <div style="overflow-x:auto">
          <table class="cart-table">
            <thead><tr><th>ID</th><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
            <tbody>${PRODUCTS.map((p) => `
              <tr>
                <td data-label="ID">${p.id}</td>
                <td data-label="Producto">${p.name}</td>
                <td data-label="Categoría">${p.category}</td>
                <td data-label="Precio">${money(p.price)}</td>
                <td data-label="Stock">${p.stock <= 0 ? '<span style="color:var(--accent)">Agotado</span>' : p.stock}</td>
                <td data-label="Acciones">
                  <button class="btn btn--outline btn-sm" data-edit="${p.id}">Editar</button>
                  <button class="btn btn--danger btn-sm" data-del="${p.id}">Eliminar</button>
                </td>
              </tr>`).join("")}</tbody>
          </table>
        </div>`;

      document.getElementById("btnNuevo").addEventListener("click", () => { editId = null; showForm(); });
      document.getElementById("btnReset").addEventListener("click", () => {
        if (confirm("¿Restablecer el catálogo a los productos originales? Se perderán tus cambios.")) {
          S.resetProducts(); render(); S.showToast("Catálogo restablecido");
        }
      });
      wrap.querySelectorAll("[data-edit]").forEach((b) =>
        b.addEventListener("click", () => { editId = Number(b.dataset.edit); showForm(); }));
      wrap.querySelectorAll("[data-del]").forEach((b) =>
        b.addEventListener("click", () => {
          const id = Number(b.dataset.del);
          if (confirm("¿Eliminar este producto?")) {
            const idx = PRODUCTS.findIndex((p) => p.id === id);
            if (idx >= 0) PRODUCTS.splice(idx, 1);
            S.saveProducts(); render(); S.showToast("Producto eliminado");
          }
        }));
    }

    function showForm() {
      const p = editId ? S.findProduct(editId) : null;
      const opts = Object.keys(CATEGORIES).filter((k) => k !== "all")
        .map((k) => `<option value="${k}" ${p && p.category === k ? "selected" : ""}>${CATEGORIES[k].label}</option>`).join("");
      const box = document.getElementById("formBox");
      box.innerHTML = `
        <form class="panel admin-form" id="prodForm">
          <h3>${p ? "Editar producto" : "Nuevo producto"}</h3>
          <div class="admin-form__grid">
            <div class="field"><label>Nombre</label><input id="f_name" value="${p ? p.name.replace(/"/g, "&quot;") : ""}"></div>
            <div class="field"><label>Categoría</label><select id="f_cat">${opts}</select></div>
            <div class="field"><label>Precio (CLP)</label><input id="f_price" type="number" value="${p ? p.price : ""}"></div>
            <div class="field"><label>Precio anterior (opcional)</label><input id="f_old" type="number" value="${p && p.oldPrice ? p.oldPrice : ""}"></div>
            <div class="field"><label>Stock</label><input id="f_stock" type="number" value="${p ? p.stock : 10}"></div>
            <div class="field"><label>Cuotas</label><input id="f_inst" type="number" value="${p ? p.installments : 12}"></div>
            <div class="field"><label>Rating (1-5)</label><input id="f_rating" type="number" min="1" max="5" value="${p ? p.rating : 5}"></div>
            <div class="field"><label>Imagen (URL)</label><input id="f_img" value="${p ? p.image : ""}" placeholder="https://... o assets/..."></div>
          </div>
          <div class="field"><label>Descripción</label><input id="f_desc" value="${p ? p.description.replace(/"/g, "&quot;") : ""}"></div>
          <label style="display:flex; gap:8px; align-items:center; margin-bottom:12px">
            <input type="checkbox" id="f_ship" ${!p || p.freeShipping ? "checked" : ""}> Envío gratis
          </label>
          <div style="display:flex; gap:10px">
            <button type="submit" class="btn btn--primary">Guardar</button>
            <button type="button" class="btn btn--outline" id="btnCancel">Cancelar</button>
          </div>
        </form>`;
      box.scrollIntoView({ behavior: "smooth" });
      document.getElementById("btnCancel").addEventListener("click", () => { box.innerHTML = ""; });
      document.getElementById("prodForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("f_name").value.trim();
        const price = parseInt(document.getElementById("f_price").value, 10);
        if (!name || !price) { S.showToast("Completa al menos nombre y precio"); return; }
        const data = {
          name, category: document.getElementById("f_cat").value, price,
          oldPrice: parseInt(document.getElementById("f_old").value, 10) || 0,
          stock: parseInt(document.getElementById("f_stock").value, 10) || 0,
          installments: parseInt(document.getElementById("f_inst").value, 10) || 1,
          rating: parseInt(document.getElementById("f_rating").value, 10) || 5,
          image: document.getElementById("f_img").value.trim() || "assets/placeholder.svg",
          description: document.getElementById("f_desc").value.trim(),
          freeShipping: document.getElementById("f_ship").checked
        };
        if (editId) {
          const prod = S.findProduct(editId);
          Object.assign(prod, data);
          prod.gallery = [data.image];
          if (!prod.specs) prod.specs = {};
        } else {
          const newId = Math.max(0, ...PRODUCTS.map((p) => p.id)) + 1;
          PRODUCTS.push({ id: newId, ...data, gallery: [data.image], sold: 0, full: false, condition: "Nuevo", specs: { "Garantía": "6 meses" } });
        }
        S.saveProducts();
        box.innerHTML = "";
        render();
        S.showToast(editId ? "Producto actualizado" : "Producto agregado");
      });
    }

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
    if (page === "checkout") initCheckout();
    if (page === "pedidos") initPedidos();
    if (page === "admin") initAdmin();
  });
})();
