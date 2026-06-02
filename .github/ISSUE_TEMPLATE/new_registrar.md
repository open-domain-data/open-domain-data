---
name: New registrar record
about: Propose adding a registrar that is missing from the catalog.
title: "New registrar: <legal_name>"
labels: ["new-registrar"]
assignees: []
---

<!--
For a registrar you operate, use the registrar-submission template instead.
This template is for third-party additions (e.g. you noticed a missing IANA-
accredited registrar and have public sources for the values).
-->

## Registrar

- **proposed id (slug)**: <!-- e.g. example-registrar -->
- **legal name**:
- **IANA ID**: <!-- numeric -->
- **website**:
- **country (ISO 3166-1 alpha-2)**:

## Status

- **registrar status**: <!-- active | inactive | terminated -->
- **rdap_base**: <!-- e.g. https://rdap.example.com — or leave blank -->

## Sources

<!-- A URL for each value above. IANA list + at least one registrar-controlled
URL is preferred. -->

-

## Optional: other datasets

If you have sources for any of these, list them. Otherwise leave blank — the
record can land in `registrars` first and be enriched later.

- API capabilities (auth model, docs URL):
- DNS capabilities (DNSSEC, CAA, record types):
- Pricing (TLD, register/renew/transfer in USD):
- Security contacts (abuse email, security.txt):

## Verification status to apply

- [ ] `public_sources` — values are taken from the registrar's published docs
- [ ] `independently_tested` — values were probed against a live endpoint
- [ ] `unknown` — value cannot be verified from a public source

<!--
Open Domain Data does not invent values. If a capability is not stated in a
public source, leave it as `unknown` rather than guessing.
-->
