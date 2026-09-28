import "./styles/app.css";
import "./styles/heptad.css";
import "./styles/audit.css";
import "./styles/relation.css";
import "./styles/publication.css";
import "./styles/topology.css";
import { renderSignalWorld } from "@blochfield/continuum-renderer";
import { compileSemanticHeptad } from "@blochfield/continuum-model";
import { signals } from "./runtime/store";
import { renderAuditSurface } from "./audit";
import { renderRelationSurface, renderMissingRelation } from "./relation";
import { renderPublicationSurface } from "./publication";
import { renderTopologySurface } from "./topology";
import { findRelationSeed, relationSeeds } from "./runtime/relations";
import { parseRoute, relationPath, signalPath } from "./runtime/routes";

const app = document.querySelector<HTMLElement>("#app")!;

const STANCE = {
  I: { label: "backcenter", meaning: "reflexive founder-side perspective" },
  YOU: { label: "addressed", meaning: "invitation toward another situated origin" },
  THEY: { label: "observed", meaning: "public-signal observation without impersonation" },
} as const;

const escapeHTML = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]!);

let index = (() => { const route=parseRoute(signals); return route.kind==="signal"?route.index:0; })();
let reducedDensity = matchMedia("(max-width: 700px)").matches;
let blindMode = false;
let derivationMode = false;
let auditMode = false;

function openSignal(nextIndex:number,replace=false){
  index=(nextIndex+signals.length)%signals.length;
  const method=replace?"replaceState":"pushState";
  history[method](null,"",signalPath(signals[index]));
  void mount();
}

function navigate(delta: number) {
  index = (index + delta + signals.length) % signals.length;
  history.replaceState(null, "", signalPath(signals[index]));
  void mount();
}

