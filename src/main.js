// Fractal Explorer — Main entry point
import { WebGLRenderer, mat3Identity, mat3Multiply, mat3Translate, mat3Scale } from './webgl/renderer.js';
import { generateKochSnowflake, KOCH_MAX_ITERATION } from './fractals/koch.js';
import { generateMinkowskiIsland, MINKOWSKI_MAX_ITERATION } from './fractals/minkowski.js';
import { generateSierpinskiTriangle, SIERPINSKI_TRI_MAX_ITERATION } from './fractals/sierpinski-triangle.js';
import { generateSierpinskiCarpet, SIERPINSKI_CARPET_MAX_ITERATION } from './fractals/sierpinski-carpet.js';

// ─── Fractal Configuration ───────────────────────────────────────────
const FRACTAL_CONFIG = {
    'koch': {
        generate: generateKochSnowflake,
        maxIter: KOCH_MAX_ITERATION,
        drawMode: 'LINE_LOOP',
        color: [0, 0.94, 1, 1],          // #00f0ff
        cssColor: 'var(--color-koch)',
        accentRgb: '0, 240, 255'
    },
    'minkowski': {
        generate: generateMinkowskiIsland,
        maxIter: MINKOWSKI_MAX_ITERATION,
        drawMode: 'LINE_LOOP',
        color: [1, 0, 0.67, 1],          // #ff00aa
        cssColor: 'var(--color-minkowski)',
        accentRgb: '255, 0, 170'
    },
    'sierpinski-triangle': {
        generate: generateSierpinskiTriangle,
        maxIter: SIERPINSKI_TRI_MAX_ITERATION,
        drawMode: 'TRIANGLES',
        color: [0, 1, 0.53, 1],          // #00ff88
        cssColor: 'var(--color-sierpinski-tri)',
        accentRgb: '0, 255, 136'
    },
    'sierpinski-carpet': {
        generate: generateSierpinskiCarpet,
        maxIter: SIERPINSKI_CARPET_MAX_ITERATION,
        drawMode: 'TRIANGLES',
        color: [1, 0.67, 0, 1],          // #ffaa00
        cssColor: 'var(--color-sierpinski-carpet)',
        accentRgb: '255, 170, 0'
    }
};

// ─── DOM Elements ────────────────────────────────────────────────────
const canvas = document.getElementById('gl-canvas');
const canvasContainer = document.getElementById('canvas-container');
const iterationSlider = document.getElementById('iteration-slider');
const iterationValue = document.getElementById('iteration-value');
const btnPlay = document.getElementById('btn-play');
const btnReset = document.getElementById('btn-reset');
const btnFit = document.getElementById('btn-fit');
const navItems = document.querySelectorAll('.nav-item');

// ─── App State ───────────────────────────────────────────────────────
let currentFractal = 'koch';
let currentIteration = 0;
let transform = mat3Identity();
let isPlaying = false;
let animationTimer = null;

// ─── WebGL Init ──────────────────────────────────────────────────────
const renderer = new WebGLRenderer(canvas);

// ─── Render Function ─────────────────────────────────────────────────
function render() {
    renderer.resize();
    renderer.clear();

    const config = FRACTAL_CONFIG[currentFractal];
    const vertices = config.generate(currentIteration);
    const gl = renderer.getGL();
    const drawMode = gl[config.drawMode];

    // Build transform: apply aspect ratio correction then user transform
    const aspect = canvas.width / canvas.height;
    let aspectMatrix;
    if (aspect > 1) {
        aspectMatrix = mat3Scale(1 / aspect, 1);
    } else {
        aspectMatrix = mat3Scale(1, aspect);
    }

    const finalTransform = mat3Multiply(aspectMatrix, transform);
    renderer.draw(vertices, drawMode, config.color, finalTransform);
}

// ─── Sidebar Navigation ─────────────────────────────────────────────
function switchFractal(fractalKey) {
    currentFractal = fractalKey;
    const config = FRACTAL_CONFIG[fractalKey];

    // Update active nav item
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.fractal === fractalKey);
    });

    // Update CSS accent color
    document.documentElement.style.setProperty('--accent', config.cssColor);
    document.documentElement.style.setProperty('--accent-rgb', config.accentRgb);

    // Update slider max
    iterationSlider.max = config.maxIter;

    // Clamp current iteration
    if (currentIteration > config.maxIter) {
        currentIteration = config.maxIter;
        iterationSlider.value = currentIteration;
    }

    iterationValue.textContent = currentIteration;

    // Update canvas glow
    canvasContainer.style.boxShadow = `inset 0 0 60px rgba(${config.accentRgb}, 0.03), 0 0 30px rgba(${config.accentRgb}, 0.02)`;

    render();
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        stopAnimation();
        switchFractal(item.dataset.fractal);
    });
});

