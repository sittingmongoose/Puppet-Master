# Delta Notes — Initial Bounded Sample

EA-27 reported 393 exact surface rows and 26 non-exact rows: registered 37, confirmed persisted unregistered 248, excluded 68, candidate-only 3, emit-only 18, alias 12, conflicting 5, unknown 2. Persisted floor was 285; denominator was `UNKNOWN_OPEN`.

A sibling `CensusRunner` lexical pre-pass over a broader 177-source working-directory set found 11,137 regex-valid strings. It found 385/393 EA-27 exact rows, 10,752 strings not in the EA-27 union, and all live39 registry tokens. Bucket presence: 248/248 persisted-unregistered, 40/40 unresolved, 37/37 July registered, and 60/68 exclusions. The eight absent rows are the citation-honesty-corrected plugin exclusions: `plugin.crashed`, `plugin.disabled`, `plugin.enabled`, `plugin.installed`, `plugin.permission_granted`, `plugin.permission_revoked`, `plugin.uninstalled`, `plugin.updated`. Live39 minus Known37 is `terminal.workgroup_moved` and `workspace.layout_changed`.

This is not a family delta. False positives dominate (`plan.md`, `span_map.jsonl`, `index.py`, `migration.py`, `e.g`, schema/file identifiers). None is admitted. The sample is broader than this design's 158-source inventory, so raw totals cannot be projected. It neither semantically reconfirms the 248 nor closes any 12-field contract.

`denominator_closed=false`; `complete_denominator=UNKNOWN_OPEN`; `bulk_registration=false`.