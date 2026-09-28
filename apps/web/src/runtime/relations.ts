import fixture from "../../../../data/relation-seeds.example.json";
import type { RelationSeed } from "@blochfield/relation-seeds";

export const relationSeeds:RelationSeed[]=[fixture as RelationSeed];
export const findRelationSeed=(id:string)=>relationSeeds.find(seed=>seed.id.toUpperCase()===id.toUpperCase());
