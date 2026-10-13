/* The terminal's More menu (D12) and the Appearance component (D15, D16, D17; DR-068: one component for two
   surfaces). The terminal's surface is the Customize screen (77-customize.js), opened from the More menu's
   Appearance...; the code editor's surface is the compact popover below: Colour scheme ('Follow look' first), font and
   size (T.AppearancePopover, surface 'editor', D30). Both read the same scheme catalog, and the NieR paint (40-nier.css)
   reaches the popover through the same classes. */
(function () {
  var A = function () { return T.Appearance; };
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  var esc = function (s) { return T.util.esc(s); };

  /* ---------------- More menu ---------------- */
  T.View.prototype.moreMenu = function () {
    var v = this, s = this.session, running = s.state === 'running';
    var profiles = window.PMT ? window.PMT.profiles() : [];
    var agentItems = [{ id: 'agents-ask', label: 'Ask each time', checked: true, disabled: true, detail: 'Agents ask before typing here' }];
    s.grants.forEach(function (a) {
      if (a === s.owner) return;
      var nm = a.replace(/^agent:/, '');
      agentItems.push({ id: 'agent-' + a, label: (s.inTerminal.has(a) ? 'Allowed in this terminal: ' : 'Allowed once: ') + nm, detail: 'Revoke', run: function () { s.revoke(a); v.announce(nm + ' can no longer type here'); } });
    });
    /* shells inline, SSH hosts in their own submenu, as in the "+" menu (D39) */
    function newRow(p) { return { id: 'new-' + p.id, label: p.label, detail: p.detail, run: function () { if (v.api && v.api.open) v.api.open({ kind: 'terminal', profile: p.id, where: 'tab' }); } }; }
    var newRows = profiles.filter(function (p) { return p.group !== 'ssh'; }).map(newRow);
    var hosts = profiles.filter(function (p) { return p.group === 'ssh'; }).map(newRow);
    if (hosts.length) newRows.push('-', { id: 'new-ssh', label: 'SSH hosts', sub: hosts });
    var N = window.PMT && window.PMT.notifications, sid = s.id;
    return [
      { id: 'new', label: 'New terminal', sub: newRows },
      { id: 'split-down', label: 'Split down', run: function () { if (v.api && v.api.split) v.api.split('down', { kind: 'terminal', profile: s.profile.id, cwd: s.shell ? s.shell.cwd : s.cwd }); } },
      '-',
      { id: 'appearance', label: 'Appearance…', run: function () { v.openAppearance(); } },
      { id: 'text', label: 'Text size', sub: [
        { id: 'zoom-in', label: 'Bigger', shortcut: T.keys.label('zoomIn'), run: function () { v.zoom(1); } },
        { id: 'zoom-out', label: 'Smaller', shortcut: T.keys.label('zoomOut'), run: function () { v.zoom(-1); } },
        { id: 'zoom-reset', label: 'Reset', shortcut: T.keys.label('zoomReset'), run: function () { v.zoom(0); } }] },
      '-',
      { id: 'copy-mode', label: 'Copy mode', shortcut: T.keys.label('copyMode'), run: function () { v.focus(); v.startCopyMode(); } },
      { id: 'quick-select', label: 'Quick select', shortcut: T.keys.label('quickSelect'), run: function () { v.focus(); v.startHints(); } },
      { id: 'select-all', label: 'Select all', run: function () { v.selectAll(); } },
      { id: 'clear', label: 'Clear', shortcut: T.keys.label('clear'), run: function () { v.clearScreen(); } },
      { id: 'clear-scrollback', label: 'Clear scrollback', run: function () { v.term.write('\x1b[3J'); v.scrollTo(v.bottomAbs()); v.marksDirty = true; v.schedule(true); } },
      { id: 'a11y', label: 'Plain-text buffer', shortcut: T.keys.label('a11y'), run: function () { v.openA11y(); } },
      '-',
      { id: 'agents', label: 'Agent input', sub: agentItems },
      /* D38: system notifications from this terminal's programs while Puppet Master is in the background */
      N && N.available() ? { id: 'notify-mute', label: 'Mute notifications', detail: 'System notifications from this terminal', checked: N.muted(sid), run: function () { N.mute(sid); } } : null,
      { id: 'signal', label: 'Send signal', disabled: !running || !s.foreground(), sub: [
        { id: 'sig-int', label: 'Interrupt', detail: 'SIGINT', run: function () { s.interrupt(); } },
        { id: 'sig-term', label: 'Terminate', detail: 'SIGTERM', run: function () { s.shell.signal('SIGTERM', true); } },
        { id: 'sig-kill', label: 'Kill', detail: 'SIGKILL', danger: true, run: function () { s.kill(); } }] },
      { id: 'restart', label: 'Restart session', run: function () { v.restart(); } }
    ].filter(Boolean);
  };

  /* ---------------- Appearance popover ---------------- */
  /* T.AppearancePopover.open(anchor, { surface, get, set, onClose, view }) (D30). One popover for two surfaces:
       'terminal'  the terminal's own (View.openAppearance): anchor is the view's root and view the T.View; it reads
                   and writes T.Appearance at the scope its switch shows, so get and set are not used.
       'editor'    the code editor's: Colour scheme ('Follow look' first, the default), font face and size only; no
                   effects, cursor, trail, background or scope rows. get() returns the editor's { scheme, font, size }
                   and set(key, value) is called on every change (key 'scheme' | 'font' | 'size'); the editor keeps
                   the values. It floats under anchor (fixed, right-aligned to it), and closes on Escape, Done, the
                   close button or a click outside.
     Both call onClose once when they close, and return { el, close, refresh }. The rows, controls and scheme list
     are shared, so both read the same, and the NieR paint (40-nier.css) reaches both through the same classes. */
  /* the page's hover tags (PM7): a field sits beside its row label and a scheme row shows its name, so neither shows
     the tag engine's generic tag ("Change this setting.", "Choose this option."), which covered the list as the pointer
     or the keyboard moved through it. They stay bound to the tag engine (its census and the accessible description)
     with the tag's paint suppressed, as the panels' menu rows are (36-menu.js); the buttons say what they do */
  var QF = ' data-pm-hover-visual-suppressed="true"', QM = QF;
  function tag(label, detail) { return ' data-pm-hover-label="' + esc(label) + '" data-pm-hover-detail="' + esc(detail) + '"'; }
  function row(label, ctl) { return '<div class="pmt-pop-row"><span class="pmt-pop-label">' + esc(label) + '</span><span class="pmt-pop-ctl">' + ctl + '</span></div>'; }
  function select(key, value, opts, label) {
    return '<select data-key="' + key + '"' + QF + ' aria-label="' + esc(label || key) + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(value) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>';
  }
  function stepper(key, value, min, max, step) {
    return '<span class="pmt-stepper"><button type="button" class="pmt-step" data-step="-' + step + '" data-key="' + key + '" aria-label="Smaller"' + tag('Smaller', 'Text size ' + step + ' px smaller') + '>−</button><output>' + value + ' px</output><button type="button" class="pmt-step" data-step="' + step + '" data-key="' + key + '" aria-label="Bigger"' + tag('Bigger', 'Text size ' + step + ' px bigger') + '>+</button></span>';
  }
  function swatch(sch) {
    var c = sch.colors, a = c.ansi;
    return '<span class="pmt-swatch" style="background:' + c.background + ';color:' + c.foreground + '" aria-hidden="true"><span class="pmt-sw-fg">Aa</span>' +
      [1, 2, 3, 4, 5, 6].map(function (i) { return '<i style="background:' + a[i] + '"></i>'; }).join('') + '</span>';
  }
  /* the scheme list: the follow option ({ label, meta, swatch: a scheme }) first, then every scheme by family */
  function schemeOptions(sid, follow, q) {
    var list = A().schemes(), out = [], fam = null, ql = q.toLowerCase();
    if (!ql || follow.label.toLowerCase().indexOf(ql) >= 0 || (follow.meta || '').toLowerCase().indexOf(ql) >= 0) {
      out.push('<div class="pmt-scheme" role="option" tabindex="-1"' + QM + ' data-id="follow" aria-selected="' + (sid === 'follow') + '">' + swatch(follow.swatch || list[0]) +
        '<span class="pmt-scheme-name">' + esc(follow.label) + '</span><span class="pmt-scheme-meta">' + esc(follow.meta || '') + '</span></div>');
    }
    /* each family in its own box, so its sticky name scrolls away with it instead of piling up under the next one */
    list.forEach(function (sch) {
      if (ql && (sch.name + ' ' + sch.family).toLowerCase().indexOf(ql) < 0) return;
      if (sch.family !== fam) {
        if (fam !== null) out.push('</div>');
        fam = sch.family;
        out.push('<div class="pmt-scheme-fam" role="presentation"><div class="pmt-scheme-group" role="presentation">' + esc(fam === 'Puppet Master' ? 'Puppet Master originals' : fam) + '</div>');
      }
      out.push('<div class="pmt-scheme" role="option" tabindex="-1"' + QM + ' data-id="' + esc(sch.id) + '" aria-selected="' + (sid === sch.id) + '">' + swatch(sch) +
        '<span class="pmt-scheme-name">' + esc(sch.name) + '</span><span class="pmt-scheme-meta">' + (sch.appearance === 'light' ? 'Light' : 'Dark') + '</span></div>');
    });
    if (fam !== null) out.push('</div>');
    if (out.length === 0) out.push('<div class="pmt-pop-note">No scheme matches</div>');
    return out.join('');
  }
  /* Up and Down move through the scheme list (from the search field too); returns the option moved to */
  function listStep(pop, e) {
    var o = e.target.closest && e.target.closest('.pmt-scheme');
    if ((e.key !== 'ArrowDown' && e.key !== 'ArrowUp') || !(o || e.target.classList.contains('pmt-pop-search'))) return null;
    e.preventDefault();
    var opts = [].slice.call(pop.querySelectorAll('.pmt-scheme')), i = opts.indexOf(o);
    var n = opts[e.key === 'ArrowDown' ? Math.min(opts.length - 1, i + 1) : Math.max(0, i - 1)];
    if (n) n.focus();
    return n || null;
  }
  /* the chosen marks of the segmented choices and the scheme list, read before a render replaces them, so the new
     choice can be reached by a slide from the old one (60-motion.css says how far each look slides) */
  function memo(pop) {
    var m = { segs: {}, scheme: null };
    [].forEach.call(pop.querySelectorAll('.pmt-seg button[aria-checked="true"]'), function (b) {
      var ind = b.parentNode.querySelector('.pmt-seg-ind');
      m.segs[b.getAttribute('data-key') || 'scope'] = ind ? where(ind, null) : { x: b.offsetLeft, w: b.offsetWidth, value: b.getAttribute('data-value') || b.getAttribute('data-scope') };
    });
    var o = pop.querySelector('.pmt-schemes .pmt-scheme[aria-selected="true"]'), si = pop.querySelector('.pmt-scheme-ind');
    /* a slide still running when the popover renders again (the editor refreshes it from its set) goes on from where
       its stand-in is now */
    if (si) m.scheme = where(si, null);
    else if (o) m.scheme = { id: o.getAttribute('data-id'), x: o.offsetLeft, y: o.offsetTop, w: o.offsetWidth, h: o.offsetHeight };
    return m;
  }
  function where(ind, id) {
    var box = ind.parentNode, br = box.getBoundingClientRect(), r = ind.getBoundingClientRect();
    return { id: id, value: id, x: r.left - br.left - box.clientLeft, y: r.top - br.top - box.clientTop, w: r.width, h: r.height };
  }
  function slide(pop, before) {
    [].forEach.call(pop.querySelectorAll('.pmt-seg button[aria-checked="true"]'), function (b) {
      var was = before.segs[b.getAttribute('data-key') || 'scope'];
      if (was && was.value !== (b.getAttribute('data-value') || b.getAttribute('data-scope'))) glide(b.parentNode, 'pmt-seg-ind', was, { x: b.offsetLeft, w: b.offsetWidth });
    });
    var o = pop.querySelector('.pmt-schemes .pmt-scheme[aria-selected="true"]'), w = before.scheme;
    if (o && w && w.id !== o.getAttribute('data-id')) {
      glide(o.closest('.pmt-schemes'), 'pmt-scheme-ind', w, { x: o.offsetLeft, y: o.offsetTop, w: o.offsetWidth, h: o.offsetHeight });
      T.Motion.play(o, 'pmt-picked');
    }
  }
  /* a stand-in for the chosen mark travels from a to b while the real one waits, then hands over */
  function glide(box, cls, a, b) {
    var ind = el('i', cls);
    ind.setAttribute('aria-hidden', 'true');
    var put = function (p) { ind.style.transform = 'translate(' + p.x + 'px,' + (p.y || 0) + 'px)'; ind.style.width = p.w + 'px'; if (p.h) ind.style.height = p.h + 'px'; };
    put(a); box.appendChild(ind); box.classList.add('pmt-sliding');
    void ind.offsetWidth;
    ind.classList.add('pmt-go'); put(b);
    T.Motion.finished(ind, function () { ind.remove(); if (!box.querySelector('.' + cls)) box.classList.remove('pmt-sliding'); });
  }
  function focusFirst(pop) {
    var first = pop.querySelector('.pmt-scheme[aria-selected="true"]') || pop.querySelector('.pmt-pop-search');
    if (first) { first.focus({ preventScroll: true }); if (first.scrollIntoView) first.scrollIntoView({ block: 'nearest' }); }
  }

  T.AppearancePopover = {
    /* surface 'terminal' (opts.view, the T.View): the Customize screen; 'editor': the compact popover below */
    open: function (anchor, opts) {
      opts = opts || {};
      return opts.surface === 'editor' ? openEditor(anchor, opts) : T.Customize.open(opts.view, opts);
    }
  };

  T.View.prototype.openAppearance = function () {
    if (this.pop) { this.closeAppearance(); return; }
    T.AppearancePopover.open(this.root, { surface: 'terminal', view: this });
  };

  /* noFocus: the view is going away (dispose), so the focus is left where it is */
  T.View.prototype.closeAppearance = function (noFocus) {
    if (!this.pop) return;
    T.Appearance.endPreview(this);
    /* closed at once for everything else (a new one may open); its exit plays, unless the view is going away */
    var pop = this.pop;
    this.pop = null;
    if (pop._pmtClose) pop._pmtClose(noFocus);
    else { pop.inert = true; pop.setAttribute('aria-hidden', 'true'); if (noFocus) pop.remove(); else T.Motion.leave(pop, function () { pop.remove(); }); }
    if (this._popOutside) document.removeEventListener('mousedown', this._popOutside, true);
    var done = this._apOnClose; this._apOnClose = null;
    if (done) { try { done(); } catch (e) { console.error('[pmt] appearance onClose failed', e); } }
    if (!noFocus) this.focus();
  };

  /* the scheme rows and swatches, for any surface that lists the catalog */
  T.AppearanceUI = { swatch: swatch, schemeOptions: schemeOptions, listStep: listStep };

  /* ---- the editor surface ---- */
  /* the scheme 'Follow look' gives the editor now: the look's own scheme for the mode, and in Retro dark the phosphor
     the Retro look has chosen (retroPhosphor) */
  function editorFollowScheme() {
    var look = T.look(), lk = A().lookKey(look), mode = look.mode === 'light' ? 'light' : 'dark';
    if (lk === 'retro' && mode === 'dark') return A().scheme(A().retroPhosphor() === 'amber' ? 'pm-phosphor-amber' : 'pm-phosphor-green');
    return A().scheme(A().LOOKS[lk][mode]);
  }
  function openEditor(anchor, opts) {
    var pop = el('div', 'pmt-pop pmt-pop-float pmt-calm');
    pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Editor appearance'); pop.tabIndex = -1;
    /* inside the panels' overlay layer when there is one, so it takes the panel tokens and sits above the tabs */
    (document.getElementById && document.getElementById('pmw-overlay') || document.body).appendChild(pop);
    var query = '', closed = false;
    function cur() {
      var c = (typeof opts.get === 'function' && opts.get()) || {};
      return { scheme: c.scheme && (c.scheme === 'follow' || A().scheme(c.scheme)) ? c.scheme : 'follow',
        font: c.font && A().FONTS[c.font] ? c.font : 'follow', size: typeof c.size === 'number' && c.size > 0 ? c.size : null };
    }
    function put(key, value) {
      if (typeof opts.set === 'function') { try { opts.set(key, value); } catch (e) { console.error('[pmt] editor appearance set failed', e); } }
      render(true);
    }
    function follow() { var s = editorFollowScheme(); return { label: 'Follow look', meta: s ? s.name : '', swatch: s }; }
    function shownSize(c) { return c.size || (c.font !== 'follow' ? A().FONTS[c.font].size : 13); }
    function render(keepScroll) {
      var body = pop.querySelector('.pmt-pop-body'), st = body ? body.scrollTop : 0, before = memo(pop);
      var c = cur();
      /* the look's chrome shapes (30-looks.css) reach this copy too, though it floats outside any terminal */
      pop.setAttribute('data-pmt-look', A().lookKey(T.look()));
      var fonts = [['follow', 'Follow look']].concat(Object.keys(A().FONTS).map(function (k) { return [k, A().FONTS[k].label]; }));
      pop.innerHTML = '<div class="pmt-pop-head"><span class="pmt-pop-title">Appearance</span>' +
        '<button type="button" class="pmt-pop-x" data-act="close" aria-label="Close appearance" aria-keyshortcuts="Escape" data-pm-hover-label="Close appearance"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg></button></div>' +
        '<div class="pmt-pop-body">' +
        '<section class="pmt-pop-sec" aria-label="Colour scheme"><h4>Colour scheme</h4>' +
        '<input class="pmt-pop-search" type="search"' + QF + ' placeholder="Search schemes" aria-label="Search schemes" value="' + esc(query) + '">' +
        '<div class="pmt-schemes" role="listbox" aria-label="Colour schemes">' + schemeOptions(c.scheme, follow(), query) + '</div></section>' +
        '<section class="pmt-pop-sec" aria-label="Font"><h4>Font</h4>' +
        row('Face', select('font', c.font, fonts, 'Font')) +
        row('Size', stepper('size', shownSize(c), 8, 32, 0.5)) +
        '</section></div>' +
        '<div class="pmt-pop-foot"><span class="pmt-pop-spacer"></span><button type="button" class="pmt-textbtn pmt-textbtn-primary" data-act="close"' + tag('Done', 'Closes Appearance; every change is already applied') + '>Done</button></div>';
      var nb = pop.querySelector('.pmt-pop-body'); if (keepScroll && nb) nb.scrollTop = st;
      place();
      slide(pop, before);
    }
    /* under the anchor, right-aligned to it, kept inside the page (an overlay, placed the way the panels' menus are);
       full width less a margin on a narrow page */
    function place() {
      var de = document.documentElement, vw = de.clientWidth || 1024, vh = de.clientHeight || 768;
      var r = anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : { top: 0, bottom: 40, right: vw - 8 };
      var narrow = vw < 420, w = narrow ? vw - 12 : 384;
      var top = Math.min(r.bottom + 6, Math.max(6, vh - 132));
      pop.style.top = top + 'px';
      pop.style.left = (narrow ? 6 : Math.max(6, Math.min(r.right - w, vw - w - 6))) + 'px';
      pop.style.width = w + 'px';
      pop.style.maxHeight = Math.max(120, vh - top - 12) + 'px';
    }
    function close() {
      if (closed) return;
      closed = true;
      pop.inert = true; pop.setAttribute('aria-hidden', 'true');
      T.Motion.leave(pop, function () { pop.remove(); });
      document.removeEventListener('mousedown', outside, true);
      window.removeEventListener('resize', place);
      if (anchor && anchor.focus && document.contains && document.contains(anchor)) anchor.focus({ preventScroll: true });
      if (typeof opts.onClose === 'function') { try { opts.onClose(); } catch (e) { console.error('[pmt] editor appearance onClose failed', e); } }
    }
    function outside(e) { if (!pop.contains(e.target) && !(anchor && anchor.contains && anchor.contains(e.target))) close(); }

    render(false);
    pop.addEventListener('input', function (e) {
      if (!e.target.classList.contains('pmt-pop-search')) return;
      query = e.target.value;
      pop.querySelector('.pmt-schemes').innerHTML = schemeOptions(cur().scheme, follow(), query);
    });
    pop.addEventListener('change', function (e) {
      var t = e.target;
      if (t.tagName === 'SELECT' && t.getAttribute('data-key') === 'font') put('font', t.value);
    });
    pop.addEventListener('click', function (e) {
      var b = e.target.closest('button, .pmt-scheme'); if (!b) return;
      if (b.classList.contains('pmt-scheme')) { put('scheme', b.getAttribute('data-id')); var o = pop.querySelector('.pmt-scheme[aria-selected="true"]'); if (o) o.focus({ preventScroll: true }); return; }
      if (b.hasAttribute('data-step')) { put('size', T.util.clamp(shownSize(cur()) + parseFloat(b.getAttribute('data-step')), 8, 32)); return; }
      if (b.getAttribute('data-act') === 'close') close();
    });
    pop.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
      var o = e.target.closest && e.target.closest('.pmt-scheme');
      listStep(pop, e);
      if (e.key === 'Enter' && o) { e.preventDefault(); o.click(); }
      e.stopPropagation();
    });
    window.addEventListener('resize', place);
    setTimeout(function () { if (!closed) document.addEventListener('mousedown', outside, true); }, 0);
    focusFirst(pop);
    T.Motion.play(pop);
    return { el: pop, close: close, refresh: function () { if (!closed) render(true); } };
  }
})();
