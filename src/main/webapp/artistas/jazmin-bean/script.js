// Esta pagina pinta Jazmin desde el mismo sistema que usa el administrador.
const artist = window.artistStore.findArtist("jazmin-bean");
const prefix = "../../";

document.querySelector("h1").textContent = artist.name;
document.querySelector(".eyebrow").textContent = artist.genre;
document.querySelector(".hero-copy p:last-child").textContent = artist.bio;
document.querySelector(".portrait").src = window.artistStore.assetUrl(artist.cover, prefix);

function trackTemplate(track) {
  const [title, audio, cover] = track;
  return `
    <article class="track" data-item="${title.toLowerCase()}">
      <div class="vinyl-box">
        <img src="${window.artistStore.assetUrl(cover, prefix)}" alt="${title}">
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
            <img src="${window.artistStore.assetUrl(release.cover, prefix)}" alt="${release.title}">
            <span><strong>${release.title}</strong><small>${release.note}</small></span>
          </summary>
          <div class="music-list">
            ${release.tracks.length ? release.tracks.map(trackTemplate).join("") : "<p>Sin canciones todavia.</p>"}
          </div>
        </details>
      `).join("")}
    </div>
  `;
}

renderSection("albums", "Albumes", artist.releases.albums);
renderSection("eps", "EPs", artist.releases.eps);
renderSection("singles", "Singles", artist.releases.singles);

document.querySelector("#pageSearch").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  document.querySelectorAll(".release").forEach((release) => {
    release.hidden = query.length > 0 && !release.dataset.item.includes(query);
  });
});
