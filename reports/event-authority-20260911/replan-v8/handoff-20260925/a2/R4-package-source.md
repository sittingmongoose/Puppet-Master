# R4 — Private source packages: consumer-side material for A2

Reader R4, Replan v8 Step 8(b) Group A, A2 scoping. Read-only. Written 2026-09-25.

Refs and roots used:
- `main` = `origin/main` = `63cf2cb97f936c91dd7bb5c585d9a35d8409ed61`.
- `A1` = `origin/plans/replan-v8-a1-20260925` = `e8d61ace4c219723022fd9fea7187ffedc8b3b14`.
- `PKG` = `/home/user/pmpkg-push/replan-v8/` (packages repo tip `3928dd6`).
- `V3` = `PKG/goal-replan-combined-source-20260921/v3` (manifest sha256 `9ed8ba4f825939cc59b37941aafe1068be7ed2d6ada87c0e3b8eaa3b5225896e`).
- `CD` = `PKG/goal-replan-v8-canonical-draft-20260925/v1` (manifest sha256 `bb6be609d20536be795bdaab41de179e85caec79e9d5973e16d6e0b3c2139ba5`).
- `REL` = `PKG/goal-run-replanned-source-contract-20260920-relocated-20260921` (the original Replan v1/v2/v3 source packages).

"prop." marks a proposal or an inference of mine. Everything else is read from bytes.

---

## 1. Inventory: every consumer-side item in the packages

### 1.1 `V3/author_consumer.py` (31 lines, sha256 `5f6167fa…`, a manifest member: `V3/manifest.json:80` `"path": "author_consumer.py"`)

What it reads:
- `V3/author_consumer.py:2` reads a host path: `R=pathlib.Path('/home/sittingmongoose/PM-Experiments/goal-run-replanned-source-contract-20260920/v3')`. That is the original Replan v3 package. It is `REL/v3` in the packages repo.
- `:6` copies `composition/authoring-roots/replan-consumer.schema.json` from it, after asserting its hash against that package's manifest: `assert any(x['path']==f and x['sha256']==sha(b) for x in m['files'])`.

What it writes (seven outputs):
1. `inputs/replan-v3/composition/authoring-roots/replan-consumer.schema.json` — a byte copy (`:6`). sha256 `f225be42…`.
2. `schemas/replan-consumer.v4.schema.json` — the v3 root with its `$id` bumped v3→v4 and the Replan source `$ref` remapped (`:7-8`, `:18`): `newid=oldid.replace('.v3.','.v4.')`. sha256 `1da161c5…`.
3. `active-resource-ids.json` — adds `replan-consumer.v4.schema.json` → the new id (`:18`).
4. `whole-successor-lineage.json` — appends one lineage row with `'source_realm':'replan_authoring_original'` (`:19`).
5. `complete-method-occurrences.json` — rewrites every old consumer id prefix to the new id inside `complete_combined_declaration` (`:20-28`).
6. `input-pins.json` — appends a `replan-v3` pin with the host `original_path` (`:29`).
7. `external-consumer-adoption-boundary.json` — the adoption-boundary statement (`:30`). sha256 `b1690147…`.

Measured: the v3→v4 step changes only ids. A structural diff of output 1 against output 2 gives 76 changed strings: 71 are the consumer `$id`/`$ref` prefix v3→v4 and 5 are the Replan source prefix v3→v4. Nothing else changes.

### 1.2 The consumer schema, in all its editions

| Edition | Path | sha256 | Placed in canon? |
|---|---|---|---|
| Original Replan v1 | `REL/v1/replan-consumer.schema.json` | `856f42ae…` | no |
| Original Replan v2 | `REL/v2/replan-consumer.schema.json` / `REL/v2/composition/authoring-roots/replan-consumer.schema.json` | `bb51991e…` / `bc4b5ddb…` | no |
| Original Replan v3, validation form | `REL/v3/replan-consumer.schema.json` = `V3/inputs/replan-v3/replan-consumer.schema.json` | `3cab8fcb…` | no |
| Original Replan v3, authoring root | `REL/v3/composition/authoring-roots/replan-consumer.schema.json` = `V3/inputs/replan-v3/composition/authoring-roots/replan-consumer.schema.json` | `f225be42…` | no (cited as lineage token only) |
| Combined v3 successor (v4 id) | `V3/schemas/replan-consumer.v4.schema.json` | `1da161c5…` | no, but its renamed edition is |
| Combined v3 validation copy | `V3/composition/roots/replan-consumer.v4.schema.json` | `d5f83b3f…` | no |
| A1 canonical edition | `CD/after/Plans/workflow_combined_source_contracts/replan/schemas/goal-run-started-cancelled-replanned-consumer.v1.schema.json` | `7602020e…` | **yes**, byte-identical at `A1` |

