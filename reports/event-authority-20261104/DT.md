# DT-FIX2 — Event Authority review round 2

Branch: `plans/ea-w2-tools-gates-approvals-20261104`. Reviewed head: `66b49694f95aabf8d167c16ca8c55535ecc3dfaf`. Assessed implementation head: `6c7135af06e1703ec83780495d6e13d1f0d20d32`. The following publication changes reports only. Worktree `/home/sittingmongoose/pm-worktrees/DT-fix2` is removed after publication is pushed.

**All eight standing checks pass across all 17 drafted families.** The complete checker passes **5,191 assertions**. Its fault-injection companion performs **137 complete checker runs**: one clean baseline plus 136 separately targeted family/check faults; all 136 faults report `fail` and return checker exit code 1. Checks 1..7 use 119 in-process calls to the complete main; check 8 uses 17 real failing subprocesses. Every run checks all 17 families and all 5,191 assertions. The clean baseline is one additional in-process run. A separate full-main probe returning success despite reported failures is refused by the actual harness predicate for every family.

**Preparation: 0/18 at the independent review → 16/18 after repair**, under WAVE2's explicit retention exception. All 17 drafted policy populations pass the standing checks; the whole `tool.denied` family retains its FileSafe producer/transition conflicts, and `tool.custom_headless.skipped` stays undrafted and stopped. Membership remains ABSENT throughout. Native execution remains NOT_RUN; original-owner, payload-pack and SP-278 authentication remain assumed adapters, never native proof.

## Review round 2: findings and responses

- **F1 — stopped for Jared; round-1 fence carried (`b20c80659d413cfe9344fdc5365beddf693b72e8`).** Where: CV-610 / SP-590 / ATS-295 and the `tool.denied` source/non-emission oracles. Cause: Tools and FileSafe disagree about emission. Fix already carried: only policy/user denial is prepared; FileSafe returns `owner_conflict_stopped` with no append. Exact question remains: **Should FileSafe blocks emit tool.denied, reconciling Tools.md:1496 (do not emit tool.denied for FileSafe blocks) with FileSafe.md:2839-2846 (Align tool.denied emission with filesafe_blocked)?** No product answer is adopted.
- **F2 — fixed in round 1, reverified (`b20c80659d413cfe9344fdc5365beddf693b72e8`).** Where: CV-610 and both source/schema editions. Cause: original denial mapping/episode joins were missing. Carried fix: canonical reason, ordered actions, nullable failure class, permission snapshot, headless flag, executed-at-all and episode/scope joins. Full positive and negative source oracles still run.
- **F3 — fixed independently for all three gates in round 1, reverified (`b20c80659d413cfe9344fdc5365beddf693b72e8`).** Where: CV-605..607 / SP-585..587. Cause: unbound numeric scores. Carried fix: exact original Executor dispatch tuple/ref, threshold and actual numeric-result joins. Each family's scored positives and source negatives still run.
- **F4 — fixed in round 1, reverified (`b20c80659d413cfe9344fdc5365beddf693b72e8`).** Where: CV-614 and both Usage source definitions/mirrors. Cause: absent account identities could not survive the required before record. Carried fix: required nullable source slots, payload omission of proven absence and exact known-identity joins. Project/application absence and fabrication oracles still run.
- **F5 — fixed in round 1, reverified (`b20c80659d413cfe9344fdc5365beddf693b72e8`).** Where: CV-613 / SP-593 / ATS-296. Cause: omitted web variants and batch lineage. Carried fix: typed operation context, refs/counters, actual owner result, parent/URL-child identity and aggregate joins. All source and batch oracles still run; no new family is authored.
- **F6 — binding repair carried and reverified (`b20c80659d413cfe9344fdc5365beddf693b72e8`); residual stops unchanged.** Where: the exact retention table below, route-map bindings, fixture binding oracles and 24 source rows. Cause: prior blanket policy questions. Existing operational/runtime assignments, SP-349 counterparts and decided Usage setting/totals remain bound. Exactly three narrow runless product questions plus Usage's technical adapter remain fenced. No new duration, anchor or deletion policy is chosen.
- **F7 — fixed (A: `4148c3d2cbb57b0d71542e4ccaa7011ff4bf568a`).** Where: `Plans/dt_event_contracts.schema.json:156` (checkpoint hash), `:1292` (config hash), `:6170` (Usage hash), all 58 definitions and 41 Storage mirrors; `scripts/pm-dt-event-contracts.py:113`. Cause: Python `$` accepts a trailing LF. Fix: 217 hashes and 17 generation IDs gain exact lengths; seven variable Project-partition patterns gain a portable full-string end guard. Every populated patterned identifier in every base/variant source/payload/checkpoint gets a trailing-LF negative. Coherent current-token/prefix changes and coherent config/Usage payload-source joins refuse. Restoring the reviewed schemas/mirrors yields 899 failures across all 17 families in the full checker; exit 1. Verify `f7-regression-rejection.json`, `schema-mirrors.json`, normal DT main and standing fault 5.
- **F8 — fixed (B: `ea4a395b9e703a2bae3541d097f16a892be603c2`).** Where: `scripts/pm-dt-event-contracts.py:79` and `:652`; every family's `retry_oracle`. Cause: `sha(event)` included Storage-assigned metadata in the semantic comparison. Fix: RFC 8785 canonical JSON over exactly the 21 CV-EventRecord caller fields. All 51 independent sequence/observed/persisted changes return the complete original event and receipt, with one stored entry. All 357 caller-field mutations change the digest and conflict when compared under the original stored model key, without append; these isolate digest sensitivity, while normal admission/identity joins are tested separately. Pinned semantic bytes/digests are separate from the unchanged full-value receipt and exact-u64 source commitments. Verify DT main and standing fault 6; the checker requires `jsonschema` and `rfc8785`.

