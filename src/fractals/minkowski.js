/**
 * Generate Minkowski Island (Sausage) vertices
 * @param {number} iteration - Number of iterations (0 = square)
 * @returns {Float32Array}
 */
export function generateMinkowskiIsland(iteration) {
    // Start with a square
    const s = 0.6;
    let points = [
        { x: -s, y: -s },
        { x:  s, y: -s },
        { x:  s, y:  s },
        { x: -s, y:  s }
    ];

    for (let i = 0; i < iteration; i++) {
        points = minkowskiSubdivide(points);
    }

    const vertices = new Float32Array(points.length * 2);
    for (let i = 0; i < points.length; i++) {
        vertices[i * 2] = points[i].x;
        vertices[i * 2 + 1] = points[i].y;
    }
    return vertices;
}

/**
 * Minkowski sausage generator: each segment → 8 segments
 * Pattern: forward 1/4, left 1/4, forward 1/4, right 1/4, right 1/4, forward 1/4, left 1/4, forward 1/4
 */
function minkowskiSubdivide(points) {
    const newPoints = [];
    const n = points.length;

    for (let i = 0; i < n; i++) {
        const a = points[i];
        const b = points[(i + 1) % n];

        const dx = (b.x - a.x) / 4;
        const dy = (b.y - a.y) / 4;

        // Normal vector (perpendicular, pointing outward)
        const nx = -dy;
        const ny = dx;

        // 8 intermediate points creating the Minkowski sausage pattern
        const p0 = a;
        const p1 = { x: a.x + dx, y: a.y + dy };
        const p2 = { x: a.x + dx + nx, y: a.y + dy + ny };
        const p3 = { x: a.x + 2 * dx + nx, y: a.y + 2 * dy + ny };
        const p4 = { x: a.x + 2 * dx, y: a.y + 2 * dy };
        const p5 = { x: a.x + 2 * dx - nx, y: a.y + 2 * dy - ny };
        const p6 = { x: a.x + 3 * dx - nx, y: a.y + 3 * dy - ny };
        const p7 = { x: a.x + 3 * dx, y: a.y + 3 * dy };

        newPoints.push(p0, p1, p2, p3, p4, p5, p6, p7);
    }

    return newPoints;
}

/** Max safe iteration for Minkowski */
export const MINKOWSKI_MAX_ITERATION = 4;
