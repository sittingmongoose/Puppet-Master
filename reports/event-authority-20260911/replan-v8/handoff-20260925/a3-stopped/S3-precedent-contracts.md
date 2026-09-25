# S3 — Precedent shape of a current goal_run v3 Event Authority contract, and a checklist for goal_run.stopped

Label: S3-precedent-contracts. Written 2026-09-25, read-only against `origin/main` `63cf2cb97f936c91dd7bb5c585d9a35d8409ed61`. A1 branch `origin/plans/replan-v8-a1-20260925` (`74c79b5bf`) and the process answers branch `origin/plans/replan-v8-process-answers-20260925` are read as pending context only. Every line number below is an `origin/main` line unless it says otherwise. Quotes are short and verbatim.

Live identities at this base:
- `Plans/event_family_registry.json`: SHA-256 `0be544181eda423dcea4d8661206e7da6d066fdcf51913d5962f1a283635c842`, `registry_revision` `2026-09-11.2` (line 5), 42 rows. This is the checkpoint Jared approved on 2026-09-23 (`scripts/pm_pnc019_currentness.py` 43-51).
- The goal_run.stopped row is `#/families/5`, lines 242-283, `family_revision` `2.0.0`. Its row hash is `8acbc2495110aa3ee37fe7469603fe6240250f0a2a4bd756f8973dedc549e0a3`, computed with the DL-077 recipe: sorted keys, separators `(',', ':')`.
- `Plans/storage_value_registry.json`: SHA-256 `32d267dd4f06f3dbec4b5319b49bff94c909c600d87c2a6dbed11e07e74c0f46`, 294 families and 27 retention policies. A1 is pending and would make it 328 by appending `/families/294-327`.
- The current stopped payload is `Plans/event_payloads/goal_runtime/goal_run_stopped.schema.json`, SHA-256 `043212b8…5297`, `$id` `pm.goal_runtime_event.goal_run_stopped.schema.v2`.

---

## 1. How each precedent landed (commits, units, files)

Every precedent landed in two phases. The producer or source phase came first and defined the v3 payload schema file and the native writer's custody. The consumer and adoption phase came second and switched the registry row, added the projection and checkpoint Storage families, and wrote the reader and projector owner units.

| Family | Producer/source landing | Consumer/adoption landing (registry row switch) | Plan units added |
|---|---|---|---|
| goal_run.started | `953634d12` (2026-09-14): `Plans/executor_cancellation_contracts/**`, including `schemas/goal-run-started.v3.schema.json`, and `Plans/executor_cancellation_schema_resources.json` | `e686963ad` (2026-09-14) | producer: EP-118, EP-119, SP-309, BRS-025; adoption: GRS-079, EP-120, SP-311, BRS-027 |
| goal_run.cancelled | same `953634d12` (`schemas/goal-run-cancelled.v3.schema.json`) | `a3c511657` (2026-09-14) | adoption: GRS-080, EP-121, SP-312, BRS-028 |
| goal_run.certified | `0f57dbf60` (2026-09-23): `Plans/workflow_standard_source_contracts/**`, including `schemas/goal-run-certified.v3.schema.json` | `f6350caf2` (authored 2026-09-21, committed 2026-09-23) | source: ATS-055, CV-350, EP-122, GRS-082, SP-314; integration: ATS-056, ATS-057, BRS-029, CV-351, CV-352, EP-123, EP-124, GRS-083, GRS-084, GRS-085, SP-315, SP-316, SP-317 |

Commands used to get this: `git show --format= <c> -- 'Plans/*.md' ':!Plans/_shards/**' | grep '^+plan_unit_id: '`.

Files the adoption commits touched, leaving out `_shards` and `.plan_index`:
- **started, `e686963ad`:** `Backup_Restore_System.md`, `Executor_Protocol.md`, `Goal_Runtime_System.md`, `storage-plan.md`, `event_family_registry.json` and `storage_value_registry.json`. It added `goal_run_started_consumer_contracts/{consumer.schema.json,methods.json,physical-families.json}` and `goal_run_started_consumer_schema_resources.json`. Reports: `step-08-goal-run-started-v3-{checks.json,validation.md}`.
- **cancelled, `a3c511657`:** the same owner documents and both registries. It added `goal_run_cancelled_consumer_contracts/{consumer.schema.json,cancelled-causal-arguments.schema.json,goal-arguments.schema.json,filesafe-arguments.schema.json,methods.json,physical-families.json}` and `goal_run_cancelled_consumer_schema_resources.json`. Reports: `step-08-goal-run-cancelled-v3-{checks.json,validation.md}`.
- **certified, `f6350caf2`:** additionally `00-plans-index.md` (two new sections), `Automated_Testing_System.md` and `Contracts_V0.md`. It added `goal_certified_event_coordinator_contracts/**`, `goal_certified_producer_source_contracts/**`, `goal_run_certified_consumer_contracts/**` (listed in §3), `goal_certified_family_composition.json`, `goal_certified_original_scope_dispatch.json` and `workflow_standard_source_contracts/native-v7/**`.

