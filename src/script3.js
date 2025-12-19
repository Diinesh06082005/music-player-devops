// --- SCRIPT 3: PLAYER ENGINE, AUDIO API, AND CONTROLS (WITH AI & EQ) ---

function closeEqualizer() {
    const eqPanel = document.getElementById('eq-panel');
    if (eqPanel && eqPanel.classList.contains('active')) {
        eqPanel.classList.remove('active');
        if (dynamicDom.eqBtn) {
            dynamicDom.eqBtn.classList.remove('active');
        }
    }
}

function initMusicPlayerView() {
    dynamicDom.playPauseBtn = document.getElementById('play-pause-btn');
    dynamicDom.prevBtn = document.getElementById('prev-btn');
    dynamicDom.nextBtn = document.getElementById('next-btn');
    dynamicDom.progressBar = document.getElementById('progress-bar');
    dynamicDom.currentTime = document.getElementById('current-time');
    dynamicDom.totalDuration = document.getElementById('total-duration');
    dynamicDom.volumeSlider = document.getElementById('volume-slider');
    dynamicDom.volumeBtn = document.getElementById('volume-btn');
    dynamicDom.shuffleBtn = document.getElementById('shuffle-btn');
    dynamicDom.repeatBtn = document.getElementById('repeat-btn');
    dynamicDom.visualizerCanvas = document.getElementById('visualizer-canvas');
    dynamicDom.playerTrackTitle = document.querySelector('.player-track-info .title');
    dynamicDom.playerTrackArtist = document.querySelector('.player-track-info .artist');
    dynamicDom.playerQueueList = document.getElementById('player-queue-list');

    if (dynamicDom.playerQueueList) {
        dynamicDom.playerQueueList.addEventListener('click', (e) => {
            const trackItem = e.target.closest('.queue-track-item');
            if (trackItem && trackItem.dataset.trackIndex) {
                const newIndex = parseInt(trackItem.dataset.trackIndex, 10);
                if (newIndex !== state.currentIndex && !isNaN(newIndex)) {
                    state.currentIndex = newIndex;
                    playTrack();
                }
            }
        });
    }

    dynamicDom.aiLyricsBtn = document.getElementById('ai-lyrics-btn');
    dynamicDom.aiInsightsBtn = document.getElementById('ai-insights-btn');
    dynamicDom.eqBtn = document.getElementById('eq-btn');
    dynamicDom.eqPanel = document.getElementById('eq-panel');
    dynamicDom.eqLowSlider = document.getElementById('eq-low-slider');
    dynamicDom.eqMidSlider = document.getElementById('eq-mid-slider');
    dynamicDom.eqHighSlider = document.getElementById('eq-high-slider');

    dynamicDom.playPauseBtn.addEventListener('click', () => { if (dom.audioPlayer.src) { state.isPlaying ? dom.audioPlayer.pause() : dom.audioPlayer.play(); } });
    dynamicDom.nextBtn.addEventListener('click', playNext);
    dynamicDom.prevBtn.addEventListener('click', playPrev);
    dynamicDom.progressBar.addEventListener('input', e => { if(dom.audioPlayer.src) dom.audioPlayer.currentTime = e.target.value; });
    dynamicDom.volumeSlider.addEventListener('input', e => { dom.audioPlayer.volume = e.target.value; state.lastVolume = e.target.value > 0 ? e.target.value : state.lastVolume; updateVolumeIcon(); saveState(); });
    dynamicDom.volumeBtn.addEventListener('click', () => { dom.audioPlayer.volume = dom.audioPlayer.volume > 0 ? 0 : state.lastVolume; dynamicDom.volumeSlider.value = dom.audioPlayer.volume; updateVolumeIcon(); });
    dynamicDom.shuffleBtn.addEventListener('click', toggleShuffle);
    dynamicDom.repeatBtn.addEventListener('click', toggleRepeat);
    
    // --- Equalizer UI Logic ---
    dynamicDom.eqBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents clicks from closing it immediately
        dynamicDom.eqPanel.classList.toggle('active');
        dynamicDom.eqBtn.classList.toggle('active');
    });

    const presetsContainer = dynamicDom.eqPanel.querySelector('.eq-presets-container');
    presetsContainer.innerHTML = Object.keys(EQ_PRESETS).map(key => {
        const preset = EQ_PRESETS[key];
        const isActive = state.settings.activeEqPreset === key ? 'active' : '';
        return `<button class="eq-preset-btn ${isActive}" data-preset="${key}"><i class="fas ${preset.icon}"></i> ${preset.name}</button>`;
    }).join('');

    presetsContainer.querySelectorAll('.eq-preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const presetName = e.currentTarget.dataset.preset;
            applyEqualizerPreset(presetName);
        });
    });

    const handleSliderInput = (slider, band) => {
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            state.settings.customEqValues[band] = value;
            if (state.eqFilters[band] && state.audioContext) {
                state.eqFilters[band].gain.setValueAtTime(value, state.audioContext.currentTime);
            }
            // Switch to custom preset when a slider is moved
            applyEqualizerPreset('custom');
        });
    };

    handleSliderInput(dynamicDom.eqLowSlider, 'low');
    handleSliderInput(dynamicDom.eqMidSlider, 'mid');
    handleSliderInput(dynamicDom.eqHighSlider, 'high');
    
    // Close equalizer if clicking outside
    document.body.addEventListener('click', closeEqualizer, true);
    dynamicDom.eqPanel.addEventListener('click', e => e.stopPropagation());
    // --- End Equalizer UI Logic ---


    // AI Button Listeners
    const handleAiAction = (action) => {
        if (state.currentIndex < 0) {
            showToast("Play a song to use AI features.", "info");
            return;
        }
        const track = state.queue[state.currentIndex];
        const title = state.currentTrackMetadata.title || track.name;
        const artist = state.currentTrackMetadata.artist || "Unknown Artist";
        if (action === 'lyrics') {
            showAiContentModal(`Lyrics for ${title}`);
            getSongLyrics(title, artist);
        } else if (action === 'insights') {
            showAiContentModal(`Insights for ${title}`);
            getSongInsights(title, artist);
        }
    };
    dynamicDom.aiLyricsBtn.addEventListener('click', () => handleAiAction('lyrics'));
    dynamicDom.aiInsightsBtn.addEventListener('click', () => handleAiAction('insights'));

    updatePlayPauseIcon();
    updateVolumeIcon();
    dynamicDom.shuffleBtn.classList.toggle('active', state.isShuffle);
    dynamicDom.repeatBtn.className = `btn btn-icon btn-ghost ${state.repeatMode !== 'none' ? 'active' : ''}`; // Updated class
    // We update the icon inside toggleRepeat and also set the aria-pressed state
    toggleRepeat(true); // Call to set initial state without toggling
    toggleShuffle(true); // Call to set initial state without toggling

    // ADDED: Call initUiButtons to ensure new button logic is attached
    initUiButtons(); 
}

