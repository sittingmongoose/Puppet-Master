# Puppet Master — Claude Instructions (PLANNING PHASE)

Follow the repo-root `AGENTS.md`.

## Scope
- Edit `Plans/**` only (plus agent-rule files if explicitly requested).
- No application code changes until rewrite execution begins.

## Plans rules (SSOT)
When adding/modifying requirements in `Plans/`:
- Follow `Plans/DRY_Rules.md`
- Add/maintain `ContractRef:` immediately after the affected block
- No open questions; use `Plans/auto_decisions.jsonl` per `Plans/Decision_Policy.md`

## Hygiene
- No secrets/tokens.
- Keep edits small and reviewable.
- Update `Plans/00-plans-index.md` if you add/rename plan documents.

## Completion marker
End with exactly one:
- `<status>COMPLETE</status>`
- `<status>BLOCKED</status>`