import type { Metadata } from "next";
import { IndexPage } from "@/features/reference/IndexPage";

export const metadata: Metadata = { title: "Primitives" };

export default function Page() {
  return <IndexPage kind="primitive" />;
}
