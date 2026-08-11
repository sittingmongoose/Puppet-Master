# Plans Usage Semantics — Canonical Synthesis (token / quota / cost / projection)

Scope: READ-ONLY research for the `Concepts/usage-concepts/` prototypes. All claims re-verified
against the CURRENT corpus on 2026-07-30. Citations are `file:line` (heading/PlanUnit noted).
Owner hierarchy: `Plans/usage-feature.md` (UF-*) owns usage semantics; `Plans/Contracts_V0.md`
owns the persisted envelope/attribution/cost-type contracts; `Plans/FinalGUISpec.md` (F3-418)
owns the GUI value-state rendering; `Plans/Multi-Account.md` owns account/pressure/cooldown;
`Plans/assistant-chat-design.md` (ACD-434) consumes UsageRecord projections in chat.
`Concepts/usage-concepts/BUILD_PLAN.md` is a **build plan** (derived, not canonical).

The single load-bearing fact: **UF-085 (`usage-feature.md:5611-5719`) is the implementation-ready
UsageRecord accounting contract; UF-087 (`:5421-5511`) + F3-418 (`FinalGUISpec.md:27739-27816`)
require the full provenance grammar on EVERY visible value; everything else aliases into these.**

---

## Q1 — Canonical token buckets and inclusive/exclusive/non-additive rules

Canonical UsageRecord token buckets (UF-085 `usage-feature.md:5619`; mirrored in Contracts
"Token bucket contract" `Contracts_V0.md:2210-2225` / shard `contracts_v0/015:32-49`):

`input_total`, `input_non_cached`, `cache_read`, `cache_write`, `cache_write_1h`,
`cache_write_ttl?`, `output_total`, `output_visible`, `reasoning`/`thoughts`, `provider_total`,
`context_estimate`. Buckets are first-class and **present even when unknown** (`:5619`).

Additivity is governed by **`counting_semantics`**, stated per provider mapper (UF-085 `:5619`,
UF-086 `:5729`): whether **cache is a subset of input** and whether **reasoning/thoughts are a
subset of output**.

- **INCLUSIVE totals → non-additive subsets.** When a provider says `input_total` is inclusive,
  `cache_read`/`cache_write`/`cache_write_1h` are SUBSETS and must NOT be added back; when
  `output_total` is inclusive, `reasoning/thoughts` is a subset and must NOT be added back
  (UF-085 negative constraints `:5707-5708`; UF-087 `:5503`; fixture GUI-USG-007 `:5533`).
- **`provider_total`** is the provider's own total; each parser fixture states whether it is
  **authoritative or derived** (UF-086 `:5729,5737`).
- **`input_non_cached`** is the exclusive non-cached input portion (input minus cache).
- **`context_estimate`** is **local-only** and must NOT become billing, cost, quota, or provider
  authority (UF-085 `:5709`; UF-086 `:5729`).
- **Does cache-read inclusion vary by provider? YES — that is exactly what `counting_semantics`
  captures.** OpenAI: cache-inclusive `prompt_tokens` (UF-086 `:5740`); Anthropic: separate
  `cache_read`/`cache_write`/`cache_write_1h` or TTL-specific (`:5736`); Gemini:
  `cachedContentTokenCount` + `thoughtsTokenCount`, candidates output visible-only, inclusive
  output = candidates+thoughts only when both proven (`:5737`); Bedrock: cache-aware input +
  provider/header authority (`:5738`); OpenRouter cache-write maps into canonical cache buckets
  (`Contracts_V0.md:2284-2289` / shard `015:103-112`).

Cache reporting also carries `cache_reporting_state` and `cache_miss_reason` (UF-080 `:5822`);
cache observability views expose **measured vs estimated vs unsupported** (UF-081 `:5887`).

## Q2 — "used tokens" definition and cross-provider total rule

- There is no single field literally named "used tokens." The canonical per-record quantities are
  the UF-085 buckets; **`provider_total` is the provider's authoritative total** (or derived, per
  mapper — UF-086 `:5729`).
