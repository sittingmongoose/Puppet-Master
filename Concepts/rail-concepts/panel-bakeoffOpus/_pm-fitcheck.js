/* PANEL BAKEOFF — fit checker
   =====================================================================
   One measurement kernel, two runners: the in-page button (no dependencies,
   works from a double-clicked file) and tools/fitcheck_headless.mjs.

   It exists because there is NO runtime corrective pass in the app. A layout
   that only fits in one theme silently clips in the other seven, and nothing
   re-measures the left panel on theme change. The only ResizeObservers in the
   app watch the activity bar, the editor tabs and the chat sidebar.

   RULES — findings (R) fail the build, warnings (W) are surfaced for a human
   to accept and log:

     R1 clipped-overflow      scrollWidth > clientWidth where overflow-x is
                              visible/hidden (an auto/scroll host is a
                              deliberate scroller and is skipped)
     R2 escapes-content-box   right/left edge outside the panel content box.
                              Skips [data-pm-portal]: portals are SUPPOSED to
                              escape, which is the whole point of the kit.
     R3 unintended-truncation nowrap WITHOUT text-overflow:ellipsis, overflowing
     W1 ellipsis-firing       same but WITH ellipsis. Not a bug. This is the
                              report that answers "which labels get cut, in
                              which themes" — and splitting it from R3 is the
                              primary false-positive control.
     R4 hit-target            interactive box under 23.5px in either axis
                              (FinalGUISpec.md:2144 section 13.5)
     R5 h-scrollbar           the panel scroller scrolls horizontally
     R6 sibling-overlap       in-flow siblings overlapping by >1px^2, scoped to
                              known containers so the O(n^2) stays bounded
     R7 collapsed-box         has text but zero width or height (flex crush)
     W2 contrast              < 4.5:1, gated to basic-* only, where section
                              13.1 mandates AA. Elsewhere it is pure noise
                              because the backdrop is translucent.
     R8 theme-height-blowup   max/min scrollHeight across the 8 themes > 1.6
                              for one (version, panel, width). A theme that
                              makes a panel 60% taller is an unintended wrap
                              cascade. This is the rule that most directly
                              targets the stated risk.

   Suppress per element with data-fit-allow="R2,R3". Every suppression is
   printed in the report, so none can hide.
   ===================================================================== */
