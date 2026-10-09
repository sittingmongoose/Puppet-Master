# Sources index — A-M03-B / treatment / research (S09 plugin-workbench)

Navigable index of evidence retained under `sources/`. Machine-readable counterpart: `../source-map.json` (immutable source IDs; no silent rebind). All access timestamps UTC, fetch date 2026-10-09.

## Extension / sandbox runtimes (O2 mechanisms)

| ID | Title | Evidence file | Kind | Accessed |
|----|-------|---------------|------|----------|
| SRC-01 | Deno — Security and permissions | [SRC-01-deno-security.md](SRC-01-deno-security.md) | vendor docs (live) | 19:30:44Z |
| SRC-02 | Wasmtime book — Security | [SRC-02-wasmtime-security.md](SRC-02-wasmtime-security.md) | vendor docs (live) | 19:30:44Z |
| SRC-04 | Figma — How plugins run | [SRC-04-figma-plugins.md](SRC-04-figma-plugins.md) | vendor docs (live) | 19:31:37Z |
| SRC-09 | QuickJS manual (memory limits, interrupts) | [SRC-09-quickjs-manual.md](SRC-09-quickjs-manual.md) | project manual (live) | 19:32:19Z |
| SRC-10 | Extism README (Wasm plugin framework) | [SRC-10-extism-readme.md](SRC-10-extism-readme.md) | repo README (HEAD) | 19:32:47Z |

## Domain products (O1 discovery)

| ID | Title | Evidence file | Kind | Accessed |
|----|-------|---------------|------|----------|
| SRC-03 | OpenRefine — Writing extensions | [SRC-03-openrefine-extensions.md](SRC-03-openrefine-extensions.md) | product docs (live) | 19:31:08Z |
| SRC-08 | MarcEdit website | [SRC-08-marcedit-home.md](SRC-08-marcedit-home.md) | product site | 19:32:19Z |
| SRC-12 | OpenRefine — Exporting your work (operation history) | [SRC-12-openrefine-exporting.md](SRC-12-openrefine-exporting.md) | product docs (live) | 19:33:50Z |

## Issue / fix / release chains (O3)

| ID | Title | Evidence file | Kind | Accessed |
|----|-------|---------------|------|----------|
| SRC-05 | Zotero 7 for Developers (plugin migration overlay→bootstrap) | [SRC-05-zotero7-dev.md](SRC-05-zotero7-dev.md) | migration guide (updated 2026-05-23) | 19:31:37Z |
| SRC-06 | OpenRefine releases 3.9.3→3.10.1 (incl. failed 3.9.4) | [SRC-06-openrefine-releases.md](SRC-06-openrefine-releases.md) | GitHub releases (dynamic) | 19:31:37Z |
| SRC-11 | Wasmtime advisory GHSA-vqjp-4c8c-hfgg (filesystem sandbox escape) | [SRC-11-wasmtime-advisory.md](SRC-11-wasmtime-advisory.md) | security advisory (2026-08-20) | 19:33:10Z |

## Declarative transformation (O1 alternative approach)

| ID | Title | Evidence file | Kind | Accessed |
|----|-------|---------------|------|----------|
| SRC-07 | JSONata — Overview | [SRC-07-jsonata-overview.md](SRC-07-jsonata-overview.md) | project docs (live) | 19:32:19Z |

## Observed fetch failures (honest record)

- https://extism.org/docs/concepts/plugins → HTTP 404 (SRC-10 note; manifest fields unverified this pass)
- https://openrefine.org/docs/manual/undo-redo → HTTP 404 (superseded by SRC-12 via search)
- https://docs.openrefine.org/manual/undoredo → HTTP 404 (same)
- 301 redirects observed and followed: docs.openrefine.org → openrefine.org (SRC-03); figma.com/plugin-docs → developers.figma.com (SRC-04)

## Suggested reading order for a reviewer

1. Brief context: `../assignment.md`, brief obligations O1–O6 (read from `cases/S09/brief.md` only).
2. Landscape: SRC-03, SRC-08, SRC-07 (domain + declarative tier).
3. Isolation mechanisms: SRC-01, SRC-02, SRC-09, SRC-10, SRC-04.
4. Evolution evidence: SRC-05, SRC-06, SRC-11.
5. Reproducibility pattern: SRC-12.
6. Synthesis: `../discovery.md`.
