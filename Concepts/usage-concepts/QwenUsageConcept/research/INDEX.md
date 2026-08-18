# Research index

Maps the handoff's required research outputs to the files produced. The external-usage corpus was split into two batches (A: trackers/CLI dashboards; B: observability/gateway/billing + VS Code extensions + niche) for parallel research; the ledgers and notes are split accordingly and consolidated in `usage-recommendations.md`.

**Scope and date.** This corpus was produced during the U1–U9 phase and re-verified against that corpus on 2026-07-30. It predates U10 and U11. Nothing in it describes the selected concept — the independent audit separately measured that the four Slint portability documents contain zero occurrences of the string "u11". Read this as design research for the concept set, not as evidence about `u11-prism`.

**Every file listed below was checked to exist on 2026-08-18.** That check is worth stating because the version of this index that shipped before 2026-08-18 ended with a 21-row table of audit and gate artifacts under `../verification/`, and **not one of those files exists** — see [Removed on 2026-08-18](#removed-on-2026-08-18).

## Plans research
| Required | File(s) |
|---|---|
| plans-source-ledger.json | `plans-source-ledger.json` (71 entries, shared multi-domain schema) |
| plans-coverage-map.md | `plans-coverage-map.md` |
| plans-usage-synthesis.md | `plans-usage-synthesis.md` (+ `plans-gui-synthesis.md`, `plans-command-registry.md`) |
| plans-gap-and-conflict-register.md | `plans-gap-and-conflict-register.md` (usage + GUI sections) |
| proposed-plan-updates.md | `proposed-plan-updates.md` (P1–P21 proposed future Plans/command changes, NOT applied; P9–P13 discovered during the build; P15–P17 from the final phase — per-theme typography/voice tokens, the redacted-Raw machine-field exception, and layout-strategy differentiation; P18–P21 from the closing phase — area-aware density tiers, the content-fit contract, curated default compositions, and the focus-mode morph. **P14 (freeform canvas engine) is RETRACTED** — the engine was removed per user direction) |
| data-rebuild-notes.md | `data-rebuild-notes.md` (build-phase notes for the `_shared/usage-data.js` semantic rebuild: `counting_semantics`, `provider_total`, source-aware used-tokens, three-way cost, provenance, window independence) |

> **Caveat added 2026-08-18.** The `proposed-plan-updates.md` entry above previously said P9–P13 and P17–P21 were "grounded in the visual-review evidence", and the `data-rebuild-notes.md` entry said "the final numbers are authoritative in FINDINGS.md / verification". Both pointers are removed: the visual-review evidence they named does not exist, so those proposals rest on the build's design judgement and on the prototypes themselves, not on a measurement record. The proposals may still be good; their stated evidential basis was not real.

## External usage research (≥12 projects required; 14 delivered)
| Required | File(s) |
|---|---|
| usage-project-source-ledger.json | `usage-ledger-A.json` (6 projects) + `usage-ledger-B.json` (8 projects) |
| usage-project-comparison-matrix.md | see `usage-notes-A.md` + `usage-notes-B.md` (per-project trace tables) and `usage-recommendations.md` (cross-project synthesis) |
| usage-computation-notes.md | `usage-notes-A.md` + `usage-notes-B.md` (code excerpts of counting and aggregation) |
| usage-issues-and-failure-modes.md | `issues_prs[]` in both ledgers + "Top failure modes" in `usage-recommendations.md` |
| usage-recommendations.md | `usage-recommendations.md` (answers handoff §5.3 Q1–Q9) |

Projects (14): ccusage, Claude-Code-Usage-Monitor, cc-statusline, opencode, claudecodeui, codeburn (batch A); LiteLLM, Helicone, OpenMeter, Lago, LLM-Token-Counter, vs-context, copilot-usage-dashboard-v2, github-copilot-usage-tracker (batch B). Commit SHAs in the ledger JSONs.

## Motion research (≥12 sources required; 14 delivered)
| Required | File(s) |
|---|---|
| motion-source-ledger.json | `motion-source-ledger.json` (14 sources) |
| motion-synthesis.md | `motion-synthesis.md` |
| motion-token-map.json | `motion-token-map.json` (12 semantic tokens + reduced variants) |
| motion-to-slint-map.md | `motion-to-slint-map.md` |
| (additional, not required) | `animation-elevation-reference.md` — present in this folder and previously unlisted |

## Portability / inventory
| Topic | File(s) |
|---|---|
| File/role inventory + U1/U2 blast radius | `concept-inventory.md` — covers U1–U9 only; it predates U10 and U11 and does not describe them |
| Slint portability audit | `slint-portability-audit.md` (initial) + `slint-1.17.1-verification.md` (CORRECTION: only 2 true blockers for 1.17.1) |
| PMConcept7 production extraction | `pmconcept7-reference.md` (§1 glass is the alignment source) |
| Glass → Slint 1.17.1 mapping | `glass-slint-mapping.md` (final web glass implementation + token-level Slint mapping; blur-free portable path) |

## Reconciliation (Phase E)
| Topic | File |
|---|---|
| Requirements/Plans/code/evidence traceability | `reconciliation-traceability.md` |

## Verification evidence — what actually exists

There is one automated gate for the selected concept and it lives outside this folder.

| Topic | File(s) | State |
|---|---|---|
| U11 verification harness | `../u11-verify.mjs` | Exists. Playwright-core plus system Chrome, its own static server, isolated profile. Run with `node u11-verify.mjs` from the concept root. Documented in `../README.md` under Verification. |
| U11 harness output | `../reports/visual-interaction-test-report.json` | Exists. 80 cases, 80 pass, from a run at 2026-08-13T22:40:12.792Z. **Stale** — the harness and five concept files were edited on 2026-08-18 and it has not been re-run. |
| Superseded harness output | `../reports/visual-interaction-test-report.pre-correction-77.json` | Exists. The 77-case run it replaced, retained. |
| U11 harness screenshots | `../verify-shots/` | Exists. 16 PNGs — 8 theme shots at 1700px plus 8 feature shots. |
| U11 redesign screenshots | `../verification/u11/redesign/` | Exists. 13 PNGs plus `cdp-shots.mjs` and `std-shots.mjs`. **This is the entire contents of `../verification/`** — 15 files. |
| Register outputs | `../reports/` | Exists. 8 packet-required outputs plus `reference-review-report.json` and the retained archive. Revised 2026-08-18. |
| Independent audit | `../../PM_Usage_Independent_Audit_2026-08-17/` | Exists. Read-only 12-axis audit of U11: `AUDIT_REPORT.md`, `FINDINGS.json` (167 findings, 20 refuted), `DECISION_CLASSIFICATION.json` (107 decisions), `CANONICAL_FIXTURE_CROSSCHECK.json`, a corrected port handoff, and `audit-evidence/` holding 18 harness scripts, 34 probe files and 86 screenshots (counted 2026-08-18; the audit's own contents list says 15 / 27 / 80). Verdict: not ready to port. |

There is no base matrix, no interactive-states gate, no data-unit gate, no visual-review ledger and no design-critique corpus for the U1–U9 set. None was ever committed.

## Removed on 2026-08-18

This index previously carried two blocks that have been deleted rather than softened, because every artifact they named is absent.

**A "Visual-review evidence" row** pointing at `../verification/visual-review-ledger.json`, described as "rebuilt to the final state: 280 entries, 7 concepts × 40 combos, all pass", together with per-combo lineage files `../verification/visual-review-{page}.json`.

**A 21-row "Audit & verification evidence (final phase, all in ../verification/)" table** naming: `audit-design-critique.md`, `audit-design-recritique.md`, `qa-design-critique-final.md`, `audit-widget-fit.md`, `qa-fit-final.md`, `qa-fit-final.json`, `qa-fit-remeasure.md`, `qa-final-widgets.md`, `qa-final-widgets-results.json`, `qa-final-static.md`, `qa-final-static-results.json`, `qa-u9.md`, `qa-u9-results.json`, `qa-u9-recomp.md`, `audit-distinctiveness.md`, `audit-robustness.md`, `robustness-results.json`, `robustness-recheck.json`, `audit-data-semantics.md`, `audit-accessibility.md`, `audit-a11y-results.json`, `a11y-audit.mjs`, `audit-motion.md`, `audit-motion-evidence.json`, `audit-motion-evidence2.json`, `audit-a11y-motion-recheck.md`, `audit-a11y-motion-recheck.json`, `contrast-final-cleanup.md`, `contrast-final-probe-before.json`, `contrast-final-probe-after.json`, `u8-canvas-freeform.obsolete.mjs`, `u8-canvas-freeform-results.json`, `u8-bento-harness.mjs`, `results.json`, `report.md`, `state-results.json` and `data-unit.mjs`, plus the quantitative claims carried in the row labels — "scrolling 77% → 7.8%, every widget 1.00×, 0px cut-off", "base matrix 280/280", "1003 assertions", and the AA-contrast probe pair.

Verified 2026-08-18, three ways:

1. `find ../verification -type f` returns exactly 15 files, all under `../verification/u11/redesign/`.
2. Each of the 41 named artifacts was tested individually with `test -e`; all 41 are missing. `find` across the whole `Concepts/usage-concepts` tree finds none of them relocated elsewhere.
3. `git log --all --oneline --diff-filter=A` returns **0 commits** for every one of those names, and the only commit that has ever touched `../verification/` is `aa122d7c85`, which added exactly the 15 files that are there. There are no deletions. Nothing was lost — nothing was ever created.

The same claims were removed from `../README.md`, which had also given three runnable commands for scripts that do not exist and designated a nonexistent `verification/known-limitations.md` as the file to read "before trusting green". This is audit finding **A11-03** (major).
