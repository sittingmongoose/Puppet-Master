/* O55.lookMenu — the look can be changed at any point: a palette button beside the sound button (the onboarding window's
   header and the Guided Tour's bar) opens a small menu of the four looks and Light / Dark. In onboarding the choice is
   the same as on "Pick a look" (a preview until the look is saved with the new Project); in the tour, after setup, it
   is saved at once through Settings. Each option shows its own look's colours (its swatch carries data-theme). */
(function () {
  'use strict';
  const O55 = window.O55, U = O55.util, T = (k, v) => O55.t(k, v);
  const FAMILIES = ['basic', 'friendly', 'glass', 'retro'];
  const ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.9-.8 1.9-1.8 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8h2.1a4.2 4.2 0 0 0 4.2-4.2C21 6.6 17 3.5 12 3.5z"/>'
    + '<circle cx="7.6" cy="11.4" r="1.2" fill="currentColor"/><circle cx="10.2" cy="7.6" r="1.2" fill="currentColor"/><circle cx="14.6" cy="7.6" r="1.2" fill="currentColor"/><circle cx="17.2" cy="11" r="1.2" fill="currentColor"/></svg>';

  O55.lookMenu = {
    /* attr: the click attribute of the host (data-o55-do in onboarding, data-o55t in the tour) */
    button(cls, attr, open) {
      return `<button type="button" class="${cls} o55-lookbtn${open ? ' o55-on' : ''}" ${attr}="lookMenu" aria-haspopup="true" aria-expanded="${!!open}" data-pm-hover-exempt="true" aria-label="${U.esc(T('chrome.look'))}" title="${U.esc(T('chrome.look'))}">${ICON}</button>`;
    },
    panel(attr) {
      const th = O55.theme();
      const opt = (f) => `<button type="button" class="o55-lookopt${f === th.family ? ' o55-on' : ''}" ${attr}="lookFamily" data-arg="${f}" role="menuitemradio" aria-checked="${f === th.family}" data-pm-hover-exempt="true">`
        + `<span class="o55-lookswatch" data-theme="${f}-${th.mode}" aria-hidden="true"><i></i><i></i><i></i></span><span class="o55-lookname">${U.esc(T('look.families.' + f + '.name'))}</span></button>`;
      const mode = (m) => `<button type="button" class="${m === th.mode ? 'o55-on' : ''}" ${attr}="lookMode" data-arg="${m}" role="menuitemradio" aria-checked="${m === th.mode}" data-pm-hover-exempt="true">${U.esc(T('look.' + m))}</button>`;
      return `<div class="o55-lookmenu" role="menu" aria-label="${U.esc(T('chrome.look'))}"><div class="o55-lookopts">${FAMILIES.map(opt).join('')}</div>`
        + `<div class="o55-lookmodes" role="group" aria-label="${U.esc(T('look.modeLabel'))}">${mode('light')}${mode('dark')}</div></div>`;
    },
    /* after setup (the tour): the look is saved straight away */
    save(family, mode) {
      try { window.PM_THEME.setFamily(family, { persist: false }); window.PM_THEME.setMode(mode, { persist: false }); } catch (_) {}
      const tome = window.PM7_SETTINGS_TOME;
      try { if (tome && tome.setChromeThemeFamily) { tome.setChromeThemeFamily(family); tome.setChromeThemeMode(mode); } } catch (_) {}
      O55.sound.play('select');
    }
  };
})();
