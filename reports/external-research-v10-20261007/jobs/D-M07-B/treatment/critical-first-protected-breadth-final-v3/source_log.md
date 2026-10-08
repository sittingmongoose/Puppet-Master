# D-M07-B v3 source log — critical-first-protected-breadth-final (ticket 1: input reading)

Log written 2026-10-07T23:26:25Z. Every path below is one listed by INPUT_MAP.json (or the map file itself); no other scientific source was read this stage.

## Policy metadata paths

| path | sha256 | notes |
|---|---|---|
| jobs/D-M07-B/treatment/critical-first-protected-breadth-final-v3/INPUT_MAP.json | c91995f084dc92e0fa59e5869be78ef160ae73fe8b30875736e80e99ed507a95 | Read in full. Lists brief, source_manifest, 2 sources, boundary, draft. |
| cases/D-M07-B/inputs/brief.md | 30a8e78fbc3913556d985d909d82c0db3b61207859f8588ece1d4cef045cce2d | Case brief: six obligations, FROZEN_PUBLIC_PRIMARY_CORPUS mode, soft 1100 words / 8 findings. |
| cases/D-M07-B/inputs/sources.json | 528a61f25f479c20a76c855e15541cc44f392a575ef5fc85e37d2f9b0cd6205d | Manifest schema pm.er10.public-source-manifest.v1; open_discovery_note: null. |
| jobs/D-M07-B/treatment/critical-first-protected-breadth-final-v3/boundary.json | f26c87c76b8b026388a6c2bb954b8bd6bf88c79d2f09d2bbb629a25ab213cac1 | common_T0 2026-10-07T23:14:13.527092+00:00; absolute deadline 2026-10-08T00:04:13.527092+00:00; stage ceiling 30 min. |
| jobs/D-M07-B/common/fresh-untrusted-seed-v3/draft.md | 8ab7b4d982574ad4f3f3b3b80bd044f41ee446e3f947bc9a2e525d99ae1897b9 | Untrusted candidate proposal (P1–P8). Treated strictly as a test input, not truth or evaluator judgment. |

## Frozen public primary corpus (sha256 verified against manifest this stage)

| source_id | url | version / capture | sha256 (computed = manifest) | local path |
|---|---|---|---|---|
| projdoc | https://raw.githubusercontent.com/pyproj4/pyproj/3.6.1/docs/api/transformer.rst | pyproj 3.6.1; capture_date_utc 2026-10-07 | 261a0a3602984e91ed13179990c535bf19a4e841302554ee4fad25b77e4ade51 ✓ | cases/D-M07-B/inputs/sources/projdoc.rst (47 lines, 1337 bytes; read in full) |
| projcode | https://raw.githubusercontent.com/pyproj4/pyproj/3.6.1/pyproj/transformer.py | pyproj 3.6.1; underlying PROJ 9.3.0 assumed by brief, no execution implied; capture_date_utc 2026-10-07 | f5f8a43cb7030e5d0462121a54414be74504586dbb1d32d4c37857f1de9dabda ✓ | cases/D-M07-B/inputs/sources/projcode.py (1339 lines, 44983 bytes; read in full) |

## Limitations

- Static reading only; no project code executed, no installers run (per brief).
- The frozen corpus holds pyproj 3.6.1 Python sources but not the PROJ binary, data files, or grids; PROJ 9.3.0 remains a brief-level assumption (kept visible as an environmental dependency).
- projdoc.rst is a capture-pinned doc page (autoclass stubs + axis-order warning); released implementation file projcode.py governs claims about the selected release.
- Draft claims (P1–P8) cite projdoc/projcode but are untrusted until re-verified against the corpus.

## Off-policy exposure statement

No failedscience, evaluatorfacts, parenthistory, rootfailureanalysis, sibling, other-arm, other-case, or campaign-state path was read. Advisory paths encountered: none opened beyond the six INPUT_MAP-listed paths above.
