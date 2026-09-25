/* Chapter 5 — Ready [ready]: a truthful summary, the Guided Tour offer (only when a real Project exists) and the
   handoff into the app: the chosen Project selected, Planning Wizard open, the look committed through Settings. */
(function () {
  'use strict';
  const O55 = window.O55, C = O55.c, U = O55.util, T = (k, v) => O55.t(k, v), def = (id, d) => O55.screens.define(id, d);
  const md = (S) => S.sess.drafts.main;

  /* Shell helpers: select a Project in the title-bar menu (adding it when the app doesn't list it yet). The Settings
     owner watches the menu and reloads that Project's settings. */
  O55.shell = {
    selectProject(id, name) {
      const menu = document.getElementById('projectMenu'), label = document.getElementById('projectMenuLabel');
      if (!menu || !id) return false;
      let item = menu.querySelector(`[data-project="${CSS.escape(id)}"]`);
      if (!item) {
        const proto = menu.querySelector('[data-project]');
        item = proto ? proto.cloneNode(false) : document.createElement('button');
        item.setAttribute('type', 'button'); item.className = 'pm6-tb-menu-item'; item.setAttribute('role', 'menuitem');
        item.setAttribute('data-project', id); item.setAttribute('data-project-title', 'Active project: ' + (name || id)); item.textContent = name || id;
        menu.insertBefore(item, menu.firstChild);
      }
      menu.querySelectorAll('[data-project]').forEach((n) => n.classList.toggle('is-selected', n === item));
      window.PM_ACTIVE_PROJECT_ID = id;
      if (label) label.textContent = name || id;
      return true;
    },
    /* the look chosen in onboarding becomes the saved theme (the preview used persist:false) */
    commitLook(S) {
      const d = md(S), tome = window.PM7_SETTINGS_TOME;
      try { if (tome && tome.setChromeThemeFamily) { tome.setChromeThemeFamily(d.theme_family); tome.setChromeThemeMode(d.theme_mode); return true; } } catch (_) {}
      try { window.PM_THEME.setFamily(d.theme_family); window.PM_THEME.setMode(d.theme_mode); } catch (_) {}
      return false;
    },
    openWizard() { const t = document.getElementById('tab-wizard') || document.querySelector('[data-page="wizard"]'); if (t) { t.click(); return true; } return false; }
  };

  /* finish(S, {tour, project}) — close onboarding as done and land in the app. */
  O55.finish = function finish(S, o) {
    o = o || {};
    O55.shell.commitLook(S);
    const cm = S.sess.commit || {}, d = md(S);
    const projectId = o.project || cm.projectId, name = o.projectName || (cm.projectId === projectId ? d.project_name : null) || projectId;
    if (projectId) O55.shell.selectProject(projectId, name);
    S.sess.finished = { at: new Date().toISOString(), tour: !!o.tour, project: projectId || null };
    const tour = !!(o.tour && O55.tour && O55.tour.start);
    /* the tour path: the window becomes the tour's first callout (a morph from its rectangle); the tour itself ends on
       the Planning Wizard, so the page is not switched here */
    const win = S.root && S.root.querySelector('.o55-win'), from = tour && win ? win.getBoundingClientRect() : null;
    O55.ui.close('done', { handoff: tour && !!from });
    /* a tour taken at the end of an onboarding run always starts at its first step (only the resume chip continues one) */
    if (tour) O55.tour.start({ source: 'onboarding', fresh: true, project: projectId, from: from ? { left: from.left, top: from.top, width: from.width, height: from.height } : null });
    else O55.shell.openWizard();
  };

  function summary(S) {
    const d = md(S), cm = S.sess.commit || {}, ai = O55.ai ? O55.ai.readyIds(S) : [], free = Object.values(S.sess.ai.freeRoutes || {}).filter((x) => x === 'ready').length, b = S.sess.backup;
    const row = (k, v, ok) => `<div class="o55-revrow" data-key="sum-${k}"><span class="o55-revk">${U.esc(T('ready.' + k))}</span><span class="o55-revv">${U.esc(v)}</span>${ok ? C.pill('ready', T('ai.ready')) : ''}</div>`;
    let out = '';
    if (cm.state === 'done') out += row('project', d.project_name + ' · ' + O55.review.whereWork(S), true);
    out += row('ai', ai.length ? ai.map((id) => O55.ai.pname(O55.fixtures.provider(id))).join(', ') : T('ready.noAi'), ai.length > 0);
    out += row('free', free ? free + ' ' + T('free.ready').toLowerCase() : T('ready.noFree'), free > 0);
    out += row('backup', b.dest ? T('safe.backup.' + b.dest) + (b.state === 'done' ? '' : ' · ' + T('protect.later').toLowerCase()) : T('ready.noBackup'), b.state === 'done');
    return out;
  }
  def('ready', {
    chapter: 'ready', stage: 'ready',
    scene: () => ({ id: 'ready', beat: 'curtain' }),
    eyebrow: () => T('ready.eyebrow'),
    title: () => T('ready.title'),
    lead: (S) => (md(S).project_mode !== 'later' && S.sess.commit && S.sess.commit.state === 'done' ? T('ready.lead', { name: md(S).project_name }) : T('ready.leadLater')),
    body(S) {
      const later = md(S).project_mode === 'later' || !(S.sess.commit && S.sess.commit.state === 'done');
      let out = later ? '' : `<div class="o55-summary" data-key="summary">${summary(S)}</div>`;
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
      tour(S) { O55.finish(S, { tour: true }); },
      createNow(S) { O55.draft.set(md(S), { project_mode: 'new', review_confirmed: false }); S.sess.commit = { state: 'none', attempt: 0 }; S.sess.ui.begin = 'new'; S.save(); O55.ui.go('begin'); }
    }
  });
})();
