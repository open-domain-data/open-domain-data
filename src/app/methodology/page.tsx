import type { Metadata } from "next";
import { METHODS, VERIF_STATUSES } from "@/lib/data";
import { DocShell, PageHead, H2A } from "@/components/DocShell";
import { StatusBadge, InlineCode } from "@/components/Atoms";
import { CommercialSeparationNote } from "@/components/CommercialSeparationNote";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How Open Domain Data is collected, verified, versioned and licensed. The normative document for every dataset.",
  alternates: { canonical: "/methodology" },
};

export default function MethodologyPage() {
  const side = [
    {
      h: "Methodology",
      links: [
        { label: "Overview", href: "#overview", active: true },
        { label: "Data source hierarchy", href: "#sources" },
        { label: "Verification statuses", href: "#verification" },
        { label: "Field-level confidence", href: "#confidence" },
        { label: "Update cadence", href: "#cadence" },
        { label: "Conflicts", href: "#conflicts" },
        { label: "Corrections", href: "#corrections" },
        { label: "Registrar submissions", href: "#submissions" },
        { label: "Commercial separation", href: "#separation" },
        { label: "Limitations", href: "#limitations" },
        { label: "Reproducibility", href: "#reproducibility" },
        { label: "Licensing", href: "#licensing" },
      ],
    },
  ];
  const toc = [
    { label: "Overview", href: "#overview" },
    { label: "Data source hierarchy", href: "#sources" },
    { label: "Verification statuses", href: "#verification" },
    { label: "Field-level confidence", href: "#confidence" },
    { label: "Update cadence", href: "#cadence" },
    { label: "Conflicts", href: "#conflicts" },
    { label: "Corrections", href: "#corrections" },
    { label: "Registrar submissions", href: "#submissions" },
    { label: "Commercial separation", href: "#separation" },
    { label: "Limitations", href: "#limitations" },
    { label: "Reproducibility", href: "#reproducibility" },
    { label: "Licensing", href: "#licensing" },
  ];

  return (
    <DocShell groups={side} toc={toc}>
      <PageHead
        crumb={[{ label: "methodology" }]}
        title="Methodology"
        desc="How Open Domain Data is collected, verified, versioned and licensed. This document is normative for every dataset."
      />

      <H2A id="overview">Overview</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Open Domain Data assembles records from public sources, live protocol queries and structured submissions. Every
        field records where it came from and when it was last checked. The project publishes data only — it does not
        score, rank or recommend registrars.
      </p>

      <H2A id="sources">Data source hierarchy</H2A>
      <p className="od-body" style={{ maxWidth: 640, marginBottom: 16 }}>
        Five source classes are combined. Each contributes provenance to the <InlineCode>sources</InlineCode> field of a
        record. Higher-precedence sources override lower ones only when verified.
      </p>
      <div className="od-table--bordered">
        <table className="od-table">
          <thead>
            <tr>
              <th style={{ width: 220 }}>Source</th>
              <th>What it provides</th>
            </tr>
          </thead>
          <tbody>
            {METHODS.map((m) => (
              <tr key={m.t}>
                <td className="mono" style={{ fontSize: 12.5 }}>
                  {m.t.toLowerCase().replace(/[\/ ]+/g, "_")}
                </td>
                <td style={{ color: "var(--od-ink-2)" }}>{m.d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2A id="verification">Verification statuses</H2A>
      <p className="od-body" style={{ maxWidth: 640, marginBottom: 16 }}>
        Statuses are descriptive, not a quality rating. A record may move between statuses as it is checked.
      </p>
      <div className="od-table--bordered">
        <table className="od-table">
          <thead>
            <tr>
              <th style={{ width: 200 }}>Status</th>
              <th>Definition</th>
            </tr>
          </thead>
          <tbody>
            {VERIF_STATUSES.map((s) => (
              <tr key={s.k}>
                <td>
                  <StatusBadge v={s.k} />
                </td>
                <td style={{ color: "var(--od-ink-2)" }}>{s.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2A id="confidence">Field-level confidence</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Verification is recorded per record, not per field. Where a single record contains fields from different sources,
        the lowest-confidence source for any required field governs the record-level status. Per-field provenance is
        available in the <InlineCode>sources</InlineCode> object on each record.
      </p>

      <H2A id="cadence">Update cadence</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Independent checks run daily. Datasets are cut into versioned releases tagged <InlineCode>YYYY.MM</InlineCode>.
        Every release is immutable and downloadable; the latest release is served at the unversioned path.
      </p>

      <H2A id="conflicts">Conflicts</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        When sources disagree, the conflict is recorded rather than silently resolved. The record retains the most
        authoritative value and exposes the disagreement in its provenance, so downstream consumers can decide.
      </p>

      <H2A id="corrections">Corrections</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Corrections are accepted via GitHub issue, pull request, or the correction form on each registrar page. A
        correction needs a record path, a field, a proposed value and a source link. Maintainers apply the correction
        and credit the contributor in the changelog.
      </p>

      <H2A id="submissions">Registrar submissions</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Registrars may submit a capability matrix or correction set via pull request. Submitted records are marked{" "}
        <StatusBadge v="registrar_submitted" /> until independently verified, at which point they move to{" "}
        <StatusBadge v="registrar_verified" />. Submissions are never silently merged.
      </p>

      <H2A id="separation">Commercial separation</H2A>
      <div style={{ marginTop: 4 }}>
        <CommercialSeparationNote />
      </div>

      <H2A id="limitations">Limitations</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Coverage is shaped by what is publicly observable. Closed registrar APIs, region-locked pricing, and undocumented
        rate limits are recorded as <InlineCode>unknown</InlineCode> rather than guessed. Open Domain Data does not infer
        values from partial signals.
      </p>

      <H2A id="reproducibility">Reproducibility notes</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Each release ships with the check scripts and source URLs used to produce it. Reruns against the same release tag
        produce the same artifacts; reruns against the latest release reflect any drift since the previous run.
      </p>

      <H2A id="licensing">Licensing</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        All datasets are published under <InlineCode>CC BY 4.0</InlineCode>. Attribution must cite Open Domain Data and
        the dataset version. Products that build rankings or recommendations on this data must disclose that they do so.
      </p>
    </DocShell>
  );
}
