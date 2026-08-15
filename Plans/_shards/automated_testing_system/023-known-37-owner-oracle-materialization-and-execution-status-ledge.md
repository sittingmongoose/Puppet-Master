# Shard 023: Known-37 owner-oracle materialization and execution-status ledger - 2026-07-18

Source: `Plans/Automated_Testing_System.md`

Source lines: L2258-L2512

Source SHA256: `975472ff73c949fea277805b1317b1f67f56972bbfe401c73c3f38267edac4b3`

---

## Known-37 owner-oracle materialization and execution-status ledger - 2026-07-18

This is canonical acceptance/test-spec prose. `STATICALLY_MATERIALIZED` means the closed Plans contract exists and was checked structurally in this transaction; it is not a fixture, runtime, gate, harness, or certification pass. Every behavioral acceptance case remains `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`; no unchanged checker demonstrated execution of those cases here.

### Static materialization accounting

- `K37-STATIC-01` — `STATICALLY_MATERIALIZED` — The exact 31 authorized new JSON paths exist and parse; the 21 Goal roots and nine standalone schemas are Draft 2020-12 meta-valid; the catalog data validates.
- `K37-STATIC-02` — `STATICALLY_MATERIALIZED` — All 21 Goal roots are self-contained, closed, select their exact event const and schema ID, and carry mechanically identical common definitions.
- `K37-STATIC-03` — `STATICALLY_MATERIALIZED` — The historical Known-37 event-family slice validates at 2.0.0 / 2026-07-18.2 / RET-K37-ASSIGNMENT-001@1.0.0; exactly 37 rows in that bounded slice have revision 2.0.0 and the 23/4/5/3/1/1 retention distribution. This is not a currentness claim for the live 39-row revision `2026-08-04.1`.
- `K37-STATIC-04` — `STATICALLY_MATERIALIZED` — The storage registry validates against the unchanged schema, has exactly 24 policy IDs, and contains the exact requested_effective_runtime and recovery_unavailable_resolution_receipt rows once in both required-family arrays.
- `K37-STATIC-05` — `STATICALLY_MATERIALIZED` — The seven governed v1 reader definitions are byte-semantic deep-equals of the prior active inline definitions, while the seven active roots are v2 writer-only registry selections.
- `K37-STATIC-06` — `STATICALLY_MATERIALIZED` — The two recovery commands each have one exact wiring row, sole runtime handler, typed request/result reference, receipt effect, empty expected-event set, and blocked-state admission prose.
- `K37-STATIC-07` — `STATICALLY_MATERIALIZED` — The retained-inline remaining-nine row schemas and their owner/consumer clauses form a 37/37 historical KNOWN-KERNEL STATIC contract-depth account; the source-dated at-least-248 confirmed persisted-unregistered floor, at-least-40 unresolved exact rows, 68 exclusions, and `UNKNOWN_OPEN` complete denominator remain explicit residuals, and no runtime, fixture, gate, shard, harness, certification, buildability, or closure result is inferred.

### Goal Runtime v2 event acceptance oracles

