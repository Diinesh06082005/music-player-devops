// --- SCRIPT 1: CORE, STATE, AND INITIALIZATION (WITH AI & EQ STATE) ---

// Global state for the entire application
const state = {
    library: [],
    playlists: {},
    recents: [],
    ytHistory: [],
    userName: 'Aura User',
    userProfilePic: '',
    currentView: 'home',
    currentTracklistSource: { type: 'library', name: 'Library' },
    queue: [],
    originalQueue: [],
    currentIndex: -1,
    isPlaying: false,
    isShuffle: false,
    repeatMode: 'none',
    lastVolume: 1,
    currentTrackMetadata: { title: null, artist: null, picture: null },
    appStartTime: Date.now(),
    showClock: false, // Toggle for showing real time vs session time
    settings: {
        titleGlow: true,
        dynamicIsland: true,
        showMessages: true,
        visualEffects: true,
        musicVisualizer: true,
        aiDjEnabled: false,
        aiFeaturesEnabled: true, // Main toggle for all AI functionality
        activeTheme: 'aura-default',
        activeEqPreset: 'flat',
        customEqValues: { low: 0, mid: 0, high: 0 },

        // --- NEW THEME & APPEARANCE SETTINGS ---
        playerSkin: 'skin-default', // default, neon, retro, minimal
        controlStyle: 'standard', // standard, dial
        fontStyle: 'font-inter', // font-inter, font-mono, font-serif

        // Custom Theme Engine
        customPrimaryColor: '#00c6ff',
        customSecondaryColor: '#0072ff',
        useCustomTheme: false,

        // Appearance Details
        animationSpeed: 1,
        colorIntensity: 100,
        customBackground: '',
        backgroundBlur: 5,
    },
    googleApiReady: false,
    googleDriveSignedIn: false,
    googleAuthToken: null,
    googleUserName: '',
    googleUserEmail: '',
    googleUserPicture: '',
    audioContext: null,
    sourceNode: null,
    analyser: null,
    eqFilters: { low: null, mid: null, high: null },
    animationFrameId: null,
    ytPlayer: null,
    currentYtInfo: { id: null, title: null, author: null },
    isYtAudioOnly: false,
    // API Keys
    geminiApiKeys: [
        'AIzaSyD2SJZXFEdGmUihQC_NZoUiT5-RG5NWABQ'
    ],
    jamendoClientId: 'f8772234',
    currentApiKeyIndex: 0,
    chatHistory: [],
    isAiPlaylistMode: false,
};

// --- Equalizer Presets Definition ---
const EQ_PRESETS = {
    flat: { name: 'Flat', icon: 'fa-minus', values: { low: 0, mid: 0, high: 0 } },
    bassBoost: { name: 'Bass Boost', icon: 'fa-drum', values: { low: 6, mid: -2, high: -2 } },
    vocalBoost: { name: 'Vocal Boost', icon: 'fa-microphone-lines', values: { low: -2, mid: 5, high: 0 } },
    trebleBoost: { name: 'Treble Boost', icon: 'fa-guitar', values: { low: -2, mid: -2, high: 6 } },
    custom: { name: 'Custom', icon: 'fa-sliders', values: {} }
};

// --- Main DOM element references ---
const dom = {
    loadingOverlay: document.getElementById('loading-overlay'),
    toastContainer: document.getElementById('toast-container'),
    auraScreenContainer: document.querySelector('.aura-screen-container'),
    viewContent: document.getElementById('view-content'),
    navItems: document.querySelectorAll('.sidebar .nav-item'),
    appTime: document.getElementById('app-time'),
    appTitle: document.getElementById('app-title'),
    audioPlayer: document.getElementById('audio-player'),
    recentsList: document.getElementById('recents-list'),
    playlistsList: document.getElementById('playlists-list'),
    topBar: document.querySelector('.top-bar'),
    topBarDefault: document.getElementById('top-bar-default'),
    topBarNowPlaying: document.getElementById('top-bar-now-playing'),
    nowPlayingArtwork: document.getElementById('now-playing-artwork'),
    nowPlayingTitle: document.getElementById('now-playing-title'),
    nowPlayingArtist: document.getElementById('now-playing-artist'),
    nowPlayingPlayPauseBtn: document.getElementById('now-playing-play-pause-btn'),
    aiReadyToggle: document.getElementById('ai-ready-toggle'),
    customBg: document.getElementById('custom-bg'),
    headerActions: document.querySelector('.header-actions'),
};

