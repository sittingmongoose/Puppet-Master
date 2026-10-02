/* The rail, the head and its menus (owner: engine; ARCHITECTURE.md section 4.10, DESIGN-SPEC sections 2.1 and 16,
   DESIGN-SPEC-ATLAS 2.2). Room, range, scope and detail are local view state: each change is one view action, never a
   command (R-SHELL-08). Every head dropdown is a PMU.menu (45-menu.js, the Chat Assistant 5.6 Pro menu): scope (search,
   icon rail, sections), range overflow (narrow heads), detail, panels (Customize), export. */
(function () {
  var st = PMU.core.state;
  var app = document.getElementById('pmuApp');
  var nav = document.getElementById('pmuNav'), ink = document.getElementById('pmuNavInk');
  var inkCtl = null, inkReady = false, lastRoom = null, lastRange = null;
  var titleDir = 1;   /* the camera's direction (WOW-SPEC-3 6.1): the titles move with it */
  var ROOM_ORDER = Object.keys(ROOM);
  /* DATA.providers -> the Settings catalog names and ids (PROVIDERS.md; every provider name on the page is the Settings name) */
  var SETTINGS_OF = { claude: 'claude-code', codex: 'openai-codex', qwen: 'qwen-coding', gemini: 'gemini-direct', kimi: 'kimi-coding', copilot: 'github-copilot' };
  var SETTINGS_NAME = { 'claude-code': 'Claude', 'openai-codex': 'ChatGPT / Codex', 'qwen-coding': 'Qwen Coding Plan', 'gemini-direct': 'Gemini API',
    'kimi-coding': 'Kimi Code', 'github-copilot': 'GitHub Copilot' };
  function providerName(legacyId) {
    var sid = SETTINGS_OF[legacyId] || legacyId, p = null;
    try { p = PMU.roster && PMU.roster.provider ? PMU.roster.provider(sid) : null; } catch (e) { p = null; }
    return (p && p.name) || SETTINGS_NAME[sid] || (DATA.providers.filter(function (x) { return x.id === legacyId; })[0] || {}).name || legacyId;
  }
  var VIEWS = [['all', 'All current usage', 'Every configured route', 'filter'], ['work', 'Work accounts', 'Company and team credentials', 'briefcase'],
    ['personal', 'Personal accounts', 'Personal plans and keys', 'user']];
  function scopeRows() {
    return VIEWS.map(function (s) { return [s[0], s[1], s[2], s[3]]; }).concat(DATA.providers.map(function (p) {
      var n = providerName(p.id); return ['provider:' + p.id, n + ' only', 'Only ' + n + ' records', null, p.id];
    }));
  }
  function scopeLabel(scope) {
    var row = scopeRows().filter(function (s) { return s[0] === scope; })[0];
    return row ? row[1] : 'Validated Usage scope';
  }
  var RANGES = [['5h', 'Last 5 hours', 'Half-hour buckets'], ['24h', 'Last 24 hours', 'Hourly buckets'], ['7d', 'Last 7 days', '6-hour buckets'], ['30d', 'Last 30 days', 'Daily buckets']];

  function syncInk(animate) {
    if (!inkCtl && window.PM6_LIQUID_INK && nav && ink) {
      try { inkCtl = window.PM6_LIQUID_INK.attach({ strip: nav, ink: ink, axis: 'v', getActive: function () { return nav.querySelector('.pmu-navbtn[data-room].active'); } }); } catch (error) { inkCtl = null; }
    }
    if (!inkCtl) return;
    requestAnimationFrame(function () { try { inkCtl.resync(!!animate && inkReady); inkReady = true; } catch (error) {} });
  }
  /* the segmented underline slides between buttons (A1 8.1: 520 ms spring); transform only */
  function syncSegInk(seg, instant) {
    if (!seg) return;
    var on = seg.querySelector('button.active'), bar = seg.querySelector('.pmu-seg-ink');
    if (!bar) return;
    if (!on || !on.offsetWidth) { bar.style.opacity = '0'; return; }
    var x = on.offsetLeft + 8, w = Math.max(6, on.offsetWidth - 16);
    var first = instant || !bar._pmuPlaced;
    if (first) bar.style.transition = 'none';
    bar.style.opacity = '1';
    bar.style.transform = 'translateX(' + x + 'px) scaleX(' + (w / 100) + ')';
    if (first) { void bar.offsetWidth; bar.style.transition = ''; }
    bar._pmuPlaced = true;
  }
  function counts(room) {
    var out = { glance: 0, detailed: 0, diagnostics: 0 };
    if (!PMU.board) return out;
    var hidden = st.hidden[room] || {};
    PMU.board.layout(room).forEach(function (r) {
      if (hidden[r.id]) return;
      var lv = ((PMU.widgets.get(r.id) || {}).level) || 'glance', rank = (DETAIL[lv] || DETAIL.glance).rank;
      Object.keys(out).forEach(function (k) { if (rank <= DETAIL[k].rank) out[k]++; });
    });
    return out;
  }
  /* a copy of the old title block (no ids, no hover tags) over the real one, leaving upward */
  /* the reads of the title ghost happen before render() writes anything (a room click forces no layout of its own) */
  function ghostGeo(tb) {
    var src = tb.querySelector('#pmuRoomTitle'), cs = src ? getComputedStyle(src) : null;
    return { css: cs ? 'margin:0;white-space:nowrap;overflow:hidden;font-style:' + cs.fontStyle + ';font-weight:' + cs.fontWeight + ';font-size:' + cs.fontSize + ';line-height:' + cs.lineHeight + ';font-family:' + cs.fontFamily + ';letter-spacing:' + cs.letterSpacing + ';text-transform:' + cs.textTransform + ';color:' + cs.color : '',
      l: tb.offsetLeft, t: tb.offsetTop, w: tb.offsetWidth, h: tb.offsetHeight };
  }
  function titleGhost(tb, geo) {
    var head = tb.parentNode; if (!head) return;
    geo = geo || ghostGeo(tb);
    var old = head.querySelector(':scope > .pmu-titleghost'); if (old) old.remove();
    var g = tb.cloneNode(true);
    g.classList.add('pmu-titleghost'); g.setAttribute('aria-hidden', 'true');
    /* the title's look comes from its id: the copy takes the computed face */
    var dst = g.querySelector('h2');
    if (dst && geo.css) dst.style.cssText = geo.css;
    Array.prototype.forEach.call([g].concat(Array.prototype.slice.call(g.querySelectorAll('*'))), function (n) {
      n.removeAttribute('id'); n.removeAttribute('data-pm-hover-label'); n.removeAttribute('data-pm-hover-detail'); n.removeAttribute('tabindex');
    });
    g.style.left = geo.l + 'px'; g.style.top = geo.t + 'px'; g.style.width = geo.w + 'px'; g.style.height = geo.h + 'px';
    head.appendChild(g);
    var stepped = PMU.motion.family() === 'retro';
    var a = PMU.motion.animate(g, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(' + (-8 * titleDir) + 'px)' }],
      { dur: 120, easing: stepped ? 'steps(2,jump-start)' : 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
    if (a) a.finished.then(function () { g.remove(); }, function () { g.remove(); }); else g.remove();
  }
  /* the Animation speed for CSS (WOW-SPEC 9, E-10): every Usage transition duration reads calc(<ms> * var(--pmu-speed)) */
  var speedKey = null;
  function syncSpeed() {
    if (!app || !PMU.motion) return;
    var v = String(PMU.motion.speed());
    if (v !== speedKey) { speedKey = v; app.style.setProperty('--pmu-speed', v); }
  }
  if (PMU.theme && PMU.theme.onChange) PMU.theme.onChange(function () { syncSpeed(); });
  function render() {
    if (!app) return;
    var room = ROOM[st.room] ? st.room : 'overview';
    var tb0 = lastRoom !== null && lastRoom !== room && PMU.motion && !PMU.motion.reduced() && !PMU.theme.look().nier ? app.querySelector('.pmu-stagehead > .pmu-titleblock:not(.pmu-titleghost)') : null;
    var geo0 = tb0 ? ghostGeo(tb0) : null;
    syncSpeed();
    app.setAttribute('data-room', room);
    PMU.core.$$('.pmu-navbtn[data-room]', app).forEach(function (button) {
      var rk = button.getAttribute('data-room'), chosen = rk === room;
      /* the rail's hover tag names the room's purpose (MOTION-REVIEW-2 item 13: it read "Choose this option") */
      if (ROOM[rk] && !button.hasAttribute('data-pm-hover-detail')) { button.setAttribute('data-pm-hover-label', ROOM[rk].title); button.setAttribute('data-pm-hover-detail', ROOM[rk].desc); }
      button.classList.toggle('active', chosen);
      if (chosen) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
      /* the room just opened shows no rail tag (final fixes, Mac films: about a second after a rail click the tag of the
         button under the resting pointer opened over the board's first card, "Auto-switch 91%" read "1%"); the head
         names the open room, and every other room keeps its tag */
      if (chosen) button.setAttribute('data-pm-hover-exempt', 'current-room');
      else if (button.getAttribute('data-pm-hover-exempt') === 'current-room') button.removeAttribute('data-pm-hover-exempt');
    });
    var title = document.getElementById('pmuRoomTitle'), desc = document.getElementById('pmuRoomDesc');
    var changed = lastRoom !== null && lastRoom !== room;
    /* the room title carries the cut (WOW-SPEC 3.2): the old title slides up 8 px and fades (120 IN) while the new one
       rises 10 px (260 OUT, from 60); NieR decodes instead (the app's page-title decode on #pmuRoomTitle) */
    var tb = title && title.closest('.pmu-titleblock'), animTitle = changed && tb && PMU.motion && !PMU.motion.reduced() && !PMU.theme.look().nier;
    if (animTitle) titleGhost(tb, geo0);
    if (title && title.textContent !== ROOM[room].title) title.textContent = ROOM[room].title;   /* one text node (NieR decode) */
    if (title) { title.setAttribute('data-pm-hover-label', ROOM[room].title); title.setAttribute('data-pm-hover-detail', ROOM[room].desc); }
    /* (the subtitle's text and fit: fitDesc, below) */
    /* the chosen room's rail icon answers the click: one small pop (POP, 320; Retro and NieR step) while the ink travels */
    if (changed && PMU.motion && !PMU.motion.reduced()) {
      var navOn = app.querySelector('.pmu-navbtn[data-room="' + room + '"] .pmu-navicon'), ff = PMU.motion.family();
      if (navOn) PMU.motion.animate(navOn, [{ transform: 'scale(.82)' }, { transform: 'scale(1.14)', offset: 0.45 }, { transform: 'none' }],
        { dur: 320, easing: ff === 'retro' || ff === 'nier' ? 'steps(3,jump-start)' : 'cubic-bezier(.34,1.45,.64,1)' });
    }
    if (animTitle) {
      var f = PMU.motion.family(), stepped = f === 'retro';
      [title, desc].forEach(function (el, i) {
        if (el) PMU.motion.animate(el, [{ opacity: 0, transform: 'translateY(' + (10 * titleDir) + 'px)' }, { opacity: 1, transform: 'none' }],
          { dur: 260, delay: 60 + i * 40, easing: stepped ? 'steps(3,jump-start)' : 'cubic-bezier(.22,.8,.28,1)', fill: 'backwards' });
      });
    }
    lastRoom = room;
    PMU.core.$$('.pmu-range button[data-range]', app).forEach(function (button) {
      var on = button.getAttribute('data-range') === st.range;
      button.classList.toggle('active', on); button.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    /* the range underline is measured only when the range changed (a layout read in every room click otherwise) */
    var rangeEl = document.getElementById('pmuRange'), segInk = rangeEl && rangeEl.querySelector('.pmu-seg-ink');
    if (lastRange !== st.range || !(segInk && segInk._pmuPlaced)) { syncSegInk(rangeEl); lastRange = st.range; }
    var rl = document.getElementById('pmuRangeLabel'); if (rl && rl.textContent !== st.range) rl.textContent = st.range;
    var detail = document.getElementById('pmuDetailLabel'); if (detail) detail.textContent = DETAIL[st.detail].label;
    /* a narrow head shows the level as its icon (the menu's icons), the label in the hover tag (E4: the title stays whole) */
    var dLead = document.getElementById('pmuDetailLead'), dIcon = st.detail === 'detailed' ? 'list' : st.detail === 'diagnostics' ? 'tool' : 'eye';
    if (dLead && dLead._pmu !== dIcon) { dLead.innerHTML = PMU.icon(dIcon); dLead._pmu = dIcon; }
    var dBtn = document.getElementById('pmuDetailBtn'); if (dBtn) { dBtn.setAttribute('data-pm-hover-label', 'Detail'); dBtn.setAttribute('data-pm-hover-detail', DETAIL[st.detail].label); }
    var scope = document.getElementById('pmuScopeLabel'); if (scope) scope.textContent = scopeLabel(st.scope);
    var lead = document.getElementById('pmuScopeLead');
    if (lead) {
      var pid = st.scope.indexOf('provider:') === 0 ? st.scope.slice(9) : null;
      var want = pid ? PMU.mark(pid, 16) : PMU.icon(st.scope === 'work' ? 'briefcase' : st.scope === 'personal' ? 'user' : 'filter');
      if (lead._pmu !== want) { lead.innerHTML = want; lead._pmu = want; }
    }
    /* the count and its word apart: a narrow head shows the grid icon and the count only (E4: the room title is never cut) */
    var count = document.getElementById('pmuPanelCount');
    if (count && PMU.board) {
      var nP = PMU.board.visible(room).length, word = t('head.panels', { n: '' }).trim(), html = nP + '<span class="pmu-pcw"> ' + esc(word) + '</span>';
      if (count._pmu !== html) { count.innerHTML = html; count._pmu = html; }
    }
    fitDesc();
    syncInk(true);
  }
  /* the head subtitle (E3-11, NOTES3-content E3): shown whole when it fits beside the title, otherwise hidden (the title's
     hover tag carries it); never an ellipsis. Measured with canvas text metrics against the title block's width from a
     ResizeObserver, so a room click reads no layout. In the demo hour (Q2) the slot shows "Demo time HH:MM". */
  var fitCtx = null, faceKey = null, faces = null, tbW = 0;
  function textW(text, face) {
    if (!fitCtx) { try { fitCtx = document.createElement('canvas').getContext('2d'); } catch (error) { return 0; } }
    fitCtx.font = face.font;
    var s0 = face.tt === 'uppercase' ? String(text).toUpperCase() : String(text);
    return fitCtx.measureText(s0).width + (parseFloat(face.ls) || 0) * s0.length;
  }
  function fitDesc() {
    var title = document.getElementById('pmuRoomTitle'), desc = document.getElementById('pmuRoomDesc');
    if (!title || !desc) return;
    var room = ROOM[st.room] ? st.room : 'overview';
    var demo = PMU.live && PMU.live.hour && PMU.live.hour.running && PMU.live.hour.running() ? PMU.live.hour.label() : null;
    var text = demo || ROOM[room].desc;
    if (desc.textContent !== text) desc.textContent = text;
    desc.classList.toggle('is-demo', !!demo);
    if (!tbW) { desc.hidden = false; return; }   /* before the first measure: the CSS keeps it on one line */
    var key = PMU.theme.look().key;
    if (faceKey !== key || !faces) {
      /* the font shorthand reads '' when a sub-property has no shorthand form (tabular-nums): build it from the longhands */
      var face = function (cs) { return { font: [cs.fontStyle, cs.fontWeight, cs.fontSize, cs.fontFamily].join(' '), ls: cs.letterSpacing, tt: cs.textTransform }; };
      faces = { title: face(getComputedStyle(title)), desc: face(getComputedStyle(desc)) };
      faceKey = key;
    }
    var need = textW(text, faces.desc) + 4;   /* stacked under the title: the block's whole width */
    var hide = need > tbW;
    if (desc.hidden !== hide) desc.hidden = hide;
  }
  var tbEl = app && app.querySelector('.pmu-stagehead > .pmu-titleblock:not(.pmu-titleghost)');
  if (tbEl && window.ResizeObserver) new ResizeObserver(function (entries) {
    var w = entries && entries[0] && entries[0].contentRect ? entries[0].contentRect.width : 0;
    if (Math.abs(w - tbW) < 0.5) return;
    tbW = w; fitDesc();
  }).observe(tbEl);
  if (PMU.theme && PMU.theme.onChange) PMU.theme.onChange(function () { faces = null; requestAnimationFrame(fitDesc); });
  function setView(patch, source) {
    var changed = Object.keys(patch).filter(function (k) { return patch[k] !== undefined && st[k] !== patch[k]; });
    if (!changed.length) return false;
    var roomChange = changed.indexOf('room') >= 0, prevRoom = st.room;
    if (roomChange) titleDir = ROOM_ORDER.indexOf(patch.room) < ROOM_ORDER.indexOf(prevRoom) ? -1 : 1;
    /* the shared-element flight reads the old room's shares in one batch before anything is written (WOW-SPEC-3 6.2) */
    if (roomChange && PMU.film && PMU.film.snapShares) { try { PMU.film.snapShares(patch.room); } catch (error) { console.error('[pm-usage] flight read', error); } }
    if (PMU.menu) PMU.menu.close();
    /* the inspector belongs to a panel of the room it was opened from */
    if (roomChange && PMU.inspector && PMU.inspector.isOpen()) PMU.inspector.close(true);
    changed.forEach(function (k) { st[k] = patch[k]; });
    var type = roomChange ? 'view.usage.room_selected' : 'view.usage.' + changed[0] + '_selected';
    var payload = { source: source || 'head' }; changed.forEach(function (k) { payload[k] = patch[k]; });
    viewAction(type, payload);
    render();
    if (PMU.board) {
      /* a room change re-reads the Settings roster first (Settings may have changed it since the last read) */
      /* (the Settings roster is re-read when the page is entered and after every write: a room click never pays for a
         fresh copy of the Settings state, 10 ms on the CPU-only VM) */
      if (roomChange) PMU.board.mount(st.room, { dir: ROOM_ORDER.indexOf(st.room) < ROOM_ORDER.indexOf(prevRoom) ? -1 : 1, transition: true });
      else if (changed.indexOf('detail') >= 0) PMU.board.relevel();
      else PMU.board.refresh(changed[0]);
      PMU.board.persist();
    }
    /* no confirmation toast for a view change: the control's own label already shows the new value (a toast in the
       title-bar slot covered the head controls and swallowed the next click) */
    return true;
  }

  /* ---- the head menus ---- */
  function scopeMenu(anchor) {
    var rows = scopeRows();
    return PMU.menu.toggle(anchor, {
      id: 'scope', title: 'Scope', current: scopeLabel(st.scope), search: { placeholder: 'Find a scope…' }, width: 340, align: 'start',
      railLabel: 'Scope groups',
      rail: [{ value: 'all', label: 'Every scope', icon: 'filter' }, { value: 'views', label: 'Account groups', icon: 'users' }].concat(DATA.providers.map(function (p) {
        return { value: p.id, label: providerName(p.id), mark: p.id };
      })),
      sections: [
        { label: 'Accounts', group: 'views', rows: rows.slice(0, 3).map(function (s) { return { value: s[0], label: s[1], sub: s[2], icon: s[3], active: st.scope === s[0] }; }) },
        { label: 'Providers', group: 'providers', rows: rows.slice(3).map(function (s) { return { value: s[0], label: s[1], sub: s[2], mark: s[4], group: s[4], active: st.scope === s[0] }; }) }
      ],
      foot: st.scope && !rows.some(function (s) { return s[0] === st.scope; }) ? 'Current scope: Validated Usage scope' : null,
      onPick: function (v) { setView({ scope: v }, 'scope'); }
    });
  }
  function rangeMenu(anchor) {
    return PMU.menu.toggle(anchor, {
      id: 'range', title: 'Range', current: st.range, align: 'end', width: 260,
      /* the bucket words come from the series the charts draw (5 hours: half-hour, 7 days: 6-hour buckets) */
      rows: RANGES.map(function (r) { var b = PMU.data && PMU.data.buckets ? PMU.data.buckets(r[0]) : null; return { value: r[0], label: r[1], sub: b && b.label ? b.label : r[2], right: r[0], active: st.range === r[0] }; }),
      onPick: function (v) { setView({ range: v }, 'range-menu'); }
    });
  }
  function detailMenu(anchor) {
    var c = counts(st.room);
    return PMU.menu.toggle(anchor, {
      id: 'detail', title: 'Detail', current: DETAIL[st.detail].label, align: 'end', width: 360,
      rows: Object.keys(DETAIL).map(function (k) {
        return { value: k, label: DETAIL[k].label, sub: DETAIL[k].desc, right: t('head.panels', { n: c[k] }), active: st.detail === k,
          icon: k === 'glance' ? 'eye' : k === 'detailed' ? 'list' : 'tool' };
      }),
      onPick: function (v) { setView({ detail: v }, 'detail'); }
    });
  }
  function panelsSpec() {
    var room = st.room, hidden = st.hidden[room] || {};
    var rank = DETAIL[st.detail].rank, lay = PMU.board ? PMU.board.layout(room) : [];
    var byLevel = { glance: [], detailed: [], diagnostics: [] };
    lay.slice().sort(function (a, b) { return a.y - b.y || a.x - b.x; }).forEach(function (r) {
      var d = PMU.widgets.get(r.id) || { title: r.id }, lv = d.level || 'glance';
      var title = typeof d.title === 'function' ? d.title({ id: r.id, room: room, state: st }) : (d.title || r.id);
      (byLevel[lv] || byLevel.glance).push({ value: r.id, label: title, sub: (DETAIL[lv].rank > rank ? 'Shows at ' + DETAIL[lv].label + ' · ' : '') + r.w + ' x ' + r.h,
        toggle: true, active: !hidden[r.id], keywords: r.id });
    });
    var shown = PMU.board ? PMU.board.visible(room).length : 0;
    return {
      id: 'panels', title: 'Panels in ' + ROOM[room].label, current: t('head.panels', { n: shown }), search: { placeholder: 'Find a panel…' }, align: 'end', width: 340,
      keepOpen: true, focusSearch: false,
      sections: Object.keys(byLevel).filter(function (k) { return byLevel[k].length; }).map(function (k) { return { label: DETAIL[k].label, rows: byLevel[k] }; }).concat([{
        label: 'Layout', rows: [
          { value: '__tidy', label: t('customize.tidy'), sub: t('customize.tidy_sub'), icon: 'tidy', action: true },
          { value: '__reset_room', label: t('customize.reset_room'), sub: t('customize.reset_room_sub'), icon: 'refresh', action: true },
          { value: '__reset_all', label: t('customize.reset_all'), sub: t('customize.reset_all_sub'), icon: 'refresh', action: true, danger: true }] }]),
      onPick: function (v, row, h) {
        if (v === '__tidy') { PMU.board.tidy(); return true; }
        if (v === '__reset_room') { PMU.board.reset('room'); PMU.shell.toast(t('toast.reset')); return true; }
        if (v === '__reset_all') { PMU.board.reset('all'); PMU.shell.toast(t('toast.reset')); return true; }
        PMU.board.setVisible(v, !!(st.hidden[st.room] || {})[v]);
        render();
        h.spec = panelsSpec();
        return false;
      }
    };
  }
  function exportMenu(anchor) {
    return PMU.menu.toggle(anchor, {
      id: 'export', title: 'Export', current: 'JSON', align: 'end', width: 320,
      rows: [{ value: 'snapshot', label: t('export.snapshot'), sub: t('export.snapshot_sub'), icon: 'file', action: true },
        { value: 'ledger', label: t('export.ledger'), sub: t('export.ledger_sub'), icon: 'list', action: true }],
      onPick: function (v) {
        var ok = window.PM7_USAGE && window.PM7_USAGE.exportJson(v);
        PMU.shell.toast(ok ? t('toast.exported', { file: v === 'ledger' ? 'puppet-master-usage-ledger.json' : 'puppet-master-usage.json' }) : t('toast.export_failed'));
      }
    });
  }

  /* PMU.shell.pop: the skeleton's popover helper, kept for callers; it is a PMU.menu now */
  function pop(anchor, spec) {
    /* rows may carry section: 'ANTHROPIC' (a small-caps label before the first row that carries it) */
    var sections = [], cur = null;
    (spec.rows || []).forEach(function (r) {
      if (!cur || (r.section && r.section !== cur.label)) { cur = { label: r.section || null, rows: [] }; sections.push(cur); }
      cur.rows.push({ value: r.value, label: r.label, sub: r.sub, active: r.active, icon: r.glyph || r.icon, mark: r.mark, swatch: r.swatch, disabled: r.disabled,
        reason: r.reason, right: r.right, toggle: r.toggle, keywords: r.keywords });
    });
    var h = PMU.menu.toggle(anchor, { id: spec.id || ('pop:' + (spec.title || '')), title: spec.title, current: spec.current, meta: spec.meta, search: spec.search, foot: spec.foot,
      width: spec.width, keepOpen: spec.keepOpen, align: spec.align === 'left' ? 'start' : spec.align === 'right' ? 'end' : spec.align,
      sections: sections, onPick: spec.onPick });
    return { close: function () { if (h) h.close(); } };
  }
  function closePop() { if (PMU.menu) PMU.menu.close(); }
  /* Usage's own toasts: a stage-local note at the bottom centre of #pmuStage that never takes a pointer, so it can never
     cover or swallow a head control; when the page is hidden (bridge actions) they go to the app's notification layer */
  var toastEl = null, toastTimer = 0, toastAnim = null;
  function toastText(text) {
    var stage = document.getElementById('pmuStage');
    if (!stage || !document.body.classList.contains('pmu-page-active')) { if (typeof window.toast === 'function') window.toast(text); return; }
    if (!toastEl || !toastEl.isConnected) {
      toastEl = document.createElement('div');
      toastEl.className = 'pmu-toast'; toastEl.id = 'pmuToast'; toastEl.setAttribute('role', 'status');
      toastEl.innerHTML = '<span class="pmu-toast-ico" aria-hidden="true">' + PMU.icon('check') + '</span><span class="pmu-toast-text"></span>';
      stage.appendChild(toastEl);
    }
    toastEl.querySelector('.pmu-toast-text').textContent = String(text);
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    if (toastAnim) { toastAnim.cancel(); toastAnim = null; }
    var sp = PMU.motion.speed(), calm = PMU.motion.reduced();
    if (!calm && toastEl.animate) toastEl.animate([{ opacity: 0, transform: 'translate(-50%, 10px) scale(.96)' }, { opacity: 1, transform: 'translate(-50%, 0) scale(1)' }],
      { duration: 260 * sp, easing: 'cubic-bezier(.22,1.3,.36,1)' });
    toastTimer = setTimeout(function () {
      var done = function () { if (toastEl) toastEl.hidden = true; toastAnim = null; };
      if (calm || !toastEl.animate) { done(); return; }
      toastAnim = toastEl.animate([{ opacity: 1, transform: 'translate(-50%, 0)' }, { opacity: 0, transform: 'translate(-50%, 6px)' }], { duration: 200 * sp, easing: 'ease-in', fill: 'forwards' });
      toastAnim.onfinish = function () { done(); if (toastEl) toastEl.getAnimations().forEach(function (a) { a.cancel(); }); };
    }, 2600);
  }

  if (app) {
    app.addEventListener('click', function (event) {
      var target = event.target;
      var range = target.closest('.pmu-range button[data-range]');
      if (range) { setView({ range: range.getAttribute('data-range') }, 'range'); return; }
      var b;
      if ((b = target.closest('#pmuScopeBtn'))) { scopeMenu(b); return; }
      if ((b = target.closest('#pmuRangeBtn'))) { rangeMenu(b); return; }
      if ((b = target.closest('#pmuDetailBtn'))) { detailMenu(b); return; }
      if ((b = target.closest('#pmuCustomize')) && PMU.board) { PMU.menu.toggle(b, panelsSpec()); return; }
      if (target.closest('#pmuRefresh') && window.PM7_USAGE) { window.PM7_USAGE.refresh(); return; }
      if ((b = target.closest('#pmuExport'))) { exportMenu(b); return; }
    });
    /* the range strip: arrows move the choice (a segmented control) */
    var rangeEl = document.getElementById('pmuRange');
    if (rangeEl) rangeEl.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      var keys = RANGES.map(function (r) { return r[0]; }), i = keys.indexOf(st.range);
      var next = keys[Math.max(0, Math.min(keys.length - 1, i + (event.key === 'ArrowRight' ? 1 : -1)))];
      event.preventDefault(); setView({ range: next }, 'range');
      var btn = rangeEl.querySelector('button[data-range="' + next + '"]'); if (btn) btn.focus();
    });
    if (window.ResizeObserver) { var head = app.querySelector('.pmu-headctl'); if (head) new ResizeObserver(function () { syncSegInk(document.getElementById('pmuRange'), true); }).observe(head); }
  }

  /* the app's title-bar notices (#rsStage, final fix M2): while Usage shows they sit at the bottom right of the Usage stage,
     anchored by their bottom edge 18 px above the stage's (the status bar sits below it), so a notice never covers the
     board's first row (the KPI tiles at the top right); they still take no pointer and still join the inbox as before.
     Their own place (under the title-bar bell) moves with the title bar, so it is read again whenever a notice arrives or
     leaves (in the observer's microtask, before the frame paints) and when the stage resizes; the y offset subtracts
     100 % of the stack's height, so the stack grows upward from its bottom edge */
  var noticeRaf = 0;
  function placeNotices() {
    noticeRaf = 0;
    var rs = document.getElementById('rsStage'), stage = document.getElementById('pmuStage');
    if (!rs || !stage || !rs.firstElementChild || !document.body.classList.contains('pmu-page-active')) return;
    var sr = stage.getBoundingClientRect();
    if (!sr.width || !sr.height) return;
    rs.style.translate = 'none';
    var r = rs.getBoundingClientRect(), right = 0;
    for (var c = rs.firstElementChild; c; c = c.nextElementSibling) right = Math.max(right, c.getBoundingClientRect().right);
    rs.style.translate = '';
    rs.style.setProperty('--pmu-rs-x', Math.round(sr.right - 18 - (right || r.right)) + 'px');
    rs.style.setProperty('--pmu-rs-y', 'calc(' + Math.round(sr.bottom - 18 - r.top) + 'px - 100%)');
  }
  function queueNotices() { if (!noticeRaf) noticeRaf = requestAnimationFrame(placeNotices); }
  var rsEl = document.getElementById('rsStage');
  if (rsEl && window.MutationObserver) new MutationObserver(placeNotices).observe(rsEl, { childList: true });
  if (window.ResizeObserver) { var stageEl = document.getElementById('pmuStage'); if (stageEl) new ResizeObserver(queueNotices).observe(stageEl); }
  window.addEventListener('resize', queueNotices);

  PMU.shell = { render: render, setView: setView, fitDesc: fitDesc, pop: pop, closePop: closePop, toast: toastText, syncInk: syncInk, syncSegInk: syncSegInk, placeNotices: queueNotices,
    scopeLabel: scopeLabel, providerName: providerName, counts: counts, menus: { scope: scopeMenu, range: rangeMenu, detail: detailMenu, panels: panelsSpec, export: exportMenu } };
})();
