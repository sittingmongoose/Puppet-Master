# Storage registry repairs, 2026-09-23

STATUS: front 1 complete and pushed (last step: report written; branch `fix/storage-registry-repairs-20260923` held for the coordinator's landing slot). Front 2 not started.

Branch `fix/storage-registry-repairs-20260923`, from `origin/main` `dca3c3349e`, in the sparse worktree `~/pm-worktrees/storage-registry-repairs-20260923` (`Plans scripts reports tests`). Not landed.

Scope, from the open items of the DL-039 takeover note: the 45 Storage registry findings, the four `goal_run` v3 payload-reference rows, and the five tests that fail on `main` in `tests/test_pm_testing_session_events.py` and `tests/test_pm_github_project_integration.py`.

## Result

| | Count |
|---|---:|
| Findings in scope | 49 (45 Storage registry + 4 `goal_run` rows) |
| Registry fixed | **0** |
| Validator fixed | **49** |
| Left open | **0** |
| Named failing tests fixed | 5 of 5 |

Every one of the 49 was a check that misread a legitimate, owner-stated shape or pinned a value that landed, recorded canon had since moved. In each case canon says the registry row is right, so no registry row changed. `Plans/storage_value_registry.json` and `Plans/event_family_registry.json` are byte-identical to `main`. The event registry is still the Jared-approved 42-family checkpoint `0be544181eda…`.

Readiness failures drop from **79 to 33**: the 49 targeted rows are removed, and three Spec Lock hash-staleness rows are added for the edited validator. Nothing else changes.

## Commits

| Commit | What |
|---|---|
| `9d69d43346` | `Plans/storage-plan.md` §2.3.1: dated owner rules for the five representation cases, plus a dated follow-up in SP-310's validator-gap subsection. Storage-plan shards and plan index regenerated. |
| `d5e5b725c2` | `scripts/pm-implementation-readiness.py`: the rules, 23 named storage self-test checks and 1 event self-test check. Unittests in `tests/test_pm_runtime_vocabulary_migration.py` (+3) and `tests/test_pm_testing_session_events.py` (+1). |
| `76c7f30854` | Upstream event-row hash re-frozen: `scripts/pm_emit_only_event_contract.py`, the two emit-only manifests, the two named test modules, and the emit-only boundary test's copy. |
| `3567632096` | The same re-freeze for the Browser admission pins (manifest, schema `const`, test). It sits in its own commit so it can be dropped (see "Choices"). |
| this commit | This report. |

## The rules, each with its canon basis

The owner text is `Plans/storage-plan.md` §2.3.1, "Readiness representation of existing registry shapes (2026-09-23)". Each rule has at least one positive and one negative check, named in `storage_value_representation_self_test_checks`. `validate` runs those checks on every call, and `test_pm_runtime_vocabulary_migration.ReadinessRegistryRepresentationTest` asserts them by name.

**U. SP-310 stored-profile unions (24 findings, rows 145–147).** SP-310 says the registry `value_schema_id`/`value_schema_ref`/`schema_version`/`value_schema` of `goal_cancel_progress`, `goal_cancel_control_publication` and `goal_cancel_terminal_audit` name a nonstored validation composition. The two members keep their literal V1/V2 stored headers. Its own subsection "Existing readiness validator representation gap" records that the validator's single-inline-header rule cannot represent this, and asks for "a future explicitly owner-qualified readiness contract". The new check does the following:
- It requires `value_schema` to be exactly `{"$ref": value_schema_ref}`.
- It resolves the composition and each member only in the `goal` realm of `Plans/goal_workflow_cancel_schema_resources.json`, by retrieval URI and declared document SHA-256. The `native` realm maps the same V1 URI to a different, historical document, so a cross-realm lookup would pick the wrong schema.
- It requires the composition `$id` to equal `value_schema_id`, and the composition to be exactly `$id`/`$comment`/`oneOf` of the whole wrappers that `physical-profiles.json` lists, in order.
- Each member must be a closed object with the row's required fields and the declared literal `schema_id`/`schema_version`. The composition identity must never be a stored header.
- The row's key shapes, producers, consumers, codec, retention and authority must equal the declaration.

Negatives cover six drifts, each rejected: a synthetic single header, the composition identity relabelled as a member header, member version drift, a widened `oneOf`, undeclared document bytes, and a missing goal-realm entry (no fallback to the native realm). Also rejected are dropped V1 keys and a bare reference on a non-union row (`goal_cancel_receipt`).

**T. SP-278 read tokens (14 findings, rows 50, 96, 99, 102, 110).** All five fields (`read_token`, `index_read_token`, `generic_read_token`) are JSON-identical to `Plans/event_record_index_checkpoint.schema.json#/$defs/read_token`. SP-278 defines that as a closed read selector of Storage identity, relative control names, hashes, generation and frontier ("Retained metadata contains only non-secret relative control names, identities, hashes, cursors and authorized refs"). The secret-name rule matched `token` in the name. A key or field is now exempt only when both of these hold:
- its name is `read_token` or ends in `_read_token`;
- its whole schema equals the canonical definition, inline or through one local reference.

The recursion still inspects the token's own properties. Negatives, each still rejected:
- a `*_read_token` typed as a string;
- the canonical schema under the name `api_token`;
- a token with an extra property;
- a local `$defs` token with `additionalProperties: true`, which also flags the property that references it.

**C. Census (4 findings).** The validator pinned 88 families, 24 policies, status 66/21/1 and tier 16/71/1. That is exactly the registry at `99a3c7db9d` (2026-09-06). It is re-pinned to 294 families, 27 policies, status 272/21/1 and tier 40/251/3. SP-318 already states "294 rows after the 2026-09-23 Event Authority source-current landing". All 27 commits that moved the census since the pin are ancestors of `main`, and each carries a record; they are listed below. They add 206 families and 3 policies and remove none. Negatives cover a removed policy, a status change and a tier change; the family-count negative already existed.

**M. MVP rows retired to import readers (2 findings).** `runtime_resource_admission` and `observable_work_projection` are MVP-required and now `migration_only`. The Shared_Integration_Runtime full-thread addendum (2026-08-31) makes existing `pm.shared_runtime.contracts.v1` rows "compatibility/import values [that] normalize once at the owner boundary". `Plans/full_thread_runtime_contracts.schema.json#/x-legacy-normalization` names these two record kinds. `tests/test_pm_runtime_vocabulary_migration.py` asserts `migration_only`. The validator's rule ("every non-launch MVP family is `later_gui_or_feature_projection`") predates that retirement. It now accepts `migration_only` only for a row with no writer, a `compatibility_read_only` migration with read-only compatibility keys and fail-closed ambiguity, and a `legacy_reader_import_only_to_<successor>` crosswalk. Negatives: the same tier on a row with a writer, and on an ordinary MVP row (`onboarding_state`).

**H. Retention-hold authority (1 finding).** SP-288 (`2080658ff8`) says "V2 is canonical non-rebuildable command/receipt authority" restored from mandatory backup. `canonical_dual_homed` stays "only where complete original v1 authority is actually available", for the separate v1 roles. The registry row is v2, so the validator's pin moves from `canonical_dual_homed` to `canonical_non_rebuildable`. Negative: the v1 authority on the v2 row is rejected.

**G. `goal_run` v3 payload references (3 rows plus the kernel-membership row).** The landed adoptions pointed the three rows at whole v3 schemas outside `event_payloads/goal_runtime`:
- `goal_run.started`: `e686963ad5` (GRS-079/SP-311);
- `goal_run.cancelled`: `a3c511657f` (GRS-080/SP-312);
- `goal_run.certified`: `f6350caf27` (GRS-084/CV-352).

The adoption records call the remaining failure "the fixed-path validator limitation", left only because validator edits were prohibited. `EVENT_FAMILY_GOAL_PAYLOAD_SCHEMA_REFS` now names the v3 paths. The existing identity check still binds `payload_schema_id`, `payload_schema_ref.schema_id` and the resolved `$id`. The three historical v2 files are unchanged since 2026-09-11. Negative: each of the three rows pointed back at v2, or at another family's v3 file, raises both the ref and the kernel-membership failure. There is also a unittest in `test_pm_testing_session_events.py`.

**The five tests: upstream-row hash re-freeze.** Six landed commits changed upstream rows after the hashes were frozen (last true at `4fe66204bd`). Each has its own record in `reports/event-authority-20260911/`:

| Commit | Row changed | Record |
|---|---|---|
| `3890d86c70` | `goal.created` v3 | `step-08-goal-start-validation.md` |
| `5fc9747b6f` | `goal.updated` v3 | `step-08-goal-update-validation.md` |
| `1136661ddc` | `goal.cancelled` v3 | `step-08-goal-cancel-validation.md` |
| `e686963ad5` | `goal_run.started` v3 | `step-08-goal-run-started-v3-validation.md` |
| `a3c511657f` | `goal_run.cancelled` v3 | `step-08-goal-run-cancelled-v3-validation.md` |
| `f6350caf27` | `goal_run.certified` v3 | `step-08-certified-family-integration-20260921.md`; `landing-record-20260923.md` |

Row order and membership are unchanged. The re-frozen values:
- the prefix-40 hash: `4f701c95…` → `a27cf49b63d364ae0d6d6f62b0ebc8d3ebe9e66df6de8e58814d099194d81050`, in the shared constant, both emit-only manifests and the emit-only boundary test;
- the sorted-upstream hash in the two named tests: `a3246c0e…` → `b59cc61d0f6569d1389256157d29d80f88516644b70c029809d4543405be52ea`;
- the Browser 39-row pin: `f548a297…` → `e2b5a433c668a36ffe3ffdc329f90a0f860b680bbc54fb9c596d1a302c6cd306`.

## Finding-by-finding disposition

Keys and paths are those in `reports/event-authority-20260911/landing-record-20260923.json`. All 49 were present on `main` `dca3c3349e`, and none is present on this branch. The letter in "Rule" refers to the rules above.

| # | Key | Error | Family / subject | Disposition | Rule |
|---:|---|---|---|---|---|
| 1 | `64948d311622840b` | `storage_value_registry_retention_policy_count_mismatch` | registry census | validator fix | C: census re-pinned to landed registry (27 policies) |
| 2 | `0382633f16e4118f` | `storage_value_registry_family_count_mismatch` | registry census | validator fix | C: census re-pinned to landed registry (294 families) |
| 3 | `369f46db9a37837f` | `storage_value_secret_material_key` | retention_hold_record `read_token` at `$.$defs.read_token` | validator fix | T: canonical SP-278 read_token is a read selector |
| 4 | `9c0ed24a90c9ce13` | `storage_value_secret_material_field` | browser_workspace_reset_index_checkpoint `index_read_token` (required_fields) | validator fix | T: canonical SP-278 read_token is a read selector |
| 5 | `ee729336b6a13574` | `storage_value_secret_material_key` | browser_workspace_reset_index_checkpoint `index_read_token` at `$.properties.index_read_token` | validator fix | T: canonical SP-278 read_token is a read selector |
| 6 | `b653c114f8ee1752` | `storage_value_secret_material_key` | browser_workspace_reset_index_checkpoint `index_read_token` at `$.$defs.checkpoint_core.properties.index_read_token` | validator fix | T: canonical SP-278 read_token is a read selector |
| 7 | `2c9a2a5074d798fa` | `storage_value_secret_material_key` | browser_workspace_reset_index_checkpoint `generic_read_token` at `$.$defs.generic_read_token` | validator fix | T: canonical SP-278 read_token is a read selector |
| 8 | `e2e2ceee9d13a7a8` | `storage_value_secret_material_field` | seglog_observability_reader_checkpoint `index_read_token` (required_fields) | validator fix | T: canonical SP-278 read_token is a read selector |
| 9 | `9dea79bb9347facd` | `storage_value_secret_material_key` | seglog_observability_reader_checkpoint `index_read_token` at `$.properties.index_read_token` | validator fix | T: canonical SP-278 read_token is a read selector |
| 10 | `422a889aaca5be55` | `storage_value_secret_material_key` | seglog_observability_reader_checkpoint `index_read_token` at `$.properties.retired_generations.items.properties.checkpoint.properties.index_read_token` | validator fix | T: canonical SP-278 read_token is a read selector |
| 11 | `04167ca101c0e9aa` | `storage_value_secret_material_field` | home_layout_event_reader_checkpoint `generic_read_token` (required_fields) | validator fix | T: canonical SP-278 read_token is a read selector |
| 12 | `24f8618e37a48fff` | `storage_value_secret_material_key` | home_layout_event_reader_checkpoint `generic_read_token` at `$.properties.generic_read_token` | validator fix | T: canonical SP-278 read_token is a read selector |
| 13 | `67503ca7be51d954` | `storage_value_secret_material_key` | home_layout_event_reader_checkpoint `generic_read_token` at `$.properties.previous_generations.items.properties.value.properties.generic_read_token` | validator fix | T: canonical SP-278 read_token is a read selector |
| 14 | `1dca93113bb26770` | `storage_value_secret_material_field` | restore_point_expired_checkpoint `generic_read_token` (required_fields) | validator fix | T: canonical SP-278 read_token is a read selector |
| 15 | `123222f184696259` | `storage_value_secret_material_key` | restore_point_expired_checkpoint `generic_read_token` at `$.properties.retired_generations.items.properties.checkpoint.properties.generic_read_token` | validator fix | T: canonical SP-278 read_token is a read selector |
| 16 | `85c43312fba020a2` | `storage_value_secret_material_key` | restore_point_expired_checkpoint `generic_read_token` at `$.properties.generic_read_token` | validator fix | T: canonical SP-278 read_token is a read selector |
| 17 | `4463b1b075aa0f86` | `storage_value_registry_value_schema_not_object` | goal_cancel_progress | validator fix | U: SP-310 stored-profile union checked member by member |
| 18 | `a70eebf23809af30` | `storage_value_registry_value_schema_not_closed` | goal_cancel_progress | validator fix | U: SP-310 stored-profile union checked member by member |
| 19 | `ebd2bc2070062d51` | `storage_value_registry_required_fields_schema_mismatch` | goal_cancel_progress | validator fix | U: SP-310 stored-profile union checked member by member |
| 20 | `06409b9532e60e0c` | `storage_value_registry_required_field_absent_from_value_schema` | goal_cancel_progress `schema_id` (None) | validator fix | U: SP-310 stored-profile union checked member by member |
| 21 | `ba14b4f7dfd087e4` | `storage_value_registry_required_field_absent_from_value_schema` | goal_cancel_progress `schema_version` (None) | validator fix | U: SP-310 stored-profile union checked member by member |
| 22 | `d8bbcaa9aabd53c0` | `storage_value_registry_required_field_absent_from_value_schema` | goal_cancel_progress `record` (None) | validator fix | U: SP-310 stored-profile union checked member by member |
| 23 | `f58e3e6a367af6ef` | `storage_value_registry_value_schema_id_const_mismatch` | goal_cancel_progress | validator fix | U: SP-310 stored-profile union checked member by member |
| 24 | `111c8070bbc58d5d` | `storage_value_registry_value_schema_version_const_mismatch` | goal_cancel_progress | validator fix | U: SP-310 stored-profile union checked member by member |
| 25 | `93daf9db9ca8896a` | `storage_value_registry_value_schema_not_object` | goal_cancel_control_publication | validator fix | U: SP-310 stored-profile union checked member by member |
| 26 | `a8e87528b114d2ec` | `storage_value_registry_value_schema_not_closed` | goal_cancel_control_publication | validator fix | U: SP-310 stored-profile union checked member by member |
| 27 | `df7b82984ec9dfb8` | `storage_value_registry_required_fields_schema_mismatch` | goal_cancel_control_publication | validator fix | U: SP-310 stored-profile union checked member by member |
| 28 | `8249d6b99e51718e` | `storage_value_registry_required_field_absent_from_value_schema` | goal_cancel_control_publication `schema_id` (None) | validator fix | U: SP-310 stored-profile union checked member by member |
| 29 | `9d24d4aa38f64a1f` | `storage_value_registry_required_field_absent_from_value_schema` | goal_cancel_control_publication `schema_version` (None) | validator fix | U: SP-310 stored-profile union checked member by member |
| 30 | `c87e8f24b031ba92` | `storage_value_registry_required_field_absent_from_value_schema` | goal_cancel_control_publication `record` (None) | validator fix | U: SP-310 stored-profile union checked member by member |
| 31 | `84e4ad0fcdb0d860` | `storage_value_registry_value_schema_id_const_mismatch` | goal_cancel_control_publication | validator fix | U: SP-310 stored-profile union checked member by member |
| 32 | `1c95f2dc3ffc0e01` | `storage_value_registry_value_schema_version_const_mismatch` | goal_cancel_control_publication | validator fix | U: SP-310 stored-profile union checked member by member |
| 33 | `ed25e536f08050a7` | `storage_value_registry_value_schema_not_object` | goal_cancel_terminal_audit | validator fix | U: SP-310 stored-profile union checked member by member |
| 34 | `5e074e4d1bbe26eb` | `storage_value_registry_value_schema_not_closed` | goal_cancel_terminal_audit | validator fix | U: SP-310 stored-profile union checked member by member |
| 35 | `85af4c5f1230aaa6` | `storage_value_registry_required_fields_schema_mismatch` | goal_cancel_terminal_audit | validator fix | U: SP-310 stored-profile union checked member by member |
| 36 | `c54639888b1aaa8d` | `storage_value_registry_required_field_absent_from_value_schema` | goal_cancel_terminal_audit `schema_id` (None) | validator fix | U: SP-310 stored-profile union checked member by member |
| 37 | `3892a776ab18752d` | `storage_value_registry_required_field_absent_from_value_schema` | goal_cancel_terminal_audit `schema_version` (None) | validator fix | U: SP-310 stored-profile union checked member by member |
| 38 | `c3100aeb25529549` | `storage_value_registry_required_field_absent_from_value_schema` | goal_cancel_terminal_audit `record` (None) | validator fix | U: SP-310 stored-profile union checked member by member |
| 39 | `af5d201d6c2429d0` | `storage_value_registry_value_schema_id_const_mismatch` | goal_cancel_terminal_audit | validator fix | U: SP-310 stored-profile union checked member by member |
| 40 | `44dc73fcca773f07` | `storage_value_registry_value_schema_version_const_mismatch` | goal_cancel_terminal_audit | validator fix | U: SP-310 stored-profile union checked member by member |
| 41 | `c17f657bd3d54c80` | `storage_value_registry_status_counts_mismatch` | registry census | validator fix | C: census re-pinned (272/21/1) |
| 42 | `a0b2b5b7ca745d8d` | `storage_value_registry_tier_counts_mismatch` | registry census | validator fix | C: census re-pinned (40/251/3) |
| 43 | `01436f48da9dd1e0` | `storage_value_registry_mvp_required_family_tier_mismatch` | runtime_resource_admission | validator fix | M: retired import-only MVP reader accepted at migration_only |
| 44 | `24a886fce2e81cc2` | `storage_value_registry_mvp_required_family_tier_mismatch` | observable_work_projection | validator fix | M: retired import-only MVP reader accepted at migration_only |
| 45 | `6578ffe48f0775bf` | `storage_value_registry_semantic_recovery_authority_mismatch` | retention_hold_record | validator fix | H: SP-288 v2 authority canonical_non_rebuildable |
| 46 | (goal row) | `event_family_registry_goal_payload_ref_mismatch` | goal_run.cancelled | validator fix | G: goal_run v3 refs follow e686963ad5, a3c511657f, f6350caf27 |
| 47 | (goal row) | `event_family_registry_goal_payload_ref_mismatch` | goal_run.certified | validator fix | G: goal_run v3 refs follow e686963ad5, a3c511657f, f6350caf27 |
| 48 | (goal row) | `event_family_registry_goal_payload_ref_mismatch` | goal_run.started | validator fix | G: goal_run v3 refs follow e686963ad5, a3c511657f, f6350caf27 |
| 49 | (goal row) | `event_family_registry_goal_kernel_membership_mismatch` | goal kernel membership | validator fix | G: goal_run v3 refs follow e686963ad5, a3c511657f, f6350caf27 |

## Census chain: the 27 commits after the 2026-09-06 pin

Every commit is an ancestor of `origin/main`. Records are under `reports/` unless named otherwise.

| Commit | Date | Families | Policies | Status / tier change | Record |
|---|---|---|---|---|---|
| `63bff67fb4` | 2026-09-10 | 88 → 88 | 24 → 24 | later_gui_or_feature_projection -2, migration_only +2 | SIR full-thread addendum 2026-08-31; `x-legacy-normalization` in `Plans/full_thread_runtime_contracts.schema.json`; `tests/test_pm_runtime_vocabulary_migration.py`; acknowledged in `packet-gap-closure-20260910/prepared-verification-20260911.json` |
| `af6856d039` | 2026-09-11 | 88 → 89 | 24 → 24 | materialized +1; later_gui_or_feature_projection +1 | `event-authority-20260911/step-08-run-started-validation.md` |
| `69553720f1` | 2026-09-11 | 89 → 90 | 24 → 24 | materialized +1; later_gui_or_feature_projection +1 | `packet-gap-closure-20260910/browser-workspace-created-root-review-20260911.json` |
| `4d9d21297d` | 2026-09-11 | 90 → 94 | 24 → 24 | materialized +4; later_gui_or_feature_projection +4 | `event-authority-20260911/step-08-restore-created-validation.md` |
| `d21fd2cf23` | 2026-09-11 | 94 → 95 | 24 → 24 | materialized +1; tier_0_launch_critical +1 | `event-authority-20260911/step-08-generic-index-validation.md` |
| `4fe66204bd` | 2026-09-11 | 95 → 96 | 24 → 24 | materialized +1; later_gui_or_feature_projection +1 | `packet-gap-closure-20260910/browser-workspace-reset-root-review-20260911.json` |
| `c47c566af9` | 2026-09-11 | 96 → 99 | 24 → 24 | materialized +3; later_gui_or_feature_projection +2, tier_0_launch_critical +1 | `event-authority-20260911/step-08-seglog-validation.md` |
| `808bd8d918` | 2026-09-11 | 99 → 102 | 24 → 24 | materialized +3; later_gui_or_feature_projection +3 | `event-authority-20260911/step-08-home-validation.md` |
| `640d494d01` | 2026-09-12 | 102 → 103 | 24 → 24 | materialized +1; tier_0_launch_critical +1 | `event-authority-20260911/step-08-append-receipt-validation.md` |
| `0fed14e345` | 2026-09-12 | 103 → 108 | 24 → 25 | materialized +5; later_gui_or_feature_projection +5 | `event-authority-20260911/step-08-goal-body-validation.md` |
| `7fa3b65df7` | 2026-09-12 | 108 → 113 | 25 → 25 | materialized +5; later_gui_or_feature_projection +5 | `event-authority-20260911/step-08-restore-pair-validation.md` |
| `38e37d11a0` | 2026-09-12 | 113 → 114 | 25 → 25 | materialized +1; tier_0_launch_critical +1 | `event-authority-20260911/step-08-integrity-wire-validation.md` |
| `74c5485e3b` | 2026-09-12 | 114 → 115 | 25 → 26 | materialized +1; later_gui_or_feature_projection +1 | `event-authority-20260911/step-08-platform-custody-validation.md` |
| `d3c1179f78` | 2026-09-12 | 115 → 118 | 26 → 26 | materialized +3; tier_0_launch_critical +3 | `event-authority-20260911/step-08-storage-boot-recovery-validation.md` |
| `21c646fb0b` | 2026-09-12 | 118 → 119 | 26 → 26 | materialized +1; tier_0_launch_critical +1 | `event-authority-20260911/step-08-storage-recovery-applied-validation.md` |
| `3890d86c70` | 2026-09-12 | 119 → 120 | 26 → 26 | materialized +1; later_gui_or_feature_projection +1 | `event-authority-20260911/step-08-goal-start-validation.md` |
| `6621d9dc1d` | 2026-09-12 | 120 → 136 | 26 → 27 | materialized +16; tier_0_launch_critical +16 | `event-authority-20260911/step-08-compaction-validation.md` |
| `5fc9747b6f` | 2026-09-12 | 136 → 140 | 27 → 27 | materialized +4; later_gui_or_feature_projection +4 | `event-authority-20260911/step-08-goal-update-validation.md` |
| `1136661ddc` | 2026-09-13 | 140 → 156 | 27 → 27 | materialized +16; later_gui_or_feature_projection +16 | `event-authority-20260911/step-08-goal-cancel-validation.md` |
| `ced70178c2` | 2026-09-13 | 156 → 166 | 27 → 27 | materialized +10; later_gui_or_feature_projection +10 | `event-authority-20260911/step-08-assistant-plan-cancel-validation.md` |
| `a3ac15f22f` | 2026-09-14 | 166 → 220 | 27 → 27 | materialized +54; later_gui_or_feature_projection +54 | `event-authority-20260911/step-08-activation-custody-validation.md` |
| `953634d128` | 2026-09-14 | 220 → 275 | 27 → 27 | materialized +55; later_gui_or_feature_projection +55 | `event-authority-20260911/step-08-workflow-stop-source-validation.md` |
| `de87b6dfc3` | 2026-09-14 | 275 → 278 | 27 → 27 | materialized +3; later_gui_or_feature_projection +3 | `event-authority-20260911/step-08-goal-workflow-coordinator-validation.md` |
| `e686963ad5` | 2026-09-14 | 278 → 280 | 27 → 27 | materialized +2; later_gui_or_feature_projection +2 | `event-authority-20260911/step-08-goal-run-started-v3-validation.md` |
| `a3c511657f` | 2026-09-14 | 280 → 282 | 27 → 27 | materialized +2; later_gui_or_feature_projection +2 | `event-authority-20260911/step-08-goal-run-cancelled-v3-validation.md` |
| `0f57dbf608` | 2026-09-23 | 282 → 285 | 27 → 27 | materialized +3; later_gui_or_feature_projection +3 | `event-authority-20260911/step-08-certified-source-validation.md` |
| `f6350caf27` | 2026-09-23 | 285 → 294 | 27 → 27 | materialized +9; later_gui_or_feature_projection +9 | `event-authority-20260911/step-08-certified-family-integration-20260921.md` |

## Checks before and after

The environment is this sparse worktree. It holds the ignored currentness audit `Plans/.audits/event-authority-2026-08-13-currentness/`, copied byte-for-byte from the shared checkout; that is the edition the 2026-09-23 reseal wrote, and its `VALIDATOR_RECEIPT.json` has SHA-256 `af0bce7c65932afb2165cf64c0bd06c69f65e9a4b2007dd6ccc0125b56368f0e`. The aggregate totals before match the recorded landing baseline exactly.

| Check | `main` `dca3c3349e` | This branch |
|---|---|---|
| `pm-shard-plans.py --check --config Plans/sharding_config.json` | pass, 99 docs, 2,720 shards | pass, 99 docs, 2,720 shards |
| `pm-plan-index.py validate` (without the ignored audit, as `main`'s index was generated) | pass, 6,718 PlanUnits, 26,208 acceptance units | pass, 6,718, 26,208 |
| `pm-implementation-readiness.py validate` | 79 | **33** (−49 targeted, +3 Spec Lock staleness for the edited validator) |
| `validate-implementation-readiness` (run-gates / audit-governance subcheck) | 79 | 33 |
| `validate-testing-session-event-admission` | 1 (`preexisting_registry_rows_changed`) | **0**, pass |
| `validate-github-project-integration` | 1 (`preexisting_registry_changed`) | **0**, pass |
| `validate-browser-event-admission` | 1 (`preexisting_family_rows_changed`) | **0**, pass |
| `verify-spec-lock` | 5 `stale_hash` | 6 (adds `scripts/pm-implementation-readiness.py`) |
| `validate-evidence` / `validate-plan-graph` | 665 / 665 | 665 / 665 (all 82 storage-plan bundle entries were already stale or missing) |

The 33 readiness failures left are all outside this scope:
- 17 `pnc019_source_hash_stale`;
- 4 `event_authority_currentness_source_drift` (00-plans-index, Back_Seat_Driver, storage-plan, storage_value_registry, all from the BSD landing);
- 2 `event_denominator_unresolved` and 2 `event_family_contract_depth_unresolved` (Step 8/9);
- 5 Spec Lock hash-staleness rows, 2 of them pre-existing;
- 1 `buildability_gate_report_stale_or_not_canonical`;
- 1 `event_legacy_fixture_root_mismatch`;
- 1 `implementation_readiness_self_tests_failed`.

The storage self-test scenario now passes entirely. The self-test row that remains names only the `case_l_verification_integration` checks `event_contract_depth_residual_remains_fail_closed`, `event_denominator_residual_remains_fail_closed` and `event_legacy_two_positive_full_negative_matrix_recomputes`. All three were false on `main` too. The two goal-related checks that were false there now pass.

## Tests before and after

| Suite | `main` | This branch |
|---|---|---|
| `tests.test_pm_testing_session_events` + `tests.test_pm_github_project_integration` | 25 run, **5 fail** | 26 run, **0 fail** |
| `tests.test_pm_emit_only_event_boundaries` | 13 run, 2 fail | 13 run, 0 fail |
| `tests.test_pm_browser_event_admission` | 30 run, 30 fail | 30 run, 0 fail |
| `tests.test_pm_runtime_vocabulary_migration` | 6 run, 0 fail | 9 run, 0 fail |
| Whole tracked suite (`unittest discover -s tests`) | 900 run, 42 fail, 3 errors | 904 run, **5 fail, 3 errors** |

The 5 failures and 3 errors left are byte-identical to `main`'s. None touches this scope, apart from the two stale census pins listed under open items.
- `test_pm_touch_closure_source` ×3 (errors): the sparse worktree has no `Concepts/`.
- `test_pm_onboarding_phases` census: pins the bytes of 88 rows as they stood before 2026-09-11.
- `test_pm_pnc019_currentness`: currentness drift from the BSD landing.
- `test_prd_planning_runtime_contracts`.
- `test_runtime_integration_disposition`.
- `test_shared_runtime_storage_contracts` census pin (84).

## What the landing check will say

Expected, and for Jared or the coordinator to classify as in landing 1. The landing check's `STALENESS_ERRORS` lists `stale_hash` and `pnc019_source_hash_stale`, but not the readiness validator's own Spec Lock kinds or currentness drift. So these rows will print as blocking on-branch items even though they are governance staleness:
- `event_record_spec_lock_hash_stale`, `storage_value_registry_spec_lock_hash_stale` and `non_executable_closure_spec_lock_hash_stale`, each with `required_path` `scripts/pm-implementation-readiness.py`. They exist because the validator is Spec-Locked; only a reseal clears them.
- The existing `event_authority_currentness_source_drift` row for `Plans/storage-plan.md` (present on `main` since the BSD landing) now names a branch file. It clears with the next currentness edition.
- `verify_spec_lock` `stale_hash` for `Plans/storage-plan.md` and `scripts/pm-implementation-readiness.py` are recognized as staleness.

The truncated `validate_implementation_readiness` total falls from 79 to 33, and the evidence and plan-graph totals are unchanged, so no truncated subcheck rises.

**Reseal request:** `Plans/storage-plan.md` and `scripts/pm-implementation-readiness.py`. The other edited files are neither Spec-Locked nor in the currentness inventory.

## Choices where canon was ambiguous

1. **The census re-pin rests on one sweep commit.** `63bff67fb4` moved the two `migration_only` tiers inside a "checkpoint paused thread work" sweep, with no report of its own. I counted it as recorded because four things back the same state: the SIR 2026-08-31 addendum, the `x-legacy-normalization` contract, `test_pm_runtime_vocabulary_migration.py`, and `prepared-verification-20260911.json`, which already reported the discrepancy "not repaired by changing readiness constants".
2. **The two retired rows stay MVP-required.** They are kept at `migration_only` rather than removed from `mvp_required_family_ids`. No canon removes them, successor physical families are not registered yet, and existing rows still have to be imported.
3. **The `goal_run.certified` row keeps its older owner anchors.** It keeps `semantic_owner_doc` `#goal-and-goalrun-payload-minima` and `payload_owner_doc` `#sp-214`, while started and cancelled moved theirs to GRS/SP units. GRS-084 says only the certified family's "version/payload selection and corresponding source refs advance". Changing the row would also break the approved checkpoint hash. It is left as is.
4. **The union rule does not check the wrapper SHA-256.** `physical-profiles.json` carries `whole_wrapper_sha256` values that no plain JSON hash of the wrapper reproduces, so the rule does not claim them. It binds members through the resource map's declared `complete_document_sha256` instead. The registry's `encoding` (`json_canonical`) and the declared codec (`pm.goal.cancel_command_json.v1`) use different vocabularies, so the rule checks that the codecs agree, not that the strings are equal.
5. **Scope beyond the five named tests.** The same frozen value is copied into `tests/test_pm_emit_only_event_boundaries.py` (2 failing tests) and into the Browser admission pins (30 failing tests and the Browser gate). The first is the same constant and belongs with it. The Browser re-freeze is in its own commit (`3567632096`) so it can be dropped. Neither draft branch touches those files.
6. **Test placement.** No test file was added. The rule tests live in the validator's self-test, which runs on every `validate`. `test_pm_runtime_vocabulary_migration.py` asserts them by name, since it is the named test file that already owns registry-row assertions. `test_shared_runtime_storage_contracts.py` is tracked but not named in `.gitignore`, so it is outside the edit scope.
7. **The index was generated without the ignored currentness audit.** `main`'s committed `node_readiness_report.json` was generated that way. With the audit present the report differs in its runtime block, which is environment, not canon.

## Open items, with owners

- **Stale census pins in tests outside this scope.** `tests/test_shared_runtime_storage_contracts.py` expects 84 families; it is not named in `.gitignore`. `tests/test_pm_onboarding_phases.py` pins the bytes of 88 rows as of `7db6a87c60`. Owners: the shared-runtime storage and Onboarding test owners. The census chain above is the evidence for a re-pin.
- **The landing check's staleness list.** It lacks the readiness Spec Lock kinds and `event_authority_currentness_source_drift`. Owner: landing-check tooling, for Jared.
- **Reseal** of the two Spec-Locked files, and a new currentness edition for `Plans/storage-plan.md`. Owner: the designated Plans agent.
- **The three remaining `case_l_verification_integration` self-test checks and the legacy-fixture `registry_revision` mismatch.** They were false or failing before this branch. Owner: Event Authority Step 8/9.

Cost: one session; no model calls beyond this agent; monetary attribution unavailable.
