import type { Metadata } from "next";
import { AllTokensPage } from "@/features/tokens/all/AllTokensPage";

export const metadata: Metadata = { title: "All tokens" };

export default function Page() {
  return <AllTokensPage />;
}
