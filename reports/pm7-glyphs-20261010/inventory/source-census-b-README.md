# W2b: PM7 source census against the real build base (TestPMConcept.html)

Follow-up to `../w2-source/` (same formats/ids; `T-`/`V-` ids reused, new
tables `T-engine`/`T-obfall`, new vocabs `V-engstatus`/`V-pltone`/`V-plabel`/
`V-route`/`V-rold`/`V-destst`/`V-provst`/`V-lsppill`/`V-mcptone`/`V-profstad`/
`V-groupill`/`V-repost`/`V-plugst`/`V-mcpst`/`V-pathst`). All paths relative to
`R=/home/sittingmongoose/.t3/worktrees/PuppetMaster/concept-pm7-glyphs-20261010`
at `88ae42bbdc` (both files git-clean). Tone column in the draft = neon tone
of the chosen status; extras use analogous tones (warning/attention,
info/idle, offline/blocked, change-*/changed, NONE/NONE).

## Counts

- `icon-tables-b.csv`: 112 rows. T-engine 60 (iconPaths keys), T-aliasmap 48
  (PANEL 25 + DOMAIN 9 + PRIMARY 9 + ROUTE_KINDS 5), T-obfall 4. Zero changed
  rows: every round-1 PM7-base table is byte-identical in Test.
- `status-vocab-b.csv`: 78 rows, 15 new engine vocabs (V-plabel 17, V-route 9,
  V-rold 9, V-engstatus/V-pltone/V-lsppill 5 each, V-destst/V-mcptone/V-plugst 4
  each, V-provst/V-groupill/V-repost/V-pathst 3 each, V-profstad/V-mcpst 2 each).
- `inline-svgs-b.csv`: 2 rows (activity-bar wrapper-attr changes, svg bodies
  identical; no new svg clusters anywhere).
- `status-draft-full.csv`: 216 rows (138 round-1 + 78 new), all mapped:
  warning 35, idle 28, working 24, paused 21, complete 18, NONE 14,
  failed 12, blocked 10, pending 10, skipped 9, reviewing 7, info 6,
  offline 6, mixed 5, waiting 4, change-added 3, recovering 2,
  change-modified 1, change-deleted 1. Unused: waiting-dep, change-renamed.
  Confidence: high 137 / medium 67 / low 12.
- `base-diff.md`: per-table/vocab verdicts, new-in-Test list, 3 citation
  errata, scope notes.

## Base-diff summary (five lines)

1. All 9 PM7-base icon tables (213 rows) are byte-identical in TestPMConcept,
   with equal glyph counts, so nothing was added to them either.
2. 17 of 18 PM7-base status vocabs (92 rows) are byte-identical in Test.
3. The one absent vocab is V-s4 (6 rows, B:33622-33630): the old settings
   badge/pill renderer is gone, replaced by the settings engine.
4. New in Test: the 60-key engine `iconPaths` + `icon()` (T:41940-42006),
   4 alias maps (48 rows), the 4-key onboarding `fallbackIcons` (T:82423),
   and 15 engine status vocabs (78 rows) built on dot+text tokens.
5. No new sprites, symbols, CSS-mask icons, or inline-svg clusters; the only
   new svg-bearing lines are the `icon()` wrapper, the fallback map, and
   QR-generator output (excluded per round-1 rules).

## Conflicts: one PM7 shape -> two neon_status (visual level)

1. Green dot/token: idle (pm51 tone-ready dots, "Ready" pills) vs working
   (V-engstatus green badge, usage checkCircle glyph) vs complete (health
   dot). Sharpest: same settings surface, green badge = working (V-engstatus
   active) but green dot = idle (V-pltone ready).
2. Red dot/token: failed (error badges/dots/chips, lane dot, pressure bar)
   vs blocked (tone-blocked dot) vs offline ("Unavailable"/"Offline" tokens).
3. Grey dot/token: paused ("Off" pills, tone off) vs idle (rail ring,
   current markers) vs info (neutral tone) vs failed ("Has a problem" on a
   neutral-grey dot: singular label misses TONE_BY_WORD, T:47135).
4. Amber dot: warning (most amber) vs skipped (rail stale clock shares warn
   colour) vs mixed (rail dirty pencil shares warn colour).
5. Triangle: PM7 warn triangle -> mixed, but neon failed IS triangle+!
   (round-1 shape cross; GLY-1 question).
6. Hourglass: pending (rail) vs recovering (usage cooldown).
7. Check: complete (op-card +check, done nodes/pips/ticks) vs working (usage
   active checkCircle).
8. The word "blocked": rail octagon -> blocked, but engine state `blocked`
   renders "Unavailable" -> offline (V-plabel), and "Core . locked" pill
   (info-blue!) -> blocked (V-groupill).
9. Toast severity row folds warn+info into one row -> warning (low conf).
10. V-engstatus `active` branch folds active/ready/healthy/pass/verified
    under one green badge -> working (low conf; members point 3 ways).

(Exact-string version: 9 shapes carry 2+ statuses, mostly generic containers
whose per-state modifiers the string omits: `pm6-wiz-schip + sdot` 6,
`state-badge` 6, `pm6-orch-status bordered chip` 4, `topic prog-fill` 4,
`n-sev-dot + text` 4, `status item + pm7-status-dot` 3, `pressure-bar-fill`
3, `pm51-status dot` 2 (coarse round-1 recording), `PM51.pill "Ready"` 2
(Clean vs ready rows, both -> idle after fix).)

## Conflicts: one neon_status -> two PM7 shapes (families)

- idle <- quiet ring, bullseye, "Ready" pills/tokens (10 vocabs), grey items.
- working <- pulse divs, chips, badges, play glyph, dot+ring, checkCircle,
  plain tokens ("Running").
- complete <- solid circle, check/✓, dots, rail/check nodes, pips, ticks,
  health dot, branch glyph (wt-clean), "Approved" pill.
- paused <- "Off" pills/tokens, paused chips/badges, tone-off items, standby
  (no glyph at all), "Not installed" tokens.
- skipped <- clock, box+lid, broken link, cancelled chips/badges, archived
  badge, expired rule, historical banner.
- warning <- badges, pills, tokens, chips, dots, bars (32 shapes, largest).
- failed <- X, red dots/badges/chips, lane dot, pressure bar, grey dot with
  red-meaning text (V-plabel fall-through, #3 above).
- blocked <- octagon, padlock knockout, red dot, blue info pill (#8 above).
- pending <- hourglass, pips, ticks, chips, "queued" lane dot, live toggle.
- mixed <- triangle, diamond, pencil, branch glyph, C-conflict mark.
- reviewing <- chips, prog-fill, pills, tokens ("auditing/checking/testing").
- waiting <- sa badge, op pill, route token ("Needs pairing"), minusCircle
  (needs-seat), "awaiting" badge.
- info <- i-square, unread dot, neutral tone, notify dot.
- offline <- state-badge rule, "Not connected"/"Unavailable"/"Offline" tokens.
- recovering <- sdot chip (reopened), hourglass (cooldown).
- change-added <- A mark AND Q/? untracked mark (two marks, one status).
- NONE <- plain/sticky toasts, read/draft markers, confidence badges,
  category chips ("Default", group names), 3 open-ended passthroughs
  (V-engstatus slug, V-lsppill/V-mcpst fallbacks).
