import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DATASETS } from "@/lib/data";
import { datasetBySlug, getDatasetDetail } from "@/lib/datasetDetail";
import { DocShell, PageHead, H2A, FieldTable, dsSide } from "@/components/DocShell";
import { StatusBadge, Chips, MetaBlock, InlineCode } from "@/components/Atoms";
import { CitationBlock } from "@/components/CitationBlock";
import { JsonLd } from "@/components/JsonLd";
import { datasetJsonLd } from "@/lib/structuredData";
import { IcDownload, IcSchema, IcGit, IcExt } from "@/components/Icons";

export function generateStaticParams() {
  return DATASETS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const d = datasetBySlug(params.slug, DATASETS);
  if (!d) return { title: "Dataset not found" };
  return {
    title: d.name,
    description: d.desc,
    alternates: { canonical: `/datasets/${d.slug}` },
  };
}

function renderCell(value: unknown) {
  if (value === null || value === undefined) {
    return <span className="mono" style={{ fontSize: 12, color: "var(--od-ink-4)" }}>—</span>;
  }
  if (typeof value === "boolean") {
    return (
      <span className="mono" style={{ fontSize: 12, color: value ? "var(--od-ok)" : "var(--od-ink-3)" }}>
        {String(value)}
      </span>
    );
  }
  if (typeof value === "number") {
    return (
      <span className="mono" style={{ fontSize: 12.5, color: "var(--od-ink)" }}>
        {value}
      </span>
    );
  }
  const s = String(value);
  // verification status keys
  if (
    [
      "unknown",
      "public_sources",
      "independently_tested",
      "registrar_submitted",
      "registrar_verified",
      "deprecated",
      "active",
      "inactive",
      "terminated",
    ].includes(s)
  ) {
    return <StatusBadge v={s} />;
  }
  return (
    <span className="mono" style={{ fontSize: 12, color: "var(--od-ink)" }}>
      {s}
    </span>
  );
}

