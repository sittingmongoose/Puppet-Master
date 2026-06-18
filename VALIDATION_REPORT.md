# Validation report

The drop-in ledger was tested against `Puppet-Master-main-final-corrected.zip`.

## Passed

- Baseline repository `pm-plans-verify.py run-gates`
- Installer dry run
- First registry installation
- Idempotent second installation
- `pm-bootstrap-ledger-validate.py` for `pldg-20260618-001-prd-planning-wizard`
  - 168 design atoms
  - 30 accepted decisions
  - 15 accepted corrections
  - 17 events
  - 0 questions
  - 0 compile-queue items
  - 0 warnings
- JSON/JSONL parsing
- `pm-plan-index.py validate`
  - 5,105 PlanUnits
  - 18,237 acceptance units
  - coverage `pass`
  - node readiness `runtime_disabled`
- Existing Plan migration validation
- Configured shard check
  - 52 source docs
  - 936 shards

## Expected pending-seal condition

After the installer registers the active ledger, full governance gates report that existing evidence and plan-graph records contain the prior hash of `Plans/ledgers/v2/ledger_registry.json`.

That is expected because registration changes a governed file. The ledger-to-Plans compile remains safe to run. The supplied governance-seal prompt refreshes the affected governance artifacts after canonical Plans and `.plan_index` outputs are stable.

## Non-mutation result

The package itself contains no canonical Plans edits, generated Plan index changes, governance refreshes, WorkNodes, NodeSeeds, WorkNodeRequests, WorkGraphs, GoalRuns, executable queues, implementation files, or production build tasks.
