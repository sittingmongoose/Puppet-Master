# Plan-Owner Delta — Concept 02 Atlas (GLM-5.2)

Provisional per-owner impact blocks for audit adjudication. Atlas does not edit canon; it records what each owner doc must reconcile when the Settings redesign compiles. Each block carries `gui_related` per the PlanUnit metadata rule. The four headline product rules this concept enforces are flagged inline: **title-bar-only notification surface**, **no-autocorrect**, **custom-TOML schema validation + fallback**, and **OS-following (Auto)**.

IA summary: Atlas is the spatial/cartographic concept — destinations are bounded regions sized by content density, the workspace is focus+context with a minimap rail + viewport rail, and search is a Cmd+K overlay that dims the map.

---

### impact — Plans/FinalGUISpec.md (F3-432..447)

`gui_related: true`

Atlas demonstrates the search-first Settings surface (F3-432) as a cartographic atlas and the setting-row grammar (F3-438) across all six C2 regions. Required reconciliations:

- **F3-432 / F3-433 (search-first surface + attention notices):** the title-bar notification stack is the **sole in-app notification surface**. The Notices band (needs-attention / continue-setup / recommended) must NOT spawn a bottom-right stack, status-bar bell, Activity Bar notification shortcut, or a dedicated Notifications side panel. The notice model (one stable status treatment, one actionable headline, one short reason, at most one primary + one quiet secondary action) is preserved.
- **F3-434 (deep-link):** the category-bloom modal behind `cmd.settings.bloom.open` is superseded in this concept by region/minimap navigation. The deep-link + focus-highlight semantics are preserved (controlled jump, flash-highlight, reduced-motion opens without the morph). Supersession, not removal.
- **F3-438 / F3-439 / F3-440 / F3-441 (setting-row grammar, instant apply, wiring map, inventory registry):** the nine explicit value states (Default/Recommended/Inherited/Auto/Not configured/Managed/Custom/Unavailable/Effective differs) must be representable. Auto/Inherit/Not configured/Disabled never render as an empty string.
- **Theme selector model:** family + mode (Friendly/Glass/Retro/Basic × Light/Dark/Auto) supersedes any 8-flat-enum rendering of `general.visual.theme`. The 8 inventory options are valid lineage, grouped not flattened.
- **OS-following:** Auto mode tracks OS `prefers-color-scheme` live and switches without restart.

`action: record + adjudicate at compile; do not edit canon from this concept`

---

### impact — Plans/settings_inventory.json + Plans/settings_inventory.schema.json (F3-441)

`gui_related: true` (for the inventory rows and their UI projection) / `gui_related: false` (for the schema extensions)

Inventory census findings and required changes:

- **Missing spellcheck rows (add):** the census shows ZERO spellcheck/dictionary rows. Add a `general.spellcheck.*` namespace: check-spelling on/off, language (Automatic), dictionary source (Automatic/system-only/PM-local-only), personal dictionary manage, project dictionary use/manage, check-technical-prose, underline-unknown-names, language packs, thread/project overrides. **NO autocorrect row** — grammar/style is a separate opt-in provider-backed feature.
- **`general.visual.theme` (reinterpret):** 8-value select → group under family/mode model. Invalid values that do not resolve under family/mode must be flagged during migration.
- **`general.interaction.notification-destinations` (extend to structured object):** model up to 8 destinations as a structured object graph, not a scalar.
- **`general.interaction.sound-catalog` / `sound-management` (extend):** back the Sound Library resource manager with asset metadata.
- **Missing desktop/tray/window rows (add):** launch-destination, tray-automation-badge, activity-bar reorder/hide/overflow, side-panel restore are not inventoried.
- **Missing teacher/help action (add):** explain-current-screen is a new candidate action distinct from the existing `general.interaction.mode`/`show-tooltips`/`explain-disabled` toggles.

Schema extensions (machine-readable, `gui_related: false`):

- `notification_destination_object` (kind enum of 8, destination_config, credential_ref as SecretReference, enabled, last_test_receipt_ref)
- `sound_asset_metadata` (source, license, version, duration_seconds, sha256, default_mapping_event, pack_ref, verification_state)
- `custom_theme_descriptor` (base_theme, family, mode, token_overrides, schema_version, schema_validation_result valid/invalid_with_fallback, fallback_theme_id, inherited_tokens)
- `dictionary_source_descriptor` (source_kind automatic/system_only/pm_local_only, resolved_source, language, path_or_ref, personal_words, project_words)
- `setting_value_state_enum` (nine states)
- `tray_window_lifecycle` group namespace

`action: add missing rows; extend schema with v1 backward compatibility`

---

