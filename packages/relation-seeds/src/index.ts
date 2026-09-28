export * from "./response.ts";
export * from "./admissibility.ts";

export type EvidenceFacet = "OBSERVED" | "INTERPRETED" | "OPEN" | "INDEPENDENTLY_VERIFIED";
export type IndependentVerification = "deferred" | "pending" | "verified" | "rejected";

export interface CitedOrigin {
  role: "founder" | "participant" | "context";
  handle?: string;
  sourceUrl: string;
  sourceType: "post" | "profile" | "article" | "artifact" | "other";
  capturedAt: string;
  digest?: string;
}

export interface RelationSeed {
  schema: "blochfield.relation-seed.v1";
  id: `RS-${string}`;
  createdAt: string;
  curator: string;
  origins: CitedOrigin[];
  observed: string[];
  interpreted: string[];
  open: string[];
  verification: { independent: IndependentVerification; receipts: string[] };
  association: "citation-does-not-imply-endorsement";
  externalAuthority: "none";
  revision: number;
  supersedes?: string;
}

export function facets(seed: RelationSeed): EvidenceFacet[] {
  const out: EvidenceFacet[] = [];
  if (seed.observed.length) out.push("OBSERVED");
  if (seed.interpreted.length) out.push("INTERPRETED");
  if (seed.open.length) out.push("OPEN");
  if (seed.verification.independent === "verified") out.push("INDEPENDENTLY_VERIFIED");
  return out;
}
