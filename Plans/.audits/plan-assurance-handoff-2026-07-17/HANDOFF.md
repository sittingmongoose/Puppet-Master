# Plan Assurance Program — Codex Handoff (2026-07-17)

**Audience:** the Codex orchestrating agent (5.6 Sol Ultra) taking over the Plan Assurance program from Claude (Fable 5).
**Authority:** this document is your operating instruction set, approved by Jared. Where it conflicts with older audit-era documents under `Plans/.audits/`, THIS document wins. The lab documents at `/Users/jaredsmacbookair/Documents/PuppetMaster-AssuranceLab/` (PROTOCOL.md, PROTOCOL_AMENDMENTS.md, RESULTS.md) are the authoritative experimental record.

---

## 1. Background — read this before acting

**The problem.** Puppet Master's Plans audits historically verified internal consistency but did not discover missing obligations ("unknown unknowns"). The Usage incident proved plans can look complete while being unbuildable. Root-cause reports live in `~/Downloads/pm_plan_audit_failure_root_cause_report_20260709.md` and `Puppet_Master_Plans_Review_Miss_Postmortem.md`.

**The failed path (do not resume).** Audits 001–005 and rolling-trial packets V1/V1.1/V1.2 under `Plans/.audits/` built an enormous custody/blinding/freeze/receipt harness (~90% of packet volume) that only ever detected itself: zero semantic assurance work was ever completed. Audit 005 alone is 1.1 GB / 59k files at 2.5% coverage. The paradigm error: an answer-key evaluation on a shared filesystem forced containment machinery. The replacements: **git commits are the snapshot mechanism; fresh agent contexts are the blinding; structured outputs + one small consistency check are the receipts.** V1.2 is abandoned; never finish it, never resume Audit 005, never rebuild any part of that harness.

**What has been proven (Stage A1 + A1.1, completed 2026-07-17, one day, ~7.3M tokens).**
- **Case R (kill test):** three budget-matched arms reviewed the pre-fix Usage Plans at snapshot `31507ba19`, scored against a 19-class/71-weight answer key derived mechanically from the historical fix commits. One-shot outside-in scored 28.2% weighted recall; adding external research 38.0%; adding 3 iterative coverage-feedback rounds **62.0%** (5.5/7 criticals, unsaturated at cutoff). Preregistered bars: 60% weighted (PASS at 62%), 80% critical (NARROW FAIL at 78.6% — one half-credit short under the 3-round cap).
- **Findings quality:** blocking precision 100% in every arm; ~82 independent citation checks across both cases found **zero fabrications**.
- **Case L (live holdout):** the full method on the migrations/durable-state family produced 33 adjudicated findings (6 critical — e.g., non-atomic safe-point restore contradicting a contractual "original state preserved" promise; unrecoverable redb-canonical families while docs claim rebuildability). User reviewed and confirmed: **all valid** (L3 pass, 10/10). A Codex-ready repair brief exists: `AssuranceLab/case-L/REPAIR_BRIEF.md`.
- **Conclusions:** the qualified method = **external research with failure archaeology + implementer ambiguity probes + conservative verify-before-confirm adjudication + iterative coverage-feedback rounds**. Outside-in ceremony *without* research adds nothing over a strong plain reviewer. Iteration is the recall lever.

**Key artifact locations (all outside the repo, in `/Users/jaredsmacbookair/Documents/PuppetMaster-AssuranceLab/`):**
- `PROTOCOL.md`, `PROTOCOL_AMENDMENTS.md`, `RESULTS.md` — protocol, amendments A-1..A-4, verdicts.
- `case-R/packet/` + `case-R/packet-addendum/` — the frozen review packet (snapshot `31507ba19`).
- `case-R/key/` — **QUARANTINED answer key**: no discovery/review agent may ever read this directory; only scorers.
- `case-R/arms/arm1|arm2|arm3|arm4-iterative/` — findings per arm; `arm4-iterative/state.json` is the cumulative campaign state.
- `case-R/scoring/` — scoring.json + scoring_arm4.json (match standards; new scorers must calibrate to these).
- `case-L/packet/`, `case-L/arms/full/findings.json` (the 33 confirmed findings), `case-L/arms/baseline/`, `case-L/REPAIR_BRIEF.md`.
- Repo: branch `f3-evidence-archive` preserves the F3 experiment (commit `08e83b38d`). Snapshots: `31507ba19` (Case R), `04f804f88` (reserve, pre-overhaul Usage).

