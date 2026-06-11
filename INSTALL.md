# Install PM Bootstrap Ledger Drop-In

Copy this package into the Puppet Master repo root.

If your local `AGENTS.md` is unchanged from the cleaned repo, you may use the included `AGENTS.md`. If your local `AGENTS.md` has changes, append `AGENTS.append.md` manually instead.

Then run:

```bash
python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260610-001-ledger-plan-system
python3 scripts/pm-plans-verify.py run-gates
python3 scripts/pm-shard-plans.py --check
```

Next recommended action:

```text
/goal
Compile PM ledger pldg-20260610-001-ledger-plan-system to canonical Plans docs.
...
```

Use `Plans/bootstrap/Codex_Prompts.md` for the exact prompts.

Boundary reminders:
- Conversational feature spec threads usually do not need Goal Mode.
- Ledger-to-Plans, Plan conversion, PlanUnit indexing, audits, and governance sealing are Goal Mode phases.
- The current package may generate a PlanUnit index and node-readiness report only. It must not create WorkNodes.
- Every design atom and PlanUnit must include `gui_related: true|false`, inferred by Codex.
