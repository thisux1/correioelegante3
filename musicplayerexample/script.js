const defaults = {
	random: false,
	volume: 0.5,
	music: [
		{
			title: "The Weeknd - Blinding Lights",
			url:
				"https://bato-web-agency.github.io/bato-shared/music/blinding-lights.mp3"
		},
		{
			title: "The Weeknd - Call Out My Name",
			url:
				"https://bato-web-agency.github.io/bato-shared/music/call-out-my-name.mp3"
		},
		{
			title: "The Weeknd - Starboy",
			url: "https://bato-web-agency.github.io/bato-shared/music/starboy.mp3"
		},
		{
			title: "The Weeknd - The Hills",
			url: "https://bato-web-agency.github.io/bato-shared/music/the-hills.mp3"
		},
		{
			title: "The Weeknd - Blinding Lights",
			url:
				"https://bato-web-agency.github.io/bato-shared/music/blinding-lights.mp3"
		},
		{
			title: "The Weeknd - Call Out My Name",
			url:
				"https://bato-web-agency.github.io/bato-shared/music/call-out-my-name.mp3"
		},
		{
			title: "The Weeknd - Starboy",
			url: "https://bato-web-agency.github.io/bato-shared/music/starboy.mp3"
		},
		{
			title: "The Weeknd - The Hills",
			url: "https://bato-web-agency.github.io/bato-shared/music/the-hills.mp3"
		},
		{
			title: "The Weeknd - Blinding Lights",
			url:
				"https://bato-web-agency.github.io/bato-shared/music/blinding-lights.mp3"
		},
		{
			title: "The Weeknd - Call Out My Name",
			url:
				"https://bato-web-agency.github.io/bato-shared/music/call-out-my-name.mp3"
		},
		{
			title: "The Weeknd - Starboy",
			url: "https://bato-web-agency.github.io/bato-shared/music/starboy.mp3"
		},
		{
			title: "The Weeknd - The Hills",
			url: "https://bato-web-agency.github.io/bato-shared/music/the-hills.mp3"
		}
	]
};

class MusicPlayer {
	constructor(config) {
		this.music = config.music || [];
		this.currentIndex = 0;
		this.barsCount = 44;

		this.playerBlock = document.querySelector(".player");
		this.musicList = document.querySelector(".playlist__list");
		this.audio = document.getElementById("audioPlayer");
		this.playlistBth = document.getElementById("musicPlaylist");
		this.settingsBth = document.getElementById("settingsPlayer");
		this.autoplayBtn = document.getElementById("autoplay");
		this.playBtn = document.getElementById("playBtn");
		this.replayBtn = document.getElementById("replayBtn");
		this.barsContainer = document.getElementById("bars");
		this.title = document.getElementById("musicTitle");
		this.artist = document.getElementById("musicArtist");
		this.durationDisplay = document.getElementById("musicDuration");
		this.playIcon = this.playBtn.querySelector(".player__play-icon");
		this.pauseIcon = this.playBtn.querySelector(".player__pause-icon");
		this.nextBtn = document.querySelector(".player__next-btn");
		this.prevBtn = document.querySelector(".player__prev-btn");
		this.closePlaylist = document.querySelector(".playlist__control");
		this.volumeInput = document.getElementById("volumeInput");
		this.randomBtn = document.getElementById("randomBtn");

		this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
		this.gainNode = this.audioContext.createGain();
		this.analyser = this.audioContext.createAnalyser();

		const source = this.audioContext.createMediaElementSource(this.audio);
		source.connect(this.gainNode);
		this.gainNode.connect(this.analyser);
		this.analyser.connect(this.audioContext.destination);

		this.analyser.fftSize = 512;
		this.bufferLength = this.analyser.frequencyBinCount;
		this.dataArray = new Uint8Array(this.bufferLength);

		const initialVolume = config.volume ?? 0.5;

		this.gainNode.gain.value = initialVolume;
		this.audio.volume = initialVolume;

		if (this.volumeInput) {
			this.volumeInput.value = Math.round(this.audio.volume * 100);
			this.volumeInput.style.setProperty("--range", this.volumeInput.value + "%");

			this.setupVolumeControl();
		}

		this.random = config.random;
		this.autoplay = this.autoplayBtn.checked;

		this.createBars();
		this.setupControllers();
		this.playlistControl();
		this.setupPlaylist();
		this.playTrack(0);
		this.isMobile();
	}

	playTrack(index) {
		if (this.music[index]) {
			this.currentIndex = index;

			this.playlistItems?.forEach((el, i) => {
				el.classList.toggle("current", i === index);
			});

			const [artist, title] = this.music[index].title.split(" - ");

			this.audio.src = this.music[index].url;
			this.artist.textContent = artist || "Unknown Artist";
			this.title.textContent = title || "Unknown Name";

			this.updateControlButtons(false);
			this.createBars();
		}
	}

	// Player Actions

