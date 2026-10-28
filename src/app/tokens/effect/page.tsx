import type { Metadata } from "next";
import { EffectPage } from "@/features/tokens/effect/EffectPage";

export const metadata: Metadata = { title: "Effect tokens" };

export default function Page() {
  return <EffectPage />;
}
