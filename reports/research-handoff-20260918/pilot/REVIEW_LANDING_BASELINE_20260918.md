# Independent review of `fix/landing-baseline-20260917` @ `215e718f9a` (2026-09-18)

**I am an Opus 5 agent.** Read-only throughout: no edit to the branch, its worktree or the shared
checkout, and no git command that changes state. Mutation work ran on copies under
`~/PM-Experiments/lb-review/`.

**Verdict: fix first.** Four should-fix items, none blocking. The shipped script is correct in every
place I probed — every finding below is about documentation, test coverage, or one signal that is
computed and printed but not wired to the result. The design is sound and the central safety property
holds: a failure naming a path the branch touched is matched against the raw failure, independently
of the baseline, so the baseline cannot excuse it.

## What the branch is

Four commits on `4f5eda0d18`, eight files: `scripts/pm-landing-check.py` (623 lines),
`tests/test_pm_landing_check.py` (421 lines, 38 tests), the first baseline
`reports/landing-checks/baseline.json`, a bundle README, a trial record, one `.gitignore` line, and
identical rule text in `AGENTS.md` and `.claude/CLAUDE.md`. **No `Plans/*.md` is touched** and the
scripts edit is exactly one new file — nothing else under `scripts/` changed. Jared authorized both
the rule-file and the scripts edits, so the scope rule is satisfied by the brief.

---

## Findings

### Should fix

**S1 — the documented exit-code contract does not match the code, in three places.** The decision is
one line, `scripts/pm-landing-check.py:538`:

```python
blocking = [item for item in on_branch if not item["stale"]] + [row for row in grown if not row["stale"]]
```

`new_items` is not in `blocking`. So a failure that **is new since the baseline, is not governance
staleness, and names no path the branch touched** exits **1**, not 2. Three documents promise 2:

- the script's own docstring: "2  at least one reported item is not that [a governance-staleness kind]";
- `reports/landing-checks/README.md`: "1 everything reported is governance staleness for what the
  branch edited, 2 something else was reported";
- the rule text, identically in `AGENTS.md` and `.claude/CLAUDE.md`: "It exits 0 when it has nothing
  to report, 1 when everything it reports is governance staleness for what your branch edited, and 2
  when it reports anything else."

**The code is right and the prose is wrong.** Two sentences after that rule sentence, the same rule
states the policy the code implements: "A failure that is new but names no file your branch touches
does not stop the landing either: push `main` and report it to Jared." That is also what AGENTS.md's
older shard-check rule has always said. So this is a wording fix, not a behaviour fix — but it is the
one sentence a lander will automate against, and today it says a new off-branch failure stops the
landing when it does not.

I demonstrated this end-to-end rather than inferring it, driving the script's own `normalize` and
its own decision expression with a single new non-staleness failure on an untouched path:

```
is_staleness: False
reported: 1 blocking: 0
EXIT CODE: 1          <- docstring, README and rule text all promise 2
```

Suggested replacement for all three: "*…1 when nothing it reports stops the landing — governance
staleness on files your branch edited, or failures that are new but name none of your files — and 2
when it reports something on your branch's files that is not staleness.*" Keep one asymmetry in mind
while rewriting: a **grown bucket** whose error is not a staleness kind *is* counted as blocking and
does exit 2, even though a bucket names no branch path. That errs safe, but the new sentence should
not promise otherwise.

**S2 — the exit-code decision is the one part of the script with no test.** The 38 tests pass in
0.022 s and cover key normalization (9 tests), staleness classification (3), report extraction (3),
the baseline diff including the count-only buckets and bucket growth (9), the branch-path match (11)
and baseline reading. **Not one asserts an exit code**, and none exercises `main()`'s decision at all
— `grep -E "exit_code|returncode|main\(" tests/test_pm_landing_check.py` returns only the
`unittest.main()` at the bottom. So the single line that decides whether a landing stops is
untested, and it is the same line whose documented behaviour is wrong. Neither recorded trial covers
it either: both report "New since the baseline: 0", so the new-item path never ran. Two small tests
would close it — new + non-staleness + off-branch expects 1; on-branch + non-staleness expects 2.

**S3 — growth that the sample cap hides is recorded and printed, but does not gate the result.**
`run-gates` prints at most 50 failures per subcheck and `audit-governance` at most 100, and the
baseline stores both `reported` and `sampled` for each. In the recorded baseline **12 subchecks are
truncated and 8,800 failures are never keyed** — 4,250 in audit-governance and 4,550 in run-gates,
23% of all 37,935:

| subcheck | reported | sampled | never keyed |
|---|---:|---:|---:|
| `validate_evidence` / `evidence` | 1,552 | 50 / 100 | 1,502 / 1,452 |
| `validate_plan_graph` / `plan_graph` | 1,552 | 50 / 100 | 1,502 / 1,452 |
| `validate_prd_planning_runtime_contracts` / `prd_planning_runtime_contracts` | 1,240 | 50 / 100 | 1,190 / 1,140 |
| `validate_audit_closure` / `audit_closure` | 201 | 50 / 100 | 151 / 101 |
| `validate_plan_migration` / `plan_migration` | 181 | 50 / 100 | 131 / 81 |
| `validate_implementation_readiness` / `implementation_readiness` | 124 | 50 / 100 | 74 / 24 |

