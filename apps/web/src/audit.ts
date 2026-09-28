import { compileSemanticHeptad, nearestSemanticPairs, type PublicSignal } from "@blochfield/continuum-model";
import { renderSignalWorld } from "@blochfield/continuum-renderer";

export function renderAuditSurface(
  signals:PublicSignal[],
  onSelect:(index:number)=>void,
  onExit:()=>void,
):HTMLElement{
  const heptads=signals.map(signal=>compileSemanticHeptad(signal));
  const nearest=nearestSemanticPairs(heptads,1)[0];
  const root=document.createElement("section");
  root.className="pc-audit-surface";
  root.setAttribute("aria-label","Blind semantic heptad contact sheet");

  const header=document.createElement("header");
  header.className="pc-audit-hud";

  const title=document.createElement("div");
  const titleStrong=document.createElement("strong");
  titleStrong.textContent="H7 / BLIND CONTACT SHEET";
  const titleMeta=document.createElement("span");
  titleMeta.textContent="50 worlds · 1,225 semantic comparisons · names hidden";
  title.append(titleStrong,titleMeta);

  const separation=document.createElement("div");
  separation.className="pc-audit-separation";
  const sepLabel=document.createElement("b");
  sepLabel.textContent="nearest semantic pair";
  const sepValue=document.createElement("span");
  sepValue.textContent=nearest ? nearest.left+" ↔ "+nearest.right+" · "+nearest.total.toFixed(4) : "n/a";
  separation.append(sepLabel,sepValue);

  const exit=document.createElement("button");
  exit.type="button";
  exit.textContent="exit audit";
  exit.onclick=onExit;
  header.append(title,separation,exit);
  root.append(header);

  const grid=document.createElement("div");
  grid.className="pc-audit-grid";
  signals.forEach((signal,index)=>{
    const h=heptads[index];
    const cell=document.createElement("button");
    cell.type="button";
    cell.className="pc-audit-cell";
    cell.dataset.slot=signal.id;
    cell.dataset.heptad=h.fingerprint;
    cell.setAttribute("aria-label","Open "+signal.id+" "+h.fingerprint);

    const art=document.createElement("div");
    art.className="pc-audit-art";
    art.append(renderSignalWorld(signal,{density:"reduced"}));

    const label=document.createElement("div");
    label.className="pc-audit-label";
    const slot=document.createElement("strong");
    slot.textContent=signal.id.replace("PS-","");
    const fp=document.createElement("span");
    fp.textContent=h.fingerprint.slice(3);
    label.append(slot,fp);

    cell.append(art,label);
    cell.onclick=()=>onSelect(index);
    grid.append(cell);
  });
  root.append(grid);
  return root;
}
