# Jujutsu continuation 4 — correction landing (2026-09-17)

Thirteen adjudicated corrections from continuation 4 of the Jujutsu research, merged from the nineteen
correction-shaped candidates six review arms produced, compiled into live Plans canon on branch
`plans/c4-corrections-20260917` and stopped for independent review before landing on main. Three owner decisions land
with them: `DL-056` and `DL-057` answer the two product-choice cards, and `DL-058` records the seven shape answers
behind the corrections themselves.

Ledger: `Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections/`, registered in
`Plans/ledgers/v2/ledger_registry.json`.

- [Currentness re-check before editing](currentness-before-edit.json)
- [Evidence receipts with SHA-256](evidence-receipts.json)
- [Derived-file scope](derived-scope.json)
- [Static verification](verification.json)
- [Ledger validation result](ledger-final.json)

Part 1 of this work, the adjudication that produced the thirteen, is
`~/PM-Experiments/c4-candidates-20260917/ADJUDICATION_PART1.md` with its own hash manifest. It is outside this
repository because it is working material; `evidence-receipts.json` names it by path and hash.

## What each correction repairs

Each of the thirteen names an existing promise and the contradiction or gap that made that promise unfalsifiable or
false, and adds no capability beyond repairing it. That is continuation 3's test, applied unchanged.

| # | Candidates | Arms | Promise repaired | Owner |
|---|---|---|---|---|
| 1 | `C4C-01` + `C4G-01` | claude, glm53 | JJI-008's "object verification", used four times and defined nowhere | JJI-008 |
| 2 | `C4H-05` | claude-hicap | SCS-017's claim to render native Jujutsu change state, with no value for divergence | SCS-017, JJI-003 |
| 3 | `C4D-01` | deepseek41 | JJI-008's "version-compatible", which no record could be checked against | JJI-008 |
| 4 | `C4M-02` | muse13 | JJI-008's promise to preserve every mapped backing and alternate store | JJI-008 |
| 5 | `C4C-02` | claude | SCS-014's "verified in an isolated boundary", asserted as a schema constant | JJI-008 |
| 6 | `C4U-02` | union | JJI-006's "current certification evidence", a gate with no defined record | JJI-006 |
| 7 | `C4H-02` + `C4U-01` | claude-hicap, union | JJI-008's "cannot manufacture a JJ snapshot", carried only in an `x-` prose string | JJI-008, JJI-003 |
| 8 | `C4C-03` | claude | JJI-008's closure inclusion list and SCS-014's sanitization clause, neither reaching the store tree | JJI-008 |
| 9 | `C4C-05` | claude | JJI-004's sole-mutation-authority promise behind a fence that never said what it covered | SCS-014 |
| 10 | `C4H-01` | claude-hicap | SCS-015's claim that split is preserved, against a target that cannot express one | JJI-003 |
| 11 | `C4H-03` | claude-hicap | Contracts_V0's recovery-action rule, satisfiable by an empty set | JJI-003, JJI-006 |
| 12 | `C4H-04` | claude-hicap | A contradiction inside one shipped record: transport class, local permission scope | JJI-003 |
| 13 | `C4M-01` | muse13 | JJI-008's completeness, stated as ends with no decision procedure | JJI-008 |

Two pairs merged. `C4C-01` and `C4G-01` are the same defect reached from opposite directions, one from receipt
admissibility and one from the undefined term plus the discriminating byte-flipped-blob fixture. `C4H-02` and `C4U-01`
are the same defect — a read declared non-mutating and never proven non-mutating — repaired from the capture-and-drill
side and the command side. Records 3 and 6 land one shared version-identity block rather than two, and records 4 and 5
land one pointer-resolution vocabulary, both on Jared's answer.

## What is not landed, and why

**`C4D-03` is covered.** `Plans/Source_Control_System.md:313` already reads "Existing Git
conflict/merge/review/graph/stage/commit/stash/branch/compare commands remain Git adapter commands unless the command
owner explicitly normalizes them." The conflict-assistant rows are Git-scoped by design, so the absence of JJ-scoped
preconditions is not a gap. The passage drifted from line 308 to 313 since continuation 3 cited it; its text is
unchanged.

**`C4D-02` stays rejected, and this supersedes the adjudication bundle's reading.** The bundle adjudicator recorded
`C4D-02` as *not* inside a continuation-3 rejection, on the reasoning that it approached the same boundary "from the
other side". Part 1 of this work disagreed: the candidate asserts that the `no_conflict_markers` gate on
`cmd.source_control.mark_conflict_resolved` is insufficient **for a Jujutsu backend**, which is exactly the premise
continuation 3 rejected when it declined a marker-only conflict command with the reason "Frozen Source Control line 308
scopes legacy commands to Git absent explicit normalization." If the row is a Git adapter command, the gate is never
applied to a Jujutsu backend and cannot contradict JJI-005. The independent review upheld the Part 1 reading, making it
two to one against the bundle adjudicator, and the reviewer directed that the supersession be noted here rather than by
editing the landed artifact. **`reports/jujutsu-research-2026-09-11/continuation4/adjudication/` is not edited, and its
`C4D-02` record still carries the superseded reading.** This note is the correction of record.

