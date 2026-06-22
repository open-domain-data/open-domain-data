# Changelog

All notable changes to datasets, schemas and the website are recorded here.
Newest first. The format follows [Keep a Changelog](https://keepachangelog.com)
and the project uses [Semantic Versioning](https://semver.org/) for schemas and
calendar versioning (`YYYY.MM`) for datasets.

## 2026.06 — 2026-06-22

### `registrars@2026.06` · schema `registrar@2026.06`
- Added per-field provenance (`field_provenance`) to the registrar schema. A
  record can now carry, for any field, its own `source_url`,
  `verification_status`, `last_checked` and a `note` describing how that field
  was checked. Field-level provenance is authoritative over the record-level
  fields for the field it describes.
- Backfilled `field_provenance` for `iana_id`, `name`, `status` and `rdap_base`
  across the sample registrars, with each field carrying the status that matches
  how it was actually checked: `iana_id`, `name` and `status` are read from the
  IANA registrar-ids registry CSV (`public_sources`), while `rdap_base` is
  resolved from IANA and then `independently_tested` by issuing a live RDAP query
  and confirming a valid RDAP response.
- Corrected `rdap_base` for every sample registrar against the IANA registry:
  Porkbun's base is `cart-before.porkbun.horse`, not `rdap.porkbun.com`;
  Cloudflare carries the `/rdap/v1/` path; and the IANA RDAP bases for GoDaddy,
  Dynadot and Squarespace Domains were filled in (`rdap.godaddy.com/v1/`,
  `rdap.dynadot.com/`, `rdap.squarespace.domains/`).
- Filled in Spaceship's `rdap_base` (`rdap.spaceship.com`) from the IANA
  registry — the previous pass had left it blank — and confirmed the endpoint
  answers RDAP, upgrading it to `independently_tested`.
- Added `scripts/verify-rdap.mjs` (`npm run verify:rdap`): resolves every
  record against the IANA CSV, fails on any `rdap_base` drift, and probes each
  endpoint for a valid RDAP response. This is the reproducible evidence behind
  the `independently_tested` status on `rdap_base`.
- Documented the per-field status model in [`docs/data-dictionary.md`](./docs/data-dictionary.md).

### Sample expansion — 2026-06-21
- Expanded the shipped illustrative sample from 3 to 7 registrars, adding
  GoDaddy (IANA 146), Dynadot (IANA 472), Spaceship (IANA 3862) and Squarespace
  Domains (IANA 895) to `registrars`, `registrar_api_capabilities` and
  `agent_capability_signals`. IANA IDs and entity names are sourced from the
  IANA registrar-ID registry; API and agent-capability facts are from each
  registrar's public documentation and are marked `public_sources`.
- Added an `mcp_interface` signal to `agent_capability_signals` recording
  whether a registrar publishes an official Model Context Protocol server for
  domain operations. It is descriptive only — **no scoring or ranking.**

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