// --- WEB AUDIO API & VISUALIZER ---
function setupAudioContext() {
    if (state.audioContext) return;
    try {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        state.sourceNode = state.audioContext.createMediaElementSource(dom.audioPlayer);
        state.analyser = state.audioContext.createAnalyser();
        state.analyser.fftSize = 256;

        // Create Equalizer filters
        state.eqFilters.low = state.audioContext.createBiquadFilter();
        state.eqFilters.low.type = "lowshelf";
        state.eqFilters.low.frequency.value = 320; // For bass frequencies

        state.eqFilters.mid = state.audioContext.createBiquadFilter();
        state.eqFilters.mid.type = "peaking";
        state.eqFilters.mid.frequency.value = 1000; // For mid-range (vocals)
        state.eqFilters.mid.Q.value = 1;

        state.eqFilters.high = state.audioContext.createBiquadFilter();
        state.eqFilters.high.type = "highshelf";
        state.eqFilters.high.frequency.value = 3200; // For treble frequencies

        // Chain all the nodes together
        state.sourceNode
            .connect(state.eqFilters.low)
            .connect(state.eqFilters.mid)
            .connect(state.eqFilters.high)
            .connect(state.analyser)
            .connect(state.audioContext.destination);
        
        // Apply the saved or default preset
        applyEqualizerPreset(state.settings.activeEqPreset);

    } catch (e) {
        console.error("Could not set up Web Audio API:", e);
        showToast("Audio effects disabled.", "error");
        state.settings.musicVisualizer = false;
    }
}

