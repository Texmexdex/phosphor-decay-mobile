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
        this.brightnessThreshold = 0.6;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        // Start Tone Transport only if not already started
        if (Tone.Transport.state !== 'started') {
            Tone.Transport.start();
        }

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
                if (cell.y === 0) {
                    if (!this.audioSystem.synths.leadVol.mute) {
                        const note = this.audioSystem.musicTheory.getRandomNote(4, 5);
                        this.audioSystem.synths.lead.triggerAttackRelease(note, "16n", time);
                    }
                }
                // Mid (1,2) -> Pad / Arp
                else if (cell.y === 1 || cell.y === 2) {
                    if (!this.audioSystem.synths.padVol.mute) {
                        // Trigger if brightness is high enough or random chance
                        if (cell.brightness > this.brightnessThreshold || Math.random() > 0.7) {
                            const note = this.audioSystem.musicTheory.getRandomNote(3, 4);
                            this.audioSystem.synths.pad.triggerAttackRelease(note, "8n", time);
                        }
                    }
                }
                // Bottom (3) -> Bass / Kick
                else if (cell.y === 3) {
                    if (!this.audioSystem.synths.bassVol.mute) {
                        const note = this.audioSystem.musicTheory.getRandomNote(1, 2);
                        this.audioSystem.synths.bass.triggerAttackRelease(note, "8n", time);
                    }
                }
            }

            // Glitch / Noise Trigger (Random high motion anywhere)
            if (cell.motion > 0.4 && !this.audioSystem.synths.noiseVol.mute) {
                this.audioSystem.synths.noise.triggerAttackRelease("16n", time);
            }
        });

        this.step = (this.step + 1) % this.totalSteps;
    }
}
