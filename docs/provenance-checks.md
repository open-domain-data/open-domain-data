# Provenance checks

Open Domain Data's contract is that every published value carries a **source**,
a **verification status** and a **date**. Per-field provenance
(`field_provenance`) records that contract on each record; `scripts/check-provenance.mjs`
enforces it.

The dataset schemas already validate that a `field_provenance` block is shaped
correctly. This check adds the things a schema cannot express: that the recorded
dates are sane and recent, that the status is one we actually document, and that
the cited URLs still resolve.

## What it checks

**Hygiene (offline — runs on every PR and push):**

- `source_url` is a well-formed `http(s)` URL.
- `verification_status` is one of the documented statuses (`unknown`,
  `public_sources`, `independently_tested`, `registrar_submitted`,
  `registrar_verified`, `deprecated`).
- `last_checked` is a valid ISO-8601 date that is **not** in the future.
- `last_checked` is not older than the staleness window (180 days). Stale
  entries are reported as a warning, not a failure — a fact does not rot on a
  fixed clock, but it deserves a re-look.

**Liveness (network — runs weekly and on demand):**

- Each distinct `source_url` is fetched and classified `live`, `protected`
  (reachable but bot-protected / rate-limited, e.g. a `403`), `dead` (`404` /
  `410`), or `unreachable` (transport error / unexpected status), grouped by
  source domain.

A machine-readable report is written to `reports/provenance-status.json` (which
is git-ignored and uploaded by CI as an artifact rather than committed, since it
is timestamped).

## Running it

```sh
npm run verify:provenance         # hygiene only (offline, part of `npm run check`)
npm run verify:provenance:urls    # also fetch each cited source URL
node scripts/check-provenance.mjs --strict   # fetch URLs and fail on dead links
node scripts/check-provenance.mjs --json     # machine-readable report to stdout
```

Exit code is non-zero when any hygiene check fails, or — in `--strict` — when a
cited source URL is dead. The `Provenance freshness` workflow runs the hygiene
check on every PR and the strict liveness check on a weekly schedule, so source
rot surfaces as a failed job instead of a silently broken citation.

## Coverage

Coverage grows with the datasets. Field-level provenance currently lives on the
`registrars` dataset; as it is extended to the other datasets, this check
automatically picks up the new entries — no configuration to update.
