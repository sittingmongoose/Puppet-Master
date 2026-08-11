# TEST REPORT — Settings Redesign Bakeoff (Kimi)

Date: 2026-08-05 · Folder: `Concepts/settings-redesign-concepts/kimi`

## Harness

- Shared ConceptHub server per CONCEPT_RULES rule 9: `python3 Concepts/ConceptHub/server.py --port 0 --no-browser` (OS-assigned port), unique temporary Chrome profile/output dirs under `$TMPDIR`, no external process touched. Two hub instances were killed externally during the session (another agent session shares this machine and runs its own hub); the interactive smoke suite was then completed over `file://` with `--allow-file-access-from-files`, which exercises the identical static pages. Hub-served verification passed earlier for the gallery and Concept 01 (render + shared-asset routing through `/concepts/...`).
- Browser: Google Chrome headless (`--headless=new`), virtual time budget for animation/timer settle.
- Interaction harness: a temporary `__smoke.html` (deleted after the run) driving each concept in same-origin iframes: real clicks, real typing, scrollspy jumps, manager actions, theme and motion toggles.

## Functional smoke results (packet §06 items 1–12)

**33 / 33 checks PASS** on the final run against the shipped code (re-run after the compliance-sweep additions; zero failures):

```
PASS atlas: home directory renders            PASS constellation: command cards render
PASS atlas: notices render                    PASS constellation: page reshapes into results
PASS atlas: workspace sections render         PASS constellation: workspace renders after result pick
PASS atlas: settings rows render — 12 rows    PASS constellation: minimap ticks render
PASS atlas: search results appear             PASS constellation: minimap active tick after jump
PASS atlas: deep-link focuses the row         PASS constellation: mission board tiles render
PASS atlas: provider manager renders          PASS constellation: family expansion renders accounts
PASS atlas: multi-account switch offered      PASS ledger: annotated index renders 11 entries
PASS atlas: account switch receipt honest     PASS ledger: chapter renders
PASS atlas: refresh keeps last-known-good     PASS ledger: floating TOC renders
PASS ledger: TOC current marker after jump    PASS ledger: underline sweep applied to jump target
PASS ledger: spellcheck underlines render     PASS ledger: spellcheck menu opens (never auto-replaces)
PASS workbench: status band renders 5 tiles   PASS workbench: instrument panels render
PASS workbench: sticky section headers        PASS workbench: position counter present
PASS workbench: accordion syncs after jump    PASS workbench: control room rows render
PASS workbench: diagnostics drawer opens      PASS themes: switch applies retro-light
PASS motion: reduced toggle applies
```

Post-sweep verification run (after adding the role-assignment surfaces and the TOC search move): **11 / 11 PASS** — roles render in all four concepts with quality-guard constraints, the verifier role's Not-configured state, role route changes receipt, and Ledger TOC search above the list.

Mapped to the packet's required checks:

1. Search result opens the correct category/subcategory/setting — PASS (all four concepts; deep-link focuses the exact row with `[data-spy-current]`).
2. Scrolling changes active subcategory without oscillation — PASS (scrollspy suppression window during programmatic jumps; single active marker).
3. Subcategory jump lands at a stable offset — PASS (`scroll-margin-top` + measured jump; marker confirms).
4. Provider refresh preserves last-known-good rows during loading — PASS (OpenAI catalog row stays visible with a "Refreshing — showing the last known good catalog" badge).
5. Account selection affects future simulated requests only — PASS (receipt text states it verbatim; no in-flight migration is claimed).
6. Model menus expose effort and Normal/Fast only when supported — PASS (capability-gated in the shared renderer; Claude Opus shows both, others show "Single speed"/"not offered").
7. Default/inherit/reset state is unambiguous — PASS (state badge + value source line + per-row Reset + category reset with two-click confirm).
8. Manager actions return a visible simulated result or honest unavailable state — PASS (all sign-in/install/repair/refresh/setup actions receipt).
9. Spellcheck suggestions never replace text automatically — PASS (menu-only actions; "Replace once" is an explicit click; code token and path never underlined).
10. Reduced motion reaches equivalent final states — PASS (kill switch + media query honored; jumps become instant, same end state).
11. Concepts remain visually distinct after theme changes — PASS (four different layout architectures; theme switch verified live).
12. Validator passes — PASS.

## Static checks

