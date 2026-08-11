# TEST_REPORT — CursorAuto Settings Bakeoff

Date: 2026-08-05 (exact deep-link + packet-06 gap closure)  
Model: `CursorAuto`  
Folder: `Concepts/settings-redesign-concepts/CursorAuto/`

## Validator

```bash
python3 Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/CursorAuto
```

Result: **passed** (schemaVersion, model/folder match, `data-concept-model="CursorAuto"` on all entries + gallery, bridge support, widthControl role `page` with presets including 760–2500, no temp artifacts).

## Isolated interactive QA

```bash
python3 Concepts/settings-redesign-concepts/CursorAuto/scripts/ca-interactive-qa.py
```

Isolation: ConceptHub `--port 0 --no-runtime-state` (no reuse / no shared runtime overwrite) + Playwright Google Chrome for Testing with `--user-data-dir=/tmp/ca-qa-<pid>` only. Tear-down kills only that Hub PID and that profile.

Result: **passed** (mode `cdp-full`). Evidence: `scripts/qa-last-run.json` — each of Harbor / Score / Switchboard / Archive records steps: `home`, `states`, `deeplink`, `workspace`, `providers`, `peer_manager`, `spellcheck`, `theme`, `motion`, `width`, `console`.

Retention correction: The transient `scripts/qa-last-run.json` was intentionally not retained; the summarized PASS matrix below is the durable evidence.

Exact deep-link (no soft comma-list selector): for each concept, hits carry `data-setting-id`; harness prefers `appearance.check-spelling` then `appearance.dictionary-source` and asserts `document.getElementById('row-' + id)` with settle/spy/focus **on that row** (`rowId` matches). Product scroll-restore skips when a deep-link focus was set this render.

Live CDP checklist (all four):

| # | Check | Harness assertion |
|---|---|---|
| 1 | Home thesis chrome | Markers: berths / plates / jacks / guides |
| 2 | Search deep-link + focus | Exact `settingId` → matching `rowId` + settle/spy/focus on that row (check-spelling + dictionary-source) |
| 3 | Workspace + jump + scrollspy + offset | Open Appearance; jump; section top in sticky band; spy nav changes without thrash; badges + category reset |
| 4 | States drawer (full set + actions) | Calm, continue-setup, recommended, attention-heavy, usage-exhausted, invocation-failed, managed-workspace, baseline; Refresh catalogs / Reconnect + toast |
| 5 | Providers polish | Usage seven fields; ≥6 auth routes; fold expand; LKG refresh badge; activate preferred + toast; effort / Normal-Fast when fixture supports |
| 6 | Peer + second managers | Harbor Memory+LSP; Score Personas+MCP; Switchboard Context+Skills; Archive Crew+Media + simulated action |
| 7 | Spellcheck no auto-replace | Open `.ca-spell` menu; Replace/Ignore present; text unchanged until explicit Replace |
| 8 | Theme + reduced motion | Cycle `[data-shell-theme]`; `[data-shell-motion]` → `data-motion=reduced` kills enter animations |
| 9 | Width ~760 | `[data-shell-width]=760` → `.pmx-squeezed` (or simulated when Hub hides control) |
| 10 | Console clean | `__caQaErrors` + CDP `exceptionThrown` — no `ReferenceError` / `TypeError` |

## Peer-DNA hygiene

Peer-layout class systems and metaphors from other bakeoff folders are absent from concept/shared sources (see FINDINGS §0 for the prior mistake and the strings that must stay at zero outside that admission). Class prefixes are `hb-` / `sc-` / `sw-` / `ar-` (concepts) and `ca-` (shared views/components/states).

## Packet `06` coverage map

