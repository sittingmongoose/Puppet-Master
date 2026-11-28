# Shard 158: Prepared tier-start setup-check outcome histories (E8-6 B)

Source: `Plans/storage-plan.md`

Source lines: L78831-L78929

Source SHA256: `011a9501490dde39a1b11d82bf67e792cc604044560056d51b58776a6c9b8ca9`

---

## Prepared tier-start setup-check outcome histories (E8-6 B)

### SP-3200 — config.validation.passed: prepared Storage adoption

`config.validation.passed@1.0.0` explicitly adopts CV-3200's exact Project partition, `ea-do-rfc8785-v2` identity, CV-317 producer digest, SP-236 EVENT_VALUE bytes, SP-337 complete-payload transport and SP-286/CV-339 full first-AppendReceipt custody. The immutable operation/result slot cannot settle two outcomes. Storage's own committed record supplies storage_instance_id, sequence, observed/persisted times, frame locator, group_digest, original_segment_ref and first receipt; payload copies cannot supply those facts. Equal-semantic retries return the original complete value and receipt; conflicts append nothing. A pack must have exact bytes/BLAKE3/size/media type and durable index custody before a referencing append.

`retention_policy_ref=RP-RUNTIME-365D@1.0.0` under **DL-086**, extended to this exact family by **E9-2 A**, Jared, signed 2026-11-14 at 15:39 EST (`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-9_20261114.md`, SHA-256 `40195a39ddc086579660c2c2a65d07519e2aed32b4613c3ba5ea385a0cdfeed3`). This is the same failed-family policy: one year (31,536,000 seconds) after the actual canonical Run completes, at most 1,000,000 records per Run and 5,000,000 per Project, with successor rollover and the existing holds. The canonical first durable terminal completion of the original Project/Run supplies the anchor; unresolved completion forbids expiry. Never use this diagnostic’s clock, a child Run or another Project. Source/body/receipt dependencies remain co-retained; existing deletion, compaction and current disclosure fences apply. No new policy, storage_value_registry or event_family_registry row is written. Merge 2 owns admission.

`reader.orchestrator.config_validation_passed.history.v1@1.0.0` adopts the sole generic SP-278 projector/index/checkpoint and ten-field snapshot token, validates all-scope source before filtering, and owns no family projection/cursor (`none_required`). Generic publication advances only by CAS against the captured frontier. A late nonmatching append invalidates the old same-generation token. Current fences revalidate immediately before disclosure. Backups retain the original source, complete first receipt, packs and frozen recipe as one coherent set. Restore/rebuild cannot manufacture absent originals. Retained reads use one independently sealed exact-original receipt and store snapshot with SP-1101 RetainedDispatcher; absent/ambiguous/foreign receipt is unavailable and never minted while reading. Held references remain subject to current disclosure fences. Writer and reader withdrawal/successor order is exactly CV-3200; shared-index preservation does not authorize a withdrawn family reader.

```yaml
plan_unit_id: SP-3200
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  config.validation.passed adopts CV-3200, SP-278, SP-286 and SP-337 with immutable full-value custody, exact Storage-issued metadata and sealed retained dispatch; retention_policy_ref=RP-RUNTIME-365D@1.0.0 under signed E9-2 A / DL-086.
gui_related: false
gui_classification_reason: Storage and deterministic contract validation only.
split_recommended: false
depends_on: ["CV-3200", "SP-278", "SP-286", "SP-337", "SP-1101"]
unblocks: []
acceptance_criteria:
- Storage-issued facts join independently of caller copies.
- A retained read never seals or guesses its own recipe.
- Retention is the existing DL-086 policy under signed E9-2 A; admission remains pending.
negative_constraints:
- No current append before merge-2 admission and the exact existing retention binding under E9-2 A / DL-086.
- No native producer, redb, durability or access-race proof is claimed.
validation_surfaces:
- scripts/pm-setup-validation-events.py
- tests/fixtures/setup_validation_history/controls.json
- scripts/pm-shard-plans.py
- scripts/pm-plan-index.py
risk_class: setup_history_identity_custody_and_replay_drift
reasoning_tier: high
context_scope: event_authority_pnc019_s6v
implementation_surfaces:
- Plans/setup_validation_event_contracts.schema.json
- Plans/setup_validation_event_families.json
- scripts/pm_setup_validation_oracles.py
- scripts/pm-setup-validation-events.py
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage: [Plans/orchestrator-subagent-integration.md#OSI-109, Plans/orchestrator-subagent-integration.md#OSI-680, Plans/Decision_Log.md#DL-086]
preserved_exact_tokens: ["config.validation.passed", "RP-RUNTIME-365D@1.0.0", "E9-2"]
```

