## Scope of the Usage Feature

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0694
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Thread Usage stays canonical in-shell, but app Usage pivots still need the same shared scope envelope.
  - must open/focus Usage in the correct project/thread/run scope
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

### 1. Quota and plan visibility (primary)

- **5h and 7d windows:** Show current usage vs limit (e.g. "5h: X / Y", "7d: X / Y") per platform where the platform or org API provides it.
- **Plan type:** Show detected or configured plan (e.g. Pro, Team) where available (see AGENTS.md plan detection).
- **Placement:** Always visible in at least one of: dashboard, header, or a dedicated **Usage** page. Tier config / setup should show current usage when selecting a platform so users can avoid platforms near limit.
- **Refresh:** Background refresh (e.g. periodic or after runs) so numbers stay up to date without blocking the UI. Document which platforms support "live" vs "after-run" stats.
- **Always-visible limits:** Match UX expectations set by tools like [yume](https://aofp.github.io/yume/) -- 5h and 7d usage always visible so users don't need a manual "usage" command.

### 2. Alerts and thresholds

- **Approaching limit:** Optional warning when usage is near limit (e.g. 80% of 5h window) so the user can switch tier or pause.
- **Rate limit hit:** When a run hits quota/rate limit, surface a clear message and, where possible, suggested action (e.g. "Try again after X" or "Switch platform"); link to the Usage view.

### 3. Event ledger (existing concept, under Usage umbrella)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0696
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - layout under 500ms at 500 nodes
  - `object_id = <canonical usage event id>`
  - object_id = <canonical usage event id>
  - Provider/runtime/account seams got materially sharper under Sonnet:
  - `tab_id = ledger`
  - tab_id = ledger
  - `tab_id = evidence` or `tab_id = ledger`
  - tab_id = evidence
  - `object_id = canonical usage event id`
  - object_id = canonical usage event id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

- **Event-level log:** Keep the existing concept of an event ledger (platform, operation, tokens in/out, cost, tier/session) so users can inspect per-request usage. This may remain the current "Ledger" page or be presented as a tab/section under a unified **Usage** area.
- **Filtering and export:** Retain filtering (e.g. by type, tier, session) and export (e.g. JSON) as part of the Usage feature.

### 4. Optional analytics and reporting

- **Aggregated view:** Over time, support an analytics view that aggregates usage by time window, platform, project, or tier (as in newfeatures §7). Can be a separate page or a section under Usage.
- **Cost tracking and attribution:** Where data is available (from platform APIs), show cost breakdowns by model, project, and date (see [openclaudecto](https://github.com/josharsh/openclaudecto), [yume analytics](https://aofp.github.io/yume/)).
- **Retention:** Policy for how long to keep usage/ledger data (e.g. file-based or redb-backed) to bound disk use while supporting 5h/7d and historical views.

### 5. Per-thread usage in Chat (OpenCode-style)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0697
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - per-thread usage is already one canonical detail surface
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Per-thread context/usage in chat is a split inspect/action affordance rather than a direct jump to a chat-shell usage panel.

Rules:
- the chat header context circle is always the entrypoint for per-thread context state
- hover opens a lightweight status module showing `Usage`, `Tokens`, estimated `Cost`, and `More Details`
- click reveals the `Compact Now` action instead of immediately opening the detail surface
- selecting `Compact Now` dispatches the canonical compaction command for that thread
- selecting `More Details` opens or focuses the thread-scoped Context Detail Pane in an editor tab
- app-wide Usage remains the canonical aggregated platform view and is not replaced by this thread-scoped pane
- mid-stream updates are allowed but must use explicit in-progress states until final usage totals are known

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md

The Context Detail Pane must support both curated inspection and raw payload inspection.

Required content:
- curated overview of thread counts, provider/model/mode/persona, and headline tokens/context/estimated cost
- grouped context and token breakdowns
- per-message inspection with human-readable fields first
- raw payload toggles for the full thread and for individual messages
- drill-downs by mode, provider, model, and other shared runtime identity dimensions when available

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Prompt_Pipeline.md

Estimated-cost rule:
- per-thread chat cost uses the OpenCode-style normalization formula as the baseline approximation
- reasoning tokens are charged at the output-token rate for the estimate
- cache read and cache write buckets are included when pricing metadata exists
- provider-sensitive cache normalization caveats must remain visible in raw/debug paths and must not be hidden behind authoritative wording in the chat UI

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md
### Cursor -- API (usage/account only; not for model invocation)
Cursor usage is account and plan augmentation only. PM does not use a Cursor API for model invocation.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md

Canonical usage-source classes for Cursor are:
- `provider-reported`
- `team-admin-reported`
- `inferred_from_runtime_refusal`

Rules:
- PM must not invent a fake universal remaining-request counter when Cursor exposes only plan totals, team allotments, or runtime/editor refusal signals.
- monthly included usage or request-allotment semantics are shown honestly as plan-cycle data rather than forced into a short rolling-window countdown.
- `cursor-agent` remains the runtime target for execution and account validation.
- `CURSOR_API_KEY` is an advanced/non-default setup path and does not change the CLI runtime ownership model.
- Usage UI must disclose whether the data comes from provider-reported plan data, team-admin data, or inferred refusal/runtime evidence.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md
### Codex -- Direct provider

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0698
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - prior direct reads of current owner docs and late-straggler route/records slices
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Codex is a direct provider in PM and supports multiple accounts across two distinct auth families:
- `Sign in with ChatGPT`
- `Use API Key`

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

Usage rules:
- ChatGPT-backed Codex usage and API-key-backed Codex usage are distinct entitlement buckets.
- PM MUST NOT merge those buckets into one shared pressure or cooldown pool, even when they belong to the same human owner.
- plan-backed Codex accounts may expose included-usage windows and provider refusals.
- API-key-backed Codex accounts behave as API-billed usage and may not have the same reset semantics.
- Usage rows must label the bucket plainly, for example `Plan: ChatGPT Pro` or `Usage Bucket: API billed`.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md
### GitHub Copilot -- Direct provider
GitHub Copilot is a direct provider in PM.

PM keeps one auth-backed account row per GitHub login and may resolve one effective billing/entity context beneath that row when premium-request semantics require it.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

Usage and blocked-state rules:
- premium-request exhaustion, paid-overage policy, org policy blocks, and entitlement-missing states are distinct conditions and must not all be flattened into a generic cooldown.
- blocked reasons should remain explicit, including `billing_entity_required`, `included_premium_exhausted`, `paid_overage_disallowed`, `copilot_entitlement_missing`, and `copilot_org_policy_blocked`.
- if multiple billing entities are available, the account may be `Logged in` but still `Needs setup` until the user chooses the effective billing entity.
- Usage and status surfaces must show the selected billing/entity context whenever it explains the active quota bucket.
- GitHub repository auth and local git/worktree behavior remain independent from GitHub Copilot account switching.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md
### Claude Code -- Admin API (existing)

- **Availability:** Anthropic **Admin API** (`/v1/organizations/usage_report/claude_code`); env: `ANTHROPIC_API_KEY`. Already documented in AGENTS.md.
- **What we get:** Organization-level usage and cost; `customer_type`, `subscription_type` for plan detection. Per-session usage also available from **stream-json** output when we use `--output-format stream-json` (usage events in the stream).
- **Usage feature:** Use Admin API for 5h/7d or org windows when key is set; use stream-json usage events for per-run tokens and optional mid-stream context %. No SDK required for CLI-based runs.

### Gemini -- Direct-provider (local counters + estimated cost)
Gemini usage must distinguish the direct provider from Gemini CLI while still allowing family-level pooling when policy permits.

#### Gemini direct

`Gemini` is the direct API-key provider entry.

Rules:
- direct Gemini account rows are API-key-backed only.
- quota identity may depend on effective Google project context as well as the key itself.
- when PM cannot prove authoritative remaining quota, the UI must show `estimated` or equivalent source-qualified wording rather than pretending the numbers are definitive.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Media_Generation_and_Capabilities.md

#### Gemini CLI

`Gemini CLI` is a separate provider entry.

Rules:
- Gemini CLI may use OAuth, direct API key, or Vertex/Google credential families depending the configured account row.
- trust can affect runtime MCP visibility, so `Configured` and `Working` must remain separate states.
- provider-side model routing may still override the explicitly requested model in some flows; PM must show requested/effective differences rather than assuming full determinism.
- usage/cooldown behavior depends on the active auth family and may range from authoritative remaining counters to softer or inferred pressure.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md

#### Family-pooling rule

When policy pools Gemini direct and Gemini CLI together, the Usage surface must still show which concrete runtime surface actually handled the run and why.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md
### Summary table (augmentation sources)
| Provider entry | Primary usage sources | Auth / setup context | UI disclosure rule |
|---|---|---|---|
| **Cursor CLI** | provider-reported plan data, team-admin reporting, inferred runtime refusal | `cursor-agent` login default; API key advanced/non-default | show source-confidence; do not fake precise remaining counters |
| **Codex** | direct provider usage, plan windows, provider refusals, API-billed usage | `ChatGPT` or `API key` account rows | keep plan-backed and API-billed buckets separate |
| **GitHub Copilot** | provider quotas, premium-request semantics, runtime refusals, policy blocks | GitHub login plus selected billing/entity context when required | show billing/entity and blocked reason explicitly |
| **Claude Code CLI** | API/admin usage where available, runtime signals, softer subscriber stats | subscriber, console/API, or SSO account rows | show whether data is authoritative or inferred |
| **Gemini** | provider usage, quota APIs, project attribution, error hints | direct API-key account rows | show project attribution and estimated-vs-authoritative status honestly |
| **Gemini CLI** | CLI/runtime signals, config/trust state, provider counters when available | OAuth, API-key, ADC, service-account, or Vertex account rows | show concrete runtime surface and auth family |
| **OpenCode** | server health/discovery plus upstream provider usage where exposed through the server | managed or attached server profiles | separate connected/discovery status from actual provider availability |

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/FinalGUISpec.md
