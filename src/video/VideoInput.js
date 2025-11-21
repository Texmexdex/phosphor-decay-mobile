export class VideoInput {
    constructor() {
        this.videoElement = document.createElement('video');
        this.videoElement.autoplay = true;
        this.videoElement.muted = true;
        this.isPlaying = false;
    }

    getVideoElement() {
        return this.videoElement;
    }

    async startWebcam() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.videoElement.srcObject = stream;
            await this.videoElement.play();
            this.isPlaying = true;
        } catch (err) {
            console.error("Error accessing webcam:", err);
        }
    }

    async startScreenShare() {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            this.videoElement.srcObject = stream;
            await this.videoElement.play();
            this.isPlaying = true;
        } catch (err) {
            console.error("Error accessing screen:", err);
        }
    }
}
