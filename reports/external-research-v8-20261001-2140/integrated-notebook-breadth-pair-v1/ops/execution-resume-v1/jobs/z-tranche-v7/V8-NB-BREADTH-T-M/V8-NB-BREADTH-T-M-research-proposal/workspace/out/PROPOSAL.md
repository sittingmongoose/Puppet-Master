# V8-NB-BREADTH-T-M — Research proposal (research-stage artifact)

Case: offline prototype comparing two explicitly captured saved states of a repository workspace
(one version-4 `.ipynb` notebook + two ordinary text files, each snapshot recording the notebook's
declared minor version and a workspace manifest), with copy-recovery of a selected state into a
**new** directory. This document is a research-backed revision of `inputs/THIN_PLAN.md`. No code was
executed in this stage: every check in §8 is **proposed and unexecuted** unless a later stage provides
an admitted execution receipt.

**Claim labels used throughout**

- **[SRC]** — fact read from a captured public primary source (locator given in §1). Conditions and
  exceptions are preserved inline; do not overgeneralize them.
- **[INFER]** — engineering inference from source facts; may be wrong where a source condition is missed.
- **[CHOICE]** — product decision for this prototype; justified but not source-mandated.
- **[PROPOSED-UNEXECUTED]** — a planned test/check that has not been run.
- **[CORRECTION]** — a supported correction to the thin plan's assumptions.

Out of scope (per `inputs/BRIEF.md`): continuous watching, collaborative editing, remote sync,
unsaved editor buffers, whole Git history repair, executable notebook evaluation.

---

## 1. Discovered primary sources (independently selected; all fetched 2026-10-03)

