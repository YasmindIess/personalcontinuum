import type { PublicSignal, SituatedPosition } from "@blochfield/continuum-model";
import { relationSeedPublishable, type RelationSeed } from "@blochfield/relation-seeds";

export interface TopologyNode {
  id:string; kind:"public-signal"|"external-origin"; handle?:string; label:string;
}
export interface TopologyEdge {
  id:string; relationSeedId:string; source:string; target:string; provenance:number; reliability:number; revision:number;
}
export interface EvidentialGraph {
  schema:"blochfield.evidential-topology.v1"; nodes:TopologyNode[]; edges:TopologyEdge[];
  rejectedRelationSeeds:string[]; declaredLoss:"principal-hyperedge-to-pairwise-clique";
}
export interface CounterfactualRemoval {
  nodeId:string; componentDelta:number; lostEdges:number; reachablePairLoss:number; reachablePairLossRatio:number;
}
export interface TopologyMetricRecord {
  nodeId:string; degree:number; provenance:number|null; distinctiveness:number|null; bridgeContribution:number|null;
  corridorContribution:number|null; reliability:number|null; position:SituatedPosition;
}
export interface EvidentialTopologySnapshot {
  graph:EvidentialGraph; metrics:TopologyMetricRecord[]; components:number; publicCoverage:number; corridors:TopologyCorridor[];
}
export interface TopologyCorridor {id:string;nodes:string[];length:number;minimumProvenance:number;minimumReliability:number;}

const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const key=(value:string)=>value.trim().toLowerCase();
const pairs=(n:number)=>n<2?0:(n*(n-1))/2;

function verificationReliability(seed:RelationSeed){
  const base=seed.verification.independent==="verified"?1:seed.verification.independent==="pending"?.76:seed.verification.independent==="deferred"?.58:.18;
  const observed=clamp(seed.observed.length/3);
  return clamp(base*.72+observed*.28);
}
function provenanceSupport(seed:RelationSeed){
  const principal=seed.origins.filter(origin=>origin.role==="founder"||origin.role==="participant");
  const digested=principal.length?principal.filter(origin=>/^sha256:[a-f0-9]{64}$/i.test(origin.digest??"")).length/principal.length:0;
  const observed=clamp(seed.observed.length/3);
  const revision=clamp(seed.revision/3);
  return clamp(digested*.55+observed*.30+revision*.15);
}

export function buildEvidentialGraph(signals:PublicSignal[],seeds:RelationSeed[]):EvidentialGraph{
  const nodes=new Map<string,TopologyNode>();
  const handles=new Map<string,string>();
  for(const signal of signals){nodes.set(signal.id,{id:signal.id,kind:"public-signal",handle:signal.handle,label:signal.name});handles.set(key(signal.handle),signal.id);}
  const edges:TopologyEdge[]=[]; const rejectedRelationSeeds:string[]=[];
  for(const seed of seeds){
    if(!relationSeedPublishable(seed)){rejectedRelationSeeds.push(seed.id);continue;}
    const principals=seed.origins.filter(origin=>origin.role==="founder"||origin.role==="participant");
    const memberIds:string[]=[];
    for(const origin of principals){
      const handle=origin.handle?.trim();
      const known=handle?handles.get(key(handle)):undefined;
      const id=known??("EXT:"+(handle?key(handle):seed.id+":"+memberIds.length));
      if(!nodes.has(id))nodes.set(id,{id,kind:"external-origin",handle,label:handle??id});
      if(!memberIds.includes(id))memberIds.push(id);
    }
    const provenance=provenanceSupport(seed),reliability=verificationReliability(seed);
    for(let i=0;i<memberIds.length;i++)for(let j=i+1;j<memberIds.length;j++){
      const [a,b]=[memberIds[i],memberIds[j]].sort();
      edges.push({id:seed.id+":"+a+"↔"+b,relationSeedId:seed.id,source:a,target:b,provenance,reliability,revision:seed.revision});
    }
  }
  return {schema:"blochfield.evidential-topology.v1",nodes:[...nodes.values()],edges,rejectedRelationSeeds,declaredLoss:"principal-hyperedge-to-pairwise-clique"};
}

