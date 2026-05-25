// Pinta todos los cantantes: los base y los creados/editados en administrador.
const search = document.querySelector("#artistSearch");
const grid = document.querySelector("#artistGrid");
const imagePlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='%23090105'/%3E%3Cpath d='M20 20h120v120H20z' fill='none' stroke='%23ff79a7' stroke-width='6'/%3E%3Ctext x='80' y='88' text-anchor='middle' fill='%2364dcff' font-size='14' font-family='monospace'%3EARTISTA%3C/text%3E%3C/svg%3E";

function artistLink(artist) {
  return artist.page ? `../${artist.page}` : `../artistas/ficha/index.html?artist=${artist.slug}`;
}

function imageAttributes(path, alt) {
  if (window.artistMedia?.isMediaRef(path)) {
    return `src="${imagePlaceholder}" data-media-src="${path}" alt="${alt}"`;
  }

  return `src="${window.artistStore.assetUrl(path, "../")}" alt="${alt}"`;
}

function artistCard(artist) {
  const releaseText = ["albums", "eps", "singles"]
    .flatMap((type) => artist.releases[type])
    .flatMap((release) => [release.title, ...release.tracks.map((track) => track[0])])
    .join(" ");
  const text = `${artist.name} ${artist.genre} ${releaseText}`.toLowerCase();
  return `
    <article class="artist-card" data-text="${text}">
      <img ${imageAttributes(artist.cover, artist.name)}>
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
  window.artistMedia?.hydrate(grid);
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
