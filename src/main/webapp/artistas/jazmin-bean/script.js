// Datos de la discografia. Cada bloque tiene titulo, portada y canciones.
const discography = {
  albums: [
    {
      title: "Traumatic Livelihood",
      cover: "img/traumatic-livelihood.jpg",
      note: "Album principal de Jazmin Bean.",
      tracks: [
        ["Favourite Toy", "audio/favourite-toy.mp3"],
        ["Terrified", "audio/terrified.mp3"],
        ["You Know What You've Done", "audio/you-know-what-youve-done.mp3"],
        ["Piggie", "audio/piggie.mp3"],
        ["Pesticides", "audio/pesticides.mp3"],
        ["Carnage", "audio/carnage.mp3"],
        ["Darling", "audio/darling.mp3"],
        ["War Zone Urchin", "audio/war-zone-urchin.mp3"]
      ]
    }
  ],
  eps: [
    {
      title: "Worldwide Torture",
      cover: "img/worldwide-torture.jpg",
      note: "EP / etapa inicial de estetica mas agresiva.",
      tracks: [
        ["Worldwide Torture", "audio/worldwide-torture.mp3"],
        ["Yandere", "audio/yandere.mp3"],
        ["Puppy Pound", "audio/puppy-pound.mp3"],
        ["Monster Truck", "audio/monster-truck.mp3"],
        ["Super Slaughter", "audio/super-slaughter.mp3"]
      ]
    }
  ],
  singles: [
    {
      title: "Singles y extras",
      cover: "img/icono.jpg",
      note: "Canciones sueltas o material extra recuperado del proyecto original.",
      tracks: [
        ["R U Looking 4 Me Now", "audio/r-u-looking-4-me-now.mp3"],
        ["Avoidant", "audio/avoidant.mp3"],
        ["Batshit Intelligence", "audio/batshit-intelligence.mp3"],
        ["Chatroom", "audio/chatroom.mp3"],
        ["Disney Princess", "audio/disney-princess.mp3"],
        ["Garbage", "audio/garbage.mp3"],
        ["Grudge", "audio/grudge.mp3"],
        ["Gutter", "audio/gutter.mp3"],
        ["Hell's Front Porch", "audio/hells-front-porch.mp3"],
        ["Is This A Cult", "audio/is-this-a-cult.mp3"],
        ["Monolith", "audio/monolith.mp3"],
        ["Monopoly Man", "audio/monopoly-man.mp3"],
        ["Possession", "audio/possession.mp3"],
        ["The Last Two People On Earth", "audio/the-last-two-people-on-earth.mp3"],
        ["The Plague", "audio/the-plague.mp3"],
        ["The Vatican", "audio/the-vatican.mp3"],
        ["Uncanny Valley", "audio/uncanny-valley.mp3"],
        ["Weight Watchers", "audio/weight-watchers.mp3"],
        ["White Boy With A Gun", "audio/white-boy-with-a-gun.mp3"]
      ]
    }
  ]
};

// Crea una tarjeta de cancion con portada, vinilo y audio.
function trackTemplate(track, cover) {
  const [title, audio] = track;

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

// Pinta una seccion completa: albumes, EPs o singles.
function renderSection(id, title, releases) {
  const box = document.querySelector(`#${id}`);

  box.innerHTML = `
    <h2>${title}</h2>
    <div class="release-list">
      ${releases.map((release) => `
        <article class="release" data-item="${release.title.toLowerCase()} ${release.tracks.map((track) => track[0]).join(" ").toLowerCase()}">
          <header class="release-head">
            <img src="${release.cover}" alt="${release.title}">
            <div>
              <h3>${release.title}</h3>
              <p>${release.note}</p>
            </div>
          </header>
          <div class="music-list">
            ${release.tracks.map((track) => trackTemplate(track, release.cover)).join("")}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

renderSection("albums", "Albumes", discography.albums);
renderSection("eps", "EPs", discography.eps);
renderSection("singles", "Singles / extras", discography.singles);

// El buscador oculta lanzamientos que no coinciden con lo escrito.
document.querySelector("#pageSearch").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();

  document.querySelectorAll(".release").forEach((release) => {
    release.hidden = query.length > 0 && !release.dataset.item.includes(query);
  });
});
