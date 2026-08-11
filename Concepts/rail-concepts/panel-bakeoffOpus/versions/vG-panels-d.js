/* PANEL BAKEOFF - vG COZY SHELVES : panels D
   =========================================================================
   OWNS  VG_PANELS.git (GitHub Actions) . VG_PANELS.tests . VG_PANELS.agents

   Composition only. Nothing here decides what the design LOOKS like; every
   class is a `.cz-*` from the markup contract at the top of _pm-cozy.css and
   every piece of arithmetic (elision budgets, bucket, worst-state, tab mode,
   blocked, empty, actions, menus) comes from `window.CZ`.

   The four properties this design was chosen for, and where each is held:
     1. a shelf says WHAT and HOW MANY before it shows data
        -> shelf() refuses to render without a label and always emits the
           count pill. Every shelf below passes a real count from PM_DATA.
     2. a row is identity on line 1, qualification on line 2, ALWAYS
        -> row() always emits `.cz-meta`, even when it is empty, so the
           second line never moves between rows or between panels.
     3. one accent channel per shelf
        -> the 3px `.cz-spine` and nothing else. State is carried a second
           time by GLYPH SHAPE plus an accessible label, never by colour
           alone, and no row sets a colour of its own beyond data-cz-state.
     4. four primitives composed identically in every panel
        -> shelf / row / exrow+body / kv. Three panels, one grammar, no
           fifth shape and not one new class.

   ------------------------------------------------------------------------
   A NOTE ON WHY THIS FILE COMPOSES MARKUP RATHER THAN CALLING CZ.shelf/
   CZ.row/CZ.exRow/CZ.kv/CZ.tabs, BECAUSE IT LOOKS LIKE A DEVIATION AND IT
   IS A DELIBERATE ONE.

   _pm-cozy.css and _pm-cozy.js were written in parallel against the same
   contract and they landed on TWO DIFFERENT SPELLINGS of the same grammar.
   The stylesheet's own markup contract (its header, lines 33-87) names
   .cz-head / .cz-head-main / .cz-head-label / .cz-head-count / .cz-main /
   .cz-name / .cz-meta / .cz-acts / .cz-ex-h / .cz-ex-b / .cz-sum /
   .cz-facts / .cz-detail / .cz-actions / .cz-k / .cz-v. The helper file
   emits .cz-shelf-head / .cz-shelf-label / .cz-shelf-count / .cz-row-band /
   .cz-row-l1 / .cz-row-l2 / .cz-row-acts / .cz-ex-head / .cz-ex-body /
   .cz-body-summary / .cz-kv-k / .cz-kv-v. Not one of the helper's inner
   class names appears in the stylesheet (verified by grep).

   The consequence is not cosmetic. `.cz-row-band` is unstyled, so it is an
   inline box, so `.cz-row-l1` and `.cz-row-l2` render ON THE SAME LINE.
   Calling CZ.row would break property 2 - the headline property - in every
   row of all three panels. The contract says: "If a fix would break one of
   these, the fix is wrong. Say so instead of doing it." So this is said, in
   the returned concerns, and the rows here are composed to the STYLESHEET's
   spelling, which is the one that renders.

   Everything that survives the mismatch still goes through the helper:
     CZ.esc CZ.icon CZ.elide CZ.worst CZ.normState CZ.bucket CZ.tabmode
     CZ.list CZ.blocked CZ.empty CZ.act CZ.menu CZ.humanise CZ.STATE
   and the behaviour layer is untouched: rows are `.cz-row` inside a
   CZ.list host, so CZ.mount's roving tabindex, arrow keys, type-ahead and
   cz:activate work; disclosure headers carry data-cz-act="shelf" / "ex" and
   name their payload `.cz-shelf-body` / `.cz-ex-body` so CZ's delegated
   toggle finds it, while the payload ALSO carries `.cz-body` / `.cz-ex-b`
   so the stylesheet pads it. Both spellings hold at once, on purpose: this
   file keeps working whichever way the mismatch is later resolved.

   The chevron is emitted as a bare `.cz-chev` and NOT as `.cz-shelf-chev`,
   so CZ's glyph swap skips it and the stylesheet's aria-expanded rotation
   is the single source of the open/closed state. Two mechanisms rotating
   the same arrow cancel out.

   ------------------------------------------------------------------------
   HARD RULES OBSERVED
     no emoji (inline SVG only) . no id= (data-cz-* / data-pm-* only) . no
     native <select>, confirm() or title= . no backtick and no dollar-brace
     inside markup strings . no color-mix / backdrop-filter (this file emits
     no CSS at all) . every interactive box >= 24px, which the stylesheet
     enforces on .cz-btn / .cz-ibtn / .cz-row / .cz-tab . width is read from
     cfg on EVERY call and never from module scope . all content from
     _pm-data.js.
   ========================================================================= */

window.VG_PANELS = window.VG_PANELS || {};