- **`total_tokens`** MAY be imported/exported/stored/derived for convenience, but **MUST NOT
  replace the individual buckets and MUST NOT be computed by double-counting provider-inclusive
  cache or reasoning fields** (`Contracts_V0.md:2231-2233` / shard `015:53`).
- **Cross-provider totals:** attribution is keyed by the canonical tuple
  `(provider_id, model_id, account_id?, billing_entity_id?, entitlement_class?)`
  (`Contracts_V0.md:2245,2291`; UF-085). Family-level summaries may aggregate **only after
  preserving requested/effective disclosures** (`usage-feature.md:314`). PM must not collapse the
  tuple to `billing_entity_id` alone (`Contracts_V0.md:2259`).
- **When a meaningful aggregate cannot be produced:** render per-provider/source-qualified rows;
  missing/unavailable is shown as **unknown/not_exposed/disabled, never zero** (UF-074 `:5041`,
  UF-085 `:5710`, UF-087 `:5502`, F3-418 `:27751`). Do not fake a universal counter (Cursor
  `:209`; Copilot `:260`).

## Q3 — Quota window kinds, reset/cooldown, add-ons/overage, entitlement/policy states

- **Canonical `window_kind` enum (5 values):** `rolling | fixed_reset | billing_cycle |
  session_only | unknown` (`usage-feature.md:597`; UF-041 `:3080,3111-3116`; UF-085 short forms
  `rolling/fixed/billing/session/unknown` `:5619`). Semantics (`:602-606`):
  - `rolling` = remaining changes against a **sliding lookback interval**.
  - `fixed_reset` = provider reports a **fixed reset boundary/countdown**.
  - `billing_cycle` = pressure tied to the **plan/billing period**, not a short cooldown.
  - `session_only` = authoritative local session/tool stats, **no durable provider quota window**.
  - `unknown` = may show inferred/estimated only if it **labels the evidence source and avoids
    pretending to know reset semantics**.
  - **`window_scope`** closed to `provider | account | account+model | org | server_profile` (`:599`).
  - **IMPORTANT:** "5-hour" and "weekly" are **`window_label`/duration values, NOT `window_kind`
    values.** Claude Code's status line exposes separate `five_hour.used_percentage`,
    `five_hour.resets_at`, `seven_day.used_percentage`, `seven_day.resets_at` (MA-063
    `Multi-Account.md:915`). Alibaba Coding Plan has fixed reset windows at **5-hour, weekly, AND
    monthly** boundaries that must be **preserved separately, not flattened** (`usage-feature.md:358`).
- **Reset/cooldown semantics:** authoritative provider reset/cooldown **outranks local counters**;
  known reset/cooldown **tick live**; unknown renders `Unknown reset`/`Unknown cooldown end`,
  **never a fabricated countdown** (`usage-feature.md:352`). `cooldown_until` sets
  `hard_block=true` until revalidation (MA-022 `Multi-Account.md:2198`). Post-reset:
  `reset_at`/`cooldown_until` passing → `eligible_pending_recheck` → `validating` → `nominal`
  (`Contracts_V0.md:1687`). Provider-reported cooldown windows remain facts; user overlays
  (Temporary Pause/Resume Now/Mark Needs Recheck) **must not overwrite** provider metadata
  (`Contracts_V0.md:1686`).
- **Entitlement / policy / pressure states:**
  - `UsagePressureState = nominal | approaching_threshold | threshold_reached | exhausted |
    unknown` (`Contracts_V0.md:1673,1685`). `unhealthy` is health/readiness, **not** pressure
    (`:1685`). Threshold/exhaustion records `resolution_outcome` (`honored|unknown|...`) (`:1688`).
  - `entitlement_class` is part of the attribution tuple (`Contracts_V0.md:2235,2245`).
  - Copilot blocked reasons are distinct: `billing_entity_required`, `included_premium_exhausted`,
    `paid_overage_disallowed`, `copilot_entitlement_missing`, `copilot_org_policy_blocked`
    (`usage-feature.md:255`); **must not be flattened into a generic cooldown** (`:254`).
  - Plan/region/balance/resource/overload/entitlement gates surface as **states, not purchase
    blockers** (UF-075 `:5084,5090`).
