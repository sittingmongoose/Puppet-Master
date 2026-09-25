/* O55 boot — shims for the shell's existing callers, first-run auto-open (after Settings applyPaint, so the look
   preview is not overwritten), the resume chip, and driver switches:
   ?o55=off | fresh | tour | screen=<id> ; ?o55scenario=<id>[+<id>] */
(function () {
  'use strict';
  const O55 = window.O55, T = (k, v) => O55.t(k, v), U = O55.util;
  const q = new URLSearchParams(location.search);
  const sw = q.get('o55') || '';
  const scenario = q.get('o55scenario');
  if (scenario) O55.store.set('scenario', scenario);

  /* The shell's Settings rows, Home menu and hover labels still call the PM7 names; they now reach O55. */
  const onboardingApi = {
    schema: 'pm.o55.onboarding.v1',
    open: (o) => O55.ui.open(Object.assign({ returnFocus: document.activeElement }, o || {})),
    /* Run Onboarding Again: a running Guided Tour ends first (its layout comes back), then onboarding starts over, tour
       progress included (see startOver in 60-ui-core.js) */
    replay: async () => {
      const returnFocus = document.activeElement;
      if (O55.tour && O55.tour.running && O55.tour.reset) await O55.tour.reset({ silent: true });
      return O55.ui.open({ fresh: true, returnFocus });
    },
    resume: () => O55.ui.open({ returnFocus: document.activeElement }),
    close: () => O55.ui.close('close'),
    skip: () => O55.ui.close('skip'),
    snapshot: () => JSON.parse(JSON.stringify({ session: O55.S.sess, plan: O55.S.sess ? O55.draft.exportPlan(O55.S.draft()) : null })),
    plan: () => (O55.S.sess ? O55.draft.exportPlan(O55.S.draft()) : null),
    scenario: (id) => { O55.store.set('scenario', id); O55.S.env = O55.fixtures.make(id); return O55.S.env.scenario; }
  };
  window.PM_O55_ONBOARDING = onboardingApi;
  window.PM7_ONBOARDING_CINEMATIC = onboardingApi;
  if (!window.PM7_GUIDED_TOUR) window.PM7_GUIDED_TOUR = { start: (o) => (O55.tour && O55.tour.start ? O55.tour.start(o) : false), replay: (o) => (O55.tour && O55.tour.start ? O55.tour.start(Object.assign({ fresh: true }, o)) : false) };

  /* Resume chip: shown in the title bar area when setup was closed before finishing. */
  function chip() {
    let el = document.getElementById('o55-resume');
    const saved = O55.store.get('onboarding', null);
    const show = saved && saved.status === 'closed';
    if (!show) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement('div'); el.id = 'o55-resume'; el.className = 'o55-resume'; el.setAttribute('data-pm-hover-exempt', 'true');
      document.body.appendChild(el);
      el.addEventListener('click', (e) => {
        const b = e.target.closest('[data-o55-chip]'); if (!b) return;
        if (b.getAttribute('data-o55-chip') === 'resume') { el.remove(); O55.ui.open({ returnFocus: document.activeElement }); }
        else { el.remove(); }
      });
    }
    const committed = saved.commit && saved.commit.state === 'done';
    el.innerHTML = `<button type="button" data-o55-chip="resume" data-pm-hover-exempt="true">${O55.c.small('history', 14)}<span>${U.esc(committed ? T('chrome.resumeOptional') : T('chrome.resume'))}</span></button>`
      + `<button type="button" class="o55-resume-x" data-o55-chip="hide" aria-label="${U.esc(T('chrome.hide'))}" data-pm-hover-exempt="true">×</button>`;
  }
  /* A tour interrupted by a reload offers to carry on from its last safe step. */
  function tourChip() {
    const t = O55.store.get('tour', null);
    let el = document.getElementById('o55-tourchip');
    if (!(t && t.status === 'running')) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement('div'); el.id = 'o55-tourchip'; el.className = 'o55-resume'; el.setAttribute('data-pm-hover-exempt', 'true'); document.body.appendChild(el);
      el.addEventListener('click', (e) => { const b = e.target.closest('[data-o55-chip]'); if (!b) return; el.remove(); if (b.getAttribute('data-o55-chip') === 'resume') O55.tour.start({}); else { O55.store.set('tour', Object.assign(t, { status: 'skipped' })); } });
    }
    el.innerHTML = `<button type="button" data-o55-chip="resume" data-pm-hover-exempt="true">${O55.c.small('spark', 14)}<span>${U.esc(T('tour.resume'))}</span></button><button type="button" class="o55-resume-x" data-o55-chip="hide" aria-label="${U.esc(T('chrome.hide'))}" data-pm-hover-exempt="true">×</button>`;
  }
  O55.boot = { chip, tourChip };

  function start() {
    O55.motion.watchLongTasks();
    if (sw === 'off') return;
    if (sw === 'fresh') { O55.store.clear('onboarding'); O55.store.clear('tour'); return O55.ui.open({ fresh: true }); }
    if (sw.startsWith('screen=')) return O55.ui.open({ screen: sw.slice(7) });
    if (sw === 'tour') return O55.tour && O55.tour.start && O55.tour.start({ source: 'switch' });
    const saved = O55.store.get('onboarding', null);
    tourChip();
    if (!saved) return O55.ui.open({});
    if (saved.status === 'closed') chip();
  }
  const kick = () => O55.motion.real.setTimeout(start, 140);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kick); else kick();
})();
