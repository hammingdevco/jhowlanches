/* ==========================================================================
   favoritos.js — FAVORITOS (FRONTEND / DEMO)

   - Só usuários logados no Clerk podem favoritar.
   - Os favoritos ficam no localStorage deste navegador, associados ao id do
     usuário do Clerk:  jhow_favorites_v1:<userId>
   - Isso NÃO substitui um banco de dados: os favoritos não acompanham o
     usuário em outro dispositivo/navegador. Veja "Backend futuro" no README.
   ========================================================================== */
(function () {
  "use strict";
  const J = window.Jhow;

  const storageKey = () => {
    const id = J.auth && J.auth.userId();
    return id ? `${JHOW.storage.favorites}:${id}` : null;
  };

  function ids() {
    const key = storageKey();
    if (!key) return [];
    const value = J.store.get(key, []);
    return Array.isArray(value) ? value.filter((v) => Number.isInteger(v) && menuItems.some((m) => m.id === v)) : [];
  }

  const favorites = {
    ids,
    has: (id) => ids().includes(Number(id)),
    count: () => ids().length,
    /** Retorna true/false (novo estado) ou null se o usuário não está logado. */
    toggle(id) {
      id = Number(id);
      if (!J.auth.isSignedIn()) {
        J.toast("Entre na sua conta para salvar seus favoritos.", {
          type: "info",
          actionLabel: "Entrar",
          actionHref: "login.html"
        });
        return null;
      }
      const current = ids();
      const isFav = current.includes(id);
      const next = isFav ? current.filter((x) => x !== id) : [...current, id];
      J.store.set(storageKey(), next);
      J.emit("jhow:favorites-changed", { id, active: !isFav });
      return !isFav;
    }
  };
  J.favorites = favorites;

  /* ----------------------------- Sincronia da UI ----------------------------- */
  function syncButtons() {
    const list = ids();
    document.querySelectorAll("[data-fav]").forEach((btn) => {
      const id = Number(btn.dataset.fav);
      const active = list.includes(id);
      const name = btn.dataset.favName || "produto";
      btn.classList.toggle("is-fav", active);
      btn.setAttribute("aria-pressed", String(active));
      btn.setAttribute("aria-label", active ? `Remover ${name} dos favoritos` : `Favoritar ${name}`);
    });
    document.querySelectorAll("[data-fav-count]").forEach((badge) => {
      badge.textContent = list.length;
      badge.hidden = list.length === 0;
    });
  }
  J.syncFavoriteButtons = syncButtons;

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-fav]");
    if (!btn) return;
    e.preventDefault();
    const result = favorites.toggle(btn.dataset.fav);
    if (result === null) return;
    btn.classList.remove("pop");
    void btn.offsetWidth;
    btn.classList.add("pop");
    J.toast(result ? "Adicionado aos favoritos." : "Removido dos favoritos.", { type: "success", duration: 2500 });
  });

  /* ------------------------------ Página Favoritos ------------------------------ */
  function renderPage() {
    const root = document.getElementById("favorites-root");
    if (!root) return;

    const status = J.auth.status;
    if (status === "loading") return; // esqueleto do HTML continua visível

    if (!J.auth.isSignedIn()) {
      const unavailable = status === "unconfigured" || status === "error";
      root.innerHTML = `
        <div class="empty-state">
          ${J.icon("heart", 40)}
          <h2>Entre na sua conta para ver seus favoritos</h2>
          <p>${unavailable
            ? "O login ainda não está configurado neste ambiente. Veja o README para conectar o Clerk."
            : "Com uma conta, você salva os lanches que mais gosta e os encontra aqui."}</p>
          <div class="btn-row">
            <a class="btn btn-red" href="login.html">Entrar</a>
            <a class="btn btn-ghost" href="cadastro.html">Criar conta</a>
          </div>
        </div>`;
      return;
    }

    const items = ids().map((id) => menuItems.find((m) => m.id === id)).filter(Boolean);
    if (!items.length) {
      root.innerHTML = `
        <div class="empty-state">
          ${J.icon("heart", 40)}
          <h2>Você ainda não tem favoritos</h2>
          <p>Toque no coração de um lanche do cardápio para salvá-lo aqui.</p>
          <a class="btn btn-red" href="cardapio.html">Ver cardápio</a>
        </div>`;
      return;
    }

    root.innerHTML = `<div class="menu-grid">${items.map((item) => J.menuCardHTML(item)).join("")}</div>`;
    syncButtons();
  }

  document.addEventListener("jhow:auth-changed", () => { syncButtons(); renderPage(); });
  document.addEventListener("jhow:favorites-changed", () => { syncButtons(); renderPage(); });
  window.addEventListener("storage", () => { syncButtons(); renderPage(); });
  document.addEventListener("DOMContentLoaded", syncButtons);
})();
