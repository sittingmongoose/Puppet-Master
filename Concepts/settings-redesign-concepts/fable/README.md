# fable — Puppet Master Settings bakeoff (final cumulative pass)

Four genuinely different interactive Settings redesign concepts for Puppet Master, upgraded to the
final cumulative Settings packet (2026-08-08). Model identity: `fable`. Every page renders inside a
quiet fake PM shell (title bar with the notification stack, activity rail, Assistant panel, status
bar) and carries `data-concept-model="fable"`.

All four concepts replace the current chip-and-modal Settings with the packet's three-surface
architecture: a search-centric Settings Home, a one-category-at-a-time Settings Workspace with a
continuous subcategory document (jump + scrollspy + deep links), and dedicated Managers. They share
one demo dataset, one semantics layer, and one provider-behavior resolver — and deliberately share
nothing else: layout, navigation, editing model, manager relation, and motion are different in each.

## How to view

Via ConceptHub (recommended — width slider, theme sync, reduced motion):

```bash
python3 Concepts/ConceptHub/server.py --port 0 --no-browser
```

Open the printed `http://127.0.0.1:<port>` URL, pick the Settings Redesign topic, then the fable
entries. Or open any page directly — each concept is self-contained:

- `c1-atlas.html` · `c2-mission-control.html` · `c3-focus-stack.html` · `c4-ledger.html`
- `index.html` (gallery/comparison surface)

No build step, no external libraries. The Google Fonts stylesheet link is the only external
resource; on a blocked network the pages fall back to system fonts and remain fully functional.

## The four concepts and their manager coverage

Each concept proves the core group natively — Settings Home, search, full Workspace,
Provider/Account/Model/Installation manager (installations, update lifecycle, auth boundaries,
Free Models states, requested/effective routes), and ordinary setting-row grammar — plus one of the
packet's four family groups. Families a concept does not own appear as honest cross-concept
receipts that link to the owning page.

| Concept | Identity | Native manager families |
|---|---|---|
| **c1 Atlas** | Reference manual — numbered sections, marginalia, appendices; "Typesetting" motion | Context & Instructions, Memory, Personas, Goal & Automation, Crew, Permissions & FileSafe, Back Seat Driver |
| **c2 Mission Control** | Operational console — health strip, triage stack, Cmd/Ctrl-K palette, minimap; "Instrumental" motion | Notifications & Sounds, Sound Library/uploads/packs, Appearance (incl. custom TOML themes), Spellcheck & Dictionaries, Desktop/Tray/Window, Teacher/Help (+ Media, beyond assignment) |
| **c3 Focus Stack** | Layered sheets — one live surface, visible layer spine, disclosure is navigation; "Spatial continuity" motion | File Manager/Editor, Terminal, LSP, Formatters, Commands & Shortcuts, MCP, Skills, Plugins, Tools, Testing & Debug |
| **c4 Ledger** | Object browser — records + persistent right inspector, query bar, state chips; zero motion by identity | Storage & Retention, Backup & Restore, Settings Lifecycle (transactional import/rollback), History & Sessions, Runtime Artifacts, Source Control/Worktrees, GitHub Actions, Containers & Registries, Web/Search/Fetch, Search Index, Workspace Cleanup, Future Server Module Shell |

## Folder map

```
Concepts/settings-redesign-concepts/fable/
  concept-hub.json          ConceptHub manifest (width role "page", 760-2500)
  index.html                gallery/comparison surface
  CONTRACT.md               binding shared API + conventions (revision 2)
  _shared/
    pm-shell.css            8-theme token layer + quiet shell + notification stack
    pm-shell.js             shell hydration, theme menu, title-bar notification
                            stack + sprout inbox, ConceptHub bridge, applyView
    pm-icons.js             inline SVG icon set (no emoji anywhere)
    pm-demo-data.js         frozen 2026-08-05 base dataset
    pm-demo-data-ext.js     final-packet extension: installations + update
                            lifecycle, auth boundaries, OpenCode server,
                            Free Models states + catalog freshness, and 24 new
                            collections (notifications/sounds/appearance/desktop/
                            teacher/fileManager/formatters/testing/storage/
                            backups/lifecycle/history/artifacts/sourceControl/
                            actions/containers/web/searchIndex/cleanup/server
                            topology + modules/BSD/goal/permissions)
    pm-provider.js          DOM-free provider semantics (single source of the
                            update/free-route/auth-boundary state strings)
    pm-state.js             store + semantics resolvers + 8 scenarios + 12
                            fixture overlays + trigger registry + receipts +
                            States drawer + shared search + manager manifests +
                            the deterministic hash route contract
    pm-scrollspy.js         section-registry scrollspy + deep-link reveal
    pm-spell.js             demo spellcheck service
  c1-atlas.html/.css/.js        + c1-atlas/          (six register files)
  c2-mission-control.html/.css/.js + c2-mission-control/ (six register files)
  c3-focus-stack.html/.css/.js  + c3-focus-stack/    (six register files)
  c4-ledger.html/.css/.js       + c4-ledger/         (six register files)
  README.md                 this file
  FINDINGS.md               IA choices, reassignment map, conflicts, Slint risks
  IMPACT_REGISTER.json      roll-up index over the four per-concept registers
  TEST_REPORT.md            verification results for this pass
```