Follow-up commits that the adoptions made necessary. These are separate landings that the stopped contract should fold in or plan for:
- `c7b136ad2` (2026-09-23) re-froze the hash of the 40-row upstream prefix after "six landed goal v3 adoptions". It touched `scripts/pm_emit_only_event_contract.py`, `tests/test_pm_emit_only_event_boundaries.py`, `tests/test_pm_github_project_integration.py`, `tests/test_pm_testing_session_events.py`, `Plans/testing_session_event_admission.json` and `Plans/github_project_event_admission.json`.
- `855eea9aa` (2026-09-23) re-pinned the fixed goal_run payload paths in `scripts/pm-implementation-readiness.py` (484-494, 5465-5473) and the Storage census counts.
- The 42-family checkpoint approval, `reports/event-authority-20260911/step-08-checkpoint-2026-09-11.2.{md,json}`, which added the `pm_pnc019_currentness.py` provenance comment.
- `df9ca6979` (2026-09-25) added the routing note to Goal_Runtime_System.md at 2657 for the certified row's stale anchors.

## 2. The owner units in a full v3 contract

These are the roles each precedent unit plays, taken from the unit text.

| Doc | Role | started | cancelled | certified |
|---|---|---|---|---|
| GRS | Event semantics: exact row adopted, v3 envelope, event-specific fields, idempotency recipe, projection role and read roles, NOT_RUN boundary | GRS-079 (7435-7496) | GRS-080 (7498-7565) | GRS-084 (identity, passive reads), GRS-085 (projection, 7875-7942) |
| EP | Native producer, and the join between the Event and native custody | EP-118/119 (producer), EP-120 (8328) | EP-121 (8385) | EP-122/123/124 (v7 birth, coordinator phases) |
| SP | Reader and projector protocol, physical families and keys, generation and frontier, registry delta counts | SP-309 (producer custody), SP-311 (25958-26065) | SP-312 (26066-26231) | SP-314/315, SP-316 (7 authority families), SP-317 (projection pair) |
| BRS | Recovery and disclosure tied to source lifetime, optional derived backup | BRS-025, BRS-027 (1581) | BRS-028 (1638) | BRS-029 (1701) |
| CV | Schema-root and resource-bank closure | none (CV-341/347 cover goal.*) | none | CV-350/351/352 (23408) |
| ATS | Acceptance facets, positive and negative | none | none | ATS-055/056/057 (CF-01..CF-12, 5059) |
| 00-plans-index | Ownership summary section | no | no | two sections |

What the precedent units all share:
- Each unit opens by naming the one registry row it changes and preserves the rest. GRS-079 at 7437: "Registry membership remains 42; the other 41 complete rows… are unchanged". GRS-080 at 7500 reads the same way.
- Each unit keeps the v2 payload file and its meaning byte-exact as history.
- Each unit states what stays NOT_RUN: native installation, codec, transaction, crash, backup, Event depth and readiness.
- The YAML is `node_compile_hint.mode: owner_contract_only` (started, cancelled) or `source_contract_only` (certified), with `create_worknodes: false` and `create_nodeseeds: false`.
- `validation_surfaces` lists the companion files and both registries.
- Started and cancelled cite `source_lineage` as in-repo units. Certified cites it as `…:sha256:` evidence pins.

## 3. Companion files

These are the smallest set (started) and the fullest set (certified).

**started (SP-311, 26176-26180):**
- `consumer.schema.json`: whole consumer `$defs`, including StorageProjection, Checkpoint, DurableGenericToken, ScopeRequest and the result types.
- `methods.json`: status `canonical_source_contract_native_installation_not_run`. It has 5 methods `owner.goal_run.started.<m>.v1`, each with request, success and unavailable schema refs, `effects` and `protocol`.
- `physical-families.json`: the table, key, schema, producer, owner and retention for the projection and the checkpoint.
- `…_schema_resources.json`: `schema_id`, `network_fallback`, `realms` (the native and Goal realms, isolated from each other), `same_id_conflict_rule` and `qualification_boundary`.

**cancelled:** the same set, plus separate argument schemas for the causal, Goal and FileSafe arguments. There are 6 methods. The successor keeps "Its original 20 consumer definitions" (SP-312 26070).

