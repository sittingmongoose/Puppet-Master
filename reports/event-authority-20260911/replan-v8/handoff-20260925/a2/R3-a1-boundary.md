# R3: What A1 leaves to A2 (Replan v8, Step 8(b) Group A)

Reader R3. Read-only. Nothing in the repository was edited.

Refs used:
- **A1** = `origin/plans/replan-v8-a1-20260925` at `982f66083ccccff9c67c5570a8f1ca2c51bbb62d`.
- **main** = `origin/main` at `63cf2cb97f936c91dd7bb5c585d9a35d8409ed61`.

Paths without a prefix are repository paths. `WCSC/` = `Plans/workflow_combined_source_contracts/`. Owner-unit lines are physical lines of the appended YAML at A1. A1's unit headings are at: EP-125 `Executor_Protocol.md:8684`, EP-126 `:8800`, EP-127 `:8915`; GRS-086 `Goal_Runtime_System.md:7945`, GRS-087 `:8052`, GRS-088 `:8167`, GRS-089 `:8267`; CV-354 `Contracts_V0.md:23489`; SP-321 `storage-plan.md:27107`, SP-322 `:27264`; ATS-059 `Automated_Testing_System.md:5305`, ATS-060 `:5519`; BRS-031 `Backup_Restore_System.md:1771`.

"prop." marks a proposal. "Inference" marks a conclusion that no quoted text states.

---

## 0. Corrections to the task brief

**C-1. The status string the brief names is not in canon.** `NOT_THE_MANDATORY_RUN_HISTORY_PROJECTOR_UNREGISTERED_A2_SUCCESSOR_REQUIRED` does not occur at A1 (`git grep` over the whole tree finds nothing). It comes from the A1 design only (scratchpad `a1-scope/A1-canonical-draft-design.md:469`, P-06: "The consumer root is placed as source only, with status `NOT_THE_MANDATORY_RUN_HISTORY_PROJECTOR_UNREGISTERED_A2_SUCCESSOR_REQUIRED`"). What canon places instead:
- The consumer schema root has no status field. Its top-level keys are only `$schema`, `$id`, `$defs` and `$comment`. `$comment` at `WCSC/replan/schemas/goal-run-started-cancelled-replanned-consumer.v1.schema.json:2120` @A1 reads: "NEW disjoint full source draft; all predecessor definitions preserved. Adds exact replanned projection/consumer/checkpoint only; unsupported relevant families refuse."
- The checkpoint row carries `WCSC/physical-families.json:238` @A1: `"status": "A2_SUCCESSOR_REQUIRED_NOT_REGISTERED"`. The inverse record is `WCSC/canonical-inverse.json:4389` @A1 (`"after": "A2_SUCCESSOR_REQUIRED_NOT_REGISTERED"`, before `"PROPOSED_NOT_ADMITTED"`, class `P-06`).
- The prose equivalent is CV-354 at `Contracts_V0.md:23557-23559` @A1: "The Replan consumer root is source only, not the mandatory run-history projector and selected by no registry row; its adoption, like a certified v8 consumer, is separate required work (the consumer-adoption work A2)."

**C-2. The boundary file points to an external path, not the canon path.** `WCSC/external-consumer-adoption-boundary.json:5` @A1 reads `"path": "schemas/replan-consumer.v4.schema.json"`, which is the external package name. The canon file is `WCSC/replan/schemas/goal-run-started-cancelled-replanned-consumer.v1.schema.json`, and line 6 names that file's `$id`. `WCSC/protocol.md:116` and `WCSC/replan/protocol.md:123,233` @A1 also still say `replan-consumer.v4.schema.json`. Any A2 citation must use the canon path.

---

## 1. `external-consumer-adoption-boundary.json`, read in full (19 lines, @A1)

