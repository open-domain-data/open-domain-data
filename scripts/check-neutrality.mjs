#!/usr/bin/env node
/**
 * Editorial firewall: fail if anything score-like appears in /data.
 *
 * Open Domain Data is a data layer — it must not rank, score, recommend or
 * endorse registrars (README / GOVERNANCE). Cross-site imports and manual PRs
 * alike are gated by this check, so neutrality is enforced by machine rather
 * than by review memory. It walks every key in every dataset file (wrapper
 * metadata included) and fails on key names that carry an opinion.
 *
 * Usage: node scripts/check-neutrality.mjs   (exits non-zero on any hit)
 */
import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url)) + "/..";
const DATA_DIR = join(root, "data");

// Key names that encode an opinion rather than a fact. Substring matches are
// deliberate (catches overall_score, rank_position, recommended_for, ...).
const FORBIDDEN_KEY_PATTERNS = [
  /score/i,
  /\brank/i,
  /ranking/i,
  /rating/i,
  /recommend/i,
  /verdict/i,
  /award/i,
  /best_for/i,
  /not_ideal/i,
  /^pros$/i,
  /^cons$/i,
  /editorial/i,
];

const problems = [];

function walk(node, path, file) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, `${path}[${i}]`, file));
    return;
  }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      for (const pattern of FORBIDDEN_KEY_PATTERNS) {
        if (pattern.test(key)) {
          problems.push(`${file}: ${path}.${key} — key matches forbidden pattern ${pattern}`);
          break;
        }
      }
      walk(value, `${path}.${key}`, file);
    }
  }
}

const files = (await readdir(DATA_DIR)).filter((f) => f.endsWith(".json")).sort();
for (const file of files) {
  walk(JSON.parse(await readFile(join(DATA_DIR, file), "utf8")), "$", file);
}

if (problems.length) {
  console.error("x  neutrality check failed — opinion-shaped keys found in /data:");
  for (const p of problems) console.error(`     ${p}`);
  console.error("   Rankings and recommendations do not belong in Open Domain Data (see GOVERNANCE.md).");
  process.exit(1);
}
console.log(`ok neutrality: ${files.length} dataset files, no score/rank/recommendation keys.`);
