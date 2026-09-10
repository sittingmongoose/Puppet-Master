# AGENTS.md — Puppet Master

## Project context
Puppet Master is being rebuilt from scratch from the canonical `Plans/` specification. The old Rust/Iced app was removed. The intended implementation direction is Rust + Slint.

## Source of truth
- Read `Plans/00-plans-index.md` first.
- Treat `Plans/**` as canonical.
- Treat `Plans/ledgers/**` as source/source-lineage memory only, not canonical product prose.

## Governance artifacts
- `Plans/Spec_Lock.json`, `Plans/auto_decisions.jsonl`, `Plans/_shards/**`, and `Plans/.evidence/**` are build-governance artifacts.
- Do not hand-edit generated shards/evidence. Regenerate them with the repo scripts when a governance task explicitly allows it.

## Verification
Use `python3 scripts/pm-plans-verify.py run-gates` for the standard plan-governance check. Use `python3 scripts/pm-shard-plans.py --check` for shard body/path verification.

## Safety
Do not add secrets or local machine state. Do not recreate the removed legacy Iced app unless explicitly asked.


## PM Bootstrap Planning Ledger and PlanUnit workflow
Use this workflow when Jared asks to start, continue, spec, design, compile, standardize, index, audit, or seal through the PM ledger system.

Trigger phrases:
- "Use the PM Bootstrap Planning Ledger"
- "Start a PM ledger"
- "Continue ledger <ledger_id>"
- "Compile ledger <ledger_id> to Plans"
- "Convert Plans to the standard format"
- "Generate PlanUnit index"
- "Generate node-readiness report"
- "Seal governance"

Ledger locations and authority:
- New structured bootstrap ledgers live under `Plans/ledgers/v2/<ledger_id>/`.
- `Plans/ledgers/v2/ledger_registry.json` is the registry for active, paused, compiled, and sealed ledgers.
- Legacy `working_ledger.md` files and `Plans/ledgers/work_items/**` are preserved source-lineage only. Do not use them as the active v2 ledger format unless explicitly running migration/audit.
- The ledger is planning/source memory, not assistant memory, not Plan Mode, and not canonical product prose. Canonical product/build truth remains live non-pipeline `Plans/**` docs.

Normal conversational feature-spec flow:
1. Create or resume a v2 ledger.
2. Read only `state/handoff.json`, `state/current.json`, `state/open_items.json`, and `state/operating_capsule.json` by default.
3. Do not read full `events.jsonl` or source shards unless the state files point to a specific source_ref that needs inspection.
4. After every substantive turn, append/update ledger records and rewrite current-state projections.
5. Preserve exact tokens, negative constraints, examples, owner hints, compatibility-only notes, stale/retired concepts, and user corrections.
6. Automatically classify every design atom as `gui_related: true|false`. The user does not need to label GUI work.
7. Do not write canonical Plans until Jared explicitly asks to compile the ledger.

Compilation flow:
- Compile accepted design atoms into stable PlanUnits in the appropriate owner docs.
- Every PlanUnit must carry `gui_related: true|false`; infer it from the content.
- Mark `gui_related=true` for GUI/UI/screens/pages/panels/forms/layout/styling/components/icons/SVGs/images/screenshots/user-visible visual presentation.
- Preserve source refs from ledger atoms to PlanUnits.
- Plan docs are not work-node manifests. PlanUnits expose dependency, risk, validation, `gui_related`, and node-readiness metadata.
- The current index phase may produce a PlanUnit index and node-readiness report only. Do not create WorkNodes or executable build tasks until the WorkNode compiler contract exists.
- If owner placement is ambiguous, record candidate owners and adjudication evidence; do not ask row-by-row unless a true product decision is required.

Spec Lock and governance:
- Do not update `Plans/Spec_Lock.json`, generated shards, evidence bundles, plan graph, or governance locks during ordinary ledger writing, plan drafting, plan conversion, or PlanUnit indexing.
- Refresh governance artifacts only in an explicit governance seal phase after canonical docs and generated indexes stop changing.

Use the repo skill `$pm-bootstrap-planning-ledger` when available. If skills are unavailable, follow `Plans/bootstrap/Bootstrap_Planning_Workflow.md` and the prompts in `Plans/bootstrap/Codex_Prompts.md`.

## Where things go (layout since 2026-09-10)
- This repository holds product canon and its governance only: `Plans/**` (owner docs, registries, schemas, fixtures, ledgers, `_shards`, `.plan_index`, `.evidence`, and in `.plan_migration` only runs 001, 002 and the current run), `Concepts/**` (every HTML concept; never prune or dedupe them), `scripts/**`, compact result bundles under `reports/**`, and `tests/fixtures/**` plus the named test files.
- Raw evidence lives outside git in `/mnt/Cursor/PuppetMaster-Evidence/`: experiment captures (`tests/agent_packet_restrictions` is an ignored symlink into it so the raw-capture gate resolves), superseded migration runs, and root scratch. Cite evidence by path plus SHA-256. Never commit raw captures, run workspaces or scratch here.
- Experiment code and campaign runtime live in `/mnt/Cursor/PM-Experiments/`, `/mnt/Cursor/PuppetMaster-AssuranceLab/` and `~/PM-Experiments/`.
- Research and audit tasks work in their own git worktree under `/mnt/Cursor/PuppetMaster-research/<topic>-<date>` on a branch cut from a snapshot of `main`, and land on `main` with a currentness check. Never edit the shared checkout from such a task.
- Commit only the paths you changed, with a message that says what they are; never sweep. Editing a Plans document means regenerating `Plans/_shards` and `Plans/.plan_index` for it; regeneration is deterministic, so only the edited document's files change. Governance reseals are done only by the designated Plans agent.
