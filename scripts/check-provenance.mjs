#!/usr/bin/env node
/**
 * Provenance freshness & hygiene checks for the Open Domain Data datasets.
 *
 * Open Domain Data's contract is that every published value carries a source,
 * a verification status and a date. Per-field provenance (field_provenance)
 * makes that contract machine-checkable. This script is the enforcement: it
 * walks every dataset under /data, collects each field_provenance entry, and
 * checks two things.
 *
 *  1. Hygiene (offline, always run):
 *     - source_url is a well-formed http(s) URL
 *     - verification_status is one of the documented statuses
 *     - last_checked is a valid ISO-8601 date that is not in the future
 *     - last_checked is not older than the staleness window (a warning)
 *
 *  2. Liveness (network, --check-urls / --strict):
 *     - each distinct source_url is fetched and classified live / protected /
 *       dead / unreachable, grouped by source domain.
 *
 * It only reads the datasets; it never edits them. A machine-readable report is
 * written to reports/provenance-status.json so the result is itself an
 * auditable artifact.
 *
 * Usage:
 *   node scripts/check-provenance.mjs              # hygiene checks only (offline)
 *   node scripts/check-provenance.mjs --check-urls # also fetch each source URL
 *   node scripts/check-provenance.mjs --strict     # check URLs and fail on dead links
 *   node scripts/check-provenance.mjs --json       # machine-readable report to stdout
 *
 * Exit code is non-zero if any hygiene check fails, or (in --strict) if any
 * cited source URL is dead, so this can gate CI and run on a schedule to catch
 * source rot as the datasets grow past the initial sample.
 */
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url)) + "/..";
const DATA_DIR = join(root, "data");
const REPORT_PATH = join(root, "reports", "provenance-status.json");

// The documented verification statuses (see README / methodology). Provenance
// must use one of these; anything else is a typo or an undocumented status.
const VERIFICATION_STATUSES = new Set([
  "unknown",
  "public_sources",
  "independently_tested",
  "registrar_submitted",
  "registrar_verified",
  "deprecated",
]);

// A source older than this many days is flagged for re-verification (warning,
// not a failure — facts do not rot on a fixed clock, but they deserve a look).
const STALE_DAYS = 180;

const args = new Set(process.argv.slice(2));
const asJson = args.has("--json");
const strict = args.has("--strict");
const checkUrls = strict || args.has("--check-urls");

const now = new Date();

function isHttpUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function domainOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "(invalid)";
  }
}

function daysBetween(a, b) {
  return Math.floor((a.getTime() - b.getTime()) / 86_400_000);
}

// Collect every field_provenance entry across all datasets, with enough context
// (dataset, record, field) to point a maintainer straight at the problem.
async function collectProvenance() {
  const files = (await readdir(DATA_DIR)).filter((f) => f.endsWith(".json")).sort();
  const entries = [];
  for (const file of files) {
    const dataset = file.replace(/\.json$/, "");
    let parsed;
    try {
      parsed = JSON.parse(await readFile(join(DATA_DIR, file), "utf8"));
    } catch (err) {
      throw new Error(`${file}: invalid JSON (${String(err)})`);
    }
    const records = Array.isArray(parsed) ? parsed : parsed.records ?? [];
    for (const rec of records) {
      const recordId = rec.id ?? rec.iana_id ?? rec.registrar_id ?? rec.slug ?? "(unkeyed)";
      const fp = rec.field_provenance;
      if (!fp || typeof fp !== "object") continue;
      for (const [field, prov] of Object.entries(fp)) {
        entries.push({ dataset, record: String(recordId), field, prov: prov ?? {} });
      }
    }
  }
  return { files, entries };
}

function runHygiene(entries) {
  const problems = [];
  const stale = [];
  for (const e of entries) {
    const where = `${e.dataset}/${e.record}.${e.field}`;
    const { source_url, verification_status, last_checked } = e.prov;

    if (!isHttpUrl(source_url)) {
      problems.push({ where, kind: "bad_source_url", detail: `source_url is not a valid http(s) URL: ${JSON.stringify(source_url)}` });
    }
    if (!VERIFICATION_STATUSES.has(verification_status)) {
      problems.push({ where, kind: "bad_status", detail: `verification_status not recognized: ${JSON.stringify(verification_status)}` });
    }

    const checked = last_checked ? new Date(last_checked) : null;
    if (!checked || Number.isNaN(checked.getTime())) {
      problems.push({ where, kind: "bad_last_checked", detail: `last_checked is not a valid date: ${JSON.stringify(last_checked)}` });
    } else if (checked.getTime() > now.getTime()) {
      problems.push({ where, kind: "future_last_checked", detail: `last_checked is in the future: ${last_checked}` });
    } else {
      const age = daysBetween(now, checked);
      if (age > STALE_DAYS) stale.push({ where, age, last_checked });
    }
  }
  return { problems, stale };
}

