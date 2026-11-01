# Shard 047: DL-270 storage health, record inspector and chat paging wiring

Source: `Plans/Wiring_Matrix.md`

Source lines: L7106-L7244

Source SHA256: `b5fa4a1d682da5a3fedce565b8054cd33be33ecfe9b02fcf61f19e380f448bd0`

---

## DL-270 storage health, record inspector and chat paging wiring

| Producer | Command | Disposition and target |
|---|---|---|
| settings.storage_retention.open, Settings > Advanced > Storage & Retention | `cmd.settings.open_storage_retention` | Existing row. The destination gains the Storage health section (SP-340); the section is a read-only projection, not a row. |
| Storage health > Reclaim space | `cmd.storage.compaction.request` | Existing row settings.storage_retention.compaction_request, shown as Reclaim space in Storage health (no settings row is relabelled); one action for the whole storage instance, with the result shown per storage group (store compaction is redb `compact()`). No second reclaim or compact command. |
| Storage diagnostics > Value row > Open value, which is the record inspector's entry (F3-666) | `cmd.storage.open_value` | Existing row storage.value.open gains the record-tab, decoded-field, redaction and viewer-mode checks. No new inspector command. |
| Any other control that opens a record in the inspector (a Ledger row, a log or audit row, a Raw view, Show raw data) | `cmd.storage.open_value` | One row per interactive element, each with its own ui_element_id, location and disabled projection and the same command and handler. Added by the owner document that defines the control; none is added here. |
| Chat history > Load 50 older (the fallback row), and the history list's near-top auto-load | `cmd.chat.load_older` | New production-intent row assistant.chat.history.load_older; sole future handlers::chat::load_older. One request fetches one sealed 50-item page from the render-page store. |
| Opening a chat thread | `cmd.chat.open_thread` | Existing row catalog.chat_open_thread gains the check that opening reads thread_head, the hot tail and the newest page and never replays events. |
| Expanding a collapsed section or tool output | `cmd.chat.toggle_message_details` | Existing row catalog.chat_toggle_message_details gains the check that the body loads on demand from the event log or payload store. |
| Last verified backup and what a restore would lose (Backup manager, Project and Server cards) | none (read-only projection) | No row. Refreshed by a completed `cmd.backup.verify`; catalog.backup_verify gains the reverse-consumer check. |
| Usage Ledger rows and drill-through | `cmd.usage.export`, `cmd.nav.open_usage_subject` | Existing rows gain the check that they resolve through the indexed ledger projection, never a raw scan or usage.jsonl (UF-108). |

`pm db dump`, `pm inspect`, `pm tail` and `pm export` are command-line tools, not UICommands, and have no row here; bulk export stays with `pm export`; copying one shown, redacted record as JSON is part of the record tab under `cmd.storage.open_value` (F3-666), with no row of its own. No new event is proposed: the new row is receipt-only, and the reclaim result rides the existing storage_maintenance_operation row and storage.compaction_lifecycle_changed event.

### WM-098 - Storage Health, Record Inspector And Chat Paging Wiring

