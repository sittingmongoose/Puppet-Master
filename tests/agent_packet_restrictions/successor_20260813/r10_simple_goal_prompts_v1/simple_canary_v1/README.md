# Simple bounded-context canary

This is the course-corrected R10 experiment. It tests one small workflow chain instead of historical transport machinery or a large route matrix.

## Architecture under test

Each automated subject receives one `PromptCapsule` inline in its sole native Goal prompt:

1. one bounded objective;
2. only the source excerpts needed for that work unit, each carrying a stable source ID and canonical path/anchor;
3. explicit read-only constraints; and
4. one small typed JSON result-line contract.

The subject does not receive repository history, full Plans, controller receipts, lifecycle instructions, or hidden scorer logic. Its final answer may contain bounded explanatory prose but must end with exactly one `PM_RESULT <minified JSON>` line. Deterministic checks remain outside the prompt: a unique terminal marker, final-response byte ceiling, exact JSON equality, source-ID lineage, native Goal completion, observed non-Goal tool use, and filesystem changes.

## Representative workflow chain

| Case | Workflow class | Native interface | Relative role |
|---|---|---|---|
| `controller_codex` | controller/decomposition | Codex app; ordinary prompt beginning `Create a goal that ...` | prescribed Codex canary (`gpt-5.6-luna`, max) |
| `worker_omp` | bounded specialist decision | OMP interactive Linux PTY/TUI; one `/goal ...` prompt; both advisor controls disabled | prescribed OMP canary (`qwen3.8-max`, xhigh) |
| `reviewer_omp` | reviewer/assurance synthesis | OMP interactive Linux PTY/TUI; one `/goal ...` prompt; both advisor controls disabled | prescribed OMP canary (`qwen3.8-max`, xhigh) |

The controller maps two source excerpts to two work units. The worker receives only the authority excerpt needed for its decision. The reviewer receives the two excerpts plus the worker result and checks the chain.

Both OMP rows use the canary-only profile `/home/sittingmongoose/.omp/pmdev-r10-simple-canary-v1`, whose effective `advisor.enabled=false`, `task.agentAdvisor={"task":"off"}`, `memory.backend=off`, `autolearn.enabled=false`, `mcp.enableProjectConfig=false`, and `tools.approvalMode=yolo` values are read back before each launch. They also use `--no-tools --no-skills --no-rules`. These pure reasoning tasks need no ordinary runtime tools; the runtime disables their built-in tool projection and the verifier rejects any observed non-Goal call. OMP may still initialize configured global MCP endpoints at startup, so endpoint connection is recorded as a residual rather than treated as proof that no schemas were projected.

The exact user-prescribed six OMP and six Codex route/effort pairs are recorded in `matrix.json`, and the verifier rejects an unlisted subject route. All further harness development and iterative testing starts with the free `opencode-go/ox-alpha-free`/max route. Codex, Cursor, and Qwen tokens are reserved for the final prescribed-route passes after Ox has validated the prompt, transport, and scorer; Qwen3.8 Max/xhigh is last. Candidate 03 predates that cost-ordering correction and therefore preserves its completed Codex/Qwen rows as historical evidence rather than rewriting or rerunning them. The off-list Qwen3.6 and OMP-hosted Luna observations are retained only as zero-credit route-selection diagnostics. Muse Spark/xhigh is a prescribed but failed route: its fresh trivial Goal ran away to roughly 54K tokens and performed unrelated read-only discovery before it was paused and dropped.

## Acceptance

Run 1 passes only when all three cases:

- receive exactly one external prompt through the declared native interface;
- show a native Goal terminal state of `complete`;
- end the bounded final answer with exactly one terminal `PM_RESULT` line carrying the exact oracle JSON;
- show zero observed non-Goal tool calls and zero filesystem changes; and
- stay within the prompt and admitted-context byte ceilings in `matrix.json`.

Only a clean Run 1 permits Run 2. Run 2 uses byte-identical prompts and identical requested runtime configuration. Both runs must pass `verify.py`; effective runtime identity must also match between them.

Representative qualification is complete: Candidate 03 Run 1 and its unchanged Run 2 both pass `verify.py` across controller, bounded worker, and reviewer.

After those two clean representative runs, `full_matrix.json` was added only as an optional route-admission expansion for the identified model-coverage risk. Its order is cost-aware and fail-stopped: Ox Alpha/free validates the final harness first; non-Qwen OMP routes follow; Codex and Cursor are reserved until the free route has passed; Qwen is last. Expansion Run 1 passed Ox Alpha/max, DeepSeek V4 Flash/max, and Gemini 3.7 Flash/high, then permanently failed Muse Spark/xhigh because Muse returned the exact typed result but left native Goal active. No paid suffix row or repeat was launched. The failure rejects that route; it does not replace or weaken the already completed representative architecture qualification. Elapsed time is recorded but is not a correctness failure; Muse was classified only after its assistant turn ended, the TUI became idle, and Goal remained active.

This canary is empirical architecture evidence, not production readiness or canonical Plan completion. Direct Assistant Chat is excluded. `Plans/**` and planning ledgers remain read-only.

The first prescribed worker attempt is permanently nonqualifying but not a model failure: an `always-ask` launch override put native Goal completion behind a manual approval, and the controller interrupted it after a self-imposed five-minute threshold while the TUI still showed `Working`. That Escape exposed `Tool call denied by user: goal`, so the terminal result is controller-interfered and indeterminate. Candidate 02 removed that override and proved native Qwen Goal completion plus the correct semantic JSON, but its raw final also contained prose and therefore did not satisfy the then-frozen exact-text contract. Candidate 03 replaces only that brittle presentation obligation with the strict terminal typed-result line; neither earlier candidate is reused or credited.
