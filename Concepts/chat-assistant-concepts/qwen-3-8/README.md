# Qwen 3.8 · Assistant Chat concept workspace

This is the isolated Qwen 3.8 deliverable of the Puppet Master Assistant Chat concept comparison. It contains eight original chat-window concepts, eight original chat-thread concepts, a stable composition layer so any of the eight threads mounts in any of the eight windows (64 pairings), and an interactive comparison workspace labeled **Qwen 3.8** at the workspace level and inside every concept.

## Isolation and posture

- All work lives only in `Concepts/chat-assistant-concepts/qwen-3-8/`. Nothing outside this folder was created or modified.
- These are interactive **concept prototypes**, not product canon and not production lineage. Per `Plans/UI_Wiring_Rules.md` (UIW-005) they illustrate only; `Plans/**`, `Concepts/PMConcept7.html`, the UI Command Catalog, the Wiring Matrix, DRY Method contracts, and the parallel Usage-page redesign are untouched.
- Newly discovered specification, command, schema, wiring, and DRY issues are recorded in `SPEC_GAPS.md` only — never silently resolved into canon.

## How to run

The workspace fetches its demo data, so serve the folder over HTTP. For casual viewing `python3 -m http.server 8723` is fine; for the Playwright matrix use the bundled dependency-free Node static server (the Python one-liner drops connections under bursty parallel loads):

```
cd Concepts/chat-assistant-concepts/qwen-3-8
node verification/static-server.mjs        # robust static server on :8723 (recommended for tests)
# or: python3 -m http.server 8723          # fine for human viewing
```

Open `http://localhost:8723/index.html` — the comparison workspace. Modes: **Focus** (one live concept), **Compare** (two side by side, sharing the broadcast), **Catalog** (all sixteen concepts as live cards; click to open in Focus). The control bar broadcasts all eight themes, the continuous 520–1200 px width slider plus the 520/750/975/1200 presets, the open/closed fake application rail (independent of chat width), the docked/pop-out mount switch, and reduced motion. A searchable **Scenario** picker drives the demo data thread so a reviewer can interactively reach the blocked goal, the 120-message history, the markdown brief, the questionnaire queue, and so on (broadcast as a `pm-data-thread` bridge message; `host.html` also takes a `dt=` param). The workspace lands on a conversation-rich thread, and in Compare mode each pane carries its own pair selector. Concepts also animate in — messages fade/stagger on thread and scenario switches (never on keystrokes) and honour reduced motion, and the workspace carries a subtle ambient drift so it reads as a living surface rather than a static mockup.

A single concept is at `host.html?w=w1&t=t1&theme=...&width=...&mount=...&rail=...&rm=...`.

## Verification

```
node verification/run-matrix.mjs --suite=all     # or --suite=windows|threads|pairs|features|functional|motion
```

Open `verification/results/contact-sheet.html` to review the 1,664 screenshot captures; the machine results are in `verification/results/results.json` and `verification/results/report.md`.

## The concepts (no ranking)

Window concepts (chrome around the conversation): W1 Masthead, W2 Single Bar, W3 Thread Shelf, W4 Corner Sockets, W5 Chrome Spine, W6 Chip Deck, W7 Mini Rail, W8 Pull Strips. Thread concepts (how the conversation itself reads): T1 Measured Prose, T2 Turn Plates, T3 Working Margin, T4 Session Spine, T5 Condenser, T6 Dense Rows, T7 Surfaces Aloft, T8 Chapters. Each is materially different in structure and each is tuned for readable sustained conversation at 520 px; full per-concept notes are in `FINDINGS.md`.

## Composition contract

