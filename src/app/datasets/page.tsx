import type { Metadata } from "next";
import Link from "next/link";
import { DATASETS } from "@/lib/data";
import { DocShell, PageHead, dsSide } from "@/components/DocShell";
import { DatasetTable } from "@/components/DatasetTable";
import { InlineCode } from "@/components/Atoms";
import { JsonLd } from "@/components/JsonLd";
import { dataCatalogJsonLd } from "@/lib/structuredData";

export const metadata: Metadata = {
  title: "Datasets",
  description: "Catalog of every Open Domain Data dataset, with version, records, formats and verification status.",
  alternates: { canonical: "/datasets" },
};

export default function DatasetsPage() {
  return (
    <DocShell groups={dsSide()}>
      <JsonLd data={dataCatalogJsonLd()} />
      <PageHead
        crumb={[{ label: "datasets" }]}
        title="Datasets"
        desc="Open, versioned datasets describing the domain infrastructure ecosystem. Compiled from public sources, RDAP and registrar submissions."
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {(
          [
            ["7", "datasets"],
            ["~58,452", "total records"],
            ["JSON · CSV", "formats"],
            ["CC BY 4.0", "license"],
          ] as const
        ).map(([n, l]) => (
          <div
            key={l}
            style={{ border: "1px solid var(--od-line)", borderRadius: 8, padding: "14px 16px", background: "var(--od-bg)" }}
          >
            <div className="mono" style={{ fontSize: 18, fontWeight: 600, color: "var(--od-ink)" }}>
              {n}
            </div>
            <div className="od-micro" style={{ marginTop: 2 }}>
              {l}
            </div>
          </div>
        ))}
      </div>
      <DatasetTable datasets={DATASETS} />
      <p className="od-micro" style={{ marginTop: 14 }}>
        All datasets are published under CC BY 4.0. Bulk downloads are linked from each detail page and listed in the{" "}
        <Link href="/developers#downloads" className="od-link">
          developer reference
        </Link>
        . Programmatic access: <InlineCode>/v1/datasets</InlineCode>.
      </p>
    </DocShell>
  );
}
