# External research as product canon — goal 3 (2026-09-17)

Branch `plans/goal3-research-20260917`, based on `a6162b559b`. Nothing here is landed on `main`; the branch
stops for an independent review. `verification.json` is the machine record, `evidence-receipts.json` names
every source by path and SHA-256, and `canonical-outputs.json` carries the SHA-256 of every file the branch
changed. This bundle is a result record, not canon.

Since September 2026 Puppet Master's external research process existed only as experiment code and reports.
This branch makes it product canon: what the product promises, what it costs the user, how long it takes, how
decisions reach the user, and what is verified before anything enters their plans. Nothing here is a feature
the experiments did not exercise, and every promise names the run that established it.

## What is in the branch

**One owner document.** `Plans/External_Research.md` carries `ERS-001` to `ERS-014` in the New Plan Authoring
Profile. It was registered exactly as the previous owner document, `Plans/Working_Notebook.md`, was registered
at commit `99a3c7db9d`: appended to the `sources` array of `Plans/sharding_config.json`, given a dated Change
Summary bullet with a `ContractRef` line and a named Plan map section in `Plans/00-plans-index.md`, and given a
row in that document's root shard-index table.

| Unit | What it fixes |
|---|---|
| `ERS-001` | Ownership and authority: research is a capability, never an authority, and cannot approve, verify, complete, schedule or land anything |
| `ERS-002` | The five research stages in order, then blind adjudication, independent review and ledger landing; an unreached lead is unknown, not an absence |
| `ERS-003` | Three admitted input classes, the frozen snapshot no earlier than reconciliation, and no decision record in any research input |
| `ERS-004` | The four finding classes, the adjudicated union, a credit only on a cited passage, and candidates the adjudicator may never promote |
| `ERS-005` | Findings that need an answer are delivered as `DL-036` packets; this owner supplies content, Assistant Chat keeps the surface |
| `ERS-006` | Corrections land under the standing repair authorization after a currentness re-check, an independent review and a ledger |
| `ERS-007` | Capabilities and product choices wait for the user; an approved item authorizes planning only |
| `ERS-008` | Budget accounting: captured usage plus bounded in-flight allowance plus retained unresolved charges against the lifetime cap |
| `ERS-009` | The four limits the user sets, and the rule that a job's bound is read from the runtime record and durable meter, not an adapter label |
| `ERS-010` | Review configuration: one strong model with a turn budget sized to finish; admissions, not money or time, bound recall |
| `ERS-011` | The optional cheap breadth stage: additive, same crediting rule, never a replacement for the strong review |
| `ERS-012` | The 60-to-75-minute per-topic target with per-stage wall, summed job time and average concurrency |
| `ERS-013` | Adjudication truthfulness: a receipt per credit, source verification of code facts, the same-family disclosure, reviewer independence |
| `ERS-014` | Run provenance: freeze hashes, installed-binary runtime identity, output manifests, quiesced telemetry before hashing |

**One contract family.** `Plans/external_research_contracts.schema.json` defines six closed record shapes — the
research job record, the classified finding record, the decision packet, the decision card, the budget receipt
and the run manifest. `Plans/external_research_contract_fixtures.json` carries 12 positive and 30 negative
fixtures. Each negative mutates one named positive, names in `rejects_for` the single constraint it must fail,
and says in `reason` why the product forbids it.

| Family | Positives | Negatives | What the negatives prove |
|---|---:|---:|---|
| `research_job_record` | 2 | 6 | A decision record cannot be an input; the frozen snapshot cannot enter before reconciliation; a designed stop cannot be claimed after a time cut; an adapter label is not a bound source; no unhashed input; no job without a manifest |
| `research_finding_record` | 4 | 7 | A correction cannot be routed to a user decision; a capability cannot land under the repair authorization; no credit without a citation or a named job; a candidate cannot declare itself in the union or omit its rejection check; no fifth class |
| `research_decision_packet` | 1 | 3 | No all-at-once presentation; no colored status bars; no packet without its artifact |
| `research_decision_card` | 2 | 5 | No card from a correction; the four `DL-036` responses cannot be extended or reordered; an answered card cannot omit its recorded time; one option is not a decision |
| `research_budget_receipt` | 2 | 4 | No averaged allowance before two reconciled jobs; no dropped unresolved charge; captured usage cannot be presented as a billed amount; no receipt without a cap |
| `research_run_manifest` | 1 | 5 | No declared runtime version; no hashing with live telemetry; no freeze recorded after the jobs it governed; no empty protocol hashes; no malformed freeze timestamp |

