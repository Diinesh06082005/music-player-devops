// ---  commit 5 SCRIPT 2: UI, VIEW MANAGEMENT, AND TEMPLATES (WITH AI & EQ VIEWS) ---

// --- VIEW TEMPLATES ---
function getTemplateForView(view) {
    const templates = {
        home: `
            <div class="home-cards-container">
                <div class="home-card" id="liked-songs-card">
                    <div class="icon"><i class="fas fa-heart"></i></div>
                    <div class="text"><h3>Liked Songs</h3><p>Your favorite tracks</p></div>
                </div>
                <div class="home-card" id="create-playlist-card">
                    <div class="icon"><i class="fas fa-plus"></i></div>
                    <div class="text"><h3>Create Playlist</h3><p>Organize your music</p></div>
                </div>
            </div>
            <header class="dashboard-header">
                <h2 id="view-title">Library</h2>
                <div class="header-actions">
                    <div class="search-container">
                        <input type="text" id="search-input" placeholder="Search library...">
                        <button id="search-btn" title="Search"><i class="fas fa-search"></i></button>
                    </div>
                    <button id="ai-playlist-btn" class="action-button secondary"><i class="fas fa-wand-magic-sparkles"></i> AI Playlist</button>
                    <button id="add-music-btn" class="action-button"><i class="fas fa-plus"></i> Add Music</button>
                </div>
                <input type="file" id="file-input" multiple accept="audio/*" hidden>
            </header>
            <ul id="track-list"></ul>`,
        'Video': `
            <div class="yt-view-container">
                <div class="yt-main-content">
                    
                    <div class="yt-tabs">
                        <button class="yt-tab-btn active" data-tab="link">Paste Link</button>
                        <button class="yt-tab-btn" data-tab="search">Search YouTube (API)</button>
                    </div>

                    <div id="yt-link-tab" class="yt-tab-content active" style="display:flex;">
                        <div class="yt-input-container">
                            <input type="text" id="yt-url-input" placeholder="Paste a YouTube video link here...">
                            <button id="yt-load-btn" class="action-button">Load Video</button>
                        </div>
                    </div>

                    <div id="yt-search-tab" class="yt-tab-content" style="display:none; flex-direction: column; gap: 1rem;">
                        <div class="yt-input-container">
                            <input type="text" id="yt-search-input" placeholder="Search for music or artists on YouTube...">
                            <button id="yt-search-api-btn" class="action-button"><i class="fas fa-search"></i> Search</button>
                        </div>
                        <ul id="yt-search-results" class="yt-search-results-list">
                            <div class="empty-state"><i class="fab fa-youtube"></i><p>Search for videos to get started.</p></div>
                        </ul>
                    </div>
                    
                    <div class="yt-player-wrapper">
                        <div id="yt-player-container"></div>
                        <div class="yt-placeholder" id="yt-placeholder">
                            <i class="fab fa-youtube"></i>
                            <p>Video player will appear here</p>
                        </div>
                    </div>
                    <div class="yt-info-and-controls" id="yt-info-and-controls" style="display: none;">
                         <div class="yt-video-info">
                            <h3 id="yt-video-title">Video Title</h3>
                            <p id="yt-video-author">Author</p>
                         </div>
                         <div class="yt-actions-container">
                            <button class="action-button" id="yt-add-to-library-btn"><i class="fas fa-plus"></i> Add to Library & Play</button>
                            <button class="action-button secondary" id="yt-download-btn"><i class="fas fa-download"></i> Download MP3</button>
                         </div>
                         <p class="yt-server-note">Downloads are processed directly in your browser and may take a moment to start.</p>
                    </div>
                </div>
                <div class="yt-history-sidebar">
                    <h3>History</h3>
                    <ul id="yt-history-list"></ul>
                </div>
            </div>`,
        'jamendo': `
            <header class="dashboard-header"><h2>Search Jamendo</h2></header>
            <div class="jamendo-view-container">
                <div class="jamendo-search-container">
                    <input type="text" id="jamendo-search-input" placeholder="Search for artists, albums, or tracks on Jamendo...">
                    <button id="jamendo-search-btn" class="action-button"><i class="fas fa-search"></i> Search</button>
                </div>
                <p class="jamendo-note">Streaming from Jamendo requires a Client ID to be set in script1.js. Music provided is for personal use under Creative Commons licenses.</p>
                <ul id="jamendo-results-list">
                    <div class="empty-state"><i class="fas fa-search"></i><p>Search for music to get started.</p></div>
                </ul>
            </div>
        `,
        'ai-assistant': `
             <header class="dashboard-header"><h2>AI Assistant</h2></header>
             <div class="ai-assistant-container">
                <div id="chat-messages">
                    <div class="chat-message assistant">
                        <div class="avatar"><i class="fas fa-robot"></i></div>
                        <div class="content">
                           Hello! I'm Aura's AI assistant. Ask me to create a playlist, find music, or tell you about a song.
                        </div>
                    </div>
                </div>
                <div id="chat-input-container">
                    <input type="text" id="ai-chat-input" placeholder="Message Aura AI...">
                    <button id="ai-chat-send-btn" class="action-button"><i class="fas fa-paper-plane"></i></button>
                </div>
             </div>
            `,
        controls: `
            <header class="dashboard-header"><h2>Controls & Settings</h2></header>
            <div class="controls-container">
                <h3 class="settings-section-title">General</h3>
                <div class="setting-row">
                    <span>Dynamic Island Notifications</span>
                    <label class="toggle-switch"><input type="checkbox" id="toggle-dynamic-island"><span class="slider"></span></label>
                </div>
                <div class="setting-row">
                    <span>Enable All Messages</span>
                    <label class="toggle-switch"><input type="checkbox" id="toggle-messages"><span class="slider"></span></label>
                </div>
                <h3 class="settings-section-title">AI Features</h3>
                 <div class="setting-row">
                    <span>Enable AI DJ Transitions</span>
                    <label class="toggle-switch"><input type="checkbox" id="toggle-ai-dj"><span class="slider"></span></label>
                    <small>Let the AI announce the next track like a radio DJ. Requires an internet connection.</small>
                </div>
                <h3 class="settings-section-title">Performance & Appearance</h3>
                <div class="setting-row">
                    <span>App Title Glow Effect</span>
                    <label class="toggle-switch"><input type="checkbox" id="toggle-title-glow"><span class="slider"></span></label>
                </div>
                <div class="setting-row">
                    <span>Music Visualizer</span>
                    <label class="toggle-switch"><input type="checkbox" id="toggle-music-visualizer"><span class="slider"></span></label>
                    <small>The animated frequency bars in the player. Disabling can improve performance while playing music.</small>
                </div>
                <div class="setting-row">
                    <span>Advanced Visual Effects</span>
                    <label class="toggle-switch"><input type="checkbox" id="toggle-visual-effects"><span class="slider"></span></label>
                    <small>Disables background blur and other intensive effects for maximum speed.</small>
                </div>
            </div>`,
        theme: `
            <header class="dashboard-header"><h2>Theme Customizer</h2></header>
            <div class="theme-customizer-container">
                <div class="theme-section">
                    <h3>Base Theme</h3>
                    <div id="theme-selection-container" class="theme-selection-container"></div>
                </div>
                <div class="theme-section">
                    <h3>Appearance</h3>
                    <div class="custom-slider-container">
                        <label for="anim-speed-slider">Animation Speed</label>
                        <input type="range" id="anim-speed-slider" min="0.5" max="1.5" step="0.1" value="1">
                        <span id="anim-speed-value">1.0s</span>
                    </div>
                    <div class="custom-slider-container">
                        <label for="color-intensity-slider">Color Intensity</label>
                        <input type="range" id="color-intensity-slider" min="50" max="150" step="1" value="100">
                        <span id="color-intensity-value">100%</span>
                    </div>
                </div>
                <div class="theme-section">
                     <h3>Custom Background</h3>
                     <div class="background-controls">
                        <input type="file" id="bg-upload-input" hidden accept="image/*">
                        <button id="upload-bg-btn" class="action-button"><i class="fas fa-upload"></i> Upload Image</button>
                        <button id="clear-bg-btn" class="action-button secondary"><i class="fas fa-trash"></i> Clear</button>
                     </div>
                     <div class="custom-slider-container">
                        <label for="bg-blur-slider">Background Blur</label>
                        <input type="range" id="bg-blur-slider" min="0" max="20" step="1" value="5">
                        <span id="bg-blur-value">5px</span>
                    </div>
                </div>
            </div>
            `,
        account: `
            <header class="dashboard-header"><h2>My Account</h2></header>
            <div class="account-view-container">
                <div class="account-profile-card">
                    <div class="profile-pic-container">
                        <img id="profile-pic-img" src="https://placehold.co/100x100/2a2a3a/e0e0e0?text=A" alt="Profile Picture">
                        <input type="file" id="profile-pic-upload" hidden accept="image/*">
                        <label for="profile-pic-upload" class="edit-pic-btn" title="Change profile picture"><i class="fas fa-camera"></i></label>
                    </div>
                    <div class="profile-details">
                         <input type="text" id="account-name" placeholder="Your Name">
                         <input type="email" id="account-email" placeholder="Your Email (Optional)" readonly>
                         <button id="save-profile-btn" class="action-button">Save Profile</button>
                    </div>
                </div>
                <div class="account-backend-card">
                     <h3>Cloud Storage Sync</h3>
                     <p id="gdrive-disconnected-message">Connect your Google Drive to sync your music library and playlists across devices.</p>
                     <div class="backend-controls">
                         <span id="drive-status" class="status-disconnected">Disconnected</span>
                         <button id="gdrive-connect-btn" class="action-button" disabled>Loading...</button>
                         <button id="gdrive-sync-btn" class="action-button secondary" disabled><i class="fas fa-sync-alt"></i> Sync</button>
                     </div>
                </div>
            </div>`,
        player: `
            <div class="player-view-wrapper">
                <div class="player-main">
                    <canvas id="visualizer-canvas" width="280" height="280"></canvas>
                    <div class="player-track-info">
                        <div class="title">No song selected</div>
                        <div class="artist">Select a song to play</div>
                    </div>
                    <div class="player-controls-backdrop">
                        <div class="player-ai-actions">
                            <button id="ai-lyrics-btn" title="Get Lyrics"><i class="fas fa-microphone-alt"></i> Lyrics</button>
                            <button id="ai-insights-btn" title="Get Song Insights"><i class="fas fa-lightbulb"></i> Insights</button>
                        </div>
                        <div class="player-controls-group">
                            <div class="progress-container">
                                <span id="current-time">0:00</span>
                                <input type="range" id="progress-bar" value="0" step="1">
                                <span id="total-duration">0:00</span>
                            </div>
                            <div class="main-controls">
                                <!-- PLAYER CONTROLS (copy into your player template) -->
                                <div class="player-controls">
                                  <button class="btn btn-icon btn-ghost" id="shuffle-btn" aria-pressed="false" aria-label="Shuffle" title="Shuffle">
                                    <span class="icon-wrap"><i class="fas fa-random" aria-hidden="true"></i></span>
                                  </button>

                                  <button class="btn btn-icon btn-ghost" id="prev-btn" aria-label="Previous" title="Previous">
                                    <span class="icon-wrap"><i class="fas fa-backward-step" aria-hidden="true"></i></span>
                                  </button>

                                  <button class="btn play btn-live" id="play-pause-btn" aria-pressed="false" aria-label="Play" title="Play / Pause">
                                    <span class="play-inner">
                                      <span class="icon-play"><i class="fas fa-play" aria-hidden="true"></i></span>
                                      <span class="icon-pause"><i class="fas fa-pause" aria-hidden="true"></i></span>
                                    </span>
                                  </button>

                                  <button class="btn btn-icon btn-ghost" id="next-btn" aria-label="Next" title="Next">
                                    <span class="icon-wrap"><i class="fas fa-forward-step" aria-hidden="true"></i></span>
                                  </button>

                                  <button class="btn btn-icon btn-ghost" id="repeat-btn" aria-pressed="false" aria-label="Repeat" title="Repeat">
                                    <span class="icon-wrap"><i class="fas fa-repeat" aria-hidden="true"></i></span>
                                  </button>
                                </div>
                            </div>
                            <div class="secondary-controls">
                                <div class="volume-container">
                                    <div class="volume-group">
                                        <button class="btn btn-icon btn-ghost" id="volume-btn" aria-pressed="false" aria-label="Mute" title="Mute/Unmute">
                                          <span class="icon-wrap"><i class="fas fa-volume-high" aria-hidden="true"></i></span>
                                        </button>
                                        <input type="range" class="volume-slider" id="volume-slider" min="0" max="1" step="0.01" value="1" aria-label="Volume" />
                                    </div>
                                </div>
                                <div class="eq-container">
                                    <button id="eq-btn" title="Equalizer"><i class="fas fa-sliders"></i></button>
                                    <div class="eq-panel" id="eq-panel">
                                        <div class="eq-sliders-container">
                                            <div class="eq-slider-wrapper">
                                                <label>Bass</label>
                                                <input type="range" id="eq-low-slider" class="eq-slider" min="-10" max="10" step="1" value="0">
                                            </div>
                                            <div class="eq-slider-wrapper">
                                                <label>Mids</label>
                                                <input type="range" id="eq-mid-slider" class="eq-slider" min="-10" max="10" step="1" value="0">
                                            </div>
                                            <div class="eq-slider-wrapper">
                                                <label>Treble</label>
                                                <input type="range" id="eq-high-slider" class="eq-slider" min="-10" max="10" step="1" value="0">
                                            </div>
                                        </div>
                                        <div class="eq-presets-container">
                                            <!-- EQ Presets will be dynamically inserted here -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="player-queue-container">
                    <h3>Up Next</h3>
                    <ul id="player-queue-list"></ul>
                </div>
            </div>`
    };
    return templates[view] || `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Content not available.</p></div>`;
}

