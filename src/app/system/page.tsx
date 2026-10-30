import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/LandingPage";

export const metadata: Metadata = { title: "Design system" };

export default function Page() {
  return <LandingPage />;
}