- **Add-ons / overage:** canonical Plans treat **overage as policy/entitlement states**
  (`paid_overage_disallowed`, paid-overage policy — `usage-feature.md:254-255`; UF-077
  "paid-overage, metered, credit-consuming, API-billed" `:5226`) and require **plan-backed vs
  API-billed buckets to stay separate** (Codex `:233`; MA-023 `Multi-Account.md:2291`). The
  explicit "**purchased extra usage = its own add-on/overage bucket (own used + reset)**" is a
  **build-plan decision** (`Concepts/usage-concepts/BUILD_PLAN.md:23`), not canonical Plans vocabulary.
- **Rule forbidding synthesizing a weekly reset from a 5-hour reset:** **there is NO literal
  sentence.** It is implied by: preserve Alibaba 5h/weekly/monthly separately, not flattened
  (`usage-feature.md:358`); avoid one generic 5h/7d column (UF-041 `:3120`); no fabricated
  countdowns / remaining quota from probes (UF-085 `:5711`, UF-087 `:5441`); and 5h vs 7d being
  separate fields with separate `resets_at` (MA-063 `:915`). → recorded as a GAP.

## Q4 — Burn rate and run-out (forecast exhaustion)

- **There is NO canonical definition of "burn rate" or "run-out / forecast exhaustion" anywhere in
  `Plans/**`.** The only occurrences are: the **build plan** (`Concepts/usage-concepts/BUILD_PLAN.md:79`
  "burn/run-out"; `:130` Claude-Code-Usage-Monitor "burn, P90/custom limit, run-out" as
  computation-only demo realism), the **`spend_rate_exceeded` anomaly guard class** (UF-083
  `:6016`), and the **high-cost action "cost forecast and warning semantics"** (UF-065 `:4362`;
  `usage-feature.md:897`) — which is **pre-execution action disclosure, not quota run-out**.
- The only canonical numeric rate formula is the **anomaly detector**:
  `current_window_cost / max(median_previous_7_windows_cost, 1)` over a default 1-hour window;
  spike threshold `3.0`; confidence `min(1.0, observed_samples / 7.0)` (`usage-feature.md:5811`).
- **Fixed vs rolling (the only canonical hook for a forecast):** `fixed_reset` carries a reset
  boundary/countdown; `rolling` carries a sliding lookback (`:602-603`). A run-out forecast would
  compare burn against the reset (fixed) or the lookback (rolling), but **Plans supplies no
  formula**.
- **Insufficient-history / zero-burn / reset-before-exhaustion / stale** are governed indirectly:
  no fabricated countdowns (UF-085 `:5711`, UF-087 `:5441`); missing → unknown not zero (UF-074
  `:5041`); stale data shows `Last updated` + Refresh (Problem 6 `:625-633`); projection_freshness
  `current|refreshing|stale` × projection_health `healthy|degraded|unavailable` (`FinalGUISpec.md:2495`);
  anomaly confidence scales with `observed_samples/7` (`:5811`). → recorded as the **top GAP**: a
  prototype burn/run-out must be a clearly-labeled derived GUI projection over the canonical window
  model, fail-closed to unknown when history is insufficient, and never a fabricated countdown.

## Q5 — Projection provenance fields: are they actually specified, and on every value?

**YES — specified, and required on EVERY visible value (not selectively).**

- **UF-087 (`usage-feature.md:5429`):** "Every visible token, context, cost, quota, credit, cache,
  reasoning, provider-total, or context-estimate value carries `value_state`, `source_class`,
  `source_confidence`, `source_authority`, `settlement_status`, `projection_freshness`,
  `projection_health`, `observed_at_utc` or `last_updated`, and `reason` when degraded, estimated,
  unknown, disabled, not_exposed, hidden_byok, or hidden_subscription."
