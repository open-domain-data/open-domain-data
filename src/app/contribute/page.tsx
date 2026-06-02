import type { Metadata } from "next";
import { DocShell, PageHead, H2A } from "@/components/DocShell";
import { MetaBlock } from "@/components/Atoms";
import { IcGit, IcIssue, IcExt, IcShield } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Contribute",
  description: "How to submit corrections, open issues, file pull requests and propose schema changes.",
  alternates: { canonical: "/contribute" },
};

export default function ContributePage() {
  const side = [
    {
      h: "Contribute",
      links: [
        { label: "Overview", href: "#overview", active: true },
        { label: "Contribution workflow", href: "#workflow" },
        { label: "Open an issue", href: "#issues" },
        { label: "Pull requests", href: "#pulls" },
        { label: "Corrections", href: "#corrections" },
        { label: "Registrar submissions", href: "#registrar-submissions" },
        { label: "Schema changes", href: "#schema" },
        { label: "Verification expectations", href: "#verification" },
        { label: "Neutrality", href: "#neutrality" },
        { label: "Code of conduct", href: "#coc" },
      ],
    },
  ];

  const steps: [string, string, string][] = [
    ["1", "Fork the repository", "All data, schemas and methodology live in open-domain-data/open-domain-data."],
    ["2", "Make your change", "Edit a record, add a source, or propose a schema field — with provenance."],
    ["3", "Open a pull request", "CI validates records against the schema and checks source links."],
    ["4", "Review & release", "Maintainers review; merged changes land in the next dataset release."],
  ];

  return (
    <DocShell groups={side}>
      <PageHead
        crumb={[{ label: "contribute" }]}
        title="Contribute"
        desc="Open Domain Data is maintained in the open. Corrections, new sources and schema proposals are welcome."
        actions={
          <>
            <a className="od-btn od-btn--primary" href="https://github.com/open-domain-data/open-domain-data">
              <IcGit s={15} /> Open repository <IcExt s={12} style={{ opacity: 0.6 }} />
            </a>
            <a className="od-btn" href="https://github.com/open-domain-data/open-domain-data/issues/new/choose">
              <IcIssue s={15} /> New issue
            </a>
          </>
        }
      />

      <H2A id="overview">Overview</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Contributions must be factual and sourced. The repository contains the data, the schemas and the methodology;
        the website is generated from the same source. Every accepted change ships in the next dataset release and is
        recorded in the changelog.
      </p>

      <H2A id="workflow">Contribution workflow</H2A>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 0,
          border: "1px solid var(--od-line)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {steps.map((s, i) => (
          <div
            key={i}
            style={{ padding: "18px 16px", borderRight: i < 3 ? "1px solid var(--od-line)" : "none" }}
          >
            <span className="mono" style={{ fontSize: 12, color: "var(--od-link)", fontWeight: 600 }}>
              {s[0]}
            </span>
            <div className="od-h3" style={{ marginTop: 8, fontSize: 13.5 }}>
              {s[1]}
            </div>
            <p className="od-micro" style={{ marginTop: 6, lineHeight: 1.5 }}>
              {s[2]}
            </p>
          </div>
        ))}
      </div>

      <H2A id="issues">Open a GitHub issue</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Three issue templates are available: <em>correction</em>, <em>dataset request</em> and <em>schema proposal</em>.
        Pick the closest one — maintainers will reroute if needed.
      </p>

      <H2A id="pulls">Pull requests</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Pull requests must pass schema validation. CI runs the validator on every changed record. PR descriptions should
        cite at least one source URL.
      </p>

      <H2A id="corrections">Submit a correction</H2A>
      <p className="od-body" style={{ maxWidth: 640, marginBottom: 16 }}>
        Found an incorrect field? A correction needs the record, the field, the proposed value and a source. The fastest
        path is the correction form, which opens a pre-filled issue.
      </p>
      <MetaBlock
        rows={[
          ["record", "registrars/namecheap", true],
          ["field", "rdap_base", true],
          ["proposed_value", "https://rdap.namecheap.com", true],
          ["source", "https://rdap.org/registrar/1068", true],
          ["note", "optional context for the maintainer", true],
        ]}
      />

      <H2A id="registrar-submissions">Registrar submissions</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Registrars may submit a capability matrix as a pull request. Submissions are merged with the verification status
        <span className="od-icode" style={{ marginLeft: 4 }}>registrar_submitted</span>. Once an independent check
        confirms the record, the status updates to <span className="od-icode">registrar_verified</span>.
      </p>

      <H2A id="schema">Suggest a schema change</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Schema changes are proposed as pull requests against the schema file and discussed in an issue first. New fields
        must be optional until backfilled, and every enum value needs a definition. Accepted changes are recorded in the
        changelog with the release they ship in.
      </p>

      <H2A id="verification">Verification expectations</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        A field becomes <span className="od-icode">independently_tested</span> only when an automated probe confirms the
        documented behaviour against the live service. Contributors do not need to run these probes themselves —
        maintainers do so on a daily cadence.
      </p>

      <H2A id="neutrality">Neutrality</H2A>
      <div className="od-note od-note--accent" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <span style={{ color: "var(--od-ink-3)", marginTop: 1 }}>
          <IcShield s={18} />
        </span>
        <div>
          <div className="od-note__h">Neutrality</div>
          <p className="od-body" style={{ fontSize: 13.5 }}>
            Contributions must be factual and sourced. Open Domain Data does not accept rankings, endorsements or
            promotional language — those belong to separate products that consume this data.
          </p>
        </div>
      </div>

      <H2A id="coc">Code of conduct</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        The project follows the Contributor Covenant. Read the full text in{" "}
        <a className="od-link" href="https://github.com/open-domain-data/open-domain-data/blob/main/CODE_OF_CONDUCT.md">
          CODE_OF_CONDUCT.md
        </a>
        .
      </p>
    </DocShell>
  );
}
