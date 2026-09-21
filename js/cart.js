/* ==========================================================================
   cart.js — CARRINHO (FRONTEND / DEMO)

   - Estado guardado em localStorage (JHOW.storage.cart).
     Isto é uma implementação de demonstração: o carrinho existe só neste
     navegador e não é enviado a nenhum servidor.
   - NÃO existe pagamento neste projeto. O botão final envia o pedido ao
     WhatsApp ou abre o pedido online existente (veja pedidos.js).
   - Guarda apenas { id, qty }. Nome e preço são lidos de menuItems, então
     mudanças no cardápio se refletem no carrinho automaticamente.
   ========================================================================== */
(function () {
  "use strict";
  const J = window.Jhow;
  const KEY = JHOW.storage.cart;
  const MAX_QTY = 20;

  let entries = J.store.get(KEY, []);
  if (!Array.isArray(entries)) entries = [];
  entries = entries.filter((e) => e && Number.isInteger(e.id) && Number.isInteger(e.qty) && e.qty > 0);

  const findItem = (id) => menuItems.find((m) => m.id === Number(id));

  function save() {
    J.store.set(KEY, entries);
    render();
    J.emit("jhow:cart-changed");
  }

  /* --------------------------------- API --------------------------------- */
  const cart = {
    lines() {
      return entries
        .map((e) => {
          const item = findItem(e.id);
          return item ? { item, qty: e.qty, total: item.price * e.qty } : null;
        })
        .filter(Boolean);
    },
    count() {
      return cart.lines().reduce((sum, l) => sum + l.qty, 0);
    },
    subtotal() {
      return cart.lines().reduce((sum, l) => sum + l.total, 0);
    },
    add(id, qty = 1) {
      const item = findItem(id);
      if (!item) return false;
      if (!item.available) {
        J.toast(`${item.name} está indisponível no momento.`, { type: "error" });
        return false;
      }
      const existing = entries.find((e) => e.id === item.id);
      if (existing) existing.qty = Math.min(MAX_QTY, existing.qty + qty);
      else entries.push({ id: item.id, qty: Math.min(MAX_QTY, qty) });
      save();
      return true;
    },
    setQty(id, qty) {
      const existing = entries.find((e) => e.id === Number(id));
      if (!existing) return;
      if (qty <= 0) return cart.remove(id);
      existing.qty = Math.min(MAX_QTY, qty);
      save();
    },
    remove(id) {
      entries = entries.filter((e) => e.id !== Number(id));
      save();
    },
    clear() {
      entries = [];
      save();
    },
    open() {
      const drawer = document.getElementById("cart-drawer");
      if (!drawer) return;
      lastFocus = document.activeElement;
      drawer.inert = false;
      drawer.classList.add("is-open");
      const overlay = document.getElementById("drawer-overlay");
      overlay.hidden = false;
      requestAnimationFrame(() => overlay.classList.add("is-open"));
      document.body.classList.add("no-scroll");
      document.getElementById("cart-toggle").setAttribute("aria-expanded", "true");
      drawer.focus();
    },
    close() {
      const drawer = document.getElementById("cart-drawer");
      if (!drawer || !drawer.classList.contains("is-open")) return;
      drawer.classList.remove("is-open");
      drawer.inert = true;
      const overlay = document.getElementById("drawer-overlay");
      overlay.classList.remove("is-open");
      setTimeout(() => (overlay.hidden = true), 250);
      document.body.classList.remove("no-scroll");
      document.getElementById("cart-toggle").setAttribute("aria-expanded", "false");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
  };
  let lastFocus = null;
  J.cart = cart;

  /* ------------------------------- Renderização ------------------------------- */
  function render() {
    const body = document.getElementById("cart-body");
    const foot = document.getElementById("cart-foot");
    const lines = cart.lines();
    const count = cart.count();

    document.querySelectorAll("[data-cart-count]").forEach((badge) => {
      badge.textContent = count;
      badge.hidden = count === 0;
    });

    if (!body || !foot) return;

    if (!lines.length) {
      body.innerHTML = `
        <div class="empty-state">
          ${J.icon("bag", 40)}
          <h3>Seu carrinho está vazio</h3>
          <p>Escolha um lanche no cardápio e ele aparece aqui.</p>
          <a class="btn btn-red" href="cardapio.html">Ver cardápio</a>
        </div>`;
      foot.innerHTML = "";
      return;
    }

    body.innerHTML = `<ul class="cart-list">${lines
      .map(
        ({ item, qty, total }) => `
        <li class="cart-line">
          <img src="${J.escape(item.image)}" alt="" width="64" height="64" loading="lazy">
          <div class="cart-line-info">
            <p class="cart-line-name">${J.escape(item.name)}</p>
            <p class="cart-line-price">${priceText(item.price)}</p>
            <div class="qty" role="group" aria-label="Quantidade de ${J.escape(item.name)}">
              <button type="button" data-cart-dec="${item.id}" aria-label="Diminuir quantidade">${J.icon("minus", 16)}</button>
              <output aria-live="polite">${qty}</output>
              <button type="button" data-cart-inc="${item.id}" aria-label="Aumentar quantidade">${J.icon("plus", 16)}</button>
            </div>
          </div>
          <div class="cart-line-side">
            <strong>${priceText(total)}</strong>
            <button class="link-btn" type="button" data-cart-remove="${item.id}" aria-label="Remover ${J.escape(item.name)}">${J.icon("trash", 16)}<span>Remover</span></button>
          </div>
        </li>`
      )
      .join("")}</ul>`;

    const subtotal = cart.subtotal();
    foot.innerHTML = `
      <dl class="totals">
        <div><dt>Subtotal</dt><dd>${priceText(subtotal)}</dd></div>
        <div class="totals-final"><dt>Total</dt><dd>${priceText(subtotal)}</dd></div>
      </dl>
      <p class="fine-print">
        ${JHOW.demoMode ? "<strong>Valores demonstrativos.</strong> " : ""}Este site não processa pagamentos.
        Taxa de entrega e forma de pagamento são combinadas direto com o Jhow Lanches.
      </p>
      <div class="drawer-actions">
        <button class="btn btn-red btn-block" type="button" data-checkout="whatsapp">${J.iconWhatsApp(20)} Finalizar pelo WhatsApp</button>
        <button class="btn btn-mustard btn-block" type="button" data-checkout="online">Pedir no cardápio online</button>
        <button class="link-btn link-btn-center" type="button" data-cart-clear>Limpar carrinho</button>
      </div>`;
  }

  function priceText(value) {
    return value > 0 ? J.formatBRL(value) : "Preço a definir";
  }

  /* --------------------------------- Eventos --------------------------------- */
  document.addEventListener("click", (e) => {
    const t = e.target;

    const add = t.closest("[data-add]");
    if (add) {
      const id = Number(add.dataset.add);
      const qtyInput = document.querySelector("[data-qty-input]");
      const qty = add.hasAttribute("data-use-qty") && qtyInput ? Number(qtyInput.value) || 1 : 1;
      if (cart.add(id, qty)) {
        add.classList.remove("is-added");
        void add.offsetWidth; // reinicia a animação
        add.classList.add("is-added");
        const item = findItem(id);
        J.toast(`${item.name} foi adicionado ao carrinho.`, {
          type: "success",
          actionLabel: "Ver carrinho",
          onAction: cart.open
        });
      }
      return;
    }

    if (t.closest("#cart-toggle")) return cart.open();
    if (t.closest("[data-cart-close]") || t.closest("#drawer-overlay")) return cart.close();

    const inc = t.closest("[data-cart-inc]");
    if (inc) {
      const line = cart.lines().find((l) => l.item.id === Number(inc.dataset.cartInc));
      if (line) cart.setQty(line.item.id, line.qty + 1);
      return;
    }
    const dec = t.closest("[data-cart-dec]");
    if (dec) {
      const line = cart.lines().find((l) => l.item.id === Number(dec.dataset.cartDec));
      if (line) cart.setQty(line.item.id, line.qty - 1);
      return;
    }
    const rem = t.closest("[data-cart-remove]");
    if (rem) return cart.remove(rem.dataset.cartRemove);
    if (t.closest("[data-cart-clear]")) {
      cart.clear();
      J.toast("Carrinho limpo.", { type: "info" });
      return;
    }

    const checkout = t.closest("[data-checkout]");
    if (checkout && J.orders) J.orders.checkout(checkout.dataset.checkout);
  });

  document.addEventListener("keydown", (e) => {
    const drawer = document.getElementById("cart-drawer");
    if (!drawer || !drawer.classList.contains("is-open")) return;
    if (e.key === "Escape") cart.close();
    else J.trapFocus(drawer, e);
  });

  // Mantém várias abas sincronizadas.
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      entries = J.store.get(KEY, []);
      render();
    }
  });

  document.addEventListener("DOMContentLoaded", render);
})();
