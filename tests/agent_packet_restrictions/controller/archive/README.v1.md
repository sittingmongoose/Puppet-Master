# Empirical controller

`controller.py` is a Python 3 standard-library-only, fail-closed controller for
the frozen agent-packet restriction study. It does not import product code and
does not make a model call unless one of `route-canary`, `pilot`, or `fleet` is
explicitly invoked with both launch-input arguments.

## Safe validation sequence

These first two commands make no model calls:

```sh
python3 tests/agent_packet_restrictions/controller/controller.py verify-freeze
python3 tests/agent_packet_restrictions/controller/controller.py deterministic-canary
```

The empirical sequence is intentionally gated:

```sh
python3 tests/agent_packet_restrictions/controller/controller.py route-canary \
  --auth-file /read-only/launch.env \
  --opencode-config /read-only/opencode.json

python3 tests/agent_packet_restrictions/controller/controller.py pilot \
  --auth-file /read-only/launch.env \
  --opencode-config /read-only/opencode.json

python3 tests/agent_packet_restrictions/controller/controller.py fleet \
  --auth-file /read-only/launch.env \
  --opencode-config /read-only/opencode.json
```

The current `inventory/model_matrix_status.v1.json` is
`user_model_selection_pending`, so all three model-call commands refuse before
reading launch inputs or spawning OpenCode. They remain blocked until the user
selects the exact ten routes and a newly frozen status explicitly authorizes the
matrix file consumed by this controller version.

`--auth-file` accepts strict JSON in `{"env":{"NAME":"value"}}` form, a
top-level environment object, or dotenv-style `NAME=value` lines. The file is
read into the child process environment only. `--opencode-config` is read into
`OPENCODE_CONFIG_CONTENT` (JSON or JSONC); the controller replaces agent/plugin/instruction
settings with its fixed `packet-subject` isolation profile. Neither input path
nor secret/config content is written to receipts or command metadata.

Each subject call is a separate `opencode run` process in a new empty directory.
Its HOME, XDG data/cache/state/config directories, OpenCode config directory,
and TMPDIR are unique, lane-local directories. Project config, the skill tool,
external skills, Claude-compatible prompts/skills, plugins, LSP downloads,
auto-update, and all subject tools are disabled. There are no controller
semantic retries, response repairs,
replacement routes, or fallback routes.

Raw captures are immutable below `raw/runs/<run-id>/<call-id>/`. Receipts are
immutable below `receipts/<command>/`. The controller records original and
capture hashes, but redacts known launch secrets and launch paths from captured
stdout/stderr before persistence.

To deterministically rescore a captured semantic run without calling a model:

```sh
python3 tests/agent_packet_restrictions/controller/controller.py score \
  --run-id <pilot-or-fleet-run-id>
```

The fleet refuses to start unless the current frozen hashes have a passing
freeze receipt and passing deterministic, ten-route, and control-plane-qualified
pilot receipts. Semantic pilot failures remain study results; route, identity,
timeout, tool-use, parser, scorer, or capture failures invalidate the control
plane and stop qualification.
