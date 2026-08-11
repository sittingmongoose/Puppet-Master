# Usage computation recommendations (answers handoff §5.3)

Synthesized from 14 open-source projects (research/usage-ledger-A.json, usage-ledger-B.json; notes A/B) + canonical Plans (plans-usage-synthesis.md). Borrow WHAT they measure and HOW they compute it, not their styling.

## Q1 — Is cache-read part of an inclusive input total or separately additive?
**It is provider/SDK-specific — there is no single answer; the source must declare it.**
- OpenAI-style: `input_tokens` is **inclusive** of cached input → cache-read is a *subset*, NOT additive.
- Anthropic-style (raw API): `input_tokens` **excludes** cache → `cache_read_input_tokens` / `cache_creation_input_tokens` are **additive** buckets.
- opencode (`session.ts:363`): AI SDK v6 normalized inputTokens to *include* cached across all providers, so it **subtracts** `cacheRead + cacheWrite` to recover non-cached input.
- LiteLLM (`cost_calculator.py:400-404,212-215`): normalizes Anthropic(additive) up to OpenAI(inclusive) then subtracts to avoid double-count.
- Helicone (`index.ts:102-108`): subtracts overlapping 5m/1h cache buckets "to not double count".
**Rule for PM:** honor each record's `counting_semantics` (UF-085). When `input_total`/`output_total` is inclusive, cache/reasoning are non-additive subsets; never add them back. (Canonical: plans-usage-synthesis Q1.)

## Q2 — Defensible cross-provider "used tokens" total?
Use the provider's authoritative `provider_total` per record; aggregate only across records keyed by `(provider_id, model_id, account_id?, billing_entity_id?, entitlement_class?)`. **Never** sum `input+output+cache_read` blindly (double-counts inclusive providers). When a meaningful aggregate cannot be produced, render **per-provider values or an explained unknown — never fake precision, never zero** (UF-074 `:5041`). ccusage/codeburn sum additively because they track Anthropic-shaped data; claudecodeui folds cache into input for "context occupied" — PM must pick per `counting_semantics`, not one global formula.

## Q3 — Presenting authoritative vs estimated vs stale vs unavailable?
Every value carries a closed `value_state` + `source_class` + `source_authority` + `projection_freshness` (UF-087/F3-418). External corroboration: cc-statusline shows a risk icon + `CTX label pct%`; vs-context uses 70/85% warn/critical. PM: chip every number; `disabled / not_exposed / hidden_byok / hidden_subscription / unknown` are states, **never zero**.

## Q4 — 5-hour vs weekly windows when providers differ or expose nothing?
Model each window as its OWN record (`window_kind` + `window_label` + scope + own `resets_at`). 5h/weekly/monthly are **labels**, not kinds. Alibaba preserves 5h+weekly+monthly separately; MiniMax = fixed 5h `fixed_reset`; Ollama/local = `session_only` (no durable quota). When a provider exposes no counter (Cursor/Copilot/Gemini/Antigravity/Claude-subscriber), label the evidence class and render `Unknown reset` — **do not synthesize** a weekly reset from a 5h reset (see proposed-plan-updates P2). OpenMeter's `UsagePeriod` (ISO-8601 interval + anchor, `GetResetTimelineInclusive`) is a good window model to borrow.

## Q5 — Burn/run-out methods that survive rolling windows, sparse data, bursts, reset-before-exhaustion?
The most robust empirical method found: **Claude-Code-Usage-Monitor's p90** — `quantiles(hits, n=10)[8]` over blocks that reached ≥95% of a known limit; it infers a hidden quota when the provider exposes nothing. Combine with: fail-closed to `unknown` on <N samples; for `fixed_reset` compare burn-to-reset (reset-before-exhaustion → show reset, not run-out); for `rolling` use a sliding lookback; cap burst influence (median/p90, not mean). **No canonical PM formula exists** → any prototype run-out is a clearly-labeled derived projection (proposed-plan-updates P1).

## Q6 — P90/headroom useful? Label?
Yes as a *secondary, clearly-labeled* signal ("p90 headroom", "based on N samples"). Don't present it as an authoritative remaining quota. CCUM demonstrates it works for hidden quotas.

## Q7 — Keeping API cost / plan-included value / add-on / overage / combined separate?
Single authority `cost_microdollars` (u64); display `cost_usd` only. Borrow Lago's separation: prepaid wallet credits (plan-included value) distinct from pay-in-arrears metered charges (API-billed); OpenMeter entitlement units (no dollars) for plan-included; LiteLLM/Helicone for the dollar side; Helicone PR #5694 override headers for list-price-vs-actual. Add-on vs overage via `entitlement_class`. **Never store a second cost model** (UF-064/UF-087 ban) — derive the three figures from the one authority + `settlement_status`.

## Q8 — Useful table/chart dimensions & per-widget config?
Dimensions that recur across tools: provider, account, model, session/project, tool, window/range, value-state, settlement. Useful configs: date/window range, sort column+dir, grouping, page size, series toggle (input/output/reasoning/cache), chart type, cooldown display, budget threshold presets. (Informs widget Configure options; prototype-only until P4.)

## Q9 — Compact popup vs Usage page vs More Details?
Compact context-ring popup: context used/limit + %, one long context bar, role/category breakdown, avg cache-hit, **Usage remaining with 5h + Weekly windows (remaining/used %, reset/cooldown, aligned bars)**, Compact + More Details actions. Usage page: full multi-provider quota/cache/token/ledger/budget detail. More Details (Context Detail): Curated{Overview,Breakdown,Messages}/Raw with stacked bar + legend and redacted Raw at bottom. (ACD-441, UF-011/012, assistant-chat §12.0.)

## Top failure modes to design against (from issues/PRs)
1. Resumed/forked session double-count (ccusage #1370; CCUM #158) → dedupe on `usage_event_ref`/message-id, keep larger total on replay (ccusage `should_replace_deduped_entry`).
2. Stale/missing pricing → silent $0 (codeburn #638/#629; ccusage #1441/#1473) → surface "unpriced" state, never $0.
3. Rate-limit/quota polling mishandled (codeburn #701; CCUM #202) → honor `retry-after` headers, mark authoritative endpoint, stale→unknown.
4. Cache field recognition gaps (LiteLLM #33983/#34309 OpenAI `cache_write_tokens`) → version the pricing/field map.
5. Balance/reset races (Lago #4954 stale balance; OpenMeter #1128 grant-expiry-at-reset) → treat polling-derived balance as freshness-tagged, fail-closed at boundaries.
