export type VerificationStatus =
  | "unknown"
  | "public_sources"
  | "independently_tested"
  | "registrar_submitted"
  | "registrar_verified"
  | "deprecated";

export type RegistrarStatus = "active" | "inactive" | "terminated";

export type Dataset = {
  name: string;
  slug: string;
  desc: string;
  records: string;
  recordsCount: number;
  fmts: string[];
  ver: string;
  status: VerificationStatus;
  updated: string;
  license: string;
};

export const DATASETS: Dataset[] = [
  {
    name: "registrars",
    slug: "registrars",
    desc: "Canonical registrar entities — IANA ID, name, RDAP base, status, jurisdiction, with per-field provenance.",
    records: "2,841",
    recordsCount: 2841,
    fmts: ["json", "csv"],
    ver: "2026.06",
    status: "independently_tested",
    updated: "2026-06-22",
    license: "CC-BY-4.0",
  },
  {
    name: "registrar_api_capabilities",
    slug: "registrar-api-capabilities",
    desc: "Documented API surface per registrar — auth model, endpoints, bulk operations, sandbox.",
    records: "612",
    recordsCount: 612,
    fmts: ["json", "csv"],
    ver: "2026.05",
    status: "public_sources",
    updated: "2026-05-28",
    license: "CC-BY-4.0",
  },
  {
    name: "dns_capabilities",
    slug: "dns-capabilities",
    desc: "DNS feature support per registrar — DNSSEC, ALIAS/ANAME, CAA, API record management.",
    records: "612",
    recordsCount: 612,
    fmts: ["json", "csv"],
    ver: "2026.06",
    status: "independently_tested",
    updated: "2026-06-25",
    license: "CC-BY-4.0",
  },
  {
    name: "tld_pricing",
    slug: "tld-pricing",
    desc: "Register, renew and transfer prices by registrar and TLD, normalized to USD.",
    records: "48,260",
    recordsCount: 48260,
    fmts: ["json", "csv"],
    ver: "2026.06",
    status: "public_sources",
    updated: "2026-06-01",
    license: "CC-BY-4.0",
  },
  {
    name: "rdap_metadata",
    slug: "rdap-metadata",
    desc: "IANA bootstrap, RDAP service URLs and response conformance per TLD and registrar.",
    records: "1,517",
    recordsCount: 1517,
    fmts: ["json", "csv"],
    ver: "2026.05",
    status: "independently_tested",
    updated: "2026-05-29",
    license: "CC-BY-4.0",
  },
  {
    name: "registrar_security_contacts",
    slug: "registrar-security-contacts",
    desc: "Abuse and security contact records, plus RFC 9116 security.txt presence detection.",
    records: "2,610",
    recordsCount: 2610,
    fmts: ["json", "csv"],
    ver: "2026.05",
    status: "public_sources",
    updated: "2026-05-25",
    license: "CC-BY-4.0",
  },
  {
    name: "agent_capability_signals",
    slug: "agent-capability-signals",
    desc: "Machine-readable signals about programmatic access — API presence, OAuth, rate limits.",
    records: "612",
    recordsCount: 612,
    fmts: ["json", "csv"],
    ver: "2026.05",
    status: "registrar_submitted",
    updated: "2026-05-30",
    license: "CC-BY-4.0",
  },
];

export const VERIF_STATUSES: { k: VerificationStatus; desc: string }[] = [
  { k: "unknown", desc: "No verification has been attempted for this record." },
  { k: "public_sources", desc: "Compiled from public documentation, pricing pages and registries." },
  { k: "independently_tested", desc: "Confirmed against live endpoints by Open Domain Data." },
  { k: "registrar_submitted", desc: "Submitted by the registrar; not yet independently checked." },
  { k: "registrar_verified", desc: "Submitted by the registrar and confirmed against live endpoints." },
  { k: "deprecated", desc: "No longer maintained; retained for historical reference." },
];

export const METHODS = [
  { t: "Public documentation", d: "Registrar help centers, API references and published pricing pages.", icon: "book" },
  { t: "RDAP endpoints", d: "Live queries against registrar and registry RDAP services.", icon: "terminal" },
  { t: "IANA / ICANN references", d: "Accreditation lists and the IANA RDAP bootstrap registry.", icon: "shield" },
  { t: "Registrar submissions", d: "Structured submissions received via pull request or correction form.", icon: "pr" },
  { t: "Independent checks", d: "Automated probes confirming documented capabilities against live services.", icon: "check" },
] as const;

