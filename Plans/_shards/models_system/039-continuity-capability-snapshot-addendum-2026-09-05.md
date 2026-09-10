# Shard 039: Continuity Capability Snapshot Addendum (2026-09-05)

Source: `Plans/Models_System.md`

Source lines: L9571-L9606

Source SHA256: `ffd245b25eedaff44d228996befdce514a88d6fac146f8cd083a57350eedcea3`

---

## Continuity Capability Snapshot Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Fresh-window sizing consumes the existing capability snapshot, not new fields: `effective_context_window_tokens`, `max_input_tokens`, `max_output_tokens`, and the model-owned pressure defaults (`pressure_start_pct = 70`, `pressure_aggressive_pct = 85`) feed the pipeline's checkpoint reserve and admission checks with current post-assembly estimates and provider counting semantics (no double-counted output reserve, no second contingency pool). Capability facts stay route/model/account/version-specific with provenance and staleness states; on a model or account change mid-task, the new snapshot is resolved before reconstruction so mandatory state is preserved and optional notes/history narrow first. No provider support, authentication, installation, or billing policy changes under this packet.

```yaml
plan_unit_id: MS-138
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Fresh-window transition and checkpoint-reserve sizing consume the existing model capability snapshot (effective_context_window_tokens, max_input_tokens, max_output_tokens, pressure defaults) with provenance/staleness states, per route/model/account/version. A model or account change resolves the new snapshot before reconstruction; mandatory state is preserved and optional material narrows first. No new provider policy, tier rule, or preview flag is introduced by the continuity work.
gui_related: false
gui_classification_reason: Capability snapshot semantics are model-system behavior, not GUI work.
depends_on: [MS-137, PP-086]
unblocks: []
acceptance_criteria:
  - A smaller continuation window uses its actual capability/account snapshot and estimator semantics.
  - Capabilities stay route/model/account/version-specific with recorded provenance.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: stale_capability_use
reasoning_tier: standard
context_scope: models_system
implementation_surfaces: [Plans/Models_System.md, Plans/Prompt_Pipeline.md, Plans/CLI_Bridged_Providers.md]
node_compile_hint: {mode: model_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C04
  - source_packet:PM-WNC-2026-09-05-v1:WNC-P04
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A29
preserved_exact_tokens: ["effective_context_window_tokens", "pressure_start_pct", "capability_snapshot_id"]
negative_constraints:
  - Do not size transitions from a stale or provider-name-guessed snapshot.
  - Do not add provider configuration scope creep.
owner_hints: [Plans/Models_System.md, Plans/Prompt_Pipeline.md]
```

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/CLI_Bridged_Providers.md
