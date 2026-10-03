# V8-NB-BREADTH-T-M — FINAL PROPOSAL (complete corrected research-to-plan artifact)

Case: offline prototype comparing two explicitly captured saved states of a repository workspace
(one version-4 `.ipynb` notebook + two ordinary text files, each snapshot recording the notebook's
declared minor version and a workspace manifest), with copy-recovery of a selected state into a
**new** directory. This document is the complete corrected revision of `inputs/THIN_PLAN.md` and of
the frozen `inputs/PROPOSAL.md` (sha256 `43db9e10…`), resolving all six points of the independent
candidate critique `inputs/CRITIQUE.md` (sha256 `0ed52471…`). It is the whole usable plan, not a
diff or a status record.

**No code was executed in any stage of this case so far.** Every check in §8 is
**[PROPOSED-UNEXECUTED]**; no execution receipt exists or is claimed. Host-side
capture/hash/history/cost ledgers are recorded mechanically by the host and are not reproduced here.

**Claim labels used throughout**

- **[SRC]** — fact read from a captured public primary source (exact locator + capture sha256 in
  §1). Conditions, exceptions and normative force are preserved inline; a claim's force is further
  subdivided: **[SRC-REQ]** normative requirement, **[SRC-QA]** Q&A-level answer in the source,
  **[SRC-SUGGEST]** explicit suggestion in the source, **[SRC-IMPL]** implementation behavior of a
  named library at a pinned version (not a format guarantee).
- **[INFER]** — engineering inference from source facts; may be wrong where a source condition is missed.
- **[CHOICE]** — product decision for this prototype; justified but not source-mandated.
- **[PROPOSED-UNEXECUTED]** — a planned test/check that has not been run.
- **[CORRECTION]** — a supported correction to the thin plan's assumptions or to the frozen proposal,
  with the supporting locator stated.

Out of scope (per `inputs/BRIEF.md`): continuous watching, collaborative editing, remote sync,
unsaved editor buffers, whole Git history repair, executable notebook evaluation.

---

## 0. Critique resolution ledger — which critique points changed the plan, and why

This stage re-captured the load-bearing sources directly (F1–F8, §1) and **accepted all six
critique points**; none was rejected, because each was reproduced against the captured text:

| Point | Verdict | Verified by (this stage's captures) | What changed in the plan |
|---|---|---|---|
| C1′ (consequential) — nbformat 5.11.0 removed `validate()`'s repair kwargs; the no-repair path is `isvalid()`/`normalize()` only; `nbformat.reads()` itself repairs id defects in memory via plain `validate()`; the v5.10.4 pin becomes load-bearing | **ACCEPTED** | F1 (CHANGELOG @ main: 5.11.0 lists [verbatim excerpt omitted; original artifact/source locator retained] and [verbatim excerpt omitted; original artifact/source locator retained]); F2 ([inline excerpt omitted; original artifact pin retained]: public `validate` has no repair kwargs; [inline excerpt omitted; original artifact pin retained] keyword-only default True; `isvalid()` calls [inline excerpt omitted; original artifact pin retained] and itself deep-copies + asserts non-mutation); F3/F4 (`__init__.py` at both v5.11.1 and v5.10.4: `reads()` calls plain `validate(nb)`); F5 ([inline excerpt omitted; original artifact pin retained]: repair kwargs still accepted behind a `_deprecated` sentinel with `_dep_warn`) | **N1 rewritten**: dependency pinned `nbformat==5.11.1`, explicit relied-on API surface {`isvalid`, `normalize`, `get_validator`, `reader.get_version`}; comparison parses with stdlib `json` and treats raw captured bytes as ground truth; `nbformat.reads()` is banned on the comparison path (in-memory repair would break no-mutation guarantees). **T4 recipe restated** (isvalid-style no-repair at the pinned version, never `validate(repair_duplicate_cell_ids=False)`, which is a `TypeError` at ≥5.11.0). **T9 guard extended** to parsed representations. The frozen proposal's UNRESOLVED_LEADS L5 claim [verbatim excerpt omitted; original artifact/source locator retained] is **FALSE and replaced** (see `out/UNRESOLVED_LEADS.md` L5). |
| C2′ — §3.1's [verbatim excerpt omitted; original artifact/source locator retained] under-specified the output axis: only `^application/(.*\+)?json$` mimebundle values are unconstrained; every other mimetype value, and `stream.text`, is typed `multiline_string` (string | array of strings) | **ACCEPTED** | F6 ([inline excerpt omitted; original artifact pin retained]: `misc/mimebundle` `additionalProperties` → `misc/multiline_string`, with [inline excerpt omitted; original artifact pin retained] [verbatim excerpt omitted; original artifact/source locator retained]; `stream.text` → `misc/multiline_string`; `error.traceback` array of strings) | **§3.1 normalization rule generalized**: multiline normalization (`\n`-join of list-of-lines) applies to *every* `multiline_string`-typed field (cell `source`, non-JSON mimebundle values, `stream.text`), reported when representations differed; raw structural comparison retained only for `application/(.*+)?json` values. **T2 extended** with a list-vs-string output-representation discriminator and an `execution_count`/`collapsed`/`scrolled` equality precondition. |
| C3′ (normative force) — [verbatim excerpt omitted; original artifact/source locator retained] and [verbatim excerpt omitted; original artifact/source locator retained] are Q&A / [verbatim excerpt omitted; original artifact/source locator retained] statements in JEP 62, not requirements; [verbatim excerpt omitted; original artifact/source locator retained] is an unattributed paraphrase | **ACCEPTED** | F7 ([inline excerpt omitted; original artifact pin retained]: Q6 answer [verbatim excerpt omitted; original artifact/source locator retained]; Q9 [verbatim excerpt omitted; original artifact/source locator retained]; Q1 [verbatim excerpt omitted; original artifact/source locator retained]; the normative requirements are the Required-Field section and schema conformance) | **§3.2 relabeled**: id stability → [SRC-QA]; split behavior → [SRC-QA]/[SRC-SUGGEST]; [verbatim excerpt omitted; original artifact/source locator retained] → [INFER]. Only **[SRC-REQ]** items remain: id required at ≥4.5 (schema + JEP Required-Field), syntax/length, uniqueness within one notebook ([verbatim excerpt omitted; original artifact/source locator retained]). The report footer (§5/N2) carries the force labels verbatim. |
| C4′ — the identity gate assumed [verbatim excerpt omitted; original artifact/source locator retained], but missing ids at ≥4.5 are only a warning (`MissingIDFieldWarning`), `isvalid()` ignores it, and `unrecognized_cell` does not require `id` at all — a real, distinct state class | **ACCEPTED** | F6 (`unrecognized_cell` required: [inline excerpt omitted; original artifact pin retained] — no `id`); F2/F5 (`MissingIDFieldWarning` [verbatim excerpt omitted; original artifact/source locator retained], only a warning at both pinned versions; `isvalid()` filters it and can return True) | **§3.2 gate changed** to *per-cell id presence* (declared minor as second condition); new named class **`MISSING-ID-AT-4.5+`** in the ambiguity ledger; **N1's flagged-input list names it**; **new fixture T10**. |
| C5′ (precision) — PR #566's fixed-test names carry the author's own hedge [verbatim excerpt omitted; original artifact/source locator retained] | **ACCEPTED** | F8 (PR #566 API record: body states "The number of failing tests is down from 34 to 32 (fixed `test_pretty_print_code_cell` and `test_git_diff_driver_add_helper_filter` I _think_) but the bulk of merge tests is still failing."; merged 2021-04-12T00:40:45Z; merge commit `8ce708cc541b3a104b67bed75c180dcaaedc4dc2`; +170/−107, 15 files) | **§4 corrected**: the hedge is quoted and attributed; only the 34→32 numbers are stated plainly by the source. Also preserved: PR #566's [verbatim excerpt omitted; original artifact/source locator retained] wording is quoted by its author *from the #553 discussion* (provenance noted). |
| C6′ (precision) — git's `diff.renameLimit` default is [verbatim excerpt omitted; original artifact/source locator retained] and [verbatim excerpt omitted; original artifact/source locator retained]; proposal flattened the hedge | **ACCEPTED** | F9 ([inline excerpt omitted; original artifact pin retained]: exact wording quoted in §3.3) | **§3.3/N3 quotes the hedge verbatim**; no git numeric default is imported into the prototype (consistent with L3). |

Two additional same-stage observations recorded for completeness (not corrections): at v5.11.1
`get_validator` includes `relax_add_props` in its cache key (upstream fix #440, F2), and the
nbformat changelog documents an optional `fastjsonschema` backend (`NBFORMAT_VALIDATOR`
environment variable, 5.0.8, F1) — recorded as L7 because the validator backend can change
error-message specifics, though not the schema semantics relied on here.

---

## 1. Source and capture ledger

### 1.1 Captures made in this stage (exact HTTP-response-body captures, 2026-10-03 UTC)

| # | Locator (repo @ version, path) | sha256 (prefix) | Captured (UTC) | Establishes |
|---|---|---|---|---|
| F1 | `jupyter/nbformat` @ `main`, `CHANGELOG.md` | `414e10d3…` | 04:22:06 | 5.11.0: [verbatim excerpt omitted; original artifact/source locator retained], [verbatim excerpt omitted; original artifact/source locator retained]; 5.11.1: [verbatim excerpt omitted; original artifact/source locator retained], [verbatim excerpt omitted; original artifact/source locator retained] (contributor window 2026-08-06…2026-08-17); 5.10.4 is the previous release; 5.5.0 deprecation rationale ([verbatim excerpt omitted; original artifact/source locator retained]); 5.2.0 [verbatim excerpt omitted; original artifact/source locator retained]; 5.1.0 [verbatim excerpt omitted; original artifact/source locator retained]; 5.1.1 [verbatim excerpt omitted; original artifact/source locator retained]; 5.7.2 [verbatim excerpt omitted; original artifact/source locator retained]; 5.0.8 optional `fastjsonschema` backend |
| F2 | `jupyter/nbformat` @ tag `v5.11.1`, `nbformat/validator.py` | `3db1fe48…` | 04:22:06 | Public [inline excerpt omitted; original artifact pin retained] — **no repair kwargs**; [inline excerpt omitted; original artifact pin retained] ("the public `validate` always uses the defaults"); `isvalid()` → [inline excerpt omitted; original artifact pin retained] with `MissingIDFieldWarning` filtered, and `isvalid()` deep-copies its input and raises `AssertionError` if the call mutated it; `_normalize` duplicate-id error [inline excerpt omitted; original artifact pin retained] (raises when repair disabled); `MissingIDFieldWarning` text [verbatim excerpt omitted; original artifact/source locator retained]; `normalize()` public deep-copies and returns [inline excerpt omitted; original artifact pin retained]; future-minor relaxation ([inline excerpt omitted; original artifact pin retained] → relax `additionalProperties`, `_allow_undefined` adds `unrecognized_cell`/`unrecognized_output`) unchanged; `get_validator` cache key now includes `relax_add_props` |
| F3 | `jupyter/nbformat` @ tag `v5.11.1`, `nbformat/__init__.py` | `e4afe879…` | 04:22:06 | `reads()` calls plain `validate(nb)` (logs ValidationError, returns the repaired-in-memory node) — the parse-mutation hazard exists at 5.11.1 |
| F4 | `jupyter/nbformat` @ tag `v5.10.4`, `nbformat/__init__.py` | `6c9b408a…` | 04:22:07 | Same `reads()` → plain `validate(nb)` structure at 5.10.4 — the hazard exists at the proposal's pinned version too |
| F5 | `jupyter/nbformat` @ tag `v5.10.4`, `nbformat/validator.py` | `e12625e7…` | 04:22:07 | Old surface: [inline excerpt omitted; original artifact pin retained] with `_dep_warn` [verbatim excerpt omitted; original artifact/source locator retained]; `isvalid()` calls [inline excerpt omitted; original artifact pin retained]; duplicate-id error and future-minor relaxation as at 5.11.1 |
| F6 | `jupyter/nbformat` @ tag `v5.10.4`, `nbformat/v4/nbformat.v4.5.schema.json` | `523e3578…` | 04:22:30 | `nbformat` minimum 4 maximum 4; `nbformat_minor` minimum 5; `cell_id` pattern `^[a-zA-Z0-9-_]+$`, minLength 1, maxLength 64; `id` in `required` of raw/markdown/code cells; code cell requires `outputs`+`execution_count`; `execution_count` [verbatim excerpt omitted; original artifact/source locator retained]; `source`/`stream.text`/mimebundle non-JSON values → `misc/multiline_string` (string | array of strings); mimebundle [inline excerpt omitted; original artifact pin retained] [verbatim excerpt omitted; original artifact/source locator retained]; root and per-cell `metadata` [inline excerpt omitted; original artifact pin retained]; `unrecognized_cell` requires only `cell_type`+`metadata` (**no `id`**); `unrecognized_output` requires only `output_type`; `error.traceback` array of strings |
| F7 | `jupyter/enhancement-proposals` @ `master`, `62-cell-id/cell-id.md` (JEP 62, status: Implemented, date 2020-09-25) | `7f52a9c2…` | 04:22:30 | Front matter status/date; "The `id` field in cells would _always_ be **required** for any future nbformat versions (4.5+)[verbatim excerpt omitted; original artifact/source locator retained]Uniqueness across notebooks is not a goal. — A managed ecosystem might make use of uniqueness across documents, but the spec doesn't expect this behavior[verbatim excerpt omitted; original artifact/source locator retained]Correct. It stays the same once created.[verbatim excerpt omitted; original artifact/source locator retained]One cell (second part of the split) gets a new cell ID.[verbatim excerpt omitted; original artifact/source locator retained]…we suggest one cell … keeps the id, the other gets a new id. Each application can choose how to behave here so long as the cell ids are unique and follow the schema.[verbatim excerpt omitted; original artifact/source locator retained]Notebooks with the same source code can be generated with different cell ids, meaning they are not byte equal." |
| F8 | `api.github.com/repos/jupyter/nbdime/pulls/566` | `966c1f3f…` | 04:22:31 | PR [verbatim excerpt omitted; original artifact/source locator retained]: [inline excerpt omitted; original artifact pin retained], merged 2021-04-12T00:40:45Z, merge commit `8ce708cc541b3a104b67bed75c180dcaaedc4dc2`, author krassowski, merged_by vidartf; body: step-1 quote from #553 + "The number of failing tests is down from 34 to 32 (fixed `test_pretty_print_code_cell` and `test_git_diff_driver_add_helper_filter` I _think_) but the bulk of merge tests is still failing."; +170/−107, 15 files, 10 commits; base repo license record [inline excerpt omitted; original artifact pin retained] re-observed |
| F9 | `git/git` @ tag `v2.42.0`, `Documentation/config/diff.txt` | `0a0ec973…` | 04:22:31 | `diff.renames` [verbatim excerpt omitted; original artifact/source locator retained]; `diff.renameLimit` "The number of files to consider in the exhaustive portion of copy/rename detection; equivalent to the 'git diff' option `-l`. If not set, the default value is **currently** 1000. This setting has no effect if rename detection is turned off." |

### 1.2 Frozen-proposal sources preserved (captured 2026-10-03 in the research/critique stages of this same case)

The following locators from `inputs/PROPOSAL.md` §1 are preserved unchanged; the critique
(`inputs/CRITIQUE.md` §1, captures C1–C15) independently re-fetched each of them and matched every
checked quote, date, state and count. This stage did not re-fetch them, so their verification
provenance is the critique's same-case ledger:

- **S5** `jupyter/nbdime` @ `main`, `CHANGELOG.md` — 4.0.0 "Add support for using cell ID in
  diffing and merging [#639]"; latest 4.0.4 (Feb 2026).
- **S6** `jupyter/nbdime` issue **#553** [verbatim excerpt omitted; original artifact/source locator retained] (opened by vidartf 2020-12-03, closed
  2023-11-01, [inline excerpt omitted; original artifact pin retained]) — open design questions on id vs content precedence,
  id-change display, id-conflict resolution.
- **S7b** `jupyter/nbdime` PR **#639** [verbatim excerpt omitted; original artifact/source locator retained]
  (merged 2023-11-01; merge commit `c1ea9b9deb3b8ca2ea4471ffb616125b0024182b`; 35 commits,
  +1113/−258, 56 files; [verbatim excerpt omitted; original artifact/source locator retained]) — tiered matching semantics (strict/moderate/approximate,
  id atomic), `union` merge strategy improvement.
- **S8** `jupyter/nbdime` issue **#597** [verbatim excerpt omitted; original artifact/source locator retained]
  (open at capture; nbdime 3.1.0 reproduction) — documents diff CLI flags `--ignore-outputs
  --ignore-metadata --ignore-details`.
- **S9** `jupyter/nbdime` issue **#787** [verbatim excerpt omitted; original artifact/source locator retained] (open;
  opened 2025-08-12; nbdime 4.0.2; terminal `nbdiff` correct).
- **S10** `git/git` @ tag `v2.9.0`, `Documentation/RelNotes/2.9.0.txt` — porcelain rename detection
  default-on ("you can still use `diff.renames` … to disable[verbatim excerpt omitted; original artifact/source locator retained][inline excerpt omitted; original artifact pin retained] used
  to work better when two originally identical files A and B got renamed to X/A and X/B by pairing
  A to X/A and B to X/B, but this was broken in the 2.0 timeframe." (fixed in 2.9.0).
- **S12** `jupyter/nbconvert` @ tag `v7.16.6`, `nbconvert/preprocessors/clearoutput.py` —
  [inline excerpt omitted; original artifact pin retained]; sets `outputs=[]`,
  `execution_count=None`; strips those metadata fields.

---

## 2. Q1 — Which two components offer useful precedents, and what version-specific behavior supports a minimal approach?

**Component A: `jupyter/nbdime` (notebook-aware diff/merge).** [SRC] nbdime diffs and merges Jupyter
notebooks, and since 4.0.0 uses cell IDs in diffing and merging (S5, PR #639/S7b). Its matched-cell
comparison is layered in three tiers (S7b, PR body): in the strict tier "cells without an ID is
never considered equal to cells with IDs"; in the two less-strict tiers (moderate, approximate)
cells that both have IDs are unequal if the IDs differ, while an ID-less cell may still be matched
to an ID-ful cell — explicitly to support "Commits where cell IDs are added to notebooks that
previously didn't have it" and partially-merged notebooks. [SRC] Its diff CLI exposes axis switches
[inline excerpt omitted; original artifact pin retained] (S8): source, outputs, metadata and [verbatim excerpt omitted; original artifact/source locator retained]
are independently suppressible axes in practice. The tier semantics are nbdime's **engineering
choice** [SRC-IMPL], not a format requirement.

**Component B: `jupyter/nbformat` (format + validation/version negotiation).** [SRC-IMPL] nbformat
implements JEP-62 cell IDs (5.1.0, F1), upgrades 4.x minors to 4.5 (5.1.1), validates notebooks
against per-minor JSON schemas, and negotiates versions: [inline excerpt omitted; original artifact pin retained]
loads the schema for the notebook's *declared* minor, and when the declared minor is newer than the
library's known minor ([verbatim excerpt omitted; original artifact/source locator retained]) it relaxes all [inline excerpt omitted; original artifact pin retained]
constraints and allows `unrecognized_cell`/`unrecognized_output` — verified present and unchanged at
both v5.10.4 and v5.11.1 (F2, F5). [SRC-IMPL] Duplicate cell ids in a (4,≥5) notebook raise
[inline excerpt omitted; original artifact pin retained] when repair is disabled (F2, F5);
**[CORRECTION per C1′]** the no-repair path is `isvalid()` or explicit `normalize()` at the current
release: 5.11.0 removed the deprecated repair kwargs from public `validate()` (F1, F2), and at
v5.10.4 those kwargs already warned as deprecated-for-security (F5). Plain `validate()` (and hence
`nbformat.reads()`, F3/F4) still repairs id defects **in memory** via `_validate`'s
`repair_duplicate_cell_ids=True` default — at both pinned versions.

**Version-specific behavior that supports a minimal approach** [INFER from F1–F7, S5–S7b]:
1. The 4.4→4.5 boundary is *the* identity boundary: `id` is required in ≥4.5 ([SRC-REQ] F6, F7) and
   absent in 4.0–4.4. A minimal tool gates matching on the **declared minor of each side *and*
   per-cell id presence** (C4′), not on tool assumptions.
2. nbformat's future-minor relaxation ([SRC-IMPL] F2/F5) lets a comparator stay small: unknown
   future cells degrade to opaque, id-matchable objects rather than requiring format upgrades.
3. nbdime's tier rule (S7b) is directly reusable as a *specification* for id-ful vs id-less sides;
   it is adopted as spec, not as code (license unread, L1).
4. For ordinary files, git's rename-detection precedent (S10, F9) supplies the shape of an
   equivalence rule (observed delete+add vs. inferred rename; bounded, configurable detection).

**Bounded shortlist (per `inputs/METHOD.md`), 4 options, all discovered from allowed public
primary evidence:** `nbdime` (retained — design precedent/spec), `nbformat` (retained — single
dependency at pinned `==5.11.1`), **git rename detection** (analogy from the neighboring VCS use
case — retained as the rename-inference model, S10/F9), and `nbconvert`'s `ClearOutputPreprocessor`
(neighboring notebook-hygiene use case — retained as *axis-classification precedent*, **rejected as
a component**: it **mutates** notebooks [SRC] S12, incompatible with read-only comparison). The git
analogy transfers the *rule shape* (observed vs. inferred rename; bounded, configurable detection)
but not numeric defaults ([verbatim excerpt omitted; original artifact/source locator retained] stays git's hedge, F9); analogy limits are recorded in
§7/L3 and `out/UNRESOLVED_LEADS.md`.

---

## 3. Q2 — Distinguishing source / outputs / metadata; cell identity under differing versions and identifiers; renames, untracked files, capture limits

### 3.1 Notebook change axes [CHOICE built on SRC; generalized per C2′]

Parse each saved state's captured bytes with **stdlib JSON** (comparison tree, no library mutation)
and read declared [inline excerpt omitted; original artifact pin retained] from the parsed document (`reader.get_version`,
[SRC-IMPL] F2). Report three observation axes per matched cell pair, plus a notebook-level axis —
never blended:

1. **source** — the cell `source`. [SRC] The schema types `source` as `misc/multiline_string`:
   JSON string **or** array of strings (F6). String-equality of raw JSON is therefore not source
   equality; [CHOICE] normalize both representations (`"\n"`.join of a list of lines) before
   comparing, and report the normalization when representations differed.
2. **outputs** (code cells only) — the `outputs` array with `output_type` ∈ {`execute_result`,
   `display_data`, `stream`, `error`} (F6). **[CORRECTION per C2′]** comparison rule, field-typed:
   - `application/(.*+)?json` mimebundle keys: [SRC] values [verbatim excerpt omitted; original artifact/source locator retained] (F6) → structural
     JSON comparison only.
   - **all other mimebundle values, and `stream.text`: [SRC] typed `multiline_string` (F6) → apply
     the same `\n`-join normalization as `source`**, reporting the normalization when
     representations differed. Otherwise a `text/plain` value of [inline excerpt omitted; original artifact pin retained] vs `"a\nb"` —
     schema-equivalent — would fabricate an output change.
   - `error.traceback` is an array of strings (F6); [CHOICE] compare it normalized the same way.
   - [SRC] `execution_count` is a separate required field ("prompt number … null if the cell has
     not been run", F6); [CHOICE] execution-count changes are reported in the **details** bucket,
     not as source or output changes, mirroring nbdime's separable [verbatim excerpt omitted; original artifact/source locator retained] axis (S8).
3. **metadata** — notebook root metadata and per-cell `metadata`, both [inline excerpt omitted; original artifact pin retained]
   (F6), i.e. open-ended. [SRC] Field-classification precedent: nbconvert's ClearOutputPreprocessor
   treats `collapsed` and `scrolled` as output-associated and strips them with the outputs (S12).
   [CHOICE] metadata changes are reported key-by-key and output-adjacent keys (`collapsed`,
   `scrolled`, `metadata.execution.*`) carry an `output-adjacent` annotation, without hiding them.

The three-axis split is what makes observations useful: [SRC] nbdime users configure diffs that
ignore exactly these axes independently (S8), and nbconvert's preprocessor shows the axes are
independently manipulable (S12).

### 3.2 Cell identity and matching, under version/identifier conditions [CHOICE implementing SRC rules; force-labeled per C3′; gate fixed per C4′]

**Gate [CORRECTION per C4′]: strict id-matching eligibility is decided per cell by [inline excerpt omitted; original artifact pin retained]
with the side's declared minor as the second condition** — declared ≥4.5 makes id *required by
schema* ([SRC-REQ] F6, F7) but does not guarantee presence in a defective saved state, because
[SRC-IMPL] nbformat only warns (`MissingIDFieldWarning`) for missing ids and `isvalid()` ignores
that warning (F2, F5), and future-minor `unrecognized_cell`s do not require `id` at all (F6).
Both sides must be major 4; otherwise the input is **unsupported** and reported, not compared
([SRC-REQ] schema pins `nbformat` to 4, F6; brief scope is v4).

- **Both sides ≥ 4.5, ids present on the compared pair:** matching is primarily **by cell id**
  (nbdime strict tier, S7b). Conditions preserved with normative force:
  - [SRC-REQ] id syntax `^[a-zA-Z0-9-_]+$`, length 1–64 (F6/F7); an id-bearing cell never matches
    an id-less cell in the strict tier ([SRC-IMPL] S7b).
  - [SRC-REQ] ids are unique *within one notebook only*: "Uniqueness across notebooks is not a
    goal" (F7). Cross-state id equality is a legitimate join key with no global meaning.
  - [SRC-QA] [verbatim excerpt omitted; original artifact/source locator retained] (id stability across content edits, JEP 62 Q6, F7) —
    expected application behavior, **not a requirement**; the plan treats cross-state id equality
    of divergent content as *one cell with a content change*, which is safe even if some writer
    violates the Q&A guidance.
  - [SRC-QA]/[SRC-SUGGEST] split behavior: Q1 "One cell (second part of the split) gets a new cell
    ID[verbatim excerpt omitted; original artifact/source locator retained]we suggest one cell … keeps the id, the other gets a new id … so long as the cell ids
    are unique and follow the schema" (F7) — suggestion-level; [INFER] ids function as
    position-independent references (JEP motivates URL links/cross-session recall), which is why
    reordered cells id-match regardless of position.
  - [SRC] "Notebooks with the same source code can be generated with different cell ids, meaning
    they are not byte equal" (F7 Cons). Therefore **content-identical cells with different ids are
    reported as delete+insert, not as [verbatim excerpt omitted; original artifact/source locator retained]**, and id-equal cells are one cell even if source
    diverged.
  - **Duplicates within a side:** [SRC-REQ] invalid for (4,≥5) (uniqueness is normative; schema
    enforces presence/syntax, uniqueness is checked by nbformat). [SRC-IMPL] nbformat raises
    [inline excerpt omitted; original artifact pin retained] with repair disabled, and offers repair
    only via explicit `normalize()` (F2, F5). [CHOICE] the comparator never repairs; affected cells
    are marked `IDENTITY-AMBIGUOUS`, matched only positionally within their duplicate group, and
    the report says so. (Optional, safe because `normalize()` deep-copies: F2 — run it on a parsed
    copy to report [verbatim excerpt omitted; original artifact/source locator retained] counts.)
- **One side < 4.5 (or both < 4.5):** ids cannot be compared on the id-less side ([SRC-REQ] id
  required only in ≥4.5, F6/F7). [CHOICE] two-tier content alignment (nbdime
  moderate/approximate analogue, S7b): exact (`cell_type`, normalized-source) equality first, then
  a bounded similarity alignment over cell order; every non-exact match is labelled
  `MATCH=INFERRED`.
- **`MISSING-ID-AT-4.5+` [new class, CORRECTION per C4′]:** a declared-≥4.5 state whose cell lacks
  an id (or an `unrecognized_cell`, which the schema does not bind to `id`, F6) cannot enter the
  strict tier. Such cells are flagged `MISSING-ID-AT-4.5+`, join the content-tier alignment of the
  previous bullet, and the report states that the state is schema-nonconformant-but-warned-only at
  the pinned nbformat ([SRC-IMPL] F2).
- **Future minor (declared minor above the library's known set):** [SRC-IMPL] nbformat relaxes
  `additionalProperties` and admits `unrecognized_cell`/`unrecognized_output` (F2, F5). [CHOICE]
  unrecognized cells are matched **only** by id (when both sides bear ids) and never by content
  tiers; their content is reported as opaque. This preserves the library's forward-compatibility
  behavior instead of guessing; it is implementation behavior, not a format guarantee (L6).

**What absent/duplicate identifiers leave unknown** [INFER]: with ids absent (<4.5), cell identity
between states is an inference from content, never a fact; two same-source cells (e.g. two empty
markdown separators) are indistinguishable, so insert/delete *positions* among them are ambiguous
and reported as such. With duplicate ids, identity inside the duplicated group is undefined. With
missing ids at ≥4.5, the same content-tier ambiguity applies plus a conformance flag. The
prototype's obligation is to *expose* all three ambiguity classes, never resolve them silently.

**Report footer (N2) preserves these conditions verbatim, with force labels** ([SRC-REQ] /
[SRC-QA] / [SRC-SUGGEST] / [SRC-IMPL] as above) — per C3′.

### 3.3 Workspace (ordinary-file) observations [CHOICE with SRC analogy; hedge preserved per C6′]

- Each snapshot's manifest records tracked text files with content hashes; **untracked** is a
  capture-time property recorded in the manifest (a file untracked at capture time that later gets
  tracked is, between these two captured states, whatever the manifests say — L4 notes this trusts
  the capture tool).
- **Observed differences are facts; renames are inferences.** [CORRECTION] The thin plan's "design
  … observations[verbatim excerpt omitted; original artifact/source locator retained]a was renamed
  to b" is an equivalence the tool *chooses*. Rule R1 (default): equal content hash + unique
  counterpart ⇒ `RENAME-INFERRED(a→b)`, labelled inferred, never silent. Rule R2 (optional,
  configurable similarity θ, borrowed from the git-analogy *shape*): [SRC] git's porcelain detects
  renames by default (`diff.renames` [verbatim excerpt omitted; original artifact/source locator retained], affecting only porcelain — F9) with a
  bounded candidate set — `diff.renameLimit`: "If not set, the default value is **currently** 1000.
  This setting has no effect if rename detection is turned off." (F9, hedge quoted). We expose a θ
  threshold off by default and import **no** git numeric default. When R1/R2 have multiple
  candidates, identity stays **UNRESOLVED** and both candidates are listed. [SRC] caution import:
  even git's rename pairing has regressed before ("[inline excerpt omitted; original artifact pin retained] used to work better when two
  originally identical files A and B got renamed to X/A and X/B … broken in the 2.0 timeframe",
  fixed in 2.9.0, S10) — automatic pairing must stay labelled and testable.
- **Untracked files** are surfaced as `UNTRACKED-AT-CAPTURE` observations and are excluded from
  snapshot recovery (§5/N4); they are workspace context, not captured content.
- **Limits of two captured states** [INFER]: no ancestry ⇒ cannot distinguish [verbatim excerpt omitted; original artifact/source locator retained] from "edited
  then reverted"; anything not in a snapshot (unsaved buffers, files ignored/untracked at capture
  time, bytes not hashed) is **unknowable** and reported as such. The prototype is offline and
  never watches the filesystem (brief exclusion).

---

## 4. Q3 — A real issue → fix → test chain and its scoped lesson

**Chain: nbdime cell-ID support (S6 → S7a/F8 → S7b → S5).**
- **Issue:** jupyter/nbdime **#553** [verbatim excerpt omitted; original artifact/source locator retained], opened 2020-12-03 by nbdime maintainer
  vidartf right after JEP 62; it poses exactly the identity questions our N2 must answer: should
  IDs take precedence over content ("content is the only attribute that is exposed to the user,
  content equality should probably still be the strongest measure?"), how to display changed IDs,
  and how to resolve ID conflicts on merge. Closed 2023-11-01 as completed.
- **Interim fix:** PR **#566** [verbatim excerpt omitted; original artifact/source locator retained] (merged 2021-04-12T00:40:45Z,
  merge commit `8ce708cc…`, +170/−107 across 15 files, F8): step 1 = treat `id` as opaque metadata
  with unchanged behavior — the [verbatim excerpt omitted; original artifact/source locator retained] wording is quoted by the PR author *from the #553
  discussion* (provenance preserved). **[CORRECTION per C5′]** Its body states: "The number of
  failing tests is down from 34 to 32 (fixed `test_pretty_print_code_cell` and
  `test_git_diff_driver_add_helper_filter` **I _think_**) but the bulk of merge tests is still
  failing." — the numbers are stated plainly; the named tests carry the author's own hedge, which
  we preserve instead of presenting the names as documented repairs.
- **Fix:** PR **#639** [verbatim excerpt omitted; original artifact/source locator retained] (merged 2023-11-01,
  merge commit `c1ea9b9deb3b8ca2ea4471ffb616125b0024182b`, +1113/−258 across 56 files), whose body
  says [verbatim excerpt omitted; original artifact/source locator retained] and specifies the tiered `compare_cell_*` semantics (strict/moderate/approximate,
  id atomic) plus test changes (S7b). Shipped in **nbdime 4.0.0** per the changelog (S5).
- **Traceability** is exact: issue number → PR numbers → changelog release, all captured above.

**Two corroborating failures from the same ecosystem** (kept out of the claimed chain, used as risk
evidence): open issue **#597** — nbdime merge auto-resolves a conflicting region by *deleting the
cells on both sides* (nbdime 3.1.0 reproduction; S8); open issue **#787** — `nbdiff-web` stalls on
particular cell content at 4.0.2 while terminal `nbdiff` is correct (S9).

**Scoped engineering lesson** [INFER]:
1. When a format gains a stable identity field (JEP 62, 2020) *after* comparison tools exist, full
   identity-aware matching took ~3 years and a major release (3.x → 4.0.0). The safe interim is
   precisely PR #566's: treat the new field as opaque/atomic, change no matching behavior, keep
   tests green — then layer tiered matching.
2. Identity tiers must be defined **per version condition** (id-ful vs id-less; both vs one; and —
   added per C4′ — defective id-ful), exactly the boundary set nbdime encoded; a single global rule
   is wrong on one side of the 4.5 boundary.
3. Automated *resolution* on top of matching is where content loss appeared (#597): a comparison or
   recovery tool must never drop cells/files to [verbatim excerpt omitted; original artifact/source locator retained] ambiguity. Our recovery is copy-only and
   ambiguity is surfaced, never auto-resolved.
4. **[CORRECTION, added per C1′]** A *validation* API can itself be the mutation hazard:
   nbformat's plain `validate()`/`reads()` repair id defects in memory at both pinned versions
   (F2–F5), even while its own docs call for non-mutation. Read paths must be chosen for
   non-mutation explicitly (`isvalid`, stdlib parsing), and no-mutation must be asserted against
   raw captured bytes, not assumed.

**Validation that follows** [PROPOSED-UNEXECUTED]: the fixture set in §8 must cover every tier
boundary of §3.2 (id-equal, id-differ, id-less↔id-ful, duplicate ids, missing-id-at-4.5+,
future-minor opaque cells, multiline representation variance) and assert **no content is ever
dropped or mutated** by comparison or recovery (anti-#597 guard, extended per C1′ to parsed
representations). No test has been executed; no pass is claimed.

---

## 5. Obligation specifications N1–N4 (N5 is the whole of §2–§8)

### N1 — Bounded capture/input contract; read-only comparison [CORRECTED per C1′, C4′]

[CHOICE] Inputs per case: two snapshot directories, each containing (a) the captured `.ipynb`
(byte-exact), (b) captured ordinary text files, (c) a manifest JSON recording for each member: path,
SHA-256, bytes, the notebook's declared `nbformat`/`nbformat_minor` as read from the captured
notebook, tracked/untracked status. The original workspace, snapshots and captures are read-only
during observation and recovery (brief).

**Dependency pin and API surface [CORRECTION per C1′]:** the prototype pins `nbformat==5.11.1`
(latest release at capture, F1) and relies only on the public surface
`{isvalid, normalize, get_validator, reader.get_version}`. Public `validate()` no longer accepts
`repair_duplicate_cell_ids`/`strip_invalid_metadata` (TypeError at ≥5.11.0, F1/F2); at v5.10.4 they
were deprecated-for-security (F5) — **the frozen proposal's `validate(...,
repair_duplicate_cell_ids=False)` recipe is obsolete and is replaced** by isvalid-style no-repair
validation.

**Parse-mutation discipline [CORRECTION per C1′]:** [SRC-IMPL] `nbformat.reads()` calls plain
`validate(nb)`, which fills missing ids and rewrites duplicate ids in memory at both v5.10.4 and
v5.11.1 (F2, F3, F4). The comparator therefore: (1) parses captured bytes with **stdlib `json`**
for its comparison tree; (2) treats the raw bytes as the only ground truth; (3) uses nbformat
`get_version`/`get_validator`/`isvalid` on stdlib-parsed dicts for declared-version and
conformance classification (`isvalid` at v5.11.1 itself deep-copies and asserts non-mutation, F2);
(4) never calls `reads()`/plain `validate()` on the object under comparison; (5) asserts raw-byte
equality after every operation (T9). [CHOICE] Optionally report [verbatim excerpt omitted; original artifact/source locator retained] via
`normalize()` on a deep copy (safe: `normalize()` deep-copies, F2).

Comparison reports **declared** versions from the parsed notebook and flags **unsupported or
defective inputs**, each as a named class: notebook major ≠ 4 (schema pins major=4, F6; brief scope
is v4); undecodable JSON; manifests missing members; mismatched manifest↔content hashes;
**duplicate cell ids at (4,≥5)** (`IDENTITY-AMBIGUOUS`); **declared ≥4.5 with a missing cell id**
(`MISSING-ID-AT-4.5+`, per C4′ — warned-only by nbformat, F2, but not silently accepted here);
future declared minor (processed opaquely with a [verbatim excerpt omitted; original artifact/source locator retained] note, [SRC-IMPL]
F2/F5 — not a failure). **What is unknown:** absent capture data (a member listed in a manifest but
not captured), unsaved editor buffers (excluded by brief), and anything untracked at capture time —
each leaves the corresponding question ([verbatim excerpt omitted; original artifact/source locator retained] / [verbatim excerpt omitted; original artifact/source locator retained] / "what else
existed?") unanswerable, and the report says so instead of guessing.

### N2 — Notebook observations (see §3.1–3.2)

Axes: source / outputs / metadata (+ execution-count in details), with C2′'s field-typed
multiline normalization; identity by per-cell-id-presence-and-declared-minor-gated matching
(strict id tier, content tiers labelled `MATCH=INFERRED`); `IDENTITY-AMBIGUOUS` on duplicate ids;
`MISSING-ID-AT-4.5+` on defective id-ful states; version conditions and normative-force labels
([SRC-REQ]/[SRC-QA]/[SRC-SUGGEST]/[SRC-IMPL]) preserved verbatim in the report footer.

### N3 — Workspace observations (see §3.3)

Ordinary text edits (hash/line diff); `RENAME-INFERRED` only under rule R1/R2 with the rule shown;
`UNRESOLVED` identity when candidates are ambiguous; `UNTRACKED-AT-CAPTURE` surfaced and excluded
from recovery; git's hedges ([verbatim excerpt omitted; original artifact/source locator retained], porcelain-only, off-switch condition) quoted in the
report's analogy note rather than imported as defaults.

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
the manifest. Recovery listing, if it parses the notebook at all, uses the N1 parse discipline so
the source workspace bytes are provably untouched (T8). [PROPOSED-UNEXECUTED] All recovery paths
are covered by T8.

---

## 6. Component comparison and recommendation (N5)

**Compared options for the comparison core:**

1. **Adopt `nbdime` as a library** for notebook diffing: [SRC] it already implements id-aware
   tiered matching (4.0.0, S5/S7b) and axis switches (S8). Costs: it brings a server/web/Lab
   surface and merge machinery we do not need; its automated merge resolution has a documented
   content-deleting failure (#597, open, S8) and its web differ a live stall bug (#787, open, S9);
   and its repo license record is [verbatim excerpt omitted; original artifact/source locator retained]/NOASSERTION (re-observed in F8), an unresolved dependency
   question (L1 — the LICENSE *text* remains unread in every stage of this case). It targets
   human-readable diffs/merges, not machine-reportable ambiguity ledgers.
2. **Adopt `nbformat` (validation/version negotiation) + a small in-house comparator** (~stdlib
   only, `difflib` for the inferred tier): [SRC-IMPL] nbformat gives exact declared-version schema
   selection, future-minor relaxation, and normative duplicate/missing-id behavior (F2, F5); the
   matching tiers are small because nbdime's PR #639 fixed their semantics as a *spec* (S7b).

**Recommendation:** option 2 — **nbformat pinned `==5.11.1` as the single notebook dependency,
comparator and recovery in-house**. **Concrete tradeoff:** we re-implement a narrow slice of
nbdime's cell matching (giving up its battle-tested rendering, merge strategies and edge-case
maturity) in exchange for a read-only, offline, dependency-light tool whose ambiguity and refusal
semantics are first-class outputs (N1–N4) and whose resolution behavior can never silently drop
content (#597 lesson). Pinning is load-bearing, not cosmetic: the relied-on validation surface
changed in 5.11.0 (C1′), so the pin plus the explicit API-surface list is what makes the plan's
validation behavior reproducible. Git rename detection is retained as the **analogy** for N3's rule
shape (observed vs. inferred rename; bounded, configurable detection, S10/F9) with its numeric
defaults **not** imported ([verbatim excerpt omitted; original artifact/source locator retained] is git's own hedge). `nbconvert`'s
ClearOutputPreprocessor (S12) is retained only as precedent for output-adjacent metadata
classification and rejected as a component (it mutates). [CHOICE] Any future reconsideration of
nbdime-as-library must first resolve its license text and re-check #597/#787 status (L1, L2).

**Why the analogies/extra options were retained or rejected (METHOD.md):** git (neighboring VCS use
case) retained for the rule shape only — it cannot transfer defaults across domains, and its own
release notes document a pairing regression (S10), which is exactly why R1/R2 are labelled and
UNRESOLVED-fallback. nbconvert (neighboring notebook-hygiene use case) retained as classification
precedent, rejected as code because mutation is disqualifying under the brief's read-only
constraint. Neither analogy is assumed to guarantee behavior.

---

## 7. Revised thin plan — implementation steps (replaces `inputs/THIN_PLAN.md` steps 1–4)

1. **Capture contract** (N1): manifest schema (path, SHA-256, bytes, declared
   `nbformat`/`nbformat_minor`, tracked/untracked per member); snapshot dirs immutable; dependency
   pin `nbformat==5.11.1` with API surface `{isvalid, normalize, get_validator, reader.get_version}`;
   named unsupported/defective input classes (major ≠ 4; undecodable JSON; manifest/member mismatch;
   duplicate ids at ≥4.5; missing id at ≥4.5; future minor → opaque, with note); unknown-data
   reporting.
2. **Notebook comparator** (N2): stdlib-JSON parse of captured bytes (no library mutation on the
   comparison path); `get_version` at the declared minor; `isvalid()` for conformance
   classification; per-cell-id-presence + declared-minor gate; strict id tier → content tiers
   (`MATCH=INFERRED`) → opaque tier for future minors; three-axis observations with field-typed
   multiline normalization (source, non-JSON mimebundle values, `stream.text`); ambiguity ledger
   (`IDENTITY-AMBIGUOUS`, `MISSING-ID-AT-4.5+`, INFERRED-position ambiguities); footer with
   version conditions + force labels. [CORRECTION] The thin plan assumed "visible identity
   ambiguity" could be designed generically; the source evidence says ambiguity classes are
   version- and presence-specific (duplicate ids a (4,≥5) phenomenon; missing ids a defective-4.5+
   phenomenon; absent ids a <4.5 phenomenon — F2, F5, F6, F7) and must be enumerated per class.
3. **Workspace differ** (N3): hash-based observations; R1 (exact-hash) default rename inference,
   always labelled; θ-similarity rule off by default (L3: calibrate on fixtures; no git numeric
   default imported — [verbatim excerpt omitted; original artifact/source locator retained] stays git's hedge); UNRESOLVED identity reporting;
   `UNTRACKED-AT-CAPTURE` surfaced, excluded from recovery.
4. **Copy-only recovery** (N4): new-destination refusal, missing-content refusal (list paths),
   collision refusal, unwritable-parent refusal before any writes, hash-verified copy, untracked
   excluded; recovery listing obeys the N1 parse discipline.
5. **Fixture set and checks** (thin-plan step 4, concretized in §8), all read-only-side-effect-free,
   with the anti-#597 no-drop/no-mutate assertion (extended per C1′ to parsed representations and
   raw bytes) as a first-class check.

[CORRECTION] Thin-plan sentence [verbatim excerpt omitted; original artifact/source locator retained] is revised to "present
version-gated, presence-gated, axis-separated observations with an explicit ambiguity and unknowns
ledger" — justified by F2/F5/F6/F7 (version + presence conditions) and S6–S7b (identity precedence
questions).

---

## 8. Discriminating validation plan — all checks [PROPOSED-UNEXECUTED]

Each fixture pairs two synthetic snapshots and one assertion that a naive (index-only or
content-only, or mutation-oblivious) comparator would fail. **No check below has been executed in
this case; none may be reported as passing without an admitted execution receipt.**

- **T1 version gate:** states at minor 4.4 vs 4.5 ⇒ declared versions reported; id-less↔id-ful
  cells match only in the inferred tier (`MATCH=INFERRED` labels present; no strict-tier match).
- **T2 output-only change:** same sources, different outputs ⇒ exactly one `outputs` observation.
  Preconditions (per critique §5 and C2′): the fixture leaves `execution_count` and the
  `collapsed`/`scrolled` metadata keys equal/absent (ClearOutputPreprocessor semantics, S12, would
  otherwise fire the details/metadata axes too); T2b sub-case pins the multiline rule — a
  `text/plain` mimebundle value `["a","b"]` in state A vs `"a\nb"` in state B must yield **no**
  output observation, while a real value change must still fire.
- **T3 metadata-only change:** `tags` added ⇒ only the metadata axis fires.
- **T4 duplicate ids (4.5) — restated per C1′:** fixture with duplicate ids; comparator performs no
  repair and no mutation; both cells `IDENTITY-AMBIGUOUS`; conformance classification uses
  **`isvalid()` at the pinned version** (which requests no-repair internally) — the frozen recipe
  [inline excerpt omitted; original artifact pin retained] is a TypeError at ≥5.11.0 and must not be used;
  nothing on the path may call `reads()`/plain `validate()` on the fixture, or the ids are
  rewritten before the assertion and the test can pass spuriously.
- **T5 reorder with stable ids:** id-matched with order delta; no insert/delete observations.
- **T6 rename inference:** delete(a)+add(b) with equal hash ⇒ single `RENAME-INFERRED(a→b)`; two
  equal-hash candidates ⇒ `UNRESOLVED` with both listed; rule R1 named in output.
- **T7 untracked:** file marked untracked at capture ⇒ surfaced, excluded from recovery output.
- **T8 recovery refusals:** existing destination ⇒ refuse; manifest member missing ⇒ refuse with
  paths; happy path ⇒ byte-and-hash-verified copy and **source workspace raw-byte/hash unchanged**
  (same parse discipline as T4 if the notebook is parsed during listing).
- **T9 no-drop/no-mutate guard (anti-#597, extended per C1′):** for every fixture, comparison and
  recovery together (a) never mutate inputs — asserted against **raw captured bytes**, not just
  in-memory objects; (b) omit no captured cell/file from the report or the recovered tree; and (c)
  leave every parsed representation equal to its pre-parse deep copy.
- **T10 missing-id-at-4.5+ (new, per C4′):** a declared-4.5 state with an id-less cell ⇒
  `MISSING-ID-AT-4.5+` flagged; the cell joins the content tier; `isvalid()` returns True for the
  state (matching [SRC-IMPL] F2/F5) while the prototype still surfaces the class; no repair.

Success criterion: all T1–T10 pass in a later implementation stage. This stage asserts nothing as
passed.

---

## 9. Source fact vs. inference vs. product choice — boundary summary

Source obligations bind only what they say, under the conditions and normative force quoted:
schema conformance, id requiredness at ≥4.5, syntax/length, and within-notebook uniqueness are
**[SRC-REQ]** (F6, F7); id stability is **[SRC-QA]** (JEP Q6); split id behavior is
**[SRC-QA]/[SRC-SUGGEST]** (JEP Q1/Q9); nbdime's tiers, nbformat's repair defaults, future-minor
relaxation and warning behavior are **[SRC-IMPL]** of pinned versions (S7b, F2, F5) — not format
guarantees; `diff.renames` is porcelain-only and `diff.renameLimit`'s default is [verbatim excerpt omitted; original artifact/source locator retained] 1000
(F9); id uniqueness is per-notebook (F7). Everything in §3.2's labels, §3.3's R1/θ defaults, §5's
refusal codes, the `nbformat==5.11.1` pin/API-surface list and parse discipline, and §7's plan is
**product choice** on top of those facts, with the Q3 chain (§4) as traced engineering evidence.
Supported corrections to the thin plan and to the frozen proposal are marked **[CORRECTION]** and
are itemized with their critique points in §0; the false proposition they replace (UNRESOLVED_LEADS
L5's [verbatim excerpt omitted; original artifact/source locator retained]) and the obsolete `validate(...,
repair_duplicate_cell_ids=False)[inline excerpt omitted; original artifact pin retained]out/UNRESOLVED_LEADS.md`
rewritten accordingly. Remaining unresolved consequential dependencies (L1 license text, L2 open
upstream failures, L3 θ calibration, L4 capture-tool trust, L5 rewritten drift risk, L6
library-mediated future-minor semantics, L7 validator-backend variance) are kept visible there and
block no step of this plan except where each lead itself states a precondition.