Every window module mounts a thread into a provided slot (`ctx.threadSlotEl`) and exposes chrome through shared sockets from `windows/_window-kit.js` (chats drawer, selector row, context ring, search, Context Lens, kebab, identity badge). Every thread module delegates all behaviour to `threads/_thread-kit.js` and only supplies layout options/hooks, so behaviour is identical across the 64 pairings while presentation differs. Semantic state lives in one `ChatSemanticStore` (`_shared/store.js`); it survives docked↔pop-out remounts and simulated restarts, and the fake run engine (scripted, non-semantic replies + working timer) lives there too so a run survives remounting. Interactive actions emit typed UICommand-intent events via `_shared/commands.js` (flagged `cataloged` where a PlanUnit-derived ID exists, `uncataloged` otherwise) so the concept shows the wiring shape without re-owning the catalog, and assistant prose is rendered by a safe escape-first markdown renderer (`_shared/markdown.js`) whose ```mermaid fences become sandboxed-bridge placeholders. The pop-out form is draggable and resizable (horizontal resize clamps to 520–1200 px).

## Demo data

`_shared/demoData.json` is the packet's `machine/demoData.json` copied verbatim (SHA-256 `92ec3684…`, 15 threads, 400 messages, 22 scripted replies). `_shared/demo-extend.js` makes additive changes permitted by the demo-data contract (`07_DEMO_DATA_CONTRACT.md` §1): it sets `collapsedByDefault` on the thread-03 long user message (so that fixture exercises the user-message collapse path it was tagged for), diversifies `totalElapsedSeconds` on two messages (so More Info's "Total elapsed when different" row fires), appends a richly-formatted assistant brief to thread-13 (list + bold + emphasis + inline code + a code fence + a ```mermaid fence, so the renderer is exercised end to end), and appends a fully-authored sixteenth thread, thread-16 — a sustained, human-voiced conversation with its own markdown, a collapsed long answer, an inline-code filename, and a hidden search phrase — used as the workspace landing and the featured Scenario. At runtime that is 16 threads / 400+ messages. These are the only data mutations and are disclosed.

## Reports

- `SPEC_GAPS.md` — structured gap report (record-only).
- `CANON_PROPOSALS.md` — the exact, ready-to-apply canon/catalog/wiring fixes for the record-only gaps (prepared, **not** applied, by contract).
- `FINDINGS.md` — design notes, reconciliation, audit summary.
- `verification/known-limitations.md` — what the automated matrix proves and does not.
- `verification/results/report.md` + `results.json` — matrix coverage counts.
- `verification/results/contact-sheet.html` — visual evidence viewer.

## Tooling

Browser automation uses `playwright-core` (resolved from a local install or the sibling `Concepts/usage-concepts/verification/node_modules`, which is read-only here). System Chrome is the executable. `node_modules` is never committed. For the matrix, prefer the bundled dependency-free static server (`node verification/static-server.mjs`); the `python3 -m http.server` one-liner is fine for casual viewing but drops connections under Playwright's bursty parallel loads.

## Notes from later passes

- **Compare mode** gives each pane its own theme / width / scenario / rail, so two concepts can be compared under different conditions. Because the panes share the viewport, a per-pane width wider than the pane is rendered clamped to the pane (responsive shrink) so the concept never clips; inspect a concept at its full 975/1200 in Focus or by widening the browser. The matrix verifies every concept at true 520/750/975/1200 in a full-width host.
- **Verification** is eight suites (windows, threads, pairs, features, functional, motion, polish, v2) — see `verification/results/report.md` for the live counts and `FINDINGS.md` (eighth pass) for what changed. The matrix is collision-safe: it spawns its own static server on an OS-assigned port (`PORT=0`), writes screenshots to `results/run-<timestamp>/`, and never touches processes it did not start. `node verification/gen-contact-sheet.mjs` rebuilds `results/contact-sheet.html` from real captures.
- **Revision-2 pass** added real pinned history (full/compact/micro, never overlay), a left artifact workspace with eight presentations, eight concept-specific question renderers and compact work compositions, selectors v2 (accounts/favorites/Fast/access profiles), approvals and tiered warnings, rewind/branch/inter-thread/redirect, Compact Now, passive spellcheck, thread-17 showcase content, and a deterministic demo-trigger harness (gallery Demo drawers + `?harness=1`). Impacts are recorded in `IMPACT_REGISTER.json`; canon is unchanged.
