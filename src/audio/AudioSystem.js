import { SynthEngine } from './Synths.js';
import { MusicTheory } from './MusicTheory.js';

export class AudioSystem {
    constructor() {
        this.isReady = false;
        this.musicTheory = new MusicTheory();
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

    // Method to trigger a note based on abstract parameters
    trigger(instrument, noteIndex, velocity = 1, duration = "8n") {
        if (!this.isReady) return;

        const note = this.musicTheory.quantizeToScale(noteIndex, this.musicTheory.scale);
        // Convert index to actual frequency/note name if needed, or just use the note name returned
        // The quantizer returns a note index (0-11)? No, it returns a note index relative to the scale?
        // Let's check MusicTheory.js... 
        // It returns the closest interval (0-11). We need to map that to a pitch.

        // Actually, let's refine the trigger logic in the Mapper step. 
        // For now, let's just expose the synths.
    }
}
