# Discovery — S10 data-import (desktop import assistant)

Stage: A-M04-B / treatment / research. Method M04 v1 (amendment-preservation).
Written from the brief alone; the case plan was NOT read before this file
(see plan-reveal.json, created after this file was frozen).
Brief obligations addressed here: O1 (unfamiliar tools/approaches), O2
(primary-source behavior/defaults/limits), O3 (issue/fix/evolution chain),
O6-validation inputs. O4 (per-P comparison) and the final synthesis belong to
draft.md after plan reveal. Source IDs S01–S11 are defined in source-map.json
with bounded evidence in sources/.

## 1. Problem restatement (from brief only)

Nonprofit analysts must repeatedly combine large CSV files plus occasional
Excel workbooks with inconsistent dates and identifiers, on modest laptops.
The assistant must: preview type/dialect inference before committing; preserve
original strings alongside parsed values; explain rejected rows in analyst
terms; and replay the identical transformation next month. The investigation
therefore covers: (a) implementation tools for CSV/Excel/date parsing under
memory constraints; (b) competing products and their repeatability models;
(c) release/type/locale behavior of the selected mechanisms.

## 2. Unfamiliar tools and materially different approaches (O1)

### 2.1 xsv — streaming + indexed CSV processing (Rust CLI)

xsv treats large CSVs as streams plus an optional on-disk index rather than
in-memory tables [S05]. `index` builds constant-time row access "very quick"
(under 2 s on a 3.17M-row file in the README's example); `slice` then parses
only the sliced rows; `sample` draws rows by reservoir sampling with "memory
proportional to the size of the sample"; `stats`/`frequency` give per-column
types, ranges, modes and cardinality, parallelized when an index exists. The
same stats job is reported at ~8 s vs ~2 minutes for csvkit. Commands
(`select`, `search` by per-field regex, `join`, `split`, `partition`,
`fixlengths`) compose through pipes.

Why it matters here: it is the reference architecture for "large CSV on a
modest laptop" — never load the file to preview it. A desktop assistant can
shell out to or embed this pattern: index-once, preview slices, sample for
inference, stream the full pass. Trade-off: xsv is a CLI toolkit, not a
library with a stable API, and its last release predates several CSV
sniffing advances; pin a build and treat it as an engine, not a dependency
of record. Version at fetch UNKNOWN [S05] — pin before building on it.

### 2.2 DuckDB — in-process SQL over files, with sniffer + rejects tables

DuckDB reads CSVs (and other files) as SQL tables without a server, and its
CSV reader auto-detects dialect and types via a multi-hypothesis sniffer
[S04][S10]. Three features map one-to-one onto brief requirements:

1. `all_varchar=true` — "Skip type detection and assume all columns are of
   type VARCHAR" [S04]: a built-in original-string-preservation mode. Read
   everything as text, then apply explicit, logged casts.
2. `store_rejects=true` with `rejects_table` (default `reject_errors`) and
   `rejects_limit` — faulty lines are skipped and kept in a queryable table
   [S04]: a built-in rejected-rows mechanism the UI can explain per row.
3. `sample_size` (default 20480 lines) and `files_to_sniff` (default 10)
   bound how much data drives auto-detection [S04] — the "preview inference"
   window is explicit and tunable, unlike silent whole-file inference.

Governing defaults that bite: `header=false` by default (headers are NOT
assumed — the sniffer usually detects them, but an explicit contract is
safer), `strict_mode=true`, `ignore_errors=false`, 2 MB `max_line_size`,
encodings limited to UTF-8/UTF-16/Latin-1 otherwise (use the `encodings`
extension or `iconv`) [S04]. `union_by_name` across monthly files "increases
memory consumption" [S04] — relevant to the combine-next-month flow.

### 2.3 Polars — strict, fast frames with a narrow 100-row inference window

Polars' `read_csv` is strict ("expects CSV data to strictly conform to
RFC 4180... Malformed data, though common, may lead to undefined behavior")
and infers schema from only the first `infer_schema_length=100` rows by
default [S03]. Dates are NOT parsed unless `try_parse_dates=True`; empty
strings are null by default (`empty_string_is_null=True`); `ignore_errors`
defaults to False, and the documented recovery is `infer_schema=False` to
read everything as `pl.String` — again, an original-strings mode [S03].
Locale: `decimal_comma=False` by default [S03].

Why it matters: Polars is the fast in-memory choice, but its 100-row window
is the most dangerous default found in this investigation for "inconsistent
dates/identifiers" — a column that is numeric for 100 rows then sprouts IDs
or dates will mis-infer or fail. The docs' own remedy (raise the window or
`schema_overrides`) [S03] becomes a product requirement: the assistant must
either widen the window, sample deeper, or pin schemas after preview.
`use_pyarrow=True` "will always parse dates" and "may have a different
strategy regarding type inference" [S03] — an engine flag that silently
changes semantics, so it must be pinned and disclosed, never defaulted
silently.

