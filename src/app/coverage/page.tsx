import type { Metadata } from "next";
import Link from "next/link";
import { DocShell, PageHead, H2A } from "@/components/DocShell";
import { InlineCode } from "@/components/Atoms";
import {
  COVERAGE_COLUMNS,
  COVERAGE_ROWS,
  COLUMN_COVERAGE,
  COVERAGE_TOTALS,
} from "@/lib/coverage";

export const metadata: Metadata = {
  title: "Dataset coverage matrix",
  description:
    "Which registrars Open Domain Data describes in which dataset. A neutral, build-time report of dataset coverage — a filled cell means a dataset has a record for a registrar, nothing more.",
  alternates: { canonical: "/coverage" },
};

function Stat({ n, label }: { n: number | string; label: string }) {
  return (
    <div style={{ padding: "10px 14px" }}>
      <div className="mono" style={{ fontSize: 22, color: "var(--od-ink)" }}>
        {n}
      </div>
      <div className="od-micro" style={{ marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

function Cell({ present }: { present: boolean }) {
  return present ? (
    <span
      className="mono"
      style={{ fontSize: 13, color: "var(--od-ok)" }}
      aria-label="present"
      title="Dataset includes this registrar"
    >
      ✓
    </span>
  ) : (
    <span
      className="mono"
      style={{ fontSize: 13, color: "var(--od-ink-4)" }}
      aria-label="not yet covered"
      title="No record for this registrar in this dataset yet"
    >
      —
    </span>
  );
}

export default function CoveragePage() {
  const { registrars, datasets, cells, filled, fullyCovered } = COVERAGE_TOTALS;
  const pct = Math.round((filled / cells) * 100);

  const side = [
    {
      h: "Coverage",
      links: [
        { label: "Overview", href: "#overview", active: true },
        { label: "How it is built", href: "#how" },
        { label: "Matrix", href: "#matrix" },
        { label: "By dataset", href: "#by-dataset" },
      ],
    },
  ];
  const toc = [
    { label: "Overview", href: "#overview" },
    { label: "How it is built", href: "#how" },
    { label: "Matrix", href: "#matrix" },
    { label: "By dataset", href: "#by-dataset" },
  ];

  return (
    <DocShell groups={side} toc={toc}>
      <PageHead
        crumb={[{ label: "coverage" }]}
        title="Dataset coverage matrix"
        desc="Which registrars Open Domain Data describes in which per-registrar dataset. The datasets view tells you how many records a dataset has; this tells you, per registrar, which datasets include it."
      />

      <H2A id="overview">Overview</H2A>
      <p className="od-body" style={{ fontSize: 14, maxWidth: 680 }}>
        Every cell below states one fact: whether a dataset currently holds a
        record for a registrar. A filled cell means the data exists; an empty
        cell means it is not published yet. This is a report about the datasets
        themselves — it is <strong>not</strong> a score, a ranking or an
        endorsement, and an empty cell is a coverage gap, not a judgement about
        the registrar.
      </p>

      <div
        className="od-meta"
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 0,
        }}
      >
        <Stat n={registrars} label="registrars tracked" />
        <Stat n={datasets} label="per-registrar datasets" />
        <Stat n={`${filled} / ${cells}`} label="cells filled" />
        <Stat n={`${pct}%`} label="matrix coverage" />
        <Stat n={fullyCovered} label="registrars in every dataset" />
      </div>

      <H2A id="how">How it is built</H2A>
      <p className="od-body" style={{ fontSize: 14, maxWidth: 680 }}>
        The matrix is generated at build time from the canonical dataset JSON
        under <InlineCode>/data</InlineCode> — the same files{" "}
        <InlineCode>scripts/validate.mjs</InlineCode> and{" "}
        <InlineCode>scripts/check-integrity.mjs</InlineCode> read. It therefore
        cannot drift from what is published: add a registrar to a dataset and its
        cell fills in here automatically. Referential integrity is enforced in
        CI — every <InlineCode>registrar_id</InlineCode> in a per-registrar
        dataset must resolve to a record in{" "}
        <Link href="/datasets/registrars" className="od-table__name">
          registrars
        </Link>
        , IANA IDs are unique, and the one-record-per-registrar datasets carry no
        duplicates. Reproduce it locally with{" "}
        <InlineCode>npm run check</InlineCode> or{" "}
        <InlineCode>node scripts/check-integrity.mjs</InlineCode>. The machine
        variant is at{" "}
        <a href="/api/coverage.json" className="od-table__name mono">
          /api/coverage.json
        </a>
        .
      </p>
      <p className="od-micro" style={{ marginTop: 10 }}>
        Columns are the per-registrar datasets. The <InlineCode>registrars</InlineCode>{" "}
        dataset is the registrar universe itself (every row by definition), so it
        is not shown as a column. <InlineCode>tld_pricing</InlineCode> holds one
        row per registrar &amp; TLD, so a registrar counts as covered if it has
        any pricing row. The derived <InlineCode>registrar_landscape</InlineCode>{" "}
        dataset is an aggregate over these and is excluded.
      </p>

      <H2A id="matrix">Coverage matrix</H2A>
      <div className="od-table--bordered" style={{ overflowX: "auto" }}>
        <table className="od-table">
          <thead>
            <tr>
              <th>Registrar</th>
              {COVERAGE_COLUMNS.map((c) => (
                <th key={c.key} style={{ textAlign: "center" }}>
                  <Link href={`/datasets/${c.slug}`} className="od-table__name">
                    {c.label}
                  </Link>
                </th>
              ))}
              <th style={{ textAlign: "right" }}>Covered</th>
            </tr>
          </thead>
          <tbody>
            {COVERAGE_ROWS.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/registrars/${r.id}`} className="od-table__name">
                    {r.name}
                  </Link>
                </td>
                {COVERAGE_COLUMNS.map((c) => (
                  <td key={c.key} style={{ textAlign: "center" }}>
                    <Cell present={r.present[c.key]} />
                  </td>
                ))}
                <td className="num mono" style={{ fontSize: 12.5 }}>
                  {r.covered} / {COVERAGE_COLUMNS.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2A id="by-dataset">Coverage by dataset</H2A>
      <p className="od-body" style={{ fontSize: 13.5, maxWidth: 680, marginBottom: 8 }}>
        How many of the {registrars} tracked registrars each dataset includes.
      </p>
      <div className="od-table--bordered">
        <table className="od-table">
          <thead>
            <tr>
              <th>Dataset</th>
              <th>Version</th>
              <th style={{ textAlign: "right" }}>Registrars covered</th>
            </tr>
          </thead>
          <tbody>
            {COLUMN_COVERAGE.map((c) => (
              <tr key={c.key}>
                <td>
                  <Link href={`/datasets/${c.slug}`} className="od-table__name">
                    {c.label}
                  </Link>
                </td>
                <td className="mono" style={{ fontSize: 12.5, color: "var(--od-ink-2)" }}>
                  {c.version}
                </td>
                <td className="num mono" style={{ fontSize: 12.5 }}>
                  {c.covered} / {c.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DocShell>
  );
}
