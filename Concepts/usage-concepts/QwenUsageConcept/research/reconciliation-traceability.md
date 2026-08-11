# Reconciliation & implementation traceability (Phase E)

Reconciles: user requirements (handoff) × current canonical Plans (research/plans-*) × current code × external evidence (research/usage-*). Each behavior is classified:
**[CANON]** already canonical · **[FIX]** required correction to match canonical · **[PROTO]** prototype-only visual exploration · **[FUTURE]** proposed future Plans change (not applied) · **[REJECT]** rejected after research · **[UNKNOWN]** unresolved, represented honestly as unknown/estimated in demo.

## Information architecture & semantics
| Behavior | Class | Evidence / decision |
|---|---|---|
| Usage-first IA (quota/pressure/remaining/reset/cache/used/sessions/burn lead; cost secondary) | CANON+PROTO | Matches UF-085/UF-087 emphasis; "usage-first" framing is rebuild-plan (Concepts/usage-concepts/BUILD_PLAN.md). U8 still cost-forward in code → FIX (not yet applied). |
| Token buckets input/output/reasoning/cache-read/cache-write with per-provider inclusivity | FIX | `counting_semantics` decides inclusivity (OpenAI inclusive vs Anthropic additive). Current demo sum `input+output+cache_read` DOUBLE-COUNTS inclusive providers. Must reconcile per provider before display. (plans-usage-synthesis Q1; LiteLLM/Helicone/opencode evidence.) |
| "Used tokens" total | FIX | `provider_total` is the provider total; `total_tokens` convenience-only, never re-add inclusive subsets. Cross-provider sum keyed by (provider,model,account,billing_entity,entitlement_class); when not producible → per-provider **unknown, not zero**. Current demo total is not source-aware. |
| Cache-read/cache-write + hit rate first-class | CANON | Buckets exist (UF-085). Display only after counting semantics valid. |
| Provenance on EVERY value (value_state, source_class, source_confidence, source_authority, settlement_status, projection_freshness, projection_health, observed_at) | FIX | Canonical (UF-087 `usage-feature.md:5429`, F3-418 `FinalGUISpec.md:27751`). The handoff's promised grammar is REQUIRED by Plans but ABSENT from the demo data fields → must be added per cell. |
| Three-way cost (API-billed vs plan-included/estimated vs combined) | PROTO over CANON | Single authority `cost_microdollars` (u64); `cost_usd` display-only. A *second cost model is banned* (UF-064, UF-087). Three figures are a GUI **projection** of the one authority + settlement_status, not three stored costs. |
| Add-on vs paid-overage separation | FUTURE | Rebuild-plan framing; canonical only via entitlement_class + cost authority. Recommend explicit buckets. |
| Run-out / burn rate | UNKNOWN→FUTURE | **No canonical definition exists** (only anomaly formula `current_window_cost/max(median_prev_7,1)` threshold 3.0, UF-083). Any prototype run-out MUST be a clearly-labeled derived projection, fail-closed to `unknown`, never a fabricated countdown. Recommend promoting a canonical definition. |
| Quota windows: rolling/fixed_reset/billing_cycle/session_only/unknown; 5h/weekly are LABELS | FIX | `window_kind` enum canonical (`usage-feature.md:597`). Demo must model each window as its own record with own reset evidence; never synthesize weekly reset from 5h. |
| Non-authoritative quota providers (Cursor, Copilot, Gemini, Antigravity, Claude-subscriber) | FIX | Label evidence class; missing→unknown; no fabricated countdown/remaining (UF-087 `:5441`). |
| Missing/unknown ≠ zero; disabled/not_exposed/hidden are states | CANON | UF-074/UF-085/UF-087/F3-418. |

## GUI surfaces
| Behavior | Class | Evidence / decision |
|---|---|---|
| Context-ring status popup, corner-origin sprout (~300ms open / ~220ms close), hover=glow only, one-popup-at-a-time | CANON | ACD-441/ACD-438/ACD-439/ACD-442; UF-011. The handoff's "Context Lens sprout" is the context-ring module. |
| Compact is explicit only; open/hover must NOT compact | CANON | `cmd.chat.compact_context` (UCC:745); UF-011:1474, F3-132:11126. |
| More Details / Context Detail: Curated{Overview,Breakdown,Messages}/Raw; stacked bar+legend; redacted Raw at bottom | CANON | assistant-chat §12.0; UF-012; deep-link `cmd.chat.open_thread_context_details`. "Calm editorial / show-N" is rebuild-plan styling (PROTO). |
| Widget free resize (arbitrary grid span) | CANON | `cmd.widget.resize` (UCC:377); free col_span/row_span. |
| Widget S/M/L/XL presets, Focus, Configure, Remove kebab wording | PROTO | Rebuild-plan only (L52–53); no canonical command. Keep as prototype convenience; presets must NOT restrict final size. |
| Add-widget chooses content + initial size | FIX | Canonical add via `cmd.dashboard.add_widget` (emits `dashboard.widget_added`); duplicate `cmd.widget.add` exists (no event) → reconcile (see proposed updates G1). |
| Widget layout persistence `widget_layout:v1:dashboard` | CANON | WS-009; F3 §C.5. |
| Shared DRY widget/menu/context module (no U7/U8/U9 duplication) | FIX | DRY §2.1. Current U7/U8 keep legacy widget systems; U9 uses usage-widgets.*. Must consolidate. |
| 8 themes; Friendly=paper+18px dot grid; Glass=one-pane slab; no colored edge-strip; Settings scrollbar; icon tooltips | CANON (mostly) | F3 §6. Edge-strip ban + no-underscore + Settings-scrollbar-everywhere are partly prototype guidance; no-underscore enforced at render (R.human). |
| No user-facing underscores | FIX (applied) | Enforced via R.human/R.humanCap/R.deText + literal humanization in U3–U8; gate scans all text nodes. |

## Motion & portability
| Behavior | Class | Evidence / decision |
|---|---|---|
| Semantic motion token system (durations/easing) | FUTURE | research/motion-token-map.json derived from 14 sources; NOT yet implemented in prototypes. |
| Reduced motion keeps state signal (instant placement / short fade) | CANON+FUTURE | F3:2120/29698 instant; W3C 2.3.3. No canonical toggle command (it's a setting). |
| Slint 1.17.1 portability | FUTURE | Only 2 true blockers (backdrop-filter, blur). transforms (1.14+), bindable grid spans (1.15+), DragArea/DropArea (1.17+) are feasible. No spring easing (use cubic-bezier overshoot or Timer). Concepts NOT yet re-authored for Slint. |

## Verification
| Item | Status |
|---|---|
| Alignment U3–U7 meter groups (left AND right edges) | FIXED + verified 280/280 |
| Zero underscores (all states) | FIXED + verified 280/280 |
| Zero root overflow / console errors | verified 280/280 |
| Interactive states, low-height, motion, visual sign-off | NOT yet covered (see verification/known-limitations.md) |
| Semantic data rebuild (counting/provenance/run-out/cost) | NOT yet applied (research done; implementation future) |
