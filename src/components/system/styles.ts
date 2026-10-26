// The design system's global stylesheets, loaded once by the root layout: the
// components, then each published theme. The site's own layers come after them
// (src/styles/main.scss), so the site never needs specificity to win.
import "@scnx/system/styles/components.css";
import "@scnx/system/tokens/css/scnx-platform.css";
import "@scnx/system/tokens/css/scnx-saas.css";
