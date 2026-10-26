# Cross-citation convention

Open Domain Data publishes facts under CC BY 4.0 so anyone can reuse them —
including other independent research and directory sites. This note states the
convention those sites (and this one) follow when they cite each other's data.

The rule is deliberately narrow, because a narrow rule is what keeps every
participating site neutral:

> **Neutral sites may cite each other's *data*. They do not cite each other's
> *ownership*, and they do not vouch for each other's *conclusions*.**

## What that means in practice

1. **Cite the figure, name the source, link the canonical URL.** When you quote
   a statistic, credit "Open Domain Data" and link the stable URL for that stat
   (e.g. `https://opendomaindata.org/landscape/2026-q3/mcp-interface`). Include
   the edition or dataset version so the citation is reproducible.

2. **Data flows both ways; endorsement never does.** A directory that tracks a
   different ecosystem may cite an Open Domain Data registrar statistic, and
   Open Domain Data may cite one of theirs. Neither site thereby endorses,
   ranks, or recommends the other. Each remains responsible only for its own
   facts.

3. **No shared attribution of ownership.** Citing another neutral site's data
   never carries a claim about who operates it. Sites are credited as the
   *source of a fact*, nothing more. This is what makes the convention safe by
   construction: it moves numbers, not affiliations.

4. **Facts only — no cross-citation of rankings or recommendations.** Open
   Domain Data does not rank registrars, so there is nothing here to cite except
   facts. If another site publishes an opinion or a ranking, that is its own
   editorial product and is cited (if at all) as that site's view, not as data.

5. **Corrections propagate.** If a cited figure is corrected here, the citing
   site is expected to pick up the correction on its normal refresh. Every stat
   carries a `last_checked` and an edition/version to make staleness visible.

## The reciprocal feed

Open Domain Data offers a machine-readable feed any neutral site can cite:

- **Endpoint:** `https://opendomaindata.org/api/registrar_landscape.json`
  (CSV: `.../registrar_landscape.csv`)
- **Featured stat for cross-citation:** *native agent (MCP) interface adoption
  among tracked registrars* —
  `https://opendomaindata.org/landscape/2026-q3/mcp-interface`. As of the
  2026-Q3 edition: **1 of the 7 registrars tracked by Open Domain Data exposes a
  native agent (MCP) interface.** This figure sits at the boundary between the
  domain world and the MCP/agent-tooling world, so it is a natural bridge for
  directories that cover the agent ecosystem.

In return, Open Domain Data may cite a factual, source-backed statistic from
another neutral directory (for example, an adoption figure about the MCP or
agent-skill ecosystem) under the same terms — crediting the source, linking its
canonical URL, and treating it strictly as data.

## Attribution wording

Recommended inline form:

> Source: Open Domain Data, registrar_landscape 2026-Q3 (CC BY 4.0) —
> opendomaindata.org/landscape/2026-q3/&lt;stat&gt;

That is the whole convention. Cite the number, link the source, keep the tones
separate.
