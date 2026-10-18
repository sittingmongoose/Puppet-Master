
/* Keep title-bar search width in sync when theme flips (friendly + glass). */
(function () {
  function kickSearchDensity() {
    try {
      var wrap = document.getElementById('tbSearchWrap');
      if (wrap) wrap.style.removeProperty('--tb-search-w');
      window.dispatchEvent(new Event('resize'));
    } catch (e) {}
  }
  if (typeof MutationObserver === 'function') {
    var kickPending = false;   /* O55: once, after the new look's frame (B4) */
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].attributeName === 'data-theme') {
          if (!kickPending) {
            kickPending = true;
            /* inside the first ResizeObserver delivery after the new look's layout: style and layout are already
               computed for that frame, so the listeners' reads never pull a pending restyle forward */
            var kick = function () { kickPending = false; kickSearchDensity(); };
            if (typeof window.PM_AFTER_LAYOUT === 'function') window.PM_AFTER_LAYOUT(kick);   /* the shell's early observer */
            else requestAnimationFrame(function () { setTimeout(kick, 0); });
          }
          break;
        }
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', kickSearchDensity);
  } else {
    kickSearchDensity();
  }
})();
