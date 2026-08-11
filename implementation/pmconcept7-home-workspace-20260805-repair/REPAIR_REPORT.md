# PMConcept7 Home Workspace post-audit repair

Status: **BLOCKED — repository certification**, with the bounded Home repair ready for independent re-audit.

The failed Home Workspace surface has been repaired from the authored T20 source. `Concepts/PMConcept7.html` is byte-identical to two clean builds at `91665182b3db3c7ce53018f4ea12e82fc6c65c0abc8b9c0e5c72869d887f21db` (3,424,764 bytes). The compact top-bar menu now contains exactly:

1. `Open Panel` → Panel 1–4
2. `Open Browser in Panel` → Panel 1–4
3. `Collapse Bottom Terminal`

Reset moved to Settings → General & Appearance → Startup & Recovery. File Manager targeting, Move/Dock, terminal-local limits, and diagnostics no longer crowd this menu.

## Repair evidence

- Home interaction matrix: 22/22 checks and 72/72 visual cases, with zero console/page-error cases.
- Legacy regression: smoke passes with zero console errors; capture matrix is 35/35.
- Direct in-app Browser pass: compact flyouts, keyboard focus, Browser routing, dock/drag, resizer glow, four-edge dissolve, disabled reason, Settings reset, and honest popup fallback all pass.
- Stable identity, four-section/four-pane caps, exact cancellation rollback, transactional persistence, corrupt/future/duplicate/offscreen recovery, and migration are executable matrix checks.
- Control census: 134 rows, 0 unresolved.
- Requirement traceability: 49/49 rows are ready for a fresh independent audit; this repair does not overwrite the immutable audit or self-issue PASS.

The genuine OS-blur attempt is recorded honestly: the controlled webview did not deliver a `window.blur` event during the available Finder/tab/visibility transitions. The production listener and executable blur-cancellation test pass, but no direct-OS-blur observation is claimed.

## Governance

The disposable shadow converged with Spec Lock, evidence, plan graph, shards, auto-decisions, wiring, and audit closure passing. The final `run-gates` execution is side-effect free and finishes **24/26**.

Two repository-wide checks remain fail-closed:

1. **PNC-019 / implementation readiness:** the event denominator and event-family contract depth remain incomplete (`39` registered kernel rows, persisted floor `222`, unregistered floor `185`). No certification receipt was fabricated.
2. **Plan migration:** `Plans/Usage_Concepts_Rebuild_Plan.md` has no PlanUnits and the historical inventory contains 72 documents while the live set contains 73.

These are outside the bounded Home repair and were preserved. A fresh independent audit should run after those global blockers are repaired.

Git custody is intentionally fail-closed. The source manifest addresses the live repair worktree; the bounded commit contains only Home-owned product files, canonical hunks, atomic Home registries, tests, and evidence. It does not absorb the unrelated PM6 and global governance changes that were already dirty, so no clean-clone certification is claimed.

## Packet index

- `repair_report.json` — machine-readable disposition
- `build_reproducibility.json` and `source_manifest.json` — lineage and hashes
- `test_results.json`, `visual_inspection.json`, and `visual_evidence_manifest.json` — executable and rendered evidence
- `control_census.json` and `requirement_traceability.jsonl` — production control and HW traceability
- `governance_results.json` and `governance/` — validators, custody, and exact failures
- `governance/git_diff_check.json` — exact global/staged whitespace disposition and scoped PASS
