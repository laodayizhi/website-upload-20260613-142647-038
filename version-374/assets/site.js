(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var grid = panel.parentElement.querySelector('[data-filter-grid]');
        var empty = panel.parentElement.querySelector('[data-empty-state]');
        if (!grid) {
            return;
        }
        var query = panel.querySelector('[data-filter-query]');
        var type = panel.querySelector('[data-filter-type]');
        var year = panel.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        function norm(value) {
            return (value || '').toString().trim().toLowerCase();
        }
        function apply() {
            var q = norm(query && query.value);
            var t = norm(type && type.value);
            var y = norm(year && year.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = norm([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var typeText = norm(card.getAttribute('data-type') + ' ' + card.getAttribute('data-genre'));
                var yearText = norm(card.getAttribute('data-year'));
                var matched = true;
                if (q && haystack.indexOf(q) === -1) {
                    matched = false;
                }
                if (t && typeText.indexOf(t) === -1) {
                    matched = false;
                }
                if (y && yearText !== y) {
                    matched = false;
                }
                card.classList.toggle('filtered-out', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
        [query, type, year].forEach(function (node) {
            if (node) {
                node.addEventListener('input', apply);
                node.addEventListener('change', apply);
            }
        });
        panel.querySelectorAll('[data-view]').forEach(function (button) {
            button.addEventListener('click', function () {
                panel.querySelectorAll('[data-view]').forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                grid.classList.toggle('view-list', button.getAttribute('data-view') === 'list');
            });
        });
    });
})();
