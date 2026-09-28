import type { RelationSeed } from "./index.ts";

export type RelationSeedIssueCode =
  | "schema.invalid"
  | "id.invalid"
  | "createdAt.invalid"
  | "curator.missing"
  | "origin.founder.missing"
  | "origin.participant.missing"
  | "origin.sourceUrl.invalid"
  | "origin.capturedAt.invalid"
  | "origin.digest.missing"
  | "origin.digest.invalid"
  | "observed.missing"
  | "relation.question.missing"
  | "verification.receipt.missing"
  | "revision.invalid"
  | "supersedes.missing";

export interface RelationSeedIssue {
  code: RelationSeedIssueCode;
  path: string;
  message: string;
  severity: "error" | "warning";
}

const PLACEHOLDER=/^(PENDING|TBD|TODO|UNKNOWN)$/i;
const TAG_PLACEHOLDER=/TAGGED_USER|PLACEHOLDER|EXAMPLE/i;
const SHA256=/^sha256:[a-f0-9]{64}$/i;

function absoluteIso(value:string){
  if(!value||PLACEHOLDER.test(value))return false;
  const t=Date.parse(value);
  return Number.isFinite(t) && /T/.test(value);
}
function httpsUrl(value:string){
  if(!value||PLACEHOLDER.test(value)||TAG_PLACEHOLDER.test(value))return false;
  try{return new URL(value).protocol==="https:";}catch{return false;}
}

export function assessRelationSeed(seed:RelationSeed):RelationSeedIssue[]{
  const issues:RelationSeedIssue[]=[];
  const error=(code:RelationSeedIssueCode,path:string,message:string)=>issues.push({code,path,message,severity:"error"});
  const warning=(code:RelationSeedIssueCode,path:string,message:string)=>issues.push({code,path,message,severity:"warning"});

  if(seed.schema!=="blochfield.relation-seed.v1")error("schema.invalid","schema","Unexpected Relation Seed schema.");
  if(!/^RS-[A-Z0-9-]+$/.test(seed.id))error("id.invalid","id","Relation Seed id must be stable and RS-prefixed.");
  if(!absoluteIso(seed.createdAt))error("createdAt.invalid","createdAt","createdAt must be an absolute ISO timestamp.");
  if(!seed.curator.trim()||PLACEHOLDER.test(seed.curator))error("curator.missing","curator","A curator identifier is required.");
  if(!Number.isInteger(seed.revision)||seed.revision<1)error("revision.invalid","revision","Revision must be an integer >= 1.");
  if(seed.revision>1&&!seed.supersedes)warning("supersedes.missing","supersedes","Later revisions should name the prior seed revision they supersede.");

  if(!seed.origins.some(origin=>origin.role==="founder"))error("origin.founder.missing","origins","At least one founder origin is required.");
  if(!seed.origins.some(origin=>origin.role==="participant"))error("origin.participant.missing","origins","At least one participant origin is required.");

  seed.origins.forEach((origin,index)=>{
    const base=`origins[${index}]`;
    if(!httpsUrl(origin.sourceUrl))error("origin.sourceUrl.invalid",base+".sourceUrl","Source URL must be a non-placeholder HTTPS URL.");
    if(!absoluteIso(origin.capturedAt))error("origin.capturedAt.invalid",base+".capturedAt","capturedAt must be an absolute ISO timestamp.");
    if(!origin.digest)error("origin.digest.missing",base+".digest","Frozen publication requires a source digest.");
    else if(!SHA256.test(origin.digest))error("origin.digest.invalid",base+".digest","Source digest must use sha256:<64 lowercase-or-uppercase hex characters>.");
  });

  if(seed.observed.length===0)error("observed.missing","observed","At least one directly source-supported observation is required.");
  if(seed.interpreted.length===0&&seed.open.length===0)error("relation.question.missing","interpreted/open","A bounded interpretation or open question is required.");

  if(seed.verification.independent==="verified"&&seed.verification.receipts.length===0){
    error("verification.receipt.missing","verification.receipts","Independent verification cannot be marked verified without receipts.");
  }

  return issues;
}

export function relationSeedPublishable(seed:RelationSeed):boolean{
  return assessRelationSeed(seed).every(issue=>issue.severity!=="error");
}

export function assertPublishableRelationSeed(seed:RelationSeed):void{
  const errors=assessRelationSeed(seed).filter(issue=>issue.severity==="error");
  if(errors.length){
    throw new Error("Relation Seed is not publishable: "+errors.map(issue=>issue.code+"@"+issue.path).join(", "));
  }
}