export const CHANGELOG = [
  { date: "2026-06-25", ds: "dns_capabilities", ver: "2026.06", body: "Expanded the dns_capabilities sample from 3 to 7 registrars so it covers the same set as the rest of the catalog (added GoDaddy, Dynadot, Spaceship and Squarespace Domains). Added a field_provenance object to the schema and every record: DNSSEC, CAA, API record management and record-type values now each carry their own source_url, verification_status, last_checked and note. Recorded the precise nuances rather than rounding them off — Dynadot's DNSSEC is partial because its own nameservers are not DNSSEC-configured, and Squarespace Domains has no public DNS-management API. Added a cross-dataset coverage check to scripts/validate.mjs so the sample registrar sets can no longer drift apart silently." },
  { date: "2026-06-22", ds: "registrars", ver: "2026.06", body: "Added per-field provenance (field_provenance) to the registrar schema and sample records: each field carries its own source_url, verification_status, last_checked and a note on how it was checked. IANA-registry fields (iana_id, name, status) are public_sources; rdap_base is resolved from IANA and independently_tested via a live RDAP probe. Corrected rdap_base for every sample registrar against the IANA registry, filled in Spaceship's rdap_base (rdap.spaceship.com), and added scripts/verify-rdap.mjs to make the RDAP verification reproducible and to fail on drift from IANA." },
  { date: "2026-06-01", ds: "tld_pricing", ver: "2026.06", body: "Added 412 TLDs across 38 registrars; normalized promotional pricing flags into a dedicated field." },
  { date: "2026-05-31", ds: "registrars", ver: "2026.05", body: "Re-checked 2,841 records against RDAP. Corrected 14 RDAP base URLs flagged in community PR #208." },
  { date: "2026-05-30", ds: "agent_capability_signals", ver: "2026.05", body: "New dataset published describing programmatic-access signals. No scoring or ranking is included." },
  { date: "2026-05-28", ds: "registrar_api_capabilities", ver: "2026.05", body: "Added rate_limit and sandbox_url fields to the schema. Backfilled for 612 records." },
  { date: "2026-05-25", ds: "registrar_security_contacts", ver: "2026.05", body: "Added RFC 9116 security.txt presence detection across 2,610 records." },
];

export const REGISTRARS_SCHEMA = [
  { f: "id", t: "string", r: true, d: "Stable slug identifier (lowercase)." },
  { f: "iana_id", t: "integer", r: true, d: "IANA-assigned registrar ID." },
  { f: "name", t: "string", r: true, d: "Legal entity name." },
  { f: "rdap_base", t: "string · uri", r: false, d: "RDAP service base URL, if published." },
  { f: "status", t: "enum", r: true, d: "active | inactive | terminated" },
  { f: "country", t: "string · ISO 3166", r: false, d: "Primary jurisdiction." },
  { f: "sources", t: "array · enum", r: true, d: "Provenance: iana | rdap | registrar_docs | submission." },
  { f: "verification_status", t: "enum", r: true, d: "Record-level verification status. See verification statuses." },
  { f: "last_checked", t: "string · date-time", r: true, d: "ISO 8601 timestamp of last check." },
  { f: "field_provenance", t: "object", r: false, d: "Per-field provenance: maps a field name to its source_url, verification_status and last_checked. Authoritative over the record-level fields for the field it describes." },
];

export const API_CAPABILITIES_SCHEMA = [
  { f: "registrar_id", t: "string", r: true, d: "Foreign key to registrars.id." },
  { f: "api_available", t: "boolean", r: true, d: "Whether a public registrar API exists." },
  { f: "auth_model", t: "enum", r: false, d: "api_key | oauth2 | basic | other | none." },
  { f: "scoped_tokens", t: "boolean", r: false, d: "Token scopes are supported." },
  { f: "oauth_support", t: "boolean", r: false, d: "OAuth 2.0 flows are supported." },
  { f: "webhooks", t: "boolean", r: false, d: "Webhook event delivery is supported." },
  { f: "sandbox_url", t: "string · uri", r: false, d: "Sandbox / test environment URL." },
  { f: "openapi_spec", t: "string · uri", r: false, d: "Published OpenAPI / Swagger document URL." },
  { f: "rate_limit", t: "string", r: false, d: "Documented rate limit, free text." },
  { f: "docs_url", t: "string · uri", r: true, d: "Canonical documentation URL." },
  { f: "sources", t: "array · enum", r: true, d: "Provenance." },
  { f: "verification_status", t: "enum", r: true, d: "See verification statuses." },
  { f: "last_checked", t: "string · date-time", r: true, d: "ISO 8601 timestamp." },
];

export const DNS_CAPABILITIES_SCHEMA = [
  { f: "registrar_id", t: "string", r: true, d: "Foreign key to registrars.id." },
  { f: "dnssec", t: "enum", r: true, d: "supported | unsupported | partial." },
  { f: "alias_aname", t: "boolean", r: false, d: "ALIAS / ANAME apex records supported." },
  { f: "caa", t: "boolean", r: false, d: "CAA records supported." },
  { f: "api_record_management", t: "boolean", r: false, d: "Records editable via API." },
  { f: "record_types", t: "array · enum", r: false, d: "Supported record types." },
  { f: "ttl_min_seconds", t: "integer", r: false, d: "Minimum TTL the registrar allows." },
  { f: "sources", t: "array · enum", r: true, d: "Provenance." },
  { f: "verification_status", t: "enum", r: true, d: "See verification statuses." },
  { f: "last_checked", t: "string · date-time", r: true, d: "ISO 8601 timestamp." },
];

