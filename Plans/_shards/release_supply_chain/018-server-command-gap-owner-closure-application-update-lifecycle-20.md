# Shard 018: Server command-gap owner closure - application update lifecycle (2026-09-01)

Source: `Plans/Release_Supply_Chain.md`

Source lines: L1170-L1239

Source SHA256: `a3fc96705ece03e411c6566bdf968b6bae2c89814d9a0550a96bc807632c3e8d`

---

## Server command-gap owner closure - application update lifecycle (2026-09-01)

`ApplicationUpdateService` owns one DRY closed family in `Plans/release_update_contracts.schema.json` for `cmd.update.app.automatic.set_enabled`, `cmd.update.app.cancel_download`, `cmd.update.app.check`, `cmd.update.app.download`, `cmd.update.app.install_restart`, `cmd.update.app.remind_later`, and `cmd.update.app.rollback`. Their sole future handlers are `handlers::application_update::automatic_set_enabled`, `::cancel_download`, `::check`, `::download`, `::install_restart`, `::remind_later`, and `::rollback`. All remain `handler_unavailable` until full central registration, permission/FileSafe routing, named native handler evidence, production wiring, and receipt-or-admitted-event disposition exist.

The exact consumers are Settings > Updates, the bottom Update Available item, Server permanent web UI, and Doctor. Source tokens `cmd.update.app.open_details`, `cmd.update.app.open_logs`, and `cmd.update.app.open_release_notes` are retained only as the adjudicated spellings for `ui.update.app.open_details`, `ui.update.app.open_logs`, and `ui.update.app.open_release_notes`; these are bounded, redacted, lazy local actions with no semantic-domain handler and no domain EventRecord. Automatic update is one simple enabled toggle with no user schedule and never disables manual checks. Check is coalesced, cached, and policy-bounded. Download verifies content, signing, channel, target, compatibility, and artifact hash before retention and cannot activate. Cancel affects only the exact in-progress unverified/verified download operation and never deletes the active generation. Install/restart requires verified artifact and provenance, safe quiescence, recovery boundary, migration preflight, exact install-source owner, restart journal, post-verification, and rollback target. Remind later only defers attention under a bounded policy. Rollback targets a verified retained compatible generation or reports `recovery_required`.

Idempotency and operation/update/catalog generations prevent duplicate or racing check/download/install/rollback effects. Restart converges from the durable update journal; partial install, migration, restart, or verification never becomes success. Exact initiating surface/route/focus/generation is restored or `caller_unavailable` is reported. Requests, results, receipts, logs, notes, and projections contain hashes and non-secret refs only—never signing keys, update credentials, raw tokens, protected authentication state, or unrestricted filesystem paths.

### Application check policy and settlement

The application lifecycle phase vocabulary is `idle/checking/available/downloading/downloaded/verifying/awaiting-user/quiescing/pre-update-backup/installing/restart-required/migrating/post-verify/complete/rollback-available/rolling-back/blocked`. These are domain phases, not replacements for the existing command-result outcome enum and not a requirement that every admitted operation traverse every phase. Phase disclosure preserves the exact operation, installation, source and generation; a displayed phase is never activation or completion proof.

Application and PM content updates remain host-scoped, signed/provenance-checked, staged, version-compatible, restart-aware and rollback/recovery-capable. They do not update every host simultaneously by default. This default neither creates a fleet scheduler nor supplies authority to update any additional host; the exact install-source and content owner gates still apply.

Automatic application checks use a hidden channel-aware policy: Stable checks asynchronously at launch when the last successful check is about 24 hours old; Canary checks at launch/background when about 6–12 hours old; Nightly checks at launch/background when about 1–6 hours old. The Server-owned check uses persisted last-success time, randomized jitter, conditional/cached requests, offline backoff and coalescing. This is the application policy, independent of installed-tool maintenance preferences. Manual Check remains available with automatic checking disabled, under ordinary command/permission admission; neither a frequency picker nor a second scheduler is introduced.

`Plans/application_update_check_contracts.schema.json` materializes this bounded part of RSC-014. `ApplicationCheckScope` binds the original Server, application installation and installation generation, source and source generation, and channel. `ApplicationCheckState` is a proposed durable value, not a registered physical store. Its last successful source validation, cached publication and conditional validator, selected next-due calculation, failure backoff, state revision and in-flight operation belong to that exact scope. Clients consume projections and join the same Server operation; caller-selected coalesce keys do not establish ownership. The Server serializes starts and settlements against the state revision, permitting only one in-flight operation per scope. Repeated result delivery is idempotent only after exact result identity and original settlement read-back; it does not create a new successful check.

The immutable versioned policy selects an interval within Canary's 6–12 hour or Nightly's 1–6 hour bounds, or Stable's approximately 24-hour base, and randomized jitter. Persist the selected interval, jitter, sample reference and computed due time once with the successful-check anchor; restart reuses this choice instead of resampling. Canary/Nightly effective intervals including jitter stay within their respective bounds. Stable uses a 24-hour base with policy-owned jitter; no exact jitter distribution, magnitude or retry cap is prescribed here. A separately admitted policy implementation must define and reproduce its random-sampling and bounded retry rules before native scheduling is available. The finite contract checks arithmetic and range membership, not randomness quality or policy admission.

Missing state has no successful-check anchor: an eligible launch (or Canary/Nightly background opportunity) is due, subject to automatic enablement, permission and shared coalescing. A clock earlier than the last success or last attempt refuses automatic due evaluation until the Server reacquires trustworthy time; it never rewrites success to the new clock. A changed installation/source/channel scope cannot reuse the old cache, validator or success anchor. A policy change requires a new current-policy due selection over the same valid success, retaining that success; an old-policy due decision cannot dispatch. These are fail-closed engineering rules, not new user schedules. Manual checking does not change the automatic setting and may request a fresh check while ordinary admission and source throttling still apply.

