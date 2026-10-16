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
  const mo = new MutationObserver(mutations => { if (D.on) applyCountMutations(mutations); });
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
  viewInOff();
  releaseAllLeaving();
  D.shown = null;
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
        /* the panel shown is never still held from an earlier switch (held panels are inert, SH-4): a rail closed
           and reopened onto it before its fade ended takes no hold to release it */
        if (p._dLeave) releaseLeaving(p);
        /* redrawn while hidden (10-skin.js schedule skips a panel not on screen): skinned now, before its first frame */
        if (p._dSkinStale && D.on) { p._dSkinStale = false; applyPanel(p, false); }
        if (info.reason === 'switch' && D.on) viewIn();
        /* the panel that was on screen stays until this one's entrance starts (30-motion.js holdLeaving); a rail opened
           from closed had none on screen, so the panel shown before it closed is never held over the new one */
        const was = D.shown && D.shown !== p && D.shown.isConnected && info.reason === 'switch' && !info.opened ? D.shown : null;
        D.shown = p;
        const left = was ? holdLeaving(was) : null;
        requestAnimationFrame(() => {
          fitAll(p);
          if (info.reason === 'switch' || info.reason === 'concept') enterPanel(p, left);
          else if (left) releaseLeaving(left);
          hooksFor(p, 'show').forEach(h => h.show(p, info));
        });
      },
      destroy() { unmountSkin(); },
    };
  },
  bar(barEl) { return mountBar(barEl); },
});
