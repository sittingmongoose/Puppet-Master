# AGENTS.md — Puppet Master (PLANNING PHASE)

## Scope (STRICT)
- Allowed edits: `Plans/**`
- Allowed when explicitly requested: `AGENTS.md`, `.cursorrules`, `.claude/**`, `.cursor/**`
- Disallowed: application code (e.g. `puppet-master-rs/**`), installers, runtime configs

## Do not hand-edit derived artifacts
- Do not edit: `Plans/_shards/**`
- Do not edit: `Plans/.evidence/**`

## Do not edit these unless your prompt explicitly tells you to
- `Plans/Spec_Lock.json`
- `Plans/auto_decisions.jsonl`

## Pipeline commands (only when your prompt instructs you to run maintenance/verification)
- Shards:
  - `python3 scripts/pm-shard-plans.py --generate`
  - `python3 scripts/pm-shard-plans.py --check`
- Gates:
  - `python3 scripts/pm-plans-verify.py run-gates`

## Safety
- Never add secrets/tokens.

## Finish marker
End with exactly one:
- `<status>COMPLETE</status>`
- `<status>BLOCKED</status>`