(function () {
  function prepareVideo(video, sourceUrl) {
    if (video.getAttribute("data-ready") === "true") {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else {
      video.src = sourceUrl;
    }

    video.setAttribute("data-ready", "true");
  }

  function beginPlayback(video, sourceUrl, overlay) {
    prepareVideo(video, sourceUrl);

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  window.initializeMoviePlayer = function (videoId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.querySelector('[data-player-for="' + videoId + '"]');

    if (!video || !sourceUrl) {
      return;
    }

    if (overlay) {
      overlay.addEventListener("click", function () {
        beginPlayback(video, sourceUrl, overlay);
      });
    }

    video.addEventListener("click", function () {
      if (video.getAttribute("data-ready") !== "true") {
        beginPlayback(video, sourceUrl, overlay);
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  };
})();