function updateTopBarTitle(view) {
    const titleMap = {
        home: 'Home',
        'Video': 'YT to MP3',
        'jamendo': 'Jamendo Music',
        'ai-assistant': 'AI Assistant',
        controls: 'Controls & Settings',
        theme: 'Theme Customizer',
        account: 'My Account'
    };
    const titleEl = document.getElementById('current-view-title');
    if (titleEl) {
        titleEl.textContent = titleMap[view] || 'AURA';
    }
}

function updateActiveNav(view) {
    dom.navItems.forEach(navItem => {
        navItem.classList.toggle('active', navItem.dataset.view === view);
    });
}

async function renderCurrentView() {
    updateActiveNav(state.currentView);
    updateTopBarTitle(state.currentView);
    
    return new Promise(resolve => {
        const isTrackLoaded = !!dom.audioPlayer.src;
        
        if (state.animationFrameId && state.currentView !== 'player') {
            cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
        }

        if (state.ytPlayer && state.currentView !== 'Video' && !state.isYtAudioOnly) {
             // Only stop the video if we are navigating away AND audio-only mode is OFF
             state.ytPlayer.stopVideo();
        }

        if (state.currentView !== 'player' && (isTrackLoaded && state.currentIndex > -1)) {
            dom.topBar.classList.add('player-active-nav');
        } else {
            dom.topBar.classList.remove('player-active-nav');
        }
        
        dom.auraScreenContainer.classList.remove('player-active');
        if (state.currentView !== 'player') {
            dom.auraScreenContainer.style.backgroundImage = 'none';
        }


        const html = getTemplateForView(state.currentView);
        dom.viewContent.innerHTML = html;
        setTimeout(() => {
            if (state.currentView === 'home') initHomeView();
            else if (state.currentView === 'controls') initControlsView();
            else if (state.currentView === 'account') initAccountView();
            else if (state.currentView === 'Video') initYtToMp3View();
            else if (state.currentView === 'theme') initThemeView();
            else if (state.currentView === 'jamendo') initJamendoView();
            else if (state.currentView === 'ai-assistant') initAiAssistantView();
            else if (state.currentView === 'player') {
                initMusicPlayerView();
                if (state.isPlaying && state.settings.musicVisualizer && !state.animationFrameId) {
                    drawVisualizer();
                }
            }
            resolve();
        }, 50);
    });
}

