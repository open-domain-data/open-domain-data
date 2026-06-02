import type { Metadata } from "next";
import Link from "next/link";
import { DATASETS, SCHEMAS } from "@/lib/data";
import { DocShell, PageHead, H2A } from "@/components/DocShell";
import { InlineCode } from "@/components/Atoms";
import { CodeBlock, K, S, N, Pu, Mt } from "@/components/CodeBlock";
import { IcDownload, IcFile } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Developers",
  description: "Static JSON endpoints, CSV downloads, JSON Schema files, llms.txt and citation examples.",
  alternates: { canonical: "/developers" },
};

const ENDPOINTS: [string, string, string][] = [
  ["GET", "/v1/datasets", "List all datasets with metadata."],
  ["GET", "/v1/datasets/{name}", "Dataset metadata, schema and provenance."],
  ["GET", "/v1/datasets/{name}/records", "Paginated records for a dataset."],
  ["GET", "/v1/registrars/{id}", "Single registrar entity record."],
  ["GET", "/v1/schemas/{name}", "JSON Schema for a dataset."],
];

function pathHighlight(p: string) {
  return p.split(/(\{[^}]+\})/).map((seg, i) =>
    seg.startsWith("{") ? (
      <span key={i} style={{ color: "var(--od-link)" }}>
        {seg}
      </span>
    ) : (
      seg
    ),
  );
}

