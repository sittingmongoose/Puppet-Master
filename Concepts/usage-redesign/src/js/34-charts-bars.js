/* Bar, meter and ring primitives (owner: charts; DESIGN-SPEC section 7.2): meter, windowCell, ranked, mix, ring, gauge,
   headroom. The skeleton meter is functional (sliding-window fill, DESIGN-SPEC 7.2 quota meter) so the content builder
   can lay out limit and account cards today; the charts builder finishes it (ticks, tone gradients, readout, motion). */
(function () {
  var charts = PMU.charts;
  charts.meter = function (host, spec, opts) {
    var el = document.createElement('div');
    el.className = 'pmu-meter';
    function paint(s) {
      var known = typeof s.pct === 'number';
      el.setAttribute('data-tone', s.tone || 'calm');
      if (s.window) el.setAttribute('data-window', s.window);
      el.innerHTML = '<div class="pmu-meterhead"><span class="pmu-meterlabel">' + esc(s.label || '') + '</span>' +
        '<b class="pmu-metervalue">' + (known ? esc(s.valueText || PMU.fmt.used(s.pct)) : PMU.vs.html(s.vs || 'unknown')) + '</b></div>' +
        (known ? '<div class="pmu-metertrack"><i class="pmu-meterfill" style="--fill:' + Math.max(0, Math.min(100, s.pct)) + '%"></i></div>' : '') +
        (s.resetText ? '<div class="pmu-meterfoot">' + esc(s.resetText) + '</div>' : '');
    }
    paint(spec || {});
    host.appendChild(el);
    return { el: el, update: function (s) { paint(s || {}); }, resize: function () {}, enter: function () {}, destroy: function () { el.remove(); } };
  };
  charts.windowCell = charts.meter;
  ['ranked', 'mix', 'ring', 'gauge', 'headroom'].forEach(function (name) {
    if (!charts[name]) charts[name] = charts.placeholder(name);
  });
})();
