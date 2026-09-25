# R2: the mandatory run-history projection (GRS-085 / SP-317) and the A2 successor

Reader R2 for A2 (Replan v8, Step 8(b) Group A). Read only. Nothing in the repository was edited.

Refs used:
- `main` = `origin/main` @ `63cf2cb97f93`.
- `A1` = `origin/plans/replan-v8-a1-20260925` @ `982f66083ccc` (not landed).
- `A3S` = local note `a3-stopped-scope/A3-stopped-design.md` (not canon).
- `U3` = local note `a1-scope/U3-replan-storage.md` (not canon).
- `A1D` = local note `a1-scope/A1-canonical-draft-design.md` (not canon).
- `cards` = local note `a3-stopped-scope/cards-C2-C4-20260925.md` (answer record, not canon).

Every line marked **prop.** is a proposal. Everything else is quoted from a file.

---

## 1. What the projection is today

### 1.1 The v-chain on main

The per-run projection role is SP-214 / D-R20 `goal_run_projection`. It has had one new versioned member per lifecycle adoption. No member was ever edited in place.

| Dataset | Owner units | Families (registry) | Generation prefix | Admits (same run) |
|---|---|---|---|---|
| `goal_run_projection.v1` | SP-214 | `/families/32` `goal_projection_families`, `deferred_not_build_blocking` | none | aggregate inventory only |
| `goal_run_projection.v3` | GRS-079, SP-311, BRS-027 | `/families/278-279` | `grsg_` | started v3 |
| `goal_run_projection.v4` | GRS-080, SP-312, BRS-028 | `/families/280-281` | `grscg_` | started v3, positive-D06 cancelled v3 |
| `goal_run_projection.v5` | GRS-085, SP-317, BRS-029 | `/families/292-293` | `grsccg_` | started, cancelled, certified v3 (certified only for all_writers.v7) |

Evidence:
- v1: `storage-plan.md:15110` @main: "goal_run_projection.v1:{project_id}:{goal_run_id}". `storage-plan.md:15169` @main: "The goal_run_projection.v1 inventory above is not its reducer or checkpoint."
- There is no `goal_run_projection.v2` string anywhere in `Plans` on main (git grep). The numbering jumps from v1 to v3.
- v3: `storage-plan.md:25976` @main: "`dataset_name = "goal_run_projection.v3@" + generation_id`".
- v4: `storage-plan.md:26122` @main: "Row key is `goal_run_projection.v4:K(project_id):K(goal_run_id)`".
- v5: `storage-plan.md:26621-26622` @main (SP-317): "exact goal_run_projection.v5@<generation_id> dataset".
- No branch on origin claims `goal_run_projection.v6` or higher (git grep over every `origin/*` ref, `Plans` and `reports`). A1 adds none. **So the next free number is truly v6.**

### 1.2 v5 identities (the current head)

- Families: `storage_value_registry.json:112623` @main `"family_id": "goal_run_started_cancelled_certified_projection"`; `:112794` @main `"family_id": "goal_run_started_cancelled_certified_checkpoint"`.
- Projection schema: `pm.goal_run_projection.started_cancelled_certified.v5`, `5.0.0`. Checkpoint schema: `pm.goal_run_started_cancelled_certified_checkpoint.v1`, `1.0.0` (same rows).
- Keys: `goal_run_certified_consumer_contracts/protocol.md:65` @main: "key `goal_run_started_cancelled_certified_checkpoint.v1:K(storage_instance_id):K(project_id):K(goal_id):K(goal_run_id)`. The row key is `goal_run_projection.v5:K(project_id):K(goal_run_id)`".
- Codec: `physical-retention-install.json:15` @main: "unchanged CV339 canonical MessagePack whole value".
- Anchor: `protocol.md:69` @main: "`anchor_sha256 = SHA256(encode(["goal_run_started_cancelled_certified_anchor.v1", storage_instance_id, scope, "goal_run_started_cancelled_certified_projector.v1", profile_digest, seed_hex, source_token_at_birth]))`. Generation id is `grsccg_` + anchor_sha256."
- Consumer profile digest: `installed-profile-digest.txt:1` @main `fca86d74330e…`.
- Methods: `goal_run_certified_consumer_contracts/methods.json` @main, twelve methods. Started and cancelled current reads are split by birth profile: `:683` "read_current_started.original_profile.v1", `:817` "read_current_started.native_v7.v1", `:963` "read_current_cancelled.original_profile.v1", `:1097` "read_current_cancelled.native_v7.v1". Writer `:1403` "owner.storage.goal_run.started_cancelled_certified.publish.v1".
- Birth scope: `Goal_Runtime_System.md:7893-7895` @main (GRS-085): "only for a genuine fresh pm.executor.workflow_source.all_writers.v7 birth and pm.goal_run_certified.producer_source.v2 prepare.v2 binding". `:7896` "no existing birth is enrolled or cast".

