/* families/objects.js: things the chat never named (pm7-glyphs, the lead's family).
 * From the inventory: the icons PMConcept7 draws today with no neon equivalent (Settings categories, Usage, the
 * onboarding art, the rail and the panels). One glyph per concept; where two PM7 icons name one concept (plant and
 * seed, stack and layers, dial and gauge, toolbox and tool) they share one drawing and the second name is an alias.
 * Grammar (docs/NEON-GRAMMAR.md): 24 grid, live area 3-21, the chat's Lucide-derived proportions, one verb per glyph
 * (the part that moves is the part that does the thing), rest pose is the finished drawing.
 */
(function () {
  'use strict';
  var G = window.PMG; if (!G) return;
  function def(name, r) { r.family = 'objects'; G.def(name, r); }

  /* places and machines */
  def('home', {
    meaning: 'Home: the start page and dashboard.', act: 'strike',
    replaces: ['T-core home', 'Settings engine home'], note: 'The roof lifts as you arrive.',
    parts: ['<path d="M5.5 10.2V19.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V10.2"/>', '<path d="M10 20.5v-5.2h4v5.2"/>',
      { els: '<path d="M3 11.6 12 4l9 7.6"/>', move: { ay: -3, b: 1 } }]
  });
  def('bell', {
    meaning: 'Notifications.', act: 'wave', aliases: ['notifications'],
    replaces: ['T-core bell', 'T-bridge bell'], note: 'The bell swings from its crown and the clapper follows a beat later.',
    parts: [{ els: '<path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.6 2H4.9z"/>', move: { ar: 12, o: [12, 4], b: 1 } },
      { els: '<path d="M10.1 21a2 2 0 0 0 3.8 0"/>', move: { ax: 3, ad: 90, b: 1 } }]
  });
  def('layers', {
    meaning: 'Layers or a stack of things (runs, packs, levels).', act: 'strike', aliases: ['stack'],
    replaces: ['T-core layers', 'T-bridge layers', 'T-art stack'], note: 'The top sheet lifts off the stack.',
    parts: ['<path d="M3.5 12.6 12 17.4l8.5-4.8"/>', '<path d="M3.5 16.8 12 21.6l8.5-4.8"/>',
      { els: '<path d="M12 3.4 20.5 8.2 12 13 3.5 8.2z"/>', move: { ay: -3.2, b: 1 } }]
  });
  def('key', {
    meaning: 'A key or credential (API keys, sign-in secrets).', act: 'wave', aliases: ['credential'],
    replaces: ['T-bridge key', 'T-art key', 'T-usage-svg key'], note: 'The key turns as if in a lock.',
    parts: [{ els: ['<circle cx="7.5" cy="16.5" r="4"/>', '<path d="M10.4 13.6 19.5 4.5"/>', '<path d="m15.8 8.2 2.6 2.6M18.2 5.8l2 2"/>'], move: { ar: -22, o: [7.5, 16.5], b: 1 } }]
  });
  def('cloud', {
    meaning: 'A cloud service or remote host.', act: 'wave',
    replaces: ['T-art cloud'], note: 'It drifts.',
    parts: [{ els: '<path d="M7.2 18.5h10.1a4.1 4.1 0 0 0 .5-8.15A5.6 5.6 0 0 0 7 9.4a4.55 4.55 0 0 0 .2 9.1z"/>', move: { ax: 3, b: 1 } }]
  });
  def('server', {
    meaning: 'A server, machine or host.', act: 'strike', aliases: ['host', 'machine'],
    replaces: ['T-art server'], note: 'The lower unit slides out like a drawer. The units sit 4 units apart so they never fuse at 12 px (pm7-glyphs-designer2 review).',
    parts: ['<rect x="4" y="3.5" width="16" height="6.5" rx="2"/>', '<path d="M11.5 6.75h5"/>', '<circle cx="7.6" cy="6.75" r="1" class="nx-f"/>',
      { els: ['<rect x="4" y="14" width="16" height="6.5" rx="2"/>', '<path d="M11.5 17.25h5"/>', '<circle cx="7.6" cy="17.25" r="1" class="nx-f"/>'], move: { ax: 3, b: 1 } }]
  });
  def('phone', {
    meaning: 'A phone or mobile device.', act: 'wave', aliases: ['mobile'],
    replaces: ['T-art phone'], note: 'It buzzes once.',
    parts: [{ els: ['<rect x="7" y="2.8" width="10" height="18.4" rx="2.4"/>', '<path d="M11 18h2"/>'], move: { ar: 16, o: [12, 12], b: 1 } }]
  });
  def('monitor', {
    meaning: 'A computer or display.', act: 'seq', aliases: ['computer', 'desktop'],
    replaces: ['T-bridge monitor', 'T-art computer'], note: 'The prompt line on the screen lights. monitor-play (the chat) stays for playback.',
    parts: ['<rect x="2.5" y="3.5" width="19" height="13" rx="2"/>', '<path d="M8 20.5h8M12 16.5v4"/>',
      { els: '<path d="M6.5 8h5"/>', move: { ao: .25, ax: -3, b: 1 } }]
  });

  /* measures */
  def('gauge', {
    meaning: 'A gauge: a level against its limit (usage, quota, speed).', act: 'wave', aliases: ['dial', 'meter'],
    replaces: ['T-core dial', 'T-usage-svg gauge'], note: 'The needle sweeps up to its reading.',
    parts: ['<path d="M4.3 16.5a8.5 8.5 0 1 1 15.4 0"/>', '<path d="M5.6 10.6 6.9 11.3M12 5.6V7M18.4 10.6l-1.3.7"/>',
      { els: ['<path d="M12 14.5 15.4 9.6"/>', '<circle cx="12" cy="14.5" r="1.4" class="nx-f"/>'], move: { ar: -70, o: [12, 14.5] } }]
  });
  def('pulse', {
    meaning: 'Activity over time: a heartbeat, live traffic.', act: 'seq', aliases: ['activity', 'heartbeat'],
    replaces: ['T-usage-svg pulse'], note: 'The trace draws across.',
    parts: [{ els: '<path d="M3 12.5h4l2.2-5.5 4.2 10.5 2.2-5h5.4"/>', move: { ac: '0 21 0 3', ae: '0 0 0 0' } }]
  });
  def('coin', {
    meaning: 'Credits or a balance.', act: 'seq', aliases: ['credits'],
    replaces: ['T-usage-svg coin'], note: 'A glint crosses the rim. One coin, not a stack: the stack read as database\'s cylinder.',
    parts: ['<circle cx="12" cy="12" r="8.5"/>', '<circle cx="12" cy="12" r="5.2"/>',
      { els: '<path d="M14.6 8.2 16 6.8"/>', move: { ao: .15, b: 1 } }]
  });
  def('wallet', {
    meaning: 'Spend or a payment method.', act: 'strike', aliases: ['spend', 'billing'],
    replaces: ['T-usage-svg wallet'], note: 'The clasp closes.',
    parts: ['<path d="M18.5 7V5a1.5 1.5 0 0 0-1.5-1.5H6a2.5 2.5 0 0 0 0 5h13.5A1.5 1.5 0 0 1 21 10v8.5a1.5 1.5 0 0 1-1.5 1.5H6A2.5 2.5 0 0 1 3.5 17.5V6"/>',
      { els: '<path d="M21 12h-3.4a1.9 1.9 0 0 0 0 3.8H21"/>', move: { ax: 3, b: 1 } }]
  });
  def('briefcase', {
    meaning: 'Work, an organisation or a team account.', act: 'strike', aliases: ['work', 'organisation'],
    replaces: ['T-usage-svg briefcase'], note: 'The handle lifts.',
    parts: ['<rect x="3" y="7.5" width="18" height="12.5" rx="2"/>', '<path d="M3 12.8h18M12 12v2"/>',
      { els: '<path d="M9 7.5V5.6a1.1 1.1 0 0 1 1.1-1.1h3.8A1.1 1.1 0 0 1 15 5.6v1.9"/>', move: { ay: -3, b: 1 } }]
  });
  def('scales', {
    meaning: 'Weighing options: compare, judge, policy.', act: 'wave', aliases: ['compare', 'judge'],
    replaces: ['T-core scales'], note: 'The beam tips and settles.',
    parts: ['<path d="M12 4.5v15.5M8 20h8"/>',
      { els: ['<path d="M4.8 7.5h14.4"/>', '<path d="M4.8 7.5 2.6 13a2.3 2.3 0 0 0 4.4 0z"/>', '<path d="M19.2 7.5 17 13a2.3 2.3 0 0 0 4.4 0z"/>'], move: { ar: 14, o: [12, 7.5], b: 1 } }]
  });

  /* making and tools */
  def('wrench', {
    meaning: 'Tools and maintenance (tools, doctor, repair).', act: 'wave', aliases: ['tool', 'toolbox', 'tools'],
    replaces: ['T-core toolbox', 'T-usage-svg tool'], note: 'It gives one turn.',
    parts: [{ els: '<path d="M14.6 6.4a4.2 4.2 0 0 0-5.3 5.3L3.8 17.2a2.1 2.1 0 0 0 3 3l5.5-5.5a4.2 4.2 0 0 0 5.3-5.3l-2.4 2.4-2.6-.5-.5-2.6z"/>', move: { ar: -18, o: [12, 12], b: 1 } }]
  });
  def('palette', {
    meaning: 'Looks and colour (theme, appearance).', act: 'seq', aliases: ['theme', 'appearance'],
    replaces: ['T-core palette'], note: 'The paints hop up one by one.',
    parts: ['<path d="M12 3a9 9 0 0 0 0 18c1.3 0 2-.9 2-1.9 0-1.3-1-1.7-1-2.9 0-1.1.9-1.9 2.1-1.9H17a4 4 0 0 0 4-4C21 6.2 17 3 12 3z"/>',
      { els: '<circle cx="7.6" cy="11.2" r="1.15" class="nx-f"/>', move: { ay: -3, b: 1 } },
      { els: '<circle cx="9.9" cy="7.2" r="1.15" class="nx-f"/>', move: { ay: -3, ad: 110, b: 1 } },
      { els: '<circle cx="14.5" cy="7.2" r="1.15" class="nx-f"/>', move: { ay: -3, ad: 220, b: 1 } }]
  });
  def('puzzle', {
    meaning: 'An extension, plugin or integration that fits in.', act: 'strike', aliases: ['extension', 'plugin', 'integration'],
    replaces: ['T-core puzzle'], note: 'The piece slides into place. plug (the chat) stays for a connection.',
    parts: [{ els: '<path d="M5 7.5h3.8a2.2 2.2 0 1 1 4.4 0H17v3.8a2.2 2.2 0 1 1 0 4.4v3.8h-3.8a2.2 2.2 0 1 0-4.4 0H5z"/>', move: { ax: -3, b: 1 } }]
  });
  def('film', {
    meaning: 'A recording or video.', act: 'seq', aliases: ['video', 'recording'],
    replaces: ['T-core film'], note: 'The frames advance one step.',
    parts: ['<rect x="3" y="3.5" width="18" height="17" rx="2"/>', '<path d="M7.5 3.5v17M16.5 3.5v17"/>',
      { els: '<path d="M3 8.5h4.5M3 15.5h4.5M16.5 8.5H21M16.5 15.5H21"/>', move: { ay: 3, ao: .5 } }]
  });
  def('rocket', {
    meaning: 'Launch, deploy or ship.', act: 'strike', aliases: ['launch', 'deploy', 'ship'],
    replaces: ['T-core rocket'], note: 'It lifts and its flame stretches. send (the chat) stays for sending a message.',
    parts: [{ els: ['<path d="M12 2.9c3.4 2.1 4.9 5.4 4.9 9.3l-1.7 3.5H8.8l-1.7-3.5c0-3.9 1.5-7.2 4.9-9.3z"/>', '<circle cx="12" cy="9.4" r="1.7"/>', '<path d="M8.6 14.6 5.8 17.2l.7-4.3M15.4 14.6l2.8 2.6-.7-4.3"/>'], move: { ay: -2.6, b: 1 } },
      { els: '<path d="M10.6 18.6 12 21.2l1.4-2.6"/>', move: { ay: 3, ad: 80, b: 1 } }]
  });
  def('flame', {
    meaning: 'Hot or burning fast (a streak, a hot path, high burn rate).', act: 'wave', aliases: ['hot', 'burn'],
    replaces: ['T-bridge flame'], note: 'The inner flame flickers up.',
    parts: ['<path d="M12 21.5c-3.5 0-6-2.4-6-5.6 0-3.3 2.6-5 3.2-8.4 1.9 1.1 2.8 2.8 2.8 4.5 1-.6 1.7-1.8 1.8-3.2 2.4 1.9 4.2 4.4 4.2 7.1 0 3.2-2.5 5.6-6 5.6z"/>',
      { els: '<path d="M12 21.5c-1.4 0-2.4-1-2.4-2.4 0-1.5 1.2-2.4 2.4-3.6 1.2 1.2 2.4 2.1 2.4 3.6 0 1.4-1 2.4-2.4 2.4z"/>', move: { ay: -3, ao: .45 } }]
  });
  def('sprout', {
    meaning: 'Something new and growing (a new project, a seed, onboarding).', act: 'strike', aliases: ['plant', 'seed', 'grow'],
    replaces: ['T-core plant', 'T-art seed'], note: 'The leaves rise from the stem.',
    parts: ['<path d="M12 21v-8.5M7.5 21h9"/>',
      { els: ['<path d="M12 13.2c0-3.6-2.6-6.2-6.7-6.2 0 3.9 2.7 6.2 6.7 6.2z"/>', '<path d="M12 11.2c0-3.3 2.4-5.6 6.2-5.6 0 3.6-2.4 5.6-6.2 5.6z"/>'], move: { ay: 3, ao: .4 } }]
  });
  def('party', {
    meaning: 'A celebration: a milestone reached.', act: 'seq', aliases: ['celebrate', 'milestone'],
    replaces: ['T-core party'], note: 'The confetti bursts out of the popper.',
    parts: ['<path d="M4 20.5 8.6 9.3l6.1 6.1z"/>',
      { els: ['<path d="M14 3.8v2.2M19.6 9.4h-2.2M18 5.6l-1.6 1.6"/>', '<circle cx="10.6" cy="4.8" r=".95" class="nx-f"/>', '<circle cx="20" cy="13.6" r=".95" class="nx-f"/>'], move: { ax: 2.4, ay: -2.4, ao: .3, b: 1 } }]
  });

  /* machines and data (round 2: the shell's terminal and Settings engine tables) */
  def('database', {
    meaning: 'A database or data store.', act: 'strike', aliases: ['data', 'store'],
    replaces: ['T-term database', 'T-engine database'], note: 'The lid lifts.',
    parts: ['<path d="M5 6v12c0 1.55 3.13 2.8 7 2.8s7-1.25 7-2.8V6"/>', '<path d="M5 12c0 1.55 3.13 2.8 7 2.8s7-1.25 7-2.8"/>',
      { els: '<ellipse cx="12" cy="6" rx="7" ry="2.8"/>', move: { ay: -3, b: 1 } }]
  });
  def('cpu', {
    meaning: 'A processor: compute, the local machine\'s load.', act: 'seq', aliases: ['processor', 'compute', 'system'],
    replaces: ['T-term cpu', 'T-engine system'], note: 'The core draws out from its centre.',
    parts: ['<rect x="6" y="6" width="12" height="12" rx="2"/>', '<path d="M9.5 3v3M14.5 3v3M9.5 18v3M14.5 18v3M3 9.5h3M3 14.5h3M18 9.5h3M18 14.5h3"/>',
      { els: '<rect x="9.5" y="9.5" width="5" height="5" rx="1"/>', move: { ac: '12 12 12 12', ae: '0 0 0 0' } }]
  });
  def('signal', {
    meaning: 'A network connection and its strength.', act: 'seq', aliases: ['wifi', 'radio', 'network'],
    replaces: ['T-term wifi', 'T-term radio', 'T-engine network'], note: 'The arcs rise out of the dot in turn.',
    parts: ['<circle cx="12" cy="18.6" r="1.1" class="nx-f"/>',
      { els: '<path d="M9.9 15.6a3 3 0 0 1 4.2 0"/>', move: { ay: 3, ao: .4 } },
      { els: '<path d="M7.4 12.9a6.6 6.6 0 0 1 9.2 0"/>', move: { ay: 3, ao: .4, ad: 110 } },
      { els: '<path d="M4.8 10.1a10.3 10.3 0 0 1 14.4 0"/>', move: { ay: 3, ao: .4, ad: 220 } }]
  });
  def('hammer', {
    meaning: 'Build: compile, make, assemble.', act: 'strike', aliases: ['build', 'make'],
    replaces: ['T-term hammer'], note: 'It swings once from the grip.',
    parts: [{ els: ['<path d="m12 7 3-3 6 6-3 3z"/>', '<path d="M14.4 10.6 4.5 20.5"/>'], move: { ar: -22, o: [4.5, 20.5], b: 1 } }]
  });
  def('scissors', {
    meaning: 'Cut.', act: 'strike', aliases: ['cut'],
    replaces: ['T-bridge scissors'], note: 'The blades snip.',
    parts: [{ els: ['<circle cx="6.5" cy="6.5" r="2.6"/>', '<path d="M8.7 7.9 20 17.5"/>'], move: { ar: -16, o: [12.6, 11.4], b: 1 } },
      { els: ['<circle cx="6.5" cy="17.5" r="2.6"/>', '<path d="M8.7 16.1 20 6.5"/>'], move: { ar: 16, o: [12.6, 12.6], b: 1 } }]
  });
  def('save', {
    meaning: 'Save.', act: 'strike', aliases: [],
    replaces: ['T-engine save'], note: 'The shutter slides shut.',
    parts: ['<path d="M5.5 3.5h10.7l3.3 3.3v11.7a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z"/>', '<path d="M7.5 20.5v-6h9v6"/>',
      { els: '<path d="M8 3.5v4h6.5v-4"/>', move: { ax: 3, b: 1 } }]
  });
  def('mic', {
    meaning: 'A microphone: voice input.', act: 'strike', aliases: ['microphone', 'voice'],
    replaces: ['T-engine mic'], note: 'The capsule lifts as it listens.',
    parts: ['<path d="M5.5 11.5a6.5 6.5 0 0 0 13 0"/>', '<path d="M12 18v3"/>',
      { els: '<rect x="9" y="3" width="6" height="11" rx="3"/>', move: { ay: -3, b: 1 } }]
  });
  def('browser', {
    meaning: 'A web page or browser window.', act: 'seq', aliases: ['webpage', 'window'],
    replaces: ['T-engine browser'], note: 'The page loads a line. globe (the chat) stays for the web at large.',
    parts: ['<rect x="3" y="4" width="18" height="16" rx="2"/>', '<path d="M3 9h18"/>', '<circle cx="6" cy="6.5" r=".75" class="nx-f"/>', '<circle cx="8.6" cy="6.5" r=".75" class="nx-f"/>',
      { els: '<path d="M7 13.5h7M7 16.5h4"/>', move: { ao: .3, ax: -3 } }]
  });
  def('route', {
    meaning: 'A route: the path work takes from one place to another (model routing, a fallback route).', act: 'seq', aliases: [],
    replaces: ['T-engine route', 'panels transcript route (unregistered today)'], note: 'The path draws from start to end.',
    parts: ['<circle cx="6" cy="6.2" r="2.2"/>', '<circle cx="18" cy="17.8" r="2.2"/>',
      { els: '<path d="M8.2 6.2H15a2.9 2.9 0 0 1 0 5.8H9a2.9 2.9 0 0 0 0 5.8h6.8"/>', move: { ac: '0 16 0 4', ae: '0 0 0 0' } }]
  });
  def('help', {
    meaning: 'Help: how something works. question (the chat) stays for a question asked of you.', act: 'hop', aliases: ['helpcircle'],
    replaces: ['T-obfall helpCircle'], note: 'The question mark hops once.',
    parts: ['<circle cx="12" cy="12" r="9"/>',
      { els: ['<path d="M9.5 9.4a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2.2-2.5 3.7"/>', '<path d="M12 17.1v.1"/>'], move: { ay: -3, b: 1 } }]
  });

  def('share', {
    meaning: 'Share with someone or somewhere else.', act: 'seq', aliases: [],
    replaces: ['home share-with (runtime census 59b0c1aabd)'], note: 'The two far nodes reach out from the near one in turn.',
    parts: ['<circle cx="6" cy="12" r="2.6"/>',
      { els: ['<circle cx="18" cy="5.5" r="2.6"/>', '<path d="M8.3 10.7 15.7 6.8"/>'], move: { ax: -3, ay: 1.6, ao: .5 } },
      { els: ['<circle cx="18" cy="18.5" r="2.6"/>', '<path d="M8.3 13.3 15.7 17.2"/>'], move: { ax: -3, ay: -1.6, ao: .5, ad: 120 } }]
  });

  def('gift', {
    meaning: 'Free: a free plan, credit or allowance.', act: 'strike', aliases: ['free'],
    replaces: ['Usage ui-free (a gift box)'], note: 'The lid lifts off the box.',
    parts: ['<path d="M5 12v7.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V12"/>', '<path d="M12 12v8.5"/>',
      { els: ['<rect x="3.5" y="8" width="17" height="4" rx="1"/>', '<path d="M12 8c-1.5-3.6-5-4-5-1.7C7 8 9.8 8 12 8zM12 8c1.5-3.6 5-4 5-1.7C17 8 14.2 8 12 8z"/>'], move: { ay: -3, b: 1 } }]
  });

  /* people, agents and safekeeping */
  /* robot, redrawn for background activity (D14, Jared 2026-10-28; DL-253): the antenna's light is lit (a filled bead
     on a shorter stem) and blinks, and the eyes glance across. X1 (Jared 2026-10-29): this is the CATEGORY mark for
     agents at 16 px and below (the Activity bar, the status bar's agents item, the panel's tab heads, the rail); each
     individual agent is drawn as Pip (Concepts/glyph-system/opus-5.5/src/logo/pm-logo.js), and the brand is Pip.
     Live, it moves on the 2200 ms beat (pm7-beat.css, .pmg-beat); Reduced Motion shows this rest pose: lit and still. */
  def('robot', {
    meaning: 'Agents: AI workers acting for you, as a category (each agent itself is drawn as Pip; the terminal\'s spark and cursor cell mark an agent at the keyboard).', act: 'seq', aliases: ['agent', 'agents', 'bot'],
    replaces: ['T-core robot', 'T-bridge agents', 'background-activity concept rw-agents (the status bar\'s agents mark, D14)'],
    surfaces: ['status bar agents item (12-14 px)', 'agents and processes panel: Agents tab head', 'chat Activity bar (Subagents domain)', 'left rail'],
    note: 'The antenna light blinks (it dims to .6 and back, 26 % into the beat: 572 ms on the 2200 ms beat) and the eyes glance across. Category mark only (X1): ' +
      'never a stand-in for one agent. user and users (the chat) stay for people.',
    parts: ['<rect x="5" y="8" width="14" height="11.5" rx="3"/>', '<path d="M12 8V5.7M3 12.5v3M21 12.5v3"/>',
      { els: '<circle cx="12" cy="4" r="1.35" class="nx-f"/>', move: { ao: .6, ad: 260 } },
      { els: ['<circle cx="9.5" cy="13.4" r="1.2" class="nx-f"/>', '<circle cx="14.5" cy="13.4" r="1.2" class="nx-f"/>'], move: { ax: 2.4, b: 1 } }]
  });
  def('telescope', {
    meaning: 'Explore or discover (looking far, not searching a list).', act: 'wave', aliases: ['explore', 'discover'],
    replaces: ['T-core telescope'], note: 'The tube tilts up. search (the chat) stays for searching.',
    parts: ['<path d="M11 15.4 8 21.2M11 15.4l3 5.8"/>',
      { els: ['<path d="M3.6 14.6 16.4 7.4l1.9 3.4L5.5 18z"/>', '<path d="M18.3 6.6l1.6-.9 1.7 3-1.6.9"/>'], move: { ar: -14, o: [11, 15.4], b: 1 } }]
  });
  def('vault', {
    meaning: 'A vault: where secrets and credentials are kept.', act: 'wave', aliases: ['safe', 'secrets'],
    replaces: ['T-art vault'], note: 'The dial turns. shield (the chat) stays for protection and policy.',
    parts: ['<rect x="3.5" y="4" width="17" height="15" rx="2"/>', '<path d="M6.5 19v1.6M17.5 19v1.6"/>',
      { els: ['<circle cx="12" cy="11.5" r="3.4"/>', '<path d="M12 8.1v1.4"/>'], move: { ar: 90, o: [12, 11.5], b: 1 } }]
  });
})();
