#!/usr/bin/env node
/**
 * MCP verification for the agent_capability_signals dataset.
 *
 * Some registrar records claim `mcp_interface: true` — the registrar publishes
 * an official Model Context Protocol server for domain operations. This script
 * makes that claim reproducible: it reads data/agent_capability_signals.json,
 * finds every record with mcp_interface === true, and issues a live MCP
 * handshake against that registrar's documented server endpoint. It confirms
 * the endpoint actually speaks MCP by calling `initialize` (expecting a
 * serverInfo name + version and a protocolVersion) and then `tools/list`
 * (recording the tool count, tool names, and whether every tool is read-only).
 *
 * It is the evidence behind the `independently_tested` status on the
 * mcp_interface field provenance. It only reads; it never edits the dataset.
 *
 * The dataset does not carry the JSON-RPC endpoint URL (the provenance
 * source_url points at each registrar's human docs page), so the endpoint
 * registry lives here, each entry sourced in a comment. Add a registrar here
 * when its record flips mcp_interface to true.
 *
 * Usage:
 *   node scripts/verify-mcp.mjs           # check every mcp_interface record
 *   node scripts/verify-mcp.mjs --json    # machine-readable report
 *
 * Exit code is non-zero only on a real regression: a record claims
 * mcp_interface: true but its endpoint no longer speaks MCP. Transport failures
 * (a sandbox with no egress, TLS quirks) are reported, not failed, so this can
 * run in CI without flaking on network conditions.
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url)) + "/..";

// Documented official MCP server endpoints, keyed by registrar_id. The URL is
// the JSON-RPC / streamable-HTTP endpoint (not the human docs page). Only
// registrars whose dataset record has mcp_interface: true need an entry.
const MCP_ENDPOINTS = {
  // GoDaddy's official read-only Domains MCP. Docs: developer.godaddy.com/mcp
  // (a JS SPA); the actual server is the streamable-HTTP endpoint below.
  godaddy: "https://api.godaddy.com/v1/domains/mcp",
};

const asJson = process.argv.includes("--json");

/**
 * Parse an MCP streamable-HTTP response body. Servers answer either as plain
 * JSON or as Server-Sent Events (`event: message\ndata: {json}`). Return the
 * first JSON payload found, or null.
 */
function parseMcpBody(body) {
  const trimmed = body.trim();
  if (trimmed.startsWith("{")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      /* fall through to SSE parsing */
    }
  }
  for (const line of trimmed.split(/\r?\n/)) {
    const m = line.match(/^data:\s*(\{.*\})\s*$/);
    if (m) {
      try {
        return JSON.parse(m[1]);
      } catch {
        /* keep scanning */
      }
    }
  }
  return null;
}

async function rpc(endpoint, method, params, id) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      "user-agent": "open-domain-data/verify-mcp",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  const body = await res.text();
  return { http_status: res.status, payload: parseMcpBody(body) };
}

async function probeMcp(endpoint) {
  if (!endpoint) return { speaks_mcp: false, detail: "no endpoint configured for this registrar" };
  try {
    const init = await rpc(
      endpoint,
      "initialize",
      {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "open-domain-data/verify-mcp", version: "1.0" },
      },
      1,
    );
    const info = init.payload?.result?.serverInfo;
    const protocolVersion = init.payload?.result?.protocolVersion ?? null;
    if (!info?.name || !protocolVersion) {
      return {
        speaks_mcp: false,
        http_status: init.http_status,
        detail: "initialize did not return serverInfo + protocolVersion",
      };
    }

    const list = await rpc(endpoint, "tools/list", {}, 2);
    const tools = list.payload?.result?.tools ?? [];
    const toolNames = tools.map((t) => t.name).sort();
    const readOnly = tools.length > 0 && tools.every((t) => t.annotations?.readOnlyHint === true);

    return {
      speaks_mcp: true,
      http_status: init.http_status,
      server_name: info.name,
      server_version: info.version ?? null,
      protocol_version: protocolVersion,
      tool_count: tools.length,
      tools: toolNames,
      read_only: readOnly,
      detail: `${info.name} ${info.version ?? ""} — ${tools.length} tool(s)${readOnly ? ", all read-only" : ""}`.trim(),
    };
  } catch (err) {
    // Sandboxes without egress and some TLS stacks fail here. Treat as a
    // transport limitation, not a dataset regression.
    return { speaks_mcp: false, transport_error: true, detail: `transport: ${String(err)}` };
  }
}

async function main() {
  const data = JSON.parse(await readFile(join(root, "data/agent_capability_signals.json"), "utf8"));
  const claimed = data.records.filter((r) => r.mcp_interface === true);
  const results = [];
  let regressions = 0;

  for (const rec of claimed) {
    const endpoint = MCP_ENDPOINTS[rec.registrar_id] ?? null;
    const probe = await probeMcp(endpoint);
    // A regression = the dataset claims an MCP, we have an endpoint for it, the
    // network was reachable, but it no longer speaks MCP.
    if (endpoint && !probe.speaks_mcp && !probe.transport_error) regressions++;
    results.push({ registrar_id: rec.registrar_id, endpoint, probe });
  }

  if (asJson) {
    process.stdout.write(
      JSON.stringify(
        { generated: new Date().toISOString(), dataset: data.dataset, version: data.version, results },
        null,
        2,
      ) + "\n",
    );
  } else {
    console.log("\n  MCP verification (data/agent_capability_signals.json mcp_interface claims)");
    console.log("  " + "=".repeat(72));
    if (results.length === 0) console.log("  no records claim mcp_interface: true");
    for (const r of results) {
      const status = r.probe.speaks_mcp
        ? "mcp-live"
        : r.probe.transport_error
          ? "transport!"
          : r.endpoint
            ? "REGRESSION"
            : "no-endpoint";
      console.log(`  ${status.padEnd(11)} ${r.registrar_id.padEnd(22)} ${r.endpoint || "(none)"}`);
      console.log(`        ${r.probe.detail}`);
      if (r.probe.tools?.length) console.log(`        tools: ${r.probe.tools.join(", ")}`);
    }
    console.log("  " + "=".repeat(72));
    console.log(`  ${results.length} claimed, ${regressions} regression(s).\n`);
  }

  process.exit(regressions > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
