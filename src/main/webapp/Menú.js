// Gestiona el menu principal.
// Aqui se pintan artistas personalizados, se ocultan artistas oficiales,
// se abre/cierra cada desplegable y se decide que ve un usuario normal o admin.
function advertenciaEstetica() {
    document.getElementById("modalPlaga").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modalPlaga").style.display = "none";
}

const CLAVE_ARTISTAS_PERSONALIZADOS = "wikisingers_artistas_personalizados";
const CLAVE_ARTISTAS_OCULTOS = "wikisingers_artistas_oficiales_ocultos";

document.addEventListener("DOMContentLoaded", () => {
    const menus = Array.from(document.querySelectorAll(".Encabezado details"));
    aplicarVisibilidadAdmin();

    menus.forEach((menu) => {
        menu.addEventListener("toggle", () => {
            if (!menu.open) return;
            menus.forEach((otroMenu) => {
                if (otroMenu !== menu) otroMenu.open = false;
            });
        });
    });

    document.addEventListener("click", (event) => {
        if (event.target.closest(".Encabezado")) return;
        menus.forEach((menu) => {
            menu.open = false;
        });
    });
});

function esAdministrador() {
    return (localStorage.getItem("sportbook-user-role") || "").toLowerCase() === "admin";
}

function aplicarVisibilidadAdmin() {
    document.querySelectorAll(".boton-admin-menu").forEach((boton) => {
        boton.hidden = !esAdministrador();
    });
}

function emailUsuarioActual() {
    return (localStorage.getItem("sportbook-user-email") || localStorage.getItem("user-email") || "").trim().toLowerCase();
}

function obtenerArtistasPersonalizados() {
    try {
        const artistas = JSON.parse(localStorage.getItem(CLAVE_ARTISTAS_PERSONALIZADOS)) || [];
        return Array.isArray(artistas) ? artistas : [];
    } catch (error) {
        return [];
    }
}

function guardarArtistasPersonalizados(artistas) {
    localStorage.setItem(CLAVE_ARTISTAS_PERSONALIZADOS, JSON.stringify(artistas));
}

async function guardarArtistasPersonalizadosSeguro(artistas) {
    const valor = JSON.stringify(artistas);
    if (window.WikiSingersSQL?.guardarEstado) {
        await window.WikiSingersSQL.guardarEstado(CLAVE_ARTISTAS_PERSONALIZADOS, valor, { global: true });
        return;
    }

    localStorage.setItem(CLAVE_ARTISTAS_PERSONALIZADOS, valor);
}

function rutaArtistaPersonalizado(id) {
    return `Artista Personalizado.html?id=${encodeURIComponent(id)}`;
}

function obtenerArtistasOficialesOcultos() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_ARTISTAS_OCULTOS)) || [];
    } catch (error) {
        return [];
    }
}

function crearIdArtista(nombre) {
    return nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") + "-" + Date.now();
}

function leerArchivoComoDataUrl(archivo) {
    return new Promise((resolve) => {
        if (!archivo) {
            resolve("./recursos/global/img-index/Wikisingers.png");
            return;
        }

        const lector = new FileReader();
        lector.onload = () => resolve(lector.result);
        lector.onerror = () => resolve("./recursos/global/img-index/Wikisingers.png");
        lector.readAsDataURL(archivo);
    });
}

function recopilarDatosCanciones(artista, campo) {
    const valores = [];
    const colecciones = ["albums", "eps", "singles"];

    colecciones.forEach((coleccion) => {
        (artista[coleccion] || []).forEach((item) => {
            if (item[campo]) valores.push(item[campo]);
            (item.canciones || []).forEach((cancion) => {
                if (typeof cancion === "object" && cancion[campo]) valores.push(cancion[campo]);
            });
        });
    });

    return valores.join(" ");
}

