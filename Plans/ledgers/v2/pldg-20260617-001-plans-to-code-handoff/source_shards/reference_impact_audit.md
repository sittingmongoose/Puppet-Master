# Reference Impact Audit — Plans-to-Code Handoff Ledger

This shard records the additional user requirement that the ledger be implementation-ready once converted to Plans and account for any Plans docs that reference touched concepts.

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
- Overseer Model, Auditor Model, GUI / Frontend Worker Model, High-Effort Worker Model, no Executor Model;
- automated testing, test capability discovery, browser/device/GUI evidence, Slint as example only, Puppet Master browser as native web testing path;
- worktrees, safe points, snapshots, rollback, GitHub promotion, FileSafe;
- HITL, autonomy, loop breakers, failure signatures, PlanChangeDetected, security/external effects;
- receipts, runtime artifacts, and final code-completion certification.

## Boundary

Broad old-wizard rename remains part of the Plan Wizard redesign unless the ledger-to-Plans compile directly touches a section and would otherwise leave a contradiction. New content must use Plan Wizard terminology.

## Reference scan expectation

After editing Plans docs, Codex should run an equivalent of:

```bash
rg -n "PlanCompile|Plan Compile|PlanUnit|NodeSeed|WorkNode request|WorkNodeRequest|WorkGraph draft|Plan Wizard|Chain Wizard|validation pass|Overseer Model|Auditor Model|Executor Model|GUI / Frontend Worker Model|High-Effort Worker Model|model resolution receipt|test capability discovery|test_strategy|browser automation|emulator|Slint|Playwright|safe point|snapshot|rollback|worktree|GitHub|HITL|manual decision|GoalCompletionReceipt|source-control receipt" Plans --glob '*.md'
```

Then it must update direct references or record no-update/deferred evidence. Completion requires reference scan results in the final report.
