// Envia el formulario al backend. Si falla, muestra un mensaje claro.
const form = document.querySelector("#loginForm");
const message = document.querySelector("#message");

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

    localStorage.setItem("user-email", data.email);
    window.location.href = "../explorar/index.html";
  } catch (error) {
    message.textContent = "No se pudo conectar con el servidor.";
  }
});
