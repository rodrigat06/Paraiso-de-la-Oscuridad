// Pinta todos los cantantes: los base y los creados/editados en administrador.
const search = document.querySelector("#artistSearch");
const grid = document.querySelector("#artistGrid");

function artistLink(artist) {
  return artist.page ? `../${artist.page}` : `../artistas/ficha/index.html?artist=${artist.slug}`;
}

function artistCard(artist) {
  const releaseText = ["albums", "eps", "singles"]
    .flatMap((type) => artist.releases[type])
    .flatMap((release) => [release.title, ...release.tracks.map((track) => track[0])])
    .join(" ");
  const text = `${artist.name} ${artist.genre} ${releaseText}`.toLowerCase();
  return `
    <article class="artist-card" data-text="${text}">
      <img src="${window.artistStore.assetUrl(artist.cover, "../")}" alt="${artist.name}">
      <h2>${artist.name}</h2>
      <p>${artist.genre}</p>
      <div class="card-actions">
        <a class="button" href="${artistLink(artist)}">Abrir ficha</a>
        <a class="button secondary" href="../administrador/index.html?artist=${artist.slug}">Editar</a>
      </div>
    </article>
  `;
}

function paintArtists() {
  grid.innerHTML = window.artistStore.allArtists().map(artistCard).join("");
  filterCards();
}

function filterCards() {
  const text = search.value.trim().toLowerCase();
  document.querySelectorAll(".artist-card").forEach((card) => {
    const found = card.dataset.text.includes(text);
    card.hidden = text.length > 0 && !found;
  });
}

search.addEventListener("input", filterCards);
paintArtists();