async function mount() {
  const route=parseRoute(signals);
  if(route.kind==="relation"){
    const seed=findRelationSeed(route.id);
    document.title=seed?route.id+" — Personal Continuum":"Relation not found — Personal Continuum";
    const back=()=>{history.pushState(null,"",signalPath(signals[index]));void mount();};
    app.replaceChildren(seed?await renderRelationSurface(seed,location.origin,back):renderMissingRelation(route.id,back));
    return;
  }
  if(route.kind==="publication"){
    document.title="Publication Manifold — Personal Continuum";
    app.replaceChildren(renderPublicationSurface(
      signals,
      location.origin,
      (signalId)=>{const next=signals.findIndex(signal=>signal.id===signalId);if(next>=0)openSignal(next);},
      ()=>{history.pushState(null,"",signalPath(signals[index]));void mount();},
    ));
    return;
  }
  if(route.kind==="topology"){
    document.title="Evidential Topology — Personal Continuum";
    app.replaceChildren(renderTopologySurface(
      signals,
      relationSeeds,
      (signalId)=>{const next=signals.findIndex(signal=>signal.id===signalId);if(next>=0)openSignal(next);},
      ()=>{history.pushState(null,"",signalPath(signals[index]));void mount();},
    ));
    return;
  }
  index=route.index;

  if (auditMode) {
    app.replaceChildren(renderAuditSurface(
      signals,
      (selected) => { auditMode = false; openSignal(selected); },
      () => { auditMode = false; void mount(); },
    ));
    return;
  }

  const s = signals[index];
  const stance = STANCE[s.voiceStance];
  const relationCount = s.relationSeeds.length;
  const confidence = s.evidenceConfidence.toUpperCase();
  const heptad = compileSemanticHeptad(s);
  const atomStrip = heptad.atoms.map((atom) =>
    `<span class="pc-atom-chip" data-action="${escapeHTML(atom.action)}"><b>${String(atom.order).padStart(2, "0")}</b><em>${escapeHTML(atom.token)}</em><i>${escapeHTML(atom.action)}</i></span>`,
  ).join("");
  const derivationRows = heptad.steps.map((step) =>
    `<div class="pc-derive-row" data-action="${escapeHTML(step.atom.action)}"><b>${String(step.atom.order).padStart(2, "0")}</b><strong>${escapeHTML(step.atom.token)}</strong><span>${escapeHTML(step.atom.action)}</span><code>κ ${step.after.curvature.toFixed(2)} · ρ ${step.after.density.toFixed(2)} · χ ${step.after.connectivity.toFixed(2)} · ω ${step.after.rhythm.toFixed(2)}</code></div>`,
  ).join("");

  document.title = `${s.name} — Personal Continuum`;
  app.innerHTML = `
    <div class="pc-shell" data-voice="${s.voiceStance}" data-confidence="${s.evidenceConfidence}" data-blind="${blindMode ? "true" : "false"}">
      <header class="pc-hud">
        <div class="pc-brand">
          PERSONAL CONTINUUM / BLOCHFIELD
          <span class="pc-handle">persistent origin · situated render</span>
        </div>
        <div class="pc-progress" aria-hidden="true"><i style="width:${((index + 1) / signals.length) * 100}%"></i></div>
        <div class="pc-state">
          ${String(index + 1).padStart(2, "0")} / ${signals.length}
          <span>${escapeHTML(heptad.fingerprint)} · projection7 source</span>
        </div>
      </header>

      <main class="pc-stage" aria-live="polite">
        <div class="pc-art" id="world"></div>

        <article class="pc-copy">
          <div class="pc-stance">
            <b>${s.voiceStance}</b>
            <span>${stance.label}</span>
            <em>${stance.meaning}</em>
          </div>

          <div class="pc-eyebrow">${escapeHTML(s.id)} · curator rank ${s.curatorRank}</div>
          <h1 class="pc-name">${escapeHTML(s.name)} <span class="pc-handle">${escapeHTML(s.handle)}</span></h1>
          <div class="pc-projection">${escapeHTML(s.projection7)}</div>

          <section class="pc-heptad-source" aria-label="Seven-word executable semantic source">
            <div class="pc-heptad-head">
              <strong>${escapeHTML(heptad.fingerprint)}</strong>
              <span>projection7 → ordered semantic composition</span>
            </div>
            <div class="pc-atom-strip">${atomStrip}</div>
          </section>

          <div class="pc-cues" aria-label="Situated evidence cues">
            <div>
              <strong>public evidence</strong>
              <span>${confidence}</span>
            </div>
            <div>
              <strong>relation seeds</strong>
              <span>${relationCount === 0 ? "OPEN / NONE YET" : String(relationCount)}</span>
            </div>
            <div>
              <strong>position</strong>
              <span>${s.position.status.toUpperCase()}</span>
            </div>
          </div>

          <div class="pc-operator pc-legacy-operator">
            <strong>legacy witness / ${escapeHTML(s.render.operatorId)}</strong>
            <span>${escapeHTML(s.render.primaryFamily)} × ${escapeHTML(s.render.secondaryFamily)}</span>
            <span>${escapeHTML(s.render.deformation)}</span>
            <span>${escapeHTML(s.render.topologyMotif)}</span>
            <span>${escapeHTML(s.render.corridorMode)}</span>
          </div>

          <div class="pc-statuses" aria-label="Relation epistemic states">
            <span class="pc-status" data-active="true">OBSERVED</span>
            <span class="pc-status">INTERPRETED</span>
            <span class="pc-status">OPEN</span>
            <span class="pc-status pc-status-wide">INDEPENDENTLY VERIFIED</span>
          </div>

          <p class="pc-boundary">
            Rendered public signal, not a definition of the person. Citation does not imply endorsement.
          </p>
        </article>
        <aside class="pc-derivation" data-open="${derivationMode ? "true" : "false"}" aria-hidden="${derivationMode ? "false" : "true"}">
          <div class="pc-derive-head">
            <div><strong>SEMANTIC HEPTAD</strong><span>${escapeHTML(heptad.fingerprint)}</span></div>
            <p>Each word mutates the state inherited from the previous word. Order is causal.</p>
          </div>
          <div class="pc-derive-list">${derivationRows}</div>
          <div class="pc-derive-result"><strong>RESULTANT</strong><span>x ${heptad.resultant.x.toFixed(2)} · y ${heptad.resultant.y.toFixed(2)} · angle ${heptad.resultant.angle.toFixed(2)} · radius ${heptad.resultant.radius.toFixed(2)}</span></div>
        </aside>
      </main>

      <nav class="pc-footer" aria-label="Continuum navigation">
        <button class="pc-blind-toggle" id="blind" aria-pressed="${blindMode}">${blindMode ? "reveal" : "blind test"}</button>
        <button class="pc-derive-toggle" id="derive" aria-pressed="${derivationMode}">${derivationMode ? "close derivation" : "derive"}</button>
        <button class="pc-derive-toggle" id="audit" aria-pressed="${auditMode}">audit 50</button>
        <button class="pc-derive-toggle" id="publication">publish 50</button>
        <button class="pc-derive-toggle" id="relation001">RS-0001</button>
        <button class="pc-derive-toggle" id="topology">topology</button>
        <button class="pc-button" id="prev" aria-label="Previous situated world">←</button>
        <div class="pc-footer-state">${String(index + 1).padStart(2, "0")} · ${escapeHTML(s.id)}</div>
        <button class="pc-button" id="next" aria-label="Next situated world">→</button>
      </nav>
    </div>`;

  document.querySelector("#world")!.append(
    renderSignalWorld(s, { density: reducedDensity ? "reduced" : "full" }),
  );

  document.querySelector<HTMLButtonElement>("#prev")!.onclick = () => navigate(-1);
  document.querySelector<HTMLButtonElement>("#next")!.onclick = () => navigate(1);
  document.querySelector<HTMLButtonElement>("#blind")!.onclick = () => { blindMode = !blindMode; mount(); };
  document.querySelector<HTMLButtonElement>("#derive")!.onclick = () => { derivationMode = !derivationMode; mount(); };
  document.querySelector<HTMLButtonElement>("#audit")!.onclick = () => { auditMode = true; void mount(); };
  document.querySelector<HTMLButtonElement>("#publication")!.onclick = () => { history.pushState(null,"","/publication"); void mount(); };
  document.querySelector<HTMLButtonElement>("#relation001")!.onclick = () => { history.pushState(null,"",relationPath("RS-0001")); void mount(); };
  document.querySelector<HTMLButtonElement>("#topology")!.onclick = () => { history.pushState(null,"","/topology"); void mount(); };
}

addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") navigate(-1);
  if (event.key === "ArrowRight") navigate(1);
  if (event.key.toLowerCase() === "b") { blindMode = !blindMode; void mount(); }
  if (event.key.toLowerCase() === "d") { derivationMode = !derivationMode; void mount(); }
  if (event.key.toLowerCase() === "a") { auditMode = !auditMode; void mount(); }
  if (event.key.toLowerCase() === "p") { history.pushState(null,"","/publication"); void mount(); }
  if (event.key.toLowerCase() === "r") { history.pushState(null,"",relationPath("RS-0001")); void mount(); }
  if (event.key.toLowerCase() === "t") { history.pushState(null,"","/topology"); void mount(); }
});

addEventListener("hashchange",()=>void mount());
addEventListener("popstate",()=>void mount());

matchMedia("(max-width: 700px)").addEventListener("change", (event) => {
  reducedDensity = event.matches;
  void mount();
});

if(location.pathname==="/"&&!location.hash)history.replaceState(null,"",signalPath(signals[index]));
void mount();
