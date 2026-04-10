/**
 * Tạo các đỉnh của Tam giác Sierpinski (Sierpinski Triangle) dưới dạng các tam giác đặc
 * 
 * @algorithm
 * Thuật toán Tam giác Sierpinski dựa trên việc chia nhỏ một tam giác đều:
 * 1. Bắt đầu với một tam giác đều lớn.
 * 2. Tìm trung điểm của ba cạnh của tam giác đó.
 * 3. Nối các trung điểm này để tạo ra 4 tam giác nhỏ hơn bên trong.
 * 4. Giữ lại 3 tam giác ở các góc và loại bỏ tam giác ở giữa (ngược hướng).
 * 5. Lặp lại quá trình này một cách đệ quy cho 3 tam giác con còn lại.
 * 
 * @param {number} iteration - Số lần lặp (0 = một tam giác đều đơn ban đầu)
 * @returns {Float32Array} Mảng các đỉnh để vẽ với chế độ GL_TRIANGLES
 */
export function generateSierpinskiTriangle(iteration) {
    const size = 0.85; // Kích thước của tam giác lớn
    const h = size * Math.sqrt(3) / 2; // Chiều cao của tam giác đều

    // Tọa độ 3 đỉnh của tam giác đều ban đầu (bao quanh gốc tọa độ)
    const top = { x: 0, y: h * 2/3 };
    const left = { x: -size / 2, y: -h * 1/3 };
    const right = { x: size / 2, y: -h * 1/3 };

    let triangles = [{ a: top, b: left, c: right }];

    // Thực hiện quy trình chia nhỏ qua từng bậc lặp
    for (let i = 0; i < iteration; i++) {
        triangles = sierpinskiSubdivide(triangles);
    }

    // Chuyển đổi mỗi đối tượng tam giác thành 3 đỉnh cho WebGL
    // Mỗi tam giác = 3 đỉnh, mỗi đỉnh = 2 tọa độ (x, y) => triangles.length * 6
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
 * Hàm phân chia: Mỗi tam giác → 3 tam giác con (loại bỏ phần giữa)
 */
function sierpinskiSubdivide(triangles) {
    const result = [];

    for (const { a, b, c } of triangles) {
        // Tính trung điểm của các cạnh
        const ab = midpoint(a, b);
        const bc = midpoint(b, c);
        const ca = midpoint(c, a);

        // Giữ lại 3 tam giác ở 3 góc, bỏ qua tam giác trung tâm {ab, bc, ca}
        result.push(
            { a: a,  b: ab, c: ca }, // Tam giác góc trên (hoặc góc bất kỳ tùy winding)
            { a: ab, b: b,  c: bc }, // Tam giác góc dưới trái
            { a: ca, b: bc, c: c  }  // Tam giác góc dưới phải
        );
    }

    return result;
}

/** Tính trung điểm của đoạn thẳng nối giữa p1 và p2 */
function midpoint(p1, p2) {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

/** Giới hạn số lần lặp an toàn */
export const SIERPINSKI_TRI_MAX_ITERATION = 8;
