import { compileSemanticHeptad, type PublicSignal } from "@blochfield/continuum-model";

export type PublicationReviewState="draft"|"approved"|"published"|"withdrawn";
export interface PublicationManifestEntry {
  schema:"blochfield.publication-entry.v1"; id:`PUB-P${1|2}-${string}`; part:1|2; position:number;
  signalId:string; tag:string; h7Fingerprint:`H7-${string}`; deepLink:string; mediaKey:string;
  text:string; characterCount:number; reviewState:PublicationReviewState; publishMode:"manual-review-required"; publishedPostId?:string;
}
export interface PublicationManifold {schema:"blochfield.publication-manifold.v1";baseUrl:string;entryCount:50;threads:{1:PublicationManifestEntry[];2:PublicationManifestEntry[]};}
export interface PublicationIssue {code:string;entryId?:string;message:string;}
const normalizeBase=(value:string)=>value.endsWith("/")?value.slice(0,-1):value;

export function buildPublicationManifold(signals:PublicSignal[],baseUrl:string):PublicationManifold{
  if(signals.length!==50)throw new Error("Publication manifold requires exactly 50 canonical signals.");
  const base=normalizeBase(baseUrl);
  const entries=signals.slice().sort((a,b)=>a.rank-b.rank).map(signal=>{
    const part:1|2=signal.rank<=25?1:2;
    const position=part===1?signal.rank:signal.rank-25;
    const heptad=compileSemanticHeptad(signal);
    const deepLink=base+"/p/"+encodeURIComponent(signal.id);
    const text=signal.handle+" — "+signal.projection7+"\n\nA rendered public signal in Personal Continuum. Citation does not imply endorsement.\n"+deepLink;
    return {schema:"blochfield.publication-entry.v1" as const,id:("PUB-P"+part+"-"+String(position).padStart(2,"0")) as PublicationManifestEntry["id"],part,position,signalId:signal.id,tag:signal.handle,h7Fingerprint:heptad.fingerprint,deepLink,mediaKey:"world:"+signal.id+":"+heptad.fingerprint,text,characterCount:Array.from(text).length,reviewState:"draft" as const,publishMode:"manual-review-required" as const};
  });
  return {schema:"blochfield.publication-manifold.v1",baseUrl:base,entryCount:50,threads:{1:entries.filter(x=>x.part===1),2:entries.filter(x=>x.part===2)}};
}

export function assessPublicationManifold(manifold:PublicationManifold):PublicationIssue[]{
  const issues:PublicationIssue[]=[]; const entries=[...manifold.threads[1],...manifold.threads[2]];
  if(entries.length!==50)issues.push({code:"count.invalid",message:"Expected exactly 50 publication entries."});
  if(manifold.threads[1].length!==25||manifold.threads[2].length!==25)issues.push({code:"threads.invalid",message:"Expected two exact 25-entry threads."});
  const ids=new Set<string>(),signals=new Set<string>(),links=new Set<string>(),media=new Set<string>();
  for(const entry of entries){
    if(ids.has(entry.id))issues.push({code:"id.duplicate",entryId:entry.id,message:"Duplicate publication entry id."}); ids.add(entry.id);
    if(signals.has(entry.signalId))issues.push({code:"signal.duplicate",entryId:entry.id,message:"Signal appears more than once."}); signals.add(entry.signalId);
    if(links.has(entry.deepLink))issues.push({code:"link.duplicate",entryId:entry.id,message:"Deep link appears more than once."}); links.add(entry.deepLink);
    if(media.has(entry.mediaKey))issues.push({code:"media.duplicate",entryId:entry.id,message:"Media key appears more than once."}); media.add(entry.mediaKey);
    if(entry.characterCount>280)issues.push({code:"text.over-280",entryId:entry.id,message:"Raw draft exceeds 280 Unicode code points."});
    if(!entry.tag.startsWith("@")||!entry.text.startsWith(entry.tag+" — "))issues.push({code:"tag.invalid",entryId:entry.id,message:"Draft must start with its exact tag."});
    if(entry.publishMode!=="manual-review-required")issues.push({code:"authority.invalid",entryId:entry.id,message:"Automated publication authority is forbidden."});
    if(entry.reviewState==="published"&&!entry.publishedPostId)issues.push({code:"published.id-missing",entryId:entry.id,message:"Published state requires a platform post id."});
    if(/PENDING|TAGGED_USER|PLACEHOLDER/i.test(entry.text+entry.deepLink))issues.push({code:"placeholder.present",entryId:entry.id,message:"Publication draft contains placeholder material."});
  }
  return issues;
}
export function assertPublicationManifold(manifold:PublicationManifold):void{const issues=assessPublicationManifold(manifold);if(issues.length)throw new Error("Publication manifold invalid: "+issues.map(x=>x.code+(x.entryId?"@"+x.entryId:"")).join(", "));}
