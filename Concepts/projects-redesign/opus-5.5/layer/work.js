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

  function policy(p) {
    const wk = p.work || {}, def = p.runsOn || 'here';
    // the chosen Computer is its own answer: the default Computer only sets the Project up and breaks ties (SIR-056)
    const chosen = wk.chosen || def;
    return { mode: wk.mode === 'chosen' ? 'chosen' : 'auto', by: wk.by || null, def, chosen, allowed: uniq([def].concat(wk.allowed || []).concat(wk.mode === 'chosen' ? [chosen] : [])) };
  }
  const choiceWord = (p) => { const k = policy(p); return k.mode === 'auto' ? w('wk.auto') : w('wk.chosenBy', { computer: cname(k.chosen), who: k.by || 'Jared' }); };
  const rowWord = (x) => (x.mode === 'chosen' ? w('wk.chosenBy', { computer: cname(x.c), who: x.by || 'Jared' }) : w('wk.autoTo', { computer: cname(x.c) }));
  const workingNow = (p) => uniq((p.workers || []).filter((x) => !x.waiting).map((x) => x.c));
  const homeWord = (p) => { const c = comp(p.home || 'here'); return c ? (c.id === 'here' ? c.name + ' (' + c.short + ')' : c.name) : '—'; };

  /* the Project summary (F3-668): records home, default work choice, default Computer, allowed, the Computers working now */
  function facts(p) {
    const k = policy(p), now = workingNow(p), n = (p.workers || []).length;
    return [
      { k: w('wk.f.home'), v: homeWord(p), tip: w('wk.f.homeTip') },
      { k: w('wk.f.choice'), v: choiceWord(p) },
      { k: w('wk.f.default'), v: cname(k.def) + ' · ' + (k.mode === 'auto' ? w('wk.f.tie') : w('wk.f.tieLater')) },
      { k: w('wk.f.allowed'), v: andList(k.allowed.map(cname)) },
      { k: w('wk.f.now'), v: now.length ? andList(now.map(cname)) + ' · ' + w(n === 1 ? 'wk.f.task' : 'wk.f.tasks', { n }) : w('wk.f.none') }
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
      box.appendChild(h('li.pjx-wk-row', { 'data-mode': x.mode },
        h('span.pjx-st-mark', { html: PJX.mark(x.waiting ? 'pending' : 'working', 13), 'aria-hidden': 'true' }),
        h('span.pjx-wk-task', { text: x.task }),
        h('span.pjx-wk-where', null, h('span.pjx-wk-to', { text: words }), x.waiting ? h('span.pjx-wk-wait', { text: ' · ' + x.waiting }) : null),
        b));
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
    if (x.mode === 'chosen') {
      body.appendChild(h('p.pjx-q-lead', { text: w('wk.why.chosenLead', { who: x.by || 'Jared', computer: cname(x.c), reason: x.why ? ' (' + x.why + ')' : '' }) }));
      body.appendChild(fl.facts([{ key: 'complete', text: w('wk.why.pinWins') }, { key: 'info', text: w('wk.why.pinWaits', { computer: cname(x.c) }) }, { key: 'info', text: w('wk.why.pinScope', { project: p.name }) }]));
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
        if (ob.inUse) return { key: 'info', text: w('wk.why.inUse', { computer: c.name }) };
        if (ob.busy) return { key: 'info', text: w('wk.why.busy', { computer: c.name, busy: ob.busy }) };
        return { key: 'info', text: w('wk.why.lower', { computer: c.name }) };
      });
      body.appendChild(fl.group(w('wk.why.others'), fl.facts(others)));
      body.appendChild(u.hint(w('wk.why.tie', { project: p.name, computer: cname(k.def) })));
    }
    body.appendChild(fl.group(w('wk.why.policyCap'), fl.facts([
      { key: 'info', text: x.mode === 'chosen' ? w('wk.why.presetPinned') : w('wk.why.preset') },
      { key: 'info', text: w('wk.why.weights') },
      { key: 'info', text: w('wk.why.version') }])));
    body.appendChild(u.line(null, w('wk.why.policy'), { icon: 'settings', after: u.link(w('wk.settingsLink'), () => goSettings(), { key: 'wk:whysettings', cmd: 'cmd.settings.open' }) }));
    const dlg = PJX.dialog({ title: w('wk.why.title', { computer: cname(x.c) }), kicker: x.task, body, wide: true, actions: [{ spacer: true }, { label: w('np.done.ok'), primary: true, run: () => dlg.close('ok') }] });
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
    if (!ip.wk) ip.wk = { mode: k.mode, def: k.def, chosen: k.chosen, allowed: k.allowed.reduce((a, c) => { a[c] = true; return a; }, {}) };
    const e = ip.wk, allowedList = () => uniq([e.def].concat(Object.keys(e.allowed).filter((c) => e.allowed[c])).concat(e.mode === 'chosen' ? [e.chosen] : []));
    const box = h('div.pjxc-form.pjx-wk-form');
    box.appendChild(u.line('info', w('wk.form.lead')));
    box.appendChild(u.group(w('wk.form.choice'), u.choices('wk:mode', [
      { id: 'auto', glyph: 'sparkle', title: w('wk.auto'), sub: w('wk.form.autoSub'), tag: w('np.svc.recommended') },
      { id: 'chosen', glyph: 'pin', title: w('wk.form.chosenPick'), sub: w('wk.form.chosenPickSub') }
    ], e.mode, (v) => { e.mode = v; redraw(); }, { label: w('wk.form.choice') })));
    // the Computer chosen for the work: its own answer, apart from the default Computer
    if (e.mode === 'chosen') box.appendChild(u.group(w('wk.form.chosenQ'), u.seg('wk:chosen', ENV.computers.map((c) => ({ id: c.id, title: c.name, sub: c.detail })), e.chosen, (v) => { e.chosen = v; e.allowed[v] = true; redraw(); }, w('wk.form.chosenQ')),
      u.hint(w('wk.form.chosenSub', { computer: cname(e.chosen) }))));
    box.appendChild(u.group(w('wk.f.default'), u.seg('wk:def', ENV.computers.map((c) => ({ id: c.id, title: c.name, sub: c.detail })), e.def, (v) => { e.def = v; e.allowed[v] = true; redraw(); }, w('wk.f.default')),
      u.hint(e.mode === 'auto' ? w('wk.form.defAuto') : w('wk.form.defChosen', { computer: cname(e.chosen) }))));
    const checks = h('div.pjx-wk-allowed', { role: 'group', 'aria-label': w('wk.form.allowed') });
    ENV.computers.forEach((c) => {
      const isDef = c.id === e.def, has = c.id === p.runsOn || (c.id === 'homenas' && p.where.device === 'Home NAS');
      checks.appendChild(u.check('wk:allow:' + c.id, c.name, isDef || !!e.allowed[c.id], (v) => { e.allowed[c.id] = v; redraw(); },
        { disabled: isDef ? w('wk.form.defAlways') : null, sub: isDef ? w('wk.form.defAlways') : has ? w('wk.form.hasFiles') : w('wk.form.getsCopy') }));
    });
    box.appendChild(u.group(w('wk.form.allowed'), checks, u.hint(w('wk.form.allowedHint'))));
    box.appendChild(u.line(null, w('wk.form.running'), { icon: 'info' }));
    box.appendChild(u.line(null, w('wk.form.presets'), { icon: 'settings', after: u.link(w('wk.settingsLink'), () => goSettings(), { key: 'wk:settings', cmd: 'cmd.settings.open' }) }));
    const yl = u.yoloLine(w('wk.yolo'), { asks: false });
    if (yl) box.appendChild(yl);
    return { node: box, changed: () => e.mode !== k.mode || e.def !== k.def || (e.mode === 'chosen' && e.chosen !== k.chosen) || allowedList().join() !== k.allowed.join(), value: () => ({ mode: e.mode, def: e.def, chosen: e.mode === 'chosen' ? e.chosen : null, allowed: allowedList() }) };
  }

  /* New Project › Where it lives: Auto by default, the default Computer (the draft's runsOn: it sets the Project up and
     breaks ties), and the person's allowed set, which registration must record (SIR-056: never every Computer found) */
  function npAllowed(s) { const d = s.d, a = (d.work && d.work.allowed) || {}; return uniq([d.runsOn].concat(Object.keys(a).filter((c) => a[c])).concat(d.work && d.work.mode === 'chosen' ? [npChosen(s)] : [])); }
  const npChosen = (s) => (s.d.work && s.d.work.chosen) || s.d.runsOn;
  function npBlock(s, opts) {
    opts = opts || {};
    const u = U(), d = s.d;
    if (!d.work) d.work = { mode: 'auto', allowed: {} };
    const box = h('div.pjx-np-field.pjx-wk-np', { role: 'group', 'aria-label': w('wk.np.title') });
    box.appendChild(u.cap(w('wk.np.title')));
    box.appendChild(u.choices('wk:np:mode', [
      { id: 'auto', glyph: 'sparkle', title: w('wk.auto'), sub: w('wk.np.autoSub'), tag: w('np.svc.recommended') },
      { id: 'chosen', glyph: 'pin', title: w('wk.form.chosenPick'), sub: w('wk.form.chosenPickSub') }
    ], d.work.mode, (v) => { d.work.mode = v; s.changed(); }, { label: w('wk.np.title') }));
    if (d.work.mode === 'chosen') box.appendChild(h('div.pjx-np-field', null, u.cap(w('wk.form.chosenQ')), u.seg('wk:np:chosen', ENV.computers.map((c) => ({ id: c.id, title: c.name, sub: c.detail })), npChosen(s), (v) => { d.work.chosen = v; d.work.allowed[v] = true; s.changed(); }, w('wk.form.chosenQ')), u.hint(w('wk.form.chosenSub', { computer: cname(npChosen(s)) }))));
    if (opts.defSeg) box.appendChild(h('div.pjx-np-field', null, u.cap(w('wk.f.default')), opts.defSeg, u.hint(w('wk.np.defHint'))));
    const checks = h('div.pjx-wk-allowed', { role: 'group', 'aria-label': w('wk.form.allowed') });
    ENV.computers.forEach((c) => {
      const isDef = c.id === d.runsOn, off = c.server && c.id === 'homenas' && PJX.np && !PJX.np.serverOn() ? w('np.loc.serverOff', { server: c.name }) : null;
      checks.appendChild(u.check('wk:np:allow:' + c.id, c.name, isDef || !!d.work.allowed[c.id], (v) => { d.work.allowed[c.id] = v; s.changed(); },
        { disabled: isDef ? w('wk.form.defAlways') : off, sub: isDef ? w('wk.np.isDefault') : w('wk.form.getsCopy') }));
    });
    box.appendChild(h('div.pjx-np-field', null, u.cap(w('wk.form.allowed')), checks, u.hint(w('wk.np.allowedHint'))));
    box.appendChild(u.line(null, w('wk.np.separate'), { icon: 'info' }));
    box.appendChild(u.line(null, w('wk.form.presets'), { icon: 'settings', after: u.link(w('wk.settingsLink'), () => PJX.toast(w('wk.settingsToast'), w('wk.settingsToastText'), 'info'), { key: 'wk:np:settings', cmd: 'cmd.settings.open' }) }));
    return box;
  }
  const npChoice = (s) => { const d = s.d, m = (d.work && d.work.mode) || 'auto'; return m === 'auto' ? w('wk.auto') : w('wk.form.chosen', { computer: cname(npChosen(s)) }); };

  PJX.work = { OBS, policy, choiceWord, rowWord, workingNow, homeWord, facts, rows, why, form, npBlock, npAllowed, npChosen, npChoice, comp, cname };
})(window);