function obtenerCancionesPersonalizadas() {
    const canciones = [];

    obtenerArtistasPersonalizados().forEach((artista) => {
        ["albums", "eps"].forEach((coleccion) => {
            (artista[coleccion] || []).forEach((item) => {
                (item.canciones || []).forEach((cancion) => {
                    const datosCancion = typeof cancion === "object"
                        ? cancion
                        : { titulo: cancion, genero: "", mood: "" };

                    if (!datosCancion.titulo) return;

                    canciones.push({
                        artista: artista.nombre,
                        album: item.titulo || (coleccion === "eps" ? "EPs" : "Albums"),
                        titulo: datosCancion.titulo,
                        genero: datosCancion.genero || item.genero || "",
                        mood: datosCancion.mood || item.mood || "",
                        imagen: item.portada || artista.portada || "./recursos/global/img-index/Wikisingers.png",
                        audio: datosCancion.audio || "",
                        url: rutaArtistaPersonalizado(artista.id)
                    });
                });
            });
        });

        (artista.singles || []).forEach((single) => {
            if (!single.titulo) return;

            canciones.push({
                artista: artista.nombre,
                album: "Singles",
                titulo: single.titulo,
                genero: single.genero || "",
                mood: single.mood || "",
                imagen: single.portada || artista.portada || "./recursos/global/img-index/Wikisingers.png",
                audio: single.audio || "",
                url: rutaArtistaPersonalizado(artista.id)
            });
        });
    });

    return canciones;
}

function obtenerCatalogoCanciones() {
    return [
        ...(window.WIKISINGERS_CANCIONES || []),
        ...obtenerCancionesPersonalizadas()
    ];
}

function normalizarFiltro(valor) {
    return (valor || "")
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function obtenerContenedorResultados() {
    let contenedor = document.getElementById("resultado-canciones-genero");
    if (contenedor) return contenedor;

    const portadas = document.querySelector(".portadas1");
    if (!portadas || !portadas.parentElement) return null;

    contenedor = document.createElement("section");
    contenedor.id = "resultado-canciones-genero";
    contenedor.className = "resultado-canciones-genero";
    contenedor.style.display = "none";
    portadas.parentElement.insertBefore(contenedor, portadas.nextSibling);

    return contenedor;
}

function mostrarPortadasArtistas() {
    const portadas = document.querySelector(".portadas1");
    const resultados = obtenerContenedorResultados();

    if (resultados) {
        resultados.innerHTML = "";
        resultados.style.display = "none";
    }

    if (portadas) {
        portadas.style.display = "flex";
        portadas.querySelectorAll(".hoja[data-genero]").forEach((hoja) => {
            hoja.style.display = "";
        });
    }

    aplicarArtistasOcultos();
}

function crearTarjetaCancion(cancion) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "cancion-filtrada";

    const enlace = document.createElement("a");
    enlace.href = cancion.url || "#";
    enlace.className = "cancion-filtrada-imagen";

    const imagen = document.createElement("img");
    imagen.src = cancion.imagen || "./recursos/global/img-index/Wikisingers.png";
    imagen.alt = cancion.titulo || "Cancion";
    enlace.appendChild(imagen);

    const titulo = document.createElement("h3");
    titulo.textContent = cancion.titulo || "Cancion sin titulo";

    const meta = document.createElement("p");
    meta.className = "cancion-filtrada-meta";
    meta.textContent = [cancion.artista, cancion.album].filter(Boolean).join(" / ");

    const etiquetas = document.createElement("div");
    etiquetas.className = "cancion-filtrada-etiquetas";

    const etiquetaGenero = document.createElement("span");
    etiquetaGenero.className = "cancion-filtrada-genero";
    etiquetaGenero.textContent = cancion.genero || "Sin genero";

    const etiquetaMood = document.createElement("span");
    etiquetaMood.className = "cancion-filtrada-genero cancion-filtrada-mood";
    etiquetaMood.textContent = cancion.mood || "Sin mood";

    etiquetas.appendChild(etiquetaGenero);
    etiquetas.appendChild(etiquetaMood);

    tarjeta.appendChild(enlace);
    tarjeta.appendChild(titulo);
    tarjeta.appendChild(meta);
    tarjeta.appendChild(etiquetas);

    if (cancion.audio && window.WikiSingersFavoritos) {
        tarjeta.classList.add("contenedor-favorito-cancion");
        tarjeta.appendChild(window.WikiSingersFavoritos.crearBoton(cancion));
    }

    if (cancion.audio) {
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.src = cancion.audio;
        tarjeta.appendChild(audio);
    }

    return tarjeta;
}

