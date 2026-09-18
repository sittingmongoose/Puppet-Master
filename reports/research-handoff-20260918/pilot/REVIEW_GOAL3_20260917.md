# Independent review of goal 3 — `plans/goal3-research-20260917` @ `07f4cb7cc1` (2026-09-17)

**I am an Opus 5 agent.** Read-only throughout: no edit to the branch, its worktree or the shared
checkout, and no git command that changes state. Regeneration ran on a copy under
`~/PM-Experiments/g3-review-20260917/`. This review was interrupted once by a session limit; both
mechanical sub-reviews were re-run from scratch rather than trusted from partial output, and I
re-verified every consequential claim they returned against the sources myself.

The branch adds the owner document `Plans/External_Research.md` (ERS-001…ERS-014), a contracts schema
and fixture pair, four consumer references, a ledger, a three-line registration edit to the contracts
verifier, and a result bundle — 201 files across six commits, all under `Plans/`, `scripts/` and
`reports/`.

**Verdict: fix first.** Six should-fix items, none blocking. The canon content is sound and unusually
well-evidenced: every measured figure I checked reproduces exactly, every hash verifies, all 42
fixtures behave as claimed, and nothing promises what the experiments did not exercise. The fixes are
small and four of the six are about claims *around* the canon rather than the canon itself.

---

## Findings

### Blocking

**None.** I found nothing untrue in the owner document, no hash that fails, no fixture that passes when
it should fail, and no promise that outruns the evidence.

### Should fix

**S1 — `ERS-005` restates DL-036's field list, and the branch's own `ACD-467` shows the right pattern.**
`ERS-005` enumerates the seven decision-card content fields — "the plain name, the one-sentence
question, why it came up, what the user gets, what it costs, the options and the recommendation if
there is one". That list is DL-036's own, at `Plans/Decision_Log.md:364`. The branch's consumer
reference does it correctly: `ACD-467` says only "Each card carries its research finding reference and
**the plain-language fields the research owner supplied**", with no enumeration. The project rule is
explicit — `Plans/DRY_Rules.md:117`: "Consumer docs MUST cross-reference the owner doc rather than
redefining canonical details. **Tables, enums, field lists, and behavioral rules live in the owner doc
only.**" — and the brief asked for DL-036 "referenced rather than restated". `ERS-005` is right that
this owner *supplies* the content; it should name the form by reference and enumerate only what is
research-specific: the finding reference, its class and its cited passages. The rest of `ERS-005` is
already a clean delegation, including its explicit disclaimer of the card contract, the response set,
the artifact behaviour and the questionnaire reuse.

**S2 — script-owned literal counts, which `main` ruled out of this very document one commit after the
branch point.** `ATS-054` states "the closed CONTRACT_PAIRS manifest of
`scripts/pm-new-contracts-verify.py`, **whose authored cardinality rises from 30 to 31**", and its
`preserved_exact_tokens` at `Plans/Automated_Testing_System.md:4884` carries the bare numeric token
`"30 negative fixtures"`. `main` is now at `2a92905501`, "plans: drop stale script-owned literal counts
from canon", which edits this same document to remove a literal census and adds the negative
constraint: "Do not restore a literal Touch Closure census to this gate registration; **the
denominators belong to `scripts/pm-touch-closure-verify.py`**." That commit names
`pm-new-contracts-verify.py` explicitly as a count owner.

