import type { Metadata } from "next";
import { TypographyPage } from "@/features/tokens/typography/TypographyPage";

export const metadata: Metadata = { title: "Typography tokens" };

export default function Page() {
  return <TypographyPage />;
}