| Line | Verbatim |
|---|---|
| 2 | `"combined_native_profile": "pm.executor.workflow_source.all_writers.v8"` |
| 3 | `"status": "SEPARATE_EXTERNAL_CONSUMER_ADOPTION_REQUIRED_NOT_ADMITTED"` |
| 4-9 | `whole_replan_consumer_successor`: path `schemas/replan-consumer.v4.schema.json`; schema_id `https://puppetmaster.local/proposals/goal_run_started_cancelled_replanned_consumer.v1.schema.json`; original_whole_source `inputs/replan-v3/composition/authoring-roots/replan-consumer.schema.json`; original_sha256 `f225be4289b1e7e4c2eab71fd23794a609692b3bbdeae8f1e90069b040d50f22` |
| 10 | "The unchanged whole v3 clock-split payload remains selected from the exact original Replan prior-draft bank. No schema URI bump is made merely for consistency when its complete value grammar is unchanged." |
| 11 | "Preserved exact existing source and acceptance scope. It is not cast to combined v8 by matching common fields, Event type, URI alias or validation namespace." (the existing certified v7 consumer) |
| 13 | "A separate original certified consumer source successor must explicitly bind this complete native v8 profile, full original released certified coordinator source, same complete original payload/clock/family rules and actual fixed native registration." |
| 14 | "Replan whole consumer successor must be bound at genuine consumer/checkpoint birth to its exact original source publication, full retained current Event/index/checkpoint and new combined source roots." |
| 15 | "Started/cancelled combined-profile consumers require separate exact source-profile adoption of whole original source/clock/custody/checkpoint rules; the unchanged Event registry still selects existing original families." |
| 16 | "Projector/checkpoint/backfill/retention/consumer declarations and exact owner original registration are independent required adoption work. No registry row, native installation, runtime execution, schema instance or product Event admission occurs in this source-only package." |
| 18 | "All original historical schemas, original consumer bodies and original currentness/retention semantics remain untouched in isolated source banks." |

Lines 13-16 are the four `remaining_exact_adoption` items. They are the file's whole A2 list.

---

## 2. The complete list of A2 obligations

Each item gives its sources as file:line @ref with a short verbatim quote.

### A2-01. Certified v8 consumer (a new successor, never a cast of v7)
- `WCSC/external-consumer-adoption-boundary.json:13` @A1: "A separate original certified consumer source successor must explicitly bind this complete native v8 profile, full original released certified coordinator source, same complete original payload/clock/family rules and actual fixed native registration."
- GRS-088, `Goal_Runtime_System.md:8207-8208` @A1: "The certified v8 consumer is separate required work (the consumer-adoption work A2), and admission and projection of v8 certified Events stay unavailable here."
- GRS-088, `Goal_Runtime_System.md:8201-8203` @A1: "The goal_run.certified registry row, the GRS-085 projection, the SP-317 families and the v7 certified consumer, which requires all_writers.v7 with descriptor digest 0055de6c… do not admit or project the certified rows or Events of a v8 birth".
- The v7 pin: `Plans/goal_run_certified_consumer_contracts/installed-profile.json:87` @main: `"required_original_native_profile_digest": "0055de6c0e113173d2c4f1a1b2a3d9268681241b528ab6f24304fcfb4b163845"`.
- Profile membership: GRS-088, `Goal_Runtime_System.md:8187-8188` @A1: "profile membership comes only from the genuine birth descriptor of the run, never from the Event body."
- Negative test that A2 must keep: ATS-059 V8-CF-13, `Automated_Testing_System.md:5487-5489` @A1: "Reject a v8 birth cast into the v7 consumer or the SP-316 and SP-317 rows by matching fields, Event type, URI alias or validation namespace".
- Also in: CV-354 `Contracts_V0.md:23558` @A1 ("like a certified v8 consumer, is separate required work"); `WCSC/installed-profile.json:24` @A1 ("The certified v8, Replan and started/cancelled combined-profile consumers and the projector, checkpoint, backfill and retention declarations are A2's.").

