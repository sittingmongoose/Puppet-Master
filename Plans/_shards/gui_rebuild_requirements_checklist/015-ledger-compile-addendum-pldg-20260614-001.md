# Shard 015: Ledger Compile Addendum - pldg-20260614-001

Source: `Plans/GUI_Rebuild_Requirements_Checklist.md`

Source lines: L1798-L1905

Source SHA256: `19c2e9efe0fa0322b01ca45e4f2ddea6809e5d0581e5da73ca070c6ba9b55583`

---

## Ledger Compile Addendum - pldg-20260614-001

### GRRC-030 - Concern Lifecycle Verification Coverage Compile Addendum

```yaml
plan_unit_id: GRRC-030
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: >-
  GUI_Rebuild_Requirements_Checklist consumes concern lifecycle, concern routing, approval scope, blocked owner taxonomy, projection trust,
  and action gating as verification coverage. It must not own the implementation contract for concern records or lifecycle fields; those remain
  with Contracts, Orchestrator, storage, HITL, and Final GUI owner docs.
gui_related: true
gui_classification_reason: This checklist verifies GUI rebuild surfaces and user-visible concern lifecycle behavior.
depends_on: [CV-279, OP-020, F3-387]
unblocks: []
acceptance_criteria:
  - Checklist items point to owner docs for concern lifecycle behavior.
  - Verification coverage does not duplicate implementation ownership.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual checklist owner-reference review
risk_class: checklist_owner_drift
reasoning_tier: standard
context_scope: gui_rebuild_verification_coverage
implementation_surfaces: [Plans/GUI_Rebuild_Requirements_Checklist.md, Plans/Contracts_V0.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: verification_coverage_only, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0071
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0073
preserved_exact_tokens: ["concern lifecycle", "verification coverage", "not implementation ownership", "GUI_Rebuild_Requirements_Checklist"]
negative_constraints:
  - Do not make the checklist the implementation owner for concern lifecycle or blocked-state fields.
owner_hints: [Plans/GUI_Rebuild_Requirements_Checklist.md, Plans/Contracts_V0.md, Plans/FinalGUISpec.md, Plans/Orchestrator_Page.md]
```

### GRRC-031 - GUI Usage Acceptance Fixture Matrix Checklist Gate

```yaml
plan_unit_id: GRRC-031
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: >-
  The GUI rebuild checklist is not Usage-complete until it verifies the UF-088 fixture matrix across Usage, Ledger,
  Context Detail Pane and chat usage surfaces, Dashboard-hosted Usage widgets, Runtime Artifacts, Run Graph,
  Orchestrator, provider/settings rows, and model rows. Required checklist fixtures are GUI-USG-001 missing usage,
  GUI-USG-002 provider-reported zero, GUI-USG-003 unknown cost, GUI-USG-004 BYOK/subscription hidden cost,
  GUI-USG-005 disabled quota bucket, GUI-USG-006 cache zero versus unsupported, GUI-USG-007 inclusive/exclusive
  no-double-count, GUI-USG-008 partial/aborted stream, GUI-CBP-001 Antigravity missing commands, GUI-CBP-002
  Antigravity G1 credits, GUI-ROUTE-001 object-first usage route, GUI-RAW-001 Raw/Curated redaction, and
  GUI-RAP-001 runtime-artifact envelope plus per-type validation.
gui_related: true
gui_classification_reason: This checklist gate verifies user-visible Usage, dashboard/widget, chat/detail, provider/model, and runtime-artifact GUI behavior.
depends_on: [UF-087, UF-088, F3-418, WS-015, ACD-434, MA-069, MS-136, RAP-043, RAP-044, UCC-109, WM-043]
unblocks: []
acceptance_criteria:
  - GUI-USG-001 through GUI-USG-008 are present as named checklist fixtures and cover missing usage, provider zero, unknown cost, hidden BYOK/subscription cost, disabled quota, cache zero versus unsupported, no-double-count, and partial/aborted streams.
  - GUI-CBP-001 and GUI-CBP-002 verify Antigravity CLI `antigravity_cli` route `agy`, missing `/stats` `/usage` `/quota` `/credits`, disabled buckets, and G1 credits as credits-only state.
  - GUI-ROUTE-001 verifies the PMConcept7 Ledger attempt branch uses route_target.object_kind = usage_attempt and object_id from attempt_id, repeats attempt_id at top level, retains usage_event_ref plus UsageRecord/runtime/provider refs as correlation, and carries no OpenSubject; event-primary artifact routes remain usage_event/usage_event_ref.
  - GUI-RAW-001 verifies Curated normalized fields and Raw redacted refs, hashes, omitted counts, and permission state without credentials, account identifiers, local paths, or raw provider secrets.
  - GUI-RAP-001 verifies cost_usage and tool_llm_trace artifacts validate against the envelope plus matching per-type schema and reject envelope-only or arbitrary non-empty type_payload payloads.
  - Checklist evidence spans Usage, Ledger, Context Detail Pane, chat usage surfaces, Dashboard-hosted Usage widgets, Runtime Artifacts, Run Graph, Orchestrator, provider/settings rows, and model rows.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-usage-gui-fixtures
  - python3 scripts/pm-plans-verify.py validate-runtime-artifact-schemas
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-shard-plans.py --check
  - future GUI Usage fixture suite
  - future Dashboard Usage widget fixture suite
  - future chat Context Detail Pane usage fixture suite
  - future provider/model usage-state fixture suite
risk_class: gui_usage_fixture_false_pass
reasoning_tier: high
context_scope: gui_usage_fixture_matrix_checklist_gate
implementation_surfaces: [Plans/GUI_Rebuild_Requirements_Checklist.md, Plans/usage-feature.md, Plans/FinalGUISpec.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: gui_usage_fixture_matrix_checklist_gate, create_worknodes: false}
source_lineage:
  - Plans/usage-feature.md#UF-088
  - Plans/FinalGUISpec.md#F3-418
  - Plans/Runtime_Artifacts_Panel.md#RAP-044
  - subagent:GUI checklist/fixture auditor
preserved_exact_tokens:
  - GUI-USG-001
  - GUI-USG-002
  - GUI-USG-003
  - GUI-USG-004
  - GUI-USG-005
  - GUI-USG-006
  - GUI-USG-007
  - GUI-USG-008
  - GUI-CBP-001
  - GUI-CBP-002
  - GUI-ROUTE-001
  - GUI-RAW-001
  - GUI-RAP-001
  - antigravity_cli
  - agy
negative_constraints:
  - Do not render missing, unknown, hidden_byok, hidden_subscription, disabled, not_exposed, stale, estimated, failed, partial, or unsupported usage states as zero or success.
  - Do not route Usage primarily by timestamp, run-only, thread-only, tier-only, or artifact-only filters when usage_event_ref is available.
  - Do not expose unredacted Raw provider payloads, credentials, account identifiers, or local machine paths in GUI fixture evidence.
  - Do not accept envelope-only cost_usage or tool_llm_trace artifacts as GUI-ready evidence.
owner_hints: [Plans/GUI_Rebuild_Requirements_Checklist.md, Plans/usage-feature.md, Plans/FinalGUISpec.md, Plans/Runtime_Artifacts_Panel.md]
```
