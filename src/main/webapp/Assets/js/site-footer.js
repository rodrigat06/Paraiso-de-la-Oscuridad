(function () {
    const scriptActual = document.currentScript;
    const scriptUrl = scriptActual ? new URL(scriptActual.src, window.location.href) : new URL("Assets/js/site-footer.js", window.location.href);
    const raiz = new URL("../../", scriptUrl);

    function url(ruta) {
        return new URL(ruta, raiz).href;
    }

    function cargarCss() {
        if (document.querySelector('link[data-paraiso-footer="true"]')) return;
        const enlace = document.createElement("link");
        enlace.rel = "stylesheet";
        enlace.href = url("Assets/css/site-footer.css");
        enlace.dataset.paraisoFooter = "true";
        document.head.appendChild(enlace);

        if (!document.querySelector('link[data-paraiso-header="true"]')) {
            const cabecera = document.createElement("link");
            cabecera.rel = "stylesheet";
            cabecera.href = url("Assets/css/header-aligner.css");
            cabecera.dataset.paraisoHeader = "true";
            document.head.appendChild(cabecera);
        }
    }

    function crearEnlace(texto, ruta) {
        const enlace = document.createElement("a");
        enlace.className = "paraiso-footer__link";
        enlace.href = url(ruta);
        enlace.textContent = texto;
        return enlace;
    }

    function crearFooter() {
        if (document.querySelector(".paraiso-footer")) return;

        const footer = document.createElement("footer");
        footer.className = "paraiso-footer";
        footer.innerHTML = `
            <div class="paraiso-footer__inner">
                <section class="paraiso-footer__brand" aria-label="Identidad del proyecto">
                    <img class="paraiso-footer__logo" src="${url("recursos/global/img-index/Wikisingers.png")}" alt="Para\u00edso de la Oscuridad">
                    <div>
                        <p class="paraiso-footer__eyebrow">Archivo musical interactivo</p>
                        <h2 class="paraiso-footer__title">Para\u00edso de la Oscuridad</h2>
                        <p class="paraiso-footer__text">Canciones, artistas, significados y rituales visuales reunidos en una misma experiencia.</p>
                    </div>
                </section>

                <nav class="paraiso-footer__nav" aria-label="Enlaces principales del pie de p\u00e1gina">
                    <h2 class="paraiso-footer__heading">Explorar</h2>
                    <div class="paraiso-footer__links"></div>
                </nav>

                <section class="paraiso-footer__meta" aria-label="Estado del proyecto">
                    <h2 class="paraiso-footer__heading">Proyecto</h2>
                    <div class="paraiso-footer__badges">
                        <span class="paraiso-footer__badge">Jakarta EE</span>
                        <span class="paraiso-footer__badge">MySQL</span>
                        <span class="paraiso-footer__badge">Docker</span>
                    </div>
                    <p class="paraiso-footer__copy">Dise\u00f1ado para descubrir m\u00fasica, guardar favoritos, valorar canciones y publicar artistas propios.</p>
                </section>
            </div>
        `;

        const contenedorLinks = footer.querySelector(".paraiso-footer__links");
        [
            ["Men\u00fa", "Men\u00fa.html"],
            ["Iniciar sesi\u00f3n", "Inicio de Sesion/Inicio de Sesion.html"],
            ["Registrarse", "Registrarse/Registrarse.html"],
            ["Administrador", "administrador/admin.html"]
        ].forEach(([texto, ruta]) => contenedorLinks.appendChild(crearEnlace(texto, ruta)));

        document.body.appendChild(footer);
    }

    function iniciar() {
        cargarCss();
        crearFooter();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
