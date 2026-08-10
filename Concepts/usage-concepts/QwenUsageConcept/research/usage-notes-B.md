# Usage Research Notes — Batch B

Access date 2026-07-30. Shallow clones into a temp dir (removed after); issues/PRs via `gh api`.
8 projects across 3 categories: 4 platforms, 2 VS Code extensions, 2 niche individual trackers.

| # | Project | Category | License | Branch | Commit SHA |
|---|---------|----------|---------|--------|-----------|
| 1 | BerriAI/litellm | platform gateway/billing | MIT (excl. enterprise/) | litellm_internal_staging | `71b825a7f0549fd9a297f7926fc5990c11323d92` |
| 2 | Helicone/helicone | platform observability/gateway | Apache-2.0 | main | `67df07b8d807a960f2e53d9ec2a9c49513ca2379` |
| 3 | openmeterio/openmeter | platform metering/entitlements | Apache-2.0 | main | `593670394f141c6dad888740db80cb8d6379227d` |
| 4 | getlago/lago-api | platform billing/wallets | AGPL-3.0 | main | `526b4b51e74e2ebe2fa99d940887da86302c43d1` |
| 5 | BedirT/LLM-Token-Counter-VSCode | vscode ext / token count | MIT | main | `295e4b7f0a662d9d03781c0d1312d6c2dfa33c53` |
| 6 | ivarhuni/-vs-context | vscode ext / context window | MIT | main | `af50d276ba8ab6e06e8fac120042edfa35bb8619` |
| 7 | feelgood4everai/copilot-usage-dashboard-v2 | niche / copilot quota+forecast | MIT | master | `c2be1973e7d68a5f5db3bfa3a8eda9720d669a82` |
| 8 | shardiwal/github-copilot-usage-tracker | niche / copilot token estimate | MIT | master | `f8ff6af5e23df3624478967fee43acaf91d37c26` |

Note: `getlago/lago` (umbrella, HEAD `b4ad1532`, AGPL-3.0) keeps the Rails API as a git submodule under `api/`; the actual code is `getlago/lago-api`, cloned directly.

---

## 1. LiteLLM — cost calculator, cache-token normalization

Source of tokens: provider `usage` object. It reads BOTH OpenAI-style nested details and
Anthropic-style top-level keys (`cost_calculator.py:374-397`). Price: bundled `cost.json` /
`get_model_cost_map.py`, overridable via `custom_cost_per_token` / `custom_cost_per_second`.

**Inclusive vs additive cache reconciliation (the key excerpt):**

```python
# Anthropic reports prompt_tokens as input_tokens (excluding cache tokens).
# Adjust so the helper's "prompt_tokens includes cache tokens" invariant holds.
_normalized_prompt_tokens = float(prompt_tokens)
if _is_anthropic_style:
    _normalized_prompt_tokens += _cache_read_tokens + _cache_creation_tokens
```
(`litellm/cost_calculator.py:400-404`)

**Double-count prevention inside the helper:**
```python
# prompt_tokens is assumed to include both cached_tokens and cache_creation_tokens
regular_prompt_tokens = max(prompt_tokens - cached_tokens - cache_creation_tokens, 0)
input_cost = (regular_prompt_tokens * input_cost_per_token
              + cached_tokens * cache_read_input_token_cost
              + cache_creation_tokens * cache_creation_input_token_cost)
```
(`litellm/cost_calculator.py:192,212-221`)

Data path: proxy call → parse usage → `cost_per_token()`/`response_cost()` →
`StandardLoggingPayload` (`response_cost` + `response_cost_breakdown`) → logging callbacks /
spend-log DB → budgets & cost-weighted routing (`router_strategy/lowest_cost.py`).
Budgets: `budget_manager.py`, `max_budget` + `budget_duration` per key/user/team (cumulative spend,
soft/hard block) — less formal than OpenMeter/Lago windows.

**Failure modes (issues/PRs):**
- PR #33983 — OpenAI `cache_write_tokens` unrecognized (only Anthropic `cache_creation_tokens`
  handled) → `response_cost` understated, cache-write billed at input rate; error in 3 places.
