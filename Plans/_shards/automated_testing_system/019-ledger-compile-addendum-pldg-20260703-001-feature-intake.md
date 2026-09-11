# Shard 019: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Automated_Testing_System.md`

Source lines: L1895-L2041

Source SHA256: `d0315a8fa74dc85add77991a73679eddd763692afb2e552b75fc073418f24acb`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### ATS-021 - P2-TRANSPORT-SOAK-TESTS

```yaml
plan_unit_id: ATS-021
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  P2-TRANSPORT-SOAK-TESTS (P2) is compiled as canonical Puppet Master intent for Add WS/SSE/terminal/browser/device transport soak tests: Sleep/wake, reconnect, first-event timeout, large terminal output, high-frequency browser snapshots, and WebSocket fallback are covered.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Sleep/wake, reconnect, first-event timeout, large terminal output, high-frequency browser snapshots, and WebSocket fallback are covered.
- Terminal retry fixtures assert exact session, invocation/block, and card identities for explicit same-session rerun, replacement execution, failed/retried attachment and movement reconciliation; recovery never replays a command or duplicates its invocation card. The oracle consumes ACD-108 and UCC-067.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Sleep/wake, reconnect, first-event timeout, large terminal output, high-frequency browser snapshots, and WebSocket fallback are covered.
risk_class: p2_terminal_runtime_coverage
reasoning_tier: standard
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: p2_transport_soak_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0001
- pldg-20260703-001-feature-intake:atom-0057
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0057
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0053/P2-TRANSPORT-SOAK-TESTS@line=53
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0053/P2-TRANSPORT-SOAK-TESTS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:17
source_atom_ids:
- atom-0057
external_atom_id: extrepo-20260703-0053
source_row_id: P2-TRANSPORT-SOAK-TESTS
priority: P2
finding_family: Add WS/SSE/terminal/browser/device transport soak tests
target_docs:
- Plans/Automated_Testing_System.md
owner_hints:
- Plans/Automated_Testing_System.md
preserved_exact_tokens:
- extrepo-20260703-0053
- P2-TRANSPORT-SOAK-TESTS
- P2
- Add WS/SSE/terminal/browser/device transport soak tests
negative_constraints: []
proposal_or_recommendation: Sleep/wake, reconnect, first-event timeout, large terminal output, high-frequency browser snapshots, and WebSocket fallback are covered.
compile_disposition: create_new_planunit
```

### ATS-022 - P1-TERMINAL-FUZZ-TRIPWIRE-CORPUS