// --- Dynamic DOM element references ---
let dynamicDom = {};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    attachGlobalEventListeners();
    loadInitialData();
});

function loadInitialData() {
    applyPerformanceMode();
    // Apply Skin and Fonts
    applySkin(state.settings.playerSkin);
    applyFontStyle(state.settings.fontStyle);

    // Apply Theme (Custom or Preset)
    if (state.settings.useCustomTheme) {
        applyCustomThemeColors(state.settings.customPrimaryColor, state.settings.customSecondaryColor);
    } else {
        applyTheme(state.settings.activeTheme);
    }

    applyThemeCustomizations();
    renderCurrentView();
    renderRecents();
    renderPlaylists();
    dom.appTitle.classList.toggle('title-glow', state.settings.titleGlow);
    updateAiReadyToggleUI();

    if (dom.loadingOverlay) {
        dom.loadingOverlay.classList.add('hidden');
    }

    setInterval(() => {
        if (!dom.appTime) return;
        if (state.showClock) {
            const now = new Date();
            dom.appTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            const elapsed = Math.floor((Date.now() - state.appStartTime) / 1000);
            const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const s = (elapsed % 60).toString().padStart(2, '0');
            dom.appTime.textContent = `${m}:${s}`;
        }
    }, 1000);
}

function attachGlobalEventListeners() {
    dom.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const newView = item.dataset.view;
            if (newView === 'home') {
                state.currentTracklistSource = { type: 'library', name: 'Library' };
            }
            if (newView !== state.currentView || newView === 'home') {
                state.currentView = newView;
                renderCurrentView();
            }
        });
    });

    if (dom.appTime) {
        dom.appTime.parentElement.addEventListener('click', () => {
            state.showClock = !state.showClock;
            showToast(state.showClock ? 'Switched to Real Time' : 'Switched to Session Timer', 'info');
        });
        dom.appTime.parentElement.style.cursor = 'pointer';
    }

    dom.aiReadyToggle.addEventListener('click', () => {
        state.settings.aiFeaturesEnabled = !state.settings.aiFeaturesEnabled;
        const isEnabled = state.settings.aiFeaturesEnabled;
        showToast(`AI Features ${isEnabled ? 'Enabled!' : 'Disabled.'}`, isEnabled ? 'success' : 'info');
        updateAiReadyToggleUI();
        saveState();
    });

    dom.audioPlayer.addEventListener('play', () => {
        state.isPlaying = true;
        updatePlayPauseIcon();
        updatePlayingTrackUI();
        if (state.currentView === 'player' && state.settings.musicVisualizer && !state.animationFrameId) {
            drawVisualizer(); // Defined in script3.js
        }
    });
    dom.audioPlayer.addEventListener('pause', () => {
        state.isPlaying = false;
        updatePlayPauseIcon();
        updatePlayingTrackUI();
        if (state.animationFrameId) {
            cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
        }
    });
    dom.audioPlayer.addEventListener('ended', playNext); // Defined in script3.js

    dom.audioPlayer.addEventListener('timeupdate', () => {
        // Standard ProgressBar update
        if (dynamicDom.progressBar && !isNaN(dom.audioPlayer.currentTime)) {
            dynamicDom.progressBar.value = dom.audioPlayer.currentTime;
            if (dynamicDom.currentTime) dynamicDom.currentTime.textContent = formatTime(dom.audioPlayer.currentTime);
        }

        // --- ROTARY DIAL UPDATE (Advanced) ---
        if (dynamicDom.dialProgressPath && !isNaN(dom.audioPlayer.duration)) {
            const percent = dom.audioPlayer.currentTime / dom.audioPlayer.duration;
            const circumference = 2 * Math.PI * 45; // radius 45
            const dashoffset = circumference * (1 - percent);
            dynamicDom.dialProgressPath.style.strokeDashoffset = dashoffset;

            if (dynamicDom.dialTimeDisplay) {
                dynamicDom.dialTimeDisplay.textContent = formatTime(dom.audioPlayer.currentTime);
            }
        }

        // Top bar animation
        if (dom.headerActions && dom.audioPlayer.duration > 0) {
            const percent = (dom.audioPlayer.currentTime / dom.audioPlayer.duration) * 100;
            dom.headerActions.style.setProperty('--progress-width', `${percent}%`);
        }
    });

    dom.audioPlayer.addEventListener('loadedmetadata', () => {
        if (dynamicDom.progressBar && !isNaN(dom.audioPlayer.duration)) {
            dynamicDom.progressBar.max = dom.audioPlayer.duration;
        }
        if (dynamicDom.totalDuration) dynamicDom.totalDuration.textContent = formatTime(dom.audioPlayer.duration);
    });

    dom.nowPlayingPlayPauseBtn.addEventListener('click', () => {
        if (dom.audioPlayer.src) {
            dom.audioPlayer.paused ? dom.audioPlayer.play() : dom.audioPlayer.pause();
        }
    });
    document.getElementById('now-playing-info').addEventListener('click', () => {
        if (state.currentView !== 'player' && (state.currentIndex > -1 || dom.audioPlayer.src)) {
            state.currentView = 'player';
            renderCurrentView();
        }
    });

    // Drag and Drop
    const container = dom.auraScreenContainer;
    container.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); container.classList.add('dragover'); });
    container.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); container.classList.remove('dragover'); });
    container.addEventListener('drop', (e) => {
        e.preventDefault(); e.stopPropagation(); container.classList.remove('dragover');
        if (state.currentView !== 'home') {
            state.currentView = 'home';
            renderCurrentView().then(() => handleFiles(e.dataTransfer.files));
        } else {
            handleFiles(e.dataTransfer.files);
        }
    });
}

