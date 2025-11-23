import { VideoInput } from './video/VideoInput.js';
import { VideoProcessor } from './video/VideoProcessor.js';
import { AudioSystem } from './audio/AudioSystem.js';
import { Analyzer } from './engine/Analyzer.js';
import { Composer } from './engine/Composer.js';
import { VisualSequencer } from './engine/VisualSequencer.js';
import { CanvasInteraction } from './ui/CanvasInteraction.js';
import { LEAD_NAMES, BASS_NAMES, PAD_NAMES } from './audio/SynthPresets.js';


console.log('SYSTEM_BOOT...');

const startBtn = document.getElementById('start-btn');
const overlay = document.querySelector('.overlay');

let isInitialized = false;

const videoInput = new VideoInput();
const videoProcessor = new VideoProcessor(videoInput);
const audioSystem = new AudioSystem();

// Use smaller grid on mobile for better performance
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                  || window.innerWidth <= 768;
const gridSize = isMobile ? 8 : 16; // 8x8 on mobile, 16x16 on desktop
const analyzer = new Analyzer(videoProcessor.canvas, gridSize, gridSize);
const canvasInteraction = new CanvasInteraction(videoProcessor.canvas, videoProcessor);

const composer = new Composer(audioSystem, analyzer);
const visualSequencer = new VisualSequencer(audioSystem, analyzer, composer.progression);

// Track which sequencer is active
let currentSequencer = composer;  // Default to time-based
let isVisualMode = false;

// Mode switching functions
function enableVisualMode() {
    composer.stop();
    isVisualMode = true;
    currentSequencer = visualSequencer;
    console.log('VISUAL-DRIVEN MODE: Fractal patterns drive music');
}

function enableTimeMode() {
    composer.start();
    isVisualMode = false;
    currentSequencer = composer;
    console.log('TIME-BASED MODE: Traditional rhythm scheduling');
}


console.log('MODULES_LOADED');

// Link video processor to audio synths for feedback delay sync
videoProcessor.setAudioSynths(audioSystem.synths);

// Link visual sequencer to video processor
videoProcessor.setVisualSequencer(visualSequencer);


startBtn.addEventListener('click', async () => {
    if (isInitialized) return;

    try {
        await Tone.start();
        if (Tone.context.state !== 'running') {
            await Tone.context.resume();
        }
        console.log('AUDIO_CONTEXT_READY', Tone.context.state);

        audioSystem.init();

        // Startup Sound
        const synth = new Tone.Synth().toDestination();
        synth.triggerAttackRelease("C5", "8n");
        console.log('STARTUP_SOUND_TRIGGERED');

        // Start analog feedback loop (camera pointing at TV effect)
        videoInput.startCanvasFeedback(videoProcessor.canvas, 30);
        videoProcessor.start();
        
        // Mobile: Start with time-based mode and add a cube
        enableTimeMode();
        const timeBasedBtn = document.getElementById('timebased-btn');
        if (timeBasedBtn) {
            timeBasedBtn.classList.add('active');
            isTimeBasedActive = true;
        }
        
        // Mobile: Optimize startup settings for better visual
        if (isMobile) {
            videoProcessor.params.feedbackZoom = 1.015; // Slight zoom in for better effect
        }
        
        // Add a cube shape on startup (uses mobile-optimized defaults: larger shape, thin lines)
        if (videoProcessor.shapeGenerator) {
            videoProcessor.shapeGenerator.addShape('cube');
            console.log('STARTUP_SHAPE: Cube added (size:', videoProcessor.shapeGenerator.shapeSize, 'line:', videoProcessor.shapeGenerator.lineWidth, 'zoom:', videoProcessor.params.feedbackZoom, ')');
        }
        
        console.log('ANALOG_FEEDBACK_ACTIVE: Self-referential loop initiated');

        startBtn.textContent = 'SYSTEM_ACTIVE';
        startBtn.disabled = true;
        overlay.style.display = 'none';

        isInitialized = true;
    } catch (e) {
        console.error('INIT_FAILURE', e);
    }
});

// Setup Video Buttons
document.getElementById('cam-btn').addEventListener('click', async () => {
    try {
        await videoInput.startWebcam();
        videoProcessor.start();
        overlay.style.display = 'none';
    } catch (err) {
        console.error('Webcam failed:', err);
    }
});

