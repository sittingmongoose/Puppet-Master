/* The Demo Studio's sheet (model: 91-demo-studio.js; styles: css/50-demo-studio.css and 51-demo-studio-looks.css).

   One sheet rises out of the status bar's "Concept demo" item (90-demo.js mounts the item and calls mount()) and stays
   anchored to the bottom-left corner above the status bar. A header (title, search, close), a rail of eleven sections and
   the section's page, with "Right now" along the foot. It is a non-modal dialog: the app stays live beside it, so a
   look or layout change shows at once. Escape (or the item, or the close button) closes it and gives focus back to the
   item. It lives inside #o55-demo, the one body child the onboarding window leaves usable, so it works over onboarding.

   Looks: the sheet carries data-pmds-look = basic | friendly | retro | glass | nier (NieR Mode paints over Basic) and
   data-pmds-mode = light | dark, synced from <html>. Each look has its own voice for opening, changing section and the
   rail's selection (VOICE below); under Reduced Motion everything is a short fade with no travel. NieR's touches use
   O55.nierFx (each a no-op unless its part is installed) and CSS gated by data-o55-nier-parts. Hover is the app's own
   engine: tiles, rows and buttons opt in with data-pmh.

   No shortcut opens it (Jared, 2026-10-14): Ctrl+Shift+D stays Readiness & Doctor's. The demo engine's old unstyled
   "Demo director" box, which that key used to toggle, is hidden (51-demo-studio-looks.css): Story replaces it.

   Moving (Jared, 2026-10-14): the sheet can be dragged by its header so it never blocks what someone wants to see. Its
   place is remembered (pm.o55.demo-studio.v1, cleared by Reset > Everything), kept inside the window on resize, and
   movable from the keyboard with the header's Move handle (arrows, Shift for big steps, Home to put it back). While it
   is away from its corner, a Put back button returns it; dropped near its corner, it snaps home. */
