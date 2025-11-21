export const SCALES = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    pentatonic: [0, 2, 4, 7, 9],
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
};

export const CHORDS = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    dim: [0, 3, 6],
    aug: [0, 4, 8],
    maj7: [0, 4, 7, 11],
    min7: [0, 3, 7, 10],
    dom7: [0, 4, 7, 10]
};

export class MusicTheory {
    constructor() {
        this.root = "C";
        this.octave = 3;
        this.scale = "minor";
        this.notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    }

    getScaleNotes(root, scaleName) {
        const rootIndex = this.notes.indexOf(root);
        const intervals = SCALES[scaleName];
        return intervals.map(interval => {
            const noteIndex = (rootIndex + interval) % 12;
            return this.notes[noteIndex];
        });
    }

    quantizeToScale(noteIndex, scaleName) {
        // Simple quantizer: map 0-11 input to nearest scale degree
        const intervals = SCALES[scaleName];
        // Find closest interval
        const closest = intervals.reduce((prev, curr) => {
            return (Math.abs(curr - noteIndex) < Math.abs(prev - noteIndex) ? curr : prev);
        });
        return closest;
    }

    // Get a random note from the current scale in a specific octave range
    getRandomNote(minOctave, maxOctave) {
        const scaleNotes = this.getScaleNotes(this.root, this.scale);
        const note = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
        const octave = Math.floor(Math.random() * (maxOctave - minOctave + 1)) + minOctave;
        return note + octave;
    }

    // Get a chord from the scale
    getChord(degree, type = 'min7') {
        // Simplified chord generation
        const scaleNotes = this.getScaleNotes(this.root, this.scale);
        const rootNote = scaleNotes[degree % scaleNotes.length];
        // This is a very basic implementation, real chord theory is more complex
        // but for generative ambient, this often works well enough if we stick to the scale
        return [rootNote + "3", scaleNotes[(degree + 2) % scaleNotes.length] + "3", scaleNotes[(degree + 4) % scaleNotes.length] + "3"];
    }
}
