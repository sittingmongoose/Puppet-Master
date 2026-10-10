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
   *Done on home-terminal's side (@def6834d3d): the gutter updates marks in place; they key `data-k="st:<state>"` at
   rollout.*
4. **Gutter inks come from the scheme, not the look.** Restate the tone tokens on `.pmt-gutter`: `--positive:
   var(--pmt-ok); --danger: var(--pmt-bad); --accent: var(--pmt-accent); --nx-idle` and `--muted` from the scheme's
   neutral. Run the 3:1 check for every mark on every scheme (34 today): the neutral (36 % foreground mix) is the likely
   failure for `idle` and `skipped`; raise it per scheme until it holds. Retro's monochrome phosphor schemes draw every
   mark in one ink, which is why the shapes differ.
5. **Authorship never hides state.** A command an agent typed keeps its state mark in the 12 px slot and adds
   `agent-seat` (8 px, the concept ink) in the gutter's free space to its left, vertically centred on the mark.
   Remove `.pmt-mark-agent` and its colour rules. Exit 130 (interrupted) is `skipped`. *Both accepted by home-terminal.*
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
   the general busy tab is decided with the panels family). *Superseded (lead ruling 2026-10-10, panels review): a busy
   terminal tab shows `st-working` in the mark slot like every other kind (panels item 3); the kind glyph stays still.*
8. **Find:** previous and next are the controls family's `arrow-up` and `arrow-down`, close is `close` (14 px controls
   in 24 px targets). **Header facts:** `folder`, `branch`, `clock` as concept glyphs at 14 px.
9. **The chat's command card:** running `working`, ok `complete`, failed `failed`, interrupted `skipped`, needs input
   `waiting`; its expand toggle is `chevron-down`. The five per-look layers of the running glyph go: the neon grammar
   already draws each look.
10. **Reduced Motion:** nothing extra; neon-icons.css stops every act and loop and the lit rest pose carries each state.
    The terminal's own Reduced Motion rule (now `html[data-motion=reduced] .pmt-root :not(.pmt-calm)`) agrees: neon
    nodes are never `.pmt-calm`, so the acts still stop.
11. **One settle, not two.** The gutter's per-look settle (check draws, Friendly pops, Glass rings, Retro reverse flash,
    NieR steps) is replaced by the neon mark's own mount act at rollout, never both (agreed with home-terminal).

## panels (pm7-glyphs-designer2, 2026-10-10; family approved by pm7-glyphs, merged 4f68d4ef8c)

Family: `src/registry/families/panels.js` (28 glyphs). Contact sheet: `python3 tools/family_sheet.py panels --out
<scratch>`. Sources: panels `js/06-icons.js`, `js/32-strip.js`, `css/10-panels.css`, `kinds/22-tools.js`,
`kinds/42-document.js`; the rail's Debug, Source Control, Docker and Actions panels; home runtime `55b0453912` (pick
element) and `11bad014f6` (add selection).

1. **Draw through the registry.** Every panels glyph comes from `PM56_NEON.icon` / `PM56_NEON.status`; delete
   `06-icons.js`'s SVG table and `RETRO_GLYPH` text glyphs (Retro draws the same glyph; the phosphor is CSS).
2. **Tab kinds** (14 px, concept role, lit and still): terminal `terminal`, browser `globe`, file / document / artifact
   `page`, code `code`, plan `plan`, transcript `chat`, context `lens`, record `bookmark`, output `output`, problems
   `warning`, ports `plug`, debug `bug`, console `terminal`. Dashboard: `widget`, not `table` (a board of cards, not a
   data grid; the map has `table` at medium confidence).
