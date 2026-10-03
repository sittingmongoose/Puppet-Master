# V8-NB-AMEND-C-L — FINAL_PROPOSAL (complete corrected research-to-plan artifact)

**Stage:** final correction. This document is the complete usable corrected deliverable; it supersedes the frozen `inputs/PROPOSAL.md` by resolving the independent candidate critique `inputs/CRITIQUE.md` (points C1–C8, all adopted — see the resolution ledger in §0). It answers all three brief questions (§2, §3–§4, §5) and satisfies all five product obligations N1–N5, and it revises every step of `inputs/THIN_PLAN.md` (§7).

**Deliverable (unchanged):** a research-backed revision of `inputs/THIN_PLAN.md` for an offline desktop prototype that compares two explicitly captured saved workspace states (one nbformat-4 `.ipynb` + two ordinary text files; each snapshot stores the declared notebook minor version and a workspace manifest) and copies a selected state into a new destination directory. **Nothing in this document has been implemented or executed; no proposed check has an execution receipt.**

Inputs used: `inputs/TASK.md`, `inputs/BRIEF.md`, `inputs/THIN_PLAN.md`, `inputs/METHOD.md`, frozen `inputs/PROPOSAL.md`, `inputs/CRITIQUE.md`, `inputs/UNRESOLVED_LEADS.md`, this case's raw public-source captures, and two fresh correction-stage captures (§1, marked **[this stage]**). No evaluator rulings, sibling discoveries, earlier reasoning histories or prior campaign outputs were used. Per `inputs/METHOD.md`, no special witness procedure is imposed; none is claimed, and all validation below is designed-only.

**Claim classification** used throughout:

- **[S-req]** — normative source requirement (conditions/exceptions preserved at the citation).
- **[S-fact]** — descriptive source fact (behavior, changelog, issue history), including verified absence of a documented capability.
- **[S-opt]** — source-documented optional/example behavior, not an obligation.
- **[INF]** — engineering inference from sources.
- **[CH]** — product choice of this prototype, not sourced from any normative document.
- **[FIX]** — supported correction to `inputs/THIN_PLAN.md`.
- **[PROPOSED]** — test/behavior planned but never executed; no execution receipt exists.
- **[RETRACTED]** — proposition withdrawn as unsupported or contradicted by source (reason stated).

**Excluded scope** (per brief): continuous watching, collaborative editing, remote sync, unsaved editor buffers, whole Git history repair, executable notebook evaluation. Offline during observation and recovery; original files, repository metadata and snapshots are read-only; a requested recovery creates a new destination directory and never resets, checks out over, merges into or rewrites the original workspace.

---

## 0. Critique resolution ledger — which critique points changed the plan and why

All eight critique points were checked against this case's sources and adopted. The two load-bearing factual corrections (C1; the schema basis of C2/C3/C7) were re-verified by fresh correction-stage captures, both byte-identical to the prior registers (§1).

