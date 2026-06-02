<!--
Thank you for contributing to Open Domain Data.

Before opening this PR, please:
  • Read CONTRIBUTING.md if this is your first PR.
  • Run `npm run check` locally.
  • Make sure any changed value has a source URL.
  • Mark any sample / preliminary value as such.

If this is a draft, open it as a Draft PR so reviewers aren't pinged yet.
-->

## Summary

<!-- One or two sentences describing the change and its motivation.
Reviewers should be able to understand the *why* from this section alone. -->



## Type of change

<!-- Tick everything that applies. -->

- [ ] Data correction (one or more existing records)
- [ ] New record (new registrar or new TLD price line)
- [ ] Outdated data refresh (`last_checked` bump + value update)
- [ ] Schema change — **additive** (new optional field / new enum value)
- [ ] Schema change — **breaking** (linked proposal issue required)
- [ ] Methodology / governance doc update
- [ ] Website code or design change
- [ ] Build, CI, scripts, or tooling
- [ ] Documentation only (`README.md`, `docs/`, in-site docs)

## Area touched

- [ ] `data/registrars.json`
- [ ] `data/registrar_api_capabilities.json`
- [ ] `data/dns_capabilities.json`
- [ ] `data/tld_pricing.json`
- [ ] `data/rdap_metadata.json`
- [ ] `data/registrar_security_contacts.json`
- [ ] `data/agent_capability_signals.json`
- [ ] `schemas/*.schema.json`
- [ ] `src/` (website)
- [ ] `scripts/` or `.github/`
- [ ] `docs/` or root markdown

## Sources

<!--
For every changed value, list the URL the value can be re-verified from.
At least one source URL is required for any data change.

Schema PRs should cite the proposal issue.
Website-only PRs can write "n/a (no data change)".
-->

-

## How was this tested?

<!-- Tick the commands you ran locally. -->

- [ ] `npm run validate`  — every touched record passes its schema
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Manual: opened the affected page(s) at `http://localhost:3000`
- [ ] Not applicable (explain below)

<!-- If you ran a custom check or a one-off script, paste the command and output here. -->

## Contributor checklist

By ticking each box you confirm that the statement is true for this PR.

- [ ] Each changed value carries at least one source URL above.
- [ ] `last_checked` is updated for every touched record.
- [ ] `verification_status` reflects how the value was checked:
  - `public_sources` — copied from public docs.
  - `independently_tested` — confirmed against a live endpoint.
  - `registrar_submitted` — submitted by the registrar; not yet verified.
  - `registrar_verified` — registrar-submitted and live-checked.
  - `unknown` — used when no source could confirm the value (no guessing).
- [ ] **No ranking, scoring, "best for", or recommendation language was added**
      anywhere in the PR — including data, docs, code comments, and copy.
      (Open Domain Data does not rank or recommend registrars.)
- [ ] Any **sample** or **preliminary** values are clearly marked as such in
      the record, the surrounding docs, or this PR description.
- [ ] If a schema changed, the change is **additive** *or* an approving
      schema-proposal issue is linked under "Related issues".
- [ ] `CHANGELOG.md` is updated if this ships in the next release.
- [ ] I read and agree to abide by the [Code of Conduct](../CODE_OF_CONDUCT.md).

## Related issues

<!-- e.g. Closes #123, Refs #456, Implements proposal #789. -->

-

## Conflicts of interest

<!--
If you work for, are employed by, or have a financial relationship with a
registrar present in this PR's data, disclose it here.

Maintainers employed by an affected registrar will recuse themselves from
review (see GOVERNANCE.md).

"None." is a fine answer.
-->

-

## Notes for reviewers

<!--
Optional. Anything you want a reviewer to know:
  • A piece of context that isn't obvious from the diff.
  • A part of the change you're unsure about.
  • A follow-up PR you plan to send next.
-->


<!-- screenshots for website / design PRs are welcome here -->
