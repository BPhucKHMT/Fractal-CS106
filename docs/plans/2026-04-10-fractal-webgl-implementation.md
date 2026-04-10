# Fractal WebGL — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Xây dựng ứng dụng single-page vẽ 4 loại fractal (Koch Snowflake, Minkowski Island, Sierpinski Triangle, Sierpinski Carpet) bằng WebGL raw, có animation và zoom/pan.

**Architecture:** CPU tính toán vertices fractal → đẩy vào WebGL buffer → vertex/fragment shader render. Single page với sidebar chọn fractal, control bar điều khiển iteration/animation. Dark theme với neon glow.

**Tech Stack:** JavaScript ES6+ (vanilla), WebGL 1.0 raw, HTML5, CSS3, Vite (dev server), Google Fonts (Inter, JetBrains Mono)

---

## Task 1: Project Setup & Vite Config

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/style.css` (skeleton)
- Create: `src/main.js` (skeleton)

**Step 1: Initialize project with Vite**

```bash
npm init -y
npm install --save-dev vite
```

**Step 2: Create `vite.config.js`**

```js
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    open: true,
    port: 3000
  },
  build: {
    outDir: 'dist'
  }
});
```

**Step 3: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Fractal Graphics Explorer - Koch Snowflake, Minkowski Island, Sierpinski Triangle & Carpet rendered with WebGL">
    <title>Fractal Explorer — WebGL</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/src/style.css">
</head>
<body>
    <div id="app">
        <aside id="sidebar">
            <div class="sidebar-header">
                <h1>Fractal Explorer</h1>
            </div>
            <nav id="fractal-nav">
                <button class="nav-item active" data-fractal="koch">
                    <span class="nav-icon">❄</span>
                    <span class="nav-label">Koch Snowflake</span>
                </button>
                <button class="nav-item" data-fractal="minkowski">
                    <span class="nav-icon">🏝</span>
                    <span class="nav-label">Minkowski Island</span>
                </button>
                <button class="nav-item" data-fractal="sierpinski-triangle">
                    <span class="nav-icon">△</span>
                    <span class="nav-label">Sierpinski Triangle</span>
                </button>
                <button class="nav-item" data-fractal="sierpinski-carpet">
                    <span class="nav-icon">▦</span>
                    <span class="nav-label">Sierpinski Carpet</span>
                </button>
            </nav>
        </aside>
        <main id="main-content">
            <div id="canvas-container">
                <canvas id="gl-canvas"></canvas>
            </div>
            <div id="controls">
                <div class="control-group">
                    <label for="iteration-slider">Iteration: <span id="iteration-value">0</span></label>
                    <input type="range" id="iteration-slider" min="0" max="7" value="0" step="1">
                </div>
                <div class="control-group control-buttons">
                    <button id="btn-play" title="Play animation">▶ Play</button>
                    <button id="btn-reset" title="Reset view">↺ Reset</button>
                    <button id="btn-fit" title="Fit to screen">⊞ Fit</button>
                </div>
            </div>
        </main>
    </div>
    <script type="module" src="/src/main.js"></script>
</body>
</html>
```

**Step 4: Create skeleton `src/style.css`**

Chỉ tạo file rỗng với comment:

```css
/* Fractal Explorer — Styles (sẽ implement ở Task 7) */
```

**Step 5: Create skeleton `src/main.js`**

```js
// Fractal Explorer — Main entry point
console.log('Fractal Explorer loaded');
```

**Step 6: Add scripts to `package.json`**

Thêm vào `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Step 7: Verify — chạy dev server**

```bash
npm run dev
```

Expected: Browser mở `localhost:3000`, thấy trang trắng, console log "Fractal Explorer loaded".

**Step 8: Commit**

```bash
git init
git add -A
git commit -m "chore: project setup with Vite"
```

---

## Task 2: WebGL Renderer Module

**Files:**
- Create: `src/webgl/renderer.js`

**Step 1: Implement WebGL renderer**

File `src/webgl/renderer.js`:

```js
// Vertex shader source
const VERTEX_SHADER_SRC = `
attribute vec2 a_position;
uniform mat3 u_transform;
uniform vec4 u_color;
varying vec4 v_color;

void main() {
    vec3 pos = u_transform * vec3(a_position, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
    v_color = u_color;
}
`;

// Fragment shader source
const FRAGMENT_SHADER_SRC = `
precision mediump float;
varying vec4 v_color;

void main() {
    gl_FragColor = v_color;
}
`;

