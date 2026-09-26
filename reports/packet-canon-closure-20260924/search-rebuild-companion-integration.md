# Search rebuild companion — integration in progress

Status: candidate installed and locally checked; central gate enrollment and
independent carry review remain pending. No native Search or GUI proof.

Source directory:
`/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/jobs/search-rebuild-typed-01/`.

Different-Sol V4F review `REVIEW-DIFFERENT-SOL-V4F.md`, SHA-256
`ece6ba1ce84862348ad82931fefa3d763098b47575e00a7105e75ecc064ef614`,
accepts bounded static composition with the actual central outcome schema and
existing acknowledgement and response/outcome binding helpers. The independently
selected outcome ref remains a static test input, not an authenticated issuer.

Root installed the four frozen candidate files. Both JSON files differ only by
one added EOF newline; byte comparison and parsed JSON equality passed. The
helper is unchanged. Initial installed unittest failed because two test constants
still used the external `owner-supplement-v4` directory. Root changed those two
constants to the actual repository owner paths; that integration defect was
reported back to the reviewer rather than treating the candidate test pass as an
installed pass.

Current carry SHA-256 values:

| File | SHA-256 |
|---|---|
| Plans/search_rebuild_index.schema.json | 09fbd8b9122c1707c9576feba040be0061f69b426c52f1e8b5b117d6561460bb |
| Plans/search_rebuild_index_fixtures.json | c6b0fbec55305c9e71f197696b0ee5e6c55aa8e31cdc262b44c80bd00976aba5 |
| scripts/pm_search_rebuild_typed.py | 7a8905db6e4b44b3777719d9bd188728d08e72232848ab5a6fe225a733737cea |
| tests/test_pm_search_rebuild_typed.py | 2799c86105be503b3e9bb8db372e02aeaace588ed2fa955c37d7e13c342de598 |

Root checks on 2026-09-26:

- `python3 -m unittest tests.test_pm_search_rebuild_typed`: 78 tests PASS.
- `python3 scripts/pm_search_rebuild_typed.py`: PASS; six positive cases,
  15 pairwise checks, no failures, `native_acts_proven=0`.

The central gate is not yet changed, and these results do not claim full
aggregate, handler availability, genuine build/publication, receipt issuance,
physical custody, runtime currentness or whole-packet closure.