Notes:
- The validation form (`3cab8fcb`) points at `drafts/replan_v2_composition/goal_run_cancelled_consumer_schema_resources--native_consumer/…` URIs. The authoring root (`f225be42`) points at canon `proposals/…` URIs. The v4 validation copy (`d5f83b3f`) points at `drafts/combined_v8_validation/replan_goal_run_cancelled_consumer_schema_resources--native_consumer/…` URIs. None of the three validation or draft-URI forms is in canon. A1 resolves through canon realms instead (`A1:Plans/workflow_combined_source_contracts/resource-realms.json`, realms `native_consumer`, `goal_consumer`, `filesafe_consumer`, each bound to `Plans/goal_run_cancelled_consumer_schema_resources.json`).
- `A1` placed edition vs `V3/schemas/replan-consumer.v4`: a structural diff gives 78 changed strings. 71 are the consumer id → `https://puppetmaster.local/proposals/goal_run_started_cancelled_replanned_consumer.v1.schema.json`. 5 are the source id → `…/proposals/workflow_replan_source.v1.schema.json`. The other 2 are renames of the generation profile (`draft.goal_run_started_cancelled_replanned_projector.20260920.v2` → `goal_run_started_cancelled_replanned_projector.v1`) and the checkpoint schema id (`pm.draft.goal_run_replan_checkpoint.20260921.v3` → `pm.goal_run_started_cancelled_replanned_checkpoint.v1`). The grammar is otherwise unchanged from the original v3 authoring root.

### 1.3 What the placed consumer schema contains (read at `A1`)

File: `A1:Plans/workflow_combined_source_contracts/replan/schemas/goal-run-started-cancelled-replanned-consumer.v1.schema.json` (2121 lines).

- 44 `$defs`. 38 of them equal the 38 `$defs` of `main:Plans/goal_run_cancelled_consumer_contracts/consumer.schema.json` exactly, once the `$id` is substituted (my structural check: 38 same, 0 different). That canon file's `$id` is `…/proposals/goal_run_started_cancelled_consumer.v1.schema.json` (`main:Plans/goal_run_cancelled_consumer_contracts/consumer.schema.json:3`).
- 6 `$defs` are new: `ReplannedProjection` (line 1770), `ReplanCombinedProjection`, `ReplanGeneration`, `ReplanCheckpoint` (1994), `ReplanProjectInput`, `ReplanProjectResult` (2092).
- The file says so itself, at line 2120: `"NEW disjoint full source draft; all predecessor definitions preserved. Adds exact replanned projection/consumer/checkpoint only; unsupported relevant families refuse."`
- Checkpoint identity, line 2008: `"const": "pm.goal_run_started_cancelled_replanned_checkpoint.v1"`. Generation profile, line 1909: `"const": "goal_run_started_cancelled_replanned_projector.v1"`.
- `ReplanCheckpoint.generations` has `"maxProperties": 3` (line 2037).
- Tokens: `ReplanGeneration.source_token_at_birth` and `ProcessedPrefix.generic_token` both `$ref` the local `DurableGenericToken` (defined at line 178). Its required set is nine fields: `checkpoint_key, checkpoint_ref, frontier_revision, frontier_sha256, generation_anchor_sha256, generation_id, index_dataset_name, source_selection, storage_instance_id`. No `redb_snapshot_id`.
- But `ReplanProjectResult.generic_token` (line 2114-2115) is `"$ref": "https://puppetmaster.local/schemas/event_record_index_checkpoint/1.0.0/schema.json#/$defs/read_token"`. On `main` that `read_token` requires `redb_snapshot_id` (`main:Plans/event_record_index_checkpoint.schema.json:2583` `"redb_snapshot_id"`). `GenericSnapshot.token` (line 898) is the same ref, inherited unchanged from the canon cancelled consumer. These are result/transient shapes, not stored wrappers. prop.: A2 must keep any stored wrapper from reaching `ReplanProjectResult.generic_token`, per DL-076.
- **No certified definitions.** `main:Plans/goal_run_certified_consumer_contracts/schemas/consumer.v1.schema.json` (`$id` `…/proposals/goal_run_started_cancelled_certified_consumer.v1.schema.json`) has 34 `$defs`. Only 9 are shared by name with the placed Replan consumer. The 25 certified-only ones (`CertifiedProjection`, `OriginalCertified`, `CurrentCertified`, `TypedCertifiedEvent`, …) are absent. The certified consumer's projection id is `pm.goal_run_projection.started_cancelled_certified.v5` (line 474 of that file). The placed Replan consumer's highest projection record is `pm.goal_run_projection.started_cancelled.v4` (placed line 1405).
- **No stored projection-row wrapper for the replanned row.** The placed file has `StorageProjection` (`pm.goal_run_projection.started.v3`, line 557) and `CombinedStorageProjection` (`…started_cancelled.v4`, line 1405). There is no `Storage…Projection` for `ReplanCombinedProjection`. No `pm.goal_run_projection.*.v6` string exists on `main` or `A1` (census: `main` has only `started.v3`, `started_cancelled.v4`, `started_cancelled_certified.v5`).

