import { ShapeGenerator } from './ShapeGenerator.js';
import { DrawingSystem } from './DrawingSystem.js';

export class VideoProcessor {
    constructor(videoInput) {
        this.videoInput = videoInput;
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

        // Offscreen canvas for feedback loop
        this.feedbackCanvas = document.createElement('canvas');
        this.feedbackCtx = this.feedbackCanvas.getContext('2d');

        this.isPlaying = false;

        // Detect mobile for performance optimization
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                        || window.innerWidth <= 768;

        // Effect Parameters (optimized for mobile)
        this.params = {
            feedback: 0.92, // 0 to 1
            feedbackZoom: this.isMobile ? 1.0 : 1.01, // No zoom growth on mobile to prevent bleeding
            feedbackRotation: 0, // Degrees per frame
            feedbackRotationVelocity: 0, // Continuous rotation speed
            feedbackPanX: 0, // Pixels
            feedbackPanY: 0, // Pixels
            feedbackPanVelocityX: 0, // Continuous pan speed X
            feedbackPanVelocityY: 0, // Continuous pan speed Y
            rgbShift: 0, // Pixel offset
            glitchProb: 0.0, // Probability of glitch trigger
            brightnessThreshold: 100,
            targetFPS: this.isMobile ? 30 : 60, // Lower FPS on mobile
            // New effects
            invert: 0, // 0 to 1
            contrast: 1, // 0.5 to 2
            brightness: 1, // 0.5 to 2
            hueShift: 0, // 0 to 360
            hueShiftSpeed: 0, // Auto hue rotation
            pixelate: 1, // 1 to 20 (pixel size)
            kaleidoscope: 0, // 0 to 8 (number of mirrors)
            colorChase: 0, // 0 to 1 (color trailing effect)
            colorChaseSpeed: 1, // Speed of color propagation
        };

        // Frame timing for FPS control
        this.lastFrameTime = 0;
        this.frameInterval = 1000 / this.params.targetFPS;

        // Initialize ShapeGenerator
        this.shapeGenerator = new ShapeGenerator();

        // Initialize DrawingSystem
        this.drawingSystem = new DrawingSystem();

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Resize when video dimensions are loaded
        this.videoInput.onMetadataLoaded = () => {
            this.resize();
        };

        // Link to audio synths for feedback delay sync
        this.audioSynths = null;

        // Link to visual sequencer for fractal-driven audio
        this.visualSequencer = null;

        this.loop = this.loop.bind(this);
    }

    /**
     * Set audio synths reference for feedback delay sync
     */
    setAudioSynths(synths) {
        this.audioSynths = synths;
    }

    /**
     * Set visual sequencer reference for fractal-driven mode
     */
    setVisualSequencer(visualSequencer) {
        this.visualSequencer = visualSequencer;
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

        // Lower pixel ratio on mobile for better performance
        let pixelRatio = window.devicePixelRatio || 1;
        if (this.isMobile) {
            pixelRatio = Math.min(pixelRatio, 1.5); // Cap at 1.5x on mobile
        }
        
        // If video is loaded, match its aspect ratio
        if (video && video.videoWidth && video.videoHeight) {
            const videoAspect = video.videoWidth / video.videoHeight;
            const containerAspect = container.clientWidth / container.clientHeight;

            if (containerAspect > videoAspect) {
                // Container is wider - fit to height
                this.canvas.height = container.clientHeight * pixelRatio;
                this.canvas.width = container.clientHeight * videoAspect * pixelRatio;
            } else {
                // Container is taller - fit to width
                this.canvas.width = container.clientWidth * pixelRatio;
                this.canvas.height = container.clientWidth / videoAspect * pixelRatio;
            }
        } else {
            // Fallback: fill container (lower resolution on mobile)
            const width = (container.clientWidth || 800) * pixelRatio;
            const height = (container.clientHeight || 600) * pixelRatio;
            this.canvas.width = width;
            this.canvas.height = height;
            console.log('CANVAS_SIZED:', width, 'x', height, 'pixelRatio:', pixelRatio, 'mobile:', this.isMobile);
        }

        // Scale canvas display size to match container
        this.canvas.style.width = container.clientWidth + 'px';
        this.canvas.style.height = container.clientHeight + 'px';

        this.feedbackCanvas.width = this.canvas.width;
        this.feedbackCanvas.height = this.canvas.height;
    }

