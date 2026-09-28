import manifest from "../../../../data/public-signals.v1.json";
import type { PublicSignalManifest } from "@blochfield/continuum-model";
export const signals = (manifest as PublicSignalManifest).signals;