// ─── Iteration Slider ────────────────────────────────────────────────
iterationSlider.addEventListener('input', (e) => {
    currentIteration = parseInt(e.target.value);
    iterationValue.textContent = currentIteration;
    render();
});

// ─── Play / Pause Animation ─────────────────────────────────────────
function startAnimation() {
    const config = FRACTAL_CONFIG[currentFractal];
    isPlaying = true;
    btnPlay.textContent = '⏸ Pause';
    btnPlay.classList.add('playing');

    currentIteration = 0;
    iterationSlider.value = 0;
    iterationValue.textContent = 0;
    render();

    animationTimer = setInterval(() => {
        currentIteration++;
        if (currentIteration > config.maxIter) {
            stopAnimation();
            return;
        }
        iterationSlider.value = currentIteration;
        iterationValue.textContent = currentIteration;
        render();
    }, 500);
}

function stopAnimation() {
    isPlaying = false;
    btnPlay.textContent = '▶ Play';
    btnPlay.classList.remove('playing');
    if (animationTimer) {
        clearInterval(animationTimer);
        animationTimer = null;
    }
}

btnPlay.addEventListener('click', () => {
    if (isPlaying) {
        stopAnimation();
    } else {
        startAnimation();
    }
});

// ─── Reset ───────────────────────────────────────────────────────────
btnReset.addEventListener('click', () => {
    stopAnimation();
    currentIteration = 0;
    iterationSlider.value = 0;
    iterationValue.textContent = 0;
    transform = mat3Identity();
    render();
});

// ─── Fit ─────────────────────────────────────────────────────────────
btnFit.addEventListener('click', () => {
    transform = mat3Identity();
    render();
});

// ─── Zoom (Mouse Wheel) ─────────────────────────────────────────────
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;

    // Get cursor position in normalized coords (-1 to 1)
    const rect = canvas.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const my = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    // Zoom around cursor: translate to cursor, scale, translate back
    const t1 = mat3Translate(mx, my);
    const s = mat3Scale(zoomFactor, zoomFactor);
    const t2 = mat3Translate(-mx, -my);

    transform = mat3Multiply(t1, mat3Multiply(s, mat3Multiply(t2, transform)));
    render();
}, { passive: false });

// ─── Pan (Mouse Drag) ────────────────────────────────────────────────
let isDragging = false;
let lastMouse = { x: 0, y: 0 };

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouse = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const rect = canvas.getBoundingClientRect();
    const dx = ((e.clientX - lastMouse.x) / rect.width) * 2;
    const dy = -((e.clientY - lastMouse.y) / rect.height) * 2;

    transform = mat3Multiply(mat3Translate(dx, dy), transform);
    lastMouse = { x: e.clientX, y: e.clientY };
    render();
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

// ─── Touch Support (mobile zoom/pan) ─────────────────────────────────
let lastTouchDist = 0;
let lastTouchCenter = { x: 0, y: 0 };

canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        isDragging = true;
        lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
        isDragging = false;
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        lastTouchDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
        lastTouchCenter = {
            x: (t0.clientX + t1.clientX) / 2,
            y: (t0.clientY + t1.clientY) / 2
        };
    }
}, { passive: true });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const dx = ((touch.clientX - lastMouse.x) / rect.width) * 2;
        const dy = -((touch.clientY - lastMouse.y) / rect.height) * 2;
        transform = mat3Multiply(mat3Translate(dx, dy), transform);
        lastMouse = { x: touch.clientX, y: touch.clientY };
        render();
    } else if (e.touches.length === 2) {
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
        const zoomFactor = dist / lastTouchDist;
        lastTouchDist = dist;

        const rect = canvas.getBoundingClientRect();
        const cx = (((t0.clientX + t1.clientX) / 2 - rect.left) / rect.width) * 2 - 1;
        const cy = -(((t0.clientY + t1.clientY) / 2 - rect.top) / rect.height) * 2 + 1;

        const tr1 = mat3Translate(cx, cy);
        const sc = mat3Scale(zoomFactor, zoomFactor);
        const tr2 = mat3Translate(-cx, -cy);
        transform = mat3Multiply(tr1, mat3Multiply(sc, mat3Multiply(tr2, transform)));
        render();
    }
}, { passive: false });

canvas.addEventListener('touchend', () => {
    isDragging = false;
});

// ─── Window Resize ───────────────────────────────────────────────────
window.addEventListener('resize', () => {
    render();
});

// ─── Initial Render ──────────────────────────────────────────────────
switchFractal('koch');
console.log('Fractal Explorer initialized');
