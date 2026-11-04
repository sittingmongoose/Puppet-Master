# DFM — review round 4: isolated negative oracles

Branch: `plans/ea-w2-filemanager-20261104`. Reviewed head: `cd4ca77856a3feda4efb00efa342d1aceb96cca6`. Repaired content: `826a9428073212675cbb6833f6feb841684740dc`. This assessment is recorded in the following report-only commit.

Prepared without admission; author self-grades require independent review. Native execution remains `NOT_RUN`. Membership stays ABSENT and event-history retention stays `PARTIAL / PENDING_RETENTION_DECISION` for Jared. No owner decision or binding is added.

## Review round 4: findings and responses

1. **Fixed (`826a9428073212675cbb6833f6feb841684740dc`) — cycle-4 finding 1, negative isolation.** `Plans/filemanager_event_contract_fixtures.json:2200` rebuilds original-command/root-slot, epoch/family/input/path, copy/create identity, result/commitment, cutoff/control and terminal negatives with coherent logical, physical, final, checkpoint and backup witnesses. Unrelated semantic digests and complete-value commitments are recomputed. Pure shape cases use their payload/companion schema boundary; a request-hash extra-property negative retains its valid event. Native path traversal and uncertain noncompletion test the owning value definition directly. Every negative is checked against its exact error or schema-validator/instance-path oracle.

`scripts/pm-filemanager-event-contracts.py:910` shares repeated scope, original-payload, coverage, event-join, CAS/phase and immutable-original checks. The predicates remain enforced. Optional proof and historical-phase dependent joins execute only when their operands exist; their required-presence guards still refuse absence. Selected pre-CAS equality is checked before candidate consumption. Fixture construction helpers update copies; validators never repair input. The legacy transition case name `settlement-family-substitution` now carries an explicit defect description and isolates changed acceptance time; `rewrite-acceptance-epoch` changes the before epoch. These before-states remain internally coherent. Independent family/event substitution refusals are retained in the unchanged cycle probes.

All 82 non-harness checker refusal sites have authored counterexamples. Deleting each site alone makes all of its own negatives pass: **1,529 accepting observations, zero residual rejections, zero uncovered checker sites**. The 39 identifier patterns make all 346 own lexical negatives pass. The other 55 exercised schema sites supply 132 accepting observations, with zero residual rejections. All 14 main/exact-reason assertions also have isolated deletion counterexamples. Restored positives and the full checker pass.

## Per-family regrade

Counts are PASS / PARTIAL / ABSENT. Before is the cycle-4 independent review. Only Q (`positive_negative_oracles`) upgrades. The other 132 cells retain their current-source support; 372 exact citations are checked.

| Family | Unit | Before | After |
|---|---|---|---|
| file.copied | F-150 | 9 / 2 / 1 | 10 / 1 / 1 |
| file.created | F-151 | 9 / 2 / 1 | 10 / 1 / 1 |
| file.deleted | F-152 | 9 / 2 / 1 | 10 / 1 / 1 |
| file.exported | F-153 | 9 / 2 / 1 | 10 / 1 / 1 |
| file.moved | F-154 | 9 / 2 / 1 | 10 / 1 / 1 |
| file.renamed | F-155 | 9 / 2 / 1 | 10 / 1 / 1 |
| folder.copied | F-156 | 9 / 2 / 1 | 10 / 1 / 1 |
| folder.created | F-157 | 9 / 2 / 1 | 10 / 1 / 1 |
| folder.deleted | F-158 | 9 / 2 / 1 | 10 / 1 / 1 |
| folder.exported | F-159 | 9 / 2 / 1 | 10 / 1 / 1 |
| folder.moved | F-160 | 9 / 2 / 1 | 10 / 1 / 1 |
| folder.renamed | F-161 | 9 / 2 / 1 | 10 / 1 / 1 |

Totals: **108 / 24 / 12 → 120 / 12 / 12**. Twelve prepared families remain subject to retention assignment, independent review, admission and native gates.

## Guard-removal table

Each row deletes one refusal site or one schema keyword, in memory only, and then restores it. The baseline contains 2,439 cases: 336 positives and 2,103 negatives; 208 API probes additionally execute their accepting control before their negative. All 208 controls also pass independently in positive-controls.json. A negative whose first rejection occurs before or outside the deleted site follows the identical rejecting execution prefix; its exact baseline reason therefore remains unchanged. This is the proof for the complement column, not a claim that 82 redundant complete-suite reruns were made. Schema error-tree locations identify all negatives potentially affected by a keyword deletion. Exact family/group/case IDs are in the baseline/outcomes arrays of the linked JSON evidence.

### Checker refusal sites

