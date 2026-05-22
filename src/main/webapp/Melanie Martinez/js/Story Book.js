// ============================================================
// DETECTAR LIBRO ACTUAL
// ============================================================

const libro = document.getElementById('miLibro');

let currentLocation = 1;
let totalPages = 0;

let mapaCanciones = {};

function prepararImagenesTraseras() {

    document.querySelectorAll('.hoja').forEach((hoja) => {

        const trasera = hoja.querySelector('.cara.trasera');
        if (!trasera) return;

        const rutaImagen =
            hoja.dataset.imagenTrasera ||
            hoja.dataset.backImage ||
            trasera.dataset.imagenTrasera ||
            trasera.dataset.backImage;

        let imagen = trasera.querySelector('img');

        if (!imagen && rutaImagen) {
            imagen = document.createElement('img');
            imagen.src = rutaImagen;
            imagen.alt = hoja.dataset.altTrasera || trasera.dataset.altTrasera || '';
            trasera.appendChild(imagen);
        }

        if (imagen) {
            imagen.classList.add('imagen-trasera-hoja');
            trasera.classList.add('tiene-imagen-trasera');
        }
    });
}

prepararImagenesTraseras();

function obtenerImagenTrasera(hoja) {

    if (!hoja) return "";

    const trasera = hoja.querySelector('.cara.trasera');
    const imagen = trasera ? trasera.querySelector('img') : null;

    return hoja.dataset.imagenTrasera ||
        hoja.dataset.backImage ||
        (trasera && (trasera.dataset.imagenTrasera || trasera.dataset.backImage)) ||
        (imagen ? imagen.getAttribute('src') : "") ||
        "";
}

function obtenerPaginaIzquierdaVisual() {

    if (!libro) return null;

    let pagina = libro.querySelector('.pagina-izquierda-visual');

    if (!pagina) {
        pagina = document.createElement('div');
        pagina.className = 'pagina-izquierda-visual';
        libro.appendChild(pagina);
    }

    return pagina;
}

function actualizarPaginaIzquierda() {

    const pagina = obtenerPaginaIzquierdaVisual();
    if (!pagina || !libro) return;

    if (!libro.classList.contains('abierto') || currentLocation <= 1) {
        pagina.classList.remove('activa', 'con-imagen');
        pagina.innerHTML = '';
        return;
    }

    const hojaActual = document.getElementById(`p${currentLocation - 1}`);
    const rutaImagen = obtenerImagenTrasera(hojaActual);

    pagina.classList.add('activa');
    pagina.classList.toggle('con-imagen', Boolean(rutaImagen));

    if (rutaImagen) {
        pagina.innerHTML = `<img src="${rutaImagen}" alt="">`;
    } else {
        pagina.innerHTML = '';
    }
}

function resetearLibroCerrado() {

    document.querySelectorAll('.hoja').forEach((hoja, index) => {
        hoja.classList.remove('girada', 'pasando-adelante', 'pasando-atras');
        hoja.style.zIndex = totalPages - index;
    });

    currentLocation = 1;
    actualizarPaginaIzquierda();
}

// ============================================================
// DETECTAR SI ES K-12 O CRY BABY
// ============================================================

const tituloPagina =
    document.title.toLowerCase();

// ============================================================
// K-12
// ============================================================

if (tituloPagina.includes("k-12")) {

    totalPages = 17;

    mapaCanciones = {

        "wheels on the bus": 3,
        "class fight": 4,
        "the principal": 5,

        "show and tell": 6,
        "show & tell": 6,

        "nurse's office": 7,
        "nurses office": 7,

        "drama club": 8,
        "strawberry shortcake": 9,
        "lunchbox friends": 10,
        "orange juice": 11,
        "detention": 12,

        "teacher's pet": 13,
        "teachers pet": 13,

        "high school sweethearts": 14,

        "recess": 15,
        "recces": 15,

        "index": 2,
        "indice": 2,
        "portada": 1
    };
}

// ============================================================
// PORTALS
// ============================================================

