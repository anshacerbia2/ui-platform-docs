/**
 * The colours and the Button the assembly draws, read from the page itself: the
 * chrome's roles, the token swatches and the design system's own Button, as they
 * resolve under the figure's theme root. Nothing here restates a value.
 */

/** A colour in sRGB, each channel 0 to 1, with its alpha. */
export type Rgba = { r: number; g: number; b: number; a: number };

/** How the real Button renders, measured from a hidden specimen. */
export type ButtonLook = {
  label: string;
  fill: Rgba;
  ink: Rgba;
  font: string;
  letterSpacing: number;
  width: number;
  height: number;
  radius: number;
};

export type Palette = {
  ground: Rgba;
  text: Rgba;
  muted: Rgba;
  line: Rgba;
  edge: Rgba;
  faint: Rgba;
  signal: Rgba;
  raised: Rgba;
  canvas: Rgba;
  mono: string;
  sans: string;
  swatches: Rgba[];
  button: ButtonLook;
};

const ROLES = {
  ground: "--sq-ground",
  text: "--sq-text",
  muted: "--sq-muted",
  line: "--sq-line",
  edge: "--sq-edge",
  faint: "--sq-faint",
  signal: "--sq-signal",
  raised: "--ds-color-neutral-surface-raised-default",
  canvas: "--ds-color-neutral-surface-canvas-default",
} as const;

/** Any CSS colour the browser can parse, as sRGB: painted on one pixel and read back. */
const reader = () => {
  const g = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  return (css: string): Rgba => {
    if (!g) return { r: 0, g: 0, b: 0, a: 1 };
    g.clearRect(0, 0, 1, 1);
    g.fillStyle = "#000";
    g.fillStyle = css;
    g.fillRect(0, 0, 1, 1);
    const [r = 0, gg = 0, b = 0, a = 255] = g.getImageData(0, 0, 1, 1).data;
    return { r: r / 255, g: gg / 255, b: b / 255, a: a / 255 };
  };
};

/**
 * Reads the palette under `specimen`, which holds a `[data-probe]` element, the
 * `[data-swatch]` elements and the Button, all hidden.
 */
export function readPalette(specimen: HTMLElement): Palette {
  const toRgba = reader();
  const probe = specimen.querySelector<HTMLElement>("[data-probe]") ?? specimen;
  const role = (name: string) => {
    probe.style.setProperty("color", `var(${name})`);
    return toRgba(getComputedStyle(probe).color);
  };
  const roles = Object.fromEntries(
    Object.entries(ROLES).map(([key, name]) => [key, role(name)]),
  ) as Record<keyof typeof ROLES, Rgba>;
  const font = (name: string) => {
    probe.style.setProperty("font-family", `var(${name})`);
    return getComputedStyle(probe).fontFamily;
  };

  const swatches = [...specimen.querySelectorAll<HTMLElement>("[data-swatch]")].map((node) =>
    toRgba(getComputedStyle(node).backgroundColor),
  );

  const button = specimen.querySelector<HTMLElement>("button");
  const look = button ? getComputedStyle(button) : null;
  const box = button?.getBoundingClientRect();
  return {
    ...roles,
    mono: font("--sq-mono"),
    sans: font("--ds-typography-body-default-font-family"),
    swatches,
    button: {
      label: button?.textContent?.trim() ?? "",
      fill: toRgba(look?.backgroundColor ?? "#000"),
      ink: toRgba(look?.color ?? "#fff"),
      font: look ? `${look.fontWeight} ${look.fontSize} ${look.fontFamily}` : "600 14px sans-serif",
      letterSpacing: Number.parseFloat(look?.letterSpacing ?? "") || 0,
      width: box?.width ?? 140,
      height: box?.height ?? 36,
      radius: Number.parseFloat(look?.borderTopLeftRadius ?? "") || 0,
    },
  };
}

/** A colour for a 2D canvas. */
export const css = ({ r, g, b, a }: Rgba) =>
  `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)} / ${a})`;

/** `a` mixed toward `b` by `t`, alpha from `a`. */
export const mix = (a: Rgba, b: Rgba, t: number): Rgba => ({
  r: a.r + (b.r - a.r) * t,
  g: a.g + (b.g - a.g) * t,
  b: a.b + (b.b - a.b) * t,
  a: a.a,
});
