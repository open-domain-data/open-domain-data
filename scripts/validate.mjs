#!/usr/bin/env node
/**
 * Validate every dataset record in /data against its JSON Schema in /schemas.
 * Exits non-zero on any failure so it can run in CI.
 *
 * Mapping: a dataset's file in /data is validated against the schema referenced
 * by SCHEMA_BY_DATASET below. Missing schemas warn but do not fail.
 */
import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = dirname(fileURLToPath(import.meta.url)) + "/..";
const dataDir = join(root, "data");
const schemaDir = join(root, "schemas");

const SCHEMA_BY_DATASET = {
  "registrars.json": "registrar.schema.json",
  "registrar_api_capabilities.json": "api-capabilities.schema.json",
  "dns_capabilities.json": "dns-capabilities.schema.json",
  "tld_pricing.json": "pricing.schema.json",
  "rdap_metadata.json": "rdap-metadata.schema.json",
  "registrar_security_contacts.json": "security-contacts.schema.json",
  "agent_capability_signals.json": "agent-capability-signals.schema.json",
};

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

let failed = 0;
let passed = 0;
let skipped = 0;

for (const entry of await readdir(dataDir)) {
  if (!entry.endsWith(".json")) continue;
  const schemaFile = SCHEMA_BY_DATASET[entry];
  if (schemaFile === undefined) {
    console.warn(`!  ${entry}: not registered in SCHEMA_BY_DATASET; skipping.`);
    skipped++;
    continue;
  }
  if (schemaFile === null) {
    console.log(`-  ${entry}: no published schema yet; skipping.`);
    skipped++;
    continue;
  }
  const schema = JSON.parse(await readFile(join(schemaDir, schemaFile), "utf8"));
  const data = JSON.parse(await readFile(join(dataDir, entry), "utf8"));
  const records = Array.isArray(data.records) ? data.records : [data];
  const validate = ajv.compile(schema);
  let local = 0;
  for (const [i, rec] of records.entries()) {
    if (!validate(rec)) {
      failed++;
      local++;
      console.error(`x  ${entry}[${i}]:`);
      for (const err of validate.errors ?? []) {
        console.error(`     ${err.instancePath || "/"} ${err.message}`);
      }
    }
  }
  if (local === 0) {
    passed++;
    console.log(`ok ${entry}: ${records.length} records validate against ${schemaFile}`);
  }
}

// ---------------------------------------------------------------------------
// Cross-dataset coverage: the per-registrar capability datasets ship the same
// illustrative registrar sample as registrars.json. They must cover exactly the
// same registrar ids — otherwise a consumer fetching one dataset gets a subset
// of the registrars the rest of the catalog describes. This check keeps the
// sample sets from drifting apart silently (which they had: dns_capabilities,
// rdap_metadata and security_contacts trailed the others at 3 records).
const COVERAGE_MUST_MATCH_REGISTRARS = [
  "registrar_api_capabilities.json",
  "agent_capability_signals.json",
  "dns_capabilities.json",
];

async function registrarIds(file) {
  const data = JSON.parse(await readFile(join(dataDir, file), "utf8"));
  const records = Array.isArray(data.records) ? data.records : [data];
  return new Set(records.map((r) => r.registrar_id ?? r.id));
}

const baseIds = await registrarIds("registrars.json");
for (const file of COVERAGE_MUST_MATCH_REGISTRARS) {
  const ids = await registrarIds(file);
  const missing = [...baseIds].filter((id) => !ids.has(id));
  const extra = [...ids].filter((id) => !baseIds.has(id));
  if (missing.length || extra.length) {
    failed++;
    console.error(`x  ${file}: registrar coverage does not match registrars.json`);
    if (missing.length) console.error(`     missing: ${missing.join(", ")}`);
    if (extra.length) console.error(`     unknown: ${extra.join(", ")}`);
  } else {
    console.log(`ok ${file}: registrar coverage matches registrars.json (${ids.size})`);
  }
}

console.log(`\nvalidate: ${passed} passed, ${failed} failed, ${skipped} skipped.`);
process.exit(failed > 0 ? 1 : 0);
