# V8-NB-AMEND-C-L — Research proposal (revised thin plan)

Deliverable: revision of `inputs/THIN_PLAN.md` for an offline desktop prototype that compares two explicitly captured saved workspace states (one nbformat-4 `.ipynb` + two ordinary text files, each snapshot storing the declared notebook minor version and a workspace manifest) and copies a selected state into a new destination directory. This is a research-backed plan only — nothing here has been implemented or executed.

**Claim classification** used throughout:

- **[S-req]** — normative source requirement (conditions/exceptions preserved at the citation).
- **[S-fact]** — descriptive source fact (behavior, changelog, issue history).
- **[S-opt]** — source-documented optional/example behavior, not an obligation.
- **[INF]** — engineering inference from sources.
- **[CH]** — product choice (this prototype), not sourced from any normative document.
- **[FIX]** — supported correction to `inputs/THIN_PLAN.md`.
- **[PROPOSED]** — test/behavior planned but never executed; no execution receipt exists for any check in this document.

**Excluded scope** (per brief): continuous watching, collaborative editing, remote sync, unsaved editor buffers, whole Git history repair, executable notebook evaluation. Offline only; originals, repository metadata and snapshots are read-only; recovery never resets/checks-out-over/merges into/rewrites the original workspace.

---

## 1. Source register (all captured 2026-10-03, public HTTPS, exact-response-body captures by the host)

| # | Locator | Version/ref | Capture |
|---|---|---|---|
| S1 | `jupyter/nbformat`, `nbformat/v4/nbformat.v4.schema.json` (raw GitHub) | repo `main`, file self-describes as "Jupyter Notebook v4.5 JSON schema" | 2026-10-03T03:19:09Z, sha256 `523e3578…71a` |
| S2 | `jupyter/nbformat`, `CHANGELOG.md` (raw GitHub) | repo `main`; newest entry 5.11.1 (2026-08) | 2026-10-03T03:19:10Z, sha256 `414e10d3…0ab` |
| S3 | `jupyter/nbformat`, `tests/test_validator.py` (raw GitHub; blob sha `cbf2fe24575a6fc82cfacdd17557fb9317a39712`) | repo `main` | 2026-10-03T03:21:29Z, sha256 `1d5990ad…6cc` |
| S4 | `jupyter/nbformat`, `tests/` directory listing via GitHub contents API (fixtures `invalid_unique_cell_id.ipynb` 738 B, `v4_5_no_cell_id.ipynb` 573 B, `invalid_cell_id.ipynb`, `no_min_version.ipynb`) | repo `main` | 2026-10-03T03:20:46Z, sha256 `6479f99c…55c` |
| S5 | GitHub issue `jupyter/nbformat#235` "Validation should not mutate arguments" (opened 2021-11-16 by @Carreau; state **open** at capture) | issues API | 2026-10-03T03:20:09Z, sha256 `40420f0c…7fe` |
| S6 | GitHub PR `jupyter/nbformat#236` "Start working on mutation issues in validate." ("Step 1 toward #235", created 2021-11-16, closed 2022-06-08) + issue search results also surfacing `#359` (warning text; `normalize()` "available since nbformat 5.1.4") and `#243` (duplicate cell ids observed to mutate notebook under validate) | issues API | 2026-10-03T03:19:11Z / 03:20:47Z, sha256 `b0cea14b…dbf` / `86220959…334` |
| S7 | `jupyter/nbdime`, docs `latest` (= 4.0.4), pages `index.html` and `diffing.html` (readthedocs) | nbdime 4.0.4 documentation | 2026-10-03T03:20:47Z, sha256 `1d7168f5…eae` / `980eadb9…222` |
| S8 | `jupyter/nbdime`, `CHANGELOG.md` (raw GitHub) | repo `main`; newest entry 4.0.4 | 2026-10-03T03:20:10Z, sha256 `1d3c90cd…8a3` |
| S9 | `git/git`, `Documentation/diff-options.adoc` (raw GitHub) | repo `master` | 2026-10-03T03:21:30Z, sha256 `f12f2f62…303` |

