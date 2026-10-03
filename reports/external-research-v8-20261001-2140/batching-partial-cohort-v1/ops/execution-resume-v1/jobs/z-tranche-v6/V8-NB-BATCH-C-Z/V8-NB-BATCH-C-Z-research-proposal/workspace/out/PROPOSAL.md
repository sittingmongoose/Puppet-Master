# V8-NB-BATCH-C-Z — Research-backed proposal: offline saved-state workspace comparison and copy recovery

Stage: research-and-proposal (Goal 1 of the case's sequential Goals). Deliverable is this revised plan, not an implementation. All arithmetic and all tests below are **UNEXECUTED**: this stage's admitted toolset (public-HTTPS capture, file read/write, mechanical line-map/render) includes no admitted deterministic arithmetic/execution tool, so every numeric derivation is shown as reasoned derivation and every validation is a proposal. No runtime result is claimed anywhere in this document.

**Label legend** (used throughout): `[SRC]` = fact read from a captured public source at the cited locator; `[INFER]` = engineering inference from source facts; `[CHOICE]` = product decision this proposal makes; `[PROPOSED]` = unexecuted discriminating test/validation; `[CORRECTION]` = supported rejection of an earlier (thin-plan) proposition.

**Research-order note** (short, per METHOD): (1) read case inputs; (2) pinned exact component versions via the GitHub releases API (nbdime v4.0.4, nbformat v5.11.1); (3) progressively retrieved primary artifacts at those tags — first identity/version and section locators, then expanded context for each consequential claim (diffing code, validator, changelog, schema, JEP, git docs); (4) discovered the issue → fix → test chain via issue search, then PR metadata, then the PR's file-level diffs (including reading the full captured file list beyond the first delivery window); (5) synthesized propositions and witness; (6) wrote this proposal.

---

## 1. Source register (exact locators)

All captures taken 2026-10-03 via admitted public HTTPS; sha256 are of the exact captured response bodies.

| # | Component / document | Locator | Capture sha256 (prefix) |
|---|---|---|---|
| S1 | nbdime release | GitHub API `repos/jupyter/nbdime/releases/latest` → tag **v4.0.4**, published 2026-02-10, release id 284863692 | `8bc19b50…` |
| S2 | nbdime v4.0.4 source | `nbdime/diffing/notebooks.py` at tag `v4.0.4` (raw.githubusercontent.com) | `bc9c5c5a…` |
| S3 | nbdime v4.0.4 source | `nbdime/diffing/generic.py` at tag `v4.0.4` | `7ed11454…` |
| S4 | nbdime issue | jupyter/nbdime issue **#553** "Support cell IDs" (opened 2020-12-03, closed 2023-11-01T12:17:52Z), from issues-search capture | `78121af9…` |
| S5 | nbdime PR | jupyter/nbdime PR **#639** "Add support for using cell ID in diffing and merging" (opened 2022-11-23, merged 2023-11-01T12:17:51Z, `merge_commit_sha` `c1ea9b9deb3b8ca2ea4471ffb616125b0024182b`, head `98843814cff07851b94a9690159db3c41a210c18`, 56 changed files, +1113/−258), body: "Fixes #553." | `724573ce…` |
| S6 | nbdime PR #639 files | `repos/jupyter/nbdime/pulls/639/files` (88,347-byte capture; includes file patches cited in §4) | `e29d50d2…` |
| S7 | nbformat release | GitHub API `repos/jupyter/nbformat/releases/latest` → tag **v5.11.1**, published 2026-08-17, release id 371605298 | `4e7c7592…` |
| S8 | nbformat v5.11.1 source | `nbformat/validator.py` at tag `v5.11.1` | `3db1fe48…` |
| S9 | nbformat v5.11.1 changelog | `CHANGELOG.md` at tag `v5.11.1` (entries 5.1.0, 5.1.1, 5.1.3, 5.2.0, 5.5.0 cited) | `414e10d3…` |
| S10 | nbformat v5.11.1 schema | `nbformat/v4/nbformat.v4.schema.json` at tag `v5.11.1` (schema description: "Jupyter Notebook v4.5 JSON schema.") | `523e3578…` |
| S11 | JEP-62 | `jupyter/enhancement-proposals` `62-cell-id/cell-id.md` at `master`, status **Implemented**, date 2020-09-25 | `7f52a9c2…` |
| S12 | Git docs | `git/git` at tag **v2.47.0**, `Documentation/diff-options.txt`, section `-M[<n>]` / `--find-renames[=<n>]` | `229d98a0…` |
| S13 | Git docs | `git/git` at tag **v2.47.0**, `Documentation/git-clone.txt`, `<directory>` option entry | `f2277b0b…` |
| S14 | nbdime issues (context) | issues-search captures: open issue **#597** "merge resolves conflict by deleting cells on both sides" (nbdime 3.1.0, notebook format 4.5); closed issue **#690** "Merge does not work for some notebooks" (error `Currently not able to handle decisions on variable "id"`, closed 2023-11-10) | `038ec2d7…`, `78121af9…` |

---

## 2. Research question 1 — two precedent components and version-specific behavior

### 2.1 Component A: nbdime v4.0.4 (notebook-aware comparison)

`[SRC]` (S2) The module docstring of `nbdime/diffing/notebooks.py` states the differ "assumes the notebooks have already been converted to the same format version, currently v4 at time of writing. Up- and down-conversion is handled by nbformat." This is the exact minimal posture our prototype needs: compare two *saved* v4 notebooks; treat format conversion as a separate concern owned by nbformat.

`[SRC]` (S2) nbdime separates notebook changes into explicit categories. `set_notebook_diff_targets(sources, outputs, attachments, metadata, identifier, details)` maps to paths `/cells/*/source`, `/cells/*/outputs`, `/cells/*/attachments`, `/metadata`, `/cells/*/metadata`, `/cells/*/outputs/*/metadata`, `/cells/*/id` (identifier), and `execution_count` (details). Output comparators deliberately skip metadata and execution count (`compare_output_approximate`/`compare_output_strict`: "NB! Ignoring metadata and execution count"), and cell comparators ignore "metadata, execution_count, outputs" when aligning cells.

`[SRC]` (S2) Cell alignment is a precedence-ordered predicate list on `/cells`: `[compare_cell_approximate, compare_cell_moderate, compare_cell_strict, compare_cell_by_ids]`, commented "in order of low-to-high precedence", run through `diff_sequence_multilevel` (S3), which computes alignment "snakes" level by level and then diffs the paired cells recursively. `compare_cell_by_ids(x, y)` returns true only if `'id' in x and 'id' in y and x['id'] == y['id']`, and `notebook_config.atomic_paths = {"/cells/*/id": True}` treats the id as an atomic value (replaced whole, never patched inside).

`[SRC]` (S3) Similarity fallbacks are concretely parameterized: `compare_strings_approximate` uses `difflib.SequenceMatcher` with `ratio() > threshold` after `real_quick_ratio`/`quick_ratio` cutoffs; approximate threshold 0.7, strict 0.95 (S2); and `compare_text_approximate` aligns any two strings shorter than `shortlen = 10` characters without comparing them ("Allow aligning short strings").

`[INFER]` Version-specific behavior supporting a minimal approach: nbdime demonstrates that a useful saved-state notebook diff needs only (a) version-conditioned cell identity, (b) per-field comparators that ignore execution noise, and (c) a bounded similarity fallback — no merge, no web UI, no history. The prototype can adopt the *shape* of this design at small scale.

`[CHOICE]` We do **not** depend on all of nbdime. The diffing module plus nbformat is the adopted surface (§7); nbdime's merge/web machinery is out of scope (the brief excludes collaborative editing and merge workflows).

### 2.2 Component B: Git v2.47.0 (repository snapshot comparison and recovery semantics)

`[SRC]` (S12) Git's rename detection, `Documentation/diff-options.txt` at v2.47.0, `-M[<n>]`/`--find-renames[=<n>]`: "If `n` is specified, it is a threshold on the similarity index (i.e. amount of addition/deletions compared to the file's size)… To limit detection to exact renames, use `-M100%`. **The default similarity index is 50%.**" This is a shipped precedent that a rename is an *inference under a configurable similarity rule*, not an observed fact.

