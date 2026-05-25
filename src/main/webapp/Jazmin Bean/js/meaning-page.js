// Rellena una pagina de significado usando Jazmin Bean/data/significados.json.
// Asi no hacen falta 63 HTML casi iguales para canciones distintas.
document.addEventListener("DOMContentLoaded", async () => {
  const slug = currentSlug();

  try {
    const response = await fetch("../Jazmin Bean/data/significados.json");
    const meanings = await response.json();
    const meaning = meanings.find((item) => item.slug === slug) || meanings[0];

    renderMeaning(meaning);
  } catch (error) {
    renderError();
  }
});

function currentSlug() {
  const params = new URLSearchParams(window.location.search);
  const querySlug = params.get("id");
  if (querySlug) return querySlug.replace(/\.html$/i, "");

  const file = window.location.pathname.split("/").pop() || "";
  return decodeURIComponent(file).replace(/\.html$/i, "");
}

function renderMeaning(meaning) {
  document.title = `${meaning.title} - Significado`;
  setText("[data-meaning-title]", meaning.title);
  setText("[data-meaning-artist]", meaning.artist);
  setText("[data-meaning-album]", meaning.album);
  setHtml("[data-meaning-letter]", meaning.letterHtml);
  setHtml("[data-meaning-text]", meaning.meaningHtml);

  const image = document.querySelector("[data-meaning-image]");
  if (image) {
    image.src = meaning.image;
    image.alt = meaning.artist;
  }
}

function renderError() {
  setText("[data-meaning-title]", "Significado no encontrado");
  setHtml("[data-meaning-letter]", "<p>No se pudo cargar esta cancion.</p>");
  setHtml("[data-meaning-text]", "<p>Revisa que el archivo de datos exista.</p>");
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value || "";
}

function setHtml(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.innerHTML = value || "";
}
