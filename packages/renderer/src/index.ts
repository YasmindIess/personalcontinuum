import type { OperatorFamily, PublicSignal } from "@blochfield/continuum-model";

const NS = "http://www.w3.org/2000/svg";
const C = { ink:"#e6efe8", soft:"#91a59e", faint:"#5d6d67", accent:"#d9f99d", strong:"#eefad0" };

const el = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string,string|number> = {}) => {
  const n = document.createElementNS(NS, tag);
  for (const [k,v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
};
const pathFrom = (pts:Array<[number,number]>) => pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");
const rng = (seed:number) => { let t=seed>>>0; return () => { t+=0x6D2B79F5; let r=Math.imul(t^(t>>>15),1|t); r^=r+Math.imul(r^(r>>>7),61|r); return ((r^(r>>>14))>>>0)/4294967296; }; };

export interface RenderContext {
  corridorPhase?: number;
  density?: "full" | "reduced";
}

export function renderSignalWorld(signal: PublicSignal, ctx: RenderContext = {}): SVGSVGElement {
  const svg = el("svg", {
    viewBox:"0 0 1000 700",
    role:"img",
    "aria-label":`${signal.name}: ${signal.render.operatorId} situated world`,
    "data-operator-id":signal.render.operatorId,
    "data-primary":signal.render.primaryFamily,
    "data-secondary":signal.render.secondaryFamily,
    "data-deformation":signal.render.deformation,
    "data-topology":signal.render.topologyMotif,
    "data-corridor":signal.render.corridorMode,
  });
  const root = el("g");
  svg.append(root);

  const rand = rng(signal.render.seed);
  const cx = 500 + (rand()-.5)*190;
  const cy = 350 + (rand()-.5)*110;
  const density = ctx.density === "reduced" ? .62 : 1;
  root.setAttribute("transform", `rotate(${((rand()-.5)*16).toFixed(2)} 500 350)`);

  renderMesh(root, signal.rank, signal.render.seed, density);
  renderTopology(root, signal.render.topologyMotif, cx, cy, signal.render.seed, density);

  const primary = el("g", {transform:deform(signal.render.deformation,cx,cy,signal.render.seed,1)});
  renderFamily(primary, signal.render.primaryFamily, cx, cy, signal.render.seed, 1);
  root.append(primary);

  const secondary = el("g", {
    opacity:.42,
    transform:deform(signal.render.deformation,cx,cy,signal.render.seed^0x7f4a7c15,.72),
  });
  renderFamily(
    secondary,
    signal.render.secondaryFamily,
    cx+(rand()-.5)*94,
    cy+(rand()-.5)*74,
    signal.render.seed^0x9e3779b9,
    .72,
  );
  root.append(secondary);

  renderCorridor(root, signal.render.corridorMode, cx, cy, signal.render.seed, signal.rank, ctx.corridorPhase ?? 0);
  renderOrigin(root, cx, cy, signal.render.seed, signal.evidenceConfidence);
  return svg;
}

function renderMesh(g:SVGGElement, rank:number, seed:number, density:number){
  const rand=rng(seed^0xa511e9b3);
  const rows=Math.max(6,Math.round(11*density));
  const cols=Math.max(8,Math.round(15*density));
  for(let row=0;row<rows;row++){
    const pts:Array<[number,number]>=[];
    for(let x=24;x<=976;x+=38){
      const warp=Math.sin(x/(68+row*3)+rank*.19)*(7+rand()*4)+Math.cos(x/170+row*.31)*4;
      pts.push([x,76+row*(520/Math.max(1,rows-1))+warp]);
    }
    g.append(el("path",{d:pathFrom(pts),fill:"none",stroke:C.faint,"stroke-width":.5,opacity:row%3===0?.31:.17}));
  }
  for(let col=0;col<cols;col++){
    const pts:Array<[number,number]>=[];
    for(let y=54;y<=646;y+=34){
      const warp=Math.sin(y/(82+col*2)+rank*.13)*7+Math.cos(y/190+col*.27)*4;
      pts.push([84+col*(832/Math.max(1,cols-1))+warp,y]);
    }
    g.append(el("path",{d:pathFrom(pts),fill:"none",stroke:C.faint,"stroke-width":.45,opacity:col%4===0?.24:.12}));
  }
}

function deform(kind:string,cx:number,cy:number,seed:number,scale:number){
  const r=rng(seed^0x13579bdf);
  const angle=(r()-.5)*26, sx=scale*(.9+r()*.22), sy=scale*(.88+r()*.25);
  const around=(body:string)=>`translate(${cx} ${cy}) ${body} translate(${-cx} ${-cy})`;
  switch(kind){
    case "curvature-bias": return around(`rotate(${angle.toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`);
    case "radial-pulse": return around(`scale(${(sx*1.08).toFixed(3)} ${(sy*.94).toFixed(3)})`);
    case "nested-contraction": return around(`rotate(${angle.toFixed(2)}) scale(${(sx*.86).toFixed(3)})`);
    case "standing-wave": return `translate(${((r()-.5)*42).toFixed(2)} ${((r()-.5)*28).toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`;
    case "anisotropic-scale": return around(`scale(${(sx*1.16).toFixed(3)} ${(sy*.78).toFixed(3)})`);
    case "torsion": return `rotate(${(angle*1.8).toFixed(2)} ${cx} ${cy}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`;
    case "shear": return around(`skewX(${(angle*.82).toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`);
    case "vortex-drift": return `translate(${((r()-.5)*70).toFixed(2)} ${((r()-.5)*52).toFixed(2)}) rotate(${(angle*1.35).toFixed(2)} ${cx} ${cy}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`;
    default: return around(`scale(${sx.toFixed(3)} ${sy.toFixed(3)})`);
  }
}

function renderTopology(g:SVGGElement,motif:string,cx:number,cy:number,seed:number,density:number){
  const r=rng(seed^0x2468ace0);
  const count=Math.max(4,Math.round(8*density));
  const layer=el("g",{opacity:.62});
  g.append(layer);

  if(motif==="simplex-fan"){
    for(let i=0;i<count;i++){
      const a=Math.PI*2*i/count+r()*.3, b=a+.45+r()*.35, r1=90+r()*150, r2=80+r()*165;
      layer.append(el("polygon",{points:`${cx},${cy} ${cx+Math.cos(a)*r1},${cy+Math.sin(a)*r1} ${cx+Math.cos(b)*r2},${cy+Math.sin(b)*r2}`,fill:C.accent,"fill-opacity":.025,stroke:C.accent,"stroke-width":.45,opacity:.24}));
    }
    return;
  }
  if(motif==="recursive-cell"){
    for(let i=0;i<count+2;i++){const s=250*Math.pow(.82,i);layer.append(el("rect",{x:cx-s/2,y:cy-s/2,width:s,height:s,rx:4+i,fill:"none",stroke:C.soft,"stroke-width":.48,opacity:.18+(i%3)*.035,transform:`rotate(${i*9+r()*8} ${cx} ${cy})`}));}
    return;
  }
  if(motif==="mobius-seam"){
    for(let band=0;band<5;band++){const pts:Array<[number,number]>=[];for(let t=0;t<=Math.PI*2;t+=.06){const rr=120+band*13+24*Math.cos(t*2);pts.push([cx+Math.cos(t)*rr,cy+Math.sin(t)*rr*.42+Math.sin(t*2)*28]);}layer.append(el("path",{d:pathFrom(pts),fill:"none",stroke:band===2?C.soft:C.faint,"stroke-width":band===2?.75:.45,opacity:band===2?.34:.19}));}
    return;
  }
  if(motif==="braided-strip"){
    for(let q=0;q<7;q++){const pts:Array<[number,number]>=[];for(let x=cx-270;x<=cx+270;x+=8)pts.push([x,cy+(q-3)*18+Math.sin(x/(54+q*2)+q*.7)*42]);layer.append(el("path",{d:pathFrom(pts),fill:"none",stroke:q===3?C.soft:C.faint,"stroke-width":q===3?.7:.42,opacity:q===3?.31:.17}));}
    return;
  }
  if(motif==="branch-complex"){
    const branch=(x:number,y:number,len:number,a:number,depth:number)=>{
      if(depth<=0)return;
      const x2=x+Math.cos(a)*len,y2=y+Math.sin(a)*len;
      layer.append(el("line",{x1:x,y1:y,x2,y2,stroke:depth>2?C.soft:C.faint,"stroke-width":Math.max(.35,depth*.13),opacity:.18+depth*.035}));
      branch(x2,y2,len*.72,a-.44-r()*.12,depth-1); branch(x2,y2,len*.72,a+.44+r()*.12,depth-1);
    };
    branch(cx,cy+150,92,-Math.PI/2,5); return;
  }
  if(motif==="caustic-web"){
    for(let i=0;i<count+5;i++){const a=Math.PI*2*i/(count+5),rr=110+r()*140,x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.65;layer.append(el("line",{x1:cx,y1:cy,x2:x,y2:y,stroke:i%4===0?C.soft:C.faint,"stroke-width":.46,opacity:.2}));layer.append(el("circle",{cx:x,cy:y,r:i%4===0?2.2:1.2,fill:C.accent,opacity:.38}));}
    return;
  }
  if(motif==="torus-section"||motif==="annular-lattice"){
    for(let rr=44;rr<230;rr+=motif==="torus-section"?22:18)layer.append(el("ellipse",{cx,cy,rx:rr,ry:rr*(motif==="torus-section"?.34:.62),fill:"none",stroke:rr%44===0?C.soft:C.faint,"stroke-width":.48,opacity:.2,transform:`rotate(${r()*24-12} ${cx} ${cy})`}));
    return;
  }
  if(motif==="geodesic-net"){
    for(let i=0;i<count+5;i++){const a=Math.PI*2*i/(count+5),x1=cx+Math.cos(a)*210,y1=cy+Math.sin(a)*120,x2=cx+Math.cos(a+Math.PI*.77)*210,y2=cy+Math.sin(a+Math.PI*.77)*120;layer.append(el("path",{d:`M ${x1} ${y1} Q ${cx+(r()-.5)*110} ${cy+(r()-.5)*80} ${x2} ${y2}`,fill:"none",stroke:C.faint,"stroke-width":.46,opacity:.21}));}
    return;
  }

  const nodes:Array<[number,number]>=[];
  for(let i=0;i<count+4;i++){const a=Math.PI*2*i/(count+4),rr=90+r()*145;nodes.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.72]);}
  for(let i=1;i<nodes.length;i++)layer.append(el("polygon",{points:`${cx},${cy} ${nodes[i-1][0]},${nodes[i-1][1]} ${nodes[i][0]},${nodes[i][1]}`,fill:C.accent,"fill-opacity":.018,stroke:C.faint,"stroke-width":.45,opacity:.2}));
}

