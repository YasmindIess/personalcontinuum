import fs from "node:fs";
import { buildPublicationManifold, assessPublicationManifold } from "../packages/publication/src/index.ts";
import { assessResponseIngress, applyRevisionProposal, proposeRelationSeedRevision, type RelationSeed, type ResponseIngressEvent } from "../packages/relation-seeds/src/index.ts";
import type { PublicSignalManifest } from "../packages/model/src/index.ts";

const manifest=JSON.parse(fs.readFileSync(new URL("../data/public-signals.v1.json",import.meta.url),"utf8")) as PublicSignalManifest;
const manifold=buildPublicationManifold(manifest.signals,"https://continuum.test");
const publicationIssues=assessPublicationManifold(manifold);
if(publicationIssues.length)throw new Error("publication manifold issues: "+JSON.stringify(publicationIssues));
if(manifold.threads[1].length!==25||manifold.threads[2].length!==25)throw new Error("publication split is not 25/25");
if(new Set([...manifold.threads[1],...manifold.threads[2]].map(x=>x.signalId)).size!==50)throw new Error("publication signals are not unique");

const seed:RelationSeed={
  schema:"blochfield.relation-seed.v1",id:"RS-CI-RESP",createdAt:"2026-09-28T21:40:00.000Z",curator:"@ci",
  origins:[
    {role:"founder",handle:"@founder",sourceUrl:"https://source.test/f",sourceType:"post",capturedAt:"2026-09-28T21:38:00.000Z",digest:"sha256:"+"a".repeat(64)},
    {role:"participant",handle:"@participant",sourceUrl:"https://source.test/p",sourceType:"post",capturedAt:"2026-09-28T21:39:00.000Z",digest:"sha256:"+"b".repeat(64)},
  ],
  observed:["Synthetic CI relation source exists."],interpreted:["Synthetic CI interpretation."],open:[],
  verification:{independent:"deferred",receipts:[]},association:"citation-does-not-imply-endorsement",externalAuthority:"none",revision:1,
};
const before=JSON.stringify(seed);
const event:ResponseIngressEvent={
  schema:"blochfield.response-ingress.v1",id:"RX-CI-0001",relationSeedId:"RS-CI-RESP",receivedAt:"2026-09-28T21:41:00.000Z",
  actorHandle:"@participant",sourceUrl:"https://source.test/reply",sourceDigest:("sha256:"+"c".repeat(64)) as `sha256:${string}`,
  intent:"propose-correction",publicUseConsent:"yes",statement:"Synthetic correction.",
};
const assessment=assessResponseIngress(event);
if(!assessment.valid||!assessment.promotionEligible||!assessment.publicEvidenceEligible)throw new Error("consented correction should be promotion-eligible");
const proposal=proposeRelationSeedRevision(seed,event);
if(proposal.authority!=="proposal-only"||proposal.proposedRevision!==2)throw new Error("response did not produce proposal-only revision 2");
if(JSON.stringify(seed)!==before)throw new Error("proposal mutated canonical seed");
let blocked=false;try{applyRevisionProposal(seed,proposal,false);}catch{blocked=true;}
if(!blocked)throw new Error("revision applied without curator approval");
const revised=applyRevisionProposal(seed,proposal,true);
if(revised.revision!==2||revised.supersedes!=="RS-CI-RESP:r1")throw new Error("approved revision lineage is invalid");
if(revised.verification.receipts.length!==0)throw new Error("response receipt leaked into independent-verification receipts");

const privateDecline={...event,id:"RX-CI-0002" as const,intent:"decline-association" as const,publicUseConsent:"no" as const};
const decline=assessResponseIngress(privateDecline);
if(!decline.stopProjectionRecommended||decline.publicEvidenceEligible)throw new Error("private decline boundary failed");

const conversational={...event,id:"RX-CI-0003" as const,intent:"remain-conversational" as const,publicUseConsent:"yes" as const};
const convo=assessResponseIngress(conversational);
if(convo.promotionEligible||convo.publicEvidenceEligible)throw new Error("conversational response was improperly promotable");

console.log("PASS: R5 50-entry 25/25 manual-review manifold; R6 append-only response ingress, consent boundary, decline handling, and curator-gated reconstitution.");