### A2-02. Replan consumer successor, bound at genuine consumer/checkpoint birth
- `WCSC/external-consumer-adoption-boundary.json:14` @A1: "Replan whole consumer successor must be bound at genuine consumer/checkpoint birth to its exact original source publication, full retained current Event/index/checkpoint and new combined source roots."
- GRS-087, `Goal_Runtime_System.md:8101-8103` @A1: "The Replan consumer root is placed as source only and is not the mandatory run-history projector".
- GRS-087, `Goal_Runtime_System.md:8105-8107` @A1: "The Replan consumer, the started and cancelled combined-profile consumers and the projector, checkpoint, backfill and retention declarations are separate required work (A2)."
- CV-354, `Contracts_V0.md:23557-23559` @A1 (quoted in C-1).
- What the placed source requires of the projector: `WCSC/replan/protocol.md:233` @A1: "It processes the full SP-278 global prefix, including nonmatching source … Duplicate/conflicting/unsupported relevant source refuses a current projection … Commit projection and checkpoint frontier together in one actual projector transaction".

### A2-03. Started and cancelled combined-profile consumers
- `WCSC/external-consumer-adoption-boundary.json:15` @A1: "Started/cancelled combined-profile consumers require separate exact source-profile adoption of whole original source/clock/custody/checkpoint rules; the unchanged Event registry still selects existing original families."
- GRS-087 `Goal_Runtime_System.md:8106` @A1, SP-321 `storage-plan.md:27194-27195` @A1, and ATS-059 V8-CF-13 `Automated_Testing_System.md:5490-5491` @A1 all list "the started/cancelled combined-profile consumers" as separate required work (A2).
- `WCSC/protocol.md:116` @A1 (the same sentence is at `replan/`, `coordinator/`, `producer/` and `native-v8/protocol.md:116`): "Started/cancelled/Standard and Replan consumer, checkpoint, projector, backfill, source-retention and actual owner registration require their own exact source-profile adoption." **Note:** this sentence also lists **Standard**, which the owner units do not name as A2 work. See Q-6.

### A2-04. Projector, checkpoint, backfill and retention declarations, and exact owner registration
- `WCSC/external-consumer-adoption-boundary.json:16` @A1: "Projector/checkpoint/backfill/retention/consumer declarations and exact owner original registration are independent required adoption work."
- SP-321, `storage-plan.md:27189-27190` @A1: "No projection or checkpoint family is registered: the Replan projection checkpoint the source authors is not a registry row, owner.workflow.replan.project.v1 has no registered storage".
- The authored but unregistered checkpoint row, `WCSC/physical-families.json:237-245` @A1: family `goal_run_started_cancelled_replanned_checkpoint`, status `A2_SUCCESSOR_REQUIRED_NOT_REGISTERED`, key `goal_run_started_cancelled_replanned_checkpoint.v1:H(storage_instance_id):H(project_id):H(goal_id):H(goal_run_id)`, schema `…consumer.v1.schema.json#/$defs/ReplanCheckpoint`, retention `RP-PROJECTION-3GEN`, producer `owner.workflow.replan.project.v1`, `"immutable": false`.
- `WCSC/physical-families.json:393` @A1 and `WCSC/composition.json:2711` @A1: "goal_run_started_cancelled_replanned_checkpoint (P-06, A2)".
- `WCSC/README.md:29` @A1: "The per-run projection checkpoint is not registered here; A2 supplies the projection successor."
- Readiness negative that A2 must change deliberately: ATS-059 V8-CF-11, `Automated_Testing_System.md:5469` @A1 rejects "any registered projection or checkpoint row". **Inference:** once A2 registers a row, V8-CF-11 as worded fails unless A2 amends or scopes it.
- Backfill: A1 forbids it for its own families (BRS-031 at `Backup_Restore_System.md:1802` @A1: "No rekey, backfill, reconstruction from hashes or compact commitments … obtains success"). A backfill rule for projections is therefore A2's to declare. No A1 text states what that rule should be.

