import type { OperatorFamily, PublicSignal } from "@blochfield/continuum-model";

const NS="http://www.w3.org/2000/svg";
const C={bg:"#05070a",ink:"#e6efe8",soft:"#91a59e",faint:"#5d6d67",accent:"#d9f99d",strong:"#eefad0"};
export interface RenderContext{corridorPhase?:number;density?:"full"|"reduced"}

const el=<K extends keyof SVGElementTagNameMap>(tag:K,attrs:Record<string,string|number>={})=>{
  const n=document.createElementNS(NS,tag);
  for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));
  return n;
};
const rng=(seed:number)=>{let t=seed>>>0;return()=>{t+=0x6d2b79f5;let r=Math.imul(t^(t>>>15),1|t);r^=r+Math.imul(r^(r>>>7),61|r);return((r^(r>>>14))>>>0)/4294967296}};
const path=(pts:Array<[number,number]>,close=false)=>pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ")+(close?" Z":"");
const stroke=(g:SVGGElement,d:string,color=C.ink,w=1,o=.7,dash="")=>g.append(el("path",{d,fill:"none",stroke:color,"stroke-width":w,opacity:o,"stroke-linecap":"round",...(dash?{"stroke-dasharray":dash}:{})}));
const poly=(pts:Array<[number,number]>)=>pts.map(p=>p[0].toFixed(1)+","+p[1].toFixed(1)).join(" ");

export function renderSignalWorld(signal:PublicSignal,ctx:RenderContext={}):SVGSVGElement{
  const svg=el("svg",{viewBox:"0 0 1000 700",role:"img","aria-label":signal.name+": "+signal.render.operatorId+" operator-signature world",
    "data-operator-id":signal.render.operatorId,"data-primary":signal.render.primaryFamily,"data-secondary":signal.render.secondaryFamily,
    "data-deformation":signal.render.deformation,"data-topology":signal.render.topologyMotif,"data-corridor":signal.render.corridorMode});
  const root=el("g");svg.append(root);
  const r=rng(signal.render.seed),reduced=ctx.density==="reduced",density=reduced?.62:1;
  const cx=500+(r()-.5)*54,cy=350+(r()-.5)*38,dx=(r()-.5)*72,dy=(r()-.5)*48,rot=(r()-.5)*34;
  const field=el("g",{opacity:reduced?.27:.38,"data-layer":"shared-field"});sharedField(field,signal.rank,signal.render.seed,density);root.append(field);
  chamber(root,cx,cy,signal.render.seed,signal.evidenceConfidence);
  topology(root,signal.render.topologyMotif,cx,cy,signal.render.seed,density);
  const kernel=el("g",{transform:deform(signal.render.deformation,cx,cy,signal.render.seed,1.04),"data-layer":"dominant-silhouette","data-family":signal.render.primaryFamily});
  silhouette(kernel,signal.render.primaryFamily,cx+dx,cy+dy,signal.render.seed,rot);root.append(kernel);
  secondary(root,signal.render.secondaryFamily,signal.render.deformation,cx,cy,signal.render.seed);
  corridor(root,signal.render.corridorMode,cx,cy,signal.render.seed,signal.rank,ctx.corridorPhase??0);
  micro(root,cx,cy,signal.render.seed,signal.render.primaryFamily);
  origin(root,cx,cy,signal.render.seed,signal.evidenceConfidence);
  return svg;
}

function sharedField(g:SVGGElement,rank:number,seed:number,density:number){
  const r=rng(seed^0xa511e9b3),rows=Math.max(5,Math.round(10*density)),cols=Math.max(7,Math.round(14*density));
  for(let j=0;j<rows;j++){const p:Array<[number,number]>=[];for(let x=12;x<=988;x+=40)p.push([x,78+j*(512/Math.max(1,rows-1))+Math.sin(x/(72+j*3)+rank*.19)*(5+r()*4)+Math.cos(x/184+j*.29)*3]);stroke(g,path(p),C.faint,.46,j%3===0?.24:.12)}
  for(let j=0;j<cols;j++){const p:Array<[number,number]>=[];for(let y=48;y<=652;y+=36)p.push([76+j*(848/Math.max(1,cols-1))+Math.sin(y/(84+j*2)+rank*.13)*6+Math.cos(y/198+j*.25)*3,y]);stroke(g,path(p),C.faint,.42,j%4===0?.2:.1)}
}

