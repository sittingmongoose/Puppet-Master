# A2 design: consumer adoption from all_writers.v7 to all_writers.v8 (Replan v8, Step 8(b) Group A)

- Status: design note, revision 2 (critique A2C-01 to A2C-17 applied; section 12 has the disposition). Not canon. Nothing in the repository was edited, committed or pushed.
- Inputs: evidence notes R1 to R5 in this directory, the A1 design (`../a1-scope/A1-canonical-draft-design.md`), the A3-stopped design (`../a3-stopped-scope/A3-stopped-design.md`) and the C-2/C-3/C-4 answer record (`../a3-stopped-scope/cards-C2-C4-20260925.md`). I spot-checked the key citations of R1 to R5 at the refs below.
- Refs, read as git objects only:
  - **main** = `origin/main` @ `bd95afcc8` (fetched 2026-09-25). The readers used `63cf2cb97`. Main moved by 18 commits in between: the Step 9 registration of `coordination.agent_registered` landed (`abdf4eead`), then one reports-only commit (`bd95afcc8`). See 0.3.
  - **A1** = `origin/plans/replan-v8-a1-20260925` @ `e8d61ace4`. Not landed. It is 18 commits behind main. **Every `@A1` line number in this note is at `e8d61ace4`.** A1 must rebase and recompile before it lands (0.3), which rewrites at least CV-354 and ATS-059, so every `@A1` citation is re-cited against A1 as landed before A2's prose is written (8 step 0).
  - **PA** = `origin/plans/replan-v8-process-answers-20260925`.
- Conventions. "prop." marks a proposal of this design. "By analogy" marks a step from one precedent to another case. "Inference" marks a conclusion no quoted text states. Every other claim is cited as `file:line @ref` with a short quote.
- Line numbers at main: files that changed between `63cf2cb97` and `abdf4eead` shifted only in `Decision_Log.md` (after line 2158, +22), `Automated_Testing_System.md` (after 5211, +12) and the Event registry tail. `bd95afcc8` changed only `reports/`, so no cited Plans line moved after `abdf4eead` (critic A2C-17). Citations below use the current main lines.

---

## 0. Brief

### 0.1 The design in ten lines

1. A2 adds **one** new member to the per-run `goal_run_projection` chain: **`goal_run_projection.v6`** (prop.). GRS-085, SP-317, BRS-029 and Storage rows #292-293 stay byte-exact.
2. v6 carries every branch of v5 unchanged, by reference, and adds the **all_writers.v8** birth profile: started (live), cancelled (authored, dormant because D06 is unavailable for v8 births), certified (authored, unavailable until a separate Event and Storage admission). Each gate is a runtime source-admission condition written in v6's bytes, so a branch can go live without a v6 byte change only if the later admission uses the roots v6 already binds (2.2.1).
3. v6 still **halts** on same-run `goal_run.replanned`, `goal_run.stopped` and `goal_run.blocked` for every profile.
4. The started, cancelled and certified "consumer successors" A1 asks for are **v8 companions inside the v6 directory**, made by exact `$id`/`$ref` prefix replacement, as v5 did for v7. There is no separate directory per Event.
5. **A2 does not make `owner.workflow.replan.project.v1` or `owner.workflow.replan.release.v1` available.** The v8 descriptor fixes the release input to the output type of A1's separate Replan projector. A chain member cannot produce that type (R2 F-1). Release also needs A3's Event read. Whether v8 runs can ever finish a Replan is a product question: card **C-A2-1**, recommended answer "no, Replan finishes on v9 runs". A2 lands without waiting for the answer. The program plan gave A2 "a new replanned consumer" (`step-08-remaining-source-work-plan-20260924.md:118` @main), and A1's owner text says release waits for A2 in several places. A2 moves that item, with dated routing notes on the A1 units and a process item for the coordinator and A3 (1.4, 2.5).
6. Checkpoint candidate #23 (`goal_run_started_cancelled_replanned_checkpoint`) is **not registered** by A2. v6 registers its own pair, `goal_run_lifecycle_v6_projection` and `goal_run_lifecycle_v6_checkpoint` (prop.), at `/families/328-329` if A2 lands right after A1.
7. P-02: a ruling for Jared, or for a Storage owner he newly delegates (prop. text in 2.8; DL-076 is the form to follow, not the authority). It rules that `source_token_at_birth` and `generic_token` are admitted names **only** inside `goal_run_projection` chain checkpoints, and **only** as the nine-field durable token. No stored value holds `redb_snapshot_id` (DL-076).
8. **No Event registry row changes** (prop.). So no Q-02 card, no DL-077-form record and no PNC-019 checkpoint move.
9. Six new owner units (prop.): GRS-090, EP-128, SP-323, CV-355, ATS-061, BRS-032. One existing unit edited: SP-214 (its per-family routing paragraph, 2.9). One Decision Log entry for the P-02 ruling (the next free DL number at landing, 4.1). Dated routing notes outside the unit YAML on A1's units (1.4). Prose first, then companions.
10. v6 is shaped so that the later **all_writers.v9** adoption (with the stopped and blocked writers, per C-4 option 2) is a small, mostly generated increment (section 9).

### 0.2 Why a successor and not an edit

- A1 keeps the v7 units unchanged. `Goal_Runtime_System.md:8199-8200` @A1: "EP-124, GRS-084, GRS-085, CV-352, SP-316, SP-317, ATS-057 and BRS-029 keep their all_writers.v7 and producer_source.v2 scope unchanged."
- Any byte change to a v5 member moves its anchor. `goal_run_certified_consumer_contracts/protocol.md:69` @main: "`anchor_sha256 = SHA256(encode([… profile_digest, seed_hex, source_token_at_birth]))`". The member list includes `owner-sources.json` and `source-citations.json` (`installed-profile.json` `members` @main, checked).
- Every past step was a new pair. `storage_value_registry.json` row #280 `migration` @main (R1 2.5): "No in-place v3-to-v4 conversion, no old checkpoint copying or automatic cutover."

### 0.3 What moved since the evidence notes

- main landed `coordination.agent_registered` (commit `3abdf9fe3`): Event registry revision `2026-09-25.1`, 43 families, SHA-256 `4227be36…`. DL-094 is now on main.
- The six `goal_run.*` row fingerprints are unchanged (recomputed @main: blocked `f137e724`, cancelled `f60bbabf`, certified `f58cc6a7`, replanned `cfbe2a47`, started `3b6a4abd`, stopped `8acbc249`).
- The Storage registry on main is still 294 families and 27 policies (274 materialized, 251 `later_gui_or_feature_projection`, recomputed).
- None of the 189 v8 descriptor members changed on main (set intersection of `git diff --name-only 63cf2cb97 origin/main` with the member list: empty). **But the v8 digest will still change at A1's rebase** (critic A2C-01, checked). Two members are derived from the base commit: `owner-sources.json` and `source-citations.json` are members (`workflow_combined_source_contracts/installed-profile.json:613`, `:743` @A1), and both record `"base_commit": "63cf2cb97f936c91…"` (`owner-sources.json:3` @A1; `source-citations.json:2`, `:42` @A1). `Contracts_V0.md`, `Decision_Log.md`, `storage-plan.md` and `storage_value_registry.json` all changed between `63cf2cb97` and main (`git diff --name-only`). A1's own rule then applies: `STATUS.md:80` @A1, "If it reports any other change, follow root condition 1 in full: rebuild, re-run `run_all.py`, re-freeze … update the digests in CV-354 and ATS-059". The critic also saw, as corroboration only, an uncommitted rebase build in the packages checkout whose `installed-profile-digest.txt` reads `0da022d2…`.
- So A2 never hard-codes the v8 digest. In this note, `7b22c1f4…` always means "the v8 digest at A1's landing (`7b22c1f4…` at `e8d61ace4`)". A2 takes the value only from A1 as landed (2.4, 7.2 C09 and C12).
- This confirms R5-P2: whole-registry SHA pins go stale with every Step 9 admission. A2 pins rows by fingerprint (6.3).

### 0.4 What needs deciding first

| Item | Who | Blocks |
|---|---|---|
| P-02 token-name ruling (2.8) | Jared, or a Storage owner he newly delegates. DL-076's delegation named two questions only (`Decision_Log.md:1465` @main: "Jared approved the coordinator deciding these two Storage owner questions on his behalf") | Registering the v6 checkpoint row |
| T-11 chain order: A2 takes v6 (section 9) | Coordinator, with the A3 thread | Final names and numbers |
| T-12 successor reading of "extend GRS-085" | Goal Runtime and Storage owners | GRS-090 wording |
| Card C-A2-1 (v8 Replan completion) | Jared | Nothing in A2. It fixes one sentence in GRS-090 and the scope of A3-replanned |
| Replan consumer moves out of A2 (step-08 plan rows 118-119) | Coordinator, with the A3 thread | Nothing in A2's content. It fixes who owns the Replan consumer (2.5, PR-10) |
| Retention of the v6 pair (2.10) | Jared, for confirmation under DL-045 | Nothing, unless he objects |
| A1 rebased, recompiled and landed | Designated local session | A2's base, the v8 digest, `@A1` line numbers, row pointers and census |

---

## 1. Scope

### 1.1 In scope

| # | Item | What A2 delivers |
|---|---|---|
| S-1 | Projection successor | `goal_run_projection.v6` (prop.): one projection family and one checkpoint family, a Storage-owned publish method, a staged rebuild and cutover, retention and source coupling. |
| S-2 | Started, v8 births | Live branch. A v8 companion of the canon started consumer, bound to A1's v7 Start roots. New current reader `…read_current_started.native_v8.v1`. |
| S-3 | Cancelled, v8 births | Authored branch, dormant. A v8 companion of the canon cancelled consumer, bound to A1's cancel roots. It admits a v8 cancelled row only with a genuine positive D06 issuance, which does not exist for v8 births. |
| S-4 | Certified, v8 births | Authored branch, unavailable. A v8 companion of the v5 certified consumer, bound to A1's coordinator, identity and append-phase v2 roots. It needs Event and Storage admission of v8 certified values first (1.3). |
| S-5 | Carried branches | Original-profile started and cancelled, v7 started, cancelled and certified: carried by reference to the v5 files and the canon consumers, never copied or edited. |
| S-6 | P-02 ruling | A dated amendment to storage-plan §2.3.1 plus a Decision Log entry in DL-076's form (prop.). |
| S-7 | Backup | BRS-032 (prop.): optional coherent derived backup, as BRS-029. |
| S-8 | Dispositions | A written disposition for each A2 item A1 lists (1.4), including the Replan consumer and #23. |

### 1.2 Methods: what becomes available

- **New v6 methods** become source-available (prop., about 17, listed in 3.5). Native installation stays NOT_RUN, as for every predecessor.
- **Admission of v8 births to the mandatory run-history projection** becomes available for started. This is the item A1 marks unavailable: `Goal_Runtime_System.md:8102-8103` @A1: "that projection (GRS-085, SP-317) does not admit v8 births and still halts on same-run replanned."
- **Not made available by A2** (A1 method table M1-M10, R3 §3):