function initHomeView() {
    dynamicDom.trackList = document.getElementById('track-list');
    dynamicDom.viewTitle = document.getElementById('view-title');
    document.getElementById('add-music-btn').addEventListener('click', () => document.getElementById('file-input').click());
    document.getElementById('file-input').addEventListener('change', e => handleFiles(e.target.files));
    document.getElementById('ai-playlist-btn').addEventListener('click', () => openCreatePlaylistModal(true));
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.currentTarget.parentElement.classList.toggle('active');
            document.getElementById('search-input').focus();
        });
    }
    const searchInput = document.getElementById('search-input');
    if(searchInput) searchInput.addEventListener('input', renderTrackList);
    
    if(dynamicDom.trackList) dynamicDom.trackList.addEventListener('click', handleTrackListClick);
    
    document.getElementById('liked-songs-card').addEventListener('click', () => {
        state.currentTracklistSource = { type: 'playlist', name: 'Liked Songs' };
        renderTrackList();
    });
    
    if(dynamicDom.viewTitle) dynamicDom.viewTitle.addEventListener('click', () => {
        if (state.currentTracklistSource.type !== 'library') {
            state.currentTracklistSource = { type: 'library', name: 'Library' };
            renderTrackList();
        }
    });

    document.getElementById('create-playlist-card').addEventListener('click', () => openCreatePlaylistModal(false));

    renderTrackList();
}

function initControlsView() {
    const toggles = {
        'toggle-dynamic-island': 'dynamicIsland',
        'toggle-title-glow': 'titleGlow',
        'toggle-messages': 'showMessages',
        'toggle-visual-effects': 'visualEffects',
        'toggle-music-visualizer': 'musicVisualizer',
        'toggle-ai-dj': 'aiDjEnabled',
    };

    Object.entries(toggles).forEach(([id, key]) => {
        const toggle = document.getElementById(id);
        if (toggle) {
            toggle.checked = state.settings[key];
            toggle.addEventListener('change', (e) => {
                state.settings[key] = e.target.checked;
                if (key === 'titleGlow') {
                    dom.appTitle.classList.toggle('title-glow', state.settings.titleGlow);
                }
                if (key === 'visualEffects') {
                    applyPerformanceMode();
                }
                if (key === 'musicVisualizer' && !e.target.checked && state.animationFrameId) {
                    cancelAnimationFrame(state.animationFrameId);
                    state.animationFrameId = null;
                    if(dynamicDom.visualizerCanvas) {
                       const ctx = dynamicDom.visualizerCanvas.getContext('2d');
                       ctx.clearRect(0,0,dynamicDom.visualizerCanvas.width, dynamicDom.visualizerCanvas.height);
                    }
                }
                saveState();
            });
        }
    });
}

function initAiAssistantView() {
    const chatInput = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send-btn');
    const chatBox = document.getElementById('chat-messages');

    const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message to UI
        const userMsgEl = document.createElement('div');
        userMsgEl.className = 'chat-message user';
        userMsgEl.innerHTML = `<div class="content">${message}</div>`; // No avatar for user
        chatBox.appendChild(userMsgEl);

        chatInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;

        // Add loading indicator
        const loadingEl = document.createElement('div');
        loadingEl.className = 'chat-message assistant thinking';
        loadingEl.innerHTML = `
            <div class="avatar"><i class="fas fa-robot"></i></div>
            <div class="content">
                <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>`;
        chatBox.appendChild(loadingEl);
        chatBox.scrollTop = chatBox.scrollHeight;

        const prompt = `You are Aura, a helpful and friendly music assistant. A user sent this message: "${message}". The user's current music library is: ${JSON.stringify(state.library.map(t => ({title: t.name, artist: t.artist})))}. Based on this, provide a concise and helpful response. If they ask to create a playlist, tell them to use the 'AI Playlist' button on the home screen.`;
        const response = await callAiModel(prompt);

        loadingEl.remove();
        
        const botMsgEl = document.createElement('div');
        botMsgEl.className = 'chat-message assistant';
        
        let responseContent;
        if (response === null) { // AI features are disabled
            responseContent = '⚠️ AI features are currently turned off. Click "AI Ready" to enable.';
        } else {
            responseContent = response;
        }

        botMsgEl.innerHTML = `
            <div class="avatar"><i class="fas fa-robot"></i></div>
            <div class="content">${responseContent}</div>`;
        chatBox.appendChild(botMsgEl);
        
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}


