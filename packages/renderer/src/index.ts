import type { OperatorFamily, PublicSignal } from "@blochfield/continuum-model";

const NS = "http://www.w3.org/2000/svg";
const el = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string,string|number> = {}) => {
  const n = document.createElementNS(NS, tag);
  for (const [k,v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
};
const pathFrom = (pts: Array<[number,number]>) => pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");
const rng = (seed:number) => { let t=seed>>>0; return () => { t+=0x6D2B79F5; let r=Math.imul(t^(t>>>15),1|t); r^=r+Math.imul(r^(r>>>7),61|r); return ((r^(r>>>14))>>>0)/4294967296; }; };

export interface RenderContext { width?: number; height?: number; corridorPhase?: number; }

export function renderSignalWorld(signal: PublicSignal, ctx: RenderContext = {}): SVGSVGElement {
  const svg = el("svg", {viewBox:"0 0 1000 700", role:"img", "aria-label":`${signal.name}: ${signal.render.operatorId} situated world`});
  const g = el("g"); svg.append(g);
  const rand = rng(signal.render.seed);
  const cx = 500 + (rand()-.5)*180, cy = 350 + (rand()-.5)*100;

  // persistent local mesh
  for(let row=0; row<10; row++){
    const pts:Array<[number,number]> = [];
    for(let x=40;x<=960;x+=40) pts.push([x,80+row*54+Math.sin(x/(72+row*3)+signal.rank*.19)*9]);
    g.append(el("path",{d:pathFrom(pts),fill:"none",stroke:"#5d6d67","stroke-width":.55,opacity:.24}));
  }

  renderFamily(g, signal.render.primaryFamily, cx, cy, signal.render.seed);

  const corridor:Array<[number,number]> = [];
  for(let y=0;y<=700;y+=18) corridor.push([cx+Math.sin(y/86+signal.rank*.23)*64+Math.sin(y/31)*18,y]);
  g.append(el("path",{d:pathFrom(corridor),fill:"none",stroke:"#d9f99d","stroke-width":1.25,"stroke-dasharray":"2 4",opacity:.9}));
  g.append(el("circle",{cx,cy,r:42,fill:"none",stroke:"#d9f99d","stroke-width":1,opacity:.35}));
  g.append(el("circle",{cx,cy,r:5,fill:"#eefad0"}));
  return svg;
}

function renderFamily(g: SVGGElement, family: OperatorFamily, cx:number, cy:number, seed:number){
  const rand=rng(seed^0x9e3779b9); const phase=rand()*Math.PI*2;
  if(family==="loop"){
    for(let r=0;r<7;r++){const pts:Array<[number,number]>=[];for(let j=0;j<=180;j++){const t=j/180*Math.PI*2;pts.push([cx+(42+r*25)*Math.sin(3*t+phase),cy+(28+r*15)*Math.sin(2*t+r*.16)])}g.append(el("path",{d:pathFrom(pts),fill:"none",stroke:r===3?"#e6efe8":"#64736d","stroke-width":r===3?1.1:.55,opacity:r===3?.85:.3}));}
  } else if(family==="lattice"){
    for(let x=cx-210;x<=cx+210;x+=32)g.append(el("line",{x1:x,y1:cy-170,x2:x+64,y2:cy+170,stroke:"#91a59e","stroke-width":.65,opacity:.38}));
    for(let y=cy-170;y<=cy+170;y+=32)g.append(el("line",{x1:cx-220,y1:y,x2:cx+220,y2:y-44,stroke:"#5d6d67","stroke-width":.5,opacity:.25}));
  } else if(family==="attractor"){
    for(let s=0;s<18;s++){const pts:Array<[number,number]>=[];let rr=14+s*7;for(let j=0;j<80;j++){const t=j*.16+phase+s*.04;rr*=1.007;pts.push([cx+Math.cos(t*1.13)*rr,cy+Math.sin(t*.91)*rr*.68])}g.append(el("path",{d:pathFrom(pts),fill:"none",stroke:s%4===0?"#e6efe8":"#64736d","stroke-width":s%4===0?1:.5,opacity:s%4===0?.8:.27}));}
  } else if(family==="orbit"){
    for(let k=0;k<12;k++)g.append(el("ellipse",{cx,cy,rx:48+k*17,ry:18+k*9,fill:"none",stroke:k%4===0?"#e6efe8":"#64736d","stroke-width":k%4===0?1:.5,opacity:k%4===0?.8:.28,transform:`rotate(${k*13+phase*18} ${cx} ${cy})`}));
  } else if(family==="braid"){
    for(let q=0;q<6;q++){const pts:Array<[number,number]>=[];for(let x=cx-280;x<=cx+280;x+=6)pts.push([x,cy+(q-2.5)*24+50*Math.sin(x/(48+q*4)+phase+q*Math.PI/3)]);g.append(el("path",{d:pathFrom(pts),fill:"none",stroke:q===2?"#e6efe8":"#91a59e","stroke-width":q===2?1.1:.6,opacity:q===2?.85:.38}));}
  } else if(family==="interference"){
    for(let r=22;r<220;r+=18){g.append(el("circle",{cx:cx-82,cy,r,fill:"none",stroke:"#64736d","stroke-width":.5,opacity:.25}));g.append(el("circle",{cx:cx+82,cy,r,fill:"none",stroke:"#64736d","stroke-width":.5,opacity:.25}));}
  } else if(family==="fold"){
    for(let k=0;k<16;k++){const y=cy-170+k*22;g.append(el("polyline",{points:`${cx-220},${y} ${cx},${cy+(y-cy)*.23} ${cx+220},${y}`,fill:"none",stroke:k%5===0?"#e6efe8":"#64736d","stroke-width":k%5===0?1:.5,opacity:k%5===0?.8:.25}));}
  } else if(family==="field"){
    for(let x=cx-200;x<=cx+200;x+=34)for(let y=cy-160;y<=cy+160;y+=34){const a=Math.atan2(y-cy,x-cx)+Math.PI/2;g.append(el("line",{x1:x,y1:y,x2:x+Math.cos(a)*13,y2:y+Math.sin(a)*13,stroke:"#91a59e","stroke-width":.65,opacity:.38}));}
  } else if(family==="recursion"){
    for(let k=0;k<11;k++){const s=240*Math.pow(.84,k);g.append(el("rect",{x:cx-s/2,y:cy-s/2,width:s,height:s,fill:"none",stroke:k%3===0?"#e6efe8":"#64736d","stroke-width":k%3===0?1:.5,opacity:k%3===0?.8:.25,transform:`rotate(${k*12+phase*10} ${cx} ${cy})`}));}
  } else {
    for(let q=0;q<12;q++){const pts:Array<[number,number]>=[];for(let x=cx-310;x<=cx+310;x+=6)pts.push([x,cy+(q-5.5)*12+(30+q*2.6)*Math.sin(x/(40+q*1.7)+phase+q*.26)]);g.append(el("path",{d:pathFrom(pts),fill:"none",stroke:q===5?"#e6efe8":"#64736d","stroke-width":q===5?1.1:.5,opacity:q===5?.85:.25}));}
  }
}