- Issue #34309 — total cost correct but `response_cost_breakdown.cache_read_cost`/`cache_creation_cost`
  always null for OpenAI Responses API (breakdown only reads Anthropic-style top-level keys).
- Issue #32496 — `fireworks_ai` calculator ignores `cached_tokens`/`cache_read_input_token_cost`.

---

## 2. Helicone — per-bucket cache pricing + integer cost precision

Tokens from gateway-intercepted usage, stored in ClickHouse columns
(`sum_prompt_tokens`, `prompt_cache_write_tokens`, `prompt_cache_read_tokens`,
`prompt_cache_write_5m`, `prompt_cache_write_1h`, audio). Costs stored as integers × multiplier.

```ts
// since costs in clickhouse are multiplied by the multiplier
// divide to get real cost in USD in dollars
export const COST_PRECISION_MULTIPLIER = 1_000_000_000;
```
(`packages/cost/costCalc.ts:6-8`)

**Additive cache buckets + explicit double-count subtraction:**
```ts
// Add cost for regular prompt tokens (these are the fresh, uncached tokens)
totalCost += promptTokens * cost.prompt_token;
if (cost.prompt_cache_write_token && promptCacheWriteTokens > 0) {
  // For anthropic requests, the prompt cache write tokens are the sum of the 5m and 1h writes
  // so we subtract to not double count
  const effectivePromptCacheWriteTokens =
    promptCacheWriteTokens - (promptCacheWrite5m ?? 0) - (promptCacheWrite1h ?? 0);
  totalCost += effectivePromptCacheWriteTokens * cost.prompt_cache_write_token;
  if (cost.prompt_cache_creation_5m && promptCacheWrite5m > 0) totalCost += promptCacheWrite5m * cost.prompt_cache_creation_5m;
  if (cost.prompt_cache_creation_1h && promptCacheWrite1h > 0) totalCost += promptCacheWrite1h * cost.prompt_cache_creation_1h;
} else if (promptCacheWriteTokens > 0) {
  totalCost += promptCacheWriteTokens * cost.prompt_token;   // fallback to input price
}
```
(`packages/cost/index.ts:97-117`; cache read 119-124, audio 126-131)

Price source: generated per-provider registry (`packages/cost/providers/*`, `buildPricesOpenRouter.py`).
API-cost vs actual: PR #5694 adds `Helicone-Input-Token-Cost` / `Helicone-Output-Token-Cost`
override headers because OpenRouter's underlying provider varies and the registry single rate is wrong.

**Failure modes:** PR #5694 / issue #5172 (registry rate wrong for OpenRouter pass-through →
per-request override headers); PR #5743 (new model Kimi K3 missing from registry → no/zero cost).

---

## 3. OpenMeter — entitlement windows, soft limit, overage preservation

Usage is event-derived (CloudEvents → meters), not API usage objects. The window/allowance model
is the strongest reference for PM.

**Window = ISO interval + anchor (rolling, not just calendar):**
```go
func (u UsagePeriod) GetCurrentPeriodAt(at time.Time) (timeutil.ClosedPeriod, error)   // usageperiod.go:154
func (u UsagePeriod) GetResetTimelineInclusive(inPeriod timeutil.ClosedPeriod) (...)    // usageperiod.go:186
```

**Metered entitlement policy fields:**
```go
IssueAfterReset *IssueAfterReset   // default grant re-issued each window (amount + priority)
IsSoftLimit bool                   // false => block at 0 balance; true => allow anyway
UsagePeriod entitlement.UsagePeriod
CurrentUsagePeriod timeutil.ClosedPeriod
OriginalUsagePeriodAnchor time.Time
PreserveOverageAtReset bool        // carry negative overage into next window
LastReset time.Time
```
(`openmeter/entitlement/metered/entitlement.go:30-49`)

**Balance window:**
```go
type BalanceWindow struct { UsageInPeriod float64; Overage float64 }     // balance.go:29-31
// plus BalanceAtStart, OverageAtStart per segment                        // balance.go:41-43
```

**Failure mode:** PR #1128 / #1127 — a grant expiring at the exact instant a usage-period reset
happens produced wrong balance; fixed by adding a clock package to order expiry vs reset.

---

