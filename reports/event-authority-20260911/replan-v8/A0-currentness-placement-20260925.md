# Replan v8, A0: the combined source v3 re-adjudicated against main, 2026-09-25

Step 8(b) Group A, branch A0 of `reports/event-authority-20260911/step-08-remaining-source-work-plan-20260924.md` (Part 2). This is a report only. It edits no canon, registry, script or governance artifact, and it starts no package work beyond reading.

**Subject.** `goal-replan-combined-source-20260921/v3` of `sittingmongoose/PuppetMaster-Packages` (`replan-v8/`, commit `2cffa80ef2`), manifest SHA-256 `9ed8ba4f825939cc59b37941aafe1068be7ed2d6ada87c0e3b8eaa3b5225896e`, profile `pm.executor.workflow_source.all_writers.v8`, 1,580 members.

**Base.** `main` at `a6480b0f7c74c4e39726e2094a16175d21106e4e` (2026-09-25 01:19Z), fetched again before this report was written; no later commit exists.

**What it re-adjudicates.** The frozen currentness review `goal-replan-stop-currentness-impact-20260921/v1` (manifest `c7213eb4fb11fce06b16e725949e958846977dc23486c2b00e57a376f63cd17a`) gave PASS for its bounded census and CONDITIONAL for canonical placement. It compared against `4a72aa124739c9aeba8d1ab49865735feae528d8`, which is not an ancestor of `main`.

## Verdict

1. **Currentness: PASS, with every change adjudicated.** The census, re-run against `main`, finds no change that invalidates a rule the v8 source relies on. Seven Replan v3 passages and one certified-v2 citation are no longer verbatim. Three of them are routing notes that say they change nothing. Four are the DL-076 read-token amendments to Browser reset, seglog, Home and restore expiry, families v8 does not use. The certified-v2 one is a PWIZ-028 loop-bound addition beside an unchanged clause. All need re-citation in A1, not re-design.
2. **One new conflict.** DL-076 (2026-09-24) forbids any stored value from holding `redb_snapshot_id`. The proposed v8 family `draft_replan_release` stores the whole ten-field read token. The frozen review's target carried only SP-311's narrower rule ("never persist or manufacture it", `storage-plan.md` line 25667 at `4a72aa12`, scoped to SP-311); DL-076 made it one rule for every stored value, so the conflict is new on `main` (R1-13, corrected). A1 has to carry a successor, not the family as authored (P-01).
3. **Placement: still CONDITIONAL, now with an explicit condition list against `main`.** The frozen review's five distinctions still hold on `main`: two exactly, three with changed evidence. A0 adds eighteen placement conditions (P-01 to P-18 below), most of them naming or registry-shape work that the canonical-draft package A1 starts with must settle. Three need a decision before A1 authoring starts: which coordinator descriptors v8 binds (P-09), whether the 47 `13e7dbc0` preimage pins stay lineage or are regenerated against `main` (P-10), and whether the draft identifiers get canonical names (P-11). All three change the v8 installed-contract digest `2d69459c…`.
4. **The package's own checks reproduce.** They were re-run from a scratch copy with `jsonschema` 4.26.0 and `referencing` 0.37.0. The five v3 checks that report a status and both Stop review v3 checks give PASS; the sixth v3 script, `check_original_banks.py`, is a diagnostic with no status field. Every counted figure the package claims is reproduced exactly. Every output whose status is PASS is byte-identical to its frozen file. One diagnostic output is stale in the freeze itself (R-05).
5. **Nothing here closes a root-open item except the second half of the first one** (`acceptance.json` `remaining[0]`: "Current canonical-source placement and semantic re-adjudication of changed pins."). Root acceptance `dc58f7d2…` leaves four items open. A0 settles the semantic re-adjudication of the changed pins, and only that. Canonical placement is A1's. Positive and native instances, full original cancellation (D06) evidence, whole-family depth and the landing gates stay open.

## 1. What was compared

| Revision | Role | Ancestor of `main`? |
|---|---|---|
| `13e7dbc0f1c3` | v8's direct canonical pins (47 files) | no (merge-base `4e68cc0e4b`) |
| `dd1df59d6307` | inherited Replan v3 pins (250 files) and passages | yes |
| `4a72aa124739` | the frozen currentness review's target | no (8 commits beyond the merge-base, `main` 332) |
| `a6480b0f7c74` | `main`, this report's target | — |

`4a72aa12` is off `main` in history. For v8's 47 direct pins, `main` differs from it only in `Plans/00-plans-index.md` (1 changed old line and 3 added lines, both outside every cited range), `Plans/Goal_Runtime_System.md` (the Step 8(d) routing edit: 3 changed old lines and one added note) and `Plans/storage-plan.md` (8 changed old lines in 20 hunks). For the 250 inherited Replan v3 pins it differs in 20 files (section 3), among them `Decision_Log.md`, `Planning_Wizard.md`, `storage_value_registry.json` (9 rows and `contract_family_dispositions`), `browser_event_admission.json` and the five DL-076 checkpoint schemas. `git diff 4a72aa12 origin/main` is empty for `Executor_Protocol.md`, `Contracts_V0.md`, `Crosswalk.md`, `Plan_To_Node_Compilation.md`, `Orchestrator_Page.md`, `Automated_Testing_System.md`, `Backup_Restore_System.md` and the directories `workflow_standard_source_contracts`, `executor_cancellation_contracts`, `workflow_activation_contracts` and `goal_certified_event_coordinator_contracts`. `main` carries `8aeaea204`, a commit with the same subject and author date as `4a72aa12` but a different patch-id, so the review base probably reached `main` rebased; this report does not rely on that and re-censuses everything against `main` directly.

