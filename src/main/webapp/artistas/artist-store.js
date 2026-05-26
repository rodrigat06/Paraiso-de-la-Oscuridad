// Datos base y funciones comunes para listar, editar y pintar artistas.
const ARTIST_STORAGE_KEY = "paraiso-artists";

const defaultArtists = [
  {
    slug: "jazmin-bean",
    name: "Jazmin Bean",
    genre: "Dark pop / alt pop",
    cover: "artistas/jazmin-bean/img/icono.jpg",
    page: "artistas/jazmin-bean/jazmin-bean.html",
    editable: true,
    bio: "Artista britanica de estetica teatral, dulce y agresiva. Su musica mezcla fantasia oscura, pop alternativo y una imagen muy reconocible.",
    releases: {
      albums: [
        {
          title: "Traumatic Livelihood",
          cover: "artistas/jazmin-bean/img/traumatic-livelihood.jpg",
          note: "Album principal de Jazmin Bean.",
          tracks: [
            ["Favourite Toy", "artistas/jazmin-bean/audio/favourite-toy.mp3", "artistas/jazmin-bean/img/favourite-toy.jpg"],
            ["Terrified", "artistas/jazmin-bean/audio/terrified.mp3", "artistas/jazmin-bean/img/terrified.jpg"],
            ["You Know What You've Done", "artistas/jazmin-bean/audio/you-know-what-youve-done.mp3", "artistas/jazmin-bean/img/you-know-what-yove-done.jpg"],
            ["Pesticides", "artistas/jazmin-bean/audio/pesticides.mp3", "artistas/jazmin-bean/img/pesticides.jpg"],
            ["Piggie", "artistas/jazmin-bean/audio/piggie.mp3", "artistas/jazmin-bean/img/piggie.jpg"],
            ["Carnage", "artistas/jazmin-bean/audio/carnage.mp3", "artistas/jazmin-bean/img/carnage.jpg"],
            ["Darling", "artistas/jazmin-bean/audio/darling.mp3", "artistas/jazmin-bean/img/darling.jpg"]
          ]
        }
      ],
      eps: [
        {
          title: "Worldwide Torture",
          cover: "artistas/jazmin-bean/img/worldwide-torture.jpg",
          note: "EP / etapa inicial de Jazmin Bean.",
          tracks: [
            ["Worldwide Torture", "artistas/jazmin-bean/audio/worldwide-torture.mp3", "artistas/jazmin-bean/img/worldwide-torture.jpg"],
            ["War Zone Urchin", "artistas/jazmin-bean/audio/war-zone-urchin.mp3", "artistas/jazmin-bean/img/war-zone.jpg"],
            ["Yandere", "artistas/jazmin-bean/audio/yandere.mp3", "artistas/jazmin-bean/img/yandere.jpg"],
            ["Puppy Pound", "artistas/jazmin-bean/audio/puppy-pound.mp3", "artistas/jazmin-bean/img/puppy-pound.jpg"]
          ]
        },
        {
          title: "Acoustic Church Session",
          cover: "artistas/jazmin-bean/img/acoustic.jpg",
          note: "Sesion acustica simplificada desde la estructura original.",
          tracks: [
            ["Worldwide Torture", "artistas/jazmin-bean/audio/worldwide-torture.mp3", "artistas/jazmin-bean/img/worldwide-torture.jpg"],
            ["War Zone Urchin", "artistas/jazmin-bean/audio/war-zone-urchin.mp3", "artistas/jazmin-bean/img/war-zone.jpg"],
            ["Yandere", "artistas/jazmin-bean/audio/yandere.mp3", "artistas/jazmin-bean/img/yandere.jpg"],
            ["Puppy Pound", "artistas/jazmin-bean/audio/puppy-pound.mp3", "artistas/jazmin-bean/img/puppy-pound.jpg"]
          ]
        }
      ],
      singles: [
        {
          title: "Singles",
          cover: "artistas/jazmin-bean/img/singles.jpg",
          note: "Singles con sus portadas originales.",
          tracks: [
            ["Worldwide Torture", "artistas/jazmin-bean/audio/worldwide-torture.mp3", "artistas/jazmin-bean/img/worldwide-torture.jpg"],
            ["War Zone Urchin", "artistas/jazmin-bean/audio/war-zone-urchin.mp3", "artistas/jazmin-bean/img/war-zone.jpg"],
            ["Pesticides", "artistas/jazmin-bean/audio/pesticides.mp3", "artistas/jazmin-bean/img/pesticides.jpg"],
            ["Super Slaughter", "artistas/jazmin-bean/audio/super-slaughter.mp3", "artistas/jazmin-bean/img/super-slaughter.jpg"],
            ["Yandere", "artistas/jazmin-bean/audio/yandere.mp3", "artistas/jazmin-bean/img/yandere.jpg"],
            ["Monster Truck", "artistas/jazmin-bean/audio/monster-truck.mp3", "artistas/jazmin-bean/img/monster-truck.jpg"],
            ["R U Looking 4 Me Now", "artistas/jazmin-bean/audio/r-u-looking-4-me-now.mp3", "artistas/jazmin-bean/img/r-u-looking-4-me-now.jpg"],
            ["Puppy Pound", "artistas/jazmin-bean/audio/puppy-pound.mp3", "artistas/jazmin-bean/img/puppy-pound.jpg"],
            ["Carnage", "artistas/jazmin-bean/audio/carnage.mp3", "artistas/jazmin-bean/img/carnage.jpg"],
            ["Piggie", "artistas/jazmin-bean/audio/piggie.mp3", "artistas/jazmin-bean/img/piggie.jpg"],
            ["Favourite Toy", "artistas/jazmin-bean/audio/favourite-toy.mp3", "artistas/jazmin-bean/img/favourite-toy.jpg"],
            ["Terrified", "artistas/jazmin-bean/audio/terrified.mp3", "artistas/jazmin-bean/img/terrified.jpg"],
            ["You Know What You've Done", "artistas/jazmin-bean/audio/you-know-what-youve-done.mp3", "artistas/jazmin-bean/img/you-know-what-yove-done.jpg"],
            ["It's Not My Fault It's Yours", "artistas/jazmin-bean/audio/its-not-my-fault.mp3", "artistas/jazmin-bean/img/its-not-my-fault.jpg"],
            ["Darling", "artistas/jazmin-bean/audio/darling.mp3", "artistas/jazmin-bean/img/darling.jpg"]
          ]
        }
      ]
    }
  },
  {
    slug: "melanie-martinez",
    name: "Melanie Martinez",
    genre: "Alt pop / conceptual pop",
    cover: "artistas/melanie-martinez/img/portada.jpg",
    page: "artistas/melanie-martinez/melanie-martinez.html",
    editable: true,
    bio: "Cantante estadounidense conocida por crear eras visuales completas, personajes reconocibles y un pop oscuro con imaginario infantil.",
    releases: {
      albums: [
        {
          title: "Cry Baby",
          cover: "artistas/melanie-martinez/img/cry-baby.jpg",
          note: "Album conceptual de debut.",
          tracks: [
            ["Cry Baby", "artistas/melanie-martinez/audio/cry-baby.mp3", "artistas/melanie-martinez/img/cry-baby-01.jpg"],
            ["Dollhouse", "artistas/melanie-martinez/audio/dollhouse.mp3", "artistas/melanie-martinez/img/cry-baby-02.jpg"],
            ["Sippy Cup", "artistas/melanie-martinez/audio/sippy-cup.mp3", "artistas/melanie-martinez/img/cry-baby-03.jpg"],
            ["Carousel", "artistas/melanie-martinez/audio/carousel.mp3", "artistas/melanie-martinez/img/cry-baby-04.jpg"],
            ["Alphabet Boy", "artistas/melanie-martinez/audio/alphabet-boy.mp3", "artistas/melanie-martinez/img/cry-baby-05.jpg"],
            ["Soap", "artistas/melanie-martinez/audio/soap.mp3", "artistas/melanie-martinez/img/cry-baby-06.jpg"],
            ["Training Wheels", "artistas/melanie-martinez/audio/training-wheels.mp3", "artistas/melanie-martinez/img/cry-baby-07.jpg"],
            ["Pity Party", "artistas/melanie-martinez/audio/pity-party.mp3", "artistas/melanie-martinez/img/cry-baby-08.jpg"],
            ["Tag, You're It", "artistas/melanie-martinez/audio/tag-youre-it.mp3", "artistas/melanie-martinez/img/cry-baby-09.jpg"],
            ["Milk and Cookies", "artistas/melanie-martinez/audio/milk-and-cookies.mp3", "artistas/melanie-martinez/img/cry-baby-10.jpg"],
            ["Pacify Her", "artistas/melanie-martinez/audio/pacify-her.mp3", "artistas/melanie-martinez/img/cry-baby-11.jpg"],
            ["Mrs. Potato Head", "artistas/melanie-martinez/audio/mrs-potato-head.mp3", "artistas/melanie-martinez/img/cry-baby-12.jpg"],
            ["Mad Hatter", "artistas/melanie-martinez/audio/mad-hatter.mp3", "artistas/melanie-martinez/img/cry-baby-13.jpg"],
            ["Play Date", "artistas/melanie-martinez/audio/play-date.mp3", "artistas/melanie-martinez/img/cry-baby-14.jpg"],
            ["Teddy Bear", "artistas/melanie-martinez/audio/teddy-bear.mp3", "artistas/melanie-martinez/img/cry-baby-15.jpg"],
            ["Cake", "artistas/melanie-martinez/audio/cake.mp3", "artistas/melanie-martinez/img/cry-baby-16.jpg"]
          ]
        },
        {
          title: "K-12",
          cover: "artistas/melanie-martinez/img/k-12.jpg",
          note: "Album visual escolar.",
          tracks: [
            ["Wheels On The Bus", "artistas/melanie-martinez/audio/wheels-on-the-bus.mp3", "artistas/melanie-martinez/img/k-12.jpg"],
            ["Class Fight", "artistas/melanie-martinez/audio/class-fight.mp3", "artistas/melanie-martinez/img/k-12.jpg"],
            ["The Principal", "artistas/melanie-martinez/audio/the-principal.mp3", "artistas/melanie-martinez/img/k-12.jpg"],
            ["Show And Tell", "artistas/melanie-martinez/audio/show-and-tell.mp3", "artistas/melanie-martinez/img/k-12.jpg"],
            ["Nurse's Office", "artistas/melanie-martinez/audio/nurses-office.mp3", "artistas/melanie-martinez/img/k-12.jpg"],
            ["Drama Club", "artistas/melanie-martinez/audio/drama-club.mp3", "artistas/melanie-martinez/img/k-12.jpg"],
            ["Strawberry Shortcake", "artistas/melanie-martinez/audio/strawberry-shortcake.mp3", "artistas/melanie-martinez/img/k-12.jpg"],
            ["Lunchbox Friends", "artistas/melanie-martinez/audio/lunchbox-friends.mp3", "artistas/melanie-martinez/img/k-12.jpg"],
            ["Orange Juice", "artistas/melanie-martinez/audio/orange-juice.mp3", "artistas/melanie-martinez/img/k-12.jpg"],
            ["Detention", "artistas/melanie-martinez/audio/detention.mp3", "artistas/melanie-martinez/img/k-12.jpg"],
            ["Teacher's Pet", "artistas/melanie-martinez/audio/teachers-pet.mp3", "artistas/melanie-martinez/img/k-12.jpg"],
            ["High School Sweethearts", "artistas/melanie-martinez/audio/high-school-sweethearts.mp3", "artistas/melanie-martinez/img/k-12.jpg"],
            ["Recess", "artistas/melanie-martinez/audio/recess.mp3", "artistas/melanie-martinez/img/k-12.jpg"],
            ["Fire Drill", "artistas/melanie-martinez/audio/fire-drill.mp3", "artistas/melanie-martinez/img/fire-drill.jpg"]
          ]
        },
        {
          title: "Portals",
          cover: "artistas/melanie-martinez/img/portals.jpg",
          note: "Album de transformacion y criatura fantastica.",
          tracks: [
            ["Death", "artistas/melanie-martinez/audio/death.mp3", "artistas/melanie-martinez/img/death.jpg"],
            ["Void", "artistas/melanie-martinez/audio/void.mp3", "artistas/melanie-martinez/img/void.jpg"],
            ["Tunnel Vision", "artistas/melanie-martinez/audio/tunnel.mp3", "artistas/melanie-martinez/img/tunnel.jpg"],
            ["Faerie Soiree", "artistas/melanie-martinez/audio/faerie-soiree.mp3", "artistas/melanie-martinez/img/faerie.jpg"],
            ["Light Shower", "artistas/melanie-martinez/audio/light-shower.mp3", "artistas/melanie-martinez/img/light.jpg"],
            ["Spider Web", "artistas/melanie-martinez/audio/spider-web.mp3", "artistas/melanie-martinez/img/spider.jpg"],
            ["Leeches", "artistas/melanie-martinez/audio/leeches.mp3", "artistas/melanie-martinez/img/leeches.jpg"],
            ["Battle Of The Larynx", "artistas/melanie-martinez/audio/battle-of-the-larynx.mp3", "artistas/melanie-martinez/img/battle.jpg"],
            ["The Contortionist", "artistas/melanie-martinez/audio/the-contortionist.mp3", "artistas/melanie-martinez/img/contortionist.jpg"],
            ["Moon Cycle", "artistas/melanie-martinez/audio/moon-cycle.mp3", "artistas/melanie-martinez/img/moon.jpg"],
            ["Nymphology", "artistas/melanie-martinez/audio/nymphology.mp3", "artistas/melanie-martinez/img/nymphology.jpg"],
            ["Evil", "artistas/melanie-martinez/audio/evil.mp3", "artistas/melanie-martinez/img/evil.jpg"],
            ["Womb", "artistas/melanie-martinez/audio/womb.mp3", "artistas/melanie-martinez/img/womb.jpg"],
            ["Powder", "artistas/melanie-martinez/audio/powder.mp3", "artistas/melanie-martinez/img/powder.jpg"],
            ["Pluto", "artistas/melanie-martinez/audio/pluto.mp3", "artistas/melanie-martinez/img/pluto.jpg"],
            ["Milk Of The Siren", "artistas/melanie-martinez/audio/milk-of-the-siren.mp3", "artistas/melanie-martinez/img/milk.jpg"]
          ]
        }
      ],
      eps: [
        {
          title: "Dollhouse EP",
          cover: "artistas/melanie-martinez/img/dollhouse-ep.jpg",
          note: "EP original con Dollhouse y Carousel.",
          tracks: [
            ["Dollhouse", "artistas/melanie-martinez/audio/dollhouse.mp3", "artistas/melanie-martinez/img/dollhouse-ep.jpg"],
            ["Carousel", "artistas/melanie-martinez/audio/carousel.mp3", "artistas/melanie-martinez/img/dollhouse-ep.jpg"]
          ]
        },
        {
          title: "After School EP",
          cover: "artistas/melanie-martinez/img/portada.jpg",
          note: "EP sin audios locales completos en este proyecto.",
          tracks: []
        }
      ],
      singles: [
        {
          title: "Singles",
          cover: "artistas/melanie-martinez/img/singles.jpg",
          note: "Singles con portadas originales.",
          tracks: [
            ["Dollhouse", "artistas/melanie-martinez/audio/dollhouse.mp3", "artistas/melanie-martinez/img/dollhouse-single.jpg"],
            ["Pity Party", "artistas/melanie-martinez/audio/pity-party.mp3", "artistas/melanie-martinez/img/pity-party-single.jpg"],
            ["Soap", "artistas/melanie-martinez/audio/soap.mp3", "artistas/melanie-martinez/img/soap.jpg"],
            ["Sippy Cup", "artistas/melanie-martinez/audio/sippy-cup.mp3", "artistas/melanie-martinez/img/sippy-cup-single.jpg"],
            ["Gingerbread Man", "artistas/melanie-martinez/audio/gingerbread-man.mp3", "artistas/melanie-martinez/img/portada.jpg"],
            ["Copy Cat", "artistas/melanie-martinez/audio/copy-cat.mp3", "artistas/melanie-martinez/img/copy-cat-single.jpg"],
            ["Fire Drill", "artistas/melanie-martinez/audio/fire-drill.mp3", "artistas/melanie-martinez/img/fire-drill-single.jpg"],
            ["Death", "artistas/melanie-martinez/audio/death.mp3", "artistas/melanie-martinez/img/death.jpg"],
            ["Void", "artistas/melanie-martinez/audio/void.mp3", "artistas/melanie-martinez/img/void-single.jpg"]
          ]
        }
      ]
    }
  }
];

function readCustomArtists() {
  return JSON.parse(localStorage.getItem(ARTIST_STORAGE_KEY) || "[]");
}

function saveCustomArtists(artists) {
  localStorage.setItem(ARTIST_STORAGE_KEY, JSON.stringify(artists));
}

function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function allArtists() {
  const map = new Map(defaultArtists.map((artist) => [artist.slug, structuredClone(artist)]));
  readCustomArtists().forEach((artist) => map.set(artist.slug, artist));
  return [...map.values()];
}

function findArtist(slug) {
  return allArtists().find((artist) => artist.slug === slug);
}

function saveArtist(artist) {
  const custom = readCustomArtists().filter((item) => item.slug !== artist.slug);
  custom.push(artist);
  saveCustomArtists(custom);
}

function assetUrl(path, prefix = "") {
  if (!path) return "";
  if (/^media:/.test(path)) return path;
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return `${prefix}${path}`;
}

window.artistStore = { allArtists, assetUrl, defaultArtists, findArtist, saveArtist, slugify };
