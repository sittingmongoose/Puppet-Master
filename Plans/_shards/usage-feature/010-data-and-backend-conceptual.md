# Shard 010: Data and Backend (conceptual)

Source: `Plans/usage-feature.md`

Source lines: L375-L415

Source SHA256: `4ef6ada2d4f56f156b5b034b425597baeb26ec8890f6cb4ca936477745be07ba`

---

## Data and Backend (conceptual)
### Cost_usage runtime artifact and Show in Ledger / Show in Usage


The `cost_usage` runtime artifact is an attribution record only. It uses the same canonical usage pipeline and schema as `usage.event`.

Required actions for `cost_usage` items are:
- `Show in Ledger` — navigate to the canonical Ledger surface with the matching usage identity in scope
- `Show in Usage` — navigate to app-wide Usage or to the thread-scoped Context Detail Pane depending on artifact scope, preserving the same thread/run filters

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

Rules:
- thread-scoped cost usage does not open a chat side-panel usage surface
- thread-scoped cost usage lands on the same Context Detail Pane used by the chat context circle `More Details` action
- app-wide cost usage lands on the app-wide Usage surface
- the artifact does not create a second token or cost model outside the canonical usage schema

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md
### OpenCode (product) usage pipeline reference

For implementers: the flow by which usage is collected and stored can be referenced from the OpenCode product (anomalyco/opencode repo). Conceptual flow: **provider response** → adapter → **LanguageModelV2Usage** (or equivalent) → **getUsage-style normalization** (e.g. Session.getUsage) → **processor** applies on finish-step to assistant message + step-finish part; **UI reads from messages** and/or usage.event. Key paths in that repo: session-context-metrics (UI metrics from messages), processor finish-step (where token/cost is applied to message), Session.getUsage (normalization). Puppet Master does not replicate this exactly; all providers (CLI-bridged, OpenCode provider, Codex, Gemini, Copilot) normalize to the same usage.event / message usage shape; collection mechanism differs per provider. OpenCode the **provider** (Plans/Provider_OpenCode.md) is one transport; OpenCode the **product** is the reference for "how message-level usage becomes stored usage."

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Provider_OpenCode.md, PolicyRule:Decision_Policy.md§2
### Backend implementation notes
- **Data layer:** Reuse and extend existing usage/plan-detection logic. Expose a clear current-usage contract per platform that the GUI can poll or subscribe to.
- **Primary input:** canonical usage projections and redb rollups derived from the seglog pipeline.
- **Secondary input:** platform APIs and structured provider/runtime outputs when configured and supported.
- **Compatibility input:** `usage.jsonl` may still be read as a human-readable mirror or migration input, but not as the canonical 5h/7d rollup source.
- **Retired subagent side files:** In `Plans/usage-feature.md` (`/usage-feature.md`), `active-subagents.json` and other active-subagents `side-file` / `live-state` mirrors are compatibility projections only; they must not be presented as canonical or endorsed usage enrichment sources after side-file retirement.
- Thread-scoped plan `/todo` state used by Usage and Context Detail views comes from storage-backed revision/status history, not from an ad hoc usage-side TODO store.
- Web change-tracking usage rows preserve `change_status: "new"` when no previous version exists and compare against the most recent cached version of the same normalized `URL`.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/FinalGUISpec.md

- Usage-linked planning widgets consume the sticky-card / execution-tracker contract from the planning UI: after approval, they show read-mostly status badges, item-focus navigation for the active or selected TODO item, and post-approval edit restrictions rather than becoming a second plan state owner.
- **Gemini source model:** Prefer the shared `UsageRecord` pipeline and carry explicit source attribution instead of hardcoding Gemini to local counters only.
- **Gemini signal weighting:** strong provider/account telemetry outranks structured runtime output; structured output outranks heuristics; heuristics outrank local-only counters.
- **Persistence:** event-level data and rollups remain canonical storage concerns; account-health and quota-pressure updates must feed the same control loop used by multi-account routing.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md, PolicyRule:Decision_Policy.md§2
