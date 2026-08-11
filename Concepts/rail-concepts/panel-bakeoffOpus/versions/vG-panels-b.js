/* PANEL BAKEOFF - vG  COZY SHELVES   panels B:  SEARCH + SOURCE CONTROL
   =========================================================================
   Owns  VG_PANELS.search  and  VG_PANELS.source.

   Everything here is composed from the four cozy primitives -- shelf, row,
   expandable row, body -- through window.CZ. There is not one private class
   in this file: where the design system had no answer (a text field) the
   shared kit's own control is reused rather than a .cz-* look-alike being
   invented, because a one-off class in a panel file is how a design system
   rots.

   THE TWO MEASURED DEFECTS THIS FILE EXISTS TO FIX
   -------------------------------------------------------------------------
   1  SEARCH: the source design renders the match line from column 0 with
      white-space:nowrap, so at 280px four of fifteen highlighted rows showed
      NONE of the query -- the panel answered "here are your matches" and
      then hid every one of them. winText() below windows the line AROUND the
      highlight: leading indentation is dropped, up to 8 characters of
      context are taken from the END of 'pre', the remainder is filled from
      'post', and dropped characters are declared with a single ellipsis on
      the side they were dropped from. If the match itself is longer than the
      budget the MATCH is truncated on the right and its left edge and
      highlight styling are kept, so the highlight is never the thing that
      scrolls out. research/search.md section 6, clauses 3 and 4.

   2  SOURCE: the branch selector was display:none below 250px with nothing
      in its place, so the one control that says which context you are in
      vanished at the width where it matters most. Here it is a PM combobox
      at bucket 1+ and it MOVES INTO THE HEADER OVERFLOW at bucket 0 -- the
      full branch list, with ahead/behind hints and a per-branch disabled
      reason, still reachable at 220px. Nothing is deleted at any width.

   WHAT THE WIDTH ACTUALLY DRIVES (read from cfg, never from module scope)
   -------------------------------------------------------------------------
     bucket             0 (<280)     1 (280-359)  2 (360-479)  3 (480+)
     search flags       yes          yes          yes          yes
     search scope       overflow     combobox     combobox     combobox
     replace row        caret only   caret only   open         open
     match window       ~21 chars    ~30          ~41          ~57
     source branch      overflow     combobox     combobox     combobox
     worktree filter    3 + overflow icons        icons        labels
     sync row           overflow     overflow     footer       footer
     lifecycle word     meta line 1  pill         pill         pill

   ACCESSIBILITY NOTES, HONESTLY
     - Every disclosure is CZ.shelf / CZ.exRow, so every one is a real
       <button type=button> with aria-expanded and a display:none payload.
     - Every list is a CZ.list host, so the roving tabindex and the arrow /
       Home / End / type-ahead model in CZ.mount applies to it.
     - id= is banned in panel markup, so the disabled-Remove reason is NOT
       associated by aria-describedby. Instead the reason renders as a
       CZ.blocked note in the SAME expanded body, immediately above the
       action row it explains, and the disabled control repeats the reason
       code in its own tooltip text. This is a deviation from
       research/source.md section 6 and it is called out rather than hidden.
     - Match rows carry the untrimmed source line as data-pm-tip and, because
       role=option takes its accessible name from its contents, the visible
       text is the accessible text. No hover-only fact anywhere.
   ========================================================================= */

window.VG_PANELS = window.VG_PANELS || {};

