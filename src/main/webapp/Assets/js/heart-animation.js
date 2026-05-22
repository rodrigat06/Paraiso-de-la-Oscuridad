(function () {
    function injectHeartAnimation() {
        if (document.getElementById("paraiso-heart-animation-style")) return;
        const style = document.createElement("style");
        style.id = "paraiso-heart-animation-style";
        style.textContent = `
            .boton-ayuda-global,
            .info > img,
            .info .icono-pixel[src*="Informacion"],
            .info.guia-normalizada .boton-ayuda-global,
            .control-registro img[src*="Informacion"] {
                animation: paraisoCorazonGuia 0.25s steps(1) infinite !important;
                transform-origin: center center !important;
                will-change: transform, filter;
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
                white-space: nowrap !important;
                background-color: #0b0204 !important;
                border: 0.125rem solid #b3002d !important;
                border-radius: 0 !important;
                box-shadow: 0.1875rem 0.1875rem 0 #1a0005 !important;
                text-shadow: none !important;
            }

            .boton-ayuda-global img,
            .info.guia-normalizada .boton-ayuda-global img,
            .control-registro img[src*="Informacion"] {
                display: block !important;
                width: 100% !important;
                height: auto !important;
                max-width: none !important;
                margin: 0 auto !important;
                image-rendering: pixelated;
                filter: drop-shadow(0 0 0.25rem rgba(255, 0, 0, 0.8));
            }

            .info > img,
            .info .icono-pixel[src*="Informacion"] {
                display: block !important;
                width: 2.8125rem !important;
                height: auto !important;
                max-width: none !important;
                margin: 0 auto !important;
                image-rendering: pixelated;
                filter: drop-shadow(0 0 0.25rem rgba(255, 0, 0, 0.8));
            }

            .contenedor-ayuda-global:hover .boton-ayuda-global,
            .info:hover > img,
            .info:hover .icono-pixel[src*="Informacion"],
            .info.guia-normalizada:hover .boton-ayuda-global,
            .control-registro:hover img[src*="Informacion"] {
                animation-duration: 0.2s !important;
            }

            @keyframes paraisoCorazonGuia {
                0%, 100% {
                    transform: scale(1);
                    filter: drop-shadow(0 0 0.25rem rgba(255, 0, 43, 0.6));
                }
                20% {
                    transform: scale(1.15);
                    filter: drop-shadow(0 0 0.38rem #b3002d);
                }
                40% {
                    transform: scale(0.95);
                    filter: drop-shadow(0 0 0.25rem rgba(255, 0, 43, 0.75));
                }
                60% {
                    transform: scale(1.18);
                    filter: drop-shadow(0 0 0.38rem #b3002d);
                }
                80% {
                    transform: scale(0.98);
                    filter: drop-shadow(0 0 0.25rem rgba(255, 0, 43, 0.72));
                }
            }
        `;
        document.head.appendChild(style);
    }

    function normalizeGuideMarkup() {
        document.querySelectorAll(".info").forEach((info, index) => {
            if (info.classList.contains("guia-normalizada")) return;

            const image = info.querySelector('img[src*="Informacion"], img[alt*="Info"], img[alt*="Guia"], img[alt*="Guía"]');
            const textLink = info.querySelector(".btn-info-texto");
            if (!image || !textLink) return;

            const text = textLink.textContent.trim() || "Guia";
            const heartLink = document.createElement("a");
            heartLink.href = textLink.getAttribute("href") || "#";
            heartLink.className = "boton-ayuda-global";
            heartLink.id = textLink.id || `disparador-ayuda-normalizado-${index}`;
            heartLink.setAttribute("aria-label", text);

            image.classList.add("icono-pixel");
            heartLink.appendChild(image);

            const label = document.createElement("p");
            label.className = "texto-ayuda-subtitulado";
            label.textContent = text;

            textLink.remove();
            info.textContent = "";
            info.classList.add("guia-normalizada");
            info.append(heartLink, label);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            normalizeGuideMarkup();
            injectHeartAnimation();
        });
    } else {
        normalizeGuideMarkup();
        injectHeartAnimation();
    }
})();
