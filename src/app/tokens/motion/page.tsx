import type { Metadata } from "next";
import { MotionPage } from "@/features/tokens/motion/MotionPage";

export const metadata: Metadata = { title: "Motion tokens" };

export default function Page() {
  return <MotionPage />;
}