**certified, `goal_run_certified_consumer_contracts/`:**
- `protocol.md`: P0-P8.
- `methods.json`: 12 methods, `all_arguments_required: true` and `unavailable_is_not_lifecycle_state: true`.
- `schemas/consumer.v1.schema.json`.
- `companions/`: native-v7 copies of the started and cancelled consumer schemas.
- `companion-differences.json`.
- `commitment-domains.json`: domain strings for the anchor, frontier, row, coverage, gaps and identity.
- `dependencies.json`.
- `imports.json`.
- `installed-profile.json` plus `installed-profile-digest.txt`: profile `goal_run_started_cancelled_certified_projector.v1` with `native_writer_roster_changed: false`.
- `owner-sources.json`: each owner doc path pinned with its SHA-256 and `base_commit`.
- `source-citations.json`: 13 facts, each quoting whole lines with `whole_sha256`.
- `physical-retention-install.json`.
- `resource-realms.json`: 12 isolated realms.
- `source-method-composition.json`.
- `source-variants.json`.

The certified family also has a composition file, `Plans/goal_certified_family_composition.json` (with `registry_selection`, `members` and the pinned registry SHA 0be54418), and `goal_certified_original_scope_dispatch.json`.

**Where the v3 payload schema lives.** It never lives in `event_payloads/goal_runtime/`. It lives in the producer's source-contract directory: `executor_cancellation_contracts/schemas/goal-run-{started,cancelled}.v3.schema.json` and `workflow_standard_source_contracts/schemas/goal-run-certified.v3.schema.json`. The v2 file stays in place unchanged.

## 4. Registry rows

### 4a. event_family_registry: one row revision, membership unchanged

`family_revision` goes from `2.0.0` to `3.0.0`, and `payload_schema_id` and `payload_schema_ref.{path,schema_id}` move to v3. `event_type`, `scope_policy`, `legacy` and `retention_policy_ref` stay unchanged. There are two ways the precedents handled the owner anchors:
- **started and cancelled** (`git show e686963ad -- Plans/event_family_registry.json`) set `semantic_owner_doc` to `Plans/Goal_Runtime_System.md#GRS-079` and `payload_owner_doc` to `Plans/storage-plan.md#SP-311`. They appended to `source_refs` (the v3 schema, GRS, EP, SP, BRS and the three companion files) and kept the v2 refs.
- **certified** (`f6350caf2`) kept the v2-era anchors and replaced `source_refs`. Depth42 then graded its `owner_doc` PARTIAL: "Both anchors are stale for v3". `df9ca6979` then added the routing note at GRS 2657.
- For goal_run.stopped, follow the started/cancelled way (see §9).

`registry_revision` did not change in any of the three row revisions. It stayed `2026-09-11.2` with 42 rows, and only the SHA changed: `f24eaa72…` after started, `1972a6aa…` after cancelled, `0be54418…` after certified. Because the revision and the count stay the same, `pm_pnc019_currentness.py` does not fail on its constants (its check is at 262-300). The approved checkpoint is a specific SHA, though (step-08-checkpoint JSON `approved_checkpoint.registry_sha256`). That is why Q-02 requires a card per landing.

### 4b. storage_value_registry: a new pair of derived families for each projection successor, appended at the end

| Pair | Rows (line) | value_schema_id | Key shape | Owner |
|---|---|---|---|---|
| goal_run_started_projection / _checkpoint | #278/279 (111058/111180) | pm.goal_run_projection.started.v3 / pm.goal_run_started_checkpoint.v1 | goal_run_projection.v3:K(project_id):K(goal_run_id) / goal_run_started_checkpoint.v1:K(storage_instance_id):K(project_id):K(goal_id):K(goal_run_id) | SP-311 |
| goal_run_started_cancelled_projection / _checkpoint | #280/281 | …started_cancelled.v4 / …started_cancelled_checkpoint.v1 | goal_run_projection.v4:… / goal_run_started_cancelled_checkpoint.v1:… | SP-312 |
| goal_run_started_cancelled_certified_projection / _checkpoint | #292/293 (112623/112794) | …started_cancelled_certified.v5 / …checkpoint.v1 | goal_run_projection.v5:… / …checkpoint.v1:… | SP-317 |

