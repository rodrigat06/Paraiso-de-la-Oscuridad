// Envia el formulario al backend y guarda el rol recibido.
const form = document.querySelector("#loginForm");
const message = document.querySelector("#message");
const wantsAdmin = new URLSearchParams(location.search).get("admin") === "1";

if (wantsAdmin) {
  message.textContent = "Entra con la cuenta administradora para abrir ese panel.";
}

if (new URLSearchParams(location.search).get("logout") === "1") {
  localStorage.removeItem("user-email");
  localStorage.removeItem("user-role");
  message.textContent = "Sesion cerrada.";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "Comprobando...";

  const data = {
    email: form.email.value.trim(),
    password: form.password.value.trim()
  };

  try {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      message.textContent = "Correo o contraseña incorrectos.";
      return;
    }

    const result = await response.json();

    if (!result.ok) {
      message.textContent = result.mensaje || "Correo o contraseña incorrectos.";
      return;
    }

    localStorage.setItem("user-email", result.email || data.email);
    localStorage.setItem("user-role", result.rol || "USER");

    if (wantsAdmin && result.rol !== "ADMIN") {
      message.textContent = "Esta cuenta no es administradora.";
      return;
    }

    window.location.href = result.rol === "ADMIN" ? "../administrador/administrador.html" : "../explorar/explorar.html";
  } catch (error) {
    message.textContent = "No se pudo conectar con el servidor.";
  }
});
