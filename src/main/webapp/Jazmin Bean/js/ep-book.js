document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-ep-book]').forEach((book) => {
    const leaves = Array.from(book.querySelectorAll('.ep-hoja'));
    const prev = document.querySelector('[data-ep-prev-page]');
    const next = document.querySelector('[data-ep-next-page]');
    const toggle = document.querySelector('[data-ep-toggle]');
    const label = document.querySelector('[data-ep-page-label]');
    const controls = document.querySelector('.ep-controles-libro');
    let current = 0;
    let open = book.classList.contains('abierto');

    function pauseAudios() { book.querySelectorAll('audio').forEach((audio) => audio.pause()); }

    function render() {
      leaves.forEach((leaf, index) => leaf.classList.toggle('girada', index < current));
      book.classList.toggle('abierto', open);
      if (controls) controls.classList.toggle('mostrar-laterales', open);
      if (toggle) toggle.textContent = open ? 'Cerrar Cuento' : 'Abrir Cuento';
      if (prev) prev.disabled = !open || current === 0;
      if (next) next.disabled = !open || current === leaves.length - 1;
      if (label) label.textContent = String(current + 1) + ' / ' + String(leaves.length);
      pauseAudios();
    }

    book.epGoTo = (target) => {
      current = Math.max(0, Math.min(target, leaves.length - 1));
      render();
    };

    if (toggle) {
      toggle.addEventListener('click', () => {
        open = !open;
        if (!open) current = 0;
        render();
      });
    }
    if (prev) prev.addEventListener('click', () => { if (current > 0) { current -= 1; render(); } });
    if (next) next.addEventListener('click', () => { if (current < leaves.length - 1) { current += 1; render(); } });
    render();
  });
});

function Ejecutar() {
  const input = document.getElementById('mibuscador');
  const book = document.querySelector('[data-ep-book]');
  if (!input || !book) return;

  const query = input.value.toLowerCase().trim();
  if (!query) return;

  const leaves = Array.from(book.querySelectorAll('.ep-hoja'));
  const target = leaves.findIndex((leaf) =>
    Array.from(leaf.querySelectorAll('h3')).some((title) => title.textContent.toLowerCase().trim() === query)
  );

  if (target === -1) {
    alert('Esa canción no existe en este EP.');
    return;
  }

  if (typeof book.epGoTo === 'function') book.epGoTo(target);
  input.value = '';
}

