import type { PublicSignal } from "@blochfield/continuum-model";
import { assessPublicationManifold, buildPublicationManifold } from "@blochfield/publication";

const node=<K extends keyof HTMLElementTagNameMap>(tag:K,className?:string,text?:string)=>{const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;};

export function renderPublicationSurface(signals:PublicSignal[],baseUrl:string,onOpen:(signalId:string)=>void,onExit:()=>void):HTMLElement{
  const manifold=buildPublicationManifold(signals,baseUrl);
  const issues=assessPublicationManifold(manifold);
  const root=node("section","pc-publication-surface");
  const hud=node("header","pc-pub-hud");
  const left=node("div","pc-pub-title");
  left.append(node("strong","","PUBLICATION MANIFOLD"),node("span","","two manual-review threads · deterministic 25 + 25"));
  const status=node("div","pc-pub-status");
  status.append(node("b","",issues.length===0?"READY FOR HUMAN REVIEW":"BLOCKED"),node("span","",issues.length===0?"50 drafts · 0 automatic publishes":String(issues.length)+" manifest issues"));
  const exit=node("button","pc-pub-exit","back to continuum");exit.onclick=onExit;
  hud.append(left,status,exit);root.append(hud);

  const body=node("main","pc-pub-body");
  for(const part of [1,2] as const){
    const column=node("section","pc-pub-thread");
    const head=node("div","pc-pub-thread-head");
    head.append(node("strong","","THREAD "+part),node("span","",part===1?"ranks 01–25":"ranks 26–50"));
    column.append(head);
    const list=node("div","pc-pub-list");
    for(const entry of manifold.threads[part]){
      const card=node("button","pc-pub-entry");card.type="button";card.dataset.review=entry.reviewState;
      const pos=node("b","pc-pub-pos",String(entry.position).padStart(2,"0"));
      const text=node("div","pc-pub-copy");
      text.append(node("strong","",entry.tag),node("span","",entry.text.split("\n")[0].replace(entry.tag+" — ","")));
      const meta=node("div","pc-pub-meta");
      meta.append(node("span","",entry.h7Fingerprint),node("span","",String(entry.characterCount)+" chars"),node("span","",entry.reviewState));
      card.append(pos,text,meta);
      card.onclick=()=>onOpen(entry.signalId);
      list.append(card);
    }
    column.append(list);body.append(column);
  }
  const boundary=node("footer","pc-pub-boundary","Projection is downstream of the continuum. Every entry remains manual-review-required; the manifest has no authority to post.");
  body.append(boundary);root.append(body);return root;
}