| Guard (function:line) | Own negatives that flip | Negatives that stay rejected |
|---|---|---|
| `validate_schema_graph:40` | 48: `unexercised-$defs-document`, `unexercised-$defs-pointer`, `unexercised-properties-document`, `unexercised-properties-pointer` | All other 2055 baseline negatives |
| `validate_project_scope:101` | 12: `scope-mismatch` | All other 2091 baseline negatives |
| `validate_original_payload:106` | 24: `typed-original-payload-integer-to-float`, `unequal-original` | All other 2079 baseline negatives |
| `validate_payload_reference:132` | 12: `isolated-reference-grammar` | All other 2091 baseline negatives |
| `resolve_payload:139` | 36: `control-changed-referent`, `pack-changed`, `pack-wrong-size` | All other 2067 baseline negatives |
| `resolve_value:145` | 48: `control-oversized-inline`, `operation-oversized-inline`, `physical-inline:family_control:16385`, `physical-inline:operation_custody:16385` | All other 2055 baseline negatives |
| `resolve_value:150` | 12: `isolated-small-companion-reference` | All other 2091 baseline negatives |
| `event_body:159` | 12: `body-oversized-inline` | All other 2091 baseline negatives |
| `event_body:163` | 12: `isolated-referenced-body-inline` | All other 2091 baseline negatives |
| `event_body:166` | 12: `isolated-small-body-reference` | All other 2091 baseline negatives |
| `validate_writer:176` | 36: `retry-replay-only`, `terminal-replay-only`, `writer-replay-only` | All other 2067 baseline negatives |
| `validate_writer:178` | 12: `isolated-writer-other-policy` | All other 2091 baseline negatives |
| `validate_profile:185` | 96: `isolated-encoding:filemanager_family_control`, `isolated-encoding:filemanager_operation_custody`, `profile-wrong:filemanager_family_control:max_value_bytes`, `profile-wrong:filemanager_family_control:redb_file`, `profile-wrong:filemanager_family_control:storage_group`, `profile-wrong:filemanager_operation_custody:max_value_bytes`, `profile-wrong:filemanager_operation_custody:redb_file`, `profile-wrong:filemanager_operation_custody:storage_group` | All other 2007 baseline negatives |
| `validate_profile:188` | 24: `isolated-budget:filemanager_family_control`, `isolated-budget:filemanager_operation_custody` | All other 2079 baseline negatives |
| `validate_profile:191` | 24: `profile-schema-header:filemanager_family_control`, `profile-schema-header:filemanager_operation_custody` | All other 2079 baseline negatives |
| `validate_path_coverage:565` | 24: `duplicate-original-path`, `missing-original-path-coverage` | All other 2079 baseline negatives |
| `validate_snapshot_subjects:577` | 56: `snapshot-accepted-source-node_kind`, `snapshot-accepted-source-node_ref`, `snapshot-result-node_kind`, `snapshot-result-node_ref`, `snapshot-settled-source-node_kind`, `snapshot-settled-source-node_ref` | All other 2047 baseline negatives |
| `validate_snapshot_subjects:581` | 2: `snapshot-selected-root` | All other 2101 baseline negatives |
| `validate_snapshot_subjects:584` | 2: `creation-destination-was-present` | All other 2101 baseline negatives |
| `validate_snapshot_subjects:588` | 4: `creation-parent-is-not-original-container`, `snapshot-container-kind` | All other 2099 baseline negatives |
| `validate_snapshot_subjects:593` | 4: `isolated-settled-container`, `snapshot-container-settled-node` | All other 2099 baseline negatives |
| `validate_snapshot_subjects:597` | 6: `snapshot-container-computer_id`, `snapshot-container-relative_components`, `snapshot-container-root_identity_ref` | All other 2097 baseline negatives |
| `validate_snapshot_subjects:604` | 10: `snapshot-selected-root` | All other 2093 baseline negatives |
| `validate_snapshot_subjects:612` | 2: `snapshot-export-kind` | All other 2101 baseline negatives |
| `validate_snapshot_subjects:619` | 6: `snapshot-rename-computer_id`, `snapshot-rename-relative_components`, `snapshot-rename-root_identity_ref` | All other 2097 baseline negatives |
| `validate_complete_event:629` | 24: `terminal-changed-payload`, `terminal-unrelated-event` | All other 2079 baseline negatives |
| `validate_operation_edge:639` | 36: `operation-cas-aba`, `resurrect-cancelled-original`, `skip-effect-settlement` | All other 2067 baseline negatives |
| `validate_operation_immutables:645` | 24: `rewrite-acceptance-epoch`, `settlement-family-substitution` | All other 2079 baseline negatives |
| `validate_operation_immutables:647` | 12: `rewrite-settled-payload` | All other 2091 baseline negatives |
| `validate_operation_transition:655` | 12: `isolated-operation-physical` | All other 2091 baseline negatives |
| `validate_operation_transition:666` | 12: `isolated-settlement-acceptance` | All other 2091 baseline negatives |
| `validate_operation_transition:674` | 12: `terminal-missing-proof` | All other 2091 baseline negatives |
| `validate_control_transition:686` | 12: `isolated-control-physical` | All other 2091 baseline negatives |
| `validate_control_transition:689` | 12: `control-cas-aba` | All other 2091 baseline negatives |
| `validate_control_transition:693` | 24: `reopen-withdrawn`, `skip-drain` | All other 2079 baseline negatives |
| `validate_control_transition:695` | 12: `isolated-control-admission` | All other 2091 baseline negatives |
| `validate_control_transition:698` | 12: `isolated-control-issued` | All other 2091 baseline negatives |
| `validate_control_transition:702` | 12: `issuance-rewrites-reader` | All other 2091 baseline negatives |
| `validate_control_transition:704` | 12: `lost-drain-member` | All other 2091 baseline negatives |
| `validate_control_transition:707` | 24: `unresolved-inflight`, `wrong-cutoff` | All other 2079 baseline negatives |
| `validate_control_transition:712` | 12: `isolated-retired-authority` | All other 2091 baseline negatives |
| `validate_original_models:726` | 24: `terminal-already-published-original`, `terminal-substituted-original` | All other 2079 baseline negatives |
| `validate_original_models:728` | 12: `wrong-original-root-slot` | All other 2091 baseline negatives |
| `validate_original_models:731` | 12: `wrong-original-epoch` | All other 2091 baseline negatives |
| `validate_original_models:733` | 12: `wrong-original-family` | All other 2091 baseline negatives |
| `validate_original_models:735` | 12: `isolated-historical-phase` | All other 2091 baseline negatives |
| `validate_historical_operation:747` | 12: `wrong-original-command` | All other 2091 baseline negatives |
| `validate_historical_operation:750` | 12: `wrong-original-destination` | All other 2091 baseline negatives |
| `validate_historical_operation:752` | 12: `isolated-completion-time` | All other 2091 baseline negatives |
| `validate_historical_operation:761` | 24: `wrong-original-path-project`, `wrong-original-snapshot-revision` | All other 2079 baseline negatives |
| `validate_historical_operation:768` | 12: `changed-original-root` | All other 2091 baseline negatives |
| `validate_historical_operation:774` | 24: `semantic-resolver-is-not-full-value`, `terminal-semantic-proof` | All other 2079 baseline negatives |
| `validate_historical_operation:779` | 36: `alternate-semantic-event-id`, `changed-original-event-request`, `typed-full-value-request-integer-to-float` | All other 2067 baseline negatives |
| `validate_historical_operation:784` | 12: `retry-event-id` | All other 2091 baseline negatives |
| `validate_historical_operation:786` | 12: `retry-semantic-change` | All other 2091 baseline negatives |
| `validate_historical_operation:795` | 12: `raw-project-partition` | All other 2091 baseline negatives |
| `validate_historical_operation:797` | 60: `terminal-wrong-witness`, `typed-full-value-result-integer-to-float`, `wrong-full-value-result-commitment`, `wrong-full-value-result-receipt`, `wrong-full-value-result-segment` | All other 2043 baseline negatives |
| `validate_historical_operation:799` | 12: `self-consistent-wrong-full-value` | All other 2091 baseline negatives |
| `validate_historical_operation:803` | 12: `isolated-producer-digest` | All other 2091 baseline negatives |
| `validate_historical_operation:807` | 24: `isolated-issued-receipt`, `terminal-changed-receipt` | All other 2079 baseline negatives |
| `validate_historical_operation:811` | 48: `checkpoint-event_id`, `checkpoint-recovery_epoch`, `checkpoint-scope_partition`, `checkpoint-storage_instance_id` | All other 2055 baseline negatives |
| `validate_historical_operation:817` | 12: `wrong-control-family` | All other 2091 baseline negatives |
| `validate_historical_operation:819` | 12: `control-reader-retired` | All other 2091 baseline negatives |
| `validate_historical_operation:822` | 12: `inconsistent-stored-cutoff` | All other 2091 baseline negatives |
| `validate_historical_operation:825` | 36: `late-selected-append`, `late-selected-control`, `late-selected-operation` | All other 2067 baseline negatives |
| `validate_historical_operation:829` | 12: `pack-late-change` | All other 2091 baseline negatives |
| `validate_historical_operation:833` | 36: `backup-cutoff-skew`, `backup-epoch-skew`, `pack-backup-missing` | All other 2067 baseline negatives |
| `validate_case:860` | 2: `identity-contradiction-with-true-semantics` | All other 2101 baseline negatives |
| `validate_case:862` | 2: `identity-contradiction-with-true-semantics` | All other 2101 baseline negatives |
| `validate_case:865` | 12: `isolated-path-scope` | All other 2091 baseline negatives |
| `validate_case:867` | 12: `isolated-affected-scope` | All other 2091 baseline negatives |
| `validate_case:870` | 12: `append-before-effect` | All other 2091 baseline negatives |
| `validate_case:872` | 12: `lost-first-receipt` | All other 2091 baseline negatives |
| `validate_case:874` | 24: `replayed-effect`, `second-append` | All other 2079 baseline negatives |
| `validate_case:878` | 36: `fence-access_allowed`, `fence-current_source_verified`, `fence-restore_coherent` | All other 2067 baseline negatives |
| `validate_case:880` | 24: `fence-event_revision`, `fence-reader_revision` | All other 2079 baseline negatives |
| `validate_case:882` | 12: `fence-reader_enabled` | All other 2091 baseline negatives |
| `validate_case:884` | 12: `fence-writer_cutoff_sequence` | All other 2091 baseline negatives |
| `validate_case:887` | 2: `isolated-unchanged-path` | All other 2101 baseline negatives |
| `validate_case:898` | 34: `reject-confirmation_valid`, `reject-custody_distinct`, `reject-destination_authorized`, `reject-destination_committed`, `reject-distinct_result`, `reject-exact_container`, `reject-identity_preserved`, `reject-mode_matches_original`, `reject-new_node`, `reject-same_parent`, `reject-source_removed`, `reject-source_unchanged`, `reject-transfer_complete`, `reject-valid_name` | All other 2069 baseline negatives |
| `validate_case:901` | 5: `descendant-mismatch` | All other 2098 baseline negatives |
| `validate_case:904` | 12: `new-retry-identity` | All other 2091 baseline negatives |

