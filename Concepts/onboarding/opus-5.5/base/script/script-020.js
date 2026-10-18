
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
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].attributeName === 'data-theme') { kickSearchDensity(); break; }
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', kickSearchDensity);
  } else {
    kickSearchDensity();
  }
})();
