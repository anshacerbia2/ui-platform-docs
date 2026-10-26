// The assembly as an exploded view (TDD docs-site D19): the four contracts of a
// component drawn as machined plates, held apart on four axes through their bolt
// holes, in a true isometric, orthographic view. three.js draws it; this module is
// loaded only when the hero is shown, and only in the browser.

import {
  BoxGeometry,
  CanvasTexture,
  Color,
  EdgesGeometry,
  Group,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Raycaster,
  SRGBColorSpace,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { HOLE_AT, PLATE, paintFaces } from "./faces";
import { mix, type Palette, type Rgba } from "./palette";

/** A plate's thickness, in scene units (a unit draws about a CSS pixel). */
const T = 8;
/** The pitch between plates: held apart, and assembled (2 units of air). */
const OPEN = 128;
const SHUT = T + 2;
/** The footprint drawn under the stack, and how far the axes run past it. */
const FOOT = PLATE * 1.1;
const AXIS_RUN = 18;
/** A true isometric: the camera 35.26° above the floor, 45° round the stack. */
const ELEVATION = Math.atan(1 / Math.SQRT2);
export const REST_YAW = 45;
/** The stack's centre stays put while it closes, so it assembles in place. */
const CENTRE_Y = 1.5 * OPEN;

export type Layout = {
  width: number;
  height: number;
  /** Where the stack's centre sits across the canvas, and the width it may take. */
  centreX: number;
  room: number;
};

export type Point = { x: number; y: number };

export type AssemblyScene = {
  layout(next: Layout): void;
  setProgress(p: number): void;
  setDrop(t: number): void;
  setYaw(deg: number): void;
  setLit(i: number | null): void;
  setPalette(p: Palette): void;
  /** Each plate's outer corner on screen, in CSS pixels, bottom plate first. */
  anchors(): Point[];
  /** The plate under a point in CSS pixels, if any. */
  pick(x: number, y: number): number | null;
  render(): void;
  dispose(): void;
};

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const colour = ({ r, g, b }: Rgba) => new Color().setRGB(r, g, b, SRGBColorSpace);

const lineMaterial = (dashed = false) =>
  new LineMaterial({
    linewidth: 1,
    transparent: true,
    worldUnits: false,
    dashed,
    dashSize: 4,
    gapSize: 3,
  });

const paintLine = (m: LineMaterial, c: Rgba) => {
  m.color = colour(c);
  m.opacity = c.a;
};

const segments = (positions: number[], material: LineMaterial) => {
  const geometry = new LineSegmentsGeometry().setPositions(positions);
  const line = new LineSegments2(geometry, material);
  line.computeLineDistances();
  return line;
};

/** Creates the scene on `canvas`, or returns null where WebGL is not available. */
export function createAssemblyScene(
  canvas: HTMLCanvasElement,
  palette: Palette,
): AssemblyScene | null {
  // Ask for the context first: where there is none, the figure falls back to its text
  // without three.js logging an error (a browser with WebGL turned off, a CI runner).
  const attributes: WebGLContextAttributes = {
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  };
  const context = canvas.getContext("webgl2", attributes);
  if (!context) return null;
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, context, ...attributes });
  } catch {
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 1, 4000);
  const target = new Vector3(0, CENTRE_Y, 0);
  const anisotropy = renderer.capabilities.getMaxAnisotropy();

  let size: Layout = { width: 1, height: 1, centreX: 0.5, room: 1 };
  let progress = 0;
  let drop = 1;
  let yaw = REST_YAW;
  let lit: number | null = null;
  let current = palette;

  // ---------- the plates ----------
  const box = new BoxGeometry(PLATE, T, PLATE);
  const edgeGeometry = new LineSegmentsGeometry().fromEdgesGeometry(new EdgesGeometry(box));
  const faces = paintFaces(palette);
  const plates = faces.map((image, i) => {
    const group = new Group();
    const sides = [0, 1, 2, 3, 4, 5].map(
      () =>
        new MeshBasicMaterial({
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        }),
    );
    // the primitive has no body yet: an outline, and a body only the pointer finds
    const body = new Mesh(box, i === 0 ? new MeshBasicMaterial({ visible: false }) : sides);
    body.userData.plate = i;
    const texture = new CanvasTexture(image);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = anisotropy;
    texture.minFilter = LinearMipmapLinearFilter;
    const top = new Mesh(
      new PlaneGeometry(PLATE, PLATE),
      new MeshBasicMaterial({ map: texture, transparent: true }),
    );
    // laid flat, then turned a quarter about the vertical: the face's text runs up
    // and to the right, as the reader sees the stack from its resting corner
    top.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
    top.position.y = T / 2 + 0.05;
    const edgeMaterial = lineMaterial(i === 0);
    const edges = new LineSegments2(edgeGeometry, edgeMaterial);
    edges.computeLineDistances();
    group.add(body, top, edges);
    scene.add(group);
    return { group, body, sides, texture, top, edgeMaterial };
  });

  // ---------- the axes through the bolt holes, and the footprint ----------
  const axisMaterial = lineMaterial(true);
  const axes = segments([0, 0, 0, 0, 1, 0], axisMaterial);
  scene.add(axes);
  const footMaterial = lineMaterial(true);
  const f = FOOT / 2;
  const tick = 10;
  const foot = segments(
    [
      [-f, 0, -f, f, 0, -f],
      [f, 0, -f, f, 0, f],
      [f, 0, f, -f, 0, f],
      [-f, 0, f, -f, 0, -f],
      // a centre cross on the floor
      [-tick, 0, 0, tick, 0, 0],
      [0, 0, -tick, 0, 0, tick],
    ].flat(),
    footMaterial,
  );
  scene.add(foot);

  const lineMaterials = () => [axisMaterial, footMaterial, ...plates.map((p) => p.edgeMaterial)];

  // ---------- state to the scene ----------
  const plateY = (i: number) => {
    const pitch = OPEN + (SHUT - OPEN) * ease(progress);
    // the plates fall into place on first show, the last one last (the rise, reversed)
    const fall = 90 * (1 - ease(clamp01(drop * 1.6 - i * 0.2)));
    return CENTRE_Y + (i - 1.5) * pitch + fall;
  };

  const place = () => {
    plates.forEach((p, i) => p.group.position.set(0, plateY(i), 0));
    const bottom = plateY(0) - T / 2;
    const top = plateY(3) + T / 2;
    const h = PLATE / 2 - HOLE_AT;
    const positions: number[] = [];
    for (const x of [-h, h])
      for (const z of [-h, h]) positions.push(x, bottom - AXIS_RUN, z, x, top + AXIS_RUN, z);
    axes.geometry.setPositions(positions);
    axes.computeLineDistances();
    foot.position.y = bottom - 6;
  };

  const aim = () => {
    const a = (yaw * Math.PI) / 180;
    const dir = new Vector3(
      Math.cos(ELEVATION) * Math.sin(a),
      Math.sin(ELEVATION),
      Math.cos(ELEVATION) * Math.cos(a),
    );
    camera.position.copy(target).addScaledVector(dir, 1600);
    camera.lookAt(target);
    camera.updateMatrixWorld();
  };

  // Fit the held-apart stack and its footprint at the resting view into the room
  // given, once per size: the scale never changes while the stack closes or turns.
  const fit = () => {
    const saved = yaw;
    yaw = REST_YAW;
    aim();
    const span = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
    const v = new Vector3();
    const low = CENTRE_Y - 1.5 * OPEN - T / 2 - AXIS_RUN;
    const high = CENTRE_Y + 1.5 * OPEN + T / 2 + AXIS_RUN;
    for (const y of [low, high])
      for (const x of [-f, f])
        for (const z of [-f, f]) {
          v.set(x, y, z).applyMatrix4(camera.matrixWorldInverse);
          span.x0 = Math.min(span.x0, v.x);
          span.x1 = Math.max(span.x1, v.x);
          span.y0 = Math.min(span.y0, v.y);
          span.y1 = Math.max(span.y1, v.y);
        }
    const scale =
      Math.min(size.room / (span.x1 - span.x0), size.height / (span.y1 - span.y0)) * 0.92;
    const cx = (span.x0 + span.x1) / 2;
    const cy = (span.y0 + span.y1) / 2;
    camera.left = cx - size.centreX / scale;
    camera.right = camera.left + size.width / scale;
    camera.top = cy + size.height / 2 / scale;
    camera.bottom = camera.top - size.height / scale;
    camera.updateProjectionMatrix();
    yaw = saved;
    aim();
  };

  const paint = (p: Palette) => {
    current = p;
    const images = paintFaces(p);
    // three faces show: the top (painted) and two sides, each a step darker; a box's
    // materials run +x, -x, +y, -y, +z, -z
    const near = colour(mix(p.raised, p.text, 0.08));
    const far = colour(mix(p.raised, p.text, 0.16));
    plates.forEach((plate, i) => {
      plate.sides.forEach((m, k) => m.color.copy(k < 2 ? near : far));
      plate.texture.image = images[i] ?? plate.texture.image;
      plate.texture.needsUpdate = true;
    });
    paintLine(axisMaterial, p.faint);
    paintLine(footMaterial, p.line);
    shine();
  };

  const shine = () =>
    plates.forEach((plate, i) => {
      paintLine(plate.edgeMaterial, i === lit ? current.signal : current.edge);
      plate.edgeMaterial.linewidth = i === lit ? 1.75 : 1;
    });

  const project = (x: number, y: number, z: number): Point => {
    const v = new Vector3(x, y, z).project(camera);
    return { x: ((v.x + 1) / 2) * size.width, y: ((1 - v.y) / 2) * size.height };
  };

  const raycaster = new Raycaster();
  const pointer = new Vector2();

  paint(palette);
  place();
  aim();

  return {
    layout(next) {
      size = next;
      renderer.setSize(next.width, next.height, false);
      for (const m of lineMaterials()) m.resolution.set(next.width, next.height);
      fit();
    },
    setProgress(p) {
      progress = clamp01(p);
      place();
    },
    setDrop(t) {
      drop = clamp01(t);
      place();
    },
    setYaw(deg) {
      yaw = deg;
      aim();
    },
    setLit(i) {
      lit = i;
      shine();
    },
    setPalette: paint,
    anchors() {
      const h = PLATE / 2;
      return plates.map((_, i) => {
        const y = plateY(i);
        const corners = [
          project(h, y, h),
          project(h, y, -h),
          project(-h, y, h),
          project(-h, y, -h),
        ];
        return corners.reduce((a, b) => (b.x > a.x ? b : a));
      });
    },
    pick(x, y) {
      pointer.set((x / size.width) * 2 - 1, 1 - (y / size.height) * 2);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(plates.map((p) => p.body))[0];
      return hit ? (hit.object.userData.plate as number) : null;
    },
    render() {
      renderer.render(scene, camera);
    },
    dispose() {
      for (const plate of plates) {
        plate.texture.dispose();
        for (const m of plate.sides) m.dispose();
        plate.top.geometry.dispose();
      }
      for (const m of lineMaterials()) m.dispose();
      box.dispose();
      edgeGeometry.dispose();
      axes.geometry.dispose();
      foot.geometry.dispose();
      renderer.dispose();
    },
  };
}
