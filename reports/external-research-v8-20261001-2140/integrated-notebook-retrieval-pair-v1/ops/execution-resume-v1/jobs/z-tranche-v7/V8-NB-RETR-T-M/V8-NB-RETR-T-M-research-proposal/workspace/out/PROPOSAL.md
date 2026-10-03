# Research proposal — two-saved-state notebook workspace comparison and copy recovery

Stage: `V8-NB-RETR-T-M-research-proposal` (research stage of case V8-NB-RETR-T-M). Date of source captures: 2026-10-03.
Deliverable type: research-backed revision of `inputs/THIN_PLAN.md` for a small offline desktop prototype that compares two explicitly captured saved states of a repository workspace (one `nbformat` **major version 4** `.ipynb` notebook + two ordinary text files) and recovers a selected state into a **new** directory. Not an implementation.

## Claim-status legend (used throughout)

- **[S]** Source fact: claim traceable to a cited public primary source, with conditions/exceptions preserved.
- **[I]** Engineering inference: my reasoning from source facts; not stated by any source.
- **[P]** Product choice: a decision this prototype may take; alternatives exist.
- **[T]** Proposed test: designed here, **not executed** — no execution receipt exists for any test or arithmetic in this proposal.
- **[C]** Supported correction: revision of the thin plan backed by evidence above.

## Research-order note (short, per METHOD.md)

