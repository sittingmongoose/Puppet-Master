# Step 8(c), second half: the Browser-created v2 checkpoint becomes the current definition, 2026-09-25

The `browser.workspace.created` v2 checkpoint successor landed on 2026-09-24 (`22e516b456`) as `conditional_not_admitted`: canon kept v1 as the current route. So the family's consumers and oracles cells stayed PARTIAL in the Step 8(a) depth assessment. SP-266 names what its admission needs: "its closed registered schema, explicit reader/admission revisions and native migration, source, permission and crash proofs before activation". This branch supplies the canon part, under DL-046 and the coordinator's go of 2026-09-24, given under the Step 8 authority Jared gave. The native proofs stay NOT_RUN; the Step 8 plan holds that this does not lower a grade (see the last section).

The branch was built on `plans/ea-browser-pair-sp286-20260924` (`2df56dd8a9`, the first half of 8(c)), because both edit SMPFS-167. That first half landed at `main` `a3d6bb616b` (record `1e5d9b097b`), and this branch is rebased onto `1e5d9b097b`: SMPFS-167 keeps this branch's v2 sentence and criterion 5 and `main`'s SP-286 sentence, criterion 6 and validation entry.

## What changes

| Surface | Change |
|---|---|
| `Plans/storage_value_registry.json`, the `browser_workspace_created_index_checkpoint` row | Same family and same key, now describing the current v2 writer: `pm.storage_value.browser_workspace_created_index_checkpoint.v2`, schema version 2.0.0, producer `storage.browser_workspace_created_index.v2@2.0.0`, consumer `browser.workspace_inventory.created.v2@2.0.0`, the v2 field lists, the handoff migration text (`store_coordinator`, fail closed), SP-278 in the recovery sources, and the three-generation retention text. The inline `value_schema` is the v2 definition materialized closed: the SP-278 nine-field durable read token and the last-frame cursor are inlined, and no external reference remains. The exact v1 checkpoint is `$defs/checkpoint_v1`, and `$defs/registered_read_value` admits an unchanged retained v1 value only for the StorageMigrationCoordinator handoff. That follows the `restore_point_retention_summary` registered-read precedent, narrowed to the handoff. The family count stays 294. |
| `Plans/browser_workspace_created_checkpoint_v2.schema.json` and its fixtures | `x-pm-definition-status` and the binding's `definition_status` change from `conditional_not_admitted` to `newly_authored_owner_contract`, and the description says the definition is current. The title and the fixtures' claim boundary no longer say conditional. |
| `Plans/browser_event_admission.json`, row 0 | `authority_contract_ref` names the v2 schema's `x-pm-event-authority-binding`. The event family registry row is unchanged, so the PNC-019 checkpoint does not move. Its `source_refs` still name the v1 binding, which stays as compatibility custody. That pointer can ride with the next registry revision that needs approval anyway. |
| `Plans/Section15_MVP_Promoted_Features_Spec.md` | The read-consumer subsection names the current v2 reader. The successor subsection says v2 replaced the v1 read route at the 2026-09-25 admission and serves history on a store only after the StorageMigrationCoordinator migration is installed there, gains a dated admission paragraph, and says v1 was current only until now. SMPFS-167's `canonical_text` and acceptance criterion 5 say the same. |
| `Plans/storage-plan.md` | The SP-266 successor subsection says v1 was current until this admission and gains a dated admission paragraph. SP-266's `canonical_text` and criterion 6 say the same. In section 2.3.1 the SP-278 read-token rule lists the created checkpoint among the five stored checkpoint values that hold the nine-field durable token, a note records the date, and the `restore_point_retention_summary` registered-read paragraph names the created family's narrower handoff dispatcher. |
| `scripts/pm_browser_workspace_created.py` | New `checkpoint_v2_bundle`, `durable_read_token` and `expected_binding`. `expected_storage_family` returns the v2 row. `binding_failures` requires the v2 binding, the v2 `authority_contract_ref`, a current definition status and the exact v2 registry row. The v1 oracles stay, for the retained v1 value. |
| `scripts/pm_browser_workspace_created_v2.py` | Reports the current definition status; its docstring no longer says conditional. |
| `scripts/pm-implementation-readiness.py` | The self-test's `read_token_families` and `persisted_tokens` include the created checkpoint. |
| `tests/test_pm_browser_workspace_created.py` | The status assertion inverts. Two new tests:<br>- the registry row equals the v2 bundle: no external references, the fixtures validate, the durable token equals SP-278's without `redb_snapshot_id`, the handoff dispatcher admits the retained v1 fixture and rejects a mangled one, and the writer root rejects the retained v1 value;<br>- the admission row names only the v2 binding, and the v1 reference is rejected.<br>65 tests. |

