# Build brief: background activity into PMConcept7, plus the chat round

For the thread that builds this. Written 2026-10-28 by the concept's thread (Opus 5.5) after Jared's second review.
Start on branch `t3/research/task-and-agent-visibility` (this concept, pushed, not on `main`) or on `main` after that
branch lands.

## What Jared asked for

The concept in this folder is approved, with every decision made (`README.md`, Decisions). Build it into the product
for real, make seven changes to the chat in general, and update Plans for all of it:

1. **The chat can get wider.**
2. **Activity Detail opens only at full size.** Today an Activity-bar click opens a small panel, and Pin makes it the
   big docked one. Drop the small one; always open the big one.
3. **Glass plates as solid as the persona and model menus.** Activity Detail (its hover card and its panel), the History
   panel, and the Activity bar's hover cards (the attachment card too) are too see-through in Glass. Use the
   look of the persona and model menus.
4. **Pinning Activity Detail works, and opening the big view works every time.**
5. **The context ring draws clean** in Friendly and Glass; it is broken up and artifacted there now.
6. **Demo Studio gets this concept's scenarios**, the quit demo included.
7. **Plans, wiring, settings, commands and DRY** are updated with all of the changes.

Plus the concept's own fix from the same review: the status bar glyphs animate (done in the concept, `src/rw.css`),
and the status bar shows Numbers by default with a setting for Words.

Jared's direction for this round overrides `Concepts/CONCEPT_RULES.md` rule 4: edit the product sources listed below
and republish `Concepts/PMConcept7.html` with `Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7`, and edit
Plans. Never hand-edit `PMConcept7.html`.

## Read first

- `README.md` and `IMPACT_TRACKER.md` in this folder. The tracker's §2 to §8 are the Plans rows for the feature; §9 is
  the chat round with file and line pointers (at `main` 478bac5d64).
