# Release process

## Cadence

Datasets are released monthly, tagged `YYYY.MM`. The website is deployed on
every push to `main`. Schema releases ship with the dataset they validate.

## What "the release" contains

- The dataset files in `/data` at the release commit.
- The schemas in `/schemas` at the release commit.
- A `CHANGELOG.md` entry for every dataset that changed.
- A git tag in the form `data-YYYY.MM`.

## Steps the release maintainer follows

1. Open a release PR titled `release: YYYY.MM`.
2. Make sure every record touched since the last release has its
   `last_checked` updated.
3. Run `npm run check` (`typecheck + lint + validate`).
4. Update `CHANGELOG.md` with one section per changed dataset.
5. Bump `version` in each dataset file that changed.
6. Merge after at least one other maintainer approves.
7. Tag the merge commit `data-YYYY.MM` and push the tag.
8. The static site rebuilds from `main`; no separate deploy is needed.

## Hotfix releases

Critical corrections (wrong IANA ID, broken RDAP base, etc.) ship without
waiting for the next monthly tag. The hotfix lands on `main`, the dataset's
`last_checked` is bumped, the `CHANGELOG.md` records it, and the next monthly
release rolls it up.

## Sunsetting a dataset

Decided by stewards (see `GOVERNANCE.md`) after a 12-month notice. The
sunset dataset's last release stays available for citation.
