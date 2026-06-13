(function () {
  var header = document.querySelector("[data-header]");
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  function onScroll() {
    if (!header) {
      return;
    }

    if (window.scrollY > 44) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function applyFilter(root, query) {
    if (!root) {
      return;
    }

    var cards = root.querySelectorAll("[data-movie-card], .rank-row");
    var text = normalize(query);

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-search-text") || card.textContent);
      if (!text || haystack.indexOf(text) !== -1) {
        card.classList.remove("is-hidden");
      } else {
        card.classList.add("is-hidden");
      }
    });
  }

  document.querySelectorAll("[data-card-search]").forEach(function (input) {
    var targetId = input.getAttribute("data-search-target");
    var target = targetId ? document.getElementById(targetId) : null;

    input.addEventListener("input", function () {
      document.querySelectorAll("[data-filter-button]").forEach(function (button) {
        button.classList.remove("is-active");
      });
      applyFilter(target, input.value);
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query) {
      input.value = query;
      applyFilter(target, query);
    }
  });

  document.querySelectorAll("[data-filter-button]").forEach(function (button) {
    button.addEventListener("click", function () {
      var panel = button.closest(".filter-panel");
      var input = panel ? panel.querySelector("[data-card-search]") : null;
      var target = input ? document.getElementById(input.getAttribute("data-search-target")) : null;
      var value = button.getAttribute("data-filter-button");

      panel.querySelectorAll("[data-filter-button]").forEach(function (item) {
        item.classList.remove("is-active");
      });
      button.classList.add("is-active");

      if (input) {
        input.value = value === "全部" ? "" : value;
      }
      applyFilter(target, value === "全部" ? "" : value);
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5800);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(parseInt(dot.getAttribute("data-hero-dot"), 10));
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }
})();
