import { VideoInput } from './video/VideoInput.js';
import { VideoProcessor } from './video/VideoProcessor.js';
import { AudioSystem } from './audio/AudioSystem.js';
import { Analyzer } from './engine/Analyzer.js';
import { Mapper } from './engine/Mapper.js';

console.log('SYSTEM_BOOT...');

const startBtn = document.getElementById('start-btn');
const overlay = document.querySelector('.overlay');

let isInitialized = false;

const videoInput = new VideoInput();
const videoProcessor = new VideoProcessor(videoInput);
const audioSystem = new AudioSystem();
const analyzer = new Analyzer(videoProcessor.canvas); // Use the main canvas as source

const mapper = new Mapper(audioSystem, analyzer);

console.log('MODULES_LOADED');


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

        mapper.start();


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

    // --- SONIFICATION CONTROLS ---
    const sonificationHeader = document.createElement('h2');
    sonificationHeader.textContent = 'SONIFICATION';
    sonificationHeader.style.marginTop = '20px';
    sonificationHeader.style.borderTop = '1px solid var(--primary)';
    sonificationHeader.style.paddingTop = '10px';
    controlsContainer.appendChild(sonificationHeader);

    // Sensitivity
    createSlider('MOTION_SENS', 0, 1, 0.01, mapper.motionThreshold, (v) => {
        mapper.motionThreshold = v;
    });

    createSlider('BRIGHT_SENS', 0, 1, 0.01, mapper.brightnessThreshold, (v) => {
        mapper.brightnessThreshold = v;
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

