# V8-NB-COND-C-Z — Research proposal: offline saved-state comparison and copy recovery for a notebook workspace

Stage: `V8-NB-COND-C-Z-research-proposal` (research ≤1800s portion of case V8-NB-COND-C-Z). Date of research: 2026-10-02.
Deliverable per `inputs/TASK.md`: research-backed revision of `inputs/THIN_PLAN.md`, answering the three brief questions (`inputs/BRIEF.md` Q1–Q3) and the five obligations N1–N5, comparing two existing components, and tracing one real issue → fix → test chain.

## 0. Method and epistemic labels

Pipeline: ordinary research → this proposal (a later, independent candidate critique and a bounded final correction follow in separate packaged stages per `inputs/TASK.md`; their artifacts are not part of this file).

Every consequential statement below carries one label:

- **[SRC]** — fact read from a captured public primary source, with an exact locator (repo @ tag/ref, path; issue/PR number; release). Conditions and exceptions preserved where the source states them.
- **[INF]** — engineering inference drawn from [SRC] facts; reasoning shown.
- **[CHOICE]** — prototype product decision not dictated by any source.
- **[UNEXECUTED]** — proposed test/arithmetic/fixture outcome, derived on paper only, never run. Per `inputs/METHOD.md`, arithmetic may be claimed executed only via an admitted deterministic tool; this stage's admitted `mechanical` tool exposes `line_map`, `render_sections`, `cache_source` operations only — none performs arithmetic — so **no arithmetic in this proposal is claimed as executed**, and no validation below is claimed as passed.
- **[CORR]** — correction to the thin plan or to an assumption in the brief's scenario, supported by [SRC] evidence.

Primary sources discovered and captured this stage (all retrieved 2026-10-02; no evaluator source list was supplied):

