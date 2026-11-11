/* Projects concepts (Opus 5.5), fix pass 2026-11-10: where work runs, window.PJX.work.

   Jared 2026-11-09 (#12): "I think it should default to auto." The Plans change on plans/where-work-runs-20261109 makes it
   canon (SIR-056, F3-668, F3-664, SRV-006, SSYS-059): a Project has one records home and a separate default Computer; new
   work requests Auto by default and goes, task by task, to the best Computer the person allowed; a person's choice
   ("Chosen: Studio Mac by Jared") wins over Auto; the default Computer only breaks ties. The page never says "<Project>
   works on <one Computer>": it names the records home, the work choice, the default Computer and the Computers working now,
   and every work row says "Auto → Home NAS" or "Chosen: Studio Mac by Jared" with "Why this computer".

   The concept draws the choice and its reasons; the numbers are demo observations. Auto's preset (Balanced, Fastest, Keep
   my computer free) and each Computer's level (Prefer, Normal, Less often, Only when I choose it) are Settings rows
   (SSYS-059): this page links to them and never builds them.

     PJX.work.policy(p)            { mode: 'auto'|'chosen', by, def, allowed[] }
     PJX.work.facts(p)             the Project summary's rows (records home, work choice, default Computer, allowed, working now)
     PJX.work.rows(p)              the work rows, each with Why this computer
     PJX.work.why(p, worker)       the shared SIR-056 reasons and the Computers left out
     PJX.work.form(p, ip, redraw)  the in-place "Where work runs" form on the Project page
     PJX.work.npBlock(s)           New Project › Where it lives: the default work choice, default Computer and allowed set */
