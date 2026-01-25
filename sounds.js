/**
 * SoundManager handles all audio effects for the game.
 * Uses Web Audio API to synthesize sounds on the fly.
 * v1.2.0 (build 260125)
 */
class SoundManager {
    constructor() {
        this.isMuted = localStorage.getItem('gameMuted') === 'true';
        this.masterVolume = parseFloat(localStorage.getItem('gameVolume')) || 1;
        this.audioCtx = null;
    }

    /**
     * Lazy initialize AudioContext on first interaction
     */
    initContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    /**
     * Play a synthesized sound by name
     */
    play(name) {
        if (this.isMuted) return;
        this.initContext();

        const oscillators = {
            place: () => this.beep(300, 0.1, 'sine', 0.3), // Brighter, shorter sound
            clear: () => {
                this.beep(440, 0.1, 'triangle', 0.2); // Increased from 0.1
                setTimeout(() => this.beep(880, 0.1, 'triangle', 0.2), 100);
            },
            combo: () => {
                this.beep(523.25, 0.05, 'square', 0.1); // Increased from 0.05
                setTimeout(() => this.beep(659.25, 0.05, 'square', 0.1), 50);
                setTimeout(() => this.beep(783.99, 0.05, 'square', 0.1), 100);
            },
            select: () => this.beep(300, 0.02, 'sine', 0.1), // Increased from 0.05
            pickup: () => this.beep(600, 0.05, 'sine', 0.15),
            click: () => this.beep(400, 0.05, 'sine', 0.2), // Increased from 0.1
            gameOver: () => {
                this.beep(200, 0.2, 'sawtooth', 0.2); // Increased from 0.1
                setTimeout(() => this.beep(150, 0.2, 'sawtooth', 0.2), 200);
                setTimeout(() => this.beep(100, 0.4, 'sawtooth', 0.2), 400);
            },
            invalid: () => this.beep(150, 0.15, 'sawtooth', 0.15) // Low pitch "error" sound
        };

        if (oscillators[name]) {
            oscillators[name]();
        }
    }

    setVolume(value) {
        this.masterVolume = value;
        localStorage.setItem('gameVolume', value);
    }

    /**
     * Helper to create a simple beep
     */
    beep(freq, duration, type, baseVolume) {
        if (!this.audioCtx) return;

        const effectiveVolume = baseVolume * this.masterVolume * 2; // Extra boost

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        gain.gain.setValueAtTime(effectiveVolume, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('gameMuted', this.isMuted);
        return this.isMuted;
    }
}

// Global instance for the game
const gameSounds = new SoundManager();