### 1.3 Halting rules

All three members halt on same-run stopped, blocked and replanned. None treats them as no-ops.
- v3: `storage-plan.md:25984` @main: "Replanned, blocked, certified, cancelled and stopped GoalRun events in this run are `UNSUPPORTED_RELEVANT_EVENT`: stop immediately before that row."
- v4: `storage-plan.md:26136` @main: "Replanned, blocked, certified, stopped, every other same-run GoalRun event, and unknown relevant schema are UNSUPPORTED_RELEVANT_EVENT and halt immediately before the row. They are never no-ops."
- v5: `Goal_Runtime_System.md:7885-7886` @main: "unsupported same-run replanned/blocked/stopped profiles, conflicting lifecycle or mismatched scope halt before that row; they do not silently advance checkpoint." The same text is in both registry rows' `replay_behavior` (`storage_value_registry.json:112652`, `:112828` @main).
- v5 also refuses casting: `protocol.md:53` @main: "Same-run replanned, blocked, stopped, any other GoalRun transition, unknown family or incompatible profile halts before its row. No v2 sibling is cast or skipped."
- v5 terminal exclusion: `protocol.md:59` @main: "Certification does not follow cancellation, and cancellation does not follow certification under this bounded route."
- Held certified: `protocol.md:33` @main: "An armed, Event-only, committed-but-unreleased, uncertain, missing or fabricated release has no RetainedCertifiedNative success."

### 1.4 Checkpoint, frontier and tokens

- Frontier: `protocol.md:71` @main: "processed.generic_token records the actual complete source frontier for that operation; it cannot assert coverage beyond processed.through_sequence_id."
- Birth token: `protocol.md:69` @main: "The immutable birth token is the complete durable nine-field SP278 token; its tenth real redb snapshot id is a live fence, never durable or fabricated."
- Stored token fields: `goal_run_certified_consumer_contracts/schemas/consumer.v1.schema.json` @main: `:496` `"DurableGenericToken"`, `:633` `"generic_token"` (in `ProcessedPrefix`), `:733` `"source_token_at_birth"` (in `Generation`), `:710` generation pattern `"^grsccg_[0-9a-f]{64}$"`.
- Root CAS fields: `/families/293` requires `root_revision` and `last_transaction_id` (registry row, `required_fields`).
- Publication: `protocol.md:79` @main: "Complete row and complete checkpoint/frontier/lifecycle changes commit atomically".

### 1.5 Backfill (rebuild) and retention

- Backfill is a staged rebuild from an empty generation. `protocol.md:81` @main: "Stage allocates a legal free generation slot, creates a fresh empty isolated dataset and immutable birth anchor without replacing current selection." `protocol.md:83` @main: "never copy a prior derived row as original source or edit an immutable anchor."
- No copy from older members: `storage-plan.md:26627` @main (SP-317): "Never copy an old checkpoint or reinterpret old row bytes."
- Registry `migration` of 292/293 (`storage_value_registry.json:112653` @main): "preserve every prior started-only/started-cancelled profile, key, schema, method and checkpoint."
- Retention: `storage-plan.md:26627-26629` @main: "Exact RP-PROJECTION-3GEN@1.0.0 means no current TTL, maximum three staged/current/retired generations together, original retirement plus 604800 seconds".
- Source coupling: `storage-plan.md:26630-26633` @main: "Start retains RP-RUNTIME-365D (31536000 seconds from run completion), cancelled/certified authority retains RP-AUTHORITY-INDEFINITE ... An indefinite certified record or held generation cannot extend expired Start".
- Restore: both rows `restore_disposition` source refs `Plans/Backup_Restore_System.md#BRS-029` and `#SP-317` (registry @main). BRS-029 header `Backup_Restore_System.md:1701` @main.
- Recovery sources: `/families/293` `recovery_disposition.source_family_ids` has 64 entries (counted @main).
- Routing: `storage-plan.md:15166-15169` @main (SP-214 paragraph): "GRS-085 governs the mandatory started/cancelled/certified per-Workflow-run prefix projection that carries the durable GoalRun projection role of this unit (with D-R20) for that family."

