// Filtra cualquier bloque que tenga data-item dentro de la ficha del artista.
const input = document.querySelector("#pageSearch");
const items = document.querySelectorAll("[data-item]");

input.addEventListener("input", () => {
  const query = input.value.trim().toLowerCase();

  items.forEach((item) => {
    const text = item.dataset.item.toLowerCase();
    item.hidden = query.length > 0 && !text.includes(query);
  });
});
