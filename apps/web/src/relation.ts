import { assessRelationSeed, facets, relationSeedPublishable, type RelationSeed } from "@blochfield/relation-seeds";
import { freezeRelationSeedPacket } from "@blochfield/publication";

const node=<K extends keyof HTMLElementTagNameMap>(tag:K,className?:string,text?:string)=>{
  const n=document.createElement(tag);
  if(className)n.className=className;
  if(text!==undefined)n.textContent=text;
  return n;
};

function facetSection(title:string,values:string[],empty:string){
  const wrap=node("section","pc-rel-section");
  wrap.append(node("h2","",title));
  if(values.length===0)wrap.append(node("p","pc-rel-empty",empty));
  else{
    const list=node("ol","pc-rel-list");
    for(const value of values)list.append(node("li","",value));
    wrap.append(list);
  }
  return wrap;
}

export async function renderRelationSurface(seed:RelationSeed,baseUrl:string,onExit:()=>void):Promise<HTMLElement>{
  const publishable=relationSeedPublishable(seed);
  const issues=assessRelationSeed(seed);
  const root=node("section","pc-relation-surface");
  root.dataset.publishable=String(publishable);

  const hud=node("header","pc-rel-hud");
  const identity=node("div","pc-rel-identity");
  identity.append(node("strong","",seed.id),node("span","","revision "+seed.revision+" · relation seed"));
  const state=node("div","pc-rel-state");
  state.append(
    node("b","",publishable?"ADMISSIBLE / REVIEW REQUIRED":"BLOCKED / DRAFT"),
    node("span","",publishable?"packet may be frozen after manual review":String(issues.filter(x=>x.severity==="error").length)+" admissibility errors"),
  );
  const exit=node("button","pc-rel-exit","back to continuum");
  exit.type="button"; exit.onclick=onExit;
  hud.append(identity,state,exit);
  root.append(hud);

  const body=node("main","pc-rel-body");
  const title=node("div","pc-rel-title");
  title.append(
    node("span","pc-rel-kicker","PUBLIC RELATION / BOUNDED PROPOSITION"),
    node("h1","",seed.origins.map(origin=>origin.handle??origin.role).join(" ↔ ")),
    node("p","","A Relation Seed records a cited relation worth exploring. Citation does not imply endorsement; interpretation does not imply verification."),
  );
  body.append(title);

  const facetRow=node("div","pc-rel-facets");
  const active=new Set(facets(seed));
  for(const name of ["OBSERVED","INTERPRETED","OPEN","INDEPENDENTLY_VERIFIED"] as const){
    const item=node("span","",name); item.dataset.active=String(active.has(name)); facetRow.append(item);
  }
  body.append(facetRow);

  const origins=node("section","pc-rel-origins");
  origins.append(node("h2","","CITED ORIGINS"));
  const originGrid=node("div","pc-rel-origin-grid");
  seed.origins.forEach((origin,index)=>{
    const card=node("article","pc-rel-origin");
    card.append(node("span","pc-rel-origin-index",String(index+1).padStart(2,"0")),node("strong","",origin.handle??origin.role),node("em","",origin.role+" · "+origin.sourceType));
    if(/^https:\/\//i.test(origin.sourceUrl)){
      const a=node("a","pc-rel-source","inspect cited source"); a.href=origin.sourceUrl; a.target="_blank"; a.rel="noopener noreferrer"; card.append(a);
    }else card.append(node("span","pc-rel-source pc-rel-source-blocked","source unavailable / placeholder"));
    card.append(node("code","",origin.digest??"digest pending"));
    originGrid.append(card);
  });
  origins.append(originGrid);
  body.append(origins);

  const facetsGrid=node("div","pc-rel-facet-grid");
  facetsGrid.append(
    facetSection("OBSERVED",seed.observed,"No source-supported observation has been frozen."),
    facetSection("INTERPRETED",seed.interpreted,"No bounded interpretation has been frozen."),
    facetSection("OPEN",seed.open,"No unresolved questions are recorded."),
  );
  body.append(facetsGrid);

  if(publishable){
    const packet=await freezeRelationSeedPacket(seed,baseUrl,seed.createdAt);
    const packetBox=node("section","pc-rel-packet");
    packetBox.append(
      node("strong","","FROZEN PACKET / MANUAL REVIEW REQUIRED"),
      node("code","",packet.digest),
      node("span","",packet.deepLink),
      node("span","",String(packet.receipts.length)+" provenance receipts · "+packet.publishMode),
    );
    body.append(packetBox);
  }else{
    const gate=node("section","pc-rel-gate"); gate.append(node("strong","","PUBLICATION GATE"));
    const list=node("ul","");
    for(const issue of issues.filter(x=>x.severity==="error"))list.append(node("li","",issue.code+" · "+issue.message));
    gate.append(list); body.append(gate);
  }

  const boundary=node("footer","pc-rel-boundary","This surface does not grant external authority, infer endorsement, or convert interpretation into independent verification.");
  body.append(boundary); root.append(body);
  return root;
}

export function renderMissingRelation(id:string,onExit:()=>void):HTMLElement{
  const root=node("section","pc-relation-surface");
  const hud=node("header","pc-rel-hud");
  const identity=node("div","pc-rel-identity"); identity.append(node("strong","",id),node("span","","relation not found"));
  const exit=node("button","pc-rel-exit","back to continuum"); exit.onclick=onExit;
  hud.append(identity,node("div","pc-rel-state","NO CANONICAL SEED"),exit);
  const body=node("main","pc-rel-body");
  body.append(node("h1","","No canonical Relation Seed exists at this address."),node("p","pc-rel-empty","Nothing was inferred or synthesized to fill the missing relation."));
  root.append(hud,body); return root;
}