- `EA-UND-0001-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Append a permission block with exact permission evidence, ordered action IDs containing `request_approval`, and matching CAS; projection becomes `blocked` and exposes the exact cause/safe action.
- `EA-UND-0001-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject unknown blocker/reason/action, missing cause/scope, action set not containing next action, generic `try_anyway`, or block from a terminal state.
- `EA-UND-0002-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Cancel a running mutated Goal only after referenced settlements are durable; projection becomes terminal `cancelled`.
- `EA-UND-0002-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject `mutation_started=false` with rollback refs, true with empty settlement refs, missing cancellation scope, or cancellation of terminal Goal.
- `EA-UND-0003-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Record a child `running->completed` edge with receipt ref; parent revision advances while parent status remains unchanged.
- `EA-UND-0003-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject equal/unknown child states, completed child without receipt, illegal child edge, or any attempt to set parent completion in this payload.
- `EA-UND-0004-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — From `verifying`, validate canonical completion receipt, exhaustive satisfied/not-applicable criteria, passing/waived validators, then commit `completed`.
- `EA-UND-0004-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject missing/corrupt receipt, unsatisfied/deferred criterion, failed/blocked/unwaived skipped validator, worker claim, projection substitute, or wrong source state.
- `EA-UND-0005-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Create previously absent Goal at revision 1 with verified control-envelope hash, non-empty criteria, exact scope/budget/model policy; projection is `created`.
- `EA-UND-0005-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject expected revision, revision other than 1, duplicate Goal ID, hash mismatch, null optional, unknown enum, or write scope without authority evidence.
- `EA-UND-0006-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Record a standard-tier no-mutation optional-check degradation with risks/actions and exception evidence; projection is `degraded`, not success.
- `EA-UND-0006-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject empty risks/actions, strong-tier required-check degradation, missing exception/approval proof, degradation from a fenced/terminal state, or any completion claim.
- `EA-UND-0007-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Capture current source evidence with valid span/hash and matching outer/inner redaction; evidence index advances while state is preserved.
- `EA-UND-0007-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject wrong hash syntax, invalid locator branch, artifact snapshot without snapshot ref, raw secret, redaction mismatch, unknown currentness used as proof, or any retention value invented by fallback.
- `EA-UND-0008-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Append `scheduled->running` with a non-empty task delta and artifact hashes; second identical fingerprint includes repeat count/marker and remains visible.
- `EA-UND-0008-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject disallowed state pair, empty task delta, repeat>=2 without marker, marker with repeat<2, stale status_before, or use of progressed to claim blocked/completed.
- `EA-UND-0009-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Record a validated verification or completion receipt with complete child/WorkNode refs and passing outputs; state remains unchanged.
- `EA-UND-0009-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject missing receipt, invalid certifier enum, certified decision with failed output, exception without approval, incomplete declared dependency receipts, or treating receipt-recorded as Goal completion.
- `EA-UND-0010-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Replan running Goal for scope reduction, decide every affected child, preserve only revalidated evidence, and commit `running` at the new revision.
- `EA-UND-0010-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject new revision mismatch, missing/extra child decision, unknown interruption/action, stale evidence, terminal/limit source, or child steering without referenced disposition.
- `EA-UND-0011-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Schedule a created Goal with `dispatch`, due eligibility, queue, budget snapshot, writer storage, current permission, and resolved recovery truth.
- `EA-UND-0011-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject dispatch without queue/due time/admission evidence, unknown priority/reason/action, stale CAS, viewer/blocked storage, unknown recovery, or scheduling a terminal Goal.
- `EA-UND-0012-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Stop a running Goal at a validated safe point after durable child/tool settlement, with `resumable=true`; projection is fenced `stopped`.
- `EA-UND-0012-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject resumable without safe point, before-mutation with settlements, unsettled after-mutation as resumable, unknown stop reason/boundary, or treating stop as cancellation/completion.
- `EA-UND-0013-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Record a permission check `blocked/approval_required` by output/log refs and block evidence; state is preserved pending named block event.
- `EA-UND-0013-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject embedded tool output/secret, failed/unknown without log, approval-required without evidence, deny+passed, unknown check enum, or direct state mutation.
- `EA-UND-0014-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Apply one exact scope delta with previous/new revision relation, mark affected child stale, and fence dispatch pending replan.
- `EA-UND-0014-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject zero deltas, revision mismatch, child in active and stale sets, malformed delta branch, update during verifying/terminal, or implicit child re-steer.
- `EA-UND-0015-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Record passed verification with cycle ID, verifier, closures, no findings/risks; projection is `verifying` and still awaits completion event.
- `EA-UND-0015-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject no cycle ID, passed with findings/risks, failed without finding, blocked without risk/block evidence, third repeated strong failure without adjudicator, or implicit completion.
- `EA-UND-0016-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Block a running GoalRun with validated block receipt, preserved work, exact scope and owner-valid action set; projection becomes `blocked`.
- `EA-UND-0016-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject missing receipt, empty actions, invalid recovery action, preserved mutation omitted, blocked update with no new evidence, or block from terminal/stopped run.
- `EA-UND-0017-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Cancel a running mutated GoalRun after durable settlement/rollback evidence; projection becomes terminal `cancelled`.
- `EA-UND-0017-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject activation-aborted with mutation, false mutation with refs, true mutation without settlement, terminal source, or settlement self-report without referenced record.
- `EA-UND-0018-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — From `verifying`, validate certification receipt, complete WorkNode receipts, passing/waived validators, empty risks, and commit `certified`.
- `EA-UND-0018-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject worker/projection claim, missing receipt, incomplete WorkNode refs, certified with risks, exception without risk+approval, failed validator, or wrong source state.
- `EA-UND-0019-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Replan failed-verification run to a distinct WorkGraph, increment generation, disposition every affected node, and commit `repairing`.
- `EA-UND-0019-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject same graph refs, skipped generation, unpaired affected node, unknown disposition/action, ready/terminal source, or WorkNode dispatch from this event itself.
- `EA-UND-0020-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — At `start_event_pending`, validate activation receipt and exact accepted active requests, append once, then atomically expose `active/running`. Alias `GoalRunStarted` normalizes with evidence.
- `EA-UND-0020-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject partial/mixed required set, mutation requests under read-only mode, missing authority/identity/budget/storage proof, `BuildStarted`, duplicate with different digest, or any pre-append dispatch/charge.
- `EA-UND-0021-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Stop a running GoalRun with settled children and validated safe point; projection becomes fenced resumable `stopped`.
- `EA-UND-0021-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject resumable without safe point/current admission evidence, unsettled child work, unknown reason, terminal source, or silent resume without new valid replan revision.

