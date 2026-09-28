export * from "./relation-seed";

import type { PublicSignal } from "@blochfield/continuum-model";
export interface ThreadPostDraft {
  part: 1 | 2;
  position: number;
  signalId: string;
  tag: string;
  text: string;
  publishMode: "manual-review-required";
}
export function threadPart(rank:number):1|2 { return rank <= 25 ? 1 : 2; }
export function draftSignalPost(signal:PublicSignal, baseUrl:string):ThreadPostDraft {
  const part=threadPart(signal.rank);
  const position=part===1?signal.rank:signal.rank-25;
  return {
    part, position, signalId:signal.id, tag:signal.handle,
    text:`${signal.handle} — ${signal.projection7}\n\nA rendered public signal in Personal Continuum. Citation does not imply endorsement.\n${baseUrl}/p/${signal.rank}`,
    publishMode:"manual-review-required"
  };
}
