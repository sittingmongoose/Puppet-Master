# Data rebuild notes — `Concepts/usage-concepts/_shared/usage-data.js`

Date: 2026-07-30. Owner: usage-data semantics rebuild (BUILD pass). Scope: edited ONLY
`_shared/usage-data.js` (+ new `verification/data-unit.mjs`). No concept HTML, no Plans/**,
no other `_shared` file touched. All changes are ADDITIVE (new fields) + VALUE/CORRECTNESS
fixes to derived computations. Every field name renderers read is preserved; canonical names
are added alongside as new fields with the old name kept as an alias.

Verification: `node verification/data-unit.mjs` → **PASS, 1003 assertions, 0 failures**.
`node --check _shared/usage-data.js` → parses. Browser globals intact: `window.USAGE`,
`USfmt`, `USvs`, `USconf`, `USrender`, `USdemo`. Smoke: `R.winBar` renders all 19 windows;
frozen U3/U4 inline `byModel.reduce(input+output+cacheRead)` unchanged (156310).

---

## Task 1 — counting_semantics + provider_total
- Added `D.countingSemantics` (per-provider table) + `D.countingSemanticsNote`.
- Added `counting_semantics` + `provider_total` + `provider_total_authority` to every
  `byModel[]`, `sessions[]`, `ledger[]` record.
- Rule (synthesis Q1): `counting_semantics = { cache_in_input, reasoning_in_output }`,
  each `inclusive` (non-additive subset) or `additive` (separate bucket).

| Provider | style | cache_in_input | reasoning_in_output | provider_total rule |
|---|---|---|---|---|
| Claude / Claude Code | anthropic | **additive** | inclusive | in+out+cacheRead+cacheWrite |
| Copilot | openai | **inclusive** | inclusive | in+out |
| Codex · ChatGPT plan / API key | openai | **inclusive** | inclusive | in+out |
| Cursor | openai | **inclusive** | inclusive | in+out |
| OpenCode (passthrough) | openai (AI-SDK v6 normalized) | **inclusive** | inclusive | in+out |
| Gemini Direct / · Workspace | gemini | **additive** | inclusive (thoughts⊆output) | in+out+cacheRead+cacheWrite |
| Antigravity CLI | gemini-routed | **additive** | inclusive | in+out+cacheRead+cacheWrite |

`provider_total_authority` = `authoritative` for measured rows, `derived` for rows tagged
`vs: estimated`.

## Task 2 — source-aware used total (double-count removed)
- `D.usedTokensTotal`: was `Σ(input+output+cacheRead)`; now `Σ(provider_total)` using each
  record's `counting_semantics` (inclusive cache/reasoning never added back). Value changed
  156310 → **160090** (adds cacheWrite for additive providers, drops cacheRead for inclusive).
- `D.bySession[].tokens`: was the 5-bucket sum; now `sourceAwareTotal(s.tokens, semFor(provider))`.
  Each row carries a `tokensBasis` note stating which rule applied.
- Added `D.usedTokensBasis` (rule + "mixes measured+estimated, not a universal counter") and
  `D.usedTokensByProvider[]` (per-provider/model breakdown, keyed). Where a per-record total
  can't be produced (null input/output) it yields `null` (unknown), never 0.

## Task 3 — independent windows (no cross-window reset synthesis)
- `D.quotas[].windows[]` rebuilt from an explicit `WIN_SPEC` table. Each window is its own
  record with: `window_kind` (rolling|fixed_reset|billing_cycle|session_only|unknown), `scope`,
  `used`, `remaining`, its OWN `reset`/`resetsAt`, `cooldown`, `observed_at`, full provenance,
  and forecast state. `kind`/`vs`/`conf`/`resetAt` kept as aliases.
- **Dropped** the line that reused `q.reset/q.resetAt` for `window[1]` (the 7d window). 7d/weekly
  windows now carry independent evidence or `unknown` (e.g. Codex-plan 7d = `unknown` reset;
  Claude/Claude-Code weekly = fixed_reset `Fri 00:00 UTC`, distinct from the 5h `16:56`).
  Copilot month + 7d legitimately share `Aug 01 00:00 UTC` because both ARE the same monthly
  billing boundary (same `window_kind`) — not a synthesized short-window reset.
- **Removed** the fabricated `usedTokens` (`perTok` multiplier). `usedTokens` is now `null` with
  `usedTokensState: unknown` + `usedTokensBasis` (no authoritative per-window token counter
  exposed). Flagged below.
- Added `q.window_kind` (= `q.kind`) on each quota; `kind` alias kept.

## Task 4 — provenance on every value + projection split
- Added the full grammar — `value_state`, `source_class`, `source_confidence`,
  `source_authority`, `settlement_status`, `projection_freshness`, `projection_health`,
  `observed_at` — to: quotas, every window, cache, ledger, sessions, bySession, byModel, tools,
  accounts, addons, contextBudget.families, and the single objects budget/costSplit/ring/
  contextByRole/chart (+ each chart sub-window). Derived from existing `vs/state/rep/conf`.
- Split the conflated top-level `projectionHealth` into `projection_freshness`
  (current|refreshing|stale) × `projection_health` (healthy|degraded|unavailable). Kept
  `projectionHealth` as a string alias (= freshness) for existing readers; `cmd.usage.refresh`
  updates all three. Added `D.projectionMeta = {source, conf, fresh, health}` so `R.projChip`
  (signature unchanged) now has real data to render.

## Task 5 — fail-closed run-out
- Rewrote `runOutH/runOutLabel` derivation. Now a clearly-labeled derived projection
  (`runOutBasis` cites Plans gap U1 / proposal P1) carrying `runOutConf` + `runOutState`.
- Separates `fixed_reset`/`billing_cycle` (compare burn to reset boundary) from `rolling`
  (compare to sliding lookback). Keeps reset-before-exhaustion handling ("resets before
  exhaustion" / "window slides before exhaustion", `runOutH=null`).
- Fail-closed to `unknown` (no countdown, `runOutH=null`) on: unknown/null reset, insufficient
  samples (<7), zero/no burn rate, stale observation, unknown window_kind. **No window ever
  asserts "holds through reset"** and no countdown is fabricated.
- Per-window decisions: claude 5h → est. exhausted ~1.2h (rolling, high); claude-code 5h →
  window slides before exhaustion; copilot month → est. exhausted ~22.5h before cycle reset
  (high); claude/claude-code 7d, codex-plan 5h, gemini 5h → insufficient history (samples <7);
  antigravity/cursor/codex-plan-7d/gemini-7d → unknown reset; hidden/disabled/not_exposed →
  no counter. Countdowns require known reset + resetsAt + ≥7 samples + fresh observation.

## Task 6 — single cost authority
- Introduced `cost_microdollars` (integer) as the single authority: top-level
  `D.cost_microdollars = round(budget.spentMTD·1e6) = 187420000`, plus per-record
  `cost_microdollars` on ledger (`round(cost·1e6)`), byModel/sessions (`= costMicro`),
  ring (`= threadCostMicro`), addons (USD-denominated overage).
- `costSplit` recomputed as a PROJECTION of that authority split by `entitlement_class`,
  keeping field names: `apiMicro=61850000` (api_billed/list) + `planEstMicro=125570000`
  (plan_included/estimated) = `combinedMicro=187420000` === `cost_microdollars` (reconciles;
  `costSplit.reconciles=true`). Added `entitlement_split`, `settlement_status`, `note`. Not a
  second cost model. `combinedMicro` value changed (38.9M → 187.42M) to reconcile with the
  cycle authority / spentMTD.
- `D.addons[]` shape kept; tagged `entitlement_class` (`paid_addon` for Copilot premium
  requests, `paid_overage` for Claude pay-as-you-go) + `settlement_status` + `cost_microdollars`.
- `byModel[]` tagged `entitlement_class` (Gemini Direct/OpenCode = `api_billed`, else
  `plan_included`).

## Task 7 — diversity
Existing diversity preserved (12 quotas across all 5 window kinds; measured/estimated/
unsupported cache; accounts with cooldown; ledger; subagents; tools; hidden_byok/
hidden_subscription/disabled/not_exposed/stale/unknown states). Stale + unknown coverage
strengthened via independent windows (antigravity stale windows, codex-plan/gemini/cursor
unknown 7d windows). No coverage reduced.

---

## Aliases added to preserve readers (canonical name NEW, old name KEPT)
- quota: `window_kind` new / `kind` kept.
- window: `window_kind` new / `kind` kept; `value_state`/`source_confidence` new / `vs`/`conf`
  kept; `resetsAt`/`resetAt` both present; `usedTokens` kept (now null).
- top-level: `projection_freshness` + `projection_health` new / `projectionHealth` kept (alias).
- cost: `cost_microdollars` new / `apiMicro`/`planEstMicro`/`combinedMicro`/`costMicro` kept.

## Flagged: could NOT make source-aware → marked unknown
- **Per-window `usedTokens`**: no provider exposes an authoritative per-window token counter
  in this dataset, so every window's `usedTokens` is `unknown` (null) rather than derived from
  the removed `perTok` multiplier or back-computed from the 5h reset. This is the honest
  source-aware outcome (synthesis Q3/Q8: no fabricated remaining/countdown from probes).
- **Cross-provider `usedTokensTotal`**: produced (no double-count) but explicitly labelled a
  non-authoritative aggregate that mixes measured + estimated rows; per-provider values exposed
  in `usedTokensByProvider` for source-qualified rendering.
- Windows for providers with no authoritative counter (Cursor, Copilot 7d-as-cycle, Codex-plan
  7d, Gemini 7d, OpenCode, Antigravity) carry `unknown`/`derived` reset, never a copied one.
