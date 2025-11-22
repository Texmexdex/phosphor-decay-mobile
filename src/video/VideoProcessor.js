export class VideoProcessor {
    constructor(videoInput) {
        this.videoInput = videoInput;
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

        // Offscreen canvas for feedback loop
        this.feedbackCanvas = document.createElement('canvas');
        this.feedbackCtx = this.feedbackCanvas.getContext('2d');

        this.isPlaying = false;

        // Effect Parameters
        this.params = {
            feedback: 0.92, // 0 to 1
            feedbackZoom: 1.01, // Scale factor for feedback
            rgbShift: 0, // Pixel offset
            glitchProb: 0.0, // Probability of glitch trigger
            brightnessThreshold: 100,
        };

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Resize when video dimensions are loaded
        this.videoInput.onMetadataLoaded = () => {
            this.resize();
        };

        // Link to audio synths for feedback delay sync
        this.audioSynths = null;

        this.loop = this.loop.bind(this);
    }

    /**
     * Set audio synths reference for feedback delay sync
     */
    setAudioSynths(synths) {
        this.audioSynths = synths;
    }

    /**
     * Sync audio delay with video feedback amount
     * Creates layered echo effect matching visual feedback
     */
    syncAudioWithVideoFeedback() {
        if (!this.audioSynths || !this.audioSynths.feedbackDelay) return;

        const feedback = this.params.feedback;
        // Calculate delay based on feedback amount
        // More feedback = more layers = longer delay
        const baseDelay = 0.05; // 50ms base
        const maxDelay = 0.3; // 300ms max
        const delayTime = baseDelay + (feedback * (maxDelay - baseDelay));

        // Wet amount follows feedback (more feedback = more audible delay)
        const wetAmount = feedback * 0.6;

        this.audioSynths.feedbackDelay.delayTime.rampTo(delayTime, 0.1);
        this.audioSynths.feedbackDelay.wet.rampTo(wetAmount, 0.1);
    }

    resize() {
        const container = this.canvas.parentElement;
        const video = this.videoInput.videoElement;

        // If video is loaded, match its aspect ratio
        if (video && video.videoWidth && video.videoHeight) {
            const videoAspect = video.videoWidth / video.videoHeight;
            const containerAspect = container.clientWidth / container.clientHeight;

            if (containerAspect > videoAspect) {
                // Container is wider - fit to height
                this.canvas.height = container.clientHeight;
                this.canvas.width = container.clientHeight * videoAspect;
            } else {
                // Container is taller - fit to width
                this.canvas.width = container.clientWidth;
                this.canvas.height = container.clientWidth / videoAspect;
            }
        } else {
            // Fallback: fill container
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
        }

        this.feedbackCanvas.width = this.canvas.width;
        this.feedbackCanvas.height = this.canvas.height;
    }

    start() {
        this.isPlaying = true;
        this.loop();
    }

    stop() {
        this.isPlaying = false;
    }

    loop() {
        if (!this.isPlaying) return;

        const width = this.canvas.width;
        const height = this.canvas.height;

        // 1. Draw Feedback (Previous Frame)
        if (this.params.feedback > 0) {
            this.ctx.save();
            this.ctx.globalAlpha = this.params.feedback;

            // Zoom/Rotate feedback
            const zoom = this.params.feedbackZoom;
            this.ctx.translate(width / 2, height / 2);
            this.ctx.scale(zoom, zoom);
            this.ctx.translate(-width / 2, -height / 2);

            this.ctx.drawImage(this.feedbackCanvas, 0, 0);
            this.ctx.restore();
        }

        // 2. Draw New Video Frame
        const videoEl = this.videoInput.getVideoElement();
        if (videoEl && videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
            this.ctx.globalAlpha = 1.0;
            // Blend mode for "Glitch" feel?
            // this.ctx.globalCompositeOperation = 'difference'; 
            this.ctx.drawImage(videoEl, 0, 0, width, height);
            // this.ctx.globalCompositeOperation = 'source-over';
        }

        // 3. Apply Glitch Effects
        if (this.params.rgbShift > 0 || Math.random() < this.params.glitchProb) {
            this.applyGlitch(width, height);
        }

        // 4. Save current frame to feedback buffer
        this.feedbackCtx.clearRect(0, 0, width, height);
        this.feedbackCtx.drawImage(this.canvas, 0, 0);

        requestAnimationFrame(this.loop);
    }

    applyGlitch(width, height) {
        const imageData = this.ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // RGB Shift
        const shift = Math.floor(this.params.rgbShift + (Math.random() * 10 * this.params.glitchProb));

        if (shift > 0) {
            const copy = new Uint8ClampedArray(data);
            for (let i = 0; i < data.length; i += 4) {
                // Red channel shift
                const rIndex = i + (shift * 4);
                if (rIndex < data.length) {
                    data[i] = copy[rIndex];
                }

                // Blue channel shift (opposite direction)
                const bIndex = i - (shift * 4);
                if (bIndex >= 0) {
                    data[i + 2] = copy[bIndex + 2];
                }
            }
        }

        // Scanline Displacement (Glitch Core)
        if (Math.random() < this.params.glitchProb) {
            const y = Math.floor(Math.random() * height);
            const h = Math.floor(Math.random() * 50) + 1;
            const offset = Math.floor((Math.random() - 0.5) * 100);

            // We can't easily shift rows in ImageData without complex math, 
            // so let's do it with drawImage for performance in the next frame or use putImageData with offset
            // But for pixel manipulation:
            // Simple row shift in the array
        }

        this.ctx.putImageData(imageData, 0, 0);
    }
}
