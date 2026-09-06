# Shard 044: Working Notebook Capture Redaction Addendum (2026-09-05)

Source: `Plans/FileSafe.md`

Source lines: L14743-L14778

Source SHA256: `e665850106a97f5c95b2bab2e2b2d799d02da3dfc1dcb755a19c30c060789abb`

---

## Working Notebook Capture Redaction Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. FileSafe sensitivity checks gate Working Notebook capture exactly like every other persistence path: source access, secret redaction, and artifact sensitivity are checked before note capture/ingestion and again on later retrieval. Secrets, credential material, and protected browser contents are excluded from note bodies; large raw material (logs, diffs, recordings, DOM, document bodies) is linked as identity-native artifact references under the runtime-artifact owner instead of being embedded, and a revoked or expired artifact is not rehydrated through a note. Import and preview paths treat imported note content as lower-trust data under source restrictions.

```yaml
plan_unit_id: F2-210
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: FileSafe sensitivity and secret redaction run before Working Notebook capture/ingestion and on later retrieval. Secrets and protected browser content are excluded from note bodies; large raw material is linked as artifact references rather than embedded; revoked or expired artifacts are not rehydrated through notes; and imported note content stays lower-trust data under source restrictions.
gui_related: false
gui_classification_reason: Redaction gates are security behavior, not GUI work.
depends_on: [F2-209, WN-006]
unblocks: []
acceptance_criteria:
  - Secrets/protected browser contents never persist in note bodies or envelopes.
  - A revoked artifact is not rehydrated through a note.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: secret_persistence
reasoning_tier: high
context_scope: filesafe_security
implementation_surfaces: [Plans/FileSafe.md, Plans/Working_Notebook.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: security_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-T03
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A12
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A46
preserved_exact_tokens: ["secret scrubbing", "artifact references", "lower-trust data"]
negative_constraints:
  - Do not embed raw logs, DOM, documents, recordings, or diffs in note bodies.
  - Do not rehydrate revoked artifacts through notes.
owner_hints: [Plans/FileSafe.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Working_Notebook.md, ContractName:Plans/Runtime_Artifacts_Panel.md
