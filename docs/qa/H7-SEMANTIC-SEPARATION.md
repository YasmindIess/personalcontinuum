# H7 Semantic Separation Audit

This QA gate tests whether the fifty compiled Semantic Heptads remain distinct at the executable level before visual inspection.

It evaluates all 1,225 unordered pairs.

## Distance components

- **action** — ordinal disagreement across the seven semantic actions.
- **vector** — normalized distance across curvature, symmetry, density, scale, connectivity, rhythm, radiality and polarity.
- **path** — distance across the seven transported semantic states, including circular angle/phase distance.

The diagnostic total is:

`0.34 action + 0.38 vector + 0.28 path`

This is a renderer-regression diagnostic, not a statement about distance between people.

## Hard gate

CI fails on:

1. duplicate H7 fingerprints;
2. exact executable signatures after compilation.

Near pairs are reported rather than automatically rejected because semantic proximity may be legitimate. They must be inspected in the visual contact sheet before any future hard separation threshold is introduced.

## Command

`npm run check:heptads`

The normal `npm run check` includes this audit.
