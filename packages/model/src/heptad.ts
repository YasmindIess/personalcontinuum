export type SemanticAction =
  | "bind"
  | "branch"
  | "channel"
  | "diffuse"
  | "drift"
  | "expand"
  | "flow"
  | "fold"
  | "grow"
  | "lattice"
  | "morph"
  | "orbit"
  | "perturb"
  | "pulse"
  | "recurse"
  | "reflect"
  | "shield"
  | "superpose"
  | "weave"
  | "accumulate";

export interface SemanticVector {
  curvature: number;
  symmetry: number;
  density: number;
  scale: number;
  connectivity: number;
  rhythm: number;
  radiality: number;
  polarity: number;
}

export interface SemanticAtom {
  order: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  token: string;
  normalized: string;
  action: SemanticAction;
  vector: SemanticVector;
  tokenHash: number;
  contextHash: number;
  provenance: "projection7";
}

export interface SemanticState {
  x: number;
  y: number;
  angle: number;
  radius: number;
  curvature: number;
  density: number;
  connectivity: number;
  rhythm: number;
  phase: number;
}

export interface SemanticStep {
  atom: SemanticAtom;
  before: SemanticState;
  after: SemanticState;
}

export interface SemanticHeptad {
  schema: "blochfield.semantic-heptad.v0.1";
  source: string;
  atoms: [SemanticAtom, SemanticAtom, SemanticAtom, SemanticAtom, SemanticAtom, SemanticAtom, SemanticAtom];
  steps: [SemanticStep, SemanticStep, SemanticStep, SemanticStep, SemanticStep, SemanticStep, SemanticStep];
  fingerprint: `H7-${string}`;
  seed: number;
  resultant: SemanticState;
}

export interface SemanticSourceSignal {
  id: string;
  projection7: string;
  style: string;
  themes: string;
  persona: string;
}

const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
const wrap = (n: number, max = Math.PI * 2) => ((n % max) + max) % max;

