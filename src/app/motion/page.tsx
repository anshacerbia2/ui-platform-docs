import type { Metadata } from "next";
import { MotionPage } from "@/features/motion/MotionPage";

export const metadata: Metadata = { title: "Motion" };

export default function Page() {
  return <MotionPage />;
}
