# AGENTS.md — Puppet Master

## Project context
Puppet Master is being rebuilt from scratch from the canonical `Plans/` specification. The old Rust/Iced app was removed. The intended implementation direction is Rust + Slint.

## Source of truth
- Read `Plans/00-plans-index.md` first.
- Treat `Plans/**` as canonical.
- Treat `Plans/ledgers/**` as source/source-lineage memory only, not canonical product prose.
- P6/deferred ledgers, including Personas, stay locked unless the prompt explicitly unlocks them.

## Governance artifacts
- `Plans/Spec_Lock.json`, `Plans/auto_decisions.jsonl`, `Plans/_shards/**`, and `Plans/.evidence/**` are build-governance artifacts.
- Do not hand-edit generated shards/evidence. Regenerate them with the repo scripts when a governance task explicitly allows it.

## Verification
Use `python3 scripts/pm-plans-verify.py run-gates` for the standard plan-governance check. Use `python3 scripts/pm-shard-plans.py --check` for shard body/path verification.

## Safety
Do not add secrets or local machine state. Do not recreate the removed legacy Iced app unless explicitly asked.