function initAccountView() {
    const nameInput = document.getElementById('account-name');
    const emailInput = document.getElementById('account-email');
    const profilePicImg = document.getElementById('profile-pic-img');
    const profilePicUpload = document.getElementById('profile-pic-upload');
    const editPicBtn = document.querySelector('.edit-pic-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');

    if (state.googleDriveSignedIn) {
        nameInput.value = state.googleUserName || 'Google User';
        emailInput.value = state.googleUserEmail || 'No email provided';
        profilePicImg.src = state.googleUserPicture || 'https://placehold.co/100x100/2a2a3a/e0e0e0?text=G';
        
        nameInput.readOnly = true;
        emailInput.style.display = 'block';
        editPicBtn.style.display = 'none';
        saveProfileBtn.style.display = 'none';
    } else {
        nameInput.value = state.userName;
        profilePicImg.src = state.userProfilePic || 'https://placehold.co/100x100/2a2a3a/e0e0e0?text=A';

        nameInput.readOnly = false;
        emailInput.style.display = 'none';
        editPicBtn.style.display = 'flex';
        saveProfileBtn.style.display = 'block';
    }
    
    saveProfileBtn.addEventListener('click', () => {
        state.userName = nameInput.value.trim();
        saveState();
        showToast('Profile saved!', 'success');
    });

    profilePicUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                state.userProfilePic = event.target.result;
                profilePicImg.src = state.userProfilePic;
                saveState();
            };
            reader.readAsDataURL(file);
        }
    });

    const connectBtn = document.getElementById('gdrive-connect-btn');
    connectBtn.addEventListener('click', () => {
        if (state.googleDriveSignedIn) {
            handleSignoutClick();
        } else {
            handleAuthClick();
        }
    });

    document.getElementById('gdrive-sync-btn').addEventListener('click', syncDriveFiles);
    updateDriveStatus(state.googleDriveSignedIn);
}

function initYtToMp3View() {
    document.getElementById('yt-load-btn').addEventListener('click', handleYtLoad);
    document.getElementById('yt-add-to-library-btn').addEventListener('click', handleYtAddToLibrary);
    document.getElementById('yt-download-btn').addEventListener('click', handleYtDownload);
    
    // NEW: Search API listeners
    const searchBtn = document.getElementById('yt-search-api-btn');
    if (searchBtn) searchBtn.addEventListener('click', handleYtSearchApi);
    const searchInput = document.getElementById('yt-search-input');
    if (searchInput) searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleYtSearchApi();
    });

    // NEW: Tab switching logic
    document.querySelectorAll('.yt-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.yt-tab-btn').forEach(b => b.classList.remove('active'));
            
            const targetTab = e.target.dataset.tab;
            
            // Toggle visibility of the content containers
            document.getElementById('yt-link-tab').style.display = (targetTab === 'link' ? 'flex' : 'none');
            document.getElementById('yt-search-tab').style.display = (targetTab === 'search' ? 'flex' : 'none');

            e.target.classList.add('active');
        });
    });
    // Initialize tab display state
    document.getElementById('yt-search-tab').style.display = 'none';

    renderYtHistory();

    // ADDED: Initialize the audio toggle module
    if (typeof initYoutubeAudioToggle === 'function') {
        initYoutubeAudioToggle();
    }
}

async function handleYtSearchApi() {
    const query = document.getElementById('yt-search-input').value.trim();
    const resultsList = document.getElementById('yt-search-results');

    if (!query) {
        showToast("Please enter a search term.", "info");
        return;
    }

    if (!state.googleApiReady) {
        showToast("Google API is not ready. Please wait or connect account.", "error");
        return;
    }

    resultsList.innerHTML = `<div class="loading-spinner" style="margin: 2rem auto;"></div>`;

    try {
        // Use gapi.client.youtube.search.list with the user's API key (loaded in backend.js)
        const response = await gapi.client.request({
            'path': 'https://youtube.googleapis.com/youtube/v3/search',
            'params': {
                'part': 'snippet',
                'q': query,
                'type': 'video', // Limit to videos for music app
                'maxResults': 15, // Keep search results concise
            }
        });

        if (response.result.items.length === 0) {
            resultsList.innerHTML = `<div class="empty-state"><i class="fas fa-compact-disc"></i><p>No YouTube videos found for "${query}".</p></div>`;
            return;
        }

        renderYtSearchResults(response.result.items);

    } catch (err) {
        console.error("YouTube Search API Error:", err);
        showToast(`Youtube failed: ${err.result?.error?.message || 'Check your API Key and Console setup.'}`, "error");
        resultsList.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Search failed. Check API key restrictions or network.</p></div>`;
    }
}

function renderYtSearchResults(items) {
    const resultsList = document.getElementById('yt-search-results');
    
    // Filter out items that might not have videoId (e.g. if type='channel' was allowed)
    const videoItems = items.filter(item => item.id && item.id.videoId);
    
    if (videoItems.length === 0) {
         resultsList.innerHTML = `<div class="empty-state"><i class="fas fa-compact-disc"></i><p>No video results found.</p></div>`;
         return;
    }

    resultsList.innerHTML = videoItems.map(item => {
        const videoId = item.id.videoId;
        const title = item.snippet.title;
        const channelTitle = item.snippet.channelTitle;
        const thumbnail = item.snippet.thumbnails.default.url;

        // Note: We embed the necessary data attributes to load the video later
        return `
            <li class="yt-search-item" data-id="${videoId}" data-title="${title.replace(/"/g, '&quot;')}" data-author="${channelTitle.replace(/"/g, '&quot;')}">
                <img src="${thumbnail}" alt="thumbnail">
                <div class="info">
                    <span class="title">${title}</span>
                    <span class="author">${channelTitle}</span>
                </div>
                <button class="yt-load-item-btn action-button secondary" title="Load Video"><i class="fas fa-play"></i></button>
            </li>
        `;
    }).join('');

    resultsList.querySelectorAll('.yt-load-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent li click
            const item = e.currentTarget.closest('.yt-search-item');
            const videoId = item.dataset.id;
            const url = `https://www.youtube.com/watch?v=${videoId}`;
            
            // Switch back to link tab and load the video
            document.querySelector('.yt-tab-btn[data-tab="link"]').click();
            document.getElementById('yt-url-input').value = url;
            
            // Ensure link tab is visible (flex) and search tab is hidden
            document.getElementById('yt-link-tab').style.display = 'flex';
            document.getElementById('yt-search-tab').style.display = 'none';

            handleYtLoad();
        });
    });
}


