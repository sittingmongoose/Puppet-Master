/* module-shell — shared dialog grammar for the wand-menu modules.
   Pure string builders: no state, no actions, no dependency on app internals.
   Contract: every argument is trusted, pre-escaped HTML (callers use their own
   esc()); values bound into attributes are escaped here via esc(). Icons
   arrive pre-rendered (ctx.icon(name,size)) so each module keeps owning icon
   choice. Loaded before every consumer module (see build.py MODULES). */
(function () {
  'use strict';
  if (window.PM56_SHELL) return;

  /* The picker's default chevron. CHEVRON is the drawing used when the neon family is absent (and what
     tests/shell-selfcheck.cjs, which evals this file with no PM56_NEON, compares against); chevron() asks
     neon-icons.js for the family's chevron-down at call time, never at load (pmx-chevron keeps the 2-unit weight). */
  var CHEVRON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  function chevron() {
    var N = window.PM56_NEON;
    return N && typeof N.icon === 'function' ? N.icon('chevron-down', 12, 'pmx-chevron') : CHEVRON;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* F0 step 8 (IMPACT A1-51, closing 2026-09-28): the legacy dialog-grammar builders (dialog, section, field,
     grid2, seg, tabs, disclosure, choice, chip, rows, note, stat, stats, foot, card, cardHead, copy, check) are
     retired: every wand module now builds from the pmx builders below, and no *.js called them. pickerButton
     stays (Collaboration, Scheduling, BSD, ELI5, New chat defaults, Review, BrainStorm and the run views call it). */

  /* Open state is read at render time from the app menu, when one exists. shell-selfcheck
     evals this file with a stub ctx() that has no state, so the attribute stays false there. */
  function pickerExpanded(anchor) {
    var menu = null;
    try {
      var ext = window.PM56_EXT;
      var ctx = ext && typeof ext.ctx === 'function' ? ext.ctx() : null;
      menu = ctx && ctx.state && ctx.state.menu;
    } catch (err) { menu = null; }
    return !!(menu && menu.scopedPicker && menu.anchor === anchor);
  }

  /* pickerButton({action,anchor,strong,small,markHtml,iconHtml,extra}) —
     markup-compatible with PM56_PICKERS.modelButton and bsd.js choices(). */
  function pickerButton(o) {
    o = o || {};
    var open = pickerExpanded(o.anchor);
    return '<button type="button" class="shared-picker-button" data-action="' + esc(o.action) + '" data-menu-anchor="' + esc(o.anchor) + '" aria-haspopup="listbox" aria-expanded="' + (open ? 'true' : 'false') + '"' + (o.extra ? ' ' + o.extra : '') + '>' +
      (o.markHtml || '') +
      '<span class="shared-picker-copy"><strong>' + (o.strong || '') + '</strong>' + (o.small ? '<small>' + o.small + '</small>' : '') + '</span>' +
      (o.iconHtml || chevron()) +
    '</button>';
  }

  window.PM56_SHELL = {
    esc: esc,
    pickerButton: pickerButton,
    CHEVRON: CHEVRON
  };
})();

/* =====================================================================
   pmx builders (DESIGN-SPEC section 4). The redesigned wand modules build
   every sheet, run card, dock line and run view from these, so one grammar
   covers them all. Same contract as the builders above: pure strings, no
   state, no DOM at load (tests/shell-selfcheck.cjs evals this file with a
   bare window). Text arguments are trusted, pre-escaped HTML; values that
   land in attributes (keys, values, placeholders, labels) are escaped here.
   Every class is a whole literal. Test hooks pass through cls/attrs and the
   named *Cls slots; nothing here hard-codes a module hook except where the
   spec fixes it (the receipt foot, the run view's collab-panel-foot).
   ===================================================================== */
(function () {
  'use strict';
  var SHELL = window.PM56_SHELL;
  if (!SHELL || SHELL.pmxSheet) return;
  var esc = SHELL.esc;

  /* ---------------------------------------------------------------- helpers */
  function str(v) { return v == null ? '' : String(v); }
  function k(key) { return key != null && key !== '' ? ' data-k="' + esc(key) + '"' : ''; }
  function at(name, v) { return v != null && v !== '' ? ' ' + name + '="' + esc(v) + '"' : ''; }
  function raw(a) { a = str(a).trim(); return a ? ' ' + a : ''; }
  function cls(base, extra) { extra = str(extra).trim(); return base + (extra ? ' ' + extra : ''); }
  function num(v, d) { var n = Number(v); return isFinite(n) ? n : d; }
  /* IMPACT A2-16: a shared primitive emits a Collab hook or action only for a collaboration kind, or when it is
     called with collabHooks: true, so no collaboration harness selector matches a Revert, Memory, ELI5 or BSD node */
  var COLLAB_KINDS = { crew: 1, 'crew-auto': 1, crew_auto: 1, chat_room: 1, brainstorm: 1, review: 1 };
  function collabOn(o) { return !!(o && (o.collabHooks === true || COLLAB_KINDS[str(o.kind)])); }

  /* Short, stable hash (FNV-1a 32, base36) for value-keyed children. */
  function pmxHash(s) {
    s = str(s);
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0; }
    return h.toString(36);
  }

  /* ---------------------------------------------------------------- glyphs
     24 px grid, 1.8 stroke, round caps and joins (the app's ctx.icon grammar).
     Parts that carry their own paint use pmx-g-* classes so the status colour
     can go on the stroke/fill (never on `color`, which the transcript accent
     budget in turn-verify measures). */
  var PMX_GLYPHS = {
    'lock': '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    'not': '<circle cx="12" cy="12" r="8.5"/><path d="m6 18 12-12"/>',
    'eye': '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    'eye-closed': '<path d="M3 10.5c2.5 3.6 5.5 5.3 9 5.3s6.5-1.7 9-5.3"/><path d="m6.2 14.2-1.6 2.4M12 15.9v2.9M17.8 14.2l1.6 2.4"/>',
    'eye-lid': '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><path d="M4 11.2h16"/><path d="M9 11.8a3 3 0 0 0 6 0"/>',
    'eye-off': '<path d="M3 3l18 18"/><path d="M10.6 5.6A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.8 3.6M6.4 6.6C3.9 8.3 2.5 12 2.5 12S6 18.5 12 18.5c1.8 0 3.3-.5 4.6-1.3"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    'swap': '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
    'check': '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    'check-circle': '<circle cx="12" cy="12" r="8.5"/><path d="m8.2 12.3 2.6 2.6 5-5.2"/>',
    'warn': '<path d="M12 4.2 21 19.5H3z"/><path d="M12 10v4.2M12 17.1v.1"/>',
    'hand': '<path d="M8 12.5V6.8a1.5 1.5 0 0 1 3 0V11M11 10.6V5.2a1.5 1.5 0 0 1 3 0v5.4M14 10.6V6.8a1.5 1.5 0 0 1 3 0V14c0 4-2.5 6.5-6 6.5-2.6 0-4.3-1.3-5.5-3.5L4 13.6a1.4 1.4 0 0 1 2.3-1.5L8 14.2"/>',
    'pause': '<path d="M9 6v12M15 6v12"/>',
    'slash-circle': '<circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12"/>',
    'ring': '<circle cx="12" cy="12" r="7"/>',
    'ring-dashed': '<circle cx="12" cy="12" r="7" stroke-dasharray="2.5 3"/>',
    'arc': '<circle class="pmx-g-faint" cx="12" cy="12" r="7"/><path class="pmx-g-accent" d="M12 5a7 7 0 0 1 7 7"/>',
    'ring-dot': '<circle cx="12" cy="12" r="7"/><circle class="pmx-g-dot" cx="12" cy="12" r="3"/>',
    'dot': '<circle class="pmx-g-dot" cx="12" cy="12" r="3.2"/>',
    'quote': '<path d="M10 7.5c-2.6.9-4 2.8-4 5.6V17h4.5v-4.5H8c0-1.9.8-3.1 2.6-3.9zM18.5 7.5c-2.6.9-4 2.8-4 5.6V17H19v-4.5h-2.5c0-1.9.8-3.1 2.6-3.9z"/>',
    'file': '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
    'file-edit': '<path d="M6 3h8l4 4v5"/><path d="M6 3v18h5"/><path d="m14 20 6-6 2 2-6 6h-2z"/>',
    'code': '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5.5l-3 13"/>',
    'table': '<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 10h17M3.5 14.5h17M10 10v9"/>',
    'bookmark': '<path d="M7 4h10v16l-5-4-5 4z"/>',
    'notebook': '<path d="M6 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H6z"/><path d="M9.5 3.5v17M12.5 8h3.5M12.5 11.5h3.5"/>',
    'pin-lock': '<path d="M9 3.5h6l-.8 5 3 3.2H6.8l3-3.2z"/><path d="M12 11.7V20.5"/>',
    'rewind': '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/>',
    'clock': '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    'clock-bar': '<circle cx="12" cy="10" r="6.5"/><path d="M12 7v3l2 1.5M5 20.5h14"/>',
    'calendar': '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    'chevron-right': '<path d="m9 6 6 6-6 6"/>',
    'chevron-left': '<path d="m15 6-6 6 6 6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-up': '<path d="m6 15 6-6 6 6"/>',
    'copy': '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    'trash': '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5"/>',
    'sealed': '<rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="m3.5 7.5 8.5 6 8.5-6"/>',
    'spark-off': '<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m4.5 4.5 15 15"/>',
    'more': '<circle cx="5.5" cy="12" r=".9"/><circle cx="12" cy="12" r=".9"/><circle cx="18.5" cy="12" r=".9"/>',
    'play': '<path d="M8 5.5v13l10.5-6.5z"/>',
    'play-ring': '<circle cx="12" cy="12" r="8.5"/><path d="M10.3 8.8v6.4l5-3.2z"/>',
    'user': '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    'download': '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
    'open': '<path d="M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    'edit': '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    'search': '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
    'undo': '<path d="M9 7 4.5 11.5 9 16"/><path d="M5 11.5h9.5a5 5 0 0 1 0 10H12"/>',
    /* closing (ROOM-B FR 2): the "→ To-Do created" and "↳ to you" marks; the embedded Inter / Plex subsets have no
       arrow glyphs, so the text arrows fell back to another face */
    'arrow-right': '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
    'reply': '<path d="M6 4.5V11a4 4 0 0 0 4 4h9.5"/><path d="m15.5 11 4 4-4 4"/>',
    'sev-critical': '<path class="pmx-g-fill" d="M12 4.5 19.5 12 12 19.5 4.5 12z"/>',
    'sev-major': '<path class="pmx-g-fill" d="M12 5 20 19H4z"/>',
    'sev-minor': '<circle class="pmx-g-fill" cx="12" cy="12" r="4.5"/>',
    'sev-suggestion': '<circle cx="12" cy="12" r="5.5"/>',
    /* kind marks (B2): identity by shape, drawn in currentColor */
    'kind-crew': '<path d="M3 5c5 0 8 3 12 7M3 12h12M3 19c5 0 8-3 12-7"/><circle cx="18.5" cy="12" r="2.6"/>',
    'kind-crew-auto': '<path d="M3 5c5 0 8 3 12 7M3 12h12M3 19c5 0 8-3 12-7"/><circle cx="18.5" cy="12" r="2.6"/><path d="m20.6 2.5-2.2 3.2h2.8l-2.2 3.2"/>',
    'kind-chat_room': '<circle cx="12" cy="13" r="5"/><circle cx="12" cy="4.5" r="1.9"/><circle cx="4.5" cy="15" r="1.3"/><circle cx="19.5" cy="15" r="1.3"/><circle cx="12" cy="21" r="1.3"/>',
    'kind-brainstorm': '<path d="M4 4c4 0 6 4 8 8M20 4c-4 0-6 4-8 8M12 3v9M12 12v9"/>',
    'kind-review': '<path d="M5 3h9l4 4v6"/><path d="M5 3v17h6"/><circle cx="16" cy="16" r="3.6"/><path d="m18.6 18.6 2.6 2.6"/>',
    'kind-bsd': '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    'kind-bsd-off': '<path d="M3 10.5c2.5 3.6 5.5 5.3 9 5.3s6.5-1.7 9-5.3"/><path d="m6.2 14.2-1.6 2.4M12 15.9v2.9M17.8 14.2l1.6 2.4"/>',
    'kind-bsd-auto': '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><path d="M4 11.2h16"/><path d="M9 11.8a3 3 0 0 0 6 0"/>',
    'kind-bsd-on': '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    'kind-schedule': '<circle cx="12" cy="13" r="7.5"/><path d="M12 9.2V13l2.6 1.6"/><path d="M12 2.2v2.4"/>',
    'kind-build-at': '<circle cx="12" cy="10" r="6.5"/><path d="M12 7v3l2 1.5"/><path d="M5 20.5h14"/>',
    'kind-scheduled': '<circle cx="12" cy="8.5" r="5.5"/><path d="M12 6.3v2.4l1.7 1"/><path d="M5 17.5h14M5 21h9"/>',
    'kind-memory': '<path d="M6 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H6z"/><path d="M9.5 3.5v17"/><path d="M13 3.5v6.2l1.8-1.3 1.8 1.3V3.5"/>',
    'kind-teach': '<rect x="4.5" y="9" width="15" height="11.5" rx="2"/><path d="M8.5 9V6.8a3.5 3.5 0 0 1 7 0V9"/><path d="M8 13.5h8M8 16.8h5"/>',
    'kind-revert': '<path d="M9 4h6.5L19 7.5V20H9"/><path d="M13 12H7.5a3.5 3.5 0 0 0 0 7H9"/><path d="m10 9-3 3 3 3"/>',
    'kind-eli5': '<path d="M4.5 5.5h15A1.5 1.5 0 0 1 21 7v8.5a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V17h-1A1.5 1.5 0 0 1 3 15.5V7a1.5 1.5 0 0 1 1.5-1.5z"/><path d="M8 11.2h6"/>',
    'kind-defaults': '<path d="M4.5 5.5h15A1.5 1.5 0 0 1 21 7v8.5a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V17h-1A1.5 1.5 0 0 1 3 15.5V7a1.5 1.5 0 0 1 1.5-1.5z"/><path d="M12 8.4v5.6M9.2 11.2h5.6"/>'
  };
  /* Role silhouettes on the 24 grid (for glyph use; marks use the 28 grid below). */
  PMX_GLYPHS['role-lead'] = '<circle cx="12" cy="12" r="8.5"/><circle class="pmx-g-fill" cx="12" cy="12" r="3.4"/>';
  PMX_GLYPHS['role-square'] = '<rect x="4.5" y="4.5" width="15" height="15" rx="4"/>';
  PMX_GLYPHS['role-circle'] = '<circle cx="12" cy="12" r="8"/>';
  PMX_GLYPHS['role-triangle'] = '<path d="M12 4 20.5 19.5h-17z"/>';
  PMX_GLYPHS['role-diamond'] = '<path d="M12 3.5 20.5 12 12 20.5 3.5 12z"/>';
  PMX_GLYPHS['role-hexagon'] = '<path d="M12 3.5 19.5 7.8v8.4L12 20.5l-7.5-4.3V7.8z"/>';
  PMX_GLYPHS['role-orbit'] = '<circle cx="11" cy="13" r="5.5"/><ellipse cx="12" cy="11" rx="9.5" ry="4.2" transform="rotate(-24 12 11)"/>';
  PMX_GLYPHS['role-bowl'] = '<path d="M4 9.5Q12 23 20 9.5z"/>';
  /* Grill Me's kettle grill, static (item 11): the drawing pmxGlyph('grill') falls back to without the neon registry,
     whose own animated grill (neon-icons.js) wins wherever it is loaded */
  PMX_GLYPHS.grill = '<path d="M4.5 10.5a7.5 7.5 0 0 1 15 0z"/><path d="M10.6 1.8h2.8M12 1.8V3M3 12.5h18M4.5 12.5a7.5 7.5 0 0 0 15 0M8 18.8 6.5 22.5M16 18.8l1.5 3.7"/>';
  PMX_GLYPHS['role-you'] = '<circle cx="12" cy="7.5" r="3.8"/><path d="M4.5 20.5Q12 10.5 19.5 20.5z"/>';

  /* IMPACT A2-09: one glyph lookup. A name is looked up in PMX_GLYPHS, then in the app's own icon() table (app.js
     PATHS, reached lazily through PM56_EXT.ctx().icon, a stable function), and only then drawn as the G-11 dashed
     square. The 17 names both tables held are reconciled: plus, minus and close were the same drawings, so they
     now come from the app table only; the other 14 differ and the pmx drawing wins inside pmx surfaces (the
     differences are listed in F0a's notes). icon() draws PATHS.info for a name it does not know, so a name counts
     as the app's when its drawing differs from info's (or the app exposes ctx.hasIcon). */
  var appIconFn = null, appHas = Object.create(null);
  function appIcon(name, size, c) {
    if (!appIconFn) {
      var X = window.PM56_EXT, cx = null;
      try { cx = X && typeof X.ctx === 'function' ? X.ctx() : null; } catch (e) { cx = null; }
      if (!cx || typeof cx.icon !== 'function') return null;
      appIconFn = cx.icon;
      if (typeof cx.hasIcon === 'function') appIconFn.pmxHas = cx.hasIcon;
    }
    if (!(name in appHas)) {
      try { appHas[name] = appIconFn.pmxHas ? !!appIconFn.pmxHas(name) : (name === 'info' || appIconFn(name, 24, '') !== appIconFn('info', 24, '')); } catch (e) { appHas[name] = false; }
    }
    return appHas[name] ? appIconFn(name, size, c) : null;
  }
  var warnedGlyphs = {};
  /* Neon (step 2, 2026-10-02): the glyph family (neon-icons.js, window.PM56_NEON) lights every glyph. At the first
     glyph call, never at load (tests/shell-selfcheck.cjs and tests/b16 eval this file with no PM56_NEON), this
     table is handed to the registry; a drawing the registry already owns (the 14 reconciled names, the kind marks
     it splits into moving parts) is kept, the rest join it. Without PM56_NEON everything below works as before. */
  var neonSeen = false;
  function neon() {
    var N = window.PM56_NEON;
    if (!N || typeof N.icon !== 'function' || typeof N.has !== 'function') return null;
    if (!neonSeen) { neonSeen = true; try { N.registerMany(PMX_GLYPHS); } catch (e) { } }
    return N;
  }
  /* pmxGlyph(name,size,cls) - an unknown name never throws (amendment G-11): it
     returns a visible dashed square of the requested size and logs once with
     console.info, and pmx-gallery/pmx-verify fail on any .pmx-glyph-missing. */
  function pmxGlyph(name, size, extraCls) {
    size = num(size, 14);
    var body = PMX_GLYPHS[name];
    var c = cls('pmx-glyph', extraCls);
    var N = name ? neon() : null;
    if (N && N.has(String(name))) return N.icon(String(name), size, c);
    if (body == null && name) { var viaApp = appIcon(String(name), size, c); if (viaApp) return viaApp; }
    if (body == null) {
      if (!warnedGlyphs[name]) { warnedGlyphs[name] = 1; try { console.info('PM56_SHELL.pmxGlyph: unknown glyph "' + name + '"'); } catch (e) { } }
      return '<svg class="' + cls('pmx-glyph pmx-glyph-missing', extraCls) + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" aria-hidden="true" data-glyph="' + esc(name) + '"><rect x="1.5" y="1.5" width="21" height="21" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"/></svg>';
    }
    return '<svg class="' + c + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }
  /* a glyph argument is either a name from the table or pre-rendered HTML */
  function g(v, size) { v = str(v); if (!v) return ''; return v.charAt(0) === '<' ? v : pmxGlyph(v, size); }

  var KIND_GLYPH = { crew: 'kind-crew', 'crew-auto': 'kind-crew-auto', crew_auto: 'kind-crew-auto', chat_room: 'kind-chat_room', room: 'kind-chat_room', brainstorm: 'kind-brainstorm', review: 'kind-review',
    bsd: 'kind-bsd', 'bsd-off': 'kind-bsd-off', 'bsd-auto': 'kind-bsd-auto', 'bsd-on': 'kind-bsd-on', schedule: 'kind-schedule', 'build-at': 'kind-build-at', scheduled: 'kind-scheduled',
    memory: 'kind-memory', teach: 'kind-teach', revert: 'kind-revert', eli5: 'kind-eli5', defaults: 'kind-defaults' };
  /* pmxKindMark(kind,size) - identity of a module, by shape (never sparkles). */
  function pmxKindMark(kind, size) {
    var name = KIND_GLYPH[str(kind)];
    return pmxGlyph(name || ('kind-' + str(kind)), num(size, 16), 'pmx-kind');
  }

  /* ---------------------------------------------------------------- B1 marks: puppet agents
     Item 14a (2026-10-07; Jared: "the agents are little puppets and their icons are little puppet agents that match
     the themes"). Every agent mark is a small marionette on the 28 grid, after PMConcept7's onboarding helpers: a
     control bar with three strings (head and both hands), a chibi figure (a big round head, a little trapezoid
     tunic, stick limbs) and ONE prop or headwear that names the role, so roles read in grayscale; the seat hue is
     the secondary cue and paints the figure. The material follows the theme family in module-shell.css (Basic
     blueprint line with a neon halo on dark, Friendly felt, Glass crystal, Retro a pixel sprite); NieR draws the
     PMConcept7 NieR puppet unit instead (pnUnit below; paint in nier-parts.css). The whole drawing stays inside 0..28,
     so a plate may scale a seat.
     Detail by size (CSS gates on data-size and the cluster hosts): 12 px and the mini cluster draw a bust (bar,
     head string, head and headwear, shoulders); 16-18 px the whole figure and three strings; 22 px and up the
     face; 28 px and up (and plate seats) joints, feet and family detail.
     States keep the B1 grammar, drawn puppet-native: working = taut strings over a lit stage floor (picked up and
     swung once as it starts); queued = slack dashed strings, dimmed; needs = a raised hand and the warning notch;
     done = the check notch (and a hop); failed = a cut hand string, a slumped head and the x notch; abstained =
     dimmed; optional = a dashed figure; stand-in = the swap notch, top left (the bar owns the top right).
     All paint comes from --pmx-seat through the pmx-pp-* / pmx-m-* classes, never from `color`; no ids (the ghost
     strip removes them), no filter, no colour maths. */
  function n2(v) { return Math.round(v * 100) / 100; }
  function dCirc(cx, cy, r) { return 'M' + n2(cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + n2(2 * r) + ' 0a' + r + ' ' + r + ' 0 1 0 ' + n2(-2 * r) + ' 0'; }
  function ppc(c) { return String(c).split(' ').map(function (x) { return 'pmx-pp-' + x; }).join(' '); }
  function pp(c, d, t) { return '<path class="' + ppc(c) + '" d="' + d + '"' + (t ? ' transform="' + t + '"' : '') + '/>'; }
  function ppo(c, x, y, r) { return '<circle class="' + ppc(c) + '" cx="' + x + '" cy="' + y + '" r="' + r + '"/>'; }
  function ppr(c, x, y, w, h, t) { return '<rect class="' + ppc(c) + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"' + (t ? ' transform="' + t + '"' : '') + '/>'; }
  /* the figure (one place to tune it) */
  var PUP = {
    /* the rig fans out: a short bar, the head string, and two hand strings splaying to hands held out and up */
    bar: 'M10 2.2H18', grip: 'M14 .5V2.2', studs: [[10, 2.2], [14, 2.2], [18, 2.2]],
    head: [14, 10.6, 4.2],
    strC: 'M14 2.2V6.4', strL: 'M10 2.2 5.2 14.8', strR: 'M18 2.2 22.8 14.8', hands: [[5.2, 14.8], [22.8, 14.8]],
    body: 'M11.4 15.6H16.6L17.9 20.8H10.1Z', bust: 'M7.6 25C7.6 19.6 10.2 16.4 14 16.4S20.4 19.6 20.4 25Z',
    armL: 'M11 16.3 5.2 14.8', armR: 'M17 16.3 22.8 14.8', legs: 'M12.5 20.8V24.6M15.5 20.8V24.6', feet: 'M11.3 24.6H12.7M15.3 24.6H16.7',
    joints: [[11, 16.3], [17, 16.3], [12.5, 20.8], [15.5, 20.8]],
    /* face and family detail are drawn for a head at (14, 11.1) r 4.2; ppHead moves them to the head */
    eyes: [[12.5, 11.7], [15.5, 11.7]], cheeks: [[11.3, 13.2], [16.7, 13.2]], smile: 'M13.2 13.7Q14 14.4 14.8 13.7',
    hair: 'M9.85 10.6A4.2 4.2 0 0 1 18.15 10.6Q16.4 9.2 14 9.8Q11.6 9.2 9.85 10.6Z',
    shine: 'M11.2 10.2A3 3 0 0 1 13.2 8', core: [14, 18.4, 1.25], facet: 'M12.4 15.6 14 17 15.6 15.6',
    floor: 'M8.4 26.6H19.6',
    /* poses: needs raises the free hand on its string; failed cuts that hand's string, drops the arm, slumps the head */
    raiseL: { arm: 'M11 16.3 5.8 8.8', str: 'M10 2.2 5.8 8.8', hand: [5.8, 8.8] },
    raiseR: { arm: 'M17 16.3 22.2 8.8', str: 'M18 2.2 22.2 8.8', hand: [22.2, 8.8] },
    cutL: { arm: 'M11 16.3 8.6 20.6', str: 'M10 2.2 8.4 6.6', tip: 'M8.4 6.6 7.3 7.3M8.4 6.6 8.2 7.9', hand: [8.6, 20.6] },
    cutR: { arm: 'M17 16.3 19.4 20.6', str: 'M18 2.2 19.6 6.6', tip: 'M19.6 6.6 20.7 7.3M19.6 6.6 19.8 7.9', hand: [19.4, 20.6] },
    slump: 'rotate(13 14 15)'
  };
  /* Props and headwear. back: drawn behind the head. hand: the hand a prop holds ('L'/'R'), so needs
     raises the other one and failed cuts the other one's string; head: headwear (it slumps with the head), held: a
     hand prop. Overrides (strC, armL, strL, armR, strR) re-rig the
     figure; halo: the prop's lines for the neon halo. Classes: pf a filled prop (prop fill, prop ink), pl a prop
     line, pa a prop accent dot; full = hidden in the bust; g2/g3 = 22/28 px and up. */
  var PROPS = {
    crown: { strC: 'M14 2.2V4.4', head: pp('pf', 'M10.4 8.4 10.1 4.8 12.2 6.5 14 4.4 15.8 6.5 17.9 4.8 17.6 8.4Z'), halo: 'M10.4 8.4 10.1 4.8 12.2 6.5 14 4.4 15.8 6.5 17.9 4.8 17.6 8.4Z' },
    gavel: { hand: 'L', held: pp('pl full hdl', 'M5.2 14.8 3.3 9.3') + pp('pf full', 'M5.1 7.6 5.8 9.5 1.5 11 .8 9.1Z'), halo: 'M5.2 14.8 3.3 9.3M5.1 7.6 5.8 9.5 1.5 11 .8 9.1Z' },
    hardhat: { strC: 'M14 2.2V5.6', head: pp('pf', 'M10 8.9C10 4.5 18 4.5 18 8.9Z') + pp('pl', 'M8.8 9H19.2') + pp('pl g2', 'M14 5.9V7.8'), halo: 'M10 8.9C10 4.5 18 4.5 18 8.9ZM8.8 9H19.2' },
    lens: { hand: 'R', head: pp('pl full hdl', 'M18.6 12.7 22.8 14.8') + ppo('lens', 16.8, 10.9, 2.5) + ppo('eye bigeye', 16.8, 10.9, .95), halo: 'M18.6 12.7 22.8 14.8' + dCirc(16.8, 10.9, 2.5) },
    jester: { strC: 'M14 2.2V4.9',
      head: pp('pf', 'M12 5.2C8.8 5 7.4 7.6 8.2 12.4C9 10.6 9.8 9.6 10.8 9Z') + pp('pf', 'M16 5.2C19.2 5 20.6 7.6 19.8 12.4C19 10.6 18.2 9.6 17.2 9Z') +
        pp('pf', 'M10.1 8.4 11.3 9.8 12.6 8.6 14 10 15.4 8.6 16.7 9.8 17.9 8.4C17.9 5.9 16 4.9 14 4.9S10.1 5.9 10.1 8.4Z') + ppo('pa', 8.3, 13.3, 1.1) + ppo('pa', 19.7, 13.3, 1.1),
      halo: 'M12 5.2C8.8 5 7.4 7.6 8.2 12.4M16 5.2C19.2 5 20.6 7.6 19.8 12.4M10.1 9C10.1 5.9 12 4.9 14 4.9S17.9 5.9 17.9 9' },
    orbit: { back: pp('pl', 'M8.28 11.33A5.9 2 -14 0 1 19.72 8.47'), head: pp('pl', 'M19.72 8.47A5.9 2 -14 0 1 8.28 11.33') + ppo('pa', 17.4, 4.9, 1.1),
      halo: 'M8.28 11.33A5.9 2 -14 0 1 19.72 8.47A5.9 2 -14 0 1 8.28 11.33' },
    page: { held: pp('pf full', 'M11.3 16.2H15.6L16.8 17.4V21.3H11.3Z') + pp('pl g2', 'M12.4 18.1H15.6M12.4 19.6H14.8'), halo: 'M11.3 16.2H15.6L16.8 17.4V21.3H11.3Z' },
    square: { hand: 'L', held: pp('pf full', 'M5.2 15.6V22.4H10.4Z') + pp('pl g2', 'M6.5 18.9V21.1H8.2Z'), halo: 'M5.2 15.6V22.4H10.4Z' },
    pennant: { hand: 'L', armL: 'M11 16.3 4.4 14.8', strL: 'M10 2.2 4.4 14.8',
      held: pp('pl full', 'M4.2 22.6V6.6') + pp('pf full', 'M4.2 6.6 .8 8.3 4.2 10Z'), halo: 'M4.2 22.6V6.6M4.2 6.6 .8 8.3 4.2 10Z' }
  };
  /* Grill Me stands behind a little kettle grill (the neon 'grill' glyph's anatomy: a dome lid riding just above
     the rim, the bowl, two splayed legs and three grill marks), its hands on the lid: the mark reads as a grill first. */
  var GRILL = {
    head: [14, 8.5, 3.6], strC: 'M14 2.2V4.9', strL: 'M10 2.2 8.8 15.4', strR: 'M18 2.2 19.2 15.4',
    body: 'M11.2 12.6H16.8L17.4 15.6H10.6Z', arms: 'M11 13.4 8.8 15.4M17 13.4 19.2 15.4',
    lid: 'M7.6 19A6.4 5.4 0 0 1 20.4 19Z', knob: 'M12.6 12.9H15.4M14 12.9V13.6', rim: 'M6.6 19.8H21.4',
    bowl: 'M7.6 19.8A6.4 4.6 0 0 0 20.4 19.8', legs: 'M9.9 23.1 8.3 27.4M18.1 23.1 19.7 27.4', marks: 'M10.6 21.1l.9.9M13.5 21.1l.9.9M16.4 21.1l.9.9'
  };
  /* You hold the control: an unstrung head-and-shoulders figure (the user mark) raising the cross-shaped control,
     its two strings hanging free. */
  var YOU = {
    head: [10.4, 12.2, 4.4], body: 'M3.4 26.6C3.4 21.2 6.4 18.2 10.4 18.2S17.4 21.2 17.4 26.6Z',
    arms: 'M15.4 20.6 20.2 9.7', bar: 'M16.2 10.6 24.2 8.2', grip: 'M20.2 9.4V7.2', strs: 'M16.2 10.6V16M24.2 8.2V14.6'
  };
  var SIL_PROP = { lead: 'crown', square: 'hardhat', circle: 'lens', triangle: 'square', diamond: 'pennant', hexagon: 'jester', orbit: 'orbit', bowl: 'grill', grill: 'grill', you: 'you' };
  /* Retro: a 13 x 13 sprite on 2-unit cells (crisp edges), after PMConcept7's arcade helpers. b bar, s string (a
     dotted half cell), h hair, k skin, e eye, c tunic (seat hue), l legs, p prop ink, q prop accent, w paper. */
  var PX = {
    base: ['..bbbbbbbbb..', '..s...s...s..', '..s.hhhhh.s..', '..s.hkkkh.s..', '..s.kekek.s..', '..s.kkkkk.s..', '..s..kkk..s..',
      '..s.ccccc.s..', '..kccccccck..', '....ccccc....', '....ccccc....', '.....l.l.....', '....ll.ll....'],
    raiseL: { 3: '.k_', 4: '..c', 5: '..c', 6: '.._c', 7: '.._c', 8: '..__' },
    raiseR: { 3: '.........._k', 4: '..........c', 5: '..........c', 6: '.........c_', 7: '.........c_', 8: '.........__' },
    cutL: { 4: '.._', 5: '.._', 6: '.._', 7: '.._', 8: '.._c', 9: '...k' },
    cutR: { 4: '.........._', 5: '.........._', 6: '.........._', 7: '.........._', 8: '.........c_', 9: '.........k' },
    crown: { 1: '....q.q.q....', 2: '....qqqqq....' },
    gavel: { 9: 'ppp', 10: '.p', 11: '.p', 12: 'qqq' },
    hardhat: { 1: '.....ppp.....', 2: '...ppppppp...' },
    lens: { 3: '......ppp....', 4: '......p.p....', 5: '......ppp....', 6: '.........p...', 7: '..........p..' },
    jester: { 1: '...pp...pp...', 2: '...ppppppp...', 3: '...q.....q...' },
    orbit: { 1: '...........q.', 4: '..pp.....pp..', 5: '....ppppp....' },
    page: { 8: '.....www.....', 9: '.....wpw.....', 10: '.....www.....' },
    square: { 10: '.p', 11: '.pp', 12: '.ppp' },
    pennant: { 3: 'qqp', 4: '.qp', 5: '..p', 6: '..p', 7: '..p', 9: '..p', 10: '..p', 11: '..p', 12: '..p' }
  };
  var PX_GRILL = ['..bbbbbbbbb..', '..s...s...s..', '..s.hhhhh.s..', '..s.kekek.s..', '..s.kkkkk.s..', '..s...p...s..', '..s.ppppp.s..',
    '..kppwppppk..', '.qqqqqqqqqqq.', '..ppppppppp..', '...pwpwpwp...', '....ppppp....', '...l.....l...'];
  var PX_YOU = ['.............', '.......bbbbb.', '.......s.k.s.', '.......s.c.s.', '.hhhhh..c..s.', '.hkkkh..c....', '.kekek.c.....', '.kkkkk.c.....',
    '..kkk.c......', '.ccccc.......', 'kccccc.......', '.ccccc.......', '..l.l........'];
  function pxSprite(rows) {
    var out = '';
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r], c = 0;
      while (c < row.length) {
        var ch = row.charAt(c), e = c;
        while (e + 1 < row.length && row.charAt(e + 1) === ch && ch !== 's') e++;
        if (ch === 's') out += ppr('x' + ch, 1 + c * 2 + .5, 1 + r * 2 + .5, 1, 1);
        else if (ch !== '.') out += ppr('x' + ch, 1 + c * 2, 1 + r * 2, (e - c + 1) * 2, 2);
        c = e + 1;
      }
    }
    return out;
  }
  function pxLay(base, over) {
    var rows = base.slice();
    for (var r in over) {
      if (!Object.prototype.hasOwnProperty.call(over, r)) continue;
      var o = over[r], row = rows[r].split('');
      for (var i = 0; i < o.length; i++) if (o.charAt(i) !== '.') row[i] = o.charAt(i) === '_' ? '.' : o.charAt(i);
      rows[r] = row.join('');
    }
    return rows;
  }
  /* the role -> prop map: exact keys first, then the last word of a persona ('Database Reviewer' -> reviewer) */
  var ROLE_PROP = {
    lead: 'crown', coordinator: 'crown', 'this-chat': 'crown', moderator: 'gavel',
    builder: 'hardhat', implementer: 'hardhat', helper: 'hardhat', 'release-engineer': 'hardhat', engineer: 'hardhat', runner: 'hardhat', developer: 'hardhat', extractor: 'hardhat', ops: 'hardhat',
    checker: 'lens', reviewer: 'lens', auditor: 'lens', qa: 'lens', 'visual-qa': 'lens', tester: 'lens', 'test-author': 'lens', analyst: 'lens',
    adversarial: 'jester', 'adversarial-review': 'jester', 'critical-advisor': 'jester', critic: 'jester', 'plan-critic': 'jester', skeptic: 'jester', advisor: 'jester',
    wonderer: 'orbit', orbit: 'orbit', grill: 'grill', 'grill-me': 'grill', bowl: 'grill',
    scribe: 'page', teacher: 'page', collator: 'page', 'evidence-collator': 'page', writer: 'page', 'doc-author': 'page', author: 'page',
    architect: 'square', architecture: 'square', 'systems-analyst': 'square', design: 'square', designer: 'square',
    product: 'pennant', 'product-manager': 'pennant', manager: 'pennant', growth: 'pennant',
    you: 'you', square: 'hardhat', circle: 'lens', triangle: 'square', diamond: 'pennant', hexagon: 'jester'
  };
  var PROP_SIL = { crown: 'lead', gavel: 'lead', hardhat: 'square', lens: 'circle', jester: 'hexagon', orbit: 'orbit', grill: 'bowl', page: 'circle', square: 'triangle', pennant: 'diamond', you: 'you' };
  function roleKey(role) { return str(role).toLowerCase().trim().replace(/[\s_]+/g, '-'); }
  function propOf(role) {
    var key = roleKey(role);
    if (ROLE_PROP[key]) return ROLE_PROP[key];
    var words = key.replace(/-?\d+$/, '').split('-'), last = words[words.length - 1];
    return ROLE_PROP[last] || 'hardhat';
  }
  /* data-sil keeps the B1 silhouette names (pmx-system's ghost strip and the verifiers read them) */
  var ROLE_SIL = {
    lead: 'lead', coordinator: 'lead', moderator: 'lead', 'this-chat': 'lead',
    builder: 'square', implementer: 'square', helper: 'square',
    checker: 'circle', reviewer: 'circle', teacher: 'circle',
    architect: 'triangle', architecture: 'triangle',
    product: 'diamond', 'product-manager': 'diamond',
    adversarial: 'hexagon', 'adversarial-review': 'hexagon', 'critical-advisor': 'hexagon', critic: 'hexagon',
    wonderer: 'orbit', orbit: 'orbit', grill: 'bowl', 'grill-me': 'bowl', bowl: 'bowl', you: 'you',
    square: 'square', circle: 'circle', triangle: 'triangle', diamond: 'diamond', hexagon: 'hexagon'
  };
  function silOf(role) { return ROLE_SIL[roleKey(role)] || PROP_SIL[propOf(role)] || 'square'; }
  function seatVar(sil, seat) {
    if (sil === 'lead') return 'var(--pmx-seat-lead)';
    if (sil === 'you') return 'var(--pmx-seat-you)';
    var s = Math.max(1, Math.round(num(seat, 1)));
    return 'var(--pmx-seat-' + (((s - 1) % 8) + 1) + ')';
  }
  /* the hue and its precomputed 16 % fill (IMPACT A1-15: --pmx-seat-fill-N is a per-theme literal) */
  function seatStyle(sil, seat) {
    var n = sil === 'lead' ? 'lead' : sil === 'you' ? 'you' : String(((Math.max(1, Math.round(num(seat, 1))) - 1) % 8) + 1);
    return '--pmx-seat:' + seatVar(sil, seat) + ';--pmx-seat-fill:var(--pmx-seat-fill-' + n + ')';
  }
  /* The material the page paints now. The templates run after app.js writes body[data-theme] and nier.js the NieR
     attributes, and a theme switch re-renders the app and its overlays, so a mark carries only its own family's
     layer, NieR's parts only under NieR, the halo only on dark themes, and only the detail its size shows (about a
     third of the markup of carrying everything). A mark that outlives a switch still draws: each layer is complete
     on its own, and module-shell.css restyles it. Without a document (tests/shell-selfcheck.cjs) it is Basic Dark.
     size: the mark's size; none (a plate seat) = the richest detail. */
  function ppMat(size) {
    var d = typeof document !== 'undefined' ? document : null, b = d && d.body, t = (b && b.getAttribute && b.getAttribute('data-theme')) || 'basic-dark';
    var z = size == null ? 99 : num(size, 22), nier = !!(d && d.documentElement && d.documentElement.getAttribute('data-o55-nier') === 'on');
    return { fam: t.split('-')[0], px: t.indexOf('retro') === 0, nier: nier, halo: !nier && !/-light$/.test(t) && z > 12, z: z, g2: z >= 22, g3: z >= 28, bust: z <= 12 };
  }
  /* the head with its face and family detail; h = [cx, cy, r] */
  function ppHead(h, prop, M) {
    var cx = h[0], cy = h[1], r = h[2], dx = cx - 14, dy = cy - 11.1, s = r / 4.2;
    var t = dx || dy || s !== 1 ? 'translate(' + n2(cx) + ' ' + n2(cy) + ') scale(' + n2(s) + ') translate(-14 -11.1)' : '';
    var inner = '<circle class="pmx-pp-head" cx="14" cy="11.1" r="4.2"/>';
    if (M.fam === 'friendly') inner += pp('hair', PUP.hair) + (M.g3 ? ppo('cheek g3', PUP.cheeks[0][0], PUP.cheeks[0][1], .75) + ppo('cheek g3', PUP.cheeks[1][0], PUP.cheeks[1][1], .75) + pp('smile g3', PUP.smile) : '');
    if (M.fam === 'glass' && !M.bust) inner += pp('shine full', PUP.shine);
    if (M.g2) inner +=ppo('eye g2', PUP.eyes[0][0], PUP.eyes[0][1], .6) + (prop === 'lens' ? '' : ppo('eye g2', PUP.eyes[1][0], PUP.eyes[1][1], .6));
    return t ? '<g transform="' + t + '">' + inner + '</g>' : inner;
  }
  function headD(h) { return dCirc(h[0], h[1], h[2]); }
  function ppStuds(M) {
    var o = '';
    if (M.g3) for (var i = 0; i < PUP.studs.length; i++) o += ppo('stud g3', PUP.studs[i][0], PUP.studs[i][1], .85);
    return o;
  }
  function ppJoints(list, M) {
    var o = '';
    if (!M.g3 || M.fam === 'friendly') return '';
    for (var i = 0; i < list.length; i++) o += ppo('joint g3', list[i][0], list[i][1], .75);
    return o;
  }
  /* the line puppet (Basic, Friendly, Glass) and its halo d */
  function ppVector(prop, state, M) {
    var P = PROPS[prop] || {}, pose = state === 'needs' ? 'raise' : state === 'failed' ? 'cut' : '';
    var side = P.hand === 'L' ? 'R' : 'L';
    var armL = P.armL || PUP.armL, armR = P.armR || PUP.armR, strL = P.strL || PUP.strL, strR = P.strR || PUP.strR, strC = P.strC || PUP.strC, tip = '';
    var hands = [PUP.hands[0], PUP.hands[1]];
    if (P.armL) hands[0] = (P.armL.match(/(-?[\d.]+) (-?[\d.]+)$/) || [0, hands[0][0], hands[0][1]]).slice(1).map(Number);
    if (P.armR) hands[1] = (P.armR.match(/(-?[\d.]+) (-?[\d.]+)$/) || [0, hands[1][0], hands[1][1]]).slice(1).map(Number);
    if (pose) {
      var q = PUP[pose + side];
      if (side === 'L') { armL = q.arm; strL = q.str; hands[0] = q.hand; } else { armR = q.arm; strR = q.str; hands[1] = q.hand; }
      if (pose === 'cut') tip = q.tip;
    }
    var strs = pp('str', strC) + (M.bust ? '' : pp('str full', strL + (tip && side === 'L' ? tip : '')) + pp('str full', strR + (tip && side === 'R' ? tip : '')));
    var head = ppHead(PUP.head, prop, M);
    var fig = (P.back || '') + (M.bust ? '' : pp('limb full', armL + armR + PUP.legs) + (M.g3 ? pp('foot g3', PUP.feet) : '') + pp('body full', PUP.body)) + (M.z <= 18 ? pp('shoulders bust', PUP.bust) : '') +
      (M.fam === 'glass' && !M.nier && !M.bust ? pp('facet full', PUP.facet) + ppo('core full', PUP.core[0], PUP.core[1], PUP.core[2]) + (M.g2 ? ppo('corehi g2', PUP.core[0], PUP.core[1], .45) : '') : '') +
      ppJoints(PUP.joints.concat([hands[0], hands[1]]), M) +
      (M.bust ? '' : P.held || '') + (pose === 'cut' ? '<g transform="' + PUP.slump + '">' + head + (P.head || '') + '</g>' : head + (P.head || ''));
    var halo = PUP.bar + strC + armL + armR + PUP.legs + PUP.body + headD(PUP.head) + (P.halo || '');
    return { rig: strs + pp('bar', PUP.bar) + pp('grip', PUP.grip) + ppStuds(M) + '<g class="pmx-pp-fig">' + fig + '</g>', halo: halo };
  }
  function ppGrill(state, M) {
    var G = GRILL, fig = (M.bust ? '' : pp('limb full', G.arms) + pp('body full', G.body)) + (M.z <= 18 ? pp('shoulders bust', PUP.bust) : '') + ppHead(G.head, 'grill', M) +
      pp('pf gl', G.lid) + pp('pl gl', G.knob) + pp('pf gb', G.bowl + 'Z') + pp('pl gr', G.rim) + (M.bust ? '' : pp('pl gl full', G.legs)) + (M.g2 ? pp('pl gm g2', G.marks) : '');
    var strs = pp('str', G.strC) + (M.bust ? '' : pp('str full', G.strL) + pp('str full', state === 'failed' ? PUP.cutR.str + PUP.cutR.tip : G.strR));
    return { rig: strs + pp('bar', PUP.bar) + pp('grip', PUP.grip) + ppStuds(M) + '<g class="pmx-pp-fig">' + fig + '</g>',
      halo: PUP.bar + G.strC + G.arms + headD(G.head) + G.lid + G.rim + G.bowl + G.legs };
  }
  function ppYou(M) {
    var Y = YOU, fig = pp('body', Y.body) + pp('limb', Y.arms) + ppHead(Y.head, 'you', M);
    return { rig: '<g class="pmx-pp-fig">' + fig + pp('str', Y.strs) + pp('bar', Y.bar) + pp('grip', Y.grip) + '</g>', halo: Y.arms + Y.body + headD(Y.head) + Y.bar + Y.grip };
  }
  function ppPixel(prop, state) {
    if (prop === 'grill') return pxSprite(state === 'failed' ? pxLay(PX_GRILL, { 3: '.........._', 4: '.........._', 5: '.........._', 6: '.........._' }) : PX_GRILL);
    if (prop === 'you') return pxSprite(PX_YOU);
    var rows = pxLay(PX.base, PX[prop] || {}), side = PROPS[prop] && PROPS[prop].hand === 'L' ? 'R' : 'L';
    if (state === 'needs') rows = pxLay(rows, PX['raise' + side]);
    if (state === 'failed') rows = pxLay(rows, PX['cut' + side]);
    return pxSprite(rows);
  }
  /* NieR (html[data-o55-nier="on"]): the PMConcept7 NieR puppet unit, exactly as its thread finalised it (design/
     puppets-final gen.mjs ICON / ISTROKE / TINY / TINY_ROLE, handoff 2026-10-07; both concepts draw this one unit).
     Ink on parchment, no hue and no halo: a solid ink bar with square studs, ink strings at 55 %, a paper shield-
     octagon head under the rigid ink visor band (it overhangs 0.6 a side: the signature), an ink coat, ink boots,
     square paper joints; the role props of the 5.6 Pro proposal geometry in ink (plus the Moderator's gavel and
     Grill Me's kettle, this concept's own). Strokes are device px (nier-parts.css, non-scaling). Detail by size: 1
     string at 18-20 px, 3 from 22; studs, hands and collar from 28; pins and the visor display (an idle scan notch,
     joy chevrons when done) from 36 and on plate seats; 16 px and under the 14-cell pixel map. Tune it in PN. */
  var PN = {
    bar: [8.4, 2.5, 11.2, 1.4], studs: [9, 14, 19], studY: 3.2, studS: 2,
    headStr: 'M14 3.9V6.4', handStr: 'M9 3.9L7.8 18.4M19 3.9L20.2 18.4',
    head: 'M12.1 6.4H15.9L17.7 8.2V11.4L15.7 13.8H12.3L10.3 11.4V8.2Z', visor: [9.7, 8.9, 8.6, 2],
    collar: 'M12.3 13.5L14 14.7L15.7 13.5L16.6 15.1H11.4Z', coat: 'M11.2 14.6H16.8L17.6 15.4L18.8 22H9.2L10.4 15.4Z',
    arms: 'M10.6 15.4L7.8 18.4M17.4 15.4L20.2 18.4', hands: [[7.8, 18.4], [20.2, 18.4]], handS: 1.8,
    shoulders: [[10.6, 15.4], [17.4, 15.4]], pinS: 1.6, legs: 'M12.6 22V24.2M15.4 22V24.2', boots: [[11.6, 23.8], [14.4, 23.8]],
    knees: [[12.6, 22.8], [15.4, 22.8]], kneeS: 1.3, scan: [10.9, 8.9, .7, 2], joy: 'M11.4 10.5L12.4 9.4L13.4 10.5M14.6 10.5L15.6 9.4L16.6 10.5',
    you: { bar: [16.6, 2.6, 9.6, 1.4], studs: [[17.2, 3.3], [25.6, 3.3]], arm: 'M16 16.6L19.6 10.6L21.4 4.8', hand: [21.4, 4.6, 1.9],
      body: 'M8.4 24.8L9.4 17.4L11.2 15.6H15L16.8 17.4L17.8 24.8Z', head: 'M11.1 6.6H14.9L16.8 8.5V11.7L14.7 14.2H11.3L9.2 11.7V8.5Z', slit: [10.2, 9.3, 6.6, 1.9] },
    tiny: ['..............', '....#######...', '.......#......', '......###.....', '.....#ooo#....', '....vvvvvvv...', '.....#ooo#....', '......###.....',
      '.....#####....', '....#.###.#...', '....#.###.#...', '.....#####....', '......#.#.....', '.....##.##....'],
    tinyYou: ['..............', '........#####.', '..........#...', '...###....#...', '..#####..#....', '..#oooo..#....', '..#####.#.....', '...###.#......',
      '..######......', '.#######......', '.#######......', '.#######......', '.#######......', '..............']
  };
  /* role props on the unit (top: the head prop's top, where the head string ends; under 5 the prop hangs from the bar).
     fill: i ink, p the raised paper (--o55-nier-raised, gen.mjs ROLE's 'p'). */
  var PN_ROLE = {
    crown: { top: 3.9, d: 'M10.9 7.3 10.6 4.4 12.5 5.9 14 3.9 15.5 5.9 17.4 4.4 17.1 7.3Z', fill: 'i' },
    hardhat: { top: 5.7, d: 'M10.5 9.2A3.5 3.5 0 0 1 17.5 9.2ZM9.4 9.4H18.6', fill: 'p' },
    lens: { line: 'M21.6 15.8m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M19.8 17.6 18.4 19' },
    jester: { line: 'M10.7 8.6Q9.8 5 7.2 6.8M17.3 8.6Q18.2 5 20.8 6.8M10.6 8.7H17.4', dots: [[7, 7.6], [21, 7.6]] },
    orbit: { line: 'M14 10m-6.6 0a6.6 2.1 0 1 0 13.2 0a6.6 2.1 0 1 0 -13.2 0', moon: [20.2, 8.4] },
    page: { d: 'M11.4 15.6H16.6V20.2H11.4Z', fill: 'p', line: 'M12.4 17.2H15.6M12.4 18.7H14.6' },
    square: { d: 'M19.4 19.6V13.6L24.4 19.6Z', fill: 'p' },
    pennant: { line: 'M20.2 19.4V10.6', d: 'M20.2 10.8 24.6 12.4 20.2 14Z', fill: 'i' },
    gavel: { line: 'M20.2 18.4 22.4 12.8', d: 'M24.7 12.5 24 14.2 20.3 12.7 21 11Z', fill: 'i' },
    grill: { d: 'M8.6 19.6A5.4 3.8 0 0 1 19.4 19.6ZM8.6 20.4A5.4 3.6 0 0 0 19.4 20.4Z', fill: 'p', line: 'M7.4 20H20.6M10.4 23.2 9.2 26.6M17.6 23.2 18.8 26.6M12.6 15.2H15.4M14 15.2V15.8' }
  };
  var PN_TINY_ROLE = {
    crown: [[5, 2], [7, 2], [9, 2]], hardhat: [[5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [4, 3], [10, 3]], lens: [[11, 9], [12, 9], [11, 10], [12, 10]],
    jester: [[4, 2], [10, 2], [3, 3], [11, 3]], orbit: [[3, 5], [11, 5], [12, 4]], page: [[6, 10, 'g'], [7, 10, 'g'], [8, 10, 'g']],
    square: [[11, 8], [11, 9], [12, 9]], pennant: [[11, 7], [11, 8], [11, 9], [12, 7]], gavel: [[10, 6], [11, 6], [12, 6], [11, 7], [11, 8]],
    grill: [[5, 9, 'g'], [6, 9, 'g'], [7, 9, 'g'], [8, 9, 'g'], [9, 9, 'g'], [3, 10], [4, 10], [5, 10], [6, 10], [7, 10], [8, 10], [9, 10], [10, 10], [11, 10], [5, 11, 'g'], [6, 11, 'g'], [7, 11, 'g'], [8, 11, 'g'], [9, 11, 'g']]
  };
  function pnc(c) { return String(c).split(' ').map(function (x) { return 'pmx-pn-' + x; }).join(' '); }
  function pnP(c, d) { return '<path class="' + pnc(c) + '" d="' + d + '"/>'; }
  function pnR(c, x, y, w, h) { return '<rect class="' + pnc(c) + '" x="' + n2(x) + '" y="' + n2(y) + '" width="' + n2(w) + '" height="' + n2(h) + '"/>'; }
  function pnSQ(c, cx, cy, s) { return pnR(c, cx - s / 2, cy - s / 2, s, s); }
  function pnPix(rows, extra) {
    var out = '';
    for (var y = 0; y < rows.length; y++) {
      var r = rows[y], x = 0;
      while (x < r.length) {
        var ch = r.charAt(x); if (ch === '.') { x++; continue; }
        var n = 1; while (r.charAt(x + n) === ch) n++;
        out += pnR(ch === 'o' ? 'g' : 'i', x * 2, y * 2, n * 2, 2); x += n;
      }
    }
    (extra || []).forEach(function (p) { out += pnR(p[2] || 'i', p[0] * 2, p[1] * 2, 2, 2); });
    return out;
  }
  function pnRole(prop) {
    var r = PN_ROLE[prop]; if (!r) return '';
    var s = (r.d ? pnP(r.fill + ' so', r.d) : '') + (r.line ? pnP('so', r.line) : '');
    (r.dots || []).forEach(function (d) { s += pnSQ('i', d[0], d[1], 1.8); });
    if (r.moon) s += pnSQ('i', r.moon[0], r.moon[1], 1.8);
    return s;
  }
  function pnUnit(prop, state, M) {
    if (M.z <= 16) return '<g class="pmx-pn-px">' + pnPix(prop === 'you' ? PN.tinyYou : PN.tiny, prop === 'you' ? null : PN_TINY_ROLE[prop]) + '</g>';
    var I = PN, s = '';
    if (prop === 'you') {
      var Y = I.you;
      s = pnR('i', Y.bar[0], Y.bar[1], Y.bar[2], Y.bar[3]) + (M.g3 ? pnSQ('i', Y.studs[0][0], Y.studs[0][1], 1.8) + pnSQ('i', Y.studs[1][0], Y.studs[1][1], 1.8) : '');
      return s + pnP('sl', Y.arm) + pnSQ('i', Y.hand[0], Y.hand[1], Y.hand[2]) + pnP('i', Y.body) + pnP('i', Y.head) + pnR('slit', Y.slit[0], Y.slit[1], Y.slit[2], Y.slit[3]);
    }
    var R0 = PN_ROLE[prop] || {}, big = M.z >= 36;
    s = pnR('i', I.bar[0], I.bar[1], I.bar[2], I.bar[3]);
    if (M.g3) I.studs.forEach(function (x) { s += pnSQ('i', x, I.studY, I.studS); });
    var top = R0.top != null ? (R0.top < 5 ? '' : 'M14 3.9V' + R0.top) : I.headStr;
    var fig = (top ? pnP('str', top) : '') + (M.g2 ? pnP('str hs', I.handStr) : '');
    fig += pnP('sl', I.legs) + pnR('i', I.boots[0][0], I.boots[0][1], 2, 2) + pnR('i', I.boots[1][0], I.boots[1][1], 2, 2);
    if (big) I.knees.forEach(function (k) { fig += pnSQ('g sj', k[0], k[1], I.kneeS); });
    fig += pnP('sl', I.arms) + pnP('i coat', I.coat) + (M.g3 ? pnP('i', I.collar) : '');
    if (big) I.shoulders.forEach(function (k) { fig += pnSQ('g sj', k[0], k[1], I.pinS); });
    if (M.g3) I.hands.forEach(function (k) { fig += pnSQ('g sj', k[0], k[1], I.handS); });
    fig += pnP('g so', I.head) + pnR('i', I.visor[0], I.visor[1], I.visor[2], I.visor[3]);
    if (big && state === 'done') fig += pnP('ko', I.joy); else if (big && state !== 'failed') fig += pnR('g scan', I.scan[0], I.scan[1], I.scan[2], I.scan[3]);
    return s + '<g class="pmx-pn-fig">' + fig + pnRole(prop) + '</g>';
  }
  /* markInner(sil, seat, state, standin, role, size) - the inside of a mark (28 grid). role, when given, picks the
     exact prop (moderator's gavel, teacher's page); without it the prop follows the silhouette. size: the mark's
     size (pmxMark passes it); a plate seat passes none and gets the richest detail. */
  function markInner(sil, seat, state, standin, role, size) {
    state = str(state) || 'idle';
    var prop = role != null && role !== '' ? propOf(role) : (SIL_PROP[sil] || 'hardhat'), M = ppMat(size), out;
    if (M.nier) out = '<g class="pmx-pp" data-prop="' + prop + '" data-fam="nier">' + pnUnit(prop, state, M) + '</g>';
    else if (M.px) out = '<g class="pmx-pp" data-prop="' + prop + '" data-fam="px"><g class="pmx-pp-px">' + ppPixel(prop, state) + '</g></g>';
    else {
      var v = prop === 'grill' ? ppGrill(state, M) : prop === 'you' ? ppYou(M) : ppVector(prop, state, M);
      out = '<g class="pmx-pp" data-prop="' + prop + '" data-fam="v">' + (M.halo ? '<path class="pmx-pp-halo" d="' + v.halo + '"/>' : '') + '<g class="pmx-pp-v">' + v.rig + '</g></g>';
    }
    if (state === 'working') out += pp('floor', PUP.floor);
    if (state === 'done') out += '<circle class="pmx-m-nd" cx="23" cy="23" r="5.4"/><path class="pmx-m-nc" d="m20.6 23.1 1.7 1.7 3.2-3.4"/>';
    if (state === 'needs') out += '<circle class="pmx-m-nd" cx="23" cy="23" r="5.4"/><path class="pmx-m-nw" d="M23 20.2v3.3M23 25.9v.1"/>';
    if (state === 'failed') out += '<circle class="pmx-m-nd" cx="23" cy="23" r="5.4"/><path class="pmx-m-nx" d="m20.6 25.4 4.8-4.8"/>';
    if (standin) out += '<circle class="pmx-m-nd" cx="4.5" cy="4.6" r="4.4"/><path class="pmx-m-sw" d="M2.2 3.8h4.4M5.4 2.6l1.2 1.2-1.2 1.2M6.8 5.6H2.4M3.6 4.4 2.4 5.6l1.2 1.2"/>';
    return out;
  }
  /* SIL: the B1 silhouette names, each its default puppet, drawn when read (pmxPlateParts.you draws SIL.you) so it
     follows the theme like every other mark. */
  var SIL = {};
  ['lead', 'square', 'circle', 'triangle', 'diamond', 'hexagon', 'orbit', 'bowl', 'you'].forEach(function (s) {
    Object.defineProperty(SIL, s, { enumerable: true, get: function () { return markInner(s, 1, 'idle', false); } });
  });
  var MARK_SIZES = { 12: 1, 16: 1, 18: 1, 22: 1, 24: 1, 28: 1, 36: 1 };
  /* pmxMark({key,role,seat,size,state,standin,cls,label}) */
  function pmxMark(o) {
    o = o || {};
    var sil = silOf(o.role);
    var size = MARK_SIZES[o.size] ? o.size : 22;
    var state = str(o.state) || 'idle';
    return '<span class="' + cls('pmx-mark', o.cls) + '"' + k(o.key) + ' data-role="' + esc(roleKey(o.role) || sil) + '" data-sil="' + sil + '" data-state="' + esc(state) + '" data-size="' + size + '"' + (o.standin ? ' data-standin="1"' : '') +
      ' style="' + seatStyle(sil, o.seat) + '"' + (o.label ? ' role="img" aria-label="' + esc(o.label) + '"' : ' aria-hidden="true"') + raw(o.attrs) + '>' +
      '<svg viewBox="0 0 28 28" aria-hidden="true">' + markInner(sil, o.seat, state, o.standin, o.role || sil, size) + '</svg></span>';
  }

  /* ---------------------------------------------------------------- B3/B4 plate */
  function px(v) { return num(v, 0) + 'px'; }
  function pos(x, y) { return ' style="--x:' + px(x) + ';--y:' + px(y) + '"'; }
  function part(p) { return p ? ' data-pmx-part="' + esc(p) + '"' : ''; }
  /* Diagonal hatch clipped to a box, as plain strokes (no <pattern> ids: the
     ghost strip removes ids, and two plates on screen would share one). */
  function hatchPath(x, y, w, h, step) {
    step = step || 4; var d = '';
    for (var c = step; c < w + h; c += step) {
      var x1 = x + Math.max(0, c - h), y1 = y + Math.min(h, c);
      var x2 = x + Math.min(w, c), y2 = y + Math.max(0, c - w);
      d += 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1);
    }
    return d;
  }
  function hatchBox(x, y, w, h, extraCls) {
    return '<rect class="' + cls('pmx-p-hatchbox', extraCls) + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3"/><path class="pmx-p-hatch" d="' + hatchPath(x, y, w, h, 4) + '"/>';
  }
  function svgText(c, x, y, text, anchor) {
    return '<text class="' + c + '" x="' + num(x, 0) + '" y="' + num(y, 0) + '"' + (anchor && anchor !== 'start' ? ' text-anchor="' + esc(anchor) + '"' : '') + '>' + str(text) + '</text>';
  }
  function glyphIn(name, x, y, size) {
    var body = PMX_GLYPHS[name] || '';
    var s = num(size, 12) / 24;
    return '<g class="pmx-p-glyph" transform="translate(' + num(x, 0) + ' ' + num(y, 0) + ') scale(' + s + ')">' + body + '</g>';
  }
  var DRAWS = { down: 1, up: 1, right: 1, left: 1, out: 1 };
  /* the reveal direction of a line: its dominant axis from the first to the last point */
  function drawDir(o, d) {
    var a = o.from, b = o.to;
    if (!(a && b)) {
      var ns = String(d || '').match(/-?\d*\.?\d+/g) || [];
      if (ns.length < 4) return 'right';
      a = { x: +ns[0], y: +ns[1] }; b = { x: +ns[ns.length - 2], y: +ns[ns.length - 1] };
    }
    var dx = num(b.x, 0) - num(a.x, 0), dy = num(b.y, 0) - num(a.y, 0);
    return Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? 'right' : 'left') : (dy >= 0 ? 'down' : 'up');
  }
  var pmxPlateParts = {
    /* band({y,h,name}) draws nothing: it only names the three plate bands
       (upstage, stage, house) so kind layouts share one vocabulary. */
    band: function () { return ''; },
    /* seat({key,x,y,role,seat,state,standin,label,sub,part,floor}) - floor: 'bar' (works at once) or 'hatch'
       (waits its turn) drawn under the mark; a working seat has its bar anyway. J-2 reference update + lead
       ruling (review cycle 1): the name's baseline sits at +42 over a floor mark and +30 without one (the mark
       ends at +14, the bar at +17.4, the hatch at +22), so its ink keeps >= 8 px from the mark and the floor
       mark; the sub-line's baseline is 18 below the name's (>= 6 px between their ink).
       2026-10-07 (cast plates): s scales the 28-grid mark about the seat point (the puppet seats are drawn 1.5x in
       a full plate, 1.25x in a compact one); ly / subDy move the name and its second line (by default the name sits
       14 under the scaled mark and the second line 16 under the name); at:'right' sets the name beside the mark
       (baseline +4, the second line +18), for the one-line Chat Room strip. Without s the J-2 geometry above stays. */
    seat: function (o) {
      o = o || {};
      var sil = silOf(o.role), state = str(o.state) || 'idle';
      var sc = num(o.s, 1) > 0 ? num(o.s, 1) : 1, half = 14 * sc, scaled = o.s != null;
      var floor = o.floor === 'bar' || o.floor === 'hatch' ? o.floor : '';
      var right = o.at === 'right';
      var ly = o.ly != null ? num(o.ly, 30) : right ? 4 : scaled ? Math.round(half + 14) : (floor || state === 'working') ? 42 : 30;
      var sdy = o.subDy != null ? num(o.subDy, 16) : right ? 14 : scaled ? 16 : 18;
      var lx = right ? Math.round(half + 3) : 0, anchor = right ? 'start' : 'middle';
      var fb = floor === 'hatch' ? hatchBox(-22, 15, 44, 7, 'pmx-p-floorhatch')
        : floor === 'bar' && state !== 'working' ? '<rect class="pmx-p-floorbar" x="-7" y="15.4" width="14" height="2" rx="1" style="' + seatStyle(sil, o.seat) + '"/>' : '';
      var lab = o.label ? svgText('pmx-p-lab', lx, ly, o.label, anchor) : '';
      var sub = o.sub ? svgText('pmx-p-sub', lx, ly + sdy, o.sub, anchor) : '';
      /* the placing transform rides on a plain wrapper, never on .pmx-p-mark itself: a sheet gives .pmx-p-mark
         transform-box:fill-box and transform-origin:center for its pop (pmx-system.css), which would scale a transform
         attribute about the figure's middle and shift a 1.5x seat 7 px up and left off its string */
      return '<g class="pmx-p-seat"' + k(o.key) + pos(o.x, o.y) + ' data-state="' + esc(state) + '"' + (floor ? ' data-floor="' + floor + '"' : '') + part(o.part) + '>' + fb +
        '<g transform="translate(' + (-half) + ' ' + (-half) + ')' + (sc !== 1 ? ' scale(' + sc + ')' : '') + '"><g class="pmx-p-mark" data-sil="' + sil + '" data-state="' + esc(state) + '" style="' + seatStyle(sil, o.seat) + '">' +
        markInner(sil, o.seat, state, o.standin, o.role) + '</g></g>' + lab + sub + '</g>';
    },
    /* bus({key,from:{x,y},y,to:[{x,y,style,part,key}],style,part}) - the cast's strings, orthogonal only (2026-10-07):
       a stem from `from` straight down to the bus at y, the bus across every drop (drawn outward from the stem), and a
       drop from the bus down to each target (a target may carry its own style: a queued seat hangs on a slack,
       'hands' string). Without from it is a bar the drops hang from. Every stroke is a pmx-p-line, so it draws on as a
       clip reveal in its own direction (R-23) and lights with its part. */
    bus: function (o) {
      o = o || {};
      var to = Array.isArray(o.to) ? o.to : [], y = num(o.y, 0), key = str(o.key) || 'pmx-p-bus', style = str(o.style) || 'fixed', out = '';
      var xs = to.map(function (t) { return num(t.x, 0); });
      var sx = o.from ? num(o.from.x, 0) : null;
      if (sx != null) xs.push(sx);
      if (!xs.length) return '';
      var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), mid = sx != null ? sx : x0;
      if (sx != null && num(o.from.y, 0) < y) out += pmxPlateParts.line({ key: key + ':stem', from: { x: sx, y: num(o.from.y, 0) }, to: { x: sx, y: y }, style: o.stemStyle || style, part: o.part, draw: 'down' });
      if (mid > x0) out += pmxPlateParts.line({ key: key + ':l', d: 'M' + mid + ' ' + y + 'H' + x0, style: style, part: o.part, draw: 'left' });
      if (x1 > mid) out += pmxPlateParts.line({ key: key + ':r', d: 'M' + mid + ' ' + y + 'H' + x1, style: style, part: o.part, draw: 'right' });
      to.forEach(function (t, i) {
        if (num(t.y, y) > y) out += pmxPlateParts.line({ key: t.key || key + ':' + i, from: { x: num(t.x, 0), y: y }, to: { x: num(t.x, 0), y: num(t.y, y) }, style: t.style || style, part: t.part || o.part, draw: 'down' });
      });
      return out;
    },
    line: function (o) {
      o = o || {};
      var style = str(o.style) || 'fixed';
      var d = o.d || ('M' + num(o.from && o.from.x, 0) + ' ' + num(o.from && o.from.y, 0) + (o.bend ? ' Q' + num(o.bend.x, 0) + ' ' + num(o.bend.y, 0) + ' ' : ' L') + num(o.to && o.to.x, 0) + ' ' + num(o.to && o.to.y, 0));
      /* R-23 / IMPACT A1-05: the stroke draws on as a clip reveal along its main direction; o.draw overrides it */
      var draw = DRAWS[o.draw] ? o.draw : drawDir(o, d);
      return '<path class="pmx-p-line"' + k(o.key) + ' data-style="' + esc(style) + '" data-draw="' + draw + '"' + part(o.part) + ' d="' + esc(d) + '"/>';
    },
    slot: function (o) {
      o = o || {};
      return '<g class="pmx-p-slot"' + k(o.key) + pos(o.x, o.y) + part(o.part) + '>' + hatchBox(-14, -7, 28, 14) +
        svgText('pmx-p-note', 23, 4, o.label == null ? 'waits its turn' : o.label) + '</g>';
    },
    /* screen({key,x,y,h,part,eye}) - the bar between two helpers who can't see each other. 2026-10-07: the eye-off
       glyph over every screen was noise; the legend or the caption says it once (eye:true still draws it). */
    screen: function (o) {
      o = o || {};
      var h = num(o.h, 44);
      return '<g class="pmx-p-screen-g"' + k(o.key) + pos(o.x, o.y) + part(o.part || 'blind') + '><path class="pmx-p-screen" d="M0 ' + (-h / 2) + 'V' + (h / 2) + '"/>' + (o.eye ? glyphIn('eye-off', -5, -h / 2 - 13, 10) : '') + '</g>';
    },
    /* dot({key,x,y,part}) - a junction on a line (Review's bar: where the snapshot goes down to the reviewers and their
       notes come back up) */
    dot: function (o) {
      o = o || {};
      return '<circle class="pmx-p-dot"' + k(o.key) + ' cx="' + num(o.x, 0) + '" cy="' + num(o.y, 0) + '" r="' + num(o.r, 3.5) + '"' + part(o.part) + '/>';
    },
    /* paper({key,x,y,w,h,label,sub,lock,part}) - J-2 + review cycle 1: the paper's words keep 12 px from its
       sides (16 more beside the lock) and 8 px from its edges, and they are FITTED: each line is an HTML line
       inside a foreignObject that ends in an ellipsis at the paper's inner width (a mirrored job title can
       grow as the reader types; the theme font decides the width), so no word ever runs past the paper or
       onto a line leaving it. Baselines as before: label +20, sub +38. A paper with one line of words and less than
       50 of height centres that line (2026-10-07: the 26-tall paper of a compact cast plate). */
    paper: function (o) {
      o = o || {};
      var w = num(o.w, 92), h = num(o.h, 50);
      var tw = Math.max(0, w - 24), subW = o.lock ? Math.max(0, tw - 16) : tw;
      var fy = (o.label && o.sub) || h >= 50 ? 8 : Math.max(2, Math.round((h - 16) / 2));
      var words = (o.label || o.sub) ? '<foreignObject class="pmx-p-paper-fo" x="12" y="' + fy + '" width="' + tw + '" height="' + Math.max(0, h - 2 * fy) + '">' +
        '<div xmlns="http://www.w3.org/1999/xhtml" class="pmx-p-paper-text">' + (o.label ? '<span class="pmx-p-note">' + o.label + '</span>' : '') +
        (o.sub ? '<span class="pmx-p-lab" style="max-width:' + subW + 'px">' + o.sub + '</span>' : '') + '</div></foreignObject>' : '';
      return '<g class="pmx-p-paper-g"' + k(o.key) + pos(o.x, o.y) + part(o.part) + '>' +
        '<path class="pmx-p-paper" d="M0 0H' + (w - 10) + 'L' + w + ' 10V' + h + 'H0z"/><path class="pmx-p-fold" d="M' + (w - 10) + ' 0V10H' + w + '"/>' +
        words + (o.lock ? glyphIn('lock', w - 18, h - 16, 11) : '') + '</g>';
    },
    /* you({x,y,label,sub,anchor,part,s,at,ly,subY}) - s scales the 28-grid figure about its point (2026-10-07; without it
       the legacy .79); at:'below' sets the label under the figure (a one-row strip); ly and subY place the two lines'
       baselines (the cast's top bar puts them on its hub's, -3 and 13) */
    you: function (o) {
      o = o || {};
      var sc = o.s != null && num(o.s, 0) > 0 ? num(o.s, 1) : .79, half = Math.round(14 * sc * 10) / 10;
      var dx = o.s != null ? Math.round(half + 4) : 18, end = o.anchor === 'end', below = o.at === 'below';
      var lx = below ? 0 : end ? -dx : dx, ly = o.ly != null ? num(o.ly, 0) : below ? Math.round(half + 14) : o.at === 'inline' || (o.s != null && !o.sub) ? 4 : -1, an = below ? 'middle' : o.anchor;
      return '<g class="pmx-p-you"' + pos(o.x, o.y) + part(o.part || 'you') + '>' +
        '<g transform="translate(' + (-half) + ' ' + (-half) + ') scale(' + sc + ')"><g class="pmx-p-mark" data-sil="you" data-state="idle" style="--pmx-seat:var(--pmx-seat-you);--pmx-seat-fill:var(--pmx-seat-fill-you)">' + SIL.you + '</g></g>' +
        (o.label ? svgText('pmx-p-lab', lx, ly, o.label, an) : '') + (o.sub ? svgText('pmx-p-sub', lx, o.subY != null ? num(o.subY, 15) : below ? ly + 16 : o.s != null ? 15 : 17, o.sub, an) : '') + '</g>';
    },
    chapter: function (o) {
      o = o || {};
      var state = str(o.state) || 'next';
      /* the chapter a run is on wears a ring as well as the accent (2026-10-08: retro's accent and positive are both
         green, and NieR inks both, so the fill alone did not say "here") */
      return '<g class="pmx-p-chapter"' + k(o.key) + pos(o.x, o.y || 0) + ' data-state="' + esc(state) + '"' + part(o.part) + '>' + (state === 'now' ? '<path class="pmx-p-chap-ring" d="M0 -9.5 9.5 0 0 9.5 -9.5 0z"/>' : '') + '<path class="pmx-p-chap" d="M0 -6 6 0 0 6 -6 0z"/>' +
        (o.label ? svgText('pmx-p-sub', 0, 23, o.label, 'middle') : '') + '</g>';
    },
    table: function (o) {
      o = o || {};
      return '<circle class="pmx-p-table" cx="' + num(o.cx, 0) + '" cy="' + num(o.cy, 0) + '" r="' + num(o.r, 30) + '"' + part(o.part) + '/>';
    },
    cue: function (o) {
      o = o || {};
      var kind = str(o.kind) || 'quiet';
      var body = kind === 'wait' ? hatchBox(0, -5, num(o.w, 40), 10) : '<circle class="pmx-p-cue" data-kind="' + esc(kind) + '" r="4.5"/>';
      return '<g class="pmx-p-cue-g"' + k(o.key) + pos(o.x, o.y || 0) + ' data-kind="' + esc(kind) + '"' + part(o.part) + '>' + body +
        (o.label ? svgText('pmx-p-sub', kind === 'wait' ? num(o.w, 40) / 2 : 0, 22, o.label, 'middle') : '') + '</g>';
    },
    label: function (o) {
      o = o || {};
      return svgText(o.cls === 'lab' ? 'pmx-p-lab' : (o.cls === 'sub' ? 'pmx-p-sub' : (o.cls === 'voice' ? 'pmx-p-voice' : 'pmx-p-note')), o.x, o.y, o.text, o.anchor).replace('<text ', '<text' + part(o.part) + ' ');
    },
    hatch: hatchBox,
    glyph: glyphIn
  };
  var LEGEND = { hands: 'pmx-lg pmx-lg-hands', fixed: 'pmx-lg pmx-lg-fixed', toyou: 'pmx-lg pmx-lg-toyou', sees: 'pmx-lg pmx-lg-sees', hatch: 'pmx-lg pmx-lg-hatch', hollow: 'pmx-lg pmx-lg-hollow', filled: 'pmx-lg pmx-lg-filled', dot: 'pmx-lg pmx-lg-dot', bar: 'pmx-lg pmx-lg-bar', screen: 'pmx-lg pmx-lg-screen' };
  var PLATE_H = { full: 200, compact: 160, lean: 99, strip: 96, caption: 40 };
  /* pmxPlate({key,kind,mode,w,h,svg,legend,caption,cls,fluid,part,fitH,align,attrs})
     fitH: the drawing's natural height when it sits in a .pmx-plate-fit slot (J-2 plate yield);
     align: the viewBox alignment (xMidYMid by default; xMidYMin keeps a drawing at the top). */
  function pmxPlate(o) {
    o = o || {};
    var mode = PLATE_H[o.mode] ? o.mode : 'full';
    var h = num(o.h, PLATE_H[mode]), w = num(o.w, 560);
    var legend = (o.legend || []).map(function (it) {
      var sample = it.sample && LEGEND[it.sample] ? '<i class="' + LEGEND[it.sample] + '"></i>' : str(it.sampleHtml);
      return '<li' + part(it.part) + '>' + sample + '<span>' + str(it.label) + '</span></li>';
    }).join('');
    var align = /^x(Min|Mid|Max)Y(Min|Mid|Max)$/.test(o.align || '') ? o.align : 'xMidYMid';
    return '<figure class="' + cls('pmx-plate', o.cls) + '"' + k(o.key) + ' data-mode="' + mode + '"' + at('data-pmx-kind', o.kind) + (o.fluid ? ' data-fluid="1"' : '') + (o.fitH != null ? ' data-fit-h="' + num(o.fitH, h) + '"' : '') + ' style="--pmx-plate-h:' + h + 'px;--pmx-plate-w:' + w + 'px"' + raw(o.attrs) + '>' +
      (mode === 'caption' ? '' : '<svg class="pmx-plate-svg" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="' + align + ' meet" aria-hidden="true">' + str(o.svg) + '</svg>') +
      (legend ? '<ul class="pmx-legend">' + legend + '</ul>' : '') +
      (o.caption ? '<figcaption class="pmx-fine pmx-plate-cap">' + o.caption + '</figcaption>' : '') + '</figure>';
  }

  /* pmxPlateFit({key,min,plates:[html richest first],fit}) - J-2 plate yield: one slot holding every mode a
     sheet's plate may show, each built with pmxPlate({fitH}); after every render PM56_PMX marks the richest
     mode whose natural height fits (data-fit). The mode chosen last time is carried into the template so a
     re-render never flips it back. A drawing is never scaled down to fit. */
  /* caption (review cycle 1, 6.3 yield order): the words a caption mode shows (40 px); given, a caption plate is
     appended as the leanest mode, so the plate yields all the way down before a roster's rows scroll.
     min: the slot's floor; by default the leanest mode's natural height (the reference: min-height = the leanest
     mode).
     tail (2026-10-08): modes leaner than the caption's 40 px, appended after it (the Chat Room's 32 px lean line), so the
     slot's modes still run from the tallest to the shortest and "leanest" stays the last one. */
  function pmxPlateFit(o) {
    o = o || {};
    var list = Array.isArray(o.plates) ? o.plates.slice() : [str(o.plates)];
    if (o.caption) list.push(pmxPlate({ key: (o.key ? o.key + ':' : '') + 'caption', kind: o.kind, mode: 'caption', fitH: 40, caption: o.caption }));
    if (o.tail) list = list.concat(o.tail);
    var plates = list.join('');
    var leanest = null;
    plates.replace(/data-fit-h="([\d.]+)"/g, function (m, v) { v = +v; if (isFinite(v) && (leanest == null || v < leanest)) leanest = v; return m; });
    var min = o.min != null ? num(o.min, 72) : (leanest != null ? leanest : 72);
    if (o.caption && leanest != null) min = Math.min(min, leanest);
    var fit = o.fit != null ? o.fit : (o.key && window.PM56_PMX && window.PM56_PMX.plateFit ? window.PM56_PMX.plateFit(o.key) : '');
    return '<div class="' + cls('pmx-plate-fit', o.cls) + '"' + k(o.key) + (fit ? ' data-fit="' + esc(fit) + '"' : '') + ' style="--pmx-fit-min:' + min + 'px"' + at('data-pmx-affects', o.affects) + '>' + plates + '</div>';
  }

  /* ---------------------------------------------------------------- B3/B4 cast plates (2026-10-07)
     Jared: the agent graphs of Crew, Review, BrainStorm and Chat Room were "messy, and a little hard to follow".
     ONE grammar draws all four, in the sheets and in the run views (pmxCastPlate / pmxCastFit; each kind only
     describes its cast):
     - THE BAR (the top band) reads left to right like a sentence: what goes in (a paper: the job, the changes, the
       topic), who runs it (the Coordinator or the Moderator puppet on the bar; Review's junction dot, where the
       snapshot goes down to the reviewers and their notes come back), then one accent edge to You at the right end.
       BrainStorm's bar is its seven chapters, the last edge again to You.
     - THE CAST hangs under the bar on strings, orthogonal only: a stem drops from the hub to one bus, the bus drops to
       each puppet's control bar. A queued helper hangs on a slack (dashed) string. Every seat sits on one baseline at
       one pitch and is always named (full: its model on a second line). Review and BrainStorm stand a short screen
       between seats (they can't see each other).
     - THE WING: the specialists (Wonderer, Grill Me) stand at the right end of the seat row, after a dotted rule.
       Nothing routes under or through it.
     - STATE lives on the seats only (the puppet's own state). "waits its turn" is written once, under the queued
       group (full); a note line (Chat Room's turn policy, the screens' meaning) sits in the same place.
     Modes, richest first: full (seats 1.5x, about 155 tall, 182 with a note; 576 wide), compact (seats 1.25x, names
     only; 110 tall, 512 wide so it fits the 1024 column), lean (BrainStorm only: the compact at .86, about 99 tall),
     strip (one row, names under the marks: 60 tall, 500 wide, centred, as wide a pitch as the longest name needs;
     line: names beside the marks, 40 tall, for the Chat Room), the Chat Room's lean line (leanLine: the line at .79,
     32 tall, every name whole) and pmxPlateFit's caption. A mode whose seats would sit closer than its minimum pitch
     is left out, so the slot yields to the next one (J-2: never scaled). */
  var CAST = {
    full: { W: 576, M: 12, s: 1.5, sy: 1.25, bar: 29, paperW: 150, paperH: 50, bus: 64, drop: 10, name: 14, sub: 16, pmin: 84, pmax: 128, wing: 24 },
    /* the compact paper is 32 tall: its one centred line keeps 8 px of ink clear of the paper's top and bottom edges (J-2) */
    compact: { W: 512, M: 12, s: 1.25, sy: 1, bar: 20, paperW: 96, paperH: 32, bus: 46, drop: 8, name: 14, sub: 0, pmin: 70, pmax: 108, wing: 22 },
    strip: { W: 500, M: 12, s: 1, sy: 1, row: 24, H: 60, name: 13, pmin: 58, pref: 76, pmax: 128, wing: 24 },
    line: { W: 576, M: 12, s: .86, sy: .86, row: 20, H: 40 },
    /* leanLine (2026-10-08): the Chat Room's slot is the shortest of the four (the roster pins the Moderator's row), 32-34
       tall at 1280 x 800 where the caption used to stand alone; this line is drawn 32 tall with 22 px puppets (5 clear of
       the floor's edges; 7 before the Moderator's figure, and 11 after You's name so the words keep 12 from the plate's
       edge, J-2), as wide as its row, and keeps every name whole, so it shows only where it fits cleanly, else the
       caption (a default room, 516 wide with its 22 px edge to You, fits the 514-516 px column of a 1024 window in the
       Basic, Glass and NieR themes; Friendly's rounder names, 528, and retro's mono ones, 543, keep the caption there) */
    /* stripLine (2026-10-08): the Chat Room's stacked fallback, for a room whose names do not fit beside the marks (the
       specialists on, a big room): the strip at .86, 48 tall and 576 wide (a 500 px draw would cut names a 576 one keeps
       whole; the room's slot is this tall only from 1440 x 900 up), so it fits the room's 48-53 px slot at 1440 x 900 */
    stripLine: { W: 576, M: 12, s: .86, sy: .86, row: 15, H: 48, name: 12, pmin: 58, pref: 76, pmax: 128, wing: 24 },
    leanLine: { W: 576, M: 7, Mr: 11, s: .79, sy: .79, row: 16, H: 32, whole: 1, gaps: { gap: 10, hub: 18, you: 22, wing: 13 } },
    /* lean: a mode of its own between compact and strip (BrainStorm: 95 tall, so a slot of 95-117, the recorded draft's
       beside its guide strip or a 1280 x 800 window's, keeps the chapters and the strings): seats at .86 hanging right
       off the bus, names 11 under the figures */
    lean: { W: 576, M: 12, s: .86, sy: .86, bar: 20, paperW: 96, paperH: 32, bus: 46, drop: 0, name: 11, sub: 0, pmin: 64, pmax: 104, wing: 24 }
  };
  /* text widths are measured in the theme's own plate font (a canvas, the body's --font-ui: Inter, Poppins, IBM Plex
     Mono, the NieR face) with 4 % to spare; without a canvas, .62 em a character (Plex Mono is .6 em) */
  var castCtx = null;
  function castPlain(t) { return str(t).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&[#a-z0-9]+;/gi, 'x'); }
  function castW(t, fs) {
    var p = castPlain(t); fs = fs || 11;
    if (!p) return 0;
    try {
      if (!castCtx) castCtx = document.createElement('canvas').getContext('2d');
      var fam = getComputedStyle(document.body).getPropertyValue('--font-ui').trim() || 'sans-serif';
      castCtx.font = (fs === 11 ? 600 : 400) + ' ' + fs + 'px ' + fam;
      var w = castCtx.measureText(p).width;
      if (w > 0) return Math.ceil(w * 1.04 + 1);
    } catch (e) { }
    return Math.ceil(p.length * fs * .62);
  }
  function castFit(t, px, fs) {
    t = str(t);
    if (castW(t, fs) <= px) return t;
    /* whole words first ("Export the collection…", "Adversarial…") when that keeps at least half the room; else the
       last word is cut ("Implement…") */
    var words = t.split(/\s+/);
    for (var k = words.length - 1; k >= 1; k--) {
      var cand = words.slice(0, k).join(' ').replace(/[,;:.\s]+$/, '') + '…', cw = castW(cand, fs);
      if (cw <= px) { if (cw >= px * .5) return cand; break; }
    }
    var cut = t.length;
    while (cut > 2 && castW(t.slice(0, cut).replace(/\s+$/, '') + '…', fs) > px) cut--;
    return t.slice(0, cut).replace(/\s+$/, '') + '…';
  }
  function castLabel(t, px, fs) { return esc(castFit(t, px, fs)); }
  /* the helpers' cells (2026-10-08 polish): the row keeps one pitch while every name fits it; when a long name would be
     cut ("Adversarial Review" beside the specialists, "Docs writer" in a five-helper strip) and the short names leave
     room, the long name's cell borrows that room from the others (each keeps at least floor, so a figure never crowds
     its neighbour), in proportion to what each can spare. The row's width does not change. needs: each name's width
     plus 6 between neighbours. */
  function castCells(needs, p, floor) {
    var def = 0, sur = 0;
    needs.forEach(function (nd) { if (nd > p) def += nd - p; else sur += p - Math.max(nd, floor); });
    if (!def || sur <= 0) return needs.map(function () { return p; });
    var take = Math.min(def, sur), kd = take / def, ks = take / sur;
    return needs.map(function (nd) { return nd > p ? p + (nd - p) * kd : p - (p - Math.max(nd, floor)) * ks; });
  }
  /* every name fits whole in a row of n cells at pitch p once the cells are shared out */
  function castFitsAll(needs, p, floor) { return needs.reduce(function (a, nd) { return a + Math.max(nd, Math.min(floor, p)); }, 0) <= needs.length * p + .5; }
  /* the seat centres of a row of cells starting at x0 */
  function castXs(cells, x0) { var x = x0; return cells.map(function (c) { var m = Math.round(x + c / 2); x += c; return m; }); }
  /* one seat of the cast (core or wing) */
  function castSeat(c, x, y, G, o) {
    return pmxPlateParts.seat({ key: c.key, x: x, y: y, s: G.s, role: c.role, seat: c.seat, state: c.state, standin: c.standin, part: c.part,
      at: o.at, ly: o.ly, label: castLabel(c.label, o.lab, 11), sub: o.sub && c.sub ? castLabel(c.sub, o.lab, 10.5) : '' });
  }
  function castPlate(sp, mode, w, h, svg, legend) {
    return pmxPlate({ key: (sp.key || 'pmx-plate-cast') + ':' + mode, kind: sp.kind, mode: mode === 'line' ? 'strip' : mode, w: w, h: h, fitH: h, svg: svg, legend: legend || [], cls: sp.cls, attrs: 'data-cast="' + mode + '"' });
  }
  /* full / compact: the bar, the cast hanging under it, the wing, the note */
  function castStage(sp, mode, Wo) {
    var P = pmxPlateParts, G = CAST[mode], core = sp.seats || [], wing = sp.wing || [], n = core.length, m = wing.length, full = mode === 'full';
    var W = num(Wo, num(sp.w && sp.w[mode], G.W)), M = G.M, s = G.s, half = 14 * s, kp = (sp.key || 'pmx-plate-cast') + ':' + mode + ':';
    if (!n) return '';
    /* the seat row: the helpers at one even pitch; the specialists' wing after a gap, each in a cell as wide as its
       words (their names are short and fixed); the whole row centred. Names under a seat use its whole cell but 8
       (the screens stop at the figures' feet, above the names). */
    var gap = m ? G.wing : 0, wingSub = full;
    var cells = function (subs) { return wing.map(function (c) { return Math.max(56, castW(c.label, 11) + 12, subs && c.sub ? castW(c.sub, 10.5) + 12 : 0); }); };
    var sum = function (a) { return a.reduce(function (x, y) { return x + y; }, 0); };
    var wcs = cells(wingSub), wingW = sum(wcs);
    /* the pitch is G.pmax at most, or as wide as the longest helper name needs (6 between names) when the row has room:
       "Adversarial Review" stays whole in a 576 compact */
    var longest = Math.max.apply(null, core.map(function (c) { return castW(c.label, 11); })), cap = Math.max(G.pmax, longest + 6);
    var needs = core.map(function (c) { return castW(c.label, 11) + 6; });
    var pitch = Math.min(cap, Math.floor((W - 2 * M - gap - wingW) / n));
    /* a short name's cell may give way down to its figure and 18 (9 either side of a screen), never below its own
       name: the row's even pitch keeps G.pmin, but "Product" lending its spare to "Adversarial Review" and
       "Implementation" is what keeps retro's four BrainStorm names whole beside both specialists (2026-10-08) */
    var floor = Math.min(G.pmin, Math.round(2 * half) + 18);
    /* the helpers' names come first: when one would be cut, the specialists' second lines give way */
    if (m && wingSub && !castFitsAll(needs, pitch, floor)) { var w2 = cells(false), p2 = Math.min(cap, Math.floor((W - 2 * M - gap - sum(w2)) / n)); if (p2 > pitch) { wcs = w2; wingW = sum(w2); pitch = p2; wingSub = false; } }
    if (pitch < G.pmin) return '';
    var x0 = Math.round((W - (n * pitch + gap + wingW)) / 2);
    var scw = castCells(needs, pitch, floor), xs = castXs(scw, x0);
    var wx = x0 + n * pitch + gap, wxs = wcs.map(function (w) { var c = Math.round(wx + w / 2); wx += w; return c; });
    var lab = pitch - 6, out = '', stem = null, busY = G.bus, BY = G.bar;
    var you = sp.you || { label: 'You' }, ys = G.sy, yh = 14 * ys;
    if (sp.chapters) {
      /* BrainStorm: the chapters are the bar, names under their diamonds; You stands at the end of the line like an
         eighth stop, its name in the same row. The cast hangs from a bar of its own under the names. */
      ys = Math.min(ys, 1); yh = 14 * ys;
      var ch = sp.chapters, L = Math.max(14, Math.ceil(yh) + 2), ylw = castW(you.label, 11);
      var youX = W - M - Math.max(Math.round(yh), Math.ceil(ylw / 2));
      var cw = ch.map(function (c) { return castW(c.label, 10.5); });
      /* the last chapter's name ends 6 short of You's */
      var lastMax = Math.min(youX - Math.round(yh) - 22, youX - Math.ceil(ylw / 2) - 6 - Math.ceil(cw[cw.length - 1] / 2)), first = M + Math.ceil(cw[0] / 2);
      var q = ch.length > 1 ? Math.min(92, (lastMax - first) / (ch.length - 1)) : 0;
      var cx = ch.map(function (c, i) { return Math.round(first + q * i); });
      /* the stops keep one even step while every pair of neighbouring names keeps 12 of measured ink apart. Where one
         pair would not (retro's mono "Understand" and "Draft alone" sat 4 apart) and the line has room, each step is
         as long as its two names need, plus an even share of what is left (2026-10-08) */
      var ink = function (i) { return (cw[i] - 1) / 1.04; }, steps = [], stepSum = 0;
      for (var si = 0; si < cw.length - 1; si++) { steps.push((ink(si) + ink(si + 1)) / 2 + 12); stepSum += steps[si]; }
      if (steps.length && q < 92 && steps.some(function (d) { return d > q; }) && stepSum <= lastMax - first) {
        var share = (lastMax - first - stepSum) / steps.length, at = first;
        cx = [first].concat(steps.map(function (d) { at += d + share; return Math.round(at); }));
      }
      /* neighbouring names keep 4 apart: where a pair would not, the longer one is fitted. The pair is judged on its
         measured ink (castW less its 4 % and 1 px of spare: two spares side by side cut retro's "Draft alone" by a
         pixel it never needed) */
      for (var ci = 0; ci < cw.length - 1; ci++) {
        var room = 2 * (cx[ci + 1] - cx[ci] - 4);
        if ((cw[ci] + cw[ci + 1] - 2) / 1.04 > room) { if (cw[ci] >= cw[ci + 1]) cw[ci] = Math.max(24, room - cw[ci + 1]); else cw[ci + 1] = Math.max(24, room - cw[ci]); }
      }
      cw[cw.length - 1] = Math.min(cw[cw.length - 1], 2 * (youX - Math.ceil(ylw / 2) - 6 - cx[cx.length - 1]));
      out += P.line({ key: kp + 'chapters', from: { x: cx[0], y: L }, to: { x: cx[cx.length - 1], y: L }, style: 'fixed', part: sp.chapterPart || 'rounds' });
      ch.forEach(function (c, i) { out += P.chapter({ key: kp + 'ch:' + i, x: cx[i], y: L, label: castLabel(c.label, cw[i], 10.5), state: c.state, part: c.part }); });
      out += P.line({ key: kp + 'toyou', from: { x: cx[cx.length - 1] + 8, y: L }, to: { x: youX - Math.round(yh) - 2, y: L }, style: 'toyou', part: you.part || 'you' });
      /* You stands 2 above the line so its name keeps the chapters' baseline (+23) and still clears the figure */
      out += P.you({ x: youX, y: L - 2, s: ys, at: 'below', ly: 25, label: esc(you.label), part: you.part || 'you' });
      busY = L + 35;
      if (G.nobus) { busY = L + 30; stem = null; }
    } else {
      /* the input paper, the hub (a lead puppet, or Review's junction), You */
      /* a full plate drawn wider than 576 (a run view's 640) gives half the extra width to the paper, so more of the job shows */
      var inp = sp.input, pw = inp ? (full ? G.paperW + Math.max(0, Math.round((W - G.W) / 2)) : Math.max(72, Math.min(G.paperW + 54, castW(castPlain(inp.short || inp.label), 10.5) + 28))) : 0, ph = G.paperH, px = M;
      var ylw2 = Math.max(castW(you.label, 11), you.sub ? castW(you.sub, 10.5) : 0);
      var yx = W - M - ylw2 - Math.round(yh + 4);
      /* input.text (plain words, the job or the topic) is fitted to the paper's inner width here, so the paper never
         leans on its CSS ellipsis once drawn (a mirror span, input.mirror, keeps it live while you type) */
      var inSub = inp && inp.text != null ? '<span' + (inp.mirror ? ' data-collab-mirror="' + esc(inp.mirror) + '"' : '') + '>' + castLabel(inp.text, pw - 24, 11) + '</span>' : inp && inp.sub;
      if (inp) out += P.paper({ key: kp + 'paper', x: px, y: BY - ph / 2, w: pw, h: ph, label: full ? inp.label : esc(inp.short || inp.label), sub: full ? inSub : '', part: inp.part });
      var after = px + pw, edgeFrom;
      if (sp.hub) {
        /* 26 from the paper to the hub's figure: retro's wide "This chat's assistant" still leaves the edge to You */
        var hb = sp.hub, hx = after + (inp ? 26 : 0) + Math.round(half);
        var hlw = Math.max(castW(hb.label, 11), hb.sub ? castW(hb.sub, 10.5) : 0);
        if (inp) out += P.line({ key: kp + 'in', from: { x: after, y: BY }, to: { x: hx - Math.round(half) + 2, y: BY }, style: 'fixed', part: inp.part });
        /* the hub's name and second line sit 16 apart, on -3 and 13 (You's two lines take the same baselines): Friendly's
           Poppins name no longer touches "This chat's assistant" under it (14 apart, -2 and 12, it overlapped by 1 px),
           and the second line still keeps 9 above a compact plate's bus (2026-10-08) */
        out += '<g class="pmx-p-hub"' + part(hb.part) + '>' + P.seat({ key: hb.key, x: hx, y: BY, s: s, role: hb.role || 'lead', seat: hb.seat, state: hb.state, part: hb.part, at: 'right', ly: hb.sub ? -3 : 4, subDy: 16,
          label: esc(hb.label), sub: hb.sub ? esc(hb.sub) : '' }) + '</g>';
        edgeFrom = hx + Math.round(half) + 3 + hlw + 10;
        stem = { x: hx, y: BY + Math.round(half) + 1 };
      } else {
        /* the junction sits over the middle of the cast, at least 30 past the paper */
        var mid = Math.round((xs[0] + xs[n - 1]) / 2), jx = Math.max(after + 30, Math.min(mid, yx - 120));
        if (inp) out += P.line({ key: kp + 'in', from: { x: after, y: BY }, to: { x: jx, y: BY }, style: 'fixed', part: inp.part });
        out += P.dot({ key: kp + 'dot', x: jx, y: BY, part: sp.junctionPart || (inp && inp.part) });
        edgeFrom = jx + 4;
        if (sp.out) {
          var ow = castW(sp.out.label, 10.5);
          /* the words sit in the line, 10 clear of its strokes' caps on either side (J-2: text >= 8 from a line) */
          out += P.line({ key: kp + 'out', from: { x: jx + 4, y: BY }, to: { x: jx + 18, y: BY }, style: 'fixed', part: sp.out.part });
          out += P.label({ x: jx + 30, y: BY + 4, text: esc(sp.out.label), cls: 'sub', part: sp.out.part });
          edgeFrom = jx + 30 + ow + 10;
        }
        stem = { x: jx, y: BY + 4 };
      }
      if (yx - Math.round(yh) - 2 - edgeFrom < 18) return '';
      out += P.line({ key: kp + 'toyou', from: { x: edgeFrom, y: BY }, to: { x: yx - Math.round(yh) - 2, y: BY }, style: 'toyou', part: you.part || 'you' });
      out += P.you({ x: yx, y: BY, s: ys, ly: you.sub ? -3 : null, subY: 13, label: esc(you.label), sub: you.sub ? esc(you.sub) : '', part: you.part || 'you' });
    }
    /* the strings, then the seats on them */
    var top = busY + G.drop, SY = Math.round(top + half);
    if (!G.nobus) out += P.bus({ key: kp + 'bus', from: stem, y: busY, style: 'fixed', part: sp.busPart || 'assign',
      to: xs.map(function (x, i) { var c = core[i]; return { x: x, y: Math.round(top + 2 * s), style: c.waits ? 'hands' : '', part: c.waits ? 'parallel ' + (sp.busPart || 'assign') : '' }; }) });
    if (sp.screens) for (var i = 0; i < n - 1; i++) out += P.screen({ key: kp + 'scr:' + i, x: Math.round((xs[i] + xs[i + 1]) / 2), y: SY + Math.round(s), h: Math.round(22 * s), part: 'blind' });
    /* "starts after" (a run view): a short arrow from the helper a seat waits for, at the figures' middle */
    core.forEach(function (c, j) {
      if (!c.after || c.after.from == null || c.after.from >= j) return;
      var ax0 = xs[c.after.from] + Math.round(11 * s) + 4, ax1 = xs[j] - Math.round(11 * s) - 4, ay = SY + Math.round(2 * s);
      if (ax1 - ax0 < 24) return;
      out += P.line({ key: kp + 'after:' + j, from: { x: ax0, y: ay }, to: { x: ax1, y: ay }, style: 'hands', part: 'assign' });
      out += P.line({ key: kp + 'after-head:' + j, d: 'M' + (ax1 - 5) + ' ' + (ay - 4) + 'L' + ax1 + ' ' + ay + 'L' + (ax1 - 5) + ' ' + (ay + 4), style: 'fixed', part: 'assign', draw: 'right' });
      if (c.after.label && ax1 - ax0 >= castW(c.after.label, 10.5) + 4) out += P.label({ x: Math.round((ax0 + ax1) / 2), y: ay - 10, text: esc(c.after.label), cls: 'sub', anchor: 'middle', part: 'assign' });
    });
    /* every name sits G.name under the figure's box (the seat's own default is the same 14 in full and compact) */
    var lo = { lab: lab, sub: full, ly: Math.round(half) + G.name };
    core.forEach(function (c, i) { out += castSeat(c, xs[i], SY, G, { lab: Math.floor(scw[i]) - 6, sub: lo.sub, ly: lo.ly }); });
    var nameY = SY + Math.round(half) + G.name, inkBottom = nameY + (full && core.concat(wing).some(function (c) { return c.sub; }) ? G.sub : 0) + 3;
    if (m) {
      var rx = x0 + n * pitch + Math.round(gap / 2);
      /* the rule spans the seat row only: it starts below the bus (and below BrainStorm's chapter names) */
      out += P.line({ key: kp + 'wing', from: { x: rx, y: sp.chapters ? Math.max(busY + 2, L + 35) : busY + 2 }, to: { x: rx, y: inkBottom }, style: 'rule', part: 'specialists' });
      wing.forEach(function (c, i) { out += castSeat(c, wxs[i], SY, G, { lab: wcs[i] - 8, sub: wingSub, ly: lo.ly }); });
    }
    var H = inkBottom + 7;
    if (full) {
      /* written once, under the queued group: "waits its turn"; or the kind's note line */
      var qi = []; core.forEach(function (c, i) { if (c.waits) qi.push(i); });
      var ly = inkBottom + 9;
      if (qi.length && sp.waits) {
        var bx0 = xs[qi[0]] - Math.round((scw[qi[0]] - 6) / 2), bx1 = xs[qi[qi.length - 1]] + Math.round((scw[qi[qi.length - 1]] - 6) / 2);
        out += P.line({ key: kp + 'waits', from: { x: bx0, y: ly }, to: { x: bx1, y: ly }, style: 'fixed', part: sp.waits.part || 'parallel' });
        out += P.label({ x: Math.round((bx0 + bx1) / 2), y: ly + 17, text: esc(qi.length > 1 ? (sp.waits.many || sp.waits.label) : sp.waits.label), anchor: 'middle', part: sp.waits.part || 'parallel' });
        H = ly + 24;
      } else if (sp.note) {
        out += P.label({ x: M + 4, y: ly + 12, text: esc(sp.note.text), part: sp.note.part });
        H = ly + 19;
      }
    }
    return castPlate(sp, mode, W, Math.round(H), out);
  }
  /* strip: one row, names under the marks (line: beside them). Hub, cast, You, then the wing after a rule. */
  function castRow(sp, mode, Wo) {
    var P = pmxPlateParts, inline = mode === 'line' || mode === 'leanLine', G = CAST[inline || mode === 'stripLine' ? mode : 'strip'], core = sp.seats || [], wing = sp.wing || [], n = core.length, m = wing.length;
    var W = num(Wo, num(sp.w && sp.w[mode], G.W)), M = G.M, s = G.s, half = Math.round(14 * s), Y = G.row, kp = (sp.key || 'pmx-plate-cast') + ':' + mode + ':';
    if (!n) return '';
    var you = sp.you || { label: 'You' }, hb = sp.hub, out = '', x, i;
    if (inline) {
      /* every item is its mark plus its name. The row tries, in order: every name whole at the line's own scale, then
         whole with the marks at .79 (retro's wide mono names), and only then (the 40 px line) names shrinking to 44.
         The lean line keeps every name whole with its tighter gaps, or is left out. g: the gaps (between items, after
         the hub, the edge to You, either side of the wing's rule). */
      var items = (hb ? [hb] : []).concat(core), lw, need, grouped, g;
      var widest = function (list) { return Math.max.apply(null, list.map(function (c) { return castW(c.label, 11); })); };
      var widthOf = function (lim) {
        var t = 0; items.concat(grouped ? [] : wing).forEach(function (c) { t += 2 * half + 3 + Math.min(lim, castW(c.label, 11)); });
        return t + (items.length - 1) * g.gap + (hb ? g.hub - g.gap : 0) + g.you + 2 * half + 3 + castW(you.label, 11) +
          (m ? 2 * g.wing + (grouped ? m * 2 * half + (m - 1) * 4 + 3 + castW('specialists', 11) : (m - 1) * g.gap) : 0);
      };
      var Mr = G.Mr != null ? G.Mr : M, room = function () { return W - M - Mr; };
      var tryRow = function (sc, gaps, whole) {
        s = sc; half = Math.round(14 * s); g = gaps; grouped = false;
        var lmin = whole ? widest(items.concat(wing)) : 44;
        lw = whole ? lmin : 96;
        while ((need = widthOf(lw)) > room() && lw > lmin) lw -= 4;
        /* a wing that does not fit by name stands as one group: its marks side by side and the word "specialists" */
        if (need > room() && m) { grouped = true; lmin = whole ? widest(items) : 44; lw = whole ? lmin : 96; while ((need = widthOf(lw)) > room() && lw > lmin) lw -= 4; }
        return need <= room();
      };
      var STD = { gap: 14, hub: 22, you: 30, wing: 15 };
      var ok = G.whole ? tryRow(G.s, G.gaps || STD, true) : (tryRow(G.s, STD, true) || tryRow(.79, STD, true) || tryRow(G.s, STD, false));
      if (!ok) return '';
      /* the lean line is drawn as wide as its row (the 503-516 px column of a 1024 window takes it when the names fit) */
      if (G.whole) W = Math.max(360, Math.ceil(need) + M + Mr);
      /* the row is centred in the plate (a short room does not hug the left side) */
      x = M + Math.max(0, Math.floor((room() - need) / 2)) + half;
      var prevEnd = null;
      items.forEach(function (c, j) {
        var isHub = hb && j === 0, w2 = Math.min(lw, castW(c.label, 11));
        if (prevEnd != null && hb && j === 1) out += P.line({ key: kp + 'in', from: { x: prevEnd + 6, y: Y }, to: { x: x - half - 2, y: Y }, style: 'fixed', part: sp.busPart || 'assign' });
        out += P.seat({ key: c.key, x: x, y: Y, s: s, role: isHub ? (c.role || 'lead') : c.role, seat: c.seat, state: c.state, standin: c.standin, part: c.part, at: 'right', label: castLabel(c.label, lw, 11) });
        prevEnd = x + half + 3 + w2;
        x = prevEnd + (isHub ? g.hub : g.gap) + half;
      });
      var yx = prevEnd + g.you + half;
      out += P.line({ key: kp + 'toyou', from: { x: prevEnd + 8, y: Y }, to: { x: yx - half - 2, y: Y }, style: 'toyou', part: you.part || 'you' });
      out += P.you({ x: yx, y: Y, s: s, at: 'inline', label: esc(you.label), part: you.part || 'you' });
      if (m) {
        var rx = yx + half + 3 + castW(you.label, 11) + g.wing;
        out += P.line({ key: kp + 'wing', from: { x: rx, y: Y - half }, to: { x: rx, y: Y + half }, style: 'rule', part: 'specialists' });
        x = rx + g.wing + half;
        if (grouped) {
          wing.forEach(function (c, j) { out += P.seat({ key: c.key, x: x + j * (2 * half + 4), y: Y, s: s, role: c.role, seat: c.seat, state: c.state, part: c.part }); });
          out += P.label({ x: x + (m - 1) * (2 * half + 4) + half + 3, y: Y + 4, text: 'specialists', cls: 'lab', part: 'specialists' });
        } else wing.forEach(function (c) { out += P.seat({ key: c.key, x: x, y: Y, s: s, role: c.role, seat: c.seat, state: c.state, part: c.part, at: 'right', label: castLabel(c.label, lw, 11) }); x += 2 * half + 3 + Math.min(lw, castW(c.label, 11)) + g.gap; });
      }
      return castPlate(sp, mode === 'leanLine' ? 'lean' : 'line', W, G.H, out);
    }
    /* stacked: the helpers at one pitch; the hub, You and each specialist in a cell as wide as its name. The pitch is
       the one the longest helper name needs (6 between neighbours' names; at least G.pref, so a short-named team still
       breathes) when the row has room for it, and the row is centred. A wing that does not fit by name, or whose names
       would cut a helper's that grouping keeps whole, stands as one group (two marks side by side over one word,
       "specialists"). */
    /* You's cell is its figure and 4 either side, or its name and 6 (2026-10-08: it was 44 at least, and with the 20 px
       edge to You, formerly 26, the 14 px saved keep retro's four BrainStorm names whole beside both specialists) */
    var hubCell = hb ? Math.max(G.pmin, castW(hb.label, 11) + 12) : 0, youCell = Math.max(2 * half + 8, castW(you.label, 11) + 12), toYou = 20;
    var wcs = wing.map(function (c) { return Math.max(48, castW(c.label, 11) + 10); }), grouped = false;
    var wingW = m ? G.wing + wcs.reduce(function (a, b) { return a + b; }, 0) : 0;
    var fixed = hubCell + (hb ? 16 : 0) + toYou + youCell;
    var needs = core.map(function (c) { return castW(c.label, 11) + 6; }), want = Math.max(G.pmin, Math.max.apply(null, needs));
    var fits = function (p) { return castFitsAll(needs, p, G.pmin); };
    var room = function () { return Math.floor((W - 2 * M - fixed - wingW) / n); };
    var pitch = Math.min(G.pmax, Math.max(want, G.pref), room());
    if (m && !fits(pitch)) {
      var wingNamed = wingW;
      wingW = G.wing + Math.max(m * 2 * half + (m - 1) * 6, castW('specialists', 11) + 10);
      var p2 = Math.min(G.pmax, Math.max(want, G.pref), room());
      if (fits(p2) || (pitch < G.pmin && p2 >= G.pmin)) { pitch = p2; grouped = true; } else wingW = wingNamed;
    }
    if (pitch < G.pmin) return '';
    var lab = pitch - 6, ly = half + G.name;
    x = M + Math.max(0, Math.floor((W - 2 * M - (fixed + n * pitch + wingW)) / 2));
    var hx = null;
    if (hb) { hx = x + hubCell / 2; out += P.seat({ key: hb.key, x: Math.round(hx), y: Y, s: s, role: hb.role || 'lead', seat: hb.seat, state: hb.state, part: hb.part, ly: ly, label: esc(hb.label) }); x += hubCell + 16; }
    var cw = castCells(needs, pitch, G.pmin), xs = castXs(cw, x);
    if (hb) out += P.line({ key: kp + 'in', from: { x: Math.round(hx) + half + 2, y: Y }, to: { x: xs[0] - half - 2, y: Y }, style: 'fixed', part: sp.busPart || 'assign' });
    if (sp.screens) for (i = 0; i < n - 1; i++) out += P.screen({ key: kp + 'scr:' + i, x: Math.round((xs[i] + xs[i + 1]) / 2), y: Y + 1, h: 22, part: 'blind' });
    core.forEach(function (c, j) { out += P.seat({ key: c.key, x: xs[j], y: Y, s: s, role: c.role, seat: c.seat, state: c.state, standin: c.standin, part: c.part, ly: ly, label: castLabel(c.label, Math.floor(cw[j]) - 6, 11) }); });
    x += n * pitch + toYou;
    var yX = Math.round(x + youCell / 2);
    out += P.line({ key: kp + 'toyou', from: { x: xs[n - 1] + half + 4, y: Y }, to: { x: yX - half - 2, y: Y }, style: 'toyou', part: you.part || 'you' });
    /* You's name on the seats' baseline */
    out += P.you({ x: yX, y: Y, s: s, at: 'below', ly: ly, label: esc(you.label), part: you.part || 'you' });
    x += youCell;
    if (m) {
      var rx2 = Math.round(x + G.wing / 2);
      out += P.line({ key: kp + 'wing', from: { x: rx2, y: Y - half }, to: { x: rx2, y: Y + half + 4 }, style: 'rule', part: 'specialists' });
      x += G.wing;
      if (grouped) {
        var gw = wingW - G.wing, gx = x + gw / 2 - ((m - 1) * (2 * half + 6)) / 2;
        wing.forEach(function (c, j) { out += P.seat({ key: c.key, x: Math.round(gx + j * (2 * half + 6)), y: Y, s: s, role: c.role, seat: c.seat, state: c.state, part: c.part }); });
        out += P.label({ x: Math.round(x + gw / 2), y: Y + ly, text: 'specialists', cls: 'lab', anchor: 'middle', part: 'specialists' });
      } else wing.forEach(function (c, j) { out += P.seat({ key: c.key, x: Math.round(x + wcs[j] / 2), y: Y, s: s, role: c.role, seat: c.seat, state: c.state, part: c.part, ly: ly, label: castLabel(c.label, wcs[j] - 8, 11) }); x += wcs[j]; });
    }
    return castPlate(sp, 'strip', W, G.H, out);
  }
  /* pmxCastPlate(spec, mode) - one mode of a cast plate ('' when it does not fit). spec: {key, kind, cls,
     input:{label,sub,text,mirror,short,part} | chapters:[{label,state,part}], hub:{key,role,label,sub,state,part}, junctionPart,
     out:{label,part}, seats:[{key,role,seat,state,standin,label,sub,part,waits}], screens, busPart,
     wing:[{key,role,seat,state,label,sub,part}], you:{label,sub,part}, waits:{label,many,part}, note:{text,part},
     strip:'line' (the strip names sit beside the marks), w:{full,compact,strip,line}}. Labels are plain text. */
  function pmxCastPlate(sp, mode) {
    sp = sp || {};
    /* a one-line kind's lean mode is the lean line (the Chat Room); BrainStorm's lean is a stage */
    var leanLine = mode === 'lean' && sp.strip === 'line';
    var row = mode === 'strip' || mode === 'line' || leanLine, kind = leanLine ? 'leanLine' : mode === 'line' || (mode === 'strip' && sp.strip === 'line') ? 'line' : mode;
    if (!row && !CAST[mode]) return '';
    /* a mode drawn narrow first (a compact plate and a strip fit the 516 px column of a 1024 window); when a big team
       does not fit that, the same mode at 576 (it then shows from 1280 up, and the caption below that) */
    var w0 = num(sp.w && sp.w[kind === 'line' ? 'line' : mode], CAST[kind].W), h = row ? castRow(sp, kind, w0) : castStage(sp, mode, w0);
    if (!h && w0 < 576 && !(sp.w && sp.w[mode])) h = row ? castRow(sp, kind, 576) : castStage(sp, mode, 576);
    /* a one-line strip (the Chat Room) that is too wide for its names beside the marks (a big room, or the specialists
       on) stacks them under the marks instead, so the slot still has a named row before the caption */
    if (!h && kind === 'line' && mode === 'strip') h = castRow(sp, 'stripLine', num(sp.w && sp.w.strip, CAST.stripLine.W));
    return h;
  }
  /* pmxCastFit(spec + {fitKey, affects, caption, modes}) - the plate slot of a sheet: every mode that fits its width,
     richest first, and the caption (J-2 yield) */
  function pmxCastFit(sp) {
    sp = sp || {};
    var modes = sp.modes || ['full', 'compact', 'strip'], plates = [], tail = [];
    /* the lean line (32 tall) is leaner than the caption (40): it stands after it, the slot's last resort that still
       draws the cast, where a short slot used to leave the caption alone (a 1280 x 800 window's Chat Room) */
    modes.forEach(function (md) { var h = pmxCastPlate(sp, md); if (h) (md === 'lean' && sp.strip === 'line' && sp.caption ? tail : plates).push(h); });
    return pmxPlateFit({ key: sp.fitKey, kind: sp.kind, affects: sp.affects, plates: plates, caption: sp.caption, tail: tail });
  }

  /* ---------------------------------------------------------------- A: sheets */
  var SHEET_SIZE = { wide: 'pmx-sheet--wide', standard: 'pmx-sheet--standard', compact: 'pmx-sheet--compact' };
  /* pmxSheet(...) - two siblings: the module-owned scrim, then the sheet. */
  function pmxSheet(o) {
    o = o || {};
    var size = SHEET_SIZE[o.size] ? o.size : 'wide';
    var closeAction = o.closeAction || 'close-dialog';
    var adv = !!o.advancedOpen;
    var layout = o.layout || (adv || o.body != null ? 'one' : 'two');
    var body = adv ? str(o.advancedHtml)
      : (o.body != null ? str(o.body) : '<div class="pmx-col pmx-col--main">' + str(o.main) + '</div><div class="pmx-col pmx-col--side">' + str(o.side) + '</div>');
    var style = o.height ? ' style="--pmx-h:' + num(o.height, 560) + 'px"' : '';
    return '<div class="pmx-scrim" data-k="pmx-scrim" data-action="pmx-scrim" data-close="' + esc(o.scrimClose || closeAction) + '" aria-hidden="true"></div>' +
      '<section class="' + cls('dialog mdl pmx-sheet ' + SHEET_SIZE[size], o.cls) + '" data-k="dlg:' + esc(o.type || 'sheet') + ':' + esc(o.kind || '') + '" data-pmx-kind="' + esc(o.kind || '') + '" data-advanced="' + (adv ? 1 : 0) + '"' +
        at('data-state', o.state) + style + raw(o.attrs) + ' role="dialog" aria-modal="true" aria-label="' + esc(o.ariaLabel || o.titleText || o.title || '') + '">' +
        '<header class="mdl-head pmx-head"><span class="mdl-icon pmx-head-mark">' + (o.markHtml != null ? o.markHtml : pmxKindMark(o.kind, 26)) + '</span>' +
          '<div class="mdl-title pmx-title"><strong>' + str(o.title) + '</strong><span>' + str(o.lead) + '</span></div><span class="spacer"></span>' +
          '<button type="button" class="icon-button pmx-close" data-action="' + esc(closeAction) + '"' + raw(o.closeAttrs) + ' aria-label="Close">' + pmxGlyph('close', 16) + '</button></header>' +
        str(o.guide) + str(o.hero) +
        '<div class="mdl-body pmx-body" data-layout="' + esc(layout) + '">' + body + '</div>' +
        str(o.foot) +
      '</section>';
  }
  function pmxQuestion(o) {
    o = o || {};
    return '<section class="' + cls('mdl-section pmx-q', o.cls) + '"' + k(o.key) + at('data-pmx-affects', o.affects) + at('data-state', o.state) + raw(o.attrs) + '>' +
      '<header class="pmx-q-head">' + (o.n != null && o.n !== '' ? '<span class="pmx-q-n">' + o.n + '</span>' : '') + '<h3 class="pmx-q-title">' + str(o.title) + '</h3>' +
        (o.meta ? '<span class="pmx-q-meta">' + o.meta + '</span>' : '') + '</header>' +
      (o.helper ? '<p class="pmx-help">' + o.helper + '</p>' : '') +
      '<div class="pmx-q-body">' + str(o.body) + '</div></section>';
  }
  function pmxHero(o) {
    o = o || {};
    var f = o.field || {};
    var field = f.tag === 'input'
      ? '<input type="text" class="pmx-hero-field pmx-hero-input" data-pmx-autofocus' + raw(f.attrs) + ' value="' + esc(f.value) + '" placeholder="' + esc(f.placeholder) + '">'
      /* A3 + J-2: the box (border, fill, focus ring) wraps the textarea, so the field can fade a clipped fourth
         line to nothing inside its own bottom padding without fading the border with it */
      : '<div class="pmx-hero-box"><textarea class="pmx-hero-field" rows="' + num(f.rows, 3) + '" data-pmx-autofocus' + raw(f.attrs) + ' placeholder="' + esc(f.placeholder) + '">' + esc(f.value) + '</textarea></div>';
    var side = (o.preview || o.aside) ? '<div class="pmx-hero-side">' + str(o.preview) + str(o.aside) + '</div>' : '';
    /* before (closing, COLLAB FR 3): a control drawn beside the field, ahead of it (Review's target trigger); the hero
       marks itself data-before="1" for the layout that puts it there */
    return '<div class="' + cls('mdl-section pmx-hero', o.cls) + '"' + k(o.key) + ' data-aside="' + (side ? 1 : 0) + '"' + (o.before ? ' data-before="1"' : '') + at('data-pmx-affects', o.affects || 'job') + raw(o.attrs) + '>' +
      '<div class="pmx-hero-main"><header class="pmx-q-head">' + (o.n != null && o.n !== '' ? '<span class="pmx-q-n">' + o.n + '</span>' : '') + '<h3 class="pmx-q-title">' + str(o.title) + '</h3>' +
        (o.headAside ? '<span class="pmx-hero-aside">' + o.headAside + '</span>' : '') + '</header>' +
        str(o.before) + field + (o.helper ? '<p class="pmx-help">' + o.helper + '</p>' : '') + '</div>' + side + '</div>';
  }
  /* pmxCtl({..., capSay}) - capSay: the plan's cap sentence ("You asked for 3; your plan runs 2 at once..."),
     which takes the helper's place under a stepper and always wraps (J-2 reference update) */
  /* width (closing, BSD): the control column's width in px (row layout; the default column is 216) */
  function pmxCtl(o) {
    o = o || {};
    var helper = o.capSay ? '<span class="pmx-step-capsay">' + o.capSay + '</span>' : o.helper;
    var w = o.width != null && isFinite(Number(o.width)) ? ' data-width="1" style="--pmx-ctl-w:' + num(o.width, 216) + 'px"' : '';
    return '<div class="' + cls('pmx-ctl', o.cls) + '"' + k(o.key) + ' data-layout="' + (o.layout === 'stack' ? 'stack' : 'row') + '"' + at('data-pmx-affects', o.affects) + (o.disabled ? ' data-state="disabled"' : '') + w + raw(o.attrs) + '>' +
      '<div class="pmx-ctl-copy"><span class="pmx-ctl-label">' + str(o.label) + '</span>' + (helper ? '<span class="pmx-help">' + helper + '</span>' : '') + '</div>' +
      '<div class="pmx-ctl-control">' + str(o.control) + '</div>' + (o.reason ? '<p class="pmx-reason">' + o.reason + '</p>' : '') + '</div>';
  }
  function pmxRoster(o) {
    o = o || {};
    var head = (o.cols || []).map(function (c) { return '<span class="pmx-roster-col"><b>' + str(c.label) + '</b>' + (c.helper ? '<small>' + c.helper + '</small>' : '') + '</span>'; }).join('');
    return '<div class="' + cls('pmx-roster', o.cls) + '"' + k(o.key) + (o.template ? ' style="--pmx-cols:' + esc(o.template) + '"' : '') + at('data-pmx-affects', o.affects) + raw(o.attrs) + '>' +
      '<div class="pmx-roster-head"><span></span>' + head + '<span></span></div>' +
      '<div class="' + cls('pmx-roster-rows', o.rowsCls) + '"' + (o.scroll ? ' data-scroll="1"' : '') + raw(o.rowsAttrs) + '>' + str(o.rowsHtml) + '</div>' +
      (o.foot != null ? '<div class="pmx-roster-foot">' + str(o.foot) + '</div>' : '') + '</div>';
  }
  function pmxRosterRow(o) {
    o = o || {};
    var j = o.job || {};
    var acts = (o.actions || []).map(function (a) {
      return '<button type="button" class="icon-button pmx-row-act" data-action="' + esc(a.action) + '"' + raw(a.attrs) + ' aria-label="' + esc(a.label) + '">' + g(a.glyph, 14) + '</button>';
    }).join('');
    return '<div class="' + cls('pmx-row', o.cls) + '"' + k(o.key) + ' data-pmx-flip' + at('data-state', o.state) + at('data-failure', o.failure) + raw(o.attrs) + '>' +
      '<span class="pmx-row-mark">' + str(o.mark) + '</span>' +
      '<input type="text" class="pmx-row-job"' + raw(j.attrs) + ' value="' + esc(j.value) + '" placeholder="' + esc(j.placeholder) + '"' + (j.readonly ? ' readonly' : '') + '>' +
      '<span class="pmx-row-model">' + str(o.model) + '</span><span class="pmx-row-persona">' + str(o.persona) + '</span>' +
      '<span class="pmx-row-acts">' + acts + '</span>' + str(o.route) + (o.note ? '<p class="pmx-row-note">' + o.note + '</p>' : '') + '</div>';
  }
  /* pmxAddRow({action,attrs,label}) - the roster foot's "+ Add a helper". */
  function pmxAddRow(o) {
    o = o || {};
    return '<button type="button" class="' + cls('text-button pmx-addrow', o.cls) + '" data-action="' + esc(o.action) + '"' + raw(o.attrs) + (o.disabled ? ' disabled' : '') + '>' + pmxGlyph('plus', 13) + '<span>' + str(o.label || 'Add a helper') + '</span></button>';
  }
  function pmxRoute(o) {
    o = o || {};
    var tone = o.tone === 'failed' ? 'failed' : 'info';
    return '<p class="' + cls('pmx-route', o.cls) + '" data-tone="' + tone + '"' + raw(o.attrs) + '>' + pmxGlyph('swap', 14) +
      '<span><b>' + str(o.strong) + '</b> ' + str(o.text) + (o.fine ? '<small class="pmx-fine">' + o.fine + '</small>' : '') + '</span></p>';
  }
  function pmxShelf(o) {
    o = o || {};
    var items = (o.items || []).map(function (it) {
      var state = it.state === 'on' || it.state === 'disabled' ? it.state : 'off';
      var inp = it.input || {};
      var add = state === 'disabled' ? '<p class="pmx-reason">' + str(it.reason) + '</p>'
        : '<label class="pmx-add" data-on="' + (state === 'on' ? 1 : 0) + '"><input type="checkbox" class="pmx-add-input"' + raw(inp.attrs) + (state === 'on' ? ' checked' : '') + ' data-pmx-harness>' +
          pmxGlyph(state === 'on' ? 'minus' : 'plus', 13) + '<span>' + (state === 'on' ? 'Remove' : 'Add') + '</span></label>';
      return '<div class="pmx-spec"' + k(it.key) + ' data-state="' + state + '"' + at('data-pmx-affects', it.affects) + '>' + str(it.mark) +
        '<div class="pmx-spec-copy"><b>' + str(it.name) + '</b>' + (it.helper ? '<span class="pmx-help">' + it.helper + '</span>' : '') + '</div>' +
        '<div class="pmx-spec-control">' + (state === 'on' ? str(it.control) : '') + add + '</div></div>';
    }).join('');
    return '<div class="' + cls('pmx-shelf', o.cls) + '"' + k(o.key) + at('data-pmx-affects', o.affects || 'specialists') + raw(o.attrs) + '><header class="pmx-q-head">' + (o.n != null ? '<span class="pmx-q-n">' + o.n + '</span>' : '') +
      '<h3 class="pmx-q-title">' + str(o.title || 'Add specialists') + '</h3><span class="pmx-q-meta">' + (o.meta == null ? 'Optional' : o.meta) + '</span></header>' +
      (o.helper ? '<p class="pmx-help">' + o.helper + '</p>' : '') + items + '</div>';
  }
  function pmxStepper(o) {
    o = o || {};
    var inp = o.input || {};
    var min = num(o.min, 1), max = num(o.max, 8), value = num(o.value, min), step = Math.max(1, num(o.step, 1));
    var cap = o.cap == null ? max : num(o.cap, max);
    var cells = '';
    if (o.cells !== false && max <= 12) {
      for (var i = 1; i <= max; i++) cells += '<i class="pmx-cell" data-on="' + (i <= Math.min(value, cap) ? 1 : 0) + '" data-hatch="' + (i > cap && i <= value ? 1 : 0) + '"></i>';
      cells = '<span class="pmx-cells" aria-hidden="true">' + cells + '</span>';
    }
    var forKey = inp.key || '';
    return '<div class="' + cls('pmx-stepper', o.cls) + '"' + k(o.key) + at('data-pmx-affects', o.affects) + raw(o.attrs) + '>' +
      '<button type="button" class="pmx-step" data-action="pmx-step"' + at('data-for', forKey) + ' data-delta="-' + step + '" aria-label="Fewer"' + (value <= min ? ' disabled' : '') + '>' + pmxGlyph('minus', 13) + '</button>' +
      cells + '<output class="pmx-step-val"><b data-k="cnt:' + value + '">' + value + '</b>' + (o.unit ? ' <small>' + o.unit + '</small>' : '') + '</output>' +
      '<button type="button" class="pmx-step" data-action="pmx-step"' + at('data-for', forKey) + ' data-delta="' + step + '" aria-label="More"' + (value >= max ? ' disabled' : '') + '>' + pmxGlyph('plus', 13) + '</button>' +
      '<input type="number" class="pmx-step-input"' + raw(inp.attrs) + ' value="' + value + '" min="' + min + '" max="' + max + '" tabindex="-1" aria-hidden="true"></div>' +
      (o.capText ? '<p class="pmx-step-cap">' + o.capText + '</p>' : '');
  }
  /* unset:true (closing, MEMTEACH): nothing chosen yet (Teach's Replace / Keep both); no option is checked and the
     rule is hidden (data-state="unset"). Keyboard: one tab stop, arrows move the choice (pmx-system.js). */
  function pmxSwitch(o) {
    o = o || {};
    var opts = o.options || [];
    var idx = 0, unset = !!o.unset;
    opts.forEach(function (op, i) { if (String(op.value) === String(o.current)) idx = i; });
    return '<div class="' + cls(o.size === 'small' ? 'pmx-switch pmx-switch--small' : 'pmx-switch', o.cls) + '" role="radiogroup"' + k(o.key) + at('data-pmx-affects', o.affects) + at('aria-label', o.label) + (unset ? ' data-state="unset"' : '') + ' style="--i:' + idx + ';--n:' + Math.max(1, opts.length) + '"' + raw(o.attrs) + '>' +
      opts.map(function (op, i) {
        var on = !unset && i === idx;
        return '<button type="button" role="radio" aria-checked="' + on + '" class="pmx-switch-opt" data-action="' + esc(op.action || o.action) + '" data-value="' + esc(op.value) + '"' + raw(op.attrs) + '>' +
          '<span class="pmx-switch-word">' + str(op.label) + '</span>' + (op.helper ? '<span class="pmx-switch-help">' + op.helper + '</span>' : '') + '</button>';
      }).join('') + '<i class="pmx-switch-rule" aria-hidden="true"></i></div>';
  }
  /* pmxCheck({key,cls,affects,attrs,checked,disabled,label,helper,glyph}) - glyph (item 11, 2026-10-07): a neon glyph
     between the box and the words, at the label's first line (Grill Me's kettle grill); the row is its host, so
     hovering it or focusing the box plays the glyph's act once (neon-icons.css 8d) */
  function pmxCheck(o) {
    o = o || {};
    return '<label class="' + cls('pmx-check', o.cls) + '"' + k(o.key) + at('data-pmx-affects', o.affects) + (o.glyph ? ' data-glyph="' + esc(o.glyph) + '"' : '') + '><input type="checkbox"' + raw(o.attrs) + (o.checked ? ' checked' : '') + (o.disabled ? ' disabled' : '') + ' data-pmx-harness>' +
      '<span class="pmx-box" aria-hidden="true"></span>' + (o.glyph ? '<span class="pmx-check-glyph" aria-hidden="true">' + pmxGlyph(o.glyph, 16) + '</span>' : '') +
      '<span class="pmx-check-copy"><b>' + str(o.label) + '</b>' + (o.helper ? '<small>' + o.helper + '</small>' : '') + '</span></label>';
  }
  function pmxWords(o) {
    o = o || {};
    return '<div class="' + cls('pmx-words', o.cls) + '" role="group"' + k(o.key) + at('data-pmx-affects', o.affects) + at('aria-label', o.label) + raw(o.attrs) + '>' + (o.items || []).map(function (it) {
      return '<button type="button" class="pmx-word" data-action="' + esc(it.action || o.action) + '" data-value="' + esc(it.value) + '" aria-pressed="' + !!it.on + '"' + raw(it.attrs) + '>' + (it.on ? pmxGlyph('check', 12) : '') + str(it.label) + '</button>';
    }).join('') + '</div>';
  }
  /* harness: a test node that exists only for a harness (Review's disabled Auto-repair row), kept visually clipped
     and marked data-pmx-harness (IMPACT A2-19); extra stays for anything else */
  function pmxPromise(o) {
    o = o || {};
    return '<p class="' + cls('pmx-promise', o.cls) + '"' + k(o.key) + at('data-pmx-part', o.part) + raw(o.attrs) + '>' + g(o.glyph || 'lock', 14) + '<span>' + (o.strong ? '<b>' + o.strong + '</b> ' : '') + str(o.text) + '</span>' + str(o.extra) +
      (o.harness ? '<span class="pmx-sr" data-pmx-harness>' + o.harness + '</span>' : '') + '</p>';
  }
  function pmxPromises(itemsHtml) { return '<div class="pmx-promises">' + str(itemsHtml) + '</div>'; }
  function pmxAdvancedEntry(o) {
    o = o || {};
    return '<button type="button" class="' + cls('pmx-adv', o.cls) + '"' + k(o.key) + ' data-action="pmx-advanced" data-value="1" aria-expanded="' + !!o.open + '"' + raw(o.attrs) + '>' +
      '<span class="pmx-adv-label">' + str(o.label || 'Advanced') + '</span><span class="pmx-adv-sum">' + str(o.summary) + '</span>' + pmxGlyph('chevron-right', 14) + '</button>';
  }
  function pmxAdvancedPage(o) {
    o = o || {};
    return '<div class="' + cls('pmx-advpage', o.cls) + '"' + k(o.key) + raw(o.attrs) + '><header class="pmx-advpage-head"><h3 class="pmx-q-title">' + str(o.title || 'Advanced') + '</h3>' +
      (o.intro ? '<p class="pmx-help">' + o.intro + '</p>' : '') +
      '<button type="button" class="text-button" data-action="pmx-advanced" data-value="0">' + pmxGlyph('chevron-left', 13) + 'Back to setup</button></header>' +
      '<div class="pmx-advgrid">' + str(o.rows) + '</div></div>';
  }
  function pmxSetting(o) {
    o = o || {};
    return '<div class="' + cls('pmx-set', o.cls) + '"' + k(o.key) + ' data-pmx-flip' + at('data-pmx-affects', o.affects) + raw(o.attrs) + '><div class="pmx-set-copy"><span class="pmx-ctl-label">' + str(o.label) + '</span>' +
      (o.sentence ? '<p class="pmx-set-say">' + o.sentence + '</p>' : '') + (o.helper ? '<span class="pmx-help">' + o.helper + '</span>' : '') + '</div>' +
      '<div class="pmx-set-control">' + str(o.control) + '</div></div>';
  }
  /* the figure is named by its caption at every size: where a short window takes the caption off the screen (owner
     tweak 2026-10-07) module-shell.css hides it visually only, so it stays the figure's name */
  function pmxPreview(o) {
    o = o || {};
    var label = o.label == null ? 'In your chat' : o.label;
    return '<figure class="' + cls('pmx-preview', o.cls) + '"' + k(o.key) + ' style="--pmx-preview-scale:' + num(o.scale, 0.62) + '"' + raw(o.attrs) + '><figcaption class="pmx-fine">' + str(label) + '</figcaption>' +
      '<div class="pmx-preview-tray"><div class="pmx-preview-card" data-pmx-flight-source>' + str(o.cardHtml) + '</div></div></figure>';
  }
  function pmxReadback(o) {
    o = o || {};
    return '<p class="' + cls('pmx-readback', o.cls) + '"' + k(o.key) + raw(o.attrs) + '>' + (o.parts || []).map(function (p) {
      return '<span class="pmx-rb"' + at('data-pmx-part', p.part) + k(p.key) + '>' + str(p.html) + '</span>';
    }).join('') + '</p>';
  }
  /* pmxEstimate({text} | {minutes:[lo, hi], limitUsd, recorded, unknown, plain}) - IMPACT A2-14: structured, one sentence
     ("About 5–15 min · stops at $6.00 · an estimate, not a promise") */
  function pmxEstimate(o) {
    o = o || {};
    var t = o.recorded ? PMX_COPY.cost.recorded : (o.text != null ? str(o.text) : estimateText(o));
    return o.plain ? t : '<p class="' + cls('pmx-estimate', o.cls) + '">' + t + '</p>';
  }
  function pmxRefusal(o) {
    o = o || {};
    var fix = o.fix;
    return '<p class="' + cls('pmx-refusal', o.cls) + '" role="alert"' + at('data-failure', o.code) + raw(o.attrs) + '>' + pmxGlyph('warn', 15, 'nx-r-status nx-t-attention') + '<span><b>' + str(o.strong || 'Can’t start yet.') + '</b> ' + str(o.text) +
      (fix ? ' <button type="button" class="text-button" data-action="' + esc(fix.action) + '"' + raw(fix.attrs) + '>' + str(fix.label || 'Fix') + '</button>' : '') + '</span></p>';
  }
  /* the number of top-level elements (and loose text runs) in an HTML string: one foot grid column each */
  var VOID_TAG = { area: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1, input: 1, link: 1, meta: 1, source: 1, track: 1, wbr: 1 };
  function topCount(html) {
    var n = 0, depth = 0, last = 0, m, re = /<(\/?)([a-zA-Z][\w-]*)[^>]*?(\/?)>/g;
    html = str(html);
    while ((m = re.exec(html))) {
      if (depth === 0 && html.slice(last, m.index).trim()) n++;
      var tag = m[2].toLowerCase();
      if (m[1]) depth = Math.max(0, depth - 1);
      else if (VOID_TAG[tag] || m[3]) { if (depth === 0) n++; }
      else { if (depth === 0) n++; depth++; }
      last = re.lastIndex;
    }
    if (depth === 0 && html.slice(last).trim()) n++;
    return n;
  }
  /* pmxFoot({cls,attrs,save,readback,estimate,refusal,extra,cancel,primary})
     Closing (lane FOUNDATION REQUESTS): cancel:false draws no Cancel (sheets whose changes apply at once: ELI5, Memory,
     New chat defaults, BSD's read-only sheets, a confirmation whose secondary is its own); primary:null|false draws no
     primary (Revert's Ineligible face, 8.12); primary.key keys the primary's identity (data-k, so a relabelled warm
     primary never tweens to accent in place); the grid gets one column per part actually drawn, extra's own elements
     included (--pmx-foot-cols), so an extra never pushes the primary to a second row; a primary.reason takes the
     estimate's place in the say column (COLLAB FR 1: a wrapped read-back plus the estimate left it no room) and the
     foot grows past 80 px rather than clip. */
  function pmxFoot(o) {
    o = o || {};
    var s = o.save, c = o.cancel === false ? null : (o.cancel || {}), p = o.primary === null || o.primary === false ? null : (o.primary || {});
    var save = s ? '<button type="button" class="text-button pmx-save" data-action="' + esc(s.action) + '" data-state="' + (s.state === 'saved' ? 'saved' : 'idle') + '"' + raw(s.attrs) + '>' +
      pmxGlyph(s.state === 'saved' ? 'check' : 'bookmark', 14) + '<span>' + (s.state === 'saved' ? 'Saved as your default' : (s.label || 'Save as my default')) + '</span></button>' : '';
    var reason = p && p.reason;
    var tone = p && p.tone === 'warm' ? 'warm' : 'accent';
    var cols = (s ? ['auto'] : []).concat(['minmax(0,1fr)']);
    for (var i = topCount(o.extra); i > 0; i--) cols.push('auto');
    if (c) cols.push('auto');
    if (p) cols.push('auto');
    return '<footer class="' + cls('mdl-foot pmx-foot', o.cls) + '" data-save="' + (s ? 1 : 0) + '"' + (reason ? ' data-reason="1"' : '') + (c ? '' : ' data-cancel="0"') + (p ? '' : ' data-primary="0"') +
      ' style="--pmx-foot-cols:' + cols.join(' ') + '"' + raw(o.attrs) + '>' + save +
      /* a refusal takes the read-back's place and the estimate's line too (J-2: two stacked notes crowded the foot) */
      '<div class="pmx-foot-say">' + (o.refusal ? str(o.refusal) : str(o.readback) + (reason ? '' : str(o.estimate))) + '</div>' + str(o.extra) +
      (c ? '<button type="button" class="soft-button pmx-cancel" data-action="' + esc(c.action || 'close-dialog') + '"' + raw(c.attrs) + '>' + str(c.label || 'Cancel') + '</button>' : '') +
      (p ? '<button type="button" class="primary-button pmx-primary" data-action="' + esc(p.action) + '" data-tone="' + tone + '"' + k(p.key) + raw(p.attrs) + (p.disabled ? ' disabled' : '') + '><span class="pmx-primary-label">' + str(p.label) + '</span></button>' : '') +
      (reason ? '<p class="' + cls('pmx-reason pmx-foot-reason', p.reasonCls) + '">' + reason + '</p>' : '') + '</footer>';
  }
  function pmxConfirm(o) {
    o = o || {};
    return '<div class="' + cls('pmx-confirm', o.cls) + '"' + k(o.key) + raw(o.attrs) + '>' + str(o.markHtml) + '<p class="pmx-confirm-head">' + str(o.headline) + '</p>' + (o.text ? '<p class="pmx-help">' + o.text + '</p>' : '') +
      (o.actions ? '<div class="pmx-confirm-acts">' + o.actions + '</div>' : '') + '</div>';
  }
  function pmxTabs(o) {
    o = o || {};
    var attr = o.attr || 'data-value';
    return '<div class="' + cls('pmx-tabs', o.cls) + '" role="tablist"' + k(o.key) + raw(o.attrs) + '>' + (o.items || []).map(function (it) {
      var on = String(it.value) === String(o.current);
      return '<button type="button" role="tab" aria-selected="' + on + '" class="pmx-tab' + (on ? ' active' : '') + '" data-action="' + esc(o.action) + '" ' + attr + '="' + esc(it.value) + '"' + raw(it.attrs) + '>' + str(it.label) +
        (it.count != null && it.count !== '' ? '<small>' + it.count + '</small>' : '') + '</button>';
    }).join('') + '</div>';
  }

  /* ---------------------------------------------------------------- C: in chat */
  /* Preview mode (A16, amendment G-22): the same card, inert. Keys get a pv:
     prefix, every data-action / data-run / data-run-id / data-pm-keep goes,
     buttons become spans, and every non-pmx class (the hook classes a module
     passed through cls/headCls/badgeCls/...) is dropped, so no harness
     selector and no action can match the preview. The neon family's own
     classes (nx, nx-*: role, tone, halo, tube, part, still wrapper) are paint,
     not hooks, and stay, so the preview's kind badge and status mark are lit
     like the card's (fpfix F-1: the configure sheets' previews drew them bare). */
  var LOOK = { 'primary-button': 1, 'soft-button': 1, 'text-button': 1, 'icon-button': 1 };
  function inert(html) {
    return str(html)
      .replace(/<(\/?)button\b/g, '<$1span')
      .replace(/\s(?:data-action|data-run|data-run-id|data-pm-keep|data-menu-anchor|data-pmx-autofocus|data-hover-key|data-hover-tip|tabindex)(?:="[^"]*")?(?=[\s>\/])/g, '')
      .replace(/\sdata-k="([^"]*)"/g, function (m, v) { return ' data-k="pv:' + v + '"'; })
      .replace(/\sclass="([^"]*)"/g, function (m, v) {
        var keep = v.split(/\s+/).filter(function (c) { return c && (c.indexOf('pmx-') === 0 || c === 'nx' || c.indexOf('nx-') === 0 || LOOK[c]); });
        return keep.length ? ' class="' + keep.join(' ') + '"' : '';
      })
      .replace(/\s(?:type="button"|disabled)(?=[\s>\/])/g, '');
  }
  var DENSITIES = { starting: 1, waiting: 1, live: 1, collapsed: 1, attention: 1, result: 1, failed: 1, receipt: 1 };
  /* pmxRun({key,runId,kind,density,cls,attrs,arriving,preview,headHtml,bodyHtml,bodyKey,bodyCls,footHtml,headCls,footCls,tone,settling}) */
  function pmxRun(o) {
    o = o || {};
    var density = DENSITIES[o.density] ? o.density : 'live';
    if (o.preview) {
      /* closing (COLLAB FR 15): the preview keeps a caller's pmx-* classes and its attrs, run through the same inert
         filter as the card's markup (no action, run id or hook survives); non-pmx classes are dropped as before */
      var pvCls = str(o.cls).split(/\s+/).filter(function (c) { return c.indexOf('pmx-') === 0; }).join(' ');
      var pvAttrs = o.attrs ? inert('<i ' + str(o.attrs).trim() + '>').replace(/^<i|>$/g, '') : '';
      return '<article class="' + cls('pmx-run', pvCls) + '" data-k="pv:' + esc(o.key || 'run') + '" data-pmx-preview="1" data-density="' + density + '"' + at('data-pmx-kind', o.kind) + at('data-tone', o.tone) + pvAttrs + ' aria-hidden="true">' +
        '<header class="pmx-run-head">' + inert(o.headHtml) + '</header><div class="pmx-run-body">' + inert(o.bodyHtml) + '</div></article>';
    }
    return '<article class="' + cls('pmx-run', o.cls) + '"' + k(o.key) + ' data-density="' + density + '"' + at('data-pmx-kind', o.kind) + at('data-run-id', o.runId) + at('data-tone', o.tone) +
      (o.arriving ? ' data-pmx-arrive="1"' : '') + (o.settling ? ' data-pmx-settling="1"' : '') + ' data-flip' + raw(o.attrs) + '>' +
      '<header class="' + cls('pmx-run-head', o.headCls) + '">' + str(o.headHtml) + '</header>' +
      '<div class="' + cls('pmx-run-body', o.bodyCls) + '"' + k(o.bodyKey) + '>' + str(o.bodyHtml) + '</div>' +
      '<footer class="' + cls('pmx-run-foot', o.footCls) + '">' + str(o.footHtml) + '</footer></article>';
  }
  function cluster(list, max, mini) {
    if (typeof list === 'string') return '<span class="pmx-cluster' + (mini ? ' pmx-cluster--mini' : '') + '">' + list + '</span>';
    list = list || [];
    max = num(max, 5);
    /* '|' in the list draws a thin screen between neighbours (blind reviewers) */
    var marks = list.filter(function (x) { return x !== '|'; });
    var shown = '', seen = 0;
    for (var i = 0; i < list.length && seen < max; i++) {
      if (list[i] === '|') { if (seen) shown += '<i class="pmx-cluster-screen" aria-hidden="true"></i>'; continue; }
      shown += list[i]; seen++;
    }
    list = marks;
    var more = list.length > max ? '<span class="pmx-cluster-more">+' + (list.length - max) + '</span>' : '';
    return '<span class="pmx-cluster' + (mini ? ' pmx-cluster--mini' : '') + '" data-count="' + list.length + '">' + shown + more + '</span>';
  }
  function pmxRunHead(o) {
    o = o || {};
    return '<span class="' + cls('pmx-run-kind', o.badgeCls) + '">' + (o.markHtml != null ? o.markHtml : pmxKindMark(o.kind, 16)) + '<span class="pmx-run-kindword">' + str(o.kindWord) + '</span></span>' +
      '<h4 class="' + cls('pmx-run-title', o.titleCls) + '">' + str(o.title) + '</h4>' +
      (o.cluster != null ? cluster(o.cluster, o.clusterMax) : '') +
      (o.clock != null ? '<span class="pmx-clock"' + k(o.clockKey) + '>' + o.clock + '</span>' : '') + str(o.extra);
  }
  /* STATUS_GLYPH: the drawing each run status had before the neon family; pmxStatus() falls back to it when
     PM56_NEON is absent (tests/shell-selfcheck.cjs evals this file bare). */
  var STATUS_GLYPH = { starting: 'ring', waiting: 'ring-dashed', running: 'arc', live: 'arc', needs: 'ring-dot', yourmove: 'ring-dot', paused: 'pause', done: 'check', cancelled: 'slash-circle', canceled: 'slash-circle', failed: 'warn', attention: 'warn', limit: 'warn' };
  /* pmxStatus(status,size,cls) - neon step 3E (2026-10-02): a status mark from the shared status set (neon-icons.js
     status()), lit and STILL. Its wrapper carries nx-still, so the set's list rhythms (the bead's orbit, the
     needs-you hop, blocked's blink, failed's stutter, the breathing backlight) never run inside a pmx host and only
     the one-shot act plays as the mark mounts: a live card's loop budget is spent by its two pmx-sheen loops and
     every other pmx host allows none (pmx-verify loop-census). Run statuses map onto the set: a waiting run is
     queued for its turn (waiting-dep, the hourglass), needs and yourmove are "needs you" (yourmove keeps the accent,
     neon-icons.css section 14), cancelled is skipped. attention, limit and warn have no member of the set: they
     are the warning triangle lit in the attention tone, in the same still wrapper. Any other name is a set name or
     alias (scheduled, verified, stale, held, blocked...), which the module tables pass straight through. cls goes on the wrapper (the fallback drawing's svg). */
  var PMX_STATUS = { starting: 'working', running: 'working', live: 'working', waiting: 'waiting-dep', needs: 'waiting', yourmove: 'waiting', paused: 'paused', done: 'complete', cancelled: 'skipped', canceled: 'skipped', failed: 'failed' };
  var PMX_STATUS_WARN = { attention: 1, limit: 1, warn: 1 };
  var PMX_STATUS_OLD = { complete: 'check', completed: 'check', sent: 'check', verified: 'check-circle', skipped: 'slash-circle', stale: 'slash-circle', expired: 'slash-circle', pending: 'ring-dashed', unverified: 'ring-dashed', scheduled: 'clock', 'waiting-dep': 'ring-dashed', held: 'warn', working: 'arc', blocked: 'lock', invalidated: 'warn', decide: 'hand' };
  function pmxStatus(status, size, extraCls) {
    status = str(status) || 'running'; size = num(size, 14);
    var N = neon(), c = cls('nx-still', extraCls);
    if (N && typeof N.status === 'function') {
      if (PMX_STATUS_WARN[status]) return '<span class="nx-st nx-tn-attention ' + esc(c) + '" data-k="st:' + esc(status) + '" aria-hidden="true">' + N.icon('warning', size, 'nx-r-status nx-t-attention') + '</span>';
      return N.status(PMX_STATUS[status] || status, size, c);
    }
    return pmxGlyph(STATUS_GLYPH[status] || PMX_STATUS_OLD[status] || 'ring', size, extraCls);
  }
  function pmxSentence(o) {
    o = o || {};
    var status = str(o.status) || 'running';
    var word = str(o.word), reason = str(o.reason);
    return '<p class="' + cls('pmx-sentence', o.cls) + '"' + k(o.key) + ' data-status="' + esc(status) + '">' +
      '<span class="pmx-st-glyph" data-k="stg:' + esc(status) + '">' + (o.glyph ? g(o.glyph, 14) : pmxStatus(status, 14)) + '</span>' +
      '<span class="pmx-st-text" data-k="st:' + pmxHash(word + '|' + reason) + '">' + (word ? '<b>' + word + '</b>' : '') + (word && reason ? ' · ' : '') + reason + '</span></p>';
  }
  var STOP_STATES = { done: 1, now: 1, next: 1, skipped: 1, failed: 1 };
  function pmxTrack(o) {
    o = o || {};
    /* data-n (closing, STORM-A): the stop count; a long track (6 or more stops) keeps its M form at the L tier, where
       every label beside its dot would not fit */
    return '<div class="' + cls('pmx-track', o.cls) + '"' + k(o.key) + ' data-n="' + (o.stops || []).length + '"' + raw(o.attrs) + '><ol class="pmx-track-line">' + (o.stops || []).map(function (s) {
      var st = STOP_STATES[s.state] ? s.state : 'next';
      return '<li class="pmx-stop"' + k(s.key) + ' data-state="' + st + '"><i class="pmx-stop-dot"></i><span class="pmx-stop-label">' + str(s.label) + '</span></li>';
    }).join('') + '</ol><p class="pmx-track-now">' + str(o.nowText) + '</p></div>';
  }
  function pmxLane(o) {
    o = o || {};
    var kind = o.line2Kind === 'quote' || o.line2Kind === 'sealed' ? o.line2Kind : 'detail';
    return '<button type="button" class="' + cls('pmx-lane', o.cls) + '"' + k(o.key) + at('data-state', o.state) + at('data-action', o.action) + raw(o.attrs) + '>' +
      '<span class="pmx-lane-mark">' + str(o.mark) + '</span>' +
      '<span class="pmx-lane-l1"><b class="pmx-lane-name">' + str(o.name) + '</b>' + (o.sub ? '<span class="pmx-lane-sub">' + o.sub + '</span>' : '') +
        (o.verb ? '<span class="pmx-lane-verb"' + k(o.verbKey) + (o.fresh ? ' data-pmx-fresh="1"' : '') + '>' + o.verb + '</span>' : '') + '</span>' +
      '<span class="pmx-lane-time">' + str(o.time) + '</span>' +
      '<span class="pmx-lane-l2" data-kind="' + kind + '"' + (o.keep ? ' data-pm-keep' : '') + k(o.keepKey) + '>' + str(o.line2) + '</span></button>';
  }
  /* pmxLanes({key,cls,attrs,lanesHtml,more:{count,text,action,attrs},narrow:{action,attrs}|false,kind,collabHooks,runId})
     - review cycle 2 (7.2 below 260 px): an attention card keeps ONE lane there, so with two or more lanes the builder
     also writes the narrow "+N more · Show all" row, whose N counts the lanes it hides too (the caller's own row counts
     only the ones it left out). Exactly one of the two rows is displayed at any width (CSS), so the count shown is
     always true. The narrow row reuses the caller's more action, or `narrow`, or (a Collaboration kind with its runId)
     collab-toggle-expand on that run; with no action to give it, nothing narrows (all lanes stay, line 1 only). */
  var LANE_RE = /<button type="button" class="pmx-lane[ "]/g;
  function pmxLanes(o) {
    o = o || {};
    var m = o.more, n = (str(o.lanesHtml).match(LANE_RE) || []).length;
    var na = o.narrow === false ? null : (o.narrow || (m && m.action ? { action: m.action, attrs: m.attrs } :
      (collabOn(o) && o.runId != null && o.runId !== '' ? { action: 'collab-toggle-expand', attrs: 'data-run="' + esc(o.runId) + '"' } : null)));
    var narrow = na && na.action && n >= 2 ? '<button type="button" class="pmx-lanes-more pmx-lanes-more-s"' + at('data-action', na.action) + raw(na.attrs) + '><b>' +
      pmxFill(PMX_COPY.actions.moreRows, { n: (m ? num(m.count, 0) : 0) + n - 1 }) + '</b> · ' + PMX_COPY.actions.showAll + '</button>' : '';
    return '<div class="' + cls('pmx-lanes', o.cls) + '"' + k(o.key) + raw(o.attrs) + '>' + str(o.lanesHtml) +
      (m ? '<button type="button" class="pmx-lanes-more"' + at('data-action', m.action) + raw(m.attrs) + '><b>+' + num(m.count, 0) + ' more</b>' + (m.text ? ' · ' + m.text : '') + '</button>' : '') + narrow + '</div>';
  }
  function btnCls(a, base) {
    var t = a.tone || (a.primary ? 'primary' : (a.soft ? 'soft' : 'text'));
    return cls((t === 'primary' ? 'primary-button' : t === 'soft' ? 'soft-button' : 'text-button') + ' ' + base, a.cls);
  }
  /* closing (STORM-A): a disabled action's reason is printed under the row, never dropped */
  function actReasons(items) {
    return (items || []).filter(function (a) { return a && a.disabled && a.reason; }).map(function (a) { return '<p class="pmx-reason pmx-act-reason">' + a.reason + '</p>'; }).join('');
  }
  function actButton(a, base) {
    a = a || {};
    return '<button type="button" class="' + btnCls(a, base || 'pmx-act') + '"' + at('data-action', a.action) + raw(a.attrs) + (a.disabled ? ' disabled' : '') + (a.aria ? ' aria-label="' + esc(a.aria) + '"' : '') + '>' +
      (a.glyph ? g(a.glyph, 13) : '') + str(a.label) + '</button>';
  }
  /* review cycle 2 (7.2 below 260 px): a third answer that is only a text button (Details, Cancel ...) carries
     pmx-act-extra and leaves the decision row below 260 px when the card has a More menu, which lists it; the two
     answers stay. item.extra overrides. */
  /* neon step 3E: a decision row leads with the status set's needs-you mark, still (pmxStatus): warm is needs
     (attention), accent is your move (the canon accent); a caller's 'warn' is the attention triangle; any other glyph
     (memory's hand) is drawn as given. The mark sits in its own slot (an <i>, never a span): the status wrapper is a
     span, and as a direct span child of the say line it took the reason's clamp (display:-webkit-box, overflow hidden,
     which cut its backlight) and was the line's first `> span`, the one every caller reads as the reason. */
  function decisionMark(glyph, tone) {
    var m = !glyph || glyph === 'ring-dot' ? pmxStatus(tone === 'accent' ? 'yourmove' : 'needs', 14) : glyph === 'warn' ? pmxStatus('attention', 14) : g(glyph, 14);
    return m ? '<i class="pmx-decision-mark">' + m + '</i>' : '';
  }
  function pmxDecision(o) {
    o = o || {};
    var tone = o.tone === 'accent' ? 'accent' : 'warm';
    return '<div class="' + cls('pmx-decision', o.cls) + '"' + k(o.key) + ' data-tone="' + tone + '" role="group"' + raw(o.attrs) + '>' +
      '<p class="pmx-decision-say">' + decisionMark(o.glyph, tone) + '<span>' + str(o.sentence) + '</span></p>' +
      '<div class="pmx-decision-acts">' + (o.actions || []).map(function (a, i) {
        a = a || {};
        var extra = a.extra != null ? !!a.extra : (i >= 2 && !a.primary && !a.soft && (!a.tone || a.tone === 'text'));
        return actButton(extra ? Object.assign({}, a, { cls: cls('pmx-act-extra', a.cls) }) : a, 'pmx-act');
      }).join('') + '</div>' + actReasons(o.actions) + '</div>';
  }
  /* neon step 3E: a result's done mark is the status set's complete, still (pmxStatus); any other glyph is drawn as given */
  function pmxResult(o) {
    o = o || {};
    return '<div class="' + cls('pmx-result', o.cls) + '"' + k(o.key) + raw(o.attrs) + '><p class="pmx-result-head">' + (!o.glyph || o.glyph === 'check' ? pmxStatus('done', 18) : g(o.glyph, 18)) + '<span class="pmx-result-headline">' + str(o.headline) + '</span></p>' +
      (o.sub ? '<p class="pmx-result-sub">' + o.sub + '</p>' : '') + str(o.outputHtml) + str(o.boardHtml) + str(o.creditsHtml) + '</div>';
  }
  function pmxOutput(o) {
    o = o || {};
    var d = o.diff;
    var lines = (o.lines || []).slice(0, 3).map(function (l) { return '<span>' + str(l) + '</span>'; }).join('');
    return '<div class="' + cls('pmx-output', o.cls) + '"' + k(o.key) + raw(o.attrs) + '><p class="pmx-output-head">' + pmxGlyph(o.glyph || 'file', 13) + '<b>' + str(o.name) + '</b>' + (o.meta ? '<span>' + o.meta + '</span>' : '') +
      (d ? '<span class="pmx-diff"><i class="pmx-add">+' + num(d.add, 0) + '</i> <i class="pmx-del">−' + num(d.del, 0) + '</i>' + (d.files != null ? ' in ' + d.files + ' files' : '') + '</span>' : '') + '</p>' +
      (lines ? '<pre class="pmx-output-pre">' + lines + '</pre>' : '') + '</div>';
  }
  function pmxCredits(o) {
    o = o || {};
    var items = o.items || [];
    var more = items.length >= 5 ? '<li class="pmx-credits-more"><b>+' + (items.length - 3) + ' more</b></li>' : '';
    /* review cycle 2 (7.2 below 260 px): the band is one row there, the first helper (mark and full name, no `did`)
       and "+N more" for the rest (two names at 176-200 px were both cut to a few letters); this item is displayed
       only in that tier (the full list is in the run view) */
    var rest = items.length >= 2 ? '<li class="pmx-credits-rest"><b>' + pmxFill(PMX_COPY.actions.moreRows, { n: items.length - 1 }) + '</b></li>' : '';
    return '<div class="' + cls('pmx-credits', o.cls) + '" data-count="' + items.length + '"' + k(o.key) + raw(o.attrs) + '><p class="pmx-fine">' + str(o.title || 'Who did what') + '</p><ul>' + items.map(function (it) {
      return '<li>' + str(it.mark) + '<b>' + str(it.name) + '</b><span class="pmx-did">' + str(it.did) + '</span></li>';
    }).join('') + more + rest + '</ul></div>';
  }
  function pmxMeta(o) {
    o = o || {};
    var parts = (o.parts || []).filter(function (p) { return p != null && p !== ''; });
    return '<p class="' + cls('pmx-meta', o.cls) + '"' + k(o.key) + raw(o.attrs) + '>' + (o.recorded ? '<span class="pmx-recorded">Recorded example · no AI cost</span>' + (parts.length ? ' · ' : '') : '') + parts.join(' · ') + '</p>';
  }
  /* 7.2 S tier (review cycle 1): the card's own actions (Open Panel, Message) stay on the one row; a kind's extra
     actions (Download, Watch a recorded example, Create To-Dos ...) carry pmx-act-extra and leave the row below
     360 px, so the lane's More menu must list them. item.extra overrides; a row with no core action keeps all. */
  var CORE_ACTS = { 'collab-open-panel': 1, 'collab-message': 1 };
  function pmxActions(o) {
    o = o || {};
    var collab = collabOn(o);
    var e = o.expand, m = o.more;
    var ea = e && (e.action || (collab ? 'collab-toggle-expand' : '')), ma = m && (m.action || (collab ? 'collab-toggle-more' : ''));
    var items = o.items || [];
    var hasCore = items.some(function (a) { return a && (a.core || CORE_ACTS[a.action]); });
    return '<div class="' + cls('pmx-actions', o.cls) + '"' + k(o.key) + raw(o.attrs) + '>' + items.map(function (a) {
      a = a || {};
      var extra = a.extra != null ? !!a.extra : (hasCore && !a.core && !CORE_ACTS[a.action]);
      return actButton(extra ? Object.assign({}, a, { cls: cls('pmx-act-extra', a.cls) }) : a, 'pmx-act');
    }).join('') +
      ((ea || ma) ? '<span class="pmx-grow"></span>' : '') +
      (ea ? '<button type="button" class="icon-button pmx-act" data-action="' + esc(ea) + '"' + raw(e.attrs) + ' aria-label="' + (e.open ? 'Collapse' : 'Expand') + '" aria-expanded="' + !!e.open + '">' + pmxGlyph(e.open ? 'chevron-up' : 'chevron-down', 15) + '</button>' : '') +
      (ma ? '<button type="button" class="icon-button pmx-act" data-action="' + esc(ma) + '"' + raw(m.attrs) + ' aria-label="More" aria-expanded="' + !!m.open + '">' + pmxGlyph('more', 16) + '</button>' : '') + actReasons(items) + '</div>';
  }
  /* pmxLedgerLine({key,cls,attrs,kind,kindWord,markHtml,cluster,title,headline,glyph,time,cost,recorded,runId,actions,footHtml,
                   hoverKey,headCls,footCls,badgeCls,titleCls,statusCls,metaCls}) - IMPACT A2-14: the one-line receipt every
     module uses (44 px, hairlines above and below, no fill). At most two actions (or footHtml). The headline's hover
     card carries time and cost, which R-21 moves off the line at the M tier; a recorded run (A3-03 provenance) shows a
     13 px play-ring before the headline at every tier and "Recorded example · no AI cost" as the card's first line
     (IMPACT A1-24). The run title stays in the DOM for the harness at every tier (IMPACT A2-19). */
  function pmxLedgerLine(o) {
    o = o || {};
    /* closing review (DESIGN major): a recorded run's play-ring already says "recorded", and its hover card's first line
       says "Recorded example · no AI cost" (A1-24); printing the same words as the line's cost left the headline ~70 px
       at the L tier ("Export re..."), so that cost stays in the hover card only */
    var cost = o.recorded && plainText(o.cost) === PMX_COPY.cost.recorded ? '' : o.cost;
    var meta = [o.time, cost].filter(nonEmpty).map(function (p, i) { return '<span class="' + (i ? 'pmx-receipt-cost' : 'pmx-receipt-time') + '">' + p + '</span>'; }).join('<span class="pmx-receipt-sep"> · </span>');
    /* tip (closing, MEMTEACH): the headline's hover-card text, given outright */
    var tip = o.tip != null ? plainText(o.tip) : [o.recorded ? PMX_COPY.cost.recorded : '', [o.time, cost].filter(nonEmpty).map(plainText).join(' · ')].filter(nonEmpty).join('\n');
    var hk = o.hoverKey || (o.key != null && o.key !== '' ? 'rcpt:' + o.key : '');
    var hover = tip && hk ? ' data-hover-key="' + esc(hk) + '" data-hover-tip="' + esc(tip) + '"' : '';
    var foot = o.footHtml != null ? str(o.footHtml) : (o.actions || []).slice(0, 2).map(function (a) { return actButton(a, 'pmx-act'); }).join('');
    return '<article class="' + cls('pmx-run pmx-receipt', o.cls) + '" data-density="receipt"' + k(o.key) + at('data-pmx-kind', o.kind) + at('data-run-id', o.runId) + ' data-flip' + raw(o.attrs) + '>' +
      '<header class="' + cls('pmx-run-head', o.headCls) + '"><span class="' + cls('pmx-run-kind', o.badgeCls) + '">' + (o.markHtml != null ? o.markHtml : pmxKindMark(o.kind, 16)) + '<span class="pmx-run-kindword">' + str(o.kindWord) + '</span></span>' +
        (o.cluster != null ? cluster(o.cluster, 5, true) : '') +
        '<span class="' + cls('pmx-receipt-title', o.titleCls) + '" data-pmx-harness>' + str(o.title) + '</span>' +
        '<span class="' + cls('pmx-receipt-say', o.statusCls) + '"' + hover + '>' + g(o.glyph || '', 14) + (o.recorded ? pmxGlyph('play-ring', 13, 'pmx-receipt-rec') : '') + '<span class="pmx-receipt-headline">' + str(o.headline) + '</span></span>' +
        '<span class="' + cls('pmx-receipt-meta', o.metaCls) + '">' + meta + '</span></header>' +
      '<footer class="' + cls('pmx-run-foot', o.footCls) + '">' + foot + '</footer></article>';
  }
  /* pmxReceipt(...) - C13, the collaboration preset of pmxLedgerLine. Its foot is fixed by amendment G-19: Expand
     chevron, Open Panel, More, each carrying data-run; the collab-* defaults apply only to a collaboration kind or
     with collabHooks: true (IMPACT A2-16), otherwise only the actions a caller names are drawn. */
  function pmxReceipt(o) {
    o = o || {};
    var collab = collabOn(o);
    var run = o.runId != null ? ' data-run="' + esc(o.runId) + '"' : '';
    var open = o.open || {}, ex = o.expand || {}, mo = o.more || {};
    var ea = ex.action || (collab ? 'collab-toggle-expand' : ''), oa = open.action || (collab ? 'collab-open-panel' : ''), ma = mo.action || (collab ? 'collab-toggle-more' : '');
    var foot = (ea ? '<button type="button" class="icon-button pmx-act" data-action="' + esc(ea) + '"' + run + raw(ex.attrs) + ' aria-label="Expand">' + pmxGlyph('chevron-down', 15) + '</button>' : '') +
      (oa ? '<button type="button" class="text-button pmx-act pmx-open" data-action="' + esc(oa) + '"' + run + raw(open.attrs) + '>' + str(open.label || '<span>Open<span class="pmx-long"> Panel</span></span>') + '</button>' : '') +
      (ma ? '<button type="button" class="icon-button pmx-act" data-action="' + esc(ma) + '"' + run + raw(mo.attrs) + ' aria-label="More">' + pmxGlyph('more', 16) + '</button>' : '');
    var p = {}; for (var key in o) if (Object.prototype.hasOwnProperty.call(o, key)) p[key] = o[key];
    p.footHtml = foot;
    return pmxLedgerLine(p);
  }
  /* closing review (dock lines): the 9.1 deck reads "Crew · <title> · <reason>". A sentence that starts a clause of its
     own (a capital, a digit, a quote) gets " · " after the bold kind word; one that continues the kind word ("1 scheduled
     message" + "needs you") or brings its own separator ("· Next: ...") joins with a space, as before. */
  function dockJoin(kindWord, sentence) {
    if (!nonEmpty(kindWord)) return '';
    var first = plainText(sentence).replace(/^\s+/, '').charAt(0);
    return !first || first === '·' || /[a-z]/.test(first) ? ' ' : '<span class="pmx-dock-sep"> · </span>';
  }
  function pmxDockLine(o) {
    o = o || {};
    var tone = { live: 1, needs: 1, yourmove: 1, comingup: 1 }[o.tone] ? o.tone : 'live';
    var a = o.action || {};
    return '<div class="' + cls('pmx-dock-line', o.cls) + '"' + k(o.key) + ' data-tone="' + tone + '"' + at('data-run', o.runId) + raw(o.attrs) + '>' + str(o.markHtml) +
      '<p class="pmx-dock-say">' + (nonEmpty(o.kindWord) ? '<b>' + str(o.kindWord) + '</b>' : '') + dockJoin(o.kindWord, o.sentence) + str(o.sentence) + '</p>' + (o.time != null && o.time !== '' ? '<span class="pmx-clock">' + o.time + '</span>' : '') +
      (a.action ? '<button type="button" class="text-button pmx-dock-act" data-action="' + esc(a.action) + '"' + raw(a.attrs) + '>' + str(a.label || 'Show') + '</button>' : '') + '</div>';
  }
  function pmxDock(linesHtml, overflowText) {
    return '<div class="pmx-dock" data-k="pmx-dock">' + str(linesHtml) + (overflowText ? '<p class="pmx-dock-more">' + overflowText + '</p>' : '') + '</div>';
  }
  /* closing: num (REVIEW-B FR 2) prints the finding's number ahead of its claim ("created from findings 1 and 2");
     wrap (REVIEW-A FR 1) lets the meta line wrap as whole parts, each part after the first carrying its own "·" in an
     18 px lead-in that is clipped away where a part starts a line, so a wrapped line never starts with "·" */
  function pmxFinding(o) {
    o = o || {};
    var b = o.box || {};
    var sevKey = o.severityKey || o.sev || (SEV_WORD[str(o.severity).toLowerCase()] ? str(o.severity).toLowerCase() : '');
    var parts = [o.severity, o.disposition, o.agree].filter(function (p) { return p != null && p !== ''; });
    var meta = o.wrap ? parts.map(function (p) { return '<span class="pmx-fpart">' + p + '</span>'; }).join('') : parts.join('<span class="pmx-sep"> · </span>');
    return '<div class="' + cls('pmx-finding', o.cls) + '"' + k(o.key) + at('data-severity', sevKey) + (o.wrap ? ' data-wrap="1"' : '') + raw(o.attrs) + '>' +
      '<label class="pmx-finding-tick"><input type="checkbox"' + raw(b.attrs) + (b.checked ? ' checked' : '') + (b.disabled ? ' disabled' : '') + '><span class="pmx-box" aria-hidden="true"></span><span class="pmx-sr">Include finding ' + str(o.n) + '</span></label>' +
      '<div class="pmx-finding-copy"><p class="pmx-finding-claim">' + (o.num != null && o.num !== '' ? '<span class="pmx-finding-n">' + o.num + '</span>' : '') + str(o.claim) + '</p>' +
        '<p class="pmx-finding-meta"' + (o.wrap ? ' data-wrap="1"' : '') + '>' + meta + '</p>' +
        (o.why ? '<p class="pmx-finding-why">' + o.why + '</p>' : '') + (o.todo ? '<p class="pmx-finding-todo">' + o.todo + '</p>' : '') +
        (b.reason ? '<p class="pmx-reason">' + b.reason + '</p>' : '') + '</div></div>';
  }
  var SEV_WORD = { critical: 'Critical', major: 'Major', minor: 'Minor', suggestion: 'Suggestion', nit: 'nit', concern: 'concern' };
  var SEV_GLYPH = { critical: 'sev-critical', major: 'sev-major', concern: 'sev-major', minor: 'sev-minor', nit: 'sev-minor', suggestion: 'sev-suggestion' };
  /* neon step 3E: the severity marks keep their filled shapes and are lit (status role) in their tone: critical
     blocked (danger), major attention (warning), minor the host's muted ink, a suggestion idle (subtle). The fill
     stays on currentColor (module-shell.css .pmx-sev colours), the halo takes the tone ink; static, 11 px. */
  var SEV_LIT = { critical: 'nx-r-status nx-t-blocked', major: 'nx-r-status nx-t-attention', concern: 'nx-r-status nx-t-attention', minor: 'nx-r-status', nit: 'nx-r-status', suggestion: 'nx-r-status nx-t-idle' };
  function pmxSeverity(level, word) {
    level = str(level).toLowerCase();
    var lv = SEV_WORD[level] ? level : 'minor';
    return '<span class="pmx-sev" data-sev="' + lv + '">' + pmxGlyph(SEV_GLYPH[lv], 11, SEV_LIT[lv]) + (word != null ? word : SEV_WORD[lv]) + '</span>';
  }
  function agreeDot(v) {
    var c = v.vote === 'agree' ? '<circle class="pmx-ag-fill" cx="6" cy="6" r="3.6"/>' : v.vote === 'disagree' ? '<circle class="pmx-ag-ring" cx="6" cy="6" r="3.6"/><path class="pmx-ag-ring" d="m3.4 8.6 5.2-5.2"/>' : '<circle class="pmx-ag-ring" cx="6" cy="6" r="3.6"/>';
    return '<svg class="pmx-ag" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" style="--pmx-seat:' + seatVar(v.lead ? 'lead' : 'x', v.seat) + '">' + c + '</svg>';
  }
  function pmxAgree(o) {
    o = o || {};
    return '<span class="' + cls('pmx-agree', o.cls) + '"' + raw(o.attrs) + '><span class="pmx-agree-dots">' + (o.votes || []).map(agreeDot).join('') + '</span><span>' + str(o.words) + '</span></span>';
  }
  /* closing (STORM-A): the aisle is drawn only while someone is deciding and the wing only when someone abstained
     (with omitEmpty: true, or when deciding / abstained is given as ''), wingLabel names the wing ("Doesn’t vote"),
     op.names prints the backers' names once under a column (names under the 22 px marks were capped at 64 px),
     op.ruledText replaces the ruled-out sentence after its fixed part, grow:true lets the board take its content's
     height with two-line titles, and a ruled option keeps its words at full contrast (only its marks dim) */
  function pmxVoteBoard(o) {
    o = o || {};
    var opts = o.options || [];
    var omit = o.omitEmpty === true;
    var hasAisle = !(omit || o.deciding === '') || nonEmpty(o.deciding), hasWing = !(omit || o.abstained === '') || nonEmpty(o.abstained);
    if (omit) { hasAisle = nonEmpty(o.deciding); hasWing = nonEmpty(o.abstained); }
    var optHtml = opts.map(function (op) {
      var backers = (op.backers || []).map(function (b) {
        var conf = Math.max(1, Math.min(3, Math.round(num(b.conf, 2))));
        return '<span class="pmx-voter"' + k(b.key) + '>' + str(b.markHtml || b.mark) + '<i class="pmx-conf" aria-hidden="true"><i data-off="0"></i><i data-off="' + (conf < 2 ? 1 : 0) + '"></i><i data-off="' + (conf < 3 ? 1 : 0) + '"></i></i>' + (b.name ? '<span>' + b.name + '</span>' : '') + '</span>';
      }).join('');
      return '<div class="pmx-vote-opt"' + k(op.key) + (op.ruledOut ? ' data-state="ruled"' : '') + '><p class="pmx-vote-title">' + str(op.title) + '</p><p class="pmx-vote-count">' + str(op.count) + '</p><div class="pmx-vote-floor">' + backers + '</div>' +
        (nonEmpty(op.names) ? '<p class="pmx-vote-names">' + op.names + '</p>' : '') + '</div>';
    });
    var aisle = hasAisle ? '<div class="pmx-vote-aisle"><p>deciding</p>' + str(o.deciding) + '</div>' : '';
    var wing = hasWing ? '<div class="pmx-vote-wing">' + (o.abstained ? '<p>' + str(o.wingLabel || 'Abstained') + '</p>' + o.abstained : '') + '</div>' : '';
    /* J-1/J-2 reference update: columns 1fr 72px 1fr 58px (the aisle 72, the abstain wing 58); an omitted aisle or
       wing takes its column with it */
    var A = hasAisle ? ' 72px' : '', Wg = hasWing ? ' 58px' : '';
    var cols = opts.length === 2 ? 'minmax(0,1fr)' + A + ' minmax(0,1fr)' + Wg : 'repeat(' + Math.max(1, opts.length) + ',minmax(0,1fr))' + A + Wg;
    var body = opts.length === 2 ? optHtml[0] + aisle + optHtml[1] + wing : optHtml.join('') + aisle + wing;
    var ruled = opts.filter(function (op) { return op.ruledOut; }).map(function (op) {
      return '<p class="' + cls('pmx-ruled', o.ruledCls) + '">' + pmxGlyph('not', 14) + '<span><s>' + str(op.title) + '</s> ' +
        (nonEmpty(op.ruledText) ? op.ruledText : 'is ruled out: it breaks your rule “' + str(op.rule) + '”. Votes can’t override a rule.') + '</span></p>';
    }).join('');
    return '<div class="' + cls('pmx-votes', o.cls) + '"' + k(o.key) + ' data-aisle="' + (hasAisle ? 1 : 0) + '" data-wing="' + (hasWing ? 1 : 0) + '"' + (o.grow ? ' data-grow="1"' : '') + ' style="--pmx-vote-cols:' + cols + '"' + raw(o.attrs) + '>' + body + '</div>' + ruled;
  }
  function pmxFindings(itemsHtml, o) { o = o || {}; return '<div class="' + cls('pmx-findings', o.cls) + '"' + k(o.key) + '>' + str(itemsHtml) + '</div>'; }
  /* pmxSealed(n) - face-down note squares for a blind round (lane line 2). */
  function pmxSealed(n) { var out = ''; for (var i = 0; i < Math.max(0, Math.min(6, num(n, 0))); i++) out += '<i></i>'; return '<span class="pmx-sealed" aria-hidden="true">' + out + '</span>'; }
  function pmxQuote(o) {
    o = o || {};
    return '<figure class="' + cls('pmx-quote', o.cls) + '"' + k(o.key) + raw(o.attrs) + '>' + pmxGlyph('quote', 15) + '<blockquote>' + str(o.text) + '</blockquote>' +
      ((o.who || o.note) ? '<figcaption>' + [o.who, o.note].filter(function (p) { return p; }).join(' · ') + '</figcaption>' : '') + '</figure>';
  }
  /* closing (BSD): line (html) draws the one-line form with its own glyph (default eye) and data-state (default
     "aside"): the aside weight, "From earlier", catch-up, failure and safety lines; weight writes data-weight
     (note | aside, G-30) on either form */
  function pmxNote(o) {
    o = o || {};
    var state = o.dismissed ? 'dismissed' : (o.stale ? 'stale' : 'emitted');
    var wt = o.weight === 'aside' || o.weight === 'note' ? ' data-weight="' + o.weight + '"' : '';
    if (o.line != null) {
      return '<aside class="' + cls('pmx-note', o.cls) + '"' + k(o.key) + at('data-severity', o.severity) + ' data-state="' + esc(o.state || 'aside') + '" data-form="line"' + wt + ' data-flip' + raw(o.attrs) + '><span class="pmx-note-eye">' + g(o.glyph || 'eye', 15) + '</span>' +
        '<div class="pmx-note-line">' + str(o.line) + '</div>' + (o.actions ? '<div class="pmx-note-acts">' + o.actions + '</div>' : '') + '</aside>';
    }
    if (state === 'dismissed') {
      return '<aside class="' + cls('pmx-note', o.cls) + '"' + k(o.key) + at('data-severity', o.severity) + ' data-state="dismissed"' + wt + ' data-flip' + raw(o.attrs) + '><span class="pmx-note-eye">' + pmxGlyph('eye-closed', 15) + '</span>' +
        '<p class="pmx-note-line">Dismissed · ' + str(o.title) + '</p>' + (o.actions ? '<div class="pmx-note-acts">' + o.actions + '</div>' : '') + '</aside>';
    }
    return '<aside class="' + cls('pmx-note', o.cls) + '"' + k(o.key) + at('data-severity', o.severity) + ' data-state="' + state + '"' + wt + ' data-flip' + raw(o.attrs) + '><span class="pmx-note-eye">' + pmxGlyph('eye', 15) + '</span>' +
      '<p class="pmx-note-kicker">Advisor note' + (o.severity ? ' · ' + (o.severityHtml || esc(o.severity)) : '') + '</p><p class="pmx-note-title">' + str(o.title) + '</p>' +
      (o.body ? '<p class="pmx-note-body">' + o.body + '</p>' : '') + (o.checked ? '<p class="pmx-fine">' + o.checked + '</p>' : '') +
      (o.actions ? '<div class="pmx-note-acts">' + o.actions + '</div>' : '') + '</aside>';
  }
  /* hover (closing, PREFS): the app hover card's text (data-hover-key / data-hover-tip, which the hover layer reads;
     the old data-hover was read by nothing); hoverKey names it, else tick:{key} */
  function pmxTick(o) {
    o = o || {};
    var hk = o.hover ? (o.hoverKey || 'tick:' + (nonEmpty(o.key) ? o.key : pmxHash(plainText(o.text)))) : '';
    return '<span class="' + cls('pmx-tick', o.cls) + '"' + k(o.key) + (hk ? ' data-hover-key="' + esc(hk) + '" data-hover-tip="' + esc(plainText(o.hover)) + '"' : '') + raw(o.attrs) + '>' + g(o.glyph || 'check', 13) + '<span>' + str(o.text) + '</span></span>';
  }
  /* pmxWash({key,html}) - a revised line's highlighter wash (M2 ink model). Key it
     by the revision so the wash plays once, on the new node only. */
  function pmxWash(o) { o = o || {}; return '<span class="pmx-wash"' + k(o.key) + '>' + str(o.html) + '</span>'; }
  function pmxDivider(o) {
    o = o || {};
    return '<div class="' + cls('pmx-divider', o.cls) + '" role="separator"' + k(o.key) + raw(o.attrs) + '><span>' + str(o.text) + '</span></div>';
  }
  /* closing (REVERT FR 3, 6, 10): state + text draw the row in another state in place ("Reverted · 3 files put back",
     glyph o.glyph, default check) with data-state; sides:'changed' prints only the figures that changed ("+4", not
     "+4 −0"); the reason follows the same " · " the Revert action does */
  function pmxFilesRow(o) {
    o = o || {};
    var r = o.revert, add = num(o.add, 0), del = num(o.del, 0), one = o.sides === 'changed' && (add || del);
    var figs = (!one || add ? ' <i class="pmx-add">+' + add + '</i>' : '') + (!one || del ? ' <i class="pmx-del">−' + del + '</i>' : '');
    var lead = o.state && o.text != null ? g(o.glyph || 'check', 13) + '<span class="pmx-files-said">' + str(o.text) + '</span>'
      : pmxGlyph('file-edit', 13) + '<span>Changed ' + num(o.count, 0) + (num(o.count, 0) === 1 ? ' file' : ' files') + '</span>' + figs;
    return '<p class="' + cls('pmx-files', o.cls) + '"' + k(o.key) + at('data-state', o.state) + raw(o.attrs) + '>' + lead +
      (r ? '<span class="pmx-sep"> · </span><button type="button" class="text-button" data-action="' + esc(r.action) + '"' + raw(r.attrs) + (r.disabled ? ' disabled' : '') + '>' + str(r.label || 'Revert') + '</button>' : '') +
      (o.reason ? '<span class="pmx-sep"> · </span><span class="pmx-reason pmx-files-reason">' + o.reason + '</span>' : '') + '</p>';
  }
  function pmxCodeRow(o) {
    o = o || {};
    var kind = o.kind === 'table' ? 'table' : 'code';
    var op = o.open;
    return '<p class="' + cls('pmx-coderow', o.cls) + '"' + raw(o.attrs) + '>' + pmxGlyph(kind, 14) + '<span><b>' + kind + '</b>' + (o.lang ? ' · ' + o.lang : '') + (o.size ? ' · ' + o.size : '') + '</span>' +
      (op && op.action ? '<button type="button" class="text-button" data-action="' + esc(op.action) + '"' + raw(op.attrs) + '>' + str(op.label || 'Open') + '</button>' : '') + '</p>';
  }
  function pmxGuide(o) {
    o = o || {};
    var placement = { dock: 1, sheet: 1, doc: 1 }[o.placement] ? o.placement : 'dock';
    var c = o.close;
    /* data-acts: how many actions it carries; below 420 px of guide width (520 with two actions) the dock and doc
       placements stack the actions under the step (module-shell.css, closing: PREFS, MEMTEACH, REVERT FR 5, CREW-B FR 2,
       REVIEW-B FR 4) */
    return '<section class="' + cls('pmx-guide', o.cls) + '"' + k(o.key) + ' data-placement="' + placement + '" data-acts="' + Math.min(2, (o.actions || []).length) + '"' + raw(o.attrs) + '>' +
      '<p class="pmx-guide-cap">' + pmxGlyph('play-ring', 13) + (o.caption || 'Recorded example · no AI cost') + '</p>' +
      '<p class="pmx-guide-step">' + str(o.step) + '</p>' + str(o.extra) +
      '<div class="pmx-guide-acts">' + (o.actions || []).slice(0, 2).map(function (a) { return '<button type="button" class="text-button" data-action="' + esc(a.action) + '"' + raw(a.attrs) + '>' + str(a.label) + '</button>'; }).join('') + '</div>' +
      (c ? '<button type="button" class="icon-button pmx-guide-close" data-action="' + esc(c.action) + '"' + raw(c.attrs) + ' aria-label="' + esc(c.label || 'Close') + '">' + pmxGlyph('close', 13) + '</button>' : '') + '</section>';
  }

  /* pmxDisclosure({key,cls,attrs,summary,body,open,affects}) (closing, PREFS): an unboxed summary row and its body, the
     pmx form of a disclosure (the legacy builder drew a bordered box, DON'T 5). The chevron turns; the body is text. */
  function pmxDisclosure(o) {
    o = o || {};
    return '<details class="' + cls('pmx-disc', o.cls) + '"' + k(o.key) + at('data-pmx-affects', o.affects) + (o.open ? ' open' : '') + raw(o.attrs) + '>' +
      '<summary class="pmx-disc-sum"><span>' + str(o.summary) + '</span>' + pmxGlyph('chevron-down', 14, 'pmx-disc-chev') + '</summary><div class="pmx-disc-body">' + str(o.body) + '</div></details>';
  }

  /* ---------------------------------------------------------------- D: run view */
  /* closing: stickyHead (ROOM-B FR 1) pins the head while the document scrolls, on the opaque --pmx-view-bg;
     guideHtml (CREW-B FR 1) is the C27 doc guide, the view's first row */
  function pmxView(o) {
    o = o || {};
    return '<article class="' + cls('pmx-view', o.cls) + '"' + k(o.key) + at('data-pmx-kind', o.kind) + (o.stickyHead ? ' data-sticky="1"' : '') + raw(o.attrs) + '>' + str(o.guideHtml) +
      '<header class="pmx-view-head drawer-head"><strong class="pmx-view-title">' + str(o.title) + '</strong>' +
        '<p class="pmx-view-kind">' + (o.markHtml != null ? o.markHtml : pmxKindMark(o.kind, 20)) + '<span>' + str(o.kindWord) + '</span></p>' +
        (o.statusHtml ? '<p class="pmx-view-status">' + o.statusHtml + '</p>' : '') +
        '<div class="' + (collabOn(o) ? 'pmx-view-acts collab-panel-foot' : 'pmx-view-acts') + '">' + str(o.actionsHtml) + '</div></header>' +
      (o.plateHtml ? '<figure class="pmx-view-plate">' + o.plateHtml + '</figure>' : '') + str(o.tabsHtml) +
      '<div class="pmx-view-grid"><div class="pmx-view-main">' + str(o.mainHtml) + '</div>' + (o.asideHtml ? '<aside class="pmx-view-aside">' + o.asideHtml + '</aside>' : '') + '</div></article>';
  }
  function pmxViewSection(o) {
    o = o || {};
    return '<section class="' + cls('pmx-vsec', o.cls) + '"' + k(o.key) + raw(o.attrs) + '><header><h2 class="pmx-vsec-title">' + str(o.title) + '</h2>' + (o.meta ? '<span class="pmx-fine">' + o.meta + '</span>' : '') + '</header>' + str(o.body) + '</section>';
  }
  function pmxTimeline(o) {
    o = o || {};
    return '<div class="' + cls('pmx-timeline', o.cls) + '"' + k(o.key) + raw(o.attrs) + '>' + (o.filterHtml ? '<div class="pmx-timeline-bar">' + o.filterHtml + '</div>' : '') + (o.entries || []).map(function (e) {
      var kind = e.kind === 'system' || e.kind === 'tool' ? e.kind : 'message';
      var mid = e.mid != null ? e.mid : str(e.key).replace(/^collab-msg-/, '');
      var body = e.streaming ? '<div class="pmx-entry-body" data-pm-keep data-k="stream:' + esc(mid) + '">' + str(e.bodyHtml) + '</div>'
        : '<div class="pmx-entry-body" data-k="body:' + esc(mid) + '">' + str(e.bodyHtml) + '</div>';
      if (kind === 'system') return '<article class="' + cls('pmx-entry', e.cls) + '"' + k(e.key) + ' data-kind="system">' + body + '</article>';
      return '<article class="' + cls('pmx-entry', e.cls) + '"' + k(e.key) + ' data-kind="' + kind + '"' + raw(e.attrs) + '>' + str(e.markHtml) +
        '<header><b>' + str(e.who) + '</b>' + (e.when ? '<span class="pmx-fine">' + e.when + '</span>' : '') + '</header>' + body + '</article>';
    }).join('') + '</div>';
  }
  /* G-17 (D4 amendment, review cycle 2): the stand-in line under a helper's name. `standIn` is pmxStandIn's result (or
     its input, {requested, effective, reason, noSubstitute, sameProvider}); nothing is emitted when requested equals
     effective. The line is the team sentence with the fine print "requested X · effective Y" on its own line under it
     (display:block guards outrank collaboration.css's inline-flex .collab-route-eff). The collab-route-eff hooks
     (plus the whole-literal -sub / -failed) are written for a Collaboration kind or collabHooks:true (A2-16). */
  function standInLine(si, collab) {
    if (si && si.team == null && si.requested != null) si = pmxStandIn(si);
    if (!si || !si.team) return '';
    var failed = si.tone === 'failed';
    return '<small class="pmx-route-eff' + (collab ? ' collab-route-eff ' + (failed ? 'collab-route-eff-failed' : 'collab-route-eff-sub') : '') + '" data-tone="' + (failed ? 'failed' : 'info') + '">' +
      si.team + (si.fine ? '<span class="pmx-fine">' + si.fine + '</span>' : '') + '</small>';
  }
  /* pmxTeamRow({key,cls,attrs,kind,collabHooks,size,markHtml,name,route,standIn,outcome,cost,action}); size 's' = the
     36 px Activity Detail row (7.13: mark 18, name, one state word, the stand-in line under it) */
  function pmxTeamRow(o) {
    o = o || {};
    var eff = o.standIn ? standInLine(o.standIn, collabOn(o)) : '';
    return '<button type="button" class="' + cls('pmx-team-row', o.cls) + '"' + k(o.key) + at('data-action', o.action || (collabOn(o) ? 'collab-open-participant' : '')) + (o.size === 's' ? ' data-size="s"' : '') + raw(o.attrs) + '>' + str(o.markHtml) +
      '<span class="pmx-team-who"><b>' + str(o.name) + '</b>' + (eff || (o.route ? '<small>' + o.route + '</small>' : '')) + '</span><span class="pmx-team-out">' + str(o.outcome) + '</span><span class="pmx-meta">' + str(o.cost) + '</span></button>';
  }
  function pmxParticipant(o) {
    o = o || {};
    var collab = collabOn(o);
    return '<section class="' + cls(collab ? 'pmx-participant collab-participant-view' : 'pmx-participant', o.cls) + '"' + k(o.key) + raw(o.attrs) + '><h3>' + str(o.role) + '</h3>' + (o.standIn ? standInLine(o.standIn, collab) : '') + str(o.headHtml) +
      (o.messagesHtml ? o.messagesHtml : '<p class="' + (collab ? 'collab-empty' : 'pmx-empty') + '">' + str(o.emptyText || 'Nothing from this helper yet.') + '</p>') +
      '<button type="button" class="text-button"' + at('data-action', o.backAction || (collab ? 'collab-close-participant' : '')) + '>' + PMX_COPY.participant.back + '</button></section>';
  }

  /* ---------------------------------------------------------------- C26 markdown
     Builds on Chat WOW's PM56_RICH.tokenize (paragraphs, h4/h5, lists, fenced
     code, inline code, bold), resolved lazily because turn-stream.js loads
     after this file, so run messages and ordinary replies read the same. It
     adds only what PM56_RICH lacks: tables, links, blockquotes, italics, hr,
     # headings and the compact stand-ins. If PM56_RICH is absent, localTokenize
     (the same algorithm, same ops) keeps the output identical. No raw HTML
     passes through: every word is escaped before any markup is added. */
  function localInline(text, base, ops) {
    var re = /(\*\*[^*]+\*\*|`[^`]+`)/g, last = 0, m;
    function plain(s, off) {
      var parts = s.split(/(\s+)/), o2 = off;
      for (var i = 0; i < parts.length; i++) { var p = parts[i]; if (!p) continue; o2 += p.length; if (/^\s+$/.test(p)) ops.push({ t: 's', end: o2 }); else ops.push({ t: 'w', text: p, mark: null, end: o2 }); }
    }
    while ((m = re.exec(text))) {
      if (m.index > last) plain(text.slice(last, m.index), base + last);
      var tok = m[0];
      if (tok.charAt(0) === '`') ops.push({ t: 'w', text: tok.slice(1, -1), mark: 'code', end: base + m.index + tok.length });
      else {
        var inner = tok.slice(2, -2), ws = inner.split(/(\s+)/), o3 = base + m.index + 2;
        for (var j = 0; j < ws.length; j++) { var w = ws[j]; if (!w) continue; o3 += w.length; if (/^\s+$/.test(w)) ops.push({ t: 's', end: o3 }); else ops.push({ t: 'w', text: w, mark: 'b', end: o3 }); }
        ops[ops.length - 1].end = base + m.index + tok.length;
      }
      last = m.index + tok.length;
    }
    if (last < text.length) plain(text.slice(last), base + last);
  }
  function localTokenize(src) {
    var text = String(src || '').replace(/\r\n/g, '\n');
    var ops = [], lines = text.split('\n'), off = 0, cur = null, blank = true, inCode = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i], start = off; off += line.length + 1;
      if (/^```/.test(line)) { if (!inCode) { ops.push({ t: 'block', tag: 'pre', end: start }); cur = 'pre'; inCode = true; } else { inCode = false; cur = null; blank = true; } continue; }
      if (inCode) { ops.push({ t: 'line', text: line, end: start + line.length }); continue; }
      if (!line.trim()) { blank = true; continue; }
      var mm;
      if ((mm = /^(#{2,3})\s+(.*)$/.exec(line))) { ops.push({ t: 'block', tag: mm[1].length === 2 ? 'h4' : 'h5', end: start }); localInline(mm[2], start + mm[1].length + 1, ops); cur = 'h'; blank = true; continue; }
      if ((mm = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(line))) { var list = /\d/.test(mm[2]) ? 'ol' : 'ul'; ops.push({ t: 'block', tag: 'li', list: list, end: start }); localInline(mm[3], start + mm[1].length + mm[2].length + 1, ops); cur = 'li:' + list; blank = false; continue; }
      if (blank || cur !== 'p') { ops.push({ t: 'block', tag: 'p', end: start }); cur = 'p'; } else ops.push({ t: 'br', end: start });
      localInline(line, start, ops); blank = false;
    }
    return ops;
  }
  function tokenize(text) {
    var R = window.PM56_RICH;
    if (R && typeof R.tokenize === 'function') { try { return R.tokenize(text); } catch (e) { } }
    return localTokenize(text);
  }
  var LANG = { ts: 'TypeScript', tsx: 'TypeScript', typescript: 'TypeScript', js: 'JavaScript', jsx: 'JavaScript', javascript: 'JavaScript', mjs: 'JavaScript', py: 'Python', python: 'Python',
    sh: 'Shell', bash: 'Shell', zsh: 'Shell', shell: 'Shell', json: 'JSON', css: 'CSS', html: 'HTML', sql: 'SQL', rs: 'Rust', rust: 'Rust', go: 'Go', md: 'Markdown', markdown: 'Markdown',
    yaml: 'YAML', yml: 'YAML', csv: 'CSV', diff: 'Diff', java: 'Java', kt: 'Kotlin', swift: 'Swift', rb: 'Ruby', c: 'C', cpp: 'C++', cs: 'C#', toml: 'TOML', xml: 'XML', slint: 'Slint' };
  function langName(l) { l = str(l).toLowerCase(); return LANG[l] || (l ? l.charAt(0).toUpperCase() + l.slice(1) : ''); }
  /* links and italics on already-escaped html, never inside <code> */
  function inlineExtras(html) {
    return html.split(/(<code>[\s\S]*?<\/code>)/).map(function (seg, i) {
      if (i % 2) return seg;
      return seg
        .replace(/\[([^\]<]+?)\]\(((?:https?:\/\/|mailto:)[^\s)<"]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/(^|[\s(>“])\*(?![\s*])([^*<]+?)\*(?=$|[\s.,;:!?)<”])/g, '$1<em>$2</em>')
        .replace(/(^|[\s(>“])_(?![\s_])([^_<]+?)_(?=$|[\s.,;:!?)<”])/g, '$1<em>$2</em>');
    }).join('');
  }
  function wordHtml(op) {
    var t = esc(op.text);
    return op.mark === 'b' ? '<strong>' + t + '</strong>' : op.mark === 'code' ? '<code>' + t + '</code>' : t;
  }
  /* ops -> blocks: [{type:'p'|'h3'|'h4'|'h5'|'list'|'code'|..., html|items|lines|lang}] */
  function opsToBlocks(ops, src, blocks) {
    var cur = null;
    function flushText() { if (cur && cur.parts) cur.html = inlineExtras(cur.parts.join('')); }
    for (var i = 0; i < ops.length; i++) {
      var op = ops[i];
      if (op.t === 'block') {
        flushText();
        if (op.tag === 'li') {
          var last = blocks[blocks.length - 1];
          if (!(last && last.type === 'list' && last.list === op.list && cur && cur.item)) { last = { type: 'list', list: op.list, items: [] }; blocks.push(last); }
          cur = { item: true, parts: [] }; last.items.push(cur);
        } else if (op.tag === 'pre') {
          var fence = src.slice(op.end, src.indexOf('\n', op.end) < 0 ? src.length : src.indexOf('\n', op.end));
          var lm = /^```\s*([\w+#.-]*)/.exec(fence);
          cur = { type: 'code', lang: lm ? lm[1] : '', lines: [] }; blocks.push(cur);
        } else {
          cur = { type: op.tag === 'p' ? 'p' : op.tag, parts: [] }; blocks.push(cur);
        }
      } else if (op.t === 'line') { if (cur && cur.lines) cur.lines.push(op.text); }
      else if (cur && cur.parts) {
        if (op.t === 'w') cur.parts.push(wordHtml(op));
        else if (op.t === 's') cur.parts.push(' ');
        else if (op.t === 'br') cur.parts.push('<br>');
      }
    }
    flushText();
    blocks.forEach(function (b) { if (b.type === 'list') b.items = b.items.map(function (it) { return typeof it === 'string' ? it : (it.html != null ? it.html : inlineExtras((it.parts || []).join(''))); }); });
    return blocks;
  }
  function inlineOnly(text) {
    var bl = opsToBlocks(tokenize(text), str(text), []);
    return bl.map(function (b) { return b.html || (b.items ? b.items.join(' ') : ''); }).join(' ');
  }
  function splitRow(line) {
    var s = line.trim(); if (s.charAt(0) === '|') s = s.slice(1); if (s.charAt(s.length - 1) === '|') s = s.slice(0, -1);
    return s.split('|').map(function (c) { return c.trim(); });
  }
  function mdBlocks(text) {
    var src = str(text).replace(/\r\n?/g, '\n');
    var lines = src.split('\n'), blocks = [], run = [], inCode = false;
    function flush() { if (run.length) { var t = run.join('\n'); opsToBlocks(tokenize(t), t, blocks); run = []; } }
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (/^```/.test(line)) { inCode = !inCode; run.push(line); continue; }
      if (inCode) { run.push(line); continue; }
      var m;
      if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(lines[i + 1])) {
        flush();
        var head = splitRow(line), rows = [];
        i += 2;
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { rows.push(splitRow(lines[i])); i++; }
        i--;
        blocks.push({ type: 'table', head: head, rows: rows });
        continue;
      }
      if (/^\s*>\s?/.test(line)) {
        flush();
        var q = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) { q.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
        i--;
        blocks.push({ type: 'quote', html: inlineOnly(q.join(' ')) });
        continue;
      }
      if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { flush(); blocks.push({ type: 'hr' }); continue; }
      if ((m = /^#\s+(.*)$/.exec(line))) { flush(); blocks.push({ type: 'h3', html: inlineOnly(m[1]) }); continue; }
      if ((m = /^#{4,6}\s+(.*)$/.exec(line))) { flush(); blocks.push({ type: 'h5', html: inlineOnly(m[1]) }); continue; }
      run.push(line);
    }
    flush();
    return blocks;
  }
  /* pmxMd(text,{mode:'compact'|'full', open:{action,attrs}, max}) */
  function pmxMd(text, o) {
    o = o || {};
    var blocks = mdBlocks(text);
    if (o.mode === 'full') {
      return '<div class="' + cls('pmx-md', o.cls) + '" data-mode="full">' + blocks.map(function (b) {
        switch (b.type) {
          case 'h3': return '<h3>' + b.html + '</h3>';
          case 'h4': return '<h4>' + b.html + '</h4>';
          case 'h5': return '<h5>' + b.html + '</h5>';
          case 'list': return '<' + b.list + '>' + b.items.map(function (it) { return '<li>' + it + '</li>'; }).join('') + '</' + b.list + '>';
          case 'code': return '<pre class="pmx-code"' + (b.lang ? ' data-lang="' + esc(b.lang) + '"' : '') + '><code>' + b.lines.map(esc).join('\n') + '</code></pre>';
          case 'table': return '<div class="pmx-table-wrap"><table><thead><tr>' + b.head.map(function (c) { return '<th>' + inlineOnly(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
            b.rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + inlineOnly(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
          case 'quote': return '<blockquote>' + b.html + '</blockquote>';
          case 'hr': return '<hr>';
          default: return '<p>' + b.html + '</p>';
        }
      }).join('') + '</div>';
    }
    /* compact: at most `max` (2) blocks inside a budget of `lines` (4) text lines, so a card never grows with the
       message (principle 5, review cycle 2: the output block it replaces is 88 px). A paragraph or quote costs 2
       lines (CSS clamps it to 2 with an ellipsis; 1 when only one is left, data-clamp="1"); a heading becomes a
       bold lead-in (alone it costs 1); a code or table stand-in costs 2; a list costs one line per item plus one
       for "and N more" (first block: 3 items + "and N more"; after a paragraph: 1 item + "and N more"). */
    var out = [], max = num(o.max, 2), lines = num(o.lines, 4), lead = '';
    for (var i = 0; i < blocks.length && out.length < max && lines > 0; i++) {
      var b = blocks[i];
      if (b.type === 'hr') continue;
      if (b.type === 'h3' || b.type === 'h4' || b.type === 'h5') { lead = '<b>' + b.html + '</b> '; continue; }
      if (b.type === 'p' || b.type === 'quote') {
        var cl = Math.min(2, lines);
        out.push('<p' + (b.type === 'quote' ? ' class="pmx-md-quote"' : '') + (cl < 2 ? ' data-clamp="1"' : '') + '>' + lead + b.html + '</p>'); lead = ''; lines -= cl; continue;
      }
      if (lead) { out.push('<p data-clamp="1">' + lead.trim() + '</p>'); lead = ''; lines -= 1; if (out.length >= max || lines <= 0) break; }
      if (b.type === 'list') {
        if (lines < 2 && b.items.length > 1) break;
        var room = b.items.length <= lines ? b.items.length : Math.max(1, lines - 1);
        var shown = b.items.slice(0, room).map(function (it) { return '<li><span>' + it + '</span></li>'; }).join('');
        var more = b.items.length > room ? '<li class="pmx-md-more">and ' + (b.items.length - room) + ' more</li>' : '';
        out.push('<' + b.list + '>' + shown + more + '</' + b.list + '>'); lines -= room + (more ? 1 : 0);
      } else if (b.type === 'code' || b.type === 'table') {
        if (lines < 2) break;
        out.push(b.type === 'code' ? pmxCodeRow({ kind: 'code', lang: langName(b.lang), size: b.lines.length + (b.lines.length === 1 ? ' line' : ' lines'), open: o.open })
          : pmxCodeRow({ kind: 'table', size: b.rows.length + (b.rows.length === 1 ? ' row' : ' rows'), open: o.open }));
        lines -= 2;
      }
    }
    if (lead && out.length < max && lines > 0) out.push('<p data-clamp="1">' + lead.trim() + '</p>');
    return '<div class="' + cls('pmx-md', o.cls) + '" data-mode="compact">' + out.join('') + '</div>';
  }


  /* ---------------------------------------------------------------- IMPACT A2-14 phrase primitives
     One formatter per phrase (DRY, before Wave 1): every lane builds its sentences from these and the shared 9.1
     words in PMX_COPY, never from a local formatter. Strings come back as escaped text (names and values are
     escaped here), ready for any builder above. pmxTime retires the seven local time formatters and pmxCost
     retires fmtMoney's "$0.00" (DON'T 17). */
  var PMX_COPY = {
    status: { starting: 'Starting', waitingToStart: 'Waiting to start', running: 'Running', debating: 'Debating', voting: 'Voting', waiting: 'Waiting',
      needs: 'Needs attention', paused: 'Paused', cancelled: 'Cancelled', failed: 'Failed', round: 'Round {n} of {m}' },
    helper: { queued: 'Queued', waitingTurn: 'Waiting its turn', working: 'Working', tools: 'Using tools', speaking: 'Speaking', done: 'Done', needs: 'Needs attention', unfinished: 'Didn’t finish' },
    outcome: { timedOut: 'Timed out', unavailable: 'Unavailable', canceled: 'Canceled', skipped: 'Skipped by you: {reason}', optional: 'Optional', secondTry: '2nd try' },
    cost: { recorded: 'Recorded example · no AI cost', none: 'Nothing spent', unknown: 'Cost not reported', soFar: '{spent} so far', ofLimit: '{spent} of your {limit} limit' },
    tokensHover: 'Tokens measure AI use, roughly ¾ of a word each.',
    estimate: { about: 'About {span}', stops: 'stops at {limit}', tail: 'an estimate, not a promise', none: 'No estimate yet' },
    worked: 'Worked {time} with {n} helpers',
    clockIdle: 'not started',
    actions: { expand: 'Expand', collapse: 'Collapse', openPanel: 'Open Panel', message: 'Message', more: 'More', retry: 'Retry', details: 'Details',
      technical: 'Technical details', download: 'Download transcript', changeSetup: 'Change setup…', runAgain: 'Run again with changes…', watchExample: 'Watch a recorded example',
      pause: 'Pause', resume: 'Resume', cancelKind: 'Cancel {kind}…', moreRows: '+{n} more', showAll: 'Show all' },
    cancelConfirm: { sentence: 'Cancel this {kind}? Everything so far is kept.', confirm: 'Cancel {kind}', keep: 'Keep going' },
    notes: { started: 'Started with {n} helpers.', paused: 'Paused. Nothing was lost.', resumed: 'Picked up where it left off.', cancelled: 'Cancelled. Everything it produced so far is kept here.' },
    participant: { empty: 'Nothing from {name} yet.', back: 'Back to everyone' },
    sheet: { save: 'Save as my default', saved: 'Saved as your default', cancel: 'Cancel', done: 'Done', back: 'Back to setup', advanced: 'Advanced',
      cardTitle: 'Card title', cardTitleHelp: 'Shown on the card in your chat.', preview: 'In your chat', removed: 'Removed {name} · Bring back', refusalLead: 'Can’t start yet.', fix: 'Fix' },
    roster: { job: { label: 'Job', helper: 'What it focuses on' }, model: { label: 'AI model', helper: 'Which AI, which account pays' },
      persona: { label: 'Persona', helper: 'How it works (builds, checks…)' }, looksFor: { label: 'Looks for', helper: 'What it checks' },
      copy: 'Copy helper', remove: 'Remove helper', add: 'Add a helper', copyReviewer: 'Copy reviewer', removeReviewer: 'Remove reviewer', addReviewer: 'Add a reviewer' },
    specialists: { title: 'Add specialists', helper: 'Extra helpers that join the team. They never replace one.', add: 'Add', remove: 'Remove',
      autoNo: 'Crew Auto teams can’t include specialists.', scheduledNo: 'Scheduled builds can’t use specialists: they run while you’re away.', exampleNo: 'This recorded example uses its own team.' },
    severity: { critical: ['Critical', 'Must fix before shipping.'], major: ['Major', 'Will likely cause problems.'], minor: ['Minor', 'Worth fixing when convenient.'], suggestion: ['Suggestion', 'An idea, not a problem.'] },
    disposition: { confirmed: ['Confirmed', 'Reviewers agreed it’s real.'], unsure: ['Unsure', 'Not everyone was sure.'], rejected: ['Rejected', 'Reviewers agreed it isn’t a problem.'], duplicate: ['Duplicate', 'Same as another finding.'] },
    bsdSeverity: { nit: ['Nit', 'Minor, worth a look when convenient'], concern: ['Concern', 'Could cause problems'], critical: ['Critical', 'Likely to break something or waste work'] },
    sched: { scheduled: 'Scheduled', held: 'Held', sent: 'Sent', canceled: 'Canceled', failed: 'Failed', expired: 'Expired' },
    memory: { unverified: 'Unverified', verified: 'Verified', discarded: 'Discarded', outOfDate: 'Out of date: the file changed after the check.', pinned: 'Pinned by you' },
    teach: { inUseLocked: 'In use · locked', inUse: 'In use', replaced: 'Replaced by v{n}', off: 'Turned off' },
    revert: { reverted: 'Reverted', alreadyBack: 'Already back to before', refused: 'Refused', unfinished: 'Didn’t finish', recovery: 'Needs recovery' },
    finishedMessage: 'This {kind} has finished, so it can’t take messages. Ask the assistant instead.',
    sentTo: 'Sent to {kind} · {title}',
    notAvailable: 'Not available in this preview.',
    oneControlSet: { review: 'Choosing in the report beside the chat', panel: 'Deciding in the panel beside the chat' },
    provenance: { review: 'Example report: no AI was contacted.', revert: 'Demo: no real files are touched.', guide: 'Recorded example · no AI cost' },
    /* E-36 answered B (owner, 2026-09-27): "Followed", with what counts as following defined in canon; a rule the
       reply did not follow is named ("Missed 1 of your rules") */
    ticks: { noted: 'Noted', verified: 'Verified', rules: 'Followed {n} of your rules', rule: 'Followed 1 of your rules', missed: 'Missed 1 of your rules', missedN: 'Missed {n} of your rules', simple: 'Simple explanation', sentOnSchedule: 'Sent on schedule' },
    exampleHelper: 'Opens a recorded {kind} in a new chat, with its own team. Your setup stays on this card.',
    degraded: 'Degraded result: {done} of {all} reviewers finished',
    refusal: { strong: 'Can’t start yet.', fallback: 'Nothing was started. Your setup is unchanged.' }
  };
  /* pmxFill(template, vars) - fills {name} slots from vars (escaped) */
  function pmxFill(tpl, vars) {
    vars = vars || {};
    return str(tpl).replace(/\{(\w+)\}/g, function (m, n) { return vars[n] != null ? esc(vars[n]) : m; });
  }
  function nonEmpty(p) { return p != null && p !== ''; }
  /* tag-free, entity-decoded text for an attribute that the app hover card escapes itself */
  function plainText(v) { return str(v).replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'); }

  /* pmxTime - clock(ms) "3:12" (null: "not started"), worked(ms) "8m 40s", at(iso, zone, {day}) "Sat 10:00 PM",
     range(a, b, zone) "10:00 PM–1:52 AM", ago(iso, now) "5 min ago", until(iso, now) "in 5 h". Zones and DST go
     through scheduling-time.js (PM56_SCHEDULE_TIME.parts, resolved lazily: it loads after this file), so the app
     has one time-zone implementation; with no zone the reader's local clock is used. */
  var DAY3 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function toMs(v) { if (v == null || v === '') return NaN; if (typeof v === 'number') return v; if (v instanceof Date) return v.getTime(); return Date.parse(v); }
  function wallParts(t, zone) {
    if (!isFinite(t)) return null;
    if (zone) {
      var T = window.PM56_SCHEDULE_TIME;
      if (T && typeof T.parts === 'function') {
        var p = T.parts(zone, t);
        if (p) return { h: p.h, mi: p.mi, wd: typeof T.weekday === 'function' ? T.weekday(p) : new Date(Date.UTC(p.y, p.mo - 1, p.d, 12)).getUTCDay(), y: p.y, mo: p.mo, d: p.d };
        return null;
      }
      try {
        var f = new Intl.DateTimeFormat('en-US', { timeZone: zone, weekday: 'short', hour: 'numeric', minute: '2-digit', hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date(t)), q = {};
        f.forEach(function (x) { q[x.type] = x.value; });
        return { h: Number(q.hour) % 24, mi: Number(q.minute), wd: DAY3.indexOf(q.weekday), y: Number(q.year), mo: Number(q.month), d: Number(q.day) };
      } catch (e) { return null; }
    }
    var d = new Date(t);
    return { h: d.getHours(), mi: d.getMinutes(), wd: d.getDay(), y: d.getFullYear(), mo: d.getMonth() + 1, d: d.getDate() };
  }
  var MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function hm(p) { return ((p.h % 12) || 12) + ':' + pad2(p.mi) + ' ' + (p.h < 12 ? 'AM' : 'PM'); }
  function relSpan(s) {
    if (s < 60) return Math.max(1, Math.round(s)) + ' s';
    if (s < 3600) return Math.round(s / 60) + ' min';
    if (s < 86400) return Math.round(s / 3600) + ' h';
    var d = Math.round(s / 86400); return d + (d === 1 ? ' day' : ' days');
  }
  var pmxTime = {
    clock: function (ms) {
      var v = Number(ms);
      if (ms == null || ms === '' || !isFinite(v)) return PMX_COPY.clockIdle;
      var s = Math.max(0, Math.floor(v / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
      return h ? h + ':' + pad2(m) + ':' + pad2(sec) : m + ':' + pad2(sec);
    },
    worked: function (ms) {
      var s = Math.max(0, Math.round((Number(ms) || 0) / 1000));
      if (s < 60) return s + 's';
      var m = Math.floor(s / 60), sec = s % 60;
      if (m < 60) return m + 'm' + (sec ? ' ' + sec + 's' : '');
      var h = Math.floor(m / 60), mm = m % 60;
      return h + 'h' + (mm ? ' ' + mm + 'm' : '');
    },
    at: function (iso, zone, o) {
      var p = wallParts(toMs(iso), zone);
      if (!p) return '';
      return (o && o.day === false ? '' : DAY3[p.wd] + ' ') + hm(p);
    },
    range: function (a, b, zone) {
      var pa = wallParts(toMs(a), zone), pb = wallParts(toMs(b), zone);
      return pa && pb ? hm(pa) + '–' + hm(pb) : '';
    },
    ago: function (iso, now) {
      var t = toMs(iso), n = now == null ? Date.now() : toMs(now);
      if (!isFinite(t) || !isFinite(n)) return '';
      var s = (n - t) / 1000;
      return s < 45 ? 'just now' : relSpan(s) + ' ago';
    },
    /* until(iso, now, {minutes:true}) (closing, SCHED): minutes precision under a day ("in 5 h 30 m", "in 12 min") */
    until: function (iso, now, o) {
      var t = toMs(iso), n = now == null ? Date.now() : toMs(now);
      if (!isFinite(t) || !isFinite(n)) return '';
      if (o && o.minutes) {
        var m = Math.round((t - n) / 60000);
        if (m <= 0) return 'now';
        if (m < 60) return 'in ' + m + ' min';
        if (m < 1440) { var h = Math.floor(m / 60), r = m % 60; return 'in ' + h + ' h' + (r ? ' ' + r + ' m' : ''); }
        var dd = Math.round(m / 1440); return 'in ' + dd + (dd === 1 ? ' day' : ' days');
      }
      var s = (t - n) / 1000;
      return s <= 0 ? 'now' : 'in ' + relSpan(s);
    },
    /* day(iso, zone, {now}) (closing, SCHED): "Sat, Sep 27"; with now, the year follows when it is not now's year */
    day: function (iso, zone, o) {
      var p = wallParts(toMs(iso), zone);
      if (!p || p.mo == null) return '';
      var out = DAY3[p.wd] + ', ' + MON3[p.mo - 1] + ' ' + p.d;
      if (o && o.now != null) { var q = wallParts(toMs(o.now), zone); if (q && q.y != null && q.y !== p.y) out += ', ' + p.y; }
      return out;
    }
  };
  /* pmxMoney(n) - "$0.92"; a positive amount under a cent is "under $0.01", never "$0.00" */
  function pmxMoney(n) { n = Number(n); if (!isFinite(n)) return ''; if (n > 0 && n < 0.005) return 'under $0.01'; return '$' + n.toFixed(2); }
  /* pmxCost({state, spent, limit, recorded}) - exactly the 9.1 strings. state: recorded | before | running | done | unknown
     (default: recorded when the flag is set, unknown when nothing was reported, else done). Never "$0.00". */
  function pmxCost(o) {
    o = o || {};
    var st = str(o.state) || (o.recorded ? 'recorded' : (o.spent == null ? 'unknown' : 'done'));
    if (st === 'recorded') return PMX_COPY.cost.recorded;
    if (st === 'before') return PMX_COPY.cost.none;
    if (st === 'unknown' || o.spent == null || !isFinite(Number(o.spent))) return PMX_COPY.cost.unknown;
    var spent = Number(o.spent);
    if (spent <= 0) return PMX_COPY.cost.none;
    var lim = Number(o.limit), s = pmxMoney(spent) + (st === 'running' ? ' so far' : '');
    return o.limit != null && isFinite(lim) && lim > 0 ? s + ' of your ' + pmxMoney(lim) + ' limit' : s;
  }
  /* pmxTokens(n, {key, cls, plain}) - "71K tokens"; with a key the app hover card explains tokens */
  function tokWords(n) {
    n = Math.max(0, Math.round(Number(n) || 0));
    var v = n >= 1e6 ? String(Math.round(n / 1e5) / 10) + 'M' : n >= 1e4 ? Math.round(n / 1000) + 'K' : n >= 1000 ? String(Math.round(n / 100) / 10) + 'K' : String(n);
    return v + (n === 1 ? ' token' : ' tokens');
  }
  function pmxTokens(n, o) {
    o = o || {};
    var t = tokWords(n);
    if (o.plain) return t;
    return '<span class="' + cls('pmx-tokens', o.cls) + '"' + (o.key ? ' data-hover-key="' + esc(o.key) + '" data-hover-tip="' + esc(PMX_COPY.tokensHover) + '"' : '') + '>' + t + '</span>';
  }
  /* the estimate sentence: {minutes:[lo, hi], limitUsd, unknown} -> "About 5–15 min · stops at $6.00 · an estimate, not a promise" */
  function spanMin(lo, hi) {
    function one(v) { return v >= 90 ? String(Math.round(v / 6) / 10).replace(/\.0$/, '') + ' h' : Math.round(v) + ' min'; }
    if (hi == null || hi === lo) return one(lo);
    if (lo < 90 && hi < 90) return Math.round(lo) + '–' + Math.round(hi) + ' min';
    if (lo >= 90 && hi >= 90) return one(lo).replace(' h', '') + '–' + one(hi);
    return one(lo) + '–' + one(hi);
  }
  function estimateText(o) {
    var mins = Array.isArray(o.minutes) ? o.minutes : (o.minutes != null ? [o.minutes, o.minutes] : null);
    var parts = [];
    if (o.unknown || !mins || !isFinite(Number(mins[0]))) parts.push(PMX_COPY.estimate.none);
    else parts.push(pmxFill(PMX_COPY.estimate.about, { span: spanMin(Number(mins[0]), mins[1] == null ? null : Number(mins[1])) }));
    var lim = Number(o.limitUsd);
    if (o.limitUsd != null && isFinite(lim) && lim > 0) parts.push(pmxFill(PMX_COPY.estimate.stops, { limit: pmxMoney(lim) }));
    if (!o.unknown && mins) parts.push(PMX_COPY.estimate.tail);
    return parts.join(' · ');
  }
  /* pmxStandIn({requested, effective, reason, noSubstitute, sameProvider}) - the PART-01 disclosure (G-17): null when
     requested equals effective ("disclosure is not noise"), else {strong, text, fine, tone, card, team, failed}. */
  function pmxStandIn(o) {
    o = o || {};
    var req = str(o.requested), eff = str(o.effective);
    if (!req || (!o.noSubstitute && (!eff || eff === req))) return null;
    var R = esc(req), E = esc(eff), why = esc(o.reason || 'offline');
    if (o.noSubstitute) {
      return { strong: 'Nothing can stand in', text: 'for ' + R + ', so pick another model or remove this ' + esc(o.role || 'helper') + '.', fine: 'requested ' + R + ' · no substitute', tone: 'failed',
        card: 'Couldn’t take part: ' + R + ' is unavailable and no stand-in is allowed.', team: R + ' · no stand-in allowed', failed: 'Couldn’t take part: ' + R + ' is unavailable and no stand-in is allowed.' };
    }
    return { strong: R + ' is ' + why + ' right now,', text: 'so ' + E + ' stands in' + (o.sameProvider ? ' (same provider).' : '.'), fine: 'requested ' + R + ' · effective ' + E, tone: 'info',
      card: E + ' stands in for ' + R + ' (' + why + ')', team: E + ' · standing in for ' + R + ', which is ' + why, failed: '' };
  }
  /* pmxClamp({asked, runs, planBound}) - the concurrency clamp in both places: {card:"2 at a time (you asked for 3)",
     sheet:"You asked for 3; your plan runs 2 at once. The third waits its turn."}; null when nothing is clamped */
  var ORDINAL = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
  function pmxClamp(o) {
    o = o || {};
    if (o.planBound) return { card: '1 at a time: plan builds run one part at a time', sheet: 'Plan builds run one part at a time.', asked: num(o.asked, 1), runs: 1 };
    var asked = Math.round(num(o.asked, 0)), runs = Math.round(num(o.runs, 0));
    if (runs < 1 || asked <= runs) return null;
    var extra = asked - runs;
    var rest = extra === 1 ? 'The ' + (ORDINAL[runs + 1] || (runs + 1) + 'th') + ' waits its turn.' : 'The other ' + extra + ' wait their turn.';
    return { card: runs + ' at a time (you asked for ' + asked + ')', sheet: 'You asked for ' + asked + '; your plan runs ' + runs + ' at once. ' + rest, asked: asked, runs: runs };
  }
  /* pmxInlineConfirm({key,cls,attrs,sentence,confirm:{action,attrs,label,tone},keep:{action,attrs,label}}) - the
     never-a-modal confirmation (Cancel {Kind}..., Teach Turn off): one sentence and two buttons in place */
  function pmxInlineConfirm(o) {
    o = o || {};
    var c = o.confirm || {}, kp = o.keep || {};
    return '<div class="' + cls('pmx-inline-confirm', o.cls) + '"' + k(o.key) + ' role="group"' + raw(o.attrs) + '><p class="pmx-inline-confirm-say">' + str(o.sentence) + '</p>' +
      '<div class="pmx-inline-confirm-acts">' + actButton({ action: c.action, attrs: c.attrs, label: c.label || 'Confirm', tone: c.tone || 'soft' }, 'pmx-act') +
      actButton({ action: kp.action, attrs: kp.attrs, label: kp.label || PMX_COPY.cancelConfirm.keep, tone: 'text' }, 'pmx-act') + '</div></div>';
  }
  /* pmxRefusalText(code, vars) - the 9.3 map: {strong, text, fix} for pmxRefusal (the code stays in data-failure),
     or null for a code the map does not know. vars: helper, kind, version, limit, domain ('bsd'), over, tooLong, variant. */
  var START = 'Can’t start yet.';
  var REFUSE = {
    model_unresolved: [START, '{helper}’s model isn’t available right now. Pick another model or remove this helper.', 'Fix'],
    recorded_example: ['', 'This recorded example needs exactly 3 helpers, no specialists, Moderator guides or One answer each, and 1 or 2 rounds.'],
    invalid_policy_roster: ['', 'Crew Auto teams can’t include specialists.'],
    invalid_policy_roster_over: ['', 'Crew Auto teams have at most 4 helpers. Remove one to turn it on.'],
    parent_mode_disallows_execution: ['', 'Switch this chat to Agent mode to start a {kind}.'],
    auto_configuration_required: ['', 'Set up Crew Auto before turning it on.'],
    current_plan_requires_explicit_resolution: ['', 'This chat already has a Plan. Open it to replace or revise it.', 'Open Plan'],
    synthesis_not_ready: ['', 'The plan can be written after the vote.'],
    question_budget_exhausted: ['', 'The team has asked all the questions it’s allowed. It will decide the rest from research and your earlier answers.'],
    round_limit_reached: ['', 'That was the last round. Sum it up, or send it to the assistant instead.'],
    round_incomplete: ['', 'Wait for everyone to finish this round first.'],
    current_summary_required: ['', 'Sum up the latest round before ending.'],
    finish_current_round: ['', 'This round is still going. You can send when it ends.'],
    finish_pending_delivery: ['', 'The room hasn’t answered your last message yet. Start the next round.'],
    room_ended_or_paused: ['', 'This room is paused or ended.'],
    participant_missing: ['', 'That helper isn’t in this room.'],
    select_room_output: ['', 'Pick one of the helpers’ messages.'],
    stale_promotion: ['', 'This message changed. Pick it again.'],
    unsupported_promotion: ['', 'Can’t make a Goal from a room yet.'],
    stale_epoch: ['', 'The room changed; the round didn’t start.'],
    time_not_future: ['', 'Pick a time later than now.'],
    invalid_message_text: ['', 'Write a message first.'],
    invalid_message_text_long: ['', 'That’s too long (8,000 characters max).'],
    composer_changed: ['', 'Your message box changed. Reopen this to schedule the new text.'],
    live_browser_context_not_schedulable: ['', 'Live browser picks can’t be sent later. Freeze browser context as an attachment first (capture a screenshot).'],
    attachment_snapshot_required: ['', 'We need to save a copy of this file first (needs selected bytes).'],
    idempotency_conflict: ['', 'This changed somewhere else. Reopen to see the latest.'],
    destination_owner_unavailable: ['', 'The chat or Crew this goes to has ended.'],
    bsd_stale: ['', 'Settings changed somewhere else. Reopen to see the latest.'],
    already_in_state: ['', 'Already paused.'],
    quarantine_terminal_pause: ['', 'Paused for safety. Change the model or save again to resume.'],
    bsd_assignment_not_found: ['', 'That advisor run has ended.'],
    command_not_registered: ['', 'Not available in this preview.'],
    resolve_related_teaching: ['', 'Pick Replace or Keep both first.'],
    teach_safe_tick: ['', 'Tick ‘safe for my other projects’ first.'],
    teach_widens_scope: ['', 'An edit can’t widen where a rule applies. Save a new rule instead.'],
    teach_credential: ['', 'That looks like a password or key. Remove it to save.'],
    no_eligible_mutating_turn: ['', 'Nothing to revert yet.'],
    revert_not_latest: ['', 'Only the most recent changes can be reverted.'],
    revert_done: ['', 'Already reverted.'],
    crew_fence_changed: ['', 'The Crew changed since this step started; it was skipped safely.'],
    crew_fence_waiting: ['', 'Waiting for {part} to finish first.'],
    crew_fence_mismatch: ['', 'The result didn’t match what was asked, so it wasn’t accepted.'],
    review_not_completed: ['', 'The review has to finish first.'],
    no_findings_selected: ['', 'Tick at least one finding.'],
    confirmed_evidenced_findings_only: ['', 'Only confirmed findings with proof can become To-Dos.'],
    plan_version_changed: ['This plan changed while this was open.', 'Reopen it to use version {version}.'],
    plan_version_changed_any: ['This plan changed while this was open.', 'Reopen it to see the latest version.'],
    stopped_at_limit: ['Stopped at your limit', '({limit}) · everything so far is kept.'],
    composer_has_text: ['', 'Your message box already has text. Send or clear it first.'],
    /* closing review (ENG 5): every code COLLAB's scheduledBad() and PM56_ROOM.canSend() can return. Where SCHED's own
       table (scheduling.js SCHED_REFUSE) words the same code, the sentence is the same, so the Crew sheet and the
       Build At sheet never say it two ways. */
    plan_not_ready_for_crew: ['', 'A Crew can’t build this plan: its steps aren’t set up to be split between helpers. Pick another way to build it.'],
    crew_configuration_required: ['', 'Set up the Crew first.'],
    crew_definition_changed: ['', 'The Crew changed since you set it up. Set it up again.'],
    destination_scope_mismatch: ['', 'That destination belongs to another chat.'],
    destination_not_found: ['', 'The chat or Crew this goes to is no longer available.'],
    destination_not_accepting: ['', 'The {kind} this goes to isn’t taking messages right now. Try again once it’s running.'],
    destination_generation_changed: ['', 'The {kind} this goes to changed since you picked it. Reopen to pick it again.'],
    participant_not_found: ['', 'That helper isn’t part of this {kind} any more.'],
    room_missing: ['', 'This room is no longer available.'],
    transaction_required: ['', 'This couldn’t be saved safely, so nothing changed. Try again.'],
    crew_already_active: ['', 'A Crew is already building this plan. Let it finish, or stop it first.'],
    crew_admission_conflict: ['', 'This build already has a Crew with a different setup. Reopen to see the latest.'],
    crew_admission_binding_changed: ['', 'The Crew changed while it was starting. Set it up again.'],
    crew_definition_not_committed: ['', 'This Crew setup wasn’t saved. Set it up again.'],
    crew_binding_missing: ['', 'This build’s Crew is no longer available.'],
    crew_assignment_missing: ['', 'This step has no helper assigned. Set up the Crew again.'],
    crew_assignment_invalid: ['', 'The Crew’s parts no longer match this plan’s steps. Set it up again.'],
    crew_assignment_changed: ['', 'A helper changed since this build started. Set up the Crew again.'],
    invalid_crew_configuration: ['', 'Check the Crew’s helpers and settings, then try again.'],
    invalid_crew_concurrency: ['', 'Pick between 1 and 8 helpers at once.'],
    crew_more_required_slots_than_work: ['', 'This plan has fewer steps than helpers. Remove a helper so each one has a step.'],
    scheduled_specialist_adapter_unavailable: ['', 'Scheduled builds can’t include the Wonderer or Grill Me: they run while you’re away. Turn them off to schedule this.'],
    scheduled_coordinator_adapter_unavailable: ['', 'Scheduled builds are led by this chat’s assistant. Pick it as the Coordinator to schedule this.'],
    scheduled_adaptive_adapter_unavailable: ['', 'In a scheduled build each helper keeps its part. Pick another way to decide who does what.']
  };
  var REFUSE_ALIAS = {
    provider_unavailable: 'model_unresolved', route_unavailable: 'model_unresolved', crew_route_unavailable: 'model_unresolved',
    this_recorded_work_contract_requires_three_core_roles: 'recorded_example', recorded_example_requires_three_core_participants: 'recorded_example',
    recorded_example_supports_moderated_or_ask_everyone_once: 'recorded_example', recorded_example_has_one_or_two_rounds: 'recorded_example',
    parent_mode_disallows_example_execution: 'parent_mode_disallows_execution', wrong_thread: 'participant_missing', source_changed: 'stale_promotion',
    definition_changed: 'stale_epoch', room_not_running: 'stale_epoch', stale_schedule_revision: 'idempotency_conflict', scope_changed: 'idempotency_conflict',
    stale_policy_revision: 'bsd_stale', stale_projection: 'bsd_stale', bsd_finding_not_found: 'bsd_assignment_not_found',
    plan_changed_during_crew_configuration: 'plan_version_changed', crew_plan_binding_changed: 'plan_version_changed',
    destination_ended: 'destination_owner_unavailable', collaboration_message_conflict: 'idempotency_conflict', crew_definition_conflict: 'idempotency_conflict',
    collaboration_transaction_required: 'transaction_required', crew_transaction_required: 'transaction_required'
  };
  /* short forms for narrow rows (closing, REVERT FR 9): {short} comes back beside the sentence when the map has one */
  var REFUSE_SHORT = { revert_not_latest: 'Not the latest change', revert_done: 'Already reverted', no_eligible_mutating_turn: 'Nothing to revert yet' };
  function pmxRefusalText(code, vars) {
    vars = vars || {};
    var c = str(code);
    if (c === 'stale_epoch' && vars.domain === 'bsd') c = 'bsd_stale';
    c = REFUSE_ALIAS[c] || c;
    if (c === 'invalid_policy_roster' && vars.over) c = 'invalid_policy_roster_over';
    if (c === 'invalid_message_text' && vars.tooLong) c = 'invalid_message_text_long';
    if (c === 'no_eligible_mutating_turn' && vars.variant === 'not-latest') c = 'revert_not_latest';
    if (c === 'no_eligible_mutating_turn' && vars.variant === 'done') c = 'revert_done';
    /* a caller without the new version number (COLLAB's scheduled Crew path) never prints "version ." */
    if (c === 'plan_version_changed' && (vars.version == null || vars.version === '')) c = 'plan_version_changed_any';
    var e = REFUSE[c];
    if (!e) return null;
    var v = { helper: vars.helper || 'This helper', kind: vars.kind || 'Crew', version: vars.version != null ? vars.version : '', limit: vars.limit || '', part: vars.part || 'the part before it' };
    return { strong: pmxFill(e[0], v), text: pmxFill(e[1], v), fix: e[2] || '', code: str(code), short: REFUSE_SHORT[c] || '' };
  }

  var API = {
    PMX_GLYPHS: PMX_GLYPHS, PMX_COPY: PMX_COPY, pmxFill: pmxFill, pmxTime: pmxTime, pmxMoney: pmxMoney, pmxCost: pmxCost, pmxTokens: pmxTokens, pmxStandIn: pmxStandIn, pmxClamp: pmxClamp,
    pmxLedgerLine: pmxLedgerLine, pmxInlineConfirm: pmxInlineConfirm, pmxRefusalText: pmxRefusalText, pmxGlyph: pmxGlyph, pmxKindMark: pmxKindMark, pmxMark: pmxMark, pmxPlateParts: pmxPlateParts, pmxPlate: pmxPlate, pmxPlateFit: pmxPlateFit, pmxCastPlate: pmxCastPlate, pmxCastFit: pmxCastFit, pmxHash: pmxHash,
    pmxSheet: pmxSheet, pmxQuestion: pmxQuestion, pmxHero: pmxHero, pmxCtl: pmxCtl, pmxRoster: pmxRoster, pmxRosterRow: pmxRosterRow, pmxAddRow: pmxAddRow, pmxRoute: pmxRoute,
    pmxShelf: pmxShelf, pmxStepper: pmxStepper, pmxSwitch: pmxSwitch, pmxCheck: pmxCheck, pmxWords: pmxWords, pmxPromise: pmxPromise, pmxPromises: pmxPromises,
    pmxAdvancedEntry: pmxAdvancedEntry, pmxAdvancedPage: pmxAdvancedPage, pmxSetting: pmxSetting, pmxPreview: pmxPreview, pmxReadback: pmxReadback, pmxEstimate: pmxEstimate,
    pmxRefusal: pmxRefusal, pmxFoot: pmxFoot, pmxConfirm: pmxConfirm, pmxTabs: pmxTabs,
    pmxRun: pmxRun, pmxRunHead: pmxRunHead, pmxSentence: pmxSentence, pmxStatus: pmxStatus, pmxTrack: pmxTrack, pmxLane: pmxLane, pmxLanes: pmxLanes, pmxDecision: pmxDecision,
    pmxResult: pmxResult, pmxOutput: pmxOutput, pmxCredits: pmxCredits, pmxMeta: pmxMeta, pmxActions: pmxActions, pmxReceipt: pmxReceipt,
    pmxDockLine: pmxDockLine, pmxDock: pmxDock, pmxFinding: pmxFinding, pmxFindings: pmxFindings, pmxSealed: pmxSealed, pmxSeverity: pmxSeverity, pmxAgree: pmxAgree, pmxVoteBoard: pmxVoteBoard,
    pmxQuote: pmxQuote, pmxWash: pmxWash, pmxNote: pmxNote, pmxTick: pmxTick, pmxDivider: pmxDivider, pmxFilesRow: pmxFilesRow, pmxCodeRow: pmxCodeRow, pmxMd: pmxMd, pmxGuide: pmxGuide,
    pmxView: pmxView, pmxViewSection: pmxViewSection, pmxTimeline: pmxTimeline, pmxTeamRow: pmxTeamRow, pmxParticipant: pmxParticipant,
    pmxInert: inert, pmxLangName: langName,
    /* closing: pmxMd's inline renderer (a note body is itself a <p>, BSD) and the disclosure primitive (PREFS) */
    pmxMdInline: inlineOnly, pmxDisclosure: pmxDisclosure
  };
  for (var name in API) if (Object.prototype.hasOwnProperty.call(API, name)) SHELL[name] = API[name];
})();
