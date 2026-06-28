# Changelog

All notable changes to datasets, schemas and the website are recorded here.
Newest first. The format follows [Keep a Changelog](https://keepachangelog.com)
and the project uses [Semantic Versioning](https://semver.org/) for schemas and
calendar versioning (`YYYY.MM`) for datasets.

## 2026.06 — 2026-06-28

### `registrar_api_capabilities@2026.06` · schema `api-capabilities@2026.06`
- Added per-field provenance (`field_provenance`) to all seven sample records and
  to the JSON Schema. `auth_model`, `scoped_tokens`, `sandbox_url`,
  `openapi_spec`, `rate_limit` and `api_available` now each carry their own
  `source_url`, `verification_status`, `last_checked` and `note`, citing primary
  registrar documentation. No capability values changed.
- Re-verified two facts live on 2026-06-28:
  - **Porkbun** — the public pricing endpoint (`/api/json/v3/pricing/get`)
    returned `SUCCESS` on an unauthenticated request, so `api_available` is marked
    `independently_tested`.
  - **GoDaddy** — the Get Started page documents that production access to the
    Availability API requires 50+ domains, while the Management and DNS APIs
    require 1+ domain or a Domain Pro Plan. The `rate_limit` note was corrected to
    reflect the current tiers.

## 2026.06 — 2026-06-25

### `rdap_metadata@2026.06` · schema `rdap-metadata@2026.06` (new)
- Expanded the sample from 3 to 7 registrars (added GoDaddy, Dynadot, Spaceship
  and Squarespace Domains), matching the coverage of the other agent-facing
  datasets.
- Published the dataset's **first JSON Schema** (`rdap-metadata.schema.json`) and
  wired it into `validate.mjs`; the dataset was previously unvalidated.
- Added per-field provenance (`field_provenance`) to every record.
- Live-probed all seven RDAP base URLs and aligned them to the IANA
  registrar-ids registry. This corrected Porkbun — the previous
  `rdap.porkbun.com` returns HTTP 404, while the IANA value
  `cart-before.porkbun.horse/rdap/` returns a valid RDAP object — and brought the
  dataset into agreement with the registrars dataset's `rdap_base`.

### `registrar_security_contacts@2026.06` · schema `security-contacts@2026.06` (new)
- Expanded the sample from 3 to 7 registrars.
- Published the dataset's **first JSON Schema** (`security-contacts.schema.json`)
  and wired it into `validate.mjs`.
- Added per-field provenance. The new registrars' abuse contacts were read from
  **registry RDAP records** (the ICANN RDDS abuse field) and marked
  `independently_tested` where the sponsoring registrar's IANA ID matched.
  Squarespace Domains' abuse contact is left `unknown` rather than guessed,
  because its own namesake domains are sponsored by a different registrar and no
  primary record was resolvable. `security.txt` presence is verified where the
  `.well-known` path is reachable and left `unknown` where it is anti-bot blocked.

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