async function handleYtDownload() {
    if (!state.currentYtInfo.id) {
        showToast("Please load a video first", "error");
        return;
    }

    showToast(`Preparing download for "${state.currentYtInfo.title}"...`, 'info');

    try {
        const videoId = state.currentYtInfo.id;
        const info = await ytdl.getInfo(videoId);
        
        // Find an audio-only format.
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });

        if (!format || !format.url) {
            throw new Error("No suitable audio format found for download.");
        }

        // Use an anchor tag to trigger the download. This is more reliable than fetch for cross-origin resources.
        const a = document.createElement('a');
        a.href = format.url;
        
        const cleanTitle = info.videoDetails.title.replace(/[\\/:"*?<>|]/g, '');
        // The container is often 'mp4' (m4a), but we name it .mp3 as requested.
        a.download = `${cleanTitle}.mp3`; 
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showToast('Download started!', 'success');

    } catch (err) {
        console.error("YouTube Download Error:", err);
        showToast(`Download failed: ${err.message}`, "error");
    }
}

function getYtVideoId(url) {
    let videoId = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        }
    } catch(e) { /* Invalid URL */ }
    
    if (!videoId) { 
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
        const match = regex.exec(url);
        if (match && match[1]) videoId = match[1];
    }
    return videoId;
}

function handleYtLoad() {
    const url = document.getElementById('yt-url-input').value;
    const videoId = getYtVideoId(url);

    if (!videoId) {
        showToast("Please enter a valid YouTube URL.", "error");
        return;
    }
    
    state.currentYtInfo.id = videoId;
    document.getElementById('yt-placeholder').style.display = 'none';
    
    if (state.ytPlayer && typeof state.ytPlayer.loadVideoById === 'function') {
        state.ytPlayer.loadVideoById(videoId);
    } else {
        createYtPlayer(videoId);
    }
}

async function handleYtAddToLibrary() {
    if (!state.currentYtInfo.id) {
        showToast("Please load a video first", "error");
        return;
    }

    const newTrack = {
        id: `yt-${state.currentYtInfo.id}`,
        name: state.currentYtInfo.title,
        artist: state.currentYtInfo.author,
        source: 'youtube',
        thumbnail: `https://i.ytimg.com/vi/${state.currentYtInfo.id}/hqdefault.jpg`,
    };

    if (!state.library.some(track => track.id === newTrack.id)) {
        state.library.push(newTrack);
        showToast(`Added "${newTrack.name}" to library!`, 'success');
        saveState();
        if (state.currentView === 'home') {
            renderTrackList();
        }
    } else {
        showToast(`"${newTrack.name}" is already in your library.`, 'info');
    }

    const trackIndex = state.library.findIndex(t => t.id === newTrack.id);
    if (trackIndex > -1) {
        setQueue(state.library, trackIndex);
        playTrack();
    }
}

function createYtPlayer(videoId) {
    if (dom.audioPlayer.src) dom.audioPlayer.pause();

    if (state.ytPlayer && typeof state.ytPlayer.destroy === 'function') {
        state.ytPlayer.destroy();
    }

    state.ytPlayer = new YT.Player('yt-player-container', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: { 'playsinline': 1, 'autoplay': 1, 'controls': 1, 'rel': 0, 'modestbranding': 1, 'showinfo': 0 },
        events: { 'onReady': onYtPlayerReady }
    });
}

function onYtPlayerReady(event) {
    const playerData = event.target.getVideoData();
    state.currentYtInfo.title = playerData.title;
    state.currentYtInfo.author = playerData.author;
    document.getElementById('yt-video-title').textContent = playerData.title;
    document.getElementById('yt-video-author').textContent = playerData.author;
    document.getElementById('yt-info-and-controls').style.display = 'flex';

    const historyEntry = {
        id: playerData.video_id,
        title: playerData.title,
        author: playerData.author,
        thumbnail: `https://i.ytimg.com/vi/${playerData.video_id}/default.jpg`
    };
    state.ytHistory = state.ytHistory.filter(item => item.id !== historyEntry.id);
    state.ytHistory.unshift(historyEntry);
    if (state.ytHistory.length > 50) state.ytHistory.pop();
    saveState();
    renderYtHistory();

    // ADDED: Notify the audio toggle module that a new video is loaded
    window.dispatchEvent(new Event('aura:ytVideoLoaded'));
}

function renderYtHistory() {
    const historyList = document.getElementById('yt-history-list');
    if (!historyList) return;

    if (state.ytHistory.length === 0) {
        historyList.innerHTML = `<div class="yt-history-empty">No videos in history.</div>`;
        return;
    }

    historyList.innerHTML = state.ytHistory.map(item => `
        <li class="yt-history-item" data-id="${item.id}">
            <img src="${item.thumbnail}" alt="thumbnail">
            <div class="info">
                <span class="title">${item.title}</span>
                <span class="author">${item.author}</span>
            </div>
        </li>
    `).join('');

    historyList.querySelectorAll('.yt-history-item').forEach(item => {
        item.addEventListener('click', () => {
            const url = `https://www.youtube.com/watch?v=${item.dataset.id}`;
            document.getElementById('yt-url-input').value = url;
            
            // Ensure link tab is visible (flex) and search tab is hidden when loading from history
            document.querySelector('.yt-tab-btn[data-tab="link"]').click();
            
            // REMOVED: Redundant display style changes that were here
            
            handleYtLoad();
        });
    });
}

// --- JAMENDO VIEW FUNCTIONS (NEW) ---
function initJamendoView() {
    document.getElementById('jamendo-search-btn').addEventListener('click', handleJamendoSearch);
    document.getElementById('jamendo-search-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleJamendoSearch();
    });
}