else if (tituloPagina.includes("portals")) {

    totalPages = 20;

    mapaCanciones = {

        "death": 3,
        "void": 4,
        "tunnel vision": 5,
        "faerie soiree": 6,
        "light shower": 7,
        "spider web": 8,
        "leeches": 9,
        "battle of the larynx": 10,
        "the contortionist": 11,
        "moon cycle": 12,
        "nymphology": 13,
        "evil": 14,
        "womb": 15,
        "powder": 16,
        "pluto": 17,
        "milk of the sirens": 18,

        "index": 2,
        "indice": 2,
        "portada": 1
    };
}

// ============================================================
// HADES
// Misma estructura que Cry Baby: portada, indice, canciones y fin
// ============================================================

else if (tituloPagina.includes("hades")) {

    totalPages = 21;

    mapaCanciones = {

        "garbage": 3,

        "is this a cult?": 4,
        "is this a cult": 4,

        "possession": 5,
        "white boy with a gun": 6,
        "disney princess": 7,
        "grudges": 8,

        "monopolyman": 9,
        "monopoly man": 9,

        "avoidant": 10,
        "monolith": 11,

        "weight watchers": 12,
        "height watchers": 12,

        "the plague": 13,
        "batshit intelligence": 14,
        "gutter": 15,

        "uncanny valley": 16,
        "unncany valley": 16,

        "the vatican": 17,

        "hell's front porch": 18,
        "hells front porch": 18,

        "chatroom": 19,
        "the last two people on earth": 20,
        "fin": 21,

        "index": 2,
        "indice": 2,
        "portada": 1
    };
}

// ============================================================
// CRY BABY
// ============================================================

else {

    totalPages = 20;

    mapaCanciones = {

        "cry baby": 3,
        "dollhouse": 4,
        "sippy cup": 5,
        "carousel": 6,
        "alphabet boy": 7,
        "soap": 8,
        "training wheels": 9,
        "pity party": 10,

        "tag you're it": 11,
        "tag youre it": 11,

        "milk and cookies": 12,
        "milk & cookies": 12,

        "pacify her": 13,

        "mrs potato head": 14,
        "mrs. potato head": 14,

        "mad hatter": 15,
        "play date": 16,
        "teddy bear": 17,
        "cake": 18,

        "index": 2,
        "indice": 2,
        "portada": 1
    };
}
// ============================================================
// ELEMENTOS HTML
// ============================================================

const btnCentral =
    document.getElementById('btnLibro');

const contenedorControles =
    document.querySelector('.controles-libro');

// ============================================================
// ABRIR / CERRAR LIBRO
// ============================================================

function abrirCerrar() {

    if (!libro) return;

    // ========================================================
    // CERRAR
    // ========================================================

    if (libro.classList.contains('abierto')) {

        libro.classList.remove('abierto');

        resetearLibroCerrado();

        if (btnCentral) {
            btnCentral.innerText = "Abrir Cuento";
        }

        if (contenedorControles) {

            contenedorControles.classList.remove(
                'mostrar-laterales'
            );
        }

    }

    // ========================================================
    // ABRIR
    // ========================================================

    else {

        libro.classList.add('abierto');

        if (btnCentral) {
            btnCentral.innerText = "Cerrar Cuento";
        }

        if (contenedorControles) {

            contenedorControles.classList.add(
                'mostrar-laterales'
            );
        }

        if (currentLocation === 1) {
            avanzar();
        } else {
            actualizarPaginaIzquierda();
        }
    }
}

// ============================================================
// AVANZAR
// ============================================================

function avanzar() {

    if (currentLocation < totalPages) {

        const hoja =
            document.getElementById(
                `p${currentLocation}`
            );

        if (hoja) {

            hoja.classList.add('girada');

            hoja.style.zIndex =
                20 + currentLocation;

            currentLocation++;

            actualizarPaginaIzquierda();
        }
    }
}

// ============================================================
// RETROCEDER
// ============================================================

function retroceder() {

    if (currentLocation > 1) {

        currentLocation--;

        const hoja =
            document.getElementById(
                `p${currentLocation}`
            );

        if (hoja) {

            hoja.classList.remove('girada');

            hoja.style.zIndex =
                20 - currentLocation;

            actualizarPaginaIzquierda();
        }
    }
}