### impact — Plans/Media_Generation_and_Capabilities.md

`gui_related: false`

Uploaded sound assets are user-supplied audio, NOT generated media. They must NOT be modeled under `media.image` / `media.video` / `media.tts` / `media.music` capability flags, and must NOT appear in the `agy models` media/capability matrix.

- The sound-asset provenance field shape (source, license, version, duration, hash) parallels the generated-media artifact provenance fields but lives in the sound-library domain.
- No `MultimodalInputSettlement` is involved for sound uploads (that is for model-visible image/PDF/audio/file attachments entering model context).
- Cross-reference the shared field names only; do not unify the storage namespaces.

`action: keep sound-library uploads out of generated-media capability matrix; cross-reference provenance field shapes only`

---

### impact — Plans/UI_Command_Catalog.md (UCC-103, UCC-108)

`gui_related: true`

Atlas reuses existing canonical command families verbatim and flags one supersession plus several greenfield candidates. (Full per-candidate semantics in `candidate-command-delta.json`.)

- **Reuse unchanged:** `cmd.theme.set_mode/set_accent/set_density/preview/reset` (UCC-108); `cmd.notifications.destination.create/update/delete/toggle/test`, `cmd.notifications.mapping.update`, `cmd.notifications.override.set` (UCC-103); `cmd.sound.preview/upload/pack.import/asset.delete/asset.restore/asset.export/mapping.set` (UCC-103); `cmd.model.refresh/list`, `cmd.account.select_profile`, `cmd.provider.switch_route`, `cmd.usage.refresh/export`, `cmd.onboarding.free_models.*`; `cmd.settings.open_notifications`, `cmd.settings.open_storage_retention`.
- **Supersede:** `cmd.settings.bloom.open` → atlas region/minimap navigation (deep-link + focus-highlight semantics preserved; compatibility alias only if external callers depend on it).
- **Domain boundary (not a collision):** `cmd.alert.acknowledge/snooze/dismiss/open_source/mute_rule` (UCC-108) own the ATTENTION ALERTS/CONCERNS system; `cmd.notifications.*` own DELIVERY ROUTING. Atlas aliases neither to the other.
- **Naming hazard (not a collision):** `cmd.orchestrator.pause/resume` are RUN-scoped; app tray Pause/Resume/Quit are app-lifecycle and need a distinct `cmd.app.*` namespace.
- **New candidates (no canon found):** `cmd.theme.create/import/export/open_folder`; `cmd.sound.asset.replace`; `cmd.spellcheck.dictionary.add/remove/import`, `cmd.spellcheck.source.set`; `cmd.settings.manager.open`, `cmd.settings.region.select`; `cmd.provider.installation.scan/verify/rollback`, `cmd.provider.connection.reconnect`; `cmd.app.tray.minimize`, `cmd.app.quit`, `cmd.app.window.state.restore`; `cmd.teacher.explain_screen`.

`action: adjudicate new candidate IDs; record bloom supersession; preserve alert-vs-notification boundary`

---

### impact — Plans/Commands_System.md

`gui_related: false`

Command normalization for atlas navigation (region select, minimap pan, scrollspy jump, manager open) must carry `route_target` + `OpenSubject` + `panel-context` per the route/open contract.

- Setting-toggle rows remain registry-owned non-command values (F3-438/F3-439/F3-441). Atlas never turns a setting toggle into a `cmd.*` dispatch and never emits a fabricated `*.command_applied` event.
- One-shot actions (test-send, sound preview, pack import, theme preview/apply, installation scan/verify, reconnect, tray minimize/quit, teacher explain) are commands with typed payload, result, closed error codes, idempotency/revision, permission, receipt, and recovery semantics.
- The closed error-code set (`invalid_route`, `unknown_command`, `invalid_args`, `permission_denied`, `blocked_state_required`, `stale_projection`, `handler_unavailable`, `internal_error`) is respected; domain-specific disabled reasons (e.g. `rate_limited`, `verification_failed`, `format_unsupported`, `license_missing`, `auth_missing`, `auth_expired`, `provider_unavailable`, `unsaved_buffers_blocked_quit`, `tray_unavailable`, `dictionary_unavailable`, `teacher_unavailable`) are owner-scoped additions, not replacements.

`action: ensure atlas nav normalizes to route/open; setting rows stay non-command`

---

### impact — Notifications & Sounds owner (Plans/FinalGUISpec.md notification section + UCC-103)

`gui_related: true`

