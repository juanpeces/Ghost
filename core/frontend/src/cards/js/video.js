(function() {
    const handleVideoPlayer = function (videoElementContainer) {
        const videoPlayer = videoElementContainer.querySelector('.kg-video-player');
        const videoPlayerContainer = videoElementContainer.querySelector('.kg-video-player-container');
        const playIconContainer = videoElementContainer.querySelector('.kg-video-play-icon');
        const pauseIconContainer = videoElementContainer.querySelector('.kg-video-pause-icon');
        const seekSlider = videoElementContainer.querySelector('.kg-video-seek-slider');
        const playbackRateContainer = videoElementContainer.querySelector('.kg-video-playback-rate');
        const muteIconContainer = videoElementContainer.querySelector('.kg-video-mute-icon');
        const unmuteIconContainer = videoElementContainer.querySelector('.kg-video-unmute-icon');
        const volumeSlider = videoElementContainer.querySelector('.kg-video-volume-slider');
        const videoEl = videoElementContainer.querySelector('video');
        const durationContainer = videoElementContainer.querySelector('.kg-video-duration');
        const currentTimeContainer = videoElementContainer.querySelector('.kg-video-current-time');
        const largePlayIcon = videoElementContainer.querySelector('.kg-video-large-play-icon');
        const videoOverlay = videoElementContainer.querySelector('.kg-video-overlay');
        let playbackRates = [{
            rate: 0.75,
            label: '0.7×'
        }, {
            rate: 1.0,
            label: '1×'
        }, {
            rate: 1.25,
            label: '1.2×'
        }, {
            rate: 1.75,
            label: '1.7×'
        }, {
            rate: 2.0,
            label: '2×'
        }];

        let raf = null;
        let currentPlaybackRateIdx = 1;

        const whilePlaying = () => {
            seekSlider.value = Math.floor(videoEl.currentTime);
            currentTimeContainer.textContent = calculateTime(seekSlider.value);
            videoPlayer.style.setProperty('--seek-before-width', `${seekSlider.value / seekSlider.max * 100}%`);
            raf = requestAnimationFrame(whilePlaying);
        }

        const showRangeProgress = (rangeInput) => {
            if (rangeInput === seekSlider) {
                videoPlayer.style.setProperty('--seek-before-width', rangeInput.value / rangeInput.max * 100 + '%');
            }
            else {
                videoPlayer.style.setProperty('--volume-before-width', rangeInput.value / rangeInput.max * 100 + '%');
            }
        }

        const calculateTime = (secs) => {
            const minutes = Math.floor(secs / 60);
            const seconds = Math.floor(secs % 60);
            const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
            return `${minutes}:${returnedSeconds}`;
        }

        const displayDuration = () => {
            durationContainer.textContent = calculateTime(videoEl.duration);
        }

        const setSliderMax = () => {
            seekSlider.max = Math.floor(videoEl.duration);
        }

        const displayBufferedAmount = () => {
            if (videoEl.buffered.length > 0) {
                const bufferedAmount = Math.floor(videoEl.buffered.end(videoEl.buffered.length - 1));
                videoPlayer.style.setProperty('--buffered-width', `${(bufferedAmount / seekSlider.max) * 100}%`);
            }
        }

        if (videoEl.readyState > 0) {
            displayDuration();
            setSliderMax();
            displayBufferedAmount();
            if (videoEl.autoplay) {
                raf = requestAnimationFrame(whilePlaying);
                playIconContainer.classList.add("kg-video-hide");
                pauseIconContainer.classList.remove("kg-video-hide");
            }
            if (videoEl.muted) {
                unmuteIconContainer.classList.add("kg-video-hide");
                muteIconContainer.classList.remove("kg-video-hide");
            }
        } else {
            videoEl.addEventListener('loadedmetadata', () => {
                displayDuration();
                setSliderMax();
                displayBufferedAmount();
                if (videoEl.autoplay) {
                    raf = requestAnimationFrame(whilePlaying);
                    playIconContainer.classList.add("kg-video-hide");
                    pauseIconContainer.classList.remove("kg-video-hide");
                }
                if (videoEl.muted) {
                    unmuteIconContainer.classList.add("kg-video-hide");
                    muteIconContainer.classList.remove("kg-video-hide");
                }
            });
        }

        videoElementContainer.onmouseover = () => {
            videoPlayerContainer.classList.remove("kg-video-hide");
        }

        videoElementContainer.onmouseleave = () => {
            const isPlaying = !!(videoEl.currentTime > 0 && !videoEl.paused && !videoEl.ended && videoEl.readyState > 2);
            if (isPlaying) {
                videoPlayerContainer.classList.add("kg-video-hide");
            }
        }

        videoEl.onplay = () => {
            largePlayIcon.classList.add("kg-video-hide");
            videoOverlay.classList.add("kg-video-hide");
            playIconContainer.classList.add("kg-video-hide");
            pauseIconContainer.classList.remove("kg-video-hide");
            videoPlayerContainer.classList.add("kg-video-hide");
        };

        const handleOnPlay = () => {
            largePlayIcon.classList.add("kg-video-hide");
            videoOverlay.classList.add("kg-video-hide");
            playIconContainer.classList.add("kg-video-hide");
            pauseIconContainer.classList.remove("kg-video-hide");
            videoEl.play();
            raf = requestAnimationFrame(whilePlaying);
        }

        const handleOnPause = () => {
            largePlayIcon.classList.remove("kg-video-hide");
            videoOverlay.classList.remove("kg-video-hide");
            pauseIconContainer.classList.add("kg-video-hide");
            playIconContainer.classList.remove("kg-video-hide");
            videoEl.pause();
            cancelAnimationFrame(raf);
        }

        largePlayIcon.addEventListener('click', () => {
            handleOnPlay();
        });

        playIconContainer.addEventListener('click', () => {
            handleOnPlay();
        });

        pauseIconContainer.addEventListener('click', () => {
            handleOnPause();
        });

        muteIconContainer.addEventListener('click', () => {
            muteIconContainer.classList.add("kg-video-hide");
            unmuteIconContainer.classList.remove("kg-video-hide");
            videoEl.muted = false;
        });

        unmuteIconContainer.addEventListener('click', () => {
            unmuteIconContainer.classList.add("kg-video-hide");
            muteIconContainer.classList.remove("kg-video-hide");
            videoEl.muted = true;
        });

        playbackRateContainer.addEventListener('click', () => {
            let nextPlaybackRate = playbackRates[(currentPlaybackRateIdx + 1) % 5];
            currentPlaybackRateIdx = currentPlaybackRateIdx + 1;
            videoEl.playbackRate = nextPlaybackRate.rate;
            playbackRateContainer.textContent = nextPlaybackRate.label;
        });

        videoEl.addEventListener('progress', displayBufferedAmount);

        seekSlider.addEventListener('input', (e) => {
            showRangeProgress(e.target);
            currentTimeContainer.textContent = calculateTime(seekSlider.value);
            if (!videoEl.paused) {
                cancelAnimationFrame(raf);
            }
        });

        seekSlider.addEventListener('change', () => {
            videoEl.currentTime = seekSlider.value;
            if (!videoEl.paused) {
                requestAnimationFrame(whilePlaying);
            }
        });

        volumeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            showRangeProgress(e.target);
            videoEl.volume = value / 100;
        });
    }

    const videoCardElements = document.querySelectorAll('.kg-video-card');

    for (let i = 0; i < videoCardElements.length; i++) {
        handleVideoPlayer(videoCardElements[i]);
    }
})();
