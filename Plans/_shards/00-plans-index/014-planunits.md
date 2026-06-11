# Shard 014: PlanUnits

Source: `Plans/00-plans-index.md`

Source lines: L613-L763

Source SHA256: `475b95ed4e8e89d86185b6089000b5eaecfe544af05c37b150e269696b4efebd`

---

## PlanUnits

### 0PI-001 - Plans Index (authoritative map) Source-Preserving PlanUnit

```yaml
plan_unit_id: 0PI-001
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: Plans/00-plans-index.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/00-plans-index.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:00-plans-index-S0023
preserved_exact_tokens:
- Plans Index (authoritative map)
- Change Summary
- 'ContractRef: ContractName:Plans/Document_Packaging_Policy.md, PolicyRule:Decision_Policy.md§2'
- Anti-drift layer (required reading order)
- 'ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Progression_Gates.md'
- Cross-doc owner-map guard
- Rewrite tie-in (2026-02-21)
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD'
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
- Provider/account canon reconciliation note (2026-03-20)
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md'
- Plan map
- PM Bootstrap Planning, PlanUnit, and Node-Readiness Map (2026-06-11)
- 'ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
- Instant Grep canon reconciliation note (2026-03-30)
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md'
- Browser canon reconciliation note (2026-03-19)
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/UI_Command_Catalog.md'
- 'ContractRef: ContractName:Plans/newfeatures.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md'
- Slash-Command and Chat-Tools SSOT Map
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
- Artifact, HITL, and Tool Contract Ownership Map
- 'ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Permissions_System.md'
- Terminal Ownership Map
negative_constraints:
- '- consumer docs must not preserve stale tier-era or request-era canon as peer alternatives'
- '- Mixed-era layering seam: `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/FinalGUISpec.md`, and `Plans/UI_Command_Catalog.md` must not preserve `mixed-era` layering where additive patches landed without fully retiring older framing.'
- '- Usage event reference shape seam: `Plans/usage-feature.md`, `Plans/Runtime_Artifacts_Panel.md`, `Plans/storage-plan.md`, and `Plans/Contracts_V0.md` remain the owner/consumer set for `usage_event_ref`; `usage-feature.md` consumers must not rely on timestamp heuristics or a shape that lacks authori'
- '- Runtime scheduler/executor blocked-sequence seam: `blocked_sequence` is owned by the runtime scheduler/executor layer through `Plans/Executor_Protocol.md` and `Plans/Contracts_V0.md`; UI/HITL/chat/storage docs, including the legacy `/HITL/chat/storage` bucket shorthand, are consumers and must not '
- GUI worktree visibility is part of the seam, not a cosmetic pass. `FinalGUISpec.md` owns visible cross-surface behavior; `FileManager.md` may show compact repo/worktree context in its header or `/strip` but must not own commit `/history/graph/worktree` management; `WorktreeGitImprovement.md` owns wo
- 'Firecrawl/missing-spec packet-conflict reset (2026-04-06): the section titled `RECONCILIATION / COVERAGE PASS — PACKET-CONFLICT RESET (2026-04-06)` supersedes the older three-bucket, 12-doc, 13-doc, 23-blocker, and coverage-consuming registers for this work-item scope. The scope is the full Firecraw'
compatibility_only_notes:
- '- Runtime scheduler/executor blocked-sequence seam: `blocked_sequence` is owned by the runtime scheduler/executor layer through `Plans/Executor_Protocol.md` and `Plans/Contracts_V0.md`; UI/HITL/chat/storage docs, including the legacy `/HITL/chat/storage` bucket shorthand, are consumers and must not '
- 'The project is intentionally adapting an OpenCode-style architecture and is mid-transition to a deterministic agent-loop core with:'
- Artifact, HITL, and tool approval canon uses an owner split rather than a three-way SSOT. `Plans/Runtime_Artifacts_Panel.md` owns runtime artifact presentation and artifact-surface behavior; `Plans/storage-plan.md` owns durable artifact-projection key families and projector storage; `Plans/Contracts
- 'The `request_id <-> blocked_sequence` relation is compatibility and lineage routing: surviving `request_id` values resolve to the canonical blocked episode before a runtime mutation is allowed. New tool-approval or HITL surfaces use `blocked_sequence`, `approval_scope_key`, and ordered `allowed_acti'
- '- crew shared-state versus legacy memory-manager language'
- 'Firecrawl and missing-spec index drift guard: `Plans/Tools.md` remains the owner for Firecrawl/web tool behavior, no-silent-fallback contracts, and repaired web tools; `Plans/CLI_Bridged_Providers.md` is a Firecrawl provider consumer summary, not competing owner canon; `Plans/assistant-chat-design.m'
- 'Legacy Firecrawl/missing-spec coverage labels remain live only as reset traceability for owner/consumer routing, not as separate GitHub Integration canon or packet-shape artifacts: `FIDELITY-LF-007` maps to `MUST CHANGE` in `Plans/Permissions_System.md` and `Plans/Tools.md`; `FIDELITY-LF-008` maps t'
stale_retired_dispositions:
- '- consumer docs must not preserve stale tier-era or request-era canon as peer alternatives'
- This index records these routing relationships only; it does not re-own contract, storage, UI, chat, run-graph, HITL, executor, or usage behavior. For each seam below, Primary owners and Primary doc entries carry the owning canon; Cross-owner docs implicated by this seam, Strongly implicated adjacen
- '- Usage stale-consumer seam: Primary stale consumer: `Plans/usage-feature.md`; Owner docs already identified: `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, and `Plans/Runtime_Artifacts_Panel.md`.'
- '- Run/GUI/UI primary stale-consumer seam: Primary stale consumers: `Plans/Orchestrator_Page.md`, `Plans/Run_Graph_View.md`, `Plans/FinalGUISpec.md`, and `Plans/UI_Command_Catalog.md`.'
- '- Worktree/chat stale-consumer seam: Primary stale consumer: `Plans/WorktreeGitImprovement.md`; Strong aligned adjacent consumer: `Plans/assistant-chat-design.md`.'
- '- UI/run/orchestrator strong stale-consumer seam: Strong stale consumers: `Plans/UI_Command_Catalog.md`, `Plans/Run_Graph_View.md`, and `Plans/Orchestrator_Page.md`.'
- '- UI/executor stale-consumer aligned-owner seam: Strong stale consumer: `Plans/UI_Command_Catalog.md`; Strong aligned owner: `Plans/Executor_Protocol.md`.'
- '- Run/orchestrator/UI primary stale-consumer seam: Primary stale consumers: `Plans/Run_Graph_View.md`, `Plans/Orchestrator_Page.md`, and `Plans/UI_Command_Catalog.md`.'
- '- UI/run stale-inconsistent consumer seam: Primary stale/inconsistent consumers: `Plans/UI_Command_Catalog.md` and `Plans/Run_Graph_View.md`; retain `/inconsistent` classification when reconciling those consumers.'
- '- FileManager/chat implicit-consumer seam: Primary stale consumer: `Plans/FileManager.md`; Strong aligned-but-implicit consumer: `Plans/assistant-chat-design.md`.'
- '- Orchestrator/run primary stale-consumer seam: Primary stale consumers: `Plans/Orchestrator_Page.md` and `Plans/Run_Graph_View.md`.'
- '- Prompt pipeline residual stale-scope seam: Strong owner docs with residual stale scope wording: `Plans/Prompt_Pipeline.md`.'
- '- Widget owner-consumer hybrid seam: Primary stale owner/consumer hybrid: `Plans/Widget_System.md`.'
- '- **Auth**: subscription-first; Gemini is modeled as two provider entries, not one stale-canon `mixed-account` provider: Gemini Direct (`gemini`, direct key-only/API-key-backed) and Gemini CLI (`gemini_cli`, CLI-wrapped OAuth/API-key/Google-credential paths). The Gemini API key remains the explicit '
- Provider / account / promoted-shell routing stays split by owner surface. `Plans/Multi-Account.md` and provider-specific docs own requested/effective account, auth, quota, and provider-health semantics; `Plans/Section15_MVP_Promoted_Features_Spec.md` owns the promoted shell and promoted-feature beha
- '- `Plans/Bootstrap_Planning_Migration.md` owns current bootstrap workflow usage, AGENTS trigger migration, Codex phase model, controlled Plan conversion batches, governance seal timing, and retired-experiment exclusions.'
- Plans/00-plans-index.md (`/00-plans-index.md`) is the live canon-map and `/index` discoverability map for promoted Instant Grep canon so future agents can find the owner split without relying on stale search terms.
- '- `rewrite-tie-in-memo.md` is the rewrite-baseline constraint owner for browser-runtime and preview/browser architectural assumptions, including CEF/editor-tab canon and stale bottom-panel / `wry` wording cleanup'
- 'Browser cleanup rule: `Plans/newfeatures.md §15.18`, stale-reference cues, `/stale-canon`, `/WebView2/WebKitGTK`, detached-first runtime matrices, older `trust-tier` browser permission matrices that predate the locked three-action `allow` / `ask` / `deny` permission model and deterministic precedenc'
- 'The minimal reconciliation sequence starts with contradictions and stale references in canonical owner and /consumer docs before adding more owner text: normalize SSH reconnect wording to `GitHub_Integration.md §C` now-locked one-bounded-auto-retry behavior, remove stale browser or bottom-panel resi'
- 'File-manager/editor packetization is coherence-gated: `Plans/Wiring_Matrix.md` is required whenever reconciliation introduces `cmd.search.*`, `cmd.file.*`, `cmd.chat.add_file_reference`, or added `cmd.git.*` rows, otherwise command routing is non-coherent. `UI_Command_Catalog.md` and `GitHub_Integra'
- Browser residue cleanup rides with shell-placement, file-action, and remote/recovery reconciliation rather than becoming a separate seventh packet. Stale cues such as `Browser tab (§7.20)`, `Bottom Panel Browser tab`, `browser panel/window`, `preview_mode = browser_panel`, and `max 5 attempts` are r
- '| `Bootstrap_Planning_Migration.md` | Bootstrap ledger migration and governance seal workflow | Canonical for AGENTS trigger use, Codex Goal-phase migration, less-than-4,000-character goal prompt posture, controlled Plan conversion batches, Spec Lock seal timing, and retired prompt-packet/tranche ex'
- '- packetization and reconciliation should prefer rewrite-outright where stale canon would remain misleading if left in place.'
owner_boundary_notes:
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '- 2026-02-26: Registered Plans/assistant-memory-subsystem.md as canonical Assistant-only memory SSOT.'
- '- 2026-06-11: Registered the PM Bootstrap Planning Ledger, Plan Document System, Plan-to-node compilation boundary, and bootstrap migration owner docs compiled from ledger `pldg-20260610-001-ledger-plan-system`.'
- 'Primary consumer docs then follow:'
- '- owner docs are reconciled before consumer docs'
- '- consumer docs must not preserve stale tier-era or request-era canon as peer alternatives'
- '- summary and checklist mirrors are reconciled after owner and primary consumer docs'
- '### Cross-doc owner-map guard'
- This index records these routing relationships only; it does not re-own contract, storage, UI, chat, run-graph, HITL, executor, or usage behavior. For each seam below, Primary owners and Primary doc entries carry the owning canon; Cross-owner docs implicated by this seam, Strongly implicated adjacen
- '- Contracts/Crosswalk to UI/run seam: Primary owners: `Plans/Contracts_V0.md` and `Plans/Crosswalk.md`; Cross-owner docs implicated by this seam: `Plans/storage-plan.md`, `Plans/UI_Command_Catalog.md`, `Plans/assistant-chat-design.md`, `Plans/Orchestrator_Page.md`, `Plans/Runtime_Artifacts_Panel.md`'
- '- Contracts/Final GUI seam: Primary owners: `Plans/Contracts_V0.md` and `Plans/FinalGUISpec.md`; Cross-owner docs implicated by this seam: `Plans/storage-plan.md`, `Plans/assistant-chat-design.md`, `Plans/UI_Command_Catalog.md`, and `Plans/Crosswalk.md`.'
- '- Usage stale-consumer seam: Primary stale consumer: `Plans/usage-feature.md`; Owner docs already identified: `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, and `Plans/Runtime_Artifacts_Panel.md`.'
- '- Orchestrator command/storage seam: Owner docs already implicated: `Plans/Orchestrator_Page.md`, `Plans/UI_Command_Catalog.md`, `Plans/Contracts_V0.md`, and `Plans/storage-plan.md`.'
- '- Orchestrator/storage/contracts triad: `Plans/Orchestrator_Page.md`, `Plans/storage-plan.md`, and `Plans/Contracts_V0.md`; equivalent source orderings that begin with `Plans/storage-plan.md` or pair `Plans/storage-plan.md` with `Plans/Contracts_V0.md` still route to the same three owner docs.'
- '- Providers/accounts/cost/auth prompt-pipeline seam: Primary owners: `Plans/Prompt_Pipeline.md`, `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, and `Plans/Multi-Account.md`; source orderings that begin with `Plans/Multi-Account.md` or `Plans/Contracts_V0.md` still route to the same four owner doc'
- '- Execution-assumption downstream-consumer seam: downstream consumers that depend on these execution assumptions: `Plans/Orchestrator_Page.md`, `Plans/Run_Graph_View.md`, `Plans/FinalGUISpec.md`, `Plans/storage-plan.md`, `Plans/UI_Command_Catalog.md`, and `Plans/human-in-the-loop.md`.'
- '- Crosswalk/contract file-manager storage seam: Primary owners: `Plans/Crosswalk.md`, `Plans/Contracts_V0.md`, `Plans/FileManager.md`, and `Plans/storage-plan.md`; unordered source mentions of the same four paths route to the same owner set.'
- '- Contract UI/chat/file consumer seam: Primary owners: `Plans/Contracts_V0.md`; Strongly implicated adjacent docs: `Plans/Crosswalk.md`, `Plans/FileManager.md`, `Plans/FinalGUISpec.md`, `Plans/storage-plan.md`, `Plans/assistant-chat-design.md`, and `Plans/usage-feature.md`.'
- '- Contract runtime-artifact file/chat consumer seam: Primary owners: `Plans/Contracts_V0.md`; Strongly implicated adjacent docs: `Plans/storage-plan.md`, `Plans/FinalGUISpec.md`, `Plans/FileManager.md`, `Plans/assistant-chat-design.md`, and `Plans/Runtime_Artifacts_Panel.md`.'
- '- Run/GUI/UI primary stale-consumer seam: Primary stale consumers: `Plans/Orchestrator_Page.md`, `Plans/Run_Graph_View.md`, `Plans/FinalGUISpec.md`, and `Plans/UI_Command_Catalog.md`.'
- '- Contract/Crosswalk/storage already-identified owner seam: Owner docs already identified: `Plans/Contracts_V0.md`, `Plans/Crosswalk.md`, and `Plans/storage-plan.md`.'
- '- Worktree/chat stale-consumer seam: Primary stale consumer: `Plans/WorktreeGitImprovement.md`; Strong aligned adjacent consumer: `Plans/assistant-chat-design.md`.'
- '- Crosswalk/contract owner-gap seam: Primary owner-gap docs: `Plans/Crosswalk.md` and `Plans/Contracts_V0.md`; Strong aligned consumer: `Plans/storage-plan.md`.'
- '- Contract/Crosswalk shell-adoption strata seam: Stratum 1: owner docs: `Plans/Contracts_V0.md` and `Plans/Crosswalk.md`; Stratum 2: command and shell adoption: `Plans/UI_Command_Catalog.md` and `Plans/FinalGUISpec.md`.'
owner_hints:
- Plans/00-plans-index.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

