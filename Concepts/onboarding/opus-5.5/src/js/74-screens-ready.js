/* Chapter 5 — Ready [ready]: a truthful summary, the Guided Tour offer (only when a real Project exists) and the
   handoff into the app: the chosen Project selected, Planning Wizard open, the look committed through Settings. */
(function () {
  'use strict';
  const O55 = window.O55, C = O55.c, U = O55.util, T = (k, v) => O55.t(k, v), def = (id, d) => O55.screens.define(id, d);
  const md = (S) => S.sess.drafts.main;

  /* Shell helpers: select a Project in the title-bar menu (adding it when the app doesn't list it yet). The project box
     owns the menu's rows (PM_PROJECT_BOX, pm6-js-panels.js: one row renderer, the label stays the bare name). The Settings
     owner watches the menu and reloads that Project's settings. */
  O55.shell = {
    selectProject(id, name, info) {
      const box = window.PM_PROJECT_BOX;
      if (!box || !id) return false;
      /* info: { path, branch } from the draft, so the row and the hover tag carry the location line (B3) */
      box.add(id, Object.assign({}, info || {}, { name: name || id }));
      window.PM_ACTIVE_PROJECT_ID = id;
      box.select(id);
      if (O55.sound && O55.sound.refresh) O55.sound.refresh('project');
      return true;
    },
    /* The look chosen in onboarding becomes the saved theme (the preview used persist:false), and NieR Mode's three
       rows, the rest of the look, are saved with it into the same Project (their preview, O55.nierLook).
       Writing the theme repaints it, and the app's own theme listeners (its search width, its tab ink) then re-measure
       the whole page under the window for most of a second (films M4: the Created moment froze). So the theme pair
       (the NieR rows' commit repaints it too) and with o.defer both wait until the moment on screen is over: Ready's
       curtain call and Pod line, the hand-over to the tour, any other close, or the page going away (flushLook). It is
       written once per Project and look; a look changed meanwhile is the one written. */
    commitLook(S, o) {
      look = { S };
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
    const S = look && look.S; look = null;
    if (lookTimer) { lookTimer.cancel(); lookTimer = null; }
    if (!S || !S.sess) return false;
    /* the theme first (NieR is a theme since Q22: its preview follows this write), then NieR's Adjust rows, so dropping
       the preview finds the stored theme already matching what is painted */
    const d = md(S), tome = window.PM7_SETTINGS_TOME, key = [window.PM_ACTIVE_PROJECT_ID || '', d.theme_family, d.theme_mode].join('|');
    let ok = key === lookWritten;
    if (!ok) {
      lookWritten = key;
      try { if (tome && tome.setChromeThemeFamily) { tome.setChromeThemeFamily(d.theme_family); tome.setChromeThemeMode(d.theme_mode); ok = true; } } catch (_) {}
      if (!ok) try { window.PM_THEME.setFamily(d.theme_family); window.PM_THEME.setMode(d.theme_mode); } catch (_) {}
    }
    if (O55.nierLook && O55.nierLook.commit) O55.nierLook.commit(S);
    return ok;
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
    S.sess.finished = { at: new Date().toISOString(), tour: !!o.tour, project: projectId || null };
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
    const d = md(S), cm = S.sess.commit || {}, ai = O55.ai ? O55.ai.readyIds(S) : [], free = Object.values(S.sess.ai.freeRoutes || {}).filter((x) => x === 'ready').length, b = S.sess.backup;
    /* Free Models and Backup have a ? beside their name (summary:<row>), the note under the summary */
    const row = (k, v, ok) => `<div class="o55-revrow" data-key="sum-${k}"${O55.tips.described('summary:' + k)}><span class="o55-revk"><span class="o55-labq">${U.esc(T('ready.' + k))}${O55.tips.q('summary:' + k)}</span></span><span class="o55-revv">${U.esc(v)}</span>${ok ? C.pill('ready', T('ai.ready')) : ''}</div>`;
    let out = '';
    if (cm.state === 'done') out += row('project', d.project_name + ' · ' + O55.review.whereWork(S), true);
    out += row('ai', ai.length ? ai.map((id) => O55.ai.pname(O55.fixtures.provider(id))).join(', ') : T('ready.noAi'), ai.length > 0);
    out += row('free', free ? free + ' ' + T('free.ready').toLowerCase() : T('ready.noFree'), free > 0);
    out += row('backup', b.dest ? O55.backup.label(S, b.dest) + (b.state === 'done' ? '' : ' · ' + T('protect.later').toLowerCase()) : T('ready.noBackup'), b.state === 'done');
    return out;
  }
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
      if (!fresh || O55.ui.skin('ready', layer, fresh)) return;
      /* (beneath Ready's lettered emblem, as the curtain call's burst is: 66-family-window.js A.famCall.lettered) */
      O55.motion.after(1250, () => { if (S.open && S.sess.screen === 'ready' && O55.art.celebrate) { const st = S.root.querySelector('.o55-stage'), A = O55.art;
        O55.art.celebrate(st, { big: true, count: 46, at: [240, 260], under: A.famCall && A.famCall.lettered ? A.famCall.lettered(st && st.querySelector('.o55-scene-wrap:not(.o55-out) svg.o55-scene')) : null }); } });
    },
    eyebrow: () => T('ready.eyebrow'),
    title: () => T('ready.title'),
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