---

## 2. What A1 leaves for A2

- A1 GRS-087 (`Goal_Runtime_System.md:8102-8107` @A1): "that projection (GRS-085, SP-317) does not admit v8 births and still halts on same-run replanned. owner.workflow.replan.project.v1 has no registered storage, and Replan release is unavailable until the consumer-adoption work A2 supplies the projection admission, so no Replan operation can complete its publication and release before A2 and A3 land."
- A1 GRS-087 acceptance (`:8141-8142` @A1): "Replan release and projection stay unavailable until A2, and authentic append of the replanned Event stays unavailable until A3."
- A1 GRS-088 (`:8201-8208` @A1): "The goal_run.certified registry row, the GRS-085 projection, the SP-317 families and the v7 certified consumer ... do not admit or project the certified rows or Events of a v8 birth ... their Storage admission for v8 births is unavailable until a separate Storage revision".
- A1 SP-321 (`storage-plan.md:27189-27193` @A1): "No projection or checkpoint family is registered ... owner.workflow.replan.release.v1, whose input requires the projection admission and an exact current Event read, is unavailable until separate projection adoption and the goal_run.replanned Event contract supply them, so a completed Replan operation stays held."
- A1 EP-127 (`Executor_Protocol.md:8985` @A1): "The limited operation appends no Event and adds no goal_run.stopped, goal_run.blocked or goal_run.cancelled writer."
- A1 EP-127 / GRS-089 (`Goal_Runtime_System.md:8302` @A1): "full cancellation and D06 are unavailable for v8 births."
- A1 v8 descriptor (`workflow_combined_source_contracts/installed-profile.json:24` @A1): "consumer": "None admitted. The certified v8, Replan and started/cancelled combined-profile consumers and the projector, checkpoint, backfill and retention declarations are A2's."
- Row #23 (`workflow_combined_source_contracts/physical-families.json:237-243` @A1): family `goal_run_started_cancelled_replanned_checkpoint`, status `A2_SUCCESSOR_REQUIRED_NOT_REGISTERED`, key `…checkpoint.v1:H(storage_instance_id):H(project_id):H(goal_id):H(goal_run_id)`, codec `pm.workflow.activation_source_json.v1`, producer `owner.workflow.replan.project.v1`.

### 2.1 Finding F-1: the v8 Replan release is pinned to the forked projector's types

This is the fact that most constrains A2. It is not stated in A1's prose.

- The v8 descriptor digest covers the Replan consumer and source schemas. `installed-profile.json:693` @A1 lists `replan/schemas/goal-run-started-cancelled-replanned-consumer.v1.schema.json` (sha256 `7602020e…`). `:698` lists `replan/schemas/workflow-replan-source.v1.schema.json` (sha256 `384bdf44…`). `:623` lists `physical-families.json`. `:678` lists `replan/methods.json`.
- Birth binds the digest. `installed-profile.json:2` @A1: "installed_contract_digest and the combined Enrollment.installed_descriptor_sha256 equal SHA-256 of this entire sorted-key compact UTF-8 JSON preimage". I recomputed it: `7b22c1f4…`, equal to `installed-profile-digest.txt` @A1.
- Release input: `workflow-replan-source.v1.schema.json` @A1 `$defs/ReleaseInput` (line 4406) requires `projection`, typed `ReplanProjectionAdmission` (line 203). That requires `original_projection`, which is `$ref` to `goal_run_started_cancelled_replanned_consumer.v1.schema.json#/$defs/ReplanProjectResult` (line 212-213).
- `ReplanProjectResult` (consumer schema line 2092 @A1) requires `checkpoint`: `ReplanCheckpoint` (line 1994). Its generations use profile const `goal_run_started_cancelled_replanned_projector.v1` (line 1909) and ids `^grscrg_[0-9a-f]{64}$` (line 1977). `ReplanCheckpoint.required` has no `root_revision` or `last_transaction_id` (checked).
- The projection is `oneOf [CombinedProjection, ReplannedProjection]` (line 1855). The word "certified" occurs 0 times in the file (grep -c).
- **Consequence.** A v8 release can only consume the output of `owner.workflow.replan.project.v1` in exactly this forked shape. A linear chain successor with v5 conventions (K keys, MessagePack, root CAS, certified branch) cannot produce a value that validates as `ReplanProjectResult`. Changing the type changes a pinned member and so the v8 digest. With C-4 option 2, A1 lands unchanged (`cards:119`: "Approved, option 2 (wait for v9 ...)"), so the v8 digest `7b22c1f4…` is now final.

