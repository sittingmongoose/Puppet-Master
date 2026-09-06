# Shard 037: Notebook Artifact Reference Addendum (2026-09-05)

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L2765-L2800

Source SHA256: `2e9c5da5d0b21975070933d08b54fdbc6f97f72aa9f44ec426951fde6864de74`

---

## Notebook Artifact Reference Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Notebook entries reference runtime artifacts identity-native (`artifact_id` + frozen `artifact_version`, never repo paths or export-local surrogates), consistent with RAP-008 and embed freezing. When a referenced artifact is later redacted, revoked, blocked, expired, or omitted, the note's claim is revalidated against current artifact state at reuse: transition/recovery rechecks active evidence, and an old note cannot reactivate revoked evidence or imply cleanup occurred. Raw logs and media stay artifacts; note text never duplicates their bytes.

```yaml
plan_unit_id: RAP-055
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: Notebook artifact references are identity-native with frozen versions. On retrieval or resume, referenced artifact state (active/redacted/revoked/blocked/expired/omitted) is revalidated; old notes cannot reactivate revoked evidence or imply cleanup occurred, and raw logs/media remain artifacts rather than note bodies.
gui_related: false
gui_classification_reason: Artifact reference semantics are data behavior; panel rendering is unchanged.
depends_on: [RAP-054, WN-013]
unblocks: []
acceptance_criteria:
  - Revoked/expired references render with truthful unavailable state, never rehydrated content.
  - Identity-native references survive cleanup/archive moves.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: evidence_reactivation
reasoning_tier: standard
context_scope: runtime_artifacts
implementation_surfaces: [Plans/Runtime_Artifacts_Panel.md, Plans/Working_Notebook.md]
node_compile_hint: {mode: artifact_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I09
  - source_packet:PM-WNC-2026-09-05-v1:WNC-T03
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A46
preserved_exact_tokens: ["artifact_id", "artifact_version", "revoked"]
negative_constraints:
  - Do not rehydrate revoked evidence through notes.
  - Do not imply cleanup occurred from stale note state.
owner_hints: [Plans/Runtime_Artifacts_Panel.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Working_Notebook.md
