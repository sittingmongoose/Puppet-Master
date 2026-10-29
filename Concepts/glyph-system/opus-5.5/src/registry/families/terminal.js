/* terminal.js: the terminal family (PLN-3, Jared: "redesign them"). OWNER: pm7-glyphs-designer2 (2026-10-10).
 * Sources read: home-terminal @310e11fb6a (js/70-view.js, 72-find.js, 76-popover.js, 78-agent.js, 80-card.js, 90-kind.js)
 * and the W3 census (~/pm-scratch/pm7-glyphs-20261010/w3-home/).
 *
 * WHAT CHANGES (one line each; the reasons are in the records)
 * - The tab kind is the chat's `terminal` (mapped, not redrawn): it is the same concept, and the chat's "Rerun in
 *   Terminal" opens exactly this tab, so the two must be one drawing. The redesign is the neon itself: no kind colour
 *   (colour is reserved for status), the prompt lights on hover and its chevron and cursor type in once.
 * - The command marks are status marks from the shared vocabulary, so a gutter reads like every other list:
 *   running = working, exit 0 = complete, exit N = failed, the live prompt = idle, interrupted or ended with the earlier
 *   session = skipped. The two states that shared the hollow dot are now two shapes (idle ring, skipped ring).
 * - Authorship no longer hides state: the state mark keeps its slot and an agent's command adds the agent seat beside it.
 * - The agent mark is a spark (AI) beside a terminal cursor cell: solid while the agent holds the keyboard (driving),
 *   hollow while it does not (you took over). A terminal draws its own cursor solid when focused and hollow when not,
 *   so the fill already means "who has the keyboard".
 * - Find previous and next are the controls family's arrows; find close, the header facts and the card chevron are the
 *   chat's controls and concepts (mapped).
 *
 * The new drawings follow docs/NEON-GRAMMAR.md: drawn for 12 px first, transform and opacity only, the rest pose is
 * the finished lit drawing, travel 3 units so they still move at 12 px.
 */
