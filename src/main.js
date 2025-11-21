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

startBtn.addEventListener('click', async () => {
    if (isInitialized) return;

    try {
        await Tone.start();
        console.log('AUDIO_CONTEXT_READY');

        audioSystem.init();
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

    // Audio/Mapper Params
    createSlider('MOTION_THRESH', 0, 1, 0.01, mapper.motionThreshold, (v) => {
        mapper.motionThreshold = v;
    });

    createSlider('BPM', 60, 200, 1, 120, (v) => {
        Tone.Transport.bpm.value = v;
    });
}

generateControls();
