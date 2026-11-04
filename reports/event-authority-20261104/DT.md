# DT-FIX3 — Event Authority review round 3

Branch: `plans/ea-w2-tools-gates-approvals-20261104`. Reviewed head: `7d6b73958a57c612a58bf26d72035c09b22109b4`. Assessed implementation head: `5851ccc170ec0743a5a920b652df14d145c1247a`. The following publication changes reports only. Assigned detached worktree `/home/sittingmongoose/pm-worktrees/DT-fix3` is removed after publication is pushed.

**All ten standing checks pass for all seventeen drafted families.** The clean checker passes **5,225 assertions**. Six bounded groups run all 17 targeted families without reducing any full checker's family or assertion coverage: **261 complete-main calls**, six clean baselines and 255 injected faults. Every fault reports fail and returns 1. Of these calls, 193 validate all 17 families/all 5,225 assertions, including 17 real failing subprocesses; the other 68 stop with structured schema-reference failures before fixtures, as required. The four check-9 injection locations and three check-10 fault variants run separately for every family.

**Preparation: 0/18 at independent cycle 3 → 16/18 after repair**, under WAVE2's retention exception. All seventeen drafted populations pass the ten standing checks. Whole-family `tool.denied` retains its FileSafe producer/transition conflicts; `tool.custom_headless.skipped` remains undrafted and stopped. Membership remains ABSENT. Native execution remains NOT_RUN. Original-owner, payload-pack and SP-278 authentication remain assumed adapters.

## Review round 3: findings and responses

- **F1 — stopped for Jared; existing fence reverified (`b20c80659d413cfe9344fdc5365beddf693b72e8`).** Where: CV-610/SP-590/ATS-295 and `denial_emission`. Cause: Tools and FileSafe disagree about emission. Existing fix: policy/user denial prepares; FileSafe returns `owner_conflict_stopped`, full source validation returns `transition_refused`, and no append occurs. Exact question unchanged: **Should FileSafe blocks emit tool.denied, reconciling Tools.md:1496 (do not emit tool.denied for FileSafe blocks) with FileSafe.md:2839-2846 (Align tool.denied emission with filesafe_blocked)?** No product answer is adopted.
- **F2 — fixed previously (`b20c80659d413cfe9344fdc5365beddf693b72e8`), reverified.** Where: CV-610 and both source editions. Cause: missing denial mapping/episode joins. Fix: canonical reason, nullable inapplicable failure class, ordered actions, headless/snapshot/executed-at-all and exact episode joins. All thirteen authored source negatives and independent action-order/snapshot/sequence/scope/class mutations refuse as expected.
- **F3 — fixed previously (`b20c80659d413cfe9344fdc5365beddf693b72e8`), reverified independently for all three gates.** Where: CV-605..607/SP-585..587. Cause: unbound numeric results. Fix: original dispatch tuple/ref/threshold/result joins. All 21 authored negatives and twelve independent join mutations match. Original `score=123.5, score_threshold=-77` without context is `schema_refused` for each gate.
- **F4 — fixed previously (`b20c80659d413cfe9344fdc5365beddf693b72e8`), reverified.** Where: CV-614 and both Usage source editions. Cause: absent account identities failed capture. Fix: nullable proven-absence slots and exact identity joins. All eight authored negatives match; each of three account identities independently accepts proven absence and refuses fabrication in Project and application scope.
- **F5 — fixed previously (`b20c80659d413cfe9344fdc5365beddf693b72e8`), reverified.** Where: CV-613/SP-593/ATS-296. Cause: missing web variants and batch lineage. Fix: map/read/extract/research contexts and exact parent/URL-child joins. All sixteen authored negatives and all nine batch cases match, including omitted/duplicate child, wrong parent/tool/batch/run, aggregate and missing attempt refusals.
- **F6 — previous binding repair (`b20c80659d413cfe9344fdc5365beddf693b72e8`) reverified; residual stops unchanged.** Where: route-map retention bindings, source rows and the retained table below. Cause: blanket policy questions. Fix: preserve decided operational/runtime/SP-349/Usage bindings and fence the remaining narrow dependencies. All seven isolated retention-binding corruptions fail the complete checker/return 1. Every authored retention expectation matches; no new duration, anchor or deletion policy is chosen.
- **F7 — fixed previously (`4148c3d2cbb57b0d71542e4ccaa7011ff4bf568a`), reverified.** Where: all guarded identifier rules and `identifier_checks`. Cause: Python `$` accepts trailing LF. Fix: exact lengths/full-string guards. All 349 concrete identifier LF mutations refuse, including coherent checkpoint and config/Usage hash cases. Full checker faults restoring false LF publication fail for every family.
- **F8 — fixed previously (`ea4a395b9e703a2bae3541d097f16a892be603c2`), reverified.** Where: `producer_semantic_bytes/digest` and retry oracles. Cause: complete-event hashing included Storage metadata. Fix: exact RFC 8785 bytes over the owner's 21 caller fields. All 51 metadata mutations preserve the full original event/receipt and one entry; all 357 caller-field mutations conflict. Full checker faults restoring whole-event hashing fail for every family.
- **F9 — fixed (A: `691a07e85d`).** Where: `scripts/pm-dt-event-contracts.py:36` and `:707`; `scripts/pm-dt-standing-checks.py:47` and `:126`. Cause: fixture-directed validation skipped unresolved references in unused branches. Fix: resolve all references across the complete DT and EventRecord documents and all 41 DT Storage mirrors before fixture validation, traversing unused definitions/properties/alternatives with resource roots, nested IDs, anchors and external-bundle context. A broken reference produces structured fail/return 1. Each family's timestamp alternative, optional property, unused definition and Storage mirror injection independently fails. Both independent cycle-3 F9 reproduction scripts now refuse all seventeen mutations; valid target/visited controls pass. Root/local/external/anchor/nested-ID controls pass, and unused external dependency failure is detected. No schema is weakened.

