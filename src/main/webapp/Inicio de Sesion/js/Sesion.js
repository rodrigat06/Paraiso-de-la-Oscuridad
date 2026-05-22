document.addEventListener("DOMContentLoaded", () => {
    const disparadorAyuda = document.getElementById("disparador-ayuda");
    const modalAyuda = document.getElementById("modal-ayuda-visual");
    const botonCerrarRitual = document.querySelector(".ritual-btn");
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    const form = document.getElementById("loginForm");
    const error = document.getElementById("error");

    if (disparadorAyuda && modalAyuda) {
        disparadorAyuda.addEventListener("click", (event) => {
            event.preventDefault();
            modalAyuda.classList.add("activo");
        });
    }

    if (botonCerrarRitual && modalAyuda) {
        botonCerrarRitual.addEventListener("click", () => {
            modalAyuda.classList.remove("activo");
        });
    }

    if (!form) {
        console.warn("ALERTA: No se ha encontrado ningun formulario con id='loginForm' en este HTML.");
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (error) error.textContent = "";

        try {
            const loginUrl = window.location.origin.includes("localhost:8080") || window.location.origin.includes("127.0.0.1:8080")
                ? `${window.location.origin}/auth/login`
                : "http://localhost:8080/auth/login";

            const res = await fetch(loginUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            if (res.redirected) {
                window.location.href = res.url;
                return;
            }

            const data = await res.json().catch(() => ({}));

            if (res.ok && (data.ok || data.status === "success" || Object.keys(data).length === 0)) {
                const role = String(data.rol || data.usuario?.rol || "").toLowerCase();
                localStorage.setItem("wikisingers-auth", "true");
                localStorage.setItem("user-email", email);
                localStorage.setItem("sportbook-authenticated", "true");
                localStorage.setItem("sportbook-user-email", email);
                localStorage.setItem("sportbook-user-role", role);
                window.location.href = redirect === "ayuda" ? "../Menú.html#ayuda" : "../Menú.html";
                return;
            }

            localStorage.removeItem("wikisingers-auth");
            localStorage.removeItem("sportbook-authenticated");
            localStorage.removeItem("user-email");
            localStorage.removeItem("sportbook-user-email");
            localStorage.removeItem("sportbook-user-role");
            if (error) error.textContent = data.mensaje || "Correo o contrasena de su alma incorrectos";
        } catch (err) {
            console.error("Error critico capturado en login:", err);
            localStorage.removeItem("wikisingers-auth");
            localStorage.removeItem("sportbook-authenticated");
            localStorage.removeItem("user-email");
            localStorage.removeItem("sportbook-user-email");
            localStorage.removeItem("sportbook-user-role");
            if (error) error.textContent = "Error interno. Revisa que Tomcat este activo.";
        }
    });
});



