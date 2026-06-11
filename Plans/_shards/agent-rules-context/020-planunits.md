# Shard 020: PlanUnits

Source: `Plans/agent-rules-context.md`

Source lines: L309-L429

Source SHA256: `7815be0dff378aa826fab1ec2295a7c1e1f87c5580142922ed5b3c64a58698de`

---

## PlanUnits

### ARC-001 - Application- and Project-Level Agent Rules -- Plan Source-Preserving PlanUnit

```yaml
plan_unit_id: ARC-001
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Plans/agent-rules-context.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/agent-rules-context.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:agent-rules-context-S0042
preserved_exact_tokens:
- Application- and Project-Level Agent Rules -- Plan
- Plan Document Status
- 'ContractRef: Primitive:DRYRules, Gate:GATE-004, Gate:GATE-009, Invariant:INV-010'
- Rewrite alignment (2026-02-21)
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/Crosswalk.md'
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, Invariant:INV-002'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#EventRecord'
- Executive Summary
- 'ContractRef: Primitive:DRYRules, PolicyRule:Decision_Policy.md§4'
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
- Relationship to Other Plans
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/assistant-chat-design.md'
- Rule Scope Model
- Application-Level Rules (Puppet Master)
- Project-Level Rules
- Order and precedence
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:AGENTS.md'
- Feeding Rules Into Every Agent
- Single Rules Pipeline (DRY)
- 'ContractRef: Primitive:DRYRules'
- 'ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Prompt_Pipeline.md'
- Where in the Prompt
- 'ContractRef: PolicyRule:Decision_Policy.md§2, Primitive:DRYRules'
- Configuration and GUI (Planning Only)
negative_constraints:
- '- the editor must not create a shadow instruction source that the rules pipeline does not read'
- '- Assistant memory, Attempt Journal, and Parent Summary are separate memory/context injectors and MUST NOT masquerade as rules text'
- '- provider cache controls such as `copilot_cache_control` and Anthropic-like cache-marker eligibility are resolved by Prompt Pipeline/provider owners using explicit provider and model-id evidence; the rules pipeline must not infer cache behavior from rule text or model-id heuristics'
- Historical `/current` run switching must not change layout identity. Layout scope remains project-level rather than run-level, so route context may focus a historical or current run without rewriting the instruction/rules target identity.
compatibility_only_notes:
- This plan's durable rules pipeline remains the user-editable source of rules text, but every agent invocation assembles a deterministic **Instruction Bundle** instead of relying on legacy injector naming.
stale_retired_dispositions:
- '- verification/review attempts use the same assembly semantics; they do not reintroduce deprecated execution-hierarchy vocabulary'
owner_boundary_notes:
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '| **AGENTS.md** | Today the Puppet Master repo''s AGENTS.md contains rules like "Always use Context7 MCP." That content can be **one source** for default application rules (e.g. on first run or when no application rules file exists). Long term, application rules are a **configurable** list so the use'
- '- the editor must show the canonical path and scope for the file being edited'
- '- when editing project rules, the canonical runtime path remains `.puppet-master/project-rules.md` unless this document is updated explicitly'
- '### Artifact Types (SSOT Definitions)'
- 'Each instruction/rules target has exactly one control mode: `PM Controlled` or `Manual Override`. A `PM Controlled` target is regenerated only from the saved canonical instruction source. A target can switch from `Manual Override` back to `PM Controlled` only after the canonical instruction source i'
owner_hints:
- Plans/agent-rules-context.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