	next(isAuto = false) {
		if (isAuto && !this.autoplay) return;

		if (this.random) {
			let nextIndex;
			do {
				nextIndex = Math.floor(Math.random() * this.music.length);
			} while (nextIndex === this.currentIndex && this.music.length > 1);

			this.playTrack(nextIndex);
		} else {
			if (this.currentIndex < this.music.length - 1) {
				this.playTrack(this.currentIndex + 1);
			} else {
				return;
			}
		}

		this.audio.play();
		this.audioContext.resume();
		this.updateControlButtons(true);
	}

	prev() {
		if (this.currentIndex > 0) {
			if (this.autoplay) {
				this.playTrack(this.currentIndex - 1);
				this.audio.play();
				this.audioContext.resume();
				this.updateControlButtons(true);
			} else {
				this.playTrack(this.currentIndex - 1);
				this.updateControlButtons(false);
			}
		}
	}

	updateControlButtons(isPlaying, ended = false) {
		this.prevBtn.classList.toggle("disabled", this.currentIndex < 1);
		this.nextBtn.classList.toggle(
			"disabled",
			this.currentIndex === this.music.length - 1 && !this.random
		);

		if (!this.autoplay && ended) {
			this.replayBtn.classList.remove("hidden");
			this.playBtn.classList.add("hidden");

			return;
		} else {
			this.replayBtn.classList.add("hidden");
			this.playBtn.classList.remove("hidden");
		}

		if (isPlaying) {
			this.playIcon.classList.add("hidden");
			this.pauseIcon.classList.remove("hidden");
		} else {
			this.playIcon.classList.remove("hidden");
			this.pauseIcon.classList.add("hidden");
		}
	}

	// Audio Wave

	createBars() {
		this.barsContainer.innerHTML = "";

		for (let i = 0; i < this.barsCount; i++) {
			const bar = document.createElement("div");

			bar.classList.add("player__bar");
			this.barsContainer.appendChild(bar);
		}
	}

	updateBars() {
		this.analyser.getByteFrequencyData(this.dataArray);

		const bars = [...document.querySelectorAll(".player__bar")];
		const step = Math.floor(this.bufferLength / this.barsCount);

		bars.forEach((bar, index) => {
			let sum = 0;
			for (let i = 0; i < step; i++) {
				sum += this.dataArray[index * step + i];
			}

			const average = sum / step;
			const fillHeight = average / 2;

			bar.style.height = `${fillHeight}%`;

			const barDuration = this.audio.duration / this.barsCount;
			const currentIndex = Math.floor(this.audio.currentTime / barDuration);

			if (index <= currentIndex) {
				bar.classList.add("color");
			} else {
				bar.classList.remove("color");
			}
		});
	}

	// Playlist

	setupPlaylist() {
		this.playlistItems = [];

		for (let i = 0; i < this.music.length; i++) {
			const [artist, title] = this.music[i].title.split(" - ");
			const newMusicItem = document.createElement("div");

			newMusicItem.tabIndex = 0;
			newMusicItem.classList.add("playlist__item");

			if (i === 0) newMusicItem.classList.add("current");
			newMusicItem.setAttribute("data-song-id", i);

			newMusicItem.innerHTML = `
                <span class="playlist__song">${artist} - <span class="playlist__song-name">${title}</span></span>
                <p class="playlist__duration">00:00</p>
            `;

			this.musicList.appendChild(newMusicItem);
			this.playlistItems.push(newMusicItem);

			const durationElement = newMusicItem.querySelector(".playlist__duration");
			const audio = document.createElement("audio");

			audio.src = this.music[i].url;

			audio.addEventListener("loadedmetadata", () => {
				const duration = audio.duration;
				const mins = Math.floor(duration / 60)
					.toString()
					.padStart(2, "0");
				const secs = Math.floor(duration % 60)
					.toString()
					.padStart(2, "0");

				durationElement.textContent = `${mins}:${secs}`;
			});

			newMusicItem.addEventListener("click", () => {
				this.playlistItems.forEach((el) => el.classList.remove("current"));
				newMusicItem.classList.add("current");
				this.playTrack(i);

				if (this.autoplay) {
					this.audio.play();
					this.audioContext.resume();
					this.updateControlButtons(true);
				} else {
					this.updateControlButtons(false);
				}
			});
		}
	}

	playlistControl() {
		this.playlistBth.addEventListener("click", () => {
			this.playerBlock.classList.toggle("open-playlist");
			this.playlistBth.classList.toggle("active");
		});

		this.closePlaylist.addEventListener("click", () => {
			this.playerBlock.classList.remove("open-playlist");
			this.playlistBth.classList.remove("active");
		});
	}

	// Player Controllers

