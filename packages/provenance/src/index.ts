export type ReceiptKind = "source-ingested" | "relation-seed-created" | "interpretation-added" | "response-received" | "verification-recorded" | "projection-published";
export interface Receipt<T=unknown> {
  schema: "blochfield.receipt.v1";
  id: string;
  kind: ReceiptKind;
  occurredAt: string;
  actor: string;
  objectId: string;
  parent?: string;
  payload: T;
}
export function canonicalize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b));
    return `{${entries.map(([k,v])=>JSON.stringify(k)+":"+canonicalize(v)).join(",")}}`;
  }
  return JSON.stringify(value);
}


export async function sha256Canonical(value:unknown):Promise<`sha256:${string}`>{
  const bytes=new TextEncoder().encode(canonicalize(value));
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  const hex=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,"0")).join("");
  return `sha256:${hex}`;
}
