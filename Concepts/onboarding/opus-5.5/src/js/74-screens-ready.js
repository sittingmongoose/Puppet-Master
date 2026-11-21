/* Chapter 5 — Ready [ready]: a truthful summary, the Guided Tour offer (only when a real Project exists) and the
   handoff into the app: the chosen Project selected, Planning Wizard open, the look committed through Settings. */
(function () {
  'use strict';
  const O55 = window.O55, C = O55.c, U = O55.util, T = (k, v) => O55.t(k, v), def = (id, d) => O55.screens.define(id, d);
  const md = (S) => S.sess.drafts.main;

  /* FO-222 (stream F's ruling B): the page reopens in the Project the person was last in, the look's own rule. One record,
     the active Project's id (ACTIVE below), written in one place: where every switch shows, the title-bar menu's selected
     row, which only selectProjectRow (pm6-js-panels.js) sets, for the menu itself and for selectProject below (setup's
     finish, Creating and Review, the Guided Tour); the same signal Settings follows to load a Project's settings. Read at
     load: a Project created by setup (the onboarding record's committed or finished Project) is listed again and selected
     through selectProject; a fixture Project is selected; an id no Project answers to (a cleared record, a removed
     fixture) is dropped and the page opens as before. A page with no storage keeps nothing, as before. The first paint
     reads the same id (base/script/script-001.js). The Project's look stays where it is: Settings' record per Project. */
  const ACTIVE = 'pm7:shell:active-project:v1';
  const lsGet = () => { try { return window.localStorage.getItem(ACTIVE) || ''; } catch (_) { return ''; } };
  const lsSet = (id) => { try { if (id) window.localStorage.setItem(ACTIVE, id); else window.localStorage.removeItem(ACTIVE); } catch (_) { /* no storage */ } };
  const rowOf = (id) => Array.prototype.find.call(document.querySelectorAll('#projectMenu [data-project]'), (r) => r.getAttribute('data-project') === id) || null;
  /* the Projects setup made or opened, from its own record: the committed one (Creating), and the one it finished into */
  /* (a new install, ?o55=fresh, clears the onboarding record as it boots, 95-boot.js: the Projects it listed are gone
     from this load on, and an active id that named one of them is stale) */
  const freshInstall = (() => { try { return new URLSearchParams(location.search).get('o55') === 'fresh'; } catch (_) { return false; } })();
  /* (a new install's load, as the head reads it (script-001.js o55b.install): ?o55=fresh, or no onboarding record and no
     switch that skips or steers onboarding. It opens in the page's own Project: no stored id is taken, FO-222 round 2, F4) */
  const installLoad = (() => {
    try { const sw = new URLSearchParams(location.search).get('o55') || ''; return sw === 'fresh' || (!O55.store.get('onboarding', null) && sw !== 'off' && sw !== 'tour' && sw.indexOf('screen=') !== 0); } catch (_) { return false; }
  })();
  /* the Projects setup made stay until a new install (FO-222 round 2, F2, the lead's ruling with F's): their own record,
     MADE ({ id, name, info } each), written as selectProject lists one, cleared only by forgetSetup (a new install, Demo
     Studio's resets); a new run of setup keeps them. A record from before it (the Projects only in the onboarding
     record's finished / commit) is still read below. */
  const MADE = 'pm7:shell:setup-projects:v1';
  /* FO-230: O55.store uses shared storage when available and keeps the record in visit memory on opaque previews. */
  const madeGet = () => {
    const list = O55.store.get(MADE, []);
    return Array.isArray(list) ? list.filter((p) => p && typeof p.id === 'string' && p.id) : [];
  };
  const madeSet = (list) => {
    if (list.length) O55.store.set(MADE, list);
    else O55.store.clear(MADE);
  };
  function madeKeep(id, name, info) {
    const list = madeGet(), was = list.find((p) => p.id === id);
    const next = { id, name: name || (was && was.name) || id, info: (info && (info.path || info.branch)) ? info : ((was && was.info) || info || null) };
    madeSet(list.filter((p) => p.id !== id).concat(next));
  }
  /* (FO-230: the fresh-load exclusion is the initial boot's only: restoreEarly and restoreProject run before 95-boot.js
     clears the old record, and must not list its Projects; once boot's forgetSetup has run, the Projects made during
     the visit are setup's own and setupProjects lists them again) */
  let freshBoot = freshInstall;
  function setupProjects() {
    if (freshBoot) return [];
    const rec = O55.store.get('onboarding', null), out = madeGet().map((p) => ({ id: p.id, name: p.name || p.id, info: p.info || null }));
    if (!rec) return out;
    const d = rec.drafts && rec.drafts.main, cm = rec.commit, fin = rec.finished;
    if (fin && fin.project && !out.some((p) => p.id === fin.project)) out.push({ id: fin.project, name: fin.name || (cm && cm.projectId === fin.project && d ? d.project_name : '') || fin.project, info: fin.info || null });
    /* (a committed Project as Review listed it: its name and location line, kept with the commit, R80 P1) */
    if (cm && cm.state === 'done' && cm.projectId && !out.some((p) => p.id === cm.projectId)) out.push({ id: cm.projectId, name: (cm.listed && cm.listed.name) || (d && d.project_name) || cm.projectId, info: (cm.listed && cm.listed.info) || null });
    return out;
  }
  let restoring = null;
  /* (the Projects the page lists by itself, as it loads) */
  const rowOfFixtureAtLoad = new Set(Array.prototype.map.call(document.querySelectorAll('#projectMenu [data-project]'), (r) => r.getAttribute('data-project')));
  /* (the page's own default Project: the first row its markup lists, the one it selects, tastebook) */
  const defaultProject = rowOfFixtureAtLoad.values().next().value || '';
  /* early, as this script runs (the title bar is in the page, the Project box is not wired yet, Settings has not read
     the Project): the id the page opens on */
  let staleLoaded = false;
  (function restoreEarly() {
    const id = lsGet(); if (!id || installLoad) return;
    const made = setupProjects().find((p) => p.id === id);
    /* (an id no Project answers to: dropped, and the page is the default Project's again, as before; Settings, which the
       head pointed at it, loads the default Project at boot) */
    if (!rowOf(id) && !made) { lsSet(''); if (window.PM_ACTIVE_PROJECT_ID === id) { delete window.PM_ACTIVE_PROJECT_ID; staleLoaded = true; } return; }
    window.PM_ACTIVE_PROJECT_ID = id;
    restoring = made || { id, name: null, info: null };
    /* the title bar names it now, not at boot: this script runs after the title bar is in the page, and the box (wired
       at boot) would show the page's own Project until then, 4.6-5.1 s on F's films (FO-222 round 2, F1). The label, and
       the selected row: a fixture Project's own row, or none until boot lists the setup Project's row and selects it. */
    const fix = rowOf(id), label = document.getElementById('projectMenuLabel');
    const name = fix ? (fix.getAttribute('data-project-name') || id) : ((made && made.name) || id);
    if (label && label.textContent !== name) label.textContent = name;
    /* (a setup Project's row is in the menu before the box is wired, selected, with the attributes PM_PROJECT_BOX.add
       gives one: the box's own renderer draws it as it wires, and its badge is that Project's from its first paint, not
       the state of an id it does not know, 'waiting' for 0.2 s on t-b63; restoreProject finds it and confirms) */
    let own = fix;
    if (!own && made) {
      const menu = document.getElementById('projectMenu');
      if (menu) {
        own = document.createElement('button');
        own.type = 'button'; own.className = 'pm6-tb-menu-item'; own.setAttribute('role', 'menuitem'); own.setAttribute('data-project', id);
        if (made.name && made.name !== id) own.setAttribute('data-project-name', made.name);
        ['path', 'branch'].forEach((k) => { if (made.info && made.info[k]) own.setAttribute('data-project-' + k, made.info[k]); });
        own.setAttribute('data-command-id', 'cmd.project.switch_active_tab'); own.setAttribute('data-binding-id', 'shell.project.pick'); own.setAttribute('data-o55-added', '');
        /* (its name as its text until the renderer draws it, as the page's own rows have theirs: an empty button was
           given a title by the page's labelling pass, which a row the box adds never has) */
        own.textContent = made.name || id;
        menu.insertBefore(own, menu.querySelector('[data-project]') || menu.querySelector('.pm6-tb-project-sep'));
      }
    }
    document.querySelectorAll('#projectMenu .pm6-tb-menu-item.is-selected[data-project]').forEach((r) => { if (r !== own) r.classList.remove('is-selected'); });
    if (own && !own.classList.contains('is-selected')) own.classList.add('is-selected');
  })();

  /* Shell helpers: select a Project in the title-bar menu (adding it when the app doesn't list it yet). The project box
     owns the menu's rows (PM_PROJECT_BOX, pm6-js-panels.js: one row renderer, the label stays the bare name). The Settings
     owner watches the menu and reloads that Project's settings. */
  O55.shell = {
    selectProject(id, name, info) {
      const box = window.PM_PROJECT_BOX;
      if (!box || !id) return false;
      /* info: { path, branch } from the draft, so the row and the hover tag carry the location line (B3) */
      const row = box.add(id, Object.assign({}, info || {}, { name: name || id }));
      if (row && !row.hasAttribute('data-o55-added') && !rowOfFixtureAtLoad.has(id)) row.setAttribute('data-o55-added', '');
      /* (a Project setup made or opened: kept in MADE, with the name and location line it is listed with) */
      if (!rowOfFixtureAtLoad.has(id)) madeKeep(id, name && name !== id ? name : null, info || (row ? { path: row.getAttribute('data-project-path') || '', branch: row.getAttribute('data-project-branch') || '' } : null));
      window.PM_ACTIVE_PROJECT_ID = id;
      box.select(id);
      if (O55.sound && O55.sound.refresh) O55.sound.refresh('project');
      return true;
    },
    /* at boot (the Project box wired): the restored Project's row (listed again when setup made it) and its selection;
       then the one writer of the record follows the selected row */
    restoreProject() {
      /* (every Project setup made or opened is listed again while its record lasts, the active one or not) */
      const box = window.PM_PROJECT_BOX;
      if (box) setupProjects().forEach((p) => { if (!rowOf(p.id)) { const row = box.add(p.id, Object.assign({}, p.info || {}, { name: p.name || p.id })); if (row) row.setAttribute('data-o55-added', ''); } });
      if (restoring && box) { const r = restoring; restoring = null; O55.shell.selectProject(r.id, r.name || r.id, r.info || undefined); }
      /* (a setup row restoreEarly put in the page before the load's labelling pass (wireTitles: every menu row present
         then gets its text as a title, which the hover tag reads first) is the row the box adds, which has none) */
      document.querySelectorAll('#projectMenu [data-o55-added][title]').forEach((r) => { if (r.getAttribute('title') === r.textContent.trim().replace(/\s+/g, ' ')) r.removeAttribute('title'); });
      if (staleLoaded) { staleLoaded = false; if (window.PM12_KIMI && window.PM12_KIMI.reloadProject) { try { window.PM12_KIMI.reloadProject(); } catch (_) {} } }
      const menu = document.getElementById('projectMenu');
      if (!menu || menu.__pmActive) return;
      menu.__pmActive = true;
      const note = () => { const sel = menu.querySelector('.pm6-tb-menu-item.is-selected[data-project]'), id = sel ? sel.getAttribute('data-project') : ''; if (id && id !== lsGet()) lsSet(id); };
      new MutationObserver(note).observe(menu, { attributes: true, subtree: true, attributeFilter: ['class'] });
    },
    /* a new install or a reset of setup's progress (FO-222 round 2, F3, F4): the Projects setup made go, and an active id
       naming one of them; with all, any active id (a new install opens in the page's own Project). Called before every
       clear of the onboarding record for a reset or a new install (95-boot.js ?o55=fresh, 91-demo-studio.js twice). A new
       run of setup (Start over) no longer forgets them (F2). */
    forgetSetup(o) {
      const ids = new Set(setupProjects().map((p) => p.id).concat(madeGet().map((p) => p.id))), id = lsGet();
      if (id && ((o && o.all) || ids.has(id))) lsSet('');
      madeSet([]);
      /* the page forgets them too (R87-P1): their rows leave the title bar's menu (the page's own rows stay), and when the
         Project on screen is one of them the page's default Project is selected through the box first, so the label,
         Settings and its look follow, and no control is left that chooses a forgotten Project and stores its id again.
         Returns whether the Project on screen changed: Settings loads the new one as this turn of the page ends (its
         observer of the menu), so a caller that paints a look next lets that happen first */
      const gone = (pid) => !!pid && ids.has(pid) && !rowOfFixtureAtLoad.has(pid);
      const sel = document.querySelector('#projectMenu .pm6-tb-menu-item.is-selected[data-project]'), box = window.PM_PROJECT_BOX;
      const moved = !!(sel && gone(sel.getAttribute('data-project')) && box && defaultProject && box.select(defaultProject));
      document.querySelectorAll('#projectMenu [data-o55-added][data-project]').forEach((r) => { if (gone(r.getAttribute('data-project'))) r.remove(); });
      /* (FO-230: the boot's exclusion ends here — the first forgetSetup of a fresh load is 95-boot.js's own; from now
         on setupProjects lists what the visit makes) */
      freshBoot = false;
      return moved;
    },
    /* before a new run of setup replaces the onboarding record (R87-P2: Run Onboarding Again, Start over, a finished run
       opened again; 60-ui-core.js open), every Project that record names is kept in setup's own record, so a Project an
       older version listed only there (its finished or committed Project) outlives the new run. Reading the record
       (setupProjects) never writes; this is the one place its Projects move */
    keepSetup() {
      const list = madeGet(), have = new Set(list.map((p) => p.id));
      const add = setupProjects().filter((p) => !have.has(p.id) && !rowOfFixtureAtLoad.has(p.id));
      if (add.length) madeSet(list.concat(add.map((p) => ({ id: p.id, name: p.name || p.id, info: p.info || null }))));
    },
    /* The look chosen in onboarding becomes the saved theme (the preview used persist:false), and NieR Mode's three
       rows, the rest of the look, are saved with it into the same Project (their preview, O55.nierLook).
       Writing the theme repaints it, and the app's own theme listeners (its search width, its tab ink) then re-measure
       the whole page under the window for most of a second (films M4: the Created moment froze). So the theme pair
       (the NieR rows' commit repaints it too) and with o.defer both wait until the moment on screen is over: Ready's
       curtain call and Pod line, the hand-over to the tour, any other close, or the page going away (flushLook). It is
       written once per Project and look; a look changed meanwhile is the one written. */
    commitLook(S, o) {
      look = { S, after: o && typeof o.after === 'function' ? o.after : null };
      if (o && o.defer) return true;
      return writeLook();
    },
    /* the deferred theme pair is written in ms (now without), unless a later flush comes first */
    flushLook(ms) {
      if (!look) return false;
      if (lookTimer) { lookTimer.cancel(); lookTimer = null; }
      if (!(ms > 0)) return writeLook();
      lookTimer = O55.motion.after(ms, () => { lookTimer = null; writeLook(); });
      return true;
    },
    /* o.under: the window still covers the app, so the page changes at once with no page transition of its own and
       the Wizard is drawn whole beneath the window, whose exit is then the only move (final motion QA A1) */
    openWizard(o) {
      const t = document.getElementById('tab-wizard') || document.querySelector('[data-page="wizard"]');
      if (!t) return false;
      const P = window.PM_PAGES, under = !!(o && o.under);
      if (under && P) P.instant = true;
      try { t.click(); } finally { if (P) P.instant = false; }
      return true;
    }
  };

  let look = null, lookTimer = null, lookWritten = '';
  function writeLook() {
    const S = look && look.S, after = look && look.after; look = null;
    if (lookTimer) { lookTimer.cancel(); lookTimer = null; }
    if (!S || !S.sess) return false;
    /* (a NieR preview left lingering by an unfinished close is the window's again until its rows are written: R57 F2) */
    if (O55.nierLook && O55.nierLook.own) O55.nierLook.own();
    /* the theme first (NieR is a theme since Q22: its preview follows this write), then NieR's Adjust rows, so dropping
       the preview finds the stored theme already matching what is painted */
    const d = md(S), tome = window.PM7_SETTINGS_TOME, key = [window.PM_ACTIVE_PROJECT_ID || '', d.theme_family, d.theme_mode].join('|');
    /* (written once per Project and look, while Settings still holds it: a look written here and changed in Settings since
       is written again when it is chosen again, R55 F1 of FO-216) */
    let ok = key === lookWritten && heldNow(d);
    if (!ok) {
      lookWritten = key;
      try { if (tome && tome.setChromeThemeFamily) { tome.setChromeThemeFamily(d.theme_family); tome.setChromeThemeMode(d.theme_mode); ok = true; } } catch (_) {}
      if (!ok) try { window.PM_THEME.setFamily(d.theme_family); window.PM_THEME.setMode(d.theme_mode); } catch (_) {}
    }
    if (O55.nierLook && O55.nierLook.commit) O55.nierLook.commit(S);
    /* (the caller hears once it is written: an unfinished close keeps the saved look it notes in step, R57 F1) */
    if (after) { try { after(); } catch (_) { /* the caller's */ } }
    return ok;
  }
  /* does Settings hold this look now (its Theme is the family's label, 'Glass Light' or 'NieR'; its mode 'Light', 'Dark' or
     'Auto')? Without Settings' values, the write cache alone decides, as it did */
  function heldNow(d) {
    try {
      const P = window.PM51; if (!P || typeof P.value !== 'function') return true;
      const fam = String(P.value('general.visual.theme') || '').trim().split(/[\s-]+/)[0].toLowerCase(), mode = String(P.value('general.visual.theme-mode') || '').toLowerCase();
      return fam === String(d.theme_family || '').toLowerCase() && mode === String(d.theme_mode || '').toLowerCase();
    } catch (_) { return true; }
  }
  /* a page that goes away still saves the look it was given */
  window.addEventListener('pagehide', () => { if (look) writeLook(); });

  /* finish(S, {tour, project}) — close onboarding as done and land in the app. */
  O55.finish = function finish(S, o) {
    /* how the app talks to me goes with the person into the app (general.interaction.mode, 21-talk.js) */
    if (O55.talk) O55.talk.carry();
    o = o || {};
    /* Enter answers on the click's own frame (final motion QA A1: the click's task, which selects the Project, reloads
       its settings and puts the Wizard in place, held the first frame 0.5-1.2 s on the P1000): the window settles a
       touch on the compositor, and the work and the window's exit follow in the task after that frame */
    if (!o.tour && !o.answered) {
      if (S.finishing) return;
      S.finishing = true;
      if (S.root) S.root.classList.add('o55-accept');
      requestAnimationFrame(() => window.setTimeout(() => { S.finishing = false; finish(S, Object.assign({}, o, { answered: true })); }, 0));
      return;
    }
    O55.shell.commitLook(S, { defer: true });
    const cm = S.sess.commit || {}, d = md(S);
    const projectId = o.project || cm.projectId, name = o.projectName || (cm.projectId === projectId ? d.project_name : null) || projectId;
    /* what was set up goes to the app first (Server, route, this device, the Project: O55.handoff), so the Settings
       reload that selecting the Project starts already finds it (SCR-03) */
    if (O55.handoff) O55.handoff.publish(S, Object.assign({}, o, { project: projectId || null, projectName: name || null }));
    if (projectId) O55.shell.selectProject(projectId, name, o.projectInfo);
    /* (with the Project's name and location line, so a reload lists it again as it is now: FO-222) */
    const fRow = projectId ? Array.prototype.find.call(document.querySelectorAll('#projectMenu [data-project]'), (r) => r.getAttribute('data-project') === projectId) : null;
    const fInfo = o.projectInfo || (fRow ? { path: fRow.getAttribute('data-project-path') || '', branch: fRow.getAttribute('data-project-branch') || '' } : null);
    S.sess.finished = { at: new Date().toISOString(), tour: !!o.tour, project: projectId || null, name: name || null, info: fInfo };
    const tour = !!(o.tour && O55.tour && O55.tour.start);
    /* the tour path: the window becomes the tour's first callout (a morph from its rectangle; under NieR Mode one ink
       line carries it there, with the same Pod flying along: O55.nierWindow.handoff(), results/h4c-handover-contract.md);
       the tour itself ends on the Planning Wizard, so the page is not switched here */
    const win = S.root && S.root.querySelector('.o55-win'), from = tour && win ? win.getBoundingClientRect() : null;
    const handoff = tour && from && O55.nierWindow && O55.nierWindow.handoff ? O55.nierWindow.handoff() : null;
    /* Enter: the Wizard is put in place under the window first, so the window's exit reveals it (one move, never Home) */
    if (!tour) O55.shell.openWizard({ under: true });
    O55.ui.close('done', { handoff: tour && !!from });
    /* a tour taken at the end of an onboarding run always starts at its first step (only the resume chip continues one) */
    if (tour) O55.tour.start({ source: 'onboarding', fresh: true, project: projectId, from: from ? { left: from.left, top: from.top, width: from.width, height: from.height } : null, handoff });
    /* the theme is written once the window has handed over (the line has reached the tour), or has gone: its repaint
       restyles the whole app, so it waits for the first quiet moment after the window has left rather than landing in
       the middle of its exit */
    if (handoff) O55.shell.flushLook(1600);
    else {
      let done = false;
      const flush = () => { if (done) return; done = true; window.removeEventListener('o55:onboarding-gone', gone); O55.shell.flushLook(0); };
      const gone = () => (window.requestIdleCallback ? window.requestIdleCallback(flush, { timeout: 500 }) : O55.motion.after(120, flush));
      window.addEventListener('o55:onboarding-gone', gone);
      O55.motion.after(2500, flush);
    }
  };

  function summary(S) {
    const d = md(S), cm = S.sess.commit || {}, ai = O55.ai ? O55.ai.readyIds(S) : [], free = O55.ai ? O55.ai.freeReady(S) : 0, b = S.sess.backup;
    /* Free Models and Backup have a ? beside their name (summary:<row>), the note under the summary */
    const row = (k, v, ok) => `<div class="o55-revrow" data-key="sum-${k}"${O55.tips.described('summary:' + k)}><span class="o55-revk"><span class="o55-labq">${U.esc(T('ready.' + k))}${O55.tips.q('summary:' + k)}</span></span><span class="o55-revv">${U.esc(v)}</span>${ok ? C.pill('ready', T('ai.ready')) : ''}</div>`;
    let out = '';
    /* (files kept on a NAS or another device are named beside where the work happens, as Review's two rows do: the row
       read "Book club site · This computer" for files on Home NAS, sweep SW-05) */
    const away = d.project_mode === 'existing_local' ? d.project_transport !== 'local' : d.storage_mode === 'network_location';
    if (cm.state === 'done') out += row('project', away ? T('ready.projectFiles', { name: d.project_name, where: O55.review.whereWork(S), files: O55.review.filesAt(S) }) : d.project_name + ' · ' + O55.review.whereWork(S), true);
    /* the online copy the commit made or brought in (Opus p74: Ready never named it) */
    if (cm.state === 'done' && d.online_mode !== 'none' && !cm.skipOnline && O55.review.onlineLine(S)) out += row('online', O55.review.onlineLine(S), true);
    /* a usable free route is an AI too: free-only is not "can't plan" (provider-login audit P18) */
    out += row('ai', ai.length ? ai.map((id) => O55.ai.pname(O55.fixtures.provider(id))).join(', ') : free ? T('ready.aiFreeOnly') : T('ready.noAi'), ai.length > 0 || free > 0);
    out += row('free', free ? free + ' ' + T('free.ready').toLowerCase() : T('ready.noFree'), free > 0);
    /* (p37: a way in left for later is said, so Ready does not read like it was set up) */
    if ((S.sess.awaySetup || {}).state === 'later') out += row('away', T('ready.awayLater'), false);
    out += row('backup', b.dest ? O55.backup.label(S, b.dest) + (b.state === 'done' ? '' : ' · ' + T('protect.later').toLowerCase()) : T('ready.noBackup'), b.state === 'done');
    return out;
  }
  const noAi = (S) => !!O55.ai && !O55.ai.readyIds(S).length && !O55.ai.freeReady(S);
  def('ready', {
    chapter: 'ready', stage: 'ready',
    scene: () => ({ id: 'ready', beat: 'curtain' }),
    /* the end of the flow: once the curtain scene has arrived, the troupe celebrates. Its celebration is the one sound
       of that moment (it played a commit on top); Reduced Motion has no celebration, and so no sound then either. */
    /* (under NieR's art the troupe takes a curtain call instead, and points at the next step: O55.nierWindow.ready, hero
       spec H4b; no second confetti. The four looks take theirs too: O55.famWindow.ready, asked through the same skin
       after NieR's; this celebration remains for Reduced Motion and a low-resource computer) */
    mounted(S, layer, fresh) {
      /* the look waiting to be saved (O55.shell.commitLook) is written once Ready's moment and Pod's line are over */
      if (fresh) O55.shell.flushLook(4000);
      /* Almost ready (no AI and no free model) stays calm: no curtain call from any look's skin (the family one is
         confetti, a crew cheer and a wink on Pip's stage; NieR's the bows and the sting), as no confetti here (FO-18: the
         skin ran before the check below) */
      if (!fresh || noAi(S) || O55.ui.skin('ready', layer, fresh)) return;
      /* (beneath Ready's lettered emblem, as the curtain call's burst is: 66-family-window.js A.famCall.lettered) */
      O55.motion.after(1250, () => { if (S.open && S.sess.screen === 'ready' && O55.art.celebrate) { const st = S.root.querySelector('.o55-stage'), A = O55.art;
        if (noAi(S)) return; /* (no confetti for setup that can't plan yet) */
        O55.art.celebrate(st, { big: true, count: 46, at: [240, 260], under: A.famCall && A.famCall.lettered ? A.famCall.lettered(st && st.querySelector('.o55-scene-wrap:not(.o55-out) svg.o55-scene')) : null }); } });
    },
    eyebrow: () => T('ready.eyebrow'),
    /* no AI and no free models: Puppet Master can't plan yet, so it isn't "You're ready" (Opus p60) */
    title: (S) => T(noAi(S) ? 'ready.titleNoAi' : 'ready.title'),
    lead: (S) => (md(S).project_mode !== 'later' && S.sess.commit && S.sess.commit.state === 'done' ? T('ready.lead', { name: md(S).project_name }) : T('ready.leadLater')),
    body(S) {
      const later = md(S).project_mode === 'later' || !(S.sess.commit && S.sess.commit.state === 'done');
      /* under NieR Mode's headers the summary reads as a setup card: an ink kicker band naming the Project, rows with dot
         leaders whose values type in (11-window-nier.css, O55.nierWindow); the same rows and words otherwise */
      let out = later ? '' : `<div class="o55-summary" data-key="summary" data-o55nw-card="" data-o55nw-kicker="${U.esc(T('nierWindow.card', { name: md(S).project_name }))}">${summary(S)}</div>`
        + O55.tips.explainer('summary:free') + O55.tips.explainer('summary:backup');
      if (!later && O55.tour && O55.tour.start) out += C.note(T('ready.tourSub', { m: O55.tour.minutes ? O55.tour.minutes() : 4 }), 'info', 'spark');
      out += `<p class="o55-note o55-note-info" data-key="help">${C.small('person', 14)}<span>${U.esc(T('ready.help'))}</span></p>`;
      return out;
    },
    foot(S) {
      const later = md(S).project_mode === 'later' || !(S.sess.commit && S.sess.commit.state === 'done');
      if (later) return { back: true, secondary: [{ label: T('ready.enter'), do: 'enter' }], primary: { label: T('ready.createNow'), do: 'createNow' } };
      if (O55.tour && O55.tour.start) return { back: false, secondary: [{ label: T('ready.enter'), do: 'enter' }], primary: { label: T('ready.tour'), do: 'tour' } };
      return { back: false, primary: { label: T('ready.enter'), do: 'enter' } };
    },
    do: {
      enter(S) { O55.finish(S, { tour: false }); },
      /* O10: Pip hands the strings on: its hand lifts away as the tour's first callout grows out of the window */
      /* O10: the lift is drawn before the window becomes the tour's first callout (the stage stops when the window
         closes); a second press while it lifts does nothing */
      tour(S) {
        if (S.handingOff) return;
        const st = O55.pipStage && O55.pipStage.of(S.root && S.root.querySelector('.o55-stage')), ms = st && st.handOff ? st.handOff() || 0 : 0;
        if (!ms) { O55.finish(S, { tour: true }); return; }
        S.handingOff = true;
        O55.motion.after(ms, () => { S.handingOff = false; if (S.open && S.sess.screen === 'ready') O55.finish(S, { tour: true }); });
      },
      createNow(S) { O55.draft.set(md(S), { project_mode: 'new', review_confirmed: false }); S.sess.commit = { state: 'none', attempt: 0 }; S.sess.ui.begin = 'new'; S.save(); O55.ui.go('begin'); }
    }
  });
})();
