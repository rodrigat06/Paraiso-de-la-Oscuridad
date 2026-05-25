// Discografia basada en las paginas originales de Jazmin.
const discography = {
  albums: [
    {
      title: "Worldwide Torture",
      cover: "img/worldwide-torture.jpg",
      note: "Lanzamiento principal de la primera etapa.",
      tracks: [
        ["Worldwide Torture", "audio/worldwide-torture.mp3", "img/worldwide-torture.jpg"],
        ["War Zone Urchin", "audio/war-zone-urchin.mp3", "img/war-zone.jpg"],
        ["Yandere", "audio/yandere.mp3", "img/yandere.jpg"],
        ["Puppy Pound", "audio/puppy-pound.mp3", "img/puppy-pound.jpg"]
      ]
    },
    {
      title: "Traumatic Livelihood",
      cover: "img/traumatic-livelihood.jpg",
      note: "Album posterior, mas directo y personal.",
      tracks: [
        ["Favourite Toy", "audio/favourite-toy.mp3", "img/favourite-toy.jpg"],
        ["Terrified", "audio/terrified.mp3", "img/terrified.jpg"],
        ["You Know What You've Done", "audio/you-know-what-youve-done.mp3", "img/you-know-what-yove-done.jpg"],
        ["Pesticides", "audio/pesticides.mp3", "img/pesticides.jpg"],
        ["Piggie", "audio/piggie.mp3", "img/piggie.jpg"],
        ["Carnage", "audio/carnage.mp3", "img/carnage.jpg"],
        ["Darling", "audio/darling.mp3", "img/darling.jpg"]
      ]
    }
  ],
  eps: [
    {
      title: "Acoustic Church Session",
      cover: "img/acoustic.jpg",
      note: "EP/mini seccion original con formato de libro.",
      tracks: [
        ["Worldwide Torture", "audio/worldwide-torture.mp3", "img/worldwide-torture.jpg"],
        ["War Zone Urchin", "audio/war-zone-urchin.mp3", "img/war-zone.jpg"],
        ["Yandere", "audio/yandere.mp3", "img/yandere.jpg"],
        ["Puppy Pound", "audio/puppy-pound.mp3", "img/puppy-pound.jpg"]
      ]
    }
  ],
  singles: [
    {
      title: "Singles",
      cover: "img/singles.jpg",
      note: "Singles tal como estaban en la pagina original.",
      tracks: [
        ["Worldwide Torture", "audio/worldwide-torture.mp3", "img/worldwide-torture.jpg"],
        ["War Zone Urchin", "audio/war-zone-urchin.mp3", "img/war-zone.jpg"],
        ["Pesticides", "audio/pesticides.mp3", "img/pesticides.jpg"],
        ["Super Slaughter", "audio/super-slaughter.mp3", "img/super-slaughter.jpg"],
        ["Yandere", "audio/yandere.mp3", "img/yandere.jpg"],
        ["Monster Truck", "audio/monster-truck.mp3", "img/monster-truck.jpg"],
        ["R U Looking 4 Me Now", "audio/r-u-looking-4-me-now.mp3", "img/r-u-looking-4-me-now.jpg"],
        ["Puppy Pound", "audio/puppy-pound.mp3", "img/puppy-pound.jpg"],
        ["Carnage", "audio/carnage.mp3", "img/carnage.jpg"],
        ["Piggie", "audio/piggie.mp3", "img/piggie.jpg"],
        ["Favourite Toy", "audio/favourite-toy.mp3", "img/favourite-toy.jpg"],
        ["Terrified", "audio/terrified.mp3", "img/terrified.jpg"],
        ["You Know What You've Done", "audio/you-know-what-youve-done.mp3", "img/you-know-what-yove-done.jpg"],
        ["It's Not My Fault It's Yours", "audio/its-not-my-fault.mp3", "img/its-not-my-fault.jpg"],
        ["Darling", "audio/darling.mp3", "img/darling.jpg"]
      ]
    }
  ]
};

function trackTemplate(track) {
  const [title, audio, cover] = track;
  return `
    <article class="track" data-item="${title.toLowerCase()}">
      <div class="vinyl-box">
        <img src="${cover}" alt="${title}">
        <span class="vinyl" aria-hidden="true"></span>
      </div>
      <div>
        <h3>${title}</h3>
        <audio controls preload="none"><source src="${audio}" type="audio/mpeg"></audio>
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
            <img src="${release.cover}" alt="${release.title}">
            <span>
              <strong>${release.title}</strong>
              <small>${release.note}</small>
            </span>
          </summary>
          <div class="music-list">
            ${release.tracks.map(trackTemplate).join("")}
          </div>
        </details>
      `).join("")}
    </div>
  `;
}

renderSection("albums", "Albumes", discography.albums);
renderSection("eps", "EPs", discography.eps);
renderSection("singles", "Singles", discography.singles);

document.querySelector("#pageSearch").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  document.querySelectorAll(".release").forEach((release) => {
    release.hidden = query.length > 0 && !release.dataset.item.includes(query);
  });
});