**One scripts change, registration only.** The pair is added to the closed `CONTRACT_PAIRS` manifest in
`scripts/pm-new-contracts-verify.py` and `EXPECTED_CONTRACT_PAIR_COUNT` is raised from 30 to 31. That is the
whole diff: two lines. No semantics branch was added, no other pack's behaviour changed, and the verifier's own
comment — "Adding a contract pair is a reviewed gate change, not an ambient glob" — is why the change is stated
here rather than buried. `Plans/Automated_Testing_System.md` gains `ATS-054` for the family.

**Three consumer references, not duplicates.** `ACD-467` in `Plans/assistant-chat-design.md` records that
research packets use the existing `DL-036` artifact and one-at-a-time card flow unchanged and that a
correction-class finding never becomes a card. `PLS-023` in `Plans/Planning_Ledger_System.md` records that a
research wave lands through a registered v2 ledger that records the landing without authorizing it. `SSYS-037`
in `Plans/Settings_System.md` records that Settings holds the four research limit values while External
Research owns their meaning. None of the three restates the contract it points at.

**One ledger.** `Plans/ledgers/v2/pldg-20260917-002-external-research-canon/`, registered in
`Plans/ledgers/v2/ledger_registry.json`: 6 events, 5 design atoms, 5 decisions, 0 corrections, 5 compiled
compile-queue items and 4 open questions, with every source cited by path and SHA-256 in
`source_shards/evidence.md`.

## Where the numbers come from

Every measured figure in the owner document belongs to the September 2026 Jujutsu research campaign on one
frozen case, and each is cited by path and SHA-256 in `evidence-receipts.json` and in the owner document's
section 8.

- **Review configuration (`ERS-010`).** On one frozen case an arm capped at 40 responses per job stopped 11 of
  its 12 jobs at the ceiling and reached 18 of the 110-finding union; its own control — identical inputs, model,
  effort, admissions, workers and batching at a 160-response ceiling — finished all 12 jobs using 37 to 110
  responses per job and reached 45, and the capped arm's findings are a proper subset of the control's. The
  canon takes from this that the turn budget must be sized to finish, that a turn-capped arm's recall is never
  quoted as a model result, and that admissions are the reported bound.
- **Breadth (`ERS-011`).** Three cheap review arms reached 34, 36 and 40 of 110 for $0.5315, $0.8195 and $0.1644
  of captured usage against $82.5164 for the uncapped strong arm's 45, and one of the three, the $0.8195 arm,
  held three findings no other review arm reached. The canon takes from this that a breadth stage is worth offering and that it is
  additive, never a replacement.
- **Latency (`ERS-012`).** The full five-stage pipeline ran 6,378.3 seconds of wall time — 1 hour 46 minutes —
  at an average concurrency of 2.620, with discovery 595.1 s, implementation 1,889.2 s, history 2,079.6 s,
  reconcile 3,699.3 s and compare 658.3 s, and three reconcile jobs cut at the 2,400-second per-job limit.
  Review-only arms ran between 668.7 and 3,535.2 seconds. The 60-to-75-minute per-topic target with two to four
  agents is Jared's product target, recorded in the goal 3 brief.
- **Budget accounting (`ERS-008`, `ERS-009`).** Continuation 3's gate fixes admission against captured usage
  plus live stage allowances plus retained unresolved charges, the cold allowance until two same-arm same-stage
  jobs have fully reconciled, job-end valuation from native records, and the per-job bounds of 40 responses and
  2,400 seconds. Continuation 4's four accounting defects supply the negative rules: stream blocks are not
  responses, a response that already happened is always recorded, a record writer needs a temp name unique to
  its process, and a runtime version is read from the installed binary rather than declared.
