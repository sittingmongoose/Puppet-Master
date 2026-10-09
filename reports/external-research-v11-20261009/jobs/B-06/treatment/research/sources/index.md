# Sources index — I06 discovery evidence (navigable)

Case I06 | B-06/treatment/research | Method M14. All files below live in this directory
(`sources/`). SHA-256 values are over the retained bytes. Access stamps in `FETCH_TIMES.txt`.
Source IDs are immutable; see `../source-map.json` for exact URL / version / locator /
observed operations per ID.

## LibreTime (schedule-oriented radio suite)

- `libretime-README.md` (S01, 2,841 B) — repo README, main branch: fork-of-AirTime identity,
  docs link, forum + Matrix support.
- `libretime-CHANGELOG.md` (S02, 68,895 B) — CHANGELOG incl. 4.5.0 (2025-07-16), 4.4.0,
  4.3.0 (subset-sum #3019 closes #3018), 4.2.0 (#3026 fix 2b43e51).
- `libretime-pr3026.json` (S03, 22,540 B) — GitHub API record for PR #3026: title, closed,
  merged_at 2024-06-05T16:01:57Z, root-cause + fix + testing notes.
- `libretime-install.html` (S04, 24,684 B) — Stable 4.x install page: 1 GHz, 1 GB req /
  2 GB rec, static IP, ports 80/8000/8001/8002, docker/installer/ansible.
- `libretime-user-manual.html` (S05, 21,142 B) — Stable 4.x user-manual index: calendar,
  playlists + smart blocks, scheduling, history, podcasts, webstreams, users.
- `libretime-schedule.html` (S06, 10,707 B) — NEGATIVE evidence: guessed `/schedule/` URL
  returned the site 404 shell. Retained to prevent silent rebind; not cited for behaviour.

## AzuraCast (multi-station web-radio suite)

- `azuracast-README.md` (S07, 6,541 B) — repo README, main branch: Docker suite, demo,
  install-then-web-UI, AGPLv3, support/issues workflow.
- `azuracast-requirements.html` (S08, 50,424 B) — requirements: min 2 GB/20 GB x86_64/ARM64
  Docker; rec 4c/4GB/40GB for 5–10 stations; Ubuntu/Debian LTS; incompatibilities.
- `azuracast-roles-permissions.md` (S09, 2,207 B) — roles doc (2021-02-09): Users→Roles→
  Permissions, global vs station scope, super-user specials, feature gates.
- `azuracast-playlists.html` (S10, 49,943 B) — playlists: media-permission gate, scheduled
  blocks, date ranges, post-2024-09-01 numeric priorities + default 7..0 table, Advanced.

## Grist (spreadsheet-database + access rules)

- `grist-access-rules.html` (S11, 160,114 B) — access-rules guide: roles, disabled/enabled
  defaults, rule order, R/U/C/D, user.Access vocabulary, seed/special rules, S-permission
  formula-bypass warning, private-table recipe, view-as, row/column rules.
- `grist-pricing.html` (S12, 190,073 B) — pricing: Free $0 5k/doc; Pro $10/$8 100k/doc;
  Business $30/$24 (min 5) 150k/doc; Community $0; <$1M free activation key.
- `grist-limits.html` (S13, 124,109 B) — limits page retained as sizing cross-check.
- `grist-self-managed.html` (S14, 183,323 B) — self-managed guide retained as self-host
  existence evidence.
- `grist-core-README.md` (S15, 56,349 B) — grist-core README, main branch: open-source basis.

## Calibration / rejection / normative / fallback

- `baserow-pricing.html` (S16, 151,526 B) — Baserow pricing: per-workspace rows
  3k/50k/250k/1M, storage 2/20/100/1000 GB, Premium $10/$12, Advanced $18/$22 + RBAC/audit.
- `rivendell-home.html` (S17, 10,696 B) — Rivendell home: production v4.5.0, GPLv2, appliance
  installer, Ubuntu 22.04, i3/4GB, ASI/JACK audio, PCM/MPEG, 3 logs/machine.
- `wcag-use-of-color.html` (S18, 43,782 B) — W3C Understanding 1.4.1 (WCAG 2.1, Level A):
  criterion text, intent, 3:1 lightness rule + valid/invalid exception, AT separation.
- `tiddlywiki-home.html` (S19, 80,000 B retained of 6,840,202 fetched) — TiddlyWiki home:
  v5.4.1 banner, tiddlers/WikiText model, no-server claim. Trimmed as bounded evidence;
  fetched size recorded in FETCH_TIMES.txt.

## Provenance

- `FETCH_TIMES.txt` — per-fetch exit code, byte count, and UTC access stamp; includes the
  discarded 0-byte guessed AzuraCast users URL (not assigned a source ID, not cited).
