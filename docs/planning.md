# 📐 Tiểu Luận: Tìm Hiểu Đồ Họa Fractal

> **Môn học:** CS106  
> **Công nghệ:** JavaScript + WebGL  
> **Loại bài:** Tiểu luận nhóm  

---

## 🎯 Mục Tiêu

Xây dựng ứng dụng đồ họa fractal sử dụng **WebGL** (JavaScript) để vẽ và tương tác với các hình fractal kinh điển. Ứng dụng cho phép người dùng quan sát quá trình sinh fractal qua từng mức đệ quy (iteration).

---

## 📋 Yêu Cầu Đề Bài

### 2.1 — Bông Tuyết Koch (Koch Snowflake)
- Tìm hiểu thuật toán sinh đường cong Koch
- Vẽ bông tuyết Koch bằng WebGL
- Hỗ trợ thay đổi số mức đệ quy (iteration level)

### 2.2 — Đảo Minkowski (Minkowski Sausage / Island)
- Tìm hiểu thuật toán sinh đường cong Minkowski
- Vẽ đảo Minkowski bằng WebGL
- Hỗ trợ thay đổi số mức đệ quy

### 2.3 — Tam Giác Sierpinski & Thảm Sierpinski
- **Sierpinski Triangle:** Vẽ tam giác Sierpinski bằng WebGL
- **Sierpinski Carpet:** Vẽ hình vuông Sierpinski (thảm Sierpinski) bằng WebGL
- Hỗ trợ thay đổi số mức đệ quy cho cả hai loại

---

## 🛠️ Tech Stack

| Thành phần | Công nghệ |
|---|---|
| **Ngôn ngữ** | JavaScript (ES6+) |
| **Đồ họa** | WebGL **raw** (không dùng Three.js hay thư viện đồ họa nào — tự viết shader, buffer, bindung) |
| **Giao diện** | HTML5 + CSS3 |
| **Đóng gói EXE** | Neutralino.js (Single Binary mode) |
| **Build tool** | Vite (dev server + bundling) |

---

## 📁 Cấu Trúc Dự Án (Dự Kiến)

```
fractal/
├── docs/
│   ├── planning.md              # Tài liệu kế hoạch (file này)
│   ├── Neutralino.md            # Kế hoạch đóng gói Neutralino (STANDALONE)
│   └── optimize_electron.md     # Tài liệu tối ưu (Backup)
├── src/
│   ├── main.js                  # Logic chính - khởi tạo WebGL, controls
│   ├── style.css                # Stylesheet chính (dark theme + glassmorphism)
│   ├── fractals/                # Thuật toán sinh fractal
│   └── webgl/                   # Renderer và Matrix utils
├── resources/                   # Thư mục chứa code sau khi Vite build
├── Release/                     # Thư mục nộp bài (Chứa duy nhất file .exe)
├── package.json
├── neutralino.config.json       # Cấu hình chính của Neutralino
├── vite.config.js
└── .gitignore
```

---

## 🧮 Thuật Toán Tổng Quan

### Koch Snowflake
1. Bắt đầu với tam giác đều
2. Với mỗi cạnh, chia thành 3 đoạn bằng nhau
3. Trên đoạn giữa, dựng tam giác đều hướng ra ngoài, loại bỏ đáy
4. Lặp lại cho tất cả các cạnh mới → mỗi lần lặp tăng số cạnh lên 4 lần

### Minkowski Island (Sausage)
1. Bắt đầu với hình vuông (hoặc đoạn thẳng)
2. Mỗi đoạn thẳng được thay thế bằng generator gồm 8 đoạn nhỏ (tạo dạng "xúc xích")
3. Lặp lại cho tất cả các đoạn mới

### Sierpinski Triangle
1. Bắt đầu với tam giác đều
2. Tìm trung điểm 3 cạnh, nối lại tạo 4 tam giác con
3. Loại bỏ tam giác ở giữa
4. Lặp lại cho 3 tam giác còn lại

### Sierpinski Carpet
1. Bắt đầu với hình vuông
2. Chia thành lưới 3×3 (9 ô vuông nhỏ)
3. Loại bỏ ô vuông ở giữa
4. Lặp lại cho 8 ô vuông còn lại

---

## 🎨 Thiết Kế Giao Diện (UI/UX)

### Layout chính
- **Sidebar trái:** Menu chọn loại fractal (Koch, Minkowski, Sierpinski Triangle, Sierpinski Carpet)
- **Canvas giữa:** Vùng vẽ WebGL chiếm phần lớn màn hình
- **Control panel dưới/phải:** 
  - Slider điều chỉnh iteration level (0–7)
  - Nút Play/Pause animation
  - Color picker cho đường vẽ / fill
  - Nút Reset / Zoom controls

### Phong cách
- Dark theme chủ đạo
- Hiệu ứng glow/neon cho đường fractal
- Smooth animation khi chuyển đổi giữa các mức đệ quy
- Responsive cho nhiều kích thước màn hình