### 1.4 The adoption boundary (what the source says A2 must contain)

`A1:Plans/workflow_combined_source_contracts/external-consumer-adoption-boundary.json` (sha256 `1372f351…`, 19 lines). It differs from `V3/external-consumer-adoption-boundary.json` (`b1690147…`) in one value only, `schema_id` (line 6).

Line 3: `"status": "SEPARATE_EXTERNAL_CONSUMER_ADOPTION_REQUIRED_NOT_ADMITTED"`.

Line 11: `"existing_certified_v7_consumer": "Preserved exact existing source and acceptance scope. It is not cast to combined v8 by matching common fields, Event type, URI alias or validation namespace."`

`remaining_exact_adoption`, lines 13-16, four obligations, verbatim:
1. (13) `"A separate original certified consumer source successor must explicitly bind this complete native v8 profile, full original released certified coordinator source, same complete original payload/clock/family rules and actual fixed native registration."`
2. (14) `"Replan whole consumer successor must be bound at genuine consumer/checkpoint birth to its exact original source publication, full retained current Event/index/checkpoint and new combined source roots."`
3. (15) `"Started/cancelled combined-profile consumers require separate exact source-profile adoption of whole original source/clock/custody/checkpoint rules; the unchanged Event registry still selects existing original families."`
4. (16) `"Projector/checkpoint/backfill/retention/consumer declarations and exact owner original registration are independent required adoption work. No registry row, native installation, runtime execution, schema instance or product Event admission occurs in this source-only package."`

Line 5 still reads `"path": "schemas/replan-consumer.v4.schema.json"`, a V3-relative name. It is resolved by the alias table: `A1:Plans/workflow_combined_source_contracts/composition.json:201` `"schemas/replan-consumer.v4.schema.json": "Plans/workflow_combined_source_contracts/replan/schemas/goal-run-started-cancelled-replanned-consumer.v1.schema.json"`. Not a defect; A2 should cite through that table.

### 1.5 Consumer protocol text

- `A1:Plans/workflow_combined_source_contracts/replan/protocol.md:116`: `"Existing certified v7 consumers cannot be cast to native v8. Started/cancelled/Standard and Replan consumer, checkpoint, projector, backfill, source-retention and actual owner registration require their own exact source-profile adoption."` The same paragraph is at line 116 of `V3/PROTOCOL.md`, `V3/native-v8/protocol.md`, `V3/coordinator/protocol.md` and `V3/producer-combined/protocol.md`.
- `A1:…/replan/protocol.md:233` is the projector contract. Key sentences: `"It preserves all original started/cancelled definitions and adds a disjoint replanned row and complete per-run generation/checkpoint. It processes the full SP-278 global prefix, including nonmatching source"`; `"Duplicate/conflicting/unsupported relevant source refuses a current projection instead of retaining falsely running/certified state."`; `"Commit projection and checkpoint frontier together in one actual projector transaction"`; `"The three-generation source-bounded retention and current/historical reader distinction remain exact."` Its origin is `REL/v3/PROTOCOL.md:119` (= `V3/inputs/replan-v3/PROTOCOL.md:119`).
- `A1:…/replan/protocol.md:231` (retention): `"Current/staged/retired projections together count toward three and copied Event data stays source-bounded. No reference or checkpoint automatically creates a hold or extends an original lifetime."`
- `A1:…/replan/protocol.md:263` names the placed identity: `"The source, observer and consumer whole successors have the distinct resource identities `workflow_replan_source.v1`, `executor_workflow_replan_observer.v1` and `goal_run_started_cancelled_replanned_consumer.v1` under `replan/schemas/`"`.
- Lines 123 and 233 still name `../schemas/replan-consumer.v4.schema.json`. The alias at `A1:…/composition.json:698` resolves it.