### A2-05. The projection admission that `owner.workflow.replan.release.v1` needs
- EP-126, `Executor_Protocol.md:8850-8852` @A1: "Release cannot be admitted in this installation: its projection admission needs the consumer-adoption work A2 and its exact Event read needs A3, owner.workflow.replan.project.v1 has no registered storage, and a completed Replan operation stays held."
- GRS-087, `Goal_Runtime_System.md:8104-8105` @A1: "Replan release is unavailable until the consumer-adoption work A2 supplies the projection admission, so no Replan operation can complete its publication and release before A2 and A3 land."
- Acceptance: GRS-087 `Goal_Runtime_System.md:8141` @A1: "Replan release and projection stay unavailable until A2". EP-126 `Executor_Protocol.md:8887-8888` @A1: "release stays unavailable until A2 and A3 supply its projection admission and exact Event read."
- SP-321 `storage-plan.md:27190-27192` @A1: release "whose input requires the projection admission and an exact current Event read, is unavailable until separate projection adoption and the goal_run.replanned Event contract supply them".
- `WCSC/composition.json:2730` @A1: `"replan": "Native-first original publication; release is unavailable until A2 supplies the projection admission."`
- The schema slot: `WCSC/replan/schemas/workflow-replan-source.v1.schema.json` @A1. `ReleaseInput` (line 4406) requires `"projection"`, which is `ReplanProjectionAdmission` (line 203). That type requires `original_projection` (a `ReplanProjectResult` of the consumer root, `$ref` at line 213), `actual_current_source` and `exact_event_read`.

### A2-06. Mandatory run-history projection successor (GRS-085 and SP-317)
- GRS-087, `Goal_Runtime_System.md:8102-8103` @A1: "that projection (GRS-085, SP-317) does not admit v8 births and still halts on same-run replanned."
- SP-321 `storage-plan.md:27193` @A1, BRS-031 `Backup_Restore_System.md:1836` @A1 and ATS-059 `Automated_Testing_System.md:5492` @A1 say the same thing.
- The halt rule A2 must succeed: GRS-085, `Goal_Runtime_System.md:7885-7886` @main: "unsupported same-run replanned/blocked/stopped profiles, conflicting lifecycle or mismatched scope halt before that row; they do not silently advance checkpoint." A1 pins this as `WCSC/source-citations.json:389` @A1 (CC-12, "GRS-085 halts on same-run replanned (P-06, A2)").
- The current dataset: SP-317, `storage-plan.md:26622` @main: "exact goal_run_projection.v5@<generation_id> dataset".
- One successor chain: `reports/event-authority-20260911/replan-v8/a1/author-decisions-20260925.md:15` @A1, O-15: "Replan release stays unavailable until A2, and A2 and A3 agree one `goal_run_projection` successor chain". The A1 design, `a1-scope/A1-canonical-draft-design.md:469`, adds: "A2 authors a GRS-085/SP-317 successor pair … so that only one branch claims `goal_run_projection.v6`". prop. (from the A3-stopped design): A2 takes v6 and A3-stopped takes v7.

### A2-07. Storage-owner ruling on `source_token_at_birth` and `generic_token` before the checkpoint is registered
- SP-321, `storage-plan.md:27160-27164` @A1: "ExactCurrentEventRead.read_token … and GenericSnapshot.token and ReplanProjectResult.generic_token in the placed consumer root, are whole tokens of one live read and are never stored. The consumer's source_token_at_birth and generic_token belong to its unregistered projection checkpoint and are left to that checkpoint's adoption, with a Storage-owner ruling on their names under section 2.3.1; that question goes to the Storage owner before the consumer-adoption work A2 registers the checkpoint successor."
- The A1 report, `reports/event-authority-20260911/replan-v8/A1-canonical-placement-20260925.md:189` @A1 (U3-Q7): "Section 2.3.1's reading of `DurableGenericToken` stored under `source_token_at_birth` / `generic_token` (the unregistered `ReplanCheckpoint`) | Storage owner, before A2 registers the checkpoint successor".
- Where the tokens sit in the consumer root @A1: `ReplanGeneration.source_token_at_birth` (line 1914) → `#/$defs/DurableGenericToken` (line 178, nine fields, no `redb_snapshot_id`). It is reached from the stored `ReplanCheckpoint.generations` (line 1994). `ReplanProjectResult.generic_token` (line 2114) → `…/event_record_index_checkpoint/1.0.0/schema.json#/$defs/read_token`, the whole live token. `ReplanProjectResult` also holds `checkpoint` (line 2092).
- The rule A2 must meet: `Plans/storage-plan.md:519` @main: a field "named `read_token` or ending in `_read_token` is a read selector … only when its whole schema … is exactly … `read_token` or its nine-field durable projection … Any other schema under such a name, or either schema under another name, remains a secret-material failure." DL-076 is at `Plans/Decision_Log.md:1463` @main ("stored read tokens without the live snapshot id").
- **Inference:** `source_token_at_birth` does not end in `_read_token`. As authored, a registered `ReplanCheckpoint` would therefore fail the readiness secret-material rule unless one of two things happens: the Storage owner rules otherwise, or A2 renames the field (for example `source_read_token_at_birth`, prop.). `generic_token` holds the ten-field live token. It must never be stored (SP-321, above), so it must never become a field of a stored wrapper.

