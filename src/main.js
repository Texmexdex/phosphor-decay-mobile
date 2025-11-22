import { VideoInput } from './video/VideoInput.js';
import { VideoProcessor } from './video/VideoProcessor.js';
import { AudioSystem } from './audio/AudioSystem.js';
import { Analyzer } from './engine/Analyzer.js';
import { Composer } from './engine/Composer.js';


console.log('SYSTEM_BOOT...');

const startBtn = document.getElementById('start-btn');
const overlay = document.querySelector('.overlay');

let isInitialized = false;

const videoInput = new VideoInput();
const videoProcessor = new VideoProcessor(videoInput);
const audioSystem = new AudioSystem();
const analyzer = new Analyzer(videoProcessor.canvas); // Use the main canvas as source

const composer = new Composer(audioSystem, analyzer);


console.log('MODULES_LOADED');

// Link video processor to audio synths for feedback delay sync
videoProcessor.setAudioSynths(audioSystem.synths);


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

        composer.start();



        startBtn.textContent = 'SYSTEM_ACTIVE';
        startBtn.disabled = true;
        overlay.style.display = 'none';

        isInitialized = true;
    } catch (e) {
        console.error('INIT_FAILURE', e);
    }
});

// Setup Video Buttons
document.getElementById('cam-btn').addEventListener('click', () => {
    console.log('CAM_BTN_CLICKED');
    videoInput.startWebcam();

    videoProcessor.start();
    overlay.style.display = 'none';
});

document.getElementById('screen-btn').addEventListener('click', () => {
    videoInput.startScreenShare();
    videoProcessor.start();
    overlay.style.display = 'none';
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

// Canvas Feedback button (Infinity Mirror)
let isFeedbackActive = false;
document.getElementById('canvas-feedback-btn').addEventListener('click', () => {
    const btn = document.getElementById('canvas-feedback-btn');
    if (!isFeedbackActive) {
        videoInput.startCanvasFeedback(videoProcessor.canvas);
        videoProcessor.start();
        overlay.style.display = 'none';
        btn.classList.add('active');
        isFeedbackActive = true;
    } else {
        btn.classList.remove('active');
        isFeedbackActive = false;
        // Note: user would need to click webcam/screen to restore original source
    }
});

// Generate UI Controls
function generateControls() {
    const controlsContainer = document.getElementById('controls');

    // Helper to create slider
    const createSlider = (label, min, max, step, value, onChange) => {
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
        controlsContainer.appendChild(group);
    };

    // Video Params
    createSlider('FEEDBACK', 0, 0.99, 0.01, videoProcessor.params.feedback, (v) => {
        videoProcessor.params.feedback = v;
        videoProcessor.syncAudioWithVideoFeedback(); // Sync audio delay with video feedback
    });

    createSlider('FEEDBACK_ZOOM', 1.0, 1.2, 0.001, videoProcessor.params.feedbackZoom, (v) => {
        videoProcessor.params.feedbackZoom = v;
    });

    createSlider('RGB_SHIFT', 0, 50, 1, videoProcessor.params.rgbShift, (v) => {
        videoProcessor.params.rgbShift = v;
    });

    createSlider('GLITCH_PROB', 0, 1, 0.01, videoProcessor.params.glitchProb, (v) => {
        videoProcessor.params.glitchProb = v;
    });


    // --- SONIFICATION controls ---
    const sonificationHeader = document.createElement('h2');
    sonificationHeader.textContent = 'MUSIC COMPOSITION';
    sonificationHeader.style.marginTop = '20px';
    sonificationHeader.style.borderTop = '1px solid var(--primary)';
    sonificationHeader.style.paddingTop = '10px';
    controlsContainer.appendChild(sonificationHeader);

    // Progression selector
    const progGroup = document.createElement('div');
    progGroup.className = 'control-group';
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
    controlsContainer.appendChild(progGroup);

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
    controlsContainer.appendChild(rhythmGroup);

    // Video influence sliders
    createSlider('VIDEO→MELODY', 0, 1, 0.01, 0.7, (v) => {
        composer.setVideoInfluence('melody', v);
    });

    createSlider('VIDEO→HARMONY', 0, 1, 0.01, 0.3, (v) => {
        composer.setVideoInfluence('harmony', v);
    });

    createSlider('BPM', 60, 200, 1, 120, (v) => {
        Tone.Transport.bpm.value = v;
    });
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
    controlsContainer.appendChild(theoryGroup);


    // Mixer / Instruments
    const mixerHeader = document.createElement('h3');
    mixerHeader.textContent = 'MIXER';
    controlsContainer.appendChild(mixerHeader);

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
        group.appendChild(vol);
        controlsContainer.appendChild(group);
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

