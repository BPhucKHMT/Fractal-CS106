/**
 * Generate Sierpinski Triangle vertices (filled triangles)
 * @param {number} iteration - Number of iterations (0 = single triangle)
 * @returns {Float32Array} Vertices for GL_TRIANGLES
 */
export function generateSierpinskiTriangle(iteration) {
    const size = 0.85;
    const h = size * Math.sqrt(3) / 2;

    // Initial equilateral triangle
    const top = { x: 0, y: h * 2/3 };
    const left = { x: -size / 2, y: -h * 1/3 };
    const right = { x: size / 2, y: -h * 1/3 };

    let triangles = [{ a: top, b: left, c: right }];

    for (let i = 0; i < iteration; i++) {
        triangles = sierpinskiSubdivide(triangles);
    }

    // Each triangle = 3 vertices × 2 coordinates
    const vertices = new Float32Array(triangles.length * 6);
    for (let i = 0; i < triangles.length; i++) {
        const t = triangles[i];
        const offset = i * 6;
        vertices[offset]     = t.a.x;
        vertices[offset + 1] = t.a.y;
        vertices[offset + 2] = t.b.x;
        vertices[offset + 3] = t.b.y;
        vertices[offset + 4] = t.c.x;
        vertices[offset + 5] = t.c.y;
    }
    return vertices;
}

/**
 * Each triangle → 3 sub-triangles (remove center)
 */
function sierpinskiSubdivide(triangles) {
    const result = [];

    for (const { a, b, c } of triangles) {
        const ab = midpoint(a, b);
        const bc = midpoint(b, c);
        const ca = midpoint(c, a);

        // Keep 3 corner triangles, remove center
        result.push(
            { a: a,  b: ab, c: ca },
            { a: ab, b: b,  c: bc },
            { a: ca, b: bc, c: c  }
        );
    }

    return result;
}

function midpoint(p1, p2) {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

/** Max safe iteration for Sierpinski Triangle */
export const SIERPINSKI_TRI_MAX_ITERATION = 8;