## 2. Operating rules (non-negotiable)

1. **Model tiers.** Sol Ultra: orchestration decisions, adjudication, scoring, final synthesis, the hardest discovery. Sol Extra High: discovery lenses, external research, ambiguity probes, Plan repairs, characterization-judgment checks. Sol Light: extraction, packet building, inventories, greps, citation-existence checks, mechanical merges. Match tier to task; don't spend Ultra on mechanical work.
2. **Parallelize aggressively**, but ask Jared before exceeding **16 concurrent agents**.
3. **Disk-first, fresh contexts.** Every agent writes durable results immediately; units run in fresh contexts; no long-lived orchestrator context accumulating hundreds of turns (context rot produced hallucinated limitations in prior sessions). Expect infrastructure failures (connection drops, session limits): design so any unit can be retried without losing completed work. One infra retry per agent.
4. **No harness-building.** Banned: custody chains, frozen source epochs, launch-authority receipts, containment forensics, validators that validate your own experiment machinery. If a task seems to need one — stop and ask Jared. Git + fresh contexts + one small fail-closed consistency check per phase is the ceiling.
5. **Preregister before scoring.** Bars are written to `PROTOCOL_AMENDMENTS.md` BEFORE any scored run launches; never adjusted after results are visible; failures reported as failures. No composite score may hide a failed criterion.
6. **Blinding is cooperative, not adversarial.** Review agents get only their packet + (where authorized) web research; they never read `case-R/key/`, `case-R/scoring/`, `Plans/.audits/` history, or `~/Downloads` reports. Scorers/adjudicators are not blinded.
7. **Budget fuses per phase** (below); track and report reported-token spend and control-plane share (target <20%).
8. **Repo discipline** (per `.claude/CLAUDE.md`): edits only under `Plans/**`; never hand-edit `Plans/_shards/**` or `Plans/.evidence/**`; after canonical Plans edits run `python3 scripts/pm-shard-plans.py --generate` then `--check`, and `python3 scripts/pm-plans-verify.py run-gates`. No emojis anywhere (inline SVGs only). No secrets.
9. **Severity vocabulary** (use everywhere): critical = customer-misleading about system truth OR forces an implementer to invent consequential semantics; major = consequential, bounded; minor = cosmetic/hygiene.
10. **Research policy:** every capability gets an external-research disposition; depth varies with risk, participation does not. Research must attempt official contracts/docs, real comparators, adjacent approaches, and **failure archaeology** (issue trackers, bug reports, postmortems — the measured lift came disproportionately from these). Classify every takeaway: hard_constraint / expected_user_outcome / failure_lesson / candidate_capability / optional_differentiator / rejected_approach / unresolved_question. Comparator behavior never becomes a requirement merely because a competitor does it.

## 3. The work — four phases

### Phase 1 — A1.2: clear the recall bar (run first; small)

Purpose: extra verification that the method is trustworthy before scaling it. Continue the iterative campaign from `case-R/arms/arm4-iterative/state.json` with **rounds 4–5** (same structure: blinded merge/assess agent self-identifies weak areas with NO key access → two targeted fresh workers with research, per round; early-stop on self-assessed saturation).

- Preregister as amendment A-5 in the lab `PROTOCOL_AMENDMENTS.md` BEFORE launch. Bars: full-key critical recall ≥ 80% (≥ 5.6/7), weighted recall ≥ 60% maintained, blocking precision ≥ 70%, fabrication 0 (all new criticals + 8 seeded-random majors). Disclose that this is cumulative budget (~5 rounds total), never "iteration beats one-shot at equal cost".
- Scoring: fresh Ultra scorer calibrated to `scoring.json` + `scoring_arm4.json` match standards; descriptive numbers only; controller applies bars. The remaining partial criticals to watch: OM-01 (settlement lifecycle), OM-06 (cost authority), OM-11 (GUI propagation) — the assessor will likely find these itself; do NOT leak this list to review agents (it derives from the key).
- Budget: ≤ 1.2M reported tokens, ≤ 12 agents. If A1.2 still misses a bar: report honestly, then ask Jared whether to proceed to Phase 3 on trajectory evidence or iterate the method design. Do not silently continue.

### Phase 2 — Execute the Case L repairs (parallel with Phase 1)

Apply `AssuranceLab/case-L/REPAIR_BRIEF.md` to the canonical Plans. This is authorized canonical-edit work.

