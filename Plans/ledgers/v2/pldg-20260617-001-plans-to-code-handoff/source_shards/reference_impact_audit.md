# Reference Impact Audit — Plans-to-Code Handoff Ledger

This shard records the additional user requirement that the ledger be implementation-ready once converted to Plans and account for any Plans docs that reference touched concepts.

## Reconciled status

The compile is complete and governance-sealed. The latest clean audit is `Plans/.audits/audit-20260618-002-plans-to-code-final-docs-repair-certification/FINAL_REPORT.md`, with owner routing, doc-impact refs, implementation readiness, schema contract checks, closure registry validation, forbidden-artifact checks, and validators passing. Future use of this shard is audit/repair guidance only; it does not authorize PlanCompile, WorkNodes, NodeSeeds, executable queues, runtime dispatch, implementation files, dispatched GoalRuns, or production build tasks.

## Required behavior for Codex compile

Codex must not only update primary owner docs. For every touched concept, it must determine:

- primary owner docs;
- direct consumer docs;
- reference/index/UI/wiring docs;
- exact search terms to check;
- whether each reference must be updated, intentionally left unchanged, or deferred to a later redesign phase.

This is especially important for:

- PlanCompile / Plan Compile / PlanUnit / NodeSeed / WorkNode request / WorkGraph draft;
- Plan Wizard terminology and old wizard references;
- Overseer Model, Auditor Model, Auditor audit-to-repair loop until certified or critical block, Auditor invariant loop, auditor_cycle_report, GUI / Frontend Worker Model, High-Effort Worker Model, no Executor Model, old Pass 1 / Pass 2 / Pass 3 names as compatibility aliases only;
- seven-tab Orchestrator shell references: Progress, Plan Compile, Seams, Node Graph, Evidence, History, Ledger; Tiers/six-tab wording is compatibility/source-lineage only;
- automated testing, test capability discovery, browser/device/GUI evidence, Slint as example only, Puppet Master browser as native web testing path;
- worktrees, safe points, snapshots, rollback, GitHub promotion, FileSafe;
- HITL, autonomy, loop breakers, failure signatures, PlanChangeDetected, security/external effects;
- receipts, runtime artifacts, and final code-completion certification.

## Boundary

Broad old-wizard rename remains part of the Plan Wizard redesign unless the ledger-to-Plans compile directly touches a section and would otherwise leave a contradiction. New content must use Plan Wizard terminology.

## Reference scan expectation

After editing Plans docs, Codex should run an equivalent of:

```bash
rg -n "PlanCompile|Plan Compile|PlanUnit|NodeSeed|WorkNode request|WorkNodeRequest|WorkGraph draft|Plan Wizard|Chain Wizard|validation pass|Pass 1|Pass 2|Pass 3|Overseer Model|Auditor Model|audit-to-repair|Auditor invariant loop|auditor_cycle_report|critical block|Executor Model|GUI / Frontend Worker Model|High-Effort Worker Model|model resolution receipt|test capability discovery|test_strategy|browser automation|emulator|Slint|Playwright|safe point|snapshot|rollback|worktree|GitHub|HITL|manual decision|GoalCompletionReceipt|source-control receipt|seven-tab|six-tab|Tiers" Plans --glob '*.md'
```

Then it must update direct references or record no-update/deferred evidence. Completion requires reference scan results in the final report.
