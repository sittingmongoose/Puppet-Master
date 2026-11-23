# PNC-019 lane rv8b: goal_run.replanned full current contract (DL-080 option 1), 2026-11-14

**Native evidence stays NOT_RUN and is a separate claim; a planning PASS never reads as native proof. Admission is not this lane's: it happens at S5b.**

- **Branch:** `plans/ea-pnc-rv8b-20261114`, built on lane s3a's head `2f44dc23cd`, with lane s3d merged (fast-forward to `ac2b399750`, then `ebe7e528f3` merged in `c31f0166a5`, both sides kept).
- **Worktree:** `/home/sittingmongoose/pm-worktrees/pnc-rv8b` (kept until the lead says the lane has merged).
- **Inputs:** research `drafts/PNC019/rv8/FINDINGS.md` (sections 2 and 3, items 2-6); independent review `/mnt/Cursor/PM-Experiments/goal-replan-combined-root-review-20260921/v3/REVIEW.md` (ACCEPT_WITH_NOTES; SHA-256 recorded in `Plans/goal_run_replan_contracts/adoption.json`); accepted source `/mnt/Cursor/PM-Experiments/goal-replan-combined-source-20260921/v3` (manifest `9ed8ba4f…896e`, descriptor `2d69459c…4155`).
- **Not touched:** registry, Decision Log, Spec Lock, `.evidence`, `auto_decisions.jsonl`, frozen validator, `main`, landing lock. No DL ids. No subagents, browsers or pm-mail besides the final line.

## Result

| | Grade | Vector (membership, owner, producer, payload, scope, replay, retention, custody, transitions, consumers, compatibility, oracles) |
|---|---:|---|
| Before (`2f44dc23cd`) | **3/12** | `P P p C p p P p p A p p` |
| After (`c31f0166a5`) | **11/12** | `P P P p P P P P P P P P` |

- **The one open cell is the closed payload.** The v3 root is closed and current, and v2 is now only the historical reader, so the old CONFLICT no longer governs current writes. It stays PARTIAL because the registry selects v2 until the S5b switch, the same call lane s3a made for `goal_run.stopped`. The prepared row is `Plans/goal_run_replan_contracts/prepared-registry-row.json`. 12/12 needs only that switch.
- **Scope/identity is PASS, unlike s3a's `goal_run.stopped` grade.** s3a held stopped at PARTIAL for a missing registry `run_id` pointer. The rubric names no such pointer, and `goal_run.started`, `goal_run.cancelled` and `goal_run.certified` passed this cell at Step 8 with the same `project_id`/`thread_id` pointers. The reviewers should confirm this reading.
- **Grade files:** `reports/event-authority-20261114/PNC019-RV8B-grades-before.json` (48 quotes, checked at the base) and `-after.json` (47 quotes, 11 files). Check with `python3 scripts/pm-pnc019-s3a-grade-check.py <file> [--root <tree>]`.

## Commits

| Commit | What | Verify |
|---|---|---|
| `3b2cbbf16a` | Companions, placed v8 source members, canon v3 payload, oracle, tables, guard and mutation drivers | `python3 scripts/pm_goal_run_replan_oracles.py` |
| `77f487fd47` | Owner units, amendments, wiring/UCC/EP-236 fix, shards and index regenerated | `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json`; `python3 scripts/pm-plan-index.py validate` |
| `c31f0166a5` | Merge of lane s3d `ebe7e528f3` (400 derived-file conflicts, resolved only by regeneration; no owner-doc conflict) | shard check pass, plan-index validate pass, oracle pass |
| (report commit) | Grade files and the in-repo copy of this report | grade checker |

## What was adopted and written

