# Shard 010: PlanUnits

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L808-L978

Source SHA256: `8ae652cad15d3b8183532cfe5df3b3b36c9f904eff957a4c91632a038ad1cacf`

---

## PlanUnits

### SMPFS-001 - Section 15 Promoted Features Spec Source-Preserving PlanUnit

```yaml
plan_unit_id: SMPFS-001
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Plans/Section15_MVP_Promoted_Features_Spec.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- Section 15 Promoted Features Spec
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Comma'
- 0. Scope and SSOT status
- 1. Canonical shell and surface model
- 1.1 Shell ownership
- 1.2 Persistent shell surfaces
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
- 1.3 Browser surface classes
- 1.3A Research session alignment
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md'
- Action tiers
- 1.4 Thread and session navigation
- 1.5 Thread usage surface
- 1.5.1 Assistant worktree integration
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/UI_Command_Catalog.md'
- 1.6 Dev-loop and terminal surface model
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
- Terminal section, tab, pane, and session model
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md'
- Cross-surface ownership and reveal rules
negative_constraints:
- 'Permission boundary: `webfetch formats: ["screenshot"]` and `webfetch formats: ["pdf"]` are capture-format requests and require `session_granted`; they must not auto-elevate silently from static fetch permission.'
- '- moving or relabeling a tab or pane changes presentation state only and MUST NOT mint a new runtime identity'
- '- a `dev_session_id` is not a shell-session alias and MUST NOT be used where exact PTY continuity is required'
- '- Role hints MUST NOT override `terminal_session_id` ownership, actual pane runtime status, cwd/profile/runtime context of an already running session, explicit user labels, or explicit user default overrides.'
- '- Adjacent run/debug, IDE, remote, and `/workflow-heavy` systems may reference terminal state and `/workflows`, summarize or reveal Terminal, and expose TUI or emulator-style context, but they MUST NOT redefine terminal ownership or runtime identity. Debug Console is debugger-scoped, remote shell co'
- '- Adoption is explicit: PM may attach a terminal session to an existing `dev_session_id` when the user explicitly launches related workflow work there, and PM must not silently adopt arbitrary shell sessions into a dev session from weak heuristics.'
- '- `selection_active` (source shorthand `selection-active`) keeps copy and selection-adjustment terminal-owned; non-selection terminal actions must not clear active selection unless they inherently replace it.'
- '- PM-wide shortcuts require explicit scope and precedence handling; one keystroke MUST NOT trigger both a terminal action and an application action'
- '- Puppet Master MUST NOT fabricate exact command boundaries, command text, or success semantics when shell integration is weaker than the observed data supports'
- '- Command-block identity is transcript-oriented metadata, not rendered UI fragments: each block has `command_block_id`, owning `terminal_session_id`, monotonic ordinal, nullable `command_text`, nullable cwd, `block-start`/start_marker reference, `block-end`/end_marker reference, `started_at`, nullab'
- '- If pruning invalidates a command block''s backing output range, the block remains as partially-backed or metadata-only command metadata; raw-transcript-only actions degrade honestly with `/history-unavailable`, transcript `/search` operates only on retained raw transcript or `/scrollback`, command '
- '- Restore language must not blur live continuity with historical slot recovery: a `/restored` `/pane` can keep durable `terminal_session_id` metadata, labels, ratios, layout, and defaults while being metadata-only or `/review-limited` when transcript is missing, and continuity of the same live sessi'
- '- requested preferences MUST NOT let the UI imply a terminal or shell capability that the effective runtime cannot currently provide'
- '- `dev_session_id` owns higher-level workflow continuity and MUST NOT replace `terminal_session_id` when exact shell reuse is required'
- '- partial updates must not invent final totals before the platform reports them'
- '| `transient_only` | live PTY state, full scrollback beyond retained bounds, active TUI alternate-screen content, active selection ranges, in-flight search highlights | MUST NOT be faked after restart |'
- 'Terminal state categories stay distinct: transcript state, command-block `/history` metadata, layout `/session` metadata, and settings `/theme` defaults keep separate persistence owners and MUST NOT be collapsed into one terminal blob.'
- Legacy routing shorthand such as `/SSH`, `/WSL/container-or-similar`, `/render`, and `/replaces` is resolved through the same process-host, renderer, and requested/effective host contract; PM must not mask a remote, WSL, container, or unsupported runtime request by silently launching a local shell o
- '- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.'
- '- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and l'
- '- Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/rest'
- '- provider-routed fetch must not reuse the reserved native Site Reader identity.'
- '- The PM built-in browser and click-to-context `/browser-interaction` topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into `websear'
- '- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.'
compatibility_only_notes:
- '- The legacy marker `session_terminated_while_running` maps to the `session-end` closure path: `session_runtime` and `shell_integration` evidence beat any `transcript_heuristic`, and weak integration must keep `block-end`, command text, and copy-output confidence explicit.'
- Legacy routing shorthand such as `/SSH`, `/WSL/container-or-similar`, `/render`, and `/replaces` is resolved through the same process-host, renderer, and requested/effective host contract; PM must not mask a remote, WSL, container, or unsupported runtime request by silently launching a local shell o
- '- All major terminal subsystems emit typed events at state-transition boundaries, and diagnostic state is queryable per pane/session and project-wide without scraping rendered UI text.'
- '- Legacy runtime comparison inputs `Wry`, `WebView2`, `WKWebView`, and `WebKitGTK` are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure `under-specified`, because degraded states are advertised through requested/effective browser cap'
stale_retired_dispositions:
- '- stale or degraded projections must `/revalidate` before mutating actions; read-only fallback uses explicit `/freshness`, `projection_freshness`, `projection_health`, pending-sync, and `degraded-copy` wording rather than vague uncertainty'
- '- stale Persona/tier selectors from `Personas.md`, `Contracts_V0`, and `Contracts_V0.md`, such as `_persona_id` and `select_for_tier()`, as canonical promoted-shell fields; Section 15 consumers use requested/effective Persona identity and runtime owner scope instead.'
owner_boundary_notes:
- '## 0. Scope and SSOT status'
- This document is the canonical owner for the promoted Section 15 feature set. It converts the former idea/backlog material into implementation-ready product and system requirements.
- This document is not the storage, command, permission, or widget SSOT. Those remain owned by their canonical subsystem plans and are reconciled to the requirements here.
- 'Section 15 packetization preserves the owner/consumer split: owner docs identified here are MUST CHANGE, while dependent consumer or /mirror docs are MUST RECONCILE so they stay aligned without becoming the primary feature owner.'
- '## 1. Canonical shell and surface model'
- '- editor-tab browser surface for canonical in-shell `workspace_preview` sessions'
- '- bottom-panel runtime surfaces: terminal, problems, output, debug console, ports, and optional browser-adjacent activity/evidence panes that do not own the canonical browsing session'
- '- no feature may depend on a floating transient overlay as its only canonical navigation model when the same information participates in persistence, restore, or multi-tab/window behavior'
- As a consumer of repaired /tool/routing semantics, `research-session` browser activity must keep `/browser-action` affordances aligned with the owner contracts in Tools, Permissions, and UI command routing rather than inventing a separate browser-action command family.
- 'Permission boundary: `webfetch formats: ["screenshot"]` and `webfetch formats: ["pdf"]` are capture-format requests and require `session_granted`; they must not auto-elevate silently from static fetch permission.'
- 'Canonical lifecycle rules:'
- '**Cross-owner worktree alignment:**'
- '- `Plans/GitHub_Integration.md` Source Control §A.1 uses accordion navigation rather than tabs, and §A.4 Worktrees rows are single-column expandable rows whose owner labels can expose run/tier/thread IDs; remote SSH worktree notes stay with GitHub Integration.'
- '- `chain-wizard-flexibility.md` keeps worktree policy conditional on run intent rather than globally uniform: isolated worktrees are the default for parallel or risky work, but wizard/chain flows may reuse or route worktrees when the owner docs declare that exception explicitly.'
- '**Non-MVP boundaries:** Section 15 registers the promoted feature but does not widen the owner scope: Assistant Chat W.17 remains the explicit non-goal owner for no arbitrary "Bind Existing" MVP, no unbind/merge undo, no per-merge command override, no worktree-scoped Changes section, no thread expor'
- Per-thread context detail uses one compact inspect/action entrypoint plus one canonical detailed surface.
- '- compact context rows use normalized workflow labels such as `Ask`, `Agent`, `Plan`, and `Deep Plan`; `Deep Plan` remains a distinct canonical `/workflow` identity rather than collapsing into plain `plan`'
- '- a detached usage pop-out is not the canonical model'
- The dev loop is shell-first and session-oriented. Terminal is the canonical interactive shell surface, and chat, output, problems, debug console, ports, and dev controls consume terminal or dev-session state instead of owning PTY state themselves.
- 'Terminal presentation vocabulary is explicit: the simple default is one visible bottom-docked section; `/docked` means a supported shell runtime zone, detached stays first-class, and `/editor-area` replacement is not a canonical terminal section target.'
- 'The shorthand `/tab/pane/session` means this owner split: terminal tab and pane identity own presentation and reveal targets, while terminal session identity owns exact PTY continuity; `/tab/workspace` is the tab-scoped workspace presentation context, not a substitute runtime.'
- '- Terminal shorthand such as `/tabs/panes`, `/reveal/move/rename/pin/close/detach/reattach`, `/close-tab`, `/reveal`, and `/transcript` maps to this owner split: workspace commands change presentation containers, while PTY transcript continuity stays with `terminal_session_id` unless an explicit `te'
- '- Adjacent run/debug, IDE, remote, and `/workflow-heavy` systems may reference terminal state and `/workflows`, summarize or reveal Terminal, and expose TUI or emulator-style context, but they MUST NOT redefine terminal ownership or runtime identity. Debug Console is debugger-scoped, remote shell co'
- Agent shell control consumes `Plans/Tools.md` `/tool` and `/policy` outcomes through the canonical terminal subsystem; normalized bash/tool outcomes feed terminal state rather than inventing parallel shell ownership.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

