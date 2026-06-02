# Contributing to Open Domain Data

Thanks for considering a contribution. Open Domain Data is maintained in the
open — data, schemas and methodology all change through GitHub.

This document is the short form. The full methodology lives at
[opendomaindata.org/methodology](https://opendomaindata.org/methodology).

## Ground rules

- **Be factual.** Every change needs a source link.
- **Be neutral.** No rankings, scores, endorsements or promotional language.
- **Be reproducible.** Anyone reading the PR should be able to re-verify.
- **Be small.** Prefer one record / one field per PR. Large refactors are fine
  but should be discussed in an issue first.

## What you can contribute

### Corrections

A single field is wrong. Open the [correction issue
template](.github/ISSUE_TEMPLATE/correction.md) or send a PR that:

1. Updates the record in `public/api/*.json`
2. Cites the source in the PR description
3. Bumps `last_checked`

### New records

Adding a new registrar, TLD, or RDAP endpoint. Open the [dataset request issue
template](.github/ISSUE_TEMPLATE/dataset_request.md) first to confirm scope,
then submit a PR.

### Registrar submissions

If you maintain a registrar, you can submit a capability matrix. Use the
[registrar submission template](.github/ISSUE_TEMPLATE/registrar_submission.md).
Submitted records are merged with `verification_status: registrar_submitted`
and promoted to `registrar_verified` once an independent check confirms them.

### Schema changes

New fields, new enum values, type changes. Open the [schema proposal
template](.github/ISSUE_TEMPLATE/schema_proposal.md) first.

- New fields must be **optional** until backfilled across the dataset.
- Every enum value needs a one-line definition.
- Removing or renaming a field is a breaking change and must wait for a major
  release.

## Workflow

1. Fork → branch → edit.
2. Run `npm install && npm run typecheck && npm run lint && npm run build`.
3. Open a PR using the template.
4. CI validates each touched record against its schema and checks source URLs.
5. A maintainer reviews. Approved PRs are merged into the next dataset release.

## Validation expectations

Every changed record must validate against its schema. Run locally:

```sh
# (planned) — scripted in the data repo
npm run validate
```

A field becomes `independently_tested` only when an automated probe confirms
the documented behaviour against the live service. You don't need to run these
probes yourself; maintainers do so on a daily cadence.

## Reviewing PRs

If you're reviewing, check:

- [ ] All touched records validate against their schema.
- [ ] Each changed value has at least one new source URL or links to an
      existing one in `sources`.
- [ ] `last_checked` is updated.
- [ ] The change does not introduce ranking, scoring or "best for" language.

## Code of conduct

This project follows the [Contributor
Covenant](./CODE_OF_CONDUCT.md). By participating you agree to abide by it.