- **F3-418 (`FinalGUISpec.md:27751`)** repeats the same per-cell matrix for every GUI surface.
- **UF-085 (`:5619`)** defines them at record level ("Every record carries…").
- **Enums:**
  - `source_class = provider_reported | provider_header | cli_reported | local_estimated |
    pricing_estimated | unknown` (UF-085 `:5619`; `usage-feature.md:521`).
  - `source_confidence = high | medium | low | unknown` (UF-074 `:5041`).
  - `settlement_status = observed | streaming_partial | settled | adjusted | failed | unknown`
    (UF-085 `:5619`).
  - `projection_freshness = current | refreshing | stale`; `projection_health = healthy | degraded |
    unavailable` (`FinalGUISpec.md:2495`; `:1167`). `trust_tier` is reserved for preview/browser,
    NOT runtime trust (`:28`).
  - `source_authority` is carried alongside (no closed enum spelled out in usage docs; see GAP).
- CV-316 carries these as correlation/projection fields on route payloads (`Contracts_V0.md:20311-20372`).

## Q6 — Cost model

- **Single canonical authority:** `cost_microdollars` (integer `u64`) and/or provider minor units +
  `currency` (`Contracts_V0.md:2192-2196` / shard `015:14-19`; UF-085 `:5619`). **All persisted
  cost is integer microdollars; presentation converts, storage/accumulation does not.**
- **`cost_usd` is presentation-only** = `cost_microdollars / 1_000_000`, derived only at
  display/export/migration edges (`usage-feature.md:523-524`). Display precision tiers:
  `<$0.01 = 6dp`, `<$1 = 4dp`, else `2dp` (`:523`; `Contracts_V0.md:2260` / shard `015:86`).
- **Estimated vs settled:** `cost_status` + `settlement_status` (`observed|streaming_partial|
  settled|adjusted|failed|unknown`); pricing provenance via `pricing_snapshot_id`, `pricing_source`,
  `pricing_effective_at`, `pricing_version`, per-bucket costs; **unknown-cost fail-closed**
  (UF-085 `:5619`). Unknown cost renders `cost_status unknown` with null cost, **not `$0.00`**
  (GUI-USG-003 `:5529`). `estimated_cost_microdollars` / `final_cost_microdollars` are **aliases
  only** (UF-087 `:5429`). Cost accumulation is monotonic/non-decreasing/non-negative; a negative
  display is always an explicit adjustment record, never a mutation of prior usage
  (`Contracts_V0.md:2259-2260` / shard `015:85-86`).
- **Price overrides:** custom-provider price rows for `input/output/cacheRead/cacheWrite/cacheWrite1h`
  + context window/max tokens/reasoning flags/cache-control format (UF-086 `:5742`;
  `usage-feature.md:520`).
- **BYOK / subscription:** preserve accounting refs while **suppressing misleading per-token cost**
  → `hidden_byok` / `hidden_subscription` states (UF-085 `:5619`; UF-087 `:5439`; GUI-USG-004 `:5530`).
- **"API-billed / plan-included / combined" three projections:** this is a **build-plan GUI
  projection over the SINGLE cost authority (UF-087), explicitly NOT a second cost model**
  (`Concepts/usage-concepts/BUILD_PLAN.md:20-22`). Canonical Plans have **one** cost authority; the
  three-way split is presentation. API-key-backed Codex = "API-billed" bucket vs ChatGPT plan
  bucket (`usage-feature.md:235-238`).
- **Add-on vs overage separation:** see Q3 — overage is a policy state; add-on-as-bucket is
  build-plan. Plan-backed vs API-billed must not merge (`:233`, MA-023 `:2291`).

## Q7 — No-double-count rules; missing/unknown vs zero

- **No double count:** `total_tokens` must not double-count provider-inclusive cache/reasoning
  (`Contracts_V0.md:2231-2233`); do not add cache buckets to inclusive `input_total` or
  reasoning/thoughts to inclusive `output_total` (UF-085 `:5707-5708`; UF-087 `:5503`);
  GUI-USG-007 proves inclusive/exclusive no-double-count (`:5533`); per-parser semantics in UF-086.
  **Dedup:** rollups count each idempotent settled / accepted-partial `usage_event_ref` **once**
  (UF-085 `:5627`; UF-087 `:5438`; GUI-USG-008 `:5534`).
