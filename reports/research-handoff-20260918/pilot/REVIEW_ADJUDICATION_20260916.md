# Independent review of the continuation-4 adjudication and the runner's bundle (2026-09-17)

**I am an Opus 5 agent** (`claude-opus-5[1m]`). I ran no arm, I scored no arm, and I wrote neither
branch under review. Everything below was re-derived by me from the frozen run state and the two
branches. Both worktrees and every run directory were treated as read-only; I ran no git command that
changes state. Scratch is under `~/PM-Experiments/c4-review-20260917/`.

**Headline: both bundles are substantially sound and both need fixes before landing.** I recomputed
every set, every union and every per-arm count; re-hashed every cited artifact; read the
garbage-collection source myself; and re-derived credits and misses in both directions for all six
arms. The nesting claim holds, the manifests hold, the quarantine discipline holds, and there are no
secrets. I would withdraw three credits and add one, which moves several published numbers — and I
verified that **every structural conclusion in the report survives those changes**.

---

## Findings, ranked

### Blocking

**B1 — runner branch. `README.md:109` states a delivery count the run state contradicts.** The union
row reads `18 of 20` jobs with `notes.md`. The filesystem says **19 of 20**:
`runs/jujutsu-union-20260916-221929/jobs/J0018-reconcile/workspace/notes.md` is 6,336 bytes,
`.../J0020-reconcile/workspace/notes.md` is 8,790 bytes, and only `J0019-reconcile` produced nothing.
The bundle's own `arm-reports/union.json` carries `notes_present: true` on 19 rows, so the README
contradicts its own machine-generated data file as well as the run state. The other five rows (4, 12,
7, 8, 11) reproduce exactly. This matters beyond bookkeeping: those two documents carry **12 of the
union arm's 43 credits** (J0018 → 8, J0020 → 4, recounted from `credited_job`), so a reader trusting
the runner's figure would discard real delivered work. The adjudicator reported this as V4 and is
right.

**B2 — runner branch. `freeze-history.json:63` has a malformed, wrong timestamp.** The final
generation records `"landed": "2026-09-17T00:1xZ"` — a literal `x`. `protocol/freeze.json` was written
`2026-09-16T22:11:33Z`. As published, the field dates the freeze **after** both arms it governed had
already run (union 22:19→00:05, glm53 00:06→01:01). In a provenance file whose whole purpose is to
show that code preceded the run, this is the one field a reader checks.

**B3 — runner branch. `README.md:137` overstates `runtime-identity.json`.** The README says it
"records the identity every arm actually ran against, taken from each job's own record". The file is a
`captured_at: 2026-09-16T20:50Z` snapshot: its `per_arm_from_job_records` contains only
`claude (Arm C)`, `claude-hicap`, `deepseek41 (rerun)`, `deepseek41 (attempt 1)` and
`union (attempt 1)`. **muse13, glm53 and the scored union arm are absent entirely**, and
`claude-hicap` is recorded as `"jobs": 6` when it ran 12. Everything the file *does* record is
correct — I reproduced every identity from the job records (claude `2.1.226` sha `4e9bec1177ce9690…`;
omp `18.2.2` sha `77c3520ab8ef8318…`; union attempt 1 on `18.1.13` sha `3be5a308cc91e6f6…`). The
defect is omission plus an overstated claim. Regenerate it, or soften the sentence.

**B4 — adjudication branch. The `claude-hicap` F001 credit does not meet the test the adjudicator
applied to the other five arms, and it carries a headline.** F001 is a *correction*:

> "Require a non-null owner receipt for every terminal JJ attempt, including failed, cancelled,
> recovery-required and effect-unknown results."

The credit rests on exactly two passages. `J0020-compare/workspace/notes.md:455-461`:

> "a conforming PM capture could: 1. read the **original** repository at head to compute closure,
> thereby authoring a `"reconcile divergent operations"` operation in a user's live repo … with no
> writer lease, no before/after operation identities (`Plans/Jujutsu_Integration.md:114`) and **no
> receipt**"

and `J0022-compare/workspace/notes.md:333-339`:

> "an adapter may not map a helper-tool exit status directly onto the result vocabulary. `cancelled`
> requires a product-observed cancellation …; a non-zero helper exit with no such observation is
> `failed` with a typed error, or `effect_unknown` with a null after revision and the
> `after_reconciliation` retry disposition already required at `:303`."

The first is a complaint that an *unauthorised side effect of a read* is unreceipted; the second is
about *classifying an outcome* from an exit status, and it presupposes a receipt rather than
requiring one. Neither asserts that a terminal attempt must carry a non-null receipt. I ran an
exhaustive search of claude-hicap's own-job corpus (64 assertion documents, the four shared seed jobs
excluded) for `non-null receipt | terminal receipt | owner receipt | receipt_ref | null receipt |
without a receipt | no receipt`: **two hits, and both are the passages above**.

The adjudicator states the correct test five times on this same finding — union: *"The F001
obligation that every terminal attempt carries a non-null owner receipt is not itself asserted as a
finding"*; deepseek41: *"…is not asserted"*; muse13: *"inside a coverage list"*; glm53: *"The arm
treats the obligation as satisfied rather than finding where it is not enforced"*; Arm C: partial —
and then does not apply it to claude-hicap. Independently, a second reviewer working only the
oh-my-pi side reached the same place from the other direction: muse13's
`J0024-compare/workspace/notes.md:300-302` ("abandoned/disconnected/cancelled runs yield
`cancelled`/`effect_unknown` (never false success) with before/after or null after-revision per
contract") states materially the same rule as hicap's credited J0022 passage and was recorded partial
without that line being considered.

This is blocking because of what rests on it: `claude-hicap-README.md:59` reads **"Corrections (3/5):
`F001`, `F106`, `F107` — the first corrections credited to any new arm"**, and `README.md:216`
turns it into the cost-justification claim. Either withdraw F001 (leaving 2/5, which still supports
"the first corrections credited to any new arm") or state what makes hicap's material different from
the five arms refused on it. **F106 and F107 are excellent and I uphold both** — see §1.

**B5 — adjudication branch. The `glm53` F068 credit is a confirmation of its own input.** F068:

> "Preserve unsubmitted change-description drafts across exact-identity refreshes and clearly
> separate drafts from committed history."

glm53's entire delivered material is one bullet,
`jobs/J0026-reconcile/workspace/notes.md:49`:

> "0.41.0: \"Draft descriptions are saved across operations as long as the change-id of your selection
> remains the same\" — CHANGELOG.md:14. Confirmed (nuance: preservation is keyed on the selection's
> change-id)."

