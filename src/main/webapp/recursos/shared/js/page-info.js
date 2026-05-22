

(function () {
    
    function ready(callback) {
        if (document.readyState === "loading") {
            
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }

        callback();
    }

    
    function getModal() {
        
        let modal = document.getElementById("modal-ayuda-visual");

        if (!modal) {
            modal = document.createElement("div");
            modal.id = "modal-ayuda-visual";
            modal.className = "pantalla-ayuda-modal";
            modal.innerHTML = `
                <div class="cuerpo-ayuda-retro">
                    <h2>Informacion de la pagina</h2>
                    <div class="galeria-explicativa">
                        <div class="tarjeta-instruccion">
                            <p><span>Paraiso de la Oscuridad</span><br>Usa el buscador para encontrar albumes o canciones dentro de esta seccion.</p>
                        </div>
                        <div class="tarjeta-instruccion">
                            <p><span>Guia rapida</span><br>Los botones superiores te llevan al menu, atras o al cierre de sesion.</p>
                        </div>
                    </div>
                    <button type="button" class="cerrar-ayuda-btn ritual-btn">Entendi el ritual</button>
                </div>
            `;
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

    ready(() => {
        
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




