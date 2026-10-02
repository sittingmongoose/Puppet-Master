/* Chart kit core (owner: charts; ARCHITECTURE.md section 4.6, DESIGN-SPEC section 7). Every primitive is
   PMU.charts.<name>(host, spec, opts) -> {el, update, resize, enter, destroy}. Sizes come from layout boxes
   (clientWidth / clientHeight), never getBoundingClientRect (the NieR unfold scales the card while charts mount).
   Skeleton: helpers and a placeholder factory; the charts builder replaces the bodies, not the signatures. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var charts = PMU.charts = PMU.charts || {};

  charts.svg = function (tag, attrs, parent) {
    var el = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(el);
    return el;
  };
  /* layout size only: transform-independent */
  charts.size = function (host) { return { w: Math.max(0, host.clientWidth), h: Math.max(0, host.clientHeight) }; };
  /* round ticks: 1, 2, 2.5, 4, 5, 8 x 10^n (B's niceScale) */
  charts.ticks = function (min, max, n) {
    var span = Math.max(1e-9, max - min), raw = span / Math.max(1, (n || 4)), e = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / e;
    var step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 4 ? 4 : f <= 5 ? 5 : f <= 8 ? 8 : 10) * e;
    var out = []; for (var v = Math.floor(min / step) * step; v <= max + step * 0.001; v += step) out.push(+v.toFixed(10));
    return out;
  };
  /* one page-level <defs>: vertical gradient pmu-g-K and horizontal pmu-gh-K per series slot, NieR / estimate patterns */
  charts.defs = function () {
    var defs = document.getElementById('pmuDefs');
    if (!defs || defs.getAttribute('data-ready')) return defs;
    var html = '';
    for (var k = 0; k < 8; k++) {
      html += '<linearGradient id="pmu-g-' + k + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="pmu-stop-top" style="stop-color:var(--pmu-s' + k + ')"/>' +
        '<stop offset="1" class="pmu-stop-bottom" style="stop-color:var(--pmu-s' + k + ')"/></linearGradient>';
      html += '<linearGradient id="pmu-gh-' + k + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--pmu-s' + k + '-b)"/>' +
        '<stop offset="1" style="stop-color:var(--pmu-s' + k + ')"/></linearGradient>';
    }
    html += '<pattern id="pmu-pat-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v6" stroke="currentColor" stroke-width="2"/></pattern>' +
      '<pattern id="pmu-pat-cross" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 0l6 6M6 0l-6 6" stroke="currentColor" stroke-width="1"/></pattern>' +
      '<pattern id="pmu-pat-dots" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.1" fill="currentColor"/></pattern>' +
      '<pattern id="pmu-pat-rules" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3h6" stroke="currentColor" stroke-width="1.2"/></pattern>';
    defs.innerHTML = html;
    defs.setAttribute('data-ready', '1');
    return defs;
  };
  charts.legend = function (host, items) {
    var el = document.createElement('div'); el.className = 'pmu-legend';
    el.innerHTML = (items || []).map(function (it) {
      return '<span class="pmu-legend-item" data-series-index="' + (it.idx || 0) + '"><i class="pmu-swatch"></i><span>' + esc(it.name) + '</span>' +
        (it.valueText ? '<b>' + esc(it.valueText) + '</b>' : '') + '</span>';
    }).join('');
    host.appendChild(el);
    return el;
  };
  /* placeholder factory used by the skeleton primitives: a labelled box with the primitive's name */
  charts.placeholder = function (name) {
    return function (host, spec, opts) {
      var el = document.createElement('div');
      el.className = 'pmu-chart pmu-chart-todo';
      el.setAttribute('data-pmu-chart', name);
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', (opts && opts.label) || name);
      el.textContent = name;
      host.appendChild(el);
      return { el: el, update: function () {}, resize: function () {}, enter: function () {}, destroy: function () { el.remove(); } };
    };
  };
})();
