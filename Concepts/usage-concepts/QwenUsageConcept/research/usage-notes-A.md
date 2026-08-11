# Usage-Tracker Research Notes — Batch A (coding-agent / LLM usage trackers & CLI dashboards)

Researcher: fresh open-source investigation. Access date: **2026-07-30**.
Clones were made to a temp dir and removed after; no third-party code committed.
All SHAs verified locally via `git log -1`.

Projects (6): ccusage, Claude-Code-Usage-Monitor, cc-statusline, opencode, claudecodeui, codeburn.
Issue/PR artifacts collected: 18 (>= 8 required).

---

## Cross-cutting answers (evidence-backed)

### (a) Is cache-read part of an inclusive input total, or separately additive?
It depends on the **starting representation of `input_tokens`**, and projects reconcile it in opposite directions:

- **Anthropic raw `input_tokens` EXCLUDES cached tokens.** Tools that parse the raw Claude JSONL therefore either (1) keep cache as a *separate additive* bucket on top of raw input, or (2) *fold cache back into input* to approximate "context occupied".
- **ccusage / opencode-core / codeburn** keep cache **separate & additive**:
  - ccusage `TokenCounts::total()` = `input + output + cache_creation + cache_read + extra`.
  - codeburn `usage-aggregator.ts:46` `tokens = input + output + cacheRead + cacheCreation`.
- **claudecodeui folds cache INTO input** (because raw input excludes it):
  - `inputTokens = directInputTokens + cacheReadTokens + cacheCreationTokens` (line 158); `used = inputTokens + outputTokens`.
- **opencode (the agent)** documents the provider/SDK-version quirk explicitly and *subtracts* cache because AI SDK v6 made input *inclusive*:
  > `// AI SDK v6 normalized inputTokens to include cached tokens across all providers (including Anthropic/Bedrock which previously excluded them). Always subtract cache tokens to get the non-cached input count for separate cost calculation.`
  > `const adjustedInputTokens = safe(inputTokens - cacheReadInputTokens - cacheWriteInputTokens)` (session.ts:363-366)
- **cc-statusline** sidesteps it entirely by consuming Claude Code's already-inclusive `context_window.total_input_tokens`.