function chamber(g:SVGGElement,cx:number,cy:number,seed:number,confidence:PublicSignal["evidenceConfidence"]){
  const r=rng(seed^0x77c0ffee),rx=224+r()*28,ry=186+r()*26,c=el("g",{"data-layer":"identity-chamber"});g.append(c);
  c.append(el("ellipse",{cx,cy,rx:rx+22,ry:ry+20,fill:C.bg,"fill-opacity":.82,stroke:C.faint,"stroke-width":.42,opacity:.98}));
  c.append(el("ellipse",{cx,cy,rx,ry,fill:C.accent,"fill-opacity":.01,stroke:C.soft,"stroke-width":.74,opacity:.38,transform:"rotate("+((r()-.5)*10).toFixed(2)+" "+cx+" "+cy+")"}));
  c.append(el("ellipse",{cx,cy,rx:rx*.82,ry:ry*.82,fill:"none",stroke:C.faint,"stroke-width":.48,opacity:.22,"stroke-dasharray":"1 6"}));
  const n=confidence==="high"?9:confidence==="medium"?7:5;
  for(let i=0;i<n;i++)c.append(el("ellipse",{cx,cy,rx:rx*(.18+(i%3)*.055),ry,fill:"none",stroke:C.faint,"stroke-width":.4,opacity:.13,transform:"rotate("+((i/n)*180).toFixed(2)+" "+cx+" "+cy+")"}));
  for(const a of [0,45,90,-45])c.append(el("line",{x1:cx-rx*.92,y1:cy,x2:cx+rx*.92,y2:cy,stroke:C.faint,"stroke-width":.4,opacity:a%90===0?.17:.09,transform:"rotate("+a+" "+cx+" "+cy+")"}));
}

