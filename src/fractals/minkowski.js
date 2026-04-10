/**
 * Tạo các đỉnh của Đảo Minkowski (Minkowski Island - Đường cong Sausage)
 * 
 * @algorithm
 * Thuật toán Đảo Minkowski biến đổi một hình vuông bằng cách thay thế mỗi cạnh:
 * 1. Bắt đầu với một hình vuông đơn giản.
 * 2. Mỗi cạnh được chia thành 4 phần bằng nhau.
 * 3. Thay thế mỗi cạnh bằng một mẫu gồm 8 đoạn thẳng với các góc vuông hướng ra ngoài và vào trong.
 * 4. Quy luật mẫu: Tiến 1/4, Rẽ trái, Tiến 1/4, Rẽ phải, Rẽ phải, Tiến 1/4, Rẽ trái, Tiến 1/4.
 * 
 * @param {number} iteration - Số lần lặp (0 = hình vuông đơn ban đầu)
 * @returns {Float32Array} Mảng các tọa độ [x, y, ...]
 */
export function generateMinkowskiIsland(iteration) {
    // Bắt đầu với một hình vuông cơ bản làm khung
    const s = 0.6;
    let points = [
        { x: -s, y: -s },
        { x:  s, y: -s },
        { x:  s, y:  s },
        { x: -s, y:  s }
    ];

    // Thực hiện biến đổi Minkowski qua từng bậc lặp
    for (let i = 0; i < iteration; i++) {
        points = minkowskiSubdivide(points);
    }

    // Chuyển đổi sang định dạng Float32Array cho WebGL
    const vertices = new Float32Array(points.length * 2);
    for (let i = 0; i < points.length; i++) {
        vertices[i * 2] = points[i].x;
        vertices[i * 2 + 1] = points[i].y;
    }
    return vertices;
}

/**
 * Hàm phân chia theo mẫu Minkowski sausage: mỗi đoạn thẳng → 8 đoạn nhỏ
 * Mẫu: thẳng 1/4, trái 1/4, thẳng 1/4, phải 1/4, phải 1/4, thẳng 1/4, trái 1/4, thẳng 1/4
 */
function minkowskiSubdivide(points) {
    const newPoints = [];
    const n = points.length;

    for (let i = 0; i < n; i++) {
        const a = points[i];
        const b = points[(i + 1) % n];

        // Tính toán các thành phần thay đổi tọa độ
        const dx = (b.x - a.x) / 4;
        const dy = (b.y - a.y) / 4;

        // Vectơ pháp tuyến (vuông góc với cạnh hiện tại, dùng để tạo độ nhô)
        const nx = -dy;
        const ny = dx;

        /**
         * Tạo 8 điểm trung gian để hình thành mẫu "xúc xích" (sausage pattern)
         * p2, p3 tạo đoạn nhô lên; p5, p6 tạo đoạn lõm xuống (hoặc ngược lại tùy winding)
         */
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

/** Giới hạn số lần lặp an toàn */
export const MINKOWSKI_MAX_ITERATION = 4;
