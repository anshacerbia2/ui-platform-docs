import type { Metadata } from "next";
import { ReleasesPage } from "@/features/releases/ReleasesPage";

export const metadata: Metadata = { title: "Releases" };

export default function Page() {
  return <ReleasesPage />;
}