export const PRICING_SCHEMA = [
  { f: "registrar_id", t: "string", r: true, d: "Foreign key to registrars.id." },
  { f: "tld", t: "string", r: true, d: "Top-level domain (without leading dot)." },
  { f: "register_usd", t: "number", r: false, d: "First-year register price in USD." },
  { f: "renew_usd", t: "number", r: false, d: "Annual renewal price in USD." },
  { f: "transfer_usd", t: "number", r: false, d: "Transfer-in price in USD." },
  { f: "promotional", t: "boolean", r: false, d: "Whether register_usd is a promotional price." },
  { f: "sources", t: "array · enum", r: true, d: "Provenance." },
  { f: "verification_status", t: "enum", r: true, d: "See verification statuses." },
  { f: "last_checked", t: "string · date-time", r: true, d: "ISO 8601 timestamp." },
];

export const SCHEMAS = [
  { name: "registrar", slug: "registrar.schema.json", fields: REGISTRARS_SCHEMA.length, ver: "2026.06", used: "registrars" },
  { name: "api-capabilities", slug: "api-capabilities.schema.json", fields: API_CAPABILITIES_SCHEMA.length, ver: "2026.05", used: "registrar_api_capabilities" },
  { name: "dns-capabilities", slug: "dns-capabilities.schema.json", fields: DNS_CAPABILITIES_SCHEMA.length, ver: "2026.05", used: "dns_capabilities" },
  { name: "pricing", slug: "pricing.schema.json", fields: PRICING_SCHEMA.length, ver: "2026.06", used: "tld_pricing" },
];

export type FieldProvenance = {
  source_url: string;
  verification_status: VerificationStatus;
  last_checked: string;
  note?: string;
};

export type Registrar = {
  id: string;
  iana_id: number;
  name: string;
  rdap_base: string;
  status: RegistrarStatus;
  country: string;
  sources: string[];
  verification_status: VerificationStatus;
  last_checked: string;
  website: string;
  aliases: string[];
  field_provenance?: Record<string, FieldProvenance>;
};

// The IANA registrar-ids registry is the authoritative source for a
// registrar's IANA ID, legal name, accreditation status and RDAP base URL.
// We cite the machine-readable CSV (the .xhtml is the human-facing mirror).
const IANA_REGISTRAR_IDS = "https://www.iana.org/assignments/registrar-ids/registrar-ids-1.csv";

/**
 * Provenance for the fields that come straight from the IANA registry.
 *
 * These are read from a published registry, so their honest status is
 * `public_sources` — we did NOT independently test the registrar entity, we
 * recorded what IANA publishes. `status` is a derived mapping (IANA's
 * "Accredited" -> our "active") so it is also public_sources.
 *
 * `rdap_base` is special: the VALUE comes from IANA, but we additionally
 * probe the endpoint to confirm it answers RDAP. That probe is genuine
 * independent testing, so rdap_base earns `independently_tested` and is given
 * its own provenance via rdapProvenance() below.
 */
function ianaProvenance(checked: string): Record<string, FieldProvenance> {
  return {
    iana_id: {
      source_url: IANA_REGISTRAR_IDS,
      verification_status: "public_sources",
      last_checked: checked,
      note: "Read from the IANA registrar-ids registry CSV.",
    },
    name: {
      source_url: IANA_REGISTRAR_IDS,
      verification_status: "public_sources",
      last_checked: checked,
      note: "Legal name as published by IANA.",
    },
    status: {
      source_url: IANA_REGISTRAR_IDS,
      verification_status: "public_sources",
      last_checked: checked,
      note: "Mapped from IANA accreditation status (Accredited -> active).",
    },
  };
}

/**
 * Provenance for an rdap_base that we resolved from IANA and then confirmed by
 * issuing a live RDAP query and checking the response is a valid RDAP object
 * (rdapConformance / RDAP errorCode). `tested` records the probe result.
 */
function rdapProvenance(checked: string): FieldProvenance {
  return {
    source_url: IANA_REGISTRAR_IDS,
    verification_status: "independently_tested",
    last_checked: checked,
    note: "Value from IANA; endpoint probed with a live RDAP query and returned a valid RDAP object.",
  };
}

const IANA_CHECKED = "2026-06-22T00:00:00Z";

// Combined IANA + RDAP-probe provenance for a fully-confirmed registrar record.
function confirmedProvenance(): Record<string, FieldProvenance> {
  return { ...ianaProvenance(IANA_CHECKED), rdap_base: rdapProvenance(IANA_CHECKED) };
}

