# Test Report — Settings Redesign Bakeoff — Qwen 5.8

## Method

- Served through the shared Concept Hub on an OS-assigned port: `python3 Concepts/ConceptHub/server.py --port 0 --no-browser` (assigned port 50906 for this run).
- Automated battery run with a locally installed `playwright-core` (headless Chromium from the local ms-playwright cache) in an isolated Node process, isolated temporary browser profiles, and no shared browser session — chosen so concurrent agents' Playwright sessions are untouched.
- Hub catalog verified via `/api/catalog`: folder discovered, 4 entries + workspace, zero broken files, zero warnings.
- Static audits: inline script `node --check` on all pages; emoji glyph scan; colored left-border scan; raw-label scan.
- All temporary test material (server log, browser profiles, Node install, results JSON) lived in a scratch temp directory and was deleted after the run.

## Battery results — final run: ALL PASS

42 checks per concept × 4 concepts, plus index and hub surfaces. Every check passed for Atlas, Deck, Ledger, and Spoke with zero console errors across three successive fix waves on fresh OS-assigned ports.

| Check | What it verifies |
|---|---|
| model-attr | `data-concept-model="Qwen 5.8"` present |
| home-destinations | All 10 destinations rendered on home |
| home-notices | Notice stack renders in default scenario |
| spell-seeds / spell-popover-5-actions / spell-replace-once-changed / spell-no-popover-left | Spellcheck underlines present; popover offers exactly the five contract actions; Replace once changes text only on explicit click; popover dismisses |
| search-deeplink-workspace / -context-category / -setting-row | Typing "compaction" + Enter loads Context & Memory, jumps to the Compaction subcategory, lands on the setting row |
| nav-items-present / scrollspy-changes | Subcategory nav renders; scrolling to bottom vs top changes exactly one active item (no oscillation) |
| jump-returns-top | Clicking the first nav item performs a controlled jump back to the top |
| providers-rendered / providers-subcategory | Provider manager content present in the Models workspace |
| signed-out-cli-present | Codex CLI fixture demonstrates the required installed-but-signed-out state |
| auto-source-row | A setting demonstrates the Auto value-source state |
| grammar-separate-row | Grammar/style assistance is present as a separate opt-in setting |
| spell-advanced-rows | The combined contract's advanced spellcheck rows exist |
| overflow-menu-opens / thread-spellcheck-off / thread-spellcheck-on-again | Assistant overflow menu disables/re-enables spellcheck for the thread only |
| isolation-shown | Each account exposes its isolation model |
| nickname-saved | Account nickname edits persist and render |
| sticky-toggled | Sticky-session preference toggles with receipt |
| disable-migrates-preferred | Disabling the preferred account migrates preference to the next enabled account |
| cli-update-toast | CLI update check returns an honest simulated receipt |
| operational-badge | Goal concurrency shows read-only sustainable capacity sourced from Usage |
| crew-candidates | Deck Crew templates list per-member route candidates |
| refresh-last-known-good / refresh-completes | Catalog refresh shows the refreshing state while all provider rows remain (last-known-good), then completes |
| toggle-saved-custom / reset-removes-custom | Changing a default toggle marks it Custom with Reset; Reset restores the default state |
| all-8-themes | All eight themes apply via the Hub protocol |
| reduced-motion-attr | Reduced motion applies via the Hub protocol |
| width-760-squeezed / width-2500-wide | Width role `page` drives the shell tier (squeezed drawer behavior at 760, wide at 2500) |
| scenario-calm-no-notices / scenario-attention | Scenario seeds: calm home has zero notices; attention scenario shows the attention set |
| rail-opens / assistant-closes / assistant-opens | Shell rail and assistant panel toggle states |
| no-console-errors | Zero console/page errors (favicon excluded) |

Additional surfaces:

- `index.html` workspace: model attribute present, 4 concept cards, 4 open links, zero console errors.
- Hub topic page: settings-redesign topic visible with the Qwen 5.8 model card.

## Static audits

