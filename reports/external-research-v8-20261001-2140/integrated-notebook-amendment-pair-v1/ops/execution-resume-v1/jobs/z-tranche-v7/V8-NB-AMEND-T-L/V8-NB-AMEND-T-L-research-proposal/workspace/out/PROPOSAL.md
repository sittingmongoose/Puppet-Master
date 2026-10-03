# PROPOSAL — Offline saved-state compare-and-recover for a notebook workspace

Case: V8-NB-AMEND-T-L · Stage: research-proposal · Date: 2026-10-03
Deliverable: research-backed revision of `inputs/THIN_PLAN.md` for a small local desktop prototype that compares two captured saved workspace states (one version-4 `.ipynb` notebook + two ordinary text files; one file may be renamed, one may be untracked; cells may be reordered/edited; outputs/metadata may change; cell ids may be absent or duplicate) and recovers a selected state into a **new** destination directory.

**Validation status: no fixture, test, or arithmetic in this document was executed in this stage.** Every validation item is *proposed* and needs an admitted execution receipt before any "passed" claim is made. (Tests marked **[TEST-P]**.)

## 0. Claim labels used throughout

- **[SRC-n]** — a fact asserted by a captured primary source; conditions and exceptions are preserved in the citing sentence.
- **[INFER]** — engineering inference drawn from sources; the reasoning is stated inline.
- **[CHOICE]** — a product decision for this prototype, not required by any source.
- **[CORRECTION]** — a supported correction to the thin plan, with evidence.
- **[TEST-P]** — a proposed, unexecuted test.

## 1. Source register (all discovered independently this stage; no evaluator list was supplied)

All captures are exact HTTP response bodies taken on 2026-10-03 (host-recorded); body sha256 prefixes are given for verification.

| id | Source / version locator | body sha256 |
|---|---|---|
| S1 | `jupyter/nbdime` tag **v4.0.4** (commit `925a31e35481c0dc9e937771479b30a4e7df2290`), `nbdime/diffing/notebooks.py` — symbols `compare_cell_approximate`, `compare_cell_moderate`, `compare_cell_strict`, `compare_cell_by_ids`, `notebook_predicates`, `notebook_differs`, `notebook_config`, `set_notebook_diff_targets`, `compare_output_approximate/strict`, `compare_text_approximate/strict` | `bc9c5c5ad149…` |
| S2 | `jupyter/nbdime` tag **v4.0.4**, `nbdime/diffing/generic.py` — `diff_sequence_multilevel`, `diff_string_lines`, `compare_strings_approximate` | `7ed11454e7e9…` |
| S3 | `jupyter/nbdime` tag **v4.0.4**, `nbdime/tests/test_notebook_diff.py` (diff/patch roundtrip property tests over the fixture corpus) | `b5b4aaffe10b…` |
| S4 | `jupyter/nbdime` issue **#553** "Support cell IDs" (opened 2020-12-03, closed 2023-11-01, state_reason `completed`) | `553e301eaf2a…` |
| S5 | `jupyter/nbdime` PR **#566** "Add initial cell identifiers awareness" (merged 2021-04-12) | `d496eee5e0f2…` |
| S6 | `jupyter/nbdime` PR **#639** "Add support for using cell ID in diffing and merging" (merged 2023-11-01T12:17:51Z, fixes #553) | `bc20207428bb…` (search capture incl. #639 body) |
| S7 | `jupyter/nbformat` tag **v5.11.1** (commit `75f819f5b60bc6ffc72145c364132efe5b3c4b35`), `nbformat/v4/nbformat.v4.5.schema.json` — JSON pointer `/definitions/cell_id`, cell `required` arrays, root `nbformat`/`nbformat_minor` constraints, `/definitions/misc/metadata_name` | `523e3578ddb6…` |
| S8 | `jupyter/nbformat` tag **v5.11.1**, `nbformat/validator.py` — `_normalize`, `validate`, `_validate`, `isvalid`, `normalize`; warnings `DuplicateCellId`, `MissingIDFieldWarning` | `3db1fe48de10…` |
| S9 | Jupyter Enhancement Proposal **JEP 62** "Cell ID Addition to Notebook Format" (`jupyter/enhancement-proposals`, `62-cell-id/cell-id.md`, status: Implemented, date 2020-09-25), on `master` | `7f52a9c224fd…` |
| S10 | `git/git` tag **v2.43.0**, `Documentation/diff-options.txt` — options `-M`/`--find-renames`, `-B`/`--break-rewrites`, `-l<n>`, `--no-renames`, `--[no-]rename-empty`, `--diff-filter` | `c7b3566f63b7…` |
| S11 | GitHub tags listings: `jupyter/nbdime` (latest tag v4.0.4) body `193db3c4323f…`; `jupyter/nbformat` (latest tag v5.11.1) body `5d2e8b037719…`; `nbdime/tests` directory listing at v4.0.4 body `bed24badc763…` | see left |

