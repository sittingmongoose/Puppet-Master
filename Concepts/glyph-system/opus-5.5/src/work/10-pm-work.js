/* src/work/10-pm-work.js: the work projection, window.PM_WORK (W6, DR-078, DL-246, SIR-054). OWNER: pm7-found (PM7
 * build, 2026-10-29).
 *
 * One projection every surface reads, never one registry per surface: the status bar's agents and processes counts,
 * the project box's badge (B5), the tray face (A3), the composer dock, the chat's Processes domain and the Agents,
 * Processes and Resources panel are all filters of PM_WORK. In canon it is OperationalAwarenessProjection over
 * ObservableWork (Plans/Shared_Integration_Runtime.md §8.2, §9.2); ProcessFacts stays subordinate, and a resource sample
 * carries its server and environment. Here it is fixture-backed: src/work/20-fixture.js (lane activity's file) defines
 * the scenarios, and a public API switches them (PM_WORK.scenario(name), the Demo Studio's Activity section).
 *
 * An item (one agent, process, scheduled run or system service):
 *   id, kind agent|process|scheduled|service, role (main|subagent|server|script|test|watcher|build|browser|db|lsp|mcp|
 *   index), title, detail, model, project (the shell's data-project id), surface (assistant|orchestrator|wizard|prd|
 *   scout|system), where, thread, owner (agent id or null for the thread's own agent), parent (agent id),
 *   state (one of the 22 catalog keys, never a new one), word (an override), stopping and restarting (written here),
 *   stoppedBy, ask,
 *   quick[], askedAt, startedAt, endedAt, exit, at (scheduled), queuePos, progress {done,total,unit,source} or null
 *   (never invented), delivery agent|user|quiet, waits, tail[], lines, command, cwd, pid, ports[], cpu, mem,
 *   server, environment, lost (with state warning).
 * Items are live objects: read them, never write them. Every change goes through an action below and is announced.
 *
 * The status key to draw is key(it), not it.state: a stopping item shows pending with the word Stopping (G5, A5).
 * Words (word(it)) are the concept's (rw-data.js), checked against IDS.md's A5 table.
 *
 * API (full reference: the build share's lanes/found/API.md)
 *   read     items(filter?) filter {project, thread, surface, kind, view}; item(id); counts(scope?); project(id, {unsaved});
 *            thread(id); tray(); feed(); servers(project?); key(it), word(it), tone(it), rank(it), sort(list), time(it),
 *            isLive, isDone, needsYou, isQuestion, needsInput, owner(it), children(id), descendants(id)
 *   events   on(type, cb) -> off; types 'change' (cb(why)) and 'sample'; subscribe(cb) = on('change', cb);
 *            window event 'pm7.work.changed' {detail: {why}}
 *   actions  dispatch(commandId, args) for cmd.work.stop | restart | send_input | set_completion_delivery |
 *            clear_finished | quit; or stop(args), stopTargets(args), restart(id), sendInput(id, reply) (a
 *            process's plain yes/no prompt only; canSendInput(it)), answer(id, text) (an agent's question),
 *            setCompletionDelivery(id, v), clearFinished(viewId, pred?), showFinished(viewId), quit(args), quitTargets(),
 *            seen() (the person has looked: older failures leave the tray)
 *   sampling sample(cb, {project}) -> stop(): CPU, memory and ports move only while a sampler is open (D12)
 *   fixture  scenario() / scenario(name), SCENARIOS, fixture.define(name, build), fixture.tick(fn) */
