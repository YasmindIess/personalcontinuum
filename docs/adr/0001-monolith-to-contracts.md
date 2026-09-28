# ADR-0001 — Replace the monolith with semantic contracts

**Status:** Accepted

## Decision

Freeze Persona Continuum V2.1 as a reference artifact and move production work into workspace packages with one-way dependencies.

## Why

The monolith proved interaction and aesthetics quickly, but it entangles model, placeholder scoring, SVG generation, publication copy, and runtime behavior. That makes evidence semantics difficult to audit and forces every visual iteration to risk conceptual regressions.

## Consequence

The HTML file is no longer canonical state. `data/` plus typed packages become canonical; renderers become replaceable projections.
