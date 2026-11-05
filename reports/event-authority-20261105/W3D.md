# W3D — Back Seat Driver, phase 1 (2026-11-05)

Branch: `plans/ea-w3-back-seat-driver-20261105`. Base: `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Assessed code head: `recorded in the report-only follow-up`.

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

`Plans/bsd_event_payloads.schema.json` supplies fifteen individually closed payload roots. `Plans/bsd_event_storage_contracts.schema.json` supplies the corresponding operation/projection/checkpoint shapes, the nine-field durable token, six original lifecycle wrappers, six current owner heads and a ref-only finding-identity operand manifest. SP-1365 binds the original source/head/operation joins and coherent backup. Original identity operands are captured from the actual owner decision before key computation, so a supplied key/digest cannot stand in for original custody. Existing six logical BSD schemas and the adjacent completed-review summary remain unchanged.

`Plans/bsd_event_storage_candidates.json` stages **57** candidate rows: 45 exact-family operation/projection/checkpoint rows, 6 original lifecycle wrappers and 6 original current heads. They are reviewable value rows outside the production registry. The task prohibits registry-family append, so `Plans/storage_value_registry.json` is byte-identical to base; its families/denominators, SP-318 disposition and materialization status are not extended. Candidate keys, value schema refs, canonical/derived placement, recovery and retention are explicit; real physical admission/migration/disk budgets still require their existing owner gates.

Operation custody uses the existing lifetime identity/receipt protection; derived rows use RP-PROJECTION-3GEN. Neither extends the lifetime/access of linked transcript/output bodies. Every stored part has its own 16 KiB measurement and SP-337 reference route, including frozen producer input and lifecycle bodies. No lane-local number, timestamp, physical-byte or guard-isolation implementation was written.

## Oracle plan and self-grade

`Plans/bsd_event_oracle_plan.json` contains **1859** planned field/predicate entries, each with a positive and a one-defect negative plan, plus per-family retention boundary plans. It covers exact payload fields/types/requiredness/closure, original-source and identity joins, transition-specific guards, original receipts/full values, all Storage-assigned metadata, checkpoint identities/tokens/CAS/coverage, replay-only writer refusals and historical positives, 16 KiB stored-part limits and external bytes, access/deletion/backup, retention, version/currentness and withdrawal. These are plans; they are not executable fixtures or an assertion that single-defect construction or guard removal has already passed.

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
| `Plans/storage-plan.md` | `@@ -29476,0 +29477,1019 @@ ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0` | `SP-1350..SP-1365` |
| `Plans/Automated_Testing_System.md` | `@@ -7236,0 +7237,66 @@ ContractRef: ContractName:Plans/UI_Wiring_Rules.md#UIW-048, ContractName:Plans/U` | `ATS-1230` |

All shared-file changes append new units; no old shared row is reordered or reflowed. Production `storage_value_registry.json` has no hunk. Shards were regenerated through the repo tool, then the plan index through its repo tool. The copied ignored currentness edition matched the shared source file-for-file by SHA-256 (15 files; manifest in evidence). Only edited source documents’ configured shard trees changed. Back_Seat_Driver and these new JSON companions are not in the base sharding_config sources; the existing configured generator was used unchanged. Index output records 47 additional PlanUnits and no WorkNodes/NodeSeeds.

## Checks

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

Commands, elapsed time, pre-run available memory, absolute log paths and output hashes are in `W3D-checks.json` and the copied evidence directory. Structural checks validate the two new schemas, all reachable refs, 47 new PlanUnits, 15 exact outcomes, 57 pending candidates, evidence/token consistency and unchanged protected files. The first structural attempt found missing preserved-token mentions in ATS-1230; the prose was corrected and the final structural run passes. These are static structural checks, not phase-2 event oracles. Existing BSD contract-closure and adjacent shared-runtime checks guard the preserved disabled/non-alias boundaries. No repository test file was edited.

The lane’s generators/checkers ran one at a time. A checker start was refused below 6 GiB; work paused for two minutes and resumed at 14 GiB (above the required 7 GiB). The runner monitors its own active process group and pauses below 6/resumes at 7 on two-minute rechecks; other VM work was not interrupted.

### Baseline failures and expected nonzero inspection status

The existing 41-test closure run reports three failures, and all three reproduce independently at the fetched base f9c5de6561: a hard-coded 342-family expectation versus 344 actual rows; an obsolete definitionless pm.brainstorm.question_bank.v1 expectation; and schedrec_envelope_record_wrong_type expecting a different rejection reason. The relevant test/schema/registry/fixture inputs match base byte-for-byte. W3D-baseline-comparison.json preserves exact cases, messages and input SHA-256 values. No unrelated test was modified. The first comparative harness used a symlink for a root-confined resolver; it was corrected to use the exact base schema bytes and then reproduced all three failures. This comparison did not rerun or certify the entire baseline suite.

Assistant inspection returns gaps_found (exit 1) because 51 pre-existing Browser families remain prepared but unadmitted; errors=[] and projects_refresh_static_failures=[]. This is its documented return condition, not a W3D structural error. The existing shared-runtime self-test passes.

## Handoff

IDs used: **BSD-1350..BSD-1364; CV-1350..CV-1364; SP-1350..SP-1365; ATS-1230**. All assigned ranges were checked free across 528 fetched origin refs (178 distinct owner-document blobs); `W3D-id-audit.json` records the base/maxima. No out-of-block ID was minted.

Next: phase-2 foundation rebase, shared number/date-time helper adoption, executable oracles, shared guard-isolation proof and Sol/Astra review. The two exact retention questions remain open until owner evidence or Jared decides them. Physical registration/migration/budgets, event admission and native availability remain independently gated. No admission, registry-family append, Decision Log change, governance reseal, main push, pm-mail or subagent was performed. The dedicated W3D worktree is removed after the pushed result is copied for handoff.
