import "./styles/app.css";
import { renderSignalWorld } from "@blochfield/continuum-renderer";
import { signals } from "./runtime/store";

const app = document.querySelector<HTMLElement>("#app")!;
let index = 0;

function mount(){
  const s=signals[index];
  app.innerHTML=`
    <div class="pc-shell">
      <header class="pc-hud">
        <div class="pc-brand">PERSONAL CONTINUUM / BLOCHFIELD<br><span class="pc-handle">persistent origin · situated render</span></div>
        <div></div>
        <div class="pc-state">${String(index+1).padStart(2,"0")} / ${signals.length}<br>${s.voiceStance} · ${s.render.primaryFamily}</div>
      </header>
      <section class="pc-stage">
        <div class="pc-art" id="world"></div>
        <article class="pc-copy">
          <div class="pc-eyebrow">${s.id} · curator rank ${s.curatorRank}</div>
          <h1 class="pc-name">${s.name} <span class="pc-handle">${s.handle}</span></h1>
          <div class="pc-projection">${s.projection7}</div>
          <div class="pc-statuses">
            <span class="pc-status" data-active="true">OBSERVED</span>
            <span class="pc-status">INTERPRETED</span>
            <span class="pc-status">OPEN</span>
            <span class="pc-status">INDEPENDENTLY VERIFIED</span>
          </div>
        </article>
      </section>
      <nav class="pc-footer" aria-label="Continuum navigation">
        <button class="pc-button" id="prev">previous</button>
        <button class="pc-button" id="next">next</button>
      </nav>
    </div>`;
  document.querySelector("#world")!.append(renderSignalWorld(s));
  document.querySelector<HTMLButtonElement>("#prev")!.onclick=()=>{index=(index-1+signals.length)%signals.length;mount();};
  document.querySelector<HTMLButtonElement>("#next")!.onclick=()=>{index=(index+1)%signals.length;mount();};
}
mount();
