// Llama al endpoint de recuperacion y evita errores visuales si el servidor falla.
const form = document.querySelector("#recoverForm");
const message = document.querySelector("#message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "Enviando...";

  try {
    const response = await fetch("/auth/recover/check", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ email: form.email.value.trim() })
    });

    message.textContent = response.ok ? "Solicitud enviada." : "No se pudo recuperar.";
  } catch (error) {
    message.textContent = "No se pudo conectar con el servidor.";
  }
});
