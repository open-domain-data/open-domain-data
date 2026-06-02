# Changelog

All notable changes to datasets, schemas and the website are recorded here.
Newest first. The format follows [Keep a Changelog](https://keepachangelog.com)
and the project uses [Semantic Versioning](https://semver.org/) for schemas and
calendar versioning (`YYYY.MM`) for datasets.

## 2026.06 — 2026-06-01

### `tld_pricing@2026.06`
- Added 412 TLDs across 38 registrars.
- Normalized promotional pricing flags into a dedicated `promotional` field.

## 2026.05 — 2026-05-31

### `registrars@2026.05`
- Re-checked 2,841 records against RDAP.
- Corrected 14 RDAP base URLs flagged in community PR #208.

### `agent_capability_signals@2026.05` — new
- New dataset published describing programmatic-access signals.
- **No scoring or ranking is included.** Signals are descriptive only.

### `registrar_api_capabilities@2026.05`
- Added `rate_limit` and `sandbox_url` fields to the schema.
- Backfilled for 612 records.

### `registrar_security_contacts@2026.05`
- Added RFC 9116 `security.txt` presence detection across 2,610 records.

## 2026.04 — 2026-04-30

- Initial public release of `registrars`, `registrar_api_capabilities`,
  `dns_capabilities`, `tld_pricing`, `rdap_metadata` and
  `registrar_security_contacts`.
