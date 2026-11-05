# W3G — phase 1, prepared without admission

**Branch:** `plans/ea-w3-plan-research-notebook-20261105`
**Owner-code head:** `e3e1d7b2b38274d7d3a4e4f8290b895f0bb4cd47`
**Base:** `f9c5de6561dff0a53a48e530f2a5c6804a7e941d` (`origin/main` after the required fetch).

**Outcomes:** 19 prepared, 0 merged, 0 excluded, 0 stopped candidate rows. One separate owner investigation remains unresolved. Sixteen prepared rows retain the permitted `PENDING_RETENTION_DECISION` cell. No row is ready for admission; phase 2, the missing retention decisions and required reviews remain.

**Stage:** Planning-document and test-oracle work only. Native execution is NOT_RUN. No event/value registry family append, admission record, Decision Log entry, Spec Lock/evidence edit, governance seal, executable oracle or check-11 proof. No main push, pm-mail or subagent.

## Per-row outcomes

| Exact name | Outcome | Owner / Contracts / Storage | Retention | Criterion 12 |
|---|---|---|---|---|
| `assistant_plan.build_started` | prepared | `APR-1500` / `CV-1500` / `SP-1500` | `RP-RUNTIME-365D@1.0.0` | PARTIAL |
| `assistant_plan.cancelled` | prepared | `APR-1501` / `CV-1501` / `SP-1501` | `PENDING_RETENTION_DECISION` | PARTIAL |
| `assistant_plan.completed` | prepared | `APR-1502` / `CV-1502` / `SP-1502` | `RP-RUNTIME-365D@1.0.0` | PARTIAL |
| `assistant_plan.created` | prepared | `APR-1503` / `CV-1503` / `SP-1503` | `PENDING_RETENTION_DECISION` | PARTIAL |
| `assistant_plan.exported` | prepared | `APR-1504` / `CV-1504` / `SP-1504` | `PENDING_RETENTION_DECISION` | PARTIAL |
| `assistant_plan.version_created` | prepared | `APR-1505` / `CV-1505` / `SP-1505` | `PENDING_RETENTION_DECISION` | PARTIAL |
| `assistant_plan.wizard_handoff_created` | prepared | `APR-1506` / `CV-1506` / `SP-1506` | `PENDING_RETENTION_DECISION` | PARTIAL |
| `external_research.budget_denied` | prepared | `ERS-1507` / `CV-1507` / `SP-1507` | `PENDING_RETENTION_DECISION` | PARTIAL |
| `external_research.finding_classified` | prepared | `ERS-1508` / `CV-1508` / `SP-1508` | `PENDING_RETENTION_DECISION` | PARTIAL |
| `external_research.job_terminal` | prepared | `ERS-1509` / `CV-1509` / `SP-1509` | `PENDING_RETENTION_DECISION` | PARTIAL |
| `external_research.packet_delivered` | prepared | `ERS-1510` / `CV-1510` / `SP-1510` | `PENDING_RETENTION_DECISION` | PARTIAL |
| `external_research.topic_started` | prepared | `ERS-1511` / `CV-1511` / `SP-1511` | `PENDING_RETENTION_DECISION` | PARTIAL |
| `goal.paused` | prepared | `GRS-1512` / `CV-1512` / `SP-1512` | `PENDING_RETENTION_DECISION` | PARTIAL |
| `goal.resumed` | prepared | `GRS-1513` / `CV-1513` / `SP-1513` | `PENDING_RETENTION_DECISION` | PARTIAL |
| `notebook.checkpoint_committed` | prepared | `WN-1514` / `CV-1514` / `SP-1514` | `PENDING_RETENTION_DECISION` | PARTIAL |
| `notebook.checkpoint_failed` | prepared | `WN-1515` / `CV-1515` / `SP-1515` | `PENDING_RETENTION_DECISION` | PARTIAL |
| `notebook.entry_committed` | prepared | `WN-1516` / `CV-1516` / `SP-1516` | `PENDING_RETENTION_DECISION` | PARTIAL |
| `notebook.entry_superseded` | prepared | `WN-1517` / `CV-1517` / `SP-1517` | `PENDING_RETENTION_DECISION` | PARTIAL |
| `notebook.transition_state_changed` | prepared | `WN-1518` / `CV-1518` / `SP-1518` | `RP-RUNTIME-365D@1.0.0` | PARTIAL |

## Authority, current search and premise checks

Read WAVE3, BRIEF-DRAFT, WAVE2, the rubric, repository instructions and ID/currentness memories, Card-1 and Card-2 answer records/decks, and the integration-note wording/number-domain rules. The nineteen exact bucket-e names are in the frozen returned list. Deck-2 9.a A / DL-450 authorizes technical definitions after an existing-first search; it chooses no product behavior, retention/deletion rule or competing owner. The earlier 4b/DL-411 terms are reused as limits, not a blanket registration.

Each exact-name search covered current hidden and ordinary Plans owner text, schemas, wiring and implementation-readiness material, excluding generated shards/indexes, ledgers and audit/migration/evidence archives. Candidate lists and recommendations were verified against current owners. No exact per-family producer/identity/consumer/checkpoint/withdrawal contract or admitted event member was found. Existing full native schemas, SP-278/SP-286 and CV-317/CV-366 are reused; every missing event binding is labelled newly authored in its own owner/CV/SP unit.

