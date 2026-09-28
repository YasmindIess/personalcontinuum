# ADR-0004 — Keep the first modular renderer framework-light

**Status:** Accepted for v0.1

The foundation uses Vite + TypeScript and explicit DOM/SVG modules instead of introducing a large component runtime immediately.

The dominant complexity is not component composition; it is provenance semantics, deterministic geometry, virtualization and publication lineage. Keeping the renderer framework-light makes those costs visible and preserves the ability to move the shell later to Astro/SSR/static generation when per-world social metadata and deep-route indexing become launch-critical.