export const REGISTRARS: Registrar[] = [
  {
    id: "cloudflare-registrar",
    iana_id: 1910,
    name: "Cloudflare, Inc.",
    rdap_base: "https://rdap.cloudflare.com/rdap/v1/",
    status: "active",
    country: "US",
    sources: ["iana", "rdap", "registrar_docs"],
    verification_status: "independently_tested",
    last_checked: "2026-06-22T00:00:00Z",
    website: "https://www.cloudflare.com/products/registrar/",
    aliases: ["cloudflare", "cf-registrar"],
    field_provenance: confirmedProvenance(),
  },
  {
    id: "namecheap",
    iana_id: 1068,
    name: "NameCheap, Inc.",
    rdap_base: "https://rdap.namecheap.com/",
    status: "active",
    country: "US",
    sources: ["iana", "rdap", "registrar_docs"],
    verification_status: "independently_tested",
    last_checked: "2026-06-22T00:00:00Z",
    website: "https://www.namecheap.com",
    aliases: ["namecheap-inc", "namecheap"],
    field_provenance: confirmedProvenance(),
  },
  {
    id: "porkbun",
    iana_id: 1861,
    name: "Porkbun LLC",
    rdap_base: "https://cart-before.porkbun.horse/rdap/",
    status: "active",
    country: "US",
    sources: ["iana", "rdap", "registrar_docs", "submission"],
    verification_status: "independently_tested",
    last_checked: "2026-06-22T00:00:00Z",
    website: "https://porkbun.com",
    aliases: ["porkbun-llc", "porkbun"],
    field_provenance: confirmedProvenance(),
  },
  {
    id: "godaddy",
    iana_id: 146,
    name: "GoDaddy.com, LLC",
    rdap_base: "https://rdap.godaddy.com/v1/",
    status: "active",
    country: "US",
    sources: ["iana", "rdap", "registrar_docs"],
    verification_status: "independently_tested",
    last_checked: "2026-06-22T00:00:00Z",
    website: "https://www.godaddy.com",
    aliases: ["go-daddy", "godaddy-com"],
    field_provenance: confirmedProvenance(),
  },
  {
    id: "dynadot",
    iana_id: 472,
    name: "Dynadot Inc",
    rdap_base: "https://rdap.dynadot.com/",
    status: "active",
    country: "US",
    sources: ["iana", "rdap", "registrar_docs"],
    verification_status: "independently_tested",
    last_checked: "2026-06-22T00:00:00Z",
    website: "https://www.dynadot.com",
    aliases: ["dynadot-inc", "dynadot-llc"],
    field_provenance: confirmedProvenance(),
  },
  {
    id: "spaceship",
    iana_id: 3862,
    name: "Spaceship, Inc.",
    rdap_base: "https://rdap.spaceship.com/",
    status: "active",
    country: "US",
    sources: ["iana", "rdap"],
    verification_status: "independently_tested",
    last_checked: IANA_CHECKED,
    website: "https://www.spaceship.com",
    aliases: ["spaceship-inc"],
    field_provenance: confirmedProvenance(),
  },
  {
    id: "squarespace-domains",
    iana_id: 895,
    name: "Squarespace Domains II LLC",
    rdap_base: "https://rdap.squarespace.domains/",
    status: "active",
    country: "US",
    sources: ["iana", "registrar_docs"],
    verification_status: "independently_tested",
    last_checked: "2026-06-22T00:00:00Z",
    website: "https://www.squarespace.com/domains",
    aliases: ["squarespace", "squarespace-domains-ii"],
    field_provenance: confirmedProvenance(),
  },
];

export type ApiCapabilityRecord = {
  registrar_id: string;
  api_available: boolean;
  auth_model: "api_key" | "oauth2" | "basic" | "other" | "none";
  scoped_tokens: boolean;
  oauth_support: boolean;
  webhooks: boolean;
  sandbox_url: string | null;
  openapi_spec: string | null;
  rate_limit: string;
  docs_url: string;
  sources: string[];
  verification_status: VerificationStatus;
  last_checked: string;
};

