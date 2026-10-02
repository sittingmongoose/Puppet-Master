/* Boot: after the shell has built its rail (icon hydration, activity bar customization, the status bar), add the
   concept views, pick the first concept and install the switcher. Concepts registered themselves before this runs. */

PMR.boot = function boot() {
  if (PMR.booted) return;
  let tries = 0;
  const go = () => {
    tries += 1;
    const ready = document.getElementById('sidePanelSlot') && document.getElementById('activityBar')
      && (typeof window.PMIcon === 'function' || window.PM_ICONS);
    if (!ready && tries < 120) { setTimeout(go, 50); return; }
    PMR.booted = true;
    PMR.host.ensureViews();
    PMR.host.watchPanels();
    PMR.host.setConcept(PMR.switcher.initial(), { force: true });
    let n = 0;
    const sw = () => { if (!PMR.switcher.install() && ++n < 100) setTimeout(sw, 100); };
    sw();
    document.documentElement.setAttribute('data-pmr-ready', '1');
    document.dispatchEvent(new CustomEvent('pmr:ready'));
  };
  if (document.readyState === 'complete') setTimeout(go, 0);
  else window.addEventListener('load', () => setTimeout(go, 0), { once: true });
};