### Goal Runtime common outcomes

- `GOAL-COMMON-01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Wrong/missing row schema ID, wrong event const, extra property, null in non-null field, unknown enum, malformed conditional branch => Reject validation; append nothing.
- `GOAL-COMMON-02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Outer/inner project, account, actor, correlation, causation, event type, schema, run, or optional thread join conflict => Reject `identity_mismatch`; append nothing.
- `GOAL-COMMON-03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Missing foreign ref or referenced record fails its owner schema/currentness check => Reject `unresolved_reference`; append nothing.
- `GOAL-COMMON-04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Stale `expected_goal_revision` => Return `revision_conflict`; append and projection unchanged.
- `GOAL-COMMON-05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Duplicate same identity/digest => Return original durable result; no second append/transition/side effect.
- `GOAL-COMMON-06` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Duplicate same identity/different digest => Return `idempotency_conflict`; append and projection unchanged.
- `GOAL-COMMON-07` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Dedupe proof unavailable => Return `dedupe_unavailable`; append nothing, schedule nothing, certify nothing.
- `GOAL-COMMON-08` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Unknown event/schema/version or unsupported EventRecord reader => Quarantine/refuse live projection without checkpoint advance; no best-effort history.
- `GOAL-COMMON-09` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Raw or unhandled secret => Reject before append; no redaction transform is used to legitimize the write.
- `GOAL-COMMON-10` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Illegal lifecycle edge or terminal-state mutation => Reject `illegal_transition`; append nothing.
- `GOAL-COMMON-11` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Storage `viewer` => Frozen historical read only at one proven high-water mark; no producer, scheduler, projector writer, receipt writer, permission action, provider call, or durable/external mutation.
- `GOAL-COMMON-12` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Storage/root/integrity/recovery truth unknown => Goal/GoalRun is blocked or remains unknown; no mutation/certification. A disposable survivor projection may be `degraded` only with explicit recovery provenance and never as receipt authority.
- `GOAL-COMMON-13` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Permission denial/approval required => Named `goal.blocked`/`goal_run.blocked`, exact permission evidence and actions; never failed or complete; approval cannot widen a Storage/FileSafe block.
- `GOAL-COMMON-14` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Verifier unavailable => Lightweight may degrade with receipt/evidence; standard only if no mutation/required check affected; strong blocks. Never silently certifies.
- `GOAL-COMMON-15` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Unknown consequential choice outside `EA-DEV-K37-001` => Record `SAME_CLASS_BLOCKER` and stop before choosing.

### Known-37 retention assignment acceptance matrix (RET-K37-ASSIGNMENT-001@1.0.0)

- `P1` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — **Catalog topology:** exactly one active catalog exists at `storage_value_registry.json#/retention_policies`; baseline 21 plus the three exact additions equals 24 unique IDs.
- `P2` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — **Schema closure:** the event-family registry root requires `RET-K37-ASSIGNMENT-001@1.0.0`; every family requires the closed three-field ref; additional ref fields fail.
- `P3` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — **Historical Known-37 set equality:** obligation IDs are exactly `EA-UND-0001-RET..EA-UND-0037-RET`; application IDs are exactly `EA-PA-0001..0037`; every accepted event/family pair occurs once; assignment counts are exactly `23+4+5+3+1+1=37`. This oracle does not claim equality with the live 39-row registry.
- `P4` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — **Referential equality:** every ref resolves to exactly one policy record at version `1.0.0`; all record fields equal §3 or existing accepted canon.
- `P5` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — **Runtime fixture:** `run.started`, `goal_run.started`, and `goal_run.replanned` resolve to 31,536,000 seconds after `run_completion`, 1,000,000/run plus 5,000,000/project, hold protection, successor compaction.
- `P6` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — **Seglog fixture:** `seglog.event_appended` resolves to 604,800 seconds from creation, 500,000/instance, and compact-only expired unheld rows.
- `P7` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — **Restore fixture:** all five `restore_point.*` rows resolve to the project-resolvable release-anchored policy; `restore_point.expired.payload.retention_policy_ref` equals its row policy ID.
- `P8` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — **Authority fixture:** blocked, receipt, audit, certification, deletion-tombstone, hold, integrity, and quarantine rows assigned indefinite cannot be count-evicted under pressure.
- `P9` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — **Migration fixture:** exact source revision migrates once, leaves EventRecord bytes/identity unchanged, creates one existing-family migration receipt, and a rerun returns the recorded terminal result without rebinding or semantic duplication.
- `N1` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject a missing ref; a scalar ref; an extra ref property; unknown catalog ID; unknown policy ID; wrong policy version; duplicate policy record; or duplicate event assignment.
- `N2` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject `RP-DELIVERY-365D` for any runtime row: its terminal-transition anchor and 100,000/project ceiling are non-equivalent.
- `N3` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject `RP-SAFEPOINT-90D-AFTER-RELEASE` for the five restore-point rows: their payloads do not require a run identity, so its 64/run primary cap is not deterministically enforceable.
- `N4` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject any TTL, anchor, count scope/limit, overflow, hold, or expiry mismatch against the exact record.
- `N5` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject policy inference from `goal.*`, `goal_run.*`, `restore_point.*`, `storage.*`, event/family name, producer, owner, filename, key, mtime, payload timestamp, array position, or a similar existing family.
- `N6` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject an unapproved outside-kernel event, missing known row, extra row, changed family ID, changed semantic owner, or event-type alias as assignment-set membership.
- `N7` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject held-row eviction; count eviction of indefinite authority; expiry before inclusive `anchor + ttl`; or compaction while a legal, recovery, preserved/recent-run, live-ref, backup, rollback, or maintenance anchor remains.
- `N8` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject payload/row conflation: `storage.retention_hold_changed.payload.policy_ref` cannot replace the row ref; `goal.evidence_captured` payload policy cannot shorten the row policy; `restore_point.expired` cannot acknowledge a mismatched payload policy.
- `N9` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject a same-revision ref mutation, same-version policy rewrite, historical Known-37 migration without exact source currentness/backup/receipt, partial Known-37 publication, or a blocked/rolled-back migration exposed as current. This does not authorize publication of the live 39-row registry as complete.
- `N10` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Any unknown, stale, conflicting, non-equivalent, or unprovable case quarantines without checkpoint advance and blocks destructive eligibility. Conservative indefinite preservation is a failure posture, not a fabricated successful ref.

