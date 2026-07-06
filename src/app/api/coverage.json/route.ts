import {
  COVERAGE_COLUMNS,
  COVERAGE_ROWS,
  COLUMN_COVERAGE,
  COVERAGE_TOTALS,
} from "@/lib/coverage";

export const dynamic = "force-static";

// Machine-readable coverage matrix: which registrars each per-registrar dataset
// includes. Built from the same src/lib/coverage.ts as /coverage (which reads
// the canonical /data JSON at build), so it cannot drift from what is published.
export function GET() {
  const body = {
    _meta: {
      title: "Open Domain Data — dataset coverage matrix",
      description:
        "Which registrars are represented in which per-registrar dataset. Each cell is a fact about dataset coverage — whether a dataset holds a record for a registrar — not a quality score or a ranking.",
      page: "https://opendomaindata.org/coverage",
      license: "CC BY 4.0",
      neutrality:
        "Open Domain Data does not score, rank, recommend or endorse registrars. This is a coverage report about the datasets themselves.",
      generated_from:
        "Computed at build time from the canonical /data JSON. Add a registrar to a dataset and the cell fills in automatically.",
      totals: COVERAGE_TOTALS,
    },
    datasets: COLUMN_COVERAGE.map((c) => ({
      key: c.key,
      slug: c.slug,
      label: c.label,
      version: c.version,
      registrars_covered: c.covered,
      registrars_total: c.total,
    })),
    registrars: COVERAGE_ROWS.map((r) => ({
      id: r.id,
      name: r.name,
      iana_id: r.ianaId,
      datasets_covered: r.covered,
      datasets_total: COVERAGE_COLUMNS.length,
      present: COVERAGE_COLUMNS.reduce<Record<string, boolean>>((acc, c) => {
        acc[c.key] = r.present[c.key];
        return acc;
      }, {}),
    })),
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