Each per-concept register folder contains exactly: `impact-register.json`,
`manager-coverage.json`, `candidate-command-delta.json`, `candidate-wiring-delta.json`,
`candidate-dry-delta.json`, `plan-owner-delta.md`. Candidate IDs are provisional; canon is never
minted here.

## Exploring the required states

- **States drawer** (bottom-right on every page): eight scenarios — Baseline, Calm,
  Attention-heavy, Usage exhausted, Invocation failed, Managed workspace, **First run** (systematic
  empty states), **Offline** (systematic unavailable with last-known-good catalogs) — twelve
  composable fixture overlays, and the full trigger registry grouped by family (installations,
  settings lifecycle, sounds and notifications, appearance, storage and index, tools, safety and
  help).
- **Shell controls:** the title bar hosts the notification stack (test-sends land there — it is
  the sole in-app notification affordance), rail/Assistant toggles, reduced motion, and the
  eight-theme menu.
- **Widths:** owned by the ConceptHub slider (presets 760 / 900 / 1280 / 1700 / 2200 / 2500);
  every concept has an explicit narrow mode.

## Deterministic fixtures (URL cookbook)

Every required state is reachable without any UI interaction:

```
<page>.html[?hub=1]#/<route>?<params>
route  := home | dest/<domain>[/<sub>] | manager/<managerId>
        | setting/<settingId> | search/<query>
params := scenario=<id> & fixture=<id>[,<id>…] & trigger=<name>[:<ref>][,…]
        & focus=<id> & instant=1 & pin=1 & theme=<themeId> & motion=reduced
```

URL-applied state is ephemeral unless `pin=1`; `instant=1` makes staged transitions settle
immediately (probe mode). Pages stamp `data-pm-state="ready"` on `<html>` when the link is fully
applied. Examples:

```
c1-atlas.html#/manager/manager.permissions?trigger=permission-test&instant=1
c1-atlas.html#/manager/manager.bsd?fixture=fx.doom-loop-tripped
c2-mission-control.html#/manager/manager.notifications?fixture=fx.validation-error&focus=dest.webhook
c2-mission-control.html#/manager/manager.sounds?trigger=sound-upload,pack-import:pack.openpeon-vol2&instant=1
c2-mission-control.html#/manager/manager.appearance?fixture=fx.theme-fallback
c3-focus-stack.html#/manager/manager.mcp?fixture=fx.reconnect-required
c3-focus-stack.html#/manager/manager.formatters?trigger=formatter-test:fmt.prettier&instant=1
c4-ledger.html#/manager/manager.lifecycle?fixture=fx.import-conflict
c4-ledger.html#/manager/manager.lifecycle?trigger=import-preview,import-apply,import-rollback&instant=1
c4-ledger.html#/manager/manager.providers?trigger=install-update:openai-codex/inst.codex.npm&instant=1
c4-ledger.html#/manager/manager.providers?trigger=install-update-fail:copilot/inst.copilot.ghext&instant=1
c4-ledger.html#/manager/manager.cleanup?trigger=cleanup-dry-run&instant=1
<any page>#/setting/system.health.diagnostics-verbosity        (canonical deep-link probe)
<any page>#/search/notifcations                                 (typo probe)
<any page>#/search/flux%20capacitor                             (no-results probe)
<any page>#/home?scenario=first-run                             (systematic empty)
<any page>#/home?scenario=offline                               (systematic unavailable)
```

Provider fixtures 1–17 from the packet are all present in the shared dataset: Claude ready with
three installations (npm selected, Homebrew shadowed/managed-externally, TrueNAS Tool Store);
Antigravity signed-out and waiting-idle; Codex update-available (Ask first); Copilot
verification-failed → rolled back; Ollama unknown-owner manual-only with usage unavailable but
provider ready; Cursor CLI explicit official-source install offer; OpenCode external server;
Free Models rows in all six states with catalog freshness and change history; requested/effective
divergence on the batch-reviewer role; Fast/effort capability variation with evidence.

## Honesty about simulation

This is a design prototype over demo data. Nothing performs real OAuth or CLI sign-ins, installs
anything, spends money, stores credentials, plays audio, or calls providers. Every action that
cannot truly run returns a visibly labeled simulated receipt — there are no silent no-ops. Sound
preview is local-only by design and produces no receipt; destination test-sends are explicit,
masked, rate-limited, and receipted. Staged transitions mutate only the in-page demo store. The
only persistence is UI preferences, scenario/fixture selections, and demo dictionary additions,
confined to the `pm.settingsConcepts.fable.*` localStorage namespace. `FINDINGS.md` lists the full
simulation boundary.