**Standing check 7 storage refusal — prior fix `6c7135af06e1703ec83780495d6e13d1f0d20d32` reverified.** All 51 one-field mismatches and all seventeen coherent foreign-storage checkpoint/token/source-selection/reference substitutions return `source_changed`. Positive checkpoint identities still equal their original event source. Every full-checker fault that falsely publishes coherent foreign Storage fails.

**Standing check 10 — fixed (B: `1eb7e19160`).** Where: `scripts/pm-dt-event-contracts.py:547`, `:571` and every family's `historical_reader_oracle` in `Plans/dt_event_contract_fixtures.json`. Cause: no explicit retained-history oracle. Fix: inspect the authenticated immutable original source/event closure using its original captured prerequisites, with current disclosure guards. All seventeen retained base events survive changed live prerequisites that would refuse a current transition, and unavailable live state; every Project/application/operation variant also survives. Verified referenced payloads survive; unverified/changed pack bodies, withdrawn families, forged events/source records/Storage metadata, missing source, unsupported readers and current access/tombstone refusals return unavailable with zero append/effect. Separate full-checker faults for live-state gating, withdrawn acceptance and forged acceptance fail for every family. This tests existing per-family SP-580..596 read/custody semantics; no new runtime binding, authentication proof, writer admission or product answer is authored.

## Per-family standing checks

A = F9 commit `691a07e85d`; B = historical-oracle commit `1eb7e19160`. `5851ccc170` adds repeatable bounded family groups; every full checker continues to validate all seventeen families. Each table cell is verified by a separate full-main fault and its expected failure boundary. No standing-check cell remains open.

