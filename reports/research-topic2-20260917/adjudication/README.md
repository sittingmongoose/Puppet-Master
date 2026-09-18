# Topic 2 adjudication — the blind union for `Plans/Azure_DevOps_Integration.md`

**I am an Opus 5 agent** (`claude-opus-5[1m]`) acting as adjudicator. I ran no arm. Every figure was
rebuilt from durable state, and every code or API fact carried by a union proposition was verified
against the arm's own cached source or against the Plans file on `main` before the proposition was
admitted.

> **Provenance.** Classification was made against `Plans/Azure_DevOps_Integration.md` sha256
> `3ae59c0217219175051418df0482663b247888cc65db087f942158ca5887cc2d` at `4f5eda0d18`; the Azure
> corrections landed at `e9fafbdb21` have since changed that document, sha256
> `cffbf0b1080a48573693d832e596a5b8307934dbe726abc765a0164e7a03d066`, and acted on several of these
> findings; this bundle is a record of the union at scoring time, not a current assessment.

Three terminal, frozen arms: **Arm S** (`claude-opus-5` at effort max, full pipeline from discovery),
**h2-research** (Muse Spark, research stages only) and **h2-review** (`claude-opus-5` at effort max,
reconcile and compare from h2-research's outputs). H2 is scored as **one arm** — research plus review.

## THE CENTRAL FACT, STATED FIRST

**The union rests on five documents.**

I checked every note in all three runs. All eleven reconcile notes are headed *"external technical
reconciliation"* and all thirteen research notes are external technical studies, and **not one of the
twenty-four cites a single `Plans/` passage** — the literal count of the string `Plans/` is **zero** in
every one of them. A union proposition is a statement about what Puppet Master must do, cited to a
passage; only the **compare** stage reaches the Plans at all.

| | documents that compare against the Plans | leads compared |
|---|---:|---:|
| Arm S | **3** (`J0015`, `J0016`, `J0017`) | 3 of 115 discovered |
| h2-review | **2** (`J0019`, `J0020`) | 2 of 44 discovered |
| h2-research | 0 (by design) | 0 |

Of **44 model jobs** across the three runs, **five** produced a Plans comparison.

### What this union can and cannot support

**It can support**, because each proposition is anchored to a named passage that I re-read on `main`
and to a provider fact I verified in the arm's own cache:

- that a specific defect exists in the Azure owner or its contracts, and what the repair is;
- that a specific promise in the owner text is currently unenforceable, unreachable or internally
  inconsistent;
- a like-for-like comparison of **what the two arms said about the same five leads' subject matter**,
  because both compare halves ran the same model at the same effort under identical per-job limits.

**It cannot support**, and no reading of it should claim otherwise:

- **any recall estimate for the owner document.** Five leads out of 115 discovered is not a sample of
  ADO-001..005; it is three or four themes. Whole PlanUnits — ADO-004's builds and pipelines, ADO-005's
  Settings placement and migration, most of ADO-001's container hierarchy — were **never compared by
  either arm**. A union of 73 is a lower bound on the defect count with an unknown and probably large
  remainder.
- **any yield-per-lead or productivity comparison.** With denominators of 3 and 2 the ratio is noise.
- **any claim that a proposition is absent from the Plans.** Both arms state their absence claims as
  literal searches over the files listed in `navigation.md`; selection is not completeness, and a
  literal miss is not semantic absence. I re-ran the load-bearing ones myself and they held, but that
  is eleven checks, not a proof.
- **any arm-to-arm process conclusion.** The two arms did not fail the same way, did not compare the
  same leads, and both lost six jobs to the same retired tool. This is not a controlled comparison.

Everything below is true of **the five compared leads**. It is not true of the document.

## Union: 73 propositions

| Class | Count | What it means |
|---|---:|---|
| **correction** | **32** | The owner text or its contracts state something wrong, unenforceable or internally inconsistent against verified provider behaviour or against the corpus itself |
| optional capability | 8 | A new capability, field or surface; requires owner approval |
| product choice | 4 | The owner must decide between admissible options; no defect either way |
| unsupported or already covered | 29 | Already satisfied by the corpus, or not supported by the evidence delivered |

## Per-arm coverage

| | Arm S | H2 (research + review) |
|---|---:|---:|
| **Union propositions stated** | **50 of 73 (68.49%)** | **42 of 73 (57.53%)** |
| corrections / 32 | **26** | 14 |
| optional capability / 8 | 6 | 5 |
| product choice / 4 | 3 | 2 |
| unsupported or covered / 29 | 15 | 21 |
| Unique to this arm | **31** | **23** |
| Leads compared | 3 | 2 |
| Captured cost | $111.63 of $250 | $43.87 of $200 across both halves |
| Admissions | 20 of 20 | 12 + 12 |

**Shared: 19.** Arm S and H2 agree on 19 propositions, 8 of them corrections. Neither arm is a subset
of the other: **31 propositions are Arm S's alone and 23 are H2's alone.** The two arms converged on
the policy and check surface from opposite directions and diverged everywhere else — Arm S went deep on
review revisions, thread anchors, votes and merge strategy; H2 went wide on TFVC, Server instance trust,
auth privilege and the two-enum `notApplicable` collapse.

### The cheap research half credited zero, and could not have

h2-research delivered 32 leads for **$0.155** in 12 minutes, and earned **no** union proposition. That
is structural, not a failure: six of its twelve jobs wrote no `notes.md` at all, ten were cut by the
40-response ceiling, and none of the six notes that exist cites a Plans passage. What it bought was the
lead set and the evidence the expensive half read — the same shape as continuation 5's Arm B.

## The 32 corrections, with the promise each serves and the contradiction each exposes

Promises are from the frozen product brief (sha256 `a69e129d…`): **P0** the policies/checks sentence,
**P1** never show stale review evidence as current, **P2** different kinds of "no" stay different,
**P3** the self-run server is treated honestly, **P4** a request the service accepted is not a request
the service finished.

| ID | Correction | Promise | The contradiction | Arms |
|---|---|---|---|---|
| TA-001 | "A new head" is the wrong staling trigger | P1 | Revision identity is a **triple**; the staling trigger is **one leg** of it — internally inconsistent inside the frozen Plans | S |
| TA-002 | An unmapped cause must never render as `push` | P1 | Seven published causes with **empty descriptions**, and the reference client collapses anything unrecognised to the most reassuring one | S |
| TA-003 | A retarget invalidates the applicable policy **set** | P2 | Policies are scoped to the target ref; ADO-003 stales the evidence and never the set | S |
| TA-004 | `evidence_state` names only one staleness reason | P2 | ADO-003 forbids flattening, and the closed enum forces four of five Azure causes to render as "head changed" | S |
| TA-005 | `review_revision` cannot say contents are incomplete | P1 | FGI-003 owns "partial data is never complete"; `review_revision` is `additionalProperties:false` with nowhere to say it | S |
| TA-007 | A thread anchor is a **pair**, the schema stores one ref | P1 | `command_target` already requires left AND right for version compare; threads get one | S |
| TA-008 | No `review_versions` on either Azure profile | P1 | The capability token, both commands, the command catalog's Azure consumer entry and the wiring rows all exist; the profile does not declare it | S |
| TA-009 | Capability routing is binding-scoped; Azure decides **per PR** | P2 | `version` is required with `minimum: 1` on a closed object, so a legacy PR can be neither represented nor dropped | S |
| TA-010 | No `repository_policy` on either Azure profile | P0 | The token is distinct from `checks`, the policy commands require it, and **Forgejo declares it** | **S+H2** |
| TA-011 | `unsupported_reason_codes` is an unchecked free array | P2 | Azure's declared reason is not drawn from the closed enums every other reason must come from | S |
| TA-012 | `policy_scope_missing` is unreachable on the read path | P2 | ADO-002 promises the distinction and Azure has **no read-side policy permission** | S |
| TA-013 | Nothing forbids client-side policy scope resolution | P0 | The Plans constrain the output and say nothing about the derivation; the failure is a confident **wrong answer**, which no reason code catches | S |
| TA-016 | `policy_resource_id` cannot name a scoped policy | P0 | Azure's own write path addresses configurations **by id**; the contract carries one opaque string keyed by branch name | S |
| TA-017 | A policy set has no completeness state and no cursor | P1 | DL-054 already does exactly this for parent lists; the forge policy path has neither | S |
| TA-018 | No typed check or policy record exists | P0 | ADO-003 requires PR evidence to bind policy **identities**; the carrier is an array of opaque refs and **no fixture anywhere uses `record_kind: Check`** | **S+H2** |
| TA-019 | Blocking-ness has no carrier | P0 | "Whether each one passes" is undecidable without it, and Azure makes it the axis that decides whether auto-complete waits | **S+H2** |
| TA-020 | No check-status vocabulary, no forbidden-mapping rule | P2 | The flattening ADO-003 forbids happens **in the schema**, before any adapter is written | **S+H2** |
| TA-021 | `notApplicable` means two different things | P2 | One wire word, two enums: bypass-**satisfies** versus does-not-**apply**; the nearest member `skipped` is wrong for both | H2 |
| TA-022 | `review_checks` requires a key Azure cannot accept | P1 | The provider never receives, validates or echoes `review_head_oid`, so the corpus's strongest enforcement is unenforceable for half the surface | **S+H2** |
| TA-023 | A check must declare **how** it binds to a revision | P1 | Two families, one revision-bound and one review-bound, merged into one visually uniform list | **S+H2** |
| TA-024 | Azure checks evaluate the **merge**, not the head | P1 | `command_target` already carries `source_revision` and `target_revision` and the checks conditional does not require them | S |
| TA-025 | `canonical_url` is required; Azure supplies none | P2 | Either the record cannot validate or PM synthesises a link and presents it as the provider's | H2 |
| TA-026 | No vote, approval or reviewer object exists | P1 | ADO-003 has two acceptance criteria about votes and no shape to hold them | S |
| TA-029 | `api_compatibility.endpoints` holds no version | P3 | The prose asks for the pin; the shape records only the **name**, while one host serves 7.1 and 7.1-preview.1 together | S |
| TA-030 | Applicability is GA, status is preview | P3 | The Plans treat "checks" as one capability, so a Server host that cannot serve the preview endpoint must either infer status or show an empty list | **S+H2** |
| TA-032 | Server has no per-instance host/version/trust record | P3 | ADO-002 requires a signed host/version entry; the only typed per-instance record is restricted to **forgejo and gitea** | H2 |
| TA-033 | The project **GUID** is a second required identifier | P2 | The repository gets two identifiers, the project one; `provider_project_id` does not exist in `Plans/` at all, and a missing GUID yields a 200 and an empty list | S |
| TA-034 | TFVC must be detected and explained | P2 | FGI-014 and the acceptance packet require it with a named fixture; the sole canonical owner never mentions it | H2 |
| TA-035 | The merge command carries no strategy | P4 | Omission looks like safety and is not — it **selects** no-fast-forward, so the Plans choose implicitly and cannot choose at all | S |
| TA-036 | Requeueing a policy evaluation cancels a running build | P4 | ADO-004 requires ObservableWork for retry, and nothing can say a retry destroys a third object | H2 |
| TA-038 | ADO-003/ADO-005 name fixtures that do not exist | all | Every repair in both arms is an acceptance check, and **none of ADO-003's criteria is currently checkable for Azure** | **S+H2** |
| TA-042 | The profile schemas cannot express FGI-015's criterion | P2 | FGI-015 states an acceptance criterion its own two closed schemas structurally cannot satisfy | H2 |

## Top candidates

Ranked by how cheap the repair is against how badly the defect breaks a stated promise.

1. **TA-038 — the Azure fixture surface does not exist.** `azure_devops_integration_fixtures.json` is
   73 lines: two adapter profiles and one negative. No Azure `review_revision`, `review_thread`,
   policy, check, evaluation or status fixture exists anywhere, every review fixture in the corpus is
   GitLab, and no fixture anywhere uses `record_kind: Check`. **Nothing else on this list is testable
   until this is fixed**, and the cheapest honest move — amending `:188` and `validation_surfaces` to
   say the fixtures are not yet written — costs two lines.
2. **TA-008 and TA-010 — two missing capability tokens on the Azure profiles.** `review_versions` and
   `repository_policy` each appear **zero** times in the Azure fixture file while the capability tokens,
   the commands that require them, the command catalog's Azure consumer entries and the wiring rows all
   exist. Both are one-line fixture edits, and without them FGI-003's "resolve one capability entry
   before dispatch" cannot succeed for the commands the corpus already wires to Azure.
3. **TA-022 with TA-023 — the checks contract's key does not bind.** `cmd.forge.review.checks` requires
   `review_head_oid`; the Azure evaluations endpoint cannot be asked for it, does not return it, and
   PolicyEvaluationRecord has no commit field of any kind. This is the corpus's **strongest** anti-stale
   enforcement being unenforceable for half of the Policies/Checks surface, and both arms found it
   independently and proposed compatible repairs (a declared binding kind plus a head fence).
4. **TA-019 with TA-020 and TA-021 — the gate list cannot say what it means.** Required-versus-advisory
   has no carrier anywhere; `broken`, `error` and `notSet` have no target in the only adjacent enum; and
   `notApplicable` means *bypass-satisfies* in one Azure enum and *does-not-apply* in the other. The
   brief's sentence "whether each one currently passes" is not answerable from the shapes that exist.
5. **TA-034 — TFVC.** The one defect on this list that a first-time user meets on first contact, in a
   document whose Authority line claims sole ownership of Azure repository identity and Azure-specific
   degradation. The repair is a sentence in ADO-001, a line in §7, one reason code and one fixture.
6. **TA-001 with TA-005 — the review-revision model is narrower than the provider's.** The staling
   trigger names one leg of a three-leg identity, and truncation has nowhere to be recorded at all.
   Both are reachable without any new concept; the fuller repair (TA-006) is a real schema edit and the
   arm's own recommendation is to take only the two cheap fields now.
7. **TA-035 — the merge strategy that is chosen by omission.** The most surprising single result: the
   merge command carries no strategy field, which reads as conservatism, and on Azure omission
   *selects* no-fast-forward. A product that never displays a branch policy still lands in the reported
   failure the moment it offers a merge button.

## Verification

**All three manifests verify three ways** — internal digest recomputed from the sorted rows, matched
against the runner's quoted value, and an independent re-hash of the live tree — with **zero differing
files**: Arm S `4bfc2dcf…` (14,089 files), h2-research `c1e7a066…` (8,214), h2-review `88da881a…`
(7,458). All three `campaign-terminal.json` records read `Stop: admitted_attempt_cap`, confirmed
designed before scoring.

**Carry-across checked.** h2-review was staged from h2-research's frozen run: of 2,724 files, **2,563
are byte-identical** and the 161 that are absent are all raw adapter transcripts and session files
(`raw-omp/`, `sessions/`). No workspace assertion document differs.

**Eleven provider/API facts verified in the arms' own caches** (V-A1…V-A11) and **eleven Plans-side
facts verified against `main`** (V-P1…V-P11). Every one held. The load-bearing ones:

- `IterationReason` publishes exactly seven values with an **empty Description for every one**
  (arm-s `J0015` `S00039:468-479`).
- `PolicyEvaluationRecord` = `{_links, artifactId, completedDate, configuration, context, evaluationId,
  startedDate, status}` — **no commit, iteration or revision field** (h2 `J0020` `S00031:214-246`).
- `notApplicable` is *"✓ Bypasses policy requirement"* in the status table and *"The policy does not
  apply to this pull request"* in the evaluation enum — **two meanings, one word** (`S00042:47-54`
  against `S00031:260-261`).