---

## 3. "Extend GRS-085": successor or in-place?

Every source that states a reading reads it as a new successor. None reads it as an in-place edit. DL-080 itself is silent on the form.

- DL-080 (`Decision_Log.md:1633` @main): "Each contract names the family's writer ... and extends the mandatory run-history projection (GRS-085) to its rows." The unit (`:6657` @main): "each with a named writer and its rows carried by the mandatory GRS-085 run-history projection." Neither says successor or revision.
- Remaining-source-work plan (`reports/event-authority-20260911/step-08-remaining-source-work-plan-20260924.md:118` @main): A2 delivers "a new replanned consumer; a GRS-085 successor; projection families". **Successor.**
- A0 review evidence (packages repo, `goal-replan-v8-canonical-draft-independent-review-20260925/v1/evidence/RC-storage/A0.md:136`): "Merging into a GRS-085/SP-317 successor means revising or succeeding both SP-317 registry rows". **Leaves both open.**
- U3 §4.2-4.4: option "A-succ, the form canon's precedent favours: a new successor pair"; "A-inplace ... (disfavoured). ... It contradicts SP-317's own migration rule". **Successor.**
- A1D P-06 (line 469): "A2 authors a GRS-085/SP-317 successor pair". **Successor.**
- A3S §5 (line 283 onward): "met by a new versioned successor member ... not by an in-place edit." It asks the owner to confirm (T-12, O-S4-01). **Successor, unconfirmed.**
- A1 GRS-088 (`Goal_Runtime_System.md:8199-8200` @A1): "EP-124, GRS-084, GRS-085, CV-352, SP-316, SP-317, ATS-057 and BRS-029 keep their all_writers.v7 and producer_source.v2 scope unchanged." A1 therefore rules out widening GRS-085 in place for v8.
- Canon precedent: v3 → v4 → v5 each added a new pair and left the old rows unchanged (`/families/280` `migration` @main: "No in-place v3-to-v4 conversion, no old checkpoint copying or automatic cutover").

**prop. reading for A2:** successor. GRS-085, SP-317, BRS-029 and `/families/292-293` stay byte-unchanged. The owner confirmation (A3S T-12) can be recorded once, in A2's GRS unit, and A3 cites it.

---

## 4. The A2 successor design (all prop.)

### 4.1 Version and chain position

- **prop.** A2 takes `goal_run_projection.v6`. It is the next free number (§1.1).
- **prop.** A2 is chain member v6 under A3S rule R1 ("Each successor carries every supported branch of the current head in whole preserved banks, plus its own", A3S line 299).
- The numbers are taken at landing (A3S R2). If another successor lands first, A2 re-adjudicates.

### 4.2 Owner units and files (prop., IDs taken at landing)

Next free IDs after A1: GRS-090, SP-323, BRS-032, ATS-061, CV-355 (main max GRS-085, SP-320, BRS-029, ATS-058, CV-353; A1 adds up to GRS-089, SP-322, BRS-031, ATS-060, CV-354).

| Unit (prop.) | Content |
|---|---|
| GRS-090 | Successor to GRS-085 in the mandatory role. Birth scope per branch (§4.3). Halts (§4.5). Records the successor reading of "extend GRS-085". |
| SP-323 | Two new families, keys, codec, anchor/frontier, publication, rebuild, retention, P-02 ruling (§4.7). Routing paragraph in SP-214 after `storage-plan.md:15176` @main. |
| BRS-032 | Coherent optional derived backup and restore order, as BRS-029. |
| ATS-061 | Whole-value positive and negative facets for each branch and each halt. |
| CV-355 | Schema-root and resource-bank closure of the new consumer schema. |

Companion directory (prop.): a successor to `Plans/goal_run_certified_consumer_contracts/` with the same file set, plus whole preserved v5 banks under `companions/`.

### 4.3 Which births it admits

"v6/v7/v8" in the question can mean dataset versions or native profiles. Here it means native birth profiles.

