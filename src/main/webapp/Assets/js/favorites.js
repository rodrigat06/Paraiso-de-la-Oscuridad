(function () {
    const CLAVE_FAVORITOS = "wikisingers-favoritos";

    function getFavoritos() {
        try {
            const favoritos = JSON.parse(localStorage.getItem(CLAVE_FAVORITOS) || "[]");
            if (!Array.isArray(favoritos)) return [];
            const limpios = favoritos.filter((favorito) => {
                const datos = [favorito.artista, favorito.url, favorito.imagen, favorito.audio].join(" ");
                return !new RegExp("ash" + "nikko", "i").test(datos);
            });
            if (limpios.length !== favoritos.length) {
                localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(limpios));
            }
            return limpios;
        } catch {
            return [];
        }
    }

    function saveFavoritos(favoritos) {
        localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
        window.dispatchEvent(new CustomEvent("wikisingers:favoritos"));
    }

    function idCancion(cancion) {
        return [cancion.artista, cancion.album, cancion.titulo, cancion.audio || cancion.url].join("|");
    }

    function esFavorita(cancion) {
        const id = idCancion(cancion);
        return getFavoritos().some((favorita) => idCancion(favorita) === id);
    }

    function toggleFavorito(cancion) {
        if (!cancion || !cancion.audio) return false;

        const favoritos = getFavoritos();
        const id = idCancion(cancion);
        const existe = favoritos.some((favorita) => idCancion(favorita) === id);
        const siguientes = existe
            ? favoritos.filter((favorita) => idCancion(favorita) !== id)
            : [...favoritos, cancion];

        saveFavoritos(siguientes);
        return !existe;
    }

    function crearBoton(cancion) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "btn-favorito-cancion";
        boton.setAttribute("aria-label", "Anadir a favoritos");

        function pintar() {
            const activo = esFavorita(cancion);
            boton.classList.toggle("activo", activo);
            boton.textContent = activo ? "â™¥" : "â™¡";
            boton.title = activo ? "Quitar de favoritos" : "Anadir a favoritos";
        }

        boton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleFavorito(cancion);
            pintar();
            if (typeof window.renderFavoritos === "function") {
                window.renderFavoritos();
            }
        });

        window.addEventListener("wikisingers:favoritos", pintar);
        pintar();
        return boton;
    }

    function texto(elemento, selector) {
        return elemento.querySelector(selector)?.textContent?.trim() || "";
    }

    function absoluta(valor) {
        if (!valor) return "";
        return new URL(valor, window.location.href).href;
    }

    function datosDesdePagina(elemento) {
        const titulo = texto(elemento, "h3");
        const audio = elemento.querySelector("source")?.getAttribute("src")
            || elemento.querySelector("audio[src]")?.getAttribute("src")
            || "";
        if (!titulo || !audio || titulo.toUpperCase() === "FIN" || titulo.toUpperCase() === "INDEX") return null;

        const partes = window.location.pathname.split("/").map((parte) => decodeURIComponent(parte));
        const albumIndex = partes.findIndex((parte) => parte === "Albums");
        const artista = albumIndex > 0 ? partes[albumIndex - 1] : "WikiSingers";
        const archivo = partes[partes.length - 1].replace(/\.html$/i, "").replace(/-/g, " ");
        const album = archivo.replace(/\b\w/g, (letra) => letra.toUpperCase());

        return {
            artista,
            album,
            titulo,
            genero: elemento.dataset.genero || "",
            mood: elemento.dataset.mood || "",
            imagen: absoluta(elemento.querySelector("img")?.getAttribute("src") || ""),
            audio: absoluta(audio),
            url: window.location.href.split("#")[0] + (elemento.id ? `#${elemento.id}` : "")
        };
    }

    function insertarBotonesEnPagina() {
        const selectores = [
            ".hoja[data-genero]",
            ".hoja.ep-hoja[data-genero]",
            ".cd-card[data-genero]"
        ];

        document.querySelectorAll(selectores.join(",")).forEach((elemento) => {
            if (elemento.querySelector(".btn-favorito-cancion")) return;

            const cancion = datosDesdePagina(elemento);
            if (!cancion) return;

            const destino = elemento.querySelector(".cara.frontal") || elemento;
            destino.classList.add("contenedor-favorito-cancion");
            destino.appendChild(crearBoton(cancion));
        });
    }

    function insertarEstilos() {
        if (document.getElementById("estilos-favoritos-cancion")) return;

        const style = document.createElement("style");
        style.id = "estilos-favoritos-cancion";
        style.textContent = `
            .contenedor-favorito-cancion { position: relative; }
            .btn-favorito-cancion {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 50;
                width: 34px;
                height: 34px;
                border: 3px solid #66dbff;
                background: #0b0204;
                color: #ff7fa7;
                box-shadow: 3px 3px 0 #b3002d;
                font-size: 1.25rem;
                line-height: 1;
                cursor: pointer;
            }
            .btn-favorito-cancion.activo {
                background: #b3002d;
                color: #ffffff;
                border-color: #ff7fa7;
            }
        `;
        document.head.appendChild(style);
    }

    window.WikiSingersFavoritos = {
        getFavoritos,
        saveFavoritos,
        esFavorita,
        toggleFavorito,
        crearBoton,
        idCancion
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            insertarEstilos();
            insertarBotonesEnPagina();
        });
    } else {
        insertarEstilos();
        insertarBotonesEnPagina();
    }
})();