| Exact name | Search matches at base | Current reused owner/source | Negative evidence |
|---|---:|---|---|
| `assistant_plan.build_started` | 2 | `APR-008, APR-011, APR-073/074, PGOAL-003..006 and the complete native AssistantPlanRecord/PlanRun, approved revision, To-Do mapping and applicable Crew/Goal/schedule original result` | Exact current name listed/required; complete per-family technical binding and registry member absent. |
| `assistant_plan.cancelled` | 2 | `APR-005, APR-010, APR-017, APR-074 and PFAIL-003..009 original Plan/cancel/PlanRun/epoch/schedule-quota settlement` | Exact current name listed/required; complete per-family technical binding and registry member absent. |
| `assistant_plan.completed` | 2 | `APR-008/010, PFAIL-003..009, PPROG-001..018, APR-073/074 original PlanRun completion and To-Do/approved-step/scoped-bundle evidence` | Exact current name listed/required; complete per-family technical binding and registry member absent. |
| `assistant_plan.created` | 2 | `APR-001/002/005, APR-073/074, exact AssistantPlanRecord and first document revision under the direct or ledger-bound source owner` | Exact current name listed/required; complete per-family technical binding and registry member absent. |
| `assistant_plan.exported` | 2 | `APR-003, PPROG-015..016, PDET-009..012 and the original artifact export receipt of the exact immutable revision` | Exact current name listed/required; complete per-family technical binding and registry member absent. |
| `assistant_plan.version_created` | 2 | `APR-004/005/073 and original immutable PlanDocumentRevision plus its exact parent/current-slot result` | Exact current name listed/required; complete per-family technical binding and registry member absent. |
| `assistant_plan.wizard_handoff_created` | 2 | `APR-012, APR-074 and Planning_Wizard intake original handoff receipt with exact source Plan revision/hash and real destination Project` | Exact current name listed/required; complete per-family technical binding and registry member absent. |
| `external_research.budget_denied` | 1 | `ERS-008/009, research_budget_receipt and the actual durable request meter/native usage records` | Exact current name listed/required; complete per-family technical binding and registry member absent. |
| `external_research.finding_classified` | 1 | `ERS-004/013, research_finding_record and genuine delivered assertion/citation/union-owner evidence` | Exact current name listed/required; complete per-family technical binding and registry member absent. |
| `external_research.job_terminal` | 1 | `ERS-008/009/010, research_job_record, native runtime result, durable request meter and research_run_manifest` | Exact current name listed/required; complete per-family technical binding and registry member absent. |
| `external_research.packet_delivered` | 1 | `ERS-005/007, research_decision_packet/research_decision_card and actual destination thread delivery receipt under DL-036` | Exact current name listed/required; complete per-family technical binding and registry member absent. |
| `external_research.topic_started` | 1 | `ERS-002/003/014, exact real Project, frozen plans snapshot, product brief and original run manifest` | Exact current name listed/required; complete per-family technical binding and registry member absent. |
| `goal.paused` | 15 | `GRS-048/051/064/086, SP-287/SP-351 complete original body/control/Stop and original narrow body mutation receipt` | Exact current name listed/required; complete per-family technical binding and registry member absent. |
| `goal.resumed` | 13 | `GRS-048/050/051/064/086, original body/control/Stop, current permission and any blocked-condition clearance source` | Exact current name listed/required; complete per-family technical binding and registry member absent. |
| `notebook.checkpoint_committed` | 1 | `WN-016/017/021, SP-256/SP-336 and exact notebook_checkpoint_record plus the complete original required entry-revision/capsule/workflow dependency set` | Exact current name listed/required; complete per-family technical binding and registry member absent. |
| `notebook.checkpoint_failed` | 1 | `WN-016/020/021 and exact failed notebook_checkpoint_record or original typed failure result preserving recovery material` | Exact current name listed/required; complete per-family technical binding and registry member absent. |
| `notebook.entry_committed` | 1 | `WN-006/007/019/021, original notebook_revision_mutation and exact working_notebook_entry_record revision/body hash/restrictions` | Exact current name listed/required; complete per-family technical binding and registry member absent. |
| `notebook.entry_superseded` | 1 | `WN-007/010/014/019/021, exact original superseded entry revision and original successor link under notebook restriction/CAS custody` | Exact current name listed/required; complete per-family technical binding and registry member absent. |
| `notebook.transition_state_changed` | 1 | `Prompt_Pipeline proactive fresh-window request/admission section, SIR-042, WN-016/021 and original context_transition_record/admission receipt` | Exact current name listed/required; complete per-family technical binding and registry member absent. |

The failed retention analogies are explicit: G15 is the listed thread/worktree history, G16 the listed planning-document annotations, G03 Assistant memory-note history, G27 subagent shrink/restore and G29 continuation_evaluated. None grants these newly returned families a lifetime merely by resemblance. Three events require a real PlanRun/context-transition run and bind the existing Case L-3 runtime class; their clocks come from original run-completion custody. Native body/result/artifact/receipt retention stays independent. DL-259 FX-1 still requires actual export success rather than an opened print flow. GRS-064/SP-287/CV-366 still preserve eleven-field Goal bodies, independent original receipts and original Project versus application editions. No old answer is broadened.

## Newly authored bindings and Storage rows