function topology(g:SVGGElement,motif:string,cx:number,cy:number,seed:number,density:number){
  const r=rng(seed^0x0ddba11),n=Math.max(5,Math.round(8*density)),layer=el("g",{"data-layer":"topology-container","data-topology":motif});g.append(layer);
  if(motif==="simplex-fan"||motif==="triangulated-membrane"){
    const nodes:Array<[number,number]>=[],count=motif==="simplex-fan"?7:9;
    for(let i=0;i<count;i++){const a=Math.PI*2*i/count+(r()-.5)*.18,rr=138+(i%2)*40+r()*22;nodes.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.72])}
    for(let i=0;i<count;i++){const q=nodes[(i+1)%count];layer.append(el("polygon",{points:cx+","+cy+" "+nodes[i][0]+","+nodes[i][1]+" "+q[0]+","+q[1],fill:C.accent,"fill-opacity":.018,stroke:C.accent,"stroke-width":.52,opacity:.3}))}return;
  }
  if(motif==="recursive-cell"){for(let i=0;i<n+2;i++){const s=304*Math.pow(.83,i);layer.append(el("rect",{x:cx-s/2,y:cy-s/2,width:s,height:s,rx:5+i,fill:"none",stroke:i%2===0?C.accent:C.faint,"stroke-width":i===0?.8:.48,opacity:i===0?.32:.18,transform:"rotate("+(i*11+r()*8).toFixed(2)+" "+cx+" "+cy+")"}))}return}
  if(motif==="mobius-seam"||motif==="braided-strip"){const bands=motif==="mobius-seam"?4:6;for(let b=0;b<bands;b++){const p:Array<[number,number]>=[];for(let t=0;t<=Math.PI*2;t+=.05){const rr=154+b*9+24*Math.cos(t*2);p.push([cx+Math.cos(t)*rr,cy+Math.sin(t)*rr*.45+Math.sin(t*2+b*.4)*24])}stroke(layer,path(p),b===Math.floor(bands/2)?C.accent:C.faint,b===Math.floor(bands/2)?.82:.46,b===Math.floor(bands/2)?.38:.17)}return}
  if(motif==="branch-complex"){const branch=(x:number,y:number,len:number,a:number,d:number)=>{if(d<=0)return;const x2=x+Math.cos(a)*len,y2=y+Math.sin(a)*len;layer.append(el("line",{x1:x,y1:y,x2,y2,stroke:d>2?C.accent:C.faint,"stroke-width":Math.max(.35,d*.14),opacity:.12+d*.045}));branch(x2,y2,len*.7,a-.44-r()*.1,d-1);branch(x2,y2,len*.7,a+.44+r()*.1,d-1)};branch(cx,cy+154,94,-Math.PI/2,5);return}
  if(motif==="geodesic-net"||motif==="caustic-web"){const count=motif==="geodesic-net"?11:13,nodes:Array<[number,number]>=[];for(let i=0;i<count;i++){const a=Math.PI*2*i/count,x=cx+Math.cos(a)*(168+r()*28),y=cy+Math.sin(a)*(122+r()*24);nodes.push([x,y]);layer.append(el("circle",{cx:x,cy:y,r:i%3===0?2.4:1.2,fill:C.accent,opacity:i%3===0?.48:.26}))}for(let i=0;i<count;i++){const q=nodes[(i+(motif==="geodesic-net"?4:5))%count];layer.append(el("line",{x1:nodes[i][0],y1:nodes[i][1],x2:q[0],y2:q[1],stroke:i%3===0?C.accent:C.faint,"stroke-width":.46,opacity:.18}))}return}
  const flat=motif==="torus-section";for(let rr=112;rr<=194;rr+=27)layer.append(el("ellipse",{cx,cy,rx:rr,ry:rr*(flat?.4:.66),fill:"none",stroke:rr===112?C.accent:C.faint,"stroke-width":rr===112?.78:.48,opacity:rr===112?.32:.17,transform:"rotate("+((r()-.5)*24).toFixed(2)+" "+cx+" "+cy+")"}));
}