- **Title-bar-only notification surface (headline rule):** the title-bar notification stack/count/sprout inbox is the sole in-app notification affordance. Retire any bottom-right stack, status-bar bell, Activity Bar notification shortcut, or dedicated Notifications side panel.
- 8 destinations: in-app title-bar stack, system/tray, Slack, Discord, generic webhook, ntfy, Pushover, Telegram. Destination forms include channel/thread, mentions, headers, templates, success predicates, priority, tags, click target, parse mode, retry, device selection. Secrets as refs only.
- Event routing covers blocked work, approval needed, completion, failure, and advisory events. **Sound cannot be the only indication** of failure, blocked work, approval, or completion.
- Test-send is explicit, masked, rate-limited, and receipted (`cmd.notifications.destination.test`).
- Quiet/focus behavior via `cmd.notifications.override.set`.

`action: enforce sole-surface rule; mask + rate-limit + receipt test-send`

---

### impact — Sound Library owner (UCC-103 sound commands)

`gui_related: true`

- Built-in + uploaded sounds with source/license/version/duration/hash metadata and default mapping.
- PeonPing/OpenPeon-compatible pack import requires format + license checks. **Unverified packs are never bundled.**
- Preview is **local-only** — never routes through external notification delivery.
- Master volume, import/export, delete/replace. Replace preserves mappings or remaps explicitly.
- **Slint port:** no DOM `<audio>`; production needs a PM-local audio playback abstraction bound to `SoundLibraryItem`.

`action: gate packs on format+license; keep preview local; plan PM-local audio service for Slint`

---

### impact — Appearance owner (UCC-108 cmd.theme.* + inventory visual rows)

`gui_related: true`

- Beyond 8 themes: 4 families (Friendly/Glass/Retro/Basic) × Light/Dark/Auto.
- **OS-following (headline rule):** Auto follows the operating system appearance (`prefers-color-scheme`) and switches live when the OS setting changes — no restart.
- **Custom TOML schema validation + fallback (headline rule):** schema validation on create/import; invalid TOML falls back to a named base theme and surfaces a diagnosis row (`schema_validation_result: invalid_with_fallback`, `fallback_theme_id`). Base-theme inheritance. Startup load + live reload both resolve fallback at load time, not first paint.
- Custom + fallback fonts; UI scale; restart markers where a token (e.g. font) requires restart; create/import/export/open-folder; live hover preview; theme-specific locked/unavailable rows.
- **Slint port:** precompile theme token sets; no runtime CSS `var()`/`color-mix()` chains (per F3-431). Glass themes bake one backdrop blur over a pre-baked wallpaper; opaque-plate fallback for the refresh overlay.

`action: enforce schema validation + fallback; OS live follow; precompile tokens for Slint`

---

### impact — Spellcheck & Dictionaries owner (greenfield — no existing canon)

`gui_related: true`

- Dictionary sources: Automatic (OS service then PM local) / system-only / PM-local-only.
- Personal + project dictionaries as **separate scopes**. Technical-prose toggle, underline-unknown-names, language packs, thread/project overrides.
- **No-autocorrect (headline rule):** there is NO autocorrect. Grammar/style assistance is a **separate opt-in provider-backed feature** with privacy, route, cost, and Usage disclosure — off by default; turning it on shows the disclosure before any route is taken. Atlas demonstrates the disclosure surface and opt-in gate; the provider-backed grammar engine is wired later by its owner (deferred_named_owner).
- **Slint port:** concept uses the browser `spellcheck` attribute to simulate underlines; production needs a portable spelling-service abstraction. NO autocorrect behavior is ported.
- Command candidates: `cmd.spellcheck.dictionary.add/remove/import`, `cmd.spellcheck.source.set` (all `new_candidate` — no canon found).

`action: add missing inventory rows; keep grammar/style behind separate opt-in disclosure; plan spelling-service trait for Slint`

---

### impact — Desktop/Tray/Window owner (inventory general.interaction + general.startup)

`gui_related: true`

- Minimize-to-tray, tray-while-automation badge, Pause/Resume/Quit, launch destination, window/panel/tab restore, crash recovery, unsaved-buffer protection, activity-bar reorder/hide/overflow, side-panel restore, editor/tab/tree limits.
- App-level tray Pause/Resume/Quit are distinct from run-scoped `cmd.orchestrator.pause/resume` — separate `cmd.app.*` namespace (naming hazard only, not a semantic conflict).
- Command candidates: `cmd.app.tray.minimize`, `cmd.app.quit`, `cmd.app.window.state.restore`, `cmd.app.activity_bar.configure` (all `new_candidate`).
- Inventory gaps: launch-destination, tray-automation-badge, activity-bar overflow, side-panel restore are not inventoried — add them.

`action: add missing inventory rows; keep app-tray lifecycle distinct from orchestrator pause`

---

### impact — Teacher/Help owner (greenfield — no existing canon)

`gui_related: true`