(function () {
  'use strict';
  const W = window, D = document;
  if (W.PM_WORK) return;

  /* ------------------------------------------------------------ words, tones, ranks (rw-data.js, A5) */
  const KEYS = Object.freeze(['waiting', 'blocked', 'failed', 'warning', 'offline', 'recovering', 'reviewing', 'working', 'waiting-dep',
    'pending', 'mixed', 'complete', 'paused', 'skipped', 'off', 'idle', 'info', 'change-added', 'change-modified', 'change-deleted',
    'change-conflict', 'change-renamed']);
  const WORD = {
    waiting: 'Needs you', blocked: 'Blocked', failed: 'Failed', warning: 'Lost', recovering: 'Retrying', reviewing: 'Checking',
    working: 'Running', 'waiting-dep': 'Waiting', pending: 'Queued', complete: 'Done', skipped: 'Stopped', paused: 'Paused',
    idle: 'Idle', off: 'Off', offline: 'Offline'
  };
  const TONE = {
    waiting: 'attention', blocked: 'blocked', failed: 'blocked', warning: 'attention', recovering: 'attention', reviewing: 'working',
    working: 'working', 'waiting-dep': 'attention', pending: 'idle', complete: 'done', skipped: 'idle', paused: 'paused', idle: 'idle',
    off: 'paused', offline: 'attention'
  };
  /* needs-you leads every list (F3-658); F3-477: blocked > running > queued > completed */
  const RANK = { waiting: 0, blocked: 1, failed: 2, warning: 3, offline: 3, recovering: 4, working: 5, reviewing: 5, 'waiting-dep': 6,
    pending: 7, paused: 8, idle: 9, complete: 10, skipped: 11, off: 12 };
  const LIVE = /^(waiting|blocked|recovering|working|reviewing|waiting-dep)$/;
  const DONE = /^(complete|failed|skipped|warning)$/;

  const isLive = (it) => !!it && (!!it.stopping || LIVE.test(it.state));
  const isDone = (it) => !!it && !it.stopping && DONE.test(it.state);
  const needsYou = (it) => !!it && it.state === 'waiting' && !it.stopping;
  const isQuestion = (it) => needsYou(it) && it.kind === 'agent';
  const needsInput = (it) => needsYou(it) && it.kind !== 'agent';
  const key = (it) => (it.stopping ? 'pending' : KEYS.indexOf(it.state) >= 0 ? it.state : 'idle');
  function word(it) {
    if (it.stopping) return it.restarting ? 'Restarting' : 'Stopping';
    if (it.word) return it.word;
    // an agent waiting on you has a question; a process waiting on you needs input (the terminal's own word)
    if (it.state === 'waiting' && it.kind !== 'agent') return 'Needs input';
    if (it.kind === 'scheduled' && it.state === 'pending') return 'Scheduled';
    return WORD[it.state] || it.state;
  }
  const tone = (it) => (it.stopping ? 'idle' : TONE[it.state] || 'idle');
  const rank = (it) => (it.stopping ? 6 : RANK[it.state] == null ? 9 : RANK[it.state]);
  function sort(list) {
    return list.slice().sort((a, b) => {
      const r = rank(a) - rank(b);
      if (r) return r;
      if (isDone(a) && isDone(b)) return (b.endedAt || 0) - (a.endedAt || 0);
      return (b.startedAt || 0) - (a.startedAt || 0);
    });
  }
  function short(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    if (s < 60) return s + 's';
    const m = Math.floor(s / 60);
    return m < 60 ? m + 'm' : Math.floor(m / 60) + 'h ' + (m % 60) + 'm';
  }
  function dur(ms) {
    let s = Math.max(0, Math.round(ms / 1000));
    if (s < 60) return s + 's';
    let m = Math.floor(s / 60); s %= 60;
    if (m < 60) return m + 'm ' + (s < 10 ? '0' : '') + s + 's';
    const h = Math.floor(m / 60); m %= 60;
    return h + 'h ' + (m < 10 ? '0' : '') + m + 'm';
  }
  function time(it) {
    const n = Date.now();
    if (it.kind === 'scheduled' && it.at) return it.at > n ? 'in ' + short(it.at - n) : 'now';
    if (needsYou(it)) return 'waiting ' + short(n - (it.askedAt || it.startedAt || n));
    if (isDone(it)) return short(n - (it.endedAt || n)) + ' ago';
    if (it.state === 'pending' && it.queuePos) return 'position ' + it.queuePos;
    return dur(n - (it.startedAt || n));
  }

  /* ------------------------------------------------------------------- state */
  const S = { scenario: 'busy', loaded: null, items: [], servers: [], feed: { state: 'current', at: 0 }, restarted: null, seenAt: 0 };
  const builders = Object.create(null), ticks = [], views = Object.create(null);
  const SCENARIOS = [];
  const subs = { change: new Set(), sample: new Set() };

  function emit(why) {
    subs.change.forEach((fn) => { try { fn(why || 'change'); } catch (e) { console.error(e); } });
    try { W.dispatchEvent(new CustomEvent('pm7.work.changed', { detail: { why: why || 'change' } })); } catch (_) { /* old engines */ }
  }
  function on(type, fn) {
    const set = subs[type];
    if (!set || typeof fn !== 'function') return () => {};
    set.add(fn);
    return () => set.delete(fn);
  }

  function load(name) {
    const b = builders[name];
    if (!b) { S.scenario = name; return false; }
    let r;
    try { r = b() || {}; } catch (e) { console.error(e); r = {}; }
    S.scenario = name; S.loaded = name;
    S.items = Array.isArray(r.items) ? r.items : [];
    S.servers = Array.isArray(r.servers) ? r.servers : [];
    S.feed = r.feed && r.feed.state === 'stale' ? { state: 'stale', at: r.feed.at || Date.now() } : { state: 'current', at: Date.now() };
    S.restarted = r.restarted ? { at: r.restarted.at || Date.now(), lost: r.restarted.lost || 0 } : null;
    S.seenAt = 0;
    Object.keys(views).forEach((v) => { delete views[v]; });
    pending.forEach((t) => clearTimeout(t)); pending.clear();
    startTick();
    emit('scenario');
    return true;
  }
  const ensure = () => { if (S.loaded == null && builders[S.scenario]) load(S.scenario); };
  const all = () => { ensure(); return S.items; };
  function item(id) { const l = all(); for (let i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function match(it, f) {
    if (!f) return true;
    if (f.project != null && it.project !== f.project) return false;
    if (f.thread != null && it.thread !== f.thread) return false;
    if (f.surface != null && it.surface !== f.surface) return false;
    if (f.kind != null && (Array.isArray(f.kind) ? f.kind.indexOf(it.kind) < 0 : it.kind !== f.kind)) return false;
    if (f.view != null && views[f.view] && views[f.view].has(it.id)) return false;
    return true;
  }
  const items = (f) => all().filter((it) => match(it, f));
  const children = (id) => all().filter((x) => x.parent === id || x.owner === id);
  function descendants(id) {
    const out = [], seen = new Set([id]);
    for (let q = [id]; q.length;) {
      const cur = q.shift();
      children(cur).forEach((x) => { if (!seen.has(x.id)) { seen.add(x.id); out.push(x); q.push(x.id); } });
    }
    return out;
  }
  const owner = (it) => (it && (it.owner || it.parent) ? item(it.owner || it.parent) : null);

  /* ------------------------------------------------------------------ counts */
  function counts(scope) {
    const c = { agents: 0, questions: 0, processes: 0, needsInput: 0, stopping: 0, blocked: 0, failed: 0, scheduled: 0, finished: 0, services: 0,
      stale: S.feed.state === 'stale', restarted: !!S.restarted };
    items(scope).forEach((x) => {
      if (x.kind === 'service') { if (isLive(x)) c.services++; return; }
      if (x.stopping) c.stopping++;
      if (isQuestion(x)) c.questions++;
      if (needsInput(x)) c.needsInput++;
      if (x.state === 'blocked' && !x.stopping) c.blocked++;
      if (x.kind === 'scheduled' && x.state === 'pending') c.scheduled++;
      if (isDone(x)) { c.finished++; if (x.state === 'failed') c.failed++; }
      if (isLive(x)) { if (x.kind === 'agent') c.agents++; else c.processes++; }
    });
    return c;
  }
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);

  /* B5, the project box: needs you > blocked > working > unsaved > calm. Unsaved changes are shell state the box passes
     in ({ unsaved: true }), so the order lives here once. A stale feed keeps its last known state (never a healthy zero). */
  const B5 = ['waiting', 'blocked', 'working', 'change-modified'];
  function project(id, opts) {
    const c = counts({ project: id }), keys = [];
    if (c.questions + c.needsInput) keys.push('waiting');
    if (c.blocked) keys.push('blocked');
    if (c.agents + c.processes > 0) keys.push('working');   // stopping work stays outstanding until it ends (G5)
    if (opts && opts.unsaved) keys.push('change-modified');
    const k = B5.find((x) => keys.indexOf(x) >= 0) || 'idle';
    let say = '';
    if (k === 'waiting') { const n = c.questions + c.needsInput; say = n === 1 ? '1 item needs you' : n + ' items need you'; }
    else if (k === 'blocked') say = c.blocked === 1 ? '1 item is blocked' : c.blocked + ' items are blocked';
    else if (k === 'working') {
      const p = [], run = c.agents + c.processes - c.stopping;
      if (run > 0) {
        const pa = items({ project: id }).filter((x) => x.kind === 'agent' && isLive(x) && !x.stopping).length;
        if (pa) p.push(plural(pa, 'agent', 'agents'));
        if (run - pa) p.push(plural(run - pa, 'process', 'processes'));
        say = p.join(' and ') + ' running' + (c.stopping ? ', ' + c.stopping + ' stopping' : '');
      } else {
        const rs = items({ project: id }).filter((x) => x.stopping && x.restarting).length;
        say = rs === c.stopping ? plural(rs, 'item', 'items') + ' restarting' : plural(c.stopping, 'item', 'items') + ' stopping';
      }
    } else if (k === 'change-modified') say = 'Unsaved changes';
    return { key: k, keys, say, counts: c, stale: c.stale };
  }
  /* the composer dock and the chat's Processes domain: one thread */
  function thread(id) {
    const c = counts({ thread: id });
    const k = c.questions + c.needsInput ? 'waiting' : c.blocked ? 'blocked' : c.agents + c.processes ? 'working' : 'idle';
    return { key: k, counts: c, processes: c.processes + c.needsInput > 0 || items({ thread: id, kind: 'process' }).some(isLive) };
  }

  /* A3, the tray: one face summed over every Project, through the kit's one reducer (PMLogo.trayFace: waiting >
     failed > blocked > working > paused > complete ~10 s > idle; stopping work is outstanding). Failures count until
     the person has looked (seen()). System services never move the tray. */
  const KT = W.PMLogo && W.PMLogo.TRAY;
  const TRAY_ORDER = KT ? KT.order : ['waiting', 'failed', 'blocked', 'working', 'paused', 'complete', 'idle'];
  const TRAY_FACE = KT ? KT.faces : { waiting: 'alert', failed: 'error', blocked: 'oops', working: 'working', paused: 'sleep', complete: 'happy', idle: 'idle' };
  const COMPLETE_MS = KT ? KT.completeMs : 10000;
  function tray() {
    const list = all().filter((x) => x.kind !== 'service').map((x) => ({ key: x.state, at: x.endedAt, stopping: !!x.stopping, seen: x.state === 'failed' && (x.endedAt || 0) <= S.seenAt }));
    const r = W.PMLogo && typeof W.PMLogo.trayFace === 'function' ? W.PMLogo.trayFace(list) : { key: 'idle', counts: {} };
    const k = r.key, n = r.counts[k] || 0;
    const say = k === 'waiting' ? (n === 1 ? '1 item needs you' : n + ' items need you')
      : k === 'failed' ? (n === 1 ? '1 run failed' : n + ' runs failed')
      : k === 'blocked' ? (n === 1 ? '1 item is blocked' : n + ' items are blocked')
      : k === 'working' ? plural(n, 'item', 'items') + ' running'
      : k === 'paused' ? 'Paused' : k === 'complete' ? 'Done' : 'Ready';
    return { key: k, mood: TRAY_FACE[k], say, stale: S.feed.state === 'stale' };
  }
  const feed = () => { ensure(); return { state: S.feed.state, at: S.feed.at, restarted: S.restarted ? Object.assign({}, S.restarted) : null }; };
  const servers = (pid) => { ensure(); return S.servers.filter((s) => pid == null || s.project == null || s.project === pid); };

  /* ----------------------------------------------------------------- actions */
  const pending = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { pending.delete(t); fn(); }, ms); pending.add(t); };
  // live work, and what waits to start (a queued agent, a scheduled run); system services are never stopped here (D11)
  const stoppable = (x) => x.kind !== 'service' && !x.stopping && (isLive(x) || x.state === 'pending' || x.state === 'paused');
  /* what a stop would end: the item and what it started (D8), a thread, or the platform (optionally one Project); a
     reviewed target list (Stop all, the quit dialog) narrows it */
  function stopTargets(a) {
    a = a || {};
    let list;
    if (a.scope === 'thread') list = items({ thread: a.thread, project: a.project });
    else if (a.scope === 'platform') list = items(a.project != null ? { project: a.project } : null);
    else { const it = item(a.id); list = it ? [it].concat(descendants(it.id)) : []; }
    list = list.filter(stoppable);
    if (Array.isArray(a.targets)) { const t = new Set(a.targets); list = list.filter((x) => t.has(x.id)); }
    return list.map((x) => x.id);
  }
  /* SIGTERM to the whole process group, then SIGKILL after 3 s if it still runs (D8). Servers, databases and watchers
     take the full grace here; scripts end on the SIGTERM. */
  const GRACE_MS = 3000;
  function stop(a) {
    const ids = stopTargets(a), by = (a && a.by) || 'you';
    if (!ids.length) return [];
    ids.forEach((id) => {
      const it = item(id);
      if (it.kind === 'scheduled' || it.state === 'pending') { it.state = 'skipped'; it.word = 'Cancelled'; it.endedAt = Date.now(); it.stoppedBy = by; return; }
      it.stopping = true;
      const killed = /^(server|db|watcher)$/.test(it.role || '');
      later(() => {
        it.stopping = false; it.state = 'skipped'; it.word = 'Stopped'; it.stoppedBy = by; it.endedAt = Date.now();
        it.ask = null; it.quick = null;
        if (it.tail) it.tail.push('^C  (stopped by ' + by + ': SIGTERM' + (killed ? ', then SIGKILL after 3 s' : '') + ')');
        emit('stopped');
      }, it.kind === 'agent' ? 1200 : killed ? GRACE_MS : 1200);
    });
    emit('stop');
    return ids;
  }
  const canRestart = (it) => !!it && it.kind === 'process' && !it.stopping;
  function restart(id) {
    const it = item(id);
    if (!canRestart(it)) return false;
    it.stopping = true; it.restarting = true; emit('restart');
    later(() => {
      it.stopping = false; it.restarting = false; it.state = 'working'; it.word = null; it.exit = null; it.endedAt = null; it.lost = null;
      it.startedAt = Date.now(); it.pid = (it.pid || 40000) + 7; it.ask = null; it.quick = null;
      if (it.tail) it.tail = it.tail.slice(0, 2);
      emit('restarted');
    }, 1200);
    return true;
  }
  /* D13: only a process's plain yes/no prompt takes a quick answer (its quick choices, safe answer first, every one a
     yes or a no); any other prompt keeps waiting for Answer in Terminal. Services are read-only (D11). An agent's
     question is answered in its thread (answer()), never through process input. */
  const YES_NO = /^(yes|no|y|n)$/i;
  const canSendInput = (it) => !!it && it.kind === 'process' && needsYou(it) && Array.isArray(it.quick) && it.quick.length > 0 && it.quick.every((q) => YES_NO.test(String(q)));
  function sendInput(id, reply) {
    const it = item(id);
    if (!canSendInput(it) || it.quick.indexOf(reply) < 0) return false;
    it.state = 'working'; it.ask = null; it.quick = null; it.word = null; it.askedAt = null;
    if (it.tail) it.tail.push('> ' + reply);
    emit('answer');
    // the fixture's prompt finishes a moment after its answer
    later(() => {
      if (it.state !== 'working' || it.stopping) return;
      it.state = 'complete'; it.exit = 0; it.endedAt = Date.now();
      if (it.tail) it.tail.push(/^n/i.test(reply) ? 'Skipped. Dry run finished: 1 applied, 1 skipped.' : 'Dry run finished: 2 applied.');
      emit('done'); trayLater();
    }, 2600);
    return true;
  }
  /* an agent's question, answered (the fixture's stand-in for the reply sent in its thread) */
  function answer(id, text) {
    const it = item(id);
    if (!it || it.kind !== 'agent' || !needsYou(it) || !String(text || '').trim()) return false;
    it.state = 'working'; it.ask = null; it.quick = null; it.word = null; it.askedAt = null;
    emit('answer');
    return true;
  }
  /* D9: agent (tell the agent), user (notify me), quiet */
  function setCompletionDelivery(id, v) {
    const it = item(id);
    if (!it || ['agent', 'user', 'quiet'].indexOf(v) < 0) return false;
    it.delivery = v; emit('delivery');
    return true;
  }
  /* G6: view-local. Clearing hides finished rows (never agents) from that view; no record is deleted. */
  function clearFinished(viewId, pred) {
    const v = String(viewId || 'default'), set = views[v] || (views[v] = new Set());
    all().forEach((x) => { if (isDone(x) && x.kind !== 'agent' && (!pred || pred(x))) set.add(x.id); });
    emit('clear');
    return set.size;
  }
  function showFinished(viewId) { delete views[String(viewId || 'default')]; emit('clear'); }
  /* D10: the server owns the work; keep_running is the default and stops nothing */
  const quitTargets = () => stopTargets({ scope: 'platform' });
  function quit(a) {
    const choice = a && a.choice === 'stop_selected' ? 'stop_selected' : 'keep_running';
    const stopped = choice === 'stop_selected' ? stop({ scope: 'platform', targets: a.targets, by: 'quitting' }) : [];
    emit('quit');
    return { choice, stopped };
  }
  function seen() { S.seenAt = Date.now(); emit('seen'); }
  /* the tray's complete face lasts about 10 s; say so when it ends */
  function trayLater() { later(() => emit('tray'), COMPLETE_MS + 50); }

  const COMMANDS = {
    'cmd.work.stop': (a) => stop(a),
    'cmd.work.restart': (a) => restart(a && a.id),
    'cmd.work.send_input': (a) => sendInput(a && a.id, a && a.reply),
    'cmd.work.set_completion_delivery': (a) => setCompletionDelivery(a && a.id, a && a.delivery),
    'cmd.work.clear_finished': (a) => clearFinished(a && a.view, a && a.pred),
    'cmd.work.quit': (a) => quit(a)
  };
  function dispatch(id, args) {
    const fn = COMMANDS[id];
    if (!fn) throw new Error('PM_WORK: no command ' + id);
    return fn(args || {});
  }

  /* --------------------------------------------- the live tick and sampling */
  const DRAG = ['pm-resizing', 'pm-ab-dragging', 'pmw-dragging', 'pmu-pointer-op', 'pm7u-pointer-op'];
  const resting = () => D.hidden || (D.body && DRAG.some((c) => D.body.classList.contains(c)));
  let tickTimer = 0;
  function startTick() {
    if (tickTimer || !ticks.length) return;
    tickTimer = setInterval(() => {
      if (resting() || !S.items.length) return;
      let changed = false;
      const before = S.items.filter((x) => x.state === 'complete').length;
      ticks.forEach((fn) => { try { if (fn(S.items)) changed = true; } catch (e) { console.error(e); } });
      if (changed) {
        if (S.items.filter((x) => x.state === 'complete').length > before) trayLater();
        emit('tick');
      }
    }, 1000);
  }
  /* D12: CPU, memory and ports are sampled only while a consumer (the Resources tab) has a sampler open */
  const samplers = new Set();
  let sampleTimer = 0;
  function snapshot(pid) {
    const list = items(pid != null ? { project: pid } : null).filter((x) => x.kind !== 'agent' && x.kind !== 'scheduled');
    return {
      at: Date.now(),
      servers: servers(pid).map((sv) => {
        const mine = list.filter((x) => x.server === sv.id);
        const envs = (sv.environments || []).map((e) => {
          const m = mine.filter((x) => x.environment === e.id), lv = m.filter(isLive);
          return { id: e.id, name: e.name, cpu: lv.reduce((s, x) => s + (x.cpu || 0), 0), mem: lv.reduce((s, x) => s + (x.mem || 0), 0),
            ports: lv.reduce((p, x) => p.concat(x.ports || []), []), items: m.map((x) => x.id) };
        });
        return { id: sv.id, name: sv.name, kind: sv.kind, host: sv.host, cpu: envs.reduce((s, e) => s + e.cpu, 0), mem: envs.reduce((s, e) => s + e.mem, 0), environments: envs };
      })
    };
  }
  function sampleOnce() {
    if (resting()) return;
    S.items.forEach((x) => {
      if (x.kind === 'agent' || x.kind === 'scheduled') return;
      if (!isLive(x)) { x.cpu = 0; return; }
      x.cpu = Math.max(0, Math.round((x.cpu || 0) + (Math.random() - 0.5) * 6));
      x.mem = Math.max(1, Math.round((x.mem || 0) * (1 + (Math.random() - 0.5) * 0.02)));
    });
    samplers.forEach((s) => { try { s.cb(snapshot(s.project)); } catch (e) { console.error(e); } });
    subs.sample.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
  }
  function sample(cb, o) {
    const s = { cb: typeof cb === 'function' ? cb : () => {}, project: o && o.project != null ? o.project : null };
    samplers.add(s);
    ensure();
    try { s.cb(snapshot(s.project)); } catch (e) { console.error(e); }
    if (!sampleTimer) sampleTimer = setInterval(sampleOnce, 1000);
    return () => {
      samplers.delete(s);
      if (!samplers.size && sampleTimer) { clearInterval(sampleTimer); sampleTimer = 0; }
    };
  }

  /* ----------------------------------------------------------------- fixture */
  const fixture = {
    define(name, build) {
      if (typeof build !== 'function') return;
      if (!builders[name]) SCENARIOS.push(name);
      builders[name] = build;
      if (S.loaded == null && name === S.scenario) load(name);
    },
    tick(fn) { if (typeof fn === 'function') { ticks.push(fn); if (S.loaded != null) startTick(); } }
  };
  function scenario(name) {
    if (name == null) return S.scenario;
    return load(String(name));
  }

  W.PM_WORK = {
    version: 1,
    KEYS, WORD, TRAY_ORDER, TRAY_FACE, SCENARIOS, GRACE_MS,
    items, item, counts, project, thread, tray, feed, servers,
    key, word, tone, rank, sort, time, dur, short, isLive, isDone, needsYou, isQuestion, needsInput, owner, children, descendants, canRestart, canSendInput,
    on, subscribe: (fn) => on('change', fn),
    dispatch, stop, stopTargets, restart, sendInput, answer, setCompletionDelivery, clearFinished, showFinished, quit, quitTargets, seen,
    sample, scenario, fixture
  };
})();
