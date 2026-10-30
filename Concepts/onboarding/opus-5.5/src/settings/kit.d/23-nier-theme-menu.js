/* O55 · NieR and Pip in the title-bar theme menu (#themeMenu). Injected at runtime (the pinned base is not patched).
   NieR is the fifth theme since the PM7 build's QA round 2 (Q22, 2026-10-30): its family row is the base menu's own
   (shell.html, data-family="nier"), picked like the other four. This adds two rows, laid out as menu rows so their hover
   and focus boxes fit the menu like the family rows' (Q21: the old toggle row, its bordered Adjust pill and a loose
   "Customize Pip..." did not):
   - "Adjust NieR..." right under the NieR row, shown while NieR is the chosen theme: NieR's own options (its parts and
     background), PM_NIER_CHIPS.popup on the live store;
   - after a divider, "Customize Pip..." with Pip's mark: Pip's parts editor (PM_PIP_EDITOR.popup; S5, lane chatpip).
   Both close the menu and give focus back to the theme button; so do Escape and Tab, and picking a look (the base menu
   closes under the focused row). Both opt out of the page's hover tag (its card covered the row it described). The words
   are copy (nierSettings.themeMenu, pipSettings.themeMenu, through o55NierCopy). The base menu's click handler acts only
   on .pm6-tt-mode and .pm6-tt-family[data-family]; these rows are neither, and their clicks stop on this listener. */