function silhouette(g:SVGGElement,f:OperatorFamily,cx:number,cy:number,seed:number,rotation:number){
  const r=rng(seed^0x0a11ce55),sx=.9+r()*.24,sy=.82+r()*.31,core=el("g",{transform:"translate("+cx+" "+cy+") rotate("+rotation.toFixed(2)+") scale("+sx.toFixed(3)+" "+sy.toFixed(3)+") translate("+-cx+" "+-cy+")"});g.append(core);
  const outline=(d:string,fo=.055,w=1.25,o=.88)=>core.append(el("path",{d,fill:C.strong,"fill-opacity":fo,stroke:C.ink,"stroke-width":w,opacity:o,"stroke-linejoin":"round"}));
  if(f==="loop"){const p:Array<[number,number]>=[];for(let t=0;t<=Math.PI*2;t+=.045){const rr=112+34*Math.cos(3*t+r()*.02)+18*Math.sin(5*t);p.push([cx+Math.cos(t)*rr,cy+Math.sin(t)*rr*.82])}outline(path(p,true),.065,1.5,.94);core.append(el("ellipse",{cx,cy,rx:48,ry:31,fill:C.bg,"fill-opacity":.96,stroke:C.accent,"stroke-width":.72,opacity:.86}));return}
  if(f==="lattice"){const p:Array<[number,number]>=[];for(let i=0;i<10;i++){const a=-Math.PI/2+Math.PI*2*i/10,rr=i%2===0?140:64;p.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr])}outline(path(p,true),.045,1.3,.92);for(let i=0;i<10;i++){const q=p[(i+3)%10];core.append(el("line",{x1:p[i][0],y1:p[i][1],x2:q[0],y2:q[1],stroke:C.accent,"stroke-width":.6,opacity:.38}))}return}
  if(f==="attractor"){const p:Array<[number,number]>=[];for(let t=0;t<Math.PI*6;t+=.055){const rr=8+t*7.6;p.push([cx+Math.cos(t*1.07)*rr,cy+Math.sin(t*.93)*rr*.74])}stroke(core,path(p),C.ink,7.5,.1);stroke(core,path(p),C.strong,1.65,.92);core.append(el("circle",{cx,cy,r:20,fill:C.strong,"fill-opacity":.09,stroke:C.accent,"stroke-width":.82,opacity:.9}));return}
  if(f==="orbit"){core.append(el("ellipse",{cx,cy,rx:136,ry:54,fill:C.strong,"fill-opacity":.03,stroke:C.ink,"stroke-width":1.4,opacity:.9,transform:"rotate(22 "+cx+" "+cy+")"}));core.append(el("ellipse",{cx,cy,rx:80,ry:120,fill:"none",stroke:C.accent,"stroke-width":.86,opacity:.56,transform:"rotate(-30 "+cx+" "+cy+")"}));for(const a of [0,1.7,3.35,5.05])core.append(el("circle",{cx:cx+Math.cos(a)*118,cy:cy+Math.sin(a)*58,r:5+(Math.sin(a*3)+1)*2.2,fill:C.strong,opacity:.88}));return}
  if(f==="braid"){for(let q=0;q<4;q++){const p:Array<[number,number]>=[];for(let t=-Math.PI;t<=Math.PI;t+=.045)p.push([cx+t*46,cy+Math.sin(t*2+q*Math.PI/2)*62+q*7-11]);stroke(core,path(p),q===1?C.strong:C.ink,q===1?2.2:1.15,q===1?.92:.58)}return}
  if(f==="interference"){for(const [dx,dy,a] of [[-58,0,-18],[58,0,18],[0,-24,90]] as Array<[number,number,number]>)core.append(el("ellipse",{cx:cx+dx,cy:cy+dy,rx:92,ry:58,fill:C.strong,"fill-opacity":.038,stroke:C.ink,"stroke-width":1.08,opacity:.74,transform:"rotate("+a+" "+(cx+dx)+" "+(cy+dy)+")"}));outline("M "+(cx-148)+" "+cy+" Q "+cx+" "+(cy-112)+" "+(cx+148)+" "+cy+" Q "+cx+" "+(cy+112)+" "+(cx-148)+" "+cy+" Z",.028,.82,.64);return}
  if(f==="fold"){const p:Array<[number,number]>=[[cx-142,cy+54],[cx-92,cy-84],[cx-28,cy-36],[cx+34,cy-126],[cx+78,cy-42],[cx+146,cy-72],[cx+106,cy+82],[cx+22,cy+44],[cx-44,cy+118]];outline(path(p,true),.06,1.34,.92);for(let i=1;i<p.length-1;i++)core.append(el("line",{x1:p[i][0],y1:p[i][1],x2:cx,y2:cy,stroke:C.accent,"stroke-width":.54,opacity:.3}));return}
  if(f==="field"){for(let i=0;i<24;i++){const a=Math.PI*2*i/24,inner=28+(i%3)*5,outer=92+(i%5)*13;core.append(el("line",{x1:cx+Math.cos(a)*inner,y1:cy+Math.sin(a)*inner,x2:cx+Math.cos(a)*outer,y2:cy+Math.sin(a)*outer,stroke:i%4===0?C.strong:C.ink,"stroke-width":i%4===0?1.45:.68,opacity:i%4===0?.88:.44}))}core.append(el("circle",{cx,cy,r:40,fill:C.strong,"fill-opacity":.07,stroke:C.accent,"stroke-width":1.08,opacity:.82}));return}
  if(f==="recursion"){for(let i=0;i<8;i++){const s=230*Math.pow(.79,i);core.append(el("rect",{x:cx-s/2,y:cy-s/2,width:s,height:s,rx:2+i*1.5,fill:i===0?C.strong:"none","fill-opacity":i===0?.018:0,stroke:i%2===0?C.ink:C.accent,"stroke-width":i===0?1.38:.72,opacity:.76,transform:"rotate("+(i*13)+" "+cx+" "+cy+")"}))}return}
  for(let q=-2;q<=2;q++){const p:Array<[number,number]>=[];for(let x=-150;x<=150;x+=5)p.push([cx+x,cy+q*17+Math.sin(x/34+q*.48)*(58-Math.abs(q)*6)]);stroke(core,path(p),q===0?C.strong:C.ink,q===0?2.25:.82,q===0?.94:.46)}
}

