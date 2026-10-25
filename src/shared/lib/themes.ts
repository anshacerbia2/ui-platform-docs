import themes from "@/generated/themes.json";

/**
 * The theme ids, from the pinned @scnx/system (scripts/reference.mjs; TDD
 * docs-site D16): never hard-coded in a page, a sample, or a snippet.
 */
/** The site's own theme, the documentation's look. */
export const SITE_THEME: string = themes.site;
/** Every shipped theme, the site's first. */
export const THEME_IDS: string[] = themes.ids;
/** The published stylesheet of a theme, as a consumer imports it. */
export const themeStylesheet = (id: string) => `@scnx/system/tokens/css/${id}.css`;
