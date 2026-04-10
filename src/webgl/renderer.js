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
