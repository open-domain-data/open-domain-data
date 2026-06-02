import type { Metadata } from "next";
import Link from "next/link";
import { SCHEMAS, REGISTRARS_SCHEMA } from "@/lib/data";
import { DocShell, PageHead, H2A, FieldTable } from "@/components/DocShell";
import { Chip } from "@/components/Atoms";

export const metadata: Metadata = {
  title: "Schemas",
  description: "JSON Schemas for every Open Domain Data dataset, with field types, requirements and versioning.",
  alternates: { canonical: "/schemas" },
};

export default function SchemasIndexPage() {
  const side = [
    { h: "Reference", links: [{ label: "Schemas", href: "/schemas", active: true }, { label: "Verification model", href: "/methodology#verification" }, { label: "Licensing", href: "/methodology#licensing" }] },
    { h: "Schemas", links: SCHEMAS.map((s) => ({ label: s.name, href: `/schemas/${s.slug}`, mono: true })) },
  ];
  return (
    <DocShell groups={side}>
      <PageHead
        crumb={[{ label: "schemas" }]}
        title="Schemas"
        desc="Every dataset validates against a published JSON Schema. Schemas are versioned alongside the data and changes are recorded in the changelog."
      />
      <div className="od-table--bordered" style={{ marginBottom: 8 }}>
        <table className="od-table">
          <thead>
            <tr>
              <th>Schema</th>
              <th className="num" style={{ textAlign: "right" }}>
                Fields
              </th>
              <th>Version</th>
              <th>Used by dataset</th>
              <th>Formats</th>
            </tr>
          </thead>
          <tbody>
            {SCHEMAS.map((s) => (
              <tr key={s.name}>
                <td>
                  <Link href={`/schemas/${s.slug}`} className="od-table__name">
                    {s.name}
                  </Link>
                </td>
                <td className="num">{s.fields}</td>
                <td className="mono" style={{ fontSize: 12.5, color: "var(--od-ink-2)" }}>
                  {s.ver}
                </td>
                <td className="mono" style={{ fontSize: 12, color: "var(--od-link)" }}>
                  {s.used}
                </td>
                <td>
                  <Chip>json-schema</Chip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2A id="registrar" right={<a className="od-link od-small" style={{ fontWeight: 500 }} href="/schemas/registrar.schema.json">Download registrar.schema.json →</a>}>
        registrar.schema.json
      </H2A>
      <FieldTable fields={REGISTRARS_SCHEMA} />
    </DocShell>
  );
}
