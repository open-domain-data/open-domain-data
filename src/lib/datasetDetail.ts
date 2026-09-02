import {
  REGISTRARS_SCHEMA,
  API_CAPABILITIES_SCHEMA,
  DNS_CAPABILITIES_SCHEMA,
  PRICING_SCHEMA,
  AGENT_SIGNALS_SCHEMA,
  REGISTRARS,
  API_CAPABILITIES,
  DNS_CAPABILITIES,
  TLD_PRICING,
  RDAP_METADATA,
  SECURITY_CONTACTS,
  AGENT_SIGNALS,
  LANDSCAPE_SCHEMA,
  OWNERSHIP_SCHEMA,
  TLD_REGISTRY_SCHEMA,
  REGISTRAR_OWNERSHIP,
  TLD_REGISTRY,
  type Dataset,
} from "./data";
import { LANDSCAPE_STATS } from "./landscape";

export type DatasetDetail = {
  fields: { f: string; t: string; r: boolean; d: string }[];
  schemaSlug: string;
  jsonHref: string;
  csvHref?: string;
  sources: [string, string, string][];
  records: unknown[];
  recordTableHeader: string[];
  rowRenderer: "registrar" | "api_caps" | "dns_caps" | "pricing" | "rdap" | "security" | "agent" | "landscape" | "ownership" | "tld_registry";
};