function handleFiles(files) {
    const newFiles = Array.from(files).filter(f => f.type.startsWith('audio/') && !state.library.some(t => t.name === f.name));
    if (newFiles.length > 0) {
        state.library.push(...newFiles.map(f => ({
            name: f.name,
            file: f,
            source: 'local',
            artist: 'Local File',
            id: `local-${f.name}-${f.lastModified}`
        })));
        state.currentTracklistSource = { type: 'library', name: 'Library' };
        renderTrackList();
        saveState();
        showToast(`${newFiles.length} new song(s) added!`, 'success');
    }
}

function saveState() {
    try {
        const stateToSave = {
            playlists: state.playlists,
            recents: state.recents,
            ytHistory: state.ytHistory,
            settings: state.settings,
            lastVolume: state.lastVolume,
            userName: state.userName,
            userProfilePic: state.userProfilePic,
            googleAuthToken: state.googleAuthToken,
            isYtAudioOnly: state.isYtAudioOnly,
        };
        localStorage.setItem('auraPlayerData', JSON.stringify(stateToSave));

        if (state.googleDriveSignedIn && typeof saveStateToDrive === 'function') {
            saveStateToDrive();
        }
    } catch (error) {
        console.error("Failed to save state:", error);
    }
}

function loadState() {
    const savedData = localStorage.getItem('auraPlayerData');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            // Merging settings carefully to preserve new defaults
            state.settings = { ...state.settings, ...parsedData.settings };

            // Backward compatibility checks
            if (!state.settings.playerSkin) state.settings.playerSkin = 'skin-default';
            if (!state.settings.controlStyle) state.settings.controlStyle = 'standard';
            if (!state.settings.fontStyle) state.settings.fontStyle = 'font-inter';

            state.lastVolume = parsedData.lastVolume || 1;
            state.userName = parsedData.userName || 'Aura User';
            state.userProfilePic = parsedData.userProfilePic || '';
            state.googleAuthToken = parsedData.googleAuthToken || null;
            state.isYtAudioOnly = parsedData.isYtAudioOnly || false;
            dom.audioPlayer.volume = state.lastVolume;

            state.playlists = parsedData.playlists || {};
            state.recents = parsedData.recents || [];
            state.ytHistory = parsedData.ytHistory || [];
        } catch (error) {
            console.error("Failed to load state:", error);
        }
    }
    if (!state.playlists['Liked Songs']) {
        state.playlists['Liked Songs'] = { name: 'Liked Songs', tracks: [] };
    }
}

