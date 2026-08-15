# Shard 016: Remaining Runtime Integration Addendum - 2026-08-13

Source: `Plans/Skills_System.md`

Source lines: L2584-L2647

Source SHA256: `e9b5a64f585b47d2142222d2e1e031981bc97c2da3629e41f2a36c62bc49d094`

---

## Remaining Runtime Integration Addendum - 2026-08-13

This addendum compiles the Skill-owned portion of progressive capability accountability row `CTX-015`. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal.

### SS-036 - Progressive Skill Selection And Instruction Materialization

```yaml
plan_unit_id: SS-036
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: >-
  Skills preserve installed, project_enabled, policy_available, selected_for_request, and invoked as independent stages.
  Persona defaults nominate eligible candidates instead of eagerly injecting them; bounded L0-L3 materialization admits
  only request-selected instructions/resources in deterministic Skill-ID/hash order and emits explicit omission receipts.
gui_related: false
gui_classification_reason: Backend Skill discovery, selection, prompt admission, and receipt contract; not GUI implementation work.
depends_on: [SS-007, SS-009, SS-010, SS-013, T-176, PP-009]
unblocks: []
acceptance_criteria:
  - A Skill can be installed and enabled without being policy-available, selected, invoked, or injected, and each distinction remains inspectable.
  - Persona default_skill_refs nominate candidates; only request-selected L2 instructions enter the request.
  - The dynamic skill tool description is bounded, reports total/omitted counts, and preserves catalog-search guidance rather than injecting an unbounded roster.
  - Identical inputs produce the same selected Skill order and hash independent of root-scan completion, GUI sort, locale, or provider projection order.
  - Invalid, shadowed, warning-blocked, missing-dependency, unselected, and budget-deferred Skills remain omitted with bounded reasons and are not serialized as successful instructions.
  - Skill catalogs, instructions, resources, and receipts expose no raw secrets, introduce no SQLite, and cannot establish a PM-owned external browser-test runtime or compatibility surface.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-index.py validate
risk_class: progressive_skill_materialization_drift
reasoning_tier: high
context_scope: skills_capability_materialization
implementation_surfaces:
  - Plans/Skills_System.md
  - Plans/Tools.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: progressive_skill_selection_materialization
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - 03_PROVIDER_CONTEXT_TOOLS_RECOVERY_AND_COMPACTION.md#Progressive-capability-disclosure
  - ACCOUNTABILITY_MATRIX.json:CTX-012
  - ACCOUNTABILITY_MATRIX.json:CTX-015
  - reference/HERMES_V020_SOURCE_REVIEW.md#5.4-Tool-disclosure-and-schema-cost
source_atom_ids: []
preserved_exact_tokens:
  - installed
  - project_enabled
  - policy_available
  - selected_for_request
  - invoked
  - default_skill_refs
  - CapabilityMaterializationReceipt
negative_constraints:
  - Do not eagerly inject every default, installed, enabled, or policy-available Skill instruction body.
  - Do not treat a Skill's presence in Agent Config or a Persona default as evidence that it entered model context.
  - Do not expose raw secrets, introduce SQLite, or create a PM-owned external browser-test runtime/facade/MCP/command/capture dependency.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/Skills_System.md
  - Plans/Tools.md
  - Plans/Prompt_Pipeline.md
```