export function semanticHash(value: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function normalizeSemanticToken(token: string): string {
  return token
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[“”‘’'"`,.:;!?()[\]{}<>$©™🜎]/gu, "")
    .replace(/^[-_]+|[-_]+$/g, "")
    .trim();
}

const ACTIONS: SemanticAction[] = [
  "bind", "branch", "channel", "diffuse", "drift", "expand", "flow", "fold", "grow", "lattice",
  "morph", "orbit", "perturb", "pulse", "recurse", "reflect", "shield", "superpose", "weave", "accumulate",
];

const ACTION_BASE: Record<SemanticAction, SemanticVector> = {
  bind:       {curvature:.42,symmetry:.72,density:.52,scale:.50,connectivity:.94,rhythm:.46,radiality:.38,polarity:.62},
  branch:     {curvature:.68,symmetry:.34,density:.62,scale:.66,connectivity:.86,rhythm:.55,radiality:.72,polarity:.57},
  channel:    {curvature:.28,symmetry:.78,density:.44,scale:.70,connectivity:.82,rhythm:.72,radiality:.26,polarity:.64},
  diffuse:    {curvature:.48,symmetry:.24,density:.30,scale:.78,connectivity:.26,rhythm:.40,radiality:.68,polarity:.52},
  drift:      {curvature:.72,symmetry:.20,density:.34,scale:.58,connectivity:.42,rhythm:.62,radiality:.34,polarity:.44},
  expand:     {curvature:.36,symmetry:.66,density:.36,scale:.94,connectivity:.52,rhythm:.48,radiality:.96,polarity:.72},
  flow:       {curvature:.82,symmetry:.42,density:.48,scale:.72,connectivity:.70,rhythm:.92,radiality:.30,polarity:.60},
  fold:       {curvature:.92,symmetry:.58,density:.60,scale:.54,connectivity:.64,rhythm:.36,radiality:.32,polarity:.46},
  grow:       {curvature:.60,symmetry:.40,density:.58,scale:.82,connectivity:.84,rhythm:.56,radiality:.78,polarity:.74},
  lattice:    {curvature:.16,symmetry:.90,density:.74,scale:.56,connectivity:.88,rhythm:.50,radiality:.24,polarity:.56},
  morph:      {curvature:.76,symmetry:.38,density:.54,scale:.76,connectivity:.58,rhythm:.64,radiality:.58,polarity:.68},
  orbit:      {curvature:.84,symmetry:.80,density:.40,scale:.80,connectivity:.64,rhythm:.76,radiality:.86,polarity:.56},
  perturb:    {curvature:.88,symmetry:.12,density:.46,scale:.70,connectivity:.34,rhythm:.74,radiality:.52,polarity:.36},
  pulse:      {curvature:.44,symmetry:.82,density:.58,scale:.62,connectivity:.50,rhythm:.96,radiality:.90,polarity:.70},
  recurse:    {curvature:.66,symmetry:.86,density:.70,scale:.42,connectivity:.78,rhythm:.68,radiality:.54,polarity:.52},
  reflect:    {curvature:.38,symmetry:.96,density:.46,scale:.60,connectivity:.56,rhythm:.34,radiality:.42,polarity:.50},
  shield:     {curvature:.58,symmetry:.88,density:.64,scale:.72,connectivity:.48,rhythm:.38,radiality:.92,polarity:.34},
  superpose:  {curvature:.74,symmetry:.76,density:.68,scale:.68,connectivity:.76,rhythm:.82,radiality:.62,polarity:.50},
  weave:      {curvature:.78,symmetry:.64,density:.66,scale:.64,connectivity:.96,rhythm:.80,radiality:.36,polarity:.58},
  accumulate: {curvature:.34,symmetry:.74,density:.90,scale:.56,connectivity:.72,rhythm:.46,radiality:.72,polarity:.76},
};

const RULES: Array<[RegExp, SemanticAction]> = [
  [/loop|return|recursive|recursion|source|continu|repeat/i, "recurse"],
  [/weav|braid|mesh|symbio|hybrid|interoper|co-dev|co-intelligent|together|collab/i, "weave"],
  [/quantum|superposition|advaita|balance|interference/i, "superpose"],
  [/flow|wave|motion|realtime|stream|river/i, "flow"],
  [/cosmic|space|world|realm|planetary|universe|broad/i, "expand"],
  [/chaos|fractal|emergen|generative|evol|branch/i, "branch"],
  [/code|compiler|system|protocol|layer|blockchain|engineer|programmer|glsl|infrastructure|bare-metal/i, "lattice"],
  [/privacy|shield|proof|crypto|bitcoin|secure|vault/i, "shield"],
  [/art|visual|cinema|dream|magic|alchemist|anime|painter|design|shader/i, "morph"],
  [/unknown|anomaly|ufo|outsider|nightmare|strange|wonder|xenophobe/i, "perturb"],
  [/meaning|philosophy|ontology|truth|conscious|intelligence|think|cognition|theor/i, "reflect"],
  [/fee|econom|basket|compound|value|creator|tokenised|tokenized/i, "accumulate"],
  [/nature|garden|regenerative|energy|biolog|child/i, "grow"],
  [/people|human|community|everyone|public|shared/i, "bind"],
  [/daily|every|frame|minute|morning|time/i, "pulse"],
  [/starman|wizard|gravity|orbit|skywatch/i, "orbit"],
  [/interface|assistant|media|content|conversation|subscribe|signal/i, "channel"],
  [/gradient|mobius|möbius|fold|dimensional/i, "fold"],
  [/mist|drift|soft|subtle|quiet/i, "drift"],
  [/scatter|slop|meme|whimsy/i, "diffuse"],
];

function actionFor(normalized: string, tokenHash: number, contextHash: number): SemanticAction {
  for (const [pattern, action] of RULES) if (pattern.test(normalized)) return action;
  return ACTIONS[((tokenHash ^ contextHash) >>> 0) % ACTIONS.length];
}

function perturb(base: number, hash: number, shift: number, order: number): number {
  const byte = (hash >>> shift) & 0xff;
  const delta = (byte / 255 - 0.5) * 0.20;
  const orderBias = ((order - 4) / 3) * 0.025;
  return clamp(base + delta + orderBias);
}

function vectorFor(action: SemanticAction, tokenHash: number, contextHash: number, order: number): SemanticVector {
  const base = ACTION_BASE[action];
  const h = (tokenHash ^ Math.imul(contextHash, order * 2654435761)) >>> 0;
  return {
    curvature: perturb(base.curvature, h, 0, order),
    symmetry: perturb(base.symmetry, h, 4, order),
    density: perturb(base.density, h, 8, order),
    scale: perturb(base.scale, h, 12, order),
    connectivity: perturb(base.connectivity, h, 16, order),
    rhythm: perturb(base.rhythm, h, 20, order),
    radiality: perturb(base.radiality, h, 24, order),
    polarity: perturb(base.polarity, h, 2, order),
  };
}

function initialState(seed: number): SemanticState {
  const unit = (shift: number) => ((seed >>> shift) & 0xff) / 255;
  return {
    x: (unit(0) - 0.5) * 0.18,
    y: (unit(8) - 0.5) * 0.14,
    angle: unit(16) * Math.PI * 2,
    radius: 0.22 + unit(24) * 0.10,
    curvature: 0.5,
    density: 0.5,
    connectivity: 0.5,
    rhythm: 0.5,
    phase: unit(4) * Math.PI * 2,
  };
}

function advance(before: SemanticState, atom: SemanticAtom): SemanticState {
  const v = atom.vector;
  const orderWeight = atom.order / 7;
  let angle = before.angle + (v.curvature - 0.5) * 1.45 + (v.polarity - 0.5) * 0.72 + orderWeight * 0.09;
  let radius = clamp(before.radius * (0.78 + v.scale * 0.48) + (v.radiality - 0.5) * 0.11, 0.11, 0.92);
  let step = 0.07 + v.connectivity * 0.055 + orderWeight * 0.012;
  let x = before.x + Math.cos(angle + before.phase * 0.10) * step;
  let y = before.y + Math.sin(angle - before.phase * 0.08) * step;

  switch (atom.action) {
    case "orbit": angle += Math.PI * 0.38; radius = clamp(radius + 0.09, 0.11, 0.92); break;
    case "recurse": radius = clamp(radius * 0.78, 0.11, 0.92); angle -= Math.PI * 0.16; break;
    case "expand": radius = clamp(radius + 0.15, 0.11, 0.92); break;
    case "fold": angle += (atom.order % 2 ? 1 : -1) * Math.PI * 0.46; break;
    case "weave": angle += Math.sin(before.phase + atom.order) * 0.62; break;
    case "superpose": x *= 0.88; y *= 0.88; break;
    case "branch": x += (v.polarity - 0.5) * 0.08; y -= (v.symmetry - 0.5) * 0.05; break;
    case "drift": x += (v.polarity - 0.5) * 0.12; y += (v.curvature - 0.5) * 0.08; break;
    case "shield": radius = clamp(Math.max(radius, 0.48), 0.11, 0.92); break;
    case "accumulate": radius = clamp(radius * 0.90 + 0.04, 0.11, 0.92); break;
    case "flow": angle += Math.sin(before.phase) * 0.28; break;
    case "perturb": angle += (v.polarity - 0.5) * 1.10; x += (v.symmetry - 0.5) * 0.07; break;
    case "lattice": angle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4); break;
    case "reflect": x = x * (atom.order % 2 ? -1 : 1); break;
    case "pulse": radius = clamp(radius + Math.sin(before.phase) * 0.07, 0.11, 0.92); break;
    case "grow": y -= 0.04 + v.scale * 0.04; break;
    case "channel": angle *= 0.82; break;
    case "bind": x *= 0.94; y *= 0.94; break;
    case "diffuse": step *= 1.12; break;
    case "morph": angle += (v.curvature - 0.5) * 0.52; break;
  }

  return {
    x: clamp(x, -0.88, 0.88),
    y: clamp(y, -0.82, 0.82),
    angle: wrap(angle),
    radius,
    curvature: clamp(before.curvature * 0.56 + v.curvature * 0.44),
    density: clamp(before.density * 0.58 + v.density * 0.42),
    connectivity: clamp(before.connectivity * 0.54 + v.connectivity * 0.46),
    rhythm: clamp(before.rhythm * 0.52 + v.rhythm * 0.48),
    phase: wrap(before.phase + 0.42 + v.rhythm * 0.88 + atom.order * 0.04),
  };
}

export function compileSemanticHeptad(signal: SemanticSourceSignal): SemanticHeptad {
  const tokens = signal.projection7.trim().split(/\s+/);
  if (tokens.length !== 7) throw new Error(`${signal.id} projection7 must contain exactly seven whitespace tokens`);

  const context = `${signal.style}\u241f${signal.themes}\u241f${signal.persona}`;
  const contextHash = semanticHash(context);
  const seed = semanticHash(`${signal.projection7}\u241e${context}\u241e${signal.id}`);

  const atoms = tokens.map((token, index) => {
    const normalized = normalizeSemanticToken(token);
    const tokenHash = semanticHash(`${normalized}\u241f${index + 1}`);
    const action = actionFor(normalized, tokenHash, contextHash);
    return {
      order: (index + 1) as SemanticAtom["order"],
      token,
      normalized,
      action,
      vector: vectorFor(action, tokenHash, contextHash, index + 1),
      tokenHash,
      contextHash,
      provenance: "projection7" as const,
    };
  }) as SemanticHeptad["atoms"];

  let state = initialState(seed);
  const steps: SemanticStep[] = [];
  for (const atom of atoms) {
    const before = {...state};
    state = advance(state, atom);
    steps.push({atom, before, after: {...state}});
  }

  const fingerprintHash = semanticHash(
    atoms.map(atom => `${atom.order}:${atom.normalized}:${atom.action}:${atom.tokenHash.toString(16)}`).join("|") +
    `|${contextHash.toString(16)}|${seed.toString(16)}`,
  );

  return {
    schema: "blochfield.semantic-heptad.v0.1",
    source: signal.projection7,
    atoms,
    steps: steps as SemanticHeptad["steps"],
    fingerprint: `H7-${fingerprintHash.toString(16).padStart(8, "0")}`,
    seed,
    resultant: {...state},
  };
}
