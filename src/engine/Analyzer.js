export class Analyzer {
    constructor(sourceCanvas, rows = 4, cols = 4) {
        this.sourceCanvas = sourceCanvas;
        this.rows = rows;
        this.cols = cols;

        // Downscale canvas for performance analysis
        this.analysisCanvas = document.createElement('canvas');
        this.analysisCanvas.width = cols;
        this.analysisCanvas.height = rows;
        this.ctx = this.analysisCanvas.getContext('2d', { willReadFrequently: true });

        this.prevData = new Uint8ClampedArray(rows * cols * 4);
    }

    analyze() {
        // Draw source to small canvas (browser handles averaging/downscaling)
        this.ctx.drawImage(this.sourceCanvas, 0, 0, this.cols, this.rows);

        const imageData = this.ctx.getImageData(0, 0, this.cols, this.rows);
        const data = imageData.data;

        const grid = [];

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = (r + g + b) / 3 / 255; // 0-1

            // Motion detection (diff from prev frame)
            const prevR = this.prevData[i];
            const prevG = this.prevData[i + 1];
            const prevB = this.prevData[i + 2];

            const diff = (Math.abs(r - prevR) + Math.abs(g - prevG) + Math.abs(b - prevB)) / 3 / 255;

            const cellIndex = i / 4;
            const x = cellIndex % this.cols;
            const y = Math.floor(cellIndex / this.cols);

            grid.push({
                x, y,
                r, g, b,
                brightness,
                motion: diff
            });
        }

        // Store current frame as prev for next loop
        this.prevData.set(data);

        return grid;
    }
}
