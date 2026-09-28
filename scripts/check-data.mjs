import fs from "node:fs";
const p=JSON.parse(fs.readFileSync(new URL("../data/public-signals.v1.json",import.meta.url)));
if(p.schema!=="blochfield.personal-continuum.public-signals.v1") throw new Error("wrong schema");
if(p.signals.length!==50) throw new Error(`expected 50 signals, got ${p.signals.length}`);
const operatorIds=new Set();
const signatures=new Set();
for(const s of p.signals){
  if(s.projection7.trim().split(/\s+/).length!==7) throw new Error(`${s.id} projection is not seven tokens`);
  if(s.position.status!=="uncomputed") throw new Error(`${s.id} must not ship placeholder topology as computed evidence`);
  if(operatorIds.has(s.render.operatorId)) throw new Error(`duplicate ${s.render.operatorId}`);
  operatorIds.add(s.render.operatorId);
  const sig=[s.render.primaryFamily,s.render.secondaryFamily,s.render.deformation,s.render.topologyMotif,s.render.corridorMode,s.render.seed].join('|');
  if(signatures.has(sig)) throw new Error(`duplicate operator signature ${s.id}`);
  signatures.add(sig);
}
console.log(`PASS: ${p.signals.length} public signals; seven-token projections; positions uncomputed; ${signatures.size} unique operator identities.`);
