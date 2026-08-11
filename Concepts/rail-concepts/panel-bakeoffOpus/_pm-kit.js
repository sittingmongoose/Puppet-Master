/* PANEL BAKEOFF — shared primitive kit (markup helpers)
   =====================================================================
   Version authors compose from these. A version owns its LAYOUT; it does not
   own the status vocabulary, the elision policy, or the metadata-degradation
   rule, because those must be identical across all six or the bakeoff
   compares noise instead of design.

   Everything returns an HTML string. Call from a panel function:

     PM_BAKEOFF.register('vA', {
       name: 'Ledger',
       panels: { docker: function (D, state) { ... return html; } }
     });

   Width decisions key off PM_DATA.bucket(state.width):
     0 essential (<280)  1 compact (280-359)  2 standard (360-479)  3 full (>=480)
   Never off a continuum -- the bucket is what ports to Slint, which cannot
   measure text mid-layout.
   ===================================================================== */
(function (global) {
  'use strict';

  var K = {};
  var D = global.PM_DATA;

  /* ------------------------------------------------------------- escaping */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  K.esc = esc;

  /* ---------------------------------------------------------------- icons
     Inline SVG only -- emoji are banned project-wide. */
  var PATHS = {
    check:  '<polyline points="20 6 9 17 4 12"/>',
    x:      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    arc:    '<path d="M21 12a9 9 0 1 1-6.2-8.56"/>',
    circle: '<circle cx="12" cy="12" r="8"/>',
    warn:   '<path d="M12 3 2 20h20L12 3z"/><line x1="12" y1="10" x2="12" y2="14"/><line x1="12" y1="17" x2="12" y2="17"/>',
    bar:    '<rect x="3" y="9" width="18" height="6" rx="1"/>',
    clock:  '<circle cx="12" cy="12" r="8"/><polyline points="12 7 12 12 15 14"/>',
    square: '<rect x="5" y="5" width="14" height="14" rx="1"/>',
    slash:  '<circle cx="12" cy="12" r="8"/><line x1="6.5" y1="6.5" x2="17.5" y2="17.5"/>',
    chev:   '<polyline points="9 6 15 12 9 18"/>',
    down:   '<polyline points="6 9 12 15 18 9"/>',
    dots:   '<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    plus:   '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    play:   '<polygon points="6 4 20 12 6 20 6 4"/>',
    stop:   '<rect x="6" y="6" width="12" height="12" rx="1"/>',
    refresh:'<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
    ext:    '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    back:   '<polyline points="15 18 9 12 15 6"/>',
    info:   '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><line x1="12" y1="8" x2="12" y2="8"/>',
    branch: '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    /* The detach grip. FinalGUISpec.md:950 is specific: "Subtle grip icon
       (6 dots) in panel header" -- six, in two columns, not a generic handle. */
    grip:   '<circle cx="9" cy="6" r="1.3"/><circle cx="15" cy="6" r="1.3"/>' +
            '<circle cx="9" cy="12" r="1.3"/><circle cx="15" cy="12" r="1.3"/>' +
            '<circle cx="9" cy="18" r="1.3"/><circle cx="15" cy="18" r="1.3"/>'
  };

  /** icon(name, size, cls) -> inline SVG string */
  K.icon = function (name, size, cls) {
    return '<svg class="' + (cls || '') + '" width="' + (size || 14) + '" height="' + (size || 14) +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (PATHS[name] || '') + '</svg>';
  };

  /* --------------------------------------------------------------- status
     Four non-color channels (FinalGUISpec.md:1237): glyph SHAPE, rail DASH,
     accessible label, and the status word at bucket >= 2. Any two suffice.
     attention and blocked are deliberately distinguishable by shape alone
     (solid triangle vs dashed bar) -- GI-017 insists they stay distinct. */
  /* FALLBACKS ONLY. The authority is the data: every entry in PM_DATA.status
     declares its own `glyph` and `rail`, and statusMark reads those. This map
     exists solely so a token that predates the field still renders.

     It used to be the authority, and that was a real defect: the kit knew nine
     tokens and the fixture grew to eleven, so `cancelled` and `inconclusive`
     fell through to the default circle and rendered PIXEL-IDENTICAL to
     `queued` -- same shape, same colour, same solid rail -- in every version
     that draws a run list. Two distinct outcomes became one, and no amount of
     per-version care could have fixed it, because no version owns this. */
  var GLYPH_FALLBACK = {
    ok: 'check', running: 'arc', queued: 'circle', attention: 'warn',
    blocked: 'bar', failed: 'x', stale: 'clock', disabled: 'square', prohibited: 'slash'
  };
  var DASH_FALLBACK = { blocked: 'dashed', stale: 'dotted', prohibited: 'dotted' };

  K.statusOf = function (token) {
    var s = D.status && D.status[token];
    if (s) return s;
    /* Aliasing an unknown token to `queued` is how a new status silently
       becomes an old one. Say so once, loudly, rather than rendering a
       confident wrong answer. */
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[PMK] unknown status token "' + token + '" - not in PM_DATA.status');
    }
    return D.status.queued;
  };

  /** statusMark(token) -> the 21px rail+glyph gutter, OUTSIDE the text band. */
  K.statusMark = function (token) {
    var s = K.statusOf(token);
    /* Read the shape and the rail from the DATA entry. A status the fixture
       declares is a status the mark can draw, without touching this file. */
    var glyph = s.glyph || GLYPH_FALLBACK[token] || 'circle';
    var railStyle = s.rail || DASH_FALLBACK[token] || 'solid';
    var dash = (railStyle && railStyle !== 'solid') ? ' pmk-rail--' + railStyle : '';
    var spin = token === 'running' ? ' pmk-spin' : '';
    return '<span class="pmk-mark pmk-t-' + s.tone + '" role="img" aria-label="' + esc(s.label) + '">' +
           '<span class="pmk-rail' + dash + '"></span>' +
           K.icon(glyph, 14, 'pmk-glyph' + spin) +
           '</span>';
  };

  /* -------------------------------------------------------------- elision
     Slint's overflow:elide only does tail, so per-kind elision is computed
     rather than styled. Version authors should pass the right kind: a path
     elided from the tail loses the basename, which is the only part that
     identifies it. */
  K.elide = function (text, kind, max) {
    text = String(text == null ? '' : text);
    if (!max || text.length <= max) return text;
    var E = '…';
    switch (kind) {
      case 'path': {
        var parts = text.split('/');
        if (parts.length < 3) return text.slice(0, max - 1) + E;
        var first = parts[0], base = parts[parts.length - 1];
        var out = first + '/' + E + '/' + base;
        return out.length <= max ? out : E + '/' + base;
      }
      case 'ref':                                   /* keep the tail */
        return E + text.slice(-(max - 1));
      case 'image': {                               /* always keep the tag */
        var at = text.lastIndexOf(':');
        if (at < 0) return K.elide(text, 'path', max);
        var repo = text.slice(0, at), tag = text.slice(at);
        var room = max - tag.length - 1;
        return room < 4 ? E + tag : repo.slice(0, room) + E + tag;
      }
      case 'digest':
        return text.length <= 14 ? text : text.slice(0, 7 + 7) + E + text.slice(-4);
      default:
        return text.slice(0, max - 1) + E;
    }
  };

  /* ------------------------------------------------------- artifact identity
     The runtime-artifact envelope guarantees only artifact_id and
     artifact_type. `title` is OPTIONAL and `summary` is optional-and-unbounded,
     so the identity line is a COMPUTED field (RAP:L318), and RAP:L314 forbids
     an empty row outright.

     Seven of ten designs bound the row grammar straight to `.title`. With a
     nominal fixture that looked fine; the moment two title-less rows arrived,
     one design threw and stopped rendering entirely and three more emitted a
     blank identity slot. This belongs in the kit for the same reason elision
     and the status vocabulary do: it is one policy, and a version that gets it
     wrong is wrong invisibly.

     Chain: title -> summary -> a kind-derived label carrying the short id.
     The last rung never duplicates a token the row already shows as a glyph,
     a code or a run header, because it carries the ID, not just the kind. */
  K.artifactLabel = function (r) {
    if (!r) return 'Artifact';
    if (r.title && String(r.title).trim()) return String(r.title);
    if (r.summary && String(r.summary).trim()) return String(r.summary);
    var kind = String(r.kind || 'artifact').replace(/_/g, ' ');
    var id = String(r.id || r.artifact_id || '');
    var short = id ? id.slice(-6) : '';
    return short ? kind + ' ' + short : kind;
  };

  /* True when the label had to be computed, so a version can mark it as
     derived rather than presenting a guess as the artifact's own name. */
  K.artifactLabelIsDerived = function (r) {
    return !(r && r.title && String(r.title).trim());
  };

  /* -------------------------------------------------------------- meta run
     Segments DROP whole, right to left, and surface a +N escape. They never
     mid-clip. The separator is a discrete element, never part of a string. */
  /* Rough advance width per character. basic-* is the worst case (Inter 15px
     plus 0.02em tracking); retro is narrowest (Rajdhani is condensed). Used to
     budget slots without measuring, because Slint cannot measure mid-layout
     either -- the port has to make the same decision from numbers. */
  var CH = 6.2;

  K.metaWidth = function (segs) {
    var w = 0;
    (segs || []).forEach(function (s, i) { w += String(s).length * CH + (i ? 6 : 0); });
    return w;
  };

  K.metaRun = function (segments, bucket, opts) {
    opts = opts || {};
    var cap = opts.cap != null ? opts.cap : [2, 3, 4, 99][bucket];
    var segs = (segments || []).filter(Boolean);
    /* A pixel budget as well as a count cap. .pmk-meta is overflow:hidden, so
       busting it is an R1 finding, not a cosmetic one: segments must drop by
       WIDTH, not just by how many the bucket nominally allows. */
    if (opts.maxPx) {
      var w = 0, fit = 0;
      for (var q = 0; q < segs.length && fit < cap; q++) {
        var add = String(segs[q]).length * CH + (q ? 6 : 0);
        if (w + add > opts.maxPx - (segs.length > q + 1 ? 28 : 0)) break;
        w += add; fit++;
      }
      /* No Math.max(1, fit) floor. Forcing one segment to survive when it does
         not fit is what produced the last R1 in the sweep: .pmk-meta is
         overflow:hidden, so the retained segment was HARD-CLIPPED with no
         ellipsis -- invisible truncation, which is precisely the failure this
         primitive exists to prevent. Dropping to zero and showing only the +N
         escape keeps the invariant honest (slots drop WHOLE, never mid-clip)
         and the full run stays one tap away. */
      cap = fit;
    }
    var shown = segs.slice(0, cap), hidden = segs.length - shown.length;
    if (!shown.length && !hidden) return '';
    var h = '<span class="pmk-meta">';
    shown.forEach(function (s, i) {
      if (i) h += '<span class="pmk-meta-sep" aria-hidden="true">·</span>';
      h += '<span class="pmk-meta-seg">' + esc(s) + '</span>';
    });
    h += '</span>';
    if (hidden > 0) {
      h += '<span class="pmk-menu" data-pm-menu>' +
           '<button type="button" class="pmk-meta-more pm-menu-trigger" ' +
           'data-pm-tip="Show the full metadata">+' + hidden + '</button>' +
           '<template data-pm-items>' +
           segs.map(function (s) { return '<div data-value="">' + esc(s) + '</div>'; }).join('') +
           '</template></span>';
    }
    return h;
  };

  /* ------------------------------------------------------------ key/value
     kind: token (<=10 chars) | badge | measure (path/ref/digest) | prose.
     Inline only for token/badge above 280px; stacked otherwise. Hard floor:
     if the inline value would render under 88px it stacks regardless. */
  K.kv = function (key, value, kind, bucket) {
    kind = kind || 'token';
    var inline = (kind === 'token' || kind === 'badge') && bucket >= 1;
    var cls = inline ? 'pmk-kv pmk-kv--inline' : 'pmk-kv pmk-kv--stacked';
    return '<div class="' + cls + '"><span class="pmk-kv-k">' + esc(key) +
           '</span><span class="pmk-kv-v">' + (kind === 'badge' ? value : esc(value)) +
           '</span></div>';
  };

  /* ----------------------------------------------------------------- chip */
  K.chip = function (text, tone, mono) {
    return '<span class="pmk-chip' + (tone ? ' pmk-chip--' + tone : '') +
           (mono ? ' pmk-chip--mono' : '') + '">' + esc(text) + '</span>';
  };

  /* ----------------------------------------------------------- structural */
  /* --------------------------------------------------------- detach grip
     BLIND SPOT 19. FinalGUISpec.md:950 mandates three detach signals, and the
     first one is a header affordance: "Subtle grip icon (6 dots) in panel
     header. Hover tooltip: 'Drag to detach, or double-click to pop out.'"
     Section 5.1 then lists Search, Chat and File Manager as REQUIRED
     detachable surfaces, so this is not decoration on an optional feature.

     It lived nowhere. `K.head` had three slots -- title, count, right -- and
     no version invented a grip, which is the correct outcome: a detach
     affordance is shell furniture, identical in all seven panels, and a
     per-version grip would have been six subtly different ones. So the slot
     goes here and every version gets it for free, exactly like the status
     vocabulary and the elision policy.

     The tooltip string is the spec's own, verbatim, and rides on data-pm-tip
     rather than `title`: the house tooltip is themed, portaled and keyboard
     reachable (it shows on focusin), whereas a native title never speaks to a
     keyboard user at all. The grip is a real 24px tab stop for the same
     reason -- signal 1 of a three-signal discovery system that only a mouse
     can find is one signal, not three. */
  var GRIP_TIP = 'Drag to detach, or double-click to pop out.';
  K.gripTip = GRIP_TIP;

  K.grip = function (opts) {
    opts = opts || {};
    var tip = opts.tip || GRIP_TIP;
    return '<span class="pmk-grip" role="button" tabindex="0" draggable="true"' +
      ' data-pm-grip="' + esc(opts.surface || '') + '"' +
      ' data-pm-tip="' + esc(tip) + '" aria-label="' + esc(tip) + '">' +
      K.icon('grip', 14, 'pmk-grip-ico') + '</span>';
  };

  /** head(title, count, right, opts)
   *  opts: { grip:false to opt out, gripTip, surface }
   *  The fourth argument is additive -- every existing three-argument call
   *  keeps working and simply gains the grip. */
  K.head = function (title, count, right, opts) {
    opts = opts || {};
    var grip = opts.grip === false ? ''
      : K.grip({ tip: opts.gripTip, surface: opts.surface || title });
    return '<div class="pmk-head">' + grip +
      '<span class="pmk-head-title">' + esc(title) + '</span>' +
      (count ? '<span class="pmk-head-count">' + esc(count) + '</span>' : '') +
      (right || '') + '</div>';
  };

  K.section = function (label, count, open) {
    return '<button type="button" class="pmk-sec" aria-expanded="' + (open ? 'true' : 'false') + '">' +
      K.icon('chev', 10, 'pmk-sec-chev') +
      '<span class="pmk-sec-lbl">' + esc(label) + '</span>' +
      (count != null ? '<span class="pmk-sec-n">' + esc(count) + '</span>' : '') +
      '</button>';
  };

  /** The reserved 24px overflow slot. items: [{value,label,hint,danger,
   *  disabled,reason,sentence}] or [{type:'sep'}] / [{type:'head',label}]. */
  K.overflow = function (items, tip) {
    return '<span class="pmk-of pmk-menu" data-pm-menu>' +
      '<button type="button" class="pm-menu-trigger" data-pm-tip="' + esc(tip || 'More actions') + '">' +
      K.icon('dots', 14) + '</button><template data-pm-items>' +
      (items || []).map(function (it) {
        if (it.type === 'sep') return '<div data-sep></div>';
        if (it.type === 'head') return '<div data-head>' + esc(it.label) + '</div>';
        return '<div data-value="' + esc(it.value || '') + '"' +
          (it.hint ? ' data-hint="' + esc(it.hint) + '"' : '') +
          (it.danger ? ' data-danger' : '') +
          (it.disabled ? ' data-disabled' : '') +
          (it.reason ? ' data-reason="' + esc(it.reason) + '"' : '') +
          (it.sentence ? ' data-sentence="' + esc(it.sentence) + '"' : '') +
          '>' + esc(it.label) + '</div>';
      }).join('') + '</template></span>';
  };

  /** Puppet Master combobox. NEVER emit a native <select>. */
  K.select = function (value, options, opts) {
    opts = opts || {};
    return '<span class="pm-select" data-pm-select data-value="' + esc(value) + '"' +
      (opts.style ? ' style="' + opts.style + '"' : '') + '>' +
      '<template data-pm-options>' +
      (options || []).map(function (o) {
        return '<div data-value="' + esc(o.value) + '"' +
          (o.hint ? ' data-hint="' + esc(o.hint) + '"' : '') +
          (o.disabled ? ' data-disabled' : '') +
          (o.reason ? ' data-reason="' + esc(o.reason) + '"' : '') +
          (o.sentence ? ' data-sentence="' + esc(o.sentence) + '"' : '') +
          '>' + esc(o.label) + '</div>';
      }).join('') + '</template></span>';
  };

  /* --------------------------------------------------------- blocked/empty
     The code renders VERBATIM. GI-017 / GAAAF-005 / CRAU-021 all require the
     user learn WHY, visibly -- never via a native title tooltip.

     BLIND SPOT 1, kit half. Two defects lived in the twelve lines this
     replaced.

     1. `severity` was never read. The fixture declares it on every blocked
        payload and the Actions Blocked Reason Table
        (GitHub_Integration.md:L2091-L2099) puts THREE of its seven codes at
        'warning' rather than 'blocked' -- a tier that rendered nowhere in the
        bakeoff, because one component drew every payload at one severity. A
        banner that only knows how to be blocked has no answer for
        actions_rate_limited, and the user cannot tell "you may not" from
        "not right now".

     2. `allowedActionIds[]` became nothing. Twenty-odd payloads across
        Agents, Tests, Actions, Docker, Search and Artifacts carry it; only
        the four that ALSO carry a hand-written `actions:[{id,label}]` ever
        showed a button. So the panel told the user they were blocked and
        withheld the route out, which is the specific failure GI-017 exists to
        prevent. Resolving it here makes the design half of the blind spot a
        data read in one place instead of bespoke markup in six files.

     The severity channels are borrowed from the status vocabulary rather than
     invented, so the banner and the row rail cannot drift: 'blocked' maps to
     D.status.blocked (dashed rail, BAR glyph) and 'warning' to
     D.status.attention (solid rail, TRIANGLE glyph). GI-017 insists those two
     stay distinguishable by shape alone, and here they are also separated by
     the severity word and the border dash -- three non-color channels, where
     the kit's own rule asks for two. */
  var SEV_STATUS = { blocked: 'blocked', warning: 'attention' };

  /** The severity a payload declares, defaulted and validated. A payload with
   *  no severity is ASSUMED blocked -- the conservative read -- and an
   *  unrecognised one says so rather than rendering a confident wrong tier. */
  K.severityOf = function (b) {
    var s = b && b.severity ? String(b.severity) : 'blocked';
    if (!SEV_STATUS[s]) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[PMK] unknown blocked severity "' + s + '" - not blocked|warning');
      }
      return 'blocked';
    }
    return s;
  };

  /** A command id becomes a label: last segment, underscores to spaces,
   *  sentence case. 'github.open_workflow_in_browser' -> 'Open workflow in
   *  browser'. Derived, not invented -- the id IS the fixture's data, and
   *  there is no command catalog in this bakeoff to look a display name up
   *  in (a known gap: neither cmd.docker.pull nor cmd.docker.image.pull is
   *  registered anywhere, per AUDIT-SUMMARY section 3 row 26). An explicit
   *  label always wins over the derivation. */
  K.actionLabel = function (id) {
    var last = String(id == null ? '' : id).split('.').pop().replace(/_/g, ' ').trim();
    if (!last) return String(id == null ? '' : id);
    return last.charAt(0).toUpperCase() + last.slice(1);
  };

  /** The action list a blocked payload authorises, in one order, without
   *  duplicates: labelled actions first (they carry the author's wording),
   *  then every allowedActionId not already covered. `derived` marks the ones
   *  whose label was computed, the same honesty flag artifactLabelIsDerived
   *  provides for titles. */
  K.blockedActions = function (b) {
    if (!b) return [];
    var out = [], seen = {};
    (b.actions || []).forEach(function (a) {
      var id = String(a.id || a.value || '');
      if (id && seen[id]) return;
      if (id) seen[id] = 1;
      out.push({ id: id, label: a.label || K.actionLabel(id), derived: !a.label });
    });
    (b.allowedActionIds || []).forEach(function (id) {
      id = String(id || '');
      if (!id || seen[id]) return;
      seen[id] = 1;
      out.push({ id: id, label: K.actionLabel(id), derived: true });
    });
    return out;
  };

  /** blocked(b, tone, opts)
   *  opts: { actions:false to suppress the button row }
   *  `tone` keeps its old meaning and still wins: 'err' forces the error
   *  colour regardless of severity, so every existing two-argument call
   *  renders exactly as it did. */
  K.blocked = function (b, tone, opts) {
    if (!b) return '';
    opts = opts || {};
    var sev = K.severityOf(b);
    var st = K.statusOf(SEV_STATUS[sev]);
    var dash = (st.rail && st.rail !== 'solid') ? ' pmk-blocked--' + st.rail : '';
    var acts = opts.actions === false ? [] : K.blockedActions(b);
    /* `message` is the Blocked Reason Table's field name and `sentence` is
       GI-017's; both are in the fixture, spelled as their own specs spell
       them, so both are read. */
    var say = b.sentence || b.message || '';
    return '<div class="pmk-blocked pmk-blocked--sev-' + esc(sev) + dash +
      (tone === 'err' ? ' pmk-blocked--err' : '') + '">' +
      '<span class="pmk-blocked-top">' +
        '<span class="pmk-blocked-mark pmk-t-' + esc(st.tone) + '" role="img" ' +
        'aria-label="' + esc(st.label) + '">' +
        K.icon(st.glyph || 'warn', 14, 'pmk-glyph') + '</span>' +
        '<span class="pmk-blocked-code">' + esc(b.code || b.reason) + '</span>' +
        '<span class="pmk-blocked-sev">' + esc(sev) + '</span>' +
      '</span>' +
      (say ? '<span class="pmk-blocked-say">' + esc(say) + '</span>' : '') +
      (acts.length
        ? '<span class="pmk-acts">' + acts.map(function (a) {
            return '<button type="button" class="pmk-btn" data-pm-action="' + esc(a.id) + '"' +
              (a.derived ? ' data-pm-derived' : '') + '>' + esc(a.label) + '</button>';
          }).join('') + '</span>'
        : '') + '</div>';
  };

  /** kind: not-relevant | not-configured | unavailable | no-data | no-results
   *  Five distinct components, not one with variable copy. */
  K.empty = function (kind, title, body, cta) {
    var glyph = { 'no-results': 'search', 'not-configured': 'warn',
                  'unavailable': 'slash', 'no-data': 'info', 'not-relevant': 'info' }[kind] || 'info';
    return '<div class="pmk-empty" data-empty="' + esc(kind) + '">' +
      K.icon(glyph, 20, 'pmk-empty-glyph') +
      '<span class="pmk-empty-t">' + esc(title) + '</span>' +
      (body ? '<span class="pmk-empty-b">' + esc(body) + '</span>' : '') +
      (cta ? '<button type="button" class="pmk-btn">' + esc(cta) + '</button>' : '') +
      '</div>';
  };

  /* ------------------------------------------------------------ lens strip
     F3-445. Below 280px the strip CANNOT hold the items -- Docker has 11
     subviews and 11 x 24px = 264px against a 224px band -- so it collapses to
     a single portaled picker. That is arithmetic, not preference. */
  K.lenses = function (items, active, bucket, label, width) {
    /* Collapse by ARITHMETIC, not by bucket. A 4-lens deck fits at 320px; the
       11-subview Docker deck needs ~560px and never gets it -- not at 320, not
       at 380, not at 480. Gating the collapse on bucket 0 alone therefore left
       lens labels ellipsizing at every other width, which measured as the
       largest single W1 source in three versions. Estimate the strip's real
       width and collapse whenever it exceeds the band. */
    var W = width || BUCKET_W[bucket];
    /* F3-445 sizes tabs 56-180px and permits the strip to SCROLL on overflow
       with labels ellipsizing -- so an ellipsized lens label is spec-compliant
       and lands as a W-tier note, not a defect. Collapse only when the strip
       cannot fit even at the spec's own 56px floor, i.e. when scrolling would
       be the only way to reach a lens at all. Docker's 11 subviews need 616px
       and so collapse at every width; a 4-lens deck fits from 320px up. */
    var n = (items || []).length;
    var need = n * 56 + Math.max(0, n - 1) * 2;
    if (bucket === 0 || need > W - 16) {
      var cur = null;
      items.forEach(function (i) { if (i.id === active) cur = i; });
      return K.select(active, items.map(function (i) {
        return { value: i.id, label: i.label + (i.count ? '  ' + i.count : ''),
                 disabled: i.available === false, reason: i.reason, sentence: i.sentence };
      }), { style: 'flex:1 1 auto;min-width:0' });
    }
    return '<div class="pmk-lenses" role="tablist"' +
      (label ? ' aria-label="' + esc(label) + '"' : '') + '>' +
      items.map(function (i) {
        return '<button type="button" class="pmk-lens" role="tab" ' +
          'aria-selected="' + (i.id === active ? 'true' : 'false') + '"' +
          (i.available === false ? ' aria-disabled="true" data-pm-tip="' +
            esc((i.reason ? i.reason + ' - ' : '') + (i.sentence || '')) + '"' : '') +
          '>' + esc(bucket >= 2 ? i.label : i.label.split(' ')[0]) +
          (i.count && bucket >= 2 ? ' <span class="pmk-sec-n">' + esc(i.count) + '</span>' : '') +
          '</button>';
      }).join('') + '</div>';
  };

  /* ------------------------------------------------------------------ row
     The three invariants that kill the whole bug class. Pass slots; the
     helper enforces which survive at which bucket, so a version author cannot
     accidentally recreate the "chips are rigid, label is compressible" bug.

     opts: { status, id, idKind, idMax, meta[], tail, chip, chipTone,
             actions[], twoLine, sub, bucket, ctx[] } */
  var BUCKET_W = [240, 320, 380, 480];   /* the harness's own test widths */
  var ID_MIN = 96;                       /* the identity floor that outranks everything */
  var W_TIME = 44, W_CHIP = 78;

  K.row = function (o) {
    var b = o.bucket == null ? 2 : o.bucket;

    /* THE DROP RULE, enforced rather than merely documented.
       Emitting tail slots purely by bucket overflows the row whenever the
       fixed slots plus the identity floor exceed the band -- which is exactly
       what happened, and it read as R1/R2 findings on .pmk-row, .pmk-tail,
       .pmk-of and .pmk-meta-seg across four of the six versions.

       Budget in priority order: time survives longest (it appears from bucket
       1), then the chip, then the meta run. A slot is taken only if what
       remains still clears the 96px identity floor. Nothing here elides --
       slots are dropped WHOLE, which is the invariant. */
    var W = o.width || BUCKET_W[b];
    var avail = W - 16 - 8 - (o.status ? 21 : 0) - 24;   /* panel pad, row pad, gutter, overflow */
    var useTime = false, useChip = false, metaPx = 0;

    if (o.tail && b >= 1 && avail - W_TIME >= ID_MIN) { useTime = true; avail -= W_TIME; }
    if (!o.twoLine) {
      if (o.chip && b >= 2 && avail - W_CHIP >= ID_MIN) { useChip = true; avail -= W_CHIP; }
      /* Budget the run against what the identity ACTUALLY needs, not against
         its 96px floor. Budgeting on the floor hands the run everything above
         96px even when the identity is far longer -- a 35-char container name
         takes ~230px -- so the run is over-budgeted, and .pmk-meta being
         overflow:hidden turns that into a silent hard clip. Two version
         authors hit this independently before it was found here. The identity
         is still allowed to yield down to its floor when the run is genuinely
         needed; it simply is not assumed to. */
      if (o.meta && b >= 2) {
        var idNeed = String(o.id == null ? '' : o.id).length * CH;
        if (o.idMax) idNeed = Math.min(idNeed, o.idMax * CH);
        var idTake = Math.max(ID_MIN, Math.min(idNeed, avail - 40));
        if (avail - idTake > 40) metaPx = avail - idTake;
      }
    }

    /* data-pm-row makes the row findable by the list keyboard model without
       coupling that model to a class name a version might restyle; data-pm-key
       is the row's identity, UN-elided, which is what an activation has to
       carry (the visible text may be a computed ellipsis). Defaults to the
       identity so every existing call site becomes activatable without being
       touched. Not an `id` attribute -- panel markup carries none. */
    var rowKey = o.key != null ? o.key : (o.id == null ? '' : o.id);
    var h = '<div class="pmk-row' + (o.twoLine ? ' pmk-row--2line' : '') + '"' +
      ' data-pm-row data-pm-key="' + esc(rowKey) + '"' +
      (o.ctx ? ' data-pm-ctx="Row actions"' : '') + ' tabindex="0" role="button">';
    if (o.status) h += K.statusMark(o.status);
    h += o.twoLine
      ? '<span class="pmk-id-stack"><span>' + esc(K.elide(o.id, o.idKind, o.idMax)) + '</span>' +
        '<span class="pmk-note">' +
          (o.sub || K.metaRun(o.meta, b, { maxPx: W - 16 - 8 - (o.status ? 21 : 0) - 24 })) +
        '</span></span>'
      : '<span class="pmk-id">' + esc(K.elide(o.id, o.idKind, o.idMax)) + '</span>';
    if (metaPx) h += K.metaRun(o.meta, b, { maxPx: metaPx });
    if (useChip) h += K.chip(o.chip, o.chipTone);
    if (useTime) h += '<span class="pmk-tail pmk-tail--time">' + esc(o.tail) + '</span>';
    h += K.overflow(o.actions || [{ value: 'open', label: 'Open' }]);
    if (o.ctx) h += '<template data-pm-items>' + (o.ctx || []).map(function (it) {
      if (it.type === 'sep') return '<div data-sep></div>';
      return '<div data-value="' + esc(it.value || '') + '"' + (it.danger ? ' data-danger' : '') +
        (it.disabled ? ' data-disabled' : '') +
        (it.reason ? ' data-reason="' + esc(it.reason) + '"' : '') +
        (it.sentence ? ' data-sentence="' + esc(it.sentence) + '"' : '') +
        '>' + esc(it.label) + '</div>';
    }).join('') + '</template>';
    return h + '</div>';
  };

  /* ----------------------------------------------------------------- list
     BLIND SPOT 17, markup half. FinalGUISpec.md:2131 requires Up/Down, Enter,
     Escape, Home/End and type-ahead on EVERY list, table and tree. The
     behaviour is mounted by PM.list (see _pm-components.js) and needs no
     wrapper: it groups sibling rows automatically, so the fifteen version
     files get the model without one edit.

     This wrapper is the OPT-IN form, for the case a version wants to name a
     list ("Artifacts, 47 items") or to group rows that are not siblings. It
     carries role="group" rather than role="list", because a listitem may not
     contain a button and every kit row contains its overflow trigger. */
  K.list = function (inner, label) {
    return '<div class="pmk-list" data-pm-list' +
      (label ? ' role="group" aria-label="' + esc(label) + '"' : '') + '>' +
      inner + '</div>';
  };

  /* --------------------------------------------------------------- layout */
  K.panel = function (parts) { return '<div class="pmk-panel">' + parts.join('') + '</div>'; };
  K.strip = function (inner) { return '<div class="pmk-strip">' + inner + '</div>'; };
  K.body  = function (inner, pad) {
    return '<div class="pmk-body' + (pad === false ? '' : ' pmk-pad') + '">' + inner + '</div>';
  };
  K.card  = function (inner) { return '<div class="pmk-card">' + inner + '</div>'; };
  K.btn   = function (label, opts) {
    opts = opts || {};
    return '<button type="button" class="pmk-btn' +
      (opts.primary ? ' pmk-btn--primary' : '') + (opts.danger ? ' pmk-btn--danger' : '') +
      (opts.wide ? ' pmk-btn--w' : '') + '"' +
      (opts.disabled ? ' aria-disabled="true"' : '') +
      (opts.tip ? ' data-pm-tip="' + esc(opts.tip) + '"' : '') +
      '>' + esc(label) + '</button>';
  };
  K.filter = function (placeholder) {
    return '<input class="pmk-field" type="text" placeholder="' + esc(placeholder || 'Filter...') + '">';
  };

  /* Characters that fit the identity slot at a given panel width, per theme
     family. Rough but honest: basic is widest (Inter 15px + 0.02em), retro
     narrowest (Rajdhani is condensed). Use it to pick idMax. */
  K.idChars = function (width, theme, reserved) {
    var band = width - 16 - 21 - 24 - (reserved || 0);   /* padding, gutter, overflow */
    /* Measured, not guessed. 5.4 was ~6% optimistic for Rajdhani at --fs-xs,
       which makes idChars over-report capacity and pushes labels into CSS
       clipping instead of computed elision -- the failure mode this helper
       exists to prevent. */
    var px = /^basic/.test(theme || '') ? 6.6 : /^retro/.test(theme || '') ? 5.75 : 6.2;
    return Math.max(8, Math.floor(band / px));
  };

  global.PMK = K;
})(window);