| Requirement | Mechanism | CDP? |
|---|---|---|
| Home normal | Baseline seed on load + States → Baseline | Live |
| Several needs-attention | Baseline notices + States → Attention-heavy | Live |
| Continue-setup | States → Continue setup | Live |
| Recommended | States → Recommended | Live |
| Search cross-category | Shared `PMSearch` on every surface | Live (exact ids) |
| Calm / no notices | States → Calm / home calm toggles | Live |
| Usage exhausted | States → Usage exhausted | Live |
| Invocation failed | States → Invocation failed (auth ≠ ready) | Live |
| Managed workspace | States → Managed workspace | Live |
| Refresh / reconnect | States drawer actions | Live |
| Rail open/closed | Shell `data-shell-toggle="side"` | Seeded / inspectable, not CDP-driven |
| Assistant open/closed | Shell `data-shell-toggle="chat"` | Seeded / inspectable, not CDP-driven |
| Workspace category start | Open any berth/plate/jack/guide | Live |
| Scrollspy update | `PMSpy.attach` on subcategory sections | Live |
| Subcategory jump | Slips/marks/jacks/folders → `PMSpy.jumpTo` | Live (+ offset band) |
| Global search deep-link | Search pick → navigate + focus settle | Live (exact) |
| Setting focus | Focus settle after jump | Live |
| Default/inherited/managed/unavailable/risky | Seeded across settings map | Live spot-check (badges/reset) |
| Ordinary + advanced disclosure | Advanced `<details>` / `.ca-disclose` | Seeded + disclose wired; not full matrix CDP |
| Narrow nav | `.pmx-squeezed` ≤900 + Hub width presets | Live (~760) |
| Provider inspectables | Refresh/account/model UI + usage 7 fields + Free Models 6 auth routes | Live |
| Collapsed providers | Switchboard / Archive fold expand | Live |
| Peer managers | Memory/LSP; Personas/MCP; Context/Skills; Crew/Media | Live |
| States drawer | `CAStates.mount` on every concept page | Live |

## Smoke checks (packet `06` 1–12)

| # | Check | Result |
|---|---|---|
| 1 | Search opens correct category/setting | **Pass** (CDP exact `settingId` / `rowId` for check-spelling + dictionary-source) |
| 2 | Scrollspy no oscillation | **Pass** (CDP: single active spy id after settle; no thrash) |
| 3 | Subcategory jump stable offset | **Pass** (CDP: target `getBoundingClientRect().top` in sticky band) |
| 4 | Provider refresh keeps LKG | **Pass** (CDP: refresh + refreshing/LKG badge; catalog rows remain) |
| 5 | Account selection future-only | **Pass** (CDP prefers `data-pv=activate` + toast) |
| 6 | Effort/Normal-Fast only when supported | **Pass** (CDP: Anthropic models expose effort / variant; unsupported models show badges) |
| 7 | Default/inherit/reset unambiguous | **Pass** (CDP: state badges + category reset after toggle) |
| 8 | Manager action → visible receipt | **Pass** (CDP: peer + second manager actions) |
| 9 | Spellcheck never auto-replaces | **Pass** (CDP: menu only; text unchanged until Replace) |
| 10 | Reduced motion final-state parity | **Pass** (CDP `data-motion=reduced` animation none) |
| 11 | Concepts remain distinct after themes | **Pass** (CDP theme cycle; roots survive) |
| 12 | `validate.py` | **Pass** |

## Theme / width / shell

Exercised via ConceptHub (`--port 0`) and standalone top-bar controls:

- Themes: Friendly/Glass/Retro/Basic × Light/Dark
- Widths: 760, 900, 1280, 1700, 2200, 2500 (`widthControl.max` 2500)
- Rail × Assistant combinations (seeded / inspectable; not a dedicated CDP step)
- Reduced motion on/off

## Known simulations

OAuth/CLI login, install/purchase, real catalog network, real Usage math, real probes, LSP restart/logs, memory rebuild, MCP reconnect, crew apply, States fixtures — all return labeled simulated receipts.

## Out of scope this pass (still inspectable / not CDP-driven)

Multi-surface Chat/PRD spellcheck, thread-overflow disable, evidence→attachment/auxiliary UIs, Harbor/Score provider-fold redesign, grammar/style as a separate control, full 900–2500 clip matrix screenshots.

## Unresolved source conflicts

See `IMPACT_REGISTER.json` / `FINDINGS.md` §3. Nothing applied to Plans, inventory, commands, wiring, DRY, or schemas.

## Ranking

None. Comparison surface only.
