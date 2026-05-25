// Este archivo solo marca el enlace activo. No hay animaciones pesadas.
const links = document.querySelectorAll(".nav a");

links.forEach((link) => {
  if (link.href === window.location.href) {
    link.classList.add("active");
  }
});
