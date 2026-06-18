# Install the PRD Builder / Planning Wizard planning ledger

Ledger ID: `pldg-20260618-001-prd-planning-wizard`

## Overlay

Copy the contents of this package into the root of the latest Puppet Master repository. It adds one ledger directory and one installer script. It does not overwrite canonical Plans docs.

## Register

From the repository root:

```bash
python3 scripts/pm-install-prd-planning-wizard-ledger.py --dry-run
python3 scripts/pm-install-prd-planning-wizard-ledger.py
```

The installer is idempotent. It removes any prior registry entry with this exact ledger ID from all registry buckets and writes the supplied active entry under `active_ledgers`. It preserves every unrelated registry entry.

## Validate the ledger and unaffected generated state

```bash
python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
python3 scripts/pm-plan-index.py validate
python3 scripts/pm-shard-plans.py --check
git diff --check
```

Registering a new active ledger changes the governed `Plans/ledgers/v2/ledger_registry.json` hash. Therefore a full `pm-plans-verify.py run-gates` call is expected to report stale evidence/plan-graph hashes until the later explicit governance-seal phase refreshes them. Do not treat that expected pending-seal result as a ledger-validation failure.

## Continue or compile

For more discussion, paste:

`Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/prompts/resume_ledger.md`

To transfer the settled ledger to canonical Plans, start a new Codex Goal thread with:

`Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/prompts/compile_ledger_to_plans.md`

After compile, run the supplied PlanUnit-index, deep-audit, repair, and governance-seal prompts in that order as needed.

## Boundaries

- This package does not modify canonical Plans.
- It does not create PlanUnits, WorkNodes, NodeSeeds, WorkNodeRequests, WorkGraphs, queues, GoalRuns, implementation files, or build tasks.
- It does not update `.plan_index`, Spec Lock, shards, evidence, plan graph, or auto decisions.
- The installer changes only the ledger registry.
- The finished-product command **Approve And Build** is specified in the ledger but is not executed by this bootstrap package.
