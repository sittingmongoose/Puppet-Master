/* sheet.js: the family contact sheet's frame (tools/family_sheet.py). OWNER: pm7-glyphs-designer2 (2026-10-10).
 * Matrix mode (no ?look): ten iframes of this page, one per look and mode. Look mode: the family file
 * (src/sheets/<family>.js) calls PMG_SHEET.render(function (S) { return html; }) with the helpers below. */
(function () {
  'use strict';
  var N = window.PM56_NEON, html = document.documentElement, main = document.getElementById('sheet');
  var q = new URLSearchParams(location.search);
  var LOOKS = ['basic', 'friendly', 'glass', 'retro', 'nier'], NAME = { basic: 'Basic', friendly: 'Friendly', glass: 'Glass', retro: 'Retro', nier: 'NieR' };
  if (html.hasAttribute('data-pmg-matrix')) {
    var fw = q.get('w') || 600, fh = q.get('h') || 760, motion = q.get('motion') || 'full', f = [];
    ['light', 'dark'].forEach(function (m) { LOOKS.forEach(function (l) { f.push('<iframe title="' + NAME[l] + ' ' + m + '" src="' + location.pathname.split('/').pop() + '?look=' + l + '-' + m + '&motion=' + motion + '"></iframe>'); }); });
    main.innerHTML = '<div class="pmg-matrix" style="--fw:' + fw + 'px;--fh:' + fh + 'px">' + f.join('') + '</div>';
    window.PMG_SHEET = { render: function () {} };
    return;
  }
  document.body.setAttribute('data-theme', html.getAttribute('data-theme'));
  var look = html.getAttribute('data-pmg-look') || 'basic-dark';

  /* contrast of a glyph's ink on the field behind it (the catalog's maths) */
  function rgba(s) { var m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return null; var p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
  function over(c, b) { return [0, 1, 2].map(function (i) { return c[i] * c[3] + b[i] * (1 - c[3]); }).concat(1); }
  function lum(c) { return [0, 1, 2].map(function (i) { var x = c[i] / 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }).reduce(function (a, x, i) { return a + x * [.2126, .7152, .0722][i]; }, 0); }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
  function field(el) {
    var st = []; for (var n = el; n && n.nodeType === 1; n = n.parentElement) { var c = rgba(getComputedStyle(n).backgroundColor); if (c && c[3] > 0) st.push(c); }
    var b = rgba(getComputedStyle(document.body).backgroundColor) || [0, 0, 0, 1]; if (b[3] < 1) b = over(b, [255, 255, 255, 1]);
    for (var i = st.length - 1; i >= 0; i--) b = over(st[i], b); return b;
  }
  function contrast(svg) { var t = svg && svg.querySelector('.nx-c'); if (!t) return null; var cs = getComputedStyle(t), ink = rgba(t.classList.contains('nx-f') ? cs.fill : cs.stroke); if (!ink) return null; var f = field(svg); return ratio(over(ink, f), f); }

  var S = {
    look: look, name: NAME[look.split('-')[0]] + ' ' + look.split('-')[1],
    nier: html.hasAttribute('data-o55-nier'),
    icon: function (n, z, cls) { return N.icon(n, z, cls || ''); },
    status: function (k, z, cls) { return N.status(k, z, cls || ''); },
    /* a glyph at real sizes (wrap: a class on each size's host, for a context rule), with its contrast at 16 px */
    sizes: function (label, n, cls, zs, wrap) {
      return '<div class="sh-sizes"><span class="sh-name">' + label + '</span>' + (zs || [12, 14, 16, 20]).map(function (z) { return '<span class="sh-z' + (wrap ? ' ' + wrap : '') + '">' + N.icon(n, z, cls || '') + z + '</span>'; }).join('') + '<span class="sh-cr" data-cr></span></div>';
    }
  };
  window.PMG_SHEET = {
    render: function (fn) {
      var probs = (window.PMG && window.PMG.problems) || [], miss = N.misses || [];
      main.innerHTML = '<div class="sh"><div class="sh-title"><span>' + S.name + '</span><small>' + (html.getAttribute('data-motion') === 'reduced' ? 'Reduced Motion' : 'Full motion') + '</small></div>' +
        (probs.length || miss.length ? '<div class="sh-problems" id="shProblems">' + probs.concat(miss.map(function (m) { return 'missing glyph: ' + m; })).join('<br>') + '</div>' : '') + fn(S) + '</div>';
      requestAnimationFrame(function () {
        main.querySelectorAll('.sh-sizes').forEach(function (row) {
          var svgs = row.querySelectorAll('svg.nx'), svg = svgs[Math.min(2, svgs.length - 1)], r = contrast(svg), out = row.querySelector('[data-cr]');
          if (out && r) { out.textContent = r.toFixed(2) + ':1'; if (r < 3) out.classList.add('low'); }
        });
      });
    }
  };
})();
