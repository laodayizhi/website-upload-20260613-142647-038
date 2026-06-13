(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === heroIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showHero(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  const forms = Array.from(document.querySelectorAll('.site-search-form'));
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }
      const keyword = input.value.trim();
      if (!keyword) {
        return;
      }
      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(keyword);
    });
  });

  const filter = document.querySelector('.catalog-filter');
  if (filter) {
    const keywordInput = filter.querySelector('.filter-keyword');
    const yearSelect = filter.querySelector('.filter-year');
    const typeSelect = filter.querySelector('.filter-type');
    const regionSelect = filter.querySelector('.filter-region');
    const cards = Array.from(document.querySelectorAll('[data-title]'));
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';

    if (keywordInput && query) {
      keywordInput.value = query;
    }

    function matchCard(card) {
      const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      const year = yearSelect ? yearSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      const region = regionSelect ? regionSelect.value : '';
      const content = [
        card.dataset.title || '',
        card.dataset.year || '',
        card.dataset.type || '',
        card.dataset.region || '',
        card.dataset.tags || '',
        card.textContent || ''
      ].join(' ').toLowerCase();

      if (keyword && !content.includes(keyword)) {
        return false;
      }
      if (year && card.dataset.year !== year) {
        return false;
      }
      if (type && card.dataset.type !== type) {
        return false;
      }
      if (region && card.dataset.region !== region) {
        return false;
      }
      return true;
    }

    function applyFilter() {
      cards.forEach(function (card) {
        card.style.display = matchCard(card) ? '' : 'none';
      });
    }

    [keywordInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }
})();

function initMoviePlayer(src, poster) {
  const video = document.getElementById('moviePlayer');
  const mask = document.getElementById('playMask');
  let ready = false;
  let hlsInstance = null;

  if (!video) {
    return;
  }

  if (poster) {
    video.setAttribute('poster', poster);
  }

  function bindSource() {
    if (ready) {
      return;
    }
    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = src;
  }

  function start() {
    bindSource();
    if (mask) {
      mask.classList.add('hidden');
    }
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (mask) {
    mask.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (!ready) {
      start();
    }
  });

  video.addEventListener('play', function () {
    if (mask) {
      mask.classList.add('hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