Negative capture: `nbformat@v5.11.1 docs/migrations.rst` returned 404 (`d5558cd419c8…`); see `out/UNRESOLVED_LEADS.md` lead 3.

## 2. Q1 — Which two existing components offer useful precedents, and what version-specific behavior supports a minimal approach?

**Component 1: `jupyter/nbdime` v4.0.4 (notebook-aware structural diffing).**
- nbdime computes diffs over nbformat dicts with a *multilevel sequence diff* for `/cells`: `notebook_predicates["/cells"]` is an ordered list of comparison predicates "in order of low-to-high precedence": `[compare_cell_approximate, compare_cell_moderate, compare_cell_strict, compare_cell_by_ids]` [SRC-1]. The multilevel engine consumes this ordered predicate list (`diff_sequence_multilevel` → `compute_snakes_multilevel(a, b, compares)`) [SRC-2]; the internal pass order of `compute_snakes_multilevel` is not captured here (see leads 1).
- Version-specific behavior that matters: since PR #639 (merged 2023-11-01), `compare_cell_by_ids(x, y)` "Compare cells x,y strictly using cell IDs — Only consider equal if both have IDs and they match" [SRC-1, S6]. It is the **highest-precedence** predicate. The `/cells/*/id` path is declared **atomic** (`atomic_paths={"/cells/*/id": True}`), so a changed id is a single replace op, never an inner patch [SRC-1]. `set_notebook_diff_targets(sources, outputs, attachments, metadata, identifier, details)` exposes per-field inclusion/ignoring, including `/cells/*/id`, `/metadata`, `/cells/*/outputs`, and `execution_count` as "details" [SRC-1].
- nbdime's own boundary condition: "All diff tools here currently assumes the notebooks have already been converted to the same format version, currently v4 at time of writing. Up- and down-conversion is handled by nbformat." [SRC-1, module docstring]. So nbdime itself treats declared version as an input precondition, not something the differ verifies.
- Shipped validation style: `nbdime/tests/test_notebook_diff.py` at v4.0.4 asserts diff/patch roundtrips, e.g. `patch_notebook(a, diff_notebooks(a, b)) == nbformat.from_dict(b)` over "any pair of notebooks in the test suite" [SRC-3].

**Component 2: git's rename/copy detection (diffcore), docs at v2.43.0 (file-level precedent).**
- `-M[<n>]`/`--find-renames`: "If `n` is specified, it is a threshold on the similarity index (i.e. amount of addition/deletions compared to the file's size)… To limit detection to exact renames, use `-M100%`. **The default similarity index is 50%.**" (Also documents the `-M5` = 0.5 parsing quirk.) [SRC-10]
- Rename/copy detection is a *generated view*, not stored data: `--diff-filter` notes "copied and renamed entries cannot appear if detection for those types is disabled" [SRC-10]. Status letters `A|C|D|M|R|T|U|X|B` are the reporting vocabulary [SRC-10].
- Cost/limits are explicit: the exhaustive fallback comparing "all remaining unpaired destinations to all relevant sources" is **O(N²)** and is bounded by `-l<num>` (default `diff.renameLimit`; `0` = unlimited) [SRC-10]. `-B` interplay: with `-B`, a totally-rewritten file can also be a rename source (n defaults to 50%, m to 60%) [SRC-10]. `--no-renames` turns detection off "even when the configuration file gives the default to do so" [SRC-10] — this capture does not itself state the on-by-default value, so this proposal makes no claim about it (lead 4).

