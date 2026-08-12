# GLM-5.2 — Puppet Master Settings Redesign Bakeoff (Final Cumulative)

Four genuinely different interactive Settings concepts for Puppet Master, built against the **PM_Settings_Bakeoff_Final_Cumulative_2026-08-08** packet. This is concept work, not an implementation pass. No concept is ranked here.

- **Model:** GLM-5.2 (folder `glm-5-2`)
- **Topic:** `settings-redesign`
- **Open via ConceptHub:** `index.html` (comparison surface), or open any concept directly.

## The four concepts

Every concept includes the full quiet PM shell, a search-centric Settings Home, cross-category fuzzy search, the full Settings Workspace (one category at a time, continuous document, category/subcategory navigation, scrollspy, deep links), the **Provider / Account / Model / Installation** manager, representative setting rows (9-state model), persistent demo state, all eight themes, reduced motion, and narrow/squeezed (760 px) layouts. Each concept additionally **owns** a distinct bucket of manager families, demonstrated as full deep demos; the four concepts **collectively** prove the complete coverage matrix with no family missing.

| # | Concept | IA thesis | Search treatment | Workspace model | Motion | Family bucket owned |
|---|---------|-----------|------------------|-----------------|--------|---------------------|
| 01 | **Control Room** | Settings as mission control — one dominant search is the primary verb; destinations are large editorial panels. | Dominant omni-search atop Home; results cascade; deep-links. | Book-TOC: left category index + continuous document. | Editorial cinematic — staggered reveals, settle-then-text. | Context · Memory · Personas · Goal & Automation · Crew · Permissions/FileSafe · Back Seat Driver |
| 02 | **Atlas** | Settings is territory to navigate, not a list to filter — regions with boundaries and a you-are-here marker; size encodes density. | Persistent Cmd+K overlay (top-center); selecting flies the viewport to the region. | Focus + context: one region fills the canvas, compact minimap keeps the map visible. | Cartographic — smooth zoom/pan, scale+position continuity. | Notifications & Sounds · Sound Library/Uploads/Packs · Appearance · Spellcheck/Dictionaries · Desktop/Tray/Window · Teacher/Help |
| 03 | **Stack** | Settings never navigates away — one surface that expands; disclosure is the whole model. | Search is the head of the single stack; typing filters inline. | Expand-in-place: destinations are expandable rows; one open at a time. | Push/pop depth — FLIP reorder, height-settles-then-content. | File Manager/Editor · Terminal · LSP · Formatters · Commands & Shortcuts · MCP · Skills/Plugins/Tools · Testing & Debug |
| 04 | **Stream** | Settings is a river to read and jump within. | Search filters/jumps the stream; selecting scrolls to the section. | Continuous document; destinations are named sections; managers are channels. | Scroll-linked flow — momentum-eased jumps; nothing animates when calm. | Storage & Retention · Backup & Restore · Settings Lifecycle · History & Sessions · Runtime Artifacts · Source Control/Worktrees · GitHub Actions · Containers/Registries · Web/Search/Fetch · Project Search Index · Workspace Cleanup · Future Server module shell (deferred) |

Provider/Account/Model/Installation, Settings Home, Search, Workspace, and the ordinary setting-row grammar are **core** and appear in every concept.

## Family ownership is explicit in each concept

Each Home renders an **owned-families strip** ("Deep demos — this concept owns") of destination-control cards (not filter pills) that open the concept's owned managers. The full settings surface (all categories, all managers) stays navigable in every concept via category navigation and search; non-owned families are reachable through the shared manager grammar (lighter). This satisfies "collectively prove every family" plus per-concept ownership with no `missing` classification.

## What every concept shares (shared product architecture)

`assets/` is the shared product architecture all four concepts build on:

- `themes.css` — eight themes (Friendly / Glass / Retro / Basic × light/dark) + reduced-motion hard kill.
- `shell.css` — the quiet PM shell (top bar, activity bar, rail, chat, footer) + universal primitives (`.btn`, `.chip`, `.sdot`, `.field`, `.switch`, `.set-row`, …). Status is shown with circular status dots, **never** left accent borders.
- `state.js` — theme reducer, navigation core (`openCategory/openSub/openManager/focusSub`), non-oscillating IntersectionObserver scrollspy, fuzzy cross-category search, `localStorage` persistence.
- `shared.js` — shell renderers, the 9-state `SettingRow`, exposure control, theme picker, prose/spellcheck field, and the owned-families strip.
- `managers.js` — the uniform `M.shell()` manager grammar + **35 dedicated managers** (10 baseline + 25 final-cumulative families) + a generic resource-row helper, with every action functional (no decorative controls).
- `managers.css`, `icons.svg.js` (SVG only, no emoji), `motion.js`, `spellcheck.js`.

## Coverage of the packet

- **Provider fixtures (17):** CLI found/ready, CLI signed-out, multiple installations (one selected, one shadowed), unknown-owner manual-only, explicit Install from official source, update-available Ask-first, update-scheduled-when-idle, verification-failed + rollback, Claude CLI OAuth (CLI-owned), OpenAI PM-direct OAuth, API key, OpenCode external server, Free Models needing setup, usage-unavailable-but-ready, catalog refresh last-known-good, account priority/fallback requested-vs-effective, Fast/Normal + effort variation.
- **Auth boundary:** Claude CLI & Antigravity CLI OAuth are CLI-owned; PM-direct OAuth only for OpenAI/Codex, GitHub, Copilot.
- **All manager families** in `MANAGER_COVERAGE_MATRIX.json` are demonstrated (owned by one concept) or shared-grammar; the Server/Project-Sync module is a deferred-owner insertion shell (named owners, insertion contract — no state machine invented).

## Deliverables

Per-concept registers live in `concepts/<name>/` (matching the CursorAuto / Qwen 5.8 convention): `impact-register.json`, `manager-coverage.json`, `candidate-command-delta.json`, `candidate-wiring-delta.json`, `candidate-dry-delta.json`, `plan-owner-delta.md`. A root `IMPACT_REGISTER.json` aggregates and indexes them. Candidate command IDs are **provisional** — they census existing `catalog.*` / `UCC-###` canon and flag reuse/alias/supersession/conflict; they do not mint canon.

## Required design qualities honored

Search-centric with no dead space · dense without becoming a wall of forms · no left accent borders · no emoji (SVG only) · no clipped/uneven text · no pill controls that imply filters when they are destinations · compact actionable notices (one stable status + one headline + one reason + ≤1 primary + ≤1 quiet secondary) · stable hierarchy across all eight themes.

## How to view / validate

```sh
# Hub (repo root, OS-assigned port):
python3 Concepts/ConceptHub/server.py --port 0 --no-browser
# Validate this folder:
python3 Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/glm-5-2
```

See `FINDINGS.md` for information-architecture choices, inventory/plan conflicts surfaced, and Slint-portability risks. See `TEST_REPORT.md` for the verification matrix and results. No winner is recommended.