function secondary(g:SVGGElement,f:OperatorFamily,deformation:string,cx:number,cy:number,seed:number){
  const r=rng(seed^0x5ec0ad),side=r()>.5?1:-1,px=cx+side*(118+r()*36),py=cy+(r()-.5)*92,p=el("g",{opacity:.58,transform:deform(deformation,px,py,seed^0x7f4a7c15,.5),"data-layer":"secondary-pressure","data-family":f});g.append(p);
  p.append(el("ellipse",{cx:px,cy:py,rx:78,ry:58,fill:C.accent,"fill-opacity":.025,stroke:C.accent,"stroke-width":.62,opacity:.38}));
  skeleton(p,f,px,py,seed^0x9e3779b9);
  stroke(g,"M "+px+" "+py+" Q "+((px+cx)/2).toFixed(1)+" "+(cy+(r()-.5)*54).toFixed(1)+" "+cx+" "+cy,C.accent,.72,.34,"2 5");
}
function skeleton(g:SVGGElement,f:OperatorFamily,cx:number,cy:number,seed:number){
  const r=rng(seed^0x9e3779b9),phase=r()*Math.PI*2;
  if(f==="loop"||f==="orbit"){for(let i=0;i<5;i++)g.append(el("ellipse",{cx,cy,rx:22+i*14,ry:f==="loop"?18+i*9:10+i*12,fill:"none",stroke:i===2?C.strong:C.faint,"stroke-width":i===2?.95:.46,opacity:i===2?.58:.24,transform:"rotate("+(phase*18+i*17).toFixed(2)+" "+cx+" "+cy+")"}));return}
  if(f==="lattice"||f==="recursion"){for(let i=0;i<5;i++){const s=100*Math.pow(.8,i);g.append(el("rect",{x:cx-s/2,y:cy-s/2,width:s,height:s,fill:"none",stroke:i===0?C.strong:C.faint,"stroke-width":i===0?.9:.46,opacity:i===0?.5:.24,transform:"rotate("+(i*14)+" "+cx+" "+cy+")"}))}return}
  if(f==="field"||f==="interference"){for(let i=0;i<10;i++){const a=Math.PI*2*i/10;g.append(el("line",{x1:cx+Math.cos(a)*12,y1:cy+Math.sin(a)*12,x2:cx+Math.cos(a)*66,y2:cy+Math.sin(a)*44,stroke:i%3===0?C.strong:C.faint,"stroke-width":i%3===0?.9:.45,opacity:i%3===0?.5:.22}))}return}
  const p:Array<[number,number]>=[];for(let x=-72;x<=72;x+=4)p.push([cx+x,cy+Math.sin(x/18+phase)*32]);stroke(g,path(p),C.strong,1.05,.58);
}

