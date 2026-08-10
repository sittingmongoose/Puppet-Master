/* PANEL BAKEOFF — vG COZY SHELVES : window.CZ helper namespace
   =========================================================================
   This file owns the BEHAVIOUR and the MARKUP GRAMMAR of the Cozy Shelves
   design. `_pm-cozy.css` owns every `.cz-*` rule; the four panel files own
   composition only. Nothing here decides what a panel says.

   The four properties this design was chosen for, restated because every
   helper below exists to hold one of them:

     1. A shelf says WHAT and HOW MANY before it shows data  -> CZ.shelf
        refuses to render a body without a label, and renders the count in a
        fixed slot on the header line.
     2. A row is identity on line 1, qualification on line 2, ALWAYS
        -> CZ.row always emits `.cz-row-l2`, even when it is empty, so the
        second line never moves between rows or between panels.
     3. One accent channel per shelf -> the shelf owns `--cz-cat` via
        data-cz-state; rows never set a category colour of their own.
     4. Four primitives composed identically everywhere -> shelf / row /
        exRow+body / kv. A panel that needs a fifth shape is a panel that has
        drifted.

   HOUSE RULES OBSERVED HERE
     - No emoji. Every glyph is an inline SVG borrowed from PMK.icon.
     - No `id=` attributes. Every hook is `data-cz-*`.
     - No native controls: no <select>, no confirm(), no `title=`. Destructive
       actions route through the existing PMK/PM.confirm sheet.
     - No template literals, so no backtick and no brace-substitution inside markup strings.
     - ES5 only, because everything here has to survive being read as the
       reference for a Slint port.

   THE ONE DELEGATED LISTENER
     CZ.mount(root) binds ONE keydown / click / focusin set per `.cz` panel
     root, in the CAPTURE phase. Two reasons, both load-bearing:
       a) a tree can hold thousands of rows and per-row handlers are a
          per-row allocation;
       b) PM.list binds its own roving model on the BUBBLE phase of whatever
          host it discovers. Capturing at the panel root means CZ's model runs
          first and can stopImmediatePropagation, so the two never fight over
          the same arrow key. CZ rows deliberately do NOT carry `.pmk-row` or
          `data-pm-row`, and they gain their tabindex only at mount time --
          after PM.mountAll has already run its structural sweep -- so the
          generic list discovery in _pm-components.js never claims them.
   ========================================================================= */
