export class SynthEngine {
    constructor(destination) {
        this.destination = destination;

        // Effects Bus
        this.reverb = new Tone.Reverb({
            decay: 4,
            wet: 0.5
        }).connect(this.destination);

        this.delay = new Tone.PingPongDelay({
            delayTime: "8n",
            feedback: 0.4,
            wet: 0.3
        }).connect(this.reverb);

        this.bitCrusher = new Tone.BitCrusher(4).connect(this.delay);
        this.bitCrusher.wet.value = 0; // Start dry

        this.distortion = new Tone.Distortion(0.4).connect(this.bitCrusher);
        this.distortion.wet.value = 0;

        // Instruments

        // 1. Pad (Ambient background)
        this.pad = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "fatcustom", partials: [0.2, 1, 0, 0.5, 0.1], spread: 40, count: 3 },
            envelope: { attack: 2, decay: 1, sustain: 1, release: 2 }
        }).connect(this.reverb);
        this.pad.volume.value = -12;

        // 2. Bass (Deep, FM)
        this.bass = new Tone.FMSynth({
            harmonicity: 1,
            modulationIndex: 3.5,
            oscillator: { type: "custom", partials: [0, 1, 0, 2] },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.8, release: 0.5 },
            modulation: { type: "square" },
            modulationEnvelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.01 }
        }).connect(this.distortion);
        this.bass.volume.value = -6;

        // 3. Lead (Plucky, Arp)
        this.lead = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.02, decay: 0.1, sustain: 0.1, release: 1 }
        }).connect(this.delay);
        this.lead.volume.value = -10;

        // 4. Noise (Rhythmic Glitch)
        this.noise = new Tone.NoiseSynth({
            noise: { type: "pink" },
            envelope: { attack: 0.001, decay: 0.1, sustain: 0 }
        }).connect(this.bitCrusher);
        this.noise.volume.value = -15;
    }

    setEffectWet(effect, value) {
        if (this[effect] && this[effect].wet) {
            this[effect].wet.value = value;
        }
    }
}
