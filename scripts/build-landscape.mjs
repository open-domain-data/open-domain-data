#!/usr/bin/env node
/**
 * Build the registrar_landscape dataset — a quarterly, derived snapshot of
 * aggregate capability statistics across the registrar set Open Domain Data
 * currently tracks.
 *
 * Every stat is COMPUTED from the primary datasets under /data (never typed by
 * hand), so the numbers are reproducible: anyone can re-run this script and get
 * the same file. That reproducibility is the point — a landscape stat is only
 * worth citing if it can be regenerated from the neutral source records.
 *
 * The dataset reports facts, not rankings. It counts how many tracked
 * registrars have a capability; it never scores, orders or recommends them.
 * Interpretation belongs to a separate product (see README → "Where rankings
 * live"). Coverage is small and explicit: percentages describe the tracked
 * sample, not the whole registrar industry.
 *
 * Usage:
 *   node scripts/build-landscape.mjs           # write data/registrar_landscape.{json,csv}
 *   node scripts/build-landscape.mjs --check    # recompute and fail if the committed file drifted
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url)) + "/..";
const dataDir = join(root, "data");

const EDITION = "2026-Q3";
const CADENCE = "quarterly";
const LAST_CHECKED = "2026-07-04T00:00:00Z";
const BASE = "https://opendomaindata.org";
const CANONICAL_PREFIX = `${BASE}/landscape/${EDITION.toLowerCase()}`;

async function load(name) {
  const raw = JSON.parse(await readFile(join(dataDir, `${name}.json`), "utf8"));
  const byId = {};
  for (const rec of raw.records) byId[rec.registrar_id ?? rec.id] = rec;
  return { version: raw.version, byId };
}

/** Ordered registrar ids, read from registrars.json so the sample order is stable. */
async function trackedIds() {
  const raw = JSON.parse(await readFile(join(dataDir, "registrars.json"), "utf8"));
  return raw.records.map((r) => r.id);
}

function statement(numerator, denominator, subject) {
  const many = numerator === 1 ? "" : "s";
  const verb = numerator === 1 ? "does" : "do";
  void many;
  void verb;
  return `${numerator} of the ${denominator} registrars tracked by Open Domain Data ${subject}.`;
}

