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

  /* pickerButton({action,anchor,strong,small,markHtml,iconHtml,extra}) —
     markup-compatible with PM56_PICKERS.modelButton and bsd.js choices(). */
  function pickerButton(o) {
    o = o || {};
    return '<button type="button" class="shared-picker-button" data-action="' + esc(o.action) + '" data-menu-anchor="' + esc(o.anchor) + '"' + (o.extra ? ' ' + o.extra : '') + '>' +
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

  /* ---------------------------------------------------------------- B1 marks
     silhouette x spike x hue on a 28 grid. Fill = hue at 16 %, stroke 1.6 in
     the hue, spike solid. All paint comes from --pmx-seat through the pmx-m-*
     classes (module-shell.css), never from `color`. */
  var SIL = {
    lead: '<circle class="pmx-m-sil" cx="14" cy="14" r="10.2"/><circle class="pmx-m-spk" cx="14" cy="14" r="4.2"/>',
    square: '<rect class="pmx-m-sil" x="5" y="5" width="18" height="18" rx="5"/>',
    circle: '<circle class="pmx-m-sil" cx="14" cy="14" r="9.5"/>',
    triangle: '<path class="pmx-m-sil" d="M14 4.5 24 22.5H4z"/>',
    diamond: '<path class="pmx-m-sil" d="M14 3.5 24.5 14 14 24.5 3.5 14z"/>',
    hexagon: '<path class="pmx-m-sil" d="M14 3.8 23 9v10l-9 5.2L5 19V9z"/>',
    orbit: '<circle class="pmx-m-sil" cx="13" cy="15" r="6.5"/><ellipse class="pmx-m-spks" cx="14" cy="13" rx="11" ry="5" transform="rotate(-24 14 13)"/>',
    bowl: '<path class="pmx-m-sil" d="M5 11Q14 27 23 11z"/>',
    you: '<circle class="pmx-m-sil" cx="14" cy="9" r="4.5"/><path class="pmx-m-sil" d="M5.5 24Q14 12 22.5 24z"/>'
  };
  var SPK = [
    '<circle class="pmx-m-spk" cx="14" cy="14" r="2.2"/>',
    '<rect class="pmx-m-spk" x="9.5" y="12.8" width="9" height="2.4" rx="1.2"/>',
    '<rect class="pmx-m-spk" x="12.8" y="9.5" width="2.4" height="9" rx="1.2"/>',
    '<circle class="pmx-m-spks" cx="14" cy="14" r="3"/>',
    '<path class="pmx-m-spks" d="M10 11h8M14 11v7"/>',
    '<path class="pmx-m-spks" d="M11 10v7h6"/>',
    '<path class="pmx-m-spks" d="M10.5 12.5 14 16l3.5-3.5"/>',
    '<circle class="pmx-m-spk" cx="11.5" cy="14" r="1.8"/><circle class="pmx-m-spk" cx="16.5" cy="14" r="1.8"/>'
  ];
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
  function roleKey(role) { return str(role).toLowerCase().trim().replace(/[\s_]+/g, '-'); }
  function silOf(role) { return ROLE_SIL[roleKey(role)] || 'square'; }
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
  /* The inside of a mark (28 grid): silhouette, spike, state ring and notches. */
  function markInner(sil, seat, state, standin) {
    var s = Math.max(1, Math.round(num(seat, 1)));
    var out = SIL[sil] || SIL.square;
    if (sil !== 'lead' && sil !== 'you' && sil !== 'orbit') out += SPK[(s - 1) % 8];
    state = str(state) || 'idle';
    if (state === 'working' || state === 'queued' || state === 'needs') out += '<circle class="pmx-m-ring" cx="14" cy="14" r="13.4"/>';
    if (state === 'working') out += '<rect class="pmx-m-floor" x="7" y="29.4" width="14" height="2" rx="1"/>';
    if (state === 'done') out += '<circle class="pmx-m-nd" cx="23" cy="23" r="5.4"/><path class="pmx-m-nc" d="m20.6 23.1 1.7 1.7 3.2-3.4"/>';
    if (state === 'needs') out += '<circle class="pmx-m-nd" cx="23" cy="23" r="5.4"/><path class="pmx-m-nw" d="M23 20.2v3.3M23 25.9v.1"/>';
    if (state === 'failed') out += '<circle class="pmx-m-nd" cx="23" cy="23" r="5.4"/><path class="pmx-m-nx" d="m20.6 25.4 4.8-4.8"/>';
    if (standin) out += '<circle class="pmx-m-nd" cx="23.5" cy="4.5" r="5"/><path class="pmx-m-sw" d="M20.8 3.6h5M24.4 2.2l1.4 1.4-1.4 1.4M26 6.2h-5M22.4 4.8 21 6.2l1.4 1.4"/>';
    return out;
  }
  var MARK_SIZES = { 12: 1, 16: 1, 18: 1, 22: 1, 24: 1, 28: 1, 36: 1 };
  /* pmxMark({key,role,seat,size,state,standin,cls,label}) */
  function pmxMark(o) {
    o = o || {};
    var sil = silOf(o.role);
    var size = MARK_SIZES[o.size] ? o.size : 22;
    var state = str(o.state) || 'idle';
    return '<span class="' + cls('pmx-mark', o.cls) + '"' + k(o.key) + ' data-role="' + esc(roleKey(o.role) || sil) + '" data-sil="' + sil + '" data-state="' + esc(state) + '" data-size="' + size + '"' + (o.standin ? ' data-standin="1"' : '') +
      ' style="' + seatStyle(sil, o.seat) + '"' + (o.label ? ' role="img" aria-label="' + esc(o.label) + '"' : ' aria-hidden="true"') + raw(o.attrs) + '>' +
      '<svg viewBox="0 0 28 28" aria-hidden="true">' + markInner(sil, o.seat, state, o.standin) + '</svg></span>';
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
       mark; the sub-line's baseline is 18 below the name's (>= 6 px between their ink). */
    seat: function (o) {
      o = o || {};
      var sil = silOf(o.role), state = str(o.state) || 'idle';
      var floor = o.floor === 'bar' || o.floor === 'hatch' ? o.floor : '';
      var ly = (floor || state === 'working') ? 42 : 30;
      var fb = floor === 'hatch' ? hatchBox(-22, 15, 44, 7, 'pmx-p-floorhatch')
        : floor === 'bar' && state !== 'working' ? '<rect class="pmx-p-floorbar" x="-7" y="15.4" width="14" height="2" rx="1" style="' + seatStyle(sil, o.seat) + '"/>' : '';
      var lab = o.label ? svgText('pmx-p-lab', 0, ly, o.label, 'middle') : '';
      var sub = o.sub ? svgText('pmx-p-sub', 0, ly + 18, o.sub, 'middle') : '';
      return '<g class="pmx-p-seat"' + k(o.key) + pos(o.x, o.y) + ' data-state="' + esc(state) + '"' + (floor ? ' data-floor="' + floor + '"' : '') + part(o.part) + '>' + fb +
        '<g class="pmx-p-mark" data-sil="' + sil + '" data-state="' + esc(state) + '" style="' + seatStyle(sil, o.seat) + '" transform="translate(-14 -14)">' + markInner(sil, o.seat, state, o.standin) + '</g>' +
        lab + sub + '</g>';
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
    screen: function (o) {
      o = o || {};
      var h = num(o.h, 44);
      return '<g class="pmx-p-screen-g"' + k(o.key) + pos(o.x, o.y) + part(o.part || 'blind') + '><path class="pmx-p-screen" d="M0 ' + (-h / 2) + 'V' + (h / 2) + '"/>' + glyphIn('eye-off', -5, -h / 2 - 13, 10) + '</g>';
    },
    /* paper({key,x,y,w,h,label,sub,lock,part}) - J-2 + review cycle 1: the paper's words keep 12 px from its
       sides (16 more beside the lock) and 8 px from its edges, and they are FITTED: each line is an HTML line
       inside a foreignObject that ends in an ellipsis at the paper's inner width (a mirrored job title can
       grow as the reader types; the theme font decides the width), so no word ever runs past the paper or
       onto a line leaving it. Baselines as before: label +20, sub +38. */
    paper: function (o) {
      o = o || {};
      var w = num(o.w, 92), h = num(o.h, 50);
      var tw = Math.max(0, w - 24), subW = o.lock ? Math.max(0, tw - 16) : tw;
      var words = (o.label || o.sub) ? '<foreignObject class="pmx-p-paper-fo" x="12" y="8" width="' + tw + '" height="' + Math.max(0, h - 16) + '">' +
        '<div xmlns="http://www.w3.org/1999/xhtml" class="pmx-p-paper-text">' + (o.label ? '<span class="pmx-p-note">' + o.label + '</span>' : '') +
        (o.sub ? '<span class="pmx-p-lab" style="max-width:' + subW + 'px">' + o.sub + '</span>' : '') + '</div></foreignObject>' : '';
      return '<g class="pmx-p-paper-g"' + k(o.key) + pos(o.x, o.y) + part(o.part) + '>' +
        '<path class="pmx-p-paper" d="M0 0H' + (w - 10) + 'L' + w + ' 10V' + h + 'H0z"/><path class="pmx-p-fold" d="M' + (w - 10) + ' 0V10H' + w + '"/>' +
        words + (o.lock ? glyphIn('lock', w - 18, h - 16, 11) : '') + '</g>';
    },
    you: function (o) {
      o = o || {};
      return '<g class="pmx-p-you"' + pos(o.x, o.y) + part(o.part || 'you') + '>' +
        '<g class="pmx-p-mark" data-sil="you" data-state="idle" style="--pmx-seat:var(--pmx-seat-you);--pmx-seat-fill:var(--pmx-seat-fill-you)" transform="translate(-11 -11) scale(.79)">' + SIL.you + '</g>' +
        (o.label ? svgText('pmx-p-lab', o.anchor === 'end' ? -18 : 18, -1, o.label, o.anchor) : '') + (o.sub ? svgText('pmx-p-sub', o.anchor === 'end' ? -18 : 18, 17, o.sub, o.anchor) : '') + '</g>';
    },
    chapter: function (o) {
      o = o || {};
      var state = str(o.state) || 'next';
      return '<g class="pmx-p-chapter"' + k(o.key) + pos(o.x, o.y || 0) + ' data-state="' + esc(state) + '"' + part(o.part) + '><path class="pmx-p-chap" d="M0 -6 6 0 0 6 -6 0z"/>' +
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
  var PLATE_H = { full: 200, compact: 160, strip: 96, caption: 40 };
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
     mode). */
  function pmxPlateFit(o) {
    o = o || {};
    var list = Array.isArray(o.plates) ? o.plates.slice() : [str(o.plates)];
    if (o.caption) list.push(pmxPlate({ key: (o.key ? o.key + ':' : '') + 'caption', kind: o.kind, mode: 'caption', fitH: 40, caption: o.caption }));
    var plates = list.join('');
    var leanest = null;
    plates.replace(/data-fit-h="([\d.]+)"/g, function (m, v) { v = +v; if (isFinite(v) && (leanest == null || v < leanest)) leanest = v; return m; });
    var min = o.min != null ? num(o.min, 72) : (leanest != null ? leanest : 72);
    if (o.caption && leanest != null) min = Math.min(min, leanest);
    var fit = o.fit != null ? o.fit : (o.key && window.PM56_PMX && window.PM56_PMX.plateFit ? window.PM56_PMX.plateFit(o.key) : '');
    return '<div class="' + cls('pmx-plate-fit', o.cls) + '"' + k(o.key) + (fit ? ' data-fit="' + esc(fit) + '"' : '') + ' style="--pmx-fit-min:' + min + 'px"' + at('data-pmx-affects', o.affects) + '>' + plates + '</div>';
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
  function pmxCheck(o) {
    o = o || {};
    return '<label class="' + cls('pmx-check', o.cls) + '"' + k(o.key) + at('data-pmx-affects', o.affects) + '><input type="checkbox"' + raw(o.attrs) + (o.checked ? ' checked' : '') + (o.disabled ? ' disabled' : '') + ' data-pmx-harness>' +
      '<span class="pmx-box" aria-hidden="true"></span><span class="pmx-check-copy"><b>' + str(o.label) + '</b>' + (o.helper ? '<small>' + o.helper + '</small>' : '') + '</span></label>';
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
  function pmxPreview(o) {
    o = o || {};
    return '<figure class="' + cls('pmx-preview', o.cls) + '"' + k(o.key) + ' style="--pmx-preview-scale:' + num(o.scale, 0.62) + '"' + raw(o.attrs) + '><figcaption class="pmx-fine">' + str(o.label == null ? 'In your chat' : o.label) + '</figcaption>' +
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
     selector and no action can match the preview. */
  var LOOK = { 'primary-button': 1, 'soft-button': 1, 'text-button': 1, 'icon-button': 1 };
  function inert(html) {
    return str(html)
      .replace(/<(\/?)button\b/g, '<$1span')
      .replace(/\s(?:data-action|data-run|data-run-id|data-pm-keep|data-menu-anchor|data-pmx-autofocus|data-hover-key|data-hover-tip|tabindex)(?:="[^"]*")?(?=[\s>\/])/g, '')
      .replace(/\sdata-k="([^"]*)"/g, function (m, v) { return ' data-k="pv:' + v + '"'; })
      .replace(/\sclass="([^"]*)"/g, function (m, v) {
        var keep = v.split(/\s+/).filter(function (c) { return c && (c.indexOf('pmx-') === 0 || LOOK[c]); });
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
     (memory's hand) is drawn as given. */
  function decisionMark(glyph, tone) {
    if (!glyph || glyph === 'ring-dot') return pmxStatus(tone === 'accent' ? 'yourmove' : 'needs', 14);
    return glyph === 'warn' ? pmxStatus('attention', 14) : g(glyph, 14);
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
    pmxLedgerLine: pmxLedgerLine, pmxInlineConfirm: pmxInlineConfirm, pmxRefusalText: pmxRefusalText, pmxGlyph: pmxGlyph, pmxKindMark: pmxKindMark, pmxMark: pmxMark, pmxPlateParts: pmxPlateParts, pmxPlate: pmxPlate, pmxPlateFit: pmxPlateFit, pmxHash: pmxHash,
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
