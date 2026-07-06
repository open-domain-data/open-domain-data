#!/usr/bin/env node
/**
 * Referential-integrity + coverage check for the per-registrar datasets.
 *
 * Complements scripts/validate.mjs (which checks each record against its JSON
 * Schema and enforces that three datasets match registrars.json exactly). This
 * script checks the invariants that keep the catalog internally consistent as
 * registrars are added, and prints the coverage matrix that /coverage and
 * /api/coverage.json publish:
 *
 *   1. Foreign key — every registrar_id in a per-registrar dataset resolves to
 *      a record in registrars.json. (Catches a dataset referencing a registrar
 *      the catalog does not describe.)
 *   2. No duplicate registrar_id in a one-record-per-registrar dataset.
 *   3. Unique iana_id in registrars.json.
 *
 * Fails (exit 1) only on a real integrity error. Coverage gaps are expected and
 * reported, not failed — a registrar missing from a dataset is a to-do, not a
 * defect. Read-only; safe to run in CI on every PR.
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url)) + "/..";
const dataDir = join(root, "data");

async function load(file) {
  const data = JSON.parse(await readFile(join(dataDir, file), "utf8"));
  return Array.isArray(data.records) ? data.records : [data];
}

// Per-registrar datasets shown in the coverage matrix. `unique` = one record
// per registrar (duplicates are an error); tld_pricing holds one row per
// registrar & TLD, so duplicate registrar_ids are legitimate there.
const DATASETS = [
  { file: "registrar_api_capabilities.json", label: "API capabilities", unique: true },
  { file: "dns_capabilities.json", label: "DNS capabilities", unique: true },
  { file: "agent_capability_signals.json", label: "Agent signals", unique: true },
  { file: "rdap_metadata.json", label: "RDAP metadata", unique: true },
  { file: "registrar_security_contacts.json", label: "Security contacts", unique: true },
  { file: "tld_pricing.json", label: "TLD pricing", unique: false },
];

const registrars = await load("registrars.json");
const baseIds = new Set(registrars.map((r) => r.id));

let failed = 0;

// 3. Unique iana_id in registrars.json.
const ianaSeen = new Map();
for (const r of registrars) {
  if (r.iana_id === undefined || r.iana_id === null) continue;
  if (ianaSeen.has(r.iana_id)) {
    failed++;
    console.error(
      `x  registrars.json: duplicate iana_id ${r.iana_id} (${ianaSeen.get(r.iana_id)} and ${r.id})`,
    );
  } else {
    ianaSeen.set(r.iana_id, r.id);
  }
}
if (!failed) console.log(`ok registrars.json: ${registrars.length} records, iana_id unique`);

// 1 + 2. Foreign key + duplicate checks, and build the coverage matrix.
const coverage = new Map(); // registrar_id -> Set(dataset labels covering it)
for (const id of baseIds) coverage.set(id, new Set());

for (const ds of DATASETS) {
  const records = await load(ds.file);
  const seen = new Set();
  let localFail = 0;
  for (const rec of records) {
    const id = rec.registrar_id ?? rec.id;
    if (!baseIds.has(id)) {
      failed++;
      localFail++;
      console.error(`x  ${ds.file}: registrar_id '${id}' not found in registrars.json`);
      continue;
    }
    if (ds.unique && seen.has(id)) {
      failed++;
      localFail++;
      console.error(`x  ${ds.file}: duplicate registrar_id '${id}' (expected one record per registrar)`);
    }
    seen.add(id);
    coverage.get(id)?.add(ds.label);
  }
  if (!localFail) {
    console.log(`ok ${ds.file}: ${seen.size}/${baseIds.size} registrars, all ids resolve`);
  }
}

// Coverage report (informational — never fails the build).
console.log("\ncoverage matrix (registrar → datasets covered):");
const totalDatasets = DATASETS.length;
let filled = 0;
for (const r of registrars) {
  const have = coverage.get(r.id) ?? new Set();
  filled += have.size;
  const missing = DATASETS.filter((d) => !have.has(d.label)).map((d) => d.label);
  const line = `   ${r.id.padEnd(22)} ${have.size}/${totalDatasets}`;
  console.log(missing.length ? `${line}  (missing: ${missing.join(", ")})` : line);
}
const cells = registrars.length * totalDatasets;
console.log(
  `\ncoverage: ${filled}/${cells} cells filled (${Math.round((filled / cells) * 100)}%) across ${registrars.length} registrars × ${totalDatasets} datasets`,
);

console.log(`\ncheck-integrity: ${failed === 0 ? "no integrity errors" : failed + " error(s)"}.`);
process.exit(failed > 0 ? 1 : 0);