### A2-08. Backup of the projection and checkpoint (BRS successor)
- BRS-031, `Backup_Restore_System.md:1834-1836` @A1: "No projection or checkpoint family is registered for v8 births, so no optional derived generation is backed up here: the Replan projection checkpoint the source authors is not a registry row and its backup belongs to its separate adoption".
- BRS-031 acceptance, `Backup_Restore_System.md:1876` @A1: "v8 certified values and any projection or checkpoint stay outside this unit's backup until separately admitted".

### A2-09. Retention declarations
- The A2 list names these everywhere: GRS-087 `:8106-8107`, SP-321 `:27194-27195`, ATS-059 `:5491`, `installed-profile.json:24` and boundary `:16`, all @A1.
- The authored value is `RP-PROJECTION-3GEN` (`WCSC/physical-families.json:242` @A1). That policy exists on main: `Plans/storage_value_registry.json:175` @main, with `"max_cardinality": 3` and `"ttl_seconds": 604800`.
- The source rule: `WCSC/replan/protocol.md:231` @A1: "Current/staged/retired projections together count toward three and copied Event data stays source-bounded. No reference or checkpoint automatically creates a hold or extends an original lifetime."
- Retention assignment is Jared's under DL-045 (A1 report `:74` @A1 cites DL-045 for O-13). **Inference:** an A2 retention choice needs the same confirmation.

---

## 3. A1 methods that stay unavailable until A2, and what A2 must supply

Every Replan method is `"status": "SOURCE_SPECIFICATION_NOT_INSTALLED"` in `WCSC/replan/methods.json` @A1, and the file's own status is `AUTHORED_COMBINED_SOURCE_NOT_INSTALLED` (line 2). methods.json carries no per-method "A2" marker. The unavailability comes from the owner prose and the schemas.

