# Open Domain Data

> Open, versioned datasets for the domain infrastructure ecosystem.

[opendomaindata.org](https://opendomaindata.org) publishes machine-readable
datasets about domain registrars, registrar APIs, DNS capabilities, TLD pricing,
RDAP metadata, security contacts and agent-readiness signals. Every record
carries a verification status, a source list and a timestamp.

This repository — `open-domain-data/open-domain-data` — is the source of truth.
Datasets, schemas and methodology all change through GitHub: open an issue, send
a PR, get reviewed, ship in the next dataset release.

| | |
|---|---|
| Website | <https://opendomaindata.org> |
| Source repo | <https://github.com/open-domain-data/open-domain-data> |
| Data license | CC BY 4.0 — see [`LICENSE-DATA`](./LICENSE-DATA) |
| Code license | MIT — see [`LICENSE`](./LICENSE) |
| Issues | <https://github.com/open-domain-data/open-domain-data/issues> |
| Discussions | use issues with the `question` label |

## What this project is

- An **open-source data catalog**. Code is MIT, data is CC BY 4.0.
- A **neutral data layer** for the domain ecosystem.
- **Maintained through GitHub.** Data, schemas and methodology all change via
  pull request, reviewed by maintainers, with CI schema validation.
- **Static-first.** No backend, no database, no auth. The website is a Next.js
  site rendered to static HTML; the data is a folder of JSON and CSV files.

## What this project is NOT

- ❌ Not a registrar.
- ❌ Not a domain marketplace.
- ❌ Not a ranking site. **Open Domain Data does not score, rank, recommend
  or endorse registrars.**

### Where rankings live

Ranking and recommendation belong to a separate product:
[**Best-Domain-Registrars.com**](https://best-domain-registrars.com) consumes
this data and applies its own scoring / opinion layer.

Rules for any product (including Best-Domain-Registrars.com) that builds
rankings on this data:

1. Disclose that the rankings are derived from Open Domain Data.
2. State the dataset version they used (e.g. `registrars@2026.05`).
3. Do not represent themselves as Open Domain Data.

If you find a product violating these rules, please open an issue.

## Datasets

| Dataset                       | Records | Version | Status                |
|-------------------------------|---------|---------|------------------------|
| `registrars`                  | 2,841   | 2026.06 | `independently_tested` |
| `registrar_api_capabilities`  | 612     | 2026.05 | `public_sources`       |
| `dns_capabilities`            | 612     | 2026.05 | `independently_tested` |
| `tld_pricing`                 | 48,260  | 2026.06 | `public_sources`       |
| `rdap_metadata`               | 1,517   | 2026.05 | `independently_tested` |
| `registrar_security_contacts` | 2,610   | 2026.05 | `public_sources`       |
| `agent_capability_signals`    | 612     | 2026.05 | `registrar_submitted`  |

Browse at [`/datasets`](https://opendomaindata.org/datasets).

> The repository ships with a small illustrative sample of seven registrars
> (Cloudflare, Namecheap, Porkbun, GoDaddy, Dynadot, Spaceship, Squarespace
> Domains). Any value that has not been re-verified for the current release is
> marked **sample** or **preliminary** in the dataset metadata and on the
> registrar detail pages.

## Data formats

- **JSON** — `/api/<dataset>.json`. Each file has `dataset`, `version`,
  `license`, `last_checked`, `schema`, `count` and a `records` array.
- **CSV** — `/api/<dataset>.csv`. UTF-8, comma-separated, RFC 4180 quoting.
  Array-valued fields use the `|` separator inside the cell.
- **JSON Schema (Draft 2020-12)** — `/schemas/<name>.schema.json`.

Stable, machine-readable URLs:

| URL                                              | Purpose                                  |
|--------------------------------------------------|------------------------------------------|
| `/api/registrars.json`                           | Canonical registrar records              |
| `/api/registrar_api_capabilities.json`           | Registrar API surface                    |
| `/api/dns_capabilities.json`                     | DNS feature support                      |
| `/api/tld_pricing.json`                          | Per-registrar TLD pricing (USD)          |
| `/api/rdap_metadata.json`                        | RDAP service URLs and conformance        |
| `/api/registrar_security_contacts.json`          | Abuse / security contacts                |
| `/api/agent_capability_signals.json`             | Programmatic-access signals              |
| `/schemas/registrar.schema.json`                 | JSON Schema for `registrars`             |
| `/schemas/api-capabilities.schema.json`          | JSON Schema for API capabilities         |
| `/schemas/dns-capabilities.schema.json`          | JSON Schema for DNS capabilities         |
| `/schemas/pricing.schema.json`                   | JSON Schema for pricing                  |
| `/llms.txt`                                      | Plain-text index for LLMs                |
| `/sitemap.xml`                                   | Sitemap for crawlers                     |

## Using the JSON / CSV files

### From the command line

```sh
curl -s https://opendomaindata.org/api/registrars.json | jq '.records[] | select(.country=="US")'
```

### From JavaScript / TypeScript

```ts
const res = await fetch("https://opendomaindata.org/api/registrars.json");
const { records } = await res.json();
```

### From Python

```py
import json, urllib.request
with urllib.request.urlopen("https://opendomaindata.org/api/registrars.json") as r:
    data = json.load(r)
print(len(data["records"]))
```

### From an LLM / AI agent

Start with [`/llms.txt`](https://opendomaindata.org/llms.txt). It lists every
dataset, every schema, the licensing and the neutrality boundary in plain
text. The dataset files are stable JSON — fetch them directly. Do not rely on
ranking or "best registrar" framing; this project does not publish it.

## Repository structure

```
open-domain-data/
├── data/                         # Canonical datasets (edit here)
│   ├── registrars.json
│   ├── registrar_api_capabilities.json
│   ├── dns_capabilities.json
│   ├── tld_pricing.json
│   ├── rdap_metadata.json
│   ├── registrar_security_contacts.json
│   ├── agent_capability_signals.json
│   └── registrars.csv
├── schemas/                      # JSON Schemas (edit here)
│   ├── registrar.schema.json
│   ├── api-capabilities.schema.json
│   ├── dns-capabilities.schema.json
│   └── pricing.schema.json
├── public/
│   ├── api/                      # Mirrored from /data at build time
│   ├── schemas/                  # Mirrored from /schemas at build time
│   ├── llms.txt
│   └── robots.txt
├── src/
│   ├── app/                      # Next.js App Router routes
│   ├── components/               # Reusable UI components
│   ├── lib/                      # Typed data + helpers
│   └── styles/odc.css            # Design system
├── scripts/
│   ├── sync-data.mjs             # /data → /public/api, /schemas → /public/schemas
│   └── validate.mjs              # ajv validation of /data against /schemas
├── docs/                         # Long-form project docs
├── .github/                      # Issue templates, PR template, CI
├── README.md
├── CONTRIBUTING.md
├── GOVERNANCE.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CHANGELOG.md
├── LICENSE                       # MIT (code)
└── LICENSE-DATA                  # CC BY 4.0 (data, schemas, docs)
```

The contributor workflow is: **edit `/data` or `/schemas`, run `npm run
validate`, open a PR.** The `public/` mirror is regenerated on every
`npm run dev` and `npm run build`.

## Running the site locally

Requirements: Node 20+ and npm.

```sh
npm install
npm run dev          # http://localhost:3000
npm run build
npm run start
```

## Validating the data

```sh
npm run validate     # ajv against /schemas
```

Every dataset file in `/data` is validated against the schema in `/schemas`
listed in `scripts/validate.mjs`. CI runs the same script on every PR.

To run the full pre-PR check:

```sh
npm run check        # typecheck + lint + validate
```

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full guide. The short
version:

1. Fork the repository.
2. Edit a record under `/data` (or a schema under `/schemas`), with at least
   one source URL.
3. Run `npm run check` locally.
4. Open a PR using the template.
5. Maintainers review; merged changes ship in the next dataset release.

Issue templates live in [`.github/ISSUE_TEMPLATE/`](./.github/ISSUE_TEMPLATE/):

- Data correction
- New registrar record
- Outdated pricing or metadata
- Broken source link
- Schema change proposal
- Registrar submission (for registrars submitting about themselves)
- Documentation improvement
- Bug report (website / scripts)

## Verification statuses

Statuses describe **how** a value was checked, not how good it is. They are
never a quality score.

| Status                  | Meaning                                                  |
|-------------------------|----------------------------------------------------------|
| `unknown`               | No verification has been attempted.                      |
| `public_sources`        | Compiled from public docs, pricing pages, registries.    |
| `independently_tested`  | Confirmed against a live endpoint by Open Domain Data.   |
| `registrar_submitted`   | Submitted by the registrar; not yet independently checked. |
| `registrar_verified`    | Registrar-submitted and confirmed against a live endpoint. |
| `deprecated`            | No longer maintained; retained for historical reference. |

See [`/methodology`](https://opendomaindata.org/methodology) for the
normative document.

## License and citation

- **Data, schemas, methodology**: [CC BY 4.0](./LICENSE-DATA)
- **Website code / scripts**: [MIT](./LICENSE)

### Citation format

> Open Domain Data (2026). *registrars*, v2026.05.
> opendomaindata.org/datasets/registrars. Retrieved 2026-06-01. CC-BY-4.0.

```bibtex
@misc{opendomaindata-registrars-2026-05,
  title        = {registrars},
  author       = {{Open Domain Data}},
  year         = {2026},
  version      = {2026.05},
  howpublished = {\url{https://opendomaindata.org/datasets/registrars}},
  license      = {CC-BY-4.0}
}
```

Attribution must cite Open Domain Data and the dataset version. Products that
build rankings or recommendations on this data must disclose that they do so.

## Governance, security, conduct

- Decision-making and roles: [`GOVERNANCE.md`](./GOVERNANCE.md)
- Reporting vulnerabilities: [`SECURITY.md`](./SECURITY.md)
- Community standards: [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)