| Same-run Event | original profile | all_writers.v7 | all_writers.v8 |
|---|---|---|---|
| `goal_run.started` v3 | yes, whole SP-311 bank | yes, whole v5 native-v7 companion | **yes, new** native-v8 companion |
| `goal_run.cancelled` v3, positive D06 | yes, whole SP-312 bank | yes, whole v5 companion | **branch authored, dormant** |
| `goal_run.certified` v3 | not admitted (as v5) | yes, whole v5 branch | **branch authored, gated** |
| `goal_run.replanned` | halt | halt | **halt** (§4.4) |
| `goal_run.stopped`, `goal_run.blocked` | halt | halt | halt |
| v2 sibling of any family | halt | halt | halt |

Notes:
- v8 started: v8 carries its own Start roots, `native-v8/schemas/workflow-start-custody.v7.schema.json` and `workflow-original-start.v7.schema.json` (file list @A1). v5 binds "v6 Start custody" for v7 births (`protocol.md:11` @main). So v8 needs its own companion bank. It does not reuse v7's.
- v8 cancelled is dormant. `Goal_Runtime_System.md:8302` @A1: "full cancellation and D06 are unavailable for v8 births." The branch is authored against `native-v8/schemas/workflow-cancel-positive-arguments.v3.schema.json`. It sees no v8 Event until the D06 issuer is bound.
- v8 certified is gated. `Goal_Runtime_System.md:8206-8207` @A1: "their Storage admission for v8 births is unavailable until a separate Storage revision". The v6 certified-v8 branch reads the compact coordinator values (as v5 P2, `protocol.md:31` @main). So it is live only after that Storage revision. **prop.** A2 either carries that Storage revision or names it as its prerequisite. R2 did not decide which.
- v8 certified may also need an Event registry row change. The certified row pins the v1 identity root: `event_family_registry.json:137` @main `"Plans/goal_certified_event_coordinator_contracts/schemas/identity.v1.schema.json#/$defs/EventRecord"`. v8 uses the v2 roots (A1 GRS-088). R2 did not check whether the Event gate reads `source_refs`. If it does, admitting v8 certified Events is a registry change and needs a Q-02 / DL-036 checkpoint card. **Open (O-R2-05).**
- Profile binding per Event: v5 `protocol.md:13` @main: "Each per-Event branch selects its exact native birth/installed descriptor and original operation, not a caller profile string." **prop.** v6 keeps this. The v8 branch pins descriptor digest `7b22c1f4…`. An Event whose profile differs from its run's birth profile halts as "mismatched scope".

### 4.4 Same-run replanned from v8 births (the Replan release)

**Finding.** A2's v6 cannot admit a replanned row. Three separate facts block it.
1. No admissible replanned Event exists before A3-replanned. `Goal_Runtime_System.md:8089-8093` @A1: "The registered goal_run.replanned row stays at family revision 2.0.0 with payload pm.goal_runtime_event.goal_run_replanned.schema.v2 and is not selected here ... An authentic append of a Replan Event therefore cannot be admitted until the Event contract work A3". The v3 envelope is also undecided (`:8098-8101` @A1: "A3 decides the goal_run.replanned v3 envelope").
2. DL-080 orders the rows. `Decision_Log.md:6657` @main: "Full current Event Authority contracts for goal_run.stopped and goal_run.blocked land before the contract for goal_run.replanned". With C-4 option 2 the stopped and blocked writers wait for a v9 profile. So the replanned contract waits behind v9 too, unless the coordinator reads "land" as the source phase only (**open, O-R2-02**).
3. F-1: the v8 release consumes only the forked projector's `ReplanProjectResult`. A chain successor cannot feed it.

**prop.** v6 halts on every same-run `goal_run.replanned`, as v5 does. The Replan release for v8 births stays unavailable after A2. A1's statement "until A2 supplies the projection admission" is then not met by A2. It needs one of the options below.

Options for the v8 Replan release (prop.; not decided here):

| Option | What it means | Cost |
|---|---|---|
| RR-1 | Register the forked Replan projector as a second, v8-only, release-admission projector: row #23 as authored plus a projection-row family it lacks. The mandatory chain later also adds replanned rows. | Two per-run projectors derive replanned rows. Breaks R1. Needs an explicit justification against DL-080 "extend GRS-085" (U3 option B). Storage must accept the pinned JSON codec, `H()` keys and a checkpoint with no root CAS fields, unlike every predecessor (U3 §4.3). |
| RR-2 | v8 Replan release is never available. Replan completion moves to v9, whose release input is authored against the chain. | No v8 run can complete a Replan. A v8 run that claims and applies a Replan stays held (`Executor_Protocol.md:8852` @A1: "a completed Replan operation stays held"). Needs a rule that v8 refuses the Replan claim, or accepts the held state (**open, O-R2-03**). |
| RR-3 | Amend v8 before A1 lands: repoint `ReplanProjectionAdmission.original_projection` to a chain type. | Changes the v8 digest. Reverses the reason for C-4 option 2 ("A1 lands as reviewed", `cards:110`). The chain type does not exist yet, so there is nothing to pin. |

