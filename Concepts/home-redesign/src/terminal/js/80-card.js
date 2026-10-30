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
   - Preview: the last 5 lines collapsed, the last 15 expanded. The lines above the window are counted at the top of
     the output as "N earlier lines" (N = totalLines - shown), and the first row fades into that count. Blank lines at
     either edge of the window are skipped (and counted in N). Lines keep their spacing (white-space: pre), never wrap,
     and scroll sideways; a line cut off at the right fades out at the edge, and the left edge fades once scrolled. A
     carriage return keeps only the text after it (what the terminal shows); C0 controls are dropped; a line is cut at
     1000 characters. A finished command with no output says "No output".
   - Status: a glyph plus words: Running (the system loader, glyphFor), Needs input, Done, Failed, Interrupted. A stopped command with an exit code
     says it in words after the status: "exited 101" (Done and Interrupted too: "exited 0", "exited 130"). No stripes,
     no capsule badges.
   - Running: the elapsed time is text in tabular figures that updates once a second from startedAt (one shared timer
     for every card), so it never shifts the line.
   - Who: "You ran in <folder>", or an agent's square mark (the terminal gutter's agent mark) and "<Agent> ran in
     <folder>", the name in the primary ink.
   - Actions: Open in Terminal only when the card has a live session (onOpen); View output only when it has none
     (canon: never fabricate Open in Terminal); Rerun in Terminal once the command has stopped. Text buttons, 24 px.
   - Expanded also shows the whole command (wrapped) and the whole working folder.
   - No internal ids in any visible text.

   Motion (what moves is CSS: the per-look tokens in css/80-card.css; this file only starts things and waits for them).
   Nothing animates on a card's first paint, in a card without layout, or for an update that changed nothing visible.
   - A status change plays a cue on the card (pmt-card-cue-done, -fail, -stop, -ask, -start): the glyph settles, the
     status word rolls over to the new one while the line beside it slides to its new width, and what appears with
     it (the exit words, the failure line, Rerun) comes in after.
   - New output scrolls the window up by the lines that arrived, the way the terminal scrolls; output that arrives
     faster than the scroll (or more than 3 lines at once) jumps, as a terminal's does.
   - The disclosure grows the window upward from its last line (the newest output stays put under your eye) and
     shrinks it back the same way; the earlier-lines count rolls with it.
   - The output band unfolds when the first line arrives, and folds away (its old rows fading) when a rerun clears it.
   - Keyboard focus inside the card sets data-pmt-focus="key" (Retro's reverse-video head and NieR's target brackets key
     on it); a pointer press sets "pointer" and marks nothing. */