Derived files are regenerated with the currentness edition present: the `storage-plan`, `section15_mvp_promoted_features_spec` and `storage_value_registry` shard trees and `Plans/.plan_index`. The registry JSON is a sharded source, so a change to one row rewrites its shard tree.

## Checks (rebased onto `1e5d9b097b`)

- **Created tests.** `test_pm_browser_workspace_created`: 65 OK. `pm_browser_workspace_created_v2.py`: PASS on its three positive cases, status `newly_authored_owner_contract`, native NOT_RUN.
- **Other Browser checks.** `test_pm_browser_workspace_reset`, `test_pm_browser_event_admission` and `test_pm_onboarding_phases` pass, and `pm-browser-event-admission.py` passes.
- **Readiness self-test.** The same three failing checks as on the base, and no new ones.
- **Readiness validate: 28 failures on the base, 33 here.** Every one of the 5 new rows is staleness:
  - the Spec Lock hashes of `Plans/storage_value_registry.json` and `scripts/pm-implementation-readiness.py` (three readiness rows read the latter);
  - currentness drift for `Plans/storage_value_registry.json`.

  The PNC-019 receipt's pin of `Plans/storage_value_registry.json` and the currentness drift of `Plans/storage-plan.md` and Section 15 are already on `main`; the first changes value.
- **Shards and index.** The shard check passes (99 documents, 2,726 shards). The index has 6,728 PlanUnits and 26,260 acceptance units; against `1e5d9b097b` no unit is added or removed, and only SMPFS-167 and SP-266 change content.

## Landing

