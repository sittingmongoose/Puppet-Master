# Composition contract — Grok 4.5 Assistant Chat

Local (non-canon) composition rules for this workspace. Preserves w1–w8 × t1–t8 identities.

## Ownership

| Layer | Owns |
|-------|------|
| **Window (w1–w8)** | Chrome, history geometry / pin language, left artifact sibling placement, selectors |
| **Thread (t1–t8)** | Message paradigm, question renderer, compact work / activity composition, composer XOR questionnaire dock |
| **Shared Goal strip** | Edit / Pause / Resume / Stop / Clear / Replan (FINDINGS L4) |
| **Shared state** | Store session (`historyMode`, `artifactWorkspace`, access, approvals, warnings), demo harness events |

## History modes

`closed` · `peek` (may overlay) · `pinned_compact` · `pinned_full` (sibling only; auto-compact when chat floor violated).

## Artifacts

Open left of Chat, outside transcript/composer. States: loading, ready, update, error (+ retry), switch, close.

## Questions

Shared controller; per-thread visual renderer ids in `threads/q-renderers.js`. Skip ≠ Cancel.

## Pairings

All 64 W×T mounts remain valid. Product behavior must not be showcase-only (w6×t1).

## Step 8 shared surfaces

| Surface | Owns |
|---------|------|
| **BSD picker** | Off/Auto/On + turn/thread scope; glow only auto-active |
| **Sync chip** | live/offline/reconnect/replay/snapshot/server-work; outbox idempotency |
| **Restore/rewind** | `thread.restorePoints` + rewind truncates active context |
| **Notifications** | Title-bar sprout/count only (not a Chat side panel) |
| **Browser Program** | Activity/progress wording; never Playwright in product UI |

Demo triggers remain non-product (`DEMO_TRIGGER_CONTRACT.json` / demo harness drawer).