**Substrate: `jupyter/nbformat` v5.11.1 (format + validation semantics).** See §3 and §4 for the v4.5 cell-id constraints; latest tag v5.11.1 [SRC-11].

**Why this supports a minimal approach** [INFER]: nbdime demonstrates that a small, ordered predicate ladder over the notebook's JSON structure — not a line-diff of serialized JSON — is sufficient to separate source/output/metadata/identity changes, and its approximate heuristics show where such ladders can silently misalign (§3.4). git shows the file-level vocabulary: report renames as a threshold-based *inference* over delete/add pairs, with an exact-content fast path and a bounded candidate set. Both ideas are small enough to reimplement locally (~300–500 lines) for a two-snapshot, one-notebook prototype; neither project needs to be imported wholesale [CHOICE].

## 3. Q2 — Separating source/output/metadata changes; cell identity when version/identifier conditions differ; files: renames, untracked, capture limits

### 3.1 Notebook change model (per-field lattice)

Observe each cell as fields that mirror nbdime's diff paths and ignore-switches [SRC-1, S1]: `source`, `outputs` (code cells; per output: `output_type`, `name`/`text`, `ename`/`evalue`/`traceback`, `data` mimebundle, output `metadata`), `execution_count`, cell `metadata`, `id`, `attachments`. Notebook root `metadata` is a separate field. **[INFER]** nbdime's own comparators deliberately ignore `metadata` and `execution_count` when deciding *cell equality* ("NB! Ignoring metadata and execution_count") [SRC-1] — that is correct for alignment but wrong if silent; this prototype adopts the *separation* but every ignored field still produces its own observation entry. **[CHOICE]** Rule: "no change" is exact equality only; similarity is used exclusively for *alignment suggestions* and is always labeled with its pass and score in the report.

**[INFER]** A specific nbdime hazard supports the exact-equality rule: `compare_text_approximate` returns `True` for any two strings shorter than 10 characters *without comparing them* (`shortlen = 10`, "Allow aligning short strings without comparison"), and otherwise uses a 0.7 similarity threshold; even `compare_text_strict` accepts ≥0.95 similarity as "strict" [SRC-1]. A diff tool reusing these heuristics for reporting could under-report edits in tiny cells. nbdime can afford this because it patches rather than reports; a comparison prototype cannot.

### 3.2 Cell identity and matching ladder (absent / duplicate ids; reordering)

Normative identity conditions first:
- nbformat **4.5+** schema requires `id` on every cell (raw/markdown/code `required` arrays include `"id"`), with `/definitions/cell_id`: `pattern: "^[a-zA-Z0-9-_]+$"`, `minLength: 1`, `maxLength: 64`; root `nbformat` is fixed to major 4 and the 4.5 schema sets `nbformat_minor` minimum 5 [SRC-7].
- JEP 62: the id is a **unique cell identifier within the notebook** ("the JEP proposes a unique cell identifier"); "Uniqueness across notebooks is not a goal"; the id "stays the same once created" even when content changes; splitting a cell gives one part a new id; paste must regenerate on collision; older formats are auto-filled (e.g. `uuid.uuid4().hex[:8]`); and — a direct consquence the JEP names — "Notebooks with the same source code can be generated with different cell ids, meaning they are not byte equal" [SRC-9].
- Uniqueness is **not** enforced by the JSON schema itself: the schema pattern is per-instance, and nbformat's own `metadata_name` description notes the analogous limitation — "This criterion cannot be checked by the json schema and must be established by an additional check" [SRC-7]. In code, the check lives in `nbformat/validator.py::_normalize` [SRC-8].
- nbformat's validator **repairs by default**: public `validate()` runs with `repair_duplicate_cell_ids=True`, so a missing id is generated (`MissingIDFieldWarning` + `generate_corpus_id()`) and a duplicate id is *replaced* (`DuplicateCellId` warning "Non-unique cell id … detected. Corrected to …"). Only `isvalid()` (`repair_duplicate_cell_ids=False`) turns duplicates into `ValidationError("Non-unique cell id … detected.")` [SRC-8]. **[INFER]** A comparison tool must therefore observe an *unmodified copy* of the captured notebook (validate a deep copy with repair disabled, or reimplement the two checks), because the repair path would silently rewrite the very identity this prototype is supposed to report.

