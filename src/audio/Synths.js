import { LEAD_PRESETS, BASS_PRESETS, PAD_PRESETS } from './SynthPresets.js';

export class SynthEngine {
    constructor(destination) {
        this.destination = destination;

        // Detect mobile for performance optimization
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                        || window.innerWidth <= 768;

        // Effects Bus
        this.reverb = new Tone.Reverb({
            decay: this.isMobile ? 2 : 4, // Shorter reverb on mobile
            wet: 0.5
        }).connect(this.destination);

        this.delay = new Tone.PingPongDelay({
            delayTime: "8n",
            feedback: 0.4,
            wet: 0.3
        }).connect(this.reverb);

        // Feedback Delay - syncs with video feedback for infinity mirror effect
        this.feedbackDelay = new Tone.FeedbackDelay({
            delayTime: 0.1, // Will be controlled by video feedback amount
            feedback: 0.5,
            wet: 0
        }).connect(this.delay);

        this.bitCrusher = new Tone.BitCrusher(4).connect(this.feedbackDelay);
        this.bitCrusher.wet.value = 0; // Start dry

        this.distortion = new Tone.Distortion(0.4).connect(this.bitCrusher);
        this.distortion.wet.value = 0;

        // Instruments (reduced polyphony on mobile)
        const maxPolyphony = this.isMobile ? 4 : 8;

        // 1. Pad (Ambient background)
        this.padVol = new Tone.Volume(-12).connect(this.reverb);
        this.currentPadType = 'warm';
        this.pad = new Tone.PolySynth(Tone.Synth, {
            ...PAD_PRESETS[this.currentPadType],
            maxPolyphony: maxPolyphony
        }).connect(this.padVol);

        // 2. Bass (Deep, FM)
        this.bassVol = new Tone.Volume(-6).connect(this.distortion);
        this.currentBassType = 'sub';
        this.bass = new Tone.MonoSynth(BASS_PRESETS[this.currentBassType]).connect(this.bassVol);

        // 3. Lead (Plucky, Arp)
        this.leadVol = new Tone.Volume(-10).connect(this.delay);
        this.currentLeadType = 'saw';
        this.lead = new Tone.PolySynth(Tone.Synth, {
            ...LEAD_PRESETS[this.currentLeadType],
            maxPolyphony: maxPolyphony
        }).connect(this.leadVol);

        // 4. Noise (Rhythmic Glitch)
        this.noiseVol = new Tone.Volume(-15).connect(this.bitCrusher);
        this.noise = new Tone.NoiseSynth({
            noise: { type: "pink" },
            envelope: { attack: 0.001, decay: 0.1, sustain: 0 }
        }).connect(this.noiseVol);
    }

    setEffectWet(effect, value) {
        if (this[effect] && this[effect].wet) {
            this[effect].wet.value = value;
        }
    }

    /**
     * Switch lead synth type
     */
    switchLeadType(type) {
        if (!LEAD_PRESETS[type]) {
            console.warn(`Unknown lead type: ${type}`);
            return;
        }

        // Dispose old synth
        this.lead.dispose();

        // Create new synth with preset
        this.lead = new Tone.PolySynth(Tone.Synth, LEAD_PRESETS[type]).connect(this.leadVol);
        this.currentLeadType = type;
        console.log(`Switched to lead type: ${type}`);
    }

    /**
     * Switch bass synth type
     */
    switchBassType(type) {
        if (!BASS_PRESETS[type]) {
            console.warn(`Unknown bass type: ${type}`);
            return;
        }

        // Dispose old synth
        this.bass.dispose();

        // Create new synth with preset
        this.bass = new Tone.MonoSynth(BASS_PRESETS[type]).connect(this.bassVol);
        this.currentBassType = type;
        console.log(`Switched to bass type: ${type}`);
    }

    /**
     * Switch pad synth type
     */
    switchPadType(type) {
        if (!PAD_PRESETS[type]) {
            console.warn(`Unknown pad type: ${type}`);
            return;
        }

        // Dispose old synth
        this.pad.dispose();

        // Create new synth with preset
        this.pad = new Tone.PolySynth(Tone.Synth, PAD_PRESETS[type]).connect(this.padVol);
        this.currentPadType = type;
        console.log(`Switched to pad type: ${type}`);
    }
}
