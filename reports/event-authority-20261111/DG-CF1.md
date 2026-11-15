# DG-CF1: goal_run.certified CF-01, CF-02, CF-03, CF-04 and CF-05 on the shared TEST_ONLY adapters (stream E, 2026-11-11)

Branch `plans/ea-goal-dg-cf1-20261111`, cut from `origin/plans/ea-goal-own-c3-w5-20261105` at `498e35e153`, with `origin/plans/ea-goal-adapter-20261111` (`62e61fe59a`) merged (`8bbc84a87f`). Nas1, sparse local worktree `/home/sittingmongoose/pm-worktrees/dg-cf1`. Brief: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/DG-FAMILY.md`.

**native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.**

Every owner, value, transaction and record here is TEST_ONLY. Nothing here admits anything, changes the Event registry, adds a Decision Log entry, a retention or deletion policy or a PlanUnit, or touches `Plans/Spec_Lock.json`, `Plans/.evidence/**`, `Plans/auto_decisions.jsonl`, `.gitignore`, NUMRULE, guard-tool or adapter files. No original bank, URI, hash or stored byte was rewritten or restamped. No subagent was used.

## Results at a glance

| Item | Result |
|---|---|
| Oracle run (`scripts/pm_goal_dg_cf1_oracles.py`) | **pass**, exit 0: 6 positives, 195 one-defect negatives, 0 failures (898.9 s) |
| Lane cases | 4 positives (one complete ordered path covering all five groups, plus 3 CF-03 variants), 155 negatives |
| Adopted adapter CF-01 demonstration | 2 positives, 40 negatives, run unchanged inside the corpus |
| CF-01 | 3 positives (1 lane + 2 adopted), 66 negatives (26 lane + 40 adopted) |
| CF-02 | 1 positive, 42 negatives |
| CF-03 | 4 positives, 42 negatives |
| CF-04 | 1 positive, 20 negatives |
| CF-05 | 1 positive, 25 negatives |
| New guards listed for the shared isolation sweep | 144 guard codes, each with the lane negatives that refuse with exactly it (`DG-CF1-guards.json`); 22 sites without a dedicated negative, each named as a duplicate or unreachable |
| Whole roots issued and validated in their realms | native: OriginalCertificationSource, CurrentWorkflowSource, CertificationCandidateResult, OriginalBirthArgument, WorkflowBirthPublication; goal: CurrentGoalArgument, BirthGoalArgument, BindingLowerArgument; standard: DurableStandardRead; producer: AssignmentSource, InvocationSource, ResolverGraphSource, ReferenceSource, CausalSource, OriginalStructuredValue (partition/route), WholeProducerSource; coordinator: Request, BirthRequest, BirthCandidates, StorageBirth, StorageControl, IdentityInput, IdentityResult; event: the producer submission; payload: certified v3 |
| Index validate | exit 1, 126 failures on the branch and 126 on the unedited base against the same origin/main `77bae0c63605d0a6f643aa3f1d8c51c2f3bb7947`: **0 added, 0 removed** |

## Per group

The judge's complete case (`reviews/DG-sol/JUDGE-original-path.md`, "What complete and authentic mean") asks for full valid baseline inputs, independently acquired owner originals, the actual ordered modeled method calls with before and after observations, exact entire candidates, results and receipts, and coherent one-defect negatives at every applicable independent boundary.

| Group | Status | What closes it |
|---|---|---|
| CF-01 whole certified-v3 wire and identity | **COMPLETE** | I0/I1 over the whole roots below; IdentityInput/IdentityResult validated in the coordinator realm and issued before producer preparation (recorder order); LP, K and E recomputed by the adapter demo's independent recipe; whole 25-field producer with required-present nulls, whole v3 payload and the producer submission; Storage append, first custody, lost-acknowledgement (no durable change) and equal retry (dedupe, same first receipt), altered retry conflict. Unicode (combining marks, emoji, not normalized), revision as text/bool/float, revision step, decision with exception, extra members, missing nullable fields, changed actor/time/cause/event id/runtime, replay-only, NFC-normalized run id, Start formula and unprefixed key refuse. The adopted demo adds the 2^53 boundary positive and the 2^53+1 and 2^64 `codec_unavailable` refusals on the same identity and producer code. |
| CF-02 assignment, invocation and runtime sources | **COMPLETE** | Six registered owners issue whole producer-realm roots; every structured original (17 in AssignmentSource, 58 in InvocationSource, 28 in ResolverGraphSource, 57 in ReferenceSource, 11 in CausalSource, 190 in WholeProducerSource) is bytes its issuer holds, recorded by a Storage issuance transaction. I0 joins targets, owners, roles, the embedded whole assignment, invocation identity, resolver/reference invocation, effective runtime, all seven reference bindings and correlation. Live assignment, native, Goal and Standard sources are rechecked after every one of the ten returning helpers and at producer acquisition and return. Every producer output field maps to its whole source; WholeProducerSource embeds the acquired roots unchanged and its identity admission equals the issued identity (P9). Stale/foreign assignment, foreign invocation, mismatched effective runtime, unbound cause, substituted member set, caller census, borrowed role, six structured-original substitutions and drift at each helper and final boundary refuse. |
| CF-03 successful Workflow/WorkNode/D01/Standard chain | **COMPLETE** | Start, each required WorkNode's queued→in_progress→verify_pending→verified→done with attempt, validator and Auditor records, progress and provisional success (optionally verifying), each one Storage transaction with D01 update, head and origin; G1-G8 plus Document Packaging and D01-origin authenticity evaluated from the native store by the final decision owner and re-derived by every consumer; durable Standard and capture origin in one transaction; whole OriginalCertificationSource checked against the store; CertificationCandidateResult provisional_success or verifying → certified, revision +1, certification_receipt the durable Standard receipt, Goal store unchanged. Missing, failed, failed-later or unregistered required nodes, waived or not_applicable criteria, failed validators, blocked source control, blockers, unresolved rollback and safe point, stale D01 head, fabricated or missing D01 origin, Auditor critical block, Document Packaging without a complete DocumentSet, child/risk/exception shortcuts, a non-certified decision, a false receipt flag, substituted receipts, a fabricated decision origin, a stale decision, Goal Stop or edit, and nine coherent source substitutions refuse. |
| CF-04 v7/prepare.v2 profile and resource closure | **COMPLETE** | Before birth the profile owner verifies all 42 members' whole bytes and sizes, the producer subprofile membership and digest, the v6 predecessor bytes, the acyclic DAG and the sorted-key compact descriptor digest (`0055de6c…3845`), refuses merged and network-fallback realms, and eagerly resolves 66,306 references with zero unresolved (44 explicit scoped crossings, including the historical Handoff route). Fresh enrollment selects it; each derive_original_identity argument is validated in its declared realm. v6 descriptor, v6 header cast, predecessor relabel, missing/changed/resized/duplicate members, self-dependent descriptor, subprofile not a member or stale, substituted predecessor hash, pretty-print and stale digests, global bank merge, network fallback, wrong scoped-import target hash, dropped scoped import, realm cast and an old v6 native birth refuse. |
| CF-05 acyclic chronology and one B1 birth | **COMPLETE** | Whole OriginalBirthArgument first, native birth candidate, Birth selecting it (key and SHA-256), epoch-zero empty Control selecting Birth; Goal/Stop/binding/goal-revision/key-absence final guard after every helper; one Storage transaction coissues native birth, body, control, D01 head and origin, WorkNode members, Birth and Control (nothing visible before, all after, cell generation +1); coordinator family keys in the package's own lowercase-hex codec (`physical-retention-install.json`) round-trip to the exact identities; WorkflowBirthPublication validates whole. Profile → birth → Standard → identity → producer order is recorded. Sequential partial birth, occupied Birth/Control keys, an older native birth, Birth selecting another native birth, Control selecting another Birth, a circular own-key selection, a base64url control key, nonzero epoch, non-empty phase, request/native profile mismatch, extra members, foreign-run birth argument, an unissued Goal argument, a future Standard input, foreign binding, a stopped or rebound Goal, Stop/rebind/edit after the helpers, a missing Goal control and a future Intent at identity refuse. |

**Merge items, not remaining work in this lane.** The CF-06..CF-09 and P7 corpus (DG-CF2) carries compact native records where this lane now issues whole roots; `World.cf2_inputs()` returns the whole OriginalCertificationSource, CertificationCandidateResult, WholeProducerSource and CurrentWorkflowSource by owner handle for that integration. The `original_start` member of CurrentWorkflowSource and the seven original activation inputs are schema-valid positions of the native owner's whole acquisition whose own owner-executed Start/activation graph is S1 (DG-S); the joins this lane's groups rely on (identity copies, status, revisions, required set, completions, final receipt) are projected from the native store and rechecked. The adapter demo and this lane both use the Storage time as the producer `occurred_at_utc` source (the final decision's issuance time here).

## What the corpus does

### Whole-root composer (`scripts/pm_goal_dg_cf1_compose.py`)

The native OriginalCertificationSource reaches 278 definitions and about 9,400 required leaf positions; a test owner cannot type it, and a fixture cannot stand in for issuance. The composer builds a schema-only scaffold per root in its isolated realm (`const`, owner-chosen `enum`, `if`/`then`/`else` to a fixpoint, `allOf`, `contains`/`minContains`, the first validating `oneOf`/`anyOf` branch, `minItems`, `minProperties`, integer bounds, regex patterns), caches it per process, then stamps times from the Storage clock, uuid4 values from the owner's random source and owner-namespaced digests, places the owner's facts (exact path or suffix) and validates the whole value through the W5 scoped realm bank (read-only import). It authenticates nothing.

### Owners (`scripts/pm_goal_dg_cf1_world.py`)

Registered on the adapter `OwnerRegistry`: `ProfileOwner`, `GoalOwner` (own store), `NativeRunOwner` (native store: body, control, birth, D01 head/update/origin, WorkNode, attempt, criterion, validator, Auditor, blocker, artifact, DocumentSet, source control), `FinalDecisionOwner`, `StandardOwner`, `NativeSourceIssuer`, `AssignmentOwner`, `InvocationOwner`, `ResolverOwner`, `ReferenceOwner`, `CausalOwner`, `PartitionRouteOwner`, `WholeIdentityOwner`, `WholeProducer`, `BirthCoordinator`, and the adapter `AppendOwner`. Whole roots stay in owner custody (`exact_json`, no integer cap); Storage cells hold the compact native records under the 16 KiB part cap. `authenticate_structured` checks every structured original's byte count, SHA-256 and identity hash, a registered issuer holding those bytes, run scope and the Storage issuance transaction. `live_recheck` is the helper and final boundary check; `dispatch` validates each argument in the realm `methods.json` declares.

### Ordered path (`scripts/pm_goal_dg_cf1_oracles.py`)

`run_path` performs, in order: profile selection; Goal seed and whole birth arguments; enroll_fresh_birth; native Start, criteria and source control, each WorkNode lifecycle, provisional success (and verifying); CurrentGoalArgument; final decision; Standard capture; OriginalCertificationSource; cause Event append; the six producer-side roots; derive_original_identity; producer prepare.v2; prepare_certified; CurrentWorkflowSource; Storage append and first custody. The recorder holds every call with owner, method, argument/result digests, parent, refusal code and before/after observations of both Storage instances and every owner. `check_positive` asserts each group's observations; the first positive exports the recorder.

## Guards for the shared guard-isolation tool

`reports/event-authority-20261111/DG-CF1-guards.json` maps each of the 144 guard codes to the lane negatives that refuse with exactly it, lists the adopted demo's guards separately, and lists every static guard site without a dedicated negative with its reason. No local guard-removal engine and no check-11 claim are made; `scripts/pm_guard_isolation.py` proves isolation in the sweep. Sites without a dedicated negative:

- `g1/inventory` — duplicate of <code>1/all_worknodes_terminal: a required WorkNode without a record refuses there first.
- `birth/key_identity` — duplicate of birth/initial_control_key: a key encoding other identities differs from the derived key first.
- `birth/profile` — duplicate of profile/digest: the descriptor record carries the digest the profile owner just verified.
- `compose/expand_template` — tool self-check on its own scaffold (min_items guarantees a template); unreachable from inputs.
- `dispatch/undeclared/` — coding guard: every dispatched name comes from methods.json; unreachable from inputs.
- `i0/goal_run_bound` — duplicate of identity_helper/goal_current/goal (live binding recheck after the Goal helper) and birth/goal_run.
- `i0/goal_stop` — duplicate of identity_helper/goal_current/<stage> (live Stop recheck after each helper).
- `i0/reference_member_duplicate` — duplicate of the ReferenceSource contains/maxContains schema rule enforced at issuance (issue/ReferenceSource/schema/bindings).
- `i0/reference_member_set` — duplicate of the same schema rule (minItems 7 plus one contains per role).
- `i0/standard_decision` — needs a second final decision for the same run; T_DECISION is CAS-from-absent, so a second issuance refuses tx/cas_absent first.
- `i0/standard_durable` — duplicate of identity_helper/standard_durable/standard (live recheck after the Standard helper).
- `i0/standard_run` — needs a Standard captured for another run; the Standard owner derives goal_run_id from the scope it captures for.
- `identity/descriptor_unavailable` — duplicate of profile/digest and birth/profile: the only descriptor issuer verifies the fixed recipe and digest.
- `identity_final/source_changed/` — owner custody is immutable; a withdrawn original refuses first with original/withdrawn (negative invocation_withdrawn_before_final).
- `key/lowercase_even_hex` — decode self-check on keys this owner encoded; a non-hex key is caught first by birth/initial_control_key.
- `key/template` — self-check on the pinned physical-retention-install.json template; unreachable from inputs.
- `key/utf8` — coding guard: scope identities come from owner values that are nonempty strings; unreachable from inputs.
- `prepare/status` — duplicate of prepare/decision_current: any native status change advances body_revision.
- `producer/cause_appended` — Storage refuses first with read/event_unavailable (negative cause_event_never_appended), as in the adapter demo.
- `producer/payload_type` — duplicate of the v3 payload schema validation (producer/payload/schema/).
- `producer/submission_field/` — the submission is built from the prepared producer25 by the same owner; unreachable from inputs.
- `standard/goal_stop` — duplicate of standard/goal_current (live Goal recheck; negative goal_stopped_before_standard).

## Components used

ST (cause and certified Event append, frames, first custody, read_event, Storage-assigned fields, dedupe), TX (every native, Goal, birth, Standard, final-decision and issuance transaction; CAS from absent; cell generation as the single-transaction witness), IF (registry, owners, opaque handles, `acquire`, custody, withdrawal, roster), MR (ordered calls with before/after observations, chronology assertions), KC (`k_component` for native-store keys, `scope_partition` for the partition), RB (the CF-01 payload bank, read-only through the demo), the RQ pattern (the W5 realm/scoped-route precondition for eager qualification and realm dispatch), NR (every integer and timestamp through the adapter calls). RO, GS, PK and RT were not needed by these five groups (crash cuts and generic-prefix reads belong to CF-06/CF-07 and CF-10..12).

## Owner text amended

- `Plans/Automated_Testing_System.md:7706` — dated DG-CF1 amendment of ATS-1121 (`### ATS-1121` at :7652) selecting this corpus for exactly CF-01..CF-05. No new PlanUnit.
- `Plans/goal_own_c_contracts/protocol.md:129-145` — new section "DG-CF1 complete original-path oracles".
- `Plans/goal_own_c_contracts/suites.json:159-176` — `dg_cf1` key in the goal_run.certified suite.

## Shared-file hunks for the DG merge

- `Plans/Automated_Testing_System.md` @@ -7705,0 +7706,2 @@ (amendment paragraph and blank line after the ATS-1121 YAML block). DG-CF2 inserts its paragraph at the same place: keep both (and DG-CF3's).
- `Plans/goal_own_c_contracts/protocol.md` @@ -127,0 +128,18 @@ (appended after the adapter section, which is lines 97-127 after the adapter merge). DG-CF2 appends its own section at the same place: keep both.
- `Plans/goal_own_c_contracts/suites.json` @@ -157,0 +158,19 @@ (`dg_cf1` object after `c3_w5_part3`; DG-CF2's `dg_cf2` goes beside it, with a comma between the two objects).
- Regenerated: `Plans/_shards/automated_testing_system/**` (52 files) and `Plans/.plan_index/{plan_units.jsonl,doc_cards.json,dependencies.json,coverage_report.json,node_readiness_report.json}` — rows of `Plans/Automated_Testing_System.md` only; the readiness report differs only in `generated_at_utc` and that document's stale-source expected hash. Regenerate at merge rather than hand-merging.
- New files only: `scripts/pm_goal_dg_cf1_compose.py`, `scripts/pm_goal_dg_cf1_world.py`, `scripts/pm_goal_dg_cf1_oracles.py`, this report and `reports/event-authority-20261111/DG-CF1-guards.json`.
- K(s): not applicable to this lane (DG-S and DG-R only). Native-store keys use the adapter `k_component`; coordinator family keys use the coordinator package's own lowercase-hex codec, as DG-CF2 does.
- Not edited and needing no change: `scripts/pm_goal_oracle_common.py`, the adapter files, NUMRULE, earlier parts' scripts.

## Twelve-criterion re-grade (goal_run.certified, this lane's groups)

| Criterion | Before (W5 part 3) | After |
|---|---|---|
| Membership/version | PASS | PASS |
| Owner document | PASS | PASS |
| Producer | PASS | PASS |
| Closed payload | PASS | PASS |
| Scope/identity | PASS | PASS |
| Replay/idempotency | PASS | PASS |
| Retention | PASS | PASS |
| Redaction/custody | PASS | PASS |
| Transitions | PASS | PASS |
| Consumers/checkpoints | PASS | PASS |
| Compatibility/withdrawal | PASS | PASS |
| Positive/negative oracles | PARTIAL (0 complete CF/P tuples) | PARTIAL for the family. CF-01..CF-05 now have complete original-path corpora with real issuance, whole roots in their realms and coherent one-defect negatives. The family cell stays PARTIAL until DG-CF2's and DG-CF3's groups and the merge integration of the whole native/producer roots are on one branch. |

Family: 11/12 before and after; no grade is raised by this lane alone.

## Checks

| Command | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_goal_dg_cf1_oracles.py --output <evidence>/oracles.json` | 0 | pass; 6 positives, 195 negatives, 0 failures (898.9 s, run beside the history audit; about 200 s alone) |
| `python3 scripts/pm_goal_test_adapters_selftest.py` | 0 | pass; 64 positives, 140 negatives (204/204), TIME 28.63 s RSS 40584 KB |
| `python3 scripts/pm_goal_test_demo_cf01.py` | 0 | pass; 2 positives, 40 negatives |
| `python3 scripts/pm_goal_own_c_oracles.py` | 0 | pass |
| `python3 scripts/pm_goal_own_c_source_oracles.py` | 0 | pass |
| `python3 scripts/pm-goal-runtime-lineage.py --self-test` | 0 | pass |
| `python3 scripts/pm_goal_own_c3_w5_projection_oracles.py --output <out>` | 0 | PASS; 13 component positives, 31 component negatives (first battery attempt omitted the required `--output` and exited 2 on argparse; rerun) |
| `python3 scripts/pm_goal_own_c3_w5_successor_oracles.py --output <out>` | 2 | expected: preserved historical stored-root counterexample (18,626 > 16,384) reports BLOCKED, as in parts 2/3 and DG-CF2 |
| `python3 scripts/pm_goal_own_c3_w5_oracles.py` | 2 | expected: preserved predecessor bank failure, 22 unresolved; coordinator package 66,306 references, 0 unresolved |
| `python3 scripts/pm_goal_current_writer_oracles.py --guard-table <out>` | 0 | pass; 861 negatives, 143 guards removed, 0 failures, 0 unproved guards; TIME 30.49 s RSS 67416 KB |
| `python3 scripts/pm_goal_run_stop_block_oracles.py --guard-table <out>` | 0 | pass; 427 negatives, 90 guards removed, 0 failures, 0 unproved guards; TIME 18.23 s RSS 48372 KB |
| `python3 scripts/pm_goal_lifecycle_successor_oracles.py --guard-table <out>` | 0 | pass; 487 negatives, 104 guards removed, 0 failures, 0 unproved guards; TIME 8.12 s RSS 50384 KB |
| `python3 scripts/pm_goal_history_reader_fixtures.py --guard-table <out>` | 0 | pass; 6032 negatives, 650 guards removed, 0 failures, 0 unproved guards; started at 10.7 GB available; TIME 1631.89 s RSS 804376 KB |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | pass; only automated_testing_system shards changed |
| `python3 scripts/pm-plan-index.py generate` | 0 | pass; only Automated_Testing_System.md rows changed |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | pass |
| `python3 scripts/pm-plan-index.py validate` | 1 | fail 126 = base 126 against origin/main 77bae0c63605d0a6f643aa3f1d8c51c2f3bb7947; 0 added, 0 removed |
| `git diff --check` | 0 | clean |

Heavy steps (the four inherited DG audits) started only at 8 GB available or more on Nas1; light steps (each under 500 MB RSS) ran serially without that gate. The live fifteen-file currentness edition was copied byte-exact before index generation and was still equal immediately before it (`currentness-sha256sum.log`). `PM_GOAL_AUDIT_WORKERS=1` throughout. Nas1 lacks `msgpack` and `blake3` system-wide, so every Python step ran in a lane venv (`--system-site-packages`, msgpack 1.2.4, blake3 1.0.11, the versions DG-CF3 uses on Nas1).
