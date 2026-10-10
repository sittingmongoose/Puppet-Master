/* T.CommandCard: the chat's compact command card (DECISIONS.md D27, terminal brief item 9). It replaces the 5.6 Pro
   chat's inline "Shell" box. The chat keeps only this bounded preview and audit card; the shell owns the session, and
   Open in Terminal reveals that exact session as a terminal tab (canon: Plans/assistant-chat-design.md section 13.3,
   ACD-102, ACD-108, ACD-126 to ACD-131).

   API (PMT.card is assigned from this by js/90-kind.js):
     T.CommandCard.create(spec) -> HTMLElement
     T.CommandCard.update(element, spec)   merges spec over the element's last spec and redraws in place, so focus,
                                           horizontal scroll and the disclosure survive a live update
   spec: { command, cwd, status: 'running'|'ok'|'failed'|'interrupted'|'waiting', exitCode, elapsedMs, startedAt,
           lines: string[] (plain text, escapes already stripped), totalLines, by: 'user'|'agent:<name>', expanded,
           failureLine (optional: the line that names the failure, kept visible while collapsed, ACD-130),
           onOpen, onRerun, onViewOutput, onToggle }
   Handlers are called as fn(spec, element, event); onToggle as fn(expanded, spec, element).

   Rules this file holds (numbers for SPEC.md):
   - Preview: the last 5 lines collapsed, the last 15 expanded, then "N more lines" (N = totalLines - shown).
     Blank lines at either edge of the window are skipped (and counted in N). Lines keep their spacing
     (white-space: pre), never wrap, and scroll sideways. A carriage return keeps only the text after it (what the
     terminal shows); C0 controls are dropped; a line is cut at 1000 characters. A finished command with no output
     says "No output".
   - Status: a glyph plus words. Running, Exit 0, Exit <code>, Interrupted, Needs input. No stripes, no capsule badges.
   - Running: the elapsed time is text that updates once a second from startedAt (one shared timer for every card).
   - Actions: Open in Terminal only when the card has a live session (onOpen); View output only when it has none
     (canon: never fabricate Open in Terminal); Rerun in Terminal once the command has stopped. Text buttons, 24 px.
   - Expanded also shows the whole command (wrapped) and the whole working folder.
   - No internal ids in any visible text. */
