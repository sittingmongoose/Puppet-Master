/* The title bar's Home options button (the old controller made it; it no longer runs). Same id and the row the tour
   scripts click (run-onboarding), now in the picker look with the named layouts (D2) and the chat's place. */

PMW.installTitlebar = function () {
  if (qs('#pm-home-more-btn')) return;
  var anchor = qs('#themeMenuWrap');
  if (!anchor || !anchor.parentNode) return;
  var btn = h('button', { type: 'button', id: 'pm-home-more-btn', class: 'pm-home-titlebar-more pmw-tb-btn', 'aria-haspopup': 'menu', 'aria-expanded': 'false',
    'aria-label': 'Home options', 'data-pm-hover-label': 'Home options', 'data-pm-hover-detail': 'Layouts, the chat and onboarding', 'data-pm-home-top-action': 'home-menu' }, [icon('layout', { size: 15 })]);
  anchor.parentNode.insertBefore(btn, anchor);
  btn.addEventListener('click', function () { PMW.menus.home(btn); });
};

menus.home = function (anchor) {
  var l = state.layout;
  var rows = PMW.NAMED_ORDER.map(function (name) {
    return { id: 'layout-' + name, label: PMW.NAMED[name].label, checked: l.named === name, run: function () { PMW.applyNamed(name); } };
  });
  var saved = PMW.savedLayouts();
  Object.keys(saved).forEach(function (name) { rows.push({ id: 'saved-' + name, label: name, checked: l.named === name, run: function () { PMW.applyNamed(name); } }); });
  var chatRows = [
    { id: 'chat-toggle', label: PMW.chatCol.isVisible() ? 'Hide the chat' : 'Show the chat', icon: 'chat', run: function () { PMW.chatCol.setVisible(!PMW.chatCol.isVisible()); } },
    PMW.chatCol.isFloating()
      ? { id: 'chat-dock', label: 'Dock the chat back', icon: 'popOut', run: function () { PMW.chatCol.dockBack(); } }
      : { id: 'chat-pop', label: 'Pop out the chat', icon: 'popOut', sub: 'The only way to move it', run: function () { PMW.chatCol.popOut(); } },
    { id: 'chat-pin', label: 'Keep the chat open in narrow windows', checked: !!PMW.settings.get('chat.pinOpen'), run: function () { PMW.settings.set('chat.pinOpen', !PMW.settings.get('chat.pinOpen')); } }
  ];
  if (PMW.standIn) chatRows.push({ id: 'stand-in', label: PMW.standIn.isOn() ? 'Show the current chat' : 'Show the stand-in chat', sub: 'The stand-in exercises every way the chat opens tabs', icon: 'transcript', run: function () { PMW.standIn.toggle(); } });
  var other = [
    { id: 'save', label: 'Save this layout...', icon: 'keep', run: function () { nextFrame(function () { menu.prompt(anchor, { title: 'Save layout as', ok: 'Save', value: '', done: function (v) { PMW.saveNamedLayout(v); } }); }); } },
    { id: 'reset', label: 'Restore home layout', icon: 'reopen', sub: 'Open tabs stay open', run: function () { PMW.resetLayout(); } },
    { id: 'onboarding', label: 'Run Onboarding Again', icon: 'play', run: function () {
      try { if (window.PM7_ONBOARDING_CINEMATIC && PM7_ONBOARDING_CINEMATIC.replay) PM7_ONBOARDING_CINEMATIC.replay({ source_surface: 'home_menu' }); } catch (_) {}
    } }
  ];
  var hnd = menu.open(anchor, { id: 'home-menu', title: 'Home', width: 300, align: 'end', className: 'pmw-home-menu',
    sections: [{ label: 'Layouts', rows: rows }, { label: 'Chat', rows: chatRows }, { rows: other }] });
  if (hnd) {
    // the tour scripts look for these ids
    hnd.el.id = 'pm-home-more-menu';
    var onb = qsa('.pmw-mitem', hnd.el).filter(function (b) { return /Run Onboarding Again/.test(b.textContent); })[0];
    if (onb) { onb.setAttribute('data-pm-home-action', 'run-onboarding'); onb.setAttribute('data-ui-action-id', 'ui.onboarding.start'); onb.setAttribute('data-source-surface', 'home_menu'); }
  }
  return hnd;
};