(function () {
  'use strict';
  var G = window.PMG;
  if (!G) return;
  var F = 'terminal';

  /* ---------------------------------------------------------------- new: the agent's cursor */
  /* The agent mark: a four-point spark (the chat's sign for AI: the wand's star, the Orbit sparkles) at the top left and
     a terminal cursor cell (7.5 x 14.5, about the 1:2 of a terminal cell) at the bottom right. Solid cell: the agent
     holds the keyboard; hollow cell: it does not. A terminal draws its own cursor the same way (solid when focused,
     hollow when not), so the fill already means "who has the keyboard", and the spark says the holder is an agent.
     Measured at 12 px (2.6-unit tube): the spark's tip clears the hollow cell's tube by 0.6 px. A typed line in place of
     the spark (tried first) read as a stub at 12-14 px and said "cursor", not "agent", where the mark stands alone on
     a tab. Spark plus line was too busy at 12 px. */
  var SPARK = '<path d="M6.25 3.25l1.2 3.05 3.05 1.2-3.05 1.2-1.2 3.05-1.2-3.05-3.05-1.2 3.05-1.2z"/>';
  function cell(filled) { return '<rect x="13" y="6.5" width="7.5" height="14.5" rx="1.3"' + (filled ? ' class="nx-f"' : '') + '/>'; }

  G.def('agent-driving', {
    family: F,
    meaning: 'An agent is typing in this terminal: it holds the keyboard.',
    role: 'status',
    act: 'seq',
    replaces: ['terminal 78-agent.js SQ (driving row)', 'panels 32-strip.js .pmw-agentmark (the 7 px warn square on the tab while driving)'],
    aliases: [],
    surfaces: ['terminal agent row (driving)', 'terminal tab mark while an agent drives (12 px)'],
    note: 'Tone: working (an agent driving is work in progress, not a request: the old warning amber read as "needs ' +
      'you"). Loop, every 2800 ms (the reviewing slot, below needs-you): the spark glints, turning 45 degrees from + to x ' +
      'as it dims and back, then 200 ms later the cursor blinks (1 to .6 and back). The cursor never travels: on the P1000 ' +
      'film a three-unit step back closed the gap and fused cell and spark into a return arrow at 12-16 px. On mount the ' +
      'spark turns in. Context CSS runs the loop: <host> svg[data-nx="agent-driving"] .nx-p ' +
      '{ animation: var(--kl) 2800ms var(--nx-le) infinite; animation-delay: calc(var(--ad, 0) * 2.8ms - 2800ms) }. ' +
      'Retro steps it; NieR keeps the solid ink cell and steps the glint. Reduced Motion: lit and still.',
    parts: [
      { els: SPARK, move: { ar: 45, o: 'c', ao: .55 } },
      { els: cell(true), move: { ao: .45, ad: 200 } }
    ]
  });

  G.def('agent-cursor', {
    family: F,
    meaning: 'An agent is at this terminal but does not hold the keyboard (you took over; it is paused).',
    role: 'concept',
    act: 'seq',
    replaces: ['terminal 78-agent.js SQ (paused row)'],
    aliases: [],
    surfaces: ['terminal agent row (paused)', 'terminal tab mark while the agent is paused (12 px)'],
    note: 'Tone: paused (muted, no halo) in the paused row. Still at rest. Hovering its host glints the spark once ' +
      '(+ to x and back), the agent stirring. The same silhouette as agent-driving with the cell hollow, so going from ' +
      'driving to paused is the fill going out: nothing moves or swaps.',
    parts: [
      { els: SPARK, move: { ar: 45, o: 'c', b: 1 } },
      cell(false)
    ]
  });

  G.def('agent-seat', {
    family: F,
    meaning: 'Typed by an agent: the authorship cue beside a command mark.',
    role: 'concept',
    act: 'none',
    replaces: ['terminal 70-view.js SVG.agent (the square that replaced the gutter state mark)'],
    aliases: [],
    surfaces: ['terminal command-mark gutter, beside the state mark of a command an agent typed (8 px)'],
    note: 'The agent mark\'s cursor cell alone, solid, for 8-10 px, where the spark would be a dot. It never replaces ' +
      'a state: the state mark keeps its 12 px slot and the seat sits in the gutter\'s free 6 px to its left, in the ' +
      'concept ink (authorship is not a status). Still in every look.',
    parts: ['<rect x="8" y="3" width="8" height="18" rx="1.4" class="nx-f"/>']
  });

  /* ---------------------------------------------------------------- new: processes (D14, DL-253) */
  /* The background-activity domain (D1: "Processes" everywhere): the commands, servers, watchers, browser sessions and
     scheduled runs agents started. The terminal's >_ in a console frame: the frame gives it the weight of Goal,
     Subagents and Artifacts beside it in the chat's Activity bar, and keeps it apart from the bare >_ (terminal, below),
     which means a terminal tab. Its verb: the prompt nudges and the cursor types in. Live, it moves on the 2200 ms beat
     (pm7-beat.css, .pmg-beat); Reduced Motion shows this rest pose, lit and still. */
  G.def('processes', {
    family: F,
    meaning: 'Processes: the commands, servers, watchers and scripts agents started, running in the background.',
    role: 'concept',
    act: 'seq',
    replaces: ['background-activity concept rw-processes (the chat domain\'s pulse and the status bar\'s terminal mark, D14)'],
    aliases: [],
    surfaces: ['status bar processes item (12-14 px)', 'agents and processes panel: Processes tab head', 'chat Activity bar: Processes domain (D4: only while a process runs or needs input)', 'Activity Detail: Processes tab'],
    note: 'Two moving parts on the beat: the chevron nudges back (1.6 units) as it dims, and 160 ms later the cursor line types ' +
      'in by its clip. The frame is 18 x 16 with 3-unit corners, so at 12 px it reads as a console, never as the bare ' +
      'terminal glyph. Colour comes from status, never from the glyph: the Activity bar\'s tone inks in the chat, the glyph ' +
      'inks (--pmg-ink-*) in the status bar.',
    parts: [
      '<rect x="3" y="4" width="18" height="16" rx="3"/>',
      { els: '<path d="m7 9 3 3-3 3"/>', move: { ax: -1.6, ao: .6, b: 1 } },
      { els: '<path d="M12.5 15h4.5"/>', move: { ao: .6, ac: '0 9.7 0 11.5', ae: '0 6 0 11.5', ad: 160 } }
    ]
  });

  /* the panels tab strip's agent marks are these two (panels.js, tab marks); mapped here because this file loads after panels.js */
  G.map('agent-driving', { family: 'panels', replaces: ['panels 32-strip.js agent-driven square (.pmw-agentmark, 10-panels.css:156)'], surfaces: ['panels tab strip (mark slot)'] });
  G.map('agent-cursor', { family: 'panels', replaces: ['panels tab agent mark while the agent is paused (you took over)'], surfaces: ['panels tab strip (mark slot)'] });

  /* ---------------------------------------------------------------- mapped: the chat set already draws these */
  G.map('terminal', {
    family: F, meaning: 'A terminal: a shell session, its tab and its profiles.',
    replaces: ['terminal 90-kind.js ICON (the >_ tab kind, svg string)', 'panels 06-icons.js RETRO_GLYPH.terminal ">_" (Retro text glyph)', 'terminal 90-kind.js profiles() icon "terminal" (zsh, bash, pwsh, ssh)'],
    surfaces: ['panels tab strip (terminal tab kind, 14 px)', 'panels "+" menu (terminal profiles)', 'chat "Rerun in Terminal"']
  });
  /* the command marks: one per prompt line (D13) */
  G.map('st-working', { family: F, replaces: ['terminal 70-view.js SVG.run (gutter: running, filled dot)', 'terminal 80-card.js card:running (five per-look layers)'], surfaces: ['terminal command-mark gutter', 'chat command card'] });
  G.map('st-complete', { family: F, replaces: ['terminal 70-view.js SVG.ok (gutter: exit 0)', 'terminal 80-card.js card:ok'], surfaces: ['terminal command-mark gutter', 'chat command card'] });
  G.map('st-failed', { family: F, replaces: ['terminal 70-view.js SVG.fail (gutter: exit N, an X)', 'terminal 80-card.js card:failed'], surfaces: ['terminal command-mark gutter', 'chat command card'] });
  G.map('st-idle', { family: F, replaces: ['terminal 70-view.js SVG.idle when the prompt awaits input'], surfaces: ['terminal command-mark gutter'] });
  G.map('st-skipped', { family: F, replaces: ['terminal 70-view.js SVG.idle when the command ended with the earlier session', 'terminal 80-card.js card:interrupted', 'gutter exit 130 (interrupted; today drawn as fail)'], surfaces: ['terminal command-mark gutter', 'chat command card'] });
  G.map('st-waiting', { family: F, replaces: ['terminal 78-agent.js SQ (permission row: an agent asks to type)', 'terminal 80-card.js card:waiting ("Needs input")'], surfaces: ['terminal agent row (permission)', 'chat command card'] });
  /* the secret row is the objects family's key (a credential): lock is st-blocked's drawing, so it cannot also mean
     "a secret only you can answer" (lead ruling, 2026-10-10) */
  G.map('key', { family: F, replaces: ['terminal 78-agent.js LOCK (secret row: "Password needed", a password prompt)'], surfaces: ['terminal agent row (secret)'] });
  /* find, header facts, card */
  /* find previous and next are the controls family's arrow-up and arrow-down (one pair for every find bar, panels and
     terminal alike); the card's expand toggle is the chat's chevron */
  G.map('chevron-down', { family: F, replaces: ['terminal 80-card.js card:chevron (expand)'], surfaces: ['chat command card'] });
  G.map('close', { family: F, replaces: ['terminal 72-find.js ICON.close', 'terminal 76-popover.js close (appearance and editor popovers)'], surfaces: ['terminal find bar', 'appearance popover'] });
  G.map('branch', { family: F, replaces: ['host icon "git" in the terminal header row (the branch fact)', 'terminal 70-view.js T.ICONS.branch (dead code: drop it)'], surfaces: ['terminal header row'] });
  G.map('clock', { family: F, replaces: ['host icon "clock" in the terminal header row (running command, elapsed time)', 'terminal 70-view.js T.ICONS.clock (dead code: drop it)'], surfaces: ['terminal header row'] });
  G.map('folder', { family: F, replaces: ['terminal 70-view.js T.ICONS.folder (dead code: drop it; the header folder fact uses the host folder)'], surfaces: ['terminal header row'] });
})();
