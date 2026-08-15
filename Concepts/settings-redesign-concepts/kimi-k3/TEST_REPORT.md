# TEST REPORT — kimi-k3 settings bakeoff

Date: 2026-08-12. Method: headless Chromium driven through ConceptHub
(`server.py`, `--no-browser --no-runtime-state`; ephemeral port per run).
Every page served over HTTP from the Hub — no file:// testing.

## Gate

```
python Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/kimi-k3
→ Concept validation passed (exit 0)
```

Registers: 24/24 files present across four concepts; all JSON parses;
every `manager-coverage.json` has `"missing": []`; the Vault servers
shell is recorded as `demonstrated` for the shell with each module
`deferred_named_owner`.

## Matrix sweeps (width × theme × view)

Widths {900, 1280, 1700, 2200, 2500} × 8 themes × 5–6 views per concept,
measuring stage and document horizontal overflow:

| Concept | Combos | Issues |
|---------|--------|--------|
| 01 Concord | 200 | 0 |
| 02 Resonance | 200 | 0 |
| 03 Foundry | 240 | 0 |
| 04 Vault | 240 | 0 after fixing the `vlt-step-in` X-translate (see FINDINGS #4) |

## Per-concept functional probes (all green)

**Shared (all four concepts)**
- Shell: title-bar inbox opens; dismiss removes the row and drops the
  count chip (6→5); panel stays open across consecutive dismissals;
  outside-click closes; inbox "act" navigates to the notice target.
- Reduced motion: computed animation duration collapses to `1e-05s`.
- Squeezed (≤900px): nav collapses to the select fallback; no overflow.
- 8 themes apply; width presets apply; state persists across reload.
- Console: zero page errors during all probes.

**01 Concord** — Home search with grouped hits; destination jump opens
accordions, scrolls, focuses, leaves `data-spy-current`; providers
connect flow (setup → connecting → connected with receipt); memory
pin/edit; persona apply; permission rule add; crew template instantiate;
context budget meter.

**02 Resonance** — notification destination routing matrix; sound
library preview/upload/assign; theme studio hover-preview + commit;
spellcheck dictionary add/ignore; meter animations respect motion scale.

**03 Foundry** — terminal profile editor + ANSI palette pickers; LSP
requested-vs-effective (Pyright degrade scenario); formatter chain
reorder; catalog enable/disable with conflict surfacing; testing managed
cell; command dry-run receipts.

**04 Vault** — lifecycle transfer wizard (7 steps: preview → apply →
receipt → rollback); storage scrub ("≈ N days at cursor", stroked
indicator, restore on leave, 5 areas painted); forge connect flow;
search-index rebuild phases complete with receipt; cleanup dry-run plan →
apply; deep link to a diagnostic row inside a collapsed accordion opens
it; copy-from-project states transactional independence in copy.

## Scenario drawer spot checks

Calm state empties every notice surface; reset restores seeded data;
named scenarios (invalid TOML, update verification failure, unverified
license, conflict hotkey, degraded LSP, rollback, dry-run) each render
their promised state and receipt.

## Post-release audit round (2026-08-12, second pass)

Packet re-diff (`08_CONCEPT_COVERAGE_AND_FIXTURES.md` +
`MANAGER_COVERAGE_MATRIX.json` as authority):

- **36/36 managers render with live controls, zero console errors** —
  Concord 8 (incl. BSD), Resonance 7 (incl. Desktop/Tray, Teacher/Help),
  Foundry 8 (catalog exposes MCP/Skills/Plugins/Tools tabs = 10 families),
  Vault 13 (incl. Web/Search/Fetch, Search Index, deferred Servers shell).
- **17/17 provider fixtures** present in `pm-core-data.js` (shadowed
  installs, unknown owner, ask-first updates, scheduled idle updates,
  verification-failed rollback, Claude OAuth profile, PM-direct OpenAI
  OAuth, API key, OpenCode server, Free Models, last-known-good catalog,
  fallback requested/effective, effort variation, …).
- **Deep-link marker lag fixed** (shared scrollspy): `[data-spy-current]`
  now lands in ~80ms (was up to ~2.1s behind scroll-settle + animation
  waits); single-marker invariant holds across consecutive jumps; verified
  full + reduced motion, including Vault's accordion-enclosed diagnostic row.
- **17/17 general fixtures** present (managed, restart/reconnect required,
  changed-elsewhere, import conflict, rollback, typo/no-results, long
  label/explanation, squeezed…). Long labels wrap with no overflow at 1280.
- **Audit-found gaps, fixed this round:** Vault Containers and
  Web/Search/Fetch were read-only dashboards. Added and verified:
  Podman install-from-official-source flow (consent copy, state transition
  to Ready, receipt, button retires, persists, reset restores) and
  Web provider priority reorder (persistent, receipts) plus per-provider
  test fetch (disabled under credit-guard cooldown).

## Dependency-correction round (2026-08-13)

Driven by `PM_Settings_Dependency_and_Work_Correction_2026-08-13.zip` +
the missing Performance decision register. Full detail:
`reference-review-report.json`.

- **ObservableWork grammar**: shared `operationHtml` (phase, wait reason,
  determinate bar only with real denominator, progress-source label,
  Cancel when valid). Probed: provider update (Updating → Verifying →
  Ready with source line), Vault index rebuild ("3,051 of 12,204 files ·
  25%", Cancel → cancelled receipt).
- **Lazy hydration**: slow-hydration scenario probed on all four concepts
  ("Hydrating Storage and Retention / Memory / Sound library / Language
  servers"), content follows ~900ms.
- **Offline + collapse banners**: probed on providers manager in Vault and
  Foundry; reset clears.
- **Domain-local refresh**: unrelated-key probe markers survive on Vault
  storage / Concord personas / Foundry formatters; owned keys repaint
  (backups, memory, sounds, formatters). Zero console errors.
- **SCM install flow**: Jujutsu install → ready, button retires,
  exact-host copy. **Deferred shell**: 10 cards (added Project Defaults &
  Templates, Integrations & Tools, Product Onboarding, Doctor).
- **Performance rows**: General → Performance and resources renders;
  Legacy profile option present.
- **Matrix spot check**: 900/1280/2500 × 3 themes on banner + operation
  card — 0 overflow. Validator re-run: exit 0.

## Environment notes

- Hub on Windows: `server.py` runs fine under plain `python`; runtime
  state disabled per plan (ephemeral ports across restarts: 53085, 59502).
- One transient `ERR_CONNECTION_REFUSED` when the Hub process was reaped
  between probes; restarted, probes resumed against the new port.
