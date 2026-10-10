/* 10-status.js: the status vocabulary's PM7 additions and the candidates the open decision cards show.
 * OWNER: pm7-glyphs. The chat's 13 marks (neon-icons.js STATUS) are the base. The inventory (216 status rows across
 * PMConcept7, the panels and the terminal) found five meanings the 13 do not carry: warning (35 rows, the most common
 * state in PM7), off (not set up, disabled, not installed), offline (a service cannot be reached), info (a neutral
 * notice) and the file change marks. They are drawn here in the set's own grammar: the status ring is r 7.5 (working,
 * pending, skipped), marks inside it sit in the optical centre, strokes are the family's, and a status mark is static
 * unless its meaning is live (its wrapper carries any rhythm; neon-icons.css section 9).
 * Jared answered GLY-0..3 as recommended on 2026-10-10 (D44): the set, the vocabulary and these marks are adopted.
 */
(function () {
  'use strict';
  var G = window.PMG; if (!G) return;
  var RING = '<circle cx="12" cy="12" r="7.5"/>';

  /* failed: a ring with a cross (GLY-1, answered A by Jared 2026-10-10, D44). The chat set draws it itself since the
     rollout's chat step (neon-icons.js st-failed); this record says what it replaces. */
  G.map('st-failed', {
    family: 'status', meaning: 'Failed: the run, step or command ended in an error.',
    replaces: ['the chat set\'s former st-failed (the warning triangle)', 'rail fail (a cross)', 'panels tools and document error marks (a circled cross)']
  });
  /* warning: the chat set's warning triangle as a status mark (GLY-1 A). */
  G.def('st-warning', {
    family: 'status', role: 'status', act: 'none',
    meaning: 'Warning: something needs care, but nothing has failed (degraded, low quota, setup incomplete).',
    replaces: ['rail warn', 'Settings attention', 'Usage low or degraded', 'panels Problems warning', 'frames warn'],
    note: 'The chat set\'s warning drawing (GLY-1 A).',
    parts: ['<path d="M12 4.2 21 19.5H3z"/>', '<path d="M12 10v4.2M12 17.1v.1"/>']
  });

  /* info: the chat's info (a ring and an i) at the status ring's size, so a notice sits in a list beside the others. */
  G.def('st-info', {
    family: 'status', role: 'status', act: 'none',
    meaning: 'Info: a neutral notice; nothing is wrong and nothing is asked.',
    replaces: ['Settings info tone (checking, syncing, recommended)', 'frames info notice', 'unread and notify dots'],
    parts: [RING, '<path d="M12 11.2v4.6"/>', '<path d="M12 8.3v.1"/>']
  });
  /* off: the power symbol, the sign people already read as "switched off" (not set up, disabled, not installed). A
     ring with a bar was the first sketch; the left rail's status set (leftrail-redesign d/00-d.js SOLID.blocked) and the
     road sign both read a barred ring as "no entry", which is blocked. Muted, like paused. */
  G.def('st-off', {
    family: 'status', role: 'status', act: 'none',
    meaning: 'Off: not set up, disabled or not installed; nothing is running and nothing is wrong.',
    replaces: ['Settings off tone (not set up, not installed, not connected, disabled)', 'Usage minusCircle (needs a seat)'],
    parts: ['<path d="M7.7 7.3a6.6 6.6 0 1 0 8.6 0"/>', '<path d="M12 4.6v6.6"/>']
  });
  /* offline: a chain link pulled apart, sparks at the break: a service or provider that should answer and cannot be
     reached. Its two halves are the chat's link drawn as two capsules on the same diagonal, 5 units apart so the
     break still shows at 12 px (a 3-unit gap read as an unbroken link). */
  G.def('st-offline', {
    family: 'status', role: 'status', act: 'none',
    meaning: 'Offline: a service, provider or machine that should answer cannot be reached.',
    replaces: ['Usage provider unavailable', 'Settings can\'t reach the address', 'state-badge Offline'],
    parts: [
      '<path d="M17.18 10.22 19.02 8.38a2.4 2.4 0 0 0-3.39-3.39L13.78 6.82a2.4 2.4 0 0 0 3.39 3.39z"/>',
      '<path d="M8.38 19.02 10.22 17.18a2.4 2.4 0 0 0-3.39-3.39L4.98 15.62a2.4 2.4 0 0 0 3.39 3.39z"/>',
      '<path d="M9.4 9.4 10.6 10.6M14.6 14.6 13.4 13.4"/>'
    ]
  });

  /* The file change marks (editor, source control, document history): one rounded square, four marks. Added and
     deleted are the plus and minus, modified the dot, renamed the arrow. They are not run states, so they never sit in
     a status ring. */
  var SQ = '<rect x="4.5" y="4.5" width="15" height="15" rx="3.5"/>';
  G.def('change-added', { family: 'status', role: 'status', act: 'none', meaning: 'Added: a new file or item.', replaces: ['editor Added', 'git A and untracked ?', 'document made'], parts: [SQ, '<path d="M12 8.7v6.6M8.7 12h6.6"/>'] });
  G.def('change-modified', { family: 'status', role: 'status', act: 'none', meaning: 'Modified: changed since it was saved or committed.', replaces: ['editor Modified', 'git M', 'tab dirty dot', 'document edited'], parts: [SQ, '<circle cx="12" cy="12" r="2.4" class="nx-f"/>'] });
  G.def('change-deleted', { family: 'status', role: 'status', act: 'none', meaning: 'Deleted: removed.', replaces: ['editor Deleted', 'git D', 'document deleted'], parts: [SQ, '<path d="M8.7 12h6.6"/>'] });
  G.def('change-conflict', { family: 'status', role: 'status', act: 'none', meaning: 'Conflict: two changes collide and someone must choose.', replaces: ['rail conflict (a diamond with a cross)', 'git C and U'], parts: [SQ, '<path d="M12 8.2v4.6"/>', '<path d="M12 15.7v.1"/>'] });
  G.def('change-renamed', { family: 'status', role: 'status', act: 'none', meaning: 'Renamed or moved.', replaces: ['editor Renamed', 'git R'], parts: [SQ, '<path d="M8.4 12h6.6M12.6 9.3 15.3 12l-2.7 2.7"/>'] });
})();
