#!/usr/bin/env node
/**
 * RDAP verification for the registrars dataset.
 *
 * Every registrar record claims an `rdap_base`. This script makes that claim
 * reproducible: it reads data/registrars.json, resolves each record's IANA ID
 * against the authoritative IANA registrar-ids CSV, checks the recorded
 * rdap_base matches what IANA publishes, and then issues a live RDAP query to
 * confirm the endpoint actually speaks RDAP (returns an object carrying
 * rdapConformance, or a well-formed RDAP errorCode for an unknown domain).
 *
 * It is the evidence behind the `independently_tested` status on the rdap_base
 * field provenance. It only reads; it never edits the dataset.
 *
 * Usage:
 *   node scripts/verify-rdap.mjs           # check every record
 *   node scripts/verify-rdap.mjs --json    # machine-readable report
 *
 * Exit code is non-zero if any recorded rdap_base disagrees with IANA, so this
 * can run in CI to catch drift in the registry.
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url)) + "/..";
const IANA_CSV = "https://www.iana.org/assignments/registrar-ids/registrar-ids-1.csv";
const PROBE_DOMAIN = "zzzznonexistent-odd-probe-12345.com";

const asJson = process.argv.includes("--json");

async function ianaMap() {
  const res = await fetch(IANA_CSV, { headers: { "user-agent": "open-domain-data/verify-rdap" } });
  if (!res.ok) throw new Error(`IANA CSV fetch failed: ${res.status}`);
  const text = await res.text();
  const map = new Map();
  for (const raw of text.trim().split(/\r?\n/).slice(1)) {
    const line = raw.replace(/\r$/, "");
    // id,"name",status,rdap_base  — name may be quoted and contain commas.
    const m = line.match(/^(\d+),(?:"([^"]*)"|([^,]*)),([^,]*),(.*)$/);
    if (!m) continue;
    const id = Number(m[1]);
    const name = (m[2] ?? m[3] ?? "").trim();
    const status = m[4].trim();
    const rdap = m[5].trim();
    map.set(id, { name, status, rdap });
  }
  return map;
}

async function probeRdap(base) {
  if (!base) return { reachable: false, detail: "no rdap_base recorded" };
  const url = base.replace(/\/?$/, "/") + "domain/" + PROBE_DOMAIN;
  try {
    const res = await fetch(url, {
      headers: { accept: "application/rdap+json, application/json", "user-agent": "open-domain-data/verify-rdap" },
    });
    const body = await res.text();
    const isRdap = /rdapConformance/.test(body) || /"errorCode"\s*:/.test(body);
    return {
      reachable: isRdap,
      http_status: res.status,
      detail: isRdap
        ? body.includes("rdapConformance")
          ? "valid RDAP response (rdapConformance)"
          : "valid RDAP error object (errorCode)"
        : "response did not look like RDAP",
    };
  } catch (err) {
    // Some registrar RDAP hosts on newer gTLDs (e.g. rdap.squarespace.domains)
    // are reachable via curl/openssl but trip Node's undici TLS stack. Flag
    // this as a transport limitation rather than asserting the endpoint is dead.
    return { reachable: false, transport_error: true, detail: `transport: ${String(err)}` };
  }
}

async function main() {
  const data = JSON.parse(await readFile(join(root, "data/registrars.json"), "utf8"));
  const iana = await ianaMap();
  const results = [];
  let drift = 0;

  for (const rec of data.records) {
    const ref = iana.get(rec.iana_id);
    const ianaRdap = ref?.rdap?.replace(/\/?$/, "/") ?? null;
    const recRdap = rec.rdap_base?.replace(/\/?$/, "/") ?? null;
    const matchesIana = ref ? ianaRdap === recRdap : false;
    if (ref && !matchesIana) drift++;
    const probe = await probeRdap(rec.rdap_base);
    results.push({
      id: rec.id,
      iana_id: rec.iana_id,
      recorded_rdap_base: rec.rdap_base ?? null,
      iana_rdap_base: ref?.rdap ?? null,
      matches_iana: matchesIana,
      probe,
    });
  }

  if (asJson) {
    process.stdout.write(JSON.stringify({ generated: new Date().toISOString(), results }, null, 2) + "\n");
  } else {
    console.log("\n  RDAP verification (data/registrars.json vs IANA registry)");
    console.log("  " + "=".repeat(72));
    for (const r of results) {
      const m = r.matches_iana ? "ok " : "DRIFT";
      const p = r.probe.reachable ? "rdap-live" : r.probe.transport_error ? "transport!" : "no-rdap";
      console.log(`  ${m} ${p.padEnd(11)} ${r.id.padEnd(22)} ${r.recorded_rdap_base || "(blank)"}`);
      if (!r.matches_iana && r.iana_rdap_base) console.log(`        IANA says: ${r.iana_rdap_base}`);
      if (!r.probe.reachable) console.log(`        probe: ${r.probe.detail}`);
    }
    console.log("  " + "=".repeat(72));
    console.log(`  ${results.length} records, ${drift} disagree with IANA.\n`);
  }

  process.exit(drift > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
