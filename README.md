# Personal Continuum

**A Blochfield field of situated public relations, persistent origin slots, provenance-bearing mathematical worlds, and append-only relation history.**

This repository is the post-monolith foundation extracted from the Persona Continuum V2.1 evidential-terrain prototype. The original single-file artifact remains frozen under `legacy/v2.1/`; production development proceeds through explicit model, rendering, provenance, relation-seed, publication, QA, and documentation boundaries.

## Thesis

A Personal Continuum is not a database of people. It is a field of situated relations whose origins remain persistent while their meanings can continue to change.

Blochfield supplies evidence, provenance, bounded interpretation, explicit uncertainty, reconstructible history, and authority boundaries. The renderer supplies local mathematical materialization. The publication layer turns social interaction into cited inputs rather than mere promotion.

**The world persists globally. Its meaningful neighborhood renders locally.**

## Non-negotiable semantic boundary

A rendered public signal is a curatorial projection of public material, not a definition of a human being. Citation does not imply endorsement. `OBSERVED`, `INTERPRETED`, `OPEN`, and `INDEPENDENTLY VERIFIED` are distinct epistemic facets. No popularity metric is allowed to masquerade as structural contribution.

## Repository strata

- `apps/web` — public situated-world interface.
- `packages/model` — canonical public-signal and position types.
- `packages/renderer` — deterministic SVG world renderer.
- `packages/relation-seeds` — relation-seed schema and epistemic facets.
- `packages/provenance` — canonicalization and append-only receipt vocabulary.
- `packages/publication` — reviewed 25/25 thread projection; no bulk auto-tagging.
- `data` — versioned public signals and relation-seed fixtures.
- `docs` — charter, architecture, protocols, ADRs, roadmap, QA evidence.
- `legacy/v2.1` — frozen monolithic reference artifact.

## Development

```bash
npm install
npm run check:data
npm run dev
```

The first production milestone is not “rewrite the page.” It is **freeze the semantic contracts, then let multiple render surfaces depend on them**.
