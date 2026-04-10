/**
 * Tạo các đỉnh của Bông tuyết Koch (Koch Snowflake)
 * 
 * @algorithm
 * Thuật toán Bông tuyết Koch dựa trên việc biến đổi các cạnh của một hình đa giác (thường là tam giác đều):
 * 1. Bắt đầu với một tam giác đều.
 * 2. Với mỗi cạnh của tam giác, chia nó thành 3 phần bằng nhau bởi 2 điểm P1 và P2.
 * 3. Tạo một tam giác đều mới có cạnh là đoạn P1-P2, hướng ra ngoài. Đỉnh của tam giác này gọi là Peak.
 * 4. Thay thế đoạn thẳng ban đầu bằng 4 đoạn thẳng mới: A → P1, P1 → Peak, Peak → P2, và P2 → B.
 * 5. Lặp lại quá trình này trên tất cả các cạnh mới để tạo ra hình thù giống bông tuyết.
 * 
 * @param {number} iteration - Số lần lặp (0 = tam giác đều ban đầu)
 * @returns {Float32Array} Mảng phẳng các tọa độ [x, y, x, y, ...]
 */
export function generateKochSnowflake(iteration) {
    // Bắt đầu với tam giác đều nằm ở tâm hệ tọa độ
    const size = 0.8;
    const h = size * Math.sqrt(3) / 2;
    let points = [
        { x: 0, y: h * 2/3 },
        { x: size / 2, y: -h * 1/3 },       // Đi theo chiều kim đồng hồ để mũi nhọn hướng ra ngoài
        { x: -size / 2, y: -h * 1/3 }
    ];

    // Áp dụng thuật toán chia nhỏ Koch qua từng vòng lặp
    for (let i = 0; i < iteration; i++) {
        points = kochSubdivide(points);
    }

    // Chuyển đổi mảng các đối tượng điểm thành Float32Array cho WebGL
    const vertices = new Float32Array(points.length * 2);
    for (let i = 0; i < points.length; i++) {
        vertices[i * 2] = points[i].x;
        vertices[i * 2 + 1] = points[i].y;
    }
    return vertices;
}

/**
 * Hàm chia nhỏ mỗi cạnh theo quy tắc Koch
 * Mỗi cạnh A→B trở thành A → P1 → Peak → P2 → B
 */
function kochSubdivide(points) {
    const newPoints = [];
    const n = points.length;

    for (let i = 0; i < n; i++) {
        const a = points[i];
        const b = points[(i + 1) % n];

        const dx = b.x - a.x;
        const dy = b.y - a.y;

        // Điểm P1 nằm ở vị trí 1/3 đoạn thẳng: P1 = A + 1/3 * (B - A)
        const p1 = { x: a.x + dx / 3, y: a.y + dy / 3 };

        // Điểm P2 nằm ở vị trí 2/3 đoạn thẳng: P2 = A + 2/3 * (B - A)
        const p2 = { x: a.x + 2 * dx / 3, y: a.y + 2 * dy / 3 };

        // Tìm điểm Peak bằng cách xoay đoạn P1-P2 một góc 60 độ quanh P1
        // Công thức xoay tọa độ: x' = x*cos(60) - y*sin(60), y' = x*sin(60) + y*cos(60)
        const cos60 = Math.cos(Math.PI / 3);
        const sin60 = Math.sin(Math.PI / 3);
        const pdx = p2.x - p1.x;
        const pdy = p2.y - p1.y;
        const peak = {
            x: p1.x + pdx * cos60 - pdy * sin60,
            y: p1.y + pdx * sin60 + pdy * cos60
        };

        // Thêm dãy các điểm mới vào kết quả
        newPoints.push(a, p1, peak, p2);
    }

    return newPoints;
}

/** Giới hạn số lần lặp an toàn */
export const KOCH_MAX_ITERATION = 7;
