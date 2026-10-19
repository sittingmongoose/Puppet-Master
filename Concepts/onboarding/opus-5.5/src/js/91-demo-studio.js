/* O55.studio — the Demo Studio's model: what the pretend world is set to, and every demo control PMConcept7 has, as
   one list of sections (DEMO_STUDIO.md has the inventory this was built from). Concept scaffolding, never product.

   Nothing here draws (92-demo-studio-ui.js does). Every action calls the owner's public API and only that:
     onboarding  PM_O55_ONBOARDING (replay, open), O55.fixtures / O55.store 'scenario' (the situation)
     tour        PM7_GUIDED_TOUR (restart, resume, resumable); O55.tour.go for a chapter start (internal, guarded)
     story       PM_DEMO (clock, director.ensure, state.story, log): the base page's demo engine
     workspace   PMW (NAMED, savedLayouts, applyNamed, resetLayout), PM_HOME.settings 'chat.standIn', PMT.agent,
                 the stand-in chat's Agent activity rows
     usage       PMU.live (pause, resume, hour), PMU.charts.gallery, PM_PAGES.go
     notices     PM_TITLEBAR_NOTIFY.demo (pm7-notifications), else window.toast / toast.important
     looks       PM7_SETTINGS_TOME.setChromeThemeFamily / Mode (the title-bar menu's path), PM_NIER.set,
                 PM_NIER_CHIPS.popup, PM12_KIMI.setSettingFromHost (Reduce animations), O55.sound.setMuted
   An owner that is missing on the page makes its control say so (avail() false) instead of failing. */