**prop. recommendation:** RR-2. v9 is already required by C-4 option 2 and must carry the v8 writers forward (`cards:115`: "v9 must carry v8's writers forward and needs its own consumer adoption"). Nothing is built, so no live v8 run is affected (`cards:113`). RR-2 changes what Replan can do on v8 runs, so it is shown to Jared as a card (prop. C-5) unless the coordinator rules it an owner matter.

### 4.5 What v6 still halts on

Before the row, never a no-op (prop., carried from v5 `protocol.md:53` and GRS-085 `:7885-7886` @main):
- Same-run `goal_run.replanned`, any payload version, any profile (§4.4).
- Same-run `goal_run.stopped` and `goal_run.blocked`, any version. For v8 births no writer exists: `Executor_Protocol.md:8985` @A1 "adds no goal_run.stopped, goal_run.blocked or goal_run.cancelled writer", and C-4 option 2 keeps it so. The halt still guards against historical v2 rows and foreign or forged rows.
- Any v2 sibling. v5: "No v2 sibling is cast or skipped."
- Unknown family, unknown schema, malformed or unverifiable frame, gap, reorder.
- Any Event of a birth profile outside §4.3, for example a future all_writers.v9 birth.
- Conflicting lifecycle: a second Start, Start after a terminal, certified after cancelled, cancelled after certified (v5 `protocol.md:59`).
- A durable, unreleased held certified Event. v5 gives it no success (`protocol.md:33`). **New for v8:** after an EP-127 revocation Stop the release may never come. `Goal_Runtime_System.md:8295-8297` @A1: "what then becomes of an already durable held goal_run.certified Event is not stated by the source and stays open, its Event side with the Event contract work A3." **prop.** v6 halts there. That run's projection then stays halted until A3 rules (**open, O-R2-04**).

### 4.6 Checkpoint: why v6 does not register row #23 as authored

The task names row #23 `goal_run_started_cancelled_replanned_checkpoint` as the checkpoint. R2 finds it cannot be v6's checkpoint.
- Its name, profile const, `grscrg_` prefix, `H()` key, JSON codec and missing root CAS fields are all pinned inside the v8 digest (F-1; `physical-families.json:237-243` @A1).
- It has no certified branch. v6 must carry v5's certified branch (R1).
- v6 does not admit replanned (§4.4), so a "replanned" name would be false.

**prop.** v6 registers its own pair, modelled field for field on `/families/292-293`:

| Item | prop. value |
|---|---|
| Projection family | `goal_run_lifecycle_v6_projection` (chain-neutral stem, A3S §5 "Naming") |
| Checkpoint family | `goal_run_lifecycle_v6_checkpoint` |
| Row key / table | `goal_run_projection.v6:K(project_id):K(goal_run_id)` in `goal_run_projection.v6@<generation_id>` |
| Checkpoint key | `goal_run_lifecycle_v6_checkpoint.v1:K(storage_instance_id):K(project_id):K(goal_id):K(goal_run_id)`, table `checkpoints` |
| Schemas | `pm.goal_run_projection.lifecycle.v6` / `6.0.0`; `pm.goal_run_lifecycle_v6_checkpoint.v1` / `1.0.0` |
| Required fields | projection as `/families/292`; checkpoint the nine of `/families/293`, including `root_revision`, `last_transaction_id` |
| Codec | CV339 canonical MessagePack, `K()` = unpadded base64url of exact UTF-8, no normalization |
| Generation prefix | `grl6g_` (distinct from `grsg_`, `grscg_`, `grsccg_`, `grscrg_`) |
| Anchor | `SHA256(encode(["goal_run_lifecycle_anchor.v6", storage_instance_id, scope, "goal_run_lifecycle_projector.v6", profile_digest, seed_hex, source_token_at_birth]))` |
| Frontier | `SHA256(encode(["goal_run_lifecycle_frontier.v6", anchor_sha256, frontier_revision, prior_frontier_sha256, processed, last_transaction_id]))` |
| Methods | `owner.goal_run.lifecycle_v6.project_prefix.v1`; Storage `…lifecycle_v6.read_sources.v1` and `…publish.v1`; current reads split per branch and profile, adding `…read_current_started.native_v8.v1`, `…read_current_cancelled.native_v8.v1`, `…read_current_certified.native_v8.v1` |
| Recovery sources | the 64 of `/families/293` plus the v8 source families the v8 branches read (a subset of A1 `/families/294-327`) and the v8 certified compact families once admitted |