### 2.4 pandas — the analysts' default, with hostile-to-brief defaults

pandas 3.0.6 `read_csv` [S09] is what nonprofit analysts most likely already
use, so its behavior defines the migration hazard:

- `keep_default_na=True` + `na_values` append semantics: user-supplied NA
  tokens are *added to* the default NA set; only `keep_default_na=False`
  with no `na_values` parses "no strings as NaN" [S09]. Identifier-like
  strings that collide with default NA tokens are silently nulled.
- `low_memory=True`: "possibly mixed type inference"; "the entire file is
  read into a single DataFrame regardless" — chunking the parse does not
  bound the result; real bounding needs `chunksize`/`iterator` iteration
  [S09].
- `parse_dates=None`, `dayfirst=False`, `date_format` "mixed" mode "is risky"
  [S09]: DD/MM vs MM/DD ambiguity defaults to US order; mixed-format columns
  need explicit handling.
- `on_bad_lines='error'`, `encoding=None`, `encoding_errors='strict'`,
  `decimal='.'`, engine choices c/python/pyarrow with different
  feature/coverage trade-offs [S09].
- Documented escape: "Use `str` or `object` together with suitable
  `na_values` settings to preserve and not interpret dtype" [S09], plus
  `dtype_backend` for nullable/Arrow types.

Product implication: if the assistant wraps pandas at all, the safe profile
is `dtype=str` + explicit `na_values`/`keep_default_na` + explicit dates +
chunked iteration — i.e. treat pandas as a transport, do inference in the
assistant layer. Otherwise prefer DuckDB/Polars engines with explicit modes.

### 2.5 openpyxl streaming modes — the Excel answer under memory limits

For "occasional Excel workbooks", openpyxl's `read_only=True` gives lazy
constant-memory reads via `ReadOnlyWorksheet` (cells are `ReadOnlyCell`,
workbook "must be explicitly closed"), and `write_only=True` exports
"unlimited amount of data... while keeping memory usage under 10Mb" with
append-only rows [S06]. Critical condition: read-only mode trusts the file's
declared dimensions, which "some applications set incorrectly" — the remedy
is `calculate_dimension()` inspection plus `reset_dimensions()` [S06]. A
robust assistant must verify dimensions (or let the analyst override) or
reads can silently truncate.

### 2.6 Frictionless Table Schema — the portable repeat recipe

Table Schema v1 [S07] declares tabular schemas as JSON: field `name` required;
types/formats; `constraints` tested on the *logical* representation while
`missingValues` applies to the *physical* representation; `bareNumber`
(default true) with a documented `false` mode for values like `95%`/`€95`;
schema-level `primaryKey`/`foreignKeys`; sibling specs for CSV Dialect, Data
Resource, and Data Package. This is the strongest "same transformation next
month" primitive found: the saved recipe is a human-readable, tool-neutral
document (schema + dialect + missing values + constraints) rather than
click-history or a bespoke script. It also formalizes the original-strings
split the brief demands (physical vs logical).

