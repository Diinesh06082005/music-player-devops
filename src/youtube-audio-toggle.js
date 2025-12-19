/*
  youtube-audio-toggle.js
  Adds a "Video / Audio-only" toggle for the YT view in Aura.
  - Keeps the YouTube iframe/player active (so playback continues)
  - When audio-only is enabled the iframe remains in the DOM but is visually hidden/minimised
  - When video-enabled it restores the iframe to normal size
  - Also injects a small thumbnail/artwork placeholder when in audio-only mode

  Usage:
  1. Include this file after your other scripts (so state.ytPlayer and DOM elements exist).
  2. It will automatically inject the toggle button into the YT controls area (#yt-info-and-controls).
  3. The toggle preserves playback and uses the existing YT IFrame API player (state.ytPlayer).

  Notes on rules: Do NOT attempt to download/extract audio from YT. This simply hides the video visually and controls playback via the official IFrame API.
*/

(function() {
    // Guard: only run on pages that have the YT view container
    function initYoutubeAudioToggle() {
      const controlsArea = document.getElementById('yt-info-and-controls');
      const playerContainer = document.getElementById('yt-player-container');
      if (!controlsArea || !playerContainer) return; // nothing to do
  
      // Prevent double injection
      if (document.getElementById('yt-toggle-video-btn')) return;
  
      // Create toggle button
      const btn = document.createElement('button');
      btn.id = 'yt-toggle-video-btn';
      btn.className = 'action-button secondary';
      btn.setAttribute('title', 'Toggle Video / Audio-only');
      btn.innerHTML = '<i class="fas fa-eye-slash"></i> Audio-only';
  
      // Insert into controls area (left of download/add buttons)
      const actionsContainer = controlsArea.querySelector('.yt-actions-container');
      if (actionsContainer) {
        actionsContainer.insertBefore(btn, actionsContainer.firstChild);
      } else {
        controlsArea.appendChild(btn);
      }
  
      // Create a small artwork/thumbnail placeholder that we show in audio-only mode
      let thumbnail = document.createElement('div');
      thumbnail.id = 'yt-audio-thumbnail';
      thumbnail.className = 'yt-audio-thumbnail hidden';
      thumbnail.innerHTML = '<img alt="thumbnail" id="yt-audio-thumb-img" src="" />';
      controlsArea.insertBefore(thumbnail, controlsArea.firstChild);
  
      // State flag
      state.isYtAudioOnly = state.isYtAudioOnly || false;
  
      // Apply styles dynamically (so no change needed to CSS files)
      const styleId = 'yt-audio-toggle-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          /* Audio-only mode: keep iframe but visually hide it (still audible) */
          #yt-player-container.audio-only { position: relative; }
          #yt-player-container.audio-only iframe { width: 1px !important; height: 1px !important; opacity: 0 !important; pointer-events: none !important; position: absolute !important; left: -9999px !important; }
          /* Thumbnail placeholder shown when audio-only */
          .yt-audio-thumbnail { display:inline-flex; align-items:center; gap:0.5rem; margin-right:1rem; }
          .yt-audio-thumbnail img { width:64px; height:36px; object-fit:cover; border-radius:6px; }
          .yt-audio-thumbnail.hidden { display:none; }
        `;
        document.head.appendChild(style);
      }
  
      // Helper: extract thumbnail from YT id or from state.currentYtInfo
      function setThumbnailForCurrentVideo() {
        const id = state.currentYtInfo?.id || extractYouTubeIdFromPlayer();
        const imgEl = document.getElementById('yt-audio-thumb-img');
        if (!id || !imgEl) return;
        // Use standard yt thumbnail URL (high quality thumbnail)
        imgEl.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      }
  
      function extractYouTubeIdFromPlayer() {
        // Try to get from state, fallback to parsing iframe src
        if (state.currentYtInfo && state.currentYtInfo.id) return state.currentYtInfo.id;
        const iframe = playerContainer.querySelector('iframe');
        if (!iframe) return null;
        const src = iframe.src || '';
        const m = src.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/);
        return m ? m[1] : null;
      }
  
      // Core: enable/disable audio-only
      async function setAudioOnlyMode(enable) {
        const playerContainer = document.getElementById('yt-player-container');
        const thumbnail = document.getElementById('yt-audio-thumbnail');
        const btn = document.getElementById('yt-toggle-video-btn');
  
        // Guard: Check if all required elements exist
        if (!playerContainer || !thumbnail || !btn) {
            console.warn("Audio toggle elements not found.");
            return;
        }
        
        // --- PART 1: Update UI (always do this) ---
        // This sets the button text and applies the class, even if the player isn't ready yet.
        // This is safe to call on init.
        if (enable) {
          playerContainer.classList.add('audio-only');
          thumbnail.classList.remove('hidden');
          if (state.currentYtInfo.id) { // Only set thumb if we have an ID
              setThumbnailForCurrentVideo();
          }
          btn.innerHTML = '<i class="fas fa-eye"></i> Video';
          btn.setAttribute('title','Switch to video view');
        } else {
          playerContainer.classList.remove('audio-only');
          thumbnail.classList.add('hidden');
          btn.innerHTML = '<i class="fas fa-eye-slash"></i> Audio-only';
          btn.setAttribute('title','Switch to audio-only view');
        }
  
        // --- PART 2: Handle Player and State (only if player is ready) ---
        // Guard: Check if player is ready to be commanded.
        if (!state.ytPlayer || typeof state.ytPlayer.getPlayerState !== 'function') {
            console.warn("setAudioOnlyMode: Player not ready, only UI updated.");
            // We don't set state.isYtAudioOnly here because the *user* didn't click.
            // We are just applying the *loaded* state.
            return; 
        }
        
        // If we get here, the player is ready.
        
        // This is the *actual* new state we are setting.
        state.isYtAudioOnly = !!enable; 
  
        try {
          // If the player exists and is ready, keep playback state the same.
          // We don't start/stop to avoid surprising the user. Hiding the iframe doesn't stop audio.
          if (state.ytPlayer && state.ytPlayer.getPlayerState) {
            // If the player is currently playing we keep it playing. If muted state matters, preserve it.
            // Important: Do not attempt to programmatically remove audio track; this just toggles visual.
            const PLAYER_STATE_PLAYING = 1;
            const cur = state.ytPlayer.getPlayerState();
            if (cur === PLAYER_STATE_PLAYING) {
              // nothing — leave it playing
            }
          }
        } catch (e) {
          // ignore: player not ready
          console.warn('YT player not ready while toggling audio-only', e);
        }
  
        // Persist to local state so the UI remembers
        // Ensure saveState function exists before calling it
        if (typeof saveState === 'function') {
            saveState();
        } else {
            console.warn('saveState function not found, cannot persist audio-only mode.');
        }
      }
  
      // Toggle handler
      btn.addEventListener('click', () => {
          // On user click, we toggle the *target* state.
          const targetState = !state.isYtAudioOnly;
          // The guard in setAudioOnlyMode will prevent errors if the player isn't ready.
          setAudioOnlyMode(targetState);
      });
  
      // When a new video is loaded in your app, update thumbnail and ensure audio-only class is preserved
      function onVideoLoaded() {
        // This event fires *after* onYtPlayerReady, so player is ready.
        // We just need to apply the correct state.
        setAudioOnlyMode(state.isYtAudioOnly);
      }
  
      // Hook into your existing YT load flow: whenever you call the code that sets new YT video
      // call window.dispatchEvent(new Event('aura:ytVideoLoaded')) after the new video is ready.
      window.addEventListener('aura:ytVideoLoaded', onVideoLoaded);
  
      // Initial application of saved state
      // This will just update the UI (button text, classes)
      // because the player isn't ready yet. The guard in setAudioOnlyMode will handle this.
      setAudioOnlyMode(state.isYtAudioOnly);
    }
  
    // Try to initialize now and again after DOM changes
    document.addEventListener('DOMContentLoaded', initYoutubeAudioToggle);
    // If your app dynamically loads the YT view later, call initYoutubeAudioToggle again.
    window.initYoutubeAudioToggle = initYoutubeAudioToggle;
  })();