export class WebGLRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }

        this.program = null;
        this.positionBuffer = null;
        this.locations = {};

        this._initShaders();
        this._initBuffers();
        this._initLocations();
    }

    _compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error('Shader compile error: ' + info);
        }
        return shader;
    }

    _initShaders() {
        const gl = this.gl;
        const vertShader = this._compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
        const fragShader = this._compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);

        this.program = gl.createProgram();
        gl.attachShader(this.program, vertShader);
        gl.attachShader(this.program, fragShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            throw new Error('Program link error: ' + gl.getProgramInfoLog(this.program));
        }

        gl.useProgram(this.program);
    }

    _initBuffers() {
        const gl = this.gl;
        this.positionBuffer = gl.createBuffer();
    }

    _initLocations() {
        const gl = this.gl;
        this.locations = {
            position: gl.getAttribLocation(this.program, 'a_position'),
            transform: gl.getUniformLocation(this.program, 'u_transform'),
            color: gl.getUniformLocation(this.program, 'u_color')
        };
        gl.enableVertexAttribArray(this.locations.position);
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    clear(r = 0.039, g = 0.039, b = 0.059, a = 1.0) {
        const gl = this.gl;
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    /**
     * Draw vertices with given parameters
     * @param {Float32Array} vertices - Flat array of [x,y, x,y, ...]
     * @param {number} drawMode - gl.LINES, gl.LINE_LOOP, gl.TRIANGLES, etc.
     * @param {number[]} color - [r, g, b, a] in 0-1 range
     * @param {Float32Array} transformMatrix - 3x3 column-major matrix
     */
    draw(vertices, drawMode, color, transformMatrix) {
        const gl = this.gl;

        // Upload vertices
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

        // Set position attribute
        gl.vertexAttribPointer(this.locations.position, 2, gl.FLOAT, false, 0, 0);

        // Set uniforms
        gl.uniformMatrix3fv(this.locations.transform, false, transformMatrix);
        gl.uniform4fv(this.locations.color, color);

        // Draw
        gl.drawArrays(drawMode, 0, vertices.length / 2);
    }

    getGL() {
        return this.gl;
    }
}

/**
 * Create identity 3x3 matrix (column-major for WebGL)
 */
export function mat3Identity() {
    return new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ]);
}

/**
 * Multiply two 3x3 matrices (column-major)
 */
export function mat3Multiply(a, b) {
    const out = new Float32Array(9);
    for (let col = 0; col < 3; col++) {
        for (let row = 0; row < 3; row++) {
            out[col * 3 + row] =
                a[0 * 3 + row] * b[col * 3 + 0] +
                a[1 * 3 + row] * b[col * 3 + 1] +
                a[2 * 3 + row] * b[col * 3 + 2];
        }
    }
    return out;
}

/**
 * Create translation matrix
 */
export function mat3Translate(tx, ty) {
    return new Float32Array([
        1, 0, 0,
        0, 1, 0,
        tx, ty, 1
    ]);
}

/**
 * Create scale matrix
 */
export function mat3Scale(sx, sy) {
    return new Float32Array([
        sx, 0, 0,
        0, sy, 0,
        0, 0, 1
    ]);
}
```

**Step 2: Verify — import vào main.js và kiểm tra WebGL init**

Cập nhật `src/main.js`:

```js
import { WebGLRenderer, mat3Identity } from './webgl/renderer.js';

const canvas = document.getElementById('gl-canvas');
const renderer = new WebGLRenderer(canvas);
renderer.resize();
renderer.clear();

// Test: vẽ tam giác
const testVertices = new Float32Array([
    0.0,  0.5,
   -0.5, -0.5,
    0.5, -0.5
]);
renderer.draw(testVertices, renderer.getGL().TRIANGLES, [0, 0.94, 1, 1], mat3Identity());

console.log('WebGL renderer initialized');
```

Expected: Tam giác cyan hiện trên nền tối.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: WebGL renderer module with shader pipeline"
```

---

## Task 3: Koch Snowflake

**Files:**
- Create: `src/fractals/koch.js`

**Step 1: Implement Koch Snowflake generator**

File `src/fractals/koch.js`:

```js
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

        // Peak = rotate P1→P2 by -60° around P1
        const cos60 = Math.cos(-Math.PI / 3);
        const sin60 = Math.sin(-Math.PI / 3);
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
```

**Step 2: Verify — render Koch trong main.js**

Cập nhật `src/main.js` để import và vẽ Koch thay vì tam giác test.

Expected: Iteration 0 = tam giác, iteration 3 = bông tuyết rõ ràng.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: Koch Snowflake fractal generator"
```

---

## Task 4: Minkowski Island

**Files:**
- Create: `src/fractals/minkowski.js`

**Step 1: Implement Minkowski Island generator**

File `src/fractals/minkowski.js`:

```js
/**
 * Generate Minkowski Island (Sausage) vertices
 * @param {number} iteration - Number of iterations (0 = square)
 * @returns {Float32Array}
 */