async function build() {
  const ids = await trackedIds();
  const N = ids.length;
  const api = await load("registrar_api_capabilities");
  const dns = await load("dns_capabilities");
  const agent = await load("agent_capability_signals");
  const sec = await load("registrar_security_contacts");
  const rdap = await load("rdap_metadata");

  const records = [];

  /** Split the tracked ids by a predicate into a yes/no breakdown and emit a boolean-share stat. */
  const boolStat = ({ id, headline, metric, unit, subject, ds, field, test, methodology }) => {
    const yes = ids.filter((rid) => test(ds.byId[rid]));
    const no = ids.filter((rid) => !test(ds.byId[rid]));
    records.push({
      id,
      edition: EDITION,
      headline: Boolean(headline),
      metric,
      statement: statement(yes.length, N, subject),
      value: `${yes.length} of ${N}`,
      numerator: yes.length,
      denominator: N,
      percent: Math.round((yes.length / N) * 1000) / 10,
      unit,
      methodology,
      computed_from: [{ dataset: ds.name, version: ds.version, field }],
      breakdown: { yes, no },
      canonical_url: `${CANONICAL_PREFIX}/${id}`,
    });
  };

  api.name = "registrar_api_capabilities";
  dns.name = "dns_capabilities";
  agent.name = "agent_capability_signals";
  sec.name = "registrar_security_contacts";
  rdap.name = "rdap_metadata";

  // ---- Headline stats: how ready is the tracked registrar set for AI agents? ----
  boolStat({
    id: "public-api-coverage", headline: true,
    metric: "Public domain-management API", unit: "registrars",
    subject: "expose a public domain-management API",
    ds: api, field: "api_available", test: (r) => r?.api_available === true,
    methodology: "Count where api_available = true in registrar_api_capabilities.",
  });
  boolStat({
    id: "oauth-support", headline: true,
    metric: "OAuth 2.0 API authentication", unit: "registrars",
    subject: "authenticate their API with OAuth 2.0 (the rest use a static API key)",
    ds: api, field: "oauth_support", test: (r) => r?.oauth_support === true,
    methodology: "Count where oauth_support = true in registrar_api_capabilities.",
  });
  boolStat({
    id: "scoped-api-tokens", headline: true,
    metric: "Scoped API tokens", unit: "registrars",
    subject: "support scoped API tokens (a delegated agent can be granted less than full account access)",
    ds: api, field: "scoped_tokens", test: (r) => r?.scoped_tokens === true,
    methodology: "Count where scoped_tokens = true in registrar_api_capabilities.",
  });
  boolStat({
    id: "openapi-spec", headline: true,
    metric: "Machine-readable OpenAPI spec", unit: "registrars",
    subject: "publish a machine-readable OpenAPI specification for their API",
    ds: api, field: "openapi_spec", test: (r) => Boolean(r?.openapi_spec),
    methodology: "Count where openapi_spec is a non-empty URL in registrar_api_capabilities.",
  });
  boolStat({
    id: "mcp-interface", headline: true,
    metric: "Native agent (MCP) interface", unit: "registrars",
    subject: "expose a native agent interface over the Model Context Protocol (MCP)",
    ds: agent, field: "mcp_interface", test: (r) => r?.mcp_interface === true,
    methodology: "Count where mcp_interface = true in agent_capability_signals.",
  });

  // ---- Supporting stats: agent-safety and DNS/RDAP infrastructure context ----
  boolStat({
    id: "sandbox-environment", headline: false,
    metric: "API sandbox / test environment", unit: "registrars",
    subject: "publish an API sandbox or test environment",
    ds: agent, field: "sandbox", test: (r) => r?.sandbox === true,
    methodology: "Count where sandbox = true in agent_capability_signals.",
  });
  boolStat({
    id: "account-audit-logs", headline: false,
    metric: "Account audit logs", unit: "registrars",
    subject: "expose account-level audit logs (so automated actions leave a reviewable trail)",
    ds: agent, field: "audit_logs", test: (r) => r?.audit_logs === true,
    methodology: "Count where audit_logs = true in agent_capability_signals.",
  });
  boolStat({
    id: "human-approval-flow", headline: false,
    metric: "Built-in human-approval flow", unit: "registrars",
    subject: "offer a built-in human-approval or spend-limit flow for API-initiated actions",
    ds: agent, field: "human_approval_flow", test: (r) => r?.human_approval_flow === true,
    methodology: "Count where human_approval_flow = true in agent_capability_signals.",
  });
  boolStat({
    id: "dns-api-management", headline: false,
    metric: "DNS records editable via API", unit: "registrars",
    subject: "let you manage DNS records programmatically via API",
    ds: dns, field: "api_record_management", test: (r) => r?.api_record_management === true,
    methodology: "Count where api_record_management = true in dns_capabilities.",
  });

  // DNSSEC — three-way breakdown (full / partial / none), reported as "any support".
  {
    const full = ids.filter((rid) => dns.byId[rid]?.dnssec === "supported");
    const partial = ids.filter((rid) => dns.byId[rid]?.dnssec === "partial");
    const none = ids.filter((rid) => dns.byId[rid]?.dnssec === "unsupported");
    const any = full.length + partial.length;
    records.push({
      id: "dnssec-support", edition: EDITION, headline: false,
      metric: "DNSSEC support",
      statement: `${any} of the ${N} registrars tracked by Open Domain Data support DNSSEC (${full.length} fully, ${partial.length} partially).`,
      value: `${any} of ${N}`,
      numerator: any, denominator: N, percent: Math.round((any / N) * 1000) / 10,
      unit: "registrars",
      methodology: "Count where dnssec is 'supported' (full) or 'partial' in dns_capabilities.",
      computed_from: [{ dataset: "dns_capabilities", version: dns.version, field: "dnssec" }],
      breakdown: { full, partial, none },
      canonical_url: `${CANONICAL_PREFIX}/dnssec-support`,
    });
  }

  // RDAP conformance — IANA-bootstrapped + rfc7483.
  {
    const yes = ids.filter((rid) => {
      const r = rdap.byId[rid];
      return r?.iana_bootstrapped === true && String(r?.conformance).includes("rfc7483");
    });
    const no = ids.filter((rid) => !yes.includes(rid));
    records.push({
      id: "rdap-conformance", edition: EDITION, headline: false,
      metric: "IANA-bootstrapped RDAP endpoint",
      statement: statement(yes.length, N, "expose an IANA-bootstrapped, RFC 7483-conformant RDAP endpoint"),
      value: `${yes.length} of ${N}`,
      numerator: yes.length, denominator: N, percent: Math.round((yes.length / N) * 1000) / 10,
      unit: "registrars",
      methodology: "Count where iana_bootstrapped = true and conformance includes rfc7483 in rdap_metadata.",
      computed_from: [{ dataset: "rdap_metadata", version: rdap.version, field: "iana_bootstrapped" }],
      breakdown: { yes, no },
      canonical_url: `${CANONICAL_PREFIX}/rdap-conformance`,
    });
  }

  // security.txt (RFC 9116) — present / absent / unknown.
  {
    const present = ids.filter((rid) => sec.byId[rid]?.security_txt === "present");
    const absent = ids.filter((rid) => sec.byId[rid]?.security_txt === "absent");
    const unknown = ids.filter((rid) => sec.byId[rid]?.security_txt === "unknown");
    records.push({
      id: "security-txt", edition: EDITION, headline: false,
      metric: "RFC 9116 security.txt",
      statement: `${present.length} of the ${N} registrars tracked by Open Domain Data publish an RFC 9116 security.txt (${absent.length} do not; ${unknown.length} could not be determined).`,
      value: `${present.length} of ${N}`,
      numerator: present.length, denominator: N, percent: Math.round((present.length / N) * 1000) / 10,
      unit: "registrars",
      methodology: "Count where security_txt = 'present' in registrar_security_contacts.",
      computed_from: [{ dataset: "registrar_security_contacts", version: sec.version, field: "security_txt" }],
      breakdown: { present, absent, unknown },
      canonical_url: `${CANONICAL_PREFIX}/security-txt`,
    });
  }

  // Minimum DNS TTL — median across the tracked set.
  {
    const pairs = ids.map((rid) => [rid, dns.byId[rid]?.ttl_min_seconds]).filter(([, v]) => typeof v === "number");
    const values = pairs.map(([, v]) => v).sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    const median = values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
    const byValue = {};
    for (const [rid, v] of pairs) (byValue[String(v)] ??= []).push(rid);
    records.push({
      id: "min-dns-ttl-median", edition: EDITION, headline: false,
      metric: "Minimum DNS TTL (median)",
      statement: `The median minimum DNS TTL across the ${N} registrars tracked by Open Domain Data is ${median} seconds (range ${values[0]}–${values[values.length - 1]}).`,
      value: `${median} s (median)`,
      numerator: median, denominator: null, percent: null,
      unit: "seconds",
      methodology: "Median of ttl_min_seconds across the tracked registrar set in dns_capabilities.",
      computed_from: [{ dataset: "dns_capabilities", version: dns.version, field: "ttl_min_seconds" }],
      breakdown: byValue,
      canonical_url: `${CANONICAL_PREFIX}/min-dns-ttl-median`,
    });
  }

  const dataset = {
    dataset: "registrar_landscape",
    version: EDITION,
    edition: EDITION,
    cadence: CADENCE,
    license: "CC-BY-4.0",
    schema: `${BASE}/schemas/registrar-landscape.schema.json`,
    coverage: {
      tracked_registrars: N,
      registrar_ids: ids,
      note: "Every statistic is computed over the registrars Open Domain Data currently tracks. It describes this tracked sample, not the whole registrar industry. As coverage grows each quarter, the sample becomes more representative.",
    },
    last_checked: LAST_CHECKED,
    count: records.length,
    records,
  };

  return dataset;
}