## 4. Lago (lago-api) — wallets, thresholds, recurring top-ups, alerts

Prepaid wallet credits (plan-included value) are kept separate from pay-in-arrears metered charges.

**Wallet balance fields (multi-currency, ledger-backed):**
```ruby
monetize :balance_cents
monetize :ongoing_balance_cents, :ongoing_usage_balance_cents, with_model_currency: :balance_currency
# balance_cents :bigint default(0)
# credits_balance / credits_ongoing_balance / credits_ongoing_usage_balance :decimal(30,5)
# consumed_credits :decimal(30,5)
```
(`app/models/wallet.rb:39-41,137-146`)

**Threshold model (recurring vs one-shot):**
```ruby
class UsageMonitoring::AlertThreshold < ApplicationRecord
  SOFT_LIMIT = 20
  belongs_to :alert
end
# value :decimal(30,5) not null ; recurring :boolean default(FALSE)
# UNIQUE index on (usage_monitoring_alert_id) WHERE (recurring IS TRUE)
```
(`app/models/usage_monitoring/alert_threshold.rb:4,19-29`)

Alert STI subclasses: `current_usage_amount_alert`, `wallet_credits_balance_alert`,
`wallet_credits_ongoing_balance_alert`, `wallet_balance_amount_alert`,
`billable_metric_lifetime_usage_units_alert`.

**Failure modes:**
- Issue #4954 — wallet *ongoing* balance computed by a **5-minute polling job** → stale balance
  breaks auto top-up & threshold-based billing semantics. (Refresh/staleness.)
- PR #3710 — threshold top-up jobs enqueued repeatedly in a short window caused **duplicate credit
  grants**; fixed by uniquely enqueuing the job keyed on `organization_id`/`wallet_id`/`paid_credits`.
  (Double-count prevention for threshold actions.)
- PR #2007 — allow **negative** `threshold_credits` so top-up fires before balance reaches zero.

---

## 5. Live LLM Token Counter (BedirT) — local tokenizer estimation

No API, no cost. Uses real tokenizers: `tiktoken`, `@anthropic-ai/tokenizer`,
`@huggingface/tokenizers` (`src/extension.js:5-7`). Counts selected text / file, shows a
configurable status-bar template (`{count}/{family}/{provider}/{model}/{label}`), and reconstructs
character offsets for highlight overlays. Source = **estimation via tokenizer library**, fully local.

**Failure mode:** PR #12 — highlight offsets broke on multibyte UTF-8 and on Claude's normalization
of full-width punctuation (e.g. `（）`); fixed via UTF-8 byte-boundary tracking + Claude
normalization offset mapping. Lesson: tokenizer token counts ≠ editor character offsets.

---

## 6. Agent Context (vs-context) — compact context-window surfacing (the popup template)

Source = **local agent session logs** (JSONL), polled by `filePoller`, parsed by
`copilotSessionReader` against `schema/logSchema.v1.json`. It reads `latestPromptTokens` and
`promptTokenDetails[].percentageOfPrompt`, bucketed into system / messages / toolResults / files
(`parser/vscodeSessionAdapter.ts`). `usedTokens = session.latestPromptTokens`
(`vscodeSessionAdapter.ts:71`). No API calls, no pricing.

