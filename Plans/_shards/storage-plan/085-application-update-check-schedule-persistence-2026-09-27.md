# Shard 085: Application update check schedule persistence — 2026-09-27

Source: `Plans/storage-plan.md`

Source lines: L27205-L27246

Source SHA256: `239ad160d0e65de6efd06391e9f8f03af3537708d9149ea4cb7a0bacb7081905`

---

## Application update check schedule persistence — 2026-09-27

The Release-owned `ApplicationUpdateCheckScheduleState` is durable Server-local scheduling state, separate from installation lifecycle records, tool update policy, content catalogs and the verified-artifact/restart journal. Storage binds `Plans/release_update_contracts.schema.json#/$defs/ApplicationUpdateCheckScheduleState` to the exact redb family `application_update_check_schedule`, key `application_update_check_schedule.v1:{home_server_id}:{application_id}:{channel_id}`. `ApplicationUpdateService` is the sole producer; its scheduler, manual Check coalescer and restart recovery consume this same state. GUI consumers receive bounded projections and cannot edit the cadence, jitter, success timestamp or backoff fields.

A successful owner check atomically advances the last-successful timestamp and operation binding, state generation and policy-bound next due time with its sampled jitter. A failed, offline, cancelled, cache-hit or coalesced attempt cannot advance that successful-check basis. It may atomically update the exact retry/attempt state according to the Release owner. State generation uses compare-and-swap; concurrent checks re-read or join the existing operation rather than overwrite a newer success. Startup loads the persisted record before computing due work; neither process restart nor a GUI refresh is a successful check. Scheduler time comparisons, policy changes, backoff caps and manual-check availability remain Release semantics.

StorageMigrationCoordinator owns first enrollment and future version conversion under the existing store-version/backup/reopen-readback rules, never lazy rewrite-on-read. The registry materializes the closed owner value schema and field census; this is static schema registration, not native writer admission. Current-key state plus bounded predecessor history uses `RP-CONFIG-CURRENT`; compaction preserves the current value and any stronger migration/recovery/audit hold. The state belongs to its exact Server/application/channel and is not copied as Project settings or restored onto another Server identity. Backup preserves its exact canonical bytes for same-identity recovery. Missing/corrupt recovery state is disclosed, never synthesized as a successful check; a verified fresh owner initialization uses null successful-check fields and a policy-bounded initial due time, preventing a restart request storm. Manual Check remains separately available under its ordinary owner gates.

No raw catalog content, provider secrets, signing keys, protected browser state or local absolute paths are stored in this scheduling family. Operation, policy and source evidence are bounded non-secret refs. Events remain unadmitted until Event Authority registers them; no new event is implied by the durable state. Schema/key/currentness/retention consistency is checked with the packet-repair contract gate, separately from unavailable native scheduler, disk/restart and recovery proof.

### SP-322 - Durable application update successful-check basis

```yaml
plan_unit_id: SP-322
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Storage binds Release's ApplicationUpdateCheckScheduleState to one Server/application/channel redb scheduling family.
  Success timestamp, operation, state and policy generations, jittered due and offline retry state are durable and
  atomically updated under owner semantics. Failed/cache/coalesced/cancelled checks and restart never become successful
  checks. Current state and held history survive compaction and same-identity backup recovery; missing state remains
  unknown until verified fresh initialization, and GUI or Project copy cannot own or clone the schedule.
gui_related: false
gui_classification_reason: Defines durable scheduler state and transaction/recovery semantics, not presentation.
depends_on: [RSC-014, SP-233]
unblocks: []
acceptance_criteria:
  - Exact Server/application/channel key and closed owner value schema agree with the registry field census.
  - Successful timestamp and next due advance atomically; concurrent or failed checks cannot overwrite a newer success.
  - Restart reads durable state, corruption is disclosed, and fresh initialization cannot fake a previous successful check.
  - Retention preserves current state and stronger holds; Project copying and different-Server restore do not copy scheduling authority.
validation_surfaces: [Plans/storage_value_registry.json, Plans/release_update_contracts.schema.json, Plans/release_update_contract_fixtures.json, scripts/pm-new-contracts-verify.py]
risk_class: update_schedule_restart_storm_or_false_success
reasoning_tier: high
context_scope: application_update_check_schedule_storage
implementation_surfaces: [Plans/storage-plan.md, Plans/storage_value_registry.json, future ApplicationUpdateService durable adapter]
node_compile_hint: {mode: durable_update_schedule_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:packet-sweep-20260927:EPOL-F04, Plans/Release_Supply_Chain.md]
preserved_exact_tokens: [ApplicationUpdateCheckScheduleState, application_update_check_schedule, RP-CONFIG-CURRENT]
negative_constraints: [Do not overload InstallationLifecycleManager state., Do not expose a user schedule picker., Do not treat static materialization as native persistence evidence., Do not advance successful-check time from failed or cached checks.]
```
