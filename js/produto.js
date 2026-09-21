/* ==========================================================================
   produto.js — PÁGINA INDIVIDUAL DO PRODUTO

   Lê o id da URL (produto.html?id=1), busca o item em menuItems (data.js) e
   monta a página. Adicionar ao carrinho e favoritar são tratados por
   cart.js e favoritos.js (delegação de eventos).
   ========================================================================== */
(function () {
  "use strict";
  const J = window.Jhow;

  function notFound(root) {
    document.title = `Produto não encontrado | ${JHOW.name}`;
    root.innerHTML = `
      <div class="empty-state">
        ${J.icon("book", 40)}
        <h1 class="h2">Não encontramos este produto</h1>
        <p>O link pode estar desatualizado ou o item saiu do cardápio.</p>
        <a class="btn btn-red" href="cardapio.html">Voltar ao cardápio</a>
      </div>`;
  }

  function init() {
    const root = document.getElementById("product-root");
    if (!root) return;

    const id = Number(J.getParam("id"));
    const item = menuItems.find((m) => m.id === id);
    if (!item) return notFound(root);

    document.title = `${item.name} | ${JHOW.name}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", `${item.name} no ${JHOW.name}, em Juiz de Fora.`);

    const name = J.escape(item.name);
    const alt = (item.demo ? "Imagem demonstrativa: " : "") + item.name;

    root.innerHTML = `
      <nav class="breadcrumb" aria-label="Você está em">
        <a href="cardapio.html">Cardápio</a>
        <span aria-hidden="true">/</span>
        <a href="cardapio.html?cat=${item.category}">${J.escape(J.categoryLabel(item.category))}</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">${name}</span>
      </nav>

      <div class="product">
        <div class="product-media">
          <img src="${J.escape(item.image)}" alt="${J.escape(alt)}" width="640" height="520">
          <div class="menu-card-tags">
            ${item.demo ? '<span class="chip chip-demo">Demo</span>' : ""}
            ${item.available ? "" : '<span class="chip chip-off">Indisponível</span>'}
          </div>
        </div>

        <div class="product-info">
          <p class="muted">${J.escape(J.categoryLabel(item.category))}</p>
          <h1 class="h2">${name}</h1>
          <p class="product-desc">${J.escape(item.description)}</p>
          <p class="product-price">${J.priceHTML(item)}</p>
          ${item.demo ? '<p class="fine-print">Produto e preço demonstrativos. Substitua pelo cardápio real em <code>js/data.js</code>.</p>' : ""}

          <div class="product-buy">
            <div class="qty qty-lg" role="group" aria-label="Quantidade">
              <button type="button" data-qty-step="-1" aria-label="Diminuir quantidade">${J.icon("minus", 18)}</button>
              <input type="number" id="product-qty" data-qty-input min="1" max="20" value="1" inputmode="numeric" aria-label="Quantidade">
              <button type="button" data-qty-step="1" aria-label="Aumentar quantidade">${J.icon("plus", 18)}</button>
            </div>
            <button class="btn btn-red btn-lg" type="button" data-add="${item.id}" data-use-qty ${item.available ? "" : "disabled"}>
              ${item.available ? "Adicionar ao carrinho" : "Indisponível"}
            </button>
            <button class="fav-btn fav-btn-inline" type="button" data-fav="${item.id}" data-fav-name="${name}" aria-pressed="false" aria-label="Favoritar ${name}">
              ${J.icon("heart", 22)}
            </button>
          </div>

          <div class="btn-row">
            <button class="btn btn-ghost" type="button" id="whatsapp-single" ${item.available ? "" : "disabled"}>
              ${J.iconWhatsApp(20)} Pedir só este item pelo WhatsApp
            </button>
            <a class="btn btn-ghost" href="cardapio.html">Ver cardápio completo</a>
          </div>
        </div>
      </div>`;

    // Quantidade
    const qtyInput = document.getElementById("product-qty");
    const clamp = () => {
      const n = Math.max(1, Math.min(20, Number(qtyInput.value) || 1));
      qtyInput.value = n;
      return n;
    };
    qtyInput.addEventListener("change", clamp);
    root.querySelectorAll("[data-qty-step]").forEach((btn) =>
      btn.addEventListener("click", () => {
        qtyInput.value = Number(qtyInput.value || 1) + Number(btn.dataset.qtyStep);
        clamp();
      })
    );

    // Pedido rápido só deste item
    const single = document.getElementById("whatsapp-single");
    single.addEventListener("click", () => {
      const qty = clamp();
      const total = item.price * qty;
      const lines = [
        "Olá! Gostaria de fazer um pedido no Jhow Lanches.",
        "",
        `• ${qty}x ${item.name}${item.price > 0 ? " — " + J.formatBRL(total) : ""}`
      ];
      if (JHOW.demoMode) lines.push("", "(Mensagem de teste do site demonstrativo: item e preço fictícios.)");
      window.open(J.whatsappUrl(lines.join("\n")), "_blank", "noopener");
    });

    // Relacionados
    const related = menuItems.filter((m) => m.category === item.category && m.id !== item.id).slice(0, 3);
    const relatedSection = document.getElementById("related-section");
    const relatedGrid = document.getElementById("related-grid");
    if (related.length && relatedSection && relatedGrid) {
      relatedGrid.innerHTML = related.map((m) => J.menuCardHTML(m)).join("");
      relatedSection.hidden = false;
    }
    if (J.syncFavoriteButtons) J.syncFavoriteButtons();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
