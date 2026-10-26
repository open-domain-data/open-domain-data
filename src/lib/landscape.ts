import landscapeJson from "../../data/registrar_landscape.json";

export type LandscapeStat = {
  id: string;
  edition: string;
  headline: boolean;
  metric: string;
  statement: string;
  value: string;
  numerator: number | null;
  denominator: number | null;
  percent: number | null;
  unit: string;
  methodology: string;
  computed_from: { dataset: string; version: string; field: string }[];
  breakdown: Record<string, string[]>;
  canonical_url: string;
};

export type LandscapeEdition = {
  dataset: string;
  version: string;
  edition: string;
  cadence: string;
  license: string;
  schema: string;
  coverage: { tracked_registrars: number; registrar_ids: string[]; note: string };
  last_checked: string;
  count: number;
  records: LandscapeStat[];
};

export const LANDSCAPE = landscapeJson as unknown as LandscapeEdition;
export const LANDSCAPE_STATS = LANDSCAPE.records;
export const HEADLINE_STATS = LANDSCAPE_STATS.filter((s) => s.headline);

/** All editions, newest first. One for now; kept as a list so quarterly additions slot in. */
export const LANDSCAPE_EDITIONS: LandscapeEdition[] = [LANDSCAPE];

export function editionBySlug(slug: string): LandscapeEdition | undefined {
  return LANDSCAPE_EDITIONS.find((e) => e.edition.toLowerCase() === slug.toLowerCase());
}

export function statById(edition: LandscapeEdition, id: string): LandscapeStat | undefined {
  return edition.records.find((s) => s.id === id);
}

/** The single stat other neutral directories are invited to cite (see docs/cross-citation.md). */
export const FEATURED_CROSS_CITATION_ID = "mcp-interface";
