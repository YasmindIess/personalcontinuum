export * from "./heptad";

export type VoiceStance = "I" | "YOU" | "THEY";
export type EvidenceConfidence = "high" | "medium" | "provisional";
export type OperatorFamily = "loop" | "lattice" | "attractor" | "orbit" | "braid" | "interference" | "fold" | "field" | "recursion" | "wave";

export interface SituatedPosition {
  status: "uncomputed" | "computed" | "challenged";
  provenance: number | null;
  distinctiveness: number | null;
  bridgeContribution: number | null;
  corridorContribution: number | null;
  reliability: number | null;
}

export interface OperatorIdentity {
  operatorId: `OI-${string}`;
  family: OperatorFamily;
  primaryFamily: OperatorFamily;
  secondaryFamily: OperatorFamily;
  deformation: string;
  topologyMotif: string;
  corridorMode: string;
  seed: number;
  rendererVersion: string;
}

export interface PublicSignal {
  id: string;
  rank: number;
  curatorRank: number;
  name: string;
  handle: string;
  projection7: string;
  style: string;
  themes: string;
  persona: string;
  evidenceConfidence: EvidenceConfidence;
  voiceStance: VoiceStance;
  voiceStanceStatus: "legacy-seeded" | "curated" | "relation-derived";
  /** @deprecated V3 rendering is generated from projection7 via SemanticHeptad. Retained as a compatibility witness. */
  render: OperatorIdentity;
  position: SituatedPosition;
  relationSeeds: string[];
}

export interface PublicSignalManifest {
  schema: "blochfield.personal-continuum.public-signals.v1";
  generatedFrom: string;
  signals: PublicSignal[];
}
