# Shard 041: Expired restore-point evidence admission

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L3029-L3089

Source SHA256: `f53b6ca841f8fce7a4dc9fbcfb9a43cd7bc349b28098ac330d41a3ba8aa4629a`

---

## Expired restore-point evidence admission

`reader.runtime_artifacts.restore_point_expired@1.0.0` presents owner-resolved expired point or genuine terminal hash summary, actual prior hash/identity and precise source/currentness/custody limitations under SP-275. Expired means unavailable for apply/delete, not proof of physical purge. A later-held expired capture remains inspectable; unexplained source loss is unavailable. Expiry requires full fresh eligibility and SP-285 retained-created E1 admission, actual append/receipt and E3 publication through its installed pending route, and independent current source proof. E3 writes no point/hold field and ordinary checkpoint refresh preserves current holds and complete generation history. Native expiry retirement requires the SP-269 v2 writer and exact separately admitted codec2 route above; supported v1 cannot omit required native expiry custody. Direct summary inspection invents no surviving event frame or event cursor. No file/Git/FileSafe restore, deletion, branch, hold clear, source resurrection, runtime/queue action or `runtime_artifact.restore_point` sibling emission follows. Later native inspection explicitly adopts SP-285 retained_native_terminal through reader.storage.restore_point_retained_custody@1.0.0, requiring authenticated retained original custody and full current source without disposed E1/E2/E3/eligibility/nested creation controls or a new SP-274 dependency.

New expiry E1 uses SP-285 retained-created passive_creation with all fresh SP-275 gates and no SP-274 dependency. After actual E1, its installed pending route uses authentic pending custody and SP-286 first receipt without disposed E1/eligibility/nested creation controls; final receipt resolution precedes the final owner-local guard and atomic E3. Passive readers cannot execute recovery.

### RAP-060 — Expired restore-point evidence admission

```yaml
plan_unit_id: RAP-060
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: Runtime Artifacts passively presents expired capture or canonical terminal summary through
  full original SP-275 admission followed by explicitly adopted SP-285 authenticated retained_custody/current-source
  reads, or the independent canonical summary branch. Later holds remain visible custody protection; expired
  does not prove purge. Codec2 is separately installed under SP-269 and cannot grant action or recover
  removed bodies.
  Creation, fresh lifecycle admission, admitted pending recovery and passive retained inspection follow their distinct SP-285 routes.
gui_related: true
gui_classification_reason: Defines visible passive restore-point history, evidence and unavailable states.
split_recommended: false
depends_on:
- SP-275
- ACD-466
- SP-269
- SP-285
- SP-286
unblocks: []
acceptance_criteria:
- Require full original eligibility/E1/E2/E3 receipt/group at admission; later native inspection requires
  SP-285 authenticated retained rows/current source without disposed original controls.
- Keep logical expiry, later custody retirement and source availability distinct in visible evidence.
- Later holds remain intact; native expiry retirement requires coordinated v2 admission and no removed-row
  dependency on terminal inspection.
- Summary inspection cannot invent an event cursor or execute any restore/delete/branch/hold action.
- The explicitly installed SP-285 retained-present route rejects unknown native origin, missing required
  rows and any late registration/install/migration/backup/permission/quarantine/row/source change; an
  unchanged generic token alone cannot authorize disclosure.
- New expiry E1 uses SP-285 retained-created passive_creation with all fresh SP-275 gates and no SP-274 dependency. After actual E1, its installed pending route uses authentic pending custody and SP-286 first receipt without disposed E1/eligibility/nested creation controls; final receipt resolution precedes the final owner-local guard and atomic E3. Passive readers cannot execute recovery.
validation_surfaces:
- Plans/restore_point_expired_contracts.schema.json
- Plans/restore_point_summary_reader_routes.json
- reports/event-authority-20260911/step-08-restore-pair-validation.md
- Plans/restore_point_retained_read.schema.json
- Plans/restore_point_retained_read_result.schema.json
- Plans/restore_point_retained_creation_read.schema.json
- Plans/restore_point_retained_creation_read_result.schema.json
risk_class: restore_point_terminal_custody_or_false_completion
reasoning_tier: high
context_scope: event_authority_step08_restore_pair
implementation_surfaces:
- Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- EA-BINDINGS-285-RESPONSE-001
```
