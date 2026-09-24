/* Concept demo pill — outside the onboarding window and never part of the product. It switches the fixture world
   (the packet's scenarios) and restarts onboarding, so every path can be reached by ordinary clicks. It stays usable
   while the window is open (it is exempt from the inert background). */
(function () {
  'use strict';
  const O55 = window.O55, U = O55.util, T = (k, v) => O55.t(k, v);
  const ORDER = ['fresh', 'returning', 'homeNasPm', 'flaky', 'nameTaken', 'keyWorks', 'noKeys', 'hostChanged', 'wrongPassword', 'keyRefused', 'readOnly', 'cliMissing', 'signedOut', 'copiedUnavailable', 'remoteAi', 'noAi', 'lowResource'];
  function current() { return O55.store.get('scenario', 'fresh'); }
  function render(el, open) {
    const sc = O55.fixtures.SCENARIOS, cur = current();
    el.innerHTML = `<button type="button" class="o55-demopill" data-demo="toggle" aria-expanded="${open}" data-pm-hover-exempt="true">${O55.c.small('spark', 14)}<span>${U.esc(T('demo.pill'))}</span><span class="o55-demoscn">${U.esc((sc[cur] || sc.fresh).label)}</span></button>`
      + (open ? `<div class="o55-demomenu" role="menu" aria-label="${U.esc(T('demo.title'))}"><p class="o55-demotitle">${U.esc(T('demo.title'))}</p><p class="o55-demonote">${U.esc(T('demo.note'))}</p>`
        + ORDER.filter((id) => sc[id]).map((id) => `<button type="button" role="menuitemradio" aria-checked="${id === cur}" class="o55-demoitem${id === cur ? ' o55-on' : ''}" data-demo="scenario" data-arg="${id}" data-pm-hover-exempt="true">${U.esc(sc[id].label)}</button>`).join('')
        + `<div class="o55-demoacts"><button type="button" data-demo="restart" data-pm-hover-exempt="true">${U.esc(T('demo.restart'))}</button><button type="button" data-demo="reset" data-pm-hover-exempt="true">${U.esc(T('demo.reset'))}</button></div></div>` : '');
  }
  function mount() {
    if (document.getElementById('o55-demo')) return;
    const el = document.createElement('div'); el.id = 'o55-demo'; el.className = 'o55-demo'; el.setAttribute('data-pm-hover-exempt', 'true');
    document.body.appendChild(el); render(el, false);
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-demo]'); if (!b) return;
      const what = b.getAttribute('data-demo');
      if (what === 'toggle') return render(el, b.getAttribute('aria-expanded') !== 'true');
      if (what === 'scenario') { O55.store.set('scenario', b.getAttribute('data-arg')); O55.S.env = O55.fixtures.make(b.getAttribute('data-arg')); O55.owners.resetOps(); O55.motion.setLowResource(!!O55.S.env.lowResource, 'scenario'); render(el, false); return O55.ui.open({ fresh: true }); }
      if (what === 'restart') { render(el, false); O55.owners.resetOps(); return O55.ui.open({ fresh: true }); }
      if (what === 'reset') { O55.store.clear('onboarding'); O55.store.clear('tour'); O55.store.set('scenario', 'fresh'); O55.S.env = O55.fixtures.make('fresh'); O55.owners.resetOps(); render(el, false); return O55.ui.open({ fresh: true }); }
    });
    ['keydown', 'keyup', 'keypress'].forEach((ev) => el.addEventListener(ev, (e) => { e.stopPropagation(); if (e.type === 'keydown' && e.key === 'Escape') render(el, false); }));
  }
  O55.demo = { mount };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