function adjacency(graph:EvidentialGraph,removed?:string){
  const map=new Map<string,Set<string>>();
  for(const node of graph.nodes)if(node.id!==removed)map.set(node.id,new Set());
  for(const edge of graph.edges)if(edge.source!==removed&&edge.target!==removed&&map.has(edge.source)&&map.has(edge.target)){map.get(edge.source)!.add(edge.target);map.get(edge.target)!.add(edge.source);}
  return map;
}
function componentCount(graph:EvidentialGraph,removed?:string){
  const adj=adjacency(graph,removed),seen=new Set<string>();let count=0;
  for(const id of adj.keys())if(!seen.has(id)){count++;const q=[id];seen.add(id);while(q.length){const x=q.shift()!;for(const y of adj.get(x)??[])if(!seen.has(y)){seen.add(y);q.push(y);}}}
  return count;
}
function reachablePairs(graph:EvidentialGraph,removed?:string){
  const adj=adjacency(graph,removed),seen=new Set<string>();let total=0;
  for(const id of adj.keys())if(!seen.has(id)){let size=0;const q=[id];seen.add(id);while(q.length){const x=q.shift()!;size++;for(const y of adj.get(x)??[])if(!seen.has(y)){seen.add(y);q.push(y);}}total+=pairs(size);}
  return total;
}

export function counterfactualRemoval(graph:EvidentialGraph,nodeId:string):CounterfactualRemoval{
  const beforeComponents=componentCount(graph),afterComponents=componentCount(graph,nodeId);
  const beforePairs=reachablePairs(graph),afterPairs=reachablePairs(graph,nodeId);
  const lostEdges=graph.edges.filter(edge=>edge.source===nodeId||edge.target===nodeId).length;
  const loss=Math.max(0,beforePairs-afterPairs);
  return {nodeId,componentDelta:Math.max(0,afterComponents-beforeComponents),lostEdges,reachablePairLoss:loss,reachablePairLossRatio:beforePairs?loss/beforePairs:0};
}

function brandes(graph:EvidentialGraph){
  const adj=adjacency(graph),ids=[...adj.keys()],cb=new Map(ids.map(id=>[id,0]));
  for(const source of ids){
    const stack:string[]=[],pred=new Map(ids.map(id=>[id,[] as string[]])),sigma=new Map(ids.map(id=>[id,0])),dist=new Map(ids.map(id=>[id,-1]));
    sigma.set(source,1);dist.set(source,0);const q=[source];
    while(q.length){const v=q.shift()!;stack.push(v);for(const w of adj.get(v)??[]){if(dist.get(w)===-1){dist.set(w,(dist.get(v)??0)+1);q.push(w);}if(dist.get(w)===(dist.get(v)??0)+1){sigma.set(w,(sigma.get(w)??0)+(sigma.get(v)??0));pred.get(w)!.push(v);}}}
    const delta=new Map(ids.map(id=>[id,0]));
    while(stack.length){const w=stack.pop()!;for(const v of pred.get(w)??[]){const sw=sigma.get(w)??1;delta.set(v,(delta.get(v)??0)+((sigma.get(v)??0)/sw)*(1+(delta.get(w)??0)));}if(w!==source)cb.set(w,(cb.get(w)??0)+(delta.get(w)??0));}
  }
  const norm=ids.length>2?2/((ids.length-1)*(ids.length-2)):0;
  for(const id of ids)cb.set(id,clamp((cb.get(id)??0)*norm/2));
  return cb;
}

