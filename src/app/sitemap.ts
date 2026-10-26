import type { MetadataRoute } from "next";
import { DATASETS, REGISTRARS, SCHEMAS } from "@/lib/data";
import { LANDSCAPE_EDITIONS } from "@/lib/landscape";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://opendomaindata.org";
  const now = new Date();
  const routes = [
    "",
    "/datasets",
    "/schemas",
    "/registrars",
    "/landscape",
    "/methodology",
    "/provenance",
    "/changelog",
    "/developers",
    "/contribute",
  ].map((p) => ({ url: `${base}${p}`, lastModified: now }));
  const datasetRoutes = DATASETS.map((d) => ({ url: `${base}/datasets/${d.slug}`, lastModified: now }));
  const schemaRoutes = SCHEMAS.map((s) => ({ url: `${base}/schemas/${s.slug}`, lastModified: now }));
  const registrarRoutes = REGISTRARS.map((r) => ({ url: `${base}/registrars/${r.id}`, lastModified: now }));
  const landscapeRoutes = LANDSCAPE_EDITIONS.flatMap((e) => {
    const slug = e.edition.toLowerCase();
    return [
      { url: `${base}/landscape/${slug}`, lastModified: now },
      ...e.records.map((s) => ({ url: `${base}/landscape/${slug}/${s.id}`, lastModified: now })),
    ];
  });
  return [...routes, ...datasetRoutes, ...schemaRoutes, ...registrarRoutes, ...landscapeRoutes];
}
