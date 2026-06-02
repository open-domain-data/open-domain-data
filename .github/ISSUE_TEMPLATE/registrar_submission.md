---
name: Registrar submission
about: Submit or update your registrar's capability matrix.
title: "Submission: <registrar_id>"
labels: ["registrar-submission"]
assignees: []
---

<!--
Thanks for submitting. Open Domain Data accepts registrar-submitted records.
They are merged with `verification_status: registrar_submitted` and promoted
to `registrar_verified` after an independent check passes.

We do NOT promote submissions to ranked, recommended, or "verified partner"
status. Open Domain Data does not rank registrars.
-->

## Registrar

- **registrar_id**: <!-- e.g. cloudflare-registrar -->
- **IANA ID**: <!-- numeric -->
- **Legal name**:
- **Website**:

## Disclosure

- [ ] I am authorized to submit this record on behalf of the registrar.
- [ ] I understand this submission will be marked `registrar_submitted` until
      independently verified.

## Datasets to update

- [ ] `registrars`
- [ ] `registrar_api_capabilities`
- [ ] `dns_capabilities`
- [ ] `tld_pricing`
- [ ] `rdap_metadata`
- [ ] `registrar_security_contacts`
- [ ] `agent_capability_signals`

## Submitted records

<!-- Paste the JSON for each record, one block per dataset. -->

```json
{
}
```

## Source pointers (for verification)

<!-- URLs the maintainers can hit to confirm the values. -->

-
