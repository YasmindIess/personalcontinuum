import type { SemanticAction, SemanticHeptad, SemanticStep } from "@blochfield/continuum-model";

const NS = "http://www.w3.org/2000/svg";
const C = { ink:"#e6efe8", faint:"#5d6d67", accent:"#d9f99d", strong:"#eefad0" };

const el = <K extends keyof SVGElementTagNameMap>(tag:K, attrs:Record<string,string|number>={}) => {
  const n = document.createElementNS(NS, tag);
  for (const [k,v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
};
const path = (pts:Array<[number,number]>, close=false) =>
  pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ")+(close?" Z":"");
const stroke = (g:SVGGElement,d:string,color=C.ink,w=1,o=.7,dash="") =>
  g.append(el("path",{d,fill:"none",stroke:color,"stroke-width":w,opacity:o,"stroke-linecap":"round",...(dash?{"stroke-dasharray":dash}:{})}));
const point = (step:SemanticStep["after"], cx:number, cy:number):[number,number] =>
  [cx+step.x*250, cy+step.y*180];

export function renderSemanticHeptad(g:SVGGElement, heptad:SemanticHeptad, cx:number, cy:number, reduced=false){
  const layer = el("g",{"data-layer":"semantic-heptad","data-heptad":heptad.fingerprint});
  g.append(layer);
  const pts:Array<[number,number]> = [[cx,cy]];
  for (const step of heptad.steps) pts.push(point(step.after,cx,cy));
  stroke(layer,path(pts),C.accent,6,.045);
  stroke(layer,path(pts),C.strong,1.5,.88,"2 5");
  heptad.steps.forEach((step,index)=>glyph(layer,step,pts[index],pts[index+1],reduced));
  const [fx,fy] = pts[pts.length-1];
  layer.append(el("circle",{cx:fx,cy:fy,r:6,fill:C.strong,opacity:.96}));
  layer.append(el("circle",{cx:fx,cy:fy,r:18,fill:"none",stroke:C.accent,"stroke-width":.8,opacity:.42}));
}

function glyph(g:SVGGElement, step:SemanticStep, from:[number,number], to:[number,number], reduced:boolean){
  const {atom}=step,[x0,y0]=from,[x,y]=to;
  const angle=Math.atan2(y-y0,x-x0), scale=(reduced?.78:1)*(30+atom.vector.scale*60);
  const opacity=.34+atom.vector.density*.44, h=atom.tokenHash, action=atom.action;
  const group=el("g",{"data-atom":atom.order,"data-token":atom.normalized,"data-action":action});
  g.append(group);
  group.append(el("circle",{cx:x,cy:y,r:2.4+atom.vector.connectivity*2.4,fill:C.strong,opacity:.8}));

  if(action==="weave"||action==="bind"){
    for(const side of [-1,1]){
      const nx=Math.cos(angle+Math.PI/2)*scale*.38*side, ny=Math.sin(angle+Math.PI/2)*scale*.38*side;
      stroke(group,"M "+x0+" "+y0+" Q "+((x0+x)/2+nx)+" "+((y0+y)/2+ny)+" "+x+" "+y,side>0?C.strong:C.accent,side>0?1.6:1,opacity);
    }
  }else if(action==="recurse"||action==="accumulate"){
    for(let i=0;i<4;i++){
      const s=scale*Math.pow(.72,i);
      group.append(el("rect",{x:x-s/2,y:y-s/2,width:s,height:s,fill:"none",stroke:i%2?C.accent:C.ink,"stroke-width":i===0?1.2:.62,opacity,transform:"rotate("+((h%19)+i*17)+" "+x+" "+y+")"}));
    }
  }else if(action==="superpose"){
    for(const [ox,oy,r] of [[-.24,0,.56],[.24,0,.56],[0,-.16,.48]] as const)
      group.append(el("ellipse",{cx:x+ox*scale,cy:y+oy*scale,rx:r*scale,ry:r*scale*.56,fill:C.accent,"fill-opacity":.02,stroke:C.ink,"stroke-width":.86,opacity}));
  }else if(action==="flow"||action==="drift"||action==="channel"){
    const lanes=action==="channel"?[-1,0,1]:[0];
    for(const lane of lanes){
      const p:Array<[number,number]>=[], offset=lane*scale*.16;
      for(let t=-1;t<=1;t+=.08) p.push([x+t*scale,y+offset+Math.sin(t*Math.PI*2+(h%13))*scale*.28]);
      stroke(group,path(p),lane===0?C.strong:C.accent,lane===0?1.4:.62,opacity,action==="drift"?"1 5":"");
    }
  }else if(action==="expand"||action==="pulse"||action==="orbit"){
    if(action==="orbit") group.append(el("ellipse",{cx:x,cy:y,rx:scale*.8,ry:scale*.3,fill:"none",stroke:C.strong,"stroke-width":1.1,opacity,transform:"rotate("+(angle*180/Math.PI)+" "+x+" "+y+")"}));
    else if(action==="pulse") for(let i=1;i<=4;i++) group.append(el("circle",{cx:x,cy:y,r:scale*.16*i,fill:"none",stroke:i===4?C.strong:C.accent,"stroke-width":i===4?1:.52,opacity:opacity*(1-i*.12)}));
    else for(let i=0;i<9;i++){const a=angle+Math.PI*2*i/9;group.append(el("line",{x1:x+Math.cos(a)*scale*.18,y1:y+Math.sin(a)*scale*.18,x2:x+Math.cos(a)*scale,y2:y+Math.sin(a)*scale,stroke:i%3===0?C.strong:C.faint,"stroke-width":i%3===0?1.2:.56,opacity}))}
  }else if(action==="branch"||action==="grow"){
    const depth=action==="grow"?3:2;
    for(let i=-depth;i<=depth;i++){const a=angle+i*.31, r=scale*(.56+Math.abs(i)*.08);group.append(el("line",{x1:x,y1:y,x2:x+Math.cos(a)*r,y2:y+Math.sin(a)*r,stroke:i===0?C.strong:C.accent,"stroke-width":i===0?1.3:.68,opacity}))}
  }else if(action==="lattice"){
    for(let i=-2;i<=2;i++){
      group.append(el("line",{x1:x-scale*.54,y1:y+i*scale*.18,x2:x+scale*.54,y2:y+i*scale*.18,stroke:C.ink,"stroke-width":.58,opacity,transform:"rotate("+(angle*180/Math.PI)+" "+x+" "+y+")"}));
      group.append(el("line",{x1:x+i*scale*.18,y1:y-scale*.54,x2:x+i*scale*.18,y2:y+scale*.54,stroke:C.accent,"stroke-width":.46,opacity:opacity*.72,transform:"rotate("+(angle*180/Math.PI)+" "+x+" "+y+")"}));
    }
  }else if(action==="shield"){
    group.append(el("path",{d:"M "+(x-scale*.7)+" "+(y+scale*.28)+" Q "+x+" "+(y-scale)+" "+(x+scale*.7)+" "+(y+scale*.28),fill:"none",stroke:C.strong,"stroke-width":1.35,opacity}));
    group.append(el("path",{d:"M "+(x-scale*.52)+" "+(y+scale*.18)+" Q "+x+" "+(y-scale*.72)+" "+(x+scale*.52)+" "+(y+scale*.18),fill:"none",stroke:C.accent,"stroke-width":.7,opacity:opacity*.7}));
  }else if(action==="morph"){
    const pts:Array<[number,number]>=[];
    for(let i=0;i<10;i++){const a=Math.PI*2*i/10,r=scale*(.45+((h>>>(i%16))&3)*.08);pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r*(.72+.12*Math.sin(i))])}
    group.append(el("path",{d:path(pts,true),fill:C.strong,"fill-opacity":.035,stroke:C.ink,"stroke-width":1.05,opacity}));
  }else if(action==="perturb"||action==="diffuse"){
    if(action==="perturb"){
      const pts:Array<[number,number]>=[];for(let i=0;i<12;i++){const a=Math.PI*2*i/12,r=i%2?scale*.32:scale*.72;pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r])}
      group.append(el("polygon",{points:pts.map(p=>p.join(",")).join(" "),fill:C.accent,"fill-opacity":.02,stroke:C.strong,"stroke-width":.8,opacity}));
    }else for(let i=0;i<11;i++){const a=Math.PI*2*i/11+(h%17)*.03,r=scale*(.18+(i%5)*.13);group.append(el("circle",{cx:x+Math.cos(a)*r,cy:y+Math.sin(a)*r,r:i%3===0?2.1:1.1,fill:i%3===0?C.strong:C.accent,opacity:opacity*(.55+i*.025)}))}
  }else if(action==="reflect"||action==="fold"){
    if(action==="reflect") for(const side of [-1,1]) stroke(group,"M "+x+" "+y+" Q "+(x+Math.cos(angle+side*.8)*scale*.52)+" "+(y+Math.sin(angle+side*.8)*scale*.52)+" "+(x+Math.cos(angle+side*.24)*scale)+" "+(y+Math.sin(angle+side*.24)*scale),side>0?C.strong:C.accent,1.05,opacity);
    else {const nx=Math.cos(angle+Math.PI/2),ny=Math.sin(angle+Math.PI/2);group.append(el("polyline",{points:x0+","+y0+" "+(x+nx*scale*.48)+","+(y+ny*scale*.48)+" "+(x-nx*scale*.22)+","+(y-ny*scale*.22)+" "+x+","+y,fill:"none",stroke:C.strong,"stroke-width":1.2,opacity}))}
  }
}