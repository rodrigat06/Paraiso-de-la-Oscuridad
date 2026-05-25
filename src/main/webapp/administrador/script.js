// Administrador local: guarda cambios en el navegador con localStorage.
const artistSelect = document.querySelector("#artistSelect");
const releaseTarget = document.querySelector("#releaseTarget");
const releaseList = document.querySelector("#releaseList");
const message = document.querySelector("#message");
let currentArtist = emptyArtist();

function emptyArtist() {
  return {
    slug: "",
    name: "",
    genre: "",
    cover: "",
    bio: "",
    releases: { albums: [], eps: [], singles: [] }
  };
}

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function fillArtistSelect() {
  const artists = window.artistStore.allArtists();
  artistSelect.innerHTML = `
    <option value="">Nuevo cantante</option>
    ${artists.map((artist) => `<option value="${artist.slug}">${artist.name}</option>`).join("")}
  `;
}

function loadArtist(slug) {
  currentArtist = slug ? clone(window.artistStore.findArtist(slug)) : emptyArtist();
  document.querySelector("#name").value = currentArtist.name;
  document.querySelector("#slug").value = currentArtist.slug;
  document.querySelector("#genre").value = currentArtist.genre;
  document.querySelector("#cover").value = currentArtist.cover;
  document.querySelector("#bio").value = currentArtist.bio;
  renderEditor();
}

function syncArtistFields() {
  currentArtist.name = document.querySelector("#name").value.trim();
  currentArtist.slug = document.querySelector("#slug").value.trim() || window.artistStore.slugify(currentArtist.name);
  currentArtist.genre = document.querySelector("#genre").value.trim();
  currentArtist.cover = document.querySelector("#cover").value.trim();
  currentArtist.bio = document.querySelector("#bio").value.trim();
  currentArtist.page = currentArtist.page || "";
}

function releaseLabel(type) {
  return type === "albums" ? "Album" : type === "eps" ? "EP" : "Single";
}

function renderEditor() {
  releaseTarget.innerHTML = "";
  releaseList.innerHTML = "";

  ["albums", "eps", "singles"].forEach((type) => {
    currentArtist.releases[type].forEach((release, index) => {
      const key = `${type}:${index}`;
      releaseTarget.innerHTML += `<option value="${key}">${releaseLabel(type)} - ${release.title}</option>`;
      releaseList.innerHTML += `
        <details class="release" open>
          <summary>${releaseLabel(type)}: ${release.title}</summary>
          <p>${release.note || ""}</p>
          <small>${release.cover || "Sin portada"}</small>
          <button type="button" data-delete-release="${key}">Borrar lanzamiento</button>
          <ul>
            ${release.tracks.map((track, trackIndex) => `
              <li>
                <strong>${track[0]}</strong>
                <button type="button" data-delete-track="${key}:${trackIndex}">Borrar</button>
              </li>
            `).join("")}
          </ul>
        </details>
      `;
    });
  });
}

document.querySelector("#name").addEventListener("input", () => {
  if (!document.querySelector("#slug").value.trim()) {
    document.querySelector("#slug").value = window.artistStore.slugify(document.querySelector("#name").value);
  }
});

artistSelect.addEventListener("change", () => loadArtist(artistSelect.value));

document.querySelector("#addRelease").addEventListener("click", () => {
  syncArtistFields();
  const type = document.querySelector("#releaseType").value;
  const title = document.querySelector("#releaseTitle").value.trim();
  if (!title) return;

  currentArtist.releases[type].push({
    title,
    cover: document.querySelector("#releaseCover").value.trim() || currentArtist.cover,
    note: document.querySelector("#releaseNote").value.trim(),
    tracks: []
  });

  document.querySelector("#releaseTitle").value = "";
  document.querySelector("#releaseCover").value = "";
  document.querySelector("#releaseNote").value = "";
  renderEditor();
});

document.querySelector("#addTrack").addEventListener("click", () => {
  syncArtistFields();
  const [type, index] = releaseTarget.value.split(":");
  const title = document.querySelector("#trackTitle").value.trim();
  if (!title || !currentArtist.releases[type]?.[index]) return;

  currentArtist.releases[type][index].tracks.push([
    title,
    document.querySelector("#trackAudio").value.trim(),
    document.querySelector("#trackCover").value.trim() || currentArtist.releases[type][index].cover || currentArtist.cover
  ]);

  document.querySelector("#trackTitle").value = "";
  document.querySelector("#trackAudio").value = "";
  document.querySelector("#trackCover").value = "";
  renderEditor();
});

releaseList.addEventListener("click", (event) => {
  const releaseKey = event.target.dataset.deleteRelease;
  const trackKey = event.target.dataset.deleteTrack;

  if (releaseKey) {
    const [type, index] = releaseKey.split(":");
    currentArtist.releases[type].splice(Number(index), 1);
    renderEditor();
  }

  if (trackKey) {
    const [type, releaseIndex, trackIndex] = trackKey.split(":");
    currentArtist.releases[type][releaseIndex].tracks.splice(Number(trackIndex), 1);
    renderEditor();
  }
});

document.querySelector("#saveArtist").addEventListener("click", () => {
  syncArtistFields();
  currentArtist.slug = window.artistStore.slugify(currentArtist.slug || currentArtist.name);
  currentArtist.page = "";
  window.artistStore.saveArtist(currentArtist);
  fillArtistSelect();
  artistSelect.value = currentArtist.slug;
  document.querySelector("#viewArtist").href = `../artistas/ficha/index.html?artist=${currentArtist.slug}`;
  message.textContent = "Cantante guardado. Ya aparece en Explorar.";
});

fillArtistSelect();
loadArtist(new URLSearchParams(location.search).get("artist") || "");
if (currentArtist.slug) {
  artistSelect.value = currentArtist.slug;
}
