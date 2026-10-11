/* families/rail.js: the left rail (concept D, Polish). OWNER: pm7-glyphs.
 * The rail draws nothing of its own that the set lacks: its activity items and its panels' icons are chat glyphs or
 * objects (the before-and-after map lists each one), and its status set (leftrail-redesign src/concepts/d/00-d.js SOLID
 * and G) becomes the shared status vocabulary (DL-162, RAIL-4). This file records those mappings so the rail's specs
 * can cite one place. The rail's solid knock-out badges (a filled disc with the mark cut out) give way to the neon
 * tube marks: one drawing per state everywhere.
 */
(function () {
  'use strict';
  var G = window.PMG; if (!G) return;
  var F = 'rail';
  function m(name, items, meaning) { G.map(name, { family: F, replaces: items, surfaces: ['left rail'], meaning: meaning }); }
  m('st-complete', ['d SOLID.ok (a solid disc with a cut-out tick)']);
  m('st-failed', ['d SOLID.fail (a solid disc with a cut-out cross; the ringed cross, GLY-1)']);
  m('st-blocked', ['d SOLID.blocked (a solid disc with a cut-out bar)']);
  m('st-working', ['d G.live and G.run (a dot with a halo)']);
  m('st-idle', ['d G.idle (a ring)']);
  m('st-pending', ['d G.pending (a dashed ring that turns)', 'd G.unknown (a dashed ring with a question mark)']);
  m('st-skipped', ['d G.stale (a clock in a ring)', 'd G.orphan (a broken ring)', 'F3-619 expired, superseded, terminated']);
  m('ring-dot', ['d G.current (a ring with a dot): where you are, a position marker, not a state']);
  m('stash', ['d G.stash (a tray)']);
})();