- **Provenance (`ERS-014`).** Continuation 4's freeze history, protocol fingerprints, runtime identity and
  output manifests, including the rule that the monitor is quiesced before a tree is hashed, which came from a
  tree that failed re-hashing on one 592-byte heartbeat written four seconds after the freeze.

## Continuation 5 had not reported

The launching instruction directed that continuation 4's review-configuration and latency evidence be cited and
that continuation 5's numbers be left as an open ledger question rather than a placeholder in canon text. That
is what this branch does. `ERS-010` and `ERS-012` carry continuation 4's figures with their run named; section
5 of the owner document states that two figures are deliberately left open; and `q-001` and `q-002` in the
ledger hold the question. When continuation 5 reports, those two units are re-adjudicated against it under the
ordinary currentness rule in `ERS-006`. No placeholder, no `TBD` and no invented number appears anywhere in
canon.

## Results

| Check | Result |
| --- | --- |
| `pm-new-contracts-verify.py` | pass, 0 findings, 31 pairs, 1053 positives valid, 3409 negatives rejected |
| `pm-shard-plans.py --check --config Plans/sharding_config.json` | pass, 99 docs, 2690 shards, 0 failures |
| `pm-plan-index.py validate` | pass, 0 failures, 6671 PlanUnits, 25947 acceptance units, coverage pass |
| `pm-bootstrap-ledger-validate.py` | fail on three pre-existing governance coverage omissions, 0 warnings, every ledger-internal check passing (6 events, 5 atoms, 5 decisions, 0 corrections, 5 compile-queue items, 4 open questions, 662 PlanUnits checked) |

The ledger failure is the same class the F106 to F109 landing recorded in
`reports/jujutsu-research-2026-09-11/continuation3-landing/README.md`. This branch added
`Plans/External_Research.md` to `sharding_config` sources, because registering a new owner document requires
it; `Plans/Spec_Lock.json` and `Plans/plan_graph.json` are reseal artifacts owned by the designated Plans
agent and were not touched, and `Plans/Settings_System.md` was already outside all three coverage sets on
`origin/main`. Governance reseals belong to the designated Plans agent.

## Open questions for Jared

1. **`q-001` — continuation 5's review-configuration result, and the product default turn budget for `ERS-010`.**
   Open. The unit names continuation 4 as its run and states no default.
2. **`q-002` — continuation 5's per-stage latency against the 75-minute target, and whether the 60-to-75-minute
   per-topic target in `ERS-012` holds.** Open. The unit carries continuation 4's 1 hour 46 minutes at
   concurrency 2.620 with its stage breakdown.
3. **`q-003` — the governance coverage reseal** for `Plans/External_Research.md` and `Plans/Settings_System.md`
   in `Spec_Lock` and `plan_graph`, and `Plans/Settings_System.md` in `sharding_config` sources. Open, and it
   belongs to the designated Plans agent.
4. **`q-004` — the External Research consumer reference that belongs in `Plans/Jujutsu_Integration.md`,
   `Plans/Source_Control_System.md` and `Plans/Backup_Restore_System.md`.** Open by design: branch
   `plans/c4-corrections-20260917` held those files concurrently, and the two branches were kept disjoint.

All four are recorded as ledger question records in
`Plans/ledgers/v2/pldg-20260917-002-external-research-canon/records/questions.jsonl`.

## Claim boundary

Static schema, fixture, shard and index integrity only. No research job, adjudication, packet delivery, budget
denial or provenance check is executed by anything in this branch. No runtime, native adapter, provider,
recovery, security, performance, visual, governance seal or readiness claim is made, and no WorkNodes,
NodeSeeds, executable queues or readiness unlocks are created. The measured figures carried into canon belong
to one frozen case and establish no general model ranking.
