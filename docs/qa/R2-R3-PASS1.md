# R2/R3 Pass 1 — Compound Worlds + Responsive Disclosure

Date: 2026-09-28  
Branch: `feat/r2-r3-operator-worlds`  
Base checkpoint: `03d356d`  
Status: implementation patch prepared; visual QA required before merge.

## Problem isolated from V2.1

The canonical manifest already defines a seven-coordinate operator identity for every origin slot:

`primary × secondary × deformation × topology × corridor × seed × rendererVersion`

The modular renderer was only consuming `primaryFamily`. This made the data semantically richer than the actual artwork and visually recreated the old ten-family repetition cycle.

Mobile also compressed the interface by cropping away the evidential and relational context rather than disclosing it progressively.

## Pass 1 implementation

### Renderer

The situated SVG renderer now consumes:

- primary operator family;
- secondary operator family;
- deterministic deformation transform;
- topology motif;
- corridor behavior;
- deterministic seed;
- evidence-confidence origin halo.

Topology motifs and corridor modes become real SVG procedures rather than metadata labels.

The secondary family is rendered as a lower-opacity cross-pressure so two worlds sharing the same primary family no longer collapse to the same composition.

### Web shell

The active world now exposes:

- explicit `I / YOU / THEY` stance meaning;
- public evidence confidence;
- current Relation Seed count;
- position computation state;
- operator identity signature;
- epistemic-state controls;
- the citation/endorsement boundary.

Hash routes (`#PS-0001`, etc.) provide a stable low-complexity deep-link substrate for later publication manifests.

### Mobile

At `<=700px`:

- SVG density is reduced, but operator identity is unchanged;
- artwork occupies the upper field and fades before the semantic disclosure zone;
- the seven-word projection is capped to a smaller mobile scale;
- evidence and relation cues remain visible;
- microtype is normalized to 12px;
- navigation becomes a centered 44px touch control;
- `INDEPENDENTLY VERIFIED` is hidden from the compact row until a later disclosure interaction exists.

## Non-goals

This pass does NOT:

- compute situated-position numbers;
- create Relation Seed 001;
- automate X publication;
- invite chat participants;
- create claim or airdrop eligibility;
- assert that operator geometry measures human value.

## Verification gate

Before committing this pass as complete:

1. `npm run check`
2. desktop screenshot for at least ranks 01, 02, 10, 11, 25, 26, 40, 50
3. mobile screenshot for the same ranks at 390×844
4. compare same-primary-family pairs for visible individuation
5. confirm no seven-word projection clips behind the footer
6. confirm stance/evidence/relation cues remain readable without zoom
