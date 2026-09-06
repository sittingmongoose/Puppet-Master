# Shard 028: Fresh Context Versus Rotation Addendum (2026-09-05)

Source: `Plans/Run_Modes.md`

Source lines: L1265-L1301

Source SHA256: `a55e0f6be429d71cc0380293d4d2ddfeac8abf084f4f1667346376ce9380f178`

---

## Fresh Context Versus Rotation Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. A fresh context-window transition (Plans/Prompt_Pipeline.md PP-084) is not run rotation: the run, its identity, its outcome taxonomy, and its mode ceilings are unchanged, and `done.rotated` is emitted only when a genuine run rotation occurs (a follow-up run was actually spawned per §3). Ask and plan remain rotation-ineligible, yet their read-only work may continue in a fresh window through the pipeline's read-only continuation policy without mode escalation or widened ceilings; a fresh context in any mode never widens tool, project, or external-write ceilings and never converts a read-only run into `regular`/`yolo`.

```yaml
plan_unit_id: RM-052
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Modes.md
canonical_text: A fresh context-window transition is not run rotation. done.rotated is emitted only for genuine run rotation (a follow-up run actually spawned); ask/plan remain rotation-ineligible while their read-only work may continue in a fresh window without mode escalation. A fresh context never widens tool, project, or external-write ceilings and never converts a read-only run into regular/yolo.
gui_related: false
gui_classification_reason: Mode semantics are runtime behavior, not GUI work.
depends_on: [RM-051, PP-084]
unblocks: []
acceptance_criteria:
  - Fresh-window flows never emit done.rotated unless genuine rotation occurred.
  - Read-only continuation grants no write authority or mode escalation.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: mode_escalation
reasoning_tier: high
context_scope: run_modes
implementation_surfaces: [Plans/Run_Modes.md, Plans/Prompt_Pipeline.md]
node_compile_hint: {mode: runtime_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C01
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C03
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A20
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A21
preserved_exact_tokens: ["done.rotated", "rotation-ineligible", "mode escalation"]
negative_constraints:
  - Do not repurpose done.rotated for fresh-window transitions.
  - Do not widen read-only ceilings for continuation.
owner_hints: [Plans/Run_Modes.md, Plans/Prompt_Pipeline.md]
```

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Working_Notebook.md
