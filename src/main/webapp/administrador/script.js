// Administrador simple: crea y edita artistas sin tocar codigo.
// Los datos se guardan en localStorage y los archivos en IndexedDB.
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
    page: "",
    releases: { albums: [], eps: [], singles: [] }
  };
}

function clone(data) {
  return JSON.parse(JSON.stringify(data || emptyArtist()));
}

function field(id) {
  return document.querySelector(`#${id}`);
}

function releaseLabel(type) {
  if (type === "albums") return "Album";
  if (type === "eps") return "EP";
  return "Single";
}

function clearFileInput(id) {
  field(id).value = "";
}

function mediaPreviewAttributes(ref) {
  if (!ref) return `src="" hidden`;
  if (window.artistMedia?.isMediaRef(ref)) return `src="" data-media-src="${ref}"`;
  return `src="${window.artistStore.assetUrl(ref, "../")}"`;
}

async function setPreview(img, ref) {
  img.hidden = !ref;
  img.removeAttribute("data-media-src");

  if (!ref) {
    img.src = "";
    return;
  }

  if (window.artistMedia?.isMediaRef(ref)) {
    img.dataset.mediaSrc = ref;
    await window.artistMedia.hydrate(img.parentElement);
    return;
  }

  img.src = window.artistStore.assetUrl(ref, "../");
}

async function savePickedFile(inputId, targetId, previewId) {
  const file = field(inputId).files[0];
  if (!file) return;

  const ref = await window.artistMedia.saveFile(file);
  field(targetId).value = ref;

  if (previewId) {
    await setPreview(field(previewId), ref);
  }
}

function fillArtistSelect() {
  const artists = window.artistStore.allArtists();
  artistSelect.innerHTML = `
    <option value="">Nuevo cantante</option>
    ${artists.map((artist) => `<option value="${artist.slug}">${artist.name}</option>`).join("")}
  `;
}

async function loadArtist(slug) {
  currentArtist = slug ? clone(window.artistStore.findArtist(slug)) : emptyArtist();
  field("name").value = currentArtist.name;
  field("slug").value = currentArtist.slug;
  field("genre").value = currentArtist.genre;
  field("cover").value = currentArtist.cover;
  field("bio").value = currentArtist.bio;
  await setPreview(field("coverPreview"), currentArtist.cover);
  renderEditor();
}

function syncArtistFields() {
  currentArtist.name = field("name").value.trim();
  currentArtist.slug = field("slug").value.trim() || window.artistStore.slugify(currentArtist.name);
  currentArtist.genre = field("genre").value.trim();
  currentArtist.cover = field("cover").value.trim();
  currentArtist.bio = field("bio").value.trim();
  currentArtist.page = "";
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
          <summary>
            <img class="mini-cover" ${mediaPreviewAttributes(release.cover || currentArtist.cover)} alt="">
            <span>${releaseLabel(type)}: ${release.title}</span>
          </summary>
          <p>${release.note || "Sin nota."}</p>
          <button type="button" data-delete-release="${key}">Borrar lanzamiento</button>
          <ul>
            ${release.tracks.map((track, trackIndex) => `
              <li>
                <img class="song-cover" ${mediaPreviewAttributes(track[2] || release.cover || currentArtist.cover)} alt="">
                <strong>${track[0]}</strong>
                <button type="button" data-delete-track="${key}:${trackIndex}">Borrar</button>
              </li>
            `).join("")}
          </ul>
        </details>
      `;
    });
  });

  window.artistMedia?.hydrate(releaseList);
}

field("name").addEventListener("input", () => {
  if (!field("slug").value.trim()) {
    field("slug").value = window.artistStore.slugify(field("name").value);
  }
});

artistSelect.addEventListener("change", () => loadArtist(artistSelect.value));
field("coverFile").addEventListener("change", () => savePickedFile("coverFile", "cover", "coverPreview"));
field("releaseCoverFile").addEventListener("change", () => savePickedFile("releaseCoverFile", "releaseCover", "releasePreview"));
field("trackCoverFile").addEventListener("change", () => savePickedFile("trackCoverFile", "trackCover", "trackPreview"));
field("trackAudioFile").addEventListener("change", () => savePickedFile("trackAudioFile", "trackAudio"));

field("addRelease").addEventListener("click", () => {
  syncArtistFields();

  const type = field("releaseType").value;
  const title = field("releaseTitle").value.trim();
  if (!title) return;

  currentArtist.releases[type].push({
    title,
    cover: field("releaseCover").value.trim() || currentArtist.cover,
    note: field("releaseNote").value.trim(),
    tracks: []
  });

  field("releaseTitle").value = "";
  field("releaseCover").value = "";
  field("releaseNote").value = "";
  clearFileInput("releaseCoverFile");
  setPreview(field("releasePreview"), "");
  renderEditor();
});

field("addTrack").addEventListener("click", () => {
  syncArtistFields();
  if (!releaseTarget.value) return;

  const [type, index] = releaseTarget.value.split(":");
  const release = currentArtist.releases[type]?.[index];
  const title = field("trackTitle").value.trim();
  if (!title || !release) return;

  release.tracks.push([
    title,
    field("trackAudio").value.trim(),
    field("trackCover").value.trim() || release.cover || currentArtist.cover
  ]);

  field("trackTitle").value = "";
  field("trackAudio").value = "";
  field("trackCover").value = "";
  clearFileInput("trackAudioFile");
  clearFileInput("trackCoverFile");
  setPreview(field("trackPreview"), "");
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

field("saveArtist").addEventListener("click", () => {
  syncArtistFields();

  if (!currentArtist.name || !currentArtist.cover || !currentArtist.bio) {
    message.textContent = "Faltan nombre, portada o biografia.";
    return;
  }

  currentArtist.slug = window.artistStore.slugify(currentArtist.slug || currentArtist.name);
  window.artistStore.saveArtist(currentArtist);
  fillArtistSelect();
  artistSelect.value = currentArtist.slug;
  field("viewArtist").href = `../artistas/ficha/index.html?artist=${currentArtist.slug}`;
  message.textContent = "Cantante guardado. Ya aparece en Explorar y se puede abrir su ficha.";
});

fillArtistSelect();
loadArtist(new URLSearchParams(location.search).get("artist") || "").then(() => {
  if (currentArtist.slug) artistSelect.value = currentArtist.slug;
});