`[SRC]` (S13) Git's clone documentation at v2.47.0, `<directory>` entry: "The name of a new directory to clone into… **Cloning into an existing directory is only allowed if the directory is empty.**" This is precedent for the recovery refusal rule in N4: create-only destinations, never write over an existing tree.

`[INFER]` Git also demonstrates the alternative baseline (plain text diff of files): adequate for the two ordinary text files, unusable as the notebook comparator because a v4 `.ipynb` is one JSON document where an outputs-only change rewrites many lines with zero source change — the exact noise nbdime's design exists to avoid (S2).

### 2.3 Comparison and recommendation (obligation N5, part 1)

| | nbdime v4.0.4 (notebook diffing) | Git v2.47.0 (text diff + rename detection) |
|---|---|---|
| Notebook semantics | Cell-level; source/outputs/metadata/id/details separated `[SRC]` (S2) | None: whole-file text diff `[SRC]` (S12) |
| Identity handling | Cell ids as highest-precedence alignment predicate; id treated atomically `[SRC]` (S2, S6) | Blob content identity; path identity only via similarity inference `[SRC]` (S12) |
| Rename handling | N/A (files not renamed by nbdime) | Similarity-index inference, default 50%, configurable `[SRC]` (S12) |
| Recovery semantics | None | Create-only destination rule `[SRC]` (S13) |
| Cost of adoption | Requires nbformat parsing; predicates need customization for our identity rule (§3) `[INFER]` | No notebook awareness; noisy on `.ipynb` `[INFER]` |

