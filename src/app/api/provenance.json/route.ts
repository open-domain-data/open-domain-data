import {
  provenanceSources,
  provenanceTotals,
  provenanceDatasets,
} from "@/lib/provenance";

// Machine-readable variant of the /provenance reverse index. Built from the
// same src/lib/provenance.ts that renders the HTML page — which itself reads
// the canonical /data JSON at build time — so this endpoint cannot drift from
// what is published. Statically generated; no request-time work.
export const dynamic = "force-static";

export function GET() {
  const body = {
    _meta: {
      dataset: "provenance_reverse_index",
      description:
        "A neutral audit artifact, not a dataset and not a ranking. It inverts the per-field provenance recorded across Open Domain Data's datasets: for each source domain, every field — across every dataset — whose value was checked against that source. Built from the canonical /data JSON at build time, so it reflects exactly what is published. tld_pricing is excluded because it does not yet carry per-field provenance.",
      license: "CC-BY-4.0",
      generated_from: "field_provenance entries across the datasets listed in datasets_covered",
      last_checked: provenanceTotals.generated,
      site: "https://opendomaindata.org",
      page: "https://opendomaindata.org/provenance",
      totals: provenanceTotals,
      datasets_covered: provenanceDatasets,
      field_notes: {
        domain: "Source hostname, e.g. www.iana.org.",
        citation_count: "Total field citations resting on this source.",
        url_count: "Distinct cited URLs on this source.",
        dataset_count: "Distinct datasets that cite this source.",
        status_counts:
          "Field citations grouped by verification_status (how a value was checked, never a quality score).",
        citations:
          "Every field citation resting on this source, newest-checked first; each names its dataset, record, field, status, last_checked, source URL and any note.",
      },
    },
    count: provenanceSources.length,
    sources: provenanceSources,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