## Standing-check 7 follow-up

**Fixed (C: `6c7135af06e1703ec83780495d6e13d1f0d20d32`).** Where: `scripts/pm-dt-event-contracts.py:444` and each checkpoint case's `context.source_storage_instance_id`. Cause: the existing three one-field mismatch checks passed, but coherently replacing all three checkpoint/token/source-selection storage IDs and refs could still publish. Fix: compare to the original event source's Storage identity supplied by the already-assumed adapter. This is an existing owner join from SP-580..596/SP-278, not a new storage authority, product feature or authentication claim. All 17 such coherent mutations returned `published` before the repair and now return `source_changed`; all 51 single-field mismatches still refuse. `check7-before-after.json` records both revisions. No owner prose or PlanUnit ID was added.

## Per-family standing checks

A = F7 commit `4148c3d2cb`; B = F8 commit `ea4a395b9e`; C = storage-identity/oracle commit `6c7135af06`. Each cell is a verified full-checker negative run, as recorded individually in `fix2/standing-negative-runs.json`. No standing-check cell remains open.

| Family | 1 replay | 2 app key | 3 partition | 4 payload | 5 LF | 6 retry | 7 storage | 8 exit |
|---|---|---|---|---|---|---|---|---|
| `approval.requested` | pass | pass* | pass | pass | fixed A | fixed B | fixed C | pass |
| `approval.granted` | pass | pass* | pass | pass | fixed A | fixed B | fixed C | pass |
| `approval.denied` | pass | pass* | pass | pass | fixed A | fixed B | fixed C | pass |
| `approval.timeout` | pass | pass* | pass | pass | fixed A | fixed B | fixed C | pass |
| `config.migrated` | pass | pass | pass | pass | fixed A | fixed B | fixed C | pass |
| `gate.evaluation_started` | pass | pass* | pass | pass | fixed A | fixed B | fixed C | pass |
| `gate.failed` | pass | pass* | pass | pass | fixed A | fixed B | fixed C | pass |
| `gate.passed` | pass | pass* | pass | pass | fixed A | fixed B | fixed C | pass |
| `requirements.clarification_requested` | pass | pass* | pass | pass | fixed A | fixed B | fixed C | pass |
| `run.background_enqueued` | pass | pass | pass | pass | fixed A | fixed B | fixed C | pass |
| `tool.denied` | pass | pass | pass | pass | fixed A | fixed B | fixed C | pass |
| `tool.execution_completed` | pass | pass | pass | pass | fixed A | fixed B | fixed C | pass |
| `tool.execution_started` | pass | pass | pass | pass | fixed A | fixed B | fixed C | pass |
| `tool.invoked` | pass | pass | pass | pass | fixed A | fixed B | fixed C | pass |
| `usage.event` | pass | pass | pass | pass | fixed A | fixed B | fixed C | pass |
| `worktree.created` | pass | pass* | pass | pass | fixed A | fixed B | fixed C | pass |
| `worktree.deleted` | pass | pass* | pass | pass | fixed A | fixed B | fixed C | pass |

