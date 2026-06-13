(function () {
    function init(root) {
        var video = root.querySelector('video');
        var overlay = root.querySelector('.player-overlay');
        if (!video || !overlay) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var started = false;

        function play() {
            overlay.classList.add('is-hidden');
            if (!stream) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.getAttribute('src')) {
                    video.setAttribute('src', stream);
                }
                video.play();
                started = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!video._hls) {
                    var hls = new Hls();
                    video._hls = hls;
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        video.play();
                    });
                } else {
                    video.play();
                }
                started = true;
                return;
            }
            if (!video.getAttribute('src')) {
                video.setAttribute('src', stream);
            }
            video.play();
            started = true;
        }

        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!started || video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
    }

    document.querySelectorAll('.player-box').forEach(init);
})();
