# Research index

Maps the handoff's required research outputs to the files produced. The external-usage corpus was split into two batches (A: trackers/CLI dashboards; B: observability/gateway/billing + VS Code extensions + niche) for parallel research; the ledgers/notes are split accordingly and consolidated in usage-recommendations.md.

## Plans research
| Required | File(s) |
|---|---|
| plans-source-ledger.json | plans-source-ledger.json (71 entries, shared multi-domain schema) |
| plans-coverage-map.md | plans-coverage-map.md |
| plans-usage-synthesis.md | plans-usage-synthesis.md (+ plans-gui-synthesis.md, plans-command-registry.md) |
| plans-gap-and-conflict-register.md | plans-gap-and-conflict-register.md (usage + GUI sections) |
| proposed-plan-updates.md | proposed-plan-updates.md (P1–P21 proposed future Plans/command changes, NOT applied; P9–P13 discovered during the build and grounded in the visual-review evidence; P15–P17 from the final phase — per-theme typography/voice tokens, the redacted-Raw machine-field exception, and layout-strategy differentiation; P18–P21 from the closing phase — area-aware density tiers, the content-fit contract, curated default compositions, and the focus-mode morph. **P14 (freeform canvas engine) is RETRACTED** — the engine was removed per user direction) |
| data-rebuild-notes.md | data-rebuild-notes.md (build-phase notes for the `_shared/usage-data.js` semantic rebuild: `counting_semantics`, `provider_total`, source-aware used-tokens, three-way cost, provenance, window independence; lineage — the final numbers are authoritative in FINDINGS.md / verification) |

## External usage research (≥12 projects required; 14 delivered)
| Required | File(s) |
|---|---|
| usage-project-source-ledger.json | usage-ledger-A.json (6 projects) + usage-ledger-B.json (8 projects) |
| usage-project-comparison-matrix.md | see usage-notes-A.md + usage-notes-B.md (per-project trace tables) and usage-recommendations.md (cross-project synthesis) |
| usage-computation-notes.md | usage-notes-A.md + usage-notes-B.md (code excerpts of counting/aggregation) |
| usage-issues-and-failure-modes.md | `issues_prs[]` in both ledgers + "Top failure modes" in usage-recommendations.md (≥30 issue/PR artifacts total) |
| usage-recommendations.md | usage-recommendations.md (answers handoff §5.3 Q1–Q9) |

Projects (14): ccusage, Claude-Code-Usage-Monitor, cc-statusline, opencode, claudecodeui, codeburn (batch A); LiteLLM, Helicone, OpenMeter, Lago, LLM-Token-Counter, vs-context, copilot-usage-dashboard-v2, github-copilot-usage-tracker (batch B). Commit SHAs in the ledger JSONs.

## Motion research (≥12 sources required; 14 delivered)
| Required | File(s) |
|---|---|
| motion-source-ledger.json | motion-source-ledger.json (14 sources) |
| motion-synthesis.md | motion-synthesis.md |
| motion-token-map.json | motion-token-map.json (12 semantic tokens + reduced variants) |
| motion-to-slint-map.md | motion-to-slint-map.md |

## Portability / inventory
| Topic | File(s) |
|---|---|
| File/role inventory + U1/U2 blast radius | concept-inventory.md |
| Slint portability audit | slint-portability-audit.md (initial) + slint-1.17.1-verification.md (CORRECTION: only 2 true blockers for 1.17.1) |
| PMConcept7 production extraction | pmconcept7-reference.md (§1 glass is the alignment source) |
| Glass → Slint 1.17.1 mapping | glass-slint-mapping.md (final web glass implementation + token-level Slint mapping; blur-free portable path) |

## Reconciliation (Phase E)
| Topic | File |
|---|---|
| Requirements/Plans/code/evidence traceability | reconciliation-traceability.md |
| Visual-review evidence (grounds P9–P13, P17–P21) | ../verification/visual-review-ledger.json (rebuilt to the final state: 280 entries, 7 concepts × 40 combos, all pass; automated geometry + a pointer to the final design critique) + ../verification/visual-review-{page}.json (intermediate per-combo lineage) |

## Audit & verification evidence (final phase, all in ../verification/)
Adversarial review layer that drove the hardening and design elevation; read for the honest journey, not just the green gate totals.

| Topic | File(s) |
|---|---|
| Design critique (pre-elevation) | audit-design-critique.md |
| Design re-critique (post-elevation; superseded by qa-design-critique-final.md, retained as lineage) | audit-design-recritique.md |
| Final design critique (current design verdict, closing phase) | qa-design-critique-final.md |
| Widget fit audit (content vs allocated space; span-only tier problem) | audit-widget-fit.md |
| Fit FINAL (area-aware rebuild re-measured: scrolling 77%→7.8%, every widget 1.00×, 0px cut-off) | qa-fit-final.md (+ qa-fit-final.json; superseded intermediate: qa-fit-remeasure.md) |
| Final integrated widget QA (U7/U8/U9 compose; U8 grid revert; U9 varied deck) | qa-final-widgets.md (+ qa-final-widgets-results.json) |
| Final static QA (U3/U4/U5/U6 + gallery; freeform-free copy) | qa-final-static.md (+ qa-final-static-results.json) |
| U9 deck QA (curated deck, cost tab, tabs, over-correction findings) | qa-u9.md (+ qa-u9-results.json; recomp: qa-u9-recomp.md) |
| Distinctiveness (are the seven concepts genuine paradigms?) | audit-distinctiveness.md |
| Robustness (hostile QA stress-test) | audit-robustness.md (+ robustness-results.json, robustness-recheck.json) |
| Data semantics (adversarial accounting + provenance) | audit-data-semantics.md |
| Accessibility (keyboard/ARIA + contrast) | audit-accessibility.md (+ audit-a11y-results.json, a11y-audit.mjs) |
| Motion & interaction | audit-motion.md (+ audit-motion-evidence.json / -evidence2.json) |
| A11y + motion re-audit (post-elevation) | audit-a11y-motion-recheck.md (+ audit-a11y-motion-recheck.json) |
| Contrast final cleanup (AA on the owned token set) | contrast-final-cleanup.md (+ contrast-final-probe-before.json / -after.json) |
| U8 freeform engine evidence — OBSOLETE (P14 RETRACTED; freeform removed per user direction) | u8-canvas-freeform.obsolete.mjs + u8-canvas-freeform-results.json (lineage only; the grid-revert is verified by u8-bento-harness.mjs / qa-final-widgets.md) |
| Gate outputs | results.json + report.md (base matrix 280/280), state-results.json (interactive states), data-unit.mjs (1003 assertions) |
