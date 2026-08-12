# GLM-5.2 Settings Bakeoff — Final Cumulative Build Plan

## Resolved decisions
1. **Approach: Extend & re-partition** (confirmed). Keep the four mature, genuinely-different IA/motion shells (Control Room = book-TOC, Atlas = minimap/focus-context, Stack = expand-in-place, Stream = landmark river) and the reusable shared `assets/` architecture; extend them to cover every final-packet family; re-partition so each concept **owns** its assigned family bucket. The packet says "Use the shared product architecture but create materially different visual and motion solutions" — the four shells are the four different solutions; the `assets/` layer is the shared architecture.
2. **Deliverables layout: per-concept subfolders + root aggregate** (matching the CursorAuto / Qwen 5.8 convention — the two fully-complete siblings). Concept HTML stays at the root (no `concept-hub.json` path changes); the 6 deliverable files go into `concepts/<name>/` subfolders (`control-room`, `atlas`, `stack`, `stream`); a root `IMPACT_REGISTER.json` (`role: aggregate`, `schema_id pm.settings_concept_impact_register.v1`) indexes them via pointer fields (`register`, `coverage`, `command_delta`, `wiring_delta`, `dry_delta`, `plan_owner_delta`). This replaces the prior consolidated `IMPACT_REGISTER.json` body with per-concept bodies + an aggregate index, exactly as Qwen 5.8 does.

---

## Phase 0 — Reference prep (read-only)
- Extract `PM_Settings_Bakeoff_Final_Cumulative_2026-08-08.zip` into repo `tmp/` (already empty) for reference only; remove before finishing, do not ship/commit.
- Re-read packet sections as each subject becomes active: `03_PROVIDER…`, `04…07`, `09…10`, and the registers (`MANAGER_COVERAGE_MATRIX.json`, `CANDIDATE_COMMAND_ID_REGISTER.json`, `IMPACT_REGISTER.template.json`). Contents already captured.

## Phase 1 — Extend the shared architecture (`assets/`)

### 1a. `demo-data.js` — PAM expanded to the 17 provider fixtures + full object model
Reorganize `PM_DEMO.providers` into **Provider family → Account/Profile → Connection → Product/Entitlement → Models** with the five connection-group labels (Installed tools and signed-in apps / Connected accounts / API connections / Server connections / Free and community models). Encode all 17 fixtures from `08_CONCEPT_COVERAGE`:
1. CLI found/authenticated/ready · 2. CLI found, not signed in · 3. Multiple installations; one selected, one shadowed · 4. Unknown owner, manual-only · 5. Explicit Install from official source · 6. Update available; Ask first · 7. Update scheduled when idle · 8. Verification failed and rollback succeeded · 9. Claude CLI OAuth (CLI-owned) · 10. OpenAI PM-direct OAuth · 11. API key connection · 12. OpenCode external server · 13. Free Models row requiring underlying setup · 14. Usage unavailable but provider ready · 15. Catalog refresh with last-known-good · 16. Account priority/fallback + requested/effective · 17. Fast/Normal + effort capability variation.
Add: CLI-owned vs PM-direct OAuth boundary markers (Claude/Antigravity = CLI-owned; OpenAI/Codex, GitHub, Copilot = PM-direct), installation confidence (Proven/Strongly identified/Probable/Ambiguous/Unknown), the 9 update states, multi-account fields (nickname, identity, auth source, profile root, enabled, priority, sticky, usage/quota, last-success, health, model visibility), catalog freshness (source version, check/import/activate, validation, last-known-good, change history).

### 1b. `demo-data.js` — new family data blocks
Add `PM_DEMO` blocks for every missing family per `04–07`: notifications (8 destinations + event routing + per-event mappings + uploaded sounds w/ source/license/version/duration/hash + PeonPing/OpenPeon packs w/ format+license checks + quiet/focus), appearance (4 families × light/dark/auto, OS-following, custom TOML, inheritance, validation, live reload, fonts, UI scale, restart markers), spellcheck (automatic/system/PM-local sources, personal/project dictionaries, technical-prose, language packs; **no autocorrect**), desktop/tray/window, teacher/help, file manager/editor, formatters, commands + shortcuts, testing/debug (per-capability Auto/On/Off grid), storage/retention/recovery, backup & restore, settings lifecycle (export/import/merge/conflict/validation/migration/rollback/receipt/reset — **not** a raw format dropdown), history/sessions, runtime artifacts, source control/worktrees, GitHub Actions, containers/registries, web/search/fetch, search index, workspace cleanup, Back Seat Driver (Off/Auto/On + route/triggers/guard/latency/privacy/tools/health), and a **deferred** Server/Project-Sync insertion shell (named owners only). Wire the orphaned **Personas** manager to a real subcategory/destination.