For those, the only signal is the per-subcheck total — and nothing compares it. `grown_buckets`
compares *bucket* counts, and `baseline_index` builds those from `row["count"]`, which counts only
the sampled failures. The per-subcheck `reported` totals and each check's `failure_total` are stored
in the baseline and printed in the summary ("`run-gates fail 4912 failures (baseline 4912)`") but are
never compared programmatically: they do not feed `new_items`, `grown`, `blocking` or the exit code.
So a new failure that lands beyond a sample cap raises the printed total while the run still exits 0.

**The consequence is not only about growth.** The on-branch match runs over the *sampled* failures,
so a failure that names a file this branch touched, but lands beyond its subcheck's cap, is not
matched either — and the run can exit 0 while a real on-branch failure exists. That qualifies the
central promise in the new rule text, "reports … failures that name a path from
`git diff --name-only origin/main..HEAD`", which reads as unconditional.

In fairness this blind spot is inherited, not introduced: the underlying checks have always printed
only 50 or 100 failures per subcheck, so the old rule — read the three checks and stop if a failure
names your file — had exactly the same hole, unrecorded. This branch is the first thing to write the
totals down. But the prose should say plainly that the match is over the sample, and the totals
should gate the result so the hole at least announces itself.

It is worse in the machine-readable mode. `--json` emits `"checks": {check: status}` and nothing
else — no `failure_total`, no per-subcheck `reported`/`sampled`. So the one signal that would reveal
sample-cap-hidden growth is computed, printed in the human summary, absent from the JSON, and absent
from the exit code. Anything automating on `--json`, which is what a wrapper or CI hook would use,
cannot see it at all.

The README's "Growth that the sample hides is caught by the count" is therefore half true: the count
is recorded and shown to a human, not acted on. The remedy is cheap and needs no new data — compare
`failure_total`, or per-subcheck `reported`, against the baseline and treat a rise as reportable.
Both sides of that comparison are already in the file, and the summary line already computes them.

**S4 — the test suite is strong on normalization and blind on the decision, and mutation testing
shows it.** I had a sub-review mutate the script one change at a time and re-run the suite against
each mutant, on copies. The author's own ten mutations: **nine are caught, one is not.**

`A10-span-stem-unquoted` survives. Dropping the JSON quotes from the span-id pattern — from
`'"' + stem + r'-S\d+"'` to `stem + r'-S\d+'` — leaves all 38 tests passing. I reproduced this
myself on a copy. The reason is instructive: the existing test
`test_a_span_id_does_not_match_a_different_document` asserts that stem `assistant-chat` does not
match `assistant-chat-design-S0001`, and that protection comes from the `-S\d+` suffix, not from the
quotes. So the quotes defend a boundary no test exercises, and the docstring's justification for them
names the case the suffix already handles.

Probing beyond the author's list found seven more survivors, and the pattern in them is consistent —
the normalization layer is well tested, the decision and diff-integrity layer is not:

| Mutation | Effect if it were real | Caught? |
|---|---|---|
| `G10-exit-code-never-2` | `main` returns 1 even when something blocking is reported | **survives** |
| `G3-growth-skips-countonly` | growth rows dropped for the three count-only buckets | **survives** |
| `G12-fingerprint-truncated` | fingerprint cut to 2 hex, so collisions hide new failures | **survives** |
| `G1-hash-re-too-greedy` | `HASH_RE` swallows 7-char hex runs, merging distinct paths | **survives** |
| `G13-scrub-not-recursive` | `scrub` stops descending into nested dicts and lists | **survives** |
| `G14-max-fingerprints-off-by-one` | a bucket at exactly the cap becomes count-only | **survives** |
| `G16-canonical-unsorted` | `canonical()` stops sorting keys, so the baseline is nondeterministic | **survives** |
| A01-A09, FN, G2, G4-G9, G11, G15 | — | caught |

`G10` is the one to act on, and it sharpens S2 from "no test asserts an exit code" to something
worse: **the tool's entire stop-the-landing behaviour can be deleted without failing a single test.**
`G3` and `G12` matter for the same reason the coordinator asked about them — the count-only-bucket
defence and the fingerprint's discriminating power are exactly the two properties the design leans
on, and neither is pinned by a test. `G16` would silently break the determinism the bundle claims.

None of these is a defect in the shipped script: every one of them is a mutation I or the sub-review
introduced, and the real code is correct in all eight places. They are a map of where the suite would
not notice a regression, and the fix is a handful of tests, not a redesign.

### Notes

**N1 — the normalization is sound, and its blind spot can be stated exactly.** This was the main
thing to test, so I measured it against the recorded baseline rather than reasoning about it.

Of 245 buckets, only **6** hold more failures than they have distinct fingerprints, and each of those
collapses exactly one duplicate (count 2, one fingerprint). They are three findings on
`Plans/event_family_registry.json` that both aggregate checks report, so they appear once under
`audit-governance/implementation_readiness` and once under `run-gates/validate_implementation_readiness`
— most likely the same failure emitted twice rather than two failures merged. So 29,135 keyed
failures reduce to 1,429 enumerated fingerprints plus 3 count-only buckets, and within the 242
enumerated buckets the key loses almost nothing. That is a good answer to stability-versus-sensitivity:
hashes, timestamps and the checkout path are absorbed, and identity survives.

