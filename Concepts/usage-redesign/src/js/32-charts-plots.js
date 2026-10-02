/* Plot primitives (owner: charts; DESIGN-SPEC section 7.2): area, line, columns, spark, budget, heat, timeline, rangebars.
   Skeleton: each is the placeholder with its final signature PMU.charts.<name>(host, spec, opts) -> Chart. */
(function () {
  var charts = PMU.charts;
  ['area', 'line', 'columns', 'spark', 'budget', 'heat', 'timeline', 'rangebars'].forEach(function (name) {
    if (!charts[name]) charts[name] = charts.placeholder(name);
  });
})();
