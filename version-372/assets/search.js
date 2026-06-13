(() => {
  const form = document.querySelector('[data-search-form]');
  const input = document.querySelector('#site-search-input');
  const results = document.querySelector('[data-search-results]');
  const status = document.querySelector('[data-search-status]');
  const movies = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const makeCard = (movie) => `
<article class="movie-card">
  <a class="movie-poster" href="./${escapeHtml(movie.href)}">
    <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
    <span class="poster-shade"></span>
    <span class="play-sign">▶</span>
    <span class="card-badge">${escapeHtml(movie.region)}</span>
  </a>
  <div class="movie-info">
    <h3><a href="./${escapeHtml(movie.href)}">${escapeHtml(movie.title)}</a></h3>
    <p class="movie-meta">${escapeHtml(movie.type)} · ${escapeHtml(movie.year)} · ${escapeHtml(movie.genre)}</p>
    <p class="movie-desc">${escapeHtml(movie.oneLine)}</p>
  </div>
</article>`;

  const render = () => {
    const query = input.value.trim().toLowerCase();
    const matched = query
      ? movies.filter((movie) => movie.search.toLowerCase().includes(query)).slice(0, 120)
      : movies.slice(0, 60);

    results.innerHTML = matched.map(makeCard).join('');

    if (status) {
      status.textContent = query ? `搜索结果：${matched.length} 条` : '热门内容推荐';
    }
  };

  if (input) {
    input.value = initialQuery;
    input.addEventListener('input', render);
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = input.value.trim();
      const url = query ? `./search.html?q=${encodeURIComponent(query)}` : './search.html';
      window.history.replaceState(null, '', url);
      render();
    });
  }

  render();
})();
