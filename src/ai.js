// --- SCRIPT 5: AI INTEGRATION (GEMINI API) ---

async function callAiModel(prompt, useGoogleSearch = false) {
    if (!state.settings.aiFeaturesEnabled) {
        showToast('⚠️ AI features are currently turned off. Click "AI Ready" to enable.', 'error');
        return null;
    }
    const apiKey = state.geminiApiKeys[state.currentApiKeyIndex];
    const model = 'gemini-1.5-flash-latest'; // A powerful and fast model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
    };

    // For features needing real-time info, we can enable search grounding.
    if (useGoogleSearch) {
        payload.tools = [{ "google_search": {} }];
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error('AI API Error Response:', errorBody);
            // Simple key rotation on auth/API key errors
            if (response.status === 400 || response.status === 403) {
                state.currentApiKeyIndex = (state.currentApiKeyIndex + 1) % state.geminiApiKeys.length;
                console.warn(`API key failed. Switched to key index ${state.currentApiKeyIndex}.`);
                return callAiModel(prompt, useGoogleSearch); // Retry with the next key
            }
            throw new Error(`API call failed with status ${response.status}`);
        }

        const result = await response.json();
        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
            return candidate.content.parts[0].text;
        } else {
            console.error("Unexpected AI response structure:", result);
            return "The AI returned an unexpected response. Please check the console.";
        }
    } catch (error) {
        console.error('Failed to call AI model:', error);
        return `An error occurred while contacting the AI: ${error.message}.`;
    }
}

// --- AI Feature Functions ---

async function getSongLyrics(title, artist) {
    const prompt = `Provide the complete lyrics for the song "${title}" by ${artist}. Format them clearly with proper stanza breaks (using double line breaks between stanzas). If you cannot find the exact lyrics, simply respond with: "Sorry, I couldn't find the lyrics for that song."`;
    const lyrics = await callAiModel(prompt);
    if (lyrics === null) {
        hideAiContentModal();
        return;
    }
    updateAiModalContent(lyrics);
}

async function getSongInsights(title, artist) {
    const prompt = `You are a music expert. Provide fascinating insights about the song "${title}" by ${artist}. Structure your response with the following sections, using Markdown headings: ### The Story Behind the Song, ### Musical Breakdown, and ### Fun Facts. Keep each section concise (2-3 sentences). Use Google Search to find accurate information.`;
    const insights = await callAiModel(prompt, true); // Use Google Search for up-to-date info
    if (insights === null) {
        hideAiContentModal();
        return;
    }
    updateAiModalContent(insights);
}

async function getAiDjTransition(currentSong, nextSong) {
    const prompt = `You are 'Aura DJ', an AI radio host. Create a very short, cool, and smooth transition announcement. You just played "${currentSong.title}" by ${currentSong.artist}. You are about to play "${nextSong.title}" by ${nextSong.artist}. Keep it under 25 words. For example: 'And that was the classic... now get ready for this next one!'. Be creative and vary your style.`;
    const transitionText = await callAiModel(prompt);
    
    if (transitionText === null) {
        return Promise.resolve();
    }

    if (transitionText && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(transitionText);
        speechSynthesis.speak(utterance);
        return new Promise(resolve => {
            utterance.onend = resolve;
        });
    }
    return Promise.resolve(); // Resolve immediately if speech synthesis is not available
}

async function handleAiPlaylistCreation() {
    const prompt = document.getElementById('new-playlist-name-modal').value;
    if (!prompt.trim()) {
        showToast("Please describe the playlist you want.", "error");
        return;
    }
    
    closeModalById('create-playlist-modal');
    showToast("AI is creating your playlist...", "info");

    const creationPrompt = `Create a playlist of 10 songs based on this description: "${prompt}". Your response must be a valid JSON array of objects. Each object should have two keys: "title" and "artist". Do not include any other text or explanation outside of the JSON array itself.
    Example: [{"title": "Bohemian Rhapsody", "artist": "Queen"}, {"title": "Stairway to Heaven", "artist": "Led Zeppelin"}]`;

    let responseText = await callAiModel(creationPrompt);
    if (responseText === null) return;
    
    try {
        // Clean the response to ensure it's valid JSON
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("AI did not return a valid playlist format.");
        
        const songs = JSON.parse(jsonMatch[0]);
        const playlistName = `AI: ${prompt.substring(0, 20)}...`;

        if (state.playlists[playlistName]) {
            showToast(`Playlist "${playlistName}" already exists.`, 'error');
            return;
        }

        const foundTracks = [];
        const notFoundTracks = [];
        
        songs.forEach(song => {
            const foundTrack = state.library.find(libTrack => 
                libTrack.name.toLowerCase().includes(song.title.toLowerCase()) &&
                (libTrack.artist && libTrack.artist.toLowerCase().includes(song.artist.toLowerCase()))
            );
            if (foundTrack) {
                foundTracks.push(foundTrack.id);
            } else {
                notFoundTracks.push(`${song.title} by ${song.artist}`);
            }
        });

        if (foundTracks.length > 0) {
            state.playlists[playlistName] = { name: playlistName, tracks: foundTracks };
            saveState();
            renderPlaylists(); // Update playlist UI
            showToast(`Created playlist "${playlistName}" with ${foundTracks.length} song(s) from your library!`, 'success');
            if(notFoundTracks.length > 0) {
                 setTimeout(() => showToast(`Could not find ${notFoundTracks.length} song(s) in your library.`, 'info'), 4100);
            }
            if (state.currentView === 'home') {
                renderTrackList();
            }
        } else {
            showToast("Couldn't find any of the suggested songs in your current library.", "error");
        }

    } catch (e) {
        console.error("Failed to parse AI playlist response:", e, "Response was:", responseText);
        showToast("The AI returned an invalid format for the playlist.", "error");
    }
}