function renderizarCancionesFiltradas(campo, valor) {
    const resultados = obtenerContenedorResultados();
    const portadas = document.querySelector(".portadas1");
    if (!resultados) return;

    const filtro = normalizarFiltro(valor);
    const artistasOcultos = obtenerArtistasOficialesOcultos().map(normalizarFiltro);
    const catalogo = obtenerCatalogoCanciones();
    const canciones = catalogo.filter((cancion) => {
        const artistaOculto = artistasOcultos.includes(normalizarFiltro(cancion.artista));
        return normalizarFiltro(cancion[campo]) === filtro && (!artistaOculto || esAdministrador());
    });

    if (portadas) portadas.style.display = "none";
    resultados.innerHTML = "";
    resultados.style.display = "grid";

    if (!canciones.length) {
        const aviso = document.createElement("p");
        aviso.className = "sin-resultados-canciones";
        aviso.textContent = catalogo.length
            ? `No hay canciones con ${campo} "${valor}".`
            : "El catalogo de canciones no se ha cargado todavia. Recarga la pagina.";
        resultados.appendChild(aviso);
        return;
    }

    canciones.forEach((cancion) => resultados.appendChild(crearTarjetaCancion(cancion)));
}

function pintarArtistasPersonalizados() {
    const contenedor = document.querySelector(".portadas1");
    if (!contenedor) return;

    contenedor.querySelectorAll(".artista-personalizado").forEach((elemento) => elemento.remove());

    obtenerArtistasPersonalizados().forEach((artista) => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "hoja Port artista-personalizado";
        tarjeta.dataset.genero = recopilarDatosCanciones(artista, "genero") || "Personalizado";
        tarjeta.dataset.mood = recopilarDatosCanciones(artista, "mood") || "Personalizado";
        tarjeta.dataset.generos = recopilarDatosCanciones(artista, "genero");
        tarjeta.dataset.moods = recopilarDatosCanciones(artista, "mood");
        const estetica = artista.estetica || {};
        tarjeta.style.setProperty("--card-primary", estetica.principal || "#ff7fa7");
        tarjeta.style.setProperty("--card-secondary", estetica.secundario || "#66dbff");
        tarjeta.style.setProperty("--card-bg", estetica.fondo || "#0b0204");

        const enlace = document.createElement("a");
        enlace.href = rutaArtistaPersonalizado(artista.id);

        const imagen = document.createElement("img");
        imagen.src = artista.portada || "./recursos/global/img-index/Wikisingers.png";
        imagen.alt = artista.nombre;

        const nombre = document.createElement("p");
        nombre.textContent = artista.nombre;

        enlace.appendChild(imagen);
        tarjeta.appendChild(enlace);
        tarjeta.appendChild(nombre);
        contenedor.appendChild(tarjeta);
    });
}

function aplicarArtistasOcultos() {
    const ocultos = obtenerArtistasOficialesOcultos().map((nombre) => nombre.toLowerCase());
    document.querySelectorAll("[data-artista-oficial]").forEach((tarjeta) => {
        const nombre = tarjeta.dataset.artistaOficial.toLowerCase();
        const oculto = ocultos.includes(nombre);
        tarjeta.classList.toggle("artista-oculto-admin", oculto && esAdministrador());
        tarjeta.style.display = oculto && !esAdministrador() ? "none" : "";
    });
}

