import { DATASETS, type Dataset } from "./data";
import { getDatasetDetail } from "./datasetDetail";
import type { LandscapeEdition, LandscapeStat } from "./landscape";

const BASE = "https://opendomaindata.org";
const LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/";
const REPO_URL = "https://github.com/open-domain-data/open-domain-data";

const PUBLISHER = {
  "@type": "Organization",
  name: "Open Domain Data",
  url: BASE,
} as const;

/** schema.org encodingFormat for each format key we publish. */
const FORMAT_MIME: Record<string, string> = {
  json: "application/json",
  csv: "text/csv",
};

/**
 * Stable, citation-style identifier for a dataset version — mirrors the form
 * used in README citations (e.g. `opendomaindata:registrars@2026.05`).
 */
function datasetIdentifier(d: Dataset): string {
  return `opendomaindata:${d.slug}@${d.ver}`;
}

/**
 * A schema.org `Dataset` node for one dataset, rich enough for Google Dataset
 * Search and LLM ingestion. Every field is read from the published dataset
 * metadata and schema — nothing is inferred or scored. `variableMeasured` is
 * the dataset's own schema fields, so an agent can see the columns before
 * fetching the file.
 */
export function datasetJsonLd(d: Dataset) {
  const detail = getDatasetDetail(d.slug);
  const pageUrl = `${BASE}/datasets/${d.slug}`;

  const distribution: object[] = [];
  if (detail) {
    distribution.push({
      "@type": "DataDownload",
      name: `${d.name} (JSON)`,
      encodingFormat: FORMAT_MIME.json,
      contentUrl: `${BASE}${detail.jsonHref}`,
    });
    if (detail.csvHref) {
      distribution.push({
        "@type": "DataDownload",
        name: `${d.name} (CSV)`,
        encodingFormat: FORMAT_MIME.csv,
        contentUrl: `${BASE}${detail.csvHref}`,
      });
    }
    distribution.push({
      "@type": "DataDownload",
      name: `${d.name} JSON Schema`,
      encodingFormat: "application/schema+json",
      contentUrl: `${BASE}/schemas/${detail.schemaSlug}`,
    });
  }

  const variableMeasured = detail?.fields.map((f) => ({
    "@type": "PropertyValue",
    name: f.f,
    description: f.d,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": pageUrl,
    name: d.name,
    description: d.desc,
    url: pageUrl,
    identifier: datasetIdentifier(d),
    version: d.ver,
    license: LICENSE_URL,
    isAccessibleForFree: true,
    dateModified: d.updated,
    creator: PUBLISHER,
    publisher: PUBLISHER,
    sameAs: REPO_URL,
    keywords: [
      "domain registrars",
      "domain infrastructure",
      "RDAP",
      "DNS",
      "open data",
      d.name,
    ],
    includedInDataCatalog: {
      "@type": "DataCatalog",
      name: "Open Domain Data",
      url: `${BASE}/datasets`,
    },
    ...(variableMeasured?.length ? { variableMeasured } : {}),
    ...(distribution.length ? { distribution } : {}),
  };
}

/**
 * A schema.org `DataCatalog` node listing every dataset. Lets Google Dataset
 * Search and AI engines discover the whole catalog from the `/datasets` index
 * in one document.
 */
export function dataCatalogJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "DataCatalog",
    "@id": `${BASE}/datasets`,
    name: "Open Domain Data",
    description:
      "Open, versioned datasets describing the domain infrastructure ecosystem — registrars, registrar APIs, DNS capabilities, TLD pricing, RDAP metadata, security contacts and agent-capability signals. Compiled from public sources, RDAP and registrar submissions.",
    url: `${BASE}/datasets`,
    license: LICENSE_URL,
    isAccessibleForFree: true,
    publisher: PUBLISHER,
    sameAs: REPO_URL,
    dataset: DATASETS.map((d) => ({
      "@type": "Dataset",
      "@id": `${BASE}/datasets/${d.slug}`,
      name: d.name,
      description: d.desc,
      url: `${BASE}/datasets/${d.slug}`,
      identifier: datasetIdentifier(d),
      version: d.ver,
      license: LICENSE_URL,
      dateModified: d.updated,
    })),
  };
}

const LANDSCAPE_SOURCE_URLS = [
  `${BASE}/datasets/registrar-api-capabilities`,
  `${BASE}/datasets/dns-capabilities`,
  `${BASE}/datasets/agent-capability-signals`,
  `${BASE}/datasets/rdap-metadata`,
  `${BASE}/datasets/registrar-security-contacts`,
];

/**
 * A schema.org `Dataset` node for one quarterly landscape edition. The stats
 * are surfaced as `variableMeasured` so an engine can read every headline
 * number, its statement and its exact value without fetching the JSON.
 */
export function landscapeEditionJsonLd(edition: LandscapeEdition, canonical: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": canonical,
    name: `Domain registrar landscape — ${edition.edition}`,
    description: `Aggregate capability statistics computed over the ${edition.coverage.tracked_registrars} registrars tracked by Open Domain Data. ${edition.coverage.note}`,
    url: canonical,
    identifier: `opendomaindata:registrar_landscape@${edition.edition}`,
    version: edition.edition,
    license: LICENSE_URL,
    isAccessibleForFree: true,
    dateModified: edition.last_checked.slice(0, 10),
    creator: PUBLISHER,
    publisher: PUBLISHER,
    sameAs: REPO_URL,
    isBasedOn: LANDSCAPE_SOURCE_URLS,
    keywords: ["domain registrars", "registrar API", "agent readiness", "DNSSEC", "RDAP", "open data"],
    includedInDataCatalog: { "@type": "DataCatalog", name: "Open Domain Data", url: `${BASE}/datasets` },
    variableMeasured: edition.records.map((s) => ({
      "@type": "PropertyValue",
      name: s.metric,
      description: s.statement,
      value: s.value,
      ...(s.percent !== null ? { unitText: "percent", maxValue: 100 } : {}),
      url: s.canonical_url,
    })),
    distribution: [
      { "@type": "DataDownload", name: "registrar_landscape (JSON)", encodingFormat: FORMAT_MIME.json, contentUrl: `${BASE}/api/registrar_landscape.json` },
      { "@type": "DataDownload", name: "registrar_landscape (CSV)", encodingFormat: FORMAT_MIME.csv, contentUrl: `${BASE}/api/registrar_landscape.csv` },
    ],
  };
}

/**
 * A schema.org `Dataset` node for a single landscape stat, with the value
 * carried as a `QuantitativeValue`/`PropertyValue`. This is the citable unit —
 * one stable URL, one number, its source datasets and its methodology.
 */
export function landscapeStatJsonLd(stat: LandscapeStat) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": stat.canonical_url,
    name: `${stat.metric} — ${stat.edition}`,
    description: stat.statement,
    url: stat.canonical_url,
    identifier: `opendomaindata:registrar_landscape@${stat.edition}#${stat.id}`,
    version: stat.edition,
    license: LICENSE_URL,
    isAccessibleForFree: true,
    creator: PUBLISHER,
    publisher: PUBLISHER,
    sameAs: REPO_URL,
    isBasedOn: LANDSCAPE_SOURCE_URLS,
    variableMeasured: {
      "@type": "PropertyValue",
      name: stat.metric,
      description: stat.methodology,
      value: stat.value,
      ...(stat.numerator !== null ? { measuredValue: stat.numerator } : {}),
      ...(stat.denominator !== null ? { maxValue: stat.denominator } : {}),
      unitText: stat.unit,
    },
  };
}