`[CHOICE]` **Recommended bounded approach:** use **nbformat v5.11.1** for parsing, declared-version reads, validation and (only if asked) normalization; implement the notebook comparator **modeled on nbdime v4.0.4's design** (multilevel cell alignment, per-field categories, atomic ids) with our own identity rule layered on top (§3.2); use **git-style line diff + a git-default 0.5 similarity threshold** for ordinary text files and rename inference. **Concrete tradeoff accepted:** reusing nbdime's shipped `diff_notebooks` directly would be faster to build but its shipped approximate/moderate predicates ignore cell ids (S2), so it cannot by itself enforce the identity semantics our brief needs (changed-id pairs must not silently count as edits-in-place); reimplementing the comparator keeps identity semantics fully controlled at the cost of owning edge cases that nbdime's own history shows are real (§4). We accept the reimplementation cost because identity correctness is the core product obligation (N2).

---

## 3. Research question 2 — observations, identity, renames, capture limits

### 3.1 Notebook change observations (obligation N2)

`[CHOICE]` Observations are reported per cell and per field category, directly mirroring the captured nbdime path taxonomy (S2): `source`, `outputs`, `attachments`, `metadata` (notebook-level, cell-level, output-level), `identifier` (cell `id`), `details` (`execution_count`). A single cell may produce several independent observations ("source changed", "outputs changed", "metadata changed"); a details-only change (e.g., only `execution_count` moved) is reported at details level and never as a source change.

`[SRC]` Version conditions that govern identity (all from captures):

- Cell `id` exists as a schema requirement only from nbformat **4.5**: the v4.5 schema (S10) makes `id` required on raw/markdown/code cells with `"pattern": "^[a-zA-Z0-9-_]+$", "minLength": 1, "maxLength": 64`; JEP-62 (S11): "The `id` field in cells would _always_ be **required** for any future nbformat versions (4.5+)."
- nbformat's validator gates id handling on the **declared** minor: `_normalize` runs the missing-id and duplicate-id checks only `if (version, version_minor) >= (4, 5)` (S8).
- Duplicate ids: when not repairing, nbformat raises `ValidationError("Non-unique cell id '<id>' detected.")`; `isvalid()` calls validation with `repair_duplicate_cell_ids=False`, so a notebook with duplicate ids is invalid (S8). When repairing (public `validate()` default in the captured v5.11.1 code), duplicates are replaced with generated ids and a `DuplicateCellId` warning is emitted — i.e., `validate()` **mutates** the notebook it is given (S8). The nbformat 5.5.0 changelog deprecates exactly this mutating behavior: "Callers rely on it not mutating its argument… validation will fail instead of silently modifying an invalid notebook" (S9); 5.2.0 had already narrowed it to "Only fix cell ID validation issues if asked" (S9).
- Identity semantics of ids: JEP-62 (S11) — ids stay "the same once created" (content edits do not change them); splitting a cell gives one part a new id; pasting must regenerate on collision; "Uniqueness across notebooks is not a goal"; and "Notebooks with the same source code can be generated with different cell ids, meaning they are not byte equal."

