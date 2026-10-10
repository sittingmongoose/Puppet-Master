/* panels.js: the panels family (the universal panels, the editor, Debug & Run, Source Control, Docker, Actions).
 * OWNER: pm7-glyphs-designer2 (2026-10-10). Sources: the lead's inventory (reports/pm7-glyphs-20261010/inventory/) and
 * src/data/map.json (the old drawings); panels @57644989ec js/06-icons.js, 32-strip.js; PM7-base.html (rail, shell).
 *
 * WHAT CHANGES (the reasons are in the records)
 * - Debugging: three breakpoint marks that differ by silhouette, not by a knocked-out detail (a filled dot, a dot with an
 *   equals sign beside it, a filled diamond), and three stepping controls that differ by shape (an arc over the line,
 *   an arrow into it, an arrow out of it). The chat's step (play plus bar) stays continue-to-next.
 * - Source control: diff (plus over minus), merge (a branch joining the trunk), pull request (a branch pointing back at
 *   the trunk), stash (a card dropping into a tray). Each sits apart from the chat's branch, changes, archive and outbox.
 * - Panels: panel (a frame with a lit title bar), layout (three regions), split right and split down (the divider slides
 *   in), widget (a card with a sparkline), the new terminal workgroup (stacked frames with a plus).
 * - Picking on the page: pointer (a cursor entering an element: pick it) and select-area (a marquee with handles that
 *   drags out: select a region). Four bare corner brackets are the chat's expand, so select-area cannot be them.
 * - Editor and find: wrap, and the three find toggles as glyphs (match case, whole word,
 *   regular expression). Glyphs, not text: the toggles' on state has to read lit like every other neon toggle, and
 *   text in each look's font changes the toggles' widths from look to look (Retro's mono, NieR's face).
 * - Making things: new file and new folder (the chat's page and folder with a plus that twists in), output (a console
 *   frame whose lines print in), container (a box whose lid lifts; Docker and packages), compose (a stack of linked
 *   containers), pipeline (CI: stations on a line, the flow pushing on).
 * - Tab marks: one slot, five vocabulary marks in a fixed order (needs you, failed, agent driving, busy, news); the
 *   warning-coloured attention square splits into needs-you and news; busy gets a mark for the first time; dirty is
 *   change-modified in the close slot; preview stays an italic label (the notes at the end).
 * - Roles: verbs on toolbars (stepping, splits, find toggles, new file) are controls, unlit until hover or focus; the
 *   things a tab or list names (panel, output, container, pipeline, breakpoints) are concepts, lit and still.
 *
 * Grammar (docs/NEON-GRAMMAR.md): drawn for 12 px first (14 px for tab kinds and toolbars), travel 3 units or a
 * rotation whose far point travels 3, never an opacity-only act (one-shots floor at .85), parallel strokes 4-5 units
 * apart, at most two moving parts (three for a sequence).
 */
