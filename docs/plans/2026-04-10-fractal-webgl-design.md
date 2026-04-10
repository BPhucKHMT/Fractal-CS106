# Fractal WebGL — Design Document

> **Ngày:** 2026-04-10  
> **Dự án:** Tiểu luận CS106 — Đồ họa Fractal  
> **Tech stack:** JavaScript (ES6+) + WebGL 1.0 raw + HTML5/CSS3  
> **Đóng gói:** Electron (wrap cuối cùng)

---

## Quyết Định Thiết Kế

| Câu hỏi | Quyết định |
|---|---|
| Mức tương tác | **Trung bình** — Animation grow, zoom/pan, slider iteration |
| Render approach | **CPU-side geometry → WebGL draw** — Tính vertices trên JS, vẽ bằng GL |
| Navigation | **Single Page + Sidebar** — 1 canvas WebGL, chuyển fractal qua sidebar |
| Electron timing | **Wrap cuối cùng** — Dev trên browser, đóng gói EXE ở phase cuối |

---

## Kiến Trúc

```
┌─────────────────────────────────────────────────┐
│  Sidebar (trái)    │     WebGL Canvas (giữa)    │
│                    │                             │
│  🔹 Koch Snowflake │     [Fractal rendered here] │
│  🔸 Minkowski      │                             │
│  🔹 Sierpinski △   │                             │
│  🔸 Sierpinski ■   │                             │
│                    │                             │
│                    ├─────────────────────────────│
│                    │  Control Bar (dưới canvas)  │
│                    │  [Slider] [Play] [Reset]    │
└────────────────────┴─────────────────────────────┘
```

### Data Flow

1. User chọn fractal từ sidebar → `switchFractal(type)`
2. `FractalGenerator` tính mảng vertices trên CPU theo iteration level
3. Vertices đẩy vào WebGL buffer (`gl.bufferData`)
4. Vertex shader transform tọa độ (zoom/pan matrix), fragment shader tô màu
5. Slider thay đổi → recalculate vertices → re-render
6. Animation mode: tự động tăng iteration 0→N, delay 500ms/step

### Modules

| Module | Trách nhiệm |
|---|---|
| `main.js` | Khởi tạo WebGL, bindung event, điều phối |
| `webgl-renderer.js` | Wrapper cho WebGL API (shader, buffer, draw) |
| `koch.js` | Thuật toán sinh vertices Koch Snowflake |
| `minkowski.js` | Thuật toán sinh vertices Minkowski Island |
| `sierpinski-triangle.js` | Thuật toán sinh vertices Sierpinski Triangle |
| `sierpinski-carpet.js` | Thuật toán sinh vertices Sierpinski Carpet |
| `controls.js` | Slider, buttons, zoom/pan handling |

---

## WebGL Pipeline

### Shader — Vertex

```glsl
attribute vec2 a_position;
uniform mat3 u_transform;
uniform vec4 u_color;
varying vec4 v_color;

void main() {
    vec3 pos = u_transform * vec3(a_position, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
    v_color = u_color;
}
```

### Shader — Fragment

```glsl
precision mediump float;
varying vec4 v_color;

void main() {
    gl_FragColor = v_color;
}
```

### Render Modes

| Fractal | GL Draw Mode |
|---|---|
| Koch Snowflake | `GL_LINE_LOOP` |
| Minkowski Island | `GL_LINE_LOOP` |
| Sierpinski Triangle | `GL_TRIANGLES` |
| Sierpinski Carpet | `GL_TRIANGLES` |

### Zoom & Pan

- Affine transform matrix 3×3 (uniform `u_transform`)
- Scroll wheel → scale (zoom quanh con trỏ)
- Click-drag → translate (pan)
- `requestAnimationFrame` cho render loop

---

## Thuật Toán

### Koch Snowflake
- Bắt đầu: 3 đỉnh tam giác đều
- Mỗi cạnh AB: chia 3, dựng tam giác đều trên đoạn giữa (xoay -60°)
- Thay 1 cạnh → 4 cạnh. Số đỉnh: `3 × 4^n`
- Max iteration: 7

### Minkowski Island
- Bắt đầu: 4 đỉnh hình vuông
- Mỗi cạnh → 8 đoạn theo generator pattern (bậc thang)
- Số đỉnh: `4 × 8^n`
- Max iteration: 4

### Sierpinski Triangle
- Bắt đầu: 1 tam giác đều
- Mỗi tam giác → 3 tam giác con (bỏ giữa)
- Số tam giác: `3^n`, render `GL_TRIANGLES`
- Max iteration: 8

### Sierpinski Carpet
- Bắt đầu: 1 hình vuông
- Chia 3×3, giữ 8 ô, bỏ giữa
- Mỗi ô = 2 triangles. Số ô: `8^n`
- Max iteration: 5

---

## UI/UX

### Color Palette — Dark Theme

| Element | Hex |
|---|---|
| Background | `#0a0a0f` |
| Sidebar BG | `rgba(20,20,35,0.85)` |
| Koch | `#00f0ff` (cyan neon) |
| Minkowski | `#ff00aa` (magenta neon) |
| Sierpinski Triangle | `#00ff88` (green neon) |
| Sierpinski Carpet | `#ffaa00` (amber neon) |
| Text chính | `#e0e0e8` |
| Text phụ | `#888899` |

### Hiệu ứng
- Glow: CSS box-shadow theo màu fractal
- Sidebar hover: scale 1.02 + border highlight
- Slider: custom range input với gradient
- Transition: fade 200ms khi switch fractal
- Fonts: Inter (UI) + JetBrains Mono (numbers)

### Controls
- Slider iteration (0 → max)
- Play button: auto-animate 0→max
- Reset: iteration 0, reset zoom/pan
- Fit: zoom vừa canvas

### Responsive
- Sidebar collapse < 768px
- Controls stack dọc trên mobile
- Canvas chiếm toàn bộ không gian còn lại
