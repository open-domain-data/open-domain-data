// Provenance reverse index.
//
// Open Domain Data records provenance per field: every field_provenance entry
// names the primary source a value was checked against, how it was verified and
// when. The dataset pages read that forward — "for this registrar, here is the
// source of each field." This module inverts it: "for this source, here is
// every field across every dataset that cites it."
//
// It is a neutral audit artifact, not a ranking — it states which published
// facts rest on which sources, nothing more. The index is built at build time
// from the canonical /data JSON (the same files scripts/check-provenance.mjs
// walks), so the page can never drift from what is actually published.

import { DATASETS } from "./data";

import registrars from "../../data/registrars.json";
import apiCapabilities from "../../data/registrar_api_capabilities.json";
import dnsCapabilities from "../../data/dns_capabilities.json";
import rdapMetadata from "../../data/rdap_metadata.json";
import securityContacts from "../../data/registrar_security_contacts.json";
import agentSignals from "../../data/agent_capability_signals.json";

type RawProvenance = {
  source_url?: string;
  verification_status?: string;
  last_checked?: string;
  note?: string;
};

type RawRecord = {
  id?: string;
  registrar_id?: string;
  iana_id?: number | string;
  field_provenance?: Record<string, RawProvenance>;
};

type RawDataset = {
  dataset?: string;
  version?: string;
  records?: RawRecord[];
};

// The datasets that carry field_provenance, in catalogue order. tld_pricing is
// intentionally absent — it does not yet carry per-field provenance, and this
// index reflects exactly what is published rather than implying coverage.
const SOURCE_DATASETS: RawDataset[] = [
  registrars as unknown as RawDataset,
  apiCapabilities as unknown as RawDataset,
  dnsCapabilities as unknown as RawDataset,
  rdapMetadata as unknown as RawDataset,
  securityContacts as unknown as RawDataset,
  agentSignals as unknown as RawDataset,
];

const registrarName: Record<string, string> = Object.fromEntries(
  ((registrars as unknown as RawDataset).records ?? []).map((r) => [
    String(r.id),
    // The registrars dataset carries the canonical legal name.
    (r as RawRecord & { name?: string }).name ?? String(r.id),
  ]),
);

// Map a dataset's JSON `dataset` name to its public slug + current version.
const datasetMeta: Record<string, { slug: string; version: string }> =
  Object.fromEntries(DATASETS.map((d) => [d.name, { slug: d.slug, version: d.ver }]));

export type ProvenanceCitation = {
  dataset: string;
  datasetSlug: string;
  datasetVersion: string;
  /** The record the field belongs to (registrar display name). */
  record: string;
  recordId: string;
  field: string;
  status: string;
  lastChecked: string; // YYYY-MM-DD
  note?: string;
  url: string;
};

export type SourceEntry = {
  /** The source hostname, e.g. developers.cloudflare.com. */
  domain: string;
  /** Distinct cited URLs on this domain. */
  urlCount: number;
  /** Total field citations resting on this domain. */
  citationCount: number;
  /** Distinct datasets that cite this domain. */
  datasetCount: number;
  /** Most recent last_checked across this domain's citations (YYYY-MM-DD). */
  lastChecked: string;
  /** Count of citations per verification status. */
  statusCounts: Record<string, number>;
  /** Every citation that rests on this domain, newest-checked first. */
  citations: ProvenanceCitation[];
};

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "(invalid source url)";
  }
}

function buildIndex(): {
  sources: SourceEntry[];
  totals: {
    domains: number;
    citations: number;
    urls: number;
    datasets: number;
    generated: string;
  };
} {
  const citations: ProvenanceCitation[] = [];

  for (const ds of SOURCE_DATASETS) {
    const name = ds.dataset ?? "(unknown dataset)";
    const meta = datasetMeta[name] ?? { slug: name, version: ds.version ?? "" };
    for (const rec of ds.records ?? []) {
      const recordId = String(rec.id ?? rec.registrar_id ?? rec.iana_id ?? "(unkeyed)");
      const fp = rec.field_provenance;
      if (!fp) continue;
      for (const [field, p] of Object.entries(fp)) {
        if (!p?.source_url) continue;
        citations.push({
          dataset: name,
          datasetSlug: meta.slug,
          datasetVersion: ds.version ?? meta.version,
          record: registrarName[recordId] ?? recordId,
          recordId,
          field,
          status: p.verification_status ?? "unknown",
          lastChecked: (p.last_checked ?? "").slice(0, 10),
          note: p.note,
          url: p.source_url,
        });
      }
    }
  }

  const byDomain = new Map<string, ProvenanceCitation[]>();
  for (const c of citations) {
    const d = hostOf(c.url);
    const list = byDomain.get(d) ?? [];
    list.push(c);
    byDomain.set(d, list);
  }

  const sources: SourceEntry[] = [...byDomain.entries()].map(([domain, list]) => {
    const statusCounts: Record<string, number> = {};
    for (const c of list) statusCounts[c.status] = (statusCounts[c.status] ?? 0) + 1;
    const sorted = [...list].sort((a, b) =>
      a.lastChecked === b.lastChecked
        ? a.dataset.localeCompare(b.dataset) || a.record.localeCompare(b.record)
        : b.lastChecked.localeCompare(a.lastChecked),
    );
    return {
      domain,
      urlCount: new Set(list.map((c) => c.url)).size,
      citationCount: list.length,
      datasetCount: new Set(list.map((c) => c.dataset)).size,
      lastChecked: sorted[0]?.lastChecked ?? "",
      statusCounts,
      citations: sorted,
    };
  });

  // Most-cited sources first; ties broken alphabetically for a stable build.
  sources.sort((a, b) =>
    b.citationCount === a.citationCount
      ? a.domain.localeCompare(b.domain)
      : b.citationCount - a.citationCount,
  );

  const generated = citations
    .map((c) => c.lastChecked)
    .filter(Boolean)
    .sort()
    .at(-1) ?? "";

  return {
    sources,
    totals: {
      domains: sources.length,
      citations: citations.length,
      urls: new Set(citations.map((c) => c.url)).size,
      datasets: new Set(citations.map((c) => c.dataset)).size,
      generated,
    },
  };
}

const index = buildIndex();

export const provenanceSources = index.sources;
export const provenanceTotals = index.totals;

/** Datasets covered by the index, with their slug + version, for display + linking. */
export const provenanceDatasets = SOURCE_DATASETS.map((ds) => {
  const name = ds.dataset ?? "";
  const meta = datasetMeta[name] ?? { slug: name, version: ds.version ?? "" };
  return { name, slug: meta.slug, version: ds.version ?? meta.version };
});
