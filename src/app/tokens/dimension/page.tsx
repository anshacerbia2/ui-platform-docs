import type { Metadata } from "next";
import { DimensionPage } from "@/features/tokens/dimension/DimensionPage";

export const metadata: Metadata = { title: "Dimension tokens" };

export default function Page() {
  return <DimensionPage />;
}