```yaml
plan_unit_id: ATS-022
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  P1-TERMINAL-FUZZ-TRIPWIRE-CORPUS (P1) is compiled as canonical Puppet Master intent for Terminal parser/rendering fuzzing, replay corpora, error injection, and giant-output recordings: Imported external-repo finding extrepo-20260703-0082 / P1-TERMINAL-FUZZ-TRIPWIRE-CORPUS (P1). The preserved PM gap/delta is: Terminal Protocol Matrix covers cases to support, but needs a permanent terminal replay/fuzz/error-injection corpus and receipts. The observed external-repo signal remains source-lineage evidence: Ghostty 1.3.0 reports AFL++ fuzzing of the terminal escape parser/VT stream processor, terminal recordings over 4GB, renderer lock improvements, and Tripwire error-injection testing. | tmux issue surface still shows TUI rendering/layout/crash regressions in panes.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Plans/terminal_command_block_contract_fixtures.json is the named synthetic value/migration corpus checked by scripts/pm-terminal-command-block-contracts.py against the registered terminal_command_block family, preserving exact legacy shape and reusing the existing storage recovery schema/validator.
- Reject command_completion with running lifecycle, committed journal source or target endpoints differing from graph/receipt even when all rows are target-version, and missing or wrong-session marker transcript targets; retain session-end, unknown-exit, heuristic-grouping-plus-authoritative-completion and later-backing-loss positives.
- Synthetic JSON byte custody and protected-backup/admission/lock/reopen/readback witnesses establish only local schema/semantic acceptance; production MessagePack conversion, graph/ceiling admission, durable recovery/security, native runtime and UI obligations remain unexecuted.
- For selected ConPTY hosts, host-lifecycle fixtures consume SMPFS-070 and inject failure at channel creation, pseudoconsole creation, attribute preparation, and child launch/attachment; verify disposition of each acquired resource and exact-session failed_to_start; any cleanup failure is diagnosed and no abandoned state is silently orphaned or reused.
- Host fixtures exercise sustained concurrent input/output, full output buffers during shutdown, close during startup, and final output; blocking I/O on either channel must not prevent host service of the other, without requiring client data production or consumption. Record the tested host/API version and distinguish close initiation, API return, observed process exit, and output-channel closure; verify required channel servicing and SMPFS-023 output accounting without delaying or invalidating known completion for partial output.
- Verify presentation-only hide/detach/reattach does not terminate the host; resource cleanup does not imply rollback of external effects. Exercise cursor-query servicing during startup and close only if enabled. Report simulated host-failure injection and native-host acceptance separately; parser replay alone does not establish OS lifecycle correctness.
- PM stores minimized terminal replay fixtures for parser bugs, shell markers, giant outputs, unicode/graphemes, bracketed paste, OSC, tmux/zellij/ssh panes, and CLI agents.
- Terminal parser has fuzz tests, chunk-splitting tests, and replay snapshots that compare parse tree, accessible mirror, scrollback, and painted viewport.
- Renderer/scrollback locks are budgeted; oversized recordings degrade with receipts instead of freezing UI.
- Terminal output extraction fixtures consume SMPFS-023 and SP-125 and compare exact text plus availability/finality for known-empty, live complete-so-far, final complete, partially backed and unavailable output. Include mid-row boundaries, intentional whitespace, no final newline, grapheme/wide text, uncertain writers and pruning during a read.
- Mutation fixtures retain endpoint locations while invalidating interior backing, exercise erasure and alternate-screen replacement, and prove that ordinary reflow and unaffected retained ranges still preserve selection. Losing backing does not rewrite a known command completion outcome.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-terminal-command-block-contracts.py
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- PM stores minimized terminal replay fixtures for parser bugs, shell markers, giant outputs, unicode/graphemes, bracketed paste, OSC, tmux/zellij/ssh panes, and CLI agents.
- Terminal parser has fuzz tests, chunk-splitting tests, and replay snapshots that compare parse tree, accessible mirror, scrollback, and painted viewport.
- Renderer/scrollback locks are budgeted; oversized recordings degrade with receipts instead of freezing UI.
risk_class: p1_terminal_runtime_hardening
reasoning_tier: standard
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: p1_terminal_fuzz_tripwire_corpus
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/ledgers/v2/pldg-20260908-002-terminal-workflow-findings/records/design_atoms.jsonl:atom-0002
- Plans/ledgers/v2/pldg-20260908-002-terminal-workflow-findings/records/design_atoms.jsonl:atom-0001
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0002
- pldg-20260703-001-feature-intake:atom-0086
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0086
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0082/P1-TERMINAL-FUZZ-TRIPWIRE-CORPUS@line=82
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0082/P1-TERMINAL-FUZZ-TRIPWIRE-CORPUS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:9
source_atom_ids:
- atom-0086
external_atom_id: extrepo-20260703-0082
source_row_id: P1-TERMINAL-FUZZ-TRIPWIRE-CORPUS
priority: P1
finding_family: Terminal parser/rendering fuzzing, replay corpora, error injection, and giant-output recordings
target_docs:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Automated_Testing_System.md
- Runtime_Artifacts_Panel.md
- Contracts_V0.md
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Automated_Testing_System.md
- Runtime_Artifacts_Panel.md
- Contracts_V0.md
preserved_exact_tokens:
- extrepo-20260703-0082
- P1-TERMINAL-FUZZ-TRIPWIRE-CORPUS
- P1
- Terminal parser/rendering fuzzing, replay corpora, error injection, and giant-output recordings
negative_constraints: []
observed_signal: Ghostty 1.3.0 reports AFL++ fuzzing of the terminal escape parser/VT stream processor, terminal recordings over 4GB, renderer lock improvements, and Tripwire error-injection testing. | tmux issue surface still shows TUI rendering/layout/crash regressions in panes.
pm_gap_or_delta: Terminal Protocol Matrix covers cases to support, but needs a permanent terminal replay/fuzz/error-injection corpus and receipts.
relationship_to_prior_reports: Adds test strategy to prior terminal requirements.
compile_disposition: create_new_planunit
```