- `src/`: the concept code to port. `rw-data.js` (fixture and words), `rw-glyphs.js` (the two `PMG.def` glyphs),
  `rw-thread.js` (the chat's Processes domain), `rw-platform.js` (status bar items and panel), `rw.css`, `rw-lab.js`
  (the lab; its scenarios become Demo Studio entries).
- `Concepts/PMConcept7-NOTES.md` (how the page is published) and `Concepts/onboarding/opus-5.5/DEMO_STUDIO.md`.
- The repository's `CLAUDE.md`: worktrees, commits, the Plans pipeline, the ledger compile order and the landing lock.

## What was found already (verify before you rely on it)

| Item | Finding |
|---|---|
| 1, 2, 4 | One cause links them. In PMConcept7, `activityPinnedInLayout()` (`Concepts/chat-assistant-concepts/5.6 Pro/app.js` L492–496) docks Activity Detail only when `PM56_HOST.width()` (`pm7-port/js/00-host.js` L359) less the History gutter is at least 540 + 280 px. The Home layer clamps the chat's message area to 400–760 px (`Concepts/home-redesign/src/panels/js/10-model.js` L44–48, `44-narrow.js` L17, the drag in `46-chat.js` L122 and L147). So Pin sets `state.activity.pinned` but the layout almost never has room, and the panel renders as the small transient one (`renderActivityPanel(true)`, L982). Reproduce this first. |
| 3 | The persona and model menus are `.overlay-menu`, on Glass's near-opaque menu tint `--pmw-pop` (`pm7-port/css/20-controls.css` L88–101, `13-tokens-glass.css` L36–55). The transient `.activity-panel`, the Activity bar's `.ab-card` hover cards (`activity-bar.css`) and the History surfaces are not all on that plate. One plate token for every floating surface is also the DRY answer. |
| 5 | Not investigated. The ring is drawn in `app.js` (search `ringPct`) from `context.js` L257–275. Compare Friendly and Glass against Basic, where it is clean. |
| 6 | Demo Studio: `Concepts/onboarding/opus-5.5/src/js/91-demo-studio.js`, `92-demo-studio-ui.js`, copy in `src/copy.d/75-demo-studio.json`. Scenarios to add: Busy, No asks, Quiet, Many, Stale feed, After restart, and the Quit dialog. |

## The build

Port the concept into the sources that own each surface. The concept injects and re-inserts nodes because it could not
edit them; the build should leave none of that.

| Surface | Owner sources |
|---|---|
| The chat's Processes domain: the tenth Activity-bar icon, its hover card, its Activity Detail view, the show-only-while-running rule (D4) | `5.6 Pro/activity-bar.js` (`DOMAINS`, `barTone`, the `TONE_*` tables, `CARDS` L530), `activity-bar.css`, `activity-panel.js` (`DOMAINS/LABELS/ICONS` L43–48), `app.js` (`ACTIVITY_ORDER` L1790, `activityScope` L1837, `activityDefs` L1933); ported by `pm7-port/tools/chat56_layer.py` |
| The two glyphs (D14) | `Concepts/glyph-system/opus-5.5/src/registry/families/` (`terminal.js` for `processes`, `objects.js` for the `robot` redraw), then rebuild the catalog |
| Status bar group, Numbers by default, the Words setting, the orchestrator chip folded in (D5) | `Concepts/onboarding/opus-5.5/base/script/pm7-t23-shell-adjustments.js` `installStatusBar()` (L883–933), `base/style/pm7-t32-final.css` (L8–83), hover words `base/script/pm-hover-tags-js.js` (L214); the setting in the settings kit beside `general.interaction.activity-bar-labels` |
| The panel: Agents and Processes tabs, pop out, Stop all, the quit dialog (D6, D8, D10) | A layer of its own in the publish build, on the one overlay root (DR-067) |
| Demo Studio entries | as item 6 above |

D6 drops Side by side and Task manager from the product; keep them only if Demo Studio needs them for comparison.

Open design points to bring to Jared with a recommendation (do not block on them):

- **Pin, once there is no small view.** Recommend removing it: Activity Detail stays open until it is closed (×, Esc or
  the icon again).
- **When the window cannot fit the docked panel.** Recommend widening the chat to make room, and past the window's
  limit, the panel covering the transcript at the column's full height, so it is never the small one.
- **How wide the chat may get.** Recommend letting the drag run until the centre reaches its own floor (the ladder's
  existing rule), with no fixed 760 cap.

## Coordination with the Pip thread

Jared is also working on the new Puppet Master logo, Pip, with the thread
`t3-thread://v2/47363713-9592-474c-94b0-8191f32118eb/ae606a33-2b6d-4cdd-90bc-77180061737b` (branch
`t3/concept/puppet-master-logo`). Pip goes into the onboarding window, the title bar, the app and tray icons, the
loader, and the chat assistant.

- **Ownership.** The Pip thread owns the logo assets and every place the mark shows: the title bar, onboarding, and in
  the chat the assistant's mark, loader and empty state. This build owns everything in this brief. Do not restyle a
  Pip call site; if a chat change needs one moved, ask first.
- **Mailbox.** Register with `pm-mail register pm7-chat-round --about "..."` and keep `pm-mail wait` armed. Jared will
  ask the Pip thread to register as `pip-logo`. Message it before you edit a chat file it has touched (`git log
  origin/t3/concept/puppet-master-logo -- <path>`), and before every landing.
- **PMConcept7.html is generated.** Whoever lands second rebases and runs `build.py --publish-pm7` again; never merge
  that file by hand. Land through the landing lock, one at a time.

## Rules that apply

- **Models:** creative or visible UI work only on Opus 5.5 at xhigh. Do not use Kimi Code, OpenCode Go or Codex. Check
  `python3 /mnt/Cursor/aac-usage/aac-usage --provider claude` before long or parallel runs.
- **Workers:** start one only while `free -g` shows at least 6 GB available, and settle its thread when it is done.
- **Browsers:** GPU only, through `agent-browser`. Stop what you start. Never `pkill` by pattern.
- **Checks:** all ten looks (Basic, Friendly, Retro, Glass, NieR; light and dark), Reduced Motion, and narrow widths.
  Run `build.py --check` and the chat port's lint, the concept's 22 scripted checks (rewritten for the native
  surfaces), and the publish build's own checks.
- **Review before landing:** put a build Jared can open from disk in `/mnt/Cursor/share/puppet-master/<date>-<topic>/`,
  with a README and screenshots, and land after his OK.
- **Plans:** prose first, then companions (schemas, fixtures, wiring, bindings, touch closure, settings inventory,
  command catalog), then `pm-shard-plans.py --generate` and `pm-plan-index.py generate`. The compile witness goes
  first if a ledger is compiled. Run the landing check before pushing `main`, refresh the snapshot and baseline after
  it, and report the reseal request to Jared.
- **Cleanup:** delete temporary files, browsers, servers and worktrees when done.
