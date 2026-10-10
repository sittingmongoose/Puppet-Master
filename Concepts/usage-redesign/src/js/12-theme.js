/* Look detection and the token cache (owner: engine; ARCHITECTURE.md section 4.3, DESIGN-SPEC section 9).
   Tokens are read once per look from inside .pmu-shell (never per render), invalidated by one MutationObserver on <html>. */
(function () {
  var root = document.documentElement;
  var cache = { key: null, look: null, tokens: {} };
  var listeners = [];

  function keyNow() {
    return [root.getAttribute('data-theme') || '', root.getAttribute('data-o55-nier') || '', root.getAttribute('data-o55-nier-parts') || '',
      root.getAttribute('data-motion') || '', root.getAttribute('style') || ''].join('|');
  }
  function look() {
    var key = keyNow();
    if (cache.key === key && cache.look) return cache.look;
    var slug = root.getAttribute('data-theme') || 'basic-dark';
    var parts = (root.getAttribute('data-o55-nier-parts') || '').split(/\s+/).filter(Boolean);
    var nier = root.getAttribute('data-o55-nier') === 'on';
    cache = { key: key, tokens: {}, look: { family: slug.split('-')[0] || 'basic', mode: /light$/.test(slug) ? 'light' : 'dark', slug: slug,
      nier: nier, parts: new Set(nier ? parts : []), key: key } };
    return cache.look;
  }
  function token(name) {
    look();
    if (name in cache.tokens) return cache.tokens[name];
    var host = document.getElementById('pmuApp') || root;
    var value = getComputedStyle(host).getPropertyValue(name).trim();
    cache.tokens[name] = value;
    return value;
  }

  var pending = 0;
  new MutationObserver(function () {
    if (pending) return;
    pending = requestAnimationFrame(function () {
      pending = 0;
      var before = cache.key;
      if (keyNow() === before) return;
      var next = look();
      listeners.slice().forEach(function (fn) { try { fn(next); } catch (error) { console.error('[pm-usage] look listener', error); } });
    });
  }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier', 'data-o55-nier-parts', 'data-motion', 'style'] });

  /* official marks swap their light / dark artwork with the theme (06-marks.js refresh): the Usage page's, then every
     hosted board's root and the shared layer's (D10 7.1; PMU.boards is made later, by 40-board.js) */
  listeners.push(function () {
    try {
      if (!window.PMU_MARKS || !window.PMU_MARKS.refresh) return;
      window.PMU_MARKS.refresh(document.getElementById('pmuApp'));
      if (PMU.boards) PMU.boards.all().forEach(function (b) { if (b !== PMU.board && b.root) window.PMU_MARKS.refresh(b.root); });
      var lay = document.querySelector('[data-pmu-host="layer"]'); if (lay) window.PMU_MARKS.refresh(lay);
    } catch (error) {}
  });

  PMU.theme = {
    look: look,
    has: function (part) { var l = look(); return l.nier && l.parts.has(part); },
    token: token,
    series: function (k) { return { a: token('--pmu-s' + k), b: token('--pmu-s' + k + '-b') }; },
    onChange: function (fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (f) { return f !== fn; }); }; }
  };
})();