| A1 method or route | After A2 | Why (quote) |
|---|---|---|
| `owner.workflow.replan.project.v1` | Unavailable | Its output type `ReplanProjectResult` belongs to A1's separate Replan projector: generation profile `goal_run_started_cancelled_replanned_projector.v1`, prefix `^grscrg_` (`replan/schemas/goal-run-started-cancelled-replanned-consumer.v1.schema.json:1909`, `:1977` @A1). A2 does not register #23 (2.6). |
| `owner.workflow.replan.release.v1` | Unavailable. A1's texts that say it waits for A2 get dated routing notes (1.4) | `ReplanProjectionAdmission.original_projection` is `"$ref": ".../goal_run_started_cancelled_replanned_consumer.v1.schema.json#/$defs/ReplanProjectResult"` (`replan/schemas/workflow-replan-source.v1.schema.json:212-213` @A1), a v8 descriptor member (`installed-profile.json:698` @A1). Also "its exact Event read needs A3" (`Executor_Protocol.md:8851` @A1). |
| Slot return to idle, `replan_applied` wake, READBACK-RELEASED-IDLE-REPLAN | Unavailable | Each follows release (EP-126 `Executor_Protocol.md:8845-8847` @A1; ATS-060 `Automated_Testing_System.md:5619-5620` @A1). |
| `read_original` "with its required projection" | Unavailable | Needs `ExactCurrentEventRead` from A3 (R3 M5). |
| v8 certified Event admission and projection | Branch authored, unavailable | "Event and Storage admission of v8-born goal_run.certified values is unavailable" (`Goal_Runtime_System.md:8178-8179` @A1). |
| READBACK-RELEASED-IDLE-CERTIFIED | Unavailable | Needs the separate Storage revision (ATS-060 `:5631-5632` @A1, R3 M8). |
| Graph-patch governance projection (U3-Q10) | Not A2 | A1 gives it to "Storage and Contracts owners" (A1 report `:196`, R3 M10). |

- **Consequence to state plainly (inference, from two A1 texts).** `combined.claim.v1` "claims exactly one Replan or certified operation … never creates a second live slot" (`Executor_Protocol.md:8709-8711` @A1), and "a completed Replan operation stays held" (`:8851-8852` @A1). So a v8 run that completes a Replan's publication keeps its slot held. It cannot claim another Replan or a certified publication. A2 does not change this. Card C-A2-1 asks whether it stays so.

### 1.3 Out of scope, with reasons

