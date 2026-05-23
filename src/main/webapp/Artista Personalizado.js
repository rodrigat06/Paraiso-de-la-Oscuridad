const CLAVE_ARTISTAS_PERSONALIZADOS = "wikisingers_artistas_personalizados";
const params = new URLSearchParams(window.location.search);
const artistaId = params.get("id");
function obtenerBaseWebapp() {
    return window.location.pathname.toLowerCase().includes("/paginas/artista-personalizado/") ? "../../" : "";
}

const baseWebapp = obtenerBaseWebapp();
const imagenDefecto = `${baseWebapp}img index/Wikisingers.png`;
const iconosSecciones = {
    albums: `${baseWebapp}Jazmin Bean/gifs/Albumes.gif`,
    eps: `${baseWebapp}Jazmin Bean/gifs/Singles.gif`,
    singles: `${baseWebapp}Jazmin Bean/gifs/Singles.gif`,
    significados: `${baseWebapp}Jazmin Bean/img/significado.png`,
    biografia: `${baseWebapp}img index/Informacion.png`
};
const generosBase = ["Alt-Pop", "Indie Pop", "Electropop", "Darkpop", "Bubblegum Pop", "Trap", "Trap Metal", "Hip Hop", "Pop-Rock", "Alt-Rock"];
const moodsBase = ["Alegre", "Amor", "Concentración", "Energía", "Fiesta", "Rabia", "Relax", "Triste"];
let artistasEnMemoria = null;

function obtenerVisualSeccion(artista, vista) {
    const visual = artista?.visuales?.secciones?.[vista];
    if (visual && !/Albumes \.gif|merchandaising\.gif|Biografia\.gif/i.test(visual)) return visual;
    return iconosSecciones[vista] || iconosSecciones.albums;
}

function prepararNavegacionArtista(artista) {
    document.querySelectorAll(".nav-artista-personalizado [data-vista]").forEach((boton) => {
        const vista = boton.dataset.vista;
        const texto = boton.querySelector("span")?.textContent.trim() || boton.textContent.trim();
        boton.innerHTML = `
            <img src="${escapar(obtenerVisualSeccion(artista, vista))}" alt="${escapar(texto)}" class="icono-pixel" onerror="this.onerror=null;this.src='${escapar(iconosSecciones[vista] || imagenDefecto)}';">
            <span>${escapar(texto)}</span>
        `;
    });
}

function obtenerArtistas() {
    if (artistasEnMemoria) return artistasEnMemoria;
    try {
        const datos = JSON.parse(localStorage.getItem(CLAVE_ARTISTAS_PERSONALIZADOS)) || [];
        artistasEnMemoria = Array.isArray(datos) ? datos : [];
        return artistasEnMemoria;
    } catch (error) {
        artistasEnMemoria = [];
        return [];
    }
}

function guardarArtistas(artistas) {
    const valor = JSON.stringify(artistas);
    artistasEnMemoria = artistas;
    try {
        localStorage.setItem(CLAVE_ARTISTAS_PERSONALIZADOS, valor);
    } catch (error) {
        console.warn("El navegador no ha podido guardar todo localmente. Se intentara guardar en MySQL.", error);
        window.WikiSingersSQL?.guardarEstado?.(CLAVE_ARTISTAS_PERSONALIZADOS, valor, { global: true }).catch((sqlError) => {
            console.error("No se pudo guardar el artista en MySQL.", sqlError);
            alert("No se pudo guardar en MySQL. Revisa que Tomcat y MySQL esten activos.");
        });
    }
}

function emailUsuarioActual() {
    return (localStorage.getItem("sportbook-user-email") || localStorage.getItem("user-email") || "").trim().toLowerCase();
}

function esAdministrador() {
    return (localStorage.getItem("sportbook-user-role") || "").toLowerCase() === "admin";
}

function puedeEditarArtista(artista) {
    if (!artista) return false;
    if (esAdministrador()) return true;
    const owner = String(artista.ownerEmail || artista.creadorEmail || artista.email || "").trim().toLowerCase();
    if (!owner) return false;
    return owner === emailUsuarioActual();
}

function obtenerArtistaActual() {
    return obtenerArtistas().find((artista) => artista.id === artistaId);
}

function actualizarArtista(mutador, opciones = {}) {
    const artistas = obtenerArtistas();
    const indice = artistas.findIndex((artista) => artista.id === artistaId);
    if (indice === -1) return;
    if (!opciones.permitirVisitante && !puedeEditarArtista(artistas[indice])) {
        alert("Solo el creador o el administrador pueden modificar esta música.");
        return;
    }
    mutador(artistas[indice]);
    guardarArtistas(artistas);
    renderizar();
}