Prototype matching ladder for cells of two snapshots A and B **[CHOICE, modeled on S1/S6]**, each match recorded with the pass that produced it:

1. **Pass P1 — id match** (nbdime's `compare_cell_by_ids` semantics): equal ids ⇒ same cell. Condition: use this pass only for id values that are **unique within each state** (the JEP's uniqueness invariant [SRC-9]; duplicates verified by our own check per S8 semantics). If either state has duplicate ids, those ids are excluded from P1 entirely.
2. **Pass P2 — exact content match**: `cell_type` equal and `source` exactly equal (and, for code cells, equal outputs list content). Mirrors nbdime's strictest non-id comparator, but with exact equality instead of the 0.95 threshold (§3.1) [INFER].
3. **Pass P3 — near-match suggestion**: `cell_type` equal and source similarity ≥ 0.95 (the "strict" bar nbdime uses [SRC-1]). P3 candidates are **reported as inferred alignments**, never silently merged.

Derived observations: cells matched by P1 with changed position ⇒ **reorder**; matched cells differing in `source`/`outputs`/`metadata`/`execution_count` ⇒ per-field change entries; a cell whose id changed while P2/P3 content matches ⇒ report "content-matched pair with **id change**" (justified: ids are stable once created [SRC-9], so an id change is itself an observation); unmatched ⇒ add/remove.

