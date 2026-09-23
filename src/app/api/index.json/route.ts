import { DATASETS } from "@/lib/data";
import { getDatasetDetail } from "@/lib/datasetDetail";

export const dynamic = "force-static";

const BASE = "https://opendomaindata.org";

// A single machine-readable index of the whole data surface. An agent can fetch
// this one URL and discover every dataset, its JSON/CSV data files, its JSON
// Schema, current version, verification status, record count and last-updated
// date — without knowing each endpoint URL in advance.
//
// It composes the two existing sources of truth and adds nothing of its own:
//   • DATASETS (src/lib/data.ts)         → name, version, status, count, dates
//   • getDatasetDetail (datasetDetail.ts) → the real json/csv/schema paths
// Because the CSV path comes from getDatasetDetail (which only records a CSV for
// datasets that actually ship one), the index never advertises a CSV file that
// does not exist.

export function GET() {
  const datasets = DATASETS.map((d) => {
    const detail = getDatasetDetail(d.slug);
    return {
      name: d.name,
      slug: d.slug,
      description: d.desc,
      version: d.ver,
      verification_status: d.status,
      last_updated: d.updated,
      records: d.records,
      records_count: d.recordsCount,
      license: d.license,
      dataset_page: `${BASE}/datasets/${d.slug}`,
      json: detail ? `${BASE}${detail.jsonHref}` : `${BASE}/api/${d.name}.json`,
      csv: detail?.csvHref ? `${BASE}${detail.csvHref}` : null,
      schema: detail ? `${BASE}/schemas/${detail.schemaSlug}` : null,
    };
  });

  const body = {
    _meta: {
      description:
        "Machine-readable index of every Open Domain Data dataset. One fetch enumerates all datasets with their JSON and (where published) CSV data files, JSON Schema, current version, verification status, record count and last-updated date, so an agent can discover the whole data surface without knowing each endpoint URL in advance.",
      site: BASE,
      generated_for: `${BASE}/api/index.json`,
      llms_txt: `${BASE}/llms.txt`,
      count: datasets.length,
      license: "CC-BY-4.0",
      license_url: `${BASE}/LICENSE-DATA`,
      methodology: `${BASE}/methodology`,
      neutrality:
        "Open Domain Data publishes neutral facts only. It does not score, rank, recommend or endorse registrars. Ranking and recommendation belong to Best-Domain-Registrars.com, which consumes this data.",
      sample_note:
        "The repository ships an illustrative sample of seven registrars (Cloudflare, Namecheap, Porkbun, GoDaddy, Dynadot, Spaceship, Squarespace Domains). The records/records_count values describe each dataset's intended scope; values not re-verified for the current release are marked sample or preliminary in the dataset metadata and on the registrar detail pages.",
      formats: {
        json: "/api/<dataset>.json — dataset envelope with version, license, last_checked, schema, count and a records array.",
        csv: "/api/<dataset>.csv — UTF-8, RFC 4180 quoting; array fields use the | separator. Only published where a csv value is present below.",
        schema: "/schemas/<name>.schema.json — JSON Schema (Draft 2020-12).",
      },
      verification_statuses: `${BASE}/methodology`,
    },
    datasets,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
