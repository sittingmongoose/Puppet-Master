# Research proposal — offline comparison of two saved workspace states and copy recovery (V8-NB-B-Z)

Stage: `research-proposal` (method: condition-witness-with-batching-progressive-retrieval). Date of research: 2026-10-03.
Deliverable type: research-backed revision of the thin plan (`inputs/THIN_PLAN.md`) for a small offline desktop prototype that compares two explicitly captured, read-only saved states of a repository workspace (one nbformat-version-4 `.ipynb` + two ordinary text files) and recovers a selected state into a **new** directory. No implementation is proposed to be executed in this stage; all validation below is **proposed and unexecuted**.

Label legend used throughout:
- **[SRC]** — fact stated or shown by a cited public primary source (with exact locator).
- **[INFER]** — engineering inference drawn from source facts; reasoning shown.
- **[CHOICE]** — product decision for this prototype (could be made differently; tradeoff stated).
- **[CORR]** — supported correction of an earlier, rejected proposition.
- **[TEST-UNEXEC]** — proposed discriminating test. No test, fixture run, or arithmetic has been executed in this stage; there is no execution receipt, so none is claimed as passing.

---

## 0. Research-order note (short; host histories/captures measure actual operations)

Three coherent batches, progressive retrieval (identity/version first, then expanding context):

1. **Batch 1 — identity/version pinning:** latest-release lookups pinned `jupyter/nbdime` **v4.0.4** (published 2026-02-10) and `jupyter/nbformat` **v5.11.1** (published 2026-08-17); nbformat's v4.5 JSON schema and JEP 62 were captured whole; git's rename-detection option documentation was captured at tag `v2.42.0`.
2. **Batch 2 — algorithm/section expansion:** nbdime's diff engine (`diffing/notebooks.py`, `diffing/generic.py`, `diffing/snakes.py`) at tag `v4.0.4`; issue `jupyter/nbdime#553` and its timeline (early events: design discussion; later events: closing PR).
3. **Batch 3 — issue→fix→test verification:** tail of the #553 timeline (closing PR **#639**, merged 2023-11-01), the PR #639 file/patch listing (merge commit `98843814cff07851b94a9690159db3c41a210c18`), including the added test fixture `nbdime/tests/files/cellids--base.ipynb`.

Sources acquired once were reused across related obligations (nbformat schema for N1/N2; nbdime engine for Q1/Q2/N2/N5; git docs for N3). Initial search snippets were treated as leads only; every consequential claim below was re-checked against the expanded capture.

---

## 1. The three research questions

### Q1 — Which two existing components offer useful precedents, and what version-specific behavior supports a minimal approach?

The two components are **nbdime** (notebook diff/merge) and **nbformat** (notebook format schemas, validation, versioning). A third, supporting precedent — git's rename detection (`-M`/`--find-renames`) — anchors the file-level design (N3).

**nbformat — normative versioning precedent [SRC].**
Locator: `jupyter/nbformat` tag `v5.11.1`, file `nbformat/v4/nbformat.v4.5.schema.json` (capture sha256 `523e3578ddbfcad52933d2423dc5951114ef73f48df180b6a601498ba5ca071a`, 16,104 bytes, complete).
- The notebook object requires `["metadata", "nbformat_minor", "nbformat", "cells"]`; `nbformat` is fixed `minimum: 4, maximum: 4`; `nbformat_minor` has `minimum: 5` in this schema variant. `nbformat_minor` is described as "Incremented for backward compatible changes to the notebook format" — i.e., the declared minor selects which features a file may carry. [SRC]
- Each cell definition (`raw_cell`, `markdown_cell`, `code_cell`) has `"required"` including `"id"`; the `cell_id` definition is: `"pattern": "^[a-zA-Z0-9-_]+$"`, `"minLength": 1`, `"maxLength": 64`. [SRC]
- The JSON Schema **cannot express and does not enforce cross-cell uniqueness of `id`** (nothing in the schema constrains `id` across the `cells` array items; contrast `metadata_tags`, which uses `uniqueItems` within one cell). JEP 62 confirms this normative gap explicitly (below). This is the version-specific fact that makes "absent/duplicate identifiers" a *live input condition* rather than an input error. [SRC]
- At tag `v5.11.1`, `nbformat/v4/nbformat.v4.schema.json` is **byte-identical** to `nbformat.v4.5.schema.json` (identical capture sha256 `523e3578…`): the default v4 schema now requires ids. [SRC]
- JEP 62 (`jupyter/enhancement-proposals`, `62-cell-id/cell-id.md` on `master`, status *Implemented*, capture sha256 `7f52a9c2…`) states: "The `id` field in cells would _always_ be **required** for any future nbformat versions (4.5+)"; loaders of older formats update and "fill out [ids] with a unique value"; and the Cons section concedes: "Lack of UUID and a 'notebook-only' uniqueness guarantee makes merging two notebooks difficult without managing the ids so they remain unique" and "Notebooks with the same source code can be generated with different cell ids, meaning they are not byte equal." Uniqueness *across* notebooks is "not a goal". [SRC]
- The schema also defines `unrecognized_cell` / `unrecognized_output` ("from a future minor-revision to the notebook format") — a normative hook for tolerating files whose declared minor exceeds the supported set, by treating unknown cell/output shapes as opaque changes instead of errors. [SRC]

