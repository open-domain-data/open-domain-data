import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  REGISTRARS,
  API_CAPABILITIES,
  DNS_CAPABILITIES,
  TLD_PRICING,
  SECURITY_CONTACTS,
  AGENT_SIGNALS,
} from "@/lib/data";
import { DocShell, PageHead, H2A } from "@/components/DocShell";
import { StatusBadge, MetaBlock } from "@/components/Atoms";
import { JsonPreview } from "@/components/JsonPreview";
import { JsonLd } from "@/components/JsonLd";
import { IcDownload, IcEdit, IcExt } from "@/components/Icons";

export function generateStaticParams() {
  return REGISTRARS.map((r) => ({ slug: r.id }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const r = REGISTRARS.find((x) => x.id === params.slug);
  if (!r) return { title: "Registrar not found" };
  return {
    title: r.name,
    description: `Open Domain Data record for ${r.name}. IANA ID ${r.iana_id}.`,
    alternates: { canonical: `/registrars/${r.id}` },
  };
}

export default function RegistrarRecordPage({ params }: { params: { slug: string } }) {
  const r = REGISTRARS.find((x) => x.id === params.slug);
  if (!r) notFound();

  const apiCap = API_CAPABILITIES.find((x) => x.registrar_id === r.id);
  const dnsCap = DNS_CAPABILITIES.find((x) => x.registrar_id === r.id);
  const pricing = TLD_PRICING.filter((x) => x.registrar_id === r.id);
  const security = SECURITY_CONTACTS.find((x) => x.registrar_id === r.id);
  const signals = AGENT_SIGNALS.find((x) => x.registrar_id === r.id);

  const side = [
    {
      h: "Registrars",
      links: REGISTRARS.map((x) => ({ label: x.id, href: `/registrars/${x.id}`, mono: true, active: x.id === r.id })),
    },
    {
      h: "On this entity",
      links: [
        { label: "Record", href: "#record", active: true },
        { label: "Field provenance", href: "#provenance" },
        { label: "Appears in", href: "#appears" },
        { label: "API capabilities", href: "#api" },
        { label: "DNS capabilities", href: "#dns" },
        { label: "Pricing", href: "#pricing" },
        { label: "Sources", href: "#sources" },
        { label: "Raw JSON", href: "#raw" },
      ],
    },
  ];

  const appears: [string, string, string, string][] = [
    ["registrars", "rdap_base", r.rdap_base, r.verification_status],
    apiCap ? ["registrar_api_capabilities", "auth_model", apiCap.auth_model, apiCap.verification_status] : null,
    dnsCap ? ["dns_capabilities", "dnssec", dnsCap.dnssec, dnsCap.verification_status] : null,
    security ? ["registrar_security_contacts", "security_txt", security.security_txt, security.verification_status] : null,
    signals
      ? ["agent_capability_signals", "api_available", String(signals.api_available), signals.verification_status]
      : null,
  ].filter(Boolean) as [string, string, string, string][];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: r.name,
          alternateName: r.aliases,
          url: r.website,
          identifier: { "@type": "PropertyValue", propertyID: "IANA-ID", value: r.iana_id },
          additionalProperty: [
            { "@type": "PropertyValue", name: "rdap_base", value: r.rdap_base },
            { "@type": "PropertyValue", name: "verification_status", value: r.verification_status },
          ],
        }}
      />
      <DocShell groups={side}>
        <PageHead
          crumb={[
            { label: "registrars", href: "/registrars" },
            { label: r.id },
          ]}
          title={r.name}
          status={<StatusBadge v={r.status} />}
          desc="Entity record assembled across datasets. Open Domain Data describes this registrar; it does not rate or recommend it."
          actions={
            <>
              <a className="od-btn" href={`/api/registrars.json`}>
                <IcDownload s={15} /> Record JSON
              </a>
              <a className="od-btn" href={r.website}>
                Visit website <IcExt s={12} style={{ opacity: 0.5 }} />
              </a>
              <a
                className="od-btn"
                href={`https://github.com/open-domain-data/open-domain-data/issues/new?template=correction.md&title=Correction: ${r.id}`}
              >
                <IcEdit s={15} /> Submit a correction
              </a>
            </>
          }
        />

        <H2A id="record">Record</H2A>
        <MetaBlock
          rows={[
            ["id", r.id],
            ["stable_id", r.id],
            ["aliases", r.aliases.join(", ")],
            ["iana_id", String(r.iana_id)],
            ["name", r.name],
            ["website", r.website],
            ["rdap_base", r.rdap_base],
            ["status", <StatusBadge key="s" v={r.status} />],
            ["country", r.country],
            ["sources", r.sources.join(", ")],
            ["verification_status", <StatusBadge key="vs" v={r.verification_status} />],
            ["last_checked", r.last_checked],
          ]}
        />

        <H2A id="provenance">Field provenance</H2A>
        <p className="od-body" style={{ fontSize: 13.5, marginBottom: 12 }}>
          Provenance is recorded per field, not only per record. Each row below names the
          primary source the value was checked against, how it was verified and when. Where a
          field has its own provenance, it is authoritative over the record-level{" "}
          <span className="mono">verification_status</span> for that field.
        </p>
        {r.field_provenance ? (
          <div className="od-table--bordered">
            <table className="od-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                  <th>Source</th>
                  <th>Verification</th>
                  <th>Last checked</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(r.field_provenance).map(([field, p]) => {
                  const value = (r as unknown as Record<string, unknown>)[field];
                  return (
                    <tr key={field}>
                      <td className="mono" style={{ fontSize: 12, color: "var(--od-ink-2)" }}>
                        {field}
                      </td>
                      <td className="mono" style={{ fontSize: 12, color: "var(--od-ink)" }}>
                        {String(value)}
                      </td>
                      <td>
                        <a className="od-link mono" style={{ fontSize: 11.5 }} href={p.source_url}>
                          {p.source_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                      </td>
                      <td>
                        <StatusBadge v={p.verification_status} />
                      </td>
                      <td className="mono" style={{ fontSize: 11.5, color: "var(--od-ink-2)" }}>
                        {p.last_checked.slice(0, 10)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="od-micro">
            No per-field provenance recorded for this record yet. Record-level{" "}
            <span className="mono">sources</span> and <span className="mono">verification_status</span>{" "}
            apply to all fields.
          </p>
        )}

        <H2A id="appears">Appears in datasets</H2A>
        <div className="od-table--bordered">
          <table className="od-table">
            <thead>
              <tr>
                <th>Dataset</th>
                <th>Field</th>
                <th>Value</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody>
              {appears.map((a, i) => (
                <tr key={i}>
                  <td>
                    <Link href={`/datasets/${a[0].replace(/_/g, "-")}`} className="od-table__name">
                      {a[0]}
                    </Link>
                  </td>
                  <td className="mono" style={{ fontSize: 12, color: "var(--od-ink-2)" }}>
                    {a[1]}
                  </td>
                  <td className="mono" style={{ fontSize: 12, color: "var(--od-ink)" }}>
                    {a[2]}
                  </td>
                  <td>
                    <StatusBadge v={a[3]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {apiCap && (
          <>
            <H2A id="api">API capabilities</H2A>
            <MetaBlock
              rows={[
                ["api_available", String(apiCap.api_available)],
                ["auth_model", apiCap.auth_model],
                ["scoped_tokens", String(apiCap.scoped_tokens)],
                ["oauth_support", String(apiCap.oauth_support)],
                ["webhooks", String(apiCap.webhooks)],
                ["sandbox_url", apiCap.sandbox_url ?? "—"],
                ["openapi_spec", apiCap.openapi_spec ?? "—"],
                ["rate_limit", apiCap.rate_limit],
                ["docs_url", apiCap.docs_url],
              ]}
            />
          </>
        )}

        {dnsCap && (
          <>
            <H2A id="dns">DNS capabilities</H2A>
            <MetaBlock
              rows={[
                ["dnssec", dnsCap.dnssec],
                ["alias_aname", String(dnsCap.alias_aname)],
                ["caa", String(dnsCap.caa)],
                ["api_record_management", String(dnsCap.api_record_management)],
                ["record_types", dnsCap.record_types.join(", ")],
                ["ttl_min_seconds", String(dnsCap.ttl_min_seconds)],
              ]}
            />
          </>
        )}

        {pricing.length > 0 && (
          <>
            <H2A id="pricing">Pricing</H2A>
            <div className="od-table--bordered">
              <table className="od-table">
                <thead>
                  <tr>
                    <th>TLD</th>
                    <th className="num" style={{ textAlign: "right" }}>
                      Register
                    </th>
                    <th className="num" style={{ textAlign: "right" }}>
                      Renew
                    </th>
                    <th className="num" style={{ textAlign: "right" }}>
                      Transfer
                    </th>
                    <th>Promotional</th>
                    <th>Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.map((p) => (
                    <tr key={p.tld}>
                      <td className="mono" style={{ fontSize: 12.5 }}>
                        .{p.tld}
                      </td>
                      <td className="num">{p.register_usd?.toFixed(2)}</td>
                      <td className="num">{p.renew_usd?.toFixed(2)}</td>
                      <td className="num">{p.transfer_usd?.toFixed(2)}</td>
                      <td className="mono" style={{ fontSize: 12 }}>
                        {String(p.promotional)}
                      </td>
                      <td>
                        <StatusBadge v={p.verification_status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="od-micro" style={{ marginTop: 8 }}>
              Sample pricing in USD. Sample / preliminary values; see the{" "}
              <Link href="/datasets/tld-pricing" className="od-link">tld_pricing dataset</Link> for the full record.
            </p>
          </>
        )}

        <H2A id="sources">Sources</H2A>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {[
            [`IANA registrar ID ${r.iana_id}`, "iana.org/assignments/registrar-ids"],
            ["RDAP service response", r.rdap_base.replace(/^https?:\/\//, "")],
            ["Registrar documentation", r.website.replace(/^https?:\/\//, "")],
          ].map(([d, u], i) => (
            <li
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                padding: "10px 0",
                borderTop: "1px solid var(--od-line)",
              }}
            >
              <span className="od-body" style={{ fontSize: 13.5 }}>
                {d}
              </span>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--od-link)" }}>
                {u}
              </span>
            </li>
          ))}
        </ul>

        <H2A id="raw" right={<span className="mono od-small">/v1/registrars/{r.id}</span>}>
          Raw JSON
        </H2A>
        <JsonPreview
          value={{
            id: r.id,
            iana_id: r.iana_id,
            name: r.name,
            rdap_base: r.rdap_base,
            status: r.status,
            country: r.country,
            website: r.website,
            aliases: r.aliases,
            sources: r.sources,
            verification_status: r.verification_status,
            last_checked: r.last_checked,
            field_provenance: r.field_provenance,
          }}
        />
      </DocShell>
    </>
  );
}