function drawVisualizer() {
    if (!state.isPlaying || !state.analyser || !dynamicDom.visualizerCanvas || !state.settings.musicVisualizer) {
        if (state.animationFrameId) {
             cancelAnimationFrame(state.animationFrameId);
             state.animationFrameId = null;
        }
        return;
    }
    state.animationFrameId = requestAnimationFrame(drawVisualizer);
    const bufferLength = state.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    state.analyser.getByteFrequencyData(dataArray);
    const canvas = dynamicDom.visualizerCanvas;
    const ctx = canvas.getContext('2d');
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;
    const radius = Math.min(WIDTH, HEIGHT) / 3;
    
    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2.5;
        const angle = (i / bufferLength) * 2 * Math.PI;

        const x1 = centerX + radius * Math.cos(angle);
        const y1 = centerY + radius * Math.sin(angle);
        const x2 = centerX + (radius + barHeight) * Math.cos(angle);
        const y2 = centerY + (radius + barHeight) * Math.sin(angle);

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        const hue = (i / bufferLength) * 360;
        gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0)`);
        gradient.addColorStop(0.5, `hsl(${hue}, 100%, 60%)`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

// --- PLAYER CORE LOGIC ---
async function playTrack() {
    if (state.currentIndex < 0 || state.currentIndex >= state.queue.length) return;
    const track = state.queue[state.currentIndex];

    // ADDED: Stop any background YouTube audio
    if (state.ytPlayer && typeof state.ytPlayer.stopVideo === 'function') {
        state.ytPlayer.stopVideo();
        if (state.isYtAudioOnly) {
            // Reset the state since we're stopping the YT audio
            state.isYtAudioOnly = false;
            // We can't update the button text if the view isn't rendered,
            // but we MUST save the state.
            if (typeof saveState === 'function') {
                saveState();
            }
        }
    }

    if (dom.audioPlayer.src && dom.audioPlayer.src.startsWith('blob:')) {
        URL.revokeObjectURL(dom.audioPlayer.src);
    }

    if (track.source === 'drive' || track.source === 'youtube' || track.source === 'jamendo') {
        showToast(`Loading "${track.name.replace(/\.[^/.]+$/, "")}"...`, 'info');
    }

    try {
        let audioUrl;
        let fileObjectForMetadata;
        let metadata = { title: track.name, artist: track.artist || "Unknown Artist", picture: track.thumbnail || null };

        if (track.source === 'local') {
            audioUrl = URL.createObjectURL(track.file);
            fileObjectForMetadata = track.file;
        } else if (track.source === 'drive') {
            if (!state.googleDriveSignedIn || !gapi.client.getToken()) throw new Error('Google Drive disconnected.');
            const accessToken = gapi.client.getToken().access_token;
            const fetchResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${track.id}?alt=media`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (!fetchResponse.ok) throw new Error(`Google Drive fetch failed: ${fetchResponse.statusText}`);
            const blob = await fetchResponse.blob();
            audioUrl = URL.createObjectURL(blob);
            fileObjectForMetadata = new File([blob], track.name, { type: blob.type || 'audio/mpeg' });
        } else if (track.source === 'youtube') {
             const info = await ytdl.getInfo(track.id.replace('yt-', ''));
             const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
             if (!format.url) throw new Error("Could not get streamable URL from YouTube.");
             audioUrl = format.url;
             metadata.title = info.videoDetails.title;
             metadata.artist = info.videoDetails.author.name;
             metadata.picture = info.videoDetails.thumbnails[0].url;
        } else if (track.source === 'jamendo') {
            if (!track.streamUrl) {
                throw new Error("Jamendo track is missing a stream URL.");
            }
            audioUrl = track.streamUrl;
            metadata = { title: track.name, artist: track.artist, picture: track.thumbnail };
            fileObjectForMetadata = null; // No file to parse, metadata is from API
        }
        
        if (fileObjectForMetadata) {
            metadata = await new Promise(resolve => getTrackMetadata(fileObjectForMetadata, resolve));
        }

        state.currentTrackMetadata = metadata;

        if (state.currentView !== 'player') {
            state.currentView = 'player';
            updateActiveNav(state.currentView);
            await renderCurrentView();
        } else {
            updatePlayerUI(track, state.currentTrackMetadata);
        }
        
        setupAudioContext();

        dom.audioPlayer.src = audioUrl;
        await dom.audioPlayer.play();
        addToRecents(track.name);

    } catch (e) { 
        console.error("Playback Error:", e);
        showToast(`Error playing ${track.name}: ${e.message}`, "error");
        setTimeout(playNext, 1000);
    }
}

