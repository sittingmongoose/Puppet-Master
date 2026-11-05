# Shard 050: ATS-1270 — W3H per-family phase-1 oracle plans (newly authored, no execution)

Source: `Plans/Automated_Testing_System.md`

Source lines: L7238-L7355

Source SHA256: `32befd703e9f7e54af6198b9d50f60d4c83da7f86f6387e4edecb890414e97a7`

---

## ATS-1270 — W3H per-family phase-1 oracle plans (newly authored, no execution)

```yaml
plan_unit_id: ATS-1270
unit_type: interface_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Each of the 32 exact W3H families has a separate oracle plan in reports/event-authority-20261105/W3H-oracle-plan.json.
  Every positive names its original owner fact; each negative isolates one predicate and keeps unrelated commitments
  coherent. Shared numerical/time recipe and guard-isolation machinery are adopted only after reviewed phase-2 foundations.
  All criterion-12 grades are PARTIAL; native execution is NOT_RUN.
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- CV-317
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- assistant_plan.schedule_invalidated
- docker.compose.scenario.deleted
- docker.compose.scenario.edited
- docker.compose.scenario.run
- docker.compose.scenario.saved
- execution_window.created
- execution_window.invalidated
- execution_window.updated
- goal.continuation_evaluated
- named_plan.archived
- named_plan.child_refs_changed
- named_plan.created
- named_plan.priority_changed
- named_plan.renamed
- named_plan.restored
- runtime.automation_pause_changed
- runtime.quota_resume_attempted
- runtime.quota_resume_consent_changed
- runtime.quota_wait_started
- scheduled_dispatch.cancelled
- scheduled_dispatch.created
- scheduled_dispatch.dispatched
- scheduled_dispatch.failed
- scheduled_dispatch.held
- scheduled_dispatch.updated
- todo.created
- todo.dependency_changed
- todo.removed_from_current_list
- todo.reordered
- todo.status_changed
- todo.updated
- todo.work_bound
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Automated_Testing_System.md
```