(function () {
  var COLLAPSED = 5, EXPANDED = 15, MAX_LINE = 1000;
  var SCROLL_MAX = 3;        /* a window that moves by more lines than this at once jumps, as fast terminal output does */
  var FAST_MS = 360;         /* output updates closer together than this jump too, so the window never lags the text */
  var NS = 'http://www.w3.org/2000/svg';
  var seq = 0;
  var states = typeof WeakMap === 'function' ? new WeakMap() : null;

  /* The status glyph slot is one element, .pmt-card-gi, at a fixed size per look, holding one <svg class="pmt-card-g">
     made by glyphSvg(). The neon glyph rollout (pm7-glyphs item 9: running 'working', ok 'complete', failed 'failed',
     interrupted 'skipped', waiting 'waiting', the disclosure 'chevron-down') replaces glyphSvg and CHEVRON, and nothing
     else. Until then the marks are the terminal gutter's (js/70-view.js), so a command reads the same in the chat and
     beside its prompt line. 16 x 16 user units, stroke only; pathLength 1 lets a mark draw itself in. */
  var GLYPH = {
    running: '<circle class="pmt-card-g-track" cx="8" cy="8" r="5.5"/>' +
      '<path class="pmt-card-g-arc" d="M8 2.5a5.5 5.5 0 0 1 5.5 5.5"/>' +
      '<circle class="pmt-card-g-dot" cx="8" cy="8" r="2.1"/>' +
      '<rect class="pmt-card-g-sq" x="5.75" y="5.75" width="4.5" height="4.5"/>' +
      '<rect class="pmt-card-g-frame" x="2.5" y="2.5" width="11" height="11"/>',
    ok: '<path pathLength="1" d="M3.5 8.5l3 3 6-7"/>',
    failed: '<path pathLength="1" d="M4.5 4.5l7 7"/><path pathLength="1" d="M11.5 4.5l-7 7"/>',
    interrupted: '<circle pathLength="1" cx="8" cy="8" r="5.5"/><path pathLength="1" d="M4.4 11.6l7.2-7.2"/>',
    waiting: '<path pathLength="1" d="M3 4.5l3.5 3.5L3 11.5"/><path class="pmt-card-g-caret" pathLength="1" d="M8.5 11.5h4.5"/>'
  };
  var CHEVRON = '<path d="M4.5 6.25l3.5 3.5 3.5-3.5"/>';
  /* the terminal gutter's agent mark (js/70-view.js SVG.agent): a command an agent typed */
  var AGENT = '<rect x="4" y="4" width="8" height="8"/><path d="M6.5 8h3"/>';

  function svg(inner, cls) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 16 16');
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    if (cls) s.setAttribute('class', cls);
    s.innerHTML = inner;
    return s;
  }
  function glyphSvg(status) { return svg(GLYPH[status], 'pmt-card-g'); }
  /* a running command is a wait the person watches: its slot holds the system loader (W5, DR-077; window.PM_PIP_LOADER,
     Swing), sized to the slot, which the owner draws, pauses and hands to NieR's Diamond loaders; the other states keep
     their marks. Without the owner the old running mark stands in. */
  function glyphFor(status) {
    var LD = window.PM_PIP_LOADER;
    if (status !== 'running' || !LD) return glyphSvg(status);
    var t = document.createElement('template');
    t.innerHTML = LD.html({ motion: 'swing', px: 14, className: 'pmt-card-ld' });
    return t.content.firstElementChild;
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
  function statusWord(status) {
    switch (status) {
      case 'running': return 'Running';
      case 'waiting': return 'Needs input';
      case 'interrupted': return 'Interrupted';
      case 'ok': return 'Done';
      case 'failed': return 'Failed';
    }
    return '';
  }
  /* the exit code in words, once the command has stopped: "exited 101" */
  function exitText(sp, status) {
    if (status === 'ok') return 'exited ' + (typeof sp.exitCode === 'number' ? sp.exitCode : 0);
    if ((status === 'failed' || status === 'interrupted') && typeof sp.exitCode === 'number') return 'exited ' + sp.exitCode;
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

  /* ---- motion helpers. JS starts a one-shot class and waits for what it started; CSS decides what moves, how far
     and on which curve, per look, and makes it a short fade under Reduced Motion or nothing at all in NieR without
     its Motion parts. ---- */
  function laidOut(node) {
    return !!(node && node.isConnected && typeof node.getBoundingClientRect === 'function' &&
      typeof node.getAnimations === 'function' && node.getClientRects().length);
  }
  /* fn() once every finite animation on els (and inside them) has finished; at once when there is none, and never
     later than a safety limit, so a stalled animation cannot hold a card */
  function settled(els, fn) {
    var list = [];
    els.forEach(function (e) {
      if (!e || !e.getAnimations) return;
      e.getAnimations({ subtree: true }).forEach(function (a) {
        var t = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
        if (!t || t.endTime !== Infinity) list.push(a);
      });
    });
    if (!list.length) { fn(); return; }
    var done = false, guard = setTimeout(go, 1400);
    function go() { if (!done) { done = true; clearTimeout(guard); fn(); } }
    Promise.all(list.map(function (a) { return a.finished.catch(function () {}); })).then(go);
  }
  /* plays a one-shot class from its start; a later play of the same class supersedes it */
  function play(e, cls, then) {
    var key = '_pmtPlay_' + cls, gen = e[key] = (e[key] || 0) + 1;
    if (e.classList.contains(cls)) { e.classList.remove(cls); void e.offsetWidth; }
    e.classList.add(cls);
    settled([e], function () { if (e[key] !== gen) return; e.classList.remove(cls); if (then) then(); });
  }
  /* a box's height from `from` px to `to` px (default: its own height now), on the look's size curve; then() runs
     once it has settled. A look that moves nothing (Reduced Motion, NieR without Slice open) gets the end at once. */
  function morph(e, from, then, to) {
    var gen = e._pmtMorph = (e._pmtMorph || 0) + 1, s = e.style;
    e.classList.remove('pmt-card-sizing', 'pmt-card-shut');
    s.height = '';
    var target = to != null ? to : e.getBoundingClientRect().height;
    function end() {
      if (e._pmtMorph !== gen) return;
      e.classList.remove('pmt-card-sizing', 'pmt-card-shut');
      s.height = ''; s.overflow = '';
      if (then) then();
    }
    if (Math.abs(target - from) < 0.5) { end(); return; }
    /* to or from nothing, the box's padding and margins open or close with it, so it starts and ends at 0 px */
    s.overflow = 'hidden';
    s.height = from + 'px';
    if (!from) e.classList.add('pmt-card-shut');
    void e.offsetHeight;
    e.classList.add('pmt-card-sizing');
    e.classList.toggle('pmt-card-shut', !target);
    s.height = target + 'px';
    var moving = e.getAnimations().some(function (a) { return a.transitionProperty === 'height'; });
    if (!moving) { end(); return; }
    settled([e], end);
  }

  /* ---- build ---- */
  function build() {
    var id = 'pmt-card-' + (++seq);
    var root = el('div', 'pmt-card');
    root.setAttribute('role', 'group');

    var head = el('div', 'pmt-card-head');
    var glyph = el('span', 'pmt-card-glyph');
    glyph.setAttribute('aria-hidden', 'true');
    var gi = el('span', 'pmt-card-gi');
    glyph.appendChild(gi);

    var title = el('div', 'pmt-card-title');
    var cmd = el('code', 'pmt-card-cmd');
    var meta = el('div', 'pmt-card-meta');
    var status = el('span', 'pmt-card-status');
    var word = el('span', 'pmt-card-sw');
    status.appendChild(word);
    function sep(cls) { var s = el('span', 'pmt-card-sep' + (cls ? ' ' + cls : ''), '·'); s.setAttribute('aria-hidden', 'true'); return s; }
    var exitBox = el('span', 'pmt-card-exitbox'), exitSep = sep(), exit = el('span', 'pmt-card-exit');
    exitBox.appendChild(exitSep); exitBox.appendChild(exit);
    var timeSep = sep(), time = el('span', 'pmt-card-time');
    var whoSep = sep('pmt-card-whosep'), who = el('span', 'pmt-card-who');
    var by = svg(AGENT, 'pmt-card-by');
    var name = el('span', 'pmt-card-name');
    var whoText = document.createTextNode('');
    var cwd = el('span', 'pmt-card-cwd');
    who.appendChild(by); who.appendChild(name); who.appendChild(whoText); who.appendChild(cwd);
    meta.appendChild(status); meta.appendChild(exitBox);
    meta.appendChild(timeSep); meta.appendChild(time); meta.appendChild(whoSep); meta.appendChild(who);
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
    /* the count of the lines above the window, at the window's top edge where they were cut off */
    var more = el('div', 'pmt-card-more');
    var moreN = el('span', 'pmt-card-more-n');
    var moreText = document.createTextNode('');
    more.appendChild(moreN); more.appendChild(moreText);
    var lines = el('div', 'pmt-card-lines');
    lines.tabIndex = 0;
    lines.setAttribute('role', 'group');
    lines.setAttribute('data-pmh', 'off');
    var rows = el('div', 'pmt-card-rows');
    lines.appendChild(rows);
    out.appendChild(more); out.appendChild(lines);

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
      parts: { head: head, glyph: glyph, gi: gi, title: title, cmd: cmd, meta: meta, status: status, word: word,
        exitBox: exitBox, exit: exit, timeSep: timeSep, time: time, whoSep: whoSep, who: who, by: by, name: name,
        whoText: whoText, cwd: cwd, fail: fail, toggle: toggle, tgText: tgText, out: out, more: more, moreN: moreN,
        moreText: moreText, lines: lines, rows: rows, actions: actions, open: open, view: view, rerun: rerun }
    };
  }

  /* ---- the preview window: what it shows for a spec ---- */
  function windowOf(sp, status, expanded) {
    var all = Array.isArray(sp.lines) ? sp.lines : [];
    var end = all.length;   /* trailing blank lines are not output worth a preview row */
    while (end > 0 && !/\S/.test(cleanLine(all[end - 1]))) end--;
    var budget = expanded ? EXPANDED : COLLAPSED;
    var shown = all.slice(Math.max(0, end - budget), end).map(cleanLine);
    while (shown.length && !/\S/.test(shown[0])) shown.shift();   /* nor a blank row at the window's top edge */
    var total = Math.max(typeof sp.totalLines === 'number' ? sp.totalLines : 0, all.length) - (all.length - end);
    var failed = status === 'failed';
    var failLine = failed && sp.failureLine ? cleanLine(sp.failureLine) : '';
    var rows = shown.map(function (t) {
      return { t: t, bad: failed && (BAD.test(t) || (!!failLine && t === failLine)) };
    });
    if (!rows.length && !isLive(sp)) rows.push({ t: 'No output', none: true });
    return { rows: rows, shown: shown, hidden: Math.max(0, total - shown.length), failLine: failLine };
  }
  /* a failure line may wrap after a path or module separator (/ :: \\ , =) before it has to break a word, so the
     file and line it names stay whole; <wbr> adds no characters, so a copy is the line as the program printed it */
  function breakable(e, text) {
    e.textContent = '';
    var parts = String(text).split(/(\/|::|\\|,|=)/);
    for (var i = 0; i < parts.length; i++) {
      if (!parts[i]) continue;
      e.appendChild(document.createTextNode(parts[i]));
      if (i % 2 === 1 && i < parts.length - 1) e.appendChild(document.createElement('wbr'));
    }
  }
  function rowNode(r) {
    var n = el('div', 'pmt-card-line' + (r.bad ? ' pmt-card-line-bad' : '') + (r.none ? ' pmt-card-none' : ''), r.t || ' ');
    return n;
  }
  function sigOf(rows) { return rows.map(function (r) { return (r.none ? '0' : r.bad ? '!' : ' ') + r.t; }).join('\n'); }
  function same(a, b) { return a.t === b.t && !!a.none === !!b.none; }
  /* how the old rows sit in the new ones: { k } when the new rows are the old ones moved up by k rows with any new
     rows below (output arriving, or the window shrinking to its last rows), { e } when the old rows are the last of
     the new ones (the window growing upward); null when they are unrelated */
  function align(prev, next, maxK, upward) {
    var m = prev.length, n = next.length, i, ok;
    if (!m || !n) return null;
    function grown() {
      var e = n - m;
      if (e <= 0) return null;
      for (var j = 0; j < m; j++) if (!same(prev[j], next[j + e])) return null;
      return { e: e };
    }
    if (upward) return grown();
    for (var k = 0; k <= Math.min(m - 1, maxK); k++) {
      if (m - k > n) continue;
      ok = true;
      for (i = k; i < m; i++) if (!same(prev[i], next[i - k])) { ok = false; break; }
      if (ok) return k === 0 && n === m ? null : { k: k };
    }
    return null;
  }

  /* the overflow fades: a line cut off at the right fades out at the edge; once scrolled, the left edge fades too */
  /* one observer for every card's output, so a narrower chat recomputes the fades; a card that left the page is let
     go (and observed again when it is painted back in) */
  var ro = typeof ResizeObserver === 'function' ? new ResizeObserver(function (list) {
    list.forEach(function (en) {
      if (en.target.isConnected) edges(en.target);
      else { ro.unobserve(en.target); en.target._pmtRo = false; }
    });
  }) : null;
  function observe(sc) { if (ro && sc.isConnected && !sc._pmtRo) { sc._pmtRo = true; ro.observe(sc); } }
  function edges(sc) {
    if (typeof sc.scrollWidth !== 'number' || typeof sc.clientWidth !== 'number') return;
    var over = sc.scrollWidth - sc.clientWidth > 1, x = sc.scrollLeft || 0;
    var v = !over ? 'none' : x <= 1 ? 'start' : x >= sc.scrollWidth - sc.clientWidth - 1 ? 'end' : 'mid';
    if (sc.getAttribute('data-pmt-ox') !== v) sc.setAttribute('data-pmt-ox', v);
    /* a bar that takes room (not an overlay bar) sits in the band's bottom padding, so every band ends alike */
    var bar = over ? Math.max(0, sc.offsetHeight - sc.clientHeight) : 0;
    if (sc._pmtBar !== bar) { sc._pmtBar = bar; sc.style.setProperty('--pmt-card-sbh', bar + 'px'); }
  }

  /* ---- paint ---- */
  function paint(node, st, opts) {
    var sp = st.spec, p = st.parts, prev = st.view || null;
    var status = GLYPH.hasOwnProperty(sp.status) ? sp.status : 'running';
    var expanded = !!sp.expanded;
    var command = String(sp.command || '');
    var motion = !!prev && laidOut(node);
    var now = Date.now();

    /* what the eye has now, read before anything changes */
    var was = motion ? {
      title: p.title.getBoundingClientRect().height,
      status: p.status.getBoundingClientRect().width,
      out: p.out.hidden ? 0 : p.out.getBoundingClientRect().height,
      more: p.more.hidden ? 0 : p.more.getBoundingClientRect().height,
      lines: p.lines.getBoundingClientRect().height,
      actions: p.actions.hidden ? 0 : p.actions.getBoundingClientRect().height,
      exit: p.exitBox.hidden ? 0 : p.exitBox.getBoundingClientRect().width,
      ink: getComputedStyle(p.status).color,
      bar: p.lines._pmtBar || 0
    } : null;

    /* a collapse keeps the expanded head (the wrapped command and the whole folder) until the window has shrunk */
    var collapsing = motion && prev.expanded && !expanded && opts && opts.toggle;
    var showExpanded = expanded || (collapsing && st.holdExpanded !== false);

    node.setAttribute('data-pmt-status', status);
    node.setAttribute('data-pmt-expanded', showExpanded ? 'true' : 'false');
    var word = statusWord(status), exit = exitText(sp, status);
    node.setAttribute('aria-label', 'Command ' + (command || 'without text') + ', ' + word + (exit ? ', ' + exit : ''));

    /* glyph */
    var glyphChanged = st.glyph !== status;
    if (glyphChanged) {
      st.glyph = status;
      p.gi.textContent = '';
      p.gi.appendChild(glyphFor(status));
    }

    p.cmd.textContent = command;
    p.cmd.setAttribute('data-pm-hover-label', command);

    var wordChanged = p.word.textContent !== word, oldWord = p.word.textContent;
    p.word.textContent = word;
    var exitWas = !p.exitBox.hidden && p.exit.textContent;
    if (p.exitBox._pmtFold) unfoldWidth(p.exitBox);
    if (exit) p.exit.textContent = exit;
    p.exitBox.hidden = !exit;

    var who = whoOf(sp.by), folder = folderOf(sp.cwd), fullCwd = String(sp.cwd || '');
    var agent = /^agent:/.test(sp.by || '');
    var showWho = !!(who || folder);
    p.whoSep.hidden = !showWho; p.who.hidden = !showWho;
    p.name.textContent = who;
    p.name.hidden = !who;
    p.whoText.textContent = who ? ' ran' + (folder ? ' in ' : '') : (folder ? 'In ' : '');
    p.cwd.textContent = showExpanded ? fullCwd : folder;
    p.cwd.hidden = !folder;
    if (fullCwd) p.cwd.setAttribute('data-pm-hover-label', fullCwd); else p.cwd.removeAttribute('data-pm-hover-label');
    p.who.setAttribute('data-pmt-who', agent ? 'agent' : sp.by === 'user' ? 'user' : 'none');

    paintTime(node, st);

    /* preview */
    var win = windowOf(sp, status, expanded);
    var heldRows = collapsing && st.view ? st.view.rows : null;     /* a collapse shows the old rows while it shrinks */
    var rowsNow = win.rows;
    var sig = sigOf(rowsNow);
    var rowsChanged = sig !== st.rowsSig;
    var plan = null;
    if (motion && rowsChanged && prev.rows.length && rowsNow.length) {
      if (opts && opts.toggle) plan = align(prev.rows, rowsNow, EXPANDED, expanded);
      else if (now - (st.rowsAt || 0) >= FAST_MS) plan = align(prev.rows, rowsNow, SCROLL_MAX, false);
    }
    /* a band about to fold away keeps its old rows while it closes */
    var folding = motion && !rowsNow.length && !p.out.hidden && isLive(sp);
    if (rowsChanged) {
      st.rowsSig = sig;
      st.rowsAt = now;
      cancelSlide(st);
    }
    if (rowsChanged && !folding) {
      p.rows.classList.remove('pmt-card-leaving');
      var frag = document.createDocumentFragment();
      for (var i = 0; i < rowsNow.length; i++) frag.appendChild(rowNode(rowsNow[i]));
      p.rows.textContent = '';
      p.rows.appendChild(frag);
    }
    var outEmpty = !win.shown.length && isLive(sp);
    if (p.out._pmtFold) unfold(p.out);
    var outWasHidden = p.out.hidden;
    p.out.hidden = outEmpty;
    p.lines.setAttribute('aria-label', win.shown.length ? 'Output, last ' + win.shown.length + (win.shown.length === 1 ? ' line' : ' lines') : 'Output');
    p.lines.setAttribute('data-pmt-more', win.hidden ? 'true' : 'false');

    var hidden = win.hidden, moreWas = p.more.hidden ? 0 : +(p.moreN.textContent || 0);
    p.more.hidden = !hidden;
    p.moreN.textContent = hidden ? String(hidden) : '';
    p.moreText.textContent = hidden ? (hidden === 1 ? ' earlier line' : ' earlier lines') : '';
    if (hidden) p.more.setAttribute('data-pm-hover-label', hidden === 1 ? 'One earlier line is in the terminal' : hidden + ' earlier lines are in the terminal');

    /* a failure line stays visible while it is not among the preview lines (ACD-130); a collapse brings it back
       once the window has shrunk */
    if (p.fail._pmtFold) { p.fail._pmtFold = false; p.fail.hidden = true; p.fail.classList.remove('pmt-card-leaving'); }
    var showFail = !!win.failLine && win.shown.indexOf(win.failLine) < 0;
    var failWas = !p.fail.hidden;
    if (collapsing) showFail = failWas;
    else applyFail(p, showFail ? win.failLine : '');

    /* disclosure: the button says what it does at once, whatever the window is still doing */
    p.toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    p.toggle.setAttribute('aria-label', expanded ? 'Show less' : 'Show more');
    p.toggle.setAttribute('data-pm-hover-label', expanded ? 'Show ' + COLLAPSED + ' lines' : 'Show ' + EXPANDED + ' lines and the whole command');
    p.tgText.textContent = expanded ? '-' : '+';

    /* actions: what the referenced session supports, nothing more (ACD-129) */
    var hasSession = typeof sp.onOpen === 'function';
    var canView = !hasSession && typeof sp.onViewOutput === 'function';
    var canRerun = typeof sp.onRerun === 'function' && !isLive(sp);
    var actsWas = { open: !p.open.hidden, view: !p.view.hidden, rerun: !p.rerun.hidden, row: !p.actions.hidden };
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

    var statusChanged = !!prev && prev.status !== status;
    st.view = { status: status, expanded: expanded, rows: rowsNow };
    watch(node, isLive(sp));
    if (!motion) { edgesLater(p.lines); return; }
    observe(p.lines);
    if (rowsChanged) edges(p.lines);

    /* ---- choreography: everything below only starts motion; the card's final state is already painted ---- */
    if (statusChanged) {
      var cueName = status === 'ok' ? 'done' : status === 'failed' ? 'fail' : status === 'interrupted' ? 'stop'
        : status === 'waiting' ? 'ask' : 'start';
      playCue(node, st, cueName);
    }
    if (wordChanged && oldWord) rollWord(p, oldWord, was.status, was.ink);
    if (exit && !exitWas) { widen(p.exitBox, 0); play(p.exitBox, 'pmt-card-in'); }
    else if (!exit && exitWas) {
      /* the exit words fold away while the status word changes */
      p.exitBox.hidden = false;
      p.exitBox._pmtFold = true;
      widen(p.exitBox, was.exit, 0, function () { p.exitBox._pmtFold = false; p.exitBox.hidden = true; });
    }
    if (showFail && !failWas) play(p.fail, 'pmt-card-in');
    var titleNow = p.title.getBoundingClientRect().height;
    if (failWas && !showFail) {
      /* the failure line went into the window: it fades while the head closes over it */
      p.fail.hidden = false;
      p.fail._pmtFold = true;
      play(p.fail, 'pmt-card-leaving');
      morph(p.title, was.title, function () { if (!p.fail._pmtFold) return; p.fail._pmtFold = false; p.fail.hidden = true; p.fail.classList.remove('pmt-card-leaving'); }, titleNow);
    } else if (Math.abs(titleNow - was.title) >= 0.5) morph(p.title, was.title);

    var slid = false;
    if (p.out.hidden && !outWasHidden) {
      /* the band folds away when a rerun clears the output */
      p.out.hidden = false;
      p.out._pmtFold = true;
      p.rows.classList.add('pmt-card-leaving');
      if (moreWas) { p.more.hidden = false; keepMore(p, moreWas); }
      morph(p.out, was.out, function () {
        p.out._pmtFold = false; p.out.hidden = true;
        if (!st.view.rows.length) p.rows.textContent = '';
      }, 0);
    } else if (!p.out.hidden && outWasHidden) {
      /* the band unfolds as the first output arrives */
      morph(p.out, 0);
      Array.prototype.forEach.call(p.rows.children, function (r) { play(r, 'pmt-card-line-in'); });
    } else if (!p.out.hidden) {
      if (hidden && moreWas && hidden !== moreWas) {
        p.moreN.setAttribute('data-pmt-dir', hidden > moreWas ? 'up' : 'down');
        play(p.moreN, 'pmt-card-tick');
      }
      if (!!hidden !== !!moreWas) {
        if (hidden) morph(p.more, 0);
        else { p.more.hidden = false; morph(p.more, was.more, function () { p.more.hidden = true; }, 0); keepMore(p, moreWas); }
      }
      if (plan) {
        /* a sideways bar that came or went with these rows changes the window's height, not the rows' room */
        var barNow = p.lines._pmtBar || 0;
        slide(node, st, plan, was.lines + barNow - was.bar, heldRows || st.leaving || [], collapsing, !!(opts && opts.toggle));
        slid = true;
      }
      else if (rowsChanged && !heldRows) {
        var linesNow = p.lines.getBoundingClientRect().height;
        if (Math.abs(linesNow - was.lines) >= 0.5) morph(p.lines, was.lines);
      }
    }
    if (collapsing && !slid) finishCollapse(node, st);

    /* actions that appear come in after the status has settled; the row unfolds when it was not there */
    var n = 0;
    ['open', 'view', 'rerun'].forEach(function (k) {
      var b = p[k];
      if (!b.hidden && !actsWas[k] && actsWas.row) { b.style.setProperty('--pmt-card-i', String(n++)); play(b, 'pmt-card-act-in'); }
    });
    if (!p.actions.hidden && !actsWas.row) morph(p.actions, 0);
    edgesLater(p.lines);
  }

  function edgesLater(sc) {
    if (typeof requestAnimationFrame !== 'function') return;
    requestAnimationFrame(function () { edges(sc); observe(sc); });
  }

  /* the count keeps its old words while it folds away */
  function keepMore(p, n) {
    p.moreN.textContent = String(n);
    p.moreText.textContent = n === 1 ? ' earlier line' : ' earlier lines';
  }

  function playCue(node, st, name) {
    var gen = ++st.cueGen;
    ['done', 'fail', 'stop', 'ask', 'start'].forEach(function (c) { node.classList.remove('pmt-card-cue-' + c); });
    void node.offsetWidth;
    node.classList.add('pmt-card-cue-' + name);
    settled([node], function () { if (st.cueGen === gen) node.classList.remove('pmt-card-cue-' + name); });
  }

  /* the old status word leaves as the new one arrives (an odometer in most looks; a print in Retro and NieR), and the
     status slides to its new width so the rest of the line moves once, smoothly */
  function rollWord(p, oldWord, oldWidth, oldInk) {
    Array.prototype.slice.call(p.status.querySelectorAll('.pmt-card-sw-old')).forEach(function (g) { g.parentNode.removeChild(g); });
    var ghost = el('span', 'pmt-card-sw pmt-card-sw-old', oldWord);
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.color = oldInk;            /* the old word leaves in its own ink */
    p.status.insertBefore(ghost, p.word);
    play(p.word, 'pmt-card-sw-in');
    settled([ghost], function () { if (ghost.parentNode) ghost.parentNode.removeChild(ghost); });
    widen(p.status, oldWidth);
  }
  /* a box in the meta line slides from `from` px wide to its own width (or `to`), so the words after it move once,
     smoothly; from or to 0 it also takes back the line's gap, and clips what is outside it */
  function widen(e, from, to, then) {
    var gen = e._pmtW = (e._pmtW || 0) + 1, s = e.style;
    e.classList.remove('pmt-card-widening');
    s.width = ''; s.marginLeft = '';
    var w = to != null ? to : e.getBoundingClientRect().width;
    function end() {
      if (e._pmtW !== gen) return;
      e.classList.remove('pmt-card-widening', 'pmt-card-clip');
      s.width = ''; s.marginLeft = '';
      if (then) then();
    }
    if (Math.abs(w - from) < 0.5) { end(); return; }
    e.classList.add('pmt-card-clip');
    s.width = from + 'px';
    if (!from) s.marginLeft = '-6px';
    void e.offsetWidth;
    e.classList.add('pmt-card-widening');
    s.width = w + 'px';
    s.marginLeft = w ? '' : '-6px';
    var moving = e.getAnimations().some(function (a) { return a.transitionProperty === 'width'; });
    if (!moving) { end(); return; }
    settled([e], end);
  }
  function unfoldWidth(e) {
    e._pmtFold = false;
    e._pmtW = (e._pmtW || 0) + 1;
    e.classList.remove('pmt-card-widening', 'pmt-card-clip');
    e.style.width = ''; e.style.marginLeft = '';
  }

  /* the window moves the way the terminal's screen does: rows that arrived push the old ones up through the fade at
     the top; the disclosure grows or shrinks the window from its last row */
  function slide(node, st, plan, fromH, old, collapsing, toggle) {
    var p = st.parts, sc = p.lines, rows = p.rows;
    var first = rows.firstElementChild;
    var rowH = first ? first.getBoundingClientRect().height : 17;
    var toH = sc.getBoundingClientRect().height;
    var y0 = 0, y1 = 0, k = plan.k || 0, e = plan.e || 0;
    var ghosts = [];
    if (plan.k != null) {
      /* the rows below the old ones come in */
      var arrived = st.view.rows.length - (old.length - k), kids = rows.children;
      for (var j = Math.max(0, kids.length - arrived); j < kids.length; j++) play(kids[j], 'pmt-card-line-in');
      /* the rows that leave stay above the new ones until they have scrolled out through the fade */
      for (var i = 0; i < k; i++) {
        var g = rowNode(old[i] || { t: '' });
        g.setAttribute('aria-hidden', 'true');
        g.classList.add('pmt-card-line-ghost');
        rows.insertBefore(g, rows.children[i] || null);
        ghosts.push(g);
      }
      y1 = -k * rowH;
    } else if (e) {
      y0 = -e * rowH;
    }
    var gen = st.slideGen = (st.slideGen || 0) + 1;
    var cls = toggle ? 'pmt-card-resizing' : 'pmt-card-scrolling';
    node.classList.remove('pmt-card-resizing', 'pmt-card-scrolling');
    /* the rows move by their top margin, not a transform: a margin is laid out in the same frame as the window's
       height, so the last row stays on the bottom edge even when the page is busy (a transform runs on the
       compositor and drifts from a height animated on the main thread) */
    sc.style.height = fromH + 'px';
    rows.style.marginTop = y0 + 'px';
    void sc.offsetHeight;
    node.classList.add(cls);
    sc.style.height = toH + 'px';
    rows.style.marginTop = y1 + 'px';
    st.sliding = function () {
      if (st.slideGen !== gen) return;
      st.slideGen++;
      st.sliding = null;
      node.classList.remove(cls);
      ghosts.forEach(function (g) { if (g.parentNode) g.parentNode.removeChild(g); });
      sc.style.height = ''; rows.style.marginTop = '';
      if (collapsing) finishCollapse(node, st);
      edges(sc);
    };
    var moving = sc.getAnimations().concat(rows.getAnimations()).some(function (a) { return !!a.transitionProperty; });
    if (!moving) { st.sliding(); return; }
    settled([sc, rows], function () { if (st.sliding && st.slideGen === gen) st.sliding(); });
  }
  /* a fold that a newer paint overtakes stops where it is and lets the newer paint decide */
  function unfold(e) {
    e._pmtFold = false;
    e._pmtMorph = (e._pmtMorph || 0) + 1;
    e.classList.remove('pmt-card-sizing');
    e.style.height = ''; e.style.overflow = '';
  }
  function cancelSlide(st) { if (st.sliding) st.sliding(); }
  /* the collapse is over: the head goes back to one line and the folder's short name */
  function finishCollapse(node, st) {
    var sp = st.spec;
    if (sp.expanded) return;
    var p = st.parts, h = p.title.getBoundingClientRect().height;
    node.setAttribute('data-pmt-expanded', 'false');
    p.cwd.textContent = folderOf(sp.cwd);
    var win = windowOf(sp, GLYPH.hasOwnProperty(sp.status) ? sp.status : 'running', false);
    var showFail = !!win.failLine && win.shown.indexOf(win.failLine) < 0, failWas = !p.fail.hidden;
    applyFail(p, showFail ? win.failLine : '');
    if (showFail && !failWas) play(p.fail, 'pmt-card-in');
    var after = p.title.getBoundingClientRect().height;
    if (Math.abs(after - h) >= 0.5) morph(p.title, h);
  }
  function applyFail(p, text) {
    p.fail.hidden = !text;
    /* hiding keeps the words, so a line that folds away is still there while its room closes */
    if (text && p.fail._pmtText !== text) { p.fail._pmtText = text; breakable(p.fail, text); }
    if (text) p.fail.setAttribute('data-pm-hover-label', text); else p.fail.removeAttribute('data-pm-hover-label');
  }

  /* keyboard focus marks the card (Retro's reverse-video head, NieR's target brackets); a pointer press does not */
  function focusIn(e) {
    var node = e.currentTarget, t = e.target, vis = true;
    try { vis = t.matches(':focus-visible'); } catch (x) { vis = true; }
    node.setAttribute('data-pmt-focus', vis ? 'key' : 'pointer');
  }
  function focusOut(e) {
    var node = e.currentTarget;
    if (!e.relatedTarget || !node.contains(e.relatedTarget)) node.removeAttribute('data-pmt-focus');
  }

  function onClick(e) {
    var node = e.currentTarget, st = stateOf(node);
    if (!st) return;
    var b = e.target && e.target.closest ? e.target.closest('[data-pmt-act]') : null;
    if (!b || !node.contains(b) || b.hidden) return;
    var key = b.getAttribute('data-pmt-act'), sp = st.spec;
    if (key === 'toggle') {
      sp.expanded = !sp.expanded;
      paintWith(node, st, { toggle: true });
      if (typeof sp.onToggle === 'function') sp.onToggle(!!sp.expanded, sp, node);
      return;
    }
    var fn = key === 'open' ? sp.onOpen : key === 'rerun' ? sp.onRerun : key === 'view' ? sp.onViewOutput : null;
    if (typeof fn === 'function') fn(sp, node, e);
  }

  /* every paint goes through here, so the window knows the rows it showed before (the ones a scroll pushes out) */
  function paintWith(node, st, opts) {
    st.leaving = st.view ? st.view.rows : [];
    paint(node, st, opts);
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
      var st = { spec: merge({}, spec), parts: b.parts, glyph: null, seen: false, orphanTicks: 0, elapsedAt: Date.now(),
        view: null, rowsSig: null, rowsAt: 0, cueGen: 0, sliding: null };
      setState(b.root, st);
      b.root.addEventListener('click', onClick);
      b.root.addEventListener('focusin', focusIn);
      b.root.addEventListener('focusout', focusOut);
      b.parts.lines.addEventListener('scroll', function () { edges(b.parts.lines); }, { passive: true });
      paintWith(b.root, st, null);
      return b.root;
    },
    update: function (node, spec) {
      var st = node && stateOf(node);
      if (!st) return node;
      if (spec && ('elapsedMs' in spec || 'status' in spec)) st.elapsedAt = Date.now();
      merge(st.spec, spec);
      paintWith(node, st, spec && 'expanded' in spec && Object.keys(spec).length === 1 ? { toggle: true } : null);
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