What can and cannot hide, precisely:

- **A failure naming a path the branch touched can never hide.** `names_branch_path` reads the
  *unscrubbed* failure and runs independently of the baseline, so an on-branch failure is reported
  whether or not its key is known. This is the property that matters most, and the design gets it right.
- **Growth is always caught** for keyed failures, because bucket counts are compared even for the
  three count-only buckets.
- **A novel key is always caught**, except inside those three.
- **The residue** is a constant-count substitution inside the three count-only buckets — one failure
  out, a different one in — on a path the branch did not touch. All three are
  `plan-migration-validate` on the same `Plans/.plan_migration/pds-20260906-017-…` snapshot path and
  all three error kinds begin `current_snapshot_`, which the script classifies as staleness anyway.
  That is exactly the residue the design sets out to absorb, and it is disclosed in the README.
- No baseline bucket has a scrubbed `path` (`<hash>` or `<time>`), so the theoretical risk that
  `HASH_RE` merges two hash-named files does not arise on this corpus. It stays latent: if a future
  check reports a path containing 32+ hex characters, distinct paths would share a bucket.

The count-only buckets are exactly the three over `max_fingerprints_per_bucket: 200`, which is
consistent rather than hand-picked.

**N2 — the baseline was recorded at the branch's own first commit, not at `main`.** `baseline.json`
records `commit: b29eab7b99…`, which is commit 1 of this branch; the brief asked for "current `main`"
(`4f5eda0d18`). This is necessary — the script has to exist in the tree that records the baseline —
and low-risk here, because that commit adds only a `.py` script, a test, rule text and one
`.gitignore` line, none of which is an input to the three checks. Worth one sentence in the README so
a reader comparing the recorded commit against `main` does not have to work it out.

**N3 — two different totals for "one full run".** The trial record quotes "the 29,131 failures of one
full run" for the cross-check, while the baseline's buckets sum to **29,135**. Both are described as
one full run of the same tree, and the same document says the samples are byte-identical between
processes. Four failures are unaccounted for. It does not affect the conclusion — both passes agree
on all 5,611 on-branch failures — but the bundle should say which run each figure came from.

**N4 — the before-the-push ordering fix is correct.** Commit `215e718f9a` moved the check to "after
the fast-forward and the shard check, **and before you push `main`**", because after the push
`git diff --name-only origin/main..HEAD` is empty and the on-branch set would be silently empty. The
reasoning holds: after `git merge --ff-only` the shared checkout's HEAD is the branch tip while
`origin/main` still points at the old remote tip, so the diff is exactly the branch's changes; after
the push they are equal. Good catch, and the kind of error that would have quietly disabled half the
tool.

**N5 — the script writes nothing inside the repository and makes no network call.** The only write is
`baseline_path.write_text` at line 505, gated behind `args.record_baseline` and followed immediately
by `return 0`. Check reports are read from a `tempfile.TemporaryDirectory`. Subprocess calls are
limited to the two check scripts and `git`, with no `shell=True`. Zero references to `requests`,
`urllib`, `http` or `socket`. I confirmed it empirically: the worktree's `git status --porcelain` was
empty throughout a full run.

**N6 — the author's own three recorded gaps are real and worth keeping in front of Jared**, the third
especially: `Plans/.plan_index/plan_units.jsonl` names `tests/test_pm_evidence_artifact_binding_modes.py`
as an implementation surface for ATS-001, and that file is gitignored — the tests-tracking convention
losing a test again, found by this work rather than asserted.

---

## What checks out

| Item | Result |
|---|---|
| Scope | 8 files; no `Plans/*.md`; scripts edit is exactly one new file |
| Rule text identical in both files | **byte-identical**: 8 added lines and 1 removed line in each, diffed both ways |
| "Never fix or commit another thread's files" | preserved — present twice in each file, in the shard-check bullet and the new landing-check bullet |
| Compile rule vs what Jared adopted | matches the brief clause for clause: prose first as one task, companions as a second, the witness `pm-ledger-compile-witness.py <ledger> --base origin/main` between them and before the compile review, acceptance as deterministic checks plus one blind form-driven review capped at two cycles with the remainder recorded as open ledger questions |
| The witness script the new rule cites | exists, on the branch and on `main` |
| `.gitignore` exception | `!/tests/test_pm_landing_check.py` at line **85**, in the `!/tests/…` block, and the test is genuinely tracked (blob `8da9f11a31`) |
| Baseline figures | reconcile exactly: 4,895 + 28,128 + 4,912 = **37,935** `failure_total`; bucket counts sum to **29,135** keyed; **245** buckets; **1,429** fingerprints; **3** count-only, being precisely those over the 200 cap; 23,409 + 3,117 + 1,174 = 27,700 of the 28,128 migration findings |
| `untracked_inputs` | 7 paths recorded, all present in the worktree the run used, matching the README's list |
| Commit hygiene | four commits, each coherently scoped, all with the co-author line, messages that describe the change including two honest self-corrections |
| Baseline home argued from the rules | sound — `Plans/.evidence/**` is a build-governance artifact that CLAUDE.md forbids hand-editing and AGENTS.md reserves to the designated Plans agent, so a file refreshed on a schedule cannot live there; `reports/**` is the documented home for compact result bundles |

