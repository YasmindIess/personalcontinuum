# Publication Protocol — 25 / 25

The first launch sequence contains two manually reviewed threads of 25 ranked public signals each.

## Principle

Automation prepares; a human publishes.

The system may generate deterministic artwork, crop-safe media, post text, deep links, UTM/referrer identifiers, and a publication manifest. It must not convert the 50-person launch into unsolicited bulk auto-mentioning.

## Per-post packet

Each packet contains:

- `signalId`
- `curatorRank`
- X handle
- seven-word projection
- artwork/world URL
- relation-seed URL when one exists
- non-endorsement note
- publication state (`draft`, `reviewed`, `published`, `superseded`)
- resulting post identifier after manual publication

## Attention receipts

The product should measure attention as reconstructible behavior around the public artifact: landing visits, world openings, relation expansions, source inspections, corrections, responses and voluntary claims. It should not treat raw follower count as topological value.


## Deterministic publication manifold

R5 compiles the 50 canonical signals into `blochfield.publication-manifold.v1`:

- exactly two threads;
- exactly 25 entries per thread;
- stable `PUB-P{part}-{position}` identifiers;
- stable `/p/PS-*` deep links;
- H7 fingerprint binding;
- deterministic media keys;
- raw character-count QA;
- explicit review state;
- `manual-review-required` publication authority.

The manifold prepares publication but contains no API call that can publish a post.

## Review surface

The web application exposes `/publication` as a one-screen review cockpit. Selecting an entry opens its canonical situated-world route. The surface is a review tool, not a social-platform automation interface.