    start() {
        this.isPlaying = true;
        // Start with blank canvas - user adds shapes as desired
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);
        console.log('FEEDBACK_LOOP_STARTED: Add shapes to begin');
        this.loop();
    }

    stop() {
        this.isPlaying = false;
    }

    loop(timestamp) {
        if (!this.isPlaying) return;

        // FPS throttling for performance
        const elapsed = timestamp - this.lastFrameTime;
        if (elapsed < this.frameInterval) {
            requestAnimationFrame(this.loop);
            return;
        }
        this.lastFrameTime = timestamp - (elapsed % this.frameInterval);

        const width = this.canvas.width;
        const height = this.canvas.height;

        // Update continuous motion
        this.params.feedbackRotation += this.params.feedbackRotationVelocity;
        this.params.feedbackPanX += this.params.feedbackPanVelocityX;
        this.params.feedbackPanY += this.params.feedbackPanVelocityY;
        this.params.hueShift = (this.params.hueShift + this.params.hueShiftSpeed) % 360;

        // Wrap pan values when they go too far off screen
        const wrapThreshold = Math.max(width, height);
        if (Math.abs(this.params.feedbackPanX) > wrapThreshold) {
            this.params.feedbackPanX = -Math.sign(this.params.feedbackPanX) * wrapThreshold;
        }
        if (Math.abs(this.params.feedbackPanY) > wrapThreshold) {
            this.params.feedbackPanY = -Math.sign(this.params.feedbackPanY) * wrapThreshold;
        }

        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);

        // Apply kaleidoscope effect if enabled
        if (this.params.kaleidoscope > 0) {
            this.applyKaleidoscope(width, height);
        } else {
            // Normal rendering
            this.renderNormal(width, height);
        }

        // Apply pixel effects
        this.applyPixelEffects(width, height);

        // Process visual sequencing if in visual mode
        if (this.visualSequencer) {
            this.visualSequencer.process(Tone.now());
        }

        requestAnimationFrame(this.loop);
    }

    renderNormal(width, height) {
        // Apply transformations to everything
        this.ctx.save();
        
        const zoom = this.params.feedbackZoom;
        const rot = this.params.feedbackRotation * (Math.PI / 180);
        const panX = this.params.feedbackPanX;
        const panY = this.params.feedbackPanY;

        this.ctx.translate(width / 2, height / 2);
        this.ctx.translate(panX, panY);
        this.ctx.rotate(rot);
        this.ctx.scale(zoom, zoom);
        this.ctx.translate(-width / 2, -height / 2);

        // Draw video feedback (previous frame with transformations)
        const videoEl = this.videoInput.getVideoElement();
        if (videoEl && videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
            this.ctx.drawImage(videoEl, 0, 0, width, height);
        }
        
        // Draw shapes (they get captured and become part of feedback)
        if (this.shapeGenerator && this.shapeGenerator.shapes.length > 0) {
            this.shapeGenerator.update();
            this.shapeGenerator.draw(this.ctx, width, height);
        }

        // Draw user drawings (live and playback)
        if (this.drawingSystem) {
            this.drawingSystem.draw(this.ctx, width, height);
        }
        
        this.ctx.restore();
    }

    applyKaleidoscope(width, height) {
        const segments = Math.floor(this.params.kaleidoscope);
        const angleStep = (Math.PI * 2) / segments;
        
        this.ctx.save();
        this.ctx.translate(width / 2, height / 2);
        
        for (let i = 0; i < segments; i++) {
            this.ctx.save();
            this.ctx.rotate(angleStep * i);
            
            // Flip every other segment for mirror effect
            if (i % 2 === 1) {
                this.ctx.scale(-1, 1);
            }
            
            this.ctx.translate(-width / 2, -height / 2);
            this.renderNormal(width, height);
            this.ctx.restore();
        }
        
        this.ctx.restore();
    }

    applyPixelEffects(width, height) {
        // Apply glitch effects
        if (this.params.rgbShift > 0 || Math.random() < this.params.glitchProb) {
            this.applyGlitch(width, height);
        }

        // Get image data for pixel manipulation
        const imageData = this.ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Color chase effect - colors propagate based on brightness/motion
        if (this.params.colorChase > 0) {
            this.applyColorChase(data, width, height);
        }

        // Apply color effects
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // Brightness & Contrast
            r = ((r / 255 - 0.5) * this.params.contrast + 0.5) * 255 * this.params.brightness;
            g = ((g / 255 - 0.5) * this.params.contrast + 0.5) * 255 * this.params.brightness;
            b = ((b / 255 - 0.5) * this.params.contrast + 0.5) * 255 * this.params.brightness;

            // Hue shift (simple RGB rotation)
            if (this.params.hueShift > 0) {
                const angle = this.params.hueShift * Math.PI / 180;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                const nr = r * cos - g * sin;
                const ng = r * sin + g * cos;
                r = nr;
                g = ng;
            }

            // Invert
            if (this.params.invert > 0) {
                r = r * (1 - this.params.invert) + (255 - r) * this.params.invert;
                g = g * (1 - this.params.invert) + (255 - g) * this.params.invert;
                b = b * (1 - this.params.invert) + (255 - b) * this.params.invert;
            }

            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }

        // Pixelation effect
        if (this.params.pixelate > 1) {
            const pixelSize = Math.floor(this.params.pixelate);
            for (let y = 0; y < height; y += pixelSize) {
                for (let x = 0; x < width; x += pixelSize) {
                    const i = (y * width + x) * 4;
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // Fill pixel block
                    for (let py = 0; py < pixelSize && y + py < height; py++) {
                        for (let px = 0; px < pixelSize && x + px < width; px++) {
                            const pi = ((y + py) * width + (x + px)) * 4;
                            data[pi] = r;
                            data[pi + 1] = g;
                            data[pi + 2] = b;
                        }
                    }
                }
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
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

    applyColorChase(data, width, height) {
        const intensity = this.params.colorChase;
        const speed = this.params.colorChaseSpeed;
        
        // Create a copy for reading
        const copy = new Uint8ClampedArray(data);
        
        // Color chase: propagate colors based on neighboring pixels
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = (y * width + x) * 4;
                
                // Get current pixel brightness
                const brightness = (copy[i] + copy[i + 1] + copy[i + 2]) / 3;
                
                if (brightness > 10) { // Only chase bright pixels
                    // Sample neighboring pixels in direction of motion
                    const directions = [
                        (y - 1) * width + x,     // up
                        (y + 1) * width + x,     // down
                        y * width + (x - 1),     // left
                        y * width + (x + 1),     // right
                        (y - 1) * width + (x - 1), // up-left
                        (y - 1) * width + (x + 1), // up-right
                        (y + 1) * width + (x - 1), // down-left
                        (y + 1) * width + (x + 1)  // down-right
                    ];
                    
                    // Find brightest neighbor
                    let maxBrightness = 0;
                    let maxIndex = -1;
                    
                    for (let d = 0; d < directions.length; d++) {
                        const di = directions[d] * 4;
                        const nb = (copy[di] + copy[di + 1] + copy[di + 2]) / 3;
                        if (nb > maxBrightness) {
                            maxBrightness = nb;
                            maxIndex = di;
                        }
                    }
                    
                    // Chase the color from brightest neighbor
                    if (maxIndex >= 0 && maxBrightness > brightness) {
                        const chaseAmount = intensity * speed * 0.3;
                        data[i] = data[i] * (1 - chaseAmount) + copy[maxIndex] * chaseAmount;
                        data[i + 1] = data[i + 1] * (1 - chaseAmount) + copy[maxIndex + 1] * chaseAmount;
                        data[i + 2] = data[i + 2] * (1 - chaseAmount) + copy[maxIndex + 2] * chaseAmount;
                    }
                    
                    // Add color shift based on position for rainbow chase
                    const hueOffset = ((x + y) * speed * 0.5) % 360;
                    const angle = (hueOffset + this.params.hueShift) * Math.PI / 180;
                    const cos = Math.cos(angle) * intensity * 0.3;
                    const sin = Math.sin(angle) * intensity * 0.3;
                    
                    const r = data[i];
                    const g = data[i + 1];
                    
                    data[i] = Math.max(0, Math.min(255, r + (r * cos - g * sin)));
                    data[i + 1] = Math.max(0, Math.min(255, g + (r * sin + g * cos)));
                }
            }
        }
    }
}