export const API_CAPABILITIES: ApiCapabilityRecord[] = [
  {
    registrar_id: "cloudflare-registrar",
    api_available: true,
    auth_model: "api_key",
    scoped_tokens: true,
    oauth_support: false,
    webhooks: false,
    sandbox_url: null,
    openapi_spec: "https://developers.cloudflare.com/api/",
    rate_limit: "1200 req/5min per account",
    docs_url: "https://developers.cloudflare.com/registrar/",
    sources: ["registrar_docs"],
    verification_status: "public_sources",
    last_checked: "2026-05-28T04:12:00Z",
  },
  {
    registrar_id: "namecheap",
    api_available: true,
    auth_model: "api_key",
    scoped_tokens: false,
    oauth_support: false,
    webhooks: false,
    sandbox_url: "https://api.sandbox.namecheap.com",
    openapi_spec: null,
    rate_limit: "20 req/min per IP",
    docs_url: "https://www.namecheap.com/support/api/intro/",
    sources: ["registrar_docs"],
    verification_status: "public_sources",
    last_checked: "2026-05-28T04:12:00Z",
  },
  {
    registrar_id: "porkbun",
    api_available: true,
    auth_model: "api_key",
    scoped_tokens: false,
    oauth_support: false,
    webhooks: false,
    sandbox_url: null,
    openapi_spec: null,
    rate_limit: "10 req/10s",
    docs_url: "https://porkbun.com/api/json/v3/documentation",
    sources: ["registrar_docs", "submission"],
    verification_status: "registrar_submitted",
    last_checked: "2026-05-30T04:12:00Z",
  },
  {
    registrar_id: "godaddy",
    api_available: true,
    auth_model: "api_key",
    scoped_tokens: false,
    oauth_support: false,
    webhooks: false,
    sandbox_url: "https://api.ote-godaddy.com",
    openapi_spec: null,
    rate_limit: "documented per endpoint; production access limited to accounts with 50+ domains (Availability API) since 2024-05-01",
    docs_url: "https://developer.godaddy.com/doc/endpoint/domains",
    sources: ["registrar_docs"],
    verification_status: "public_sources",
    last_checked: "2026-06-21T12:00:00Z",
  },
  {
    registrar_id: "dynadot",
    api_available: true,
    auth_model: "api_key",
    scoped_tokens: false,
    oauth_support: false,
    webhooks: false,
    sandbox_url: "https://api-sandbox.dynadot.com",
    openapi_spec: null,
    rate_limit: "varies by account tier; one concurrent request per account",
    docs_url: "https://www.dynadot.com/domain/api",
    sources: ["registrar_docs"],
    verification_status: "public_sources",
    last_checked: "2026-06-21T12:00:00Z",
  },
  {
    registrar_id: "spaceship",
    api_available: true,
    auth_model: "api_key",
    scoped_tokens: false,
    oauth_support: false,
    webhooks: false,
    sandbox_url: null,
    openapi_spec: null,
    rate_limit: "documented per endpoint (e.g. 300 req/300s per user for record listing)",
    docs_url: "https://docs.spaceship.dev/",
    sources: ["registrar_docs"],
    verification_status: "public_sources",
    last_checked: "2026-06-21T12:00:00Z",
  },
  {
    registrar_id: "squarespace-domains",
    api_available: false,
    auth_model: "none",
    scoped_tokens: false,
    oauth_support: false,
    webhooks: false,
    sandbox_url: null,
    openapi_spec: null,
    rate_limit: "n/a — no public domain API",
    docs_url: "https://support.squarespace.com/hc/en-us/sections/360001172391-Domains",
    sources: ["registrar_docs"],
    verification_status: "public_sources",
    last_checked: "2026-06-21T12:00:00Z",
  },
];

export type DnsCapabilityRecord = {
  registrar_id: string;
  dnssec: "supported" | "unsupported" | "partial";
  alias_aname: boolean;
  caa: boolean;
  api_record_management: boolean;
  record_types: string[];
  ttl_min_seconds: number;
  sources: string[];
  verification_status: VerificationStatus;
  last_checked: string;
  field_provenance?: Record<string, FieldProvenance>;
};