	setupControllers() {
		// Audio Controllers

		this.audio.addEventListener("ended", () => {
			this.updateControlButtons(false, true);
			this.next(true);
		});

		this.audio.addEventListener("timeupdate", () => {
			if (this.audio.duration && !isNaN(this.audio.duration)) {
				const remainingTime = this.audio.duration - this.audio.currentTime;
				const mins = Math.floor(remainingTime / 60)
					.toString()
					.padStart(2, "0");
				const secs = Math.floor(remainingTime % 60)
					.toString()
					.padStart(2, "0");

				this.durationDisplay.textContent = `${mins}:${secs}`;
			} else {
				this.durationDisplay.textContent = "00:00";
			}
		});

		this.audio.addEventListener("loadedmetadata", () => {
			if (this.audio.duration && !isNaN(this.audio.duration)) {
				const mins = Math.floor(this.audio.duration / 60)
					.toString()
					.padStart(2, "0");
				const secs = Math.floor(this.audio.duration % 60)
					.toString()
					.padStart(2, "0");

				this.durationDisplay.textContent = `${mins}:${secs}`;
			} else {
				this.durationDisplay.textContent = "00:00";
			}
		});

		this.audio.addEventListener("play", () => {
			const update = () => {
				this.updateBars();

				if (!this.audio.paused) {
					requestAnimationFrame(update);
				}
			};

			update();
		});

		// Control Buttons

		this.playBtn.addEventListener("click", () => {
			if (this.audio.paused) {
				this.audio.play();
				this.audioContext.resume();
				this.updateControlButtons(true);
			} else {
				this.audio.pause();
				this.updateControlButtons(false);
			}
		});

		this.nextBtn.addEventListener("click", () => {
			this.next(false);
		});

		this.prevBtn.addEventListener("click", () => {
			this.prev();
		});

		this.replayBtn.addEventListener("click", () => {
			this.audio.currentTime = 0;
			this.audio.play();
			this.audioContext.resume();
			this.updateControlButtons(true);
		});

		this.randomBtn.addEventListener("click", () => {
			this.randomBtn.classList.toggle("active");

			this.random = !this.random;
		});

		// Audio Wave Controller

		this.barsContainer.addEventListener("click", (event) => {
			const rect = this.barsContainer.getBoundingClientRect();
			const clickX = event.clientX - rect.left;

			const barWidth = rect.width / this.barsCount;
			const index = Math.min(
				this.barsCount - 1,
				Math.max(0, Math.floor(clickX / barWidth))
			);

			const timePerBar = this.audio.duration / this.barsCount;
			const newTime = index * timePerBar;

			this.audio.currentTime = newTime;

			if (this.audio.paused) {
				const bars = [...document.querySelectorAll(".player__bar")];

				bars.forEach((bar, i) => {
					if (i <= index) {
						bar.classList.add("color");
					} else {
						bar.classList.remove("color");
					}
				});
			} else {
				this.updateBars();
			}
		});

		// Settings Controllers

		this.settingsBth.addEventListener("click", () => {
			this.settingsBth.classList.toggle("active");
		});

		this.autoplayBtn.addEventListener("change", () => {
			this.autoplay = this.autoplayBtn.checked;
		});
	}

	setupVolumeControl() {
		const volumeMute = document.querySelector(".player__volume-mute");
		const volumeHigh = document.querySelector(".player__volume-high");
		const volumeDefault = document.querySelector(".player__volume-default");

		const updateVolumeUI = (val) => {
			const volume = val / 100;

			this.audio.volume = volume;
			this.gainNode.gain.value = volume;
			this.volumeInput.style.setProperty("--range", val + "%");

			if (val <= 0) {
				volumeDefault.classList.add("hidden");
				volumeHigh.classList.add("hidden");
				volumeMute.classList.remove("hidden");
			} else if (val >= 60) {
				volumeDefault.classList.add("hidden");
				volumeMute.classList.add("hidden");
				volumeHigh.classList.remove("hidden");
			} else {
				volumeMute.classList.add("hidden");
				volumeHigh.classList.add("hidden");
				volumeDefault.classList.remove("hidden");
			}
		};

		let isDragging = false;

		const moveHandler = (clientX) => {
			const rect = this.volumeInput.getBoundingClientRect();

			let percent = ((clientX - rect.left) / rect.width) * 100;
			percent = Math.max(0, Math.min(100, percent));

			this.volumeInput.value = percent;

			updateVolumeUI(percent);
		};

		this.volumeInput.addEventListener("touchstart", (e) => {
			isDragging = true;

			moveHandler(e.touches[0].clientX);

			e.preventDefault();
		});

		this.volumeInput.addEventListener("touchmove", (e) => {
			if (!isDragging) return;

			moveHandler(e.touches[0].clientX);
			e.preventDefault();
		});

		this.volumeInput.addEventListener("touchend", () => (isDragging = false));
		this.volumeInput.addEventListener("touchend", () => (isDragging = false));
		this.volumeInput.addEventListener("click", (e) => moveHandler(e.clientX));
		this.volumeInput.addEventListener("input", (e) =>
			updateVolumeUI(e.target.value)
		);
	}

	isMobile() {
		const updateBarsCount = () => {
			this.barsCount = window.innerWidth < 620 ? 25 : 50;

			this.createBars();
		};

		updateBarsCount();

		window.addEventListener("resize", () => {
			updateBarsCount();
		});
	}
}

document.addEventListener("DOMContentLoaded", () => {
	new MusicPlayer(defaults);
});
