export class ShapeGenerator {
    constructor() {
        this.shapes = [];
        this.startTime = Date.now();

        // Detect mobile for optimized defaults
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                        || window.innerWidth <= 768;

        // Global animation controls
        this.rotationSpeed = 0;
        this.pulseSpeed = 0;
        this.colorSpeed = 0;

        // Global appearance controls (mobile-optimized)
        this.shapeSize = this.isMobile ? 0.05 : 0.15;
        this.lineWidth = this.isMobile ? 1 : 3;
    }

    addShape(type = 'random') {
        const types = ['square', 'circle', 'triangle', 'tetrahedron', 'pentagon', 'hexagon', 'octagon', 
                       'star5', 'star6', 'cross', 'plus', 'diamond', 'heart', 'cube', 'pyramid', 'octahedron', 
                       'icosahedron', 'dodecahedron', 'torus', 'spiral', 'metatron', 'merkaba'];
        if (type === 'random') {
            type = types[Math.floor(Math.random() * types.length)];
        }

        const shape = {
            type: type,
            x: 0.5,
            y: 0.5,
            rotation: 0,
            colorHue: Math.random() * 360,
            pulsePhase: 0,
            // 3D rotation angles
            rotX: 0,
            rotY: 0,
            rotZ: 0,
            // 3D rotation speeds
            rotSpeedX: (Math.random() - 0.5) * 0.02,
            rotSpeedY: (Math.random() - 0.5) * 0.02,
            rotSpeedZ: (Math.random() - 0.5) * 0.02
        };

        this.shapes.push(shape);
        return shape;
    }

    clearShapes() {
        this.shapes = [];
    }

    update() {
        this.shapes.forEach(shape => {
            shape.rotation += this.rotationSpeed;
            shape.colorHue = (shape.colorHue + this.colorSpeed) % 360;
            shape.pulsePhase += this.pulseSpeed;
            // Update 3D rotation
            shape.rotX += shape.rotSpeedX;
            shape.rotY += shape.rotSpeedY;
            shape.rotZ += shape.rotSpeedZ;
        });
    }

    // 3D projection helper
    project3D(x, y, z, rotX, rotY, rotZ) {
        // Rotate around X axis
        let y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
        let z1 = y * Math.sin(rotX) + z * Math.cos(rotX);
        
        // Rotate around Y axis
        let x2 = x * Math.cos(rotY) + z1 * Math.sin(rotY);
        let z2 = -x * Math.sin(rotY) + z1 * Math.cos(rotY);
        
        // Rotate around Z axis
        let x3 = x2 * Math.cos(rotZ) - y1 * Math.sin(rotZ);
        let y3 = x2 * Math.sin(rotZ) + y1 * Math.cos(rotZ);
        
        // Perspective projection
        const perspective = 300;
        const scale = perspective / (perspective + z2);
        
        return {
            x: x3 * scale,
            y: y3 * scale,
            scale: scale
        };
    }

    // Draw 3D cube
    draw3DCube(ctx, shape, r) {
        const vertices = [
            [-r, -r, -r], [r, -r, -r], [r, r, -r], [-r, r, -r],
            [-r, -r, r], [r, -r, r], [r, r, r], [-r, r, r]
        ];
        
        const edges = [
            [0,1],[1,2],[2,3],[3,0], // back face
            [4,5],[5,6],[6,7],[7,4], // front face
            [0,4],[1,5],[2,6],[3,7]  // connecting edges
        ];
        
        edges.forEach(([i, j]) => {
            const p1 = this.project3D(vertices[i][0], vertices[i][1], vertices[i][2], 
                                     shape.rotX, shape.rotY, shape.rotZ);
            const p2 = this.project3D(vertices[j][0], vertices[j][1], vertices[j][2], 
                                     shape.rotX, shape.rotY, shape.rotZ);
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        });
    }

    // Draw 3D pyramid
    draw3DPyramid(ctx, shape, r) {
        const vertices = [
            [0, -r, 0],           // apex
            [-r, r, -r],          // base corners
            [r, r, -r],
            [r, r, r],
            [-r, r, r]
        ];
        
        const edges = [
            [0,1],[0,2],[0,3],[0,4], // apex to base
            [1,2],[2,3],[3,4],[4,1]  // base
        ];
        
        edges.forEach(([i, j]) => {
            const p1 = this.project3D(vertices[i][0], vertices[i][1], vertices[i][2], 
                                     shape.rotX, shape.rotY, shape.rotZ);
            const p2 = this.project3D(vertices[j][0], vertices[j][1], vertices[j][2], 
                                     shape.rotX, shape.rotY, shape.rotZ);
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        });
    }