| Point | Adopted verdict | What changed in the plan | Where | How verified |
|---|---|---|---|---|
| **C1** (mandatory) | Supported correction | The frozen claim "PR #236 … Released as: nbformat 5.2.0" is **[RETRACTED]**: the direct PR record shows `merged_at: null` (closed unmerged 2022-06-08), and S2's 5.2.0 section is old-style/unattributed, so no captured source links #236 to that release. Q3's issue → fix → test chain is restated on S2+S3+S5+S6 (#359, #243) without that link; #236 is cited only as recorded "Step 1 toward #235", closed unmerged. | §5 | Fresh capture of `api.github.com/repos/jupyter/nbformat/issues/236` (2026-10-03T03:42:34Z, sha256 `66c9810b5d30…63fee`, byte-identical to the critique's independent fetch): `state:"closed"`, `closed_at:"2022-06-08T07:40:31Z"`, `pull_request.merged_at:null`, body "Step 1 toward #235" |
| **C2** | Supported correction | §4.2(e) reclassified from [S-req] to prototype requirement **[CH]** supported by **[INF]** from S3 `test_future`. Added the explicit note that `unrecognized_cell`/`unrecognized_output` are *defined* in S1 but *admitted by neither* the cell nor the output `oneOf` branch, so a future `cell_type` does not validate against the captured v4.5 schema — "defined in the schema" ≠ "admitted by the schema's branches". New unresolved lead #6. | §4.2(e), §1, `out/UNRESOLVED_LEADS.md` #6 | Fresh byte-identical capture of S1 (2026-10-03T03:44:02Z, 16,104 B, sha256 `523e3578…071a`): `definitions.cell.oneOf` = raw/markdown/code only; `definitions.output.oneOf` = the four known outputs; `unrecognized_*` referenced by neither |
| **C3** | Supported correction | New distinct observation kind `execution_count.changed` (noise-classified by default [CH]); `outputs.changed` no longer folds counter-only changes; F3 split into F3a/F3b; F2 pins the counter fixed; end-to-end check restated over the post-C3 op set. | §4.1, §7.2 | Same S1 capture: `code_cell.required` = `["id","cell_type","metadata","source","outputs","execution_count"]` — the cell-level counter is a **sibling** of `outputs`; `execute_result` carries its **own separate** `execution_count` ("A result's prompt number.") |
| **C4** | Supported coverage gap | Refusal fixtures F13–F15 added (major=3; v4 missing `nbformat_minor`, mirroring S4 `no_min_version.ipynb` 252 B; non-notebook JSON). | §7.2 | Coverage check against §3's specified refusals (N5 requires discriminating validation covering N1) |
| **C5** (i–iii) | Supported coverage gaps | Fixtures F16 (malformed cell id → position identity; uses S4 `invalid_cell_id.ipynb` 766 B), F17 (untracked file without captured content), F18 (comparison-side `content-missing`) added. | §7.2 | Coverage check against §3, §4.3 and §6's specified behaviors |
| **C6** | Supported narrowing | §2.2 table cell "File (non-notebook) diff/rename/recovery: None (notebook-only tool)" narrowed: the blanket "file diff: none" is withdrawn (S7b documents the op format generically over mappings/sequences, so library-level file diffing is not excluded by the docs — **[INF]**, no claim made either way); "no rename detection, no workspace/manifest concept, no copy-into-new-directory recovery, notebook-focused tooling" retained as [S-fact] absence-of-evidence in the captured docs. Recommendation unaffected (the decisive gaps are real). | §2.2 | S7b `diffing.html` byte-identical (sha256 `980eadb9…19222`) |
| **C7** | Supported precision | §4.2(b) labels split: cell `metadata.name` uniqueness = [S-req + explicit exception, S1 `definitions/misc/metadata_name`, verbatim]; schema-level non-enforceability of cell-**id** uniqueness = **[INF]** (S1's `cell_id` definition carries no uniqueness claim; behaviorally supported by S3, where duplicates are caught only by Python-side `_validate(repair_duplicate_cell_ids=False)`, not by schema validation). Design conclusion unchanged. | §4.2(b) | Same fresh S1 capture |
| **C8** (i–iv) | Supported notes | (i) the #235 quote's source typo "notebook manger" now carries a [sic] marker; (ii) the S7a register entry records the dynamic RTD-wrapper byte-difference (all quoted strings verbatim-identical); (iii) the S6 register now cites per-issue records (direct fetches) instead of issue-search bodies, which do not carry `merged_at` — the gap that plausibly hid C1; (iv) register gains S10 (`contents/nbformat/v4`: per-minor schemas 4.0–4.5 all exist; `nbformat.v4.schema.json` blob-identical to `nbformat.v4.5.schema.json`), and the firsthand note that S1's `nbformat_minor` carries `"minimum": 5`, reinforcing the minor ≥ 5 conditioning; declared 4.0–4.4 notebooks are checked against their per-minor schema (pinned in F8). | §1, §4.2(a), §5, §7.2 | S10 per the critique's independent new capture (sha256 `b3385c61…2012`); `"minimum": 5` read firsthand in this stage's fresh S1 capture |

**Preserved findings** (critique-confirmed, carried forward unchanged in substance): the two-component comparison and its version anchors (§2.1–§2.2); the bounded recommendation with its tradeoff and rejected alternatives (§2.2); the capture contract and its stated unknowns (§3); the identity policy and its version conditions (§4.2 — labels corrected only, decisions unchanged); the observed-difference vs inferred-rename split with the exact-hash default (§4.3); the recovery refusal states (§6); the no-mutation lesson (§5); [FIX-1]–[FIX-5] (§7.3). Critique §2 independently re-verified S1–S9 byte-identically (or substantively identically for the dynamic S7a page and the S6 endpoint difference) and confirmed the frozen proposal's fixture sizes (738 B / 573 B exact) and all version/date/threshold values exact.

---

## 1. Source register

All sources are public primary documentation/implementation material, discovered and chosen without an evaluator list. Captures are exact-response-body bytes by the host. Register hashes for S1–S9 were re-verified byte-identically by the independent critique (CRITIQUE.md §1, 2026-10-03T03:31–03:37Z); this correction stage made two additional fresh captures, both byte-identical, marked **[this stage]**.

| # | Locator | Version/ref | Capture evidence |
|---|---|---|---|
| S1 | `raw.githubusercontent.com/jupyter/nbformat/main/nbformat/v4/nbformat.v4.schema.json` | repo `main`; file self-describes as "Jupyter Notebook v4.5 JSON schema."; 16,104 B; **[this stage]** re-captured 2026-10-03T03:44:02Z | sha256 `523e3578ddbfcad52933d2423dc5951114ef73f48df180b6a601498ba5ca071a` (proposal 03:19:09Z; critique 03:31:41Z; this stage 03:44:02Z — all identical) |
| S2 | `raw.githubusercontent.com/jupyter/nbformat/main/CHANGELOG.md` | repo `main`; newest entry 5.11.1 (contributor window 2026-08-06…2026-08-17) | sha256 `414e10d37deb6c5dffca9a082a923e4bd5dddcbe1e2a999149eaf55f1b3b10ab` (03:19:10Z; critique byte-identical 03:31:46Z) |
| S3 | `raw.githubusercontent.com/jupyter/nbformat/main/tests/test_validator.py` | repo `main`; contents-API blob sha `cbf2fe24575a6fc82cfacdd17557fb9317a39712` | sha256 `1d5990ad23fba5ad6b048e6cddde5ed6d4ac8c1d4239e34650067d666173e6cc` (03:21:29Z; critique byte-identical 03:31:46Z) |
| S4 | `api.github.com/repos/jupyter/nbformat/contents/tests` | repo `main`; fixtures `invalid_unique_cell_id.ipynb` 738 B, `v4_5_no_cell_id.ipynb` 573 B, `invalid_cell_id.ipynb` 766 B, `no_min_version.ipynb` 252 B | sha256 `6479f99c0e084c6a196438498a87aaa7b43c6b3bb7f22df42a6f997450aa155c` (03:20:46Z; critique byte-identical 03:31:47Z) |
| S5 | `api.github.com/repos/jupyter/nbformat/issues/235` — "Validation should not mutate arguments" | opened 2021-11-16T01:25:54Z by @Carreau; state **open** at capture | sha256 `40420f0c01c3ebcc658bbce6a1178292440e58bbaf1395501b66829683cf5fe7` (03:20:09Z; critique byte-identical 03:31:47Z) |
| S6a | `api.github.com/repos/jupyter/nbformat/issues/236` — PR "Start working on mutation issues in validate." | created 2021-11-16T01:27:10Z; closed 2022-06-08T07:40:31Z; **`pull_request.merged_at: null`** | **[this stage]** sha256 `66c9810b5d307f1491932bc87791f77efd68f1d30c7e72538a6c62ae16d63fee` (03:42:34Z), byte-identical to the critique's fetch (03:31:47Z). (The frozen register had cited issue-*search* bodies for S6, which do not carry `merged_at`; the register now cites per-issue records — C8(iii)) |
| S6b | `api.github.com/repos/jupyter/nbformat/issues/359` | validator warning text incl. "(available since nbformat 5.1.4)" and "during validation `repair_duplicate_cell_ids` is set to `False`" | per-issue record sha256 `3de53294b098…c790f0` (critique 03:31:47Z; full digest in CRITIQUE.md §1) |
| S6c | `api.github.com/repos/jupyter/nbformat/issues/243` | duplicate cell ids observed to mutate the caller's notebook under validate | per-issue record sha256 `882be9f73e27…832cfa` (critique 03:31:48Z; full digest in CRITIQUE.md §1) |
| S7a | `nbdime.readthedocs.io/en/latest/index.html` | nbdime **4.0.4** docs ("Version: 4.0.4") | critique fetch 03:34:44Z sha256 `51cd3fa7…8c69` vs register `1d7168f5…eae`: **bytes differ** (dynamic RTD wrapper); all quoted strings verbatim-identical — C8(ii) |
| S7b | `nbdime.readthedocs.io/en/latest/diffing.html` | nbdime 4.0.4 docs | sha256 `980eadb93d6e8fb04009492e26f6a8c784b083f84b47ae4e0cb271b160e19222` (byte-identical across proposal and critique) |
| S8 | `raw.githubusercontent.com/jupyter/nbdime/main/CHANGELOG.md` | repo `main`; newest entry 4.0.4 (window 2026-01-15…2026-02-10) | sha256 `1d3c90cd4292540d702c0917d1243120327bc1146f711958353e76dc0e0e98a3` (03:20:10Z; critique byte-identical 03:34:47Z) |
| S9 | `raw.githubusercontent.com/git/git/master/Documentation/diff-options.adoc` | repo `master`; full file 34,303 B (delivered range 0–32768 covers the `-M`/`-C` text) | sha256 `f12f2f624417476cf050ca067263be9f5122eb6dc800f09796044975d9046303` (03:21:30Z; critique sha-match 03:34:47Z) |
| S10 | `api.github.com/repos/jupyter/nbformat/contents/nbformat/v4` | repo `main`; per-minor schemas `nbformat.v4.0.schema.json` … `nbformat.v4.5.schema.json` all present; `nbformat.v4.schema.json` blob-identical to `nbformat.v4.5.schema.json` (blob `670bbd35…`, 16,104 B) | sha256 `b3385c61115d20914310949041828928f92593cfeaaa74dc6805695818e22012` (critique, new independent capture 03:36:57Z — C8(iv)) |

`difflib.SequenceMatcher` (alignment primitive in §4.2(c)) remains an engineering-inference precedent only; its docs were not captured in this case, and no normative claim rests on it.

---

## 2. Q1 — Which two existing notebook comparison/versioning or repository recovery components offer useful precedents, and what version-specific behavior supports a minimal approach?

**Components (independently discovered, no evaluator list): A = `nbformat` (Jupyter notebook schema/validator; newest release 5.11.1 per S2); B = `nbdime` (Jupyter notebook diff/merge; newest release 4.0.4 per S7a/S8).** A third precedent (Git rename detection, S9) is used only for the file-rename rule (§4.3).

### 2.1 What each source establishes

**nbformat (S1 — all schema bullets below read firsthand in this stage's byte-identical capture):**
- Top-level required keys: `metadata`, `nbformat_minor`, `nbformat`, `cells`. `nbformat`: integer, `minimum: 4, maximum: 4` **[S-req, S1]**. `nbformat_minor`: "Notebook format (minor number). Incremented for backward compatible changes to the notebook format." — and this captured 4.5 schema gives it `"minimum": 5`, i.e. the 4.5 schema admits only declared minors ≥ 5 **[S-fact, S1; C8(iv)]**. Notebooks declared 4.0–4.4 must be validated against their per-minor schema (`nbformat.v4.0`–`v4.4.schema.json`, all shipped in the repo per S10); S1 *is* the 4.5 schema (blob-identical to `nbformat.v4.5.schema.json`, S10).
- Every cell type (raw/markdown/code) **requires** `id`; `cell_id` is a string matching `^[a-zA-Z0-9-_]+$`, `minLength: 1`, `maxLength: 64` **[S-req, S1 — conditioned on validation against the 4.5 schema, i.e. declared minor ≥ 5; the 4.0–4.4 per-minor schemas do not require `id` (S10)]**. The `cell_id` definition carries **no** uniqueness claim anywhere **[S-fact of absence, S1; C7]**.
- Code cell `required`: `["id","cell_type","metadata","source","outputs","execution_count"]`; `outputs` is an array whose items must match one of `execute_result`/`display_data`/`stream`/`error` (the only branches in `definitions.output.oneOf`) — this is what makes source/output/metadata separation structurally well-defined **[S-req, S1]**. The cell-level `execution_count` ("The code cell's prompt number. Will be null if the cell has not been run.") is a **sibling** of `outputs`, and `execute_result` outputs carry their **own separate** `execution_count` ("A result's prompt number.") — two distinct fields that one op name must not conflate **[S-fact, S1; C3]**.
- Cell `metadata.name` (`definitions/misc/metadata_name`): "Cell names are expected to be unique across all the cells in a given notebook. This criterion cannot be checked by the json schema and must be established by an additional check." **[S-req + explicit exception, S1]** — a normative acknowledgment that this identity guarantee lies outside schema-checkable power.
- `unrecognized_cell` ("Unrecognized cell from a future minor-revision to the notebook format.") and `unrecognized_output` ("Unrecognized output from a future minor-revision to the notebook format.") **are defined but referenced by neither** `definitions.cell.oneOf` (raw/markdown/code only) **nor** `definitions.output.oneOf` (four known types) — so a cell with a future `cell_type` does **not** validate against the captured v4.5 schema **[S-fact, S1; C2]**. "Defined in the schema" ≠ "admitted by the schema's branches."

**nbformat behavior as tested (S3, current `main`):**
- `test_should_warn`: a 4.5 notebook with a deleted cell `id` validates with `MissingIDFieldWarning` and `isvalid(nb) is True` — missing id is currently a **warning, not an error**, through `validate()` **[S-fact, S3]**. (Nuance, not load-bearing: this test deepcopies the notebook but never asserts equality — it is not a mutation check.)
- `test_non_unique_cell_ids` / `test_no_cell_ids`: with `repair_duplicate_cell_ids=False` (internal `_validate`), duplicate or missing ids raise `ValidationError`, and the test re-runs validation to assert the notebook was **not modified** **[S-fact, S3]**.
- `test_repair_non_unique_cell_ids` / `test_repair_no_cell_ids`: `validate()` by default repairs (warns `DuplicateCellId` / `MissingIDFieldWarning`) and then passes **[S-fact, S3]**.
- `test_is_valid_should_not_mutate`: `isvalid()` neither mutates nor autofixes (exercised with missing **and** duplicate invalidators) **[S-fact, S3]**.
- `test_notebook_invalid_without_min_version`: a v4 notebook missing `nbformat_minor` fails validation (matches S2 5.7.2 "Only require nbformat_minor for v4", #342) **[S-fact, S2+S3]**.
- `test_invalid_cell_id`: a malformed id (pattern/length) is rejected **[S-fact, S3]**.
- `test_future`: a notebook from a future *declared minor* fails when forced to validate at (4,3) and **passes at its own declared version** — version must be read from the document, not assumed. This behavioral evidence, not S1's text, is what supports forward tolerance (C2) **[S-fact, S3]**.
- Honest residual: the strict `test_should_not_mutate` for the public `validate()` is `@pytest.mark.skip("Does not work in all architectures")`; it additionally encodes the intended future hard-error behavior (`pytest.raises(MissingIDFieldWarning)`, `isvalid(nb) is False`) **[S-fact, S3]**.

**nbdime (S7a/S7b/S8):**
- "content-aware" diffing/merging of notebooks; "auto-resolving conflicts on generated values such as execution counters" **[S-fact, S7a]** — direct precedent for treating execution counters as noise, not real change.
- Diff format (S7b): a diff is a list of ops `{"op": <name>, "key": <key>}`; mapping ops `add`/`remove`/`replace`/`patch` (string key); sequence ops `addrange`/`removerange`/`patch` (integer index into base A); recursive `patch`; "nbdime uses a *tree of lists*"; a JSON schema (`diff_format.schema.json`) exists for validating diff entries. `to_json_patch` is "currently a draft, subject to change, and not yet covered by tests" **[S-fact + explicit source caveat, S7b]**. The ops are documented for "mappings (dicts) or sequences (lists or strings)" — a generic representation (bearst on §2.2, C6).
- **Version-specific identity fact:** "Add support for using cell ID in diffing and merging [#639]" appears in the 4.0.0rc0 (window 2023-10-16…2023-11-06) and 4.0.0 (…2023-11-20) changelog sections (S8). Before 4.0.0, nbdime aligned cells without cell IDs **[S-fact, S8]** — the ecosystem itself transitioned from heuristic to id-aware alignment, and tools built on older nbdime do not inherit id-based identity. Whether/how nbdime falls back when ids are absent or duplicate remains unread from source (lead #2).

### 2.2 Comparison and verdict

| Dimension | nbformat 5.11.x | nbdime 4.0.4 |
|---|---|---|
| Notebook change observation | Schema/validation only; no diff | Content-aware notebook diff/merge **[S-fact, S7a]** |
| Cell identity | Normative `id` field under the 4.5 schema (pattern/length, conditioned on declared minor ≥ 5) **[S-req, S1]**; **no uniqueness claim in the schema** — duplicates caught only by Python-side validation, warning-vs-error split per S3 **[S-fact, S3; INF on schema non-enforceability, C7]** | Id used in diff/merge **only since 4.0.0** (#639) **[S-fact, S8]**; older releases align heuristically |
| Source/outputs/metadata separation | Structural fields in the 4.5 schema (S1); cell-level `execution_count` a sibling of `outputs`, distinct from `execute_result`'s own counter (S1; C3) | Ops address the notebook tree, so per-field diffs fall out (`patch` on `source`/`outputs` keys) **[S-fact, S7b]** |
| Version handling | Explicit per-minor schemas 4.0–4.5 (S10); captured 4.5 schema requires declared minor ≥ 5 (S1); upgrade tooling (5.1.1 "Changes convert.upgrade to upgrade minor 4.x versions to 4.5", S2) | Reads notebooks via nbformat; no independent version normativity |
| File (non-notebook) diff | **[INF]** not excluded by the captured docs (S7b's ops are generic over mappings/sequences); no claim made either way *(C6: the frozen blanket "None (notebook-only tool)" cell is withdrawn as stronger than its citation)* |
| Rename detection / workspace-manifest concept | None documented **[S-fact of absence, S7a/S7b/S8 — the decisive gap for this deliverable]** | None documented **[S-fact of absence, S7a/S7b/S8]** |
| Copy-into-new-directory recovery | None documented (merge targets working files, not a new directory) **[S-fact of absence, S7]** | None documented **[S-fact of absence, S7]** |

**Recommendation (bounded approach): use nbformat as the normative identity/version layer and implement the diff, rename inference and copy-recovery logic ourselves (~small prototype), borrowing nbdime's two design precedents — (a) a path-addressed structural diff with a small typed op set (S7b), and (b) auto-resolving generated values (execution counters) as noise (S7a).** **[CH]**

**Tradeoff accepted:** we re-implement a small diff instead of importing nbdime. Reasons: the captured nbdime docs document no rename detection, no workspace/manifest concept and no copy-into-new-directory recovery — the deliverable's core **[S-fact of absence, S7/S8]**; and depending on nbdime would import an alignment policy (pre-4.0 heuristic vs 4.0+ id-based) that changed silently at 4.0.0 (S8). nbformat gives exactly the normative layer our identity rules need (version declaration, id validity, duplicate-detection behavior) and nothing more. What we give up: nbdime's battle-tested line-level diffs inside sources — replaceable for two-snapshot comparison by any line-diff primitive **[CH]**.

**Alternatives rejected:** building only on nbdime (no version normativity, no rename/recovery); building only on nbformat (no diff at all) **[CH]**.

**[FIX-1]** The thin plan's step 1 ("choose the minimal comparison/recovery components") assumed such components exist off-the-shelf; research shows no single component covers notebook identity + file rename + recovery, so the plan composes nbformat (normative layer) with prototype-owned diff/recovery.

---

## 3. Q2 (part 1) — Capture/input contract (N1)

Each snapshot stores: the notebook file, its **declared** `nbformat` and `nbformat_minor` taken from the document (never defaulted silently — a v4 notebook missing `nbformat_minor` is invalid per S3 `test_notebook_invalid_without_min_version` **[S-fact]**; the prototype reports rather than guesses **[CH]**), a manifest of the two text files (path → content hash), and the raw file contents **[CH]**. (The snapshot/manifest format itself is synthetic with no public normative source — lead #4.)

**Unsupported inputs, reported as errors [CH]:**
- major version ≠ 4 — the captured v4 schema has `maximum: 4` **[S-req, S1]**; v1–v3 exist in nbformat but are out of scope by the brief's "version-4 .ipynb";
- v4 with missing `nbformat_minor` **[S-fact, S3]**;
- JSON that is not a notebook.

Cell ids failing `^[a-zA-Z0-9-_]+$` or length 1–64 are reported as invalid ids (cf. S3 `test_invalid_cell_id` **[S-fact]**) but do **not** abort comparison — they demote that cell to identity-by-position **[CH]** (pinned by F16).

**What absent capture data and unsaved changes leave unknown (stated, not papered over) [CH]:** if a snapshot did not record a file's content, its diff is unknowable (reported `content-missing`, never inferred — pinned by F18); outputs/metadata differences are observable only where both snapshots stored them; nothing in a saved-state comparison reveals *unsaved* editor state (excluded by brief) — silence about it is by construction, and the prototype will not claim otherwise. If the two snapshots declare different minors, identity degrades per §4.2(c) and the report says so.

---

## 4. Q2 (part 2) — Notebook observations, cell identity, workspace observations

### 4.1 Notebook change observations (N2)

Observations are computed on the parsed notebook trees and expressed in a typed, path-addressed op set modeled on nbdime's mapping/sequence ops (S7b) **[CH]**:

- `source.changed(cell_ref, old, new)`;
- `outputs.changed(cell_ref, detail, old, new)` — **output-content changes only**. A counter-only bump is not an output change: the cell-level `execution_count` is a required *sibling* of `outputs` in the 4.5 schema, and `execute_result` outputs carry their own separate counter field (S1) **[S-fact; C3]**;
- `execution_count.changed(cell_ref, old, new)` — **distinct observation kind** for the cell-level counter; **noise-classified by default** following nbdime's "auto-resolving conflicts on generated values such as execution counters" precedent (S7a) **[S-fact for the precedent; default classification: CH]**, surfaced in an optional view. Changes to an `execute_result`'s own counter live inside `outputs` and are part of the output content diff **[CH]**;
- `metadata.changed(notebook|cell, key, old, new)`;
- `cell.added/removed(cell_ref, position)`, `cell.moved(old_pos, new_pos)`;
- `unrecognized(cell_ref)` for future-minor structures the prototype chooses to tolerate (§4.2(e)).

**Separation guarantee:** an edit to `source` alone never marks outputs/counter/metadata changed, and likewise for each other field — comparing the four fields independently, which the 4.5 schema's structure makes well-defined (S1) **[INF]**. A counter-only change produces exactly `execution_count.changed` and nothing else **[CH; C3 — pinned by F3b]**.

### 4.2 Cell identity and matching (N2, version/identifier conditions preserved)

**(a) Both states declared ≥ 4.5 (validated with the 4.5 schema, which admits only declared minor ≥ 5), all ids present, valid and unique** — the only regime where the captured schema's normative identity field applies: `id` required, pattern-checked, length-bounded (S1) **[S-req conditioned on 4.5-schema validation / minor ≥ 5]**. Join cells by `id`. Same id + equal field hashes → unchanged; same id + differing `source`/`outputs`/`execution_count`/`metadata` → the corresponding per-field observations; id present on one side only → added/removed; same id with different `cell_type` → matched but flagged **[CH]**. States declared 4.0–4.4 are validated against their per-minor schemas (S10), where `id` is not required.

**(b) Duplicate ids within a state** — cell `metadata.name` uniqueness is explicitly outside schema-checkable power: "Cell names are expected to be unique across all the cells in a given notebook. This criterion cannot be checked by the json schema and must be established by an additional check." **[S-req + explicit exception, S1 `definitions/misc/metadata_name`]**. By contrast, schema-level non-enforceability of **cell-id** uniqueness is an *inference*: S1's `cell_id` definition carries no uniqueness claim **[S-fact of absence, S1]**, and behaviorally S3 catches duplicates only in Python-side `_validate(repair_duplicate_cell_ids=False)`, not in schema validation **[INF from S1+S3; C7]**. nbformat's validator rejects duplicates only when repair is disabled and otherwise warns-and-repairs (S3) **[S-fact]**. Our prototype never repairs: cells involved in a duplicate id are matched by position/content-similarity and the ambiguity is **reported, not silently resolved** — silent resolution is precisely the failure mode of nbformat #235 (§5) **[CH; lesson traceable to S5]** (pinned by F7).

**(c) Versions below 4.5, or a mixed pair (one state ≥ 4.5, one < 4.5), or absent/invalid ids** — no normative id identity exists (id is not required in the 4.0–4.4 per-minor schemas, S10; cross-version id comparison is meaningless when one side has no ids) **[S-fact, S10 + INF]**. Fall back to similarity alignment of the cell sequence (position plus source-similarity, `difflib.SequenceMatcher`-style) **[INF]**; every such alignment is labeled `matched-by-heuristic` with the ambiguity surfaced. nbdime's own history is the cautionary precedent: id-based diffing only arrived in 4.0.0 (S8), so heuristic alignment is the norm, not a corner case, for pre-4.5 material **[INF from S8]** (pinned by F6/F8).

**(d) Reordering** — matched pairs whose positions differ yield `cell.moved`; reordering alone produces no source/output/counter/metadata change records **[CH]** (pinned by F5).

**(e) Future minors** — the prototype **chooses** to tolerate and surface unrecognized cells/outputs rather than crash **[CH]**, supported by **[INF]** from S3 `test_future` (a future *declared minor* passes at its own version in nbformat's validator) — **not** by S1's text, which defines `unrecognized_cell`/`unrecognized_output` but admits them through neither `oneOf` branch (C2) **[S-fact, S1]**. *(The frozen §3.3(e) [S-req] tag is withdrawn.)* Whether and how nbformat's validator relaxes per declared minor is unread from source — lead #6.

### 4.3 Workspace/file observations (N3)

Manifest comparison over the two text files:

- Same path, same content hash → unchanged; same path, different hash → `text.changed` (line-level diff displayed, hash asserted) **[CH]**.
- Path present only in snapshot 1 → `file.deleted`; only in snapshot 2 → `file.added` **[CH]**.
- **Rename:** an observed delete+add pair with **byte-identical content hashes** is presented as `renamed(exact)` — but the observation and the inference are separate records: the *observed difference* is "path X gone, path Y appeared"; the *inferred rename* is our chosen equivalence rule (exact content equality). This mirrors Git's rename detection: "To limit detection to exact renames, use `-M100%`. The default similarity index is 50%." (S9) **[S-fact, S9; adoption of exact-only as default: CH]**. An optional similarity threshold (> 0) may be enabled for near-renames; any such match is reported as `renamed(similarity t)` and remains **exposed as unresolved identity** — the prototype never claims git-grade attribution, since the fixture corpus is far too small to tune a threshold (lead #3) **[CH]**. Unresolvable ambiguity (one deleted file, two equally similar additions) is reported as unresolved, never silently paired **[CH]** (pinned by F9).
- **Untracked file:** present in snapshot 2 with no baseline entry → `untracked`; its content is recoverable (if captured) but has **no diff**, and the report says exactly that; if its content was not captured, it is listed as unrecoverable (§6, F17) **[CH]**.

---

## 5. Q3 — Real implementation failure with a traceable issue → fix → test history

**Failure: `nbformat.validate()` mutated the notebook it was validating (silently adding/repairing cell ids), breaking callers that sign-then-save.**

- **Issue:** jupyter/nbformat#235 "Validation should not mutate arguments" (opened 2021-11-16T01:25:54Z by @Carreau; state open at capture, S5): "if a code cell has a missing id, it will silently add one to it … it mutates arguments … create[s] signing issues, indeed validate is called when writing and most notebook manger [sic — source typo; rendered "notebook manager[s]" in the frozen quotation] … compute signature, save … They assume that what you save is identical to what you give to nbformat, but as validate mutates things it is untrue." **[S-fact, S5]** (C8(i) lands the [sic] marker.)
- **Corroborating issue record:** #243 — duplicate cell ids produce "a validation error … and also the notebook that you passed in will be modified with *only* the first instance of a non-unique cell" (S6c) **[S-fact]**.
- **Repair path split:** #359's validator warning text presents `normalize()` as the explicit repair operation, "(available since nbformat 5.1.4)", and records that "during validation `repair_duplicate_cell_ids` is set to `False`" in the then-current warning path (S6b) **[S-fact]**. S2 has no 5.1.4/5.1.5 changelog sections, so the 5.1.4 date rests solely on the #359 warning text — attributed exactly that way.
- **PR record (C1-corrected):** PR #236 "Start working on mutation issues in validate." — body "Step 1 toward #235" — created 2021-11-16T01:27:10Z, **closed 2022-06-08T07:40:31Z without merge** (`pull_request.merged_at: null`) (S6a — fresh capture this stage, byte-identical to the critique's) **[S-fact]**. It is cited only as recorded, unmerged work toward #235. **[RETRACTED]** The frozen proposal's assertion that #236 was "Released as: nbformat 5.2.0" asserted a release link that no captured source supports (the 5.2.0 section is unattributed) and that the direct record contradicts (`merged_at: null`); it is withdrawn.
- **Release record (S2):** nbformat **5.2.0** "Only fix cell ID validation issues if asked" — the 5.2.0 section is old-style and **unattributed** (no PR links), so this changelog entry alone, not a PR number, is the capture-backed release evidence that ask-first repair shipped **[S-fact, S2; C1]**. **5.5.0** deprecated `validate()`'s auto-fix arguments on the stated grounds that "`validate()` is a function that is core to the security model of Jupyter. Callers rely on it not mutating its argument" and "validation will fail instead of silently modifying an invalid notebook" **[S-fact, S2]**. **5.11.0** "Remove deprecated kwargs from validate() function [#447]" **[S-fact, S2]**.
- **Tests (S3, current `main`):** `test_non_unique_cell_ids` / `test_no_cell_ids` assert `ValidationError` with `repair_duplicate_cell_ids=False` and re-validate to assert no mutation; `test_repair_non_unique_cell_ids` / `test_repair_no_cell_ids` assert warning-gated repair only when asked (`DuplicateCellId`, `MissingIDFieldWarning`); `test_is_valid_should_not_mutate` asserts `isvalid()` neither mutates nor autofixes. Dedicated fixtures exist: `tests/invalid_unique_cell_id.ipynb` (738 B), `tests/v4_5_no_cell_id.ipynb` (573 B) (S4). Honest residual: the strict `test_should_not_mutate` for the public `validate()` is `@pytest.mark.skip` ("Does not work in all architectures") and encodes the intended future hard-error behavior — the no-mutation guarantee for `validate()` itself is asserted indirectly, not universally **[S-fact, S3]**. Note also that on current `main` warning-gated repair through `validate()` still exists (`test_repair_*`), so the hard-error boundary across tagged releases is not pinned by these captures (lead #1).

**Chain statement (C1-corrected):** #235 (issue, 2021-11-16 — mutation reported, sign-then-save breakage) → repair split out as `normalize()` (available since 5.1.4 per #359's warning text) → 5.2.0 "Only fix cell ID validation issues if asked" (unattributed changelog entry) → 5.5.0 deprecation with the security-model rationale → 5.11.0 removal of the deprecated kwargs (#447) → tests on `main` (S3) showing current warning-gated behavior and the no-mutation patterns. The issue → fix → test chain survives on S2+S3+S5+S6 without the withdrawn #236→release link **[S-fact]**.

**Scoped engineering lesson:** observation/inspection functions must be side-effect-free; repair must be an explicit, separately-named operation on a copy. Applied here: the prototype's compare step never mutates either snapshot and never rewrites ids; "repair" does not exist — ambiguity is reported (§4.2(b)) **[INF; prototype adoption: CH]**.

**Validation that follows (PROPOSED, unexecuted):** fixture F12 replicates the no-mutation assertion pattern of S3 (`deepcopy` before compare, equality after) against the prototype's own code; F6/F7 replicate the missing-id and duplicate-id fixtures (`v4_5_no_cell_id.ipynb`, `invalid_unique_cell_id.ipynb`); F16 replicates the malformed-id case (`invalid_cell_id.ipynb`). Designed checks only — no execution receipt exists.

---

## 6. Recovery design (N4)

Recovery copies the **explicitly selected** snapshot into a destination directory that does not exist beforehand **[CH]**:

- **Existing-destination refusal:** if the destination path exists (file or directory), refuse; no merging, no overwrite, no resume **[CH]**. (The brief requires refusal; refusing any existing path, not just non-empty ones, is the strict choice.)
- **Missing snapshot content:** if the manifest references content absent from the capture, refuse with a list of the missing entries — never recover a partial state silently and never promise recovery of uncaptured content **[CH; brief N4]** (recovery-side refusal pinned by F11; comparison-side twin by F18).
- **Untracked files:** recovered from captured content; if content is absent, recovery proceeds for the captured entries and the file is **loudly listed as unrecoverable** ("not present in capture") — the report distinguishes "recovered" from "not present in capture", so no absence is silent **[CH]** (pinned by F17, C5-ii).
- **Name collisions:** two capture entries resolving to the same destination name (e.g., an exact rename where both old and new paths were captured) refuse with both sources named; the user must re-select **[CH]**.
- Original workspace, repository metadata and snapshots are opened read-only; recovery writes only under the new destination **[CH; brief]**.
- **What is recoverable:** exactly the captured file contents + the captured notebook, verbatim. What is **not** recoverable: anything uncaptured (unsaved buffers — excluded scope; git history; outputs stripped before capture) **[CH]**.

---

## 7. Revised implementation steps and discriminating validation (replacing THIN_PLAN steps 1–4)

### 7.1 Steps (each traced to its section)

1. Parse + validate inputs against the snapshot contract; report declared `(nbformat, nbformat_minor)`; refuse major ≠ 4, v4-without-minor, and non-notebook JSON (§3; S1, S3).
2. Implement the typed op set for notebook observations, including the distinct `execution_count.changed` kind (§4.1; modeled on S7b).
3. Implement identity resolution per §4.2 (id-join at declared minor ≥ 5 with valid unique ids under the 4.5 schema; per-minor schema handling for declared 4.0–4.4; heuristic fallback labeled as such; duplicates/ambiguity reported, never silently repaired).
4. Implement manifest/file observations incl. exact-hash rename inference and unresolved-identity surfacing (§4.3; precedent S9).
5. Implement copy-recovery with the refusal states of §6.
6. Run the fixture set F1–F18; emit the comparison report + recovery result.

### 7.2 Fixture set and discriminating assertions (all PROPOSED — unexecuted; no execution receipt)

| Fixture | Discriminates |
|---|---|
| F1 identical states | empty observation set (no false positives) |
| F2 source-only cell edit (`execution_count` pinned fixed) | `source.changed` only; outputs/counter/metadata untouched (C3/audit: counter pinned so field separation is actually exercised) |
| F3a outputs content change, counter held fixed | `outputs.changed` only |
| F3b counter-only bump (e.g. 3→4), outputs byte-identical | `execution_count.changed` only, noise-classified — and **no** `outputs.changed` (C3: the frozen bundled F3 could not fail) |
| F4 metadata-only change (root + cell) | `metadata.changed` only |
| F5 reordered cells (ids intact, declared ≥ 4.5) | exactly the expected `cell.moved` op set (asserted as the exact set, so a degenerate remove+add pairing cannot masquerade as a pass — audit strengthening) |
| F6 4.5 notebook with a cell missing `id` (mirrors S4 `v4_5_no_cell_id.ipynb`, 573 B) | missing-id cell matched by heuristic AND labeled ambiguous; no mutation (cf. S3) |
| F7 duplicate ids (mirrors S4 `invalid_unique_cell_id.ipynb`, 738 B) | ambiguity reported, no silent pairing, no mutation |
| F8 declared-4.0 state vs declared-4.5 state | identity degraded to heuristic + version-mismatch note; the 4.0 side validated against the per-minor 4.0 schema, since S1 (4.5) admits only declared minor ≥ 5 (S1, S10; C8(iv)) |
| F9 exact rename of a text file | `renamed(exact)` inference recorded separately from the delete+add observations (N3 split; S9 anchor) |
| F10 untracked file with captured content | `untracked` with "no diff, content recoverable" |
| F11 recovery refusals ×3 | existing destination / missing manifest blob / destination-name collision, each refused with the specific error |
| F12 no-mutation invariant | `deepcopy`-equality of both snapshots before/after compare+recover (pattern from S3 `test_is_valid_should_not_mutate` — the strongest *running* precedent, since the stricter `validate()` mutation test is skipped) |
| F13 major version 3 (NEW, C4) | refused per §3 (S1 `maximum: 4`) |
| F14 v4 without `nbformat_minor` (NEW, C4; mirrors S4 `no_min_version.ipynb`, 252 B) | refused per §3 (S3 `test_notebook_invalid_without_min_version`) |
| F15 non-notebook JSON (NEW, C4) | refused per §3 |
| F16 malformed cell id — pattern/length failure (NEW, C5-i; mirrors S4 `invalid_cell_id.ipynb`, 766 B) | cell demoted to identity-by-position + invalid-id reported; comparison continues (cf. S3 `test_invalid_cell_id`) |
| F17 untracked file without captured content (NEW, C5-ii) | recovery proceeds for captured entries; the file listed as unrecoverable; report distinguishes "recovered" vs "not present in capture" — nothing silent |
| F18 snapshot omits a manifest-referenced file's content (NEW, C5-iii) | comparison reports `content-missing`, performs no inference, does not crash (comparison-side twin of F11's recovery-side refusal) |

**End-to-end check (PROPOSED):** a dirty-by-construction pair (edit + rename + untrack + reorder + duplicate id) must produce every observation kind of the post-C3 op set exactly once — `source.changed`, `outputs.changed`, `execution_count.changed`, `metadata.changed`, `cell.added/removed/moved`, `text.changed`, `file.added/deleted`, `renamed(exact)`, `untracked` — and recovery of state 2 must reproduce its manifest hashes in the destination. The heuristic-alignment fixtures (F6, F8, end-to-end) additionally pin **determinism**: constructed inputs are unambiguous, so the same alignment must be produced on repeated runs and asserted identical (audit strengthening).

### 7.3 Correction ledger for the thin plan (unchanged in substance; critique-confirmed legitimate)

- **[FIX-1]** "choose the minimal comparison/recovery components" → no single component suffices; compose nbformat + prototype diff/recovery (§2.2).
- **[FIX-2]** the plan had no identity rule → id-join/heuristic-fallback policy with explicit version conditions (§4.2).
- **[FIX-3]** the plan had no rename semantics → observed-difference vs inferred-rename split with exact-hash default (§4.3).
- **[FIX-4]** the plan had no refusal states → §6's enumerated refusals.
- **[FIX-5]** the plan promised "checks for the complete comparison-to-recovery path" without specifying them → F1–F18 with discriminating assertions; all unexecuted.

---

## 8. Boundary of this document

- Every normative condition is stated with its citation and survives with its conditions attached: `id` requirements conditioned on 4.5-schema validation (declared minor ≥ 5; declared 4.0–4.4 states use per-minor schemas, S10); duplicate-id rejection tied to `repair_duplicate_cell_ids=False`; missing/malformed ids currently warning-level in nbformat and positional in the prototype; "defined" vs "admitted" distinguished for `unrecognized_*` (C2); `execution_count` separated from `outputs` as a sibling field (C3).
- Engineering inference, product choices, thin-plan corrections, the retraction, and proposed tests are labeled as such; the one retraction (C1) is stated with its contradicting evidence.
- **No test in §7 has been run; no runtime behavior of the prototype is claimed; no arithmetic or test result in this document has an execution receipt.** Per `inputs/METHOD.md` no witness procedure is imposed; none is claimed.
- Remaining consequential uncertainties are listed in `out/UNRESOLVED_LEADS.md` (leads 1–5 carried/updated; lead 6 added by C2). They are consequences of capture limits, not gaps in the deliverable: the plan remains usable with them open, and where they bear on behavior (e.g., the `validate()` repair boundary) the design already treats nbformat's verdict as advisory and keeps the prototype's own checks normative.
- Stage provenance: this correction stage made two fresh captures (S6a, S1), both byte-identical to prior registers; all other register entries were verified byte-identically by the independent critique (CRITIQUE.md §1). The host records captures/histories/hashes/cost mechanically.
