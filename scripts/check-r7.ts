import fs from "node:fs";
import type { PublicSignal, PublicSignalManifest } from "../packages/model/src/index.ts";
import type { RelationSeed } from "../packages/relation-seeds/src/index.ts";
import { buildTopologySnapshot, counterfactualRemoval } from "../packages/topology/src/index.ts";

const realSignals=(JSON.parse(fs.readFileSync(new URL("../data/public-signals.v1.json",import.meta.url),"utf8")) as PublicSignalManifest).signals;
const placeholder=JSON.parse(fs.readFileSync(new URL("../data/relation-seeds.example.json",import.meta.url),"utf8")) as RelationSeed;
const real=buildTopologySnapshot(realSignals,[placeholder]);
if(real.graph.edges.length!==0)throw new Error("blocked RS-0001 must not create topology edges");
if(real.publicCoverage!==0)throw new Error("real corpus must have zero topology coverage before admissible relation evidence");
if(real.metrics.some(metric=>metric.nodeId.startsWith("PS-")&&metric.position.status!=="uncomputed"))throw new Error("real public positions became computed without admissible evidence");
if(!real.graph.rejectedRelationSeeds.includes("RS-0001"))throw new Error("blocked RS-0001 was not reported as rejected");

const baseRender={family:"loop",operatorId:"OI-CI" as const,primaryFamily:"loop" as const,secondaryFamily:"loop" as const,deformation:"none",topologyMotif:"none",corridorMode:"none",seed:1,rendererVersion:"ci"};
const signal=(n:number):PublicSignal=>({id:"PS-CI-"+n,rank:n,curatorRank:n,name:"CI "+n,handle:"@ci"+n,projection7:"one two three four five six seven",style:"ci",themes:"ci",persona:"ci",evidenceConfidence:"high",voiceStance:"THEY",voiceStanceStatus:"curated",render:{...baseRender,operatorId:("OI-CI-"+n) as `OI-${string}`},position:{status:"uncomputed",provenance:null,distinctiveness:null,bridgeContribution:null,corridorContribution:null,reliability:null},relationSeeds:[]});
const signals=Array.from({length:7},(_,i)=>signal(i+1));
const digest=(ch:string)=>("sha256:"+ch.repeat(64)) as `sha256:${string}`;
const edge=(id:string,a:number,b:number,verification:"verified"|"pending"|"deferred"="verified"):RelationSeed=>({
  schema:"blochfield.relation-seed.v1",id:("RS-CI-"+id) as `RS-${string}`,createdAt:"2026-09-28T23:20:00.000Z",curator:"@ci",
  origins:[
    {role:"founder",handle:"@ci"+a,sourceUrl:"https://source.test/"+id+"/a",sourceType:"post",capturedAt:"2026-09-28T23:18:00.000Z",digest:digest("a")},
    {role:"participant",handle:"@ci"+b,sourceUrl:"https://source.test/"+id+"/b",sourceType:"post",capturedAt:"2026-09-28T23:19:00.000Z",digest:digest("b")},
  ],
  observed:["Synthetic edge evidence one.","Synthetic edge evidence two."],interpreted:["Synthetic topology fixture only."],open:[],
  verification:{independent:verification,receipts:verification==="verified"?["VR-"+id]:[]},association:"citation-does-not-imply-endorsement",externalAuthority:"none",revision:1,
});
const seeds=[edge("12",1,2),edge("23",2,3),edge("34",3,4),edge("35",3,5),edge("56",5,6),edge("57",5,7,"pending")];
const synthetic=buildTopologySnapshot(signals,seeds);
if(synthetic.graph.edges.length!==6)throw new Error("synthetic graph edge count mismatch");
if(synthetic.publicCoverage!==1)throw new Error("all synthetic public nodes should be covered");
if(synthetic.metrics.some(metric=>metric.position.status!=="computed"))throw new Error("connected synthetic nodes should have computed artifact positions");
const m3=synthetic.metrics.find(metric=>metric.nodeId==="PS-CI-3")!;
const m1=synthetic.metrics.find(metric=>metric.nodeId==="PS-CI-1")!;
if((m3.bridgeContribution??0)<=0)throw new Error("articulation node PS-CI-3 should have positive bridge contribution");
if((m3.corridorContribution??0)<=(m1.corridorContribution??0))throw new Error("central articulation should exceed leaf corridor contribution");
const cf3=counterfactualRemoval(synthetic.graph,"PS-CI-3");
const cf1=counterfactualRemoval(synthetic.graph,"PS-CI-1");
if(cf3.componentDelta<=0||cf3.reachablePairLoss<=cf1.reachablePairLoss)throw new Error("counterfactual articulation loss invariant failed");
if(synthetic.corridors.length===0||!synthetic.corridors.some(c=>c.length>=3))throw new Error("expected provenance-bearing multi-hop corridors");
for(const metric of synthetic.metrics){for(const value of [metric.provenance,metric.distinctiveness,metric.bridgeContribution,metric.corridorContribution,metric.reliability])if(value!==null&&(value<0||value>1))throw new Error("topology metric escaped [0,1]");}
console.log("PASS: R7 real corpus remains evidence-gated at 0 edges/0 computed positions; synthetic graph validates articulation, corridors, counterfactual removal, and bounded artifact metrics.");