### 1.6 Consumer methods and the release dependency

- `A1:Plans/workflow_combined_source_contracts/replan/methods.json:538` `owner.workflow.replan.project.v1`: `"owner": "actual per-run Storage projector"`, input `…replanned_consumer.v1.schema.json#/$defs/ReplanProjectInput`, output `…#/$defs/ReplanProjectResult`, `"combined_allowed_actual_phases": ["replan:observed", "idle:original_replan_release"]`, status `SOURCE_SPECIFICATION_NOT_INSTALLED`. Its origin is `draft.replan.project.v3` in `V3/inputs/replan-v3/methods.json`.
- `…/replan/methods.json:503` `owner.workflow.replan.release.v1`: input `workflow_replan_source.v1#/$defs/ReleaseInput`, phase `replan:observed` only.
- `ReleaseInput` (`A1:…/replan/schemas/workflow-replan-source.v1.schema.json:4406`) reaches `ReplanProjectionAdmission` (line 4428). Its `original_projection` (lines 212-213) is `"$ref": "https://puppetmaster.local/proposals/goal_run_started_cancelled_replanned_consumer.v1.schema.json#/$defs/ReplanProjectResult"`. A1 set this with repair `RP-U3Q13` (`CD/data/repair-patches.json`: `"reason": "stale consumer v3 reference repointed to the placed consumer root"`).

### 1.7 Checkpoint candidate #23

- `A1:Plans/workflow_combined_source_contracts/physical-families.json:237-245`: `"family_id": "goal_run_started_cancelled_replanned_checkpoint"`, `"status": "A2_SUCCESSOR_REQUIRED_NOT_REGISTERED"`, key `goal_run_started_cancelled_replanned_checkpoint.v1:H(storage_instance_id):H(project_id):H(goal_id):H(goal_run_id)`, `"codec": "pm.workflow.activation_source_json.v1"`, `"retention_policy_ref": "RP-PROJECTION-3GEN"`, `"producer": "owner.workflow.replan.project.v1"`.
- Line 393: `"goal_run_started_cancelled_replanned_checkpoint is not registered (A2)."`
- Its origin is `draft_replan_projection_checkpoint` in `V3/inputs/replan-v3/physical-families.draft.json:237`.
- `CD/proposed-registry-rows.json:4215-4221` `not_registered`: `"reason": "P-06 / O-15: no projection or checkpoint row in A1; A2 authors a GRS-085/SP-317 successor pair."`
- No projection-row family is drafted anywhere in the packages. Only the checkpoint exists as a candidate.

### 1.8 Descriptor membership (constraint on A2)

`A1:Plans/workflow_combined_source_contracts/installed-profile.json` (all_writers.v8, digest `7b22c1f4…`) lists as members, among others:
- line 693: the placed Replan consumer schema;
- line 698: `workflow-replan-source.v1.schema.json`;
- line 678: `replan/methods.json`;
- line 578: `external-consumer-adoption-boundary.json`;
- lines 388, 393, 398: `main`'s cancelled-causal-arguments, `goal_run_cancelled_consumer_schema_resources.json` and the started `consumer.schema.json`.

Line 24: `"consumer": "None admitted. The certified v8, Replan and started/cancelled combined-profile consumers and the projector, checkpoint, backfill and retention declarations are A2's."`

prop. (inference, not stated in any package): editing any of these members changes the v8 descriptor digest. So A2 should add new files and leave the v8 members byte-identical. The pinned types are `project.v1`'s `ReplanProjectInput`/`ReplanProjectResult` and release's `ReplanProjectionAdmission.original_projection`. An A2 successor projector must either still produce exactly that `ReplanProjectResult`, or be bound by a new method or profile. This needs a design ruling.

---

## 2. What A1 already placed vs. what is package-only

### 2.1 Placed (sha256 equal)