*Project-only family: CV-366 app-key construction is inapplicable; the negative instead proves application-scope append is refused. All seven app-capable families and all eight app positives exercise exact CV-366 keys and coherent literal-ID/wrong-server/wrong-prefix refusals.*

## Negative cases and full-checker rejection

| Check | Authored negative per family | Full checker result |
|---|---|---|
| 1 | Current writer accepts `projector_replay_only`; separate writer/retry refusal cases and zero-effect retry expectations remain in main. | Each targeted false acceptance fails and exits 1. |
| 2 | Accept wrong `application:` prefix on an authentic app source; Project-only writer accepts forbidden app scope. Normal oracles also cover literal IDs and wrong server hex. | Each targeted bypass fails and exits 1. |
| 3 | Accept raw Project ID after coherently recomputing prepared-source commitment. Project base and variant positives must use encoded `project~`. | Each targeted bypass fails and exits 1. |
| 4 | Accept an inline body above 16 KiB. Normal cases also cover verified reference success and unverified/changed resolved-body refusal. | Each targeted bypass fails and exits 1. |
| 5 | Publish a trailing-LF anchor hash with coherent current-token and verified-prefix copies; all actual patterned-value LF cases also run. | Each targeted bypass fails and exits 1; restoring old schemas also fails all families. |
| 6 | Restore full-event hashing, which falsely conflicts on Storage metadata changes. Each caller-owned field independently changes the digest/conflicts. | Each targeted regression fails and exits 1. |
| 7 | Publish a coherent foreign-storage token; normal cases also change checkpoint/token/source-selection identity independently. | Each targeted bypass fails and exits 1. |
| 8 | Corrupt the family's pinned identity oracle in a real subprocess. Also simulate reported failures with a success return code and apply the actual harness guard. | All 17 real subprocesses report fail/exit 1; all 17 zero-exit substitutions are refused. |

## Per-family grades before and after

Before is the complete independent cycle-2 re-grade. Values are PASS cells out of twelve, not admission/native-execution grades. The 36 distinct F7/F8 cells return PARTIAL → PASS; every other status is carried. Totals: **146 PASS / 43 PARTIAL / 25 ABSENT / 2 CONFLICT → 182 PASS / 7 PARTIAL / 25 ABSENT / 2 CONFLICT**. All 216 cells and 294 quote records resolve against current files.

| Family | Before | After | Remaining non-PASS cells |
|---|---:|---:|---|
| `approval.requested` | 9 | 11 | membership_version ABSENT |
| `approval.granted` | 9 | 11 | membership_version ABSENT |
| `approval.denied` | 9 | 11 | membership_version ABSENT |
| `approval.timeout` | 9 | 11 | membership_version ABSENT |
| `config.migrated` | 8 | 11 | membership_version ABSENT |
| `gate.evaluation_started` | 9 | 11 | membership_version ABSENT |
| `gate.failed` | 9 | 11 | membership_version ABSENT |
| `gate.passed` | 9 | 11 | membership_version ABSENT |
| `requirements.clarification_requested` | 8 | 10 | membership_version ABSENT; retention PARTIAL |
| `run.background_enqueued` | 9 | 11 | membership_version ABSENT |
| `tool.denied` | 7 | 9 | membership_version ABSENT; producer CONFLICT; transitions CONFLICT |
| `tool.execution_completed` | 9 | 11 | membership_version ABSENT |
| `tool.execution_started` | 9 | 11 | membership_version ABSENT |
| `tool.invoked` | 9 | 11 | membership_version ABSENT |
| `usage.event` | 7 | 10 | membership_version ABSENT; retention PARTIAL |
| `worktree.created` | 8 | 10 | membership_version ABSENT; retention PARTIAL |
| `worktree.deleted` | 8 | 10 | membership_version ABSENT; retention PARTIAL |
| `tool.custom_headless.skipped` | 1 | 1 | membership_version ABSENT; producer PARTIAL; closed_payload_schema ABSENT; scope_identity ABSENT; replay_idempotency PARTIAL; retention ABSENT; redaction_custody ABSENT; transitions PARTIAL; consumers_checkpoints ABSENT; compatibility_withdrawal ABSENT; positive_negative_oracles ABSENT |