- Explicit Teacher assistance beyond tooltips: explain-current-screen, guided transitions into real actions, tooltip detail at hover and keyboard focus.
- Teacher can explain the Notifications region and transition safely into opening a destination.
- Command candidate: `cmd.teacher.explain_screen` (`new_candidate` — no canon found; distinct from `cmd.alert.open_source` which routes to an alert source).
- Reuses the existing `general.interaction.mode` (Explain Things To Me), `show-tooltips`, `explain-disabled` toggles; adds the explain-current-screen action.

`action: adjudicate cmd.teacher.explain_screen; keep distinct from alert.open_source`

---

### impact — Provider/Account/Model/Installation owner (UCC-108 + packet 03)

`gui_related: true`

- Full object model (Provider family → Account/Profile → Connection → Product/Entitlement → Models/capabilities; Host/Environment → Installation). Never a flat list.
- 7 installation lifecycle fixtures demonstrated: CLI found/authed/ready; CLI found not signed in; update available (Ask first); verification failed + rollback succeeded; multiple installations one selected one shadowed; unknown owner manual-only; Free Models needs setup.
- Confidence levels: Proven / Strongly identified / Probable / Ambiguous / Unknown. Ambiguous/unknown ownership is manual-only — never guess npm/Homebrew from a bare command or path shape.
- Update states: Update available / Waiting for work to finish / Updating / Verifying / Ready / Verification failed / Rolled back / Needs repair / Managed externally / Could not identify installation method.
- **CLI-owned OAuth boundary (headline rule):** Claude CLI and Antigravity CLI OAuth are CLI-owned. PM can isolate profiles and launch the native flow; it does NOT present PM-direct OAuth for these. PM-direct OAuth only for supported routes (OpenAI/Codex, GitHub, Copilot). API connections stay separate from subscription/CLI products.
- Requested/effective routes; Free Models is a wrapper over underlying routes (owns no credentials/quota/switching/Usage); catalog freshness with last-known-good fallback.
- Command reuse: `cmd.model.refresh/list`, `cmd.account.select_profile`, `cmd.provider.switch_route`, `cmd.onboarding.free_models.*`. New candidates: `cmd.provider.installation.scan/verify/rollback`, `cmd.provider.connection.reconnect`.

`action: respect CLI-owned OAuth boundary; never infer Fast mode/modalities from names; hold last-known-good during refresh`

---

### impact — Plans/Wiring_Matrix.production.json

`gui_related: false`

- New wiring rows required for the `new_candidate` commands above, each with stable `cmd.*` ID, sole handler, payload/result authority, and receipt/event effect — pending catalog adjudication.
- Setting-toggle wiring continues to flow through the registry/wiring map as non-command values (F3-440).
- No concept-only local state may masquerade as production wiring. The 9-step trace contract applies to every Atlas user action (see `candidate-wiring-delta.json`).

`action: add wiring rows after catalog adjudication; preserve non-command setting-toggle wiring`

---

### impact — Plans/Contracts_V0.md (UICommand + route/open)

`gui_related: false`

- Every Atlas command returns the `UICommandResponse` envelope (`schema_version`, `dispatch_id`, `command_id`, `ack_status`, `result_status?`, `error?`, `event_refs[]?`, `receipt_ref?`, `ts`).
- Route/open wrappers carry `route_target` + `OpenSubject` + `panel-context` (`project_id`, `repo_id?`, `worktree_id?`, `branch_ref?`, `run_id?`, `subview?`, etc.).
- No fabricated `*.command_applied` events; commands that emit no persisted domain event still record a dispatch receipt or route/open disposition.

`action: align new candidate commands with UICommandResponse + route/open contract`

---

## Summary of headline product rules enforced by Atlas

1. **Title-bar-only notification surface** — the title-bar stack is the sole in-app notification affordance; no bottom-right stack, status-bar bell, Activity Bar shortcut, or dedicated side panel.
2. **No-autocorrect** — spellcheck never autocorrects; grammar/style is a separate opt-in provider-backed feature with privacy/route/cost/Usage disclosure.
3. **Custom-TOML schema validation + fallback** — invalid custom themes fall back to a named base theme and surface a diagnosis row; startup load + live reload both resolve fallback at load time.
4. **OS-following (Auto)** — theme Auto mode tracks OS `prefers-color-scheme` live without restart.

## Boundary rules preserved

- CLI-owned OAuth boundary respected (Claude/Antigravity); PM-direct OAuth only for supported routes.
- PM-native Browser Program only; no Playwright terminology/runtime.
- No SQLite; events/receipts/audit in file/JSONL/kv.
- Provisional IDs only; no canon minted from this concept.