(function (global) {
  'use strict';

  var CZ = {};

  /* PMK/PM are looked up lazily: script order is the wire agent's business,
     and a helper that captured `window.PMK` at eval time would silently
     degrade if this file ever loaded first. */
  function kit()  { return global.PMK || null; }
  function pm()   { return global.PM || null; }
  function warnOnce(k, msg) {
    warnOnce.seen = warnOnce.seen || {};
    if (warnOnce.seen[k]) return;
    warnOnce.seen[k] = true;
    if (typeof console !== 'undefined' && console.warn) console.warn('[CZ] ' + msg);
  }

  /* ============================== constants ============================== */

  /* Single-character ellipsis, matching PMK.elide. Three ASCII dots would
     spend two more characters of a budget that is already the scarcest thing
     in a 280px panel. Exposed so a caller can prove which glyph it got. */
  var E = '…';
  CZ.ELLIPSIS = E;

  /* Rough advance width per character, basic-* worst case (Inter 11.5px).
     The same constant PMK budgets with, for the same reason: Slint cannot
     measure text mid-layout either, so every budget here is arithmetic. */
  var CH = 6.4;
  CZ.CH = CH;

  /* The harness's own test widths, used when a caller gives a bucket but no
     pixel width. */
  var BUCKET_W = [240, 320, 380, 480];
  CZ.BUCKET_W = BUCKET_W;

  /* Indent cap from contract section 6.2. Depth beyond this costs 0px. */
  var DEPTH_CAP = 6;
  CZ.DEPTH_CAP = DEPTH_CAP;

  /* Name floor from contract section 6.3: 72px, and 72/6.4 ~= 11.25, so the
     character budget never drops below 12. The name must never reach 0. */
  var NAME_MIN_CH = 12;
  CZ.NAME_MIN_CH = NAME_MIN_CH;

  /* ============================== escaping =============================== */

  CZ.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var esc = CZ.esc;

  function attr(name, val) {
    if (val == null || val === '' || val === false) return '';
    if (val === true) return ' ' + name;
    return ' ' + name + '="' + esc(val) + '"';
  }

  /* =============================== icons =================================
     Reused wholesale from _pm-kit.js. Nothing new is invented here: a second
     icon vocabulary is how two designs end up drawing "failed" differently.
     Available names (PMK.PATHS): check x arc circle warn bar clock square
     slash chev down dots search filter plus play stop refresh ext back info
     branch grip.

     Signature is (name, cls, size) per contract section 3 -- cls SECOND. A
     number in the cls slot is tolerated and read as the size, because the
     kit's own order is (name, size, cls) and the muscle memory is real. */
  CZ.icon = function (name, cls, size) {
    if (typeof cls === 'number') { size = cls; cls = arguments[2] || ''; }
    var K = kit();
    if (!K || !K.icon) {
      warnOnce('nokit', 'PMK is not loaded; icons will render empty. Load _pm-kit.js first.');
      return '<svg class="' + esc(cls || '') + '" width="' + (size || 14) + '" height="' +
             (size || 14) + '" viewBox="0 0 24 24" aria-hidden="true"></svg>';
    }
    return K.icon(name, size || 14, cls || '');
  };

  /* Species glyphs. Contract section 11 requires a SECOND row species beyond
     file/folder; each maps onto an icon the kit already has. */
  var SPECIES = {
    symlink:   { icon: 'ext',     label: 'Symlink' },
    generated: { icon: 'refresh', label: 'Generated' },
    ignored:   { icon: 'slash',   label: 'Ignored' },
    binary:    { icon: 'square',  label: 'Binary' },
    large:     { icon: 'bar',     label: 'Large file' },
    remote:    { icon: 'branch',  label: 'Remote' },
    virtual:   { icon: 'branch',  label: 'Virtual' },
    readonly:  { icon: 'stop',    label: 'Read only' },
    redacted:  { icon: 'slash',   label: 'Redacted' }
  };
  CZ.SPECIES = SPECIES;

  /* State glyphs. Shape carries the meaning; colour only reinforces it
     (contract section 2: "colour never carries meaning alone"). */
  var STATE = {
    ok:   { icon: 'check',  label: 'OK' },
    run:  { icon: 'arc',    label: 'Running' },
    warn: { icon: 'warn',   label: 'Attention' },
    err:  { icon: 'x',      label: 'Failed' },
    idle: { icon: 'circle', label: 'Idle' }
  };
  CZ.STATE = STATE;

  /* ============================ CZ.worst ================================
     A shelf's state is the WORST state it contains. Accepts bare tokens,
     row objects carrying `.state`, or nested arrays, because callers derive
     it from three different shapes and normalising at the door is cheaper
     than three call sites getting it subtly different. */
  var RANK  = { err: 4, warn: 3, run: 2, ok: 1, idle: 0 };
  var ALIAS = {
    err: 'err', error: 'err', failed: 'err', fail: 'err', fatal: 'err',
    warn: 'warn', warning: 'warn', attention: 'warn', blocked: 'warn',
    conflict: 'warn', stale: 'warn', dirty: 'warn',
    run: 'run', running: 'run', active: 'run', busy: 'run', pending: 'run',
    ok: 'ok', pass: 'ok', passed: 'ok', success: 'ok', clean: 'ok', done: 'ok',
    idle: 'idle', queued: 'idle', disabled: 'idle', unknown: 'idle', none: 'idle'
  };

  CZ.normState = function (s) {
    if (s == null) return 'idle';
    if (typeof s === 'object') return CZ.normState(s.state != null ? s.state : s.status);
    var k = String(s).toLowerCase();
    return ALIAS[k] || 'idle';
  };

  CZ.worst = function (states) {
    if (!states) return 'idle';
    if (!isArr(states)) states = [states];
    var best = 'idle';
    for (var i = 0; i < states.length; i++) {
      var s = states[i];
      var t = isArr(s) ? CZ.worst(s) : CZ.normState(s);
      if (RANK[t] > RANK[best]) best = t;
      if (best === 'err') return 'err';         /* nothing outranks err */
    }
    return best;
  };

  function isArr(x) { return Object.prototype.toString.call(x) === '[object Array]'; }

  /* ============================== CZ.bucket ============================== */
  CZ.bucket = function (w) {
    w = +w || 0;
    if (w < 280) return 0;
    if (w < 360) return 1;
    if (w < 480) return 2;
    return 3;
  };

  function bucketOf(o) {
    if (!o) return 2;
    if (o.bucket != null) return +o.bucket;
    if (o.w != null) return CZ.bucket(o.w);
    return 2;
  }
  function widthOf(o) {
    if (!o) return BUCKET_W[2];
    if (o.w != null) return +o.w;
    if (o.bucket != null) return BUCKET_W[+o.bucket] || BUCKET_W[2];
    return BUCKET_W[2];
  }

  /* ================================ CZ.elide =============================
     THE MISSING HELPER. Several live defects trace to its absence: a tail
     elide on a filename destroys the extension, which is the one token that
     says what the file IS; a tail elide on a path destroys the basename,
     which is the only part that identifies it.

     Contract section 3:
       'file'   keep the extension, cut the STEM
       'path'   keep the first segment and the basename
       'ref'    keep the tag after ':'
       'digest' 7 head + 4 tail
     and in every kind: return the input UNCHANGED when it already fits.

     No kind ever returns a string longer than the input. */
  CZ.elide = function (text, kind, chars) {
    text = String(text == null ? '' : text);
    var n = Math.floor(+chars || 0);

    /* Rule zero, and it comes before everything: if it fits, it is the
       answer. A helper that "elides" a string that already fits is the
       fastest way to make short names look truncated. */
    if (!n || text.length <= n) {
      /* digest is the one fixed-shape kind: it compresses even without a
         budget, because a 71-char sha is never the identity line. */
      if (kind !== 'digest' || !text) return text;
    }

    switch (kind) {
      case 'file':   return elideFile(text, n);
      case 'path':   return elidePath(text, n);
      case 'ref':    return elideRef(text, n);
      case 'digest': return elideDigest(text, n);
      default:       return elideMid(text, n);
    }
  };

  /* Balanced middle elide, the fallback shape. Head keeps the majority: the
     first characters of a name are worth more than the last. */
  function elideMid(text, n) {
    if (!n || text.length <= n) return text;
    if (n <= 1) return E;
    var room = n - 1;
    var head = Math.ceil(room * 0.62);
    var tail = room - head;
    return tail > 0 ? text.slice(0, head) + E + text.slice(-tail)
                    : text.slice(0, head) + E;
  }

  /* 'file' -- the extension survives, the stem is cut in the middle.
       backfill_quantities.rs @ 17  ->  backfill_qu…es.rs
     never                            backfill_qu…
     A leading-dot name (.github, .env) has no extension to protect, so it
     middle-elides whole. Two stem-tail characters are kept (three once there
     is room for them), which is what distinguishes foo_v1.rs from foo_v2.rs
     after elision -- a tail of zero makes near-identical siblings identical. */
  function elideFile(text, n) {
    if (!n || text.length <= n) return text;
    var dot = text.lastIndexOf('.');
    if (dot <= 0) return elideMid(text, n);           /* no extension to keep */

    var ext  = text.slice(dot);                       /* includes the dot */
    var stem = text.slice(0, dot);
    var room = n - ext.length - 1;                    /* stem chars, minus the E */

    /* Budget too small to show any stem at all. The extension still wins:
       "….svelte" tells the reader more than "RecipeCardWit…" does. */
    if (room < 3) return E + ext;

    var tail = room >= 15 ? 3 : 2;
    var head = room - tail;
    return stem.slice(0, head) + E + stem.slice(-tail) + ext;
  }

  /* 'path' -- first segment for the neighbourhood, basename for the identity.
       Concepts/panel-bakeoff/versions/vG-panels-a.js -> Concepts/…/vG-panels-a.js
     If even that is too long the first segment goes before the basename does,
     and the basename itself is then elided as a FILE so the extension holds. */
  function elidePath(text, n) {
    if (!n || text.length <= n) return text;
    var parts = text.split('/');
    if (parts.length < 3) {
      /* one separator or none: there is no middle to drop, so this is just a
         name with a slash in it. */
      var last = parts[parts.length - 1];
      if (parts.length === 2 && last.length + 2 <= n) return E + '/' + last;
      return elideFile(text, n);
    }
    var first = parts[0];
    var base  = parts[parts.length - 1];

    var out = first + '/' + E + '/' + base;
    if (out.length <= n) return out;

    out = E + '/' + base;
    if (out.length <= n) return out;

    /* Nothing but the basename fits, and it does not fit either. */
    return elideFile(base, n);
  }

  /* 'ref' -- the tag after ':' always survives (image:tag, ref:sha, a
     registry reference). Without a colon it is a path-shaped ref (a branch
     name such as origin/feature/long-name) and elides as one. */
  function elideRef(text, n) {
    if (!n || text.length <= n) return text;
    var at = text.lastIndexOf(':');
    if (at < 0) return elidePath(text, n);
    var tag  = text.slice(at);                        /* includes the colon */
    var repo = text.slice(0, at);
    var room = n - tag.length;
    if (room < 4) return E + tag;
    /* The repo half elides as a PATH, not from the head. A head cut on
       ghcr.io/platyr/tastebook-api keeps the REGISTRY and throws away the
       image name, which is the only part that says what the thing is. */
    return elidePath(repo, room) + tag;
  }

  /* 'digest' -- 7 head + 4 tail, the git/OCI convention.
     An algorithm prefix is kept OUTSIDE the 7: applying the head to
     "sha256:9f8e…" would spend the entire head on the word sha256 and show
     the reader nothing that identifies the object. */
  function elideDigest(text, n) {
    var at = text.indexOf(':');
    var pre = '', body = text;
    if (at > 0 && at <= 12) { pre = text.slice(0, at + 1); body = text.slice(at + 1); }
    if (body.length <= 12) return text;
    if (n && text.length <= n) return text;
    return pre + body.slice(0, 7) + E + body.slice(-4);
  }

  /* ================================ CZ.kv ================================
     Contract section 4. `.sh-kvwrap` overlapped its value by 234px at the
     280px default because a long mono key and a value shared one
     space-between row with text-overflow:clip. The fix is structural, not a
     CSS patch: below 360px the pair STACKS, and it stacks above 360px too
     whenever the value cannot get 88px.

     Signature is (k, v, kind, o) -- the fourth argument is additive and
     optional; `o` is a bucket number or {bucket, w, valuePx}. WITHOUT it the
     pair stacks, because stacked is the shape that cannot overlap. Pass the
     bucket to earn the inline form. */
  var KV_VALUE_MIN = 88;

  CZ.kv = function (k, v, kind, o) {
    kind = kind || 'token';
    if (typeof o === 'number') o = { bucket: o };
    var b = o ? bucketOf(o) : 1;
    var w = o ? widthOf(o) : BUCKET_W[1];

    var key = String(k == null ? '' : k);
    var inline = false;

    /* prose ALWAYS stacks and wraps: a sentence in a right-hand column is a
       one-word-per-line column. */
    if (kind !== 'prose' && b >= 2) {
      /* The key takes what it needs up to 45% of the band; whatever is left
         has to clear 88px or the pair stacks. */
      var pad     = 16 + 8;                       /* panel pad + kv pad */
      var keyPx   = Math.min(key.length * CH + 8, (w - pad) * 0.45);
      var valuePx = (o && o.valuePx != null) ? +o.valuePx : (w - pad - keyPx - 8);
      inline = valuePx >= KV_VALUE_MIN;
    }

    return '<div class="cz-kv cz-kv--' + (inline ? 'inline' : 'stacked') + '"' +
      attr('data-cz-kind', kind) + '>' +
      '<span class="cz-kv-k">' + esc(key) + '</span>' +
      '<span class="cz-kv-v">' + (kind === 'badge' ? String(v == null ? '' : v) : esc(v)) +
      '</span></div>';
  };

  /* =============================== CZ.menu ===============================
     The PM overflow trigger plus its portaled menu. This is a thin adapter,
     never a second menu implementation: PM.menu already owns focus, portal
     placement, disabled reasons and keyboard. */
  CZ.menu = function (items, o) {
    o = o || {};
    items = items || [];
    if (!items.length) return '';
    var K = kit();
    var inner = K && K.overflow
      ? K.overflow(items, o.tip || 'More actions')
      : fallbackMenu(items, o.tip || 'More actions');
    return '<span class="cz-of' + (o.cls ? ' ' + esc(o.cls) : '') + '">' + inner + '</span>';
  };

  function fallbackMenu(items, tip) {
    warnOnce('nomenu', 'PMK.overflow missing; emitting the equivalent markup inline.');
    return '<span class="pmk-of pm-menu" data-pm-menu>' +
      '<button type="button" class="pm-menu-trigger" data-pm-tip="' + esc(tip) + '">' +
      CZ.icon('dots', '', 14) + '</button><template data-pm-items>' +
      items.map(function (it) {
        if (it.type === 'sep')  return '<div data-sep></div>';
        if (it.type === 'head') return '<div data-head>' + esc(it.label) + '</div>';
        return '<div' + attr('data-value', it.value || it.id || '') +
          attr('data-hint', it.hint) + (it.danger ? ' data-danger' : '') +
          (it.disabled ? ' data-disabled' : '') + attr('data-reason', it.reason) +
          attr('data-sentence', it.sentence) + '>' + esc(it.label) + '</div>';
      }).join('') + '</template></span>';
  }

  /* =============================== CZ.act ================================
     One action button, and the ONLY way a destructive action is emitted in
     this design. `o.confirm` stamps the gate attributes that the delegated
     capture handler turns into a PM.confirm sheet. There is no second
     confirm implementation in this file -- see CZ.confirm below. */
  CZ.act = function (o) {
    o = o || {};
    var c = o.confirm;
    return '<button type="button" class="cz-btn' +
      (o.primary ? ' cz-btn--primary' : '') + (o.danger ? ' cz-btn--danger' : '') +
      (o.icon && !o.label ? ' cz-btn--icon' : '') + '"' +
      attr('data-cz-action', o.id) +
      attr('data-pm-action', o.id) +
      (o.disabled ? ' aria-disabled="true"' : '') +
      attr('data-pm-tip', o.tip || (o.icon && !o.label ? o.label || o.id : null)) +
      attr('aria-label', o.icon && !o.label ? (o.aria || o.tip || o.id) : null) +
      (c ? attr('data-cz-confirm', c.title || ('Confirm ' + (o.label || o.id))) +
           attr('data-cz-say', c.say || c.body) +
           attr('data-cz-ok', c.ok || o.label || 'Confirm') +
           (c.danger === false ? '' : ' data-cz-danger') : '') +
      '>' + (o.icon ? CZ.icon(o.icon, 'cz-btn-ico', 13) : '') +
      (o.label ? '<span class="cz-btn-lbl">' + esc(o.label) + '</span>' : '') +
      '</button>';
  };

  /* =============================== CZ.shelf ==============================
     Property 1 made structural. The header is a real <button> carrying
     aria-expanded (contract section 7); the action slot sits OUTSIDE that
     button, because a button inside a button is not a control, it is a bug.

     `state` sets data-cz-state, which is the ONE accent channel: `--cz-cat`
     hangs off it in CSS and no descendant sets a category colour.
     If `state` is absent it is DERIVED from o.items via CZ.worst. */
  CZ.shelf = function (o) {
    o = o || {};
    var label = o.label == null ? '' : String(o.label);
    if (!label) warnOnce('shelfnolabel', 'CZ.shelf called without a label - property 1 says a shelf must name what you are looking at.');

    var state = o.state ? CZ.normState(o.state) : CZ.worst(o.items || []);
    var st = STATE[state] || STATE.idle;
    var open = !o.collapsed;

    var count = o.count;
    if (count == null && isArr(o.items)) count = o.items.length;

    /* `rows` is the safe door: it wraps the rows in a CZ.list host so they
       get a roving tabindex. `body` is the raw door, for a shelf whose
       payload is not a list -- a shelf that pours CZ.row output straight into
       `body` produces role="option" with no listbox parent and no keyboard
       model at all, which is exactly the defect this design set out to fix. */
    var body = o.body;
    if (body == null && o.rows != null) {
      body = CZ.list(isArr(o.rows) ? o.rows.join('') : o.rows, { label: label, key: o.key });
    }

    var head =
      '<button type="button" class="cz-shelf-head"' +
        ' aria-expanded="' + (open ? 'true' : 'false') + '"' +
        ' data-cz-act="shelf">' +
        CZ.icon(open ? 'down' : 'chev', 'cz-shelf-chev', 10) +
        (o.ico ? '<span class="cz-shelf-ico">' + CZ.icon(o.ico, 'cz-ico', 13) + '</span>' : '') +
        '<span class="cz-shelf-label">' + esc(label) + '</span>' +
        (count != null ? '<span class="cz-shelf-count">' + esc(count) + '</span>' : '') +
        '<span class="cz-shelf-state" role="img" aria-label="' + esc(st.label) + '">' +
          CZ.icon(st.icon, 'cz-shelf-mark', 12) + '</span>' +
      '</button>';

    return '<section class="cz-shelf"' +
      attr('data-cz-shelf', o.key || o.id || label) +
      ' data-cz-state="' + esc(state) + '"' +
      ' data-cz-open="' + (open ? 'true' : 'false') + '">' +
      '<div class="cz-shelf-bar">' + head +
        (o.acts ? '<span class="cz-shelf-acts">' + o.acts + '</span>' : '') +
      '</div>' +
      '<div class="cz-shelf-body" data-cz-open="' + (open ? 'true' : 'false') + '"' +
        (open ? '' : ' hidden style="display:none"') + '>' +
        (body || '') +
      '</div></section>';
  };

  /* ================================ CZ.list ==============================
     The host element a roving tabindex needs. Rows without a host are rows
     without a keyboard model. */
  CZ.list = function (rowsHtml, o) {
    o = o || {};
    return '<div class="cz-list" role="listbox" data-cz-list' +
      attr('aria-label', o.label) +
      attr('data-cz-key', o.key) + '>' + (rowsHtml || '') + '</div>';
  };

  /* ================================ CZ.row ===============================
     Property 2 made structural: `.cz-row-l1` is identity, `.cz-row-l2` is
     qualification, and l2 IS ALWAYS EMITTED. An absent second line that
     collapses the row height is what makes a list look ragged and makes the
     eye re-find the identity on every row.

     o: { name, meta, state, chip, acts, nameKind, key, w|bucket, sel } */
  CZ.row = function (o) {
    o = o || {};
    var b = bucketOf(o);
    var w = widthOf(o);
    var state = o.state ? CZ.normState(o.state) : null;
    var st = state ? (STATE[state] || STATE.idle) : null;

    var name = CZ.elide(o.name, o.nameKind || 'file', idChars(o, w, b));

    return '<div class="cz-row" role="option" tabindex="-1"' +
      ' aria-selected="' + (o.sel ? 'true' : 'false') + '"' +
      ' data-cz-row' +
      attr('data-cz-key', o.key || o.name) +
      attr('data-cz-state', state) + '>' +
      (st ? '<span class="cz-row-mark" role="img" aria-label="' + esc(st.label) + '">' +
              CZ.icon(st.icon, 'cz-mark-ico', 12) + '</span>' : '') +
      '<span class="cz-row-band">' +
        '<span class="cz-row-l1">' +
          '<span class="cz-row-id">' + esc(name) + '</span>' +
          (o.chip ? '<span class="cz-row-chip">' + chipOf(o.chip) + '</span>' : '') +
        '</span>' +
        '<span class="cz-row-l2">' + metaRun(o.meta, b) + '</span>' +
      '</span>' +
      /* Reserved at rest, not only on hover -- contract section 6.9. An
         action that appears on hover and reflows the name is a name that
         moves under the pointer. */
      '<span class="cz-row-acts">' + (o.acts || '') + '</span>' +
      '</div>';
  };

  function chipOf(c) {
    if (typeof c === 'string') return esc(c);
    return '<span class="cz-chip' + (c.tone ? ' cz-chip--' + esc(c.tone) : '') +
      (c.mono ? ' cz-chip--mono' : '') + '">' + esc(c.label != null ? c.label : c.text) + '</span>';
  }

  /* Identity character budget. Pixels are spent by the slots the row
     actually carries, never by the bucket alone. */
  function idChars(o, w, b) {
    if (o.chars) return +o.chars;
    var px = w - 16 - 8;                     /* panel padding + row padding */
    if (o.state) px -= 20;                   /* status mark */
    if (o.acts)  px -= 26;                   /* reserved action gutter */
    if (o.chip)  px -= 70;                   /* chip shares line 1 */
    return Math.max(10, Math.floor(px / CH));
  }

  /* Meta segments drop WHOLE, right to left, and surface a +N escape. They
     never mid-clip: half a segment is a lie, a +N is a fact. */
  function metaRun(meta, b) {
    if (!meta) return '';
    if (typeof meta === 'string') meta = [meta];
    if (!meta.length) return '';
    var keep = [1, 2, 3, 4][b] || 3;
    var shown = meta.slice(0, keep);
    var dropped = meta.length - shown.length;
    var out = shown.map(function (s, i) {
      var t = (s && typeof s === 'object') ? (s.t != null ? s.t : s.label) : s;
      return (i ? '<span class="cz-row-sep" aria-hidden="true"></span>' : '') +
        '<span class="cz-row-seg">' + esc(t) + '</span>';
    }).join('');
    if (dropped > 0) out += '<span class="cz-row-more">+' + dropped + '</span>';
    return out;
  }

  /* =============================== CZ.exRow ==============================
     Contract section 7. 31 expanders in the source design, not one of them
     keyboard-operable: every header was a <div> and there were zero tabindex
     attributes. Here the header is a real <button type="button"> with
     aria-expanded, and the collapsed payload carries `hidden` +
     display:none so it leaves the tab order entirely.

     Expansion is NOT exclusive. This is a list, not an accordion; two open
     rows is a comparison, and the source design's exclusivity is what made
     comparison impossible. Shelf collapse stays a separate concern.

     No aria-controls: `id=` is banned in panel markup (six designs collide),
     and the payload is the header button's immediate next sibling, which is
     the association ARIA accepts when an id is unavailable. */
  CZ.exRow = function (o) {
    o = o || {};
    var open = !!o.open;
    var b = bucketOf(o);
    var w = widthOf(o);
    var state = o.state ? CZ.normState(o.state) : null;
    var st = state ? (STATE[state] || STATE.idle) : null;
    var name = CZ.elide(o.name, o.nameKind || 'file', idChars(o, w, b) - 3);

    return '<div class="cz-ex" data-cz-ex' +
      attr('data-cz-key', o.key || o.name) +
      attr('data-cz-state', state) +
      ' data-cz-open="' + (open ? 'true' : 'false') + '">' +
      '<div class="cz-ex-bar">' +
        '<button type="button" class="cz-ex-head" data-cz-act="ex"' +
          ' aria-expanded="' + (open ? 'true' : 'false') + '">' +
          CZ.icon(open ? 'down' : 'chev', 'cz-ex-chev', 10) +
          (st ? '<span class="cz-row-mark" role="img" aria-label="' + esc(st.label) + '">' +
                  CZ.icon(st.icon, 'cz-mark-ico', 12) + '</span>' : '') +
          '<span class="cz-row-band">' +
            '<span class="cz-row-l1">' +
              '<span class="cz-row-id">' + esc(name) + '</span>' +
              (o.chip ? '<span class="cz-row-chip">' + chipOf(o.chip) + '</span>' : '') +
            '</span>' +
            '<span class="cz-row-l2">' + metaRun(o.meta, b) + '</span>' +
          '</span>' +
        '</button>' +
        (o.acts ? '<span class="cz-row-acts">' + o.acts + '</span>' : '<span class="cz-row-acts"></span>') +
      '</div>' +
      '<div class="cz-ex-body" data-cz-open="' + (open ? 'true' : 'false') + '"' +
        (open ? '' : ' hidden style="display:none"') + '>' +
        (o.body || '') +
      '</div></div>';
  };

  /* =============================== CZ.body ===============================
     The expanded payload, slots in ONE fixed order, every time:
       summary, facts, detail, actions, blocked, overflow.
     Fixed order is the whole point -- a reader who has opened one row knows
     where the blocked reason is in every other row in every other panel.
     `facts` accepts an array of CZ.kv strings or a pre-joined string. */
  var BODY_SLOTS = ['summary', 'facts', 'detail', 'actions', 'blocked', 'overflow'];
  CZ.BODY_SLOTS = BODY_SLOTS;

  CZ.body = function (slots) {
    slots = slots || {};
    var out = '';
    for (var i = 0; i < BODY_SLOTS.length; i++) {
      var k = BODY_SLOTS[i];
      var v = slots[k];
      if (isArr(v)) v = v.join('');
      if (!v) continue;
      out += '<div class="cz-body-' + k + '" data-cz-slot="' + k + '">' + v + '</div>';
    }
    return out ? '<div class="cz-body">' + out + '</div>' : '';
  };

  /* ============================== CZ.blocked =============================
     Contract section 9. NEVER a toast: a transient message about why an
     action is impossible is a message the user is guaranteed to miss. The
     reason code renders VERBATIM, one human sentence follows it, and every
     allowed_action_id becomes a real button. */
  CZ.blocked = function (code, msg, allowed) {
    var acts = (allowed || []).map(function (a) {
      if (typeof a === 'string') a = { id: a, label: humanise(a) };
      return CZ.act({ id: a.id, label: a.label || humanise(a.id), primary: !!a.primary,
                      danger: !!a.danger, confirm: a.confirm, tip: a.tip });
    }).join('');

    return '<div class="cz-blocked" role="note"' + attr('data-cz-code', code) + '>' +
      '<span class="cz-blocked-top">' +
        '<span class="cz-blocked-mark" role="img" aria-label="Blocked">' +
          CZ.icon('bar', 'cz-mark-ico', 13) + '</span>' +
        '<span class="cz-blocked-code">' + esc(code) + '</span>' +
      '</span>' +
      (msg ? '<span class="cz-blocked-say">' + esc(msg) + '</span>' : '') +
      (acts ? '<span class="cz-blocked-acts">' + acts + '</span>' : '') +
      '</div>';
  };

  function humanise(id) {
    var s = String(id || '').replace(/[._-]+/g, ' ').trim();
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  }
  CZ.humanise = humanise;

  /* =============================== CZ.empty ==============================
     Five DISTINCT components, not one with variable copy. "No results" and
     "not configured" are different facts about the world and a user who
     cannot tell them apart cannot act. */
  var EMPTY = {
    'not-relevant':   { icon: 'info',   title: 'Not applicable here' },
    'not-configured': { icon: 'warn',   title: 'Not configured' },
    'unavailable':    { icon: 'slash',  title: 'Unavailable' },
    'no-data':        { icon: 'info',   title: 'Nothing yet' },
    'no-results':     { icon: 'search', title: 'No matches' }
  };
  CZ.EMPTY_KINDS = ['not-relevant', 'not-configured', 'unavailable', 'no-data', 'no-results'];

  CZ.empty = function (kind, msg, o) {
    o = o || {};
    var spec = EMPTY[kind];
    if (!spec) {
      warnOnce('empty:' + kind, 'unknown empty kind "' + kind + '" - falling back to no-data.');
      kind = 'no-data';
      spec = EMPTY[kind];
    }
    return '<div class="cz-empty" data-cz-empty="' + esc(kind) + '">' +
      CZ.icon(spec.icon, 'cz-empty-ico', 18) +
      '<span class="cz-empty-t">' + esc(o.title || spec.title) + '</span>' +
      (msg ? '<span class="cz-empty-b">' + esc(msg) + '</span>' : '') +
      (o.cta ? CZ.act({ id: o.ctaId || 'empty-cta', label: o.cta, primary: true }) : '') +
      '</div>';
  };

  /* =============================== CZ.tabs ===============================
     Contract section 5. The single 250px threshold turned labels on for all
     tab counts at once, so Docker's six tabs were cut in all eight themes at
     the default width. The rule is count-aware and discrete -- no text
     measurement, so it ports:

       labelled   w >= 72 * count + 24
       icon-only  w >= 28 * count + 24
       otherwise  first 3 icons + overflow menu

     In icon and overflow mode the label is NOT emitted as hidden text; it
     moves to aria-label and data-pm-tip. Emitting it and relying on the
     stylesheet to hide it makes the layout depend on a CSS rule landing.

     In overflow mode the ACTIVE tab is always promoted into the visible
     three: a tab strip whose current tab is hidden inside a menu does not
     tell you where you are. */
  CZ.tabmode = function (count, w) {
    count = +count || 0;
    w = +w || 0;
    if (w >= 72 * count + 24) return 'label';
    if (w >= 28 * count + 24) return 'icon';
    return 'overflow';
  };

  CZ.tabs = function (items, w) {
    items = items || [];
    var mode = CZ.tabmode(items.length, w);
    var vis = items, rest = [];

    if (mode === 'overflow') {
      vis = items.slice(0, 3);
      rest = items.slice(3);
      var activeIdx = -1, i;
      for (i = 0; i < items.length; i++) if (items[i].active) activeIdx = i;
      if (activeIdx >= 3) {
        /* promote the active tab into the last visible slot, and demote what
           was there into the menu in its place. */
        var demoted = vis[2];
        vis = vis.slice(0, 2).concat([items[activeIdx]]);
        rest = items.slice(3).filter(function (it) { return it !== items[activeIdx]; });
        rest.unshift(demoted);
      }
    }

    var html = vis.map(function (it) {
      var labelled = mode === 'label';
      return '<button type="button" class="cz-tab" role="tab"' +
        ' aria-selected="' + (it.active ? 'true' : 'false') + '"' +
        ' tabindex="' + (it.active ? '0' : '-1') + '"' +
        attr('data-cz-tab', it.id) +
        (it.available === false ? ' aria-disabled="true"' : '') +
        (labelled ? '' : attr('aria-label', it.label)) +
        attr('data-pm-tip', labelled ? null : tabTip(it)) + '>' +
        (it.icon ? CZ.icon(it.icon, 'cz-tab-ico', 13) : '') +
        (labelled ? '<span class="cz-tab-lbl">' + esc(it.label) + '</span>' : '') +
        (it.count != null && labelled
          ? '<span class="cz-tab-n">' + esc(it.count) + '</span>' : '') +
        '</button>';
    }).join('');

    if (rest.length) {
      html += CZ.menu(rest.map(function (it) {
        return { value: it.id, label: it.label + (it.count != null ? '  ' + it.count : ''),
                 disabled: it.available === false, reason: it.reason, sentence: it.sentence };
      }), { tip: 'More views', cls: 'cz-tabs-of' });
    }

    return '<div class="cz-tabs" role="tablist" data-cz-tabmode="' + mode + '"' +
      attr('aria-label', (arguments[2] && arguments[2].label) || 'Views') + '>' + html + '</div>';
  };

  function tabTip(it) {
    var t = it.label || it.id || '';
    if (it.count != null) t += '  ' + it.count;
    if (it.available === false && it.sentence) t += ' - ' + it.sentence;
    return t;
  }

  /* =============================== CZ.tree ===============================
     THE CENTREPIECE. Contract section 6.

     The nested-DOM tree it replaces cost exactly 22px per level with no
     floor, and the filename collapsed to 0px and DISAPPEARED at depth 6 in a
     220px panel -- it did not even ellipsize, because min-width:0 under
     overflow:hidden permits a text node to reach zero. The real source tree
     peaks at depth 3-6, so that is not a corner case, it is the common case.

     Five things fix it, and all five are here:
       1  FLAT DOM. One list, depth carried by data-cz-d and --cz-d. No
          nesting, because Slint components cannot recurse and only ListView
          recycles -- and a flat model is what makes virtualization honest.
       2  Indent capped at DEPTH_CAP levels x 10px.
       3  A name floor: never fewer than NAME_MIN_CH characters, plus
          min-width:72px and text-overflow:ellipsis in CSS.
       4  Middle-elide that PRESERVES THE EXTENSION.
       5  Git status as a 3px spine plus one mono character in a fixed 12px
          gutter -- zero cost to the name band, and not an inline chip.
     Plus two structural moves: single-child folder chains COMPACT into one
     row, and a folder past the cap offers a SCOPE breadcrumb that re-roots
     the tree to it at depth 0.

     rows: PM_DATA.files row shape {d,t,n,p,g} plus optional
           {species, open, sel, size}. Aliases (depth/type/name/path/git) are
           accepted because fixtures drift.
     cfg:  { w|bucket, cap, openTo, open:{path:bool}, sel, scope, compact,
             label, paging } */
  CZ.tree = function (rows, cfg) {
    cfg = cfg || {};
    var w   = widthOf(cfg);
    var cap = cfg.cap == null ? DEPTH_CAP : +cfg.cap;

    var model = normRows(rows);
    if (cfg.compact !== false) model = compactChains(model);

    var crumbs = '';
    if (cfg.scope) {
      model  = reroot(model, String(cfg.scope));
      crumbs = breadcrumb(String(cfg.scope));
    }

    var openTo = cfg.openTo == null ? 2 : +cfg.openTo;
    function isOpen(r) {
      if (cfg.open && Object.prototype.hasOwnProperty.call(cfg.open, r.p)) return !!cfg.open[r.p];
      if (r.open != null) return !!r.open;
      return r.d < openTo;
    }

    /* Visibility pass. `closedAt` is the depth of the nearest collapsed
       ancestor; everything deeper than it is hidden. One linear pass, no
       ancestor walks, which is what keeps this honest at 12,400 rows. */
    var closedAt = null;
    var html = '', firstStop = -1;
    for (var i = 0; i < model.length; i++) {
      var r = model[i];
      var hidden = false;
      if (closedAt !== null) {
        if (r.d > closedAt) hidden = true;
        else closedAt = null;
      }
      var open = r.dir ? isOpen(r) : false;
      if (!hidden && r.dir && !open) closedAt = r.d;
      if (!hidden && firstStop < 0) firstStop = i;
      html += treeRow(r, { w: w, cap: cap, open: open, hidden: hidden,
                           sel: cfg.sel != null && cfg.sel === r.p, stop: false });
    }

    var foot = cfg.paging
      ? '<div class="cz-tree-foot">' + esc(cfg.paging) + '</div>' : '';

    return '<div class="cz-tree" role="tree" data-cz-tree' +
      attr('aria-label', cfg.label || 'Files') +
      attr('data-cz-scope', cfg.scope) +
      attr('data-cz-cap', cap) + '>' +
      crumbs +
      '<div class="cz-tree-rows">' + html + '</div>' +
      foot + '</div>';
  };

  /* ------------------------------------------------------------ one row */
  function treeRow(r, o) {
    var di = Math.min(r.d, o.cap);                    /* capped indent level */
    var chars = treeChars(o.w, di, r);
    /* A compacted chain (src/main/java/com/tastebook) is a PATH and must keep
       its last segment; a plain name is a FILE and must keep its extension.
       The folder slash is appended AFTER elision -- eliding "a/b/" as a path
       makes the basename the empty string, which is how a compacted chain
       once rendered as "lvl0/.../". */
    var kind  = r.n.indexOf('/') >= 0 ? 'path' : 'file';
    var name  = CZ.elide(r.n, kind, chars - (r.dir ? 1 : 0)) + (r.dir ? '/' : '');
    var g     = gitOf(r.g);
    var sp    = r.sp ? SPECIES[r.sp] : null;

    return '<div class="cz-row cz-trow" role="treeitem" tabindex="-1"' +
      ' aria-level="' + (r.d + 1) + '"' +
      (r.dir ? ' aria-expanded="' + (o.open ? 'true' : 'false') + '"' : '') +
      ' aria-selected="' + (o.sel ? 'true' : 'false') + '"' +
      ' data-cz-row' +
      ' data-cz-d="' + r.d + '"' +
      ' data-cz-kind="' + (r.dir ? 'dir' : 'file') + '"' +
      attr('data-cz-path', r.p) +
      attr('data-cz-git', g.code) +
      attr('data-cz-species', r.sp) +
      attr('data-cz-chain', r.chain ? r.chain.join(' ') : null) +
      (r.d >= o.cap && r.dir ? ' data-cz-canscope="1"' : '') +
      ' style="--cz-d:' + r.d + ';--cz-di:' + di + (o.hidden ? ';display:none' : '') + '"' +
      (o.hidden ? ' hidden' : '') + '>' +

      /* twisty: not a nested button. A treeitem that contains a focusable
         control is a treeitem whose keyboard model has two owners. Left and
         Right already do this job; the click target is here for the mouse. */
      '<span class="cz-tw"' + (r.dir ? ' data-cz-act="twisty"' : '') + ' aria-hidden="true">' +
        (r.dir ? CZ.icon(o.open ? 'down' : 'chev', 'cz-tw-ico', 10) : '') + '</span>' +

      /* git gutter: 3px spine + one mono character in a fixed 12px track.
         Zero cost to the name band, which is the entire point. */
      '<span class="cz-gut" role="img" aria-label="' + esc(g.label) + '">' +
        '<span class="cz-spine" aria-hidden="true"></span>' +
        '<span class="cz-gc" aria-hidden="true">' + esc(g.code) + '</span>' +
      '</span>' +

      '<span class="cz-name">' + esc(name) + '</span>' +
      (sp ? '<span class="cz-sp" role="img" aria-label="' + esc(sp.label) + '">' +
              CZ.icon(sp.icon, 'cz-sp-ico', 11) + '</span>'
          : '<span class="cz-sp" aria-hidden="true"></span>') +

      /* Reserved at rest as well as on hover (section 6.9). */
      '<span class="cz-tacts">' + (r.acts || '') + '</span>' +
      '</div>';
  }

  /* Name budget. Every fixed cost is subtracted, the capped indent is the
     only depth term, and NAME_MIN_CH is the floor that keeps the old
     "filename reaches 0px" defect structurally impossible. */
  function treeChars(w, di, r) {
    var px = w
      - 16          /* panel padding */
      - 8           /* row padding */
      - di * 10     /* capped indent */
      - 14          /* twisty */
      - 15          /* spine + git gutter */
      - 26          /* reserved action gutter */
      - (r && r.sp ? 14 : 0);
    return Math.max(NAME_MIN_CH, Math.floor(px / CH));
  }

  /* --------------------------------------------------------- git gutter */
  var GIT = {
    A: 'Added', M: 'Modified', D: 'Deleted', R: 'Renamed', C: 'Conflicted',
    U: 'Unmerged', '?': 'Untracked', '!': 'Ignored', I: 'Ignored'
  };
  var GIT_WORD = {
    added: 'A', modified: 'M', deleted: 'D', renamed: 'R', conflicted: 'C',
    unmerged: 'U', untracked: '?', ignored: '!', clean: '', unchanged: ''
  };
  function gitOf(g) {
    if (g == null || g === '') return { code: '', label: 'Unchanged' };
    var s = String(g);
    var code = s.length === 1 ? s.toUpperCase() : (GIT_WORD[s.toLowerCase()] || s.charAt(0).toUpperCase());
    if (s === '?' || s === '!') code = s;
    return { code: code, label: GIT[code] || 'Unchanged' };
  }
  CZ.git = gitOf;

  /* ------------------------------------------------------- normalisation */
  function normRows(rows) {
    rows = rows || [];
    var out = [], stack = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i] || {};
      var d = +(r.d != null ? r.d : (r.depth != null ? r.depth : 0)) || 0;
      var t = r.t != null ? r.t : (r.type != null ? r.type : r.kind);
      var dir = (t === 'dir' || t === 'folder' || t === 'd' || r.dir === true);
      var n = String(r.n != null ? r.n : (r.name != null ? r.name : ''));
      var p = r.p != null ? String(r.p) : (r.path != null ? String(r.path) : '');

      /* Derive the path from the depth stack when the fixture omits it. The
         open-state map and the compaction pass both key off it, so a row
         without one is a row that cannot be remembered. */
      stack.length = d;
      stack[d] = n.replace(/\/+$/, '');
      if (!p) p = stack.slice(0, d + 1).join('/');

      out.push({
        d: d, dir: !!dir, n: n.replace(/\/+$/, ''), p: p,
        g: r.g != null ? r.g : (r.git != null ? r.git : ''),
        sp: r.species || r.sp || '',
        open: r.open != null ? r.open : null,
        acts: r.acts || ''
      });
    }
    return out;
  }

  /* ------------------------------------------------- compaction (6.6)
     `src/ > routes/` renders as ONE row `src/routes/` when the parent holds
     exactly one child folder and no files. Repeats transitively, so
     src/main/java/com/tastebook collapses to a single row instead of five
     rows that each cost an indent level and say nothing. */
  function compactChains(rows) {
    var out = rows.slice();
    for (var i = 0; i < out.length; i++) {
      var r = out[i];
      if (!r.dir) continue;
      for (;;) {
        var kids = directKids(out, i);
        if (kids.length !== 1) break;
        var ki = kids[0], k = out[ki];
        if (!k.dir) break;

        r.n = r.n + '/' + k.n;
        r.chain = (r.chain || [r.p]).concat([k.p]);
        r.p = k.p;                       /* identity is the DEEPEST folder */
        if (!r.g) r.g = k.g;
        if (r.open == null) r.open = k.open;

        var end = subtreeEnd(out, ki);
        for (var j = ki + 1; j < end; j++) out[j].d -= 1;
        out.splice(ki, 1);
      }
    }
    return out;
  }

  function directKids(rows, i) {
    var d = rows[i].d, res = [];
    for (var j = i + 1; j < rows.length; j++) {
      var dj = rows[j].d;
      if (dj <= d) break;
      if (dj === d + 1) res.push(j);
    }
    return res;
  }

  function subtreeEnd(rows, i) {
    var d = rows[i].d;
    for (var j = i + 1; j < rows.length; j++) if (rows[j].d <= d) return j;
    return rows.length;
  }

  /* --------------------------------------------- scope re-root (6.7) */
  function reroot(rows, scope) {
    var base = null, out = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (base === null) {
        if (r.p === scope) { base = r.d; }
        continue;
      }
      if (r.d <= base) break;
      out.push({ d: r.d - base - 1, dir: r.dir, n: r.n, p: r.p, g: r.g,
                 sp: r.sp, open: r.open, acts: r.acts, chain: r.chain });
    }
    return base === null ? rows : out;
  }

  function breadcrumb(scope) {
    var parts = scope.split('/');
    var acc = '', html =
      '<button type="button" class="cz-crumb" data-cz-scope="">' +
        CZ.icon('back', 'cz-crumb-ico', 11) +
        '<span class="cz-crumb-lbl">All files</span></button>';
    for (var i = 0; i < parts.length; i++) {
      acc = acc ? acc + '/' + parts[i] : parts[i];
      html += '<span class="cz-crumb-sep" aria-hidden="true">/</span>';
      html += (i === parts.length - 1)
        ? '<span class="cz-crumb cz-crumb--cur" aria-current="true">' + esc(parts[i]) + '</span>'
        : '<button type="button" class="cz-crumb" data-cz-scope="' + esc(acc) + '">' +
            esc(parts[i]) + '</button>';
    }
    return '<div class="cz-tree-scope" aria-label="Scope">' + html + '</div>';
  }

  /* ============================== CZ.confirm =============================
     Contract section 8. There is exactly ONE confirm implementation in the
     project and it is PM.confirm at _pm-components.js:498 -- already wired,
     already themed, already focus-trapped, already Escape-aware. This is a
     pass-through with the design's default copy, not a second sheet.

     def: { title, body, confirmLabel, cancelLabel, danger, from }
     returns Promise<boolean>. */
  CZ.confirm = function (def) {
    var P = pm();
    if (!P || !P.confirm) {
      warnOnce('noconfirm', 'PM.confirm is unavailable; the destructive action was refused rather than run unconfirmed.');
      return { then: function (fn) { fn(false); return this; }, catch: function () { return this; } };
    }
    return P.confirm(def || {});
  };

  /* =========================== mount / behaviour =========================
     Everything below is runtime. It attaches ONE listener set per `.cz`
     panel root and nothing per row. */

  var ROW_SEL   = '.cz-row';
  var HOST_SEL  = '[data-cz-list],[data-cz-tree]';
  /* Controls that own their own keys and their own clicks. A click on an
     overflow trigger is not a click on the row. */
  var NESTED_SEL = 'button,a[href],input,textarea,[role="menuitem"],[role="option"][data-pm-opt],' +
                   '[data-pm-menu],[data-pm-select]';

  function rowsIn(host) {
    return Array.prototype.slice.call(host.querySelectorAll(ROW_SEL));
  }
  function visibleRows(host) {
    return rowsIn(host).filter(function (r) {
      return !r.hidden && r.style.display !== 'none';
    });
  }
  function depthOf(row) {
    var d = row.getAttribute('data-cz-d');
    return d == null ? 0 : (parseInt(d, 10) || 0);
  }
  function hostOf(row) { return row.closest ? row.closest(HOST_SEL) : null; }

  function setHidden(row, hidden) {
    /* Inline style, deliberately. `hidden` alone loses to any stylesheet rule
       that sets display on .cz-row, and the CSS agent has every right to set
       one. An inline display beats it without an !important arms race, and it
       is applied at runtime so it never appears in the markup contract. */
    row.hidden = !!hidden;
    row.style.display = hidden ? 'none' : '';
  }

  /* -------------------------------------------------- roving tab stop
     Exactly one row per host is tabindex="0". A 10,000-row tree where every
     row is a tab stop is a tab trap, and it is impossible under recycling
     anyway -- the recycled row would carry the stop with it. */
  function setStop(host, row) {
    if (!host) return;
    var prev = host.querySelector(ROW_SEL + '[tabindex="0"]');
    if (!row) {
      /* No row named: keep the existing stop if it is still reachable,
         otherwise adopt the first visible row. The early-return below must
         NOT fire on prev === row === null, or a freshly mounted list ends up
         with zero tab stops and Tab skips the whole list -- which is the
         defect this branch exists to prevent. */
      if (prev && !prev.hidden && prev.style.display !== 'none') return;
      row = visibleRows(host)[0] || rowsIn(host)[0];
      if (!row) return;
    }
    if (prev === row) return;
    if (prev) prev.tabIndex = -1;
    row.tabIndex = 0;
  }

  function select(host, row) {
    if (!host || !row) return;
    /* Two node writes, not N: aria-selected on every row of a 12,400-row tree
       on every arrow press is how a keyboard model becomes janky. */
    var prev = host.querySelector(ROW_SEL + '[aria-selected="true"]');
    if (prev && prev !== row) { prev.setAttribute('aria-selected', 'false'); prev.classList.remove('is-selected'); }
    row.setAttribute('aria-selected', 'true');
    row.classList.add('is-selected');
  }

  function deselect(host) {
    if (!host) return false;
    var prev = host.querySelector(ROW_SEL + '[aria-selected="true"]');
    if (!prev) return false;
    prev.setAttribute('aria-selected', 'false');
    prev.classList.remove('is-selected');
    return true;
  }

  function focusRow(host, row) {
    if (!row) return;
    setStop(host, row);
    row.focus();
    if (row.scrollIntoView) row.scrollIntoView({ block: 'nearest' });
  }

  function emit(node, name, detail) {
    if (!node || typeof CustomEvent !== 'function') return;
    node.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail || {} }));
  }

  /* ------------------------------------------------ folder open / close
     Flat DOM makes this a single linear pass over the subtree. `closedAt`
     is the depth of the nearest collapsed ancestor, exactly as in the
     render pass, so the two can never disagree. */
  function setFolder(row, open) {
    if (row.getAttribute('data-cz-kind') !== 'dir') return;
    var host = row.closest('[data-cz-tree]');
    if (!host) return;
    row.setAttribute('aria-expanded', open ? 'true' : 'false');
    var tw = row.querySelector('.cz-tw');
    if (tw) tw.innerHTML = CZ.icon(open ? 'down' : 'chev', 'cz-tw-ico', 10);

    var rows = rowsIn(host);
    var i = rows.indexOf(row);
    if (i < 0) return;
    var d = depthOf(row), closedAt = null;

    for (var j = i + 1; j < rows.length; j++) {
      var dj = depthOf(rows[j]);
      if (dj <= d) break;
      if (closedAt !== null && dj > closedAt) { setHidden(rows[j], true); continue; }
      closedAt = null;
      setHidden(rows[j], !open);
      if (!open) { closedAt = d; continue; }
      if (rows[j].getAttribute('aria-expanded') === 'false') closedAt = dj;
    }

    /* If focus was inside what just closed, bring it back to the folder
       rather than losing it to the body. */
    var act = document.activeElement;
    if (!open && act && act !== row && host.contains(act) &&
        act.closest && act.closest(ROW_SEL) &&
        (act.hidden || act.style.display === 'none')) {
      focusRow(host, row);
    }
    emit(row, 'cz:toggle', { path: row.getAttribute('data-cz-path'), open: open, row: row });
  }
  CZ.setFolder = setFolder;

  function parentRow(host, row) {
    var rows = visibleRows(host);
    var i = rows.indexOf(row), d = depthOf(row);
    for (var j = i - 1; j >= 0; j--) if (depthOf(rows[j]) < d) return rows[j];
    return null;
  }

  /* -------------------------------------------------- panel toggles */
  function toggleBox(headBtn, boxSel) {
    var wrap = headBtn.closest ? headBtn.closest('.cz-shelf,.cz-ex') : null;
    if (!wrap) return;
    var box = wrap.querySelector(boxSel);
    if (!box) return;
    var open = headBtn.getAttribute('aria-expanded') !== 'true';
    headBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    wrap.setAttribute('data-cz-open', open ? 'true' : 'false');
    box.setAttribute('data-cz-open', open ? 'true' : 'false');

    var chev = headBtn.querySelector('.cz-shelf-chev,.cz-ex-chev');
    if (chev) {
      var cls = chev.getAttribute('class') || '';
      chev.outerHTML = CZ.icon(open ? 'down' : 'chev', cls, 10);
    }

    if (open) {
      box.hidden = false;
      box.style.display = '';
      if (global.PMM && global.PMM.expand) global.PMM.expand(box, true);
    } else {
      if (global.PMM && global.PMM.expand) global.PMM.expand(box, false);
      /* The payload must leave the TAB ORDER, not merely look closed
         (contract section 7). display:none is the only thing that does that,
         and it is set after the motion layer has had its beat. */
      var ms = (global.PMM && global.PMM.reduced && global.PMM.reduced()) ? 0 : 200;
      setTimeout(function () {
        if (box.getAttribute('data-cz-open') === 'false') {
          box.hidden = true;
          box.style.display = 'none';
        }
      }, ms);
    }
    emit(headBtn, 'cz:disclose', { open: open, box: box });
  }

  /* ------------------------------------------------------- type-ahead */
  var taBuf = '', taAt = 0, taHost = null;
  function typeAhead(host, from, ch) {
    var now = Date.now();
    if (now - taAt >= 700 || host !== taHost) {
      taBuf = ch;                          /* expired, or a different list */
    } else if (taBuf && isRepeat(taBuf, ch)) {
      /* APG: the same character typed in succession CYCLES through the items
         starting with it, rather than searching for "aa". Without this,
         pressing "a" twice to reach the second a-file searches for a prefix
         nothing has and the second press does nothing at all. */
      taBuf = ch;
    } else {
      taBuf = taBuf + ch;
    }
    taAt = now;
    taHost = host;
    var q = taBuf.toLowerCase();
    var rows = visibleRows(host);
    if (!rows.length) return null;
    var start = rows.indexOf(from);
    /* A repeated single character cycles through matches; a growing buffer
       refines the current one. */
    var begin = (taBuf.length === 1) ? start + 1 : start;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[(begin + i + rows.length) % rows.length];
      var t = nameText(r).toLowerCase();
      if (t.indexOf(q) === 0) return r;
    }
    return null;
  }

  /* True when the buffer is one character repeated and `ch` repeats it. */
  function isRepeat(buf, ch) {
    var c = ch.toLowerCase();
    for (var i = 0; i < buf.length; i++) if (buf.charAt(i).toLowerCase() !== c) return false;
    return true;
  }

  function nameText(row) {
    var n = row.querySelector('.cz-name,.cz-row-id');
    return (n ? n.textContent : row.textContent || '').trim();
  }

  /* ------------------------------------------------ the delegated keys */
  function onKey(e) {
    var t = e.target;
    if (!t || !t.closest) return;

    /* A tablist is a roving list too: one tab stop, arrows within. Without
       this the tab strip is a mouse-only navigation, which is the same defect
       as a div expander -- reachable by eye, not by keyboard. */
    var tab = t.closest('.cz-tab');
    if (tab && tab === t) { if (onTabKey(tab, e)) { e.preventDefault(); e.stopImmediatePropagation(); } return; }

    /* Confirm-gated buttons and disclosure headers keep their own native
       button keys; only ROWS are ours. */
    var row = t.closest(ROW_SEL);
    if (!row || row !== t) return;
    var host = hostOf(row);
    if (!host) return;

    var isTree = host.hasAttribute('data-cz-tree');
    var dir = isTree && row.getAttribute('data-cz-kind') === 'dir';
    var open = row.getAttribute('aria-expanded') === 'true';
    var rows = visibleRows(host);
    var i = rows.indexOf(row);
    var k = e.key;
    var handled = true;

    switch (k) {
      case 'ArrowDown': focusRow(host, rows[Math.min(rows.length - 1, i + 1)]); break;
      case 'ArrowUp':   focusRow(host, rows[Math.max(0, i - 1)]); break;
      case 'Home':      focusRow(host, rows[0]); break;
      case 'End':       focusRow(host, rows[rows.length - 1]); break;
      case 'PageDown':  focusRow(host, rows[Math.min(rows.length - 1, i + 10)]); break;
      case 'PageUp':    focusRow(host, rows[Math.max(0, i - 10)]); break;

      /* Right expands, or enters. Left collapses, or goes to the parent.
         The ARIA practice, and the only pair of keys that lets a keyboard
         user navigate depth without Tab. */
      case 'ArrowRight':
        if (dir && !open) setFolder(row, true);
        else if (dir && open) focusRow(host, rows[i + 1] || row);
        break;
      case 'ArrowLeft':
        if (dir && open) setFolder(row, false);
        else focusRow(host, parentRow(host, row) || row);
        break;

      case 'Enter':
        select(host, row);
        if (dir) setFolder(row, !open);
        emit(row, 'cz:activate', rowDetail(row));
        break;
      case ' ':
      case 'Spacebar':
        /* role=option says Space activates; the page says Space scrolls.
           Claim it, or the list jumps a screen on every selection. */
        select(host, row);
        emit(row, 'cz:activate', rowDetail(row));
        break;

      case 'Escape':
        if (!deselect(host)) handled = false;
        break;

      case '*':
        /* APG: expand every sibling at this level. */
        expandSiblings(host, row);
        break;

      case 'F10':
        if (e.shiftKey) openRowMenu(row); else handled = false;
        break;
      case 'ContextMenu':
        openRowMenu(row);
        break;

      default:
        if (k && k.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          var hit = typeAhead(host, row, k);
          if (hit) focusRow(host, hit); else handled = false;
        } else handled = false;
    }

    if (!handled) return;
    e.preventDefault();
    /* Stop here, in capture, so PM.list's roving model -- which binds on the
       BUBBLE phase of whatever host it discovered -- never sees the key and
       the two models never fight over the same arrow. */
    e.stopImmediatePropagation();
  }

  function tabsOf(tab) {
    var strip = tab.closest('.cz-tabs');
    return strip ? Array.prototype.slice.call(strip.querySelectorAll('.cz-tab')) : [];
  }

  function pickTab(tab) {
    var all = tabsOf(tab);
    for (var i = 0; i < all.length; i++) {
      var on = all[i] === tab;
      all[i].setAttribute('aria-selected', on ? 'true' : 'false');
      all[i].tabIndex = on ? 0 : -1;
    }
    emit(tab, 'cz:tab', { id: tab.getAttribute('data-cz-tab') || '', tab: tab });
  }

  function onTabKey(tab, e) {
    var all = tabsOf(tab);
    var i = all.indexOf(tab);
    var to = null;
    switch (e.key) {
      case 'ArrowRight': to = all[(i + 1) % all.length]; break;
      case 'ArrowLeft':  to = all[(i - 1 + all.length) % all.length]; break;
      case 'Home':       to = all[0]; break;
      case 'End':        to = all[all.length - 1]; break;
      case 'Enter': case ' ': case 'Spacebar': pickTab(tab); return true;
      default: return false;
    }
    if (!to) return false;
    to.tabIndex = 0;
    tab.tabIndex = -1;
    to.focus();
    return true;
  }

  function expandSiblings(host, row) {
    var d = depthOf(row);
    visibleRows(host).forEach(function (r) {
      if (depthOf(r) === d && r.getAttribute('aria-expanded') === 'false') setFolder(r, true);
    });
  }

  /* The keyboard route to a row's actions. Inline action buttons inside a row
     are MOUSE affordances -- they carry tabindex="-1" because one tab stop per
     list is the whole point of a roving model -- so the keyboard reaches them
     through the row's overflow menu, exactly as a file manager's context menu
     does. A row with buttons but no menu falls back to focusing the first
     button, so a keyboard user is never simply locked out. */
  function openRowMenu(row) {
    var trig = row.querySelector('[data-pm-menu] .pm-menu-trigger, [data-pm-menu] button');
    if (trig) { trig.click(); return; }
    var btn = row.querySelector('.cz-row-acts button, .cz-tacts button');
    if (btn) btn.focus();
  }

  function rowDetail(row) {
    return {
      row: row,
      key: row.getAttribute('data-cz-key') || row.getAttribute('data-cz-path') || '',
      path: row.getAttribute('data-cz-path') || '',
      kind: row.getAttribute('data-cz-kind') || 'row'
    };
  }

  /* ------------------------------------------------- the delegated click */
  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;

    /* 1. the destructive gate, first, in capture, before anything can act on
       the click. */
    var gated = t.closest('[data-cz-confirm]');
    if (gated) {
      if (gated.__czOK) { gated.__czOK = false; return; }
      if (gated.getAttribute('aria-disabled') === 'true') { e.preventDefault(); e.stopImmediatePropagation(); return; }
      e.preventDefault();
      e.stopImmediatePropagation();
      CZ.confirm({
        title: gated.getAttribute('data-cz-confirm'),
        body: gated.getAttribute('data-cz-say') || '',
        confirmLabel: gated.getAttribute('data-cz-ok') || 'Confirm',
        danger: gated.hasAttribute('data-cz-danger'),
        from: gated
      }).then(function (ok) {
        if (!ok) return;
        gated.__czOK = true;
        gated.click();
      });
      return;
    }

    /* 2. tabs. */
    var tab = t.closest('.cz-tab');
    if (tab) {
      if (tab.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      pickTab(tab);
      return;
    }

    /* 3. disclosure headers. Expansion is NOT exclusive: nothing here closes
       a sibling. */
    var head = t.closest('[data-cz-act="shelf"]');
    if (head) { toggleBox(head, '.cz-shelf-body'); return; }
    var exh = t.closest('[data-cz-act="ex"]');
    if (exh) { toggleBox(exh, '.cz-ex-body'); return; }

    /* 4. scope breadcrumb / re-root. */
    var crumb = t.closest('[data-cz-scope]');
    if (crumb && crumb.tagName === 'BUTTON') {
      emit(crumb, 'cz:scope', { scope: crumb.getAttribute('data-cz-scope') || '' });
      return;
    }

    /* 5. rows. A click inside a nested control is that control's. */
    var row = t.closest(ROW_SEL);
    if (!row) return;
    var nested = t.closest(NESTED_SEL);
    if (nested && row.contains(nested) && nested !== row) return;

    var host = hostOf(row);
    if (!host) return;

    var tw = t.closest('[data-cz-act="twisty"]');
    if (tw && row.contains(tw)) {
      setFolder(row, row.getAttribute('aria-expanded') !== 'true');
      focusRow(host, row);
      e.stopImmediatePropagation();
      return;
    }

    select(host, row);
    focusRow(host, row);
    emit(row, 'cz:activate', rowDetail(row));
    e.stopImmediatePropagation();
  }

  function onFocusIn(e) {
    var row = e.target && e.target.closest ? e.target.closest(ROW_SEL) : null;
    if (!row) return;
    setStop(hostOf(row), row);
  }

  /* ================================ CZ.mount =============================
     Idempotent. Binds one listener set per `.cz` panel root and gives every
     list host exactly one tab stop.

     Deliberately runs LATE (rAF / MutationObserver), after PM.mountAll has
     done its structural sweep. PM's generic list discovery only claims
     elements that already carry a tabindex ATTRIBUTE; CZ rows gain theirs
     here, so PM never binds a second roving model to them. */
  CZ.mount = function (root) {
    root = root || document;
    if (!root.querySelectorAll) return;

    var roots = [];
    if (root.matches && root.matches('.cz')) roots.push(root);
    Array.prototype.push.apply(roots, root.querySelectorAll('.cz'));

    for (var i = 0; i < roots.length; i++) {
      var r = roots[i];
      if (!r.__czBound) {
        r.__czBound = true;
        /* Capture phase, at the panel root. One listener for every row in
           the panel, and it runs before any bubble handler further down. */
        r.addEventListener('keydown', onKey, true);
        r.addEventListener('click', onClick, true);
        r.addEventListener('focusin', onFocusIn, true);
      }
      var hosts = r.querySelectorAll(HOST_SEL);
      for (var j = 0; j < hosts.length; j++) {
        var h = hosts[j];
        if (!h.querySelector(ROW_SEL + '[tabindex="0"]')) setStop(h, null);
        /* Action controls inside a row are reachable by Shift+F10 /
           ContextMenu from the row, not by Tab: one tab stop per list is the
           whole point of a roving model. */
        var trigs = h.querySelectorAll(ROW_SEL + ' button');
        for (var t2 = 0; t2 < trigs.length; t2++) trigs[t2].tabIndex = -1;
      }
    }
  };

  /* Auto-mount. childList only -- observing attributes would re-fire on the
     tabindex writes mount itself makes. */
  if (typeof document !== 'undefined') {
    var raf = global.requestAnimationFrame || function (fn) { return setTimeout(fn, 16); };
    var queued = false;
    function schedule() {
      if (queued) return;
      queued = true;
      raf(function () { queued = false; CZ.mount(document); });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule);
    else schedule();
    if (typeof MutationObserver === 'function') {
      new MutationObserver(schedule).observe(document.documentElement || document,
        { childList: true, subtree: true });
    }
  }

  CZ.version = '1';
  global.CZ = CZ;
})(window);