- *"If MergeStrategy is not set to any value, a no-FF merge will be created if SquashMerge == false …
  It is recommended that you explicitly set MergeStrategy in all cases."* (arm-s `J0016`
  `S00097:225`).
- *"Requeueing a build policy will queue a new build to run (cancelling any existing build …"*
  (h2 `J0020` `S00046:30-34`).
- On `main`: `review_versions` and `repository_policy` each occur **0 times** in
  `azure_devops_integration_fixtures.json`; `provider_project_id` occurs in **0 files** anywhere under
  `Plans/`; `TFVC` occurs **0 times** in `Azure_DevOps_Integration.md`;
  `provider_instance_profile.provider` is `enum: [forgejo, gitea]`; `disabled_reason_code` has 54
  members and `policy_scope_missing` is not one of them.

**Both runner reading notes checked independently and both hold.** h2-review's journal carries 13 job
keys because the thirteenth is `HOLD-admission-sentinel` — `adapter: null`, `phase: admission_hold`,
`request_count: 0`, `observed_upper_usd: 0.0`, `terminal: false`, `coverage: "not_a_model_job"`.
**Twelve model jobs ran.** And the wall-clock figures are indeed meaningless: Arm S's arm wall is
39,550 s against 16,007 s of summed job time at concurrency 0.405, its implementation stage alone
showing a 35,011 s wall for 3,144 s of work.

