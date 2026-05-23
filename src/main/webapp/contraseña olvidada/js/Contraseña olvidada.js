document.addEventListener("DOMContentLoaded", () => {

    const checkAccountForm = document.getElementById("checkAccountForm");
    const resetPasswordForm = document.getElementById("resetPasswordForm");
    const errorElement = document.getElementById("error");
    const mensajeExito = document.getElementById("mensajeExito");
    const recoverIntro = document.getElementById("recoverIntro");
    const tituloProceso = document.getElementById("tituloProceso");

    const disparadorAyuda = document.getElementById("disparador-ayuda");
    const modalAyuda = document.getElementById("modal-ayuda-visual");
    const cerrarAyuda = document.querySelector(".ritual-btn"); 

    if (disparadorAyuda && modalAyuda) {
        disparadorAyuda.addEventListener("click", (e) => {
            e.preventDefault();
            modalAyuda.classList.add("activo"); 
        });
    }
    if (cerrarAyuda && modalAyuda) {
        cerrarAyuda.addEventListener("click", () => {
            modalAyuda.classList.remove("activo"); 
        });
    }

    let emailValidado = "";

    const authUrl = (path) => {
        return `${window.location.origin}${path}`;
    };

    const pintarCuentaEncontrada = (email) => {
        emailValidado = email;
        checkAccountForm.classList.add("hidden");
        if (recoverIntro) recoverIntro.classList.add("hidden");
        if (tituloProceso) tituloProceso.textContent = "Reescritura de Alma";
        if (mensajeExito) {
            mensajeExito.textContent = `Alma reconocida: ${emailValidado}. La plaga abre un nuevo pacto para ti.`;
            mensajeExito.classList.remove("hidden");
        }
        if (resetPasswordForm) {
            resetPasswordForm.classList.remove("hidden");
        }
    };

    
    if (checkAccountForm) {
        checkAccountForm.addEventListener("submit", async (e) => {
            e.preventDefault(); 
            
            if (errorElement) {
                errorElement.textContent = "";
                errorElement.classList.add("hidden");
            }
            if (mensajeExito) {
                mensajeExito.textContent = "";
                mensajeExito.classList.add("hidden");
            }

            const recoverEmailInput = document.getElementById("recoverEmail");
            if (!recoverEmailInput) return;

            const email = recoverEmailInput.value.trim();
            if (!email) return;

            try {
                const res = await fetch(authUrl("/auth/recover/check"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({ email: email })
                });

                const data = await res.json();

                if (res.ok && data.ok) {
                    pintarCuentaEncontrada(data.email || email);

                } else {
                    if (errorElement) {
                        errorElement.textContent = data.mensaje || "Ese correo electrónico no pertenece a la plaga.";
                        errorElement.classList.remove("hidden");
                    }
                }

            } catch (err) {
                console.error("Error en comunicación con Java (Check):", err);
                if (errorElement) {
                    errorElement.textContent = "Error de conexión. Asegúrate de que Tomcat esté activo.";
                    errorElement.classList.remove("hidden");
                }
            }
        });
    }

    
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault(); 
            
            if (errorElement) {
                errorElement.textContent = "";
                errorElement.classList.add("hidden");
            }

            const password = document.getElementById("newPassword").value.trim();
            const confirm = document.getElementById("confirmPassword").value.trim();

            if (password.length < 6) {
                if (errorElement) {
                    errorElement.textContent = "La contraseña debe tener al menos 6 caracteres.";
                    errorElement.classList.remove("hidden");
                }
                return;
            }

            if (password !== confirm) {
                if (errorElement) {
                    errorElement.textContent = "Las contraseñas de tu alma no coinciden.";
                    errorElement.classList.remove("hidden");
                }
                return;
            }

            try {
                const res = await fetch(authUrl("/auth/recover/reset"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({ 
                        email: emailValidado, 
                        password: password 
                    })
                });

                const data = await res.json();

                if (res.ok && data.ok) {
                    alert(data.mensaje || "Contraseña forjada con éxito. Regresando al inicio de sesión.");
                    window.location.href = "../Inicio de Sesion/Inicio de Sesion.html";
                } else {
                    if (errorElement) {
                        errorElement.textContent = data.mensaje || "No se pudo actualizar la contraseña.";
                        errorElement.classList.remove("hidden");
                    }
                }

            } catch (err) {
                console.error("Error al actualizar contraseña (Reset):", err);
                if (errorElement) {
                    errorElement.textContent = "Error interno del servidor al procesar el cambio.";
                    errorElement.classList.remove("hidden");
                }
            }
        });
    }
});


