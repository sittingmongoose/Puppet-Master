# PMConcept6 Source-Lineage Note

`Concepts/pm6-build/**` is illustrative/source-lineage prototype material only. Usage data, dashboard counters, token fields, costs, provider rows, widget labels, events, commands, receipts, and manifests in this folder do not define active Puppet Master Usage UX, UsageRecord fields, source authority, accounting, quota truth, WorkNodes, NodeSeeds, executable queues, production wiring, or build tasks.

Promoted Usage behavior must be restated in live owner docs, primarily `Plans/usage-feature.md`, `Plans/FinalGUISpec.md`, `Plans/Runtime_Artifacts_Panel.md`, `Plans/UI_Command_Catalog.md`, and `Plans/Wiring_Matrix.production.json`. Prototype HTML in this folder must not be treated as implementation authority.

## Re-baselining the working copy

Do this after part-editing waves (and before anyone runs `carve.py --force`) so
`assemble.py --gate g0` stays green: the working monolith must equal today's
assembled output, and carve must reproduce today's `parts/` byte-for-byte.

### Manifest-driven invariant

`manifest.json` is the single inventory source for both `assemble.py` and
`carve.py`. Adding a part means adding it to `manifest.json` (with the correct
`kind`, order, and stub metadata); carve follows automatically. Carve never
falls back to a builtin stub list.

### Safe procedure

1. Confirm current parts assemble cleanly: `python3 assemble.py --gate g2`, then
   `--gate g3`. Fresh assembled bytes must match the committed
   `PMConcept6.assembled.html`.
2. Copy assembled bytes exactly onto `PMConcept6.working.html` (no newline or
   encoding changes).
3. **Scratch-copy rule for carve:** copy the entire `pm6-build/` directory to a
   temp location. In that scratch copy only, run `python3 carve.py --force`.
   Diff every scratch `parts/*.part.html` against the repo `parts/`. Require
   54/54 byte-identical, zero ghosts, zero missing before touching the repo.
4. In the repo (only after scratch is perfect): keep the working=assembled copy,
   run `python3 assemble.py --gate g0` (must report IDENTICAL), update only
   `working_sha256` in `manifest.json`, then re-run `--gate g2` and `--gate g3`.
5. No-regression: rebuild PM7 into a scratch outdir
   (`python3 Concepts/pm7-tools/build_pm7.py --outdir <scratch>`) and confirm
   `PM7-phaseA.html` still matches committed `Concepts/PMConcept7.html`. Run
   `python3 scripts/pm-plans-verify.py run-gates` and note any evidence-hash
   refresh needed for the new `manifest.json` sha (governance seal; do not
   hand-edit `Plans/.evidence/**` here).

### Boundary rules carve applies

- **Comment ownership:** a contiguous block comment immediately preceding a
  part-boundary marker belongs to the following part (it documents that part).
  This keeps the W2 comment above `function showPRDMock` inside
  `26-js-prd-annotations`.
- **Assembler-injected part 28:** carve does not overwrite
  `28-js-settings-data.part.html` from the working slice. It verifies that
  `assemble.regen_settings_part(existing)` reproduces the working assignment
  line, then keeps the existing part bytes. Sidecar edits that change the
  minified body are expected; the part file stays the byte-original seed.

### Warning

**Never run `carve.py --force` against the repo `parts/`.** Carve writes beside
itself. Outside this scratch-proven flow, `--force` destroys wave edits and can
recreate stale boundaries. Always carve inside a full-directory scratch copy.
