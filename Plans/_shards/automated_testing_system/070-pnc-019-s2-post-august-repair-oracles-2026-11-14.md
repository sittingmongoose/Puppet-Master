# Shard 070: PNC-019 S2 post-August repair oracles (2026-11-14)

Source: `Plans/Automated_Testing_System.md`

Source lines: L15367-L15476

Source SHA256: `9dddc645797aedee3cbd1443f87bc5ffd81418297323b065b974d69d86a7697f`

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

### ATS-2301 - Executable oracle of the three DL-300 families (PNC-019 S2)

```yaml
plan_unit_id: ATS-2301
unit_type: validation_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: |-
  Newly authored under DL-411 for criterion 12 of settings.layer.changed, approval.chat_tool_requested and approval.chat_tool_resolved: the executable oracle of CV-2300 to CV-2302 and SP-2300 to SP-2303. python3 scripts/pm-s2-dl300-event-contracts.py runs the complete checker scripts/pm_s2_dl300_events.py over 886 cases (180 positives and 706 single-defect negatives, each passing only when its first refusal is its own row) from the witness catalogue scripts/pm_s2_cases.py: publication verification of every edition, variant, state and representation, exact retry, journal CAS, canonical cleanup, SP-1101 retained reads and retention cells, plus the inline-journal 16,384/16,385 and external-body 16,385 boundaries. Every refusal goes through one named row of a generated Method B guard table: 28 tables and 181 rows, at most eight rows each, rendered from the checker's ROWS by scripts/pm-s2-table-generate.py. The gated guard tool scripts/pm_guard_isolation.py (004bdedd632d9463f3535190a6ed5772338cdce1), run by python3 scripts/pm-s2-guard-tables.py --out <dir>, proves 180 rows by single-row cuts in which only the row's own negative may flip, with 0 masked negatives, 0 unrelated changes and 0 lane-matrix problems; SJ01_scope_kind sits alone in its own table with the written proof in ENTAILED. Numbers: every payload integer slot, including nested and map-valued slots, reads through current_integer, Storage fields through storage_uint64 and the producer projection through producer_semantic_bytes; the shared NUMRULE corpus (scripts/pm_s2_numbers.py, 82 spellings including a valid 4,400-digit integer, 2,265 routes) agrees with the shared helpers with no exception. Timestamps: occurred_at_utc, the AppendReceipt acknowledged_at_utc (E5-2) and the request's expires_at_utc use the CV-1101 event_record profile and the two Storage-assigned EventRecord times the CV-253 storage_utc_z profile, all through pm_event_datetime.date_time; instants compare on the shared calendar. Retained reads select their recipe only from the one sealed receipt of the exact original, with missing, ambiguous, other-original, unknown-recipe and wrong-edition negatives. The eager $ref closure, the timestamp-field inventory and the tables' freshness are asserted on every run. The repository-wide date-time inventory gate needs its batch-integration refresh for the three new external_prepared_event nodes (CV-253 Storage fields, as W3H's) and for regenerated index pins. Native execution remains NOT_RUN and is a separate later claim.
gui_related: false
gui_classification_reason: Defines validation evidence for persisted event families; no presentation ownership.
depends_on:
- CV-2300
- CV-2301
- CV-2302
- SP-2300
- SP-2301
- SP-2302
- SP-2303
unblocks: []
acceptance_criteria:
- python3 scripts/pm-s2-dl300-event-contracts.py exits 0 at the head that cites this unit.
- The tables are generated, never hand-edited; each unproved row keeps its written proof alone in its own table.
- No native, runtime or admission claim follows from these synthetic oracles.
validation_surfaces:
- python3 scripts/pm-s2-dl300-event-contracts.py
- python3 scripts/pm-s2-table-generate.py --check
- python3 scripts/pm-s2-guard-tables.py --out <dir>
risk_class: event_oracle_coverage_drift
reasoning_tier: high
context_scope: event_authority_pnc019_s2
implementation_surfaces:
- Plans/Automated_Testing_System.md
- scripts/pm_s2_dl300_events.py
- scripts/pm_s2_cases.py
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411) and DL-300
- reports/event-authority-20261114/s2-dl300-search-evidence.json
preserved_exact_tokens:
- settings.layer.changed
- approval.chat_tool_requested
- approval.chat_tool_resolved
negative_constraints:
- No registry change, admission or native claim.
- Do not edit the gated guard tool or the generated tables by hand.
owner_hints:
- Plans/Automated_Testing_System.md
```

The two Storage-assigned EventRecord times are `observed_at_utc` and `persisted_at_utc`; the checker's timestamp inventory (`timestamp_inventory` in `scripts/pm_s2_dl300_events.py`) asserts every date-time field the three families' stored values carry, with its profile and the guard row covering it.