3. **Tab marks: one 12 px slot after the label, one mark, in this order:** needs you `status('waiting')`, failed
   `status('failed')`, agent driving `agent-driving` (tone working, the loop of terminal item 6), agent paused
   `agent-cursor` (tone paused), busy `status('working')`, news `st-info` (tone idle). Every mark gets `nx-self`, so a
   tab's hover plays only its kind glyph. The tooltip lists any marks the winner hides. Remove `.pmw-agentmark`,
   `.pmw-tattn` and every rule that paints them; the warning-coloured square goes, because an agent's ask (needs you)
   and a background tab's news must not look alike (order and split: lead ruling). **News** marks a tab an agent opened
   in the background (Jared's D8: it never takes focus), new output or a bell, and clears the first time the tab is
   shown. **Busy** is `st-working` in the slot for every kind, the terminal included (lead ruling), and follows the
   panels' P12 (nothing animates at idle; a dev server or a watcher is busy for hours), agreed with home-panels:
   shown only while the tab is not on screen (an inactive tab, a hidden or collapsed panel), still
   (`PM56_NEON.status('working', 12, 'nx-still nx-self')`: lit, no orbit, its act plays once as it mounts, when the
   work starts), and at the end it remounts once, so the act plays again, then leaves after `--nx-d1` (440 ms; 396 in
   Retro); under Reduced Motion it comes and goes at once. If the work failed, `failed` takes the slot instead.
   Busy had no strip visual at all before (`[data-busy]` had no CSS).
4. **Dirty** stays in the close slot as `change-modified` (12 px, status role, still), swapped for `close` on the tab's
   hover or focus as `.pmw-tdot` is today. **Preview** stays the italic label; no glyph.
5. **Toolbars:** controls at 14 px in 24 px targets (the debug toolbar at 16 px). Find toggles `match-case`,
   `match-word`, `use-regex` and the editor's `wrap` are glyphs, not text: a text toggle changes width with each look's
   font (Retro's mono, NieR's face) and cannot light. A pressed toggle (`aria-pressed="true"`) holds the lit state:
   `[aria-pressed="true"] > svg.nx-r-control { --nx-hiv: visible; --nx-hi-a: var(--nx-h-concept-i); --nx-ink:
   var(--text); }` with the host's own pressed fill (the sheet's `.pn-on`). neon-icons.css already keeps a pressed
   host's ink on hover.
6. **Breakpoints** in the editor gutter (12 px, concept role, static): enabled tone `nx-t-blocked`, disabled
   `nx-t-paused`, unverified `nx-t-idle`; the shape never changes with the tone. The gutter reuses its nodes (terminal
   item 3's rule), so a breakpoint's drop plays once, when it is set.
7. **Browser picking:** `pointer` (pick an element) and `select-area` (select a region) sit side by side with `camera`;
   select-area also replaces 06-icons.js `region` (mapped to `expand` today: expand is full screen).
8. **Map corrections** (applied by the lead in build_map.py; all 491 PM7 icons resolve): `diff` -> `diff` (not `changes`), `region` -> `select-area`,
   `WRAP_ICON` -> `wrap`, `doc:filePlus` -> `file-plus`, dashboard -> `widget`, `stepOver` / `stepInto` ->
   `step-over` / `step-into` (three side by side in one toolbar cannot share the chat's `step`, which stays continue;
   lead ruling). `casesense`, `wholeword`, `regex`, `splitright`, `splitdown`, `split-side`,
   `split-stacked`, `workgroup-plus` resolve as aliases.
9. **Looks:** the Retro phosphor applies by itself on button hosts and PMH targets. NieR plays every act since the
   lead's hover-bridge fix (4f68d4ef8c). NieR needs no form of its own for `bp-log`: its solid diamond in the blocked
   ink never reads as NieR's working mark (a hollow double diamond in plain ink, turning), checked in NieR Dark and
   Light at 12-20 px with the diamonds part on. Contrast holds 3:1 at rest in
   all ten looks (lowest: the breakpoints' blocked ink, 3.16:1 in NieR Dark and 3.58:1 in Friendly Light; every other
   glyph is 3.79:1 or more).
10. **Reduced Motion:** nothing extra; neon-icons.css stops every act and the lit rest pose carries each state.
11. **Round two and addendum 3** (home-panels, 2026-10-10): the '+' menu's SSH hosts row `server` (objects), Debug
    Console sub-tab states (D33) running `working`, paused `paused`, ended by how it ended (`complete`, `failed`, or
    `skipped` when you stopped it; not `idle`, which means ready for input), the "paused at <file:line>" link
    `ring-dot`, a session's run `play`, the dashboard's "Demo time" fact `clock`, its Live mark
    `status('working', 12, 'nx-still')` (the vocabulary's "live"): lit and still, and the board's beat event remounts
    it so its act plays once per beat (P12: nothing moves between beats; Live stays on for hours); under Reduced
    Motion it never moves. The ended mapping fits D33 as built (home-panels). Board menu rows: Start from
    `layout`, Save as preset `save`, Play the next hour `play`, Back to now `clock`, Live readings `signal`; the Output
    picker's "Open in new tab" `open`. The empty dashboard's sketch is an illustration, not a glyph.
