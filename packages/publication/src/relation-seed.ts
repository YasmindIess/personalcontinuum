import type { RelationSeed } from "@blochfield/relation-seeds";
import { assertPublishableRelationSeed } from "@blochfield/relation-seeds";
import type { Receipt } from "@blochfield/provenance";
import { sha256Canonical } from "@blochfield/provenance";

export interface RelationSeedPublicationPacket {
  schema: "blochfield.relation-seed-publication-packet.v1";
  seed: RelationSeed;
  receipts: Receipt[];
  deepLink: string;
  frozenAt: string;
  digest: `sha256:${string}`;
  publishMode: "manual-review-required";
}

function normalizeBaseUrl(baseUrl:string):string{
  return baseUrl.endsWith("/")?baseUrl.slice(0,-1):baseUrl;
}

function sourceReceipt(seed:RelationSeed,index:number):Receipt{
  const origin=seed.origins[index];
  return {
    schema:"blochfield.receipt.v1",
    id:`${seed.id}:source:${String(index+1).padStart(2,"0")}:r${seed.revision}`,
    kind:"source-ingested",
    occurredAt:origin.capturedAt,
    actor:seed.curator,
    objectId:seed.id,
    payload:{
      originIndex:index,
      role:origin.role,
      handle:origin.handle??null,
      sourceUrl:origin.sourceUrl,
      sourceType:origin.sourceType,
      digest:origin.digest,
    },
  };
}

function seedReceipt(seed:RelationSeed):Receipt{
  return {
    schema:"blochfield.receipt.v1",
    id:`${seed.id}:created:r${seed.revision}`,
    kind:"relation-seed-created",
    occurredAt:seed.createdAt,
    actor:seed.curator,
    objectId:seed.id,
    parent:seed.supersedes,
    payload:{
      revision:seed.revision,
      originReceipts:seed.origins.map((_,index)=>`${seed.id}:source:${String(index+1).padStart(2,"0")}:r${seed.revision}`),
      observedCount:seed.observed.length,
      interpretedCount:seed.interpreted.length,
      openCount:seed.open.length,
      independentVerification:seed.verification.independent,
    },
  };
}

export async function freezeRelationSeedPacket(
  seed:RelationSeed,
  baseUrl:string,
  frozenAt=seed.createdAt,
):Promise<RelationSeedPublicationPacket>{
  assertPublishableRelationSeed(seed);
  if(!Number.isFinite(Date.parse(frozenAt)))throw new Error("frozenAt must be an absolute timestamp.");
  const receipts=[...seed.origins.map((_,index)=>sourceReceipt(seed,index)),seedReceipt(seed)];
  const unsigned={
    schema:"blochfield.relation-seed-publication-packet.v1" as const,
    seed,
    receipts,
    deepLink:normalizeBaseUrl(baseUrl)+"/r/"+encodeURIComponent(seed.id),
    frozenAt,
    publishMode:"manual-review-required" as const,
  };
  return {...unsigned,digest:await sha256Canonical(unsigned)};
}