```yaml
plan_unit_id: WM-098
unit_type: integration_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  DL-270 (SP-338, SP-339, SP-340, ACD-242, BRS-031) adds one production-intent row to
  Plans/Wiring_Matrix.production.json and amends eight existing ones; it adds no EventRecord, no peer reclaim,
  compact or inspector command and no Touch row. assistant.chat.history.load_older dispatches cmd.chat.load_older
  (sole handler handlers::chat::load_older) from the Load 50 older button and the history list's near-top threshold,
  one request fetching one sealed 50-item page from the thread's render-page store. Reclaim space is the existing
  settings.storage_retention.compaction_request and keeps cmd.storage.compaction.request; the Storage health section
  is reached through settings.storage_retention.open. Storage health (about eight user-facing storage groups, each with one budget; usage against disk budget, reclaimable bytes,
  last compaction), the Last verified backup line and the restore-loss line are read-only projections with no
  command and no row (UIW-046). The record inspector opens a record through the existing cmd.storage.open_value; each
  further control that opens a record in it is its own element row on that command and handler, added by the owner
  document that defines the control. catalog.chat_open_thread reads thread_head, the hot tail and the newest page and
  never replays events; catalog.chat_toggle_message_details loads a body on demand; a completed cmd.backup.verify
  refreshes the Last verified backup line; the Usage Ledger rows resolve through an indexed projection. pm db dump,
  pm inspect, pm tail and pm export are command-line tools and have no row. Every row keeps its planned-handler and
  unavailable-candidate boundary: these are product wiring requirements, not native dispatcher, handler or storage
  evidence.
gui_related: true
gui_classification_reason: Wires the visible Storage health actions, the record inspector entry and the chat Load 50 older control.
split_recommended: false
depends_on: [DL-270, SP-338, SP-339, SP-340, ACD-242, BRS-031, UF-108, UCC-212, CS-107, WM-096]
unblocks: []
acceptance_criteria:
  - "The Load 50 older control has one command, one sole handler, a disabled reason from the closed set and a reverse consumer."
  - "Reclaim space reuses cmd.storage.compaction.request; no second reclaim or compact command is registered."
  - "Storage health and the Last verified backup line are projections with no production row."
  - "Opening a thread and loading older pages never replay events, and the Load 50 older control is required, not optional."
  - "The inspector opens through cmd.storage.open_value and writes no mirror file."
validation_surfaces:
  - "python3 scripts/pm-plans-verify.py validate-wiring-matrix"
  - "python3 scripts/pm-new-contracts-verify.py"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: storage_wiring_projection_vs_command_drift
reasoning_tier: high
context_scope: dl270_storage_wiring
implementation_surfaces:
  - "Plans/Wiring_Matrix.md"
  - "Plans/Wiring_Matrix.production.json"
node_compile_hint:
  mode: static_wiring_intent_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
preserved_exact_tokens:
  - "cmd.chat.load_older"
  - "cmd.storage.compaction.request"
  - "cmd.storage.open_value"
  - "Load 50 older"
  - "pm db dump"
negative_constraints:
  - "Do not register a second reclaim, compact or inspector command."
  - "Do not give a read-only projection a production row or a fabricated command."
  - "Do not claim native or event admission from production-intent wiring."
owner_hints:
  - "Plans/Wiring_Matrix.md"
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-270, ContractName:Plans/storage-plan.md#SP-340, ContractName:Plans/UI_Command_Catalog.md#UCC-212, ContractName:Plans/UI_Wiring_Rules.md#UIW-046


### WM-099 — Footage auth and Free Models route producers

```yaml
plan_unit_id: WM-099
unit_type: integration_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'WM-099. DL-272: onboarding.free_models.route.disable is the shared Free Models row’s Turn off control,
  including the Settings-guided rerun of that same renderer. It dispatches cmd.free_models.route.disable to handlers::models::disable_free_route
  using CS-108’s typed request/result; native dispatch remains unavailable until its owner exists. CS-108’s typed request
  and result own the payload contract. Existing catalog.auth_profile_sign_in handles the native-Client protected Sign
  in and browser fallback with exact Client/control-network/return identity; connector writes remain RAS-015’s owner.
  Pair approval, repository/name retry, endpoint checks, proxy configuration file and download/copy keep their existing
  owners and local action dispositions; no second handler or event is introduced.'
gui_related: true
gui_classification_reason: Defines user-visible setup/feedback or its exact owner-routed control.
split_recommended: false
depends_on:
- DL-272
- MS-121
- MA-045
unblocks: []
acceptance_criteria:
- 'DL-272: onboarding.free_models.route.disable is the shared Free Models row’s Turn off control, including the Settings-guided
  rerun of that same renderer. It dispatches cmd.free_models.route.disable to handlers::models::disable_free_route using
  CS-108’s typed request/result; native dispatch remains unavailable until its owner exists. CS-108’s typed request and
  result own the payload contract. Existing catalog.auth_profile_sign_in handles the native-Client protected Sign in
  and browser fallback with exact Client/control-network/return identity; connector writes remain RAS-015’s owner. Pair
  approval, repository/name retry, endpoint checks, proxy configuration file and download/copy keep their existing owners
  and local action dispositions; no second handler or event is introduced.'
validation_surfaces:
- python3 scripts/pm7-canon-check.py
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: owner_identity_and_truthful_feedback
reasoning_tier: high
context_scope: pm7_footage_review_20261101
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Lead BATCH-FOOTAGE-REVIEW.md, 2026-11-01
- Concepts/onboarding/opus-5.5 at7d2dd568be76874ff8b4d3e82bad3701226d248c (source lineage only)
preserved_exact_tokens:
- WM-099
- cmd.free_models.route.disable
negative_constraints:
- Do not infer native handlers, trust, success, credential authority or governance readiness from a concept or static
  fixture.
owner_hints:
- Plans/Wiring_Matrix.md
```