Version/identifier conditions, preserved:
- Declared `nbformat_minor` < 5 in a snapshot: ids may be legitimately absent [SRC-7/S9]; matching falls through to P2/P3 for those cells, and the report states that identity was unavailable.
- Declared ≥ 5 but an id is absent or malformed: schema/validator violation — reported from the *unrepaired* dict [SRC-7, SRC-8]; the cell still flows through P2/P3 (nbdime's rule that an id-less cell is never id-equal to an id-bearing cell [SRC-6, SRC-1] is exactly the behavior needed here).
- Duplicate ids in a state: never silently repaired (contrast nbformat `validate()`'s default repair [SRC-8]); the duplicated ids are excluded from P1 and any P2/P3 ambiguity is reported as **unresolved identity** rather than a forced pairing.

### 3.3 Files: edits, rename, untracked

- Manifest model: each snapshot carries `manifest: {path → {sha256, bytes, tracked?}}` (the `tracked` key is our optional capture-contract extension; see §5 step 1). Per path: present-in-both + same hash ⇒ unchanged; different hash ⇒ **edited**; only-in-A ⇒ **removed**; only-in-B ⇒ **added**. [CHOICE]
- **Rename as inference, never an observation**: following git's model [SRC-10], a (removed r, added a) pair is reported as a *rename candidate* only when content similarity(r, a) ≥ τ, with τ default **50%** (git's default similarity index) and τ = 100% shown as "exact"; otherwise the pair stays delete + add. **[INFER]** git computes renames at diff time from A/D pairs (renames "cannot appear if detection … is disabled" [SRC-10]); this prototype copies that reporting convention but **not** git's internal similarity algorithm — our metric is a documented, simple line-based ratio, and the report shows the score and rule version, so the inference stays inspectable and revisable. The JEP's byte-inequality point for identical notebook sources [SRC-9] is the same lesson one level down: content-identity and document-identity are different predicates.
- **Untracked**: tracking status is *not* observable from two saved states alone; it must come from the capture. **[CHOICE]** If the manifest records `tracked: false`, the file is reported "untracked at capture time" and is otherwise an ordinary captured file; if the manifest does not record a `tracked` key, the report says "not present in baseline manifest; tracking status unknown". This preserves the observed-vs-inferred separation instead of guessing.
- Naming: report letters follow git's `--diff-filter` vocabulary (`M`, `A`, `D`, `R` with similarity, plus our `U?` unknown-tracking marker) for familiarity [SRC-10, CHOICE].

### 3.4 Limits of the captured states (what comparison cannot know)

- Only saved states exist in the model: unsaved editor buffers are outside every snapshot, so any change that was never saved is unknowable, and the report must say so rather than infer from file mtimes. [CHOICE, from brief]
- If a manifest entry or notebook bytes are missing from a snapshot, comparisons over that content are *unknown*, not "empty". Declared version vs actual content mismatches (e.g. declared 4.5 with missing ids) are reported as validation observations, never auto-corrected (§3.2). [SRC-7/8 grounding]
- Cross-version snapshots: nbdime itself assumes both notebooks are already in the same format version and delegates conversion to nbformat [SRC-1]. **[CHOICE]** This prototype does **not** up/down-convert (originals and captures are read-only; recovery must return captured bytes). Cross-minor comparisons are flagged "declared versions differ"; structural matching still runs, with per-cell identity conditions applied per state as in §3.2.

## 4. Q3 — A real issue → fix → test chain, the scoped lesson, and validation

**Failure chain (all locators in §1):**

1. **Issue** — `jupyter/nbdime` **#553 "Support cell IDs"**, opened 2020-12-03 by a maintainer right after nbformat 4.5 shipped ids (it cites JEP 62 and nbformat PR #189), explicitly asking whether IDs should take precedence over content when diffing, how changed IDs would be displayed, and how ID conflicts would merge [SRC-4].
2. **Fix step 1** — PR **#566 "Add initial cell identifiers awareness"** (merged 2021-04-12): step 1 of the plan in #553 — treat the id "as if it were any other opaque metadata field" so nbdime "doesn't fall over" and doesn't drop ids. The PR body documents a **failing-test-driven repair**: "The number of failing tests is down from **34 to 32**" [SRC-5].
3. **Fix step 2** — PR **#639 "Add support for using cell ID in diffing and merging"** (merged 2023-11-01, "Fixes #553"): makes nbdime *use* ids for identity — "In the strictest check, cells without an ID is never considered equal to cells with IDs. In the two less-strict comparisons … it will consider cells as unequal if they both have ids and they differ. However, they will allow a cell without an ID to be considered similar to a cell with an ID" — enabling matching across commits that added ids to id-less notebooks and mixed-id states from partial merges [SRC-6].
4. **Test state** — the change is visible in shipped code at tag v4.0.4: `compare_cell_by_ids` as the highest-precedence `/cells` predicate, `/cells/*/id` atomic, `identifier=` switch in `set_notebook_diff_targets` [SRC-1]; the repo's diff/patch roundtrip property tests run over the whole fixture corpus at v4.0.4 (`test_notebook_diff.py`: `patch_notebook(a, diff_notebooks(a, b)) == nbformat.from_dict(b)`) [SRC-3]; PR #566's body shows the test suite was the regression instrument during the fix [SRC-5].

**Scoped engineering lesson** [INFER]: when a storage format's minor version introduces an identity field, a diff/versioning tool that ignores it will (a) produce wrong cell correspondences under reorder/edit and (b) risk dropping the field outright. The demonstrated repair sequence is: first preserve the field opaquely (#566), then use it as identity with strict precedence *plus* fallbacks that tolerate mixed id/no-id states (#639), with the property test suite as the continuous guard. Two adjacent, equally transferable facts: a trusted library may *silently repair* the data you meant to observe (nbformat `validate()` regenerates missing ids and rewrites duplicate ids by default; `isvalid()` does not [SRC-8]) — observation tools must disable repair; and approximate alignment heuristics have report-time hazards (sub-10-character strings compare "equal" without comparison [SRC-1]).

**Proposed validation that follows from the lesson** [TEST-P]: a diff/patch roundtrip property over our own observation model (§6 F1–F2), id-perturbation fixtures (F4–F5) mirroring the mixed-id and duplicate-id conditions from #553/#639, and a "no-repair" check asserting our comparison never adds/changes ids (guarding against the nbformat default-repair trap).

## 5. Obligations N1–N4 (normative product specification)

**N1 — Bounded capture/input contract and read-only comparison.**
Contract [CHOICE]: a *snapshot* is a directory with: (a) the notebook file as saved; (b) `manifest.json` recording the notebook's **declared** `nbformat`/`nbformat_minor` as read from the file, per-file sha256 + byte counts for the notebook and both text files, and an optional `tracked: bool` per entry; (c) a snapshot id. The prototype opens originals and snapshots read-only and writes only to a recovery destination (§N4); no watching, no sync, no git operations [CHOICE, from brief].
Version handling [SRC-grounded]: declared major must be 4 (schema constrains `nbformat` to 4 [SRC-7]); declared minor is reported with every observation; minor < 5 ⇒ ids optional, ≥ 5 ⇒ ids required-but-verified (not repaired). Declared versions differing between the two snapshots is reported; comparison still runs with per-state identity conditions (§3.2/§3.4).
Unsupported/unknown inputs, reported explicitly: undeclared or non-4 versions; malformed ids where ≥5; missing manifest entries or missing stored bytes; unsaved changes (unknowable, §3.4). Absent capture data ⇒ "unknown", never "no change". [CHOICE]
Validation [TEST-P]: fixture with declared 4.4 notebook (ids absent) and 4.5 notebook (id removed by hand) both yield explicit identity-unknown entries (F4a/F4b); a corrupted snapshot (manifest entry without stored bytes) yields unknown, not empty (F8c).

**N2 — Notebook change observations with identity/ambiguity rules.**
Field separation per §3.1; matching ladder per §3.2 with pass provenance on every match; ambiguity under duplicate ids reported as unresolved-identity candidates (all P2/P3 candidates listed, no forced choice); reorder detected only through identity (P1) or, without ids, as P2/P3 alignment *suggestions* explicitly labeled inferred. Output changes are observed per output kind (stream/error/execute_result/display_data), mirroring nbdime's output comparators, but with exact equality as the no-change rule [SRC-1 ground-truth for kinds; CHOICE for exactness].
Validation [TEST-P]: F2 (source-only edit matched by id), F3 (pure reorder ⇒ no add/remove), F5 (duplicate id ⇒ id-pass disabled + ambiguity report), F6 (outputs-only change and execution_count-only change produce exactly the field-specific entries).

**N3 — Workspace file observations: edits, rename, untracked.**
Edits/removed/added from manifest hashes; rename reported only as a **threshold inference** (default τ=50%, exact at 100%, score shown; delete+add otherwise) per §3.3; untracked represented per §3.3 (`tracked: false` ⇒ stated fact from capture; no key ⇒ "tracking status unknown"); unresolved identity is always exposed — the report never presents an inferred rename as an observed fact. [CHOICE on defaults; SRC-10 on the convention]
Validation [TEST-P]: F7a identical content at a new path ⇒ `R (exact)`; F7b ≥50% similarity ⇒ `R (inferred, score)`; F7c <50% ⇒ `A`+`D`; F8a untracked-with-flag recovered and flagged; F8b no-flag ⇒ status unknown reported.

**N4 — Recovery to a new destination from a selected snapshot.**
[CHOICE] Recovery copies **exactly the bytes captured in the one explicitly selected snapshot** into a destination directory that must not exist or must be empty — otherwise **refuse before any write** (existing-destination refusal). Per-file failure policy is fail-closed: if a manifest entry's stored content is missing, recovery aborts with a complete missing-list rather than silently copying a partial state; an explicit `--allow-missing` opt-in may proceed and records every omission in the recovery log. Untracked files are recovered if (and only if) their content was captured, with their tracking status noted. Name collisions cannot arise *within* one snapshot (the manifest is keyed by path) and recovery never merges anything into the original workspace — no reset, checkout-over, or rewrite; nothing uncaptured (other snapshots' content, unsaved buffers, deleted-before-capture files) is ever promised or attempted.
Validation [TEST-P]: F8d (existing non-empty destination ⇒ refusal, zero writes), F8c (missing stored bytes ⇒ refusal + list), F8e (recovered tree byte-equal to selected snapshot contents), F8f (original workspace and both snapshots hash-unchanged after recovery — read-only guarantee).