**Per provider:** for Anthropic, cache-read is *not* inside raw input; for OpenAI Responses/Chat, cached tokens are reported as a detail of prompt/input tokens and OpenAI now also bills cache *writes* (`cache_write_tokens`, 1.25x input for GPT-5.6 — ccusage #1422). So "is cache inside input" is provider- and SDK-version-specific.

### (b) Defensible cross-provider "used tokens" total
Two defensible definitions appear in the wild; pick one and label it:
1. **Billable-weighted total** (ccusage/opencode/codeburn): `input + output + cache_write + cache_read` with each bucket priced at its own rate. This is what maps to cost. Keep cache buckets *visible*, not collapsed.
2. **Context-occupancy total** (claudecodeui, cc-statusline): non-cached input + cache_read + cache_write + output ≈ tokens that filled the context window. Used for "% of context used", not cost.

The hazard: calling either one simply "tokens" with no label. opencode keeps `total` (provider `totalTokens`) AND the adjusted buckets separately — the safest pattern.

### (c) Authoritative vs estimated vs stale vs unavailable
- **Authoritative provider value preferred when present:** ccusage `CostMode::Auto` uses JSONL `costUSD` else recomputes; opencode uses Copilot `totalNanoAiu` (provider billing units) ahead of token*price (session.ts:389-393).
- **Estimated:** pricing-table recompute (ccusage `CostMode::Calculate`, codeburn `calculateCost`); codeburn flags synthesized figures with `costIsEstimated` and rolls them into `estimatedCostUSD` that "never changes totals" (types.ts:137-141).
- **Stale pricing -> silent $0:** codeburn #638 (warning off by default), #629 (27 models unpriced); ccusage #1441/#1473 (sonnet-5/kimi-k3 at $0 until snapshot updates).
- **Unavailable -> explicit:** claudecodeui returns `{unsupported:true, message}` when a schema lacks token columns; opencode #39595 shows the *bad* version (context % silently 0% when `model.limit.context` undefined).
- **Subscription vs API:** ccusage #1503 — subscription shown as $0.00 hides billed usage-credits; asks to label the token number "API-equivalent estimate" and paid cost "unknown / provider ledger required".

### (d) 5-hour vs weekly windows when providers differ/expose nothing
- **5h rolling blocks** are the common Claude unit: ccusage `blocks` (anchored rolling windows), Claude-Code-Usage-Monitor `SessionBlock`, cc-statusline delegates to `ccusage blocks --json`.
- **Weekly is hard and often missing:** CCUM #234 — weekly slot "OFFICIAL ... deferred" in code comment; #167/#129反复 request it. The authoritative source for both is the undocumented **`GET https://api.anthropic.com/api/oauth/usage`** (CCUM #202, codeburn #701) which returns server-side utilization %, reset time, and weekly limits — the same data behind Claude Code `/usage`.
- When providers expose nothing, CCUM **infers** the quota (see e).

### (e) Burn / run-out methods that survive rolling windows, sparse data, bursts, reset-before-exhaustion
- **Naive linear** (CCUM `project_block_usage`): `rate = total/duration`, extrapolate to block `end_time`. Breaks on bursts and reset-before-exhaustion.
- **Trailing-window rate** (CCUM `calculate_hourly_burn_rate`, cc-statusline tpm): last-hour tokens / 60; more burst-tolerant but still window-edge sensitive.
- **Empirical percentile (most robust):** CCUM `p90_calculator` — collect completed blocks that reached ≥95% of a *known common limit*, take the **90th percentile** (`quantiles(hits, n=10)[8]`) as the inferred real limit; fall back to all completed blocks, then a default. This *learns* the hidden quota from observed exhaustion and survives the provider exposing nothing.
- **Reset-anchored projection** (codeburn #726): "lasts-to-reset / runs-out-in" deficit against the window reset — the right frame for rolling windows where you reset before exhausting.
- **Authoritative server value** (CCUM #202 / codeburn #701): poll the OAuth usage API for true remaining/reset rather than forecasting at all — but you must honor `Retry-After`/backoff (codeburn #701 got sustained 429s by ignoring it).

---

## 1. ccusage — `ryoppippi/ccusage` (MIT) @ `8e08eaa7`
Rust workspace, per-CLI adapters (Claude, Codex, Copilot, Gemini, OpenCode, Cursor, Kimi, Grok, Amp, Goose...). Source = local transcript logs.

**Inclusive total (cache additive)** — `rust/crates/ccusage-core/src/types.rs`:
```rust
pub fn total(&self) -> u64 {
    self.input_tokens + self.output_tokens
        + self.cache_creation_tokens + self.cache_read_tokens
        + self.extra_total_tokens
}
```
**Cost = per-bucket rates; cache_create 1h priced at 2x; tiered over-200k** — `cost.rs`:
```rust
const CACHE_CREATE_1H_INPUT_MULTIPLIER: f64 = 2.0;
// CostMode: Display = provider costUSD; Auto = costUSD else recompute; Calculate = always recompute
// calculate_cost_from_pricing sums: input, output, cache_create_5m, cache_create_1h(=input*2), cache_read
//   each via tiered_cost(tokens, base, above_200k, threshold)
```
**Double-count prevention** — `rust/adapters/claude/src/lib.rs`:
```rust
let exact_hash = usage_dedupe_hash(message_id, request_id);   // key = (msg id, request id)
// fallback: usage_dedupe_hash(message_id, None) for sidechain replays
fn should_replace_deduped_entry(candidate, existing) -> bool {
    // prefer sidechain; then keep the LARGER token total (corrects partial/replayed streams)
    let candidate_total = usage_token_total(candidate);
    let existing_total  = usage_token_total(existing);
    if candidate_total != existing_total { return candidate_total > existing_total; }
    ...
}
```
Subagents = `is_sidechain` flag. Reset = `usage_limit_reset_time` from the entry. Pricing = embedded LiteLLM/models.dev snapshots (auto-updated commits). Local-only; no prompts surfaced.
**Issues:** #1503 (subscription $0 hides billed credits), #1422 (Codex cache-write unparsed; GPT-5.6 under-billed), #1370/#1349 (forked-session replay double-count), #1363 (Fast-mode ~2x totals), #1483 (invalid dates silently wrong).

## 2. Claude-Code-Usage-Monitor — `Maciek-roboblog/Claude-Code-Usage-Monitor` (MIT) @ `c59a83bf`
Python TUI. 5h SessionBlocks; burn rate; run-out projection; hardcoded plan quotas; **p90 inferred limit**.

**Inclusive total (cache additive)** — `core/models.py`:
```python
def total_tokens(self) -> int:
    return (self.input_tokens + self.output_tokens
            + self.cache_creation_tokens + self.cache_read_tokens)
```
**Hardcoded plan quotas (NOT from provider)** — `core/plans.py`:
```python
PLAN_LIMITS = {
  PlanType.PRO:   {"token_limit": 19_000,  "cost_limit": 18.0,  "message_limit": 250},
  PlanType.MAX5:  {"token_limit": 88_000,  "cost_limit": 35.0,  "message_limit": 1_000},
  PlanType.MAX20: {"token_limit": 220_000, "cost_limit": 140.0, "message_limit": 2_000},
}  # Team: "unverified estimates; prefer the official statusline source"
LIMIT_DETECTION_THRESHOLD = 0.95
```
**Empirical p90 limit (survives provider exposing nothing)** — `core/p90_calculator.py`:
```python
def _calculate_p90_from_blocks(blocks, cfg):
    hits = [b["totalTokens"] for b in blocks
            if not b.get("isGap") and not b.get("isActive")
            and _did_hit_limit(b["totalTokens"], cfg.common_limits, cfg.limit_threshold)]  # >=95% of a known limit
    if not hits:
        hits = [b["totalTokens"] for b in blocks if not b.get("isGap") and not b.get("isActive")]
    if not hits: return cfg.default_min_limit
    return max(int(quantiles(hits, n=10)[8]), cfg.default_min_limit)   # 90th percentile
```
**Linear burn/projection** — `core/calculations.py`: `tokens_per_minute = total/duration`; `projected_total = current + rate*remaining_minutes`.
**Issues:** #202 (authoritative `api.anthropic.com/api/oauth/usage` endpoint), #158 (resumed session inflates current block — no msg-id dedup), #234 (weekly window still deferred), #159/#95 (reset-time mismatch / `--reset-hour` ignored).

## 3. cc-statusline — `chongdashu/cc-statusline` (MIT) @ `6fe55d96`
Generates a bash statusline. **Consumes Claude Code's native authoritative JSON; does not parse logs.**

`src/features/usage.ts` (generated bash):
```bash
cost_usd=$(echo "$input" | jq -r '.cost.total_cost_usd // empty')
total_duration_ms=$(echo "$input" | jq -r '.cost.total_duration_ms // empty')
cost_per_hour=$(echo "$cost_usd $total_duration_ms" | awk '{printf "%.2f", $1 * 3600000 / $2}')
input_tokens=$(echo "$input"  | jq -r '.context_window.total_input_tokens // 0')
output_tokens=$(echo "$input" | jq -r '.context_window.total_output_tokens // 0')
tot_tokens=$(( input_tokens + output_tokens ))   # already-inclusive CLI value; no separate cache add
tpm=$(echo "$tot_tokens $total_duration_ms" | awk '{printf "%.0f", $1 * 60000 / $2}')
# 5h reset delegated to:  ccusage blocks --json  -> .blocks[]|select(.isActive)|.usageLimitResetTime
```
**Issues:** #34 (v1.4.0 codegen dropped the whole extraction block), #9 (printf quoting mangled cost), #14 (ccusage subprocess fork-bomb), #22/#18 (hard ccusage/jq deps).

## 4. opencode — `sst/opencode` (MIT) @ `8c38d260` (branch `dev`, v1.18.10)
The agent itself; records its own per-step usage from the AI SDK response into SQLite.

**Normalization + per-bucket cost** — `packages/opencode/src/session/session.ts:338`:
```ts
const cacheReadInputTokens  = safe(input.usage.cacheReadInputTokens ?? 0)
const cacheWriteInputTokens = safe(input.usage.cacheWriteInputTokens
    ?? input.metadata?.["anthropic"]?.["cacheCreationInputTokens"]
    ?? input.metadata?.["vertex"]?.["cacheCreationInputTokens"]
    ?? input.metadata?.["bedrock"]?.["usage"]?.["cacheWriteInputTokens"] ?? 0)
// AI SDK v6 normalized inputTokens to INCLUDE cached tokens across all providers ...
const adjustedInputTokens = safe(inputTokens - cacheReadInputTokens - cacheWriteInputTokens)
const tokens = { total, input: adjustedInputTokens, output: safe(outputTokens - reasoningTokens),
                 reasoning: reasoningTokens, cache: { write: cacheWriteInputTokens, read: cacheReadInputTokens } }
// cost: prefer Copilot authoritative billing units:
const totalNanoAiu = input.metadata?.["copilot"]?.["totalNanoAiu"]
cost = (typeof totalNanoAiu === "number") ? totalNanoAiu/1e11
     : input*rate + output*rate + cache.read*rate + cache.write*rate + reasoning*output_rate   // per 1M, Decimal
```
Schema — `session/message.ts:132`: `tokens: { input, output, reasoning, cache: { read, write } }`, plus `cost`. Context tier selection uses inclusive `inputTokens` (over-200k).
**Issues:** #39595 (context % stuck at 0 when `model.limit.context` undefined), #39606 (oa-compat cost chunk omits OpenAI fields), #39658 (1M context not honored).

## 5. claudecodeui — `siteboon/claudecodeui` (GPL-3.0) @ `264e0946` (v1.37.0)
Web/Electron UI. Samples the **latest/cumulative** usage per provider (Claude JSONL, Codex `token_count`, OpenCode SQLite) for a context-usage bar.

**Cache FOLDED INTO input (inverse of opencode-core)** — `server/modules/providers/services/provider-token-usage.service.ts`:
```ts
const directInputTokens = readUsageNumber(usage.input_tokens ?? usage.inputTokens);
cacheReadTokens      = readUsageNumber(usage.cache_read_input_tokens ?? ...);
cacheCreationTokens  = readUsageNumber(usage.cache_creation_input_tokens ?? ...);
inputTokens = directInputTokens + cacheReadTokens + cacheCreationTokens;   // inclusive input
outputTokens = readUsageNumber(usage.output_tokens ?? usage.outputTokens);
...
return { used: inputTokens + outputTokens, total: contextWindow, ... };   // contextWindow default 160k/200k
```
OpenCode path reads SQLite `tokens_*` columns and again does `inputTokens = tokens_input + cache_read` (line 224); returns `{unsupported:true, message}` if the schema lacks the columns. Malformed JSONL lines are skipped without losing earlier usage (line 162). Codex uses cumulative `total_token_usage` + `model_context_window`.
**Issues:** #1043 (stale hardcoded model list; dynamic fetch disabled), #1003 (no per-model remaining-quota display), #1004 (orphaned resumed sessions burn tokens).

## 6. codeburn — `getagentseal/codeburn` (MIT) @ `146037bf`
~40-provider plugin architecture; CLI + menubar + desktop + web + MCP. Local-first, "never reads prompts".

**Unified schema (reasoning + cache + cached separated)** — `src/types.ts`:
```ts
export type TokenUsage = {
  inputTokens: number; outputTokens: number;
  cacheCreationInputTokens: number; cacheReadInputTokens: number;
  cachedInputTokens: number; reasoningTokens: number;
}
// ParsedApiCall.costIsEstimated: true when tokens/cost are synthesized (Warp/Kiro/Cursor derive
//   tokens from content length). Aggregates roll it up as estimatedCostUSD:
//   "display/metadata only and never changes totals." (types.ts:137-141)
// advisor_message entries carry the advisor model's own tokens and are NOT included in top-level
//   totals; 'message' records mirror the main model and are already covered. (types.ts:39-41)
```
**Inclusive total (cache additive)** — `src/usage-aggregator.ts:46`:
```ts
modelTotals[model].tokens += d.tokens.inputTokens + d.tokens.outputTokens
                          + d.tokens.cacheReadInputTokens + d.tokens.cacheCreationInputTokens
modelTotals[model].estimatedCostUSD += d.estimatedCostUSD ?? 0   // tracked separately
```
session-message.ts folds reasoning into the headline total: `[tokens.input, tokens.output + tokens.reasoning, ..., tokens.cacheRead]` (line 135-138). Day aggregates cached; period filtering must be applied per bucket.
**Issues:** #701 (OAuth `/api/oauth/usage` 429 loop — ignored Retry-After, 30s retries), #639 (costIsEstimated dropped at parser boundary), #638 (unpriced models silently $0, warning off), #629 (27 models/599.6M tokens unpriced via suffix variants), #583 (cache cards summed all history not the period), #769 (OpenCode SQLite selects model_id but column is model), #726/#725 (run-out projection / quota-intelligence epic).

---

## Three concrete failure modes (from issues, with SHAs/refs)
1. **Resumed/forked session double-counting.** ccusage #1370 (Codex fork replays parent `token_count` events under rewritten timestamps -> counted again) and CCUM #158 (`/resume` of a heavy session credits all prior usage to the current 5h block). Mitigation that works: message-id/request-id dedup keeping the larger total (ccusage `push_deduped_entry`); CCUM lacks this.
2. **Stale/missing pricing silently zeroes cost.** codeburn #638 (`calculateCost` returns 0 for unpriced models; warning behind `CODEBURN_VERBOSE=1`) and #629 (suffix variants like `:thinking`/`-TEE` unresolved -> 27 models at $0); ccusage #1441/#1473 (sonnet-5/kimi-k3 at $0 until the LiteLLM snapshot updates). Looks identical to a genuinely free model.
3. **Authoritative-endpoint rate-limit mishandling.** codeburn #701: Claude quota polling parsed `retry_after` from the JSON body only and retried at a fixed 30s, causing sustained 429s on `GET /api/oauth/usage` — the very endpoint that provides authoritative window/reset state (CCUM #202). Lesson: honor `Retry-After` header + exponential backoff when polling provider quota.

(Honorable mentions: opencode #39595 context % stuck at 0 when the catalog lacks `model.limit.context`; codeburn #583 cache cards summing all history instead of the selected period; cc-statusline #34 codegen regression dropping the extraction block.)
