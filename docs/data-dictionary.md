# Data dictionary

Every dataset shares a small set of governance fields. Dataset-specific fields
are documented on the dataset detail page on the website and in the JSON
Schema in `/schemas`.

## Shared governance fields

| Field                  | Type                    | Required | Meaning                                                                                                                            |
|------------------------|-------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------|
| `registrar_id` or `id` | `string`                | yes      | Stable slug identifier. Lower-case, hyphen-separated. Never reused for a different registrar.                                      |
| `sources`              | `array<enum>`           | yes      | Provenance. Values: `iana`, `rdap`, `registrar_docs`, `submission`. Multiple values mean the record agrees across all of them.     |
| `verification_status`  | `enum`                  | yes      | How the record was checked. See [verification statuses](#verification-statuses).                                                   |
| `last_checked`         | `string · date-time`    | yes      | ISO 8601 UTC timestamp of the most recent check. Updated on every PR that touches the record.                                      |
| `license`              | (file-level)            | yes      | Always `CC-BY-4.0` for datasets in this repository.                                                                                |
| `version`              | (file-level, `YYYY.MM`) | yes      | Calendar version of the release the file belongs to.                                                                               |

## Verification statuses

Statuses are descriptive, not a quality score.

- `unknown` — no verification has been attempted.
- `public_sources` — compiled from public docs, pricing pages and registries.
- `independently_tested` — confirmed against a live endpoint by Open Domain Data.
- `registrar_submitted` — submitted by the registrar; not yet checked.
- `registrar_verified` — registrar-submitted and confirmed against a live endpoint.
- `deprecated` — retained for historical reference only.

A record may move between statuses as it is checked.

## Confidence

This project does not publish a numeric confidence score. Confidence is
expressed through:

1. `verification_status` (qualitative).
2. The list in `sources` (more agreeing sources → more confidence).
3. The age of `last_checked`.

If a value cannot be confirmed from a public source, the field is **omitted**
or set to `unknown`. Open Domain Data does not infer or invent values.

## Sample / preliminary data

If a record value is **sample** or **preliminary** — illustrative for the
website scaffold, or pending re-verification — it is marked in the dataset
metadata and on the registrar detail page. CI rejects ranked, scored or
recommendation-style language; sample values themselves are allowed as long
as they are flagged.