| Exact family | Owner | Payload | Positive plan | Planned negative predicates |
|---|---|---|---|---|
| `assistant_plan.schedule_invalidated` | `APR-1550` / `CV-1550` / `SP-1550` | `Plans/event_payloads/w3h/assistant_plan_schedule_invalidated.schema.json#/$defs/payload` | Commit V3 after scheduling V2; retain the V2 binding, record V3 and the reason, with no build. | 617 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `docker.compose.scenario.deleted` | `CRAU-1551` / `CV-1551` / `SP-1551` | `Plans/event_payloads/w3h/docker_compose_scenario_deleted.schema.json#/$defs/payload` | Use one valid Project scenario with resolved config, validated service/profile/env references and the original deleted result; no other scenario changes. | 582 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `docker.compose.scenario.edited` | `CRAU-1552` / `CV-1552` / `SP-1552` | `Plans/event_payloads/w3h/docker_compose_scenario_edited.schema.json#/$defs/payload` | Use one valid Project scenario with resolved config, validated service/profile/env references and the original edited result; no other scenario changes. | 591 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `docker.compose.scenario.run` | `CRAU-1553` / `CV-1553` / `SP-1553` | `Plans/event_payloads/w3h/docker_compose_scenario_run.schema.json#/$defs/payload` | Use one valid Project scenario with resolved config, validated service/profile/env references and the original run result; no other scenario changes. | 591 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `docker.compose.scenario.saved` | `CRAU-1554` / `CV-1554` / `SP-1554` | `Plans/event_payloads/w3h/docker_compose_scenario_saved.schema.json#/$defs/payload` | Use one valid Project scenario with resolved config, validated service/profile/env references and the original saved result; no other scenario changes. | 582 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `execution_window.created` | `SQR-1555` / `CV-1555` / `SP-1555` | `Plans/event_payloads/w3h/execution_window_created.schema.json#/$defs/payload` | Read one genuine created schedule result with the exact target and original source edition, preserving grace and occurrence identity. | 602 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `execution_window.invalidated` | `SQR-1556` / `CV-1556` / `SP-1556` | `Plans/event_payloads/w3h/execution_window_invalidated.schema.json#/$defs/payload` | Read one genuine invalidated schedule result with the exact target and original source edition, preserving grace and occurrence identity. | 610 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `execution_window.updated` | `SQR-1557` / `CV-1557` / `SP-1557` | `Plans/event_payloads/w3h/execution_window_updated.schema.json#/$defs/payload` | Read one genuine updated schedule result with the exact target and original source edition, preserving grace and occurrence identity. | 602 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `goal.continuation_evaluated` | `GRS-1558` / `CV-1558` / `SP-1558` | `Plans/event_payloads/w3h/goal_continuation_evaluated.schema.json#/$defs/payload` | A host evaluates an unfinished Goal with a genuine next attempt and unchanged epoch; also plan an independently valid complete case backed by caller evidence. | 637 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `named_plan.archived` | `NPLAN-1559` / `CV-1559` / `SP-1559` | `Plans/event_payloads/w3h/named_plan_archived.schema.json#/$defs/payload` | One exact Project+NamedPlan original archived result with unchanged child runtime; duplicate display names in the Project are independently valid. | 605 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `named_plan.child_refs_changed` | `NPLAN-1560` / `CV-1560` / `SP-1560` | `Plans/event_payloads/w3h/named_plan_child_refs_changed.schema.json#/$defs/payload` | One exact Project+NamedPlan original child_refs_changed result with unchanged child runtime; duplicate display names in the Project are independently valid. | 614 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `named_plan.created` | `NPLAN-1561` / `CV-1561` / `SP-1561` | `Plans/event_payloads/w3h/named_plan_created.schema.json#/$defs/payload` | One exact Project+NamedPlan original created result with unchanged child runtime; duplicate display names in the Project are independently valid. | 607 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `named_plan.priority_changed` | `NPLAN-1562` / `CV-1562` / `SP-1562` | `Plans/event_payloads/w3h/named_plan_priority_changed.schema.json#/$defs/payload` | One exact Project+NamedPlan original priority_changed result with unchanged child runtime; duplicate display names in the Project are independently valid. | 605 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `named_plan.renamed` | `NPLAN-1563` / `CV-1563` / `SP-1563` | `Plans/event_payloads/w3h/named_plan_renamed.schema.json#/$defs/payload` | One exact Project+NamedPlan original renamed result with unchanged child runtime; duplicate display names in the Project are independently valid. | 607 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `named_plan.restored` | `NPLAN-1564` / `CV-1564` / `SP-1564` | `Plans/event_payloads/w3h/named_plan_restored.schema.json#/$defs/payload` | One exact Project+NamedPlan original restored result with unchanged child runtime; duplicate display names in the Project are independently valid. | 605 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `runtime.automation_pause_changed` | `SQR-1565` / `CV-1565` / `SP-1565` | `Plans/event_payloads/w3h/runtime_automation_pause_changed.schema.json#/$defs/payload` | User changes the selected Project latch off to on; separately use genuine application Server source with null Project and no fake thread/Computer request fields. | 592 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `runtime.quota_resume_attempted` | `SQR-1566` / `CV-1566` / `SP-1566` | `Plans/event_payloads/w3h/runtime_quota_resume_attempted.schema.json#/$defs/payload` | Use a genuine quota_resume_attempted original source with exact route; separately cover unknown reset truth with no fabricated reset time. | 631 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `runtime.quota_resume_consent_changed` | `SQR-1567` / `CV-1567` / `SP-1567` | `Plans/event_payloads/w3h/runtime_quota_resume_consent_changed.schema.json#/$defs/payload` | Use a genuine quota_resume_consent_changed original source with exact route; separately cover unknown reset truth with no fabricated reset time. | 623 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `runtime.quota_wait_started` | `SQR-1568` / `CV-1568` / `SP-1568` | `Plans/event_payloads/w3h/runtime_quota_wait_started.schema.json#/$defs/payload` | Use a genuine quota_wait_started original source with exact route; separately cover unknown reset truth with no fabricated reset time. | 615 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `scheduled_dispatch.cancelled` | `SQR-1569` / `CV-1569` / `SP-1569` | `Plans/event_payloads/w3h/scheduled_dispatch_cancelled.schema.json#/$defs/payload` | Use one exact frozen message snapshot and genuine cancelled result; no client timer or focused-chat substitution. | 582 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `scheduled_dispatch.created` | `SQR-1570` / `CV-1570` / `SP-1570` | `Plans/event_payloads/w3h/scheduled_dispatch_created.schema.json#/$defs/payload` | Use one exact frozen message snapshot and genuine created result; no client timer or focused-chat substitution. | 582 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `scheduled_dispatch.dispatched` | `SQR-1571` / `CV-1571` / `SP-1571` | `Plans/event_payloads/w3h/scheduled_dispatch_dispatched.schema.json#/$defs/payload` | Use one exact frozen message snapshot and genuine dispatched result; no client timer or focused-chat substitution. | 618 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `scheduled_dispatch.failed` | `SQR-1572` / `CV-1572` / `SP-1572` | `Plans/event_payloads/w3h/scheduled_dispatch_failed.schema.json#/$defs/payload` | Use one exact frozen message snapshot and genuine failed result; no client timer or focused-chat substitution. | 599 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `scheduled_dispatch.held` | `SQR-1573` / `CV-1573` / `SP-1573` | `Plans/event_payloads/w3h/scheduled_dispatch_held.schema.json#/$defs/payload` | Use one exact frozen message snapshot and genuine held result; no client timer or focused-chat substitution. | 599 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `scheduled_dispatch.updated` | `SQR-1574` / `CV-1574` / `SP-1574` | `Plans/event_payloads/w3h/scheduled_dispatch_updated.schema.json#/$defs/payload` | Use one exact frozen message snapshot and genuine updated result; no client timer or focused-chat substitution. | 582 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `todo.created` | `TDR-1575` / `CV-1575` / `SP-1575` | `Plans/event_payloads/w3h/todo_created.schema.json#/$defs/payload` | A validated created result in one current thread, preserving exact item identity and all unaffected edges/work; a separate valid application thread uses null Project. | 594 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `todo.dependency_changed` | `TDR-1576` / `CV-1576` / `SP-1576` | `Plans/event_payloads/w3h/todo_dependency_changed.schema.json#/$defs/payload` | A validated dependency_changed result in one current thread, preserving exact item identity and all unaffected edges/work; a separate valid application thread uses null Project. | 604 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `todo.removed_from_current_list` | `TDR-1577` / `CV-1577` / `SP-1577` | `Plans/event_payloads/w3h/todo_removed_from_current_list.schema.json#/$defs/payload` | A validated removed_from_current_list result in one current thread, preserving exact item identity and all unaffected edges/work; a separate valid application thread uses null Project. | 603 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `todo.reordered` | `TDR-1578` / `CV-1578` / `SP-1578` | `Plans/event_payloads/w3h/todo_reordered.schema.json#/$defs/payload` | A validated reordered result in one current thread, preserving exact item identity and all unaffected edges/work; a separate valid application thread uses null Project. | 604 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `todo.status_changed` | `TDR-1579` / `CV-1579` / `SP-1579` | `Plans/event_payloads/w3h/todo_status_changed.schema.json#/$defs/payload` | A validated status_changed result in one current thread, preserving exact item identity and all unaffected edges/work; a separate valid application thread uses null Project. | 640 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `todo.updated` | `TDR-1580` / `CV-1580` / `SP-1580` | `Plans/event_payloads/w3h/todo_updated.schema.json#/$defs/payload` | A validated updated result in one current thread, preserving exact item identity and all unaffected edges/work; a separate valid application thread uses null Project. | 603 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |
| `todo.work_bound` | `TDR-1581` / `CV-1581` / `SP-1581` | `Plans/event_payloads/w3h/todo_work_bound.schema.json#/$defs/payload` | A validated work_bound result in one current thread, preserving exact item identity and all unaffected edges/work; a separate valid application thread uses null Project. | 631 field/predicate plans; 16 publication-state pairs; execute/prove in phase 2 |

