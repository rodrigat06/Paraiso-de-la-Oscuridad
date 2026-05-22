(function () {
    function volverAPaginaAnterior(event) {
        const enlace = event.currentTarget;

        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
        }

        if (window.history.length > 1) {
            event.preventDefault();
            window.history.back();
            return;
        }

        if (!enlace.getAttribute("href")) {
            event.preventDefault();
        }
    }

    function activarBotonesAtras() {
        document.querySelectorAll("a.btn-atras").forEach((enlace) => {
            if (enlace.dataset.historialAtras === "activo") return;
            enlace.dataset.historialAtras = "activo";
            enlace.addEventListener("click", volverAPaginaAnterior);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", activarBotonesAtras);
    } else {
        activarBotonesAtras();
    }
})();