- **Missing/unknown vs zero:** missing or unavailable provider usage is **NOT** displayed as zero
  (UF-074 acceptance `:5047`, negative `:5069`); value_state distinguishes
  `missing, unavailable, unsupported, blocked, stale, estimated, provider-reported, zero`
  (UF-074 `:5041`). GUI-USG-001 (missing) vs GUI-USG-002 (provider-reported zero) vs GUI-USG-006
  (cache zero vs unsupported) vs GUI-USG-005 (disabled quota — no zero remaining) (`:5527-5532`).
  F3-418: cache zero is a real zero **only with source_class/source_confidence evidence**
  (`FinalGUISpec.md:27759`). Disabled/missing quota renders `disabled`/`not_exposed`, never zero
  remaining or fabricated progress (UF-085 `:5710`; CLI_Bridged `:1441`).

## Q8 — Providers that do NOT expose authoritative remaining quota — required presentation

- **Cursor:** must **not invent a fake universal remaining-request counter**; plan totals /
  team allotments / runtime-or-editor refusal only; monthly included usage shown honestly as
  **plan-cycle data**, not a short rolling countdown; disclose the evidence class
  (`usage-feature.md:209-216`).
- **GitHub Copilot:** must **not promise a simple per-account remaining-requests endpoint**;
  preserve premium-left vs exhausted vs billing/entity/org/entitlement-policy blocked (`:260-262`,
  UF-016 `:1714`).
- **Gemini Direct:** when PM **cannot prove authoritative remaining quota**, UI must show
  `estimated`/`unknown`/source-qualified wording rather than pretending the numbers are definitive
  (`:294`); project attribution + estimated-vs-authoritative shown honestly (`:345`).
- **Antigravity CLI:** separate `antigravity_cli`/`agy` route; missing `/stats` = stats
  unavailable + usage unknown, missing `/usage` = unknown, `/quota` = not exposed, `/credits` = not
  exposed; disabled buckets render disabled and **omit fabricated progress bars / never become zero
  remaining**; **G1 credits are credits, never tokens/cost/quota/provider_total**; missing
  reset/cooldown → `reset unknown`/`cooldown unknown`, not guessed countdowns
  (`CLI_Bridged_Providers.md:1441`; UF-087 `:5440`; GUI-CBP-001/002 `:5535-5536`; F3-418 `:27751`).
- **Claude Code subscriber-backed:** `/stats` is **softer pressure evidence**, not authoritative
  cost; `/cost` is API-billing evidence; subscriber rows must not reuse org/API hard-limit semantics
  without provider evidence (`Contracts_V0.md:2138`; `usage-feature.md:274-278`; MA-063 `:891,915`).
- **General rule:** label the evidence class; **missing → unknown, not zero**; **no fabricated
  countdowns / remaining quota / price snapshots from status/login probes** (UF-087 `:5441`;
  UF-085 `:5711`; F3-418 `:27781`). `session_only` windows = authoritative local stats but **no
  durable provider quota window** (`usage-feature.md:605`).

---

## Cross-cutting identities (for prototype data model)

- **Primary accounting identity:** `usage_event_ref` normalized to `route_target.object_kind =
  usage_event` + `object_id`; `usage_record_id`/`provider_attempt_ref`/`attempt_id`/`dedupe_key`
  are correlation. `thread_id`/`tier_id`/`timestamp`/`run_id` are **filters only**, never primary
  (UF-087 `:5504`; CV-316 `Contracts_V0.md:20311-20372`; F3-418 `:27780`).
- **Refresh/retention defaults:** auto-refresh `usage.refresh_interval_seconds = 300` (within the
  documented 5–15 min window); retention `usage.retention_days = 90` (`usage-feature.md:5812`,
  UF-089 `:6185-6190`).
- **Chat is a consumer, not a calculator:** the context circle / Context Detail Pane consume the
  same UsageRecord projections; Compact Now never recalculates usage (ACD-434
  `assistant-chat-design.md:23724-23790`).