function renderCorridor(g:SVGGElement,mode:string,cx:number,cy:number,seed:number,rank:number,phase:number){
  const r=rng(seed^0xfeedc0de);
  const pts:Array<[number,number]>=[];
  for(let y=-20;y<=720;y+=16){
    const t=y/700; let x=cx;
    switch(mode){
      case "orbit-crossing": x+=Math.sin(y/82+rank*.19+phase)*74+Math.cos(t*Math.PI*4)*18; break;
      case "braided-thread": x+=Math.sin(y/58+phase)*46+Math.sin(y/27+rank)*19; break;
      case "boundary-graze": x+=(t-.5)*260+Math.sin(y/76+phase)*24; break;
      case "node-hopping": x+=Math.sin(Math.floor(y/82)*1.7+rank)*82+Math.sin(y/32)*8; break;
      case "recursive-return": x+=Math.sin(y/44+phase)*(34+Math.abs(.5-t)*90); break;
      case "phase-locked": x+=Math.sin(y/72+phase)*58; break;
      case "fold-through": x+=(t<.5?-1:1)*(36+Math.sin(y/58)*34); break;
      case "waveguide": x+=Math.sin(y/118+phase)*26+Math.sin(y/34+rank)*11; break;
      default: x+=Math.sin(y/86+rank*.23+phase)*64+Math.sin(y/31)*18;
    }
    pts.push([x+(r()-.5)*1.5,y]);
  }
  layerPath(g,pts,C.accent,2.9,.08);
  g.append(el("path",{d:pathFrom(pts),fill:"none",stroke:C.accent,"stroke-width":1.2,"stroke-dasharray":mode==="phase-locked"?"1 5":"2 4",opacity:.92,"stroke-linecap":"round"}));
  g.append(el("circle",{cx:pts[Math.floor(pts.length/2)][0],cy,r:2.4,fill:C.strong,opacity:.88}));
}

