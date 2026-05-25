// Ficha dinamica para cantantes creados o editados desde administrador.
const slug = new URLSearchParams(location.search).get("artist");
const artist = window.artistStore.findArtist(slug);
const prefix = "../../";

if (!artist) {
  document.querySelector(".page").innerHTML = "<section class='panel'><h1>No existe este cantante</h1><p>Crealo desde Administrador.</p></section>";
} else {
  document.title = `${artist.name} - Paraiso de la Oscuridad`;
  document.querySelector("[data-artist-name]").textContent = artist.name;
  document.querySelector("[data-artist-title]").textContent = artist.name;
  document.querySelector("[data-artist-genre]").textContent = artist.genre;
  document.querySelector("[data-artist-bio]").textContent = artist.bio;
  document.querySelector("[data-artist-cover]").src = window.artistStore.assetUrl(artist.cover, prefix);
  document.querySelector("#editLink").href = `../../administrador/index.html?artist=${artist.slug}`;

  renderSection("albums", "Albumes", artist.releases.albums);
  renderSection("eps", "EPs", artist.releases.eps);
  renderSection("singles", "Singles", artist.releases.singles);
}

function trackTemplate(track) {
  const [title, audio, cover] = track;
  return `
    <article class="track" data-item="${title.toLowerCase()}">
      <div class="vinyl-box">
        <img src="${window.artistStore.assetUrl(cover || artist.cover, prefix)}" alt="${title}">
        <span class="vinyl" aria-hidden="true"></span>
      </div>
      <div>
        <h3>${title}</h3>
        ${audio ? `<audio controls preload="none"><source src="${window.artistStore.assetUrl(audio, prefix)}" type="audio/mpeg"></audio>` : "<p>Audio pendiente.</p>"}
      </div>
    </article>
  `;
}

function renderSection(id, title, releases) {
  document.querySelector(`#${id}`).innerHTML = `
    <h2>${title}</h2>
    <div class="release-list">
      ${releases.map((release, index) => `
        <details class="release" ${index === 0 ? "open" : ""} data-item="${release.title.toLowerCase()} ${release.tracks.map((track) => track[0]).join(" ").toLowerCase()}">
          <summary class="release-head">
            <img src="${window.artistStore.assetUrl(release.cover || artist.cover, prefix)}" alt="${release.title}">
            <span><strong>${release.title}</strong><small>${release.note || ""}</small></span>
          </summary>
          <div class="music-list">
            ${release.tracks.length ? release.tracks.map(trackTemplate).join("") : "<p>Sin canciones todavia.</p>"}
          </div>
        </details>
      `).join("")}
    </div>
  `;
}

document.querySelector("#pageSearch")?.addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  document.querySelectorAll(".release").forEach((release) => {
    release.hidden = query.length > 0 && !release.dataset.item.includes(query);
  });
});
