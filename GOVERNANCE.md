# Governance

Open Domain Data is a community-maintained open data project. This document
describes how decisions are made and how the data is governed.

## Roles

- **Contributors** — anyone who opens a PR or issue. No commit access.
- **Maintainers** — review PRs, cut releases, run the verification jobs.
  Currently @open-domain-data/maintainers.
- **Stewards** — small group with the final word on schema changes and
  governance updates. Currently the founding maintainers.

## How decisions are made

- **Data corrections**: a single maintainer can approve and merge.
- **Schema additions** (new optional fields, new enum values): two maintainer
  approvals, discussed first in an issue.
- **Schema breaking changes** (removed fields, type changes): steward
  approval, discussed in an issue, and bundled into a major release.
- **Governance / methodology**: steward approval after public RFC.

## Conflict of interest

Maintainers who are employed by a registrar present in the dataset must
disclose this in their GitHub profile and recuse themselves from PRs that
touch records about their employer.

## Neutrality

Open Domain Data is a data layer. It must not rank, score, recommend or
endorse registrars. Maintainers who repeatedly accept ranking-flavoured
contributions or marketing language are subject to removal by the stewards.

Ranking and recommendation products consuming this data must:

1. Disclose that they consume Open Domain Data.
2. State the dataset version they used.
3. Not represent themselves as Open Domain Data.

## Releases

- Datasets are released monthly, tagged `YYYY.MM`.
- Schemas are released with the dataset they validate.
- The website is deployed on every push to `main`.

## Sunset policy

A dataset can be sunset only with a steward decision and a 12-month notice.
Sunset datasets remain available at their last release for citation.
