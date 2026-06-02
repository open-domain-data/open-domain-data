import Link from "next/link";
import type { Metadata } from "next";
import { DATASETS, VERIF_STATUSES, METHODS, CHANGELOG, SITE } from "@/lib/data";
import { DatasetTable } from "@/components/DatasetTable";
import { StatusBadge, MetaBlock, Pill, InlineCode } from "@/components/Atoms";
import { CodeBlock, K, S, N, Pu } from "@/components/CodeBlock";
import { CommercialSeparationNote } from "@/components/CommercialSeparationNote";
import { DownloadLinks } from "@/components/DownloadLinks";
import {
  IcArrow,
  IcGit,
  IcExt,
  IcCopy,
  IcBook,
  IcTerminal,
  IcShield,
  IcPr,
  IcCheck,
  IcIssue,
  IcEdit,
  IcSchema,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: "Open domain infrastructure datasets",
  description: SITE.description,
  alternates: { canonical: "/" },
};

const ICONS: Record<string, (p: { s?: number }) => JSX.Element> = {
  book: IcBook,
  terminal: IcTerminal,
  shield: IcShield,
  pr: IcPr,
  check: IcCheck,
};

function SecHead({
  eyebrow,
  title,
  desc,
  link,
  href,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  link?: string;
  href?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 20, flexWrap: "wrap" }}>
      <div>
        {eyebrow && <div className="od-eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>}
        <h2 className="od-h2">{title}</h2>
        {desc && <p className="od-body" style={{ marginTop: 8, maxWidth: 620 }}>{desc}</p>}
      </div>
      {link && href && (
        <Link href={href} className="od-link od-small" style={{ display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", fontWeight: 500 }}>
          {link} <IcArrow s={14} />
        </Link>
      )}
    </div>
  );
}

function Hero() {
  return (
    <section style={{ padding: "56px 48px 52px", borderBottom: "1px solid var(--od-line)", background: "var(--od-bg)" }}>
      <div className="od-wrap">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          <span className="od-eyebrow">opendomaindata.org</span>
          <Pill mono>{SITE.version}</Pill>
          <span className="od-status muted" style={{ height: 20 }}>
            open data project
          </span>
        </div>
        <h1 className="od-h1" style={{ maxWidth: 760 }}>
          Open domain infrastructure datasets.
        </h1>
        <p className="od-lead" style={{ marginTop: 14, maxWidth: 680 }}>
          Versioned, machine-readable datasets for domain registrars, DNS capabilities, TLD pricing, RDAP metadata,
          API coverage and domain infrastructure research.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
          <Link className="od-btn od-btn--primary" href="/datasets">
            Browse datasets <IcArrow s={15} />
          </Link>
          <a className="od-btn" href={SITE.github}>
            <IcGit s={15} /> View GitHub <IcExt s={12} style={{ opacity: 0.5 }} />
          </a>
          <Link className="od-btn" href="/methodology">
            Read methodology
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 26, flexWrap: "wrap" }}>
          {[
            ["7", "datasets"],
            ["~58k", "records"],
            ["JSON · CSV", "formats"],
            ["CC BY 4.0", "license"],
            ["daily", "verification"],
          ].map(([n, l]) => (
            <div key={l} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--od-ink)" }}>
                {n}
              </span>
              <span className="od-micro">{l}</span>
            </div>
          ))}
        </div>
        <p className="od-micro" style={{ marginTop: 18, maxWidth: 620, color: "var(--od-ink-3)" }}>
          Open-source datasets. Public methodology. Versioned schemas.
          GitHub-based contributions.{" "}
          <a className="od-link" href={SITE.github}>
            github.com/open-domain-data/open-domain-data
          </a>
        </p>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "var(--od-mono)",
            fontSize: 12.5,
            color: "var(--od-ink-2)",
            background: "var(--od-panel)",
            border: "1px solid var(--od-line)",
            borderRadius: 6,
            padding: "10px 14px",
            maxWidth: 520,
          }}
        >
          <span style={{ color: "var(--od-ink-4)" }}>$</span>
          <span>
            <span style={{ color: "var(--od-ok)" }}>curl</span>{" "}
            https://api.opendomaindata.org/v1/datasets
          </span>
          <IcCopy s={13} style={{ marginLeft: "auto", color: "var(--od-ink-4)" }} />
        </div>
      </div>
    </section>
  );
}

function CatalogPreview() {
  return (
    <section className="od-section">
      <div className="od-wrap">
        <SecHead
          eyebrow="// catalog"
          title="Datasets"
          desc="Every dataset is independently versioned, documented by a schema, and downloadable as JSON and CSV."
          link="View all datasets"
          href="/datasets"
        />
        <DatasetTable datasets={DATASETS} />
      </div>
    </section>
  );
}

