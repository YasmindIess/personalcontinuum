# Evidential Topology Protocol v0.1

## Purpose

R7 derives topology only from admissible Relation Seeds. It does not infer relations from visual similarity, H7 semantic distance, follower counts, curator rank, shared keywords, or social popularity.

The public-signal registry may contain many origins while the evidential graph contains zero edges. That is a valid state.

## Canonical construction

`PublicSignal[] + admissible RelationSeed[] → EvidentialGraph → artifact metrics → situated positions`

A Relation Seed contributes structural edges only when it passes the R4 publication admissibility gate.

Founder and participant origins are treated as principal relation members. Context origins support provenance but do not silently become structural endpoints.

When a Relation Seed has more than two principal origins, R7 currently projects its hyperedge to a pairwise clique and declares the loss explicitly as:

`principal-hyperedge-to-pairwise-clique`

This projection must remain inspectable and replaceable.

## Metrics

All metrics are bounded to `[0,1]` and describe the evidenced graph, not a person.

### Provenance support — π

Incident Relation Seeds contribute source-digest coverage, directly observed evidence, and revision lineage. π is the mean incident provenance support.

### Distinctiveness — δ

δ measures how non-redundant a node's evidenced neighborhood is relative to its neighbors. It is based on neighborhood overlap, not linguistic or human uniqueness.

### Bridge contribution — β

β measures articulation impact under counterfactual removal. R7 evaluates the graph operation:

`M → M \ P_i`

and observes changes in connected components.

### Corridor contribution — κ

κ is normalized unweighted node betweenness over the admissible evidence graph. It estimates participation in shortest relation paths.

### Reliability — ρ

ρ combines explicit independent-verification state with the amount of directly observed evidence on incident Relation Seeds.

A response receipt is not an independent-verification receipt.

## Counterfactual removal

For any graph node, R7 can report:

- component delta;
- incident edges lost;
- reachable unordered node-pairs lost;
- reachable-pair loss ratio.

Removal is a graph experiment only. It does not represent removal, ranking, or diminished value of a human being.

## Provenance-bearing corridors

A corridor is a shortest multi-hop path whose every edge clears configurable minimum provenance and reliability thresholds.

The first implementation uses:

- minimum path length: 2 edges;
- minimum provenance: 0.60;
- minimum reliability: 0.50.

Corridors are evidence-conditioned graph objects. They are not inferred from the H7 visual grammar.

## Computation gate

A public origin with degree zero remains:

`status: uncomputed`

with π/δ/β/κ/ρ all `null`.

No fallback, rank-derived, random, semantic-similarity, or visual-similarity value is permitted.

## Current production state

The shipped `RS-0001` fixture is blocked by R4 admissibility. Therefore it contributes zero R7 edges. Until real admissible Relation Seeds are present, the canonical 50-origin public graph correctly reports zero relation coverage and zero computed situated positions.

Synthetic graphs may be used in CI only to falsify the algorithms.

## UI

`/topology` is an inspection surface.

The circular node arrangement is display-only. Radius, angle, and Euclidean distance in that layout do not encode similarity, rank, value, or topology metrics.

When admissible edges arrive, the same surface renders only those evidence-backed edges and exposes π/δ/β/κ/ρ per connected public origin.
