# c2 Mission Control — plan-owner delta (final cumulative packet, 2026-08-08)

Concept register only. Nothing here edits canon; the audit agent adjudicates.

## Owners touched by this concept's assignment

- **FinalGUISpec.md — Notifications & Sounds canon (F3-460/461).** The destinations
  board + event routing matrix is the proposed canonical shape: eight delivery
  kinds (in-app title-bar stack, system, Slack, Discord, generic webhook, ntfy,
  Pushover, Telegram), per-kind config with vault-reference secrets, a
  6-event × destination matrix with exactly `always / when-unfocused /
  failures-only / never`, and per-event sound mapping. Canonical location:
  **General › Notifications & Sounds**.
- **FinalGUISpec.md — Theme canon (F3-425/444).** Custom TOML themes with
  base-theme inheritance, schema-versioned validation, live reload, line-level
  diagnosis, fallback-to-base, restart markers, live hover/focus preview, and
  glass-only rows that lock/unlock live with the active theme.
- **Media_Generation_and_Capabilities.md.** Media routes console retained here
  as a beyond-assignment extra; native vs PM-transformation identity and
  fallback routing must reconcile with the media capability tables.
- **settings inventory / settings schema.** New resource types (destinations,
  routing matrix, sound assets/packs, theme files) do not fit scalar rows;
  census against inventory positions 817–826 before minting ids.
- **Models_System.md.** Capability chips only from catalog + evidence (Haiku
  fastNote is the counter-example); requested/effective via PMProvider.
- **Multi-Account.md.** Auth boundary chip per provider; account cards keep the
  isolation vocabulary; no simultaneous-profile pretense.
- **CLI_Bridged_Providers.md / Binary Locator.** Installations sub-console:
  confidence-gated actions, seven-point verification (exit code is never
  success), Ask-first updates, waiting-idle, verification-failed → rolled-back
  history, unknown-owner manual-only, explicit official-source acquisition
  (cursor-cli) with exact host/environment and install ≠ sign-in.
- **Provider_OpenCode.md.** External server card: serverInfo, server-supplied
  catalog, scoped vault token; the server owns provider credentials.
- **Wiring_Matrix.** Ten traces in `candidate-wiring-delta.json`, all
  `concept_local_state: true`.
- **Release / updates owner.** Theme assets and bundled sounds ship with
  license/version/hash provenance; **unverified packs are never bundled or
  enabled** — the license gate is a release-pipeline invariant surfaced in
  Settings, not a Settings-only rule.

## Supersessions this concept depends on

1. **Chip/bloom Settings contract** — retired; `cmd.settings.bloom.open`
   retires or aliases into `cmd.settings.open`.
2. **Stale right-side-panel language** — the Activity Bar is the left icon
   rail controlling one adjacent left side-panel slot; the Desktop console's
   Activity Bar board and its copy assume the corrected canon.
3. **Notification surface consolidation** — retire the permanent bottom-right
   toast stack, the status-bar bell, any Activity Bar notification shortcut,
   and the dedicated Notifications side panel. The **title-bar stack/count/
   sprout inbox is the sole in-app notification affordance**; `dest-test`
   results land there and nowhere else.
4. **Legacy access-mode naming** — access modes are Full Access / Auto /
   Auto accept edits / Ask for approval. The shared demo data still carries one
   banned-word sentence; this concept sanitizes at render time and records the
   defect for the shared-data owner (fix belongs upstream, not in concepts).

## Boundary confirmations (behavior locked in this build)

- **Preview is local-only; test-send is explicit.** `sound-preview` emits op
  phases and **no receipt**; `dest-test` is explicit per destination, masked,
  rate-limited (1/30s), receipted, and persists `lastTest` on the card. The
  asymmetry is intentional and command-level, not cosmetic.
- **Sound is never the only failure signal.** `run.failed` keeps its matrix
  note; the stack entry and routed destinations always accompany any sound.
- **Title-bar stack is the sole in-app affordance** — the console carries the
  surfaceRule copy, and no new in-app surface was added.
- **Secrets are vault references only.** Destination editors offer choose or
  create-in-vault; reveal/copy do not exist; deleting a destination never
  deletes its vault reference.
- **Unverified packs are never bundled or enabled.** The OpenPeon Vol. 2 import
  ends blocked with a receipt; the format gate (warcraft-rip.zip) rejects
  before the license gate runs.
- **Invalid themes never half-apply.** Cobalt Mono's base theme stays in effect
  until line 41 is fixed and a reload validates.
- **Teacher hands off, never acts.** The guided Slack topic opens the real
  add-destination form with the workspace field focused; submission stays with
  the user.
- **Crew is proven in Atlas.** This concept removed its native Crew console and
  ships an honest receipt station + workspace receipt panel linking
  `c1-atlas.html#/manager/manager.crew`; a stale persisted view naming the old
  console falls back to Home.
