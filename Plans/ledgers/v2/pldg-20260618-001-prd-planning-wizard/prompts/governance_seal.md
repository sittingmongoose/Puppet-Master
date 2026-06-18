/goal Seal governance after ledger/Plan/PlanUnit changes are stable.

Read AGENTS.md, current live Plans docs, Plans/Plan_Document_System.md, Plans/Planning_Ledger_System.md, Plans/Plan_To_Node_Compilation.md, Plans/.plan_index/, Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/, and Plans/.plan_migration/pds-20260611-002-atomize-planunits/ if present.

This is a governance-seal phase only.

Tasks:
1. Confirm ordinary Plan edits and PlanUnit index edits are stable.
2. Run safe pre-seal validators.
3. Regenerate configured Plans/_shards/** using repository scripts.
4. Refresh evidence bundles that hash changed Plans docs and Plans/.plan_index artifacts.
5. Refresh Plans/Spec_Lock.json only after docs, indexes, shards, and evidence are stable.
6. Refresh Plans/plan_graph.json only if required by existing governance.
7. Append/update Plans/auto_decisions.jsonl only as required by governance policy.
8. Reconcile this ledger's compiled/sealed state and registry entry only after live evidence and governance proof exist.
9. Run:
   python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits, if present
   python3 scripts/pm-plan-index.py validate
   python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
   python3 scripts/pm-plans-verify.py run-gates
   python3 scripts/pm-shard-plans.py --check
   python3 scripts/pm-plans-verify.py validate-auto-decisions
   python3 scripts/pm-plans-verify.py verify-spec-lock
   python3 scripts/pm-plans-verify.py validate-evidence
   git diff --check, if available

Hard rules:
- Do not change product prose except tiny governance-reference fixes required by validators.
- Do not create WorkNodes, NodeSeeds, NodeSeed candidates, WorkNodeRequests, WorkGraphs, executable queues, GoalRuns, final node manifests, implementation files, or production build tasks.
- Preserve node_readiness_report.status unless this Goal explicitly includes completing and enabling the runtime compiler contract, which it does not.
- No governance seal is valid while any unapproved stub, TODO, TBD, placeholder, empty required section, fake acceptance criterion, or deferred implementation detail remains.

Report changed files, validator results, governance status, ledger seal status, node-readiness status, and unresolved risks.