### 1c. `managers.js` — ~18 new renderers via the existing `M.shell()` grammar
One renderer per new family, reusing the shared manager roles (header, search/filter, add/connect/create, health summary, resource list, detail/inspector, requested/effective, loading/empty/failed/unavailable/managed states, logs/receipts), specialized to its packet spec (Notifications = 7 areas + title-bar-stack-only surface rule; Storage = distinguishes internal snapshots / settings backup / project backup / full server backup / workspace cleanup; Settings Lifecycle = restore point + atomic apply + rollback + receipt; BSD = read-only-by-default, bounded deltas; Source Control = changes/history/graph/worktrees + GitHub Actions; Containers = Docker/Podman/K8s top-level + expandable detail; Server shell = deferred-owner insertion surface). Register all in `M.render`/`M.wire`.

### 1d. `icons.svg.js`, `managers.css`, `shell.css`
Add SVG icons (no emoji) for every new family. Add CSS for new component shapes (sound-library items, theme-preview swatches, notification-destination forms, storage-health, artifact rows, container cards, formatter table, command editor, shortcut recorder, testing grid, BSD meter, deferred-server cards). Keep all 8 themes stable; no left color borders; no clipped-text layouts.

### 1e. `state.js` / `shared.js`
Extend the category/subcategory taxonomy to a humanized settings map reflecting family ownership; ensure search returns the 7 result types (scalar setting / manager destination / one-shot action / read-only status / diagnostic / setup workflow / unavailable capability) visibly distinct, each routed to its canonical owner; keep scrollspy/deep-link/fuzzy-typo/persistence (`pm-glm-settings`) working across new managers.

## Phase 2 — Re-partition the four concepts (each keeps its IA shell)
Each concept keeps its distinct IA/motion shell but its **Home destinations, workspace emphasis, and full manager deep-demos target its owned family bucket**. The full settings surface stays navigable in every concept; owned families get full flows + fixtures + all states; non-owned families are reachable via shared grammar (lighter). This satisfies "collectively prove every family" + per-concept ownership + "no missing."

- **Concept 01 — Control Room (book-TOC + editorial cinematic)** → owns C1: Context & Instructions, Memory, Personas, Goal & Automation, Crew, Permissions/FileSafe, Back Seat Driver.
- **Concept 02 — Atlas (minimap + focus/context, cartographic)** → owns C2: Notifications & Sounds, Sound Library/Uploads/Packs, Appearance, Spellcheck & Dictionaries, Desktop/Tray/Window, Teacher/Help.
- **Concept 03 — Stack (expand-in-place + push/pop FLIP)** → owns C3: File Manager/Editor, Terminal, LSP, Formatters, Commands & Shortcuts, MCP, Skills, Plugins, Tools, Testing & Debug.
- **Concept 04 — Stream (landmark river + scroll-linked flow)** → owns C4: Storage & Retention, Backup & Restore, Settings Lifecycle, History & Sessions, Runtime Artifacts, Source Control/Worktrees, GitHub Actions, Containers & Registries, Web/Search/Fetch, Project Search Index, Workspace Cleanup, Future Server Module Shell (deferred).

