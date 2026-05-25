// Ficha dinamica para cantantes creados o editados desde administrador.
const slug = new URLSearchParams(location.search).get("artist");
const artist = window.artistStore.findArtist(slug);
const prefix = "../../";
const imagePlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='%23090105'/%3E%3Cpath d='M20 20h120v120H20z' fill='none' stroke='%23ff79a7' stroke-width='6'/%3E%3Ctext x='80' y='88' text-anchor='middle' fill='%2364dcff' font-size='14' font-family='monospace'%3EPORTADA%3C/text%3E%3C/svg%3E";

if (!artist) {
  document.querySelector(".page").innerHTML = "<section class='panel'><h1>No existe este cantante</h1><p>Crealo desde Administrador.</p></section>";
} else {
  document.title = `${artist.name} - Paraiso de la Oscuridad`;
  document.querySelector("[data-artist-name]").textContent = artist.name;
  document.querySelector("[data-artist-title]").textContent = artist.name;
  document.querySelector("[data-artist-genre]").textContent = artist.genre;
  document.querySelector("[data-artist-bio]").textContent = artist.bio;
  setImage(document.querySelector("[data-artist-cover]"), artist.cover);
  document.querySelector("#editLink").href = `../../administrador/index.html?artist=${artist.slug}`;

  renderSection("albums", "Albumes", artist.releases.albums);
  renderSection("eps", "EPs", artist.releases.eps);
  renderSection("singles", "Singles", artist.releases.singles);
}

function setImage(img, path) {
  if (window.artistMedia?.isMediaRef(path)) {
    img.src = imagePlaceholder;
    img.dataset.mediaSrc = path;
    window.artistMedia.hydrate(img.parentElement);
    return;
  }

  img.src = window.artistStore.assetUrl(path, prefix);
}

function imageAttributes(path, alt) {
  if (window.artistMedia?.isMediaRef(path)) {
    return `src="${imagePlaceholder}" data-media-src="${path}" alt="${alt}"`;
  }

  return `src="${window.artistStore.assetUrl(path, prefix)}" alt="${alt}"`;
}

function audioSource(audio) {
  if (!audio) return "";
  if (window.artistMedia?.isMediaRef(audio)) return `<source data-media-src="${audio}">`;
  return `<source src="${window.artistStore.assetUrl(audio, prefix)}" type="audio/mpeg">`;
}

function trackTemplate(track) {
  const [title, audio, cover] = track;
  return `
    <article class="track" data-item="${title.toLowerCase()}">
      <div class="vinyl-box">
        <img ${imageAttributes(cover || artist.cover, title)}>
        <span class="vinyl" aria-hidden="true"></span>
      </div>
      <div>
        <h3>${title}</h3>
        ${audio ? `<audio controls preload="none">${audioSource(audio)}</audio>` : "<p>Audio pendiente.</p>"}
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
            <img ${imageAttributes(release.cover || artist.cover, release.title)}>
            <span><strong>${release.title}</strong><small>${release.note || ""}</small></span>
          </summary>
          <div class="music-list">
            ${release.tracks.length ? release.tracks.map(trackTemplate).join("") : "<p>Sin canciones todavia.</p>"}
          </div>
        </details>
      `).join("")}
    </div>
  `;
  window.artistMedia?.hydrate(document.querySelector(`#${id}`));
}

document.querySelector("#pageSearch")?.addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  document.querySelectorAll(".release").forEach((release) => {
    release.hidden = query.length > 0 && !release.dataset.item.includes(query);
  });
});