(function () {
  'use strict';
  var G = window.PMG; if (!G) return;
  function def(name, r) { r.family = 'panels'; G.def(name, r); }
  var FRAME = '<rect x="3" y="4.5" width="18" height="15" rx="2.2"/>';

  /* ---------------------------------------------------------------- debugging: breakpoints */
  def('bp-line', {
    meaning: 'A breakpoint: execution stops on this line.', act: 'drop', aliases: ['breakpoint', 'bpline'],
    replaces: ['rail Debug bpLine (a ring)', 'editor gutter breakpoint'],
    note: 'A filled dot, set on the line like a pin: on mount and on hover it drops 3 units into place. Tone, for the ' +
      'rollout to confirm: enabled takes the blocked ink (execution halts here, which is what blocked means), disabled ' +
      'the paused ink, unverified the idle ink; the shape never changes.',
    parts: [{ els: '<circle cx="12" cy="12" r="5" class="nx-f"/>', move: { ay: -3 } }]
  });
  def('bp-cond', {
    meaning: 'A conditional breakpoint: execution stops here only when its condition holds.', act: 'seq', aliases: ['bpcond', 'breakpoint-conditional'],
    replaces: ['rail Debug bpCond (a ring with a clock hand)'],
    note: 'The breakpoint dot with an equals sign beside it (the condition), not inside it: a knocked-out sign in a ' +
      '5 px dot cannot render at 12 px. The equals sign writes in from the dot on hover. Lines 5 units apart.',
    parts: ['<circle cx="7.6" cy="12" r="4.2" class="nx-f"/>',
      { els: '<path d="M14.2 9.5h6.3M14.2 14.5h6.3"/>', move: { ac: '0 11 0 13', ae: '0 2 0 13' } }]
  });
  def('bp-log', {
    meaning: 'A logpoint: it writes a message here and does not stop.', act: 'seq', aliases: ['bplog', 'logpoint'],
    replaces: ['rail Debug bpLog (a diamond)'],
    note: 'A filled diamond (the logpoint convention) that turns a quarter as it arrives, landing on itself, like a ' +
      'note being flipped. If GLY-1 gives warning the diamond (option B), warning is an outline with a mark and this ' +
      'stays solid; they still read apart, but the card should know.',
    parts: [{ els: '<path d="M12 5 19 12 12 19 5 12z" class="nx-f"/>', move: { ar: 90, o: [12, 12] } }]
  });

  /* ---------------------------------------------------------------- debugging: stepping */
  def('step-over', {
    role: 'control',
    meaning: 'Step over: run this line, including any call it makes, and stop on the next.', act: 'wave', aliases: ['stepover'],
    replaces: ['rail Debug stepOver'],
    note: 'An arc that jumps over the current line (the dot); on hover it sweeps forward over it. The lead asked for ' +
      'step over and step into to map to the chat\'s step; a debug toolbar shows over, into and out side by side, so ' +
      'one drawing for two of them would leave two identical buttons. The chat\'s step stays continue-to-next.',
    parts: ['<circle cx="11.5" cy="19.2" r="2.2" class="nx-f"/>',
      { els: ['<path d="M5 14a6.5 6.5 0 0 1 13 0"/>', '<path d="M15.2 11.6 18 14.4l2.8-2.8"/>'], move: { ar: -40, o: [11.5, 14] } }]
  });
  def('step-into', {
    role: 'control',
    meaning: 'Step into: follow the call on this line into the function it calls.', act: 'drop', aliases: ['stepinto'],
    replaces: ['rail Debug stepInto'],
    note: 'An arrow that drops into the current line (the dot). The head is 10.4 units wide so the trio holds its ' +
      'own beside step-over at 12 px (an 8-unit head read as a "!"); the dot clears the arrow\'s tip by 2 units.',
    parts: ['<circle cx="12" cy="19.4" r="2.2" class="nx-f"/>',
      { els: ['<path d="M12 3.6v10.2"/>', '<path d="m6.8 8.6 5.2 5.2 5.2-5.2"/>'], move: { ay: -3 } }]
  });
  def('step-out', {
    role: 'control',
    meaning: 'Step out: finish this function and stop back in its caller.', act: 'drop', aliases: ['stepout'],
    replaces: ['rail Debug stepOut'],
    note: 'An arrow that rises out of the current line (the dot), the same head and dot as step-into.',
    parts: ['<circle cx="12" cy="19.4" r="2.2" class="nx-f"/>',
      { els: ['<path d="M12 14V3.6"/>', '<path d="m6.8 8.8 5.2-5.2 5.2 5.2"/>'], move: { ay: 3 } }]
  });

  /* ---------------------------------------------------------------- source control */
  def('diff', {
    role: 'control',
    meaning: 'Compare two versions: the differences between them.', act: 'swap', aliases: [],
    replaces: ['rail diff (two panes)', 'panels editor diff mode (a plus and a minus)'],
    note: 'Plus over minus, bare; the change marks (change-added, change-deleted) put them in a square, so the two ' +
      'never read alike. On hover the plus and the minus slide past each other.',
    parts: [{ els: '<path d="M12 3.2v10.6M6.5 8.5h11"/>', move: { ax: 3, b: 1 } },
      { els: '<path d="M6.5 19h11"/>', move: { ax: -3, b: 1, ad: 60 } }]
  });
  def('merge', {
    role: 'control',
    meaning: 'Merge: bring a branch\'s work into another branch.', act: 'strike', aliases: [],
    replaces: ['rail Source Control merge'],
    note: 'Two commits on a trunk and a branch that curves down into it; on hover the branch slides in and joins. Nodes ' +
      'and joins as the chat\'s branch draws them.',
    parts: ['<circle cx="7" cy="5" r="2.2"/>', '<path d="M7 7.2v9.6"/>', '<circle cx="7" cy="19" r="2.2"/>',
      { els: ['<circle cx="17" cy="5" r="2.2"/>', '<path d="M17 7.2c0 5.6-4.6 7.8-10 7.8"/>'], move: { ax: 3, ay: -3 } }]
  });
  def('pull-request', {
    meaning: 'A pull request: a branch asking to be merged, open for review.', act: 'strike', aliases: ['pr', 'pullrequest'],
    replaces: ['rail Source Control pr'],
    note: 'The trunk on the left; on the right a branch whose line bends back and points at it. On hover the arrowhead ' +
      'arrives at the trunk.',
    parts: ['<circle cx="6" cy="5" r="2.2"/>', '<path d="M6 7.2v9.6"/>', '<circle cx="6" cy="19" r="2.2"/>',
      '<circle cx="18" cy="19" r="2.2"/>', '<path d="M18 16.8V10a3 3 0 0 0-3-3h-4.5"/>',
      { els: '<path d="m13 4.5-2.5 2.5 2.5 2.5"/>', move: { ax: 3 } }]
  });
  def('stash', {
    role: 'control',
    meaning: 'Stash: set uncommitted changes aside to bring back later.', act: 'drop', aliases: ['shelve'],
    replaces: ['rail Source Control stash (a lidded box)', 'left rail 00-d.js stash'],
    note: 'A card dropping into the chat\'s outbox tray. The old lidded box was the chat\'s archive; archive removes a ' +
      'thing from a list, stash keeps work to bring back, so they need two drawings.',
    parts: ['<path d="M3 14v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5"/>', '<path d="M7 14h3l1 2h2l1-2h3"/>',
      { els: '<rect x="8" y="4.5" width="8" height="7.5" rx="1.3"/>', move: { ay: -3 } }]
  });

  /* ---------------------------------------------------------------- panels */
  def('panel', {
    meaning: 'A panel: one area of the workspace that holds tabs.', act: 'seq', aliases: [],
    replaces: ['panels switcher and empty-state panel chip'],
    note: 'A frame with a lit (filled) title bar and nothing else: a content line made it output\'s twin at 12 px, ' +
      'and the solid band at the top is what split-down (a line through the middle) and output (printed lines) lack. ' +
      'On hover the title bar writes in from the left, a panel opening.',
    parts: [FRAME,
      { els: '<path d="M5.2 4.5h13.6a2.2 2.2 0 0 1 2.2 2.2v2.8H3V6.7a2.2 2.2 0 0 1 2.2-2.2z" class="nx-f"/>', move: { ac: '0 18 0 0', ae: '0 0 0 0' } }]
  });
  def('layout', {
    role: 'control',
    meaning: 'The layout: how the workspace is divided into panels.', act: 'swap', aliases: [],
    replaces: ['panels home options, board menus, tidy (layout)', 'chat layout (a sidebar frame)'],
    note: 'A frame in three regions (a side column and two panes); on hover both dividers shift and settle, the ' +
      'layout rearranging.',
    parts: [FRAME,
      { els: '<path d="M10 4.5v15"/>', move: { ax: -3, b: 1 } },
      { els: '<path d="M10 12h11"/>', move: { ay: 3, b: 1, ad: 80 } }]
  });
  def('split-right', {
    role: 'control',
    meaning: 'Split to the right: open a new panel beside this one.', act: 'strike', aliases: ['splitright', 'split-side'],
    replaces: ['panels splitRight (editor layout, terminal Split)', 'PM7 terminal shell split-side'],
    note: 'The divider slides in from the right edge to the middle.',
    parts: [FRAME, { els: '<path d="M12 4.5v15"/>', move: { ax: 5 } }]
  });
  def('split-down', {
    role: 'control',
    meaning: 'Split down: open a new panel below this one.', act: 'strike', aliases: ['splitdown', 'split-stacked'],
    replaces: ['panels splitDown', 'PM7 terminal shell split-stacked'],
    note: 'The divider slides up from the bottom edge to the middle.',
    parts: [FRAME, { els: '<path d="M3 12h18"/>', move: { ay: 4.5 } }]
  });
  def('widget', {
    meaning: 'A widget: one card on a dashboard (a chart, a figure, a list).', act: 'seq', aliases: [],
    replaces: ['panels widget (unused today; the dashboard tabs need it)'],
    note: 'A card with a header and a sparkline that draws across on hover. Kept apart from the chat\'s chart (bars ' +
      'on axes) by its frame.',
    parts: [FRAME, '<path d="M3 9h18"/>',
      { els: '<path d="M6.5 16.5 9.5 13.5l2.5 2 5.5-4.5"/>', move: { ac: '0 18 0 5', ae: '0 5 0 5' } }]
  });
  def('workgroup-new', {
    role: 'control',
    meaning: 'A new terminal workgroup: a set of terminals kept together.', act: 'strike', aliases: ['workgroup-plus'],
    replaces: ['PM7 terminal shell workgroup-plus (a folder with a plus)'],
    note: 'Two stacked frames with a plus: the old folder-plus said "new folder". On hover the back frame lifts as the ' +
      'group grows. The universal panels may retire workgroups (one terminal per tab, splits are panels): drawn so the ' +
      'old shell has a glyph until then.',
    parts: ['<rect x="3" y="8" width="14" height="12" rx="2"/>', '<path d="M10 11v6M7 14h6"/>',
      { els: '<path d="M7 5.2V5a1.5 1.5 0 0 1 1.5-1.5h11A1.5 1.5 0 0 1 21 5v9.5a1.5 1.5 0 0 1-1.5 1.5h-.2"/>', move: { ay: -3, ax: 1.5, b: 1 } }]
  });

  /* ---------------------------------------------------------------- editor and find */
  def('pointer', {
    role: 'control',
    meaning: 'Pick an element on the page: the next click selects the element under it.', act: 'strike', aliases: ['select-element', 'inspect', 'pick-element'],
    replaces: ['panels 06-icons.js pointer (browser select-component)', 'home "pick element" (runtime 55b0453912, an arrow cursor)'],
    note: 'An arrowhead cursor entering a box whose corner is open for it: the element it is about to pick. A bare ' +
      'arrow said "the mouse" and nothing about the page; the box is what makes it pick an element, and it keeps the ' +
      'glyph apart from open (an arrow leaving a box: a line arrow, not a cursor) and from select-area beside it. On ' +
      'hover the cursor pulls back 3 units out of the corner and taps in again, a click.',
    parts: ['<path d="M10 19H5.2A2.2 2.2 0 0 1 3 16.8V5.2A2.2 2.2 0 0 1 5.2 3h11.6A2.2 2.2 0 0 1 19 5.2V10"/>',
      { els: '<path d="M11 11 20.6 14.7 16.4 16.4 14.7 20.6z"/>', move: { ax: 3, ay: 3, b: 1 } }]
  });
  def('select-area', {
    role: 'control',
    meaning: 'Select an area: drag out a region of the page or screen to add it (a screenshot region, a selection).', act: 'strike', aliases: ['add-selection', 'region-select'],
    replaces: ['home "add selection" (runtime 11bad014f6, four corner brackets)', 'panels 06-icons.js region (camera region; mapped to expand today)'],
    note: 'Four corner brackets round a crosshair: the region-capture mark. Four bare brackets are the chat\'s expand ' +
      '(full screen) and would be one drawing at 12 px; the crosshair says "aim at a region", and the brackets sit ' +
      'one unit in from expand\'s with 4-unit legs, so the two never pair up as one family. A marquee with corner ' +
      'handles was tried first: at 12 and 14 px the handles merged into the corners and it read as a plain square. ' +
      'On hover the crosshair is dragged in from the top-left and the brackets turn a quarter onto it, locking on ' +
      '(one turn in, no bounce: the brackets are symmetric by a quarter, so a turn out and back passed 45 degrees twice ' +
      'and read as a double twitch on the P1000 film).',
    parts: [
      { els: '<path d="M4 8.5V5.2A1.2 1.2 0 0 1 5.2 4h3.3M15.5 4h3.3A1.2 1.2 0 0 1 20 5.2v3.3M20 15.5v3.3a1.2 1.2 0 0 1-1.2 1.2h-3.3M8.5 20H5.2A1.2 1.2 0 0 1 4 18.8v-3.3"/>', move: { ar: 90, o: [12, 12] } },
      { els: '<path d="M12 8.6v6.8M8.6 12h6.8"/>', move: { ax: -3, ay: -3 } }]
  });
  def('wrap', {
    role: 'control',
    meaning: 'Wrap lines: long lines continue on the next line instead of running off the edge.', act: 'strike', aliases: ['word-wrap', 'wordwrap'],
    replaces: ['panels editor wrap toggle (WRAP_ICON, unused today)'],
    note: 'Three lines, the middle one hooking back under itself; on hover the hook\'s arrowhead slides back into ' +
      'place. Lines 6 units apart; the short last line stops 4.5 units short of the arrowhead, which is 1 px clear at ' +
      '12 px (at 3 units the two merged).',
    parts: ['<path d="M4 6h16"/>', '<path d="M4 18h4.5"/>', '<path d="M4 12h12.5a3 3 0 0 1 0 6H13"/>',
      { els: '<path d="m15.5 15.5-2.5 2.5 2.5 2.5"/>', move: { ax: 3 } }]
  });
  def('match-case', {
    role: 'control',
    meaning: 'Match case: find only text with the same capitals.', act: 'strike', aliases: ['casesense', 'case-sensitive'],
    replaces: ['panels find caseSense', 'terminal find Aa (text)'],
    note: 'A capital A and a small a; on hover the small a hops up to cap height and back. Drawn for 14 px (find bars).',
    parts: ['<path d="M3.5 18.5 7.6 6l4.1 12.5"/>', '<path d="M5 14.5h5.2"/>',
      { els: ['<circle cx="16.6" cy="15.5" r="3"/>', '<path d="M19.6 12v6.5"/>'], move: { ay: -3, b: 1 } }]
  });
  def('match-word', {
    role: 'control',
    meaning: 'Whole word: find the text only as a whole word, not inside other words.', act: 'seq', aliases: ['wholeword', 'whole-word'],
    replaces: ['panels find wholeWord', 'terminal find whole-word toggle (text)'],
    note: 'The letters a and b over a bracket that closes under them; the bracket draws in on hover, bounding the word. ' +
      'Drawn for 14 px; the two stems sit 5.4 units apart.',
    parts: ['<circle cx="6.6" cy="11.5" r="2.7"/>', '<path d="M9.3 8.8v5.4"/>', '<path d="M14.7 4.8v9.4"/>', '<circle cx="17.4" cy="11.5" r="2.7"/>',
      { els: '<path d="M4 17.5v2.5h16v-2.5"/>', move: { ac: '0 21 0 3', ae: '0 2.6 0 2.6' } }]
  });
  def('use-regex', {
    role: 'control',
    meaning: 'Regular expression: the search text is a pattern.', act: 'wave', aliases: ['regex'],
    replaces: ['panels find regex', 'terminal find .* (text)'],
    note: 'A dot and an asterisk (.*); on hover the asterisk turns a sixth and lands on itself, a glint: "anything". ' +
      'The asterisk spans 11 units so its three strokes still part at 12 px (at 9 they closed into a blob).',
    parts: ['<circle cx="6.2" cy="17.8" r="2.2" class="nx-f"/>',
      { els: '<path d="M15 3.5v11M10.24 6.25l9.52 5.5M10.24 11.75l9.52-5.5"/>', move: { ar: 60, o: [15, 9] } }]
  });

  /* ---------------------------------------------------------------- making things */
  def('file-plus', {
    role: 'control',
    meaning: 'New file.', act: 'seq', aliases: ['fileplus', 'new-file'],
    replaces: ['rail Explorer filePlus'],
    note: 'The chat\'s page with its corner cut for a plus; the plus twists in on hover (a quarter turn lands on ' +
      'itself).',
    parts: ['<path d="M11.5 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8l4 4v5.5"/>', '<path d="M15 3v4h4"/>',
      { els: '<path d="M17.5 14.75v5.5M14.75 17.5h5.5"/>', move: { ar: 90, o: [17.5, 17.5] } }]
  });
  def('folder-plus', {
    role: 'control',
    meaning: 'New folder.', act: 'seq', aliases: ['folderplus', 'new-folder'],
    replaces: ['rail Explorer folderPlus'],
    note: 'The chat\'s folder with its corner cut for a plus; the plus twists in on hover.',
    parts: ['<path d="M11.5 19H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v3"/>',
      { els: '<path d="M17.5 13.75v5.5M14.75 16.5h5.5"/>', move: { ar: 90, o: [17.5, 16.5] } }]
  });
  def('output', {
    meaning: 'Output: what a program or tool printed (the Output tab).', act: 'seq', aliases: [],
    replaces: ['panels Output tab kind and channel header', 'panels RETRO_GLYPH.output "|"'],
    note: 'A console frame whose two lines print in, one after the other, on hover. The chat\'s page (a sheet with a ' +
      'folded corner) stays the document.',
    parts: [FRAME,
      { els: '<path d="M7 10h10"/>', move: { ac: '0 17 0 6', ae: '0 6 0 6' } },
      { els: '<path d="M7 15h6.5"/>', move: { ac: '0 17 0 6', ae: '0 9.5 0 6', ad: 140 } }]
  });
  def('container', {
    meaning: 'A container or package: software packed to run anywhere (Docker containers and images, packages).', act: 'strike', aliases: ['docker', 'package', 'box'],
    replaces: ['rail Docker (a box)', 'PM7 terminal package (a box)'],
    note: 'A box; on hover its lid lifts and drops back. Provider logos (the Docker whale) stay brand marks.',
    parts: ['<path d="M4 7.6v8.8L12 21l8-4.6V7.6"/>', '<path d="M4 7.6 12 12l8-4.4M12 12v9"/>',
      { els: '<path d="M4 7.6 12 3l8 4.6L12 12z"/>', move: { ay: -3, b: 1 } }]
  });
  def('compose', {
    meaning: 'A stack of containers that run together (Docker Compose).', act: 'seq', aliases: ['docker-compose', 'stack-services'],
    replaces: ['rail Docker compose (four boxes)'],
    note: 'Three linked boxes, one feeding two; the two lower boxes pop up in turn on hover. Three boxes, not four: ' +
      'four were specks at 12 px.',
    parts: ['<rect x="8.5" y="3" width="7" height="6" rx="1.3"/>', '<path d="M12 9v3M6.5 15v-3h11v3"/>',
      { els: '<rect x="3" y="15" width="7" height="6" rx="1.3"/>', move: { ay: 3, ao: .5 } },
      { els: '<rect x="14" y="15" width="7" height="6" rx="1.3"/>', move: { ay: 3, ao: .5, ad: 140 } }]
  });
  def('pipeline', {
    meaning: 'A pipeline: automated builds, tests and deploys (CI, GitHub Actions).', act: 'seq', aliases: ['ci', 'actions', 'workflow'],
    replaces: ['rail Actions & Pipelines (the GitHub mark, a brand)'],
    note: 'Two stages on a diagonal, the first handing on to the second through an elbow: work moving from job to job, ' +
      'read top-left to bottom-right. Stations on a straight line were tried twice: as rings they closed up at 12 px, ' +
      'as beads with an arrowhead they read as a plain right arrow; an arrowhead on the elbow fused into the second ' +
      'box at 12 px, so the act carries the direction instead. The diagonal keeps it apart from compose (one box ' +
      'feeding two: a pyramid), route (a path winding between two rings) and the chat\'s branch (a fork). On hover the ' +
      'elbow draws from the first stage and the second stage drops into place at its end.',
    parts: ['<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/>',
      { els: '<path d="M10.5 7h4.5a2 2 0 0 1 2 2v4.5"/>', move: { ac: '0 13.5 10.5 0', ae: '0 0 0 0' } },
      { els: '<rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>', move: { ay: -3, ao: .5, ad: 140 } }]
  });

  /* ---------------------------------------------------------------- tab marks (32-strip.js:296-318) */
  /* The strip has one mark slot after the label and the close slot after it. Today the slot holds three home-made
   * squares in one warning colour (agent-driven: filled; attention: hollow; nothing for busy) and the close slot a
   * dirty dot. Each becomes a mark the vocabulary already has, so a tab says what the rest of PM7 says:
   *   needs you        st-waiting      a prompt or an agent asks (the terminal's asks)              attention ink, loops
   *   failed           st-failed       the tab's work ended in an error in the background           blocked ink, stutter
   *   agent driving    agent-driving   an agent types in it (terminal family; replaces .pmw-agentmark) working ink, loops
   *   busy             st-working      live work with no agent (a build, a run, a page loading)     working ink, 9 s orbit
   *   news             st-info         opened in the background or new output since you looked, a bell  quiet, still
   * One mark at a time, in that order (the highest wins; the tab's tooltip lists the rest). The old attention square
   * meant three of these at once (background-opened, a bell, an agent's ask) and showed all three as the same warning
   * square, so an ask looked like news; now an ask is needs-you and news is quiet. Busy had no strip visual at all.
   * Dirty stays in the close slot as change-modified (the lead's ruling), swapped for close on hover as today.
   * Preview stays the italic label: a provisional tab is how the tab is held, not a state of its work or a thing, and
   * a glyph on every preview tab would be noise where the italic already reads (the editors' convention).
   * Status marks in a tab are 12 px beside a 14 px kind glyph and never replace the kind. The agent marks' panels
   * records are written in terminal.js, which loads after this file (a map needs its glyph drawn first). */
  G.map('st-waiting', { family: 'panels', replaces: ['panels 32-strip.js attention square when a prompt or an agent asks (terminal asks)'], surfaces: ['panels tab strip (mark slot)'] });
  G.map('st-failed', { family: 'panels', replaces: ['panels tab work failed in the background (no mark today)', 'panels 22-tools.js tools-mark:error (Problems, Output)'], surfaces: ['panels tab strip (mark slot)', 'Problems list'] });
  G.map('st-working', { family: 'panels', replaces: ['panels 32-strip.js busy (no strip visual today)', 'panels 63-kind-docs.css plan-busy-dot'], surfaces: ['panels tab strip (mark slot)', 'plan Build button'] });
  G.map('st-info', { family: 'panels', replaces: ['panels 32-strip.js attention square for a background-opened tab or new output', 'terminal 70-view.js bell (unfocused) raising the attention square', 'panels 22-tools.js tools-mark:info'], surfaces: ['panels tab strip (mark slot)', 'Problems list'] });
  G.map('change-modified', { family: 'panels', replaces: ['panels 32-strip.js dirty dot in the close slot (.pmw-tdot, 10-panels.css:172)'], surfaces: ['panels tab strip (close slot)'] });

  /* ---------------------------------------------------------------- tab kinds the chat set already draws */
  G.map('page', { family: 'panels', replaces: ['panels 06-icons.js file, document, artifact (tab kinds)'], surfaces: ['panels tab strip'] });
  G.map('step', { family: 'panels', replaces: ['debug toolbar continue to next (step forward)'], surfaces: ['Debug & Run toolbar'] });
})();
