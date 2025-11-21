export class Mapper {
    constructor(audioSystem, analyzer) {
        this.audioSystem = audioSystem;
        this.analyzer = analyzer;

        this.isRunning = false;
        this.clock = 0;

        // Sequencer State
        this.step = 0;
        this.totalSteps = 16;

        // Thresholds
        this.motionThreshold = 0.15;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        // Start Tone Transport
        Tone.Transport.start();

        // Schedule a loop
        this.loopId = Tone.Transport.scheduleRepeat((time) => {
            this.update(time);
        }, "16n");
    }

    stop() {
        this.isRunning = false;
        Tone.Transport.clear(this.loopId);
        Tone.Transport.stop();
    }

    update(time) {
        const grid = this.analyzer.analyze();

        // Global stats
        const totalMotion = grid.reduce((sum, cell) => sum + cell.motion, 0) / grid.length;

        // 1. Bass Control (Bottom Row)
        // Use average brightness of bottom row to modulate Bass Filter or FM Index
        const bottomRow = grid.filter(c => c.y === this.analyzer.rows - 1);
        const avgBottomBright = bottomRow.reduce((sum, c) => sum + c.brightness, 0) / bottomRow.length;

        // Modulate Bass
        // this.audioSystem.synths.bass.modulationIndex.rampTo(avgBottomBright * 10, 0.1);

        // 2. Step Sequencer Logic
        // We are on step (0-15). Check the corresponding column? 
        // Or just check active cells.

        // Let's use a "Scanner" approach. The step corresponds to a column (if 4 cols, step % 4).
        const colIndex = this.step % this.analyzer.cols;
        const activeCol = grid.filter(c => c.x === colIndex);

        activeCol.forEach(cell => {
            if (cell.motion > this.motionThreshold) {
                // Trigger based on Y position
                // Top (0) -> High Lead
                // Mid (1,2) -> Pad / Arp
                // Bottom (3) -> Bass / Kick

                if (cell.y === 0) {
                    // Lead
                    const note = this.audioSystem.musicTheory.getRandomNote(4, 5);
                    this.audioSystem.synths.lead.triggerAttackRelease(note, "16n", time);
                } else if (cell.y === 1 || cell.y === 2) {
                    // Pad / Chord
                    // Only trigger occasionally or if motion is high
                    if (Math.random() > 0.5) {
                        const chord = this.audioSystem.musicTheory.getChord(Math.floor(cell.brightness * 7));
                        // this.audioSystem.synths.pad.triggerAttackRelease(chord, "8n", time);
                        // Pad is better sustained, maybe just trigger Arp here
                        const note = this.audioSystem.musicTheory.getRandomNote(3, 4);
                        this.audioSystem.synths.pad.triggerAttackRelease(note, "8n", time);
                    }
                } else if (cell.y === 3) {
                    // Bass
                    const note = this.audioSystem.musicTheory.getRandomNote(1, 2);
                    this.audioSystem.synths.bass.triggerAttackRelease(note, "8n", time);
                }
            }

            // Glitch / Noise Trigger (Random high motion anywhere)
            if (cell.motion > 0.4) {
                this.audioSystem.synths.noise.triggerAttackRelease("16n", time);
            }
        });

        this.step = (this.step + 1) % this.totalSteps;
    }
}
