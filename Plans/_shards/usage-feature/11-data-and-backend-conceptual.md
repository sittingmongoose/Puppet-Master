## Data and Backend (conceptual)


### Cost_usage runtime artifact and Show in Ledger / Show in Usage

The **cost_usage** runtime artifact (see Plans/Runtime_Artifacts_Panel.md and Plans/storage-plan.md) is an **attribution record** only. It uses the **same canonical usage pipeline and schema** as `usage.event` (tokens_in, tokens_out, reasoning_tokens, cost, platform/provider, model). There is no second store; the Ledger and Usage page consume the same data.

**Artifacts panel actions for cost_usage items:** For each cost_usage artifact, the Artifacts panel MUST offer:
- **Show in Ledger** — Navigate to the Usage area (Ledger tab or Ledger view) with filters set so the canonical usage.event for this cost is visible (e.g. by usage_event_seq or usage_event_ref, or by run_id/thread_id/timestamp).
- **Show in Usage** — Navigate to the Usage page (or thread Usage tab when the cost is for that thread) with the same event in scope (e.g. selected or scrolled into view).

Implementation note: If the cost_usage payload includes `usage_event_seq` or `usage_event_ref`, the GUI can pass it to the Usage/Ledger view to scroll to or highlight that row. Otherwise open Usage/Ledger filtered by run_id/thread_id/ts.

### OpenCode (product) usage pipeline reference

For implementers: the flow by which usage is collected and stored can be referenced from the OpenCode product (anomalyco/opencode repo). Conceptual flow: **provider response** → adapter → **LanguageModelV2Usage** (or equivalent) → **getUsage-style normalization** (e.g. Session.getUsage) → **processor** applies on finish-step to assistant message + step-finish part; **UI reads from messages** and/or usage.event. Key paths in that repo: session-context-metrics (UI metrics from messages), processor finish-step (where token/cost is applied to message), Session.getUsage (normalization). Puppet Master does not replicate this exactly; all providers (CLI-bridged, OpenCode provider, Codex, Gemini, Copilot) normalize to the same usage.event / message usage shape; collection mechanism differs per provider. OpenCode the **provider** (Plans/Provider_OpenCode.md) is one transport; OpenCode the **product** is the reference for "how message-level usage becomes stored usage."

### Gap 3 resolution: single coherent schema

**Gap 3 (Ledger vs. usage_tracker split)** is resolved by ensuring that **cost_usage** and **usage.event** use a **single coherent schema**. The Ledger, 5h/7d aggregation, and Usage page all consume one format. The write path (UsageRecord, usage.jsonl, or seglog usage.event) MUST be documented so that field names (e.g. operation/action, tokens_in/tokens_out, cost) are consistent. No ad-hoc remapping between Ledger display and stored events.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, PolicyRule:Decision_Policy.md§2

### Backend implementation notes

- **Data layer:** Reuse and extend existing usage/plan-detection logic. Expose a clear "current usage" contract (per platform) that the GUI can poll or subscribe to (e.g. 5h used/limit, 7d used/limit, plan label). **Primary input:** aggregate from `usage.jsonl` (and optional `summary.json`); secondary: platform APIs where configured.
- **Sources:** Prefer **state JSON/JSONL first** (usage.jsonl, summary.json, active-subagents.json); then **per-platform API/CLI** (see "Per-platform usage data (API / CLI)"): Cursor API (usage/account only -- we do not use it for model invocation; OAuth + CLI for that), Codex CLI stream + provider data, Copilot CLI + GitHub Copilot metrics API, Claude Admin API + stream-json usage, Gemini direct-provider usage (local counters + estimated cost). Document which platforms support live vs after-run stats. AGENTS.md "Cursor | No API available" refers to model invocation; Cursor has a separate API for usage/limits that we may use to augment the Usage view.
- **Persistence:** Current `usage.jsonl` (and any future redb) remains the source for event-level data; aggregated 5h/7d may be derived or cached from the same data or from platform APIs.

