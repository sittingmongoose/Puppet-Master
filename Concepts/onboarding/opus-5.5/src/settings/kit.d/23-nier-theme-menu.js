/* O55 · NieR Mode in the title-bar theme menu (#themeMenu). Injected at runtime (the pinned base is not patched).
   After the last family row: a divider and one row with a menuitemcheckbox "NieR Mode" and, on the right, "Adjust NieR
   look", which opens PM_NIER_CHIPS.popup on the live store. The checkbox shows the requested state at once (PM_NIER.set
   paints on the next frame) and syncs from PM_NIER.onChange. Toggle leaves the menu open; Adjust closes it.
   The menu's own click handler only acts on .pm6-tt-mode and .pm6-tt-family[data-family]; this row is neither, and
   its clicks stop on this listener so they never reach that handler. */
(function o55NierThemeMenu() {
  const BOX = '<svg class="o55-nier-tt-box" viewBox="0 0 14 14" width="13" height="13" aria-hidden="true" focusable="false">'
    + '<rect x="0.7" y="0.7" width="12.6" height="12.6" fill="none" stroke="currentColor" stroke-width="1.4"/>'
    + '<rect class="o55-nier-tt-mark" x="3.2" y="3.2" width="7.6" height="7.6" fill="currentColor"/></svg>';
  const SLIDERS = '<svg class="o55-nier-tt-sliders" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">'
    + '<path d="M1.5 4h13M1.5 8h13M1.5 12h13" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="square"/>'
    + '<rect x="3.2" y="2.2" width="3.2" height="3.6" fill="currentColor"/>'
    + '<rect x="9.2" y="6.2" width="3.2" height="3.6" fill="currentColor"/>'
    + '<rect x="5.2" y="10.2" width="3.2" height="3.6" fill="currentColor"/></svg>';
  const ROW = `<div class="pm6-tt-divider" data-o55-nier-tt="divider" aria-hidden="true"></div>`
    + `<div class="o55-nier-tt-row" data-o55-nier-tt="row" role="none">`
    + `<button type="button" class="pm6-tb-menu-item o55-nier-tt-toggle" role="menuitemcheckbox" aria-checked="false" data-o55-nier-tt="toggle">${BOX}<span class="pm6-tt-name">NieR Mode</span></button>`
    + `<button type="button" class="o55-nier-tt-adjust" role="menuitem" data-o55-nier-tt="adjust"><span>Adjust NieR look</span>${SLIDERS}</button>`
    + `</div>`;
  const ITEM = '.pm6-tt-mode, .pm6-tt-family, [data-o55-nier-tt="toggle"], [data-o55-nier-tt="adjust"]';
  /* null follows the painted state; a boolean is the click's request, shown until onChange agrees */
  let pending = null;

  function painted() { const n = window.PM_NIER; return !!(n && n.on()); }
  function shown() {
    if (pending !== null && painted() === pending) pending = null;
    return pending === null ? painted() : pending;
  }
  function syncBox() {
    const el = document.querySelector('#themeMenu [data-o55-nier-tt="toggle"]');
    if (!el) return;
    const v = shown() ? 'true' : 'false';
    if (el.getAttribute('aria-checked') !== v) el.setAttribute('aria-checked', v);
  }
  function liveStore() {
    const N = window.PM_NIER;
    if (N && typeof N.store === 'function') {
      try { const s = N.store('live'); if (s) return s; } catch (e) { /* the fallback commits the same rows */ }
    }
    return localLiveStore();
  }
  function closeMenu() {
    const menu = document.getElementById('themeMenu');
    const btn = document.getElementById('themeSelect');
    const sprout = window.PM6_SPROUT;
    if (menu && sprout && typeof sprout.close === 'function') sprout.close(menu);
    else if (menu) { menu.classList.remove('is-open', 'is-closing'); menu.style.display = 'none'; }
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
  function listItems(menu) { return [...menu.querySelectorAll(ITEM)]; }

  function onMenuClick(e) {
    const menu = e.currentTarget;
    const t = e.target && e.target.closest ? e.target.closest('[data-o55-nier-tt="toggle"], [data-o55-nier-tt="adjust"]') : null;
    if (!t || !menu.contains(t)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (t.getAttribute('data-o55-nier-tt') === 'adjust') {
      closeMenu();
      const chips = window.PM_NIER_CHIPS;
      if (chips && typeof chips.popup === 'function') chips.popup({ store: liveStore(), from: t, title: 'NieR Mode' });
      return;
    }
    const N = window.PM_NIER;
    if (!N || typeof N.set !== 'function') return;
    const next = !shown();
    pending = next;
    syncBox();
    if (N.set(next) === false) { pending = null; syncBox(); }
  }
  function onMenuKey(e) {
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
  function wire(menu) {
    if (!menu || menu.dataset.o55NierTtWired === '1') return;
    menu.dataset.o55NierTtWired = '1';
    menu.addEventListener('click', onMenuClick);
    menu.addEventListener('keydown', onMenuKey);
  }
  function inject() {
    const menu = document.getElementById('themeMenu');
    if (!menu) return false;
    if (!menu.querySelector('[data-o55-nier-tt="row"]')) {
      menu.querySelectorAll('[data-o55-nier-tt="divider"]').forEach(n => n.remove());
      const families = menu.querySelectorAll('.pm6-tt-family');
      const last = families[families.length - 1];
      if (last) last.insertAdjacentHTML('afterend', ROW);
      else menu.insertAdjacentHTML('beforeend', ROW);
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
      window.setTimeout(() => {
        if (!menu.classList.contains('is-open')) return;
        const list = listItems(menu);
        const el = e.key === 'ArrowUp' ? list[list.length - 1] : list[0];
        if (el) el.focus();
      }, 0);
    });
  }
  function boot() {
    const N = window.PM_NIER;
    if (N && typeof N.onChange === 'function' && !boot.listening) {
      boot.listening = true;
      N.onChange(() => syncBox());
    }
    inject();
    watch();
    wireTrigger();
  }
  boot();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
})();
