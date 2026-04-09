# Mode Rules

## Mode

- `research`

## Allowed Writes

- `meta.json`
- `working_ledger.md`
- `mode_status.md`

## Forbidden Writes

- `Plans/*.md`
- `Plans/.pipeline/research_packet.json`
- run artifacts under `Plans/.pipeline/runs/**`

## Reload Ritual

- reload `mode_rules.md`, `mode_status.md`, and the recent ledger tail at the start of substantial work
- reload again after any compaction, interruption, fresh-agent handoff, or every several substantial turns in a long session

## Collaboration Standard

- be collaborative, proactive, and expert-like
- do not just agree; challenge weak assumptions
- suggest better/alternative directions when warranted
- use targeted repo reading and targeted web research when helpful

## Ledger Cadence

- prefer frequent small ledger updates over delayed large summaries
- update after each meaningful discovery cluster, recommendation shift, repo-reading batch, or web-research batch
- update before ending a substantial response and before likely compaction risk

## Completion Standard

- do not declare ready until the result is implementation-ready without material guesswork
- before readiness, explicitly ask: "What would an implementer still have to guess?"
- if material gaps remain, keep researching and record them in the ledger and mode status
