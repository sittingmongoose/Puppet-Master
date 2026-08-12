# Findings — Settings Redesign Bakeoff — Qwen 5.8 — Final Packet Build

No ranking or recommendation is made. These are observations from building four divergent concepts against the 2026-08-08 cumulative packet.

## Major information-architecture choices

### 01 Atlas — Settings Directory
- Home is a directory of places: each destination carries title, purpose, health summary, and an OPEN affordance. Notices live in a side column beside the directory.
- Workspace is a two-pane document: persistent left TOC with sliding marker, continuous subcategory document right; managers render as rooms inside the owning subcategory, hydrated lazily with skeleton-first behavior.
- Motion: cartographic travel — direction-aware origin travel on Home→Workspace and category change.

### 02 Deck — Command Center
- Home leads with a command field, then an LED status board (every LED paired with text; attention pulse bounded to 3 beats), destination tiles with OPEN affordances, notices, recents.
- Workspace uses a sticky category strip with auto-centering active tab plus left subnav scrollspy.
- Demonstrated Notifications & Sounds puts the title-bar inbox as the ONLY in-app notification surface (no status-bar bell). Appearance demonstrates hover live-preview + invalid TOML fallback.
- Motion: staged console reveals; layout settles before text.

### 03 Ledger — One Document
- Home is a document cover: index-lookup search, numbered contents, marginalia notices, recently consulted pages.
- Workspace is one continuous document with §N.M sections and a margin outline with a gliding ink marker; the provider manager is Appendix A.
- Demonstrated developer families include the Terminal ANSI palette with a live preview strip and the full Testing Global/Project × Auto/On/Off matrix.
- Motion: ink-and-paper minimalism.

### 04 Spoke — Settings by Intent
- Home groups destinations into four intent wings plus an A–Z fallback so no domain is hidden by re-taxonomy; search is a floating launcher.
- Workspace is master list + detail document with a right-edge tick rail driven by scrollspy.
- Demonstrated system families include the Settings Lifecycle (import preview → apply → rollback), four backup classes with the action/setting/status distinction, and the Future Server shell with six deferred modules as named insertion destinations.
- Motion: orbital depth (rise/scale layering).

## What each concept deliberately explores differently

- **Hierarchy source**: Atlas = spatial directory; Deck = operational status; Ledger = typographic document order; Spoke = user intent grouping.
- **Destination representation**: directory entries, status tiles, numbered contents, intent wings. None uses pills, left accent borders, or color-only state.
- **Navigation placement**: left TOC, sticky strip, margin outline, right ticks — proving the scrollspy/jump contract is placement-independent.
- **Manager treatment**: inline room, console, appendix, split view — identical interaction contract via the shared builders, differentiated by prefix styling (`at-`/`dk-`/`lg-`/`sp-`).
- **Motion flavor**: cartographic, console, ink, orbital — all preserving every state under reduced motion.

## Conflicts and gaps found vs Plans

1. **Command-ID conflicts**: the packet's candidate `cmd.notifications.sound.*` family collides with canon `cmd.sound.upload/pack.import/preview/asset.delete/asset.export` preserved in `Plans/UI_Command_Catalog.md`; the concepts reuse canon and mark the packet candidates `conflict` (see candidate-command-delta.json per concept).
2. **`cmd.settings.bloom.open`**: still canon in the catalog for the old chip/bloom architecture; the packet instructs retire/alias. Flagged `retire` with a compatibility-alias note; adjudication belongs to the audit agent.
3. **`cmd.persona.manage`** is superseded by the canonical `cmd.persona.create/update/delete/select/duplicate/import/export` family; concepts route to canon.
4. **Inventory mapping**: the packet's 10 humanized destinations do not match `Plans/settings_inventory.json` category ids; a mapping table and tier-vocabulary migration are required before canon adoption.
5. **Media retirement**: the old `media` destination is retired; continuation settings moved into the Provider manager; honest not-configured/unavailable rows kept as Desktop fixtures and an unavailable-capability search exemplar.
6. Model names in fixtures are illustrative; production must source names/capabilities from models.dev / Free Coding Models catalogs with evidence freshness.

## Functionality that remains simulated (explicit)

- All provider network actions (reconnect, probe, install, repair, login launch, rescan), catalog refresh (timed 2.2 s with last-known-good), update lifecycle phases, and account switching — each returns an honest receipt labeled simulated.
- Notification test-send (explicit, masked, rate-limited at 10 s), sound preview (local WebAudio beep), pack import checks, destination CRUD.
- Import/export/reset/copy-from flows operate on demo state with a real pre-import snapshot and rollback; no file is written.
- Backup/cleanup/index-rebuild actions update fixture state only.
- The surrounding shell (rail destinations, project chip) is decorative by design and says so.
- No browser dialogs: alias/nickname editing uses the shared `promptDialog` modal.

## Slint 1.17.1 translation risks

1. Scrollspy must be model-backed state driven by viewport position, never DOM geometry.
2. `backdrop-filter` → pre-baked blur assets (PMConcept7 T16 pattern).
3. `color-mix()` → precomputed per-theme tokens.
4. Long provider/model lists → virtualized/segmented repeaters.
5. `prompt()` eliminated already via `PMCore.promptDialog`; port as a native dialog component.
6. Width tiers → size-change callbacks writing a tier enum.
7. Lazy hydration skeleton → model-backed loading state per manager slot.
8. contenteditable spellcheck underlines → styled-text ranges + PopupWindow suggestions (no-autocorrect contract ports directly).
