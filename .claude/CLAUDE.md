# CLAUDE.md — Puppet Master (PLANNING PHASE)

## Scope (STRICT)
- Allowed edits: `Plans/**`, `Concepts/**`, `Concepts/chat-assistant-concepts/**`, `Concepts/settings-redesign-concepts/Opus 5/**`
- Allowed when explicitly requested: `AGENTS.md`, `.cursorrules`, `.claude/**`, `.cursor/**`
- Disallowed: application code (e.g. `puppet-master-rs/**`), installers, runtime configs

## Where things go (layout since 2026-09-10)
- Product canon only lives here: `Plans/**` (including `_shards`, `.plan_index`, `.evidence`, ledgers, and only migration runs 001, 002 and the current one), `Concepts/**` (every HTML concept; never prune), `scripts/**`, compact `reports/**` bundles, `tests/fixtures/**` and the named test files.
- Raw evidence goes to `/mnt/Cursor/PuppetMaster-Evidence/` (captures, superseded migration runs, scratch), cited by path plus SHA-256. `tests/agent_packet_restrictions` is an ignored symlink into it. Never commit raw captures or scratch here.
- Experiment code and campaign runtime: `/mnt/Cursor/PM-Experiments/`, `/mnt/Cursor/PuppetMaster-AssuranceLab/`, `~/PM-Experiments/`.
- Research and audit tasks use a worktree under `/mnt/Cursor/PuppetMaster-research/<topic>-<date>` on a branch from a snapshot of `main`; land with a currentness check; never edit the shared checkout from such a task.
- Commit only the paths you changed; never sweep. Editing a Plans doc means regenerating its `_shards` and `.plan_index` entries (deterministic). Reseals only by the designated Plans agent.

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
