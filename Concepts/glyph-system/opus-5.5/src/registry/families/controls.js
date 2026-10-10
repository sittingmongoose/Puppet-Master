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
  def('menu', {
    meaning: 'A menu of more actions (the three-line menu).', act: 'strike', aliases: ['hamburger', 'dash-menu'],
    replaces: ['T-engine menu', 'T-single dash-menu'],
    parts: ['<path d="M4 6.5h16M4 17.5h16"/>', { els: '<path d="M4 12h16"/>', move: { ax: -3, ao: .5, b: 1 } }]
  });
  def('grid', {
    meaning: 'Grid view.', act: 'seq', aliases: ['grid-view', 'tiles'],
    replaces: ['T-usage-svg grid', 'T-usage-base grid', 'T-bridge compose'],
    parts: ['<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/>', '<rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>', '<rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
      { els: '<rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/>', move: { ao: .3, b: 1 } }]
  });
  def('list', {
    meaning: 'List view.', act: 'seq', aliases: ['list-view', 'rows'],
    replaces: ['T-usage-base list'],
    parts: ['<circle cx="5" cy="6" r="1.1" class="nx-f"/>', '<circle cx="5" cy="12" r="1.1" class="nx-f"/>', '<circle cx="5" cy="18" r="1.1" class="nx-f"/>',
      { els: '<path d="M9 6h11"/>', move: { ax: -2.4, ao: .4 } }, { els: '<path d="M9 12h11"/>', move: { ax: -2.4, ao: .4, ad: 90 } }, { els: '<path d="M9 18h11"/>', move: { ax: -2.4, ao: .4, ad: 180 } }]
  });
  def('resize', {
    meaning: 'Resize handle: drag to change the size.', act: 'none', aliases: ['dash-resize', 'usage-resize', 'size'],
    replaces: ['T-single dash-resize', 'T-single usage-resize', 'T-usage-svg size'],
    parts: ['<path d="M20 13.5 13.5 20M20 7.5 7.5 20"/>']
  });
  def('move', {
    meaning: 'Move: drag in any direction.', act: 'swap', aliases: ['dash-move'],
    replaces: ['T-single dash-move'],
    parts: ['<path d="M12 4v16M4 12h16"/>',
      { els: '<path d="m9 6.5 3-3 3 3M9 17.5l3 3 3-3"/>', move: { ao: .35, b: 1 } },
      { els: '<path d="m6.5 9-3 3 3 3M17.5 9l3 3-3 3"/>', move: { ao: .35, ad: 140, b: 1 } }]
  });
})();