(function (W) {
  'use strict';
  const PJX = W.PJX;
  if (!PJX || PJX.work) return;
  const { h, ENV } = PJX;
  const w = (k, v) => PJX.w(k, v);
  const U = () => PJX.npui;
  const uniq = (a) => a.filter((x, i) => a.indexOf(x) === i);
  const comp = (id) => ENV.computers.find((c) => c.id === id) || null;
  const cname = (id) => (comp(id) || { name: id }).name;
  const andList = (a) => (a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);

  /* the demo's owner observations for each Computer (the governor's fresh readings; SIR-056 "actual resource numbers,
     floors, slots, queues and observation age") [Demo only] */
  const OBS = {
    here: { cpu: '3 of 10 cores free', mem: '7 GB free', memFloor: '4 GB', disk: '212 GB free', diskFloor: '20 GB', queue: '1 waiting', age: '8 s ago', inUse: true },
    homenas: { cpu: '3 of 4 cores free', mem: '14 GB free', memFloor: '4 GB', disk: '3.1 TB free', diskFloor: '50 GB', queue: 'nothing waiting', age: '12 s ago' },
    studio: { cpu: '1 of 8 cores free', mem: '9 GB free', memFloor: '6 GB', disk: '640 GB free', diskFloor: '20 GB', queue: '2 waiting', age: '5 s ago', busy: 'Rendering the recipe photos uses 7 of its 8 cores', gpu: 'Its one GPU slot is in use' }
  };
  /* each Computer's level (a Settings row of that Computer, SSYS-059): Auto never picks one at Only when I choose it */
  const LEVEL = { here: 'Normal', homenas: 'Normal', studio: 'Only when I choose it' };

  /* the Project's policy (SSYS-059, SIR-056): Auto or Chosen, and one default Computer with two roles. In Auto it breaks
     ties; in Chosen it is where new Project work goes. There is no second, Project-level chosen Computer: pinning one piece
     of work is a bounded run/task pin (operational state, not a Settings level), on the work itself */
  function policy(p) {
    const wk = p.work || {}, def = p.runsOn || 'here';
    return { mode: wk.mode === 'chosen' ? 'chosen' : 'auto', by: wk.by || null, def, allowed: uniq([def].concat(wk.allowed || [])) };
  }
  const choiceWord = (p) => { const k = policy(p); return k.mode === 'auto' ? w('wk.auto') : w('wk.chosenBy', { computer: cname(k.def), who: k.by || 'Jared' }); };
  const rowWord = (x) => (x.mode === 'chosen' ? w('wk.chosenBy', { computer: cname(x.c), who: x.by || 'Jared' }) : x.queued ? w('wk.autoQueued') : w('wk.autoTo', { computer: cname(x.c) }));
  /* where Auto would send new work right now: an allowed Computer Auto may pick (not Only when I choose it) with room, else
     the default Computer, which breaks the tie */
  function autoPick(p) {
    const k = policy(p);
    if (k.mode === 'chosen') return k.def;
    const ok = k.allowed.filter((c) => LEVEL[c] !== 'Only when I choose it');
    const free = ok.filter((c) => !(OBS[c] || {}).inUse && !(OBS[c] || {}).busy);
    return free[0] || (ok.indexOf(k.def) >= 0 ? k.def : ok[0]) || k.def;
  }
  /* a person's pin whose Computer the Project no longer allows: requested and effective differ, so it says so. Work that
     hasn't started waits with its reason and is never moved by itself; started work keeps its Computer (SIR-056, DL-473) */
  const stale = (p, x) => x.mode === 'chosen' && !x.project && !!x.c && policy(p).allowed.indexOf(x.c) < 0;
  const running = (p) => (p.workers || []).filter((x) => !x.queued).length;
  const workingNow = (p) => uniq((p.workers || []).filter((x) => !x.waiting && !x.queued).map((x) => x.c));
  const homeWord = (p) => { const c = comp(p.home || 'here'); return c ? (c.id === 'here' ? c.name + ' (' + c.short + ')' : c.name) : '—'; };

  /* the Project summary (F3-668): records home, default work choice, default Computer, allowed, the Computers working now */
  function facts(p) {
    const k = policy(p), now = workingNow(p), n = running(p), q = (p.workers || []).filter((x) => x.queued).length, wait = q ? w('wk.f.waiting', { n: q }) : '';
    return [
      { k: w('wk.f.home'), v: homeWord(p), tip: w('wk.f.homeTip') },
      { k: w('wk.f.choice'), v: choiceWord(p) },
      { k: w('wk.f.default'), v: cname(k.def) + ' · ' + (k.mode === 'auto' ? w('wk.f.tie') : w('wk.f.chosenHere')) },
      { k: w('wk.f.allowed'), v: andList(k.allowed.map(cname)) },
      { k: w('wk.f.now'), v: now.length ? andList(now.map(cname)) + ' · ' + w(n === 1 ? 'wk.f.task' : 'wk.f.tasks', { n }) + (wait ? ' · ' + wait : '') : wait ? w('wk.f.nothingYet') + ' · ' + wait : w('wk.f.none') }
    ];
  }

  /* each work item: what it is, where it runs and who chose it, and Why this computer */
  function rows(p, o) {
    o = o || {};
    const list = p.workers || [];
    if (!list.length) return null;
    const box = h('ul.pjx-wk-rows', { role: 'list', 'aria-label': w('wk.rows') });
    list.forEach((x, i) => {
      const words = rowWord(x);
      const b = h('button.pjx-link.pjx-wk-why', { type: 'button', 'data-c-key': 'wk:why:' + i, 'data-cmd': 'read:placement receipt (SIR-056)' }, w('wk.why'));
      b.addEventListener('click', () => why(p, x));
      // a run/task pin: only work that hasn't started moves; started work keeps its Computer (SIR-056)
      const pin = h('button.pjx-link.pjx-wk-pin', { type: 'button', 'data-c-key': 'wk:pin:' + i, 'aria-haspopup': 'menu', 'aria-disabled': x.queued ? null : 'true', 'data-cmd': 'cmd.execution_host.pin (bounded run/task pin)' }, w('wk.pin.run'));
      PJX.tip(pin, w('wk.pin.run'), x.queued ? w('wk.pin.runTip') : w('wk.pin.started', { computer: cname(x.c) }));
      pin.addEventListener('click', () => { if (x.queued) pinMenu(p, x, pin); });
      const st = stale(p, x), waits = st && x.queued;
      const wait = waits ? w('wk.stale.wait', { computer: cname(x.c), project: p.name }) : st ? w('wk.stale.keeps', { computer: cname(x.c) }) : x.waiting;
      // a waiting pin offers both ways on: another allowed Computer (Run this on…) or the Project's choice
      const follow = waits ? h('button.pjx-link.pjx-wk-follow', { type: 'button', 'data-c-key': 'wk:follow:' + i, 'data-cmd': 'cmd.execution_host.pin.clear' }, w('wk.stale.follow', { choice: choiceWord(p) })) : null;
      if (follow) follow.addEventListener('click', () => setPin(p, x, null));
      if (waits) b.textContent = w('wk.stale.whyBtn');
      box.appendChild(h('li.pjx-wk-row', { 'data-mode': x.mode, 'data-queued': x.queued ? '' : null, 'data-state': waits ? 'waiting' : st ? 'kept' : null },
        h('span.pjx-st-mark', { html: waits ? PJX.calm('waiting', 13) : x.queued ? PJX.calm('pending', 13) : PJX.mark(x.waiting ? 'pending' : 'working', 13), 'aria-hidden': 'true' }),
        h('span.pjx-wk-task', { text: x.task }),
        h('span.pjx-wk-where', null, h('span.pjx-wk-to', { text: words }), wait ? h('span.pjx-wk-wait', { text: ' · ' + wait }) : null),
        h('span.pjx-wk-acts', null, pin, follow, b)));
      void o;
    });
    return box;
  }

  /* Why this computer: the winning reasons with their numbers and age, the preset and policy version, and why each other
     Computer was left out or ranked lower (SIR-056; the same receipt the panel, rail, Home and Details read) */
  function why(p, x) {
    const k = policy(p), u = U();
    const fl = PJX.flow;
    const body = h('div.pjx-wk-whybody');
    let acts = null;
    if (stale(p, x) && x.queued) {
      // requested and effective differ: say both, and offer both ways on; nothing moves by itself
      body.appendChild(h('p.pjx-q-lead', { text: w('wk.why.staleLead', { who: x.by || 'Jared', computer: cname(x.c), project: p.name }) }));
      body.appendChild(fl.facts([{ key: 'waiting', text: w('wk.why.staleNow', { computer: cname(x.c) }) }, { key: 'info', text: w('wk.why.staleNever') },
        { key: 'info', text: w('wk.why.staleWays', { project: p.name, choice: choiceWord(p), computer: cname(x.c) }) }]));
      acts = [{ label: w('wk.stale.follow', { choice: choiceWord(p) }), cmd: 'cmd.execution_host.pin.clear', run: (d) => { d.close('follow'); setPin(p, x, null); } },
        { label: w('wk.stale.pinElse'), cmd: 'cmd.execution_host.pin', run: (d) => { d.close('pin'); setTimeout(() => { const a = W.document.querySelector('[data-plate="work"] [data-c-key="wk:pin:' + (p.workers || []).indexOf(x) + '"]'); if (a) pinMenu(p, x, a); }, 200); } }];
    } else if (x.mode === 'chosen' && x.project && !x.queued) {
      // (N3) work started under the Project's Chosen: the Computer it was sent to, and the choice in force then
      const then = x.at || w('wk.form.chosen', { computer: cname(x.c) }), now = choiceWord(p);
      body.appendChild(h('p.pjx-q-lead', { text: w('wk.why.projStarted', { computer: cname(x.c), project: p.name, choice: then }) }));
      body.appendChild(fl.facts([{ key: 'info', text: w('wk.why.pinWaits', { computer: cname(x.c) }) }, now !== then ? { key: 'info', text: w('wk.why.projNow', { project: p.name, choice: now }) } : null,
        k.allowed.indexOf(x.c) < 0 ? { key: 'info', text: w('wk.stale.keepsWhy', { computer: cname(x.c), project: p.name }) } : null].filter(Boolean)));
    } else if (x.mode === 'chosen' && x.project) {
      body.appendChild(h('p.pjx-q-lead', { text: w('wk.why.projQueued', { computer: cname(x.c), project: p.name, choice: choiceWord(p) }) }));
      body.appendChild(fl.facts([{ key: 'info', text: w('wk.why.pinWaits', { computer: cname(x.c) }) }, { key: 'info', text: w('wk.why.queuedPin') }]));
    } else if (x.mode === 'chosen') {
      body.appendChild(h('p.pjx-q-lead', { text: w('wk.why.chosenLead', { who: x.by || 'Jared', computer: cname(x.c), reason: x.why ? ' (' + x.why + ')' : '' }) }));
      body.appendChild(fl.facts([{ key: 'complete', text: w('wk.why.pinWins') }, { key: 'info', text: w('wk.why.pinWaits', { computer: cname(x.c) }) }, { key: 'info', text: w('wk.why.pinScope', { project: p.name, choice: choiceWord(p) }) },
        k.allowed.indexOf(x.c) < 0 ? { key: 'info', text: w('wk.stale.keepsWhy', { computer: cname(x.c), project: p.name }) } : null,
        LEVEL[x.c] === 'Only when I choose it' ? { key: 'info', text: w('wk.why.pinLevel', { computer: cname(x.c) }) } : null].filter(Boolean)));
    } else if (x.queued) {
      body.appendChild(h('p.pjx-q-lead', { text: w('wk.why.queuedLead', { project: p.name }) }));
      body.appendChild(fl.facts([{ key: 'info', text: w('wk.why.queuedNow', { computer: cname(autoPick(p)) }) }, { key: 'info', text: w('wk.why.queuedPin') }]));
    } else {
      const o = OBS[x.c] || {};
      body.appendChild(h('p.pjx-q-lead', { text: x.started ? w('wk.why.started', { computer: cname(x.c), when: x.started }) : w('wk.why.autoLead', { computer: cname(x.c), project: p.name }) }));
      body.appendChild(fl.group(w('wk.why.measures', { preset: 'Balanced' }), fl.facts([
        { key: 'complete', text: w('wk.why.cpu', { v: o.cpu }) }, { key: 'complete', text: w('wk.why.mem', { v: o.mem, floor: o.memFloor }) },
        { key: 'complete', text: w('wk.why.disk', { v: o.disk, floor: o.diskFloor }) }, { key: 'complete', text: w('wk.why.queue', { v: o.queue }) }])));
      body.appendChild(u.hint(w('wk.why.age', { age: o.age, computer: cname(x.c) })));
      const others = ENV.computers.filter((c) => c.id !== x.c).map((c) => {
        if (k.allowed.indexOf(c.id) < 0) return { key: 'off', text: w('wk.why.notAllowed', { computer: c.name, project: p.name }) };
        const ob = OBS[c.id] || {};
        if (LEVEL[c.id] === 'Only when I choose it') return { key: 'off', text: w('wk.why.onlyWhenChosen', { computer: c.name }) };
        if (ob.inUse) return { key: 'info', text: w('wk.why.inUse', { computer: c.name }) };
        if (ob.busy) return { key: 'info', text: w('wk.why.busy', { computer: c.name, busy: ob.busy }) };
        return { key: 'info', text: w('wk.why.lower', { computer: c.name }) };
      });
      body.appendChild(fl.group(w('wk.why.others'), fl.facts(others)));
      body.appendChild(u.hint(w('wk.why.tie', { project: p.name, computer: cname(k.def) })));
    }
    body.appendChild(fl.group(w('wk.why.policyCap'), fl.facts([
      { key: 'info', text: x.mode === 'chosen' ? (x.project ? w('wk.why.presetProject') : w('wk.why.presetPinned')) : w('wk.why.preset') },
      { key: 'info', text: w('wk.why.weights') },
      { key: 'info', text: w('wk.why.version') }, { key: 'info', text: w('wk.why.levels', { here: LEVEL.here, homenas: LEVEL.homenas, studio: LEVEL.studio }) }])));
    body.appendChild(u.line(null, w('wk.why.policy'), { icon: 'settings', after: u.link(w('wk.settingsLink'), () => goSettings(), { key: 'wk:whysettings', cmd: 'cmd.settings.open' }) }));
    const dlg = PJX.dialog({ title: stale(p, x) && x.queued ? w('wk.why.titleStale') : x.c ? w('wk.why.title', { computer: cname(x.c) }) : w('wk.why.titleQueued'), kicker: x.task, body, wide: true,
      actions: (acts || []).concat([{ spacer: true }, { label: w('np.done.ok'), primary: true, run: () => dlg.close('ok') }]) });
    return dlg;
  }
  function goSettings() {
    PJX.toast(w('wk.settingsToast'), w('wk.settingsToastText'), 'info');
    if (W.PM_PAGES) W.PM_PAGES.go('settings');
  }

  /* the in-place form (cmd.project.execution_policy.set): the work choice, the default Computer and the allowed set. ip
     holds the edit: { mode, def, allowed: {id: bool} } */
  function form(p, ip, redraw) {
    const u = U(), k = policy(p);
    if (!ip.wk) ip.wk = { mode: k.mode, def: k.def, allowed: k.allowed.reduce((a, c) => { a[c] = true; return a; }, {}) };
    const e = ip.wk, allowedList = () => uniq([e.def].concat(Object.keys(e.allowed).filter((c) => e.allowed[c])));
    const box = h('div.pjxc-form.pjx-wk-form');
    box.appendChild(u.line('info', w('wk.form.lead')));
    box.appendChild(u.group(w('wk.form.choice'), u.choices('wk:mode', [
      { id: 'auto', glyph: 'sparkle', title: w('wk.auto'), sub: w('wk.form.autoSub'), tag: w('np.svc.recommended') },
      { id: 'chosen', glyph: 'pin', title: w('wk.form.chosen', { computer: cname(e.def) }), sub: w('wk.form.chosenSub', { computer: cname(e.def) }) }
    ], e.mode, (v) => { e.mode = v; redraw(); }, { label: w('wk.form.choice') })));
    box.appendChild(u.group(w('wk.f.default'), u.seg('wk:def', ENV.computers.map((c) => ({ id: c.id, title: c.name, sub: c.detail })), e.def, (v) => { e.def = v; e.allowed[v] = true; redraw(); }, w('wk.f.default')),
      u.hint(w('wk.form.defRoles', { computer: cname(e.def) }))));
    box.appendChild(u.line(null, w('wk.form.onePiece'), { icon: 'pin' }));
    const checks = h('div.pjx-wk-allowed', { role: 'group', 'aria-label': w('wk.form.allowed') });
    ENV.computers.forEach((c) => {
      const isDef = c.id === e.def, has = c.id === p.runsOn || (c.id === 'homenas' && p.where.device === 'Home NAS');
      checks.appendChild(u.check('wk:allow:' + c.id, c.name, isDef || !!e.allowed[c.id], (v) => { e.allowed[c.id] = v; redraw(); },
        { disabled: isDef ? w('wk.form.defAlways') : null, sub: isDef ? w('wk.form.defAlways') : has ? w('wk.form.hasFiles') : w('wk.form.getsCopy') }));
    });
    box.appendChild(u.group(w('wk.form.allowed'), checks, u.hint(w('wk.form.allowedHint'))));
    // (N1) pinned work that hasn't started, on a Computer this choice would no longer allow: it would wait, never move
    const al = allowedList();
    (p.workers || []).filter((x) => x.queued && x.mode === 'chosen' && !x.project && x.c && al.indexOf(x.c) < 0).forEach((x) =>
      box.appendChild(u.line('waiting', w('wk.form.staleWarn', { task: x.task, computer: cname(x.c), project: p.name }), { role: 'status' })));
    box.appendChild(u.line(null, w('wk.form.running'), { icon: 'info' }));
    box.appendChild(u.line(null, w('wk.form.presets'), { icon: 'settings', after: u.link(w('wk.settingsLink'), () => goSettings(), { key: 'wk:settings', cmd: 'cmd.settings.open' }) }));
    const yl = u.yoloLine(w('wk.yolo'), { asks: false });
    if (yl) box.appendChild(yl);
    return { node: box, changed: () => e.mode !== k.mode || e.def !== k.def || allowedList().join() !== k.allowed.join(), value: () => ({ mode: e.mode, def: e.def, allowed: allowedList() }) };
  }

  /* a bounded run/task pin (SIR-056, DL-473): one piece of work goes to the Computer a person picks, among the Computers
     the Project allows, at any level, Only when I choose it included; the Project's own work choice doesn't change */
  function pinMenu(p, x, anchor) {
    const k = policy(p);
    const unpinned = x.mode === 'auto' || x.project;
    PJX.menu(anchor, [{ label: w('wk.pin.menu'), items: [{ label: w('wk.pin.project'), icon: 'sparkle', meta: (unpinned ? w('wk.pin.now') + ' · ' : '') + choiceWord(p), run: () => setPin(p, x, null) }]
      .concat(k.allowed.map((c) => ({ label: cname(c), icon: (comp(c) || {}).glyph || 'desktop', meta: (!unpinned && x.c === c ? w('wk.pin.now') + ' · ' : '') + w('wk.pin.level', { level: LEVEL[c] || 'Normal' }), run: () => setPin(p, x, c) }))) }], { label: w('wk.pin.menu') + ' · ' + x.task, align: 'end' });
  }
  async function setPin(p, x, c) {
    await PJX.run(p.id, 'pin', c ? w('wk.pin.doing', { computer: cname(c) }) : w('wk.pin.undoing'), [{ label: c ? w('wk.pin.checking', { computer: cname(c) }) : w('wk.pin.toAuto'), ms: 500 }], () => {
      const k = policy(p);
      if (c) Object.assign(x, { mode: 'chosen', c, by: 'Jared', project: false, why: null });
      else if (k.mode === 'chosen') Object.assign(x, { mode: 'chosen', c: k.def, by: k.by || 'Jared', project: true, why: null });
      else Object.assign(x, { mode: 'auto', c: null, by: null, project: false, why: null });
    }, { cmd: c ? 'cmd.execution_host.pin (run/task scope)' : 'cmd.execution_host.pin.clear' });
    PJX.toast(c ? w('wk.pin.done', { task: x.task, computer: cname(c) }) : w('wk.pin.cleared', { task: x.task }), w('wk.pin.doneText', { project: p.name, choice: choiceWord(p) }), 'success');
  }
  /* Start a run…: Auto, or a Computer for this run only */
  function startDialog(p) {
    const k = policy(p), TASKS = [['tests', w('wk.start.tests')], ['docs', w('wk.start.docs')], ['profile', w('wk.start.profile')]];
    let what = 'tests', where = 'auto', dlg = null;
    const body = h('div.pjx-wk-whybody');
    const paint = () => {
      const u = U();
      body.replaceChildren(h('p.pjx-q-lead', { text: w('wk.start.lead', { project: p.name, choice: choiceWord(p) }) }),
        u.group(w('wk.start.what'), u.choices('wk:start:what', TASKS.map(([id, t]) => ({ id, glyph: 'play', title: t })), what, (v) => { what = v; paint(); }, { label: w('wk.start.what') })),
        u.group(w('wk.start.where'), u.seg('wk:start:where', [{ id: 'auto', title: w('wk.pin.project'), sub: choiceWord(p) }].concat(k.allowed.map((c) => ({ id: c, title: cname(c), sub: LEVEL[c] }))), where, (v) => { where = v; paint(); }, w('wk.start.where')),
          u.hint(where === 'auto' ? (k.mode === 'auto' ? w('wk.start.autoHint') : w('wk.start.chosenHint', { computer: cname(k.def) })) : w('wk.start.pinHint', { computer: cname(where), project: p.name }) + (LEVEL[where] === 'Only when I choose it' ? ' ' + w('wk.why.pinLevel', { computer: cname(where) }) : ''))));
      dlg.setActions([{ spacer: true }, { label: 'Cancel', run: () => dlg.close('cancel') }, { label: w('wk.start.go'), primary: true, icon: 'play', cmd: 'cmd.work.start (+ run pin)', run: () => { dlg.close('ok'); start(); } }]);
    };
    const start = async () => {
      const task = (TASKS.find((t) => t[0] === what) || TASKS[0])[1];
      const pinned = where !== 'auto', c = pinned ? where : autoPick(p);
      await PJX.run(p.id, 'pin', w('wk.start.doing'), [{ label: w('wk.start.starting', { task, computer: cname(c) }), ms: 600 }], () => {
        p.workers = (p.workers || []).concat([pinned ? { c, task, mode: 'chosen', by: 'Jared' } : k.mode === 'chosen' ? { c, task, mode: 'chosen', by: k.by || 'Jared', project: true, at: choiceWord(p) } : { c, task, mode: 'auto' }]);
      }, { cmd: 'cmd.work.start' });
      PJX.toast(w('wk.start.done', { task, computer: cname(c) }), pinned ? w('wk.pin.doneText', { project: p.name, choice: choiceWord(p) }) : '', 'success');
    };
    dlg = PJX.dialog({ title: w('wk.start.title'), kicker: p.name, body, wide: true });
    paint();
  }

  /* New Project › Where it lives: Auto by default, the default Computer (the draft's runsOn: it sets the Project up and
     breaks ties), and the person's allowed set, which registration must record (SIR-056: never every Computer found) */
  /* (N2) New Project's default Computer is its own answer: it starts as the records home's Computer and never sets it */
  const npDef = (s) => (s.d.work && s.d.work.def) || s.d.runsOn;
  function npAllowed(s) { const d = s.d, a = (d.work && d.work.allowed) || {}; return uniq([npDef(s)].concat(Object.keys(a).filter((c) => a[c]))); }
  function npBlock(s, opts) {
    opts = opts || {};
    const u = U(), d = s.d;
    if (!d.work) d.work = { mode: 'auto', allowed: {} };
    const box = h('div.pjx-np-field.pjx-wk-np', { role: 'group', 'aria-label': w('wk.np.title') });
    box.appendChild(u.cap(w('wk.np.title')));
    box.appendChild(u.choices('wk:np:mode', [
      { id: 'auto', glyph: 'sparkle', title: w('wk.auto'), sub: w('wk.np.autoSub'), tag: w('np.svc.recommended') },
      { id: 'chosen', glyph: 'pin', title: w('wk.form.chosen', { computer: cname(npDef(s)) }), sub: w('wk.form.chosenSub', { computer: cname(npDef(s)) }) }
    ], d.work.mode, (v) => { d.work.mode = v; s.changed(); }, { label: w('wk.np.title') }));
    const off = (c) => (c.id === 'homenas' && PJX.np && !PJX.np.serverOn() ? w('np.loc.serverOff', { server: c.name }) : null);
    const defSeg = u.seg('wk:np:def', ENV.computers.map((c) => ({ id: c.id, title: c.name, sub: c.detail, off: off(c) })), npDef(s), (v) => { d.work.def = v; s.changed(); }, w('wk.f.default'));
    box.appendChild(h('div.pjx-np-field', null, u.cap(w('wk.f.default')), defSeg, u.hint(w('wk.form.defRoles', { computer: cname(npDef(s)) }) + ' ' + w('wk.np.defNotHome', { home: cname(d.runsOn) }))));
    const checks = h('div.pjx-wk-allowed', { role: 'group', 'aria-label': w('wk.form.allowed') });
    ENV.computers.forEach((c) => {
      const isDef = c.id === npDef(s), offW = c.server && off(c);
      checks.appendChild(u.check('wk:np:allow:' + c.id, c.name, isDef || !!d.work.allowed[c.id], (v) => { d.work.allowed[c.id] = v; s.changed(); },
        { disabled: isDef ? w('wk.form.defAlways') : offW || null, sub: isDef ? w('wk.np.isDefault') : c.id === d.runsOn ? w('wk.np.isHome') : w('wk.form.getsCopy') }));
    });
    box.appendChild(h('div.pjx-np-field', null, u.cap(w('wk.form.allowed')), checks, u.hint(w('wk.np.allowedHint'))));
    box.appendChild(u.line(null, w('wk.np.separate'), { icon: 'info' }));
    box.appendChild(u.line(null, w('wk.form.presets'), { icon: 'settings', after: u.link(w('wk.settingsLink'), () => PJX.toast(w('wk.settingsToast'), w('wk.settingsToastText'), 'info'), { key: 'wk:np:settings', cmd: 'cmd.settings.open' }) }));
    return box;
  }
  const npChoice = (s) => { const d = s.d, m = (d.work && d.work.mode) || 'auto'; return m === 'auto' ? w('wk.auto') : w('wk.form.chosen', { computer: cname(npDef(s)) }); };

  PJX.work = { OBS, LEVEL, policy, autoPick, running, stale, choiceWord, rowWord, workingNow, homeWord, facts, rows, why, form, pinMenu, setPin, startDialog, npBlock, npDef, npAllowed, npChoice, comp, cname };
})(window);
