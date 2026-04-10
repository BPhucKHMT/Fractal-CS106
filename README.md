# 🌌 Fractal Explorer — WebGL & Neutralino.js

Dự án đồ họa WebGL raw chuyên sâu về thế giới Fractal, được đóng gói thành ứng dụng desktop siêu nhẹ sử dụng Neutralino.js. Dự án được thực hiện cho môn học **CS106 - Đồ họa máy tính**.
<img width="1012" height="761" alt="image" src="https://github.com/user-attachments/assets/48f00b0a-9a87-4b7b-b5df-81dad60581f4" />

## 🎨 Tính năng chính

Ứng dụng cho phép khám phá 4 loại Fractal kinh điển với khả năng tương tác mượt mà:
*   ❄️ **Bông tuyết Koch (Koch Snowflake)**
*   🏝️ **Đảo Minkowski (Minkowski Island)**
*   △ **Tam giác Sierpinski (Sierpinski Triangle)**
*   ▦ **Thảm Sierpinski (Sierpinski Carpet)**

**Công nghệ tương tác:**
*   **Iteration Control:** Slider điều chỉnh mức độ đệ quy (từ 0 đến 7).
*   **Navigation:** Hỗ trợ Phóng to (Zoom) và Kéo (Pan) bằng chuột.
*   **Animation:** Chế độ Play tự động chạy các mức đệ quy.
*   **Rich UI:** Giao diện Dark Theme hiện đại với hiệu ứng Glassmorphism và Neon Glow.

## 🛠️ Công nghệ sử dụng

*   **Đồ họa:** WebGL raw (GLSL) — Không sử dụng thư viện đồ họa bên thứ ba.
*   **Ngôn ngữ:** JavaScript (ES6+), HTML5, CSS3.
*   **Đóng gói:** Neutralino.js (Single Binary mode) — Dung lượng cực nhẹ (~1.7 MB).
*   **Build Tool:** Vite.

## 📁 Cấu trúc thư mục

```text
fractal/
├── src/                # Mã nguồn chính (WebGL renderer, Thuật toán Fractal)
├── Release/            # Bản phân phối (Chứa duy nhất file FractalExplorer.exe)
├── docs/               # Tài liệu kế hoạch và hướng dẫn tối ưu
├── neutralino.config.json # Cấu hình Neutralino.js
├── package.json        # Danh sách Dependencies và Scripts
└── vite.config.js      # Cấu hình Vite Build
```

## 🚀 Hướng dẫn chạy ứng dụng

### 1. Đối với người chấm bài (Dành cho bản EXE)
*   Mở thư mục `Release/`.
*   Chạy file **`FractalExplorer.exe`**. Ứng dụng chạy độc lập, không cần cài đặt.

### 2. Đối với lập trình viên (Chế độ phát triển)
Cần cài đặt [Node.js](https://nodejs.org/).
```bash
# Cài đặt dependencies
npm install

# Chạy dev server (Vite)
npm run dev

# Đóng gói ra bản EXE đơn nhất
npm run dist
```

## 📚 Tài liệu tham khảo
*   [WebGL Fundamentals](https://webglfundamentals.org/)
*   [Fractal - Wikipedia](https://en.wikipedia.org/wiki/Fractal)
*   [Neutralino.js Documentation](https://neutralino.js.org/)

---
**CS106 - Fractal Project**
