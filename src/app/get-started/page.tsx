import type { Metadata } from "next";
import { GetStartedPage } from "@/features/get-started/GetStartedPage";

export const metadata: Metadata = {
  title: "Get started",
  description:
    "Start with the contract you need: primitives, components, tokens and the release evidence behind them.",
};

export default function Page() {
  return <GetStartedPage />;
}
