document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    const loginLink = document.querySelector(".extra-links a");
    const formulario = document.getElementById("registroForm");
    const abrirGuia = document.getElementById("disparador-ayuda");
    const guia = document.getElementById("modal-ayuda-visual");

    if (loginLink && redirect === "ayuda") {
        loginLink.href = "../Inicio de Sesion/Inicio de Sesion.html?redirect=ayuda";
    }

    if (abrirGuia && guia) {
        abrirGuia.addEventListener("click", (event) => {
            event.preventDefault();
            guia.classList.add("activo");
        });
    }

    if (guia) {
        guia.querySelectorAll(".cerrar-ayuda-btn, .ritual-btn").forEach((boton) => {
            boton.addEventListener("click", () => {
                guia.classList.remove("activo");
            });
        });

        guia.addEventListener("click", (event) => {
            if (event.target === guia) guia.classList.remove("activo");
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") guia.classList.remove("activo");
        });
    }

    if (!formulario) {
        console.error("No se pudo iniciar el script: El elemento id='registroForm' no existe en este HTML.");
        return;
    }

    const urlRegistro = () => {
        return `${window.location.origin}/auth/register`;
    };

    formulario.addEventListener("submit", (event) => {
        event.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const apellidos = document.getElementById("apellidos").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirm = document.getElementById("confirm").value.trim();
        const errorElement = document.getElementById("error");

        const mostrarError = (mensaje) => {
            if (errorElement) errorElement.textContent = mensaje;
        };

        mostrarError("");

        if (password !== confirm) {
            mostrarError("Esta contrasena no es de su alma");
            return;
        }

        const endpoint = urlRegistro();

        fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ nombre, apellidos, email, password })
        })
            .then((res) => {
                if (!res.ok) {
                    const contentType = res.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        return res.json().then((err) => {
                            throw new Error(err.mensaje || "Sacrificio ya en posesion");
                        });
                    }

                    return res.text().then(() => {
                        throw new Error("Error interno del servidor. Revisa que Tomcat este activo.");
                    });
                }

                return res.json().catch(() => ({}));
            })
            .then((data) => {
                if (!data.ok) {
                    throw new Error(data.mensaje || "No se pudo crear la cuenta en MySQL");
                }

                alert("Bienvenido a esta gran familia");
                window.location.href = "../Inicio de Sesion/Inicio de Sesion.html";
            })
            .catch((err) => {
                console.error("Detalles del error capturado:", err);
                mostrarError(err.message || "No se pudo crear la cuenta en MySQL");
            });
    });
});