| # | Method or route | Why A1 leaves it unavailable (quote) | What A2 must supply | Still needs A3 or another owner |
|---|---|---|---|---|
| M1 | `owner.workflow.replan.project.v1` (`replan/methods.json:538`; owner "actual per-run Storage projector"; input `ReplanProjectInput`, output `ReplanProjectResult`; phases `replan:observed`, `idle:original_replan_release`, lines 563-566) | "owner.workflow.replan.project.v1 has no registered storage" (GRS-087 `:8103-8104`; EP-126 `:8851`; SP-321 `:27190`; ATS-059 `:5428-5429`) | A registered checkpoint family, a projection-row family if one is needed (Q-2), an owner unit that makes project.v1 the admitted projector for v8 births, and the token ruling of A2-07 | CV-354 `:23512-23514`: the argument schemas of `…{…, release, project}.v1` "reach this frozen payload reference and cannot be compiled or validated in canon until A3's payload successor replaces it". `ReplannedProjection.original_event` is `WholeOriginalEvent` (consumer root line 1770 ff.). |
| M2 | `owner.workflow.replan.release.v1` (`replan/methods.json:503`; phase `replan:observed` only) | EP-126 `:8850-8852` (quoted in A2-05) | `ReleaseInput.projection` = `ReplanProjectionAdmission.original_projection`, an authentic `ReplanProjectResult` from an admitted projector | `exact_event_read` (`ExactCurrentEventRead`) needs A3's Event contract (EP-126 `:8851`: "its exact Event read needs A3") |
| M3 | Slot return to idle after a Replan (the `replan:observed` → idle transition) | EP-126 `Executor_Protocol.md:8845`: release "issues the compact release receipt and returns the slot to idle in one native transaction"; BRS-031 `:1810`: "a restored held Replan operation stays held" | Nothing beyond M2 | A3, as M2 |
| M4 | The `replan_applied` wake | EP-126 `:8846-8847`: "at most one replan_applied wake per run and generation follows through its own owner" (after release) | Nothing beyond M2 | A3, as M2 |
| M5 | `owner.workflow.replan.read_original.v1` "with its required projection" (ATS-059 V8-CF-07, `Automated_Testing_System.md:5416`) | `replan/protocol.md:195` @A1: "Required full projection uses the same authentic global SP-278 prefix and its independent source fences." | An admitted projection whose frontier read_original can check. **Note:** `ReadOriginalInput` and `OriginalPublicationResult` (source root line 1396) hold no projection field. The projection requirement is prose-only here and becomes structural only at `ReleaseInput`. | `original_event_read` = `ExactCurrentEventRead`: A3 |
| M6 | Stop obligation READBACK-RELEASED-IDLE-REPLAN (ATS-060, `Automated_Testing_System.md:5609-5620`) | ":5619-5620": "Its precondition, a genuine Replan release, is itself unavailable until the consumer-adoption work A2 supplies the projection admission and A3 the Event admission." EP-126/127 `Executor_Protocol.md:8971`: "OriginalCurrentRelease is the released Replan control with its release receipt" | M2 | A3; plus the unstated revoked → idle transition (EP-127 `:8976-8978`, ATS-060 `Automated_Testing_System.md:5538-5539`: "presuppose a later release to idle whose transition from revoked is not stated in the source") |
| M7 | Certified v8 Event admission and projection | GRS-088 `:8207-8208` (quoted in A2-01) | The certified v8 consumer (A2-01) and its place in the one projection chain (A2-06) | GRS-088 `:8204-8206`: "their Storage admission for v8 births is unavailable until a separate Storage revision". The A1 report `:179` lists "v8 certified Storage admission" as open apart from A2. |
| M8 | Stop obligation READBACK-RELEASED-IDLE-CERTIFIED (ATS-060, `:5621-5632`) | ":5631-5632": "Its precondition, a genuine certified release for a v8 birth, needs Storage admission of v8 certified values, which is unavailable until a separate Storage revision." | Not A2 by A1's text | The separate Storage revision |
| M9 | Admission of v8 births to the mandatory run-history projection | GRS-087 `:8102-8103`; ATS-059 V8-CF-13 `:5489` rejects "a v8 birth admitted to the mandatory run-history projection" | The GRS-085/SP-317 successor pair (A2-06), with an explicit amendment of the V8-CF-13 negative | Coordinate with A3 on the version number |
| M10 | The graph-patch governance projection | GRS-087 `:8085-8087`: "its projection target is not registered here and stays unavailable"; SP-321 `storage-plan.md:27187-27189` (U3-Q10) | **Not A2 by A1's text.** The A1 report `:196` gives U3-Q10 to "Storage and Contracts owners" | Storage and Contracts owners |

**Inference, with the chain of reasoning stated.** EP-125 `Executor_Protocol.md:8709-8711` @A1 says `combined.claim.v1` "claims exactly one Replan or certified operation, queues or refuses a conflicting one, never creates a second live slot". Release is the only authored route from `replan:observed` back to idle (EP-126 `:8845-8846`; `WCSC/replan/methods.json` gives release the single phase `replan:observed`). It follows that, until A2 and A3 land, a v8 run whose first Replan completes keeps its slot held. No later Replan and no certified publication can be claimed on that run. No A1 text states this consequence in these words.

---

## 4. Constraints on how A2 may be built (from A1 text)

