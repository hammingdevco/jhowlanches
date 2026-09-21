/* ==========================================================================
   contato.js — FORMULÁRIO DA PÁGINA DE CONTATO

   Não há backend para receber formulários. Por isso o formulário valida os
   campos e abre o WhatsApp do Jhow Lanches com a mensagem pré-preenchida.
   Nada é armazenado nem enviado a servidores.
   ========================================================================== */
(function () {
  "use strict";
  const J = window.Jhow;

  function init() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const fields = {
      name: { el: form.elements.namedItem("name"), min: 2, message: "Informe seu nome (mínimo 2 letras)." },
      message: { el: form.elements.namedItem("message"), min: 5, message: "Escreva sua mensagem (mínimo 5 caracteres)." }
    };
    const status = document.getElementById("contact-status");
    const submit = form.querySelector('button[type="submit"]');

    function setError(key, hasError) {
      const { el, message } = fields[key];
      const errorEl = document.getElementById(`error-${key}`);
      el.setAttribute("aria-invalid", String(hasError));
      errorEl.textContent = hasError ? message : "";
    }

    Object.keys(fields).forEach((key) =>
      fields[key].el.addEventListener("input", () => {
        if (fields[key].el.getAttribute("aria-invalid") === "true" && fields[key].el.value.trim().length >= fields[key].min) {
          setError(key, false);
        }
      })
    );

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let firstInvalid = null;
      Object.keys(fields).forEach((key) => {
        const invalid = fields[key].el.value.trim().length < fields[key].min;
        setError(key, invalid);
        if (invalid && !firstInvalid) firstInvalid = fields[key].el;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        status.textContent = "Corrija os campos destacados.";
        return;
      }

      const name = fields.name.el.value.trim();
      const text = fields.message.el.value.trim();
      const message = `Olá! Aqui é ${name}.\n\n${text}`;

      // Estado de carregamento
      submit.disabled = true;
      submit.dataset.label = submit.textContent;
      submit.textContent = "Abrindo o WhatsApp…";
      status.textContent = "Abrindo o WhatsApp com a sua mensagem.";

      setTimeout(() => {
        window.open(J.whatsappUrl(message), "_blank", "noopener");
        submit.disabled = false;
        submit.textContent = submit.dataset.label;
        status.textContent = "Se o WhatsApp não abriu, use o botão “Pedir pelo WhatsApp” acima.";
        form.reset();
      }, 400);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
