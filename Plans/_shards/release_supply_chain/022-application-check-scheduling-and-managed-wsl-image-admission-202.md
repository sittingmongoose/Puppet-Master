# Shard 022: Application check scheduling and managed WSL image admission — 2026-09-27

Source: `Plans/Release_Supply_Chain.md`

Source lines: L1468-L1541

Source SHA256: `b28d0c1be496104b047180f4354681eeacd459a3c9124356e8d77a913d600e30`

---

## Application check scheduling and managed WSL image admission — 2026-09-27

ApplicationUpdateService owns the hidden per-channel application check policy under RSC-014. Stable, Canary and Nightly may use different internal intervals; those constants may evolve. Automatic launch checks are asynchronous and do not block startup. A manual Check remains available even when automatic updating is disabled. A fresh successful check with a settled operation receipt advances the persisted last-successful-check timestamp and samples bounded randomized jitter for the next cadence due. A fresh response with no available update is a successful check only when the operation actually queried the source and settled its own receipt. Cache reuse and coalesced joins reuse the existing operation/result and never create a new successful-check basis. A failed, blocked, cancelled or uncertain operation likewise cannot advance it. An offline failure may update a separate bounded retry time with jitter; it preserves the last successful timestamp, receipt, and cadence due. Repeated offline requests coalesce by channel and current operation. A restart loads the durable schedule and does not make an otherwise-undue channel due merely because the process launched.

`ApplicationUpdateCheckScheduleState` in `Plans/release_update_contracts.schema.json` is keyed by Home Server, application and channel. SP-322 owns its durable family and recovery/currentness, while RSC-014's operation journal retains the actual check receipt and unknown-effect reconciliation. The state records policy and state generations, the policy snapshot ref, last successful timestamp and receipt, separate cadence due and offline retry, effective next automatic check time, failure/backoff status and the journal ref. `ApplicationUpdateSchedulingAdvancement` binds the exact before/after state generations and successful-check basis, the operation receipt, dispatch origin, actual execution kind, interval, jitter and bounded backoff. Validation must reject a cache hit or joined result posed as a fresh success; advancing on a failure; moving the cadence due on an offline failure; a stale generation, duplicate operation, wrong channel or Home Server; a due not equal to the accepted time arithmetic; and a restart that discards the stored basis. These typed records are static contracts, not evidence that a scheduler or update handler ran. No user-defined check schedule is exposed, and installed-tool update policy remains with Shared Integration Runtime.

```yaml
plan_unit_id: RSC-019
unit_type: requirement
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  ApplicationUpdateService persists a Server/application/channel successful-check basis and separate jittered
  cadence due and bounded offline retry through SP-322. Only a fresh settled successful source check advances
  the basis; cache reuse, joins, failed and uncertain checks preserve it. Automatic launch checks are
  asynchronous, manual Check remains available, and all intervals are hidden evolvable policy.
gui_related: true
gui_classification_reason: Updates and Doctor project check state without exposing schedule controls.
depends_on: [RSC-014]
unblocks: []
acceptance_criteria:
- A successful fresh check with its durable receipt advances the per-channel last-successful timestamp and recomputes a jittered due; a cached or coalesced no-change result does not.
- Offline failure preserves the last-successful basis and cadence due, persists a bounded jittered retry, and coalesces repeated requests.
- Persisted state survives restart with exact Server/application/channel, policy and state generations; stale or duplicate transitions cannot move it.
- Launch checks are asynchronous, manual Check remains enabled, and numerical cadence remains internal and evolvable.
- Static fixtures do not claim native update execution, durable writes or scheduler timing proof.
validation_surfaces: [Plans/release_update_contracts.schema.json, Plans/release_update_contract_fixtures.json, python3 scripts/pm-platform-execution-policy-verify.py]
risk_class: app_update_retry_storm_or_false_successful_check
reasoning_tier: high
context_scope: application_update_internal_check_policy
implementation_surfaces: [Plans/Release_Supply_Chain.md, Plans/release_update_contracts.schema.json, Plans/storage-plan.md]
node_compile_hint: {mode: update_schedule_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14/08_UPDATES_BACKUP_RESTORE.md#internal-check-policy]
negative_constraints:
- No user-defined schedule or loss of manual Check.
- Do not advance last-successful time from cache reuse, a joined result, an offline failure or a pending/uncertain operation.
- Do not reuse installed-tool update backoff as application check authority.
owner_hints: [Plans/Release_Supply_Chain.md, Plans/storage-plan.md, Plans/Shared_Integration_Runtime.md]
```

PM-managed `.wsl` distributions use the two acquisition paths in CRAU-101. Release admits a PM-managed image only after an exact signed/versioned bundle, publisher/trust root, hash, source/provenance, license, architecture, channel, known-bad and compatibility proof binds the chosen distro version to the requested Windows Host/WSL2 target. CRAU consumes the completed Release admission receipt and passes the exact image/version to the existing Shared Integration Runtime installation lifecycle. A caller-provided signature field, version string, catalog row or successful download is never the admission receipt. Release does not update Windows WSL itself and does not gain authority over an attached user-owned distribution. Repair and rollback for a PM-managed image require a verified compatible target and the existing lifecycle/recovery receipts; destructive reset/delete remains explicitly confirmed by CRAU policy. A missing or mismatched proof returns unavailable/blocked and leaves native Windows healthy.

```yaml
plan_unit_id: RSC-020
unit_type: requirement
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  A PM-managed signed/versioned .wsl distribution is admitted by Release proof for the exact image and
  Windows/WSL2 target before Shared Integration Runtime acquisition. Containers consumes the admission receipt;
  attached user-owned distributions and Windows WSL itself remain outside PM image update authority.
gui_related: false
gui_classification_reason: Defines artifact admission and owner boundaries without presentation requirements.
depends_on: [RSC-008, CRAU-101, SIR-032]
unblocks: []
acceptance_criteria:
- Managed distro acquisition refuses missing, stale, mismatched or known-bad Release admission even if caller metadata claims a signature.
- Image update, repair and rollback bind exact retained verified versions; removal/reset respects ownership and confirmation.
- User-owned attach never converts into PM image ownership; WSL Off and failed optional acquisition do not degrade native Windows.
- Static schema fixtures do not claim a distro was installed, signed, repaired or tested natively.
validation_surfaces: [Plans/wsl_execution_contracts.schema.json, Plans/wsl_execution_contract_fixtures.json, python3 scripts/pm-platform-execution-policy-verify.py]
risk_class: untrusted_wsl_image_or_cross_owner_repair
reasoning_tier: high
context_scope: managed_wsl_distribution_release_admission
implementation_surfaces: [Plans/Release_Supply_Chain.md, Plans/Containers_Registry_and_Unraid.md, future Release artifact verifier]
node_compile_hint: {mode: release_admission_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14/06_CROSS_PLATFORM_EXECUTION_AND_BROWSER.md#optional-wsl]
negative_constraints:
- No user-owned distro update, conversion, reset or deletion follows from managed-image proof.
- No Windows WSL ownership or independent WSL update engine is created by Release.
owner_hints: [Plans/Release_Supply_Chain.md, Plans/Containers_Registry_and_Unraid.md, Plans/Shared_Integration_Runtime.md]
```

ContractRef: ContractName:Plans/Release_Supply_Chain.md#RSC-014, ContractName:Plans/Release_Supply_Chain.md#RSC-019, ContractName:Plans/Release_Supply_Chain.md#RSC-020, ContractName:Plans/Containers_Registry_and_Unraid.md#CRAU-101, ContractName:Plans/storage-plan.md#SP-322