### Lexical and other exercised schema sites

| Guard (document / pointer) | Own negatives that flip | Negatives that stay rejected |
|---|---|---|
| `event_append_receipt_contracts.schema.json/$defs/custody_v2/properties/schema_version/const` | 12: `v1-has-no-full-value-witness` | All other 2091 baseline negatives |
| `event_append_receipt_contracts.schema.json/$defs/full_value_request/additionalProperties` | 12: `asserted-hash-is-not-request` | All other 2091 baseline negatives |
| `file_copied.schema.json/$defs/non_secret_ref/pattern` | 8: `identifier-lf-receipt_ref`, `schema-lf-evidence_refs`, `schema-lf-result_node_ref`, `schema-lf-source_node_ref`, `schema-malformed-evidence_refs`, `schema-malformed-receipt_ref`, `schema-malformed-result_node_ref`, `schema-malformed-source_node_ref` | All other 2095 baseline negatives |
| `file_copied.schema.json/$defs/path_ref/pattern` | 7: `identifier-lf-source_path_ref`, `raw-path`, `schema-lf-affected_path_refs`, `schema-lf-destination_path_ref`, `schema-malformed-affected_path_refs`, `schema-malformed-destination_path_ref`, `schema-malformed-source_path_ref` | All other 2096 baseline negatives |
| `file_copied.schema.json/$defs/safe_id/pattern` | 6: `identifier-lf-correlation_id`, `identifier-lf-operation_id`, `identifier-lf-project_id`, `schema-malformed-correlation_id`, `schema-malformed-operation_id`, `schema-malformed-project_id` | All other 2097 baseline negatives |
| `file_copied.schema.json/properties/node_kind/const` | 1: `wrong-kind` | All other 2102 baseline negatives |
| `file_copied.schema.json/properties/operation_status/const` | 1: `not-completed` | All other 2102 baseline negatives |
| `file_copied.schema.json/additionalProperties` | 1: `closed-root` | All other 2102 baseline negatives |
| `file_copied.schema.json/required` | 1: `missing-operation` | All other 2102 baseline negatives |
| `file_created.schema.json/$defs/non_secret_ref/pattern` | 8: `identifier-lf-receipt_ref`, `schema-lf-destination_container_ref`, `schema-lf-evidence_refs`, `schema-lf-result_node_ref`, `schema-malformed-destination_container_ref`, `schema-malformed-evidence_refs`, `schema-malformed-receipt_ref`, `schema-malformed-result_node_ref` | All other 2095 baseline negatives |
| `file_created.schema.json/$defs/path_ref/pattern` | 5: `identifier-lf-destination_path_ref`, `raw-path`, `schema-lf-affected_path_refs`, `schema-malformed-affected_path_refs`, `schema-malformed-destination_path_ref` | All other 2098 baseline negatives |
| `file_created.schema.json/$defs/safe_id/pattern` | 6: `identifier-lf-correlation_id`, `identifier-lf-operation_id`, `identifier-lf-project_id`, `schema-malformed-correlation_id`, `schema-malformed-operation_id`, `schema-malformed-project_id` | All other 2097 baseline negatives |
| `file_created.schema.json/properties/node_kind/const` | 1: `wrong-kind` | All other 2102 baseline negatives |
| `file_created.schema.json/properties/operation_status/const` | 1: `not-completed` | All other 2102 baseline negatives |
| `file_created.schema.json/additionalProperties` | 1: `closed-root` | All other 2102 baseline negatives |
| `file_created.schema.json/required` | 1: `missing-operation` | All other 2102 baseline negatives |
| `file_deleted.schema.json/$defs/non_secret_ref/pattern` | 8: `identifier-lf-receipt_ref`, `schema-lf-evidence_refs`, `schema-lf-filesafe_receipt_ref`, `schema-lf-prior_node_ref`, `schema-malformed-evidence_refs`, `schema-malformed-filesafe_receipt_ref`, `schema-malformed-prior_node_ref`, `schema-malformed-receipt_ref` | All other 2095 baseline negatives |
| `file_deleted.schema.json/$defs/path_ref/pattern` | 5: `identifier-lf-source_path_ref`, `raw-path`, `schema-lf-affected_path_refs`, `schema-malformed-affected_path_refs`, `schema-malformed-source_path_ref` | All other 2098 baseline negatives |
| `file_deleted.schema.json/$defs/safe_id/pattern` | 6: `identifier-lf-correlation_id`, `identifier-lf-operation_id`, `identifier-lf-project_id`, `schema-malformed-correlation_id`, `schema-malformed-operation_id`, `schema-malformed-project_id` | All other 2097 baseline negatives |
| `file_deleted.schema.json/properties/node_kind/const` | 1: `wrong-kind` | All other 2102 baseline negatives |
| `file_deleted.schema.json/properties/operation_status/const` | 1: `not-completed` | All other 2102 baseline negatives |
| `file_deleted.schema.json/additionalProperties` | 1: `closed-root` | All other 2102 baseline negatives |
| `file_deleted.schema.json/required` | 1: `missing-operation` | All other 2102 baseline negatives |
| `file_exported.schema.json/$defs/non_secret_ref/pattern` | 8: `identifier-lf-receipt_ref`, `schema-lf-destination_authorization_ref`, `schema-lf-evidence_refs`, `schema-lf-source_node_ref`, `schema-malformed-destination_authorization_ref`, `schema-malformed-evidence_refs`, `schema-malformed-receipt_ref`, `schema-malformed-source_node_ref` | All other 2095 baseline negatives |
| `file_exported.schema.json/$defs/path_ref/pattern` | 7: `identifier-lf-source_path_ref`, `raw-path`, `schema-lf-affected_path_refs`, `schema-lf-destination_path_ref`, `schema-malformed-affected_path_refs`, `schema-malformed-destination_path_ref`, `schema-malformed-source_path_ref` | All other 2096 baseline negatives |
| `file_exported.schema.json/$defs/safe_id/pattern` | 6: `identifier-lf-correlation_id`, `identifier-lf-operation_id`, `identifier-lf-project_id`, `schema-malformed-correlation_id`, `schema-malformed-operation_id`, `schema-malformed-project_id` | All other 2097 baseline negatives |
| `file_exported.schema.json/properties/node_kind/const` | 1: `wrong-kind` | All other 2102 baseline negatives |
| `file_exported.schema.json/properties/operation_status/const` | 1: `not-completed` | All other 2102 baseline negatives |
| `file_exported.schema.json/additionalProperties` | 1: `closed-root` | All other 2102 baseline negatives |
| `file_exported.schema.json/required` | 1: `missing-operation` | All other 2102 baseline negatives |
| `file_moved.schema.json/$defs/non_secret_ref/pattern` | 8: `identifier-lf-receipt_ref`, `schema-lf-evidence_refs`, `schema-lf-filesafe_receipt_ref`, `schema-lf-node_ref`, `schema-malformed-evidence_refs`, `schema-malformed-filesafe_receipt_ref`, `schema-malformed-node_ref`, `schema-malformed-receipt_ref` | All other 2095 baseline negatives |
| `file_moved.schema.json/$defs/path_ref/pattern` | 7: `identifier-lf-source_path_ref`, `raw-path`, `schema-lf-affected_path_refs`, `schema-lf-destination_path_ref`, `schema-malformed-affected_path_refs`, `schema-malformed-destination_path_ref`, `schema-malformed-source_path_ref` | All other 2096 baseline negatives |
| `file_moved.schema.json/$defs/safe_id/pattern` | 6: `identifier-lf-correlation_id`, `identifier-lf-operation_id`, `identifier-lf-project_id`, `schema-malformed-correlation_id`, `schema-malformed-operation_id`, `schema-malformed-project_id` | All other 2097 baseline negatives |
| `file_moved.schema.json/properties/node_kind/const` | 1: `wrong-kind` | All other 2102 baseline negatives |
| `file_moved.schema.json/properties/operation_status/const` | 1: `not-completed` | All other 2102 baseline negatives |
| `file_moved.schema.json/additionalProperties` | 1: `closed-root` | All other 2102 baseline negatives |
| `file_moved.schema.json/required` | 1: `missing-operation` | All other 2102 baseline negatives |
| `file_renamed.schema.json/$defs/non_secret_ref/pattern` | 8: `identifier-lf-receipt_ref`, `schema-lf-evidence_refs`, `schema-lf-filesafe_receipt_ref`, `schema-lf-node_ref`, `schema-malformed-evidence_refs`, `schema-malformed-filesafe_receipt_ref`, `schema-malformed-node_ref`, `schema-malformed-receipt_ref` | All other 2095 baseline negatives |
| `file_renamed.schema.json/$defs/path_ref/pattern` | 7: `identifier-lf-source_path_ref`, `raw-path`, `schema-lf-affected_path_refs`, `schema-lf-destination_path_ref`, `schema-malformed-affected_path_refs`, `schema-malformed-destination_path_ref`, `schema-malformed-source_path_ref` | All other 2096 baseline negatives |
| `file_renamed.schema.json/$defs/safe_id/pattern` | 6: `identifier-lf-correlation_id`, `identifier-lf-operation_id`, `identifier-lf-project_id`, `schema-malformed-correlation_id`, `schema-malformed-operation_id`, `schema-malformed-project_id` | All other 2097 baseline negatives |
| `file_renamed.schema.json/properties/node_kind/const` | 1: `wrong-kind` | All other 2102 baseline negatives |
| `file_renamed.schema.json/properties/operation_status/const` | 1: `not-completed` | All other 2102 baseline negatives |
| `file_renamed.schema.json/additionalProperties` | 1: `closed-root` | All other 2102 baseline negatives |
| `file_renamed.schema.json/required` | 1: `missing-operation` | All other 2102 baseline negatives |
| `folder_copied.schema.json/$defs/non_secret_ref/pattern` | 10: `identifier-lf-receipt_ref`, `schema-lf-evidence_refs`, `schema-lf-result_folder_ref`, `schema-lf-source_folder_ref`, `schema-lf-transfer_manifest_ref`, `schema-malformed-evidence_refs`, `schema-malformed-receipt_ref`, `schema-malformed-result_folder_ref`, `schema-malformed-source_folder_ref`, `schema-malformed-transfer_manifest_ref` | All other 2093 baseline negatives |
| `folder_copied.schema.json/$defs/path_ref/pattern` | 7: `identifier-lf-source_path_ref`, `raw-path`, `schema-lf-affected_path_refs`, `schema-lf-destination_path_ref`, `schema-malformed-affected_path_refs`, `schema-malformed-destination_path_ref`, `schema-malformed-source_path_ref` | All other 2096 baseline negatives |
| `folder_copied.schema.json/$defs/safe_id/pattern` | 6: `identifier-lf-correlation_id`, `identifier-lf-operation_id`, `identifier-lf-project_id`, `schema-malformed-correlation_id`, `schema-malformed-operation_id`, `schema-malformed-project_id` | All other 2097 baseline negatives |
| `folder_copied.schema.json/properties/node_kind/const` | 1: `wrong-kind` | All other 2102 baseline negatives |
| `folder_copied.schema.json/properties/operation_status/const` | 1: `not-completed` | All other 2102 baseline negatives |
| `folder_copied.schema.json/additionalProperties` | 1: `closed-root` | All other 2102 baseline negatives |
| `folder_copied.schema.json/required` | 1: `missing-operation` | All other 2102 baseline negatives |
| `folder_created.schema.json/$defs/non_secret_ref/pattern` | 8: `identifier-lf-receipt_ref`, `schema-lf-destination_container_ref`, `schema-lf-evidence_refs`, `schema-lf-result_folder_ref`, `schema-malformed-destination_container_ref`, `schema-malformed-evidence_refs`, `schema-malformed-receipt_ref`, `schema-malformed-result_folder_ref` | All other 2095 baseline negatives |
| `folder_created.schema.json/$defs/path_ref/pattern` | 5: `identifier-lf-destination_path_ref`, `raw-path`, `schema-lf-affected_path_refs`, `schema-malformed-affected_path_refs`, `schema-malformed-destination_path_ref` | All other 2098 baseline negatives |
| `folder_created.schema.json/$defs/safe_id/pattern` | 6: `identifier-lf-correlation_id`, `identifier-lf-operation_id`, `identifier-lf-project_id`, `schema-malformed-correlation_id`, `schema-malformed-operation_id`, `schema-malformed-project_id` | All other 2097 baseline negatives |
| `folder_created.schema.json/properties/node_kind/const` | 1: `wrong-kind` | All other 2102 baseline negatives |
| `folder_created.schema.json/properties/operation_status/const` | 1: `not-completed` | All other 2102 baseline negatives |
| `folder_created.schema.json/additionalProperties` | 1: `closed-root` | All other 2102 baseline negatives |
| `folder_created.schema.json/required` | 1: `missing-operation` | All other 2102 baseline negatives |
| `folder_deleted.schema.json/$defs/non_secret_ref/pattern` | 10: `identifier-lf-receipt_ref`, `schema-lf-deletion_manifest_ref`, `schema-lf-evidence_refs`, `schema-lf-filesafe_receipt_ref`, `schema-lf-prior_folder_ref`, `schema-malformed-deletion_manifest_ref`, `schema-malformed-evidence_refs`, `schema-malformed-filesafe_receipt_ref`, `schema-malformed-prior_folder_ref`, `schema-malformed-receipt_ref` | All other 2093 baseline negatives |
| `folder_deleted.schema.json/$defs/path_ref/pattern` | 5: `identifier-lf-source_path_ref`, `raw-path`, `schema-lf-affected_path_refs`, `schema-malformed-affected_path_refs`, `schema-malformed-source_path_ref` | All other 2098 baseline negatives |
| `folder_deleted.schema.json/$defs/safe_id/pattern` | 6: `identifier-lf-correlation_id`, `identifier-lf-operation_id`, `identifier-lf-project_id`, `schema-malformed-correlation_id`, `schema-malformed-operation_id`, `schema-malformed-project_id` | All other 2097 baseline negatives |
| `folder_deleted.schema.json/properties/node_kind/const` | 1: `wrong-kind` | All other 2102 baseline negatives |
| `folder_deleted.schema.json/properties/operation_status/const` | 1: `not-completed` | All other 2102 baseline negatives |
| `folder_deleted.schema.json/additionalProperties` | 1: `closed-root` | All other 2102 baseline negatives |
| `folder_deleted.schema.json/required` | 1: `missing-operation` | All other 2102 baseline negatives |
| `folder_exported.schema.json/$defs/non_secret_ref/pattern` | 10: `identifier-lf-receipt_ref`, `schema-lf-destination_authorization_ref`, `schema-lf-evidence_refs`, `schema-lf-source_folder_ref`, `schema-lf-transfer_manifest_ref`, `schema-malformed-destination_authorization_ref`, `schema-malformed-evidence_refs`, `schema-malformed-receipt_ref`, `schema-malformed-source_folder_ref`, `schema-malformed-transfer_manifest_ref` | All other 2093 baseline negatives |
| `folder_exported.schema.json/$defs/path_ref/pattern` | 7: `identifier-lf-source_path_ref`, `raw-path`, `schema-lf-affected_path_refs`, `schema-lf-destination_path_ref`, `schema-malformed-affected_path_refs`, `schema-malformed-destination_path_ref`, `schema-malformed-source_path_ref` | All other 2096 baseline negatives |
| `folder_exported.schema.json/$defs/safe_id/pattern` | 6: `identifier-lf-correlation_id`, `identifier-lf-operation_id`, `identifier-lf-project_id`, `schema-malformed-correlation_id`, `schema-malformed-operation_id`, `schema-malformed-project_id` | All other 2097 baseline negatives |
| `folder_exported.schema.json/properties/node_kind/const` | 1: `wrong-kind` | All other 2102 baseline negatives |
| `folder_exported.schema.json/properties/operation_status/const` | 1: `not-completed` | All other 2102 baseline negatives |
| `folder_exported.schema.json/additionalProperties` | 1: `closed-root` | All other 2102 baseline negatives |
| `folder_exported.schema.json/required` | 1: `missing-operation` | All other 2102 baseline negatives |
| `folder_moved.schema.json/$defs/non_secret_ref/pattern` | 8: `identifier-lf-receipt_ref`, `schema-lf-evidence_refs`, `schema-lf-filesafe_receipt_ref`, `schema-lf-folder_ref`, `schema-malformed-evidence_refs`, `schema-malformed-filesafe_receipt_ref`, `schema-malformed-folder_ref`, `schema-malformed-receipt_ref` | All other 2095 baseline negatives |
| `folder_moved.schema.json/$defs/path_ref/pattern` | 7: `identifier-lf-source_path_ref`, `raw-path`, `schema-lf-affected_path_refs`, `schema-lf-destination_path_ref`, `schema-malformed-affected_path_refs`, `schema-malformed-destination_path_ref`, `schema-malformed-source_path_ref` | All other 2096 baseline negatives |
| `folder_moved.schema.json/$defs/safe_id/pattern` | 6: `identifier-lf-correlation_id`, `identifier-lf-operation_id`, `identifier-lf-project_id`, `schema-malformed-correlation_id`, `schema-malformed-operation_id`, `schema-malformed-project_id` | All other 2097 baseline negatives |
| `folder_moved.schema.json/properties/node_kind/const` | 1: `wrong-kind` | All other 2102 baseline negatives |
| `folder_moved.schema.json/properties/operation_status/const` | 1: `not-completed` | All other 2102 baseline negatives |
| `folder_moved.schema.json/additionalProperties` | 1: `closed-root` | All other 2102 baseline negatives |
| `folder_moved.schema.json/required` | 1: `missing-operation` | All other 2102 baseline negatives |
| `folder_renamed.schema.json/$defs/non_secret_ref/pattern` | 8: `identifier-lf-receipt_ref`, `schema-lf-evidence_refs`, `schema-lf-filesafe_receipt_ref`, `schema-lf-folder_ref`, `schema-malformed-evidence_refs`, `schema-malformed-filesafe_receipt_ref`, `schema-malformed-folder_ref`, `schema-malformed-receipt_ref` | All other 2095 baseline negatives |
| `folder_renamed.schema.json/$defs/path_ref/pattern` | 7: `identifier-lf-source_path_ref`, `raw-path`, `schema-lf-affected_path_refs`, `schema-lf-destination_path_ref`, `schema-malformed-affected_path_refs`, `schema-malformed-destination_path_ref`, `schema-malformed-source_path_ref` | All other 2096 baseline negatives |
| `folder_renamed.schema.json/$defs/safe_id/pattern` | 6: `identifier-lf-correlation_id`, `identifier-lf-operation_id`, `identifier-lf-project_id`, `schema-malformed-correlation_id`, `schema-malformed-operation_id`, `schema-malformed-project_id` | All other 2097 baseline negatives |
| `folder_renamed.schema.json/properties/node_kind/const` | 1: `wrong-kind` | All other 2102 baseline negatives |
| `folder_renamed.schema.json/properties/operation_status/const` | 1: `not-completed` | All other 2102 baseline negatives |
| `folder_renamed.schema.json/additionalProperties` | 1: `closed-root` | All other 2102 baseline negatives |
| `folder_renamed.schema.json/required` | 1: `missing-operation` | All other 2102 baseline negatives |
| `filemanager_operation_contracts.schema.json/$defs/family_control/additionalProperties` | 12: `open-control-schema` | All other 2091 baseline negatives |
| `filemanager_operation_contracts.schema.json/$defs/non_secret_ref/pattern` | 24: `companion-lf-root_identity_ref`, `companion-malformed-root_identity_ref` | All other 2079 baseline negatives |
| `filemanager_operation_contracts.schema.json/$defs/noncompletion/properties/effect_state/enum` | 12: `uncertainty-is-not-terminal` | All other 2091 baseline negatives |
| `filemanager_operation_contracts.schema.json/$defs/operation_custody/additionalProperties` | 12: `open-operation-schema` | All other 2091 baseline negatives |
| `filemanager_operation_contracts.schema.json/$defs/operation_custody/allOf/3/then/properties/complete_event/type` | 12: `cancellation-with-completed-event` | All other 2091 baseline negatives |
| `filemanager_operation_contracts.schema.json/$defs/path_ref/pattern` | 24: `companion-lf-path_ref`, `companion-malformed-path_ref` | All other 2079 baseline negatives |
| `filemanager_operation_contracts.schema.json/$defs/path_snapshot_entry/properties/relative_components/items/not` | 12: `private-path-traversal` | All other 2091 baseline negatives |
| `filemanager_operation_contracts.schema.json/$defs/safe_id/pattern` | 48: `companion-lf-root_slot_id`, `companion-lf-storage_instance_id`, `companion-malformed-root_slot_id`, `companion-malformed-storage_instance_id` | All other 2055 baseline negatives |

