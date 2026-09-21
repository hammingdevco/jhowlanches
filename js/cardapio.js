/* ==========================================================================
   cardapio.js — PRODUTOS, FILTROS E BUSCA

   - J.menuCardHTML(item)  → HTML do card (usado no cardápio, home, produto
                              e favoritos)
   - Página cardapio.html  → categorias, busca, filtro de disponibilidade,
                              ordenação
   - Página index.html     → categorias e destaques

   Os botões "Adicionar" e o coração são tratados por delegação de eventos
   em cart.js e favoritos.js, então funcionam em qualquer lugar onde o card
   seja renderizado.
   Os dados vêm de data.js (menuItems). O carrinho está em cart.js.
   ========================================================================== */
(function () {
  "use strict";
  const J = window.Jhow;

  const categoryLabel = (id) => (menuCategories.find((c) => c.id === id) || {}).label || "";

  J.categoryLabel = categoryLabel;

  J.priceHTML = (item) =>
    item.price > 0
      ? `<span class="price">${J.formatBRL(item.price)}</span>`
      : `<span class="price price-tbd">Preço a definir</span>`;

  J.menuCardHTML = function (item) {
    const name = J.escape(item.name);
    const url = `produto.html?id=${item.id}`;
    const alt = (item.demo ? "Imagem demonstrativa: " : "") + item.name;
    return `
    <article class="menu-card${item.available ? "" : " is-unavailable"}">
      <a class="menu-card-media" href="${url}" tabindex="-1" aria-hidden="true">
        <img src="${J.escape(item.image)}" alt="${J.escape(alt)}" width="480" height="400" loading="lazy">
      </a>
      <div class="menu-card-tags">
        ${item.demo ? '<span class="chip chip-demo">Demo</span>' : ""}
        ${item.available ? "" : '<span class="chip chip-off">Indisponível</span>'}
      </div>
      <button class="fav-btn" type="button" data-fav="${item.id}" data-fav-name="${name}" aria-pressed="false" aria-label="Favoritar ${name}">
        ${J.icon("heart", 20)}
      </button>
      <div class="menu-card-body">
        <p class="menu-card-cat">${J.escape(categoryLabel(item.category))}</p>
        <h3><a href="${url}">${name}</a></h3>
        <p class="menu-card-desc">${J.escape(item.description)}</p>
        <div class="menu-card-foot">
          ${J.priceHTML(item)}
          <button class="btn ${item.available ? "btn-red" : "btn-disabled"} btn-sm" type="button" data-add="${item.id}" ${item.available ? "" : "disabled"}>
            ${item.available ? "Adicionar" : "Indisponível"}
          </button>
        </div>
      </div>
    </article>`;
  };

  /* --------------------------------- Home --------------------------------- */
  function initHome() {
    const tiles = document.getElementById("category-tiles");
    if (tiles) {
      tiles.innerHTML = menuCategories
        .map((cat) => {
          const first = menuItems.find((m) => m.category === cat.id);
          const total = menuItems.filter((m) => m.category === cat.id).length;
          return `
          <li>
            <a class="cat-tile" href="cardapio.html?cat=${cat.id}">
              <img src="${first ? J.escape(first.image) : "assets/images/foto-placeholder.svg"}" alt="" width="120" height="120" loading="lazy">
              <span class="cat-tile-name">${J.escape(cat.label)}</span>
              <span class="cat-tile-count">${total} ${total === 1 ? "item" : "itens"}</span>
            </a>
          </li>`;
        })
        .join("");
    }

    const featured = document.getElementById("featured-grid");
    if (featured) {
      featured.innerHTML = menuItems
        .filter((m) => m.available)
        .slice(0, 4)
        .map((m) => J.menuCardHTML(m))
        .join("");
      if (J.syncFavoriteButtons) J.syncFavoriteButtons();
    }
  }

  /* ----------------------------- Página do cardápio ----------------------------- */
  function initMenuPage() {
    const grid = document.getElementById("menu-grid");
    if (!grid) return;

    const chipsEl = document.getElementById("category-chips");
    const searchEl = document.getElementById("menu-search");
    const sortEl = document.getElementById("menu-sort");
    const availEl = document.getElementById("menu-available");
    const countEl = document.getElementById("menu-count");

    const validCat = (id) => id === "todos" || menuCategories.some((c) => c.id === id);
    const initialCat = J.getParam("cat");
    const state = {
      category: validCat(initialCat) ? initialCat : "todos",
      query: J.getParam("q") || "",
      onlyAvailable: false,
      sort: "default"
    };
    searchEl.value = state.query;

    function renderChips() {
      const all = [{ id: "todos", label: "Todos" }, ...menuCategories];
      chipsEl.innerHTML = all
        .map((cat) => {
          const total = cat.id === "todos" ? menuItems.length : menuItems.filter((m) => m.category === cat.id).length;
          return `<button class="chip-btn" type="button" data-cat="${cat.id}" aria-pressed="${state.category === cat.id}">
            ${J.escape(cat.label)} <span class="chip-count">${total}</span></button>`;
        })
        .join("");
    }

    function filtered() {
      const q = J.normalize(state.query);
      let list = menuItems.filter((m) => {
        if (state.category !== "todos" && m.category !== state.category) return false;
        if (state.onlyAvailable && !m.available) return false;
        if (!q) return true;
        return J.normalize(`${m.name} ${m.description} ${categoryLabel(m.category)}`).includes(q);
      });
      if (state.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
      if (state.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
      if (state.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
      return list;
    }

    function render() {
      const list = filtered();
      renderChips();
      countEl.textContent = list.length === 1 ? "1 item encontrado" : `${list.length} itens encontrados`;

      if (!list.length) {
        grid.innerHTML = `
          <div class="empty-state empty-wide">
            ${J.icon("book", 40)}
            <h3>Nenhum item encontrado</h3>
            <p>Tente outro termo de busca ou remova os filtros.</p>
            <button class="btn btn-ghost" type="button" data-menu-reset>Limpar filtros</button>
          </div>`;
        return;
      }
      grid.innerHTML = list.map((m) => J.menuCardHTML(m)).join("");
      if (J.syncFavoriteButtons) J.syncFavoriteButtons();
    }

    chipsEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cat]");
      if (!btn) return;
      state.category = btn.dataset.cat;
      render();
    });
    searchEl.addEventListener("input", J.debounce(() => {
      state.query = searchEl.value;
      render();
    }, 150));
    sortEl.addEventListener("change", () => { state.sort = sortEl.value; render(); });
    availEl.addEventListener("change", () => { state.onlyAvailable = availEl.checked; render(); });
    grid.addEventListener("click", (e) => {
      if (!e.target.closest("[data-menu-reset]")) return;
      Object.assign(state, { category: "todos", query: "", onlyAvailable: false, sort: "default" });
      searchEl.value = "";
      sortEl.value = "default";
      availEl.checked = false;
      render();
    });
    document.getElementById("menu-search-form").addEventListener("submit", (e) => e.preventDefault());

    render();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHome();
    initMenuPage();
  });
})();
