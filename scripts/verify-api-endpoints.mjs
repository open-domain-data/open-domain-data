#!/usr/bin/env node
/**
 * API-endpoint verification for the registrar_api_capabilities dataset.
 *
 * Every record claims `api_available: true|false`. This script makes that claim
 * reproducible the way verify-rdap.mjs does for `rdap_base`: it probes each
 * registrar's documented API host and classifies what actually answers —
 *
 *   public_live    an unauthenticated request returned usable data (the API is
 *                  live AND needs no key for this endpoint, e.g. Porkbun's
 *                  public pricing endpoint). This is the evidence behind an
 *                  `independently_tested` status on that record's api_available.
 *   auth_required  the host answered but demanded credentials (401/403/auth
 *                  error). The API is live; it just needs a key. Still a useful
 *                  liveness signal and confirms the host is up.
 *   no_public_api  the record itself says api_available:false — nothing to probe.
 *   unreachable    DNS failure, timeout, or a transport error. Flagged, not
 *                  asserted dead (some hosts trip Node's TLS stack while curl
 *                  succeeds — same caveat verify-rdap.mjs documents).
 *
 * The probe targets below are the registrars' own documented API endpoints,
 * each with a source note. Only reads; it never edits the dataset.
 *
 * Usage:
 *   node scripts/verify-api-endpoints.mjs           # human-readable table
 *   node scripts/verify-api-endpoints.mjs --json    # machine-readable report
 *
 * Exit code is non-zero only on a real regression: a target we expect to be
 * publicly live (expect_public_live) whose host ANSWERED but no longer returns
 * public data (it now demands auth or errors). A transport failure (timeout /
 * DNS / TLS) is reported but never fails CI — network flake and sandboxed
 * runners must not turn into false alarms, the same caveat verify-rdap.mjs
 * documents. So this catches the one unauthenticated endpoint genuinely going
 * dark, without failing on the expected auth walls of every other registrar.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url)) + "/..";
const REPORT_PATH = join(root, "reports/api-endpoints-status.json");
const asJson = process.argv.includes("--json");
const TIMEOUT_MS = 20000;

/**
 * Documented, unauthenticated-reachable probe target per registrar. `url` is the
 * registrar's own API endpoint; `expect_public_live` marks the one endpoint we
 * expect to return data with no key (so its going dark is a CI failure). `note`
 * cites where the endpoint is documented. Registrars whose record says
 * api_available:false are skipped as no_public_api.
 */
const PROBES = {
  "cloudflare-registrar": {
    url: "https://api.cloudflare.com/client/v4/user",
    method: "GET",
    expect_public_live: false,
    note: "Cloudflare API base; the user endpoint requires an API token, so an unauthenticated call is expected to return an auth error while confirming the host is live.",
    source: "https://developers.cloudflare.com/api/",
  },
  namecheap: {
    url: "https://api.namecheap.com/xml.response",
    method: "GET",
    expect_public_live: false,
    note: "Namecheap API endpoint; requires ApiUser/ApiKey plus an allow-listed IP, so an unauthenticated call is expected to return an error response.",
    source: "https://www.namecheap.com/support/api/intro/",
  },
  porkbun: {
    url: "https://api.porkbun.com/api/json/v3/pricing/get",
    method: "POST",
    expect_public_live: true,
    note: "Porkbun's domain pricing endpoint returns the full TLD price list on an unauthenticated POST — the one public, keyless endpoint in the set.",
    source: "https://porkbun.com/api/json/v3/documentation",
  },
  godaddy: {
    url: "https://api.godaddy.com/v1/domains/available?domain=example.com",
    method: "GET",
    expect_public_live: false,
    note: "GoDaddy Domains API availability endpoint; requires an sso-key API credential (and 50+ domains for production), so an unauthenticated call is expected to return an auth error.",
    source: "https://developer.godaddy.com/doc/endpoint/domains",
  },
  dynadot: {
    url: "https://api.dynadot.com/api3.json",
    method: "GET",
    expect_public_live: false,
    note: "Dynadot API endpoint; requires a key parameter, so an unauthenticated call is expected to return an error.",
    source: "https://www.dynadot.com/domain/api",
  },
  spaceship: {
    url: "https://spaceship.dev/api/v1/domains",
    method: "GET",
    expect_public_live: false,
    note: "Spaceship API endpoint; requires X-API-Key/X-API-Secret headers, so an unauthenticated call is expected to return an auth error.",
    source: "https://docs.spaceship.dev/",
  },
};