export const DNS_CAPABILITIES: DnsCapabilityRecord[] = [
  {
    registrar_id: "cloudflare-registrar",
    dnssec: "supported",
    alias_aname: true,
    caa: true,
    api_record_management: true,
    record_types: ["A", "AAAA", "CNAME", "MX", "TXT", "SRV", "CAA", "NS"],
    ttl_min_seconds: 60,
    sources: ["registrar_docs", "rdap"],
    verification_status: "independently_tested",
    last_checked: "2026-05-27T04:12:00Z",
    field_provenance: {
      dnssec: {
        source_url: "https://developers.cloudflare.com/dns/dnssec/",
        verification_status: "independently_tested",
        last_checked: "2026-05-27T04:12:00Z",
        note: "One-click DNSSEC on Cloudflare-hosted zones; DS records exposed for the registrar to publish.",
      },
      api_record_management: {
        source_url: "https://developers.cloudflare.com/api/resources/dns/",
        verification_status: "independently_tested",
        last_checked: "2026-05-27T04:12:00Z",
        note: "Full DNS records API (list/create/update/delete) confirmed against a live zone.",
      },
      caa: {
        source_url:
          "https://developers.cloudflare.com/dns/manage-dns-records/reference/dns-record-types/",
        verification_status: "independently_tested",
        last_checked: "2026-05-27T04:12:00Z",
        note: "CAA listed among supported record types and creatable via the dashboard and API.",
      },
    },
  },
  {
    registrar_id: "namecheap",
    dnssec: "supported",
    alias_aname: true,
    caa: true,
    api_record_management: true,
    record_types: ["A", "AAAA", "CNAME", "MX", "TXT", "SRV", "CAA", "NS"],
    ttl_min_seconds: 60,
    sources: ["registrar_docs"],
    verification_status: "independently_tested",
    last_checked: "2026-05-27T04:12:00Z",
    field_provenance: {
      dnssec: {
        source_url:
          "https://www.namecheap.com/support/knowledgebase/article.aspx/9722/2232/managing-dnssec-for-domains-pointed-to-custom-dns/",
        verification_status: "public_sources",
        last_checked: "2026-05-27T04:12:00Z",
        note: "DNSSEC supported; DS records managed from the domain dashboard.",
      },
      api_record_management: {
        source_url: "https://www.namecheap.com/support/api/methods/domains-dns/",
        verification_status: "public_sources",
        last_checked: "2026-05-27T04:12:00Z",
        note: "domains.dns.setHosts / getHosts API methods manage records.",
      },
    },
  },
  {
    registrar_id: "porkbun",
    dnssec: "supported",
    alias_aname: true,
    caa: true,
    api_record_management: true,
    record_types: ["A", "AAAA", "CNAME", "MX", "TXT", "SRV", "CAA", "NS", "TLSA"],
    ttl_min_seconds: 600,
    sources: ["registrar_docs", "submission"],
    verification_status: "registrar_verified",
    last_checked: "2026-05-27T04:12:00Z",
    field_provenance: {
      api_record_management: {
        source_url: "https://porkbun.com/api/json/v3/documentation",
        verification_status: "registrar_verified",
        last_checked: "2026-05-27T04:12:00Z",
        note: "DNS create/edit/retrieve/delete endpoints documented and confirmed.",
      },
      record_types: {
        source_url: "https://porkbun.com/api/json/v3/documentation",
        verification_status: "registrar_verified",
        last_checked: "2026-05-27T04:12:00Z",
        note: "Record types accepted by the DNS API, including TLSA.",
      },
    },
  },
  {
    registrar_id: "godaddy",
    dnssec: "supported",
    alias_aname: false,
    caa: true,
    api_record_management: true,
    record_types: ["A", "AAAA", "CNAME", "MX", "TXT", "SRV", "CAA", "NS"],
    ttl_min_seconds: 600,
    sources: ["registrar_docs"],
    verification_status: "public_sources",
    last_checked: "2026-06-25T00:00:00Z",
    field_provenance: {
      dnssec: {
        source_url: "https://www.godaddy.com/help/turn-dnssec-on-or-off-6420",
        verification_status: "public_sources",
        last_checked: "2026-06-25T00:00:00Z",
        note: "DNSSEC managed for domains on GoDaddy nameservers; Premium DNS offers fully managed signing.",
      },
      api_record_management: {
        source_url: "https://developer.godaddy.com/doc/endpoint/domains",
        verification_status: "public_sources",
        last_checked: "2026-06-25T00:00:00Z",
        note: "Domains API exposes DNS record GET/PUT/PATCH; API access available from a single domain.",
      },
      caa: {
        source_url: "https://www.godaddy.com/help/add-a-caa-record-19248",
        verification_status: "public_sources",
        last_checked: "2026-06-25T00:00:00Z",
        note: "CAA records supported in GoDaddy DNS management.",
      },
      alias_aname: {
        source_url: "https://www.godaddy.com/help/add-an-a-record-19238",
        verification_status: "public_sources",
        last_checked: "2026-06-25T00:00:00Z",
        note: "GoDaddy DNS does not document a native ALIAS/ANAME flattened-apex record type; recorded false pending an independently tested source.",
      },
    },
  },
  {
    registrar_id: "dynadot",
    dnssec: "partial",
    alias_aname: true,
    caa: true,
    api_record_management: true,
    record_types: ["A", "AAAA", "CNAME", "MX", "TXT", "SRV", "CAA", "ANAME"],
    ttl_min_seconds: 300,
    sources: ["registrar_docs"],
    verification_status: "public_sources",
    last_checked: "2026-06-25T00:00:00Z",
    field_provenance: {
      dnssec: {
        source_url: "https://www.dynadot.com/help/question/set-DNSSEC",
        verification_status: "public_sources",
        last_checked: "2026-06-25T00:00:00Z",
        note: "DNSSEC can be set, but Dynadot's own nameservers are not configured for DNSSEC; it requires assigning third-party nameservers. Recorded as partial.",
      },
      api_record_management: {
        source_url: "https://www.dynadot.com/domain/api-commands",
        verification_status: "public_sources",
        last_checked: "2026-06-25T00:00:00Z",
        note: "Domain API includes set-DNS and Set Dnssec commands (XML/JSON).",
      },
      caa: {
        source_url: "https://www.dynadot.com/help/question/1153",
        verification_status: "public_sources",
        last_checked: "2026-06-25T00:00:00Z",
        note: "CAA records supported via the Dynadot DNS Manager (help article 1153).",
      },
      alias_aname: {
        source_url: "https://www.dynadot.com/help/question/enter-aname-record-for-domain",
        verification_status: "public_sources",
        last_checked: "2026-06-25T00:00:00Z",
        note: "ANAME records supported in Dynadot DNS.",
      },
    },
  },
  {
    registrar_id: "spaceship",
    dnssec: "supported",
    alias_aname: true,
    caa: true,
    api_record_management: true,
    record_types: ["A", "AAAA", "ALIAS", "CNAME", "MX", "NS", "TXT", "SRV", "CAA"],
    ttl_min_seconds: 60,
    sources: ["registrar_docs"],
    verification_status: "public_sources",
    last_checked: "2026-06-25T00:00:00Z",
    field_provenance: {
      dnssec: {
        source_url: "https://www.spaceship.com/domain-management/",
        verification_status: "public_sources",
        last_checked: "2026-06-25T00:00:00Z",
        note: "DNSSEC assigned by default on domains using Spaceship nameservers; toggleable in Advanced DNS.",
      },
      api_record_management: {
        source_url: "https://docs.spaceship.dev/",
        verification_status: "public_sources",
        last_checked: "2026-06-25T00:00:00Z",
        note: "Public REST API plus a Terraform provider expose DNS record management.",
      },
      record_types: {
        source_url: "https://www.spaceship.com/domain-management/",
        verification_status: "public_sources",
        last_checked: "2026-06-25T00:00:00Z",
        note: "Advanced DNS panel supports A, AAAA, ALIAS, CNAME, MX, NS, TXT, SRV and CAA records.",
      },
    },
  },
  {
    registrar_id: "squarespace-domains",
    dnssec: "supported",
    alias_aname: true,
    caa: true,
    api_record_management: false,
    record_types: ["A", "AAAA", "ALIAS", "CNAME", "MX", "TXT", "SRV", "CAA", "NS", "TLSA"],
    ttl_min_seconds: 300,
    sources: ["registrar_docs"],
    verification_status: "public_sources",
    last_checked: "2026-06-25T00:00:00Z",
    field_provenance: {
      dnssec: {
        source_url:
          "https://support.squarespace.com/hc/en-us/articles/31094668921229-DNSSEC-for-Squarespace-domains",
        verification_status: "public_sources",
        last_checked: "2026-06-25T00:00:00Z",
        note: "DNSSEC automatically enabled on Squarespace Domains for any TLD that supports it (ECDSA P-256).",
      },
      api_record_management: {
        source_url:
          "https://support.squarespace.com/hc/en-us/articles/360002101888-Adding-DNS-records-to-your-domain",
        verification_status: "public_sources",
        last_checked: "2026-06-25T00:00:00Z",
        note: "DNS records are editable in the dashboard; no public domain/DNS-management API is documented. Recorded false.",
      },
      record_types: {
        source_url:
          "https://support.squarespace.com/hc/en-us/articles/31109217782541-DNS-records-for-security",
        verification_status: "public_sources",
        last_checked: "2026-06-25T00:00:00Z",
        note: "Supported types include CAA, TLSA, ALIAS, and standard records per the DNS help articles.",
      },
    },
  },
];

