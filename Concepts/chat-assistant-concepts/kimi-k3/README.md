# Kimi K3 — Assistant Chat Concept Workspace

An isolated, interactive concept workspace for the Puppet Master Assistant Chat. **Eight chat-window concepts** (chrome and arrangement) and **eight chat-thread concepts** (transcript rendering) combine freely: any of the 8 thread concepts mounts inside any of the 8 window concepts — **64 pairings** — through one stable composition layer. The whole workspace is labeled **Kimi K3**, theme-aware (8 themes), width-testable (520–1200px), and supports docked and pop-out forms that share the same semantic state.

> This is a **prototype gallery** (inspired by `Concepts/rail-concepts/`), not the Puppet Master Home page. It does not integrate into `PMConcept7.html` and does not update canonical Plans.

**Central goal:** readable sustained conversation at the narrow 520px width most users will use, while Goal, Todo, subagent, diff, activity, thought, question, search, Context Lens, artifact, runtime, and long-thread detail stay available and truthful.

## Concepts (no ranking — each explores a different relationship)

### Windows (chrome + arrangement around the two slots)

| ID | Name | Arrangement |
|---|---|---|
| w1 | Solo Column | One centered conversation column; history in an overlay drawer; Goal/Todo/work in an expandable status strip. Minimum-width-first host. |
| w2 | Triptych | Persistent history rail + transcript + right work inspector side-by-side; under 975px the inspector collapses into a Work drawer above the composer. Width-pressure host. |
| w3 | Dock Tabs | Standard header; tabbed dock above the composer (Goal/Todo/Agents/Diff/Activity) with live count badges; only tabs with data render. |
| w4 | Anchor Cards | Work surfaces as floating cards anchored to the transcript's right edge at wide widths; collapse to a work-chip row when narrow. |
| w5 | Console Footer | A one-line console status strip above the composer that expands upward into a panel holding all surfaces. |
| w6 | Icon Rail | A 48px left mini-rail of icon buttons switching a 200px side panel (history or surfaces); thread takes the remaining width. |
| w7 | Vertical Stack | Strict single column: header → Goal band → Todo band → thread → composer. Zero side columns ever. |
| w8 | Sheet Modal | Compact header; history/work/search slide up as bottom sheets over a scrim. |

### Threads (transcript rendering — behavior lives in the shared kit; each concept is thin opts + presentation CSS)

| ID | Name | Treatment |
|---|---|---|
| t1 | Prose Measure | Bubble-free prose on a centered reading measure; monogram gutter chips; work records as slim inline entries. |
| t2 | Spine Timeline | Left spine with node dots per message; activity stages align as milestones. |
| t3 | Turn Units | Each prompt/answer pair as one bordered unit card with a unit header; bubble-free prose inside. |
| t4 | Two Register | Asymmetric: right-aligned compact user quote blocks; containerless full-measure assistant prose. |
| t5 | Ledger Rows | Dense bookkeeping rows: role-tag gutter, hairline separators, dotted leaders, mono meta, work chips as total rows. |
| t6 | Margin Notes | Hover row moves into a right margin at wide widths (container query); normal inline flow when narrow. |
| t7 | Chaptered | Sticky chapter dividers with mini-TOC pills; messages indented under chapters. |
| t8 | Calm Chips | Most conversation-first: unbordered spacious turns, quiet work pills, largest prose. |

## Questionnaire choreography variants
Each window gets a distinct questionnaire feel (shared data API, distinct motion):
- **morph** (w1, w7) — faithful to the reference video: pill↔card height morph, staged option reveal, Skip→Submit morph, orbit preparing beat.
- **rise** (w2, w4) — calm/airy: the question rises inline, options cascade.
- **stack** (w3, w6) — playful/tactile: the card scales in elastically, advancing springs the next from depth.
- **inline-strip** (w5, w8) — compact: an expanding strip with a minimal-footprint option reel.

## Pinnable thread history
Every window can keep the thread list visible alongside the chat (so you can monitor multiple threads at once without toggling): w1 drawer-pin, w2 persistent rail, w3 Chats dock tab, w4 history anchor card, w5 Chats console section, w6 panel-pin, w7 Chats band, w8 sheet-pin. History rows carry an **animated status symbol** (working = orbit spinner, needs-attention = slow pulse, finished = calm) instead of text.

## Mount contract

- `host.html` boots a single pairing from query params: `?window=wN&thread=tN&theme=…&width=…&rail=0|1&rm=0|1&mode=docked|popout&state=<key>&seed=…`.
- **THE ONE HARD RULE:** a window renders its own chrome and provides exactly one `[data-k3-slot="thread"]` and one `[data-k3-slot="composer"]`. The host fills them. Neither module touches the other's DOM; cross-talk is only via `ctx.data` / `ctx.store` / events.
- A mode flip (docked ↔ pop-out) unmounts and remounts in the other root; semantic state (store) survives.
- `index.html` is the comparison workspace: embeds `host.html` iframes and broadcasts `{k3:true,type:'k3-env',env}` (theme/width/rail/reduced-motion/pairing) via `K3Bridge`.

## How to run

The workspace needs an `http://` origin (file:// iframes/localStorage are unreliable):

```bash
cd Concepts/chat-assistant-concepts/kimi-k3
node verification/serve.mjs
# → comparison workspace: http://127.0.0.1:8765/index.html
#   single pairing:       http://127.0.0.1:8765/host.html?window=w1&thread=t1
```

The demo data ships as JS (`_shared/demo-data.js`) so it works offline; no fetch anywhere. Google Fonts `<link>` is a preview convenience (same as PMConcept7) and falls back to system fonts offline.

## Verification

See `verification/commands.md` for every command. Headless harness uses vendored `playwright-core` + system Chrome (no install). See `TEST_REPORT.md` for results and `SPEC_GAPS.md` for the gap registry.

```bash
node verification/run-pair-smoke.mjs     # all 64 pairings
node verification/run-matrix.mjs         # 8 themes × 4 widths × rail × hosts
node verification/run-feature-states.mjs # 28 states × 32 configs
node verification/run-reduced-motion.mjs # final-state parity
node verification/run-mounts.mjs         # remount + behavior probes
```

## Isolation

All work stays in this folder. Do NOT edit `Plans/**`, `Concepts/PMConcept7.html`, the UI Command Catalog, the Wiring Matrix, DRY Method contracts, or the parallel Usage redesign. Spec/command/schema conflicts discovered during the build are recorded in `SPEC_GAPS.md` only — canon is not modified from here.
