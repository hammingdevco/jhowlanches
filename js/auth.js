/* ==========================================================================
   auth.js — AUTENTICAÇÃO COM CLERK

   Usa o SDK oficial do Clerk para JavaScript (clerk-js), carregado pela CDN
   do próprio Clerk. Não existe autenticação própria neste projeto e o
   localStorage NÃO é usado para simular login.

   Fluxo (segue o quickstart atual do Clerk para JavaScript):
     1. Deriva o domínio da Frontend API a partir da Publishable Key.
     2. Carrega  @clerk/ui  e  @clerk/clerk-js  da CDN desse domínio.
     3. Chama Clerk.load({ ui: { ClerkUI: window.__internal_ClerkUICtor } }).
     4. Monta <SignIn/> e <SignUp/> nas páginas login.html e cadastro.html.

   Se a documentação do Clerk mudar, confira:
   https://clerk.com/docs/js-frontend/getting-started/quickstart
   e ajuste APENAS as versões/URLs em CLERK_SCRIPTS abaixo.

   Estados expostos em <html data-auth="...">:
     loading | unconfigured | error | signed-out | signed-in
   Elementos com  data-show-when="estado1 estado2"  só aparecem nesses estados.
   ========================================================================== */
(function () {
  "use strict";
  const J = window.Jhow;

  const KEY = typeof CLERK_PUBLISHABLE_KEY === "string" ? CLERK_PUBLISHABLE_KEY.trim() : "";
  const isConfigured = /^pk_(test|live)_[A-Za-z0-9+/=_-]{8,}$/.test(KEY);

  // Versões carregadas da CDN do Clerk (conforme quickstart atual).
  const CLERK_SCRIPTS = {
    ui: (host) => `https://${host}/npm/@clerk/ui@1/dist/ui.browser.js`,
    js: (host) => `https://${host}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`
  };

  // Aparência do Clerk alinhada ao visual do site.
  const APPEARANCE = {
    variables: {
      colorPrimary: "#d9301a",
      colorBackground: "#2e1b11",
      colorText: "#fff8ee",
      colorTextSecondary: "#dcc6ad",
      colorInputBackground: "#1c100b",
      colorInputText: "#fff8ee",
      colorNeutral: "#fff8ee",
      borderRadius: "12px",
      fontFamily: "Figtree, system-ui, sans-serif"
    },
    elements: {
      card: { boxShadow: "none", border: "1px solid rgba(255,244,228,0.14)" }
    }
  };

  const state = { status: isConfigured ? "loading" : "unconfigured", clerk: null, error: "" };

  let resolveReady;
  const ready = new Promise((resolve) => (resolveReady = resolve));

  /* ------------------------------ API pública ------------------------------ */
  function currentUser() {
    const clerk = state.clerk;
    if (!clerk || !clerk.user) return null;
    const u = clerk.user;
    const email = u.primaryEmailAddress ? u.primaryEmailAddress.emailAddress : "";
    return {
      id: u.id,
      name: u.fullName || u.firstName || u.username || (email ? email.split("@")[0] : "Cliente"),
      email,
      imageUrl: u.imageUrl || ""
    };
  }

  J.auth = {
    ready,
    get status() { return state.status; },
    get isConfigured() { return isConfigured; },
    user: currentUser,
    userId: () => (currentUser() ? currentUser().id : null),
    isSignedIn: () => !!currentUser(),
    async signOut() {
      if (!state.clerk) return;
      try {
        await state.clerk.signOut({ redirectUrl: "index.html" });
      } catch (e) {
        J.toast("Não foi possível sair agora. Tente novamente.", { type: "error" });
      }
    }
  };

  /* ------------------------------ Carregamento ------------------------------ */
  function loadScript(src, attrs) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.crossOrigin = "anonymous";
      Object.entries(attrs || {}).forEach(([k, v]) => s.setAttribute(k, v));
      s.onload = resolve;
      s.onerror = () => reject(new Error("Falha ao carregar " + src));
      document.head.appendChild(s);
    });
  }

  // A Publishable Key é "pk_test_" + base64(domínio da Frontend API + "$").
  function frontendApiHost(key) {
    const host = atob(key.split("_")[2]).slice(0, -1);
    if (!host.includes(".")) throw new Error("Publishable Key inválida.");
    return host;
  }

  async function startClerk() {
    try {
      const host = frontendApiHost(KEY);
      await loadScript(CLERK_SCRIPTS.ui(host));
      await loadScript(CLERK_SCRIPTS.js(host), { "data-clerk-publishable-key": KEY });
      await window.Clerk.load({
        ui: { ClerkUI: window.__internal_ClerkUICtor },
        appearance: APPEARANCE
      });
      state.clerk = window.Clerk;
      state.status = state.clerk.user ? "signed-in" : "signed-out";
      state.clerk.addListener(() => {
        state.status = state.clerk.user ? "signed-in" : "signed-out";
        syncUI();
        J.emit("jhow:auth-changed");
      });
    } catch (err) {
      console.error("[Jhow] Clerk:", err);
      state.status = "error";
      state.error = "Não foi possível carregar o Clerk. Confira a Publishable Key em js/config.js e sua conexão.";
    }
    syncUI();
    mountPageComponents();
    resolveReady(state.status);
    J.emit("jhow:auth-changed");
  }

  /* ---------------------------------- UI ---------------------------------- */
  function syncUI() {
    const user = currentUser();
    document.documentElement.dataset.auth = state.status;

    // Mostra/esconde blocos conforme o estado de autenticação.
    document.querySelectorAll("[data-show-when]").forEach((el) => {
      const states = el.dataset.showWhen.split(/\s+/);
      el.hidden = !states.includes(state.status);
    });

    document.querySelectorAll("[data-auth-error]").forEach((el) => (el.textContent = state.error));

    // Ícone/avatar do header.
    const link = document.getElementById("account-link");
    if (link) {
      if (user) {
        link.href = "conta.html";
        link.setAttribute("aria-label", "Minha conta — " + user.name);
        link.innerHTML = user.imageUrl
          ? `<img class="avatar-sm" src="${J.escape(user.imageUrl)}" alt="" width="32" height="32" referrerpolicy="no-referrer">`
          : J.icon("user");
      } else {
        link.href = "login.html";
        link.setAttribute("aria-label", "Entrar na conta");
        link.innerHTML = J.icon("user");
      }
    }
    document.querySelectorAll("[data-account-text]").forEach((a) => {
      a.textContent = user ? "Minha conta" : "Entrar";
      a.href = user ? "conta.html" : "login.html";
    });

    // Página Minha Conta.
    if (user) {
      document.querySelectorAll("[data-account-name]").forEach((el) => (el.textContent = user.name));
      document.querySelectorAll("[data-account-email]").forEach((el) => (el.textContent = user.email));
      document.querySelectorAll("[data-account-avatar]").forEach((img) => {
        img.src = user.imageUrl;
        img.alt = "Foto de perfil de " + user.name;
      });
      if (J.favorites) {
        document.querySelectorAll("[data-account-fav-count]").forEach((el) => (el.textContent = J.favorites.ids().length));
      }
      if (J.orders) {
        document.querySelectorAll("[data-account-order-count]").forEach((el) => (el.textContent = J.orders.list().length));
      }
    }
  }

  function mountPageComponents() {
    if (state.status === "signed-in" && document.body.dataset.page && /^(login|cadastro)$/.test(document.body.dataset.page)) {
      window.location.replace("conta.html");
      return;
    }
    if (!state.clerk) return;

    const signIn = document.getElementById("clerk-sign-in");
    if (signIn && !state.clerk.user) {
      signIn.replaceChildren();
      state.clerk.mountSignIn(signIn, { signUpUrl: "cadastro.html", fallbackRedirectUrl: "conta.html" });
    }
    const signUp = document.getElementById("clerk-sign-up");
    if (signUp && !state.clerk.user) {
      signUp.replaceChildren();
      state.clerk.mountSignUp(signUp, { signInUrl: "login.html", fallbackRedirectUrl: "conta.html" });
    }
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-signout]")) J.auth.signOut();
  });

  // Atualiza contadores da Minha Conta quando favoritos/pedidos mudam.
  document.addEventListener("jhow:favorites-changed", syncUI);
  document.addEventListener("jhow:orders-changed", syncUI);

  document.addEventListener("DOMContentLoaded", () => {
    syncUI();
    if (isConfigured) startClerk();
    else {
      resolveReady(state.status);
      J.emit("jhow:auth-changed");
    }
  });
})();
