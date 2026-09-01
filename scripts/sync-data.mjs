#!/usr/bin/env node
/**
 * Mirror canonical /data and /schemas into /public/api and /public/schemas
 * so the static site serves the same files contributors edit. Runs on prebuild.
 *
 * Run manually: `node scripts/sync-data.mjs`
 */
import { mkdir, copyFile, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url)) + "/..";

const PAIRS = [
  { from: join(root, "data"), to: join(root, "public/api") },
  { from: join(root, "schemas"), to: join(root, "public/schemas") },
];

async function mirror({ from, to }) {
  await mkdir(to, { recursive: true });
  // Wipe destination so deletions in /data propagate to /public.
  for (const entry of await readdir(to, { withFileTypes: true })) {
    if (entry.isFile()) await rm(join(to, entry.name));
  }
  let count = 0;
  for (const entry of await readdir(from, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    await copyFile(join(from, entry.name), join(to, entry.name));
    count++;
  }
  return count;
}

const results = await Promise.all(PAIRS.map(mirror));
console.log(`sync-data: copied ${results.reduce((a, b) => a + b, 0)} files`);

// Sync manifest: one machine-readable summary of every published dataset file
// (name, version, count, byte size, sha256), served at /api/sync-manifest.json.
// Consumers of this catalog can diff their copy against it to detect drift.
// Generated, never committed — /public/api is a build-time mirror.
async function buildManifest() {
  const dataDir = join(root, "data");
  const files = (await readdir(dataDir, { withFileTypes: true }))
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .sort();
  const datasets = [];
  for (const name of files) {
    const raw = await readFile(join(dataDir, name));
    const entry = {
      file: name,
      url: `https://opendomaindata.org/api/${name}`,
      bytes: raw.length,
      sha256: createHash("sha256").update(raw).digest("hex"),
    };
    if (name.endsWith(".json")) {
      try {
        const parsed = JSON.parse(raw.toString("utf8"));
        entry.dataset = parsed.dataset ?? null;
        entry.version = parsed.version ?? parsed.edition ?? null;
        entry.count = parsed.count ?? (Array.isArray(parsed.records) ? parsed.records.length : null);
        entry.last_checked = parsed.last_checked ?? null;
        entry.license = parsed.license ?? null;
      } catch {
        /* non-dataset JSON: leave the file entry as bytes+hash only */
      }
    }
    datasets.push(entry);
  }
  const manifest = { site: "https://opendomaindata.org", generated_at: new Date().toISOString(), count: datasets.length, datasets };
  await writeFile(join(root, "public/api/sync-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  return datasets.length;
}

console.log(`sync-data: wrote sync-manifest.json (${await buildManifest()} files)`);