// --- Equalizer Logic ---
function applyEqualizerPreset(presetName) {
    if (!state.audioContext || !EQ_PRESETS[presetName]) return;

    let values;
    if (presetName === 'custom') {
        values = state.settings.customEqValues;
    } else {
        values = EQ_PRESETS[presetName].values;
    }
    
    const { low, mid, high } = values;

    // Apply gain values to filters
    if (state.audioContext) {
        state.eqFilters.low.gain.setValueAtTime(low, state.audioContext.currentTime);
        state.eqFilters.mid.gain.setValueAtTime(mid, state.audioContext.currentTime);
        state.eqFilters.high.gain.setValueAtTime(high, state.audioContext.currentTime);
    }

    // Also update the manual sliders to reflect the current values
    if (dynamicDom.eqLowSlider) dynamicDom.eqLowSlider.value = low;
    if (dynamicDom.eqMidSlider) dynamicDom.eqMidSlider.value = mid;
    if (dynamicDom.eqHighSlider) dynamicDom.eqHighSlider.value = high;

    // Update state and UI
    state.settings.activeEqPreset = presetName;
    const presetsContainer = dynamicDom.eqPanel.querySelector('.eq-presets-container');
    if (presetsContainer) {
        const currentActive = presetsContainer.querySelector('.eq-preset-btn.active');
        if(currentActive) currentActive.classList.remove('active');
        const newActive = presetsContainer.querySelector(`.eq-preset-btn[data-preset="${presetName}"]`);
        if(newActive) newActive.classList.add('active');
    }
    saveState();
}
// --- End Equalizer Logic ---

async function playNext() {
    if (state.queue.length === 0) return;
    if (state.repeatMode === 'one' && state.isPlaying) {
        dom.audioPlayer.currentTime = 0;
        await dom.audioPlayer.play();
        return;
    }

    let nextIndex = state.currentIndex + 1;
    if (nextIndex >= state.queue.length) {
        if (state.repeatMode === 'all') {
            nextIndex = 0;
        } else {
            state.isPlaying = false;
            updatePlayPauseIcon();
            dom.audioPlayer.src = '';
            if (dom.audioPlayer.src.startsWith('blob:')) URL.revokeObjectURL(dom.audioPlayer.src);
            state.currentIndex = -1;
            return;
        }
    }

    if (state.settings.aiDjEnabled && state.settings.aiFeaturesEnabled && state.currentIndex > -1 && state.queue.length > 1) {
        dom.audioPlayer.pause();
        const currentSong = { title: state.currentTrackMetadata.title, artist: state.currentTrackMetadata.artist };
        const nextTrack = state.queue[nextIndex];
        const nextSong = { title: nextTrack.name.replace(/\.[^/.]+$/, ""), artist: nextTrack.artist || 'Unknown' };

        showToast("AI DJ is preparing the transition...", "info");
        await getAiDjTransition(currentSong, nextSong);
    }
    
    state.currentIndex = nextIndex;
    await playTrack();
}

async function playPrev() {
    if (state.queue.length === 0) return;
    if (dom.audioPlayer.currentTime > 3) {
        dom.audioPlayer.currentTime = 0;
    } else {
        state.currentIndex = (state.currentIndex - 1 + state.queue.length) % state.queue.length;
       await playTrack();
    }
}

