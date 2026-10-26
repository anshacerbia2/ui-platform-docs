import { css, type Palette } from "./palette";

/** A plate's side, in scene units; a face is painted in these units. */
export const PLATE = 200;
/** Where a plate's bolt holes sit, from each corner, and their radius. */
export const HOLE_AT = 14;
const HOLE_R = 4.5;
/** The texture's pixels per unit: crisp at twice the plate's size on screen. */
const K = 1024 / PLATE;

type Paint = (g: CanvasRenderingContext2D, p: Palette) => void;

const face = (paint: Paint, p: Palette) => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = PLATE * K;
  const g = canvas.getContext("2d");
  if (g) {
    g.scale(K, K);
    paint(g, p);
  }
  return canvas;
};

const hairline = (
  g: CanvasRenderingContext2D,
  inset: number,
  colour: string,
  dash: number[] = [],
) => {
  g.save();
  g.setLineDash(dash);
  g.lineWidth = 1;
  g.strokeStyle = colour;
  g.strokeRect(inset + 0.5, inset + 0.5, PLATE - 2 * inset - 1, PLATE - 2 * inset - 1);
  g.restore();
};

// The four bolt holes every plate shares: the assembly's axes run through them.
const holes = (g: CanvasRenderingContext2D, p: Palette, filled: boolean) => {
  for (const x of [HOLE_AT, PLATE - HOLE_AT])
    for (const y of [HOLE_AT, PLATE - HOLE_AT]) {
      g.beginPath();
      g.arc(x, y, HOLE_R, 0, Math.PI * 2);
      if (filled) {
        g.fillStyle = css(p.ground);
        g.fill();
      }
      g.lineWidth = 1;
      g.strokeStyle = css(p.edge);
      g.stroke();
    }
};

const ground = (g: CanvasRenderingContext2D, p: Palette) => {
  g.fillStyle = css(p.canvas);
  g.fillRect(0, 0, PLATE, PLATE);
  hairline(g, 8, css(p.line));
  holes(g, p, true);
};

// 01 · the primitive: native behaviour, no look yet. Drawn as an outline only.
const primitive: Paint = (g, p) => {
  hairline(g, 8, css(p.faint), [4, 3]);
  holes(g, p, false);
  g.fillStyle = css(p.muted);
  g.font = `500 15px ${p.mono}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("<button>", PLATE / 2, PLATE / 2);
};

// 02 · the component: the design system's Button, drawn as it renders on this page.
const component: Paint = (g, p) => {
  ground(g, p);
  const b = p.button;
  const x = (PLATE - b.width) / 2;
  const y = (PLATE - b.height) / 2;
  g.fillStyle = css(b.fill);
  g.beginPath();
  g.roundRect(x, y, b.width, b.height, Math.min(b.radius, b.height / 2));
  g.fill();
  g.fillStyle = css(b.ink);
  g.font = b.font;
  g.letterSpacing = `${b.letterSpacing}px`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(b.label, PLATE / 2, PLATE / 2 + 0.5);
};

// 03 · the tokens: the primary scheme's roles, four to a row.
const tokens: Paint = (g, p) => {
  ground(g, p);
  const n = p.swatches.length;
  if (!n) return;
  const cols = 4;
  const rows = Math.ceil(n / cols);
  const pad = 26;
  const gap = 5;
  const cell = (PLATE - 2 * pad - (cols - 1) * gap) / cols;
  const top = (PLATE - rows * cell - (rows - 1) * gap) / 2;
  p.swatches.forEach((colour, k) => {
    g.fillStyle = css(colour);
    g.fillRect(
      pad + (k % cols) * (cell + gap),
      top + Math.floor(k / cols) * (cell + gap),
      cell,
      cell,
    );
  });
};

// 04 · the release: a seal with the check, the evidence that it works.
const release: Paint = (g, p) => {
  ground(g, p);
  const s = 88;
  const o = (PLATE - s) / 2;
  g.lineWidth = 1;
  g.strokeStyle = css(p.edge);
  g.strokeRect(o + 0.5, o + 0.5, s - 1, s - 1);
  g.strokeStyle = css(p.line);
  g.strokeRect(o + 8.5, o + 8.5, s - 17, s - 17);
  const k = 44 / 24;
  g.save();
  // the face is turned a quarter in the scene; an eighth back stands the check upright
  g.translate(PLATE / 2, PLATE / 2);
  g.rotate(Math.PI / 4);
  g.scale(k, k);
  g.translate(-12, -12);
  g.strokeStyle = css(p.signal);
  g.lineWidth = 2.6;
  g.lineCap = "square";
  g.beginPath();
  g.moveTo(4, 12.5);
  g.lineTo(9, 17.5);
  g.lineTo(20, 6.5);
  g.stroke();
  g.restore();
};

/** The four plates' top faces, bottom to top: primitive, component, tokens, release. */
export const paintFaces = (p: Palette) =>
  [primitive, component, tokens, release].map((paint) => face(paint, p));