Python `difflib.SequenceMatcher` (used in §3.3 as an alignment primitive) is cited as an engineering-inference precedent only; its docs were not separately captured in this stage, so no normative claim rests on it. **[S-fact]/locator discipline**

---

## 2. Q1 — Which two existing components offer useful precedents, and what version-specific behavior supports a minimal approach?

**Components compared (independently discovered, no evaluator list): A = `nbformat` (Jupyter notebook schema/validator, latest 5.11.1 per S2); B = `nbdime` (Jupyter notebook diff/merge, latest 4.0.4 per S7/S8).** A third precedent (Git rename detection, S9) is used only for the file-rename rule in §4.

### 2.1 What each source establishes

**nbformat (S1):**
- Top-level required keys: `metadata`, `nbformat_minor`, `nbformat`, `cells`. `nbformat` is an integer with `minimum: 4, maximum: 4`; `nbformat_minor` "Incremented for backward compatible changes to the notebook format" **[S-req, S1]**.
- In the 4.5 schema, every cell type (raw/markdown/code) **requires** `id`; `cell_id` is a string matching `^[a-zA-Z0-9-_]+$`, `minLength: 1`, `maxLength: 64` **[S-req, S1, conditioned on the notebook being declared 4.5+ — earlier minor-version schemas (4.0–4.4, also shipped in the repo) do not require `id`]**.
- Code cell additionally requires `source`, `outputs` (array of `execute_result`/`display_data`/`stream`/`error` outputs) and `execution_count` (integer or null) — this is what makes source/output/metadata separation structurally well-defined **[S-req, S1]**.
- Cell `metadata.name`: "Cell names are expected to be unique across all the cells in a given notebook. This criterion cannot be checked by the json schema and must be established by an additional check." **[S-req + explicit exception, S1]** — a normative acknowledgment that not all identity guarantees are schema-enforced.
- `unrecognized_cell`/`unrecognized_output` definitions preserve cells/outputs from *future* minor revisions **[S-fact, S1]**: forward minors must not crash comparison.

**nbformat behavior as tested (S3, current `main`):**
- `test_should_warn`: a 4.5 notebook with a deleted cell `id` validates with `MissingIDFieldWarning` and `isvalid(nb) is True` — missing id is currently a **warning, not an error**, through `validate()` **[S-fact, S3]**.
- `test_non_unique_cell_ids` / `test_no_cell_ids`: with `repair_duplicate_cell_ids=False` (internal `_validate`), duplicate or missing ids raise `ValidationError`, and the test re-runs validation to assert the notebook was **not modified** **[S-fact, S3]**.
- `test_repair_non_unique_cell_ids` / `test_repair_no_cell_ids`: `validate()` by default repairs (warns `DuplicateCellId` / `MissingIDFieldWarning`) and then passes **[S-fact, S3]**.
- `test_is_valid_should_not_mutate`: `isvalid()` neither mutates nor autofixes **[S-fact, S3]**.
- `test_notebook_invalid_without_min_version`: a v4 notebook missing `nbformat_minor` fails validation (matches S2 5.7.2 "Only require nbformat_minor for v4") **[S-fact, S2+S3]**.
- `test_future`: a notebook from a future minor fails when forced to validate at (4,3) and passes at its own declared version — version must be read from the document, not assumed **[S-fact, S3]**.

