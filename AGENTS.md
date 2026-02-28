# AGENTS.md — Puppet Master (PLANNING PHASE)

This file is intentionally minimal.
It defines only: scope, non-negotiable constraints, and the SSOT paths for **Plans** work.

## Current phase scope (STRICT)
- **Allowed edits:** `Plans/**` plus these rule files when explicitly requested:
  - `AGENTS.md`
  - `.cursorrules`
  - `.claude/**`
  - `.cursor/**`
- **Disallowed edits (until rewrite execution begins):**
  - Any application code (e.g. `puppet-master-rs/**`), build scripts, or runtime configs.

## Plans governance (SSOT-first)
When editing anything in `Plans/`, follow these files and do not duplicate their content:
- `Plans/DRY_Rules.md` (DRY/SSOT + ContractRef rules)
- `Plans/Contracts_V0.md` (canonical contracts)
- `Plans/Decision_Policy.md` + `Plans/auto_decisions.jsonl` (deterministic defaults + recorded decisions)
- `Plans/Spec_Lock.json` + `Plans/Crosswalk.md` (global precedence & traceability)
- `Plans/00-plans-index.md` (authoritative navigation map)

## Normative requirement rule (ContractRef)
If you add or modify a normative requirement in `Plans/` (e.g. MUST/REQUIRED/SHALL):
- Ensure the corresponding `ContractRef:` is present **immediately after that block** (block-level strict).
- If a needed contract does not exist, add it to `Plans/Contracts_V0.md` and reference it (then update `Plans/Crosswalk.md` / `Plans/Spec_Lock.json` if required by DRY rules).

## Secrets & auth (no drift)
- Do not add secrets/tokens to the repo.
- Auth/key policy must follow `Plans/rewrite-tie-in-memo.md` (do not restate policy here).

## Working style for Plans
- No stubs. No placeholders. No “Open Questions” sections—log a decision and proceed deterministically.
- Keep edits localized and update `Plans/00-plans-index.md` when adding/renaming plan docs.

## Output status markers
End with exactly one marker:
- `<status>COMPLETE</status>`
- `<status>BLOCKED</status>` (include what you tried + the smallest next unblock step)

If you edit a Plans/*.md that has Plans/_shards/<doc>/, you MUST run python3 scripts/pm-shard-plans.py --generate and python3 scripts/pm-shard-plans.py --check before finishing.

python3 scripts/pm-plans-verify.py run-gates is required and fails if plan shards are stale.