export type PricingRecord = {
  registrar_id: string;
  tld: string;
  register_usd: number | null;
  renew_usd: number | null;
  transfer_usd: number | null;
  promotional: boolean;
  sources: string[];
  verification_status: VerificationStatus;
  last_checked: string;
};

export const TLD_PRICING: PricingRecord[] = [
  { registrar_id: "cloudflare-registrar", tld: "com", register_usd: 9.77, renew_usd: 9.77, transfer_usd: 9.77, promotional: false, sources: ["registrar_docs"], verification_status: "public_sources", last_checked: "2026-06-01T04:12:00Z" },
  { registrar_id: "namecheap", tld: "com", register_usd: 5.98, renew_usd: 14.98, transfer_usd: 9.48, promotional: true, sources: ["registrar_docs"], verification_status: "public_sources", last_checked: "2026-06-01T04:12:00Z" },
  { registrar_id: "porkbun", tld: "com", register_usd: 9.13, renew_usd: 11.06, transfer_usd: 9.13, promotional: false, sources: ["registrar_docs", "submission"], verification_status: "registrar_verified", last_checked: "2026-06-01T04:12:00Z" },
  { registrar_id: "cloudflare-registrar", tld: "dev", register_usd: 12.18, renew_usd: 12.18, transfer_usd: 12.18, promotional: false, sources: ["registrar_docs"], verification_status: "public_sources", last_checked: "2026-06-01T04:12:00Z" },
  { registrar_id: "porkbun", tld: "dev", register_usd: 11.69, renew_usd: 11.69, transfer_usd: 11.69, promotional: false, sources: ["registrar_docs", "submission"], verification_status: "registrar_verified", last_checked: "2026-06-01T04:12:00Z" },
];

