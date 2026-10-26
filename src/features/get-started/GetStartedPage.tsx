import { SheetLayout } from "@/components/shell/SheetLayout";
import { ColorSheet } from "./color/ColorSheet";
import { InstallSheet } from "./install/InstallSheet";
import { PathsSheet } from "./paths/PathsSheet";
import { ReleasesSheet } from "./releases/ReleasesSheet";
import { StartSheet } from "./start/StartSheet";

/**
 * The docs home (scnehaux-design scnx-platform Docs-Home.html): five sheets, no
 * sign-in. Every figure comes from the pinned build's generated reference.
 */
export function GetStartedPage() {
  return (
    <SheetLayout>
      <StartSheet />
      <PathsSheet />
      <InstallSheet />
      <ReleasesSheet />
      <ColorSheet />
    </SheetLayout>
  );
}