async function handleJamendoSearch() {
    const query = document.getElementById('jamendo-search-input').value.trim();
    if (!query) {
        showToast("Please enter a search term.", "info");
        return;
    }

    if (!state.jamendoClientId) {
        showToast("Jamendo Client ID is not set in script1.js.", "error");
        return;
    }

    const resultsList = document.getElementById('jamendo-results-list');
    resultsList.innerHTML = `<div class="loading-spinner" style="margin: 3rem auto;"></div>`;

    try {
        const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${state.jamendoClientId}&format=json&search=${encodeURIComponent(query)}&limit=50&imagesize=60`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Jamendo API error: ${response.statusText}`);
        }
        const data = await response.json();

        if (data.headers.status !== 'success' || data.results.length === 0) {
            resultsList.innerHTML = `<div class="empty-state"><i class="fas fa-compact-disc"></i><p>No results found for "${query}".</p></div>`;
            return;
        }

        renderJamendoResults(data.results);

    } catch (error) {
        console.error("Jamendo search failed:", error);
        showToast(`Search failed: ${error.message}`, "error");
        resultsList.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Could not fetch data from Jamendo.</p></div>`;
    }
}

function renderJamendoResults(tracks) {
    const resultsList = document.getElementById('jamendo-results-list');
    resultsList.innerHTML = tracks.map(track => `
        <li class="jamendo-track-item" data-track-id="${track.id}">
            <img src="${track.image}" alt="${track.name}">
            <div class="info">
                <div class="title">${track.name}</div>
                <div class="artist">${track.artist_name}</div>
            </div>
            <button class="play-btn" title="Play Track"><i class="fas fa-play-circle"></i></button>
        </li>
    `).join('');
    
    // Add event listeners to each result item
    resultsList.querySelectorAll('.jamendo-track-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const trackId = e.currentTarget.dataset.trackId;
            const trackData = tracks.find(t => t.id === trackId);
            if (!trackData) return;

            // Create a track object compatible with our player
            const newTrack = {
                id: `jamendo-${trackData.id}`,
                name: trackData.name,
                artist: trackData.artist_name,
                source: 'jamendo',
                streamUrl: trackData.audio, // The direct stream URL
                thumbnail: trackData.image,
            };
            
            // Add to library if it doesn't exist
            const existingTrackIndex = state.library.findIndex(t => t.id === newTrack.id);
            let targetIndex;

            if (existingTrackIndex === -1) {
                state.library.push(newTrack);
                targetIndex = state.library.length - 1;
            } else {
                targetIndex = existingTrackIndex;
            }
            
            // Set queue and play
            setQueue(state.library, targetIndex);
            playTrack();
        });
    });
}
// --- END JAMENDO FUNCTIONS ---

function initThemeView() {
    // Base Theme Selection
    const container = document.getElementById('theme-selection-container');
    const themes = {
        'aura-default': { name: 'Aura Default', colors: ['#12121c', '#00c6ff', '#0072ff', '#e0e0e0'] },
        'theme-neon-nights': { name: 'Neon Nights', colors: ['#0d0221', '#f900f9', '#00f5ff', '#ffffff'] },
        'theme-forest-calm': { name: 'Forest Calm', colors: ['#141d1a', '#2dc46b', '#ffc857', '#f0f5f1'] },
        // Add the new themes so they appear in the customizer
        'theme-solar-warm': { name: 'Solar Warm', colors: ['#14120f', '#FF7A18', '#FFD166', '#fff'] },
        'theme-midnight-rose': { name: 'Midnight Rose', colors: ['#0b0611', '#ff4d9a', '#6f42c1', '#fff'] },
        'theme-ocean-deep': { name: 'Ocean Deep', colors: ['#071325', '#00d2ff', '#0077ff', '#e6f7ff'] },
    };

    container.innerHTML = Object.entries(themes).map(([id, {name, colors}]) => `
        <div class="theme-card ${state.settings.activeTheme === id ? 'active' : ''}" data-theme-id="${id}">
            <div class="theme-preview">
                <span style="background-color: ${colors[0]}"></span>
                <span style="background-color: ${colors[1]}"></span>
                <span style="background-color: ${colors[2]}"></span>
                <span style="background-color: ${colors[3]}"></span>
            </div>
            <h3>${name}</h3>
        </div>
    `).join('');

    container.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            const themeId = card.dataset.themeId;
            applyTheme(themeId);
            container.querySelector('.theme-card.active')?.classList.remove('active');
            card.classList.add('active');
        });
    });

    // Customization Sliders
    const animSlider = document.getElementById('anim-speed-slider');
    const animValue = document.getElementById('anim-speed-value');
    const colorSlider = document.getElementById('color-intensity-slider');
    const colorValue = document.getElementById('color-intensity-value');
    const blurSlider = document.getElementById('bg-blur-slider');
    const blurValue = document.getElementById('bg-blur-value');

    animSlider.value = state.settings.animationSpeed;
    animValue.textContent = `${state.settings.animationSpeed.toFixed(1)}s`;
    colorSlider.value = state.settings.colorIntensity;
    colorValue.textContent = `${state.settings.colorIntensity}%`;
    blurSlider.value = state.settings.backgroundBlur;
    blurValue.textContent = `${state.settings.backgroundBlur}px`;


    animSlider.addEventListener('input', (e) => {
        state.settings.animationSpeed = parseFloat(e.target.value);
        animValue.textContent = `${state.settings.animationSpeed.toFixed(1)}s`;
        applyThemeCustomizations();
        saveState();
    });

    colorSlider.addEventListener('input', (e) => {
        state.settings.colorIntensity = parseInt(e.target.value);
        colorValue.textContent = `${state.settings.colorIntensity}%`;
        applyThemeCustomizations();
        saveState();
    });

     blurSlider.addEventListener('input', (e) => {
        state.settings.backgroundBlur = parseInt(e.target.value);
        blurValue.textContent = `${state.settings.backgroundBlur}px`;
        applyThemeCustomizations();
        saveState();
    });


    // Background Upload
    const uploadBtn = document.getElementById('upload-bg-btn');
    const bgInput = document.getElementById('bg-upload-input');
    const clearBtn = document.getElementById('clear-bg-btn');

    uploadBtn.addEventListener('click', () => bgInput.click());
    clearBtn.addEventListener('click', () => {
        state.settings.customBackground = '';
        applyThemeCustomizations();
        saveState();
        showToast('Background image cleared.', 'info');
    });

    bgInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                state.settings.customBackground = event.target.result;
                applyThemeCustomizations();
                saveState();
                showToast('Background updated!', 'success');
            };
            reader.readAsDataURL(file);
        } else if (file) {
            showToast('Please select a valid image file.', 'error');
        }
    });
}


function applyTheme(themeId) {
    // Update the class on the body. This will apply the base theme styles.
    // The new themes from style-updates.css will work immediately.
    document.body.className = themeId;
    state.settings.activeTheme = themeId;
    saveState();
}

function renderTrackList() {
    if (!dynamicDom.trackList) return;

    dynamicDom.viewTitle.textContent = state.currentTracklistSource.name;
    let tracksToShow;
    if (state.currentTracklistSource.type === 'library') {
        tracksToShow = state.library;
        dynamicDom.viewTitle.style.cursor = 'default';
    } else {
        const playlist = state.playlists[state.currentTracklistSource.name];
        const playlistTrackIds = new Set(playlist?.tracks || []);
        tracksToShow = state.library.filter(track => playlistTrackIds.has(track.id));
        dynamicDom.viewTitle.style.cursor = 'pointer';
    }

    const query = document.getElementById('search-input')?.value.toLowerCase() || '';
    if (query) {
        tracksToShow = tracksToShow.filter(track => 
            track.name.toLowerCase().includes(query) || 
            (track.artist && track.artist.toLowerCase().includes(query))
        );
    }

    if (tracksToShow.length === 0) {
        const message = state.library.length === 0 ? 'Your library is empty. Drag & drop audio files here or sync with Google Drive!' : `No songs in "${state.currentTracklistSource.name}".`;
        dynamicDom.trackList.innerHTML = `<div class="empty-state"><i class="fas fa-compact-disc"></i><p>${message}</p></div>`;
        return;
    }

    const likedSongIds = new Set(state.playlists['Liked Songs']?.tracks || []);
    dynamicDom.trackList.innerHTML = tracksToShow.map((track, index) => {
        const isLiked = likedSongIds.has(track.id);
        const sourceIcon = track.source === 'drive' ? 'fa-google-drive' : track.source === 'youtube' ? 'fa-youtube' : track.source === 'jamendo' ? 'fa-broadcast-tower' : 'fa-computer';
        const sourceIconBrand = track.source === 'drive' || track.source === 'youtube' ? 'fab' : 'fas';

        return `
            <li class="track-item" data-track-id="${track.id || ''}">
                <div class="track-number-container">
                    <span class="track-number">${index + 1}</span>
                    <i class="${sourceIconBrand} ${sourceIcon} track-source-icon" title="Source: ${track.source}"></i>
                </div>
                <div class="track-info-main">
                    <div class="track-title">${track.name.replace(/\.[^/.]+$/, "")}</div>
                    <div class="track-artist">${track.artist || 'Unknown Artist'}</div>
                </div>
                <button class="like-btn ${isLiked ? 'active' : ''}" title="Like"><i class="fas fa-heart"></i></button>
                <div class="track-actions">
                    ${track.source === 'local' && state.googleDriveSignedIn ? `<button class="upload-to-cloud-btn" title="Upload to Cloud"><i class="fas fa-cloud-upload-alt"></i></button>` : ''}
                    ${track.source !== 'local' ? `<button class="download-from-cloud-btn" title="Download to Local"><i class="fas fa-cloud-download-alt"></i></button>` : ''}
                    <button class="add-to-playlist-btn" title="Add to playlist"><i class="fas fa-plus"></i></button>
                    <button class="delete-from-library-btn" title="Delete from library"><i class="fas fa-trash"></i></button>
                </div>
            </li>`;
    }).join('');
    updatePlayingTrackUI();
}

function renderRecents() {
    if (!dom.recentsList) return;
    if (state.recents.length === 0) {
        dom.recentsList.innerHTML = `<p style="padding: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">Play a song to see it here.</p>`;
        return;
    }
    dom.recentsList.innerHTML = state.recents.map(trackName =>
        `<div class="recents-list-item" data-track-name="${trackName}">${trackName.replace(/\.[^/.]+$/, "")}</div>`
    ).join('');
}

function renderPlaylists() {
    if (!dom.playlistsList) return;

    const playlistNames = Object.keys(state.playlists);

    if (playlistNames.length === 0) {
        dom.playlistsList.innerHTML = `<p style="padding: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">No playlists yet.</p>`;
        return;
    }

    dom.playlistsList.innerHTML = playlistNames.map(name =>
        `<div class="playlist-item" data-playlist-name="${name}"><i class="fas fa-music" style="margin-right: 0.75rem; color: var(--text-secondary);"></i>${name}</div>`
    ).join('');

    // Add event listeners
    dom.playlistsList.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', () => {
            const playlistName = item.dataset.playlistName;
            state.currentTracklistSource = { type: 'playlist', name: playlistName };
            
            // If not in home view, switch to it to show the track list
            if (state.currentView !== 'home') {
                state.currentView = 'home';
                updateActiveNav('home');
                renderCurrentView();
            } else {
                renderTrackList();
            }
        });
    });
}

function updatePlayingTrackUI() {
    document.querySelectorAll('.track-item').forEach(item => item.classList.remove('playing'));
    if (state.isPlaying && state.currentIndex > -1 && state.queue[state.currentIndex]) {
        try {
            const currentTrack = state.queue[state.currentIndex];
            const selector = `.track-item[data-track-id="${CSS.escape(currentTrack.id)}"]`;
            const trackItem = document.querySelector(selector);
            if (trackItem) trackItem.classList.add('playing');
        } catch (e) { console.error("Error escaping selector", e); }
    }
}

function showToast(message, type = 'info') {
    // Return early for non-essential info messages if toggled off
    if (!state.settings.showMessages && type === 'info') return;

    const toast = document.createElement('div');
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i><span>${message}</span>`;
    toast.className = `toast ${type}`;
    dom.toastContainer.appendChild(toast);

    const removeToast = () => {
        toast.classList.add('hide');
        toast.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'opacity' && toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    };

    if (state.settings.dynamicIsland) {
        // --- New Animation Sequence ---
        // 1. Bubble In (becomes visible as a circle)
        setTimeout(() => toast.classList.add('show'), 10);
        // 2. Expand to full width
        setTimeout(() => toast.classList.add('expand'), 300);
        // 3. Add glow effect
        setTimeout(() => toast.classList.add('glow'), 800);

        // 4. Hide sequence
        setTimeout(() => {
            toast.classList.remove('glow'); // Stop glowing first
            // Shrink back to bubble by removing expand class
            toast.classList.remove('expand');
            // After shrinking, trigger the final hide animation
            setTimeout(removeToast, 500); // 500ms for it to shrink
        }, 4000); // Total visible duration
    } else {
        // --- Legacy Behavior ---
        toast.classList.add('legacy'); // Set initial state for non-bubble
        setTimeout(() => toast.classList.add('show'), 10); // Fade-in
        setTimeout(removeToast, 4000); // Fade-out after duration
    }
}


