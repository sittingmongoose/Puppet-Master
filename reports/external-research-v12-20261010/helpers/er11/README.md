# ER11 reusable reference helper

This package records a three-context full-discovery reference recipe and a small T3 Code launcher. It is reporting/configuration work; it does not change the ER11 candidate outputs. See [REFERENCE_WORKFLOW.md](REFERENCE_WORKFLOW.md) for the recipe, evidence limits, and complete output examples.

## Files

- `prepare.py` freezes one stage prompt, its inputs, hashes, deadline, and exact T3 request before dispatch. It initializes its own runtime directory; it does not depend on a `functions.exec` store or a prior runner state.
- `reveal.py` releases the caller's exact plan bytes only after the investigator has saved substantive discovery and a source map. It writes a one-use SHA-256 receipt.
- `bootstrap.js` is the T3 `functions.exec` source. It checks the live model catalog, checks predecessor task IDs, calls `delegate_task`, and records the exact response and IDs.
- `config.example.json` is a template. Copy it to a caller-owned path, replace every `REPLACE`/example path, and keep that config outside `runtime_root`.

## Initialize and run

1. Copy `config.example.json` to a caller-owned location outside the runtime directory. Set a unique `run_id`, absolute `brief_path` and `plan_path`, an absolute UTC `whole_deadline_utc`, and a dedicated `runtime_root` outside any repository/canon tree. The default stage budgets are frozen at 1800/720/1080 seconds (30/12/18 minutes). The helper requires the current authorized route exactly: `AUTHORIZED_PROVIDER_INSTANCE`, `gpt-6-luna`, `reasoningEffort=max`, `serviceTier=priority`.
2. In the `bootstrap.js` source, set `RECIPE_DIR` to this package, `CONFIG` to your config path, and `STAGE` to `investigator`. Paste the complete file into T3 Code **functions code mode**. Run it from the top-level/root T3 thread. Each of the three context tasks will be a direct child of that root; do not launch this from an already delegated context.
3. Retain the printed `taskId`, `childThreadId`, `childRunId`, and `clientRequestId`. They are also saved under `<runtime_root>/stages/<stage>/dispatch.json`. To poll, call `tools.mcp__t3_code__task_status({taskId: "<the exact returned taskId>"})` in a later `functions.exec` call. Do not dispatch the next stage until the predecessor reports `status: "completed"`, `hasPendingChildRuns: false`, and the required complete outputs exist.
4. The investigator calls `reveal.py` only after saving `discovery.md` (>500 bytes) and `source-map.json`. It then reads `revealed-plan.md`, leaves discovery unchanged, and saves its complete `draft.md`. Once the investigator task is terminal, set `STAGE="critic"` and run `bootstrap.js` again. Once the critic task is terminal and its `critique.md` and source map are saved, set `STAGE="reviser"` and run it once more.
5. Reuse the same config and `run_id` for an exact retry of an uncertain dispatch. `prepare.py` persists the exact request and stable stage idempotency key before the T3 call. It refuses a new request ID, a changed frozen input, or a retry after the frozen deadline. A new scientific run requires a new `run_id` and runtime directory.

`bootstrap.js` calls `orchestrator_capabilities` before dispatch. If the route/options are absent, stop and record the mismatch rather than substituting. The T3 response provides the exact returned task identifiers and effective provider/model fields when available. Requested reasoning effort/service tier are recorded; treat effective values as `UNKNOWN` unless a supported response exposes them. The task API accepts only the supplied task prompt and does not copy parent conversation history; the launcher supplies no parent-history or prior-thread context.

## Runtime and lifecycle

All generated prompts, assignments, freeze manifests, reveal receipt, task IDs, status observations, and candidate outputs go under `runtime_root`. The three child assignments write only within their own stage directory. No runtime file belongs in product canon. Native Goal creation and completion happen inside each assigned context: the child must use the actual native Goal tool, save science before native terminal completion, and preserve direct tool observations. A T3 `completed` status establishes T3 task termination; by itself it does not establish native Goal activation or completion. If native timestamps or provenance cannot be directly observed, leave them `UNKNOWN`.

`prepare.py` and `reveal.py` are intentionally small stage helpers, not a new campaign state service. `assignment.md`, `input-map.json`, `freeze.json`, `request.json`, `dispatch.json`, `status.json`, `plan-reveal.json`, and each full output remain readable evidence. Do not replace a frozen request or edit an existing scored output to make a run qualify.
