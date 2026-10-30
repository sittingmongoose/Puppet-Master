/* menus.js — feature module.  OWNER: Wave 3 — Menus agent (item 5: the worktree selector in the top bar)
 *
 * Load order (see build.py): data.js, motion.js, variants-*.js, then EVERY feature
 * module, then app.js.  Modules therefore run BEFORE the app boots, so anything
 * registered here is live on the very first render — no re-render, no flash.
 *
 * The menus' corner-origin sprout, their asymmetric close and their list-resize height spring were this module's
 * (a MutationObserver on #pmOverlayRoot and a ghost clone for the close) until 2026-10-30 (Jared, L8 B: one sprout
 * owner for every menu). They are PM6_SPROUT's now: PMConcept7's base/script/pm7-sprout.js and its class contract
 * pm7-sprout.css, which build.py reads into this page; app.js opens and closes each menu through it (sproutOverlays,
 * sproutLeave). What is left here moves the worktree selector into the chat header via `headerExtras`, with its
 * visual state driven from D.operational.worktrees.
 */
(function () {
  'use strict';

  var EXT = window.PM56_EXT;

  /* ==================================================================
     B. Worktree control in the top bar
     ================================================================== */

  /* Driven from D.operational.worktrees (data.js:1871), whose ids are exactly
     the four values app.js's worktree menu offers, rather than from the bare
     state.worktree string.  The fallback keeps the control honest if a
     worktree is selected that the fixture does not describe: it says so
     instead of inventing a clean state. */
  function worktreeRecord(ctx) {
    var list = (ctx.D.operational && ctx.D.operational.worktrees) || [];
    var cur = ctx.state.worktree;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === cur || list[i].label === cur) return list[i];
    }
    return { id: cur, label: cur, state: 'unknown', stateLabel: 'State not reported',
             dirtyFiles: 0, ahead: 0, behind: 0, conflicts: null, note: '' };
  }

  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }

  function worktreeTitle(w) {
    var lines = ['Worktree · ' + w.label];
    lines.push(w.stateLabel || w.state);
    if (w.state === 'bound-conflict' && w.conflicts && w.conflicts.length) {
      lines.push(plural(w.conflicts.length, 'conflicting file') + ': ' + w.conflicts.join(', '));
    }
    if (w.dirtyFiles) lines.push(plural(w.dirtyFiles, 'uncommitted file'));
    if (w.ahead || w.behind) lines.push(w.ahead + ' ahead · ' + w.behind + ' behind');
    if (w.state === 'unbound') lines.push('No checkout yet. Selecting it creates the worktree first.');
    if (w.path) lines.push(w.path);
    return lines.join('\n');
  }

  if (EXT && EXT.slot) {
    EXT.slot('headerExtras', function (ctx) {
      var w = worktreeRecord(ctx);
      /* data-k is mandatory here: .chat-header survives the 2s work tick, and
         an unkeyed node would be re-mounted — and re-animated — twice a
         second.  data-menu-anchor="worktree" must be unique in the document;
         menus.css hides the composer's copy until app.js drops it. */
      return '<button class="icon-button worktree-button" data-k="wtbtn"' +
             ' data-action="open-menu" data-menu="worktree" data-menu-anchor="worktree"' +
             ' data-wt-state="' + ctx.esc(w.state) + '"' +
             ' aria-label="' + ctx.esc('Worktree ' + w.label + ' — ' + (w.stateLabel || w.state)) + '"' +
             ' data-hover-key="worktree" data-hover-tip="' + ctx.esc(worktreeTitle(w)) + '">' +
             ctx.icon('branch', 14) +
             '<i class="wt-dot" aria-hidden="true"></i>' +
             '</button>';
    });
  }

  /* Small read-only surface so a second agent's harness can assert this
     module's state without reaching into the closure. */
  window.PM56_MENUS = {
    version: 2,
    worktree: worktreeRecord
  };
})();