- `node --check` passes on all 9 JS files (4 concept, 5 shared lib; demo data validated by the foundation's assertion run: 11 categories, 129 settings, every state ≥3×, 7 providers).
- `python3 Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/kimi` — **PASS** (5 entries: gallery + 4 concepts).
- `python3 -m json.tool` on `concept-hub.json` and `IMPACT_REGISTER.json` — valid.
- Emoji scan of source: clean (typographic arrows in prose are not emoji; all icons are inline SVG; back buttons use an SVG chevron).
- Colored left-border status accents: none (only neutral `--pm-line` hairlines and bottom-border underline sweeps).
- No category pills/chips as navigation anywhere; `.pm-chip` is used only for multiselect value tokens.
- No raw underscored internal labels in visible UI (the one `pm_store_init` token is the intentional spellcheck skip-token inside the demo paragraph).

## Width / shell / theme matrix

- Hub width control: role `page`, presets 760 / 900 / 1280 / 1700 / 2200 / 2500; the whole fake shell squeezes (top bar and status bar always visible).
- Screenshot review (Chrome headless, standalone width = effective frame width):
  - Concept 01 at 1280 and 760 — verified visually: notices wrap fully (no horizontal cut-off rail), shell side panel auto-hides when squeezed, attribution chip visible, no clipped labels.
  - Concepts 02–04 at 1280 and 760, gallery at 1280 — see "Screenshot notes" below.
- Shell combos: rail/side/Assistant/bottom panel toggles are functional on every page (grid auto-tracks reshape without JS layout math); squeezed behavior verified at 760.
- Themes: all 8 themes are token-complete in `shared/css/pm-themes.css` (asserted at foundation build); live switch verified Friendly Dark → Retro Light; reduced-motion toggle verified.
- Keyboard/focus: search ↑/↓/Enter/Esc, jump focus moves into the target section, visible focus rings via `--pm-focus`.

## Issues found and fixed during testing

1. Deep-link focus raced a scroll-position restore (smooth scroll cancelled) — fixed by capturing focus intent before render; re-verified PASS.
2. Search results initially rendered in-flow inside the Atlas manager bar/outline (stretched the bar) — now overlay.
3. Ledger TOC/rail was viewport-fixed and could overlap the Assistant panel — now anchored to the stage wrapper.
4. Unimplemented manager search results (Usage, spellcheck, LSP, personas in concepts without those managers) could dead-end — now deep-link to owning surfaces; Usage opens the Providers manager Usage tab.
5. `data-concept-model="Kimi"` was JS-rendered only — added a visible static attribution chip per page (validator requirement).
6. Notice status chips in Constellation/Workbench verb rows collided with the shared `.pm-notice-chip` grid-area contract (unstyled chip, squished action button) — rows now use their own grid with the chip in a stable right slot; re-verified visually at 1280 and 760.
7. First compliance sweep found the packet §2 agent role assignments missing from every concept — added a shared role-assignment surface (route selects, quality-guard constraints, Not-configured state) realized per concept: Atlas "Agent roles" master–detail pane, Constellation mission-surface section, Ledger appendix section, Workbench control-room block.
8. Ledger's TOC had search below the list; packet requires search above/adjacent to navigation — moved above.
9. Rows did not surface the recommended value when the current state was not "Recommended" — added a quiet "Recommended: X" mark in the shared row source line.
10. Catalog panels did not mention quarantine/removed-history — added the explanatory line; model rows now show input/output modality badges.

## Known simulations

Every provider sign-in/install/reconnect/repair/readiness action, catalog refresh latency, guided setups, Usage deep-link, terminal/media/MCP diagnostics, memory index rebuild/dedup/version restore, plugin retry, and crew composition editing. All report honest receipts. See FINDINGS.md §4.

## Screenshot notes

All reviewed in Chrome headless at 1280 and 760 (effective frame width):

- **Concept 01 @1280/760**: full home with directory, notice grid (3 attention / 2 setup / 1 recommended), recents; squeezed shell hides the side panel and wordmark; notices wrap 2-up with nothing clipped.
- **Concept 02 @1280/760**: command-field home; verb rows with headline + consequence, verb buttons, and kind-colored status chips in a stable right area. (First pass caught unstyled chips and squished verb buttons — a `grid-area` collision with the shared `.pm-notice-chip` contract; fixed and re-verified at both widths.)
- **Concept 03 @1280/760**: editorial front page (masthead, search band, decision blocks, annotated index); nothing clipped at 760.
- **Concept 04 @1280/760**: status band (5 tiles), operations list, instrument panels; the same chip-grid fix was applied and re-verified at both widths.
- **Gallery @1280**: four concept cards with theses, try-lists, and open links; shared-system and inspection sections.

## Cleanup

- `__smoke.html` / `__diag.html` deleted after the final run.
- All temporary Chrome profiles, DOM dumps, screenshots, and output dirs under `$TMPDIR` deleted.
- Only the deliverables remain in the folder (verified with the validator's temp-artifact scan).
