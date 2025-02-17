document.addEventListener('DOMContentLoaded', () => {
    // Previous audio context and DOM elements initialization remains the same

    // New DOM Elements for Music Submission
    const submitMusicBtn = document.querySelector('.submit-music-btn');
    const submitMusicForm = document.querySelector('.submit-music-form');
    const musicSubmissionForm = document.querySelector('#music-submission');
    const genreLinks = document.querySelectorAll('.genre-section li');

    // State
    let isPlaying = false;
    let shuffle = false;
    let repeat = false;
    let currentTrack = null;
    let currentGenre = null;

    // Initialize settings
    if (window.musicSettings) {
        window.musicSettings.loadSavedSettings();
    }

    // Music Submission Form Toggle
    if (submitMusicBtn) {
        submitMusicBtn.addEventListener('click', () => {
            submitMusicForm.classList.toggle('hidden');
        });
    }

    // Music Submission Handler
    if (musicSubmissionForm) {
        musicSubmissionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(musicSubmissionForm);
            const trackData = {
                title: formData.get('track-title'),
                artist: formData.get('artist-name'),
                genre: formData.get('genre'),
                bpm: formData.get('bpm'),
                file: formData.get('track-file'),
                artwork: formData.get('artwork')
            };

            // Here you would typically send this data to a server
            console.log('Track submitted:', trackData);

            // Show success message
            alert('Track submitted successfully! It will be reviewed by our team.');
            
            // Reset form and hide it
            musicSubmissionForm.reset();
            submitMusicForm.classList.add('hidden');
        });
    }

    // Genre Navigation
    genreLinks.forEach(genreLink => {
        genreLink.addEventListener('click', () => {
            const genre = genreLink.textContent.trim().toLowerCase();
            currentGenre = genre;
            
            // Update active state
            genreLinks.forEach(link => link.classList.remove('active'));
            genreLink.classList.add('active');

            // Filter tracks by genre
            filterTracksByGenre(genre);
        });
    });

    function filterTracksByGenre(genre) {
        const tracks = document.querySelectorAll('.track-item');
        tracks.forEach(track => {
            const trackGenre = track.dataset.genre;
            if (trackGenre === genre || genre === 'all') {
                track.style.display = 'flex';
            } else {
                track.style.display = 'none';
            }
        });
    }

    // Enhanced Search Function
    function handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        // Search in tracks
        trackItems.forEach(track => {
            const title = track.querySelector('h4').textContent.toLowerCase();
            const artist = track.querySelector('p').textContent.toLowerCase();
            const genre = track.dataset.genre?.toLowerCase();
            const bpm = track.dataset.bpm;
            
            if (title.includes(searchTerm) || 
                artist.includes(searchTerm) || 
                genre?.includes(searchTerm) ||
                bpm?.includes(searchTerm)) {
                track.style.display = 'flex';
            } else {
                track.style.display = 'none';
            }
        });
        
        // Search in playlists
        playlistCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const genre = card.dataset.genre?.toLowerCase();
            
            if (title.includes(searchTerm) || 
                description.includes(searchTerm) || 
                genre?.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Enhanced Track Playing
    function playTrack(trackElement) {
        if (!audioContext) {
            initAudioContext();
        }

        // Update current track
        if (currentTrack) {
            currentTrack.classList.remove('active');
        }
        currentTrack = trackElement;
        currentTrack.classList.add('active');
        
        // Update now playing section
        const trackImg = trackElement.querySelector('img').src;
        const trackTitle = trackElement.querySelector('h4').textContent;
        const trackArtist = trackElement.querySelector('p').textContent;
        const trackGenre = trackElement.dataset.genre;
        const trackBpm = trackElement.dataset.bpm;
        
        const nowPlaying = document.querySelector('.now-playing');
        nowPlaying.querySelector('img').src = trackImg;
        nowPlaying.querySelector('.track-info h4').textContent = trackTitle;
        nowPlaying.querySelector('.track-info p').textContent = trackArtist;

        // Update track details
        const trackDetails = nowPlaying.querySelector('.track-details');
        if (trackDetails) {
            trackDetails.innerHTML = `
                <span class="genre-tag">${trackGenre}</span>
                <span class="bpm-display">${trackBpm} BPM</span>
            `;
        }
        
        // Start playing
        if (!isPlaying) {
            togglePlay();
        }

        // Apply genre-specific equalizer preset
        if (window.musicSettings && trackGenre) {
            const equalizerPresets = document.querySelector('#equalizer-presets');
            if (equalizerPresets) {
                equalizerPresets.value = trackGenre.toLowerCase();
                window.musicSettings.applyEqualizerPreset(trackGenre.toLowerCase());
            }
        }
    }

    // Previous event listeners and functions remain the same
});
