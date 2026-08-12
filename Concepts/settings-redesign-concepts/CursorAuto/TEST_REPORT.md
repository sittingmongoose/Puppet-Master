# TEST_REPORT — CursorAuto Settings Bakeoff Final Packet

Date: 2026-08-11

## Deep polish verification

### Commands

```bash
node --check Concepts/settings-redesign-concepts/CursorAuto/shared/lib/ca-managers.js
# (+ harbor/score/switchboard/archive.js)
python Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/CursorAuto
python Concepts/settings-redesign-concepts/CursorAuto/scripts/ca-interactive-qa.py
# + targeted fill+Enter search continuity → scripts/search-continuity-last.json
```

### Observed results

- Shared/concept JS `node --check`: **SYNTAX_OK**
- ConceptHub `validate.py`: **pass**
- Dead wrong-slot renderer scan: **clean**
- Interactive QA: **pass** (`failures: []`)
  - Hub isolation: port **52676** pid **59872**; QA pid **56260**; profile `C:\Users\sitti\AppData\Local\Temp\ca-qa-56260`
  - Artifact: `scripts/qa-last-run.json`
- Search continuity (polish sample): **16/16** pass (`ok: True`, hub port **51601**)
  - Artifact: `scripts/search-continuity-last.json`

### Per-concept

- **harbor**: ok=True ready=True steps={'home': True, 'states': True, 'deeplink': True, 'workspace': True, 'providers': True, 'peer_manager': True, 'packet_probes': True, 'spellcheck': True, 'theme': True, 'motion': True, 'width': True, 'console': True}
- **score**: ok=True ready=True steps={'home': True, 'states': True, 'deeplink': True, 'workspace': True, 'providers': True, 'peer_manager': True, 'packet_probes': True, 'spellcheck': True, 'theme': True, 'motion': True, 'width': True, 'console': True}
- **switchboard**: ok=True ready=True steps={'home': True, 'states': True, 'deeplink': True, 'workspace': True, 'providers': True, 'peer_manager': True, 'packet_probes': True, 'spellcheck': True, 'theme': True, 'motion': True, 'width': True, 'console': True}
- **archive**: ok=True ready=True steps={'home': True, 'states': True, 'deeplink': True, 'workspace': True, 'providers': True, 'peer_manager': True, 'packet_probes': True, 'spellcheck': True, 'theme': True, 'motion': True, 'width': True, 'console': True}

## Polish notes

- Thin managers deepened beyond one-liner wrappers
- Featured destinations sorted first with subtle `is-featured` chrome
- Harbor Drydocks remapped away from Terminal/LSP
- Origin-aware metaphor motion retained with reduced-motion parity

## Honest limits

- Install / sign-in / audio / import remain `PMStore.receipt` simulations
- Future Server Module Shell remains `deferred_named_owner` only
- No ranking / winner among Harbor / Score / Switchboard / Archive


## Gap-fix verification (post ScoutPlanGaps)

Date: 2026-08-12

### Residual defects closed
- Aligned demo/renderer contracts: notifications.routing objects + webhook/ntfy/Pushover/Telegram; soundLibrary events/packs states; appearanceThemes object; testing.capabilities; githubActions/containers object shapes.
- Deepened thin binders (resource logs/connect/toggle, teacher dismiss/tour/help, storage buckets).
- Harbor overview now surfaces `installationsHtml`; QA probes require real evidence (no unconditional pass).
- QA search helpers prefer home hits, include workspace hits roots, Switchboard `[data-fam]`, Archive home reset.

### Commands
```bash
python Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/CursorAuto
python Concepts/settings-redesign-concepts/CursorAuto/scripts/ca-interactive-qa.py
```

### Results
- ConceptHub validate: **pass**
- Interactive QA: **pass** (`failures: []`)
  - Hub isolation: port **57300** pid **60112**; QA pid **42388**; profile `C:\Users\sitti\AppData\Local\Temp\ca-qa-42388`
  - Artifact: `scripts/qa-last-run.json`
- Packet probes evidence: installations hasInstallUI on all four; Score sound preview clicked; Archive import preview/rollback + server deferred ack.