**K-1. The files A2 must supersede are v8 descriptor members.** The all_writers.v8 descriptor binds these by path and SHA-256 (`WCSC/installed-profile.json` @A1):
- `WCSC/external-consumer-adoption-boundary.json` (line 578, `1372f351…`);
- the Replan consumer root (line 693, `7602020e969e3b6c2c7b3c3c2af9fafbad592a6999b50cc08cd7a5caf62fc9d3`);
- `Plans/goal_run_started_consumer_contracts/consumer.schema.json` (line 398, `626cfe1a…`);
- `Plans/goal_run_cancelled_consumer_contracts/cancelled-causal-arguments.schema.json` (line 388);
- `Plans/goal_run_cancelled_consumer_schema_resources.json` (line 393, `b616a2b1…`);
- `Plans/event_record_index_checkpoint.schema.json` (line 53, `f15e781e…`).

The A1 report `:219` @A1 sets the rule for such a member: "Any reseal of it makes that member pin stale and changes the v8 digest `7b22c1f4…` … It must therefore go with a successor v8 edition". **Inference:** A2 must add new successor files beside these members and must not edit any of them in place. An in-place edit would force a new v8 edition.

**K-2. A2 must not touch A1's rows.**
- SP-321 `storage-plan.md:27164` @A1: "All 294 previous Storage rows remain unchanged."
- A1 appends at `/families/294-327`. A2 appends after them and names its own census re-pin (A1 report `:110`, `:114-126`).

**K-3. Frozen payload literal.** CV-354 `Contracts_V0.md:23509-23514` @A1 says `goal_run_replanned_clock_split_20260921.v4` and `pm.goal_runtime_event.goal_run_replanned.schema.v3.draft.20260921` "stay frozen external literals owned by the Event contract work A3". The project and release argument schemas "cannot be compiled or validated in canon until A3's payload successor replaces it". A2 cannot finish schema validation of `ReplannedProjection` without A3.

**K-4. DL-076.**
- EP-126 `Executor_Protocol.md:8847-8850` @A1: "The stored receipt records its release read as the nine-field durable read token under source_read_token (DL-076)".
- CV-354 `Contracts_V0.md:23545-23547` @A1: "The Replan source root defines its own DurableGenericToken, equal to the Replan consumer root's … so no stored Replan value holds a read token with redb_snapshot_id".
- Any A2 stored wrapper follows the same rule (A2-07).