All 74 files under `CD/after/Plans/` equal their blobs at `A1` byte for byte. I checked each with `sha256sum` against `git show A1:<path>`: 74 of 74 equal, 0 differ. Consumer-relevant placed files:

| Placed path at `A1` | sha256 | V3 origin |
|---|---|---|
| `…/replan/schemas/goal-run-started-cancelled-replanned-consumer.v1.schema.json` | `7602020e…` | `V3/schemas/replan-consumer.v4.schema.json` (renamed only, §1.2) |
| `…/external-consumer-adoption-boundary.json` | `1372f351…` | `V3/external-consumer-adoption-boundary.json` (`schema_id` only) |
| `…/replan/methods.json` (`project.v1`, `release.v1`) | in descriptor | `V3/replan/methods.json` |
| `…/replan/protocol.md` (lines 116, 231, 233) | in descriptor | `V3/replan/protocol.md` |
| `…/physical-families.json` (#23 marked) | in descriptor | `V3/replan-and-combined-physical-families.json` + `RP-P06-CHECKPOINT-MARK` |
| `…/whole-successor-lineage.json` row 141-146 | in descriptor | `V3/whole-successor-lineage.json:141-146`, with `source_path` tokenized to `external-source-evidence:sha256:f225be42…` |

### 2.2 Package-only (A2 could start from these; never copy into canon)

- `CD/design/U3-replan-storage.md` §4 (lines 378-466). This is the most complete statement of what the A2 projection successor must contain.
  - §4.2 option A-succ proposes two new rows. The projection is `goal_run_started_cancelled_certified_replanned_projection` (name open), `redb_projection`, key `goal_run_projection.v6:K(project_id):K(goal_run_id)`, `pm.goal_run_projection.started_cancelled_certified_replanned.v6` / `6.0.0`. The checkpoint is `pm.goal_run_started_cancelled_certified_replanned_checkpoint.v1`.
  - Both rows `messagepack_canonical`, `RP-PROJECTION-3GEN`. `source_family_ids` are `/families/293`'s 64 plus the v8 Replan families.
  - Package changes: `"Rebase the Replan consumer successor on the SP-317 consumer (Plans/goal_run_certified_consumer_contracts/schemas/consumer.v1.schema.json) plus ReplannedProjection, scoped to v8 births."`
  - Hazard (line 425): `"If A3's stopped and blocked contracts extend GRS-085 first with their own successor pair (v6), the replanned successor must become v7 and include stopped and blocked ... two branches must not each claim goal_run_projection.v6."`
  - §4.3 records the codec and key conflict of the draft #23: `json_canonical` with `H()` as authored, against `messagepack_canonical` with `K()` in all three predecessor checkpoints.
  - §4.4 recommends A-succ in A2. It also recommended repointing `ReplanProjectionAdmission` to an "A2 successor pending" form. A1 instead repointed it to the placed consumer (RP-U3Q13, §1.6).
- `CD/design/U3-replan-storage.md:636` U3-Q7: `"Storage-owner ruling on §2.3.1 line 519 for DurableGenericToken stored under source_token_at_birth/generic_token … This form already exists on main in three consumers."`
- `CD/design/A1-canonical-draft-design.md:469` (P-06) and `:650` (O-15: `"A2 and A3 agree one goal_run_projection.vN chain"`).
  - P-06 also says the consumer root would carry status `NOT_THE_MANDATORY_RUN_HISTORY_PROJECTOR_UNREGISTERED_A2_SUCCESSOR_REQUIRED`. That string occurs nowhere at `A1` (`git grep` count 0). It occurs only in the design. The placed consumer carries only its v3 `$comment`.
- `V3/composition/roots/replan-consumer.v4.schema.json` and `V3/inputs/replan-v3/*`. These are the validation-copy and original banks. They are useful only as lineage or inverse evidence.
- `REL/v1..v3` consumer editions. They are useful for lineage only.
- Nothing in any package drafts: a certified v8 consumer; a started or cancelled combined-profile consumer; a projection-row wrapper for the replanned row; backfill declarations; or a v8-scoped GRS-085/SP-317 successor. `grep` for `started_cancelled_certified|goal_run_certified_consumer` over `V3` returns 0 files. A2 must author all of these.

### 2.3 Open review questions that route to A2

- `PKG/goal-replan-v8-canonical-draft-independent-review-20260925/v1/REVIEW.md:298`: `"Whether A2 accepts the checkpoint and projector names A1 assigns."` The same question is in `dimension-reviews.json:189`.
- `PKG/goal-replan-v8-canonical-draft-root-review-20260925/v1/acceptance.json:58` (remains_open_after_a1): `"A2: the certified v8 consumer, the Replan consumer, the started/cancelled combined-profile consumers, the projector/checkpoint/backfill/retention declarations (goal_run_started_cancelled_replanned_checkpoint unregistered); Replan release unavailable until then."`
- `CD/PACKAGE-STATUS.md:219` (U3-Q7): `"Goes to the Storage owner before A2 registers the checkpoint successor"`.
- `CD/PACKAGE-STATUS.md:303` (P-02): `"the consumer checkpoint tokens go to A2"`.
- `CD/PACKAGE-STATUS.md:307` (P-06): `"Deferred to A2: #23 is not registered"`.
- `CD/PACKAGE-STATUS.md:218` (O-17, Q-U4-08): `"its Event treatment is open for A2 and A3"`.

---

## 3. The A1 canonical-draft package as the template for an A2 package

Home: `sittingmongoose/PuppetMaster-Packages` at `replan-v8/goal-replan-v8-canonical-draft-20260925/v1`. It was built on a branch and merged to that repository's `main` after both reviews (`A1:reports/event-authority-20260911/replan-v8/A1-canonical-placement-20260925.md:38`). `CD/PACKAGE-STATUS.md:17` says: `"Package material never enters Puppet-Master; only the accepted after/Plans/ files are copied there"`.

### 3.1 Layout (`CD/PACKAGE-STATUS.md` §2; `CD/manifest.json` `package_layout`)

| Path | Role |
|---|---|
| `after/Plans/…` | Placed edition at canonical paths (74 files, 10,357,413 B) |
| `proposed-registry-rows.json` | Form `pm.workflow_combined_source.proposed_registry_rows.v1`, status `PROPOSED_FOR_CANON_COMPILE_NOT_REGISTERED`. It carries `registry` (path, `sha256_at_base`, `append_at` `/families/294`), `rows` (34, in registry form and SP-316 key order), `row_index`, `not_registered` (#23), `v8_stored_profile_routes`, `v8_certified_rows` |
| `data/` | `relocation-table.json`, `rename-map.json` (124 rows), `repair-patches.json` (106), `census-after.json` (readiness census re-pins), `c08-live-remote-claim-scan.json` |
| `scripts/` | Stages `tables, select, relocate, rename, repair, core-selfcheck, bind, bind-selfcheck, inverse, author`, then `manifest`. Driven by `build.py`. Also `rebase_check.py` and `common.py` |
| `scripts/checks/` | C01-C11 plus `run_all.py`. C1 inverse, C2 draft markers, C3 host paths, C4 `$ref` resolution, C5 adapted source checks, C6 P-01 token walk (no stored row reaches `redb_snapshot_id`), C7 registry rows on a copy of the base registry, C8 id and path collisions against every `origin/*`, C9 descriptor reproduction (CV-352), C10 case, C11 citations |
| `checks/` | One JSON per stage and per check, plus `run_all.json` |
| `stages/1-select … 4-repair` | Reproducible intermediates |
| `design/` | Design plus scoping notes U1-U6 (inputs, not edited) |
| `handoff/` | One note per stage, plus `open-items.md`, `renumber.md`, `review-c1-repairs.md`, `rebase.md` |
| `PACKAGE-STATUS.md`, `manifest.json`, `SHA256SUMS` | Status and freeze |

Freeze form. `CD/manifest.json` has `schema` `pm.external_source_freeze_manifest.v1`. Its other keys are `package`, `status`, `profile`, `subject_manifest_sha256`, `subject_package`, `base_commit`, `producer_profile`, `combined_installed_contract_digest`, `producer_component_digest`, `digest_codec`, `author_decisions`, `limits`, `checks`, `documented_exceptions`, `build_stages`, `check_currentness` (314 recorded input hashes, re-verified at freeze), `package_layout`, `member_count` 417, `member_bytes`, `summary`, `members` (path, sha256, bytes). `SHA256SUMS` covers every file except itself, `manifest.json` included. `manifest.py` freezes only when every stage and check record is PASS and its recorded input hashes are current (`CD/PACKAGE-STATUS.md` §3).

### 3.2 The placed companions A2 would mirror

- **`installed-profile.json`** (the static descriptor). Keys at `A1`: `profile`, `status` (`CANONICAL_COMPLETE_SOURCE_PROFILE_NOT_INSTALLED`), `predecessor_native_profile` plus its digest and descriptor, `producer_source_profile` plus its digest and descriptor, `bound_certified_profiles`, `members` (189: path, sha256, bytes), `digest_codec` `SHA256_SORTED_KEY_COMPACT_UTF8_NO_PREFIX_NO_LF`, `digest_exclusions`, `external_lineage`, `birth_rule`, `certified_storage`, `consumer`, `registry_selection`, `native` / `instances` `NOT_RUN`. The digest is in the sibling `installed-profile-digest.txt`.
- **`composition.json`** (binds the final whole selections; not a descriptor member). Keys at `A1`: `base`, `composition_id` `pm.workflow_combined_source.source_placement.v1`, `native_profile`, `producer_source_profile`, `passive_consumer_profile` (`null`, line 2125), `members` (191), `counts`, `digest_codec`, `external_lineage`, `external_stale_diagnostics`, `component_path_scopes`, `component_profiles`, `owner_and_registry_members`, `registry_schema_resolution_bindings` (34), `registry_selection` (line 2711 `"not_registered": "goal_run_started_cancelled_replanned_checkpoint (P-06, A2)"`), `source_qualification`, `source_reviews` (8), `status` `COMPLETE_CANONICAL_SOURCE_CANDIDATE_UNINSTALLED_NATIVE_NOT_RUN`.
  - prop.: `passive_consumer_profile` is the natural slot an A2 composition fills.
  - Three `source_reviews` rows (`canonical_draft_package`, `…_independent_review`, `…_root_review`, from line 2761) keep `manifest_ref: null`. The A1 report explains why (`A1-canonical-placement-20260925.md:104`): `"because root condition 3 requires the 74 files byte-identical to the package … They are recorded instead in every unit's source_lineage (bb6be609…, 62d94dc1…, a7f5bb5f…)."`
- Also placed: `resource-realms.json` (realm selection, 15 realms, `network_fallback: false`), `source-citations.json` (relied passages recited at base), `owner-sources.json`, `rename-map.json`, `canonical-inverse.json`, `whole-successor-lineage.json`, `README.md` (ContractRef naming the owner units).

### 3.3 Review records (separate package directories)

- **Independent review.** `PKG/goal-replan-v8-canonical-draft-independent-review-20260925/v1/`: `REVIEW.md`, `dimension-reviews.json`, `review-cycle-1.json`, `review-cycle-2.json`, `evidence/…`, `manifest.json` (sha256 `62d94dc1…`), `SHA256SUMS`. Cycle 1 found 3 blocking, 20 should_fix and 15 notes, repaired one commit per finding. Cycle 2 accepted, with 1 should_fix and 4 notes. The cap was reached (`acceptance.json` `independent_review`).
- **Root review.** `PKG/goal-replan-v8-canonical-draft-root-review-20260925/v1/`: `README.md`, `acceptance.json`, `manifest.json` (sha256 `a7f5bb5f…`), `SHA256SUMS`. `acceptance.json` has `schema` `pm.external_source_root_acceptance.v1` and `status` `ROOT_ACCEPTS_CANONICAL_DRAFT_FOR_A1_CANON_COMPILE`. It also carries `subject` (package, manifest, commit, profile, landing base, CV-352 digests), `independent_review` (per-cycle verdicts), `root_checks`, `rulings`, compile conditions, `remains_open_after_a1`, and `canonical_adoption` / `installation` / `event_admission` all `false`.
- The packages repo top-level `README.md` and `SHA256SUMS` were extended in the same merge (commit `3928dd6`).

### 3.4 Differences an A2 package will face (prop.)

- A2 has no external source edition to relocate. A1's pipeline was select → relocate → rename → repair from `V3`. prop.: A2's `after/Plans/` would be mostly authored. So C1 (inverse to v3) would apply only to anything reused from the placed consumer. C4, C6, C7, C8, C9 and C11 carry over directly.
- prop.: A2 needs its own `proposed-registry-rows.json` for the projection and checkpoint pair. That pair needs the U3-Q7 Storage ruling first. It also needs the projection version (`goal_run_projection.v6` or `v7`) agreed with A3 before C8 can pass.
- prop.: A2's descriptor(s) must be new files that pin the v8 members unchanged (§1.8).
