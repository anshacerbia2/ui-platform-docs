import type { Metadata } from "next";
import { ColorPage } from "@/features/tokens/color/ColorPage";

export const metadata: Metadata = { title: "Colour tokens" };

export default function Page() {
  return <ColorPage />;
}