export default function DatasetDetailPage({ params }: { params: { slug: string } }) {
  const meta = datasetBySlug(params.slug, DATASETS);
  const detail = getDatasetDetail(params.slug);
  if (!meta || !detail) notFound();

  const related = DATASETS.filter((d) => d.slug !== meta.slug).slice(0, 3);

  return (
    <>
      <JsonLd data={datasetJsonLd(meta)} />
      <DocShell groups={dsSide(meta.slug)}>
        <PageHead
          crumb={[
            { label: "datasets", href: "/datasets" },
            { label: meta.name },
          ]}
          title={meta.name}
          mono
          status={<StatusBadge v={meta.status} />}
          desc={meta.desc}
          actions={
            <>
              <a className="od-btn od-btn--primary" href={detail.jsonHref}>
                <IcDownload s={15} /> Download JSON
              </a>
              {detail.csvHref && (
                <a className="od-btn" href={detail.csvHref}>
                  <IcDownload s={15} /> Download CSV
                </a>
              )}
              <Link className="od-btn" href={`/schemas/${detail.schemaSlug}`}>
                <IcSchema s={15} /> View schema
              </Link>
              <a className="od-btn" href={`https://github.com/open-domain-data/open-domain-data/tree/main/datasets/${meta.name}`}>
                <IcGit s={15} /> Source <IcExt s={12} style={{ opacity: 0.5 }} />
              </a>
            </>
          }
        />

        <H2A id="overview">Overview</H2A>
        <MetaBlock
          rows={[
            ["dataset", meta.name],
            ["version", meta.ver],
            ["records", meta.records],
            ["formats", <Chips key="f" items={meta.fmts} />],
            ["schema", detail.schemaSlug],
            ["sources", detail.sources.map((s) => s[0]).join(", ")],
            ["license", meta.license],
            ["last_checked", meta.updated + "T04:12:00Z"],
            ["verification", <StatusBadge key="v" v={meta.status} />],
          ]}
        />

        <H2A
          id="records"
          right={
            <Link href={detail.jsonHref} className="od-link od-small" style={{ fontWeight: 500 }}>
              {meta.records} records →
            </Link>
          }
        >
          Records
        </H2A>
        <div className="od-table--bordered">
          <table className="od-table">
            <thead>
              <tr>
                {detail.recordTableHeader.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(detail.records as Record<string, unknown>[]).map((r, i) => (
                <tr key={i}>
                  {detail.recordTableHeader.map((h, j) => {
                    const value = r[h];
                    if (j === 0 && h === "id") {
                      return (
                        <td key={h}>
                          <Link href={`/registrars/${String(value)}`} className="od-table__name">
                            {String(value)}
                          </Link>
                        </td>
                      );
                    }
                    if (j === 0 && h === "registrar_id") {
                      return (
                        <td key={h}>
                          <Link href={`/registrars/${String(value)}`} className="od-table__name">
                            {String(value)}
                          </Link>
                        </td>
                      );
                    }
                    return <td key={h}>{renderCell(value)}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <H2A
          id="schema"
          right={
            <Link href={`/schemas/${detail.schemaSlug}`} className="od-link od-small" style={{ fontWeight: 500 }}>
              {detail.schemaSlug} →
            </Link>
          }
        >
          Schema
        </H2A>
        <FieldTable fields={detail.fields} />

        <H2A id="sources">Sources</H2A>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {detail.sources.map(([k, d, u]) => (
            <li
              key={k}
              style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 16, padding: "10px 0", borderTop: "1px solid var(--od-line)" }}
            >
              <span className="mono" style={{ fontSize: 12.5, color: "var(--od-ink)" }}>
                {k}
              </span>
              <span>
                <span className="od-body" style={{ fontSize: 13.5 }}>
                  {d}
                </span>
                <div className="mono" style={{ fontSize: 11.5, color: "var(--od-link)", marginTop: 3 }}>
                  {u}
                </div>
              </span>
            </li>
          ))}
        </ul>

        <H2A id="downloads">Downloads</H2A>
        <p className="od-body" style={{ maxWidth: 640, marginBottom: 12 }}>
          The unversioned paths below always serve the latest release. Versioned files at{" "}
          <InlineCode>/api/{meta.name}@{meta.ver}.json</InlineCode> are immutable.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="od-dl" href={detail.jsonHref}>
            <IcDownload s={14} /> {detail.jsonHref.split("/").pop()}
          </a>
          {detail.csvHref && (
            <a className="od-dl" href={detail.csvHref}>
              <IcDownload s={14} /> {detail.csvHref.split("/").pop()}
            </a>
          )}
          <Link className="od-dl" href={`/schemas/${detail.schemaSlug}`}>
            <IcSchema s={14} /> {detail.schemaSlug}
          </Link>
        </div>

        <H2A id="changelog">Changelog</H2A>
        <div>
          <div className="od-clog">
            <div className="od-clog__meta">
              <span className="od-clog__date">{meta.updated}</span>
              <span className="od-clog__ds">
                {meta.name}
                <span style={{ color: "var(--od-ink-4)" }}>@{meta.ver}</span>
              </span>
            </div>
            <div className="od-clog__body">
              Release {meta.ver}. See the{" "}
              <Link href="/changelog" className="od-link">
                full changelog
              </Link>{" "}
              for details.
            </div>
          </div>
        </div>

        <H2A id="citation">Citation</H2A>
        <CitationBlock dataset={meta.name} version={meta.ver} slug={meta.slug} />

        <H2A id="related">Related datasets</H2A>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {related.map((d) => (
            <li
              key={d.slug}
              style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16, padding: "10px 0", borderTop: "1px solid var(--od-line)" }}
            >
              <Link href={`/datasets/${d.slug}`} className="od-table__name">
                {d.name}
              </Link>
              <span className="od-body" style={{ fontSize: 13.5 }}>
                {d.desc}
              </span>
            </li>
          ))}
        </ul>
      </DocShell>
    </>
  );
}
