# V8-NB-P-Z — Research proposal: offline saved-state notebook/workspace comparison and recovery

Case stage: `V8-NB-P-Z-research-proposal` (research→plan, native Goal Z2). Date: 2026-10-02.
Deliverable status: research-backed revision of `inputs/THIN_PLAN.md` for a small **offline desktop prototype** that (a) compares two explicitly captured saved states of a workspace (one v4 `.ipynb` + two ordinary text files) and (b) copies one selected captured state into a **new** destination directory. Originals, repo metadata and snapshots stay read-only. Out of scope (per brief): continuous watching, collaborative editing, remote sync, unsaved editor buffers, whole Git history repair, executable notebook evaluation.

**Execution honesty:** this stage admits no deterministic execution/arithmetic tool (the case's mechanical tool performs line-map/render/capture only, explicitly with no execution). No arithmetic or test has been executed here. Every validation in §7 is a **proposed, UNEXECUTED** discriminating test; no runtime result is claimed.

**Claim category tags** (used throughout to separate obligations from judgment):

- **[SRC]** source fact — quoted/paraphrased from a captured public primary source, with exact version/locator.
- **[INF]** engineering inference — my conclusion from sources; not stated by any source.
- **[CHOICE]** product choice — a decision this prototype makes where sources permit alternatives.
- **[UNEXECUTED]** proposed test/validation — designed but never run; no pass/fail claimed.

---

## 1. Independently discovered primary sources (exact locators)

All captured via this stage's public-HTTPS tool; SHA-256 below are the host capture hashes of the exact response bodies.

| ID | Source & version locator | Content relied on | Capture sha256 (prefix) |
|----|--------------------------|-------------------|--------------------------|
| S1 | `jupyter/nbformat` tag **v5.11.1** (commit `75f819f5b60bc6ffc72145c364132efe5b3c4b35`), `nbformat/v4/nbformat.v4.5.schema.json` | v4.5 schema: `nbformat` must be 4 (min 4/max 4); `nbformat_minor` min 5; `cell_id` pattern `^[a-zA-Z0-9-_]+$`, minLength 1, maxLength 64; `id` **required** on raw/markdown/code cells; code cell requires `outputs`+`execution_count`; `unrecognized_cell`/`unrecognized_output` for future minors; `metadata.name` uniqueness "cannot be checked by the json schema and must be established by an additional check" | `523e3578ddbfcad5…` |
| S2 | `jupyter/nbformat` tag **5.0.8**, `nbformat/v4/nbformat.v4.schema.json` ("Jupyter Notebook v4.4 JSON schema") | pre-4.5 cells have **no** `id` property at all; `nbformat_minor` min 4 | `64d5608c9e7b1e38…` |
| S3 | `jupyter/nbformat` tag **v5.11.1**, `nbformat/validator.py` | `normalize`/`_normalize`: for (4,5)+ notebooks, missing `id` → `MissingIDFieldWarning` + fill `generate_corpus_id()`; duplicate `id` → in the repairing path "Best effort to repair": replace and warn `DuplicateCellId` ("Non-unique cell id … Corrected to …"); in the non-repairing path (`isvalid`, `repair_duplicate_cell_ids=False`) raises `ValidationError`. Public `validate()` defaults `repair_duplicate_cell_ids=True`. `get_validator` relaxes `additionalProperties` and allows unknown cell/output types for notebooks "from the future" (declared minor > known minor). `normalize` returns `(change count, deep copy)`. `MissingIDFieldWarning` text: normalize "available since nbformat 5.1.4" | `3db1fe48de1060…` |
| S4 | `jupyter/enhancement-proposals` master, `62-cell-id/cell-id.md` (JEP 62, status: Implemented, 2020-09-25) | `id` required for 4.5+; uniqueness **within one notebook** is the invariant ("the JEP proposes a unique cell identifier"); "Uniqueness across notebooks is not a goal"; ids persist across content edits; split ⇒ one part keeps id, other gets new id; paste must collision-check; older formats auto-updated on load (example fill: `uuid.uuid4().hex[:8]`); recommendation: auto-update to 4.5 and auto-fill ids on save | `7f52a9c224fd11…` |
| S5 | `jupyter/nbdime` tag **v4.0.4** (commit `925a31e35481c0dc9e937771479b30a4e7df2290`), `nbdime/diffing/notebooks.py` | cell alignment predicates for `/cells`, "in order of low-to-high precedence": `compare_cell_approximate` → `compare_cell_moderate` → `compare_cell_strict` → `compare_cell_by_ids`; `compare_cell_by_ids` = `'id' in x and 'id' in y and x['id'] == y['id']`; approximate: cell types must match, `compare_text_approximate` (similarity threshold **0.7**; strings shorter than **10** chars always align — in-code TODO), ignores metadata/execution_count/outputs; strict: `compare_text_strict` (threshold **0.95**), outputs compared count/order/content-strict; `atomic_paths` includes `"/cells/*/id": True`; `set_notebook_diff_targets(..., identifier=…)` can ignore `/cells/*/id`; module docstring: differs "assume the notebooks have already been converted to the same format version, currently v4" | `bc9c5c5ad14966…` |
| S6 | `jupyter/nbdime` issue **#553** "Support cell IDs" (opened 2020-12-03 by vidartf; closed 2023-11-01, state_reason: completed) | traces the design problem (use IDs as "high level indicator of cell identity when diffing"?; ID-vs-content precedence; ID conflicts on merge); cites JEP 62 and nbformat PR #189 | `553e301eaf2ad5…` |
| S7 | `jupyter/nbdime` PR **#566** "Add initial cell identifiers awareness" (merged 2021-04-12) | step-1 fix: treat `id` as opaque metadata so nbdime "doesn't fall over … and doesn't drop them completely"; interim `" /cells/*/id": "remove"` config; "failing tests is down from 34 to 32" | `d496eee5e0f2ea…` |
| S8 | `jupyter/nbdime` PR **#639** "Add support for using cell ID in diffing and merging" (opened 2022-11-23; **merged 2023-11-01**; body: "Fixes #553") + its commit list | fix commits: `7eb83fbc` "Add DiffConfig … is_atomic … mark e.g. cell IDs as atomic"; `4f71a5fd` "Add ID check in cell comparison" ("In the strictest check, cells without ID is never considered equal to cells with IDs, but they can be in the two less-strict comparisons"); `1b318e6d` "Fix source string diffing — Always use line based diffing for source"; `17caf86f` "Fix tests for cell IDs — Enable previously not working test" | `e86ae830d7c062…` (commits) |
| S9 | `jupyter/nbdime` commit **`17caf86fc79277a6ccd7a00b2cb253aa8295d845`** (in PR #639), patch on `nbdime/tests/test_merge_notebooks.py` (+9/−8) | removes `@pytest.mark.xfail` from `test_merge_multiline_cell_source_conflict`, replacing its comment with: "Note: This only works with cell ids hinting that the cells are the same"; adds `ignore_cell_ids=True` to `test_merge_cell_sources_neighbouring_inserts`; fixes `common_path` from `("cells","0","source")` to `("cells",0,"source")` | `ee6e508748087d…` |
| S10 | `jupyter/nbdime` directory listing `nbdime/tests?ref=v4.0.4` | confirms `nbdime/tests/test_merge_notebooks.py` exists at tag v4.0.4 (36,073 bytes) — the file S9 patched | `bed24badc7636d…` |
| S11 | `git/git` tag **v2.42.0**, `Documentation/config/diff.txt` | `diff.renames`: "Whether and how Git detects renames. If set to 'false', rename detection is disabled. If set to 'true', basic rename detection is enabled … **Defaults to true**. Note that this affects only 'git diff' Porcelain like git-diff[1] and git-log[1], and not lower level commands"; `diff.renameLimit`: "number of files to consider in the exhaustive portion of copy/rename detection … default value is currently 1000" | `0a0ec973e0aecb…` |
| S12 | `git/git` tag **v2.42.0**, `Documentation/glossary-content.txt` | `index` = "a stored version of your working tree"; `working tree` = "the tree of actual checked out files … plus any local changes that you have made but not yet committed"; no standalone "untracked file" glossary entry appears in this captured document | `0911d5c705754b…` |

GitHub tag/release metadata (nbformat latest tag v5.11.1; nbdime latest tag v4.0.4; release 5.1.0 published 2021-01-14) were also captured for pinning. Note: the nbformat 5.1.0 GitHub release body is just "Release 5.1.0" (no notes) — see UNRESOLVED_LEADS.

---

## 2. RQ1 — Two existing components, and the version-specific behavior that supports a minimal approach

**Components compared** (independently discovered; both are real, maintained implementations):

**A. nbdime v4.0.4** — notebook-aware diff/merge (S5). Relevant behavior:

- Layered cell alignment for `/cells`: approximate → moderate → strict → **id-exact**, tried low-to-high precedence, plus a multi-level sequence differ [SRC, S5].
- `compare_cell_by_ids`: "Only consider equal if both have IDs and they match" — a cell **without** `id` is never equal to a cell **with** `id` in the strictest layer, but may align in the two looser layers [SRC, S5].
- Source/outputs/metadata separation is structural: diff paths `/cells/*/source`, `/cells/*/outputs`, `/cells/*/metadata`; `execution_count` and metadata are deliberately ignored by the comparison predicates ("NB! Ignoring metadata and execution count") yet remain diffable [SRC, S5].
- Version-specific quirks that a minimal re-implementation must **not** copy blindly: approximate text alignment (threshold 0.7) treats any two sources shorter than 10 chars as alignable regardless of content ("Allow aligning short strings without comparison", in-code TODO) [SRC, S5]; id support itself only landed in the 4.0 line via PR #639 (2023) after two earlier stages (#566 opaque-metadata in 2021, with 32–34 failing tests at that point) [SRC, S6–S8].

**B. nbformat v5.11.1** — the notebook format implementation: schema + validation + normalization (S1, S3).

- Declares what a saved state can legally contain per declared minor: `id` required at 4.5+ (S1), absent at ≤4.4 (S2) [SRC].
- `normalize`/`validate` **repair or reject** identity defects: fill missing ids, best-effort replace duplicate ids (with warnings), or raise `ValidationError` on duplicates when not repairing [SRC, S3].
- It is **not** a differ: no notebook change observations. Its value here is as the normative oracle for what "declared version" and "identifier validity" mean, and as the documented precedent that identity defects are common enough that the ecosystem auto-repairs them [INF].

**Version-specific behavior supporting a minimal approach** [SRC → INF]:

1. A captured state's declared `nbformat`/`nbformat_minor` (S1/S2) determines whether identifiers can exist at all, so a two-branch identity policy is sufficient — no general fuzzy identity machinery needed: ids exist (use them, but verify uniqueness first) or ids cannot exist (skip to content similarity).
2. nbformat's own repair behavior (S3) proves identity defects (absent, duplicate) occur in real v4.5+ files, so the prototype must classify them explicitly instead of assuming a repaired world — and must **not** let a library repair ids inside a read-only capture path (see N1).
3. nbdime's layering (S5) shows a small fixed set of comparison strictness levels is enough for useful notebook diffs; a prototype can implement only two layers (id-exact; type+line-overlap) and remain faithful to the precedent.
4. Git v2.42.0's rename detection is a config-gated, best-effort heuristic even inside Git (`diff.renames` defaults true, porcelain-only, `diff.renameLimit` 1000) (S11) — so for workspace files, cheap exact-hash rename inference is an adequate precedent-consistent minimal rule.

**Recommendation (N5, one bounded approach + concrete tradeoff)** [CHOICE]:

Use **byte-preserving capture + a small self-implemented two-pass matcher modeled on nbdime's precedence**, and keep **nbformat as an external validation oracle in tests only** (proposed; UNEXECUTED). **Tradeoff:** re-implementing avoids nbdime's runtime weight (web app, VCS integration, assumption of nbformat-converted inputs, S5 docstring) and its provisional heuristics (the <10-char auto-align, TODO-marked thresholds), at the cost of writing and maintaining ~100–200 lines of matching code ourselves; using nbdime directly would buy battle-tested alignment but import heavyweight, GUI-oriented dependencies into a minimal offline prototype and silently apply heuristics we do not want for identity decisions. nbformat stays out of the runtime capture path because `validate()`/`normalize()` mutate repaired ids (S3), which would falsify the captured state.

---

## 3. RQ2 — Separating notebook source/outputs/metadata changes; identifying cells; representing file changes and capture limits

### 3.1 Notebook change observations (N2)

**Observation lanes** [CHOICE modeled on SRC S5]: each matched cell pair is reported in three independent lanes — `source`, `outputs`, `metadata` — mirroring nbdime's structural diff paths, because the comparison predicates (S5) deliberately exclude metadata and `execution_count` from equality while the schema (S1) makes them first-class fields. `execution_count` is reported as a detail but by default is not a change lane (nbdime precedent) [CHOICE]. Lane report shape per cell: `{matched_as: id | similarity | positional-ambiguity, index_a, index_b, source: patch|equal, outputs: patch|equal|added|removed, metadata: patch|equal}`.

**Identity and matching under differing version/identifier conditions** [INF from S1–S3, S5]:

- Gate on each snapshot's **declared** minor: ≤4.4 ⇒ no cell can have an id (S2); ≥4.5 ⇒ ids are required by schema but may be **absent** (warning-only in nbformat) or **duplicate** (repaired by nbformat with `DuplicateCellId`; ValidationError when not repairing) (S3) [SRC].
- Two-pass matcher:
  - **Pass 1 (id-exact):** pair cells whose ids are equal, only when both ids exist **and are unique within their own snapshot**. Duplicate ids inside a snapshot are never used as keys; those cells are flagged `ambiguous_identity` and dropped to Pass 2 [CHOICE; precondition justified by S3/S4 uniqueness invariant].
  - **Pass 2 (type + similarity):** for remaining cells (id-less×id-less, and id-less×id-ed, per nbdime's looser layers S5), pair same-`cell_type` cells by line-overlap similarity `sim = common_lines / max(lines_a, lines_b)`, threshold **sim ≥ 0.5**, tie-break by smaller index distance; leftovers are `added`/`removed` [CHOICE; threshold and its boundary are exercised by the witness in §6].
  - A matched pair whose indexes differ is reported as **moved/reordered** — a placement observation, not a content change [CHOICE].
- **Ambiguity is surfaced, never silently resolved:** duplicate ids, absent ids in a 4.5+ file, and cross-version comparisons (4.4 vs 4.5) are all reported in a `provenance/ambiguity` section listing which matching layer produced each pairing [CHOICE; consequence of S3's warning/repair behavior — nbformat silently rewrites exactly these defects, which would otherwise hide the ambiguity].

### 3.2 Workspace file observations (N3)

- **Text edit** (observed fact): same path present in both manifests with different content hash ⇒ `edited`. [CHOICE for rule; the fact is the hash difference.]
- **Rename — observed difference vs inferred equivalence (kept separate):** path P in A missing from B, path Q in B missing from A, and **content hash equal** ⇒ report both primitive observations (P removed; Q added) *plus* an explicitly labeled inference: `possible_rename P→Q (rule: exact content hash equality)`. The equivalence rule is the prototype's choice, not an observed fact — an exactly-equal duplicate copy is indistinguishable from a rename given only two states [INF; precedent S11: even Git's rename detection is heuristic, config-gated, and porcelain-only]. Optionally a similarity-based rule can be offered, always labeled as inference with its evidence (hashes/similarity value), never merged into the fact lane.
- **Untracked file:** present in the live workspace directory but absent from the snapshot manifest ⇒ reported as `untracked`, with **no captured content**; Git's own glossary at v2.42.0 carries this semantics via the index/working-tree definitions rather than a standalone entry (S12) — in this prototype the term is defined by our manifest contract [CHOICE].
- **Limits of captured states:** only two saved states exist; anything between them (order of edits, intermediate states, unsaved buffers — excluded by brief) is unknowable and must not be implied. A file unchanged *between the two snapshots* may still have changed since capture; reports must be scoped to "between snapshot A and snapshot B" [INF; brief's read-only, two-scope condition].

---

## 4. RQ3 — Real issue → fix → test chain, scoped lesson, and validation

**Chain (all locators verified public):**

1. **Issue:** nbdime **#553** "Support cell IDs" (2020-12-03): cell ids (JEP 62) need a diffing/merge identity policy; open questions on ID-vs-content precedence and merge conflicts (S6).
2. **Interim fix:** PR **#566** (merged 2021-04-12): treat `id` as opaque metadata so nbdime "doesn't fall over" and doesn't drop ids; ~32 tests still failing at drafting (S7).
3. **Real fix:** PR **#639** "Add support for using cell ID in diffing and merging" (merged 2023-11-01, "Fixes #553"): commits `7eb83fbc` (atomic id paths via `DiffConfig.is_atomic`), `4f71a5fd` ("Add ID check in cell comparison" — strictest layer: id-less never equals id-ed; looser layers allow id-less≈id-ed), `1b318e6d` ("Always use line based diffing for source") (S8). Landed behavior visible at tag v4.0.4: `compare_cell_by_ids` + predicate precedence + `atomic_paths["/cells/*/id"]` (S5).
4. **Test:** commit **`17caf86f`** ("Fix tests for cell IDs — Enable previously not working test") modified `nbdime/tests/test_merge_notebooks.py` (+9/−8, file confirmed present at v4.0.4, S10): it **removed `@pytest.mark.xfail`** from `test_merge_multiline_cell_source_conflict` and replaced the old comment ("when is a cell modified and when is it replaced?") with "This only works with cell ids hinting that the cells are the same"; also fixed the expected diff path type (`("cells","0","source")` → `("cells",0,"source")`) (S9).

**Traceable failure → fix → test narrative:** before ids were used, a multiline edit to a cell on both sides could be misclassified as *cell replaced* (delete+add) instead of *cell source modified* — the test for the desired behavior existed but could only `xfail` because content-only matching could not distinguish modification from replacement. The fix added the identity layer (id equality in the strictest comparison) which made the previously-impossible test pass, and the same commit un-xfails it, locking the behavior in [SRC, S5, S8, S9 → INF].

**Scoped engineering lesson (for this prototype, not a general claim):** an alignment step that cannot use an identity signal turns "modified" into "delete+add" whenever content drifts far enough; conversely an identity signal alone is unsafe when identifiers may be absent or duplicated. Hence the layered matcher in §3.1, with duplicate/absent-id ambiguity surfaced. Directly transferable validation requirement: keep a "currently impossible" (xfail-style) test for the exact case the identity layer should enable, and flip it with the implementation, as nbdime did [INF].

**Correction this chain supports (see P2, §6):** matching must be **layered identity-first, content-second**, with the id field diffed atomically — not position-based, and not content-only.

---

## 5. Obligations N1–N4 — specification for the prototype

### N1 — Bounded capture/input contract and read-only two-state comparison

- A **snapshot** is a directory: `manifest.json` + `files/` byte-mirror. `manifest.json` records: `contract_version`, `workspace_name`, `created_utc`, and `entries[] = {path, kind: notebook|text, sha256, byte_length}`. Exactly one entry has `kind: notebook` and a `.ipynb` extension; at most two `text` entries. [CHOICE]
- The prototype **records the notebook's declared `nbformat` and `nbformat_minor` exactly as parsed from the captured bytes** and never rewrites a capture (S3 shows library normalization would add ids and bump/rename identity — so capture parsing uses a plain JSON parser, not `nbformat.normalize`/`validate`) [CHOICE on implementation; SRC motivates it].
- **Unsupported inputs are refused with reasons:** JSON unparseable; `nbformat.major ≠ 4` (S1: only major 4 has a schema); declared minor **greater than the highest schema the prototype knows** → processed in a `future_minor` mode: structure-only comparison, mirroring nbformat's own future-minor relaxation of `additionalProperties` and unknown cell/output types (S3) [SRC precedent → CHOICE].
- **What absent capture data and unsaved changes leave unknown (reported, not guessed):** unsaved editor buffers (excluded by the brief) are invisible to any snapshot; an untracked file's content is unknown (not captured); whether a 4.5+ cell ever *had* an id that was lost is unknowable from the capture; anything between the two capture instants is unknowable. Duplicate ids in a 4.5+ snapshot mean the file as captured is schema-nonconforming under the uniqueness invariant (S4) and identity comparison degrades to the ambiguity path (§3.1) [INF].

### N2 — Notebook change observations with identity/ambiguity behavior

As specified in §3.1: three lanes (source/outputs/metadata); two-pass identity matching; ambiguity reports for absent/duplicate ids and cross-minor comparisons; reorder reported as move, never as content change; matching layer recorded per pair.

### N3 — Workspace observations: edits, rename, untracked

As specified in §3.2: hash-difference = observed edit; rename is always a labeled inference under an explicit, displayed equivalence rule (exact-hash default); untracked = not in manifest ⇒ content unknown/unrecoverable; all observations scoped to the two captured instants.

### N4 — Recovery into a new destination from an explicitly selected snapshot

- Recovery takes **one explicitly selected snapshot** and one destination path [CHOICE].
- **Existing-destination refusal:** if the destination exists (file or directory), refuse; never merges into or over anything (brief: never reset/checkout-over/merge/rewrite the original) [CHOICE].
- **Copy scope = manifest entries only**, byte-identical from `files/`. **Missing snapshot content:** a manifest entry whose stored blob is missing or hash-mismatched ⇒ refuse that entry and report `snapshot_incomplete`; if the notebook is unrecoverable, abort the whole recovery rather than produce a partial state silently [CHOICE].
- **Untracked files:** listed as `not_captured — cannot recover`; never synthesized [CHOICE; consistent with N1's "never promise recovery of uncaptured content"].
- **Name collisions:** within a single snapshot, duplicate manifest paths are a capture-time validation error (refused at snapshot load); since recovery targets one snapshot into an empty directory, no other collision class exists — any residual collision attempt is refused, not overwritten [CHOICE].
- **What is recoverable:** exactly the captured files of the selected snapshot, byte-identical (verifiable by recomputed hashes — proposed check T7, UNEXECUTED). Nothing else is promised.

### N5 — Meta-obligation

Satisfied by: the two-component comparison + recommendation (§2), the real issue→fix→test chain (§4), and the revised plan with concrete steps and discriminating validation covering N1–N4 (§7).

---

## 6. Method check: exactly three decision propositions + one numerical witness

### Propositions (one per research question)

| # | Proposition (as asserted) | Source/version anchor | Applicability condition | Relevant exception | Normative force | Status |
|---|---------------------------|----------------------|-------------------------|--------------------|-----------------|--------|
| P1 (RQ1) | The format layer is the identity oracle: a v4.5+ notebook's cells are required to carry unique, pattern-valid ids (`^[a-zA-Z0-9-_]+$`, 1–64 chars), and identifiers do not exist at all in ≤4.4 saved states — so the prototype branches its identity policy on each snapshot's declared minor. | S1 (v5.11.1, v4.5 schema), S2 (5.0.8, v4.4 schema), S3 (v5.11.1 validator.py), S4 (JEP 62) | Only for saved states declaring major 4; minor ≤4.4 ⇒ no-id branch; ≥4.5 ⇒ id branch | In 4.5+ files ids may still be **absent** (warning-only) or **duplicate** ("best effort to repair" + `DuplicateCellId` in the repairing path; `ValidationError` in the non-repairing `isvalid` path); uniqueness-across-notebooks explicitly not a goal (S4) | Schema `required`/`pattern` are normative MUSTs for validity; JEP 62 uniqueness is a standards-track invariant; the repair behavior is implementation-defined (warning text itself says it "will stop doing so in the future") | **Adopted with corrections** — supersedes the earlier working proposition "captured ids can be used directly as identity keys" (rejected: absent/duplicate ids occur in the wild, and nbformat's own repair path proves it; the corrected assertion keeps ids as keys only after per-snapshot uniqueness verification, with the ambiguity fallback) |
| P2 (RQ2) | Cell matching must be layered identity-first, content-second: exact id pairing only when both ids exist and are unique; otherwise same-type similarity pairing with a pinned threshold; the id field itself is diffed atomically; modification must be distinguished from delete+add. | S5 (nbdime v4.0.4 `notebooks.py`: predicate precedence, `compare_cell_by_ids`, `atomic_paths`), S8/S9 (PR #639 + un-xfail commit) | Notebooks already at a single major version (nbdime's own precondition, S5 docstring); our two snapshots may still differ in minor | nbdime's approximate layer auto-aligns sources <10 chars and ignores metadata/execution_count (so "aligned" ≠ "unchanged" in loose layers); its thresholds (0.7/0.95) are in-code TODOs, i.e. provisional, pinned here to v4.0.4 | Implementation precedent, not a spec: nbdime's code is descriptive of v4.0.4 behavior; adopting the layering is our engineering inference; the concrete threshold (0.5) and tie-break are product choices | **Adopted** (no rejection; see §4 lesson and the witness below) |
| P3 (RQ3) | An observed path difference between two snapshots must be reported as observed removal/addition facts, with any rename stated as a labeled inference under an explicit equivalence rule; recovery copies only captured bytes into a new, non-existing destination and refuses on incompleteness/collision. | S11 (Git v2.42.0 diff-config: rename detection heuristic, default true, porcelain-only, renameLimit 1000), S12 (index/working-tree semantics), brief N4 | Two explicit saved states (not a VCS); Git's semantics are precedent, not binding | Git's rename detection can be disabled and is capped (renameLimit); analogously our rename inference can be wrong (e.g., duplicate copies) and is therefore never reported as fact | Git documentation is normative for Git's own tools; used here only as evidence that ecosystem rename detection is best-effort inference — the prototype's rules are product choices | **Adopted via supported correction** — supersedes the earlier working proposition "a path difference means a rename" (rejected: with only two states, rename is underdetermined; even Git treats it as heuristic detection, not ground truth, S11) |

### Numerical witness (discriminating cell-matching/change-count interpretation) — **UNEXECUTED**

- **Consequential interpretation under test:** whether a boundary similarity pair counts as *modified* (pair it) or as *delete+add* (don't pair). This is exactly the modification-vs-replacement confusion nbdime's #553/#639 chain fixed with the identity layer (S6–S9), so pinning the boundary is consequential for N2.
- **Fixture (mine, not from any evaluator):** snapshot A declares 4.4 (ids impossible, S2) with one code cell `X` of 2 source lines: `["x = compute(a)", "y = compute(b)"]`. Snapshot B declares 4.4 with one code cell `Y`: `["x = compute(a)", "y = compute(c)"]`.
- **Proposed rule (product choice):** pair same-type cells when `sim = common_lines / max(lines_a, lines_b) ≥ 0.5`.
- **Intermediate reasoning (hand derivation; no execution tool admitted):** common lines = |{"x = compute(a)"}| = 1; max line count = max(2, 2) = 2; sim = 1/2 = 0.5. Competing interpretations: (i) pairing condition `sim ≥ 0.5` — 0.5 qualifies ⇒ report **1 modified cell, 0 added, 0 removed**; (ii) pairing condition `sim > 0.5` — 0.5 fails ⇒ report **1 removed + 1 added (2 change events), 0 modified**.
- **Discrimination:** the two readings produce different change counts (1 vs 2 events) and different lanes (modification vs replacement) for the same input; the fixture cannot be satisfied by both interpretations. It also pins the **boundary semantics** (`≥` vs `>`) that a naive implementation leaves implicit.
- **Status:** values derived by hand above; **no runtime execution, no admitted arithmetic tool, no result claimed.** The fixture becomes test T2 in §7; when implemented, it runs in the prototype's own test suite.

---

## 7. Revised thin plan (replacing `inputs/THIN_PLAN.md` steps) with discriminating validation

Revised steps (each replaces an assumption in the thin plan; the thin plan itself supplied none of the rules — confirmed by its own text):

1. **Capture contract module** (N1): implement `manifest.json` + `files/` snapshot format; validate at load (single `.ipynb`, ≤2 text files, declared-major-4 gate, future-minor mode, duplicate-path refusal). Plain-JSON parsing only in the capture path.
2. **Notebook loader & version gate** (N1/N2): parse notebook; record declared `nbformat`/`nbformat_minor`; classify ids: `present-unique`, `absent`, `duplicate` per snapshot; refuse nothing here — annotate.
3. **Two-pass matcher** (N2): Pass 1 id-exact (unique ids only); Pass 2 type+similarity (threshold ≥ 0.5, tie-break by index distance); report lanes `source`/`outputs`/`metadata` per pair; `moved` flag on index change; record the matching layer that produced each pairing.
4. **Workspace differ** (N3): path-set comparison; observed edit/re-add/remove facts; exact-hash rename inference labeled as inference; untracked listing.
5. **Recovery engine** (N4): explicit snapshot selection; destination-exists refusal; per-entry hash check with `snapshot_incomplete` refusal; byte-identical copy; untracked listed as unrecoverable; no writes to originals.
6. **Report assembly**: one report combining notebook lanes, file observations (facts vs inferences separated), ambiguity/provenance section, and recovery outcomes with refusal reasons.
7. **Fixtures & validation** — all **UNEXECUTED**, discriminating design:

| # | Fixture (discriminates) | Covers | Expected observation if implementation is correct |
|---|------------------------|--------|---------------------------------------------------|
| T1 | Two snapshots, both 4.5, all ids unique, one cell reordered, one output changed | N2 | pair via Pass 1; report move + `outputs` lane change only; `source`/`metadata` equal |
| T2 | Witness fixture of §6 (4.4, sim exactly 0.5) | N2 | pins boundary: exactly 1 modification event (not delete+add) under `sim ≥ 0.5` |
| T3 | 4.5 snapshot with duplicate id in A; same cells in B | N2 | duplicate ids never used as keys; `ambiguous_identity` recorded; pairing via Pass 2; ambiguity section populated |
| T4 | A declares 4.4 (no ids), B declares 4.5 (ids present) | N1/N2 | cross-minor gate; id-less A cells pair via Pass 2; minor-version difference reported in provenance |
| T5 | `notes.txt` renamed `memo.txt` with identical hash; `log.txt` edited; `scratch.tmp` untracked | N3 | facts: removed+added+edited; labeled inference `possible_rename notes.txt→memo.txt`; untracked listed without content |
| T6 | Destination directory already exists | N4 | recovery refused with reason; nothing written |
| T7 | Recovery of a valid snapshot into a fresh destination; recompute sha256 of copied files | N4 | byte-identical copies; original workspace unmodified (compare pre/post hashes) |
| T8 | Manifest entry whose stored blob is deleted | N4 | `snapshot_incomplete`; entry refused; notebook-missing case aborts recovery |
| T9 | "Currently impossible" case mirroring nbdime's xfail (§4): 4.4 pair with heavily edited multiline cell | N2 | with similarity layer active: 1 modified; deliberate negative check that a content-only matcher would report delete+add |

Tests T1–T9 are **designed, not run** in this stage; no pass/fail is claimed anywhere in this document.

---

## 8. Summary of separations

- **Source requirements (normative on the prototype's domain claims):** schema `required`/`pattern` for ids at 4.5+ and their absence at ≤4.4 (S1, S2); JEP 62 uniqueness invariant and load-time id fill (S4); nbformat repair/error behavior on absent/duplicate ids (S3); nbdime v4.0.4 predicate precedence, `compare_cell_by_ids`, atomic id, and the #553→#566→#639→`17caf86f` history (S5–S10); Git rename detection as config-gated heuristic (S11).
- **Engineering inference:** the two-branch identity policy; the modification-vs-replacement lesson transferred from the nbdime chain; rename-as-inference reasoning; unknowns implied by two-state captures.
- **Product choices:** manifest format; plain-JSON capture path; 0.5 threshold with `≥` boundary and index-distance tie-break; three-lane reporting; execution_count as detail-only; refusal rules in N4; exact-hash rename rule as default.
- **Proposed/unexecuted:** the entire §7 fixture set and the §6 witness execution; nbformat-as-oracle in tests.

Superseded propositions ("captured ids are reliable keys"; "path difference ⇒ rename") appear only as corrections in §6/P1 and §6/P3 and are not asserted anywhere as findings.