function addToRecents(trackName) {
    state.recents = state.recents.filter(t => t !== trackName);
    state.recents.unshift(trackName);
    if (state.recents.length > 20) state.recents.pop();
    saveState();
    renderRecents();
}

// --- UI HELPER FUNCTIONS ---

function applyPerformanceMode() {
    document.body.classList.toggle('performance-mode', !state.settings.visualEffects);
}

function updateAiReadyToggleUI() {
    if (!dom.aiReadyToggle) return;
    const isEnabled = state.settings.aiFeaturesEnabled;
    dom.aiReadyToggle.innerHTML = isEnabled
        ? '<i class="fas fa-wand-magic-sparkles"></i> AI Ready'
        : '<i class="fas fa-robot"></i> AI Off';
    dom.aiReadyToggle.classList.toggle('ai-ready-glow', isEnabled);
}

function applyThemeCustomizations() {
    if (!dom.customBg) return;
    const root = document.documentElement;
    root.style.setProperty('--animation-speed-multiplier', state.settings.animationSpeed);
    root.style.setProperty('--color-intensity', `${state.settings.colorIntensity}%`);

    if (state.settings.customBackground) {
        dom.customBg.style.backgroundImage = `url(${state.settings.customBackground})`;
        dom.customBg.style.filter = `blur(${state.settings.backgroundBlur}px)`;
        dom.customBg.style.opacity = 1;
    } else {
        dom.customBg.style.opacity = 0;
    }
}

// --- ADVANCED THEME LOGIC ---

function applySkin(skinName) {
    document.body.classList.remove('skin-default', 'skin-neon', 'skin-minimal', 'skin-retro');
    document.body.classList.add(skinName);
    state.settings.playerSkin = skinName;
}

function applyFontStyle(fontClass) {
    document.body.classList.remove('font-inter', 'font-mono', 'font-serif');
    document.body.classList.add(fontClass);
    state.settings.fontStyle = fontClass;
}

function applyCustomThemeColors(primary, secondary) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primary);
    root.style.setProperty('--secondary-color', secondary);

    // Auto-calculate complementary glass borders
    const pColor = hexToRgb(primary);
    if (pColor) {
        root.style.setProperty('--glass-border', `rgba(${pColor.r}, ${pColor.g}, ${pColor.b}, 0.3)`);
    }

    // Unset preset themes
    document.body.classList.remove('aura-default', 'theme-neon-nights', 'theme-forest-calm', 'theme-solar-warm', 'theme-midnight-rose', 'theme-ocean-deep');
    document.body.classList.add('theme-custom');
}

function generateSmartPalette(baseColorHex) {
    // Simple algorithm to generate a secondary color from primary
    const rgb = hexToRgb(baseColorHex);
    if (!rgb) return { primary: baseColorHex, secondary: '#ffffff' };

    // Complementary logic: invert colors roughly or shift hue
    // Let's shift hue by 180 degrees for complementary, or 30 for analogous
    // We will just do a simple shift for "Aura" style (Cyan/Blue typically)

    // Mock calculation for simplicity in this context without a huge library
    // We'll just make the secondary color a lighter/shifted version

    return {
        primary: baseColorHex,
        secondary: adjustColorBrightness(baseColorHex, 40) // Make it lighter
    };
}

// Helper to convert hex to rgb
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function adjustColorBrightness(hex, percent) {
    var num = parseInt(hex.replace("#", ""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        B = (num >> 8 & 0x00FF) + amt,
        G = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
}

// Required for script3.js (functions need to be available globally or passed)
window.formatTime = (s) => isNaN(s) ? '0:00' : `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
window.updatePlayPauseIcon = () => { }; // Placeholder, overwritten in script3
window.updatePlayingTrackUI = () => { }; // Placeholder
window.playNext = () => { }; // Placeholder
window.drawVisualizer = () => { }; // Placeholder