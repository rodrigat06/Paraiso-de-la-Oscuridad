// Busca dentro de las tarjetas existentes sin recargar la pagina.
const search = document.querySelector("#artistSearch");
const cards = document.querySelectorAll(".artist-card");
const savedBox = document.querySelector("#savedArtists");

function filterCards() {
  const text = search.value.trim().toLowerCase();

  cards.forEach((card) => {
    const found = card.dataset.text.includes(text);
    card.hidden = text.length > 0 && !found;
  });
}

function paintSavedArtists() {
  const saved = JSON.parse(localStorage.getItem("famous-artists") || "[]");

  if (saved.length === 0) {
    savedBox.innerHTML = "<p class='muted'>Todavia no has añadido ningun cantante famoso.</p>";
    return;
  }

  savedBox.innerHTML = saved.map((artist) => `
    <article class="mini-card">
      <strong>${artist.name}</strong>
      <span>${artist.genre}</span>
    </article>
  `).join("");
}

search.addEventListener("input", filterCards);
paintSavedArtists();
