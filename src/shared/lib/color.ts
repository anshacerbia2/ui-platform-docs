// Colour arithmetic for specimens that compare colour spaces. Specimen colours are
// SVG presentation attributes, never stylesheet literals (TDD docs-site D4, D16).

export type Rgb = [number, number, number];

/** OKLCH to linear sRGB (Björn Ottosson's OKLab matrices). */
export function oklchToLinear(L: number, C: number, h: number): Rgb {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
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

/** OKLCH to gamma-encoded sRGB, each channel clipped to 0–1. */
export const oklchToSrgb = (L: number, C: number, h: number): Rgb =>
  oklchToLinear(L, C, h).map(encode) as Rgb;

/** HSL (hue in degrees, saturation and lightness 0–1) to gamma-encoded sRGB. */
export function hslToSrgb(h: number, s: number, l: number): Rgb {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

/** WCAG 2.2 relative luminance of a gamma-encoded sRGB colour. */
export function luminance(c: Rgb) {
  const [r, g, b] = c.map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** `#RRGGBB` of a gamma-encoded sRGB colour. */
export const hex = (c: Rgb) =>
  `#${c
    .map((x) =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")
    .toUpperCase()}`;
