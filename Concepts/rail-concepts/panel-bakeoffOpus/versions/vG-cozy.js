/* PANEL BAKEOFF — vG  COZY SHELVES  (registration / wiring only)
   =========================================================================
   THESIS — shelf grammar

   Every panel is a stack of SHELVES. A shelf is a titled container that
   states what you are looking at and how many of them there are BEFORE it
   shows a single row, so the reader never has to infer the subject of a list
   from the list itself.

   Four properties, and every rule in _pm-cozy.css exists to hold one:

     1. A shelf says WHAT and HOW MANY first. The header line is label,
        count, state — always in that order, always in the same slots.
     2. A row is IDENTITY on line 1, QUALIFICATION on line 2. Line 2 is
        emitted even when it is empty, so it never moves between rows, panels
        or widths. Nothing ever migrates from one line to the other.
     3. ONE semantic accent per shelf. `--cz-cat` is owned by the shelf via
        data-cz-state and is the WORST state the shelf contains (CZ.worst).
        Rows never introduce a second hue. --accent-primary stays reserved
        for selection and primary action, because in retro-dark it is lime
        and a lime category chip would read as "selected".
     4. Four primitives — shelf, row, exRow+body, kv — composed identically
        in all eight panels. A panel that needs a fifth shape has drifted.

   Depth is the pressure that breaks narrow panels, and DISCLOSURE is the
   pressure valve: nothing nested is shown by expanding the row's width, it
   is shown by expanding the row's height, in place, with the identity line
   staying exactly where it was. The file tree is the extreme case — flat
   DOM, indent capped at six levels, a 72px floor under the filename, and a
   scope breadcrumb that re-roots rather than indenting further.

   ------------------------------------------------------------------------
   WHAT THIS FILE DOES, AND WHAT IT DELIBERATELY DOES NOT DO

   It registers the version. That is all. The design lives in:

     _pm-cozy.css              every `.cz-*` rule, the type ladder, --cz-cat
     _pm-cozy.js               window.CZ helpers + the single delegated
                               keyboard/click model (CZ.mount self-schedules,
                               so there is nothing to call from here)
     versions/vG-panels-a.js   VG_PANELS.files
     versions/vG-panels-b.js   VG_PANELS.search, .source
     versions/vG-panels-c.js   VG_PANELS.docker, .artifacts
     versions/vG-panels-d.js   VG_PANELS.git, .tests, .agents

   PANELS ARE RESOLVED LAZILY, ON EVERY CALL.

   The obvious spelling — `panels: { files: VG_PANELS.files, ... }` — reads
   window.VG_PANELS once, at eval time, and captures whatever happens to be
   there. Five files own those eight functions, so that spelling makes script
   ORDER load-bearing: this file loading one line early would freeze eight
   `undefined`s into the registry, the harness would report "vG has no design
   for files" for every panel, and nothing would throw to say why. Each entry
   below is instead a thunk that looks the function up at RENDER time, so any
   order works and a genuinely missing file produces a visible, specific
   message inside the panel instead of a silent placeholder.

   `cfg` is forwarded verbatim and never substituted. Panel width must come
   from the config the panel is being LAID OUT in, not from module scope —
   that mismatch is what once measured every width-responsive design against
   the control bar's width and produced ~1,900 phantom failures.
   ========================================================================= */
(function (global) {
  'use strict';

  if (!global.PM_BAKEOFF || typeof global.PM_BAKEOFF.register !== 'function') {
    if (global.console && console.error) {
      console.error('[vG] PM_BAKEOFF is not loaded; _pm-shell.js must come first. ' +
                    'Cozy Shelves did not register.');
    }
    return;
  }

  /* HTML-escape locally rather than through CZ, because this notice has to
     work in exactly the case where CZ is the thing that failed to load. */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* The only markup this file emits: the diagnostic shown when a panel file
     is missing. It names the file that owns the panel, because "not built"
     is not actionable and this failure is always a wiring failure.
     No id=, no emoji, no backtick, no native title. */
  function missing(panelId, owner, why) {
    return '<div class="pm-sp-header"><span>' + esc(panelId.toUpperCase()) + '</span></div>' +
      '<div class="pm-sp-content" style="padding:16px">' +
      '<div class="pm-sp-note" style="font-size:11px;line-height:1.7;opacity:.75">' +
      esc('Cozy Shelves could not render "' + panelId + '": ' + why + '. ') +
      esc('That panel is owned by ' + owner + ' — check that it is included in ') +
      'index.html.</div></div>';
  }

  /* One thunk per panel id. Resolution happens per render, never at eval. */
  function lazy(panelId, owner) {
    return function (D, cfg) {
      var reg = global.VG_PANELS;
      if (!reg) return missing(panelId, owner, 'window.VG_PANELS does not exist');
      var fn = reg[panelId];
      if (typeof fn !== 'function') {
        return missing(panelId, owner, 'VG_PANELS.' + panelId + ' is not a function');
      }
      return fn(D, cfg);
    };
  }

  PM_BAKEOFF.register('vG', {
    name: 'Cozy Shelves',
    blurb: 'Titled shelves state subject and count first; two-line rows put ' +
           'identity on line 1 and qualification on line 2; one semantic ' +
           'accent per shelf; disclosure, not width, absorbs depth.',
    panels: {
      files:     lazy('files',     'versions/vG-panels-a.js'),
      search:    lazy('search',    'versions/vG-panels-b.js'),
      source:    lazy('source',    'versions/vG-panels-b.js'),
      git:       lazy('git',       'versions/vG-panels-d.js'),
      docker:    lazy('docker',    'versions/vG-panels-c.js'),
      tests:     lazy('tests',     'versions/vG-panels-d.js'),
      agents:    lazy('agents',    'versions/vG-panels-d.js'),
      artifacts: lazy('artifacts', 'versions/vG-panels-c.js')
    }
  });
})(window);