function renderOrigin(g:SVGGElement,cx:number,cy:number,seed:number,confidence:PublicSignal["evidenceConfidence"]){
  const r=rng(seed^0x10203040);
  const outer=confidence==="high"?72:confidence==="medium"?62:54;
  g.append(el("circle",{cx,cy,r:outer,fill:"none",stroke:C.accent,"stroke-width":.62,opacity:.11}));
  g.append(el("circle",{cx,cy,r:41+r()*7,fill:"none",stroke:C.accent,"stroke-width":.9,opacity:confidence==="provisional"?.2:.35,"stroke-dasharray":confidence==="provisional"?"2 5":"none"}));
  g.append(el("circle",{cx,cy,r:15,fill:"none",stroke:C.ink,"stroke-width":.55,opacity:.16}));
  g.append(el("circle",{cx,cy,r:5,fill:C.strong,opacity:.96}));
}

function layerPath(g:SVGGElement,pts:Array<[number,number]>,stroke:string,width:number,opacity:number){
  g.append(el("path",{d:pathFrom(pts),fill:"none",stroke,"stroke-width":width,opacity,"stroke-linecap":"round"}));
}

function renderFamily(g:SVGGElement,family:OperatorFamily,cx:number,cy:number,seed:number,intensity=1){
  const r=rng(seed^0x9e3779b9),phase=r()*Math.PI*2,main=.55+intensity*.3,faint=.12+intensity*.18;
  if(family==="loop"){
    for(let k=0;k<7;k++){const pts:Array<[number,number]>=[];for(let j=0;j<=180;j++){const t=j/180*Math.PI*2;pts.push([cx+(42+k*25)*Math.sin(3*t+phase),cy+(28+k*15)*Math.sin(2*t+k*.16)]);}layerPath(g,pts,k===3?C.ink:C.faint,k===3?1.1:.55,k===3?main:faint);}
  } else if(family==="lattice"){
    const spacing=28+Math.round(r()*12);for(let x=cx-210;x<=cx+210;x+=spacing)g.append(el("line",{x1:x,y1:cy-170,x2:x+64,y2:cy+170,stroke:C.soft,"stroke-width":.65,opacity:faint+.08}));for(let y=cy-170;y<=cy+170;y+=spacing)g.append(el("line",{x1:cx-220,y1:y,x2:cx+220,y2:y-44,stroke:C.faint,"stroke-width":.5,opacity:faint}));
  } else if(family==="attractor"){
    for(let s=0;s<18;s++){const pts:Array<[number,number]>=[];let rr=14+s*7;for(let j=0;j<80;j++){const t=j*.16+phase+s*.04;rr*=1.007;pts.push([cx+Math.cos(t*1.13)*rr,cy+Math.sin(t*.91)*rr*.68]);}layerPath(g,pts,s%4===0?C.ink:C.faint,s%4===0?1:.5,s%4===0?main:faint);}
  } else if(family==="orbit"){
    for(let k=0;k<12;k++)g.append(el("ellipse",{cx,cy,rx:48+k*17,ry:18+k*9,fill:"none",stroke:k%4===0?C.ink:C.faint,"stroke-width":k%4===0?1:.5,opacity:k%4===0?main:faint,transform:`rotate(${k*13+phase*18} ${cx} ${cy})`}));
  } else if(family==="braid"){
    for(let q=0;q<6;q++){const pts:Array<[number,number]>=[];for(let x=cx-280;x<=cx+280;x+=6)pts.push([x,cy+(q-2.5)*24+50*Math.sin(x/(48+q*4)+phase+q*Math.PI/3)]);layerPath(g,pts,q===2?C.ink:C.soft,q===2?1.1:.6,q===2?main:faint+.08);}
  } else if(family==="interference"){
    for(let rr=22;rr<220;rr+=18){g.append(el("circle",{cx:cx-82,cy,r:rr,fill:"none",stroke:C.faint,"stroke-width":.5,opacity:faint}));g.append(el("circle",{cx:cx+82,cy,r:rr,fill:"none",stroke:C.faint,"stroke-width":.5,opacity:faint}));}
  } else if(family==="fold"){
    for(let k=0;k<16;k++){const y=cy-170+k*22;g.append(el("polyline",{points:`${cx-220},${y} ${cx},${cy+(y-cy)*.23} ${cx+220},${y}`,fill:"none",stroke:k%5===0?C.ink:C.faint,"stroke-width":k%5===0?1:.5,opacity:k%5===0?main:faint}));}
  } else if(family==="field"){
    for(let x=cx-200;x<=cx+200;x+=34)for(let y=cy-160;y<=cy+160;y+=34){const a=Math.atan2(y-cy,x-cx)+Math.PI/2;g.append(el("line",{x1:x,y1:y,x2:x+Math.cos(a)*13,y2:y+Math.sin(a)*13,stroke:C.soft,"stroke-width":.65,opacity:faint+.08}));}
  } else if(family==="recursion"){
    for(let k=0;k<11;k++){const s=240*Math.pow(.84,k);g.append(el("rect",{x:cx-s/2,y:cy-s/2,width:s,height:s,fill:"none",stroke:k%3===0?C.ink:C.faint,"stroke-width":k%3===0?1:.5,opacity:k%3===0?main:faint,transform:`rotate(${k*12+phase*10} ${cx} ${cy})`}));}
  } else {
    for(let q=0;q<12;q++){const pts:Array<[number,number]>=[];for(let x=cx-310;x<=cx+310;x+=6)pts.push([x,cy+(q-5.5)*12+(30+q*2.6)*Math.sin(x/(40+q*1.7)+phase+q*.26)]);layerPath(g,pts,q===5?C.ink:C.faint,q===5?1.1:.5,q===5?main:faint);}
  }
}
