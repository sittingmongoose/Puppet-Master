# Shard 069: PNC-019 S2 post-August repair oracles (2026-11-14)

Source: `Plans/Automated_Testing_System.md`

Source lines: L14151-L14204

Source SHA256: `7427590b6e0acfe45f048d3f0c1d9071b8ac59e17675ea7f2b0debe26232f35c`

---

## PNC-019 S2 post-August repair oracles (2026-11-14)

### ATS-2300 - Executable oracles of the five DS families (post-August repair register)

```yaml
plan_unit_id: ATS-2300
unit_type: validation_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: |-
  Registers, for criterion 12 of context.compaction.completed, browser.workspace.created, browser.workspace.reset, workspace.layout_changed and terminal.workgroup_moved, the executable oracles that already exist in this repository; it authors no new case and changes no family contract. The positive and negative cases are the owner fixtures (Plans/context_compaction_completion_contract_fixtures.json, Plans/browser_workspace_created_contract_fixtures.json, Plans/browser_workspace_created_checkpoint_v2_fixtures.json, Plans/browser_workspace_reset_contract_fixtures.json, Plans/home_layout_event_contract_fixtures.json, Plans/home_layout_v2_slot_receipt_fixtures.json and Plans/event_authority_ds_round2_fixtures.json) together with the DS witness suites. Every refusal of the family checkers (scripts/pm_browser_workspace_created.py, scripts/pm_browser_workspace_created_v2.py, scripts/pm_browser_workspace_reset.py, scripts/pm_event_payload_route.py, scripts/pm_home_layout_v2_slot_receipt.py, scripts/pm_ds_retained.py, scripts/pm_event_authority_ds_round2.py, the DS routes of scripts/pm-browser-event-admission.py and scripts/pm_terminal_workgroup_compatibility.py) is one named row of a generated Method B guard table: 198 tables and 746 rows, at most eight rows each, rendered from scripts/pm_ds_guard_spec.py by scripts/pm-ds-table-generate.py. The gated guard tool scripts/pm_guard_isolation.py (004bdedd632d9463f3535190a6ed5772338cdce1) proves 718 rows by single-row cuts in which only the row's own negative may flip; the other 28 sit alone in their own tables with path:line proofs that an earlier row or schema clause always refuses first (ENTAILED in scripts/pm_ds_guard_spec.py). Witnesses: python3 scripts/pm_ds_p2a_cases.py --check (186 of 186) and python3 scripts/pm_ds_p2b_cases.py --check (51 of 51: 31 negatives each refused first at exactly its row, 20 positives; 110 sealed originals, 66 references, 0 collisions); python3 scripts/pm-ds-table-generate.py --check (198 tables, 746 rows, none stale). Date-time fields use the shared CV-1101 predicate under their owner profiles (event_record, and CV-253 storage_utc_z at the inventoried Storage nodes, including the DS 3.0.0 envelope nodes of Plans/event_record_v3.schema.json); number slots use CV-1100/SP-1100; every retained read selects its recipe only from sealed custody through SP-1101's RetainedDispatcher, with unsealed, forged, unknown-recipe and wrong-edition negatives. The original suites tests/test_pm_browser_workspace_created.py, tests/test_pm_browser_workspace_reset.py, tests/test_pm_browser_event_admission.py and tests/test_pm_validate_pm7_gui_fixtures.py, and the terminal self-test python3 scripts/pm_terminal_workgroup_compatibility.py --self-test (7 positives, 25 negatives), pass. The batch-2 integration ran the date-time inventory gate and datetime_validator; the batch-2 reviews (Wonder, Sol high fix-1 recheck, pre- and post-landing Astra max) found no DS defect. Native execution of every family remains NOT_RUN and is a separate later claim, not part of this oracle.
gui_related: false
gui_classification_reason: Defines validation evidence for persisted event families; no presentation ownership.
depends_on:
- ATS-017
- ATS-040
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Each listed check exits 0 at the head that cites this unit; a failing check withdraws the criterion-12 PASS it supports.
- The guard tables are generated, never hand-edited, and the 28 unproved rows keep their written proofs.
- No native, runtime or admission claim follows from these synthetic oracles.
validation_surfaces:
- python3 scripts/pm_ds_p2a_cases.py --check
- python3 scripts/pm_ds_p2b_cases.py --check
- python3 scripts/pm-ds-table-generate.py --check
- python3 scripts/pm_terminal_workgroup_compatibility.py --self-test
risk_class: event_oracle_coverage_drift
reasoning_tier: high
context_scope: event_authority_pnc019_s2
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019-SCOPE/PLAN.md (S2, F2, F3)
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS/sweep-p2b/DS.md (guard-table result)
- reports/event-authority-20261114/s2-depth-post-august.json
preserved_exact_tokens:
- context.compaction.completed
- browser.workspace.created
- browser.workspace.reset
- workspace.layout_changed
- terminal.workgroup_moved
negative_constraints:
- No new case, family contract, registry change, admission or native claim.
- Do not edit the gated guard tool or the generated DS tables by hand.
owner_hints:
- Plans/Automated_Testing_System.md
```