Every row has 26 fields:
- `family_id`, `storage_kind` (`redb_projection` or `redb_checkpoint`), `status` (`materialized`) and `tier` (`later_gui_or_feature_projection`).
- `key_shape`, `compatibility_key_shapes`, `value_schema_id`, `value_schema_ref` and `owner_doc`.
- `producer`, `consumers`, `schema_version`, `encoding` (`messagepack_canonical`), `required_fields`, `optional_fields` and `nullable_fields`.
- `replay_behavior`, `migration` and `migration_disposition` (`rebuild_on_schema_change`).
- `restore_disposition` (`rebuild_from_authority`, citing BRS), `retention_compaction`, `retention_policy_ref` (`RP-PROJECTION-3GEN`) and `redaction_no_secret_rule`.
- `legacy_canonical_crosswalk_status`, `recovery_disposition` (`derived_rebuildable`, `rebuild_from_seglog`, `source_family_ids`) and an embedded `value_schema`.

The producer side can add authority families too. Started had four compact start families (SP-309, Candidate/Commit/Control/Origin, RP-AUTHORITY-INDEFINITE). Certified had seven (`goal_certified_event_*`, SP-316, rows #285-291).

Count wording: each unit states its baseline and its delta. SP-312 at 26174: "Apply two additions to that actual whole baseline… Counts qualify only that stated baseline and must be re-adjudicated if other authorized additions land."

## 5. The v3 envelope

This is the same in all three v3 schemas. `required` holds 21 names, and `additionalProperties: false`.
- Kept: `event_name` (const), `schema_version` (const = the v3 `$id`), `occurred_at_utc`, `project_id`, `goal_id` and `goal_revision` (the unchanged original Goal context). Also kept: `actor_ref`, `execution_role`, the requested and effective provider, model and account refs, `correlation_id`, `evidence_refs`, `artifact_refs` and `payload`, with `thread_id`, `approval_refs`, `block_refs` and `causation_event_ref` optional.
- Added and required: `expected_goal_run_revision` and `goal_run_revision` (integer, minimum 1), which equal the native before-revision and before+1 (GRS-079 7439; GRS-080 7504). `idempotency_key` also becomes required.
- Removed: `expected_goal_revision` and `parent_goal_id`. GRS-080 at 7504: "An expected Goal revision from v2 is not silently reinterpreted as the Workflow clock."
- The event-specific `payload` fields are unchanged from v2 (GRS 2657 routing note).
- The v2 stopped schema requires `expected_goal_revision` and allows `parent_goal_id`, so it has the v2 shape. Its `event_payload` requires `goal_run_id`, `stop_reason_code` (a 10-value enum), `child_settlement_refs` and `resumable`, allows `safe_point_ref`, and has `allOf` if `resumable=true` then `safe_point_ref` is required.

## 6. Idempotency and event ID: two recipes in the precedents

1. **started and cancelled:** a JCS recipe owned by SP-309 and GRS-079/080. `pm.goal-runtime-event.v3:` + lowercase SHA-256 of RFC 8785 JCS of `["pm.goal-runtime-event-idempotency.v3", scope_partition, "<event_type>", project_id, goal_id, goal_revision, expected_goal_run_revision, goal_run_revision, goal_run_id, <event-specific identity fields>]`. The started tail is `workgraph_ref, activation_receipt_ref` (GRS 7443). The cancelled tail is `"user_cancelled", mutation_started` (GRS 7508). Storage owns `scope_partition`, and the inner and outer keys are byte-equal. The producer semantic digest (the shared CV EventRecord recipe, SP-309) is a separate domain. There is no explicit per-family event_id formula; `event_id` follows Contracts_V0 1008 and 1028.
2. **certified:** an LP recipe (coordinator `protocol.md` line 13). K = `goal_run.certified.v3:` followed by LP(each of 5 tuple values), where LP = byte count, `:`, then the bytes. The identity tuple is `(goal_run_id, certification_receipt_ref, final_certifier_decision, expected_goal_run_revision, goal_run_revision)`. `event_id` = `goal_run.certified.v3:` + SHA-256(`pm.goal_run.certified.event_id.v3` \0 LP(scope_partition) LP(K)), and the replay policy is `dedupe_by_idempotency_key`.

On both paths:
- same key and digest returns the first original Event and receipt, and does nothing else;
- a different digest is `idempotency_conflict`;
- a stale Workflow revision is `revision_conflict`;
- unprovable dedupe is `dedupe_unavailable`;
- a missing acknowledgement never mints a new key or timestamp (GRS 7443, 7508).

Depth42 marked eight cells PARTIAL across the registry for lacking "An exact event-ID and idempotency-key recipe" (Contracts_V0 1008, 1016, 1028). The certified LP recipe is the one that states event_id explicitly.

## 7. The projection and checkpoint (GRS-085 / SP-317) and the successor pattern

- Each supported-event extension adds a new versioned successor projector: v3 (started), then v4 (started+cancelled), then v5 (started+cancelled+certified). Nothing is extended in place. Earlier projectors, families, methods and checkpoints stay exact (GRS-085: "earlier started-only/started-cancelled routes retain their original boundaries").
- **Sole writer.** One `project_prefix` method, for example `owner.goal_run.started_cancelled_certified.project_prefix.v1`. Certified adds a Storage publisher, `owner.storage.goal_run.started_cancelled_certified.publish.v1`. All the other methods are passive.
- **Keys.** K(s) is unpadded base64url of the exact UTF-8, with no normalization. The row key is `goal_run_projection.vN:K(project_id):K(goal_run_id)` in table `goal_run_projection.vN@<generation_id>`. The checkpoint key is `<name>_checkpoint.v1:K(storage_instance_id):K(project_id):K(goal_id):K(goal_run_id)` in table `checkpoints` (certified protocol P5, lines 57-69).
- **Hashes.** CV339 canonical MessagePack and SHA-256.
  - The anchor is `SHA256(encode(["<name>_anchor.v1", storage_instance_id, scope, "<name>_projector.v1", [profile_digest,] seed_hex, source_token_at_birth]))`. Certified adds profile_digest.
  - The generation-id prefix changes per successor: `grsg_`, then `grscg_`, then `grsccg_`.
  - The frontier is `SHA256(encode(["<name>_frontier.v1", anchor_sha256, frontier_revision, prior_frontier_sha256, processed, last_transaction_id]))`.
  - The birth token is the nine-field durable SP-278 token. The tenth field, the redb snapshot id, is a live fence only (DL-076).
- **Reducer** (P4, protocol lines 45-55; SP-311 25984).
  - It reads the whole contiguous global prefix, and verified off-run frames count as no-ops.
  - Same-run unsupported events halt before their row. Today that is "replanned, blocked, stopped" (protocol line 53; GRS-085 7885).
  - A terminal row replaces a running row only in the original causal order.
- **Atomicity and retention.**
  - The row and the checkpoint are written in one Storage CAS transaction, with no checkpoint-ahead state.
  - A rebuild stages an empty isolated generation and then cuts over atomically.
  - RP-PROJECTION-3GEN@1.0.0: current has no TTL, at most three generations, and a retired generation expires 604800 s after retirement.
  - Derived Event content stays tied to its source's lifetime (SP-317 canonical text).
- **Reads.** Historical reads assert original facts only. Current reads need fresh native and Goal (and Guard) sources and exact equality with the global frontier. `Unavailable` is source quality, never a lifecycle state.
- **Birth scope.** v5 covers only fresh `all_writers.v7` births (GRS-085). A1's GRS-088 (pending) says "the v7 row, projection, storage and consumer do not admit v8 births".

## 8. How the precedents landed, and the checks they ran

- **Two tasks.** A1 wrote "task 1 of 2: prose only", then "task 2 of 2" for the companions (`94585533b`, `48a2b6840`), which follows the prose-first rule in CLAUDE.md.
- **Validation report** (e.g. `step-08-goal-run-started-v3-checks.json`). It records:
  - a `scope` block: new units, the changed event type, the new family revision, event membership 42, 41 unchanged siblings, the new Storage families and totals, 27 policies preserved, method and route counts;
  - `root_source_checks` (1085 assertions for started);
  - `applied_checks`;
  - `repository_checks`: shard generate and check, `pm-plan-index.py generate` and `validate`, and diff check;
  - `gates`: before and after per check, with no new failing check names;
  - honest NOT_RUN and NOT_PROVED fields.
- **Readiness side effect every time.** "the unchanged validator fixes the prior started payload path, causing one reference mismatch" (started validation.md). The fix is the per-family fixed-path table at `scripts/pm-implementation-readiness.py` 484-494, whose line 494 still reads `"goal_run.stopped": "Plans/event_payloads/goal_runtime/goal_run_stopped.schema.json"`, plus the negative self-test at 5465-5473.
- **Landing check.** The 2026-09-23 certified landing (`landing-record-20260923.md`) ran `pm-landing-check.py`, which exited 2. The v3 payload-ref mismatch was "Kept… on the precedent of goal_run.started and goal_run.cancelled" and staleness went to a reseal request. The checkpoint went to a separate small branch: "Approved, separate branch" and "Live registry 0be54418".
- **Hash pins a stopped row revision will break.** Row #5 is inside the 40-row protected prefix; I verified that the prefix hash today equals `a27cf49b…`. These pins break:
  - `scripts/pm_emit_only_event_contract.py` 16 (`PREEXISTING_REGISTRY_ROWS_SHA256`) and its comment, which says "Re-freeze again only for landed, recorded changes";
  - `tests/test_pm_emit_only_event_boundaries.py` 28;
  - `Plans/testing_session_event_admission.json` and `Plans/github_project_event_admission.json`, fields `preexisting_family_prefix_sha256` and `preexisting_registry_baseline_source`;
  - the sorted-upstream hash in `tests/test_pm_testing_session_events.py` and `tests/test_pm_github_project_integration.py`, per `c7b136ad2`.
- **Other pins of the registry SHA 0be54418.** These are historical "prepared against" pins, so decide per file:
  - `Plans/coordination_event_admission.json` 11 (Step 9 batch 2, prepared without admission, so it will be stale);
  - `Plans/goal_certified_family_composition.json` 41;
  - the provenance comment at `pm_pnc019_currentness.py` 46.
- **Storage count pins, if new families are added:**
  - `scripts/pm-implementation-readiness.py` 761 (`STORAGE_VALUE_REGISTRY_EXPECTED_FAMILY_COUNT = 294`, plus the status and tier counts);
  - `tests/test_pm_assistant_contract_closure.py` 600;
  - `tests/test_pm_onboarding_phases.py` 312-313;
  - `tests/test_shared_runtime_storage_contracts.py` 216.
  - All of these test files are named in `.gitignore`, so they are editable. A1 moves the count to 328 if it lands first.
- **Governance.** Every precedent left governance staleness. Reseals are done by the designated Plans agent, not in the branch. The readiness gate report is not regenerated at landing (DL-078 clarification, DL 1571).

## 9. Depth gaps the precedents left, to close for stopped

Depth42 graded goal_run.stopped at 3 of 12 (step-08-depth42-assessment-20260924.json, row #/families/5, `UNDISPOSITIONED`): membership, owner_doc and retention PASS; closed_payload_schema CONFLICT; consumers_checkpoints ABSENT; the rest PARTIAL.

No precedent reached 12 of 12:
- started and cancelled: 10 of 12. `compatibility_withdrawal` is PARTIAL because there is "no withdrawal protocol", and the oracles are PARTIAL with "Only prose cases exist".
- certified: 10 of 12. `owner_doc` is PARTIAL and the oracles are PARTIAL.

For stopped to pass all twelve, it must do what the precedents did not:
- (a) Point the registry anchors at the new units, the way started and cancelled did.
- (b) State a withdrawal protocol for the stopped writer and its readers, the way certified did.
- (c) Author whole-value positive and negative oracles or fixtures, not prose. That means an ATS unit plus a fixture file.
- (d) Clear the stopped-specific findings:
  - `closed_payload_schema` CONFLICT: the v2 schema needs `expected_goal_revision`, lacks the Workflow clocks, and requires `child_settlement_refs` against "GRS-075: empty only";
  - `producer` PARTIAL: "EP-118 refuses unlisted Workflow writers" (EP 7523: "All unlisted Workflow writers remain refused by `RequiredOtherWorkflowWriterSource=false`");
  - `redaction_custody` PARTIAL: no custody owner;
  - `transitions` PARTIAL: GRS-085 halts on same-run stopped;
  - `consumers_checkpoints` ABSENT.

## 10. Checklist template for the goal_run.stopped v3 contract

Tick each item and cite its evidence path and line.

**A. Before any writing**
- [ ] Confirm the base: `origin/main` SHA, the registry SHA before (expected `0be54418…` unless a landing has happened since), the stopped row hash `8acbc249…`, and the Storage family count (294, or 328 after A1).
- [ ] Re-read DL-080 (DL 1609-1637, 6633-6689) and Q-02, Q-03 and Q-12 against the current text.
- [ ] Choose the native writer profile, and so the birth scope. v6 and v7 are closed. Coordinator `protocol.md` line 85 says "all_writers.v6 is closed", and the consumer `protocol.md` line 5 says "adds no native writer to the closed all_writers.v7 roster". A1's v8 is pending. The stopped writer needs a profile that lists it (open question 1).
- [ ] Fix the writer's identity. Name it explicitly, which DL-080 requires. Place it in the Workflow writer list (EP-118 7523) through a profile successor, never by casting an existing birth.
- [ ] Make the trigger routes independent of D06 (Q-12). The v8 limited revocation Stop (EP-127, A1) "appends no Event", so goal_run.stopped needs its own writer.

**B. Producer and source phase (the precedent's first landing)**
- [ ] Put the v3 payload schema file in the producer's contract directory (open question 2), with `$id` `pm.goal_runtime_event.goal_run_stopped.schema.v3`, the §5 envelope, `additionalProperties:false`, and the event-specific fields unchanged or reconciled (open question 5). Leave the v2 file byte-exact.
- [ ] Idempotency: follow the JCS recipe (§6.1), with a tail such as `goal_run_id, stop_reason_code, resumable[, safe_point_ref]`, or the LP recipe (§6.2) with an explicit `event_id`. State `scope_partition`, byte-equal inner and outer keys, a separate producer digest, and the outcomes `idempotency_conflict`, `revision_conflict` and `dedupe_unavailable`.
- [ ] Transition source states: D-R21 (GRS 3764-3769) gives `ready|running|provisional_success|verifying|failed_verification|repairing|blocked -> stopped`, and `stopped -> stopped` needs new settlement evidence. Native body revision goes to +1, the Goal body and control are unchanged, and there is no fifth Goal state.
- [ ] Specify producer custody: which compact authority families (candidate, intent, control, commit, origin and so on), with keys, codec, RP-AUTHORITY-INDEFINITE and mandatory backup (compare SP-309, SP-316). Specify the first receipt with an SP-286/CV-339 barrier and full-value custody, adopting SP-286 by name.
- [ ] Specify the joint native, D01 and Event publication order, and the crash cuts and retry (compare the coordinator protocol "Crash cuts and later retry").
- [ ] Owner units: EP (the writer and the Event-to-native join), SP (producer custody), BRS (mandatory backup of the authority families). Add a CV unit for schema-root closure, which also fixes the stale Known-37 table row at Contracts_V0 3691.

**C. Consumer and projection phase**
- [ ] Write a GRS unit adopting exactly the stopped row at 3.0.0. It should cover: membership 42 and 41 siblings unchanged, the v2 file as history, the envelope, the fields, the idempotency recipe, the read roles, the NOT_RUN boundary, and the explicit writer name.
- [ ] Write a GRS unit, or a GRS-085 successor unit, that extends the mandatory projection. This is a new versioned successor, for example v6 "started_cancelled_certified_stopped". Do not edit v5 in place.
- [ ] Reducer rules: stopped is non-terminal. The legal successors are cancelled (GRS-080: "including blocked or stopped") and stopped→stopped. Resume goes through `goal_run.replanned`, which stays an unsupported halt until its contract lands. Say whether certified can follow stopped (D-R21 names no edge stopped→certified).
- [ ] Specify the new method set in `methods.json`: one `project_prefix`, the Storage publish method if the v5 pattern is used, and passive `read_retained_native`, `inspect_original`, `read_historical` and `read_current`, plus legacy readers.
- [ ] Specify the new anchor, frontier and generation-prefix domain strings and the installed-profile digest.
- [ ] Specify keys: `goal_run_projection.v6:…` and `<name>_checkpoint.v1:K(storage_instance_id):K(project_id):K(goal_id):K(goal_run_id)`.
- [ ] Write an SP unit for the reader and projector protocol, the delta counts against a stated baseline, and "re-adjudicate if other additions land".
- [ ] Write a BRS unit for the optional coherent derived backup, the restore ordering, and the source-coupled lifetime. The stopped Event is RP-AUTHORITY-INDEFINITE, and the Start source is RP-RUNTIME-365D.
- [ ] Write an ATS unit with whole-value positive and negative facets and fixtures, and TEST_ONLY labels where synthetic.
- [ ] Write a withdrawal protocol for the writer and the readers.
- [ ] Add a `00-plans-index.md` ownership section, as certified did.

**D. Companion files (task 2, after the prose)**
- [ ] `consumer.schema.json`, or `schemas/consumer.v1.schema.json`: StorageProjection, Checkpoint, DurableGenericToken, results, Unavailable.
- [ ] `methods.json`, `physical-families.json` or `physical-retention-install.json`, `resource-realms.json` or `…_schema_resources.json` (isolated realms, `network_fallback: false`, same-ID conflict rule), `dependencies.json`, `imports.json`, `commitment-domains.json` and `installed-profile.json` plus its digest.
- [ ] `owner-sources.json` (owner docs pinned by SHA and base commit) and `source-citations.json` (quoted lines with whole-file SHA).
- [ ] `companions/` plus `companion-differences.json` if the older consumer schemas are carried into a new bank.
- [ ] `storage_value_registry.json`: append the families at the end (the projection pair and any producer authority families) with all 26 fields and an embedded `value_schema`. Keep every prior row and all 27 policies exact.
- [ ] `event_family_registry.json`: change only row #5. Set `family_revision` 3.0.0, the v3 `payload_schema_id` and ref, `semantic_owner_doc` pointing at the new GRS unit, and `payload_owner_doc` pointing at the new SP unit. Append the v3 `source_refs` and keep the v2 refs. Leave scope, legacy and retention unchanged (RP-AUTHORITY-INDEFINITE).
- [ ] Re-pin the fixed path and the negative pair in `scripts/pm-implementation-readiness.py` (484-494, 5465-5473). Re-pin the Storage count pins listed in §8.
- [ ] Re-freeze the 40-prefix hash in all six pins (§8, `c7b136ad2` precedent).
- [ ] Regenerate: `pm-shard-plans.py --generate`, then `pm-plan-index.py generate`, then `--check` and `pm-plan-index.py validate`.

**E. Governance artifacts (Q-02, Q-03)**
- [ ] Write a new dated single-family depth assessment for goal_run.stopped (twelve criteria, rubric of step-08-depth42), graded against the row at 3.0.0 and pinned by SHA-256. Do not cite `ba9b84f9…` for the revised row.
- [ ] Write a DL-077-form record at `reports/event-authority-20260911/admission-records/goal_run.stopped.json`. Its first line must say the seal check does not read it (an original-37 row revised under DL-080). Fill `registry_before` and `registry_after` (same revision and count, different SHA), `registry_row_sha256` (the DL-077 recipe), `depth_assessment` {path, sha256} and `decision_ref` = the new DL entry.
- [ ] Prepare a DL-036 checkpoint card to Jared before landing, with the exact before and after rows and the registry SHA-256 before and after. It is answered per landing and recorded as a Decision Log entry carrying the after-SHA.
- [ ] Decide whether the checkpoint record moves too, following the 2026-09-23 precedent: `step-08-checkpoint-*.json` and the `pm_pnc019_currentness.py` provenance comment. This is not decided (open question 3).

**F. Review and landing**
- [ ] Run one blind form-driven review, with one bounded repair round and a re-review limited to what the repair touched (DL-066, Step 9 procedure item 5, cycle cap two).
- [ ] Write the validation report and checks JSON (the §8 shape). Evidence goes under `/mnt/Cursor/PuppetMaster-Evidence/…`, cited by SHA.
- [ ] Run the landing check on a full tree: `pm-landing-check.py --base origin/main`. Expect the payload-ref precedent and staleness, and list the reseal documents.
- [ ] STATUS.md, then a local session lands it under the lock; the cloud thread never lands.

## 11. Open questions (not decided here)

1. **Native profile and birth scope.** v6 and v7 rosters are closed, and v8 is pending with A1. Is the stopped writer a v8 participant (would A1 need amending?), a v9 successor, or does it need its own composition? Relatedly, which births the v6 projector covers, since v5 is v7-only and GRS-088 (A1) keeps v8 births out of v5.
2. **Home of the v3 payload file.** The precedents used the producer package directory. Name the stopped producer package.
3. **Registry revision label.** Precedent keeps `2026-09-11.2` for row revisions. Does the Q-02 card also move the recorded checkpoint SHA (`step-08-checkpoint` JSON, the `pm_pnc019` comment), as happened on 2026-09-23?
4. **Idempotency recipe choice.** JCS (the started and cancelled family style) or LP with an explicit event_id (certified, and closer to the depth rubric's event-ID rule)? Which fields go in the identity tail? Is `safe_point_ref` in it?
5. **Reconciling `child_settlement_refs`.** It is required in v2, but depth42 flags "GRS-075: empty only". Keep it required-with-empty-allowed, rename it, or rescope it? Also, are all ten `stop_reason_code` values admitted by the current writer, or only some (the way cancelled admitted only `user_cancelled`)?
6. **Mapping from Pause and Abort.** `cmd.orchestrator.pause` and `cmd.runtime.abort_run` expect goal_run.stopped (Wiring_Matrix 40066-40119, 51937-51990; UCC 8108), and DL-080 says the wiring is unchanged. Which native route do they reach, given that EP-127 revocation appends no Event?
7. **Pin re-freeze timing.** In the same landing as the row revision, or as a follow-up the way `c7b136ad2` was? Also, whether `Plans/coordination_event_admission.json` `prepared_against_registry` goes stale for the Step 9 coordination admissions. That needs coordinating with that thread.
8. **Contracts_V0 Known-37 table (3674-3694).** It still lists started, cancelled and certified as v2. Does the stopped CV unit update only its own row, or all four goal_run v3 rows?
9. **12 of 12 target.** No precedent reached it. Is "full current contract" in DL-080 held to all twelve, which needs executable oracles and a withdrawal protocol, or to the precedents' 10 of 12?
10. **Held certified Event after a Stop.** A1 GRS-089 leaves open what becomes of an already durable held goal_run.certified Event when the Stop route revokes a certified slot, and says "its Event side with the Event contract work A3". This contract may have to answer it.