## Truncated coverage, reported separately

**Arm S — nothing hit a limit.** Zero jobs request-limited, time-limited, money-limited or
rate-limited: 25–107 responses against a 160 ceiling, longest job 1,463 s of 3,600, dearest $12.05 of
$20, $111.63 of $250. **Six jobs were crashed by a retired drain tool** (five interrupted, one null),
all in the implementation and history stages; two of the six still wrote notes that are cited
downstream, and `J0005-implementation` is named as still **pending** by the `J0016` compare job's own
uncertainty list. That cost study **depth**; it did not cost compare coverage, because all three
compare jobs ran after the resume and all completed.

**The real bound on Arm S was the admission cap against a growing lead set.** Discovery found 115 leads
where the case began with 23, and 20 admissions cannot cover them: **115 leads remained pending
reconcile and 118 pending compare.**

**H2 — the research half was request-limited by design** (10 of 12 jobs cut at the 40-response ceiling,
6 of 12 wrote nothing), and the **review half lost 9 of 12 admissions**: six to the same retired drain
tool — three of them dying at 6–9 requests with nothing written — and three to the account rate limit.
Of **five compare admissions across the arm, three produced nothing**. The review half's arm clock ran
5.17 h against a 4.0 h cap and both restarts were spent, so it cannot be resumed; it nevertheless
reached its designed terminal with all 12 admissions used. No per-job ceiling was ever reached.