The plan says four v8-pinned owner files differ from the reviewed base. Among the 47 direct pins it was two at the plan's base `3ce6eb882c` and is three now: `00-plans-index.md`, `Goal_Runtime_System.md` and `storage-plan.md`. Against v8's own pinned base `13e7dbc0`, 15 of the 47 direct pins differ, as they already did at the review base.

## 2. Package authentication

- The package repository copy (`replan-v8/`, 10 top-level directories; the plan's count of 11 is not reproduced in the copy) verifies against its `SHA256SUMS` (SHA-256 `6a85be039ad1805fdcc9dc51b66467d24690973b9ae391e2c80d4a24e940ea53`): 6,005 files, `sha256sum -c` exit 0, no unlisted file and no symlink.
- All 16 frozen manifests in it hash to the values the plan and the reviews cite. All 5,989 members they list authenticate.
- The chain of custody holds:
  - v2 `ceaaa4ce…` → Stop review v2 `cc383394…` → v3 `9ed8ba4f…` → Stop review v3 `c9271320…` → root acceptance `dc58f7d2…`.
  - Root acceptance names `c9271320` and `9ed8ba4f` in its member `acceptance.json`, not in `manifest.json`.
  - The currentness review `c7213eb4…` names only the subject `9ed8ba4f` and target `4a72aa12`. The on-`main` report `step-08-stop-and-material-source-review-20260921.md` (lines 7-10) is what ties the four together.
- The v3 source names eight parent manifests. The package copy authenticates six of them completely: Replan v3 (487/487, through the relocated directory), scope (2/2), scope addendum (1/1), upstream correction v3 (177/177), its review (4/4) and the corrected coordinator (82/82). The other two can be checked only partly, from the copies embedded under `v3/inputs/`, because their full directories live only on the NAS: certified-v2 `91e18f5c…` (68 of 77 members) and the prebirth plan `21e672ca…` (7 of 142). Every embedded member present matches.
- The narrow Replan v3 root review `13437dc7…`, source of the plan's "Root PASS for its narrow repairs", is pinned only by hash in the embedded plan manifest; its bytes are not in the copy.

## 3. The census against `main`

`a0/census.py` is the frozen review's `check.py` with the target moved to `main`. It keeps `4a72aa12` as a second column and adds the citation sets the frozen review did not re-check. Two runs give byte-identical output.

| Set | At `4a72aa12` (frozen review) | At `main` |
|---|---|---|
| Direct canonical pins (47, base `13e7dbc0`) | 32 exact, 15 changed | 32 exact, 15 changed; 44 byte-equal to the review base, 3 changed since |
| Inherited Replan v3 pins (250, base `dd1df59d`) | 241 exact, 9 changed | 225 exact, 25 changed; 20 changed since the review base |
| Replan v3 exact passages (476) | 476 verbatim | 469 verbatim |
| Certified-v2 source citations (69; the corrected coordinator's 69 are the same list) | 69 | 68 |
| Scope passages (4) | 4 | 4 |
| Replan v3 whole-definition evidence (4,111 JSON-pointer definitions) | not checked | 4,102 equal, 9 changed |
| Original coordinates (114) | 112 exact, 2 changed | 112 exact, 2 changed (the same two corrected v5 schemas) |
| Event family registry | `0be54418…`, 42 families | byte-identical; equals the checkpoint approved on 2026-09-23 |
| Storage value registry | 294 families, 27 policies | 294 and 27; 9 rows and `contract_family_dispositions` changed |
| The 35 proposed v8 physical families | not checked | no `family_id` or key-prefix collision |

## 4. Adjudication of every change

Full rows, each with verbatim evidence and a verifier verdict, are in `a0/readjudication-findings.json` (findings R1-01 to R1-22 and R2-01 to R2-20). Passage numbers such as #136 are 0-based indices into the v3 member `inputs/replan-v3/exact-passages.json`.

| Changed item | What changed on `main` | Class | Bearing on v8 |
|---|---|---|---|
| Replan #136, `Goal_Runtime_System.md` payload minima table (`dd1df59d` 2648-2659) | The started, certified and cancelled rows now route to their v3 owners, and a routing note sits at `main` 2657. The replanned, blocked and stopped rows are byte-unchanged. | routing only | Re-cite `main` 2648-2661 |
| Replan #277 and #278, SP-214 text and criteria | A `goal_run.certified` routing paragraph (`main` 15160-15173) and a criterion (15198-15201) were added. The four `goal.*` historical-reader sentences are unchanged. | routing only | Re-cite. The scope it states matters to P-08 |
| Replan #343, #345, #351 and #370: SP-282, SP-270, SP-273 and SP-275 | DL-076 stores the nine-field durable token without `redb_snapshot_id`. In #345 and #351 the old sentence survives word for word but is superseded; #370 is explicitly superseded. | normative (DL-076) | None of the four families is used by v8. Re-cite |
| Replan #339, `storage-plan.md` 20871-20947 at `dd1df59d` (still verbatim at `main` 21133-21209) | Its sentence "A stored snapshot ID is historical provenance…" is declared inapplicable by the DL-076 amendment just outside the range (`main` 21212-21218). A text census cannot see this. | normative (DL-076) | Not used by v8. Cite together with the amendment |
| Certified-v2 `PWIZ-011-assignment`, `Planning_Wizard.md` 875-895 at `dd1df59d` | PWIZ-028 (DL-066) adds two criteria that bound the audit loop. The assignment and certification-issuer clauses the citation relies on are verbatim at `main` 889-890. | normative addition beside an unchanged clause | Re-cite `main` 881-903 |
| Nine whole definitions in five checkpoint schemas | DL-076 removes `redb_snapshot_id` from the stored tokens. No `$id` changed. | normative (DL-076) | None. They are in the evidence only because every top-level `$defs` of the 149 pinned JSON files is listed |
| Five Goal Stop/cancel storage rows (`goal_body_control`, `goal_cancel_receipt`, `goal_cancel_source_audit`, `goal_cancel_stop_receipt`, `goal_host_stop_control`) | `7ad1ffff6` adds sibling envelope keywords byte-equal to the referenced `$defs`. The custody schema is unchanged. | meaning-preserving | None. v8's `GoalStopSelector`/`GoalBodySelector` constants still equal `main` |
| `contract_family_dispositions` | Adds `scd.back_seat_driver.durable.v1` (SP-318) | unrelated | None |
| Decision Log and eight other inherited Markdown files | New DL-066 to DL-083, PWIZ-028, SMPFS-170 and SP-319, and dated owner notes, all outside every cited range | additions | DL-076, DL-080 and DL-081 bear on v8 (P-01, section 7, P-15). The rest do not |
| Registry fingerprints in `browser_event_admission.json` | Re-frozen 2026-09-23 after the goal v3 adoptions; membership unchanged | metadata | See A3 note, section 7 |

A method note for A1: the default Myers diff reports 838 hunks and 2,337 deleted lines for `Decision_Log.md` between the review base and `main`, and would falsely mark six verbatim Replan passages as touched. The histogram diff gives the true 7 hunks and 5 changed lines. Use `--diff-algorithm=histogram` or an occurrence check before calling a passage changed.

## 5. The package's own checks, re-run

The v3 checks run from paths relative to their own directory. The two Stop review v3 scripts needed one path constant rewritten, in the copy only. The frozen package clone was not modified; its `git status` is clean.

| Script | Result |
|---|---|
| `check_composition.py` | PASS: 1,241 original selections, 19 new roots, 1,256 literal resources, 130,201 references; output byte-identical |
| `check_method_roots.py` | PASS: 2,035 bound schema positions, 240 roots; both outputs byte-identical (the bindings file is 1.79 MB) |
| `check_final_sources.py` | PASS: 642 checks, commitment graph of 54 nodes and 67 edges, acyclic; byte-identical |
| `check_stop_correction.py` | PASS: 1,252 checks; byte-identical |
| `check_stop_phase_v3.py` | PASS: 751 checks; byte-identical |
| Stop review v3 `check.py`, `check_delta.py` | PASS; `checks.json`, `delta-checks.json`, `schema-and-phase-evidence.json` byte-identical, stdout equal to the frozen `check.log` |
| `check_original_banks.py` | diagnostic, no status; **differs** (R-05) |

Three remarks on the record, not on v8's content:
- **R-05.** The frozen `original-bank-checks.json` (`c77f3b75…`, the same bytes in v1 to v3) lists 16 banks. `original-resource-banks.json` has had 18 since v1, and a re-run reproduces the 16 entries exactly and then appends `certified_corrected_native` and `certified_corrected_current_d05_source`. Their errors are the same unresolved relative `plans_to_code_handoff` references the frozen certified banks already record. Re-running the package's own declared deterministic check therefore changes a pinned member. After such a re-run, the Stop review's `check.py` reports FAIL on that member's hash and bytes, yet still exits 0.
- **Exit status is not a signal.** None of these scripts exits non-zero on FAIL; only the status field counts. Two fields are fixed literals, not computed: `new_root_metaschemas: PASS` and `complete_original_occurrences: 323`.
- **The library version is not recorded.** The package does not record which library versions it was authored with. The byte-identical 1.79 MB bindings file makes a behavioural difference unlikely at these versions. A standard-library stand-in written independently (`a0/selfcheck.json`) also reproduced every figure.

## 6. The five placement distinctions, re-judged on `main`

| # | Frozen review's distinction | On `main` |
|---|---|---|
| 1 | Corrected current native-v6 descriptor `3e2b3017…` versus original native-v6 lineage | Holds exactly: `workflow_standard_source_contracts/` is unchanged, the two corrected v5 bodies are the only changed original coordinates, and `main` already keeps the pre-correction bodies under `preinstallation-originals/` |
| 2 | Canonical certified v7 family scoped to fresh native-v7 birth and producer prepare.v2; v7 is not widened to v8 | Holds, reinforced: EP-124, CV-352, GRS-084, GRS-085, SP-316, SP-317, ATS-057 and BRS-029 are unchanged, and the 2026-09-24 SP-214 paragraph and the GRS minima row restate the v7-only scope |
| 3 | Event registry: only the certified row moved (v2 to v3); GRS-085 halts on same-run replanned, blocked and stopped | Holds exactly: registry byte-identical to the review base (`0be54418…`); the GRS-085 halt text is at `Goal_Runtime_System.md` 7885 and in the `replay_behavior` of both SP-317 registry rows (`storage_value_registry.json` 109765 and 109941) |
| 4 | Storage registry grew 282 to 294; all old rows survive | Totals hold (294 families, 27 policies identical), but 9 of the 282 inherited rows and the dispositions list changed after the review base (section 4). v8 must be placed against `main`'s registry, and SP-316's "All 285 previous Storage rows remain unchanged" (`storage-plan.md` 26527) describes only its own registration |
| 5 | New obligations are additive; all old passages exact | Additive: still true, and no native or D06 evidence was added. "All old passages exact": no longer true (469/476 and 68/69), adjudicated in section 4 |

## 7. Writers, and what DL-080 leaves to each branch

- **Current canon names no writer** for `goal_run.replanned`, `goal_run.blocked` or `goal_run.stopped`:
  - EP-118 (`Executor_Protocol.md` 7583) refuses every Workflow writer it does not list.
  - GRS-082 (7649) adds no replan writer.
  - GRS-026 (3906) and D-R19 define the Replan envelope and branches without a writer.
  - DL-080 states the conclusion.
  The depth42 assessment's "canon disagrees" finding stands at the level of owner text; DL-080 settles it operationally.
- **v8 defines a source-level writer for `goal_run.replanned` only.** It is `draft.replan.append_original.v3`, and its `WholeOriginalEvent` has event_type const `goal_run.replanned`. It is not installed, `public_dispatch` is false, and its payload is the draft `…clock_split_20260921.v4` schema with schema_version `…goal_run_replanned.schema.v3.draft.20260921`, while the registry row selects v2.
- **v8 defines no writer for `goal_run.stopped` or `goal_run.blocked`.** The Stop route (STOP-PROTOCOL R01-R12, `owner.executor.native.revoke_run_execution.v1`) introduces no Event, and the scope adjudication leaves "B01's blocked trigger" pending. "B01" is defined nowhere in the package or in `Plans/`.
- **Order.** Placing v8's source-level publication in A1 is the "Workflow Replan source work" that DL-080 says the replanned contract follows. It is not "the contract for `goal_run.replanned`". The plan (line 119) keeps that contract, the registry rows and the payload successors in A3, "replanned needs A1 and A2". So A1 does not wait for the stopped and blocked contracts, and A3's stopped and blocked can go first, in parallel with A1.
- **Wiring.** The Runtime Replan action (`UI_Command_Catalog.md` 8148; `Plans/Wiring_Matrix.production.json` `catalog.runtime_replan`, lines 52385-52391, `expected_event_types` ["goal.replanned"]) expects `goal.replanned`, which is historical-only under GRS-070. DL-080 freezes only the Pause, Abort and resume wiring, so moving the Replan action to `goal_run.replanned` is open for A3 or the wiring owner (Q-07).
- **A3 registry landings.** All three families are among the original 37 registered families, so their A3 landings revise existing rows rather than register new ones.
  - DL-078's standing rule covers "a family registration that passes the full Step 9 procedure". Whether it covers a revision is unclear (Q-02). DL-078 ends: "Any other registry change still needs Jared's own checkpoint approval, and so does a registration that skips any part of the procedure" (`Decision_Log.md` 1571), and the plan's A3 row (line 119) says the registry change needs Jared's checkpoint approval or the DL-078 route. Unless Jared, or the PM Low cost/complexity process thread he routed Q-02 to on 2026-09-25, rules that revising a registered row is a family registration, each A3 revision needs his own checkpoint approval. The one precedent, the certified v2-to-v3 revision, went through Jared's own checkpoint approval, which the A3 card that this thread's charter requires would provide (the charter is not recorded in the repository).
  - DL-077's admission records apply to families "registered beyond the original 37 and the two August families", which these are not. The DL-077-form record this thread's charter asks for (not recorded in the repository) is therefore an extra record, not one the seal check will read (Q-03).
  - The three admission fingerprints (`browser_event_admission.json` `preexisting_family_rows_sha256`; `github_project_` and `testing_session_event_admission.json` `preexisting_family_prefix_sha256`) hash the first 39 or 40 registry rows. Rows 0-5 are the six `goal_run` families, so every A3 landing, stopped and blocked included, re-freezes all three in the same landing, and with them every other copy of the two fingerprints: the `const` in `Plans/browser_event_admission.schema.json` line 46, `CURRENT39_SHA256` in `scripts/pm-browser-event-admission.py` line 31, `PREEXISTING_REGISTRY_ROWS_SHA256` in `scripts/pm_emit_only_event_contract.py` line 16, and the test pins in `tests/test_pm_browser_event_admission.py` line 67 and `tests/test_pm_emit_only_event_boundaries.py` line 28. A revised `goal_run.blocked`, `goal_run.replanned` or `goal_run.stopped` row also needs its own whole-row entry in `REVIEWED_GOAL_SUCCESSORS` (`scripts/pm-browser-event-admission.py` lines 36-67), or the Browser gate reports `historical_preexisting_baseline_mismatch`. The 2026-09-23 re-freeze (`d21679659`, `c7b136ad2`, `1cdf39074`) is the precedent.

## 8. Placement conditions for A1

A1 first builds a canonical-draft package and has it independently and root reviewed (plan line 117); these conditions are its input. **Decide first** marks a choice that changes the v8 installed-contract digest `2d69459c…` and should be settled before authoring.

| ID | Condition | Evidence |
|---|---|---|
| P-01 | `draft_replan_release` stores `StoredReleaseReceipt.record.source_token` as a `$ref` to the canonical ten-field `read_token`, which includes `redb_snapshot_id`. DL-076 (`Decision_Log.md` 1463; unit 5997: "no stored value holds redb_snapshot_id") and SP-278's paragraph at `storage-plan.md` 21017 forbid that. The successor must store the nine-field durable token as its own local definition and join the live snapshot at read. v8's `DurableGenericToken` already equals it. A reachability walk of all 35 families found no other `redb_snapshot_id` reach. | package `replan-and-combined-physical-families.json` 226-233; `schemas/replan-source.v4.schema.json` 4637, 4680-4681, 5088 |
| P-02 | §2.3.1 (`storage-plan.md` 519) counts a field holding a read-token schema as a read selector only when it is named `read_token` or `*_read_token`. v8 stores token schemas under `source_token`, `source_token_at_birth` and `generic_token`. Rename, or have the Storage owner rule. | R1 missed-5, R2-07 |
| P-03 | New registry rows need an inline closed wrapper `value_schema` (the `7ad1ffff6` pattern). §2.3.1 rejects a bare reference on any row but the three SP-310 unions (`storage-plan.md` 518). The same landing re-pins the readiness census (294 families, 27 policies, line 522). | R2-07 |
| P-04 | Registry-schema conformance of the 35 families: 15 `family_id`s break `^[a-z][a-z0-9_]*$`; 31 use the `https://puppetmaster.local/drafts/` host; 30 have `pm.draft.*` schema ids; none declares `producer` as the array the registry schema requires (`string_list`); 26 carry one `draft.replan.*` method-id string, 4 carry prose (`draft_replan_control`, `draft_replan_GraphPatchIssuedSnapshot`, `draft_replan_owner_issue_origin`, `draft_replan_native_publication_origin`), and 5 have no `producer` field (the four `workflow_combined_*` families and `executor_workflow_replan_observer_origin`, which carry `original_writer`), so 9 need real owner IDs and all 35 need arrays; `workflow_combined_slot_origin` has schema id `…slotorigin.v1`. | R2-14 (corrected) |
| P-05 | The codec `pm.workflow.activation_source_json.v1` is owned by SP-308 (`storage-plan.md` 25523, unit line 25552), not SP-309 as the v8 file says. Registry rows express it as `encoding: json_canonical` with the codec named in `replay_behavior`. | R2-15 |
| P-06 | `draft_replan_projection_checkpoint` plays the per-run projection role of the SP-311, SP-312 and SP-317 checkpoints. DL-080 requires each contract to "extend the mandatory GRS-085 run-history projection". Merging into a GRS-085/SP-317 successor means revising or succeeding both SP-317 registry rows, whose `replay_behavior` carries the halt. A separate projector needs an explicit justification. The decision belongs to A1/A2, and the Event contract part to A3. | R2-04, R2-16, R2 missed-5 |
| P-07 | Justify each family paralleling SP-308 (the 11 `draft_replan_*` source records) or SP-316 (control, release, producer, append link, completion, origin, enrollment), and the lifetime difference: `ProducerIntent` uses `RP-RUNTIME-365D` against `RP-AUTHORITY-INDEFINITE` for `goal_certified_event_intent`. | R2-16 |
| P-08 | v8 publishes `goal_run.certified` v3 for v8 births through its own `coordinator.v2`, `identity.v2` and `append-phase.v2` (active roots, not on `main`). Canon scopes certified v3 to v7 births: the GRS minima row 2653, the SP-214 paragraph, GRS-084. A1 places the v2 successors beside v1 without replacing it, and states that the v7 row and consumers do not admit v8 births. The Stop readback's `GuardReleased` binds `coordinator.v2`, not `main`'s v1. | R2 missed-1, R4-23 (corrected), R4 missed-1 |
| P-09 | **Decide first.** v8 binds the external corrected coordinator: descriptor `48c8ae3b…`, producer `e9f563c6…`. Canon holds the relocated v7 family: `goal_certified_event_coordinator_contracts/installed-profile-digest.txt` `0055de6c…`, producer native-v7 `599315856…`. 11 of 19 coordinator files differ. Carry the external bytes as original lineage, or rebind v8 to the canonical ones. | R3-03 |
| P-10 | **Decide first.** v8's preimage holds 47 canonical files copied from `13e7dbc0`, 15 of which differ from `main`. The Replan exact passages and certified-v2 citations are also whole preimage members. Keep them as lineage and record successor citations in a separate currentness record, or regenerate against `main`. | R1-09, R3 missed-6 |
| P-11 | **Decide first.** v8 brings identifiers `main` has none of: 27 `draft.replan.*` methods, 30 `draft_*` families, the `drafts/` `$id` namespace, and producer profile `pm.goal_run_certified.producer_source.v3`. The package proposes no canonical names and no `Plans/` location. The 5 new method ids (among them `owner.executor.native.revoke_run_execution.v1`) and the 19 authored schema `$id`s collide with nothing on `main`. | R3-16, R3-17, R3-19, R3-20 |
| P-12 | Copying original banks or derived composition under `Plans/` would add same-`$id`, different-byte bodies for 5 ids: the two pre-correction certified-v2 v6 schemas, and extra `goal_cancelled`, `goal_created` and `goal_updated` v3 bodies. Use `preinstallation-originals`-style bank coordinates, or keep the banks external and cite them by SHA-256. | R3-17 |
| P-13 | The replanned writer's payload `$ref` (`drafts/goal_run_replanned_clock_split_20260921.v4`) is not an authored v8 root; it exists only in `inputs/replan-v3` and an original bank. Placing it would introduce a payload successor, which is A3's. A1 cites it externally or decides explicitly, and must not let it read as a registry selection. | R3 missed-1 |
| P-14 | Envelope divergence: the v8 replanned payload requires `expected_goal_revision`, allows `parent_goal_id`, and puts `expected_goal_revision` in its idempotency key (`replan/PROTOCOL.md` 159-167). The v3 envelope the 2026-09-24 routing note documents for started, cancelled and certified (`Goal_Runtime_System.md` 2657) requires `idempotency_key`, `expected_goal_run_revision` and `goal_run_revision`, keeps the required `goal_revision`, and has no `expected_goal_revision` or `parent_goal_id` property. Canon does not decide replanned; it goes to A3 (Q-04). | R2-05 |
| P-15 | Scope exclusions stay explicit unavailable routes: general retries, repair execution, child execution, unknown effect owners, waivers and exceptions, and an unbound verifying writer. For exceptions, cite DL-081 (`Decision_Log.md` 1639) as the pending route contract; do not cite an unanswered product question. The GRS-027 citation stays out of the operative basis (scope addendum). | R4-06, R4-41 |
| P-16 | Do not compile superseded text as operative: `StopAcceptedPending` in v3 `PROTOCOL.md` 98, and the old `StopAcceptedPending` and `PendingStopSource` definitions in `schemas/workflow-combined-guard.v1.schema.json` (1127, 1271) and `CombinedStopCurrentInput`/`CombinedStopResult` in `schemas/workflow-original-start.v7.schema.json` (3210, 3246), which `STOP-PROTOCOL.md` line 3 declares "lineage, not alternate installed Stop entry points" (R10 supersedes the old pending-Stop routing), and the stale native-v8 local references flagged by independent review v1 `2dae6b20`. | R4-03, R4-40 |
| P-17 | Stale certified-family pins on `main`, awaiting reseal. 4 of the 109 members of `goal_certified_family_composition.json` do not match: `00-plans-index.md`, `Goal_Runtime_System.md`, `storage-plan.md`, storage registry `8556e243` (`main` `df772ad3`). `goal_run_certified_consumer_contracts/owner-sources.json` and `physical-retention-install.json` hold more. The 2026-09-25 landing record (`LANDING_20260925_EA_CERTIFIED_ANCHORS.md` lines 62-64) names the `Goal_Runtime_System.md` member and notes the `storage-plan.md` member as already stale; it names neither the `00-plans-index.md` nor the `storage_value_registry.json` member, nor the consumer's pins. A1 must not bind "the current v7 family" by those digests before the reseal, and must not reseal them itself (reseal request R-1). | R3-04 (corrected), R2-11 (corrected) |
| P-18 | Next free unit ids, re-checked at rebase: EP-125, GRS-086, CV-353, SP-320, ATS-058, BRS-030, DL-084 (also OP-037, C-053, PNC-026, PDS-023). Two SP numbers collided between threads in the last two days (SP-314 became SP-318 and SP-319). | R3-15, R2-10 |

## 9. Open obligations, by the branch that can close them

| Item | Package statement | Canon on `main` | Class |
|---|---|---|---|
| Whole-package semantic acceptance | `independent_review: PENDING`; every later review is bounded | none | A1: its canonical-draft package with independent and root review |
| Seven positive-route obligations: FIRST-REPLAN-CLAIMED, FIRST-REPLAN-PREPARED, FIRST-CERTIFIED-HELD, REPEATED-HELD, READBACK-RELEASED-IDLE-REPLAN, READBACK-RELEASED-IDLE-CERTIFIED, TRUTHFUL-UNAVAILABLE | `COMPLETE_SOURCE_OBLIGATIONS_NOT_INSTANCES`; instances and native NOT_RUN | Only the original Goal Stop argument (EP-119). No Slot, SlotRevision or SlotOrigin, and no `revoke_run_execution` | A1 compiles them verbatim as NOT_RUN and places the three slot families they need. Discharge needs native execution |
| Full original cancellation, D06 | `SEPARATE_DEPENDENCY_NOT_SUPPLIED_BY_LIMITED_REVOCATION` | D06 grammar is canonical (EP-118/119/121, SP-312), and v8 ships its v3/v7 argument successors. The issuer `owner.executor.native.record_cancellation.v1` is still "Complete dependency contract only" (`Executor_Protocol.md` 7440) | A1 states it unavailable. Evidence needs a new `record_cancellation` lifecycle/source package, then native execution |
| Four consumer-adoption items (certified v8 consumer, Replan consumer, started/cancelled combined-profile consumers, projector/checkpoint/backfill/retention declarations) | `SEPARATE_EXTERNAL_CONSUMER_ADOPTION_REQUIRED_NOT_ADMITTED` | v7 consumers only; GRS-085 and SP-312 halt on replanned | A2; the registry and projection part of the fourth touches A3 |
| Event registry | `Event_registry: UNCHANGED`, measured against `1972a6aa…`, which is superseded by `0be54418…` in the certified row only | three rows at v2 | A3 |
| Native execution, schema instances | NOT_RUN | NOT_RUN | Not closable by source compile; no fabricated originals |
| Repository validators | NOT_RUN | — | A1 landing check |
| Pending-source boundaries (start association, certified current, replan inventory observer, storage headers) and the Stop install-at-birth rule | stated rules | no counterpart | A1, in full owner prose |
| Replan v3 prebirth-composition gap | Replan v3 status `..._PREBIRTH_COMPOSITION_MISSING`; the combined source is the composition the prebirth plan `21e672ca…` recommends | none | A1: closed at source level by installing v8; native birth stays NOT_RUN |

A1 therefore closes by compile: canonical placement; whole-package review, through its canonical-draft package; the four pending-source boundaries; the install-at-birth rule; TRUTHFUL-UNAVAILABLE's statement; and, at source level, the Replan v3 prebirth-composition gap. It leaves open: the other six positive-route discharges, D06 evidence, native execution and instances, consumer adoption (A2), and the Event contracts and registry rows (A3).

## 10. Goal V2 check

Jared asked on 2026-09-25 whether this work uses the current text-only Goal V2. It does. `main`'s `Goal_Runtime_System.md` defines `GoalRecordV2` (one `objective_text`, a revision, `active|paused|blocked|completed`) and retires phases, tranches, child Goals, Goal budgets and the mandatory role cast (lines 58 onward and "Retired Goal structure", 235). No branch on GitHub edits it beyond `main`. v8's pinned copies at `dd1df59d` and `13e7dbc0` carry the same V2 authority line. v8 concerns Workflow runs (`goal_run.*`), not the Goal record.

v8's active files carry none of the retired constructs, which appear only in its lineage copies of older canon. One field needs an owner reading (Q-01): v8's `ReplanRequiredSet` requires `required_child_goal_run_ids` (`schemas/replan-source.v4.schema.json` 3469, 3483). It inherits this from current canon: `workflow_activation_contracts/schemas/workflow-activation.v4.schema.json` 1747 and 1758 carry it, along with `parent_goal_run_id`, and `Contracts_V0.md` uses it.

## Open questions

| ID | Question | For |
|---|---|---|
| Q-01 | Are "child goal runs" (`required_child_goal_run_ids`, `parent_goal_run_id`, inherited from the landed Workflow activation contracts) a current Workflow-run concept under Goal V2, or a leftover of the retired child-Goal topology? | Goal Runtime / Workflow owner |
| Q-02 | Does DL-078's standing rule cover revising an already-registered row (the three `goal_run` rows are among the original 37), or does each A3 revision need Jared's own checkpoint approval, as the certified v3 revision did? (DL-078's last clause, `Decision_Log.md` 1571, sends any other registry change to his own approval.) | PM Low cost/complexity process thread (routed by Jared on 2026-09-25; see STATUS.md) |
| Q-03 | DL-077 admission records apply only beyond the original 37 and the two August families. Should A3 still write one per family, as the thread's instructions ask, as an extra record the seal check will not read? | PM Low cost/complexity process thread (routed by Jared on 2026-09-25; see STATUS.md) |
| Q-04 | Must `goal_run.replanned` v3 adopt the goal_run v3 envelope (required `idempotency_key`, `expected_goal_run_revision` and `goal_run_revision`; no `expected_goal_revision` or `parent_goal_id`), or may it keep the Replan draft envelope? | Goal Runtime and Storage owners, in A3 |
| Q-05 | P-09, P-10 and P-11: which coordinator descriptors v8 binds, whether the `13e7dbc0` pins stay lineage, and what the draft identifiers are renamed to. Each changes `2d69459c…`. | the A1 canonical-draft author and its root review |
| Q-06 | Is `ReleaseReceipt.source_token` meant as stored provenance of the whole token, the reading DL-076 rejected for Browser reset, or as a live fence? | Storage owner (P-01) |
| Q-07 | Should the Runtime Replan action and its wiring move from the historical-only `goal.replanned` to `goal_run.replanned`? | A3 / wiring owner |
| Q-08 | The registry's `goal_run.certified` source ref `identity.v1.schema.json#/$defs/EventRecord` does not resolve: `identity.v1` defines only `Recipe`, `IdentityInput`, `IdentityResult` and `IdentityOutcome`. Which definition is meant? An A3 replanned row must not copy the pattern. | Event and Storage owners |
| Q-09 | What is "B01's blocked trigger" (scope adjudication `v1/ADJUDICATION.md` line 15)? It bears on the A3 `goal_run.blocked` contract. Main already records B01 as unidentified: plan line 136 and `step-08-source-handoff-and-composition-review-20260921.md` line 26 ("B01 remains the sole pending question"). | PM Low cost/complexity process thread (routed by Jared on 2026-09-25; see STATUS.md) |
| Q-10 | The narrow Replan v3 root review `13437dc7…` and the full prebirth plan are only on the NAS. A1's canonical-draft review should read them there, or cite them by hash only. | A1, on the VM |
| Q-11 | R-05: should `original-bank-checks.json` be regenerated in a successor edition, or recorded as a known stale diagnostic? | A1 canonical-draft author |
| Q-12 | May A1 install v8 while D06 stays an explicitly unavailable dependency? The plan lists D06 among A1's blocking gaps, not as a prerequisite. | PM Low cost/complexity process thread (routed by Jared on 2026-09-25; see STATUS.md) |

## Process answers (2026-09-25)

The PM Low cost/complexity process thread answered Q-02, Q-03, Q-09 and Q-12, and where A1's package lives, on Jared's delegation. The answers are in `reports/event-authority-20260911/replan-v8/process-answers-20260925.md` on branch `plans/replan-v8-process-answers-20260925` (commit `616f12bfd`).

- **Q-02.** DL-078 does not cover a revision of an existing row. Every A3 landing that changes a registry row needs its own checkpoint card to Jared, in the DL-036 form, before it lands. The card carries the exact before and after rows and the registry SHA-256 before and after. Each landing's card is answered separately, and each answer is recorded as a Decision Log entry.
- **Q-03.** Write the DL-077-form records, one per family. Each record's first line says that the seal check does not read it. Its depth part cites a new dated assessment of that family alone, pinned by SHA-256, because the depth42 row stops being current once the row is revised.
- **Q-09.** B01 is the package's own label, not an identifier in canon (v3 `PROTOCOL.md` line 80, `inputs/plan/PLAN.md` line 38). It stands for the question of which condition puts a run into the blocked state, and the package treats that as a product-policy decision.
  - A3 first reads the owner text (D-R19 and GRS-085) for an existing definition.
  - If canon has none, a DL-036 card goes to Jared, and `goal_run.stopped` lands first so the card holds nothing else up.
- **Q-12.** A1 may install v8 with D06 explicitly unavailable. Its owner text must say four things: the D06 grammar is carried; its issuer is an unbound dependency; nothing activates `record_cancellation.v1` by implication; and the Stop route rests on `revoke_run_execution.v1`. The A3 `goal_run.stopped` contract must not depend on D06.
- **Package home.** A1's canonical-draft package goes to `sittingmongoose/PuppetMaster-Packages` at `replan-v8/goal-replan-v8-canonical-draft-20260925/v1`. It stays on a branch until its reviews accept it, then merges with a `SHA256SUMS`.
- **Landing.** The cloud thread never lands a branch. A local session that Jared designates lands each reviewed branch.

These four questions are answered; Q-01, Q-04 to Q-08, Q-10 and Q-11 stand. This section was added after the review cycles and records the answers only.

## Reseal and landing

This branch edits only `reports/event-authority-20260911/replan-v8/`. It makes no governance artifact stale. It carries forward one reseal item that is already true on `main`:

- **R-1.** The certified-family pins in P-17 were already stale before this branch. Four composition members are affected, and the landing record `LANDING_20260925_EA_CERTIFIED_ANCHORS.md` names two of them: the `Goal_Runtime_System.md` member, and the `storage-plan.md` member as already stale. The certified consumer's `owner-sources.json` pins the same three stale values in its current-selection `sha256` fields (lines 5, 17 and 53: `Goal_Runtime_System.md` `ccedade9…`, `storage-plan.md` `32885861…`, `storage_value_registry.json` `8556e243…`), and `physical-retention-install.json` line 49 pins the registry at `8556e243…`; all need the same reseal. Its `original_source_lineage` hashes are historical by design.

The exports repair the plan makes A1 wait for has landed (`8bc898648`).

## Evidence

| File | What it is |
|---|---|
| `a0/census.py` | The re-census (read-only; `census.py <replan-v8 dir> <repo> <rev> <out>`) |
| `a0/compact.py` | Builds the committed extracts from the full outputs |
| `a0/census-summary.json` | Summary at `a6480b0f7c` |
| `a0/census-nonexact.json` | Every non-exact row in full, with parent authentication, registry deltas, proposed families and owner additions |
| `a0/census-full-outputs.SHA256SUMS` | SHA-256 of the ten full outputs (reproducible by re-running) |
| `a0/readjudication-findings.json` | 107 findings from four readers, each re-checked by an adversarial verifier (97 confirmed, 10 corrected, none refuted), with 23 verifier additions, open questions and what each did not check |
| `a0/selfcheck.json` | The package-check re-runs, with the real library and with the stand-in |
| `a0/review-cycle-1.json` | The cycle-1 blind review form on `c0e9644a57` (23 findings: 1 blocking, 16 should_fix, 6 notes), each applied in its own commit |
| `a0/review-cycle-2.json` | The cycle-2 re-review of the repaired rows on `f29ca48b75`: verdict ready (3 should_fix, 5 notes), each applied in its own commit; the cycle cap is reached |

## Cost

A0 used about 4.5 agent-hours and about 0.9M output tokens (0.84M in subagents, the rest host). That was 9 subagents in one workflow (2.6 agent-hours, 2.45M subagent tokens in all, 1.3 hours wall) plus the host's census, re-runs and report. This is within the plan's half agent-day, but about four times its 150K to 250K output-token estimate. The blind review is not included.
