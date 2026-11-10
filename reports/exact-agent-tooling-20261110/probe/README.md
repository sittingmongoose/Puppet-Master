# Probe and pilot code

Experiment code for this report. None of it is product code, a Plans artefact or a kit check. It is in the repository
only so that it can be reviewed on the branch; the same files are in
`/mnt/Cursor/PM-Experiments/exact-agent-tooling-20261110/`.

| Folder | What it is | How it was run |
|---|---|---|
| `slint-probe/` | A 15-control Slint page, the test-only adapter (`src/testkit.rs`, behind the `testkit` feature), and seven focused checks (`tests/focused.rs`). `build.rs` compiles a digest of the sources into the binary. | `SLINT_EMIT_DEBUG_INFO=1 cargo test --features testkit --test focused -- --nocapture --test-threads=1`, Slint 1.18.1. No `Cargo.lock` is committed; the run's lock file hash is in `evidence/raw/slint-dependency-tree.txt`. |
| `slint-test-server/` | `slint-mcp-probe.sh` drives a test build's embedded MCP server with `curl`; `project_tree.py` turns a saved `get_element_tree` reply into the compact listing. | `slint-mcp-probe.sh <binary> <outdir> <port>`; `project_tree.py <element-tree.json> [out.txt]`. The server was run in the first pass only (an earlier version of the page, without `accessible-id`). |
| `pm7-tree-size/` | One browser-check file that measures the size of each way of describing the concept page. | `browser-check run tree-size.check.mjs --set page=<PMConcept7.html> --set out=<dir>` |
| `pilot/` | The pilot's apparatus: `make_fixture.py` (stamped pages, ids, one seeded defect per variant), `kit/` (freshness check for both arms, id helpers and listing for arm B, the two kit guides), `tasks/`, `ref/` (reference checks), `fresh/` (four freshness cases), `make_session.sh`, `oracle.py`, `measure.py`, and `session-checks/` (the eight checks the agents delivered). | See the header of each script. |
| `citation-checks/` | The two scripts that check quoted passages against the files they cite. | `check_citations.py <root> <citations.json>` |

`make_fixture.py` names the four defects in comments. The agents in the calibration sessions never saw this file,
the fixtures folder or the reference checks: each worked in its own directory with one page.