Row #23 disposition (prop.): it stays unregistered under RR-2 or RR-3. It is registered as authored only under RR-1. Its status string cannot change, because it is inside the v8 digest. A2's SP unit records the disposition in prose.

### 4.7 P-02 tokens and a proposed Storage-owner ruling

The facts:
- v6's checkpoint stores the durable token under the predecessor names: `Generation.source_token_at_birth` and `ProcessedPrefix.generic_token` (as v5 `consumer.v1.schema.json:633`, `:733` @main). The preserved v3, v4 and v5 banks hold the same names whatever v6's root does (U3 §3.3 lists v3 `:315`/`:414`, v4 `:315`/`:414`/`:1262`, v5 `:633`/`:733`).
- DL-076 item 2 (`Decision_Log.md:1463` onward @main): "A stored read token is the nine-field durable token that the goal_run consumers already store as `DurableGenericToken`, and every read joins the snapshot id of its own live read transaction."
- SP-278 amendment (`storage-plan.md:21044` @main): "It is the `DurableGenericToken` that SP-311, SP-312 and the certified consumer already store."
- Section 2.3.1 (`storage-plan.md:519` @main): "A field named `read_token` or ending in `_read_token` is a read selector ... Any other schema under such a name, or either schema under another name, remains a secret-material failure." Its list of rows that persist the durable token names six rows and none of `/families/279`, `/281`, `/293`.
- So main already stores the nine-field token under two names that §2.3.1 calls a failure. Readiness passes only because these names sit behind external `$ref`s it does not follow (U3 §3.3; `storage-plan.md:519` @main: "following its local references but not unreferenced `$defs`").

prop. Storage-owner ruling (U3 option (i), adapted to DL-076):
1. `source_token_at_birth` and `generic_token` are admitted read-selector names only inside the checkpoint record graphs of the `goal_run_projection` chain: `/families/279`, `/281`, `/293`, the v6 checkpoint and later chain members.
2. Their whole schema must be exactly the nine-field durable projection of `event_record_index_checkpoint.schema.json#/$defs/read_token` (redb_snapshot_id removed from `properties` and `required`), as SP-278 on 2026-09-24 defines it. The whole ten-field token under these names, or under any stored name, stays a failure. No stored value holds `redb_snapshot_id` (DL-076).
3. Every advance, read, recovery or disclosure forms the live ten-field token from the stored nine fields and the snapshot id of its own read, and revalidates the whole token (SP-278 text at `:21044`).
4. The §2.3.1 list of rows that persist the durable token gains these chain checkpoints, with their field names, beside the six already listed.
5. Transient ten-field tokens stay transient and unstored (for example A1 `ReplanProjectResult.generic_token`, consumer schema line 2114 @A1, is a result field).
6. Readiness should follow the chain checkpoints' external `record`/`generations` references for the `redb_snapshot_id` check, or the ruling should say it does not. This is the one open technical item (A3S O-S4-09).

Why (i) and not rename: renaming only v6's root would leave the same names in the preserved banks, so a ruling is needed either way. The ruling extends DL-076's own precedent and changes no stored identity. It is a Storage owner decision under the same delegation DL-076 used ("Decided by Jared, by delegation to the coordinator"), not a new product question. **prop.** It lands in A2's SP unit as a dated §2.3.1 amendment.

### 4.8 Backfill, retention and cutover (prop.)

