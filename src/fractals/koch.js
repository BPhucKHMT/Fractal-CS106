/**
 * Generate Koch Snowflake vertices
 * @param {number} iteration - Number of iterations (0 = triangle)
 * @returns {Float32Array} Flat array of [x,y, x,y, ...]
 */
export function generateKochSnowflake(iteration) {
    // Start with equilateral triangle (centered at origin)
    const size = 0.8;
    const h = size * Math.sqrt(3) / 2;
    let points = [
        { x: 0, y: h * 2/3 },
        { x: size / 2, y: -h * 1/3 },       // Note: going clockwise for outward-facing Koch
        { x: -size / 2, y: -h * 1/3 }
    ];

    // Apply Koch subdivision for each iteration
    for (let i = 0; i < iteration; i++) {
        points = kochSubdivide(points);
    }

    // Convert to flat Float32Array
    const vertices = new Float32Array(points.length * 2);
    for (let i = 0; i < points.length; i++) {
        vertices[i * 2] = points[i].x;
        vertices[i * 2 + 1] = points[i].y;
    }
    return vertices;
}

/**
 * Subdivide each edge using Koch curve rule
 * Each edge A→B becomes A→P1→Peak→P2→B
 */
function kochSubdivide(points) {
    const newPoints = [];
    const n = points.length;

    for (let i = 0; i < n; i++) {
        const a = points[i];
        const b = points[(i + 1) % n];

        const dx = b.x - a.x;
        const dy = b.y - a.y;

        // P1 = A + 1/3 * (B - A)
        const p1 = { x: a.x + dx / 3, y: a.y + dy / 3 };

        // P2 = A + 2/3 * (B - A)
        const p2 = { x: a.x + 2 * dx / 3, y: a.y + 2 * dy / 3 };

        // Peak = rotate P1→P2 by +60° around P1 (outward for clockwise winding)
        const cos60 = Math.cos(Math.PI / 3);
        const sin60 = Math.sin(Math.PI / 3);
        const pdx = p2.x - p1.x;
        const pdy = p2.y - p1.y;
        const peak = {
            x: p1.x + pdx * cos60 - pdy * sin60,
            y: p1.y + pdx * sin60 + pdy * cos60
        };

        newPoints.push(a, p1, peak, p2);
    }

    return newPoints;
}

/** Max safe iteration for Koch */
export const KOCH_MAX_ITERATION = 7;