function corridor(g:SVGGElement,mode:string,cx:number,cy:number,seed:number,rank:number,phase:number){
  const layer=el("g",{"data-layer":"corridor-interaction","data-mode":mode});g.append(layer);
  const glow=(d:string,o=.9,dash="2 4")=>{stroke(layer,d,C.accent,5.2,.055);stroke(layer,d,C.accent,1.28,o,dash)};
  if(mode==="orbit-crossing"){glow("M 30 "+(cy+26)+" C 240 "+(cy-92)+", "+(cx-150)+" "+(cy-138)+", "+cx+" "+cy+" C "+(cx+132)+" "+(cy+126)+", 770 "+(cy+70)+", 970 "+(cy-34));layer.append(el("ellipse",{cx,cy,rx:150,ry:86,fill:"none",stroke:C.accent,"stroke-width":.7,opacity:.3,transform:"rotate("+(22+(rank%7)*3)+" "+cx+" "+cy+")"}))}
  else if(mode==="braided-thread")for(const o of [-14,14])glow("M 30 "+(cy+o)+" C 230 "+(cy-110-o)+", "+(cx-98)+" "+(cy+118+o)+", "+cx+" "+(cy+o*.2)+" S 760 "+(cy-96-o)+", 970 "+(cy+o),o<0?.78:.62);
  else if(mode==="boundary-graze")glow("M 20 "+(cy+146)+" Q "+(cx-40)+" "+(cy-220)+" 980 "+(cy-116),.88,"1 5");
  else if(mode==="node-hopping"){const p:Array<[number,number]>=[];for(let i=0;i<9;i++)p.push([40+i*115,cy+Math.sin(i*1.55+phase)*104]);glow(path(p),.86,"1 7");for(const [x,y] of p)layer.append(el("circle",{cx:x,cy:y,r:3,fill:C.strong,opacity:.82}))}
  else if(mode==="recursive-return")glow("M 20 "+cy+" C 230 "+(cy-150)+", "+(cx-170)+" "+(cy-120)+", "+cx+" "+cy+" C "+(cx+170)+" "+(cy+120)+", "+(cx+170)+" "+(cy-128)+", "+cx+" "+(cy-42)+" C "+(cx-120)+" "+(cy+40)+", 760 "+(cy+150)+", 980 "+(cy+10));
  else if(mode==="phase-locked")for(const o of [-18,18])glow("M 20 "+(cy+o)+" C 250 "+(cy-92-o)+", "+(cx-120)+" "+(cy+92+o)+", "+cx+" "+(cy+o)+" S 760 "+(cy-92-o)+", 980 "+(cy+o),.72,"1 5");
  else if(mode==="split-return"){glow("M 20 "+cy+" C 240 "+(cy-20)+", "+(cx-180)+" "+(cy-28)+", "+(cx-80)+" "+cy);glow("M "+(cx-80)+" "+cy+" C "+(cx-12)+" "+(cy-132)+", "+(cx+84)+" "+(cy-118)+", "+(cx+148)+" "+(cy-28)+" C "+(cx+204)+" "+(cy+52)+", 760 "+(cy+68)+", 980 "+(cy+8),.78);glow("M "+(cx-80)+" "+cy+" C "+(cx-12)+" "+(cy+132)+", "+(cx+84)+" "+(cy+118)+", "+(cx+148)+" "+(cy+28),.62,"1 6")}
  else if(mode==="thread")glow("M 20 "+(cy+70)+" Q "+(cx-190)+" "+(cy-24)+" "+cx+" "+cy+" T 980 "+(cy-58),.95,"3 5");
  else if(mode==="fold-through")glow("M 20 "+(cy-88)+" L "+(cx-76)+" "+(cy-88)+" L "+(cx+12)+" "+(cy+12)+" L "+(cx+94)+" "+(cy+104)+" L 980 "+(cy+104),.9,"2 5");
  else for(const o of [-22,0,22])glow("M 20 "+(cy+o)+" C 260 "+(cy-54+o)+", "+(cx-150)+" "+(cy+54-o)+", "+cx+" "+(cy+o*.25)+" S 760 "+(cy-54+o)+", 980 "+(cy+o),o===0?.86:.52,o===0?"2 4":"1 7");
  layer.append(el("circle",{cx,cy,r:3.1,fill:C.strong,opacity:.96}));
}

