import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { usage } from "@/content/components";
import { ComponentPage } from "@/features/reference/ComponentPage";
import { componentSlugs, entries, getComponent, titleOf } from "@/shared/lib/reference";

export const dynamicParams = false;
export const generateStaticParams = () => componentSlugs.map((slug) => ({ slug }));

export async function generateMetadata({ params }: PageProps<"/components/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const description = getComponent(slug)
    ?.api.find((a) => a.kind === "component")
    ?.description.split("\n\n")[0];
  return { title: titleOf(slug), description };
}

export default async function Page({ params }: PageProps<"/components/[slug]">) {
  const { slug } = await params;
  const reference = getComponent(slug);
  const row = entries.find((e) => e.kind === "styled" && e.slug === slug);
  if (!reference || !row) notFound();
  return <ComponentPage row={row} reference={reference} Usage={usage[slug] ?? null} />;
}
