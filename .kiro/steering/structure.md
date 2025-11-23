# Project Structure

## Directory Organization

```
/
├── index.html              # Entry point, UI structure, Tone.js CDN import
├── style.css               # Main stylesheet
├── style-timebased-btn.css # Additional button styles
├── src/
│   ├── main.js            # Application bootstrap, event handlers, UI generation
│   ├── audio/             # Audio synthesis and music theory
│   │   ├── AudioSystem.js        # Main audio controller, master effects
│   │   ├── Synths.js             # Tone.js synth instances and routing
│   │   ├── SynthPresets.js       # Preset definitions for lead/bass/pad
│   │   ├── MusicTheory.js        # Scales, chords, note generation
│   │   ├── ChordLibrary.js       # Chord progression definitions
│   │   ├── ProgressionEngine.js  # Chord progression logic
│   │   ├── RhythmEngine.js       # Rhythm pattern scheduling
│   │   └── RhythmPatterns.js     # Rhythm template definitions
│   ├── video/             # Visual processing and rendering
│   │   ├── VideoInput.js         # Webcam/screen/canvas feedback capture
│   │   ├── VideoProcessor.js     # Main render loop, effects, transformations
│   │   ├── ShapeGenerator.js     # 2D/3D geometric shape rendering
│   │   └── DrawingSystem.js      # User drawing recording/playback
│   ├── engine/            # Audio-visual integration
│   │   ├── Analyzer.js           # Video grid analysis (motion, brightness, color)
│   │   ├── Composer.js           # Time-based music composition
│   │   ├── VisualSequencer.js    # Visual-driven note triggering
│   │   └── Mapper.js             # Maps video data to audio parameters
│   └── ui/                # User interaction
│       ├── CanvasInteraction.js  # Mouse/touch canvas controls
│       └── FullscreenControls.js # Fullscreen management
```

## Module Responsibilities

### Entry Point (`main.js`)
- Initializes all systems (video, audio, analyzers, sequencers)
- Sets up event listeners for buttons and controls
- Dynamically generates UI sliders and selectors
- Manages mode switching (time-based vs visual-driven)
- Handles keyboard shortcuts (U key for UI toggle)

### Audio System
- **AudioSystem**: Master controller, volume, filters, instrument routing
- **Synths**: Creates and manages Tone.js synth instances with effects chain
- **MusicTheory**: Converts abstract note indices to frequencies, manages scales
- **ProgressionEngine**: Generates chord progressions, provides melody/bass notes
- **RhythmEngine**: Schedules when instruments trigger based on templates

### Video System
- **VideoInput**: Captures video sources (webcam, screen, or canvas feedback)
- **VideoProcessor**: Main render loop with feedback transformations and effects
- **ShapeGenerator**: Renders 2D/3D shapes with rotation and animation
- **DrawingSystem**: Records user gestures and plays them back in loops

### Engine (Integration Layer)
- **Analyzer**: Divides canvas into grid, analyzes motion/brightness per cell
- **Composer**: Time-based composition using rhythm patterns and progressions
- **VisualSequencer**: Visual-driven composition triggered by fractal motion
- **Mapper**: Translates video analysis data into musical parameters

## Code Conventions

### Naming
- Classes use PascalCase: `VideoProcessor`, `AudioSystem`
- Files match class names: `VideoProcessor.js`
- Methods use camelCase: `startPlayback()`, `getCurrentChordNotes()`
- Constants use SCREAMING_SNAKE_CASE: `LEAD_NAMES`, `SCALES`

### Module Pattern
- Each file exports one primary class
- Use ES6 `import`/`export` syntax
- Dependencies injected via constructor parameters
- No circular dependencies

### State Management
- Each system manages its own state
- Cross-system communication via method calls and callbacks
- `main.js` acts as the integration point
- No global state beyond `Tone` (from CDN)

### Canvas Rendering
- Main canvas: `#main-canvas` - visible output
- Offscreen canvas: `feedbackCanvas` - for feedback loop processing
- All drawing uses 2D context with high-DPI scaling
- Effects applied via ImageData pixel manipulation

### Audio Scheduling
- All timing uses `Tone.Transport` for sync
- Notes scheduled with `time` parameter for precision
- Effects modulated with `.rampTo()` for smooth transitions
- Velocity values normalized 0-1

## Key Patterns

### Feedback Loop
1. VideoProcessor captures previous frame from canvas
2. Applies transformations (zoom, rotate, pan)
3. Draws shapes and user drawings on top
4. Applies pixel effects
5. Result becomes input for next frame

### Visual-to-Audio Pipeline
1. Analyzer divides canvas into grid
2. Calculates motion/brightness per cell
3. Composer/VisualSequencer reads analysis
4. Maps spatial data to musical parameters
5. Triggers notes via AudioSystem

### Parameter Control
- UI sliders directly modify system properties
- Changes take effect immediately (no apply button)
- Some parameters use `.rampTo()` for smooth audio transitions
- Video parameters affect next frame render