Each family has its own closed payload selector file, exact original source-schema selections and field joins, native producer/transition/ordering text, stable original-operation event/idempotency identity, historical-read route, custody/backup/restore, compatibility and withdrawal protocol. The 19 per-family reader names and precise source records are enumerated in `Plans/event_authority_w3g/contracts.json`; each is independently bound in its owner/SP unit. Application keys adopt CV-366 exactly; numeric/timestamp/wire/physical encodings stay with their existing owners and the reviewed phase-2 shared helper.

The Storage value tables in SP-1500..SP-1518 give actual existing value IDs, exact key shapes, schema refs and retention policies. These events add no persisted filtered projection, private checkpoint or second original-operation store. Every exact family reader adopts the existing SP-278 generic projector, reader and `event_record_index_checkpoint.v1:{storage_instance_id}` with full global-range proof. Thus no new Storage value family row is needed and `Plans/storage_value_registry.json` is unchanged. Native source, result and referenced artifact availability remains an independent original-owner prerequisite, never supplied by an all-true fixture.

## Criterion-12 oracle plan and check-11 boundary

`Plans/event_authority_w3g/oracle_plan.json` contains 1629 semantic/shared guard rows and 2309 explicit schema assertion sites. Each family has its own positives, negative mutation/refusal/effect expectation and isolation instructions. Every negative must originate from that branch's valid original and carry one defect; deterministic copies/commitments are recomputed while independent originals remain valid. A shared keyword/refusal never merges predicates. Each real same-field/same-predicate duplicate site is cut individually and then together using the shared tool. Unresolved implication/overlap is a phase-2 finding, never a manufactured proof.

Phase 2 starts after the lead rebases onto the reviewed NUMRULE and GUARDTOOL foundation. It writes executable fixtures with the shared exact number/date-time helper and proves the complete assertion inventory with `scripts/pm_guard_isolation.py`; then Sol and Astra review. These plans are not executable oracles and demonstrate no guard-removal PASS.

| Standing defect class | Exact plan coverage / current evidence |
|---|---|
| Substituted identities/digests or contradictory snapshots | Per-family source issuance, full source/hash/identity/field-join guards; executable mutations deferred. |
| Storage-assigned fields trusted from payload | storage_metadata guard; producer comparison explicitly excludes Storage metadata. |
| Retained history rejected by current state, or invalid/foreign history accepted | Original authenticated edition positives after live-state change; separate current visibility/withdrawal negatives. |
| One field read two ways / number variants / strict history | Exact type-before-value and shared NUMRULE qualification; no local cap/encoder/parser. Current 1.0/-0/1e0/01 and authenticated old-recipe cases are planned at their owning input boundaries. |
| Unresolved unvisited refs | All 19 new schemas and reachable refs checked eagerly; exact schema-resource URI map committed. |
| Inline/operation parts above 16 KiB | SP-337 for full payload and independent per-part SP-340 checks, with large-value positives and negatives. |
| Custody skipped on retry/replay/recovery / wrong family | Whole original source/first receipt/group and payload-dispatch guards on every path. |
| Masked negatives / overstated grades | Predicate-only cuts; dependency repair required; criterion 12 stays PARTIAL until actual shared-tool proof. |
| Wrong primitive/container types | Per-schema-site inventory plus original source exact types and wrong-type cases. |
| format silently skipped | Shared enforced owner timestamp profiles; no new payload timestamp or local timestamp parser. |

No lane-local numeric/timestamp or guard-isolation machinery was authored. The only ad-hoc verification code is a structural schema/reference checker outside the repository, not an event oracle.

## Retention questions (permitted open cells)