| # | Locator (repo @ version, path) | What it establishes |
|---|---|---|
| S1 | `jupyter/enhancement-proposals` @ `master`, `62-cell-id/cell-id.md` (JEP 62, status: Implemented, 2020-09-25) | Cell `id` semantics: schema, requiredness in 4.5+, uniqueness goal, lifecycle |
| S2 | `jupyter/nbformat` @ tag `v5.10.4`, `nbformat/v4/nbformat.v4.5.schema.json` | Normative 4.5 schema: `id` required on every cell, pattern `^[a-zA-Z0-9-_]+$`, 1–64 chars; `nbformat` fixed to 4, [inline excerpt omitted; original artifact pin retained]; code cells require `outputs`+`execution_count`; `source` may be string **or** list of strings; `unrecognized_cell`/`unrecognized_output` definitions |
| S3 | `jupyter/nbformat` @ tag `v5.10.4`, `nbformat/validator.py` | Version negotiation (`get_validator`), future-minor relaxation, duplicate/missing-id behavior with and without repair, `validate` vs `normalize` contract |
| S4 | `jupyter/nbformat` @ `main`, `CHANGELOG.md` (captured 2026-10-03) | 5.1.0 [verbatim excerpt omitted; original artifact/source locator retained]; 5.1.1 [verbatim excerpt omitted; original artifact/source locator retained]; 5.2.0 [verbatim excerpt omitted; original artifact/source locator retained]; 5.5.0 deprecates auto-fixing args of `validate()`; 5.7.2 [verbatim excerpt omitted; original artifact/source locator retained]; latest line 5.11.1 (Aug 2026) |
| S5 | `jupyter/nbdime` @ `main`, `CHANGELOG.md` (captured 2026-10-03) | 4.0.0 includes [verbatim excerpt omitted; original artifact/source locator retained]; latest 4.0.4 (Feb 2026) |
| S6 | `jupyter/nbdime` issue **#553** [verbatim excerpt omitted; original artifact/source locator retained] (opened 2020-12-03, closed 2023-11-01, state_reason: completed) | Open design questions: id vs content precedence, id-change display, id-conflict resolution |
| S7a | `jupyter/nbdime` PR **#566** [verbatim excerpt omitted; original artifact/source locator retained] (merged 2021-04-12) | Interim step 1: treat `id` as opaque metadata; PR body reports failing-test counts 34→32 and names fixed tests `test_pretty_print_code_cell`, `test_git_diff_driver_add_helper_filter` |
| S7b | `jupyter/nbdime` PR **#639** [verbatim excerpt omitted; original artifact/source locator retained] (merged 2023-11-01; merge commit `c1ea9b9deb3b8ca2ea4471ffb616125b0024182b`; 35 commits, +1113/−258, 56 files; body: [verbatim excerpt omitted; original artifact/source locator retained]) | Tiered id-aware matching: strict / moderate / approximate; id treated as atomic; improved `union` merge strategy; body records test changes and the rationale for each tier |
| S8 | `jupyter/nbdime` issue **#597** [verbatim excerpt omitted; original artifact/source locator retained] (open; nbdime 3.1.0 reproduction) | Real-world failure of automated merge resolution; also documents nbdime CLI diff flags [inline excerpt omitted; original artifact pin retained] |
| S9 | `jupyter/nbdime` issue **#787** [verbatim excerpt omitted; original artifact/source locator retained] (open; nbdime 4.0.2) | Live upstream risk: web differ stalls on certain cell content while terminal `nbdiff` is correct |
| S10 | `git/git` @ tag `v2.9.0`, `Documentation/RelNotes/2.9.0.txt` | Rename detection default-on for the [inline excerpt omitted; original artifact pin retained]/[inline excerpt omitted; original artifact pin retained] porcelain family ("you can still use `diff.renames` … to disable[verbatim excerpt omitted; original artifact/source locator retained][inline excerpt omitted; original artifact pin retained] used to work better when two originally identical files A and B got renamed to X/A and X/B … broken in the 2.0 timeframe" |
| S11 | `git/git` @ tag `v2.42.0`, `Documentation/config/diff.txt` | `diff.renames` semantics (false/true/copies, [verbatim excerpt omitted; original artifact/source locator retained]), with the condition that it [verbatim excerpt omitted; original artifact/source locator retained]; `diff.renameLimit` default 1000 |
| S12 | `jupyter/nbconvert` @ tag `v7.16.6`, `nbconvert/preprocessors/clearoutput.py` | `ClearOutputPreprocessor`: sets `outputs=[]`, `execution_count=None`, and removes output-adjacent metadata fields `{"collapsed","scrolled"}` — evidence that source / outputs / metadata are separable axes with field-level classification precedent |

---

## 2. Q1 — Which two components offer useful precedents, and what version-specific behavior supports a minimal approach?

**Component A: `jupyter/nbdime` (notebook-aware diff/merge).** [SRC] nbdime diffs and merges
Jupyter notebooks, and since 4.0.0 uses cell IDs in diffing and merging (S5, PR #639/S7b). Its
matched-cell comparison is layered in three tiers (S7b, PR body): in the strict tier a cell without
an ID is never considered equal to a cell with an ID; in the two less-strict tiers cells that both
have IDs are unequal if the IDs differ, while an ID-less cell may still be matched to an ID-ful
cell — explicitly to support "commits where cell IDs are added to notebooks that previously didn't
have it" and partially-merged notebooks where only some cells have IDs. [SRC] Its diff CLI exposes
axis switches [inline excerpt omitted; original artifact pin retained] (S8), i.e. source, outputs,
metadata and [verbatim excerpt omitted; original artifact/source locator retained] are independently suppressible axes in practice.

**Component B: `jupyter/nbformat` (format + validation/version negotiation).** [SRC] nbformat
implements JEP-62 cell IDs (5.1.0, S4), upgrades 4.x minors to 4.5 (5.1.1), validates notebooks
against per-minor JSON schemas, and negotiates versions: [inline excerpt omitted; original artifact pin retained]
loads the schema for the notebook's *declared* minor, and when the declared minor is newer than the
library's known minor ([verbatim excerpt omitted; original artifact/source locator retained]) it relaxes all [inline excerpt omitted; original artifact pin retained]
constraints and allows `unrecognized_cell`/`unrecognized_output` (S3). [SRC] Duplicate or missing
cell ids in a (4,≥5) notebook raise `ValidationError` ([verbatim excerpt omitted; original artifact/source locator retained]) when
repair is disabled — which is what `isvalid()` requests (`repair_duplicate_cell_ids=False`) — while
`normalize()` exists as the explicit repair path and `validate()`'s auto-fixing arguments are
deprecated since 5.5.0 for security reasons (S3, S4).

**Version-specific behavior that supports a minimal approach** [INFER from S1–S5]:
1. The 4.4→4.5 boundary is *the* identity boundary: `id` is optional/absent in 4.0–4.4 and required
   in ≥4.5 (S1, S2). A minimal tool therefore gates matching on the **declared minor of each side**,
   not on file contents or tool assumptions.
2. nbformat's future-minor relaxation (S3) means a comparator can stay small: unknown future cells
   degrade to opaque, id-matchable objects rather than requiring format upgrades.
3. nbdime's tier rule (S7b) is directly reusable as a *specification* for two-side version mismatch:
   id-equality only when both sides are id-bearing; never treat id-present as id-absent.
4. For ordinary files, git's rename-detection precedent (S10, S11) supplies the shape of an
   equivalence rule (observed delete+add vs. inferred rename, configurable, bounded).

**Bounded shortlist considered (per `METHOD.md`), 4 options:**
`nbdime` (retained — design precedent), `nbformat` (retained — dependency), **git rename detection**
(analogy from the neighboring VCS use case — retained as the rename-inference model, S10/S11), and
`nbconvert`'s `ClearOutputPreprocessor` (neighboring notebook-hygiene use case — retained as
*axis-classification precedent*, rejected as a component: it **mutates** notebooks (S12), which is
incompatible with read-only saved-state comparison). The git analogy transfers the *rule shape*
(observed vs. inferred rename; bounded, configurable detection) but not exact defaults; the
analogous-component risks are noted in §7/L2.

---

## 3. Q2 — Distinguishing source / outputs / metadata; cell identity under differing versions and identifiers; renames, untracked files, capture limits

### 3.1 Notebook change axes [CHOICE built on SRC]

Parse each saved state with nbformat at its **declared** [inline excerpt omitted; original artifact pin retained] (S3
`get_version`/`get_validator`). Report three observation axes per matched cell pair, plus a
notebook-level axis — never blended:

1. **source** — the cell `source`. [SRC] The schema types `source` as `multiline_string`: a JSON
   string **or** an array of strings (S2). Therefore string-equality of raw JSON is *not* source
   equality; [CHOICE] the comparator normalizes both representations (join list-of-lines with
   `\n`) before comparing, and reports the normalization when representations differed.
2. **outputs** (code cells only) — the `outputs` array with `output_type` ∈ {`execute_result`,
   `display_data`, `stream`, `error`} (S2). [SRC] Mimebundle values for `application/*+json` may be
   *any* JSON type (S2), so output comparison is structural JSON comparison, not text diffing.
   [SRC] `execution_count` is a separate required field ("prompt number … null if the cell has not
   been run", S2); [CHOICE] we report execution-count changes in the **metadata/details** bucket,
   not as source or output changes, mirroring how nbdime treats output-adjacent detail as its own
   axis (S8 `--ignore-details`).
3. **metadata** — notebook root metadata and per-cell `metadata`, both [inline excerpt omitted; original artifact pin retained]
   (S2), i.e. open-ended. [SRC] There is field-classification precedent for output-adjacent
   metadata: nbconvert's ClearOutputPreprocessor treats `collapsed` and `scrolled` as
   output-associated and strips them with the outputs (S12). [CHOICE] we report metadata changes
   key-by-key and tag output-adjacent keys (`collapsed`, `scrolled`, `metadata.execution.*`) as
   `output-adjacent` annotations, without hiding them.

The three-axis split is what makes observations useful: [SRC] nbdime users routinely configure
diffs that ignore exactly these axes independently (`--ignore-outputs --ignore-metadata
--ignore-details`, S8), and nbconvert's preprocessor shows the axes are independently manipulable
(S12).

### 3.2 Cell identity and matching, under version/identifier conditions [CHOICE implementing SRC rules]

Gate on declared minors (both sides must be major 4; otherwise the input is **unsupported** and
reported, not compared — brief scope is version-4 notebooks; [SRC] the 4.5 schema pins `nbformat`
to 4 and [inline excerpt omitted; original artifact pin retained], S2):

- **Both sides ≥ 4.5:** ids are present and validated. Matching is primarily **by cell id**
  (nbdime strict tier, S7b). Conditions preserved:
  - [SRC] id syntax is `^[a-zA-Z0-9-_]+$`, length 1–64 (S2/S1); an id-bearing cell never matches an
    id-less cell at the strict tier (S7b).
  - [SRC] ids are unique *within one notebook only*; [verbatim excerpt omitted; original artifact/source locator retained]
    (S1). Cross-state id equality is thus a legitimate join key, but carries no global meaning.
  - [SRC] id is stable across content edits ([verbatim excerpt omitted; original artifact/source locator retained], S1); a cell split
    gives the new half a fresh id (S1). So id-equal ⇒ same cell with possible content change;
    id-only-on-one-side ⇒ inserted/deleted cell.
  - [SRC] [verbatim excerpt omitted; original artifact/source locator retained] (S1 cons).
    Therefore **content-identical cells with different ids must be reported as two cells
    (delete+insert), not as [verbatim excerpt omitted; original artifact/source locator retained] with metadata noise** — and vice versa, id-equal cells are
    one cell even if source diverged.
  - **Duplicates within a side:** [SRC] invalid for (4,≥5); nbformat raises
    `ValidationError` with repair disabled and offers repair only via explicit `normalize()` (S3).
    [CHOICE] the comparator never repairs; affected cells are marked `IDENTITY-AMBIGUOUS`,
    matched only positionally within their duplicate group, and the report says so. (Optionally run
    `normalize()` on a *deep copy* to report [verbatim excerpt omitted; original artifact/source locator retained] counts.)
- **One side < 4.5 (or both < 4.5):** ids cannot be compared on the id-less side
  ([SRC] id required only in ≥4.5, S1/S2). [CHOICE] fall back to a two-tier content alignment
  (nbdime moderate/approximate analogue, S7b): exact (cell_type, normalized-source) equality first,
  then a bounded similarity alignment over cell order; every non-exact match is labelled
  `MATCH=INFERRED`. Order is otherwise not identity: [SRC] reordered cells with stable ids are
  id-matched regardless of position (ids are positional-independent references, S1; nbdime matches
  by id, S7b).
- **Future minor (declared minor above the library's known set):** [SRC] nbformat relaxes
  `additionalProperties` and admits `unrecognized_cell`/`unrecognized_output` (S3). [CHOICE]
  unrecognized cells are matched **only** by id (when both sides bear ids) and never by content
  tiers; their content is reported as opaque. This preserves the source's forward-compatibility
  contract instead of guessing.

**What absent/duplicate identifiers leave unknown** [INFER]: with ids absent (<4.5), cell identity
between states is an inference from content, never a fact; two same-source cells (e.g. two empty
markdown separators) are indistinguishable, so insert/delete *positions* among them are ambiguous
and reported as such. With duplicate ids, identity inside the duplicated group is undefined. The
prototype's obligation is to *expose* both ambiguity classes, not resolve them silently.

### 3.3 Workspace (ordinary-file) observations [CHOICE with SRC analogy]

- Each snapshot's manifest records tracked text files with content hashes; **untracked** is a
  capture-time property recorded in the manifest (a file untracked at capture time that later gets
  tracked is, between these two captured states, whatever the manifests say).
- **Observed differences are facts; renames are inferences.** [CORRECTION] The thin plan's "design
  … observations[verbatim excerpt omitted; original artifact/source locator retained]a was renamed
  to b" is an equivalence the tool *chooses*. Rule R1 (default): equal content hash + unique
  counterpart ⇒ `RENAME-INFERRED(a→b)`, labelled inferred, never silent. Rule R2 (optional,
  configurable similarity θ, borrowed from the git-analogy shape): git's porcelain detects renames
  by default with `diff.renames` and a bounded candidate set (`diff.renameLimit`, default 1000)
  (S10, S11); we expose a θ threshold off by default in the prototype. When R1/R2 have multiple
  candidates, identity stays **UNRESOLVED** and both candidates are listed. [SRC] caution import:
  even git's rename pairing has regressed before ("[inline excerpt omitted; original artifact pin retained] used to work better when two
  originally identical files A and B got renamed to X/A and X/B … broken in the 2.0 timeframe",
  fixed in 2.9.0, S10) — automatic pairing must stay labelled and testable.
- **Untracked files** are surfaced as `UNTRACKED-AT-CAPTURE` observations and are excluded from
  snapshot recovery (§5.4); they are workspace context, not captured content.
- **Limits of two captured states** [INFER]: no ancestry ⇒ cannot distinguish [verbatim excerpt omitted; original artifact/source locator retained] from
  [verbatim excerpt omitted; original artifact/source locator retained]; anything not in a snapshot (unsaved buffers, files ignored/untracked at
  capture time, bytes not hashed) is **unknowable** and reported as such. The prototype is offline
  and never watches the filesystem (brief exclusion).

---

## 4. Q3 — A real issue → fix → test chain and its scoped lesson

**Chain: nbdime cell-ID support (S6 → S7a → S7b → S5).**
- **Issue:** jupyter/nbdime **#553** [verbatim excerpt omitted; original artifact/source locator retained], opened 2020-12-03 by nbdime maintainer
  vidartf right after JEP 62; it poses exactly the identity questions our N2 must answer: should
  IDs take precedence over content ("content is the only attribute that is exposed to the user,
  content equality should probably still be the strongest measure?"), how to display changed IDs,
  and how to resolve ID conflicts on merge. Closed 2023-11-01 as completed.
- **Interim fix:** PR **#566** [verbatim excerpt omitted; original artifact/source locator retained] (merged 2021-04-12):
  step 1 = treat `id` as opaque metadata with unchanged behavior. Its body documents the test
  fallout and repairs: failing tests down [verbatim excerpt omitted; original artifact/source locator retained], naming fixed tests
  `test_pretty_print_code_cell` and `test_git_diff_driver_add_helper_filter` (S7a).
- **Fix:** PR **#639** [verbatim excerpt omitted; original artifact/source locator retained] (merged 2023-11-01,
  merge commit `c1ea9b9…`, +1113/−258 across 56 files), whose body says [verbatim excerpt omitted; original artifact/source locator retained] and specifies
  the tiered `compare_cell_*` semantics (strict/moderate/approximate, id atomic) plus test changes
  (S7b). Shipped in **nbdime 4.0.0** per the changelog (S5).
- **Traceability** is exact: issue number → PR numbers → changelog release, all captured above.

**Two corroborating failures from the same ecosystem** (kept out of the claimed chain, used as risk
evidence): open issue **#597** — nbdime merge auto-resolves a conflicting region by *deleting the
cells on both sides* (nbdime 3.1.0 reproduction; S8); open issue **#787** — `nbdiff-web` stalls on
particular cell content at 4.0.2 while terminal `nbdiff` is correct (S9).

**Scoped engineering lesson** [INFER]:
1. When a format gains a stable identity field (JEP 62, 2020) *after* comparison tools exist, full
   identity-aware matching took ~3 years and a major release (3.x → 4.0.0). The safe interim is
   precisely PR #566's: treat the new field as opaque/atomic, change no matching behavior, and keep
   tests green — then layer tiered matching.
2. Identity tiers must be defined **per version condition** (id-ful vs id-less; both vs one),
   exactly the boundary set nbdime encoded; a single global rule is wrong on one side of the 4.5
   boundary.
3. Automated *resolution* on top of matching is where content loss appeared (#597): a comparison or
   recovery tool must never drop cells/files to [verbatim excerpt omitted; original artifact/source locator retained] ambiguity. Our recovery is copy-only and
   ambiguity is surfaced, never auto-resolved.

**Validation that follows** [PROPOSED-UNEXECUTED]: the fixture set in §8 must cover every tier
boundary of §3.2 (id-equal, id-differ, id-less↔id-ful, duplicate ids, future-minor opaque cells)
and assert **no content is ever dropped or mutated** by comparison or recovery (anti-#597 guard).
This stage has **not executed** these tests; no pass is claimed.

---

## 5. Obligation specifications N1–N4 (N5 is the whole of §2–§8)

### N1 — Bounded capture/input contract; read-only comparison
[CHOICE] Inputs per case: two snapshot directories, each containing (a) the captured `.ipynb`
(byte-exact), (b) captured ordinary text files, (c) a manifest JSON recording for each member: path,
SHA-256, bytes, the notebook's declared `nbformat`/`nbformat_minor` as read from the captured
notebook, tracked/untracked status. The original workspace, snapshots and captures are read-only
during observation and recovery (brief). Comparison reports **declared** versions from the parsed
notebook (`get_version`, S3) and flags **unsupported inputs**: notebook major ≠ 4 (schema pins
major=4, S2; brief scope is v4), undecodable JSON, manifests missing members, mismatched
manifest↔content hashes. [SRC-condition] For a declared minor newer than the validator's known
set, nbformat relaxes `additionalProperties` and admits unrecognized cells/outputs (S3) — the
prototype reports [verbatim excerpt omitted; original artifact/source locator retained] rather than
failing. **What is unknown:** absent capture data (a member listed in a manifest but not captured),
unsaved editor buffers (excluded by brief), and anything untracked at capture time — each leaves
the corresponding question ([verbatim excerpt omitted; original artifact/source locator retained] / [verbatim excerpt omitted; original artifact/source locator retained] / [verbatim excerpt omitted; original artifact/source locator retained])
unanswerable, and the report says so instead of guessing.

### N2 — Notebook observations (see §3.1–3.2)
Axes: source / outputs / metadata (+ execution-count in details); identity by declared-minor-gated
id matching with INFERRED content-tier fallback; `IDENTITY-AMBIGUOUS` on duplicate ids; version
conditions from S1–S3/S7b preserved verbatim in the report footer.

### N3 — Workspace observations (see §3.3)
Ordinary text edits (hash/line diff), `RENAME-INFERRED` only under rule R1/R2 with the rule shown,
`UNRESOLVED` identity when candidates are ambiguous, `UNTRACKED-AT-CAPTURE` surfaced and excluded
from recovery.

### N4 — Recovery to a new destination from an explicitly selected captured state
[CHOICE] Semantics: recovery = byte-exact copy of **captured** members of the selected snapshot
into a destination directory that **must not already exist** (existing destination ⇒ refusal with
exit code; no overwrite, no merge, no checkout-over — the brief forbids reset/checkout-over/merge
into the original, and we extend refusal to any pre-existing destination to keep recovery
append-only-safe). Defined refusals: (i) destination exists (even empty); (ii) a member referenced
by the manifest is missing from the snapshot store ⇒ refuse and list the paths — **uncaptured
content is never promised and never synthesized**; (iii) manifest-internal path collisions ⇒
refuse; (iv) destination-parent unwritable ⇒ refuse before any writes. Untracked files are not
recoverable (not captured); the report names them. After copy, re-hash every written file against
the manifest. [PROPOSED-UNEXECUTED] All recovery paths are covered by T8 in §8.

---

## 6. Component comparison and recommendation (N5)

**Compared options for the comparison core:**

1. **Adopt `nbdime` as a library** for notebook diffing: [SRC] it already implements id-aware
   tiered matching (4.0.0, S5/S7b) and axis switches (S8). Costs: it brings a server/web/Lab
   surface and merge machinery we do not need; its automated merge resolution has a documented
   content-deleting failure (#597, S8) and its web differ a live stall bug (#787, S9); and its
   repo metadata shows license [verbatim excerpt omitted; original artifact/source locator retained] (captured API record), an unresolved dependency
   question (see `out/UNRESOLVED_LEADS.md` L1). It targets human-readable diffs/merges, not
   machine-reportable ambiguity ledgers.
2. **Adopt `nbformat` (validation/version negotiation) + a small in-house comparator** (~stdlib
   only, `difflib` for the inferred tier): [SRC] nbformat gives exact declared-version schema
   selection, future-minor relaxation, and normative duplicate/missing-id errors (S3); the
   matching tiers are ~100 lines because nbdime's PR #639 fixed their semantics as a *spec*
   (S7b).

**Recommendation:** option 2 — **nbformat as the single notebook dependency, comparator and
recovery in-house**. **Concrete tradeoff:** we re-implement a narrow slice of nbdime's cell
matching (giving up its battle-tested rendering, merge strategies and edge-case maturity) in
exchange for a read-only, offline, dependency-light tool whose ambiguity and refusal semantics are
first-class outputs (N1–N4) and whose resolution behavior can never silently drop content (#597
lesson). Git rename detection is retained as the **analogy** for N3's rule shape (observed vs.
inferred rename; bounded, configurable detection, S10/S11) with its default threshold **not**
imported as fact — the similarity percentages are our own configurable choice. `nbconvert`'s
ClearOutputPreprocessor (S12) is retained only as precedent for output-adjacent metadata
classification and rejected as a component (it mutates). [SRC] Any future reconsideration of
nbdime-as-library must first resolve its license text and re-check #597/#787 status (L1, L2).

---

## 7. Revised thin plan (replaces `inputs/THIN_PLAN.md` steps 1–4)

1. **Capture contract** (N1): manifest schema above; snapshot dirs immutable; declared-version
   recording; unsupported-input and unknown-data reporting (replaces thin-plan step 1's
   [verbatim excerpt omitted; original artifact/source locator retained] with the concrete schema and refusal list).
2. **Notebook comparator** (N2): nbformat parse/validate at declared minor; minor-gated id matching
   with strict/moderate tiers (S7b semantics); three-axis observations (§3.1); ambiguity ledger
   (§3.2). [CORRECTION] The thin plan assumed [verbatim excerpt omitted; original artifact/source locator retained] could be designed
   generically; the source evidence says ambiguity classes are version-specific — duplicate ids are
   a (4,≥5) phenomenon, absent ids a (<4.5) phenomenon (S1–S3) — and must be enumerated per class.
3. **Workspace differ** (N3): hash-based observations; R1 default rename inference; θ-similarity
   rule off by default; UNRESOLVED identity reporting (replaces thin-plan step 2's unexamined
   [verbatim excerpt omitted; original artifact/source locator retained]).
4. **Copy-only recovery** (N4): new-destination refusal semantics, missing-content refusal,
   collision refusal, hash-verified copy, untracked excluded (replaces thin-plan step 3's generic
   [verbatim excerpt omitted; original artifact/source locator retained]).
5. **Fixture set and checks** (thin-plan step 4, concretized in §8), all read-only-side-effect-free,
   with the anti-#597 no-drop/no-mutate assertion as a first-class check.

[CORRECTION] Thin-plan sentence [verbatim excerpt omitted; original artifact/source locator retained] is revised to
"present version-gated, axis-separated observations with an explicit ambiguity and unknowns
ledger" — justified by S1–S3 (version conditions) and S6–S7b (identity precedence questions).

---

## 8. Discriminating validation plan — all checks [PROPOSED-UNEXECUTED]

Each fixture pairs two synthetic snapshots and one assertion that a naive (index-only or
content-only) comparator would fail:

- **T1 version gate:** states at minor 4.4 vs 4.5 ⇒ declared versions reported; id-less↔id-ful
  cells match only in the inferred tier (`MATCH=INFERRED` labels present; no strict-tier match).
- **T2 output-only change:** same sources, different outputs ⇒ exactly one `outputs` observation;
  applying ClearOutputPreprocessor semantics (S12) to state B in-test would equalize the axis
  (discriminating the output axis from source).
- **T3 metadata-only change:** `tags` added ⇒ only the metadata axis fires.
- **T4 duplicate ids (4.5):** comparator raises no repair, no mutation; both cells
  `IDENTITY-AMBIGUOUS`; `isvalid`-style validation-without-repair flags them (S3).
- **T5 reorder with stable ids:** id-matched with order delta; no insert/delete observations.
- **T6 rename inference:** delete(a)+add(b) with equal hash ⇒ single `RENAME-INFERRED(a→b)`; two
  equal-hash candidates ⇒ `UNRESOLVED` with both listed; rule R1 named in output.
- **T7 untracked:** file marked untracked at capture ⇒ surfaced, excluded from recovery output.
- **T8 recovery refusals:** existing destination ⇒ refuse; manifest member missing ⇒ refuse with
  paths; happy path ⇒ byte-and-hash-verified copy and source workspace hash-unchanged.
- **T9 no-drop guard (anti-#597):** for every fixture, comparison and recovery together neither
  mutate inputs nor omit any captured cell/file from the report or the recovered tree.

Success criterion: all T1–T9 pass in a later implementation stage; this stage asserts nothing as
passed. Host-side capture/hash/cost ledgers are not reproduced here (host captures them
mechanically).

---

## 9. Source-fact vs. product boundary — summary

Source obligations (S1–S12) bind only what they say, under the conditions quoted (e.g. `diff.renames`
is porcelain-only, S11; id uniqueness is per-notebook, S1; id matching tiers are nbdime's
engineering choice, S7b, not a format requirement). Everything in §3.2's labels, §3.3's R1/θ
defaults, §5's refusal codes and §7's plan is **product choice** on top of those facts, with the
Q3 chain (§4) as traced engineering evidence. Supported corrections to the thin plan are marked
[CORRECTION] in §3.3 and §7.