`P6` and `P7` consume the full row-local planned/static catalogs registered under **K37 retained-inline restore and seglog EventRecord oracles**: the `RSC-*`, `RSD-*`, `RSE-*`, and `SEA-*` sets plus the `restore_point.applied` first/replay/refused/failed/source-preservation cases. Retention lookup alone cannot satisfy their payload, envelope, transition, replay, no-append, or zero-effect obligations, and none is executable or passed by this prose registration.

### Platform capability positive and negative oracles

- `CAP-POS-001 catalog ref resolves` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Active catalog revision `1` contains one cited active entry; the complete `PlatformCapabilityRef` resolves uniquely and schema validation passes.
- `CAP-POS-002 live precedence` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Valid live evidence says `supports_available`, valid provider/static evidence says `supports_unavailable`; result is `effective_state=available`, `degradation_reason=none`, `resolution_source=live_runtime_discovery`, while all three refs remain in precedence order.
- `CAP-POS-003 provider fallback` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Live evidence is absent because the entry does not require/produce it, valid provider evidence says `supports_degraded`; result is `degraded`, `provider_policy_limited`, selected provider ref.
- `CAP-POS-004 static fallback` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — No higher allowed source exists and valid static evidence says `supports_degraded`; result is `degraded`, `static_baseline_only`, selected baseline ref.
- `CAP-POS-005 explicit negative` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Selected live evidence says `supports_unavailable`; result is `unavailable`, `runtime_absent`, never `unknown`.
- `CAP-POS-006 not requested` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — `requested_state=not_requested` yields only `effective_state=not_evaluated`, `degradation_reason=none`, null selection fields, and an empty evidence array.
- `CAP-POS-007 deterministic bytes` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Two evaluations with byte-identical frozen catalog and evidence inputs produce identical sorted evidence, payload canonical JSON, and EventRecord producer semantic digest.
- `CAP-POS-008 historical replay` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — An event referencing a known superseded immutable revision validates and replays against that revision without recomputation against the active revision.
- `CAP-POS-009 admitted legacy alias` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — One owner-approved `capability_key` alias and complete typed evidence sidecar normalize to the exact v2 ref/payload and record migration provenance.
- `CAP-POS-010 scope identities` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Application evaluation persists outer `project_id=null`; project evaluation persists its one exact project ID; neither duplicates the field inside the payload.
- `CAP-NEG-001 open capability identity` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — raw `capability_key`, display name, unknown ID, or missing catalog tuple used instead of `capability_ref`
- `CAP-NEG-002 stale new-write revision` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — new evaluation begins with a superseded, retired, missing, or mutated catalog revision
- `CAP-NEG-003 unknown requested/effective token` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — provider/model `supported`, legacy boolean/string, `unknown`, or any value outside the two target enums
- `CAP-NEG-004 illegal state pair` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — `not_requested/available`, `required/not_evaluated`, or any nonlisted requested/effective pair
- `CAP-NEG-005 illegal reason product` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — `available/runtime_partial`, `degraded/none`, or reason/source mismatch
- `CAP-NEG-006 insufficient unavailable proof` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — `effective_state=unavailable` with missing evidence or a selected finding other than `supports_unavailable`
- `CAP-NEG-007 evidence ref mismatch` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — provider source paired with runtime receipt, duplicate source kind, selected ref absent from the array, or wrong subject/revision
- `CAP-NEG-008 stale or unverified evidence` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — provider/model `stale|unverified`, mutable local path, missing source revision, or current-time substitution
- `CAP-NEG-009 raw secret` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — token, credential, OAuth value, account root, or other secret-bearing evidence content instead of a ref
- `CAP-NEG-010 same-source owner conflict` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — two live receipts disagree for the same subject and frozen revision
- `CAP-NEG-011 legacy analogy` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — value imported from retired `platform_specs`, fixture-only data, or provider/model enum without registered owner mapping
- `CAP-NEG-012 ambiguous migration` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — absent requested string, unknown alias, raw legacy evidence string without typed sidecar, or payload/outer identity disagreement
- `CAP-NEG-013 extra or omitted field` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — any additional payload/catalog/ref property or omission of a required nullable field
- `CAP-NEG-014 scope conflict` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — application scope with non-null project, project scope without a project, or conflicting outer/payload legacy project identities