## Retention adjudication — exact populations



| Family | Existing binding / remaining work |
|---|---|
| `config.migrated` | RP-OPERATIONAL-2555D: 2,555 days / 2,000,000 per Project, original terminal migration anchor. SP-349 already supplies the one Server-wide app counterpart bucket with identical limits/TTL/holds. Event and both source rows bind it. No app-counting question remains. |
| `tool.denied` | RP-RUNTIME-365D for the drafted runtime-attributed actual-run/attempt policy/user-denial path, with existing holds and SP-349 app counterpart. FileSafe emission still requires the F1 owner answer. No independently permitted non-authority diagnostic population is invented. |
| `tool.invoked` | RP-RUNTIME-365D for actual runtime-attributed invocation history, original run completion and existing holds; SP-349 app counterpart. No copied class menu remains. |
| `usage.event` | SP-341/UF-108: ai.usage.usage-retention detail window (90-day default) in seglog and Parquet; permanent canonical daily account/provider/model totals committed before detail retirement and backed up. Structured `retention_binding` pins those decided terms. `PENDING_RETENTION_BINDING` is only the RT setting-driven policy-object/expiry-anchor adapter dependency; unknown binding remains materially incomplete and permits no deletion/admission. |
| `requirements.clarification_requested` | Review residual: “Ask which class and expiry anchor govern this report request where a run-completion anchor is inapplicable; do not assume that a ref-only report request is chat content. Runtime-linked cases should reuse existing runtime minima.” Exact question: **Which class and expiry anchor govern this report request where a run-completion anchor is inapplicable?** GATE-012 is pre-execution and has no required run. |
| `worktree.created` | Review residual: “Resolve the runless event's class/anchor and required lineage dependencies; the projection policy does not automatically register this event's retention.” Exact question: **What are the runless event's class/anchor and required lineage dependencies?** Runtime allocation history retains existing runtime minima; Project/thread operations outside an executor are distinct. |
| `worktree.deleted` | Review residual: “Neither name alone decides whether this exact event is that authority. Ask only that event/authority distinction and applicable anchor.” Exact question: **Is this exact event deletion-tombstone authority, or runless lifecycle history, and what is its applicable anchor?** Runtime history is distinct from runless lifecycle and `worktree_lane_thread_families`; RP-WORKTREE-TOMBSTONE-365D already protects that projection's tombstones while historical links exist. |

All pending facets preserve source/receipt/reference closure and existing holds. Retention bindings grant no family admission.



## Doctor question

**Exact question:** Is skipped eligible only on a Project's first-ever Doctor invocation, or on the first invocation that observes `tools.custom_headless` absent? If the first invocation has the key, may a later absence emit? What resets eligibility across a configuration revision, key removal/re-addition, Project import/clone or older restore?

**Disposition: STOPPED.** No DT writer, schema, reset rule or duplicate Doctor contract is authored. The prior recommendation remains unadopted; this fix round makes no recommendation or decision.

## Premises, bindings, IDs and scope

Current CV-EventRecord defines exactly the caller-field digest and compatibility-only replay policy used by this repair; both owner passages match fetched origin/main. Ten relevant semantic owner documents are byte-identical to the reviewed head. `current-premises.json` records hashes. Round-1 owner searches and separately authored per-family bindings remain in `DT-binding-search.json`; none is replaced with sibling inference. No old owner answer is extended. The failed assumptions repaired here were LF-safe `$` matching, whole-EventRecord retry comparison and sufficient pairwise Storage identity equality.

No owner prose is edited. The checkpoint adapter now exposes the already-required source Storage identity explicitly; its authenticity remains assumed. Newly authored runtime/native bindings: none. **New IDs used: none. Existing IDs remain CV-600..616, SP-580..596, ATS-290..298; allocated unused tails remain unused.**

