# Response Ingress Protocol v0.1

A platform reply, quoted post, correction, relation proposal, or decline is first captured as a `blochfield.response-ingress.v1` event.

## Invariant

`chat / reply ≠ evidence ≠ Relation Seed revision ≠ public projection`

Capture does not promote.

## Intent vocabulary

- `remain-conversational`
- `propose-evidence`
- `propose-correction`
- `propose-relation`
- `decline-association`

Every captured event carries source URL, SHA-256 digest, timestamp, actor handle, relation target, public-use consent, and intent.

## Consent boundary

Public evidence promotion requires explicit `publicUseConsent: yes`.

A decline-association event is operationally actionable even when its content is not consented for public use: the kernel sets `stopProjectionRecommended` without exposing the response as public evidence.

## Append-only reconstitution

A valid response creates a `response-received` receipt.

The kernel can then create a `blochfield.relation-seed-revision-proposal.v1`, but that object has fixed authority `proposal-only`.

Applying it to canonical state requires an explicit curator-approval argument. The base seed is never mutated in place; an approved result increments revision and records `supersedes`.

Response receipts remain distinct from independent-verification receipts.

## Adapter boundary

R6 does not assume X API access. A future X user-context adapter or manual URL attachment may produce the same ingress event contract. Platform transport is therefore replaceable without changing relation semantics.
