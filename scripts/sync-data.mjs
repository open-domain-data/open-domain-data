#!/usr/bin/env node
/**
 * Mirror canonical /data and /schemas into /public/api and /public/schemas
 * so the static site serves the same files contributors edit. Runs on prebuild.
 *
 * Run manually: `node scripts/sync-data.mjs`
 */
import { mkdir, copyFile, readdir, rm } from "node:fs/promises";
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
