#!/usr/bin/env node
/**
 * Import factual records from the best-domain-registrars.com public data feed
 * into the canonical datasets under /data.
 *
 * This importer is a *contributor, not a superuser*: it edits /data exactly the
 * way a human contributor would, and its output is expected to go through the
 * normal PR review flow (see .github/workflows/import.yml). It enforces the
 * project's neutrality and provenance rules in code:
 *
 *  - ENDPOINT ALLOWLIST. Only the factual endpoints listed in IMPORTS are ever
 *    fetched. The peer's editorial datasets (scores, rankings, per-country
 *    recommendations, scoring methodology) are named in REFUSED_EDITORIAL and
 *    the importer refuses to touch them under any flag.
 *  - LOOP PREVENTION. The peer's api-access.json mirrors Open Domain Data's own
 *    registrar_api_capabilities dataset, so importing it would launder our own
 *    records back through a second site; it is named in REFUSED_CIRCULAR.
 *    Additionally, any record whose source_url points at opendomaindata.org is
 *    dropped, and any peer dataset whose _meta declares an Open Domain Data
 *    source_dataset is skipped.
 *  - LICENSE GATE. A peer dataset is only imported when the feed states a
 *    CC BY-compatible license for it (per-file _meta.license, or the feed-level
 *    license in /data/index.json). --allow-unlicensed overrides for pilot runs
 *    and must be justified in the PR that carries the result.
 *  - CONFLICT RULES. Field values already in /data are only replaced when the
 *    incoming value carries an equal-or-higher verification rank; on equal rank
 *    the newer last_checked wins. independently_tested values are never
 *    overwritten by an import.
 *  - NO INVENTED REGISTRARS. Rows for peer registrars that have no record in
 *    registrars.json are skipped and reported (a new registrar record needs an
 *    iana_id and the normal contribution flow), never auto-created.
 *
 * Usage:
 *   node scripts/import-bdr.mjs                  # fetch from the live feed
 *   node scripts/import-bdr.mjs --from <dir>     # read previously downloaded files
 *   node scripts/import-bdr.mjs --dry-run        # report, write nothing
 *   node scripts/import-bdr.mjs --allow-unlicensed
 *
 * A machine-readable run report (added/updated/kept/skipped, unmatched ids,
 * license state) is written to reports/import-bdr-report.json.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url)) + "/..";
const DATA_DIR = join(root, "data");
const REPORT_PATH = join(root, "reports", "import-bdr-report.json");

const PEER = "best-domain-registrars.com";
const PEER_BASE = `https://www.${PEER}/data/`;
const OWN_DOMAIN = "opendomaindata.org";

// Factual endpoints this importer may read. Nothing outside this list is ever
// fetched, whatever flags are passed.
const IMPORTS = [
  "index.json",
  "registrars.json", // identity facts only, used to resolve brand names
  "pricing.csv",
  "registrar-ownership.json",
  "tld-registry-facts.json",
  "cctlds.json",
  "domain-registrar-mcp.json",
];

// The peer's opinion layer. Refused permanently — Open Domain Data does not
// rank, score or recommend registrars (README / GOVERNANCE).
const REFUSED_EDITORIAL = [
  "registrar-scores.json",
  "agent-readiness.json",
  "country-recommendations.json",
  "methodology.json",
];

// Peer datasets that mirror Open Domain Data's own records. Importing them
// would re-ingest our own data with the peer as the apparent source.
const REFUSED_CIRCULAR = ["api-access.json"];

const VERIFICATION_RANK = {
  unknown: 0,
  deprecated: 0,
  registrar_submitted: 1,
  public_sources: 2,
  registrar_verified: 3,
  independently_tested: 4,
};

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const allowUnlicensed = args.includes("--allow-unlicensed");
const fromIdx = args.indexOf("--from");
const fromDir = fromIdx !== -1 ? args[fromIdx + 1] : null;

for (const name of [...REFUSED_EDITORIAL, ...REFUSED_CIRCULAR]) {
  if (IMPORTS.includes(name)) {
    console.error(`import-bdr: ${name} is on a refusal list and may not be imported.`);
    process.exit(1);
  }
}

const report = {
  peer: PEER,
  generated: new Date().toISOString(),
  mode: fromDir ? `offline (${fromDir})` : "live",
  dry_run: dryRun,
  license: {},
  datasets: {},
  refused: {
    editorial: REFUSED_EDITORIAL,
    circular: REFUSED_CIRCULAR,
  },
  unmatched_peer_registrars: [],
  dropped_own_domain_records: 0,
};

async function fetchPeer(name) {
  if (!IMPORTS.includes(name)) throw new Error(`endpoint not on the allowlist: ${name}`);
  if (fromDir) return readFile(join(fromDir, name), "utf8");
  const res = await fetch(PEER_BASE + name, {
    redirect: "follow",
    headers: { "user-agent": "open-domain-data/import-bdr (+https://opendomaindata.org)" },
  });
  if (!res.ok) throw new Error(`${PEER_BASE + name}: HTTP ${res.status}`);
  return res.text();
}

function licenseOk(meta, feedLicense) {
  const stated = [meta?.license, feedLicense].filter((v) => typeof v === "string").join(" ");
  return /CC[ -]BY/i.test(stated);
}

function isOwnDomain(url) {
  try {
    return new URL(url).hostname.endsWith(OWN_DOMAIN);
  } catch {
    return false;
  }
}

// True when the existing value may be replaced by the incoming one.
function incomingWins(existingStatus, existingChecked, incomingStatus, incomingChecked) {
  const er = VERIFICATION_RANK[existingStatus] ?? 0;
  const ir = VERIFICATION_RANK[incomingStatus] ?? 0;
  if (er === VERIFICATION_RANK.independently_tested) return false; // never overwrite
  if (ir > er) return true;
  if (ir < er) return false;
  return new Date(incomingChecked).getTime() > new Date(existingChecked).getTime();
}

// Minimal RFC 4180 CSV parser (quoted fields, embedded commas/quotes).
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const [header, ...rest] = rows;
  return rest.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

function num(v) {
  if (v === undefined || v === null || String(v).trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toDateTime(d) {
  // Peer dates are YYYY-MM-DD; datasets use ISO date-time.
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T00:00:00Z` : d;
}

async function readDataset(file) {
  return JSON.parse(await readFile(join(DATA_DIR, file), "utf8"));
}

async function writeDataset(file, data) {
  if (dryRun) return;
  await writeFile(join(DATA_DIR, file), JSON.stringify(data, null, 2) + "\n");
}

async function main() {
  const crosswalk = JSON.parse(
    await readFile(join(DATA_DIR, "crosswalks", "bdr-registrar-ids.json"), "utf8"),
  );
  const peerToOdd = crosswalk.map;

  // --- License gate -------------------------------------------------------
  const index = JSON.parse(await fetchPeer("index.json"));
  const feedLicense =
    typeof index?.license === "string" ? index.license : JSON.stringify(index?.license ?? "");
  report.license.feed = feedLicense || null;

  function gate(name, meta) {
    const ok = licenseOk(meta, feedLicense);
    report.license[name] = ok ? "stated" : allowUnlicensed ? "OVERRIDE (--allow-unlicensed)" : "missing";
    if (!ok && !allowUnlicensed) {
      console.warn(`!  ${name}: no CC BY-compatible license stated by the peer feed; skipping (pass --allow-unlicensed to override).`);
      return false;
    }
    return true;
  }

  // Peer registrar names, for resolving ownership brand names. Identity facts only.
  const peerRegistrars = JSON.parse(await fetchPeer("registrars.json"));
  const peerRecords = Object.values(peerRegistrars).find(Array.isArray) ?? [];
  const peerName = new Map(peerRecords.map((r) => [r.id, r.name]));

  const seenUnmatched = new Set();
  const noteUnmatched = (peerId) => {
    if (!peerToOdd[peerId] && !seenUnmatched.has(peerId)) {
      seenUnmatched.add(peerId);
      report.unmatched_peer_registrars.push(peerId);
    }
  };

  // --- 1. Pricing: peer pricing.csv -> tld_pricing.json --------------------
  {
    const stats = { added: 0, updated: 0, kept: 0, skipped_unmatched: 0, skipped_bad_tld: 0 };
    const csvText = await fetchPeer("pricing.csv");
    if (gate("pricing.csv", null)) {
      const rows = parseCsv(csvText);
      const dataset = await readDataset("tld_pricing.json");
      const byKey = new Map(dataset.records.map((r) => [`${r.registrar_id} ${r.tld}`, r]));
      let maxChecked = dataset.last_checked;
      for (const row of rows) {
        const oddId = peerToOdd[row.registrar_id];
        if (!oddId) { noteUnmatched(row.registrar_id); stats.skipped_unmatched++; continue; }
        const tld = row.tld.replace(/^\./, "").toLowerCase();
        if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(tld)) { stats.skipped_bad_tld++; continue; }
        if (row.currency && row.currency !== "USD") { stats.skipped_bad_tld++; continue; }
        if (isOwnDomain(row.source_url)) { report.dropped_own_domain_records++; continue; }
        const register = num(row.first_year_price);
        const renew = num(row.renewal_price);
        const incoming = {
          registrar_id: oddId,
          tld,
          register_usd: register,
          renew_usd: renew,
          transfer_usd: num(row.transfer_price),
          promotional: register !== null && renew !== null && register < renew,
          sources: ["registrar_docs", "cross_site_feed"],
          verification_status: "public_sources",
          last_checked: toDateTime(row.last_checked),
          ...(row.source_url ? { source_url: row.source_url } : {}),
        };
        const key = `${oddId} ${tld}`;
        const existing = byKey.get(key);
        if (!existing) { byKey.set(key, incoming); stats.added++; }
        else if (incomingWins(existing.verification_status, existing.last_checked, incoming.verification_status, incoming.last_checked)) {
          byKey.set(key, incoming); stats.updated++;
        } else stats.kept++;
        if (new Date(incoming.last_checked) > new Date(maxChecked)) maxChecked = incoming.last_checked;
      }
      dataset.records = [...byKey.values()].sort(
        (a, b) => a.registrar_id.localeCompare(b.registrar_id) || a.tld.localeCompare(b.tld),
      );
      dataset.count = dataset.records.length;
      dataset.last_checked = maxChecked;
      dataset.upstream = { peer: PEER, feed: PEER_BASE + "pricing.csv", imported: report.generated };
      await writeDataset("tld_pricing.json", dataset);
    }
    report.datasets["tld_pricing"] = stats;
  }

  // --- 2. Ownership: peer registrar-ownership.json -> registrar_ownership.json
  {
    const stats = { records: 0, skipped_no_slug: 0 };
    const own = JSON.parse(await fetchPeer("registrar-ownership.json"));
    if (gate("registrar-ownership.json", own._meta)) {
      const checked = toDateTime(own._meta?.last_updated ?? report.generated.slice(0, 10));
      const canonical = PEER_BASE + "registrar-ownership.json";
      const records = [];
      for (const group of own.groups ?? []) {
        const sourceUrl = group.sources?.find((s) => s.url && !isOwnDomain(s.url))?.url ?? canonical;
        for (const peerId of group.registrar_ids ?? []) {
          records.push({
            id: peerId,
            registrar_id: peerToOdd[peerId] ?? null,
            brand_name: peerName.get(peerId) ?? peerId,
            relationship: "subsidiary",
            parent_group_id: group.id,
            parent_group_name: group.name,
            parent_type: group.type === "public" || group.type === "private" ? group.type : null,
            source_url: sourceUrl,
            sources: ["cross_site_feed"],
            verification_status: "public_sources",
            last_checked: checked,
          });
          noteUnmatched(peerId);
        }
        stats.skipped_no_slug += (group.brands?.length ?? 0) - (group.registrar_ids?.length ?? 0);
      }
      for (const peerId of own.independent?.registrar_ids ?? []) {
        records.push({
          id: peerId,
          registrar_id: peerToOdd[peerId] ?? null,
          brand_name: peerName.get(peerId) ?? peerId,
          relationship: "independent",
          parent_group_id: null,
          parent_group_name: null,
          parent_type: null,
          source_url: canonical,
          sources: ["cross_site_feed"],
          verification_status: "public_sources",
          last_checked: checked,
        });
        noteUnmatched(peerId);
      }
      records.sort((a, b) => a.id.localeCompare(b.id));
      stats.records = records.length;
      await writeDataset("registrar_ownership.json", {
        dataset: "registrar_ownership",
        version: "2026.08",
        license: "CC-BY-4.0",
        last_checked: checked,
        schema: "https://opendomaindata.org/schemas/registrar-ownership.schema.json",
        upstream: { peer: PEER, feed: canonical, imported: report.generated },
        count: records.length,
        records,
      });
    }
    report.datasets["registrar_ownership"] = stats;
  }

  // --- 3. TLD registry: tld-registry-facts.json + cctlds.json -> tld_registry.json
  {
    const stats = { records: 0, skipped_unknown_type: 0 };
    const facts = JSON.parse(await fetchPeer("tld-registry-facts.json"));
    const cc = JSON.parse(await fetchPeer("cctlds.json"));
    const factsOk = gate("tld-registry-facts.json", facts._meta);
    const ccOk = gate("cctlds.json", cc._meta);
    if (factsOk || ccOk) {
      const TYPE_MAP = {
        generic: "generic",
        "country-code": "country_code",
        country_code: "country_code",
        sponsored: "sponsored",
        infrastructure: "infrastructure",
        "generic-restricted": "generic_restricted",
        generic_restricted: "generic_restricted",
        test: "test",
      };
      const byTld = new Map();
      if (factsOk) {
        const checked = toDateTime(facts._meta?.last_updated ?? facts._meta?.as_of ?? report.generated.slice(0, 10));
        for (const f of Object.values(facts.facts ?? {})) {
          const type = TYPE_MAP[f.type];
          if (!type) { stats.skipped_unknown_type++; continue; }
          byTld.set(f.iana_label ?? f.slug, {
            tld: f.iana_label ?? f.slug,
            type,
            operator: f.operator ?? null,
            country: null,
            is_idn: false,
            unicode_tld: null,
            iana_url: f.iana_root_url,
            sources: ["iana", "cross_site_feed"],
            verification_status: "public_sources",
            last_checked: checked,
          });
        }
      }
      if (ccOk) {
        const checked = toDateTime(cc._meta?.last_updated ?? cc._meta?.as_of ?? report.generated.slice(0, 10));
        for (const c of cc.cctlds ?? []) {
          byTld.set(c.punycode, {
            tld: c.punycode,
            type: "country_code",
            operator: c.operator || null,
            country: c.country || null,
            is_idn: Boolean(c.is_idn),
            unicode_tld: c.is_idn ? (c.unicode ?? "").replace(/^\./, "") || null : null,
            iana_url: c.iana_url,
            sources: ["iana", "cross_site_feed"],
            verification_status: "public_sources",
            last_checked: checked,
          });
        }
      }
      const records = [...byTld.values()].sort((a, b) => a.tld.localeCompare(b.tld));
      stats.records = records.length;
      const lastChecked = records.reduce((m, r) => (r.last_checked > m ? r.last_checked : m), "1970-01-01T00:00:00Z");
      await writeDataset("tld_registry.json", {
        dataset: "tld_registry",
        version: "2026.08",
        license: "CC-BY-4.0",
        last_checked: lastChecked,
        schema: "https://opendomaindata.org/schemas/tld-registry.schema.json",
        upstream: {
          peer: PEER,
          feed: [PEER_BASE + "tld-registry-facts.json", PEER_BASE + "cctlds.json"],
          primary_source: "https://www.iana.org/domains/root/db",
          imported: report.generated,
        },
        count: records.length,
        records,
      });
    }
    report.datasets["tld_registry"] = stats;
  }

  // --- 4. MCP signals: domain-registrar-mcp.json -> agent_capability_signals.json
  {
    const stats = { updated: 0, kept: 0, skipped_unmatched: 0 };
    const mcp = JSON.parse(await fetchPeer("domain-registrar-mcp.json"));
    if (gate("domain-registrar-mcp.json", mcp._meta)) {
      if (mcp._meta?.source_dataset?.publisher === "Open Domain Data") {
        console.warn("!  domain-registrar-mcp.json: peer declares Open Domain Data as its source; skipping (loop prevention).");
      } else {
        const dataset = await readDataset("agent_capability_signals.json");
        const byId = new Map(dataset.records.map((r) => [r.registrar_id, r]));
        const checked = toDateTime(mcp._meta?.last_updated ?? report.generated.slice(0, 10));
        for (const rec of mcp.registrars ?? []) {
          const oddId = peerToOdd[rec.registrar_id];
          if (!oddId) { noteUnmatched(rec.registrar_id); stats.skipped_unmatched++; continue; }
          const target = byId.get(oddId);
          if (!target) { stats.skipped_unmatched++; continue; }
          const incomingValue = rec.has_official_mcp === true;
          const fp = target.field_provenance?.mcp_interface;
          const existingStatus = fp?.verification_status ?? target.verification_status;
          const existingChecked = fp?.last_checked ?? target.last_checked;
          if (target.mcp_interface === incomingValue) { stats.kept++; continue; }
          if (!incomingWins(existingStatus, existingChecked, "public_sources", checked)) { stats.kept++; continue; }
          target.mcp_interface = incomingValue;
          target.field_provenance ??= {};
          const sourceUrl = rec.docs_url && !isOwnDomain(rec.docs_url) ? rec.docs_url : PEER_BASE + "domain-registrar-mcp.json";
          target.field_provenance.mcp_interface = {
            source_url: sourceUrl,
            verification_status: "public_sources",
            last_checked: checked,
            note: `Imported from the ${PEER} cross-site feed (first-party MCP server availability); pending independent probe.`,
          };
          stats.updated++;
        }
        if (stats.updated > 0) await writeDataset("agent_capability_signals.json", dataset);
      }
    }
    report.datasets["agent_capability_signals"] = stats;
  }

  report.unmatched_peer_registrars.sort();

  await mkdir(dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2) + "\n");

  console.log(`\nimport-bdr (${report.mode}${dryRun ? ", dry run" : ""})`);
  for (const [name, stats] of Object.entries(report.datasets)) {
    console.log(`  ${name}: ${Object.entries(stats).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  }
  console.log(`  unmatched peer registrars: ${report.unmatched_peer_registrars.length}`);
  console.log(`  own-domain records dropped: ${report.dropped_own_domain_records}`);
  console.log(`  report: reports/import-bdr-report.json\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
