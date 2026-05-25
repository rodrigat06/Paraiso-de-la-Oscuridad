// Guarda propuestas en localStorage para que aparezcan en Explorar.
const form = document.querySelector("#artistForm");
const savedList = document.querySelector("#savedList");
const message = document.querySelector("#message");

function getSaved() {
  return JSON.parse(localStorage.getItem("famous-artists") || "[]");
}

function saveArtists(artists) {
  localStorage.setItem("famous-artists", JSON.stringify(artists));
}

function renderSaved() {
  const artists = getSaved();

  if (artists.length === 0) {
    savedList.innerHTML = "<p class='muted'>No has añadido ninguno todavia.</p>";
    return;
  }

  savedList.innerHTML = artists.map((artist) => `
    <article class="mini-card">
      <strong>${artist.name}</strong>
      <span>${artist.genre}</span>
      <small>${artist.note || "Sin nota"}</small>
    </article>
  `).join("");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const [name, genre] = form.artist.value.split("|");
  const artists = getSaved();
  const exists = artists.some((artist) => artist.name === name);

  if (!exists) {
    artists.push({ name, genre, note: form.note.value.trim() });
    saveArtists(artists);
  }

  message.textContent = exists ? "Ese cantante ya estaba guardado." : "Cantante añadido.";
  form.note.value = "";
  renderSaved();
});

renderSaved();
