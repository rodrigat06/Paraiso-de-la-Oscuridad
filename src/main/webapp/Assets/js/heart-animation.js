// Este archivo ordena el boton de guia/informacion sin crear animaciones pesadas.
// Antes este script hacia latir el icono todo el rato; eso podia gastar CPU en moviles flojos.
(function () {
    // Evita insertar dos veces los mismos estilos si una pagina carga el script mas de una vez.
    function injectGuideStyles() {
        // Si el bloque de estilos ya existe, salimos para no duplicar CSS.
        if (document.getElementById("paraiso-guide-style")) return;

        // Creamos una etiqueta <style> para aplicar los ajustes sin tocar cada HTML.
        const style = document.createElement("style");

        // Damos un id fijo al bloque para poder detectarlo arriba.
        style.id = "paraiso-guide-style";

        // Estos estilos mantienen la estetica pixelada, pero sin animation, sin will-change y sin parpadeos.
        style.textContent = `
            .boton-ayuda-global,
            .info > img,
            .info .icono-pixel[src*="Informacion"],
            .info.guia-normalizada .boton-ayuda-global,
            .control-registro img[src*="Informacion"] {
                animation: none !important;
                transform: none !important;
                transform-origin: center center !important;
                will-change: auto !important;
            }

            .boton-ayuda-global {
                display: block !important;
                width: 2.8125rem !important;
                height: auto !important;
                line-height: 0 !important;
            }

            .info.guia-normalizada {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 0.375rem !important;
            }

            .info.guia-normalizada .boton-ayuda-global {
                position: static !important;
                margin: 0 auto !important;
                padding: 0 !important;
                background: transparent !important;
                border: 0 !important;
                box-shadow: none !important;
            }

            .info.guia-normalizada .texto-ayuda-subtitulado {
                font-family: 'Press Start 2P', monospace !important;
                font-size: 0.55rem !important;
                color: #7ce9fc !important;
                margin: 0.5rem 0 0 0 !important;
                padding: 0.3125rem 0.625rem !important;
                text-align: center !important;
                text-transform: uppercase !important;
                white-space: normal !important;
                background-color: #0b0204 !important;
                border: 0.125rem solid #b3002d !important;
                border-radius: 0 !important;
                box-shadow: 0.1875rem 0.1875rem 0 #1a0005 !important;
                text-shadow: none !important;
            }

            .boton-ayuda-global img,
            .info.guia-normalizada .boton-ayuda-global img,
            .control-registro img[src*="Informacion"],
            .info > img,
            .info .icono-pixel[src*="Informacion"] {
                display: block !important;
                width: 2.8125rem !important;
                height: auto !important;
                max-width: 100% !important;
                margin: 0 auto !important;
                image-rendering: pixelated;
                filter: drop-shadow(0 0 0.18rem rgba(255, 0, 0, 0.55));
            }
        `;

        // Insertamos los estilos en el <head> para que afecten a toda la pagina.
        document.head.appendChild(style);
    }

    // Convierte el bloque viejo de informacion en una estructura consistente y centrada.
    function normalizeGuideMarkup() {
        // Recorremos todos los bloques .info porque cada pagina puede tener uno.
        document.querySelectorAll(".info").forEach((info, index) => {
            // Si este bloque ya fue ordenado, no hacemos nada.
            if (info.classList.contains("guia-normalizada")) return;

            // Buscamos la imagen que actua como icono de informacion/guia.
            const image = info.querySelector('img[src*="Informacion"], img[alt*="Info"], img[alt*="Guia"], img[alt*="Guía"]');

            // Buscamos el texto/enlace que acompana al icono.
            const textLink = info.querySelector(".btn-info-texto");

            // Si falta la imagen o el texto, dejamos ese bloque tal como estaba.
            if (!image || !textLink) return;

            // Usamos el texto visible como nombre accesible del boton.
            const text = textLink.textContent.trim() || "Guia";

            // Creamos un enlace nuevo para que la imagen sea el boton real.
            const guideLink = document.createElement("a");

            // Conservamos el destino original del enlace.
            guideLink.href = textLink.getAttribute("href") || "#";

            // Esta clase permite aplicar el CSS global de guia.
            guideLink.className = "boton-ayuda-global";

            // Reutilizamos el id antiguo si existia; si no, creamos uno estable.
            guideLink.id = textLink.id || `disparador-ayuda-normalizado-${index}`;

            // Anadiendo aria-label hacemos que lectores de pantalla entiendan el boton.
            guideLink.setAttribute("aria-label", text);

            // Aseguramos que la imagen use el estilo pixelado comun del proyecto.
            image.classList.add("icono-pixel");

            // Movemos la imagen dentro del enlace nuevo.
            guideLink.appendChild(image);

            // Creamos un texto debajo del icono para que todos los bloques se vean iguales.
            const label = document.createElement("p");

            // Esta clase da formato al subtitulo sin depender del HTML original.
            label.className = "texto-ayuda-subtitulado";

            // Ponemos el texto original dentro de la etiqueta nueva.
            label.textContent = text;

            // Quitamos el enlace viejo porque ya hemos creado uno mas ordenado.
            textLink.remove();

            // Vaciamos el bloque para reconstruirlo limpio.
            info.textContent = "";

            // Marcamos el bloque como normalizado para evitar repetir el trabajo.
            info.classList.add("guia-normalizada");

            // Insertamos el boton y su texto en orden vertical.
            info.append(guideLink, label);
        });
    }

    // Si el HTML aun esta cargando, esperamos a que el DOM exista.
    if (document.readyState === "loading") {
        // Ejecutamos todo cuando el navegador termina de construir la pagina.
        document.addEventListener("DOMContentLoaded", () => {
            // Primero ordenamos el HTML visible.
            normalizeGuideMarkup();

            // Despues aplicamos los estilos ligeros.
            injectGuideStyles();
        });
    } else {
        // Si el DOM ya existe, ejecutamos el ajuste inmediatamente.
        normalizeGuideMarkup();

        // Aplicamos los estilos ligeros inmediatamente.
        injectGuideStyles();
    }
})();