- **`assistant_plan.cancelled`:** What exact age/count, clock anchor, overflow and deletion rule should assistant_plan.cancelled use in its Project and application scopes, given that the cited Card-1 group does not include this exact family and no exact Storage event-class assignment decides it? G15 is chat actions, not this exact Plan cancellation; pre-Build cancellation has no real run, so RP-RUNTIME-365D cannot be assigned to the whole family by analogy.
- **`assistant_plan.created`:** What exact age/count, clock anchor, overflow and deletion rule should assistant_plan.created use in its Project and application scopes, given that the cited Card-1 group does not include this exact family and no exact Storage event-class assignment decides it? G15 names thread/worktree actions, not AssistantPlan creation; an indefinite Plan record does not itself assign a lifetime to this additional event.
- **`assistant_plan.exported`:** What exact age/count, clock anchor, overflow and deletion rule should assistant_plan.exported use in its Project and application scopes, given that the cited Card-1 group does not include this exact family and no exact Storage event-class assignment decides it? G15/G16 do not name this export history; the artifact body and export receipt retain independent policies.
- **`assistant_plan.version_created`:** What exact age/count, clock anchor, overflow and deletion rule should assistant_plan.version_created use in its Project and application scopes, given that the cited Card-1 group does not include this exact family and no exact Storage event-class assignment decides it? G16 covers planning-document annotations/revisions in its exact nine-name group, not this newly returned AssistantPlan version family.
- **`assistant_plan.wizard_handoff_created`:** What exact age/count, clock anchor, overflow and deletion rule should assistant_plan.wizard_handoff_created use in its Project and application scopes, given that the cited Card-1 group does not include this exact family and no exact Storage event-class assignment decides it? G17 is the listed Wizard histories; it does not name AssistantPlan handoff history. Source and destination retain their independent policies.
- **`external_research.budget_denied`:** What exact age/count, clock anchor, overflow and deletion rule should external_research.budget_denied use in its Project scope, given that the cited Card-1 group does not include this exact family and no exact Storage event-class assignment decides it? G16 names planning-document annotations, not research budget refusals; no exact event retention assignment was found.
- **`external_research.finding_classified`:** What exact age/count, clock anchor, overflow and deletion rule should external_research.finding_classified use in its Project scope, given that the cited Card-1 group does not include this exact family and no exact Storage event-class assignment decides it? G16 does not name this research classification/credit family; the underlying finding/union record is separate.
- **`external_research.job_terminal`:** What exact age/count, clock anchor, overflow and deletion rule should external_research.job_terminal use in its Project scope, given that the cited Card-1 group does not include this exact family and no exact Storage event-class assignment decides it? A research_job_id or manifest is not an Executor/PlanRun identity; G16 and Run year cannot supply an event clock by analogy.
- **`external_research.packet_delivered`:** What exact age/count, clock anchor, overflow and deletion rule should external_research.packet_delivered use in its Project scope, given that the cited Card-1 group does not include this exact family and no exact Storage event-class assignment decides it? G16 covers the listed planning-document events, not this new research packet delivery event; chat artifact content remains separately governed.
- **`external_research.topic_started`:** What exact age/count, clock anchor, overflow and deletion rule should external_research.topic_started use in its Project scope, given that the cited Card-1 group does not include this exact family and no exact Storage event-class assignment decides it? G16 is not an exact assignment to research-topic start; frozen source and manifest retention do not automatically assign this extra event.
- **`goal.paused`:** What exact age/count, clock anchor, overflow and deletion rule should goal.paused use in its Project and application scopes, given that the cited Card-1 group does not include this exact family and no exact Storage event-class assignment decides it? G29 decides continuation_evaluated only; neither it nor the independently indefinite native body receipt assigns retention to this new pause event.
- **`goal.resumed`:** What exact age/count, clock anchor, overflow and deletion rule should goal.resumed use in its Project and application scopes, given that the cited Card-1 group does not include this exact family and no exact Storage event-class assignment decides it? G29 covers the exact continuation check, not this resumed semantic event; preserving native result/Stop policy does not choose an additional event lifetime.
- **`notebook.checkpoint_committed`:** What exact age/count, clock anchor, overflow and deletion rule should notebook.checkpoint_committed use in its Project and application scopes, given that the cited Card-1 group does not include this exact family and no exact Storage event-class assignment decides it? SP-256 assigns native checkpoint values indefinite receipt/source lineage; no exact additional event assignment was found. G03 is Assistant memory, not notebook history.
- **`notebook.checkpoint_failed`:** What exact age/count, clock anchor, overflow and deletion rule should notebook.checkpoint_failed use in its Project and application scopes, given that the cited Card-1 group does not include this exact family and no exact Storage event-class assignment decides it? The failure event is not the checkpoint value itself; G03/G27 do not name it. No age/count/deletion rule is inferred.
- **`notebook.entry_committed`:** What exact age/count, clock anchor, overflow and deletion rule should notebook.entry_committed use in its Project and application scopes, given that the cited Card-1 group does not include this exact family and no exact Storage event-class assignment decides it? G03 applies Assistant memory-note actions, not these notebook entries. Native notebook indefinite retention does not automatically retain this additional event.
- **`notebook.entry_superseded`:** What exact age/count, clock anchor, overflow and deletion rule should notebook.entry_superseded use in its Project and application scopes, given that the cited Card-1 group does not include this exact family and no exact Storage event-class assignment decides it? G03 is a different memory owner/family set; native entry lifecycle and retention are reused without assigning event retention by analogy.

## Owner investigation: goal.receipt.recorded

The exact dotted name occurs once in current non-generated canon: `Plans/.implementation_readiness/non_executable_closure_evidence.json:264`, with payload contract `Plans/plans_to_code_handoff.schema.json#/$defs/goal_completion_receipt`, a Goal Runtime certifier producer and child-receipt/source-control negative. The current Goal owner separately lists the registered underscore name `goal.receipt_recorded` and D-R09, whose original interpretation uses receipt-kind/certifier/child/worknode fields and older lifecycle states. Current Goal V2 is the text-only four-state model and retires Goal-owned child/role structure. Neither owner explicitly proves that the dotted marker is only a result label, an alias, or a second persisted fact. A schema/ref match is not that proof.

**Finding:** unresolved owner evidence; no new contract, registration, alias or exclusion is authored. Preserve all existing historical-only/current-writer constraints and let DG/DG-OWN continue their own units.

**Exact question:** Does goal.receipt.recorded denote only the saved goal_completion_receipt proof/notification, an alias of retained goal.receipt_recorded, or a separate saved-history family? Which current owner contract supplies that meaning while preserving the historical-only constraints and the retirement of Goal certifier/child-Goal structure?

## Self-grade

Self-grade is `W3G.self-grade.json`, in the Step-09 row/cell/evidence format: {'ABSENT': 19, 'PASS': 174, 'PARTIAL': 35} across 19×12 cells. Membership is ABSENT for all nineteen; retention is PARTIAL for sixteen; criterion 12 is PARTIAL for all nineteen. Every evidence quote was checked as an exact substring of the cited current file/line. PASS means normative phase-1 text, not event admission, implementation readiness, native success or executable guard proof. No reviewer PASS is claimed.