### Required in EVERY concept
Full quiet PM shell (top + bottom bars never removed in Hub `hub=1` preview); Settings Home (4 jobs: search / primary destinations / compact actionable notices / resume recent); cross-category fuzzy search with typo handling, 7 distinct result types, deep-linkable; destination controls (Title + Purpose + optional health + clear nav affordance — **no filter pills as primary**); full Settings Workspace (one category at a time, right-side continuous doc, all 8 behaviors incl. controlled sub-jump + scrollspy + brief non-flashing focus); category/subcategory nav; deep links; the **Provider/Account/Model/Installation manager** (core, all 17 fixtures, CLI-owned vs PM-direct OAuth boundary, requested/effective routes, Free Models/catalog freshness); representative setting rows (9-state model); persistent demo state; all 8 themes (Friendly/Glass/Retro/Basic × light/dark); reduced motion (state preserved); narrow/squeezed (760px) layouts (nav collapses intelligently, forms don't clip); loading/empty/error/unavailable/managed states; compact actionable notices (3 kinds, ≤1 primary + ≤1 quiet secondary); **deterministic triggers for every required state** (reproducible buttons/keys for update-available, verification-failed-rollback, import-conflict, managed, unavailable, etc.); functional important controls (no decorative controls, no fake data).

## Phase 3 — Six deliverables per concept (in `concepts/<name>/` subfolders)
Create `concepts/control-room/`, `concepts/atlas/`, `concepts/stack/`, `concepts/stream/`. In each, write the full 6-file packet:
- `impact-register.json` — schema `pm.settings_concept_impact_register.v1`; fill all 12 arrays.
- `manager-coverage.json` — every family classified `demonstrated` (owned) / `shared_grammar` / `deferred_named_owner` (named owner + insertion contract) / `missing` (none allowed). Core present in all; each family `demonstrated` by its owner concept.
- `candidate-command-delta.json` — **census** existing IDs from `Plans/UI_Command_Catalog.md` + `Plans/Wiring_Matrix.production.json`; flag reuse/alias/supersession/conflict vs `CANDIDATE_COMMAND_ID_REGISTER.json`; retire/alias `cmd.settings.bloom.open`; distinguish setting-mutation vs one-shot action vs manager-nav; typed payload/result/error/idempotency/permission/receipt/recovery. **Provisional IDs — no canon minted.**
- `candidate-wiring-delta.json` — the 9-step trace (UI source → command → canonical owner → validation/permission → state/op → event/receipt/ObservableWork → UI projection → Usage/diagnostic attribution → recovery/deep link) per action family.
- `candidate-dry-delta.json` — DRY component-family candidates per the ~45 roles in `10_PLAN`.
- `plan-owner-delta.md` — impacts to the ~37 owner docs (FinalGUISpec, settings inventory/schema, Models System, Multi-Account, CLI Bridged Providers, Media, Prompt Pipeline, Assistant Memory, Personas, Goal Runtime, Orchestrator, Permissions, FileSafe, Commands, UI Command Catalog, MCP/Skills/Plugins/Tools, LSP, Formatters, File Manager, Testing, Worktrees/Git/GitHub, Containers/Registries, Storage, Runtime Artifacts, Release/updates, Binary Locator, …).
Plus a root **`IMPACT_REGISTER.json`** aggregate index (`role: aggregate`, same schema_id) with pointer fields into each subfolder, matching Qwen 5.8.

## Phase 4 — Folder docs + manifest
- Rewrite `README.md`, `FINDINGS.md`, `TEST_REPORT.md` against the final packet (new family partition, new deliverable layout, deterministic triggers, **no winner**). `FINDINGS.md` keeps Slint-portability risks + inventory/plan conflicts found.
- Update `concept-hub.json` entry tags from the old deep-dive partition to the final family-ownership partition (entry paths unchanged; HTML stays at root).

## Phase 5 — Test & validate (deterministic, isolated)
- `node --check` every JS asset.
- `python3 Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/glm-5-2` must pass (schemaVersion 1, valid presentation/widthControl, unique entry IDs, `data-concept-model="GLM-5.2"` on every page, `pm-concept-ready`/`pm-concept-state` bridge wired on `controlMode: standard`, no temp test artifacts).
- Launch ConceptHub on an **OS-assigned port** with an **isolated browser profile/output folder**; never stop a process I didn't start. Exercise the `09` test matrix per concept: widths 900/1280/1700/2200/2500 × shell states × 8 themes × reduced motion; and the ~20 automated probes (search+typo, destination open, deep link, sub-jump, scrollspy, back/forward, provider refresh, account/installation expansion, import preview/cancel/apply/rollback, sound upload/preview/test, theme preview/apply/fallback, keyboard focus, no clipped/overlapping text, no pointer-blocking overlay, no stuck resizer, no permanent spinner, manager lazy hydration). Verify all completion-gate fail conditions are clear.
- Write `TEST_REPORT.md` with results.

## Phase 6 — Finish
Report: concept paths; test results; known limitations (all backend simulated, no real providers/CLIs; Slint-port notes; candidate IDs provisional); the impact-register summary. **Do not recommend a winner.**

## Scope fences (will NOT touch)
PMConcept7, `Plans/**`, the Settings inventory/schema, command catalog, wiring matrix, DRY/component owners, Usage concepts, Assistant Chat concepts, or any other model's folder. Candidate IDs stay provisional; canon is not minted. Shared process rules honored: no SQLite, no Playwright terminology, no emoji (SVG only), PM-native Browser Program only, CLI-owned OAuth boundary respected, provider CLI initial acquisition stays explicit/official-source, Slint 1.17.1 portability maintained.

## Key risks I'll manage
- **Volume:** ~18 new manager renderers + 17-fixture PAM + 24 deliverable files is large; build shared grammar first, then per-concept deep demos, then deliverables, testing incrementally.
- **No clipping across themes/widths:** keep `min-width:0` flex children, media queries at 760/900, test all 8 themes × 5 widths.
- **Deterministic state coverage:** every required fixture/state gets an explicit trigger so the test matrix is reproducible.
- **Don't over-build deferred owners:** Server/Project Sync/Updates/Onboarding/Doctor/Deployment stay insertion shells with named owners — no invented state machines.