// ============================================================
// IR DIRECTAMENTE A UNA PÁGINA
// ============================================================

function irAPaginaDirecto(destino) {

    if (!libro) return;

    // Abrir automáticamente

    if (!libro.classList.contains('abierto')) {
        abrirCerrar();
    }

    setTimeout(() => {

        for (
            let i = 1;
            i < totalPages;
            i++
        ) {

            const hoja =
                document.getElementById(`p${i}`);

            if (!hoja) continue;

            // =================================================
            // GIRAR
            // =================================================

            if (i < destino) {

                hoja.classList.add('girada');

                hoja.style.zIndex = 20 + i;
            }

            // =================================================
            // NO GIRAR
            // =================================================

            else {

                hoja.classList.remove('girada');

                hoja.style.zIndex = 20 - i;
            }
        }

        currentLocation = destino;
        actualizarPaginaIzquierda();

    }, 100);
}

// ============================================================
// BUSCADOR
// ============================================================

function Ejecutar() {

    const input =
        document.getElementById(
            'mibuscador'
        );

    if (!input) return;

    const busqueda =
        input.value
        .toLowerCase()
        .trim();

    // ========================================================
    // SI EXISTE
    // ========================================================

    if (mapaCanciones[busqueda]) {

        irAPaginaDirecto(
            mapaCanciones[busqueda]
        );

        input.value = "";
    }

    // ========================================================
    // SI NO EXISTE
    // ========================================================

    else {

        alert(
            "Esa canción no existe en este álbum."
        );
    }
}

// ============================================================
// ENTER PARA BUSCAR
// ============================================================

const buscador =
    document.getElementById(
        'mibuscador'
    );

if (buscador) {

    buscador.addEventListener(
        'keypress',

        function (e) {

            if (e.key === 'Enter') {
                Ejecutar();
            }
        }
    );
}
function reproducirMusica(idAudio) {
    const sonido = document.getElementById(idAudio);
    
    // Si el sonido ya se está reproduciendo, lo pausa. 
    // Si no, lo reproduce.
    if (sonido.paused) {
        sonido.play();
        console.log("Reproduciendo: " + idAudio);
    } else {
        sonido.pause();
        console.log("Pausado: " + idAudio);
    }
}
function abrirPelicula() {
    const modal = document.getElementById('modalPelicula');
    const video = document.getElementById('videoLocalK12');

    modal.style.display = "flex";
    
    // Intentar reproducir automáticamente al abrir
    if (video) {
        video.play();
    }
}

function cerrarPelicula() {
    const modal = document.getElementById('modalPelicula');
    const video = document.getElementById('videoLocalK12');

    modal.style.display = "none";

    // Pausar el video para que no se siga escuchando al cerrar
    if (video) {
        video.pause();
        video.currentTime = 0; // Opcional: vuelve al inicio
    }
}
document.addEventListener("DOMContentLoaded", function() {
    const portal = document.getElementById('portal-portals');
    const contenido = document.getElementById('pagina-contenido');

    if (portal && contenido) {
        portal.onclick = function() {
            if (portal.classList.contains('portal-animacion-entrada')) return;

            document.body.classList.add('portal-entrando');
            portal.classList.add('portal-atraccion');

            setTimeout(() => {
                portal.classList.add('portal-animacion-entrada');
            }, 120);

            setTimeout(() => {
                contenido.classList.add('interfaz-visible');
            }, 420);

            setTimeout(() => {
                portal.classList.add('portal-desvanecer');
            }, 760);

            setTimeout(() => {
                portal.style.display = 'none';
                document.body.classList.remove('portal-entrando');
                document.body.classList.remove('portal-pendiente');
                document.body.classList.add('portal-listo');
            }, 1180);

            /*
            // 1. Iniciamos la explosión de luz
            portal.classList.add('portal-animacion-entrada');

            // 2. Revelamos la interfaz (botones, libro, etc)
            setTimeout(() => {
                contenido.classList.add('interfaz-visible');
            }, 500); // Empieza a aparecer a mitad de la transición

            // 3. Eliminamos el portal para que puedas clicar en los botones
            setTimeout(() => {
                portal.style.display = 'none';
            }, 1500);
            */
        };
    }
});