## 6. Component comparison, recommendation, and revised plan (N5)

**Comparison of the two components** (independently discovered, §2):

| Dimension | nbdime v4.0.4 | git diffcore rename detection (docs v2.43.0) |
|---|---|---|
| Level | notebook JSON structure (cells, outputs, metadata, ids) | file/blob level (paths, contents) |
| Identity model | ordered predicate ladder; id-equality at highest precedence, exact→approximate content below [SRC-1, S6] | none at file level; identity is a similarity *inference* over delete/add pairs [SRC-10] |
| Version conditions | assumes both inputs already same format version; conversion delegated to nbformat [SRC-1] | no format conditions; documented O(N²) fallback bounded by `-l`/`diff.renameLimit` [SRC-10] |
| Boundedness | per-notebook, small n; approximate heuristics are fast but report-hazardous (§3.1) | exact-content fast path + threshold; candidate-set cap [SRC-10] |
| Gap for this prototype | heavyweight CLI/web surface; heuristic equality unsuitable as a report predicate as-is | no notebook structure; no id concept |

**Recommendation** [CHOICE with stated tradeoff]: build the prototype as a small pure-Python tool that (1) reads notebooks with `nbformat` only for parsing/validation-as-observation (repair disabled, deep-copied input — §3.2), and (2) implements nbdime's *model* — per-field separation, atomic id, ordered matching ladder P1→P3 — plus git's *reporting convention* for file renames (threshold inference with exact fast path). Do not import nbdime's application stack or shell out to git: the prototype needs deterministic, labeled observations, not patch generation. **Tradeoff accepted:** id-first matching is deterministic and reorder-stable, but tools regenerate ids on copy/paste [SRC-9 Q2/Q4], so id-equality alone can be wrong; the mitigation (mandatory P2 fallback + pass provenance in every match + unresolved-identity reporting) costs extra report branches, which is the right side of the trade for a comparison tool.