The supplemental schema inventory records 1,647 keyword locations, including references/applicators and unexercised locations. Ninety-four have directly authored accepting deletion counterexamples; this is not a claim of mutation coverage for all 1,647 keyword locations. The exhaustive checker-refusal inventory and all 39 lane identifier-pattern guards are covered. No schema rule is edited.

### Harness assertions

| Guard | Negative that flips | Other harness negatives |
|---|---|---|
| `main:968` | `family set` | All other 13; unchanged first refusal |
| `main:981` | `negative success` | All other 13; unchanged first refusal |
| `main:987` | `positive transition rejection` | All other 13; unchanged first refusal |
| `main:991` | `transition success` | All other 13; unchanged first refusal |
| `main:998` | `positive boundary rejection` | All other 13; unchanged first refusal |
| `main:1002` | `boundary success` | All other 13; unchanged first refusal |
| `main:1014` | `owner adoption` | All other 13; unchanged first refusal |
| `main:1026` | `registry/schema drift` | All other 13; unchanged first refusal |
| `main:1030` | `registered custody` | All other 13; unchanged first refusal |
| `main:1032` | `embedded logical drift` | All other 13; unchanged first refusal |
| `main:1038` | `registry data failures` | All other 13; unchanged first refusal |
| `check_negative_reason:935` | `missing` | All other 13; unchanged first refusal |
| `check_negative_reason:937` | `wrong text` | All other 13; unchanged first refusal |
| `check_negative_reason:942` | `wrong schema` | All other 13; unchanged first refusal |