| # | Source | Exact locator |
|---|--------|----------------|
| S1 | nbformat v4.5 JSON schema | jupyter/nbformat @ tag `v5.11.1` (latest release, published 2026-08-17), `nbformat/v4/nbformat.v4.schema.json` |
| S2 | nbformat v4.4 JSON schema (pre-cell-id) | jupyter/nbformat @ `v5.11.1`, `nbformat/v4/nbformat.v4.4.schema.json` |
| S3 | JEP 62 "Cell ID Addition to Notebook Format" | jupyter/enhancement-proposals @ `master`, `62-cell-id/cell-id.md` (status: Implemented; PR #62) |
| S4 | nbformat validator source | jupyter/nbformat @ `v5.11.1`, `nbformat/validator.py` |
| S5 | nbformat changelog | jupyter/nbformat @ `main`, `CHANGELOG.md` (sections 5.1.0–5.11.1) |
| S6 | nbdime notebook differ source | jupyter/nbdime @ tag `v4.0.4` (latest release, published 2026-02-10), `nbdime/diffing/notebooks.py` |
| S7 | nbdime README | jupyter/nbdime @ `v4.0.4`, `README.md` |
| S8 | Git diff configuration docs | git/git @ tag `v2.47.0`, `Documentation/config/diff.txt` |
| S9 | Git 2.9 release notes | git/git @ `v2.47.0`, `Documentation/RelNotes/2.9.0.txt` |
| S10 | nbformat issue #216 | api.github.com `repos/jupyter/nbformat/issues/216` (closed 2021-04-02, state_reason completed) |
| S11 | nbformat PR #217 | api.github.com `repos/jupyter/nbformat/pulls/217` (merged 2021-04-02T04:39:13Z, merge commit `75f4f442952464c1ab9a6401e526163f2ee9b778`) |
| S12 | PR #217 file list (diff) | api.github.com `repos/jupyter/nbformat/pulls/217/files` |
| S13 | GitHub issue-search capture (nbformat, "cell ids") | api.github.com search, items #359, #328, #243, #400, PRs #426/#430 visible in captured bytes; capture truncated at 32 KiB (see UNRESOLVED_LEADS) |

Scope exclusions honored throughout (BRIEF): no continuous watching, collaborative editing, remote sync, unsaved editor buffers, whole-Git-history repair, or notebook execution.

---

## 1. Q1 — Two existing components and the version-specific behavior that supports a minimal approach

**Component A — nbdime v4.0.4 (notebook comparison/merge).** [SRC S6,S7]
nbdime "provides tools for diffing and merging of Jupyter Notebooks" (`nbdiff`, `nbmerge`, web variants). Its differ (`nbdime/diffing/notebooks.py`, v4.0.4) is directly precedent-setting for this prototype:

- It assumes both notebooks are already the same format version: module docstring — "All diff tools here currently assumes the notebooks have already been converted to the same format version, currently v4 … Up- and down-conversion is handled by nbformat."
- Cell identity is resolved by a **multilevel predicate ladder** over `/cells`, "in order of low-to-high precedence": `compare_cell_approximate` → `compare_cell_moderate` → `compare_cell_strict` → `compare_cell_by_ids`, with exact equality as the final fallback. So nbdime matches cells by source-similarity heuristics first and by cell `id` only at the highest strictness level (`compare_cell_by_ids`: "Only consider equal if both have IDs and they match").
- It **separates source, outputs, metadata, identifier, and details**: `set_notebook_diff_targets(sources, outputs, attachments, metadata, identifier, details)` maps to distinct diff paths `/cells/*/source`, `/cells/*/outputs`, `/metadata`, `/cells/*/id`, `/cells/*/metadata`, `/cells/*/outputs/*/metadata`, with `execution_count` classified as ignorable "details". Every `compare_cell_*` predicate ends with "NB! Ignoring metadata and execution count".
- Its approximate text comparison uses a similarity threshold of **0.7** (`compare_strings_approximate(x, y, threshold=0.7, …)`), strict uses **0.95**, and it deliberately treats **strings shorter than 10 characters as equal** ("Allow aligning short strings without comparison", with a `TODO` in source) — a behavior we must *not* copy blindly (see §5 tradeoff).

**Component B — Git's diff/rename-detection machinery (repository versioning/recovery precedent).** [SRC S8,S9]

- `Documentation/config/diff.txt` (git v2.47.0): `diff.renames` — "Whether and how Git detects renames. If set to 'false', rename detection is disabled. If set to 'true', basic rename detection is enabled. … **Defaults to true.** Note that this affects only 'git diff' Porcelain … and not lower level commands such as `git-diff-files`."
- Same file: `diff.renameLimit` — "The number of files to consider in the exhaustive portion of copy/rename detection … the default value is currently 1000. This setting has no effect if rename detection is turned off." Rename detection is therefore a bounded, heuristic inference stage, not recorded data.
- RelNotes 2.9.0: "The end-user facing Porcelain level commands in the 'git diff' and 'git log' family by default enable the rename detection." The same notes record a real rename-detection regression fixed in 2.9: "'git diff -M' used to work better when two originally identical files A and B got renamed to X/A and X/B by pairing A to X/A and B to X/B, but this was broken in the 2.0 timeframe." → Rename inference is heuristic and has regressed before; a prototype must **surface** inferred renames, never silently rewrite identity.

**Shared substrate — nbformat v5.11.1 as the parse/validate layer.** [SRC S1–S5] nbformat implements the format the brief targets; the version-conditional facts that make a minimal approach viable:

- The **v4.5 schema** (S1) requires `id` on every cell (`"required": ["id", "cell_type", "metadata", "source"]` for raw/markdown; code adds `outputs`, `execution_count`), with `cell_id` pattern `^[a-zA-Z0-9-_]+$`, `minLength: 1`, `maxLength: 64`; `nbformat` must be exactly `4`; `nbformat_minor` minimum 5 in that schema file. The **v4.4 schema** (S2) has **no `id` property at all** and requires only `["cell_type", "metadata", "source"]`. → Cell identifiers exist only from minor version 5; a comparison tool must gate identity logic on the *declared* minor version. [SRC S1,S2]
- JEP 62 (S3) fixes the semantics: `id` is required for 4.5+; uniqueness is **per notebook only** ("Uniqueness across notebooks is not a goal"); an id "stays the same once created" even as content changes; on split, one part keeps the id and the other gets a new one; on paste, "paste always needs to check for collisions and generate a new id if and only if there is one." Cons acknowledged in the JEP: notebook-only uniqueness "makes merging two notebooks difficult", and "notebooks with the same source code can be generated with different cell ids, meaning they are not byte equal." → Equal content never implies equal ids, and equal ids across notebooks are not guaranteed meaningful. [SRC S3]
- The validator (S4) makes the edge cases concrete: for `(version, version_minor) >= (4, 5)`, a missing `id` triggers `MissingIDFieldWarning` ("Cell is missing an id field, this will become a hard error in future nbformat versions …"); a duplicate id raises `ValidationError("Non-unique cell id '<id>' detected.")` when repairing is off, or is repaired with a fresh `generate_corpus_id()` plus a `DuplicateCellId` warning when on. For a notebook with a minor version **newer than the library knows** ("notebook from the future"), `get_validator` relaxes all `additionalProperties: false` constraints and allows the schema's `unrecognized_cell`/`unrecognized_output` definitions. → Missing ids, duplicate ids, and future minors are all *detectable, distinct input conditions*, which is exactly the discrimination N1/N2 need. [SRC S4]
- Changelog (S5): 5.1.0 "Implemented CellIds from JEP-62"; 5.1.1 "Changes convert.upgrade to upgrade minor 4.x versions to 4.5"; 5.2.0 "Only fix cell ID validation issues if asked" and "Ensure nbformat minor version is present when upgrading"; 5.5.0 deprecates `validate()` arguments that auto-fix notebooks and introduces `normalize()` as an explicit compatibility tool ("`validate()` is a function that is core to the security model of Jupyter. Callers rely on it not mutating its argument"). [SRC S5]

**Why this supports a minimal approach.** [INF] Because (a) the format is pinned at major 4 with a single consequential minor boundary (≥4.5 ids), (b) nbformat already detects every degenerate identifier condition the brief lists (absent, duplicate, future), and (c) both precedents show cell matching is a small predicate ladder over (id, source similarity, outputs), the prototype needs only: nbformat for parse/validate + a ~100-line matcher implementing the ladder explicitly + Git-style similarity inference for file renames. No component needs to be embedded wholesale.

---

## 2. Q2 — Separating source/output/metadata changes; identity under differing version/identifier conditions; renames, untracked files, capture limits

### 2.1 Notebook change model [CHOICE, informed by SRC S6]

Each matched cell pair yields at most one change record with independent boolean sub-observations:

- `source_changed` — normalized line-list comparison of `source` (schema S1: "Contents of the cell, represented as an array of lines").
- `outputs_changed` — output list compared per output `output_type`; approximate mode aligned with nbdime's precedence (type → keys → mime bundle), with `metadata` and `execution_count` of outputs excluded from the *identity* decision but reportable as detail changes, mirroring S6's "NB! Ignoring metadata and execution count".
- `metadata_changed` — cell-level metadata diff reported as a whole-key set difference plus per-key equality (schema S1 marks cell metadata `additionalProperties: true`, so unknown keys are legal and must be surfaced, not silently dropped).
- `id_changed` / identifier events — cell added, removed, moved (sequence position), and id itself changing are reported as separate event kinds; `execution_count` is a detail row, hidden by default. [CHOICE]

### 2.2 Identity and matching ladder [CHOICE, built on SRC S1–S4, S6]

Gate first on declared versions read from the two notebooks' `nbformat`/`nbformat_minor` fields (S1/S2):

1. **Both sides ≥ 4.5 and ids unique within each notebook** → match strictly by `id` (JEP 62 S3 makes ids the intended stable reference; uniqueness is per-notebook, so cross-notebook id equality is used as evidence, with the JEP's caveat recorded in the report). Id-keyed cells are then compared per §2.1. Cells whose ids have no counterpart are added/removed — content similarity is reported as a *hint* on those rows, not silently substituted for identity (per S3: same source ⇒ possibly different ids).
2. **Either side < 4.5, or 4.5+ with missing-id warnings** (S4 `MissingIDFieldWarning` condition) → ids are unavailable or untrustworthy; fall back to content-based greedy matching in nbdime's multilevel spirit (S6): exact (cell_type + normalized source equal) → moderate (adds outputs agreement) → approximate (source similarity ≥ τ = 0.6). Unpaired cells are added/removed; reordering is reported as *moves*, never as content edits (proved by witness W1, §6).
3. **Duplicate ids within a notebook** (S4: `ValidationError` when not repairing) → those cells' identity is *ambiguous by data*: the matcher stops for that id and emits explicit `conflict: duplicate-id` rows showing all contenders. The prototype never auto-repairs (contrast S4's default repair behavior); it is a read-only observer. [CHOICE]
4. **Future minor version** (S4 "notebook from the future" relaxation; S1 `unrecognized_cell`/`unrecognized_output`) → comparison proceeds best-effort with an explicit "relaxed-schema" warning row; unrecognized cells/outputs are compared opaquely by JSON equality.

**Cell-identity ambiguity is always surfaced, never resolved silently** — this is the direct lesson of the similarity heuristic in S6 (which can align short strings without comparison) and of the normalization-mutation history in §4.

### 2.3 Ordinary text files, renames, untracked files [CHOICE on rules; SRC S8 for the inference model]

- Text edits: byte hash equality decides *unchanged*; differing files get a line-level add/delete count summary at render time. No mtime/stat heuristics — the capture is the only truth. [CHOICE]
- **A rename is never an observation; it is an inference.** Git's own model treats rename detection as a similarity heuristic layered on add/remove pairs, default-on but disabled-able, and "affect[s] only … Porcelain" — lower-level plumbing reports plain adds/removes (S8). The prototype mirrors this: an observed pair (path removed from A, path added in B) is labeled `inferred rename A→B (similarity r ≥ τ = 0.6)`; below threshold, or when several candidates compete or tie, the row is `unresolved identity` listing all candidates with their ratios. Similarity metric = the same LCS character ratio as cells (§6), applied to full file text. [CHOICE τ; SRC S8 for the observe-vs-infer distinction]
- Untracked file: present in one snapshot's manifest, absent from the other's tracked set → labeled `untracked-in-<snapshot>`; the prototype does not claim the file is "new" (it may simply predate the other capture). [CHOICE]

### 2.4 Limits of the captured states [CONTRACT per BRIEF + SRC]

- Captures are point-in-time: any change made between captures and never saved is **unknowable** (the brief excludes unsaved editor buffers from scope). Reports must not claim completeness over the *timeline*, only over the *two saved states*.
- A manifest entry without captured content, or a file on neither manifest, is reported `not captured` — excluded from diff and from recovery (§N4), never inferred.
- Notebook file ordering (which snapshot is earlier) cannot be derived from content: nbformat records no timestamps (S1 properties list), so the user designates base and target explicitly. [SRC S1; CHOICE]
- Outputs may differ merely from re-execution; the tool reports `outputs_changed` without claiming any semantic account of execution. [CHOICE]

---

## 3. Q3 — A real issue → fix → test chain and its scoped lesson

**Issue (S10):** jupyter/nbformat **#216** — "Where did the adjective/noun corpus come from?" (opened 2021-03-18, closed 2021-04-02, state_reason `completed`). nbformat 5.1.0 had implemented JEP-62 cell ids (S5) with ids generated by joining random words from two bundled corpora (`nbformat/corpus/adjectives.txt`, `nouns.txt`). The issue documents that generated ids could read as "surprising, problematic, or possibly offensive combinations", with real examples from the corpus (`special-marijuana`, `jewish-holocaust`, `naked-librarian`) — i.e., auto-generated cell identifiers leak into user-visible artifacts and carry real-world content risk.

**Fix (S11):** PR **#217** "Change id generation to be hash based to avoid problematic word combinations" — merged 2021-04-02T04:39:13Z, merge commit `75f4f442952464c1ab9a6401e526163f2ee9b778`; 7 files changed, +15/−5305. The body states it "Implements Option C from the original JEP" (`uuid.uuid4().hex[:8]`) "to resolve … issues/216".

**Tests (S12):** the same PR rewrites `nbformat/corpus/tests/test_words.py`: the corpus-shape tests (`test_acceptable_nouns_set`, `test_acceptable_adjectives_set`) are deleted along with the corpora (adjectives.txt −1366 lines, nouns.txt −3714 lines, `scripts/corpusgen.ipynb` removed), and `test_generate_corpus_id` is updated so its explicit collision-probability comment changes from "1 in 5073324 (3714 x 1366) times this will fail" to "1 in 4294967296 (2^32) times this will fail" — the test's documented probability model was recomputed to match the new 32-bit-hex generator. Shipped in release **5.1.3** (S5: "Change id generation to be hash based to avoid problematic word combinations"; S12 changelog hunk).

**Scoped engineering lesson.** [INF]
1. Generated identifiers are user-visible *content*, not internal bookkeeping — a lesson for our recovery naming and any id materialization: our prototype never generates or rewrites ids during read-only comparison, and if a repair-style affordance is ever added it must inherit this history (hash/random, never unvetted corpora) and state its collision probability in the test that enforces it.
2. Identifier semantics are load-bearing for comparison: the whole matching ladder of §2.2 rests on ids being stable (S3) and unique per notebook (S3). Upstream churn around exactly these semantics (5.1.0 → 5.1.3 fix above; still-open issues #328 "Should normalize update minor_version?", #359 "Ambiguous warning about missing cell IDs", #243 "Merciful validation" — S13) means our matcher must pin the nbformat version it validates with and treat id-handling behavior as versioned input, not ambient truth.
3. Heuristics regress silently — Git 2.9's rename-detection pairing regression (S9) shows inferred-identity logic needs discriminating fixtures at boundary conditions (the failing case there was *two identical files moved into one directory*), which is fixture T6 below.

**Validation that follows (proposed, [UNEXECUTED]):**
- Regression fixture from #216: a captured pair whose target side contains duplicate ids must produce `conflict: duplicate-id` rows and zero silent merges (T4, §6).
- Injectivity property: for a fixture where all ids are unique, id-based matching must be a bijection between id sets; any cell matched by content while its id also appears on the other side is a matcher bug (T5).
- No-mutation check: after a full compare, input snapshot directories must hash identical to before (the prototype performs no writes outside the destination of an explicit recovery; nbformat's own history of validate-time mutation, S4/S5, motivates verifying this).

---

## 4. N1 — Bounded capture/input contract and read-only comparison

**Capture contract** [CHOICE]: a snapshot is a directory containing (a) a `manifest.json` mapping relative workspace paths → `{kind: notebook|text, sha256, size_bytes}` and (b) the captured file contents under `files/<sha256>`. The prototype accepts exactly one notebook per workspace (BRIEF) declared `kind: notebook`; extra notebook files are `unsupported input` rows.

**Read-only guarantee** [CHOICE, with SRC motivation]: comparison opens snapshots read-only and never writes outside an explicit recovery destination. nbformat's `validate()` historically mutated its argument during validation (issue #235 "Validation should not mutate arguments", S13; changelog 5.5.0 S5), so the prototype validates on a deep copy and, after any compare run, re-hashes inputs to prove non-mutation (T7).

**Declared versions and unsupported inputs** [SRC S1,S2,S4]:
- Read `nbformat` (must be 4; schema bounds `maximum: 4`) and `nbformat_minor` from the notebook JSON; both values are echoed into every report header.
- `nbformat != 4` → unsupported input; no cell comparison.
- `nbformat_minor` greater than the bundled schema set → "notebook from the future": validate with the relaxed-schema path that nbformat itself uses (S4 `get_validator`), allow `unrecognized_cell`/`unrecognized_output` (S1), and mark the report `relaxed-schema`.
- Non-JSON or schema-invalid notebook → unsupported input row with the validator error; the two text files may still be compared.
- Notebook with `nbformat_minor < 5`, or ≥ 5 with missing ids → not an error; switches the matching ladder (§2.2) and is shown as `ids: absent` / `ids: missing (validator warning)`.

**What absent capture data and unsaved changes leave unknown** [CONTRACT]: no hash in the manifest ⇒ that file is `not captured` for that snapshot (no diff, no recovery); unsaved editor state is out of scope entirely; snapshot ordering is user-designated (§2.4).

---

## 5. N5 (comparison half) — Component comparison and bounded recommendation

| Aspect | nbdime v4.0.4 (S6,S7) | nbformat v5.11.1 + Git-model heuristics, own matcher (S1–S5, S8,S9) |
|---|---|---|
| Cell identity | Internal multilevel ladder; id predicate last ("low-to-high precedence"); ambiguity resolved silently inside `diff_sequence_multilevel` | Explicit id-first ladder; duplicate/absent ids surface as conflict/warning rows (required by N2) |
| Source/outputs/metadata separation | Yes, path-level and configurable (`set_notebook_diff_targets`) | Yes, per-field change records (§2.1) |
| Version gating | Assumes same version both sides; defers conversion to nbformat (module docstring) | Declared-version gate per side; supports 4.4↔4.5 pairs without conversion (N1) |
| Renames/untracked | Out of nbdime's notebook scope (notebook-file tool) | Git-style similarity inference, surfaced as suggestions (S8) |
| Dependency weight | nbdime 4.0.4 wheel ≈ 5.92 MB (includes web/Lab assets per release asset list) | nbformat 5.11.1 wheel ≈ 80 KB; matcher ≈ 100 LOC owned |
| Known behavior hazards | Strings < 10 chars compare as equal by design (S6, with `TODO`); would misalign tiny synthetic cells | Own matcher must reproduce boundary behavior correctly — cost is tests, not opacity |

**Recommendation** [CHOICE]: use **nbformat 5.11.1** solely for parse + schema validation (never `normalize()`/repair, never upgrade-in-place — changelog 5.1.1 shows `convert.upgrade` rewrites the declared version, which would falsify "captured state") and implement the small explicit matcher; adopt **nbdime as design precedent only**, not a dependency. **Concrete tradeoff accepted:** we re-implement and must test similarity matching ourselves (risk: divergence from nbdime's battle-tested heuristics, e.g., its short-string special case), in exchange for explicit ambiguity surfacing, no multi-megabyte web-coupled dependency in a small desktop prototype, and stable behavior we pin rather than inherit from an actively evolving id-handling layer (S13 open issues).

---

## 6. Discriminating numerical witness W1 and the revised plan (tests)

### W1 — witness for the cell-identity interpretation (self-derived; **UNEXECUTED**)

**Consequential interpretation under test:** does "which cells changed?" depend on the *identity rule*? Competing interpretations: **(i) positional identity** (pair cells by array index) vs **(ii) content-based identity** (greedy best-pair by similarity, nbdime-multilevel/Git-rename style).

Fixture (synthetic, mine): snapshot A, `nbformat=4, nbformat_minor=4` (so no ids may exist, per S2), three code cells with 1-line sources `a=1`, `b=2`, `c=3`. Snapshot B: same three sources, rotated: `c=3`, `a=1`, `b=2`. No other change.

Derivation (each step hand-checkable; ratio metric R = 2·L / (|x|+|y|) where L = LCS length in characters):
- Positional pairs: (`a=1`,`c=3`), (`b=2`,`a=1`), (`c=3`,`b=2`). Each pair: |x|=|y|=3; the only common character subsequence is `=` (first and third characters differ in every positional pair), so L=1 and R = 2·1/(3+3) = 2/6 = **1/3 ≈ 0.33**.
- Content pairs: three exact matches, L=3, R = 6/6 = **1.0**.
- With threshold τ = 0.6 [CHOICE, calibrated just under nbdime's captured 0.7 for text, S6]:
  - Interpretation (i): 0 unchanged, **3 modified**, 0 moved.
  - Interpretation (ii): **3 unchanged**, 0 modified, 3 position moves.
- The interpretations disagree on the *modified count by 3 vs 0*; the fixture discriminates for any τ in the band (1/3, 1.0] — the band survives recalibration to nbdime's 0.7. Sensitivity cut: a single-character edit (`a=1` vs `a=2`) gives L=2, R = 4/6 = 2/3 ≈ 0.67 ≥ 0.6, i.e., reported as one modified cell, not delete+add.
- Cross-version cut: if A were 4.4 and B 4.5, interpretation (ii)-with-ids is *unavailable* (A has no ids, S2) — the version gate, not the heuristic, decides the ladder.

All numbers above are derivations; **no runtime result is claimed** (no admitted arithmetic tool in this stage). The critic/correction stages may execute via an admitted deterministic tool if one is admitted.

### Revised implementation steps (replacing THIN_PLAN steps 1–4) [CORR]

- S1. Snapshot/manifest loader + input contract of §N1, with declared-version echo and unsupported-input rows. *(replaces thin step 1, adds version gating — thin step 1 had no version concept; **[CORR]** matching must be gated on declared minor version before anything else, per S1/S2)*
- S2. Notebook loader: strict JSON parse; `nbformat.validate` on a copy; record id uniqueness/missing/duplicate states (S4 conditions) as match-mode selectors.
- S3. Matching ladder (§2.2): id-first → exact → moderate → approximate(τ=0.6) → conflicts.
- S4. Change records with source/outputs/metadata/id/detail separation (§2.1).
- S5. File layer: hash equality; LCS-ratio rename inference with `unresolved identity` rows; untracked labeling (§2.3). *(extends thin step 2: rename is a labeled inference, never an observation — **[CORR]** per S8)*
- S6. Recovery engine (§N4) with refusal states and post-write hash verification. *(keeps thin step 3's refusal design; adds verification)*
- S7. Fixture set F1–F7 and checks (below), covering the full compare→recover path. *(concretizes thin step 4)*
- S8. Report rendering + end-to-end run: compare → report → recover → re-hash inputs.

### Discriminating test matrix (all [UNEXECUTED] proposals)

| # | Maps to | Fixture / action | Expected discriminating outcome |
|---|---------|------------------|--------------------------------|
| T1 | N1 | 4.4 vs 4.5 pair (W1 data + id on B side) | Matching runs content-based, not id-based; report shows `ids: absent` vs `ids: present` |
| T2 | N1 | Future minor (e.g. `nbformat_minor` above bundled max) | `relaxed-schema` warning row; comparison best-effort (S4 behavior) |
| T3 | N2 | Same sources, different ids both sides ≥4.5 | Rows are added+removed with content-similarity hint, *not* "modified" (S3 caveat) |
| T4 | N2/Q3 | Duplicate id on one side (#216-derived) | `conflict: duplicate-id` rows; zero silent merges |
| T5 | N2 | Unique ids, reorder + one output-only edit | 3 moves + 1 `outputs_changed`; `source_changed=false` on the moved/edited cells |
| T6 | N3 | Two identical files moved into one new directory (S9 regression shape) | Both pairs reported as *unresolved identity candidates* (tie), not confident renames |
| T7 | N1 | Input re-hash after compare | Hashes identical → read-only guarantee holds |
| T8 | N4 | Recovery into existing dir; manifest entry without blob; in-snapshot path collision | Three distinct refusals (existing destination; `not captured`; collision list), destination untouched on refusal |

---

## 7. N4 — Recovery to a new destination from a selected captured state

[CHOICE, with CONTRACT]
- Recovery requires an explicit snapshot selection (manifest identifier) and a destination path that **does not exist**; the destination directory is created by the tool. Refusals, each a distinct error state, nothing written on refusal: (1) destination exists (any entry); (2) selected snapshot references content that was not captured (`not captured`); (3) in-snapshot name collisions (two entries normalizing to one destination path).
- Contents are written **verbatim from captured bytes** and then re-hashed against the manifest; a hash mismatch is a hard error row. Notebook files are not re-serialized, upgraded, or normalized — nbformat's own upgrade path rewrites declared versions (S5, 5.1.1), which would destroy the captured state's identity. [SRC-motivated CHOICE]
- Untracked files present in the selected capture are recovered as ordinary files; files never captured are listed as unrecoverable. **The tool never promises recovery of uncaptured content** — unsaved buffers, intermediate history, and anything outside the two manifests (BRIEF exclusions; §2.4).
- The original workspace, repository metadata, and snapshots are never written by recovery; recovery is copy-out only (BRIEF; verified by T7/T8).

---

## 8. Supported corrections and unresolved leads

**[CORR] corrections supported by sources:** thin plan step 1 lacked any version notion — corrected with the 4.4/4.5 gate (S1/S2/S4); the brief's "cell identifiers may be absent" conflates two distinct conditions — absent-by-version (≤4.4, normal, S2) vs missing-in-4.5 (validator warning state, S4) — which the prototype reports separately; "rename" in workspace terms is downgraded everywhere to *inferred rename* with unresolved-identity states (S8, S9). The brief's own caveat that these are "synthetic test conditions, not claims about notebook or repository guarantees" is respected: every guarantee above is tied to a cited source; every prototype behavior is labeled a choice.

Remaining consequential dependencies and uncertainty are listed in `out/UNRESOLVED_LEADS.md` (similarity-metric provenance, unmerged upstream normalize() changes, truncated search capture, and the unexecuted status of W1/T1–T8).