| Family | 1 replay | 2 app key | 3 partition | 4 payload | 5 LF | 6 retry | 7 storage | 8 exit | 9 refs | 10 history |
|---|---|---|---|---|---|---|---|---|---|---|
| `approval.requested` | pass | pass* | pass | pass | pass | pass | pass | pass | fixed A | fixed B |
| `approval.granted` | pass | pass* | pass | pass | pass | pass | pass | pass | fixed A | fixed B |
| `approval.denied` | pass | pass* | pass | pass | pass | pass | pass | pass | fixed A | fixed B |
| `approval.timeout` | pass | pass* | pass | pass | pass | pass | pass | pass | fixed A | fixed B |
| `config.migrated` | pass | pass | pass | pass | pass | pass | pass | pass | fixed A | fixed B |
| `gate.evaluation_started` | pass | pass* | pass | pass | pass | pass | pass | pass | fixed A | fixed B |
| `gate.failed` | pass | pass* | pass | pass | pass | pass | pass | pass | fixed A | fixed B |
| `gate.passed` | pass | pass* | pass | pass | pass | pass | pass | pass | fixed A | fixed B |
| `requirements.clarification_requested` | pass | pass* | pass | pass | pass | pass | pass | pass | fixed A | fixed B |
| `run.background_enqueued` | pass | pass | pass | pass | pass | pass | pass | pass | fixed A | fixed B |
| `tool.denied` | pass | pass | pass | pass | pass | pass | pass | pass | fixed A | fixed B |
| `tool.execution_completed` | pass | pass | pass | pass | pass | pass | pass | pass | fixed A | fixed B |
| `tool.execution_started` | pass | pass | pass | pass | pass | pass | pass | pass | fixed A | fixed B |
| `tool.invoked` | pass | pass | pass | pass | pass | pass | pass | pass | fixed A | fixed B |
| `usage.event` | pass | pass | pass | pass | pass | pass | pass | pass | fixed A | fixed B |
| `worktree.created` | pass | pass* | pass | pass | pass | pass | pass | pass | fixed A | fixed B |
| `worktree.deleted` | pass | pass* | pass | pass | pass | pass | pass | pass | fixed A | fixed B |

*Project-only family: application-key construction is inapplicable; attempted application append explicitly refuses. All seven app-capable families/eight application positives retain exact CV-366 byte formatting and literal-ID/wrong-server/wrong-prefix refusals.*

## Per-family grades before and after

Before is the independent cycle-3 regrade. Only the seventeen `positive_negative_oracles` cells return PARTIAL → PASS. **165 PASS / 24 PARTIAL / 25 ABSENT / 2 CONFLICT → 182 PASS / 7 PARTIAL / 25 ABSENT / 2 CONFLICT** across all 216 cells. All 328 current quote records and declared source hashes match the implementation head. Counts are normative self-grades, not admission or native-execution grades.

| Family | Before PASS/12 | After PASS/12 | Remaining non-PASS cells |
|---|---:|---:|---|
| `approval.requested` | 10 | 11 | membership_version ABSENT |
| `approval.granted` | 10 | 11 | membership_version ABSENT |
| `approval.denied` | 10 | 11 | membership_version ABSENT |
| `approval.timeout` | 10 | 11 | membership_version ABSENT |
| `config.migrated` | 10 | 11 | membership_version ABSENT |
| `gate.evaluation_started` | 10 | 11 | membership_version ABSENT |
| `gate.failed` | 10 | 11 | membership_version ABSENT |
| `gate.passed` | 10 | 11 | membership_version ABSENT |
| `requirements.clarification_requested` | 9 | 10 | membership_version ABSENT; retention PARTIAL |
| `run.background_enqueued` | 10 | 11 | membership_version ABSENT |
| `tool.denied` | 8 | 9 | membership_version ABSENT; producer CONFLICT; transitions CONFLICT |
| `tool.execution_completed` | 10 | 11 | membership_version ABSENT |
| `tool.execution_started` | 10 | 11 | membership_version ABSENT |
| `tool.invoked` | 10 | 11 | membership_version ABSENT |
| `usage.event` | 9 | 10 | membership_version ABSENT; retention PARTIAL |
| `worktree.created` | 9 | 10 | membership_version ABSENT; retention PARTIAL |
| `worktree.deleted` | 9 | 10 | membership_version ABSENT; retention PARTIAL |
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


