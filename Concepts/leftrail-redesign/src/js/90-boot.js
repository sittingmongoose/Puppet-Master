/* Boot: after the shell has built its rail (icon hydration, activity bar customization, the status bar), pick the first
   concept and, in the review copy, install the switcher. Concepts registered themselves before this runs (the review
   script follows the published one, and boot waits for load). The published page has no switcher: it always mounts D,
   whose root attributes are already in its <html> tag. */

PMR.boot = function boot() {
  if (PMR.booted) return;
  let tries = 0;
  const go = () => {
    tries += 1;
    const ready = document.getElementById('sidePanelSlot') && document.getElementById('activityBar')
      && (typeof window.PMIcon === 'function' || window.PM_ICONS);
    if (!ready && tries < 120) { setTimeout(go, 50); return; }
    PMR.booted = true;
    PMR.host.watchPanels();
    const first = PMR.switcher ? PMR.switcher.initial() : 'd';
    PMR.host.setConcept(first, { force: true });
    if (PMR.switcher) {
      let n = 0;
      const sw = () => { if (!PMR.switcher.install() && ++n < 100) setTimeout(sw, 100); };
      sw();
    }
    document.documentElement.setAttribute('data-pmr-ready', '1');
    document.dispatchEvent(new CustomEvent('pmr:ready'));
  };
  if (document.readyState === 'complete') setTimeout(go, 0);
  else window.addEventListener('load', () => setTimeout(go, 0), { once: true });
};
