# Storage GLM-5.3-Flash Max Fallback Qualification V13

V13 is the narrow successor to V12's consumed zero-credit pre-Popen failure.
V12 remains a permanent no-retry failure: real OMP configuration queries safely
created SQLite `agent.db-shm` and `agent.db-wal` sidecars before the subject
process, while V12 reasserted the four-file seed roster after those queries.
V13 changes only that phase boundary. The pre-query seed remains exactly four immutable mode-0600
files. Immediately before the one allowed `Popen`, the finalized receipt admits
only those unchanged four files plus optional regular non-symlink mode-0600
`agent.db-shm` and `agent.db-wal`, whose bytes and hashes are recorded separately
from source configuration. It also rechecks binary/version, effective
configuration and advisors, models override, argv, source/authority, the 28-file
dependency snapshot, and the 6,097-entry input snapshot. Preflight, the
runner-supplied launch timestamp, and Popen state remain monotonically ordered,
and all later evidence binds
the finalized preflight and Popen-state hashes.

This is a self-contained, one-row fork of the committed Storage Normalized
Matrix V6 harness. It retains the V6 runner, profile isolation, exact argv and
configuration checks, preflight/Popen custody, semantic normalizer, raw/session/
TUI custody, frozen pipeline, formal-chain replay, failure terminalization,
evidence-tree closure, one-Ctrl-D normal-exit lifecycle, and post-PASS HOLD.
It does not import or wrap the V6 runtime controller.
Before `local_runtime.py` or any V7 module imports, package-local stdlib-only
`dependency_bootstrap.py` materializes the exact 28-file V7 closure solely from
commit `c71705e045480f7a73a0d7449d0cf7df048a9bc9` Git blobs into a fixed fresh,
read-only `/tmp` root. Live-tree, archive, worktree, fallback, preloaded-module,
symlink, extra-file, and custody drift paths fail closed.

The sole fresh qualification route is `opencode-go/glm-5.3-flash` at `max`.
Both advisors are off, `goal.continuationModes=[]`, recap is off, and the
profile contains the exact committed 144-byte `models.yml` override SHA-256
`f1a585a1ec9c1a89f2d7533322bad3b7897117cd5fe3e1899bf6bf1139969a69`.
It admits one native `/goal` submission, exactly one
provided `goal` completion call with `{"op":"complete"}`, no ordinary tools,
no retry, no suffix, and no qualification credit.

The prompt is exactly derived from the frozen V6 OMP prompt by replacing only
the final carrier/lifecycle paragraphs. It admits semantic `PM_RESULT` JSON:
object-key order, JSON whitespace, surrounding prose, and marker location are
benign. Schema, types, values, list order, duplicate keys, nonfinite values,
malformed or absent candidates, and conflicts remain fail-closed.
Every line-start marker token is pre-scanned, retains assistant block and byte/
character offset provenance, and must have 1..64 ASCII JSON-whitespace bytes
before an object. Every candidate must occur strictly before the sole physical
`goal({"op":"complete"})` call; any valid or malformed post-call marker fails.
The persisted objective must equal the submitted transport slice `[6:-1]`.
Result text precedes Goal completion in the same assistant turn. After the
first verified normal exit, only the exact bounded empty aborted shutdown
artifact observed in dev13/dev14 is admitted.

The full 6,097-entry `Plans` and `scripts` input is materialized only from pinned
Git objects at `9a9f3068a01652071933582266244cce726a2dd5`. The selected receipt, root,
commit, trees, roster, content roster, and bytes are independently replayed.
Live `Plans/**` reads, default/live roots, partial roots, WorkNodes, Windows
interaction, and any unverified PASS are forbidden.

`development_lineage.json` binds the consumed MiMo dev11 429 and the consecutive
dev17/dev18 GLM/max core passes as zero-credit nonqualification lineage only.
Nonce-bound request captures use a 0700 root and 0600 single-link regular files,
are replayed before PASS, and are removed after dispatch. Each completed request
has exactly one nonempty HTTP 200 event-stream response ending in one `[DONE]`
and `tool_calls`; its text and Goal call are joined to the sole non-shutdown
assistant. A non-secret durable projection preserves raw request/response byte
counts and hashes. Preflight and launch bind its deterministic identity hash;
terminal and formal-chain custody additionally bind the completed receipt hash,
so later prefix verification remains strict after private raw cleanup.

Zero-subject checks:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py lint
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py verify-prefix
PYTHONDONTWRITEBYTECODE=1 python3 -B selftest.py
PYTHONDONTWRITEBYTECODE=1 python3 -O -B selftest.py
python3 replay.py && python3 -O replay.py
python3 dev13_replay.py && python3 -O dev13_replay.py
python3 dev14_replay.py && python3 -O dev14_replay.py
```

No provider call, launch, commit, or push is performed by these checks. Runtime
issuance is intentionally unavailable until all owned files are committed and
dual-pushed unchanged. The sole runtime form is
`python3 -B controller.py run 1 --max-seconds 3600`.