function ExampleRecord() {
  const sample = {
    id: "namecheap",
    iana_id: 1068,
    name: "Namecheap, Inc.",
    rdap_base: "https://rdap.namecheap.com",
    status: "active",
    country: "US",
    sources: ["iana", "rdap", "registrar_docs"],
    verification_status: "independently_tested",
    last_checked: "2026-05-31T04:12:00Z",
  };
  const csv =
    "id,iana_id,name,rdap_base,status,country,sources,verification_status,last_checked\nnamecheap,1068,\"Namecheap, Inc.\",https://rdap.namecheap.com,active,US,\"iana|rdap|registrar_docs\",independently_tested,2026-05-31T04:12:00Z";
  const schemaPreview = JSON.stringify(
    {
      $id: "https://opendomaindata.org/schemas/registrar.schema.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "Registrar",
      required: ["id", "iana_id", "name", "status", "sources", "verification_status", "last_checked"],
    },
    null,
    2,
  );
  return (
    <section className="od-section" style={{ background: "var(--od-bg)" }}>
      <div className="od-wrap">
        <SecHead
          eyebrow="// example record"
          title="One record, three representations"
          desc="Records ship as JSON and CSV, and validate against a published schema."
          link="View developer reference"
          href="/developers"
        />
        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 0.65fr", gap: 20, alignItems: "start" }}>
          <CodeBlock
            tabs={[
              {
                label: "JSON",
                content: (
                  <>
                    <Pu>{"{"}</Pu>
                    {"\n"}
                    {`  `}
                    <K>&quot;id&quot;</K>
                    <Pu>:</Pu> <S>&quot;namecheap&quot;</S>
                    <Pu>,</Pu>
                    {"\n"}
                    {`  `}
                    <K>&quot;iana_id&quot;</K>
                    <Pu>:</Pu> <N>1068</N>
                    <Pu>,</Pu>
                    {"\n"}
                    {`  `}
                    <K>&quot;name&quot;</K>
                    <Pu>:</Pu> <S>&quot;Namecheap, Inc.&quot;</S>
                    <Pu>,</Pu>
                    {"\n"}
                    {`  `}
                    <K>&quot;rdap_base&quot;</K>
                    <Pu>:</Pu> <S>&quot;https://rdap.namecheap.com&quot;</S>
                    <Pu>,</Pu>
                    {"\n"}
                    {`  `}
                    <K>&quot;status&quot;</K>
                    <Pu>:</Pu> <S>&quot;active&quot;</S>
                    <Pu>,</Pu>
                    {"\n"}
                    {`  `}
                    <K>&quot;country&quot;</K>
                    <Pu>:</Pu> <S>&quot;US&quot;</S>
                    <Pu>,</Pu>
                    {"\n"}
                    {`  `}
                    <K>&quot;sources&quot;</K>
                    <Pu>:</Pu> <Pu>[</Pu>
                    <S>&quot;iana&quot;</S>
                    <Pu>,</Pu> <S>&quot;rdap&quot;</S>
                    <Pu>,</Pu> <S>&quot;registrar_docs&quot;</S>
                    <Pu>]</Pu>
                    <Pu>,</Pu>
                    {"\n"}
                    {`  `}
                    <K>&quot;verification_status&quot;</K>
                    <Pu>:</Pu> <S>&quot;independently_tested&quot;</S>
                    <Pu>,</Pu>
                    {"\n"}
                    {`  `}
                    <K>&quot;last_checked&quot;</K>
                    <Pu>:</Pu> <S>&quot;2026-05-31T04:12:00Z&quot;</S>
                    {"\n"}
                    <Pu>{"}"}</Pu>
                  </>
                ),
              },
              {
                label: "CSV",
                content: csv,
              },
              {
                label: "Schema",
                content: schemaPreview,
              },
            ]}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <MetaBlock
              rows={[
                ["record", "registrars/namecheap"],
                ["schema", "registrars@2026.05"],
                ["status", <StatusBadge key="s" v="independently_tested" />],
                ["last_checked", "2026-05-31"],
                ["license", "CC-BY-4.0"],
              ]}
            />
            <DownloadLinks
              jsonHref="/api/registrars.json"
              csvHref="/api/registrars.csv"
              schemaHref="/schemas/registrar.schema.json"
              jsonSize="4.1 MB"
              csvSize="1.8 MB"
              schemaSize="6 KB"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function VerificationStatusesSection() {
  return (
    <section className="od-section">
      <div className="od-wrap">
        <SecHead
          eyebrow="// verification"
          title="Verification statuses"
          desc="Every record carries a status describing how it was checked. Statuses are descriptive, not a quality score."
        />
        <div className="od-table--bordered">
          <table className="od-table">
            <thead>
              <tr>
                <th style={{ width: 200 }}>Status</th>
                <th style={{ width: 220 }}>Key</th>
                <th>Definition</th>
              </tr>
            </thead>
            <tbody>
              {VERIF_STATUSES.map((s) => (
                <tr key={s.k}>
                  <td>
                    <StatusBadge v={s.k} />
                  </td>
                  <td className="mono" style={{ fontSize: 12.5, color: "var(--od-ink-2)" }}>
                    {s.k}
                  </td>
                  <td style={{ color: "var(--od-ink-2)" }}>{s.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function MethodologySnapshot() {
  return (
    <section className="od-section" style={{ background: "var(--od-bg)" }}>
      <div className="od-wrap">
        <SecHead
          eyebrow="// methodology"
          title="How the data is collected"
          desc="Each field records its provenance. Sources are combined, never silently reconciled — conflicts are flagged."
          link="Read full methodology"
          href="/methodology"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5,1fr)",
            gap: 0,
            border: "1px solid var(--od-line)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {METHODS.map((m, i) => {
            const Icon = ICONS[m.icon];
            return (
              <div
                key={m.t}
                style={{
                  padding: "20px 18px",
                  borderRight: i < METHODS.length - 1 ? "1px solid var(--od-line)" : "none",
                  background: "var(--od-bg)",
                }}
              >
                <span style={{ color: "var(--od-ink-3)" }}>{Icon && <Icon s={18} />}</span>
                <div className="od-h3" style={{ marginTop: 12, fontSize: 13.5 }}>
                  {m.t}
                </div>
                <p className="od-micro" style={{ marginTop: 6, lineHeight: 1.5 }}>
                  {m.d}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ChangelogPreview() {
  return (
    <section className="od-section">
      <div className="od-wrap">
        <SecHead eyebrow="// changelog" title="Recent changes" link="View full changelog" href="/changelog" />
        <div>
          {CHANGELOG.map((c, i) => (
            <div key={i} className="od-clog">
              <div className="od-clog__meta">
                <span className="od-clog__date">{c.date}</span>
                <span className="od-clog__ds">
                  {c.ds}
                  <span style={{ color: "var(--od-ink-4)" }}>@{c.ver}</span>
                </span>
              </div>
              <div className="od-clog__body">{c.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contribute() {
  const items: { Icon: (p: { s?: number }) => JSX.Element; t: string; d: string; a: string; href: string }[] = [
    {
      Icon: IcIssue,
      t: "Open a GitHub issue",
      d: "Report an incorrect record, request a dataset, or raise a question.",
      a: "github.com/open-domain-data/open-domain-data/issues",
      href: "https://github.com/open-domain-data/open-domain-data/issues/new/choose",
    },
    {
      Icon: IcPr,
      t: "Submit a pull request",
      d: "Propose data or schema changes directly against the source repository.",
      a: "CONTRIBUTING.md",
      href: "/contribute#workflow",
    },
    {
      Icon: IcEdit,
      t: "Submit a correction",
      d: "Flag an incorrect field with a source link via the correction form.",
      a: "/contribute#corrections",
      href: "/contribute#corrections",
    },
    {
      Icon: IcSchema,
      t: "Suggest a schema change",
      d: "Propose new fields, types or enum values for a dataset schema.",
      a: "/schemas",
      href: "/schemas",
    },
  ];
  return (
    <section className="od-section" style={{ background: "var(--od-bg)" }}>
      <div className="od-wrap">
        <SecHead
          eyebrow="// contribute"
          title="Open to corrections and contributions"
          desc="Open Domain Data is maintained in the open. Data, schemas and methodology all live in the repository."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {items.map((it) => (
            <Link
              key={it.t}
              href={it.href}
              style={{
                border: "1px solid var(--od-line)",
                borderRadius: 8,
                padding: 18,
                background: "var(--od-bg)",
                display: "block",
              }}
            >
              <span style={{ color: "var(--od-ink-3)" }}>
                <it.Icon s={18} />
              </span>
              <div className="od-h3" style={{ marginTop: 12 }}>
                {it.t}
              </div>
              <p className="od-micro" style={{ marginTop: 6, lineHeight: 1.5 }}>
                {it.d}
              </p>
              <div
                className="mono"
                style={{ fontSize: 11, color: "var(--od-link)", marginTop: 12, wordBreak: "break-all" }}
              >
                {it.a}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function SeparationNote() {
  return (
    <section className="od-section" style={{ borderBottom: "none" }}>
      <div className="od-wrap">
        <CommercialSeparationNote />
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <CatalogPreview />
      <ExampleRecord />
      <VerificationStatusesSection />
      <MethodologySnapshot />
      <ChangelogPreview />
      <Contribute />
      <SeparationNote />
    </>
  );
}
