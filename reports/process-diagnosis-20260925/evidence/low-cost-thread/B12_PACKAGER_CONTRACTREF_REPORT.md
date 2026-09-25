# B12 — topic packager: deliver the document-level ContractRef line

STATUS: COMPLETE — code, tests, CHANGES.md and docs landed in the successor-11 tree; full
suite run before and after with an identical set of pre-existing failures.

Brief: `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/B12_PACKAGER_CONTRACTREF_BRIEF.md`
Tree: `/home/sittingmongoose/PM-Experiments/planning-workflow-successor-11-development/`
(not a git repository, so every diff below is against a byte copy of the file taken before the
edit; the copies are in this session's scratchpad).
Nothing under `/mnt/Cursor/PuppetMaster` was read or written.

## 1. Diff summary

| File | Lines +/- | What |
| --- | --- | --- |
| `pwflow/topic_inputs.py` | +112 / -19 | the change |
| `tests/test_topic_inputs.py` | +324 / -0 | 29 new tests (27 → 56 in the module) |
| `CHANGES.md` | +76 / -0 | entry B12, appended after B11's section (B11's bytes untouched) |
| `docs/direct-omp-mode.md` | +7 / -0 | one paragraph in section 6, Topic-scoped inputs |

The 19 removed lines in the packager are the old `contract_targets` body, the old
`subject_raw = subject_path.read_bytes()` placement and the three inline row projections that
`_ref_projection` replaces. No other file in the tree calls the packager from Python: the only
contact `pwflow/transports/omp_direct.py` has is the passthrough launch setting
`config['topic_inputs']`, and the documented entry point is the CLI, which I ran end to end on the
fixture (receipt: 3 rows, 3 delivered, 2 from the document, 1 SchemaID).

`pwflow/topic_inputs.py`, function by function:

- **`CONTRACTREF_LINE`, `FENCE`** (new module constants). `^ {0,3}(?:(?:[-*+]|\d{1,9}[.)])\s+|>\s?)*[*_~`]{0,3}ContractRef\s*:`
  and `^ {0,3}(`{3,}|~{3,})`. The keyword must open the line, after an optional list marker,
  block-quote marker or Markdown emphasis; a mid-sentence mention is not a declaration.
- **`document_contract_ref_lines(text)`** (new). Returns `[{'line': int, 'text': str}]` for every
  such line outside a fenced code block. Fence tracking honours the marker character and length,
  so a longer closing fence closes the block and a fenced example never becomes an owner document.
- **`contract_targets(units, selected, document_text=None)`** (third parameter is new and
  optional, so every existing caller behaves exactly as before). The body is refactored around one
  `absorb()` closure used by both sources; the SchemaID, ContractName and `#anchor` parsing is the
  unchanged `SCHEMA_ID` / `CONTRACT_NAME` / `parse_contract_refs` path. Every row now carries
  `source` (`'plan_unit'` or `'document'`), `line` and `lines`. A document-level target repeated in
  entry after entry of a Decision Log collapses to one row carrying every line it was declared on.
  Sort key is `(document rows first, plan_unit_id or '', document, anchor or '')`, so PlanUnit rows
  keep their previous relative order.
- **`build_packet`** reads the subject's bytes once (they were read at the end before), decodes
  with `errors='replace'` for the scan only — the hash and byte count are still over the raw bytes,
  and a subject that is not valid UTF-8 still does not crash the packager — and passes the text to
  `contract_targets`. The packet gains `document_contractref_lines`.
- **`_ref_projection(row, keys)`** (new helper) builds one delivery-table row: the fixed columns
  plus `source`, and `lines` only where it means something (a document row). Used by section 6b in
  both its forms and by the receipt.
- **`render`** section 6b prints the `source` column, explains the two values, and adds one line
  saying how many rows came from the subject document's own ContractRef line(s).
- **`write_packet`** receipt gains `contract_refs_from_document`,
  `document_contractref_line_count` and `schema_ids`; `contract_refs` rows gain `source`/`lines`.

Owner-passage delivery (`owner_passages`), the delivery verdicts, the 200,000-byte default budget
and the reduction priority are untouched.

## 2. Test counts

Command, from the successor-11 root: `python3 -B -m unittest discover -s tests`

| | Ran | failures | errors | skipped | ERROR/FAIL lines |
| --- | --- | --- | --- | --- | --- |
| before | 1429 | 5 | 67 | 24 | 72 |
| after | 1458 | 5 | 67 | 24 | 72 |

+29 tests ran, and the failure counts did not move. **The set of failing test names is unchanged**:
I captured every `^ERROR: ` / `^FAIL: ` line from both runs, sorted them, and `diff` reports the
two lists byte-identical (72 lines each, zero added, zero removed). Both captures are kept beside
this report as `B12_test_failures_before.txt` and `B12_test_failures_after.txt`, and the unified
diffs as `B12_topic_inputs.diff` and `B12_test_topic_inputs.diff`.

The `tests/test_topic_inputs.py` module alone: 27 tests before, 56 after, all passing.

The suite was run twice after the change (the second time on the exact final bytes, after a
cosmetic reflow of one fixture line): 1458 / 5 / 67 / 24 both times, with the same 72 names.
`python3 -B -m pwflow.topic_inputs` was also run end to end on the fixture workspace.

## 3. Section 6 / 6b for the R7-modelled fixture

The fixture is `R7SubjectIndex` in `tests/test_topic_inputs.py`: a subject whose section 0 carries
the R7 line

```
ContractRef: ContractName:Plans/GitLab_Integration.md, ContractName:Plans/Forge_Integrations.md, SchemaID:pm.forge.provider_adapter_profile.v1
```

two Decision Log entries that repeat one of its names, a fenced example naming
`Plans/Never_Declared.md` that must never become an owner, and an owner document whose `FI-010`
passage names the SchemaID. Every byte is written fresh into a temporary tree: no test reads a
sealed package or a run directory.

Shape A is the measured R7 shape (no PlanUnit carries a ContractRef at all) rendered by the
packager **as it was**; shape B is the same fixture after this change; shape C is the fixture the
tests use, which also has one PlanUnit-sourced row so the table shows both sources.

#### A. The measured R7 shape (no PlanUnit carries a ContractRef) — BEFORE

`````text
## 6. ContractRef owner passages (0 documents)

The subject names no SchemaID tokens.

## 6b. ContractRef delivery (0 rows, 0 delivered)

One row per ContractRef the subject declares, and whether its passage is above.

```json
[]
```
`````

#### B. The same fixture — AFTER

`````text
## 6. ContractRef owner passages (1 documents)

SchemaID tokens named by the subject: `pm.forge.provider_adapter_profile.v1`.

### Plans/Forge_Integrations.md

`sha256 5d1eec42b6b1634d53fdbac8d368e932ca40d1df8b092f88c8b1394e64942a2d`, 264 bytes, coverage `named_passages`.

#### Forge Integrations  (line 1)

```markdown
# Forge Integrations

## 0. Scope

scope prose, names nothing

### FI-010 - provider adapter profile schema

Every provider adapter profile validates
against `pm.forge.provider_adapter_profile.v1`,
whose fields are frozen here.

### FI-020 - unrelated

not wanted
```

#### 0. Scope  (line 3)

```markdown
## 0. Scope

scope prose, names nothing

### FI-010 - provider adapter profile schema

Every provider adapter profile validates
against `pm.forge.provider_adapter_profile.v1`,
whose fields are frozen here.

### FI-020 - unrelated

not wanted
```

#### FI-010 - provider adapter profile schema  (line 7)

```markdown
### FI-010 - provider adapter profile schema

Every provider adapter profile validates
against `pm.forge.provider_adapter_profile.v1`,
whose fields are frozen here.
```

## 6b. ContractRef delivery (2 rows, 2 delivered)

One row per ContractRef the subject declares, and whether its passage is above.
`source` is `plan_unit` when a PlanUnit's `preserved_contractrefs` carried the row,
and `plan_unit_id` names that unit; it is `document` when the subject document
declared the row on its own `ContractRef:` line, and `lines` gives the line numbers.

2 of these 2 row(s) come from the subject document's own ContractRef line(s), which no PlanUnit carries.

```json
[
 {
  "anchor": null,
  "delivered": true,
  "delivery": "named_passages",
  "document": "Plans/Forge_Integrations.md",
  "lines": [
   6,
   21,
   26
  ],
  "plan_unit_id": null,
  "source": "document"
 },
 {
  "anchor": null,
  "delivered": true,
  "delivery": "subject_document_itself",
  "document": "Plans/GitLab_Integration.md",
  "lines": [
   6
  ],
  "plan_unit_id": null,
  "source": "document"
 }
]
```
`````

#### C. Mixed sources (one PlanUnit ref beside the document line) — AFTER

`````text
## 6. ContractRef owner passages (1 documents)

SchemaID tokens named by the subject: `pm.forge.provider_adapter_profile.v1`.

### Plans/Forge_Integrations.md

`sha256 5d1eec42b6b1634d53fdbac8d368e932ca40d1df8b092f88c8b1394e64942a2d`, 264 bytes, coverage `named_passages`.

#### Forge Integrations  (line 1)

```markdown
# Forge Integrations

## 0. Scope

scope prose, names nothing

### FI-010 - provider adapter profile schema

Every provider adapter profile validates
against `pm.forge.provider_adapter_profile.v1`,
whose fields are frozen here.

### FI-020 - unrelated

not wanted
```

#### 0. Scope  (line 3)

```markdown
## 0. Scope

scope prose, names nothing

### FI-010 - provider adapter profile schema

Every provider adapter profile validates
against `pm.forge.provider_adapter_profile.v1`,
whose fields are frozen here.

### FI-020 - unrelated

not wanted
```

#### FI-010 - provider adapter profile schema  (line 7)

```markdown
### FI-010 - provider adapter profile schema

Every provider adapter profile validates
against `pm.forge.provider_adapter_profile.v1`,
whose fields are frozen here.
```

## 6b. ContractRef delivery (3 rows, 3 delivered)

One row per ContractRef the subject declares, and whether its passage is above.
`source` is `plan_unit` when a PlanUnit's `preserved_contractrefs` carried the row,
and `plan_unit_id` names that unit; it is `document` when the subject document
declared the row on its own `ContractRef:` line, and `lines` gives the line numbers.

2 of these 3 row(s) come from the subject document's own ContractRef line(s), which no PlanUnit carries.

```json
[
 {
  "anchor": null,
  "delivered": true,
  "delivery": "named_passages",
  "document": "Plans/Forge_Integrations.md",
  "lines": [
   6,
   21,
   26
  ],
  "plan_unit_id": null,
  "source": "document"
 },
 {
  "anchor": null,
  "delivered": true,
  "delivery": "subject_document_itself",
  "document": "Plans/GitLab_Integration.md",
  "lines": [
   6
  ],
  "plan_unit_id": null,
  "source": "document"
 },
 {
  "anchor": "FI-010",
  "delivered": true,
  "delivery": "anchor_passage",
  "document": "Plans/Forge_Integrations.md",
  "plan_unit_id": "GL-001",
  "source": "plan_unit"
 }
]
```
`````

#### Receipt for shape C

`````text
{
 "bytes": 7038,
 "contract_coverage": {
  "Plans/Forge_Integrations.md": "named_passages"
 },
 "contract_documents": [
  "Plans/Forge_Integrations.md"
 ],
 "contract_refs_delivered": 3,
 "contract_refs_from_document": 2,
 "contract_refs_total": 3,
 "document_contractref_line_count": 3,
 "schema_ids": [
  "pm.forge.provider_adapter_profile.v1"
 ]
}
budget: {"budget_bytes": 200000, "bytes": 7038, "cut_bytes": 0, "cut_documents": [], "cut_passage_count": 0, "graph_named_content_complete": true, "heading_maps_dropped": false, "over_budget": false}
`````

## 4. What I confirmed, and two things worth someone's attention

**The owner passage for a SchemaID (brief item 2).** What delivers
`pm.forge.provider_adapter_profile.v1` is the owner **prose** passage that names the token —
`### FI-010 ...` in shape B above, delivered under `coverage: named_passages`, exactly the existing
rule and unchanged by this work.

**The schema file itself is not what gets delivered.** If a ContractRef names
`Plans/forge_integration_contracts.schema.json`, `owner_passages` cuts the owner into Markdown
heading blocks; a JSON schema has none, so it yields zero passages and an empty heading map, and
the row is reported `delivered: false, delivery: heading_map_only`. That is honest rather than
wrong, and it is pre-existing behaviour, so I left the delivery rule alone as the brief directs —
but it means the `$id` / `schema_id` const passage is **not** delivered by any path today. The
behaviour is now pinned by a test
(`test_a_schema_file_owner_is_reported_honestly_rather_than_implied`) so a future change to
`owner_passages` has to decide deliberately. **Candidate follow-up:** deliver a JSON owner's
`$id`/`const` object (or the whole file when it is small) instead of an empty heading map.

**Budget accounting (brief item 2).** Unchanged and still correct with the extra passages. On the
fixture the packet is 7,024 bytes at the 200,000 default, nothing cut. With the owner document
grown to 43,594 bytes the packet is 137,035 bytes, still under budget; at a 20,000-byte budget the
ContractRef passages are cut first, `cut_documents` names the owner, `cut_bytes` is reported, every
graph-named unit is still inlined and `graph_named_content_complete` stays true.

**A pre-existing cost this makes more visible (not changed here).** A SchemaID token is matched
against a heading block's whole **body**, so a token inside a `###` passage also matches its `##`
and `#` ancestors, and the packet inlines the ancestor blocks too — three passages totalling
130,658 bytes for one token in a 43,594-byte document (shape B shows the same nesting in
miniature: `# Forge Integrations`, `## 0. Scope` and `### FI-010` all carry the token). Delivering
only the innermost matching block would be the honest fix; it belongs with whoever next owns
`owner_passages`, and it is noted in `CHANGES.md`.

**Brief item 3(e): there is no replay fixture for the R7 subject.** `tests/replay_fixtures/` holds
session records, tool calls and seal artifacts (see its `MANIFEST.json`), not built packets; no
`TOPIC_INPUTS.md` fixture exists anywhere under `tests/`. Nothing to update. The equivalent
assertion is `test_the_measured_r7_shape_with_no_unit_refs_is_no_longer_empty`, which reproduces
the measured R7 shape (no PlanUnit carries a ContractRef) on a temporary fixture and asserts the
packet now lists the SchemaID row.

**Two naming decisions.**

- The brief says `unit_id: null`; the packet's existing column is `plan_unit_id`, so a document row
  is `plan_unit_id: null` plus `source: 'document'`. Same meaning, and no consumer of the delivery
  table or the receipt has to learn a second column name.
- A document-level target that the Decision Log repeats in entry after entry is one row carrying
  every line it was declared on (`lines: [6, 21, 26]`), not one identical row per occurrence. The
  delivery verdict for a given document and anchor is the same however many lines declare it.

**Non-UTF-8 subject.** The scan decodes the subject with `errors='replace'`, so a subject that is
not valid UTF-8 remains a packaging problem rather than becoming a new crash; the hash and byte
count are still taken over the raw bytes.

## 5. Coordination with B11

Untouched: `pwflow/repair_round.py`, `pwflow/transports/omp_direct.py` (its only packager contact
is the passthrough launch setting `config['topic_inputs']`, which carries no receipt fields), and
every byte of B11's `CHANGES.md` section — the B12 entry was appended with `>>` after it, and
B11's text was verified byte-identical (md5) to the copy taken before I started.