function micro(g:SVGGElement,cx:number,cy:number,seed:number,f:OperatorFamily){
  const r=rng(seed^0x5151a9),sig=el("g",{"data-layer":"micro-signature","data-family":f});g.append(sig);
  const side=r()>.5?1:-1,base=(side>0?-.15:Math.PI-.15)+(r()-.5)*.5,rr=158+r()*22,count=9+(seed%7);
  for(let i=0;i<count;i++){const a=base+(i-count/2)*.055,local=rr+(i%3)*7,x=cx+Math.cos(a)*local,y=cy+Math.sin(a)*local*.76;sig.append(el("circle",{cx:x,cy:y,r:i%4===0?2.1:1.05,fill:i%4===0?C.strong:C.accent,opacity:i%4===0?.82:.46}));if(i%3===0)sig.append(el("line",{x1:x,y1:y,x2:x+Math.cos(a)*10,y2:y+Math.sin(a)*10,stroke:C.accent,"stroke-width":.62,opacity:.42}))}
  for(let bit=0;bit<8;bit++){if(((seed>>>bit)&1)===0)continue;const a=base-.34+bit*.095;sig.append(el("line",{x1:cx+Math.cos(a)*(rr-18),y1:cy+Math.sin(a)*(rr-18)*.76,x2:cx+Math.cos(a)*(rr-8),y2:cy+Math.sin(a)*(rr-8)*.76,stroke:C.strong,"stroke-width":.9,opacity:.58}))}
}

function origin(g:SVGGElement,cx:number,cy:number,seed:number,confidence:PublicSignal["evidenceConfidence"]){
  const r=rng(seed^0x10203040),outer=confidence==="high"?72:confidence==="medium"?62:54;
  g.append(el("circle",{cx,cy,r:outer,fill:"none",stroke:C.accent,"stroke-width":.62,opacity:.11}));
  g.append(el("circle",{cx,cy,r:41+r()*7,fill:"none",stroke:C.accent,"stroke-width":.9,opacity:confidence==="provisional"?.2:.35,"stroke-dasharray":confidence==="provisional"?"2 5":"none"}));
  g.append(el("circle",{cx,cy,r:5,fill:C.strong,opacity:.96}));
}

function deform(kind:string,cx:number,cy:number,seed:number,scale:number){
  const r=rng(seed^0x13579bdf),a=(r()-.5)*26,sx=scale*(.9+r()*.22),sy=scale*(.88+r()*.25),around=(body:string)=>"translate("+cx+" "+cy+") "+body+" translate("+-cx+" "+-cy+")";
  if(kind==="curvature-bias")return around("rotate("+a.toFixed(2)+") scale("+sx.toFixed(3)+" "+sy.toFixed(3)+")");
  if(kind==="radial-pulse")return around("scale("+(sx*1.08).toFixed(3)+" "+(sy*.94).toFixed(3)+")");
  if(kind==="nested-contraction")return around("rotate("+a.toFixed(2)+") scale("+(sx*.86).toFixed(3)+")");
  if(kind==="standing-wave")return "translate("+((r()-.5)*42).toFixed(2)+" "+((r()-.5)*28).toFixed(2)+") scale("+sx.toFixed(3)+" "+sy.toFixed(3)+")";
  if(kind==="anisotropic-scale")return around("scale("+(sx*1.16).toFixed(3)+" "+(sy*.78).toFixed(3)+")");
  if(kind==="torsion")return "rotate("+(a*1.8).toFixed(2)+" "+cx+" "+cy+") scale("+sx.toFixed(3)+" "+sy.toFixed(3)+")";
  if(kind==="phase-slip")return around("translate("+((r()-.5)*34).toFixed(2)+" 0) rotate("+(a*.55).toFixed(2)+") scale("+sx.toFixed(3)+" "+sy.toFixed(3)+")");
  if(kind==="mirror-fold"){const mirrored=r()>.5?-sx:sx;return around("skewY("+(a*.42).toFixed(2)+") scale("+mirrored.toFixed(3)+" "+sy.toFixed(3)+")")}
  if(kind==="vortex-drift")return "translate("+((r()-.5)*70).toFixed(2)+" "+((r()-.5)*52).toFixed(2)+") rotate("+(a*1.35).toFixed(2)+" "+cx+" "+cy+") scale("+sx.toFixed(3)+" "+sy.toFixed(3)+")";
  if(kind==="shear")return around("skewX("+(a*.82).toFixed(2)+") scale("+sx.toFixed(3)+" "+sy.toFixed(3)+")");
  return around("scale("+sx.toFixed(3)+" "+sy.toFixed(3)+")");
}
