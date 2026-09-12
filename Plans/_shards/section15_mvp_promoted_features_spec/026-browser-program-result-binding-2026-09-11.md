# Shard 026: Browser Program Result Binding - 2026-09-11

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L11691-L11726

Source SHA256: `e750a78018fc0ec74c2408635d69f122e1f9a59c26ba6d8a5c8508f534bdf091`

---

## Browser Program Result Binding - 2026-09-11

### SMPFS-169 - Browser Program Result Budget And Output-Schema Binding

```yaml
plan_unit_id: SMPFS-169
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  Bind BrowserProgramResult to its producing program's existing max_output_bytes
  and pinned output schema, using actual complete uncompressed UTF-8 JSON result
  bytes plus owner-resolved terminal subject and ProgramWorkspace revision.
  Standalone schema validity, self-reported size and result-supplied context are
  insufficient; all modes and terminals retain the same fail-closed boundary.
gui_related: false
gui_classification_reason: Defines static result validation and provenance, not visual presentation.
depends_on: [SMPFS-147, SMPFS-148, SMPFS-152, SMPFS-153]
unblocks: []
acceptance_criteria:
  - Exact bytes at the existing budget pass and one byte over fails, including envelope/reference/escaping/Unicode/nested-value overhead.
  - The pinned resolved output schema and complete nonlocal dependency byte hashes validate compact_result offline; missing, changed, invalid, colliding or unresolved schema bindings reject.
  - Program, lineage, ordinary subject and workspace identity join exactly; terminal generation/revision may advance only through the independently resolved expected context and never regress.
  - Every result mode and terminal state, including failure/cancellation/unknown-effect states, obeys the same byte and schema checks; standalone results fail without their binding.
  - Oversize inline data is not silently truncated or retried; typed-artifact spill and a bounded summary preserve separate artifact custody and budgets.
validation_surfaces: [Plans/section15_browser_program_contracts.schema.json, Plans/section15_browser_program_contract_fixtures.json, scripts/pm_browser_program_semantics.py, tests/test_pm_browser_result_binding.py, python3 scripts/pm-new-contracts-verify.py]
risk_class: browser_result_budget_schema_or_provenance_escape
reasoning_tier: high
context_scope: browser_program_result_static_binding
implementation_surfaces: [Plans/section15_browser_program_contracts.schema.json, scripts/pm_browser_program_semantics.py, scripts/pm-new-contracts-verify.py]
node_compile_hint: {mode: static_result_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-147, Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-148, source_ref:user-approved-browser-result-technical-binding:2026-09-11]
negative_constraints:
  - Do not introduce new numerical output limits, token policy, runtime availability, event admission, governance sealing or visual design.
  - Do not treat supplied static context, schema hashes, refs or fixtures as native authenticity, artifact custody, currentness resolution, provider execution or test-verdict proof.
```
