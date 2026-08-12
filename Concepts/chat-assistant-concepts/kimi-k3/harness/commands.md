# Kimi K3 harness commands

All runners serve the model folder on an OS-assigned port and drive headless
system Chrome/Edge. Results JSON + screenshots write to OS temp
(`%TMP%/k3h-<pid>/<suite>/`), never the repo.

## Drivers

- Default: `--driver=cdp` — zero-dependency CDP driver (Node 22 WebSocket,
  Chrome `--remote-debugging-port=0`, unique temp profile per run).
- Optional: `--driver=playwright` — uses `playwright-core` against the system
  browser (`npm i --prefix harness playwright-core` once; falls back to CDP
  with a console note when absent).

## Suites (cwd: Concepts/chat-assistant-concepts/kimi-k3)

| Command | What it runs |
|---|---|
| `node harness/serve.mjs` | static server only (prints `K3H-URL <url>`) |
| `node harness/run-boot-smoke.mjs` | one pairing: dataset contract (19 threads / 5 providers / BSD seeds / zero errors) |
| `node harness/run-pair-smoke.mjs` | all 64 window×thread pairings: layout probes |
| `node harness/run-matrix.mjs` | 8 themes × 4 widths × rail × 22 pairings (1408 configs): overflow/errors/emoji/x-leak/clipping |
| `node harness/run-feature-states.mjs` | every `?state=` key (28 legacy + 43 packet) × 64 pairings: `stateApplied` + zero errors |
| `node harness/run-reduced-motion.mjs` | full vs reduced-motion final-state parity (artifact/BSD/questionnaire/compact/offline/goal) |
| `node harness/run-mounts.mjs` | docked↔pop-out remounts, thread switches, simulated restart per pairing |
| `node harness/run-packet-probes.mjs` | behavioral gate: 18 packet probes × 4 pairings × 2 themes × 2 widths (`--only=<name>` for one) |
| `node harness/run-terminology.mjs` | PM-native browser terms; no Playwright-shaped vocabulary; Full Access present, no "yolo" |
| `node harness/capture-shots.mjs` | state-gallery frames (themes × widths × key states) → OS temp + manifest.json |

Useful flags: `--driver=cdp|playwright`, `--pair=w1:t1` (boot), `--subset=w1:t1,w2:t2`
(pair smoke), `--pairings=N` (matrix size), `--keys=a,b` (feature states/shots),
`--only=<probe>` (packet probes).

## Collision rules (parallel agents also run browsers)

- servers: `server.listen(0)` only — never a fixed port;
- browser: unique temp `--user-data-dir` per launch; debug port 0;
- unique `sess` per run (`k3h-<pid>-<ts>-<n>`), so localStorage never collides;
- results/screenshots only under `%TMP%/k3h-<pid>/`;
- kill only processes the runner started (server child + browser child).