- Owner-first: fix owner docs (mostly `Plans/storage-plan.md`, plus `Contracts_V0.md`, `FileSafe.md`, `Release_Supply_Chain.md`), then propagate to consumers listed per finding. Follow the brief's sequencing/blast-radius section; batch edits per owner doc.
- Each repair must FIX the enumerated consequential decisions (the brief lists them; where a genuine product decision is open, propose a default and flag it for Jared rather than silently choosing — collect these into one decision list surfaced at the end of the phase).
- Match existing document conventions (PlanUnit structure, acceptance criteria, ContractRefs, vocabulary). Use Sol Extra High for repairs, Ultra for the cross-doc consistency review.
- Verification (mandatory): after edits, (a) run the shard + gates pipeline (rule 8); (b) run an independent closure check — a fresh adjudicator re-reads each of the 33 findings against the repaired docs and classifies closed / partially-closed / not-closed with citations; (c) a citation-honesty spot check on the closure report. Iterate until all criticals and majors are closed or explicitly deferred by Jared.
- Budget: ≤ 4M reported tokens including verification.

### Phase 3 — Rolling whole-Plans capability audit (after Phase 1 completes)

Audit the ENTIRE canonical corpus with the qualified method, capability-family by capability-family. This is what Jared asked for before any Planning Wizard integration.