export function getDatasetDetail(slug: string): DatasetDetail | null {
  switch (slug) {
    case "registrars":
      return {
        fields: REGISTRARS_SCHEMA,
        schemaSlug: "registrar.schema.json",
        jsonHref: "/api/registrars.json",
        csvHref: "/api/registrars.csv",
        sources: [
          ["iana", "IANA accredited registrar list & RDAP bootstrap registry", "https://www.iana.org/assignments/registrar-ids"],
          ["rdap", "Live RDAP queries against each registrar service", "rdap.org/registrar/{iana_id}"],
          ["registrar_docs", "Published registrar documentation and status pages", "various"],
        ],
        records: REGISTRARS,
        recordTableHeader: ["id", "iana_id", "name", "country", "status", "verification_status", "last_checked"],
        rowRenderer: "registrar",
      };
    case "registrar-api-capabilities":
      return {
        fields: API_CAPABILITIES_SCHEMA,
        schemaSlug: "api-capabilities.schema.json",
        jsonHref: "/api/registrar_api_capabilities.json",
        sources: [
          ["registrar_docs", "Published registrar API documentation", "various"],
          ["submission", "Registrar-submitted capability matrix via PR", "github.com/open-domain-data/open-domain-data"],
        ],
        records: API_CAPABILITIES,
        recordTableHeader: ["registrar_id", "api_available", "auth_model", "scoped_tokens", "webhooks", "verification_status"],
        rowRenderer: "api_caps",
      };
    case "dns-capabilities":
      return {
        fields: DNS_CAPABILITIES_SCHEMA,
        schemaSlug: "dns-capabilities.schema.json",
        jsonHref: "/api/dns_capabilities.json",
        sources: [
          ["registrar_docs", "Registrar DNS documentation", "various"],
          ["rdap", "RDAP responses for record types", "rdap.org"],
        ],
        records: DNS_CAPABILITIES,
        recordTableHeader: ["registrar_id", "dnssec", "alias_aname", "caa", "api_record_management", "verification_status"],
        rowRenderer: "dns_caps",
      };
    case "tld-pricing":
      return {
        fields: PRICING_SCHEMA,
        schemaSlug: "pricing.schema.json",
        jsonHref: "/api/tld_pricing.json",
        sources: [
          ["registrar_docs", "Published registrar pricing pages", "various"],
        ],
        records: TLD_PRICING.slice(0, 24),
        recordTableHeader: ["registrar_id", "tld", "register_usd", "renew_usd", "transfer_usd", "verification_status"],
        rowRenderer: "pricing",
      };
    case "registrar-ownership":
      return {
        fields: OWNERSHIP_SCHEMA,
        schemaSlug: "registrar-ownership.schema.json",
        jsonHref: "/api/registrar_ownership.json",
        sources: [
          ["cross_site_feed", "Compiled ownership records citing corporate reporting per claim", "various (source_url per record)"],
        ],
        records: REGISTRAR_OWNERSHIP,
        recordTableHeader: ["brand_name", "relationship", "parent_group_name", "parent_type", "verification_status"],
        rowRenderer: "ownership",
      };
    case "tld-registry":
      return {
        fields: TLD_REGISTRY_SCHEMA,
        schemaSlug: "tld-registry.schema.json",
        jsonHref: "/api/tld_registry.json",
        sources: [
          ["iana", "IANA Root Zone Database", "iana.org/domains/root/db"],
          ["cross_site_feed", "Machine-readable compilation of the IANA records", "various"],
        ],
        records: TLD_REGISTRY.slice(0, 24),
        recordTableHeader: ["tld", "type", "operator", "country", "verification_status"],
        rowRenderer: "tld_registry",
      };
    case "rdap-metadata":
      return {
        fields: [
          { f: "registrar_id", t: "string", r: true, d: "Foreign key to registrars.id." },
          { f: "base_url", t: "string · uri", r: true, d: "RDAP service base URL." },
          { f: "conformance", t: "string", r: true, d: "Reported RDAP conformance (e.g. rfc7483)." },
          { f: "iana_bootstrapped", t: "boolean", r: true, d: "Listed in the IANA RDAP bootstrap registry." },
          { f: "verification_status", t: "enum", r: true, d: "See verification statuses." },
          { f: "last_checked", t: "string · date-time", r: true, d: "ISO 8601 timestamp." },
          { f: "field_provenance", t: "object", r: false, d: "Per-field source_url, verification_status, last_checked and note." },
        ],
        schemaSlug: "rdap-metadata.schema.json",
        jsonHref: "/api/rdap_metadata.json",
        sources: [
          ["iana", "IANA RDAP bootstrap registry", "iana.org/assignments/rdap-dns/"],
          ["rdap", "Live RDAP service responses", "rdap.org"],
        ],
        records: RDAP_METADATA,
        recordTableHeader: ["registrar_id", "base_url", "conformance", "iana_bootstrapped", "verification_status"],
        rowRenderer: "rdap",
      };
    case "registrar-security-contacts":
      return {
        fields: [
          { f: "registrar_id", t: "string", r: true, d: "Foreign key to registrars.id." },
          { f: "abuse_email", t: "string", r: true, d: "Listed abuse contact email." },
          { f: "security_txt", t: "enum", r: true, d: "present | absent | unknown (RFC 9116 detection)." },
          { f: "policy_url", t: "string · uri | null", r: false, d: "Published abuse policy, if confirmed." },
          { f: "verification_status", t: "enum", r: true, d: "See verification statuses." },
          { f: "last_checked", t: "string · date-time", r: true, d: "ISO 8601 timestamp." },
          { f: "field_provenance", t: "object", r: false, d: "Per-field source_url, verification_status, last_checked and note." },
        ],
        schemaSlug: "security-contacts.schema.json",
        jsonHref: "/api/registrar_security_contacts.json",
        sources: [
          ["registrar_docs", "Published abuse and security pages", "various"],
          ["iana", "ICANN compliance contacts", "icann.org"],
        ],
        records: SECURITY_CONTACTS,
        recordTableHeader: ["registrar_id", "abuse_email", "security_txt", "verification_status"],
        rowRenderer: "security",
      };
    case "agent-capability-signals":
      return {
        fields: AGENT_SIGNALS_SCHEMA,
        schemaSlug: "agent-capability-signals.schema.json",
        jsonHref: "/api/agent_capability_signals.json",
        sources: [
          ["registrar_docs", "Published registrar API documentation", "various"],
          ["submission", "Capability signals submitted by registrars", "github.com/open-domain-data/open-domain-data"],
        ],
        records: AGENT_SIGNALS,
        recordTableHeader: ["registrar_id", "api_available", "scoped_tokens", "dns_api", "webhooks", "verification_status"],
        rowRenderer: "agent",
      };
    case "registrar-landscape":
      return {
        fields: LANDSCAPE_SCHEMA,
        schemaSlug: "registrar-landscape.schema.json",
        jsonHref: "/api/registrar_landscape.json",
        csvHref: "/api/registrar_landscape.csv",
        sources: [
          ["registrar_api_capabilities", "API-surface shares, computed from the API-capabilities dataset", "opendomaindata.org/datasets/registrar-api-capabilities"],
          ["dns_capabilities", "DNSSEC, DNS-API and TTL stats, computed from the DNS-capabilities dataset", "opendomaindata.org/datasets/dns-capabilities"],
          ["agent_capability_signals", "Agent-readiness shares (MCP, audit logs, approval flow), computed from the agent-signals dataset", "opendomaindata.org/datasets/agent-capability-signals"],
          ["rdap_metadata", "RDAP-conformance share, computed from the RDAP-metadata dataset", "opendomaindata.org/datasets/rdap-metadata"],
          ["registrar_security_contacts", "security.txt share, computed from the security-contacts dataset", "opendomaindata.org/datasets/registrar-security-contacts"],
        ],
        records: LANDSCAPE_STATS as unknown[],
        recordTableHeader: ["metric", "value", "percent", "headline", "edition"],
        rowRenderer: "landscape",
      };
    default:
      return null;
  }
}

export function datasetBySlug(slug: string, datasets: Dataset[]) {
  return datasets.find((d) => d.slug === slug) ?? null;
}
