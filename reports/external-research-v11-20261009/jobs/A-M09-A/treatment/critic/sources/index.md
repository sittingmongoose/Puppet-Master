# Sources index (S09 critic, ER11 A-M09-A treatment)

Navigable index of critic-retained bounded evidence. Full provenance in
[../source-map.json](../source-map.json) (immutable C-series IDs, no silent rebind).
Each excerpt file holds short verbatim quotes + locator + honest negatives, transcribed from
pages fetched 2026-10-09T19:20–19:21Z. Predecessor research sources (S00–S12) were read in full
from the declared source root and are cited as `Sxx` where the critic relies on excerpt-level
(rather than independently re-fetched) evidence; such reliance is flagged in critique.md.

- C00 brief: no excerpt file (frozen campaign input; read directly).
- C01 Deno Permissions: [c01-deno-permissions.md](c01-deno-permissions.md) — --allow-all =
  sandbox-off/Node-equivalent, symlink link-location rule + /proc|/dev|/sys + environ guards,
  deny-overrides-allow, NotCapable, disk carve-outs, subprocess/FFI sandbox escape,
  module-load default (no node_modules carveout found).
- C02 Web Extensions: [c02-web-extensions.md](c02-web-extensions.md) — WebWorker sandbox,
  browser entry, single bundle, require('vscode') shim, no Node globals, vscode.workspace.fs,
  fetch+CORS, no child processes, desktop support.
- C03 Issue #5581: [c03-issue-5581.md](c03-issue-5581.md) — nbsp bug body, Chromium-only note,
  Closed/#5584/milestone 3.7; commit-level details not re-verified (flagged).
- C04 OpenRefine Exporting: [c04-openrefine-exporting.md](c04-openrefine-exporting.md) —
  view-vs-dataset export, formats, .tar.gz + confidential-prior-data caution, JSON recipe
  extract/re-apply.
- C05 Wasmtime CLI: [c05-wasmtime-cli.md](c05-wasmtime-cli.md) — WASI auto-hook + instantiation
  failure, --dir + arg-order rule, --invoke, serve since 18; --mapdir/fuel/network-grant
  negatives flagged.
