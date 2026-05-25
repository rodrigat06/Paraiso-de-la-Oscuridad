// JS minimo de la version simple.
// Solo filtra listas y escribe el año del footer; no hay animaciones.
(function () {
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  document.querySelectorAll("[data-filter]").forEach((input) => {
    const target = document.querySelector(input.dataset.filter);
    if (!target) return;

    input.addEventListener("input", () => {
      const query = input.value.trim().toLowerCase();
      target.querySelectorAll("[data-item]").forEach((item) => {
        item.hidden = query && !item.textContent.toLowerCase().includes(query);
      });
    });
  });
})();