function neighborDistinctiveness(graph:EvidentialGraph,nodeId:string){
  const adj=adjacency(graph),neighbors=[...(adj.get(nodeId)??[])];
  if(!neighbors.length)return null;
  const own=new Set(neighbors);let overlap=0;
  for(const neighbor of neighbors){const other=adj.get(neighbor)??new Set<string>();const union=new Set([...own,...other]);const intersection=[...own].filter(x=>other.has(x)).length;overlap+=union.size?intersection/union.size:0;}
  return clamp(1-overlap/neighbors.length);
}
function incidentMean(graph:EvidentialGraph,nodeId:string,keyName:"provenance"|"reliability"){
  const edges=graph.edges.filter(edge=>edge.source===nodeId||edge.target===nodeId);if(!edges.length)return null;return edges.reduce((sum,e)=>sum+e[keyName],0)/edges.length;
}

export function deriveTopologyMetrics(graph:EvidentialGraph):TopologyMetricRecord[]{
  const between=brandes(graph),baseComponents=componentCount(graph);
  return graph.nodes.map(node=>{
    const degree=graph.edges.filter(edge=>edge.source===node.id||edge.target===node.id).length;
    const provenance=incidentMean(graph,node.id,"provenance"),reliability=incidentMean(graph,node.id,"reliability");
    const distinctiveness=neighborDistinctiveness(graph,node.id);
    const cf=counterfactualRemoval(graph,node.id);
    const bridgeContribution=degree?clamp(cf.componentDelta/Math.max(1,baseComponents+degree-1)):null;
    const corridorContribution=degree?between.get(node.id)??0:null;
    const position:SituatedPosition=degree===0
      ? {status:"uncomputed",provenance:null,distinctiveness:null,bridgeContribution:null,corridorContribution:null,reliability:null}
      : {status:"computed",provenance,distinctiveness,bridgeContribution,corridorContribution,reliability};
    return {nodeId:node.id,degree,provenance,distinctiveness,bridgeContribution,corridorContribution,reliability,position};
  });
}

function shortestPath(graph:EvidentialGraph,start:string,end:string):string[]|null{
  const adj=adjacency(graph),q=[start],parent=new Map<string,string|null>([[start,null]]);
  while(q.length){const x=q.shift()!;if(x===end)break;for(const y of adj.get(x)??[])if(!parent.has(y)){parent.set(y,x);q.push(y);}}
  if(!parent.has(end))return null;const path:string[]=[];for(let x:string|null=end;x!==null;x=parent.get(x)??null)path.push(x);return path.reverse();
}
function edgeFor(graph:EvidentialGraph,a:string,b:string){return graph.edges.find(e=>(e.source===a&&e.target===b)||(e.source===b&&e.target===a));}
export function deriveCorridors(graph:EvidentialGraph,minLength=2,minProvenance=.6,minReliability=.5,limit=12):TopologyCorridor[]{
  const ids=graph.nodes.map(n=>n.id),out:TopologyCorridor[]=[];const seen=new Set<string>();
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const p=shortestPath(graph,ids[i],ids[j]);if(!p||p.length-1<minLength)continue;const edges=p.slice(0,-1).map((n,k)=>edgeFor(graph,n,p[k+1])).filter(Boolean) as TopologyEdge[];const prov=Math.min(...edges.map(e=>e.provenance)),rel=Math.min(...edges.map(e=>e.reliability));if(prov<minProvenance||rel<minReliability)continue;const canonical=[p.join(">"),p.slice().reverse().join(">")].sort()[0];if(seen.has(canonical))continue;seen.add(canonical);out.push({id:"COR-"+String(out.length+1).padStart(3,"0"),nodes:p,length:p.length-1,minimumProvenance:prov,minimumReliability:rel});}
  return out.sort((a,b)=>b.length-a.length||b.minimumReliability-a.minimumReliability).slice(0,limit);
}

export function buildTopologySnapshot(signals:PublicSignal[],seeds:RelationSeed[]):EvidentialTopologySnapshot{
  const graph=buildEvidentialGraph(signals,seeds),metrics=deriveTopologyMetrics(graph);
  const publicNodes=metrics.filter(m=>m.nodeId.startsWith("PS-"));
  const covered=publicNodes.filter(m=>m.degree>0).length;
  return {graph,metrics,components:componentCount(graph),publicCoverage:publicNodes.length?covered/publicNodes.length:0,corridors:deriveCorridors(graph)};
}
