import type { PublicSignal } from "@blochfield/continuum-model";
import type { RelationSeed } from "@blochfield/relation-seeds";
import { buildTopologySnapshot, counterfactualRemoval, type TopologyMetricRecord } from "@blochfield/evidential-topology";

const NS="http://www.w3.org/2000/svg";
const node=<K extends keyof HTMLElementTagNameMap>(tag:K,className?:string,text?:string)=>{const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;};
const svgEl=<K extends keyof SVGElementTagNameMap>(tag:K,attrs:Record<string,string|number>={})=>{const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));return n;};
const fmt=(v:number|null)=>v===null?"—":v.toFixed(3);

export function renderTopologySurface(signals:PublicSignal[],seeds:RelationSeed[],onOpenSignal:(id:string)=>void,onExit:()=>void):HTMLElement{
  const snapshot=buildTopologySnapshot(signals,seeds);
  const root=node("section","pc-topology-surface");
  const hud=node("header","pc-topology-hud");
  const title=node("div","pc-topology-title");
  title.append(node("strong","","EVIDENTIAL TOPOLOGY / R7"),node("span","","relations only after admissibility · no popularity geometry"));
  const status=node("div","pc-topology-status");
  status.append(node("b","",snapshot.graph.edges.length?"EVIDENCE GRAPH ACTIVE":"EVIDENCE GATE / NO EDGES"),node("span","",snapshot.graph.edges.length+" admissible edges · "+snapshot.graph.rejectedRelationSeeds.length+" rejected seeds"));
  const exit=node("button","pc-topology-exit","back to continuum");exit.onclick=onExit;
  hud.append(title,status,exit);root.append(hud);

  const body=node("main","pc-topology-body");
  const field=node("section","pc-topology-field");
  const svg=svgEl("svg",{viewBox:"0 0 1000 700",role:"img","aria-label":"Evidence-gated topology field"});
  const positions=new Map<string,[number,number]>();
  const publicNodes=snapshot.graph.nodes.filter(n=>n.kind==="public-signal");
  const externalNodes=snapshot.graph.nodes.filter(n=>n.kind==="external-origin");
  publicNodes.forEach((n,i)=>{const a=-Math.PI/2+Math.PI*2*i/Math.max(1,publicNodes.length);positions.set(n.id,[500+Math.cos(a)*300,350+Math.sin(a)*250]);});
  externalNodes.forEach((n,i)=>{const a=-Math.PI/2+Math.PI*2*i/Math.max(1,externalNodes.length);positions.set(n.id,[500+Math.cos(a)*150,350+Math.sin(a)*115]);});
  const edgeLayer=svgEl("g",{"data-layer":"admissible-relations"});
  for(const edge of snapshot.graph.edges){const a=positions.get(edge.source),b=positions.get(edge.target);if(!a||!b)continue;edgeLayer.append(svgEl("line",{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:"#d9f99d","stroke-width":.7+edge.reliability*1.8,opacity:.16+edge.provenance*.48}));}
  svg.append(edgeLayer);
  const nodeLayer=svgEl("g",{"data-layer":"origins"});
  for(const graphNode of snapshot.graph.nodes){const p=positions.get(graphNode.id);if(!p)continue;const metric=snapshot.metrics.find(m=>m.nodeId===graphNode.id);const group=svgEl("g",{"data-node":graphNode.id,tabindex:"0",role:"button","aria-label":graphNode.id+" "+(metric?.position.status??"uncomputed")});
    const radius=metric?.degree?5+Math.min(7,metric.degree*1.4):3.1;
    group.append(svgEl("circle",{cx:p[0],cy:p[1],r:radius,fill:metric?.degree?"#eaf7d0":"#43504b",opacity:metric?.degree?.92:.46,stroke:metric?.degree?"#d9f99d":"#596660","stroke-width":metric?.degree?1:.45}));
    const text=svgEl("text",{x:p[0]+8,y:p[1]+3,fill:metric?.degree?"#aab8b1":"#58655f","font-size":7,"font-family":"ui-monospace, monospace"});text.textContent=graphNode.id.replace("PS-","");group.append(text);
    if(graphNode.kind==="public-signal"){group.addEventListener("click",()=>onOpenSignal(graphNode.id));group.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();onOpenSignal(graphNode.id);}});}
    nodeLayer.append(group);
  }
  svg.append(nodeLayer);field.append(svg);
  if(snapshot.graph.edges.length===0){const empty=node("div","pc-topology-empty");empty.append(node("strong","","NO TOPOLOGY INFERRED"),node("span","",String(publicNodes.length)+" origins registered · no admissible Relation Seed currently connects them"),node("em","","The circular placement is display-only. Distance and angle do not encode similarity, value, or rank."));field.append(empty);}
  body.append(field);

  const panel=node("aside","pc-topology-panel");
  const stats=node("div","pc-topology-stats");
  for(const [label,value] of [["origins",String(snapshot.graph.nodes.length)],["admissible edges",String(snapshot.graph.edges.length)],["coverage",(snapshot.publicCoverage*100).toFixed(1)+"%"],["corridors",String(snapshot.corridors.length)]]){const card=node("div","");card.append(node("strong","",value),node("span","",label));stats.append(card);}
  panel.append(stats);
  const gate=node("section","pc-topology-gate");gate.append(node("strong","","EVIDENCE GATE"));
  if(snapshot.graph.rejectedRelationSeeds.length){const p=node("p","",snapshot.graph.rejectedRelationSeeds.join(", ")+" rejected by Relation Seed admissibility; they create no graph edges.");gate.append(p);}else gate.append(node("p","","All supplied Relation Seeds are admissible."));
  panel.append(gate);
  const table=node("section","pc-topology-metrics");table.append(node("strong","","PUBLIC ORIGIN METRICS"));
  const rows=node("div","pc-topology-rows");
  const metrics=snapshot.metrics.filter(m=>m.nodeId.startsWith("PS-")).sort((a,b)=>a.nodeId.localeCompare(b.nodeId));
  for(const metric of metrics){const row=node("button","pc-topology-row");row.type="button";row.onclick=()=>onOpenSignal(metric.nodeId);row.dataset.status=metric.position.status;row.append(node("b","",metric.nodeId.replace("PS-","")),node("span","",metric.position.status.toUpperCase()),node("code","",metric.degree?"π "+fmt(metric.provenance)+" · δ "+fmt(metric.distinctiveness)+" · β "+fmt(metric.bridgeContribution)+" · κ "+fmt(metric.corridorContribution)+" · ρ "+fmt(metric.reliability):"π — · δ — · β — · κ — · ρ —"));rows.append(row);}
  table.append(rows);panel.append(table);
  const legend=node("footer","pc-topology-boundary","Metrics describe the evidenced relation graph, not the people. Removing a node means a counterfactual graph operation M → M \\ Pᵢ; it does not diminish or score a human being.");panel.append(legend);
  body.append(panel);root.append(body);return root;
}