---

## I ran the check myself

I ran both trials independently, in the branch worktree, which carries the full tracked tree plus all
seven gitignored inputs (I verified each is present).

`python3 scripts/pm-landing-check.py --base origin/main --json`:

```
exit = 0
new: 0   on_branch: 0   grown_buckets: 0   resolved_buckets: 0   blocking: 0
commit 215e718f9a   baseline_commit b29eab7b99   branch_paths: 8
```

That **reproduces the author's first trial** (they report 7 branch paths at the third commit; I see 8
at the fourth, which adds the trial record itself). The worktree's `git status --porcelain` was empty
throughout, confirming the script writes nothing inside the repository.

**The second trial reproduces too, to the item.** Running the same check with
`--base f81c547ab0~1`, a base whose 70 changed files really do touch canon:

```
base f81c547ab0~1   new: 0   on_branch: 542   grown_buckets: 0   blocking: 4
on-branch staleness: 538      non-staleness: 4
```

542, 538 and 4, exactly as claimed. The four are the same two findings seen once by each aggregate
check — `run-gates/lint_path_refs` and `audit-governance/path_refs`, both
`implementation_surface_missing_or_untyped` on `Plans/.plan_index/plan_units.jsonl`:

- `ATS-020` → `scratchpad/pm-integration-20260831/audits/onboarding-doctor-128-current-runner/audit_runner.py`, line 727, `missing_ref`
- `SMPFS-151` → `scratchpad/pm-integration-20260831/audits/egolite-four-arm-benchmark-current`, line 5575, `missing_ref`

Both name a `scratchpad/` path that does not exist, exactly as the trial record describes. This is
also the tool doing the thing it was built for: four items to read instead of 37,935.

It is worth noting what this trial *does* confirm about the exit code. `blocking: 4` produced exit 2,
so the on-branch non-staleness path works as documented. **S1 is therefore narrow and precise**: the
only mis-documented case is a failure that is new, not staleness, and names no branch path — which
neither trial exercised, because both reported `new: 0`.

## Verdict

**Fix first.** Four should-fix items, in the order I would take them:

1. **S1** — correct the exit-code sentence in `scripts/pm-landing-check.py`'s docstring,
   `reports/landing-checks/README.md` and the rule text in both `AGENTS.md` and `.claude/CLAUDE.md`.
   The behaviour is right; three documents describe it wrongly, and it is the sentence a lander
   automates against.
2. **S2 + S4/G10** — add tests for the exit-code decision. Two cases close S1's blind spot and the
   `G10` mutation together: new + non-staleness + off-branch expects 1; on-branch + non-staleness
   expects 2.
3. **S3** — compare `failure_total` (or per-subcheck `reported`) against the baseline and let a rise
   be reportable; add those totals to the `--json` report; and say in the README that the on-branch
   match runs over the sample, not the whole failure set.
4. **S4** — a few tests over the diff-integrity layer: the count-only bucket growth path (`G3`), the
   fingerprint's discriminating power (`G12`), the cap boundary (`G14`), and baseline key ordering
   (`G16`). Fix or drop the `A10` claim, since that mutation is not caught.

None of these blocks the adoption, and I would not hold the branch for the mutation-coverage items if
Jared wants the ten minutes back now — but S1 should not land as written, because it is the one line
that tells a future lander what a non-zero exit means.

## Commands run

```
git fetch origin ; git rev-parse --short <branch, origin, main, merge-base>
git log --oneline 4f5eda0d18..fix/landing-baseline-20260917 ; git diff --stat <base>..<branch>
git diff --name-only <base>..<branch> | grep -E '^Plans/.*\.md$'          # empty
git diff <base>..<branch> -- AGENTS.md .claude/CLAUDE.md .gitignore
diff <(added lines of AGENTS.md) <(added lines of .claude/CLAUDE.md)      # identical, 8 and 1
git show <branch>:.gitignore | grep -n test_pm_landing_check              # line 85
git ls-tree <branch> tests/test_pm_landing_check.py                       # tracked
sed -n '1,380p' scripts/pm-landing-check.py                               # read in full
grep -nE "open\(.*'w|write_text|subprocess\.run|requests|urllib|socket" scripts/pm-landing-check.py
python3 -m unittest tests.test_pm_landing_check -v                        # 38 tests, OK, 0.022s
grep -nE "exit_code|returncode|main\(" tests/test_pm_landing_check.py    # only unittest.main()
python3 - <<'…'   # baseline analysis: buckets, fingerprints, count-only, collapse, cap
python3 - <<'…'   # reconcile 37,935 / 29,135 / 28,128 / 27,700 against the checks block
python3 - <<'…'   # S1 proof: normalize() + the decision expression -> EXIT CODE 1
cp -r script+test to a copy; unquote the span pattern; python3 -m unittest  # A10 survives
cd <worktree> && python3 scripts/pm-landing-check.py --base origin/main --json   # exit 0
git -C <worktree> status --porcelain                                      # empty, during and after
```

A sub-review ran the author's ten mutations, the fixed false negative and sixteen probes of its own
on copies under `~/PM-Experiments/lb-review/mutants/`. I verified its two most consequential results
myself — `A10` and the absence of any exit-code test — before adopting them.