One cosmetic asymmetry is passed to Jared without being treated as a defect: at `Plans/UI_Command_Catalog.md:548`
`cmd.source_control.open_conflict` carries `git_available && conflict_present`, while at `:551`
`cmd.source_control.mark_conflict_resolved` carries only `conflict_file_selected && no_conflict_markers`, with no
backend token, although both sit in the backend-neutral `cmd.source_control.*` namespace and neither is among the
nineteen admitted generic IDs. Owner prose settles the scope; the table does not restate it.

**`C4D-04`, `C4M-03`, `C4G-02` and `C4G-03` are deferred, not declined.** `DL-056` scopes the Jujutsu conflict and
merge surfaces and defers the save-back contract until the built-in editor's save path is designed. The rule all three
save-surface candidates converged on — that a missing entry is never a write instruction — is what that contract will
have to satisfy.

**`C4M-04` is answered rather than landed as a correction.** Part 1 reclassified it as a product choice because no canon
promise was made false by the missing vocabulary. Jared answered the card, and it lands as `DL-057`.

## The semantic gate, and its limits

`DL-058` authorizes the `jujutsu_integration_contracts` branch of `contract_semantic_failures` in
`scripts/pm-new-contracts-verify.py` for exactly four relational rules and for nothing else under `scripts/`. Four
rules exist and no other file under `scripts/` is in the diff. Each has one authored negative fixture that passes JSON
Schema and fails only its own rule, which is how the gate distinguishes a semantic negative from a malformed one.
`tests/test_pm_jujutsu_closure_semantics.py` is the regression file and is added to the `.gitignore` allowlist so it is
tracked.

Three obligations in this wave have no validator surface. They are written into canon as obligations and carried as
open ledger questions rather than implied: the enumerated machine-local and ephemeral store entry list for a pinned JJ
version (`q-008`), the adapter's complete declared native effect scope per invocation (`q-009`), and whether the
recovery floor commands are servable from the operation store alone (`q-010`). None blocks landing.

## One withdrawn supporting leg

The adjudication bundle's own amendment withdraws Arm C's claim that jj's op-store GC with `SystemTime::UNIX_EPOCH`
"preserves nothing by recency". `remove_file_if_not_new` keeps a file when its mtime is newer than `keep_newer`, so
`UNIX_EPOCH` removes nothing; deepseek41 caught it against jj `lib/src/simple_op_store.rs`. Record 9 stands on its
lock-coverage leg alone, and nothing in this wave — no commit message, acceptance criterion, ledger record or receipt —
cites the withdrawn claim.

## Numbering

`DL-055` was taken by the plan-layer seal decision that landed on main while this branch was open, and the reviewer
assigned `DL-056` and `DL-057` to the two cards, so the seven shape answers took the next free number, `DL-058`. The
seven answers are chronologically first and numerically last; the numbers are identifiers, not an ordering claim.

## A landing hazard worth knowing: a stale index blocks every ff-merge

This branch's first landing attempt was refused, and the cause is worth recording because it is invisible to the
check `AGENTS.md` prescribes.

`git status` in the shared checkout showed 250 paths as `MM`, six of which this branch touches. Read literally, that
is the condition that says stop and hand the branch over: another thread has uncommitted changes in files the branch
touches. It was not that.

Two commands tell the cases apart, and they disagree:

```
git diff HEAD --name-only      # 1 path: .omp/lsp.json, a local tool config
git diff --cached --name-only   # 248 paths
```

The working tree was byte-identical to `HEAD` on every one of those 250 paths. What differed was the **staging area**:
someone had staged the pre-`2a92905501` content and never committed or reset it, so the index held blobs matching
neither `HEAD` nor the working tree. That is what produces `MM`, and it is what makes `git merge --ff-only` refuse
with "Your local changes to the following files would be overwritten by merge" even though no local change exists.

The distinction matters because the two cases want opposite responses. Real uncommitted work in a file the branch
touches means stop, because a landing would strand it. A stale index means nothing is at risk: the content on disk
already equals `HEAD`, and `git -C /mnt/Cursor/PuppetMaster reset` — mixed, no path arguments, no `--hard` — clears
the staging area and rewrites no file. This landing confirmed the diagnosis with a third check before acting: a
sampled staged blob equalled the `HEAD~1` version, dating the staged content to before the commit that was already
`HEAD`.

The rule in `AGENTS.md` is unchanged and was followed: the branch was handed back rather than landed, and the index
was cleared only after the owner authorized it. What this adds is the diagnostic. **A lander who sees `MM` on files
they touch should run `git diff HEAD --name-only` before concluding anything.** If it comes back empty, or names only
files outside the branch, the working tree is clean and the obstruction is an abandoned index, not somebody's work.

## Claim boundary

Static schema, fixture, shard, index and semantic-gate integrity only. No governance seal, runtime certification,
native adapter, security, performance or readiness claim. Nothing here is landed on `main`; the branch stops for
independent review.
