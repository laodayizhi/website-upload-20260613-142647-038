(function () {
  'use strict';

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function uniqueSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort(function (a, b) {
      return String(a).localeCompare(String(b), 'zh-Hans-CN');
    });
  }

  function initMobileMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = qsa('.hero-slide', slider);
    var dots = qsa('[data-hero-dot]', slider);
    if (slides.length <= 1) {
      return;
    }

    var activeIndex = 0;
    var timer = null;

    function activate(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === activeIndex);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === activeIndex);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(activeIndex + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function fillFilterOptions(cards, attrName, select) {
    if (!select) {
      return;
    }

    var values = uniqueSorted(cards.map(function (card) {
      return card.getAttribute(attrName);
    }));

    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var lists = qsa('[data-filter-list]');
    lists.forEach(function (list) {
      var section = list.closest('.content-section') || document;
      var cards = qsa('[data-title]', list);
      var keyword = qs('[data-filter-keyword]', section);
      var region = qs('[data-filter-region]', section);
      var type = qs('[data-filter-type]', section);
      var year = qs('[data-filter-year]', section);
      var reset = qs('[data-filter-reset]', section);
      var count = qs('[data-filter-count]', section);

      fillFilterOptions(cards, 'data-region', region);
      fillFilterOptions(cards, 'data-type', type);
      fillFilterOptions(cards, 'data-year', year);

      function cardText(card) {
        return normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
      }

      function apply() {
        var key = normalize(keyword && keyword.value);
        var regionValue = region && region.value;
        var typeValue = type && type.value;
        var yearValue = year && year.value;
        var visible = 0;

        cards.forEach(function (card) {
          var matchesKeyword = !key || cardText(card).indexOf(key) !== -1;
          var matchesRegion = !regionValue || card.getAttribute('data-region') === regionValue;
          var matchesType = !typeValue || card.getAttribute('data-type') === typeValue;
          var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
          var show = matchesKeyword && matchesRegion && matchesType && matchesYear;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '当前显示 ' + visible + ' 部，共 ' + cards.length + ' 部。';
        }
      }

      [keyword, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (keyword) {
            keyword.value = '';
          }
          if (region) {
            region.value = '';
          }
          if (type) {
            type.value = '';
          }
          if (year) {
            year.value = '';
          }
          apply();
        });
      }

      apply();
    });
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="movie-cover" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + ' 在线观看">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="play-hover">▶</span>',
      '    <span class="movie-year">' + escapeHtml(movie.year) + '</span>',
      '  </a>',
      '  <div class="movie-info">',
      '    <a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '    <p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</p>',
      '    <p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var form = qs('[data-search-form]');
    var input = qs('[data-search-input]');
    var results = qs('[data-search-results]');
    var hint = qs('[data-search-hint]');
    var data = window.MOVIE_SEARCH_INDEX || [];

    if (!form || !input || !results || !data.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function matches(movie, query) {
      if (!query) {
        return true;
      }
      var text = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' '));
      return text.indexOf(query) !== -1;
    }

    function render() {
      var query = normalize(input.value);
      var matched = data.filter(function (movie) {
        return matches(movie, query);
      }).slice(0, 120);

      results.innerHTML = matched.map(movieCardTemplate).join('');
      if (hint) {
        if (query) {
          hint.textContent = '关键词“' + input.value + '”找到 ' + matched.length + ' 条结果，最多展示前 120 条。';
        } else {
          hint.textContent = '默认展示前 120 部影片，可输入关键词继续筛选。';
        }
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set('q', input.value.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
      render();
    });

    input.addEventListener('input', render);
    render();
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = qs('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function initPlayers() {
    qsa('[data-player-shell]').forEach(function (shell) {
      var video = qs('video[data-video-src]', shell);
      var trigger = qs('[data-player-trigger]', shell);
      var status = qs('[data-player-status]', shell);
      if (!video || !trigger) {
        return;
      }

      var src = video.getAttribute('data-video-src');

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function playNative() {
        video.src = src;
        video.play().catch(function () {
          setStatus('浏览器已加载播放源，请再次点击视频播放。');
        });
      }

      function playWithHls() {
        if (!window.Hls || !window.Hls.isSupported()) {
          setStatus('当前浏览器不支持 HLS 播放，请使用 Safari、Chrome 或 Edge 最新版本。');
          return;
        }
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            setStatus('播放源已载入，请再次点击视频播放。');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载失败，可刷新页面后重试。');
            hls.destroy();
          }
        });
      }

      trigger.addEventListener('click', function () {
        if (!src) {
          setStatus('当前影片暂无播放源。');
          return;
        }
        trigger.classList.add('is-hidden');
        setStatus('正在加载 HLS 播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          playNative();
          return;
        }

        loadHls(playWithHls);
      });

      video.addEventListener('play', function () {
        trigger.classList.add('is-hidden');
        setStatus('正在播放。');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroSlider();
    initFilters();
    initSearchPage();
    initPlayers();
  });
}());
