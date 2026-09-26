# Sound consumer — Project-scoped binding and no-Project preview

Implements the recorded consumer correction from [the packet review](../concept-packet-integration-20260926/gui-owner-alignment.md): the selected onboarding prototype used app-local sound persistence with an on default; the canonical Settings-owned row `general.interaction.sound-effects` (toggle, default `false`, "Off by default" — inventory snapshot `:944-948`) is Project-scoped and the no-Project onboarding is a session-only preview. Closure item `sound`. Concept/static results only — this is not native runtime proof.

## Producer changes and reviewed follow-up

**`Concepts/onboarding/opus-5.5/src/js/15-sound.js`** — replaced the `pm.o55.sound` localStorage persistence and the unreachable `PM12_KIMI.setSettingFromHost` fire-and-forget call with a Project-owned binding. All synth kits, music, test hooks (`log`, `tap`, `renderWav`), `play/toggle/buttonHtml` signatures and the visual control are unchanged.

- Read: with a verified current Project (`PM7_SETTINGS_TOME.project()`, the same gate the owner's own chrome writes use), the value is read per Project via `PM7_SETTINGS_TOME.projectSnapshot(project_id)` — the tome's public read, which routes through `PM_SETTINGS_REGISTRY.getProjectSnapshot` when an owner registry is attached. Missing row, non-boolean value, unavailable or async projection all read as the default (off), matching the owner's own no-projection behavior.
- Write: only with a verified Project and a reachable dispatch — `PM12_KIMI.setSettingFromHost('general.interaction.sound-effects', value, false, false)`, the owner's real per-setting transaction whose boolean result is the acceptance receipt (`rerenderView=false`/`syncRelated=false`, the same convention as the look chrome writes). Rejected, throwing, or thenable results fail closed: the control stays at its last owner-verified state and announces `outcome: "rejected"` on the `o55:sound` event; no local guess is ever applied. No-Project never calls the write at all (so no misleading owner warning toast).
- Preview: no Project → the toggle changes memory only, persists nothing anywhere (localStorage is no longer touched by this module at all). An unbind (Project falls away) resets to the canonical default, never the previous Project's value; staying unbound keeps the session's preview.
- Rebind: `O55.sound.refresh(source)` re-reads and reflects the current binding silently. It runs at load, at DOMContentLoaded, in `95-boot.js start()` before any window/tour bar renders, on Project switches via MutationObservers on the exact surfaces the Settings owner's own `reloadOnProjectChange` watches (`#projectMenuLabel` text, `#projectMenu` selection classes, 40 ms debounce), and at every Guided Tour step. A synchronous owner write that reentrantly changes or removes the Project is rejected for the old binding and rebound. `O55.sound.binding()` exposes the current Project binding `{project_id, enabled}` (unavailable snapshots use the conservative off fallback) for tests.
- The shared-chrome buttons (onboarding header, tour bar) are synced in place (`aria-pressed`, `aria-label`, `title`, wave paths) so a rebind without a click still renders exactly what `buttonHtml` would, without touching the click-routing attributes (`data-o55-do` vs `data-o55t`).

**`20-store.js`** — contract comment updated: sound is deliberately not among the persisted keys.

**`80-tour-core.js`** — one line in `goStep`: per-step `O55.sound.refresh('tour')` so a mid-tour Project switch (or a resume onto a different Project) can never leave the control on a previous Project's value.

**`95-boot.js`** — `start()` rebinds before the first window render (boot-order backstop).

**`05-notifications.js`** — owned only if needed; **not needed, unchanged**. The canonical row renders through the standard placement pipeline (`placement.json` section `notif-sound-defaults`, "Sound defaults", Sounds tab) straight from the inventory row, which already carries default `false`; the manager hardcodes nothing.

Commit promotion: unchanged and implicit-free. `O55.finish`/`commitLook` promote only the look through the tome when a Project exists; sound is never written at commit — the new Project keeps its own (default off) value and the control re-reads it at bind.

## Publication status

Authored sources and the sound probe are complete and independently reviewed. Generated pages will be rebuilt together after the other source lanes settle; the final browser/audio check is still pending. The old 24-case producer stub was superseded by the retained 30-case harness below.

Independent review found and root repaired stale consumption between a synchronous Project switch and the debounced observer. The sound entry, toggle and button renderer now refresh synchronously; `74-screens-ready.js` refreshes at Project selection before starting the Tour. Settings row click/change commits refresh mounted sound controls after their event settles. A write returning after reentrant Project removal is rejected as stale. These are concept bindings, not native subscriptions or runtime proof.

## Review repairs and focused verification

The original 24-case producer harness was strengthened with an owner stub that updates its snapshot on accepted writes, plus immediate Project-switch playback, switch-to-no-Project during the synchronous write, same-Project rendering, Settings commit notification, toggle and playback cases. All 30 checks pass. The stale `sound_render.mjs` live probe now explicitly enables sound for its audio sample and records the Project binding instead of calling a nonexistent getter; reload reads the owner value. The browser/audio probe itself remains part of final publication validation, not proof from the stub.

- Evidence: `/mnt/Cursor/PuppetMaster-Evidence/scratch/packet-integration-completion-20260926/sound/harness.mjs`, SHA-256 `54cd9b14962566717588df10b8d87f69cc90b5a8649e9ff54a8e4ee2b59d9534`.

- Evidence: `/mnt/Cursor/PuppetMaster-Evidence/scratch/packet-integration-completion-20260926/sound/checks.txt`, SHA-256 `4bb585e59c2c417c469c2d55f92b4cd34a66932868ba562aaebfb13ebdf40b45`.

Focused independent rereview passes after the repairs (30/30 checks and JavaScript syntax checks). Missing or asynchronous snapshots mean a conservative off fallback, not a verified owner value. Final publication/browser validation remains pending.
