import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrimitivePage } from "@/features/reference/PrimitivePage";
import { entries, getPrimitive, primitiveSlugs, titleOf } from "@/shared/lib/reference";

export const dynamicParams = false;
export const generateStaticParams = () => primitiveSlugs.map((slug) => ({ slug }));

export async function generateMetadata({ params }: PageProps<"/primitives/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${titleOf(slug)} primitive` };
}

export default async function Page({ params }: PageProps<"/primitives/[slug]">) {
  const { slug } = await params;
  const reference = getPrimitive(slug);
  const row = entries.find((e) => e.kind === "primitive" && e.slug === slug);
  if (!reference || !row) notFound();
  return <PrimitivePage row={row} reference={reference} />;
}
