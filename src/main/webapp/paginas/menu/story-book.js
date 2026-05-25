let listaActivaId = null;
let modoFavoritosActivo = false;
const CLAVE_FAVORITOS = "wikisingers-favoritos";

function getListas() {
    try {
        const value = JSON.parse(localStorage.getItem("wikisingers-conjuros") || "[]");
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

function saveListas(listas) {
    localStorage.setItem("wikisingers-conjuros", JSON.stringify(listas));
}

function getFavoritos() {
    if (window.WikiSingersFavoritos) {
        return window.WikiSingersFavoritos.getFavoritos();
    }

    try {
        const favoritos = JSON.parse(localStorage.getItem(CLAVE_FAVORITOS) || "[]");
        return Array.isArray(favoritos) ? favoritos : [];
    } catch {
        return [];
    }
}

function saveFavoritos(favoritos) {
    if (window.WikiSingersFavoritos) {
        window.WikiSingersFavoritos.saveFavoritos(favoritos);
        return;
    }

    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
}

function actualizarListaActiva(mutador) {
    const listas = getListas();
    const index = listas.findIndex((lista) => lista.id === listaActivaId);
    if (index === -1) return null;

    listas[index] = mutador({ ...listas[index], canciones: [...(listas[index].canciones || [])] });
    saveListas(listas);
    return listas[index];
}

function normalizarTexto(valor) {
    return (valor || "")
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function idCancion(cancion) {
    return [cancion.artista, cancion.album, cancion.titulo, cancion.audio || cancion.url].join("|");
}

function obtenerAudiosPersonalizados() {
    try {
        const artistas = JSON.parse(localStorage.getItem("wikisingers_artistas_personalizados") || "[]");
        if (!Array.isArray(artistas)) return [];

        return artistas.flatMap((artista) => {
            return (artista.singles || [])
                .filter((single) => single.audio)
                .map((single) => ({
                    artista: artista.nombre,
                    album: "Singles",
                    titulo: single.titulo,
                    genero: single.genero || artista.genero || "",
                    mood: single.mood || artista.mood || "",
                    imagen: single.portada || artista.portada || "../../recursos/global/img-index/Wikisingers.png",
                    audio: single.audio,
                    url: "../artista-personalizado/Artista Personalizado.html?id=" + encodeURIComponent(artista.id)
                }));
        });
    } catch {
        return [];
    }
}

function obtenerCatalogoAudios() {
    const oficiales = (window.WIKISINGERS_CANCIONES || []).filter((cancion) => cancion.audio);
    return [...oficiales, ...obtenerAudiosPersonalizados()];
}

function renderListas() {
    const contenedor = document.getElementById("lista-conjuros");
    if (!contenedor) return;

    const listas = getListas();
    contenedor.innerHTML = '<button class="crear" onclick="nuevaLista()">CREAR PLAYLIST</button>';

    listas.forEach((lista) => {
        const enlace = document.createElement("a");
        enlace.href = "javascript:void(0)";
        enlace.textContent = `${lista.nombre} (${(lista.canciones || []).length})`;
        enlace.addEventListener("click", () => abrirConjuro(lista.id));
        contenedor.appendChild(document.createElement("br"));
        contenedor.appendChild(enlace);
    });
}

function nuevaLista() {
    const listas = getListas();
    const nombre = prompt("Nombre de la lista de reproduccion:", `Playlist ${listas.length + 1}`);
    if (nombre === null) return;

    const nueva = {
        id: `conjuro-${Date.now()}`,
        nombre: nombre.trim() || `Playlist ${listas.length + 1}`,
        portada: "../../recursos/global/img-index/gif/ouija.gif",
        canciones: []
    };

    saveListas([...listas, nueva]);
    renderListas();
    abrirConjuro(nueva.id);
}

function abrirConjuro(id) {
    modoFavoritosActivo = false;
    listaActivaId = id;
    const modal = document.getElementById("modal-conjuro");
    const lista = getListas().find((item) => item.id === id);

    if (!lista) return;

    const titulo = document.getElementById("titulo-conjuro");
    const nombreInput = document.getElementById("nombre-conjuro");
    const preview = document.getElementById("img-portada-lista");
    const buscador = document.getElementById("input-busqueda-almas");
    const sugerencias = document.getElementById("sugerencias-almas");

    if (titulo) titulo.textContent = lista.nombre;
    if (nombreInput) nombreInput.value = lista.nombre;
    configurarModalFavoritos(false);
    if (preview) preview.src = lista.portada || "../../recursos/global/img-index/gif/ouija.gif";
    if (buscador) buscador.value = "";
    if (sugerencias) sugerencias.innerHTML = "";

    renderCancionesLista(lista);
    renderReproductor(lista);

    if (modal) {
        modal.style.display = "flex";
    }
}

function configurarModalFavoritos(esFavoritos) {
    const nombre = document.querySelector(".campo-nombre-conjuro");
    const buscador = document.querySelector(".buscador-interno");
    const portada = document.querySelector(".portada-contenedor");
    const footer = document.querySelector(".footer-hoja");

    [nombre, buscador, portada, footer].forEach((elemento) => {
        if (elemento) elemento.style.display = esFavoritos ? "none" : "";
    });
}

function abrirFavoritos() {
    modoFavoritosActivo = true;
    listaActivaId = null;

    const modal = document.getElementById("modal-conjuro");
    const titulo = document.getElementById("titulo-conjuro");
    const favoritos = {
        id: "favoritos",
        nombre: "Favoritos",
        canciones: getFavoritos()
    };

    if (titulo) titulo.textContent = "Favoritos";
    configurarModalFavoritos(true);
    renderCancionesLista(favoritos);
    renderReproductor(favoritos);

    if (modal) {
        modal.style.display = "flex";
    }
}

function cerrarConjuro() {
    const modal = document.getElementById("modal-conjuro");
    const sugerencias = document.getElementById("sugerencias-almas");
    if (sugerencias) sugerencias.innerHTML = "";
    if (modal) {
        modal.style.display = "none";
    }
    configurarModalFavoritos(false);
    modoFavoritosActivo = false;
}

function eliminarConjuro(id) {
    if (!id) return;
    if (!confirm("Eliminar esta lista de reproduccion?")) return;

    saveListas(getListas().filter((lista) => lista.id !== id));
    listaActivaId = null;
    cerrarConjuro();
    renderListas();
}

function guardarNombreConjuro() {
    const input = document.getElementById("nombre-conjuro");
    if (!input || !listaActivaId) return;

    const nombre = input.value.trim() || "Playlist sin nombre";
    const lista = actualizarListaActiva((actual) => ({ ...actual, nombre }));
    const titulo = document.getElementById("titulo-conjuro");
    if (titulo && lista) titulo.textContent = lista.nombre;
    renderListas();
}

function subirImagenLocal(event) {
    const file = event.target.files && event.target.files[0];
    const preview = document.getElementById("img-portada-lista");
    if (!file || !preview || !listaActivaId) return;

    const reader = new FileReader();
    reader.onload = () => {
        preview.src = reader.result;
        actualizarListaActiva((lista) => ({ ...lista, portada: reader.result }));
    };
    reader.readAsDataURL(file);
}

function filtrarContenido() {
    const input = document.getElementById("input-busqueda-almas");
    const contenedor = document.getElementById("sugerencias-almas");
    if (!input || !contenedor || !listaActivaId) return;

    const termino = normalizarTexto(input.value);
    contenedor.innerHTML = "";

    if (!termino) return;

    const lista = getListas().find((item) => item.id === listaActivaId);
    const yaAnadidas = new Set((lista?.canciones || []).map(idCancion));
    const resultados = obtenerCatalogoAudios()
        .filter((cancion) => {
            const texto = normalizarTexto([cancion.titulo, cancion.artista, cancion.album, cancion.genero, cancion.mood].join(" "));
            return texto.includes(termino) && !yaAnadidas.has(idCancion(cancion));
        })
        .slice(0, 12);

    if (!resultados.length) {
        contenedor.innerHTML = '<div class="sugerencia-item">No hay audios disponibles con esa busqueda.</div>';
        return;
    }

    resultados.forEach((cancion) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "sugerencia-item sugerencia-audio";
        item.innerHTML = `
            <span>${cancion.titulo}</span>
            <small>${cancion.artista} / ${cancion.album}</small>
        `;
        item.addEventListener("click", () => agregarCancionALista(cancion));
        contenedor.appendChild(item);
    });
}

function agregarCancionALista(cancion) {
    if (!listaActivaId || !cancion.audio) return;

    const lista = actualizarListaActiva((actual) => {
        const existentes = new Set((actual.canciones || []).map(idCancion));
        if (!existentes.has(idCancion(cancion))) {
            actual.canciones.push(cancion);
        }
        return actual;
    });

    const input = document.getElementById("input-busqueda-almas");
    const sugerencias = document.getElementById("sugerencias-almas");
    if (input) input.value = "";
    if (sugerencias) sugerencias.innerHTML = "";

    renderCancionesLista(lista);
    renderReproductor(lista);
    renderListas();
}

function quitarCancionDeLista(indice) {
    if (modoFavoritosActivo) {
        const favoritos = getFavoritos();
        favoritos.splice(indice, 1);
        saveFavoritos(favoritos);
        const lista = { id: "favoritos", nombre: "Favoritos", canciones: favoritos };
        renderCancionesLista(lista);
        renderReproductor(lista);
        renderFavoritos();
        return;
    }

    const lista = actualizarListaActiva((actual) => {
        actual.canciones.splice(indice, 1);
        return actual;
    });

    renderCancionesLista(lista);
    renderReproductor(lista);
    renderListas();
}

function renderFavoritos() {
    const contenedor = document.getElementById("lista-favoritos");
    if (!contenedor) return;

    const favoritos = getFavoritos();
    contenedor.innerHTML = "";

    const abrir = document.createElement("button");
    abrir.type = "button";
    abrir.className = "crear";
    abrir.textContent = `REPRODUCIR FAVORITOS (${favoritos.length})`;
    abrir.addEventListener("click", abrirFavoritos);
    contenedor.appendChild(abrir);

    if (!favoritos.length) {
        const vacio = document.createElement("p");
        vacio.className = "favoritos-vacio";
        vacio.textContent = "Marca canciones con el corazon para guardarlas aqui.";
        contenedor.appendChild(vacio);
        return;
    }

    favoritos.slice(0, 8).forEach((cancion) => {
        const enlace = document.createElement("a");
        enlace.href = "javascript:void(0)";
        enlace.textContent = cancion.titulo;
        enlace.addEventListener("click", abrirFavoritos);
        contenedor.appendChild(document.createElement("br"));
        contenedor.appendChild(enlace);
    });
}

function renderCancionesLista(lista) {
    const contenedor = document.getElementById("lista-canciones-interna");
    if (!contenedor) return;

    const canciones = lista?.canciones || [];
    contenedor.innerHTML = "";

    if (!canciones.length) {
        contenedor.innerHTML = '<p class="playlist-vacia">Busca audios y anadelos a esta lista.</p>';
        return;
    }

    canciones.forEach((cancion, index) => {
        const item = document.createElement("div");
        item.className = "alma-item";
        item.innerHTML = `
            <div class="alma-info">
                <strong>${cancion.titulo}</strong>
                <span>${cancion.artista} / ${cancion.album}</span>
            </div>
            <button type="button" class="btn-quitar-alma" aria-label="Quitar cancion">&times;</button>
        `;
        item.querySelector("button").addEventListener("click", () => quitarCancionDeLista(index));
        contenedor.appendChild(item);
    });
}

function renderReproductor(lista) {
    const contenedor = document.getElementById("reproductor-frame");
    if (!contenedor) return;

    const canciones = lista?.canciones || [];
    contenedor.innerHTML = "";

    if (!canciones.length) {
        contenedor.innerHTML = '<p class="playlist-vacia">La playlist aun no tiene audios.</p>';
        return;
    }

    canciones.forEach((cancion, index) => {
        const pista = document.createElement("article");
        pista.className = "pista-playlist";
        pista.innerHTML = `
            <img src="${cancion.imagen || '../../recursos/global/img-index/Wikisingers.png'}" alt="">
            <div>
                <strong>${index + 1}. ${cancion.titulo}</strong>
                <span>${cancion.artista}</span>
                <audio controls preload="none" src="${cancion.audio}"></audio>
            </div>
        `;
        contenedor.appendChild(pista);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderListas();
    renderFavoritos();

    const nombreInput = document.getElementById("nombre-conjuro");
    if (nombreInput) {
        nombreInput.addEventListener("change", guardarNombreConjuro);
        nombreInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                guardarNombreConjuro();
            }
        });
    }
});

window.addEventListener("wikisingers:favoritos", renderFavoritos);
window.abrirFavoritos = abrirFavoritos;
window.renderFavoritos = renderFavoritos;

