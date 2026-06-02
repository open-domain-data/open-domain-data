---
name: Schema proposal
about: Propose a new field, a new enum value, or a schema change.
title: "Schema proposal: <schema>.<field>"
labels: ["schema"]
assignees: []
---

## Schema

- **schema**: <!-- e.g. registrar.schema.json -->
- **version**: <!-- current version -->

## Change type

- [ ] New optional field
- [ ] New enum value
- [ ] Type widening
- [ ] **Breaking** — removed field, type narrowing, renamed field

## Proposal

<!-- The exact field definition. JSON Schema preferred. -->

```json
{
  "fieldName": {
    "type": "...",
    "description": "..."
  }
}
```

## Rationale

<!-- Why is this needed? Which downstream consumers benefit? -->

## Backfill plan

<!-- For a new field: how will existing records be populated? "Will remain
null until verified" is an acceptable answer. -->

## Compatibility

<!-- For breaking changes: list every dataset and tool that depends on the
old shape. Breaking changes require a major release. -->
