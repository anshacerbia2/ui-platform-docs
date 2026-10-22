import type { Metadata } from "next";
import { IndexPage } from "@/features/reference/IndexPage";

export const metadata: Metadata = { title: "Components" };

export default function Page() {
  return <IndexPage kind="styled" />;
}
