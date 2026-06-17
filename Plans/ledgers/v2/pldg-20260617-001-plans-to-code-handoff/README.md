# Plans-to-Code Handoff, Plan Compile, Execution, Testing, and Completion Contracts

Ledger ID: `pldg-20260617-001-plans-to-code-handoff`

This is a v2 Bootstrap Planning Ledger ready for explicit Codex Goal compilation into canonical Plans docs. It records the Plans-to-code handoff design decisions from the June 17, 2026 planning conversation.

## Status

- `phase`: `ready_for_plan_compile`
- `plan_compile_runtime_status`: `design_only_disabled`
- No open questions.
- No open blockers.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, production build tasks, or dispatched GoalRuns are included or authorized.

## Use

1. Drop this package into the repo root.
2. Run:

```bash
python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260617-001-plans-to-code-handoff
```

3. Start Codex with `prompts/compile_ledger_to_plans.md`.
4. After Plans are updated, run `prompts/codex_after_plans_updated.md`.

## Key rule

This ledger is source/planning memory. It is not canonical Plans prose until Codex explicitly compiles it into Plans docs and validators pass.
