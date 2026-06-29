import type { Metadata } from "next";
import Link from "next/link";
import { DocShell, PageHead, H2A } from "@/components/DocShell";
import { StatusBadge } from "@/components/Atoms";
import {
  provenanceSources,
  provenanceTotals,
  provenanceDatasets,
} from "@/lib/provenance";

export const metadata: Metadata = {
  title: "Provenance reverse index",
  description:
    "Every source Open Domain Data cites, and every field across every dataset that rests on it. A neutral, machine-checkable audit of where the data comes from.",
  alternates: { canonical: "/provenance" },
};

function domainAnchor(domain: string): string {
  return "src-" + domain.replace(/[^a-z0-9]+/gi, "-");
}

export default function ProvenancePage() {
  const { domains, citations, urls, datasets, generated } = provenanceTotals;

  const side = [
    {
      h: "Provenance",
      links: [
        { label: "Overview", href: "#overview", active: true },
        { label: "How it is built", href: "#how" },
        { label: "Sources", href: "#sources" },
        { label: "Datasets covered", href: "#datasets" },
      ],
    },
  ];
  const toc = [
    { label: "Overview", href: "#overview" },
    { label: "How it is built", href: "#how" },
    { label: "Sources", href: "#sources" },
    { label: "Datasets covered", href: "#datasets" },
  ];

  return (
    <DocShell groups={side} toc={toc}>
      <PageHead
        crumb={[{ label: "provenance" }]}
        title="Provenance reverse index"
        desc="The dataset pages show, per record, the source of each field. This page inverts that: per source, every field across every dataset that cites it — a neutral audit of where the data comes from."
      />

      <H2A id="overview">Overview</H2A>
      <p className="od-body" style={{ fontSize: 14, maxWidth: 680 }}>
        Open Domain Data records provenance per field. Each{" "}
        <span className="mono">field_provenance</span> entry names the primary
        source a value was checked against, how it was verified, and when. This
        index reads that backwards — grouping every field citation by the source
        it rests on — so you can audit a single source and see exactly which
        published facts depend on it. It is a statement of where the data comes
        from, not a ranking or an endorsement.
      </p>

      <div
        className="od-meta"
        style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 0 }}
      >
        <Stat n={domains} label="source domains" />
        <Stat n={urls} label="distinct cited URLs" />
        <Stat n={citations} label="field citations" />
        <Stat n={datasets} label="datasets covered" />
      </div>
      <p className="od-micro" style={{ marginTop: 10 }}>
        Most recent source check across the index:{" "}
        <span className="mono">{generated}</span>. The{" "}
        <span className="mono">tld_pricing</span> dataset is not represented
        here — it does not yet carry per-field provenance, and this index
        reflects only what is actually published.
      </p>

      <H2A id="how">How it is built</H2A>
      <p className="od-body" style={{ fontSize: 14, maxWidth: 680 }}>
        The index is generated at build time from the canonical dataset JSON
        under <span className="mono">/data</span> — the same files that{" "}
        <span className="mono">scripts/check-provenance.mjs</span> walks to
        enforce provenance hygiene in CI. It therefore cannot drift from what is
        published: add a sourced field to a dataset and it appears here; change a
        source and the citation moves. Every URL below is the exact{" "}
        <span className="mono">source_url</span> stored on the field, and every
        verification status is the one recorded with it. To reproduce the
        underlying report locally, run{" "}
        <span className="mono">npm run check</span> or{" "}
        <span className="mono">node scripts/check-provenance.mjs --check-urls</span>.
      </p>

      <H2A id="sources">Sources by citation count</H2A>
      <p className="od-body" style={{ fontSize: 13.5, maxWidth: 680, marginBottom: 8 }}>
        Source domains ordered by how many published fields rest on them. Each
        table lists every citation on that domain across all datasets.
      </p>

      {provenanceSources.map((s) => (
        <section key={s.domain} style={{ marginTop: 26 }}>
          <h3
            id={domainAnchor(s.domain)}
            className="od-h3"
            style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}
          >
            <span className="mono" style={{ fontSize: 15 }}>{s.domain}</span>
            <span className="od-micro" style={{ fontWeight: 400 }}>
              {s.citationCount} citation{s.citationCount === 1 ? "" : "s"} ·{" "}
              {s.urlCount} URL{s.urlCount === 1 ? "" : "s"} · {s.datasetCount}{" "}
              dataset{s.datasetCount === 1 ? "" : "s"} · last checked{" "}
              {s.lastChecked}
            </span>
          </h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "6px 0 10px" }}>
            {Object.entries(s.statusCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => (
                <StatusBadge key={status} v={status} label={`${status} · ${count}`} />
              ))}
          </div>
          <div className="od-table--bordered">
            <table className="od-table">
              <thead>
                <tr>
                  <th>Dataset</th>
                  <th>Record</th>
                  <th>Field</th>
                  <th>Verification</th>
                  <th>Last checked</th>
                  <th>Source URL</th>
                </tr>
              </thead>
              <tbody>
                {s.citations.map((c, i) => (
                  <tr key={`${c.dataset}-${c.recordId}-${c.field}-${i}`}>
                    <td style={{ fontSize: 12 }}>
                      <Link className="od-link mono" href={`/datasets/${c.datasetSlug}`} style={{ fontSize: 11.5 }}>
                        {c.dataset}
                      </Link>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      <Link className="od-link" href={`/registrars/${c.recordId}`}>
                        {c.record}
                      </Link>
                    </td>
                    <td className="mono" style={{ fontSize: 12, color: "var(--od-ink-2)" }}>
                      {c.field}
                    </td>
                    <td>
                      <StatusBadge v={c.status} />
                    </td>
                    <td className="mono" style={{ fontSize: 11.5, color: "var(--od-ink-2)" }}>
                      {c.lastChecked}
                    </td>
                    <td>
                      <a className="od-link mono" style={{ fontSize: 11.5 }} href={c.url}>
                        {c.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <H2A id="datasets">Datasets covered</H2A>
      <p className="od-body" style={{ fontSize: 13.5, maxWidth: 680, marginBottom: 8 }}>
        The six datasets that currently carry per-field provenance and feed this
        index.
      </p>
      <div className="od-table--bordered">
        <table className="od-table">
          <thead>
            <tr>
              <th>Dataset</th>
              <th>Version</th>
            </tr>
          </thead>
          <tbody>
            {provenanceDatasets.map((d) => (
              <tr key={d.name}>
                <td>
                  <Link className="od-link mono" href={`/datasets/${d.slug}`} style={{ fontSize: 12.5 }}>
                    {d.name}
                  </Link>
                </td>
                <td className="mono" style={{ fontSize: 12 }}>{d.version}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DocShell>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div style={{ padding: "4px 0" }}>
      <div className="mono" style={{ fontSize: 26, color: "var(--od-ink)", lineHeight: 1.1 }}>
        {n}
      </div>
      <div className="od-micro" style={{ marginTop: 2 }}>{label}</div>
    </div>
  );
}
