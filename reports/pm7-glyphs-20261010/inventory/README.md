# pm7-glyphs inventory (2026-10-10)

The census of every icon, glyph and status mark in PMConcept7 and in the unpublished panels and terminal packages,
for the neon glyph system (`Concepts/glyph-system/opus-5.5/`). Mechanical workers produced it from written specs; the
lead reviewed and spot-checked each file against the sources before committing it.

| File | What | Worker |
|---|---|---|
| `icon-tables.csv`, `inline-svgs.csv`, `symbol-chars.csv`, `status-vocab.csv`, `mapping-draft.csv`, `source-census-README.md` | PM7 sources (pm7-tools base, opus-5.5 src, left rail, Usage), round 1 | Muse spark 1.3 contributor (W2) |
| `base-diff.md`, `icon-tables-b.csv`, `status-vocab-b.csv`, `inline-svgs-b.csv`, `status-draft-full.csv`, `source-census-b-README.md` | Round 2 against the real build base (`Onboarding concepts/TestPMConcept.html`) and every status row mapped to the neon vocabulary | Muse (W2b) |
| `runtime-census.csv`, `runtime-shapes.csv`, `runtime-coverage.md`, `runtime-status-conflicts.md` | What PMConcept7 actually shows: 1,163 rows over 49 surfaces, 344 distinct shapes, in Basic light (screenshots and raw captures: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-glyphs-20261010/runtime-census/w1-shots-raw.tar.gz`, SHA-256 in the `.sha256` beside it) | Z.AI GLM-5.3-Flash (W1) |
| `panels-terminal-*.csv`, `panels-terminal-README.md` | The panels (concept/home-panels-20261009 @57644989ec) and terminal (concept/home-terminal-20261009 @310e11fb6a) packages | Muse (W3) |

`Concepts/glyph-system/opus-5.5/tools/build_map.py` turns these into the catalog's before-and-after map; the status
words per surface in `src/data/status.json` come from `status-draft-full.csv` and `panels-terminal-mapping.csv`.
Known limits: round 1 cited `PM7-base.html`; round 2 found its icon tables byte-identical to the real base, so those
citations stand, and listed what only the real base has.