(function () {
  'use strict';
  const O55 = window.O55, U = O55.util, esc = U.esc, T = (k, v) => O55.t(k, v), M = O55.studio;
  const real = O55.motion.real;
  const SECTIONS = ['start', 'onboarding', 'tour', 'story', 'workspace', 'chat', 'usage', 'notices', 'looks', 'reset', 'switches'];
  const ST = { el: null, entry: null, sheet: null, open: false, section: 'start', q: '', pick: null, sw: null, confirm: null, timer: 0, tick: 0, anims: [], busy: false, focusKey: null, pos: null, home: null, drag: null, chatView: 'guided' };
  const POS_KEY = 'pm.o55.demo-studio.v1';
  const SNAP = 28;   /* px from its corner within which a dropped sheet goes home */

  /* ---- icons: one 24 px stroke grammar (NieR's icons part squares their ends in CSS) ---- */
  const PATHS = {
    studio: '<path d="M4 7h16M4 17h16"/><rect x="12.5" y="4.5" width="5" height="5" rx="1" fill="currentColor"/><rect x="6.5" y="14.5" width="5" height="5" rx="1" fill="currentColor"/>',
    close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
    start: '<path d="M12 3.5l2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.4 6.9 19.2 8 13.5l-4.3-4 5.8-.7z"/>',
    onboarding: '<path d="M6 20.5V5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 18 5v15.5"/><path d="M3.5 20.5h17"/><path d="M14.5 12.5v.01"/><path d="M10 3.5l4.5 2v15"/>',
    tour: '<circle cx="12" cy="12" r="8.5"/><path d="M15.8 8.2l-2.3 5.3-5.3 2.3 2.3-5.3z"/>',
    story: '<circle cx="12" cy="13.5" r="7"/><path d="M12 10v3.5l2.5 1.8"/><path d="M9.5 3h5M12 3v3.5"/>',
    workspace: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M3.5 13.5h17M11 4.5v9"/>',
    usage: '<path d="M4.5 16.5a7.5 7.5 0 1 1 15 0"/><path d="M12 16.5l3.6-4.4"/><path d="M4.5 20h15"/>',
    notices: '<path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 2h-14z"/><path d="M10 21h4"/>',
    looks: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.3 0 1.9-.9 1.5-2-.5-1.4.4-2.5 1.8-2.5h2.2a3 3 0 0 0 3-3c0-5.2-3.8-9.5-8.5-9.5z"/><circle cx="7.6" cy="11.4" r="1.1"/><circle cx="10.4" cy="7.6" r="1.1"/><circle cx="15" cy="8" r="1.1"/>',
    reset: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/>',
    switches: '<rect x="3.5" y="5" width="17" height="6" rx="1.5"/><rect x="13" y="6.5" width="6" height="3" rx=".75"/><rect x="3.5" y="13" width="17" height="6" rx="1.5"/><rect x="5" y="14.5" width="6" height="3" rx=".75"/>',
    play: '<path d="M8 5.5v13l10-6.5z"/>',
    pause: '<path d="M8.5 5.5v13M15.5 5.5v13"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    chevron: '<path d="M9.5 6l6 6-6 6"/>',
    arrow: '<path d="M5 12h14M13.5 6.5L19 12l-5.5 5.5"/>',
    computer: '<rect x="3.5" y="4.5" width="17" height="11" rx="1.5"/><path d="M9 19.5h6M12 15.5v4"/>',
    nas: '<rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M8.5 8h7M8.5 11.5h7"/><path d="M9 16.5h.01M12 16.5h.01"/>',
    cloud: '<path d="M7.5 18.5h9.5a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.6 1.6 3.3 3.3 0 0 0 .6 6.4z"/>',
    spark: '<path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6 6l2.8 2.8M15.2 15.2L18 18M18 6l-2.8 2.8M8.8 15.2L6 18"/>',
    storm: '<path d="M7 15.5a3.3 3.3 0 0 1-.5-6.5 5.5 5.5 0 0 1 10.6-1.5 4 4 0 0 1 .4 8"/><path d="M12.5 12l-2.5 4h3l-2 4"/>',
    flag: '<path d="M5.5 21V4"/><path d="M5.5 4.5h11l-2 4 2 4h-11"/>',
    bell: '<path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 2h-14z"/><path d="M10 21h4"/>',
    pod: '<rect x="6" y="4.5" width="12" height="9" rx="1"/><path d="M9 13.5v3.5M15 13.5v3.5M7.5 19.5h9"/><path d="M9.5 9h5"/>',
    terminal: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M7.5 9.5l3 2.5-3 2.5M12.5 15h4"/>',
    agent: '<rect x="5" y="8" width="14" height="11" rx="2"/><path d="M12 4.5V8M9.5 12.5v.01M14.5 12.5v.01M9.5 16h5"/>',
    hand: '<path d="M8 12.5V6.5a1.5 1.5 0 0 1 3 0V11M11 10.5V5a1.5 1.5 0 0 1 3 0v5.5M14 10.5V7a1.5 1.5 0 0 1 3 0v6.5a6.5 6.5 0 0 1-6.5 6.5 6 6 0 0 1-5-2.7l-2-3.1a1.5 1.5 0 0 1 2.5-1.6L8 14.5"/>',
    chart: '<path d="M4 19.5h16"/><path d="M7 16v-4M12 16V7.5M17 16V10"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    back: '<path d="M10.5 7l-5 5 5 5"/><path d="M5.5 12H15a4 4 0 0 1 0 8h-1"/>',
    sun: '<circle cx="12" cy="12" r="3.8"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
    moon: '<path d="M19.5 14.5a7.5 7.5 0 0 1-10-10 8 8 0 1 0 10 10z"/>',
    auto: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17"/><path d="M12 6.5a5.5 5.5 0 0 1 0 11z" fill="currentColor" stroke="none"/>',
    motion: '<path d="M3 12c2.5-5.5 5.5-5.5 8 0s5.5 5.5 8 0"/><path d="M20.5 9.5v.01"/>',
    sound: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="1.5"/><path d="M15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>',
    reload: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/>',
    chat: '<path d="M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-4 3.5v-3.5a2 2 0 0 1-1.5-2z"/>',
    layout: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M12 4.5v15M12 12h8.5"/>',
    gauge: '<path d="M4.5 16.5a7.5 7.5 0 1 1 15 0"/><path d="M12 16.5l3.6-4.4"/>',
    gallery: '<rect x="3.5" y="4.5" width="7.5" height="6.5" rx="1"/><rect x="13" y="4.5" width="7.5" height="6.5" rx="1"/><rect x="3.5" y="13" width="7.5" height="6.5" rx="1"/><path d="M13 19.5l2.5-3.5 2 2 1.5-2 1.5 3.5"/>',
    list: '<path d="M8.5 7h11M8.5 12h11M8.5 17h11"/><path d="M4.5 7h.01M4.5 12h.01M4.5 17h.01"/>',
    link: '<path d="M10 14a4 4 0 0 1 0-5.7l3-3a4 4 0 0 1 5.7 5.7l-1.4 1.4"/><path d="M14 10a4 4 0 0 1 0 5.7l-3 3a4 4 0 0 1-5.7-5.7l1.4-1.4"/>',
    move: '<path d="M12 3.5v17M3.5 12h17"/><path d="M9.5 6L12 3.5 14.5 6M9.5 18l2.5 2.5 2.5-2.5M6 9.5L3.5 12 6 14.5M18 9.5l2.5 2.5-2.5 2.5"/>',
    dock: '<rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/><rect x="5.5" y="11" width="8" height="7.5" rx="1" fill="currentColor" stroke="none"/><path d="M19 5l-6.5 6.5M12.5 7v4.5H17"/>',
    /* the assistant chat's features (the Chat section's groups) */
    plan: '<path d="M7 3.5h7.5L18.5 7.5v13h-11.5z"/><path d="M14.5 3.5v4h4"/><path d="M10 12l1.5 1.5L14.5 10.5M10 17h5"/>',
    goal: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    todo: '<rect x="4" y="4.5" width="5" height="5" rx="1"/><path d="M5.3 7l1.2 1.2L8.6 6"/><rect x="4" y="14.5" width="5" height="5" rx="1"/><path d="M12 7h8M12 17h8"/>',
    deep: '<path d="M4.5 6h15M7 11h10M9.5 16h5"/><path d="M12 19.5v.01"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="1.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M12 13v3l2 1.2"/>',
    crew: '<circle cx="8" cy="9" r="2.8"/><circle cx="16" cy="9" r="2.8"/><path d="M3 19c.6-3 2.6-4.5 5-4.5s4.4 1.5 5 4.5M11 19c.6-3 2.6-4.5 5-4.5s4.4 1.5 5 4.5"/>',
    room: '<path d="M3.5 5.5a1.5 1.5 0 0 1 1.5-1.5h9a1.5 1.5 0 0 1 1.5 1.5v5.5a1.5 1.5 0 0 1-1.5 1.5H9l-3 2.5v-2.5H5a1.5 1.5 0 0 1-1.5-1.5z"/><path d="M18 9h1a1.5 1.5 0 0 1 1.5 1.5V16a1.5 1.5 0 0 1-1.5 1.5h-1v2.5l-3-2.5h-3.5"/>',
    brain: '<path d="M12 4.5a7.5 7.5 0 0 1 4.5 13.5v2h-9v-2A7.5 7.5 0 0 1 12 4.5z"/><path d="M9.5 20h5M12 9v4M10 11h4"/>',
    review: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/><path d="M8 10.5l1.8 1.8 3.2-3.3"/>',
    wonder: '<path d="M12 3.5l1.6 4.9 4.9 1.6-4.9 1.6L12 16.5l-1.6-4.9L5.5 10l4.9-1.6z"/><path d="M18 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    lens: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3.5v5M12 15.5v5M3.5 12h5M15.5 12h5"/>',
    teach: '<path d="M3.5 9l8.5-4.5L20.5 9 12 13.5z"/><path d="M7 11v4.5c1.5 1.4 3.2 2 5 2s3.5-.6 5-2V11"/><path d="M20.5 9v5"/>',
    memory: '<rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M8.5 8h7M8.5 11.5h7M8.5 15h4"/>',
    eli5: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 10h.01M15.5 10h.01"/><path d="M8.5 14.5c1 1.2 2.1 1.8 3.5 1.8s2.5-.6 3.5-1.8"/>',
    bsd: '<path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    debug: '<rect x="7.5" y="7.5" width="9" height="12" rx="4.5"/><path d="M12 11.5v8M7.5 13H4M20 13h-3.5M8 9.5L5.5 7M16 9.5L18.5 7M9.5 7.5a2.5 2.5 0 0 1 5 0"/>',
    revert: '<path d="M9 14.5L4.5 10 9 5.5"/><path d="M4.5 10H15a4.5 4.5 0 0 1 0 9h-3"/>',
    attach: '<path d="M19.5 11.5l-7.6 7.6a4.5 4.5 0 0 1-6.4-6.4l7.9-7.9a3 3 0 0 1 4.2 4.2l-7.9 7.9a1.5 1.5 0 0 1-2.1-2.1l7.3-7.3"/>',
    moment: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12h4"/><path d="M12 3.5v1.5"/>',
    takes: '<rect x="3.5" y="4.5" width="7.5" height="7" rx="1"/><rect x="13" y="4.5" width="7.5" height="7" rx="1"/><rect x="3.5" y="13.5" width="7.5" height="7" rx="1"/><path d="M13.5 17h6.5M16.75 13.75v6.5"/>'
  };
  const ico = (n, s) => `<svg class="pmds-ico pmds-ico-${n}" viewBox="0 0 24 24" width="${s || 16}" height="${s || 16}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${PATHS[n] || PATHS.spark}</svg>`;
  M.icon = ico;

  /* ---- primitives ---- */
  function at(o) { return Object.keys(o).filter((k) => o[k] != null && o[k] !== false).map((k) => (o[k] === true ? ` ${k}` : ` ${k}="${esc(String(o[k]))}"`)).join(''); }
  /* an action button. kind: primary | secondary | quiet. off: unavailable (aria-disabled, never `disabled`: the shell's
     hover layer swallows clicks on anything rendered disabled) */
  function btn(label, o) {
    o = o || {};
    return `<button type="button"${at({ class: `pmds-btn pmds-btn-${o.kind || 'secondary'}${o.cls ? ' ' + o.cls : ''}`, 'data-pmds-do': o.do, 'data-arg': o.arg, 'data-key': o.key || (o.do ? `${o.do}:${o.arg || ''}` : null), 'data-pmh': o.off ? null : 'ctl', 'aria-disabled': o.off ? 'true' : null, title: o.off ? T('studio.toast.unavailable') : o.title, 'aria-label': o.aria })}>${o.icon ? ico(o.icon, o.iconSize || 15) : ''}<span>${esc(label)}</span></button>`;
  }
  /* the Start page's three scenes (styles in 50-demo-studio.css, .pmds-art-*): onboarding's window filling its steps,
     the tour's spotlight gliding to its next target, and stacked layers rewinding into one. They move on hover and
     focus only, and stand still under Reduced Motion. */
  const ART = {
    onb: '<span class="pmds-art pmds-art-onb" aria-hidden="true"><span class="pmds-a-win"><span class="pmds-a-stage"><span class="pmds-a-sun"></span><span class="pmds-a-hill"></span></span><span class="pmds-a-copy"><i></i><i></i><i></i><b></b></span></span><span class="pmds-a-steps"><i></i><i></i><i></i><i></i><i></i></span></span>',
    tour: '<span class="pmds-art pmds-art-tour" aria-hidden="true"><span class="pmds-a-app"><i></i><i></i><i></i><i></i></span><span class="pmds-a-spot"></span><span class="pmds-a-call"><i></i><i></i></span></span>',
    reset: '<span class="pmds-art pmds-art-reset" aria-hidden="true"><span class="pmds-a-layer"></span><span class="pmds-a-layer"></span><span class="pmds-a-layer"></span><span class="pmds-a-turn">' + '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/></svg></span></span>'
  };
  /* a big tile (the Start page, recipes, notices, the chat's recorded examples); o.attrs adds attributes (the chat's
     data-chat-* locators) */
  function tile(o) {
    return `<button type="button"${at(Object.assign({ class: `pmds-tile${o.cls ? ' ' + o.cls : ''}${o.art ? ' pmds-arty' : ''}${o.on ? ' pmds-on' : ''}`, 'data-pmds-do': o.do, 'data-arg': o.arg, 'data-key': `${o.do}:${o.arg || ''}`, 'data-pmh': o.off ? null : 'tile', 'aria-disabled': o.off ? 'true' : null, 'aria-pressed': o.pressed == null ? null : String(!!o.pressed), title: o.off ? T('studio.toast.unavailable') : null, 'data-pmds-tone': o.tone }, o.attrs || {}))}>`
      + (o.art ? ART[o.art] : `<span class="pmds-tile-art" aria-hidden="true">${ico(o.icon, o.big ? 30 : 22)}</span>`) + `<span class="pmds-tile-text"><span class="pmds-tile-title">${esc(o.title)}</span>${o.sub ? `<span class="pmds-tile-sub">${esc(o.sub)}</span>` : ''}</span>`
      + (o.go ? `<span class="pmds-tile-go" aria-hidden="true">${ico('arrow', 16)}</span>` : '') + '</button>';
  }
  /* a keyed switch row (the Settings switch grammar: the look's rectangle, a lit layer, a square key) */
  function sw(o) {
    return `<div class="pmds-swrow${o.off ? ' pmds-unavail' : ''}"><span class="pmds-swart" aria-hidden="true">${ico(o.icon, 18)}</span><span class="pmds-swtext"><span class="pmds-swtitle" id="pmds-sw-${esc(o.id)}">${esc(o.title)}</span>${o.sub ? `<span class="pmds-swsub">${esc(o.sub)}</span>` : ''}</span>`
      + `<button type="button" role="switch"${at({ class: 'pmds-switch', 'aria-checked': String(!!o.on), 'aria-labelledby': `pmds-sw-${o.id}`, 'data-pmds-do': o.do, 'data-key': `sw:${o.id}`, 'data-pmh': o.off ? null : 'ctl', 'aria-disabled': o.off ? 'true' : null, title: o.off ? T('studio.toast.unavailable') : null })}><span class="pmds-switch-key"></span></button></div>`;
  }
  /* a joined choice row (NP-CHOICE): one rectangle, thin dividers, the chosen cell filled */
  function seg(o) {
    return `<div class="pmds-seg" role="radiogroup"${at({ 'aria-label': o.label })}>` + o.items.map((it) => `<button type="button" role="radio"${at({ class: `pmds-segcell${it.v === o.value ? ' pmds-on' : ''}`, 'aria-checked': String(it.v === o.value), 'data-pmds-do': o.do, 'data-arg': it.v, 'data-key': `${o.do}:${it.v}`, 'data-pmh': o.off ? null : 'ctl', 'aria-disabled': o.off ? 'true' : null })}>${it.icon ? ico(it.icon, 14) : ''}<span>${esc(it.label)}</span></button>`).join('') + '</div>';
  }
  function head(sec, extra) {
    return `<header class="pmds-phead"><p class="pmds-kicker">${esc(T(`studio.${sec}.kicker`))}</p><h3 class="pmds-ptitle" data-pmds-decode>${esc(T(`studio.${sec}.title`))}</h3><p class="pmds-lead">${esc(T(`studio.${sec}.lead`))}</p>${extra || ''}</header>`;
  }
  const block = (title, body, o) => `<section class="pmds-block${o && o.cls ? ' ' + o.cls : ''}">${title ? `<h4 class="pmds-btitle">${esc(title)}</h4>` : ''}${o && o.lead ? `<p class="pmds-blead">${esc(o.lead)}</p>` : ''}${body}</section>`;

  /* ---- the sections ---- */
  const R = {};
  R.start = () => {
    const sit = M.situationLabel(M.currentSituation()), ts = M.tourState();
    const hero = '<div class="pmds-hero">'
      + tile({ do: 'run-onboarding', icon: 'onboarding', art: 'onb', big: true, cls: 'pmds-tile-hero', tone: 'a', title: T('studio.start.runTitle'), sub: T('studio.start.runSub', { situation: sit }), off: !M.onboarding.avail(), go: true })
      + tile({ do: 'tour-start', icon: 'tour', art: 'tour', big: true, cls: 'pmds-tile-hero', tone: 'b', title: T('studio.start.tourTitle'), sub: ts.kind === 'at' ? T('studio.start.tourResumeSub', { n: ts.step, total: ts.total }) : T('studio.start.tourSub', { n: ts.total }), off: !M.tour.avail(), go: true })
      + tile({ do: 'go', arg: 'reset', icon: 'reset', art: 'reset', big: true, cls: 'pmds-tile-hero', tone: 'c', title: T('studio.start.resetTitle'), sub: T('studio.start.resetSub'), go: true })
      + '</div>';
    const recipes = '<div class="pmds-grid pmds-grid-recipes">' + M.RECIPES.map((r) => tile({ do: 'recipe', arg: r.id, icon: r.icon, title: T(`studio.recipes.${r.id}.title`), sub: T(`studio.recipes.${r.id}.sub`), off: !r.avail() })).join('') + '</div>';
    return `<header class="pmds-phead"><p class="pmds-kicker">${esc(T('studio.start.kicker'))}</p><h3 class="pmds-ptitle" data-pmds-decode>${esc(T('studio.start.title'))}</h3><p class="pmds-lead">${esc(T('studio.start.lead'))}</p></header>`
      + hero + block(T('studio.start.recipesTitle'), recipes, { lead: T('studio.start.recipesLead') });
  };

  R.onboarding = () => {
    const p = ST.pick || (ST.pick = M.parseSituation(M.currentSituation()));
    const st = M.onboardingState();
    const stateLine = st.kind === 'none' ? T('studio.onboarding.savedNone') : st.kind === 'done' ? T('studio.onboarding.savedDone') : st.kind === 'open' ? T('studio.onboarding.savedOpen')
      : T('studio.onboarding.savedClosed', { screen: st.screen ? T(`studio.onboarding.screens.${st.screen}`) : '' });
    const runs = `<div class="pmds-runbar"><div class="pmds-runtext"><span class="pmds-runkicker">${esc(T('studio.onboarding.will'))}</span><span class="pmds-runsit" data-pmds-live="pick">${esc(M.situationLong(M.joinSituation(p)))}</span><span class="pmds-runstate">${esc(stateLine)}</span></div>`
      + `<div class="pmds-runacts">${st.kind === 'closed' ? btn(T('studio.onboarding.continue'), { do: 'onboarding-continue', icon: 'back' }) : ''}${btn(T('studio.onboarding.run'), { do: 'run-pick', kind: 'primary', icon: 'play', off: !M.onboarding.avail() })}</div></div>`;
    const base = `<div class="pmds-choices pmds-choices-base" role="radiogroup" aria-label="${esc(T('studio.onboarding.startAs'))}">` + M.BASES.map((b) => choice(b, p.base === b, 'radio', 'pick-base')).join('') + '</div>';
    const twists = M.GROUPS.map((g) => `<div class="pmds-twistgroup"><h5 class="pmds-gtitle">${ico(g.id === 'computer' ? 'computer' : g.id === 'nas' ? 'nas' : g.id === 'online' ? 'cloud' : 'spark', 14)}<span>${esc(T(`studio.onboarding.groups.${g.id}`))}</span></h5><div class="pmds-choices">`
      + g.ids.map((id) => choice(id, p.twists.includes(id), 'checkbox', 'pick-twist')).join('') + '</div></div>').join('');
    const screens = '<div class="pmds-screens">' + M.SCREEN_CHAPTERS.map(([ch, ids]) => `<div class="pmds-scgroup"><h5 class="pmds-gtitle"><span>${esc(T(`studio.onboarding.chapters.${ch}`))}</span><span class="pmds-count">${ids.length}</span></h5><div class="pmds-sclist">`
      + ids.map((id) => `<button type="button"${at({ class: 'pmds-scrow', 'data-pmds-do': 'open-screen', 'data-arg': id, 'data-key': `open-screen:${id}`, 'data-pmh': M.hasScreen(id) && M.onboarding.avail() ? 'row' : null, 'aria-disabled': M.hasScreen(id) && M.onboarding.avail() ? null : 'true' })}><span>${esc(T(`studio.onboarding.screens.${id}`))}</span>${ico('chevron', 13)}</button>`).join('') + '</div></div>').join('') + '</div>';
    return head('onboarding') + runs
      + block(T('studio.onboarding.startAs'), base)
      + block(T('studio.onboarding.twists'), `<div class="pmds-twists">${twists}</div>`)
      + block(T('studio.onboarding.screensTitle'), screens, { lead: T('studio.onboarding.screensLead') });
  };
  function choice(id, on, role, action) {
    const clash = role === 'checkbox' && !on && ST.pick ? (M.CLASH[id] || []).filter((c) => ST.pick.twists.includes(c)) : [];
    return `<button type="button" role="${role}"${at({ class: `pmds-choice${on ? ' pmds-on' : ''}`, 'aria-checked': String(!!on), 'data-pmds-do': action, 'data-arg': id, 'data-key': `${action}:${id}`, 'data-pmh': 'tile' })}>`
      + `<span class="pmds-mark" aria-hidden="true">${ico('check', 12)}</span><span class="pmds-choice-text"><span class="pmds-choice-title">${esc(M.sitTitle(id))}</span><span class="pmds-choice-sub">${esc(T(`studio.onboarding.situations.${id}.sub`))}</span>`
      + (clash.length ? `<span class="pmds-choice-note">${esc(T('studio.onboarding.replaces', { name: clash.map(M.sitTitle).join(', ') }))}</span>` : '') + '</span></button>';
  }

  R.tour = () => {
    const s = M.tourState(), chapters = M.tourChapters();
    const line = s.kind === 'at' ? T('studio.tour.stateAt', { n: s.step, total: s.total, chapter: s.chapter }) : s.kind === 'running' ? T('studio.now.tourRunning') : T('studio.tour.stateNone');
    const acts = `<div class="pmds-runbar"><div class="pmds-runtext"><span class="pmds-runkicker">${esc(T('studio.now.tour'))}</span><span class="pmds-runsit">${esc(line)}</span></div><div class="pmds-runacts">`
      + (s.kind === 'at' ? btn(T('studio.tour.resume', { n: s.step }), { do: 'tour-resume', icon: 'play', off: !M.tour.avail() }) : '')
      + btn(s.kind === 'at' ? T('studio.tour.startOver') : T('studio.tour.start'), { do: 'tour-start', kind: 'primary', icon: s.kind === 'at' ? 'reload' : 'play', off: !M.tour.avail() }) + '</div></div>';
    const cards = '<div class="pmds-chapters">' + chapters.map((c) => {
      const shown = c.steps.slice(0, 4), more = c.steps.length - shown.length;
      return `<article class="pmds-chapter" data-pmds-tone="${'abc'[c.n - 1] || 'a'}"><header><span class="pmds-chnum">${c.n}</span><span class="pmds-chtext"><span class="pmds-chkicker">${esc(T('studio.tour.chapter', { n: c.n }))} · ${esc(T('studio.tour.steps', { n: c.steps.length }))}</span><span class="pmds-chname">${esc(c.name)}</span></span></header>`
        + `<ol class="pmds-steps">${shown.map((st) => `<li>${esc(st.title)}</li>`).join('')}${more > 0 ? `<li class="pmds-more">${esc(T('studio.tour.more', { n: more }))}</li>` : ''}</ol>`
        + btn(T('studio.tour.startHere'), { do: 'tour-chapter', arg: c.id, icon: 'arrow', off: !M.tour.avail() }) + '</article>';
    }).join('') + '</div>';
    return head('tour') + acts + cards;
  };

  R.story = () => {
    const ok = M.story.avail(), c = ok ? M.story.clock() : { t: 0, playing: false, speed: 1 };
    const clock = `<div class="pmds-clock${c.playing ? ' pmds-playing' : ''}" data-pmds-live="clock"><div class="pmds-clockface"><span class="pmds-clocklabel">${esc(T('studio.story.clock'))}</span><span class="pmds-clocktime" data-pmds-live="clock-time">${esc(M.fmtClock(c.t))}</span></div>`
      + `<div class="pmds-clockacts">${btn(c.playing ? T('studio.story.pause') : T('studio.story.play'), { do: 'story-play', kind: 'primary', icon: c.playing ? 'pause' : 'play', off: !ok, key: 'story-play' })}`
      + `<div class="pmds-speed"><span class="pmds-speedlabel">${esc(T('studio.story.speed'))}</span>${seg({ do: 'story-speed', value: String(c.speed), label: T('studio.story.speed'), off: !ok, items: [1, 2, 4].map((x) => ({ v: String(x), label: `${x}x` })) })}</div></div></div>`;
    const pts = M.story.points(), next = pts.findIndex((p) => !p.done);
    const line = `<ol class="pmds-timeline" style="--pmds-done:${pts.filter((p) => p.done).length}">` + pts.map((p, i) => `<li class="pmds-point${p.done ? ' pmds-done' : ''}${i === next ? ' pmds-next' : ''}"><span class="pmds-pnode" aria-hidden="true">${p.done ? ico('check', 12) : p.n}</span><span class="pmds-plabel">${esc(p.label)}</span>`
      + (p.done ? `<span class="pmds-pstate">${esc(T('studio.story.done'))}</span>` : btn(T('studio.story.jump'), { do: 'story-jump', arg: p.id, kind: i === next ? 'secondary' : 'quiet', off: !ok, cls: 'pmds-pjump' })) + '</li>').join('') + '</ol>';
    const beats = `<ol class="pmds-beats" data-pmds-live="beats">${beatsHtml()}</ol>`;
    return head('story') + clock + block(T('studio.story.points'), line, { lead: T('studio.story.pointsLead') })
      + `<div class="pmds-split">${block(T('studio.story.beats'), beats)}${block(T('studio.story.over'), `<p class="pmds-blead">${esc(T('studio.story.overSub'))}</p>${btn(T('studio.story.over'), { do: 'story-over', icon: 'reload' })}`)}</div>`;
  };
  function beatsHtml() {
    const b = M.story.avail() ? M.story.beats() : [];
    return b.length ? b.map((x) => `<li><span class="pmds-bt">${esc(M.fmtClock((x.t || 0) * 1000))}</span><span class="pmds-ba">${esc(String(x.action || ''))}</span></li>`).join('') : `<li class="pmds-empty">${esc(T('studio.story.beatsNone'))}</li>`;
  }

  /* a named layout drawn from its own slot tree: boxes in the tree's proportions */
  function layoutArt(tree) {
    const walk = (n) => (n && n.kids ? `<span class="pmds-lay-${n.dir === 'col' ? 'col' : 'row'}">${n.kids.map((k, i) => `<span class="pmds-lay-cell" style="flex:${(n.sizes && n.sizes[i]) || 1}">${walk(k)}</span>`).join('')}</span>` : '<span class="pmds-lay-slot"></span>');
    return `<span class="pmds-lay" aria-hidden="true">${walk(tree)}</span>`;
  }
  R.workspace = () => {
    const W = M.workspace, ok = W.avail(), cur = ok ? W.current() : null;
    const lays = ok ? `<div class="pmds-grid pmds-grid-layouts">${W.layouts().map((l) => `<button type="button"${at({ class: `pmds-laytile${l.id === cur ? ' pmds-on' : ''}`, 'data-pmds-do': 'layout', 'data-arg': l.id, 'data-key': `layout:${l.id}`, 'data-pmh': 'tile', 'aria-pressed': String(l.id === cur) })}>${layoutArt(l.tree)}<span class="pmds-laylabel">${esc(l.label)}</span>${l.id === cur ? `<span class="pmds-laycur">${esc(T('studio.workspace.current'))}</span>` : ''}</button>`).join('')}</div>`
      + `<div class="pmds-rowacts">${btn(T('studio.workspace.resetLayout'), { do: 'layout-reset', icon: 'reset' })}<span class="pmds-fine">${esc(T('studio.workspace.resetLayoutSub'))}</span></div>` : `<p class="pmds-fine">${esc(T('studio.workspace.unavailable'))}</p>`;
    const agents = '<div class="pmds-actrows">'
      + actRow('agent', T('studio.workspace.agents'), T('studio.workspace.agentsSub'), btn(T('studio.workspace.agentsGo'), { do: 'agents', icon: 'play', off: !W.agentsAvail() }))
      + actRow('terminal', T('studio.workspace.terminal'), T('studio.workspace.terminalSub'), btn(T('studio.workspace.terminalGo'), { do: 'agent-terminal', icon: 'play', off: !W.termAvail() }))
      + actRow('hand', T('studio.workspace.ask'), T('studio.workspace.askSub'), btn(T('studio.workspace.askGo'), { do: 'agent-ask', icon: 'play', off: !W.termAvail() })) + '</div>';
    return head('workspace') + block(T('studio.workspace.layouts'), lays, { lead: T('studio.workspace.layoutsLead') })
      + block('', sw({ id: 'standin', icon: 'chat', title: T('studio.workspace.standIn'), sub: T('studio.workspace.standInSub'), on: W.standInAvail() && W.standIn(), do: 'standin', off: !W.standInAvail() }))
      + block('', agents);
  };
  const actRow = (icon, title, sub, act) => `<div class="pmds-actrow"><span class="pmds-swart" aria-hidden="true">${ico(icon, 18)}</span><span class="pmds-swtext"><span class="pmds-swtitle">${esc(title)}</span><span class="pmds-swsub">${esc(sub)}</span></span>${act}</div>`;

  /* ---- the assistant chat (91: M.chat over PM56_PORT.demo): recorded examples first, then the moments, then the take
     families as pickers; Show the chat and Reset the chat demo sit in the head. One page, three views (a joined choice
     row), so the rail keeps one Chat entry and search still finds every item. Every item carries the chat's own action
     and dataset as data-chat-* (the port's tests click the same control a person does). ---- */
  const CHAT_ICON = { plan: 'plan', goal: 'goal', todo: 'todo', deepplan: 'deep', schedule: 'calendar', crew: 'crew', room: 'room', brainstorm: 'brain', review: 'review',
    wonderer: 'wonder', lens: 'lens', teach: 'teach', memory: 'memory', eli5: 'eli5', bsd: 'bsd', debug: 'debug', revert: 'revert', attach: 'attach', more: 'spark' };
  const CHAT_VIEWS = ['guided', 'moments', 'takes'];
  const chatAttrs = (it) => { const o = { 'data-chat-action': it.action }; Object.keys(it.data || {}).forEach((k) => { o[`data-chat-${k}`] = it.data[k]; }); return o; };
  R.chat = () => {
    const C = M.chat, ok = C.avail(), now = ok ? C.now() : null;
    const acts = `<div class="pmds-headacts">${btn(T('studio.chat.show'), { do: 'chat-show', icon: 'chat', off: !ok })}${btn(T('studio.chat.reset'), { do: 'chat-reset', icon: 'reset', off: !ok })}</div>`;
    if (!ok) return head('chat', acts) + `<p class="pmds-fine pmds-chat-none">${esc(T('studio.chat.unavailableLead'))}</p>`;
    const view = CHAT_VIEWS.includes(ST.chatView) ? ST.chatView : 'guided';
    const bar = `<div class="pmds-runbar"><div class="pmds-runtext"><span class="pmds-runkicker">${esc(T('studio.chat.nowKicker'))}</span><span class="pmds-runsit">${esc(now && now.thread ? now.thread : T('studio.chat.nowNone'))}</span>`
      + `<span class="pmds-runstate">${esc(now && now.open ? T('studio.chat.nowShown') : T('studio.chat.nowHidden'))}</span></div>`
      + `<div class="pmds-runacts">${seg({ do: 'chat-view', value: view, label: T('studio.chat.viewsLabel'), items: CHAT_VIEWS.map((v) => ({ v, label: T(`studio.chat.views.${v}`), icon: v === 'guided' ? 'play' : v === 'moments' ? 'moment' : 'takes' })) })}</div></div>`;
    return head('chat', acts) + bar + R[`chat_${view}`]();
  };
  R.chat_guided = () => `<p class="pmds-blead pmds-chat-lead">${esc(T('studio.chat.guided.lead'))}</p>` + M.chat.guided().map((g) => block(g.label,
    `<div class="pmds-grid pmds-grid-recipes">${g.items.map((it) => tile({ do: 'chat-guided', arg: it.id, icon: CHAT_ICON[g.id] || 'spark', title: it.label, sub: it.sub, attrs: chatAttrs(it) })).join('')}</div>`, { lead: g.lead })).join('');
  R.chat_moments = () => `<p class="pmds-blead pmds-chat-lead">${esc(T('studio.chat.moments.lead'))}</p><div class="pmds-screens pmds-moments">` + M.chat.moments().map((g) => `<div class="pmds-scgroup"><h5 class="pmds-gtitle"><span>${esc(g.label)}</span><span class="pmds-count">${g.items.length}</span></h5><div class="pmds-sclist">`
    + g.items.map((it) => `<button type="button"${at(Object.assign({ class: 'pmds-scrow', 'data-pmds-do': 'chat-moment', 'data-arg': `${g.id}:${it.id}`, 'data-key': `chat-moment:${g.id}:${it.id}`, 'data-pmh': 'row' }, chatAttrs(it)))}><span>${esc(it.label)}</span>${ico('chevron', 13)}</button>`).join('') + '</div></div>').join('') + '</div>';
  R.chat_takes = () => {
    const C = M.chat, cur = C.recipe();
    const radio = (on, action, arg, title, sub, cls) => `<button type="button" role="radio"${at({ class: `pmds-choice${cls ? ' ' + cls : ''}${on ? ' pmds-on' : ''}`, 'aria-checked': String(!!on), 'data-pmds-do': action, 'data-arg': arg, 'data-key': `${action}:${arg}`, 'data-pmh': 'tile' })}>`
      + `<span class="pmds-mark" aria-hidden="true">${ico('check', 12)}</span><span class="pmds-choice-text"><span class="pmds-choice-title">${esc(title)}</span>${sub ? `<span class="pmds-choice-sub">${esc(sub)}</span>` : ''}</span></button>`;
    const recipes = `<div class="pmds-choices" role="radiogroup" aria-label="${esc(T('studio.chat.takes.recipesTitle'))}">` + radio(cur < 0, 'chat-recipe', '-1', T('studio.chat.takes.custom'), T('studio.chat.takes.customSub'))
      + C.recipes().map((r) => radio(cur === r.index, 'chat-recipe', String(r.index), r.label, r.sub)).join('') + '</div>';
    const fams = C.families().map((f) => block(f.label, `<div class="pmds-choices pmds-choices-takes" role="radiogroup" aria-label="${esc(f.label)}">`
      + f.options.map((o) => radio(f.value === o.index, 'chat-take', `${f.id}:${o.index}`, `${o.index + 1}. ${o.label}`, o.note, 'pmds-choice-take')).join('') + '</div>', { lead: f.sub })).join('');
    const voice = `<div class="pmds-rowacts">${seg({ do: 'chat-voice', value: C.voice(), label: T('studio.chat.takes.voiceTitle'), items: C.voices().map((v) => ({ v, label: T(`studio.chat.takes.voices.${v}`) })) })}</div>`;
    return `<p class="pmds-blead pmds-chat-lead">${esc(T('studio.chat.takes.lead'))}</p>` + block(T('studio.chat.takes.recipesTitle'), recipes, { lead: T('studio.chat.takes.recipesLead') }) + fams
      + block(T('studio.chat.takes.voiceTitle'), voice, { lead: T('studio.chat.takes.voiceLead') });
  };

  R.usage = () => {
    const Us = M.usage, ok = Us.avail(), hourOk = Us.hourAvail(), running = hourOk && Us.hourRunning();
    return head('usage', `<div class="pmds-headacts">${btn(T('studio.usage.open'), { do: 'usage-open', icon: 'arrow' })}</div>`)
      + block('', sw({ id: 'live', icon: 'gauge', title: T('studio.usage.live'), sub: T('studio.usage.liveSub'), on: ok && Us.live(), do: 'usage-live', off: !ok }))
      + block('', '<div class="pmds-actrows">'
        + actRow('clock', running ? T('studio.usage.back') : T('studio.usage.hour'), running ? T('studio.usage.backSub') : T('studio.usage.hourSub'),
          `<span class="pmds-hourat" data-pmds-live="hour">${running ? esc(Us.hourLabel()) : ''}</span>${btn(running ? T('studio.usage.back') : T('studio.usage.hour'), { do: running ? 'usage-back' : 'usage-hour', icon: running ? 'back' : 'play', kind: 'primary', off: !hourOk })}`)
        + actRow('gallery', T('studio.usage.gallery'), T('studio.usage.gallerySub'), btn(T('studio.usage.galleryGo'), { do: 'usage-gallery', icon: 'arrow', off: !Us.galleryAvail() })) + '</div>');
  };

  const NOTICE_ICON = { quiet: 'check', run: 'flag', usage: 'gauge', approval: 'hand', burst: 'bell', all: 'list' };
  R.notices = () => head('notices', M.notices.clearAvail() ? `<div class="pmds-headacts">${btn(T('studio.notices.clear'), { do: 'notices-clear', icon: 'close' })}</div>` : '')
    + `<div class="pmds-grid pmds-grid-notices">${M.notices.ids.map((id, i) => tile({ do: 'notice', arg: id, icon: NOTICE_ICON[id], tone: 'abcabc'[i], title: T(`studio.notices.${id}.title`), sub: T(`studio.notices.${id}.sub`), off: !M.notices.avail() })).join('')}</div>`;

  R.looks = () => {
    const L = M.looks, now = L.now(), ok = L.avail();
    const grid = `<div class="pmds-looks" role="radiogroup" aria-label="${esc(T('studio.looks.title'))}">` + L.ids.map((f) => ['light', 'dark'].map((m) => {
      const on = now.look === f && now.mode === m, theme = f === 'nier' ? `basic-${m}` : `${f}-${m}`;
      return `<button type="button" role="radio"${at({ class: `pmds-looktile${on ? ' pmds-on' : ''}`, 'aria-checked': String(on), 'data-pmds-do': 'look', 'data-arg': `${f}:${m}`, 'data-key': `look:${f}:${m}`, 'data-pmh': ok && (f !== 'nier' || L.nierAvail()) ? 'tile' : null, 'aria-disabled': ok && (f !== 'nier' || L.nierAvail()) ? null : 'true' })}>`
        + `<span class="pmds-lookprev" data-theme="${theme}" data-pmds-prev="${f}" aria-hidden="true"><span class="pmds-lp-bar"></span><span class="pmds-lp-body"><span class="pmds-lp-rail"></span><span class="pmds-lp-main"><span class="pmds-lp-card"></span><span class="pmds-lp-card pmds-lp-card2"></span></span></span></span>`
        + `<span class="pmds-looklabel">${ico(m === 'light' ? 'sun' : 'moon', 13)}<span>${esc(T(`studio.looks.families.${f}`))}</span><span class="pmds-lookmode">${esc(T(`studio.looks.${m}`))}</span></span></button>`;
    }).join('')).join('') + '</div>';
    const mode = `<div class="pmds-rowacts"><span class="pmds-btitle">${esc(T('studio.looks.mode'))}</span>${seg({ do: 'look-mode', value: now.setMode, label: T('studio.looks.mode'), off: !ok, items: [{ v: 'light', label: T('studio.looks.light'), icon: 'sun' }, { v: 'dark', label: T('studio.looks.dark'), icon: 'moon' }, { v: 'auto', label: T('studio.looks.auto'), icon: 'auto' }] })}</div>`;
    const G = L.lg, lg = G.avail() ? block(T('studio.looks.lg.title'), `<div class="pmds-lgrows">`
      + `<div class="pmds-rowacts"><span class="pmds-btitle">${esc(T('studio.looks.lg.tier'))}</span>${seg({ do: 'lg-tier', value: G.tier(), label: T('studio.looks.lg.tier'), items: [{ v: 'gpu', label: T('studio.looks.lg.gpu') }, { v: 'cpu', label: T('studio.looks.lg.cpu') }] })}</div>`
      + (L.walls.avail() ? '' : `<h5 class="pmds-gtitle"><span>${esc(T('studio.looks.lg.wall'))}</span></h5><div class="pmds-walls" role="radiogroup" aria-label="${esc(T('studio.looks.lg.wall'))}">`
      + [{ id: 'look', name: T('studio.looks.lg.wallLook') }].concat(G.walls()).map((w) => `<button type="button" role="radio"${at({ class: `pmds-wall${G.wall() === w.id ? ' pmds-on' : ''}`, 'aria-checked': String(G.wall() === w.id), 'data-pmds-do': 'lg-wall', 'data-arg': w.id, 'data-key': `lg-wall:${w.id}`, 'data-pmh': 'row' })}><span class="pmds-mark" aria-hidden="true">${ico('check', 12)}</span><span>${esc(w.name || w.id)}</span></button>`).join('') + '</div>')
      + '</div>', { lead: T('studio.looks.lg.lead') }) : '';
    /* the shared wallpaper gallery: thumbnails are the wallpapers' own --wpk-t-<id>-<mode> prints */
    const WP = L.walls, wpick = WP.avail() ? WP.choice() : null;
    const wcell = (id, name) => `<button type="button" role="radio"${at({ class: `pmds-wp${wpick === id ? ' pmds-on' : ''}`, 'aria-checked': String(wpick === id), 'data-pmds-do': 'wall', 'data-arg': id, 'data-key': `wall:${id}`, 'data-pmh': 'tile' })}><span class="pmds-wp-pic" style="${id === 'look' ? '' : `background-image: var(--wpk-t-${esc(id)}-${now.mode})`}" aria-hidden="true">${id === 'look' ? ico('looks', 18) : ''}</span><span class="pmds-wp-name">${esc(name)}</span></button>`;
    const walls = WP.avail() ? block(T('studio.looks.walls.title'), `<div class="pmds-wps" role="radiogroup" aria-label="${esc(T('studio.looks.walls.title'))}">${wcell('look', T('studio.looks.walls.own'))}</div>`
      + WP.families().map((f) => `<h5 class="pmds-gtitle"><span>${esc(f.label)}</span><span class="pmds-count">${f.items.length}</span></h5><div class="pmds-wps" role="radiogroup" aria-label="${esc(f.label)}">${f.items.map((w) => wcell(w.id, w.name)).join('')}</div>`).join(''), { lead: T('studio.looks.walls.lead') }) : '';
    return head('looks') + block('', grid + mode) + walls + lg
      + block('', sw({ id: 'nier', icon: 'pod', title: T('studio.looks.nier'), sub: T('studio.looks.nierSub'), on: L.nierOn(), do: 'nier', off: !L.nierAvail() })
        + (L.nierOn() ? `<div class="pmds-rowacts pmds-indent">${btn(T('studio.looks.nierAdjust'), { do: 'nier-adjust', icon: 'studio' })}</div>` : '')
        + sw({ id: 'reduced', icon: 'motion', title: T('studio.looks.reduced'), sub: T('studio.looks.reducedSub'), on: L.reduced(), do: 'reduced', off: !L.reducedAvail() })
        + sw({ id: 'sound', icon: 'sound', title: T('studio.looks.sound'), sub: T('studio.looks.soundSub'), on: L.soundAvail() && L.sound(), do: 'sound', off: !L.soundAvail() }));
  };

  R.reset = () => {
    const keys = M.reset.ownedKeys();
    const cards = '<div class="pmds-resets">' + M.reset.ids.map((id, i) => {
      const armed = ST.confirm && ST.confirm.id === id;
      const items = M.reset.items(id).map((k) => `<li>${ico('check', 12)}<span>${esc(T(`studio.reset.items.${k}`))}</span></li>`).join('');
      const stays = T(`studio.reset.stays${id[0].toUpperCase()}${id.slice(1)}`);
      /* the action sits under the description, so the tall Everything card never hides it below the fold */
      const act = `<div class="pmds-resetact">${btn(armed ? T('studio.reset.confirm') : T('studio.reset.run'), { do: 'reset', arg: id, kind: armed ? 'danger' : 'secondary', icon: 'reset', off: !M.reset.avail(id) })}`
        + (armed ? `<span class="pmds-fuse" style="--pmds-fuse:${ST.confirm.ms}ms" aria-hidden="true"></span><span class="pmds-fine">${esc(T('studio.reset.confirmHint', { s: Math.round(ST.confirm.ms / 1000) }))}</span>` : '') + '</div>';
      return `<article class="pmds-reset${armed ? ' pmds-armed' : ''}" data-pmds-tone="${'abc'[i]}" data-pmds-reset="${id}"><header><span class="pmds-swart" aria-hidden="true">${ico(id === 'progress' ? 'onboarding' : id === 'layout' ? 'workspace' : 'reset', 18)}</span><span class="pmds-chname">${esc(T(`studio.reset.${id}.title`))}</span></header>`
        + `<p class="pmds-blead">${esc(T(`studio.reset.${id}.sub`))}</p>` + act + `<h5 class="pmds-gtitle"><span>${esc(T('studio.reset.goes'))}</span></h5><ul class="pmds-goes">${items}</ul>`
        + `<h5 class="pmds-gtitle"><span>${esc(T('studio.reset.stays'))}</span></h5><p class="pmds-fine">${esc(stays)}</p>`
        + (id === 'everything' ? `<details class="pmds-keys"><summary>${esc(T('studio.reset.found', { n: keys.length }))}</summary><ul>${keys.map((k) => `<li>${esc(k)}</li>`).join('')}</ul></details>` : '') + '</article>';
    }).join('') + '</div>';
    return head('reset') + cards;
  };

  R.switches = () => {
    const S = ST.sw || (ST.sw = M.switches.now()), live = M.switches.now();
    const loads = `<div class="pmds-choices pmds-choices-load" role="radiogroup" aria-label="${esc(T('studio.switches.onLoad'))}">` + M.switches.LOAD.map((id) => `<button type="button" role="radio"${at({ class: `pmds-choice${S.load === id ? ' pmds-on' : ''}`, 'aria-checked': String(S.load === id), 'data-pmds-do': 'sw-load', 'data-arg': id, 'data-key': `sw-load:${id}`, 'data-pmh': 'tile' })}><span class="pmds-mark" aria-hidden="true">${ico('check', 12)}</span><span class="pmds-choice-text"><span class="pmds-choice-title">${esc(T(`studio.switches.${id}`))}${live.load === id && id !== 'normal' ? ` <span class="pmds-livemark">${esc(T('studio.switches.active'))}</span>` : ''}</span><span class="pmds-choice-sub">${esc(T(`studio.switches.${id}Sub`))}</span></span></button>`).join('') + '</div>';
    const flags = [sw({ id: 'sw-situation', icon: 'onboarding', title: T('studio.switches.situation'), sub: T('studio.switches.situationSub', { situation: M.situationLabel(M.currentSituation()) }), on: S.situation, do: 'sw-situation' })]
      .concat(M.switches.FLAGS.map((f) => sw({ id: `sw-${f.id}`, icon: { pmh: 'tile', live: 'gauge', soft: 'computer', gallery: 'gallery' }[f.id] || 'link', title: T(`studio.switches.${f.id}`) + (live.flags[f.id] ? ' · ' + T('studio.switches.active') : ''), sub: T(`studio.switches.${f.id}Sub`), on: !!S.flags[f.id], do: 'sw-flag:' + f.id }))).join('');
    const url = M.switches.url(S);
    const addr = `<div class="pmds-addr"><label class="pmds-btitle" for="pmds-url">${esc(T('studio.switches.address'))}</label><input id="pmds-url" class="pmds-url" readonly value="${esc(url)}" spellcheck="false"><div class="pmds-rowacts">${btn(T('studio.switches.copy'), { do: 'sw-copy', icon: 'copy' })}${btn(T('studio.switches.reload'), { do: 'sw-reload', kind: 'primary', icon: 'reload' })}</div></div>`;
    return head('switches') + block(T('studio.switches.onLoad'), loads) + block('', flags) + block('', addr);
  };

  /* ---- search: every control by its words ---- */
  function searchIndex() {
    const out = [];
    const add = (section, label, sub, run, icon) => out.push({ section, label, sub: sub || '', run, icon: icon || section });
    add('start', T('studio.start.runTitle'), T('studio.start.runSub', { situation: M.situationLabel(M.currentSituation()) }), ['run-onboarding'], 'onboarding');
    add('start', T('studio.start.tourTitle'), '', ['tour-start'], 'tour');
    M.RECIPES.forEach((r) => add('start', T(`studio.recipes.${r.id}.title`), T(`studio.recipes.${r.id}.sub`), ['recipe', r.id], r.icon));
    M.BASES.concat(M.TWISTS).forEach((id) => add('onboarding', M.sitTitle(id), T(`studio.onboarding.situations.${id}.sub`), ['find-situation', id], 'onboarding'));
    M.SCREEN_CHAPTERS.forEach(([, ids]) => ids.forEach((id) => add('onboarding', T(`studio.onboarding.screens.${id}`), T('studio.onboarding.screensTitle'), ['open-screen', id], 'chevron')));
    M.tourChapters().forEach((c) => add('tour', c.name, T('studio.tour.chapter', { n: c.n }), ['tour-chapter', c.id], 'tour'));
    M.POINTS.forEach((p, i) => add('story', T(`studio.story.c${i + 1}`), T('studio.story.jump'), ['story-jump', p], 'flag'));
    add('story', T('studio.story.play'), T('studio.story.clock'), ['story-play'], 'play');
    M.workspace.layouts().forEach((l) => add('workspace', l.label, T('studio.workspace.layouts'), ['layout', l.id], 'layout'));
    add('workspace', T('studio.workspace.resetLayout'), '', ['layout-reset'], 'reset');
    add('workspace', T('studio.workspace.standIn'), T('studio.workspace.standInSub'), ['standin'], 'chat');
    add('workspace', T('studio.workspace.agents'), T('studio.workspace.agentsSub'), ['agents'], 'agent');
    add('workspace', T('studio.workspace.terminal'), T('studio.workspace.terminalSub'), ['agent-terminal'], 'terminal');
    add('workspace', T('studio.workspace.ask'), T('studio.workspace.askSub'), ['agent-ask'], 'hand');
    M.chat.guided().forEach((g) => g.items.forEach((it) => add('chat', it.label, T('studio.chat.searchGuided', { group: g.label }), ['chat-guided', it.id], CHAT_ICON[g.id] || 'chat')));
    M.chat.moments().forEach((g) => g.items.forEach((it) => add('chat', it.label, T('studio.chat.searchMoment', { group: g.label }), ['chat-moment', `${g.id}:${it.id}`], 'moment')));
    M.chat.families().forEach((f) => f.options.forEach((o) => add('chat', o.label, T('studio.chat.searchTake', { family: f.label }), ['chat-take', `${f.id}:${o.index}`], 'takes')));
    add('chat', T('studio.chat.show'), T('studio.chat.showSub'), ['chat-show'], 'chat');
    add('chat', T('studio.chat.reset'), T('studio.chat.resetSub'), ['chat-reset'], 'reset');
    add('usage', T('studio.usage.live'), T('studio.usage.liveSub'), ['usage-live'], 'gauge');
    add('usage', T('studio.usage.hour'), T('studio.usage.hourSub'), ['usage-hour'], 'clock');
    add('usage', T('studio.usage.gallery'), T('studio.usage.gallerySub'), ['usage-gallery'], 'gallery');
    M.notices.ids.forEach((id) => add('notices', T(`studio.notices.${id}.title`), T(`studio.notices.${id}.sub`), ['notice', id], NOTICE_ICON[id]));
    M.looks.ids.forEach((f) => ['light', 'dark'].forEach((m) => add('looks', `${T(`studio.looks.families.${f}`)} ${T(`studio.looks.${m}`)}`, T('studio.looks.title'), ['look', `${f}:${m}`], m === 'light' ? 'sun' : 'moon')));
    add('looks', T('studio.looks.nier'), T('studio.looks.nierSub'), ['nier'], 'pod');
    add('looks', T('studio.looks.reduced'), T('studio.looks.reducedSub'), ['reduced'], 'motion');
    add('looks', T('studio.looks.sound'), T('studio.looks.soundSub'), ['sound'], 'sound');
    M.reset.ids.forEach((id) => add('reset', T(`studio.reset.${id}.title`), T(`studio.reset.${id}.sub`), ['find-reset', id], 'reset'));
    M.switches.LOAD.concat(M.switches.FLAGS.map((f) => f.id)).forEach((id) => add('switches', T(`studio.switches.${id}`), T(`studio.switches.${id}Sub`), ['go', 'switches'], 'switches'));
    return out;
  }
  function searchResults(q) {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return searchIndex().map((it) => {
      const hay = `${it.label} ${it.sub} ${T(`studio.nav.${it.section}`)}`.toLowerCase();
      if (!words.every((w) => hay.includes(w))) return null;
      const score = (it.label.toLowerCase().startsWith(words[0]) ? 0 : it.label.toLowerCase().includes(words[0]) ? 1 : 2);
      return Object.assign({ score }, it);
    }).filter(Boolean).sort((a, b) => a.score - b.score).slice(0, 40);
  }
  R.search = () => {
    const list = searchResults(ST.q);
    if (!list.length) return `<p class="pmds-empty pmds-search-none">${esc(T('studio.searchNone', { q: ST.q }))}</p>`;
    return `<ol class="pmds-results">${list.map((it, i) => `<li><button type="button"${at({ class: `pmds-result${i === 0 ? ' pmds-first' : ''}`, 'data-pmds-do': it.run[0], 'data-arg': it.run[1], 'data-key': `result:${i}`, 'data-pmh': 'row' })}><span class="pmds-swart" aria-hidden="true">${ico(it.icon, 16)}</span><span class="pmds-swtext"><span class="pmds-swtitle">${esc(it.label)}</span><span class="pmds-swsub">${esc(it.sub)}</span></span><span class="pmds-resin">${esc(T('studio.searchIn', { section: T(`studio.nav.${it.section}`) }))}</span></button></li>`).join('')}</ol>`;
  };

  /* ---- the sheet ---- */
  function navMeta(id) {
    if (id === 'onboarding') return T('studio.navMeta.onboarding', { n: M.BASES.length + M.TWISTS.length });
    if (id === 'tour') return T('studio.navMeta.tour', { n: M.tourState().total });
    return T(`studio.navMeta.${id}`);
  }
  function entryHtml() {
    return `${ico('studio', 14)}<span class="pmds-entry-label">${esc(T('studio.entry'))}</span><span class="pmds-entry-world" data-pmds-live="entry">${esc(M.situationLabel(M.currentSituation()))}</span>`;
  }
  function sheetHtml() {
    return `<div class="pmds-frame" data-lg-surface="menu">`
      + `<header class="pmds-head"><span class="pmds-brandmark" aria-hidden="true">${ico('studio', 20)}</span><div class="pmds-brand"><p class="pmds-brandkicker">${esc(T('studio.kicker'))}</p><h2 class="pmds-title" id="pmds-title">${esc(T('studio.title'))}</h2></div>`
      + `<button type="button" class="pmds-grip" data-pmh="icon" aria-label="${esc(T('studio.move'))}" aria-describedby="pmds-movehint">${ico('move', 16)}</button><span class="pmds-sr" id="pmds-movehint">${esc(T('studio.moveHint'))}</span>`
      + `<button type="button" class="pmds-dock" data-pmds-do="put-back" data-pmh="icon" aria-label="${esc(T('studio.putBack'))}" hidden>${ico('dock', 16)}</button>`
      + `<label class="pmds-search">${ico('search', 15)}<input type="search" class="pmds-q" placeholder="${esc(T('studio.search'))}" aria-label="${esc(T('studio.searchLabel'))}" autocomplete="off" spellcheck="false"><kbd aria-hidden="true">/</kbd></label>`
      + `<button type="button" class="pmds-x" data-pmds-do="close" data-pmh="icon" aria-label="${esc(T('studio.close'))}">${ico('close', 16)}</button></header>`
      + `<div class="pmds-body"><nav class="pmds-nav" role="tablist" aria-orientation="vertical" aria-label="${esc(T('studio.title'))}"><span class="pmds-navink" aria-hidden="true"></span>`
      + SECTIONS.map((id) => `<button type="button" role="tab" class="pmds-tab" id="pmds-tab-${id}" data-pmds-tab="${id}" aria-controls="pmds-main" aria-selected="false" tabindex="-1" data-pmh="row">${ico(id, 17)}<span class="pmds-tabtext"><span class="pmds-tablabel">${esc(T(`studio.nav.${id}`))}</span><span class="pmds-tabmeta">${esc(navMeta(id))}</span></span></button>`).join('')
      + `</nav><div class="pmds-main" id="pmds-main" role="tabpanel" tabindex="-1"><div class="pmds-page"></div></div></div>`
      + `<footer class="pmds-now" aria-live="off"></footer></div>`;
  }
  function nowHtml() {
    const L = M.looks.now(), c = M.story.avail() ? M.story.clock() : null, ts = M.tourState();
    const item = (k, v, live) => `<span class="pmds-nowitem"><span class="pmds-nowk">${esc(T(`studio.now.${k}`))}</span><span class="pmds-nowv"${live ? ` data-pmds-live="${live}"` : ''}>${esc(v)}</span></span>`;
    return `<span class="pmds-nowlabel">${esc(T('studio.now.label'))}</span>`
      + item('situation', M.situationLabel(M.currentSituation()))
      + item('look', `${T(`studio.looks.families.${L.look}`)} ${T(`studio.looks.${L.mode}`)}`)
      + item('motion', M.looks.reduced() ? T('studio.now.motionReduced') : T('studio.now.motionFull'))
      + (c ? item('story', storyNow(c), 'now-story') : '')
      + item('tour', ts.kind === 'at' ? T('studio.now.tourAt', { n: ts.step, total: ts.total }) : ts.kind === 'running' ? T('studio.now.tourRunning') : T('studio.now.tourNone'));
  }
  const storyNow = (c) => (c.playing ? T('studio.now.storyPlaying', { t: M.fmtClock(c.t), x: `${c.speed}x` }) : T('studio.now.storyPaused', { t: M.fmtClock(c.t) }));

  /* ---- look sync ---- */
  function lookOf() { const th = O55.theme(); return { look: th.nier ? 'nier' : th.family, mode: th.mode }; }
  function syncLook() {
    if (!ST.sheet) return;
    const l = lookOf();
    ST.el.setAttribute('data-pmds-look', l.look); ST.el.setAttribute('data-pmds-mode', l.mode);
    ST.el.toggleAttribute('data-pmds-reduced', O55.motion.reduced());
    syncScene(l.look);
  }
  /* NieR Mode's background scene, the one the app is showing (html[data-o55-nier-scene], PM_NIER_SCENES), drawn behind
     the Studio's page too; parsed once per scene */
  function syncScene(look) {
    const frame = ST.sheet.querySelector('.pmds-frame'), key = document.documentElement.getAttribute('data-o55-nier-scene');
    const S = window.PM_NIER_SCENES, want = look === 'nier' && key && S && typeof S.svg === 'function' ? key : null;
    let layer = frame.querySelector('.pmds-scene');
    ST.el.toggleAttribute('data-pmds-scene', !!want);
    if (!want) { if (layer) layer.remove(); return; }
    if (layer && layer.dataset.scene === want) return;
    let svg = ''; try { svg = S.svg(want) || ''; } catch (_) { svg = ''; }
    if (!svg) { if (layer) layer.remove(); ST.el.removeAttribute('data-pmds-scene'); return; }
    if (!layer) { layer = document.createElement('div'); layer.className = 'pmds-scene'; layer.setAttribute('aria-hidden', 'true'); frame.insertBefore(layer, frame.firstChild); }
    layer.dataset.scene = want; layer.innerHTML = svg;
  }
  const voice = () => (O55.motion.reduced() ? 'reduced' : lookOf().look);

  /* ---- geometry: anchored bottom-left, above the status bar, under the title bar ---- */
  function place() {
    if (!ST.sheet) return;
    const de = document.documentElement, vw = de.clientWidth, vh = de.clientHeight;
    const bar = document.getElementById('pm7GlobalStatusBar'), tb = document.querySelector('.title-bar');
    const br = bar && bar.getClientRects().length ? bar.getBoundingClientRect() : null;
    const tr = tb && tb.getClientRects().length ? tb.getBoundingClientRect() : null;
    const narrow = ST.el.hasAttribute('data-o55-narrow');
    const gap = 8;
    const bottom = narrow ? gap : br ? Math.max(gap, Math.round(vh - br.top + gap)) : 56;
    const top = narrow ? gap : tr ? Math.round(tr.bottom + gap) : 48;
    const left = narrow ? gap : Math.max(gap, Math.min(14, vw));
    const w = Math.max(300, Math.min(1000, vw - left - gap));
    const h = Math.max(320, Math.min(720, vh - bottom - top));
    /* home is the corner above the item; a moved sheet keeps its own place, pulled back inside the window */
    ST.home = { x: left, y: Math.max(gap, vh - bottom - h), w, h };
    const away = !!ST.pos && !narrow;
    const x = away ? clamp(ST.pos.x, gap, vw - w - gap) : ST.home.x;
    const y = away ? clamp(ST.pos.y, gap, vh - h - gap) : ST.home.y;
    setXY(x, y);
    const s = ST.sheet.style;
    s.setProperty('--pmds-w', w + 'px'); s.setProperty('--pmds-h', h + 'px');
    ST.sheet.toggleAttribute('data-pmds-compact', w < 700);
    ST.sheet.toggleAttribute('data-pmds-away', away);
    ST.sheet.toggleAttribute('data-pmds-fixed', narrow);
    const dock = ST.sheet.querySelector('.pmds-dock'); if (dock) dock.hidden = !away;
  }
  const clamp = (v, a, b) => Math.min(Math.max(v, a), Math.max(a, b));
  function setXY(x, y) { const s = ST.sheet.style; s.setProperty('--pmds-x', Math.round(x) + 'px'); s.setProperty('--pmds-top', Math.round(y) + 'px'); ST.at = { x, y }; }

  /* ---- moving ---- */
  function loadPos() { const v = O55.store.get(POS_KEY, null); return v && Number.isFinite(v.x) && Number.isFinite(v.y) ? { x: v.x, y: v.y } : null; }
  function savePos() { if (ST.pos) O55.store.set(POS_KEY, { x: Math.round(ST.pos.x), y: Math.round(ST.pos.y) }); else O55.store.clear(POS_KEY); }
  const nearHome = (x, y) => !!ST.home && Math.hypot(x - ST.home.x, y - ST.home.y) <= SNAP;
  /* the outline of home, shown while the sheet is carried (and lit when a drop would land there) */
  function ghost(show, lit) {
    let g = ST.el.querySelector('.pmds-homeghost');
    if (!show) { if (g) g.remove(); return; }
    if (!g) { g = document.createElement('span'); g.className = 'pmds-homeghost'; g.setAttribute('aria-hidden', 'true'); ST.el.insertBefore(g, ST.sheet); }
    const s = g.style, h = ST.home;
    s.left = h.x + 'px'; s.top = h.y + 'px'; s.width = h.w + 'px'; s.height = h.h + 'px';
    g.toggleAttribute('data-lit', !!lit);
  }
  /* glide from where the sheet is drawn now to where place() puts it (FLIP on translate) */
  function glideFrom(x0, y0) {
    const dx = x0 - ST.at.x, dy = y0 - ST.at.y;
    if (!dx && !dy) return;
    const v = voice(), ms = v === 'reduced' ? 0 : v === 'friendly' ? 560 : v === 'glass' ? 420 : v === 'retro' ? 160 : v === 'nier' ? 180 : 300;
    if (!ms) return;
    const ease = v === 'friendly' ? SPRING : v === 'retro' ? 'steps(4, end)' : v === 'nier' ? 'steps(3, end)' : 'cubic-bezier(.2,.8,.2,1)';
    const a = ST.sheet.animate([{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }], { duration: ms, easing: ease });
    ST.anims.push(a); a.finished.then(() => { ST.anims = ST.anims.filter((z) => z !== a); }, () => {});
  }
  function putBack() {
    if (!ST.pos) return;
    const x0 = ST.at.x, y0 = ST.at.y;
    ST.pos = null; savePos(); place(); glideFrom(x0, y0);
    if (O55.sound) O55.sound.play('back');
  }
  /* a keyboard step: inside the window, and home again when it lands on its corner */
  function moveBy(dx, dy) {
    if (ST.sheet.hasAttribute('data-pmds-fixed')) return;
    const de = document.documentElement;
    const x = clamp(ST.at.x + dx, 8, de.clientWidth - ST.home.w - 8), y = clamp(ST.at.y + dy, 8, de.clientHeight - ST.home.h - 8);
    ST.pos = Math.round(x) === Math.round(ST.home.x) && Math.round(y) === Math.round(ST.home.y) ? null : { x, y };
    savePos(); place();
  }
  function dragStart(e) {
    if (e.button !== 0 || ST.sheet.hasAttribute('data-pmds-fixed')) return;
    if (e.target.closest('input, label.pmds-search, .pmds-x, .pmds-dock')) return;
    const head = e.currentTarget;
    e.preventDefault();
    ST.drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x0: ST.at.x, y0: ST.at.y, moved: false, raf: 0, x: ST.at.x, y: ST.at.y };
    try { head.setPointerCapture(e.pointerId); } catch (_) {}
  }
  function dragMove(e) {
    const d = ST.drag; if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    if (!d.moved) { d.moved = true; ST.sheet.setAttribute('data-pmds-dragging', ''); ghost(true, false); }
    const de = document.documentElement;
    d.x = clamp(d.x0 + dx, 8, de.clientWidth - ST.home.w - 8); d.y = clamp(d.y0 + dy, 8, de.clientHeight - ST.home.h - 8);
    if (!d.raf) d.raf = real.raf(() => { d.raf = 0; setXY(d.x, d.y); ghost(true, nearHome(d.x, d.y)); });
  }
  function dragEnd(e) {
    const d = ST.drag; if (!d || (e && e.pointerId !== d.id)) return;
    ST.drag = null;
    ST.sheet.removeAttribute('data-pmds-dragging'); ghost(false);
    if (!d.moved) return;
    setXY(d.x, d.y);
    if (nearHome(d.x, d.y)) { const x0 = d.x, y0 = d.y; ST.pos = null; savePos(); place(); glideFrom(x0, y0); if (O55.sound) O55.sound.play('select'); return; }
    ST.pos = { x: d.x, y: d.y }; savePos(); place();
  }

  /* ---- motion: each look's own voice ---- */
  const SPRING = 'linear(0, 0.009, 0.035 2.1%, 0.141 4.4%, 0.723 12.9%, 0.938 16.7%, 1.017 19.4%, 1.067, 1.099 24.3%, 1.108 26%, 1.104, 1.089 30.6%, 1.033 37.2%, 1.002 41.6%, 0.988 46.4%, 0.993 56.2%, 1.001 66.7%, 1)';
  /* A motion is a list of tracks, [keyframes, ms, easing, delay], played together, so the fade and the travel keep their
     own timing (one easing over a whole spring put the fade and the overshoot into the first 50 ms, where nobody saw
     them). Friendly's travel is a real spring (SPRING, overshoot about 11 %); Retro and NieR step; Glass rises with
     depth; Basic eases. */
  const fade = (a, b, ms, ease, delay) => [[{ opacity: a }, { opacity: b }], ms, ease || 'linear', delay || 0];
  const move = (a, b, ms, ease, delay) => [[{ transform: a }, { transform: b }], ms, ease, delay || 0];
  const VOICE = {
    basic: {
      open: [fade(0, 1, 170, 'cubic-bezier(.3,0,.2,1)'), move('translateY(16px) scale(.965)', 'none', 340, 'cubic-bezier(.2,.8,.2,1)')],
      close: [fade(1, 0, 150, 'cubic-bezier(.4,0,1,1)', 30), move('none', 'translateY(10px) scale(.98)', 180, 'cubic-bezier(.4,0,1,1)')],
      page: [fade(0, 1, 180, 'cubic-bezier(.3,0,.2,1)'), move('translateY(var(--pmds-dir, 10px))', 'none', 300, 'cubic-bezier(.2,.8,.2,1)')],
      item: [fade(0, 1, 200, 'cubic-bezier(.3,0,.2,1)'), move('translateY(8px)', 'none', 320, 'cubic-bezier(.2,.8,.2,1)')], stagger: 20, inkMs: 240, inkEase: 'cubic-bezier(.2,.8,.2,1)' },
    friendly: {
      open: [fade(0, 1, 200, 'cubic-bezier(.3,0,.2,1)'), move('translateY(36px) scale(.84)', 'none', 680, SPRING)],
      close: [move('none', 'translateY(28px) scale(.86)', 260, 'cubic-bezier(.55,0,.8,.4)'), fade(1, 0, 190, 'cubic-bezier(.4,0,1,1)', 70)],
      page: [fade(0, 1, 170, 'cubic-bezier(.3,0,.2,1)'), move('translateY(var(--pmds-dir, 20px)) scale(.985)', 'none', 560, SPRING)],
      item: [fade(0, 1, 170, 'cubic-bezier(.3,0,.2,1)'), move('translateY(18px) scale(.9)', 'none', 600, SPRING)], stagger: 36, inkMs: 600, inkEase: SPRING },
    retro: {
      open: [[[{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], 320, 'steps(10, end)', 0]],
      close: [[[{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(100% 0 0 0)' }], 200, 'steps(6, end)', 0]],
      page: [[[{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], 200, 'steps(8, end)', 0]],
      item: [fade(0, 1, 1, 'steps(1, end)')], stagger: 26, inkMs: 120, inkEase: 'steps(3, end)' },
    glass: {
      open: [fade(0, 1, 260, 'cubic-bezier(.3,0,.2,1)'), move('translateY(22px) scale(.93)', 'none', 560, 'cubic-bezier(.16,1,.3,1)')],
      close: [fade(1, 0, 200, 'cubic-bezier(.4,0,1,1)', 40), move('none', 'translateY(12px) scale(.96)', 240, 'cubic-bezier(.4,0,.8,.4)')],
      page: [fade(0, 1, 220, 'cubic-bezier(.3,0,.2,1)'), move('translateY(12px) scale(.985)', 'none', 420, 'cubic-bezier(.16,1,.3,1)')],
      item: [fade(0, 1, 240, 'cubic-bezier(.3,0,.2,1)'), move('translateY(10px) scale(.97)', 'none', 460, 'cubic-bezier(.16,1,.3,1)')], stagger: 22, inkMs: 380, inkEase: 'cubic-bezier(.16,1,.3,1)' },
    nier: {
      open: [[[{ transform: 'scaleY(.012)' }, { transform: 'scaleY(.012)', offset: 0.34 }, { transform: 'none' }], 320, 'steps(6, end)', 0]],
      close: [[[{ transform: 'none' }, { transform: 'scaleY(.012)', offset: 0.66 }, { transform: 'scaleY(.012)', opacity: 0 }], 220, 'steps(4, end)', 0]],
      page: [[[{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], 200, 'steps(5, end)', 0]],
      item: [fade(0, 1, 1, 'steps(1, end)')], stagger: 30, inkMs: 140, inkEase: 'steps(2, end)' },
    reduced: { open: [fade(0, 1, 140)], close: [fade(1, 0, 110)], page: [fade(0, 1, 120)], item: null, stagger: 0, inkMs: 0 }
  };
  /* play a motion's tracks on el; o.fill and o.scale (a duration factor) apply to every track, o.delay adds to each */
  function play(el, tracks, o) {
    o = o || {};
    if (!el || !el.animate || !tracks) return null;
    let last = null;
    tracks.forEach(([frames, ms, ease, delay]) => {
      const a = el.animate(frames, { duration: Math.max(1, Math.round(ms * (o.scale || 1))), easing: ease || 'linear', delay: (delay || 0) + (o.delay || 0), fill: o.fill || 'backwards' });
      ST.anims.push(a); a.finished.then(() => { ST.anims = ST.anims.filter((x) => x !== a); }, () => {});
      if (!last || ms + (delay || 0) >= last.end) last = { a, end: ms + (delay || 0) };
    });
    return last ? last.a : null;
  }
  function anim(el, frames, ms, ease, o) {
    if (!el || !el.animate || !frames) return null;
    const a = el.animate(frames, Object.assign({ duration: Math.max(1, ms), easing: ease || 'linear', fill: 'backwards' }, o || {}));
    ST.anims.push(a); a.finished.then(() => { ST.anims = ST.anims.filter((x) => x !== a); }, () => {});
    return a;
  }
  /* the page's parts arrive one after another (the hero, the blocks, then each tile inside them) */
  function stagger(root, v) {
    if (!v.item || !v.stagger) return;
    const items = root.querySelectorAll('.pmds-phead, .pmds-runbar, .pmds-clock, .pmds-tile, .pmds-choice, .pmds-chapter, .pmds-laytile, .pmds-looktile, .pmds-reset, .pmds-swrow, .pmds-actrow, .pmds-point, .pmds-result');
    let i = 0;
    items.forEach((el) => { if (i > 22) return; play(el, v.item, { delay: 40 + i * v.stagger }); i++; });
  }
  function moveInk(instant) {
    if (!ST.sheet) return;
    const ink = ST.sheet.querySelector('.pmds-navink'), tab = ST.sheet.querySelector(`.pmds-tab[data-pmds-tab="${ST.section}"]`);
    if (!ink) return;
    if (!tab || ST.q) { ink.style.opacity = '0'; return; }
    const nav = tab.parentElement, compact = ST.sheet.hasAttribute('data-pmds-compact');
    const to = compact ? { x: tab.offsetLeft, y: tab.offsetTop, w: tab.offsetWidth, h: tab.offsetHeight } : { x: 0, y: tab.offsetTop, w: nav.clientWidth, h: tab.offsetHeight };
    const from = ink.dataset.at ? JSON.parse(ink.dataset.at) : null;
    ink.style.opacity = '1';
    ink.style.transform = `translate(${to.x}px, ${to.y}px)`; ink.style.width = to.w + 'px'; ink.style.height = to.h + 'px';
    ink.dataset.at = JSON.stringify(to);
    const v = VOICE[voice()] || VOICE.basic;
    if (instant || !from || !v.inkMs) return;
    anim(ink, [{ transform: `translate(${from.x}px, ${from.y}px)`, width: from.w + 'px', height: from.h + 'px' }, { transform: `translate(${to.x}px, ${to.y}px)`, width: to.w + 'px', height: to.h + 'px' }], v.inkMs, v.inkEase);
  }

  /* ---- rendering ---- */
  function renderMain(how) {
    if (!ST.sheet) return;
    const main = ST.sheet.querySelector('.pmds-main'), old = main.querySelector('.pmds-page');
    const keep = how === 'stay';
    const scroll = keep ? main.scrollTop : 0;
    const focusKey = keep && document.activeElement && main.contains(document.activeElement) ? document.activeElement.getAttribute('data-key') : null;
    const page = document.createElement('div');
    page.className = 'pmds-page';
    page.setAttribute('data-pmds-section', ST.q ? 'search' : ST.section);
    page.innerHTML = ST.q ? R.search() : R[ST.section]();
    main.replaceChild(page, old);
    main.setAttribute('aria-labelledby', ST.q ? '' : `pmds-tab-${ST.section}`);
    exemptTags(page);
    main.scrollTop = scroll;
    if (focusKey) { const f = page.querySelector(`[data-key="${CSS.escape(focusKey)}"]`); if (f) f.focus({ preventScroll: true }); }
    ST.sheet.querySelectorAll('.pmds-tab').forEach((t) => { const on = !ST.q && t.getAttribute('data-pmds-tab') === ST.section; t.setAttribute('aria-selected', String(on)); t.tabIndex = on || (ST.q && t.getAttribute('data-pmds-tab') === 'start') ? 0 : -1; t.classList.toggle('pmds-on', on); });
    renderNow();
    if (!keep && how !== 'none') {
      const v = VOICE[voice()] || VOICE.basic;
      /* the page comes from the side of the section it replaces: up the rail, it drops in from above */
      const dir = (how === 'up' ? -1 : 1) * (voice() === 'friendly' ? 20 : 10) + 'px';
      play(page, v.page.map(([frames, ms, ease, delay]) => [frames.map((k) => (k.transform ? Object.assign({}, k, { transform: k.transform.replace(/var\(--pmds-dir[^)]*\)/, dir) }) : k)), ms, ease, delay]));
      stagger(page, v);
      const FX = O55.nierFx;
      if (voice() === 'nier' && FX) { const t = page.querySelector('[data-pmds-decode]'); if (t && FX.decode) FX.decode(t, {}); }
    }
  }
  /* the page's hover tags would repeat a control's own words over the Studio (the old item exempted its buttons the same
     way); a control with only an icon keeps its tag */
  function exemptTags(root) { root.querySelectorAll('button:not([aria-label]), input').forEach((b) => { if (!b.hasAttribute('data-pm-hover-exempt')) b.setAttribute('data-pm-hover-exempt', 'true'); }); }
  function renderNow() { const f = ST.sheet && ST.sheet.querySelector('.pmds-now'); if (f) f.innerHTML = nowHtml(); }
  function renderEntry() {
    const w = ST.entry && ST.entry.querySelector('[data-pmds-live="entry"]');
    if (w) w.textContent = M.situationLabel(M.currentSituation());
  }
  function refresh() { if (ST.open) renderMain('stay'); renderEntry(); }
  M.refresh = refresh;

  /* live readouts while open: the story clock and beats, Usage's demo time, the foot */
  function tick() {
    if (!ST.open || !ST.sheet) return;
    const c = M.story.avail() ? M.story.clock() : null;
    const q = (sel) => ST.sheet.querySelector(`[data-pmds-live="${sel}"]`);
    if (c) {
      const t = q('clock-time'); if (t) t.textContent = M.fmtClock(c.t);
      const n = q('now-story'); if (n) n.textContent = storyNow(c);
      const b = q('beats'); if (b && ST.tick % 2 === 0) { const html = beatsHtml(); if (b.innerHTML !== html) b.innerHTML = html; }
    }
    const h = q('hour'); if (h && M.usage.hourRunning()) h.textContent = M.usage.hourLabel();
    ST.tick++;
  }

  /* ---- open and close ---- */
  function build() {
    if (ST.sheet) return;
    const sheet = document.createElement('section');
    sheet.id = 'pmds-sheet'; sheet.className = 'pmds-sheet';
    sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-labelledby', 'pmds-title'); sheet.hidden = true;
    sheet.innerHTML = sheetHtml();
    exemptTags(sheet);
    ST.el.appendChild(sheet);
    ST.sheet = sheet;
    sheet.addEventListener('click', onClick);
    sheet.addEventListener('input', onInput);
    sheet.addEventListener('keydown', onKey);
    const head = sheet.querySelector('.pmds-head');
    head.addEventListener('pointerdown', dragStart);
    head.addEventListener('pointermove', dragMove);
    head.addEventListener('pointerup', dragEnd);
    head.addEventListener('pointercancel', dragEnd);
    head.addEventListener('dblclick', (e) => { if (!e.target.closest('input, label.pmds-search, button')) putBack(); });
    ST.pos = loadPos();
  }
  function open(section, how) {
    if (!ST.el) return false;
    build(); syncLook();
    if (section && SECTIONS.includes(section)) { ST.section = section; ST.q = ''; }
    const was = ST.open;
    ST.open = true; ST.pick = null; ST.sw = null; ST.confirm = null;
    ST.entry.setAttribute('aria-expanded', 'true');
    /* while the Studio is open, the item's hover tag would sit over the Studio's foot and say "Hide the related choices" */
    ST.entry.setAttribute('data-pm-hover-exempt', 'true');
    ST.el.setAttribute('data-pmds-open', '');
    const q = ST.sheet.querySelector('.pmds-q'); if (q && !was) { q.value = ''; ST.q = ''; }
    ST.sheet.hidden = false;
    ST.sheet.getAnimations().forEach((a) => a.cancel());
    place(); renderMain('none'); moveInk(true);
    if (!was) {
      const v = VOICE[voice()] || VOICE.basic;
      const er = ST.entry.getBoundingClientRect(), sr = ST.sheet.getBoundingClientRect();
      ST.sheet.style.transformOrigin = `${clamp(er.left + er.width / 2 - sr.left, 0, sr.width)}px ${sr.height}px`;
      play(ST.sheet, v.open);
      stagger(ST.sheet.querySelector('.pmds-page'), v);
      if (v.item && v.stagger) ST.sheet.querySelectorAll('.pmds-tab').forEach((t, i) => play(t, v.item, { delay: 60 + i * Math.round(v.stagger * 0.6) }));
      if (O55.sound) O55.sound.play('open');
    }
    clearInterval(ST.timer); ST.timer = setInterval(tick, 500);
    real.raf(() => {
      const t = how === 'pointer' ? ST.sheet.querySelector('.pmds-main') : ST.sheet.querySelector('.pmds-tab[aria-selected="true"]');
      if (t) t.focus({ preventScroll: true });
    });
    return true;
  }
  /* close(o): o.launch = an action takes over (onboarding or the tour), so the sheet leaves quickly; o.focus = false
     keeps focus where it is */
  function close(o) {
    o = o || {};
    if (!ST.open || !ST.sheet) return false;
    ST.open = false; ST.confirm = null;
    clearInterval(ST.timer); ST.timer = 0;
    ST.entry.setAttribute('aria-expanded', 'false');
    ST.entry.removeAttribute('data-pm-hover-exempt');
    ST.el.removeAttribute('data-pmds-open');
    const sheet = ST.sheet, v = VOICE[voice()] || VOICE.basic;
    const a = play(sheet, v.close, { fill: 'forwards', scale: o.launch ? 0.8 : 1 });
    const done = () => { if (!ST.open) { sheet.hidden = true; sheet.getAnimations().forEach((x) => x.cancel()); } };
    if (a) a.finished.then(done, done); else done();
    if (O55.sound && !o.launch) O55.sound.play('close');
    if (o.focus !== false && sheet.contains(document.activeElement)) ST.entry.focus({ preventScroll: true });
    return true;
  }
  const toggle = (section, how) => (ST.open && (!section || section === ST.section) ? close() : open(section, how));
  function go(section, how) {
    if (!SECTIONS.includes(section)) return;
    const from = SECTIONS.indexOf(ST.section), to = SECTIONS.indexOf(section);
    const q = ST.sheet.querySelector('.pmds-q');
    if (ST.q) { ST.q = ''; if (q) q.value = ''; }
    if (section === ST.section && !how) return;
    ST.section = section; ST.confirm = null;
    renderMain(how || (to < from ? 'up' : 'down')); moveInk(false);
    if (O55.sound) O55.sound.play('move');
  }

  /* ---- actions ---- */
  function say(text) { try { if (O55.pageToast) O55.pageToast(text, 2600); else if (window.toast) window.toast(text); } catch (_) {} }
  function launch(fn) { close({ launch: true, focus: false }); real.setTimeout(() => { try { Promise.resolve(fn()).then(renderEntry, renderEntry); } catch (e) { console.error('[demo studio]', e); } }, 90); }
  const A = {
    close: () => close(),
    'put-back': () => { putBack(); real.raf(() => { const g = ST.sheet.querySelector('.pmds-grip'); if (g) g.focus({ preventScroll: true }); }); },
    go: (arg) => go(arg),
    'run-onboarding': () => launch(() => M.onboarding.run(M.currentSituation())),
    'run-pick': () => launch(() => M.onboarding.run(M.joinSituation(ST.pick || M.parseSituation(M.currentSituation())))),
    'onboarding-continue': () => launch(() => M.onboarding.resume()),
    'open-screen': (arg) => launch(() => M.onboarding.screen(arg, ST.pick ? M.joinSituation(ST.pick) : null)),
    'pick-base': (arg) => { ST.pick = { base: arg, twists: (ST.pick || M.parseSituation(M.currentSituation())).twists }; commitPick(); },
    'pick-twist': (arg) => { ST.pick = M.toggleTwist(ST.pick || M.parseSituation(M.currentSituation()), arg).pick; commitPick(); },
    'find-situation': (arg) => { ST.q = ''; ST.sheet.querySelector('.pmds-q').value = ''; ST.section = 'onboarding'; ST.pick = M.parseSituation(M.currentSituation()); if (M.BASES.includes(arg)) ST.pick.base = arg; else if (!ST.pick.twists.includes(arg)) ST.pick = M.toggleTwist(ST.pick, arg).pick; commitPick(); renderMain('down'); moveInk(false); focusKey(M.BASES.includes(arg) ? `pick-base:${arg}` : `pick-twist:${arg}`); },
    'tour-start': () => launch(() => M.tour.start()),
    'tour-resume': () => launch(() => M.tour.resume()),
    'tour-chapter': (arg) => launch(() => M.tour.chapter(arg)),
    recipe: (arg) => { const r = M.RECIPES.find((x) => x.id === arg); if (!r) return; if (r.kind === 'launch') launch(r.run); else { r.run(); real.setTimeout(refresh, 120); } },
    'story-play': () => { const c = M.story.clock(); if (c && c.playing) M.story.pause(); else M.story.play(); refresh(); },
    'story-speed': (arg) => { M.story.speed(Number(arg)); refresh(); },
    'story-jump': (arg) => { M.story.jump(arg); const i = M.POINTS.indexOf(arg); say(T('studio.toast.jumped', { point: T(`studio.story.c${i + 1}`) })); refresh(); },
    'story-over': () => M.story.over(),
    layout: (arg) => { M.workspace.use(arg); real.setTimeout(refresh, 60); },
    'layout-reset': () => { M.workspace.reset(); real.setTimeout(refresh, 60); },
    standin: () => { M.workspace.setStandIn(!M.workspace.standIn()); real.setTimeout(refresh, 60); },
    agents: () => { M.workspace.agents(); },
    'chat-view': (arg) => { if (!CHAT_VIEWS.includes(arg)) return; ST.chatView = arg; renderMain('stay'); ST.sheet.querySelector('.pmds-main').scrollTop = 0; focusKey(`chat-view:${arg}`); },
    /* a recorded example plays on its own and uses the whole workspace, so the Studio steps aside (like onboarding) */
    'chat-guided': (arg) => { if (!M.chat.avail()) return say(T('studio.toast.unavailable')); launch(() => M.chat.runGuided(arg)); },
    /* a moment stays: the Studio is open beside the chat, so moments can be stepped through */
    'chat-moment': (arg) => { const i = String(arg).indexOf(':'); const r = M.chat.avail() ? M.chat.run(arg.slice(0, i), arg.slice(i + 1)) : { ok: false }; if (!r.ok) say(T('studio.toast.unavailable')); real.setTimeout(refresh, 400); },
    'chat-take': (arg) => { const [f, i] = String(arg).split(':'); if (!M.chat.avail()) return say(T('studio.toast.unavailable')); M.chat.setTake(f, Number(i)); real.setTimeout(refresh, 60); },
    'chat-recipe': (arg) => { if (!M.chat.avail()) return say(T('studio.toast.unavailable')); M.chat.setRecipe(Number(arg)); real.setTimeout(refresh, 60); },
    'chat-voice': (arg) => { if (!M.chat.avail()) return say(T('studio.toast.unavailable')); M.chat.setVoice(arg); real.setTimeout(refresh, 60); },
    'chat-show': () => { if (!M.chat.avail()) return say(T('studio.toast.unavailable')); M.chat.show(); real.setTimeout(refresh, 160); },
    'chat-reset': () => { if (!M.chat.avail()) return say(T('studio.toast.unavailable')); M.chat.reset(); say(T('studio.chat.resetDone')); real.setTimeout(refresh, 240); },
    'agent-terminal': () => { M.workspace.terminal(); },
    'agent-ask': () => { M.workspace.ask(); },
    'usage-open': () => { M.usage.open(); },
    'usage-live': () => { M.usage.setLive(!M.usage.live()); refresh(); },
    'usage-hour': () => { M.usage.hour(); real.setTimeout(refresh, 60); },
    'usage-back': () => { M.usage.back(); real.setTimeout(refresh, 60); },
    'usage-gallery': () => { M.usage.gallery(); },
    notice: (arg) => { M.notices.fire(arg); },
    'notices-clear': () => { M.notices.clear(); },
    look: (arg) => { const [f, m] = arg.split(':'); M.looks.set(f, m); real.setTimeout(() => { syncLook(); refresh(); }, 80); },
    wall: (arg) => { M.looks.walls.choose(arg); real.setTimeout(refresh, 120); },
    'lg-tier': (arg) => { M.looks.lg.setTier(arg); real.setTimeout(refresh, 80); },
    'lg-wall': (arg) => { M.looks.lg.setWall(arg); real.setTimeout(refresh, 80); },
    'look-mode': (arg) => { M.looks.mode(arg); real.setTimeout(() => { syncLook(); refresh(); }, 80); },
    nier: () => { M.looks.setNier(!M.looks.nierOn()); real.setTimeout(() => { syncLook(); refresh(); }, 120); },
    'nier-adjust': (arg, el) => { M.looks.adjust(el); },
    reduced: () => { M.looks.setReduced(!M.looks.reducedSetting()); real.setTimeout(() => { syncLook(); refresh(); }, 80); },
    sound: () => { M.looks.setSound(!M.looks.sound()); refresh(); },
    'find-reset': (arg) => { ST.q = ''; ST.sheet.querySelector('.pmds-q').value = ''; ST.section = 'reset'; renderMain('down'); moveInk(false); focusKey(`reset:${arg}`); },
    reset: (arg) => {
      const armed = ST.confirm && ST.confirm.id === arg;
      if (!armed) { ST.confirm = { id: arg, ms: 5000, at: performance.now() }; clearTimeout(ST.fuse); ST.fuse = real.setTimeout(() => { if (ST.confirm && ST.confirm.id === arg) { ST.confirm = null; refresh(); } }, 5000); refresh(); focusKey(`reset:${arg}`); return; }
      ST.confirm = null; clearTimeout(ST.fuse);
      if (arg === 'progress') return launch(() => M.reset.progress());
      if (arg === 'layout') { M.reset.layout(); say(T('studio.toast.resetLayout')); return refresh(); }
      return launch(() => M.reset.everything());
    },
    'sw-load': (arg) => { ST.sw = Object.assign({}, ST.sw || M.switches.now(), { load: arg }); refresh(); },
    'sw-situation': () => { const s = ST.sw || M.switches.now(); ST.sw = Object.assign({}, s, { situation: !s.situation }); refresh(); },
    'sw-copy': () => { const v = M.switches.url(ST.sw || M.switches.now()); try { navigator.clipboard.writeText(v).then(() => say(T('studio.switches.copied')), () => {}); } catch (_) {} },
    'sw-reload': () => { M.switches.reload(ST.sw || M.switches.now()); }
  };
  function commitPick() { M.applySituation(M.joinSituation(ST.pick)); renderEntry(); refresh(); }
  function focusKey(k) { real.raf(() => { const el = ST.sheet && ST.sheet.querySelector(`[data-key="${CSS.escape(k)}"]`); if (el) { el.focus({ preventScroll: false }); el.scrollIntoView({ block: 'nearest' }); } }); }
  function onClick(e) {
    const tab = e.target.closest('[data-pmds-tab]');
    if (tab && ST.sheet.contains(tab)) return go(tab.getAttribute('data-pmds-tab'));
    const b = e.target.closest('[data-pmds-do]');
    if (!b || !ST.sheet.contains(b)) return;
    if (b.getAttribute('aria-disabled') === 'true') { say(T('studio.toast.unavailable')); return; }
    let what = b.getAttribute('data-pmds-do'), arg = b.getAttribute('data-arg');
    if (what.startsWith('sw-flag:')) { const id = what.slice(8), s = ST.sw || M.switches.now(); ST.sw = Object.assign({}, s, { flags: Object.assign({}, s.flags, { [id]: !s.flags[id] }) }); return refresh(); }
    const fn = A[what];
    if (!fn) return;
    if (O55.sound && !['close', 'go'].includes(what)) O55.sound.play('select');
    try { fn(arg, b); } catch (err) { console.error('[demo studio]', what, err); say(T('studio.toast.unavailable')); }
  }
  function onInput(e) {
    if (!e.target.classList.contains('pmds-q')) return;
    const had = !!ST.q;
    ST.q = e.target.value.trim();
    renderMain(had && ST.q ? 'stay' : ST.q ? 'down' : 'up'); moveInk(false);
  }
  function onKey(e) {
    const t = e.target;
    if (e.key === 'Escape') {
      e.preventDefault(); e.stopPropagation();
      if (ST.q) { const q = ST.sheet.querySelector('.pmds-q'); q.value = ''; ST.q = ''; renderMain('up'); moveInk(false); q.focus(); return; }
      if (ST.confirm) { ST.confirm = null; refresh(); return; }
      return close();
    }
    if (t.classList && t.classList.contains('pmds-q') && e.key === 'Enter') { const first = ST.sheet.querySelector('.pmds-result'); if (first) { e.preventDefault(); first.click(); } return; }
    if (t.classList && t.classList.contains('pmds-q') && e.key === 'ArrowDown') { const first = ST.sheet.querySelector('.pmds-result'); if (first) { e.preventDefault(); first.focus(); } return; }
    if (t.classList && t.classList.contains('pmds-grip') && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(e.key)) {
      e.preventDefault();
      if (e.key === 'Home') return putBack();
      const step = e.shiftKey ? 64 : 16;
      return moveBy(e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0, e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0);
    }
    if (e.key === '/' && !(t.matches && t.matches('input, textarea'))) { e.preventDefault(); ST.sheet.querySelector('.pmds-q').focus(); return; }
    if (t.getAttribute && t.getAttribute('role') === 'tab' && ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      const i = SECTIONS.indexOf(t.getAttribute('data-pmds-tab')), n = SECTIONS.length;
      const j = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (i + (['ArrowDown', 'ArrowRight'].includes(e.key) ? 1 : -1) + n) % n;
      go(SECTIONS[j]); const nt = ST.sheet.querySelector(`#pmds-tab-${SECTIONS[j]}`); if (nt) nt.focus();
      return;
    }
    if (t.getAttribute && t.getAttribute('role') === 'radio' && ['ArrowLeft', 'ArrowRight'].includes(e.key)) {
      const group = t.closest('[role="radiogroup"]'); if (!group) return;
      const items = Array.from(group.querySelectorAll('[role="radio"]')), i = items.indexOf(t);
      const next = items[(i + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length];
      if (next) { e.preventDefault(); next.focus(); }
    }
  }

  /* ---- mount (90-demo.js) ---- */
  M.mount = function mount(el, entry) {
    ST.el = el; ST.entry = entry;
    entry.innerHTML = entryHtml();
    entry.addEventListener('click', (e) => toggle(null, e.detail ? 'pointer' : 'key'));
    window.addEventListener('resize', () => { if (ST.open && !ST.drag) { place(); moveInk(true); } });
    const mo = new MutationObserver(() => { syncLook(); if (ST.open) { renderNow(); place(); } });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier', 'data-motion', 'data-o55-nier-scene'] });
    new MutationObserver(() => { if (ST.open) { place(); real.raf(() => moveInk(true)); } }).observe(el, { attributes: true, attributeFilter: ['data-o55-narrow'] });
    /* the old item's keys stopped at the item so the shell's shortcuts never saw them; the sheet keeps that */
    ['keydown', 'keyup', 'keypress'].forEach((ev) => el.addEventListener(ev, (e) => { e.stopPropagation(); if (ev === 'keydown' && e.key === 'Escape' && ST.open && !ST.sheet.contains(e.target)) close(); }));
    syncLook();
    /* Liquid Glass (pm7-liquid-glass): with its engine on the page, its own status-bar button and popover step aside and
       the Studio's Looks section carries those controls (PM_LG) */
    if (window.PM_LG) document.documentElement.setAttribute('data-lg-demo-host', '');
  };
  M.open = open; M.close = close; M.toggle = toggle; M.go = (s) => (ST.open ? go(s) : open(s));
  M.isOpen = () => ST.open;
})();
