# Ingestion checklist — A-M12-B/control/critic (ticket 1)

All reads confined to declared inputs: `assignment.md`, `input-map.json`, the exact
`brief` path, the four `predecessors` paths, and directory listing of `source_roots`
(`research/sources`). No campaign/history/evaluator/counterpart/parent path opened;
no path outside `input-map.json` declarations opened. Stage-dir dispatch mechanics
(`dispatch.json`, `dispatch-request.json`, `freeze.json`) intentionally left unread:
not declared scientific inputs.

Read completely (2026-10-09, ~18:5x UTC):

| Input | Role | Status |
|---|---|---|
| `assignment.md` (this dir) | governing brief for critic stage | read in full |
| `input-map.json` (this dir) | exact paths/deadline/route | read in full; `jq -e` parses |
| `cases/S06/brief.md` | product brief (O1–O6 obligations) | read in full |
| `research/draft.md` | predecessor planning deliverable, P1–P6 dispositions | read in full |
| `research/discovery.md` | predecessor discovery (O1–O6, V1–V5 proposals) | read in full |
| `research/source-map.json` | predecessor S01–S15 sources + uncertainty register | read in full |
| `research/revealed-plan.md` | frozen thin plan P1–P6 clauses | read in full |
| `research/sources/` (listing only) | 3 excerpt files S01–S15 | existence + non-emptiness verified; full content read happens in ticket 2 (independent source audit) |

Carry-forward for later tickets (recorded at ingestion, not yet adjudicated):
P1–P6 dispositions to challenge per O4; predecessor uncertainty register (S01, S03,
S06, S07, S10, S11, S12, S13 rows); draft cites discovery sha256 598fbc58… — recheck
against actual digest below.

Verified SHA-256 at ingestion (acceptance run):
- draft.md `cff97ab1ca83f7f49fb6ec6b29142bdc88758238b9ee4a17619521c744785c16`
- discovery.md `598fbc58889a3c75ab934d824a8ddb2c0d38c4500af8776a1e647e6c91222cee` — matches the sha256 prefix `598fbc58…` cited in draft.md §intro
- source-map.json `3426631fa470b31afa598bdcb375785ac7576cf85438223334ba2bd578c5ce22`
- revealed-plan.md `323cdef9d3d765ff0e060c6772f62b1280cf5cfa6cec1fc1e0162badd50b5c62`
- cases/S06/brief.md `4c4e4dd878bb0d77ecbbdcbc86993acdae4f9e52f019466d518bd9139e9f2de6`

Acceptance run output: `test -s assignment.md input-map.json` PASS; `jq -e . input-map.json`
PASS; all four predecessor files non-empty per `ls -l`; `research/sources` directory
non-empty (3 excerpt files: S01–S04, S05–S09, S10–S15).
