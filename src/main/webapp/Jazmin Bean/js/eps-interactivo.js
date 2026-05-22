document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.disco-card[data-tipo="single"]');
  cards.forEach((card) => {
    const button = card.querySelector('.disco-imagen-btn');
    const audio = card.querySelector('audio');
    const status = card.querySelector('.estado-audio');
    if (!button) return;
    button.addEventListener('click', () => {
      if (!audio || !audio.querySelector('source') || !audio.querySelector('source').getAttribute('src')) {
        if (status) status.textContent = 'Audio pendiente';
        return;
      }
      document.querySelectorAll('.audio-single').forEach((other) => {
        if (other !== audio) {
          other.pause();
          other.closest('.disco-card')?.classList.remove('reproduciendo');
        }
      });
      if (audio.paused) {
        audio.play().then(() => {
          card.classList.add('reproduciendo');
          if (status) status.textContent = 'Reproduciendo';
        }).catch(() => {
          if (status) status.textContent = 'Pulsa play en el reproductor';
        });
      } else {
        audio.pause();
        card.classList.remove('reproduciendo');
        if (status) status.textContent = 'Pausado';
      }
    });
    if (audio) {
      audio.addEventListener('ended', () => {
        card.classList.remove('reproduciendo');
        if (status) status.textContent = 'Finalizado';
      });
    }
  });
});