- **Denominator: capability families, never documents/windows/atoms.** First run a mapping pass (Light/XH agents over `Plans/00-plans-index.md`, the 133 authority sources, and `Plans/.plan_index/` greps) producing 30–60 families, each = one capability + its owner/consumer neighborhood, with a risk tier (money/auth/data-loss/provider/autonomy = highest). **Present the family map to Jared for approval before mass launch.**
- Per family (the qualified loop): packet/inventory build (Light) → discovery lenses incl. mandatory research w/ failure archaeology (XH; 2–3 lenses chosen for the family's failure modes) → 2 implementer ambiguity probes, packet-only (XH) → conservative adjudicator verifying every candidate against live Plans text with named instances and source attribution (Ultra) → fabrication check on criticals + sample (Light for existence, XH for characterization) → iterate additional targeted rounds until self-assessed saturation (cap 3 rounds/family default) → per-family findings.json + FINDINGS.md + repair brief.
- Families already covered: migrations/durable-state (Case L — skip; re-check closure post-Phase-2). Usage (repaired historically + heavily probed — run late, expect mostly beyond-key items; A1 arms' beyond-key findings, 68 plausible-real on the snapshot, are candidate leads worth re-checking against current HEAD).
- Run families in parallel batches within the 16-agent ceiling; highest-risk first. Keep a visible running ledger (one markdown status file: families done / in-flight / pending, finding counts by severity, spend) so Jared can see assurance debt at any time.
- Guidance budget ~1.5–2.5M tokens/family (A1 actuals); ask Jared for a total-budget ceiling at kickoff with the family count. Kill triggers: control-plane >20%, any harness-building impulse, a family exceeding 2× budget without proportionate findings.
- Output: per-family repair briefs + a corpus-level synthesis report (findings by severity/family, cross-family seam issues noticed, residual-risk register).

### Phase 4 — Planning Wizard integration spec (only after Phase 3, with Jared's go)

Write the assurance overlay into canon (this becomes product spec, so full repo conventions apply): the three records (`AssuranceItem`, `AssuranceLink`, `PlanAssuranceReceipt` — everything else is derived views, never peer canon); research-disposition policy (§2.10); ambiguity probes at Topic Ready; iterative per-topic assurance loops with visible assurance debt; continuous cross-topic seam checks; a separate Plan Assurance Gate consuming the receipt at Approve And Build (GATE-012 stays requirements-hygiene). Insertion points already exist: PWIZ-003/004/005/006/011/014/018 in `Plans/Planning_Wizard.md`. Draft the spec, present to Jared for review BEFORE writing canon.

## 4. Reporting to Jared

At each phase boundary and on request: verdicts against preregistered bars, spend vs budget, deviations, and the decisions only he can make (open product decisions from repairs, family-map approval, phase-3 budget, phase-4 go). Lead with outcomes; be honest about failures; never present a partial result as complete. End sessions with a durable status write so a fresh session can resume from files alone.

## 5. Live continuity addendum — 2026-07-25

This addendum supersedes older live-state projections in this handoff; it does not supersede the durable protocol, amendments, or immutable run artifacts.

- A21 remains overall `FAIL`; only `P3-FAM-035` earned successor credit. Strict Phase 3 is `49/59` valid families and 1,336 cumulative admitted findings.
- The ten mandatory families remain `P3-FAM-004`, `013`, `015`, `017`, `018`, `023`, `032`, `034`, `044`, and `054`. None may be skipped, waived, merged away, or treated as inherited satisfaction.
- A22 is sealed as `PHASE3_A22_CONTROL_FAILURE_STOPPED_FOR_MASTER_REVIEW` with zero new family or finding credit. Its exact dispatch receipts violated the preregistered custody schema; retroactive projections are prohibited. All ten A22 family terminals are failures.
- The authoritative A22 stop is `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase3/final-ten-a22-controller-template-successor-2026-07-23/23_A22_CONTROL_FAILURE_CORRIGENDUM_AND_STOP.json`, 7,957 bytes, SHA-256 `cb3a22d81abe2b4f14e28085425f93fd3a10677458c70b52e7afc647e924fad2`.
- The Master seal is sibling artifact `24_MASTER_ADJUDICATION_AND_A23_PREFLIGHT_RELEASE.json`, 5,325 bytes, SHA-256 `fc015c127ff756fec5fe9d0c1880a091b45517b7dae64be8d31c30b5135b82c7`.
- The current effective 153-source corpus is 25,582,717 bytes with canonical-row SHA-256 `c8441af89836f3c62b48a5b77b9dc2bbecf2aaf6ac92f162d1822e214d5f4e37` and zero current mismatches.
- Eleven changed source rows touch 46 mapped families. Eight are in the mandatory ten; the other 38 retain historical discovery credit but require a separately preregistered current-byte delta before consolidated repair may claim current-source discovery coverage.
- Only A23 prelaunch/control design is released under proposed namespace `final-ten-a23-controller-closed-successor-2026-07-25`. No semantic dispatch is authorized until a new append-only protocol amendment and independent prelaunch gates freeze the complete controller-owned identity, receipt, population, template, fuse, and adjudication contract.
- Use Sol 5.6 Extra High as the workhorse. Ultra is reserved for an eligible later Bar 11 score. Keep prompts short, contexts zero-descendant, concurrency at or below 16, and every enforceable boundary in controller logic.
- Consolidated repair, the current-byte delta run, the four-model live audit, Incremental work, Event Authority resolution, canonical Plans edits, governance regeneration, runtime/build work, certification, cleanup, and Phase 4 remain locked. Phase 4 still requires Jared's explicit go.

## 6. Live continuity addendum — 2026-07-28

This addendum supersedes §5 only for current next-action state. It preserves every earlier failure and does not alter protocol bars.

- Thin-controller R2 is terminal `THIN_R2_ALL_TEN_FAIL_ZERO_FAMILY_CREDIT_CURRENT_METHOD_STOPPED_FOR_REDESIGN`.
- Strict Phase 3 remains `49/59` valid families and 1,336 cumulative admitted findings. All ten families in §5 remain mandatory.
- `P3-FAM-015` and `P3-FAM-054` failed at Stage 5. Seven families failed Stage-7 depth or matrix review. Direct Master review rejected worker-level survivor `P3-FAM-023` for unsupported formulaic depth and omission of required consumer `Plans/PRD_Builder.md`.
- Bar 11 is `UNSCORED_NO_ELIGIBLE_BLOCKING_ROWS`; no Ultra scorer ran.
- Binding artifact: `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase3/final-ten-thin-controller-reset-2026-07-28/execution-r2-fresh-context/stage7/STAGE7_MASTER_ADJUDICATION_AND_R2_TERMINAL.json`, 11,830 bytes, SHA-256 `5b30416536c34de98df720c996a9f2f1fea4d92d702d05551d13ff59b8edf4c2`.
- Do not rerun the current seven-stage/model-authored-matrix shape. The next successor must keep every frozen bar and family while moving deterministic row construction to a compact controller template; models supply short semantic judgments and evidence, and independent reviewers emit only defect verdicts.
- The exact A52 153 source rows still rehash clean, but the next membership freeze must add canonically referenced `Plans/CozyShelves_PM7_Control_Reconciliation.json` and map it into the current-byte family delta. The minimum current census is therefore 154 paths / 26,396,691 bytes.
- All repair, current-byte delta execution, four-model execution, Incremental work, Plans edits, Event Authority work, Phase 4, runtime/build work, governance, certification, and cleanup remain locked pending separately preregistered releases.
