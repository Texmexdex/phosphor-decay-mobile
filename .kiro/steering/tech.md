# Technology Stack

## Core Technologies

- **Pure ES6 Modules**: No build step, no bundler, runs directly in browser
- **Vanilla JavaScript**: No frameworks (React, Vue, etc.)
- **Canvas API**: Real-time video processing and rendering
- **Tone.js v14.8.49**: Web Audio synthesis and scheduling (loaded via CDN)
- **WebRTC**: Optional webcam/screen capture input

## Architecture

- **No Build System**: Files are served directly, no compilation required
- **Module System**: ES6 imports/exports for code organization
- **High-DPI Rendering**: Uses `devicePixelRatio` for crisp feedback quality

## Running the Project

Since this is a static web application with no build step:

1. **Local Development**: Use any static file server
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (if http-server is installed)
   npx http-server
   ```

2. **Open in Browser**: Navigate to `http://localhost:8000`

3. **No Installation**: No `npm install` or package management needed

## Browser Requirements

- Modern browser with ES6 module support
- Web Audio API support
- Canvas API with `willReadFrequently` context option
- High-resolution display recommended for best visual quality

## External Dependencies

- **Tone.js**: Loaded from `unpkg.com` CDN in `index.html`
- All other code is self-contained in the repository

## Performance Considerations

- Uses `requestAnimationFrame` for smooth 60fps rendering
- Configurable FPS target for performance tuning
- High pixel ratio rendering can be GPU-intensive
- ImageData manipulation for pixel effects may impact performance on large canvases