// TIME-BASED button - Toggle composer (traditional rhythm)
let isTimeBasedActive = false;
document.getElementById('timebased-btn').addEventListener('click', () => {
    const btn = document.getElementById('timebased-btn');
    if (!isTimeBasedActive) {
        enableTimeMode();
        btn.classList.add('active');
        isTimeBasedActive = true;
    } else {
        composer.stop();
        btn.classList.remove('active');
        isTimeBasedActive = false;
        console.log('TIME-BASED MODE: Stopped');
    }
});

// Fullscreen button
document.getElementById('fullscreen-btn').addEventListener('click', () => {
    const container = document.getElementById('canvas-container');
    if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
            console.error('Fullscreen error:', err);
        });
    } else {
        document.exitFullscreen();
    }
});

// Canvas Feedback button - now just restarts if needed
document.getElementById('canvas-feedback-btn').addEventListener('click', () => {
    videoInput.startCanvasFeedback(videoProcessor.canvas);
    if (!videoProcessor.isPlaying) {
        videoProcessor.start();
    }
    overlay.style.display = 'none';
    console.log('CANVAS_FEEDBACK_RESTARTED');
});

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeMobileMenu = document.getElementById('close-mobile-menu');
const mobileControlsPanel = document.getElementById('mobile-controls-panel');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileControlsPanel.classList.add('open');
    });
}

if (closeMobileMenu) {
    closeMobileMenu.addEventListener('click', () => {
        mobileControlsPanel.classList.remove('open');
    });
}

// Close mobile menu when clicking outside
mobileControlsPanel.addEventListener('click', (e) => {
    if (e.target === mobileControlsPanel) {
        mobileControlsPanel.classList.remove('open');
    }
});

// UI & Cursor Toggle (Desktop only)
const toggleUIBtn = document.getElementById('toggle-ui-btn');
if (toggleUIBtn) {
    toggleUIBtn.addEventListener('click', () => {
        const header = document.querySelector('header');
        const leftControls = document.querySelectorAll('.left-controls');
        const rightControls = document.querySelectorAll('.right-controls');
        const body = document.body;

        header.classList.toggle('ui-hidden');
        leftControls.forEach(el => el.classList.toggle('ui-hidden'));
        rightControls.forEach(el => el.classList.toggle('ui-hidden'));
        body.classList.toggle('hide-cursor');
    });
}

// Keyboard shortcut for UI toggle (U key)
document.addEventListener('keydown', (e) => {
    if (e.key === 'u' || e.key === 'U') {
        const header = document.querySelector('header');
        const leftControls = document.querySelectorAll('.left-controls');
        const rightControls = document.querySelectorAll('.right-controls');
        const body = document.body;

        header.classList.toggle('ui-hidden');
        leftControls.forEach(el => el.classList.toggle('ui-hidden'));
        rightControls.forEach(el => el.classList.toggle('ui-hidden'));
        body.classList.toggle('hide-cursor');
    }
});

// Drawing System Controls
let drawMode = false;
let recMode = false;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const drawBtn = document.getElementById('draw-btn');
        const recBtn = document.getElementById('rec-btn');
        const playBtn = document.getElementById('play-btn');
        const clearDrawBtn = document.getElementById('clear-draw-btn');

        if (drawBtn) {
            drawBtn.addEventListener('click', () => {
                drawMode = !drawMode;
                drawBtn.classList.toggle('active', drawMode);
                console.log('DRAW_MODE:', drawMode);
            });
        }

        if (recBtn) {
            recBtn.addEventListener('click', () => {
                recMode = !recMode;
                recBtn.classList.toggle('active', recMode);
                if (recMode) {
                    videoProcessor.drawingSystem.startRecording();
                } else {
                    videoProcessor.drawingSystem.stopRecording();
                }
            });
        }

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                const isPlaying = videoProcessor.drawingSystem.isPlaying;
                if (isPlaying) {
                    videoProcessor.drawingSystem.stopPlayback();
                    playBtn.classList.remove('active');
                } else {
                    videoProcessor.drawingSystem.startPlayback();
                    playBtn.classList.add('active');
                }
            });
        }

        if (clearDrawBtn) {
            clearDrawBtn.addEventListener('click', () => {
                videoProcessor.drawingSystem.clearRecordings();
                playBtn.classList.remove('active');
            });
        }
    }, 100);
});