- **Order.** Both preconditions are met: the first half is on `main` (`a3d6bb616b`, record `1e5d9b097b`), and so is the landing-check exports repair, so evidence and plan graph are keyed from their complete exports. The branch edits `Plans/storage-plan.md` (85 plan-sharding rows, already stale on `main`) and `Plans/storage_value_registry.json` (554 rows including its shards, all new).
- **At landing.** Rebase onto `main`, and regenerate the derived files with the currentness edition present, never hand-merged. Then rerun the checks above.
- **Reseal request:**
  - the Spec Lock entries of `Plans/storage_value_registry.json`, `Plans/storage-plan.md` and `scripts/pm-implementation-readiness.py` (Section 15 has no Spec Lock entry);
  - the PNC-019 receipt's pin of `Plans/storage_value_registry.json`;
  - the plan-sharding evidence rows of the three documents and their shards; for `Plans/_shards/storage_value_registry` the file list changes too, because regeneration renamed the last shard: `551-lines-110001-110108.md` is gone and `551-lines-110001-110200.md` to `555-lines-110801-110832.md` are new;
  - a currentness edition covering them;
  - run-002 `refresh-batch-hashes` for batch report rows 168 to 170 and 173 to 180 (already on the wave's list);
  - the readiness report and the migration snapshot.

## Expected at landing

Measured on `git archive` exports of `1e5d9b097b` and of this branch, with the currentness edition linked; a forecast for `pm-landing-check.py --base origin/main` against the baseline `792d2fb8b1`, if `main` does not move first.
- **Per aggregate, against `main`:** evidence +554 and plan graph +554 (553 `artifact_hash_stale` rows for `Plans/storage_value_registry.json` and its shards, and 1 `missing_ref` for `Plans/_shards/storage_value_registry/551-lines-110001-110108.md`, which regeneration renamed); readiness +5 (28 to 33); Spec Lock +2 (2 to 4); run-002 no new row, with rows 168 to 170 and 173 to 180 changing value. Every other subcheck is unchanged. That is +1,115 per aggregate: `run-gates` and `audit-governance` go from 1,835 (at `a3d6bb616b`, per its landing record) to 2,950.
- **`plan-migration-validate`:** 33,072, unchanged. No new key; 835 rows change value (825 name `storage-plan.md`, 7 Section 15, 3 no document).
- **Against the baseline, in each aggregate:** evidence and plan graph 0 to 727, implementation readiness 24 to 33, plan migration 2 to 15, Spec Lock 0 to 4. That is 1,480 new rows per aggregate, 2,960 in all.
- **Exit 1, with 0 blocking items.** Every new row is staleness except the 4 `missing_ref` rows, 1 each for evidence and plan graph in each aggregate. They name no branch path: their path is the bundle, and the shard path is a derived one. So the check reports them as new failures that name none of this branch's files. This branch causes them, and the reseal's bundle update clears them.
- **Pre-existing.** `implementation_readiness_self_tests_failed` names `scripts/pm-implementation-readiness.py`, which this branch edits. It was on the baseline (count 1, the same fingerprint `278ef94b633b`), so rule 2 keeps it from stopping the landing.

## Effect on the depth grades

This is a forecast for the next regrade, not a result. If the regrade accepts the canon admission with the native proofs NOT_RUN, as the Step 8 plan says it should, `browser.workspace.created` can reach 12 of 12:
- the producer passing (SP-286 by name);
- the consumers passing (the v2 SP-278 reader is the specified current route);
- the oracles passing (the v2 oracles test the route in force).

Two things can hold it lower. The depth42 grader's note for this family says "text alone does not make v2 current". SMPFS-167-A006 has a named native obligation but no executable oracle. `browser.workspace.reset` reaches 12 only if the regrade keeps its oracle cell for SMPFS-168-A005, which likewise has no executable oracle. The DL-077 admission records of both families fail closed until they are re-pinned to a regraded assessment with all twelve criteria passing. The grades themselves move only in that regrade.

## Open questions

The cycle 1 review (`/mnt/Cursor/PM-Experiments/review-ea-browser-created-v2-20260925/findings.jsonl`, SHA-256 `8c82f1985c139f1201f6865988fe3dfdc6d333e2875ab995b3feed2093c72248`) raised three optional notes that are not in its patch. This repair round leaves them open. The line numbers are the reviewer's, on `dcc29db585`; after the V2-01 repair, Section 15 lines from 11577 on are two higher.

- **V2-09 (note): some v1 definitions still read as current, though a later dated sentence supersedes them.**
  - The storage-plan v1 section says "Only the new Storage binding writes it", meaning v1.
  - SMPFS-167's `canonical_text` keeps "`browser.workspace_inventory.created.v1@1.0.0` reads the historical creation fact" in the present tense, before "Since 2026-09-25 the current reader is ... v2".
  - The v1 contracts schema's binding keeps `definition_status` `newly_authored_owner_contract`. It is unchanged, and the admission row no longer names it.
  - The conditional subsection's opening, "The registered v1 value and binding above were the current definitions until ...", covers them, so this is not a contradiction. The heading "Conditional SP-266 v2 successor ..." is kept in both documents, because renaming it would rename shards.
  - Citation: `Plans/storage-plan.md` lines 19735-19764; `Plans/Section15_MVP_Promoted_Features_Spec.md` lines 11609-11618 (`canonical_text`; the present-tense v1 sentence is at 11613); `Plans/browser_workspace_created_contracts.schema.json`, unchanged between `1e5d9b097b` and `dcc29db585`.
  - The optional repair adds a dated "2026-09-25 amendment" paragraph after storage-plan line 19764.
- **V2-12 (note): SMPFS-167's `depends_on` lacks SP-278.**
  - It is still `[DL-046, SMPFS-166, CV-332, SP-286, CV-339]`, although its current reader relies on the SP-278 token, as criterion 5 says.
  - The reset counterpart, SMPFS-168, lists SP-278. SP-266, which depends on SMPFS-167, lists it too, so the dependency is reached only indirectly.
  - Citation: SMPFS-167's YAML (`depends_on` at Section 15 line 11622) and SMPFS-168's `depends_on`, `[DL-046, SMPFS-166, CV-332, SP-278, SP-286, CV-339]`.
  - The optional repair adds SP-278. It changes `Plans/.plan_index/dependencies.json` on regeneration.
- **V2-13 (note): the registry row's consumers do not name the StorageMigrationCoordinator handoff reader of the retained v1 value.**
  - The row's `consumers` is only `browser.workspace_inventory.created.v2@2.0.0`. The handoff that reads the retained v1 value, the registered read dispatcher's only other user, appears only in the row's migration text.
  - Precedents name coordinator readers as consumers: the MVP import rows ("StorageMigrationCoordinator one-time owner-boundary normalizer") and `restore_point_retention_summary` ("Storage restore-point retention/recovery").
  - This does not break SP-266's "explicit reader" condition, since the versioned reader is explicit.
  - Citation: the `browser_workspace_created_index_checkpoint` row of `Plans/storage_value_registry.json` (`consumers`, `migration`); the storage-plan section 2.3.1 bullet "MVP rows retired to import readers"; the `restore_point_retention_summary` consumers list.
  - The optional repair adds "StorageMigrationCoordinator same-key v1 handoff" to `consumers`, in the row and in `expected_storage_family()` together.
