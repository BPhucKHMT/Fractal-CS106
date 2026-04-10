/**
 * Generate Sierpinski Carpet vertices (filled squares as 2 triangles each)
 * @param {number} iteration - Number of iterations (0 = single square)
 * @returns {Float32Array} Vertices for GL_TRIANGLES
 */
export function generateSierpinskiCarpet(iteration) {
    const s = 0.8;

    // Initial square (centered)
    let squares = [{ x: -s/2, y: -s/2, size: s }];

    for (let i = 0; i < iteration; i++) {
        squares = carpetSubdivide(squares);
    }

    // Each square = 2 triangles = 6 vertices × 2 coords
    const vertices = new Float32Array(squares.length * 12);
    for (let i = 0; i < squares.length; i++) {
        const sq = squares[i];
        const x1 = sq.x, y1 = sq.y;
        const x2 = sq.x + sq.size, y2 = sq.y + sq.size;
        const offset = i * 12;

        // Triangle 1: bottom-left
        vertices[offset]     = x1; vertices[offset + 1] = y1;
        vertices[offset + 2] = x2; vertices[offset + 3] = y1;
        vertices[offset + 4] = x1; vertices[offset + 5] = y2;

        // Triangle 2: top-right
        vertices[offset + 6] = x2; vertices[offset + 7] = y1;
        vertices[offset + 8] = x2; vertices[offset + 9] = y2;
        vertices[offset + 10] = x1; vertices[offset + 11] = y2;
    }
    return vertices;
}

/**
 * Each square → 8 sub-squares (remove center)
 */
function carpetSubdivide(squares) {
    const result = [];

    for (const sq of squares) {
        const subSize = sq.size / 3;

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                // Skip center square
                if (row === 1 && col === 1) continue;

                result.push({
                    x: sq.x + col * subSize,
                    y: sq.y + row * subSize,
                    size: subSize
                });
            }
        }
    }

    return result;
}

/** Max safe iteration for Sierpinski Carpet */
export const SIERPINSKI_CARPET_MAX_ITERATION = 5;