- Inline JS syntax: all four concept pages pass `node --check`.
- Shared JS: all `_shared/*.js` pass `node --check`.
- Emoji scan: 0 emoji glyphs in source (two dingbat glyphs found in an early draft of the Deck terminal preview were replaced with plain text and re-verified).
- Colored left-side status borders: 0 occurrences.
- Raw internal labels: none in rendered UI text (setting ids appear only inside Details disclosures and data attributes, which is the intended progressive-disclosure treatment).

## Manual/visual items not covered by automation

- Pixel-level clipping checks across all widths are visual; the squeeze strategy collapses navigation into drawers and wraps badges, and the automated width checks confirm the tier switches. A human sweep of 760/900/1280/1700/2200/2500 through the Hub width slider is recommended before selection.
- Motion flavor comparisons between concepts are visual by nature.
- Keyboard focus order beyond the tested paths (search arrow-key navigation, spellcheck Enter handling) was not exhaustively walked.

## Feature verification beyond the battery

- Atlas memory search filters the six Gists live (query "plan" → 2 of 6 visible, empty query restores all).
- Model hide/show: hiding a model shows the Hidden badge and a Show control, sorts it last, and dims it; showing restores it.
- Codex CLI "Launch CLI login" returns the CLI-owned-OAuth receipt.
- Deck LSP console renders four servers (running / idle / not installed), and Install returns an honest simulated receipt.

## Bugs found and fixed during testing

1. Home search ignored Enter unless an arrow key had preselected a result — Enter now opens the first match (Atlas, Deck, Spoke; Ledger already had the fallback).
2. Demo tray overlapped the assistant composer — tray moved to the bottom-left.
3. Ledger's provider appendix was missing the catalog feed rows and the refresh click handler — added.
4. Re-render-after-refresh used a detached node as an `insertBefore` anchor, wiping the provider section — all rerender paths now append rebuilt content and re-append preserved rows.
5. A quote imbalance introduced while removing two dingbat glyphs from the Deck terminal preview — fixed and re-verified.

## Motion audit

- No `infinite` animations anywhere in the set; calm states are static.
- Enter/reveal motion measured at 0.42s under full motion and 0.001s under reduced motion — identical final states.
- Disclosure expansions (setting details, model bodies, consoles, split inspector) use a 0.22s reveal; scrollspy indicators (TOC wash, ink marker, tab/tick transitions) animate position/color rather than layout.
- Jumps are scroll-locked until settled, so scrollspy never oscillates during programmatic navigation.

## Partial-fix wave (second self-review)

The five documented partials were implemented and verified: account nicknames, sticky sessions, CLI update checks, per-member Crew route candidates, and the per-thread spellcheck overflow action. The same wave also added account enabled state with preferred-migration, account priority ordering, per-account isolation-model exposure, the operational "sustainable now" readout on Goal concurrency, and the four advanced spellcheck rows from the combined contract. A re-render bug was fixed in the process: console/details/model expansion state now survives state-driven re-renders in Deck, Ledger, and Atlas.

## Packet-gap audit (self-review after first pass)

A line-by-line re-audit against packet §01–§06 found and fixed seven gaps:

1. Settings row states Auto-source, Unavailable-source, and Restart-required were not demonstrated — added `context.compaction.cache` (Auto), `media.io.video-output` (Unavailable with reason), and restart badge on Shell integration.
2. The required installed-but-signed-out CLI state was missing — added the Codex CLI provider with CLI-owned login launch and rescan.
3. Model hide/show was absent — implemented in all four concepts.
4. No concept implemented the LSP manager and cross-references disagreed — implemented as a Deck console; all concepts now consistently point to Deck.
5. Atlas memory search input was unwired — now filters live.
6. Grammar/style assistance had no settings presence — added as a separate off-by-default row with privacy disclosure.
7. Crew templates were missing min/max members, ports/test resources, and child-spawning depth — added to fixtures and the Deck console.

## Known simulations (also listed in FINDINGS.md)

All provider network actions, Usage deep links, memory/MCP/Crew/terminal/media manager side effects, alias prompt dialogs, and the spellcheck dictionary are simulated with honest receipts. No real provider, account, or purchase interaction occurs.
