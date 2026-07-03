# PM External Repo Ledger Import Bundle

Generated: 2026-07-03T19:18:18Z

This bundle wraps all external repo review passes into a Codex-ready import packet for a new Puppet Master ledger.

## Upload strategy

Best option: upload the ZIP `pm_external_repo_ledger_import_bundle_2026-07-03.zip` to Codex if it can inspect ZIP contents.

Safer option: drag these six files directly into the Codex chat window:

1. `00_CODEX_LEDGER_IMPORT_PROMPT.md`
2. `01_FULL_SOURCE_PACKET.md`
3. `02_LEDGER_READY_ATOMS.jsonl`
4. `03_MASTER_BACKLOG_TABLE.csv`
5. `04_EVIDENCE_REGISTRY.json`
6. `05_IMPORT_COMPLETENESS_CHECKLIST.md`
7. `06_SOURCE_MANIFEST.json`

If Codex has trouble with a large markdown file, upload the `raw_source_artifacts/` files separately as supporting sources. The JSONL atom file is the minimum machine-readable checklist, but the markdown packet preserves the full report language and context.

## What is inside

- Full raw narrative reports from every pass.
- Normalized ledger-ready atom records from every backlog row.
- The OpenCode-specific plan-change matrix converted into ledger atoms.
- Evidence matrices from the earlier repo passes.
- Raw source artifacts copied with hashes.
- A Codex import prompt and completion checklist.

## Counts

- Ledger-ready atom rows: 113
- Priority counts: {"P0": 50, "P1": 49, "P2": 14}
- Source artifacts: 23

## Important instruction

Do not let the Codex agent summarize this down to a few bullets. It must import every JSONL atom row or explicitly disposition it, while preserving raw report source references.
