/* Concept D: register with the host as a skin. mount() applies the skin to the shell's nine rail panels and returns
   show(info) (entrance motion when a panel opens) and destroy() (undo every change). */

function mountSkin() {
  D.on = true;
  panelEls().forEach(p => {
    applyPanel(p, false);
    applyCounts(p, false);
    wireThumb(p);
    wirePublish(p);
    const tabs = Array.from(p.querySelectorAll('[data-tab]'));
    p._dTab = Math.max(0, tabs.findIndex(t => t.classList.contains('active')));
  });
  observePanels();
  watchFit();
  listen(document, 'click', onMenuClick, true);
  listen(document, 'keydown', onMenuKey, true);
  listen(document, 'click', onClickMotion);
  listen(document, 'click', onEngine);
  /* counts roll when the shell changes them */
  const mo = new MutationObserver(() => { if (D.on) panelEls().forEach(p => applyCounts(p, true)); });
  panelEls().forEach(p => mo.observe(p, { subtree: true, characterData: true, childList: true }));
  D.observers.push(mo);
  requestAnimationFrame(fitAll);
}

function unmountSkin() {
  D.on = false;
  try { PMR.menu.closeAll(); } catch (e) { /* ignore */ }
  D.observers.forEach(o => { try { o.disconnect(); } catch (e) { /* ignore */ } });
  D.observers = [];
  D.listeners.forEach(off => off());
  D.listeners = [];
  panelEls().forEach(p => {
    p.querySelectorAll('*').forEach(el => { if (el.getAnimations) el.getAnimations().forEach(a => { if (a.id === 'd-enter') a.cancel(); }); });
    delete p._dTab;
    p.querySelectorAll(COUNT_SEL).forEach(el => { delete el._dCount; delete el._dCountN; });
    p.querySelectorAll(STATUS_SEL).forEach(el => { delete el._dSeen; });
  });
  clearFit();
  panelEls().forEach(p => hooksFor(p, 'unmount').forEach(h => h.unmount(p)));
  undoAll();
}

PMR.concepts.register('d', {
  label: 'Polish', blurb: "Today's rail, polished", skin: true,
  mount() {
    mountSkin();
    return {
      show(info) {
        const p = document.getElementById(info && info.target);
        if (!p) return;
        requestAnimationFrame(() => {
          fitAll(p);
          if (info.reason === 'switch' || info.reason === 'concept') enterPanel(p);
          hooksFor(p, 'show').forEach(h => h.show(p, info));
        });
      },
      destroy() { unmountSkin(); },
    };
  },
  bar(barEl) { return mountBar(barEl); },
});