**Compact status-bar rendering (directly informs PM's context popup):**
```ts
private warningThreshold = 70;
private criticalThreshold = 85;
// hottestAgent mode:
this.item.text = `${icon} CTX ${summary.hottestAgentLabel} ${summary.hottestUsagePercent.toFixed(0)}%`;
// sessionSummary mode:
this.item.text = `${icon} CTX ${summary.totalAgents} agents · ${summary.hottestUsagePercent.toFixed(0)}% peak`;
this.item.tooltip = [
  `Hottest: ${summary.hottestAgentLabel} (${summary.hottestUsagePercent.toFixed(1)}%)`,
  `Agents: ${summary.totalAgents}`,
  `Warning: ${summary.warningAgentCount}, Critical: ${summary.criticalAgentCount}`,
];
// risk icon:
if (usagePercent >= this.criticalThreshold) return '$(error)';
if (usagePercent >= this.warningThreshold) return '$(warning)';
return '$(pulse)';
```
(`src/views/statusBarManager.ts:8-9,47-57,72-74`). Click focuses the agent tree.
Defensive parsing: fixtures/tests for malformed & unsupported-version logs (log-format drift risk).

---

## 7. Copilot Usage Dashboard v2 (feelgood4everai) — run-out forecast

Source = **in-app instrumentation**: `usageTracker.ts` increments session / current-hour / today
request counters as the user makes Copilot requests; limit is the known plan limit. Persisted to
local storage. No pricing (request/quota counts).

**Burn/run-out forecast with confidence + unknown handling:**
```ts
predictLimitExhaustion(): Prediction | null {
  // Calculate current rate
  // Blend rates: 70% current, 30% historical
  const remaining = currentUsage.limit - currentUsage.used;
  hoursToLimit = remaining / projectedRate;
  const confidence = this.calculateConfidence(history);   // more history => higher confidence
  return { ..., hoursToLimit, confidence };
}
// recommended actions:
//   <~1h  -> 'CRITICAL: Consider pausing Copilot usage until limits reset.'
//   <2h   -> 'You may hit the limit soon at current rate. Consider spacing out requests.'
//   <4h   -> 'Moderate usage rate. You have a few hours before limits.'
//   nodata-> 'Start using Copilot to get predictions.'   (explicit unknown state)
```
(`src/rateLimitPredictor.ts:17-199`; history weighting also uses previous-hour ×0.3 and
same-hour-yesterday ×0.2). Forecast quality degrades with sparse data — confidence scaled by history.

---

## 8. GitHub Copilot Usage Tracker (shardiwal) — hybrid API + tokenizer estimation

A chat **participant** forwards each request to a Copilot `vscode.lm` model and records actual
input/output tokens into a local SQLite DB; a wasm tokenizer (`scripts/copy-wasm.js`) assists
estimation; `costCalculator.ts` prices it. Source = **API response token counts + local estimation**.

```ts
// Use the model the user has selected in the Chat UI (VS Code 1.113+).
let model: vscode.LanguageModelChat;
if (request.model) model = request.model;
else { const models = await vscode.lm.selectChatModels({ vendor: "copilot" }); ... model = models[0]; }
// Count input tokens for all messages ... then output tokens from response -> SQLite (date-bucketed)
```
(`src/chat/trackerParticipant.ts:45-89`). Surfaces status bar + date tree + webview dashboard.
Risk: depends on Copilot model availability ("No Copilot language models available") and a
specific VS Code API version — provider/API-version dependency as the main failure mode.

---

## Cross-cutting takeaways for PM

- **(a) Window/threshold/overage:** model four things separately — window (anchor + ISO interval +
  lastReset, rolling), allowance (grant/credit re-issued at reset), policy (soft vs hard limit,
  preserve-overage-at-reset), and alert (recurring vs one-shot threshold, decimal value). OpenMeter
  + Lago together are the reference.
- **(b) API cost vs plan value:** keep them in different ledgers. Lago (wallet credits = included
  value vs metered charges = billed overage) and OpenMeter (entitlement units, no dollars) separate
  cleanly; LiteLLM/Helicone are the dollar-cost side. Provide an override channel (custom pricing /
  per-request cost headers, Helicone PR #5694) for when list price ≠ actual billed cost.
- **(c) Context popup:** one status-bar field `${riskIcon} CTX ${label} ${pct}%`, risk color at
  configurable warning/critical % (vs-context defaults 70/85), rich tooltip, click → detail tree.
  Source can be local agent logs (percentageOfPrompt per category).
- **(d) Stale pricing:** bundled/generated price map refreshed on release; no effective-dated
  time-travel. New/changed models → wrong/zero cost until updated; mitigate with custom-price
  overrides. Treat "price unknown/stale" as an explicit state.
- **(e) Inclusive vs additive cache:** providers disagree (OpenAI inclusive, Anthropic additive).
  Normalize per-provider to one invariant, then subtract overlapping sub-buckets (Helicone 5m/1h) to
  avoid double counting (LiteLLM `cost_calculator.py:400-404,212-215`; Helicone `index.ts:102-108`).