function escapar(texto) {
    return String(texto || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function escaparSelector(texto) {
    if (window.CSS && CSS.escape) return CSS.escape(texto);
    return String(texto || "").replace(/["\\]/g, "\\$&");
}

function leerArchivoComoDataUrl(archivo, respaldo) {
    return new Promise((resolve) => {
        if (!archivo) {
            resolve(respaldo || imagenDefecto);
            return;
        }

        const lector = new FileReader();
        lector.onload = () => resolve(lector.result);
        lector.onerror = () => resolve(respaldo || imagenDefecto);
        lector.readAsDataURL(archivo);
    });
}

async function leerArchivosComoDataUrl(archivos) {
    const lista = Array.from(archivos || []);
    const resultados = [];
    for (const archivo of lista) {
        resultados.push(await leerArchivoComoDataUrl(archivo, ""));
    }
    return resultados.filter(Boolean);
}

function apiUrl(ruta) {
    const path = window.location.pathname;
    const origin = window.location.origin;
    const context = path.includes("/buscador-contactos/") ? "/buscador-contactos" : "";
    return `${origin}${context}${ruta}`;
}

async function subirArchivoASql(archivo) {
    if (!archivo) return "";

    const datos = new FormData();
    datos.append("archivo", archivo);

    const respuesta = await fetch(apiUrl("/api/media"), {
        method: "POST",
        body: datos
    });

    const json = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok || json.ok === false) {
        throw new Error(json.mensaje || "No se pudo guardar el archivo.");
    }

    return json.url || apiUrl(`/api/media?id=${json.id}`);
}

function opcionesCatalogo(campo, base) {
    const valores = new Set(base);
    (window.WIKISINGERS_CANCIONES || []).forEach((cancion) => {
        if (cancion[campo]) valores.add(cancion[campo]);
    });
    return Array.from(valores).sort((a, b) => a.localeCompare(b, "es"));
}

function poblarSelectsMusicales() {
    const generos = opcionesCatalogo("genero", generosBase);
    const moods = opcionesCatalogo("mood", moodsBase);
    const pintar = (select, opciones, textoVacio) => {
        const valorActual = select.value;
        select.innerHTML = `<option value="">${textoVacio}</option>${opciones.map((opcion) => `<option value="${escapar(opcion)}">${escapar(opcion)}</option>`).join("")}`;
        select.value = valorActual;
    };

    document.querySelectorAll("[data-select-genero]").forEach((select) => pintar(select, generos, "Elige genero"));
    document.querySelectorAll("[data-select-mood]").forEach((select) => pintar(select, moods, "Elige mood"));
}

function crearIdCancion(texto) {
    return String(texto || "cancion")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") + "-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

function cancionesDesdeTexto(texto) {
    const generoFormulario = cancionesDesdeTexto.generoFormulario || "";
    const moodFormulario = cancionesDesdeTexto.moodFormulario || "";
    return texto
        .split(/\r?\n|,/)
        .map((cancion) => cancion.trim())
        .filter(Boolean)
        .map((linea) => {
            const partes = linea.split("|").map((parte) => parte.trim());
            return {
                id: crearIdCancion(partes[0]),
                titulo: partes[0] || "",
                genero: partes.length > 2 ? partes[1] : generoFormulario,
                mood: partes.length > 2 ? partes[2] : moodFormulario,
                audio: partes.length > 2 ? partes[3] : partes[1] || ""
            };
        })
        .filter((cancion) => cancion.titulo);
}

function asegurarEstructuraArtista(artista) {
    let cambiado = false;
    artista.tipo = artista.tipo || "famoso";
    artista.interacciones = artista.interacciones || {};
    artista.visuales = artista.visuales || {};
    artista.visuales.secciones = artista.visuales.secciones || {};
    artista.visuales.carrusel = artista.visuales.carrusel || [];

    ["albums", "eps"].forEach((coleccion) => {
        (artista[coleccion] || []).forEach((item) => {
            item.canciones = (item.canciones || []).map((cancion) => {
                if (typeof cancion === "string") {
                    cambiado = true;
                    return { id: crearIdCancion(cancion), titulo: cancion, genero: "", mood: "", audio: "" };
                }

                if (!cancion.id) {
                    cancion.id = crearIdCancion(cancion.titulo);
                    cambiado = true;
                }

                return cancion;
            });
        });
    });

    (artista.singles || []).forEach((single) => {
        if (!single.id) {
            single.id = crearIdCancion(single.titulo);
            cambiado = true;
        }
    });

    return cambiado;
}

function textoCancion(cancion) {
    if (typeof cancion === "string") return cancion;
    return cancion.titulo || "";
}

function metaCancion(cancion) {
    if (typeof cancion === "string") return "";
    return [cancion.genero, cancion.mood].filter(Boolean).join(" / ");
}

function obtenerInteraccion(artista, idCancion) {
    artista.interacciones = artista.interacciones || {};
    return artista.interacciones[idCancion] || { estrellas: 0, comentarios: [] };
}

function mediaEstrellas(interaccion) {
    const estrellas = Number(interaccion.estrellas || 0);
    return estrellas ? `${estrellas}/5` : "Sin valorar";
}

function renderFeedbackCancion(artista, idCancion, titulo) {
    const interaccion = obtenerInteraccion(artista, idCancion);
    const estrellas = Number(interaccion.estrellas || 0);
    const comentarios = interaccion.comentarios || [];

    return `
        <section class="zona-opinion-cancion" data-cancion-id="${escapar(idCancion)}">
            <header><span>${escapar(titulo)}</span><strong>${mediaEstrellas(interaccion)}</strong></header>
            <div class="estrellas-cancion" aria-label="Valorar ${escapar(titulo)}">
                ${[1, 2, 3, 4, 5].map((valor) => `<button type="button" data-estrellas="${valor}" class="${valor <= estrellas ? "activa" : ""}">★</button>`).join("")}
            </div>
            <form class="form-comentario-cancion" data-comentario-cancion="${escapar(idCancion)}">
                <input name="comentario" type="text" placeholder="Comentar esta cancion...">
                <button type="submit">Enviar</button>
            </form>
            <div class="comentarios-cancion">${comentarios.length ? comentarios.map((comentario) => `<p>${escapar(comentario)}</p>`).join("") : "<p>Sin comentarios todavia.</p>"}</div>
        </section>
    `;
}

function aplicarEstetica(artista) {
    const estetica = artista.estetica || {};
    const principal = estetica.principal || "#ff7fa7";
    const secundario = estetica.secundario || "#66dbff";
    const fondo = estetica.fondo || "#e68e9e";

    document.documentElement.style.setProperty("--artist-primary", principal);
    document.documentElement.style.setProperty("--artist-secondary", secundario);
    document.documentElement.style.setProperty("--artist-bg", fondo);
    document.getElementById("color-principal").value = principal;
    document.getElementById("color-secundario").value = secundario;
    document.getElementById("color-fondo").value = fondo;
}

function crearVacio(texto) {
    const vacio = document.createElement("p");
    vacio.className = "estado-vacio";
    vacio.textContent = texto;
    return vacio;
}

function crearBotonBorrar(nombreColeccion, indice) {
    const borrar = document.createElement("button");
    borrar.type = "button";
    borrar.className = "boton-quitar";
    borrar.textContent = "Quitar";
    borrar.addEventListener("click", () => {
        actualizarArtista((actual) => actual[nombreColeccion].splice(indice, 1));
    });
    return borrar;
}

function renderFormularioEditarLibro(nombreColeccion, indice, item) {
    const generos = opcionesCatalogo("genero", generosBase);
    const moods = opcionesCatalogo("mood", moodsBase);
    const tipo = nombreColeccion === "albums" ? "album" : "EP";

    return `
        <details class="editor-cancion-libro editor-libro-existente">
            <summary>Editar ${tipo}</summary>
            <form data-form-editar-libro="${escapar(nombreColeccion)}" data-indice-libro="${indice}">
                <label>
                    Nombre del ${tipo}
                    <small>Cambia el titulo si te has confundido.</small>
                    <input name="titulo" type="text" required value="${escapar(item.titulo || "")}">
                </label>
                <div class="fila-editor-doble">
                    <label>
                        Genero general
                        <small>Se usara como referencia para el libro.</small>
                        <select name="genero">${opcionesSelectHtml(generos, item.genero || "", "Elige genero")}</select>
                    </label>
                    <label>
                        Mood general
                        <small>Se usara como referencia para el libro.</small>
                        <select name="mood">${opcionesSelectHtml(moods, item.mood || "", "Elige mood")}</select>
                    </label>
                </div>
                <label>
                    Cambiar portada
                    <small>Opcional. Si no eliges nada, se mantiene la portada actual.</small>
                    <input name="portada" type="file" accept="image/*">
                </label>
                <button type="submit">Guardar cambios</button>
            </form>
        </details>
    `;
}

function renderFormularioEditarCancion(nombreColeccion, indiceLibro, indiceCancion, cancion) {
    const generos = opcionesCatalogo("genero", generosBase);
    const moods = opcionesCatalogo("mood", moodsBase);

    return `
        <details class="editor-cancion-libro editor-cancion-existente">
            <summary>Editar cancion</summary>
            <form data-form-editar-cancion="${escapar(nombreColeccion)}" data-indice-libro="${indiceLibro}" data-indice-cancion="${indiceCancion}">
                <label>
                    Nombre de la cancion
                    <small>Cambia el nombre que aparece dentro del libro.</small>
                    <input name="titulo" type="text" required value="${escapar(textoCancion(cancion))}">
                </label>
                <div class="fila-editor-doble">
                    <label>
                        Genero
                        <small>Corrige el estilo musical.</small>
                        <select name="genero">${opcionesSelectHtml(generos, cancion.genero || "", "Elige genero")}</select>
                    </label>
                    <label>
                        Mood
                        <small>Corrige la emocion.</small>
                        <select name="mood">${opcionesSelectHtml(moods, cancion.mood || "", "Elige mood")}</select>
                    </label>
                </div>
                <label>
                    Cambiar audio
                    <small>Opcional. Si no eliges nada, se mantiene el audio actual.</small>
                    <input name="audio" type="file" accept="audio/*">
                </label>
                <button type="submit">Guardar cancion</button>
            </form>
        </details>
    `;
}

function opcionesSelectHtml(opciones, valorActual, textoVacio) {
    return `<option value="">${escapar(textoVacio)}</option>${opciones.map((opcion) => `<option value="${escapar(opcion)}"${opcion === valorActual ? " selected" : ""}>${escapar(opcion)}</option>`).join("")}`;
}

function renderFormularioCancionLibro(nombreColeccion, indice, item) {
    const generos = opcionesCatalogo("genero", generosBase);
    const moods = opcionesCatalogo("mood", moodsBase);
    const tipo = nombreColeccion === "albums" ? "album" : "EP";

    return `
        <details class="editor-cancion-libro">
            <summary>Añadir cancion al ${tipo}</summary>
            <form data-form-cancion-libro="${escapar(nombreColeccion)}" data-indice-libro="${indice}">
                <label>
                    Nombre de la cancion
                    <small>Este nombre aparecera dentro del libro.</small>
                    <input name="titulo" type="text" required placeholder="Ejemplo: Mi cancion">
                </label>
                <div class="fila-editor-doble">
                    <label>
                        Genero
                        <small>Estilo de esta cancion.</small>
                        <select name="genero">${opcionesSelectHtml(generos, item.genero || "", "Elige genero")}</select>
                    </label>
                    <label>
                        Mood
                        <small>Emocion de esta cancion.</small>
                        <select name="mood">${opcionesSelectHtml(moods, item.mood || "", "Elige mood")}</select>
                    </label>
                </div>
                <label>
                    Audio de la cancion
                    <small>Opcional. Puedes subir MP3, WAV u OGG.</small>
                    <input name="audio" type="file" accept="audio/*">
                </label>
                <button type="submit">Guardar cancion</button>
            </form>
        </details>
    `;
}

function renderizarLibros(artista, nombreColeccion) {
    const contenedor = document.querySelector(`[data-lista="${nombreColeccion}"]`);
    const coleccion = artista[nombreColeccion] || [];
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (coleccion.length === 0) {
        contenedor.appendChild(crearVacio(nombreColeccion === "albums" ? "Todavia no hay albums." : "Todavia no hay EPs."));
        return;
    }

    coleccion.forEach((item, indice) => {
        const tarjeta = document.createElement("article");
        const canciones = item.canciones || [];
        tarjeta.className = "libro-personalizado";
        tarjeta.innerHTML = `
            <div class="libro-portada"><img src="${escapar(item.portada || artista.portada || imagenDefecto)}" alt="${escapar(item.titulo)}"></div>
            <div class="libro-paginas">
                <p>${nombreColeccion === "albums" ? "Album" : "EP"}</p>
                <h3>${escapar(item.titulo)}</h3>
                ${renderFormularioEditarLibro(nombreColeccion, indice, item)}
                <ul>${canciones.length ? canciones.map((cancion, indiceCancion) => {
                    const meta = metaCancion(cancion);
                    const id = typeof cancion === "object" ? cancion.id : crearIdCancion(cancion);
                    const audio = typeof cancion === "object" ? cancion.audio : "";
                    return `<li data-ir-cancion="${escapar(id)}"><span>${escapar(textoCancion(cancion))}</span>${meta ? `<small>${escapar(meta)}</small>` : ""}${audio ? `<audio class="audio-cancion-libro" controls preload="none" src="${escapar(audio)}"></audio>` : ""}${renderFormularioEditarCancion(nombreColeccion, indice, indiceCancion, cancion)}</li>`;
                }).join("") : "<li><span>Sin canciones todavia</span></li>"}</ul>
                ${renderFormularioCancionLibro(nombreColeccion, indice, item)}
                <div class="opiniones-libro">${canciones.map((cancion) => renderFeedbackCancion(artista, cancion.id, textoCancion(cancion))).join("")}</div>
            </div>
        `;
        tarjeta.appendChild(crearBotonBorrar(nombreColeccion, indice));
        contenedor.appendChild(tarjeta);
    });
}

function renderizarSingles(artista) {
    const contenedor = document.querySelector('[data-lista="singles"]');
    const singles = artista.singles || [];
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (singles.length === 0) {
        contenedor.appendChild(crearVacio("Todavia no hay singles."));
        return;
    }

    singles.forEach((item, indice) => {
        const tarjeta = document.createElement("article");
        const audioId = `audio-single-${indice}`;
        tarjeta.className = "single-vinilo";
        tarjeta.innerHTML = `
            <button type="button" class="vinilo-boton" data-audio="${audioId}" aria-label="Reproducir ${escapar(item.titulo)}">
                <span class="vinilo-disco"><img src="${escapar(item.portada || artista.portada || imagenDefecto)}" alt="${escapar(item.titulo)}"></span>
            </button>
            <h3>${escapar(item.titulo)}</h3>
            <p>${escapar([item.genero, item.mood].filter(Boolean).join(" / ") || "Single")}</p>
            ${item.audio ? `<audio id="${audioId}" src="${escapar(item.audio)}"></audio>` : ""}
            ${renderFeedbackCancion(artista, item.id, item.titulo)}
        `;
        tarjeta.appendChild(crearBotonBorrar("singles", indice));
        contenedor.appendChild(tarjeta);
    });
}

function renderizarSignificados(artista) {
    const contenedor = document.querySelector('[data-lista="significados"]');
    const significados = artista.significados || [];
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (significados.length === 0) {
        contenedor.appendChild(crearVacio("Todavia no hay significados."));
        return;
    }

    contenedor.classList.add("significados-personalizados-archivo");

    const indice = document.createElement("aside");
    indice.className = "significados-personalizados-indice";

    const ficha = document.createElement("article");
    ficha.className = "significado-personalizado significado-personalizado-activo";

    function pintar(indiceActivo) {
        const item = significados[indiceActivo];
        ficha.innerHTML = `
            <header><p>${escapar(item.album || "Sin album")}</p><h3>${escapar(item.cancion)}</h3></header>
            <div class="significado-columnas">
                <section><h4>Letra</h4><p>${escapar(item.letra || "Letra pendiente.")}</p></section>
                <section><h4>Significado</h4><p>${escapar(item.significado || "Significado pendiente.")}</p></section>
            </div>
        `;
        ficha.appendChild(crearBotonBorrar("significados", indiceActivo));
        indice.querySelectorAll("button").forEach((boton) => boton.classList.toggle("activo", Number(boton.dataset.indiceSignificado) === indiceActivo));
    }

    significados.forEach((item, indiceItem) => {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.dataset.indiceSignificado = String(indiceItem);
        boton.innerHTML = `<strong>${escapar(item.cancion)}</strong><span>${escapar(item.album || "Sin album")}</span>`;
        boton.addEventListener("click", () => pintar(indiceItem));
        indice.appendChild(boton);
    });

    contenedor.append(indice, ficha);
    pintar(0);
}
function renderizarBiografia(artista) {
    const contenedor = document.querySelector("[data-biografia-render]");
    const texto = artista.biografia || "Todavia no se ha escrito la biografia de este artista. Abre el editor y crea su historia visual.";
    const colecciones = [...(artista.albums || []), ...(artista.eps || []), ...(artista.singles || [])].slice(0, 4);
    if (!contenedor) return;

    contenedor.innerHTML = `
        <section class="bio-hero-personalizada">
            <div>
                <p class="bio-etiqueta">${artista.tipo === "propio" ? "Musica publicada por mi" : "Artista famoso anadido"}</p>
                <h3>${escapar(artista.nombre)}</h3>
                <p>${escapar(texto)}</p>
            </div>
            <figure><img src="${escapar(artista.portada || imagenDefecto)}" alt="${escapar(artista.nombre)}"><figcaption>Artista personalizado</figcaption></figure>
        </section>
        <section class="bio-mosaico-personalizado">${colecciones.length ? colecciones.map((item) => `<img src="${escapar(item.portada || artista.portada || imagenDefecto)}" alt="${escapar(item.titulo)}">`).join("") : `<img src="${escapar(artista.portada || imagenDefecto)}" alt="${escapar(artista.nombre)}">`}</section>
    `;
}

function obtenerImagenesCarrusel(artista) {
    const visuales = artista.visuales || {};
    const propias = visuales.carrusel || [];
    const colecciones = [
        ...(artista.albums || []),
        ...(artista.eps || []),
        ...(artista.singles || [])
    ].map((item) => item.portada).filter(Boolean);
    const imagenes = [...propias, ...colecciones, artista.portada || imagenDefecto].filter(Boolean);
    const unicas = [...new Set(imagenes)];
    if (unicas.length >= 3) return unicas;
    return [
        ...unicas,
        obtenerVisualSeccion(artista, "albums"),
        obtenerVisualSeccion(artista, "eps"),
        obtenerVisualSeccion(artista, "significados"),
        obtenerVisualSeccion(artista, "biografia")
    ].filter(Boolean);
}

function renderizarCarrusel(artista) {
    const contenedor = document.querySelector("[data-carrusel-artista]");
    if (!contenedor) return;
    const imagenes = obtenerImagenesCarrusel(artista);
    const base = imagenes.length ? imagenes : [artista.portada || imagenDefecto];
    const bucle = [...base, ...base, ...base, ...base, ...base, ...base];
    contenedor.innerHTML = bucle.map((imagen, indice) => `<img src="${escapar(imagen)}" alt="${escapar(artista.nombre)} ${indice + 1}">`).join("");
}

function renderizar() {
    const artista = obtenerArtistaActual();
    if (!artista) {
        document.body.innerHTML = "<main class='contenedor-maestro'><h1>Artista no encontrado</h1><a href='Menú.html'>Volver al menu</a></main>";
        return;
    }

    if (asegurarEstructuraArtista(artista)) {
        const artistas = obtenerArtistas();
        const indice = artistas.findIndex((item) => item.id === artista.id);
        if (indice !== -1) {
            artistas[indice] = artista;
            guardarArtistas(artistas);
        }
    }

    artista.estetica = artista.estetica || {};
    document.title = `${artista.nombre} - Paraíso de la Oscuridad`;
    document.getElementById("nombre-artista").textContent = artista.nombre;
    document.getElementById("meta-artista").textContent = artista.tipo === "propio" ? "Artista propio publicando musica" : "Cantante famoso anadido";
    document.getElementById("portada-artista").src = artista.portada || imagenDefecto;
    document.getElementById("biografia-artista").value = artista.biografia || "";

    aplicarEstetica(artista);
    prepararNavegacionArtista(artista);
    renderizarCarrusel(artista);
    renderizarLibros(artista, "albums");
    renderizarLibros(artista, "eps");
    renderizarSingles(artista);
    renderizarSignificados(artista);
    renderizarBiografia(artista);
    aplicarPermisosEdicion(artista);
    activarVinilos();
    activarOpiniones();
    activarFormulariosCancionLibro();
    activarFormulariosEdicionLibro();
    activarFormulariosEdicionCancion();
    activarBuscadorArtista(artista);
}

function aplicarPermisosEdicion(artista) {
    const editable = puedeEditarArtista(artista);
    document.body.classList.toggle("modo-solo-lectura", !editable);
    document.querySelectorAll("form, [data-guardar-biografia], [data-guardar-visuales], .boton-quitar, .editor-seccion-artista, .editor-artista, .editor-cancion-libro").forEach((elemento) => {
        if (elemento.classList.contains("form-comentario-cancion") || elemento.closest(".zona-opinion-cancion")) return;
        elemento.style.display = editable ? "" : "none";
    });

    let aviso = document.querySelector(".aviso-solo-creador");
    if (editable || aviso) {
        if (editable && aviso) aviso.remove();
        return;
    }

    aviso = document.createElement("p");
    aviso.className = "aviso-solo-creador";
    aviso.textContent = "Solo el creador o el administrador pueden editar esta discografía.";
    document.querySelector(".contenedor-maestro")?.prepend(aviso);
}

function activarVinilos() {
    document.querySelectorAll(".vinilo-boton").forEach((boton) => {
        boton.addEventListener("click", () => {
            const audio = document.getElementById(boton.dataset.audio);
            if (!audio) return;

            if (audio.paused) {
                document.querySelectorAll(".single-vinilo audio").forEach((otroAudio) => {
                    if (otroAudio !== audio) {
                        otroAudio.pause();
                        otroAudio.currentTime = 0;
                        otroAudio.closest(".single-vinilo").classList.remove("reproduciendo");
                    }
                });
                audio.play();
                boton.closest(".single-vinilo").classList.add("reproduciendo");
            } else {
                audio.pause();
                boton.closest(".single-vinilo").classList.remove("reproduciendo");
            }
        });
    });
}

function obtenerCancionesBuscables(artista) {
    const resultados = [];

    ["albums", "eps"].forEach((coleccion) => {
        (artista[coleccion] || []).forEach((item) => {
            resultados.push({ tipo: coleccion === "albums" ? "Album" : "EP", titulo: item.titulo, detalle: "Libro musical", vista: coleccion });
            (item.canciones || []).forEach((cancion) => {
                resultados.push({
                    tipo: "Cancion",
                    titulo: textoCancion(cancion),
                    detalle: [item.titulo, metaCancion(cancion)].filter(Boolean).join(" / "),
                    vista: coleccion,
                    idCancion: cancion.id
                });
            });
        });
    });

    (artista.singles || []).forEach((single) => {
        resultados.push({
            tipo: "Single",
            titulo: single.titulo,
            detalle: [single.genero, single.mood].filter(Boolean).join(" / "),
            vista: "singles",
            idCancion: single.id
        });
    });

    (artista.significados || []).forEach((significado) => {
        resultados.push({
            tipo: "Significado",
            titulo: significado.cancion,
            detalle: significado.album || "Archivo de significado",
            vista: "significados"
        });
    });

    return resultados;
}

function cambiarVista(vista) {
    document.querySelectorAll("[data-vista]").forEach((item) => item.classList.toggle("activo", item.dataset.vista === vista));
    document.querySelectorAll("[data-panel]").forEach((panel) => panel.classList.toggle("activa", panel.dataset.panel === vista));
}

function activarBuscadorArtista(artista) {
    const input = document.getElementById("buscador-artista");
    const contenedor = document.getElementById("resultados-busqueda-artista");
    if (!input || !contenedor) return;

    input.oninput = () => {
        const termino = input.value.trim().toLowerCase();
        contenedor.innerHTML = "";
        if (!termino) return;

        obtenerCancionesBuscables(artista)
            .filter((item) => `${item.tipo} ${item.titulo} ${item.detalle}`.toLowerCase().includes(termino))
            .slice(0, 8)
            .forEach((item) => {
                const boton = document.createElement("button");
                boton.type = "button";
                boton.innerHTML = `<strong>${escapar(item.titulo)}</strong><span>${escapar(item.tipo)}${item.detalle ? ` / ${escapar(item.detalle)}` : ""}</span>`;
                boton.addEventListener("click", () => {
                    cambiarVista(item.vista);
                    contenedor.innerHTML = "";
                    input.value = item.titulo;
                    if (item.idCancion) {
                        setTimeout(() => {
                            const idSeguro = escaparSelector(item.idCancion);
                            document.querySelector(`[data-cancion-id="${idSeguro}"], [data-ir-cancion="${idSeguro}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }, 60);
                    }
                });
                contenedor.appendChild(boton);
            });
    };
}

function activarOpiniones() {
    document.querySelectorAll("[data-estrellas]").forEach((boton) => {
        boton.addEventListener("click", () => {
            const contenedor = boton.closest("[data-cancion-id]");
            const idCancion = contenedor?.dataset.cancionId;
            const estrellas = Number(boton.dataset.estrellas);
            if (!idCancion) return;
            actualizarArtista((artista) => {
                artista.interacciones = artista.interacciones || {};
                artista.interacciones[idCancion] = artista.interacciones[idCancion] || { estrellas: 0, comentarios: [] };
                artista.interacciones[idCancion].estrellas = estrellas;
            }, { permitirVisitante: true });
        });
    });

    document.querySelectorAll("[data-comentario-cancion]").forEach((formulario) => {
        formulario.addEventListener("submit", (event) => {
            event.preventDefault();
            const idCancion = formulario.dataset.comentarioCancion;
            const comentario = formulario.elements.comentario.value.trim();
            if (!idCancion || !comentario) return;
            actualizarArtista((artista) => {
                artista.interacciones = artista.interacciones || {};
                artista.interacciones[idCancion] = artista.interacciones[idCancion] || { estrellas: 0, comentarios: [] };
                artista.interacciones[idCancion].comentarios.push(comentario);
            }, { permitirVisitante: true });
        });
    });
}

function activarFormulariosCancionLibro() {
    document.querySelectorAll("[data-form-cancion-libro]").forEach((formulario) => {
        formulario.addEventListener("submit", async (event) => {
            event.preventDefault();

            const coleccion = formulario.dataset.formCancionLibro;
            const indiceLibro = Number(formulario.dataset.indiceLibro);
            const titulo = formulario.elements.titulo.value.trim();
            if (!titulo || Number.isNaN(indiceLibro)) return;

            const audio = await subirArchivoASql(formulario.elements.audio.files[0]);
            const nuevaCancion = {
                id: crearIdCancion(titulo),
                titulo,
                genero: formulario.elements.genero.value.trim(),
                mood: formulario.elements.mood.value.trim(),
                audio
            };

            actualizarArtista((artista) => {
                artista[coleccion] = artista[coleccion] || [];
                artista[coleccion][indiceLibro] = artista[coleccion][indiceLibro] || {};
                artista[coleccion][indiceLibro].canciones = artista[coleccion][indiceLibro].canciones || [];
                artista[coleccion][indiceLibro].canciones.push(nuevaCancion);
            });

            formulario.reset();
        });
    });
}

function activarFormulariosEdicionLibro() {
    document.querySelectorAll("[data-form-editar-libro]").forEach((formulario) => {
        formulario.addEventListener("submit", async (event) => {
            event.preventDefault();
            const coleccion = formulario.dataset.formEditarLibro;
            const indiceLibro = Number(formulario.dataset.indiceLibro);
            if (Number.isNaN(indiceLibro)) return;

            const artista = obtenerArtistaActual();
            const actual = artista?.[coleccion]?.[indiceLibro] || {};
            const portada = await leerArchivoComoDataUrl(formulario.elements.portada.files[0], actual.portada || artista?.portada || imagenDefecto);

            actualizarArtista((artistaActual) => {
                const item = artistaActual[coleccion][indiceLibro];
                item.titulo = formulario.elements.titulo.value.trim();
                item.genero = formulario.elements.genero.value.trim();
                item.mood = formulario.elements.mood.value.trim();
                item.portada = portada;
            });
        });
    });
}

function activarFormulariosEdicionCancion() {
    document.querySelectorAll("[data-form-editar-cancion]").forEach((formulario) => {
        formulario.addEventListener("submit", async (event) => {
            event.preventDefault();
            const coleccion = formulario.dataset.formEditarCancion;
            const indiceLibro = Number(formulario.dataset.indiceLibro);
            const indiceCancion = Number(formulario.dataset.indiceCancion);
            if (Number.isNaN(indiceLibro) || Number.isNaN(indiceCancion)) return;

            const artista = obtenerArtistaActual();
            const actual = artista?.[coleccion]?.[indiceLibro]?.canciones?.[indiceCancion] || {};
            const audio = formulario.elements.audio.files[0]
                ? await subirArchivoASql(formulario.elements.audio.files[0])
                : (actual.audio || "");

            actualizarArtista((artistaActual) => {
                const cancion = artistaActual[coleccion][indiceLibro].canciones[indiceCancion];
                cancion.titulo = formulario.elements.titulo.value.trim();
                cancion.genero = formulario.elements.genero.value.trim();
                cancion.mood = formulario.elements.mood.value.trim();
                cancion.audio = audio;
            });
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    poblarSelectsMusicales();
    renderizar();

    document.querySelectorAll("[data-vista]").forEach((boton) => {
        boton.addEventListener("click", () => {
            cambiarVista(boton.dataset.vista);
        });
    });

    document.querySelector("[data-guardar-biografia]").addEventListener("click", () => {
        actualizarArtista((artista) => {
            artista.biografia = document.getElementById("biografia-artista").value.trim();
        });
    });

    document.querySelector("[data-guardar-visuales]").addEventListener("click", async () => {
        const artista = obtenerArtistaActual();
        const visuales = artista.visuales || {};
        const secciones = visuales.secciones || {};
        const carruselNuevo = await leerArchivosComoDataUrl(document.getElementById("visual-carrusel").files);
        const entradas = [
            ["albums", "visual-albums"],
            ["eps", "visual-eps"],
            ["singles", "visual-singles"],
            ["significados", "visual-significados"],
            ["biografia", "visual-biografia"]
        ];

        for (const [clave, id] of entradas) {
            const archivo = document.getElementById(id).files[0];
            if (archivo) {
                secciones[clave] = await leerArchivoComoDataUrl(archivo, secciones[clave] || "");
            }
        }

        actualizarArtista((actual) => {
            actual.estetica = {
                principal: document.getElementById("color-principal").value,
                secundario: document.getElementById("color-secundario").value,
                fondo: document.getElementById("color-fondo").value
            };
            actual.visuales = {
                secciones,
                carrusel: carruselNuevo.length ? carruselNuevo : (visuales.carrusel || [])
            };
        });

        document.getElementById("visual-carrusel").value = "";
        entradas.forEach(([, id]) => {
            document.getElementById(id).value = "";
        });
    });

    document.querySelectorAll("[data-form-coleccion]").forEach((formulario) => {
        formulario.addEventListener("submit", async (event) => {
            event.preventDefault();

            const coleccion = formulario.dataset.formColeccion;
            const titulo = formulario.elements.titulo.value.trim();
            const artista = obtenerArtistaActual();
            const portada = await leerArchivoComoDataUrl(formulario.elements.portada.files[0], artista.portada || imagenDefecto);
            const audio = formulario.elements.audio ? await subirArchivoASql(formulario.elements.audio.files[0]) : "";
            if (!titulo) return;

            actualizarArtista((actual) => {
                const item = {
                    id: crearIdCancion(titulo),
                    titulo,
                    portada,
                    audio,
                    genero: formulario.elements.genero ? formulario.elements.genero.value.trim() : "",
                    mood: formulario.elements.mood ? formulario.elements.mood.value.trim() : "",
                    canciones: []
                };

                actual[coleccion].push(item);
            });

            formulario.reset();
        });
    });

    document.querySelector("[data-form-significado]").addEventListener("submit", (event) => {
        event.preventDefault();
        const formulario = event.currentTarget;

        actualizarArtista((artista) => {
            artista.significados.push({
                album: formulario.elements.album.value.trim(),
                cancion: formulario.elements.cancion.value.trim(),
                letra: formulario.elements.letra.value.trim(),
                significado: formulario.elements.significado.value.trim()
            });
        });

        formulario.reset();
    });
});





