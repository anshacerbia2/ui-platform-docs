// WCAG 2.x contrast exactly as the ui-platform token gate computes it
// (packages/design-system/scripts/tokens/color.mjs at the pinned commit; TDD
// tokens G1-G3): a translucent color is composited on its actual background,
// and a color outside sRGB is evaluated on every display path a supported
// browser can take (sRGB or Display P3, clipped or gamut-mapped). The lowest
// ratio counts.

import Color from "colorjs.io";

export function parseColor(css) {
  try {
    return new Color(css);
  } catch {
    return null;
  }
}

export const DISPLAY_PATHS = [
  { name: "srgb-clip", space: "srgb", method: "clip" },
  { name: "srgb-map", space: "srgb", method: "css" },
  { name: "p3-clip", space: "p3", method: "clip" },
  { name: "p3-map", space: "p3", method: "css" },
];

function onDisplay(color, path) {
  return path.method === "clip"
    ? color.clone().to(path.space).toGamut({ method: "clip" })
    : color.clone().toGamut({ space: path.space, method: "css" }).to(path.space);
}

function composite(foreground, background, path) {
  const fg = onDisplay(foreground, path);
  const bg = onDisplay(background, path);
  const alpha = Number(fg.alpha ?? 1);
  const coords = fg.coords.map(
    (channel, i) => (channel ?? 0) * alpha + (bg.coords[i] ?? 0) * (1 - alpha),
  );
  return new Color(path.space, coords, 1);
}

function opaqueOn(background, canvas, path) {
  return Number(background.alpha ?? 1) < 1
    ? composite(background, canvas, path)
    : onDisplay(background, path);
}

/** The lowest WCAG 2.x ratio over every display path, and the path it occurs on. */
export function contrastRatio(foreground, background, canvas) {
  return DISPLAY_PATHS.map((path) => {
    const bg = opaqueOn(background, canvas, path);
    const fg = composite(foreground, bg, path);
    return { path: path.name, ratio: fg.contrast(bg, "WCAG21") };
  }).reduce((low, next) => (next.ratio < low.ratio ? next : low));
}