### 3.2 Identity and matching rule (the core algorithm)

`[CHOICE]` The prototype matches cells with the following explicit, version-conditioned rule:

1. **Id-anchored zone** (both snapshots declare `nbformat_minor >= 5`, or more precisely: the side's cells carry valid `id` fields): a pair of cells with equal `id` is the *same cell* (identity anchored); reordering is reported as a position observation, not a content change.
2. If both cells have ids and the ids **differ**, they are **not** the same cell — reported as one deletion + one insertion, even when sources are similar or identical. `[INFER]` Rationale: JEP-62 makes distinct ids mean distinct cells by construction, and nbdime's own merge tests only pass with "cell ids hinting that the cells are the same" (S6). Note `[SRC]`: nbdime's shipped v4.0.4 approximate/moderate predicates do **not** enforce this (they ignore ids; only `compare_cell_by_ids` uses them, S2) — the PR #639 description (S5) claims id-sensitivity in the two lower checks, but the shipped code we captured does not implement it there. Our rule is therefore stricter than shipped nbdime; this is a deliberate, stated product choice, and the discrepancy is recorded in `out/UNRESOLVED_LEADS.md`.
3. **Fallback zone** (either side declares `< 4.5`, or a cell legitimately has no `id`): align cells by a bounded similarity ladder modeled on nbdime's precedence list (S2): cell type must match; then strict source equality; then approximate source similarity (difflib-style ratio; short-string allowance of <10 chars retained). Every observation produced in this zone is flagged `identity: inferred` — the prototype never presents a content-based match as guaranteed identity.
4. **Ambiguity handling**: duplicate ids within one side make every match candidate that uses those ids ambiguous — the prototype reports `identity: ambiguous` listing all candidates and resolves nothing silently `[CHOICE]`, consistent with nbformat treating duplicates as a validation error when not repairing (S8). A cell with no counterpart candidate is reported as added/deleted with reason `no candidate under rule`.

`[INFER]` This rule keeps the useful part of nbdime's design (structure-aware, noise-free, similarity fallback for legacy minors) while giving identity guarantees nbdime's shipped predicates do not.

### 3.3 Ordinary files: edits, rename, untracked (obligation N3)

`[CHOICE]` For the two ordinary text files the primitive observation is **a path-level content difference** (line-wise diff). On top of it exactly one inference is allowed:

- **Rename inference (chosen equivalence rule):** a path present only in snapshot A paired with a path present only in snapshot B is reported as a *candidate rename pair* iff `similarity >= t`, with `t` a user-visible configuration defaulting to **0.5** following Git's documented default similarity index (S12). The similarity is computed on line-level add/remove counts against the larger file's size, mirroring the documented Git semantics ("amount of addition/deletions compared to the file's size", S12). The report always shows the score and the threshold used, and marks the observation `identity: inferred rename`.
- If the pair fails the threshold, it is reported as an unresolved pair: `deleted?` on the A-side path and `added?` on the B-side path — unresolved identity is **exposed, not hidden** (brief N3).
- **Untracked files:** the snapshot capture is filesystem-level, so a file untracked in the repository is still captured and compared; the manifest records the fact `repo_status: untracked` when the capture was repository-aware. If a capture configuration excluded untracked files, absence from the snapshot is reported as a **capture limit** (unknown), not as "no change" `[CHOICE]`.

`[INFER]` The essential discipline (from Git's design, S12) is that "renamed" is never asserted as an observed fact; the observation layer reports path differences and the inference layer applies one clearly labeled equivalence rule.

### 3.4 Capture limits and the unknown (obligation N1, part 2)

`[CHOICE]` Each report carries an explicit "what this comparison cannot know" section: (a) changes between the original workspace's live state and either snapshot (unsaved editor buffers are out of scope by the brief); (b) content of anything not captured (excluded paths, missing blobs); (c) identity of id-less or duplicate-id cells beyond the inference flag; (d) whether a same-content/id-less pair is "the same cell" in any authorial sense.

---

## 4. Research question 3 — real issue → fix → test chain

**Chain `[SRC]`** (all locators in the register):

- **Issue:** jupyter/nbdime **#553** "Support cell IDs" (S4, opened 2020-12-03): with nbformat implementing JEP-62 cell ids (nbformat PR #189), nbdime had to decide "whether we should use IDs as a high level indicator of cell identity when diffing", explicitly weighing "Should IDs take precedence over content?"
- **Fix:** PR **#639** "Add support for using cell ID in diffing and merging" (S5, "Fixes #553.", merged 2023-11-01, head `98843814…`): adds `compare_cell_by_ids` as the highest-precedence `/cells` predicate; makes `/cells/*/id` an atomic diff path; adds `/cells/*/source` linewise differ; renders cell id in terminal/web output; adds `'id'` to the merge model's allowlist in `packages/nbdime/src/merge/model/cell.ts` — the exact code path that raised `NotifyUserError('Currently not able to handle decisions on variable "id"')` reported in closed issue **#690** (S14).
- **Tests (from the PR's captured file list, S6):** merge tests previously marked `@pytest.mark.xfail` were enabled and rewritten with id-aware expectations — e.g. `test_merge_multiline_cell_source_conflict` with the new comment "Note: This only works with cell ids hinting that the cells are the same", and `test_merge_interleave_cell_add_remove`, `test_merge_conflicts_get_diff_indices_shifted`; previously `@pytest.mark.skip`ped `union`-strategy tests were enabled (`test_merge_notebooks_inline.py`); `nbdime/tests/utils.py` gained `deterministic_cell_ids(nb)` (assigning `cell-id-{i}`) replacing random seeding; new fixtures `nbdime/tests/files/cellids--base.ipynb` (and sibling local/remote fixtures) added; `test_prettyprint.py` now asserts the printed `id:` line.

**Scoped engineering lesson** `[INFER]`: content-similarity alignment alone could not make the merge heuristics correct — nbdime's own tests were `xfail` until cells carried identity hints, and identity had to be (a) treated as an atomic value, (b) given highest match precedence, and (c) allowlisted through every layer that touches cell fields, otherwise the system crashed (`#690`) rather than degrading. The transferable rules for the prototype: identity signals must be version-guarded (§3.2), atomic, and exercised by deterministic-id fixtures; and a crash on an unexpected field is a defect, not a defense.

**Validation that follows** `[PROPOSED]` (unexecuted): fixture F4/F6 and witness W below reproduce the #553/#690 class of conditions (changed ids, duplicate ids) against our rule; the reimplementation risk we accept in §2.3 is bounded by exactly this test set, which is modeled on the tests nbdime itself needed (S6).

---

## 5. Obligations N1–N4 (design commitments)

### N1 — Bounded capture/input contract, read-only comparison

`[CHOICE]` A **snapshot** is a read-only directory containing: the captured workspace tree (one declared-v4 `.ipynb` + ordinary text files, per the brief), plus `manifest.json`: `{workspace_id, captured_utc, capture_config, files: [{path, bytes, sha256, repo_status}], notebooks: [{path, declared_nbformat_major, declared_nbformat_minor, validation: {isvalid_result, errors[]}}]}`. Declared versions are read from the notebook's own `nbformat`/`nbformat_minor` keys `[SRC]` (schema-required fields, S10).

- **Read-only comparison:** comparing snapshots A and B opens both read-only and writes nothing outside the report `[CHOICE]`. Originals, repository metadata and snapshots are never mutated; comparison never runs nbformat's mutating default `validate()` on the snapshots — validation uses the non-repairing path (S8 `isvalid`) and any in-memory normalization for comparison purposes is explicitly labeled and never persisted `[CHOICE]`.
- **Unsupported inputs are reported, not repaired silently:** non-v4 declared major version, undecodable JSON, declared minor with no bundled schema (`get_validator` returns None path, S8), duplicate ids, or invalid id format (S10 pattern) — each produces a named input-error observation; the pair is compared where possible under the fallback rule.
- **What is unknown:** absent capture data (manifest entry with missing blob; excluded/untracked-not-captured paths) and unsaved editor state leave the corresponding observations `unknown` (§3.4). We never treat "not captured" as "unchanged" `[CHOICE]`.

### N2 — Notebook observations and identity

Covered by §3.1–3.2: per-cell source/outputs/metadata/attachments/identifier/details observations; id-anchored identity conditional on the declared minor and id presence; explicit `inferred`/`ambiguous` flags under absent or duplicate ids and under reordering; version conditions preserved verbatim (≥4.5 requirement, pattern, uniqueness-within-notebook) with sources S8/S10/S11.

### N3 — Workspace observations

Covered by §3.3: path-level edits; rename as labeled inference under a visible threshold rule (default 0.5, Git-precedented); untracked-file capture semantics; unresolved identity always surfaced as a pair with scores.

### N4 — Recovery to a new destination

`[CHOICE]` Recovery copies an **explicitly user-selected** snapshot into a **new destination directory**:

1. **Existing-destination refusal:** if the destination path exists and is non-empty, refuse with a named error and change nothing. Precedent `[SRC]` (S13): git clone v2.47.0 — "Cloning into an existing directory is only allowed if the directory is empty."
2. **Missing snapshot content:** any manifest entry whose blob is missing aborts the recovery **before any write** (pre-flight integrity check of all sha256s); nothing is partially created. A failed recovery due to integrity removes only what that recovery itself created in its own fresh destination.
3. **Untracked files:** recovered iff present in the selected snapshot's capture; otherwise listed as uncaptured-and-not-recoverable.
4. **Name collisions:** impossible across manifest entries in a fresh destination (paths are unique in a tree); duplicate manifest paths are a capture-time input error (N1) and refuse recovery.
5. **What is recoverable:** exactly the files recorded in the selected snapshot, byte-verified post-copy against manifest sha256s. **Never promised:** uncaptured content, unsaved editor state, repository history state, or any merge of the two snapshots `[CHOICE]`. The original workspace is never written, reset, checked out over, or merged into — recovery only ever creates the new directory `[CHOICE]` (brief).

---

## 6. Method artifacts: three propositions and the numerical witness

### 6.1 Condition-witness: three consequential propositions (one per research question)

| # | Proposition (current asserted finding) | Source / version | Applicability condition | Relevant exception | Normative force | Kind | Supported correction of earlier proposition |
|---|---|---|---|---|---|---|---|
| P1 | A minimal saved-state notebook comparator should be structure-aware per cell field with a bounded similarity fallback — nbdime v4.0.4's design is the precedent, and its module contract (v4 inputs, conversion owned by nbformat) matches this brief. | S2, S3 (nbdime v4.0.4 `diffing/notebooks.py`, `diffing/generic.py`) | Saved notebooks already at format v4; read-only diffing | Shipped approximate/moderate predicates ignore cell ids; strings <10 chars align without comparison — so shipped nbdime alone does not enforce our identity rule | Implementation behavior of BSD-licensed code (no standard's obligation); docstrings/comments only | Source evidence + engineering inference | `[CORRECTION]` Rejects thin plan step 1's implicit generic-diff assumption: a text-level diff of `.ipynb` conflates outputs/metadata noise with source edits; nbdime's deliberate skipping of metadata/`execution_count` (S2) is the supporting evidence. |
| P2 | Cell identity is version-conditional: `id` is schema-required only for declared nbformat ≥ 4.5 (pattern `^[a-zA-Z0-9-_]+$`, 1–64 chars, unique within the notebook); identity anchoring may be used only when the relevant side declares ≥4.5 and carries valid ids. | S10 (v4.5 schema in nbformat v5.11.1), S8 (`validator.py` gate `(4, 5)`), S11 (JEP-62), S9 (changelog 5.1.0) | Declared `nbformat_minor` of each snapshot's notebook; ids present and schema-valid | `validate()` in captured v5.11.1 repairs (mutates) missing/duplicate ids by default while `isvalid()` does not and fails duplicates; 5.5.0 changelog deprecates mutating validation (behavior is version-sensitive — pin it) | Standard-track: JEP-62 status "Implemented" + JSON-schema requirement (validation error); repair behavior is implementation, not spec | Source evidence + product choice (our rule stricter than shipped nbdime, §3.2) | `[CORRECTION]` Rejects the thin plan's unstated premise that every v4 notebook has stable cell ids: v4.0–4.4 minors legitimately have none, duplicates are real (#597-era notebooks on 4.5, S14), and same-source notebooks can carry different ids (S11). |
| P3 | Content-only cell alignment is insufficient for correct saved-state semantics: nbdime's own merge tests were `xfail` until cell ids served as identity hints, and the id field needed atomic treatment plus allowlisting end-to-end; the prototype must version-guard identity and test it with deterministic id fixtures. | S4→S5→S6 (issue #553 → PR #639 → test changes; related crash #690, S14) | Any comparator that infers cell correspondence between saved states | Mixed id-less/id-ful states need the labeled fallback (§3.2 zone 2); PR #639 description vs shipped v4.0.4 predicate behavior diverge (recorded as a lead) | Project history: merged fix + enabled tests (evidence of what was broken and what fixed it), not a spec | Source evidence + engineering inference | `[CORRECTION]` Rejects thin plan step 2's "visible identity ambiguity" as a presentational afterthought: ambiguity is an algorithm input (changed ids ⇒ delete+insert, duplicates ⇒ ambiguous), demonstrated by tests that only pass with id hints (S6). |

### 6.2 Numerical witness (UNEXECUTED — reasoned derivation, no admitted arithmetic tool was available)

**Interpretation being tested:** whether a changed cell id on an edited-but-similar cell counts as *one modified cell* or as *delete + insert (two cell-level changes)*. The two interpretations produce different change counts, which is exactly what our report must not leave ambiguous.

**Setup (own values, derived from captured constants):** snapshot A has one code cell `{id: "cell-id-0", source: "print(1)"}`; snapshot B has one code cell `{id: "cell-id-1", source: "print(2)"}`. Both sources are 8 characters long (len("print(1)") = len("print(2)") = 8), so both are below nbdime's `shortlen = 10` constant in `compare_text_approximate` (S2), where `if nx < shortlen and ny < shortlen: return True` aligns them **without any comparison**.

- **Competing interpretation 1 — content-similarity alignment (nbdime shipped fallback / generic text heuristic):** `compare_cell_approximate` requires equal `cell_type` (holds: code/code) and `compare_text_approximate(source_A, source_B)`; the short-string rule (<10 chars) fires, returning True; the cells are aligned, and the diff records one intra-cell patch on `/cells/0/source`. **Change count: 1** (one modified cell; no add/remove).
- **Competing interpretation 2 — id-anchored identity (our rule §3.2, and nbdime's `compare_cell_by_ids` predicate):** ids are both present and differ (`"cell-id-0" ≠ "cell-id-1"`), so the pair is never the same cell; the diff records one deletion of A's cell and one insertion of B's cell. **Change count: 2** (1 delete + 1 insert).

**What it discriminates:** interpretation 1 says "the user edited this cell"; interpretation 2 says "a different cell object replaced this one" — per JEP-62 distinct ids mean distinct cells (S11). Our rule selects interpretation 2 whenever both sides declare ids, and interpretation 1 (labeled `identity: inferred`) only in the fallback zone. **Verification proposal** `[PROPOSED]` (unexecuted): fixture F4 below must yield change count 2 under the shipped rule and F5 must yield 1 under the fallback; if a pinned nbdime build is ever substituted, re-run its `diff_notebooks` on F4 — per the captured v4.0.4 code the expected observed count there is 1 (alignment via the short-string rule), which is precisely the divergence our rule exists to close.

**Secondary witness for the rename threshold (UNEXECUTED, same status):** `notes.txt` (40 lines) becomes `notes_v2.txt` (46 lines) with 6 lines changed and 34 carried over; reasoned similarity ≈ 34/46 ≈ 0.74 > 0.50 (Git default, S12) → reported `inferred rename` at the default threshold; under an exact-blob rule (`-M100%` analog) it is delete + add with identity unresolved. This is the competing-interpretation pair F7 exercises.

---

## 7. Revised thin plan (replaces `inputs/THIN_PLAN.md` steps)

**Step 1 — Capture contract (revised from thin step 1).** Implement the snapshot + `manifest.json` contract of §5-N1, including declared-version reads and non-repairing validation via nbformat v5.11.1's `isvalid` path (S8). Record unsupported inputs as named errors. *Discriminating checks* `[PROPOSED]`: F0 capture→manifest round-trip hashes match; F10 pre-flight abort on missing blob leaves zero writes.

**Step 2 — Notebook observations (revised from thin step 2).** Implement the §3.2 identity rule and §3.1 category observations (nbformat for IO/schema; comparator re-modeled from nbdime v4.0.4 per §2.3). *Discriminating fixtures* `[PROPOSED]`: **F1** identical notebooks → zero observations; **F2** one cell with source edit + outputs change + metadata change → three distinct category observations; **F3** two cells reordered, ids stable → two position observations, zero content observations; **F4** changed id, similar 8-char sources → delete+insert (count 2), the witness case; **F5** declared 4.4 notebook (no ids), one of five cells edited → one `identity: inferred` modification via fallback; **F6** duplicate id in snapshot B → `identity: ambiguous`, no silent repair; **F11** only `execution_count` changed → details-level observation, not source.

**Step 3 — Text files, rename, untracked (revised from thin step 2).** Implement §3.3 with visible threshold. *Discriminating fixtures* `[PROPOSED]`: **F7** 34/46-similar rename pair → `inferred rename` at t=0.5, `deleted?+added?` at t=0.8 (threshold sensitivity shown); **F8** untracked file captured → observation includes `repo_status: untracked`, recovered on request; **F7b** pair below threshold → unresolved identity surfaced with score.

**Step 4 — Recovery (revised from thin step 3).** Implement §5-N4: explicit snapshot selection, create-only destination with refusal (git-clone precedent, S13), pre-flight integrity, byte-verified copy, never-promise list in every result. *Discriminating fixtures* `[PROPOSED]`: **F9** recovery into existing non-empty destination → refusal, destination untouched; **F10** manifest entry missing blob → refusal before any write; **F12** selected-snapshot recovery writes exactly manifest paths with matching sha256s and nothing else.

**Step 5 — Whole-path validation (revised from thin step 4).** *Discriminating end-to-end checks* `[PROPOSED]`: **T1** capture A → mutate workspace (edit cell source, reorder two cells, rename one text file, add untracked file) → capture B → run compare → assert the exact observation multiset (F2+F3+F7+F8 conditions); **T2** run compare with snapshots swapped (B,A) → observations mirror (deletions↔insertions) with identical identity flags; **T3** recovery from B into fresh dir → tree equals B's manifest (hash-verified) and original workspace bytes unchanged. All of T1–T3 and F0–F12 are **unexecuted proposals**; no pass/fail is claimed.

**Dependencies to pin:** nbformat == 5.11.x (validator behavior around repair is version-sensitive, S8/S9 — see leads), nbdime referenced at tag v4.0.4 for design precedent only (or, if reused as a library, pinned and predicate-audited per §2.3).

---

## 8. Distinguishing summary of claim kinds in this proposal

- **Source requirements/obligations:** schema-required `id` ≥4.5 (S10), JEP-62 identity semantics (S11), validator duplicate/missing-id handling and the `(4, 5)` gate (S8), git rename-threshold default and clone destination rule (S12, S13), nbdime v4 assumptions and comparator behavior (S2, S3).
- **Examples/optional behavior:** nbdime's rendering of ids, `union` strategy details, PR-description rationale (S5, S6) — illustrative, not adopted obligations.
- **Engineering inference:** the minimal-approach argument (§2), the lesson from #553→#639 (§4), threshold-transfer from git to our rename rule (§3.3).
- **Product choices:** our stricter changed-id ⇒ delete+insert rule; threshold default 0.5 exposed in config; refusal-based recovery semantics; nbformat+nbdime-modeled-reimplementation stack (§2.3, §3, §5).
- **Supported corrections:** P1–P3 corrections column (§6.1) — each rejecting a thin-plan assumption with cited evidence.
- **Proposed/unexecuted tests:** every F/T item and the §6.2 witnesses; none has been executed, and no execution receipt exists for them in this stage.