export function generateMinkowskiIsland(iteration) {
    // Start with a square
    const s = 0.6;
    let points = [
        { x: -s, y: -s },
        { x:  s, y: -s },
        { x:  s, y:  s },
        { x: -s, y:  s }
    ];

    for (let i = 0; i < iteration; i++) {
        points = minkowskiSubdivide(points);
    }

    const vertices = new Float32Array(points.length * 2);
    for (let i = 0; i < points.length; i++) {
        vertices[i * 2] = points[i].x;
        vertices[i * 2 + 1] = points[i].y;
    }
    return vertices;
}

/**
 * Minkowski sausage generator: each segment → 8 segments
 * Pattern: forward 1/4, left 1/4, forward 1/4, right 1/4, right 1/4, forward 1/4, left 1/4, forward 1/4
 */
function minkowskiSubdivide(points) {
    const newPoints = [];
    const n = points.length;

    for (let i = 0; i < n; i++) {
        const a = points[i];
        const b = points[(i + 1) % n];

        const dx = (b.x - a.x) / 4;
        const dy = (b.y - a.y) / 4;

        // Normal vector (perpendicular, pointing outward)
        const nx = -dy;
        const ny = dx;

        // 8 intermediate points creating the Minkowski sausage pattern
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

/** Max safe iteration for Minkowski */
export const MINKOWSKI_MAX_ITERATION = 4;
```

**Step 2: Verify**

Expected: Iteration 0 = hình vuông, iteration 2 = dạng sausage rõ ràng.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: Minkowski Island fractal generator"
```

---

## Task 5: Sierpinski Triangle

**Files:**
- Create: `src/fractals/sierpinski-triangle.js`

**Step 1: Implement Sierpinski Triangle generator**

File `src/fractals/sierpinski-triangle.js`:

```js
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
```

**Step 2: Verify**

Expected: Iteration 0 = tam giác đầy, iteration 4 = pattern Sierpinski rõ.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: Sierpinski Triangle fractal generator"
```

---

## Task 6: Sierpinski Carpet

**Files:**
- Create: `src/fractals/sierpinski-carpet.js`

**Step 1: Implement Sierpinski Carpet generator**

File `src/fractals/sierpinski-carpet.js`:

```js
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
```

**Step 2: Verify**

Expected: Iteration 0 = hình vuông, iteration 3 = carpet pattern rõ.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: Sierpinski Carpet fractal generator"
```

---

## Task 7: CSS — Full Dark Theme UI

**Files:**
- Modify: `src/style.css` (rewrite toàn bộ)

**Step 1: Implement complete stylesheet**

File `src/style.css` — phải bao gồm đầy đủ:

1. **CSS Reset & Variables** — custom properties cho colors, spacing, fonts
2. **Body & App layout** — flexbox sidebar + main
3. **Sidebar** — glassmorphism background, nav items với hover/active states, glow border
4. **Canvas container** — fill remaining space, aspect-ratio responsive
5. **Controls** — custom range slider styling, button styles, neon hover glow
6. **Typography** — Inter for UI text, JetBrains Mono for numbers
7. **Responsive** — collapse sidebar < 768px
8. **Animations** — fade transition, button hover pulse

Key CSS variables:

```css
:root {
    --bg-primary: #0a0a0f;
    --bg-sidebar: rgba(20, 20, 35, 0.85);
    --bg-card: rgba(30, 30, 50, 0.6);
    --text-primary: #e0e0e8;
    --text-secondary: #888899;
    --color-koch: #00f0ff;
    --color-minkowski: #ff00aa;
    --color-sierpinski-tri: #00ff88;
    --color-sierpinski-carpet: #ffaa00;
    --font-ui: 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --accent: var(--color-koch); /* changes with active fractal */
}
```

**Step 2: Verify**

Expected: Dark theme, sidebar trái với 4 items, canvas giữa, control bar dưới. Tất cả styled đẹp.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: complete dark theme UI with glassmorphism"
```

---

## Task 8: Main.js — Full Integration

**Files:**
- Modify: `src/main.js` (rewrite toàn bộ)

**Step 1: Implement full application logic**

`src/main.js` phải kết nối tất cả modules:

1. **Imports** — renderer, all 4 fractal generators
2. **State** — currentFractal, currentIteration, transform matrix (zoom/pan), isPlaying
3. **Sidebar navigation** — click handler, update active class, switch fractal, update `--accent` CSS variable
4. **Iteration slider** — input handler, recalculate & re-render
5. **Play/Pause** — animate iteration 0→max with 500ms delay per step
6. **Reset** — iteration=0, identity transform, re-render
7. **Fit** — reset transform to identity
8. **Zoom** — mouse wheel → scale transform around cursor
9. **Pan** — mouse drag → translate transform
10. **Render loop** — `requestAnimationFrame` based render, clear + draw
11. **Resize** — window resize handler, re-render
12. **Color mapping** — fractal type → [r,g,b,a] color
13. **Draw mode mapping** — fractal type → GL draw mode (LINE_LOOP or TRIANGLES)
14. **Max iteration mapping** — fractal type → max iteration value, update slider max

```js
const FRACTAL_CONFIG = {
    'koch': {
        generate: generateKochSnowflake,
        maxIter: KOCH_MAX_ITERATION,
        drawMode: 'LINE_LOOP',
        color: [0, 0.94, 1, 1],        // #00f0ff
        cssColor: '--color-koch'
    },
    'minkowski': {
        generate: generateMinkowskiIsland,
        maxIter: MINKOWSKI_MAX_ITERATION,
        drawMode: 'LINE_LOOP',
        color: [1, 0, 0.67, 1],        // #ff00aa
        cssColor: '--color-minkowski'
    },
    'sierpinski-triangle': {
        generate: generateSierpinskiTriangle,
        maxIter: SIERPINSKI_TRI_MAX_ITERATION,
        drawMode: 'TRIANGLES',
        color: [0, 1, 0.53, 1],        // #00ff88
        cssColor: '--color-sierpinski-tri'
    },
    'sierpinski-carpet': {
        generate: generateSierpinskiCarpet,
        maxIter: SIERPINSKI_CARPET_MAX_ITERATION,
        drawMode: 'TRIANGLES',
        color: [1, 0.67, 0, 1],        // #ffaa00
        cssColor: '--color-sierpinski-carpet'
    }
};
```

**Step 2: Verify**

Kiểm tra trên browser:
- [ ] Chuyển fractal qua sidebar → canvas vẽ đúng
- [ ] Slider thay đổi iteration → fractal thay đổi
- [ ] Play button → animate từ 0→max
- [ ] Scroll zoom, drag pan hoạt động
- [ ] Reset và Fit hoạt động
- [ ] Glow effect thay đổi màu theo fractal

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: full app integration with controls, zoom/pan, animation"
```

---

## Task 9: Polish & Glow Effects

**Files:**
- Modify: `src/style.css` (thêm glow effects)
- Modify: `src/main.js` (thêm canvas glow sync)

**Step 1: Add dynamic glow to canvas**

Khi chuyển fractal, cập nhật `box-shadow` của canvas container:

```js
canvasContainer.style.boxShadow = `0 0 30px ${cssColor}33, 0 0 60px ${cssColor}11`;
```

**Step 2: Add line width for LINE_LOOP fractals**

Kiểm tra `gl.lineWidth()` — nếu browser hỗ trợ, set width > 1 cho Koch & Minkowski. Nếu không, vẽ bằng `GL_TRIANGLES` strip thay thế (fallback).

**Step 3: Verify toàn bộ app**

Mở browser, kiểm tra tất cả 4 fractal, animation, zoom/pan, glow effects.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: polish UI with glow effects and line rendering"
```

---

## Task 10: Electron Packaging

**Files:**
- Create: `electron/main.js`
- Modify: `package.json` (thêm electron scripts & config)

**Step 1: Install Electron**

```bash
npm install --save-dev electron electron-builder
```

**Step 2: Create `electron/main.js`**

```js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        icon: path.join(__dirname, '../public/icon.png')
    });

    // Load the Vite build output
    win.loadFile(path.join(__dirname, '../dist/index.html'));
    win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
