// Filtra biografia, albumes y canciones usando el texto de data-item.
const input = document.querySelector("#pageSearch");
const items = document.querySelectorAll("[data-item]");

input.addEventListener("input", () => {
  const query = input.value.trim().toLowerCase();

  items.forEach((item) => {
    const text = item.dataset.item.toLowerCase();
    item.hidden = query.length > 0 && !text.includes(query);
  });
});