## Verification

| Check | Exit | Result / evidence |
|---|---:|---|
| `assistant-existing` | 1 | gaps_found only because 51 Browser candidate events remain pending; errors=0. No Browser admission was changed. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/assistant-existing.log`; SHA-256 `36069b2bfd1e6584e80dc594811f0fdb76225c2f96ba512c45c70d67566291fa` |
| `index-generate-clean` | 0 |  `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/index-generate-clean.log`; SHA-256 `94d21193fbfa7f19eb2fb43f2570dcf810d4a983176c957e52b1c99dc6f8e8f3` |
| `index-generate` | 0 |  `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/index-generate.log`; SHA-256 `4a5f08223e0e3e8698681d6398ac7034ec60bcbeb85ff9d546b12345c6ea3fe6` |
| `index-validate-final` | 0 | Top-level JSON status parsed as pass; no failures. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/index-validate-final.log`; SHA-256 `5edc6422897743c1227879bec7194d1ffbb4571c0bf2286baa52134df9deece8` |
| `index-validate` | 0 | Top-level JSON status parsed as pass; no failures. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/index-validate.log`; SHA-256 `5a6f3f819828cda0a8dfdb75dfc32f9767238d8c860048fdffd139d08d90a750` |
| `notebook-existing` | 0 |  `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/notebook-existing.log`; SHA-256 `6676c20e8a4322c354e2295d03ab5e42abb89dfa1fae0c878586737951fbc0ef` |
| `research-existing` | 0 | Top-level status pass; findings=0. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/research-existing.log`; SHA-256 `9e315376e2c190e8c42440c89cb858fb30f5a64a4edabaf8f97ecad378404c11` |
| `shards-check-final` | 0 |  `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/shards-check-final.log`; SHA-256 `fba1c36054a83d9c3416be7e4daee87e6c4b513f0a6d9855ec799ece79702957` |
| `shards-check` | 0 |  `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/shards-check.log`; SHA-256 `fba1c36054a83d9c3416be7e4daee87e6c4b513f0a6d9855ec799ece79702957` |
| `shards-generate-clean` | 0 |  `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/shards-generate-clean.log`; SHA-256 `4580172d0223709a6fb4d9b19629202b9fa567c072acac77a03bdc874e57c543` |
| `shards-generate-final` | 0 |  `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/shards-generate-final.log`; SHA-256 `4580172d0223709a6fb4d9b19629202b9fa567c072acac77a03bdc874e57c543` |
| `shards-generate` | 0 |  `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/shards-generate.log`; SHA-256 `4580172d0223709a6fb4d9b19629202b9fa567c072acac77a03bdc874e57c543` |
| `structure-final-v2` | 0 |  `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/structure-final-v2.log`; SHA-256 `99362a60001080f0260c2e52b24d983ebed6e2722c6a1a0584a4d2c2680a24e1` |
| `structure-final` | 0 |  `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/structure-final.log`; SHA-256 `99362a60001080f0260c2e52b24d983ebed6e2722c6a1a0584a4d2c2680a24e1` |
| `structure` | 0 |  `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/structure.log`; SHA-256 `827362d4f50e234867029c251b4c0a35420228a4f1fb8a96d9487d005e7037f7` |

One index-generation preflight returned exit 75 below 6 GB available and started no generator; the lane paused for two minutes, rechecked, and resumed at 11 GB. Generators/checkers ran serially within this lane. The final diff check is clean after removal of three extra file-ending blank lines. The ignored currentness edition was copied from the shared checkout before index generation; all fifteen file SHA-256 values match. The index still reports its existing runtime-certification readiness boundary; no WorkNodes or NodeSeeds were created. Aggregate governance gates/seal checks are outside this non-admission phase.

## Shared-file and owner ranges

| Path | New line ranges at this owner-code head |
|---|---|
| `Plans/Assistant_Plan_Runtime.md` | 1029..1432 |
| `Plans/External_Research.md` | 723..1014 |
| `Plans/Working_Notebook.md` | 880..1172 |
| `Plans/Goal_Runtime_System.md` | 282..409 |
| `Plans/Contracts_V0.md` | 24469..25851 |
| `Plans/storage-plan.md` | 29477..31019 |
| `Plans/Automated_Testing_System.md` | 7237..7468 |

All seven owner Markdown edits are insertions only. The Goal block is at the end of Goal V2 events, before the migration section; no original or DG unit is edited. Shared Contracts/Storage/ATS changes are new bounded owner addenda and units, with no existing row reordering or prose reflow. Generated shard changes are limited to the edited sharded owners; the plan index is regenerated globally, never hand-merged. No unrelated owner shard changed.

## IDs and evidence

**IDs:** APR-1500..1506; ERS-1507..1511; GRS-1512..1513; WN-1514..1518; CV-1500..1518; SP-1500..1518; ATS-1260..1263. All sixty-one new IDs were free against current main and every fetched origin branch (529 refs, 213 unique owner blobs).