function crearBarraAdmin() {
    if (!esAdministrador() || document.querySelector(".barra-admin-menu")) return;

    const barra = document.createElement("div");
    barra.className = "barra-admin-menu";
    barra.innerHTML = `
        <strong>Modo administrador</strong>
        <a href="administrador/admin.html">Panel completo</a>
        <button type="button" data-admin-exportar>Exportar datos</button>
    `;

    const contenedor = document.querySelector(".contenedor-maestro");
    const header = document.querySelector(".Encabezado");
    contenedor.insertBefore(barra, header);

    barra.querySelector("[data-admin-exportar]").addEventListener("click", () => {
        const datos = {
            artistasPersonalizados: obtenerArtistasPersonalizados(),
            artistasOficialesOcultos: obtenerArtistasOficialesOcultos(),
            textosAdmin: JSON.parse(localStorage.getItem("wikisingers_admin_textos") || "{}"),
            usuariosBaneados: JSON.parse(localStorage.getItem("wikisingers_usuarios_baneados") || "[]")
        };
        const salida = JSON.stringify(datos, null, 2);
        navigator.clipboard?.writeText(salida);
        alert("Datos de administrador preparados y copiados si el navegador lo permite.");
        console.log(salida);
    });
}

function pintarControlesAdmin() {
    if (!esAdministrador()) return;

    document.querySelectorAll(".controles-admin-artista").forEach((control) => control.remove());

    const ocultos = obtenerArtistasOficialesOcultos();

    document.querySelectorAll("[data-artista-oficial]").forEach((tarjeta) => {
        const nombre = tarjeta.dataset.artistaOficial;
        const oculto = ocultos.includes(nombre);
        const control = document.createElement("div");
        control.className = "controles-admin-artista";
        control.innerHTML = `
            <span>${oculto ? "Oculto" : "Visible"}</span>
            <button type="button">${oculto ? "Mostrar" : "Ocultar"}</button>
        `;
        control.querySelector("button").addEventListener("click", (event) => {
            event.preventDefault();
            const actuales = obtenerArtistasOficialesOcultos();
            const siguientes = actuales.includes(nombre)
                ? actuales.filter((item) => item !== nombre)
                : [...actuales, nombre];
            localStorage.setItem(CLAVE_ARTISTAS_OCULTOS, JSON.stringify(siguientes));
            aplicarArtistasOcultos();
            pintarControlesAdmin();
        });
        tarjeta.appendChild(control);
    });

    document.querySelectorAll(".artista-personalizado").forEach((tarjeta) => {
        const enlace = tarjeta.querySelector("a");
        const url = new URL(enlace.href);
        const id = url.searchParams.get("id");
        const control = document.createElement("div");
        control.className = "controles-admin-artista";
        control.innerHTML = `
            <span>Personalizado</span>
            <button type="button" class="peligro">Eliminar</button>
        `;
        control.querySelector("button").addEventListener("click", (event) => {
            event.preventDefault();
            if (!confirm("¿Eliminar este artista personalizado?")) return;
            const artistas = obtenerArtistasPersonalizados().filter((artista) => artista.id !== id);
            guardarArtistasPersonalizados(artistas);
            pintarArtistasPersonalizados();
            aplicarArtistasOcultos();
            pintarControlesAdmin();
        });
        tarjeta.appendChild(control);
    });
}

function abrirModalArtista() {
    const modal = document.getElementById("modal-artista");
    if (modal) modal.style.display = "flex";
}

function cerrarModalArtista() {
    const modal = document.getElementById("modal-artista");
    const form = document.getElementById("form-artista-personalizado");
    if (modal) modal.style.display = "none";
    if (form) form.reset();
}