(function (global) {
  'use strict';

  var D = global.PM_DATA;
  var lastReport = null;

  var INTERACTIVE = [
    'button', '[role="button"]', '[role="menuitem"]', '[role="option"]', 'a[href]',
    'input:not([type="hidden"])', 'select', 'textarea', '[tabindex]:not([tabindex="-1"])',
    '.pm6-sp-row', '.pm6-sp-btn', '.pm6-sp-minibtn', '.pm6-sp-iconbtn', '.pm6-search-hit',
    '.pm6-art-row', '.pm6-dm-chip', '.pm6-agent-row', '.ctx-item',
    '.pm-row', '.pm-btn', '.pm-minibtn', '.pm-iconbtn', '.pm-chip', '.pm-lens'
  ].join(',');

  var OVERLAP_HOSTS = [
    '.pm6-sp-card', '.pm6-sp-content', '.pm6-btnrow', '.pm6-kv',
    '.pm-sp-content', '.pm-card', '.pm-row', '.pm-btnrow'
  ].join(',');

  /* The exact faces the app requests (parts/01-head-prelude.part.html:55).
     Orbitron ships at weight 700 only; Cal Sans is single-weight. */
  var FONT_PROBES = [
    ['700 10px Orbitron', 'Orbitron'],
    ['600 11px Quicksand', 'Quicksand'],
    ['500 11px Inter', 'Inter'],
    ['500 11px Rajdhani', 'Rajdhani'],
    ['600 11px Nunito', 'Nunito'],
    ['400 14px "Cal Sans"', 'Cal Sans']
  ];

  /* --------------------------------------------------------------- helpers */
  function allowed(node, rule) {
    var a = node.getAttribute && node.getAttribute('data-fit-allow');
    return !!a && a.split(/[,\s]+/).indexOf(rule) >= 0;
  }
  function describe(node) {
    var t = node.tagName.toLowerCase();
    var c = (node.className && node.className.baseVal !== undefined)
      ? node.className.baseVal : (node.className || '');
    var cls = String(c).trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.');
    var txt = (node.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 44);
    return t + (cls ? '.' + cls : '') + (txt ? ' "' + txt + '"' : '');
  }
  function hasOwnText(node) {
    for (var i = 0; i < node.childNodes.length; i++) {
      var n = node.childNodes[i];
      if (n.nodeType === 3 && n.nodeValue.trim()) return true;
    }
    return false;
  }
  function parseColor(s) {
    var m = /rgba?\(([^)]+)\)/.exec(s || '');
    if (!m) return null;
    var p = m[1].split(',').map(parseFloat);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function lum(c) {
    function ch(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
  }
  function ratio(a, b) {
    var l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  function opaqueBgOf(node) {
    var n = node;
    while (n && n.nodeType === 1) {
      var c = parseColor(getComputedStyle(n).backgroundColor);
      if (c && c.a >= 0.95) return c;
      n = n.parentElement;
    }
    return null;
  }

  /* ---------------------------------------------------------------- check
     Measures ONE stage. ctx carries the combo identity for reporting. */
  function check(stage, ctx) {
    var out = [];
    var scroller = stage.querySelector('.pmk-body, .pm6-sp-content, .pm-sp-content, .panel-content');
    /* .pmk-body FIRST: the kit's scroller. Without it R5 and R8 silently
       skipped every kit-based version and R2 fell back to the slot box,
       which is 8px looser -- i.e. the two rules that most directly target
       the stated cross-theme risk were not running on the redesigns at all. */
    var slot = stage.querySelector('[data-pm-slot]');
    var view = stage.querySelector('[data-pm-panelview]');
    if (!view) return out;

    function add(rule, tier, node, detail, nums) {
      if (allowed(node, rule)) {
        out.push({ rule: rule, tier: 'suppressed', el: describe(node), detail: detail, nums: nums || null });
        return;
      }
      out.push({ rule: rule, tier: tier, el: describe(node), detail: detail, nums: nums || null });
    }

    /* Two reference boxes, not one. A panel's header and its fixed chip/filter
       strips are SIBLINGS of the scroller, not descendants: they span the full
       slot and legitimately extend past the scroller's padding box. Measuring
       them against the scroller reports the header of every panel as escaping
       by exactly the scroller's padding (8px) -- ~6 phantom findings per combo.
       Nodes inside the scroller are measured against the scroller's padding
       box; everything else against the slot's border box. */
    function refBox(node) {
      /* node !== scroller: the scroller measured against its own padding box
         always "escapes" by exactly its own padding. One phantom per combo. */
      if (scroller && node !== scroller && scroller.contains(node)) {
        var b = scroller.getBoundingClientRect(), cs2 = getComputedStyle(scroller);
        return { l: b.left + parseFloat(cs2.paddingLeft), r: b.right - parseFloat(cs2.paddingRight) };
      }
      var s = (slot || scroller).getBoundingClientRect();
      return { l: s.left, r: s.right };
    }

    function inScroller(node) {
      var a = node.parentElement;
      while (a && a !== view.parentElement) {
        var ox = getComputedStyle(a).overflowX;
        if (ox === 'auto' || ox === 'scroll') return true;
        a = a.parentElement;
      }
      return false;
    }

    var nodes = view.querySelectorAll('*');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.hasAttribute('data-pm-portal')) continue;
      /* SVG internals (circle, path, polyline...) are not CSS layout boxes.
         Their getBoundingClientRect is the geometric bbox, which routinely
         exceeds the parent <svg> viewBox and reported ~1.4k phantom R2s.
         Measure the <svg> root only. */
      if (n.ownerSVGElement) continue;
      var cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      /* An element whose ANCESTOR is display:none has its own computed display
         intact but no client rects. Without this guard every child of a hidden
         subview (Docker alone has six mutually-exclusive [data-pm6-dm-view]
         blocks) reports as a 0x0 collapsed box at x=0, which fires R7 and R2
         in bulk. Measured: this guard removes ~2.5k phantom findings. */
      if (!n.getClientRects().length) continue;
      var r = n.getBoundingClientRect();

      /* R1 — clipped overflow */
      /* An element with text-overflow:ellipsis is DELIBERATELY clipping; that
         is W1's territory, not a failure. Without this, R1 and W1 both fire on
         every ellipsized label and R1 wrongly calls intentional truncation a
         defect -- it accounted for most of the R1 volume across all versions. */
      if (n.scrollWidth > n.clientWidth + 1 &&
          (cs.overflowX === 'visible' || cs.overflowX === 'hidden') &&
          cs.textOverflow !== 'ellipsis' &&
          n.clientWidth > 0) {
        add('R1', 'fail', n, 'content is ' + (n.scrollWidth - n.clientWidth) + 'px wider than the box',
            { scrollWidth: n.scrollWidth, clientWidth: n.clientWidth });
      }

      /* R2 — escapes its reference box.
         Skipped inside a deliberate horizontal scroller: content extending
         past an overflow-x:auto/scroll ancestor is what scrolling MEANS, not a
         defect. R1 already grants the scroller itself this exemption; without
         granting it to the descendants too, every lens button scrolled out of
         a F3-445 strip reads as an escape. Same family as the data-pm-portal
         exemption -- the element is doing its job. */
      if (cs.position !== 'fixed' && r.width > 0 && !inScroller(n)) {
        var rb = refBox(n);
        if (r.right > rb.r + 0.5 || r.left < rb.l - 0.5) {
          add('R2', 'fail', n, 'escapes the content box by ' +
              Math.round(Math.max(r.right - rb.r, rb.l - r.left)) + 'px',
              { left: Math.round(r.left), right: Math.round(r.right),
                boxL: Math.round(rb.l), boxR: Math.round(rb.r) });
        }
      }

      /* R3 / W1 — truncation */
      if ((cs.whiteSpace === 'nowrap' || cs.whiteSpace === 'pre') &&
          n.scrollWidth > n.offsetWidth + 1 && n.offsetWidth > 0 && hasOwnText(n)) {
        if (cs.textOverflow === 'ellipsis') {
          add('W1', 'warn', n, 'label ellipsizes (' + (n.scrollWidth - n.offsetWidth) + 'px cut)',
              { scrollWidth: n.scrollWidth, offsetWidth: n.offsetWidth });
        } else {
          add('R3', 'fail', n, 'truncates with no ellipsis (' + (n.scrollWidth - n.offsetWidth) + 'px cut)',
              { scrollWidth: n.scrollWidth, offsetWidth: n.offsetWidth });
        }
      }

      /* R7 — collapsed box */
      if (hasOwnText(n) && (r.width < 0.5 || r.height < 0.5)) {
        add('R7', 'fail', n, 'has text but renders ' + Math.round(r.width) + 'x' + Math.round(r.height),
            { w: r.width, h: r.height });
      }

      /* W2 — contrast, basic themes only */
      if (ctx && /^basic-/.test(ctx.theme) && hasOwnText(n)) {
        var fs = parseFloat(cs.fontSize);
        if (fs && fs < 18) {
          var fg = parseColor(cs.color), bg = opaqueBgOf(n);
          if (fg && bg && fg.a >= 0.9) {
            var cr = ratio(fg, bg);
            if (cr < 4.5) {
              add('W2', 'warn', n, 'contrast ' + cr.toFixed(2) + ':1 (AA needs 4.5)', { ratio: cr });
            }
          }
        }
      }
    }

    /* R4 — hit targets */
    var hits = view.querySelectorAll(INTERACTIVE);
    for (var h = 0; h < hits.length; h++) {
      var hn = hits[h];
      var hcs = getComputedStyle(hn);
      if (hcs.display === 'none' || hcs.visibility === 'hidden') continue;
      if (!hn.getClientRects().length) continue;      /* ancestor hidden */
      var hr = hn.getBoundingClientRect();
      if (hr.width < 0.5 && hr.height < 0.5) continue;
      if (hr.height < 23.5 || hr.width < 23.5) {
        add('R4', 'fail', hn, 'hit target ' + hr.width.toFixed(1) + 'x' + hr.height.toFixed(1) +
            ' (needs 24x24)', { w: hr.width, h: hr.height });
      }
    }

    /* R5 — horizontal scrollbar in the panel */
    if (scroller && scroller.scrollWidth > scroller.clientWidth + 1) {
      add('R5', 'fail', scroller, 'the panel scroller scrolls horizontally by ' +
          (scroller.scrollWidth - scroller.clientWidth) + 'px',
          { scrollWidth: scroller.scrollWidth, clientWidth: scroller.clientWidth });
    }

    /* R6 — sibling overlap, scoped */
    var hosts = view.querySelectorAll(OVERLAP_HOSTS);
    for (var hh = 0; hh < hosts.length; hh++) {
      var kids = [];
      var cn = hosts[hh].children;
      for (var k = 0; k < cn.length; k++) {
        var kcs = getComputedStyle(cn[k]);
        if (kcs.position === 'absolute' || kcs.position === 'fixed') continue;
        if (kcs.display === 'none') continue;
        if (!cn[k].getClientRects().length) continue;  /* ancestor hidden */
        if (cn[k].hasAttribute('data-pm-portal')) continue;
        kids.push(cn[k]);
      }
      for (var a = 0; a < kids.length; a++) {
        for (var b = a + 1; b < kids.length; b++) {
          var ra = kids[a].getBoundingClientRect(), rb = kids[b].getBoundingClientRect();
          var ow = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
          var oh = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
          if (ow > 1 && oh > 1) {
            add('R6', 'fail', kids[a], 'overlaps sibling ' + describe(kids[b]) +
                ' by ' + Math.round(ow) + 'x' + Math.round(oh) + 'px', { ow: ow, oh: oh });
          }
        }
      }
    }

    return out;
  }

  /* ------------------------------------------------------------ font gate
     Without this the sweep measures fallback metrics and produces confidently
     wrong answers. Abort with ONE result rather than 1500 bogus findings. */
  function fontsReady() {
    if (!document.fonts) return Promise.resolve({ ok: true, note: 'no FontFaceSet API' });
    /* Web fonts load LAZILY: a face is not "available" until something on the
       page actually renders with it. document.fonts.ready alone therefore
       reports success while Orbitron and Rajdhani are still unfetched, and the
       sweep would silently measure fallback metrics. Force each face first,
       then assert. */
    return Promise.all(FONT_PROBES.map(function (p) {
      return document.fonts.load(p[0]).catch(function () { return []; });
    })).then(function () {
      return document.fonts.ready;
    }).then(function () {
      return new Promise(function (res) { setTimeout(res, 250); });
    }).then(function () {
      var missing = FONT_PROBES.filter(function (p) {
        try { return !document.fonts.check(p[0]); } catch (e) { return false; }
      }).map(function (p) { return p[1]; });
      /* Stylesheets matter as much as fonts. A sweep that runs while
         _pm-kit.css is still parsing measures UA button defaults (21.5px) and
         reports thousands of phantom hit-target failures. Probe a known rule
         rather than trusting the load event. */
      var probe = document.createElement('div');
      probe.className = 'pmk-btn';
      probe.style.position = 'fixed'; probe.style.left = '-9999px';
      document.body.appendChild(probe);
      var cssReady = getComputedStyle(probe).minHeight === '24px';
      probe.remove();
      if (!cssReady) missing.push('stylesheet _pm-kit.css (not applied yet)');
      return { ok: !missing.length, missing: missing, probed: FONT_PROBES.length, cssReady: cssReady };
    });
  }

  /* ------------------------------------------------------------- runMatrix */
  function runMatrix(opts) {
    opts = opts || {};
    var registry = opts.registry || (global.PM_BAKEOFF && global.PM_BAKEOFF.versions()) || [];
    var buildStage = opts.buildStage || (global.PM_BAKEOFF && global.PM_BAKEOFF.buildStage);
    var panels = D.panels.filter(function (p) { return p.redesign; });
    var themes = D.themes;
    /* 220 is adversarial and deliberately excluded from the matrix */
    var widths = D.widths.filter(function (w) { return !w.adversarial; });

    return fontsReady().then(function (f) {
      if (!f.ok) {
        lastReport = {
          aborted: true,
          abortReason: 'FONTS_MISSING: ' + f.missing.join(', '),
          note: 'Every theme metric depends on its own family. Measuring with ' +
                'fallback fonts gives confidently wrong answers, so the sweep ' +
                'aborts rather than emitting findings.',
          totals: { fail: 0, warn: 0, combos: 0 }
        };
        return lastReport;
      }

      /* Offscreen rig: real layout, no flicker, no animation. */
      var rig = document.createElement('div');
      rig.setAttribute('data-fit-rig', '');
      rig.style.cssText = 'position:fixed;left:-100000px;top:0;width:1600px;height:900px;' +
                          'overflow:hidden;pointer-events:none;';
      var kill = document.createElement('style');
      kill.textContent = '[data-fit-rig] *,[data-fit-rig] *::before,[data-fit-rig] *::after' +
                         '{animation:none !important;transition:none !important;}';
      document.head.appendChild(kill);
      document.body.appendChild(rig);

      /* WARM-UP PASS. document.fonts.check() reports a face as available once
         it is DOWNLOADED, but the rendering engine does not apply it to a
         subtree until something actually paints with it. So the first stage
         built in a given theme can lay out against fallback metrics even
         though the font gate passed -- which makes the first sweep after a
         page load disagree with the second. Paint one throwaway stage per
         theme first and discard it; every later measurement is then taken
         against applied metrics. Cost is 8 stages; the alternative is numbers
         that change when you press the button twice. */
      themes.forEach(function (t) {
        try {
          var w = buildStage({ version: registry[0].id, panel: panels[0].id, theme: t.id,
                               width: 380, density: 'comfortable', motion: 'full',
                               glassBg: 'mesh', rail: 36 });
          w.style.width = '1100px'; w.style.height = '720px';
          rig.appendChild(w);
          void w.offsetHeight;
          rig.removeChild(w);
        } catch (e) { /* a version that cannot build is caught in the real pass */ }
      });

      var combos = [], results = {}, totals = { fail: 0, warn: 0, suppressed: 0, combos: 0 };
      var heights = {};   /* key version|panel|width -> {theme: scrollHeight} */

      registry.forEach(function (v) {
        panels.forEach(function (p) {
          themes.forEach(function (t) {
            widths.forEach(function (w) {
              combos.push({ version: v.id, panel: p.id, theme: t.id, width: w.px });
            });
          });
        });
      });

      combos.forEach(function (c) {
        var stage;
        try {
          stage = buildStage({
            version: c.version, panel: c.panel, theme: c.theme, width: c.width,
            density: 'comfortable', motion: 'full', glassBg: 'mesh', rail: 36
          });
        } catch (e) {
          results[key(c)] = [{ rule: 'BUILD', tier: 'fail', el: '-', detail: String(e && e.message || e) }];
          totals.fail++; totals.combos++;
          return;
        }
        stage.style.width = '1100px';
        stage.style.height = '720px';
        rig.appendChild(stage);
        void stage.offsetHeight;                       /* force layout */

        var found = check(stage, c);
        results[key(c)] = found;
        totals.combos++;
        found.forEach(function (r) {
          if (r.tier === 'fail') totals.fail++;
          else if (r.tier === 'warn') totals.warn++;
          else if (r.tier === 'suppressed') totals.suppressed++;
        });

        var sc = stage.querySelector('.pmk-body, .pm6-sp-content, .pm-sp-content, .panel-content');
        var hk = c.version + '|' + c.panel + '|' + c.width;
        (heights[hk] || (heights[hk] = {}))[c.theme] = sc ? sc.scrollHeight : 0;

        rig.removeChild(stage);
      });

      /* R8 — cross-theme height blowup, computed after the sweep */
      Object.keys(heights).forEach(function (hk) {
        var vals = Object.keys(heights[hk]).map(function (t) { return heights[hk][t]; })
                     .filter(function (v) { return v > 0; });
        if (vals.length < 2) return;
        var mx = Math.max.apply(null, vals), mn = Math.min.apply(null, vals);
        if (mn > 0 && mx / mn > 1.6) {
          var parts = hk.split('|');
          var worst = Object.keys(heights[hk]).sort(function (a, b) {
            return heights[hk][b] - heights[hk][a];
          });
          var c8 = { version: parts[0], panel: parts[1], theme: worst[0], width: parseInt(parts[2], 10) };
          (results[key(c8)] || (results[key(c8)] = [])).push({
            rule: 'R8', tier: 'fail', el: 'panel scroller',
            detail: 'panel is ' + (mx / mn).toFixed(2) + 'x taller in ' + worst[0] +
                    ' than in ' + worst[worst.length - 1] + ' (likely an unintended wrap cascade)',
            nums: { max: mx, min: mn, ratio: mx / mn }
          });
          totals.fail++;
        }
      });

      rig.remove();
      kill.remove();

      lastReport = {
        aborted: false,
        generated: 'in-page',
        axes: {
          versions: registry.map(function (v) { return v.id; }),
          panels: panels.map(function (p) { return p.id; }),
          themes: themes.map(function (t) { return t.id; }),
          widths: widths.map(function (w) { return w.px; })
        },
        totals: totals,
        results: results
      };
      return lastReport;
    });
  }

  function key(c) { return c.version + '|' + c.panel + '|' + c.theme + '|' + c.width; }

  function tierOf(list) {
    if (!list || !list.length) return 'pass';
    for (var i = 0; i < list.length; i++) if (list[i].tier === 'fail') return 'fail';
    for (var j = 0; j < list.length; j++) if (list[j].tier === 'warn') return 'warn';
    return 'pass';
  }

  /* ---------------------------------------------------------- matrix table
     Rows = version x panel, columns = theme x width. Clicking a cell jumps the
     live stage to that exact combo with the offenders outlined — without
     cell-to-live-repro the report is 1500 rows nobody reads. */
  function matrixTable(rep, onPick) {
    var wrap = document.createElement('div');
    if (rep.aborted) {
      wrap.className = 'hx-empty';
      wrap.textContent = rep.abortReason + ' — ' + rep.note;
      return wrap;
    }
    var t = document.createElement('table');
    t.className = 'hx-matrix';
    var head = '<tr><th></th><th></th>';
    rep.axes.themes.forEach(function (th) {
      head += '<th class="rot" colspan="' + rep.axes.widths.length + '">' + th + '</th>';
    });
    head += '</tr><tr><th>ver</th><th>panel</th>';
    rep.axes.themes.forEach(function () {
      rep.axes.widths.forEach(function (w) { head += '<th style="font-size:9px">' + w + '</th>'; });
    });
    head += '</tr>';

    var body = '';
    rep.axes.versions.forEach(function (v) {
      rep.axes.panels.forEach(function (p) {
        body += '<tr><th>' + v + '</th><th>' + p + '</th>';
        rep.axes.themes.forEach(function (th) {
          rep.axes.widths.forEach(function (w) {
            var c = { version: v, panel: p, theme: th, width: w };
            var list = rep.results[key(c)];
            var tier = tierOf(list);
            var n = list ? list.filter(function (x) { return x.tier !== 'suppressed'; }).length : 0;
            body += '<td><span class="hx-cell" data-t="' + tier + '" data-k="' + key(c) +
                    '" title="' + v + ' / ' + p + ' / ' + th + ' / ' + w + 'px — ' +
                    (n || 'clean') + (n ? ' issue(s)' : '') + '"></span></td>';
          });
        });
        body += '</tr>';
      });
    });
    t.innerHTML = head + body;
    t.addEventListener('click', function (e) {
      var cell = e.target.closest('.hx-cell');
      if (!cell || !onPick) return;
      var p = cell.dataset.k.split('|');
      onPick({ version: p[0], panel: p[1], theme: p[2], width: parseInt(p[3], 10) });
    });
    wrap.appendChild(t);

    var legend = document.createElement('div');
    legend.className = 'hx-note';
    legend.innerHTML = 'Rows: version x panel. Columns: theme x width. ' +
      '<b>Click any cell</b> to jump the live stage to that combination with the ' +
      'offending elements outlined. Green = clean, amber = warnings only (usually ' +
      '<code>W1</code>, a label ellipsizing — not a bug, but you should know which ' +
      'labels get cut in which theme), red = at least one R-tier finding. ' +
      '<b>v0-baseline is expected to be red</b>: it keeps the real ' +
      '<code>R4</code> hit-target defect in all 8 themes, which is how the checker ' +
      'proves it detects a known-true failure.';
    wrap.appendChild(legend);
    return wrap;
  }

  /* --------------------------------------------------------------- highlight */
  function highlight(stage, combo) {
    Array.prototype.forEach.call(document.querySelectorAll('.hx-fit-hot,.hx-fit-warn'), function (n) {
      n.classList.remove('hx-fit-hot', 'hx-fit-warn');
    });
    var found = check(stage, combo);
    var view = stage.querySelector('[data-pm-panelview]');
    if (!view) return found;
    /* re-walk and mark: cheaper and more robust than storing node refs from a
       throwaway offscreen rig */
    var marks = {};
    found.forEach(function (f) { if (f.tier !== 'suppressed') marks[f.el] = f.tier; });
    Array.prototype.forEach.call(view.querySelectorAll('*'), function (n) {
      var d = describe(n);
      if (marks[d]) n.classList.add(marks[d] === 'fail' ? 'hx-fit-hot' : 'hx-fit-warn');
    });
    return found;
  }

  global.PM_FIT = {
    check: check,
    runMatrix: runMatrix,
    lastReport: function () { return lastReport; },
    matrixTable: matrixTable,
    highlight: highlight,
    fontsReady: fontsReady,
    RULES: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'W1', 'W2']
  };
})(window);