**nbdime — notebook-aware comparison precedent [SRC].**
Locator: `jupyter/nbdime` tag `v4.0.4`, files `nbdime/diffing/notebooks.py` (capture sha256 `bc9c5c5a…`, 18,745 bytes), `nbdime/diffing/generic.py` (sha256 `7ed11454…`), `nbdime/diffing/snakes.py` (sha256 `1293a22f…`).
- Module docstring: "All diff tools here currently assumes the notebooks have already been converted to the same format version, currently v4… Up- and down-conversion is handled by nbformat." nbdime deliberately does **not** own version conversion; a consumer pairs it with nbformat. [SRC]
- Cell alignment uses a predicate list for path `/cells`: `[compare_cell_approximate, compare_cell_moderate, compare_cell_strict, compare_cell_by_ids]`, documented "in order of low-to-high precedence", driven by `diff_sequence_multilevel`. `snakes.py: compute_snakes_multilevel` starts at `level = len(compares) - 1` — so the **id predicate gets the first (coarsest) alignment pass, and unmatched gaps are re-aligned by progressively looser content heuristics**. `compare_cell_by_ids` is exactly: "Only consider equal if both have IDs and they match" (`'id' in x and 'id' in y and x['id'] == y['id']`). [SRC]
- `/cells/*/id` is registered in `atomic_paths`, so identifier changes surface as atomic replace ops rather than being diffed structurally. [SRC]
- Per-field separation exists as API: `notebook_differs` maps `/cells/*/source` → `diff_string_lines`, `/cells/*/outputs` → multilevel sequence diff, `/cells/*/outputs/*` → `diff_single_outputs` (which separates `data` from the rest of an output), `/cells/*/attachments` → `diff_attachments`; `set_notebook_diff_targets(sources, outputs, attachments, metadata, identifier, details)` toggles each category, with `details` = `execution_count`. The approximate/strict output comparators are documented "NB! Ignoring metadata and execution count". [SRC]

**What supports a minimal approach [INFER].** The minimal prototype does not need nbdime's merge machinery, web UI, or VCS integration; it needs three version-conditioned behaviors nbdime/nbformat already model: (1) declared-minor → id availability conditioning (nbformat schema + JEP 62); (2) id-first alignment with content fallback and atomic identifier changes (nbdime predicates/snakes/atomic paths); (3) category-separated change reporting (nbdime diff targets). Each is small enough to reimplement read-only in a bounded core (Section 2).

### Q2 — How should the prototype distinguish source/output/metadata changes and identify cells when version/identifier conditions differ? How should renames, untracked files, and capture limits be represented?

**Cell identity and matching (two-stage, version-conditioned) [CHOICE, built on SRC facts].**