**Revised implementation steps** (replacing thin-plan steps 1–4; each thin step is corrected below):
1. *Capture contract & loader* (thin step 1, corrected): implement the §N1 snapshot layout; read declared `nbformat_minor` from the notebook JSON itself; produce the unsupported/unknown input report; refuse nothing silently. **[CORRECTION]** The thin plan said only "define the small capture/input contract and choose the minimal components" — evidence now fixes both the contract fields and the component model (§6 recommendation), including the version-condition matrix the plan omitted.
2. *Notebook observer* (thin step 2, corrected): parse; validate a deep copy with repair disabled (never call repair-by-default paths [SRC-8]); field lattice; matching ladder with provenance; ambiguity reporting. **[CORRECTION]** The plan's "visible identity ambiguity" is now a concrete rule set (§3.2), not a wish.
3. *File observer* (thin step 2 continuation): manifest diff; τ-rename inference with score; untracked representation. **[CORRECTION]** The plan had no observed-vs-inferred separation for renames; it is now normative (§3.3).
4. *Recovery engine* (thin step 3, corrected): fail-closed copy of the selected snapshot into a new destination with §N4 refusal states and an audit log. **[CORRECTION]** The plan's "explicit refusal/error states" is now enumerated (existing destination, unknown snapshot id, missing content, uncaptured content) with fail-closed defaults.
5. *Fixture set + harness* (thin step 4, corrected): the eight discriminating fixtures below, run under pytest, including the roundtrip property adapted from nbdime's test style [SRC-3]. **[CORRECTION]** The plan said "tiny discriminating fixture set" without content; F1–F8 plus the no-repair and read-only guarantees are the concrete set. All **[TEST-P]**: F1 identical snapshots ⇒ zero observations; F2 source-only edit; F3 pure reorder; F4 version/id-availability mix; F5 duplicate ids; F6 outputs-only / execution_count-only changes; F7 rename at 100%/≥50%/<50%; F8 recovery matrix (untracked, missing content, existing destination, byte-equality, originals untouched).

**Discriminating power check** [TEST-P rationale]: F3 separates id-aware matching from pure sequence alignment (only the latter reports add+remove on reorder); F5 separates our no-repair observation from nbformat's `validate()` default behavior; F7a vs F7b separates exact from inferred rename; F8d/F8f separate "recovery works" from "recovery is safe".

## 7. What remains open

See `out/UNRESOLVED_LEADS.md` (six leads; none blocks implementation, two affect fidelity claims about upstream internals).
