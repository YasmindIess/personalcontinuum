import fs from "node:fs";
import { assessRelationSeed, relationSeedPublishable, type RelationSeed } from "../packages/relation-seeds/src/index.ts";
import { freezeRelationSeedPacket } from "../packages/publication/src/index.ts";

const placeholder=JSON.parse(
  fs.readFileSync(new URL("../data/relation-seeds.example.json",import.meta.url),"utf8"),
) as RelationSeed;

const placeholderIssues=assessRelationSeed(placeholder);
if(relationSeedPublishable(placeholder))throw new Error("RS-0001 placeholder unexpectedly became publishable.");
if(!placeholderIssues.some(issue=>issue.code==="origin.sourceUrl.invalid"))throw new Error("placeholder must fail on source URL.");
if(!placeholderIssues.some(issue=>issue.code==="origin.digest.missing"))throw new Error("placeholder must fail on missing source digest.");
if(!placeholderIssues.some(issue=>issue.code==="observed.missing"))throw new Error("placeholder must fail on missing observed evidence.");

const synthetic:RelationSeed={
  schema:"blochfield.relation-seed.v1",
  id:"RS-CI-0001",
  createdAt:"2026-09-28T21:30:00.000Z",
  curator:"@ci",
  origins:[
    {
      role:"founder",
      handle:"@founder",
      sourceUrl:"https://source.test/founder-post",
      sourceType:"post",
      capturedAt:"2026-09-28T21:28:00.000Z",
      digest:"sha256:"+"a".repeat(64),
    },
    {
      role:"participant",
      handle:"@participant",
      sourceUrl:"https://source.test/participant-post",
      sourceType:"post",
      capturedAt:"2026-09-28T21:29:00.000Z",
      digest:"sha256:"+"b".repeat(64),
    },
  ],
  observed:["Two cited public sources are present in the synthetic CI fixture."],
  interpreted:["The fixture tests separation between direct observation and bounded interpretation."],
  open:["No public claim is made by this CI-only fixture."],
  verification:{independent:"deferred",receipts:[]},
  association:"citation-does-not-imply-endorsement",
  externalAuthority:"none",
  revision:1,
};

if(!relationSeedPublishable(synthetic)){
  throw new Error("synthetic complete Relation Seed should pass admissibility: "+JSON.stringify(assessRelationSeed(synthetic)));
}

const packet=await freezeRelationSeedPacket(synthetic,"https://continuum.test","2026-09-28T21:31:00.000Z");
if(packet.schema!=="blochfield.relation-seed-publication-packet.v1")throw new Error("wrong packet schema");
if(packet.receipts.length!==3)throw new Error("expected two source receipts and one seed receipt");
if(packet.deepLink!=="https://continuum.test/r/RS-CI-0001")throw new Error("unexpected deep link");
if(!/^sha256:[a-f0-9]{64}$/.test(packet.digest))throw new Error("packet digest is not SHA-256");
if(packet.publishMode!=="manual-review-required")throw new Error("relation packet must remain manual-review-required");

console.log(
  `PASS: R4 gate rejects placeholder RS-0001 with ${placeholderIssues.filter(issue=>issue.severity==="error").length} errors; synthetic seed freezes to ${packet.digest.slice(0,19)}… with ${packet.receipts.length} deterministic receipts.`,
);