- **id-audit.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/id-audit.json`; SHA-256 `bfc824b0eab75073eaf49f06715a5a23b8302abc2f0b34a904c2fcacf172480a`.
- **search-evidence.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/search-evidence.json`; SHA-256 `07319839838913b2f9b820fb5c9c95872a1f9b2a787e0e1b932174a5d7527005`.
- **currentness-copy.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/currentness-copy.json`; SHA-256 `b72623c6887c9cb3b53eb0da0baf1e1b8c0b5d46fe116d4f25746361bbe73b8b`.
- **unchanged-boundaries.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/unchanged-boundaries.json`; SHA-256 `5c16822eb0659f7fd84d2f4e414b5a442def5aab55d9e60a297eaaf46b17f854`.

The report and self-grade are copied to this same evidence directory. The pushed branch is the integration handoff; the sparse worktree is removed after final push. No main landing is performed.

## Phase-1 review round 1: findings and responses

**Reviewed head:** `fbd1b87ef950472b950e4922dfee5fbf4a641e6a`. **Fix owner/plan commit:** `e3e1d7b2b38274d7d3a4e4f8290b895f0bb4cd47`. The independent phase-1 review found B1 on all nineteen rows and B2 on the two Goal rows. Both findings are accepted and repaired in this round; no finding is disputed. Independent re-review remains required. These are planning-document and test-oracle plan changes, not executable oracle code.

### B1 — all nineteen families

**Where:** `Plans/event_authority_w3g/oracle_plan.json:1066` and every exact family's `guards`, `compound_guard_inventory` and case-execution rule. **Cause:** the original currentness negative did not test lease or mutation permission, and other compound predicates had unenumerated clauses. **Fix:** every family now has independent `write_lease`, `write_lease_scope`, `write_permission`, currentness, owner authority/epoch, complete CAS, original intent, captured Stop epoch and final fence cases. Lease-denial and write-permission-denial cases preserve valid currentness, sources, read permission, other writer authority and commitments. Effective Stop is action-specific: Pause/Cancel retain their owner's permitted control behavior; continuation/recovery cannot erase a stop. Goal cancellation pending and receipt fences are separate from Stop and ordinary pending.

Every expanded clause carries its own positive, one-defect mutation, expected refusal, `expected_new_effects=0`, branch restriction and predicate-only isolation instruction. Compound source/receipt issuance, scope and subject joins, EventRecord/receipt/group identity, metadata, payload forms, coverage/CURRENT authenticity, checkpoint identity/snapshot, original admission/edition, read permission/deletion/restrictions, passive effects, restore dependencies and payload dispatch are split. Domain clauses include frozen Build inputs and native participants, cancellation settlement, completion requirements, immutable revision lineage, destination Wizard intake, research meter/averaging/credit/input/delivery rules, Goal lifecycle/body/history joins and notebook required-set/barrier/failure/admission rules. Optional participants are tested only on their actual owner branch; no missing Project/run/Crew/Goal is fabricated.

Current write/retry checks apply at initial admission and after returning helpers before the actual guarded boundary. An already committed native result remains pending/resolvable through original custody without repetition. Retained history keeps its authenticated original admission/edition despite later lease, write-permission, owner/CAS/Stop/cancellation changes; current disclosure still applies. The full lane now has **1629** planned semantic/shared guards and **2309** payload assertion sites. No phase-2 implementation or guard-removal PASS is claimed.

### B2 — goal.paused and goal.resumed

**Where:** `Plans/event_authority_w3g/contracts.json:518`, `Plans/Goal_Runtime_System.md:335` (GRS-1512), and the corresponding GRS-1513 paragraph. **Cause:** the Project source manifest selected the historical closed V1 control while the Storage rows and current owner selected V2. **Fix:** both current Project selections and complete before/after body/control/receipt joins now use `Plans/goal_cancel_command_custody.schema.json#/$defs/StorageBodyControlV2`. Real-shape positives name the V2 wrapper `pm.storage_value.goal_body_control.v2`, version `2.0.0`, record `pm.goal.body_control.v2`, required fields and independent null cancellation fields. Separate negatives cover current V1 dispatch, nonnull `cancellation_pending`, nonnull `cancellation_receipt_ref`, foreign ordinary pending, control/receipt joins and historical installation provenance. The original V1 decoder is confined to authentic retained original installations/admissions; no default-null upgrade or old-event relabel is allowed. Retained V2 facts survive later live cancellation/Stop.

**Main authority, not an integration-only copy:** at fetched `origin/main` `73f2231a9ec1c93190adafcdde51030f028c8c2d`, `Plans/Goal_Runtime_System.md:6191-6193` (GRS-064) selects BodyControlV2 with independent cancellation pending for every current mutation/read/backup route. `Plans/storage_value_registry.json:63613-63640` selects `goal_body_control` schema `2.0.0` and explicitly includes pause/resume in V2 adoption. The row also confines V1 to its original authenticated installation. The schema-only positive passes the real V2 selector and is rejected by V1. **DG integration dependency: none for this V2 selection.** No DG or DG-OWN unit, shared schema or registry row was changed or copied. Application remains its separately selected GRS-086/CV-366 graph with no Project cast; missing genuine app custody remains unavailable.

### Notes and shared sweep

