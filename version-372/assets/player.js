(() => {
  const players = document.querySelectorAll('[data-player]');

  players.forEach((player) => {
    const video = player.querySelector('video');
    const trigger = player.querySelector('[data-play-trigger]');
    const url = player.dataset.videoUrl;
    let hlsInstance = null;
    let loaded = false;

    const attach = () => {
      if (!video || !url || loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    };

    const play = () => {
      attach();
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
      video.controls = true;
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {
          video.controls = true;
        });
      }
    };

    if (trigger && video) {
      trigger.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', () => {
        if (!loaded) {
          play();
        }
      });
    }

    window.addEventListener('pagehide', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
})();
