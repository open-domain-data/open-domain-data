// Coverage matrix.
//
// Which registrars Open Domain Data currently describes in which per-registrar
// dataset. Each cell states one fact: whether a dataset holds a record for a
// registrar. It is not a quality signal and not a ranking — a filled cell means
// "this dataset has data for this registrar," nothing more.
//
// This is the transpose of the datasets view: /datasets tells you how many
// records a dataset has; this tells you, per registrar, which datasets include
// it. It makes coverage gaps legible — e.g. a registrar present in the API and
// DNS datasets but not yet in pricing — so expansion is visible rather than
// silent.
//
// Built at build time from the canonical /data JSON (the same files
// scripts/check-integrity.mjs and scripts/validate.mjs read), so it can never
// drift from what is published: add a registrar to a dataset and its cell fills
// in here automatically; the numbers below are always the live counts.

import registrars from "../../data/registrars.json";
import apiCapabilities from "../../data/registrar_api_capabilities.json";
import dnsCapabilities from "../../data/dns_capabilities.json";
import agentSignals from "../../data/agent_capability_signals.json";
import rdapMetadata from "../../data/rdap_metadata.json";
import securityContacts from "../../data/registrar_security_contacts.json";
import tldPricing from "../../data/tld_pricing.json";

type RawRecord = { registrar_id?: string; id?: string };
type RawDataset = { version?: string; records?: RawRecord[] };

/** A per-registrar dataset shown as a column in the coverage matrix. */
export type CoverageColumn = {
  /** Dataset file stem, e.g. "registrar_api_capabilities". */
  key: string;
  /** Dataset detail-page slug, e.g. "registrar-api-capabilities". */
  slug: string;
  /** Short human label. */
  label: string;
  /** Published dataset version. */
  version: string;
};

const COLUMN_SOURCES: (Omit<CoverageColumn, "version"> & { data: RawDataset })[] = [
  {
    key: "registrar_api_capabilities",
    slug: "registrar-api-capabilities",
    label: "API capabilities",
    data: apiCapabilities,
  },
  {
    key: "dns_capabilities",
    slug: "dns-capabilities",
    label: "DNS capabilities",
    data: dnsCapabilities,
  },
  {
    key: "agent_capability_signals",
    slug: "agent-capability-signals",
    label: "Agent signals",
    data: agentSignals,
  },
  {
    key: "rdap_metadata",
    slug: "rdap-metadata",
    label: "RDAP metadata",
    data: rdapMetadata,
  },
  {
    key: "registrar_security_contacts",
    slug: "registrar-security-contacts",
    label: "Security contacts",
    data: securityContacts,
  },
  {
    key: "tld_pricing",
    slug: "tld-pricing",
    label: "TLD pricing",
    data: tldPricing,
  },
];

function distinctRegistrarIds(d: RawDataset): Set<string> {
  const ids = (d.records ?? [])
    .map((r) => r.registrar_id ?? r.id)
    .filter((id): id is string => Boolean(id));
  return new Set(ids);
}

export const COVERAGE_COLUMNS: CoverageColumn[] = COLUMN_SOURCES.map((c) => ({
  key: c.key,
  slug: c.slug,
  label: c.label,
  version: c.data.version ?? "—",
}));

const COLUMN_IDS = COLUMN_SOURCES.map((c) => ({
  key: c.key,
  ids: distinctRegistrarIds(c.data),
}));

/** One registrar's presence across every per-registrar dataset. */
export type CoverageRow = {
  id: string;
  name: string;
  ianaId: number | null;
  /** column key -> whether that dataset includes this registrar */
  present: Record<string, boolean>;
  /** number of columns this registrar appears in */
  covered: number;
};

const BASE_REGISTRARS = (
  registrars as { records: { id: string; name: string; iana_id?: number }[] }
).records;

export const COVERAGE_ROWS: CoverageRow[] = BASE_REGISTRARS.map((r) => {
  const present: Record<string, boolean> = {};
  for (const col of COLUMN_IDS) present[col.key] = col.ids.has(r.id);
  const covered = Object.values(present).filter(Boolean).length;
  return { id: r.id, name: r.name, ianaId: r.iana_id ?? null, present, covered };
});

/** Per-dataset coverage: how many of the tracked registrars it includes. */
export type ColumnCoverage = CoverageColumn & { covered: number; total: number };

export const COLUMN_COVERAGE: ColumnCoverage[] = COVERAGE_COLUMNS.map((c) => ({
  ...c,
  total: COVERAGE_ROWS.length,
  covered: COVERAGE_ROWS.filter((row) => row.present[c.key]).length,
}));

const filled = COVERAGE_ROWS.reduce((n, r) => n + r.covered, 0);

export const COVERAGE_TOTALS = {
  registrars: COVERAGE_ROWS.length,
  datasets: COVERAGE_COLUMNS.length,
  cells: COVERAGE_ROWS.length * COVERAGE_COLUMNS.length,
  filled,
  fullyCovered: COVERAGE_ROWS.filter((r) => r.covered === COVERAGE_COLUMNS.length)
    .length,
};
