import type { Metadata } from "next";
import { TokensPage } from "@/features/tokens/TokensPage";

export const metadata: Metadata = { title: "Tokens" };

export default function Page() {
  return <TokensPage />;
}