**nbdime (S7/S8):**
- "content-aware" diffing/merging of notebooks; understands notebook structure; "auto-resolving conflicts on generated values such as execution counters" **[S-fact, S7 index]** — direct precedent for treating `execution_count` as noise, not a real change.
- Diff format (S7 `diffing.html`): a diff is a list of ops; mapping ops `add`/`remove`/`replace`/`patch` (string key); sequence ops `addrange`/`removerange`/`patch` (integer index into base A); recursive `patch`; JSON-Patch-like but a tree of lists; a JSON schema (`diff_format.schema.json`) exists for validating diff entries. `to_json_patch` is "currently a draft … not yet covered by tests" **[S-fact + explicit source caveat, S7]**.
- **Version-specific identity fact:** "Add support for using cell ID in diffing and merging" landed only in **nbdime 4.0.0** (PR #639, per S8; release window 2023-10/11 per contributor dates). Before 4.0.0, nbdime aligned cells without cell IDs. **[S-fact, S8]** — i.e., the ecosystem itself transitioned from heuristic alignment to id-aware alignment, and tools built on older nbdime do not inherit id-based identity.

### 2.2 Comparison and verdict

| Dimension | nbformat 5.11.x | nbdime 4.0.4 |
|---|---|---|
| Notebook change observation | Schema/validation only; no diff | Content-aware notebook diff/merge **[S-fact, S7]** |
| Cell identity | Normative: `id` required at 4.5+, pattern/length, duplicates rejectable (warning/error split per S3) | Id used in diff/merge **only since 4.0.0** (PR #639) **[S-fact, S8]**; older releases align heuristically |
| Source/outputs/metadata separation | Structural fields in schema (S1) | Ops address the notebook tree, so per-field diffs fall out (`patch` on `source`/`outputs` keys) **[S-fact, S7]** |
| Version handling | Explicit per-minor schemas; `nbformat_minor` semantics; upgrade tooling (5.1.1 "upgrade minor 4.x versions to 4.5", S2) | Reads notebooks via nbformat; no independent version normativity |
| File (non-notebook) diff/rename/recovery | None | None (notebook-only tool) |
| Recovery/copy semantics | None | None (merge targets working files, not a new directory) |

**Recommendation (bounded approach): use nbformat as the normative identity/version layer and implement the diff, rename inference and copy-recovery logic ourselves (~small prototype), borrowing nbdime's two design precedents — (a) a path-addressed structural diff with a small typed op set (S7 diffing.html), and (b) auto-resolving execution counters as noise (S7 index).** **[CH]** Tradeoff accepted: we re-implement a small diff instead of importing nbdime. Reasons: nbdime has no file rename/untracked handling and no copy-recovery (the deliverable's core), and depending on it would import an alignment policy (pre-4.0 heuristic vs 4.0+ id-based) that changes silently with version; nbformat gives us exactly the normative layer (version declaration, id validity, duplicate detection) that our identity rules in §3 need, and nothing more. What we give up: nbdime's battle-tested line-level word diffs inside sources — for a two-snapshot prototype this is replaceable by any line-diff primitive. **[CH]** Alternative rejected: building only on nbdime (insufficient: no version normativity, no file/rename/recovery); building only on nbformat (insufficient: no diff at all). **[FIX]** The thin plan's "choose the minimal comparison/recovery components" assumed such components exist off-the-shelf; research shows no single component covers notebook identity + file rename + recovery, so the plan is corrected to *compose* nbformat (normative layer) with prototype-owned diff/recovery. **[FIX]**

---

## 3. Q2 — Distinguishing notebook source/output/metadata changes; cell identity when version/identifier conditions differ; file renames/untracked/limits

### 3.1 Capture/input contract (N1)

Each snapshot stores: the notebook file, its **declared** `nbformat` and `nbformat_minor` taken from the document (never defaulted silently — a v4 notebook missing `nbformat_minor` is invalid per S3 `test_notebook_invalid_without_min_version` **[S-fact]**, and our prototype must report that rather than guess **[CH]**), a manifest of the two text files (path → content hash), and the raw file contents. **[CH]**

Unsupported inputs, reported as errors: major version ≠ 4 (schema `maximum: 4` **[S-req, S1]** — the v4 schema cannot validate them; v1–v3 exist in nbformat but are out of scope by the brief's "version-4 .ipynb"); JSON that is not a notebook; missing `nbformat_minor` on v4. Cell ids failing `^[a-zA-Z0-9-_]+$` or length 1–64 are reported as invalid ids (cf. S3 `test_invalid_cell_id`) but do **not** abort comparison — they demote that cell to identity-by-position **[CH]**.

**What absent capture data leaves unknown (stated, not papered over):** if a snapshot did not record a file's content, its diff is unknowable (we report `content-missing`, never infer it); outputs/metadata differences are only observable where both snapshots stored them; nothing in either snapshot reveals *unsaved* editor state (excluded by brief) — a saved-state comparison is silent about it by construction, and we will not claim otherwise **[CH]**. If the two snapshots declare different minors, identity rules degrade as in §3.3(c) and the report says so.

### 3.2 Notebook change observations (N2)

Observations are computed on the parsed notebook trees and expressed in a typed, path-addressed op set modeled on nbdime's mapping/sequence ops (S7) **[CH]**:

- `source.changed(cell_ref, old, new)`, `outputs.changed(cell_ref, detail, old, new)` (including `execution_count`-only changes, which are **downgraded to noise** following nbdime's "auto-resolving conflicts on generated values such as execution counters" precedent **[S-fact, S7 index; classification of noise as default: CH]**, surfaced as an optional view), `metadata.changed(notebook|cell, key, old, new)`, `cell.added/removed(cell_ref, position)`, `cell.moved(old_pos, new_pos)`.
- Separation guarantee: an edit to `source` alone never marks outputs/metadata changed, and vice versa — this falls out of comparing the three fields independently, which the schema's structure makes well-defined (S1) **[INF]**.

### 3.3 Cell identity and matching (N2, with version/identifier conditions preserved)

**(a) Both states declared ≥ 4.5, all ids present, valid and unique** — this is the only regime where nbformat's normative identity applies: `id` is a required, pattern-checked, length-bounded field (S1) **[S-req conditioned on minor ≥ 5]**. Join cells by `id`. Same id + equal field hashes → unchanged; same id + differing `source`/`outputs`/`metadata` → per-field changed; id present on one side only → added/removed; same id with different `cell_type` → matched but flagged. **[CH]**

**(b) Duplicate ids within a state** — the schema cannot enforce uniqueness across `oneOf` branches and cell-level `name` uniqueness is explicitly outside schema-checkable power (S1) **[S-req + exception]**; nbformat's own validator rejects duplicates only when repair is disabled and otherwise warns-and-repairs (S3) **[S-fact]**. Our prototype never repairs: cells involved in a duplicate id are matched by position/content-similarity and the ambiguity is **reported, not silently resolved** — silent resolution is precisely the failure mode of nbformat #235 (§5) **[CH; lesson traceable to S5]**.

**(c) Versions below 4.5, or a mixed pair (one state ≥ 4.5, one < 4.5), or absent/invalid ids** — no normative id identity exists (id is not required in the 4.0–4.4 schemas; cross-version id comparison is meaningless when one side has no ids) **[S-fact, S1's per-minor schemas + INF on cross-version comparison]**. Fall back to similarity alignment of the cell sequence (position plus source-similarity, `difflib.SequenceMatcher`-style) **[INF]**; every alignment produced this way is labeled `matched-by-heuristic` with the ambiguity surfaced. nbdime's own history is the cautionary precedent: id-based diffing only arrived in 4.0.0 (S8), so heuristic alignment is the norm, not a corner case, for pre-4.5 material **[INF from S8]**.

**(d) Reordering** — matched pairs whose positions differ yield `cell.moved`; reordering alone produces no source/output/metadata change records **[CH]**.

**(e) Future minors** — unrecognized cells/outputs must not crash comparison (S1 defines `unrecognized_cell`/`unrecognized_output` precisely so they can be represented) **[S-req]**; we surface them as `unrecognized` observations **[CH]**.

### 3.4 Workspace/file observations (N3)

Manifest comparison over the two text files:
- Same path, same content hash → unchanged; same path, different hash → `text.changed` (line-level diff displayed, hash asserted) **[CH]**.
- Path present only in snapshot 1 → `file.deleted`; only in snapshot 2 → `file.added`.
- **Rename:** an observed delete+add pair with **byte-identical content hashes** is presented as `renamed(exact)` — but the observation and the inference are separate records: the *observed difference* is "path X gone, path Y appeared", the *inferred rename* is our chosen equivalence rule (exact content equality). This mirrors Git's rename detection, where `-M100%` "limit[s] detection to exact renames" and detection itself is threshold-based with "the default similarity index … 50%" (S9) **[S-fact, S9; our adoption of exact-only as default: CH]**. An optional similarity threshold (> 0) may be enabled for near-renames; any such match is reported as `renamed(similarity t)` and remains **exposed as unresolved identity** — the prototype never claims git-grade attribution, since our fixture corpus is far too small to tune a threshold **[CH]**. Unresolvable ambiguity (one deleted file, two equally similar additions) is reported as unresolved, never silently paired.
- **Untracked file:** present in snapshot 2 with no baseline entry → `untracked`; its content is recoverable (if captured) but has **no diff**, and the report says exactly that **[CH]**.

---

## 4. Q3 — Real implementation failure with a traceable issue → fix → test history

**Failure: `nbformat.validate()` mutated the notebook it was validating (silently adding/repairing cell ids), breaking callers that sign-then-save.**

- **Issue:** `jupyter/nbformat#235` "Validation should not mutate arguments" (opened 2021-11-16, S5): "if a code cell has a missing id, it will silently add one to it … it mutates arguments … create[s] signing issues, indeed validate is called when writing and most notebook manager[s] … compute signature, save … They assume that what you save is identical to what you give to nbformat, but as validate mutates things it is untrue." **[S-fact, S5]**
- **Fix chain:** PR `#236` "Start working on mutation issues in validate." — "Step 1 toward #235" (created 2021-11-16, closed 2022-06-08, S6). Released as: nbformat **5.2.0** "Only fix cell ID validation issues if asked" (S2); `normalize()` split out as the explicit repair path — "available since nbformat **5.1.4**" per the validator warning text quoted in issue `#359` (S6); **5.5.0** deprecated `validate()`'s auto-fix arguments on the stated grounds that "`validate()` is a function that is core to the security model of Jupyter. Callers rely on it not mutating its argument" and "validation will fail instead of silently modifying an invalid notebook" (S2); **5.11.0** removed the deprecated kwargs entirely (PR `#447`, S2). Supporting context: issue `#243` records that duplicate cell ids caused a validation error *and* an in-place modification of the caller's notebook (S6). **[S-fact, S2+S6]**
- **Tests (verified present on `main`, S3):** `test_non_unique_cell_ids` and `test_no_cell_ids` assert `ValidationError` with `repair_duplicate_cell_ids=False` and re-run validation twice to assert no mutation; `test_repair_non_unique_cell_ids` / `test_repair_no_cell_ids` assert warning-gated repair only when asked (`DuplicateCellId`, `MissingIDFieldWarning`); `test_is_valid_should_not_mutate` asserts `isvalid()` neither mutates nor autofixes. Dedicated fixtures exist: `tests/invalid_unique_cell_id.ipynb`, `tests/v4_5_no_cell_id.ipynb` (S4). Honest residual: `test_should_not_mutate` for `validate()` itself is `@pytest.mark.skip` ("Does not work in all architectures") — the strict no-mutation guarantee for the public `validate()` is asserted indirectly, not universally **[S-fact, S3]**.

**Scoped engineering lesson:** observation/inspection functions must be side-effect-free; repair must be an explicit, separately-named operation on a copy. Applied here: our prototype's compare step never mutates either snapshot and never rewrites ids; "repair" does not exist — ambiguity is reported (§3.3(b)). **[INF; prototype adoption: CH]**

**Validation that follows (PROPOSED, unexecuted):** our fixture F12 (§6) replicates the no-mutation assertion pattern of S3 (`deepcopy` before compare, equality after) against our own diff code, and F6/F7 replicate the missing-id and duplicate-id fixtures (`v4_5_no_cell_id.ipynb`, `invalid_unique_cell_id.ipynb`) against our matching rules. We claim these as *designed* checks only — no execution receipt exists.

---

## 5. Recovery design (N4)

Recovery copies the **explicitly selected** snapshot into a destination directory that does not exist beforehand **[CH]**:

- **Existing-destination refusal:** if the destination path exists (file or directory), refuse; no merging, no overwrite, no resume. **[CH]** (The brief requires refusal; refusing any existing path, not just non-empty ones, is the strict choice.)
- **Missing snapshot content:** if the manifest references content absent from the capture, refuse with a list of the missing entries — never recover a partial state silently and never promise recovery of uncaptured content **[CH; brief N4]**.
- **Untracked files:** recovered from captured content; if content is absent, they are listed as unrecoverable **[CH]**.
- **Name collisions:** two capture entries resolving to the same destination name (e.g., an exact rename where both old and new paths were captured) refuse with both sources named; the user must re-select **[CH]**.
- Original workspace, repository metadata and snapshots are opened read-only; recovery writes only under the new destination **[CH; brief]**. What is recoverable is exactly: captured file contents + the captured notebook, verbatim; what is *not* recoverable: anything uncaptured (unsaved buffers, git history, outputs stripped before capture) — the report distinguishes "recovered" from "not present in capture" **[CH]**.

---

## 6. Revised implementation steps and discriminating validation (replacing THIN_PLAN steps 1–4)

**Steps** (each traced to the section above):

1. Parse + validate inputs against the captured snapshot contract; report declared `(nbformat, nbformat_minor)`; refuse major ≠ 4 and v4-without-minor (§3.1; S1, S3).
2. Implement the typed op set for notebook observations (§3.2; modeled on S7 diffing.html).
3. Implement identity resolution per §3.3 (id-join at 4.5+ with valid unique ids; heuristic fallback labeled as such; duplicates/ambiguity reported, never resolved silently).
4. Implement manifest/file observations incl. exact-hash rename inference and unresolved-identity surfacing (§3.4; precedent S9).
5. Implement copy-recovery with the refusal states of §5.
6. Run fixture set F1–F12; emit the comparison report + recovery result.

**Fixture set and discriminating assertions (all PROPOSED — unexecuted, no execution receipt):**

| Fixture | Discriminates |
|---|---|
| F1 identical states | empty observation set (no false positives) |
| F2 source-only cell edit | `source.changed` only; outputs/metadata untouched |
| F3 outputs-only change (incl. `execution_count` bump) | `outputs.changed`; `execution_count`-only variant classified as noise-with-visibility (S7 precedent) |
| F4 metadata-only change (root + cell) | `metadata.changed` only |
| F5 reordered cells (ids intact, 4.5) | `cell.moved` only — proves id-join is order-insensitive |
| F6 4.5 notebook with a cell missing `id` (mirrors `tests/v4_5_no_cell_id.ipynb`, S4) | missing-id cell matched by heuristic AND labeled ambiguous, no mutation (cf. S3) |
| F7 duplicate ids (mirrors `tests/invalid_unique_cell_id.ipynb`, S4) | ambiguity reported, no silent pairing, no mutation |
| F8 4.0-state vs 4.5-state | identity degraded to heuristic, version-mismatch note present (S1 per-minor schemas) |
| F9 exact rename of a text file | `renamed(exact)` inference recorded separately from delete+add observations |
| F10 untracked file | `untracked` with "no diff, content recoverable" |
| F11 recovery refusals ×3 | existing destination / missing blob / destination-name collision each refused with the right error |
| F12 no-mutation invariant | `deepcopy`-compare of both snapshots before/after compare+recover (pattern from S3 `test_is_valid_should_not_mutate`) |

Additional end-to-end check (PROPOSED): a dirty-by-construction pair (edit + rename + untrack + reorder + duplicate id) must produce every observation kind exactly once, and recovery of state 2 must reproduce its manifest hashes in the destination.

**Correction ledger for the thin plan:** [FIX-1] "choose the minimal comparison/recovery components" → no single component suffices; compose nbformat + prototype diff/recovery (§2.2). [FIX-2] plan had no identity rule → id-join/heuristic-fallback policy with explicit version conditions (§3.3). [FIX-3] plan had no rename semantics → observed difference vs inferred rename split with exact-hash rule (§3.4). [FIX-4] plan had no refusal states → §5's enumerated refusals. [FIX-5] plan promised "checks for the complete comparison-to-recovery path" without specifying them → F1–F12 with discriminating assertions; all unexecuted.

---

## 7. Boundary of this document

Source obligations and behaviors are cited with version/locator and capture coordinates in §1; every normative condition is stated with its citation (e.g., `id` requirements conditioned on minor ≥ 5; duplicate-id rejection tied to `repair_duplicate_cell_ids=False`; missing-id currently warning-level). Engineering inference, product choices and corrections are labeled. **No test in §6 has been run; no runtime behavior of the prototype is claimed.** Remaining consequential uncertainties are listed in `out/UNRESOLVED_LEADS.md`.
