# Reproduce the final evidence ledger

Run from the checked-out `reports/external-research-v10-20261007/final` directory, without network access:

```sh
python3 replay/apply_supplement.py final-replay --final-manifest bundle/FINAL_INPUT_IDENTITIES.json --final-field-map bundle/FINAL_FIELD_MAP.json --output replay/reproduced/FINAL_LEDGER.json
cmp replay/reproduced/FINAL_LEDGER.json FINAL_LEDGER.json
```

The unchanged mapper hashes every one of the 226 physical bundle inputs before reading any field. It validates the fixed 40/80 index, four exact future-case quiet bindings, and unchanged original grade terms/objects for the prior 36 slots. This replays metadata; it does not grade science or infer missing coverage from counts. The input manifest, field map, unresolved-cell export and build validation retain exact original paths, SHA-256 values and JSON pointers. All historical WORKING editions remain unchanged.

The [asset manifest](../FINAL_ASSET_MANIFEST.json) maps exact final artifacts to published paths and hashes. Late candidate tasks, input maps, scientific outputs, executed witnesses, retained failed runs, independent source checks and full reviews are in `late/`; prior exact paths are reused where unchanged. Earlier batches retain the anchors, targeted/integrated originals, confirmation locks and all 24 prebound confirmation input files. [The case locator index](CASE_EVIDENCE_INDEX.json) supplies the new or exact-existing paths.

SDK reproduction is limited to the frozen metadata observation and streaming-parser code. Raw provider rollouts and account identities are deliberately not published. The once-only capture, bounds, role joins, qualification and exclusions remain explicit; a GitHub-only reader cannot fabricate missing other-provider quantities or billing. No recapture or automatic watcher is part of this bundle.

Raw source bodies are identified by exact original URL/version/SHA/offset locators rather than publicly recopied. `retention/FIXED_SOURCE_RECONSTRUCTION_CATALOG.json` and `replay/reconstruct_fixed_sources.py` support only the 49 independently verified fixed-commit whole-body identities; use its dry-run first, then a NEW output directory if reconstruction is needed. Mutable documents, versioned-but-unqualified bodies, mismatched editions and unopened package members remain holds. The small private archive is metadata-located and separately verified; it reconstructs selected governing fragments, not whole sources. The original CISA/Slint transform limitations and the public Slint quote authorization remain unchanged. No new public source quotation is included.

Candidate witness programs can be inspected with their exact frozen input/receipt files. Their independent reviews distinguish valid process execution from witness correctness, oracle independence and applicability. Do not rerun a candidate to replace an original verdict. Static primary-source conclusions do not certify runtime behavior absent an executed fixture. Failure costs and prospective changes are retained rather than selecting the best version.