### SP-3201 — config.validation.warning: prepared Storage adoption

`config.validation.warning@1.0.0` explicitly adopts CV-3201's exact Project partition, `ea-do-rfc8785-v2` identity, CV-317 producer digest, SP-236 EVENT_VALUE bytes, SP-337 complete-payload transport and SP-286/CV-339 full first-AppendReceipt custody. The immutable operation/result slot cannot settle two outcomes. Storage's own committed record supplies storage_instance_id, sequence, observed/persisted times, frame locator, group_digest, original_segment_ref and first receipt; payload copies cannot supply those facts. Equal-semantic retries return the original complete value and receipt; conflicts append nothing. A pack must have exact bytes/BLAKE3/size/media type and durable index custody before a referencing append.

`retention_policy_ref=RP-RUNTIME-365D@1.0.0` under **DL-086**, extended to this exact family by **E9-2 A**, Jared, signed 2026-11-14 at 15:39 EST (`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-9_20261114.md`, SHA-256 `40195a39ddc086579660c2c2a65d07519e2aed32b4613c3ba5ea385a0cdfeed3`). This is the same failed-family policy: one year (31,536,000 seconds) after the actual canonical Run completes, at most 1,000,000 records per Run and 5,000,000 per Project, with successor rollover and the existing holds. The canonical first durable terminal completion of the original Project/Run supplies the anchor; unresolved completion forbids expiry. Never use this diagnostic’s clock, a child Run or another Project. Source/body/receipt dependencies remain co-retained; existing deletion, compaction and current disclosure fences apply. No new policy, storage_value_registry or event_family_registry row is written. Merge 2 owns admission.

`reader.orchestrator.config_validation_warning.history.v1@1.0.0` adopts the sole generic SP-278 projector/index/checkpoint and ten-field snapshot token, validates all-scope source before filtering, and owns no family projection/cursor (`none_required`). Generic publication advances only by CAS against the captured frontier. A late nonmatching append invalidates the old same-generation token. Current fences revalidate immediately before disclosure. Backups retain the original source, complete first receipt, packs and frozen recipe as one coherent set. Restore/rebuild cannot manufacture absent originals. Retained reads use one independently sealed exact-original receipt and store snapshot with SP-1101 RetainedDispatcher; absent/ambiguous/foreign receipt is unavailable and never minted while reading. Held references remain subject to current disclosure fences. Writer and reader withdrawal/successor order is exactly CV-3201; shared-index preservation does not authorize a withdrawn family reader.

```yaml
plan_unit_id: SP-3201
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  config.validation.warning adopts CV-3201, SP-278, SP-286 and SP-337 with immutable full-value custody, exact Storage-issued metadata and sealed retained dispatch; retention_policy_ref=RP-RUNTIME-365D@1.0.0 under signed E9-2 A / DL-086.
gui_related: false
gui_classification_reason: Storage and deterministic contract validation only.
split_recommended: false
depends_on: ["CV-3201", "SP-278", "SP-286", "SP-337", "SP-1101"]
unblocks: []
acceptance_criteria:
- Storage-issued facts join independently of caller copies.
- A retained read never seals or guesses its own recipe.
- Retention is the existing DL-086 policy under signed E9-2 A; admission remains pending.
negative_constraints:
- No current append before merge-2 admission and the exact existing retention binding under E9-2 A / DL-086.
- No native producer, redb, durability or access-race proof is claimed.
validation_surfaces:
- scripts/pm-setup-validation-events.py
- tests/fixtures/setup_validation_history/controls.json
- scripts/pm-shard-plans.py
- scripts/pm-plan-index.py
risk_class: setup_history_identity_custody_and_replay_drift
reasoning_tier: high
context_scope: event_authority_pnc019_s6v
implementation_surfaces:
- Plans/setup_validation_event_contracts.schema.json
- Plans/setup_validation_event_families.json
- scripts/pm_setup_validation_oracles.py
- scripts/pm-setup-validation-events.py
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage: [Plans/orchestrator-subagent-integration.md#OSI-109, Plans/orchestrator-subagent-integration.md#OSI-680, Plans/Decision_Log.md#DL-086]
preserved_exact_tokens: ["config.validation.warning", "RP-RUNTIME-365D@1.0.0", "E9-2"]
```