### Restore-point corruption owner oracles

- `EA-OC-004-POS-01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — An `available` same-project record with two unequal valid record hashes, no referenced-material fields, matching `record_hash_comparison` evidence, and no extras validates and emits exactly one `record_hash_mismatch` event with `status=corrupt`.
- `EA-OC-004-POS-02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Present hashable record bytes with `expected_hash=null`, valid `observed_hash`, a reproducible decode/schema failure, no referenced-material fields, and matching `record_decode_failure` evidence validate and emit exactly one `unreadable_record` event.
- `EA-OC-004-POS-03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — A valid `available` record with equal record hashes, one present canonical material ref, all four material comparison fields, at least one unequal comparison pair, and matching integrity evidence validates and emits exactly one `corrupt_referenced_material` event.
- `EA-OC-004-POS-04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — A valid `available` record with equal record hashes, one present canonical material ref, no material comparison fields, and matching scope evidence proving the item is outside supported scope validates and emits exactly one `unsupported_content_scope` event.
- `EA-OC-004-POS-05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Re-delivery under the same Contracts-owned EventRecord identity and same semantic digest returns the original append result and creates no second semantic event; same identity with a different digest is `idempotency_conflict`.
- `EA-OC-004-POS-06` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — `MIG-RESTORE-POINT-CORRUPT-PAYLOAD-001@1.0.0` selects the exact local v1-reader pointer for a frozen `/1.0.0` `record_hash_mismatch`, `corrupt_referenced_material`, or `unsupported_content_scope` payload and, with exactly one immutable identity-matching evidence result satisfying section 7.1, produces the exact root-`#` `/2.0.0` compatibility value for the same event identity while the v1 source bytes and semantic event count remain unchanged.
- `EA-OC-004-NEG-01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Missing canonical restore-point record produces no corrupt event and no corrupt state claim.
- `EA-OC-004-NEG-02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Valid record with a ref whose target is absent produces no corrupt event; it stays on the separate missing/unavailable path and the record remains `available`.
- `EA-OC-004-NEG-03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — `reason_code=missing_material`, any fifth token, any generic string, or any alias is rejected/quarantined.
- `EA-OC-004-NEG-04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Remove each required field once; add each forbidden field once; replace each non-null field with null once. Every case is rejected without append/checkpoint advance.
- `EA-OC-004-NEG-05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Swap any `evidence_kind` between reason rows, use an unresolved/stale evidence ref, or make evidence identity disagree with project/restore/material identity. Every case is rejected/quarantined.
- `EA-OC-004-NEG-06` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Use equal record hashes for mismatch, unequal record hashes for a referenced-material branch, or equal material hashes and lengths for corrupt material. Every case is rejected as a wrong branch.
- `EA-OC-004-NEG-07` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Use a wrong project, non-`available` record, ambiguous ref, unknown `referenced_material_field`, or additional payload property. Every case is rejected.
- `EA-OC-004-NEG-08` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Put raw record/material bytes, secret data, credential values, local absolute paths, or an unhandled secret inside the event/evidence ref. Every case is rejected/quarantined.
- `EA-OC-004-NEG-09` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Simultaneously make the record hash mismatch and decode fail; the result must be `record_hash_mismatch`, proving the fixed precedence. Simultaneously corrupt referenced material and make it unsupported; the result must be `corrupt_referenced_material`.
- `EA-OC-004-NEG-10` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Make record/material availability or integrity indeterminate through I/O failure. The result is unknown/quarantined, not missing, unreadable, or corrupt.
- `EA-OC-004-NEG-11` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Attempt a new `/1.0.0` write; mutate the frozen v1 object; alias v1 to v2; use any carrier path, pointer, schema ID, or upgrader identity other than section 3.1; upgrade without exactly one identity-matching immutable evidence result; map a v1 `unreadable_record` while its string `expected_hash` is asserted as trustworthy; omit any v2-required value; retain duplicate inline/ref schemas; or publish the payload successor outside packet 002's complete registry/family-revision transaction. Every case quarantines with `reason=restore_point_corrupt_v1_upgrade_unresolvable` without append or checkpoint advance.

### run.started owner oracles

- `RUN-P01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Exact no-fallback regular start. A regular run with no explicit strategy request, legal `none` overlay, matching requested/effective platform/model/Persona, a valid account pair, and a complete matching snapshot appends one event with `requested_strategy = null`, `strategy = hte`, and `strategy_resolution_reason = regular_hte_default`.
- `RUN-P02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Regular DAE allowed. A regular run with `requested_strategy = dae` and snapshot evidence `dae_allowed == true` appends one event with `strategy = dae` and `regular_dae_allowed`.
- `RUN-P03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Regular DAE deterministic fallback. A regular run with requested DAE and owner evidence `dae_allowed != true` appends one event with `strategy = hte`, `regular_dae_disallowed`, and unchanged requested DAE truth.
- `RUN-P04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Yolo DAE. A yolo run with a DAE-capable effective platform appends one event with `strategy = dae` and `yolo_requires_dae`.
- `RUN-P05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Provider/model/account/Persona fallback. An admitted run with unequal requested/effective joins appends only when the complete snapshot contains owner-valid deterministic evidence for every difference and the inline joins match the resolved snapshot exactly.
- `RUN-P06` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Non-account-backed route. A valid server/profile-backed route appends with both account ID keys present and `null`, while account binding/auth evidence remains in the complete snapshot.
- `RUN-P07` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Replay. Re-delivery of the same semantic start under the same scoped idempotency identity returns/reuses the existing event and preserves one durable start.
- `RUN-P08` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Envelope equality. A project/run/thread/time/account-ref instance whose repetitions and resolutions all agree appends and projects without normalization changes.
- `RUN-P09` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Machine target resolution. A full `pm.requested_effective_runtime@1.0.0` record whose key equals `snapshot_ref`, project partition and ID parse exactly, digest recomputes, every owner ref resolves, and every inline value agrees validates under both the standalone schema and the identical storage-registry value schema.
- `RUN-P10` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Historical stability. After current mode, model, account, provider, or Persona settings change, replay of the event resolves the original stored key and returns the original snapshot bytes and joins; no current value appears in the historical result.
- `RUN-P11` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Governed legacy upgrade. A frozen v1 payload with a section-4 ref to an already-complete immutable target upgrades through `MIG-RUN-STARTED-PAYLOAD-001@1.0.0` to the exact v2 replay representation, preserves source bytes and EventRecord identity, records migration lineage, and does not append another semantic start.
- `RUN-P12` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Coordinated row. The current `event-family-run-started` row is accepted only with packet-002 family/registry revision and retention ref plus packet-005 `/2.0.0` payload schema ref in the same transaction.