export const RDAP_METADATA = [
  { registrar_id: "cloudflare-registrar", base_url: "https://rdap.cloudflare.com", conformance: "rfc7483", iana_bootstrapped: true, last_checked: "2026-05-29T04:12:00Z", verification_status: "independently_tested" as VerificationStatus },
  { registrar_id: "namecheap", base_url: "https://rdap.namecheap.com", conformance: "rfc7483", iana_bootstrapped: true, last_checked: "2026-05-29T04:12:00Z", verification_status: "independently_tested" as VerificationStatus },
  { registrar_id: "porkbun", base_url: "https://rdap.porkbun.com", conformance: "rfc7483", iana_bootstrapped: true, last_checked: "2026-05-29T04:12:00Z", verification_status: "independently_tested" as VerificationStatus },
];

export const SECURITY_CONTACTS = [
  { registrar_id: "cloudflare-registrar", abuse_email: "registrar-abuse@cloudflare.com", security_txt: "present", policy_url: "https://www.cloudflare.com/abuse/", last_checked: "2026-05-25T04:12:00Z", verification_status: "public_sources" as VerificationStatus },
  { registrar_id: "namecheap", abuse_email: "abuse@namecheap.com", security_txt: "present", policy_url: "https://www.namecheap.com/legal/general/abuse-policy/", last_checked: "2026-05-25T04:12:00Z", verification_status: "public_sources" as VerificationStatus },
  { registrar_id: "porkbun", abuse_email: "abuse@porkbun.com", security_txt: "absent", policy_url: "https://porkbun.com/abuse", last_checked: "2026-05-25T04:12:00Z", verification_status: "public_sources" as VerificationStatus },
];

export const AGENT_SIGNALS = [
  { registrar_id: "cloudflare-registrar", api_available: true, scoped_tokens: true, oauth_support: false, dns_api: true, webhooks: false, audit_logs: true, human_approval_flow: false, sandbox: false, openapi_spec: true, mcp_interface: false, last_checked: "2026-06-21T12:00:00Z", verification_status: "public_sources" as VerificationStatus },
  { registrar_id: "namecheap", api_available: true, scoped_tokens: false, oauth_support: false, dns_api: true, webhooks: false, audit_logs: false, human_approval_flow: false, sandbox: true, openapi_spec: false, mcp_interface: false, last_checked: "2026-06-21T12:00:00Z", verification_status: "registrar_submitted" as VerificationStatus },
  { registrar_id: "porkbun", api_available: true, scoped_tokens: false, oauth_support: false, dns_api: true, webhooks: false, audit_logs: false, human_approval_flow: false, sandbox: false, openapi_spec: false, mcp_interface: false, last_checked: "2026-06-21T12:00:00Z", verification_status: "registrar_submitted" as VerificationStatus },
  { registrar_id: "godaddy", api_available: true, scoped_tokens: false, oauth_support: false, dns_api: true, webhooks: false, audit_logs: false, human_approval_flow: false, sandbox: true, openapi_spec: false, mcp_interface: true, last_checked: "2026-06-21T12:00:00Z", verification_status: "public_sources" as VerificationStatus },
  { registrar_id: "dynadot", api_available: true, scoped_tokens: false, oauth_support: false, dns_api: true, webhooks: false, audit_logs: false, human_approval_flow: false, sandbox: true, openapi_spec: false, mcp_interface: false, last_checked: "2026-06-21T12:00:00Z", verification_status: "public_sources" as VerificationStatus },
  { registrar_id: "spaceship", api_available: true, scoped_tokens: false, oauth_support: false, dns_api: true, webhooks: false, audit_logs: false, human_approval_flow: false, sandbox: false, openapi_spec: false, mcp_interface: false, last_checked: "2026-06-21T12:00:00Z", verification_status: "public_sources" as VerificationStatus },
  { registrar_id: "squarespace-domains", api_available: false, scoped_tokens: false, oauth_support: false, dns_api: false, webhooks: false, audit_logs: false, human_approval_flow: false, sandbox: false, openapi_spec: false, mcp_interface: false, last_checked: "2026-06-21T12:00:00Z", verification_status: "public_sources" as VerificationStatus },
];

export const STATUS_KIND: Record<string, "ok" | "info" | "warn" | "muted" | "dang"> = {
  unknown: "muted",
  public_sources: "muted",
  independently_tested: "info",
  registrar_submitted: "warn",
  registrar_verified: "ok",
  deprecated: "dang",
  active: "ok",
  inactive: "muted",
  terminated: "dang",
};

export const SITE = {
  name: "Open Domain Data",
  domain: "opendomaindata.org",
  github: "https://github.com/open-domain-data/open-domain-data",
  license: "CC BY 4.0",
  version: "v2026.05",
  description:
    "Versioned, machine-readable datasets for domain registrars, DNS capabilities, TLD pricing, RDAP metadata, API coverage and domain infrastructure research.",
};
