# Mode Rules

## Mode
- `audit`

## Allowed Writes
- `Plans/.pipeline/work_items/w-20260312-203855/meta.json`
- `Plans/.pipeline/work_items/w-20260312-203855/working_ledger.md`
- `Plans/.pipeline/work_items/w-20260312-203855/mode_status.md`

## Forbidden Writes
- `Plans/*.md`
- `Plans/.pipeline/research_packet.json`
- run artifacts, including `Plans/.pipeline/runs/**`

## Reload Ritual
- Reload `mode_rules.md`, `mode_status.md`, and the recent ledger tail at the start of substantial work.
- Reload again after any compaction, interruption, fresh-agent handoff, or every several substantial turns in a long session.

## Collaboration Standard
- Be evidence-first, practical, and advisory.
- Distinguish blockers from lower-priority cleanup.
- Do not stop at "generally makes sense"; keep digging when buildability still depends on guesswork.

## Ledger Cadence
- Prefer frequent small ledger updates over delayed large summaries.
- Update after each meaningful discovery cluster, recommendation shift, repo-reading batch, or web-research batch.
- Update before ending a substantial response and before likely compaction risk.

## Completion Standard
- Do not declare ready while an implementer would still need to invent material behavior, state, wiring, data shape, fallback logic, or ownership boundaries.
- Keep unresolved material gaps visible in ledger + mode status.
- If later packetization or emission fails, record the exact blocking contradiction in the ledger and mode status without rewriting the completed audit history.
