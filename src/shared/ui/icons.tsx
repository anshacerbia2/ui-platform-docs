import type { SVGProps } from "react";

// The site's icons: 24-unit grid, stroked with currentColor, decorative by default.
type IconProps = Omit<SVGProps<SVGSVGElement>, "viewBox"> & { size?: number };

const Svg = ({ size = 16, children, ...rest }: IconProps & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    {children}
  </svg>
);

export const ArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
export const ArrowLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);
export const Copy = (p: IconProps) => (
  <Svg {...p}>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M4 16V6a2 2 0 0 1 2-2h10" />
  </Svg>
);
export const Check = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);
export const Code = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />
  </Svg>
);
export const Sun = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Svg>
);
export const Moon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </Svg>
);
export const Monitor = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </Svg>
);
export const Orbit = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" />
  </Svg>
);
export const Reset = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </Svg>
);
export const Split = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
  </Svg>
);
export const External = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Svg>
);

/** The four contracts' marks; the accent part takes the primary solid surface (elements/_page.scss). */
export const PrimitiveMark = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 9V6.5A2.5 2.5 0 0 1 6.5 4H9M15 4h2.5A2.5 2.5 0 0 1 20 6.5V9M20 15v2.5a2.5 2.5 0 0 1-2.5 2.5H15M9 20H6.5A2.5 2.5 0 0 1 4 17.5V15" />
    <circle cx="12" cy="12" r="2.6" className="site-icon-accent" stroke="none" />
  </Svg>
);
export const ComponentMark = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="12.5" height="12.5" rx="3.2" />
    <rect x="8.5" y="8.5" width="12.5" height="12.5" rx="3.2" className="site-icon-accent" stroke="none" />
  </Svg>
);
export const TokenMark = (p: IconProps) => (
  <Svg {...p}>
    <rect x="9" y="4.5" width="6" height="15" rx="3" transform="rotate(-32 12 18)" />
    <rect x="9" y="4.5" width="6" height="15" rx="3" transform="rotate(32 12 18)" />
    <rect x="9" y="4.5" width="6" height="15" rx="3" className="site-icon-accent" stroke="none" />
  </Svg>
);
export const ReleaseMark = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2l2.3 1.4 2.7-.06 1.29 2.37 2.37 1.29-.06 2.7L22 12l-1.4 2.3.06 2.7-2.37 1.29L17 20.66l-2.7-.06L12 22l-2.3-1.4-2.7.06-1.29-2.37L3.34 17l.06-2.7L2 12l1.4-2.3L3.34 7l2.37-1.29L7 3.34l2.7.06z" />
    <path d="M8.2 12.3l2.6 2.6 5-5.4" className="site-icon-accent-stroke" strokeWidth={2} />
  </Svg>
);