// Drawing on canvas
videoProcessor.canvas.addEventListener('mousedown', (e) => {
    if (!drawMode) return;
    const rect = videoProcessor.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (videoProcessor.canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (videoProcessor.canvas.height / rect.height);
    videoProcessor.drawingSystem.startDrawing(x, y);
});

videoProcessor.canvas.addEventListener('mousemove', (e) => {
    if (!drawMode || !videoProcessor.drawingSystem.isDrawing) return;
    const rect = videoProcessor.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (videoProcessor.canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (videoProcessor.canvas.height / rect.height);
    videoProcessor.drawingSystem.continueDrawing(x, y);
});

videoProcessor.canvas.addEventListener('mouseup', () => {
    if (!drawMode) return;
    videoProcessor.drawingSystem.endDrawing();
});

// Generate UI Controls
function generateControls() {
    const leftContainer = document.getElementById('left-controls');
    const rightContainer = document.getElementById('right-controls');

    // Helper to create slider
    const createSlider = (label, min, max, step, value, onChange, target = 'left') => {
        const container = target === 'left' ? leftContainer : rightContainer;
        const group = document.createElement('div');
        group.className = 'control-group';
        group.innerHTML = `<h3>${label}</h3><label>${value}</label>`;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = value;

        const valLabel = group.querySelector('label');

        slider.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            valLabel.textContent = v.toFixed(2);
            onChange(v);
        });

        group.appendChild(slider);
        container.appendChild(group);
    };

    // ===== LEFT SIDEBAR: VIDEO & SHAPES =====

    // Drawing Controls
    const drawingHeader = document.createElement('h3');
    drawingHeader.textContent = 'DRAWING';
    leftContainer.appendChild(drawingHeader);

    const drawingControls = document.createElement('div');
    drawingControls.style.display = 'flex';
    drawingControls.style.gap = '4px';
    drawingControls.style.marginBottom = '10px';

    const drawBtn = document.createElement('button');
    drawBtn.textContent = 'DRAW';
    drawBtn.id = 'draw-btn';
    drawBtn.style.flex = '1';

    const recBtn = document.createElement('button');
    recBtn.textContent = 'REC';
    recBtn.id = 'rec-btn';
    recBtn.style.flex = '1';

    const playBtn = document.createElement('button');
    playBtn.textContent = 'PLAY';
    playBtn.id = 'play-btn';
    playBtn.style.flex = '1';

    const clearDrawBtn = document.createElement('button');
    clearDrawBtn.textContent = 'CLR';
    clearDrawBtn.id = 'clear-draw-btn';
    clearDrawBtn.style.flex = '0.7';

    drawingControls.appendChild(drawBtn);
    drawingControls.appendChild(recBtn);
    drawingControls.appendChild(playBtn);
    drawingControls.appendChild(clearDrawBtn);
    leftContainer.appendChild(drawingControls);

    createSlider('DRAW WIDTH', 1, 10, 0.5, 3, (v) => {
        if (videoProcessor.drawingSystem) {
            videoProcessor.drawingSystem.lineWidth = v;
        }
    });

    createSlider('DRAW OPACITY', 0, 1, 0.01, 1, (v) => {
        if (videoProcessor.drawingSystem) {
            videoProcessor.drawingSystem.opacity = v;
        }
    });

    // Shape Controls
    const shapeContainer = document.createElement('div');
    shapeContainer.style.display = 'flex';
    shapeContainer.style.gap = '10px';
    shapeContainer.style.marginBottom = '20px';

    // Shape Selector
    const shapeSelect = document.createElement('select');
    shapeSelect.style.flex = '1';
    const shapes = [
        { value: 'random', text: 'Random' },
        { value: 'circle', text: 'Circle' },
        { value: 'square', text: 'Square' },
        { value: 'triangle', text: 'Triangle' },
        { value: 'pentagon', text: 'Pentagon' },
        { value: 'hexagon', text: 'Hexagon' },
        { value: 'octagon', text: 'Octagon' },
        { value: 'star5', text: 'Star 5' },
        { value: 'star6', text: 'Star 6' },
        { value: 'diamond', text: 'Diamond' },
        { value: 'heart', text: 'Heart' },
        { value: 'cross', text: 'Cross' },
        { value: 'plus', text: 'Plus' },
        { value: 'tetrahedron', text: 'Tetrahedron' },
        { value: 'cube', text: '3D Cube' },
        { value: 'pyramid', text: '3D Pyramid' },
        { value: 'octahedron', text: '3D Octahedron' },
        { value: 'icosahedron', text: 'Icosahedron' },
        { value: 'dodecahedron', text: 'Dodecahedron' },
        { value: 'merkaba', text: 'Merkaba' },
        { value: 'metatron', text: 'Metatron' },
        { value: 'torus', text: 'Torus' },
        { value: 'spiral', text: 'Spiral' }
    ];
    shapes.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.value;
        opt.textContent = s.text;
        shapeSelect.appendChild(opt);
    });

    const addShapeBtn = document.createElement('button');
    addShapeBtn.textContent = 'ADD';
    addShapeBtn.style.flex = '0.5';
    addShapeBtn.addEventListener('click', () => {
        if (videoProcessor.shapeGenerator) {
            videoProcessor.shapeGenerator.addShape(shapeSelect.value);
        } else {
            console.error('ShapeGenerator not found on videoProcessor');
        }
    });

    const clearShapesBtn = document.createElement('button');
    clearShapesBtn.textContent = 'CLR';
    clearShapesBtn.style.flex = '0.7';
    clearShapesBtn.addEventListener('click', () => {
        if (videoProcessor.shapeGenerator) {
            videoProcessor.shapeGenerator.clearShapes();
        }
    });

    shapeContainer.appendChild(shapeSelect);
    shapeContainer.appendChild(addShapeBtn);
    shapeContainer.appendChild(clearShapesBtn);
    leftContainer.appendChild(shapeContainer);

    // Shape Size and Line Width (mobile-optimized: larger shape, thinner lines)
    const defaultShapeSize = isMobile ? 0.40 : 0.15;
    const defaultLineWidth = isMobile ? 1 : 3;
    
    createSlider('SHAPE SIZE', 0.05, 0.4, 0.01, defaultShapeSize, (v) => {
        if (videoProcessor.shapeGenerator) {
            videoProcessor.shapeGenerator.shapeSize = v;
        }
    });

    createSlider('SHAPE LINE', 1, 10, 0.5, defaultLineWidth, (v) => {
        if (videoProcessor.shapeGenerator) {
            videoProcessor.shapeGenerator.lineWidth = v;
        }
    });

    // Shape Animation Controls
    createSlider('SHAPE ROTATION', -0.1, 0.1, 0.001, 0, (v) => {
        if (videoProcessor.shapeGenerator) {
            videoProcessor.shapeGenerator.rotationSpeed = v;
        }
    });

    createSlider('SHAPE PULSE', 0, 0.05, 0.001, 0, (v) => {
        if (videoProcessor.shapeGenerator) {
            videoProcessor.shapeGenerator.pulseSpeed = v;
        }
    });

    createSlider('SHAPE COLOR', 0, 5, 0.1, 0, (v) => {
        if (videoProcessor.shapeGenerator) {
            videoProcessor.shapeGenerator.colorSpeed = v;
        }
    });

    // Video Params
    // Opacity removed as per user request for better quality
    // createSlider('VIDEO_OPACITY', 0, 1, 0.01, videoProcessor.params.videoOpacity, (v) => {
    //     videoProcessor.params.videoOpacity = v;
    // });

    createSlider('FPS', 1, 120, 1, videoProcessor.params.targetFPS, (v) => {
        videoProcessor.params.targetFPS = v;
        videoProcessor.frameInterval = 1000 / v;
    });



    createSlider('FEEDBACK_ZOOM', 0.5, 1.5, 0.001, videoProcessor.params.feedbackZoom, (v) => {
        videoProcessor.params.feedbackZoom = v;
    });

    createSlider('ROTATION SPEED', -2, 2, 0.01, 0, (v) => {
        videoProcessor.params.feedbackRotationVelocity = v;
    });

    createSlider('PAN SPEED X', -10, 10, 0.1, 0, (v) => {
        videoProcessor.params.feedbackPanVelocityX = v;
    });

    createSlider('PAN SPEED Y', -10, 10, 0.1, 0, (v) => {
        videoProcessor.params.feedbackPanVelocityY = v;
    });

    createSlider('RGB_SHIFT', 0, 50, 1, videoProcessor.params.rgbShift, (v) => {
        videoProcessor.params.rgbShift = v;
    });

    createSlider('GLITCH_PROB', 0, 1, 0.01, videoProcessor.params.glitchProb, (v) => {
        videoProcessor.params.glitchProb = v;
    });

    // Visual Effects
    createSlider('INVERT', 0, 1, 0.01, 0, (v) => {
        videoProcessor.params.invert = v;
    });

    createSlider('CONTRAST', 0.5, 2, 0.01, 1, (v) => {
        videoProcessor.params.contrast = v;
    });

    createSlider('BRIGHTNESS', 0.5, 2, 0.01, 1, (v) => {
        videoProcessor.params.brightness = v;
    });

    createSlider('HUE SHIFT SPEED', 0, 5, 0.1, 0, (v) => {
        videoProcessor.params.hueShiftSpeed = v;
    });

    createSlider('PIXELATE', 1, 20, 1, 1, (v) => {
        videoProcessor.params.pixelate = v;
    });

    createSlider('KALEIDOSCOPE', 0, 8, 1, 0, (v) => {
        videoProcessor.params.kaleidoscope = v;
    });

    createSlider('COLOR CHASE', 0, 1, 0.01, 0, (v) => {
        videoProcessor.params.colorChase = v;
    });

    createSlider('CHASE SPEED', 0.1, 5, 0.1, 1, (v) => {
        videoProcessor.params.colorChaseSpeed = v;
    });

    // ===== RIGHT SIDEBAR: AUDIO & COMPOSITION =====

    // Sonification controls header (already in HTML but add separator)
    const audioSeparator = document.createElement('div');
    audioSeparator.style.borderTop = '1px solid var(--text-color)';
    audioSeparator.style.marginTop = '15px';
    audioSeparator.style.marginBottom = '15px';
    rightContainer.appendChild(audioSeparator);

    // Progression selector
    const progGroup = document.createElement('div');
    progGroup.innerHTML = `<h3>PROGRESSION</h3>`;

    const progSelect = document.createElement('select');
    progSelect.style.width = '100%';

    // Create optgroups for better organization
    const progressions = {
        'Classic Minor': [
            { idx: 0, name: 'i-VI-III-VII (Dramatic)' },
            { idx: 1, name: 'i-iv-VII-III (Dark)' },
            { idx: 2, name: 'i-VII-VI-VII (Tension)' },
            { idx: 3, name: 'i-VI-iv-v (Sad)' },
            { idx: 4, name: 'i-III-VII-VI (Epic)' },
            { idx: 5, name: 'VI-VII-i (Resolution)' },
        ],
        'Classic Major': [
            { idx: 0, name: 'I-V-vi-IV (Pop)' },
            { idx: 1, name: 'I-IV-V-I (Rock)' },
            { idx: 2, name: 'I-vi-ii-V (Jazz Turn)' },
            { idx: 3, name: 'vi-IV-I-V (Sensitive)' },
            { idx: 4, name: 'I-iii-IV (Hopeful)' },
        ],
        'Ambient': [
            { idx: 0, name: 'Drone' },
            { idx: 1, name: 'Floating' },
            { idx: 2, name: 'Slow Evolution' },
            { idx: 3, name: 'Tension Drone' },
            { idx: 4, name: 'Pendulum' },
            { idx: 5, name: 'Relative Shift' },
        ],
        'Electronic': [
            { idx: 0, name: 'Minimal Techno' },
            { idx: 1, name: 'Dark Techno' },
            { idx: 2, name: 'Progressive House' },
            { idx: 3, name: 'Trance' },
            { idx: 4, name: 'Deep House' },
        ],
        'Jazz': [
            { idx: 0, name: 'ii-V-I Prep' },
            { idx: 1, name: 'Circle of Fifths' },
            { idx: 2, name: 'Chromatic Descent' },
            { idx: 3, name: 'Turnaround' },
        ],
        'Cinematic': [
            { idx: 0, name: 'Epic Rise' },
            { idx: 1, name: 'Emotional Swell' },
            { idx: 2, name: 'Heroic' },
            { idx: 3, name: 'Dark Suspense' },
            { idx: 4, name: 'Wonder' },
        ],
        'Experimental': [
            { idx: 0, name: 'Chromatic Climb' },
            { idx: 1, name: 'Tritone Switch' },
            { idx: 2, name: 'Stacked Thirds' },
            { idx: 3, name: 'Descending Scale' },
            { idx: 4, name: 'Quartal Harmony' },
        ],
    };

    const catKeys = {
        'Classic Minor': 'classic_minor',
        'Classic Major': 'classic_major',
        'Ambient': 'ambient',
        'Electronic': 'electronic',
        'Jazz': 'jazz',
        'Cinematic': 'cinematic',
        'Experimental': 'experimental',
    };

    let isFirst = true;
    for (const [catName, progs] of Object.entries(progressions)) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = catName;

        progs.forEach(prog => {
            const opt = document.createElement('option');
            opt.value = JSON.stringify({ cat: catKeys[catName], idx: prog.idx });
            opt.textContent = prog.name;
            if (isFirst) {
                opt.selected = true;
                isFirst = false;
            }
            optgroup.appendChild(opt);
        });

        progSelect.appendChild(optgroup);
    }

    progSelect.addEventListener('change', (e) => {
        const { cat, idx } = JSON.parse(e.target.value);
        composer.setProgression(cat, idx);
    });
    progGroup.appendChild(progSelect);
    rightContainer.appendChild(progGroup);

    // Rhythm template selector
    const rhythmGroup = document.createElement('div');
    rhythmGroup.className = 'control-group';
    rhythmGroup.innerHTML = `<h3>RHYTHM</h3>`;

    const rhythmSelect = document.createElement('select');
    rhythmSelect.style.width = '100%';

    const rhythmTemplates = [
        { value: 'ambient', name: 'AMBIENT (90 BPM)' },
        { value: 'house', name: 'HOUSE (125 BPM)' },
        { value: 'techno', name: 'TECHNO (135 BPM)' },
        { value: 'breakbeat', name: 'BREAKBEAT (140 BPM)' },
        { value: 'dnb', name: 'DRUM & BASS (170 BPM)' },
        { value: 'dubstep', name: 'DUBSTEP (140 BPM)' },
        { value: 'glitch', name: 'GLITCH (110 BPM)' },
        { value: 'minimal', name: 'MINIMAL (120 BPM)' },
    ];

    rhythmTemplates.forEach((template, i) => {
        const opt = document.createElement('option');
        opt.value = template.value;
        opt.textContent = template.name;
        if (i === 0) opt.selected = true;
        rhythmSelect.appendChild(opt);
    });

    rhythmSelect.addEventListener('change', (e) => {
        composer.setRhythmTemplate(e.target.value);
    });
    rhythmGroup.appendChild(rhythmSelect);
    rightContainer.appendChild(rhythmGroup);

    // Video influence sliders
    // Visual Reactivity
    const reactHeader = document.createElement('h3');
    reactHeader.textContent = 'VISUAL REACT';
    reactHeader.style.marginTop = '10px';
    rightContainer.appendChild(reactHeader);

    createSlider('LEAD REACT', 0, 1, 0.01, 0.3, (v) => {
        visualSequencer.setSensitivity('lead', v);
    }, 'right');

    createSlider('BASS REACT', 0, 1, 0.01, 0.3, (v) => {
        visualSequencer.setSensitivity('bass', v);
    }, 'right');

    createSlider('PAD REACT', 0, 1, 0.01, 0.4, (v) => {
        visualSequencer.setSensitivity('pad', v);
    }, 'right');

    createSlider('BPM', 60, 200, 1, 120, (v) => {
        Tone.Transport.bpm.value = v;
    }, 'right');

    // Audio Effects
    createSlider('REVERB MIX', 0, 1, 0.01, 0.3, (v) => {
        if (audioSystem.synths && audioSystem.synths.reverb) {
            audioSystem.synths.reverb.wet.value = v;
        }
    }, 'right');

    createSlider('DELAY MIX', 0, 1, 0.01, 0.3, (v) => {
        if (audioSystem.synths && audioSystem.synths.delay) {
            audioSystem.synths.delay.wet.value = v;
        }
    }, 'right');

    createSlider('DISTORTION', 0, 1, 0.01, 0, (v) => {
        if (audioSystem.synths && audioSystem.synths.distortion) {
            audioSystem.synths.distortion.wet.value = v;
        }
    }, 'right');

    createSlider('BITCRUSH', 0, 1, 0.01, 0, (v) => {
        if (audioSystem.synths && audioSystem.synths.bitCrusher) {
            audioSystem.synths.bitCrusher.wet.value = v;
        }
    }, 'right');

    // Timbre Controls
    const timbreHeader = document.createElement('h3');
    timbreHeader.textContent = 'TIMBRE';
    timbreHeader.style.marginTop = '15px';
    rightContainer.appendChild(timbreHeader);

    createSlider('FILTER CUTOFF', 100, 20000, 100, 20000, (v) => {
        audioSystem.setFilterCutoff(v);
    }, 'right');

    createSlider('FILTER RES', 0.1, 20, 0.1, 1, (v) => {
        audioSystem.setFilterResonance(v);
    }, 'right');

    // Filter Type Selector
    const filterGroup = document.createElement('div');
    filterGroup.className = 'control-group';
    filterGroup.innerHTML = `<h3>FILTER TYPE</h3>`;
    const filterSelect = document.createElement('select');
    filterSelect.style.width = '100%';
    ['lowpass', 'highpass', 'bandpass', 'notch'].forEach(type => {
        const opt = document.createElement('option');
        opt.value = type;
        opt.textContent = type.toUpperCase();
        if (type === 'lowpass') opt.selected = true;
        filterSelect.appendChild(opt);
    });
    filterSelect.addEventListener('change', (e) => audioSystem.setFilterType(e.target.value));
    filterGroup.appendChild(filterSelect);
    rightContainer.appendChild(filterGroup);

    // Envelope Controls
    const envelopeHeader = document.createElement('h3');
    envelopeHeader.textContent = 'ENVELOPES';
    envelopeHeader.style.marginTop = '15px';
    rightContainer.appendChild(envelopeHeader);

    createSlider('LEAD ATTACK', 0.001, 1, 0.01, 0.01, (v) => {
        audioSystem.setLeadAttack(v);
    }, 'right');

    createSlider('LEAD RELEASE', 0.01, 3, 0.01, 0.5, (v) => {
        audioSystem.setLeadRelease(v);
    }, 'right');

    createSlider('BASS ATTACK', 0.001, 0.5, 0.01, 0.01, (v) => {
        audioSystem.setBassAttack(v);
    }, 'right');

    createSlider('BASS RELEASE', 0.01, 2, 0.01, 0.3, (v) => {
        audioSystem.setBassRelease(v);
    }, 'right');

    createSlider('PAD ATTACK', 0.01, 3, 0.01, 0.5, (v) => {
        audioSystem.setPadAttack(v);
    }, 'right');

    createSlider('PAD RELEASE', 0.1, 5, 0.1, 2, (v) => {
        audioSystem.setPadRelease(v);
    }, 'right');
    // Scale & Root
    const theoryGroup = document.createElement('div');
    theoryGroup.className = 'control-group';
    theoryGroup.innerHTML = `<h3>THEORY</h3>`;

    // Scale Selector
    const scaleSelect = document.createElement('select');
    Object.keys(audioSystem.musicTheory.constructor.SCALES || {
        major: [], minor: [], dorian: [], lydian: [], phrygian: [], pentatonic: [], chromatic: []
    }).forEach(scale => { // Fallback if static access fails, but it should be exported constants
        // Actually SCALES is exported separately, let's access via instance if possible or just hardcode for now since we didn't import SCALES in main.js
        // Better: import SCALES in main.js or expose via audioSystem
    });
    // Let's use a hardcoded list for now to avoid import issues, or better, expose it in AudioSystem
    ['major', 'minor', 'dorian', 'lydian', 'phrygian', 'pentatonic', 'chromatic'].forEach(scale => {
        const opt = document.createElement('option');
        opt.value = scale;
        opt.textContent = scale.toUpperCase();
        if (scale === 'minor') opt.selected = true;
        scaleSelect.appendChild(opt);
    });
    scaleSelect.addEventListener('change', (e) => audioSystem.setScale(e.target.value));
    theoryGroup.appendChild(scaleSelect);

    // Root Selector
    const rootSelect = document.createElement('select');
    ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].forEach(note => {
        const opt = document.createElement('option');
        opt.value = note;
        opt.textContent = note;
        if (note === 'C') opt.selected = true;
        rootSelect.appendChild(opt);
    });
    rootSelect.addEventListener('change', (e) => audioSystem.setRoot(e.target.value));
    theoryGroup.appendChild(rootSelect);
    rightContainer.appendChild(theoryGroup);

    // Octave Shifts
    createSlider('LEAD OCTAVE', -4, 4, 1, 0, (v) => {
        audioSystem.setLeadOctave(v);
    }, 'right');

    createSlider('BASS OCTAVE', -4, 4, 1, 0, (v) => {
        audioSystem.setBassOctave(v);
    }, 'right');

    createSlider('PAD OCTAVE', -4, 4, 1, 0, (v) => {
        audioSystem.setPadOctave(v);
    }, 'right');


    // Mixer / Instruments
    const mixerHeader = document.createElement('h3');
    mixerHeader.textContent = 'MIXER';
    rightContainer.appendChild(mixerHeader);

    const instruments = [
        { id: 'lead', name: 'LEAD' },
        { id: 'pad', name: 'PAD' },
        { id: 'bass', name: 'BASS' },
        { id: 'noise', name: 'NOISE' }
    ];

    instruments.forEach(inst => {
        const group = document.createElement('div');
        group.className = 'control-group mixer-group';
        group.style.display = 'flex';
        group.style.alignItems = 'center';
        group.style.justifyContent = 'space-between';

        // Mute Toggle
        const toggle = document.createElement('button');
        toggle.textContent = inst.name;
        toggle.className = 'active'; // Default active
        toggle.style.width = '60px';
        toggle.style.fontSize = '0.8rem';

        let isActive = true;
        toggle.addEventListener('click', () => {
            isActive = !isActive;
            toggle.classList.toggle('active', isActive);
            toggle.style.opacity = isActive ? '1' : '0.5';
            audioSystem.toggleInstrument(inst.id, isActive);
        });

        // Volume Slider
        const vol = document.createElement('input');
        vol.type = 'range';
        vol.min = -60;
        vol.max = 0;
        vol.value = -10; // Default
        vol.style.width = '100px';
        vol.addEventListener('input', (e) => {
            audioSystem.setInstrumentVolume(inst.id, parseFloat(e.target.value));
        });

        group.appendChild(toggle);

        // Add Synth Type Selector for Lead, Bass, Pad
        if (['lead', 'bass', 'pad'].includes(inst.id)) {
            const select = document.createElement('select');
            select.style.width = '100px';
            select.style.fontSize = '0.8rem';
            select.style.background = '#222';
            select.style.color = 'var(--text-color)';
            select.style.border = '1px solid #444';

            let options = {};
            if (inst.id === 'lead') options = LEAD_NAMES;
            else if (inst.id === 'bass') options = BASS_NAMES;
            else if (inst.id === 'pad') options = PAD_NAMES;

            Object.entries(options).forEach(([key, name]) => {
                const opt = document.createElement('option');
                opt.value = key;
                opt.textContent = name;
                select.appendChild(opt);
            });

            select.addEventListener('change', (e) => {
                const type = e.target.value;
                if (inst.id === 'lead') audioSystem.setLeadType(type);
                else if (inst.id === 'bass') audioSystem.setBassType(type);
                else if (inst.id === 'pad') audioSystem.setPadType(type);
            });

            group.appendChild(select);
        }

        group.appendChild(vol);
        rightContainer.appendChild(group);
    });
}

try {
    console.log('GENERATING_CONTROLS...');
    generateControls();
    console.log('CONTROLS_GENERATED');
} catch (e) {
    console.error('CONTROLS_GENERATION_FAILED', e);
    // Manually trigger window error for visibility
    if (window.onerror) window.onerror(e.message, 'src/main.js', 212, 0, e);
}

