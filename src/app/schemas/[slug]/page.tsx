import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import {
  SCHEMAS,
  REGISTRARS_SCHEMA,
  API_CAPABILITIES_SCHEMA,
  DNS_CAPABILITIES_SCHEMA,
  PRICING_SCHEMA,
} from "@/lib/data";
import { DocShell, PageHead, H2A, FieldTable } from "@/components/DocShell";
import { CodeBlock } from "@/components/CodeBlock";
import { MetaBlock, InlineCode } from "@/components/Atoms";
import { IcDownload } from "@/components/Icons";

const FIELDS_BY_SLUG: Record<string, { f: string; t: string; r: boolean; d: string }[]> = {
  "registrar.schema.json": REGISTRARS_SCHEMA,
  "api-capabilities.schema.json": API_CAPABILITIES_SCHEMA,
  "dns-capabilities.schema.json": DNS_CAPABILITIES_SCHEMA,
  "pricing.schema.json": PRICING_SCHEMA,
};

export function generateStaticParams() {
  return SCHEMAS.map((s) => ({ slug: s.slug }));
}

function schemaBySlug(slug: string) {
  return SCHEMAS.find((s) => s.slug === slug) ?? null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const s = schemaBySlug(params.slug);
  if (!s) return { title: "Schema not found" };
  return { title: s.slug, description: `JSON Schema for the ${s.used} dataset.`, alternates: { canonical: `/schemas/${s.slug}` } };
}

export default function SchemaDetailPage({ params }: { params: { slug: string } }) {
  const meta = schemaBySlug(params.slug);
  const fields = FIELDS_BY_SLUG[params.slug];
  if (!meta || !fields) notFound();

  // Read the on-disk schema JSON for the preview
  let schemaJson = "{}";
  try {
    const p = path.join(process.cwd(), "public", "schemas", params.slug);
    schemaJson = fs.readFileSync(p, "utf-8");
  } catch {
    // file may not exist for derived schemas
  }

  const side = [
    { h: "Reference", links: [{ label: "Schemas", href: "/schemas" }] },
    {
      h: "Schemas",
      links: SCHEMAS.map((s) => ({ label: s.name, href: `/schemas/${s.slug}`, mono: true, active: s.slug === params.slug })),
    },
  ];

  return (
    <DocShell groups={side}>
      <PageHead
        crumb={[
          { label: "schemas", href: "/schemas" },
          { label: meta.slug },
        ]}
        title={meta.slug}
        mono
        desc={`JSON Schema for the ${meta.used} dataset. Versioned alongside the data.`}
        actions={
          <>
            <a className="od-btn od-btn--primary" href={`/schemas/${meta.slug}`}>
              <IcDownload s={15} /> Download {meta.slug}
            </a>
            <Link className="od-btn" href={`/datasets/${meta.used.replace(/_/g, "-")}`}>
              View dataset
            </Link>
          </>
        }
      />

      <H2A id="overview">Overview</H2A>
      <MetaBlock
        rows={[
          ["name", meta.name],
          ["version", meta.ver],
          ["fields", String(meta.fields)],
          ["used_by", meta.used],
          ["draft", "2020-12"],
          ["license", "CC-BY-4.0"],
        ]}
      />

      <H2A id="fields">Field definitions</H2A>
      <FieldTable fields={fields} />

      <H2A id="preview">JSON Schema</H2A>
      <CodeBlock tabs={[{ label: meta.slug, content: schemaJson }]} />

      <H2A id="validation">Validation example</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Validate a record locally using any JSON Schema validator. The schema is draft 2020-12; for{" "}
        <InlineCode>ajv</InlineCode> use the <InlineCode>2020</InlineCode> import.
      </p>
      <CodeBlock
        tabs={[
          {
            label: "ajv",
            content: `import Ajv from "ajv/dist/2020";
import schema from "https://opendomaindata.org/schemas/${meta.slug}" assert { type: "json" };

const ajv = new Ajv();
const validate = ajv.compile(schema);
const ok = validate(record);
if (!ok) console.error(validate.errors);`,
          },
        ]}
      />

      <H2A id="changelog">Changelog</H2A>
      <p className="od-body" style={{ maxWidth: 640 }}>
        Schema changes are recorded in the{" "}
        <Link href="/changelog" className="od-link">
          project changelog
        </Link>{" "}
        and follow the dataset release tag.
      </p>
    </DocShell>
  );
}
