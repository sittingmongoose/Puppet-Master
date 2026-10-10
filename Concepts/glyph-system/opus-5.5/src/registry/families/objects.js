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
      { els: '<path d="M3 11.6 12 4l9 7.6"/>', move: { ay: -2.4, b: 1 } }]
  });
  def('bell', {
    meaning: 'Notifications.', act: 'wave', aliases: ['notifications'],
    replaces: ['T-core bell', 'T-bridge bell'], note: 'The bell swings from its crown and the clapper follows a beat later.',
    parts: [{ els: '<path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.6 2H4.9z"/>', move: { ar: 12, o: [12, 4], b: 1 } },
      { els: '<path d="M10.1 21a2 2 0 0 0 3.8 0"/>', move: { ax: 1.6, ad: 90, b: 1 } }]
  });
  def('layers', {
    meaning: 'Layers or a stack of things (runs, packs, levels).', act: 'strike', aliases: ['stack'],
    replaces: ['T-core layers', 'T-bridge layers', 'T-art stack'], note: 'The top sheet lifts off the stack.',
    parts: ['<path d="M3.5 12.6 12 17.4l8.5-4.8"/>', '<path d="M3.5 16.8 12 21.6l8.5-4.8"/>',
      { els: '<path d="M12 3.4 20.5 8.2 12 13 3.5 8.2z"/>', move: { ay: -2.2, b: 1 } }]
  });
  def('key', {
    meaning: 'A key or credential (API keys, sign-in secrets).', act: 'wave', aliases: ['credential'],
    replaces: ['T-bridge key', 'T-art key', 'T-usage-svg key'], note: 'The key turns as if in a lock.',
    parts: [{ els: ['<circle cx="7.5" cy="16.5" r="4"/>', '<path d="M10.4 13.6 19.5 4.5"/>', '<path d="m15.8 8.2 2.6 2.6M18.2 5.8l2 2"/>'], move: { ar: -22, o: [7.5, 16.5], b: 1 } }]
  });
  def('cloud', {
    meaning: 'A cloud service or remote host.', act: 'wave',
    replaces: ['T-art cloud'], note: 'It drifts.',
    parts: [{ els: '<path d="M7.2 18.5h10.1a4.1 4.1 0 0 0 .5-8.15A5.6 5.6 0 0 0 7 9.4a4.55 4.55 0 0 0 .2 9.1z"/>', move: { ax: 2.2, b: 1 } }]
  });
  def('server', {
    meaning: 'A server, machine or host.', act: 'seq', aliases: ['host', 'machine'],
    replaces: ['T-art server'], note: 'The two status lights blink in turn.',
    parts: ['<rect x="4" y="4" width="16" height="7" rx="2"/>', '<rect x="4" y="13" width="16" height="7" rx="2"/>', '<path d="M11.5 7.5h5M11.5 16.5h5"/>',
      { els: '<circle cx="7.6" cy="7.5" r="1" class="nx-f"/>', move: { ao: .2 } },
      { els: '<circle cx="7.6" cy="16.5" r="1" class="nx-f"/>', move: { ao: .2, ad: 180 } }]
  });
  def('phone', {
    meaning: 'A phone or mobile device.', act: 'wave', aliases: ['mobile'],
    replaces: ['T-art phone'], note: 'It buzzes once.',
    parts: [{ els: ['<rect x="7" y="2.8" width="10" height="18.4" rx="2.4"/>', '<path d="M11 18h2"/>'], move: { ar: 9, o: [12, 12], b: 1 } }]
  });
  def('monitor', {
    meaning: 'A computer or display.', act: 'seq', aliases: ['computer', 'desktop'],
    replaces: ['T-bridge monitor', 'T-art computer'], note: 'The prompt line on the screen lights. monitor-play (the chat) stays for playback.',
    parts: ['<rect x="2.5" y="3.5" width="19" height="13" rx="2"/>', '<path d="M8 20.5h8M12 16.5v4"/>',
      { els: '<path d="M6.5 8h5"/>', move: { ao: .25, ax: -1.5, b: 1 } }]
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
    meaning: 'Credits or a balance.', act: 'drop', aliases: ['credits'],
    replaces: ['T-usage-svg coin'], note: 'The top coin drops onto the stack.',
    parts: ['<path d="M5 7.8v4.4c0 1.6 3.1 2.9 7 2.9s7-1.3 7-2.9V7.8"/>', '<path d="M5 12.2v4.4c0 1.6 3.1 2.9 7 2.9s7-1.3 7-2.9v-4.4"/>',
      { els: '<ellipse cx="12" cy="7.8" rx="7" ry="2.9"/>', move: { ay: -3 } }]
  });
  def('wallet', {
    meaning: 'Spend or a payment method.', act: 'strike', aliases: ['spend', 'billing'],
    replaces: ['T-usage-svg wallet'], note: 'The clasp closes.',
    parts: ['<path d="M18.5 7V5a1.5 1.5 0 0 0-1.5-1.5H6a2.5 2.5 0 0 0 0 5h13.5A1.5 1.5 0 0 1 21 10v8.5a1.5 1.5 0 0 1-1.5 1.5H6A2.5 2.5 0 0 1 3.5 17.5V6"/>',
      { els: '<path d="M21 12h-3.4a1.9 1.9 0 0 0 0 3.8H21"/>', move: { ax: 2.4, b: 1 } }]
  });
  def('briefcase', {
    meaning: 'Work, an organisation or a team account.', act: 'strike', aliases: ['work', 'organisation'],
    replaces: ['T-usage-svg briefcase'], note: 'The handle lifts.',
    parts: ['<rect x="3" y="7.5" width="18" height="12.5" rx="2"/>', '<path d="M3 12.8h18M12 12v2"/>',
      { els: '<path d="M9 7.5V5.6a1.1 1.1 0 0 1 1.1-1.1h3.8A1.1 1.1 0 0 1 15 5.6v1.9"/>', move: { ay: -2, b: 1 } }]
  });
  def('scales', {
    meaning: 'Weighing options: compare, judge, policy.', act: 'wave', aliases: ['compare', 'judge'],
    replaces: ['T-core scales'], note: 'The beam tips and settles.',
    parts: ['<path d="M12 4.5v15.5M8 20h8"/>',
      { els: ['<path d="M4.8 7.5h14.4"/>', '<path d="M4.8 7.5 2.6 13a2.3 2.3 0 0 0 4.4 0z"/>', '<path d="M19.2 7.5 17 13a2.3 2.3 0 0 0 4.4 0z"/>'], move: { ar: 8, o: [12, 7.5], b: 1 } }]
  });

  /* making and tools */
  def('wrench', {
    meaning: 'Tools and maintenance (tools, doctor, repair).', act: 'wave', aliases: ['tool', 'toolbox', 'tools'],
    replaces: ['T-core toolbox', 'T-usage-svg tool'], note: 'It gives one turn.',
    parts: [{ els: '<path d="M14.6 6.4a4.2 4.2 0 0 0-5.3 5.3L3.8 17.2a2.1 2.1 0 0 0 3 3l5.5-5.5a4.2 4.2 0 0 0 5.3-5.3l-2.4 2.4-2.6-.5-.5-2.6z"/>', move: { ar: -18, o: [12, 12], b: 1 } }]
  });
  def('palette', {
    meaning: 'Looks and colour (theme, appearance).', act: 'seq', aliases: ['theme', 'appearance'],
    replaces: ['T-core palette'], note: 'The paints light one by one.',
    parts: ['<path d="M12 3a9 9 0 0 0 0 18c1.3 0 2-.9 2-1.9 0-1.3-1-1.7-1-2.9 0-1.1.9-1.9 2.1-1.9H17a4 4 0 0 0 4-4C21 6.2 17 3 12 3z"/>',
      { els: '<circle cx="7.6" cy="11.2" r="1.15" class="nx-f"/>', move: { ao: .2 } },
      { els: '<circle cx="9.9" cy="7.2" r="1.15" class="nx-f"/>', move: { ao: .2, ad: 110 } },
      { els: '<circle cx="14.5" cy="7.2" r="1.15" class="nx-f"/>', move: { ao: .2, ad: 220 } }]
  });
  def('puzzle', {
    meaning: 'An extension, plugin or integration that fits in.', act: 'strike', aliases: ['extension', 'plugin', 'integration'],
    replaces: ['T-core puzzle'], note: 'The piece slides into place. plug (the chat) stays for a connection.',
    parts: [{ els: '<path d="M5 7.5h3.8a2.2 2.2 0 1 1 4.4 0H17v3.8a2.2 2.2 0 1 1 0 4.4v3.8h-3.8a2.2 2.2 0 1 0-4.4 0H5z"/>', move: { ax: -2.6, b: 1 } }]
  });
  def('film', {
    meaning: 'A recording or video.', act: 'seq', aliases: ['video', 'recording'],
    replaces: ['T-core film'], note: 'The frames advance one step.',
    parts: ['<rect x="3" y="3.5" width="18" height="17" rx="2"/>', '<path d="M7.5 3.5v17M16.5 3.5v17"/>',
      { els: '<path d="M3 8.5h4.5M3 15.5h4.5M16.5 8.5H21M16.5 15.5H21"/>', move: { ay: 2.5, ao: .5 } }]
  });
  def('rocket', {
    meaning: 'Launch, deploy or ship.', act: 'strike', aliases: ['launch', 'deploy', 'ship'],
    replaces: ['T-core rocket'], note: 'It lifts and its flame flickers. send (the chat) stays for sending a message.',
    parts: [{ els: ['<path d="M12 2.9c3.4 2.1 4.9 5.4 4.9 9.3l-1.7 3.5H8.8l-1.7-3.5c0-3.9 1.5-7.2 4.9-9.3z"/>', '<circle cx="12" cy="9.4" r="1.7"/>', '<path d="M8.6 14.6 5.8 17.2l.7-4.3M15.4 14.6l2.8 2.6-.7-4.3"/>'], move: { ay: -2.6, b: 1 } },
      { els: '<path d="M10.6 18.6 12 21.2l1.4-2.6"/>', move: { ao: .25, ad: 80, b: 1 } }]
  });
  def('flame', {
    meaning: 'Hot or burning fast (a streak, a hot path, high burn rate).', act: 'wave', aliases: ['hot', 'burn'],
    replaces: ['T-bridge flame'], note: 'The inner flame flickers up.',
    parts: ['<path d="M12 21.5c-3.5 0-6-2.4-6-5.6 0-3.3 2.6-5 3.2-8.4 1.9 1.1 2.8 2.8 2.8 4.5 1-.6 1.7-1.8 1.8-3.2 2.4 1.9 4.2 4.4 4.2 7.1 0 3.2-2.5 5.6-6 5.6z"/>',
      { els: '<path d="M12 21.5c-1.4 0-2.4-1-2.4-2.4 0-1.5 1.2-2.4 2.4-3.6 1.2 1.2 2.4 2.1 2.4 3.6 0 1.4-1 2.4-2.4 2.4z"/>', move: { ay: -1.8, ao: .45 } }]
  });
  def('sprout', {
    meaning: 'Something new and growing (a new project, a seed, onboarding).', act: 'strike', aliases: ['plant', 'seed', 'grow'],
    replaces: ['T-core plant', 'T-art seed'], note: 'The leaves rise from the stem.',
    parts: ['<path d="M12 21v-8.5M7.5 21h9"/>',
      { els: ['<path d="M12 13.2c0-3.6-2.6-6.2-6.7-6.2 0 3.9 2.7 6.2 6.7 6.2z"/>', '<path d="M12 11.2c0-3.3 2.4-5.6 6.2-5.6 0 3.6-2.4 5.6-6.2 5.6z"/>'], move: { ay: 2.4, ao: .4 } }]
  });
  def('party', {
    meaning: 'A celebration: a milestone reached.', act: 'seq', aliases: ['celebrate', 'milestone'],
    replaces: ['T-core party'], note: 'The confetti bursts out of the popper.',
    parts: ['<path d="M4 20.5 8.6 9.3l6.1 6.1z"/>',
      { els: ['<path d="M14 3.8v2.2M19.6 9.4h-2.2M18 5.6l-1.6 1.6"/>', '<circle cx="10.6" cy="4.8" r=".95" class="nx-f"/>', '<circle cx="20" cy="13.6" r=".95" class="nx-f"/>'], move: { ax: 1.6, ay: -1.6, ao: .3, b: 1 } }]
  });

  /* people, agents and safekeeping */
  def('robot', {
    meaning: 'An agent: an AI worker acting for you.', act: 'blink', aliases: ['agent', 'agents', 'bot'],
    replaces: ['T-core robot', 'T-bridge agents'], note: 'It blinks. user and users (the chat) stay for people.',
    parts: ['<rect x="5" y="8" width="14" height="11.5" rx="3"/>', '<path d="M12 8V5.2M3 12.5v3M21 12.5v3"/>', '<circle cx="12" cy="4.2" r="1"/>',
      { els: ['<circle cx="9.5" cy="13.4" r="1.15" class="nx-f"/>', '<circle cx="14.5" cy="13.4" r="1.15" class="nx-f"/>'], move: { ao: .15 } }]
  });
  def('telescope', {
    meaning: 'Explore or discover (looking far, not searching a list).', act: 'wave', aliases: ['explore', 'discover'],
    replaces: ['T-core telescope'], note: 'The tube tilts up. search (the chat) stays for searching.',
    parts: ['<path d="M11 15.4 8 21.2M11 15.4l3 5.8"/>',
      { els: ['<path d="M3.6 14.6 16.4 7.4l1.9 3.4L5.5 18z"/>', '<path d="M18.3 6.6l1.6-.9 1.7 3-1.6.9"/>'], move: { ar: -8, o: [11, 15.4], b: 1 } }]
  });
  def('vault', {
    meaning: 'A vault: where secrets and credentials are kept.', act: 'wave', aliases: ['safe', 'secrets'],
    replaces: ['T-art vault'], note: 'The dial turns. shield (the chat) stays for protection and policy.',
    parts: ['<rect x="3.5" y="4" width="17" height="15" rx="2"/>', '<path d="M6.5 19v1.6M17.5 19v1.6"/>',
      { els: ['<circle cx="12" cy="11.5" r="3.4"/>', '<path d="M12 8.1v1.4"/>'], move: { ar: 90, o: [12, 11.5], b: 1 } }]
  });
})();
