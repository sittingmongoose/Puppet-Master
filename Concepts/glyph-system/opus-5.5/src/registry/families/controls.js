/* families/controls.js: controls the chat set lacks (pm7-glyphs). Unlit at rest, they ignite on hover and play their act
 * once (neon-icons.css section 8). The arrows are the chat's arrow-right turned, with the same travel and act. */
(function () {
  'use strict';
  var G = window.PMG; if (!G) return;
  function def(name, r) { r.family = 'controls'; r.role = 'control'; G.def(name, r); }

  def('arrow-up', {
    meaning: 'Up: previous match, move up, scroll to top.', act: 'strike', aliases: ['arrowup', 'previous'],
    replaces: ['T-bridge arrowUp', 'panels find arrowUp', 'terminal find prev'],
    parts: [{ els: ['<path d="M12 19.5v-15"/>', '<path d="m6 10.5 6-6 6 6"/>'], move: { ay: -3, b: 1 } }]
  });
  def('arrow-down', {
    meaning: 'Down: next match, move down, scroll to bottom.', act: 'strike', aliases: ['arrowdown', 'arrowdn', 'next'],
    replaces: ['T-bridge arrowDn', 'T-usage-svg arrowDown', 'panels find arrowDown', 'terminal find next'],
    parts: [{ els: ['<path d="M12 4.5v15"/>', '<path d="m6 13.5 6 6 6-6"/>'], move: { ay: 3, b: 1 } }]
  });
  def('arrow-left', {
    meaning: 'Left: back.', act: 'strike', aliases: ['back'],
    replaces: [],
    parts: [{ els: ['<path d="M19.5 12h-15"/>', '<path d="m10.5 6-6 6 6 6"/>'], move: { ax: -3, b: 1 } }]
  });
  /* grip: six beads, the drag handle. Static: it moves with what it drags. r 1 dots like the chat's more. */
  def('grip', {
    meaning: 'Drag handle: grab here to move or reorder.', act: 'none', aliases: ['drag', 'toolgrip'],
    replaces: ['T-bridge grip', 'T-usage-svg drag', 'T-usage-svg toolGrip', 'panels grip'],
    parts: ['<circle cx="9" cy="6" r="1.15" class="nx-f"/>', '<circle cx="15" cy="6" r="1.15" class="nx-f"/>', '<circle cx="9" cy="12" r="1.15" class="nx-f"/>',
      '<circle cx="15" cy="12" r="1.15" class="nx-f"/>', '<circle cx="9" cy="18" r="1.15" class="nx-f"/>', '<circle cx="15" cy="18" r="1.15" class="nx-f"/>']
  });
})();