Harness assertion tests execute actual `main` / `check_negative_reason` bodies with cached valid graph and declared validator outcomes, separately from protocol tests. Check 8 additionally executes twelve real checker subprocesses; each exits 1 on its own injected successful return 0.

## Earlier findings remain fixed

- **Original custody / complete-value proof / cutoff authority:** exact operation, path, receipt, resolver, immutable selected value and family-control bindings remain; cycle-1 probes and 136 cycle-2 probes pass.
- **Snapshot joins:** all 26 original Astra node-kind/reference/copy-alias/container-Computer/rename-parent mutations still reject with coherent copies.
- **Schema graph:** all 16 documents / 335 references resolve; 68 graph faults reject, valid recursive/anchor/escaped-pointer controls accept, and 48 per-family unused-reference faults reject in complete main preflight.
- **Storage and replay:** both profiles, exact 16 KiB boundaries, SP-337 references, writer/retry/terminal replay-only refusal, semantic retry equality and checkpoint joins retain the unchanged 1,071 cycle-3 probe results, with zero failures.
- **Historical reads:** all twelve families accept retained originals after later move, rename, delete or replacement; withdrawn/forged sources still reject.

## Commands and evidence

| Check | Exit / result |
|---|---|
| `python3 scripts/pm-filemanager-event-contracts.py` | 0; 12 families / 2,439 cases; native NOT_RUN |
| `guard-audit.py <worktree>` | 0; 82/82 sites covered, 1,529 flips, zero residuals |
| `schema-audit.py <worktree>` | 0; 39 lexical + 55 other exercised sites, 478 flips, zero residuals |
| `oracle-guards.py <worktree>` | 0; 14/14 harness assertions isolated |
| `standing-checks.py <worktree>` | 0; checks 1–10 all twelve families; twelve actual false-success process refusals |
| Unchanged cycle-1 / cycle-2 / cycle-3 review probes | 0 each; 136 / 1,071 focused probes with zero unexpected outcomes |
| `snapshot-proof.py` / `graph-proof.py` | 0 each; 26 snapshot refusals / 68 graph faults |
| `pm-shard-plans.py --check --config Plans/sharding_config.json` | 0; top-level pass |
| `pm-plan-index.py validate` | 0; parsed top-level pass; 15 copied currentness files SHA-256 matched |
| Current citation audit / `git diff --check` | 0; 372 exact quotes / no whitespace errors |