### Recovery-unavailable owner-oracle contract

- `P01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Pre-attempt event: a valid event omits `attempt_id`; its anchor stores `attempt_id = null`; its reason is one exact enum member; its action array equals one exact section-5 array; local work is true and all refs resolve.
- `P02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Post-attempt event: a valid event requires one non-empty `attempt_id` equal across blocked episode, event, anchor, request, result, and receipt.
- `P03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reason coverage: one canonical case for each of the five reason values validates; changing only the reason to an unknown value fails.
- `P04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Ordering: every admitted list starts `open_details`, then `locate_and_verify_recovery`, then `replan`; conditional fresh attempt appears only between replan and abandonment; `abandon_recovery` is last.
- `P05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Locate success: current identity/member plus a FileSafe-normalized source and exact owner verification produces `applied`, a committed receipt, `released/resolved`, verified refs/hash/evidence, and no cleanup.
- `P06` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Locate replay: byte-identical request and idempotency key returns the original result/receipt and performs no second release.
- `P07` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Replan release: release occurs only after the existing replan is current-member admitted and durably recorded, with `resolved`.
- `P08` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Fresh successor: conditional membership appears only with all existing isolated baseline preconditions; release waits for a distinct durable successor/baseline receipt and uses `superseded_with_verified_successor`.
- `P09` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Abandon success: current explicit user authority, exact confirmation, preserved-work acknowledgement, and committed receipt produce `released/abandoned_by_user`, with `cleanup_performed = false`.
- `P10` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — UI projection: every GUI/chat/graph/orchestrator consumer renders the exact ordered array and dispatches through the one catalog mapping; the shared UI response points to the domain result and owner receipt.

### run.started negative oracles

- `RUN-N01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject a missing or empty `requested_effective_snapshot_ref`, an unresolvable target, or a compatibility/thin target that lacks any required requested/effective domain.
- `RUN-N02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject inline/snapshot mismatch for any mode, overlay, strategy, platform, model, account, Persona, project, run, thread, or time value.
- `RUN-N03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject omitted required nullable keys; `requested_strategy`, `requested_account_id`, and `effective_account_id` must be present even when `null`.
- `RUN-N04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject `null` for every non-null field and reject empty strings for every ID/ref.
- `RUN-N05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject a fifth runtime mode, eighth overlay, third strategy, seventh strategy-reason token, unknown alias, extra property, or generic free-string reason.
- `RUN-N06` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject `requested_strategy = dae` in ask/plan and reject `requested_strategy = hte` in yolo.
- `RUN-N07` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — For yolo with `dae_allowed != true`, fail before provider spawn with `yolo_requires_dae_provider`; assert that no `run.started` event exists.
- `RUN-N08` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject any mode/overlay pair outside section 5.2, including debug with ask/plan and plan/deep_plan with regular/yolo.
- `RUN-N09` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject an unexplained unequal runtime-mode or overlay pair.
- `RUN-N10` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject an unequal platform/model/account/Persona pair without owner-valid evidence in the complete snapshot.
- `RUN-N11` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject noncanonical model display labels, provider-native account labels as account IDs, and `_persona_id` field aliases.
- `RUN-N12` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject a non-account-backed route with either account ID non-null, and reject an account-backed admitted run with `effective_account_id = null`.
- `RUN-N13` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject payload/envelope project, run, thread, timestamp, or account-ref disagreement; do not repair either side.
- `RUN-N14` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject raw secrets/auth values/local paths in either inline fields or the referenced snapshot.
- `RUN-N15` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject a second append for the same semantic start; quarantine an idempotency-key reuse with a different semantic digest.
- `RUN-N16` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject fixture-only values or current-settings replay reconstruction not attested by an owner/source derivation.
- `RUN-N17` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject a target with the wrong schema path, `$id`, `schema_id`, `schema_version`, key prefix, project partition, snapshot ID grammar, digest grammar, digest value, or key/ref equality; reject a same-key different-byte write as `requested_effective_runtime_identity_conflict`.
- `RUN-N18` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject a target missing any required-present field or any of the six owner refs; reject syntactically present but historically unresolvable owner refs, a missing storage-registry registration, a thin `execution_unit_context`, or a ref that resolves only by filesystem/current-project discovery.
- `RUN-N19` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject reconstruction or backfill from current settings, current provider/model catalogs, current account choice, current Persona, or current runtime policy after target loss; report historical unavailability and quarantine instead.
- `RUN-N20` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject new writes using payload `/1.0.0`, a v1 payload with invented defaults, an in-place v1 rewrite, or a v1 upgrade without an exact complete section-4 target; use `run_started_v1_upgrade_unresolvable` and do not advance projection.
- `RUN-N21` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject a packet-002/005 split row: v2 family with v1 payload, v2 payload with family revision 1.0.0 or missing retention ref, duplicate embedded and referenced payload schemas, or any payload schema ID/ref mismatch.