(function (global) {
  'use strict';

  var CZ = global.CZ;
  var K  = global.PMK;

  if (!CZ) {
    /* Fail loudly and once, rather than throwing inside every render. */
    if (global.console && console.warn) console.warn('[vG-panels-b] window.CZ is missing; search and source cannot render.');
    return;
  }

  var esc = CZ.esc;
  var E   = CZ.ELLIPSIS;
  var CH  = CZ.CH;

  /* ---------------------------------------------------------------- cfg
     The harness passes its own state object as cfg. Contract spells the
     width 'w'; the shell spells it 'width'. Read both, prefer the contract,
     and NEVER read a module-scope width -- that bug measured every
     responsive design against the control bar's width instead of the box it
     was laid out in. */
  function pw(cfg) {
    if (!cfg) return 380;
    var v = cfg.w != null ? cfg.w : cfg.width;
    v = +v;
    return v > 0 ? v : 380;
  }
  function ptheme(cfg) { return (cfg && (cfg.theme || cfg.themeId)) || ''; }

  /* Text-size ladder. --cz-scale models general.visual.panel-text-size, so
     the panel reads ONE number rather than ten scattered decisions. */
  function ptext(cfg) {
    var d = cfg && (cfg.text || cfg.density);
    if (d === 'larger') return 'larger';
    if (d === 'large' || d === 'spacious') return 'large';
    return 'normal';
  }

  function root(b, cfg, inner) {
    return '<div class="cz" data-cz-b="' + b + '" data-cz-text="' + ptext(cfg) + '"' +
      ' data-cz-theme="' + esc(ptheme(cfg)) + '">' + inner + '</div>';
  }

  function num(n) {
    n = +n || 0;
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function plural(n, one, many) { return num(n) + ' ' + (+n === 1 ? one : many); }

  /* A text field. The cozy system has no input primitive and inventing
     .cz-field would be exactly the rot the brief forbids, so the shared
     kit's own field is reused -- the same control every other design in the
     bakeoff uses, which is also why it is themed already. */
  function field(value, label, place, extra) {
    return '<input class="pmk-field" type="text"' +
      ' value="' + esc(value == null ? '' : value) + '"' +
      ' aria-label="' + esc(label) + '"' +
      ' placeholder="' + esc(place || '') + '"' +
      ' style="flex:1 1 auto;min-width:0' + (extra ? ';' + extra : '') + '">';
  }

  /* A pressed-state toggle. .cz-btn, aria-pressed, >= 24px -- composed, not
     invented. */
  function toggle(label, id, tip, on) {
    return '<button type="button" class="cz-btn' + (on ? ' cz-btn--primary' : '') + '"' +
      ' aria-pressed="' + (on ? 'true' : 'false') + '"' +
      ' data-cz-action="' + esc(id) + '" data-pm-action="' + esc(id) + '"' +
      ' data-pm-tip="' + esc(tip + (on ? ' - on' : ' - off')) + '"' +
      ' aria-label="' + esc(tip) + '">' + esc(label) + '</button>';
  }

  function ibtn(id, icon, tip, o) {
    o = o || {};
    return '<button type="button" class="cz-ibtn"' +
      ' data-cz-action="' + esc(id) + '" data-pm-action="' + esc(id) + '"' +
      (o.disabled ? ' aria-disabled="true"' : '') +
      (o.expanded != null ? ' aria-expanded="' + (o.expanded ? 'true' : 'false') + '"' : '') +
      ' data-pm-tip="' + esc(tip) + '" aria-label="' + esc(tip) + '">' +
      CZ.icon(icon, 'cz-ico', 12) + '</button>';
  }

  /* One line of qualification that must not wrap: .cz-meta already clips and
     ellipsizes, so a note built from it is a strip and never a card. */
  function strip(state, icon, text, acts) {
    return '<div class="cz-note" data-cz-state="' + esc(state) + '">' +
      CZ.icon(icon, 'cz-ico cz-ico--cat', 12) +
      '<span class="cz-meta" style="flex:1 1 auto">' + esc(text) + '</span>' +
      (acts || '') + '</div>';
  }

  function menu(items, tip) {
    var live = [];
    for (var i = 0; i < items.length; i++) if (items[i]) live.push(items[i]);
    return CZ.menu(live, { tip: tip });
  }

  function sep()        { return { type: 'sep' }; }
  function head(label)  { return { type: 'head', label: label }; }

  function basename(p) {
    p = String(p || '');
    var i = p.lastIndexOf('/');
    return i < 0 ? p : p.slice(i + 1);
  }
  function dirname(p) {
    p = String(p || '');
    var i = p.lastIndexOf('/');
    return i < 0 ? '' : p.slice(0, i);
  }


  /* =======================================================================
     ============================== S E A R C H ============================
     =======================================================================

     Region order is the canonical one from research/search.md section 1:
     header, query, replace, scope, freshness (ONE line, never a card), the
     results tree, the nav footer, and the whole indexing control surface
     behind a collapsed shelf. The 130px Index/Engine/Documents/Last-indexed
     card that sits above the query field in PMConcept7 is gone; its four
     facts live in the Index shelf and its freshness fact is the one-line
     strip, which is what the spec actually asks for. */

  /* The freshness vocabulary is exactly four values plus indexing-off and
     the cancelled build. The live token is the SHARED status word ('ok');
     the search vocabulary spells the same state 'indexed'. Resolve the alias
     once, here, and match on nothing below. */
  var IX_ALIAS = { ok: 'indexed' };
  var IX_STATE = {
    indexed:   { state: 'ok',   icon: 'check' },
    stale:     { state: 'warn', icon: 'clock' },
    unindexed: { state: 'idle', icon: 'slash' },
    fallback:  { state: 'warn', icon: 'warn'  },
    disabled:  { state: 'idle', icon: 'slash' },
    cancelled: { state: 'warn', icon: 'stop'  }
  };

  function freshnessOf(ix) {
    var id = IX_ALIAS[ix.state] || ix.state;
    var spec = null, list = ix.states || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) spec = list[i];
    if (!spec) spec = { id: id, line: String(id), annotateRows: true };
    var mark = IX_STATE[spec.id] || IX_STATE.stale;
    return { id: spec.id, line: spec.line, annotate: !!spec.annotateRows,
             state: mark.state, icon: mark.icon };
  }

  /* --------------------------------------------------------- the window
     THE defect fix. Never returns a window without the highlight in it. */
  function winText(hit, chars) {
    var pre  = String(hit.pre  == null ? '' : hit.pre).replace(/^[\s]+/, '');
    var post = String(hit.post == null ? '' : hit.post);
    var mid  = String(hit.hit  == null ? '' : hit.hit);

    var budget = Math.max(10, Math.floor(chars) || 0);
    var out = { lead: '', hit: mid, tail: '', cutL: false, cutR: false, cutHit: false };

    /* clause 4: a match longer than the line is truncated on the RIGHT, its
       left edge and its highlight kept. It is never the thing that is
       scrolled out of view. */
    var hitMax = Math.max(4, budget - 6);
    if (out.hit.length > hitMax) {
      out.hit = out.hit.slice(0, hitMax - 1) + E;
      out.cutHit = true;
    }

    var room = Math.max(0, budget - out.hit.length);
    /* clause 3: up to 8 characters of context BEFORE the match, taken from
       the end of pre -- not from column 0. */
    var lead = Math.min(8, room);
    if (pre.length > lead) {
      out.cutL = true;
      out.lead = lead > 1 ? pre.slice(pre.length - (lead - 1)) : '';
    } else {
      out.lead = pre;
    }

    var used = out.lead.length + (out.cutL ? 1 : 0);
    var tailRoom = Math.max(0, room - used);
    if (post.length > tailRoom) {
      out.cutR = true;
      out.tail = tailRoom > 1 ? post.slice(0, tailRoom - 1) : '';
    } else {
      out.tail = post;
    }
    return out;
  }

  /* Characters the windowed line may spend. Every fixed cost is subtracted
     by name so the number can be argued with rather than guessed at. */
  function matchChars(W, b) {
    /* Measured against the real spacing tokens rather than guessed. A match
       row sits four boxes deep -- scroller, shelf, group body, row -- and
       every one of them is a real cost this design chooses to pay for the
       shelf reading. Buckets 0/1 use the tightened --sm/--md paddings, 2/3
       the --md/--lg ones.
                                    b0/b1     b2/b3
         scroller padding             8         16
         shelf border                 2          2
         shelf body padding          16         24
         group (exRow) body padding  16         24
         row padding                  8          8
         action gutter, at rest      24         24
                                    ----       ----
                                     74         98
       Which yields ~21 characters at 240px and ~40 at 380px. The research
       brief's 29 and 50 assume a flat list with no card around it; the gap
       is the price of the shelf and it is stated rather than hidden. */
    var px = W - (b >= 2 ? 98 : 74);
    return Math.max(14, Math.floor(px / CH) - 4 /* the inline line number */);
  }

  function matchRow(f, hit, chars, armed) {
    var wnd  = winText(hit, chars);
    var full = String(hit.pre == null ? '' : hit.pre) + hit.hit +
               String(hit.post == null ? '' : hit.post);
    var key  = f.path + ':' + hit.line;

    var acts = armed
      ? CZ.act({ id: 'cmd.search.replace_selected', icon: 'refresh',
                 aria: 'Replace this match', tip: 'Replace this match',
                 confirm: { title: 'Replace this match?',
                            say: key + ' is rewritten on disk. One match, this file only.',
                            ok: 'Replace' } })
      : CZ.act({ id: 'cmd.search.open_result', icon: 'ext',
                 aria: 'Open ' + key, tip: 'Open ' + key });

    return '<div class="cz-row cz-row--1line" role="option" tabindex="-1"' +
      ' aria-selected="false" data-cz-row' +
      ' data-cz-key="' + esc(key) + '"' +
      ' data-cz-path="' + esc(f.path) + '"' +
      ' data-pm-tip="' + esc(full.replace(/^[\s]+/, '')) + '">' +
      '<span class="cz-main">' +
        '<span class="cz-name cz-name--mono">' +
          '<span class="cz-meta cz-meta--mono">' + esc(hit.line) + '</span> ' +
          (wnd.cutL ? E : '') + esc(wnd.lead) +
          /* background + weight + a bounded box: three non-hue channels, per
             FinalGUISpec 13.1. The colour it does carry is the shelf's one
             accent channel, inherited -- no second vocabulary. */
          '<b class="cz-chip cz-chip--mono">' + esc(wnd.hit) + '</b>' +
          esc(wnd.tail) + (wnd.cutR ? E : '') +
        '</span>' +
      '</span>' +
      '<span class="cz-acts">' + acts + '</span>' +
      '</div>';
  }

  function fileGroup(f, i, W, b, chars, armed) {
    var rows = [];
    var hits = f.hits || [];
    for (var j = 0; j < hits.length; j++) rows.push(matchRow(f, hits[j], chars, armed));

    var meta = [plural(f.count == null ? hits.length : f.count, 'match', 'matches')];
    if (f.vendored) meta.push('vendored');
    if (dirname(f.path)) meta.push(dirname(f.path));

    return CZ.exRow({
      w: W, bucket: b,
      key: 'grp:' + f.path,
      name: f.path,
      nameKind: 'path',
      /* the basename is the only reliably identifying token, so the DIRECTORY
         is what gets middle-truncated -- never the tail. */
      chip: { label: String(f.count == null ? hits.length : f.count), mono: true },
      meta: meta,
      state: f.vendored ? 'idle' : null,
      /* the first two groups open, the rest closed: a result set is scanned
         file-first and 48 open match rows is a wall, not an answer. */
      open: i < 2,
      acts: menu([
        { value: 'cmd.search.open_result', label: 'Open ' + basename(f.path) },
        { value: 'cmd.search.replace_in_files', label: 'Replace in this file' },
        { value: 'cmd.search.collapse_all', label: 'Collapse all groups' },
        { value: 'cmd.search.expand_all', label: 'Expand all groups' }
      ], 'Actions for ' + basename(f.path)),
      body: CZ.list(rows.join(''), { label: f.path + ' matches', key: 'm:' + f.path })
    });
  }

  /* ---------------------------------------------------------- record rows
     F3-047 requires Orchestrator-owned hits to expose object/record identity
     and a /record route target rather than a bare text hit, and the research
     records that no row spec exists for them. These are NOT files: no path,
     no line, no pre/hit/post. So they get their own shelf and their own row
     grammar -- kind chip, record label as identity, ROUTE as the first thing
     on the qualification line -- and are never added to the 48 text matches.
     recordSummary is deliberately separate from summary in the fixture and
     it stays separate here. */
  function recordRow(r, W, b) {
    return CZ.exRow({
      w: W, bucket: b,
      key: 'rec:' + r.id,
      name: r.label,
      nameKind: 'default',
      chip: { label: r.objectKind, mono: true },
      meta: [r.route, r.field, r.owner, r.when],
      state: 'run',
      open: false,
      acts: menu([
        { value: 'cmd.search.open_result', label: 'Open record' },
        { value: 'cmd.search.open_result', label: 'Copy route target' }
      ], 'Record actions'),
      body: CZ.body({
        summary: esc(r.excerpt),
        facts: [
          CZ.kv('Route', r.route, 'token', { bucket: b, w: W }),
          CZ.kv('Object', r.objectKind + ' ' + r.id, 'token', { bucket: b, w: W }),
          CZ.kv('Field', r.field, 'token', { bucket: b, w: W }),
          CZ.kv('Owner', r.owner, 'token', { bucket: b, w: W }),
          CZ.kv('Matched', r.when + ' ago', 'measure', { bucket: b, w: W })
        ],
        actions: '<div class="cz-actions">' +
          CZ.act({ id: 'cmd.search.open_result', label: 'Open record', primary: true }) +
          CZ.act({ id: 'cmd.search.open_result', label: 'Copy route' }) +
          '</div>'
      })
    });
  }

  function pSearch(D, cfg) {
    var W = pw(cfg), b = CZ.bucket(W);
    var S  = (D && D.search) || {};
    var ix = S.index || {}, rem = S.remote || {};
    var files = S.files || [], recs = S.records || [];
    var sum = S.summary || { matches: 0, files: 0 };
    var pg  = S.paging || {};
    var rsum = S.recordSummary || { records: (recs || []).length };
    var flags = S.flags || {};
    var fresh = freshnessOf(ix);

    var hasQuery = !!(S.query && String(S.query).length);
    var armed    = !!(S.replace && String(S.replace).length);
    /* P1: the replace row appears at 380px. Below that it is a caret in the
       header and Ctrl+Shift+H, exactly as the brief allocates it. */
    var replaceOpen = b >= 2;
    var chars = matchChars(W, b);

    var lastBuild = ix.lastBuild || null;

    /* Evict remote cache is offered by every version against a service the
       fixture says is DOWN. That is an enablement problem, not a confirm
       problem: the item stays visible and disabled, citing the reason code
       and the sentence, wherever it appears. */
    var evict = {
      value: 'cmd.search.evict_remote_cache', label: 'Evict remote cache',
      disabled: !rem.available, reason: rem.reason, sentence: rem.sentence
    };

    /* ------------------------------------------------------------ header */
    var h = '';
    h += '<div class="cz-banner">' +
      '<span class="cz-banner-ico">' + CZ.icon('search', '', 12) + '</span>' +
      '<span class="cz-title">Search</span>' +
      '<span class="cz-banner-acts">' +
        ibtn('cmd.search.replace_in_files', replaceOpen ? 'down' : 'chev',
             'Replace in files (Ctrl+Shift+H)', { expanded: replaceOpen }) +
        menu([
          head('Results'),
          { value: 'cmd.search.expand_all',   label: 'Expand all' },
          { value: 'cmd.search.collapse_all', label: 'Collapse all' },
          { value: 'cmd.search.next_result',  label: 'Next match (F3)' },
          { value: 'cmd.search.previous_result', label: 'Previous match (Shift+F3)' },
          sep(),
          head('Replace'),
          { value: 'cmd.search.replace_in_files', label: 'Replace in files (Ctrl+Shift+H)' },
          /* Replace all is destructive, so the menu only ROUTES to the
             preview; the apply button is a gated CZ.act in three places. */
          { value: 'cmd.search.replace_in_files', label: 'Preview replace all',
            disabled: !armed, reason: 'replacement_string_empty',
            sentence: 'Type a replacement before replacing ' + num(sum.matches) + ' matches.' },
          sep(),
          head('Scope'),
          /* bucket 0 has no room for the combobox, so the whole scope
             vocabulary moves here rather than disappearing. */
          (b < 1 ? { value: 'cmd.search.set_scope', label: 'Set scope...' } : null),
          (b < 1 ? { value: 'cmd.search.clear_scope', label: 'Clear scope' } : null),
          (b >= 1 ? { value: 'cmd.search.clear_scope', label: 'Clear scope' } : null),
          sep(),
          head('Indexing'),
          { value: 'cmd.search.rebuild_index', label: 'Rebuild index' },
          { value: 'cmd.search.rebuild_index', label: 'Re-anchor index' },
          /* Turning indexing off cancels a build in flight and discards its
             partial generation: destructive, so it is a gated button in the
             Index shelf and this line only opens that shelf. */
          { value: 'search.index.open', label: 'Indexing settings...' },
          { value: 'search.index.large', label: 'Large-file threshold (' + (ix.largeFileThresholdMb || 10) + ' MB)' },
          { value: 'search.index.exclusions', label: 'Generated-file exclusions' },
          { value: 'search.index.symlinks', label: 'Follow symlinks - ' + (ix.followSymlinks ? 'on' : 'off') },
          evict
        ], 'Search options') +
      '</span>' +
      '</div>';

    /* query. The panel's /open-focus target is focus:"query", so it is the
       first thing after the title at every width. */
    h += '<div class="cz-banner">' +
      field(S.query, 'Search query', 'Find in files') +
      (hasQuery ? ibtn('cmd.search.find_in_files', 'x', 'Clear query') : '') +
      '</div>';

    /* flags + scope. The native <select> is the original sin: it cannot hit
       24px reliably, cannot be themed, and cannot express include/exclude
       glob pairs. This is the PM combobox, which can. */
    h += '<div class="cz-banner">' +
      toggle('.*', 'cmd.search.toggle_regex', 'Regular expression', !!flags.regex) +
      toggle('Aa', 'cmd.search.toggle_case_sensitive', 'Case sensitive', !!flags.caseSensitive) +
      toggle('\\b', 'cmd.search.toggle_whole_word', 'Whole word', !!flags.wholeWord) +
      (b >= 1 && K && K.select
        ? K.select(S.scope, S.scopeOptions || [], { style: 'flex:1 1 auto;min-width:0' })
        : '<span style="flex:1 1 auto;min-width:0"></span>') +
      '</div>';

    if (replaceOpen) {
      h += '<div class="cz-banner">' +
        field(S.replace, 'Replacement text', 'Replace with') +
        CZ.act({ id: 'cmd.search.replace_selected', label: 'Replace',
                 disabled: !armed,
                 tip: armed ? 'Replace the selected match'
                            : 'replacement_string_empty - type a replacement first' }) +
        CZ.act({ id: 'cmd.search.replace_all', label: 'All', danger: true,
                 disabled: !armed,
                 tip: armed ? 'Replace every match in every file'
                            : 'replacement_string_empty - type a replacement first',
                 confirm: armed ? {
                   title: 'Replace all ' + num(sum.matches) + ' matches?',
                   say: num(sum.matches) + ' matches in ' + num(sum.files) + ' files are rewritten on disk, ' +
                        'replacing ' + S.query + ' with ' + S.replace + '. Scope: ' + S.scope + '.',
                   ok: 'Replace all'
                 } : null }) +
        '</div>';
    }

    /* ---------------------------------------------------------- scroller */
    var body = '';

    /* region 5: ONE line. Build progress belongs to the status bar, not
       here, and the four-row index card is dead. */
    body += strip(fresh.state, fresh.icon,
      fresh.line + (fresh.annotate ? '' : ' - ' + String(ix.builtAt || '')),
      ibtn('cmd.search.rebuild_index', 'refresh', 'Rebuild index'));

    /* no-silent-local-fallback is mandatory: remote acceleration is not a
       fallback path, so when it is unavailable the panel SAYS SO next to the
       answer it qualifies rather than quietly searching locally. */
    if (rem && rem.available === false) {
      body += CZ.blocked(rem.reason || 'remote_acceleration_unavailable', rem.sentence,
        (rem.actions || []).map(function (a) {
          return { id: a.id, label: a.label, primary: a.id === 'search.remote.retry' };
        }));
    }

    /* ------------------------------------------------------ results shelf */
    var groups = '';
    if (!hasQuery) {
      groups = CZ.empty('no-data', 'Type a query to search file contents. This panel searches content only - the command palette owns cross-page fuzzy search.', { title: 'No query yet' });
    } else if (!files.length) {
      groups = CZ.empty('no-results',
        'Nothing matched ' + S.query + ' in scope ' + S.scope + '. Widen the scope, or turn off whole-word matching.',
        { title: 'No matches', cta: 'Clear scope', ctaId: 'cmd.search.clear_scope' });
    } else {
      for (var i = 0; i < files.length; i++) groups += fileGroup(files[i], i, W, b, chars, armed);
    }

    body += CZ.shelf({
      key: 'results', ico: 'search', label: 'Results',
      count: num(sum.matches),
      state: hasQuery && files.length ? 'ok' : 'idle',
      body: (fresh.annotate
              ? '<div class="cz-sum">Served without the index (' + esc(fresh.line) +
                '). Ranking is off and results may be incomplete.</div>'
              : '') +
            '<div class="cz-sum">' + esc(num(sum.matches) + ' matches in ' + num(sum.files) + ' files') +
            (pg.total ? esc(' - showing ' + num(pg.shown) + ' of ' + num(pg.total)) : '') + '</div>' +
            groups,
      acts: menu([
        { value: 'cmd.search.expand_all',   label: 'Expand all' },
        { value: 'cmd.search.collapse_all', label: 'Collapse all' },
        { value: 'cmd.search.replace_in_files', label: 'Replace in files' }
      ], 'Result actions')
    });

    /* ------------------------------------------------------ records shelf */
    body += CZ.shelf({
      key: 'records', ico: 'info', label: 'Records',
      count: num(rsum.records || 0),
      state: recs.length ? 'run' : 'idle',
      collapsed: b < 1,
      body: recs.length
        ? '<div class="cz-sum">Orchestrator-owned hits. These carry a record identity and a route target, not a file and a line.</div>' +
          recs.map(function (r) { return recordRow(r, W, b); }).join('')
        : CZ.empty('not-relevant', 'Nothing Orchestrator-owned matched this query. File matches are above.', { title: 'No record hits' })
    });

    /* ------------------------------------------------ replace preview shelf
       No replace-preview surface is specified anywhere (research gap 4).
       This declares the answer instead of leaving a hole: preview is inline,
       one shelf, and it says outright that it is not configured yet. */
    if (replaceOpen) {
      body += CZ.shelf({
        key: 'preview', ico: 'refresh', label: 'Replace preview',
        count: armed ? num(sum.matches) : 0,
        state: armed ? 'warn' : 'idle',
        collapsed: !armed,
        body: armed
          ? '<div class="cz-sum">' + esc(num(sum.matches) + ' matches in ' + num(sum.files) +
              ' files would change. Review before applying - replace is not undoable from this panel.') + '</div>' +
            '<div class="cz-actions">' +
              CZ.act({ id: 'cmd.search.replace_in_files', label: 'Preview changes', primary: true }) +
              CZ.act({ id: 'cmd.search.replace_all', label: 'Replace all', danger: true,
                       confirm: { title: 'Replace all ' + num(sum.matches) + ' matches?',
                                  say: num(sum.files) + ' files are rewritten on disk.',
                                  ok: 'Replace all' } }) +
            '</div>'
          : CZ.empty('not-configured',
              'Type a replacement above to preview what changes. Nothing is written until you apply it.',
              { title: 'No replacement set', cta: 'Focus replacement', ctaId: 'cmd.search.replace_in_files' })
      });
    }

    /* -------------------------------------------------------- index shelf
       The entire settings-shaped control surface, collapsed, in one place.
       Seven controls Search owns outright, and none of them costs the result
       list a pixel until it is opened. */
    var ixFacts = [
      CZ.kv('State', fresh.line, 'measure', { bucket: b, w: W }),
      CZ.kv('Engine', ix.engine || 'unknown', 'token', { bucket: b, w: W }),
      CZ.kv('Documents', num(ix.documents || 0), 'token', { bucket: b, w: W }),
      CZ.kv('Last built', ix.builtAt || 'never', 'measure', { bucket: b, w: W }),
      CZ.kv('Large files', (ix.largeFileThresholdMb || 10) + ' MB', 'token', { bucket: b, w: W }),
      CZ.kv('Generated files', ix.excludeGenerated ? 'excluded' : 'indexed', 'token', { bucket: b, w: W }),
      CZ.kv('Follow symlinks', ix.followSymlinks ? 'yes' : 'no', 'token', { bucket: b, w: W }),
      CZ.kv('Remote acceleration', rem.available ? 'available' : 'unavailable', 'token', { bucket: b, w: W })
    ];
    if (lastBuild) {
      ixFacts.push(CZ.kv('Last build', lastBuild.line + ', ' + lastBuild.at + ' ago', 'measure', { bucket: b, w: W }));
    }

    body += CZ.shelf({
      key: 'index', ico: 'bar', label: 'Index',
      count: num(ix.documents || 0),
      state: fresh.state,
      collapsed: true,
      body: CZ.body({
        summary: 'Search owns the project-scoped index. Settings holds global defaults only.',
        facts: ixFacts,
        /* Turning indexing off mid-build cancels through a CancellationToken
           and discards the partial generation; re-enabling starts a FRESH
           build. That is a distinct terminal state with its own copy, not a
           variation on unindexed, so it renders as its own sentence. */
        detail: lastBuild ? '<div>' + esc(lastBuild.detail) + '</div>' : '',
        actions: '<div class="cz-actions">' +
          CZ.act({ id: 'cmd.search.rebuild_index', label: 'Rebuild index', primary: true }) +
          CZ.act({ id: 'cmd.search.rebuild_index', label: 'Re-anchor' }) +
          CZ.act({ id: 'search.index.disable', label: 'Turn indexing off', danger: true,
                   confirm: { title: 'Turn indexing off?',
                              say: 'A build in flight is cancelled and its partial generation discarded. ' +
                                   'Re-enabling starts a fresh build rather than resuming. Search falls back to raw ripgrep.',
                              ok: 'Turn off' } }) +
          CZ.act({ id: 'cmd.search.evict_remote_cache', label: 'Evict remote cache',
                   disabled: !rem.available,
                   tip: rem.available ? 'Evict the cached remote index'
                                      : (rem.reason || 'remote_unavailable') + ' - ' + (rem.sentence || ''),
                   confirm: { title: 'Evict the remote cache?',
                              say: 'The cached remote index for ' + (rem.host || 'the remote host') +
                                   ' is deleted and must be rebuilt by the remote service before it accelerates again.',
                              ok: 'Evict' } }) +
          '</div>',
        blocked: (rem && rem.available === false)
          ? CZ.blocked(rem.reason || 'remote_acceleration_unavailable', rem.sentence,
              (rem.actions || []).map(function (a) { return { id: a.id, label: a.label }; }))
          : ''
      })
    });

    /* ------------------------------------------------------------ footer */
    var foot =
      '<div class="cz-foot">' +
        '<span class="cz-foot-count"><b>' + esc(num(sum.matches)) + '</b>' +
          esc(' of ' + num(pg.total || sum.matches) + ' - ' + num(sum.files) + ' files') + '</span>' +
        ibtn('cmd.search.previous_result', 'back', 'Previous match (Shift+F3)') +
        ibtn('cmd.search.next_result', 'chev', 'Next match (F3)') +
        (armed
          ? CZ.act({ id: 'cmd.search.replace_all', label: 'Replace all', danger: true,
                     confirm: { title: 'Replace all ' + num(sum.matches) + ' matches?',
                                say: num(sum.files) + ' files are rewritten on disk.',
                                ok: 'Replace all' } })
          : '') +
      '</div>';

    return root(b, cfg, h + '<div class="cz-scroll">' + body + '</div>' + foot);
  }


  /* =======================================================================
     ======================== S O U R C E   C O N T R O L ==================
     =======================================================================

     Canonical view order from GI-004: Changes, History, Graph, Worktrees,
     Branches / Stash. Changes and Worktrees are default-open; the rest are
     default-collapsed. The concept's Changes/Worktrees/History/Graph/
     Branches order is a deviation and is not reproduced.

     65 commands means progressive disclosure is not a preference. The rule
     applied everywhere below: ONE inline action per row (the one that is
     obviously next), everything else in that row's overflow, and everything
     settings-shaped in the shelf's overflow. */

  /* Git status letter -> the five-state accent vocabulary. One mapping, so
     the tree, the changed-file rows and the chips cannot drift apart. */
  var CODE_STATE = { M: 'warn', A: 'ok', D: 'err', R: 'run', U: 'err', C: 'err', '?': 'idle' };
  var CODE_WORD  = { M: 'modified', A: 'added', D: 'deleted', R: 'renamed',
                     U: 'conflicted', C: 'conflicted', '?': 'untracked' };

  /* Lifecycle words are RESERVED (WorktreeGitImprovement.md:L297) and are
     never paraphrased. They are also never dropped: at bucket 0 the word
     moves to the first meta segment instead of the pill, because action
     enablement depends on it and a dropped chip would take enablement with
     it. */
  var LIFE_STATE = { active: 'run', reserved: 'idle', blocked_preserved: 'err',
                     released: 'idle', orphaned: 'warn' };

  function wtState(wt) {
    /* the row's accent is the WORST of its lifecycle and its status, so a
       dirty active worktree and a blocked_preserved one never read alike. */
    return CZ.worst([LIFE_STATE[wt.lifecycle] || 'idle', CZ.normState(wt.status)]);
  }

  /* The blocked / reserved / orphaned / released payload a worktree row owes
     the reader, always visible, never a hover and never a toast. Reason code
     verbatim, one sentence, ordered allowed_action_ids as real buttons. */
  function wtBlocked(wt) {
    if (wt.preservedSentence) {
      return CZ.blocked(wt.preservedReason || 'worktree_preserved', wt.preservedSentence,
        [{ id: 'cmd.git.worktree.release', label: 'Release', primary: true },
         { id: 'cmd.git.worktree.focus_lineage', label: 'Focus lineage' },
         { id: 'cmd.git.worktree.request_prune', label: 'Request prune' }]);
    }
    if (wt.orphanSentence) {
      return CZ.blocked(wt.orphanReason || 'worktree_orphaned', wt.orphanSentence,
        [{ id: 'cmd.git.worktree.recover', label: 'Recover', primary: true },
         { id: 'cmd.git.worktree.focus_lineage', label: 'Focus lineage' },
         { id: 'cmd.git.worktree.prune', label: 'Prune', danger: true,
           confirm: { title: 'Prune ' + wt.branch + '?',
                      say: 'The worktree record is removed. Lineage is retained. This cannot be undone from this panel.',
                      ok: 'Prune' } }]);
    }
    if (wt.reservedSentence) {
      return CZ.blocked('worktree_reserved', wt.reservedSentence,
        [{ id: 'cmd.git.worktree.focus_lineage', label: 'Focus lineage' },
         { id: 'cmd.git.worktree.select', label: 'Open lane' }]);
    }
    if (wt.releasedSentence) {
      return CZ.blocked('worktree_released', wt.releasedSentence,
        [{ id: 'cmd.git.worktree.focus_lineage', label: 'Focus lineage' },
         { id: 'cmd.source_control.history_open_commit', label: 'Open merge commit' }]);
    }
    if (wt.lockedBy) {
      return CZ.blocked(wt.lockReason || 'worktree_locked',
        'Locked by ' + wt.lockedBy + '. Prune, remove and reuse stay disabled until it is released.',
        [{ id: 'cmd.git.worktree.select', label: wt.kind === 'orch' ? 'Open lane' : 'Open thread', primary: true },
         { id: 'cmd.git.worktree.focus_lineage', label: 'Focus lineage' },
         { id: 'cmd.git.worktree.request_prune', label: 'Request prune' }]);
    }
    return '';
  }

  /* Flags DRIVE enablement -- they are not decoration. Manual prune, remove
     and reuse are forbidden while a worktree is active or blocked_preserved
     unless an override policy allows it AND RECORDS the override, so the
     control is shown disabled with its reason rather than hidden. */
  function wtGate(wt, verb) {
    var life = wt.lifecycle;
    if (life === 'active' || life === 'blocked_preserved') {
      return { off: true, code: life === 'active' ? 'worktree_active' : 'worktree_blocked_preserved',
               say: 'Cannot ' + verb + ' while the worktree is ' + life + '. An override must be recorded first.' };
    }
    if (wt.locked) {
      return { off: true, code: wt.lockReason || 'worktree_locked',
               say: 'Locked by ' + (wt.lockedBy || 'another owner') + '.' };
    }
    if (verb !== 'recover' && wt.dirty) {
      return { off: true, code: 'worktree_not_clean',
               say: 'Uncommitted changes are present. Commit, stash or discard them first.' };
    }
    if ((verb === 'prune' || verb === 'remove') && !wt.prunable) {
      return { off: true, code: 'prune_policy_blocked',
               say: 'The prune policy does not allow this worktree to be removed yet.' };
    }
    return { off: false, code: '', say: '' };
  }

  function gatedAct(id, label, wt, verb, extra) {
    var g = wtGate(wt, verb);
    return CZ.act({
      id: id, label: label, danger: !!(extra && extra.danger),
      disabled: g.off,
      tip: g.off ? g.code + ' - ' + g.say : (extra && extra.tip) || label,
      confirm: g.off ? null : {
        title: label + ' ' + wt.branch + '?',
        say: (extra && extra.say) || ('Scope: ' + (wt.path || wt.worktreeId) + ', base ' + wt.base +
             '. This changes local state and cannot be undone from this panel.'),
        ok: label
      }
    });
  }

  function worktreeRow(wt, W, b) {
    var life = wt.lifecycle;
    var meta = [];
    /* bucket 0 has no pill, so the reserved lifecycle word leads the meta
       line instead of being lost. */
    if (b < 1) meta.push(life);
    meta.push(wt.owner);
    meta.push('age ' + wt.age);
    if (wt.ahead) meta.push(wt.ahead + ' ahead');
    if (wt.dirty) meta.push('dirty');

    var facts = [
      CZ.kv('Path', wt.path || 'no checkout on disk', 'token', { bucket: b, w: W }),
      CZ.kv('Base', wt.base, 'token', { bucket: b, w: W }),
      CZ.kv('Age', wt.age, 'measure', { bucket: b, w: W }),
      CZ.kv('Lifecycle', life, 'token', { bucket: b, w: W }),
      CZ.kv('Owner', wt.owner, 'prose', { bucket: b, w: W }),
      CZ.kv('Worktree', wt.worktreeId, 'token', { bucket: b, w: W })
    ];
    if (wt.run)       facts.push(CZ.kv('Run', wt.run, 'token', { bucket: b, w: W }));
    if (wt.laneId)    facts.push(CZ.kv('Lane', wt.laneId, 'token', { bucket: b, w: W }));
    if (wt.nodeId)    facts.push(CZ.kv('Node', wt.nodeId, 'token', { bucket: b, w: W }));
    if (wt.attemptId) facts.push(CZ.kv('Attempt', wt.attemptId, 'token', { bucket: b, w: W }));
    facts.push(CZ.kv('Flags', (wt.locked ? 'locked ' : '') + (wt.dirty ? 'dirty ' : '') +
                              (wt.prunable ? 'prunable ' : '') + (wt.repairable ? 'repairable' : '') ||
                              'none', 'token', { bucket: b, w: W }));

    var open = wt.lifecycle === 'blocked_preserved' || wt.lifecycle === 'orphaned';

    return CZ.exRow({
      w: W, bucket: b,
      key: wt.worktreeId,
      name: wt.branch,
      nameKind: 'path',
      chip: b >= 1 ? { label: life, mono: true } : null,
      meta: meta,
      state: wtState(wt),
      /* the rows whose state changes what you may do are the rows that open
         by default: a blocked reason nobody expands is a blocked reason
         nobody reads. */
      open: open,
      acts: menu([
        { value: 'cmd.git.worktree.open', label: 'Open', disabled: !wt.path,
          reason: wt.path ? null : 'worktree_path_unresolvable',
          sentence: wt.path ? null : 'No checkout exists on disk for this worktree yet.' },
        { value: 'cmd.git.worktree.open_files', label: 'Open files', disabled: !wt.path },
        { value: 'cmd.git.worktree.compare', label: 'Compare with ' + wt.base },
        { value: 'cmd.git.worktree.focus_lineage', label: 'Focus lineage' },
        sep(),
        { value: wt.locked ? 'cmd.git.worktree.unlock' : 'cmd.git.worktree.lock',
          label: wt.locked ? 'Unlock' : 'Lock' },
        { value: 'cmd.git.worktree.release', label: 'Release' },
        { value: 'cmd.git.worktree.recover', label: 'Recover', disabled: !wt.repairable,
          reason: wt.repairable ? null : 'worktree_not_repairable',
          sentence: wt.repairable ? null : 'This worktree reports nothing to repair.' },
        sep(),
        /* Request prune is approval-gated, not destructive, so it belongs in
           the menu. Prune and Remove do not: they are gated buttons in the
           expanded body, where the reason they may be disabled is also
           visible. A destructive verb never appears in a menu in this file. */
        { value: 'cmd.git.worktree.request_prune', label: 'Request prune' },
        { value: 'cmd.git.worktree.list', label: 'Show prune and remove (expand row)' },
        sep(),
        { value: 'cmd.source_control.pr.create', label: 'Create pull request' },
        { value: 'cmd.github.actions.open_related_worktree', label: 'Open in GitHub' }
      ], 'Worktree actions'),
      body: CZ.body({
        summary: (wt.kind === 'orch' ? 'Orchestrator-owned. ' : wt.kind === 'thread' ? 'Thread-owned. ' : 'Manual. ') +
                 'Lifecycle ' + life + ', status ' + wt.status + '.',
        facts: facts,
        /* the reason line sits IMMEDIATELY above the actions it explains --
           id= is banned in panel markup so aria-describedby is unavailable;
           proximity plus the repeated reason code in each disabled control's
           tooltip is the substitute, and it is a known deviation. */
        blocked: wtBlocked(wt),
        actions: '<div class="cz-actions">' +
          CZ.act({ id: 'cmd.git.worktree.open', label: 'Open', primary: true,
                   disabled: !wt.path,
                   tip: wt.path ? 'Open ' + wt.path
                                : 'worktree_path_unresolvable - no checkout exists on disk yet' }) +
          CZ.act({ id: 'cmd.git.worktree.open_files', label: 'Open files', disabled: !wt.path }) +
          CZ.act({ id: 'cmd.git.open_diff', label: 'Compare' }) +
          CZ.act({ id: 'cmd.git.worktree.focus_lineage', label: 'Lineage' }) +
          (wt.kind === 'orch'
            ? CZ.act({ id: 'cmd.git.worktree.select', label: 'Open lane' })
            : wt.kind === 'thread'
              ? CZ.act({ id: 'cmd.git.worktree.select', label: 'Open thread' })
              : '') +
          (wt.repairable ? CZ.act({ id: 'cmd.git.worktree.recover', label: 'Recover' }) : '') +
          gatedAct('cmd.git.worktree.reuse', 'Reuse', wt, 'reuse', {
            say: 'Ownership of ' + (wt.path || wt.worktreeId) + ' moves to the new owner. ' +
                 'The override is recorded against ' + wt.worktreeId + '.'
          }) +
          gatedAct('cmd.git.worktree.prune', 'Prune', wt, 'prune', { danger: true }) +
          gatedAct('cmd.git.worktree.remove', 'Remove', wt, 'remove', {
            danger: true,
            say: 'Scope: ' + (wt.path || wt.worktreeId) + ', branch ' + wt.branch + ', base ' + wt.base +
                 '. The checkout is deleted from disk. Lineage is retained.'
          }) +
          '</div>'
      })
    });
  }

  function changeRow(f, group, W, b) {
    var code = f.code || 'M';
    var dir  = dirname(f.path);
    var meta = [];
    if (dir) meta.push(CZ.elide(dir, 'path', Math.max(12, Math.floor((W - 90) / CH))));
    meta.push('+' + (f.add || 0) + ' -' + (f.del || 0));
    if (f.conflict) meta.push(f.conflict);
    if (f.from) meta.push('from ' + basename(f.from));

    var staged = group === 'staged';
    var conflicted = code === 'U' || code === 'C';

    var inline = conflicted
      ? CZ.act({ id: 'cmd.source_control.open_conflict', icon: 'warn',
                 aria: 'Open conflict assistant for ' + basename(f.path),
                 tip: 'Open Conflict Assistant' })
      : CZ.act({ id: staged ? 'cmd.git.unstage_hunks' : 'cmd.git.stage_hunks',
                 icon: staged ? 'x' : 'plus',
                 aria: (staged ? 'Unstage ' : 'Stage ') + basename(f.path),
                 tip: staged ? 'Unstage this file' : 'Stage this file' });

    return CZ.row({
      w: W, bucket: b,
      key: group + ':' + f.path,
      name: basename(f.path),
      nameKind: 'file',
      chip: { label: code, mono: true },
      meta: meta,
      state: CODE_STATE[code] || 'idle',
      acts: inline + menu([
        { value: 'cmd.git.diff_open', label: 'Open diff' },
        { value: 'cmd.git.diff_set_compare_target',
          label: 'Compare: ' + (staged ? 'HEAD to index'
                : code === '?' ? 'empty to working tree' : 'index to working tree') },
        { value: 'cmd.git.diff_toggle_mode', label: 'Side-by-side / unified' },
        sep(),
        { value: staged ? 'cmd.git.unstage_hunks' : 'cmd.git.stage_hunks',
          label: staged ? 'Unstage file' : 'Stage file' },
        /* Hunk-level stage / unstage / discard are explicit review commands
           and live in the DIFF VIEW, not the row -- so the row routes to the
           diff rather than offering a destructive verb from a menu that has
           no confirmation gate of its own. PMK's menu `danger` flag is
           styling, not a gate; every destructive verb in this file is a real
           button with CZ.act(confirm). */
        { value: 'cmd.git.diff_open', label: 'Open diff to discard hunks',
          disabled: staged, reason: staged ? 'file_is_staged' : null,
          sentence: staged ? 'Unstage the file before discarding its changes.' : null },
        sep(),
        { value: 'cmd.source_control.toggle_generated_filter', label: 'Hide generated files' }
      ], 'Actions for ' + basename(f.path))
    });
  }

  function conflictRow(c, W, b) {
    var sides = c.sides || [];
    var facts = [];
    for (var i = 0; i < sides.length; i++) {
      facts.push(CZ.kv(sides[i].label, '+' + sides[i].add + ' -' + sides[i].del,
                       'measure', { bucket: b, w: W }));
    }
    facts.push(CZ.kv('Kind', c.conflict + ' (' + c.kind + ')', 'token', { bucket: b, w: W }));
    facts.push(CZ.kv('Hunks', String(c.hunks), 'measure', { bucket: b, w: W }));
    facts.push(CZ.kv('Base', c.base || 'no common base', 'token', { bucket: b, w: W }));
    facts.push(CZ.kv('Markers left', String(c.markersRemaining), 'measure', { bucket: b, w: W }));

    var resolved = !c.markersRemaining;

    return CZ.exRow({
      w: W, bucket: b,
      key: 'conflict:' + c.path,
      name: basename(c.path),
      nameKind: 'file',
      chip: { label: c.code || 'U', mono: true },
      meta: [dirname(c.path), c.conflict, c.hunks + ' hunks'],
      state: 'err',
      open: true,
      acts: menu([
        { value: 'cmd.source_control.open_merge_editor', label: 'Open merge editor' },
        { value: 'cmd.source_control.open_conflict', label: 'Open Conflict Assistant' },
        { value: 'cmd.git.conflict_apply_resolution', label: 'Apply hunk resolution' },
        { value: 'cmd.source_control.mark_conflict_resolved', label: 'Mark resolved',
          disabled: !resolved, reason: resolved ? null : 'conflict_markers_present',
          sentence: resolved ? null : c.markersRemaining + ' conflict markers are still in the file.' }
      ], 'Conflict actions'),
      body: CZ.body({
        summary: 'Three-way review: base, ours, theirs, result. Neither side is preferred - ' +
                 'the resolver never writes a side for you.',
        facts: facts,
        blocked: resolved ? '' : CZ.blocked('conflict_markers_present',
          c.markersRemaining + ' conflict markers remain in ' + basename(c.path) +
          '. Resolve them, then mark the file resolved.',
          [{ id: 'cmd.source_control.open_merge_editor', label: 'Open merge editor', primary: true },
           { id: 'cmd.source_control.open_conflict', label: 'Open Conflict Assistant' }]),
        actions: '<div class="cz-actions">' +
          CZ.act({ id: 'cmd.source_control.open_merge_editor', label: 'Merge editor', primary: true }) +
          /* approval-gated: resolve_conflict_side must never auto-write a
             side, so every side is a confirmed action and none is default. */
          sides.map(function (s) {
            return CZ.act({ id: 'cmd.source_control.resolve_conflict_side',
                            label: 'Take ' + s.id,
                            confirm: { title: 'Take ' + s.id + ' for ' + basename(c.path) + '?',
                                       say: s.label + ' (+' + s.add + ' -' + s.del + ') replaces the merged result ' +
                                            'for every hunk in this file.',
                                       ok: 'Take ' + s.id } });
          }).join('') +
          CZ.act({ id: 'cmd.source_control.mark_conflict_resolved', label: 'Mark resolved',
                   disabled: !resolved,
                   tip: resolved ? 'Mark this file resolved'
                                 : 'conflict_markers_present - ' + c.markersRemaining + ' markers remain' }) +
          '</div>'
      })
    });
  }

  function historyRow(c, W, b) {
    return CZ.row({
      w: W, bucket: b,
      key: c.sha,
      name: c.sha,
      nameKind: 'digest',
      chip: { label: c.when, mono: true },
      meta: [c.subject, c.who],
      state: null,
      acts: menu([
        { value: 'cmd.source_control.history_open_commit', label: 'Open commit' },
        { value: 'cmd.git.show_commit', label: 'Show commit' },
        { value: 'cmd.git.diff_set_compare_target', label: 'Compare with first parent' },
        { value: 'cmd.source_control.open_review', label: 'Open Review Mode' }
      ], 'Commit actions')
    });
  }

  function branchRow(br, ownerOf, W, b) {
    var owner = ownerOf[br.name] || null;
    var locked = !!(owner && (owner.lifecycle === 'active' || owner.lifecycle === 'blocked_preserved'));
    var meta = [];
    meta.push((br.ahead || 0) + ' ahead, ' + (br.behind || 0) + ' behind');
    if (owner) meta.push('worktree ' + owner.worktreeId);
    if (locked) meta.push('read-only');

    return CZ.row({
      w: W, bucket: b,
      key: 'branch:' + br.name,
      name: br.name,
      nameKind: 'path',
      chip: br.current ? { label: 'current', mono: false } : null,
      meta: meta,
      state: br.current ? 'run' : 'idle',
      sel: !!br.current,
      acts: menu([
        { value: 'cmd.git.switch_branch', label: 'Switch to ' + br.name,
          disabled: locked || br.current,
          reason: br.current ? 'branch_already_current' : (locked ? 'branch_owned_by_active_worktree' : null),
          sentence: br.current ? 'This is the current branch.'
                  : locked ? 'Owned by ' + owner.worktreeId + '. It opens read-only until that worktree releases it.'
                  : null },
        { value: 'cmd.git.open_diff', label: 'Compare with current' },
        { value: 'cmd.source_control.open_review', label: 'Open Review Mode' },
        { value: 'cmd.source_control.pr.create', label: 'Create pull request' }
      ], 'Branch actions')
    });
  }

  function stashRow(s, i, W, b) {
    var ref = 'stash@{' + i + '}';
    return CZ.row({
      w: W, bucket: b,
      key: ref,
      name: ref,
      nameKind: 'ref',
      chip: { label: s.when, mono: true },
      meta: [s.label],
      state: 'idle',
      /* Drop is destructive, so it is a real button with a gate, never a menu
         line -- the menu keeps the two reversible verbs. */
      acts: CZ.act({ id: 'cmd.source_control.stash', icon: 'x', danger: true,
                     aria: 'Drop ' + ref, tip: 'Drop ' + ref,
                     confirm: { title: 'Drop ' + ref + '?',
                                say: s.label + ' (' + s.when + ' old) is deleted. ' +
                                     'A dropped stash cannot be recovered from this panel.',
                                ok: 'Drop' } }) +
        menu([
          { value: 'cmd.source_control.stash', label: 'Apply' },
          { value: 'cmd.source_control.stash', label: 'Pop' },
          { value: 'cmd.git.open_diff', label: 'Show stash diff' }
        ], 'Stash actions')
    });
  }

  function pSource(D, cfg) {
    var W = pw(cfg), b = CZ.bucket(W);
    var S = (D && D.source) || {};
    var repo = S.repo || {}, counts = S.counts || {}, pg = S.paging || {};
    var wts = S.worktrees || [], conflicts = S.conflicts || [];
    var staged = S.staged || [], unstaged = S.unstaged || [];
    var hist = S.history || [], branches = S.branchList || [], stash = S.stash || [];
    var remote = S.remote || {};

    /* W-018: the multi-active SCM status strip is a shared projection, not a
       panel summary. Primary context first, then +N -- and +N is NEVER
       dropped, because losing it silently flattens contexts. */
    var active = [];
    for (var i = 0; i < wts.length; i++) {
      if (wts[i].lifecycle === 'active' || wts[i].lifecycle === 'blocked_preserved') active.push(wts[i]);
    }
    var primary = active[0] || wts[0] || { branch: repo.defaultBranch || 'main', status: 'idle',
                                           worktreeId: 'wt-primary', lifecycle: 'active' };
    var extra = Math.max(0, active.length - 1);

    /* branch -> owning worktree, so a branch row can say it opens read-only
       and mean it. */
    var ownerOf = {};
    for (i = 0; i < wts.length; i++) ownerOf[wts[i].branch] = wts[i];

    var branchItems = branches.map(function (br) {
      var owner = ownerOf[br.name];
      var locked = !!(owner && (owner.lifecycle === 'active' || owner.lifecycle === 'blocked_preserved'));
      return {
        value: br.name, label: br.name,
        hint: (br.ahead || 0) + '/' + (br.behind || 0),
        disabled: locked,
        reason: locked ? 'branch_owned_by_active_worktree' : null,
        sentence: locked ? 'Owned by ' + owner.worktreeId + ' (' + owner.lifecycle + '). Opens read-only.' : null
      };
    });

    /* ------------------------------------------------------------ header */
    var h = '';
    h += '<div class="cz-banner">' +
      '<span class="cz-banner-ico">' + CZ.icon('branch', '', 12) + '</span>' +
      '<span class="cz-title">Source Control</span>' +
      '<span class="cz-banner-acts">' +
        menu([
          head('Repository'),
          { value: 'cmd.source_control.select_worktree',
            label: repo.nameWithOwner || repo.name || 'repository',
            hint: repo.visibility },
          { value: 'cmd.source_control.select_worktree',
            label: '+' + (repo.siblingCount || 0) + ' more repos in this workspace' },
          sep(),
          /* THE FIX. Below 250px the branch selector used to be display:none
             with nothing in its place. Here the entire branch list moves into
             this menu instead, disabled reasons and all, so it stays
             reachable at 220px. */
          head(b < 1 ? 'Switch branch' : 'Branches'),
          (b < 1 ? null : { value: 'cmd.git.switch_branch', label: 'Switch branch...' })
        ].concat(b < 1 ? branchItems : []).concat([
          sep(),
          head('Sync'),
          { value: 'cmd.git.pull', label: 'Pull' + (remote.incoming ? ' (' + remote.incoming + ')' : '') },
          { value: 'cmd.git.push', label: 'Push' + (remote.outgoing ? ' (' + remote.outgoing + ')' : '') },
          { value: 'cmd.git.fetch', label: 'Fetch' },
          sep(),
          head('Review'),
          { value: 'cmd.source_control.open_review', label: 'Open Review Mode' },
          { value: 'cmd.source_control.review.swap', label: 'Swap compare sides' },
          { value: 'cmd.source_control.review.filter', label: 'Review filters...' },
          { value: 'cmd.source_control.set_compare_target', label: 'Set compare target...' },
          sep(),
          head('Pull requests'),
          { value: 'cmd.source_control.pr.create', label: 'Create pull request' },
          { value: 'cmd.source_control.pr.merge', label: 'Merge pull request', danger: true,
            disabled: true, reason: 'no_open_pr',
            sentence: 'No open pull request for this branch. Protected-branch merges route the ' +
                      'git_destructive_remote permission class.' },
          sep(),
          head('GitHub'),
          /* only the open_* pivots are legitimate mirrors here; rerun, cancel,
             pin and workflow admin stay in GitHub Actions. */
          { value: 'cmd.github.actions.open_current_branch', label: 'Open this branch in GitHub' },
          { value: 'cmd.github.actions.open_run', label: 'Open the latest run' },
          { value: 'cmd.github.actions.open_related_diff', label: 'Open the related diff' }
        ]), 'Source Control options') +
      '</span>' +
      '</div>';

    /* the W-018 strip. At 240px it degrades to dot + branch + +N + numerals,
       and +N survives. */
    h += '<div class="cz-banner" data-cz-state="' + esc(wtState(primary)) + '">' +
      '<span class="cz-dot" role="img" aria-label="' + esc(primary.status) + '"></span>' +
      (b >= 1 && K && K.select
        ? K.select(primary.branch, branchItems.map(function (it) {
            return { value: it.value, label: it.label, hint: it.hint,
                     disabled: it.disabled, reason: it.reason, sentence: it.sentence };
          }), { style: 'flex:1 1 auto;min-width:0' })
        : '<span class="cz-name" style="flex:1 1 auto">' +
            esc(CZ.elide(primary.branch, 'path', Math.max(10, Math.floor((W - 120) / CH)))) + '</span>') +
      /* +N is never dropped at any width: losing it silently flattens
         contexts. It is a .cz-btn rather than a .cz-chip because it is a
         real control and every interactive box owes 24px. */
      (extra
        ? CZ.act({ id: 'cmd.source_control.select_worktree', label: '+' + extra,
                   tip: extra + ' more active contexts - open the drilldown, ' +
                        'run + node + attempt for every one',
                   aria: extra + ' more parallel contexts' })
        : '') +
      '<span class="cz-meta cz-meta--mono">' +
        esc((counts.unstaged || 0) + (counts.staged || 0)) + '/' + esc(counts.conflicts || 0) +
      '</span>' +
      '</div>';

    var body = '';

    /* the active context is owned by a run, and that is a blocked/ownership
       banner, not a tooltip. It preempts everything below it. */
    if (primary.lockedBy) {
      body += CZ.blocked(primary.lockReason || 'worktree_owned_by_active_run',
        primary.branch + ' is owned by ' + primary.lockedBy +
        '. Mutating actions on this worktree stay disabled until the owner releases it.',
        [{ id: 'cmd.git.worktree.select', label: primary.kind === 'orch' ? 'Open lane' : 'Open thread', primary: true },
         { id: 'cmd.git.worktree.focus_lineage', label: 'Focus lineage' },
         { id: 'cmd.git.worktree.request_prune', label: 'Request prune' }]);
    }

    /* ================================================== 1. CHANGES (open) */
    var changesBody = '';

    changesBody += CZ.shelf({
      key: 'conflicts', ico: 'warn', label: 'Conflicts',
      count: conflicts.length, state: conflicts.length ? 'err' : 'ok',
      body: conflicts.length
        ? conflicts.map(function (c) { return conflictRow(c, W, b); }).join('')
        : CZ.empty('no-data', 'Nothing is conflicted in this worktree.', { title: 'No conflicts' })
    });

    changesBody += CZ.shelf({
      key: 'staged', ico: 'check', label: 'Staged',
      count: staged.length, state: staged.length ? 'ok' : 'idle',
      body: staged.length
        ? CZ.list(staged.map(function (f) { return changeRow(f, 'staged', W, b); }).join(''),
                  { label: 'Staged files', key: 'staged' })
        : CZ.empty('no-data', 'Stage a file to include it in the next commit.', { title: 'Nothing staged' }),
      acts: menu([
        { value: 'cmd.git.unstage_hunks', label: 'Unstage all' },
        { value: 'cmd.git.diff_open', label: 'Open staged diff' }
      ], 'Staged actions')
    });

    changesBody += CZ.shelf({
      key: 'unstaged', ico: 'circle', label: 'Unstaged',
      count: unstaged.length, state: unstaged.length ? 'warn' : 'ok',
      body: unstaged.length
        ? CZ.list(unstaged.map(function (f) { return changeRow(f, 'unstaged', W, b); }).join(''),
                  { label: 'Unstaged files', key: 'unstaged' })
        : CZ.empty('no-data', 'The working tree is clean.', { title: 'Nothing to stage' }),
      acts: CZ.act({ id: 'cmd.git.discard_hunks', icon: 'x', danger: true,
                     aria: 'Discard all unstaged changes',
                     tip: 'Discard all unstaged changes',
                     confirm: { title: 'Discard all unstaged changes?',
                                say: 'Scope: ' + unstaged.length + ' files in ' + primary.branch +
                                     '. Every uncommitted edit in those files is lost. This cannot be undone.',
                                ok: 'Discard' } }) +
        menu([
          { value: 'cmd.git.stage_hunks', label: 'Stage all' },
          { value: 'cmd.git.diff_open', label: 'Open combined diff' },
          { value: 'cmd.source_control.toggle_generated_filter', label: 'Hide generated files' }
        ], 'Unstaged actions')
    });

    /* The composer, docked at the bottom of the Changes body so the file
       list scrolls under it. An empty commit is a distinct non-error
       condition and must not read as a failure. */
    var canCommit = staged.length > 0;
    changesBody += '<div class="cz-note" data-cz-state="' + (canCommit ? 'ok' : 'idle') + '"' +
      ' style="flex-direction:column;align-items:stretch;gap:6px">' +
      '<div style="display:flex;align-items:center;gap:6px">' +
        field(S.commitDraft, 'Commit message', canCommit
          ? 'Message for ' + plural(staged.length, 'staged file', 'staged files')
          : 'Nothing staged yet') +
        menu([
          { value: 'cmd.source_control.generate_commit_message', label: 'Generate message' },
          { value: 'cmd.source_control.suggest_commit_batches', label: 'Suggest commit batches' },
          { value: 'cmd.source_control.accept_commit_group', label: 'Accept suggested group',
            disabled: true, reason: 'no_suggested_group',
            sentence: 'Ask for batch suggestions first. Batching is advisory and nothing is canonical until you commit.' }
        ], 'Commit options') +
      '</div>' +
      '<div class="cz-actions cz-actions--eq">' +
        CZ.act({ id: 'cmd.git.commit', label: 'Commit', primary: true, disabled: !canCommit,
                 tip: canCommit ? 'Commit ' + plural(staged.length, 'staged file', 'staged files')
                                : 'nothing_staged - stage a file first' }) +
        CZ.act({ id: 'cmd.git.push', label: 'Push' + (remote.outgoing ? ' ' + remote.outgoing : '') }) +
      '</div>' +
      '</div>';

    body += CZ.shelf({
      key: 'changes', ico: 'square', label: 'Changes',
      count: (staged.length + unstaged.length),
      state: conflicts.length ? 'err' : (unstaged.length ? 'warn' : 'ok'),
      body: changesBody
    });

    /* ============================================ 2. HISTORY (collapsed) */
    var hp = (pg.commits || {});
    body += CZ.shelf({
      key: 'history', ico: 'clock', label: 'History',
      count: num(hp.total || hist.length), state: 'idle', collapsed: true,
      body: hist.length
        ? CZ.list(hist.map(function (c) { return historyRow(c, W, b); }).join(''),
                  { label: 'Commit history', key: 'history' }) +
          '<button type="button" class="cz-more" data-pm-action="cmd.source_control.history_open_commit">' +
            esc('Showing ' + num(hp.shown || hist.length) + ' of ' + num(hp.total || hist.length) + ' - load older') +
          '</button>'
        : CZ.empty('no-data', 'No commits on this branch yet.', { title: 'No history' }),
      acts: menu([
        { value: 'cmd.source_control.open_review', label: 'Open Review Mode' },
        { value: 'cmd.git.diff_set_compare_target', label: 'Set compare target' }
      ], 'History actions')
    });

    /* ============================================== 3. GRAPH (collapsed)
       The graph must never be the only path to the information, so what
       renders here IS the list equivalent -- branch tip, the worktree or run
       that owns it, ahead/behind -- with the same keyboard model as every
       other list. The drawn graph is a 480px / overflow extra on top. */
    var tips = branches.map(function (br) {
      var owner = ownerOf[br.name];
      return CZ.row({
        w: W, bucket: b,
        key: 'tip:' + br.name,
        name: br.name,
        nameKind: 'path',
        chip: { label: (br.ahead || 0) + '/' + (br.behind || 0), mono: true },
        meta: [owner ? owner.worktreeId : 'no worktree',
               owner && owner.run ? 'run ' + owner.run : 'unowned',
               owner ? owner.lifecycle : 'branch only'],
        state: owner ? wtState(owner) : 'idle',
        acts: menu([
          { value: 'cmd.source_control.graph.focus', label: 'Focus this tip' },
          { value: 'cmd.source_control.graph.filter', label: 'Filter lineage' },
          { value: 'cmd.source_control.graph.layout', label: 'Compact / expanded layout' }
        ], 'Graph actions')
      });
    }).join('');

    body += CZ.shelf({
      key: 'graph', ico: 'branch', label: 'Graph',
      count: branches.length, state: 'idle', collapsed: true,
      body: '<div class="cz-sum">Lineage as a list: which worktree or run owns each branch tip. ' +
              'Keyboard and screen-reader parity with the drawn graph is the point - the graph is never the only path.</div>' +
            CZ.list(tips, { label: 'Branch tips and owners', key: 'graph' }) +
            '<div class="cz-actions">' +
              CZ.act({ id: 'cmd.source_control.graph.focus', label: 'Open graph view',
                       disabled: b < 3,
                       tip: b < 3 ? 'graph_needs_width - the drawn graph opens at 480px or in the editor area'
                                  : 'Draw the lineage graph' }) +
              CZ.act({ id: 'cmd.source_control.open_review', label: 'Open Review Mode' }) +
            '</div>'
    });

    /* ============================================= 4. WORKTREES (open) */
    var filterTabs = CZ.tabs([
      { id: 'all', label: 'All', icon: 'circle', count: wts.length, active: true },
      { id: 'threads', label: 'Threads', icon: 'branch',
        count: wts.filter(function (x) { return x.kind === 'thread'; }).length },
      { id: 'orch', label: 'Orchestrator', icon: 'play',
        count: wts.filter(function (x) { return x.kind === 'orch'; }).length },
      { id: 'manual', label: 'Manual', icon: 'square',
        count: wts.filter(function (x) { return x.kind === 'manual'; }).length }
    ], W, { label: 'Worktree filter' });

    body += CZ.shelf({
      key: 'worktrees', ico: 'branch', label: 'Worktrees',
      count: wts.length,
      state: CZ.worst(wts.map(function (x) { return wtState(x); })),
      body: filterTabs +
        (wts.length
          ? wts.map(function (x) { return worktreeRow(x, W, b); }).join('')
          : CZ.empty('not-configured',
              'This repository has no linked worktrees. Repo state is still shown above.',
              { title: 'No worktrees', cta: 'New worktree', ctaId: 'cmd.git.worktree.create' })),
      acts: menu([
        { value: 'cmd.git.worktree.create', label: 'New worktree' },
        { value: 'cmd.git.worktree.list', label: 'Refresh list' },
        sep(),
        { value: 'cmd.git.worktree.list', label: 'Hide stale worktrees' },
        { value: 'cmd.git.worktree.list', label: 'Sort by age' },
        { value: 'cmd.git.worktree.list', label: 'Ownership display mode' },
        sep(),
        { value: 'cmd.source_control.open_review', label: 'Open Review Mode' }
      ], 'Worktree list options')
    });

    /* ================================== 5. BRANCHES / STASH (collapsed) */
    var bp = (pg.branches || {});
    var brBody =
      CZ.list(branches.map(function (br) { return branchRow(br, ownerOf, W, b); }).join(''),
              { label: 'Branches', key: 'branches' }) +
      '<button type="button" class="cz-more" data-pm-action="cmd.git.switch_branch">' +
        esc('Showing ' + num(bp.shown || branches.length) + ' of ' + num(bp.total || branches.length) + ' branches') +
      '</button>' +
      '<div class="cz-sum">Stash</div>' +
      (stash.length
        ? CZ.list(stash.map(function (s, i2) { return stashRow(s, i2, W, b); }).join(''),
                  { label: 'Stash entries', key: 'stash' })
        : CZ.empty('no-data', 'Nothing stashed.', { title: 'No stash entries' }));

    body += CZ.shelf({
      key: 'branches', ico: 'branch', label: 'Branches / Stash',
      count: num((bp.total || branches.length)) + ' / ' + stash.length,
      state: 'idle', collapsed: true,
      body: brBody,
      acts: menu([
        { value: 'cmd.git.switch_branch', label: 'Switch branch...' },
        { value: 'cmd.git.branch_create', label: 'New branch...' },
        sep(),
        { value: 'cmd.source_control.stash', label: 'Stash changes' },
        { value: 'cmd.source_control.stash', label: 'Apply latest stash' }
      ], 'Branch and stash options')
    });

    /* ------------------------------------------------------------ footer */
    var foot =
      '<div class="cz-foot">' +
        '<span class="cz-foot-count"><b>' + esc(counts.staged || 0) + '</b>' +
          esc(' staged - ' + (counts.unstaged || 0) + ' unstaged - ' + (counts.conflicts || 0) + ' conflicts') +
        '</span>' +
        (b >= 2
          ? CZ.act({ id: 'cmd.git.pull', label: 'Pull' + (remote.incoming ? ' ' + remote.incoming : '') }) +
            CZ.act({ id: 'cmd.git.push', label: 'Push' + (remote.outgoing ? ' ' + remote.outgoing : ''), primary: true })
          : menu([
              { value: 'cmd.git.pull', label: 'Pull' + (remote.incoming ? ' (' + remote.incoming + ')' : '') },
              { value: 'cmd.git.push', label: 'Push' + (remote.outgoing ? ' (' + remote.outgoing + ')' : '') },
              { value: 'cmd.git.fetch', label: 'Fetch' }
            ], 'Sync')) +
      '</div>';

    return root(b, cfg, h + '<div class="cz-scroll">' + body + '</div>' + foot);
  }


  /* ============================== register ============================== */
  global.VG_PANELS.search = pSearch;
  global.VG_PANELS.source = pSource;

})(window);