No `Plans/*.md` or schema rule changes, so no derived regeneration is required. No seal, registry admission, Decision Log, baseline, `.gitignore`, frozen validator or test file is changed. The existing timestamp-format environment qualification remains: this VM does not register date-time in FormatChecker; no executed date-time-format PASS is claimed. The prior 41 unrelated storage-profile omissions and three global 346-versus-344 registry count diagnostics remain integration qualifications, not an all-green governance result.

## Scope, premises and IDs

Canonical owner/schema text remains byte-identical to the reviewed head. Each F-150–F-161 independently retains its own producer, schema, identity, consumer, SP-278, SP-286/CV-339, original custody, cutoff and physical-profile adoption. No sibling supplies an omitted binding. Per-family searches remain `canonical-search.json` (SHA-256 `b1e2eec88ec45180435a41c115da4895b0e38edc96966cfca09319bf5793824d`), `fix1/custody-search.json` (`2b1aad3840e958a4228aed53b5a7212e77ef73f35a955e3cdd832461b0659b96`) and `fix2/storage-search.json` (`4447c37e92c5433fcf93179f335ea8dc5cd5a713813e8c96fbeddbbc6d7e360f`) under the DFM drafts directory.

DL-045/UCC scope, DL-076/SP-278 token, SP-286/CV-339 interfaces, SP-337/SP-340 bounds, F2-205 deletion distinctions and Case L-3 companion authority premises remain as reviewed in cycle 4. No older answer is extended to event-history retention; no unlanded retention answer is applied. Failed premise checks: none. Retention question remains for Jared: which event-history retention class should each exact file/folder completed family use?

