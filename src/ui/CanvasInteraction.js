export class CanvasInteraction {
    constructor(canvas, videoProcessor) {
        this.canvas = canvas;
        this.videoProcessor = videoProcessor;
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.activeButton = null; // 0: Left, 1: Middle, 2: Right

        // Touch gesture tracking
        this.touches = [];
        this.lastTouchDistance = 0;
        this.lastTouchAngle = 0;
        this.lastTouchCenter = { x: 0, y: 0 };

        this.setupListeners();
    }

    setupListeners() {
        // Mouse events (desktop)
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

        // Touch events (mobile)
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
        this.canvas.addEventListener('touchcancel', (e) => this.onTouchEnd(e), { passive: false });
    }

    onMouseDown(e) {
        this.isDragging = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.activeButton = e.button;
        
        console.log('MOUSE_DOWN:', e.button, 'at', e.clientX, e.clientY);

        // Prevent default behavior for middle and right clicks to avoid scrolling/context menu
        if (e.button === 1 || e.button === 2) {
            e.preventDefault();
        }
    }

    onMouseMove(e) {
        if (!this.isDragging) return;

        const deltaX = e.clientX - this.lastX;
        const deltaY = e.clientY - this.lastY;

        this.lastX = e.clientX;
        this.lastY = e.clientY;

        const params = this.videoProcessor.params;

        // Left Click: Pan
        if (this.activeButton === 0) {
            params.feedbackPanX += deltaX;
            params.feedbackPanY += deltaY;
            console.log('PAN:', params.feedbackPanX, params.feedbackPanY);
        }

        // Middle Click: Zoom
        else if (this.activeButton === 1) {
            // Drag up to zoom in, down to zoom out
            const zoomSpeed = 0.005;
            params.feedbackZoom += -deltaY * zoomSpeed;
            // Clamp zoom to reasonable limits
            params.feedbackZoom = Math.max(0.1, Math.min(params.feedbackZoom, 3.0));
            console.log('ZOOM:', params.feedbackZoom);
        }

        // Right Click: Rotate
        else if (this.activeButton === 2) {
            const rotationSpeed = 0.5;
            params.feedbackRotation += deltaX * rotationSpeed;
            console.log('ROTATE:', params.feedbackRotation);
        }
    }

    onMouseUp() {
        this.isDragging = false;
        this.activeButton = null;
    }

    onWheel(e) {
        e.preventDefault();
        const params = this.videoProcessor.params;
        const zoomSpeed = 0.001;

        params.feedbackZoom += -e.deltaY * zoomSpeed;
        // Clamp zoom
        params.feedbackZoom = Math.max(0.1, Math.min(params.feedbackZoom, 3.0));
    }

    // Touch event handlers
    onTouchStart(e) {
        e.preventDefault();
        this.touches = Array.from(e.touches);
        
        if (this.touches.length === 1) {
            // Single finger - prepare for pan
            this.lastX = this.touches[0].clientX;
            this.lastY = this.touches[0].clientY;
            this.isDragging = true;
        } else if (this.touches.length === 2) {
            // Two fingers - prepare for pinch zoom and rotate
            this.lastTouchDistance = this.getTouchDistance();
            this.lastTouchAngle = this.getTouchAngle();
            this.lastTouchCenter = this.getTouchCenter();
        }
    }

    onTouchMove(e) {
        e.preventDefault();
        this.touches = Array.from(e.touches);
        const params = this.videoProcessor.params;

        if (this.touches.length === 1) {
            // Single finger - pan
            const touch = this.touches[0];
            const deltaX = touch.clientX - this.lastX;
            const deltaY = touch.clientY - this.lastY;

            params.feedbackPanX += deltaX;
            params.feedbackPanY += deltaY;

            this.lastX = touch.clientX;
            this.lastY = touch.clientY;
        } else if (this.touches.length === 2) {
            // Two fingers - pinch zoom and rotate
            const currentDistance = this.getTouchDistance();
            const currentAngle = this.getTouchAngle();
            const currentCenter = this.getTouchCenter();

            // Pinch zoom
            if (this.lastTouchDistance > 0) {
                const zoomDelta = (currentDistance - this.lastTouchDistance) * 0.01;
                params.feedbackZoom += zoomDelta;
                params.feedbackZoom = Math.max(0.1, Math.min(params.feedbackZoom, 3.0));
            }

            // Rotate
            if (this.lastTouchAngle !== 0) {
                const angleDelta = currentAngle - this.lastTouchAngle;
                params.feedbackRotation += angleDelta * (180 / Math.PI); // Convert to degrees
            }

            this.lastTouchDistance = currentDistance;
            this.lastTouchAngle = currentAngle;
            this.lastTouchCenter = currentCenter;
        }
    }

    onTouchEnd(e) {
        e.preventDefault();
        this.touches = Array.from(e.touches);
        
        if (this.touches.length === 0) {
            this.isDragging = false;
            this.lastTouchDistance = 0;
            this.lastTouchAngle = 0;
        } else if (this.touches.length === 1) {
            // Switched from 2 fingers to 1 - reset for pan
            this.lastX = this.touches[0].clientX;
            this.lastY = this.touches[0].clientY;
            this.lastTouchDistance = 0;
            this.lastTouchAngle = 0;
        }
    }

    // Helper methods for touch gestures
    getTouchDistance() {
        if (this.touches.length < 2) return 0;
        const dx = this.touches[1].clientX - this.touches[0].clientX;
        const dy = this.touches[1].clientY - this.touches[0].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getTouchAngle() {
        if (this.touches.length < 2) return 0;
        const dx = this.touches[1].clientX - this.touches[0].clientX;
        const dy = this.touches[1].clientY - this.touches[0].clientY;
        return Math.atan2(dy, dx);
    }

    getTouchCenter() {
        if (this.touches.length < 2) return { x: 0, y: 0 };
        return {
            x: (this.touches[0].clientX + this.touches[1].clientX) / 2,
            y: (this.touches[0].clientY + this.touches[1].clientY) / 2
        };
    }
}
