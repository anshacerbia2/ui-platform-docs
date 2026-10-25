// The hero's "12-step light tower" (WebGL 1): twelve glass rings, one per
// lightness step of the industrial theme's scale, lightest on top. Each ring
// sweeps the hue wheel at that step's OKLCH lightness; its width follows the
// step's chroma, clipped to sRGB per hue. A bead on each ring marks the brand
// hue. Ported from the Docs-Landing design (Platform Dashboard Concepts).

/** The industrial theme's 12-step scale: OKLCH lightness and chroma per step (blue). */
export const STEP_L = [0.99, 0.968, 0.933, 0.889, 0.838, 0.783, 0.723, 0.658, 0.59, 0.565, 0.5, 0.392];
export const STEP_C = [0.0003, 0.0023, 0.0091, 0.0238, 0.0486, 0.0842, 0.1288, 0.1818, 0.2373, 0.2343, 0.1447, 0.0784];

type Vec3 = [number, number, number];

/** OKLCH to linear sRGB (Björn Ottosson's OKLab matrices). */
export function oklchToLinear(L: number, C: number, h: number): Vec3 {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const lc = L + 0.3963377774 * a + 0.2158037573 * b;
  const mc = L - 0.1055613458 * a - 0.0638541728 * b;
  const sc = L - 0.0894841775 * a - 1.291485548 * b;
  const l = lc ** 3;
  const m = mc ** 3;
  const s = sc ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const encode = (x: number) => {
  const v = Math.max(0, Math.min(1, x));
  return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
};
export const oklchToSrgb = (L: number, C: number, h: number): Vec3 => oklchToLinear(L, C, h).map(encode) as Vec3;
const inGamut = (L: number, C: number, h: number) => oklchToLinear(L, C, h).every((x) => x >= -0.0005 && x <= 1.0005);
/** The largest chroma at lightness L and hue h inside sRGB (bisection). */
export function maxChroma(L: number, h: number) {
  let lo = 0;
  let hi = 0.4;
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(L, mid, h)) lo = mid;
    else hi = mid;
  }
  return lo;
}
export const hex = (c: Vec3) =>
  `#${c
    .map((x) =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")
    .toUpperCase()}`;
const luminance = (c: Vec3) => {
  const v = c.map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0]! + 0.7152 * v[1]! + 0.0722 * v[2]!;
};

export type Step = { step: number; L: number; C: number; h: number; hex: string; best: string };
export type TowerOptions = {
  hue: number;
  reducedMotion: boolean;
  /** The hovered step changed (null: none). */
  onHover: (step: Step | null) => void;
  /** Where the hovered bead is, in CSS pixels of the canvas, every frame while one is hovered. */
  onTrack: (x: number, y: number) => void;
};
export type Tower = { setHue: (hue: number) => void; reset: () => void; dispose: () => void };

// Column-major 4x4 matrices.
type Mat4 = number[];
const mul = (a: Mat4, b: Mat4): Mat4 => {
  const o: number[] = Array.from({ length: 16 }, () => 0);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + j]! * b[i * 4 + k]!;
      o[i * 4 + j] = s;
    }
  }
  return o;
};
const perspective = (f: number, aspect: number, n: number, far: number): Mat4 => {
  const t = 1 / Math.tan(f / 2);
  return [t / aspect, 0, 0, 0, 0, t, 0, 0, 0, 0, (far + n) / (n - far), -1, 0, 0, (2 * far * n) / (n - far), 0];
};
const rotateY = (a: number): Mat4 => [Math.cos(a), 0, -Math.sin(a), 0, 0, 1, 0, 0, Math.sin(a), 0, Math.cos(a), 0, 0, 0, 0, 1];
const rotateX = (a: number): Mat4 => [1, 0, 0, 0, 0, Math.cos(a), Math.sin(a), 0, 0, -Math.sin(a), Math.cos(a), 0, 0, 0, 0, 1];
const translate = (x: number, y: number, z: number): Mat4 => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
const transform = (m: Mat4, v: Vec3) =>
  [0, 1, 2, 3].map((r) => m[r]! * v[0] + m[4 + r]! * v[1] + m[8 + r]! * v[2] + m[12 + r]!) as [number, number, number, number];