- **N1 fixed as a phase-1 binding:** `Plans/event_authority_w3g/schema_resources.json:186` now requires offline discovery by actual canonical `$id` and filename retrieval URI, eager traversal of every selected schema/selector branch and recursively reached definition, and fail-closed handling of unresolved/ambiguous resources. The seed map is explicitly not a claimed transitive closure. Resolver implementation remains phase 2.
- **N2 fixed as a phase-1 binding:** the same companion explicitly resolves inherited `#/families/<family_id>/value_schema` notation by exact unique `family_id` in the registry array. Missing/duplicate IDs refuse; ordinary JSON Pointer lookup or array-position guessing is forbidden. The shared registry is unchanged.
- **Shared sweep unchanged:** reviewed NUMRULE/date-time/historical-recipe dispatch and GUARDTOOL adoption remain required before phase 2. No lane-local numeric cap, number serializer, timestamp parser or guard-proof machinery was authored.

### Whole-lane isolation inventory and re-grade

The table below is a static plan inventory, not a guard-removal experiment. `p1fix1/guard-inventory.json` records every guard's positive, one-defect negative, refusal and planned predicate-only cut. **Actual negatives flipped: NOT_RUN. Peer negatives staying rejected: NOT_RUN.** Both require phase-2 fixtures and the reviewed shared tool. An enforcement-site or refusal-code overlap never joins distinct predicates; genuine duplicates must be the same input field/predicate, tested site by site and then together.

| Exact family | Guards before → after | Current lease / write permission | C1 / C7 / C12 after |
|---|---:|---|---|
| `assistant_plan.build_started` | 33 → 88 | separate positive + one-defect negative each | ABSENT / PASS / PARTIAL |
| `assistant_plan.cancelled` | 33 → 82 | separate positive + one-defect negative each | ABSENT / PARTIAL / PARTIAL |
| `assistant_plan.completed` | 33 → 82 | separate positive + one-defect negative each | ABSENT / PASS / PARTIAL |
| `assistant_plan.created` | 34 → 82 | separate positive + one-defect negative each | ABSENT / PARTIAL / PARTIAL |
| `assistant_plan.exported` | 33 → 83 | separate positive + one-defect negative each | ABSENT / PARTIAL / PARTIAL |
| `assistant_plan.version_created` | 34 → 88 | separate positive + one-defect negative each | ABSENT / PARTIAL / PARTIAL |
| `assistant_plan.wizard_handoff_created` | 34 → 83 | separate positive + one-defect negative each | ABSENT / PARTIAL / PARTIAL |
| `external_research.budget_denied` | 33 → 87 | separate positive + one-defect negative each | ABSENT / PARTIAL / PARTIAL |
| `external_research.finding_classified` | 33 → 83 | separate positive + one-defect negative each | ABSENT / PARTIAL / PARTIAL |
| `external_research.job_terminal` | 33 → 81 | separate positive + one-defect negative each | ABSENT / PARTIAL / PARTIAL |
| `external_research.packet_delivered` | 33 → 82 | separate positive + one-defect negative each | ABSENT / PARTIAL / PARTIAL |
| `external_research.topic_started` | 33 → 86 | separate positive + one-defect negative each | ABSENT / PARTIAL / PARTIAL |
| `goal.paused` | 34 → 100 | separate positive + one-defect negative each | ABSENT / PARTIAL / PARTIAL |
| `goal.resumed` | 34 → 100 | separate positive + one-defect negative each | ABSENT / PARTIAL / PARTIAL |
| `notebook.checkpoint_committed` | 34 → 85 | separate positive + one-defect negative each | ABSENT / PARTIAL / PARTIAL |
| `notebook.checkpoint_failed` | 34 → 83 | separate positive + one-defect negative each | ABSENT / PARTIAL / PARTIAL |
| `notebook.entry_committed` | 34 → 83 | separate positive + one-defect negative each | ABSENT / PARTIAL / PARTIAL |
| `notebook.entry_superseded` | 34 → 82 | separate positive + one-defect negative each | ABSENT / PARTIAL / PARTIAL |
| `notebook.transition_state_changed` | 34 → 89 | separate positive + one-defect negative each | ABSENT / PASS / PARTIAL |

Every family was re-graded against the fixed owner/plan bytes. Author grades remain **ABSENT 19 / PASS 174 / PARTIAL 35**; C12 is PARTIAL for all nineteen and retention is PARTIAL for exactly sixteen. The review's two Goal C3 cells move CONFLICT → PASS and its two Goal C8 cells PARTIAL → PASS in this self-grade because the conflicting selector/custody graph is repaired. PASS remains normative phase-1 text, not admission or runtime evidence. All 228 evidence locations/quotes are re-anchored and source hashes refreshed in `W3G.self-grade.json`.

**Unchanged open questions:** all sixteen pending retention markers, reasons and exact questions are preserved. `goal.receipt.recorded` remains `UNRESOLVED_OWNER_EVIDENCE`, with the same exact owner question and no new contract, alias or exclusion. There are no newly stopped candidate rows and no new Jared choice. No IDs were minted in this fix; original IDs remain APR-1500..1506, ERS-1507..1511, GRS-1512..1513, WN-1514..1518, CV-1500..1518, SP-1500..1518 and ATS-1260..1263.

### Phase-1 fix checks and exit codes

Repository generators and contract suites ran one at a time. A brief static self-grade/question inventory overlapped the research suite once; it was repeated serially after that suite finished. Initial disk was 114 GB free; initial available memory was 10 GB. Every recorded check start passed the 6 GB floor; no memory pause was required. The fifteen ignored currentness files were copied and SHA-256 verified before index generation. Regenerated shards are confined to Goal's edited owner; all six plan-index artifacts were regenerated. The index top-level status is parsed as `pass`, not inferred from a nested result. No governance/admission/landing checks were run.

