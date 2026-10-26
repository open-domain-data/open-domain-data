import Link from "next/link";
import type { LandscapeEdition } from "@/lib/landscape";
import { FEATURED_CROSS_CITATION_ID } from "@/lib/landscape";
import { H2A } from "./DocShell";
import { InlineCode, MetaBlock } from "./Atoms";
import { CommercialSeparationNote } from "./CommercialSeparationNote";
import { IcDownload, IcSchema } from "./Icons";

function editionSlug(edition: LandscapeEdition) {
  return edition.edition.toLowerCase();
}

export function LandscapeView({ edition }: { edition: LandscapeEdition }) {
  const slug = editionSlug(edition);
  const headline = edition.records.filter((s) => s.headline);
  const featured = edition.records.find((s) => s.id === FEATURED_CROSS_CITATION_ID);

  return (
    <>
      <div className="od-note" style={{ marginBottom: 24 }}>
        <div className="od-note__h">Coverage &amp; scope</div>
        <p className="od-body" style={{ fontSize: 14 }}>
          Every statistic below is computed over the{" "}
          <strong>{edition.coverage.tracked_registrars} registrars Open Domain Data currently tracks</strong> — not the
          whole registrar industry. Shares describe this tracked sample. As coverage grows each quarter the sample
          becomes more representative; the denominator is stated on every stat so a reader always knows what a percentage
          is over. Numbers are computed deterministically from the primary datasets and re-checked in CI.
        </p>
      </div>

      <H2A id="headline">Headline statistics</H2A>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {headline.map((s) => (
          <Link
            key={s.id}
            href={`/landscape/${slug}/${s.id}`}
            style={{
              border: "1px solid var(--od-line)",
              borderRadius: 8,
              padding: "16px 18px",
              background: "var(--od-bg)",
              textDecoration: "none",
              display: "block",
            }}
          >
            <div className="mono" style={{ fontSize: 26, fontWeight: 600, color: "var(--od-ink)" }}>
              {s.value}
            </div>
            <div className="od-body" style={{ fontSize: 13.5, color: "var(--od-ink-2)", marginTop: 6 }}>
              {s.metric}
            </div>
            <div className="od-micro" style={{ marginTop: 8, color: "var(--od-link)" }}>
              View stat &amp; sources →
            </div>
          </Link>
        ))}
      </div>

      <H2A id="all-stats">All statistics ({edition.records.length})</H2A>
      <div className="od-table--bordered">
        <table className="od-table">
          <thead>
            <tr>
              <th>metric</th>
              <th style={{ width: 90 }}>value</th>
              <th>statement</th>
              <th style={{ width: 90 }}>type</th>
            </tr>
          </thead>
          <tbody>
            {edition.records.map((s) => (
              <tr key={s.id}>
                <td>
                  <Link href={`/landscape/${slug}/${s.id}`} className="od-table__name">
                    {s.metric}
                  </Link>
                </td>
                <td className="mono" style={{ fontSize: 12.5, color: "var(--od-ink)" }}>
                  {s.value}
                </td>
                <td className="od-body" style={{ fontSize: 13 }}>
                  {s.statement}
                </td>
                <td className="od-micro">{s.headline ? "headline" : "supporting"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2A id="separation">Facts, not rankings</H2A>
      <CommercialSeparationNote />

      <H2A id="cross-citation">Reuse &amp; cross-citation</H2A>
      <p className="od-body" style={{ maxWidth: 660 }}>
        These statistics are published under CC BY 4.0 for anyone to quote — press, blogs, other open directories and AI
        answers — as long as the source is credited. The data is available as a stable JSON and CSV feed so it can be
        cited programmatically. See the{" "}
        <a className="od-link" href="https://github.com/open-domain-data/open-domain-data/blob/main/docs/cross-citation.md">
          cross-citation convention
        </a>{" "}
        for the exact attribution wording.
      </p>
      {featured && (
        <div className="od-note od-note--accent" style={{ marginTop: 14 }}>
          <div className="od-note__h">Featured stat for cross-citation</div>
          <p className="od-body" style={{ fontSize: 14 }}>
            {featured.statement}{" "}
            <Link href={`/landscape/${slug}/${featured.id}`} className="od-link">
              Cite this stat →
            </Link>
          </p>
        </div>
      )}

      <H2A id="downloads">Data &amp; endpoints</H2A>
      <p className="od-body" style={{ maxWidth: 640, marginBottom: 12 }}>
        The machine-readable dataset behind this edition: <InlineCode>/api/registrar_landscape.json</InlineCode>. Its
        schema and full record view live in the{" "}
        <Link href="/datasets/registrar-landscape" className="od-link">
          data catalog
        </Link>
        .
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a className="od-dl" href="/api/registrar_landscape.json">
          <IcDownload s={14} /> registrar_landscape.json
        </a>
        <a className="od-dl" href="/api/registrar_landscape.csv">
          <IcDownload s={14} /> registrar_landscape.csv
        </a>
        <Link className="od-dl" href="/schemas/registrar-landscape.schema.json">
          <IcSchema s={14} /> registrar-landscape.schema.json
        </Link>
      </div>

      <H2A id="edition">Edition</H2A>
      <MetaBlock
        rows={[
          ["edition", edition.edition],
          ["cadence", edition.cadence],
          ["tracked_registrars", String(edition.coverage.tracked_registrars)],
          ["statistics", String(edition.records.length)],
          ["last_checked", edition.last_checked],
          ["license", edition.license],
          ["source_datasets", "registrar_api_capabilities, dns_capabilities, agent_capability_signals, rdap_metadata, registrar_security_contacts"],
        ]}
      />
      <p className="od-micro" style={{ marginTop: 14 }}>
        Cite as: Open Domain Data ({edition.edition}). registrar_landscape, {edition.edition}.
        opendomaindata.org/landscape/{slug}. Licensed CC BY 4.0.
      </p>
    </>
  );
}

export function lsSide(activeStat?: string) {
  return [
    { h: "Landscape", links: [{ label: "2026-Q3 edition", href: "/landscape", active: !activeStat }] },
    {
      h: "On this page",
      links: [
        { label: "Headline statistics", href: "/landscape#headline" },
        { label: "All statistics", href: "/landscape#all-stats" },
        { label: "Facts, not rankings", href: "/landscape#separation" },
        { label: "Reuse & cross-citation", href: "/landscape#cross-citation" },
        { label: "Data & endpoints", href: "/landscape#downloads" },
      ],
    },
    { h: "Catalog", links: [{ label: "registrar_landscape dataset", href: "/datasets/registrar-landscape", mono: true }] },
  ];
}