`ApplicationCheckAttempt` binds the admitted existing `cmd.update.app.check` invocation (or the Server's admitted internal policy operation), exact scope, policy version, pre-start revision, trigger, operation identity and start time. `ApplicationSourceResult` is a terminal source result, not an accepted/running command receipt. The initial direct-distribution adapter remains GitHub Releases behind `UpdateSource`; transport is not trust. A successful `validated` result contains the immutable publication revision and the RSC-008 `UpdateMetadata` objects (an empty release list is a successful source validation with no published candidates). A `not_modified` result must bind the exact validator submitted for the prior admitted publication and retain that publication unchanged. Both require original source-validation evidence and a completion time no earlier than their attempt. `cache_only`, `offline`, and `failed` never advance last-success or replace the admitted publication. Failure/offline settlement records the versioned policy's selected future retry; local cached display neither creates retry authority nor counts as a successful check.

The companion's `UpdateMetadata` is a typed materialization of RSC-008's existing fields, not a new metadata family. Source publication, signing/provenance and known-bad/compatibility admission remain original UpdateSource/Release responsibilities; copied references, schema-valid metadata, hashes and fixture results cannot authenticate them. Native integration must resolve the original admitted attempt and original source result from those owners, recheck current installation/source/policy and serialize the compare-and-set settlement. A successful check only establishes source currentness: it grants no download, installation, restart, rollback or activation authority. RSC-017's original installation authority remains unchanged.

Physical persistence remains a prerequisite: Storage must register the exact value/key, writer/reader authority, retention, redaction, migration and crash/read-back transaction for state plus successful-result custody before this proposal can become durable. An opaque journal reference, generic Server family or pending storage disposition does not supply that contract. Native source validation, secure transport, installation authority, dispatch, physical persistence and restart/durability proof remain NOT_RUN; all seven command handlers remain `handler_unavailable`. The finite transition fixtures are static contract evidence only.

Source lineage: `/mnt/Cursor/PuppetMaster-Evidence/scratch/shared-checkout-scratchpad-20260924/approval-gated-touch-closure-packet-custody-20260831-001/raw/PKT-08-pm-server-first-backbone-delivery-bundle-final-wan-mvp-2026-08-14/PM_Server_First_Backbone_Delivery_Bundle_FINAL_WAN_MVP_2026-08-14/PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14.zip.contents/PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14/08_UPDATES_BACKUP_RESTORE.md`, lines 12–29, SHA-256 `8a4e0ff692e096373192a1f781bd2c644c0a0c97c72ca4fd12b76c5208ed3eaf`. The source's superseded separate Tailscale sidecar/update scheme is excluded; RSC-015 retains the bundled PM connector.

ContractRef: ContractName:Plans/Release_Supply_Chain.md#RSC-008, ContractName:Plans/Release_Supply_Chain.md#RSC-014, ContractName:Plans/Release_Supply_Chain.md#RSC-017, ContractName:Plans/application_update_check_contracts.schema.json

### RSC-014 - Application Update Command And Local-Projection Closure

```yaml
plan_unit_id: RSC-014
unit_type: requirement
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  ApplicationUpdateService owns seven exact automatic-toggle, cancel, check, download, install/restart, remind-later,
  and rollback commands through one closed family plus three presentation-only local actions. Every command remains
  handler_unavailable until its named sole handler and complete integration exist; verified provenance, recovery,
  generation, restart, rollback, exact-return, and secret-exclusion gates fail closed. Internal channel-aware checks
  retain Stable about 24 hours, Canary 6–12 hours and Nightly 1–6 hours; exact Server/installation/source/channel
  custody distinguishes original successful source validation from failed attempts and cached display.
gui_related: true
gui_classification_reason: Update lifecycle and local details/logs/release-notes projections are visible in four named consumers.
depends_on: [RSC-008, RSC-009, RSC-013]
unblocks: []
acceptance_criteria:
  - The schema and fixtures cover exactly seven command IDs and three local actions with the named handlers and consumers.
  - Local actions have no domain handler or EventRecord and expose bounded redacted content only.
  - Fixtures cover coalescing, cache, download verification, cancel scope, safe install/restart, migration, post-verify, retained rollback, duplicate/race, restart recovery, permission, FileSafe, exact return, and secret negatives.
  - Static validation never claims an update was downloaded, installed, restarted, verified, or rolled back.
  - Application phase disclosure preserves the complete owner vocabulary separately from command outcomes; updates do not target every host simultaneously by default.
  - Application-check fixtures cover due arithmetic and channel bounds, persisted jitter, success versus attempt, conditional validation, scope/policy currentness, coalescing, restart reconstruction, offline backoff and automatic-off/manual availability.
  - Physical storage and original source/installation admission remain prerequisites; static check settlement is not native proof or handler availability.
validation_surfaces: [Plans/release_update_contracts.schema.json, Plans/release_update_contract_fixtures.json, Plans/application_update_check_contracts.schema.json, Plans/application_update_check_contract_fixtures.json, tests/test_pm_application_update_checks.py, focused Server owner-bundle-A validator]
risk_class: application_update_unverified_activation_or_false_success
reasoning_tier: high
context_scope: server_command_gap_application_update
implementation_surfaces: [Plans/Release_Supply_Chain.md, Plans/release_update_contracts.schema.json, future ApplicationUpdateService handler]
node_compile_hint: {mode: application_update_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:server-command-gap-adjudication:rows-157-166]
negative_constraints:
  - Do not expose a user-defined schedule or disable manual checks through the automatic toggle.
  - Do not activate an unverified download or treat partial restart/migration as success.
  - Do not create domain handlers or EventRecords for local details, logs, or release-notes actions.
```