IDs used: **F-150–F-161, SP-560, CV-560, ATS-280**. New IDs: **none**. No admission, registry append, subagent, landing lock, main push, browser, server or governance reseal. Initial mailbox inbox/who were read before the task brief was loaded; no registration or message was sent. Root disk/RAM gates passed before checkout (91 GB / 14 GiB available); subsequent samples remained above the 50 GB / 6 GiB floors. The sparse detached worktree is removed after the branch push.

Evidence and reproduction scripts: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DFM/fix4/`. Report and self-grade overwrite the parent DFM copies. The following pins are current:

| Artifact | SHA-256 |
|---|---|
| `completion.json` | `8042f1640c8a270015ee04c3d31cda112e6b010724d0bcaabf9638cd0348d25e` |
| `semantic-guards.json` | `a238752ed32e5f1a8c745f9b5f2f7bff626f51ac80278c0a3802a9548f787630` |
| `schema-guards.json` | `91457b8e969feab2077dc22f2c29d035d4fabe7d195d5651c1eec616a1993cb7` |
| `oracle-guards.json` | `cccb11c2bbd66bb6ac52d1bc16d0eba791617a31566e4fa62037924f617af8a4` |
| `full-check.json` | `b397a22e53ac8ead13f00560ee46734e62f334fa9ec9fc69e989b398a43afd83` |
| `standing-checks.json` | `6d272843663430e3656766ebc53f0a37af09543f2f5313c71e1fc43ade9afb38` |
| `failure-oracles.json` | `ac925e5f1f69680f7d587bc47a13b1cf4bdc81dda8c658e1ac3c11e83c390e4f` |
| `reference-proof.json` | `4e873ec4e81d0cb056c229c98dc9fe7eb3db67ffc77382c95b58db52cc8b32bb` |
| `snapshot-proof.json` | `b0098ccc315837e8a8603767c4db32395f31de5dea1809c7ead3b38121370297` |
| `graph-proof.json` | `d802bdf5c1b9c001d3e6286d89b71fce9c4f69cb8d4bef59bd49ea5cb24472fd` |
| `review-cycle1.json` | `489d295c47c7b5fa9a86e0f90e3ec27a7d37c2f189322d6902e6cab938b83629` |
| `review-cycle2.json` | `8025569510cad957e6d99bb3f490e9eca84eae169ea0e0695687b242d03c4b13` |
| `review-cycle3.json` | `271f2f86e8d776fc152bc788ce5dad88beec61d2bb7434d10f5f141f7e096096` |
| `shard-check.json` | `25e03937700c17eaf1c5af802b6ea0730d0222ae7ca02f62e39577442c305420` |
| `index-validate.json` | `cd22c229213f46b0f5385fbfcc68b90f9f72e57ebe91e82def81bf8923ec0bd4` |
| `citation-audit.json` | `7a11045581a6123f7644bb9196f190d164330364d4003866a5fbefac87c91cd0` |
| `positive-controls.json` | `58ad52aa067d6775fa3e215de06706248a1fe2c467d1d13b42047baaae41cd8b` |
