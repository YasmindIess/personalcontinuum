import fs from "node:fs";
import { compileSemanticHeptad } from "../packages/model/src/heptad.ts";
import { heptadExecutionSignature, nearestSemanticPairs } from "../packages/model/src/heptad-metrics.ts";

type Signal={id:string;projection7:string;style:string;themes:string;persona:string};
type Manifest={signals:Signal[]};

const manifest=JSON.parse(fs.readFileSync(new URL("../data/public-signals.v1.json",import.meta.url),"utf8")) as Manifest;
const compiled=manifest.signals.map(signal=>({signal,heptad:compileSemanticHeptad(signal)}));

const fingerprints=new Set<string>();
const executions=new Map<string,string>();
for(const {signal,heptad} of compiled){
  if(fingerprints.has(heptad.fingerprint))throw new Error(`duplicate compiled fingerprint: ${signal.id} ${heptad.fingerprint}`);
  fingerprints.add(heptad.fingerprint);
  const signature=heptadExecutionSignature(heptad);
  const existing=executions.get(signature);
  if(existing)throw new Error(`exact executable heptad collision: ${existing} and ${signal.id}`);
  executions.set(signature,signal.id);
}

const pairs=nearestSemanticPairs(compiled.map(x=>x.heptad),10);
const byFingerprint=new Map(compiled.map(x=>[x.heptad.fingerprint,x.signal.id]));
console.log(`PASS: ${compiled.length} compiled heptads; ${executions.size} unique executable signatures; ${compiled.length*(compiled.length-1)/2} pairwise comparisons.`);
console.log("Nearest semantic pairs:");
for(const pair of pairs){
  console.log([
    byFingerprint.get(pair.left),byFingerprint.get(pair.right),
    `total=${pair.total.toFixed(4)}`,
    `action=${pair.action.toFixed(4)}`,
    `vector=${pair.vector.toFixed(4)}`,
    `path=${pair.path.toFixed(4)}`,
  ].join(" "));
}