### 2.7 OpenRefine — closest competitor and repeatability reference

OpenRefine [S08] is the direct competitor: free, open-source, local ("Your
data is cleaned on your machine"), built for messy data with faceting ("apply
operations on filtered views"), clustering ("merging similar values"), and —
most relevant — infinite undo/redo with "replay your operation history on a
new version of it": operation-history replay as the monthly-repeat mechanism.
Differentiation space for the new assistant: lighter install and learning
curve, explicit original-string preservation with per-cell provenance,
portable declarative recipes (2.6) instead of project-bound histories, and
first-class rejected-row explanations rather than facet archaeology.

### 2.8 Python stdlib `csv` — baseline semantics and hidden limits

The stdlib [S01] sets the floor: `excel` dialect default, `','` delimiter,
`newline=''` file handling, `excel-tab` for TSV, and a `Sniffer` whose
delimiter tie-breaks follow the fixed `preferred` order `[',', '\t', ';',
' ', ':']` "no matter how many times each of them occurs", plus a heuristic
`has_header`. There is also an adjustable `field_size_limit` bounding field
sizes. Any "preview inference" built on the stdlib inherits the Sniffer's
tie-break order — acceptable only if the UI shows competing hypotheses
instead of one silent guess.

## 3. Consequential behavior, defaults, limits, applicability (O2)

Condensed contract table (observed values; IDs point at evidence):

| Concern | Mechanism | Observed contract | Applicability / limit |
|---|---|---|---|
| Type inference window | Polars `infer_schema_length` | 100 rows [S03] | Too narrow for inconsistent files; widen/sample/pin |
| Type inference window | DuckDB `sample_size` | 20480 lines [S04] | 200x wider; still a sample — disclose |
| Type inference window | DuckDB `files_to_sniff` | 10 files [S04] | Multi-file combines need bumping or per-file reports |
| Original strings | DuckDB `all_varchar` | opt-in VARCHAR-all [S04] | Preferred preservation mode |
| Original strings | Polars `infer_schema=False` | all `pl.String` [S03] | Preferred preservation mode |
| Original strings | pandas `dtype=str` + NA settings | opt-in, NA interaction [S09] | Must pair with keep_default_na decision |
| Rejected rows | DuckDB `store_rejects` + rejects tables | opt-in, queryable [S04] | Preferred rejection store |
| Rejected rows | pandas `on_bad_lines` | default `error` [S09] | Fail-fast default; needs skip/warn policy |
| Rejected rows | Polars `ignore_errors` | default False [S03] | Needs explicit policy + String fallback |
| Header detection | DuckDB `header` | default false [S04] | Never assume; detect + confirm in UI |
| Header detection | pandas `header` | `infer` [S09] | Convenient, implicit — log the decision |
| Header detection | stdlib `Sniffer.has_header` | heuristic [S01] | Show as hypothesis, not fact |
| Dialect detection | stdlib tie-break order | fixed preferred list [S01] | Surface runner-up delimiters |
| Line/field caps | DuckDB `max_line_size` | 2 MB [S04] | Long free-text rows can fail; tunable |
| Line/field caps | stdlib `field_size_limit` | adjustable, default unverified here | Verify on target build; propose check |
| NA coercion | pandas `keep_default_na` | True + append semantics [S09] | Identifier columns at risk; explicit allowlist |
| Null strings | Polars `empty_string_is_null` | True [S03] | Empty ≠ missing for some ID schemes; flag it |
| Dates: ambiguous order | pandas `dayfirst` | False (US) [S09] | Locale decision per column, previewed |
| Dates: mixed formats | pandas `date_format='mixed'` | "risky" [S09] | Per-value inference; quarantine on conflict |
| Dates: auto-parse | Polars `try_parse_dates` | False [S03] | Explicit opt-in; ISO-first |
| Dates: Excel serials | openpyxl epoch default | 1899-12-30 [S11] | 1900-system; must read 1904 flag |
| Dates: Excel bug | Lotus/Excel 1900 leap year | replicated everywhere [S02][S11] | Serial 60 pivot; document, never "fix" |
| Dates: ISO in OOXML | openpyxl `from_ISO8601` | OOXML 18.17.4 B.x formats [S11] | Strict-mode workbooks path |
| Numbers/locale | DuckDB/pandas/Polars decimal | `.` default; `decimal_comma` opt-in [S03][S04][S09] | European files need explicit separator profile |
| Excel memory | openpyxl read/write-only | constant / <10MB [S06] | Use for all large workbooks |
| Excel dimensions | openpyxl read-only trust | may be wrong; reset available [S06] | Verify + analyst override |
| CSV memory | xsv index/slice/sample | index <2s/3.17M rows; reservoir sampling [S05] | Preview without loading |
| CSV memory | pandas whole-file frame | full DataFrame regardless of low_memory [S09] | Iterate chunks or don't use pandas for big files |
| CSV memory | DuckDB `union_by_name` | increases memory [S04] | Monthly combine needs a memory-conscious plan |
| Encodings | DuckDB supported set | UTF-8/16, Latin-1; else extension/iconv [S04] | Nonprofit files in legacy encodings need a path |
| Encodings | pandas `encoding`/`encoding_errors` | None/strict [S09] | Strict default fails loud — good, explain it |
| Repeatability | Table Schema + CSV Dialect docs | declarative JSON [S07] | Portable recipe artifact |
| Repeatability | OpenRefine history replay | in-product replay [S08] | UX reference, project-bound |

Locale synthesis: decimal/thousands separators, DD/MM vs MM/DD, UTF vs
legacy encodings, and currency/percent-decorated numbers (`bareNumber=false`
[S07]) form one "locale profile" decision the assistant should capture per
source and store in the repeat recipe — never re-guess monthly.

## 4. Issue / fix / evolution chains (O3)

### Chain A — CSV auto-detection: 25+ manual options → multi-hypothesis sniffer

DuckDB's own account [S10]: the CSV reader grew "more than 25 configuration
options", making exploration "cumbersome"; the response was a
multi-hypothesis CSV sniffer that "automatically detects CSV dialect options,
column types, and even skips dirty data", reserving manual input for
"rather unusual choices for their CSV dialect" or explicit column types.
The blog's kicker — the CSV "specification changes as soon as a single
system is capable of reading a flawed file" [S10] — is the governing reality:
robustness to malformed input, not RFC purity, decides the engine. Contrast
Polars' strictness ("Malformed data... may lead to undefined behavior")
[S03]: strict-and-fast vs tolerant-and-sniffing is a genuine architectural
fork, and the brief (messy nonprofit files, rejected-row explanations)
points at the tolerant side with strictness available per column.

### Chain B — Excel's 1900 leap-year bug: Lotus decision → permanent compat

[S02] traces the bug to Lotus 1-2-3 ("assumed that the year 1900 was a leap
year... caused no harm to almost all date calculations"), inherited by
Multiplan and Excel for serial compatibility, and now unfixable ("the
disadvantages of doing so outweigh the advantages": every date shifts a day,
WEEKDAY changes, serial compat breaks). [S11] shows the consequence in code:
openpyxl's `from_excel`/`to_excel` default to epoch 1899-12-30, i.e. the
ecosystem replicates the bug by default. For the assistant: Excel-date
conversion must use the workbook's date system + the 1899-12-30 epoch, treat
serial 60 (fictitious 1900-02-29) explicitly, and document that pre-1900-03-01
1900-system dates are off-by-one from naive proleptic computation. This is a
"will never be fixed upstream" constraint — the product owns it forever.

### Chain C — pandas silent-coercion hazards and their documented escapes

[S09] records the mature state of a long pain history: `low_memory` mixed-type
inference (with the explicit warning and the `dtype`/`False` remedies),
`keep_default_na` append semantics (with the `False`+no-list escape),
`date_format='mixed'` flagged "risky", and the `str`/`object` + NA-settings
preservation recipe plus `dtype_backend` for nullable/Arrow types. The arc is
"convenient inference → silent corruption reports → explicit opt-outs": the
assistant should default to the opt-outs (strings-first, explicit NA
allowlist, explicit date specs) and let analysts widen from safety, not
narrow from corruption.

No runtime was available in this stage, so no issue was reproduced by
execution here; each chain above is evidenced by primary documentation, and
reproduction checks are proposed in draft.md (O6).

## 5. Candidate architecture emerging from discovery (input to draft)

1. Strings-first pipeline: ingest everything as text (`all_varchar` /
   `infer_schema=False` / `dtype=str`), then apply a visible, ordered cast
   list per column; keep every original string with its parsed value and the
   rule that produced it.
2. Inference as hypotheses: dialect, header, types, date orders and NA sets
   are presented with confidence and runners-up (cf. Sniffer tie-breaks
   [S01], 100-row vs 20480-line windows [S03][S04]), never applied silently.
3. Rejections as data: a queryable rejects table per run (`store_rejects`
   model [S04]) with analyst-readable reasons; rejections never vanish into
   logs.
4. Memory discipline: index/sample/slice previews for large CSVs [S05],
   streaming Excel reads with dimension verification [S06], chunked or
   out-of-core full passes — full-file in-memory frames are the fallback,
   not the default.
5. Repeat recipe as artifact: a portable JSON document (Table Schema +
   CSV Dialect + missing values + locale profile + cast list, [S07]) saved
   per source, replayed monthly with drift reporting; OpenRefine-style
   history replay [S08] as the UX reference.
6. Locale profile per source: separators, date orders/formats, encoding —
   captured once, stored in the recipe, never re-guessed silently.

## 6. Uncertainty and open questions (carried into draft)

- U1: stdlib `field_size_limit` numeric default and exact exception type were
  not observed in the fetched window [S01] — verify on the target interpreter.
- U2: pandas' exact default NA token list was not fetched; only the
  `keep_default_na`/`na_values` interaction matrix was observed [S09] —
  verify against the installed build before writing identifier guidance.
- U3: xsv maintenance status and the right version pin were not established
  (repo HEAD fetch, version UNKNOWN) [S05].
- U4: DuckDB "current" docs drift: `sample_size`, `header`, rejects options
  must be re-pinned to the shipped DuckDB version at build time [S04].
- U5: Excel 1904-date-system workbooks: flag-reading path not yet sourced;
  only the 1900-system default epoch was observed [S11].
- U6: No performance measurements were executed (no runtime in this stage);
  all memory/speed claims above are sourced documentation claims, not
  observations — each needs a discriminating check (see draft.md O6).
- U7: Desktop packaging (installer size, auto-update, offline use) was out of
  scope for this evidence round; the engines above are all local-first,
  consistent with OpenRefine's privacy posture [S08], but no packaging
  comparison was run.

## 7. Executed vs proposed (O6 inputs)

Executed in this stage: 11 primary-source web fetches (HTTP 200) plus 1
recorded 404 (OpenRefine manual page → replaced by homepage), with verbatim
extraction into sources/ and the navigable sources/index.md. No code was
executed; no witness ran (no qualified sandbox claimed in this stage).
Proposed discriminating validations (for draft.md): inference-window
provocations (late-file type flips at rows 101 and 20481), NA-collision
identifier columns, DD/MM vs MM/DD grids, Excel serial-60/1904 checks,
dimension-lie workbooks, 2 MB-line and legacy-encoding files, and a monthly
replay drift test using the saved recipe artifact.