I checked the house pattern before flagging this, because it matters whether the branch deviated or the
policy moved. It is the policy that moved: `ATS-046` — the very unit `ATS-054` declares `depends_on` —
carries `"28 negative fixtures"` in its own `preserved_exact_tokens` at `:4156`. The branch is exactly
consistent with its immediate precedent and could not have seen `2a92905501`. The direction is older
than that commit, though: the `00-plans-index` entry for `ATS-045` from 2026-09-06 already draws the
same line ("Historical v1 workbooks retain their 8,252-case snapshot; fresh v2 workbooks derive their
denominators"). Drop the cross-pack cardinality clause and the numeric preserved token; keep the
per-pack counts if Jared wants them, since `ATS-046` still has its own. Section 5 of
`External_Research.md` carries the same clause and needs the same trim.

**S3 — `ERS-008`'s two pricing sentences are sourced from a file that is not in its `source_lineage`.**
"a runtime that reports no per-run cost is priced from its native per-response records at the published
tariff, floored so captured usage is never recorded as zero" is near-verbatim from
`reports/jujutsu-research-2026-09-11/continuation4/README.md:93-95`. `ERS-008`'s unit-level
`source_lineage` lists only `continuation3/gate/cost-policy.json`, `continuation3/gate/README.md` and
`continuation4/corrections.json`, and I confirmed the floor rule is in none of those three. The
document-level table in Section 8 does cite `continuation4/README.md`, so this is an incomplete unit
lineage rather than an uncited claim — but the unit that makes the promise should name the run that
established it, which is this document's own stated standard.

**S4 — the bundle README overstates disjointness; one shared file is a guaranteed conflict.**
`reports/external-research-canon-20260917/README.md:140` says "the two branches were kept disjoint".
They are not, quite. `plans/c4-corrections-20260917` (base `a6162b559b`, head `8237d71e51`) shares
**eight** files with this branch: the six `Plans/.plan_index/*` files, `scripts/pm-new-contracts-verify.py`,
and `Plans/ledgers/v2/ledger_registry.json`. The registry is the real problem: both branches append a
new object at the same insertion point and both rewrite the same trailing `updated_at_utc` line, so
whichever lands second conflicts on both hunks. Resolution is mechanical — keep both entries and the
later timestamp — but it should be named rather than discovered at landing. The verifier script is
adjacent but composable: `plans/c4-corrections-20260917` adds a Jujutsu semantics branch and touches
neither `CONTRACT_PAIRS` nor `EXPECTED_CONTRACT_PAIR_COUNT`, so there is no count collision. The
`.plan_index` files are regenerated, never hand-merged. The narrower claim in `verification.json` — that
this branch edits none of `Jujutsu_Integration.md`, `Source_Control_System.md`,
`Backup_Restore_System.md` or the final-GUI contract files — **is** true as written; it is only the
README's looser sentence that overstates.

**S5 — the Working_Notebook precedent added a Glossary section; this branch adds none.** `99a3c7db9d`
registered its owner document with a `### Working Notebook terms` section in `Plans/Glossary.md`. This
branch touches `Plans/Glossary.md` not at all. Nothing in the bundle claims it did, so this is not a
false statement — but "registered exactly as `Plans/Working_Notebook.md` was" is the branch's framing,
and this is the one precedent element silently skipped. Either add `### External research terms` or say
in the bundle why the terms are left to the owner document.

**S6 — a small arithmetic claim in the bundle README.** `README.md:55` says of the scripts edit "That
is the whole diff: two lines." It is two added and one removed — three changed lines. The commit
message's "two lines of registration" is fair; the README's "whole diff" is not. Trivial on its own, but
this is a bundle whose value rests on exact claims, and the author has already had to repair two.

### Notes

**N1 — the three ledger-validator errors are correctly routed, but "pre-existing" is not the whole
story.** I ran the validator: `status: fail`, exactly three errors, zero warnings — matching `q-003`'s
claim that it fails on governance coverage "and nothing else". `Plans/Settings_System.md` is missing
from sharding_config sources, and both `Plans/External_Research.md` and `Plans/Settings_System.md` are
missing from Spec_Lock and plan_graph coverage. I confirmed against `main` that the `Settings_System`
omissions are genuinely pre-existing, and that the branch **did** correctly add `External_Research.md`
to sharding_config. The `External_Research` half of errors 2 and 3 is caused by this branch, but
unavoidably: a new owner document cannot appear in a governance seal until the seal phase runs, and
AGENTS.md reserves that to the designated Plans agent. `q-003` routes all three there, which is
correct. The report should just say two of the three name a document this branch created, so no reader
concludes the branch inherited all of it.

**N2 — Section 8 cites a mutable file by hash.** The lineage table cites
`PM-Experiments/…/REVIEW_ADJUDICATION_20260916.md`. That is my own review document, which has been
appended to several times this week. All 18 hashes verify right now, but that row is a read-time
snapshot of a moving file — the same class of issue I raised as S8 against the continuation-4
adjudication bundle. Label it as read-at-2026-09-17 or cite a frozen copy.

**N3 — `q-004` documents the disjointness handoff deliberately.** The branch avoided
`Plans/Jujutsu_Integration.md`, `Plans/Source_Control_System.md` and `Plans/Backup_Restore_System.md`
because `plans/c4-corrections-20260917` held them, and raises "who adds the External Research consumer
reference to those owners later" as an open question rather than dropping it. That is the right way to
keep two branches apart without losing the work, and it is what makes S4 a wording fix rather than a
process failure.

**N4 — regeneration is byte-identical where it can be.** All 2,888 `Plans/_shards/` files regenerate
identically, and the generator demonstrably rewrote every one of them rather than skipping. Four of the
six `.plan_index/` files differ by exactly one line each — the `generated_at_utc` stamp — with no
content difference anywhere. That is the generator's intended non-determinism, not drift.

**N5 — this contract family has no dedicated test module.** The Working_Notebook precedent shipped
`scripts/pm-working-notebook-contracts.py`, its own subcheck, and `tests/test_pm_working_notebook_contracts.py`.
This family instead joins the shared pack list, which is what the brief directed after checking how
packs are registered, and the branch says so openly in the ledger's `authorization.md`. Worth a
conscious decision rather than an inherited default.

**N6 — a pre-existing gate weakness, not this branch's.** `materialize_invalid` in
`scripts/pm-new-contracts-verify.py` applies negative-fixture patches without `require_existing=True`,
so a typo'd dotted path would create a phantom key, fail on `additionalProperties: false`, and score as
a pass. All 30 of this branch's negatives resolve to pre-existing locations, so none exploits it — but
the gate would not have caught it if one had. Worth a separate hardening task.

**N7 — one number in the task brief is wrong, and it is the brief's.** The branch changes **165**
`_shards` files, not 167, and the union across all six commits is also 165, so nothing was
churned-then-reverted.

---

## 1. Every ERS unit is grounded, and none promises what the experiments did not exercise

I re-derived every numeric and factual claim in the fourteen units against the landed sources.

**`ERS-010` (review configuration) — exact.** "an arm capped at 40 responses per job stopped 11 of its
12 jobs at the ceiling and reached 18 of the 110-finding union, while its own control … at a
160-response ceiling finished all 12 jobs using 37 to 110 responses per job and reached 45, with the
capped arm's findings a proper subset of the control's." Every figure reproduces. The unit cites **45**,
the post-review corrected figure now on `main`, not the originally published 46.

**`ERS-011` (cheap breadth) — exact, including the claim the author had to repair.** 34, 36 and 40 at
$0.53, $0.82 and $0.16 against $82.52 for the uncapped strong arm's 45, all correct; and "one of the
three, at 0.82 dollars, held three findings no other review arm reached" matches glm53's exclusive set
{F069, F085, F086} exactly. This is what commit `a551a0648b` fixed, and it is now right — note the
repaired arm is the *dearest* of the three cheap arms, which is why the original "cheapest" framing was
wrong rather than merely imprecise.

**`ERS-012` (latency) — exact, and it quotes the published table rather than recomputing.** 6,378.3 s,
1 h 46 m, concurrency 2.620, and per-stage 595.1 / 1,889.2 / 2,079.6 / 3,699.3 / 658.3 all match
`arm-reports/union.json`. "Review-only arms ran between 668.7 and 3,535.2 seconds" also matches the
runner README's arm rows exactly. I checked this against raw `processing_seconds` first, found 668.8 and
3,535.3, and then confirmed the unit is faithfully quoting the published bundle rather than
miscomputing. The per-stage walls sum to more than the arm wall, which is correct and not an error: the
unit defines them as admission-to-terminal spans, which overlap at concurrency 2.6. The
60-to-75-minute target is presented as "the product target", Jared's, with the measurement separately
attributed.

**`ERS-008` / `ERS-009` (budget) — match the gate design and all four continuation-4 fixes.** Against
`continuation3/gate/cost-policy.json` I confirmed `cold_stage_allowance_usd: 12`,
`minimum_fully_reconciled_jobs_for_average: 2`,
`allowance_scope: same_arm_and_same_stage_per_job_average`, the unresolved-charge rule and the per-arm
lifetime caps — every clause of `ERS-008` maps to one. All four continuation-4 defects are reflected,
which I checked individually rather than assuming: **D1** is `ERS-008`'s negative constraint "Do not
count a runtime's stream blocks as model responses"; **D2** is "Do not deny a response that already
happened, and do not let job-end receipts outnumber the durable request count" plus `ERS-009`'s "A
response ceiling is read as at most N admitted with one response possibly already in flight"; **D4** is
`ERS-014`'s "captured at capability time from the installed binary, never declared"; **D3** is covered
by `ERS-014`'s freeze and quiesce discipline. `ERS-009`'s "an adapter may report any denial as a budget
denial when the cause was the response ceiling" is exactly the deepseek41 `budget_truncated` /
`model_request_limit` split.

**`ERS-006` / `ERS-007` (landing and wait) — match DL-043's note and the F106–F109 precedent.** DL-043
at `Plans/Decision_Log.md:530` reads "The one correction the same research produced … was landed
separately under the **existing repair authorization** and is not a decision here", and at `:528`
"Acceptance authorizes planning those items as PlanUnits under their owners; implementation follows the
existing Approve And Build path", and "declined and deferred items stay recorded and are never
re-asked". `ERS-006` and `ERS-007` track all three almost verbatim and attribute them correctly.
`ERS-006`'s three gates — currentness re-check, independent review by an agent that ran no job, ledger
with evidence by path and SHA-256 — match the `continuation3-landing` bundle, which carries
`currentness-before-edit.json`, "stopped for independent review before landing on main", and a
registered ledger.

**`ERS-013` (adjudication truthfulness) — grounded in the record it cites**, including the three
distinct outcomes it names: an error asserted as fact, an error quarantined as an unverified inference
with its verification step written down, and the overturning of a correct inherited framing. The last
is a finding from my own earlier review, correctly carried.

**`ERS-002` / `ERS-003` / `ERS-004` — sound.** The leakage boundary is crisp and testable: three
admitted input classes, decisions excluded from every stage, the frozen snapshot admitted no earlier
than reconciliation, every input hashed with a disagreement stopping the job before dispatch.
`ERS-004`'s "unsupported_or_covered is a class of the union, not a false-positive rate" and "adding a
candidate to the union is the union owner's act, never the adjudicator's" are the adjudication bundle's
own limits, correctly carried.

**Nothing promises beyond the evidence.** Section 5 states that runtime proof "remains NOT_RUN" and
that the quoted figures "are results … on one frozen case; they are the basis for the promises here,
not a general performance claim". Section 7 goes further: "It does not rank models: every recall, cost
and duration figure here belongs to one frozen case and is reported with the limits that produced it.
It does not certify spend: captured usage is an upper-bound estimate, never a billed amount." I found
no unit that overreaches that posture. The one place I suspected it might — `ERS-009`'s
unresolved-usage disposition, where only one of the two modes was exercised — is resolved by
`SSYS-037`: "retained unresolved usage stays visible whichever disposition is chosen", so the exercised
behaviour holds in both modes and only admission-blocking is new.

**Continuation 5 is left open, not stubbed.** Section 5: "the continuation-5 result is an open ledger
question (`q-001` and `q-002`) rather than a placeholder in canon text. When continuation 5 reports,
those two units are re-adjudicated against it under the ordinary currentness rule in `ERS-006`." Both
questions exist, are `status: open`, and name the launching instruction in `raised_by`.

## 2. Hashes and citations

Given that the author previously fabricated a base-commit hash and mis-attributed an arm, I recomputed
rather than sampled. Across the branch, **every path-plus-hash claim verifies**:

| Where | Claims | Result |
|---|---:|---|
| `Plans/External_Research.md` Section 8 lineage table | 18 | 18 verified, 0 mismatch, 0 missing |
| `reports/external-research-canon-20260917/**` | 48 distinct pairs (66 claims counted by the sub-review's extraction) | all verified |
| `Plans/ledgers/v2/pldg-20260917-002-…/` | 18 | 18 verified |

The repaired base commit `a6162b559b502278458a56e95c5c0891c3e2a505` is real, its subject is "concept:
import Batch 18 completion via guarded update", and it is both `git merge-base` with `origin/main` and
`bad2b3dc94^`. The fabricated value it replaced had the correct ten-character prefix with an invented
tail — which is exactly the failure mode that short-prefix citation invites and that only full-hash
verification catches. Worth keeping as a lesson: cite full hashes, and verify them mechanically.

## 3. Contracts and fixtures — I validated all 42 myself, and a sub-review did so independently

`jsonschema` 4.19.2 is available, so I ran the pack rather than reasoning about it. Each negative is a
single `patch` or `remove` mutation of a named `base_valid` positive, carrying `rejects_for` and
`reason`.

- **12 of 12 positives validate**, each against its declared family and matching exactly one of the six
  `oneOf` branches.
- **30 of 30 negatives are rejected, and every one fails for exactly the constraint its own
  `rejects_for` names.** Zero mismatches. The independent sub-review reached the same result by a
  different method, and additionally confirmed all 30 mutation paths resolve to pre-existing locations
  (see N6 for why that matters).

The negatives encode the real lessons rather than generic shape checks:
`job_admits_a_decision_record_input` fails on the closed `input_class` enum (the leakage boundary),
`job_reports_an_adapter_label_as_its_bound` on the `bound_by_source` enum (the continuation-4 adapter
defect), `finding_correction_routed_to_a_user_decision` and
`finding_capability_landed_under_repair_authorization` on the ERS-006/007 boundary in both directions,
`card_with_a_fifth_response` and `card_with_reordered_responses` on DL-036's fixed response set, and
`receipt_averaging_after_one_reconciled_job` on the two-job minimum from the gate cost policy. Ten of
the thirty exercise `allOf/then` or `/else` conditionals rather than property-level constraints — the
hard case, and the one most easily faked.

Three manifest negatives encode findings from my own earlier reviews of the same campaign:
`manifest_with_a_declared_runtime_version`, `manifest_hashed_with_live_telemetry`, and
`manifest_whose_freeze_followed_its_first_job` — the last using the literal malformed timestamp
`2026-09-17T00:1xZ` from the runner bundle as its pattern-failure case. That is good traceability from
defect to test.

Six families, each with positives and negatives, split 6/7/3/5/4/5 exactly as Section 5 states.

## 4. Registration, scripts edit and derived files

**Registration follows the Working_Notebook precedent on all four mechanisms** — the `sharding_config.json`
sources append, the Change Summary bullet in the same phrasing template, a named Plan map section, and
the root shard-index row. The two deviations are correct or disclosed: the governance reseal is
deliberately not done (AGENTS.md reserves it to the designated Plans agent, and it is disclosed three
ways), and `Plans/auto_decisions.jsonl` is correctly left alone. The Glossary omission is S5 and the
validator-shape difference is N5.

**The scripts edit is registration only.** One tuple appended to `CONTRACT_PAIRS` in correct
alphabetical position and `EXPECTED_CONTRACT_PAIR_COUNT` 30 → 31. No semantics branch, no glob, no
change to any other pack. I ran the verifier on the branch: `status: pass`, `findings: []`,
`contract_pairs: 31`, `positive_cases 1053/1053 valid`, `negative_cases 3409/3409 rejected`,
`metaschemas_valid: 31`, `internal_self_tests 12/12`. **"contracts 31 pairs 1053/3409" reproduces
exactly.**

**Derived files are clean and in scope.** `pm-shard-plans.py --check --config Plans/sharding_config.json`
returns `status: pass`, `docs_checked: 99`, `shards_checked: 2690` — reproducing "shards 99 docs 2690" —
and `pm-plan-index.py generate` returns `plan_unit_count: 6671`, reproducing "index 6671 units". The 165
changed shard files map to exactly five shard directories, every one owned by an edited document;
`Plans/Settings_System.md` correctly has no shard directory because it is not in the sharding sources,
on this branch or on `main`. In `plan_units.jsonl`, 18 units are added, none removed, and of the 644
"changed" units every difference is `source_doc_sha256` or `source_location` only — no unit outside the
six edited documents has a substantive change. No governance artifact is touched.

## 5. Consumer references — all four are references

`ACD-467` is the model: it restates only what `assistant-chat-design.md` itself owns, assigns packet and
card *content* to `External_Research.md`, refers to "the plain-language fields the research owner
supplied" without enumerating them, and adds the boundary rule "a correction-class finding is never
presented for a user decision".

`PLS-023` is the cleanest: it gives the ledger's role, states the anti-duplication rule itself
("Research bundles and run manifests remain published where they were produced and are cited by path
and SHA-256 rather than copied into the ledger"), keeps authority where it belongs ("The ledger records
the landing; it does not authorize it"), and does not restate ERS-006's three gates in detail.

`ATS-054` is a validation registration rather than a duplication — describing fixture coverage is that
document's job, and `ATS-046` is equally verbose about its own 28 negatives. Its only problem is S2.

`SSYS-037` is the closest to overlap and still a reference: it repeats `ERS-009`'s "per-job limits, not
the cost cap, are what usually ends a job" as a *control-copy obligation*, and introduces the
`blocks_admission` / `visible_only` enum that `ERS-009` gives only in prose. It disclaims semantics and
defaults to `External_Research.md`, and is honest that the inventory rows "are registered in the
authorized inventory wave, **and until then no row is claimed to exist**".

## 6. Hygiene

Six commits, each scoped to a coherent step with its source edits and the derived files regenerated
from them committed together, exactly as AGENTS.md requires. No `git add -A` signature; nothing stray.
All six carry the co-author line. Branch name matches the `<kind>/<name>-<date>` template. The worktree
is clean and the branch is pushed and in sync with its remote. **Secrets: clean** — no credential-shaped
string anywhere in the added lines, and every high-entropy hit is an identifier or a repo path.
**Emoji: clean** — zero emoji on any added line across all 201 files; the pre-existing glyphs in three
documents are all on untouched lines.

---

## Fix list

1. **S1** — `ERS-005`: replace the seven-field enumeration with a reference to DL-036's form, keeping
   only the research-specific additions.
2. **S2** — drop the cross-pack cardinality clause from `ATS-054` and Section 5, and the numeric
   `preserved_exact_tokens` entry, per `2a92905501`.
3. **S3** — add `continuation4/README.md` to `ERS-008`'s `source_lineage`.
4. **S4** — correct the bundle README's disjointness sentence, and name the
   `Plans/ledgers/v2/ledger_registry.json` conflict with `plans/c4-corrections-20260917` so whoever
   lands second expects it.
5. **S5** — add the Glossary terms section, or say why it is omitted.
6. **S6** — "two lines" → three changed lines.

Then rebase onto `origin/main` (currently `2a92905501`), regenerate the derived files rather than
replaying them, and re-run the three landing checks AGENTS.md now requires. The rebase itself is
textually clean: `2a92905501`'s hunks in `Plans/Automated_Testing_System.md` and
`Plans/00-plans-index.md` do not overlap this branch's.

## Commands run

```
git fetch origin ; git rev-parse <branch, origin, main, merge-base> ; git log --oneline a6162b559b..<branch>
git diff --stat / --name-status a6162b559b..<branch> ; git show --stat <each of the six commits>
git show 99a3c7db9d [-- Plans/sharding_config.json, Plans/00-plans-index.md, Plans/Glossary.md]
git diff a6162b559b..<branch> -- scripts/pm-new-contracts-verify.py, Plans/{ATS,ACD,PLS,SSYS docs}
git diff a6162b559b..main -- Plans/Automated_Testing_System.md Plans/00-plans-index.md
comm -12 <(LC_ALL=C sort g3 paths) <(LC_ALL=C sort c4 paths)        # 8 shared files
python3 - <<'…'  # extract ERS canonical_text + source_lineage for all 14 units
python3 - <<'…'  # recompute all 18 Section 8 hashes
python3 - <<'…'  # recompute all bundle path+hash pairs (48 distinct) and the 40-hex commit
python3 - <<'…'  # recompute all 18 ledger source hashes
python3 - <<'…'  # jsonschema 4.19.2: validate 12 positives and materialise + validate 30 negatives
python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260917-002-…
python3 scripts/pm-new-contracts-verify.py                          # 31 / 1053 / 3409, pass
git show main:reports/…/continuation4/{README.md,arm-reports/union.json,adjudication/cross-arm.json}
git show main:reports/…/continuation3/gate/cost-policy.json ; …/continuation3-landing/README.md
sed -n '…' Plans/Decision_Log.md ; grep -n '…' Plans/DRY_Rules.md
```

Two sub-reviews ran under my direction and were re-run from scratch after the session limit: one on
regeneration and fixtures, one on bundle hashes, the registration precedent, the scripts edit and
hygiene. I verified their consequential claims myself before adopting them — including re-running the
fixture validation independently, recomputing the bundle hashes by a different extraction, and
re-checking the eight-file overlap after my own first `comm` undercounted it on locale sort order.

---

# Goal 3 delta — `80a71a0bfb`, and the rebased copy `f8056b31c8`: **LAND**

**I am an Opus 5 agent.** Delta review only, read-only throughout: no edit anywhere, no git command that
changes state. Regeneration ran on a copy under `~/PM-Experiments/g3-review-20260917/regen2/`.

`80a71a0bfb` sits on the reviewed tip `07f4cb7cc1`, applied as a new commit rather than an amend, and
carries a message that names each of my items and what it changed. It touches 85 files, all under
`Plans/` and `reports/`; the non-derived edits are `External_Research.md`,
`Automated_Testing_System.md`, `Glossary.md`, the ledger, and the three bundle files. Both branches are
pushed and in sync with their remotes.

**Verdict: land.** All six should-fix items and both notes are applied, correctly and in some places
more thoroughly than I asked. Every validator reproduces at the rebased tip, the derived files
regenerate byte-identically there, and `2a92905501`'s count removals survive the rebase intact. One
cosmetic wording defect introduced by the S2 fix is worth a one-line touch-up but does not hold the
branch.

## Item by item

**S1 — fixed, and made self-enforcing.** `ERS-005` no longer enumerates DL-036's seven fields. It now
reads: "This owner fills in DL-036's plain-language decision form for each item and adds what is
research-specific: the union finding the item derives from, that finding's class, and the passages the
finding cites. The form itself, the card contract, the response set, the artifact behaviour and the
questionnaire reuse are owned by Decision_Log DL-036 and assistant-chat-design and are referenced here,
never restated." I grepped the whole document for all seven field names — "plain name", "one-sentence
question", "why it came up", "what the user gets", "what it costs", "the recommendation if" — and every
one is gone. Better than the fix I asked for: a new acceptance criterion now *enforces* the boundary
going forward — "The decision form, the card contract, the four responses, the artifact behaviour and
the questionnaire reuse are referenced to DL-036 and assistant-chat-design, and **no field list of
theirs is reproduced here**." That turns a one-time correction into a testable rule.

**S2 — fixed in substance in both documents, with one wording defect (see below).** In `ATS-054` the
clause "whose authored cardinality rises from 30 to 31" is gone, the bare numeric
`preserved_exact_tokens` entry `"30 negative fixtures"` is gone, and a new negative constraint mirrors
`2a92905501`'s phrasing almost exactly: "Do not restore a literal CONTRACT_PAIRS cardinality to this
gate registration; that denominator belongs to `scripts/pm-new-contracts-verify.py`." Section 5 of
`External_Research.md` now says the script "owns and reports" the cardinality. The per-pack counts stay,
which is right — `ATS-046` keeps its own. I confirmed both count-ownership constraints now coexist in
the same document at `Plans/Automated_Testing_System.md:3856` (main's Touch Closure rule) and `:4890`
(this branch's CONTRACT_PAIRS rule), which is the outcome I wanted.

**S3 — fixed.** `ERS-008`'s `source_lineage` now carries
`reports/jujutsu-research-2026-09-11/continuation4/README.md` alongside the three it had, so the unit
that makes the pricing promise names the run that established it.

**S4 — fixed, and better than asked.** The bundle README gains a section, "Overlap with
`plans/c4-corrections-20260917`, and the conflict to expect". It opens with the correct distinction —
"The two branches were kept apart on the owner documents, not made disjoint" — keeps the narrow claim
that is true, and then tables all **eight** shared paths in three groups: the six `.plan_index` files
marked regenerated rather than merged, the verifier script marked composable with no count collision,
and `ledger_registry.json` marked "a guaranteed conflict" with its resolution. `verification.json` gains
a structured `shared_files_with_c4_corrections` block carrying the common base, the count of 8, and the
same three groups. This is now documented rather than discovered.

**S5 — fixed, and it follows the precedent's shape.** `Plans/Glossary.md` gains `### External research
terms` with exactly **12** terms: external research, research stage, admitted input class, finding
class, union, candidate, standing repair authorization, captured and unresolved usage, in-flight
allowance, turn budget, admissions, and protocol fingerprint. It carries a `ContractRef` line as the
`Working_Notebook.md` precedent's section did. The bundle names it as "the fifth registration mechanism
the `Working_Notebook.md` precedent used and the one this bundle originally skipped".

**S6 — fixed.** "whole diff: two lines" → "diff: three changed lines, two added and one removed", and
`verification.json`'s `change` field carries the same correction.

**N1 — fixed.** The ledger `error_disposition` now reads "All three are governance coverage omissions
and nothing else, **and two of the three name a document this branch created**", then separates the
genuinely pre-existing `Settings_System.md` absence from the branch-caused `External_Research.md`
absence, explains why the latter is unavoidable (a new owner document cannot appear in a governance seal
until the seal phase runs, which AGENTS.md reserves to the designated Plans agent), and routes all three
to `q-003`. That is exactly the precision I asked for.

**N2 — fixed.** The Section 8 row now reads
``…/REVIEW_ADJUDICATION_20260916.md`` *(appended to after this reading; hash is the 2026-09-17 snapshot,
not a frozen file)*. I re-verified the whole table at `80a71a0bfb`: **18 rows, 18 verified, 0 mismatch,
0 missing** — the labelled row still matches as well, so the disclosure is honest rather than an excuse.

## Validators at the rebased tip `f8056b31c8`

I ran all four inside the land1 worktree (clean, at `f8056b31c8`):

| Check | Result | Claimed |
|---|---|---|
| `pm-new-contracts-verify.py` | `status: pass`, `findings: []`, **31** pairs, **1053/1053** positives valid, **3409/3409** negatives rejected, 31 metaschemas, 12/12 self-tests | 31 pairs 1053/3409 ✓ |
| `pm-shard-plans.py --check --config Plans/sharding_config.json` | `status: pass`, **99** docs, **2690** shards, `failures: []` | 99 docs 2690 shards ✓ |
| `pm-plan-index.py validate` | `status: pass`, 0 failures; `plan_units.jsonl` has **6671** lines and every `field_coverage` entry is 6671 | 6671 units ✓ |
| `pm-bootstrap-ledger-validate.py` | `status: fail`, **3** errors, **0** warnings — the same three governance-coverage omissions, unchanged by the rebase | three ledger errors ✓ |

*(One correction to my own process: my first `--check` run reported 98 docs / 2677 shards. That was my
error, not the branch's — a `cd … && nohup … &` backgrounded the whole chain, so the check ran in the
shared checkout at `main` rather than in the worktree. Re-run correctly in the worktree it gives
99/2690.)*

## Regeneration and survival of `2a92905501` at land1

I copied land1's `Plans` and `scripts`, ran both generators, and diffed against the committed tip:

- **`Plans/_shards/`: 0 differing files.** Byte-identical, and the generator reported
  `docs_generated: 99, shards_generated: 2690, status: pass`.
- **`Plans/.plan_index/`: `plan_units.jsonl` and `acceptance_units.jsonl` identical; the other four
  differ by exactly one line each** — the `generated_at_utc` stamp (`11:35:22Z` committed vs `11:44:48Z`
  regenerated), nothing else. Same intended non-determinism as before the rebase. Regenerated unit
  count 6671.

**`2a92905501`'s count removals survive intact.** At land1 the old literal census "The Touch check
freezes 560 rows…" is absent, its replacement "The Touch check resolves and reports its own row,
profile, excluded-token, alias-binding, and production-intent denominators…" is present, main's negative
constraint is present, and `00-plans-index.md`'s removed "560 rows across 87 profiles" census stays
removed. The rebase layered this branch's `ATS-054` addition on top of main's policy change without
reverting any of it.

The rebase-record commit `f8056b31c8` is worth singling out. It states that the rebase was clean on
every source file and that only `_shards` and `.plan_index` conflicted, "each resolved by regenerating
… rather than by merging" — which my byte-identical result independently confirms is what happened. It
then records the conflict that had not yet arrived, with both ledger ids and both timestamps and the
resolution rule. That prediction is now live: **the c4 corrections have landed** — `main` is at
`61bea7aabc` and carries `pldg-20260917-001-jujutsu-continuation4-corrections` — while land1's registry
does not yet have that entry. So the second rebase will hit exactly the conflict the branch documented,
and the resolution is already written down for whoever performs it.

## The one thing to touch up

**A wording defect introduced by the S2 fix, in both documents.** The replacement clause is
ungrammatical:

- `Plans/Automated_Testing_System.md`: "The pair is registered in the closed CONTRACT_PAIRS manifest of
  `scripts/pm-new-contracts-verify.py`, **whose authored cardinality that script owns and reports**, and
  runs as the named subcheck…"
- `Plans/External_Research.md` Section 5: "…manifest of `scripts/pm-new-contracts-verify.py`, **whose
  cardinality that script owns and reports** (named subcheck…)"

"whose X that script owns and reports" collapses two constructions into one, and in `ATS-054` it also
strands the following "and runs as the named subcheck", which previously had "The pair is registered …
and runs …" as a clean parallel. Suggested repair, preserving the meaning exactly: "…registered in the
closed `CONTRACT_PAIRS` manifest of `scripts/pm-new-contracts-verify.py`, which owns and reports that
manifest's authored cardinality, and runs as the named subcheck…". Substance is correct in both places
and the negative constraints do the real work, so this is a copy-edit, not a blocker.

## Verdict

**Land.** Six should-fix items and two notes, all applied and verified: S1 with an added enforcing
criterion, S2 in both documents with a constraint mirroring main's, S3, S4 with all eight paths and the
conflict named in both the README and `verification.json`, S5 with twelve terms and a ContractRef, S6,
N1 and N2. Every validator reproduces at the rebased tip, `_shards` regenerates byte-identically,
`.plan_index` differs only by its timestamp stamp, and main's count removals survive. Carry the wording
touch-up into the second rebase — the one that resolves the now-live `ledger_registry.json` conflict
against `61bea7aabc` — rather than spending a commit on it alone.

### Commands run for this delta

```
git fetch origin ; git rev-parse <both branches, remotes, main, merge-bases>
git log -1 --format='…' 80a71a0bfb f8056b31c8 ; git rev-parse 80a71a0bfb^
git diff --stat / --name-status 07f4cb7cc1..80a71a0bfb ; git diff --name-only | grep -v '^(Plans|reports|scripts)/'
git diff 07f4cb7cc1..80a71a0bfb -- Plans/{External_Research,Automated_Testing_System,Glossary}.md
git diff 07f4cb7cc1..80a71a0bfb -- reports/external-research-canon-20260917/{README.md,verification.json}
git show 80a71a0bfb:Plans/External_Research.md | python3 …   # ERS-005 text, ERS-008 lineage, §8 hashes
git show 80a71a0bfb:Plans/External_Research.md | grep -inE '<the seven DL-036 field names>'   # all absent
git show <land1>:Plans/Automated_Testing_System.md | grep -n 'Do not restore a literal'       # both at :3856, :4890
git show <land1>:Plans/{sharding_config.json,00-plans-index.md,.plan_index/*}  # 99 sources; count removals survive
cd <land1 worktree> && python3 scripts/pm-new-contracts-verify.py              # 31 / 1053 / 3409, pass
cd <land1 worktree> && python3 scripts/pm-shard-plans.py --check --config …    # 99 docs, 2690 shards, pass
cd <land1 worktree> && python3 scripts/pm-plan-index.py validate               # pass, 0 failures
cd <land1 worktree> && python3 scripts/pm-bootstrap-ledger-validate.py …       # fail, 3 errors, 0 warnings
cp -a <land1>/Plans <land1>/scripts regen2/ && python3 …--generate… && …index generate
diff -rq <land1>/Plans/_shards regen2/Plans/_shards ; cmp each .plan_index file
git show main:Plans/ledgers/v2/ledger_registry.json | grep -c pldg-20260917-001-jujutsu…
```
