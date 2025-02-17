document.addEventListener('DOMContentLoaded', () => {
    // Settings Panel Functionality
    const settingsButton = document.querySelector('.user-profile');
    const settingsPanel = document.querySelector('.settings-panel');
    const themeToggle = document.querySelector('#theme-toggle');
    const qualitySelect = document.querySelector('#audio-quality');
    const equalizerPresets = document.querySelector('#equalizer-presets');

    // Audio Context and Nodes
    let audioContext = null;
    let equalizer = null;
    let analyser = null;
    let visualizer = null;

    // Initialize Audio Context
    function initAudioContext(context) {
        if (!context) return;
        
        audioContext = context;
        
        // Create analyser node
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        // Create a 5-band equalizer
        const frequencies = [60, 170, 350, 1000, 3500, 10000];
        equalizer = frequencies.map(freq => {
            const filter = audioContext.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1;
            filter.gain.value = 0;
            return filter;
        });

        // Connect filters in series
        equalizer.reduce((prev, curr) => {
            prev.connect(curr);
            return curr;
        });

        // Connect the last equalizer node to the analyser
        if (equalizer.length > 0) {
            equalizer[equalizer.length - 1].connect(analyser);
            analyser.connect(audioContext.destination);
        }

        // Initialize visualizer after audio context is set up
        if (!visualizer) {
            visualizer = new AudioVisualizer(document.querySelector('.visualizer'), analyser);
        }
    }

    // Settings Event Listeners
    if (settingsButton && settingsPanel) {
        settingsButton.addEventListener('click', () => {
            settingsPanel.classList.toggle('show');
        });
    }

    // Theme Toggle
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            document.body.classList.toggle('light-theme');
            localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
        });
    }

    // Audio Quality
    if (qualitySelect) {
        qualitySelect.addEventListener('change', (e) => {
            const quality = e.target.value;
            localStorage.setItem('audioQuality', quality);
        });
    }

    // Equalizer Presets
    if (equalizerPresets) {
        equalizerPresets.addEventListener('change', (e) => {
            const preset = e.target.value;
            applyEqualizerPreset(preset);
        });
    }

    // Equalizer Presets
    const presets = {
        flat: [0, 0, 0, 0, 0],
        rock: [4, 3, -2, 2, 3],
        pop: [-1, 2, 3, 2, -1],
        classical: [3, 2, -1, 1, 2],
        jazz: [2, -1, 1, 3, 2]
    };

    function applyEqualizerPreset(preset) {
        if (!equalizer) return;
        
        const gains = presets[preset] || presets.flat;
        equalizer.forEach((filter, index) => {
            if (gains[index] !== undefined) {
                filter.gain.setValueAtTime(gains[index], audioContext.currentTime);
            }
        });
        
        localStorage.setItem('equalizerPreset', preset);
    }

    // Audio Visualizer Class
    class AudioVisualizer {
        constructor(canvas, analyserNode) {
            this.canvas = canvas;
            if (canvas) {
                this.ctx = canvas.getContext('2d');
            }
            this.analyser = analyserNode;
            this.isActive = false;
            
            if (this.analyser) {
                this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            }
        }

        start() {
            if (!this.canvas || !this.analyser) return;
            
            this.isActive = true;
            this.draw();
        }

        stop() {
            this.isActive = false;
        }

        draw() {
            if (!this.isActive || !this.canvas || !this.analyser) return;

            const width = this.canvas.width;
            const height = this.canvas.height;
            const barWidth = width / this.analyser.frequencyBinCount;

            this.ctx.clearRect(0, 0, width, height);
            this.analyser.getByteFrequencyData(this.dataArray);

            this.ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--primary-color');
            
            for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
                const barHeight = (this.dataArray[i] / 255) * height;
                const x = i * barWidth;
                const y = height - barHeight;
                
                this.ctx.fillRect(x, y, barWidth - 1, barHeight);
            }

            if (this.isActive) {
                requestAnimationFrame(() => this.draw());
            }
        }
    }

    // Load saved settings
    function loadSavedSettings() {
        // Theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light' && themeToggle) {
            document.body.classList.add('light-theme');
            themeToggle.checked = true;
        }

        // Audio Quality
        const savedQuality = localStorage.getItem('audioQuality');
        if (savedQuality && qualitySelect) {
            qualitySelect.value = savedQuality;
        }

        // Equalizer Preset
        const savedPreset = localStorage.getItem('equalizerPreset');
        if (savedPreset && equalizerPresets) {
            equalizerPresets.value = savedPreset;
            applyEqualizerPreset(savedPreset);
        }
    }

    // Export for use in main script
    window.musicSettings = {
        initAudioContext,
        visualizer,
        loadSavedSettings
    };

    // Close settings panel when clicking outside
    document.addEventListener('click', (e) => {
        if (settingsPanel && settingsButton) {
            const isClickInside = settingsPanel.contains(e.target) || settingsButton.contains(e.target);
            if (!isClickInside && settingsPanel.classList.contains('show')) {
                settingsPanel.classList.remove('show');
            }
        }
    });
});