**K-5. The placed Replan consumer has no certified branch.**
- The consumer root contains no occurrence of `certified` (grep count 0 @A1).
- Its projection union is `ReplanCombinedProjection` = oneOf `CombinedProjection` (started/cancelled) or `ReplannedProjection` (line 1855).
- The mandatory GRS-085 projection is started/cancelled/**certified** (`Goal_Runtime_System.md:7875` @main).
- **Inference:** neither placed projector covers a v8 run that has both certified and replanned Events. A2 must decide whether the v8 run-history projector is one successor that covers started, cancelled, certified v8 and replanned (prop.), or something else. A1 text does not decide this.

**K-6. The placed consumer authors a checkpoint but no stored projection-row wrapper for replanned rows.**
- Its only stored wrappers are `StorageProjection` (`pm.goal_run_projection.started.v3`, line 544) and `CombinedStorageProjection` (`…started_cancelled.v4`, line 1392), both predecessors, plus `ReplanCheckpoint` (`pm.goal_run_started_cancelled_replanned_checkpoint.v1`, line 2008).
- SP-317 @main registers two families (projection and checkpoint, `storage-plan.md:26620-26621` @main: "Register exactly two separate derived families: goal_run_started_cancelled_certified_projection and goal_run_started_cancelled_certified_checkpoint").
- **Inference:** A2 must author the replanned projection-row stored wrapper and its family, or state why none is needed.

**K-7. Header convention.**
- `ReplanCheckpoint.schema_id` is `pm.goal_run_started_cancelled_replanned_checkpoint.v1` (line 2008).
- A1's own families use the header `pm.storage_value.<family_id>.v1` (SP-321 `storage-plan.md:27125` @A1).
- The SP-317 precedent keeps consumer-specific ids. A2 must choose one convention and state it. prop.: follow SP-317.

**K-8. `status_at_original_event` already names `stopped` and `blocked`.**
- `ReplannedProjection.status_at_original_event` enum: `running, repairing, blocked, stopped, cancelled, verifying` (consumer root line 1831).
- **Inference:** the replanned row can record a stopped or blocked prior status even though no stopped or blocked Event exists yet. That is an A2/A3 interface point.

**K-9. Landing hold that can change what A2 binds to.**
- STATUS.md `:62` @A1: "Do not land A1 until Jared answers card C-4 … Option 1 reserves the stop writer in v8: A1 is amended before it lands … That changes the v8 descriptor digest".
- A2 must bind to the v8 digest as landed. It is `7b22c1f4…` only under option 2.

---

## 5. Open questions for the A2 design

- **Q-1 (Storage owner, before A2 registers).** U3-Q7 / SP-321 `:27161-27164`: the `source_token_at_birth` and `generic_token` names under storage-plan.md 519 (A2-07).
- **Q-2.** Does A2 register one checkpoint family or a projection and checkpoint pair (K-6)? Does the per-run Replan checkpoint merge into the goal_run_projection successor or stay separate? A1 text leaves both open.
- **Q-3.** Is certified v8 folded into the same successor projector (K-5)? Its Storage admission is a "separate Storage revision" outside A2 by A1's text (GRS-088 `:8205`; A1 report `:179`). Does A2 wait for it, carry it, or leave certified v8 unavailable?
- **Q-4 (with A3).** The goal_run_projection.vN numbering: v6 for A2, then v7 for A3-stopped (prop., per the A3-stopped design). The blocked version is still to be agreed.
- **Q-5 (Jared, DL-045).** Confirmation of the retention for the new family or families (RP-PROJECTION-3GEN as authored).
- **Q-6.** `WCSC/protocol.md:116` @A1 lists "Standard" consumer adoption. No owner unit gives it to A2. Is it in A2's scope?
- **Q-7.** The A1 report `:190` gives Q-U4-05 (released-idle readback reachability) and Q-U4-08 (a revoked certified slot holding a durable Event) to "Executor and Goal owners; A2 and A3". A2 should say which part is its own.

## 6. Other A1 sentences that name A2 (for completeness)

- A1 report `:14`: "No Event registry row, payload successor, consumer, projector or checkpoint."
- A1 report `:16`: "D06, native execution and instances, the six other positive-route discharges, A2 and A3 stay open".
- A1 report `:110`: "The checkpoint `goal_run_started_cancelled_replanned_checkpoint` is not registered (P-06, O-15: A2 authors the successor)."
- A1 report `:177` (section 8 row "Consumer adoption (A2)"): "**Open.**" It quotes GRS-087 and GRS-088 and "Replan release is unavailable until the consumer-adoption work A2 supplies the projection admission".
- STATUS.md `:70` @A1: "U3-Q7 (Storage owner, before A2)". `:117`: "After A1: A2 (consumer adoption) and A3".
- `reports/…/a1/A1-source-checks.json:286` @A1: "A2 consumers, projector, checkpoint, backfill and retention declarations".
- `WCSC/installed-profile.json:1003` @A1: "the per-run projection checkpoint is not registered (A2)".
- `WCSC/rename-map.json:824` @A1: "leave A2/A3-owned draft identities as frozen external literals".
- `Plans/00-plans-index.md:6018` @A1: "No Event registry row, payload successor, consumer, projector or checkpoint is supplied: … the mandatory run-history projection does not admit v8 births, Replan release … remain unavailable".
- Every one of the 13 units repeats: "It supplies no Event registry row, payload successor, consumer, projector or checkpoint." (for example GRS-086 `Goal_Runtime_System.md:7995`, EP-125 `Executor_Protocol.md:8741`).
- EP-125, EP-127, GRS-086, GRS-089, SP-322 and ATS-060 contain no sentence naming A2 beyond that repeated line. The exceptions are ATS-060 `:5619-5620` (M6) and EP-127's released-idle readback (M6).
