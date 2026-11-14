# W3D — Back Seat Driver, phase 1 (2026-11-05)

Branch: `plans/ea-w3-back-seat-driver-20261105`. Base: `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Assessed code head: `0c32b66749473a8ebff23c4d3bdff85290d05efb`.

**Outcome:** 15 prepared; 0 merged; 0 excluded; 0 stopped. These are definition drafts prepared without admission, with no runtime evidence. All 15 central event memberships remain ABSENT. Criterion 12 is PARTIAL for every row.

## Per-name outcomes

| Exact name | Outcome | Semantic / payload / Storage units | Event retention |
|---|---|---|---|
| `bsd.advice_emitted` | prepared | `BSD-1350` / `CV-1350` / `SP-1350` | `RP-RUNTIME-365D@1.0.0` |
| `bsd.assignment_paused` | prepared | `BSD-1351` / `CV-1351` / `SP-1351` | `RP-RUNTIME-365D@1.0.0` |
| `bsd.assignment_resumed` | prepared | `BSD-1352` / `CV-1352` / `SP-1352` | `RP-RUNTIME-365D@1.0.0` |
| `bsd.assignment_started` | prepared | `BSD-1353` / `CV-1353` / `SP-1353` | `RP-RUNTIME-365D@1.0.0` |
| `bsd.assignment_stopped` | prepared | `BSD-1354` / `CV-1354` / `SP-1354` | `RP-RUNTIME-365D@1.0.0` |
| `bsd.finding_cleared` | prepared | `BSD-1355` / `CV-1355` / `SP-1355` | `RP-RUNTIME-365D@1.0.0` |
| `bsd.finding_held` | prepared | `BSD-1356` / `CV-1356` / `SP-1356` | `RP-RUNTIME-365D@1.0.0` |
| `bsd.finding_reconfirmed` | prepared | `BSD-1357` / `CV-1357` / `SP-1357` | `RP-RUNTIME-365D@1.0.0` |
| `bsd.finding_suppressed` | prepared | `BSD-1358` / `CV-1358` / `SP-1358` | `RP-RUNTIME-365D@1.0.0` |
| `bsd.output_quarantined` | prepared | `BSD-1359` / `CV-1359` / `SP-1359` | `RP-RUNTIME-365D@1.0.0` |
| `bsd.policy_changed` | prepared | `BSD-1360` / `CV-1360` / `SP-1360` | `PENDING_RETENTION_DECISION` |
| `bsd.review_failed` | prepared | `BSD-1361` / `CV-1361` / `SP-1361` | `RP-RUNTIME-365D@1.0.0` |
| `bsd.review_started` | prepared | `BSD-1362` / `CV-1362` / `SP-1362` | `RP-RUNTIME-365D@1.0.0` |
| `bsd.review_timed_out` | prepared | `BSD-1363` / `CV-1363` / `SP-1363` | `RP-RUNTIME-365D@1.0.0` |
| `bsd.workflow_binding_created` | prepared | `BSD-1364` / `CV-1364` / `SP-1364` | `PENDING_RETENTION_DECISION` |

## Authority and premise checks

The frozen deck-2 answer record says “i approve all of it”; item 9.a A explicitly names all fifteen BSD entries in its appendix and grants definition-writing under documented-search/reuse/new-authorship limits. Its exact presented deck SHA-256 is `6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30`. This external answer is the authority; DL-450 is the answer-application lane’s allocation, not a Decision Log entry authored here. No technical authority is inferred from the recount recommendation or from the 35-name DL-411 grant. Input paths and SHA-256 values are in `W3D-inputs.json`.

Today’s owner still lists each exact name at `Plans/Back_Seat_Driver.md:371` / BSD-020 and forbids unregistered emission at line 373. `Plans/Commands_System.md:6494-6502` still lists the same fifteen names for central adjudication. Event membership, payload-schema adjudication, SP-318 physical registration and real implementation remain independent prerequisites; the old disabled status remains in force.

The recount’s nearest G13/G18 suggestions were checked and not applied as grants: Card-1 G13 names five live computer/browser-use histories; G18 names fourteen scheduling histories. Neither names BSD. The thirteen assignment/review/finding/quarantine histories instead have their own real primary-run join in this draft and use Storage Case L-3’s current Runtime/run/node/attempt class (`Plans/storage-plan.md:17403-17429`) and its existing exact RP-RUNTIME-365D object. Each row’s real run is proved through its own selected assignment/source; a missing completion is never a made-up expiry anchor. Policy and workflow-binding changes can exist without an assignment/run, so their event-history rules remain pending. RP-CONFIG-CURRENT governs current configuration *values*, not these two event-history lifetimes.

No August/September answer was treated as automatically current. The current CV-317/CV-339/CV-366 and SP-278/SP-286/SP-318/SP-337 definitions were re-read and adopted only in their present scope. BSD section 24 explicitly gives this owner precedence over superseded SIR-010 semantics, so that older surface creates no competing-owner vote here.

## Per-family search and negative evidence

The pre-edit exact-name search scanned every root `Plans/*.md` and `Plans/*.json` in the fetched base. It excluded generated shards/indexes and source-lineage ledgers as non-owning surfaces. Full matching source lines, not only a count, are preserved in `W3D-search-evidence.json`. Related-concept searches separately inspected all six `pm.bsd.*` definitions, `bsd_runtime_record`, `scd.back_seat_driver.durable.v1`, the command catalog and existing BSD tests. These searches found typed lifecycle record shapes and a completed-review summary, but no event payload/producer/identity/filtered-reader contract or registered alias for any W3D name.

| Exact name | Current pre-edit hits | Reused own semantic evidence | Per-name negative result |
|---|---|---|---|
| `bsd.advice_emitted` | `Plans/Back_Seat_Driver.md:371`, `Plans/Back_Seat_Driver.md:1439`, `Plans/Commands_System.md:6502` | `BSD-006`, `BSD-009`, `BSD-031`, `BSD-032` | Listed only; no exact event definition, alias admission, identity recipe, reader or checkpoint. |
| `bsd.assignment_paused` | `Plans/Back_Seat_Driver.md:371`, `Plans/Back_Seat_Driver.md:1438`, `Plans/Commands_System.md:6502` | `BSD-012`, `BSD-016`, `BSD-033`, `BSD-035` | Listed only; no exact event definition, alias admission, identity recipe, reader or checkpoint. |
| `bsd.assignment_resumed` | `Plans/Back_Seat_Driver.md:371`, `Plans/Back_Seat_Driver.md:1438`, `Plans/Commands_System.md:6502` | `BSD-012`, `BSD-033`, `BSD-035` | Listed only; no exact event definition, alias admission, identity recipe, reader or checkpoint. |
| `bsd.assignment_started` | `Plans/Back_Seat_Driver.md:371`, `Plans/Back_Seat_Driver.md:1438`, `Plans/Commands_System.md:6502` | `BSD-002`, `BSD-004`, `BSD-014`, `BSD-016`, `BSD-017` | Listed only; no exact event definition, alias admission, identity recipe, reader or checkpoint. |
| `bsd.assignment_stopped` | `Plans/Back_Seat_Driver.md:371`, `Plans/Back_Seat_Driver.md:1438`, `Plans/Commands_System.md:6502` | `BSD-013`, `BSD-014`, `BSD-020` | Listed only; no exact event definition, alias admission, identity recipe, reader or checkpoint. |
| `bsd.finding_cleared` | `Plans/Back_Seat_Driver.md:371`, `Plans/Back_Seat_Driver.md:1439`, `Plans/Commands_System.md:6502` | `BSD-006`, `BSD-008`, `BSD-014` | Listed only; no exact event definition, alias admission, identity recipe, reader or checkpoint. |
| `bsd.finding_held` | `Plans/Back_Seat_Driver.md:371`, `Plans/Back_Seat_Driver.md:1439`, `Plans/Commands_System.md:6502` | `BSD-006`, `BSD-008`, `BSD-014` | Listed only; no exact event definition, alias admission, identity recipe, reader or checkpoint. |
| `bsd.finding_reconfirmed` | `Plans/Back_Seat_Driver.md:371`, `Plans/Back_Seat_Driver.md:1439`, `Plans/Commands_System.md:6502` | `BSD-006`, `BSD-008`, `BSD-031` | Listed only; no exact event definition, alias admission, identity recipe, reader or checkpoint. |
| `bsd.finding_suppressed` | `Plans/Back_Seat_Driver.md:371`, `Plans/Back_Seat_Driver.md:1439`, `Plans/Commands_System.md:6502` | `BSD-008`, `BSD-009` | Listed only; no exact event definition, alias admission, identity recipe, reader or checkpoint. |
| `bsd.output_quarantined` | `Plans/Back_Seat_Driver.md:371`, `Plans/Back_Seat_Driver.md:1440`, `Plans/Commands_System.md:6502` | `BSD-011`, `BSD-012`, `BSD-014` | Listed only; no exact event definition, alias admission, identity recipe, reader or checkpoint. |
| `bsd.policy_changed` | `Plans/Back_Seat_Driver.md:371`, `Plans/Back_Seat_Driver.md:1437`, `Plans/Commands_System.md:6502` | `BSD-002`, `BSD-017`, `BSD-020`, `BSD-029` | Listed only; no exact event definition, alias admission, identity recipe, reader or checkpoint. |
| `bsd.review_failed` | `Plans/Back_Seat_Driver.md:371`, `Plans/Back_Seat_Driver.md:1440`, `Plans/Commands_System.md:6502` | `BSD-004`, `BSD-013`, `BSD-014` | Listed only; no exact event definition, alias admission, identity recipe, reader or checkpoint. |
| `bsd.review_started` | `Plans/Back_Seat_Driver.md:371`, `Plans/Back_Seat_Driver.md:1438`, `Plans/Commands_System.md:6502` | `BSD-003`, `BSD-004`, `BSD-005`, `BSD-016` | Listed only; no exact event definition, alias admission, identity recipe, reader or checkpoint. |
| `bsd.review_timed_out` | `Plans/Back_Seat_Driver.md:371`, `Plans/Back_Seat_Driver.md:1440`, `Plans/Commands_System.md:6502` | `BSD-010`, `BSD-013`, `BSD-014` | Listed only; no exact event definition, alias admission, identity recipe, reader or checkpoint. |
| `bsd.workflow_binding_created` | `Plans/Back_Seat_Driver.md:371`, `Plans/Back_Seat_Driver.md:1437`, `Plans/Commands_System.md:6502` | `BSD-016`, `BSD-017`, `BSD-029` | Listed only; no exact event definition, alias admission, identity recipe, reader or checkpoint. |

## Newly authored technical bindings

Every new family triple labels itself “Newly authored owner contract” and stands independently. Each has an exact producer/source transition, closed tagged payload, Project/original-operation/event/idempotency recipe, frozen producer input, SP-286/CV-339 full-value/barrier receipt order, retry/recovery behavior, no-effect replay, custody/access/redaction/restore checks, exact operating consumer/reader/projector, SP-278 complete-range/CAS/nine-field-token checkpoint, historical original-recipe reader and writer/reader withdrawal fences. No family inherits a sibling’s producer or identity.

`Plans/bsd_event_payloads.schema.json` supplies fifteen individually closed payload roots. `Plans/bsd_event_storage_contracts.schema.json` supplies the corresponding operation/projection/checkpoint shapes, the nine-field durable token, seven original source wrappers (including pre-dispatch review admission), six current owner heads and a ref-only finding-identity operand manifest. SP-1365 binds the original source/head/operation joins and coherent backup. Original identity operands are captured from the actual owner decision before key computation, so a supplied key/digest cannot stand in for original custody. Existing six logical BSD schemas and the adjacent completed-review summary remain unchanged.

`Plans/bsd_event_storage_candidates.json` stages **58** candidate rows: 45 exact-family operation/projection/checkpoint rows, 6 preserved lifecycle wrappers, 1 separate pre-dispatch review-start wrapper and 6 original current heads. They are reviewable value rows outside the production registry. The task prohibits registry-family append, so `Plans/storage_value_registry.json` is byte-identical to base; its families/denominators, SP-318 disposition and materialization status are not extended. Candidate keys, value schema refs, canonical/derived placement, recovery and retention are explicit; real physical admission/migration/disk budgets still require their existing owner gates.

Operation custody uses the existing lifetime identity/receipt protection; derived rows use RP-PROJECTION-3GEN. Neither extends the lifetime/access of linked transcript/output bodies. Every stored part has its own 16 KiB measurement and SP-337 reference route, including frozen producer input and lifecycle bodies. No lane-local number, timestamp, physical-byte or guard-isolation implementation was written.

## Oracle plan and self-grade

`Plans/bsd_event_oracle_plan.json` contains **2324** planned field/predicate entries, each with a positive and a one-defect negative plan, plus per-family retention boundary plans. It covers exact payload fields/types/requiredness/closure, original-source and identity joins, transition-specific guards, original receipts/full values, all Storage-assigned metadata, checkpoint identities/tokens/CAS/coverage, replay-only writer refusals and historical positives, 16 KiB stored-part limits and external bytes, access/deletion/backup, retention, version/currentness and withdrawal. These are plans; they are not executable fixtures or an assertion that single-defect construction or guard removal has already passed.

Phase 2 must rebase onto the lead’s reviewed NUMRULE/date-time and GUARDTOOL foundation, implement cases using those shared helpers, expand inherited schema/union branches into actual atomic assertion sites, and prove every guard and exact duplicate site set with `pm_guard_isolation.py`. Removing a whole compound keyword, merging distinct predicates through a shared enforcement site or leaving a copy/digest/post-state stale cannot count as proof. Sol and Astra review follows that work.

`W3D-self-grade.json` contains all twelve cells for each exact name, with current path/unit/line/exact-quote evidence checked against the authored text. This intentionally conservative phase-1 grade gives C1 membership ABSENT; C2 owner route and C4 schema structural facts PASS; C3 and C5–C12 PARTIAL. Behavioral cells are not upgraded merely because prose exists: actual one-defect negatives, shared-rule adoption and guard-isolation proof await phase 2. The two pending event-retention questions additionally keep C7 open. Native execution is NOT_RUN.

### Standing defect checklist — plan coverage, not executed proof

| Brief item | W3D disposition |
|---|---|
| 1 identity/digest and source contradictions | Recompute from authentic original source/identity operands; plan each contradictory join independently. |
| 2 Storage-assigned metadata | Validate sequence/observed/persisted against actual Storage record, with separate negatives. |
| 3 and 10a historical originals | Separate authenticated original admission/recipe read path from current live writer checks; valid retained replay-only positives and invalid/withdrawn-original negatives planned. |
| 4 one field read two ways | Exact types before value interpretation; no trimming, alternate representation or digest-domain mixing. |
| 5 unvisited refs | Eager structural resolver covered all reachable new-schema branches; dangling-ref fail-closed mutation remains planned. |
| 6 size limits | Measure each complete operation/source/head/projection/checkpoint and external body; no nullable frozen-input shortcut. |
| 7 custody on every path | Original source/head/operation/receipt/full-value/backup joins on current, retry, replay and recovery; planned path-specific negatives. |
| 8 and standing check 11 | One semantic defect, regenerated unrelated copies/digests, exact per-predicate sites; shared-tool proof deferred. |
| 9 honest grades | Behavioral cells and C12 remain PARTIAL; no test/native/admission claim from this plan. |
| 10 number spellings/ranges | Adopt reviewed shared current/retained number helper in phase 2; no own numeric code or invented 2^53 storage cap. |
| 11 types | Enumerate wrong-type string boolean/number, null and container cases where disallowed. Redundant schema type next to const/enum was removed so the exact-value/type predicate has one site. |
| 12 formats | Use reviewed fail-closed shared envelope profiles in phase 2; inherited UUID/time/format branches cannot rely on silent jsonschema format acceptance. |

## Questions and investigations

**Stopped rows:** none.

**Pending retention cells (preparation continues; admission cannot):**

- **`bsd.policy_changed`:** For bsd.policy_changed, which exact lifetime, count/overflow and deletion rule should apply to the saved project BSDPolicy revision history? Card-1 G18 covers scheduling only; RP-CONFIG-CURRENT covers current configuration values, not this event history. May this history expire, or should it remain until Delete Puppet Master project data?
- **`bsd.workflow_binding_created`:** For bsd.workflow_binding_created, which exact lifetime, count/overflow and deletion rule should apply to the saved frozen workflow-binding revision history? Card-1 G18 covers scheduling only; RP-CONFIG-CURRENT covers current configuration values, not this event history. May this history expire, or should it remain until Delete Puppet Master project data?

**Assigned outside-name/continuity investigations:** none in W3D. The adjacent `bsd_runtime_record` investigation confirms SP-318 explicitly limits it to a completed-review summary; it cannot represent held/reconfirmed/quarantine/restart state and supplies no alias or lifecycle migration source. All fifteen exact semantic events therefore remain separate drafts; none was merged or excluded. No exclusion/application/Decision Log/admission record was written.

## Shared-file ranges and derived files

| File | Additive hunk(s) against base | New units |
|---|---|---|
| `Plans/Back_Seat_Driver.md` | `@@ -2632,0 +2633,1040 @@ owner_hints:` | `BSD-1350..BSD-1364` |
| `Plans/Contracts_V0.md` | `@@ -24468,0 +24469,870 @@ The selected app request union accepts only an authenticated user actor. A malfo` | `CV-1350..CV-1364` |
| `Plans/storage-plan.md` | `@@ -29476,0 +29477,1042 @@ ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0` | `SP-1350..SP-1365` |
| `Plans/Automated_Testing_System.md` | `@@ -7236,0 +7237,66 @@ ContractRef: ContractName:Plans/UI_Wiring_Rules.md#UIW-048, ContractName:Plans/U` | `ATS-1230` |

All shared-file changes append new units; no old shared row is reordered or reflowed. Production `storage_value_registry.json` has no hunk. Shards were regenerated through the repo tool, then the plan index through its repo tool. The copied ignored currentness edition matched the shared source file-for-file by SHA-256 (15 files; manifest in evidence). Only edited source documents’ configured shard trees changed. Back_Seat_Driver and these new JSON companions are not in the base sharding_config sources; the existing configured generator was used unchanged. Index output records 47 additional PlanUnits and no WorkNodes/NodeSeeds.

## Original phase-1 checks (before review)

| Check | Exit | Result / output SHA-256 |
|---|---:|---|
| `structural-check-handoff` | 0 | top-level `pass`; ` dfd05dae0873cd7a988422f8f3b5d691b00f7c4fa36150a860e70bf371ead687` |
| `shard-generate-final` | 0 | top-level `pass`; ` 0097f44a100929b5fcc967352e31e0a28f4a8974cb0027f58fdf4df24ed776d3` |
| `index-generate-final` | 0 | top-level `pass`; ` a7da9b92ac96e6619d4160d3db55ac86315bbeaccc0f7f540e316ffb0476dfd8` |
| `shard-check` | 0 | top-level `pass`; ` d697ac77c260ee1fbe5007467d179c832c4c197ffc685d08b78f338e04ff7fdc` |
| `index-validate-final` | 0 | top-level `pass`; ` 235623a7094b79d9d6dd55f366b1e9dc3dab35f1a708fd1af089aed33fc71995` |
| `bsd-existing-tests` | 1 | FAILED (failures=3); ` 1bfb7f4aa988b4ec689c54c406e85f8024d82889237606975c821a7791afa5c7` |
| `assistant-contract-check` | 1 | top-level `gaps_found`; ` 00e25902076040834e3bb5ab2f9edc130d0f9fb2be75d3d78c366e309b28748d` |
| `shared-runtime-selftest` | 0 | top-level `pass`; ` 6064a1454776e6f9cdec906eeb1453f1652e74f79bee69ee1719fec58d184027` |
| `baseline-three-failures-final` | 0 | top-level `BASELINE_FAILURES_REPRODUCED`; ` 98f5f07c3f615b63e2e89f36ad28f4dbb00c4c52177bb784add5aeb68cd6f0ea` |
| `git-diff-check` | 0 | ` e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

Commands, elapsed time, pre-run available memory, absolute log paths and output hashes are in `W3D-checks.json` and the copied evidence directory. Structural checks validate the two new schemas, all reachable refs, 47 new PlanUnits, 15 exact outcomes, 57 pending candidates, evidence/token consistency and unchanged protected files. The first structural attempt found missing preserved-token mentions in ATS-1230; the prose was corrected and the final structural run passes. These are static structural checks, not phase-2 event oracles. Existing BSD contract-closure and adjacent shared-runtime checks guard the preserved disabled/non-alias boundaries. No repository test file was edited. The current review-round results are recorded below; this table preserves the original drafting run.

The lane’s generators/checkers ran one at a time. A checker start was refused below 6 GiB; work paused for two minutes and resumed at 14 GiB (above the required 7 GiB). The runner monitors its own active process group and pauses below 6/resumes at 7 on two-minute rechecks; other VM work was not interrupted.

### Baseline failures and expected nonzero inspection status

The existing 41-test closure run reports three failures, and all three reproduce independently at the fetched base f9c5de6561: a hard-coded 342-family expectation versus 344 actual rows; an obsolete definitionless pm.brainstorm.question_bank.v1 expectation; and schedrec_envelope_record_wrong_type expecting a different rejection reason. The relevant test/schema/registry/fixture inputs match base byte-for-byte. W3D-baseline-comparison.json preserves exact cases, messages and input SHA-256 values. No unrelated test was modified. The first comparative harness used a symlink for a root-confined resolver; it was corrected to use the exact base schema bytes and then reproduced all three failures. This comparison did not rerun or certify the entire baseline suite.

Assistant inspection returns gaps_found (exit 1) because 51 pre-existing Browser families remain prepared but unadmitted; errors=[] and projects_refresh_static_failures=[]. This is its documented return condition, not a W3D structural error. The existing shared-runtime self-test passes.

## Handoff

IDs used: **BSD-1350..BSD-1364; CV-1350..CV-1364; SP-1350..SP-1365; ATS-1230**. All assigned ranges were checked free across 528 fetched origin refs (178 distinct owner-document blobs); `W3D-id-audit.json` records the base/maxima. No out-of-block ID was minted.

Next: phase-2 foundation rebase, shared number/date-time helper adoption, executable oracles, shared guard-isolation proof and Sol/Astra review. The two exact retention questions remain open until owner evidence or Jared decides them. Physical registration/migration/budgets, event admission and native availability remain independently gated. No admission, registry-family append, Decision Log change, governance reseal, main push, pm-mail or subagent was performed. The dedicated W3D worktree is removed after the pushed result is copied for handoff.


## Phase-1 review round 1: findings and responses

Reviewed head: `3da70bff9cb79f563e708ff47c84385d8e27d512`. Fixed normative code commit: `0c32b66749473a8ebff23c4d3bdff85290d05efb`.
Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/W3D-sol/REVIEW-phase1.md`.
All three blockers are fixed in the phase-1 contracts/plans. None is disputed. No product decision was made.

| Finding | Where / why | Fix and verification |
|---|---|---|
| **B1 — fixed, `0c32b66749473a8ebff23c4d3bdff85290d05efb`** | Payload `assignment_started.effective_mode` and `assignment_started.not_off` used stage-override casing in the resolved-mode field. | Exact `Auto|On` schema and positives; distinct `auto`, `on`, `off`, `Off`, `inherit` schema-only negatives. A genuine frozen `Off` source is separately refused before assignment creation. A schema-valid `Auto`→`On` substitution independently exercises the frozen-source join. No implicit conversion. Schema probes pass. |
| **B2 — fixed, `0c32b66749473a8ebff23c4d3bdff85290d05efb`** | Review-start required the complete terminal `pm.bsd.review_cycle.v1`, whose mandatory `result` cannot exist before dispatch. | `review_admission_id` identifies the authentic accepted pre-dispatch source. Closed `pm.bsd.review_start.v1` records start facts with no result, latency or terminal body. New immutable `source_review_start` supplies `review_start_ref`; the start operation and receipt settle before dispatch. Only the later genuine terminal wrapper binds `review_start_ref` and verifies each original start fact. Original six logical schemas and completed-summary history remain byte-identical. Positive no-result schema probe and independent premature-result/source/join plans are present. |
| **B3 — fixed, `0c32b66749473a8ebff23c4d3bdff85290d05efb`** | All fifteen plans omitted independent current-write permission/epoch/Stop/writer fences and source/envelope joins. | Every family names each applicable gate and each envelope field join with its own positive and one-defect negative. All thirteen assignment-backed events independently test envelope `run_id` and payload `primary_run_id` against the authentic assignment. Configuration events retain null run/assignment/epoch/generation. Separate payload-to-source bindings cover policy/binding/assignment/run/epoch/generation/review facts. Live-epoch negatives change only live epoch, with unrelated CAS observations refreshed; permission negatives leave reader access valid. Current replacement-control clearance and valid old-epoch historical positives are preserved. |

Current fix locations:

- `Plans/bsd_event_payloads.schema.json:411`
- `Plans/bsd_event_storage_contracts.schema.json:3939`
- `Plans/Back_Seat_Driver.md:3470`
- `Plans/Contracts_V0.md:25170`
- `Plans/storage-plan.md:30413`
- `Plans/Automated_Testing_System.md:7242`
- `Plans/bsd_event_oracle_plan.json:2138`

The added review-start source is **one pending candidate**, bringing staged Storage rows from 57 to 58; it does not append a production registry family. It uses the existing actual assignment/run source-value retention rule. All **13 event-history retention bindings** and both `PENDING_RETENTION_DECISION` cells and their exact questions are unchanged. No id was minted: BSD-1350..1364, CV-1350..1364, SP-1350..1365 and ATS-1230 remain the 47 allocated units.

### Whole-lane oracle-plan isolation boundary

| Guard class / extent | Positive and one-defect negative construction | Guard-removal proof |
|---|---|---|
| Current owner/write permission/Stop/writer generation, all 15 families | Change one actual live gate only; original source remains authentic and reader access remains valid. Refresh unrelated expected CAS observations. Stop settlement uses the actual owner decision for its operation class. | NOT_RUN; phase 2, shared tool. |
| Current epoch and run joins, 13 assignment-backed families | Change only live epoch, or only envelope run identity, in distinct cases. Preserve source/payload facts. The replacement-control-only clearance path is independently positive. | NOT_RUN; phase 2, shared tool. |
| Source/envelope and frozen-payload joins, each applicable family/field | Use a schema-valid substituted target field; preserve authentic originals and regenerate unrelated copies/commitments. Null configuration fields remain explicit schema constraints. | NOT_RUN; phase 2, shared tool. |
| Payload/start-body requiredness, exact type/value and closure, whole lane | Exercise the exact schema boundary independently of owner/source equality. Full-writer join cases use schema-valid alternatives. Off pre-creation admission is distinct from payload-domain validation. | NOT_RUN; phase 2 expands inherited/ref/union predicates and proves identical sites separately. |
| Start admission, premature outcome and later terminal-to-start joins | Genuine immutable start with no outcome is positive. Invalid source kind, admission identity, extra result and each later joined field have independent plans. | NOT_RUN; phase 2, shared tool. |
| All other existing guard plans, whole lane | Prior positives/retention remain unchanged; one-defect construction and no stale copy/digest/post-state remain mandatory. | NOT_RUN; phase 2 covers **all 2,324 entries**, not only this round's additions. |

There are **465 added entries**. These are named plans, not executed event fixtures. The shared NUMRULE/date-time and GUARDTOOL dependencies remain open for phase 2. No lane-local serializer, timestamp validator, number cap, oracle implementation or proof engine was added. The recurrence checklist remains a plan-only assessment: identity/source and current-write gaps now have explicit cases; Storage metadata, old-history, exact types, reference resolution, stored-part sizes, access/custody and honest grades remain planned as before. Only static structure/schema probes run in phase 1.

### Re-grade at the fixed normative head

All **15 families / 180 cells** were re-graded, with corrected criterion-specific path/line/quotation evidence and eight final normative-file SHA-256 values in `W3D-self-grade.json`.

| Extent | Before review round / after fix |
|---|---|
| `bsd.assignment_started`, C4 | Reviewer **CONFLICT → PASS**: exact resolved-mode schema and static probes now match the owner. |
| All other C4 cells and all C2 cells | **PASS → PASS**, structural owner/schema facts only. |
| C1, all 15 | **ABSENT → ABSENT**, intentionally unadmitted. |
| C3 and C5–C12, all 15 | **PARTIAL → PARTIAL**. Contract/plan fixes do not claim behavioral, native or guard-isolation proof. The two pending C7 questions remain open. |

### Current phase-1 checks

Each command, exit code, pre-run available memory, elapsed time, absolute log path and SHA-256 is in `W3D-p1fix1-checks.json`. All generators/checkers ran one at a time using the copied, SHA-256-verified 15-file currentness edition. Only the edited configured owner shard directories changed: `automated_testing_system`, `contracts_v0`, `storage-plan`; BSD remains outside the sharding source list.

| Check | Exit | Log SHA-256 |
|---|---:|---|
| `phase1-fix-check-complete` | 0 | `c7db0a4fe7ec5ca9d49f1eb8dc0448a469a258061dc5e9dfc006bb0dc7d5500f` |
| `shard-generate` | 0 | `0097f44a100929b5fcc967352e31e0a28f4a8974cb0027f58fdf4df24ed776d3` |
| `index-generate-final` | 0 | `e9cb696a1d4ee36cd9c2d9d3123d81e840a07061fc15031d7e53ab7d7437062c` |
| `shard-check` | 0 | `d697ac77c260ee1fbe5007467d179c832c4c197ffc685d08b78f338e04ff7fdc` |
| `index-validate` | 0 | `9ad68e6ad1aa4ff9cd3d3b070e4efee8d78efe1bd21d9ee0aca39e40bc29449b` |
| `bsd-existing-tests` | 1 | `869b12943b6e16086d7246e0972649af23c86c5ca1c53e3d8c2ee6020f4399c2` |
| `assistant-contract-check` | 1 | `0fbdb184c5357a0f01e053a638f6b029c270ac7b2e8f645f356f0aa780e33545` |
| `shared-runtime-selftest` | 0 | `6064a1454776e6f9cdec906eeb1453f1652e74f79bee69ee1719fec58d184027` |
| `baseline-three-failures` | 0 | `98f5f07c3f615b63e2e89f36ad28f4dbb00c4c52177bb784add5aeb68cd6f0ea` |
| `structural-check-final` | 0 | `2b0a33018c85434fa886109e0a9d3ce2185e07a31bf76ef526ab41567650b7ee` |
| `git-diff-check` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

Index generate/validate top-level status is `pass`. The closure suite still runs 41 tests with exactly the three reviewed baseline failures and no errors; the three selected failures were reproduced again from exact frozen-base bytes. Assistant inspection remains the expected `gaps_found` exit 1 from the 51 unadmitted Browser candidates, with `errors=[]` and `projects_refresh_static_failures=[]`. The shared-runtime self-test passes. No test/checker was changed.

Two initial scratch-audit assertions were corrected: the new-definition schema probe initially also selected the top-level union, and a plan inventory assertion initially assumed every preserved shared-rule refusal used the literal label `reject`. The final audit isolates the definition and preserves the existing documented rejection labels; it passes without changing product schemas or relaxing a repository checker for either issue. All attempts and exits remain in the check record.

Evidence directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3D/p1fix1/`. `fix-coverage.json` records each family and its new guard ids; compact copy `W3D-p1fix1-coverage.json`. The report and complete self-grade are copied back to `drafts/W3D/`. The phase-1 evidence manifest hashes retained reproducibility scripts and logs.

**Stopped:** no fix cell stopped, no finding disputed. The two existing retention questions remain pending exactly as quoted above. The next action is the lead's phase-2 foundation rebase and executable-oracle work. No admission, registry append, Decision Log change, governance reseal, `main` push, pm-mail or subagent. The fix worktree is removed with its literal path after the pushed handoff.


## Wave 3 phase 2: findings and responses

Phase-2 worker for lane W3D (Back Seat Driver, 15 rows). Branch `plans/ea-w3-back-seat-driver-20261105`,
start `a6749a55292b1bd9e17f41c36d32c88a6e098c9c`. Two gated merges, in order, each `--no-ff`:

1. `acc2c56d49` merges the gated guard tool `004bdedd632d9463f3535190a6ed5772338cdce1` (11 files, unedited).
2. `123efc3c99` merges the gated NUMRULE head `58c2816ff33365384d4039553f5efdb5370930e6`. The 163 conflicts
   were all under `Plans/_shards/**` and `Plans/.plan_index/**` and were resolved by regeneration, never by hand.
   Every NUMRULE file is byte-identical to `58c2816ff3` and every guard-tool file to `004bdedd63`
   (`git diff --name-only <gated> HEAD -- <files>` is empty for both sets). No rebase; `main` never pushed.

### Executable oracles

`scripts/pm_w3d_bsd_events.py` is the complete checker over the 15 families; `scripts/pm_w3d_bsd_rows.py`
is the row inventory and `scripts/pm-w3d-table-generate.py` generates the Method B table modules
(`scripts/pm_w3d_bsd_table_*.py`, 249 tables = 30 small + 219 chunks of at most 8 rows, 1641 rows). Every refusal goes through a named guard row evaluated in
row order on an observation the checker derives from the complete boundary input. The checker builds a
complete world (native owner decision, captured source, payload, envelope, admission, operation, packs,
custody/receipt, head, retry, publication, retained read, replay, withdrawal) and regenerates every
unrelated copy/digest/commitment through the valid builder, so each negative carries exactly one defect.

Complete checker result (`python3 scripts/pm_w3d_bsd_events.py`): **status pass**, 15 families,
**235 positives, 4218 negatives, 4203 single-row, 15 declared multi-row, 0 mismatches, 0 unresolved refs**.
The 15 multi-row cases are schema/type-confusion witnesses where one wrong-type value legitimately trips
the type row and a dependent keyword row; each is declared `multi=True`. Every reachable row has a
single-defect witness in every family; the witness-requirement is asserted by the checker itself.

### Guard tables and the gated tool

`scripts/pm_w3d_bsd_guard_suites.py` collects the checker's observations (4453 cases, 39914 records) and
builds one Method B suite per table. Per the lead's 2026-11-14 directive, every table larger than 8 rows is
split in the generator (`scripts/pm-w3d-table-generate.py`) into chunks of at most 8 rows, keeping every row
and the checker's first-refusal order; each row keeps its own single-defect witness. This yields **249 tables
(30 small + 219 chunks), 1641 rows**: 225 witness tables and 24 entailed tables (below).
`scripts/pm_w3d_bsd_guard_chunked.py` runs the gated tool on each witness table at concurrency 4, each run
under `systemd-run --user --scope -p MemoryMax=2G -p MemorySwapMax=0`, as one long-job (9m28s). The six
already-PASSed small tables (cas, eligibility, replay, retry, scan, withdrawal) are reused only after verifying
the table module is byte-identical to the generator render (SHA-256 unchanged) and the rebuilt suite's
control/negative digests match the stored report (suite inputs unchanged). The tool's own per-table summaries
are in the evidence directory. **Credit is exactly what the tool reports.**

**Gated-tool result: all 225 witness tables PASS — 1617 reachable rows, each refused first at exactly its row
by one single-defect witness (1617 negatives, 225 controls, 43860 evaluations, 87945 factories); 0 unproved
guards, 0 failures, 0 masked negatives, 0 duplicates.** The remaining 24 rows are entailed (no single-defect
witness by construction) and carry the written proofs below. The chunking leaves the complete checker
unchanged: 235 positives / 4218 negatives / 4203 single-row / 15 multi-row / 0 mismatches / 0 unresolved refs.

**Lead point 1 (real predicates) — open item, honest status:** the current table predicates read one
boolean observation per row (`value[field] is not True`); the real comparison logic lives in the
checker's observation derivation, which the gated tool does not analyse because importing the shared
`pm_event_numbers`/`pm_event_datetime` modules into a scanned predicate module fails the tool's static
stop (those modules use `getattr`/`exec`/`re.ASCII`). The lead's recheck bar requires each guard row to
be the real predicate the tool analyses. The mutation proof below is lane-local evidence that the rows
are real guards, but the gated-tool real-predicate certification requires rearchitecting the predicates
to pure comparisons over fixture reference data (the DG6B pattern). That rearchitecture is the remaining
phase-2 work and is **not** claimed as done here.

Entailed rows (no single-defect witness by construction) each sit alone in their own table with a written
proof naming the earlier row/schema clause that always refuses first:

| Table | Row | Proof (earlier refusal) |
|---|---|---|
| `event_arity_entailed` | `ID02_event_components` | ID03/ID04/ID05/ID06 each require a five-part event_id whose indexed component equals an exact lowercase-hex preimage (`obs_identity`). |
| `key_arity_entailed` | `ID09_key_components` | ID10/ID11 each require a three-part key whose indexed component equals an exact lowercase-hex preimage (`obs_identity`). |
| `operation_size_entailed` | `OZ01_operation_size` | operation stores only refs/identity (SP-1350); every inline field is schema-bounded or joined earlier at OP03/OP04/OP05/OP06 or refused by EN17/ID rows. |
| `checkpoint_type_entailed` | `CP03_checkpoint_type` | `selected_event_type` is a schema const; any other value refused by CP01_root_schema. |
| `checkpoint_consumer_entailed` | `CP05_checkpoint_consumer` | `consumer_id` is a schema const; refused by CP01_root_schema. |
| `checkpoint_snapshot_entailed` | `CP06_token_snapshot` | `durable_read_token` is closed with exactly the nine required fields; extra/missing refused by CP01_root_schema. |
| `checkpoint_size_entailed` | `CZ01_checkpoint_size` | checkpoint stores only token/cursor/identity; unbounded token fields joined at CP08/CP09/CP14, others schema-bounded. |
| `foreign_original_entailed` | `HI08_not_foreign` | a foreign storage_instance_id changes the event_id preimage; HI05_original_verifies recomputes and refuses first (`frozen_verify`). |
| `source_logical_schema_entailed_<slug>` | `SR03_wrapper_logical_schema` | `logical_schema_id`/`version` are schema consts on each source wrapper; refused by SR01_wrapper_schema. |
| `start_premature_result_entailed` | `SR26_start_no_premature_result` | result/latency_ms/no_call_reason/usage_attempt_ref are not members of the closed review_start schema; refused by start_body.closed. |

Schema-entailed payload keyword rows are omitted at generation with the reason recorded: `minLength` where a
pattern already requires the minimum, and `maxLength` for the fixed-length sha256 pattern `^[0-9a-f]{64}$`.
`PK10_source_body_clocks` is only a witness row for source kinds whose logical schema has a timestamp
(finding/review_cycle/quarantine/workflow_binding); derived from the schemas, not a fixture flag.

### Mutation proof (lead point 2 / standing check 11)

`scripts/pm_w3d_bsd_mutation_proof.py` weakens 12 different guards one at a time (forces the row's
observation to pass), rebuilds the row's single-defect witness and runs it through the complete checker.
**Result: pass, 12/12.** For every guard: baseline refused at exactly that row; weakened → witness no longer
refused at that row (accepted); restored → refused at exactly that row again. Guards covered: AD03_replay_writer,
EN02_occurred_clock, EN05_sequence_uint64, ID07_operation_recipe, PK02_pack_digest, RC08_full_value,
HI01_receipt_present, HI07_no_receipt_created, EL01_not_off, SR09_sem_newer_generation, SR08_sem_revision_cas,
SR24_start_admission_identity.

### Numbers (CV-1100/SP-1100/SP-1101)

- `python3 scripts/pm_event_numbers.py --self-test --scope numbers`: **exit 0, `"status": "pass"`, 276 positives.**
- `scripts/pm_w3d_bsd_numbers.py` runs the shared corpus through the complete checker at every integer slot
  (producer_sequence_id, sequence_id, payload.policy_revision, retained original): **status pass, 0 disagreements,
  0 untracked exceptions.** A 4,400-digit integer (`10**4400-1`) is refused with a code at the envelope row on
  every route, never raises (`exact_integer_digits()` context). `2**64` is refused by `storage_uint64`. No
  lane-local bound: the checker calls `storage_uint64`/`current_integer`/`producer_semantic_digest`/
  `full_value_commitment`/`storage_value_bytes`/`qualified_jcs`/`RetainedDispatcher`.

### Timestamps (CV-1101)

Every timestamp field the lane validates goes through `pm_event_datetime.date_time` with its owner profile:

| Field | Profile | Owner | Site |
|---|---|---|---|
| envelope.occurred_at_utc | event_record | CV-317/CV-1101 | EN02_occurred_clock |
| envelope.observed_at_utc | storage_utc_z | CV-253 Storage-assigned | EN03_observed_clock |
| envelope.persisted_at_utc | storage_utc_z | CV-253 Storage-assigned | EN04_persisted_clock |
| receipt.acknowledged_at_utc | event_record | CV-1101 EventRecord (AppendReceipt plain `format: date-time`); CV-253 binds only observed/persisted | RC16_ack_clock |
| logical source body created_at/updated_at | event_record | existing logical BSD schema | PK10_source_body_clocks |

Negatives cover missing zone, hour 24, trailing LF, Feb 30, space separator, invalid leap second (occurred),
and +00:00/lowercase-z/-00:00/nonzero-offset (envelope observed/persisted only). The receipt `acknowledged_at_utc`
takes the EventRecord profile: positives accept +00:00, lowercase-z and a nonzero offset; negatives are missing zone
and trailing LF. The date-time inventory gate
(`scripts/pm_event_datetime_inventory.py`) exits 1 with **85 hash-drift rows** (53 unclassified_mentioning_container,
30 unreadable_mentioning_container, 2 stale_scan_exclusion; 233 nodes, 0 unclassified nodes; only 1 names a BSD
file). Per lead addendum 2 this is lane-tree drift from Plans edits; the inventory/exclusions are NUMRULE files
and are not edited; `datetime_validator` and the gate run at batch-3 integration. Recorded, not credited.

### Retained reads (SP-1101, batch 2 fix 1)

`SealedOwner.authenticated_original` selects the recipe only from the one independently sealed receipt for that
exact original: none → `original_unavailable`, several → `recipe_ambiguous`, a receipt bound to another original
fails the binding join. `perform_retained_read` performs the actual read on a private copy and **snapshots the
sealed store and bytes before and after** — no fixture flag decides the observation. A misbehaving reader that
mints a receipt (`reader_kind=writes_receipt`) or alters bytes (`reader_kind=alters_bytes`) is caught by the
snapshot (HI07/HI06). The caller override is passed through the shared `RetainedDispatcher.resolve(recipe_override=...)`
and `dispatcher_agrees` cross-checks the dispatcher against HI01–HI05/HI13 on every read case. Negatives: missing
receipt (HI01), ambiguous (HI02), wrong original (HI03), unknown recipe (HI04), substituted bytes (HI05),
byte-altering reader (HI06), receipt-writing reader (HI07), withdrawn/deleted/permission/ref-unavailable, caller
override (HI13), incoherent backup (HI14).

### Retention cells (bound to landed decisions)

- 13 assignment-backed families: `RP-RUNTIME-365D@1.0.0` — Card 1 G13 rule (DL-401) through Storage Case L-3's
  Runtime/run/node/attempt class (`Plans/storage-plan.md:17542` at main) and the policy table at `:18452`.
- `bsd.policy_changed` and `bsd.workflow_binding_created`: **now bound** to `RP-AUTHORITY-INDEFINITE@1.0.0` by
  DL-453 item 1.a (Back Seat Driver, Project editions only), `Plans/storage-plan.md:17638,17642` at main
  `f8b2098608`. The two phase-1 PENDING_RETENTION_DECISION cells are resolved by this landed decision (no longer
  pending): no age/count expiry, explicit Delete Puppet Master project data only, finite disk budgets refuse new
  records under pressure. Updated in BSD-1360/BSD-1364 §7, SP-1365, the six candidate `event_retention_policy_ref`
  rows and the oracle-plan retention objects. No retention question remains for Jared.

### Checks

| Check | Exit | Result |
|---|---:|---|
| complete checker (`pm_w3d_bsd_events.py`) | 0 | pass; 235 pos / 4218 neg / 4203 single / 15 multi / 0 mismatch |
| number self-test (`--scope numbers`) | 0 | pass, 276 positives |
| number corpus through checker | 0 | pass, 0 disagreements, 0 untracked |
| mutation proof (12 guards) | 0 | pass, 12/12 flip+restore |
| gated guard tool (225 witness tables, chunks ≤8 rows) | 0 | all PASS; 1617 reachable rows proved, 0 unproved / 0 failures; 6 small tables reused (table SHA-256 + suite inputs verified unchanged) |
| shard check | 0 | pass, 3095 shards, 99 sources, 0 failures |
| index generate | 0 | pass |
| index validate | 1 | 760 base-drift failures (739 plan_unit_removed_without_ledger_decision, 21 plan_unit_removal_ledger_invalid); **0 name BSD/W3D**; origin/main moved to `290742ce3d` after the branch base — these are units added on main after the base, listed as base failures |
| date-time inventory gate | 1 | 85 hash-drift rows, recorded per addendum 2 (gate runs at integration) |

Regeneration touched only this lane's documents: `Plans/Back_Seat_Driver.md`, `Plans/storage-plan.md`,
`Plans/bsd_event_oracle_plan.json`, `Plans/bsd_event_storage_candidates.json`, the `storage-plan` shard tree and
`.plan_index`. No other owner document's shards changed.

### Grades before/after

Membership stays ABSENT (no admission). Native execution stays NOT_RUN. `positive_negative_oracles` moves from
PARTIAL (plan only) to executable-oracle evidence: the complete checker passes with single-defect witnesses, the
lane-local mutation proof passes 12/12, and the gated tool PASSes all 225 witness tables (1617 reachable rows proved,
0 unproved). The gated-tool real-predicate certification (lead point 1) remains the open item.
`retention` moves from PARTIAL to bound for all 15 families (13 RP-RUNTIME-365D, 2 RP-AUTHORITY-INDEFINITE per DL-453).
The self-grade (`W3D-self-grade.json`) records the per-cell evidence.

**Stopped for Jared:** none. The two phase-1 retention questions are resolved by the landed DL-453 decision.
**Open phase-2 item:** lead point 1 — rearchitect guard rows to real pure predicates the gated tool analyses
(the synthetic observation pattern is not credited at the recheck bar). No admission, registry append, Decision Log
change, governance reseal, `main` push, pm-mail or subagent.
