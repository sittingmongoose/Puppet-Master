# Start Here — Codex Ledger Import

Import this external-repo research packet into the active/new Puppet Master ledger.

Read all attached files, especially:
- `01_FULL_SOURCE_PACKET.md`
- `02_LEDGER_READY_ATOMS.jsonl`
- `03_MASTER_BACKLOG_TABLE.csv`
- `04_EVIDENCE_REGISTRY.json`
- `05_IMPORT_COMPLETENESS_CHECKLIST.md`
- `06_SOURCE_MANIFEST.json`

Objective: create/update ledger records only. Do not compile to Plans, create PlanUnits, NodeSeeds, WorkNodes, implementation tasks, queues, manifests, or governance seal artifacts unless I explicitly request that later.

Every row in `02_LEDGER_READY_ATOMS.jsonl` must become a ledger obligation/design atom or be explicitly dispositioned. Preserve these fields exactly: source_row_id, priority, title, finding_family, source_repos, observed_signal, pm_current_coverage, pm_gap_or_delta, proposal_or_recommendation, target_docs, acceptance_tests_or_validation_surface, relationship_to_prior_reports, and raw_row.

Scope covered: OpenCode v1/dev/beta, OpenCode v2 specs, Cline, Agent Zero, Pi, OpenAI Codex, Ghostty, Warp, and tmux. Preserve the PM product constraint: PM is GUI-first and is not building a CLI; terminal/CLI lessons translate into GUI-native terminal/runtime/provider/tool/context/agent-control contracts.

Do not summarize away details. Keep every P0/P1/P2 ID traceable. Keep full source refs back to the attached files. Use `05_IMPORT_COMPLETENESS_CHECKLIST.md` as the closure gate. Before claiming completion, report total atom rows, rows imported, rows dispositioned, ledger records written, open blockers, open decisions, and the next safe action.