Check 11 proof is intentionally deferred: use the shared tool’s complete site inventory, never a lane proof implementation. A negative carrying stale hashes/copies/post-state is repaired as a fixture defect. Removing one site of a duplicate must retain refusal by its peers for the same field/predicate; removing all must admit it. Every distinct predicate has its own cut and exactly one-defect case. Types, formats, physical byte limits, authentic original-source joins, custody on retry/read/recovery and historical-recipe dispatch all require actual phase-2 cases. The plan does not claim a schema validator enforces unchecked formats.

Phase-1 review round 1 adds each exact family’s explicit inline/SP-337 physical journal materializations, independently authenticated resolved logical EventRecord, route/BLAKE3/exact-size/media checks, complete publication/envelope/receipt guard inventory and all sixteen absent/prepared/appended/settled state pairs. Crash cuts, same-original retries, pending-writer withdrawal, reader withdrawal, retained history and canonical retention dependencies have separate positives. A missing appended first receipt is tested with its valid commitment intact, and vice versa. Runtime copied-key/instance/partition/source joins use independent actual originals; schema-only and byte-authentication cases stop before unrelated later layers. Every illegal edge keeps destination shape/receipt/commitment and expected prior CAS valid so only edge legality fails. This is the phase-2 oracle plan, with no oracle code or guard-removal proof.
