# Shard 012: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L8181-L8267

Source SHA256: `c2e3721e4910120edde397fa014b807831c57621b234f0e81472ee4c5ad4e4fb`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### SMPFS-124 - P0-TERMINAL-PROTOCOL-MATRIX

```yaml
plan_unit_id: SMPFS-124
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  P0-TERMINAL-PROTOCOL-MATRIX (P0) is compiled as canonical Puppet Master intent for Built-in GUI terminal protocol coverage: Add PlanUnits under Section15 or a new Built_In_Terminal_Runtime.md that enumerate VT/xterm/OSC protocol fixtures and acceptance tests. Treat protocols as data fixtures with replayable byte streams, not prose-only requirements. The preserved PM gap/delta is: No explicit terminal protocol test matrix for OSC 52, OSC 8, OSC 9;4, OSC 133, OSC 633, bracketed paste, focus events, SGR/UTF-8 mouse, DEC synchronized updates, pasteboard priority, or terminal-feature negotiation. The observed external-repo signal remains source-lineage evidence: Ghostty/tmux current issues and releases revolve around OSC 133 shell integration, pasteboard semantics, mouse/key handling, Unicode/ZWJ crashes, and platform-specific regressions; Warp changelog shows alt-screen CLI-agent contrast, dropped keystrokes, zero-width crash, WSL PWD restore, session reopening, MCP spawn cwd, and settings/autonomy
  fixes.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- VT replay corpus includes OSC 52/8/9;4/133/633, bracketed paste, focus, mouse, alternate screen, synchronized update sequences.
- Parser output is deterministic across macOS/Linux/Windows/WSL fixtures.
- Weak/unknown protocol support downgrades requested-vs-effective state rather than fabricating command blocks.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- VT replay corpus includes OSC 52/8/9;4/133/633, bracketed paste, focus, mouse, alternate screen, synchronized update sequences.
- Parser output is deterministic across macOS/Linux/Windows/WSL fixtures.
- Weak/unknown protocol support downgrades requested-vs-effective state rather than fabricating command blocks.
risk_class: p0_terminal_runtime_hardening
reasoning_tier: high
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: p0_terminal_protocol_matrix
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0005
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0005
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0001/P0-TERMINAL-PROTOCOL-MATRIX@line=1
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0001/P0-TERMINAL-PROTOCOL-MATRIX
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:1
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0005
external_atom_id: extrepo-20260703-0001
source_row_id: P0-TERMINAL-PROTOCOL-MATRIX
priority: P0
finding_family: Built-in GUI terminal protocol coverage
source_repos:
- ghostty-org/ghostty
- tmux/tmux
- warpdotdev/warp
target_docs:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
- Plans/Automated_Testing_System.md
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
- Plans/Automated_Testing_System.md
preserved_exact_tokens:
- extrepo-20260703-0001
- P0-TERMINAL-PROTOCOL-MATRIX
- P0
- Built-in GUI terminal protocol coverage
- ghostty-org/ghostty
- tmux/tmux
- warpdotdev/warp
negative_constraints: []
observed_signal: Ghostty/tmux current issues and releases revolve around OSC 133 shell integration, pasteboard semantics, mouse/key handling, Unicode/ZWJ crashes, and platform-specific regressions; Warp changelog shows alt-screen CLI-agent contrast, dropped keystrokes, zero-width crash, WSL PWD restore, session reopening, MCP spawn cwd, and settings/autonomy fixes.
pm_current_coverage: PM Section15 has strong identity/lifecycle/interaction model, shell-integration tiers, cross-platform matrix, and parser-engine gates.
pm_gap_or_delta: No explicit terminal protocol test matrix for OSC 52, OSC 8, OSC 9;4, OSC 133, OSC 633, bracketed paste, focus events, SGR/UTF-8 mouse, DEC synchronized updates, pasteboard priority, or terminal-feature negotiation.
proposal_or_recommendation: Add PlanUnits under Section15 or a new Built_In_Terminal_Runtime.md that enumerate VT/xterm/OSC protocol fixtures and acceptance tests. Treat protocols as data fixtures with replayable byte streams, not prose-only requirements.
compile_disposition: create_new_planunit
```
