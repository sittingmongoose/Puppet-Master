/* 10-status.js: the status vocabulary's PM7 additions and the candidates the open decision cards show.
 * OWNER: pm7-glyphs. The chat's 13 marks (neon-icons.js STATUS) are the base; the catalog lists them with the words
 * each PM7 surface uses (src/data/status.json). A candidate here is drawn only so its card can show it: nothing is
 * adopted until Jared answers the card.
 */
(function () {
  'use strict';
  var G = window.PMG; if (!G) return;

  /* GLY-1, option A: failed becomes a ring with an exclamation mark (the triangle is then warning's alone). The ring
     is the status set's own (r 7.5, like working, pending and skipped), so failed reads as a member of the family;
     the stem and dot are the chat triangle's (4.2 units and a .1 dot), raised to sit in the ring's optical centre.
     It stays static: failed's motion is its wrapper's irregular stutter (neon-icons.css section 9). */
  G.def('st-failed-ring', {
    family: 'status', role: 'status', act: 'none',
    meaning: 'Failed: the run, step or command ended in an error (GLY-1 option A).',
    replaces: ['st-failed (the warning triangle) in the chat set'],
    note: 'Candidate for card GLY-1. Static; the wrapper stutters.',
    parts: ['<circle cx="12" cy="12" r="7.5"/>', '<path d="M12 8v4.6"/>', '<path d="M12 15.8v.1"/>']
  });

  /* GLY-1, option B: warning gets its own shape and the triangle stays failed's. A diamond (a road-sign warning
     turned on its point) with the same stem and dot. */
  G.def('st-warning-diamond', {
    family: 'status', role: 'status', act: 'none',
    meaning: 'Warning: something needs care but nothing has failed (GLY-1 option B).',
    note: 'Candidate for card GLY-1.',
    parts: ['<path d="M12 3.6 20.4 12 12 20.4 3.6 12z"/>', '<path d="M12 8.4v4.2"/>', '<path d="M12 15.6v.1"/>']
  });
})();