| Item | Reason |
|---|---|
| Any edit to a v8 descriptor member | It changes the v8 digest (at A1's landing; `7b22c1f4…` at `e8d61ace4`) and forces a new v8 edition. A1 report `:219` @A1: "Any reseal of it makes that member pin stale and changes the v8 digest". The members include the Replan consumer root, the adoption boundary, the canon started consumer schema and the cancelled consumer resources (`installed-profile.json:53, 388-398, 578, 693` @A1, R3 K-1). |
| Any edit to v3, v4 or v5 files, rows or units | Section 0.2. Also R1 7.1: the v5 pins are already stale on main; a past in-place re-pin (`7ad1ffff6`) changed the v5 profile digest. A2 does not re-pin v5. The staleness goes to the reseal owner. |
| Replanned rows in the chain | A3 owns the Event: "An authentic append of a Replan Event therefore cannot be admitted until the Event contract work A3" (`Goal_Runtime_System.md:8092-8093` @A1). DL-080 orders replanned after stopped and blocked (`Decision_Log.md:6679` @main: "goal_run.stopped and goal_run.blocked land before the contract for goal_run.replanned"). Whether that means replanned waits for v9 is open (inference, PR-09). |
| Stopped and blocked rows | No v8 writer exists or will exist. Ground: Jared's C-4 answer, option 2, puts both writers in all_writers.v9 (`reports/event-authority-20260911/replan-v8/STATUS.md:62` @A1: "v8 births never record `goal_run.stopped` or `goal_run.blocked`"). Supporting text only: `Executor_Protocol.md:8985` @A1, "The limited operation appends no Event and adds no goal_run.stopped, goal_run.blocked or goal_run.cancelled writer". That sentence is about the limited revocation operation, and it names cancelled too, which v6 treats as dormant, not absent. |
| Storage admission of v8 certified values | A1 names it "a separate Storage revision" (`Goal_Runtime_System.md:8205-8206` @A1). After A1 the only route is to revise the seven SP-316 rows, because new families would change coordinator.v2 bytes (U2 §5.4 option iii). Revising them widens SP-316, which A1's design escalates to Jared (A1 design O-16). prop.: do it once, for v8 and v9 together, at the v9 adoption (10.2 OT-04). |
| Event admission of v8 certified values | The certified row names identity v1: `event_family_registry.json:137` @main `".../identity.v1.schema.json#/$defs/EventRecord"`. A1 places identity v2 beside it (`Goal_Runtime_System.md:8176` @A1). Admitting v2-identity Events is a row revision under Q-02 (6.2). Same timing as the Storage revision. |
| D06 for v8 births | "full cancellation and D06 are unavailable for v8 births" (`Goal_Runtime_System.md:8302` @A1). A native binding, not consumer work. |
| "Standard" consumer adoption | Named only in `workflow_combined_source_contracts/protocol.md:116` @A1 ("Started/cancelled/Standard and Replan consumer …"). prop. reading: Standard certification produces `goal_run.certified`, so its consumer is the certified branch (S-4). Open (10.2 OT-09). |

### 1.4 Disposition of each item A1 hands to A2

`external-consumer-adoption-boundary.json:13-16` @A1 lists four items. A1's owner units add five (R3 A2-05 to A2-09). A1's placement report adds three Q-U4 items with A2 and A3 as owners (`A1-canonical-placement-20260925.md:190` @A1: "Q-U4-05, Q-U4-07, Q-U4-08 | Released-idle readback reachability; the `record_stop` caller after the Goal Stop latch; the Event treatment of a revoked certified slot holding a durable Event | Executor and Goal owners; A2 and A3").

| A1 item (quote) | A2 disposition (prop.) |
|---|---|
| `:13` "A separate original certified consumer source successor must explicitly bind this complete native v8 profile" | v6 certified-v8 companion bound to the v8 digest at A1's landing (`7b22c1f4…` at `e8d61ace4`). Authored; unavailable until Event and Storage admission (1.3, 2.2.1). |
| `:14` "Replan whole consumer successor must be bound at genuine consumer/checkpoint birth" | Not adopted in A2. GRS-090 lists it as **open**, not closed. Under C-A2-1 option 1 it is never adopted for v8 births, and the v9 Replan branch is authored on the chain. Under option 2, A3-replanned registers it (10.1). The step-08 plan gave this to A2 (`step-08-remaining-source-work-plan-20260924.md:118` @main: "a new replanned consumer; a GRS-085 successor; projection families"), so the coordinator and A3 must accept the move (PR-10). |
| `:15` "Started/cancelled combined-profile consumers require separate exact source-profile adoption" | v6 started-v8 companion (live) and cancelled-v8 companion (dormant). |
| `:16` "Projector/checkpoint/backfill/retention/consumer declarations and exact owner original registration" | v6 pair, staged rebuild (2.9), `RP-PROJECTION-3GEN` (2.10), owner units (4). |
| A2-05 projection admission for release (`Executor_Protocol.md:8850-8852` @A1) | Not supplied. Stated in GRS-090 with the reason (1.2). Dated routing notes (below) so A1's texts do not keep saying A2 supplies it. |
| A2-06 GRS-085/SP-317 successor | v6 (section 2). |
| A2-07 token ruling before registration (`storage-plan.md:27161-27164` @A1) | Ruling first (2.8), then rows. |
| A2-08 backup (`Backup_Restore_System.md:1834-1836` @A1) | BRS-032. |
| A2-09 retention | Reuse `RP-PROJECTION-3GEN@1.0.0` (2.10), stated for Jared's confirmation under DL-045. |
| Q-U4-05 released-idle readback reachability | A2's share is nil. Both released-idle readbacks stay unavailable after A2: ATS-060 `Automated_Testing_System.md:5619-5620` @A1 ("unavailable until the consumer-adoption work A2 supplies the projection admission and A3 the Event admission") and `:5631-5632` @A1 ("needs Storage admission of v8 certified values, which is unavailable until a separate Storage revision"). GRS-090 says so. |
| Q-U4-07 the `record_stop` caller after the Goal Stop latch | No A2 share. It goes to A3 and the v9 stop writer (C-4 option 2, `STATUS.md:62` @A1). GRS-090 says so. |
| Q-U4-08 revoked certified slot holding a durable Event | A2's share: v6 halts that run until A3 rules (2.3 item 7, OT-12). |

- **Dated routing notes (prop.).** A1's owner text says in several places that release or the Replan consumer waits for A2: `Goal_Runtime_System.md:8104-8105` @A1 ("Replan release is unavailable until the consumer-adoption work A2 supplies the projection admission"), `:8141` @A1 ("Replan release and projection stay unavailable until A2"), `Executor_Protocol.md:8887-8888` @A1 ("release stays unavailable until A2 and A3 supply its projection admission"), `Contracts_V0.md:23557-23559` @A1 ("its adoption … is separate required work (the consumer-adoption work A2)"). A2 adds one dated note after each of GRS-087, EP-126, SP-321, CV-354, ATS-060 and BRS-031, and in the A1 section of `00-plans-index.md`. Each note sits outside the unit YAML, in the form of `Goal_Runtime_System.md:2657` @main ("Routing note, 2026-09-24: …"). prop. text: "Routing note, <date>: the consumer-adoption work A2 (GRS-090) landed without the Replan projection admission. The Replan consumer and the release projection admission now sit with card EA-A2-V8-REPLAN-COMPLETION-001 and the goal_run.replanned contract work A3; this note changes no unit text." Because the notes are outside the YAML, they do not change the units' Spec Lock hashes (to be confirmed at the prose step; if the shard tool treats them as unit text, they go to the reseal request).
- The v8 descriptor's `consumer` field will read stale after A2: `"None admitted. The certified v8, Replan and started/cancelled combined-profile consumers and the projector, checkpoint, backfill and retention declarations are A2's."` (`installed-profile.json:24` @A1). It is inside the digest preimage (R1 3.9). prop.: A2 leaves it as a frozen literal. EP-128 says it records the state at v8's birth and that the link runs from the consumer to the descriptor only. This is the v7 pattern reversed: in v7 the descriptor named its consumer (`goal_certified_event_coordinator_contracts/installed-profile.json:222` @main).

---

## 2. The projection successor

### 2.1 Version number and position

- **prop.** `goal_run_projection.v6`. It is the next free number. The chain on main is v1 (inventory), v3, v4, v5; there is no v2 (R2 1.1). No origin ref claims v6 or higher (R2 1.1, git grep over every `origin/*`).
- **prop.** Chain rules R1-R4 of the A3-stopped design (§5) apply. R1: "Each successor carries every supported branch of the current head in whole preserved banks, plus its own." R2: numbers are taken at landing. R3: DL-080 orders rows, not chain positions. R4: each successor states the admitted profiles per branch.
- **prop.** The owner confirmation of the successor reading (T-12, O-S4-01) is recorded once, in GRS-090. A3 cites it. DL-080's own words do not decide the form: `Decision_Log.md:1633` @main, "extends the mandatory run-history projection (GRS-085) to its rows." Every source that picks a reading picks successor (R2 §3).

### 2.2 Admitted births, per branch

"Profile" below means the native birth profile of the run, taken from its genuine birth descriptor. `Goal_Runtime_System.md:8187-8188` @A1: "profile membership comes only from the genuine birth descriptor of the run, never from the Event body."

| Same-run Event | Original profile (EP-118 route) | all_writers.v7 (`0055de6c…`) | all_writers.v8 (digest at A1's landing; `7b22c1f4…` at `e8d61ace4`) |
|---|---|---|---|
| `goal_run.started` v3 | live, SP-311 bank | live, v5 native-v7 companion | **live, new native-v8 companion** |
| `goal_run.cancelled` v3, positive D06 | live, SP-312 bank | live, v5 companion | **authored, dormant** |
| `goal_run.certified` v3 | halts (as v5) | live, v5 branch | **authored, unavailable** |
| `goal_run.replanned` any version | halts | halts | halts |
| `goal_run.stopped`, `goal_run.blocked` any version | halts | halts | halts, permanently (no writer) |
| any v2 sibling | halts | halts | halts |
| any Event of a run born under another profile (for example all_writers.v9) | halts at that run's first row | | |

- Consequence of the last row: a run born under all_writers.v9 before the chain member that carries v9 started lands has **no run history at all**. prop.: GRS-090 and 9.2 say no all_writers.v9 birth is admitted before that member lands.

- Per-Event selection keeps v5's rule. `goal_run_certified_consumer_contracts/protocol.md:13` @main: "Each per-Event branch selects its exact native birth/installed descriptor and original operation, not a caller profile string." An Event whose profile differs from its run's birth profile halts as mismatched scope.
- Cancelled v8 is dormant because canon's cancelled route is positive-D06 only. `Goal_Runtime_System.md:7506` @main: "Only user_cancelled is admitted by this positive route." And D06 is unavailable for v8 births (`:8302` @A1). A v8 cancelled row without a genuine D06 issuance is unverifiable and halts. prop.: authoring it now costs one generated companion and keeps a later D06 binding from forcing a new successor. Open (10.2 OT-05).
- Certified v8 is unavailable until both admissions exist (1.3). Until then a v8 certified row cannot validate as an admitted source and halts before its row. prop.: when the admissions land, v6 does not resume a halted generation. A fresh generation is staged (2.9). This keeps "no silent enrollment" (`protocol.md:5` @main: "It cannot … silently enroll an older run").

#### 2.2.1 How a dormant or unavailable branch becomes live (prop.)

- Each gate is a **runtime source-admission condition written in v6's bytes**, not a flag that a later edit flips. v6 never names a future root, row fingerprint or policy that does not exist at its base.
- **Certified, v8 births.** v6's condition: a same-run `goal_run.certified` row of a v8 birth is admitted only if it is a genuine Event the current Event gate admitted, it validates against the roots the certified-v8 companion binds (A1's coordinator, identity and append-phase v2 roots and the v3 payload), and its authority values are admitted by the Storage rows current at the read. Today no such Event can be appended, because the registry row names identity v1 (`event_family_registry.json:137` @main). So the branch sees no genuine row.
  - If the later Event and Storage admission (1.3, OT-04) admits exactly those roots, the v6 branch goes live with **no v6 byte change**. A fresh generation is staged at that point (2.9); no halted generation resumes.
  - If that admission needs any other root (for example a payload v4 or new Storage families), v6 cannot see it. The chain member that carries the v9 adoption (dataset v7, 9.2) then regenerates the certified-v8 companion against the new roots. That is the named chain member. A3 is told (9.4).
- **Cancelled, v8 births.** v6's condition: a v8 cancelled row is admitted only with a genuine positive D06 issuance that validates against A1's cancel roots the companion binds (3.2). Today D06 is unavailable for v8 births (`Goal_Runtime_System.md:8302` @A1: "full cancellation and D06 are unavailable for v8 births"). Inference: whether a later D06 route for v8 births would reuse those roots, or would need new roots or a new v8 edition, is not decided anywhere. If it reuses them, v6 goes live without a byte change. If not, the chain member current at that time regenerates the cancelled-v8 companion. prop.: GRS-090 says plainly that v8 cancelled is expected never to go live, because v8 is a stepping stone to v9 (C-A2-1).
- **Which pins sit in digest members** (so a change to what they pin moves v6's anchor): `profile-branches.json` (the v7 and v8 descriptor digests, both fixed once A1 lands), `resource-realms.json` (whole-file SHA-256 of every schema file v6 reaches, 3.4), `physical-retention-install.json` (v6's own two Storage rows by fingerprint). **Which do not**: `owner-sources.json` and `source-citations.json` (base pins, 3.4), which carry the six `goal_run.*` Event row fingerprints and the registry SHA at A2's base (6.3). So a later revision of the `goal_run.certified` row (fingerprint `f58cc6a7…` @main) stales only a citation pin outside the digest. It does not move v6's anchor.

### 2.3 Halting rules (prop., carried from v5 and extended)

v6 halts before the row and never treats these as no-ops. v5 source: `Goal_Runtime_System.md:7885-7886` @main, "unsupported same-run replanned/blocked/stopped profiles, conflicting lifecycle or mismatched scope halt before that row; they do not silently advance checkpoint."

1. Same-run `goal_run.replanned`, any payload version, any profile.
2. Same-run `goal_run.stopped` or `goal_run.blocked`, any version. For v8 births the halt is permanent: no v8 writer exists (1.3; ground `STATUS.md:62` @A1, C-4 option 2), so any such row is forged or foreign. prop.: GRS-090 says "permanently" for v8, so later successors need not reason about v8 stopped or blocked.
3. Any v2 sibling. `protocol.md:53` @main: "No v2 sibling is cast or skipped."
4. Unknown family, unknown schema, malformed or unverifiable frame, gap, reorder.
5. An Event of a run whose birth profile is not in the profile table (2.4), for example all_writers.v9.
6. Conflicting lifecycle: a second Start, Start after a terminal, certified after cancelled, cancelled after certified. `protocol.md:59` @main: "Certification does not follow cancellation, and cancellation does not follow certification under this bounded route."
7. A durable held, unreleased certified Event. v5 gives it no success (`protocol.md:33` @main: "An armed, Event-only, committed-but-unreleased, uncertain, missing or fabricated release has no RetainedCertifiedNative success"). New for v8: after an EP-127 revocation the release may never come; A1 leaves the Event side to A3 (`Goal_Runtime_System.md:8295-8297` @A1, "stays open, its Event side with the Event contract work A3"). prop.: v6 halts that run until A3 rules. This is A2's share of Q-U4-08.

### 2.4 The profile table (prop.)

A new file `profile-branches.json` in the v6 directory. It is a closed list, one row per admitted birth profile:

| Field | Original | v7 | v8 |
|---|---|---|---|
| `profile` | `original_started_cancelled` | `pm.executor.workflow_source.all_writers.v7` | `pm.executor.workflow_source.all_writers.v8` |
| `descriptor_digest` | none (EP-118 route) | `0055de6c…` | the v8 digest at A1's landing (`7b22c1f4…` at `e8d61ace4`), read from the landed `installed-profile-digest.txt` |
| started root | canon started consumer | v5 `companions/started-consumer.schema.json` | v6 `companions/started-consumer.native_v8.schema.json` |
| cancelled root | canon cancelled consumer | v5 `companions/cancelled-consumer.schema.json` | v6 `companions/cancelled-consumer.native_v8.schema.json` (dormant) |
| certified root | none | v5 `schemas/consumer.v1.schema.json` | v6 `companions/certified-consumer.native_v8.schema.json` (unavailable) |
| method suffix | `original_profile` | `native_v7` | `native_v8` |

- One spelling of each profile, taken from the source. v5 has three spellings in one directory (R1 3.4 item 2: `pm.…`, `owner.…`, bare `all_writers.v7`). prop.: v6 uses the `pm.` form from A1 (`installed-profile.json:1002` @A1) and the v5 schema consts only where it references v5 bytes.
- The root schema's profile union is a closed `oneOf` generated from this table. A later successor adds a row and regenerates (section 9).
- The v8 digest is **not** final until A1 lands. C-4 option 2 means "A1 lands as reviewed" (`STATUS.md:62` @A1), but A1's rebase rebuilds two base-derived members (0.3). prop.: the package generator reads the v8 digest from A1's landed `Plans/workflow_combined_source_contracts/installed-profile-digest.txt` into `profile-branches.json`. C09 and C12 compare against A1 as landed, never against a hard-coded value (7.2).

### 2.5 Replanned from v8 births

- v6 does not admit a replanned row (2.3 item 1). Three facts force this. (a) A3 owns the Event and its v3 envelope (`Goal_Runtime_System.md:8089-8101` @A1). (b) Inference: DL-080 orders replanned after stopped and blocked (`Decision_Log.md:6679` @main), and both writers now wait for v9 (`STATUS.md:62` @A1). If "land before" means full adoption, replanned waits for v9 too. No text says so; the cards record says only "Stopped's registry and projection step (landing 2) waits for v9" (`a3-stopped-scope/cards-C2-C4-20260925.md:114`). Open as PR-09 (R2's O-R2-02). (c) The v8 release input is pinned to A1's forked projector type (1.2).
- Whether v8 runs can ever finish a Replan is card C-A2-1 (10.1). GRS-090 states the facts and does not decide it (prop. sentence: "This successor supplies no projection admission for owner.workflow.replan.release.v1. That input is the ReplanProjectResult of owner.workflow.replan.project.v1, whose checkpoint is not registered; whether it is ever registered for v8 births is decided outside this unit.").
- This moves an item the program plan gave to A2 (`step-08-remaining-source-work-plan-20260924.md:118` @main; `:119` "replanned needs A1 and A2"). prop.: A2 records the move in the dated routing notes (1.4) and as process item PR-10. The coordinator and A3 must accept that A3-replanned, or the v9 adoption, owns the Replan consumer.
- R2's O-R2-03 is kept as an owner question (OT-13): should a v8 run refuse the Replan claim, so that no run is left held (`Executor_Protocol.md:8851-8852` @A1, "a completed Replan operation stays held")?

### 2.6 Checkpoint

- **#23 is not registered.** Its name, profile const, `grscrg_` prefix, `H()` keys, JSON codec and lack of root compare-and-swap fields are all fixed inside the v8 digest (`physical-families.json:237-245` @A1: `"status": "A2_SUCCESSOR_REQUIRED_NOT_REGISTERED"`, `"codec": "pm.workflow.activation_source_json.v1"`, `H(storage_instance_id)`). It has no certified branch (R4 1.3: 0 occurrences of "certified"). The three predecessor checkpoints use MessagePack and `K()` keys (R2 1.2).
- **prop.** SP-323 records #23's disposition in prose: "left unregistered; its status literal is a frozen v8 member". Its file stays byte-identical.
- **prop. v6 pair**, modelled field for field on `/families/292-293` @main (R2 4.6, adjusted):

| Item | prop. value |
|---|---|
| Projection family | `goal_run_lifecycle_v6_projection` |
| Checkpoint family | `goal_run_lifecycle_v6_checkpoint` |
| Table / row key | `goal_run_projection.v6@<generation_id>`; `goal_run_projection.v6:K(project_id):K(goal_run_id)` |
| Checkpoint key | `goal_run_lifecycle_v6_checkpoint.v1:K(storage_instance_id):K(project_id):K(goal_id):K(goal_run_id)`, table `checkpoints` |
| Schemas | `pm.goal_run_projection.lifecycle.v6` / `6.0.0`; `pm.goal_run_lifecycle_v6_checkpoint.v1` / `1.0.0` (consumer-specific ids, SP-317 convention, R3 K-7) |
| Required fields | projection as `/families/292`; checkpoint as `/families/293`, including `root_revision` and `last_transaction_id` |
| Codec | CV339 canonical MessagePack (`physical-retention-install.json:15` @main: "unchanged CV339 canonical MessagePack whole value") |
| Generation prefix | `grl6g_` (distinct from `grsg_`, `grscg_`, `grsccg_`, `grscrg_`) |
| Projector profile | `goal_run_lifecycle_projector.v6` |
| Anchor | `SHA256(encode(["goal_run_lifecycle_anchor.v6", storage_instance_id, scope, "goal_run_lifecycle_projector.v6", profile_digest, seed_hex, source_token_at_birth]))` |
| Frontier | the v5 frontier recipe with domain `goal_run_lifecycle_frontier.v6` |
| Producer | `owner.storage.goal_run.lifecycle_v6.publish.v1` (v5 pattern: Storage publish is the registry producer, R1 3.5) |
| `value_schema_ref` | URI form, as row #292 (svr `:112630` @main). One form stated (R1 7.3). |
| Recovery sources | the 64 of `/families/293` plus the A1 families the v8 branches read. The package computes the exact list by closure walk (7.2 C4). |

- Family stem is chain-neutral with the dataset number in the name, so each member gets a unique family id without ever-longer names. This follows the A3-stopped suggestion (§5 "Naming") and adds the version so later members differ.

### 2.7 Current reads and generations

- Carried from v5 P7 by reference: a row is current only while fresh sources still match and the generic frontier is equal (`protocol.md:71` @main: "processed.generic_token records the actual complete source frontier … it cannot assert coverage beyond processed.through_sequence_id").
- `maxProperties: 3` generations and root compare-and-swap as `/families/293`.

### 2.8 P-02: the proposed Storage-owner ruling (DL-076-consistent)

Facts:
- The rule. `storage-plan.md:519` @main: "A field named `read_token` or ending in `_read_token` is a read selector … Any other schema under such a name, or either schema under another name, remains a secret-material failure."
- The practice. All three canon checkpoints store the nine-field `DurableGenericToken` as `source_token_at_birth` and `generic_token` (v5: `consumer.v1.schema.json:633`, `:733` @main). Readiness passes only because the inline `value_schema` reaches them through an external `$ref` it does not follow (R1 §4, checked for rows #279, #281, #293).
- DL-076. `Decision_Log.md:1496` @main: "A stored read token is the nine-field durable token that the goal_run consumers already store as `DurableGenericToken`, and every read joins the snapshot id of its own live read transaction." Unit line `:6441` @main: "no stored value holds redb_snapshot_id."
- The hand-off. `storage-plan.md:27161-27164` @A1: "with a Storage-owner ruling on their names under section 2.3.1; that question goes to the Storage owner before the consumer-adoption work A2 registers the checkpoint successor."

**Who decides.** Not the coordinator by DL-076's delegation. That delegation named two questions only (`Decision_Log.md:1465` @main: "Jared approved the coordinator deciding these two Storage owner questions on his behalf"). The ruling also re-reads three landed rows (#279, #281, #293) that `storage-plan.md:519` @main still calls "a secret-material failure". So P-02 needs Jared's answer, or a new delegation from him. The DL entry records who decided. DL-076 is cited as the form to follow, not as the authority.

**Proposed ruling (prop.), for Jared or a Storage owner he newly delegates, recorded as a Decision Log entry in DL-076's form and as a dated §2.3.1 amendment in SP-323:**
1. `source_token_at_birth` and `generic_token` are admitted stored names only inside the checkpoint record graphs of the `goal_run_projection` chain: `/families/279`, `/281`, `/293`, the v6 checkpoint and later chain members.
2. Under those names the whole schema must be exactly the nine-field durable projection of `event_record_index_checkpoint.schema.json#/$defs/read_token`, without `redb_snapshot_id`. The ten-field token under these names, or under any stored name, stays a failure.
3. Every advance, read, recovery or disclosure forms the live ten-field token from the stored nine fields and the snapshot id of its own read, as SP-278 says.
4. The §2.3.1 list of rows that persist the durable token gains these checkpoints and field names.
5. Transient ten-field tokens stay unstored. Example: `ReplanProjectResult.generic_token` (`goal-run-started-cancelled-replanned-consumer.v1.schema.json:2114-2115` @A1, `$ref …#/$defs/read_token`). No v6 stored wrapper reaches it.
6. Readiness is not changed to follow external `$ref`s in this landing. The package token walk (C6) proves rules 1, 2 and 5 for v6. Extending readiness is open (10.2 OT-06).
7. The amendment says in words that readiness does **not** implement this name admission. Readiness still accepts only `read_token` or `*_read_token` names (`scripts/pm-implementation-readiness.py:2257-2258` @main, per critic A2C-09). The admission is enforced by owner text and package check C06 only.

- DL-076 check (critic A2C-09, no violation): the v5 `$defs/DurableGenericToken` (`goal_run_certified_consumer_contracts/schemas/consumer.v1.schema.json:496` @main) equals `event_record_index_checkpoint.schema.json` `$defs/read_token` with `redb_snapshot_id` removed from `properties` and `required`.

Why keep the names rather than rename: v6 carries the v3, v4 and v5 banks by reference, and they hold these names. A rename in v6's root alone would still need a ruling for the banks (R2 4.7).

### 2.9 Backfill (staged rebuild) and cutover

- Backfill is v5 P8. `protocol.md:81` @main: "Stage allocates a legal free generation slot, creates a fresh empty isolated dataset and immutable birth anchor without replacing current selection." `:83`: "never copy a prior derived row as original source or edit an immutable anchor." SP-317 `storage-plan.md:26627` @main: "Never copy an old checkpoint or reinterpret old row bytes."
- prop.: the first v6 generation is rebuilt from all retained originals over the complete global prefix. Original-profile and v7 runs are re-derived through the carried branches. No v5 row or checkpoint is copied.
- prop.: the mandatory role moves to v6 by **an edit to SP-214** and a GRS minima routing note beside `Goal_Runtime_System.md:2657` @main ("Routing note, 2026-09-24: …"). Readers switch only once v6 has a current generation that covers the retained prefix.
- The SP-214 edit is an edit to a seventh unit. `storage-plan.md:15166-15176` @main is inside SP-214's `canonical_text` (unit header `:15094` "### SP-214 - Goal Runtime Persistence Consumer"; the quote closes at `:15176` and `:15177` is `gui_related: false`). SP-214 goes on the edited-unit list and its Spec Lock `stale_hash` goes in the reseal request (8 step 7).
- The routing is per family and per birth profile, because the existing paragraph is: it speaks "for that family" (`goal_run.certified`), says "That family applies only to a genuine fresh pm.executor.workflow_source.all_writers.v7 birth" (`:15170-15171` @main) and "goal_run.started and goal_run.cancelled v3 keep their registry owners GRS-079 with SP-311 and GRS-080 with SP-312" (`:15175-15176` @main). prop. text of the new dated paragraph, appended inside SP-214 after `:15176`: "Routing, <date>: from the v6 cutover, GRS-090 with SP-323 governs the mandatory per-Workflow-run projection for goal_run.started (original profile, all_writers.v7 and all_writers.v8 births), goal_run.cancelled (original profile and all_writers.v7 births; all_writers.v8 births dormant) and goal_run.certified (all_writers.v7 births, which move from GRS-085 to GRS-090; all_writers.v8 births authored and unavailable). The registry owners GRS-079 with SP-311, GRS-080 with SP-312 and GRS-084 with SP-316 are unchanged. This paragraph changes no payload, schema, registry row, admission or behavior before cutover."
- The GRS minima row `Goal_Runtime_System.md:2653` @main names "GRS-085 governing its mandatory started/cancelled/certified prefix projection". prop.: the new GRS minima routing note covers it; the row itself is not edited.
- prop.: SP-323 says that GRS-085 and Storage rows #292/#293 keep the word "mandatory" as historical text after cutover. Their `replay_behavior` begins "The mandatory started/cancelled/certified per-Workflow-run projection" (critic A2C-06); the rows stay unchanged (5.1).
- v5 stays registered and unchanged. v3 and v4 stayed `materialized` after v5 (R2 4.8). What happens to the v5 current generation after cutover is open (10.2 OT-07; default: it keeps its own lifecycle under its own rules, nothing is deleted by A2).

### 2.10 Retention

- Both families `RP-PROJECTION-3GEN@1.0.0`. The policy exists (`storage_value_registry.json:175` @main). SP-311, SP-312 and SP-317 reused it with no Decision Log entry (R5 §5). Policy count stays 27.
- **By analogy**: treating that reuse as enough is a precedent applied to a new case, not a rule. DL-045 does not decide retention (`Decision_Log.md:564` @main: "This approval does not decide … retention"). A1 treated the same situation as Jared's to confirm (`A1-canonical-placement-20260925.md:74` @A1: "No new retention policy or horizon is chosen. Retention assignment is Jared's under DL-045, so this ruling is stated here for his confirmation."). R3 A2-09 reached the same view.
- prop., in A1's O-13 form: GRS-090 and SP-323 state the v6 retention (`RP-PROJECTION-3GEN@1.0.0` on both rows, plus the source coupling below) for Jared's confirmation under DL-045. No DL-036 card is needed unless he objects.
- Source coupling in `physical-retention-install.json` (prop.): started `RP-RUNTIME-365D`; cancelled and certified `RP-AUTHORITY-INDEFINITE` (as v5 `storage-plan.md:26630-26633` @main); each A1 source family its own policy. A card is needed only if a projection holds content no owner text covers (for example A1 O-13); v6 projects no Replan or graph-patch content, so none arises.

---

## 3. Consumer successors and file layout

### 3.1 One directory, companions per Event (prop.)

The v7 precedent took on a new profile with companion copies inside one successor, not one directory per Event: `companion-differences.json:2` @main, "Only exact $id and $ref resource prefix replacements; full original files retained; every semantic root difference listed." A2 follows it (by analogy).

Directory: `Plans/goal_run_lifecycle_v6_consumer_contracts/` (prop.).

| File | Role | Digest member |
|---|---|---|
| `protocol.md` | P0-P9: scope, profile table, per-branch reducer, halts, generation, current reads, publish, rebuild/cutover, retention, what is unavailable | yes |
| `methods.json` | about 17 methods (3.5) | yes |
| `profile-branches.json` | the table of 2.4 | yes |
| `schemas/consumer.v1.schema.json` | root, `$id` `https://puppetmaster.local/proposals/goal_run_lifecycle_v6_consumer.v1.schema.json`: v6 projection, generation, checkpoint, project input/result, profile union | yes |
| `companions/started-consumer.native_v8.schema.json` | from `Plans/goal_run_started_consumer_contracts/consumer.schema.json` | yes |
| `companions/cancelled-consumer.native_v8.schema.json` | from `Plans/goal_run_cancelled_consumer_contracts/consumer.schema.json` | yes |
| `companions/cancelled-causal-arguments.native_v8.schema.json` | from `…/cancelled-causal-arguments.schema.json` | yes |
| `companions/certified-consumer.native_v8.schema.json` | from `Plans/goal_run_certified_consumer_contracts/schemas/consumer.v1.schema.json` | yes |
| `companion-differences.json` | uri_map and every changed string, per companion | yes |
| `imports.json`, `resource-realms.json` (`network_fallback: false`), `source-variants.json`, `dependencies.json`, `commitment-domains.json`, `source-method-composition.json` | as v5 | yes |
| `physical-retention-install.json` | the two families, keys, codec, retention, source coupling, backup | yes |
| `installed-profile.json`, `installed-profile-digest.txt` | the consumer descriptor (CV-352 codec) with `required_original_native_profiles` from 2.4 | the descriptor itself |
| `owner-sources.json`, `source-citations.json` | pins at base, `whole_sha256_at_base` form (A1 design O-19) | **no** (prop., 3.4) |

- Carried, not copied: the v5 root and its three v7 companions, and the canon started and cancelled consumer schemas. v6 references them by `$id` through `resource-realms.json`. Their bytes never change, since any change would move their own digests.

### 3.2 The four companions

prop.: **one uri_map per companion**, each computed from the `$ref` census of its own source file, mapping only targets that have a v8 successor. One shared map cannot serve all four (critic A2C-13, census re-run @main): the v5 root references `executor_workflow_original_start.v6` 20 times and `.v2` twice, `workflow_start_original_custody.v6` once and `.v2` once, `workflow_cancel_positive_arguments.v2` once and `.v1` once; the canon started consumer references only `.v2` Start and custody ids; the canon cancelled consumer references `.v2` Start and custody, `workflow_cancel_positive_arguments.v1` and `workflow_cancel_positive_safestop.v1`.

- Started and cancelled companions: map the `.v2` Start and custody ids and the `.v1` cancel ids (their only ids).
- Certified companion: map only the `.v6` Start and custody ids, `workflow_cancel_positive_arguments.v2`, the standard `.v4` ids, the coordinator, identity and append-phase `.v1` ids and the v5 `native_v7` companion ids. The `.v2` and `.v1` ids in the v5 root's original branch stay unmapped.

Candidate pairs, all target `$id`s checked @A1 (which source id maps in which companion is fixed by the per-companion census above):

| From | To (A1) |
|---|---|
| `executor_workflow_original_start.v2` (and `.v6` in the v5 root) | `executor_workflow_original_start.v7` (`native-v8/schemas/workflow-original-start.v7.schema.json`) |
| `workflow_start_original_custody.v2` / `.v6` | `workflow_start_original_custody.v7` |
| `workflow_cancel_positive_safestop.v1` / `workflow_cancel_original_start_profile.v6` | `workflow_cancel_original_start_profile.v7` |
| `workflow_cancel_positive_arguments.v1` / `.v2` | `workflow_cancel_positive_arguments.v3` |
| `workflow_standard_current_source.v4` | `workflow_standard_current_source.v5` |
| `workflow_standard_certification_argument.v4` | `workflow_standard_certification_argument.v5` |
| `goal_certified_event_coordinator.v1` (and identity, append-phase v1) | `goal_certified_event_coordinator.v2` (and identity, append-phase v2) under `workflow_combined_source_contracts/coordinator/schemas/` |
| v5 `…native_v7.v1` companion ids | v6 `…native_v8.v1` companion ids |

- The v5 root references some roots that have no v8 successor, for example `goal_certified_original_sources.v1` (only `.v1` exists @A1, 268 hits). Those stay.
- The original-profile references in the v5 root (its `.v2` and `.v1` ids) are left unmapped in the certified companion by its own map. prop.: v6 references the certified companion only at its certified definitions. Check C14 (7.2) proves v6 reaches no other definition of that companion.
- **Meaning gap.** R1 checked only that every `$defs` name the v7 companions reach exists in A1's successor roots. "Meaning has not been compared" (R1 3.9). A1 itself says the v2 coordinator roots "are the v1 roots with only their schema identifiers renumbered" (`Goal_Runtime_System.md:8179` @A1). The Start, cancel and Standard successors are not so described. prop.: package check C5 compares every reached definition structurally, ignoring only mapped ids, and lists every semantic difference in `companion-differences.json`, as v5's rule requires.

### 3.3 Each consumer successor, in short

| Consumer | A2 artifact | State after A2 |
|---|---|---|
| Started (v8 births) | `companions/started-consumer.native_v8.schema.json` plus `read_current_started.native_v8.v1` | live, source only; native NOT_RUN |
| Cancelled (v8 births) | `companions/cancelled-consumer.native_v8.schema.json`, `…causal-arguments.native_v8…` plus `read_current_cancelled.native_v8.v1` | dormant: no D06 for v8 births |
| Certified (v8 births) | `companions/certified-consumer.native_v8.schema.json` plus `read_current_certified.native_v8.v1` and siblings | unavailable until Event and Storage admission |
| Replan | none | not adopted; card C-A2-1 |

### 3.4 Keeping pins out of the anchor (prop.)

- In v5, `owner-sources.json` and `source-citations.json` are digest members, and so is `physical-retention-install.json`, which pins the whole Storage registry SHA (`:49` @main, R1 7.1). Those pins went stale on main, and the one past re-pin changed the profile digest, which is in the anchor preimage.
- prop.: in v6, the two pin files sit outside the digest members, pinned at base and never re-pinned. `physical-retention-install.json` pins its own two rows by row fingerprint, not the whole registry file. The CV owner confirms this departure from v5 (10.2 OT-08).
- **This reduces churn; it does not remove it** (critic A2C-10). `resource-realms.json` stays a digest member (3.1) and pins the whole-file SHA-256 of each realm file. v5's realm file pins about a thousand files (critic count 1006; `grep -c sha256` gives 1025 lines @main). A change to any file v6 reaches stales a realm pin, and a re-pin moves v6's profile digest and so its anchor. prop.: v6's `resource-realms.json` pins only the closure v6 actually reaches (computed by C04's closure walk), not v5's whole realm list, to keep that set small.

### 3.5 Methods (prop.)

| Method | Effects |
|---|---|
| `owner.goal_run.lifecycle_v6.project_prefix.v1` | own derived row and checkpoint only |
| `owner.storage.goal_run.lifecycle_v6.publish.v1` | atomic row plus whole checkpoint; stage, advance, cutover only |
| `owner.storage.goal_run.lifecycle_v6.read_sources.v1` | none |
| `owner.goal_run.lifecycle_v6.read_historical.v1`, `…read_historical_legacy.v1` | none |
| `…read_current_started.{original_profile,native_v7,native_v8}.v1` | none |
| `…read_current_cancelled.{original_profile,native_v7,native_v8}.v1` | none |
| `…read_current_certified.{native_v7,native_v8}.v1`, `…inspect_original_certified.{native_v7,native_v8}.v1`, `…read_retained_certified_native.{native_v7,native_v8}.v1` | none |

v5 has twelve, with certified readers not split by profile (R1 3.4). v6 splits every per-Event reader by profile suffix, so the v9 increment adds rows to a pattern (section 9).

---

## 4. Owner units and companion files

### 4.1 Unit ids

Checked free on every `origin/*` ref and on main (exact-word git grep over `Plans reports scripts tests`, 2026-09-25; the critic re-checked all 76 origin refs): GRS-090, EP-128, SP-323, CV-355, ATS-061, BRS-032 (only `TOUCH-BRS-032…` in `touch_closure.json`, another namespace). `goal_run_projection.v6`, `goal_run_lifecycle_v6_*`, `grl6g_` and the v6 directory are also unused. **The DL number is "next free at landing" only.** DL-095 to DL-098 are claimed on other branches (R5 §7), and `fix/server-pairing-issuance-20260925` carries five unrelated entries that must renumber after DL-094 (`step8-9-progress-20260924.md:21` @main: "carry DL-094 to DL-098 for five unrelated decisions. DL-094 is now taken on main, so that thread renumbers"). Renumbered after DL-096 they would take DL-097 to DL-101. So DL-099 is not safe to plan; re-check the server-pairing branch at the landing fetch. Main maxima now: GRS-085, EP-124, CV-353, SP-320, ATS-058, BRS-029, DL-094. A1 adds up to GRS-089, EP-127, CV-354, SP-322, ATS-060, BRS-031. Numbers are re-taken at landing (A3 rule R2).

### 4.2 Units (prop.)

| Unit | Doc | Content | depends_on (prop.) |
|---|---|---|---|
| GRS-090 | `Goal_Runtime_System.md` | v6 in the mandatory role; successor reading of "extend GRS-085" (T-12); profile table; per-branch reducer and halts (2.2, 2.3); disposition table (1.4); the release sentence (2.5); v9 room (section 9); NOT_RUN | GRS-085, GRS-087, GRS-088, GRS-089, DL-080 |
| EP-128 | `Executor_Protocol.md` | passive consumer source roles for genuine v8 births; "adds no native writer to the closed all_writers.v8 roster" (wording by analogy with `protocol.md:5` @main); link direction consumer→descriptor; the v8 `consumer` field as a frozen literal (1.4) | EP-124, EP-125, EP-126, EP-127 |
| SP-323 | `storage-plan.md` | the two families, keys, codec, anchor, frontier, publish, rebuild, cutover, retention (for Jared's confirmation, 2.10) and source coupling; #23 disposition; the §2.3.1 amendment (2.8) with the readiness sentence; census sentence at line 523; the note that GRS-085 and rows #292/#293 keep "mandatory" as historical text | SP-317, SP-321, SP-278, DL-076, DL-(P-02) |
| SP-214 (edited, existing) | `storage-plan.md` | one dated routing paragraph appended inside its `canonical_text` after `:15176`, per family and per birth profile (2.9). Spec Lock `stale_hash` expected | unchanged |
| CV-355 | `Contracts_V0.md` | schema-root and resource-bank closure; companion rule; profile digest recipe (CV-352 codec); members and exclusions (3.4) | CV-352, CV-354 |
| ATS-061 | `Automated_Testing_System.md` | V6-CF facets: positive and negative whole values per branch and per halt; token walk; companion inverse; scoping of A1's V8-CF-11 and V8-CF-13 (4.3) | ATS-057, ATS-059 |
| BRS-032 | `Backup_Restore_System.md` | optional coherent derived backup and restore order, as BRS-029; "a restored held Replan operation stays held" carried from BRS-031 | BRS-029, BRS-031 |
| DL-(next free at landing) | `Decision_Log.md` | the P-02 decision, in DL-076's form (prose entry plus PlanUnit), naming who decided (Jared, or the Storage owner he delegated) | DL-076 |

Plus: one `Plans/00-plans-index.md` section (as for certified), the GRS minima routing note (2.9) and the dated routing notes after GRS-087, EP-126, SP-321, CV-354, ATS-060, BRS-031 and in the A1 index section (1.4). GRS-090 also states: the Q-U4-05 and Q-U4-07 dispositions (1.4), boundary `:14` as open, the activation conditions (2.2.1), and that no all_writers.v9 birth is admitted before the chain member carrying v9 started lands.

### 4.3 A1 checks that A2 must scope

- V8-CF-11 negatives include "a stored token field not named read_token or *_read_token" and "any registered projection or checkpoint row" (`Automated_Testing_System.md:5467-5469` @A1). Read in context, they govern "Each of the 34 appended Storage registry rows" (`:5458`).
- V8-CF-13 negative: "a v8 birth admitted to the mandatory run-history projection" (`:5489` @A1). Its evidence names "(GRS-085, SP-317)".
- prop.: ATS-061 states that both apply to A1's 34 rows and to v5 respectively, and that v6 admits v8 births under GRS-090. A1's units are owner prose, not v8 descriptor members (checked: no top-level `Plans/*.md` is a member), so a dated one-line routing note under ATS-059 is possible. Default: add it, in the style of `Goal_Runtime_System.md:2657` @main, so the check text does not read as failing (10.2 OT-10).

### 4.4 Order: prose first, then companions

A2 is not a ledger compile, so the ledger rule of CLAUDE.md does not bind it. The brief asks for the same order anyway.
1. Task 1, prose only: GRS-090, EP-128, SP-323 (with the §2.3.1 amendment and the census sentence), the SP-214 edit, CV-355, ATS-061 (with the ATS-059 note), BRS-032, the DL entry, the GRS minima note, the dated routing notes on A1's units and the index section. Then `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` and `python3 scripts/pm-plan-index.py generate`. Stop if shards of documents A2 did not edit change.
2. Task 2, companions: the v6 directory placed byte-identical to the accepted package, the two Storage rows, the census re-pins (section 5), then all checks (section 8).

---

## 5. Storage rows and census re-pins

### 5.1 Rows

- Two rows appended after A1's last row (`/families/327` `workflow_combined_slot_origin`, R5 §3). No existing row changes. Precedent: each consumer successor added exactly one projection and checkpoint pair and changed no row (`e686963ad`, `a3c511657`, `f6350caf2`, R5 §3). `f6350caf2` also added seven authority rows beside its pair, nine in all.
- Pointers (prop.): `/families/328` projection, `/families/329` checkpoint. They shift if anything else appends first (for example the four custody rows of A3-stopped landing 1, which under C-4 option 2 wait for the v9 package, so they are unlikely to land first).
- Each row: 26 fields, inline closed wrapper plus sibling `$ref`, `materialized`, tier `later_gui_or_feature_projection`, `RP-PROJECTION-3GEN`, `rebuild_from_authority` / `derived_rebuildable`, `messagepack_canonical`, owner SP-323, restore refs BRS-032 and SP-323.

### 5.2 Census

| Base | Families | Materialized | later-GUI | Policies |
|---|---|---|---|---|
| main now | 294 | 274 | 251 | 27 |
| A1 landed | 328 | 308 | 285 | 27 |
| **A2 on A1 (prop.)** | **330** | **310** | **287** | 27 (28 if `ea-storage-retention` lands first) |

Deferred 19, compatibility alias 1, tier-0 40 and `migration_only` 3 are unchanged.

### 5.3 Pins to move (at A1 values, R5 §4, spot-checked)

- `scripts/pm-implementation-readiness.py:765` `…EXPECTED_FAMILY_COUNT = 328`, `:766` policies 27, `:768` `"materialized": 308`, `:774` `"later_gui_or_feature_projection": 285`, plus the comment at 758-764 (@A1).
- `tests/test_pm_assistant_contract_closure.py:601`; `tests/test_pm_onboarding_phases.py:315-316` (and the policy count at 334 only if policies change); `tests/test_shared_runtime_storage_contracts.py:219, 224` (@A1).
- `Plans/storage-plan.md:523` (@A1: "The current pin, set by the Replan v8 A1 landing of 2026-09-25, is 328 families and 27 retention policies"). A2 writes a new dated pin sentence in SP-323's landing.
- Historical census lines stay (A1 design: "`storage-plan.md` 18890, SP-316's '285' and the composition's `storage_final_families: 294` are historical records").
- Rebase risk: `ea-storage-retention` rewrites line 523, the readiness policy pin and the onboarding test (R5 §4). Whichever lands later rebases. It also carries 25 row citations into storage-plan that it must re-pin if storage-plan changed above line 17282 (`step8-9-progress-20260924.md:20` @main: "if storage-plan changed above 17282 … re-pin the"). A2 edits storage-plan at lines 519, 523 and inside SP-214 from 15166, all above 17282. So if A2 lands first, that branch re-pins its 25 citations and its application record.

---

## 6. Registry consequences

### 6.1 Recommended: no Event registry row changes

- The row schema is closed and has no consumer field (`event_family_registry.schema.json:305-319` @main, `"additionalProperties": false`). A consumer appears only as a `source_refs` path.
- Precedent for leaving the row alone: the v5 certified consumer landed without adding itself (`event_family_registry.json:132-138` @main lists coordinator refs only). The later certified routing was "a bounded owner edit, not a registry change" (`reports/event-authority-20260911/step-08-certified-anchors-20260924.md:9` @main).
- A1 agrees: "the unchanged Event registry still selects existing original families" (`external-consumer-adoption-boundary.json:15` @A1).
- The started, cancelled and certified v3 payload schemas name no writer profile (R5 §2, grep), so v8 started Events need no payload successor.
- Result (prop.): no Q-02 card, no DL-077-form record, no `REVIEWED_GOAL_SUCCESSORS` or `CURRENT39_SHA256` re-pin (`scripts/pm-browser-event-admission.py:49` @main), no PNC-019 checkpoint move, no depth42 re-grade.

### 6.2 If a row did change (conditional; not planned)

A row changes only if Jared chooses to make v8 certified Events live in A2 (conditional card C-A2-2, 10.1). Then:
- Row `#/families/2` (`goal_run.certified`) gains `source_refs` to identity v2 (and whatever else the Event gate needs). That is a revision of an existing row. PA `process-answers-20260925.md:7`: "DL-078 does not cover a revision of an existing registry row … every A3 landing that changes a registry row … needs its own checkpoint approval card before it lands, in the DL-036 form, carrying the exact before and after rows and the registry SHA-256 before and after." The ruling names A3; applying it to A2 is by analogy, and its reason covers any row revision. `Decision_Log.md:1571` @main: "Any other registry change still needs Jared's own checkpoint approval".
- Card: one per row, frozen on the branch tip at the bytes Jared sees: row before (fingerprint `f58cc6a7…`), row after, registry SHA before (now `4227be36…`, revision `2026-09-25.1`) and after, fields changed. Form: the A3-stopped §7 card. If the registry moves before landing (any Step 9 admission), re-freeze and re-present.
- Record: a DL-077-form record at `reports/event-authority-20260911/admission-records/original-37-revisions/goal_run.certified.json` (the A3 OQ-1 path, outside the seal-check glob), first key a `seal_check_note`, `decision_ref` the new DL entry that carries the after SHA. Plus a `decision-responses.jsonl` row with `frozen_card_sha256`.
- Also: new `REVIEWED_GOAL_SUCCESSORS` pin for certified, the DL entry, the PNC-019 provenance comment, a single-family depth file, and the SP-316 seven-row Storage revision with its own widening acceptance.
- Cost: about +6 to +9 agent-hours and one more Jared round trip. Hence "not planned".

### 6.3 Pins

- prop.: v6 pins the six `goal_run.*` rows by fingerprint, plus the registry SHA at A2's base re-taken at rebase (R5-P2). The main move of 0.3 already made every whole-file pin of `0be54418…` stale.
- These pins sit in `source-citations.json`, **outside** the digest members (2.2.1, 3.4). They are evidence of the base, not admission conditions. A later certified row revision (C-A2-2 or the v9 adoption) changes fingerprint `f58cc6a7…` and stales this citation pin only; it does not move v6's anchor.

---

## 7. The A2 canonical-draft package (packages repo)

### 7.1 Home and layout (template: A1's package, R4 §3)

- Repository `sittingmongoose/PuppetMaster-Packages`, path `replan-v8/goal-replan-v8-consumer-adoption-<date>/v1` (prop.), built on a branch and merged to that repository's `main` by Jared after both reviews, as A1 was. "Package material never enters Puppet-Master; only the accepted after/Plans/ files are copied there" (A1 `PACKAGE-STATUS.md:17`, R4 §3).
- A2 has no external source to relocate. Its stages are generation and authoring, not select/relocate/rename/repair.

| Path | Content (prop.) |
|---|---|
| `after/Plans/goal_run_lifecycle_v6_consumer_contracts/…` | the files of 3.1 |
| `proposed-registry-rows.json` | two rows in registry form, `append_at` the first free pointer, `registry.sha256_at_base`, the base row fingerprints |
| `data/` | `uri-map.json` (per companion, from the `$ref` census), `profile-branches.source.json`, `census-after.json`, `v8-members-at-landing.json` (189 paths and SHAs, taken from A1 as landed) |
| `scripts/` | stages `census → companions → author → bind → selfcheck`, then `manifest`; `build.py`, `rebase_check.py`, `common.py`. The companion generator takes a profile row as input, so v9 reruns it (section 9) |
| `scripts/checks/` | C01-C14 (7.2) and `run_all.py` |
| `checks/`, `stages/`, `design/` (this note and R1-R5 as inputs), `handoff/` | as A1 |
| `PACKAGE-STATUS.md`, `manifest.json` (`pm.external_source_freeze_manifest.v1`), `SHA256SUMS` | freeze; `manifest.py` freezes only when every stage and check is PASS and recorded input hashes are current |

### 7.2 Checks

| Check | What it proves |
|---|---|
| C01 companion inverse | each companion inverts to its canon source by uri_map alone; every other difference is listed |
| C02 draft markers, C03 host paths, C10 case | as A1 |
| C04 `$ref` resolution | every reference resolves in canon realms at base (main plus A1), `network_fallback: false`; recovery source list by closure walk |
| C05 meaning | every definition a companion reaches is structurally equal to its v7-side counterpart after id mapping, or the difference is listed |
| C06 token walk | no stored v6 record graph reaches `redb_snapshot_id`; `source_token_at_birth` and `generic_token` occur only as the nine-field token and only in the v6 checkpoint graph |
| C07 registry | the two rows applied to a copy of the base Storage registry validate; census equals `census-after.json` |
| C08 collisions | unit ids, family ids, dataset v6, prefix `grl6g_`, method ids and paths are free on every `origin/*` |
| C09 descriptors | recomputes v6's profile digest; recomputes the v8 digest and checks it equals A1's landed `installed-profile-digest.txt` (`7b22c1f4…` at `e8d61ace4`, expected to change at A1's rebase, 0.3); recomputes v7 `0055de6c…` and v5 `fca86d74…` unchanged; checks `profile-branches.json` carries the landed v8 value |
| C11 citations | every cited passage recited at base |
| C12 v8 immutability | all 189 v8 members byte-identical to A1 as landed (read from the landed tree, not from `e8d61ace4`) |
| C13 instances | JSON Schema self-validation plus positive and negative whole values per branch and per halt |
| C14 reach | v6 reaches only the listed definitions of each companion (3.2) |

### 7.3 Reviews

- Independent review: `…-consumer-adoption-independent-review-<date>/v1` with `REVIEW.md`, `dimension-reviews.json`, `review-cycle-1.json`, `review-cycle-2.json`, `evidence/`, `manifest.json`, `SHA256SUMS`. Fresh blind reviewer, extra-high effort (Jared's instruction). One commit per finding. Cycle cap two; what is open after cycle 2 becomes a written open question.
- Root review: `…-consumer-adoption-root-review-<date>/v1`, `acceptance.json` (`pm.external_source_root_acceptance.v1`, status `ROOT_ACCEPTS_CANONICAL_DRAFT_FOR_A2_CANON_COMPILE`), with `canonical_adoption`, `installation` and `event_admission` false. Extra-high effort.
- The manifests are recorded in each owner unit's `source_lineage`, as A1 did (R4 3.2).

---

## 8. Order of work, checks and blind review

Effort: workers at high effort, reviewers at extra-high effort (Jared, 2026-09-25).

0. **Preconditions.** A1 rebased onto current main (`bd95afcc8` or later), rebuilt and re-frozen under its root condition 1, recompiled and landed (`STATUS.md:80` @A1). A2 then takes the v8 digest from the landed descriptor and re-cites every `@A1` line against A1 as landed. P-02 ruling drafted and sent to Jared (or a Storage owner he delegates). T-11 and T-12 confirmed by the coordinator. PR-10 (the Replan consumer move) accepted by the coordinator and A3. Card C-A2-1 presented by the coordinator or host (not blocking). Retention stated to Jared for confirmation (not blocking).
1. **Package build** (high): census, generated companions, authored root, methods, protocol, profile table, descriptor, two rows. Checks C01-C14 PASS.
2. **Independent review** (extra-high), cycle cap two. **Root review** (extra-high). Freeze. Jared merges the packages branch.
3. **Canon worktree**: `~/pm-worktrees/replan-v8-a2-<date>` on `plans/replan-v8-a2-<date>` from current `origin/main`. Sparse set `Plans scripts reports tests` (tests for the census pins).
4. **Task 1, prose** (4.4 step 1). Regenerate shards and index. `pm-plan-index.py validate`.
5. **Task 2, companions** (4.4 step 2). Then:
   - rerun C04, C06, C07, C09, C12 on the canon tree;
   - `python3 -m unittest tests.test_pm_onboarding_phases tests.test_shared_runtime_storage_contracts tests.test_pm_assistant_contract_closure tests.test_pm_browser_event_admission`;
   - `python3 scripts/pm-implementation-readiness.py`;
   - `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json`.
   - The ledger compile witness does not apply: A2 compiles no ledger. If the coordinator treats A2 as a ledger compile, run `python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/<ledger_id> --base origin/main` between task 1 and task 2.
6. **Blind form-driven review** of the canon branch (fresh reviewer, extra-high). One bounded repair round, re-review only what the repair touched, cap two. Validation report plus checks JSON under `reports/event-authority-20260911/replan-v8/a2/`, SHA-pinned evidence and review manifests (the Step 08 validation-pair form, R1 §5).
7. **Push and hand over.** `STATUS.md`, push. A local session lands it under the landing lock, running `pm-landing-check.py --base origin/main` on a full tree. Expected: Spec Lock `stale_hash` for the seven A2 units, the edited SP-214 and any unit whose text the routing notes touch, and readiness staleness for the edited documents; no Event registry drift. These go to a reseal request to the designated Plans agent.

---

## 9. Agreement with A3 on the chain

### 9.1 What changed with C-4 option 2

- Jared's answers of 2026-09-25 (`STATUS.md:62` @A1): C-2 option 1, "Pause and Abort Run both record `goal_run.stopped` and latch the run's Goal Stop"; C-3 option 1, "new work is blocked at once, and the run is recorded stopped once running steps finish"; C-4 option 2, "no stop writer is reserved in v8 … the stop and blocked writers go into a later `all_writers.v9` profile. v8 births never record `goal_run.stopped` or `goal_run.blocked`."
- So the A3-stopped design's path V-2 applies. Its chain table (§5) row "v7 | A3-stopped | stopped only for births of the writer's profile (… V-2: v9, which then also needs v9 started, cancelled and certified carried)".

### 9.2 Proposed chain (prop., for the coordinator to confirm as T-11)

| Dataset | Author | Adds | Birth scope |
|---|---|---|---|
| v6 | A2 | v8 started (live), cancelled (dormant), certified (unavailable) | original, v7, v8 |
| v7 | A3-stopped landing 2, with the v9 consumer adoption | v9 started, cancelled, certified (generated from v6's pattern) plus the stopped branch; blocked too if its trigger is decided in time | stopped and blocked for v9 births only |
| v8 | A3-blocked, only if blocked is not merged into v7 | blocked branch | v9 births |
| next | A3-replanned | replanned branch, with the v9 Replan release authored on the chain | v9 births; v8 births only under C-A2-1 option 2 |

- The v8/v9 certified Event and Storage admissions (1.3) are best done once, before or with the v7 successor, so v7's certified-v9 branch is live at birth.
- **v8 certified.** If that admission uses exactly the roots v6's certified-v8 companion binds, v6's branch goes live with no byte change and v7 carries it by reference. If it uses any other root, dataset v7 regenerates the certified-v8 companion. Either way, v7 is the named member that makes v8 certified live (2.2.1). The A3-stopped design expects v6 to carry "certified for v7, and for v8 once A2 adopts it" (`../a3-stopped-scope/A3-stopped-design.md:308`, §5 table). Under this design v6 adopts it as authored; it goes live only as said here.
- **v9 births.** No all_writers.v9 birth is admitted before dataset v7 lands, because v6 halts at such a run's first row (2.2), so the run would have no run history at all.
- Dataset numbers and native profile numbers now run side by side (dataset v8 vs all_writers.v8). prop.: every owner unit states both in full.

### 9.3 What v6 leaves room for, so v9 is a small increment

1. **Profile table.** v9 adds one row to `profile-branches.json` (2.4) and regenerates the closed union.
2. **Generated companions.** The package's companion generator takes a profile row. For v9 it is rerun with v9's roots; C01, C05 and C14 rerun unchanged.
3. **Method pattern.** Every per-Event reader has a profile suffix (3.5). v9 adds `…native_v9.v1` rows to the same pattern.
4. **Reducer as a table.** The protocol states the lifecycle as a table of (Event, profile) → rule. v7 flips the stopped cells for v9 only. v8 stopped and blocked cells say "halt, permanently" (2.3), so no successor revisits them.
5. **Carried by reference.** v7 carries v6 by `$id`, never by copy. Moving v6's two pin files out of its digest (3.4) reduces churn but does not remove it: `resource-realms.json` stays a member, so a change to any realm file v6 reaches, and its re-pin, still moves v6's anchor. v6 therefore pins realms only for the closure it reaches.
6. **Names.** Chain-neutral stems with the dataset number (`goal_run_lifecycle_v7_*`, prefix `grl7g_`), so nothing is renamed.
7. **No reserved values.** v6 does not add enum values or fields for Events it does not admit. A reviewer would rightly flag them, and v7 needs a new schema id anyway.

prop. estimate of the v7 consumer part (excluding stopped's own branch and the v9 source package): about 30 to 40 percent of A2's effort.

### 9.4 Interface points to hand to A3

- A1's Replan consumer `ReplannedProjection.status_at_original_event` already lists `blocked` and `stopped` (`goal-run-started-cancelled-replanned-consumer.v1.schema.json:1831` @A1, R3 K-8). The replanned successor must reconcile it with the chain's rows.
- The v8 held-certified-after-revocation halt (2.3 item 7) waits for A3's Event ruling (Q-U4-08).
- If A3 lands a projection successor before A2, A2 re-takes its number and rebases (rule R2).
- Tell A3: v8 certified goes live either at the certified admission (if it uses v6's roots) or in dataset v7 (2.2.1, 9.2).
- Tell A3: under PR-10, A3-replanned (or the v9 adoption) owns the Replan consumer and the release projection admission, which the step-08 plan gave to A2 (`step-08-remaining-source-work-plan-20260924.md:118-119` @main).

---

## 10. Open questions

### 10.1 Product questions (DL-036 cards to Jared)

**Card C-A2-1 (presented; not blocking A2).** Proposed file `reports/event-authority-20260911/replan-v8/a2/v8-replan-completion-card.md`, frozen on the branch tip with its SHA-256 recorded.

````markdown
# Decision card: can runs born under the v8 Workflow profile finish a Replan?

Card ID: `EA-A2-V8-REPLAN-COMPLETION-001`
Status: **QUEUED_UNANSWERED**. Prepared 2026-09-25 for A2 (consumer adoption). It does not re-ask C-4.
Owner: Goal Runtime and Executor (Workflow Replan), with Storage.

**Name:** Replan finishes only on runs born under v9.

**Question:** A run born under the v8 Workflow profile can start a Replan but has no way to
finish it. Should it stay that way, so that Replan is finished only on runs born under v9? Or
should a separate v8-only Replan projection be registered later, so that v8 runs can finish a
Replan too?

**Why:** The v8 profile (A1, which lands as reviewed after your C-4 answer) fixes, inside its
fingerprint, the exact result a Replan must present before it can finish. Only A1's separate
Replan projection produces that result. That projection is a fork of the run history: it has its
own checkpoint format and no certified branch. The run history itself is one chain of versions
(v3, v4, v5, and now v6 from A2), and v6 cannot produce that result. Finishing also needs the
replanned event contract (A3). Your decision DL-080 puts that contract after stopped and blocked
(`Decision_Log.md:1633`: "`goal_run.replanned` after the Workflow Replan source work. That source
work, the external `pm.executor.workflow_source.all_writers.v8` package … is therefore needed").
Stopped and blocked now wait for v9. We read that as meaning replanned waits for v9 too, but no
text says so yet; the coordinator is asked to confirm.

**What you get (option 1):** One run history with one set of rules. Replan finishing is built
once, for v9 runs, on that run history. A2 lands without a second projection.

**What it costs (option 1):** Plainly: the v8 Replan source that DL-080 named never completes a
Replan. On a v8 run, a Replan that has started stays held. After that the run cannot start
another Replan or publish a certified result. Nothing is built yet, so no real run is affected.
It matters only if v8 is offered for new runs before v9 exists. A separate owner question asks
whether v8 should refuse to start a Replan at all, so no run is left held.

**Options:**
1. **Replan finishes only on v9 runs (recommended).** v8 is a stepping stone; new runs should be
   born under v9 once it exists.
2. **Add the separate v8 Replan projection later.** When the replanned contract lands, register
   A1's forked projection for v8 runs only. Two projections then record Replan history, a v8 run
   with a certified result still cannot finish a Replan (the fork has no certified branch), and
   the work adds roughly 10 to 15 agent-hours to the replanned step.
3. **Change v8 before A1 lands.** Not recommended: it undoes the reason for your C-4 answer, and
   the result type it would point to does not exist yet.

**Recommendation:** Option 1.

**Answer:** ____________________

## What this card does not do
It changes no registry row, Storage row or A1 file. It does not decide the replanned event
contract or what v9 contains. It does not change A2's content: A2 lands the same way under
either answer, and only one sentence of its Goal Runtime unit depends on the answer.
````

**Card C-A2-2 (conditional; not presented by default).** Only if the coordinator wants v8 certified results live in A2.

````markdown
# Decision card: should v8 runs publish certified results before v9?

Card ID: `EA-A2-V8-CERTIFIED-ADMISSION-001`
Status: **DRAFT_NOT_PRESENTED**.
Owner: Goal Runtime and Storage, with Executor.

**Name:** Certified results for v8 runs wait for v9.

**Question:** A1 wrote how a v8 run publishes a certified result but left it switched off: the
registered certified event and its seven storage records accept only v7 runs. Should A2 switch it
on for v8 runs now, or wait and do it once for v8 and v9 together?

**Why:** Switching it on changes the registered `goal_run.certified` row (its accepted record
format) and widens seven storage records that today belong to v7 only. A1's design said widening
them needs your explicit acceptance. v9 will need the same change.

**What you get:** Option 1 does the change once, with v9. Option 2 lets v8 runs publish
certified results as soon as A2 lands (still source only; nothing runs natively yet).

**What it costs:** Option 2 adds a registry checkpoint card with the exact before and after row,
a storage widening, a Decision Log entry and a re-freeze of the certified admission pins: about
6 to 9 agent-hours and one more round trip with you. Option 1 costs nothing now.

**Options:**
1. **Wait and do it once with v9 (recommended).**
2. **Switch it on for v8 in A2.**

**Recommendation:** Option 1.

**Answer:** ____________________

## What this card does not do
It registers no new family and changes no other row. Under option 2 the row change itself still
needs its own checkpoint card with the frozen before and after row.
````

No other product question. **Retention, for Jared's confirmation under DL-045 (not a card), in A1's O-13 form:** both v6 families keep `RP-PROJECTION-3GEN@1.0.0`, an existing policy, as SP-311, SP-312 and SP-317 did; source coupling is started `RP-RUNTIME-365D`, cancelled and certified `RP-AUTHORITY-INDEFINITE`, and each A1 source family its own policy. No new policy or horizon is chosen. This treats the SP-311/312/317 precedent **by analogy** (2.10). A DL-036 card follows only if he objects.

### 10.2 Owner and technical questions (recommended default first)

| ID | Question | Default | For |
|---|---|---|---|
| OT-01 | P-02 ruling (2.8) | the seven-rule ruling as written, in a DL-076-form entry that names who decided | Jared, or a Storage owner he newly delegates |
| OT-02 | Successor reading of "extend GRS-085" (T-12) | successor, recorded in GRS-090 | Goal Runtime, Storage |
| OT-03 | Family names, dataset and prefix | `goal_run_lifecycle_v6_*`, `goal_run_projection.v6`, `grl6g_` | Storage, with A3 |
| OT-04 | v8 certified Event and Storage admission | defer to the v9 adoption, done once (C-A2-2 not presented) | Storage, Goal Runtime |
| OT-05 | v8 cancelled branch: dormant or omitted | dormant, stated unavailable until a D06 route is bound | Goal Runtime, Executor |
| OT-06 | Should readiness follow external `$ref`s for the token rule (A3S O-S4-09, T-23) | not in A2; the amendment says readiness does not implement the name admission; owner text and package C06 enforce it; a readiness extension is separate scripts work | Storage, readiness |
| OT-07 | v5 current generation after cutover | keeps its own lifecycle; nothing deleted; readers of the role switch to v6 | Storage |
| OT-08 | Pin files outside the v6 digest members (3.4) | yes | CV owner |
| OT-09 | "Standard" consumer in `protocol.md:116` @A1 | the certified branch | Executor, Goal Runtime |
| OT-10 | Routing note under ATS-059 (4.3) | add it | ATS owner |
| OT-11 | Certified companion made from the whole v5 root, reached only at certified definitions (3.2), or certified-v8 definitions authored in the v6 root | companion (mechanical, invertible) | CV owner, reviewers |
| OT-12 | v8 held certified Event after EP-127 revocation (Q-U4-08) | v6 halts that run until A3 rules | Executor, Goal Runtime, A3 |
| OT-13 | R2's O-R2-03: under C-A2-1 option 1, should a v8 run refuse the Replan claim, so no run is left held? | ask with C-A2-1; A2 changes nothing either way (a refusal would be a v8 or native change, outside A2) | Jared, Executor, Goal Runtime |
| OT-14 | Can a later D06 route for v8 births reuse the cancel roots v6 binds (2.2.1)? | assume not needed: v8 cancelled is expected never to go live | Executor, Goal Runtime |

### 10.3 Process questions (recommended default first)

| ID | Question | Default |
|---|---|---|
| PR-01 | Chain order (T-11) | A2 takes v6 now; A3-stopped's v7 carries the v9 adoption plus stopped (and blocked if ready) |
| PR-02 | Fold A2 into the v9 adoption instead, since v8 births can never stop, block or finish a Replan | No. Jared was told on C-4 that "v9 … needs its own consumer adoption, as A2 does for v8" (cards record). A2 also makes the v9 increment small (9.3) |
| PR-03 | Does Q-02 apply to A2 | Not triggered: no Event row changes (6.1) |
| PR-04 | Does the compile witness apply | No; A2 compiles no ledger |
| PR-05 | Package home and name | `replan-v8/goal-replan-v8-consumer-adoption-<date>/v1` |
| PR-06 | Who presents C-A2-1 | the coordinator or host, as for C-2 to C-4; the cloud thread does not |
| PR-07 | Landing order with `ea-storage-retention` | whichever lands later rebases the census pins |
| PR-08 | Where the P-02 ruling is recorded, and who decides | a DL entry in DL-076's form that names who decided, plus the SP-323 amendment. The decider is Jared, or a Storage owner he newly delegates; DL-076's delegation covered two questions only |
| PR-09 | R2's O-R2-02: does DL-080 "land before" mean the stopped and blocked source phase (landing 1), or their full adoption? If full adoption, replanned waits for v9 | coordinator to confirm; this note treats "waits for v9" as inference only |
| PR-10 | The step-08 plan gives A2 "a new replanned consumer" (`:118` @main) and says "replanned needs A1 and A2" (`:119`). A2 lands without it | the coordinator and A3 accept that A3-replanned (or the v9 adoption) owns the Replan consumer; the plan rows are updated in the coordinator's next progress report |

---

## 11. Estimate

Basis: A1's actuals, about 28 agent-hours and 4.8M output tokens (brief). A1 relocated an external source (74 files, 10.4 MB), placed 34 Storage rows and wrote 13 units. A2 relocates nothing, places 2 rows and writes 6 units plus one DL entry, but authors a new root and a meaning check (C05) that A1 did not need. Reviewers run at extra-high effort, which I assume costs about 30 percent more per review than high.

| Stage | Agent-hours | Output tokens |
|---|---|---|
| Decisions: P-02 ruling text, T-11/T-12 notes, card | 1-2 | 0.1M |
| Package build: generator, root, methods, protocol, descriptor, rows, checks C01-C14 | 4-6 | 0.8-1.1M |
| Independent review (extra-high, two cycles) and repairs; root review | 3-5 | 0.4-0.7M |
| Canon prose (six units, the SP-214 edit, DL entry, routing notes, index) | 2.5-3.5 | 0.35-0.55M |
| Re-cite `@A1` lines and re-take the v8 digest after A1's recompile | 0.5-1 | 0.05-0.1M |
| Companions, rows, census, checks | 1.5-2.5 | 0.2-0.3M |
| Blind review (extra-high), repair, validation report, STATUS | 2-3 | 0.3-0.5M |
| Handover and landing support | 0.5-1 | under 0.1M |
| **Total** | **15-23.5 (mid 19)** | **2.2-3.45M (mid 2.8M)** |

- Compared with A1: about 55 to 85 percent of the agent-hours and 45 to 70 percent of the output tokens.
- Wall-clock: about 10 to 16 hours of working time with parallel workers, not counting waits for A1's landing, A1's own rebase, re-freeze and re-review (`STATUS.md:80` @A1), Jared's P-02 answer, Jared's packages-repo merge and the local landing session. Those waits likely dominate.
- If C-A2-2 option 2 were chosen: add 6 to 9 agent-hours and about 0.8M tokens.
- Risks that raise the estimate: A1's recompile moves many `@A1` lines A2 cites; `ea-storage-retention` lands first and A2 rebases the census pins; C05 finds real meaning differences between the v7 and v8 roots (each needs a listed semantic difference and review); A1's rebase changes line numbers A2 cites; the Storage owner rejects the P-02 ruling and asks for a rename, which touches the carried banks' story.

---

## 12. Critique disposition

Source: `A2-design-critique.json` (17 findings, verdict `not_ready`). Before applying, I re-checked the cited evidence at `origin/main` @ `bd95afcc8` and A1 @ `e8d61ace4`: A2C-01 (members `:613`, `:743`; `base_commit` in both files; `STATUS.md:80`; four changed base files), A2C-02 (GRS `:8104-8105`, `:8141`, EP `:8887-8888`, CV `:23557-23559` @A1; step-08 plan `:118-119` @main), A2C-03 (placement `:190`, ATS `:5619-5620`, `:5631-5632` @A1), A2C-05 (DL `:1465`), A2C-06 (SP-214 header `:15094`, text `:15166-15176`, `:15177` `gui_related`), A2C-08 (DL `:1633`, `:6679-6680`; cards record `:114`; R2 O-R2-02/03), A2C-12 (EP `:8985`, `STATUS.md:62`), A2C-13 (`$ref` census re-run), A2C-14 (progress `:20-21`). All held. No finding was rejected.

| Finding | Severity | Disposition | Where |
|---|---|---|---|
| A2C-01 v8 digest not final | blocking | Applied. "final" and "survives" dropped. Digest taken only from A1 as landed; every mention written as "the v8 digest at A1's landing (`7b22c1f4…` at `e8d61ace4`)". C09 and C12 read the landed descriptor. `@A1` lines re-cited after A1's recompile | header, 0.3, 1.3, 1.4, 2.2, 2.4, 7.1, 7.2, 8 step 0, 11 |
| A2C-02 Replan consumer transfer | should_fix | Applied. Dated routing notes after GRS-087, EP-126, SP-321, CV-354, ATS-060, BRS-031 and the A1 index section; boundary `:14` kept open in GRS-090; process item PR-10 for the coordinator and A3 | 0.1, 0.4, 1.2, 1.4, 2.5, 4.2, 9.4, 10.3 |
| A2C-03 Q-U4-05, Q-U4-07 missing | should_fix | Applied. Two rows added; GRS-090 states both | 1.4, 4.2 |
| A2C-04 retention by analogy | should_fix | Applied. Labelled by analogy; retention stated for Jared's confirmation under DL-045 in A1's O-13 form; no card unless he objects | 0.4, 2.10, 4.2, 10.1 |
| A2C-05 P-02 authority | should_fix | Applied. P-02 needs Jared or a new delegation; DL entry names who decided; DL-076 cited as form only | 0.1, 0.4, 2.8, 4.2, 8, 10.2 OT-01, 10.3 PR-08 |
| A2C-06 SP-214 is a seventh unit | should_fix | Applied. SP-214 listed as edited, with Spec Lock staleness in the reseal request; routing written per family and per birth profile, v7 certified moving from GRS-085 to GRS-090; SP-323 keeps "mandatory" in GRS-085 and #292/#293 as historical text | 0.1, 2.9, 4.2, 4.4, 8 step 7 |
| A2C-07 activation route | should_fix | Applied. New 2.2.1: each gate is a runtime source-admission condition in v6's bytes; pins listed by digest membership; dataset v7 named as the member that makes v8 certified live if the admission uses other roots; v8 cancelled expected never to go live; A3 told | 0.1, 2.2.1, 6.3, 9.2, 9.4, 10.2 OT-14 |
| A2C-08 inference stated as fact | should_fix | Applied. 2.5 (b) marked inference; O-R2-02 added as PR-09; card cites DL-080 and says plainly that under option 1 the v8 Replan source never completes a Replan; O-R2-03 added as OT-13 | 1.3, 2.5, 10.1, 10.2, 10.3 |
| A2C-09 readiness does not implement the name admission | note | Applied as rule 7 of the ruling, plus the DL-076 check result | 2.8, OT-06 |
| A2C-10 realm pins still move the anchor | note | Applied. Reworded; v6 pins realms only for the closure it reaches | 2.2.1, 3.4, 9.3 item 5 |
| A2C-11 DL-099 at risk | note | Applied. DL number is "next free at landing"; server-pairing branch re-checked at the landing fetch | 0.1, 4.1, 4.2 |
| A2C-12 evidence misapplied | note | Applied. `STATUS.md:62` is the ground; `:8985` supporting only, with its scope stated | 1.3, 2.3 item 2 |
| A2C-13 one uri_map cannot serve all companions | note | Applied. One uri_map per companion; certified map limited as the critic listed | 3.2, 7.1 |
| A2C-14 rebase risk and row count | note | Applied. 25-citation re-pin added; 5.1 reworded to "one projection and checkpoint pair", with `f6350caf2`'s nine rows noted | 5.1, 5.3 |
| A2C-15 v9 births before the v9 member | note | Applied. No all_writers.v9 birth is admitted before the member carrying v9 started lands | 2.2, 4.2, 9.2 |
| A2C-16 no validator edit, no reseal | note | No change needed (confirmation) | — |
| A2C-17 currentness | note | Applied. main is `bd95afcc8`; A1 18 behind; no cited Plans line moved | header |