(function () {
  var COLLAPSED = 5, EXPANDED = 15, MAX_LINE = 1000;
  var NS = 'http://www.w3.org/2000/svg';
  var seq = 0;
  var states = typeof WeakMap === 'function' ? new WeakMap() : null;

  /* Glyphs share the terminal gutter's marks (js/70-view.js): the check and the cross are the same paths, so a
     command reads the same in the chat and beside its prompt line. 16 x 16 user units, stroke only. */
  var GLYPH = {
    running: '<circle class="pmt-card-g-track" cx="8" cy="8" r="5.5"/>' +
      '<path class="pmt-card-g-arc" d="M8 2.5a5.5 5.5 0 0 1 5.5 5.5"/>' +
      '<circle class="pmt-card-g-dot" cx="8" cy="8" r="2.1"/>' +
      '<rect class="pmt-card-g-sq" x="5.75" y="5.75" width="4.5" height="4.5"/>' +
      '<rect class="pmt-card-g-frame" x="2.5" y="2.5" width="11" height="11"/>',
    ok: '<path d="M3.5 8.5l3 3 6-7"/>',
    failed: '<path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/>',
    interrupted: '<circle cx="8" cy="8" r="5.5"/><path d="M4.4 11.6l7.2-7.2"/>',
    waiting: '<path d="M3 4.5l3.5 3.5L3 11.5"/><path d="M8.5 11.5h4.5"/>'
  };
  var CHEVRON = '<path d="M4.5 6.25l3.5 3.5 3.5-3.5"/>';

  function svg(inner, cls) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 16 16');
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    if (cls) s.setAttribute('class', cls);
    s.innerHTML = inner;
    return s;
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---- formatting (local, so the card does not depend on 00-core.js being loaded first) ---- */
  function fmtElapsed(ms) {
    if (T.util && typeof T.util.fmtElapsed === 'function') return T.util.fmtElapsed(ms);
    var s = Math.max(0, Math.floor(ms / 1000));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (r < 10 ? '0' : '') + r;
  }
  function spokenElapsed(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60, out = [];
    if (h) out.push(h + (h === 1 ? ' hour' : ' hours'));
    if (m) out.push(m + (m === 1 ? ' minute' : ' minutes'));
    if (r || !out.length) out.push(r + (r === 1 ? ' second' : ' seconds'));
    return out.join(' ');
  }
  function folderOf(cwd) {
    var s = String(cwd || '').trim();
    if (!s) return '';
    if (s === '/' || s === '~') return s;
    s = s.replace(/\/+$/, '');
    var i = s.lastIndexOf('/');
    return i >= 0 ? (s.slice(i + 1) || '/') : s;
  }
  function whoOf(by) {
    if (!by) return '';
    if (by === 'user') return 'You';
    var m = /^agent:(.+)$/.exec(by);
    return m ? m[1] : '';
  }
  function cleanLine(line) {
    var s = String(line == null ? '' : line);
    var cr = s.lastIndexOf('\r');
    if (cr >= 0) s = s.slice(cr + 1);
    s = s.replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '');
    if (s.length > MAX_LINE) s = s.slice(0, MAX_LINE - 1) + '…';
    return s;
  }
  function statusText(sp) {
    switch (sp.status) {
      case 'running': return 'Running';
      case 'waiting': return 'Needs input';
      case 'interrupted': return 'Interrupted';
      case 'ok': return 'Exit ' + (sp.exitCode == null ? 0 : sp.exitCode);
      case 'failed': return sp.exitCode == null ? 'Failed' : 'Exit ' + sp.exitCode;
    }
    return '';
  }
  function isLive(sp) { return sp.status === 'running' || sp.status === 'waiting'; }
  /* lines that name a failure, coloured in the error ink once a command has failed (the escapes that coloured them
     in the terminal are gone by the time the chat has the text) */
  var BAD = /^(error|fatal|FAIL|FAILED)\b|\berror(\[[A-Za-z]*\d+\])?:|\bpanicked at\b|\btest result: FAILED\b|^npm ERR!/;

  /* ---- one shared timer for every running card. It wakes at the next whole second of elapsed time among the
     live cards (not on a free-running interval, which would show each second up to a second late), repaints only
     text that changed, and stops when no card is live. A card that left the document is dropped; one that was
     never inserted is kept for two minutes, then dropped. ---- */
  var live = new Set(), timer = 0;
  function tick() {
    timer = 0;
    live.forEach(function (node) {
      var st = stateOf(node);
      if (!st || !isLive(st.spec)) { live.delete(node); return; }
      if (node.isConnected) st.seen = true;
      else if (st.seen || ++st.orphanTicks > 120) { live.delete(node); return; }
      paintTime(node, st);
    });
    schedule();
  }
  function schedule() {
    if (timer || !live.size) return;
    var wait = 1000;
    live.forEach(function (node) {
      var st = stateOf(node), ms = st ? elapsedNow(st) : null;
      if (ms != null && ms >= 0) wait = Math.min(wait, 1000 - (ms % 1000));
    });
    timer = setTimeout(tick, Math.max(16, wait + 5));
  }
  function watch(node, on) {
    if (on) { live.add(node); if (timer) { clearTimeout(timer); timer = 0; } schedule(); }
    else live.delete(node);
  }

  function stateOf(node) { return states ? states.get(node) : node.__pmtCard; }
  function setState(node, st) { if (states) states.set(node, st); else node.__pmtCard = st; }

  function elapsedNow(st) {
    var sp = st.spec;
    if (isLive(sp)) {
      if (typeof sp.startedAt === 'number') return Date.now() - sp.startedAt;
      if (typeof sp.elapsedMs === 'number') return sp.elapsedMs + (Date.now() - st.elapsedAt);
      return null;
    }
    if (typeof sp.elapsedMs === 'number') return sp.elapsedMs;
    return null;
  }
  function paintTime(node, st) {
    var ms = elapsedNow(st), t = st.parts.time, sep = st.parts.timeSep;
    var on = ms != null;
    t.hidden = !on; sep.hidden = !on;
    if (!on) return;
    var text = fmtElapsed(ms), spoken = (isLive(st.spec) ? 'Running for ' : 'Took ') + spokenElapsed(ms);
    if (t.textContent !== text) t.textContent = text;
    if (t.getAttribute('aria-label') !== spoken) t.setAttribute('aria-label', spoken);
  }

  /* ---- build ---- */
  function build() {
    var id = 'pmt-card-' + (++seq);
    var root = el('div', 'pmt-card');
    root.setAttribute('role', 'group');

    var head = el('div', 'pmt-card-head');
    var glyph = el('span', 'pmt-card-glyph');
    glyph.setAttribute('aria-hidden', 'true');
    var spin = el('span', 'pmt-card-gi');
    glyph.appendChild(spin);

    var title = el('div', 'pmt-card-title');
    var cmd = el('code', 'pmt-card-cmd');
    var meta = el('div', 'pmt-card-meta');
    var status = el('span', 'pmt-card-status');
    var timeSep = el('span', 'pmt-card-sep', '·'); timeSep.setAttribute('aria-hidden', 'true');
    var time = el('span', 'pmt-card-time');
    var whoSep = el('span', 'pmt-card-sep', '·'); whoSep.setAttribute('aria-hidden', 'true');
    var who = el('span', 'pmt-card-who');
    var whoText = document.createTextNode('');
    var cwd = el('span', 'pmt-card-cwd');
    who.appendChild(whoText); who.appendChild(cwd);
    meta.appendChild(status); meta.appendChild(timeSep); meta.appendChild(time);
    meta.appendChild(whoSep); meta.appendChild(who);
    var fail = el('code', 'pmt-card-fail');
    title.appendChild(cmd); title.appendChild(meta); title.appendChild(fail);

    var toggle = el('button', 'pmt-card-toggle');
    toggle.type = 'button';
    toggle.setAttribute('data-pmh', 'icon');
    toggle.setAttribute('aria-controls', id + '-out');
    toggle.setAttribute('data-pmt-act', 'toggle');
    toggle.appendChild(svg(CHEVRON, 'pmt-card-chev'));
    var tgText = el('span', 'pmt-card-tg-text');
    tgText.setAttribute('aria-hidden', 'true');
    toggle.appendChild(tgText);

    head.appendChild(glyph); head.appendChild(title); head.appendChild(toggle);

    var out = el('div', 'pmt-card-out');
    out.id = id + '-out';
    var lines = el('div', 'pmt-card-lines');
    lines.tabIndex = 0;
    lines.setAttribute('role', 'group');
    lines.setAttribute('data-pmh', 'off');
    var more = el('div', 'pmt-card-more');
    out.appendChild(lines); out.appendChild(more);

    var actions = el('div', 'pmt-card-actions');
    function act(key, label) {
      var b = el('button', 'pmt-card-act', label);
      b.type = 'button';
      b.setAttribute('data-pmt-act', key);
      b.setAttribute('data-pmh', 'icon');
      actions.appendChild(b);
      return b;
    }
    var open = act('open', 'Open in Terminal');
    var view = act('view', 'View output');
    var rerun = act('rerun', 'Rerun in Terminal');

    root.appendChild(head); root.appendChild(out); root.appendChild(actions);
    return {
      root: root,
      parts: { head: head, glyph: glyph, spin: spin, cmd: cmd, meta: meta, status: status, timeSep: timeSep, time: time,
        whoSep: whoSep, who: who, whoText: whoText, cwd: cwd, fail: fail, toggle: toggle, tgText: tgText, out: out,
        lines: lines, more: more, actions: actions, open: open, view: view, rerun: rerun }
    };
  }

  /* ---- paint ---- */
  function paint(node, st) {
    var sp = st.spec, p = st.parts;
    var status = GLYPH.hasOwnProperty(sp.status) ? sp.status : 'running';
    var expanded = !!sp.expanded;
    var command = String(sp.command || '');

    node.setAttribute('data-pmt-status', status);
    node.setAttribute('data-pmt-expanded', expanded ? 'true' : 'false');
    node.setAttribute('aria-label', 'Command ' + (command || 'without text') + ', ' + statusText(sp));

    if (st.glyph !== status) {
      st.glyph = status;
      p.spin.textContent = '';
      p.spin.appendChild(svg(GLYPH[status], 'pmt-card-g'));
    }

    p.cmd.textContent = command;
    p.cmd.setAttribute('data-pm-hover-label', command);

    p.status.textContent = statusText(sp);

    var who = whoOf(sp.by), folder = folderOf(sp.cwd), fullCwd = String(sp.cwd || '');
    var showWho = !!(who || folder);
    p.whoSep.hidden = !showWho; p.who.hidden = !showWho;
    p.whoText.textContent = who ? who + ' ran' + (folder ? ' in ' : '') : (folder ? 'In ' : '');
    p.cwd.textContent = expanded ? fullCwd : folder;
    p.cwd.hidden = !folder;
    if (fullCwd) p.cwd.setAttribute('data-pm-hover-label', fullCwd); else p.cwd.removeAttribute('data-pm-hover-label');
    p.who.setAttribute('data-pmt-who', /^agent:/.test(sp.by || '') ? 'agent' : sp.by === 'user' ? 'user' : 'none');

    paintTime(node, st);

    /* preview */
    var all = Array.isArray(sp.lines) ? sp.lines : [];
    var end = all.length;   /* trailing blank lines are not output worth a preview row */
    while (end > 0 && !/\S/.test(cleanLine(all[end - 1]))) end--;
    var budget = expanded ? EXPANDED : COLLAPSED;
    var shown = all.slice(Math.max(0, end - budget), end).map(cleanLine);
    while (shown.length && !/\S/.test(shown[0])) shown.shift();   /* nor a blank row at the window's top edge */
    var total = Math.max(typeof sp.totalLines === 'number' ? sp.totalLines : 0, all.length) - (all.length - end);
    var hidden = Math.max(0, total - shown.length);
    var failed = status === 'failed';
    var failLine = failed && sp.failureLine ? cleanLine(sp.failureLine) : '';

    var frag = document.createDocumentFragment();
    for (var i = 0; i < shown.length; i++) {
      var ln = el('div', 'pmt-card-line', shown[i] || ' ');
      if (failed && (BAD.test(shown[i]) || (failLine && shown[i] === failLine))) ln.className += ' pmt-card-line-bad';
      frag.appendChild(ln);
    }
    if (!shown.length && !isLive(sp)) frag.appendChild(el('div', 'pmt-card-line pmt-card-none', 'No output'));
    p.lines.textContent = '';
    p.lines.appendChild(frag);
    var empty = !shown.length && isLive(sp);
    p.out.hidden = empty;
    p.lines.setAttribute('aria-label', shown.length ? 'Output, last ' + shown.length + (shown.length === 1 ? ' line' : ' lines') : 'Output');
    p.more.hidden = !hidden;
    p.more.textContent = hidden ? hidden + (hidden === 1 ? ' more line' : ' more lines') : '';
    if (hidden) p.more.setAttribute('data-pm-hover-label', hidden === 1 ? 'One earlier line is in the terminal' : hidden + ' earlier lines are in the terminal');

    /* a failure line stays visible while it is not among the preview lines (ACD-130) */
    var showFail = !!failLine && shown.indexOf(failLine) < 0;
    p.fail.hidden = !showFail;
    p.fail.textContent = showFail ? failLine : '';
    if (showFail) p.fail.setAttribute('data-pm-hover-label', failLine); else p.fail.removeAttribute('data-pm-hover-label');

    /* disclosure */
    p.toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    p.toggle.setAttribute('aria-label', expanded ? 'Show less' : 'Show more');
    p.toggle.setAttribute('data-pm-hover-label', expanded ? 'Show ' + COLLAPSED + ' lines' : 'Show ' + EXPANDED + ' lines and the whole command');
    p.tgText.textContent = expanded ? '-' : '+';

    /* actions: what the referenced session supports, nothing more (ACD-129) */
    var hasSession = typeof sp.onOpen === 'function';
    var canView = !hasSession && typeof sp.onViewOutput === 'function';
    var canRerun = typeof sp.onRerun === 'function' && !isLive(sp);
    p.open.hidden = !hasSession;
    p.view.hidden = !canView;
    p.rerun.hidden = !canRerun;
    p.open.classList.toggle('pmt-card-act-primary', hasSession);
    p.view.classList.toggle('pmt-card-act-primary', canView);
    p.open.setAttribute('data-pm-hover-label', 'Open in Terminal');
    p.open.setAttribute('data-pm-hover-detail', status === 'waiting' ? 'Shows the terminal that is waiting for your input'
      : isLive(sp) ? 'Shows the terminal where this is running' : 'Shows the terminal where this ran');
    p.rerun.setAttribute('data-pm-hover-label', 'Rerun in Terminal');
    p.rerun.setAttribute('data-pm-hover-detail', 'Runs the same command again in a terminal tab');
    p.view.setAttribute('data-pm-hover-label', 'View output');
    p.view.setAttribute('data-pm-hover-detail', 'Opens the saved output, read-only');
    p.actions.hidden = !hasSession && !canView && !canRerun;

    watch(node, isLive(sp));
  }

  function onClick(e) {
    var node = e.currentTarget, st = stateOf(node);
    if (!st) return;
    var b = e.target && e.target.closest ? e.target.closest('[data-pmt-act]') : null;
    if (!b || !node.contains(b) || b.hidden) return;
    var key = b.getAttribute('data-pmt-act'), sp = st.spec;
    if (key === 'toggle') {
      sp.expanded = !sp.expanded;
      paint(node, st);
      if (typeof sp.onToggle === 'function') sp.onToggle(!!sp.expanded, sp, node);
      return;
    }
    var fn = key === 'open' ? sp.onOpen : key === 'rerun' ? sp.onRerun : key === 'view' ? sp.onViewOutput : null;
    if (typeof fn === 'function') fn(sp, node, e);
  }

  function merge(into, from) {
    if (from) for (var k in from) if (Object.prototype.hasOwnProperty.call(from, k)) into[k] = from[k];
    return into;
  }

  T.CommandCard = {
    COLLAPSED_LINES: COLLAPSED,
    EXPANDED_LINES: EXPANDED,
    create: function (spec) {
      var b = build();
      var st = { spec: merge({}, spec), parts: b.parts, glyph: null, seen: false, orphanTicks: 0, elapsedAt: Date.now() };
      setState(b.root, st);
      b.root.addEventListener('click', onClick);
      paint(b.root, st);
      return b.root;
    },
    update: function (node, spec) {
      var st = node && stateOf(node);
      if (!st) return node;
      if (spec && ('elapsedMs' in spec || 'status' in spec)) st.elapsedAt = Date.now();
      merge(st.spec, spec);
      paint(node, st);
      return node;
    },
    /* the last line of a failed command's output that names the failure, or '' (for callers that want a
       failureLine without parsing the output themselves) */
    failureLineOf: function (lines) {
      var all = Array.isArray(lines) ? lines : [];
      for (var i = all.length - 1; i >= 0; i--) { var s = cleanLine(all[i]); if (BAD.test(s)) return s; }
      return '';
    }
  };
})();
