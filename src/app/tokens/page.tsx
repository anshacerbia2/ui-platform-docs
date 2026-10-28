import type { Metadata } from "next";
import { OverviewPage } from "@/features/tokens/overview/OverviewPage";

export const metadata: Metadata = { title: "Tokens" };

export default function Page() {
  return <OverviewPage />;
}