// --- MODAL LOGIC ---
function openAddToPlaylistModal(track) {
    const modal = document.getElementById('add-to-playlist-modal');
    document.getElementById('modal-track-name').textContent = track.name.replace(/\.[^/.]+$/, "");
    const playlistList = document.getElementById('modal-playlist-list');
    const playlistNames = Object.keys(state.playlists);
    playlistList.innerHTML = playlistNames.length > 0
        ? playlistNames.map(name => `<li data-playlist-name="${name}">${name}</li>`).join('')
        : `<p style="color: var(--text-secondary)">No playlists created yet.</p>`;
    
    const clickHandler = (e) => {
        if (e.target.tagName === 'LI') {
            const playlistName = e.target.dataset.playlistName;
            const playlist = state.playlists[playlistName];
            if (!playlist.tracks.includes(track.id)) {
                 playlist.tracks.push(track.id);
                 saveState();
                 showToast(`Added to "${playlistName}"`, 'success');
            } else {
                 showToast(`Song already in "${playlistName}"`, 'info');
            }
            closeHandler();
        }
    };
    const closeHandler = () => {
        modal.classList.remove('show');
        playlistList.removeEventListener('click', clickHandler);
        document.getElementById('cancel-add-to-playlist-btn').removeEventListener('click', closeHandler);
    };

    playlistList.addEventListener('click', clickHandler);
    document.getElementById('cancel-add-to-playlist-btn').addEventListener('click', closeHandler, { once: true });
    modal.classList.add('show');
}

