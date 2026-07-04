import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocShell, PageHead } from "@/components/DocShell";
import { LandscapeView, lsSide } from "@/components/LandscapeView";
import { JsonLd } from "@/components/JsonLd";
import { LANDSCAPE_EDITIONS, editionBySlug } from "@/lib/landscape";
import { landscapeEditionJsonLd } from "@/lib/structuredData";

export function generateStaticParams() {
  return LANDSCAPE_EDITIONS.map((e) => ({ edition: e.edition.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: { edition: string } }): Promise<Metadata> {
  const edition = editionBySlug(params.edition);
  if (!edition) return { title: "Edition not found" };
  return {
    title: `Domain registrar landscape — ${edition.edition}`,
    description: `Aggregate registrar capability statistics for the ${edition.edition} edition, computed over the ${edition.coverage.tracked_registrars} registrars Open Domain Data tracks. Facts, not rankings.`,
    alternates: { canonical: `/landscape/${edition.edition.toLowerCase()}` },
  };
}

export default function LandscapeEditionPage({ params }: { params: { edition: string } }) {
  const edition = editionBySlug(params.edition);
  if (!edition) notFound();
  const canonical = `https://opendomaindata.org/landscape/${edition.edition.toLowerCase()}`;
  return (
    <>
      <JsonLd data={landscapeEditionJsonLd(edition, canonical)} />
      <DocShell groups={lsSide()}>
        <PageHead
          crumb={[{ label: "landscape", href: "/landscape" }, { label: edition.edition }]}
          title={`Domain registrar landscape — ${edition.edition}`}
          desc="A quarterly, source-derived snapshot of registrar capabilities for automation and AI agents. This is the permanent, edition-stamped record; the numbers here do not change."
        />
        <LandscapeView edition={edition} />
      </DocShell>
    </>
  );
}
