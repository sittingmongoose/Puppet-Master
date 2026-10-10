# Rollout notes (what each surface has to do when it adopts its family)

Written by the family's designer for the worker spec of each rollout; the lead reviews the rollout against them. One
section per family.

## terminal (pm7-glyphs-designer2, 2026-10-10; family approved by pm7-glyphs)

Family: `src/registry/families/terminal.js`. Contact sheet: `python3 tools/family_sheet.py terminal --out <scratch>`.
Sources: home-terminal `js/70-view.js`, `72-find.js`, `76-popover.js`, `78-agent.js`, `80-card.js`, `90-kind.js`; panels
`js/32-strip.js`, `css/10-panels.css`.

1. **Draw through the registry.** Every terminal glyph comes from `PM56_NEON.icon` / `PM56_NEON.status`; delete the
   local SVG strings (`70-view.js` SVG and `T.ICONS`, `72-find.js` ICON, `76-popover.js` close, `78-agent.js` SQ and
   LOCK, `80-card.js` GLYPH, `90-kind.js` ICON). `T.ICONS` is dead code: remove it, do not port it.
2. **Command marks are status marks** at 12 px in the 20 px gutter (18 px when narrow): running `working`, exit 0
   `complete`, exit N `failed` (its shape is card GLY-1), the prompt awaiting input `idle`, exit 130 (interrupted) and
   a command that ended with the earlier session `skipped`. Exit 130 is `skipped`, not `failed`, in the gutter, the
   card and the sticky header alike.
3. **The gutter must reuse its nodes.** `_renderGutter` rebuilds `innerHTML` on every scroll today; with neon marks every
   rebuild remounts each mark and replays its mount act (complete's check redraws on every wheel tick). Key each mark by
   command id and state (`data-k="st:<state>"`, as `PM56_NEON.status` writes it), move existing nodes with `top`, and
   create a node only when a command appears or its state changes, so the act plays once, at the change.
4. **Gutter inks come from the scheme, not the look.** Restate the tone tokens on `.pmt-gutter`: `--positive:
   var(--pmt-ok); --danger: var(--pmt-bad); --accent: var(--pmt-accent); --nx-idle` and `--muted` from the scheme's
   neutral. Run the 3:1 check for every mark on every scheme (34 today): the neutral (36 % foreground mix) is the likely
   failure for `idle` and `skipped`; raise it per scheme until it holds. Retro's monochrome phosphor schemes draw every
   mark in one ink, which is why the shapes differ.
5. **Authorship never hides state.** A command an agent typed keeps its state mark in the 12 px slot and adds
   `agent-seat` (8 px, the concept ink) in the gutter's free space to its left, vertically centred on the mark.
   Remove `.pmt-mark-agent` and its colour rules.
6. **The agent row:** driving `agent-driving` (14 px, tone `nx-t-working`), paused `agent-cursor` (tone
   `nx-t-paused`), permission `PM56_NEON.status('waiting', 14)`, secret `key` (concept). The driving loop is context
   CSS on the row and the tab mark:
   `<host> svg[data-nx="agent-driving"] .nx-p { animation: var(--kl) 2800ms var(--nx-le) infinite; animation-delay: calc(var(--ad, 0) * 2.8ms - 2800ms); }`.
   The old warning amber goes: driving is work in progress, not a request (lead ruling, no card).
7. **The tab (panels):** the kind glyph is `terminal` at 14 px. While an agent drives, the tab's mark slot shows
   `agent-driving` at 12 px with the loop above; while it is paused, `agent-cursor`. Give the mark `nx-self`
   (`PM56_NEON.icon('agent-driving', 12, 'nx-t-working nx-self')`), so hovering the tab plays only the kind glyph's act
   and the mark keeps its own rhythm. Replace `.pmw-agentmark` (the 7 px warn square). Busy (a foreground command):
   the kind glyph runs its own `seq` loop at 3.6 s in the tab's ink, no colour (lead: agreed for the terminal;
   the general busy tab is decided with the panels family).
8. **Find:** previous and next are the controls family's `arrow-up` and `arrow-down`, close is `close` (14 px controls
   in 24 px targets). **Header facts:** `folder`, `branch`, `clock` as concept glyphs at 14 px.
9. **The chat's command card:** running `working`, ok `complete`, failed `failed`, interrupted `skipped`, needs input
   `waiting`; its expand toggle is `chevron-down`. The five per-look layers of the running glyph go: the neon grammar
   already draws each look.
10. **Reduced Motion:** nothing extra; neon-icons.css stops every act and loop and the lit rest pose carries each state.
    The terminal's own `html[data-motion="reduced"] .pmt-root *` rule already agrees.