function looksLikeData(body) {
  // Porkbun's public pricing response carries "status":"SUCCESS" and a "pricing" map.
  return /"status"\s*:\s*"SUCCESS"/i.test(body) || /"pricing"\s*:/.test(body);
}

function looksLikeAuthWall(status, body) {
  if (status === 401 || status === 403) return true;
  return /unauthor|forbidden|api[_-]?key|authentic|"errorCode"|"status"\s*:\s*"ERROR"|invalid key|missing key/i.test(
    body,
  );
}

async function probe(target) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(target.url, {
      method: target.method,
      headers: {
        accept: "application/json, application/xml;q=0.9, */*;q=0.8",
        "user-agent": "open-domain-data/verify-api-endpoints",
      },
      body: target.method === "POST" ? "{}" : undefined,
      signal: controller.signal,
    });
    const body = (await res.text()).slice(0, 4000);
    if (res.ok && looksLikeData(body)) {
      return { classification: "public_live", http_status: res.status, host_live: true };
    }
    if (looksLikeAuthWall(res.status, body)) {
      return { classification: "auth_required", http_status: res.status, host_live: true };
    }
    // Any HTTP answer at all still proves the host is up.
    return { classification: "auth_required", http_status: res.status, host_live: true, ambiguous: true };
  } catch (err) {
    return { classification: "unreachable", host_live: false, transport_error: String(err) };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const data = JSON.parse(
    await readFile(join(root, "data/registrar_api_capabilities.json"), "utf8"),
  );
  const results = [];
  let regressions = 0;
  let transport_failures = 0;

  for (const rec of data.records) {
    const target = PROBES[rec.registrar_id];
    if (!rec.api_available || !target) {
      results.push({
        registrar_id: rec.registrar_id,
        api_available: !!rec.api_available,
        classification: "no_public_api",
        note: target ? "record marks api_available:false" : "no documented probe target",
      });
      continue;
    }
    const p = await probe(target);
    // A regression is a host that ANSWERED but no longer serves the expected
    // public data. A transport failure (unreachable) is flagged, not fatal.
    if (target.expect_public_live && p.host_live && p.classification !== "public_live") regressions++;
    if (target.expect_public_live && !p.host_live) transport_failures++;
    results.push({
      registrar_id: rec.registrar_id,
      api_available: true,
      endpoint: target.url,
      method: target.method,
      expect_public_live: target.expect_public_live,
      source: target.source,
      note: target.note,
      ...p,
    });
  }

  const report = { generated: new Date().toISOString(), regressions, transport_failures, results };

  if (asJson) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    console.log("\n  API-endpoint verification (data/registrar_api_capabilities.json)");
    console.log("  " + "=".repeat(74));
    for (const r of results) {
      const tag =
        r.classification === "public_live"
          ? "public-live"
          : r.classification === "auth_required"
            ? "auth-req  "
            : r.classification === "no_public_api"
              ? "no-api    "
              : "unreach   ";
      const flag =
        r.expect_public_live && r.host_live && r.classification !== "public_live"
          ? "REGRESSION"
          : r.expect_public_live && !r.host_live
            ? "transport"
            : "ok";
      console.log(
        `  ${flag.padEnd(11)} ${tag} ${String(r.registrar_id).padEnd(22)} ${r.http_status ?? ""}`,
      );
      if (r.transport_error) console.log(`        transport: ${r.transport_error}`);
    }
    console.log("  " + "=".repeat(74));
    console.log(
      `  ${results.length} records, ${regressions} regression(s), ${transport_failures} transport failure(s) on expected public endpoints.\n`,
    );
  }

  await mkdir(dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2) + "\n");

  process.exit(regressions > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