(function () {
  'use strict';
  const O55 = window.O55, T = (k, v) => O55.t(k, v);
  const W = (name) => window[name] || null;
  const fn = (o, k) => !!(o && typeof o[k] === 'function');

  /* ---- situations: where the person starts, plus twists that stack (the fixtures apply them in order) ---- */
  const BASES = ['fresh', 'returning'];
  const GROUPS = [
    { id: 'computer', ids: ['lowResource', 'noKeys'] },
    { id: 'nas', ids: ['homeNasPm', 'keyWorks', 'hostChanged', 'wrongPassword', 'keyRefused', 'selfKeyMissing', 'readOnly'] },
    { id: 'online', ids: ['nameTaken', 'flaky'], one: true },
    { id: 'ai', ids: ['cliMissing', 'signedOut', 'copiedUnavailable', 'remoteAi', 'noAi'], one: true }
  ];
  /* twists that describe the same thing two ways: picking one takes the other out (symmetric) */
  const CLASH = {};
  [['keyWorks', 'keyRefused'], ['keyWorks', 'selfKeyMissing'], ['keyWorks', 'noKeys'], ['homeNasPm', 'keyWorks'],
    ['homeNasPm', 'keyRefused'], ['homeNasPm', 'selfKeyMissing'], ['homeNasPm', 'hostChanged'], ['homeNasPm', 'wrongPassword'],
    ['homeNasPm', 'noKeys'], ['keyRefused', 'selfKeyMissing']].forEach(([a, b]) => { (CLASH[a] = CLASH[a] || []).push(b); (CLASH[b] = CLASH[b] || []).push(a); });
  GROUPS.forEach((g) => { if (g.one) g.ids.forEach((a) => g.ids.forEach((b) => { if (a !== b) (CLASH[a] = CLASH[a] || []).push(b); })); });
  const TWISTS = GROUPS.reduce((all, g) => all.concat(g.ids), []);
  const sitTitle = (id) => T(`studio.onboarding.situations.${id}.title`);

  function parseSituation(s) {
    const ids = String(s || 'fresh').split('+').filter((id) => O55.fixtures && O55.fixtures.SCENARIOS[id]);
    const base = BASES.find((b) => ids.includes(b)) || 'fresh';
    return { base, twists: TWISTS.filter((t) => ids.includes(t)) };
  }
  const joinSituation = (p) => [p.base].concat(TWISTS.filter((t) => p.twists.includes(t))).join('+');
  function situationLabel(s) {
    const p = parseSituation(s);
    return p.twists.length ? `${sitTitle(p.base)} ${T('studio.plus', { n: p.twists.length })}` : sitTitle(p.base);
  }
  function situationLong(s) { const p = parseSituation(s); return [p.base].concat(p.twists).map(sitTitle).join(' + '); }
  const currentSituation = () => joinSituation(parseSituation(O55.store.get('scenario', 'fresh')));
  /* the twist `id` toggled in pick p, with the ones it clashes with taken out: { pick, removed } */
  function toggleTwist(p, id) {
    const on = p.twists.includes(id);
    if (on) return { pick: { base: p.base, twists: p.twists.filter((t) => t !== id) }, removed: [] };
    const removed = p.twists.filter((t) => (CLASH[id] || []).includes(t));
    return { pick: { base: p.base, twists: p.twists.filter((t) => !removed.includes(t)).concat([id]) }, removed };
  }
  /* the world onboarding runs against, set the way the old demo item did it */
  function applySituation(s) {
    O55.store.set('scenario', s);
    O55.S.env = O55.fixtures.make(s);
    if (O55.owners && O55.owners.resetOps) O55.owners.resetOps();
    if (O55.motion && O55.motion.setLowResource) O55.motion.setLowResource(!!O55.S.env.lowResource, 'scenario');
  }

  /* ---- onboarding ---- */
  const SCREEN_CHAPTERS = [
    ['welcome', ['welcome', 'look']],
    ['computer', ['where', 's-kind', 's-wait', 's-confirm', 's-ready', 'c-route', 'c-review', 'c-pair', 'c-ready', 'r-source', 'r-unlock', 'r-pick', 'r-preview', 'r-done']],
    ['project', ['begin', 'ex-folder', 'ex-repos', 'nas-find', 'nas-identity', 'nas-key', 'nas-signin', 'nas-install', 'nas-pmpair', 'nas-folder', 'nas-smb', 'nas-nfs', 'nas-mounted', 'name', 'like', 'safe', 'online-service', 'online-signin', 'online-details', 'away', 'review', 'creating', 'protect']],
    ['ai', ['ai', 'ai-all', 'ai-none', 'free']],
    ['ready', ['ready']]
  ];
  const hasScreen = (id) => !!(O55.screens && O55.screens.defs[id]);
  function onboardingState() {
    const saved = O55.store.get('onboarding', null);
    if (O55.S && O55.S.open) return { kind: 'open' };
    if (!saved) return { kind: 'none' };
    if (saved.status === 'closed') return { kind: 'closed', screen: saved.screen || (saved.sess && saved.sess.screen) || '' };
    if (saved.commit && saved.commit.state === 'done') return { kind: 'done' };
    return { kind: saved.status === 'done' ? 'done' : 'closed', screen: saved.screen || '' };
  }
  const onboarding = {
    avail: () => fn(W('PM_O55_ONBOARDING'), 'replay'),
    /* from the first screen, in situation s (Run Onboarding Again's own path: the tour is reset first) */
    run(s, o) {
      applySituation(s || currentSituation());
      o = o || {};
      if (o.install) { O55.store.clear('onboarding'); return O55.ui.open({ fresh: true, install: true }); }
      return W('PM_O55_ONBOARDING').replay();
    },
    resume: () => W('PM_O55_ONBOARDING').resume(),
    screen(id, s) { applySituation(s || currentSituation()); return O55.ui.open({ fresh: true, screen: id }); }
  };

  /* ---- Guided Tour ---- */
  const tourApi = () => W('PM7_GUIDED_TOUR');
  function tourChapters() {
    const TR = O55.tour, defs = (TR && TR.defs) || [];
    return ((TR && TR.CHAPTERS) || ['ask', 'workspace', 'plan']).map((id, i) => {
      const steps = defs.filter((d) => d.chapter === id);
      return { id, n: i + 1, name: T(`tour.chapters.${id}`), steps: steps.map((d) => ({ id: d.id, title: T(`tour.steps.${d.id}.title`) })) };
    });
  }
  function tourState() {
    const api = tourApi(), r = api && fn(api, 'resumable') ? api.resumable() : null;
    const total = (O55.tour && O55.tour.defs && O55.tour.defs.length) || 20;
    if (r && r.running) return { kind: 'running', step: r.step, total: r.total };
    if (r) {
      const def = O55.tour.defs[r.step - 1];
      return { kind: 'at', step: r.step, total: r.total, chapter: def ? T(`tour.chapters.${def.chapter}`) : '' };
    }
    return { kind: 'none', total };
  }
  const tour = {
    avail: () => fn(tourApi(), 'restart'),
    start: () => tourApi().restart({ source: 'demo_studio' }),
    resume: () => tourApi().resume({ source: 'demo_studio' }),
    /* a chapter other than the first: the tour starts over, then jumps to the chapter's first step once its opening
       moment has settled (O55.tour.go is the tour's own jump; it is internal, so this stays guarded) */
    async chapter(id) {
      const ch = tourChapters().find((c) => c.id === id);
      const ok = await tourApi().restart({ source: 'demo_studio' });
      if (!ch || ch.n === 1 || !ok || !O55.tour || typeof O55.tour.go !== 'function') return ok;
      const first = ch.steps[0] && ch.steps[0].id;
      const until = performance.now() + 4000;
      const tick = () => {
        const st = O55.tour.st;
        if (!O55.tour.running) return;
        if (st && st.step && !st.entering && !st.advancing) { try { O55.tour.go(first); } catch (_) {} return; }
        if (performance.now() < until) O55.motion.real.setTimeout(tick, 80);
      };
      O55.motion.real.setTimeout(tick, 120);
      return ok;
    }
  };

  /* ---- the story (the base page's demo engine) ---- */
  const POINTS = ['c1_wizard_done', 'c2_compiled', 'c3_run_complete', 'c4_pr_merged', 'c5_published'];
  const demo = () => W('PM_DEMO');
  const story = {
    avail: () => !!(demo() && demo().director && demo().clock),
    points: () => POINTS.map((id, i) => ({ id, n: i + 1, label: T(`studio.story.c${i + 1}`), done: !!(demo() && demo().state.story && demo().state.story[id]) })),
    clock: () => { const c = demo() && demo().state.clock; return c ? { t: c.t || 0, playing: !!c.playing, speed: c.speed || 1 } : null; },
    play: () => demo().clock.play(),
    pause: () => demo().clock.pause(),
    speed: (x) => demo().clock.setSpeed(x),
    jump: (id) => demo().director.ensure(id),
    beats: () => ((demo() && demo().log) || []).slice(-8).reverse(),
    over: () => { try { location.reload(); } catch (_) {} }
  };
  const fmtClock = (ms) => { const s = Math.floor((ms || 0) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

  /* ---- workspace ---- */
  const PMW = () => W('PMW'), HOME = () => W('PM_HOME');
  function goHome() { try { const P = W('PM_PAGES'); if (P && typeof P.go === 'function') P.go('dashboard'); } catch (_) {} }
  const workspace = {
    avail: () => !!(PMW() && PMW().NAMED && fn(PMW(), 'applyNamed')),
    layouts() {
      const P = PMW(); if (!P || !P.NAMED) return [];
      const saved = fn(P, 'savedLayouts') ? P.savedLayouts() : {};
      return Object.keys(P.NAMED).map((id) => ({ id, label: P.NAMED[id].label || id, tree: P.NAMED[id].tree }))
        .concat(Object.keys(saved).map((id) => ({ id, label: saved[id].label || id, tree: saved[id].tree, saved: true })));
    },
    current() { try { const S = HOME() && HOME().settings; return S ? S.get('panels.layout.named') : null; } catch (_) { return null; } },
    use(id) { goHome(); return PMW().applyNamed(id); },
    reset() { goHome(); return PMW().resetLayout(); },
    standInAvail: () => !!(HOME() && HOME().settings && fn(HOME().settings, 'get')),
    standIn() { try { return HOME().settings.get('chat.standIn') !== false; } catch (_) { return false; } },
    setStandIn(on) { HOME().settings.set('chat.standIn', !!on); },
    agentRows: () => Array.prototype.slice.call(document.querySelectorAll('#pmw-chat [data-pmw-sc-agent]')),
    agentsAvail() { return workspace.standIn() && workspace.agentRows().length > 0; },
    /* the stand-in chat's Agent activity: each row opens its thing behind the person's work (D8) */
    agents() {
      goHome();
      const rows = workspace.agentRows(), gap = O55.motion.reduced() ? 0 : 260;
      rows.forEach((r, i) => O55.motion.real.setTimeout(() => r.click(), i * gap));
      return rows.length > 0;
    },
    termAvail: () => !!(W('PMT') && W('PMT').agent && fn(W('PMT').agent, 'open')),
    async terminal() {
      goHome();
      const A = W('PMT').agent, id = A.open('Query Analyzer', { label: 'bench' });
      if (!id) return false;
      O55.motion.real.setTimeout(() => { A.run(id, 'Query Analyzer', 'cargo bench --bench recipes').catch(() => {}); }, 700);
      return true;
    },
    /* an agent asks to type into the terminal a person opened (DL-181): the terminal draws the ask */
    async ask() {
      goHome();
      const P = W('PMT'), list = P.sessions ? P.sessions() : [];
      const human = list.find((s) => !/^agent:/.test(s.owner || '')) || list[0];
      if (!human) return false;
      if (HOME() && fn(HOME(), 'open')) HOME().open({ kind: 'terminal', session: human.id });
      O55.motion.real.setTimeout(() => { P.agent.run(human.id, 'Builder', 'cargo test --workspace').catch(() => {}); }, 300);
      return true;
    }
  };

  /* ---- Usage ---- */
  const PMU = () => W('PMU');
  const usage = {
    avail: () => !!(PMU() && PMU().live),
    live: () => !!(PMU() && PMU().live && PMU().live.on()),
    setLive: (on) => (on ? PMU().live.resume() : PMU().live.pause()),
    hourAvail: () => !!(PMU() && PMU().live && PMU().live.hour && PMU().live.hour.available()),
    hourRunning: () => !!(usage.hourAvail() && PMU().live.hour.running()),
    hourLabel: () => (usage.hourAvail() ? PMU().live.hour.label() : ''),
    hour: () => PMU().live.hour.play(),
    back: () => PMU().live.hour.back(),
    open() { try { W('PM_PAGES').go('usage'); return true; } catch (_) { return false; } },
    galleryAvail: () => !!(PMU() && PMU().charts && fn(PMU().charts, 'gallery')),
    gallery() { usage.open(); O55.motion.real.setTimeout(() => { try { if (!PMU().charts.galleryOpen()) PMU().charts.gallery(true); } catch (_) {} }, 260); return true; }
  };

  /* ---- notices: pm7-notifications' moments when its engine is on the page, the same words through toast otherwise ---- */
  const NOTICE_IDS = ['quiet', 'run', 'usage', 'approval', 'burst', 'all'];
  const FALLBACK = {
    quiet: [[0, 'Settings saved']],
    run: [[0, { title: 'Run #47 complete: all seams closed.', body: 'Orchestrator · just now', severity: 'success', page: 'orchestrator', allowed_action_ids: ['open', 'acknowledge'] }]],
    usage: [[0, { title: 'Claude 5-hour is at 80% used.', body: 'Usage · another signed-in account can take over', severity: 'warn', kind: 'advisory', page: 'usage', allowed_action_ids: ['open', 'acknowledge'] }]],
    approval: [[0, { title: 'Builder needs approval to run cargo publish', body: 'Publishing is an outward action; the node is parked at a safe point.', severity: 'warn', kind: 'hitl', page: 'orchestrator', allowed_action_ids: ['open', 'acknowledge'] }]],
    burst: [[0, 'Panel moved to the right column'], [420, 'Copied'], [900, { title: 'Run #48 complete: 12 checks passed.', body: 'Orchestrator · just now', severity: 'success', page: 'orchestrator' }],
      [1500, { title: 'Work moved to another account because of rate limits.', body: 'Usage · the account you chose stays your choice', severity: 'warn', page: 'usage' }], [2100, 'Copied']]
  };
  const notices = {
    ids: NOTICE_IDS,
    avail: () => typeof window.toast === 'function',
    fire(id) {
      const N = W('PM_TITLEBAR_NOTIFY');
      if (N && fn(N, 'demo')) return N.demo(id);
      const seqs = id === 'all' ? ['quiet', 'run', 'usage', 'approval'] : [id];
      let at = 0;
      seqs.forEach((s) => { (FALLBACK[s] || []).forEach(([dt, m]) => O55.motion.real.setTimeout(() => { if (typeof m === 'string') window.toast(m); else if (window.toast.important) window.toast.important(m); else window.toast(m.title); }, at + dt)); at += 1600; });
      return true;
    },
    clearAvail: () => fn(W('PM_TITLEBAR_NOTIFY'), 'clearAll'),
    clear: () => W('PM_TITLEBAR_NOTIFY').clearAll()
  };

  /* ---- looks ---- */
  const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'];
  const tome = () => W('PM7_SETTINGS_TOME');
  function lookNow() {
    const th = O55.theme(), P = W('PM_THEME');
    let mode = th.mode; try { if (P && P.getMode) mode = P.getMode(); } catch (_) {}
    return { look: th.nier ? 'nier' : th.family, chosen: th.chosen, mode: th.mode, setMode: mode, nier: th.nier };
  }
  function reducedSetting() {
    try { const K = W('PM12_KIMI'), st = K && K.getState && K.getState(); const v = st && st.settings ? st.settings['general.visual.reduce-animations'] : undefined; if (v !== undefined) return v === true || v === 'On' || v === 'on'; } catch (_) {}
    return document.documentElement.getAttribute('data-motion') === 'reduced';
  }
  const looks = {
    ids: LOOKS,
    avail: () => fn(tome(), 'setChromeThemeFamily'),
    now: lookNow,
    /* a look and a mode in one pick, the way onboarding's look picker writes them */
    set(look, mode) {
      const N = W('PM_NIER'), t = tome();
      if (look === 'nier') {
        if (mode && mode !== lookNow().setMode) t.setChromeThemeMode(mode);
        if (N && !N.on()) N.set(true);
        return true;
      }
      if (N && N.on()) N.set(false);
      t.setChromeThemeFamily(look);
      if (mode) t.setChromeThemeMode(mode);
      return true;
    },
    mode: (m) => tome().setChromeThemeMode(m),
    nierAvail: () => !!(W('PM_NIER') && W('PM_NIER').ready && W('PM_NIER').ready()),
    nierOn: () => !!(W('PM_NIER') && W('PM_NIER').on()),
    setNier: (on) => W('PM_NIER').set(!!on),
    adjust(from) {
      const chips = W('PM_NIER_CHIPS'), N = W('PM_NIER');
      if (!(chips && fn(chips, 'popup') && N && fn(N, 'store'))) return false;
      chips.popup({ store: N.store('live'), from, returnFocus: () => from });
      return true;
    },
    reducedAvail: () => fn(W('PM12_KIMI'), 'setSettingFromHost'),
    reduced: () => O55.motion.reduced(),
    reducedSetting,
    setReduced(on) {
      const K = W('PM12_KIMI');
      const ok = K.setSettingFromHost('general.visual.reduce-animations', !!on, false, false);
      try { const t = tome(); if (t && t.applyPaint) t.applyPaint(K.getState()); } catch (_) {}
      return ok;
    },
    /* Liquid Glass (pm7-liquid-glass's engine, window.PM_LG): who draws it and the wallpaper; Glass always uses Liquid Glass */
    lg: {
      avail: () => !!(W('PM_LG') && fn(W('PM_LG'), 'set')),
      tier: () => document.documentElement.getAttribute('data-lg-tier') || 'gpu',
      setTier: (x) => W('PM_LG').set({ 'data-lg-tier': x }),
      walls: () => { try { return fn(W('PM_LG'), 'walls') ? W('PM_LG').walls() || [] : []; } catch (_) { return []; } },
      wall: () => document.documentElement.getAttribute('data-lg-wall') || 'look',
      setWall: (id) => W('PM_LG').wall(id)
    },
    /* wallpapers for every look (pm7-wallpapers, window.PM_WALLPAPERS): one choice, 'look' or an id */
    walls: {
      avail: () => !!(W('PM_WALLPAPERS') && fn(W('PM_WALLPAPERS'), 'choose')),
      families() {
        const cat = W('PM_WALLPAPERS_CATALOG');
        return cat && cat.families ? cat.families.map((f) => ({ family: f.family, label: f.label, items: (f.wallpapers || []).map((w) => ({ id: w.id, name: w.name || w.id })) })) : [];
      },
      choice: () => { try { return W('PM_WALLPAPERS').choice() || 'look'; } catch (_) { return 'look'; } },
      choose: (id) => W('PM_WALLPAPERS').choose(id)
    },
    soundAvail: () => !!(O55.sound && fn(O55.sound, 'setMuted')),
    sound: () => !!(O55.sound && !O55.sound.muted),
    setSound: (on) => O55.sound.setMuted(!on, 'demo_studio')
  };

  /* ---- resets ---- */
  /* every key this concept keeps: PMConcept7's own, the Studio's place, and the 5.6 Pro chat demo's pm56 keys (Jared,
     2026-10-14: that chat is ported in next, so Everything resets it too) */
  const OWNED = /^(pm[\w]*[.:\-_]|o55|widget_(layout|presets):|home_workspace_layout:)/i;
  function ownedKeys() {
    const out = [];
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && OWNED.test(k)) out.push(k); } } catch (_) {}
    return out.sort();
  }
  const RESETS = {
    progress: ['onboarding', 'tour', 'situation'],
    layout: ['layout'],
    everything: ['onboarding', 'tour', 'situation', 'layout', 'saved', 'dashboards', 'chat', 'chat56', 'terminal', 'usage', 'rail', 'settings', 'studio']
  };
  const reset = {
    ids: Object.keys(RESETS),
    items: (id) => RESETS[id],
    avail: (id) => (id === 'layout' ? workspace.avail() : true),
    ownedKeys,
    async progress() {
      if (O55.tour && O55.tour.reset) { try { await O55.tour.reset({ silent: true, force: true }); } catch (_) {} }
      O55.store.clear('onboarding'); O55.store.clear('tour');
      return onboarding.run('fresh', { install: true });
    },
    layout: () => workspace.reset(),
    /* everything this concept kept in this browser goes, then the page reloads as a first run (no onboarding record:
       it opens by itself). The address keeps its other switches but loses the ones that skip or steer onboarding. */
    async everything() {
      if (O55.tour && O55.tour.running && O55.tour.reset) { try { await O55.tour.reset({ silent: true, force: true }); } catch (_) {} }
      ownedKeys().forEach((k) => { try { localStorage.removeItem(k); } catch (_) {} });
      try { if (window.indexedDB) window.indexedDB.deleteDatabase('pm.home.terminal:v1:saved'); } catch (_) {}
      const u = new URL(location.href);
      ['o55', 'o55scenario'].forEach((p) => u.searchParams.delete(p));
      O55.motion.real.setTimeout(() => { try { location.replace(u.toString()); } catch (_) { location.reload(); } }, 60);
      return true;
    }
  };

  /* ---- review switches (the page reads them once, at load) ---- */
  const LOAD = ['normal', 'off', 'fresh', 'tourOn'];
  const LOAD_PARAM = { off: 'off', fresh: 'fresh', tourOn: 'tour' };
  const FLAGS = [
    { id: 'pmh', param: 'pmh', value: 'off' },
    { id: 'live', param: 'pmu-live', value: 'off' },
    { id: 'soft', param: 'pmu-soft', value: '1' },
    { id: 'gallery', param: 'usagegallery', value: '1' }
  ];
  function switchesNow() {
    const q = new URLSearchParams(location.search), o = q.get('o55') || '';
    const load = Object.keys(LOAD_PARAM).find((k) => LOAD_PARAM[k] === o) || 'normal';
    const flags = {}; FLAGS.forEach((f) => { flags[f.id] = q.get(f.param) === f.value; });
    return { load, situation: q.has('o55scenario'), flags };
  }
  function switchesUrl(sw) {
    const u = new URL(location.href);
    ['o55', 'o55scenario', 'home'].concat(FLAGS.map((f) => f.param)).forEach((p) => u.searchParams.delete(p));
    if (LOAD_PARAM[sw.load]) u.searchParams.set('o55', LOAD_PARAM[sw.load]);
    if (sw.situation) u.searchParams.set('o55scenario', currentSituation());
    FLAGS.forEach((f) => { if (sw.flags[f.id]) u.searchParams.set(f.param, f.value); });
    return u.toString().replace(/%2B/g, '+');
  }
  const switches = { LOAD, FLAGS, now: switchesNow, url: switchesUrl, reload: (sw) => location.assign(switchesUrl(sw)) };

  /* ---- recipes: one click sets the world up and starts the moment (5.6 Pro's curated recipes, for PMConcept7) ---- */
  const RECIPES = [
    { id: 'newComputer', icon: 'computer', kind: 'launch', avail: onboarding.avail, run: () => reset.progress() },
    { id: 'returningNas', icon: 'nas', kind: 'launch', avail: onboarding.avail, run: () => onboarding.run('returning+keyWorks') },
    { id: 'roughDay', icon: 'storm', kind: 'launch', avail: onboarding.avail, run: () => onboarding.run('fresh+wrongPassword+nameTaken') },
    { id: 'noAi', icon: 'spark', kind: 'launch', avail: onboarding.avail, run: () => onboarding.run('fresh+noAi') },
    { id: 'learn', icon: 'tour', kind: 'launch', avail: tour.avail, run: () => tour.start() },
    { id: 'storyFinish', icon: 'flag', kind: 'stay', avail: story.avail, run: () => { goHome(); story.jump('c3_run_complete'); story.speed(2); story.play(); return true; } },
    { id: 'busy', icon: 'bell', kind: 'stay', avail: () => notices.avail(), run: () => {
      if (workspace.agentsAvail()) workspace.agents();
      O55.motion.real.setTimeout(() => notices.fire('burst'), 900);
      if (usage.hourAvail() && !usage.hourRunning()) usage.hour();
      return true;
    } },
    { id: 'nierTour', icon: 'pod', kind: 'launch', avail: () => looks.nierAvail() && tour.avail(), run: () => { if (!looks.nierOn()) looks.setNier(true); O55.motion.real.setTimeout(() => tour.start(), 420); return true; } }
  ];

  O55.studio = {
    BASES, GROUPS, TWISTS, CLASH, SCREEN_CHAPTERS, POINTS, RECIPES, LOOKS,
    parseSituation, joinSituation, situationLabel, situationLong, currentSituation, toggleTwist, applySituation, sitTitle,
    hasScreen, onboardingState, tourChapters, tourState, fmtClock,
    onboarding, tour, story, workspace, usage, notices, looks, reset, switches,
    /* open/close/toggle are filled in by the UI (92-demo-studio-ui.js) */
    open: () => false, close: () => false, toggle: () => false
  };
})();
