import type { MetadataRoute } from "next";
import { DATASETS, REGISTRARS, SCHEMAS } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://opendomaindata.org";
  const now = new Date();
  const routes = [
    "",
    "/datasets",
    "/schemas",
    "/registrars",
    "/methodology",
    "/changelog",
    "/developers",
    "/contribute",
  ].map((p) => ({ url: `${base}${p}`, lastModified: now }));
  const datasetRoutes = DATASETS.map((d) => ({ url: `${base}/datasets/${d.slug}`, lastModified: now }));
  const schemaRoutes = SCHEMAS.map((s) => ({ url: `${base}/schemas/${s.slug}`, lastModified: now }));
  const registrarRoutes = REGISTRARS.map((r) => ({ url: `${base}/registrars/${r.id}`, lastModified: now }));
  return [...routes, ...datasetRoutes, ...schemaRoutes, ...registrarRoutes];
}
