/* ==========================================================================
   pedidos.js — FLUXO DE PEDIDO

   Fluxo:  Cardápio → Produto → Adicionar ao carrinho → Carrinho → Finalizar

   IMPORTANTE (leia antes de apresentar ao cliente):
   - Não há backend nem pagamento. "Finalizar" abre uma conversa no WhatsApp
     com o pedido pré-preenchido, ou abre o pedido online que já existe
     (JHOW.orderUrl). O pedido só existe de verdade quando o Jhow Lanches o
     recebe e confirma por esses canais.
   - O link de pedido online é de terceiros: os itens do carrinho NÃO são
     transferidos para ele automaticamente.
   - O histórico de "Meus Pedidos" é um REGISTRO LOCAL DE DEMONSTRAÇÃO
     (localStorage, por usuário do Clerk). Não é o status real do pedido.
     Com backend, ele viria de uma API. Veja "Backend futuro" no README.
   ========================================================================== */
(function () {
  "use strict";
  const J = window.Jhow;

  const CHANNEL_LABEL = {
    whatsapp: "Enviado pelo WhatsApp",
    online: "Aberto no pedido online"
  };

  const storageKey = () => {
    const id = J.auth && J.auth.userId();
    return id ? `${JHOW.storage.orders}:${id}` : null;
  };

  function list() {
    const key = storageKey();
    if (!key) return [];
    const value = J.store.get(key, []);
    return Array.isArray(value) ? value : [];
  }

  function buildMessage(lines, total) {
    const rows = lines.map(
      (l) => `• ${l.qty}x ${l.item.name}${l.item.price > 0 ? " — " + J.formatBRL(l.total) : ""}`
    );
    const parts = ["Olá! Gostaria de fazer um pedido no Jhow Lanches.", "", ...rows, ""];
    if (total > 0) parts.push(`Total: ${J.formatBRL(total)}`);
    if (JHOW.demoMode) parts.push("(Mensagem de teste do site demonstrativo: itens e preços fictícios.)");
    return parts.join("\n");
  }

  // Registro local (demo). Só para usuários logados.
  function record(channel, lines, total) {
    const key = storageKey();
    if (!key) return;
    const order = {
      id: "PD-" + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
      channel,
      total,
      demo: JHOW.demoMode,
      items: lines.map((l) => ({ id: l.item.id, name: l.item.name, qty: l.qty, price: l.item.price }))
    };
    J.store.set(key, [order, ...list()].slice(0, 30));
    J.emit("jhow:orders-changed");
  }

  const orders = {
    list,
    buildMessage,
    checkout(channel) {
      const lines = J.cart.lines();
      if (!lines.length) {
        J.toast("Seu carrinho está vazio. Adicione um item do cardápio.", { type: "error" });
        return;
      }
      const total = J.cart.subtotal();

      if (channel === "whatsapp") {
        window.open(J.whatsappUrl(buildMessage(lines, total)), "_blank", "noopener");
        J.toast("Abrimos o WhatsApp com o seu pedido. Confirme o envio por lá.", { type: "success", duration: 6000 });
      } else {
        window.open(JHOW.orderUrl, "_blank", "noopener");
        J.toast("Abrimos o pedido online. Os itens do carrinho não são transferidos, escolha por lá.", {
          type: "info",
          duration: 7000
        });
      }
      record(channel, lines, total);
    }
  };
  J.orders = orders;

  /* --------------------------- Página Meus Pedidos --------------------------- */
  function renderPage() {
    const root = document.getElementById("orders-root");
    if (!root) return;

    const status = J.auth.status;
    if (status === "loading") return;

    if (!J.auth.isSignedIn()) {
      const unavailable = status === "unconfigured" || status === "error";
      root.innerHTML = `
        <div class="empty-state">
          ${J.icon("book", 40)}
          <h2>Entre na sua conta para ver seus pedidos</h2>
          <p>${unavailable
            ? "O login ainda não está configurado neste ambiente. Veja o README para conectar o Clerk."
            : "Seus pedidos enviados por este site ficam registrados aqui."}</p>
          <div class="btn-row">
            <a class="btn btn-red" href="login.html">Entrar</a>
            <a class="btn btn-ghost" href="cadastro.html">Criar conta</a>
          </div>
        </div>`;
      return;
    }

    const all = list();
    if (!all.length) {
      root.innerHTML = `
        <div class="empty-state">
          ${J.icon("book", 40)}
          <h2>Nenhum pedido por aqui ainda</h2>
          <p>Quando você finalizar um pedido pelo carrinho, o registro aparece nesta página.</p>
          <a class="btn btn-red" href="cardapio.html">Ver cardápio</a>
        </div>`;
      return;
    }

    root.innerHTML = `
      <ul class="order-list">
        ${all
          .map((o) => {
            const date = new Date(o.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
            return `
            <li class="order-card">
              <div class="order-head">
                <div>
                  <h2 class="order-id">Pedido ${J.escape(o.id)}</h2>
                  <p class="muted">${date}</p>
                </div>
                <span class="chip chip-info">${J.escape(CHANNEL_LABEL[o.channel] || "Enviado")}</span>
              </div>
              <ul class="order-items">
                ${o.items.map((i) => `<li><span>${i.qty}x ${J.escape(i.name)}</span></li>`).join("")}
              </ul>
              <div class="order-foot">
                <strong>${o.total > 0 ? J.formatBRL(o.total) : "Total a definir"}</strong>
                ${o.demo ? '<span class="chip chip-demo">Demo</span>' : ""}
                <button class="btn btn-ghost btn-sm" type="button" data-reorder="${J.escape(o.id)}">Repetir pedido</button>
              </div>
            </li>`;
          })
          .join("")}
      </ul>
      <div class="btn-row">
        <button class="link-btn" type="button" data-orders-clear>Apagar histórico deste navegador</button>
      </div>`;
  }

  document.addEventListener("click", (e) => {
    const reorder = e.target.closest("[data-reorder]");
    if (reorder) {
      const order = list().find((o) => o.id === reorder.dataset.reorder);
      if (!order) return;
      let added = 0;
      order.items.forEach((i) => {
        if (menuItems.some((m) => m.id === i.id) && J.cart.add(i.id, i.qty)) added += 1;
      });
      if (added) {
        J.toast("Itens adicionados ao carrinho.", { type: "success", actionLabel: "Ver carrinho", onAction: J.cart.open });
      } else {
        J.toast("Esses itens não estão mais disponíveis no cardápio.", { type: "error" });
      }
      return;
    }
    if (e.target.closest("[data-orders-clear]")) {
      const key = storageKey();
      if (key && window.confirm("Apagar o histórico de pedidos salvo neste navegador?")) {
        J.store.set(key, []);
        J.emit("jhow:orders-changed");
        renderPage();
      }
    }
  });

  document.addEventListener("jhow:auth-changed", renderPage);
  document.addEventListener("jhow:orders-changed", renderPage);
})();