That is the only occurrence of "draft" in glm53's own corpus. Its **frozen input lead** —
`jobs/J0001-discovery/workspace/leads/gg-session-and-selection.md:2`, the premium arm's artifact —
already says "0.41 preserves draft descriptions while selected change ID stays the same." So the arm
restated its input with a citation and the word "Confirmed". No PM obligation is stated, and the
second half of the proposition (separating drafts from committed history) is absent. The basis itself
supplies the connective reasoning — *"It is placed inside the same lead's finding that a change-id is
not a sufficient identity … so draft survival is tied to exact identity rather than to a refresh"* —
which is the adjudicator's synthesis, not the arm's assertion. Contrast the **union arm's** F068
credit, which states the obligation in full ("retain original tree/description baseline independently
from UI reselection, revalidate on completion, preserve the user's result on stale rejection, and
offer explicit reconciliation rather than silent overwrite"). This is blocking because F068 is one of
the four findings on which the "glm53 broke the nesting" conclusion rests.

**B6 — adjudication branch. The `union` F015 credit reads a refusal as an offer.** F015:

> "Add recent-operation and redo navigation with a virtualized operation timeline."

The arm says the opposite of the panel half in the credited passage itself,
`J0017-compare/workspace/notes.md:81`:

> "Keep operation history and Backup on their existing owner routes; **no new rail panel**, universal
> Restore button, or direct UI subprocess."

and at `J0016-compare:20`, "GG's separate application is inspiration, **not a reason to add a JJ-only
panel**." The redo half appears only in the decision line at `J0017:6` — "redo/revert … remain
separately reviewable product choices below—**not approved scope**" — which is the coverage-list form
the adjudicator refuses elsewhere; and Proposal C at `:105` says "**Do not silently add** … bare redo,
or selected-operation revert." The "virtualized timeline" half is not there: `timeline` has zero
occurrences in J0017, and the single `virtualiz` hit (`:38`) is the owner's **source graph** schema.
The basis reads the acceptance clause "bounded hydration works on large **diffs**" as "the
virtualized-timeline half" — that is diff hydration, not a timeline. There is also an internal
inconsistency: F103 was recorded partial with the reason "*not proposed*" on the strength of the same
declining language that F015 was credited for.

*(B4–B6 are blocking only in the sense that they change published numbers. None of them changes any
structural conclusion — see §3, where I recompute the whole lattice with them applied.)*

### Should fix — adjudication branch

**S1 — `README.md:88`: a stale count beside a corrected list.** "The union arm adds **11** findings no
review arm reached" is followed by a list of **nine**. Recomputed: **9**; `cross-arm.json`
`/unions/union_arm_adds_over_all_review_arms` also says 9. The "11" is the pre-glm53 four-arm value.

**S2 — `README.md:92`: the same defect mirrored.** "The review arms hold **14** the union arm misses"
is followed by a list of **sixteen**; recomputed **16**, and `cross-arm.json` agrees. The trailing
"Seven of those **fourteen** are one lead family" needs *sixteen* (the numerator 7 — F032, F033,
F034, F036, F037, F053, F074 — is right).

S1 and S2 sit in the section carrying the "Reachability did change" conclusion and both contradict
`cross-arm.json`, which the README names as the authority. The table right below them (46 / 50 / 43 /
59 / 51) is correct; I recomputed every cell.

**S3 — `README.md:100`: the nesting notation reads as a chain, and the chain is false.**
`` `claude` (18) ⊂ `glm53` (37), ⊂ `muse13` (40), ⊂ `union` (43), ⊂ `claude-hicap` (46) `` parses as a
chain; glm53 ⊄ muse13 and union ⊄ claude-hicap. The intended reading — claude is a proper subset of
each — is what `cross-arm.json /nesting/proper_subsets` writes out as seven separate statements, and
the "Not comparable" list two lines down is only consistent with that. Write the seven relations out.

**S4 — `consolidated-candidates.json`: a dangling pointer on all five Arm C candidates.** C4C-01…C4C-05
carry `"detail_file": "claude-candidates.json"`, which does not exist and is not in `SHA256SUMS`; the
file is `arm-c-candidates.json`. (The Arm C report was renamed to `claude-README.md` in the final
commit; the candidates file kept its prefix.) Every other arm's `detail_file` resolves.

**S5 — cluster-level classifications contradict their members.** `README.md:143` and the matching
`consolidated-candidates.json` cluster say "**C4D-04, C4M-03, C4G-02** … My classification: **product
choice**", but the per-candidate records classify C4D-04 and C4M-03 as `capability`. The "All 27"
table and the totals (20 / 5 / 2, which I recomputed exactly) agree with the per-candidate records, so
the cluster heading is the outlier. Cluster 3 has a milder version of the same ("product choice
(muse13 half A)" where C4M-05 is recorded `capability`).

**S6 — `README.md:137`: the strongest convergence claim omits a shared seed.** The C4C-01 / C4G-01
convergence is real and I uphold it (§5), but "Two arms with different models reached the same defect
**from opposite directions and never saw each other's work**" reads as independent discovery. Both
arms started from the *same frozen premium discovery leads*, which point straight at this territory:

- `J0001-discovery/workspace/leads/dojjo-git-transport-versus-native-closure.md:7` — "Code comment that
  `fsck --connectivity-only` skips `refs/jj/keep` should be verified against Git docs before using it;
  not established here."
- `.../git-backed-store-alternates-and-shared-layout.md:7` — "Git fsck alone does not validate native
  operation/view/extra metadata closure."
- `.../git-promisor-objects-and-offline-restore.md:3` — "a clean Git fsck result in a partial clone
  does not prove every native-history object is present for an offline restore."

I verified these lead files are byte-identical across the claude, glm53 and deepseek41 runs. The
honest framing: five review arms were handed the same explicit pointer, and two of five converted it
into the same concrete contract defect by different routes. Still a real result, still the best
candidate in the set — but not independent discovery.

**S7 — `claude-hicap-findings.json`, F092: a quotation attributed to the wrong arm.** The basis ends
"…so that 'one page can return the remainder of the entire log'." That sentence is **deepseek41's**,
verbatim, at `runs/jujutsu-deepseek41-20260916-202016/jobs/J0026-reconcile/workspace/notes.md:98-99`.
It appears nowhere in claude-hicap's corpus. The credit does not depend on it — hicap's own text is
quoted verbatim earlier in the same basis — but a quotation mark around another arm's sentence inside
a Claude-arm credit is exactly what this bundle exists to make checkable.

**S8 — `evidence-manifest.json /arm_run_state_read[3]`: a path field that is not a path, with a hash
that no longer verifies.** The row is `"path": "continuation4/PROGRESS.md (runner's log)"`, sha256
`868969215f23…`; the file today hashes `c80f9131ca79…`. PROGRESS.md is a live append-only log, so a
read-time snapshot hash is legitimate — but this is the **one** pointer of 258 that cannot be resolved
or re-verified. Label it as a read-time snapshot of a mutable log, or drop the row.

**S9 — `arm-c-findings.json`, F079: the amended-false clause is still quoted unmarked.** The F079 basis
cites J0022's "a current-head closure, not a retained-history closure" as support. That is the clause
the `amendments` block declares materially false (lead `dojjo-sync-complete-prunes-operation-history.md`,
sha256 `7c11e0db99b4…` — verified). The credit itself is sound: its primary basis is J0026
covered-1/covered-3 quoting the closure requirement against the Plans passages, independent of the GC
error, so *"credits stand on independent grounds"* is accurate. But a reader re-checking F079 lands on
a false assertion presented as support, with the amendment in a different part of the file. Mark the
clause inline.

**S10 — `deepseek41-findings.json`: F043 appears in neither the credited nor the partial list.** Every
other arm that worked the diffedit3 material has it: muse13, glm53 and claude-hicap are all credited.
deepseek41 has the material — see §1, "Misses I would credit". A finding with material and no row at
all is a coverage gap; at minimum it needs a partial with a reason.

**S11 — `arm-c-findings.json`, F072 is the thinnest credit I re-derived and should be re-reasoned.**
F072 is "Route all surfaces through one canonical action catalog with authoritative eligibility
rechecks, idempotent command instances and exact work attribution." Arm C's cited material
(`J0026-compare:104-112`) establishes one clause — that the capability gate must be "*enforced at
dispatch*, not merely computed" — and its corpus contains nothing on a canonical catalog, idempotent
command instances or work attribution. The bundle credits at clause level elsewhere but discloses
when it does (muse13 F107 "3 of 4 … NOT addressed"; hicap F106 "the colocation_activation_disposition
case is not"). 1 of 4 with no disclosure is below that bar. I stop short of withdrawing it because
the class is `unsupported_or_rejected`, where naming the proposition against its owner passage is the
expected form (see §1) — but it needs the same disclosure the others got.

**S12 — F092 is credited to five arms on one of its two clauses, undisclosed.** F092 is "Measure
graph/query/snapshot/ref-import costs independently **and** keep bounds and progress labels honest."
Every credited arm states the bounds-label half well; **no arm measures any cost**. The latitude was
applied evenly across both families, so it changes no ranking — but it should be annotated the way
F089's half-coverage was.

### Should fix — runner branch

**S13 — `corrections.json` is a `20:52Z` snapshot and does not contain the four defects.** It has three
items (`C1` deepseek selector label, `C2` omp runtime version, `C3` 41-against-40), of which only C2 is
one of the four. The four defects — event-per-block counting, the meter boundary off-by-one, the
runtime identity, and the shared temp name — live in the README's "Code each arm ran" section, and
**all four verify against the run state**: attempt-1 claude jobs stop at exactly 40 assistant events
with only 10–22 distinct message ids (J0017 = 17, matching "about 17"); `cost_watch.py:241
record_response` has the stated post-response semantics and `arm-history/deepseek41-attempt-1` shows
six jobs with `receipts = count + 1`, each `reconciled: false`, $72.00 of phantom liability against a
$50 cap ending in `Stop: insufficient_priced_usage_headroom`; `discovery_to_plan.py:42` now writes a
pid- and sequence-qualified temp name and the two archived `campaign-terminal.json` files record the
identical `worker-process.json.tmp` `FileNotFoundError` 26.74 s apart; and `omp_native.installed_runtime()`
now shells `--version` and hashes the binary. `corrections.json` predates defect 3 (21:57Z). A reader
sent there for "the corrections record" will not find them.

**S14 — the Codex re-proof procedure is not executable as written.** The fail-closed statement is
present and its diagnosis is exact — I called `codex_native.native_boundary_capability()` live and the
**only** failing comparisons are `meter_sha256` and `collector_sha256`; adapter and proxy still match,
and every launch gate carries the same `codex_status`. But the procedure names no command and no file
(the proof is `protocol/native-boundary-proof.json`, mirrored into each gate's
`native_boundary_proofs`), and its `valid` predicate needs 15 conditions, not 5 hashes — including
`independently_reviewed`, `all_dispatch_routes_verified` and `denied_before_dispatch`, which a literal
hash refresh would carry over from the review of the *old* meter and collector. That is precisely the
relaxation the next sentence forbids. `bounded_campaign.py` additionally requires a `receipt_path`
evidence file whose proxy/runtime hashes agree, i.e. a fresh transport-gate capture.

**S15 — two manifests no longer re-hash, by one telemetry file each.** `glm53/monitor-state.json`
(written 4 s after the freeze) and `qualification/protocol-manifest.json`. Both benign; but
`output-manifests.json` presents its digests as exact, so either re-freeze or annotate.

**S16 — the `protocol_fingerprint` derivation is undocumented.** The fingerprints check out by their
per-file 12-hex components and by their grouping, but the 16-hex value cannot be recomputed from the
pinned hashes without knowing the formula. One line naming it would make the file independently
checkable.

### Notes

**N1 — V1's per-arm labels are slightly off, and the sharper finding is missing.** The report calls
muse13 "NEUTRAL … recorded the call without characterising a retention direction it had not verified".
muse13's J0019 and J0021 both say "op-store GC called with `SystemTime::UNIX_EPOCH` (**not an
aggressive cutoff**)" — a direction, and the correct one — while glm53's near-identical J0020 wording
is credited as "preserved the correct framing it inherited". Same text, two labels. And the finding
V1 misses: that framing is in the **shared frozen discovery lead**
(`dojjo-mirror-normalization-and-cold-join-check.md`, identical in all five review runs), so every
review arm started with the right answer. deepseek41 verified it against source and kept it; muse13
and glm53/J0020 preserved it; **both Claude arms actively overturned a correct inherited framing.**
That is a worse result for the Claude arms than the report states, and it is the cleanest evidence in
the bundle against family bias.

**N2 — quote fidelity is high but not uniform.** I extracted 507 quoted spans from the six findings
files and matched each against the arm's own corpus with markdown- and quote-normalisation: ~93%
verbatim. Most of the residue is my matcher's line-wrap and elision artifacts — every case I opened by
hand (claude F006/F080/F092/F102, deepseek41 F061, hicap F092) had the substance verbatim in the
arm's notes — with a small genuine remainder where single quotes wrap a condensation rather than the
arm's words (claude F102 'entire Git repository including config' against the file's "The entire Git
repository (objects, refs, config, HEAD, …)"), plus S7. Worth a convention: single quotes for verbatim
extracts only.

**N3 — the adjudication branch is six commits behind `main`** (`b0977cd851` merge base; `main` at
`d43694b6e1`) and needs a rebase before an `--ff-only` merge. It touches 29 files, all under
`…/continuation4/adjudication/`, none of which `main` has touched, and it has **zero path overlap with
the runner branch**, so the rebase is trivial and the two can land in either order. The runner branch
is already at `main`'s tip and fast-forwards.

**N4 (trivial)** — the adjudication commits are authored `sittingmongoose@gmail.com`, the runner's
`jared@platyr.com`; all carry the `Co-Authored-By: Claude Opus 5 (1M context)` line.

---

## 1. Credits and misses, sampled both ways

I re-derived **all 18** of Arm C's credits and between 10 and 22 per arm elsewhere — 80 credits in all,
including **every credited correction** (muse13 F107; claude-hicap F001, F106, F107) — by opening the
cited evidence files, finding the arm's own text, and comparing it to the union entry's proposition.
I then hunted uncredited findings in both directions: from each arm's partial list and by lexical
sweep of its whole corpus against the propositions of findings it did not get.

**A boundary that has to be got right first, and is.** `jobs/J0001-discovery` through `J0004` are
byte-identical across all six runs — they are the frozen premium artifacts, not arm output. **No
credit in any of the six sheets cites them.** I checked every evidence path. That discipline is what
makes the review-arm comparison meaningful, and it is also what exposes B5: glm53's F068 material is a
restatement of one of those frozen leads.

**A rule that has to be got right second, and is.** Five of Arm C's credits (F051, F072, F079, F080,
F084) name an "Already covered" entry as their basis, and a reviewer could read that as quoting rather
than asserting. It is not a defect. All five are class `unsupported_or_rejected`, which the report
itself defines as "a union class … It includes propositions the Plans already own", and **continuation
3 credited exactly this form**: `premium-J0022.json` credits F079 on claim `P-J0022-C03`, whose
proposition is F079 verbatim and whose evidence is a coverage-table row citing
`Plans/Jujutsu_Integration.md:30–36,439–505`; `premium-J0020.json` credits F079 on a passage beginning
"**Closure owner:** … JJI-008 … **already covers** …". For this class, naming the proposition against
its owning passage *is* reaching the finding. I therefore **do not** withdraw those five. (F072 is the
one I would re-reason — S11.)

### Credits I would withdraw

Three, detailed as B4 (claude-hicap F001), B5 (glm53 F068) and B6 (union F015) above, each with the
arm's assertion text, the union entry and the reason. Summarised:

| Credit | Union entry | What the arm actually delivered |
|---|---|---|
| `claude-hicap` **F001** (correction) | "Require a non-null owner receipt for every terminal JJ attempt, including failed, cancelled, recovery-required and effect-unknown results." | An unreceipted *read* side effect (J0020) and an *outcome-classification* rule that presupposes a receipt (J0022 R3). Corpus-wide search for receipt-obligation language returns only those two hits. |
| `glm53` **F068** | "Preserve unsubmitted change-description drafts across exact-identity refreshes and clearly separate drafts from committed history." | One bullet confirming a CHANGELOG line already stated in its own frozen input lead; the second half of the proposition is absent. |
| `union` **F015** | "Add recent-operation and redo navigation with a virtualized operation timeline." | An explicit refusal ("no new rail panel"; redo "not approved scope"; "Do not silently add … bare redo"), plus a diff-hydration acceptance clause read as timeline virtualization. |

### Misses I would credit

One, and it is the cleanest kind — a finding with real material and **no row at all**.

**`deepseek41` / F043 — "Authenticate local editor/server sessions, bind caller/repository identity and
avoid reusing stale incompatible server instances."** F043 is in neither deepseek41's credited nor its
partial list. The material is in `jobs/J0021-reconcile/workspace/notes.md`:

> `:50` — "the default implementation rescans current state; **nothing retains the original path set,
> and nothing binds contents, repository, snapshot, session or server identity**. [S00002,
> types.rs:78–83, 94–105]"
> `:52` — "The mutex serializes this process's handlers only — not other filesystem writers, **and not
> a different server instance whose file names coincide**. [S00003, local_server.rs:18, 78–105]"
> `:52` (preceding) — "The error text itself names the scenario: 'Perhaps this client is now connected
> to a different server than the one it was started from?'"

Those are clauses 2 and 3 of the proposition, stated as the arm's own findings with primary citations
— and they are materially the same sentences that earned **muse13** its F043 credit ("the validator
binds no repository, snapshot, session or content identity … while the HTTP mutex 'serializes
handlers only'"). The authentication clause is present only as an open question ("no token; 127.0.0.1
only … can drive a save with a valid-but-stale path set"), so the honest call is 2 of 3 clauses — which
is the bar at which hicap's F106 (2 of 3 counterexamples) and muse13's F107 (3 of 4 clauses) were
credited with disclosure. **I would credit it, disclosing the missing clause**; at absolute minimum it
needs a partial row.

Near-misses I checked and would leave as they are: deepseek41 F085 and F093, muse13 F085, union F093
and F104, Arm C F002 (the arm never found the read-authors-an-operation mechanism at all — the single
biggest substantive gap between the two Claude arms), hicap F022 (the arm makes divergence
*representable and refusable* and explicitly says "Never resolve a divergent change by picking a
visible commit", which is the opposite of offering convergence). Genuine negatives confirmed
lexically: F108/F109/F110 have zero hits in either Claude arm; `promisor` zero across the union
corpus; `rebuild` zero in deepseek41's corpus (so both F083 partials are right); `at-op` zero in
glm53's own corpus.

Two partial *reasons* I would rewrite without changing the verdict: **union F089** ("LFS and submodules
appear only as words in cited Plan text" — they do not; `leads/external-source-payloads.md` asserts
the gitlink/LFS-pointer problem with primary citations, and the verdict still holds on the lead's own
unresolved disposition) and **union F094**'s attribution (the basis quotes "Operation history is not
permanent **writer** audit evidence"; correction 4 at J0018:26 reads "…is not permanent audit
evidence", and the string with "writer" is the title of a lead the evidence array omits).

### Credits I re-derived and uphold

Everything else. High points worth recording because they are the load-bearing ones:

- **claude-hicap F106 and F107** (both corrections) — F106 reads every `allOf` branch of
  `backup_jj_restore_verification_receipt` and names two records that validate today
  (`ready_for_owner_activation` with `working_copy_relation: unverified`, and with
  `workspace_map_result: collision_blocked` and `collision_refs: []`), with R6 stating the fix and the
  reciprocal conditional — and the basis volunteers that the third counterexample is not named. F107
  states all four clauses against the SourceGraph contract, including the parent-expansion clause
  ("only `missing_ancestor` edges leave the page") that no other arm reached.
- **muse13 F107** — four numbered repairs to SCS-017 with five acceptance checks; credited at 3 of 4
  clauses with the gap disclosed.
- **muse13 F008** — "`cmd_resolve()` … rewrites the commit and awaits `tx.finish()` **before** returning
  that partial-resolution error — a nonzero native outcome need not mean no native mutation" — the
  proposition almost word for word, cited to pinned source.
- **deepseek41 F029 and F074** — an owner-level save contract binding repo/worktree identity plus the
  expected native revision, and a process-environment replacement naming `GIT_DIR`/`GIT_COMMON_DIR`/
  `GIT_ALTERNATE_OBJECT_DIRECTORIES` with four decoy-repository fixtures.
- **glm53 F069, F085, F086** — the three that carry the nesting result after B5. Each is genuine arm
  work: "the `GitPushed` phase marker records that push was attempted/completed but **carries no
  server-side evidence**; replay relies on push idempotence rather than a receipt"; "`prepare_workspace_root`
  bails if `.jj` exists or any entry other than `.dojjo` is present". Worth stating in the README that
  the framing was inherited from the frozen lead and the arm's contribution is the code verification —
  a weaker claim than "found something no other arm could see", but a real one.
- **union F005, F019, F024, F025, F038, F052, F057, F065** — the eight that survive B6, all verified
  against the arm's text; F038 and F065 match the proposition nearly verbatim.
- **The union arm's two timeout documents are not truncated.** I read both in full: each is a complete
  Markdown document ending on a finished section, and every credited passage sits in a completed
  section. Nothing rests on a partial save.

---

## 2. Family bias between the two Claude arms and the oh-my-pi arms

The set of union findings **all four** of claude, claude-hicap, deepseek41 and muse13 attempted
(credited or recorded partial) is 28. Verdicts split on eight:

| Finding | claude | claude-hicap | deepseek41 | muse13 |
|---|---|---|---|---|
| F001 Terminal attempts always have receipts | partial | **CREDIT** | partial | partial |
| F002 · F007 · F011 · F029 · F074 · F089 | partial | **CREDIT** | **CREDIT** | **CREDIT** |
| F051 Colocated import/export stays fail-closed | **CREDIT** | **CREDIT** | partial | **CREDIT** |
| F083 Backup derived indexes | partial | **CREDIT** | partial | partial |
| F094 Operation metadata is not idempotency | partial | **CREDIT** | partial | partial |

Credit rate on the 28: claude-hicap 27, muse13 24, deepseek41 23, claude 18.

**Verdict: no family bias. The same assertion quality got the same verdict**, with one credit
(claude-hicap F001) that fails the adjudicator's own test and which I would withdraw on the merits
rather than as evidence of favouritism. The reasons:

- **Arm C — the other Claude arm — is denied in all eight splits, carries 13 partials (the most of any
  arm), and loses nine head-to-head decisions to non-Claude arms.** If the family were being
  protected, Arm C is where it would show. Instead Arm C is the floor of the entire experiment and its
  18 credits are a proper subset of all five other arms' — which I confirmed by recomputation.
- **The three-way splits are earned, and I read both sides.** On **F083** ("Choose whether recoverable
  backups retain native derived indexes or rebuild them"), hicap *settles the choice* — "explicitly
  rebuildable and should be recorded as derived … excluded from the captured sidecar set", with
  BRS-006's "Derived state is rebuilt from canonical restored bytes and is never trusted as portable
  authority" — while deepseek41 and muse13 list index paths in a closure manifest and an apply-order
  layer and never pose retain-versus-rebuild. The word "rebuild" has **zero** occurrences in
  deepseek41's arm-authored corpus.
- **On F107 — the finding the brief singles out — the strictness runs *against* the family.** muse13 is
  **credited** while explicitly missing a clause ("F107's finite parent-reference expansion policy
  clause is NOT addressed — unlike claude-hicap"), and the identical clause-level leniency is applied
  to hicap on F106. Two arms, two partial-clause credits, one from each family. glm53's F107 partial
  is the sharpest reasoning in the bundle — "THE ARM HAD THE EVIDENCE AND NEVER ROUTED IT" — with the
  three GG defects matched clause by clause and denied only because no compare job stated them against
  the SourceGraph contract; the arm corroborates it in its own words ("the bounded source graph …
  remains future work, not done here").
- **On the graph leads (F061, F092, F030, F066) there is no split at all** — every arm that attempted
  them is credited on source-line or contract-line grounding, and the adjudicator calls **glm53's**
  F061 "the strongest continuation-4 statement of the continuity clause".
- **F051 runs the other way and is handled transparently.** deepseek41 is the only arm denied, and the
  reason names the asymmetry out loud: "(Arm C stated it explicitly and is credited.)" Reading both:
  Arm C's covered-2/covered-4 name the import/export obligation specifically ("jj git import or jj git
  export is never assumed as reconciliation"; "Unsupported or uncertified import/export blocks
  reconciliation and never triggers a fallback mutation") and add the arm's own line "PM requires the
  gate to be *enforced at dispatch*, not merely computed"; deepseek41 cites adjacent general policy
  (JJI-004/007 "no fallback Git mutation", JJI-006 ac3) and `import/export` returns one irrelevant hit
  in its corpus, so the partial is not a reading failure. The parenthetical overstates Arm C slightly
  — Arm C states the certified-gate half, not "unavailable by default" — but **muse13 was credited on
  materially the same strength**, which is the point: the standard was applied across families, not
  within one.
- **The decisive counter-evidence is V1.** On the one hard code fact in the experiment the adjudicator
  recorded **both** Claude arms as wrong, recorded deepseek41 as right, and amended four of Arm C's own
  adjudication files against itself on deepseek41's finding (commit `c66df39caa`). I verified the
  amendment propagated to all four Arm C files and that the named lead's sha256 matches.

**Where the margin is thinnest on the Claude side,** for completeness: **claude-hicap F094**. Hicap's
Repair 3 ("nothing requires the after-operation's parent to be the before-operation, so a fork is
invisible in the receipt") is adjacent to F094's "operation IDs are not a replacement for durable
command-instance identity" rather than identical to it, while deepseek41's J0027 carries the closest
thing in the experiment to F094's *first* clause (an oplog entry recording only "`[AMEND] Amended
commit`" for an operation that also silently evicted a stack) and is denied. I would **not** withdraw
it — hicap's text is contract-scoped, stated as a repair, with fixtures; deepseek41's is incident
verification of an external product, already credited under F102 — but it is the boundary case. Note
that the **union arm**, not a Claude arm, is credited on F094 on the stronger basis ("Operation history
is not permanent audit evidence").

**And the one substantiated asymmetry runs through B4, not through the family.** muse13's
`J0024-compare:300-302` states essentially the rule hicap was credited for on F001 and was partialed
without that line being considered. The correct resolution is to withdraw hicap's credit (neither
states F001's proposition), not to upgrade muse13's — but either way the two must match.

---

## 3. The nesting, the review-arm union and the six-arm union, recomputed

I rebuilt every arm's credited set from the `credited[].finding_id` lists (no duplicates; every id
inside the 110-finding union; none outside it) and recomputed the lattice from scratch.

| Claim in the bundle | My recomputation |
|---|---|
| claude 18, deepseek41 33, glm53 37, muse13 40, union 43, claude-hicap 46 | **all six exact** |
| per-arm class splits (corr / cap / prod / unsup) | **all six exact** |
| premium 78 (4/20/3/51), hybrid 90 (2/30/5/53) | **exact**, from `comparison.json` |
| proper subsets: claude ⊂ {glm53, muse13, union, claude-hicap}; deepseek41 ⊂ {muse13, claude-hicap}; muse13 ⊂ claude-hicap | **exactly these seven, no others** |
| eight incomparable pairs with their per-side counts | **exact, same eight pairs** |
| four-arm review union = 46 = claude-hicap's own set | **true — set equality, not just cardinality** |
| five-arm review union 50 (45.45%); union arm 43 (39.09%); six-arm union 59 (53.64%); no arm 51 | **all four exact** |
| glm53 adds F068, F069, F085, F086 | **exact** |
| union arm adds 9 (README says 11 — S1) | **9** |
| review arms hold 16 (README says 14 — S2) | **16** |
| union arm by stage: 12 / 0 / 0 / 10 / 21 | **exact** (`stage_first_earned`) |
| per-arm overlap with premium / hybrid (12 figures) | **all twelve exact** |
| no arm credited anything outside premium ∪ hybrid | **true** — premium ∪ hybrid is all 110 |

**The nesting claim — the one the brief flags as driving the conclusion — holds**, and so does its
sharper form: the four-arm review union was *set-equal* to claude-hicap's 46, and glm53 genuinely
breaks it. Only the two prose counts (S1, S2) and the chain notation (S3) are wrong.

**And here is the part that matters most.** I recomputed the whole lattice with my four adjustments
applied (−F001 hicap, −F068 glm53, −F015 union, +F043 deepseek41):

| | as adjudicated | with my adjustments |
|---|---|---|
| claude / deepseek41 / glm53 / muse13 / union / claude-hicap | 18 / 33 / 37 / 40 / 43 / 46 | 18 / **34** / **36** / 40 / **42** / **45** |
| four-arm review union | 46, = hicap's set | **45, still = hicap's set** |
| five-arm review union | 50 (45.45%) | **48 (43.64%)** |
| six-arm union | 59 (53.64%) | **57 (51.82%)** |
| reached by no arm | 51 | **53** |
| union arm adds over all review arms | 9 | **9** (F015 out, F068 in) |
| review arms hold, union misses | 16 | **15** |
| glm53's review-arm-exclusive set | F068, F069, F085, F086 | **F069, F085, F086** |
| all seven proper subsets | hold | **all seven still hold** |
| claude-hicap corrections | 3/5 | **2/5** |

**Every structural conclusion survives.** Arm C is still contained by all five other arms; the
four-arm review union is still exactly claude-hicap's set; glm53 still holds findings no other review
arm reached, so claude-hicap is still not the review-arm ceiling; and "no arm extended the union" is
untouched. That robustness is worth stating in the report itself.

I also rebuilt the per-arm job tables from durable state rather than from either bundle's summary, and
every figure in the review-arm table reproduces:

| Arm | own jobs (model-matched) | bound on responses | jobs with a saved assertion |
|---|---|---|---|
| claude | 12 | 11 (`runtime_status: request_limit_reached`) | 4 |
| deepseek41 | 12 | 10 (`budget_truncated`) | 8 (7 notes.md + 1 leads-only) |
| glm53 | 12 | 7 | 8 |
| muse13 | 12 | 2 | 11 |
| claude-hicap | 12 | 0 | 12 |
| union | 20 | — | 19 |

---

## 4. The garbage-collection predicate — I read the source myself

The cited file is in every arm's cache and is **byte-identical across all six**
(`cache/v3/repos/jj-vcs--jj/lib/src/simple_op_store.rs`, sha256 `a42ce0f6208002fc26…`), so all six arms
read the same bytes.

```rust
//  lib/src/simple_op_store.rs:286-299   (async fn gc at :277)
let remove_file_if_not_new = |entry: &fs::DirEntry| -> Result<(), PathError> {
    ...
    let mtime = metadata.modified().expect("unsupported platform?");
    if mtime > keep_newer {
        tracing::trace!(?path, "not removing");
        Ok(())
    } else {
        tracing::trace!(?path, "removing");
        fs::remove_file(&path).context(&path)
    }
};
```

`remove_file_if_not_new` **keeps** a file when `mtime > keep_newer`. With `keep_newer =
SystemTime::UNIX_EPOCH` every real file's mtime is greater, the predicate is true for every candidate,
and **nothing is removed**. The two call sites (`:337` in `prune_ops`, `:354` in `prune_views`) reach
it only for entries outside the reachable set, so the whole unreachable sweep is a no-op at that
cutoff. **The adjudicator's reading is correct.** (Pedantic: the cite "285-357" starts one line above
the closure; the predicate is :292-297.)

The per-arm outcomes are accurate, and I confirmed each from the arm's own text:

- **claude — wrong, asserted as fact.** "UNIX_EPOCH preserves nothing by recency, i.e. it is the
  maximally aggressive setting for the unreachable set"; "everything unreachable from the single
  just-loaded head is deleted with zero grace period"; "A dojjo mirror is a current-state replica,
  never an operation-history archive." It quoted jj's own doc text ("objects created after
  `keep_newer` will be preserved") and inverted it.
- **claude-hicap — wrong, having quoted the correct predicate.** "The implementation removes any file
  whose mtime is **not greater than** `keep_newer` (lib/src/simple_op_store.rs:286–299)" — exactly
  right — then "Passing UNIX_EPOCH therefore disables the concurrency grace window entirely" and
  "Dojjo's server is thus strictly more aggressive than anything jj exposes to users." The control's
  counter-result is real.
- **deepseek41 — right, and it reached my conclusion.** "With `keep_newer = UNIX_EPOCH`, every real file
  is newer than the cutoff, so this call deletes nothing", citing `op_store.rs:478-488` and
  `simple_op_store.rs:277-300`, plus the contrast that jj's own CLI derives `keep_newer` from a
  retention window (`cli/src/commands/util/gc.rs:54-67`).
- **glm53 — both, and the self-quarantine is genuine.** J0023 infers the wrong direction and in the
  same document writes "Exact `op_store::gc` reachability/grace semantics are inferred from the call
  shape … not verified against pinned jj source. Flagged uncertain; verify against jj
  `simple_op_store` before reusing the claim."
- **union — not reached** on the Dojjo question (it read `simple_op_store.rs` in J0002/J0010 for
  layout, never the GC cutoff).
- **muse13** — see N1; "NEUTRAL" undersells it.

The conclusion — "an error labelled as an unverified inference with the verification step written down
is not the same failure as an error asserted as fact" — is right. I would add N1's finding: the correct
framing was in the shared input, and only the two Claude arms overturned it.

---

## 5. The strongest candidates

**C4C-01 + C4G-01 — "restore-drill object verification has no defined depth". The convergence is real,
and both are correctly classified as corrections.** A correction must name a promise in canon and a
contradiction of it, and both do:

- *the promise* — JJI-008's restore acceptance at `Plans/Jujutsu_Integration.md:468` requires restoring
  the selected historical operation "with object verification", and the consumer acceptance rows at
  `forge_backup_tsnet_acceptance.json:1158` and `:4841` repeat the phrase;
- *the contradiction* — no Plan, schema or fixture says what that verification must detect, so
  `object_closure_result: complete` is admissible from a connectivity-only pass, which `git-fsck(1)`
  documents will not read blobs at all;
- *distinctness from F081* — F081 requires complete native object interpretation and an isolated
  restore before activation; it does not constrain the depth allowed to produce the receipt's value.
  That is the same shape continuation 3 used to hold F106 distinct from F001 — an underdetermined
  field inside an already-present typed receipt — and continuation 3's own F106 is a correction in the
  same JJI-008 restore-verification family.

They are the same defect reached two ways: Arm C from receipt admissibility, pointing at the Backup
owner's existing `integrity_verification_level` enum as the vocabulary to reference; glm53 from the
undefined term plus the discriminating fixture — a byte-flipped blob under matching refs, the test
that separates the two readings, grounded in field evidence where refs agreed via `ls-remote` while the
object store was torn. glm53's is the stronger: it names the cheap reading an implementer would pick
and supplies the negative that falsifies it. Neither is inside any continuation-3 rejection — I checked
all four in `continuation3/final/symmetric-adjudication.json`. **I agree this is the one candidate
worth putting in front of the Plans owners on its own.** The only change I would make is S6: say that
both arms were following the same inherited pointer, and that three arms with the same pointer did not
convert it.

**The five flagged as inside continuation-3 rejections — I agree with all five**, and the reasoning is
unusually honest:

- **C4C-04** (a blocker class for present-but-unloadable native metadata) — a corruption-taxonomy
  refinement under F082, squarely inside "Corruption taxonomy, extras detector, clone stage details and
  arbitrary conflict editor". The adjudicator flags its *own* Arm C candidate and marks the entry
  "CONTESTED BY THE ADJUDICATOR" — the right way to record a disagreement you are not authorised to
  resolve.
- **C4D-04, C4M-03, C4G-02** (the diff/merge-editor save surface) — all three are the "arbitrary
  conflict editor" surface, and each is additionally flagged for restating union obligations already
  credited to the same arm (F029, F031, F033, F034, F036, F037, F056). The residue identified as new is
  narrow and correct: the Plans *name* a structured merge editor (`UI_Command_Catalog.md:549`) and an
  external merge-tool preference (`storage-plan.md:1927`) with no save contract for either; C4M-03's
  Option B (scope the surface read-only with a typed disabled reason) is a genuine second disposition;
  and C4G-02's "`missing` is a scan fact, never a write instruction" does not depend on opening the
  surface. "Record; expect a decline on continuation 3's reasoning" is the right disposition.
- **C4U-05** (conflict presentation must not substitute a deletion-shaped surrogate) — a presentation
  refinement under F056, correctly flagged and correctly hedged.

**I checked the other twenty-two for under-flagging and found none.** The two closest are handled better
than a flag would have been: **C4H-02** and **C4U-01** land on the *same side* as continuation 3's
rejection of "add a mutating `status.refresh` branch as a required correction" — they keep reads
non-authoring by pinning them, and the union arm says in its own words that "blanket addition of writer
leases to all reads would change the existing contract unnecessarily", reached from its own discovery
with no sight of continuation 3. That is the best evidence in the experiment that the 110-finding union
is well drawn. **C4D-02** likewise runs *with* the marker-only rejection; **C4H-04** is the opposite
direction from the rejected credential-prompting expansion.

One cross-reference beyond S5: **C4M-01** ("JJI-008 states the ends of closure completeness but names no
decision procedure") is in the same JJI-008 family as C4C-01/C4G-01 — a different defect (closure
expansion and ordering, not verification depth), but it belongs in the cluster's cross-reference.

---

## 6. Manifests, quarantine, hygiene and secrets

### Adjudication branch

| Check | Result |
|---|---|
| `SHA256SUMS` over the bundle | **28 of 28 match**; 28 hashed files + `SHA256SUMS` = the 29 files in the directory and in `HEAD` — full coverage |
| working tree vs `HEAD` | identical on every file checked; the tree is the commit |
| evidence pointers in `evidence-manifest.json` | **257 of 258 re-hash correctly**; the exception is S8 |
| evidence pointers inside the six `*-findings.json` | **481 references, 105 distinct files, 0 missing, 0 hash mismatches** (a second pass over glm53 + union alone re-hashed all 181 of theirs: 0 mismatches) |
| the six arm output manifests re-hashed against their trees | five arms **0 differing files**; glm53 differs in **exactly one**, `monitor-state.json`, 592 bytes in the manifest against 769 on disk |
| quarantined interrupted runs not scored | **confirmed**: all 520 run-scoped evidence path references resolve into the six retained run directories only. `jujutsu-union-20260916-214322` and `jujutsu-glm53-20260916-214321` appear once each, in `/quarantined_runs`, and nowhere else |
| nothing outside `reports/**` | **confirmed** — 29 files, all under `…/continuation4/adjudication/`, zero overlap with `main` or with the runner branch |
| secrets | **clean** — no `sk-or-v1-`, no other `sk-` token, no Bearer / api-key / `ghp_` / `AKIA` / private-key / token-assignment shape. The eight `openrouter` hits are the route name `openrouter/stealth/union-alpha` in prose |
| commit hygiene | **exemplary** — seven commits, each touching only adjudication paths, none with `git add -A` scope, every message describing what it adds and what it found, including `c66df39caa` which records an amendment against the adjudicator's own earlier work; all carry the co-author line |

**On V6 (the glm53 monitor-state race) I confirm the disclosure is complete, not merely accurate.** All
5,758 manifest rows resolve; 0 missing, 0 extra; the manifest's internal digest recomputes to
`e2d003ea…` exactly; and the single difference is `monitor-state.json`, whose mtime is 3.99 s after the
manifest's. All 100 assertion documents, every job record under `jobs/**`, `run.json`, `timing.json`,
`progress.json`, `priced-usage-final.json` and `campaign-terminal.json` are byte-identical. The
designed-stop evidence does not depend on the changed file: `campaign-terminal.json` carries the same
`"stop_reason": "Stop: admitted_attempt_cap"`, written *before* the freeze, and is byte-identical. The
recommended fix — quiesce the monitor before hashing — is right and belongs in the runner's freeze
procedure.

I also confirmed the **claude-hicap ceiling was authorised, not asserted**: `launch-gate-claude-hicap.json`
records `max_model_requests_per_job: 160` with `limits_differ_from_goal2` naming all three raised
limits. **V7 reproduces exactly** — hicap's twelve jobs used 37, 53, 54, 55, 58, 58, 65, 66, 78, 78, 88,
110 native receipts, eleven above 40. **V2 reproduces**: the stale `opencode-go/deepseek-v4-flash`
cost-policy block is present even in the claude-hicap gate, confirming it is a copied frozen block and
not a per-arm selector. **V3, V4 and V5 reproduce** (V5: 484 native receipts across the 17 completed
union jobs plus 52 durable-metered-never-receipted in the three killed jobs = 536; the three killed
jobs have no `usage.json` at all and their 27/12/13 counts are confirmed in `raw-omp/events.jsonl`).

### Runner branch

| Check | Result |
|---|---|
| README timing table (21 rows) | **reproduces** — every summed figure exact, every wall within 0.2 s, every concurrency to 4 dp |
| README job-status table (6 rows) | **reproduces** from `outcome.json` + priced-usage stop reasons |
| README cost table | **reproduces** — the Claude arms' `run.json` cost sums ($36.1240, $82.5164) equal the meter's `observed_upper_usd`; the omp arms equal the exact sum of native `usage.cost.total`; the $3.00 unresolved is 3 killed jobs × the `$1` cold allowance in `launch-gate-union.json` |
| README delivery table | **five of six rows reproduce**; the union row is **B1** |
| `output-manifests.json` internal digests | **all 12 reproduce exactly** under `hash_manifest.py`'s algorithm |
| independent tree re-hash | **10 of 12 bit-exact**; the two exceptions are one telemetry file each (S15). **No arm job output differs anywhere** |
| `freeze-history.json` | seven generations in order; every gate binds a real generation inside its window; the superseded `5f5e0c27` really was used by no run; the final freeze and every file in it matches on disk. **One field wrong — B2** |
| `protocol-fingerprints.json` | pinned code matches for all 11 runs; runs sharing a fingerprint share identical key-file hashes. Derivation undocumented — S16 |
| `corrections.json` / the four defects | **all four defects verified real and accurately described**, including a regression test I ran for the temp-name race. But they are in the README, not in `corrections.json` — S13 |
| Codex fail-closed | **present and exactly diagnosed** (live capability call: only `meter_sha256` and `collector_sha256` mismatch). Re-proof procedure under-specified — S14 |
| `runtime-identity.json` | everything it records is correct; three arms omitted — **B3** |
| nothing outside `reports/**` | **confirmed** — 12 files, all added, all under `reports/jujutsu-research-2026-09-11/continuation4/` |
| secrets | **clean** — swept for `sk-or-v1-`, `sk-`, `sk-ant-`, `sk-proj-`, Bearer, `api_key`, `token=`, `ghp_`/`gh[pousr]_`, `AKIA`, `PRIVATE KEY`, `-----BEGIN`, `xox[baprs]-`, JWT, `AIza`, `secret`, `password`, `authorization`, `credential`, plus an entropy scan for opaque strings ≥24 chars. **Zero credential hits; no OpenRouter key anywhere.** Every high-entropy hit is a path, an identifier or a SHA-256 |
| commit hygiene | **passes** — one commit, 12 intended paths, a message naming all six arms and every artifact class, the co-author line present; the repo's only hook fires solely on staged `Plans/`, so no bypass was possible or needed; branch name matches the `<kind>/<name>-<date>` template and is pushed |

---

## Verdicts

### `research/jj-c4-adjudication-20260916` @ `5bcca30362` — **fix first**

The method is sound and the evidence discipline is the best I have reviewed in this campaign: 481
evidence references hash-verify with zero failures, `SHA256SUMS` is complete, the quarantined runs are
genuinely unscored, the frozen-input boundary is drawn correctly and never crossed, the manifest race
is disclosed more completely than it needed to be, the amendment against the adjudicator's own earlier
work is recorded in the commit history, and the nesting result — the claim the brief flagged as
load-bearing — recomputes exactly, including the set-equality it rests on. There is no family bias.

Fix before landing:

1. **B4** — withdraw `claude-hicap` F001, or state what makes its material different from the five arms
   refused on the same finding; update `claude-hicap-README.md:59` (3/5 → 2/5) and `README.md:216`.
2. **B5** — withdraw `glm53` F068 and update the review-arm-exclusive set to {F069, F085, F086}.
3. **B6** — withdraw `union` F015; reconcile it with the F103 partial reason.
4. **S10** — record `deepseek41` F043 (I would credit it at 2 of 3 clauses with the gap disclosed;
   a partial with a reason is the minimum).
5. Republish the affected figures. With 1–4 applied they are: 18 / 34 / 36 / 40 / 42 / 45; four-arm
   review union 45 (still = claude-hicap's set); five-arm review union 48 (43.64%); six-arm union 57
   (51.82%); reached by no arm 53; review arms hold 15. **State that every structural conclusion
   survives** — all seven proper subsets, the set-equality, glm53 breaking the ceiling, and "no arm
   extended the union".
6. **S1, S2, S3** — the two stale counts and the chain notation.
7. **S4** — `claude-candidates.json` → `arm-c-candidates.json`.
8. **S5** — cluster classifications.
9. **S6** — disclose the shared discovery-lead pointer behind the C4C-01/C4G-01 convergence.
10. **S7, S8, S9, S11, S12** — the misattributed quote, the unresolvable manifest row, the unmarked
    amended-false clause, F072's undisclosed single-clause credit, F092's undisclosed half-coverage.
11. **N3** — rebase onto `origin/main` (trivial; disjoint paths) before `--ff-only`.

Items 1–5 change published numbers and must land together. Items 6–10 are text and pointer fixes.

### `research/continuation4-20260917` @ `2bd36e1881` — **fix first**

Everything in this bundle reproduces from the durable run state except three things, and the three are
all in the provenance layer rather than the measurements: every timing, cost, job-status, stop-reason,
lead-delivery and lead-stage figure recomputes; all 12 manifest digests reproduce and 10 of 12 trees
re-hash bit-exact with no job output differing anywhere; the freeze chain is sound; all four defects
are real, correctly described and evidenced; Codex genuinely is fail-closed for exactly the stated
reason; branch scope, secrets and commit hygiene are clean; and it fast-forwards onto `main` today.

Fix before landing:

1. **B1** — union delivery `18 of 20` → `19 of 20` (contradicted by the filesystem *and* by the bundle's
   own `arm-reports/union.json`).
2. **B2** — `freeze-history.json:63` `"2026-09-17T00:1xZ"` → the real freeze time (~`2026-09-16T22:11:33Z`).
3. **B3** — regenerate `runtime-identity.json` from all runs (the data is present and correct — I
   reproduced it), or soften the README claim at `:137`.
4. **S13** — either fold the four defects into `corrections.json` or change the README's pointer.
5. **S14** — make the Codex re-proof procedure executable: name the file and the command, and state the
   independent-review and transport-gate-receipt conditions that `bounded_campaign.py` also checks.
6. **S15, S16** — annotate or re-freeze the two telemetry-only manifest differences; document the
   fingerprint derivation.

---

## Commands run

```
git -C /mnt/Cursor/PuppetMaster worktree list ; git branch -a | grep -iE 'c4|continuation4|jj-'
git -C /mnt/Cursor/PuppetMaster diff --stat <merge-base>..research/jj-c4-adjudication-20260916
git -C /mnt/Cursor/PuppetMaster diff --stat <merge-base>..research/continuation4-20260917
git -C /mnt/Cursor/PuppetMaster log --format=... main..research/jj-c4-adjudication-20260916
git -C /mnt/Cursor/PuppetMaster show --stat --format='' <each of the 7 adjudication commits>
git -C /mnt/Cursor/PuppetMaster log -1 --format='%an <%ae>%n%s%n%n%b' research/continuation4-20260917
git -C /mnt/Cursor/PuppetMaster status --porcelain ; git -C <each worktree> status --porcelain
git -C /mnt/Cursor/PuppetMaster cat-file -e main:<each branch path>          # all new paths
git -C ~/pm-worktrees/jj-c4-adjudication-20260916 show HEAD:<file> | sha256sum   # tree vs HEAD
cd <adjudication bundle> && sha256sum -c SHA256SUMS
python3 ~/PM-Experiments/c4-review-20260917/recompute.py          # sets, nesting, unions, class splits
python3 ~/PM-Experiments/c4-review-20260917/revised.py            # lattice with my four adjustments
python3 ~/PM-Experiments/c4-review-20260917/verify_evidence.py    # 481 evidence refs re-hashed
python3 ~/PM-Experiments/c4-review-20260917/verify_quotes{2,3,4}.py   # 507 quoted spans vs corpora
python3 ~/PM-Experiments/c4-review-20260917/verify_manifest{,2,3}.py  # 258 manifest pointers
python3 ~/PM-Experiments/c4-review-20260917/all_manifests.py      # six output manifests vs trees
python3 ~/PM-Experiments/c4-review-20260917/glm_race.py           # V6, 5,758 rows
python3 ~/PM-Experiments/c4-review-20260917/jobtable{,2,3}.py     # job tables from durable state
sed -n '275,360p' <run>/cache/v3/repos/jj-vcs--jj/lib/src/simple_op_store.rs   # V1, read directly
sha256sum <the same file in all six arm caches>                   # byte-identical across arms
python3 /tmp/gcgrep.py 'UNIX_EPOCH' ; python3 /tmp/gcgrep.py 'op-store GC|op_store\(\)\.gc'
grep -rIiEc '<11 credential patterns>' <both branches' added files>
grep -rIoE '[A-Za-z0-9_-]{40,}' <runner bundle> | grep -vE '^[0-9a-f]{64}$'
python3 -c "json.load(comparison.json)" ; …/symmetric-adjudication.json ; …/job-coverage.json
python3 -c "…" <continuation3 detailed per-job reviews>           # the crediting precedent
sed -n '<ranges>' <arm notes.md and leads/*.md across all six runs>   # every sampled credit
```

Four sub-reviews ran in parallel under my direction (two Claude arms; the two oh-my-pi arms; glm53 and
union; the runner's bundle). **I verified every consequential claim they returned against the sources
myself before adopting it, and I rejected five proposed withdrawals** (Arm C F051, F072, F079, F080,
F084) after establishing from continuation 3's own per-job reviews that an "already covered" statement
naming the proposition and its owner passage is how an `unsupported_or_rejected` finding is credited —
`premium-J0022.json` credits F079 on exactly that form.

---

# Runner delta — `research/continuation4-20260917` @ `0eb6efd270` (2026-09-17)

**I am an Opus 5 agent.** Delta review only, of the single fix commit `0eb6efd270` on top of `2bd36e1881`,
under the same read-only rules: both worktrees and all run directories untouched, no git command that
changes state, scratch under `~/PM-Experiments/c4-review-20260917/`.

**Verdict: fix first — one item.** Five of the six items are closed, several verified more strongly than
asked. The sixth (S14) is right in substance and wrong in three checkable details, all inside the one
paragraph whose purpose was executability.

## Scope, and what did not move

Six files, all under `reports/jujutsu-research-2026-09-11/continuation4/`; nothing outside `reports/**`.
All six `arm-reports/*.json` are **byte-identical** across the delta, so the machine-generated
measurement layer was not touched. No timing, cost, job-status or stop-reason figure changed: the only
money and stop-reason strings anywhere in the diff are *new prose inside the D1 and D2 defect records*,
describing the archived attempts ($12 cold liability, $72.00 against a $50 cap, `Stop:
insufficient_priced_usage_headroom`, 17 receipts against a CLI-reported $1.06945) — all of which I
verified against the archived runs. Secrets: clean. I swept the 296 added lines for `sk-or-v1-`, `sk-`,
`sk-ant-`, `sk-proj-`, Bearer, `ghp_`/`gh[pousr]_`, `AKIA`, `PRIVATE KEY`/`-----BEGIN`, `xox[baprs]-`,
`AIza`, JWT, `api_key`, `token=`, `password`, `OPENROUTER`/`ANTHROPIC_API`/`OPENAI_API` — zero hits; and
`git grep` for the OpenRouter key shape across the whole bundle at the new tip is empty. The only
≥40-character non-SHA-256 string added is the record id `D3-shared-temp-name-in-the-record-writer`.
Commit hygiene holds: one commit, twelve intended paths, a message that states each item and asserts
"No figure changed", the `Co-Authored-By` line present, branch pushed and identical to its remote.

## Item by item

**B1 — CLOSED.** `README.md:109` now reads `19 of 20`, and the new sentence names both documents:
`J0018` and `J0020` at 6,336 and 8,790 bytes, with only `J0019-reconcile` producing none. I re-read the
files (same sizes) and corroborated against the bundle's own machine-generated `arm-reports/union.json`:
20 job rows, `notes_present: true` on **19**, false only on `J0019-reconcile`. The README and its data
file now agree.

**B2 — CLOSED, with its provenance made explicit.** `freeze-history.json` final generation now reads
`"landed": "2026-09-16T22:11:33Z"`, and two new fields were added: `landed_source: "mtime of
protocol/freeze.json"` and a `precedes` field naming both governed windows. Ground truth: `stat` on
`protocol/freeze.json` gives `2026-09-16 22:11:33.571759870 +0000` — an exact match to the second. And
it genuinely precedes both arms it governed: I recomputed the earliest own-model job start from each run
— union `2026-09-16T22:19:36Z`, glm53 `2026-09-17T00:07:09Z` — both after the freeze. The other six
generations are unchanged and still ordered.

**B3 — CLOSED, and I re-derived the whole file.** `runtime-identity.json` is regenerated
(`regenerated_at: 2026-09-17T02:09:05Z`, with a `supersedes` field naming the old 20:50Z snapshot and its
two defects). It now carries **eleven** runs. I wrote my own scanner over `jobs/*/raw-*/run.json` for
every one of those eleven run directories and compared job counts and every `(binary,
self_reported_version, sha256)` tuple: **all eleven match exactly** — the six scored arms at 12 jobs each
(union 20) and the five archived attempts, including union attempt 1 alone on `omp/18.1.13` with its
distinct hash `3be5a308cc91e6f6…`. `claude-hicap` is now 12, not 6. The README sentence at `:137` was
rewritten to match what the file actually contains, and it does.

**S13 — CLOSED.** `corrections.json` now carries `D1`–`D4` alongside `C1`–`C3`, with a `scope` field
separating the two classes and a `recorded_at` that dates each. Each defect record has `defect`,
`evidence` (the archived attempt plus the observable shape), `fix`, `fixed_in_freeze` and
`effect_on_scored_results`. I checked the freeze mapping: all four `fixed_in_freeze` hashes resolve to
real generations in `freeze-history.json` whose `contains` text describes the matching fix — D1 →
`18fe177b` ("counts distinct response ids (was stream blocks)"), D2 → `fad9e93b` ("a post-response
boundary always counts the response that already happened"), D3 → `53f8fac9` ("temp name unique to the
writing process and call … test_worker_record_races.py"), D4 → `1440ca6c` ("read the installed runtime's
version and binary hash instead of declaring a hardcoded version"). Two evidence figures I re-derived
myself: D3's "26.74 s apart" is exactly the gap between the two archived `campaign-terminal.json`
timestamps (21:57:16.744919Z → 21:57:43.481803Z = 26.74 s); and D1's J0017 has **17** receipts in
`native-job-end-accounting.json` against `claude-usage.json`'s inflated `request_count: 40`, with
`claude-result.json` reporting `total_cost_usd: 1.06944999…` — the defect's shape and its "job-end
receipts were already right" claim, both confirmed.

**S15 — CLOSED.** `output-manifests.json` gains `re_hash_notes` naming both trees, each with a reason and
`affects_job_outputs: false`, plus `procedure_change`: "Quiesce the monitor (and any writer of telemetry)
before hashing a tree, then freeze." Both differences match what I established independently: glm53's
`monitor-state.json` (592 → 769 bytes, written 3.99 s after the freeze) and the qualification tree's own
older copy of `protocol-manifest.json`. The note that the two are annotated rather than re-frozen, so the
published digests keep matching what was reported, is the right call.

**S16 — CLOSED, verified six times over.** `protocol-fingerprints.json` gains a `derivation` field:
`sha256(json.dumps({file: run.json's protocol_sha256[file] for file in key_files}, sort_keys=True).encode()).hexdigest()[:16]`.
I was asked to recompute one fingerprint; I recomputed **all six** scored arms from each run's own
`run.json` against the file's own `key_files` list, and every one matches:

| Arm | published | recomputed |
|---|---|---|
| claude (Arm C) | `0401998ac3125045` | `0401998ac3125045` |
| claude-hicap | `ff6b49f2519e6aec` | `ff6b49f2519e6aec` |
| deepseek41 | `ff6b49f2519e6aec` | `ff6b49f2519e6aec` |
| muse13 | `e77238fbea761a01` | `e77238fbea761a01` |
| union | `d4aa6f95cd22f33f` | `d4aa6f95cd22f33f` |
| glm53 | `d4aa6f95cd22f33f` | `d4aa6f95cd22f33f` |

The file is now independently checkable, which is what the item asked for.

**S14 — delivered in substance; three factual slips to fix.** The procedure is now genuinely executable
where it was not: it names the proof file, the two unittest commands, the fresh transport-gate capture
with the exact fields it must record, the fresh independent review, and it states plainly that **"A hash
refresh alone cannot satisfy this predicate, and the boundary check must not be relaxed to get past it."**
That is the right content and the right warning. I confirmed the fail-closed diagnosis without executing
anything: recomputing the four hashes by hand, `adapter_sha256` and `proxy_sha256` still match the proof
while `meter_sha256` (`e5e2c8243a97b833…` → `965329d22dd31461…`) and `collector_sha256`
(`b596c176d00272d9…` → `87bf4f2337d2da04…`) do not — exactly the two the README names. I also confirmed
`protocol/native-boundary-proof.json` exists and is the codex proof (`adapter: "codex"`), that
`adapters/transport_gate.py` and all three named suites exist, that `MAX_MODEL_REQUESTS = 40` and
`MAX_JOB_SECONDS = 2400`, and that `bounded_campaign.verify_native_boundary` really does require the
receipt file with a matching hash (`bounded_campaign.py:443-444`) and its evidence's `proxy_sha256` and
`runtime_sha256` to agree with the installed proxy and runtime (`:446-450`), plus `adapter`,
`runtime_version`, `max_model_requests`, `denied_before_dispatch` and `all_dispatch_routes_verified`
(`:451-453`) — every one of which step 2 already tells the reader to capture.

The three slips:

1. **The gate-mirror sentence describes a state that does not exist.** "The proof is
   `protocol/native-boundary-proof.json`, mirrored into every launch gate as `native_boundary_proofs.codex`
   with a `receipt_path` and `receipt_sha256`." No launch gate has a `codex` entry — all six have
   `native_boundary_proofs` with the single key `claude` — and the proof file contains **neither**
   `receipt_path` nor `receipt_sha256` (its only receipt-shaped key is `live_receipts_required`). Codex
   never launched, so there was nothing to mirror. The receipt check is real, so these are requirements
   on the **new** proof and the **new** gate, not descriptions of the present ones. Recast as step 5 of
   the procedure: *the new proof must additionally carry `receipt_path` and `receipt_sha256` pointing at
   the capture from step 2, and be mirrored into the arm's launch gate as `native_boundary_proofs.codex`,
   because `bounded_campaign.verify_native_boundary` reads it from there (`:443-444`).*
2. **"fifteen conditions" is sixteen.** The predicate at `adapters/codex_native.py:59-73` has sixteen
   conjuncts. The README's own enumeration is complete and correct — five hashes plus eleven named
   conditions — so only the numeral is wrong. Say **sixteen**.
3. **One conjunct is described more loosely than the code enforces.** "`runtime_version` equal to the
   installed binary's" is actually `proof.get('runtime_version') == '0.153.4'` — a hardcoded version pin.
   That is *stricter* than described, which is the safe direction, but it should say so.

None of these weakens the boundary and none affects any figure. They matter because this paragraph exists
to be followed literally.

## Verdict

**Fix first**, one item: the three S14 slips above, all inside a single paragraph. B1, B2, B3, S13, S15
and S16 are closed, and S16 and B3 were verified across every run rather than the single sample asked for.
With S14 corrected the bundle lands.

Two procedural notes that arose after the earlier review and are not defects in this delta:

- `main` has moved from `d43694b6e1` to `0f1228974a`, so this branch is now two commits behind and needs
  `git rebase origin/main` before `--ff-only`. The two new commits on `main` touch `.claude/CLAUDE.md`,
  `AGENTS.md` and `Plans/**` only — **no path overlap** with this branch, so the rebase is trivial.
- Those same commits added a landing rule to `AGENTS.md`: after the fast-forward and the shard check,
  run three read-only repository-wide checks in the shared checkout (`pm-plans-verify.py run-gates`,
  `pm-plans-verify.py audit-governance`, and `pm-plan-migration.py validate --run-dir` for the run named
  in `Plans/.plan_migration/current_run.json`), about ten minutes. Whoever lands this owes those, and the
  same rule will apply to the adjudication branch's fix commit when it arrives.

### Commands run for this delta

```
git -C /mnt/Cursor/PuppetMaster fetch origin ; git rev-parse research/continuation4-20260917 origin/…
git log -1 --format='%H %an <%ae> %ad %s%n%b' 0eb6efd270 ; git rev-parse 0eb6efd270^
git diff --stat 2bd36e1881..0eb6efd270 ; git diff --name-status 2bd36e1881..0eb6efd270
git diff --name-only 2bd36e1881..0eb6efd270 | grep -v '^reports/'
git diff 2bd36e1881..0eb6efd270 -- <each of the six changed files>
git rev-parse 2bd36e1881:<path> 0eb6efd270:<path>      # per-file identity, all six arm-reports
git diff 2bd36e1881..0eb6efd270 | grep '^+' | grep -EIic '<15 credential patterns>'
git grep -IiE 'sk-or-v1-|sk-[A-Za-z0-9_-]{16,}' 0eb6efd270 -- …/continuation4/
git log --oneline d43694b6e1..main ; comm -12 <(main paths) <(branch paths)
stat -c '%y %n' …/continuation4/protocol/freeze.json                      # B2 ground truth
python3 -c "… arm-reports/union.json notes_present …"                      # B1 corroboration
python3 -c "… earliest own-model job start per governed run …"             # B2 precedence
python3 ~/PM-Experiments/c4-review-20260917/runtime_recheck.py             # B3, all 11 runs
python3 -c "… corrections D1-D4 fixed_in_freeze → freeze-history …"        # S13 mapping
python3 -c "… D3 terminal timestamp gap …"                                 # S13, 26.74 s
python3 -c "… archived claude J0017 receipts / claude-result total_cost …" # S13, D1 evidence
python3 -c "… recompute adapter/proxy/meter/collector sha256 vs proof …"   # S14 fail-closed
sed -n '…' adapters/codex_native.py ; python3 -c "… split the predicate …" # S14, 16 conjuncts
sed -n '432,455p' protocol/bounded_campaign.py                             # S14 receipt checks
python3 -c "… native_boundary_proofs keys in all six launch gates …"       # S14 gate mirror
python3 ~/PM-Experiments/c4-review-20260917/fp_recompute.py                # S16, all six
```

## Runner delta, second pass — `2ba215bd0a`: **LAND**

**I am an Opus 5 agent.** The S14 fix commit `2ba215bd0a` (on `0eb6efd270`, pushed, in sync with its
remote) changes **one file and one region**: `README.md`, the Codex paragraph and its numbered
procedure, +17/−10. Every other file in the bundle — all six `arm-reports/*.json`, `corrections.json`,
`freeze-history.json`, `output-manifests.json`, `protocol-fingerprints.json`, `runtime-identity.json` —
is byte-identical to `0eb6efd270`. No delivery, timing, cost, job-status or stop-reason line is touched.
Secrets: zero hits across the 17 added lines. Nothing outside `reports/**`.

All three slips are fixed, and each is now correct against the code:

1. **Gate mirror — fixed, and stated more precisely than I did.** The paragraph now says no
   continuation-4 gate carries a `native_boundary_proofs.codex` entry, "every gate here records `claude`
   or `omp` only". I checked all six: `claude` in the two Claude gates, `omp` in the four oh-my-pi gates,
   `codex` in none — the runner's wording is exactly right and sharper than my note, which had only said
   they carry `claude`. Supplying `receipt_path`/`receipt_sha256` is now **step 5**, a requirement on the
   new proof and the new gate, citing `bounded_campaign.verify_native_boundary` lines 443-444. I
   confirmed the mechanism: `proofs = gate.get('native_boundary_proofs', {})` at `:404`, `proof =
   proofs.get(name, {})` at `:440`, and the receipt existence-and-hash check at `:443-444` — so the
   receipt genuinely is read from the gate entry. The added claim "those fields lived in continuation 3's
   gate" also checks out: `continuation3/launch-gate.json` has a `native_boundary_proofs.codex` entry
   carrying both fields. That is a useful pointer, not just a correction.
2. **Sixteen conjuncts — fixed, with the cite.** The text now says **sixteen** and names
   `adapters/codex_native.py` lines 59-73. I re-split the predicate: sixteen conjuncts, spanning exactly
   lines 59 (`valid = (`) to 73 (`admitted_phases == ['reconcile', 'compare'])`). The enumeration was
   already complete and remains so.
3. **The version pin — fixed.** Now written as `runtime_version == '0.153.4'` — "a hardcoded pin to that
   one Codex release, stricter than 'whatever is installed', so a newer binary fails the predicate until
   the pin itself is revisited". That matches conjunct 10 in the source and draws out the consequence.

**Verdict for `research/continuation4-20260917` @ `2ba215bd0a`: LAND.** Every item from the first review
is closed. B1, B2, B3, S13, S15 and S16 were verified in the previous pass — B3 by re-deriving all eleven
runs' identities from the job records, S16 by recomputing all six fingerprints — and S14 is now accurate
in every particular I can check against the code.

---

# Adjudication delta — `research/jj-c4-adjudication-20260916` @ `32e28b6374`: **LAND**

**I am an Opus 5 agent.** `32e28b6374` sits on `5bcca30362`, pushed and in sync with its remote: 23 files,
**all** under `reports/jujutsu-research-2026-09-11/continuation4/adjudication/`, nothing outside
`reports/**`, +661/−287, co-author line present, worktree clean. Zero credential hits across the 661
added lines.

**All eleven items are closed, and the four credit changes reproduce exactly.** I recomputed every set
from the updated findings files:

| | my review predicted | the branch now publishes | I recomputed |
|---|---|---|---|
| claude / deepseek41 / glm53 / muse13 / union / claude-hicap | 18 / 34 / 36 / 40 / 42 / 45 | same | **18 / 34 / 36 / 40 / 42 / 45** |
| percentages | — | 16.36 / 30.91 / 32.73 / 36.36 / 38.18 / 40.91 | **all six exact** |
| four-arm review union | 45, still = hicap's set | same | **45, set-equality `True`** |
| five-arm review union | 48 (43.64%) | same | **48 (43.64%)** |
| six-arm union / reached by no arm | 57 (51.82%) / 53 | same | **57 (51.82%) / 53**, and the list is 53 long |
| union arm adds / review arms hold | 9 / 15 | same | **9 / 15** |
| glm53's exclusive set | F069, F085, F086 | same | **F069, F085, F086** |
| claude-hicap corrections | 2/5 | 2/5 | **2** |
| the seven proper subsets | all hold | seven listed | **all seven hold** |

`cross-arm.json` carries the same figures and keeps a `before_review` block preserving the superseded
values (46 / 50 / 59 / 51 / 11 / 16), which is the right way to supersede a published number.

Item by item:

- **B4, B5, B6 — withdrawn, and recorded rather than deleted.** Each moved into `partial_matches` under a
  "WITHDRAWN CREDIT (review item Bn)" reason that states the evidence and the self-correction in the
  adjudicator's own voice: hicap F001 ("I credited this and I was wrong; the material does not meet the
  test I applied to the other five arms"), glm53 F068 (the single "Confirmed" bullet, the input lead that
  already said it), union F015 ("I read a refusal as an offer", plus the F103 inconsistency now
  reconciled). Partial counts move as they should: hicap 6→7, glm53 10→11, union 7→8.
- **S10 — deepseek41 F043 added**, credited at 2 of 3 clauses with the authentication clause disclosed as
  absent, and citing the bar it is held to (hicap F106 at 2 of 3, muse13 F107 at 3 of 4). That is the
  reasoning I gave, applied.
- **S1, S2 — 9 and 15, both matching their lists**, and "Seven of those **fifteen**". The S1 list now
  correctly carries F068, which moved to the union arm's column when glm53's credit was withdrawn — my
  own recomputation produced that same list.
- **S3 — the chain is gone**, replaced by seven relations one per line, prefaced by the reason: "the
  compact form read as a chain, and the chain is false (`glm53` ⊄ `muse13`, `union` ⊄ `claude-hicap`)".
- **S4 — 0 unresolvable `detail_file`** (was 5).
- **S5 — cluster classifications are now per-member**, e.g. "C4D-04: capability / C4M-03: capability /
  C4G-02: product choice", and the totals still recompute to 20 / 5 / 2.
- **S6 — a dedicated `shared_seed_disclosure` field** on the C4C-01/C4G-01 cluster, opening "NOT
  INDEPENDENT DISCOVERY", quoting all three frozen discovery leads and adding the count I asked for: five
  arms got the pointer, two converted it, three did not.
- **S7 — the borrowed quote is removed** from hicap's F092 basis, with a note saying whose sentence it was
  and where it lives verbatim.
- **S8 — the manifest row is labelled**, not dropped: the path is now clean, with
  `kind: read_time_snapshot_of_a_mutable_append_only_log` and a note naming the item and explaining why it
  cannot re-verify.
- **S9 — an inline amendment mark on F079**, naming the false clause, the lead's sha256, the source lines
  that refute it, "Do not read it as support", and why the credit stands independently.
- **S11 — F072 retained with a clause disclosure** (1 of 4 named), and with the reason it is retained:
  the `unsupported_or_rejected` crediting precedent from continuation 3. It picked up my reasoning and
  stated it accurately.
- **S12 — disclosed inline on the F092 credits**, evenly, noting no arm measured any cost and that the
  latitude changes no ranking.
- **N1** was also taken up, with the sharper form: the correct UNIX_EPOCH framing was in the shared frozen
  lead (sha256 re-verified), so every review arm started with the right answer and only the two Claude
  arms overturned it.
- A bonus the review did not ask for: "no arm extended the union" is now stated precisely rather than
  trivially — premium ∪ hybrid **is** the whole 110, so nothing could fall outside it by construction, and
  the substantive claim is that no arm delivered a creditable proposition the union does not contain.

Integrity re-checked on the new tree: `sha256sum -c SHA256SUMS` passes for all 28 files (28 hashed + the
file itself = the 29 present); **all 486 evidence references** (up from 481 with the new F043 credit)
re-hash with 0 missing and 0 mismatches.

**Verdict for `research/jj-c4-adjudication-20260916` @ `32e28b6374`: LAND.**

### Two landing notes, neither a defect in either delta

- **Both branches need a rebase.** `main` has moved to `3620f216da` while this review ran; the
  adjudication branch is now 9 commits behind and the runner branch 3. Neither has any path overlap with
  main's new commits, so both rebases are trivial, and the two branches remain disjoint from each other.
  Land, then `git rebase origin/main`, then `--ff-only`.
- **Landing now owes three extra checks.** `main` added a rule to `AGENTS.md`: after the fast-forward and
  the shard check, run `pm-plans-verify.py run-gates`, `pm-plans-verify.py audit-governance` and
  `pm-plan-migration.py validate --run-dir <the run named in Plans/.plan_migration/current_run.json>` in
  the shared checkout, about ten minutes. Neither branch touches `Plans/**`, so any failure should name
  files neither branch touches — in which case the existing rule applies: push `main` and report the
  failures to Jared.
- **One cross-branch staleness to expect, benign.** The adjudication's `evidence-manifest.json` cites the
  runner's `arm-outputs/corrections.json` and `arm-outputs/runtime-identity.json` by hash. The runner
  regenerated both in `0eb6efd270`, so those two rows no longer re-hash. They were correct when written
  and record what the adjudicator actually read; the tidy fix, if anyone wants it, is one sentence on
  those two rows naming the runner commit that superseded them. Everything else in that manifest
  re-verifies, including the `AGENTS.md` row, which matches the branch's own tree exactly (`778ee8e5b13c…`)
  and only looks stale if resolved against the shared checkout, where `main` has since changed it.

### Commands run for these two deltas

```
git fetch origin ; git rev-parse <both branches and their remotes> ; git cat-file -t 32e28b6374
git log -1 --format='…' 2ba215bd0a 32e28b6374 ; git rev-parse <each>^
git diff --stat / --name-only / full diff  0eb6efd270..2ba215bd0a  and  5bcca30362..32e28b6374
git rev-parse <each bundle path> at both ends            # per-file identity, both deltas
git diff … | grep '^+' | grep -EIic '<15 credential patterns>'                     # both deltas
python3 -c "… native_boundary_proofs keys in all six continuation-4 gates …"        # S14.1
python3 -c "… continuation3/launch-gate.json codex receipt_path/receipt_sha256 …"   # S14.1
grep -n 'proofs' protocol/bounded_campaign.py ; sed -n '59,73p' adapters/codex_native.py   # S14.1-2
cd <adjudication bundle> && sha256sum -c SHA256SUMS
python3 ~/PM-Experiments/c4-review-20260917/recompute.py          # every set, all 7 subsets, all unions
python3 ~/PM-Experiments/c4-review-20260917/verify_evidence.py    # 486 evidence refs
python3 ~/PM-Experiments/c4-review-20260917/verify_manifest3.py   # 258 manifest pointers
python3 -c "… detail_file resolution, candidate totals, cluster classifications …"  # S4, S5
python3 -c "… withdrawn credits now partials; F043 credit; F092/F079/F072 bases …"  # B4-B6, S7, S9-S12
sed -n '/^## Nesting/,/^Not comparable/p' README.md ; grep -n '…' README.md         # S1, S2, S3, S6
python3 -c "… cross-arm.json vs the README figures …"
git log --oneline b0977cd851..main ; comm -12 <(main paths) <(each branch's paths)
```

**Both branches land.**

---

# Candidate verdicts — Part 1 record at `~/PM-Experiments/c4-candidates-20260917/` (2026-09-17)

**I am an Opus 5 agent.** Read-only throughout: I changed nothing, ran no git command that changes
state, and created no branch or worktree. Everything below was re-derived against `main` at
`a6162b559b`, the same head the record adjudicated against.

**Verdict: I confirm all seventeen records, with one correction to the wording of C4H-05's stated
contradiction (the finding itself stands and is strengthened).** The record's 13-to-land list is sound,
its two merges are genuine, its four non-landing verdicts are right, and — on the one place it differs
from the bundle adjudicator, C4D-02 — I independently reach its reading, not the bundle's. That also
corrects my own earlier review, which upheld the bundle's classification of C4D-02 without testing it.

## Integrity first

`sha256sum -c SHA256SUMS` passes on all 45 entries. The record hashes the eleven canon files it read,
which lets item (6) be settled mechanically rather than by assertion: for **every one** of those files
the recorded hash, `git show main:<path>`, and the working-tree copy are identical —
`Jujutsu_Integration.md`, `Source_Control_System.md`, `Backup_Restore_System.md`, `Contracts_V0.md`,
`UI_Command_Catalog.md` and the six schema/fixture files. The shared checkout is clean, no
`c4-corrections` branch or worktree exists, and no `continuation4-landing/` bundle has been created, so
Part 2 has not started. **No canon file was edited.** The record's own evidence check (23 arm files,
23 verified, 0 mismatched) also reproduces.

## (1) Corrections to land — promise, contradiction, and no added capability

I re-read every cited passage on current `main` and tested each negative claim myself.

| # | Candidate | Verdict | What I verified |
|---|---|---|---|
| 1 | **C4C-01 + C4G-01** | **confirm** | JJI-008 ac5 at `Jujutsu_Integration.md:484` reads verbatim as quoted. "object verification" occurs **exactly four times** in `Plans/**` (BRS 1, JJI 1, forge acceptance 2) and `fsck`, `connectivity-only` and `object_verification` return **zero hits** repository-wide. `object_closure_result` is still a bare enum; Backup's `integrity_verification_level` enum is at `backup_restore_system_contracts.schema.json:242` with exactly the five values cited. The repair defines an existing phrase and `$ref`s an enum the corpus already ships — no capability. |
| 2 | **C4H-05** | **confirm, wording narrowed** (see below) | `node_state` closed at `[normal, rewritten, abandoned, conflicted]` (`source_control_contracts.schema.json:2871`); `graph_states` is a `prefixItems` array starting at `rewritten`; `invalid_target_identity` occurs **exactly twice**, both as bare enum members. |
| 3 | **C4D-01** | **confirm** | The closure record and restore receipt carry no tool/adapter/store-format version; the only `adapter_version` sits on `jj_effective_capability_snapshot`, which they do not reference. JJI-022 at `:1435` does point qualification back to three units that do not enumerate it. |
| 4 | **C4M-02** | **confirm** | `alternate_store_refs` / `shared_store_refs` / `git_common_directory_ref` are opaque refs and no resolution rule exists anywhere. The two-base point (alternates vs `commondir`) is a real implementation trap, and the repair routes failures into the existing `missing_dependency_refs`. |
| 5 | **C4C-02** | **confirm** | `isolated_verification` is required at `:2597` and typed `{"const": true}` at `:2750` — the receipt asserts isolation as a constant with nothing constraining what makes it true. The narrowing (land the blocking half; leave rebinding admitted-but-not-required) keeps it repair-only. |
| 6 | **C4U-02** | **confirm** | The certification refs are opaque and carry no scenario axis. The JJI-022 precedent makes this sharper, not weaker. |
| 7 | **C4H-02 + C4U-01** | **confirm** | The obligation really does live only in an `x-puppet-master-assertions` prose string — `jujutsu_integration_contracts.schema.json:2945`, verbatim — with the undefined qualifier "where required" and no field behind it. `Jujutsu_Integration.md:317` carries the reads-no-authority sentence as quoted. |
| 8 | **C4C-03** | **confirm (narrowed)** | Searches for machine-local / ephemeral / lock dispositions return only unrelated hits. The narrowing is the right call — see (4). |
| 9 | **C4C-05** | **confirm** | `gc_fence_outcome: held_during_capture` exists in `source_control_contracts.schema.json:3251` and in the shipped fixtures; the fence records a holder's own view and never what it covered. |
| 10 | **C4H-01** | **confirm (narrowed)** | `command_target` has **exactly twelve** properties with `additionalProperties: false`, and none of the twelve can name a path, hunk or content selection. `cmd.jujutsu.change.split` is in the frozen inventory and bound to `handlers::jujutsu::change_split` at `:381`/`:404`. |
| 11 | **C4H-03** | **confirm** | `allowed_action_ids` is required and typed with `uniqueItems: true` and **no `minItems`**, so an empty array validates for `state: blocked`. The floor uses two commands already in the frozen 31 — no capability. |
| 12 | **C4H-04** | **confirm** | The contradiction is inside a single shipped record: `command_request_jujutsu_bookmark_track` carries `command_class: transport_mutation` **and** `permission.scope: local_mutation` **and** a non-null `credential_lease_ref`; the untrack fixture likewise carries `transport_mutation`. The repair reclassifies two existing commands and nulls one field. |
| 13 | **C4M-01** | **confirm** | JJI-008 ac3 at `Jujutsu_Integration.md:482` reads verbatim as quoted; it states the ends of completeness and names no decision procedure. |

**On "adds no capability", which is the leg most easily fudged:** every one of the thirteen repairs
either defines an existing phrase, adds an identity or depth field to a record that already exists,
puts a floor under an existing array, reclassifies an existing command, or adds a typed refusal. The
two places where a capability could have crept in are exactly the two the record narrowed, and it
narrowed them correctly.

**The one change I make — C4H-05's stated contradiction is overbroad.** The record says a
repository-wide search for `divergen*` "returns no hit in any source-control, Jujutsu or GUI context".
That is not literally true: `Plans/Jujutsu_Integration.md` has five hits — `:763`, `:1013`, `:1035`,
`:1092`, `:1101`. Reading them, none rescues the candidate and the claim should simply be restated:
`:1013` is the **unapproved convergence capability** ("Convergence selects exact divergent immutable
commits of one stable change ID"), which is union finding F022 and which the record already and
rightly excludes; `:1035`, `:1092` and `:1101` are "future" test-surface lists. The `UI_Command_Catalog`
hits are storage-root fallback divergence, a different domain. Meanwhile `divergen*` returns **zero
hits** in `source_control_contracts.schema.json`, `final_gui_interaction_contracts.schema.json`,
`jujutsu_integration_contracts.schema.json` **and** `Source_Control_System.md`. So the accurate and
stronger form is: *canon contemplates divergence in owner prose — inside an unapproved capability and in
future-test lists — while every closed enum that would have to represent it omits it, and no typed
reason code names it.* That is a better contradiction than the one written, because it shows the gap is
not an oversight of the concept but of its representation. **Verdict unchanged: correction to land**;
fix the sentence before Part 2 so the landing does not rest on a claim a reviewer can falsify in one
grep.

## (2) The two merges

**C4C-01 + C4G-01 — same defect, confirm.** Both name JJI-008 ac5's "object verification" as the
promise and the absence of any depth definition as the contradiction; Arm C reaches it from receipt
admissibility (`complete` is admissible whatever produced it) and glm53 from the undefined term plus the
discriminating byte-flipped-blob fixture. One repair — define the depth and bind the receipt — closes
both, and neither survives independently of that repair. I confirmed in my earlier review that these
are the same defect; the record's merge reason states it more precisely than I did.

**C4H-02 + C4U-01 — same defect, confirm.** The record's framing is the right one and better than the
bundle's: a JJ read is *declared* non-mutating and never *proven* non-mutating at the adapter boundary.
claude-hicap repairs the capture-and-drill side (pin every read to an exact operation; record the
op-head set before and after), the union arm repairs the command side (name the adapter's complete
native effect scope; require a proven non-mutating path; return a typed stale/blocked result). They are
halves of one rule, and both explicitly keep the read branch's null authority — the side continuation 3
took when it rejected a mutating `status.refresh` branch. Merging them credits both arms without
widening the repair.

## (3) Covered, rejected, reclassified

**C4D-03 — covered. Confirm.** `Source_Control_System.md:313` reads: "Existing Git
conflict/merge/review/graph/stage/commit/stash/branch/compare commands remain Git adapter commands
unless the command owner explicitly normalizes them." Verbatim as cited, text unchanged, drifted from
line 308. The conflict-assistant commands are Git-scoped by design, so the absence of a JJ-scoped
precondition is not a gap.

**C4D-02 — rejected as inside continuation 3's marker-only rejection. Confirm, against the bundle
adjudicator.** My own reading of the rejection, formed before I read the record's argument:

> "Marker-only conflict command is a JJ owner defect" — rejected because "Frozen Source Control line 308
> scopes legacy commands to Git absent explicit normalization; same finding withdrawn from P21/P26."

That reason is a **scoping** reason, not a merits reason. It does not say "markers are the right gate";
it says the command is not a JJ command, so JJ semantics do not bind it. C4D-02 asserts that
`mark_conflict_resolved`'s `no_conflict_markers` gate "can contradict JJI-005" *for a jujutsu backend* —
which presupposes the gate is applied to a jujutsu backend, and that presupposition is precisely what
the rejection denies. The bundle adjudicator read it as "the same boundary from the other side" and
therefore outside the rejection; but both sides of the marker question share the premise the rejection
refuses, so "the other side" does not escape it. **The Part 1 agent is right and the bundle is wrong
here**, and since my earlier review upheld the bundle's rejection checks without separately testing
C4D-02, this corrects me too.

The record's residual observation is worth keeping and is correctly *not* promoted to a correction: at
`UI_Command_Catalog.md:548` `cmd.source_control.open_conflict` carries `git_available &&
conflict_present`, while at `:551` `cmd.source_control.mark_conflict_resolved` carries only
`conflict_file_selected && no_conflict_markers` with no backend token — I verified both rows verbatim.
Owner prose at SCS:313 settles the scope; the table simply does not restate it. Passing that to Jared as
a cosmetic asymmetry rather than inflating it is the right judgement.

**C4M-04 — reclassified as product choice. Confirm.** The gap is real (no synced/unsynced/combined
bookmark vocabulary anywhere), but neither leg of the correction test is met, and the record's two
disqualifying checks both hold: there is **no forget-remote command** in the frozen 31 (I listed the
inventory — `bookmark.create/move/rename/delete/track/untrack` and no forget), and the `command_request`
conditional for `bookmark.track`/`.untrack` does constrain `target.remote_identity`, so the
"all-remotes untrack" harm is not admissible in the first place. What remains is confirmation wording
and disclosure content — new user-visible surface, which the test excludes.

**C4G-03 — reclassified as product choice. Confirm.** `merge_editor_available` appears exactly once in
owner text, as a command condition at `UI_Command_Catalog.md:549` (plus its generated shard), and is
defined by no owner. The gap is real, but defining it requires first deciding whether Puppet Master
ships a structured merge editor at all — a product decision, not the repair of a falsified promise. It
also belongs with the deferred `C4D-04`/`C4M-03`/`C4G-02` diff/merge-editor surface cluster that
continuation 3 declined, which the record notices and proposes to present as one card. Agreed.

## (4) The two narrowings

Both are the strongest judgement calls in the record and both are right.

**C4H-01 — narrowed correctly, and this is the one that mattered most.** The candidate exposes a real
defect: `command_target` admits exactly twelve fields, none of which can name a path, hunk or content
selection, so the only schema-expressible native execution of `cmd.jujutsu.change.split` is an
interactive diff editor the product cannot host — with no typed result, no disabled reason and no
blocked state. The *obvious* repair would be to add selection fields to `command_target`, and that would
add capability and re-open the whole hunk-selection surface. The record instead lands only "no canonical
Jujutsu command may reach an adapter invocation that can start an interactive diff or merge editor" plus
a disabled reason so the command blocks truthfully. That is fail-closed, adds nothing, and keeps the
candidate inside the correction test.

**C4C-03 — narrowed correctly.** The candidate's natural form is an enumerated table of machine-local
and ephemeral store entries. The arm's own stated evidence limit was documentation and schema reading —
it never ran a source audit of jj internals — so a table would be landing an unverified enumeration as
canon. The record lands three obligations instead (unrecognized entry ⇒ `partial` with a named ref;
machine-local entries captured as bytes but never restored as active state; classification source-traced
against the pinned JJ version and never a filename pattern) and carries the list as an open question.
That is the right split between what the evidence supports and what it does not.

## (5) The drifted line numbers

Both drifts are real, correctly re-cited, and the text is unchanged in each case — I checked both
against `main` at `a6162b559b`:

- **JJI-008 ac5: 468 → 484.** F106 (`fdddacea20`) added ac8 to JJI-008, pushing ac5 down sixteen lines.
  The sentence is word-for-word what continuation 4 cited.
- **Source Control conflict scoping: 308 → 313.** The line continuation 3 cited by number when it
  rejected the marker-only expansion now sits at 313, with identical text. This one matters twice over,
  since it is both C4D-03's covering passage and the basis of the C4D-02 rejection.

One near-miss on my side worth recording so nobody repeats it: `Jujutsu_Integration.md:317` looks wrong
if you truncate the line — it begins "The command request enum is exactly the 31 IDs in §3.1" — but the
quoted sentence "Reads and navigation carry no writer, credential, FileSafe, confirmation, or interop
authority" is on that same long line. The cite is correct.

## (6) No canon file edited

Settled mechanically above: eleven canon files, three-way hash identity (record manifest = `git show
main:<path>` = working tree), clean shared checkout, no branch, no worktree, no landing bundle. The
record also declares its scope as Part 1 only and stops before any canon edit, as the brief requires.

## Verdict

**Confirm the Part 1 record as written, with one wording fix.** 13 corrections to land from 15
candidates (two merged pairs), 1 covered, 1 rejected, 2 reclassified. Before Part 2 begins:

1. **Restate C4H-05's contradiction** as "no schema value or typed reason code anywhere names
   divergence; the only owner prose that does is the unapproved convergence capability at
   `Jujutsu_Integration.md:1013` and the future-test lists at `:1035`, `:1092`, `:1101`" — the finding
   stands and is stronger this way.
2. The seven questions the record raises for Jared are the right seven, and two of them gate the
   landing's shape rather than its content: whether the semantic gate in
   `scripts/pm-new-contracts-verify.py` is authorised for the relational rules in records 5, 7, 11 and
   13 (otherwise they land as owner obligations marked unenforced, per the brief), and whether C4C-03's
   enumerated list is deferred as an open question. Both should be answered before Part 2, not during it.
3. The C4D-02 disagreement is now two-to-one against the bundle adjudicator, with reasons on the record.
   I would treat it as settled and leave the bundle's `consolidated-candidates.json` entry as published
   history, noting the supersession in the Part 2 bundle rather than editing the landed artifact.
