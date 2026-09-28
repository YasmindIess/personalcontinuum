import type { SemanticHeptad, SemanticState, SemanticVector } from "./heptad.ts";

const VECTOR_KEYS: Array<keyof SemanticVector> = [
  "curvature","symmetry","density","scale","connectivity","rhythm","radiality","polarity",
];
const STATE_KEYS: Array<keyof Pick<SemanticState,"x"|"y"|"radius"|"curvature"|"density"|"connectivity"|"rhythm">> = [
  "x","y","radius","curvature","density","connectivity","rhythm",
];

const clamp01=(n:number)=>Math.max(0,Math.min(1,n));
const circular=(a:number,b:number)=>{
  const tau=Math.PI*2;
  const d=Math.abs(a-b)%tau;
  return Math.min(d,tau-d)/Math.PI;
};

export interface HeptadDistance {
  total:number;
  action:number;
  vector:number;
  path:number;
}

export interface HeptadPairDistance extends HeptadDistance {
  left:string;
  right:string;
}

function vectorDistance(a:SemanticVector,b:SemanticVector){
  let sum=0;
  for(const key of VECTOR_KEYS){const d=a[key]-b[key];sum+=d*d;}
  return Math.sqrt(sum/VECTOR_KEYS.length);
}

function stateDistance(a:SemanticState,b:SemanticState){
  let sum=0,count=0;
  for(const key of STATE_KEYS){
    let d=Math.abs(a[key]-b[key]);
    if(key==="x")d/=1.76;
    else if(key==="y")d/=1.64;
    sum+=clamp01(d)**2;count++;
  }
  sum+=circular(a.angle,b.angle)**2;count++;
  sum+=circular(a.phase,b.phase)**2;count++;
  return Math.sqrt(sum/count);
}

export function semanticDistance(a:SemanticHeptad,b:SemanticHeptad):HeptadDistance{
  const action=a.atoms.reduce((sum,atom,i)=>sum+(atom.action===b.atoms[i].action?0:1),0)/7;
  const vector=a.atoms.reduce((sum,atom,i)=>sum+vectorDistance(atom.vector,b.atoms[i].vector),0)/7;
  const path=a.steps.reduce((sum,step,i)=>sum+stateDistance(step.after,b.steps[i].after),0)/7;
  return {
    action,
    vector,
    path,
    total:action*.34+vector*.38+path*.28,
  };
}

export function heptadExecutionSignature(h:SemanticHeptad):string{
  const atoms=h.atoms.map(atom=>[
    atom.order,atom.action,
    ...VECTOR_KEYS.map(key=>atom.vector[key].toFixed(8)),
  ].join(":")).join("|");
  const states=h.steps.map(step=>[
    step.after.x,step.after.y,step.after.angle,step.after.radius,
    step.after.curvature,step.after.density,step.after.connectivity,step.after.rhythm,step.after.phase,
  ].map(v=>v.toFixed(8)).join(":")).join("|");
  return atoms+"#"+states;
}

export function nearestSemanticPairs(heptads:SemanticHeptad[],limit=10):HeptadPairDistance[]{
  const pairs:HeptadPairDistance[]=[];
  for(let i=0;i<heptads.length;i++)for(let j=i+1;j<heptads.length;j++){
    const d=semanticDistance(heptads[i],heptads[j]);
    pairs.push({left:heptads[i].fingerprint,right:heptads[j].fingerprint,...d});
  }
  return pairs.sort((a,b)=>a.total-b.total).slice(0,Math.max(0,limit));
}