| Check | Exit | Result and retained output |
|---|---:|---|
| `assistant-existing` | 1 | Existing gaps_found; errors=0, 51 Browser candidates pending. No Browser admission changed. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/assistant-existing.log`; SHA-256 `5af2dc9e6c1784e638aca43ea944950ca008d3596deefef0ff1df5e8715e149e` |
| `grade-question-final` | 0 | All 228 evidence quotes and 10 source hashes match; exact retention and receipt questions unchanged. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/grade-question-final.log`; SHA-256 `78123340e3c7a9222d7115a72dfcdc61ba44f2c3532b63541eed352411face0d` |
| `index-generate` | 0 | Pass; all six artifacts regenerated. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/index-generate.log`; SHA-256 `01159dacbe8633b5d4ad00ab10eb4041325edde9b388b3682c919c7d7231e1e9` |
| `index-validate-final` | 0 | Top-level status pass; failures=[]. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/index-validate-final.log`; SHA-256 `9040493a2bd1fc664ac0acd1dabd735f466f9a3d1ccc0319ac1b1f62a7192eb8` |
| `index-validate` | 0 | Top-level status pass; failures=[]. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/index-validate.log`; SHA-256 `4f6c426cd81078debd217c75b923824ec4a008c5eb621bcd90a3f00eb1c200d1` |
| `notebook-existing` | 0 | Top-level pass; original suite preserved. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/notebook-existing.log`; SHA-256 `1e3f377760b0b7320ab9bb6a47536ec0c00ba9d0f19438f61aace2694935910d` |
| `research-existing` | 0 | Top-level pass; findings=0. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/research-existing.log`; SHA-256 `9e315376e2c190e8c42440c89cb858fb30f5a64a4edabaf8f97ecad378404c11` |
| `review-response-final` | 0 | Final 1629-guard static inventory passes. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/review-response-final.log`; SHA-256 `3c4f50b2e7bc0d709044a489305560c574bdfba9e1aca00ae1db41ca71be25dd` |
| `review-response` | 0 | Pass; full plan inventory, exact 16 pending retention cells, protected bytes and DG units unchanged. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/review-response.log`; SHA-256 `8a100a6d762d705cbb0a2040adf78edc1973d7f396cec426c73166d9307d33b9` |
| `schema-probes` | 0 | Pass; 33 selector positives, 633 schema-only negatives; real V2 positive/current manifest selection and historical V1 rejection. No native custody claim. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/schema-probes.log`; SHA-256 `fba214d23def67829eebed6c7eee19354a3187c4d57edeae8c44e124d64bbb1e` |
| `shards-check` | 0 | Pass; no failures. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/shards-check.log`; SHA-256 `fba1c36054a83d9c3416be7e4daee87e6c4b513f0a6d9855ec799ece79702957` |
| `shards-generate` | 0 | Pass; only Goal owner shards changed. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/shards-generate.log`; SHA-256 `4580172d0223709a6fb4d9b19629202b9fa567c072acac77a03bdc874e57c543` |
| `structure-final` | 0 | Pass on the intermediate 1607-guard plan; selected-source closure resolved. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/structure-final.log`; SHA-256 `25ef3049649a12f8736d3af5b429f1daf8db5d1a26801320f50204bed43da91b` |
| `structure-final2` | 0 | Pass on the final 1629-guard plan; 19 payload schemas and 105 eagerly resolved reachable ref pairs. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/structure-final2.log`; SHA-256 `0b167ca682ab0a2ff0f0c730cde20790122af72ea18ffa958f8ffb62abefa84a` |
| `structure` | 1 | Initial overbroad probe scanned unrelated definitions outside selected source closure and found inherited unused `body_application_v1`; corrected probe traverses each actual selected source and every recursively reached branch. No owner/schema was patched for this harness issue. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/structure.log`; SHA-256 `25900f2123c7c539130fc2b209a060d3a98282c3e8e438d2b4eff9a9c2620be6` |

The retained check scripts are static planning-data/schema probes and a serial command wrapper, not event oracles. The initial broad structural probe is retained with its nonzero exit for traceability; the selected-source closure rerun passes without changing any canonical source schema. No raw evidence or helper script is committed to the repository. Report, self-grade and oracle plan are copied to the W3G evidence directory; all round-specific outputs are in `p1fix1/`. The fix branch is pushed, then the literal-path sparse worktree is removed.

### Round evidence hashes

| Retained artifact | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/currentness-copy.json` | `daf80cdc1395935c791eed463d54ff4d0405f90ce97f39f12e10fbb0a547f8ac` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/guard-inventory.json` | `99d7515ebeb172f3c407a002a7b700545dc6568d0bdc0205e687a5a4815164d4` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/review-response.json` | `3c4f50b2e7bc0d709044a489305560c574bdfba9e1aca00ae1db41ca71be25dd` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/schema-probes.json` | `1a9e61226c4ba51f55466c79f7928cf28aeeeee20f25fffac0c635c93571d32e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3G/p1fix1/grade-question-check-final.json` | `78123340e3c7a9222d7115a72dfcdc61ba44f2c3532b63541eed352411face0d` |