- Backfill = v5 P8 rebuild: stage an empty isolated `grl6g_` generation from all retained originals over the complete global prefix. v7-born and original-profile runs are re-derived through their preserved banks. Never copy a v5 row or checkpoint.
- Retention: both families `RP-PROJECTION-3GEN@1.0.0` exactly. Source coupling: started `RP-RUNTIME-365D`, cancelled and certified `RP-AUTHORITY-INDEFINITE` (registry `event_family_registry.json` rows @main), and every other source its own policy. No new retention policy: the count stays 27 (`retention_policies` length 27 on main and A1). So no DL-045 card.
- `goal_run.replanned` Events keep `RP-RUNTIME-365D` (`event_family_registry.json:183` @main, in the replanned row that starts at `:146`). This matters only when a later member admits replanned.
- Mandatory role: **prop.** a dated SP-214 routing paragraph and a GRS minima routing note, as for certified (`storage-plan.md:15166-15176` @main; `Goal_Runtime_System.md:2657` @main), move the mandatory role to v6 once v6 has a current generation. v5 families stay registered and unchanged.
- Canon does not say what happens to a predecessor's current generation once a successor carries the role. v3 and v4 stayed `materialized` after v5 (registry `status` @main). **Open (O-R2-06).**
- Census if A1 lands first (A1 counts: 328 families, 308 materialized, 285 `later_gui_or_feature_projection`, all computed @A1): v6 adds 2, giving 330, 310 and 287. Any v8-certified Storage revision adds more. Re-derive at landing.

---

## 5. How A3-stopped takes the next version

The A3S chain table (lines 304-311) was written before C-4. It assumed V-1 or V-2. With C-4 option 2 (V-2), its row for v7 now reads "V-2: v9, which then also needs v9 started, cancelled and certified carried" (A3S line 309).

prop. updated chain:

| Dataset | Author | Adds | Birth scope |
|---|---|---|---|
| v6 | A2 | v8 started (live), v8 cancelled (dormant), v8 certified (gated) | §4.3 |
| v7 | A3-stopped landing 2, with the v9 consumer adoption | all_writers.v9 started, cancelled, certified carried forward, plus the stopped branch | stopped only for v9 births |
| v8 | A3-blocked | blocked branch | v9 births (blocked writer also in v9, `cards:111`) |
| v9 | A3-replanned, with the Replan consumer rebased on the chain | replanned branch | v9 births; v8 births only under RR-1 or RR-3 |

Notes:
- A3-stopped's successor waits for a v9 native source package. No v9 package exists on any ref (not found by git grep for `all_writers.v9` in `Plans` on main or A1). **prop.** v9 adoption and the stopped branch land as one successor (the A3S option (b) shape, applied to v9). This keeps one live stopped successor. It needs the coordinator's consent, as A3S already says for option (b).
- **prop.** stopped and blocked may share one successor if blocked's trigger is decided in time. DL-080 orders rows, not chain positions (A3S R3). Merging saves one successor.
- Dataset v8 and v9 sit beside native profiles all_writers.v8 and v9 with different meanings. The chain-neutral family stem limits confusion. **prop.** each owner unit states both numbers in full.
- v6 halts on stopped and blocked. v7 must not admit stopped for v8 births: no v8 writer exists, so any v8-born stopped row is forged or foreign and halts.
- A3S's reducer rules for stopped (A3S §5, "Reducer rules for the stopped branch") carry over unchanged, except that "v8" reads "v9".

---

## 6. Open questions

| ID | Question | For |
|---|---|---|
| O-R2-01 | Confirm the successor reading of "extend GRS-085" once, in A2's GRS unit (same as A3S T-12). | Goal Runtime, Storage owners |
| O-R2-02 | Does DL-080 "land before" mean the stopped and blocked source phase (landing 1), or their full adoption? If full adoption, the replanned contract waits for v9 as well. | coordinator |
| O-R2-03 | v8 Replan release: RR-1, RR-2 or RR-3 (§4.4). Under RR-2, should v8 refuse the Replan claim so no run is left held? | Jared (card C-5, prop.), A1 thread |
| O-R2-04 | v8 held certified Event behind an EP-127 revocation: v6 halts that run (prop.). Does A3 rule otherwise? | A3, Executor, Goal Runtime |
| O-R2-05 | Does admitting v8 certified Events need a `goal_run.certified` registry row change (its `source_refs` pin identity v1)? If yes, a Q-02 card. | A2, process thread |
| O-R2-06 | Once v6 carries the mandatory role, does the v5 current generation keep advancing, or does it retire? | Storage owner |
| O-R2-07 | Does A2 carry the Storage revision that admits v8 certified values (v2 roots), or depend on it? | A2, Storage owner |
| O-R2-08 | Readiness coverage of external `record`/`generations` references for the P-02 ruling (A3S O-S4-09). | Storage owner, readiness |
