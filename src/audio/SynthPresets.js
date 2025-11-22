// Synth Preset Configurations
// Defines various synth types for lead, bass, and pad instruments

export const LEAD_PRESETS = {
    saw: {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.5 },
        portamento: 0.01
    },
    square: {
        oscillator: { type: 'square' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.4, release: 0.3 },
        portamento: 0
    },
    fm: {
        oscillator: {
            type: 'fmsquare',
            modulationType: 'sine',
            modulationIndex: 10,
            harmonicity: 2
        },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.4 }
    },
    pluck: {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.001, decay: 0.15, sustain: 0.0, release: 0.3 },
        portamento: 0
    },
    arp: {
        oscillator: { type: 'pwm', modulationFrequency: 1 },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.5, release: 0.2 },
        portamento: 0.02
    },
    soft: {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.7, release: 0.8 },
        portamento: 0.05
    },
    detuned: {
        oscillator: { type: 'fatsawtooth', spread: 40, count: 3 },
        envelope: { attack: 0.02, decay: 0.2, sustain: 0.4, release: 0.6 },
        portamento: 0.03
    },
    noise: {
        oscillator: { type: 'amsine', modulationType: 'square', harmonicity: 0.5 },
        envelope: { attack: 0.005, decay: 0.2, sustain: 0.3, release: 0.4 },
        portamento: 0
    }
};

export const BASS_PRESETS = {
    sub: {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.8 },
        filterEnvelope: {
            baseFrequency: 100,
            octaves: 2,
            attack: 0.01,
            decay: 0.3,
            sustain: 0.1,
            release: 0.5
        }
    },
    saw: {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.005, decay: 0.2, sustain: 0.4, release: 0.5 },
        filterEnvelope: {
            baseFrequency: 200,
            octaves: 3,
            attack: 0.01,
            decay: 0.2,
            sustain: 0.2,
            release: 0.4
        }
    },
    fm: {
        oscillator: {
            type: 'fmsine',
            modulationType: 'square',
            modulationIndex: 8,
            harmonicity: 0.5
        },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.6 }
    },
    pluck: {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0.0, release: 0.3 },
        filterEnvelope: {
            baseFrequency: 400,
            octaves: 4,
            attack: 0.001,
            decay: 0.15,
            sustain: 0,
            release: 0.2
        }
    },
    wobble: {
        oscillator: { type: 'fatsawtooth', spread: 30, count: 3 },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.5 },
        filterEnvelope: {
            baseFrequency: 100,
            octaves: 4,
            attack: 0.01,
            decay: 0.1,
            sustain: 0.5,
            release: 0.3
        }
    },
    reese: {
        oscillator: { type: 'fatsawtooth', spread: 60, count: 5 },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.6, release: 0.7 },
        filterEnvelope: {
            baseFrequency: 150,
            octaves: 2.5,
            attack: 0.02,
            decay: 0.2,
            sustain: 0.4,
            release: 0.5
        }
    }
};

export const PAD_PRESETS = {
    warm: {
        oscillator: {
            type: 'fatcustom',
            partials: [0.2, 1, 0, 0.5, 0.1],
            spread: 40,
            count: 3
        },
        envelope: { attack: 2, decay: 1, sustain: 1, release: 2 }
    },
    string: {
        oscillator: { type: 'fatsawtooth', spread: 20, count: 4 },
        envelope: { attack: 1.5, decay: 0.5, sustain: 0.9, release: 2.5 }
    },
    choir: {
        oscillator: {
            type: 'fatcustom',
            partials: [1, 0.5, 0.3, 0.2, 0.1],
            spread: 30,
            count: 5
        },
        envelope: { attack: 2.5, decay: 0.8, sustain: 0.95, release: 3 }
    },
    dark: {
        oscillator: { type: 'fatsquare', spread: 50, count: 3 },
        envelope: { attack: 1.8, decay: 1.2, sustain: 0.85, release: 2.8 }
    },
    shimmer: {
        oscillator: {
            type: 'amsine',
            modulationType: 'sine',
            harmonicity: 2
        },
        envelope: { attack: 2.2, decay: 0.5, sustain: 0.9, release: 3.5 }
    }
};

// Human-readable names for UI
export const LEAD_NAMES = {
    saw: 'Saw Lead',
    square: 'Square Wave',
    fm: 'FM Bell',
    pluck: 'Pluck',
    arp: 'Arp Synth',
    soft: 'Soft Lead',
    detuned: 'Detuned',
    noise: 'Noise Lead'
};

export const BASS_NAMES = {
    sub: 'Sub Bass',
    saw: 'Saw Bass',
    fm: 'FM Bass',
    pluck: 'Pluck Bass',
    wobble: 'Wobble',
    reese: 'Reese Bass'
};

export const PAD_NAMES = {
    warm: 'Warm Pad',
    string: 'String Pad',
    choir: 'Choir Pad',
    dark: 'Dark Pad',
    shimmer: 'Shimmer Pad'
};