**Source adoption (EP-3100, `Plans/Executor_Protocol.md:12888`).**
- **Placement:** 70 operative members of v3 sit byte-identical under `Plans/goal_run_replan_contracts/source-v8/`: protocols, method maps, participant tuples, profile and preimage, physical families, stored routes, 19 whole schemas, the draft payload and its graph-patch source. Each equals its manifest entry and its preimage entry. The four case-only duplicate aliases (`coordinator/protocol.md`, `native-v8/protocol.md`, `producer-combined/protocol.md`, `replan/protocol.md`) are not placed: a case-insensitive checkout cannot hold each beside its `PROTOCOL.md` sibling, and each alias duplicates that sibling (replan's is that file minus its four-line Stop preface).
- **Not copied:** the other 1,437 descriptor members (composition banks, inputs, originals: about 188 MB apparent). They resolve only against the frozen root, each authenticated by its preimage hash. This follows the v6 package's external-manifest pattern.
- **Nine explicit corrections C1..C9** (`adoption.json`): payload successor, idempotency preimage, descriptor representation, SP-336/347 durability precedence, numbers and date-time, Goal-body physical edition, cancel routed to D06, replay recipe (T-REPLAY), unified run history.
- **Adoption digest** `dd1a4b8a…a6f4` (CV-352 sorted compact JSON) in `adoption-digest.txt`. It is distinct from the frozen digest, and only it may be recorded at a v8 birth.

**Owner units:**

| Unit | Location |
|---|---|
| GRS-3100 contract | `Plans/Goal_Runtime_System.md:10309` |
| GRS-3101 unified reducer branch | `:10382` |
| EP-3101 Replan writer | `Plans/Executor_Protocol.md:12956` |
| CV-3100 payload | `Plans/Contracts_V0.md:51622` |
| CV-3101 numbers, date-time, retained recipes | `:51679` |
| SP-3100 persistence, identity, custody, withdrawal | `Plans/storage-plan.md:67305` |
| SP-3101 Storage roles, lifetime, durability, restore | `:67369` |
| SP-3102 projection and checkpoint | `:67432` |
| ATS-3100 oracle suite | `Plans/Automated_Testing_System.md:14559` |

**Companions** (`Plans/goal_run_replan_contracts/`): `adoption.json`, `payload-correspondence.json`, `consumer-bindings.json`, `projection.schema.json`, `physical-families.json`, `cancellation-dependencies.json`, `prepared-registry-row.json`, `oracle-fixtures.json`. The payload is `Plans/event_payloads/goal_runtime/goal_run_replanned.v3.schema.json`; the v2 bytes are unchanged (`535a5510…4175`).

**Amendment lines:**
- Known-37 4.2 resume rule: `Plans/Goal_Runtime_System.md:3726`.
- D-R19: `:4020`.
- GRS-085: `:8448`.
- GRS-202: `:8653`.
- Payload-minima row: `:2907`.
- EP-118: `Plans/Executor_Protocol.md:7733`.
- EP-236 `cmd.runtime.replan` note: `:10058`.
- CV-287: `Plans/Contracts_V0.md:23047`.
- SP-214: `Plans/storage-plan.md:15561`.
- v2 ATS pair: `Plans/Automated_Testing_System.md:2666`.
- UCC runtime-actions row: `Plans/UI_Command_Catalog.md:8731`.

### Review adoption list, item by item

| Review item | Where it is closed |
|---|---|
| 1 Fresh profile, placement, representation | EP-3100; `adoption.json` placement, `fresh_birth` and `descriptor`; C3. v3/v6/v7/stop_block.v1 births isolated; v8 certified `producer_source.v3` bound to its own originals. |
| 2 Named writer, explicit successor, clocks, idempotency, lost ack, six actions, cancel, resume | EP-3101; GRS-3100; CV-3100 with C1; SP-3100 key with C2; Known-37 4.2 and D-R19 amendments; C7. |
| 3 One complete run history | GRS-3101 and SP-3102: one reducer branched by the authentic birth profile (v7 / stop_block.v1 / v8). Explicit v8 started, cancelled, certified and replanned bindings in `consumer-bindings.json`. The frozen projector is lineage only (C9). |
| 4 Storage roles, custody, lifetime | SP-3101 and `physical-families.json`: 35 frozen families plus 2 projection families, existing policies only, 29 transient-only definitions never stored. Goal-body edition (C6). |
| 5 Append, durability, restore | SP-3101 (C4): commit-frame issuance per SP-336/347, barrier class, no first-mint from a missing receipt; restore rules. |
| 6 Numbers, date-time, retained recipes | CV-3101 (C5); oracle rows PL02/AP04/AP10/AP13, CM05, PL03/PL04/AP06/AP07, RR01-RR06. |
| 7 Separate cancellation, truthful scope | `cancellation-dependencies.json` (D-CANCEL-1..5); EP-3101; TR06; Project scope only (CV-366 `preserve_project_only`). |
| 8 Executable checks | ATS-3100 and the oracle (below). |
| T-REPLAY | C8; filed as **T220** in `/mnt/Cursor/share/puppet-master/2026-11-04-program/streams/TOOL-ISSUES.md` (the reviewer had not filed it). |

### Research work items 2-6 (FINDINGS section 3)

| Item | Closed by |
|---|---|
| 2 Reconcile to live canon and place the source | EP-3100, `source-v8/`, C1..C9 |
| 3 Event successor and lifecycle | GRS-3100, CV-3100, SP-3100, EP-3101 |
| 4 Consumers and custody | GRS-3101, SP-3102, SP-3101, `consumer-bindings.json`, `projection.schema.json` |
| 5 Prove planning semantics | ATS-3100, the oracle and the proofs below |
| 6 Commands and stage integration | Wiring, UCC and EP-236 fix (below); registry switch left to S5b |

### Wiring and resume

- **`catalog.runtime_replan`** (`Plans/Wiring_Matrix.production.json:61857`): the four stale `goal.replanned` tokens (expected event, effect ref, test requirement, event test) now name `goal_run.replanned`.
  - The effect description now says that a birth without the v8 writer refuses `handler_unavailable`.
  - `goal.replanned` stays historical-only and is never an alias.
  - `validate-wiring-matrix` exits 0.
- **`cmd.runtime.replan`:** typed args (`run_id`, `blocked_sequence`, `allowed_action_id`, `node_id`, `attempt_id?`) and codes are unchanged; `pm-command-payload-defs-check.py` reports no errors.
- **Resume:** `blocked`/`stopped` are left only through a later valid v3 replan on a v8 birth, or through D06.
  - A `resumable=false` stop needs a changed-admission proof (D-R21).
  - Births without the writer keep the fence.

## Oracle and proofs (all at `77f487fd47`; the oracle and table check re-run at `c31f0166a5`)

| Check | Result |
|---|---|
| `python3 scripts/pm_goal_run_replan_oracles.py` | pass: 277 cases (58 positive, 219 one-defect negative); 155 rows in 24 tables, all witnessed; correspondence checked on 130 payloads; static restriction-successor check clean |
| shared number corpus through the complete checker | 82 spellings, 504 routes, 0 mismatch (expectations from shared helpers only; includes a valid 4,400-digit integer: no crash, refused at AP10) |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | pass (580 cases) |
| `python3 scripts/pm-grr-table-generate.py --check` | pass: 24 tables, 155 rows, no stale or extra |
| gated tool `scripts/pm-grr-guard-tables.py` (Method B, `scripts/pm_guard_isolation.py`) | 24/24 PASS; **155/155 rows proved, 0 unproved**, 0 refused controls. 5 multi-row witnesses (copy swaps and two auxiliaries) are masked from the tool and used by the mutation proof |
| `scripts/pm-grr-mutation-proof.py` | **60/60 killed**. A kill counts only when each declared detector shows exactly its declared outcome |
| `scripts/pm_event_datetime_inventory.py` | 290 nodes, 0 unclassified, 4 failures, all in the sparse-excluded `Plans/.audits/stage-a-…` (identical to lane s3a's base) |
| shard generate / index generate / shard check / plan-index validate | exit 0 / 0 / 0 (4,074 shards) / pass, 0 failures, both before and after the s3d merge |

**Quality bar, item by item:**
- **Guard rows are the checker's own predicates on the gated tool,** at most 8 rows per table. Each predicate reads one observation the checker derives from the complete boundary input (the S2 pattern).
- **Owner schema keywords kept:** the oracle validates the exact canon schema file, and a static check proves that the canon v3 schema equals the draft grammar except for the recorded member changes.
- **Numbers:** the shared calls `current_integer`, `storage_uint64`, `qualified_jcs`, `producer_semantic_digest`, `full_value_commitment`, `storage_value_bytes` and `RetainedDispatcher`.
- **Date-time** by field:
  - `occurred_at_utc`, graph-patch `created_at_utc`/`issued_at_utc` and receipt `acknowledged_at_utc` use the EventRecord profile (E5-2);
  - `observed_at_utc` and `persisted_at_utc` use `storage_utc_z`;
  - an offset-acknowledgement positive kills the profile-swap mutant M35.
- **Retained reads:**
  - the recipe comes only from the sealed per-original receipt;
  - negatives cover a missing, ambiguous, other-original, unknown-recipe and other-edition receipt;
  - the store snapshot and the "no receipt created" rows are checked;
  - the shared dispatcher is a second line (M50).
- **Join rows:** every copied field has its own row and distinct values in every control, plus copy-swap witnesses (M27-M29).
- **Recipe vector:** an independently computed key vector catches a recipe that the world builder and the checker could share (M25).
- **Grades:** honest, with exact citations, checked mechanically.

### Mutation table

Kill = each detector shows exactly the stated outcome; "collateral" counts other changed cases, which never count.

| Id | Edit | Detector: baseline → under mutant | Status | Collateral |
|---|---|---|---|---:|
| M01 | delete the reviewed manifest pin | `sr-manifest` SR01_manifest_sha → accepted | killed | 0 |
| M02 | delete the placed-member preimage check | `sr-placed-preimage` SR04_placed_preimage → accepted | killed | 0 |
| M03 | weaken the adoption digest to a well-formed hex string | `sr-digest-file` SR06_digest_recorded → accepted; `sr-digest-frozen` SR06_digest_recorded → accepted | killed | 0 |
| M04 | accept the frozen digest as a birth digest (substitution) | `bi-frozen-digest` BI03_birth_digest → accepted | killed | 0 |
| M05 | allow late enrollment | `bi-late-enrollment` BI02_birth_original → accepted | killed | 0 |
| M06 | drop the run join | `cm-run-id-other` CM03_run_id → accepted | killed | 0 |
| M07 | bypass the shared exact-integer call (CV-1100) | `cm-sequence-bool` CM05_sequence_integer → accepted; `cm-sequence-float` CM05_sequence_integer → accepted | killed | 0 |
| M08 | allow a fabricated attempt_id (pre-attempt rule) | `cm-fabricated-attempt` CM07_attempt_rule → accepted | killed | 0 |
| M09 | accept any birth profile listing the writer name | `cm-birth-v7` CM12_handler_installed → accepted | killed | 1 |
| M10 | publish cancel through replan (C7) | `ad-cancel-action` AD02_action_publishable → accepted | killed | 0 |
| M11 | accept terminal sources | `ad-source-cancelled` AD03_source_status → accepted; `ad-source-certified` AD03_source_status → accepted; `ad-source-failed` AD03_source_status → accepted | killed | 0 |
| M12 | weaken the Workflow CAS to not-ahead | `ad-stale-revision` AD05_revision_current → accepted | killed | 0 |
| M13 | resume a resumable=false stop without changed admission | `ad-unresumable-stop` AD08_resume_fence → accepted | killed | 0 |
| M14 | delete the CV-1100 integer slot call | `pl-epoch-float` PL02_integers_exact → accepted | killed | 0 |
| M15 | delete the CV-1101 occurred_at_utc call | `pl-occurred-leap` PL03_occurred_clock → accepted | killed | 0 |
| M16 | weaken the generation increment to monotone | `pl-generation-skip` PL06_generation_successor → accepted | killed | 0 |
| M17 | weaken the Workflow clock successor | `pl-revision-skip` PL07_run_revision_successor → accepted | killed | 0 |
| M18 | allow the replan to advance the Goal revision (v2 D-CAS-01) | `pl-goal-advanced` PL08_goal_revision_unchanged → accepted | killed | 0 |
| M19 | allow duplicate dispositions (bijection) | `pl-disposition-duplicate` PL13_disposition_unique → accepted | killed | 0 |
| M20 | accept a candidate as an original disposition | `pl-disposition-candidate` PL14_disposition_kind → accepted | killed | 0 |
| M21 | accept one operation issuing two graph-patch phases | `pl-history-same-op` PL16_history_issuers → accepted | killed | 0 |
| M22 | weaken applied-equals-validated to the record id | `pl-applied-changed` PL18_applied_equals_validated → accepted | killed | 0 |
| M23 | compare the graph-patch affected set as an unordered set | `pl-patch-affected` PL20_patch_affected → accepted | killed | 0 |
| M24 | accept any v3-prefixed key (the draft thirteen-member key) | `id-key-draft` ID07_key_recipe → accepted | killed | 0 |
| M25 | use the draft thirteen-member preimage for the canon recipe (C2); the independent recipe vector refuses | `recipe-vector/publish` None → ID07_key_recipe | killed | 0 |
| M26 | drop the outer run join | `id-run-other` ID05_run_join → accepted | killed | 0 |
| M27 | wrong-field outer account join: the distinct-copy control refuses at ID12; the swap witness moves to ID13 | `id-swap-outer-accounts` ID12_outer_requested_account → ID13_outer_effective_account; `pos-blocked-continue/publish` None → ID12_outer_requested_account | killed | 70 |
| M28 | wrong-field intent provider join (distinct copies) | `id-swap-intent-providers` ID18_intent_requested_provider → ID19_intent_effective_provider; `pos-blocked-continue/publish` None → ID18_intent_requested_provider | killed | 63 |
| M29 | wrong-field effective model join (distinct copies) | `id-intent-effective_model_ref` ID21_intent_effective_model → ID21_intent_effective_model; `pos-blocked-continue/publish` None → ID21_intent_effective_model | killed | 59 |
| M30 | drop the causation copy join | `id-intent-causation_event_ref` ID25_intent_causation → accepted | killed | 0 |
| M31 | accept any lifecycle successor | `tr-cancel-successor` TR01_successor_status → accepted; `tr-successor` TR01_successor_status → accepted | killed | 0 |
| M32 | let a replan record SchedulerStop or effect cleanup | `tr-effect-cleanup` TR06_no_cancel_effect → accepted; `tr-scheduler-stop` TR06_no_cancel_effect → accepted | killed | 0 |
| M33 | append before native application | `ap-before-native` AP01_after_native → accepted | killed | 0 |
| M34 | bypass SP-1100 storage_uint64 | `ap-receipt-uint64-overflow` AP04_receipt_numbers → accepted | killed | 0 |
| M35 | check acknowledged_at_utc with storage_utc_z instead of the EventRecord profile (E5-2) | `pos-ack-offset/publish` None → AP06_ack_clock | killed | 0 |
| M36 | check Storage clocks with the EventRecord profile | `ap-observed-offset` AP07_storage_clocks → accepted; `ap-persisted-lower-z` AP07_storage_clocks → accepted | killed | 0 |
| M37 | accept an ordinary-class Replan append (SP-336) | `ap-ordinary-class` AP08_barrier_class → accepted | killed | 0 |
| M38 | skip the SP-1100 physical encoding check | `ap-epoch-4400-digits` AP10_event_encodes → AP11_custody_commitment; `ap-epoch-uint64-overflow` AP10_event_encodes → AP11_custody_commitment | killed | 0 |
| M39 | delete the CV-317 producer digest check | `ap-digest` AP13_producer_digest → accepted; `ap-epoch-binary64` AP13_producer_digest → accepted | killed | 0 |
| M40 | accept reordered or repeated phases | `ap-phase-reorder` AP14_phase_order → accepted; `ap-phase-repeat` AP14_phase_order → accepted | killed | 0 |
| M41 | accept same key with a different digest (no idempotency_conflict) | `rp-conflict` RP04_digest_equal → accepted | killed | 0 |
| M42 | take the first of two retained originals | `rp-two-originals` RP03_original_present → accepted | killed | 0 |
| M43 | accept a replanned row on any birth (cast) | `rd-replan-on-stop-block` RD02_family_listed → accepted; `rd-replan-on-v7` RD02_family_listed → accepted | killed | 1 |
| M44 | accept a draft-version row | `rd-draft-row` RD03_row_current → accepted | killed | 0 |
| M45 | accept an unauthenticated revision gap | `rd-gap` RD07_gap_authenticated → accepted; `rd-gap-partial` RD07_gap_authenticated → accepted | killed | 0 |
| M46 | weaken the projected generation step | `rd-generation-repeat` RD08_generation_follows → accepted; `rd-generation-skip` RD08_generation_follows → accepted | killed | 0 |
| M47 | certify from blocked or stopped | `rd-certified-from-blocked` RD10_certified_from_live → accepted; `rd-certified-from-stopped` RD10_certified_from_live → accepted | killed | 0 |
| M48 | drop the checkpoint CAS | `ck-cas-stale` CK05_cas_before → accepted | killed | 0 |
| M49 | write into an existing generation | `ck-old-generation` CK07_new_generation → accepted | killed | 0 |
| M50 | rows take the first of several sealed receipts; the shared dispatcher still refuses ambiguity (declared second line) | `rr-ambiguous` RR02_receipt_unique → dispatcher_recipe_ambiguous | killed | 0 |
| M50b | rows and owner both default to the first sealed receipt (recipe guess at both layers) | `rr-ambiguous` RR02_receipt_unique → accepted | killed | 0 |
| M51 | accept a receipt of another original sharing the Project; the frozen verifier refuses (declared) | `rr-other-original` RR03_receipt_binding → RR06_original_verified | killed | 0 |
| M52 | accept another installed recipe edition; the frozen verifier refuses (declared) | `rr-other-edition` RR05_recipe_edition → RR06_original_verified | killed | 0 |
| M53 | drop the store snapshot comparison | `rv-bytes-changed` RV05_bytes_unchanged → accepted | killed | 0 |
| M54 | allow the read to create a receipt | `rv-receipt-created` RV06_no_receipt_created → accepted | killed | 0 |
| M55 | drop the authority retention binding | `rt-authority` RT05_authority_policy → accepted | killed | 0 |
| M56 | store a transient-only union | `rt-transient-stored` RT07_no_transient_stored → accepted | killed | 0 |
| M57 | miss a raw API key value | `cu-secret-key` CU01_no_secret_value → accepted | killed | 0 |
| M58 | back up the Event without the compact authority families | `cu-backup-no-compact` CU04_backup_coherent → accepted | killed | 0 |
| M59 | reissue a pending replan as a new event | `wd-pending-reissued` WD02_pending_from_custody → accepted | killed | 0 |

Declared non-acceptance outcomes:
- **M25:** the recipe vector refuses at ID07.
- **M27/M28/M29:** the distinct-copy control refuses at the row; the swap witness moves to the sibling row.
- **M35:** the offset-acknowledgement positive refuses at AP06.
- **M38:** the unencodable epoch moves to AP11.
- **M50:** the shared dispatcher refuses `recipe_ambiguous`. M50b weakens both layers and is accepted.
- **M51/M52:** the frozen verifier refuses at RR06.

## Retention cells

| Item | Policy | Basis |
|---|---|---|
| Event | `RP-RUNTIME-365D@1.0.0` | registry assignment RET-K37-ASSIGNMENT-001, unchanged |
| Projection and checkpoint (`goal_run_history_v8_row`, `_checkpoint`) | `RP-PROJECTION-3GEN@1.0.0` | SP-317's projection rule |
| ProducerIntent (`draft_replan_producer`) | `RP-RUNTIME-365D@1.0.0` | v8 source, run-completion anchor |
| Every other prepared authority family | `RP-AUTHORITY-INDEFINITE@1.0.0` | the policy every existing Workflow source, start, cancel, standard and certified authority family uses (`storage_value_registry.json`) |

No new policy, horizon or hold. No cell is pending a retention decision.

## Ids

- **Scan:** 2026-11-14, 1,710 unique `Plans/*.md` blobs over all 867 `origin` refs (`main` included). Zero hits for SP/CV/ATS/GRS/EP-3000..3199.
- **Maxima then:**

  | Scope | ATS | CV | SP | EP | GRS |
  |---|---:|---:|---:|---:|---:|
  | All branches | 2500 | 2550 (s4b) | 2550 (s4b) | 1460 (batch3-int) | 1558 (batch3-int) |
  | `main` | 380 | 1101 | 1101 | 236 | 218 |

- **Minted:** GRS-3100/3101, EP-3100/3101, CV-3100/3101, SP-3100/3101/3102, ATS-3100. Every prefix had a 3100 range. No DL id.

## Open items and notes for the lead

- **For S5b (not this lane):** apply `prepared-registry-row.json` (v3, owner anchors GRS-3100/SP-3100), and enter the prepared Storage roles of `physical-families.json` with the genuine v8 installation in one landed registry change. Then the payload cell becomes PASS: 12/12.
- **Composition limit (technical, not a Jared choice).** No fresh edition lists both the EP-200 stop and block writers and the v8 Replan writer. The consequences:
  - Pause and Abort Run return `handler_unavailable` on a v8 birth, exactly as they do on today's v7 births.
  - A `stop_block.v1` birth cannot be replanned.
  - The fix is a further composed fresh source edition with its own review (GRS-3101, "Composition limit").
- **Cancel reconciliation.** D-R19's `cancel=>cancelled` is reached only through D06 (GRS-080); the Replan writer refuses `cancel` (C7). This applies GRS-080's later ownership of positive cancellation. It is technical under DL-045, not a new product choice; reviewers should confirm.
- **Payload reconciliation.** Canon v3 drops the draft's redundant `expected_goal_revision` and its `parent_goal_id`, and makes `idempotency_key` required. The key preimage therefore has 12 members, not the draft's 13. Both are explicit corrections (C1, C2), and the map is reversible (`payload-correspondence.json`).
- **The s3d merge.** No owner-document conflict. I did not re-run s3d's own suites (`scripts/pm_goal_own_a_oracles.py` needs its isolated Python environment).
- **For Jared:** nothing. No new product choice arose; the contingency candidates above are technical.
