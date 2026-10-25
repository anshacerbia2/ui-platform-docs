// The Square chrome's shared numbers (TDD docs-site D13; scnehaux-design
// scnx-platform square.css, SCROLL.md). styles/settings/_square.scss holds the
// same values for the stylesheets.

/** The nav strip's height, and the line a section's top reaches when it becomes here (SCROLL.md 6.9). */
export const NAV_LINE = 48;

/** The selector of a page's sheets: every documentation section carries `data-sheet` with its name. */
export const SHEET_SELECTOR = "main [data-sheet]";

/** The ruler shows from this viewport width up; below it the native scrollbar stays (SCROLL.md 1.4). */
export const RULER_MIN_WIDTH = 1024;