## Limits of this adjudication

- The union is built from five compare documents. See the opening section; that constraint governs
  every number here.
- Classification is mine and is made against the **current** owner text on `main` (`4f5eda0d18`,
  `Azure_DevOps_Integration.md` sha256 `3ae59c02…`), not against the frozen case. I re-read every
  passage I credit.
- Both arms' absence claims are literal searches over a selected corpus. I re-verified eleven of them
  directly; the rest are recorded as the arms stated them.
- Nothing in either arm was run against a live Azure DevOps service, cloud or server. Every provider
  fact is documentation- or published-contract-attested.
- Arm S and H2 both lost six jobs to the same retired tool, on different stages. This is not a
  controlled arm comparison and no process conclusion should be drawn from the two arms' difference.
- I am an Opus 5 agent adjudicating output from `claude-opus-5`; the arms and I share a model family.
  Every code and API fact was verified against pinned bytes to make the judgement re-checkable.

## Files

| File | Contents |
|---|---|
| `topic2-union.json` | The 73-proposition blind union: statement, class, owner passages cited, provider evidence, which arm(s) stated it, per-arm citation loci, my source verifications, evidence hashes; corrections carry the promise served and the contradiction exposed |
| `topic2-arm-scoring.json` | Three-way manifest verification, designed stops, both runner reading notes checked, per-arm job tables, limits, cost, timing, delivery, truncated coverage and the arm comparison |
| `PROGRESS.md` | Stage-by-stage progress note |
| `../topic2-manifest.json` | Hash manifest for this directory |

Runner bundle: branch `research/topic2-20260917`, commit `4742fc84fb`. Referenced by path; its tables
are not duplicated here.