const MESH_VS = `attribute vec3 aP; attribute vec3 aN; attribute vec3 aC; attribute float aA; uniform mat4 uPr; uniform mat4 uV; uniform float uY; uniform float uMir; uniform float uFloor;
varying vec3 vN; varying vec3 vC; varying vec3 vW; varying float vA; varying float vF;
void main(){ vec3 p = aP + vec3(0.0, uY, 0.0); vec3 n = aN; vF = 1.0;
  if (uMir > 0.5) { p.y = 2.0 * uFloor - p.y; n.y = -n.y; vF = clamp(1.0 - (uFloor - p.y) / 2.6, 0.0, 1.0); }
  vW = p; vN = n; vC = aC; vA = aA; glcPosition = uPr * uV * vec4(p, 1.0); }`;
const MESH_FS = `precision highp float; uniform vec3 uE; uniform float uDim; uniform float uMode; uniform float uScan; uniform float uAlpha;
varying vec3 vN; varying vec3 vC; varying vec3 vW; varying float vA; varying float vF;
void main(){
  if (uMode > 0.5) { float a = vA * uDim * vF * uAlpha; glcFragColor = vec4(vC * a, a); return; }
  vec3 N = normalize(vN); vec3 L = normalize(vec3(0.3, 1.0, 0.5)); vec3 V = normalize(uE - vW);
  float d = max(dot(N, L), 0.0); float side = 1.0 - abs(N.y); float fr = pow(1.0 - max(dot(N, V), 0.0), 2.5);
  vec3 H = normalize(L + V); float sp = pow(max(dot(N, H), 0.0), 80.0) * 0.35;
  vec3 c = vC * mix(0.92 + 0.08 * d, 1.08 + 0.2 * fr, side) + vec3(sp) + vec3(fr * 0.12);
  float sg = exp(-pow((vW.y - uScan) / 0.09, 2.0));
  c += vC * sg * 0.55 + vec3(sg * 0.12);
  float a = uAlpha * vF; glcFragColor = vec4(min(c, vec3(1.0)) * uDim * a, a); }`;
const POINT_VS = `attribute vec3 aP; attribute vec3 aC; attribute float aS; uniform mat4 uPr; uniform mat4 uV; uniform float uPx; varying vec3 vC;
void main(){ glcPosition = uPr * uV * vec4(aP, 1.0); glcPointSize = aS * uPx; vC = aC; }`;
const POINT_FS = `precision mediump float; varying vec3 vC;
void main(){ vec2 q = glcPointCoord * 2.0 - 1.0; float r = length(q); if (r > 1.0) discard;
  float core = 1.0 - smoothstep(0.3, 0.42, r); float ring = smoothstep(0.42, 0.5, r) * (1.0 - smoothstep(0.56, 0.64, r));
  float glow = pow(1.0 - r, 2.0) * 0.8 + ring * 0.6; vec3 c = mix(vC * glow, vec3(1.0), core); float a = max(core, glow);
  glcFragColor = vec4(c, a); }`;
const LINE_VS = "attribute vec3 aP; uniform mat4 uPr; uniform mat4 uV; void main(){ glcPosition = uPr * uV * vec4(aP, 1.0); }";
const LINE_FS = "precision mediump float; uniform vec4 uCol; void main(){ glcFragColor = vec4(uCol.rgb * uCol.a, uCol.a); }";

const SEGMENTS = 180;
const INNER = 0.7;
const THICKNESS = 0.045;
const SPACING = 0.56;
const HALO = 0.5;
const ringRadius = (i: number) => INNER + 0.5 + STEP_C[i]! * 9;

