/* Cell metrics. A cell is an integer number of device pixels wide and tall, so the grid never smears:
   devW = round((advance + letterSpacing) * dpr), devH = round(fontPx * lineHeight * dpr), and the baseline sits so the
   font's ascent and descent are centred in the cell. The native port uses the same rule. */
(function () {
  var cache = new Map();
  var probe = null;
  function ctx() {
    if (!probe) probe = document.createElement('canvas').getContext('2d');
    return probe;
  }
  function fontString(o, weight, italic) {
    return (italic ? 'italic ' : '') + weight + ' ' + o.fontPx + 'px ' + o.family;
  }
  T.Metrics = {
    font: fontString,
    measure: function (o) {
      /* o: { family, fontPx, weight, boldWeight, lineHeight, letterSpacing, dpr } */
      var dpr = o.dpr || 1;
      var key = [o.family, o.fontPx, o.weight, o.lineHeight, o.letterSpacing, dpr].join('|');
      var hit = cache.get(key); if (hit) return hit;
      var c = ctx();
      c.font = fontString(o, o.weight || 400, false);
      var tm = c.measureText('MMMMMMMMMM');
      var adv = tm.width / 10;
      var g = c.measureText('Mg|');
      var asc = g.fontBoundingBoxAscent !== undefined ? g.fontBoundingBoxAscent : (g.actualBoundingBoxAscent || o.fontPx * 0.8);
      var desc = g.fontBoundingBoxDescent !== undefined ? g.fontBoundingBoxDescent : (g.actualBoundingBoxDescent || o.fontPx * 0.2);
      var devW = Math.max(1, Math.round((adv + (o.letterSpacing || 0)) * dpr));
      var natural = asc + desc;
      var devH = Math.max(Math.ceil(natural * dpr * 0.9), Math.round(o.fontPx * (o.lineHeight || 1.2) * dpr));
      var baseline = Math.round((devH - natural * dpr) / 2 + asc * dpr);
      var m = {
        dpr: dpr, devW: devW, devH: devH, cellW: devW / dpr, cellH: devH / dpr, baseline: baseline,
        ascent: asc, descent: desc, advance: adv, fontPx: o.fontPx, family: o.family,
        weight: o.weight || 400, boldWeight: o.boldWeight || 700,
        font: fontString({ fontPx: o.fontPx * dpr, family: o.family }, o.weight || 400, false),
        fontBold: fontString({ fontPx: o.fontPx * dpr, family: o.family }, o.boldWeight || 700, false),
        fontItalic: fontString({ fontPx: o.fontPx * dpr, family: o.family }, o.weight || 400, true),
        fontBoldItalic: fontString({ fontPx: o.fontPx * dpr, family: o.family }, o.boldWeight || 700, true),
        letterSpacing: o.letterSpacing || 0
      };
      if (cache.size > 64) cache.clear();
      cache.set(key, m);
      return m;
    },
    /* resolves when the first family in the stack has loaded (or after a short timeout) */
    ready: function (family, px) {
      if (!document.fonts || !document.fonts.load) return Promise.resolve();
      var first = String(family).split(',')[0].trim();
      var p = Promise.all([
        document.fonts.load('400 ' + (px || 13) + 'px ' + first, 'Mg'),
        document.fonts.load('700 ' + (px || 13) + 'px ' + first, 'Mg')
      ]).catch(function () {});
      return Promise.race([p, new Promise(function (r) { setTimeout(r, 1500); })]).then(function () { cache.clear(); });
    },
    clear: function () { cache.clear(); }
  };
})();