---

## 📦 Bài Nộp

### Phần 1: Source
- Toàn bộ source code JavaScript/HTML/CSS
- File `package.json` với danh sách dependencies
- Hướng dẫn cài đặt và chạy (`README.md`)

### Phần 2: Release
- File thực thi `.exe` (đóng gói bằng Neutralino.js - Single Binary)
- Chạy độc lập (Single File) trên Windows, dung lượng siêu nhẹ ~1.7MB

---

## 📅 Kế Hoạch Thực Hiện

| Giai đoạn | Công việc | Thời gian (dự kiến) |
|---|---|---|
| **Phase 1** | Setup project (Vite + Electron), WebGL boilerplate | 1–2 ngày |
| **Phase 2** | Implement Koch Snowflake | 2–3 ngày |
| **Phase 3** | Implement Minkowski Island | 2–3 ngày |
| **Phase 4** | Implement Sierpinski Triangle + Carpet | 2–3 ngày |
| **Phase 5** | UI/UX: sidebar, controls, animations | 2–3 ngày |
| **Phase 6** | Đóng gói Neutralino → Single EXE, testing | ✅ Done |
| **Phase 7** | Viết báo cáo, review code | 1–2 ngày |

---

## ✅ Checklist

- [x] Setup project (Vite + Electron) — ✅ Vite dev server, Electron config ready
- [x] WebGL renderer cơ bản (canvas, shader pipeline) — ✅ `src/webgl/renderer.js`
- [x] Koch Snowflake — thuật toán + vẽ — ✅ `src/fractals/koch.js`
- [x] Minkowski Island — thuật toán + vẽ — ✅ `src/fractals/minkowski.js`
- [x] Sierpinski Triangle — thuật toán + vẽ — ✅ `src/fractals/sierpinski-triangle.js`
- [x] Sierpinski Carpet — thuật toán + vẽ — ✅ `src/fractals/sierpinski-carpet.js`
- [x] UI Controls (iteration slider, fractal selector) — ✅ full integration
- [x] Animation chuyển đổi mức đệ quy — ✅ Play/Pause button
- [x] Dark theme + hiệu ứng glow — ✅ `src/style.css` glassmorphism theme
- [x] Đóng gói EXE bằng Neutralino.js — ✅ Done (Single Binary mode)
- [x] Viết README hướng dẫn — ✅ Done
- [x] Test trên Windows — ✅ Done (Sửa lỗi 404, chạy độc lập)
- [x] Chuẩn bị bài nộp (Source + Release) — ✅ Done

### 🔧 Tiến Độ Thực Hiện (Cập nhật: 2026-04-10)

| Task | Nội dung | Trạng thái |
|---|---|---|
| 1 | Project setup Vite | ✅ Done |
| 2 | WebGL Renderer | ✅ Done |
| 3 | Koch Snowflake | ✅ Done |
| 4 | Minkowski Island | ✅ Done |
| 5 | Sierpinski Triangle | ✅ Done |
| 6 | Sierpinski Carpet | ✅ Done |
| 7 | CSS Dark Theme | ✅ Done |
| 8 | Main.js Integration | ✅ Done |
| 9 | Polish & Glow | ✅ Done |
| 10 | Neutralino EXE (Single) | ✅ Done |

### 🎯 Các tính năng đã hoạt động:
- ✅ 4 loại fractal (Koch, Minkowski, Sierpinski Triangle, Sierpinski Carpet)
- ✅ Sidebar chuyển đổi fractal + đổi màu accent
- ✅ Iteration slider điều chỉnh mức đệ quy
- ✅ Play/Pause animation tự động
- ✅ Zoom bằng scroll wheel (zoom quanh cursor)
- ✅ Pan bằng kéo chuột
- ✅ Reset view & Fit to screen
- ✅ Dark theme + glassmorphism + neon glow
- ✅ Responsive layout (sidebar thu nhỏ < 768px)
- ✅ Touch support cho mobile

---

## 📚 Tài Liệu Tham Khảo

- [WebGL Fundamentals](https://webglfundamentals.org/)
- [Fractal - Wikipedia](https://en.wikipedia.org/wiki/Fractal)
- [Koch Snowflake - Wikipedia](https://en.wikipedia.org/wiki/Koch_snowflake)
- [Minkowski Sausage - Wikipedia](https://en.wikipedia.org/wiki/Minkowski_sausage)
- [Sierpinski Triangle - Wikipedia](https://en.wikipedia.org/wiki/Sierpi%C5%84ski_triangle)
- [Sierpinski Carpet - Wikipedia](https://en.wikipedia.org/wiki/Sierpi%C5%84ski_carpet)
- [Neutralino.js Documentation](https://neutralino.js.org/docs)
- [Vite Guide](https://vitejs.dev/guide/)