## Scope, IDs and validation

Existing product stops and exact questions remain unchanged. Usage's setting-driven retention-policy adapter remains technical PARTIAL debt with deletion/admission disabled. All pending facets retain source/receipt/reference closure and holds.

No owner prose, payload/source/checkpoint schema, Storage registry, Event family registry, Decision Log, protected governance artifact, `.gitignore` or repository test file changes in round 3. No new runtime/native binding or old owner answer is adopted. Existing per-family binding-search evidence remains in `DT-binding-search.json`. **New IDs: none. Existing IDs: CV-600..616, SP-580..596, ATS-290..298; unused allocation tails remain unused.** Branch pushes only; no main push, landing lock, reseal, admission or subagent. Disk/memory prerequisites were 111 GB/14 GB before worktree creation; later checks stayed above the 50 GB/6 GB limits.

| Verification | Exit | Result |
|---|---:|---|
| DT baseline | 0 | 17 families, 5,225 assertions, all ten observations match. |
| Full standing companion in six disjoint groups | 0 each | 261 complete-main calls: six clean baselines, all 255 faults fail/return 1; includes 17 real failing subprocesses. |
| Adapted cycle-3 independent probes and explicit assertions | 0 | F1–F8 regressions, 68 Storage refusals, 349 LF / 51 metadata / 357 producer mutations and zero-exit rejection all pass. |
| Original timestamp/optional-reference reproductions | 0 probes; 1 child checkers | All 34 independent F9 mutations now refuse; resolver controls pass. |
| Seven retention-binding mutations | 0 probe; 1 child checkers | All seven exact bindings detected; retention vectors and original gate counterexamples match. |
| Shard generate/check | 0 | 99 docs / 3,267 shards; generation produces no repository change. |
| Index validate | 0 | Parsed top-level status pass; no failures. No owner markdown changed, so index generation is unnecessary. |
| Storage recovery self-test | 0 | All 22 checks pass. |
| Currentness copy | 0 | All 15 ignored edition hashes match the shared copy. |
| Grade/source/scope audits | 0 | 216 cells / 328 exact current quotes; original owner/schema/registry bytes unchanged. |
| `git diff --check` | 0 | No whitespace errors. |

Commands, expected child failure codes, exact evidence paths and SHA-256 are in `DT-checks.json` and `DT-evidence-sha256.json`. Copies of this report and self-grade overwrite `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/DT.md` and `DT-self-grade.json`. Round-3 evidence is under that directory's `fix3/`. No aggregate governance or native-runtime pass is claimed.

## Principal retained evidence

| Exact artifact path | SHA-256 |
|---|---|
| [/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix3/standing-negative-runs.json](/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix3/standing-negative-runs.json) | `25f26a1ecdb992157cb1bdaaa15aef282c2669d7ff7cc66fa20e688e0f61c344` |
| [/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix3/earlier-regression-summary.json](/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix3/earlier-regression-summary.json) | `9af59b81bc29739a546dbac81a99c36eebe2752ce08eff6693705cdc103a86ad` |
| [/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix3/historical-readers.json](/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix3/historical-readers.json) | `c0ba66352917cbc693ed93f99ffddb26cdfe8201587ec84b4232c086152556d8` |
| [/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix3/reference-branch-mutations.json](/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix3/reference-branch-mutations.json) | `ed8dbeb2c43e937070f250d922f945bca83339d42033ec893993b5d30f55d23c` |
| [/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix3/reference-mutations.json](/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix3/reference-mutations.json) | `4d6f95f05beb5f986e7764be4b37d44c02e949074b2541b84e9a7e50e083fc73` |
| [/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix3/grade-evidence-check.json](/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix3/grade-evidence-check.json) | `97d87b2ecb23162d7896b3e78f2a2cf503cd30e901fa24efa37e27812bfd01ab` |