    // Draw 3D octahedron
    draw3DOctahedron(ctx, shape, r) {
        const vertices = [
            [0, -r, 0],    // top
            [0, r, 0],     // bottom
            [r, 0, 0],     // right
            [-r, 0, 0],    // left
            [0, 0, r],     // front
            [0, 0, -r]     // back
        ];
        
        const edges = [
            [0,2],[0,3],[0,4],[0,5], // top to sides
            [1,2],[1,3],[1,4],[1,5], // bottom to sides
            [2,4],[4,3],[3,5],[5,2]  // equator
        ];
        
        edges.forEach(([i, j]) => {
            const p1 = this.project3D(vertices[i][0], vertices[i][1], vertices[i][2], 
                                     shape.rotX, shape.rotY, shape.rotZ);
            const p2 = this.project3D(vertices[j][0], vertices[j][1], vertices[j][2], 
                                     shape.rotX, shape.rotY, shape.rotZ);
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        });
    }

    draw(ctx, width, height) {
        this.shapes.forEach(shape => {
            ctx.save();

            const cx = shape.x * width;
            const cy = shape.y * height;
            ctx.translate(cx, cy);

            const pulse = this.pulseSpeed > 0 ? 1 + Math.sin(shape.pulsePhase) * 0.2 : 1;
            const size = this.shapeSize * Math.min(width, height) * pulse;

            ctx.rotate(shape.rotation);

            ctx.strokeStyle = `hsl(${shape.colorHue}, 100%, 50%)`;
            ctx.lineWidth = this.lineWidth;
            ctx.lineJoin = 'round';

            ctx.beginPath();

            const r = size / 2;

            if (shape.type === 'square') {
                ctx.rect(-r, -r, size, size);
            } else if (shape.type === 'circle') {
                ctx.arc(0, 0, r, 0, Math.PI * 2);
            } else if (shape.type === 'triangle') {
                ctx.moveTo(0, -r);
                ctx.lineTo(r * 0.866, r * 0.5);
                ctx.lineTo(-r * 0.866, r * 0.5);
                ctx.closePath();
            } else if (shape.type === 'pentagon') {
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                    const x = r * Math.cos(angle);
                    const y = r * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
            } else if (shape.type === 'hexagon') {
                for (let i = 0; i < 6; i++) {
                    const angle = (i * 2 * Math.PI / 6);
                    const x = r * Math.cos(angle);
                    const y = r * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
            } else if (shape.type === 'octagon') {
                for (let i = 0; i < 8; i++) {
                    const angle = (i * 2 * Math.PI / 8);
                    const x = r * Math.cos(angle);
                    const y = r * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
            } else if (shape.type === 'star5') {
                for (let i = 0; i < 10; i++) {
                    const angle = (i * Math.PI / 5) - Math.PI / 2;
                    const rad = i % 2 === 0 ? r : r * 0.4;
                    const x = rad * Math.cos(angle);
                    const y = rad * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
            } else if (shape.type === 'star6') {
                for (let i = 0; i < 12; i++) {
                    const angle = (i * Math.PI / 6);
                    const rad = i % 2 === 0 ? r : r * 0.5;
                    const x = rad * Math.cos(angle);
                    const y = rad * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
            } else if (shape.type === 'cross') {
                const w = r * 0.3;
                ctx.moveTo(-w, -r);
                ctx.lineTo(w, -r);
                ctx.lineTo(w, -w);
                ctx.lineTo(r, -w);
                ctx.lineTo(r, w);
                ctx.lineTo(w, w);
                ctx.lineTo(w, r);
                ctx.lineTo(-w, r);
                ctx.lineTo(-w, w);
                ctx.lineTo(-r, w);
                ctx.lineTo(-r, -w);
                ctx.lineTo(-w, -w);
                ctx.closePath();
            } else if (shape.type === 'plus') {
                ctx.moveTo(0, -r);
                ctx.lineTo(0, r);
                ctx.moveTo(-r, 0);
                ctx.lineTo(r, 0);
            } else if (shape.type === 'diamond') {
                ctx.moveTo(0, -r);
                ctx.lineTo(r, 0);
                ctx.lineTo(0, r);
                ctx.lineTo(-r, 0);
                ctx.closePath();
            } else if (shape.type === 'heart') {
                const top = -r * 0.3;
                ctx.moveTo(0, top + r * 0.3);
                ctx.bezierCurveTo(-r, top - r * 0.3, -r, top + r * 0.2, -r * 0.5, top + r * 0.5);
                ctx.lineTo(0, r);
                ctx.lineTo(r * 0.5, top + r * 0.5);
                ctx.bezierCurveTo(r, top + r * 0.2, r, top - r * 0.3, 0, top + r * 0.3);
            } else if (shape.type === 'tetrahedron') {
                ctx.moveTo(0, -r);
                ctx.lineTo(r * 0.866, r * 0.5);
                ctx.lineTo(-r * 0.866, r * 0.5);
                ctx.closePath();
                ctx.moveTo(0, -r);
                ctx.lineTo(0, 0);
                ctx.moveTo(r * 0.866, r * 0.5);
                ctx.lineTo(0, 0);
                ctx.moveTo(-r * 0.866, r * 0.5);
                ctx.lineTo(0, 0);
            } else if (shape.type === 'cube') {
                // 3D rotating cube
                this.draw3DCube(ctx, shape, r);
            } else if (shape.type === 'pyramid') {
                // 3D rotating pyramid
                this.draw3DPyramid(ctx, shape, r);
            } else if (shape.type === 'octahedron') {
                // 3D rotating octahedron
                this.draw3DOctahedron(ctx, shape, r);
            } else if (shape.type === 'icosahedron') {
                // 20-sided approximation
                const phi = (1 + Math.sqrt(5)) / 2;
                const vertices = [
                    [0, r, r * phi], [0, r, -r * phi], [0, -r, r * phi], [0, -r, -r * phi],
                    [r, r * phi, 0], [r, -r * phi, 0], [-r, r * phi, 0], [-r, -r * phi, 0],
                    [r * phi, 0, r], [r * phi, 0, -r], [-r * phi, 0, r], [-r * phi, 0, -r]
                ];
                // Project and draw edges
                for (let i = 0; i < vertices.length; i++) {
                    for (let j = i + 1; j < vertices.length; j++) {
                        const dist = Math.sqrt(
                            Math.pow(vertices[i][0] - vertices[j][0], 2) +
                            Math.pow(vertices[i][1] - vertices[j][1], 2) +
                            Math.pow(vertices[i][2] - vertices[j][2], 2)
                        );
                        if (dist < r * 2.2) {
                            ctx.moveTo(vertices[i][0] * 0.3, vertices[i][1] * 0.3);
                            ctx.lineTo(vertices[j][0] * 0.3, vertices[j][1] * 0.3);
                        }
                    }
                }
            } else if (shape.type === 'dodecahedron') {
                // 12-sided pentagon faces
                for (let i = 0; i < 12; i++) {
                    const angle = (i * Math.PI * 2 / 12);
                    const x = r * Math.cos(angle) * 0.8;
                    const y = r * Math.sin(angle) * 0.8;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                for (let i = 0; i < 12; i += 3) {
                    const angle = (i * Math.PI * 2 / 12);
                    ctx.moveTo(0, 0);
                    ctx.lineTo(r * Math.cos(angle) * 0.8, r * Math.sin(angle) * 0.8);
                }
            } else if (shape.type === 'torus') {
                // Torus/donut wireframe
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.moveTo(r * 0.5, 0);
                ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
                for (let i = 0; i < 8; i++) {
                    const angle = (i * Math.PI * 2 / 8);
                    ctx.moveTo(r * 0.5 * Math.cos(angle), r * 0.5 * Math.sin(angle));
                    ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
                }
            } else if (shape.type === 'spiral') {
                // Fibonacci spiral
                let angle = 0;
                let radius = 0;
                ctx.moveTo(0, 0);
                for (let i = 0; i < 100; i++) {
                    angle += 0.5;
                    radius += r / 50;
                    ctx.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
                }
            } else if (shape.type === 'metatron') {
                // Metatron's Cube - sacred geometry
                const points = [];
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI * 2 / 6);
                    points.push([r * Math.cos(angle), r * Math.sin(angle)]);
                }
                points.push([0, 0]);
                
                // Draw all connections
                for (let i = 0; i < points.length; i++) {
                    for (let j = i + 1; j < points.length; j++) {
                        ctx.moveTo(points[i][0], points[i][1]);
                        ctx.lineTo(points[j][0], points[j][1]);
                    }
                }
                
                // Inner circles
                ctx.moveTo(r * 0.5, 0);
                ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
            } else if (shape.type === 'merkaba') {
                // Star tetrahedron (3D Star of David)
                // Upward tetrahedron
                ctx.moveTo(0, -r);
                ctx.lineTo(r * 0.866, r * 0.5);
                ctx.lineTo(-r * 0.866, r * 0.5);
                ctx.closePath();
                
                // Downward tetrahedron
                ctx.moveTo(0, r);
                ctx.lineTo(r * 0.866, -r * 0.5);
                ctx.lineTo(-r * 0.866, -r * 0.5);
                ctx.closePath();
                
                // Connect vertices
                ctx.moveTo(0, -r);
                ctx.lineTo(0, r);
                ctx.moveTo(r * 0.866, r * 0.5);
                ctx.lineTo(r * 0.866, -r * 0.5);
                ctx.moveTo(-r * 0.866, r * 0.5);
                ctx.lineTo(-r * 0.866, -r * 0.5);
            }

            ctx.stroke();
            ctx.restore();
        });
    }
}
