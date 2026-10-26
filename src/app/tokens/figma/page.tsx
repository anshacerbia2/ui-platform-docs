import type { Metadata } from "next";
import { FigmaPage } from "@/features/tokens/FigmaPage";

export const metadata: Metadata = { title: "Tokens in Figma" };

export default function Page() {
  return <FigmaPage />;
}