(function o55NierThemeMenu() {
  const SLIDERS = '<svg class="o55-nier-tt-sliders" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">'
    + '<path d="M1.5 4h13M1.5 8h13M1.5 12h13" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="square"/>'
    + '<rect x="3.2" y="2.2" width="3.2" height="3.6" fill="currentColor"/>'
    + '<rect x="9.2" y="6.2" width="3.2" height="3.6" fill="currentColor"/>'
    + '<rect x="5.2" y="10.2" width="3.2" height="3.6" fill="currentColor"/></svg>';
  const say = (key, fallback) => (typeof o55NierCopy === 'function' ? o55NierCopy('nierSettings.themeMenu.' + key, fallback) : fallback);
  const pipSay = (key, fallback) => (typeof o55NierCopy === 'function' ? o55NierCopy('pipSettings.themeMenu.' + key, fallback) : fallback);
  const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  /* Pip's mark in the painted look (PMLogo, a still mark, decorative: the row's words name it) */
  const pipMark = () => { try { return window.PMLogo ? window.PMLogo.mark({ px: 16, mood: 'idle', decorative: true }) : ''; } catch (e) { return ''; } };
  const ADJUST = () => `<button type="button" class="pm6-tb-menu-item o55-nier-tt-adjust" role="menuitem" data-o55-nier-tt="adjust" data-pm-hover-exempt="true" aria-label="${esc(say('adjustLabel', 'Adjust NieR: its pieces and the scene behind the app'))}"${nierChosen() ? '' : ' hidden'}>`
    + `<span class="o55-tt-ico" aria-hidden="true">${SLIDERS}</span><span class="pm6-tt-name">${esc(say('adjust', 'Adjust NieR…'))}</span></button>`;
  const PIP = () => `<div class="pm6-tt-divider" data-o55-nier-tt="divider" aria-hidden="true"></div>`
    + `<button type="button" class="pm6-tb-menu-item o55-pip-tt" role="menuitem" data-o55-nier-tt="pip" data-pm-hover-exempt="true" aria-label="${esc(pipSay('customizeLabel', 'Customize Pip: where it appears, its faces and how it moves'))}">`
    + `<span class="o55-tt-ico o55-pip-tt-mark" aria-hidden="true" data-look="${esc(window.PMLogo ? window.PMLogo.look() : '')}">${pipMark()}</span><span class="pm6-tt-name">${esc(pipSay('customize', 'Customize Pip…'))}</span></button>`;
  const ITEM = '.pm6-tt-mode, .pm6-tt-family, [data-o55-nier-tt="adjust"]:not([hidden]), [data-o55-nier-tt="pip"]';
  /* NieR is the chosen theme (what is asked for: Adjust shows as soon as NieR is picked, before its moment has painted) */
  function nierChosen() {
    try { const T = window.PM_THEME; if (T && typeof T.getFamily === 'function') return T.getFamily() === 'nier'; } catch (e) { /* below */ }
    const n = window.PM_NIER; return !!(n && (n.wanted ? n.wanted() : n.on()));
  }
  function syncBox() {
    const menu = document.getElementById('themeMenu'); if (!menu) return;
    const adj = menu.querySelector('[data-o55-nier-tt="adjust"]');
    if (adj) {
      const on = nierChosen();
      if (adj.hidden === on) adj.hidden = !on;
      /* the copy loads after this script: the words follow it once it is there */
      const name = adj.querySelector('.pm6-tt-name'), n = say('adjust', 'Adjust NieR…'), full = say('adjustLabel', 'Adjust NieR: its pieces and the scene behind the app');
      if (name && name.textContent !== n) name.textContent = n;
      if (adj.getAttribute('aria-label') !== full) adj.setAttribute('aria-label', full);
    }
    const mark = menu.querySelector('.o55-pip-tt-mark');
    if (mark && window.PMLogo && mark.getAttribute('data-look') !== window.PMLogo.look()) { mark.setAttribute('data-look', window.PMLogo.look()); mark.innerHTML = pipMark(); }
  }
  function closeMenu() {
    const menu = document.getElementById('themeMenu');
    const btn = document.getElementById('themeSelect');
    if (menu) window.PM6_SPROUT.close(menu);
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
  function listItems(menu) { return [...menu.querySelectorAll(ITEM)]; }

  function onMenuClick(e) {
    const menu = e.currentTarget;
    const t = e.target && e.target.closest ? e.target.closest('[data-o55-nier-tt="adjust"], [data-o55-nier-tt="pip"]') : null;
    if (!t || !menu.contains(t)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (t.getAttribute('data-o55-nier-tt') === 'pip') {
      closeMenu();
      const ed = window.PM_PIP_EDITOR;
      if (ed && typeof ed.popup === 'function') ed.popup({ from: t, returnFocus: () => document.getElementById('themeSelect') });
      return;
    }
    closeMenu();
    const chips = window.PM_NIER_CHIPS, N = window.PM_NIER;
    /* the menu is closed, so focus comes back to the theme button */
    if (chips && typeof chips.popup === 'function' && N && typeof N.store === 'function') chips.popup({ store: N.store('live'), from: t, returnFocus: () => document.getElementById('themeSelect') });
  }
  /* focus goes back to the theme button when the menu has closed under it (on the next tick, after the base's close) */
  function refocus(menu, force) {
    const btn = document.getElementById('themeSelect'); if (!btn) return;
    let tries = 0;
    const check = () => {
      if (menu.classList.contains('is-open') && !force) { if (++tries < 20) window.requestAnimationFrame(check); return; }
      const a = document.activeElement;
      if (force || !a || a === document.body || menu.contains(a)) { try { btn.focus(); } catch (x) { /* the title bar is gone */ } }
    };
    window.setTimeout(check, 0);
  }
  function onMenuKey(e) {
    /* Escape and Tab leave the menu from the theme button, never from <body> */
    if (e.key === 'Escape' || e.key === 'Tab') {
      const menu = e.currentTarget;
      if (!document.getElementById('themeSelect') || !menu.contains(document.activeElement)) return;
      e.preventDefault(); e.stopPropagation();
      closeMenu();
      refocus(menu, true);
      return;
    }
    /* picking a look or a mode with the keyboard: the base closes the menu under the row */
    if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.closest && e.target.closest('.pm6-tt-family[data-family], .pm6-tt-mode')) refocus(e.currentTarget, false);
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
    const menu = e.currentTarget;
    const list = listItems(menu);
    if (!list.length) return;
    e.preventDefault();
    e.stopPropagation();
    let i = list.indexOf(document.activeElement);
    if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = list.length - 1;
    else if (e.key === 'ArrowDown') i = i < 0 ? 0 : (i + 1) % list.length;
    else i = i < 0 ? list.length - 1 : (i - 1 + list.length) % list.length;
    if (list[i]) list[i].focus();
  }
  function onPick(e) {
    const row = e.target && e.target.closest ? e.target.closest('.pm6-tt-family[data-family], .pm6-tt-mode') : null;
    if (row) refocus(e.currentTarget, false);
  }
  function wire(menu) {
    if (!menu || menu.dataset.o55NierTtWired === '1') return;
    menu.dataset.o55NierTtWired = '1';
    menu.addEventListener('click', onMenuClick);
    menu.addEventListener('click', onPick, true);
    menu.addEventListener('keydown', onMenuKey);
  }
  function inject() {
    const menu = document.getElementById('themeMenu');
    if (!menu) return false;
    if (!menu.querySelector('[data-o55-nier-tt="adjust"]')) {
      const nier = menu.querySelector('.pm6-tt-family[data-family="nier"]');
      const families = menu.querySelectorAll('.pm6-tt-family'), last = families[families.length - 1];
      (nier || last || menu).insertAdjacentHTML(nier || last ? 'afterend' : 'beforeend', ADJUST());
    }
    if (!menu.querySelector('[data-o55-nier-tt="pip"]')) {
      menu.querySelectorAll('[data-o55-nier-tt="divider"]').forEach(n => n.remove());
      menu.insertAdjacentHTML('beforeend', PIP());
    }
    wire(menu);
    syncBox();
    return true;
  }
  let watchedWrap = null, watchedBar = null;
  function watch() {
    const wrap = document.getElementById('themeMenuWrap');
    if (wrap && wrap !== watchedWrap) {
      watchedWrap = wrap;
      new MutationObserver(() => inject()).observe(wrap, { childList: true, subtree: true });
    }
    const bar = document.querySelector('.title-bar');
    if (bar && bar !== watchedBar) {
      watchedBar = bar;
      new MutationObserver(() => { inject(); watch(); }).observe(bar, { childList: true });
    }
  }
  function wireTrigger() {
    const btn = document.getElementById('themeSelect');
    if (!btn || btn.dataset.o55NierTtKey === '1') return;
    btn.dataset.o55NierTtKey = '1';
    btn.addEventListener('click', () => syncBox(), true);
    btn.addEventListener('keydown', e => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const menu = document.getElementById('themeMenu');
      if (!menu) return;
      const open = menu.classList.contains('is-open');
      if (!open) {
        if (e.key !== 'ArrowDown') return;
        e.preventDefault();
        btn.click();
      } else e.preventDefault();
      /* the menu may open a frame or two after the click: wait for it (about 300 ms at most) before moving focus in */
      let tries = 0;
      const enter = () => {
        if (!menu.classList.contains('is-open')) { if (++tries < 18) window.requestAnimationFrame(enter); return; }
        const list = listItems(menu);
        const el = e.key === 'ArrowUp' ? list[list.length - 1] : list[0];
        if (el) el.focus();
      };
      window.setTimeout(enter, 0);
    });
  }
  function boot() {
    const N = window.PM_NIER;
    if (N && typeof N.onChange === 'function' && !boot.listening) {
      boot.listening = true;
      N.onChange(() => syncBox());
      /* a theme pick (any family) shows or hides Adjust NieR; a look change redraws Pip's mark */
      const T = document.getElementById('themeSelect');
      if (T) T.addEventListener('change', () => syncBox());
      if (window.PMLogo && typeof window.PMLogo.onLook === 'function') window.PMLogo.onLook(() => syncBox());
    }
    inject();
    watch();
    wireTrigger();
  }
  boot();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
})();
