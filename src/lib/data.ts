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
    ver: "2026.05",
    status: "independently_tested",
    updated: "2026-05-27",
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
  { date: "2026-06-22", ds: "registrars", ver: "2026.06", body: "Added per-field provenance (field_provenance) to the registrar schema and sample records: each field can now carry its own source_url, verification_status and last_checked. Corrected and filled in rdap_base for the sample registrars against the IANA registrar-ids registry (Porkbun's bootstrap base is cart-before.porkbun.horse, not rdap.porkbun.com; added IANA RDAP bases for GoDaddy, Dynadot and Squarespace Domains)." },
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

const IANA_REGISTRAR_IDS = "https://www.iana.org/assignments/registrar-ids/registrar-ids.xhtml";

function ianaProvenance(checked: string): Record<string, FieldProvenance> {
  const p: FieldProvenance = {
    source_url: IANA_REGISTRAR_IDS,
    verification_status: "independently_tested",
    last_checked: checked,
  };
  return { iana_id: p, name: p, rdap_base: p, status: p };
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
    field_provenance: ianaProvenance("2026-06-22T00:00:00Z"),
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
    field_provenance: ianaProvenance("2026-06-22T00:00:00Z"),
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
    field_provenance: ianaProvenance("2026-06-22T00:00:00Z"),
  },
  {
    id: "godaddy",
    iana_id: 146,
    name: "GoDaddy.com, LLC",
    rdap_base: "https://rdap.godaddy.com/v1/",
    status: "active",
    country: "US",
    sources: ["iana", "registrar_docs"],
    verification_status: "independently_tested",
    last_checked: "2026-06-22T00:00:00Z",
    website: "https://www.godaddy.com",
    aliases: ["go-daddy", "godaddy-com"],
    field_provenance: ianaProvenance("2026-06-22T00:00:00Z"),
  },
  {
    id: "dynadot",
    iana_id: 472,
    name: "Dynadot Inc",
    rdap_base: "https://rdap.dynadot.com/",
    status: "active",
    country: "US",
    sources: ["iana", "registrar_docs"],
    verification_status: "independently_tested",
    last_checked: "2026-06-22T00:00:00Z",
    website: "https://www.dynadot.com",
    aliases: ["dynadot-inc", "dynadot-llc"],
    field_provenance: ianaProvenance("2026-06-22T00:00:00Z"),
  },
  {
    id: "spaceship",
    iana_id: 3862,
    name: "Spaceship, Inc.",
    rdap_base: "",
    status: "active",
    country: "US",
    sources: ["iana"],
    verification_status: "public_sources",
    last_checked: "2026-06-21T12:00:00Z",
    website: "https://www.spaceship.com",
    aliases: ["spaceship-inc"],
    field_provenance: {
      iana_id: { source_url: IANA_REGISTRAR_IDS, verification_status: "public_sources", last_checked: "2026-06-21T12:00:00Z" },
      name: { source_url: "https://www.spaceship.com", verification_status: "public_sources", last_checked: "2026-06-21T12:00:00Z" },
    },
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
    field_provenance: ianaProvenance("2026-06-22T00:00:00Z"),
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