Only DT schema/fixtures/checkers, their 41 existing Storage registry schema mirrors, the generated `storage_value_registry` shard group, index timestamps and DT reports change in round 2. Existing policies/profiles and all non-DT registry row values are unchanged. No admission, event-family registry append, Decision Log change, governance reseal, protected artifact, .gitignore or test-file change, landing lock, main push, subagent, mailbox registration or message. The source clone was briefly checked out/sparsified by an initial wrong-directory command, then restored to its exact original main ref/full-checkout state with its pre-existing untracked directory preserved; all task work is in the assigned detached worktree.

## Validation

| Command/check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm-dt-event-contracts.py` | 0 | 5,191 assertions / 17 families; all standing observations match. |
| `python3 scripts/pm-dt-standing-checks.py` | 0 | 137 complete runs; 136 individual faults refused with status fail/exit 1; 17 actual failing subprocesses. |
| Full checker with reviewed schemas/mirrors restored in memory | 1 | Expected refusal, all 17 families, 899 assertions fail. |
| Full checker forced to return zero despite failure + actual harness predicate | 0 (probe) | All 17 standing-exit cases fail; actual harness rejects the success code for each. |
| DT meta-schema + Storage registry schema + exact mirrors | 0 | 58 definitions / 41 mirrors; unrelated rows/policies/profiles unchanged. |
| `python3 scripts/pm-storage-recovery-contracts.py --self-test` | 0 | 22 checks pass. |
| `python3 scripts/pm-storage-profile-check.py` | 1 | Same 41 baseline errors; exact baseline/current report equality, zero additions/removals. |
| Required currentness edition copy | 0 | All 15 SHA-256 hashes match shared edition. |
| Shard generation/check | 0 | First generation changes only Storage registry shards; final regeneration is byte-identical. |
| Committed shard tree | 0 | Every manifest, index and referenced shard exists at the implementation head with its exact SHA-256. |
| Index generation/validation | 0 | Top-level pass; final generation differs from prior generated index only by four timestamps. |
| Grade/source evidence | 0 | All 216 cells / 294 quote records match; reviewed owner prose unchanged. |
| Scope audit and `git diff --check` | 0 | Protected files unchanged; no new IDs, owner prose or admission. |

Every command result and code is indexed in `DT-checks.json`; retained check artifacts have exact paths and SHA-256 in `DT-evidence-sha256.json`. Copies of this report and self-grade overwrite `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/DT.md` and `DT-self-grade.json`. Round-2 evidence is under that directory's `fix2/`. No aggregate governance or native-runtime pass is claimed.

## Retained evidence

| Exact artifact path | SHA-256 |
|---|---|
| [/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix2/dt.json](/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix2/dt.json) | `4da40907bf34b4181ef2f7392e0fe10630219828a698a352c100c38c3937b6ca` |
| [/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix2/standing-negative-runs.json](/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix2/standing-negative-runs.json) | `ecc367444369331192625c7e33d6a05cc1c93104304a2b1edbcc14802b4071b2` |
| [/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix2/success-exit-negative.json](/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix2/success-exit-negative.json) | `afa70e2a286de74b7a09c381f2165abc1285b48f48609571d573821cac9a36ff` |
| [/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix2/f7-regression-rejection.json](/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix2/f7-regression-rejection.json) | `894266aa3bb446849e6a846e778c9a353cd72d6954e682baa95815898be2b346` |
| [/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix2/check7-before-after.json](/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix2/check7-before-after.json) | `fc2d83e3ee29fea25a96ed75e9586c368dbe3cad89b30f53bb396bc689a3d5e1` |
| [/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix2/schema-mirrors.json](/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix2/schema-mirrors.json) | `a9f7291ced72da61b75ba68e7c28da974efb43345ad8d428e85ec0eb4ec1b1e0` |
| [/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix2/grade-evidence-check.json](/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix2/grade-evidence-check.json) | `8bb83aaca3532dc4418069eae5468c40bf0d7e8c401725921172fe69a52eec4e` |
| [/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix2/committed-shards-check.json](/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix2/committed-shards-check.json) | `0ccab6628a30ceb82cd306f6b2de8e68a9e8c0bc0c83e3e7ca45383a2a550f1a` |