function openCreatePlaylistModal(isAiMode = false) {
    const modal = document.getElementById('create-playlist-modal');
    const title = document.getElementById('create-playlist-modal-title');
    const desc = document.getElementById('create-playlist-modal-desc');
    const input = document.getElementById('new-playlist-name-modal');
    const confirmBtn = document.getElementById('confirm-create-playlist-btn');

    state.isAiPlaylistMode = isAiMode;
    if (isAiMode) {
        title.textContent = "Create Playlist with AI";
        desc.textContent = "Describe the playlist you want (e.g., 'chill lofi beats for studying' or '80s rock anthems').";
        input.placeholder = "Enter AI prompt...";
        confirmBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Create';
    } else {
        title.textContent = "Create New Playlist";
        desc.textContent = "Enter a name for your new playlist.";
        input.placeholder = "Enter playlist name...";
        confirmBtn.innerHTML = 'Create';
    }
    
    modal.classList.add('show');
    input.focus();

    const confirmHandler = () => {
        if (state.isAiPlaylistMode) {
            if (typeof handleAiPlaylistCreation === 'function') {
                 handleAiPlaylistCreation();
            } else {
                 showToast("AI features script not loaded.", "error");
            }
        } else {
            const name = input.value.trim();
            if (name) {
                if (state.playlists[name]) {
                    showToast(`Playlist "${name}" already exists.`, 'error');
                } else {
                    state.playlists[name] = { name, tracks: [] };
                    saveState();
                    renderPlaylists(); // Update playlist UI
                    showToast(`Playlist "${name}" created!`, 'success');
                    closeHandler();
                }
            }
        }
    };
    
    const closeHandler = () => {
        input.value = '';
        modal.classList.remove('show');
        // Remove old listeners to prevent multiple triggers
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    };
    
    // Use .onclick to ensure only one listener is active
    document.getElementById('confirm-create-playlist-btn').onclick = confirmHandler;
    document.getElementById('cancel-create-playlist-btn').onclick = closeHandler;
    input.onkeydown = (e) => { if (e.key === 'Enter') confirmHandler(); };
}

function showConfirmation(title, message, onConfirm) {
    const modal = document.getElementById('confirmation-modal');
    document.getElementById('confirmation-title').textContent = title;
    document.getElementById('confirmation-message').textContent = message;
    modal.classList.add('show');

    const confirmBtn = document.getElementById('confirm-action-btn');
    const cancelBtn = document.getElementById('cancel-confirmation-btn');

    const confirmHandler = () => { onConfirm(); closeHandler(); };
    const closeHandler = () => { modal.classList.remove('show'); };
    
    confirmBtn.onclick = confirmHandler;
    cancelBtn.onclick = closeHandler;
}

function closeModalById(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('show');
}

// AI Modal Functions
function showAiContentModal(title) {
    const modal = document.getElementById('ai-content-modal');
    document.getElementById('ai-modal-title').textContent = title;
    document.getElementById('ai-modal-content').innerHTML = `<div class="loading-spinner" style="margin: 2rem auto;"></div>`;
    document.getElementById('cancel-ai-modal-btn').onclick = hideAiContentModal;
    modal.classList.add('show');
}

function updateAiModalContent(htmlContent) {
    const contentDiv = document.getElementById('ai-modal-content');
    // Convert ### headings to h3 and newlines to <br>
    let formattedContent = htmlContent
        .replace(/### (.*)/g, '<h3>$1</h3>')
        .replace(/\n/g, '<br>');
        
    contentDiv.innerHTML = formattedContent;
    contentDiv.style.textAlign = 'left';
    contentDiv.style.whiteSpace = 'normal'; // Allow wrapping
    contentDiv.style.lineHeight = '1.6';
}

function hideAiContentModal() {
    closeModalById('ai-content-modal');
}

function openEqualizerModal() {
    const modal = document.getElementById('equalizer-modal');
    if (!modal) return;

    // Get modal elements
    const presetsContainer = document.getElementById('modal-eq-presets');
    const lowSlider = document.getElementById('modal-eq-low-slider');
    const midSlider = document.getElementById('modal-eq-mid-slider');
    const highSlider = document.getElementById('modal-eq-high-slider');
    const closeBtn = document.getElementById('close-eq-modal-btn');
    
    // Populate presets
    presetsContainer.innerHTML = Object.keys(EQ_PRESETS).map(key => {
        const preset = EQ_PRESETS[key];
        const isActive = state.settings.activeEqPreset === key ? 'active' : '';
        return `<button class="eq-preset-btn ${isActive}" data-preset="${key}"><i class="fas ${preset.icon}"></i> ${preset.name}</button>`;
    }).join('');

    // Set initial slider values from state
    let currentValues;
    if (state.settings.activeEqPreset === 'custom') {
        currentValues = state.settings.customEqValues;
    } else {
        currentValues = EQ_PRESETS[state.settings.activeEqPreset]?.values || { low: 0, mid: 0, high: 0 };
    }
    lowSlider.value = currentValues.low;
    midSlider.value = currentValues.mid;
    highSlider.value = currentValues.high;

    // --- Event Listeners (using .onclick to prevent duplicates) ---
    presetsContainer.onclick = (e) => {
        const btn = e.target.closest('.eq-preset-btn');
        if (btn) {
            const presetName = btn.dataset.preset;
            if (typeof applyEqualizerPreset === 'function') {
                applyEqualizerPreset(presetName); // In script3.js
            }
        }
    };

    const handleSliderInput = (slider, band) => {
        slider.oninput = (e) => { // Use oninput to prevent creating multiple listeners
            const value = parseFloat(e.target.value);
            state.settings.customEqValues[band] = value;
            if (state.eqFilters[band] && state.audioContext) {
                state.eqFilters[band].gain.setValueAtTime(value, state.audioContext.currentTime);
            }
            // Switch to custom preset and update UI
            if (typeof applyEqualizerPreset === 'function') {
                applyEqualizerPreset('custom');
            }
        };
    };

    handleSliderInput(lowSlider, 'low');
    handleSliderInput(midSlider, 'mid');
    handleSliderInput(highSlider, 'high');

    closeBtn.onclick = () => modal.classList.remove('show');
    
    modal.classList.add('show');
}


function updateDriveStatus(isSignedIn) {
    const statusEl = document.getElementById('drive-status');
    const connectButtonEl = document.getElementById('gdrive-connect-btn');
    const syncButtonEl = document.getElementById('gdrive-sync-btn');
    const disconnectedMsgEl = document.getElementById('gdrive-disconnected-message');

    if (statusEl && connectButtonEl && syncButtonEl) {
        if (isSignedIn) {
            statusEl.textContent = 'Connected';
            statusEl.className = 'status-connected';
            connectButtonEl.textContent = 'Disconnect';
            syncButtonEl.disabled = false;
            if(disconnectedMsgEl) disconnectedMsgEl.textContent = `Syncing music from your Google Drive. Last synced: Never`;
        } else {
            statusEl.textContent = 'Disconnected';
            statusEl.className = 'status-disconnected';
            connectButtonEl.textContent = 'Connect';
            syncButtonEl.disabled = true;
            if(disconnectedMsgEl) disconnectedMsgEl.textContent = 'Connect your Google Drive to sync your music library and playlists across devices.';
        }
        connectButtonEl.disabled = !state.googleApiReady;
        if (!state.googleApiReady) connectButtonEl.textContent = 'Loading...';
    }
}