function getTrackMetadata(file, callback) { 
    if (!file) {
        callback({ title: "Unknown Track", artist: "Unknown Artist", picture: null });
        return;
    }
   window.jsmediatags.read(file, {
       onSuccess: (tag) => {
           const { tags } = tag;
           let picture = null;
           if (tags.picture) {
               const { data, format } = tags.picture;
               let base64String = "";
               for (let i = 0; i < data.length; i++) { base64String += String.fromCharCode(data[i]); }
               picture = `data:${format};base64,${window.btoa(base64String)}`;
           }
           callback({ title: tags.title || file.name.replace(/\.[^/.]+$/, ""), artist: tags.artist || "Unknown Artist", picture });
       },
       onError: (error) => {
           console.warn('jsmediatags error:', error);
           callback({ title: file.name.replace(/\.[^/.]+$/, ""), artist: "Unknown Artist", picture: null });
       }
   });
}

function updatePlayerUI(track, metadata) { 
    if (dynamicDom.playerTrackTitle) dynamicDom.playerTrackTitle.textContent = metadata.title;
    if (dynamicDom.playerTrackArtist) dynamicDom.playerTrackArtist.textContent = metadata.artist || "Unknown Artist";

    const artworkUrl = metadata.picture || null;
    dom.auraScreenContainer.style.backgroundImage = artworkUrl ? `url(${artworkUrl})` : 'none';
    dom.auraScreenContainer.classList.toggle('player-active', !!artworkUrl);
    
    dom.nowPlayingArtwork.src = artworkUrl || 'https://placehold.co/40x40/2a2a3a/e0e0e0?text=A';
    dom.nowPlayingTitle.textContent = metadata.title;
    dom.nowPlayingArtist.textContent = metadata.artist || "Unknown Artist";

    if (state.currentView === 'player') renderPlayerQueue();
}

function renderPlayerQueue() {
    if (!dynamicDom.playerQueueList) return;
    dynamicDom.playerQueueList.innerHTML = state.queue.map((track, index) => {
        let className = 'queue-track-item';
        if (index < state.currentIndex) className += ' previous';
        if (index === state.currentIndex) className += ' current';
        // Add data-track-index and make it clickable
        return `<li class="${className}" data-track-index="${index}" style="cursor: pointer;" title="Play ${track.name.replace(/\.[^/.]+$/, "")}">
                    ${track.name.replace(/\.[^/.]+$/, "")}
                </li>`;
    }).join('');
    
    const currentItem = dynamicDom.playerQueueList.querySelector('.current');
    if (currentItem) currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
}


