(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }

        callback();
    }

    function isArtistPage() {
        const path = decodeURIComponent(window.location.pathname).toLowerCase();
        return path.includes("/melanie martinez/") || path.includes("/jazmin bean/");
    }

    function artistGuideHTML() {
        const path = decodeURIComponent(window.location.pathname).toLowerCase();
        const isJazmin = path.includes("/jazmin bean/");
        const artistName = isJazmin ? "Jazmin Bean" : "Melanie Martinez";
        const artistPath = isJazmin ? "/Jazmin Bean" : "/Melanie Martinez";
        const albumsIcon = isJazmin ? `${artistPath}/gifs/Albumes.gif` : `${artistPath}/gifs/Albumes .gif`;
        const epsIcon = isJazmin ? `${artistPath}/gifs/Singles.gif` : `${artistPath}/gifs/Eps.gif`;
        const meaningsIcon = isJazmin ? `${artistPath}/gifs/Singles.gif` : `${artistPath}/gifs/merchandaising.gif`;
        const bioIcon = isJazmin ? `${artistPath}/gifs/Singles.gif` : `${artistPath}/gifs/Biografia.gif`;

        return `
            <div class="cuerpo-ayuda-retro">
                <h2>Indice de ${artistName}<br><span>Guia de navegacion del artista</span></h2>
                <div class="indice-artista-guia">
                    <a href="${artistPath}/Albums/Albums.html">
                        <img src="${albumsIcon}" alt="Albums">
                        <div>
                            <h3>Albums</h3>
                            <p>Abre los discos principales del artista y sus libros visuales.</p>
                        </div>
                    </a>
                    <a href="${artistPath}/Albums/EPs.html">
                        <img src="${epsIcon}" alt="EPs">
                        <div>
                            <h3>EPs</h3>
                            <p>Entra en EPs y singles para escuchar canciones sueltas o proyectos cortos.</p>
                        </div>
                    </a>
                    <a href="${artistPath}/significados.html">
                        <img src="${meaningsIcon}" alt="Significados">
                        <div>
                            <h3>Significados</h3>
                            <p>Busca una cancion y lee su interpretacion dentro del universo del artista.</p>
                        </div>
                    </a>
                    <a href="${artistPath}/biografia.html">
                        <img src="${bioIcon}" alt="Biografia">
                        <div>
                            <h3>Biografia</h3>
                            <p>Consulta la historia, estetica, imagenes y contexto creativo del artista.</p>
                        </div>
                    </a>
                </div>
                <button type="button" class="cerrar-ayuda-btn ritual-btn">Entendi el ritual</button>
            </div>
        `;
    }

    function defaultGuideHTML() {
        return `
            <div class="cuerpo-ayuda-retro">
                <h2>Informacion de la pagina</h2>
                <div class="galeria-explicativa">
                    <div class="tarjeta-instruccion">
                        <p><span>WikiSingers</span><br>Usa el buscador para encontrar artistas, albumes o canciones dentro de esta seccion.</p>
                    </div>
                    <div class="tarjeta-instruccion">
                        <p><span>Guia rapida</span><br>Los botones superiores te llevan al menu, atras o al cierre de sesion.</p>
                    </div>
                </div>
                <button type="button" class="cerrar-ayuda-btn ritual-btn">Entendi el ritual</button>
            </div>
        `;
    }

    function getModal() {
        let modal = document.getElementById("modal-ayuda-visual");

        if (!modal) {
            modal = document.createElement("div");
            modal.id = "modal-ayuda-visual";
            modal.className = "pantalla-ayuda-modal";
            modal.innerHTML = isArtistPage() ? artistGuideHTML() : defaultGuideHTML();
            document.body.appendChild(modal);
        }

        return modal;
    }

    function openModal(event) {
        if (event) {
            event.preventDefault();
        }

        if (document.body.classList.contains("portals-page")
            && !document.body.classList.contains("portal-listo")) {
            return;
        }

        getModal().classList.add("activo");
    }

    function closeModal() {
        getModal().classList.remove("activo");
    }

    function bindOnce(element, eventName, handler) {
        const key = `infoBound${eventName}`;
        if (!element || element[key]) return;

        element[key] = true;
        element.addEventListener(eventName, handler);
    }

    function bindArtistNavigation() {
        document.querySelectorAll(".item-encabezado").forEach((item) => {
            if (item.dataset.navCardBound === "true") return;
            const link = item.querySelector(".enlace-nav[href]");
            if (!link) return;

            item.dataset.navCardBound = "true";
            item.setAttribute("role", "link");
            item.setAttribute("tabindex", "0");

            item.addEventListener("click", (event) => {
                if (event.target.closest("a")) return;
                window.location.href = link.href;
            });

            item.addEventListener("keydown", (event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                window.location.href = link.href;
            });
        });
    }

    ready(() => {
        bindArtistNavigation();

        const triggers = new Set([
            ...document.querySelectorAll("#disparador-ayuda"),
            ...document.querySelectorAll(".boton-ayuda-global"),
            ...document.querySelectorAll(".btn-info-texto")
        ]);

        if (!triggers.size) return;

        triggers.forEach((trigger) => bindOnce(trigger, "click", openModal));

        const modal = getModal();
        modal.querySelectorAll(".cerrar-ayuda-btn, .ritual-btn, [data-info-close]")
            .forEach((button) => bindOnce(button, "click", closeModal));

        bindOnce(modal, "click", (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });

        bindOnce(document, "keydown", (event) => {
            if (event.key === "Escape") {
                closeModal();
            }
        });
    });
})();
