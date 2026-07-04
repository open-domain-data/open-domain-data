import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocShell, PageHead, H2A } from "@/components/DocShell";
import { InlineCode, MetaBlock } from "@/components/Atoms";
import { CommercialSeparationNote } from "@/components/CommercialSeparationNote";
import { JsonLd } from "@/components/JsonLd";
import { IcDownload, IcSchema } from "@/components/Icons";
import { LANDSCAPE_EDITIONS, editionBySlug, statById } from "@/lib/landscape";
import { landscapeStatJsonLd } from "@/lib/structuredData";

export function generateStaticParams() {
  const params: { edition: string; stat: string }[] = [];
  for (const e of LANDSCAPE_EDITIONS) {
    for (const s of e.records) params.push({ edition: e.edition.toLowerCase(), stat: s.id });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: { edition: string; stat: string };
}): Promise<Metadata> {
  const edition = editionBySlug(params.edition);
  const stat = edition && statById(edition, params.stat);
  if (!edition || !stat) return { title: "Stat not found" };
  return {
    title: `${stat.metric} — ${stat.edition}`,
    description: stat.statement,
    alternates: { canonical: `/landscape/${edition.edition.toLowerCase()}/${stat.id}` },
  };
}

export default function LandscapeStatPage({ params }: { params: { edition: string; stat: string } }) {
  const edition = editionBySlug(params.edition);
  const stat = edition && statById(edition, params.stat);
  if (!edition || !stat) notFound();
  const slug = edition.edition.toLowerCase();

  return (
    <>
      <JsonLd data={landscapeStatJsonLd(stat)} />
      <DocShell
        groups={[
          { h: "Landscape", links: [{ label: `${edition.edition} edition`, href: `/landscape/${slug}` }] },
          {
            h: "Statistics",
            links: edition.records.map((s) => ({
              label: s.metric,
              href: `/landscape/${slug}/${s.id}`,
              active: s.id === stat.id,
            })),
          },
        ]}
      >
        <PageHead
          crumb={[
            { label: "landscape", href: "/landscape" },
            { label: edition.edition, href: `/landscape/${slug}` },
            { label: stat.metric },
          ]}
          title={stat.metric}
          desc={stat.statement}
        />

        <div
          style={{
            border: "1px solid var(--od-line)",
            borderRadius: 10,
            padding: "22px 24px",
            background: "var(--od-bg)",
            marginBottom: 24,
          }}
        >
          <div className="mono" style={{ fontSize: 40, fontWeight: 600, color: "var(--od-ink)", lineHeight: 1 }}>
            {stat.value}
          </div>
          {stat.percent !== null && (
            <div className="od-micro" style={{ marginTop: 8 }}>
              {stat.percent}% of the {stat.denominator} tracked registrars
            </div>
          )}
          <p className="od-body" style={{ fontSize: 15, marginTop: 14, maxWidth: 640 }}>
            {stat.statement}
          </p>
        </div>

        <H2A id="how-computed">How this is computed</H2A>
        <p className="od-body" style={{ maxWidth: 660 }}>
          {stat.methodology}
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "flex", flexDirection: "column", gap: 10 }}>
          {stat.computed_from.map((c, i) => (
            <li
              key={i}
              style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: 16, padding: "10px 0", borderTop: "1px solid var(--od-line)" }}
            >
              <Link href={`/datasets/${c.dataset.replace(/_/g, "-")}`} className="od-table__name mono" style={{ fontSize: 12.5 }}>
                {c.dataset}
              </Link>
              <span className="od-body" style={{ fontSize: 13 }}>
                field <InlineCode>{c.field}</InlineCode> · version {c.version}
              </span>
            </li>
          ))}
        </ul>

        <H2A id="breakdown">Breakdown</H2A>
        <p className="od-body" style={{ maxWidth: 660, marginBottom: 12 }}>
          Every tracked registrar that contributes to this number, so the count can be reproduced from the source
          records.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {Object.entries(stat.breakdown).map(([label, ids]) => (
            <div key={label}>
              <div className="od-micro" style={{ marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {label} ({ids.length})
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ids.length === 0 ? (
                  <span className="od-micro">none</span>
                ) : (
                  ids.map((id) => (
                    <Link key={id} href={`/registrars/${id}`} className="od-chip mono">
                      {id}
                    </Link>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        <H2A id="separation">Facts, not rankings</H2A>
        <CommercialSeparationNote />

        <H2A id="cite">How to cite</H2A>
        <div
          style={{
            background: "var(--od-panel)",
            border: "1px solid var(--od-line)",
            borderRadius: 8,
            padding: "14px 16px",
            fontFamily: "var(--od-mono)",
            fontSize: 12.5,
            color: "var(--od-ink-2)",
            lineHeight: 1.7,
          }}
        >
          &ldquo;{stat.statement}&rdquo;
          <br />
          Open Domain Data, registrar_landscape {stat.edition}. {stat.canonical_url}. Licensed CC BY 4.0.
        </div>

        <H2A id="downloads">Data</H2A>
        <p className="od-body" style={{ maxWidth: 640, marginBottom: 12 }}>
          This stat is one record in <InlineCode>/api/registrar_landscape.json</InlineCode> (id{" "}
          <InlineCode>{stat.id}</InlineCode>).
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="od-dl" href="/api/registrar_landscape.json">
            <IcDownload s={14} /> registrar_landscape.json
          </a>
          <a className="od-dl" href="/api/registrar_landscape.csv">
            <IcDownload s={14} /> registrar_landscape.csv
          </a>
          <Link className="od-dl" href="/schemas/registrar-landscape.schema.json">
            <IcSchema s={14} /> schema
          </Link>
        </div>

        <H2A id="meta">Metadata</H2A>
        <MetaBlock
          rows={[
            ["stat_id", stat.id],
            ["edition", stat.edition],
            ["value", stat.value],
            ["unit", stat.unit],
            ["headline", String(stat.headline)],
            ["last_checked", edition.last_checked],
            ["license", edition.license],
          ]}
        />
      </DocShell>
    </>
  );
}
