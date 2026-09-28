import fs from "node:fs";
const p=JSON.parse(fs.readFileSync(new URL("../data/public-signals.v1.json",import.meta.url)));
if(p.schema!=="blochfield.personal-continuum.public-signals.v1") throw new Error("wrong schema");
if(p.signals.length!==50) throw new Error(`expected 50 signals, got ${p.signals.length}`);
const operatorIds=new Set();
const signatures=new Set();
const projectionSources=new Set();
const heptadFingerprints=new Set();
const fnv=(value)=>{let h=2166136261>>>0;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
for(const s of p.signals){
  if(s.projection7.trim().split(/\s+/).length!==7) throw new Error(`${s.id} projection is not seven tokens`);
  const source=[s.projection7,s.style,s.themes,s.persona,s.id].join("\u241f");
  if(projectionSources.has(s.projection7)) throw new Error(`duplicate projection7 source ${s.id}`);
  projectionSources.add(s.projection7);
  const h7=`H7-${fnv(source).toString(16).padStart(8,"0")}`;
  if(heptadFingerprints.has(h7)) throw new Error(`semantic-heptad source collision ${s.id}: ${h7}`);
  heptadFingerprints.add(h7);
  if(s.position.status!=="uncomputed") throw new Error(`${s.id} must not ship placeholder topology as computed evidence`);
  if(operatorIds.has(s.render.operatorId)) throw new Error(`duplicate ${s.render.operatorId}`);
  operatorIds.add(s.render.operatorId);
  const sig=[s.render.primaryFamily,s.render.secondaryFamily,s.render.deformation,s.render.topologyMotif,s.render.corridorMode,s.render.seed].join('|');
  if(signatures.has(sig)) throw new Error(`duplicate operator signature ${s.id}`);
  signatures.add(sig);
}
console.log(`PASS: ${p.signals.length} public signals; seven-token projections; ${heptadFingerprints.size} unique executable heptad sources; positions uncomputed; ${signatures.size} legacy operator witnesses.`);