---

# Delta — `215e718f9a..466fffb7c9`: **land, once Jared answers the one item the check itself stopped on**

**I am an Opus 5 agent.** Delta review only, read-only: no edit to the branch, its worktree or the
shared checkout, and no git command that changes state. Mutation and regeneration work ran on copies
under `~/PM-Experiments/lb-review/`.

Two commits, 69 files. Everything is inside the allowed set — `Plans/`, `scripts/`, `reports/`,
`tests/`, `AGENTS.md`, `.claude/`, `.gitignore` — with nothing outside it. Both commits carry the
co-author line.

**All four of my should-fix items are properly closed, and three of them were closed better than I
asked.** The one thing standing between this branch and a landing is not a defect in it.

## S1 — corrected in all three places, with both asymmetries stated

The docstring, `reports/landing-checks/README.md` and the rule text now all say the same thing, and
it is what the code does: exit 1 when nothing stops the landing (governance staleness on files the
branch edited, **or failures that are new but name none of the branch's files**), exit 2 when
something does. Both asymmetries I asked for are named explicitly in all three: "a bucket that grew
whose error kind is not staleness, or a rise in a subcheck whose failures are truncated". The new
`blocking_items()` docstring states the same rule a fourth time, beside the code, and closes with
"A failure that is new but names none of the branch's files does not stop the landing: it is reported
and pushed, exactly as the shard-check rule reads."

The landing section is **byte-identical** in `AGENTS.md` and `.claude/CLAUDE.md`. The only difference
in the added lines between the two files is CLAUDE.md's scope block, which is one of Jared's separate
answers, not a divergence in the rule.

## S2 and S4 — the verdict is now a tested function, and I re-ran the mutations myself

`blocking_items()` and `exit_code()` are extracted as named pure functions, and the suite has grown
from 38 tests to **72**, with four new classes: `KeyIntegrity`, `TheDecision`, `SubcheckTotals` and
`EndToEnd`.

The worktree has **uncommitted work** in `scripts/pm-landing-check.py` (see D3), so I did not trust a
run there. I extracted the committed `466fffb7c9` versions of the script and the test into an isolated
copy and ran them: **72 tests, OK, 0.975 s**, against the committed tip and nothing else.

I re-ran the three mutations the coordinator named, against that committed copy:

| Mutation | Result | Caught by |
|---|---|---|
| **A10** — drop the JSON quotes from the span-id pattern | **caught** | `test_a_span_id_with_more_after_its_number_does_not_match`, `test_a_stem_that_is_the_tail_of_another_stem_does_not_match` |
| **G10** — the verdict can never be 2 | **caught** | 5 tests, incl. `test_a_non_staleness_failure_on_a_branch_file_exits_two`, `test_a_rise_above_a_print_cap_is_caught_and_blocks`, `test_a_grown_bucket_that_is_not_staleness_stops_the_landing` |
| **G3** — growth skips buckets matched by count alone | **caught** | 4 tests, incl. the end-to-end `test_growth_inside_a_count_only_bucket_is_caught` |

A10 is the satisfying one: the two tests that now catch it target exactly the boundaries the old
single test did not — a span id with more after its number, and a stem that is the tail of another
stem. That is the right fix rather than a test written to the mutation.

## S3 — the totals now gate the result

`grown_subchecks()` compares each subcheck's `reported` total against the baseline's; `blocking_items()`
blocks on a rise in a **truncated** subcheck, "because nothing can say whether what was added names a
file the branch touched"; and `exit_code()` returns 0 only when `reported`, `grown` and
`subcheck_growth` are all empty. The discrimination is right: a rise in a subcheck that is *not*
truncated is reported but does not block, because the sample already shows it item by item.

`--json` now carries `failure_total`, `baseline_failure_total`, the per-subcheck `reported`/`sampled`
map, plus `grown_subchecks` and `excused_by_kind`. The signal I said was human-summary-only is now in
the machine-readable report and in the exit code.

The keying limit is stated in both documents, correctly and complementarily: the README says "1,007 of
the 9,807 failures those two checks report are ever keyed", the rule text says "8,800 of the 9,807 they
report are never keyed and the match against your branch's paths runs over the printed sample, not over
every failure", and adds "That is why a rise in a truncated subcheck's total stops the landing". Both
figures check out — 645 + 362 = 1,007 sampled, 9,807 − 1,007 = 8,800.

## The item the check stopped on — I confirm the author's reading

The third trial exits 2 on one item: `json_syntax` / `raw_capture_mode_census_mismatch` on
`tests/fixtures/governance/raw_evidence_capture_modes.json`. I verified both halves of the
characterisation rather than taking them:

- **It is not new.** That exact bucket is in the recorded baseline — `run-gates | json_syntax |
  raw_capture_mode_census_mismatch | tests/fixtures/governance/raw_evidence_capture_modes.json`,
  count 1, fingerprint `08ea05121408`.
- **It is on-branch now because this branch tracked the file.** `git ls-tree 215e718f9a` on that path
  is empty; `git ls-tree 466fffb7c9` returns blob `faac6c142d`.

So a dormant baseline failure became a blocking one the moment the branch took ownership of the file,
and the tool reported it correctly: not new, names a branch path, not staleness, therefore exit 2. The
cause is real — the 16 captures the manifest accounts for live under `tests/agent_packet_restrictions`,
a symlink to evidence that is never committed here, so the validator sees the manifest and none of its
referents. Neither fix is the branch's to make: committing raw captures is forbidden, and teaching a
shared validator to follow the symlink is Jared's call.

**This is the strongest evidence in the branch that the tool works.** It stopped its own author's
landing, and the author wrote the adjudication down instead of widening the staleness list, dropping
the file from tracking, or refreshing the baseline to make it disappear — the last of which the README
now explicitly forbids ("Never per landing: a baseline refreshed to make a landing pass excuses exactly
the failure it was meant to show").

## Jared's seven answers

| Answer | Verified |
|---|---|
| Test inputs tracked | **31 files newly tracked**, all under `tests/`: 3 test modules plus 28 fixtures across `governance` (2), `pm7_shared` (7), `usage_gui/cases` (13), `usage_gui/presentation` (6) |
| Symlink stays ignored | `tests/agent_packet_restrictions` is **not tracked** at `466fffb7c9`, and the `.gitignore` comment says why |
| Nightly runbook | in the README with a full command sequence — its own worktree on local disk, `sparse-checkout disable`, the evidence symlink relinked, `snapshot-current`, then `--record-baseline`; and "Never per landing" |
| BPM-009 and DL-055 prose | only `Plans/Bootstrap_Planning_Migration.md` and `Plans/Decision_Log.md` changed under `Plans/*.md`; derived files confined to those two shard directories plus `.plan_index` |
| CLAUDE.md scope block | aligned, and honest about it: "the two were out of step until 2026-09-18" |
| ATS-020 / SMPFS-151 | one `Plans/path_reference_registry.json` row typing the `scratchpad/pm-integration-20260831/audits/` prefix as `generated_process_artifact`, `validator_policy: allow`. The third trial shows both aggregate checks falling by exactly two, which is that row landing |
| `pm-validate-pm7-gui-fixtures.py` fails closed | 7 tests, all pass |

**Regeneration is confined and deterministic.** Only the two edited documents' shard directories
changed. I regenerated from the branch tip on a copy: `99 docs, 2690 shards, status pass`, and
`diff -rq` against the committed shards gives **0 differing files**. `pm-shard-plans.py --check` in the
worktree passes with 99 docs and 2690 shards. **Secrets: clean** — one grep hit across 3,655 added
lines, `with self.subTest(token=token):`, a unittest parameter.

## What I found in the delta

**D1 (should fix) — both rule files now describe the `.gitignore` mechanism wrongly.** The new
CLAUDE.md scope line says "under `tests/**` the fixtures and test files that `.gitignore` **names one
by one**", and the `.gitignore` comment repeats it: "Named one by one, the same way the test files
above are." Seven of the ten added exceptions are **directory** un-ignores — `!/tests/fixtures/`,
`/governance/`, `/pm7_shared/`, `/usage_gui/`, `/cases/`, `/golden/`, `/presentation/`. Only three
name a file. The consequence is the opposite of what one-by-one naming is for: any file later added to
those directories is tracked automatically and silently, which is the failure mode the convention
exists to prevent, and which this repository has already been bitten by twice. Either name the 28
fixtures individually, or change both wordings to say the directories are un-ignored wholesale and
that new fixtures under them track automatically. One line either way, but it should not land
describing itself incorrectly in the two files that govern every agent.

**D2 (note) — the branch cannot land at exit 0 under its own rule, and that is not its fault.** The
recorded item is a genuine on-branch non-staleness failure. Under the new rule it stops the landing,
so the branch needs one of: the validator following the evidence symlink, the manifest staying
untracked, or Jared authorizing the exception. The author is right that this is Jared's call and right
to record it rather than route around it.

**D3 (note) — there is uncommitted work in the worktree.** `scripts/pm-landing-check.py` is modified
relative to `HEAD`, carrying the two peer-reported fixes the coordinator described: `partial_subchecks()`
(for a sampled subcheck, sample membership churns, so only the total is compared) and
`split_touched()` with `DERIVED_PREFIXES` (`Plans/_shards/` and `Plans/.plan_index/` kept out of the
touched set). It is neither committed nor pushed, and the extra commit had not appeared on `origin`
when I finished, so it is **not** part of this verdict. Everything above was verified against the
committed tip in an isolated copy for exactly that reason. When it lands it needs its own pass, and
`split_touched()` deserves the attention: it *narrows* the on-branch set, trading the noise I saw in
the second trial (414 of 415 items excused, most naming regenerated index rows) against coverage. The
reasoning in its docstring is sound — a branch that edits one document rewrites every index row, so
those paths say nothing about what it decided — but narrowing a safety net is the change that most
wants a test.

**D4 (note) — the count-only fixtures are scaled down, so a size-conditioned regression is invisible.**
The count-only bucket tests use `max_fingerprints=2` with 5-failure buckets. A faithful "skip count-only
buckets" mutation is caught by four tests; a variant conditioned on the production cap
(`baseline[name] > 200`) survives all 72. This is fixture realism, not an untested path — I state it
only so nobody reads my earlier `G3` survivor as still open. It is closed.

## Verdict

**Land** — subject to the one item the check stopped on, which is Jared's decision and not a defect in
this branch.

S1, S2, S3 and S4 are all properly closed: the exit-code contract is consistent across code and three
documents, the verdict is a tested function with 72 tests including end-to-end coverage of `main()`,
the truncated-subcheck totals gate the result and reach the JSON, and the three mutations I re-ran are
all caught. D1 is a one-line wording fix I would take before landing, because it is in the two rule
files. D2 is the gate. D3 and D4 are notes.

If the pending peer-defect commit appears before the landing, it should get its own short pass —
`split_touched()` narrows what the check will report, and that is the one direction worth a second
look.

### Commands run for this delta

```
git fetch origin ; git rev-parse --short <branch, origin, main> ; git log --oneline 215e718f9a..466fffb7c9
git diff --stat / --name-status 215e718f9a..466fffb7c9 ; grep for Plans/*.md and out-of-scope paths
git show 466fffb7c9:scripts/pm-landing-check.py | sed -n '…'        # docstring, grown_subchecks,
                                                                    # blocking_items, exit_code, report JSON
git show 466fffb7c9:{AGENTS.md,.claude/CLAUDE.md,reports/landing-checks/README.md}
diff <(landing section of AGENTS.md) <(landing section of CLAUDE.md)   # identical
git show 466fffb7c9:{scripts,tests}/… > isolated copy ; python3 -m unittest   # 72 tests, OK
python3 ~/PM-Experiments/lb-review/recheck.py                        # A10, G10, G3 re-run
python3 ~/PM-Experiments/lb-review/recheck2.py                       # faithful vs size-conditioned G3
git show 466fffb7c9:reports/landing-checks/baseline.json | python3 - # the census bucket is in it
git ls-tree {215e718f9a,466fffb7c9} tests/fixtures/governance/raw_evidence_capture_modes.json
comm -13 <(git ls-tree -r --name-only 215e718f9a|sort) <(…466fffb7c9|sort)   # 31 newly tracked
git diff 215e718f9a..466fffb7c9 -- .gitignore Plans/path_reference_registry.json
cd <worktree> && python3 scripts/pm-shard-plans.py --check --config …        # 99 / 2690, pass
cd <worktree> && python3 -m unittest tests.test_pm_validate_pm7_gui_fixtures # 7 tests, OK
cp -a Plans scripts <copy> && python3 …--generate… ; diff -rq shards          # 0 differing
git diff 215e718f9a..466fffb7c9 | grep '^+' | grep -EIic '<9 credential patterns>'  # 1, a false positive
```

---

# Short pass — `466fffb7c9..d4def31abc`

**I am an Opus 5 agent.** Read-only throughout; all mutation work on isolated copies under
`~/PM-Experiments/lb-review/sp*`. Two commits, seven files, no fixture content changed — only
`.gitignore` lines, the script, its test, the two rule files and the two bundle documents. The
worktree is now clean at `d4def31abc`, so the uncommitted work I flagged as **D3 is committed**.

**88 tests pass against the committed tip**, run in an isolated extraction of `d4def31abc` rather
than in the worktree.

## The narrowing — my own mutations, all caught

This was the part I asked for a second look at, because `split_touched()` *removes* a match rather
than adding one. I wrote six mutations of my own against the committed tip:

| My mutation | Result | Caught by |
|---|---|---|
| **M1** drop `Plans/.plan_index/` from `DERIVED_PREFIXES` | caught | 6 tests, incl. `test_an_index_row_for_a_unit_of_a_touched_document_does_match`, `test_a_derived_failure_that_names_no_unit_at_all_does_not_match` |
| **M1b** drop `Plans/_shards/` instead | caught | `test_a_shard_failure_is_narrowed_the_same_way_as_an_index_failure`, `test_the_derived_paths_are_taken_out_of_the_touched_set` |
| **M2** `units_of_touched_docs()` never matches | caught | `test_the_owning_units_are_read_from_the_index`, `test_a_regenerated_index_row_for_a_touched_unit_does` |
| **M3** a unitless derived failure is attributed to the first unit | caught | `test_a_derived_failure_that_names_no_unit_at_all_does_not_match` + 2 |
| **M4a** partial-subcheck rule reads this run's sampling only | caught | `test_a_truncated_subcheck_is_named_from_either_side` |
| **M4b** partial-subcheck rule reads the baseline side only | caught | the same test |

M1 and M1b matter separately and are caught by *different* tests, which is what makes
`d4def31abc`'s "cover both derived prefixes" claim real rather than asserted. M4a and M4b confirm the
either-side rule is pinned from both directions by one test that fails either way.

**The narrowing is bounded on both sides, which is what a removed match needs.** The suite asserts
what must still match — `test_an_index_row_for_a_unit_of_a_touched_document_does_match`,
`test_a_derived_failure_naming_a_touched_path_in_its_text_still_matches` — and what must not —
`test_an_index_row_for_a_unit_the_branch_never_edited_does_not_match`,
`test_a_derived_failure_that_names_no_unit_at_all_does_not_match`, and
`test_a_non_derived_failure_is_not_matched_on_units`, whose docstring makes the scoping explicit:
"Unit identity is the rule for generated indexes only, not a second way in everywhere." That last one
is the test I would have asked for: it stops the replacement growing into a broader match than the
one it replaced.

**The residual is now deliberate and tested, and I think it is right.** A failure on a derived path
carrying no `plan_unit_id`, no span stem of a touched document and no touched path in its own text is
no longer matched — `index_row_unreadable` on `plan_units.jsonl` is the test's case. Such a failure
genuinely carries no evidence of which branch caused it, since every canon edit rewrites that file.
That answers the D3 note I left open.

## The `.gitignore` rework — D1 closed, and I proved the probe claim independently

The blanket directory un-ignores are gone, replaced with the correct idiom: open the directory
(`!/tests/fixtures/governance/`), re-ignore its contents (`/tests/fixtures/governance/*`), then name
each file. **29 fixture files named one by one**, and the comment now describes what the lines
actually do: "Each directory is opened only far enough to name its files one by one … so a fixture
added later does not start tracking on its own."

I verified the probe claim with `git check-ignore -v`, which needs no files created:

- a hypothetical new file in **each of the five opened directories** is ignored, each by its own
  `/tests/fixtures/<dir>/*` rule;
- a new *subdirectory* under `tests/fixtures/` is caught by `/tests/fixtures/*`;
- the 29 named fixtures are **not** ignored (the controls confirm the un-ignore works);
- `tests/agent_packet_restrictions` stays ignored, by `.gitignore:179`.

So a fixture added later really does not start tracking on its own. D1 is fully closed.

## D2 is untouched, which is the point

The census paragraph is unchanged and both `governance` fixtures — the manifest and its schema — are
still among the 29 named files. The branch has not quietly untracked the manifest to make its own
check pass, which was the one shortcut available. The gate stands where it stood: Jared's call.

## What I found

**SP1 (should fix, low) — the rule text still describes the old match.** `AGENTS.md` and
`.claude/CLAUDE.md` say the check reports "failures that name a path from `git diff --name-only
origin/main..HEAD`", with no mention that two prefixes are now excluded and matched on unit identity
instead. The README carries the truth in a new section, "Which paths count as the branch's", which
describes the narrowing, the unit-identity replacement and the preserved text match accurately. But
the rule files are the lander-facing contract and every agent reads them; the README is optional.
This is the same drift class as my original S1, in the same two files, and one clause fixes it. The
landing section is still byte-identical between the two files, so the fix goes in once and copies.

**SP2 (should fix, low) — the bundle records no trial at the current tip.** The latest recorded run
is the third trial at `466fffb7c9` (415 on-branch). These two commits change that number by design,
and the heading "Third trial, 2026-09-18, on the branch that adopted Jared's answers" reads as the
tip to anyone who does not check commits. Either record a run at `d4def31abc` or label each trial
with the commit it ran at. This bundle's whole value is that every figure names the run that produced
it, so the one stale figure is worth ten minutes - and I have now measured it, so the author can
simply record it.

**I ran the check at `d4def31abc` against `origin/main` myself, and the 415 to 405 claim reproduces
exactly:**

```
exit 2
new: 0        on_branch: 405        blocking: 1
grown_buckets: 0                    grown_subchecks: 0
staleness: 404                      non-staleness: 1
  run-gates / json_syntax | raw_capture_mode_census_mismatch |
      tests/fixtures/governance/raw_evidence_capture_modes.json
on-branch items naming a Plans/.plan_index path: 0
```

Every part of the claim holds, and one part is stronger than claimed. 415 - 405 = **10 items gone**,
and **not one on-branch item now names a `.plan_index` path** where ten did before, so the narrowing
removed exactly the false matches it was aimed at and nothing else. "Nothing else moved" is exact:
`new` is 0, both growth sets are empty, and the non-staleness count is still exactly **1**, the same
`raw_capture_mode_census_mismatch` item on the same path, so **D2 is untouched by the narrowing**. The
third trial's 415 with 414 excused becomes 405 with 404 excused: ten staleness items dropped, the one
blocking item kept. That is the behaviour the fix promised, measured rather than asserted.

**SP3 (note) — a count discrepancy, immaterial.** The trial record says "Ten further mutations, one
per decision point in the three fixes, all fail a test"; the brief I was given says 13. I did not
reconcile it and did not need to: my own six independent mutations are all caught, which is the
stronger evidence either way.

## Verdict

**Land** — with the same D2 gate as before, and SP1/SP2 as one-line fixes to take with it.

The three peer-found defects are fixed, and each fix carries its regression as a control rather than
a bare assertion. The narrowing — the one change I asked for a second look at, because it removes a
match — is sound: bounded by tests in both directions, scoped so the unit-identity replacement cannot
grow beyond the match it replaces, and honest about the one case it deliberately drops. Six
independent mutations of mine against exactly those decision points are all caught, and my own run at
the tip reproduces the effect the fix claims: ten false matches gone, zero `.plan_index` matches left,
nothing else moved, and the one real item still stopping the landing. D1 is closed with the right git
idiom and I proved the probe claim myself. D3 is committed. D4 stays closed.

What still stands between this branch and `main` is unchanged and is not the branch's to fix: the
`raw_capture_mode_census_mismatch` item, where the manifest is tracked here but the 16 captures it
accounts for live under an evidence symlink that is never committed. The branch has kept that item
visible through three rounds of revision when untracking one file would have made it disappear. That
is the strongest thing I can say for it.

