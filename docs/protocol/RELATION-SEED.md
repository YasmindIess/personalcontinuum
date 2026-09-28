# Relation Seed Protocol v0.1

A **Relation Seed** is a bounded, inspectable proposition that a public relation is worth exploring between two or more situated origins.

It is not a profile of another person, not a claim of endorsement, and not a grant of execution authority.

## Epistemic facets

- `OBSERVED` — directly supported by cited public material.
- `INTERPRETED` — Blochfield's explicitly derived reading.
- `OPEN` — unresolved, disputable, or awaiting context.
- `INDEPENDENTLY_VERIFIED` — reserved for a separate verification act with receipts.

These facets are intentionally not a single linear status. A seed may simultaneously contain observed facts, interpreted structure, and open questions.

## Lifecycle

`source -> ingress -> evidence receipt -> observation -> bounded interpretation -> admissibility -> public projection -> invitation -> response -> new receipt -> reconstitution`

## RS-0001 launch constraint

The first public seed may bind `@msiyasmsi` and one cited public participant. The repository ships only a placeholder fixture. Source URLs, quoted material, observation text, and interpretation text must be populated from the actual launch evidence before publication.


## Publication admissibility gate

A Relation Seed may exist as a draft before it is publishable. Freezing a public packet requires:

- stable `RS-*` identity and absolute creation timestamp;
- at least one founder origin and one participant origin;
- non-placeholder HTTPS source URLs;
- absolute capture timestamps;
- `sha256:...` source digests;
- at least one directly source-supported observation;
- at least one bounded interpretation or open question;
- a receipt whenever independent verification is marked verified;
- revision lineage for later revisions.

The repository's shipped `RS-0001` placeholder MUST fail this gate until real launch evidence replaces `PENDING` values.

## Frozen packet

A publishable seed freezes into `blochfield.relation-seed-publication-packet.v1` containing the seed, deterministic source-ingest receipts, a relation-seed-created receipt, stable deep link, freeze timestamp, manual-review publication mode, and SHA-256 canonical digest.
