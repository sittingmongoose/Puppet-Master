# Shard 012: PlanUnits

Source: `Plans/Prompt_Pipeline.md`

Source lines: L663-L825

Source SHA256: `ea99ebd724d97ba9cbd4937381ba12c6223b4dd129744b77fcddc053ced876fc`

---

## PlanUnits

### PP-001 - Prompt Pipeline (Canonical SSOT) Source-Preserving PlanUnit

```yaml
plan_unit_id: PP-001
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: Plans/Prompt_Pipeline.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0042
preserved_exact_tokens:
- Prompt Pipeline (Canonical SSOT)
- Canonical owner-section requirements
- Requested/effective account identity contract
- 0. Scope and SSOT status
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Architecture_Invariants.md'
- SSOT references (DRY)
- 1. Prompt assembly pipeline
- 1.1 Inputs
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md'
- 1.2 Stage ordering (canonical)
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/Plugins_System.md'
- 'ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Tools.md, PolicyRule:Decision_Policy.md§3'
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md'
- 1.2B Skill resolution and runtime delivery
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md'
- 1.2A Structured attachment normalization for browser element context
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md'
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md'
- 1.2C Investigation Context normalization for Debug Mode
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/assistant-chat-design.md'
- 1.3 Instruction Bundle structure
- 'ContractRef: ContractName:Plans/Contracts_V0.md#InstructionBundleAssembly, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md'
negative_constraints:
- Other plans MAY describe how they consume compiled output, but they MUST NOT redefine context-selection, delta-context, cache, marker-file, skill-bundling, or compaction algorithms as separate SSOTs. `Plans/FileSafe.md` owns safety checks over compiled output; it does not own prompt/context compilat
- '- child/subagent/rotated runs may narrow an inherited overlay, but they MUST NOT widen a read-only overlay into `full_execution`'
- '- raw unbounded DOM dumps or page bodies MUST NOT be injected into the prompt through this attachment path'
- '- blocked or expired chips MUST NOT be serialized as successful user attachments'
- '- raw unbounded document bodies MUST NOT be injected into the prompt through this attachment path'
- '- revoked, blocked, expired, and omitted items must not be serialized as successful prompt content'
- 'The total immune set MUST NOT exceed `max_compaction_immune_pct` (default: 30, overridable per model metadata) percent of the effective context window.'
- '`/reasoning` blocks are `/replay`-safe state: PM preserves or converts them before compaction, records provider `reasoning_tokens` on each `UsageEvent`, and MUST NOT silently strip thinking/reasoning content merely because an adapter lacks a native replay field.'
- 'OpenCode replay evidence from `message-v2` / `message-v2.ts` is a compatibility hazard, not PM canon: synthetic compaction text such as "What did we do so far?" must be tagged as synthetic continuation or compaction metadata and must not replay as a user-authored instruction.'
- After filtering, pruning, or compaction, PM MUST validate role alternation and message-boundary correctness. Plugin transforms (`plugin-transform` surfaces) MUST NOT delete system or persona content, reorder messages in a way that breaks alternation, or modify immune content.
- '- placeholder repair preserves structure only; it MUST NOT invent substantive user intent, assistant claims, tool calls, or hidden policy content'
- '**AC-PP02:** Compaction MUST preserve protected tool outputs; `skill` outputs MUST NOT be pruned.'
- Runtime/provider selection occurs after requested Persona resolution and MUST NOT rewrite the winning requested-Persona source.
- '- Prompt Pipeline MUST NOT teach `tier-tree` or `active-tier` widget semantics as reusable widget `SSOT`; prompt examples and context bundles may reference derived tier labels only as compatibility display metadata while Widget_System owns widget taxonomy.'
- '- `Plans/Prompt_Pipeline.md` still uses tier-era scope in owner-level text: - run envelope still says `tier` - assembly stages still say `tier/mode/platform/model` - orchestration rules still say the prompt flow must not create new execution tiers - Persona resolver text still refers to stage/tier/t'
- 'It MUST NOT be used to silently rewrite:'
compatibility_only_notes:
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- 'OpenCode replay evidence from `message-v2` / `message-v2.ts` is a compatibility hazard, not PM canon: synthetic compaction text such as "What did we do so far?" must be tagged as synthetic continuation or compaction metadata and must not replay as a user-authored instruction.'
- '- message boundaries remain explicit across user, assistant, system, and synthetic-continue turns so replay cannot merge stale assistant progress into a new request; the compatibility marker `/assistant/system/synthetic` resolves to these boundary markers only'
- '- The highest-risk Prompt Pipeline ownership cleanup is requested/effective runtime identity duplication: Prompt Pipeline owns prompt-assembly handoff shape, storage owns durable records, and tier context survives only as compatibility/derived grouping, not a third runtime identity authority.'
- '- Prompt Pipeline MUST NOT teach `tier-tree` or `active-tier` widget semantics as reusable widget `SSOT`; prompt examples and context bundles may reference derived tier labels only as compatibility display metadata while Widget_System owns widget taxonomy.'
- '- Demote `TierContext` to a derived or compatibility-only selection/decomposition helper.'
- '- PM resolves skills from the PM registry and compatibility roots before provider execution begins'
- '- provider-native skill files, `/systems`-style compatibility trees, and other external surfaces are optional `/projection` layers for interoperability; they are not the canonical MVP runtime path and do not replace PM registry/bundling/`skill` `/tool` delivery'
- '- the optional compatibility layer is not mandatory by default because it can introduce duplication and drift against the PM skill registry, projection failures can make a provider look misconfigured even when PM-native skills remain ready, CLI multi-account sandboxes would duplicate projected state'
stale_retired_dispositions:
- '- message boundaries remain explicit across user, assistant, system, and synthetic-continue turns so replay cannot merge stale assistant progress into a new request; the compatibility marker `/assistant/system/synthetic` resolves to these boundary markers only'
- '- the budget snapshot is advisory rather than a perfect preflight predictor, but it MUST reflect the latest post-assembly estimate rather than a stale earlier value'
- '- But the owner doc still frames those fields through stale scope vocabulary: - `Run envelope (tier, mode, selected Persona ID(s), selected model/variant)` - `Active mode and tier` - `plan_or_tier_default` - `Orchestrator tier override` - `stage/tier/task/repo context` - `persona_override_owner_id` '
- '- But it is still not safe to call this `ready_for_reconciliation` because at least a few remaining gaps are not just stale wording; they are missing canonical owners or broken SSOT integrity.'
- '- This is a cross-cutting SSOT problem, not just a page-local doc issue. - `Widget_System.md` can re-spread stale Orchestrator assumptions if it is not reconciled early.'
owner_boundary_notes:
- '# Prompt Pipeline (Canonical SSOT)'
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '## 0. Scope and SSOT status'
- 'This document is the **single canonical source of truth** for:'
- Other plans MAY describe how they consume compiled output, but they MUST NOT redefine context-selection, delta-context, cache, marker-file, skill-bundling, or compaction algorithms as separate SSOTs. `Plans/FileSafe.md` owns safety checks over compiled output; it does not own prompt/context compilat
- '### SSOT references (DRY)'
- '- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`'
- '- Canonical terms: `Plans/Glossary.md`'
- 'Canonical run envelope fields:'
- Node/package/lane/seam identity is the canonical execution context; any surviving tier labels are derived grouping metadata only.
- '### 1.2 Stage ordering (canonical)'
- '8. **Apply plugin transforms and attach tool schemas**: apply allowed plugin prompt transforms, then include canonical tool definitions and any custom tool schemas.'
- '- when the active surface is **Orchestrator** or a delegated child/subagent run, the Instruction Bundle MUST carry the canonical orchestration flow contract `assess -> understand -> decompose -> act -> verify`'
- 'Canonical order:'
- 3. de-duplicate by canonical skill id
- Provider-native skill directories and formats are not the canonical runtime delivery stage for MVP. They are discovery/import/export/interoperability inputs only.
- '- `sensitivity_state` is forwarded into revision-prompt payloads and structured-output validation metadata so downstream providers and local validators receive the same disclosure boundary that context compilation used.'
- The canonical event-level contract for instruction-bundle assembly is defined in `Plans/Contracts_V0.md`.
- '- PM-owned `AGENTS.md` content remains the canonical instruction source for PM-managed provider projections; provider-native instruction files are generated/import/export projections, not peer authorities'
- Context-compression references such as Xeditor `_context_updates` are implementation references only. PM preserves the referenced behavior as incremental per-tool-call tool-result compression evaluated at every tool-call boundary rather than whole-session compaction; summaries retain causal replay m
- '- message boundaries remain explicit across user, assistant, system, and synthetic-continue turns so replay cannot merge stale assistant progress into a new request; the compatibility marker `/assistant/system/synthetic` resolves to these boundary markers only'
owner_hints:
- Plans/Prompt_Pipeline.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

