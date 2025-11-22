import { SynthEngine } from './Synths.js';
import { MusicTheory } from './MusicTheory.js';

export class AudioSystem {
    constructor() {
        this.isReady = false;
        this.musicTheory = new MusicTheory();
        this.progression = null; // Will be set by Composer
    }


    init() {
        // Create a Master Limiter to prevent clipping
        this.limiter = new Tone.Limiter(-1).toDestination();
        this.masterVolume = new Tone.Volume(-10).connect(this.limiter);

        // Initialize Synth Engine
        this.synths = new SynthEngine(this.masterVolume);

        console.log('AUDIO_SYSTEM_ONLINE');
        this.isReady = true;

        // Bind Volume Control
        const volSlider = document.getElementById('master-vol');
        if (volSlider) {
            volSlider.addEventListener('input', (e) => {
                this.masterVolume.volume.value = e.target.value;
            });
        }
    }

    // Control Methods
    setInstrumentVolume(instrument, value) {
        if (this.synths && this.synths[instrument + 'Vol']) {
            this.synths[instrument + 'Vol'].volume.value = value;
        }
    }

    toggleInstrument(instrument, isActive) {
        if (this.synths && this.synths[instrument + 'Vol']) {
            this.synths[instrument + 'Vol'].mute = !isActive;
        }
    }

    setScale(scaleName) {
        if (this.musicTheory) {
            this.musicTheory.scale = scaleName;
        }
    }

    setRoot(rootNote) {
        if (this.musicTheory) {
            this.musicTheory.root = rootNote;
        }
    }

    // Synth Switching Methods
    setLeadType(type) {
        if (this.synths) {
            this.synths.switchLeadType(type);
        }
    }

    setBassType(type) {
        if (this.synths) {
            this.synths.switchBassType(type);
        }
    }

    setPadType(type) {
        if (this.synths) {
            this.synths.switchPadType(type);
        }
    }

    // Method to trigger a note based on abstract parameters
    trigger(instrument, noteIndex, velocity = 1, duration = "8n") {
        if (!this.isReady) return;
        // Triggering is handled in Mapper for now
    }
}
