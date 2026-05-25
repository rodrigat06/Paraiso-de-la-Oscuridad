// Manda los datos al backend y redirige al login si todo va bien.
const form = document.querySelector("#registerForm");
const message = document.querySelector("#message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "Creando cuenta...";

  const data = {
    nombre: form.nombre.value.trim(),
    apellidos: form.apellido.value.trim(),
    email: form.email.value.trim(),
    password: form.password.value.trim()
  };

  try {
    const response = await fetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    });

    message.textContent = response.ok ? "Cuenta creada. Ve al login." : "No se pudo crear la cuenta.";
  } catch (error) {
    message.textContent = "No se pudo conectar con el servidor.";
  }
});
