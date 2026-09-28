import type { PublicSignal } from "@blochfield/continuum-model";

export type ContinuumRoute =
  | { kind:"signal"; index:number }
  | { kind:"relation"; id:string }
  | { kind:"publication" }
  | { kind:"topology" };

export function parseRoute(signals:PublicSignal[], locationLike:Pick<Location,"pathname"|"hash">=location):ContinuumRoute{
  const path=decodeURIComponent(locationLike.pathname).replace(/\/+$/,"")||"/";
  if(path==="/publication")return {kind:"publication"};
  if(path==="/topology")return {kind:"topology"};

  const relation=path.match(/^\/r\/(RS-[A-Z0-9-]+)$/i);
  if(relation)return {kind:"relation",id:relation[1].toUpperCase()};

  const signalPath=path.match(/^\/p\/(PS-\d+|\d+)$/i);
  if(signalPath){
    const raw=signalPath[1].toUpperCase();
    const index=/^PS-/.test(raw)
      ? signals.findIndex(signal=>signal.id.toUpperCase()===raw)
      : Number(raw)-1;
    if(index>=0&&index<signals.length)return {kind:"signal",index};
  }

  const hash=locationLike.hash.slice(1).toUpperCase();
  const legacy=signals.findIndex(signal=>signal.id.toUpperCase()===hash);
  return {kind:"signal",index:legacy>=0?legacy:0};
}

export const signalPath=(signal:PublicSignal)=>"/p/"+encodeURIComponent(signal.id);
export const relationPath=(id:string)=>"/r/"+encodeURIComponent(id);