export default function DevelopersPage() {
  const side = [
    {
      h: "API reference",
      links: [
        { label: "Introduction", href: "#introduction", active: true },
        { label: "Static JSON endpoints", href: "#static" },
        { label: "Downloads", href: "#downloads" },
        { label: "Schemas", href: "#schemas" },
        { label: "Authentication", href: "#auth" },
        { label: "Endpoints", href: "#endpoints" },
        { label: "Pagination", href: "#pagination" },
        { label: "Formats", href: "#formats" },
        { label: "Rate limits", href: "#ratelimits" },
        { label: "Citations", href: "#citations" },
        { label: "Roadmap", href: "#roadmap" },
      ],
    },
    {
      h: "Resources",
      links: [
        { label: "llms.txt", href: "/llms.txt", mono: true },
        { label: "openapi.json", href: "/openapi.json", mono: true },
        { label: "GitHub", href: "https://github.com/open-domain-data/open-domain-data", mono: false },
      ],
    },
  ];

  return (
    <DocShell groups={side}>
      <PageHead
        crumb={[{ label: "developers" }]}
        title="Developer reference"
        desc="A static-first, read-only data layer over every dataset. Open data — no authentication is required to read."
      />

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
        <span className="od-eyebrow">base url</span>
        <InlineCode>https://api.opendomaindata.org/v1</InlineCode>
        <span className="od-eyebrow" style={{ marginLeft: 12 }}>
          static base
        </span>
        <InlineCode>https://opendomaindata.org/api</InlineCode>
      </div>

      <H2A id="introduction">Introduction</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Every dataset is published as a static JSON file plus a CSV mirror. Responses are JSON by default; append{" "}
        <InlineCode>.csv</InlineCode> to any collection for CSV. Every file includes the dataset version and a{" "}
        <InlineCode>last_checked</InlineCode> timestamp. The API is versioned in the path; <InlineCode>v1</InlineCode> is
        stable.
      </p>

      <H2A id="static">Static JSON endpoints</H2A>
      <div className="od-table--bordered">
        <table className="od-table">
          <thead>
            <tr>
              <th>Dataset</th>
              <th>JSON</th>
              <th>CSV</th>
              <th>Schema</th>
            </tr>
          </thead>
          <tbody>
            {DATASETS.map((d) => (
              <tr key={d.slug}>
                <td>
                  <Link href={`/datasets/${d.slug}`} className="od-table__name">
                    {d.name}
                  </Link>
                </td>
                <td className="mono" style={{ fontSize: 12 }}>
                  <a className="od-link" href={`/api/${d.name}.json`}>
                    /api/{d.name}.json
                  </a>
                </td>
                <td className="mono" style={{ fontSize: 12 }}>
                  <a className="od-link" href={`/api/${d.name}.csv`}>
                    /api/{d.name}.csv
                  </a>
                </td>
                <td className="mono" style={{ fontSize: 12 }}>
                  <Link className="od-link" href={`/schemas/${d.name === "registrar_api_capabilities" ? "api-capabilities.schema.json" : d.name === "dns_capabilities" ? "dns-capabilities.schema.json" : d.name === "tld_pricing" ? "pricing.schema.json" : "registrar.schema.json"}`}>
                    schema
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2A id="downloads">Bulk downloads</H2A>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {DATASETS.map((d) => (
          <a key={d.slug} className="od-dl" href={`/api/${d.name}.json`}>
            <IcDownload s={14} /> {d.name}.json <span className="sz">· {d.records} records</span>
          </a>
        ))}
      </div>

      <H2A id="schemas">Schemas</H2A>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {SCHEMAS.map((s) => (
          <Link key={s.slug} className="od-dl" href={`/schemas/${s.slug}`}>
            <IcFile s={14} /> {s.slug}
          </Link>
        ))}
      </div>

      <H2A id="auth">Authentication</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Reads are public and unauthenticated. An optional API token raises rate limits and is sent as a bearer header.
        Tokens never grant write access — corrections are submitted via GitHub.
      </p>

      <H2A id="endpoints">Endpoints</H2A>
      <div className="od-table--bordered" style={{ marginBottom: 24 }}>
        <table className="od-table">
          <thead>
            <tr>
              <th style={{ width: 80 }}>Method</th>
              <th>Path</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {ENDPOINTS.map(([m, p, d], i) => (
              <tr key={i}>
                <td>
                  <span className={"od-status ok"} style={{ height: 19, fontSize: 10.5 }}>
                    {m}
                  </span>
                </td>
                <td className="mono" style={{ fontSize: 12.5, color: "var(--od-ink)" }}>
                  {pathHighlight(p)}
                </td>
                <td style={{ color: "var(--od-ink-2)" }}>{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div className="od-eyebrow" style={{ marginBottom: 8 }}>
            {"// request"}
          </div>
          <CodeBlock
            tabs={[
              {
                label: "cURL",
                content: (
                  <>
                    <Mt>curl</Mt> https://api.opendomaindata.org{"\\"}
                    {"\n"}
                    {"  "}/v1/datasets/registrars/records{"\\"}
                    {"\n"}
                    {"  "}
                    <Pu>?</Pu>
                    <K>country</K>
                    <Pu>=</Pu>
                    <S>US</S>
                    <Pu>&amp;</Pu>
                    <K>limit</K>
                    <Pu>=</Pu>
                    <N>2</N>
                  </>
                ),
              },
            ]}
          />
        </div>
        <div>
          <div className="od-eyebrow" style={{ marginBottom: 8 }}>
            {"// response"}
          </div>
          <CodeBlock
            tabs={[
              {
                label: "200 OK",
                content: (
                  <>
                    <Pu>{"{"}</Pu>
                    {"\n"}
                    {"  "}
                    <K>&quot;dataset&quot;</K>
                    <Pu>:</Pu> <S>&quot;registrars&quot;</S>
                    <Pu>,</Pu>
                    {"\n"}
                    {"  "}
                    <K>&quot;version&quot;</K>
                    <Pu>:</Pu> <S>&quot;2026.05&quot;</S>
                    <Pu>,</Pu>
                    {"\n"}
                    {"  "}
                    <K>&quot;count&quot;</K>
                    <Pu>:</Pu> <N>2</N>
                    <Pu>,</Pu>
                    {"\n"}
                    {"  "}
                    <K>&quot;records&quot;</K>
                    <Pu>:</Pu> <Pu>[</Pu>
                    {"\n"}
                    {"    "}
                    <Pu>{"{"}</Pu> <K>&quot;id&quot;</K>
                    <Pu>:</Pu> <S>&quot;cloudflare-registrar&quot;</S>
                    <Pu>,</Pu> <K>&quot;iana_id&quot;</K>
                    <Pu>:</Pu> <N>1910</N> <Pu>{"}"}</Pu>
                    <Pu>,</Pu>
                    {"\n"}
                    {"    "}
                    <Pu>{"{"}</Pu> <K>&quot;id&quot;</K>
                    <Pu>:</Pu> <S>&quot;namecheap&quot;</S>
                    <Pu>,</Pu> <K>&quot;iana_id&quot;</K>
                    <Pu>:</Pu> <N>1068</N> <Pu>{"}"}</Pu>
                    {"\n"}
                    {"  "}
                    <Pu>]</Pu>
                    {"\n"}
                    <Pu>{"}"}</Pu>
                  </>
                ),
              },
            ]}
          />
        </div>
      </div>

      <H2A id="pagination">Pagination</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Collections accept <InlineCode>limit</InlineCode> (default 100, max 1000) and <InlineCode>cursor</InlineCode>{" "}
        parameters. The cursor for the next page is returned in <InlineCode>links.next</InlineCode>. Bulk consumers
        should prefer the static JSON file.
      </p>

      <H2A id="formats">Formats</H2A>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {(
          [
            ["JSON", "default response format"],
            ["CSV", "append .csv to any collection"],
            ["llms.txt", "plain-text index for language models"],
            ["openapi.json", "machine-readable API description"],
          ] as const
        ).map(([n, d]) => (
          <div key={n} style={{ border: "1px solid var(--od-line)", borderRadius: 8, padding: "12px 14px", minWidth: 200 }}>
            <span className="od-chip">{n}</span>
            <p className="od-micro" style={{ marginTop: 8 }}>
              {d}
            </p>
          </div>
        ))}
      </div>

      <H2A id="ratelimits">Rate limits</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Unauthenticated: <InlineCode>60 req/min</InlineCode>. With a token: <InlineCode>600 req/min</InlineCode>. Bulk
        consumers should download the versioned dataset files rather than paginating the API.
      </p>

      <H2A id="citations">Citation</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Cite the dataset, version and retrieval date. Example:
      </p>
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
          marginTop: 10,
        }}
      >
        Open Domain Data (2026). <span style={{ color: "var(--od-ink)" }}>registrars</span>, v2026.05.
        <br />
        opendomaindata.org/datasets/registrars. Retrieved 2026-06-01. CC-BY-4.0.
      </div>

      <H2A id="roadmap">Roadmap</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Planned, in roughly the order they will land: published OpenAPI spec, language client packages, an MCP server
        exposing the catalog to AI agents, and an agent capability card. Roadmap items are advisory; specifics will be
        decided in the open via GitHub issues.
      </p>
    </DocShell>
  );
}
