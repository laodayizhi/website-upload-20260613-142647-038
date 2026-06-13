(function () {
    var body = document.body;
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var panel = document.querySelector('[data-search-panel]');
    var openButtons = document.querySelectorAll('[data-open-search]');
    var closeButtons = document.querySelectorAll('[data-close-search]');
    var searchInput = document.querySelector('[data-site-search-input]');
    var searchResults = document.querySelector('[data-site-search-results]');
    var movies = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];

    function renderResults(query) {
        if (!searchResults) {
            return;
        }
        var value = (query || '').trim().toLowerCase();
        if (!value) {
            searchResults.innerHTML = '<div class="empty-state">输入关键词即可查找影片</div>';
            return;
        }
        var terms = value.split(/\s+/).filter(Boolean);
        var matches = movies.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.tags,
                movie.oneLine
            ].join(' ').toLowerCase();
            return terms.every(function (term) {
                return haystack.indexOf(term) !== -1;
            });
        }).slice(0, 24);
        if (!matches.length) {
            searchResults.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
            return;
        }
        searchResults.innerHTML = matches.map(function (movie) {
            return [
                '<a class="search-result" href="' + movie.link + '">',
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
                '<span>',
                '<strong>' + escapeHtml(movie.title) + '</strong>',
                '<span>' + escapeHtml(movie.region + ' · ' + movie.type + ' · ' + movie.year) + '</span>',
                '<em>' + escapeHtml(movie.oneLine || '') + '</em>',
                '</span>',
                '</a>'
            ].join('');
        }).join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function openSearch() {
        if (!panel) {
            return;
        }
        panel.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
        body.classList.add('search-open');
        renderResults(searchInput ? searchInput.value : '');
        if (searchInput) {
            setTimeout(function () {
                searchInput.focus();
            }, 40);
        }
    }

    function closeSearch() {
        if (!panel) {
            return;
        }
        panel.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
        body.classList.remove('search-open');
    }

    openButtons.forEach(function (button) {
        button.addEventListener('click', openSearch);
    });

    closeButtons.forEach(function (button) {
        button.addEventListener('click', closeSearch);
    });

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            renderResults(searchInput.value);
        });
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeSearch();
        }
    });

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                play();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                play();
            });
        });

        showSlide(0);
        play();
    }

    var catalogInput = document.querySelector('[data-catalog-filter]');
    var clearFilter = document.querySelector('[data-clear-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    function filterCatalog() {
        if (!catalogInput || !cards.length) {
            return;
        }
        var value = catalogInput.value.trim().toLowerCase();
        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre')
            ].join(' ').toLowerCase();
            card.style.display = !value || haystack.indexOf(value) !== -1 ? '' : 'none';
        });
    }

    if (catalogInput) {
        catalogInput.addEventListener('input', filterCatalog);
    }

    if (clearFilter) {
        clearFilter.addEventListener('click', function () {
            if (catalogInput) {
                catalogInput.value = '';
                filterCatalog();
                catalogInput.focus();
            }
        });
    }
})();