Three coherent batches: (1) component identity/version for both candidates (repo APIs, changelogs, release tags); (2) targeted sections — nbdime's cell-diffing and multilevel matching code, nbformat's v4.4/v4.5 schemas, cell-id issue search; (3) drill-down on the issue → fix → test chain (PR #282 metadata + file diffs, current validator tests). Sources reused across obligations where they bear on related claims (e.g., the v4.5 schema supports N1, N2 and N5).

---

## Q1. Two compared components and the version-specific behavior that supports a minimal approach

### Component A: nbdime (jupyter/nbdime)

- **[S]** Identity/scope: "Tools for diffing and merging of Jupyter notebooks." Repo `https://github.com/jupyter/nbdime` (GitHub API repo object, captured 2026-10-03, default branch `main`); latest release tag **v4.0.4**, published 2026-02-10 (GitHub API `releases/latest`, tag `v4.0.4`).
- **[S]** Version-specific behavior — cell-id support is recent and optional: changelog entry 4.0.0, "Enhancements made — Add support for using cell ID in diffing and merging [#639]" (`CHANGELOG.md` @ `main`, sha256 `1d3c90cd…`). Before 4.0.0, alignment was purely content/position heuristic-based.
- **[S]** Matching model: in `nbdime/diffing/notebooks.py` @ `main` (sha256 `9f9739fe…`), the `/cells` sequence uses predicates "in order of low-to-high precedence": `compare_cell_approximate` → `compare_cell_moderate` → `compare_cell_strict` → `compare_cell_by_ids`; `compare_cell_by_ids` is documented "Compare cells x,y strictly using cell IDs" and returns True "Only [when] both have IDs and they match" (`'id' in x and 'id' in y and x['id'] == y['id']`). The comparison functions note "NB! Ignoring metadata and execution_count" — i.e., source similarity and output identity drive alignment, not metadata.
- **[S]** Change-classification surfaces: `set_notebook_diff_targets(sources=True, outputs=True, attachments=True, metadata=True, identifier=True, details=True)` maps to distinct diff paths `/cells/*/source`, `/cells/*/outputs`, `/cells/*/attachments`, `/metadata`, `/cells/*/metadata`, `/cells/*/outputs/*/metadata`, `/cells/*/id`, with `execution_count` handled under "details". `/cells/*/id` is declared an atomic path (`atomic_paths={"/cells/*/id": True}`), so an id change is a replace, not a patch.
- **[S]** **Hard condition**: module docstring — "All diff tools here currently assumes the notebooks have already been converted to the same format version, currently v4 … Up- and down-conversion is handled by nbformat." nbdime does not itself gate on `nbformat_minor`; cross-minor-version semantics are delegated away.
- **[S]** Rename precedent: `diff_attachments` docstring — "An attachment is renamed (key change). Currently, #2 is handled as two ops (an add and a remove)". Even inside a notebook-aware differ, a rename is *observed* as add+remove and *not* inferred.

### Component B: nbformat (jupyter/nbformat)

- **[S]** Identity/scope: "Reference implementation of the Jupyter Notebook format" (GitHub API repo object, captured 2026-10-03); latest release tag **v5.11.1**, published 2026-08-17 (GitHub API `releases/latest`).
- **[S]** Version-conditioned cell identity: the v4.5 schema (`nbformat/v4/nbformat.v4.5.schema.json` @ `main`, blob `670bbd35f343f0d1324b8e6056ba42420f7ec6aa`, sha256 `523e3578…`) defines `cell_id` as a string with `pattern: "^[a-zA-Z0-9-_]+$"`, `minLength: 1`, `maxLength: 64`, and **requires** `id` on every cell kind (`raw_cell`, `markdown_cell`, `code_cell` required lists all include `id`). The v4.4 schema (`nbformat/v4/nbformat.v4.4.schema.json` @ `main`, sha256 `dddf3bff…`) contains **no `id` property and no `cell_id` definition at all** (and cells use `additionalProperties: false`, so under a strict 4.4 reading an `id` key would be invalid). Changelog: 5.1.0 "Implemented CellIds from JEP-62"; 5.1.1 "Changes convert.upgrade to upgrade minor 4.x versions to 4.5" (`CHANGELOG.md` @ `main`, sha256 `414e10d3…`).
- **[S]** Uniqueness is an *additional check*, not a schema property: the v4.5 schema's `metadata_name` description states uniqueness "cannot be checked by the json schema and must be established by an additional check" (stated for names; there is no `uniqueItems` constraint on `cells` either). In code, uniqueness is enforced by the validator: PR #282's `_normalize` walks `seen_ids` and raises `ValidationError("Non-unique cell id '…' detected.")` when repair is disabled (PR #282 file diff, `nbformat/validator.py`, head `fc45fed51440b6f2d38578171777a83adafed2f5`); current test `test_non_unique_cell_ids` in `tests/test_validator.py` @ `main` confirms the raise and repeatable behavior.
- **[S]** Normative validation posture (current): nbformat 5.5.0 changelog — "`validate()` is a function that is core to the security model of Jupyter. Callers rely on it not mutating its argument…"; auto-fixing arguments are deprecated and removed from defaults; "Use `normalize()` explicitly when a notebook from an external source needs to be repaired before validation. It returns a normalized copy… normalization is a compatibility tool, not a substitute for fixing the producer." In current code, `validate()` docstring: "Prior to Nbformat 5.5.0 the `validate` and `isvalid` method would silently try to fix invalid notebook and mutate arguments."
- **[S]** Warning-vs-error condition for missing ids: for `(version, version_minor) >= (4, 5)`, a cell without `id` triggers `MissingIDFieldWarning` ("this will become a hard error in future nbformat versions…"), and repair only happens if explicitly requested (PR #282 diff, `_normalize`; `nbformat/warnings.py` added in that PR with `MissingIDFieldWarning`/`DuplicateCellId`, both `FutureWarning` subclasses documented "This will be turned into an error at later point"). Current test `test_should_warn` exercises exactly this.

### Comparison and what supports a minimal approach (N5 comparison, part 1)

| Dimension | nbdime | nbformat |
|---|---|---|
| Core competence | heuristic cell diff/merge + presentation (CLI/GUI/Lab) | authoritative per-minor-version schemas, validation, upgrade/normalize |
| Cell identity | id-first predicate (since 4.0.0) + strict/moderate/approximate content fallbacks | defines when ids must exist ((4,5) threshold) and their syntax; uniqueness via validator, not schema |
| Cross-minor input | explicitly out of scope (expects same version; delegates to nbformat) | in scope: version detection, validation, upgrade |
| Weight | heavy: TS/GUI/merge machinery beyond this prototype | light: library suitable as a format gate |

- **[I]** The minimal approach is *not* "pick nbdime or nbformat" but a split: **nbformat as the read/validate/version gate; a small purpose-built two-snapshot differ modeled on nbdime's predicate design** (id-equality highest precedence, then progressively relaxed content comparisons; metadata/execution_count excluded from identity).
- **[I]** Justification from source conditions: nbdime's own docstring excludes our cross-minor case (one snapshot may declare 4.4, the other 4.5), while nbformat supplies exactly the version-conditioned rules (id presence, syntax, uniqueness-as-extra-check) our matcher must branch on.
- **[P]** Concrete tradeoff accepted: reimplementing matching risks diverging from nbdime's battle-tested heuristics. Mitigation: mirror nbdime's predicate ordering and cap the heuristic stack at two levels (exact-equality, then difflib-style ratio fallback), and — where both snapshots declare ≥ (4,5) with unique ids — treat id-equality as *authoritative* (matching nbdime's `compare_cell_by_ids`), so heuristic risk is confined to pre-4.5 snapshots. Embedding all of nbdime to get one predicate function is rejected as disproportionate for an offline prototype **[P]**.

---

## Q2 / N2. Notebook change observations and cell identity

### Separating source, outputs, metadata

- **[S]** A v4 code cell is a record with `source`, `outputs`, `execution_count`, `metadata`, `attachments` (4.1+), and — at 4.5+ — `id`; the notebook root has `metadata` (v4.5 schema, required lists and property maps). nbdime diffs each of these through a distinct path (`notebook_differs` map) and can include/exclude each via `set_notebook_diff_targets` — evidence that per-field classification is the established granularity.
- **[P]** The prototype's per-matched-cell-pair observation record: `{matched_by, source_changed, outputs_changed, metadata_changed, attachments_changed, execution_count_changed, id_changed, position_moved}`. Defaults follow nbdime: `execution_count` and output/attachment *metadata* are reported but do not affect any identity or "same work" judgment.
- **[S]** Output comparison precedent: nbdime compares outputs by `output_type` + data with metadata/execution_count deliberately skipped in identity (`compare_output_approximate`: "Deliberately skipping metadata and execution count"), and treats `stream`/`error`/mime-bundle kinds separately.
- **[T]** Discriminating fixture (proposed, unexecuted): two 4.5 snapshots whose only difference is (a) a one-character source edit, (b) a re-run producing different `outputs` with identical `source`, (c) `execution_count` only, (d) a `metadata.tags` change. Expected: exactly one of the four flags set per case; (c) sets only `execution_count_changed`.

### Cell identity / matching under differing version or identifier conditions

- **[S]** Conditions from nbformat: ids are *required* only at `nbformat_minor ≥ 5`; below that they are not part of the format at all; id syntax `^[a-zA-Z0-9-_]+$`, length 1–64; uniqueness is enforced by validator logic, not the JSON Schema.
- **[S]** Conditions from nbdime: id-matching applies only when **both** cells carry ids and they are equal (`compare_cell_by_ids`); otherwise content heuristics (strict → moderate → approximate, "first/second/third … multilevel diff iteration" per their docstrings) decide alignment; id-changes are atomic replaces.
- **[P]** Prototype matching algorithm, version-gated:
  1. Read each snapshot's declared `(nbformat, nbformat_minor)` from the stored bytes; **report both declared versions** (N1). If major ≠ 4 or the file is not JSON, the notebook is marked unsupported-for-cell-analysis (file-level comparison only).
  2. If both snapshots declare ≥ (4,5): match by `id`. Duplicate ids **within a snapshot** → those cells go to an `ambiguous` bucket with the duplicate ids listed; the prototype never silently repairs ids (direct application of the nbformat #282 lesson, below). A same-id pair spanning the snapshots is one logical cell even if positions differ → reorder is reported as `position_moved`, not delete+add.
  3. If either side declares < 4.5 (or ids are absent/duplicated): fall back to nbdime-style ordered heuristics on `(cell_type, source)` — exact match first, then similarity — restricted to the *unmatched* residue. Every fallback-matched pair is labeled `matched_by: "content-heuristic"` and is presented as provisional.
  4. Cross-version pairs (e.g., 4.4 ↔ 4.5): same rules, plus the version mismatch itself is surfaced as a first-class observation. **No upgrade/downgrade is performed before comparison**; if the user explicitly requests a normalized view, run nbformat `normalize()` on a **deep copy** only and label the output as derived (normative basis: 5.5.0 changelog posture quoted above).
- **[I]** Why no pre-comparison upgrade: upgrading side A to 4.5 would fabricate ids (nbformat `upgrade` targets 4.5 per changelog 5.1.1), destroying exactly the identity information the comparison is supposed to expose.
- **[T]** Discriminating fixtures (proposed, unexecuted): (a) 4.4 ↔ 4.4 identical sources, cells reordered → all pairs `matched_by: content-heuristic` (exact), every cell `position_moved`, zero source/outputs changes; (b) 4.5 ↔ 4.5 with one cell duplicated id → pair reported ambiguous, remainder still id-matched; (c) 4.5 ↔ 4.5 same id, source edited, position swapped → `id` match + `source_changed` + `position_moved`; (d) id present with invalid characters under a declared 4.5 → cell flagged invalid-by-schema (4.5 `cell_id` pattern) and excluded from id-matching, reported under identity anomalies.

### File renames, untracked files, limits of captured states (N3)

- **[S]** Observed-vs-inferred precedent: nbdime records an attachment rename as an add + a remove op — rename is not a primitive the differ emits (`diff_attachments` docstring). Git-style similarity detection is *not* cited here because it was not captured in this case; the design below rests on the nbdime precedent plus the product rule.
- **[P]** Each snapshot stores a manifest: `{path, sha256, bytes, tracked_flag}` for every regular file captured, plus the notebook's declared `(nbformat, nbformat_minor)`. Comparison emits, per path: `unchanged`, `edited` (same path, different hash), `deleted` (path in A only), `added` (path in B only).
- **[P]** Rename is an **inference layer**, never an observed op: a delete of `p` + add of `q` is labeled `rename-inferred (exact)` iff `sha256(p) == sha256(q)`; otherwise it stays delete+add with an optional similarity annotation, and the UI exposes the raw add/delete facts alongside any inference. The equivalence rule (exact content equality) is a **product choice**; with only two text files, false pairing risk is small but the label remains explicitly "inferred".
- **[P]** Untracked file: the capture records the repository's tracked/untracked status *as declared by repository metadata at capture time* and snapshots the content either way. A file that is untracked in both snapshots is compared like any file but badged `untracked`; tracked↔untracked transitions are reported as observed status changes. A file *not present in a snapshot's manifest at all* is **unknown** for that state — it cannot be compared and (N4) cannot be recovered.
- **[P]** Limits made explicit in the report: unsaved editor buffers are out of scope (brief); capture data absent for a path ⇒ content unknown, never guessed; similarity annotations are heuristics, not facts; outputs reflect whatever was saved — no re-execution ever occurs.

---

## Q3 / N5 (part 2). Real issue → fix → test chain

**Failure (issue).** nbformat issue **#243 "Merciful validation"** (opened 2022-01-20, `https://github.com/jupyter/nbformat/issues/243`): on duplicate cell ids, `validate()` both raised a validation error **and mutated the caller's notebook** — "the notebook that you passed in will be modified with *only* the first instance of a non-unique cell". Related issue #235. The concrete harm is documented in PR #282's description: notebook trust signatures were computed before `validate()`, which then mutated the notebook, "leading to the signature not matching" — a saved, trusted notebook re-opened as untrusted.

**Fix.** PR **#282 "Start separating normalisation from validation logic"** (`https://github.com/jupyter/nbformat/pull/282`), created 2022-06-08, **merged 2022-08-16T08:17:46Z**, milestone **5.5.0**, merge commit `1b5c8393c28284d792bfe34c4068e0817bb18cc1`, 7 files changed (+630/−102), head `fc45fed51440b6f2d38578171777a83adafed2f5`. Verified from the PR file diffs: `validate()`'s auto-fix kwargs deprecated (later removed); new `nbformat/warnings.py` (`MissingIDFieldWarning`, `DuplicateCellId`); `_normalize()` gated on `(version, version_minor) >= (4, 5)` — missing id ⇒ warning + repair only if asked; duplicate id ⇒ `ValidationError` when repair disabled; `isvalid()` deep-copies its input and asserts `nbjson == orig` in a `finally` block. Released per `CHANGELOG.md` section 5.5.0 (sha256 `414e10d3…`), quoted under Q1.

**Tests.** Same PR adds fixture `tests/test4.5.ipynb`; the surviving test chain in `tests/test_validator.py` @ `main` (sha256 `1d5990ad…`) includes `test_non_unique_cell_ids` (raises `ValidationError` with `repair_duplicate_cell_ids=False`, then "try again to verify that we didn't modify the content" — a non-mutation/idempotence check), `test_repair_non_unique_cell_ids` (warns `DuplicateCellId`), `test_no_cell_ids` / `test_repair_no_cell_ids`, `test_should_warn` (`MissingIDFieldWarning`), and `test_is_valid_should_not_mutate` (deep-copy equality after `isvalid`).

**Scoped engineering lesson.** **[I]** Observation/validation code over external inputs must (1) never mutate its input — separate read-only validation from an explicit, labeled normalization step on a copy; (2) version-gate every identity assumption (the (4,5) threshold exists precisely because id semantics changed); (3) treat ambiguous identifiers (duplicates) as reportable state, not something to repair silently; (4) make non-mutation itself a tested property (deep-copy equality, run-twice idempotence), because mutation bugs surface as *distant* failures (trust/signature mismatch), not at the mutation site.

**Adoption in the prototype.** **[P]** The comparison engine runs on frozen snapshot bytes; every read is pure. `normalize()` may run only on a deep copy, only on explicit user action, and its output is labeled derived. Duplicate ids and missing ids are findings, not defects to fix.

---

## N1. Capture/input contract and read-only comparison

- **[P]** Contract per snapshot: notebook file bytes (JSON object; the snapshot records the **declared** `nbformat` and `nbformat_minor` as read from the bytes); two ordinary text files with `{path, sha256, bytes}`; manifest including the repository's declared tracked/untracked flag per path; capture timestamp. Snapshots are immutable once taken.
- **[P]** Unsupported inputs are detected and reported, not crashed on: non-JSON notebook, `nbformat` major ≠ 4, missing `nbformat_minor`, undeclared cells array. Notebook *cell-level* analysis is skipped for unsupported notebooks; file-level comparison continues. (Cell-level conditions that follow from the version — ids present/absent/required — are handled per Q2.)
- **[S]** Supported-correction to the thin plan **[C]**: the thin plan says "report declared notebook versions" but had no rule for what *absence* of capture data means. Corrected rule, grounded in the nbformat 5.5.0 posture and the #243/#282 history: comparison reports `unknown` for any dimension without captured bytes; the prototype never substitutes defaults or repairs inputs during comparison. Unsaved changes are unknowable by construction (offline saved-state tool; unsaved buffers excluded by the brief).
- **[I]** Comparison itself is a pure function over the two manifests + bytes: same inputs ⇒ same report; no writes anywhere under the original workspace or snapshot store (enforced by the recovery design in N4, which writes only under a fresh destination).

## N4. Recovery into a new destination

- **[P]** Recovery takes an **explicitly selected** snapshot and a destination path, and copies exactly the snapshot's captured files (bytes verified against stored sha256 before write). The original workspace and both snapshots are never written, reset, checked out over, or merged into (brief requirement; matches the read-only posture above).
- **[P]** Refusal/error states, each with a distinct message: (1) destination exists and is not an empty directory → refuse before any write; (2) a manifest entry whose stored bytes are missing or hash-mismatched → integrity error, abort before completing (partial-copy policy **[P]**: write to a temporary directory inside the destination parent, then atomic-rename into place, so a failed recovery leaves no partial destination); (3) destination name collides with a required subdirectory layout → refuse; (4) uncaptured content (file absent from the selected snapshot) is reported as *not recoverable* — the tool never promises it.
- **[P]** Untracked files: recovered iff present in the selected snapshot, badged `untracked` in the recovery summary. Renames: recovered under the **snapshot's own path names** — recovery reproduces the captured state, not the inferred rename interpretation (inference is a reporting-layer concept only; this keeps recovery byte-faithful).

---

## Revised implementation plan (replaces thin-plan steps 1–4) **[C]**

1. **Capture/inventory module** (thin step 1, corrected): implement snapshot loading + integrity verification (hash check at load), declared-version extraction, unsupported-input detection per N1. Pure reads only.
2. **Notebook differ** (thin step 2, corrected): implement the version-gated matcher from Q2 (id-first for ≥(4,5); content-heuristic fallback; ambiguous bucket for duplicates). Per-field flags exactly as listed; no mutation of inputs; normalize-on-copy only behind an explicit flag.
3. **File differ + rename inference** (thin step 2): observed edit/add/delete ops plus the exact-hash `rename-inferred` label and untracked badging from N3; unresolved identity always exposed.
4. **Recovery engine** (thin step 3, corrected): copy-to-new-destination with the four refusal/error states and temp-dir + atomic rename from N4; recovery operates on snapshot bytes only.
5. **Fixture suite + checks** (thin step 4): the fixture matrix below drives both the differ and the recovery path end-to-end.

## Discriminating validation plan — **all proposed and unexecuted; no execution receipt exists**

- **[T]** T1 Identity: fixture set {4.4↔4.4 reorder, 4.5↔4.5 reorder, 4.5↔4.5 duplicate id, 4.4↔4.5 mixed, invalid id char} — assert `matched_by`, `position_moved`, and ambiguity reporting exactly as specified in Q2; reorder must never be reported as delete+add when ids match.
- **[T]** T2 Field separation: the four single-difference cases (source / outputs / execution_count / metadata) each flip exactly one flag.
- **[T]** T3 Non-mutation & idempotence (the #282 lesson, ported): run the full comparison twice on deep-copied inputs; assert (a) report equality across runs, (b) deep-equality of inputs before/after. Modeled on `test_non_unique_cell_ids` and `test_is_valid_should_not_mutate`.
- **[T]** T4 Files: exact rename (delete+add, equal hashes) labeled `rename-inferred (exact)`; edited rename left as delete+add; untracked badge and tracked↔untracked transition reported.
- **[T]** T5 Recovery: existing non-empty destination refused with zero writes (assert destination tree unchanged); missing-blob snapshot aborts with no partial destination; recovered tree hashes equal the selected snapshot's manifest; uncaptured file reported not-recoverable, never invented.
- **[T]** T6 Version reporting: declared `(nbformat, nbformat_minor)` strings in the report equal the bytes' declarations for every fixture, including the unsupported ones.

## Sources (exact locators; all captured 2026-10-03 via public HTTPS)

1. GitHub API repo objects: `api.github.com/repos/jupyter/nbdime`, `api.github.com/repos/jupyter/nbformat` (identity, default branch, descriptions).
2. GitHub API `releases/latest`: nbdime tag `v4.0.4` (published 2026-02-10); nbformat tag `v5.11.1` (published 2026-08-17).
3. `raw.githubusercontent.com/jupyter/nbdime/main/CHANGELOG.md` (sha256 `1d3c90cd…`): 4.0.0 entry, PR #639 cell-ID diff support.
4. `raw.githubusercontent.com/jupyter/nbdime/main/nbdime/diffing/notebooks.py` (sha256 `9f9739fe…`): predicates, `compare_cell_by_ids`, `set_notebook_diff_targets`, `atomic_paths`, attachment-rename-as-add+remove, version-assumption docstring.
5. `raw.githubusercontent.com/jupyter/nbdime/main/nbdime/diffing/generic.py` (sha256 `8a4493e7…`): `diff_sequence_multilevel`, predicate-driven alignment, `compare_strings_approximate` threshold machinery.
6. `raw.githubusercontent.com/jupyter/nbformat/main/CHANGELOG.md` (sha256 `414e10d3…`): 5.1.0 JEP-62 CellIds, 5.1.1 upgrade-to-4.5, 5.2.0 "Only fix cell ID validation issues if asked", 5.5.0 non-mutation deprecation statement.
7. nbformat schemas @ `main`: `nbformat/v4/nbformat.v4.5.schema.json` (blob `670bbd35…`, sha256 `523e3578…`; `cell_id` pattern/length, `id` required, `metadata_name` uniqueness note) and `nbformat/v4/nbformat.v4.4.schema.json` (sha256 `dddf3bff…`; no `id` anywhere).
8. nbformat issue #243 "Merciful validation" (2022-01-20) and issue #235 (referenced), via GitHub API search/issues.
9. nbformat PR #282 "Start separating normalisation from validation logic" — API pulls/282 (merged 2022-08-16T08:17:46Z, milestone 5.5.0, merge commit `1b5c8393…`) and pulls/282/files (diffs of `nbformat/validator.py`, `nbformat/warnings.py`, `nbformat/current.py`, `tests/test4.5.ipynb`).
10. `raw.githubusercontent.com/jupyter/nbformat/main/tests/test_validator.py` (sha256 `1d5990ad…`): `test_non_unique_cell_ids`, `test_repair_non_unique_cell_ids`, `test_no_cell_ids`, `test_should_warn`, `test_is_valid_should_not_mutate`, `test_invalid_cell_id`, min-version tests.

Shorthand sha256 values above are prefixes of full captured hashes recorded by the host's mechanical capture; full values are in the host capture ledger.
