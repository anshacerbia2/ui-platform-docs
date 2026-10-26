// The Square chrome's shared numbers (TDD docs-site D13;
// TDD docs-site annex A). styles/settings/_square.scss holds the
// same values for the stylesheets.

/** The nav strip's height, and the line a section's top reaches when it becomes here (annex A 6.9). */
export const NAV_LINE = 48;

/**
 * Where a jump lands a section's line: one pixel up, on the nav's own bottom line (its last
 * row), so the two lines are one and never read as a double border. The document's
 * scroll-padding (generic/_document.scss) is the same number; the first of a page of
 * sheets, which has no rule, takes 1px of scroll-margin and lands at the top.
 */
export const JUMP_LINE = NAV_LINE - 1;

/** The selector of a page's sheets: every documentation section carries `data-sheet` with its name. */
export const SHEET_SELECTOR = "main [data-sheet]";

/** The ruler shows from this viewport width up; below it the native scrollbar stays (annex A 1.4). */
export const RULER_MIN_WIDTH = 1024;