const yawFor = (h: number) => -Math.PI / 2 - (h * Math.PI) / 180 + 0.55;
const wrap = (a: number, a0: number) => a0 + ((((a - a0) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;

/** Starts the tower on `canvas`; returns null when WebGL is unavailable. */
export function startTower(canvas: HTMLCanvasElement, options: TowerOptions): Tower | null {
  const gl = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: true });
  if (!gl) return null;
  const link = (vs: string, fs: string) => {
    const program = gl.createProgram();
    for (const [kind, source] of [
      [gl.VERTEX_SHADER, vs],
      [gl.FRAGMENT_SHADER, fs],
    ] as const) {
      const shader = gl.createShader(kind)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
  };
  const meshProgram = link(MESH_VS, MESH_FS);
  const pointProgram = link(POINT_VS, POINT_FS);
  const lineProgram = link(LINE_VS, LINE_FS);
  if (!meshProgram || !pointProgram || !lineProgram) return null;

  // Ring meshes: top, outer side, inner side, bottom; plus a soft halo outside each ring.
  const solid: { buffer: WebGLBuffer; count: number }[] = [];
  const halo: { buffer: WebGLBuffer; count: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const L = STEP_L[i]!;
    const R = ringRadius(i);
    const colors: Vec3[] = [];
    for (let j = 0; j <= SEGMENTS; j++) {
      const h = (j / SEGMENTS) * 360;
      colors.push(oklchToSrgb(L, Math.min(STEP_C[i]!, maxChroma(L, h)), h));
    }
    const v: number[] = [];
    const hv: number[] = [];
    const P = (arr: number[], x: number, y: number, z: number, nx: number, ny: number, nz: number, c: Vec3, a: number) =>
      arr.push(x, y, z, nx, ny, nz, c[0], c[1], c[2], a);
    for (let j = 0; j < SEGMENTS; j++) {
      const a0 = (j / SEGMENTS) * Math.PI * 2;
      const a1 = ((j + 1) / SEGMENTS) * Math.PI * 2;
      const c0 = colors[j]!;
      const c1 = colors[j + 1]!;
      const [x0, z0, x1, z1] = [Math.cos(a0), Math.sin(a0), Math.cos(a1), Math.sin(a1)];
      const T = THICKNESS;
      P(v, x0 * INNER, T, z0 * INNER, 0, 1, 0, c0, 1);
      P(v, x0 * R, T, z0 * R, 0, 1, 0, c0, 1);
      P(v, x1 * R, T, z1 * R, 0, 1, 0, c1, 1);
      P(v, x0 * INNER, T, z0 * INNER, 0, 1, 0, c0, 1);
      P(v, x1 * R, T, z1 * R, 0, 1, 0, c1, 1);
      P(v, x1 * INNER, T, z1 * INNER, 0, 1, 0, c1, 1);
      P(v, x0 * R, 0, z0 * R, x0, 0, z0, c0, 1);
      P(v, x1 * R, 0, z1 * R, x1, 0, z1, c1, 1);
      P(v, x1 * R, T, z1 * R, x1, 0, z1, c1, 1);
      P(v, x0 * R, 0, z0 * R, x0, 0, z0, c0, 1);
      P(v, x1 * R, T, z1 * R, x1, 0, z1, c1, 1);
      P(v, x0 * R, T, z0 * R, x0, 0, z0, c0, 1);
      P(v, x0 * INNER, 0, z0 * INNER, -x0, 0, -z0, c0, 1);
      P(v, x1 * INNER, T, z1 * INNER, -x1, 0, -z1, c1, 1);
      P(v, x1 * INNER, 0, z1 * INNER, -x1, 0, -z1, c1, 1);
      P(v, x0 * INNER, 0, z0 * INNER, -x0, 0, -z0, c0, 1);
      P(v, x0 * INNER, T, z0 * INNER, -x0, 0, -z0, c0, 1);
      P(v, x1 * INNER, T, z1 * INNER, -x1, 0, -z1, c1, 1);
      P(v, x0 * INNER, 0, z0 * INNER, 0, -1, 0, c0, 1);
      P(v, x1 * R, 0, z1 * R, 0, -1, 0, c1, 1);
      P(v, x0 * R, 0, z0 * R, 0, -1, 0, c0, 1);
      P(v, x0 * INNER, 0, z0 * INNER, 0, -1, 0, c0, 1);
      P(v, x1 * INNER, 0, z1 * INNER, 0, -1, 0, c1, 1);
      P(v, x1 * R, 0, z1 * R, 0, -1, 0, c1, 1);
      const RH = R + HALO;
      const yh = T * 0.5;
      const ai = 0.06 + STEP_C[i]! * 1.5;
      P(hv, x0 * R, yh, z0 * R, 0, 1, 0, c0, ai);
      P(hv, x0 * RH, yh, z0 * RH, 0, 1, 0, c0, 0);
      P(hv, x1 * RH, yh, z1 * RH, 0, 1, 0, c1, 0);
      P(hv, x0 * R, yh, z0 * R, 0, 1, 0, c0, ai);
      P(hv, x1 * RH, yh, z1 * RH, 0, 1, 0, c1, 0);
      P(hv, x1 * R, yh, z1 * R, 0, 1, 0, c1, ai);
    }
    for (const [list, data] of [
      [solid, v],
      [halo, hv],
    ] as const) {
      const buffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      list.push({ buffer, count: data.length / 10 });
    }
  }

  // The brand pillar: one bead per step at the brand hue.
  let hue = options.hue;
  let pillar: (Step & { r: number; color: Vec3 })[] = [];
  const rebuild = () => {
    pillar = STEP_L.map((L, i) => {
      const C = Math.min(STEP_C[i]!, maxChroma(L, hue));
      const color = oklchToSrgb(L, C, hue);
      const onWhite = 1.05 / (luminance(color) + 0.05);
      const onInk = (luminance(color) + 0.05) / 0.05;
      return {
        r: ringRadius(i) + HALO * 0.6,
        color,
        step: i + 1,
        L,
        C,
        h: hue,
        hex: hex(color),
        best: onWhite >= onInk ? `white text ${onWhite.toFixed(1)}:1` : `ink text ${onInk.toFixed(1)}:1`,
      };
    });
  };
  rebuild();

  const uniform = (program: WebGLProgram, names: string[]) =>
    Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(program, n)])) as Record<string, WebGLUniformLocation | null>;
  const MU = uniform(meshProgram, ["uPr", "uV", "uY", "uMir", "uFloor", "uE", "uDim", "uMode", "uScan", "uAlpha"]);
  const MA = {
    aP: gl.getAttribLocation(meshProgram, "aP"),
    aN: gl.getAttribLocation(meshProgram, "aN"),
    aC: gl.getAttribLocation(meshProgram, "aC"),
    aA: gl.getAttribLocation(meshProgram, "aA"),
  };
  const PU = uniform(pointProgram, ["uPr", "uV", "uPx"]);
  const PA = { aP: gl.getAttribLocation(pointProgram, "aP"), aC: gl.getAttribLocation(pointProgram, "aC"), aS: gl.getAttribLocation(pointProgram, "aS") };
  const LU = uniform(lineProgram, ["uPr", "uV", "uCol"]);
  const LA = gl.getAttribLocation(lineProgram, "aP");
  const dynamic = gl.createBuffer();
  const bindMesh = (mesh: { buffer: WebGLBuffer }) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
    gl.enableVertexAttribArray(MA.aP);
    gl.vertexAttribPointer(MA.aP, 3, gl.FLOAT, false, 40, 0);
    gl.enableVertexAttribArray(MA.aN);
    gl.vertexAttribPointer(MA.aN, 3, gl.FLOAT, false, 40, 12);
    gl.enableVertexAttribArray(MA.aC);
    gl.vertexAttribPointer(MA.aC, 3, gl.FLOAT, false, 40, 24);
    gl.enableVertexAttribArray(MA.aA);
    gl.vertexAttribPointer(MA.aA, 1, gl.FLOAT, false, 40, 36);
  };
  const unbindMesh = () => {
    gl.disableVertexAttribArray(MA.aN);
    gl.disableVertexAttribArray(MA.aC);
    gl.disableVertexAttribArray(MA.aA);
  };

  const reduce = options.reducedMotion;
  const PITCH0 = 0.42;
  const PMIN = 0.08;
  const PMAX = 1.25;
  let yaw0 = yawFor(hue);
  const S = {
    yaw: yaw0,
    pitch: PITCH0,
    vx: 0,
    drag: false,
    lastX: 0,
    lastY: 0,
    upAt: 0,
    resetting: false,
    mx: -1,
    my: -1,
    hover: -1,
    raf: 0,
    last: performance.now(),
    grow: reduce ? 1 : 0,
    t0: performance.now(),
  };
  const onMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    S.mx = event.clientX - rect.left;
    S.my = event.clientY - rect.top;
    if (!S.drag) return;
    const dx = event.clientX - S.lastX;
    const dy = event.clientY - S.lastY;
    S.lastX = event.clientX;
    S.lastY = event.clientY;
    S.yaw += dx * 0.008;
    S.pitch = Math.max(PMIN, Math.min(PMAX, S.pitch + dy * 0.006));
    S.vx = dx * 0.008;
  };
  const onDown = (event: PointerEvent) => {
    S.drag = true;
    S.resetting = false;
    S.lastX = event.clientX;
    S.lastY = event.clientY;
    S.vx = 0;
    canvas.dataset.dragging = "";
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // A pointer that is already gone cannot be captured.
    }
  };
  const onUp = () => {
    if (S.drag) S.upAt = performance.now();
    S.drag = false;
    delete canvas.dataset.dragging;
  };
  const onLeave = () => {
    S.mx = -1;
    S.my = -1;
  };
  const onDouble = () => {
    S.resetting = true;
  };
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("lostpointercapture", onUp);
  canvas.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("dblclick", onDouble);

  const frame = (now: number) => {
    const dt = Math.min(50, now - S.last) / 16.7;
    S.last = now;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const ch = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }
    gl.viewport(0, 0, cw, ch);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    S.grow += (1 - S.grow) * (reduce ? 1 : 0.03);
    const g = 1 - (1 - Math.min(1, S.grow)) ** 3;
    if (!S.drag) {
      S.yaw += S.vx;
      S.vx *= 0.94;
      if (!reduce && S.hover < 0) S.yaw += 0.0016 * dt;
      if (S.resetting || now - S.upAt > 900) S.pitch += (PITCH0 - S.pitch) * 0.04;
      if (S.resetting) {
        S.yaw = wrap(S.yaw, yaw0);
        S.yaw += (yaw0 - S.yaw) * 0.08;
        if (Math.abs(S.yaw - yaw0) < 0.003) S.resetting = false;
      }
    }
    const time = (now - S.t0) / 1000;
    const sp = SPACING * g;
    const ys = (i: number) => (5.5 - i) * sp + 0.25;
    const floorY = ys(11) - 0.55;
    const scanY = reduce ? -99 : ys(11) + ((Math.sin(time * 0.55) + 1) / 2) * (ys(0) - ys(11) + THICKNESS);

    const dist = 29;
    const inverse = mul(rotateY(-S.yaw), rotateX(-S.pitch));
    const eye: Vec3 = [inverse[8]! * dist, inverse[9]! * dist, inverse[10]! * dist];
    const Pm = perspective(0.3, cw / ch, 1, 120);
    const Vm = mul(translate(0, -0.1, -dist), mul(rotateX(S.pitch), rotateY(S.yaw)));

    gl.useProgram(meshProgram);
    gl.uniformMatrix4fv(MU.uPr!, false, Pm);
    gl.uniformMatrix4fv(MU.uV!, false, Vm);
    gl.uniform3fv(MU.uE!, eye);
    gl.uniform1f(MU.uFloor!, floorY);
    gl.uniform1f(MU.uScan!, scanY);

    // Reflection on the glass floor, then halos.
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);
    gl.uniform1f(MU.uMir!, 1);
    gl.uniform1f(MU.uMode!, 0);
    gl.uniform1f(MU.uAlpha!, 0.2);
    gl.uniform1f(MU.uDim!, 1);
    for (let i = 11; i >= 0; i--) {
      bindMesh(solid[i]!);
      gl.uniform1f(MU.uY!, ys(i));
      gl.drawArrays(gl.TRIANGLES, 0, solid[i]!.count);
    }
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.uniform1f(MU.uMode!, 1);
    gl.uniform1f(MU.uAlpha!, 0.5);
    for (let i = 11; i >= 0; i--) {
      bindMesh(halo[i]!);
      gl.uniform1f(MU.uY!, ys(i));
      gl.drawArrays(gl.TRIANGLES, 0, halo[i]!.count);
    }
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);

    // The rings, dimmed except the hovered one.
    gl.uniform1f(MU.uMir!, 0);
    gl.uniform1f(MU.uMode!, 0);
    gl.uniform1f(MU.uAlpha!, 1);
    for (let i = 0; i < 12; i++) {
      bindMesh(solid[i]!);
      gl.uniform1f(MU.uY!, ys(i));
      gl.uniform1f(MU.uDim!, S.hover >= 0 && S.hover !== i ? 0.42 : 1);
      gl.drawArrays(gl.TRIANGLES, 0, solid[i]!.count);
    }
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.depthMask(false);
    gl.uniform1f(MU.uMode!, 1);
    gl.uniform1f(MU.uAlpha!, 1);
    for (let i = 0; i < 12; i++) {
      bindMesh(halo[i]!);
      gl.uniform1f(MU.uY!, ys(i));
      gl.uniform1f(MU.uDim!, S.hover >= 0 ? (S.hover === i ? 1.8 : 0.3) : 0.85);
      gl.drawArrays(gl.TRIANGLES, 0, halo[i]!.count);
    }
    unbindMesh();

    // The brand pillar: a line through the beads, then the beads.
    const M = mul(Pm, Vm);
    const angle = (hue * Math.PI) / 180;
    const [ca, sa] = [Math.cos(angle), Math.sin(angle)];
    const lines: number[] = [];
    const points: number[] = [];
    const screen: [number, number][] = [];
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    pillar.forEach((q, k) => {
      const p: Vec3 = [ca * q.r, ys(k) + THICKNESS * 0.5, sa * q.r];
      points.push(p[0], p[1], p[2], q.color[0], q.color[1], q.color[2], S.hover === k ? 40 : 28);
      const c = transform(M, p);
      screen.push([((c[0] / c[3]) * 0.5 + 0.5) * cssW, (1 - ((c[1] / c[3]) * 0.5 + 0.5)) * cssH]);
      const next = pillar[k + 1];
      if (next) lines.push(p[0], p[1], p[2], ca * next.r, ys(k + 1) + THICKNESS * 0.5, sa * next.r);
    });
    gl.useProgram(lineProgram);
    gl.uniformMatrix4fv(LU.uPr!, false, Pm);
    gl.uniformMatrix4fv(LU.uV!, false, Vm);
    gl.bindBuffer(gl.ARRAY_BUFFER, dynamic);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(LA);
    gl.vertexAttribPointer(LA, 3, gl.FLOAT, false, 12, 0);
    gl.uniform4f(LU.uCol!, 0.75, 0.88, 1, 0.55 * g);
    gl.drawArrays(gl.LINES, 0, lines.length / 3);
    gl.useProgram(pointProgram);
    gl.uniformMatrix4fv(PU.uPr!, false, Pm);
    gl.uniformMatrix4fv(PU.uV!, false, Vm);
    gl.uniform1f(PU.uPx!, ch / 640);
    gl.bindBuffer(gl.ARRAY_BUFFER, dynamic);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(PA.aP);
    gl.vertexAttribPointer(PA.aP, 3, gl.FLOAT, false, 28, 0);
    gl.enableVertexAttribArray(PA.aC);
    gl.vertexAttribPointer(PA.aC, 3, gl.FLOAT, false, 28, 12);
    gl.enableVertexAttribArray(PA.aS);
    gl.vertexAttribPointer(PA.aS, 1, gl.FLOAT, false, 28, 24);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);
    gl.drawArrays(gl.POINTS, 0, pillar.length);
    gl.disableVertexAttribArray(PA.aC);
    gl.disableVertexAttribArray(PA.aS);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.disable(gl.BLEND);

    // Hover: the nearest bead within 22 px.
    let best = -1;
    let bestDistance = 22;
    let bx = 0;
    let by = 0;
    if (S.mx >= 0 && !S.drag) {
      screen.forEach(([x, y], i) => {
        const d = Math.hypot(x - S.mx, y - S.my);
        if (d < bestDistance) {
          bestDistance = d;
          best = i;
          bx = x;
          by = y;
        }
      });
    }
    if (best !== S.hover) {
      S.hover = best;
      const q = pillar[best];
      options.onHover(q ? { step: q.step, L: q.L, C: q.C, h: q.h, hex: q.hex, best: q.best } : null);
    }
    if (best >= 0) options.onTrack(bx, by);
    S.raf = requestAnimationFrame(frame);
  };
  S.raf = requestAnimationFrame(frame);

  return {
    setHue: (next) => {
      hue = next;
      rebuild();
      yaw0 = yawFor(next);
    },
    reset: () => {
      S.resetting = true;
      S.vx = 0;
    },
    dispose: () => {
      cancelAnimationFrame(S.raf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("lostpointercapture", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("dblclick", onDouble);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