### Recovery-unavailable negative oracles

- `N01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — pre-attempt event/request/result with any `attempt_id`, including null or synthesized text;
- `N02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — post-attempt event/request/result missing `attempt_id`, carrying null/empty, or disagreeing with the current prior attempt;
- `N03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — unknown or missing reason; wrong reason-to-current-event equality; or promotion of `state_changed`, `safe_point_missing`, `baseline_stale`, or another nearby token;
- `N04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — empty/duplicate/unordered action list, absent current membership, or any forbidden member;
- `N05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — `start_fresh_attempt` membership without a fully satisfiable isolated non-safe-point target contract;
- `N06` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — restore or ordinary retry while the anchor is `recovery_unavailable`;
- `N07` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — stale blocked sequence, anchor, snapshot set, reason, permission, or projection;
- `N08` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — raw path/raw bytes/moving ref as `recovery_source_ref`, or owner verification with missing identity/equality evidence;
- `N09` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — locate result claiming applied with uncommitted/missing receipt, no verified hash/evidence, a non-null reason, or a non-released anchor;
- `N10` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — abandonment without actor-bound durable confirmation, exact confirmation constant, preserved-work acknowledgement, current membership, or committed receipt;
- `N11` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — abandonment mapped to `abort_run`, cleanup, deletion, worktree detachment, or a higher-level terminal state;
- `N12` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — conflicting reuse of an idempotency key or replay that changes result, receipt, release reason, actor, source, or snapshot refs;
- `N13` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — failed/refused/unknown domain result projected as UI success;
- `N14` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — age, exit, archive, run completion, worktree unbinding, compaction, retention pressure, or cleanup releasing the anchor;
- `N15` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — any new EventRecord family, generic `*.command_applied` event, FileSafe-local command namespace, or second handler.


### Storage boot, integrity, and recovery owner oracles

- `BR-P01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — all six enum members validate in otherwise conforming fixtures and map one-to-one to the six approved semantic classes.
- `BR-P02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — two input permutations normalize to identical ordered arrays and the same `recovery_set_id`; the persisted payload is already canonical.
- `BR-P03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — same-episode retry returns the byte-equivalent prior result/EventRecord and append count remains one.
- `BR-P04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — a later episode with the exact same semantic work set has a higher epoch, new set ID, and direct `repeat_of` to the earliest event.
- `BR-P05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — a final active-segment ref resolves to the manifest row/hash and projector admission occurs only after reconciliation and durable barrier append.
- `BR-N01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — unknown, generic repair/salvage, maintenance-enum-only, duplicate, empty, unsorted, or more-than-bound items reject.
- `BR-N02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — negative generation/epoch, noncanonical decimal, malformed segment ref, `opening` presented as writable final state, or ref/hash/manifest mismatch rejects.
- `BR-N03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — no integrity/recovery evidence, a kind not attested by evidence/journal, or a referenced result from another storage instance rejects.
- `BR-N04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — same set ID/different input is conflict; same-episode duplicate append rejects; later exact repeat without `repeat_of`, with a chain, or pointing anywhere but the earliest matching event rejects.
- `BR-N05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — CRC/range, survivor, recovery-aftermath, or disclosure fields attributed to this event reject; projector/mutation admission before durable convergence rejects.
- `IN-P01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — seeded bit flips at prefix, header, payload, segment, manifest, watermark, and sequence boundaries yield the exact corresponding token only after the required evidence verifies.
- `IN-P02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — a header-CRC mismatch includes both uint32 CRCs, exact byte precision, no event refs, and reproducible offsets.
- `IN-P03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — a payload-CRC mismatch with verified header identity may use `exact_event` and carries matching byte, one-sequence, and event-ref evidence.
- `IN-P04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — no later candidate produces `unknown_segment_remainder`, EOF as `next_good_offset`, the exact remainder byte tuple, no invented sequence/event identity, and a conservative watermark relation.
- `IN-P05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — identical evidence and content-addressed report return the same `integrity_id` and original event.
- `IN-N01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — unknown/alias failure, segment, watermark, or precision member rejects; similarly named maintenance enums are not aliases.
- `IN-N02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — lone CRC, out-of-range CRC, CRC on a forbidden class, impossible offsets, empty/reversed range, unsorted/duplicate refs, or precision/field mismatch rejects.
- `IN-N03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — header failure with event refs, exact-event precision without verified frame identity, or fabricated advisory-index identity rejects.
- `IN-N04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — possible acknowledged loss labeled wholly-above, manifest overriding disagreeing bytes, or unknown remainder converted to exact/bounded proof rejects and blocks mutation.
- `IN-N05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — recovery action, survivor, receipt, disclosure, `repeat_of`, or projector/checkpoint effect attributed to detection rejects.
- `RA-P01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — each six-action fixture validates only its exact matrix row, exact checkpoint/projection pair, integrity-link rule, and disclosure value.
- `RA-P02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — truncation changes length/hash exactly to the verified prefix, records the exact tail range, stays wholly above watermark, and preserves the verified checkpoint.
- `RA-P03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — proven exclusion leaves bytes unchanged, changes manifest authority, records exact ranges/gaps, yields the reproducible survivor digest, and forces derived-state rebuild.
- `RA-P04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — verified backup restore round-trips hashes/length/boundary evidence and sets disclosure from the exact rollback-loss condition.
- `RA-P05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — identical canonical recovery input returns the original receipt/event with one physical effect and one semantic append.
- `RA-P06` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — barrier receipt and event append precede any permitted projector resume/rebuild or mutation admission.
- `RA-N01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — unknown/alias action, checkpoint, or projection member; forbidden action/aftermath combination; generic repair/salvage; or maintenance-enum substitution rejects.
- `RA-N02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — missing/mismatched integrity link, adoption carrying a link, truncation not wholly above watermark, block action with changed bytes/manifest, or exclusion with unknown precision rejects.
- `RA-N03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — noncanonical, overlapping, reversed, duplicate, or over-bound ranges/gaps; recovery use of `retention_compaction`; false hash/length; or unverifiable survivor rejects.
- `RA-N04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — missing/unsynced/circular self-append receipt, receipt/result mismatch, suppressed required disclosure, or backup-loss disclosure false rejects.
- `RA-N05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — same recovery ID/different canonical input is conflict; retry with a second physical effect/event rejects; third-state crash ambiguity blocks.
- `RA-N06` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — projector start/checkpoint advance before convergence, mutation on possible acknowledged loss, fabricated event identity, or advisory index/mtime override rejects.

Deterministic replay, fail-closed quarantine, no checkpoint advance, no duplicate semantic effect, no raw-secret admission, and no authority promotion remain required wherever named above. Static materialization is never substituted for execution evidence.
