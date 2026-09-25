# Step 8(c), second half: the Browser-created v2 checkpoint becomes the current definition, 2026-09-25

The `browser.workspace.created` v2 checkpoint successor landed on 2026-09-24 (`22e516b456`) as `conditional_not_admitted`: canon kept v1 as the current route. So the family's consumers and oracles cells stayed PARTIAL in the Step 8(a) depth assessment. SP-266 names what its admission needs: "its closed registered schema, explicit reader/admission revisions and native migration, source, permission and crash proofs before activation". This branch supplies the canon part, under DL-046 and the coordinator's go of 2026-09-24, given under the Step 8 authority Jared gave. The native proofs stay NOT_RUN, which never lowers a grade.

The branch is built on `plans/ea-browser-pair-sp286-20260924` (`2df56dd8a9`, the first half of 8(c)), because both edit SMPFS-167. It lands after that branch.

## What changes

| Surface | Change |
|---|---|
| `Plans/storage_value_registry.json`, the `browser_workspace_created_index_checkpoint` row | Same family and same key, now describing the current v2 writer: `pm.storage_value.browser_workspace_created_index_checkpoint.v2`, schema version 2.0.0, producer `storage.browser_workspace_created_index.v2@2.0.0`, consumer `browser.workspace_inventory.created.v2@2.0.0`, the v2 field lists, the handoff migration text (`store_coordinator`, fail closed), SP-278 in the recovery sources, and the three-generation retention text. The inline `value_schema` is the v2 definition materialized closed: the SP-278 nine-field durable read token and the last-frame cursor are inlined, and no external reference remains. The exact v1 checkpoint is `$defs/checkpoint_v1`, and `$defs/registered_read_value` admits an unchanged retained v1 value only for the StorageMigrationCoordinator handoff. That follows the `restore_point_retention_summary` registered-read precedent, narrowed to the handoff. The family count stays 294. |
| `Plans/browser_workspace_created_checkpoint_v2.schema.json` and its fixtures | `x-pm-definition-status` and the binding's `definition_status` change from `conditional_not_admitted` to `newly_authored_owner_contract`, and the description says the definition is current. The title and the fixtures' claim boundary no longer say conditional. |
| `Plans/browser_event_admission.json`, row 0 | `authority_contract_ref` names the v2 schema's `x-pm-event-authority-binding`. The event family registry row is unchanged, so the PNC-019 checkpoint does not move. Its `source_refs` still name the v1 binding, which stays as compatibility custody. That pointer can ride with the next registry revision that needs approval anyway. |
| `Plans/Section15_MVP_Promoted_Features_Spec.md` | The read-consumer subsection names the current v2 reader. The successor subsection says v2 replaced the v1 read route at the 2026-09-25 admission and serves history on a store only after the StorageMigrationCoordinator migration is installed there, gains a dated admission paragraph, and says v1 was current only until now. SMPFS-167's `canonical_text` and acceptance criterion 5 say the same. |
| `Plans/storage-plan.md` | The SP-266 successor subsection says v1 was current until this admission and gains a dated admission paragraph. SP-266's `canonical_text` and criterion 6 say the same. The section 2.3.1 note records the fifth stored checkpoint value that holds the nine-field durable token. |
| `scripts/pm_browser_workspace_created.py` | New `checkpoint_v2_bundle`, `durable_read_token` and `expected_binding`. `expected_storage_family` returns the v2 row. `binding_failures` requires the v2 binding, the v2 `authority_contract_ref`, a current definition status and the exact v2 registry row. The v1 oracles stay, for the retained v1 value. |
| `scripts/pm_browser_workspace_created_v2.py` | Reports the current definition status. |
| `scripts/pm-implementation-readiness.py` | The self-test's `read_token_families` and `persisted_tokens` include the created checkpoint. |
| `tests/test_pm_browser_workspace_created.py` | The status assertion inverts. Two new tests:<br>- the registry row equals the v2 bundle: no external references, the fixtures validate, the durable token equals SP-278's without `redb_snapshot_id`, and the handoff dispatcher admits the retained v1 fixture and rejects a mangled one;<br>- the admission row names only the v2 binding, and the v1 reference is rejected.<br>65 tests. |

Derived files are regenerated with the currentness edition present: the `storage-plan`, `section15_mvp_promoted_features_spec` and `storage_value_registry` shard trees and `Plans/.plan_index`. The registry JSON is a sharded source, so a change to one row rewrites its shard tree.

## Checks (worktree, based on `2df56dd8a9`)

- **Created tests.** `test_pm_browser_workspace_created`: 65 OK. `pm_browser_workspace_created_v2.py`: PASS on its three positive cases, status `newly_authored_owner_contract`, native NOT_RUN.
- **Other Browser checks.** `test_pm_browser_workspace_reset`, `test_pm_browser_event_admission` and `test_pm_onboarding_phases` pass, and `pm-browser-event-admission.py` passes.
- **Readiness self-test.** The same three failing checks as on the base, and no new ones.
- **Readiness validate: 24 failures on the base, 30 here.** Every one of the 6 new rows is staleness:
  - the Spec Lock hashes of `Plans/storage_value_registry.json` and `scripts/pm-implementation-readiness.py` (three readiness rows read the latter);
  - the PNC-019 receipt's pin of `Plans/storage_value_registry.json`;
  - currentness drift for `Plans/storage-plan.md` and `Plans/storage_value_registry.json`.
- **Shards and index.** The shard check passes. `pm-plan-index.py validate` reports only the five Decision Log units (DL-079 to DL-083) that `main` added after this branch's base. They clear at the rebase.

## Landing

- **Order.** After `plans/ea-browser-pair-sp286-20260924`, and after the landing-check exports repair. The branch edits `Plans/storage-plan.md` (85 plan-sharding rows) and `Plans/storage_value_registry.json` (554 rows including its shards), both well over the print cap.
- **At landing.** Rebase onto `main`, and regenerate the derived files with the currentness edition present, never hand-merged. Then rerun the checks above.
- **Reseal request:**
  - the Spec Lock entries of `Plans/storage_value_registry.json`, `Plans/storage-plan.md`, `Plans/Section15_MVP_Promoted_Features_Spec.md` and `scripts/pm-implementation-readiness.py`;
  - the PNC-019 receipt's pin of `Plans/storage_value_registry.json`;
  - the plan-sharding evidence rows of the three documents and their shards;
  - a currentness edition covering them;
  - the readiness report and the migration snapshot.

## Effect on the depth grades

Once this lands with the first half, a regrade of `browser.workspace.created` should find:
- the producer passing (SP-286 by name);
- the consumers passing (the v2 SP-278 reader is the current route);
- the oracles passing (the v2 oracles now test the route in force).

That is 12 of 12. `browser.workspace.reset` is complete with the first half alone. Their DL-077 admission records then pass once they are re-pinned to the regraded assessment. The grades themselves move only in that regrade.
