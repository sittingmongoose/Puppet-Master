/* O55.studio — the Demo Studio's model: what the pretend world is set to, and every demo control PMConcept7 has, as
   one list of sections (DEMO_STUDIO.md has the inventory this was built from). Concept scaffolding, never product.

   Nothing here draws (92-demo-studio-ui.js does). Every action calls the owner's public API and only that:
     onboarding  PM_O55_ONBOARDING (replay, open), O55.fixtures / O55.store 'scenario' (the situation)
     tour        PM7_GUIDED_TOUR (restart, resume, resumable); O55.tour.go for a chapter start (internal, guarded)
     story       PM_DEMO (clock, director.ensure, state.story, log): the base page's demo engine
     workspace   PMW (NAMED, savedLayouts, applyNamed, resetLayout), PMT.agent, PM_HOME.open and PM56_PORT.open for
                 the agents' background opens
     chat        PM56_PORT.demo (the 5.6 Pro chat's port: Concepts/chat-assistant-concepts/5.6 Pro/pm7-port/js/
                 50-demo-bridge.js): its recorded examples, moments, takes and Reset all
     usage       PMU.live (pause, resume, hour), PMU.charts.gallery, PM_PAGES.go
     notices     PM_TITLEBAR_NOTIFY.demo (pm7-notifications), else window.toast / toast.important
     looks       PM7_SETTINGS_TOME.setChromeThemeFamily / Mode (the title-bar menu's path), PM_NIER.set,
                 PM_NIER_CHIPS.popup, PM12_KIMI.setSettingFromHost (Reduce animations), O55.sound.setMuted
     pip         PMLogo (svg, mark, MOODS, TRAY, EXPORT), PM_PIP_LOADER (html, busy, mount, stats, hold), the live Pips'
                 faces (O55.pipStage.of(host).feel in onboarding, PM56_PIP.feel in the chat), O55.pipVoice and
                 O55.sound.pip (Pip's kits, loops and voice), PM_TB_DENSITY for a squeezed title bar
     title bar   PM_PROJECT_BOX (add, select, state, open) over PM_WORK (scenario, fixture.define), PM_TB_DENSITY,
                 PM_HOME.open for an unsaved file
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
    { id: 'ai', ids: ['cliMissing', 'signedOut', 'copiedUnavailable', 'remoteAi', 'noAi'], one: true },
    /* Pip's rough moments (W3): a browser sign-in that does not finish the first time; the second try works. They stack
       with every other group (the fixtures' signin_once) */
    { id: 'pip', ids: ['antigravityOnce', 'githubSigninOnce'] }
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

  /* ---- onboarding with Pip (W3): moments that open a screen and then do what a person would there, through the
     window's own calls, so the real state shows (Pip's oops face and line, the warning under the field, the failed
     sign-in). The window mounts two frames after O55.ui.open, so each step waits for its screen. O55.ui.act presses the
     on-screen control as the click dispatcher does and O55.ui.fill types into a bound field through its binding (lane
     onb); a page without them calls the same screen action its control would (O55.screens.defs[screen].do / .bind,
     what the window's click and input handlers call). ---- */
  const OUI = () => O55.ui || null;
  function whenScreen(id, step, ms) {
    const until = performance.now() + (ms || 4000);
    const tick = () => {
      const S = OUI() && OUI().S, on = S && S.open && S.root && S.sess && S.sess.screen === id;
      const layer = on ? S.root.querySelector('.o55-pane > .o55-layer:not(.o55-out)') : null;
      if (layer) { try { step(S); } catch (e) { console.error('[demo studio] onboarding step', id, e); } return; }
      if (performance.now() < until) O55.motion.real.setTimeout(tick, 80);
    };
    O55.motion.real.setTimeout(tick, 120);
  }
  function screenAct(S, screen, name, arg) {
    if (fn(OUI(), 'act')) return OUI().act(name, arg);
    const d = O55.screens && O55.screens.defs[screen];
    return d && d.do && fn(d.do, name) ? d.do[name](S, arg) : false;
  }
  function screenFill(S, screen, bind, value) {
    if (fn(OUI(), 'fill')) return OUI().fill(bind, value);
    const field = S.root.querySelector(`[data-o55-bind="${CSS.escape(bind)}"]`), d = O55.screens && O55.screens.defs[screen];
    if (!field || !d || !d.bind) return false;
    field.value = value;
    const h = d.bind[bind]; if (typeof h === 'function') h(S, value, field, null);
    return true;
  }
  /* the three oops moments (pip.oops.*): what each needs from the situation, the screen and the steps on it */
  const CURSOR_KEY = 'sk-cur-0042';   /* 11 characters: 12 or more passes the real check (73-screens-ai.js keyCheck) */
  const OOPS = [
    { id: 'nameTaken', screen: 'name', base: 'returning', run: (S) => (fn(OUI(), 'fill') ? screenFill(S, 'name', 'name', 'Tastebook') : screenAct(S, 'name', 'suggest', 'Tastebook')) },
    { id: 'keyRefused', screen: 'ai', run: (S) => {
      screenAct(S, 'ai', 'key', 'cursor');
      O55.motion.real.setTimeout(() => { if (screenFill(S, 'ai', 'key:cursor', CURSOR_KEY)) screenAct(S, 'ai', 'keyCheck', 'cursor'); }, 260);
    } },
    { id: 'signinOnce', screen: 'ai', twist: 'antigravityOnce', run: (S) => screenAct(S, 'ai', 'signin', 'antigravity') }
  ];
  /* Ask Pip: a screen with one ? note open (O55.ui.tip, the id its ? carries: pip.tips.<screen>) */
  const ASKS = [
    { id: 'look', screen: 'look', tip: 'pickFamily:friendly' },
    { id: 'where', screen: 'where', tip: 'pick:this' },
    { id: 'name', screen: 'name', tip: 'field:name' },
    { id: 'provider', screen: 'ai', tip: 'provider:cursor' },
    { id: 'free', screen: 'free', tip: 'route:free-openrouter' }
  ];
  const pipOnboarding = {
    OOPS, ASKS,
    avail: () => onboarding.avail() && !!(O55.screens && O55.screens.defs),
    oopsAvail: (id) => { const o = OOPS.find((x) => x.id === id); return !!o && pipOnboarding.avail() && hasScreen(o.screen) && (!o.twist || !!(O55.fixtures && O55.fixtures.SCENARIOS[o.twist])); },
    askAvail: (id) => { const a = ASKS.find((x) => x.id === id); return !!a && pipOnboarding.avail() && hasScreen(a.screen) && fn(OUI(), 'tip'); },
    /* the situation it runs in: the one picked, with the moment's own start and twist */
    oops(id, pick) {
      const o = OOPS.find((x) => x.id === id); if (!o) return false;
      const p = Object.assign({}, pick || parseSituation(currentSituation()));
      if (o.base) p.base = o.base;
      p.twists = (p.twists || []).slice();
      if (o.twist && !p.twists.includes(o.twist)) p.twists = toggleTwist(p, o.twist).pick.twists;
      onboarding.screen(o.screen, joinSituation(p));
      whenScreen(o.screen, (S) => O55.motion.real.setTimeout(() => o.run(S), 380));
      return true;
    },
    ask(id, pick) {
      const a = ASKS.find((x) => x.id === id); if (!a) return false;
      onboarding.screen(a.screen, pick ? joinSituation(pick) : null);
      whenScreen(a.screen, () => O55.motion.real.setTimeout(() => OUI().tip(a.tip), 320));
      return true;
    }
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
  const AGENT_CWD = '~/tastebook/api';
  const AGENT_OPENS = [
    { spec: { kind: 'terminal', id: 'terminal:agent-bench', session: 'agent-bench', cwd: AGENT_CWD, invocation: 'cargo bench --bench analytics', label: 'cargo bench · api', by: 'agent:Query Analyzer' } },
    { spec: { kind: 'browser', id: 'browser:2', url: 'https://app.internal/dashboards/query-performance?tenant=214', label: 'Dashboard · tenant 214', by: 'agent:Query Analyzer' } },
    { chat: true, spec: { kind: 'plan', id: 'plan:ap-embeds', label: 'Evidence pack for the read-path work', by: 'agent:Builder' } },
    { spec: { kind: 'editor', path: 'src/analytics/index_hints.rs', line: 1, mode: 'keep', by: 'agent:Builder' } },
    { chat: true, spec: { kind: 'run', id: 'crew-work:crew-query-perf', label: 'Crew · Query Performance Rollout', by: 'agent:Builder' } },
    { chat: true, spec: { kind: 'transcript', id: 'thread-agent-schema', label: 'Schema Reviewer', by: 'agent:Query Performance' } }
  ];
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
    /* agents open things behind the person's work (D8): six background opens on the panels' own open API; the tabs the
       assistant chat draws go through PM56_PORT.open so the chat fills them */
    agentsAvail: () => !!(HOME() && fn(HOME(), 'open')),
    agents() {
      goHome();
      const gap = O55.motion.reduced() ? 0 : 260, P = W('PM56_PORT');
      AGENT_OPENS.forEach((a, i) => O55.motion.real.setTimeout(() => {
        try {
          if (a.chat && P && fn(P, 'open')) P.open(a.spec.id, { by: a.spec.by, background: true, label: a.spec.label });
          else HOME().open(Object.assign({}, a.spec));
        } catch (e) { console.error('[demo studio] agent open', a.spec.id, e); }
      }, i * gap));
      return true;
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

  /* ---- the title bar (W1, W2; option A "Tab" only). The project box's badge is the work projection's state for the
     project (PM_PROJECT_BOX.state over PM_WORK.project, B5: needs you > blocked > working > unsaved > calm), so a state
     here is a small scene of the Studio's own loaded into the projection (PM_WORK.fixture.define, then scenario): the
     badge, the menu's rows, the status bar and the tray all read the same thing. Unsaved is Home's own (a tab with
     unsaved changes): it opens a file to type into. The width is a Studio-owned attribute (html[data-pmds-tbw] with
     --pmds-tbw, 50-demo-studio.css caps .title-bar), and the bar's own density ladder (PM_TB_DENSITY) folds it for real:
     the brand to Pip's mark, then the box to its folder. Nothing here is stored. ---- */
  const BOX = () => W('PM_PROJECT_BOX'), WORK = () => W('PM_WORK'), DENS = () => W('PM_TB_DENSITY');
  const BOX_STATES = ['calm', 'working', 'blocked', 'needs', 'unsaved'];
  const BOX_KEY = { calm: '', working: 'working', blocked: 'blocked', needs: 'waiting', unsaved: 'change-modified' };
  const TB_WIDTHS = ['full', '1280', '1024', '860'];
  const LONG = { id: 'tastebook-mobile-companion', path: '~/Projects/tastebook-mobile-companion', branch: 'main', stack: 'Expo + Axum + Postgres' };
  const UNSAVED_FILE = 'src/main.rs';
  function activeProject() {
    try { const t = tome(), p = t && fn(t, 'project') ? t.project() : null; if (p && p.id) return p.id; } catch (_) {}
    const row = document.querySelector('#projectMenu .pm6-tb-menu-item.is-selected[data-project]');
    return row ? row.getAttribute('data-project') : 'tastebook';
  }
  /* the Studio's scenes: one item on the active project in that state (its words are the Studio's copy) */
  const SCENE = (state) => `studio-box-${state}`;
  function sceneItems(state) {
    const p = activeProject(), now = Date.now(), k = `studio.workspace.titlebar.scene.${state}`;
    if (state === 'calm') return [];
    const it = { id: `pmds-box-${state}`, kind: 'agent', role: 'main', project: p, surface: 'assistant', where: T(`${k}.where`), title: T(`${k}.title`),
      detail: T(`${k}.detail`), model: 'Claude Sonnet 4.6', state: BOX_KEY[state], startedAt: now - 140000 };
    if (state === 'needs') Object.assign(it, { ask: T(`${k}.ask`), askedAt: now - 30000 });
    return [it];
  }
  function ensureScene(state) {
    const Wk = WORK(); if (!Wk || !Wk.fixture || !fn(Wk.fixture, 'define')) return false;
    if ((Wk.SCENARIOS || []).indexOf(SCENE(state)) < 0) Wk.fixture.define(SCENE(state), () => ({ items: sceneItems(state), servers: [] }));
    return true;
  }
  const brand = () => document.querySelector('.title-bar .app-name');
  const titlebar = {
    STATES: BOX_STATES, WIDTHS: TB_WIDTHS, LONG,
    avail: () => !!(BOX() && fn(BOX(), 'state')),
    stateAvail: () => titlebar.avail() && !!(WORK() && fn(WORK(), 'scenario') && WORK().fixture && fn(WORK().fixture, 'define')),
    /* what the box shows now, as one of the five */
    state() {
      if (!titlebar.avail()) return null;
      let s = { key: '', say: '' }; try { s = BOX().state(activeProject()) || s; } catch (_) {}
      const id = BOX_STATES.find((x) => BOX_KEY[x] === (s.key || '')) || 'calm';
      return { id, say: s.say || '' };
    },
    setState(state) {
      if (!BOX_STATES.includes(state) || !ensureScene(state === 'unsaved' ? 'calm' : state)) return false;
      WORK().scenario(SCENE(state === 'unsaved' ? 'calm' : state));
      if (fn(BOX(), 'refresh')) BOX().refresh();
      if (state === 'unsaved' && HOME() && fn(HOME(), 'open')) { goHome(); HOME().open({ kind: 'editor', path: UNSAVED_FILE, line: 1 }); }
      return true;
    },
    /* a long name: the project the box adds for it (its one row renderer, as onboarding adds a new Project), then a
       switch to it; off goes back to the project it came from */
    longAvail: () => titlebar.avail() && fn(BOX(), 'add') && fn(BOX(), 'select'),
    longOn: () => activeProject() === LONG.id,
    setLong(on) {
      const B = BOX();
      if (on) {
        if (!titlebar.longOn()) titlebar.from = activeProject();
        /* a new Project opens in its own settings (Basic Dark): it takes the look on screen, through the title-bar
           menu's own path, so the long name is seen in the look being reviewed */
        const was = lookNow();
        B.add(LONG.id, { path: LONG.path, branch: LONG.branch, stack: LONG.stack });
        const ok = B.select(LONG.id);
        O55.motion.real.setTimeout(() => { try { const n = lookNow(); if (titlebar.longOn() && (n.look !== was.look || n.setMode !== was.setMode)) looks.set(was.look, was.setMode); } catch (_) {} }, 360);
        return ok;
      }
      return B.select(titlebar.from && titlebar.from !== LONG.id ? titlebar.from : 'tastebook');
    },
    from: null,
    widthAvail: () => !!document.querySelector('.title-bar'),
    width: () => document.documentElement.getAttribute('data-pmds-tbw') || 'full',
    setWidth(v) {
      const de = document.documentElement, px = parseInt(v, 10);
      if (!px) { de.removeAttribute('data-pmds-tbw'); de.style.removeProperty('--pmds-tbw'); }
      else { de.setAttribute('data-pmds-tbw', String(px)); de.style.setProperty('--pmds-tbw', `${px}px`); }
      try { if (DENS() && fn(DENS(), 'apply')) DENS().apply(); } catch (_) {}
      return true;
    },
    /* the bar's folds, read off the bar: the brand (full | mark) and the project box (full | icon) */
    folds() { const b = brand(), w = document.getElementById('projectMenuWrap'); return { brand: (b && b.getAttribute('data-mode')) || 'full', box: (w && w.getAttribute('data-mode')) || 'full' }; },
    /* Mark only: the widest bar at which the brand folds to Pip's mark, found by stepping the bar in from where it is
       (each step runs the ladder in the same task, PM_TB_DENSITY.apply) */
    markAvail: () => !!(document.querySelector('.title-bar .app-name .pm-brand-mark') && DENS() && fn(DENS(), 'apply')),
    markOnly() {
      const bar = document.querySelector('.title-bar'); if (!bar || !titlebar.markAvail()) return 0;
      const start = Math.floor(bar.getBoundingClientRect().width);
      for (let w = start; w >= 560; w -= 16) { titlebar.setWidth(w); if (titlebar.folds().brand === 'mark') return w; }
      titlebar.setWidth('full');
      return 0;
    },
    /* the menu opens after the click that asked for it has finished (the bar's menus close on a click outside them) */
    menuAvail: () => titlebar.avail() && fn(BOX(), 'open'),
    openMenu() { O55.motion.real.setTimeout(() => { try { BOX().open(); } catch (_) {} }, 0); return true; }
  };

  /* ---- Pip (W1, W4, W5): the kit's drawings in every look, the faces on every live Pip, the loader, Pip's sound ---- */
  const LOGO = () => W('PMLogo'), LOADER = () => W('PM_PIP_LOADER'), VOX = () => (O55.pipVoice || null);
  const PIP_HOLD = 2600;
  const svgCache = new Map();
  /* the live Pips a face reaches: onboarding's stage while its window is open, and the chat's sheet hosts */
  function liveStage() {
    const S = OUI() && OUI().S, host = S && S.open && S.root ? S.root.querySelector('.o55-stage') : null;
    return host && O55.pipStage && fn(O55.pipStage, 'of') ? O55.pipStage.of(host) : null;
  }
  const chatPip = () => { const C = W('PM56_PIP'); return C && fn(C, 'feel') ? C : null; };
  const pip = {
    avail: () => !!(LOGO() && fn(LOGO(), 'svg') && LOGO().LOOKS),
    looks: () => (pip.avail() ? LOGO().LOOKS.slice() : []),
    moods: () => (pip.avail() && LOGO().MOODS ? LOGO().MOODS.slice() : []),
    /* the tray's faces in the order its one reducer picks them (A3), each with the face it draws */
    tray: () => (pip.avail() && LOGO().TRAY ? LOGO().TRAY.order.map((key) => ({ key, mood: LOGO().TRAY.faces[key] })) : []),
    ground: (look) => { const e = pip.avail() && LOGO().EXPORT ? LOGO().EXPORT[look] : null; return e ? e.bg : ''; },
    /* a still drawing in any look (literal colours: the page paints only its own look), kept per painted look */
    svg(o) {
      const key = `${LOGO().look()}|${o.look}|${o.form}|${o.px}|${o.mood || 'idle'}|${o.ink || ''}`;
      if (svgCache.has(key)) return svgCache.get(key);
      let out = ''; try { out = LOGO().svg(Object.assign({ decorative: true, motion: null }, o)); } catch (_) { out = ''; }
      if (svgCache.size > 400) svgCache.clear();
      svgCache.set(key, out);
      return out;
    },
    /* the painted look's own mark (colour roles, so it repaints with the look) */
    mark: (o) => { try { return LOGO().mark(Object.assign({ decorative: true }, o)); } catch (_) { return ''; } },
    live() { const C = chatPip(); return { stage: !!liveStage(), chat: C && fn(C, 'hosts') ? C.hosts().length : 0 }; },
    /* a face on every live Pip, for a moment; each goes back to its own face after it */
    feel(mood) {
      const st = liveStage(); if (st && fn(st, 'feel')) st.feel(mood, PIP_HOLD);
      const C = chatPip(); if (C) C.feel(mood, PIP_HOLD);
      return pip.live();
    },
    /* the loader (W5): its three motions as a take (the product picks one by context, L5, never a setting) */
    loaderAvail: () => !!(LOADER() && fn(LOADER(), 'html')),
    motions: () => (LOADER() && LOADER().MOTIONS ? LOADER().MOTIONS.slice() : ['swing', 'think', 'hop']),
    loader: (motion, px) => LOADER().html({ motion, px, size: `${px}px` }),
    arm: (root) => { try { if (LOADER() && fn(LOADER(), 'mount')) LOADER().mount(root); } catch (_) {} },
    busy: (host, on) => (LOADER() && fn(LOADER(), 'busy') ? LOADER().busy(host, on, { slot: 'end', px: 16, motion: 'swing' }) : false),
    stats: () => (LOADER() && fn(LOADER(), 'stats') ? LOADER().stats() : null),
    holdAvail: () => !!(LOADER() && fn(LOADER(), 'hold')),
    held: () => !!(LOADER() && fn(LOADER(), 'held') && LOADER().held()),
    setHold: (on) => LOADER().hold(!!on),
    /* Pip's sound: the six kits (by the look, or one chosen), the stage and vocal events, the loops, a line said */
    soundAvail: () => !!(VOX() && fn(VOX(), 'play') && O55.sound),
    kits: () => (VOX() && VOX().KITS ? VOX().KITS.slice() : []),
    kitFor: (choice) => (choice && choice !== 'look' ? choice : VOX() && fn(VOX(), 'kitOf') ? VOX().kitOf(LOGO() ? LOGO().look() : 'basic-dark') : 'basic'),
    /* the events Pip's own kits play (the window's clicks are O55.sound's, its one vocabulary: DR-043) */
    events() {
      const V = VOX(); if (!V || !V.EVENTS) return [];
      const vocal = ['wake', 'sleep', 'think', 'happy', 'wink', 'alert', 'cheer', 'crew'];
      const ui = ['tap', 'hover', 'select', 'toggleOn', 'toggleOff', 'next', 'back', 'open', 'close', 'key', 'warn', 'chapter'];
      return [
        { id: 'stage', ids: V.EVENTS.filter((e) => !vocal.includes(e) && !ui.includes(e)) },
        { id: 'vocal', ids: V.EVENTS.filter((e) => vocal.includes(e)) },
        { id: 'window', ids: ui.filter((e) => O55.sound.EVENTS && O55.sound.EVENTS.includes(e)), window: true }
      ].filter((g) => g.ids.length);
    },
    loops: () => (VOX() && VOX().LOOPS ? VOX().LOOPS.slice() : []),
    muted: () => !!(O55.sound && O55.sound.muted),
    play(event, choice, windowOwn) {
      if (windowOwn) return O55.sound.play(event) !== false;
      return !!VOX().play(event, { kit: pip.kitFor(choice) });
    },
    loopsOn: {},
    setKit(choice) { const V = VOX(); if (V && fn(V, 'setTheme')) V.setTheme(pip.kitFor(choice)); },
    loop(name, on, choice) { pip.setKit(choice); VOX().loop(name, on ? 1 : 0); pip.loopsOn[name] = !!on; },
    stopLoops() { const V = VOX(); Object.keys(pip.loopsOn).forEach((n) => { if (pip.loopsOn[n] && V) V.loop(n, 0); pip.loopsOn[n] = false; }); },
    /* one voice (found's O55.sound.pip; onboarding's stage voice when that is all the page has) */
    say(text, mood, choice) {
      const kit = pip.kitFor(choice), P = O55.sound && O55.sound.pip;
      if (P && fn(P, 'say')) return P.say(text, { mood, voice: kit, where: 'setup' }) || { played: false };
      return Object.assign({ played: false }, VOX() && fn(VOX(), 'say') ? VOX().say(text, { mood, kit }) : null);
    },
    voicePart: () => { const P = W('PM_PIP_PARTS'); return !P || !fn(P, 'get') || P.get('setup-voice') !== false; }
  };

  /* ---- the assistant chat: the 5.6 Pro chat's demo content (DECISIONS.md D26), through PM56_PORT.demo. The lists
     (recorded examples by feature, moments by group, take families) come from the chat itself; the Studio's copy names
     each by its id (studio.chat.*), and anything the copy does not know yet keeps the chat's own words. Every run brings
     the chat on screen first. ---- */
  const chatApi = () => { const P = W('PM56_PORT'); return P && P.demo && fn(P.demo, 'avail') ? P.demo : null; };
  const words = (key, fallback) => { const v = O55.tx(key); return typeof v === 'string' ? v : fallback; };
  const chat = {
    avail: () => { try { return !!(chatApi() && chatApi().avail()); } catch (_) { return false; } },
    /* recorded examples: [{ id, label, lead, items: [{ id, label, sub, action, data }] }] in the Studio's words */
    guided() {
      if (!chat.avail()) return [];
      return chatApi().guided().map((g) => ({ id: g.id, label: words(`studio.chat.guided.groups.${g.id}.title`, g.id), lead: words(`studio.chat.guided.groups.${g.id}.lead`, ''),
        items: g.items.map((it) => Object.assign({}, it, { label: words(`studio.chat.guided.items.${it.id}.title`, it.label), sub: words(`studio.chat.guided.items.${it.id}.sub`, it.sub) })) }));
    },
    moments() {
      if (!chat.avail()) return [];
      return chatApi().groups().map((g) => ({ id: g.id, label: words(`studio.chat.moments.groups.${g.id}.title`, g.id), lead: words(`studio.chat.moments.groups.${g.id}.lead`, ''),
        items: g.items.map((it) => Object.assign({}, it, { label: words(`studio.chat.moments.items.${it.id}`, it.label) })) }));
    },
    /* take families: [{ id, index, label, sub, options: [{ index, label, note }], value }] */
    families() {
      if (!chat.avail()) return [];
      return chatApi().families().map((f) => ({ id: f.id, index: f.index, label: words(`studio.chat.takes.families.${f.id}.title`, f.label), sub: words(`studio.chat.takes.families.${f.id}.sub`, ''), value: f.value,
        options: f.options.map((o, i) => ({ index: i, label: words(`studio.chat.takes.options.${f.id}.${i}`, o), note: words(`studio.chat.takes.notes.${f.id}.${i}`, '') })) }));
    },
    recipes() { return chat.avail() ? chatApi().recipes().map((r) => ({ index: r.index, label: words(`studio.chat.takes.recipes.${r.index}.title`, r.name), sub: words(`studio.chat.takes.recipes.${r.index}.sub`, r.desc) })) : []; },
    recipe: () => (chat.avail() ? chatApi().recipe() : -1),
    voices: () => (chatApi() ? chatApi().voices() : []),
    voice: () => (chat.avail() ? chatApi().voice() : 'auto'),
    counts() {
      const n = (list) => list.reduce((s, g) => s + g.items.length, 0);
      return chat.avail() ? { guided: n(chatApi().guided()), moments: n(chatApi().groups()), takes: chatApi().families().length } : { guided: 0, moments: 0, takes: 0 };
    },
    now: () => (chat.avail() && fn(chatApi(), 'now') ? chatApi().now() : null),
    runGuided: (id) => chatApi().runGuided(id),
    run: (group, id) => chatApi().run(group, id),
    setTake: (family, i) => chatApi().setTake(family, i),
    setRecipe: (i) => chatApi().setRecipe(i),
    setVoice: (v) => chatApi().setVoice(v),
    show: () => chatApi().showChat(),
    reset: () => chatApi().reset()
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
    { id: 'nierTour', icon: 'pod', kind: 'launch', avail: () => looks.nierAvail() && tour.avail(), run: () => { if (!looks.nierOn()) looks.setNier(true); O55.motion.real.setTimeout(() => tour.start(), 420); return true; } },
    /* the assistant chat: a live agent turn (a moment: the Studio stays open beside the chat) and the Wonderer and Grill
       Me showcase (a recorded example: it plays on its own) */
    { id: 'chatWork', icon: 'chat', kind: 'stay', avail: () => chat.avail(), run: () => chat.run('live', 'live-agent-turn').ok },
    { id: 'chatGrill', icon: 'wonder', kind: 'launch', avail: () => chat.avail(), run: () => chat.runGuided('wonderer-crew').ok },
    /* Pip's rough day (W3): back with Projects from before, Antigravity's sign-in fails once, from the Name screen (the
       name Tastebook is taken there, and the AI chapter's sign-in fails the first time) */
    { id: 'pipRoughDay', icon: 'pip', kind: 'launch', avail: () => onboarding.avail() && hasScreen('name') && !!(O55.fixtures && O55.fixtures.SCENARIOS.antigravityOnce),
      run: () => onboarding.screen('name', 'returning+antigravityOnce') }
  ];

  O55.studio = {
    BASES, GROUPS, TWISTS, CLASH, SCREEN_CHAPTERS, POINTS, RECIPES, LOOKS,
    parseSituation, joinSituation, situationLabel, situationLong, currentSituation, toggleTwist, applySituation, sitTitle,
    hasScreen, onboardingState, tourChapters, tourState, fmtClock,
    onboarding, pipOnboarding, tour, story, workspace, titlebar, chat, usage, notices, looks, pip, reset, switches,
    /* open/close/toggle are filled in by the UI (92-demo-studio-ui.js) */
    open: () => false, close: () => false, toggle: () => false
  };
})();
