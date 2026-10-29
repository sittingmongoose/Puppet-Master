/* rw-glyphs.js — the two glyphs this concept needs, added to the one registry (Background activity concept, Opus 5.5).
 *
 * Jared, 2026-10-27: the chat's domain uses the status bar's processes symbol (>_), and both it and the agents symbol
 * take the neon look the other domain icons have. They go through PMG.def, the glyph system's own way to add a glyph
 * (Concepts/glyph-system/opus-5.5/src/registry/00-loader.js), in its grammar (docs/NEON-GRAMMAR.md): a 24 grid,
 * round tubes, at most two moving parts, the rest pose is the finished drawing, transform and opacity only.
 *
 * - processes: the terminal's >_ in a console frame. The frame gives it the weight of Goal, Subagents and Artifacts
 *   beside it in the Activity bar, and keeps it apart from the bare >_, which means a terminal tab. Its verb: the
 *   cursor types in and the prompt nudges.
 * - agents: the registry's robot (objects.js, "An agent"), redrawn with a lit antenna. In canon this is a redraw of
 *   robot, not a second agent glyph, so every surface that shows an agent changes with it (IMPACT_TRACKER.md).
 *
 * Both take their colour from status, never from the glyph: the Activity bar's tone inks (TONE_INK) in the chat, the
 * glyph inks (--pmg-ink-*) in the status bar.
 */
(function () {
  'use strict';
  var RW = window.RW, G = window.PMG;
  if (!RW || !G || RW.GLYPH) return;
  function def(name, r) { if (!G.has(name)) G.def(name, r); return G.has(name); }
  var proc = def('rw-processes', {
    family: 'activity', role: 'concept', act: 'seq',
    meaning: 'Processes: the commands, servers, watchers and scripts agents started, running in the background.',
    replaces: ['background-activity concept: the chat domain\'s pulse and the status bar\'s terminal mark'],
    note: 'The cursor types in and the prompt nudges. The bare >_ (terminal) stays the terminal tab.',
    parts: [
      '<rect x="3" y="4" width="18" height="16" rx="3"/>',
      { els: '<path d="m7 9 3 3-3 3"/>', move: { ax: -1.6, ao: .6, b: 1 } },
      { els: '<path d="M12.5 15h4.5"/>', move: { ao: .6, ac: '0 9.7 0 11.5', ae: '0 6 0 11.5', ad: 160 } }
    ]
  });
  var agents = def('rw-agents', {
    family: 'activity', role: 'concept', act: 'seq',
    meaning: 'Agents: AI workers acting for you (a redraw of robot: the antenna light is lit and blinks).',
    replaces: ['objects robot (proposed redraw)', 'background-activity concept: the status bar\'s robot mark'],
    note: 'The antenna light blinks and the eyes glance across.',
    parts: [
      '<rect x="5" y="8" width="14" height="11.5" rx="3"/>', '<path d="M12 8V5.7M3 12.5v3M21 12.5v3"/>',
      { els: '<circle cx="12" cy="4" r="1.35" class="nx-f"/>', move: { ao: .6, ad: 260 } },
      { els: ['<circle cx="9.5" cy="13.4" r="1.2" class="nx-f"/>', '<circle cx="14.5" cy="13.4" r="1.2" class="nx-f"/>'], move: { ax: 2.4, b: 1 } }
    ]
  });
  RW.GLYPH = { processes: proc ? 'rw-processes' : 'terminal', agents: agents ? 'rw-agents' : 'robot' };
  /* lit: the halo copies ride with the moving parts, as the Activity bar's own domain glyphs do (neon-icons.js LIT) */
  RW.glyph = function (which, size, cls) { return RW.icon(RW.GLYPH[which], size || 12, 'nx nx-r-concept nx-lit' + (cls ? ' ' + cls : '')); };
})();
