/* ==========================================================================
   home.js — SEÇÕES DA HOME: GALERIA E AVALIAÇÕES

   - Galeria: lê galleryItems (data.js). Para usar fotos oficiais, troque
     "src"/"alt" lá e remova "demo: true".
   - Avaliações: lê customerReviews (data.js), que contém somente as
     avaliações reais fornecidas pelo cliente.
   ========================================================================== */
(function () {
  "use strict";
  const J = window.Jhow;

  function renderGallery() {
    const grid = document.getElementById("gallery-grid");
    if (!grid) return;
    grid.innerHTML = galleryItems
      .map(
        (g) => `
        <figure class="gallery-item gallery-${J.escape(g.size || "sq")}">
          <img src="${J.escape(g.src)}" alt="${J.escape(g.alt)}" width="640" height="480" loading="lazy">
          <figcaption>
            <span>${J.escape(g.caption)}</span>
            ${g.demo ? '<span class="chip chip-demo">Foto demonstrativa</span>' : ""}
          </figcaption>
        </figure>`
      )
      .join("");
  }

  function renderReviews() {
    const list = document.getElementById("reviews-list");
    if (!list) return;
    list.innerHTML = customerReviews
      .map(
        (r) => `
        <li class="review-card">
          <blockquote><p>“${J.escape(r.text)}”</p></blockquote>
          <p class="review-by">Avaliação de cliente</p>
        </li>`
      )
      .join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderGallery();
    renderReviews();
  });
})();
