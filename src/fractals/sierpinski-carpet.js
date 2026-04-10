/**
 * Tạo các đỉnh của Thảm Sierpinski (Sierpinski Carpet) dưới dạng các hình vuông đặc (mỗi hình vuông gồm 2 tam giác)
 * 
 * @algorithm
 * Thuật toán Thảm Sierpinski dựa trên việc phân chia đệ quy một hình vuông:
 * 1. Bắt đầu với một hình vuông đơn giản.
 * 2. Chia mỗi hình vuông thành lưới 3x3 gồm 9 hình vuông nhỏ có kích thước bằng 1/3 cạnh ban đầu.
 * 3. Loại bỏ hình vuông ở chính giữa (vị trí hàng 1, cột 1 trong lưới 0-indexed).
 * 4. Lặp lại quá trình này cho 8 hình vuông còn lại qua từng bậc lặp (iteration).
 * 
 * @param {number} iteration - Số lần lặp (0 = một hình vuông đơn ban đầu)
 * @returns {Float32Array} Mảng các đỉnh để vẽ với chế độ GL_TRIANGLES
 */
export function generateSierpinskiCarpet(iteration) {
    const s = 0.8; // Kích thước cơ sở của thảm

    // Khởi tạo hình vuông đầu tiên (nằm giữa tọa độ màn hình)
    let squares = [{ x: -s/2, y: -s/2, size: s }];

    // Thực hiện phân chia qua từng cấp độ lặp
    for (let i = 0; i < iteration; i++) {
        squares = carpetSubdivide(squares);
    }

    // Chuyển đổi danh sách hình vuông thành các đỉnh cho WebGL
    // Mỗi hình vuông = 2 tam giác = 6 đỉnh, mỗi đỉnh có 2 tọa độ (x, y) => squares.length * 12
    const vertices = new Float32Array(squares.length * 12);
    for (let i = 0; i < squares.length; i++) {
        const sq = squares[i];
        const x1 = sq.x, y1 = sq.y;
        const x2 = sq.x + sq.size, y2 = sq.y + sq.size;
        const offset = i * 12;

        /**
         * WebGL sử dụng các tam giác để tạo hình vuông.
         * Tọa độ được sắp xếp để tạo thành 2 tam giác ghép lại thành 1 hình vuông đặc.
         */
        // Tam giác 1: bottom-left, bottom-right, top-left
        vertices[offset]     = x1; vertices[offset + 1] = y1;
        vertices[offset + 2] = x2; vertices[offset + 3] = y1;
        vertices[offset + 4] = x1; vertices[offset + 5] = y2;

        // Tam giác 2: bottom-right, top-right, top-left
        vertices[offset + 6] = x2; vertices[offset + 7] = y1;
        vertices[offset + 8] = x2; vertices[offset + 9] = y2;
        vertices[offset + 10] = x1; vertices[offset + 11] = y2;
    }
    return vertices;
}

/**
 * Hàm phân chia: Mỗi hình vuông → 8 hình vuông con (loại bỏ ô giữa)
 * 
 * @details
 * Với mỗi hình vuông hiện tại, ta tính kích thước con (subSize = size / 3).
 * Sau đó chạy vòng lặp qua 3 hàng và 3 cột để xác định vị trí các ô con.
 * Điều kiện `row === 1 && col === 1` xác định ô nằm ở trung tâm để bỏ qua.
 */
function carpetSubdivide(squares) {
    const result = [];

    for (const sq of squares) {
        const subSize = sq.size / 3;

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                // Kiểm tra nếu là ô trung tâm thì không thêm vào danh sách kết quả
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

/** Giới hạn số lần lặp an toàn để tránh quá tải bộ nhớ/CPU */
export const SIERPINSKI_CARPET_MAX_ITERATION = 5;
