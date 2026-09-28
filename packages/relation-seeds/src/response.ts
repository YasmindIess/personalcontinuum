import type { Receipt } from "@blochfield/provenance";
import type { RelationSeed } from "./index.ts";

export type ResponseIntent="remain-conversational"|"propose-evidence"|"propose-correction"|"propose-relation"|"decline-association";
export type PublicUseConsent="yes"|"no"|"unspecified";

export interface ResponseIngressEvent {
  schema:"blochfield.response-ingress.v1";
  id:`RX-${string}`;
  relationSeedId:`RS-${string}`;
  receivedAt:string;
  actorHandle:string;
  sourceUrl:string;
  sourceDigest:`sha256:${string}`;
  intent:ResponseIntent;
  publicUseConsent:PublicUseConsent;
  statement?:string;
}

export interface ResponseIngressAssessment {
  valid:boolean;
  errors:string[];
  promotionEligible:boolean;
  stopProjectionRecommended:boolean;
  publicEvidenceEligible:boolean;
}

export interface RelationSeedRevisionProposal {
  schema:"blochfield.relation-seed-revision-proposal.v1";
  authority:"proposal-only";
  baseSeedId:`RS-${string}`;
  baseRevision:number;
  proposedRevision:number;
  responseReceipt:Receipt<ResponseIngressEvent>;
  disposition:ResponseIntent;
  publicUseConsent:PublicUseConsent;
  suggestedObserved:string[];
  suggestedInterpreted:string[];
  suggestedOpen:string[];
  stopProjectionRecommended:boolean;
}

const SHA=/^sha256:[a-f0-9]{64}$/i;

export function assessResponseIngress(event:ResponseIngressEvent):ResponseIngressAssessment{
  const errors:string[]=[];
  if(!/^RX-[A-Z0-9-]+$/i.test(event.id))errors.push("id.invalid");
  if(!/^RS-[A-Z0-9-]+$/i.test(event.relationSeedId))errors.push("relation.invalid");
  if(!Number.isFinite(Date.parse(event.receivedAt)))errors.push("receivedAt.invalid");
  try{if(new URL(event.sourceUrl).protocol!=="https:")errors.push("sourceUrl.invalid");}catch{errors.push("sourceUrl.invalid");}
  if(!SHA.test(event.sourceDigest))errors.push("sourceDigest.invalid");
  if(!event.actorHandle.trim())errors.push("actor.missing");
  const valid=errors.length===0;
  const stopProjectionRecommended=event.intent==="decline-association";
  const publicEvidenceEligible=valid&&event.publicUseConsent==="yes"&&event.intent!=="remain-conversational";
  const promotionEligible=publicEvidenceEligible||stopProjectionRecommended;
  return {valid,errors,promotionEligible,stopProjectionRecommended,publicEvidenceEligible};
}

export function createResponseReceipt(event:ResponseIngressEvent):Receipt<ResponseIngressEvent>{
  const assessment=assessResponseIngress(event);
  if(!assessment.valid)throw new Error("Invalid response ingress: "+assessment.errors.join(", "));
  return {schema:"blochfield.receipt.v1",id:event.id+":received",kind:"response-received",occurredAt:event.receivedAt,actor:event.actorHandle,objectId:event.relationSeedId,payload:{...event}};
}

export function proposeRelationSeedRevision(seed:RelationSeed,event:ResponseIngressEvent):RelationSeedRevisionProposal{
  if(seed.id!==event.relationSeedId)throw new Error("Response relationSeedId does not match seed.");
  const assessment=assessResponseIngress(event);
  if(!assessment.valid)throw new Error("Invalid response ingress: "+assessment.errors.join(", "));
  const receipt=createResponseReceipt(event);
  const observed:string[]=[]; const interpreted:string[]=[]; const open:string[]=[];
  if(event.publicUseConsent==="yes"&&event.intent==="propose-evidence")observed.push("A consented participant response proposes additional evidence; source receipt "+receipt.id+" requires curator review.");
  if(event.publicUseConsent==="yes"&&event.intent==="propose-correction")open.push("A consented correction proposal was received at "+event.sourceUrl+" and requires source-bounded adjudication.");
  if(event.publicUseConsent==="yes"&&event.intent==="propose-relation")open.push("A consented relation-extension proposal was received at "+event.sourceUrl+" and requires independent review.");
  if(event.intent==="decline-association")open.push("A decline-association response was received. Public projection should stop or be revised without exposing non-consented response content.");
  if(event.intent==="remain-conversational")open.push("Response remains conversational and is not promoted into public evidence.");
  return {schema:"blochfield.relation-seed-revision-proposal.v1",authority:"proposal-only",baseSeedId:seed.id,baseRevision:seed.revision,proposedRevision:seed.revision+1,responseReceipt:receipt,disposition:event.intent,publicUseConsent:event.publicUseConsent,suggestedObserved:observed,suggestedInterpreted:interpreted,suggestedOpen:open,stopProjectionRecommended:assessment.stopProjectionRecommended};
}

export function applyRevisionProposal(seed:RelationSeed,proposal:RelationSeedRevisionProposal,curatorApproved:boolean):RelationSeed{
  if(!curatorApproved)throw new Error("Revision proposal requires explicit curator approval.");
  if(proposal.authority!=="proposal-only"||proposal.baseSeedId!==seed.id||proposal.baseRevision!==seed.revision)throw new Error("Revision proposal does not match canonical seed state.");
  return {...seed,revision:proposal.proposedRevision,supersedes:seed.id+":r"+seed.revision,observed:[...seed.observed,...proposal.suggestedObserved],interpreted:[...seed.interpreted,...proposal.suggestedInterpreted],open:[...seed.open,...proposal.suggestedOpen],verification:{...seed.verification}};
}