function toCsv(dataset) {
  const cols = [
    "id", "edition", "headline", "metric", "value", "numerator", "denominator",
    "percent", "unit", "statement", "methodology", "computed_from", "canonical_url",
  ];
  const esc = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.join(",")];
  for (const r of dataset.records) {
    const from = r.computed_from.map((c) => `${c.dataset}@${c.version}:${c.field}`).join("|");
    lines.push(cols.map((c) => esc(c === "computed_from" ? from : r[c])).join(","));
  }
  return lines.join("\n") + "\n";
}

const dataset = await build();
const json = JSON.stringify(dataset, null, 2) + "\n";
const csv = toCsv(dataset);
const jsonPath = join(dataDir, "registrar_landscape.json");
const csvPath = join(dataDir, "registrar_landscape.csv");

if (process.argv.includes("--check")) {
  const current = await readFile(jsonPath, "utf8").catch(() => "");
  if (current !== json) {
    console.error("x  registrar_landscape.json is out of date — run `npm run build:landscape` and commit the result.");
    process.exit(1);
  }
  console.log(`ok registrar_landscape: committed file matches a fresh computation (${dataset.count} stats).`);
} else {
  await writeFile(jsonPath, json);
  await writeFile(csvPath, csv);
  console.log(`build-landscape: wrote ${dataset.count} stats for ${EDITION} to data/registrar_landscape.{json,csv}`);
}