Stage A — **identity-keyed alignment**, applicable only when *both* snapshots declare the notebook with `nbformat == 4`, `nbformat_minor >= 5`, and each snapshot's cell ids are individually schema-valid **and unique within the snapshot** (condition from the v4.5 schema `required: ["id", …]` + JEP 62's uniqueness management expectation; the schema itself cannot enforce uniqueness, so the prototype checks it itself). Under Stage A:
- Same id in both snapshots ⇒ same cell; report per-field changes for `source`, `outputs`, `metadata`, `execution_count`, `attachments`, and `id` separately (categories mirroring nbdime's `set_notebook_diff_targets` [SRC]).
- Id present in only one snapshot ⇒ add/remove, flagged `identity-insert` / `identity-remove` (the id is data: JEP 62 — a cell keeps its id across content edits; a split cell gets a new id on one half).
- Reordering ⇒ matched cells whose index changed; reported as position changes, **not** source edits.

Stage B — **content-keyed fallback alignment** for cells left unpaired (either snapshot declares `nbformat_minor < 5`, or ids absent/duplicate):
- Pairing candidates must match on `cell_type` (nbdime requires this at every predicate level [SRC]); then prefer exact source equality; then weaker similarity, in that order, mirroring nbdime's strict→moderate→approximate ordering [SRC].
- Product simplification [CHOICE]: the prototype uses **exact equality only** for pairing decisions (content hash of `source` + `cell_type`), not nbdime's `difflib`-ratio similarity (`compare_strings_approximate`, threshold 0.7/0.95, and its documented quirk that strings shorter than 10 characters align without comparison [SRC]). Tradeoff: we lose fuzzy move/duplicate detection but gain deterministic, explainable pairings — appropriate for a 1-notebook/2-file synthetic workspace; recorded as a limitation.
- **Ambiguity handling (required, not optional):** duplicate ids within a snapshot (schema-valid [SRC]) are reported as an explicit `ambiguous-identity` set: cells sharing an id are never silently paired one-to-one; the report lists each id with the positions/contents that carry it, and any pairing the user sees is labeled provisional. Id-less cells are never assumed identical to each other merely by position; position-only pairing is reported as `positional, unverified` [CHOICE consistent with JEP 62's admission that equal-content notebooks may carry different ids [SRC]].

**Change categories reported per cell** [SRC categories, CHOICE presentation]: `source` edits (line-level), `outputs` edits (add/remove/patch of outputs; note nbdime's comparators deliberately ignore `metadata` and `execution_count` inside outputs for *matching* — the prototype reports those fields as changed but never uses them for identity), `metadata` edits (cell-level and notebook-root), `execution_count` changes under a separate `details` key (Jupyter semantics make it volatile; recovery of it is byte-faithful but its presence is not evidence of a semantic edit [INFER]), `attachments` edits (nbdime treats an attachment rename as an add+remove pair, not a rename op [SRC] — the prototype copies that conservative representation), and `id` edits as atomic replaces.

**Files: renames, untracked, limits.**
- **Observed vs inferred is the primary distinction** [CHOICE grounded in SRC]. With two independent saved states, a rename is *never observed*: each snapshot records path→content bindings; the evidence is at most "path P present in A only, path Q present in B only". Calling that a rename is an inference. Git's model makes the same separation: rename entries exist only when detection is requested and succeeds — "copied and renamed entries cannot appear if detection for those types is disabled" — via `-M[<n>]`/`--find-renames=[<n>]`, "a threshold on the similarity index (i.e. amount of addition/deletions compared to the file's size)… The default similarity index is 50%", `-M100%` limiting to exact renames (git `v2.42.0`, `Documentation/diff-options.txt`, `-M[<n>]::` section; capture sha256 `6b63f60e…`). [SRC]
- Prototype rule [CHOICE]: for every unmatched (removed P, added Q) pair, compute a line-based similarity `unchanged_lines / max(lines_P, lines_Q)`; report `inferred-rename (score)` when score ≥ threshold, default **50%** (adopting git's documented default; configurable). Below threshold: `removed` + `added`, identity unresolved. The line-count proxy is a simplification of git's byte/delta-based index — recorded as an approximation [CHOICE], and the threshold is a product dial, not a normative requirement (Section 6 witnesses how the dial changes the report).
- **Untracked:** a file present in a snapshot's directory listing but absent from that snapshot's workspace manifest is `untracked`; it is reported and, by default, not recovered (N4). [CHOICE]
- **Capture limits stated in every report:** only two saved states exist; nothing about intermediate history, ordering of edits, or unsaved editor buffers is knowable. If a manifest entry lacks a content hash, identity between snapshots is `unattested`. If the notebook's declared `nbformat_minor` is absent/unparseable, the prototype treats the notebook as pre-4.5 (ids possible but non-normative) and says so. [CHOICE; consequences follow from SRC facts above]

### Q3 — Real implementation failure with a traceable issue → fix → test chain

**The failure [SRC].** `jupyter/nbdime` issue **#553 "Support cell IDs"** (opened 2020-12-03 by collaborator `vidartf`; closed 2023-11-01, state_reason *completed*). nbformat implemented JEP 62 (cell `id` required for 4.5+, via nbformat PR #189); from that point nbdime — written before ids existed — began failing en masse: collaborator `vidartf` wrote "The fresh release seems to have broken a lot of tests (cf. #551)… If this affects the current releases, a patch release… should be cut" (2021-01-14), and member `minrk` proposed the staged plan: "step 1, ignore cell id and make a release with unchanged behavior that is *aware* of cell ids, as if it were any other opaque metadata field", then "explore using cell ids as highest priority for alignment", with duplicate-id regeneration as the fallback ("…an assert-uniqueness pass on the whole cell list to regenerate later occurrences of any duplicate cell ids"). A concrete user-visible regression in the same window is issue **#578** (2021-04-08): `test_pretty_print_code_cell` failed on nbdime 2.1.0 because output now contained `'+  id: compact-theology'` — the new field leaking into a deterministic-output test.

**Fix chain [SRC].**
1. **PR #566 "Add initial cell identifiers awareness"** (opened 2021-02-27 by `krassowski`, merged 2021-04-12), quoting the #553 step-1 plan; its body reports the failure count dropping "from 34 to 32 (fixed `test_pretty_print_code_cell`…)", i.e., ids made schema-visible and test-safe but still treated as opaque metadata.
2. **PR #639 "Add support for using cell ID in diffing and merging"** (opened 2022-11-23 by `vidartf`, **merged 2023-11-01**, merge commit `98843814cff07851b94a9690159db3c41a210c18`), body: "Fixes #553." Its captured patch adds exactly the behavior later shipped in v4.0.4: new predicate `compare_cell_by_ids` appended as the highest-precedence `/cells` predicate; `atomic_paths={"/cells/*/id": True}`; per-level conditions stated in the PR body — strictest: "cells without an ID is never considered equal to cells with IDs"; moderate/approximate: "cells as unequal if they both have ids and they differ. However, they will allow a cell without an ID to be considered similar to a cell with an ID", so "commits where cell IDs are added to notebooks that previously didn't have it should still be able to match cells" (partial merges/rebases covered too); plus `union` merge-strategy repairs and prettyprint output of the id gated behind `config.details`.
3. **Tests [SRC].** The PR #639 file listing shows added fixtures under `nbdime/tests/files/cellids--*.ipynb` (captured: `cellids--base.ipynb`, 139 lines; base contains two cells with **identical source** `x = 3` but distinct ids `c2c4a8f2`, `ac5427e8` — precisely the content-vs-id discriminating case) alongside modifications to the diff engine files (`generic.py`, `sequences.py`, `snakes.py`) and to `prettyprint.py`. The resulting code is verified at tag `v4.0.4` (capture of `diffing/notebooks.py` above).

**Scoped engineering lesson [INFER].** A *backward-compatible minor-version addition* (4.5 ids) silently broke a downstream consumer that matched cells by content-only structure: new fields leaked into outputs, and structural diffs lost meaning. The durable rules for the prototype: (a) condition matching on the **declared** minor version and on identifier presence/uniqueness, never assume either; (b) treat identifiers as **atomic values** with their own change category, not as structure to diffuse; (c) gate identifier display/reporting behind an explicit flag; (d) ship fixtures covering id-less→id-ful transitions, duplicate-content/distinct-id, and duplicate-id cases *from day one* (nbdime needed three years and two PRs to get there).

**Validation that follows [TEST-UNEXEC].** The prototype's fixture set (Section 4, F5–F8) replays the nbdime chain at prototype scale: a pre-4.5→4.5 transition fixture, an id-renamed-cell fixture, a duplicate-id fixture (must produce `ambiguous-identity`, no crash, no silent pairing), and a prettyprint-equivalence check that adding ids alone changes no reported source/output/metadata edits.

---

## 2. Component comparison and recommendation (N5)

Formal comparison of the two independently discovered components:

| Criterion | nbdime v4.0.4 | nbformat v5.11.1 |
|---|---|---|
| Role | Notebook diff/merge engine (content-level) | Format schemas, validation, read/upgrade (version-level) |
| Cell identity | Id-first multilevel alignment (`compare_cell_by_ids` first pass; content heuristics fill gaps) [SRC] | Defines `id` (pattern, length); cannot enforce uniqueness; validators per declared minor [SRC] |
| Change separation | Per-path differs + `set_notebook_diff_targets(sources, outputs, attachments, metadata, identifier, details)` [SRC] | Structural: separates schema-required fields; no diff notion |
| Version conditioning | Assumes inputs already converted to same v4 (docstring) [SRC] | Owns version selection/upgrade/`orig_nbformat` [SRC] |
| Fit to prototype (compare two saved states, read-only, offline) | Strong for comparison semantics; heavy if vendored whole (merge/GUI/VCS layers unused) | Strong and small: exact schemas are the capture contract's validator |

**Recommendation [CHOICE]:** build the prototype on **nbformat as the normative reader/validator** (parse, validate against the declared-minor schema, report unsupported inputs) **plus a small in-prototype reimplementation of nbdime's predicate model** (id-first alignment pass, exact-equality content fallback, atomic id changes, category-separated report). **Concrete tradeoff:** re-deriving alignment forfeits nbdime's battle-tested similarity heuristics and merge strategies (the very machinery PR #639 refined); in exchange, the prototype gets a deterministic, explainable, dependency-light read-only core with explicit refusal states, and nbdime remains cited as the behavioral reference for fixtures and expected outputs. A full nbdime dependency was rejected because its CLI/merge/UI layers exceed the brief's scope (no merge, no VCS rewrite, offline observation) and its approximate comparators embed nondeterminism-adjacent heuristics unsuited to a small auditable tool [INFER]. Git's `-M` is adopted as a *rule shape* (thresholded inference, default 50%) for file renames, not as a component.

---

## 3. Obligation designs

### N1 — Bounded capture/input contract and read-only comparison
- Each snapshot = { `snapshot_id`, `captured_at`, `notebook`: {declared `nbformat`, `nbformat_minor` (as written in the file), schema-validity verdict}, `manifest`: path → {byte length, sha256, recorded_at}, `untracked`: paths seen but not manifested }. [CHOICE]
- Inputs accepted: exactly one v4 `.ipynb` + ordinary text files, in two snapshots. **Refused/reported as unsupported:** major ≠ 4; declared minor greater than the supported schema set (cells/outputs then match the schema's `unrecognized_cell`/`unrecognized_output` shapes and are compared opaquely) [SRC→CHOICE]; notebook failing schema validation (verdict + first error reported, comparison continues only on explicit override) [CHOICE]; duplicate cell ids (reported `ambiguous-identity`, never normalized) [SRC+CHOICE].
- Read-only guarantee: originals, repository metadata and snapshots are opened read-only; comparison writes only its report. [CHOICE per brief]
- **What is unknown when data is absent:** no manifest hash ⇒ identity between snapshots unattested; missing declared minor ⇒ id semantics default to pre-4.5; unsaved editor buffers are out of scope entirely (brief) and never inferred; absence of a file from a snapshot is `removed`/`untracked` but its *deletion event* is unknowable from two states. [INFER]

### N2 — Notebook change observations with identity ambiguity
Covered by Q2 Stage A/B design. Non-negotiable behaviors: source/outputs/metadata/execution_count/attachments/id reported in separate categories; id changes atomic; duplicate ids ⇒ `ambiguous-identity` (no silent pairing); id-less↔id-ful cells may pair under content equality (nbdime PR #639 condition preserved [SRC]); reorders never counted as source edits.

### N3 — Workspace change observations
Observed: text edit (content differs, same path), added, removed, untracked (not manifested). Inferred: `inferred-rename (score)` per the ≥50% (configurable) similarity rule, always shown *with its score and threshold* so the inference is auditable; unresolved identity stays visible as remove+add whenever the rule does not fire. A rename and its two component events are never both claimed. [CHOICE on git -M rule shape [SRC]]

### N4 — Recovery to a new destination from an explicitly selected snapshot
- `recover(snapshot_id, destination)`: **refuse** if `destination` exists (any type, empty or not — explicit `destination-exists` error; simplest safe rule) [CHOICE]; **refuse** with `snapshot-missing-content` listing any manifest-referenced blob not present in the capture, before writing anything (atomic-ish: prevalidate all entries, then write) [CHOICE]; **never** write into or rewrite the original workspace or the snapshots [brief/SRC-normative requirement]; **untracked files are not recovered** (report lists them as not-recovered reasons); recovered tree = manifest entries of the selected snapshot only, so intra-snapshot name collisions cannot arise from the manifest itself (paths are keys), but write-time conflicts (e.g., a path that would require a directory where a file snapshot exists) abort with a named error and no partial state beyond already-written entries, which are reported [CHOICE].
- **Recoverability statement (verbatim obligation):** recovery restores exactly the captured bytes of manifested files of the selected snapshot, including the captured notebook with its captured outputs/metadata/execution_count/ids. Nothing uncaptured is ever promised: no unsaved buffers, no pre-capture history, no untracked content, no reconstruction of deleted intermediates.

### N5 — Comparison, issue chain, revision, validation
Section 2 (two-component comparison + bounded recommendation), Q3 (real issue→fix→test chain with locators), Section 4 (revised thin plan) and its discriminating tests covering N1–N4.

---

## 4. Revised thin plan (concrete steps and discriminating validation)

Steps (replacing THIN_PLAN steps 1–4):

- **S1** Capture contract module: parse/validate both snapshots; record declared `nbformat`/`nbformat_minor`; verify manifest hashes; classify untracked. Produce the N1 unsupported-input refusals.
- **S2** Version-conditioned identity resolution: Stage A id-keyed maps (unique ids, both minors ≥5) with `ambiguous-identity` detection; Stage B exact-equality (`cell_type`, source-hash) fallback; provisional `positional, unverified` label otherwise.
- **S3** Notebook differ: per-category diffs (`source`, `outputs`, `metadata`, `execution_count`, `attachments`, atomic `id`) over paired cells; sequence add/remove/patch ranges for unpaired cells; reorder reported as position change.
- **S4** Workspace differ: same-path byte/line edits; threshold rename inference (default 50%, configurable) emitting `inferred-rename (score, threshold)`; untracked classification.
- **S5** Report renderer: every inference labeled with rule + inputs; capture-limits section stating unknowns (N1/N3).
- **S6** Recovery engine: prevalidation (destination-absent, all blobs present) → write selected snapshot's manifested files → summary with not-recovered reasons (untracked, uncaptured content).
- **S7** Fixture set F1–F10 (below) as automated checks over the full compare→report→recover path.
- **S8** Determinism gate: identical inputs ⇒ byte-identical report (no timestamps in report body; capture metadata quarantined to a header).

Discriminating fixtures/tests [TEST-UNEXEC — proposed, none executed]:

| # | Fixture | Expected discriminator |
|---|---|---|
| F1 | Two snapshots, notebook identical, one text file edited | exactly 1 `text-edit`; 0 cell ops |
| F2 | Cells reordered only (Q2/witness case) | id-paired; 0 source edits; positions changed |
| F3 | Cell source edit + outputs change, ids stable | separate `source` and `outputs` category ops; no `metadata` op |
| F4 | `execution_count` only change | reported under `details`; **not** as source/output/metadata edit |
| F5 | Minor declared 4.4 in one snapshot, 4.5 (ids) in other; same cells | Stage B pairing succeeds (id-less ↔ id-ful), per PR #639 condition |
| F6 | Duplicate id in one snapshot | `ambiguous-identity` report; no silent pairing; tool does not crash |
| F7 | Same source in two distinct-id cells (nbdime `cellids--base.ipynb` pattern) | id identity wins over content duplication |
| F8 | Id changed, content identical | atomic `id` replace op; 0 source edits |
| F9 | Renamed text file, 55/100 lines unchanged | `inferred-rename (0.55 ≥ 0.50)`; at threshold 0.60 instead: `removed`+`added` (witness) |
| F10 | Recovery: existing destination / missing manifest blob / untracked file present | three distinct refusal/error states; untracked listed not-recovered; original workspace unchanged (verify hashes before/after) |

Acceptance: F1–F10 pass under the determinism gate; F10 additionally verifies origin immutability.

---

## 5. Three-proposition check (exactly one per research question)

| | Proposition (P1, Q1) | Proposition (P2, Q2) | Proposition (P3, Q3) |
|---|---|---|---|
| Statement | Cell identity may be keyed on `id` **only under declared version conditions**: nbformat major 4, minor ≥ 5, ids schema-valid and unique within the snapshot; otherwise identity is provisional and content-based. | Useful notebook change observation = category-separated diff (source/outputs/metadata/execution_count/attachments/atomic id) over an alignment that is id-first with exact-content fallback. | A real, version-driven consumer breakage (nbdime vs nbformat-4.5 ids) has a traceable issue→fix→test chain and yields the matching-invariant lesson adopted in N2. |
| Source/version | nbformat v5.11.1 `nbformat.v4.5.schema.json` (sha256 `523e3578…`): `required` incl. `id`, pattern `^[a-zA-Z0-9-_]+$`, 1–64; JEP 62 (`62-cell-id/cell-id.md`, status Implemented, sha256 `7f52a9c2…`): "always be required for any future nbformat versions (4.5+)". | nbdime v4.0.4 `diffing/notebooks.py` (sha256 `bc9c5c5a…`): predicates `[approximate, moderate, strict, by_ids]`, `compare_cell_by_ids` ("Only consider equal if both have IDs and they match"), `atomic_paths={"/cells/*/id": True}`, `set_notebook_diff_targets(...)`; `diffing/snakes.py` (sha256 `1293a22f…`): multilevel starts at highest-precedence level. | Issue jupyter/nbdime#553 (opened 2020-12-03, closed 2023-11-01 *completed*); PR #566 (merged 2021-04-12; "fixed `test_pretty_print_code_cell`", 34→32 failures); issue #578 (failure record, nbdime 2.1.0 + nbformat 5.1.2); PR #639 (merged 2023-11-01, commit `98843814…`, "Fixes #553", per-level id conditions + `cellids--base.ipynb` fixture with duplicate content/distinct ids); shipped code verified at v4.0.4. |
| Applicability condition | Both snapshots' notebooks; comparison stage entry. | Any v4 notebook pair already validated by the N1 contract (same major; unknown-minor handled as pre-4.5). | Prototype matching/reporting design and its fixture set. |
| Exception | minor < 5 ⇒ ids legitimately absent (JEP 62 loaders' auto-fill is a *loader* behavior, not a property of stored files); duplicates remain schema-valid; cross-notebook uniqueness "not a goal"; future minors ⇒ `unrecognized_cell`/`unrecognized_output` opaque handling. | nbdime's own comparators are approximate (short-string auto-align, metadata/execution_count ignored for matching); attachment renames appear as add+remove, not rename — the prototype's exact-equality choice forfeits the fuzzy pairing these enable. | strict predicate: id-less cell **never** equals id-bearing cell; moderate/approximate: id-less may pair with id-bearing; `union` merge strategy applies only to sequence types (dict unions error) — recorded to prevent over-generalizing the fix. |
| Normative force | Schema `required` = validation obligation for 4.5+ files; JEP 62 "should" items = application recommendations, not file guarantees. | Implementation behavior (descriptive): what nbdime v4.0.4 *does*; a reference model, not a standard. | Engineering evidence (descriptive history) + maintainer-stated behavioral conditions (PR #639 body); no standards force. |
| Evidence vs inference vs choice | Schema/JEP text [SRC]; "our two synthetic snapshots may legitimately carry absent/duplicate ids" [brief's synthetic condition, SRC of brief]; threshold-free unique-id precondition check [CHOICE]. | Predicate ordering & atomic ids [SRC]; exact-equality-only fallback and report schema [CHOICE]; "reorders are not source edits" [INFER from id-pairing semantics]. | Chain facts [SRC]; scoped lesson (a)–(d) in Q3 [INFER]; fixture replay at prototype scale [CHOICE]. |
| Supported correction ([CORR]) | Rejects the initial plan proposition "match cells by their id whenever an id field exists": unversioned id-keying is unsound because ids are only required (and only meaningful as identity) for declared 4.5+, and duplicates survive validation. Corrected to the version-conditioned two-stage rule. | Rejects two naive propositions: "nbdime diffs cells by cell id" (it aligns id-first then content-backfills gaps) and "nbdime diffs cells by content only" (ids take the first pass when present). Corrected to: id-first coarse alignment + content backfill, ids atomic. | Rejects the 2021 interim proposition "treat cell id as ordinary opaque metadata" (PR #566 step 1) as an endpoint: superseded by PR #639's id-semantic alignment. Its kernel is preserved as an exception — id-less cells must still match id-bearing cells under content equality. |

---

## 6. Discriminating numerical witness (cell matching change counts) — **UNEXECUTED**

Scenario (values chosen here; no evaluator values): snapshot A cells `[a, b, c, d]` (unique ids; sources sₐ, s_b, s_c, s_d), snapshot B cells `[c, d, a, b]` — a pure rotation, no content edits.

Competing interpretations of "what changed":
- **(I) Identity-keyed counting** (P2's Stage A): pair equal ids. The longest common *ordered* id subsequence of `[a,b,c,d]` and `[c,d,a,b]` has length 2 (`[a,b]` at A-positions 0–1 / B-positions 2–3, or `[c,d]` at A-positions 2–3 / B-positions 0–1; the two candidates cannot both be taken as they cross). Minimum structural script: remove the (4 − 2) = 2 unpaired cells of A in one range op, add the (4 − 2) = 2 unpaired cells of B in one range op ⇒ **2 structural ops, 0 source patches, 4 position changes**. This is nbdime-style snakes behavior (a length-2 snake plus two gap ops). [INFER]
- **(II) Positional counting**: compare A[i] to B[i] for i = 0…3: a≠c, b≠d, c≠a, d≠b ⇒ **4 changed "cells", 0 structural ops**.

The witness: the same captured evidence yields **0 vs 4 source-edit counts** (and 2 vs 0 structural ops) depending solely on the identity rule — so a test that asserts "pure reorder ⇒ zero source edits" (F2) discriminates the interpretations, and any observed count outside {0 edits + 2 structural ops} under (I) falsifies the id-first implementation. Intermediately: LCS = 2 ⇒ removed 4−2 = 2, added 4−2 = 2 ⇒ 2 range ops (derivation shown; **arithmetic not executed** — no admitted deterministic arithmetic tool exists in this stage's toolset, so per method this is a reasoned UNEXECUTED witness and no runtime result is claimed). The condition stack from P1 applies: if ids were absent or duplicated, interpretation (I) is unavailable and the count must instead be produced — and labeled — by Stage B rules.

---

## 7. Sources and exact locators (all publicly retrieved and captured this stage, 2026-10-03)

1. `jupyter/nbdime` — latest release API (`api.github.com/repos/jupyter/nbdime/releases/latest`): tag **v4.0.4**, published 2026-02-10 (capture sha256 `8bc19b5003338b7c8a6997191f98be5ec24422cfeec9e5e925426d292128276c`).
2. `jupyter/nbdime` tag `v4.0.4`, `nbdime/diffing/notebooks.py` (raw.githubusercontent.com; sha256 `bc9c5c5ad149661e7d3f6a99e43c657a91cce91ee1411611656df0dc61e837d2`): module docstring; `compare_cell_by_ids`; `notebook_predicates` (`/cells` predicate list); `notebook_config` `atomic_paths`; `set_notebook_diff_targets`; comparator "NB! Ignoring metadata and execution count" comments; `diff_attachments` rename-as-add+remove comment.
3. `jupyter/nbdime` tag `v4.0.4`, `nbdime/diffing/generic.py` (sha256 `7ed11454…`): `diff_sequence_multilevel`, `compare_strings_approximate` (thresholds 0.7/0.95 usage; difflib-based).
4. `jupyter/nbdime` tag `v4.0.4`, `nbdime/diffing/snakes.py` (sha256 `1293a22f…`): `compute_snakes_multilevel` level ordering (starts at `len(compares) - 1`).
5. `jupyter/nbformat` — latest release API: tag **v5.11.1**, published 2026-08-17 (capture sha256 `4e7c7592aeae719f17b4a30fe6e7ec45ba0d3606445f586e121581d7d48d1452`).
6. `jupyter/nbformat` tag `v5.11.1`, `nbformat/v4/nbformat.v4.5.schema.json` (sha256 `523e3578ddbfcad52933d2423dc5951114ef73f48df180b6a601498ba5ca071a`): `cell_id` definition; per-cell-type `required`; `nbformat`/`nbformat_minor` constraints; `unrecognized_cell`/`unrecognized_output`; `metadata_tags` `uniqueItems` contrast. Note: `nbformat/v4/nbformat.v4.schema.json` at the same tag is byte-identical (same sha256).
7. `jupyter/enhancement-proposals` `master`, `62-cell-id/cell-id.md` (JEP 62, status Implemented; sha256 `7f52a9c224fd11509db187187f6e1bd760a329ba836a3b40945b47bcde463992`): id required for 4.5+; loader auto-fill; uniqueness caveats (Cons; Q&A on paste/split); "same source code… different cell ids… not byte equal".
8. `git` tag `v2.42.0`, `Documentation/diff-options.txt` (sha256 `6b63f60e2945cd4973d5696451fe3032cf7302862bcac73c2627246f653f4488`): `-M[<n>]`/`--find-renames` (similarity threshold, default 50%, `-M100%` exact), `--no-renames`, `--[no-]rename-empty`, `-B` defaults (60%/50%), and "copied and renamed entries cannot appear if detection for those types is disabled".
9. `jupyter/nbdime` issue **#553** "Support cell IDs" + issue timeline (search capture sha256 `fc4c8732…`; timeline capture sha256 `11f90db8…`): problem statement, staged plan (minrk, 2021-01-15), edge cases (vidartf: duplicate-then-delete-original; identical splits differing only in ids), closure 2023-11-01.
10. `jupyter/nbdime` **PR #566** "Add initial cell identifiers awareness" (merged 2021-04-12; cross-reference in #553 timeline): step-1 awareness fix; "34 to 32" failing tests; `test_pretty_print_code_cell` fix. Corroborating failure record: issue **#578** (2021-04-08; `'+  id: compact-theology'` in expected output, nbdime 2.1.0).
11. `jupyter/nbdime` **PR #639** "Add support for using cell ID in diffing and merging" (merged 2023-11-01; merge commit `98843814cff07851b94a9690159db3c41a210c18`; files/patch listing capture sha256 `5419301a…`, first 32,768 of 113,566 bytes): adds `compare_cell_by_ids`, `atomic_paths`, per-level id conditions, `diff_string_lines` for `/cells/*/source`, union-strategy repairs, `prettyprint.py` id output behind `config.details`, and test fixtures `nbdime/tests/files/cellids--base.ipynb` (added; duplicate-content/distinct-id cells `c2c4a8f2`/`ac5427e8`).

Superseded propositions are excluded from the asserted findings above except where a rejection is itself the evidence ([CORR] entries in Section 5).