```

**Step 3: Update `package.json`**

```json
{
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron": "npm run build && electron .",
    "dist": "npm run build && electron-builder"
  },
  "build": {
    "appId": "com.cs106.fractal-explorer",
    "productName": "Fractal Explorer",
    "directories": { "output": "release" },
    "win": {
      "target": "portable"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ]
  }
}
```

**Step 4: Build EXE**

```bash
npm run dist
```

Expected: File `.exe` portable trong thư mục `release/`.

**Step 5: Test EXE** — chạy thử file exe, kiểm tra tất cả fractal hoạt động.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: Electron packaging for Windows EXE"
```

---

## Summary

| Task | Nội dung | Output |
|---|---|---|
| 1 | Project setup Vite | Dev server chạy |
| 2 | WebGL Renderer | Shader pipeline hoạt động |
| 3 | Koch Snowflake | Fractal vẽ đúng |
| 4 | Minkowski Island | Fractal vẽ đúng |
| 5 | Sierpinski Triangle | Fractal vẽ đúng |
| 6 | Sierpinski Carpet | Fractal vẽ đúng |
| 7 | CSS Dark Theme | UI hoàn chỉnh |
| 8 | Main.js Integration | App hoạt động đầy đủ |
| 9 | Polish & Glow | UI premium |
| 10 | Electron EXE | File .exe chạy được |