async function probeUrl(url) {
  // Prefer a lightweight GET (HEAD is rejected by many CDNs). Classify the
  // result so anti-bot 403s are not mistaken for genuinely dead links.
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        accept: "text/html,application/json,*/*",
        "user-agent": "open-domain-data/check-provenance (+https://opendomaindata.org)",
      },
    });
    const s = res.status;
    if (s >= 200 && s < 400) return { state: "live", http_status: s };
    if (s === 401 || s === 403 || s === 429) return { state: "protected", http_status: s, detail: "reachable but bot-protected / rate-limited" };
    if (s === 404 || s === 410) return { state: "dead", http_status: s, detail: "not found" };
    return { state: "unreachable", http_status: s, detail: `unexpected status ${s}` };
  } catch (err) {
    return { state: "unreachable", detail: `network/transport error: ${String(err)}` };
  }
}

async function runLiveness(entries) {
  const urls = [...new Set(entries.map((e) => e.prov.source_url).filter(isHttpUrl))];
  const byUrl = {};
  for (const url of urls) byUrl[url] = await probeUrl(url);
  const byDomain = {};
  for (const e of entries) {
    const url = e.prov.source_url;
    if (!isHttpUrl(url)) continue;
    const dom = domainOf(url);
    (byDomain[dom] ??= { domain: dom, urls: new Set(), citations: 0 });
    byDomain[dom].urls.add(url);
    byDomain[dom].citations++;
  }
  const domains = Object.values(byDomain)
    .map((d) => ({ domain: d.domain, distinct_urls: d.urls.size, citations: d.citations }))
    .sort((a, b) => b.citations - a.citations);
  const dead = urls.filter((u) => byUrl[u].state === "dead");
  return { urls, byUrl, domains, dead };
}

async function main() {
  const { files, entries } = await collectProvenance();
  const hygiene = runHygiene(entries);

  let liveness = null;
  if (checkUrls) liveness = await runLiveness(entries);

  const report = {
    generated: now.toISOString(),
    datasets_scanned: files.length,
    provenance_entries: entries.length,
    distinct_source_domains: liveness ? liveness.domains.length : null,
    distinct_source_urls: liveness ? liveness.urls.length : null,
    hygiene_problems: hygiene.problems,
    stale: hygiene.stale,
    stale_window_days: STALE_DAYS,
    domains: liveness ? liveness.domains : null,
    url_status: liveness
      ? Object.fromEntries(liveness.urls.map((u) => [u, liveness.byUrl[u]]))
      : null,
  };

  await mkdir(dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2) + "\n");

  if (asJson) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    console.log("\n  Open Domain Data — provenance freshness & hygiene");
    console.log("  " + "=".repeat(70));
    console.log(`  datasets scanned:    ${files.length}`);
    console.log(`  provenance entries:  ${entries.length}`);
    if (liveness) {
      console.log(`  source domains:      ${liveness.domains.length}`);
      for (const d of liveness.domains) {
        console.log(`    - ${d.domain.padEnd(34)} ${d.distinct_urls} url(s), ${d.citations} citation(s)`);
      }
      const counts = liveness.urls.reduce((m, u) => ((m[liveness.byUrl[u].state] = (m[liveness.byUrl[u].state] ?? 0) + 1), m), {});
      console.log(`  url liveness:        ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(", ") || "n/a"}`);
      for (const u of liveness.urls) {
        const st = liveness.byUrl[u];
        if (st.state !== "live") console.log(`    [${st.state}] ${u}${st.http_status ? ` (${st.http_status})` : ""}`);
      }
    } else {
      console.log("  url liveness:        skipped (pass --check-urls or --strict)");
    }
    console.log(`  hygiene problems:    ${hygiene.problems.length}`);
    for (const p of hygiene.problems) console.log(`    [${p.kind}] ${p.where} — ${p.detail}`);
    console.log(`  stale (> ${STALE_DAYS}d):      ${hygiene.stale.length}`);
    for (const s of hygiene.stale) console.log(`    ${s.where} — last checked ${s.last_checked} (${s.age}d ago)`);
    console.log("  " + "=".repeat(70));
    console.log(`  report written to reports/provenance-status.json\n`);
  }

  const deadCount = liveness ? liveness.dead.length : 0;
  const fail = hygiene.problems.length > 0 || (strict && deadCount > 0);
  process.exit(fail ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
