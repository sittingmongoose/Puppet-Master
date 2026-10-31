/* O55.lookMenu — the look can be changed at any point: a palette button beside the sound button (the onboarding window's
   header and the Guided Tour's bar) opens a small menu of the five looks (Basic, Friendly, Glass, Retro and NieR: NieR is
   the fifth theme since the PM7 build's QA round 2, Q22), Light / Dark, and, while NieR is chosen, Adjust NieR. In
   onboarding the choice is the same as on "Pick a look" (a preview until the look is saved with the new Project); in
   the tour, after setup, it is saved at once through Settings. Each option shows its own look's colours (its swatch
   carries data-theme; NieR's its preview scope). One column, every ? on its own row's line (Q5: two columns pushed the
   ?s past the menu's edge). lookNierAdjust is routed to nier(action, el) (O55.nierLook does the work). */
(function () {
  'use strict';
  const O55 = window.O55, U = O55.util, T = (k, v) => O55.t(k, v);
  const FAMILIES = O55.LOOKS || ['basic', 'friendly', 'glass', 'retro', 'nier'];
  const ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.9-.8 1.9-1.8 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8h2.1a4.2 4.2 0 0 0 4.2-4.2C21 6.6 17 3.5 12 3.5z"/>'
    + '<circle cx="7.6" cy="11.4" r="1.2" fill="currentColor"/><circle cx="10.2" cy="7.6" r="1.2" fill="currentColor"/><circle cx="14.6" cy="7.6" r="1.2" fill="currentColor"/><circle cx="17.2" cy="11" r="1.2" fill="currentColor"/></svg>';

  O55.lookMenu = {
    /* attr: the click attribute of the host (data-o55-do in onboarding, data-o55t in the tour) */
    button(cls, attr, open) {
      return `<button type="button" class="${cls} o55-lookbtn${open ? ' o55-on' : ''}" ${attr}="lookMenu" aria-haspopup="true" aria-expanded="${!!open}" data-pm-hover-exempt="true" aria-label="${U.esc(T('chrome.look'))}" title="${U.esc(T('chrome.look'))}">${U.nx('palette', 18, 'control') || ICON}</button>`;
    },
    panel(attr) {
      const th = O55.theme();
      const by = (id) => (attr === 'data-o55-do' && O55.tips ? O55.tips.described(id) : '');
      /* NieR's swatch: ink and parchment with the kicker's three squares, in NieR's own tokens through its preview scope */
      const swatch = (f) => (f === 'nier'
        ? `<span class="o55-lookswatch o55-nierswatch" data-theme="basic-${th.mode}" data-o55-nier-preview="${th.mode}" aria-hidden="true"><i></i><i></i><i></i><b></b></span>`
        : `<span class="o55-lookswatch" data-theme="${f}-${th.mode}" aria-hidden="true"><i></i><i></i><i></i></span>`);
      const opt = (f) => `<button type="button" class="o55-lookopt${f === th.chosen ? ' o55-on' : ''}" ${attr}="lookFamily" data-arg="${f}" role="menuitemradio" aria-checked="${f === th.chosen}"${by('lookFamily:' + f)} data-pm-hover-exempt="true">`
        + `${swatch(f)}<span class="o55-lookname">${U.esc(T('look.families.' + f + '.name'))}</span></button>`;
      const mode = (m) => `<button type="button" class="${m === th.mode ? 'o55-on' : ''}" ${attr}="lookMode" data-arg="${m}" role="menuitemradio" aria-checked="${m === th.mode}"${by('lookMode:' + m)} data-pm-hover-exempt="true">${U.esc(T('look.' + m))}</button>`;
      /* in onboarding each choice has its ? (O55.tips: pip.tips.chrome), its note under the menu; the tour's bar has none */
      const tips = attr === 'data-o55-do' && !!O55.tips;
      const tq = tips ? (id) => O55.tips.q(id, { cls: 'o55-tipq-menu' }) : () => '';
      const nier = th.chosen === 'nier' && !!O55.nierLook;
      const ids = FAMILIES.map((f) => 'lookFamily:' + f).concat(['lookMode:light', 'lookMode:dark']).concat(nier ? ['lookNierAdjust:nier-adjust'] : []);
      const notes = tips ? ids.map((id) => O55.tips.explainer(id)).join('') : '';
      return `<div class="o55-lookmenu" role="menu" aria-label="${U.esc(T('chrome.look'))}"><div class="o55-lookopts">${FAMILIES.map((f) => `<span class="o55-opt o55-opt-menu${f === th.chosen ? ' o55-opt-on' : ''}">${opt(f)}${tq('lookFamily:' + f)}</span>`).join('')}</div>`
        + `<div class="o55-opt o55-opt-menu o55-lookmoderow"><div class="o55-lookmodes" role="group" aria-label="${U.esc(T('look.modeLabel'))}">${mode('light')}${mode('dark')}</div>${tq('lookMode:' + th.mode)}</div>`
        + (nier ? this.adjustRow(attr, tq) : '') + notes + '</div>';
    },
    /* Adjust NieR: NieR's own options (its parts and background), a row of the menu while NieR is the look */
    adjustRow(attr, tq) {
      const L = O55.nierLook; if (!L || !window.PM_NIER) return '';
      return `<div class="o55-opt o55-opt-menu o55-lookadjust"><button type="button" class="o55-lookopt o55-looknier-adjust" ${attr}="lookNierAdjust" data-arg="nier-adjust" role="menuitem" data-pm-hover-exempt="true">`
        + `<span class="o55-lookadjust-ico" aria-hidden="true">${L.icon()}</span><span class="o55-lookname">${U.esc(T('look.nier.adjust'))}</span></button>${(tq || (() => ''))('lookNierAdjust:nier-adjust')}</div>`;
    },
    /* the host's lookNierAdjust (and an old lookNier, now a pick of the NieR look): O55.nierLook */
    nier(action, el) {
      const L = O55.nierLook; if (!L) return false;
      if (action === 'lookNier') return L.pick ? L.pick('nier', O55.theme().mode, el) : L.toggle('lookMenu', el);
      if (action === 'lookNierAdjust') return !!L.adjust(el);
      return false;
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