function formatTime(s) { return isNaN(s) ? '0:00' : `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}`; }
function updatePlayPauseIcon() { 
    // const icon = state.isPlaying ? 'fa-pause' : 'fa-play'; // Old logic
    // if(dynamicDom.playPauseBtn) dynamicDom.playPauseBtn.innerHTML = `<i class="fas ${icon}"></i>`;
    
    // New logic using animateIconTransition
    if(dynamicDom.playPauseBtn && typeof animateIconTransition === 'function') {
        animateIconTransition(dynamicDom.playPauseBtn, { toPressed: state.isPlaying });
    }
    
    // Still need to update the top-bar icon
    if(dom.nowPlayingPlayPauseBtn) {
        dom.nowPlayingPlayPauseBtn.innerHTML = `<i class="fas ${state.isPlaying ? 'fa-pause' : 'fa-play'}"></i>`;
    }
}
function updateVolumeIcon() { 
    if(!dynamicDom.volumeBtn) return; 
    const v = dom.audioPlayer.volume;
    const i = dynamicDom.volumeBtn.querySelector('i'); 
    const isMuted = v === 0;

    if (isMuted) {
        i.className = 'fas fa-volume-xmark';
    } else if (v < 0.5) {
        i.className = 'fas fa-volume-low';
    } else {
        i.className = 'fas fa-volume-high';
    }
    // Update ARIA state for new button
    dynamicDom.volumeBtn.setAttribute('aria-pressed', isMuted.toString());
    dynamicDom.volumeBtn.title = isMuted ? 'Unmute' : 'Mute';
}
function toggleShuffle(setStateOnly = false) { 
    if (!setStateOnly) {
        state.isShuffle = !state.isShuffle; 
        showToast(`Shuffle is ${state.isShuffle ? 'ON' : 'OFF'}.`, 'info');
        saveState();
    }
    
    if(dynamicDom.shuffleBtn) {
        dynamicDom.shuffleBtn.setAttribute('aria-pressed', state.isShuffle.toString());
        dynamicDom.shuffleBtn.title = state.isShuffle ? 'Shuffle: On' : 'Shuffle: Off';
        dynamicDom.shuffleBtn.classList.toggle('active', state.isShuffle); // Keep visual active state
    }
    
    if (!setStateOnly && state.queue.length > 0) { 
        const currentTrack = state.queue[state.currentIndex]; 
        state.queue = state.isShuffle ? shuffleArray([...state.originalQueue]) : [...state.originalQueue]; 
        state.currentIndex = state.queue.findIndex(t => t.id === currentTrack.id); 
    } 
    
    if(!setStateOnly && state.currentView === 'player') renderPlayerQueue(); 
}
function shuffleArray(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function toggleRepeat(setStateOnly = false) { 
    if (!setStateOnly) {
        const modes = ['none', 'all', 'one']; 
        state.repeatMode = modes[(modes.indexOf(state.repeatMode) + 1) % modes.length]; 
        showToast(`Repeat mode: ${state.repeatMode}.`, 'info'); 
        saveState(); 
    }
    
    if(dynamicDom.repeatBtn) { 
        const icon = dynamicDom.repeatBtn.querySelector('.icon-wrap');
        const isPressed = state.repeatMode !== 'none';
        
        dynamicDom.repeatBtn.setAttribute('aria-pressed', isPressed.toString());
        dynamicDom.repeatBtn.classList.toggle('active', isPressed); // Keep visual active state
        
        if (state.repeatMode === 'one') {
            icon.innerHTML = `<i class="fas fa-1" aria-hidden="true"></i>`; // Using font-awesome 1
            dynamicDom.repeatBtn.title = 'Repeat: One';
        } else {
            icon.innerHTML = `<i class="fas fa-repeat" aria-hidden="true"></i>`;
            dynamicDom.repeatBtn.title = isPressed ? 'Repeat: All' : 'Repeat: Off';
        }
    } 
}


function setQueue(tracks, startIndex) {
    state.originalQueue = [...tracks];
    state.queue = state.isShuffle ? shuffleArray([...tracks]) : [...tracks];
    const startTrack = tracks[startIndex];
    state.currentIndex = state.queue.findIndex(t => t.id === startTrack.id);
}

function handleTrackListClick(e) {
    const trackItem = e.target.closest('.track-item');
    if (!trackItem) return;

    const trackId = trackItem.dataset.trackId;
    const track = state.library.find(t => t.id === trackId);
    if (!track) return;

    const playAction = e.target.closest('.track-info-main');
    const likeAction = e.target.closest('.like-btn');
    const addToPlaylistAction = e.target.closest('.add-to-playlist-btn');
    const deleteAction = e.target.closest('.delete-from-library-btn');
    const uploadAction = e.target.closest('.upload-to-cloud-btn');
    const downloadAction = e.target.closest('.download-from-cloud-btn');

    if (playAction) {
        let tracklistSource;
        if(state.currentTracklistSource.type === 'library') {
            tracklistSource = state.library;
        } else {
            const playlistTrackIds = new Set(state.playlists[state.currentTracklistSource.name].tracks);
            tracklistSource = state.library.filter(t => playlistTrackIds.has(t.id));
        }

        const trackIndex = tracklistSource.findIndex(t => t.id === trackId);
        if (trackIndex > -1) {
            setQueue(tracklistSource, trackIndex);
            playTrack();
        }
    } else if (likeAction) {
        const likedPlaylist = state.playlists['Liked Songs'];
        const isLiked = likedPlaylist.tracks.includes(track.id);
        if (isLiked) {
            likedPlaylist.tracks = likedPlaylist.tracks.filter(id => id !== track.id);
        } else {
            likedPlaylist.tracks.push(track.id);
        }
        likeAction.classList.toggle('active', !isLiked);
        saveState();
    } else if (addToPlaylistAction) {
        openAddToPlaylistModal(track);
    } else if (deleteAction) {
        showConfirmation('Delete From Library', `Are you sure you want to remove "${track.name}"?`, () => {
            state.library = state.library.filter(t => t.id !== track.id);
            Object.values(state.playlists).forEach(p => {
                p.tracks = p.tracks.filter(id => id !== track.id);
            });
            renderTrackList();
            saveState();
            showToast(`Removed "${track.name}" from library`, 'info');
        });
    } else if (uploadAction) {
        uploadTrackToDrive(track);
    } else if (downloadAction) {
        downloadTrackFromCloud(track);
    }
}

// Smooth icon transitions and accessible state toggles
function animateIconTransition(btn, {toPressed=false} = {}){
  const isPressed = toPressed;
  btn.setAttribute('aria-pressed', isPressed ? 'true' : 'false');
  if(btn.id === 'play-pause-btn'){
    btn.setAttribute('aria-label', isPressed ? 'Pause' : 'Play');
    btn.title = isPressed ? 'Pause' : 'Play';
  }
}

function initUiButtons(){
  const playBtn = document.getElementById('play-pause-btn');
  const shuffleBtn = document.getElementById('shuffle-btn');
  const volBtn = document.getElementById('volume-btn');
  const repeatBtn = document.getElementById('repeat-btn'); // Added repeat button

  // The main play/pause logic is already handled by the audio 'play'/'pause' events
  // This listener is a fallback or for manual clicks if the event doesn't fire
  if(playBtn){
    playBtn.addEventListener('click', () => {
      // The state is updated by the audio events, but we can sync the icon here
      // This is mostly handled by the `updatePlayPauseIcon` function now.
      // const pressed = playBtn.getAttribute('aria-pressed') === 'true';
      // animateIconTransition(playBtn, {toPressed: !pressed});
    });
  }

  // The shuffle logic is handled by toggleShuffle()
  if(shuffleBtn){
    shuffleBtn.addEventListener('click', () => {
        // The toggleShuffle() function now handles updating the ARIA state
        // const pressed = shuffleBtn.getAttribute('aria-pressed') === 'true';
        // shuffleBtn.setAttribute('aria-pressed', String(!pressed));
        // shuffleBtn.title = !pressed ? 'Shuffle: On' : 'Shuffle: Off';
    });
  }
  
  // The repeat logic is handled by toggleRepeat()
  if(repeatBtn){
    repeatBtn.addEventListener('click', () => {
        // The toggleRepeat() function now handles updating the ARIA state
    });
  }

  // The volume logic is handled by the main player listener and updateVolumeIcon()
  if(volBtn){
    volBtn.addEventListener('click', () => {
      // The main listener in initMusicPlayerView handles the click
      // const pressed = volBtn.getAttribute('aria-pressed') === 'true';
      // volBtn.setAttribute('aria-pressed', String(!pressed));
      // volBtn.title = !pressed ? 'Unmute' : 'Mute';
    });
  }
}

// Simple theme applier
function applyThemeClass(themeName){
  document.body.classList.remove('aura-default', 'theme-neon-nights', 'theme-forest-calm', 'theme-solar-warm','theme-midnight-rose','theme-ocean-deep');
  document.body.classList.add(themeName);
  // Also update in settings to be persistent (optional, but good)
  state.settings.activeTheme = themeName;
  saveState();
  // Update the theme customizer UI if it's open
  if (state.currentView === 'theme') {
      const container = document.getElementById('theme-selection-container');
      if (container) {
          container.querySelector('.theme-card.active')?.classList.remove('active');
          container.querySelector(`.theme-card[data-theme-id="${themeName}"]`)?.classList.add('active');
      }
  }
}

// Initialize updated UI
document.addEventListener('DOMContentLoaded', () => {
  // initUiButtons(); // This is now called from within initMusicPlayerView() when the player view is rendered
});

// We need to make sure initUiButtons is called when the player is rendered
// Let's modify initMusicPlayerView to call it.
// Going back up to initMusicPlayerView...
// ...
// ... I have modified initMusicPlayerView to call initUiButtons()
// ... I have also modified the `updatePlayPauseIcon`, `updateVolumeIcon`, `toggleShuffle`, and `toggleRepeat` to correctly handle the new ARIA states.