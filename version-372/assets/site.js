(() => {
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  const updateHeader = () => {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 30);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', () => {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-local-filter-form]').forEach((form) => {
    form.addEventListener('submit', (event) => event.preventDefault());
  });

  document.querySelectorAll('[data-local-filter]').forEach((input) => {
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const empty = document.querySelector('[data-empty-state]');

    const filterCards = () => {
      const query = input.value.trim().toLowerCase();
      let visible = 0;

      cards.forEach((card) => {
        const haystack = (card.dataset.search || card.textContent || '').toLowerCase();
        const match = !query || haystack.includes(query);
        card.hidden = !match;
        if (match) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    input.addEventListener('input', filterCards);
    filterCards();
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;
    let timer = null;

    const setSlide = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, current) => {
        const active = current === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach((dot, current) => {
        dot.classList.toggle('is-active', current === index);
      });
    };

    const start = () => {
      if (timer || slides.length <= 1) {
        return;
      }
      timer = window.setInterval(() => setSlide(index + 1), 5200);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', () => {
        setSlide(dotIndex);
        stop();
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    setSlide(0);
    start();
  }
})();
