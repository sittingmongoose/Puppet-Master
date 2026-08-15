/* ============================================================================
   Kimi K3 — shared transcript engine (window.K3ThreadKit).

   Behavior-complete, presentation-neutral message renderer used by ALL 8
   thread concepts. A concept calls:

     var inst = window.K3ThreadKit.mount(hostEl, ctx, opts);
     inst.unmount(); inst.reveal(msgId); inst.scrollToLatest(); inst.refresh();

   opts = {
     groupBy:      'none' | 'turn' | 'chapter',  // transcript grouping
     workMode:     'inline' | 'chip',            // payload cards vs one work chip
     measure:      'full' | 'reading',           // 'reading' caps body at 68ch
     density:      'roomy' | 'compact',
     showStageRail: bool,                        // stage-dot rail above activity
     extraClass:   ''                            // extra class(es) on the root
   }

   Canonical data is never mutated: edits, expansion, lens display state, and
   scroll anchors all live in the K3Store semantic slice so they survive
   remount and simulated restart.
   ========================================================================== */
(function () {
  'use strict';

  var CHUNK = 50;               // history paging chunk
  var BOTTOM_STICK_PX = 80;     // auto-scroll stick threshold
  var JUMP_PILL_PX = 300;       // jump-to-latest pill threshold
  var COLLAPSE_CHARS = 700;     // long-message collapse threshold
  var CHAPTER_SIZE = 20;        // chapter grouping size
  var STREAM_BATCH_MS = 40;     // reply streaming batch cadence
  var STREAM_TOKENS = 6;        // tokens appended per batch
  var FLASH_MS = 1600;          // reveal flash duration
  var ANCHOR_SAVE_MS = 300;     // scroll-anchor save throttle

  var STAGE_ICONS = {
    thought: 'thought', exploration: 'search', import: 'attach',
    edit: 'edit', asset: 'artifact', completion: 'check',
    // canonical trigger-contract kinds (correction 2026-08-13)
    thinking_summary: 'thought', read: 'read', fetch: 'fetch',
    browser: 'browser', test: 'test', generate: 'generate', search: 'search',
    web: 'fetch'
  };
  var STATUS_LABELS = {
    queued: 'Queued', running: 'Running', working: 'Working',
    awaiting_parent: 'Waiting for parent', 'waiting for parent': 'Waiting for parent',
    waiting: 'Waiting', blocked: 'Blocked', complete: 'Complete', completed: 'Complete',
    failed: 'Failed', cancelled: 'Cancelled', canceled: 'Cancelled',
    paused: 'Paused', submitted: 'Submitted', active: 'Active', edited: 'Modified'
  };
  var DIFF_STATUS = {
    edited: 'Modified', modified: 'Modified', created: 'Created', added: 'Created',
    deleted: 'Deleted', removed: 'Deleted'
  };

  // ---------- small helpers --------------------------------------------------
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function icon(name) { return window.K3Icons.get(name); }
  function iconSpan(name, cls) { var s = el('span', cls || 'k3t-ic'); s.appendChild(icon(name)); return s; }
  function clampNum(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function num(v, d) { return (typeof v === 'number' && isFinite(v)) ? v : d; }
  function reducedMotion() { return !!(window.K3 && window.K3.motionReduced && window.K3.motionReduced()); }
  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }
  function titleCase(s) { s = String(s || ''); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function fmtDur(sec) {
    sec = Math.max(0, Math.round(Number(sec) || 0));
    if (sec < 60) return sec + 's';
    if (sec < 3600) { var m = Math.floor(sec / 60), r = sec % 60; return r ? m + 'm ' + r + 's' : m + 'm'; }
    var h = Math.floor(sec / 3600), mm = Math.floor((sec % 3600) / 60);
    return mm ? h + 'h ' + mm + 'm' : h + 'h';
  }
  function fmtClock(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso || '');
    return d.toLocaleString();
  }
  function humanStatus(s) {
    var k = String(s || '').toLowerCase();
    return STATUS_LABELS[k] || titleCase(k.replace(/_/g, ' '));
  }
  function diffStatus(s) {
    var k = String(s || '').toLowerCase();
    return DIFF_STATUS[k] || titleCase(k.replace(/_/g, ' '));
  }
  function firstWords(body, n) {
    var w = String(body || '').trim().split(/\s+/).filter(Boolean);
    if (!w.length) return 'message';
    var s = w.slice(0, n).join(' ');
    return w.length > n ? s + ' …' : s;
  }
  function fillParagraphs(bodyEl, text) {
    bodyEl.innerHTML = '';
    String(text == null ? '' : text).split(/\n\s*\n/).forEach(function (para) {
      var t = para.replace(/\s*\n\s*/g, ' ').trim();
      if (t) bodyEl.appendChild(el('p', null, t));
    });
  }

  // ---------- mount ----------------------------------------------------------
  function mount(hostEl, ctx, opts) {
    opts = Object.assign({
      groupBy: 'none', workMode: 'inline', measure: 'full',
      density: 'roomy', showStageRail: false, extraClass: ''
    }, opts || {});

    var store = ctx.store;
    var data = ctx.data;
    function ui() { return ctx.ui || window.K3UI; }

    var unmounted = false;
    var disposers = [];
    var timers = [];
    var observer = null;
    var anchorTimer = null;
    var rebuildTimer = null;
    var rebuildPreserve = false;

    var tid = null;
    var renderFrom = 0;
    var atBottom = true;
    var paging = false;
    var streams = {};      // messageId -> {iv, bodyEl}
    var rehydrated = {};   // subcompact group index -> true
    var live = null;       // {el, actionEl, timerEl}
    var liveTick = null;
    var lastFtAt = -1;
    var curTurnBody = null;

    // ---------- root DOM ----------
    var root = el('div', 'k3t-root k3t-group-' + opts.groupBy + ' k3t-work-' + opts.workMode +
      ' k3t-measure-' + opts.measure + ' k3t-density-' + opts.density);
    if (opts.extraClass) {
      String(opts.extraClass).split(/\s+/).forEach(function (c) { if (c) root.classList.add(c); });
    }
    var scroller = el('div', 'k3t-scroll k3-scroll k3-scroll-chat');
    scroller.setAttribute('data-testid', 'k3t-scroll');
    var top = el('div', 'k3t-top');
    var sentinel = el('div', 'k3t-sentinel');
    sentinel.setAttribute('aria-hidden', 'true');
    var chaptersEl = el('div', 'k3t-chapters');
    top.appendChild(sentinel);
    top.appendChild(chaptersEl);
    var list = el('div', 'k3t-list');
    var endzone = el('div', 'k3t-endzone');
    scroller.appendChild(top);
    scroller.appendChild(list);
    scroller.appendChild(endzone);
    var jumpBtn = el('button', 'k3t-jump-latest');
    jumpBtn.type = 'button';
    jumpBtn.setAttribute('data-testid', 'k3t-jump-latest');
    jumpBtn.appendChild(icon('jump-latest'));
    jumpBtn.appendChild(el('span', null, 'Jump to latest'));
    root.appendChild(scroller);
    root.appendChild(jumpBtn);
    hostEl.appendChild(root);

    // ---------- data helpers ----------
    function resolveActiveTid() {
      var at = store.get('activeThreadId', null);
      if (at && data.thread(at)) return at;
      var ts = data.listThreads();
      return ts.length ? ts[0].id : null;
    }
    function msgs() { return tid ? data.messages(tid) : []; }
    function indexOfMsg(list2, id) {
      for (var i = 0; i < list2.length; i++) if (list2[i].id === id) return i;
      return -1;
    }
    function findArticle(mid) { return list.querySelector('.k3t-msg[data-mid="' + mid + '"]'); }
    function displayBody(m) {
      var edited = store.get('editedMessages.' + m.id, null);
      return (typeof edited === 'string') ? edited : String(m.body || '');
    }
    function lastUserMsgId() {
      var ms = msgs();
      for (var i = ms.length - 1; i >= 0; i--) if (ms[i].role === 'user') return ms[i].id;
      return null;
    }
    function workingSeconds() {
      var ws = tid && data.workingState(tid);
      return ws ? ws.workedSeconds() : 0;
    }
    function isTurnActive(m) {
      return !!(streams[m.id] || (tid && data.isActive(tid) && m.id === lastUserMsgId()));
    }
    function collapseInfo(m) {
      var body = displayBody(m);
      var eligible = m.collapsedByDefault === true || body.length > COLLAPSE_CHARS;
      if (!eligible) return { eligible: false, collapsed: false };
      if (isTurnActive(m)) return { eligible: true, collapsed: false }; // never collapse an active turn
      if (store.get('expandedMessages.' + m.id, false) === true) return { eligible: true, collapsed: false };
      if (store.get('collapsedMessages.' + m.id, false) === true) return { eligible: true, collapsed: true };
      return { eligible: true, collapsed: m.collapsedByDefault === true };
    }
    function currentSelection() {
      var lens = data.lensState(tid);
      var sel = {};
      (lens.selectedIds || []).forEach(function (id) { sel[id] = true; });
      return {
        selecting: store.get('lens.' + tid + '.selecting', false) === true,
        selected: sel,
        mode: lens.mode
      };
    }
    function turnNumberAt(ms, idx) {
      var n = 0;
      for (var i = 0; i <= idx && i < ms.length; i++) if (ms[i].role === 'user') n++;
      return n;
    }

    // The runtime of the assistant reply a user message launched (when the
    // user message's own runtime is an empty template, e.g. after send()).
    function launchedTurnRuntime(m) {
      var ms = msgs();
      var idx = indexOfMsg(ms, m.id);
      if (idx < 0) return null;
      for (var i = idx + 1; i < ms.length; i++) {
        if (ms[i].role === 'user') break;
        if (ms[i].role === 'assistant' && ms[i].runtime) return ms[i].runtime;
      }
      return null;
    }
    // Runtime the hover row / More Info should describe: for user messages the
    // launched turn's, when their own is a zeroed template.
    function displayRuntime(m) {
      var rt = m.runtime || {};
      if (m.role === 'user' && !(rt.workedSeconds > 0)) {
        var turn = launchedTurnRuntime(m);
        if (turn) return Object.assign({}, rt, turn);
      }
      return rt;
    }

    function metaLineFor(m, workingNow) {
      var rt = displayRuntime(m);
      var parts = [];
      if (rt.provider) parts.push(rt.provider);
      if (rt.model) parts.push(rt.model);
      if (workingNow) parts.push('Working for ' + fmtDur(workingSeconds()));
      else if (typeof rt.workedSeconds === 'number') parts.push('Worked for ' + fmtDur(rt.workedSeconds));
      return parts.join(' · ');
    }

    // ---------- generic builders ----------
    function ghostBtn(iconName, label, onClick) {
      var b = el('button', 'k3t-ghost');
      b.type = 'button';
      b.appendChild(iconSpan(iconName, 'k3t-ghost-ic'));
      b.appendChild(el('span', 'k3t-ghost-label', label));
      b.addEventListener('click', function (e) { e.stopPropagation(); onClick(); });
      return b;
    }
    function accordion(o) {
      var acc = el('div', 'k3-acc');
      var accIn = el('div', 'k3-acc-in');
      acc.appendChild(accIn);
      var head = el('button', 'k3t-rowhead');
      head.type = 'button';
      head.appendChild(iconSpan(o.icon));
      head.appendChild(el('span', 'k3t-rowhead-title', o.title));
      if (o.headExtras) o.headExtras.forEach(function (n) { head.appendChild(n); });
      if (o.note) head.appendChild(el('span', 'k3t-note', o.note));
      if (o.meta) head.appendChild(el('span', 'k3t-rowhead-meta', o.meta));
      var chev = el('span', 'k3t-chev');
      chev.appendChild(icon('chevron-down'));
      head.appendChild(chev);
      var open = false;
      function setOpen(v, fromUser) {
        open = !!v;
        acc.classList.toggle('is-open', open);
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (fromUser && o.onChange) o.onChange(open);
      }
      head.addEventListener('click', function () { setOpen(!open, true); });
      setOpen(o.open, false);
      return { head: head, acc: acc, accIn: accIn, setOpen: setOpen };
    }
    function statusChip(s) {
      var k = String(s || '').toLowerCase();
      var cls = 'k3t-status';
      if (k === 'blocked' || k === 'failed') cls += ' is-error';
      else if (k === 'running' || k === 'working' || k === 'retrying') cls += ' is-live';
      else if (k !== 'complete' && k !== 'completed') cls += ' is-quiet';
      return el('span', cls, humanStatus(s));
    }
    function flashEl(node) {
      node.classList.remove('k3-anim-flash');
      void node.offsetWidth;
      node.classList.add('k3-anim-flash');
      timers.push(setTimeout(function () { node.classList.remove('k3-anim-flash'); }, FLASH_MS));
    }

    // ---------- message hover row ----------
    function buildHover(article, m, ci) {
      var hover = el('div', 'k3t-msg-hover');
      var actions = el('div', 'k3t-hover-actions');

      var copyBtn = ghostBtn('copy', 'Copy', function () { doCopy(displayBody(m), copyBtn); });
      copyBtn.setAttribute('data-testid', 'k3t-copy');
      actions.appendChild(copyBtn);

      if (m.eligibleForEdit === true) {
        var editBtn = ghostBtn('edit', 'Edit', function () { startEdit(article, m); });
        editBtn.setAttribute('data-testid', 'k3t-edit');
        actions.appendChild(editBtn);
      }

      if (ci.eligible) {
        var xBtn = ghostBtn(ci.collapsed ? 'expand' : 'collapse', ci.collapsed ? 'Show more' : 'Show less',
          function () { toggleCollapse(article, m); });
        xBtn.setAttribute('data-testid', 'k3t-expand');
        actions.appendChild(xBtn);
      }
      hover.appendChild(actions);

      var meta = el('div', 'k3t-hover-meta');
      if (store.get('editedMessages.' + m.id, null) != null) meta.appendChild(el('span', 'k3t-edited-tag', 'Edited'));
      var active = isTurnActive(m);
      var mt = el('span', 'k3t-meta-text', metaLineFor(m, active));
      if (active) mt.setAttribute('data-k3t-working-meta', '1');
      meta.appendChild(mt);
      var infoBtn = ghostBtn('info', 'More Info', function () { openMoreMenu(infoBtn, m); });
      infoBtn.setAttribute('data-testid', 'k3t-more-info');
      meta.appendChild(infoBtn);
      hover.appendChild(meta);
      return hover;
    }

    // Packet hover menu: copy/info plus branch/restore/rewind thread ops.
    function openMoreMenu(anchor, m) {
      function copyLink() {
        var link = tid + '#' + m.id;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(link);
        }
      }
      function okRoutes() {
        var out = [];
        (data.providerCatalog() || []).forEach(function (p) {
          (p.accounts || []).forEach(function (a) {
            (p.models || []).forEach(function (mm) {
              var r = data.routeByKey(p.id + '/' + a.id + '/' + mm.id);
              if (r && r.status === 'ok') out.push(r);
            });
          });
        });
        return out.slice(0, 4);
      }
      var personas = (window.K3WindowKit && window.K3WindowKit.PERSONAS) || [];
      var items = [
        { label: 'Copy', icon: 'copy', action: function () { doCopy(displayBody(m), anchor); } },
        {
          label: 'More Info', icon: 'info',
          action: function () { setTimeout(function () { openInfo(anchor, m); }, 0); }
        },
        { type: 'separator' },
        {
          label: 'Branch from here', icon: 'branch',
          action: function () { if (window.K3ThreadOps) window.K3ThreadOps.branchFrom(tid, m.id, {}); }
        },
        {
          label: 'Branch with another model…', icon: 'model',
          submenu: okRoutes().map(function (r) {
            return {
              label: r.providerName + ' · ' + r.modelShort,
              action: function () { if (window.K3ThreadOps) window.K3ThreadOps.branchFrom(tid, m.id, { model: r.key }); }
            };
          })
        },
        {
          label: 'Branch with another Persona…', icon: 'persona',
          submenu: personas.map(function (p) {
            return {
              label: p,
              action: function () { if (window.K3ThreadOps) window.K3ThreadOps.branchFrom(tid, m.id, { persona: p }); }
            };
          })
        },
        {
          label: 'Create restore point', icon: 'restore',
          action: function () {
            if (window.K3ThreadOps) window.K3ThreadOps.createRestorePoint(tid, 'Before ' + firstWords(displayBody(m), 5));
          }
        },
        {
          label: 'Rewind to here', icon: 'rewind', danger: true,
          action: function () {
            ui().confirm({
              title: 'Rewind to here?',
              body: 'Later messages collapse into a restorable region. Nothing is deleted — a restore point is created first.',
              confirmLabel: 'Rewind to here',
              danger: true
            }).then(function (ok) {
              if (ok && window.K3ThreadOps) window.K3ThreadOps.rewindTo(tid, m.id);
            });
          }
        },
        { type: 'separator' },
        { label: 'Copy link', icon: 'export', action: copyLink }
      ];
      ui().menu(anchor, items, { width: 240 });
    }

    function doCopy(text, btn) {
      function done() {
        var lbl = btn.querySelector('.k3t-ghost-label');
        if (!lbl) return;
        lbl.textContent = 'Copied';
        timers.push(setTimeout(function () { lbl.textContent = 'Copy'; }, 1200));
      }
      function fallback() {
        var ta = el('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { /* best effort */ }
        ta.remove();
        done();
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else fallback();
    }

    function openInfo(anchor, m) {
      var rt = displayRuntime(m);
      var box = el('div', 'k3t-info');
      function row(k, v, mono) {
        if (v == null || v === '') return;
        var r = el('div', 'k3-kv');
        r.appendChild(el('span', 'k3-kv-k', k));
        var vv = el('span', 'k3-kv-v', v);
        if (mono) vv.classList.add('k3t-mono');
        r.appendChild(vv);
        box.appendChild(r);
      }
      var sent = m.sentAt ? new Date(m.sentAt).getTime() : NaN;
      var worked = num(rt.workedSeconds, 0);
      var total = num(rt.totalElapsedSeconds, worked);
      if (!isNaN(sent)) {
        row('Sent', fmtClock(m.sentAt));
        row('Execution started', fmtClock(new Date(sent + Math.max(0, total - worked) * 1000).toISOString()));
        row('Completed', fmtClock(new Date(sent + total * 1000).toISOString()));
      }
      if (m.runtime) row('Worked for', fmtDur(worked));
      if (m.runtime && Math.round(total) !== Math.round(worked)) row('Total elapsed', fmtDur(total));
      row('Mode', rt.mode);
      row('Provider', rt.provider);
      row('Model', rt.model);
      row('Effort', rt.effort);
      row('Persona', rt.persona);
      if (typeof rt.tokenCount === 'number') row('Tokens', rt.tokenCount.toLocaleString());
      if (typeof rt.contextUsed === 'number' && typeof rt.contextLimit === 'number' && rt.contextLimit > 0) {
        row('Context', rt.contextUsed.toLocaleString() + ' / ' + rt.contextLimit.toLocaleString() +
          ' (' + Math.round((rt.contextUsed / rt.contextLimit) * 100) + '%)');
      }
      if (typeof rt.estimatedCost === 'number') row('Est. cost', '$' + rt.estimatedCost.toFixed(2));
      row('Turn id', m.id, true);
      ui().popover(anchor, box, { className: 'k3t-info-pop' });
    }

    function startEdit(article, m) {
      if (article.classList.contains('is-editing')) return;
      article.classList.add('is-editing');
      var bodyEl = article.querySelector('.k3t-msg-body');
      bodyEl.classList.remove('is-clamped');
      bodyEl.innerHTML = '';
      var current = displayBody(m);
      var ta = el('textarea', 'k3-input k3t-edit-area');
      ta.value = current;
      ta.rows = clampNum(current.split('\n').length + 1, 3, 14);
      var row = el('div', 'k3t-edit-actions');
      var save = el('button', 'k3-btn', 'Save');
      save.type = 'button';
      var cancel = el('button', 'k3-btn k3-btn-ghost', 'Cancel');
      cancel.type = 'button';
      row.appendChild(save);
      row.appendChild(cancel);
      bodyEl.appendChild(ta);
      bodyEl.appendChild(row);
      ta.focus();
      save.addEventListener('click', function () {
        store.set('editedMessages.' + m.id, ta.value);
        replaceArticleInPlace(m);
      });
      cancel.addEventListener('click', function () { replaceArticleInPlace(m); });
    }

    function replaceArticleInPlace(m) {
      var old = findArticle(m.id);
      if (!old) return;
      var topBefore = old.getBoundingClientRect().top;
      var fresh = buildArticle(m, indexOfMsg(msgs(), m.id), currentSelection());
      old.replaceWith(fresh);
      scroller.scrollTop += fresh.getBoundingClientRect().top - topBefore;
    }

    function toggleCollapse(article, m) {
      var ci = collapseInfo(m);
      var topBefore = article.getBoundingClientRect().top;
      if (ci.collapsed) {
        store.set('expandedMessages.' + m.id, true);
        store.set('collapsedMessages.' + m.id, null);
      } else {
        store.set('collapsedMessages.' + m.id, true);
        store.set('expandedMessages.' + m.id, null);
      }
      var bodyEl = article.querySelector('.k3t-msg-body');
      bodyEl.classList.toggle('is-clamped', !ci.collapsed);
      var xBtn = article.querySelector('[data-testid="k3t-expand"]');
      if (xBtn) {
        var svg = xBtn.querySelector('svg');
        if (svg) svg.replaceWith(icon(ci.collapsed ? 'collapse' : 'expand'));
        var lbl = xBtn.querySelector('.k3t-ghost-label');
        if (lbl) lbl.textContent = ci.collapsed ? 'Show less' : 'Show more';
      }
      // keep the message anchored in the viewport (same frame)
      scroller.scrollTop += article.getBoundingClientRect().top - topBefore;
    }

    function onLensCheck(article, m) {
      var res = data.toggleSelect(tid, m.id);
      if (res && res.error === 'limit') { flashEl(article); return; }
      var selected = data.lensState(tid).selectedIds.indexOf(m.id) >= 0;
      article.classList.toggle('is-selected', selected);
      var mode = store.get('lens.' + tid + '.mode', null);
      if (mode === 'mute' || mode === 'focus') data.applyLens(tid, mode); // immediate-apply contract
    }

    // ---------- message payloads ----------
    function stageRow(st) {
      var row = el('div', 'k3t-stage');
      row.appendChild(iconSpan(STAGE_ICONS[st.kind] || 'dot', 'k3t-stage-ic'));
      row.appendChild(el('span', 'k3t-stage-label', st.label || titleCase(st.kind || 'stage')));
      if (typeof st.durationSeconds === 'number') row.appendChild(el('span', 'k3t-stage-dur', fmtDur(st.durationSeconds)));
      if (st.status) row.appendChild(el('span', 'k3t-stage-status', humanStatus(st.status)));
      var sum = st.summary;
      if (!sum && typeof st.count === 'number') sum = plural(st.count, 'item');
      if (!sum && Array.isArray(st.items)) sum = plural(st.items.length, 'item');
      if (sum) row.appendChild(el('span', 'k3t-stage-summary', sum));
      return row;
    }
    // Video-C accumulating cluster: one icon per DISTINCT tool kind, in
    // first-appearance order — the cluster grows as work touches new kinds.
    function kindCluster(ag) {
      var seen = [];
      (ag.stages || []).forEach(function (st) {
        var k = st.kind || 'stage';
        if (seen.indexOf(k) < 0) seen.push(k);
      });
      if (!seen.length) return null;
      var c = el('span', 'k3t-kindcluster');
      c.setAttribute('data-testid', 'k3t-kindcluster');
      seen.forEach(function (k) {
        var s = el('span', 'k3t-kindcluster-ic');
        s.title = titleCase(k.replace(/_/g, ' '));
        s.appendChild(icon(STAGE_ICONS[k] || 'dot'));
        c.appendChild(s);
      });
      return c;
    }
    function activityCard(ag) {
      var card = el('div', 'k3t-card k3t-activity');
      card.setAttribute('data-testid', 'k3t-activity');
      var cluster = kindCluster(ag);
      var a = accordion({
        icon: 'activity',
        title: ag.compactLabel || 'Work summary',
        headExtras: cluster ? [cluster] : null,
        meta: 'Worked for ' + fmtDur(ag.workedSeconds || 0),
        open: false
      });
      var stages = el('div', 'k3t-stages k3-stagger');
      (ag.stages || []).forEach(function (st, si) {
        var sr = stageRow(st);
        sr.style.setProperty('--k3-i', si);
        if (String(st.status || '').toLowerCase() === 'complete') sr.classList.add('is-complete-stage');
        stages.appendChild(sr);
      });
      a.accIn.appendChild(stages);
      card.appendChild(a.head);
      card.appendChild(a.acc);
      return card;
    }
    function stageRail(ag) {
      var rail = el('div', 'k3t-stage-rail');
      (ag.stages || []).forEach(function (st) {
        var it = el('span', 'k3t-stage-rail-item' + (st.status === 'complete' ? ' is-complete' : ''));
        it.title = (st.label || titleCase(st.kind || 'stage')) + (st.status ? ' — ' + humanStatus(st.status) : '');
        it.appendChild(icon(STAGE_ICONS[st.kind] || 'dot'));
        rail.appendChild(it);
      });
      return rail;
    }
    function thoughtExpandedState(seg) {
      var manual = store.get('thoughtExpanded.' + seg.id, null);
      if (seg.status === 'active') {
        if (store.get('thoughtPref.keepActiveExpanded', false) === true) return true;
        if (manual != null) return manual === true;
        return seg.collapsed === false;
      }
      if (manual != null) return manual === true;
      return seg.collapsed === false;
    }
    function thoughtCard(seg) {
      var card = el('div', 'k3t-card k3t-thought');
      card.setAttribute('data-testid', 'k3t-thought');
      var a = accordion({
        icon: 'thought',
        title: seg.label || 'Reasoning',
        note: 'Provider-exposed reasoning summary',
        open: thoughtExpandedState(seg),
        onChange: function (open) {
          // manual expansion persists for completed segments only; an active
          // segment reverts to its default once it completes.
          if (seg.status !== 'active') store.set('thoughtExpanded.' + seg.id, open);
        }
      });
      var body = el('div', 'k3t-thought-body');
      fillParagraphs(body, seg.summary || '');
      a.accIn.appendChild(body);
      card.appendChild(a.head);
      card.appendChild(a.acc);
      return card;
    }
    function qaList(cq) {
      if (Array.isArray(cq.questionsAndAnswers)) {
        return cq.questionsAndAnswers.map(function (qa) {
          return { q: qa.question, a: qa.answer };
        });
      }
      return (cq.questions || []).map(function (qq) {
        var a;
        if (qq.skipped) a = 'Skipped';
        else if (qq.kind === 'freeform') a = (typeof qq.draft === 'string' && qq.draft.trim()) ? qq.draft : 'No answer';
        else a = (Array.isArray(qq.selected) && qq.selected.length) ? qq.selected.join(', ') : 'No answer';
        return { q: qq.prompt || qq.id, a: a };
      });
    }
    function qhistoryCard(cq) {
      var card = el('div', 'k3t-card k3t-qhistory');
      card.setAttribute('data-testid', 'k3t-qhistory');
      var a = accordion({
        icon: 'question',
        title: 'Questionnaire — ' + humanStatus(cq.status || 'submitted'),
        open: false
      });
      card.appendChild(a.head);
      if (cq.summary) card.appendChild(el('div', 'k3t-qhistory-summary', cq.summary));
      var qa = el('div', 'k3t-qa-list');
      qaList(cq).forEach(function (pair) {
        var row = el('div', 'k3t-qa');
        row.appendChild(el('div', 'k3t-qa-q', pair.q));
        row.appendChild(el('div', 'k3t-qa-a', pair.a));
        qa.appendChild(row);
      });
      a.accIn.appendChild(qa);
      card.appendChild(a.acc);
      return card;
    }
    // ---------- packet card family (final cumulative update) ----------
    // One shared k3t-card family; per-thread CSS differentiates (t1..t8).
    // Every kind renders in BOTH workMode 'inline' (full card) and 'chip'
    // (compact row that expands to the full card in place).
    var BSD_RESULT_LABELS = {
      silent: 'BSD checked — no advice',
      duplicate: 'BSD suppressed a duplicate',
      timeout: 'BSD timed out — the turn was unaffected',
      unavailable: 'BSD unavailable — the turn was unaffected',
      quota: 'BSD quota limited'
    };

    var PACKET_FIELDS = ['approvalCard', 'routeWarningCard', 'attachmentCard', 'bsdAdviceCard',
      'bsdResult', 'receiptCard', 'threadRequestCard', 'restorePointCard', 'branchCard',
      'redirectMarker', 'crossProjectCard', 'rewoundMarker', 'marker'];
    function packetKinds(m) {
      var kinds = [];
      PACKET_FIELDS.forEach(function (k) { if (m[k]) kinds.push(k); });
      return kinds;
    }

    function routeWarningEl(rec) {
      var card = el('div', 'k3t-card k3t-routewarn');
      card.setAttribute('data-testid', 'k3t-routewarn');
      var head = el('div', 'k3t-rowhead');
      head.appendChild(iconSpan('warning', 'k3t-ic'));
      head.appendChild(el('span', 'k3t-rowhead-title', rec.headline || 'Route warning'));
      card.appendChild(head);
      if (rec.fromLabel || rec.toLabel) {
        card.appendChild(el('div', 'k3t-routewarn-routes',
          (rec.fromLabel || '?') + '  →  ' + (rec.toLabel || '?')));
      }
      if (rec.status && rec.status !== 'open') {
        card.appendChild(el('div', 'k3t-footnote', 'Resolved: ' + rec.status + '.'));
        return card;
      }
      // first view = single most important consequence
      card.appendChild(el('div', 'k3t-routewarn-primary', rec.primary || ''));
      var row = el('div', 'k3t-card-actions');
      [['continue', 'Continue here'], ['branch', 'Branch with new model'],
       ['new', 'Start new chat'], ['cancel', 'Cancel']].forEach(function (c) {
        var b = el('button', 'k3-btn ' + (c[0] === 'cancel' ? 'k3-btn-ghost ' : '') + 'k3w-kit-mini', c[1]);
        b.type = 'button';
        b.setAttribute('data-testid', 'k3t-routewarn-' + c[0]);
        b.addEventListener('click', function () {
          if (window.K3Route) window.K3Route.resolveWarning(ctx, tid, rec.id, c[0]);
        });
        row.appendChild(b);
      });
      var det = el('button', 'k3-btn k3-btn-ghost k3w-kit-mini', 'Details');
      det.type = 'button';
      det.addEventListener('click', function () {
        var box = el('div', 'k3t-routewarn-details');
        (rec.consequences || []).forEach(function (c) {
          var r = el('div', 'k3-kv');
          r.appendChild(el('span', 'k3-kv-k', titleCase(c.kind || 'note')));
          r.appendChild(el('span', 'k3-kv-v', c.text || ''));
          box.appendChild(r);
        });
        ui().popover(det, box, { className: 'k3t-details-pop k3-scroll' });
      });
      row.appendChild(det);
      card.appendChild(row);
      return card;
    }

    function attachmentCardEl(rec) {
      var card = el('div', 'k3t-card k3t-attach');
      card.setAttribute('data-testid', 'k3t-attach');
      var head = el('div', 'k3t-rowhead');
      var kindIcon = 'paperclip-' + (rec.file && rec.file.kind === 'video' ? 'mov' :
        rec.file && rec.file.kind === 'archive' ? 'zip' :
        rec.file && rec.file.kind === 'document' ? 'pdf' :
        rec.file && rec.file.kind === 'spreadsheet' ? 'xlsx' :
        rec.file && rec.file.kind === 'image' ? 'png' : 'bin');
      if (!window.K3Icons.has(kindIcon)) kindIcon = 'attach';
      head.appendChild(iconSpan(kindIcon, 'k3t-ic'));
      head.appendChild(el('span', 'k3t-rowhead-title',
        (rec.file ? rec.file.name : 'Attachment') + (rec.file && rec.file.size ? ' · ' + rec.file.size : '')));
      card.appendChild(head);
      if (rec.state === 'consent') {
        card.appendChild(el('div', 'k3t-attach-reason', rec.reason || 'This model cannot read this file.'));
        card.appendChild(el('div', 'k3t-footnote',
          'Routing to another provider changes privacy, account, cost, terms, or location — confirmation required.'));
        var row = el('div', 'k3t-card-actions');
        [['cancel', 'Cancel'], ['extract', 'Extract in PM'], ['alternate', rec.alternateLabel || 'Use another model']].forEach(function (c) {
          var b = el('button', 'k3-btn ' + (c[0] === 'cancel' ? 'k3-btn-ghost ' : '') + 'k3w-kit-mini', c[1]);
          b.type = 'button';
          b.setAttribute('data-testid', 'k3t-attach-' + c[0]);
          b.addEventListener('click', function () {
            if (window.K3Attachments) window.K3Attachments.resolveChoice(ctx, tid, rec.id, c[0]);
          });
          row.appendChild(b);
        });
        card.appendChild(row);
      } else if (rec.state === 'resolved-transform' || rec.state === 'resolved-alternate') {
        card.appendChild(el('div', 'k3t-attach-reason',
          rec.state === 'resolved-alternate' ? 'Read by the alternate model.' : 'Transformed in PM.'));
        var list = el('div', 'k3t-attach-derived');
        (rec.derived || []).forEach(function (d) {
          list.appendChild(el('span', 'k3-chip k3t-attach-chip', d.label || d.kind));
        });
        card.appendChild(list);
        if (rec.lineage && rec.lineage.length) {
          card.appendChild(el('div', 'k3t-footnote', 'Derived from ' + rec.lineage.join(', ') + ' — lineage preserved.'));
        }
      } else if (rec.state === 'resolved-native') {
        card.appendChild(el('div', 'k3t-attach-reason', 'Read natively by this model.'));
      } else if (rec.state === 'unsupported') {
        card.appendChild(el('div', 'k3t-attach-reason', rec.reason || 'Unsupported on this route.'));
      } else if (rec.state === 'cancelled' || rec.state === 'removed') {
        card.appendChild(el('div', 'k3t-footnote', 'Attachment ' + rec.state + '.'));
      }
      return card;
    }

    function bsdAdviceEl(rec) {
      var card = el('div', 'k3t-card k3t-bsdadvice');
      card.setAttribute('data-testid', 'k3t-bsdadvice');
      var head = el('div', 'k3t-rowhead');
      head.appendChild(iconSpan('bsd', 'k3t-ic'));
      head.appendChild(el('span', 'k3t-rowhead-title', 'BSD advice'));
      card.appendChild(head);
      card.appendChild(el('div', 'k3t-bsdadvice-summary', rec.summary || ''));
      if (rec.detail) {
        var btn = ghostBtn('info', 'Details', function () {
          ui().popover(btn, el('div', 'k3t-bsdadvice-detail', rec.detail), { className: 'k3t-details-pop' });
        });
        card.appendChild(btn);
      }
      card.appendChild(el('div', 'k3t-footnote', 'BSD can only advise — it cannot run tools or widen access.'));
      return card;
    }

    function receiptEl(rec) {
      var card = el('div', 'k3t-card k3t-receipt');
      card.setAttribute('data-testid', 'k3t-receipt');
      var head = el('div', 'k3t-rowhead');
      head.appendChild(iconSpan('receipt', 'k3t-ic'));
      head.appendChild(el('span', 'k3t-rowhead-title', rec.title || 'Receipt'));
      card.appendChild(head);
      if (rec.summary) card.appendChild(el('div', 'k3t-receipt-summary', rec.summary));
      var lines = rec.lines || (rec.kv || []);
      if (lines.length) {
        var rows = el('div', 'k3t-receipt-rows');
        lines.forEach(function (l) {
          var r = el('div', 'k3-kv');
          r.appendChild(el('span', 'k3-kv-k', l.label != null ? l.label : l[0]));
          r.appendChild(el('span', 'k3-kv-v', l.value != null ? l.value : l[1]));
          rows.appendChild(r);
        });
        card.appendChild(rows);
      }
      return card;
    }

    function threadRequestEl(rec) {
      var card = el('div', 'k3t-card k3t-threadreq');
      card.setAttribute('data-testid', 'k3t-threadreq');
      // runtime cards carry the full record inline; fixture cards reference
      // the thread's threadRequests list by id.
      var req = rec.boundedTask != null ? rec : null;
      if (!req) {
        var want = rec.requestId || rec.id;
        (data.threadRequests(tid) || []).forEach(function (r) { if (r.id === want) req = r; });
      }
      var head = el('div', 'k3t-rowhead');
      head.appendChild(iconSpan('branch', 'k3t-ic'));
      head.appendChild(el('span', 'k3t-rowhead-title',
        'Thread request → ' + (req ? req.targetThread : '?')));
      card.appendChild(head);
      if (!req) {
        card.appendChild(el('div', 'k3t-footnote', 'Request record missing.'));
        return card;
      }
      card.appendChild(el('div', 'k3t-threadreq-task', req.boundedTask || ''));
      var meta = el('div', 'k3t-threadreq-meta');
      if (req.scope) meta.appendChild(el('span', 'k3-chip', req.scope));
      if (req.budget) meta.appendChild(el('span', 'k3-chip', req.budget));
      meta.appendChild(statusChip(req.status || 'pending'));
      card.appendChild(meta);
      if ((req.evidenceRefs || []).length) {
        card.appendChild(el('div', 'k3t-footnote',
          'Evidence refs: ' + req.evidenceRefs.join(', ') + ' — no hidden shared context.'));
      }
      if (req.status === 'answered' && (req.resultRefs || []).length) {
        card.appendChild(el('div', 'k3t-footnote', 'Result refs: ' + req.resultRefs.join(', ')));
      } else if ((req.status || 'pending') === 'pending') {
        var row = el('div', 'k3t-card-actions');
        var awaitBtn = el('button', 'k3-btn k3w-kit-mini', 'Await response');
        awaitBtn.type = 'button';
        awaitBtn.setAttribute('data-testid', 'k3t-threadreq-await');
        awaitBtn.addEventListener('click', function () {
          if (window.K3ThreadOps) window.K3ThreadOps.awaitRequest(req.id);
        });
        row.appendChild(awaitBtn);
        card.appendChild(row);
      }
      return card;
    }

    function restorePointEl(rec) {
      var card = el('div', 'k3t-card k3t-restorepoint');
      card.setAttribute('data-testid', 'k3t-restorepoint');
      var head = el('div', 'k3t-rowhead');
      head.appendChild(iconSpan('restore', 'k3t-ic'));
      head.appendChild(el('span', 'k3t-rowhead-title', 'Restore point — ' + (rec.label || '')));
      card.appendChild(head);
      var bits = [];
      if (rec.messageCount != null) bits.push(rec.messageCount + ' messages');
      if (rec.atMessageId) bits.push('at ' + rec.atMessageId);
      if (rec.at) bits.push(fmtClock(rec.at));
      bits.push('Immutable record');
      card.appendChild(el('div', 'k3t-footnote', bits.join(' · ') + '.'));
      return card;
    }

    var BRANCH_KIND_LABEL = {
      'branch': 'Branch: ',
      'branch-model': 'Branch (another model): ',
      'branch-persona': 'Branch (another Persona): ',
      'spawn': 'Spawned thread: '
    };
    function branchEl(rec) {
      var card = el('div', 'k3t-card k3t-branch');
      card.setAttribute('data-testid', 'k3t-branch');
      var head = el('div', 'k3t-rowhead');
      head.appendChild(iconSpan(rec.kind === 'spawn' ? 'subagent' : 'branch', 'k3t-ic'));
      head.appendChild(el('span', 'k3t-rowhead-title',
        (BRANCH_KIND_LABEL[rec.kind] || 'Branch: ') + (rec.title || '')));
      card.appendChild(head);
      var meta = el('div', 'k3t-threadreq-meta');
      meta.appendChild(el('span', 'k3-chip k3t-lineage',
        'from ' + (rec.sourceTitle || rec.sourceThreadId || rec.sourceThread || '')));
      card.appendChild(meta);
      if (rec.lineageNote) card.appendChild(el('div', 'k3t-footnote', rec.lineageNote));
      return card;
    }

    function redirectEl(rec) {
      var labels = {
        interrupted: 'Interrupted — redirected by you',
        redirected: 'Redirected the active turn',
        resumed: 'Resumed with the redirected instruction'
      };
      var card = el('div', 'k3t-redirect k3t-redirect-' + (rec.state || 'resumed'));
      card.setAttribute('data-testid', 'k3t-redirect');
      card.appendChild(iconSpan('redirect', 'k3t-redirect-ic'));
      card.appendChild(el('span', 'k3t-redirect-label', rec.note || labels[rec.state] || 'Redirected'));
      return card;
    }

    function rewoundEl(rec) {
      var card = el('div', 'k3t-marker k3t-rewound-note');
      card.setAttribute('data-testid', 'k3t-rewound-note');
      card.appendChild(iconSpan('rewind', 'k3t-marker-ic'));
      card.appendChild(el('span', null, 'Rewound ' + (rec.count || 0) + ' messages into a collapsed region.'));
      var btn = ghostBtn('restore', 'Restore', function () {
        if (window.K3ThreadOps) window.K3ThreadOps.restoreFrom(tid, rec.restorePointId || null);
      });
      card.appendChild(btn);
      return card;
    }

    function markerEl(rec) {
      var card = el('div', 'k3t-marker');
      card.setAttribute('data-testid', 'k3t-marker-' + (rec.kind || 'note'));
      if (rec.kind === 'artifact-left') {
        card.appendChild(iconSpan('artifact', 'k3t-marker-ic'));
        card.appendChild(el('span', null, 'Opened ' + (rec.title || rec.artifactId || 'artifact') + ' in the artifact workspace'));
      } else {
        card.appendChild(el('span', null, rec.text || 'Note'));
      }
      return card;
    }

    // Full card for one kind; cross-module refs are lazy (controllers load
    // before kits, but cards may render in any order during replay).
    function packetCardEl(kind, m) {
      var rec = m[kind];
      switch (kind) {
        case 'approvalCard':
          return window.K3Access ? window.K3Access.approvalCard(ctx, rec) : null;
        case 'crossProjectCard':
          return window.K3Access ? window.K3Access.crossProjectCard(ctx, rec) : null;
        case 'routeWarningCard': return routeWarningEl(rec);
        case 'attachmentCard': return attachmentCardEl(rec);
        case 'bsdAdviceCard': return bsdAdviceEl(rec);
        case 'bsdResult': {
          var line = el('div', 'k3t-bsdresult');
          line.setAttribute('data-testid', 'k3t-bsdresult');
          line.appendChild(iconSpan('bsd', 'k3t-marker-ic'));
          line.appendChild(el('span', null, BSD_RESULT_LABELS[rec.kind] || rec.summary || 'BSD result'));
          return line;
        }
        case 'receiptCard': return receiptEl(rec);
        case 'threadRequestCard': return threadRequestEl(rec);
        case 'restorePointCard': return restorePointEl(rec);
        case 'branchCard': return branchEl(rec);
        case 'redirectMarker': return redirectEl(rec);
        case 'rewoundMarker': return rewoundEl(rec);
        case 'marker': return markerEl(rec);
      }
      return null;
    }

    // Compact one-line summary per kind (chip mode rows).
    function packetSummary(kind, m) {
      var rec = m[kind];
      switch (kind) {
        case 'approvalCard': return 'Approval: ' + (rec.title || 'request') + (rec.decision ? ' — ' + rec.decision : ' — pending');
        case 'routeWarningCard': return 'Route warning: ' + (rec.headline || '') + (rec.status && rec.status !== 'open' ? ' — ' + rec.status : '');
        case 'attachmentCard': return 'Attachment: ' + (rec.file ? rec.file.name : '') + ' — ' + humanStatus(rec.state || 'pending');
        case 'bsdAdviceCard': return 'BSD advice available';
        case 'bsdResult': return BSD_RESULT_LABELS[rec.kind] || 'BSD result';
        case 'receiptCard': return rec.title || 'Receipt';
        case 'threadRequestCard': return 'Thread request — ' + (rec.status || 'pending');
        case 'restorePointCard': return 'Restore point — ' + (rec.label || '');
        case 'branchCard': return (BRANCH_KIND_LABEL[rec.kind] || 'Branch: ') + (rec.title || '');
        case 'redirectMarker': return 'Turn ' + (rec.state || 'redirected');
        case 'crossProjectCard': return 'Cross-project grant' + (rec.state && rec.state !== 'open' ? ' — ' + rec.state : '');
        case 'rewoundMarker': return 'Rewound ' + (rec.count || 0) + ' messages';
        case 'marker': return rec.kind === 'artifact-left' ? 'Artifact opened left' : 'Note';
      }
      return kind;
    }

    function packetCards(m) {
      var kinds = packetKinds(m);
      if (!kinds.length) return null;
      var wrap = el('div', 'k3t-packet');
      kinds.forEach(function (k) {
        var node = packetCardEl(k, m);
        if (node) wrap.appendChild(node);
      });
      return wrap.childNodes.length ? wrap : null;
    }

    // Chip-mode variant: compact rows; a row expands to the full card in place.
    function packetChipRows(m) {
      var kinds = packetKinds(m);
      if (!kinds.length) return null;
      var wrap = el('div', 'k3t-packet-chiprows');
      kinds.forEach(function (k) {
        var row = el('button', 'k3t-packet-row');
        row.type = 'button';
        row.setAttribute('data-testid', 'k3t-packet-row');
        row.appendChild(el('span', 'k3t-packet-row-label', packetSummary(k, m)));
        var full = null;
        row.addEventListener('click', function () {
          if (full && full.parentNode) { full.remove(); full = null; row.classList.remove('is-open'); return; }
          full = packetCardEl(k, m);
          if (full) { row.classList.add('is-open'); row.parentNode.insertBefore(full, row.nextSibling); }
        });
        wrap.appendChild(row);
      });
      return wrap;
    }

    function workChip(m) {
      var ag = m.activityGroup;
      var ts = Array.isArray(m.thoughtSegments) ? m.thoughtSegments : [];
      var cq = m.completedQuestionnaire;
      var pk = packetKinds(m);
      if (!ag && !ts.length && !cq && !pk.length) return null;
      var worked = ag ? num(ag.workedSeconds, 0) : (m.runtime ? num(m.runtime.workedSeconds, 0) : 0);
      var parts = ['Worked for ' + fmtDur(worked)];
      if (ag) parts.push(plural((ag.stages || []).length, 'stage'));
      if (ts.length) parts.push(plural(ts.length, 'thought'));
      if (cq) parts.push('1 questionnaire');
      if (pk.length) parts.push(plural(pk.length, 'record'));
      var card = el('div', 'k3t-card k3t-work-chip');
      card.setAttribute('data-testid', 'k3t-work-chip');
      var a = accordion({ icon: 'activity', title: parts.join(' · '), open: false });
      if (ag) a.accIn.appendChild(activityCard(ag));
      ts.forEach(function (seg) { a.accIn.appendChild(thoughtCard(seg)); });
      if (cq) a.accIn.appendChild(qhistoryCard(cq));
      var rows = pk.length ? packetChipRows(m) : null;
      if (rows) a.accIn.appendChild(rows);
      card.appendChild(a.head);
      card.appendChild(a.acc);
      return card;
    }

    // ---------- subcompact (Context Lens) ----------
    function subcompactCard(g, gi) {
      var card = el('div', 'k3t-card k3t-subcompact');
      card.setAttribute('data-testid', 'k3t-subcompact');
      var head = el('div', 'k3t-subcompact-head');
      head.appendChild(iconSpan('lens-subcompact'));
      head.appendChild(el('span', 'k3t-rowhead-title', 'Condensed range'));
      card.appendChild(head);
      if (g.summary) card.appendChild(el('div', 'k3t-subcompact-summary', g.summary));
      card.appendChild(el('div', 'k3t-footnote', plural((g.ids || []).length, 'source message') + ' retained'));
      var btn = ghostBtn('restore', 'Rehydrate', function () {
        rehydrated[gi] = true;
        doRebuild(true);
      });
      btn.classList.add('k3t-rehydrate-btn');
      card.appendChild(btn);
      return card;
    }

    // ---------- message article ----------
    function buildArticle(m, idx, sel) {
      var article = el('article', 'k3t-msg');
      article.setAttribute('data-mid', m.id);
      article.setAttribute('data-role', m.role === 'user' ? 'user' : 'assistant');
      article.setAttribute('data-testid', 'k3t-msg-' + m.id);

      var ls = data.messageLensState(tid, m.id);
      if (ls === 'muted') article.classList.add('is-muted');
      else if (ls === 'focused') article.classList.add('is-focused');

      if (sel.selecting) {
        article.classList.add('is-selecting');
        if (sel.selected[m.id]) article.classList.add('is-selected');
        var chk = el('button', 'k3t-lens-check');
        chk.type = 'button';
        chk.setAttribute('data-testid', 'k3-lens-check');
        chk.setAttribute('aria-label', 'Select message for Context Lens');
        chk.appendChild(icon('check'));
        chk.addEventListener('click', function (e) { e.stopPropagation(); onLensCheck(article, m); });
        article.appendChild(chk);
      }

      var ci = collapseInfo(m);
      var bodyEl = el('div', 'k3t-msg-body');
      fillParagraphs(bodyEl, displayBody(m));
      if (ci.collapsed) bodyEl.classList.add('is-clamped');
      article.appendChild(bodyEl);

      if (m.isStoppedResult) article.appendChild(el('span', 'k3t-stopped', 'Stopped'));

      if (opts.showStageRail && opts.workMode === 'inline' && m.activityGroup) {
        article.appendChild(stageRail(m.activityGroup));
      }

      if (opts.workMode === 'chip') {
        var chip = workChip(m);
        if (chip) article.appendChild(chip);
      } else {
        if (m.activityGroup) article.appendChild(activityCard(m.activityGroup));
        (Array.isArray(m.thoughtSegments) ? m.thoughtSegments : []).forEach(function (seg) {
          article.appendChild(thoughtCard(seg));
        });
        if (m.completedQuestionnaire) article.appendChild(qhistoryCard(m.completedQuestionnaire));
        var pk = packetCards(m);
        if (pk) article.appendChild(pk);
      }

      if (m.queued) {
        var qbadge = el('span', 'k3t-queued');
        qbadge.setAttribute('data-testid', 'k3t-queued');
        qbadge.appendChild(iconSpan('wifi-off', 'k3t-queued-ic'));
        qbadge.appendChild(el('span', null, 'Queued to send'));
        article.appendChild(qbadge);
      }

      article.appendChild(buildHover(article, m, ci));
      return article;
    }

    // ---------- grouping ----------
    function buildTurn(n, m) {
      var root2 = el('section', 'k3t-turn');
      root2.appendChild(el('div', 'k3t-turn-head', 'Turn ' + n + ' · ' + firstWords(m.body, 6)));
      var body = el('div', 'k3t-turn-body');
      root2.appendChild(body);
      return { root: root2, body: body };
    }
    function buildAnonTurn() {
      var root2 = el('section', 'k3t-turn k3t-turn-anon');
      var body = el('div', 'k3t-turn-body');
      root2.appendChild(body);
      return { root: root2, body: body };
    }
    function chapterDivider(ch, total) {
      var start = ch * CHAPTER_SIZE + 1;
      var end = Math.min((ch + 1) * CHAPTER_SIZE, total);
      var d = el('div', 'k3t-chapter');
      d.appendChild(el('span', 'k3t-chapter-label', 'Messages ' + start + '–' + end));
      return d;
    }

    // ---------- list render ----------
    function buildListDOM() {
      finalizeStreams();
      var ms = msgs();
      list.innerHTML = '';
      curTurnBody = null;
      var sel = currentSelection();
      list.classList.toggle('is-selecting', sel.selecting);

      var lens = data.lensState(tid);
      var groups = (lens.applied && lens.applied.subcompacted) || [];
      var memberGroup = {};
      var firstMember = {};
      groups.forEach(function (g, gi) {
        (g.ids || []).forEach(function (id) { if (memberGroup[id] == null) memberGroup[id] = gi; });
        firstMember[gi] = (g.ids || [])[0];
      });

      var userCounts = new Array(ms.length);
      var c = 0;
      for (var i = 0; i < ms.length; i++) {
        if (ms[i].role === 'user') c++;
        userCounts[i] = c;
      }

      var curChapter = -1;
      var rewindRegion = null, rewindCount = 0, rewindBy = null;
      for (var j = renderFrom; j < ms.length; j++) {
        var m = ms[j];
        var container = list;
        if (opts.groupBy === 'chapter') {
          var ch = Math.floor(j / CHAPTER_SIZE);
          if (ch !== curChapter) {
            curChapter = ch;
            if (ch > 0) list.appendChild(chapterDivider(ch, ms.length));
          }
        } else if (opts.groupBy === 'turn') {
          if (m.role === 'user' || !curTurnBody) {
            var t = m.role === 'user' ? buildTurn(userCounts[j], m) : buildAnonTurn();
            list.appendChild(t.root);
            curTurnBody = t.body;
          }
          container = curTurnBody;
        }

        var gi = memberGroup[m.id];
        if (gi != null && !sel.selecting) {
          if (firstMember[gi] === m.id) {
            container.appendChild(subcompactCard(groups[gi], gi));
            if (rehydrated[gi]) {
              var srcWrap = el('div', 'k3t-subcompact-sources');
              (groups[gi].ids || []).forEach(function (id) {
                var sm = data.message(id);
                if (sm) {
                  var sa = buildArticle(sm, indexOfMsg(ms, id), sel);
                  sa.classList.add('is-rehydrated');
                  srcWrap.appendChild(sa);
                }
              });
              container.appendChild(srcWrap);
              container.appendChild(el('div', 'k3t-rehydrated-note', 'Rehydrated for viewing'));
            }
          }
          continue;
        }
        // Non-destructive rewind: folded messages render as one collapsed
        // region with a restore link (never deleted).
        if (m.rewound) {
          if (!rewindRegion) {
            rewindRegion = el('div', 'k3t-rewound');
            rewindRegion.setAttribute('data-testid', 'k3t-rewound');
            rewindCount = 0;
            rewindBy = null;
            container.appendChild(rewindRegion);
          }
          rewindCount += 1;
          rewindBy = m.rewoundBy || rewindBy;
          rewindRegion.innerHTML = '';
          rewindRegion.appendChild(iconSpan('rewind', 'k3t-marker-ic'));
          rewindRegion.appendChild(el('span', null,
            'Rewound region — ' + rewindCount + (rewindCount === 1 ? ' message' : ' messages') + ' collapsed.'));
          (function (rid) {
            var rbtn = ghostBtn('restore', 'Restore', function () {
              if (window.K3ThreadOps) window.K3ThreadOps.restoreFrom(tid, rid);
            });
            rewindRegion.appendChild(rbtn);
          })(rewindBy);
          continue;
        }
        rewindRegion = null;
        container.appendChild(buildArticle(m, j, sel));
      }
      if (!ms.length) list.appendChild(el('div', 'k3t-empty', 'No messages yet.'));
    }

    // ---------- thread-level payload blocks (current work zone) ----------
    function agentCounts(g) {
      if (g.counts) return g.counts;
      var c = { working: 0, complete: 0, blocked: 0, waiting: 0 };
      (g.agents || []).forEach(function (a) {
        var k = String(a.status || '').toLowerCase();
        if (k === 'complete' || k === 'completed') c.complete++;
        else if (k === 'blocked' || k === 'failed') c.blocked++;
        else if (k === 'queued' || k.indexOf('wait') >= 0 || k === 'paused') c.waiting++;
        else c.working++;
      });
      return c;
    }
    function aggText(counts) {
      var parts = [];
      if (counts.working) parts.push(counts.working + ' working');
      if (counts.complete) parts.push(counts.complete + ' complete');
      if (counts.blocked) parts.push(counts.blocked + ' blocked');
      if (counts.waiting) parts.push(counts.waiting + ' waiting');
      return parts.length ? parts.join(' · ') : 'No active agents';
    }
    function agentRow(ag) {
      var row = el('div', 'k3t-agent');
      var head = el('div', 'k3t-agent-head');
      head.appendChild(el('span', 'k3t-agent-name', ag.name || 'Agent'));
      head.appendChild(statusChip(ag.status));
      row.appendChild(head);
      if (ag.task) row.appendChild(el('div', 'k3t-agent-task', ag.task));
      if (ag.currentActivity) row.appendChild(el('div', 'k3t-agent-activity', ag.currentActivity));
      row.appendChild(el('div', 'k3t-agent-meta', 'Worked for ' + fmtDur(ag.workedSeconds || 0)));
      return row;
    }
    function openAgentTable(anchor, g) {
      var table = el('table', 'k3t-agent-table');
      var thead = el('tr');
      ['Name', 'Task', 'Activity', 'Status', 'Worked'].forEach(function (h) { thead.appendChild(el('th', null, h)); });
      table.appendChild(thead);
      (g.agents || []).forEach(function (a) {
        var tr = el('tr');
        tr.appendChild(el('td', null, a.name || 'Agent'));
        tr.appendChild(el('td', null, a.task || ''));
        tr.appendChild(el('td', null, a.currentActivity || ''));
        tr.appendChild(el('td', null, humanStatus(a.status)));
        tr.appendChild(el('td', null, fmtDur(a.workedSeconds || 0)));
        table.appendChild(tr);
      });
      ui().popover(anchor, table, { className: 'k3t-table-pop k3-scroll' });
    }
    function subagentsCard(g) {
      var card = el('div', 'k3t-card k3t-subagents');
      card.setAttribute('data-testid', 'k3t-subagents');
      var a = accordion({
        icon: 'subagent',
        title: g.label || 'Subagents',
        meta: aggText(agentCounts(g)),
        open: false
      });
      var rows = el('div', 'k3t-agents k3-stagger');
      (g.agents || []).forEach(function (ag, ai) {
        var r = agentRow(ag);
        r.style.setProperty('--k3-i', ai);
        rows.appendChild(r);
      });
      a.accIn.appendChild(rows);
      var foot = el('div', 'k3t-card-foot');
      var detailsBtn = ghostBtn('more', 'Full details', function () { openAgentTable(detailsBtn, g); });
      foot.appendChild(detailsBtn);
      a.accIn.appendChild(foot);
      card.appendChild(a.head);
      card.appendChild(a.acc);
      return card;
    }
    function diffCard(g) {
      var files = g.files || [];
      var card = el('div', 'k3t-card k3t-diff');
      card.setAttribute('data-testid', 'k3t-diff');
      var a = accordion({
        icon: 'diff',
        title: g.label || 'File changes',
        meta: plural(files.length, 'file'),
        open: true
      });
      var rows = el('div', 'k3t-diff-rows k3-stagger');
      files.forEach(function (f, fi) {
        var row = el('div', 'k3t-diff-row');
        row.style.setProperty('--k3-i', fi);
        row.appendChild(el('span', 'k3t-diff-path', f.path || ''));
        var stats = el('span', 'k3t-diff-stats');
        stats.appendChild(el('span', 'k3t-diff-add k3-count', '+' + num(f.added, 0)));
        stats.appendChild(document.createTextNode(' '));
        stats.appendChild(el('span', 'k3t-diff-del k3-count', '-' + num(f.removed, 0)));
        row.appendChild(stats);
        row.appendChild(statusChip(diffStatus(f.status)));
        rows.appendChild(row);
      });
      a.accIn.appendChild(rows);
      card.appendChild(a.head);
      card.appendChild(a.acc);
      return card;
    }
    function shortcutCard(item, kind) {
      var wrap = el('span', 'k3t-shortcut-wrap');
      var btn = el('button', 'k3t-shortcut');
      btn.type = 'button';
      btn.setAttribute('data-testid', kind === 'browser' ? 'k3t-browser' : 'k3t-artifact');
      var working = kind === 'artifact' && item.status === 'working';
      if (working) {
        // Video-C canon: an artifact can be mid-build — orbit + provenance meta
        var spin = el('span', 'k3t-shortcut-ic k3-orbit');
        spin.setAttribute('aria-hidden', 'true');
        for (var oi = 0; oi < 4; oi++) spin.appendChild(el('i'));
        btn.appendChild(spin);
        btn.classList.add('is-working');
      } else {
        btn.appendChild(iconSpan(kind === 'browser' ? 'browser' : 'artifact', 'k3t-shortcut-ic'));
      }
      var txt = el('span', 'k3t-shortcut-txt');
      txt.appendChild(el('span', 'k3t-shortcut-title', item.title || item.id));
      // PM-native browser terminology: Browser Program, never session-model copy.
      var meta = working
        ? 'Building' + (item.provenance ? ' · ' + item.provenance : '')
        : kind === 'browser'
          ? 'Browser Program' + (item.currentPage ? ' · ' + item.currentPage : '')
          : (item.kind || 'artifact') + (item.projectPath ? ' · ' + item.projectPath : '');
      txt.appendChild(el('span', 'k3t-shortcut-meta', meta));
      btn.appendChild(txt);
      wrap.appendChild(btn);

      function openInEditorTab() {
        var tabs = store.get('openTabs', []);
        if (!Array.isArray(tabs)) tabs = [];
        var exists = tabs.some(function (t) { return t && t.id === item.id; });
        if (!exists) {
          store.set('openTabs', tabs.concat([{
            id: item.id,
            title: item.title || item.id,
            kind: kind,
            projectPath: item.projectPath || item.currentPage || ''
          }]));
        }
      }

      btn.addEventListener('click', function () {
        // Artifacts open in the left artifact workspace (outside the
        // transcript); the editor-tab handoff remains via the overflow menu.
        if (kind === 'artifact' && window.K3ArtifactWS) {
          window.K3ArtifactWS.open(ctx, tid, item.id);
          return;
        }
        openInEditorTab();
      });

      if (kind === 'artifact') {
        var overflow = el('button', 'k3-icon-btn k3t-shortcut-more');
        overflow.type = 'button';
        overflow.setAttribute('aria-label', 'More actions for ' + (item.title || item.id));
        overflow.setAttribute('data-testid', 'k3t-artifact-more');
        overflow.appendChild(icon('more'));
        overflow.addEventListener('click', function (e) {
          e.stopPropagation();
          ui().menu(overflow, [
            { label: 'Open in editor tab', icon: 'export', action: openInEditorTab },
            {
              label: 'Copy link', icon: 'copy',
              action: function () {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(tid + '#' + item.id);
                }
              }
            }
          ], { width: 200 });
        });
        wrap.appendChild(overflow);
      }
      return wrap;
    }
    function linksWrap(t) {
      var arts = t.artifacts || [];
      var brs = t.browserSessions || [];
      if (!arts.length && !brs.length) return null;
      var wrap = el('div', 'k3t-links');
      arts.forEach(function (a2) { wrap.appendChild(shortcutCard(a2, 'artifact')); });
      brs.forEach(function (b) { wrap.appendChild(shortcutCard(b, 'browser')); });
      return wrap;
    }
    function endzoneChip(t) {
      var sgs = t.subagentGroups || [];
      var dgs = t.diffGroups || [];
      var arts = t.artifacts || [];
      var bss = t.browserSessions || [];
      if (!sgs.length && !dgs.length && !arts.length && !bss.length) return null;
      var agentTotal = 0, fileTotal = 0;
      sgs.forEach(function (g) { agentTotal += (g.agents || []).length; });
      dgs.forEach(function (g) { fileTotal += (g.files || []).length; });
      var parts = [];
      if (agentTotal) parts.push(plural(agentTotal, 'agent'));
      if (fileTotal) parts.push(plural(fileTotal, 'file'));
      if (arts.length + bss.length) parts.push(plural(arts.length + bss.length, 'shortcut'));
      var card = el('div', 'k3t-card k3t-work-chip');
      card.setAttribute('data-testid', 'k3t-work-chip');
      var a = accordion({ icon: 'activity', title: parts.join(' · ') || 'Work summary', open: false });
      sgs.forEach(function (g) { a.accIn.appendChild(subagentsCard(g)); });
      dgs.forEach(function (g) { a.accIn.appendChild(diffCard(g)); });
      var lw = linksWrap(t);
      if (lw) a.accIn.appendChild(lw);
      card.appendChild(a.head);
      card.appendChild(a.acc);
      return card;
    }
    function buildEndzone() {
      endzone.innerHTML = '';
      var t = tid && data.thread(tid);
      if (!t) return;
      if (opts.workMode === 'chip') {
        var chip = endzoneChip(t);
        if (chip) endzone.appendChild(chip);
      } else {
        (t.subagentGroups || []).forEach(function (g) { endzone.appendChild(subagentsCard(g)); });
        (t.diffGroups || []).forEach(function (g) { endzone.appendChild(diffCard(g)); });
        var lw = linksWrap(t);
        if (lw) endzone.appendChild(lw);
      }
      // Server-first: a host-owned Goal can continue while the client is away.
      if (store.get('sync.serverContinuing', false) === true) {
        var note = el('div', 'k3t-server-note');
        note.setAttribute('data-testid', 'k3t-server-continuing');
        note.appendChild(iconSpan('wifi', 'k3t-marker-ic'));
        note.appendChild(el('span', null, 'Server is continuing this work'));
        endzone.appendChild(note);
      }
    }

    // ---------- live working region ----------
    function orbitSpinner() {
      // four-dot orbit spinner (the preparing/submitting language). Falls
      // back to nothing under reduced motion (the gate kills the rotation).
      var o = el('span', 'k3-orbit');
      o.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < 4; i++) o.appendChild(el('i'));
      return o;
    }
    function showLive() {
      var ws = tid && data.workingState(tid);
      if (!ws) return;
      if (!live) {
        var region = el('div', 'k3t-live k3-running k3-anim-rise');
        region.setAttribute('data-testid', 'k3t-live');
        var lead = el('span', 'k3t-live-lead');
        lead.appendChild(el('span', 'k3-dot is-running'));
        lead.appendChild(orbitSpinner());
        region.appendChild(lead);
        var action = el('span', 'k3t-live-action', ws.summary || 'Working');
        var timer = el('span', 'k3t-live-timer k3-count', 'Working for ' + fmtDur(ws.workedSeconds()));
        region.appendChild(action);
        region.appendChild(timer);
        scroller.insertBefore(region, endzone);
        live = { el: region, actionEl: action, timerEl: timer, lastSec: ws.workedSeconds() };
        liveTick = setInterval(tickLive, 1000);
        if (atBottom) scrollBottomInstant();
      } else if (ws.summary) {
        live.actionEl.textContent = ws.summary;
      }
    }
    function tickLive() {
      var ws = tid && data.workingState(tid);
      if (!ws) { hideLive(); return; }
      if (live) {
        var sec = ws.workedSeconds();
        live.timerEl.textContent = 'Working for ' + fmtDur(sec);
        // re-trigger the subtle count-up slot only when the value actually
        // changed, so the timer feels alive without thrashing.
        if (sec !== live.lastSec) {
          live.lastSec = sec;
          live.timerEl.classList.remove('k3-count');
          void live.timerEl.offsetWidth; // reflow to restart the animation
          live.timerEl.classList.add('k3-count');
        }
      }
      list.querySelectorAll('[data-k3t-working-meta]').forEach(function (mt) {
        var art = mt.closest('.k3t-msg');
        var m = art && data.message(art.getAttribute('data-mid'));
        if (m) mt.textContent = metaLineFor(m, true);
      });
    }
    function hideLive() {
      if (liveTick) { clearInterval(liveTick); liveTick = null; }
      if (live) {
        // condense-to-history flourish: a quick settle before removal so the
        // working region departs with intent rather than vanishing.
        try { live.el.classList.add('k3-spring-reflow'); } catch (e) { /* ignore */ }
        var node = live.el;
        setTimeout(function () { try { node.remove(); } catch (e) { /* ignore */ } }, reducedMotion() ? 0 : 360);
        live = null;
      }
      clearWorkingMeta();
    }
    function syncLive() {
      if (tid && data.workingState(tid)) showLive();
      else hideLive();
    }
    function markWorkingMeta() {
      var uid = lastUserMsgId();
      if (!uid) return;
      var art = findArticle(uid);
      if (!art) return;
      var mt = art.querySelector('.k3t-meta-text');
      if (!mt) return;
      var m = data.message(uid);
      mt.setAttribute('data-k3t-working-meta', '1');
      if (m) mt.textContent = metaLineFor(m, true);
    }
    function clearWorkingMeta() {
      list.querySelectorAll('[data-k3t-working-meta]').forEach(function (mt) {
        mt.removeAttribute('data-k3t-working-meta');
        var art = mt.closest('.k3t-msg');
        var m = art && data.message(art.getAttribute('data-mid'));
        if (m) mt.textContent = metaLineFor(m, false);
      });
    }

    // ---------- reply streaming ----------
    function startStream(m, bodyEl) {
      if (!bodyEl) return;
      bodyEl.innerHTML = '';
      var paras = displayBody(m).split(/\n\s*\n/).map(function (s) { return s.trim(); }).filter(Boolean);
      if (!paras.length) paras = [''];
      var pi = 0;
      var tokens = paras[0].split(/(\s+)/);
      var ti = 0;
      var p = el('p');
      bodyEl.appendChild(p);
      var iv = setInterval(function () {
        if (unmounted) { clearInterval(iv); return; }
        var batch = tokens.slice(ti, ti + STREAM_TOKENS).join('');
        if (batch) {
          var span = el('span');
          span.textContent = batch;
          p.appendChild(span);
        }
        ti += STREAM_TOKENS;
        if (ti >= tokens.length) {
          pi++;
          if (pi >= paras.length) { endStream(m.id); return; }
          tokens = paras[pi].split(/(\s+)/);
          ti = 0;
          p = el('p');
          bodyEl.appendChild(p);
        }
        if (atBottom) scroller.scrollTop = scroller.scrollHeight;
      }, STREAM_BATCH_MS);
      streams[m.id] = { iv: iv, bodyEl: bodyEl };
    }
    function endStream(mid) {
      var s = streams[mid];
      if (!s) return;
      clearInterval(s.iv);
      delete streams[mid];
    }
    function finalizeStreams() {
      Object.keys(streams).forEach(function (mid) {
        clearInterval(streams[mid].iv);
        var m = data.message(mid);
        var bodyEl = streams[mid].bodyEl;
        if (m && bodyEl && bodyEl.isConnected) {
          fillParagraphs(bodyEl, displayBody(m));
          bodyEl.classList.toggle('is-clamped', collapseInfo(m).collapsed);
        }
      });
      streams = {};
    }

    // ---------- scroll engine ----------
    function scrollBottomInstant() { scroller.scrollTop = scroller.scrollHeight; }
    function scrollToLatest() {
      atBottom = true;
      jumpBtn.classList.remove('is-visible');
      scroller.scrollTo({ top: scroller.scrollHeight, behavior: reducedMotion() ? 'auto' : 'smooth' });
    }
    function syncScrollState() {
      var dist = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
      atBottom = dist <= BOTTOM_STICK_PX;
      jumpBtn.classList.toggle('is-visible', dist >= JUMP_PILL_PX);
    }
    function captureAnchor() {
      var sRect = scroller.getBoundingClientRect();
      var arts = list.querySelectorAll('.k3t-msg');
      for (var i = 0; i < arts.length; i++) {
        var r = arts[i].getBoundingClientRect();
        if (r.bottom > sRect.top + 1) {
          return {
            mid: arts[i].getAttribute('data-mid'),
            ratio: clampNum(-(r.top - sRect.top) / Math.max(1, r.height), 0, 1)
          };
        }
      }
      return null;
    }
    function applyAnchor(a) {
      if (!a) return;
      var art = findArticle(a.mid);
      if (!art) return;
      var sRect = scroller.getBoundingClientRect();
      var r = art.getBoundingClientRect();
      var contentTop = r.top - sRect.top + scroller.scrollTop;
      scroller.scrollTop = contentTop + a.ratio * r.height;
    }
    function saveAnchorNow() {
      if (!tid) return;
      var a = captureAnchor();
      if (a) store.set('scrollAnchors.' + tid, { msgId: a.mid, offsetRatio: a.ratio });
    }
    function scheduleAnchorSave() {
      if (anchorTimer) clearTimeout(anchorTimer);
      anchorTimer = setTimeout(function () {
        anchorTimer = null;
        if (!unmounted) saveAnchorNow();
      }, ANCHOR_SAVE_MS);
    }
    function onScroll() {
      syncScrollState();
      scheduleAnchorSave();
    }
    function pageOlder() {
      if (paging || renderFrom <= 0) return;
      paging = true;
      var anchor = captureAnchor();
      renderFrom = Math.max(0, renderFrom - CHUNK);
      buildListDOM();
      updateTopRegion();
      applyAnchor(anchor);
      syncScrollState();
      paging = false;
    }
    function restoreScrollFromStore() {
      var anchor = store.get('scrollAnchors.' + tid, null);
      var ms = msgs();
      var idx = anchor && anchor.msgId ? indexOfMsg(ms, anchor.msgId) : -1;
      if (idx >= 0) {
        var paged = false;
        while (renderFrom > idx) {
          renderFrom = Math.max(0, renderFrom - CHUNK);
          paged = true;
        }
        if (paged) { buildListDOM(); updateTopRegion(); }
        applyAnchor({ mid: anchor.msgId, ratio: clampNum(Number(anchor.offsetRatio) || 0, 0, 1) });
      } else {
        scrollBottomInstant();
      }
      syncScrollState();
    }

    // ---------- reveal / jump ----------
    function jumpToMessage(msgId, block, flash) {
      var ms = msgs();
      var idx = indexOfMsg(ms, msgId);
      if (idx < 0) return false;
      var m = ms[idx];
      // a hidden (subcompacted) target rehydrates its range first
      var lens = data.lensState(tid);
      ((lens.applied && lens.applied.subcompacted) || []).forEach(function (g, gi) {
        if ((g.ids || []).indexOf(msgId) >= 0) rehydrated[gi] = true;
      });
      var ci = collapseInfo(m);
      var expansionChanged = ci.eligible && ci.collapsed;
      if (expansionChanged) {
        store.set('expandedMessages.' + m.id, true);
        store.set('collapsedMessages.' + m.id, null);
      }
      var paged = false;
      while (renderFrom > idx) {
        renderFrom = Math.max(0, renderFrom - CHUNK);
        paged = true;
      }
      if (paged || expansionChanged || !findArticle(msgId)) {
        buildListDOM();
        updateTopRegion();
      }
      var art = findArticle(msgId);
      if (!art) return false;
      art.scrollIntoView({ block: block || 'center' });
      if (flash) flashEl(art);
      syncScrollState();
      return true;
    }
    function checkFocusTarget() {
      var ft = store.get('search.focusTarget', null);
      if (!ft || !ft.messageId) return;
      var at = typeof ft.at === 'number' ? ft.at : 0;
      if (at === lastFtAt) return;
      lastFtAt = at;
      // same freshness window search.js uses for post-remount reveals: a stale
      // (persisted) focus target must not yank the view on a fresh mount.
      if (Date.now() - at > 5000) return;
      if (indexOfMsg(msgs(), ft.messageId) < 0) return;
      jumpToMessage(ft.messageId, 'center', true);
    }

    // ---------- top region (history pill + chapter outline) ----------
    function updateTopRegion() {
      var total = msgs().length;
      var pill = top.querySelector('.k3t-history-pill');
      if (renderFrom > 0) {
        if (!pill) {
          pill = el('div', 'k3t-history-pill');
          pill.setAttribute('data-testid', 'k3t-history-pill');
          top.insertBefore(pill, chaptersEl);
        }
        pill.textContent = 'Viewing recent ' + (total - renderFrom) + ' of ' + total +
          ' — older history pages in as you scroll up';
      } else if (pill) {
        pill.remove();
      }
      chaptersEl.innerHTML = '';
      if (opts.groupBy === 'chapter' && total > CHAPTER_SIZE) {
        var count = Math.ceil(total / CHAPTER_SIZE);
        for (var ch = 0; ch < count; ch++) {
          (function (ch2) {
            var start = ch2 * CHAPTER_SIZE + 1;
            var end = Math.min((ch2 + 1) * CHAPTER_SIZE, total);
            var b = el('button', 'k3t-chapter-chip', start + '–' + end);
            b.type = 'button';
            b.addEventListener('click', function () {
              var ms = msgs();
              var m = ms[ch2 * CHAPTER_SIZE];
              if (m) jumpToMessage(m.id, 'start', false);
            });
            chaptersEl.appendChild(b);
          })(ch);
        }
      }
    }

    // ---------- render orchestration ----------
    function renderAll(initial) {
      finalizeStreams();
      hideLive();
      if (!tid) {
        list.innerHTML = '';
        list.appendChild(el('div', 'k3t-empty', 'No thread selected.'));
        return;
      }
      if (initial) {
        var vw = data.visibleWindow(tid);
        renderFrom = Math.max(0, msgs().length - vw.initialCount);
      }
      buildListDOM();
      buildEndzone();
      syncLive();
      updateTopRegion();
      if (initial) restoreScrollFromStore();
      else syncScrollState();
      checkFocusTarget();
    }
    function doRebuild(preserve) {
      finalizeStreams();
      var anchor = preserve ? captureAnchor() : null;
      buildListDOM();
      buildEndzone();
      syncLive();
      updateTopRegion();
      if (preserve) applyAnchor(anchor);
      checkFocusTarget();
    }
    function scheduleRebuild(preserve) {
      rebuildPreserve = rebuildPreserve || preserve;
      if (rebuildTimer) return;
      rebuildTimer = setTimeout(function () {
        rebuildTimer = null;
        if (unmounted) return;
        var p = rebuildPreserve;
        rebuildPreserve = false;
        doRebuild(p);
      }, 0);
    }

    // ---------- incremental appends ----------
    function placeArticle(article, m, idx, ms) {
      if (opts.groupBy === 'chapter') {
        if (idx % CHAPTER_SIZE === 0 && idx > 0) {
          list.appendChild(chapterDivider(Math.floor(idx / CHAPTER_SIZE), ms.length));
        }
        list.appendChild(article);
      } else if (opts.groupBy === 'turn') {
        if (m.role === 'user' || !curTurnBody) {
          var t = m.role === 'user' ? buildTurn(turnNumberAt(ms, idx), m) : buildAnonTurn();
          list.appendChild(t.root);
          curTurnBody = t.body;
        }
        curTurnBody.appendChild(article);
      } else {
        list.appendChild(article);
      }
    }
    function appendIncoming(m, stream) {
      if (!m || findArticle(m.id)) return;
      var ms = msgs();
      var idx = indexOfMsg(ms, m.id);
      if (idx < 0 || idx < renderFrom) return;
      var empty = list.querySelector('.k3t-empty');
      if (empty) empty.remove();
      var article = buildArticle(m, idx, currentSelection());
      // Video-A causal continuity: a live arrival rises from the composer edge
      // (the content above stays anchored; the gate makes this instant under
      // reduced motion). Initial renders/rebuilds never get the class.
      article.classList.add('k3t-enter');
      placeArticle(article, m, idx, ms);
      updateTopRegion();
      if (stream) startStream(m, article.querySelector('.k3t-msg-body'));
      if (atBottom) scrollBottomInstant();
      syncScrollState();
    }
    function onMessageAdded(m) {
      appendIncoming(m, !!(m && m.role === 'assistant' && !m.isStoppedResult && !reducedMotion()));
    }

    // ---------- event wiring ----------
    function onData(evt) {
      if (unmounted || !evt) return;
      var mine = !evt.threadId || evt.threadId === tid;
      switch (evt.type) {
        case 'message-added':
          if (mine) onMessageAdded(evt.message);
          break;
        case 'working':
          if (mine) { showLive(); markWorkingMeta(); }
          break;
        case 'working-step':
          if (mine) { if (live) live.actionEl.textContent = evt.summary || ''; else showLive(); }
          break;
        case 'idle':
          if (mine) hideLive();
          break;
        case 'stopped':
          if (mine) { if (evt.message) appendIncoming(evt.message, false); hideLive(); }
          break;
        case 'lens-changed':
          if (mine) scheduleRebuild(true);
          break;
        case 'outbox-changed':
        case 'thread-op':
        case 'approval-decided':
        case 'route-warning':
        case 'attachment-resolved':
        case 'bsd-changed':
        case 'bsd-advice':
        case 'compact-now-done':
          if (mine) scheduleRebuild(true);
          break;
        case 'sync-changed':
          buildEndzone();
          break;
        case 'threads-changed':
          if (tid && !data.thread(tid)) {
            tid = resolveActiveTid();
            rehydrated = {};
            renderAll(true);
          }
          break;
        case 'restarted':
          renderAll(true);
          break;
      }
    }
    function onReveal(evt) {
      if (unmounted || !evt || !evt.messageId) return;
      if (evt.threadId === tid) jumpToMessage(evt.messageId, 'center', true);
    }

    ctx.on('data', onData);
    ctx.on('reveal-message', onReveal);
    disposers.push(function () { ctx.off('data', onData); });
    disposers.push(function () { ctx.off('reveal-message', onReveal); });

    disposers.push(store.subscribe('activeThreadId', function () {
      if (unmounted) return;
      var next = resolveActiveTid();
      if (!next || next === tid) return;
      saveAnchorNow();
      finalizeStreams();
      rehydrated = {};
      tid = next;
      renderAll(true);
    }));
    disposers.push(store.subscribe('lens', function (path) {
      if (unmounted) return;
      if (typeof path === 'string' && tid && path.indexOf('lens.' + tid) === 0) scheduleRebuild(true);
    }));

    scroller.addEventListener('scroll', onScroll, { passive: true });
    disposers.push(function () { scroller.removeEventListener('scroll', onScroll); });
    jumpBtn.addEventListener('click', scrollToLatest);

    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) pageOlder(); });
    }, { root: scroller, rootMargin: '160px 0px 0px 0px', threshold: 0 });
    observer.observe(sentinel);

    // ---------- boot ----------
    tid = resolveActiveTid();
    renderAll(true);

    function unmount() {
      if (unmounted) return;
      unmounted = true;
      finalizeStreams();
      hideLive();
      if (anchorTimer) { clearTimeout(anchorTimer); anchorTimer = null; }
      if (rebuildTimer) { clearTimeout(rebuildTimer); rebuildTimer = null; }
      timers.forEach(clearTimeout);
      timers = [];
      if (observer) { observer.disconnect(); observer = null; }
      disposers.forEach(function (fn) { try { fn(); } catch (e) { /* ignore */ } });
      disposers = [];
      root.remove();
    }

    return {
      unmount: unmount,
      reveal: function (msgId) { return jumpToMessage(msgId, 'center', true); },
      scrollToLatest: scrollToLatest,
      refresh: function () { doRebuild(true); }
    };
  }

  window.K3ThreadKit = { mount: mount };
})();
