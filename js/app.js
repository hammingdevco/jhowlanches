/* ==========================================================================
   app.js — FUNÇÕES GLOBAIS

   - Utilitários (formatação, storage seguro, links de WhatsApp e mapa)
   - Componentes compartilhados: header, footer, barra inferior mobile,
     gaveta do carrinho (estrutura) e avisos (toasts)
   - Eventos internos: "jhow:auth-changed", "jhow:cart-changed",
     "jhow:favorites-changed"

   Header e footer ficam num único lugar (aqui) para não repetir HTML em
   todas as páginas. Cada página só precisa de:
     <div id="site-header"></div> ... <div id="site-footer"></div>
   ========================================================================== */
(function () {
  "use strict";
  const J = window.Jhow;

  /* ----------------------------- Utilitários ----------------------------- */
  J.formatBRL = (value) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  J.escape = (text) =>
    String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Remove acentos e caixa (busca "pao" encontra "Pão").
  J.normalize = (text) =>
    String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  J.debounce = (fn, wait = 200) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  // Storage seguro: não quebra o site se o navegador bloquear o localStorage.
  // FRONTEND / DEMO — em produção, dados de usuário devem ficar em um backend.
  J.store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    }
  };

  J.emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));

  J.addressLines = () => {
    const a = JHOW.address;
    return [a.street, a.district, `${a.city} — ${a.state}`, a.zip];
  };

  J.mapsUrl = () => {
    const a = JHOW.address;
    const query = `${a.street}, ${a.district}, ${a.city} - ${a.state}, ${a.zip}`;
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
  };

  J.whatsappUrl = (message) =>
    `https://wa.me/${JHOW.whatsappNumber}?text=${encodeURIComponent(message || JHOW.whatsappDefaultMessage)}`;

  J.getParam = (name) => new URLSearchParams(window.location.search).get(name);

  /* -------------------------------- Ícones -------------------------------- */
  const PATHS = {
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14"/>',
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    utensils: '<path d="M4 3v7a3 3 0 0 0 3 3v8M7 3v6M10 3v7a3 3 0 0 1-3 3M17 21V3c-2.5 1.5-3.5 4.5-3.5 8H17"/>',
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    book: '<path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h12"/>'
  };

  J.icon = (name, size = 22) =>
    `<svg class="icon" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${PATHS[name] || ""}</svg>`;

  J.iconWhatsApp = (size = 20) =>
    `<svg class="icon" viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.38A9.9 9.9 0 1 0 12.04 2zm0 1.8a8.1 8.1 0 1 1-4.13 15.1l-.3-.17-3.11.82.83-3.03-.2-.31A8.1 8.1 0 0 1 12.04 3.8zM8.6 7.6c-.17 0-.45.06-.69.32-.24.26-.9.88-.9 2.15s.92 2.5 1.05 2.67c.13.17 1.8 2.86 4.45 3.9 2.2.87 2.65.7 3.13.65.48-.04 1.55-.63 1.77-1.24.22-.6.22-1.13.15-1.24-.06-.1-.24-.17-.5-.3-.27-.13-1.55-.77-1.8-.86-.24-.09-.42-.13-.59.13-.17.27-.68.86-.83 1.03-.15.17-.3.2-.57.07-.26-.13-1.1-.4-2.1-1.3-.78-.7-1.3-1.55-1.45-1.8-.15-.27-.02-.4.11-.53.12-.12.27-.31.4-.47.13-.15.17-.27.26-.44.09-.18.04-.33-.02-.46-.07-.13-.6-1.42-.82-1.95-.2-.5-.42-.43-.59-.44z"/></svg>`;

  J.iconStar = (size = 20) =>
    `<svg class="icon" viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.100 7 14.200 2 9.300l6.9-1z"/></svg>`;

  /* ------------------------------ Toasts (avisos) ------------------------------ */
  J.toast = function (message, opts = {}) {
    const region = document.querySelector(".toast-region");
    if (!region) return;
    const { type = "info", actionLabel, actionHref, onAction, duration = 4500 } = opts;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    const text = document.createElement("span");
    text.className = "toast-text";
    text.textContent = message;
    toast.appendChild(text);

    if (actionLabel) {
      const action = actionHref ? document.createElement("a") : document.createElement("button");
      action.className = "toast-action";
      action.textContent = actionLabel;
      if (actionHref) {
        action.href = actionHref;
      } else {
        action.type = "button";
        action.addEventListener("click", () => {
          if (onAction) onAction();
          toast.remove();
        });
      }
      toast.appendChild(action);
    }

    region.appendChild(toast);
    while (region.children.length > 3) region.firstChild.remove();
    setTimeout(() => toast.remove(), duration);
  };

  /* ------------------------------ Componentes ------------------------------ */
  const NAV = [
    { key: "inicio",     label: "Início",      href: "index.html" },
    { key: "cardapio",   label: "Cardápio",    href: "cardapio.html" },
    { key: "sobre",      label: "Sobre",       href: "index.html#sobre" },
    { key: "avaliacoes", label: "Avaliações",  href: "index.html#avaliacoes" },
    { key: "contato",    label: "Contato",     href: "contato.html" }
  ];

  function headerHTML(page) {
    const links = NAV.map((n) => {
      const current = n.key === page ? ' aria-current="page"' : "";
      return `<li><a href="${n.href}"${current}>${n.label}</a></li>`;
    }).join("");

    return `
    <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header class="site-header" id="site-header-bar">
      <div class="container header-inner">
        <a class="brand" href="index.html" aria-label="${JHOW.name} — página inicial">
          <img src="assets/icons/logo.svg" alt="" width="40" height="40">
          <span class="brand-name">${JHOW.name}</span>
        </a>

        <nav class="main-nav" id="main-nav" aria-label="Principal">
          <ul>
            ${links}
            <li class="only-mobile"><a href="favoritos.html"${page === "favoritos" ? ' aria-current="page"' : ""}>Favoritos</a></li>
            <li class="only-mobile"><a href="conta.html" data-account-text>Minha conta</a></li>
            <li class="only-mobile"><a class="btn btn-mustard" href="${JHOW.orderUrl}" target="_blank" rel="noopener">Pedir agora</a></li>
          </ul>
        </nav>

        <div class="header-actions">
          <a class="icon-btn hide-mobile" href="favoritos.html" aria-label="Favoritos">
            ${J.icon("heart")}<span class="badge" data-fav-count hidden>0</span>
          </a>
          <a class="icon-btn hide-mobile" id="account-link" href="login.html" aria-label="Minha conta">
            ${J.icon("user")}
          </a>
          <button class="icon-btn" type="button" id="cart-toggle" aria-label="Abrir carrinho" aria-controls="cart-drawer" aria-expanded="false">
            ${J.icon("bag")}<span class="badge" data-cart-count hidden>0</span>
          </button>
          <a class="btn btn-mustard btn-sm hide-mobile" href="${JHOW.orderUrl}" target="_blank" rel="noopener">Pedir agora</a>
          <button class="icon-btn nav-toggle" type="button" id="nav-toggle" aria-label="Abrir menu" aria-controls="main-nav" aria-expanded="false">
            ${J.icon("menu")}
          </button>
        </div>
      </div>
    </header>`;
  }

  function footerHTML() {
    const [street, district, city, zip] = J.addressLines();
    return `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-brand">
          <a class="brand" href="index.html" aria-label="${JHOW.name} — página inicial">
            <img src="assets/icons/logo.svg" alt="" width="40" height="40">
            <span class="brand-name">${JHOW.name}</span>
          </a>
          <p>Lanches, sabor e aquele toque especial.</p>
        </div>
        <nav aria-label="Rodapé">
          <h2 class="footer-title">Links</h2>
          <ul class="footer-list">
            <li><a href="index.html">Início</a></li>
            <li><a href="cardapio.html">Cardápio</a></li>
            <li><a href="index.html#avaliacoes">Avaliações</a></li>
            <li><a href="contato.html">Contato</a></li>
            <li><a href="favoritos.html">Favoritos</a></li>
          </ul>
        </nav>
        <div>
          <h2 class="footer-title">Contato</h2>
          <address class="footer-address">
            <a href="${JHOW.phoneHref}">${JHOW.phoneDisplay}</a>
            <span>${street}</span>
            <span>${district}</span>
            <span>${city}</span>
            <span>${zip}</span>
          </address>
        </div>
      </div>
      <div class="container footer-bottom">
        <p>© 2026 Jhow Lanches. Todos os direitos reservados.</p>
      </div>
    </footer>`;
  }

  function extrasHTML() {
    return `
    <div class="drawer-overlay" id="drawer-overlay" hidden></div>
    <aside class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" tabindex="-1" inert>
      <div class="drawer-head">
        <h2 id="cart-title">Seu carrinho</h2>
        <button class="icon-btn" type="button" data-cart-close aria-label="Fechar carrinho">${J.icon("close")}</button>
      </div>
      <div class="drawer-body" id="cart-body"></div>
      <div class="drawer-foot" id="cart-foot"></div>
    </aside>
    <nav class="mobile-bar" aria-label="Ações rápidas">
      <a href="cardapio.html">${J.icon("book", 20)}<span>Cardápio</span></a>
      <a href="${JHOW.orderUrl}" target="_blank" rel="noopener">${J.icon("bag", 20)}<span>Pedir</span></a>
      <a href="${J.whatsappUrl()}" target="_blank" rel="noopener">${J.iconWhatsApp(20)}<span>WhatsApp</span></a>
    </nav>
    <div class="toast-region" role="status" aria-live="polite"></div>`;
  }

  /* --------------------------- Montagem e eventos --------------------------- */
  function init() {
    const page = document.body.dataset.page || "";

    const headerSlot = document.getElementById("site-header");
    const footerSlot = document.getElementById("site-footer");
    if (headerSlot) headerSlot.outerHTML = headerHTML(page);
    if (footerSlot) footerSlot.outerHTML = footerHTML();
    document.body.insertAdjacentHTML("beforeend", extrasHTML());

    // Links de ação: o HTML traz um href de segurança e aqui ele é sincronizado com js/config.js.
    const linkMap = {
      maps: () => J.mapsUrl(),
      whatsapp: () => J.whatsappUrl(),
      order: () => JHOW.orderUrl,
      tel: () => JHOW.phoneHref
    };
    document.querySelectorAll("[data-link]").forEach((a) => {
      const build = linkMap[a.dataset.link];
      if (build) a.href = build();
    });

    // Avisos que só existem enquanto o cardápio for demonstrativo (JHOW.demoMode).
    document.querySelectorAll("[data-demo-only]").forEach((el) => (el.hidden = !JHOW.demoMode));

    const bar = document.getElementById("site-header-bar");
    const navToggle = document.getElementById("nav-toggle");

    const setNav = (open) => {
      if (!bar || !navToggle) return;
      bar.classList.toggle("nav-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      navToggle.innerHTML = J.icon(open ? "close" : "menu");
    };

    if (navToggle) {
      navToggle.addEventListener("click", () => setNav(!bar.classList.contains("nav-open")));
      document.getElementById("main-nav").addEventListener("click", (e) => {
        if (e.target.closest("a")) setNav(false);
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && bar.classList.contains("nav-open")) {
          setNav(false);
          navToggle.focus();
        }
      });
      window.matchMedia("(min-width: 900px)").addEventListener("change", (e) => {
        if (e.matches) setNav(false);
      });
    }

    // Sombra/borda do header só depois de rolar.
    const onScroll = () => bar && bar.classList.toggle("is-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Focus trap simples para a gaveta do carrinho.
  J.trapFocus = function (container, event) {
    if (event.key !== "Tab") return;
    const focusable = container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  document.addEventListener("DOMContentLoaded", init);
})();
