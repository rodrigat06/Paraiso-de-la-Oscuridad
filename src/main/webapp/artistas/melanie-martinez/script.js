// Datos separados por albumes, EPs y singles para que sea facil de explicar.
const discography = {
  albums: [
    {
      title: "Cry Baby",
      cover: "img/cry-baby.jpg",
      note: "Primer album conceptual de Melanie Martinez.",
      tracks: [
        ["Cry Baby", "audio/cry-baby.mp3"],
        ["Dollhouse", "audio/dollhouse.mp3"],
        ["Sippy Cup", "audio/sippy-cup.mp3"],
        ["Carousel", "audio/carousel.mp3"],
        ["Alphabet Boy", "audio/alphabet-boy.mp3"],
        ["Soap", "audio/soap.mp3"],
        ["Training Wheels", "audio/training-wheels.mp3"],
        ["Pity Party", "audio/pity-party.mp3"],
        ["Tag, You're It", "audio/tag-youre-it.mp3"],
        ["Milk and Cookies", "audio/milk-and-cookies.mp3"],
        ["Pacify Her", "audio/pacify-her.mp3"],
        ["Mrs. Potato Head", "audio/mrs-potato-head.mp3"],
        ["Mad Hatter", "audio/mad-hatter.mp3"],
        ["Play Date", "audio/play-date.mp3"],
        ["Teddy Bear", "audio/teddy-bear.mp3"],
        ["Cake", "audio/cake.mp3"]
      ]
    },
    {
      title: "K-12",
      cover: "img/k-12.jpg",
      note: "Album visual con estetica escolar y critica social.",
      tracks: [
        ["Wheels On The Bus", "audio/wheels-on-the-bus.mp3"],
        ["Class Fight", "audio/class-fight.mp3"],
        ["The Principal", "audio/the-principal.mp3"],
        ["Show And Tell", "audio/show-and-tell.mp3"],
        ["Nurse's Office", "audio/nurses-office.mp3"],
        ["Drama Club", "audio/drama-club.mp3"],
        ["Strawberry Shortcake", "audio/strawberry-shortcake.mp3"],
        ["Lunchbox Friends", "audio/lunchbox-friends.mp3"],
        ["Orange Juice", "audio/orange-juice.mp3"],
        ["Detention", "audio/detention.mp3"],
        ["Teacher's Pet", "audio/teachers-pet.mp3"],
        ["High School Sweethearts", "audio/high-school-sweethearts.mp3"],
        ["Recess", "audio/recess.mp3"]
      ]
    },
    {
      title: "Portals",
      cover: "img/portals.jpg",
      note: "Era de transformacion, muerte y criatura fantastica.",
      tracks: [
        ["Death", "audio/death.mp3"],
        ["Void", "audio/void.mp3"],
        ["Tunnel Vision", "audio/tunnel.mp3"],
        ["Faerie Soiree", "audio/faerie-soiree.mp3"],
        ["Light Shower", "audio/light-shower.mp3"],
        ["Spider Web", "audio/spider-web.mp3"],
        ["Leeches", "audio/leeches.mp3"],
        ["Battle Of The Larynx", "audio/battle-of-the-larynx.mp3"],
        ["The Contortionist", "audio/the-contortionist.mp3"],
        ["Moon Cycle", "audio/moon-cycle.mp3"],
        ["Nymphology", "audio/nymphology.mp3"],
        ["Evil", "audio/evil.mp3"],
        ["Womb", "audio/womb.mp3"],
        ["Powder", "audio/powder.mp3"],
        ["Pluto", "audio/pluto.mp3"],
        ["Milk Of The Siren", "audio/milk-of-the-siren.mp3"]
      ]
    }
  ],
  eps: [
    {
      title: "Dollhouse EP",
      cover: "img/dollhouse.jpg",
      note: "EP inicial conectado con la era Cry Baby.",
      tracks: [
        ["Dollhouse", "audio/dollhouse.mp3"],
        ["Carousel", "audio/carousel.mp3"]
      ]
    },
    {
      title: "After School EP",
      cover: "img/portada.jpg",
      note: "Etapa extra despues de K-12. En esta version se muestran los audios disponibles.",
      tracks: [
        ["Gingerbread Man", "audio/gingerbread-man.mp3"],
        ["Fire Drill", "audio/fire-drill.mp3"]
      ]
    }
  ],
  singles: [
    {
      title: "Singles",
      cover: "img/soap.jpg",
      note: "Singles y canciones sueltas recuperadas del proyecto original.",
      tracks: [
        ["Copy Cat", "audio/copy-cat.mp3"],
        ["Fire Drill", "audio/fire-drill.mp3"],
        ["Gingerbread Man", "audio/gingerbread-man.mp3"],
        ["Soap", "audio/soap.mp3"],
        ["Void", "audio/void.mp3"],
        ["Death", "audio/death.mp3"]
      ]
    }
  ]
};

// Crea una tarjeta de cancion con vinilo y reproductor.
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

// Pinta cada seccion sin llenar el HTML de codigo repetido.
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
renderSection("singles", "Singles", discography.singles);

// El buscador filtra lanzamientos completos por nombre de album o cancion.
document.querySelector("#pageSearch").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();

  document.querySelectorAll(".release").forEach((release) => {
    release.hidden = query.length > 0 && !release.dataset.item.includes(query);
  });
});
