# reviser sources/ — navigable index

Bounded evidence retained for ER11 case S05 (museum-search), block A-M05-A/control, stage reviser. The reviser
fetched exactly two public primary sources this session; both excerpts are below. Source IDs are immutable within
this stage and mirrored one-to-one in `../source-map.json`. Predecessor citations (SRC-01…09, SRC-C01…C09) resolve
through the inherited-source pointers in `../source-map.json` to the research and critic stages' own maps and
evidence roots, which were read in full and not re-fetched.

| ID | Source | Resolves criticism | Status | Evidence file |
|----|--------|--------------------|--------|---------------|
| SRC-R01 | rights-statements.ttl at master (RightsStatements data-model) | M3 (twelve-statement set), feeds §2 P4/§4 | retrieved | [SRC-R01-rightsstatements-ttl.md](SRC-R01-rightsstatements-ttl.md) |
| SRC-R02 | Typesense docs 30.2 search API parameters | M2 (engine defaults; numeric-fuzz knob) | retrieved | [SRC-R02-typesense-search.md](SRC-R02-typesense-search.md) |

**Files checked this stage (ingestion + verification), for the record:** own inputs `../assignment.md`,
`../input-map.json`; brief `../../../cases/S05/brief.md`; research `../research/{draft,discovery,revealed-plan}.md`,
`../research/source-map.json`, `../research/sources/` (10 files); critic `../critic/critique.md`,
`../critic/source-map.json`, `../critic/notes/{verification-verdicts,claim-inventory}.md`; own artifacts
`../revision-ledger.md`, `../verification-notes.md`, `../final.md`.

Reading order for a reviewer: `../final.md` (deliverable) → `../verification-notes.md` (per-criticism checks,
including the SRC-R01/SRC-R02 results) → the two evidence files above → predecessor roots via
`../source-map.json` inherited_sources.