(function () {
  'use strict';

  /* CZ is resolved lazily. Script order belongs to the wire agent, and a
     module that captured window.CZ at eval time would degrade silently if it
     ever loaded first. */
  function cz() { return window.CZ; }
  function esc(s) { return cz().esc(s); }
  function ico(n, cls, size) { return cz().icon(n, cls || '', size || 13); }
  function elide(t, kind, n) { return cz().elide(t, kind, n); }

  var CH = 6.4;                      /* px per character, CZ.CH */

  /* ======================= width, bucket, text scale =====================
     THE ONE RULE THIS FILE CANNOT GET WRONG. A previous bug measured every
     width-responsive design against the control bar's width instead of the
     width the panel was actually laid out at, and reported ~1,900 phantom
     failures. Width comes from cfg, every call, no exceptions and no cache.
     `w` is the contract's spelling; `width` is what the shell's own state
     object carries, so both are accepted rather than assuming which one the
     wire agent passes. */
  function W(cfg) {
    cfg = cfg || {};
    var w = cfg.w != null ? cfg.w : (cfg.width != null ? cfg.width : 380);
    w = +w;
    return w > 0 ? w : 380;
  }
  function B(cfg) { return cz().bucket(W(cfg)); }

  function attr(n, v) {
    if (v == null || v === '' || v === false) return '';
    if (v === true) return ' ' + n;
    return ' ' + n + '="' + esc(v) + '"';
  }

  /* ============================== the frame ==============================
     Banner and tabs are flex:none and sit OUTSIDE .cz-scroll, so the panel
     keeps exactly one scroll level however many shelves it holds. */
  function frame(cfg, o) {
    var b = B(cfg);
    return '<div class="cz"' +
      attr('data-cz-text', (cfg && (cfg.czText || cfg.textSize)) || 'normal') +
      ' data-cz-b="' + b + '">' +
      banner(o.ico, o.title, o.acts) +
      (o.tabs || '') +
      '<div class="cz-scroll">' + (o.body || '') + '</div>' +
      (o.foot ? foot(o.foot) : '') +
      '</div>';
  }

  function banner(icon, title, acts) {
    return '<div class="cz-banner">' +
      '<span class="cz-banner-ico">' + ico(icon, '', 12) + '</span>' +
      '<span class="cz-title">' + esc(title) + '</span>' +
      '<span class="cz-banner-acts">' + (acts || '') + '</span>' +
      '</div>';
  }

  function foot(html) {
    return '<div class="cz-foot"><span class="cz-foot-count">' + html + '</span></div>';
  }

  /* ============================== primitive 1: shelf =====================
     Property 1 made structural: no label, no shelf; and the count sits in a
     fixed slot that never gets dropped - the LABEL elides instead, because
     "how many" is half the promise the header makes.

     `state` is the worst state the shelf contains (CZ.worst) unless the
     caller states it. That is the single accent channel: --cz-cat hangs off
     data-cz-state in CSS and nothing inside sets a category colour. */
  function shelf(o) {
    o = o || {};
    var st = o.state ? cz().normState(o.state) : cz().worst(o.items || []);
    var g = cz().STATE[st] || cz().STATE.idle;
    var open = !o.collapsed;
    var count = o.count;
    if (count == null && o.items && o.items.length != null) count = o.items.length;

    return '<section class="cz-shelf"' +
      attr('data-cz-shelf', o.key || o.label) +
      ' data-cz-state="' + esc(st) + '"' +
      ' data-cz-open="' + (open ? '1' : '0') + '">' +
      '<div class="cz-head">' +
        '<button type="button" class="cz-head-main" data-cz-act="shelf"' +
          ' aria-expanded="' + (open ? 'true' : 'false') + '">' +
          ico('chev', 'cz-chev', 10) +
          '<span class="cz-ico cz-ico--cat" role="img" aria-label="' + esc(g.label) + '">' +
            ico(g.icon, '', 13) + '</span>' +
          '<span class="cz-head-label">' + esc(o.label) + '</span>' +
          (count != null ? '<span class="cz-head-count">' + esc(count) + '</span>' : '') +
        '</button>' +
        (o.acts ? '<span class="cz-head-acts">' + o.acts + '</span>' : '') +
      '</div>' +
      '<div class="cz-body cz-shelf-body" data-cz-open="' + (open ? '1' : '0') + '"' +
        (open ? '' : ' hidden style="display:none"') + '>' +
        (o.body || '') +
      '</div></section>';
  }

  /* ============================== primitive 2: row =======================
     Identity on line 1, qualification on line 2, in the same place every
     time. `.cz-meta` is emitted even when it is empty: a row that grows a
     second line only sometimes is a list the eye has to re-scan on every
     item. Exactly one slot grows - `.cz-main` - and it carries the 72px
     name floor from the stylesheet. */
  function row(o) {
    o = o || {};
    var b = o.b == null ? 2 : o.b;
    var st = o.state ? cz().normState(o.state) : null;
    var g = st ? (cz().STATE[st] || cz().STATE.idle) : null;
    var name = elide(o.name, o.nameKind || 'file', o.chars || nameChars(o, b));

    return '<div class="cz-row' + (o.oneLine ? ' cz-row--1line' : '') + '"' +
      ' role="option" tabindex="-1"' +
      ' aria-selected="' + (o.sel ? 'true' : 'false') + '"' +
      ' data-cz-row' +
      attr('data-cz-key', o.key || o.name) +
      attr('data-cz-state', st) +
      attr('data-cz-kind', o.kind) +
      (o.dis ? ' aria-disabled="true"' : '') + '>' +
      '<span class="cz-spine" aria-hidden="true"></span>' +
      (g ? '<span class="cz-ico cz-ico--cat" role="img" aria-label="' +
             esc(o.stateWord || g.label) + '">' + ico(g.icon, '', 12) + '</span>' : '') +
      '<span class="cz-main">' +
        '<span class="cz-name' + (o.mono ? ' cz-name--mono' : '') + '">' + esc(name) + '</span>' +
        (o.oneLine ? '' : metaLine(o.meta, b, o.metaMono)) +
      '</span>' +
      (o.badge ? '<span class="cz-badge">' + esc(o.badge) + '</span>' : '') +
      (o.chip ? chip(o.chip.label != null ? o.chip.label : o.chip, o.chip.mono, o.chip.plain) : '') +
      '<span class="cz-acts">' + (o.acts || '') + '</span>' +
      '</div>';
  }

  /* The identity budget. Pixels are spent by the slots the row ACTUALLY
     carries, never by the bucket alone, and the floor is CZ.NAME_MIN_CH so a
     name can never reach the vanishing point the source tree had. */
  function nameChars(o, b) {
    var w = o.w || cz().BUCKET_W[b] || 380;
    var px = w - 16 - 8 - 3 - 12;            /* panel pad, row pad, spine, gaps */
    if (o.state) px -= 20;                   /* state glyph */
    px -= 26;                                /* action gutter, RESERVED AT REST */
    if (o.chip) px -= 62;
    if (o.badge && b >= 1) px -= 40;
    return Math.max(12, Math.floor(px / CH));
  }

  /* Meta segments drop WHOLE, right to left, and surface a +N escape. Half a
     segment is a lie; a +N is a fact. */
  function metaLine(segs, b, mono) {
    var list = [];
    var i;
    segs = segs || [];
    for (i = 0; i < segs.length; i++) {
      if (segs[i] != null && segs[i] !== '') list.push(String(segs[i]));
    }
    var cls = 'cz-meta' + (mono ? ' cz-meta--mono' : '');
    if (!list.length) return '<span class="' + cls + '"></span>';
    var keep = [1, 2, 3, 4][b] || 3;
    var shown = list.slice(0, keep);
    var drop = list.length - shown.length;
    var h = '';
    for (i = 0; i < shown.length; i++) {
      if (i) h += '<span class="cz-meta-sep" aria-hidden="true">&middot;</span>';
      h += esc(shown[i]);
    }
    if (drop > 0) h += '<span class="cz-meta-sep" aria-hidden="true">&middot;</span>+' + drop;
    return '<span class="' + cls + '">' + h + '</span>';
  }

  /* ======================= primitive 3: expandable row ===================
     THE REFERENCE IMPLEMENTATION. The user named this behaviour explicitly -
     "how the github actions failures show a lot more details when you click
     on them" - so the Actions run row below is the shape every other
     expandable row in these three panels copies.

     The header is a real <button type="button"> with aria-expanded, and the
     payload carries hidden + display:none so it LEAVES THE TAB ORDER. The
     source design had 31 expanders and not one was keyboard-operable.

     Expansion is NOT exclusive: two open runs is a comparison, and an
     accordion forbids it. Row actions live in the payload's actions slot
     rather than beside the header, because a button inside a button is not
     a control, it is a bug - and the stylesheet gives .cz-ex no header row
     to hang a sibling action gutter off. */
  function exrow(o) {
    o = o || {};
    var b = o.b == null ? 2 : o.b;
    var open = !!o.open;
    var st = o.state ? cz().normState(o.state) : null;
    var g = st ? (cz().STATE[st] || cz().STATE.idle) : null;
    var name = elide(o.name, o.nameKind || 'file', o.chars || (nameChars(o, b) - 3));

    return '<div class="cz-ex"' +
      attr('data-cz-key', o.key || o.name) +
      attr('data-cz-state', st) +
      ' data-cz-open="' + (open ? '1' : '0') + '">' +
      '<button type="button" class="cz-ex-h" data-cz-act="ex"' +
        ' aria-expanded="' + (open ? 'true' : 'false') + '">' +
        ico('chev', 'cz-chev', 10) +
        '<span class="cz-spine" aria-hidden="true"></span>' +
        (g ? '<span class="cz-ico cz-ico--cat" role="img" aria-label="' +
               esc(o.stateWord || g.label) + '">' + ico(g.icon, '', 12) + '</span>' : '') +
        '<span class="cz-main">' +
          '<span class="cz-name' + (o.mono ? ' cz-name--mono' : '') + '">' + esc(name) + '</span>' +
          metaLine(o.meta, b, o.metaMono) +
        '</span>' +
        (o.badge ? '<span class="cz-badge">' + esc(o.badge) + '</span>' : '') +
        (o.chip ? chip(o.chip.label != null ? o.chip.label : o.chip, o.chip.mono, o.chip.plain) : '') +
      '</button>' +
      '<div class="cz-ex-b cz-ex-body" data-cz-open="' + (open ? '1' : '0') + '"' +
        (open ? '' : ' hidden style="display:none"') + '>' +
        (o.body || '') +
      '</div></div>';
  }

  /* ======================= primitive 4: body + kv ========================
     Slots in ONE fixed order, every time: summary, facts, detail, actions,
     blocked, overflow. A reader who has opened one row knows where the
     blocked reason is in every other row of every other panel. */
  function body(s) {
    s = s || {};
    var h = '';
    if (s.summary) h += '<div class="cz-sum">' + join(s.summary) + '</div>';
    if (s.facts) h += '<div class="cz-facts">' + join(s.facts) + '</div>';
    if (s.detail) h += '<div class="cz-detail">' + join(s.detail) + '</div>';
    if (s.actions) h += acts(s.actions, s.eq);
    if (s.blocked) h += join(s.blocked);
    if (s.overflow) h += join(s.overflow);
    return h;
  }

  function join(v) {
    return Object.prototype.toString.call(v) === '[object Array]' ? v.join('') : String(v || '');
  }

  function acts(list, eq) {
    var h = join(list);
    if (!h) return '';
    return '<div class="cz-actions' + (eq ? ' cz-actions--eq' : '') + '">' + h + '</div>';
  }

  /* Contract section 4, verbatim, because the bug it replaces cost 234px of
     overlap at the 280px default: below 360px the pair STACKS, and it stacks
     above 360px too whenever the value cannot clear 88px. A stacked value is
     never right-aligned. `prose` always stacks and wraps. */
  function kv(k, v, kind, b, w) {
    kind = kind || 'token';
    var key = String(k == null ? '' : k);
    var inline = false;
    if (kind !== 'prose' && b >= 2) {
      var pad = 24;
      var keyPx = Math.min(key.length * CH + 8, (w - pad) * 0.45);
      inline = (w - pad - keyPx - 8) >= 88;
    }
    return '<div class="cz-kv" data-cz-kv="' + (inline ? 'inline' : 'stacked') + '"' +
      ' data-cz-kind="' + esc(kind) + '">' +
      '<span class="cz-k">' + esc(key) + '</span>' +
      '<span class="cz-v">' + esc(v) + '</span></div>';
  }

  /* ================================ atoms ================================ */
  function chip(label, mono, plain) {
    return '<span class="cz-chip' + (mono ? ' cz-chip--mono' : '') +
      (plain ? ' cz-chip--plain' : '') + '">' + esc(label) + '</span>';
  }
  function note(html, icon) {
    return '<div class="cz-note">' +
      (icon ? '<span class="cz-ico">' + ico(icon, '', 13) + '</span>' : '') +
      '<span>' + html + '</span></div>';
  }
  function detailLines(lines) {
    var h = '', i;
    for (i = 0; i < (lines || []).length; i++) h += '<div>' + esc(lines[i]) + '</div>';
    return h;
  }
  function ibtn(icon, tip, action) {
    return '<button type="button" class="cz-ibtn"' + attr('data-cz-action', action) +
      attr('data-pm-tip', tip) + attr('aria-label', tip) + '>' + ico(icon, '', 12) + '</button>';
  }
  function more(label, action) {
    return '<button type="button" class="cz-more"' + attr('data-cz-action', action) + '>' +
      esc(label) + '</button>';
  }

  /* ================================ tabs =================================
     Count-aware, from CZ.tabmode: labelled >= 72n+24, icons >= 28n+24, else
     the first three icons plus an overflow menu. The active tab is always
     promoted into the visible three - a strip whose current tab is hidden
     inside a menu does not tell you where you are.

     Tab labels use the BODY font at --cz-fs-micro. The display face at 8px
     is what cost Docker 60px of tab width and it is forbidden here. */
  function tabs(items, w, label) {
    var mode = cz().tabmode(items.length, w);
    var css = mode === 'label' ? 'labelled' : (mode === 'icon' ? 'icons' : 'overflow');
    var vis = items, rest = [], i, activeIdx = -1;

    if (mode === 'overflow') {
      for (i = 0; i < items.length; i++) if (items[i].active) activeIdx = i;
      vis = items.slice(0, 3);
      rest = items.slice(3);
      if (activeIdx >= 3) {
        var demoted = vis[2];
        vis = items.slice(0, 2).concat([items[activeIdx]]);
        rest = [demoted];
        for (i = 3; i < items.length; i++) if (i !== activeIdx) rest.push(items[i]);
      }
    }

    var h = '';
    for (i = 0; i < vis.length; i++) {
      var it = vis[i];
      var labelled = css === 'labelled';
      h += '<button type="button" class="cz-tab" role="tab"' +
        ' aria-selected="' + (it.active ? 'true' : 'false') + '"' +
        ' tabindex="' + (it.active ? '0' : '-1') + '"' +
        attr('data-cz-tab', it.id) +
        (labelled ? '' : attr('aria-label', it.label)) +
        attr('data-pm-tip', labelled ? null : it.label +
             (it.count != null ? '  ' + it.count : '')) + '>' +
        '<span class="cz-ico">' + ico(it.icon, '', 15) + '</span>' +
        (labelled ? '<span class="cz-tab-label">' + esc(it.label) +
                    (it.count != null ? ' ' + esc(it.count) : '') + '</span>' : '') +
        '</button>';
    }
    if (rest.length) {
      h += cz().menu(rest.map(function (it) {
        return { value: it.id, label: it.label + (it.count != null ? '  ' + it.count : '') };
      }), { tip: 'More views' });
    }
    return '<div class="cz-tabs" role="tablist" data-cz-tabmode="' + css + '"' +
      attr('aria-label', label || 'Views') + '>' + h + '</div>';
  }

  /* ============================ blocked states ===========================
     Never a toast, never a native title. CZ.blocked renders the reason code
     VERBATIM, one human sentence, and every allowed_action_id as a real
     button. Labels are derived from the id rather than invented, so a code
     the fixture adds tomorrow still renders a sensible button today. */
  function allowed(ids, over) {
    over = over || {};
    return (ids || []).map(function (id, i) {
      var o = over[id] || {};
      return {
        id: id,
        label: o.label || cz().humanise(String(id).split('.').pop()),
        primary: o.primary != null ? o.primary : i === 0,
        danger: !!o.danger,
        confirm: o.confirm,
        tip: id
      };
    });
  }
  function blocked(code, sentence, ids, over) {
    return cz().blocked(code, sentence, allowed(ids, over));
  }

  /* =======================================================================
     PANEL 1 of 3 - GITHUB ACTIONS  (panel id 'git')
     =======================================================================
     research/actions.md. Three STABLE SUBVIEWS - Current Branch, Workflows,
     Settings - not five stacked cards; the stacked-card shape is the primary
     structural defect of the shipped build (PMConcept7.html:15503-15582).

     Because a bakeoff panel is one static string with no state, the inactive
     subviews render as COLLAPSED shelves rather than disappearing: a
     collapsed shelf is one 28px header that still states what it holds and
     how many, so the reviewer can see the whole surface without the
     inactive subviews competing for the column. In the app the switcher
     swaps the body outright.

     The run row's expansion is this file's reference implementation: failing
     job and step, the log excerpt, duration, changed files, the likely next
     action, and Re-run / Re-run failed / Open in GitHub as real buttons. */
  VG_PANELS.git = function (D, cfg) {
    var w = W(cfg), b = B(cfg);
    var A = D.actions, C = A.connection, R = A.readiness, repo = A.repository;
    var caps = repo.capabilities || {};

    /* GI-021, derived rather than matched against a literal. Seven lifecycle
       states ship in repository.lifecycleStates and exactly ONE of them -
       active - leaves mutation alone. The closed capability map outranks the
       umbrella in both directions, so an explicit true grants even on a
       frozen repo and an explicit false denies even on a live one. */
    var frozen = repo.mutationDisabled === true || repo.lifecycle !== 'active';
    function can(v) {
      if (caps[v] === true) return true;
      if (caps[v] === false) return false;
      return !frozen;
    }
    /* L1275: a capability limit shows as EFFECTIVE CAPABILITY STATE, not as
       a hidden control. So a denied action stays VISIBLE and disabled and
       cites the reason; it is never dropped from the markup. */
    function gate(o, verb) {
      if (can(verb)) return o;
      o.disabled = true;
      o.primary = false;
      o.tip = (frozen ? repo.lifecycle : verb) + ' - ' + repo.capabilitySentence;
      return o;
    }
    function gbtn(o, verb) { return cz().act(gate(o, verb)); }

    var runs = A.runs || [];
    var worst = cz().worst(runs.map(function (r) { return r.status; }));
    var i;

    /* ------------------------------------------------------- panel chrome */
    var head = ibtn('refresh', 'Refresh observations', 'actions.validate_dispatch_readiness') +
      cz().menu([
        { value: 'actions.show', label: 'Refresh runs' },
        { value: 'github.actions.open_in_github', label: 'Open in browser' },
        { type: 'sep' },
        gate({ value: 'github.actions.dispatch', label: 'Dispatch workflow',
               hint: A.workflows.length + ' workflows' }, 'dispatch'),
        gate({ value: 'github.actions.settings.open', label: 'Manage secrets',
               hint: A.secrets.length + ' secrets' }, 'manage_secrets'),
        { type: 'sep' },
        { value: 'github.connect', label: 'Reconnect account' },
        { value: 'github.disconnect', label: 'Disconnect', danger: true,
          hint: 'deletes the stored credential' }
      ], { tip: 'Actions options' });

    var tabStrip = tabs([
      { id: 'branch', label: 'Branch', icon: 'branch', active: true },
      { id: 'workflows', label: 'Workflows', icon: 'play', count: A.workflows.length },
      { id: 'settings', label: 'Settings', icon: 'bar', count: A.secrets.length }
    ], w, 'Actions subviews');

    var h = '';

    /* --------------------------------- region 2: account / capability strip
       and region 3: the blocked banner, in one shelf because they are one
       fact - GAAAF-014 makes missing_scopes a blocking condition of THIS
       account, not a footnote beside it. The strip collapses to a single
       chip line while requested === effective; the shelf head carries the
       effective handle and the scope count, so property 1 holds even when
       the body is closed.

       GI-017: the code renders VERBATIM, one human sentence follows, and the
       ordered allowed_action_ids are real buttons. Never a toast and never
       suppressed for space.

       Disconnect is the one destructive action the repository lifecycle does
       NOT gate: an archived repository does not make the stored credential
       less deletable, and disabling the recovery route would strand the user
       on a panel that is otherwise readable. It routes through the shared
       confirm sheet, and the confirmation reads back the Blocked Reason
       Table's own code and message for the state the panel lands in
       afterwards, rather than a consequence invented here. */
    var gone = null;
    for (i = 0; i < A.blockedTable.length; i++) {
      if (A.blockedTable[i].code === 'actions_auth_missing') gone = A.blockedTable[i];
    }

    h += shelf({
      key: 'account', label: 'Account ' + C.effective, count: C.scopes.length,
      state: 'warn',
      body:
        note(chip(C.effective, true) + ' ' + chip(C.state, false, true) + ' ' +
             chip('scopes ' + C.scopes.length, true, true) +
             (C.missingScopes && C.missingScopes.length
               ? ' ' + chip('missing ' + C.missingScopes.join(' '), true) : ''),
             'circle') +
        body({
          facts: [
            kv('Requested', C.requested, 'token', b, w),
            kv('Effective', C.effective, 'token', b, w),
            kv('State', C.state, 'token', b, w),
            kv('Scopes', C.scopes.join(' '), 'token', b, w),
            kv('Missing scopes', C.missingScopes.join(' '), 'token', b, w)
          ],
          actions: [
            cz().act({ id: 'github.connect', label: 'Reconnect', icon: 'refresh',
              primary: true }),
            cz().act({ id: 'github.disconnect', label: 'Disconnect', icon: 'x',
              danger: true,
              confirm: {
                title: 'Disconnect ' + C.account + '?',
                say: 'The stored credential is deleted and the panel returns to ' +
                     (gone ? gone.code + ' - ' + gone.message : 'an unauthenticated state'),
                ok: 'Disconnect'
              } })
          ],
          blocked: blocked(C.blocked.code, C.blocked.sentence, C.blocked.allowedActionIds,
            { 'github.reconnect': { label: 'Reconnect', primary: true } })
        })
    });

    /* GI-021 stated in prose rather than implied by a greyed control. The
       repository is NAMED because project.name is a different repo whose
       lifecycle is active - a bare "archived" would leave the reader
       guessing which of the two it means. */
    h += shelf({
      key: 'repo', label: 'Repository', count: repo.lifecycle,
      state: frozen ? 'warn' : 'ok',
      body:
        body({
          summary: esc(repo.capabilitySentence),
          facts: [
            kv('Repository', elide(repo.nameWithOwner, 'path', b >= 2 ? 40 : 24), 'token', b, w),
            kv('Lifecycle', repo.lifecycle, 'token', b, w),
            kv('Host policy', repo.hostPolicy, 'token', b, w),
            kv('Mutation', repo.mutationDisabled ? 'disabled' : 'allowed', 'token', b, w)
          ],
          detail: detailLines([repo.sentence]),
          actions: [
            gbtn({ id: 'github.actions.dispatch', label: 'Dispatch', icon: 'play' }, 'dispatch'),
            gbtn({ id: 'github.actions.settings.open', label: 'Secrets', icon: 'bar' }, 'manage_secrets')
          ],
          eq: b >= 1
        })
    });

    /* ============================== SUBVIEW: CURRENT BRANCH ============== */
    var runBodies = '';
    for (i = 0; i < runs.length; i++) runBodies += runRow(runs[i], b, w, can, repo);

    h += shelf({
      key: 'runs',
      label: 'Runs ' + R.branch,
      count: A.paging.runs.shown,
      state: worst,
      acts: cz().menu([
        { value: 'actions.filter.all', label: 'All runs' },
        { value: 'actions.filter.failed', label: 'Failed only' },
        { value: 'actions.filter.running', label: 'Running only' },
        { value: 'actions.filter.success', label: 'Successful only' },
        { type: 'sep' },
        { value: 'actions.filter.blocked', label: 'Blocked', disabled: true,
          reason: 'filter_status_vocabulary_gap',
          sentence: 'storage filter_status is all|failed|running|success and cannot express blocked.' }
      ], { tip: 'Run filter' }),
      body:
        note(metaLineText([R.branch, R.green + ' of ' + R.of + ' green',
                           R.snapshot, R.age]), 'clock') +
        runBodies +
        more('Load older runs  ' + A.paging.runs.shown + ' of ' + A.paging.runs.total,
             'actions.load_older')
    });

    /* ============================== SUBVIEW: WORKFLOWS =================== */
    var pinnedRows = '';
    for (i = 0; i < A.pinned.length; i++) {
      var p = A.pinned[i];
      pinnedRows += row({
        b: b, w: w, key: 'pin-' + p.run + '-' + p.name, name: p.name,
        nameKind: 'default', state: p.status,
        stateWord: p.status,
        chip: { label: p.badge, plain: true },
        meta: [p.run, p.status, p.branch, p.age,
               p.blocked ? p.blocked.code : null],
        acts: cz().menu([
          { value: 'github.actions.open_run', label: 'Open run ' + p.run },
          { value: 'github.actions.unpin', label: 'Unpin workflow' },
          { type: 'sep' },
          gate({ value: 'actions.rerun', label: 'Re-run' }, 'rerun')
        ], { tip: 'Pinned workflow actions' })
      });
    }

    var wfRows = '';
    for (i = 0; i < A.workflows.length; i++) {
      var wf = A.workflows[i];
      wfRows += row({
        b: b, w: w, key: 'wf-' + wf.file, name: wf.name, nameKind: 'default',
        state: 'idle', stateWord: 'Not dispatchable',
        meta: [elide(wf.file, 'path', b >= 2 ? 34 : 22)],
        metaMono: true,
        acts: cz().menu([
          { value: 'github.actions.dispatch', label: 'Dispatch', disabled: true,
            reason: 'actions_workflow_not_dispatchable',
            sentence: 'This workflow declares no workflow_dispatch trigger.' },
          { value: 'github.actions.pin', label: 'Pin workflow' },
          { value: 'github.actions.open_in_github', label: 'Open in GitHub' }
        ], { tip: 'Workflow actions' })
      });
    }

    h += shelf({
      key: 'pinned', label: 'Pinned workflows', count: A.pinned.length,
      collapsed: true,
      state: cz().worst(A.pinned.map(function (x) { return x.status; })),
      body: cz().list(pinnedRows, { label: 'Pinned workflows', key: 'pinned' })
    });
    h += shelf({
      key: 'workflows', label: 'All workflows', count: A.workflows.length,
      collapsed: true, state: 'idle',
      body: cz().list(wfRows, { label: 'Workflows', key: 'workflows' }) +
        note('No workflow in this repository declares workflow_dispatch, so ' +
             'Dispatch is disabled on every row with the reason stated rather ' +
             'than the control hidden.', 'info')
    });

    /* ============================== SUBVIEW: SETTINGS ==================== */
    var secretRows = '';
    for (i = 0; i < A.secrets.length; i++) {
      var s = A.secrets[i];
      secretRows += row({
        b: b, w: w, key: 'sec-' + s.name, name: s.name, mono: true, nameKind: 'default',
        state: s.present ? 'ok' : 'warn',
        stateWord: s.present ? 'Present' : 'Missing',
        meta: [s.scope, s.present ? 'present' : 'missing'],
        acts: cz().menu([
          { value: 'github.actions.settings.open', label: 'Open in GitHub' },
          { value: 'github.actions.settings.open', label: 'Add value',
            disabled: !can('manage_secrets'),
            reason: frozen ? repo.lifecycle : 'manage_secrets',
            sentence: repo.capabilitySentence }
        ], { tip: 'Secret actions' })
      });
    }

    /* The Actions Blocked Reason Table, all seven codes, each with the
       severity and retryability the spec assigns and its EXACT user message.
       Three of the seven are warning rather than blocked - a severity tier
       that had never rendered anywhere in this bakeoff, and a banner that
       only knows how to be red has no answer for them. */
    var tableRows = '';
    for (i = 0; i < A.blockedTable.length; i++) {
      var t = A.blockedTable[i];
      tableRows += exrow({
        b: b, w: w, key: 'brt-' + t.code, name: t.code, mono: true, nameKind: 'default',
        state: t.severity === 'blocked' ? 'err' : 'warn',
        stateWord: t.severity,
        meta: [t.severity, t.retryable ? 'retryable' : 'not retryable'],
        body: body({
          summary: esc(t.message),
          facts: [
            kv('Severity', t.severity, 'token', b, w),
            kv('Retryable', t.retryable ? 'yes' : 'no', 'token', b, w),
            kv('Message length', t.chars + ' chars', 'measure', b, w)
          ],
          actions: allowed(t.allowedActionIds).map(function (a) { return cz().act(a); })
        })
      });
    }

    var readyRows = '';
    for (i = 0; i < A.readinessCodes.length; i++) {
      var rc = A.readinessCodes[i];
      readyRows += row({
        b: b, w: w, key: 'rc-' + rc, name: rc, mono: true, nameKind: 'default',
        state: rc === C.blocked.code ? 'warn' : 'idle',
        stateWord: rc === C.blocked.code ? 'Active now' : 'Not active',
        meta: rc === C.blocked.code ? ['active on this panel'] : []
      });
    }

    h += shelf({
      key: 'secrets', label: 'Secrets', count: A.secrets.length, collapsed: true,
      state: cz().worst(A.secrets.map(function (x) { return x.present ? 'ok' : 'warn'; })),
      body: note('Names only. Values are never read by this panel.', 'info') +
        cz().list(secretRows, { label: 'Secrets', key: 'secrets' })
    });
    h += shelf({
      key: 'brt', label: 'Blocked reason table', count: A.blockedTable.length,
      collapsed: true, state: 'warn',
      body: note('GitHub_Integration.md L2091-L2099. The message strings are ' +
                 'the spec copy and are not paraphrasable.', 'info') + tableRows
    });
    h += shelf({
      key: 'gi017', label: 'Readiness codes', count: A.readinessCodes.length,
      collapsed: true, state: 'idle',
      body: note('GI-017. These are actions_* details layered onto shared ' +
                 'blocked metadata; they do not redefine blocked_reason_code. ' +
                 'This vocabulary and the table above share exactly one code.',
                 'info') +
        cz().list(readyRows, { label: 'Readiness codes', key: 'gi017' })
    });

    return frame(cfg, {
      ico: 'play', title: 'GitHub Actions', acts: head, tabs: tabStrip, body: h,
      foot: '<b>' + A.paging.runs.shown + '</b> of ' + A.paging.runs.total +
            ' runs &middot; ' + A.workflows.length + ' workflows &middot; ' +
            A.secrets.length + ' secrets'
    });
  };

  /* Plain-text meta run for a note line (no row band, so no drop rule). */
  function metaLineText(segs) {
    var out = [], i;
    for (i = 0; i < segs.length; i++) if (segs[i] != null && segs[i] !== '') out.push(esc(segs[i]));
    return out.join('<span class="cz-meta-sep" aria-hidden="true">&middot;</span>');
  }

  /* ------------------------------------------------------------- one run row
     THE REFERENCE EXPANSION. Everything the triage capsule owes the reader
     is here and nothing that belongs to the routed run-detail page is:
       summary  the failing job and step in a sentence, plus likely-next
       facts    run, branch, duration, age, spec status, changed-file count
       detail   the log excerpt, one line per div, mono, never wrapped
       actions  Re-run / Re-run failed jobs / Cancel / Open in GitHub /
                Compare last success, each gated by the repo capability
       blocked  CZ.blocked with the reason code verbatim and the ordered
                allowed_action_ids as real buttons
       overflow the routes OUT - step logs and job detail belong to the
                bottom runtime zone, never to a 224px column
     Level 3 - steps - is deliberately not a panel level. */
  function runRow(r, b, w, can, repo) {
    var word = r.specStatus || r.status;
    var st = cz().normState(r.status);
    var open = !!(r.triage && r.status === 'failed' && r.run === '#310');

    var sum = '';
    if (r.triage) {
      sum = 'Failed in job ' + esc(r.triage.job) + ' at step ' + esc(r.triage.step) + '. ' +
            esc(r.triage.likelyNext);
    } else if (r.status === 'cancelled') {
      sum = esc(r.detail || 'Cancelled.') +
            (r.receiptsRetained ? ' Receipts are retained; cancelling deletes none.' : '');
    } else if (r.detail) {
      sum = esc(r.detail);
    }

    var facts = [
      kv('Run', r.run, 'token', b, w),
      kv('Status', word, 'token', b, w),
      kv('Branch', elide(r.branch, 'path', b >= 2 ? 30 : 20), 'token', b, w),
      kv('Duration', r.dur, 'measure', b, w),
      kv('Age', r.age, 'measure', b, w)
    ];
    if (r.triage) {
      facts.push(kv('Failing job', r.triage.job, 'token', b, w));
      facts.push(kv('Failing step', r.triage.step, 'token', b, w));
      facts.push(kv('Changed files', String(r.triage.changedCount), 'measure', b, w));
    }
    if (r.cancelledBy) facts.push(kv('Cancelled by', r.cancelledBy, 'token', b, w));
    if (r.blocked) {
      facts.push(kv('Severity', r.blocked.severity, 'token', b, w));
      facts.push(kv('Retryable', r.blocked.retryable ? 'yes' : 'no', 'token', b, w));
    }

    var det = '';
    if (r.triage) {
      det = detailLines(r.triage.lines) +
            detailLines(r.triage.changedFiles.map(function (f) { return '~ ' + f; }));
    }

    var actions = [];
    actions.push(cz().act(gateAct({ id: 'actions.rerun', label: 'Re-run', icon: 'refresh',
      primary: true }, can('rerun'), repo)));
    if (r.triage) {
      actions.push(cz().act(gateAct({ id: 'actions.rerun_failed', label: 'Re-run failed',
        icon: 'refresh' }, can('rerun'), repo)));
    }
    if (r.status === 'running') {
      actions.push(cz().act(gateAct({ id: 'actions.cancel', label: 'Cancel', icon: 'stop',
        danger: true,
        confirm: { title: 'Cancel run ' + r.run + '?',
                   say: 'The run stops where it is. Receipts already written are kept.',
                   ok: 'Cancel run' } }, can('cancel'), repo)));
    }
    actions.push(cz().act({ id: 'github.actions.open_in_github', label: 'Open in GitHub',
      icon: 'ext' }));
    if (r.status !== 'running' && r.status !== 'queued') {
      actions.push(cz().act({ id: 'github.actions.compare_last_success',
        label: 'Compare last success', icon: 'branch' }));
    }

    var over = cz().menu([
      { value: 'github.actions.open_run', label: 'Open run detail' },
      { value: 'github.actions.open_job', label: 'Open failing job',
        disabled: !r.triage, reason: 'no_failed_jobs',
        sentence: 'This run has no failing job to open.' },
      { value: 'github.actions.open_step_logs', label: 'Open step logs',
        hint: 'routes to the bottom runtime zone' },
      { type: 'sep' },
      { value: 'github.actions.open_related_diff', label: 'Open related diff',
        disabled: !r.triage, reason: 'related_diff_unavailable',
        sentence: 'No related diff is projected for this run.' },
      { value: 'github.actions.open_related_worktree', label: 'Open related worktree' },
      { value: 'github.actions.open_run_in_browser', label: 'Open run in browser' }
    ], { tip: 'Run ' + r.run + ' routes' });

    return exrow({
      b: b, w: w, open: open, key: 'run-' + r.name + '-' + r.run,
      name: r.name, nameKind: 'default', state: st, stateWord: word,
      meta: [r.run, word, elide(r.branch, 'path', 22), r.age, r.dur],
      body: body({
        summary: sum,
        facts: facts,
        detail: det,
        actions: actions,
        blocked: r.blocked
          ? blocked(r.blocked.code, r.blocked.sentence, r.blocked.allowedActionIds)
          : '',
        overflow: over
      })
    });
  }

  function gateAct(o, ok, repo) {
    if (ok) return o;
    o.disabled = true;
    o.primary = false;
    o.danger = false;
    o.confirm = null;
    o.tip = repo.lifecycle + ' - ' + repo.capabilitySentence;
    return o;
  }

  /* =======================================================================
     PANEL 2 of 3 - TESTING  (panel id 'tests')
     =======================================================================
     research/tests.md. The five region names are CONTRACTUAL and are spelled
     in the shelf keys below so a reviewer can grep for them:
       run_list . active_run_detail . failure_list . artifact_preview .
       redaction_notice
     plus the derived capability_header, which is the only place the
     runtime-disabled reason can render.

     redaction_notice renders ABOVE artifact_preview because it is a GATE and
     not a footnote, and it is NOT DISMISSIBLE while redaction_failed holds -
     dismissal implies the user saw the artifact, which is the exact thing the
     gate is preventing. */
  VG_PANELS.tests = function (D, cfg) {
    var w = W(cfg), b = B(cfg);
    var T = D.tests, A = T.active, RT = T.runtime;
    var i;

    /* ------------------------------------------- the runtime-disabled gate
       DERIVED, so flipping tests.runtime.enabled to false in the fixture
       replaces the whole body with one reason line and one action, with no
       second edit here. Per the brief: do NOT show an empty run list on a
       disabled panel. Enablement is per adapter, so the adapter is named. */
    var runtimeOff = RT.enabled !== true || RT.probe !== 'available';
    if (runtimeOff) {
      return frame(cfg, {
        ico: 'check', title: 'Testing',
        acts: cz().menu([{ value: 'testing.open_settings', label: 'Open Settings' }],
                        { tip: 'Testing options' }),
        body: blocked('testing_runtime_disabled_for_adapter',
          'Testing is disabled for adapter ' + RT.adapter +
          '. The capability probe reported ' + RT.probe + '.',
          ['testing.configure_adapter', 'testing.request_authority', 'testing.open_settings']),
        foot: 'runtime disabled &middot; adapter <b>' + esc(RT.adapter) + '</b>'
      });
    }

    var head = ibtn('refresh', 'Refresh receipts', 'testing.refresh') +
      cz().menu([
        { value: 'testing.capability_policy.set', label: 'Capability policy',
          hint: 'read-only projection of Settings' },
        { value: 'testing.visibility_policy.set', label: 'Visibility policy',
          hint: T.policy.visibility },
        { type: 'sep' },
        { value: 'testing.session.open', label: 'Open visible session' },
        { value: 'testing.session.watch', label: 'Watch visible session' },
        { value: 'testing.session.background', label: 'Background session' },
        { type: 'sep' },
        { value: 'testing.session.redaction.inspect', label: 'Inspect redaction profile' },
        { value: 'testing.export_bundle', label: 'Export bundle',
          hint: 'egress - confirm plus redaction attestation' }
      ], { tip: 'Testing options' });

    var h = '';

    /* --------------------------------------- region 0: capability_header
       The visibility policy token leads because it is the policy the
       capability rows are PROJECTED THROUGH: show_when_possible is why a
       blocked capability is still visible and greyed rather than absent. */
    h += note(
      chip(RT.adapter, true) + ' ' + chip('probe ' + RT.probe, false, true) + ' ' +
      chip(T.policy.visibility, true, true), 'circle');

    /* The Run precondition set. Run is the P0 32px control in this panel and
       it is DISABLED here, so the unmet gate is stated on screen rather than
       hidden in a tooltip. One unmet gate is enough to block. */
    var unmet = [];
    for (i = 0; i < T.runPreconditions.length; i++) {
      if (!T.runPreconditions[i].met) unmet.push(T.runPreconditions[i]);
    }
    var preRows = '';
    for (i = 0; i < T.runPreconditions.length; i++) {
      var pc = T.runPreconditions[i];
      preRows += row({
        b: b, w: w, key: 'pre-' + pc.id, name: pc.label, nameKind: 'default',
        state: pc.met ? 'ok' : 'warn', stateWord: pc.met ? 'Met' : 'Not met',
        meta: [pc.id, pc.met ? 'met' : 'not met', pc.sentence]
      });
    }

    h += shelf({
      key: 'run_gate', label: 'Run', count: (T.runPreconditions.length - unmet.length) +
        ' of ' + T.runPreconditions.length,
      state: unmet.length ? 'warn' : 'ok',
      body: body({
        actions: [cz().act({
          id: 'testing.run', label: 'Run tests', icon: 'play', primary: true,
          disabled: unmet.length > 0,
          tip: unmet.length ? unmet[0].id + ' - ' + unmet[0].sentence : 'Run ' + RT.adapter
        })],
        blocked: unmet.length
          ? blocked(unmet[0].id, unmet[0].sentence,
              ['testing.cancel_run', 'testing.watch_run'],
              { 'testing.cancel_run': { label: 'Cancel run ' + inFlightId(T),
                  danger: true,
                  confirm: { title: 'Cancel the run in flight?',
                             say: 'The run lands as cancelled. It deletes no receipts.',
                             ok: 'Cancel run' } } })
          : ''
      }) + cz().list(preRows, { label: 'Run preconditions', key: 'run_gate' })
    });

    /* Capability families. Auto / On / Off plus the three projections, and
       Off is NEVER rendered as a green pass: an Off family does not count as
       successful verification. Each blocked or degraded family carries its
       reason code verbatim - this is also where PER-ADAPTER disablement
       shows, which is the granularity the spec actually uses. */
    var capRows = '';
    for (i = 0; i < T.policy.capabilities.length; i++) {
      var c = T.policy.capabilities[i];
      var cst = c.state === 'ok' ? (c.mode === 'off' ? 'idle' : 'ok')
        : (c.state === 'prohibited' || c.state === 'disabled' ? 'idle' : cz().normState(c.state));
      capRows += c.reason
        ? exrow({
            b: b, w: w, key: 'cap-' + c.id, name: c.label, nameKind: 'default',
            state: cst, stateWord: c.state,
            chip: { label: c.mode, plain: true },
            meta: [c.state, c.mode, c.reason],
            body: body({
              summary: esc(c.sentence),
              facts: [
                kv('Mode', c.mode, 'token', b, w),
                kv('Projection', c.state, 'token', b, w),
                kv('Reason', c.reason, 'token', b, w)
              ],
              blocked: c.state === 'disabled'
                ? cz().empty('not-configured', c.sentence,
                    { title: 'No adapter for ' + c.label,
                      cta: 'Configure adapter', ctaId: 'testing.configure_adapter' })
                : blocked(c.reason, c.sentence,
                    c.state === 'prohibited'
                      ? ['testing.open_policy']
                      : ['testing.request_authority', 'testing.open_policy'])
            })
          })
        : row({
            b: b, w: w, key: 'cap-' + c.id, name: c.label, nameKind: 'default',
            state: cst, stateWord: c.state,
            chip: { label: c.mode, plain: true },
            meta: [c.state, c.mode]
          });
    }
    h += shelf({
      key: 'capabilities', label: 'Capabilities', count: T.policy.capabilities.length,
      state: cz().worst(T.policy.capabilities.map(function (c) { return c.state; })),
      body: note('Read-only projection of Settings-owned policy. This panel ' +
                 'displays and routes; it does not define test semantics.', 'info') +
        capRows
    });

    /* ------------------------------------------------- region 1: run_list
       Reverse-chronological receipts. specStatus is rendered as the WORD
       because the spec marks the seven tokens exact and not paraphrasable;
       status stays the glyph and spine channel. blocked, cancelled and
       inconclusive are distinct from failed and none of them collapses into
       a red chip: blocked routes to an authority action, inconclusive routes
       to the receipt, cancelled deletes no receipts at all. */
    var runRows = '';
    for (i = 0; i < T.runs.length; i++) runRows += testRun(T.runs[i], b, w, T);

    h += shelf({
      key: 'run_list', label: 'Run list', count: T.paging.runs.shown,
      state: cz().worst(T.runs.map(function (r) { return r.status; })),
      body: runRows +
        more('Load older runs  ' + T.paging.runs.shown + ' of ' + T.paging.runs.total,
             'testing.load_older')
    });

    /* ------------------------------------- region 2: active_run_detail */
    var pct = Math.round((A.done / A.total) * 100);
    h += shelf({
      key: 'active_run_detail', label: 'Active run', count: A.done + '/' + A.total,
      state: A.status,
      body: body({
        summary: esc(A.name) + ' &mdash; ' + esc(A.status) + ', ' + pct + '% complete.',
        facts: [
          kv('Adapter', RT.adapter, 'token', b, w),
          kv('Lane', A.lane, 'token', b, w),
          kv('Retry', A.retry, 'token', b, w),
          kv('Elapsed', A.elapsed, 'measure', b, w),
          kv('Passed', String(A.passed), 'measure', b, w),
          kv('Failed', String(A.failed), 'measure', b, w),
          kv('Skipped', String(A.skipped), 'measure', b, w)
        ],
        /* Contextual PAIR, never four buttons at 240px. Watch and Cancel
           while live; Open receipt and Export only once terminal. */
        actions: [
          cz().act({ id: 'testing.watch_run', label: 'Watch', icon: 'play', primary: true }),
          cz().act({ id: 'testing.cancel_run', label: 'Cancel', icon: 'stop', danger: true,
            confirm: { title: 'Cancel this run?',
                       say: 'The run lands as cancelled. It deletes no receipts and the ' +
                            'partial results stay readable.',
                       ok: 'Cancel run' } }),
          b >= 2 ? cz().act({ id: 'testing.open_receipt', label: 'Receipt', icon: 'ext',
            disabled: true, tip: 'run_status_terminal - this run is still running' }) : '',
          b >= 2 ? cz().act({ id: 'testing.export_bundle', label: 'Export', icon: 'ext',
            disabled: true, tip: 'run_status_terminal - this run is still running' }) : ''
        ],
        eq: b >= 2
      })
    });

    /* --------------------------------------------- region 3: failure_list */
    var failRows = '';
    for (i = 0; i < T.failures.length; i++) {
      var f = T.failures[i];
      failRows += exrow({
        b: b, w: w, key: 'fail-' + f.test, name: f.test, mono: true, nameKind: 'default',
        state: 'err', stateWord: 'Failed',
        meta: [f.test.split('::')[0], f.chars + ' chars'],
        body: body({
          detail: detailLines([f.message]),
          actions: [
            cz().act({ id: 'testing.open_failure', label: 'Open failure', icon: 'ext',
              primary: true }),
            cz().act({ id: 'testing.open_receipt', label: 'Receipt', icon: 'ext' })
          ]
        })
      });
    }
    h += shelf({
      key: 'failure_list', label: 'Failure list', count: T.paging.failures.shown,
      state: T.failures.length ? 'err' : 'ok',
      body: T.failures.length
        ? failRows
        : cz().empty('no-data', 'This run reported no failures.',
            { title: 'No failures' })
    });

    /* ------------------------------------------ region 5: redaction_notice
       ABOVE region 4, because it is a gate. Three states, not two:
       redaction_clean renders, redaction_pending renders a PLACEHOLDER and
       never the raw asset, redaction_failed SUPPRESSES the preview and takes
       the region with the blocking reason and an authorize route.

       The live gate is clean. Run 209 carries redactionState
       redaction_failed and tests.redactionFailed names it, the two artifacts
       it blocks, and the fact that it is NOT dismissible - so the failed
       state is rendered from the fixture rather than invented, and the two
       named artifacts are suppressed in region 4 below. */
    var RF = T.redactionFailed;
    var suppressed = {};
    for (i = 0; i < RF.affectedArtifacts.length; i++) suppressed[RF.affectedArtifacts[i]] = true;

    var stateRows = '';
    for (i = 0; i < T.redactionStates.length; i++) {
      var rs = T.redactionStates[i];
      stateRows += row({
        b: b, w: w, key: 'rs-' + rs.id, name: rs.id, mono: true, nameKind: 'default',
        state: rs.id === 'redaction_failed' ? 'err'
          : (rs.id === 'redaction_pending' ? 'run' : 'ok'),
        stateWord: rs.id,
        meta: ['preview ' + rs.preview, rs.dismissible ? 'dismissible' : 'not dismissible'],
        sel: rs.id === RF.state
      });
    }

    h += shelf({
      key: 'redaction_notice', label: 'Redaction notice', count: RF.failed + '/' + RF.attempted,
      state: 'err',
      body: body({
        summary: esc(RF.sentence),
        facts: [
          kv('State', RF.state, 'token', b, w),
          kv('Profile', RF.profileId, 'token', b, w),
          kv('Fields', RF.failed + ' failed of ' + RF.attempted, 'measure', b, w),
          kv('Affected run', RF.affectedRunId, 'token', b, w),
          kv('Blocks', RF.blocks.join(' '), 'token', b, w),
          kv('Dismissible', RF.dismissible ? 'yes' : 'no', 'token', b, w),
          kv('Detail', RF.detail, 'prose', b, w)
        ],
        blocked: blocked(RF.reason, RF.sentence, RF.allowedActionIds, {
          'testing.retry_redaction': { label: 'Retry redaction', primary: true },
          'testing.authorize_unredacted': {
            label: RF.authorize.label, danger: true,
            confirm: { title: RF.authorize.label + '?',
                       say: 'Unredacted display shows secrets and personal data that the ' +
                            'profile failed to mask. This is an owning-policy decision and ' +
                            'it is recorded.',
                       ok: 'Authorize' } }
        })
      }) +
        note('The live gate for the selected run is clean: ' +
             esc(T.redaction.note) + '.', 'info') +
        cz().list(stateRows, { label: 'Redaction states', key: 'redaction_states' })
    });

    /* ------------------------------------------ region 4: artifact_preview
       Post-redaction only. The two artifacts named by redactionFailed render
       SUPPRESSED - no preview, no thumbnail, the reason stated - and the
       rest render normally. There is no optimistic render and no blur-then-
       sharpen affordance anywhere in this region: that is a silent
       downgrade and the spec forbids it. */
    var artRows = '';
    for (i = 0; i < T.artifacts.length; i++) {
      var a = T.artifacts[i];
      var gone = suppressed[a.name] === true;
      artRows += row({
        b: b, w: w, key: 'art-' + a.name, name: a.name, mono: true, nameKind: 'file',
        state: gone ? 'err' : 'ok',
        stateWord: gone ? 'Preview blocked' : 'Redacted, safe to display',
        chip: { label: a.size.replace(/^\s+/, ''), mono: true, plain: true },
        /* The size is the chip, so it is NOT repeated in the meta run: two
           encodings of one fact spend the scarcest line in the panel twice. */
        meta: gone ? ['preview suppressed', RF.reason] : [a.kind],
        acts: cz().menu(gone
          ? [{ value: 'testing.session.redaction.inspect', label: 'Inspect redaction' },
             { value: 'testing.open_receipt', label: 'Open receipt' }]
          : [{ value: 'testing.open_receipt', label: 'Open receipt' },
             { value: 'testing.export_bundle', label: 'Export bundle',
               hint: 'egress - confirm plus attestation' }],
          { tip: 'Artifact actions' })
      });
    }
    h += shelf({
      key: 'artifact_preview', label: 'Artifact preview', count: T.artifacts.length,
      state: 'warn',
      body: note('2 of ' + T.artifacts.length + ' previews are suppressed by ' +
                 esc(RF.reason) + '. Suppressed rows show identity only.', 'slash') +
        cz().list(artRows, { label: 'Artifacts', key: 'artifact_preview' })
    });

    return frame(cfg, {
      ico: 'check', title: 'Testing', acts: head, body: h,
      foot: '<b>' + T.paging.runs.shown + '</b> of ' + T.paging.runs.total +
            ' runs &middot; ' + T.failures.length + ' failures &middot; ' +
            T.artifacts.length + ' artifacts'
    });
  };

  /* The run the no_run_in_flight precondition is talking about. Read from the
     run list rather than parsed out of the active run's display name, because
     "cargo" is a word in that name and not a run identity. */
  function inFlightId(T) {
    var i;
    for (i = 0; i < T.runs.length; i++) {
      if (T.runs[i].status === 'running' || T.runs[i].status === 'queued') return T.runs[i].id;
    }
    return '';
  }

  /* One run_list row. The receipt payload lives in the expansion so the list
     stays scannable, and every non-nominal status states its own reason. */
  function testRun(r, b, w, T) {
    var word = r.specStatus || r.status;
    var st = cz().normState(r.status);
    var open = r.status === 'running';
    var redacted = r.redactionState === 'redaction_failed';

    var facts = [
      kv('Run', r.id, 'token', b, w),
      kv('Status', word, 'token', b, w),
      kv('Age', r.when, 'measure', b, w)
    ];
    if (r.detail) facts.push(kv('Detail', r.detail, 'prose', b, w));
    if (r.receiptId) facts.push(kv('Receipt', r.receiptId, 'token', b, w));
    if (r.cancelledBy) facts.push(kv('Cancelled by', r.cancelledBy, 'token', b, w));
    if (r.receiptRetained) facts.push(kv('Receipt retained', 'yes', 'token', b, w));
    if (redacted) facts.push(kv('Redaction', r.redactionState, 'token', b, w));

    var actions = [];
    var terminal = r.status !== 'running' && r.status !== 'queued';
    if (!terminal) {
      actions.push(cz().act({ id: 'testing.watch_run', label: 'Watch', icon: 'play',
        primary: true }));
      actions.push(cz().act({ id: 'testing.cancel_run', label: 'Cancel', icon: 'stop',
        danger: true,
        confirm: { title: 'Cancel run ' + r.id + '?',
                   say: 'It lands as cancelled and deletes no receipts.',
                   ok: 'Cancel run' } }));
    } else {
      actions.push(cz().act({ id: 'testing.open_receipt', label: 'Receipt', icon: 'ext',
        primary: true }));
      actions.push(cz().act({ id: 'testing.export_bundle', label: 'Export', icon: 'ext',
        tip: 'egress - confirm plus redaction attestation' }));
    }

    var bl = '';
    if (r.reason) {
      bl = blocked(r.reason, r.sentence, r.allowedActionIds ||
        ['testing.request_authority', 'testing.open_policy']);
    } else if (r.status === 'prohibited') {
      bl = blocked('testing_prohibited_by_policy',
        'Performance suites are disabled by workspace policy. Settings is the only route.',
        ['testing.open_policy']);
    } else if (redacted) {
      bl = blocked(T.redactionFailed.reason, T.redactionFailed.sentence,
        T.redactionFailed.allowedActionIds);
    }

    return exrow({
      b: b, w: w, open: open, key: 'trun-' + r.id, name: r.name, nameKind: 'default',
      state: st, stateWord: word,
      meta: [r.id, word, r.when, r.detail],
      body: body({
        summary: r.sentence ? esc(r.sentence) : '',
        facts: facts,
        actions: actions,
        blocked: bl,
        overflow: cz().menu([
          { value: 'testing.open_receipt', label: 'Open receipt', disabled: !terminal,
            reason: 'run_status_terminal',
            sentence: 'A receipt opens once the run reaches a terminal state.' },
          { value: 'testing.open_failure', label: 'Open failures' },
          { value: 'testing.session.redaction.inspect', label: 'Inspect redaction' }
        ], { tip: 'Run ' + r.id + ' routes' })
      })
    });
  }

  /* =======================================================================
     PANEL 3 of 3 - AGENTS  (panel id 'agents')
     =======================================================================
     research/agents.md plus FinalGUISpec 7.19 / 7.19A. The shipped surface
     is a 30-line stub of three hardcoded rows and an Open Chat button; this
     builds the roster the owner spec actually mandates.

     OWNER BOUNDARY, HARD: the panel MIRRORS the subagent registry and holds
     no state of its own. Every row is a projection, every edit affordance
     ROUTES to Agent Config, and nothing here mutates in place.

     THE FIVE LIFECYCLE TOKENS ARE CONTRACTUAL - running, queued, blocked,
     remediation, completed - and they are not paraphrased and blocked is
     never merged into failed. The shared RENDERING vocabulary in _pm-data.js
     has no 'remediation' token, so the mapping below is explicit rather than
     implied: specStatus wins when a row carries it; otherwise attention and
     stale are treated as live (they are freshness and health, not
     lifecycle), and prohibited is treated as blocked because a policy
     prohibition is a block with a reason code, not a lifecycle of its own.
     The remediation group is rendered even at count 0 so the vocabulary is
     visible rather than inferred from an absence.

     NO cmd.agents.* FAMILY EXISTS. Zero entries in the wiring matrix carry a
     Side panels > Agents location. Every action id below is prefixed
     demo.agents. so it cannot be mistaken for a cataloged command, except
     where an EXISTING id is reused on purpose: the blocked rows dispatch the
     orchestrator.* ids the fixture supplies in allowedActionIds, and
     remediation reuses cmd.runtime.open_remediation_lineage. The list of
     commands this panel needs is in the returned concerns. */
  VG_PANELS.agents = function (D, cfg) {
    var w = W(cfg), b = B(cfg);
    var G = D.agents;
    var i;

    function lifecycle(a) {
      if (a.specStatus) return a.specStatus;
      if (a.remediation) return 'remediation';
      switch (a.status) {
        case 'blocked': case 'prohibited': return 'blocked';
        case 'queued': return 'queued';
        default: return 'running';
      }
    }

    var groups = { running: [], queued: [], blocked: [], remediation: [] };
    for (i = 0; i < G.active.length; i++) {
      var lc = lifecycle(G.active[i]);
      (groups[lc] || groups.running).push(G.active[i]);
    }

    var head = ibtn('refresh', 'Refresh registry projection', 'demo.agents.refresh') +
      cz().menu([
        { value: 'demo.agents.filter_state', label: 'Filter by lifecycle' },
        { value: 'demo.agents.open_activity', label: 'Open Agent Activity' },
        { type: 'sep' },
        { value: 'cmd.persona.select', label: 'Open Agent Config',
          hint: 'personas and crew live in Settings, not here' },
        { value: 'demo.agents.export_audit', label: 'Export activity' }
      ], { tip: 'Agents options' });

    var h = '';

    /* Header projection. The blocked count is a BUTTON, not decoration:
       FinalGUISpec L3745 forbids collapsing concurrent blocked episodes into
       one notification, so the badge opens the group rather than summarising
       it away. */
    h += note(
      chip(G.active.length + ' active', false, true) + ' ' +
      chip(groups.blocked.length + ' blocked') + ' ' +
      chip(G.available.length + ' available', false, true) + ' ' +
      chip(G.paging.completed.total + ' historical', false, true), 'branch');

    /* ------------------------------------------------ region 1: active_runs
       and region 2: blocked_and_remediation, as four projections of ONE
       activity list. At bucket 0 the blocked group renders COLLAPSED behind
       its count: the brief is explicit that a stack of blocked rows each
       carrying up to three action buttons must not bury the running rows at
       240px. From bucket 1 it opens in place. */
    h += shelf({
      key: 'running', label: 'Running', count: groups.running.length,
      state: cz().worst(groups.running.map(function (a) { return a.status; })),
      body: agentRows(groups.running, b, w)
    });

    h += shelf({
      key: 'blocked', label: 'Blocked', count: groups.blocked.length,
      state: 'err', collapsed: b === 0,
      acts: cz().menu([
        { value: 'demo.agents.filter_state', label: 'Open blocked only' },
        { value: 'demo.agents.open_activity', label: 'Open Agent Activity' }
      ], { tip: 'Blocked group actions' }),
      body: note('Each blocked node is a distinct actionable item and is never ' +
                 'collapsed into a single notification.', 'warn') +
        agentRows(groups.blocked, b, w)
    });

    h += shelf({
      key: 'queued', label: 'Queued', count: groups.queued.length,
      state: 'idle', collapsed: b === 0,
      body: agentRows(groups.queued, b, w)
    });

    /* Count 0, rendered anyway. remediation is one of the five contractual
       lifecycle tokens and an absent group reads as an absent concept. */
    h += shelf({
      key: 'remediation', label: 'Remediation', count: groups.remediation.length,
      state: 'idle', collapsed: true,
      body: groups.remediation.length
        ? agentRows(groups.remediation, b, w)
        : cz().empty('no-data',
            'No node is in remediation. A node that exceeds the ceiling of 3 ' +
            'moves to Blocked with remediation_ceiling_exceeded and gets no ' +
            'automatic retry.', { title: 'No remediation in flight' })
    });

    /* ------------------------------------- region 3: available_subagents
       Count-first and collapsed at the narrow widths: active rows are
       time-varying and lineage-bearing, available rows are static and
       config-bearing, they share almost no metadata and they want opposite
       sort orders. Interleaving them is the failure mode.

       An entry that names a Persona nothing resolves is rendered DISABLED
       with its resolution error verbatim. It is never filtered out: a
       filtered row is indistinguishable from one that never existed, which
       is the exact failure the fail-fast rule exists to prevent. */
    var availRows = '';
    for (i = 0; i < G.available.length; i++) {
      var av = G.available[i];
      var bad = av.resolution === 'unresolvable';
      var div = av.personaDiverged === true;
      availRows += (bad || div)
        ? exrow({
            b: b, w: w, key: 'av-' + av.name, name: av.name, mono: bad,
            nameKind: 'default',
            state: bad ? 'err' : 'warn', stateWord: bad ? 'Unresolvable' : 'Persona diverges',
            badge: av.provenance === 'protected_core' ? 'core'
              : (av.provenance === 'bundled' ? 'bundled' : 'user'),
            meta: [bad ? 'unresolved' : av.persona, av.provenance, av.resolution],
            /* The error string goes in the blocked slot, VERBATIM, because
               that is where a reader has learned to find a reason. The
               summary carries the explanation instead of repeating it, and
               an unresolvable entry does not print requested/effective - it
               has no resolved Persona for either half to name. */
            body: body({
              summary: esc(bad ? av.detail : av.personaSentence),
              facts: bad
                ? [
                    kv('Provenance', av.provenance, 'token', b, w),
                    kv('Resolution', av.resolution, 'token', b, w),
                    kv('Persona', av.persona, 'token', b, w)
                  ]
                : [
                    kv('Provenance', av.provenance, 'token', b, w),
                    kv('Resolution', av.resolution, 'token', b, w),
                    kv('Requested persona', av.requestedPersona || av.persona, 'token', b, w),
                    kv('Effective persona', av.effectivePersona || av.persona, 'token', b, w)
                  ],
              actions: [
                cz().act({ id: 'demo.agents.open_config', label: 'Open in Agent Config',
                  icon: 'ext', primary: !bad,
                  disabled: av.provenance === 'protected_core',
                  tip: av.provenance === 'protected_core'
                    ? 'protected_core entries cannot be edited or deleted' : null })
              ],
              blocked: bad
                ? blocked('subagent_unresolvable', av.error,
                    av.allowedActionIds || ['persona.open_registry'])
                : ''
            })
          })
        : row({
            b: b, w: w, key: 'av-' + av.name, name: av.name, nameKind: 'default',
            state: 'idle', stateWord: 'Available',
            badge: av.provenance === 'protected_core' ? 'core'
              : (av.provenance === 'bundled' ? 'bundled' : 'user'),
            meta: [av.persona, av.provenance],
            acts: cz().menu([
              { value: 'demo.agents.open_config', label: 'Open in Agent Config',
                disabled: av.provenance === 'protected_core',
                reason: 'provenance_protected_core',
                sentence: 'protected_core entries cannot be edited or deleted.' },
              { value: 'demo.agents.open_activity', label: 'Open past activity' }
            ], { tip: 'Registry entry actions' })
          });
    }

    h += shelf({
      key: 'available', label: 'Available subagents', count: G.available.length,
      state: cz().worst(G.available.map(function (x) {
        return x.resolution === 'unresolvable' ? 'err' : (x.personaDiverged ? 'warn' : 'idle');
      })),
      collapsed: b <= 1,
      body: note('Mirrors the subagent registry. Editing routes to Agent Config; ' +
                 'nothing here mutates in place.', 'info') +
        cz().list(availRows, { label: 'Available subagents', key: 'available' })
    });

    /* --------------------------------------- region 4: recent_completed */
    var doneRows = '';
    for (i = 0; i < G.completed.length; i++) {
      var d = G.completed[i];
      doneRows += row({
        b: b, w: w, key: 'done-' + d.name + '-' + d.when, name: d.name, nameKind: 'default',
        state: d.status, stateWord: d.outcome,
        chip: { label: d.outcome, plain: true },
        meta: [d.outcome, d.persona, d.when, d.cancelledBy ? 'by ' + d.cancelledBy : null],
        acts: cz().menu(lineageItems(G), { tip: 'Lineage for ' + d.name })
      });
    }
    h += shelf({
      key: 'recent_completed', label: 'Recent completed', count: G.paging.completed.shown,
      state: cz().worst(G.completed.map(function (x) { return x.status; })),
      collapsed: b === 0,
      body: cz().list(doneRows, { label: 'Recent completed', key: 'recent_completed' }) +
        more('Load older  ' + G.paging.completed.shown + ' of ' + G.paging.completed.total,
             'demo.agents.load_older')
    });

    /* ---------------------------------- region: lifecycle vocabulary
       Rendered so the panel can show that its pills MAP a spec vocabulary
       rather than inventing one, and so the two agent-session states are
       visibly sub-states of blocked rather than a third status. */
    var vocabRows = '';
    for (i = 0; i < G.lifecycle.length; i++) {
      var lt = G.lifecycle[i];
      vocabRows += row({
        b: b, w: w, key: 'lc-' + lt, name: lt, mono: true, nameKind: 'default',
        state: lt === 'blocked' ? 'err' : (lt === 'running' ? 'run' : 'idle'),
        stateWord: lt,
        meta: [(groups[lt] ? groups[lt].length : (lt === 'completed'
          ? G.paging.completed.total : 0)) + ' now', 'FinalGUISpec 7.19']
      });
    }
    for (i = 0; i < G.sessionStates.length; i++) {
      var ss = G.sessionStates[i];
      vocabRows += row({
        b: b, w: w, key: 'ss-' + ss, name: ss, mono: true, nameKind: 'default',
        state: 'warn', stateWord: ss,
        meta: ['agent-session state', 'surfaces as blocked with a reason code']
      });
    }
    h += shelf({
      key: 'lifecycle', label: 'Lifecycle vocabulary', count: G.lifecycle.length + 2,
      state: 'idle', collapsed: true,
      body: cz().list(vocabRows, { label: 'Lifecycle vocabulary', key: 'lifecycle' })
    });

    /* --------------------------- region: audit summary (FinalGUISpec 7.19A)
       The controls the spec names - time range, event-family filter, search
       by tool or operation, drill-down and export - are real here. The ROWS
       are not, and are not faked: there is no agent activity event projection
       in the fixture and the fixture author declined to stub one, so the
       region renders the honest empty state and says which projection is
       missing. Faking five compact rows would score a requirement this panel
       has not actually met. */
    h += shelf({
      key: 'audit', label: 'Activity audit', count: 0, state: 'idle', collapsed: true,
      acts: cz().menu([
        { type: 'head', label: 'Time range' },
        { value: 'demo.agents.audit.range_1h', label: 'Last hour' },
        { value: 'demo.agents.audit.range_24h', label: 'Last 24 hours' },
        { value: 'demo.agents.audit.range_7d', label: 'Last 7 days' },
        { type: 'sep' },
        { type: 'head', label: 'Event family' },
        { value: 'demo.agents.audit.family_tool', label: 'Tool calls' },
        { value: 'demo.agents.audit.family_search', label: 'Search operations' },
        { value: 'demo.agents.audit.family_fetch', label: 'Fetch operations' },
        { type: 'sep' },
        { value: 'demo.agents.audit.export', label: 'Export activity' }
      ], { tip: 'Audit controls' }),
      body: body({
        actions: [
          cz().act({ id: 'demo.agents.audit.search', label: 'Search activity', icon: 'search' }),
          cz().act({ id: 'demo.agents.open_activity', label: 'Open Agent Activity',
            icon: 'ext', primary: true })
        ],
        eq: b >= 2
      }) +
        cz().empty('no-data',
          'The 5-item compact summary needs an activity-event projection - ' +
          'operation label, query preview, success or failure, fallback note, ' +
          'source and page counts. No such projection exists in this fixture ' +
          'and it is not stubbed here.',
          { title: 'No activity events projected' })
    });

    return frame(cfg, {
      ico: 'branch', title: 'Agents', acts: head, body: h,
      foot: '<b>' + G.active.length + '</b> active &middot; ' +
            groups.blocked.length + ' blocked &middot; ' +
            G.available.length + ' available &middot; ' +
            G.paging.completed.shown + ' of ' + G.paging.completed.total + ' completed'
    });
  };

  /* Lineage is the one behaviour F3-452 actually mandates, so every active
     and completed row carries every route the fixture declares. */
  function lineageItems(G) {
    var items = [{ value: 'demo.agents.open_lineage', label: 'Open lineage' }];
    var i;
    for (i = 0; i < G.lineageTargets.length; i++) {
      items.push({ value: 'demo.agents.open_lineage_target',
        label: G.lineageTargets[i] });
    }
    items.push({ type: 'sep' });
    items.push({ value: 'demo.agents.open_thread', label: 'Open owning thread' });
    return items;
  }

  /* One agent row. Blocked rows adopt the cited blocked-list format verbatim:
     node name, blocked_reason_code label, TIME SINCE BLOCKED, and the primary
     allowed_action_ids as action buttons. blockedFor is its own field rather
     than an overloaded elapsed, because a 41-second approval wait and a
     3h 12m authority wait must not sort or read alike. */
  function agentRows(list, b, w) {
    var h = '', i;
    for (i = 0; i < list.length; i++) h += agentRow(list[i], b, w);
    if (!h) {
      h = cz().empty('no-data', 'Nothing in this group right now.',
        { title: 'Empty group' });
    }
    return h;
  }

  function agentRow(a, b, w) {
    var isBlocked = a.status === 'blocked' || a.status === 'prohibited';
    var word = a.specStatus || a.status;
    var diverged = a.personaDiverged === true;
    var rem = a.remediation;

    var meta = isBlocked
      ? [a.reason, a.blockedFor || a.elapsed, a.thread]
      : [word, a.elapsed, a.thread, a.target];

    var facts = [
      kv('Persona', a.persona, 'token', b, w),
      kv('Target', a.target, 'token', b, w),
      kv('Thread', a.thread, 'token', b, w),
      kv('Lifecycle', word, 'token', b, w),
      kv('Elapsed', a.elapsed, 'measure', b, w)
    ];
    if (a.run) facts.push(kv('Owning run', a.run, 'token', b, w));
    if (a.blockedFor) facts.push(kv('Blocked for', a.blockedFor, 'measure', b, w));
    if (a.blockedAt) facts.push(kv('Blocked at', a.blockedAt, 'measure', b, w));
    if (a.session) facts.push(kv('Session', a.session, 'token', b, w));
    if (diverged) {
      facts.push(kv('Requested persona', a.requestedPersona, 'token', b, w));
      facts.push(kv('Effective persona', a.effectivePersona, 'token', b, w));
      facts.push(kv('Persona reason', a.personaReason, 'token', b, w));
    }
    if (rem) {
      facts.push(kv('Remediation', rem.generation + ' of ' + rem.ceiling, 'measure', b, w));
      facts.push(kv('Automatic retry', rem.autoRetry ? 'yes' : 'no', 'token', b, w));
      facts.push(kv('Lineage', rem.lineageVisible ? 'visible' : 'hidden', 'token', b, w));
    }
    if (a.note) facts.push(kv('Note', a.note, 'prose', b, w));

    var actions = [];
    /* On remediation ceiling: Replan, Manual fix and Abort are exposed, the
       lineage entry stays visible, and there is NO automatic retry
       affordance. A Retry button here would break the ceiling. */
    if (rem && rem.autoRetry === false) {
      actions.push(cz().act({ id: 'cmd.runtime.open_remediation_lineage',
        label: 'Remediation lineage', icon: 'branch', primary: true }));
    } else if (!isBlocked) {
      actions.push(cz().act({ id: 'demo.agents.watch_run', label: 'Watch', icon: 'play',
        primary: true }));
    }
    actions.push(cz().act({ id: 'demo.agents.open_lineage', label: 'Lineage', icon: 'ext' }));
    if (!isBlocked) {
      actions.push(cz().act({ id: 'demo.agents.cancel_run', label: 'Cancel', icon: 'stop',
        danger: true,
        confirm: { title: 'Cancel ' + a.name + '?',
                   say: 'The child run stops. Its lineage artifact and receipts are kept.',
                   ok: 'Cancel run' } }));
    }

    var bl = '';
    if (isBlocked) {
      bl = blocked(a.reason, a.sentence, a.allowedActionIds || ['orchestrator.open_for_edit'], {
        'orchestrator.abort_node': { danger: true,
          confirm: { title: 'Abort ' + a.name + '?',
                     say: 'The node stops permanently. Its lineage stays readable.',
                     ok: 'Abort node' } }
      });
    } else if (diverged) {
      bl = blocked(a.personaReason, a.personaSentence, ['demo.agents.open_config']);
    }

    return exrow({
      b: b, w: w, key: 'ag-' + a.name + '-' + (a.run || a.thread),
      name: a.name, nameKind: 'default',
      state: a.status, stateWord: word,
      chip: a.session ? { label: a.session, plain: true }
        : (diverged ? { label: 'persona', plain: true } : null),
      meta: meta,
      body: body({
        summary: a.sentence && !isBlocked ? esc(a.sentence) : '',
        facts: facts,
        actions: actions,
        blocked: bl,
        overflow: cz().menu([
          { value: 'demo.agents.open_lineage', label: 'Open lineage' },
          { value: 'demo.agents.open_thread', label: 'Open owning thread' },
          { value: 'demo.agents.open_activity', label: 'Open Agent Activity' },
          { type: 'sep' },
          { value: 'demo.agents.open_config', label: 'Open in Agent Config' }
        ], { tip: a.name + ' routes' })
      })
    });
  }
})();
