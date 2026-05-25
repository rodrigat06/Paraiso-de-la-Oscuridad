// Discografia basada en las paginas originales: album, EP o single.
const discography = {
  albums: [
    {
      title: "Cry Baby",
      cover: "img/cry-baby.jpg",
      note: "Album conceptual de debut.",
      tracks: [
        ["Cry Baby", "audio/cry-baby.mp3", "img/cry-baby-01.jpg"],
        ["Dollhouse", "audio/dollhouse.mp3", "img/cry-baby-02.jpg"],
        ["Sippy Cup", "audio/sippy-cup.mp3", "img/cry-baby-03.jpg"],
        ["Carousel", "audio/carousel.mp3", "img/cry-baby-04.jpg"],
        ["Alphabet Boy", "audio/alphabet-boy.mp3", "img/cry-baby-05.jpg"],
        ["Soap", "audio/soap.mp3", "img/cry-baby-06.jpg"],
        ["Training Wheels", "audio/training-wheels.mp3", "img/cry-baby-07.jpg"],
        ["Pity Party", "audio/pity-party.mp3", "img/cry-baby-08.jpg"],
        ["Tag, You're It", "audio/tag-youre-it.mp3", "img/cry-baby-09.jpg"],
        ["Milk and Cookies", "audio/milk-and-cookies.mp3", "img/cry-baby-10.jpg"],
        ["Pacify Her", "audio/pacify-her.mp3", "img/cry-baby-11.jpg"],
        ["Mrs. Potato Head", "audio/mrs-potato-head.mp3", "img/cry-baby-12.jpg"],
        ["Mad Hatter", "audio/mad-hatter.mp3", "img/cry-baby-13.jpg"],
        ["Play Date", "audio/play-date.mp3", "img/cry-baby-14.jpg"],
        ["Teddy Bear", "audio/teddy-bear.mp3", "img/cry-baby-15.jpg"],
        ["Cake", "audio/cake.mp3", "img/cry-baby-16.jpg"]
      ]
    },
    {
      title: "K-12",
      cover: "img/k-12.jpg",
      note: "Album visual escolar.",
      tracks: [
        ["Wheels On The Bus", "audio/wheels-on-the-bus.mp3", "img/k-12.jpg"],
        ["Class Fight", "audio/class-fight.mp3", "img/k-12.jpg"],
        ["The Principal", "audio/the-principal.mp3", "img/k-12.jpg"],
        ["Show And Tell", "audio/show-and-tell.mp3", "img/k-12.jpg"],
        ["Nurse's Office", "audio/nurses-office.mp3", "img/k-12.jpg"],
        ["Drama Club", "audio/drama-club.mp3", "img/k-12.jpg"],
        ["Strawberry Shortcake", "audio/strawberry-shortcake.mp3", "img/k-12.jpg"],
        ["Lunchbox Friends", "audio/lunchbox-friends.mp3", "img/k-12.jpg"],
        ["Orange Juice", "audio/orange-juice.mp3", "img/k-12.jpg"],
        ["Detention", "audio/detention.mp3", "img/k-12.jpg"],
        ["Teacher's Pet", "audio/teachers-pet.mp3", "img/k-12.jpg"],
        ["High School Sweethearts", "audio/high-school-sweethearts.mp3", "img/k-12.jpg"],
        ["Recess", "audio/recess.mp3", "img/k-12.jpg"],
        ["Fire Drill", "audio/fire-drill.mp3", "img/fire-drill.jpg"]
      ]
    },
    {
      title: "Portals",
      cover: "img/portals.jpg",
      note: "Album de transformacion y criatura fantastica.",
      tracks: [
        ["Death", "audio/death.mp3", "img/death.jpg"],
        ["Void", "audio/void.mp3", "img/void.jpg"],
        ["Tunnel Vision", "audio/tunnel.mp3", "img/tunnel.jpg"],
        ["Faerie Soiree", "audio/faerie-soiree.mp3", "img/faerie.jpg"],
        ["Light Shower", "audio/light-shower.mp3", "img/light.jpg"],
        ["Spider Web", "audio/spider-web.mp3", "img/spider.jpg"],
        ["Leeches", "audio/leeches.mp3", "img/leeches.jpg"],
        ["Battle Of The Larynx", "audio/battle-of-the-larynx.mp3", "img/battle.jpg"],
        ["The Contortionist", "audio/the-contortionist.mp3", "img/contortionist.jpg"],
        ["Moon Cycle", "audio/moon-cycle.mp3", "img/moon.jpg"],
        ["Nymphology", "audio/nymphology.mp3", "img/nymphology.jpg"],
        ["Evil", "audio/evil.mp3", "img/evil.jpg"],
        ["Womb", "audio/womb.mp3", "img/womb.jpg"],
        ["Powder", "audio/powder.mp3", "img/powder.jpg"],
        ["Pluto", "audio/pluto.mp3", "img/pluto.jpg"],
        ["Milk Of The Siren", "audio/milk-of-the-siren.mp3", "img/milk.jpg"]
      ]
    },
    {
      title: "Hades",
      cover: "img/hades.jpg",
      note: "Bloque recuperado de la seccion original.",
      tracks: [
        ["The Last Two People On Earth", "audio/the-last-two-people-on-earth.mp3", "img/people.jpg"],
        ["Chatroom", "audio/chatroom.mp3", "img/porch.jpg"],
        ["Hell's Front Porch", "audio/hells-front-porch.mp3", "img/porch.jpg"],
        ["The Vatican", "audio/the-vatican.mp3", "img/vatican.jpg"],
        ["Uncanny Valley", "audio/uncanny-valley.mp3", "img/uncanny.jpg"],
        ["Gutter", "audio/gutter.mp3", "img/gutter.jpg"],
        ["Batshit Intelligence", "audio/batshit-intelligence.mp3", "img/bat.jpg"],
        ["The Plague", "audio/the-plague.mp3", "img/plague.jpg"],
        ["Weight Watchers", "audio/weight-watchers.mp3", "img/weight.jpg"],
        ["Monolith", "audio/monolith.mp3", "img/monolith.jpg"],
        ["Avoidant", "audio/avoidant.mp3", "img/avoidant.jpg"],
        ["Monopoly Man", "audio/monopoly-man.mp3", "img/monopoly.jpg"],
        ["Grudge", "audio/grudge.mp3", "img/grudge.jpg"],
        ["Disney Princess", "audio/disney-princess.mp3", "img/disney.jpg"],
        ["White Boy With A Gun", "audio/white-boy-with-a-gun.mp3", "img/gun.jpg"],
        ["Possession", "audio/possession.mp3", "img/possession.jpg"],
        ["Is This A Cult", "audio/is-this-a-cult.mp3", "img/cult.jpg"],
        ["Garbage", "audio/garbage.mp3", "img/garbage.jpg"]
      ]
    }
  ],
  eps: [
    {
      title: "Dollhouse EP",
      cover: "img/dollhouse-ep.jpg",
      note: "EP original con Dollhouse y Carousel.",
      tracks: [
        ["Dollhouse", "audio/dollhouse.mp3", "img/dollhouse-ep.jpg"],
        ["Carousel", "audio/carousel.mp3", "img/dollhouse-ep.jpg"]
      ]
    },
    {
      title: "Carousel Remixes",
      cover: "img/carousel-ep.jpg",
      note: "Remixes / version reducida.",
      tracks: [["Carousel", "audio/carousel.mp3", "img/carousel-ep.jpg"]]
    },
    {
      title: "Pity Party Remixes",
      cover: "img/pity-party-ep.jpg",
      note: "Remixes / version reducida.",
      tracks: [["Pity Party", "audio/pity-party.mp3", "img/pity-party-ep.jpg"]]
    },
    {
      title: "Soap Remixes",
      cover: "img/soap-remixes.webp",
      note: "Remix recuperado del proyecto original.",
      tracks: [["Soap Remix 1", "audio/remix-soap-1.mp3", "img/soap-remixes.webp"]]
    },
    {
      title: "After School EP",
      cover: "img/portada.jpg",
      note: "En la pagina original aparecia como EP con audios pendientes.",
      tracks: []
    }
  ],
  singles: [
    {
      title: "Singles",
      cover: "img/singles.jpg",
      note: "Singles tal como estaban en la pagina original.",
      tracks: [
        ["Dollhouse", "audio/dollhouse.mp3", "img/dollhouse-single.jpg"],
        ["Pity Party", "audio/pity-party.mp3", "img/pity-party-single.jpg"],
        ["Soap", "audio/soap.mp3", "img/soap.jpg"],
        ["Sippy Cup", "audio/sippy-cup.mp3", "img/sippy-cup-single.jpg"],
        ["Gingerbread Man", "audio/gingerbread-man.mp3", "img/portada.jpg"],
        ["Copy Cat", "audio/copy-cat.mp3", "img/copy-cat-single.jpg"],
        ["Fire Drill", "audio/fire-drill.mp3", "img/fire-drill-single.jpg"],
        ["Void", "audio/void.mp3", "img/void-single.jpg"],
        ["Possession", "audio/possession.mp3", "img/possession-single.jpg"],
        ["Disney Princess", "audio/disney-princess.mp3", "img/disney-princess-single.jpg"]
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
            ${release.tracks.length ? release.tracks.map(trackTemplate).join("") : "<p>No tenia audios activos en la version original.</p>"}
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