document.addEventListener("DOMContentLoaded", () => {
    localStorage.removeItem(CLAVE_ARTISTAS_OCULTOS);
    const buscador = document.getElementById("mibuscador");
    const botonBuscar = document.querySelector(".buscador button");
    const formArtista = document.getElementById("form-artista-personalizado");

    pintarArtistasPersonalizados();
    aplicarArtistasOcultos();
    crearBarraAdmin();
    pintarControlesAdmin();

    function buscarArtista() {
        const termino = buscador.value.toLowerCase().trim();

        if (termino === "") {
            alert("Escribe el nombre de un artista");
            return;
        }

        const portadas = document.querySelectorAll(".Port");
        let encontrado = false;

        portadas.forEach((portada) => {
            const nombre = portada.querySelector("p").innerText.toLowerCase();

            if (nombre.includes(termino)) {
                const enlace = portada.querySelector("a").href;
                window.location.href = enlace;
                encontrado = true;
            }
        });

        if (!encontrado) {
            alert("Esa entidad aun no ha sido invocada...");
        }
    }

    if (buscador) {
        buscador.addEventListener("keypress", (e) => {
            if (e.key === "Enter") buscarArtista();
        });
    }

    if (botonBuscar) {
        botonBuscar.addEventListener("click", buscarArtista);
    }

    window.Ejecutar = buscarArtista;

    if (formArtista) {
        formArtista.addEventListener("submit", async (event) => {
            event.preventDefault();

            const nombre = document.getElementById("nuevo-artista-nombre").value.trim();
            const archivo = document.getElementById("nuevo-artista-portada").files[0];
            const tipo = document.querySelector('input[name="nuevo-artista-tipo"]:checked')?.value || "famoso";
            const biografia = document.getElementById("nuevo-artista-biografia").value.trim();
            const estetica = {
                principal: document.getElementById("nuevo-artista-color-principal").value || "#ff7fa7",
                secundario: document.getElementById("nuevo-artista-color-secundario").value || "#66dbff",
                fondo: document.getElementById("nuevo-artista-color-fondo").value || "#e68e9e"
            };

            if (!nombre) {
                alert("Ponle nombre a la entidad.");
                return;
            }

            const artistas = obtenerArtistasPersonalizados();
            const nuevoArtista = {
                id: crearIdArtista(nombre),
                nombre,
                tipo,
                ownerEmail: emailUsuarioActual(),
                estetica,
                portada: await leerArchivoComoDataUrl(archivo),
                biografia,
                albums: [],
                eps: [],
                singles: [],
                significados: [],
                interacciones: {}
            };

            artistas.push(nuevoArtista);

            const botonCrear = formArtista.querySelector("button[type='submit']");
            if (botonCrear) {
                botonCrear.disabled = true;
                botonCrear.textContent = "Guardando artista...";
            }

            try {
                await guardarArtistasPersonalizadosSeguro(artistas);
                cerrarModalArtista();
                pintarArtistasPersonalizados();
                window.location.href = rutaArtistaPersonalizado(nuevoArtista.id);
            } catch (error) {
                alert(error.message || "No se ha podido guardar el artista en MySQL.");
            } finally {
                if (botonCrear) {
                    botonCrear.disabled = false;
                    botonCrear.textContent = "Crear página del artista";
                }
            }
        });
    }

    const filtroGuardado = localStorage.getItem("filtroMusica");
    if (filtroGuardado) {
        window.filtrarPorGenero(filtroGuardado);
        localStorage.removeItem("filtroMusica");
    }
});

window.filtrarPorGenero = function (genero) {
    if (normalizarFiltro(genero) === "todas") {
        mostrarPortadasArtistas();
        return;
    }

    renderizarCancionesFiltradas("genero", genero);
};

window.filtrarPorMood = function (mood) {
    if (normalizarFiltro(mood) === "todas") {
        mostrarPortadasArtistas();
        return;
    }

    renderizarCancionesFiltradas("mood", mood);
};

window.abrirModalArtista = abrirModalArtista;
window.cerrarModalArtista = cerrarModalArtista;



