
    /* pm6 boot: apply persisted theme prefs BEFORE first CSS paint (defaults: friendly + dark / mesh).
       Theme model: pm.themeFamily (friendly|glass|retro|basic) x pm.themeMode (light|dark|auto);
       auto follows prefers-color-scheme. The legacy pm.theme slug migrates on first read and is
       kept in sync (resolved slug) for older readers.
       Also stamps a critical solid canvas color + color-scheme so the 2.5MB stylesheet
       (and render-blocking webfonts) cannot flash the browser's default white twice. */
    (function () {
      'use strict';
      var d = document.documentElement;
      var BGS = {
        'friendly-dark': '#211E26',
        'friendly-light': '#FBF7F3',
        'retro-dark': '#10120e',
        'retro-light': '#F5F0E8',
        'basic-dark': '#121212',
        'basic-light': '#EAECEF',
        'glass-dark': '#04060d',
        'glass-light': '#eef1f6'
      };
      try {
        var fams = ['friendly', 'glass', 'retro', 'basic'];
        var tmodes = ['light', 'dark', 'auto'];
        var fam = 'basic';
        var tmode = 'dark';
        var leg = null;
        /* O55 first paint (tools/build.py): the look stored for the Project the page opens on, read and never
           written (T44: project-scoped Settings owns persistence; nothing here stores a theme). A new install's
           onboarding (?o55=fresh, or no onboarding record yet) always starts in Basic Dark. */
        var o55b = { project: '', install: false, nier: false, parts: '', glassBg: '', glassN: NaN, reduced: false, boot: false };
        try {
          var o55sw = new URLSearchParams(location.search).get('o55') || '', o55rec = null;
          try { o55rec = JSON.parse(window.localStorage.getItem("pm.o55.onboarding.v1") || 'null'); } catch (e3) { o55rec = null; }
          o55b.install = o55sw === 'fresh' || (!o55rec && o55sw !== 'off' && o55sw !== 'tour' && o55sw.indexOf('screen=') !== 0);
          var o55pid = typeof window.PM_ACTIVE_PROJECT_ID === 'string' ? window.PM_ACTIVE_PROJECT_ID.trim() : "tastebook";
          o55b.project = o55pid && !/^(none|no-project)$/i.test(o55pid) ? o55pid : '';
          var o55p = o55b.project && !o55b.install ? JSON.parse(window.localStorage.getItem("pm7:settings:tome-tabs:v1:" + encodeURIComponent(o55b.project)) || 'null') : null;
          var o55s = o55p && o55p.settings && typeof o55p.settings === 'object' ? o55p.settings : null;
          if (o55s) {
            var o55sel = String(o55s['general.visual.theme'] || 'Basic Dark').trim().toLowerCase().replace(/\s+/g, '-').split('-');
            fam = fams.indexOf(o55sel[0]) === -1 ? 'basic' : o55sel[0];
            tmode = String(o55s['general.visual.theme-mode'] || o55sel[1] || 'dark').toLowerCase();
            if (tmodes.indexOf(tmode) === -1) { tmode = o55sel[1] === 'light' ? 'light' : 'dark'; }
            var o55on = o55s['general.visual.nier-mode'], o55pl = o55s['general.visual.nier-parts'];
            if (o55on === true || o55on === 'true' || o55on === 'On') {
              var o55all = [["Square hairlines", "square"], ["Menu cursor", "cursor"], ["YoRHa headers", "headers"], ["Parchment ground", "ground"], ["Target brackets", "brackets"], ["Diamond loaders", "diamonds"], ["Reboot moment", "reboot"], ["Slice open", "slice"], ["Text decode", "decode"], ["Page wipe", "wipe"], ["Drifting particles", "particles"], ["Scan sweep", "sweep"], ["Alert glitch", "glitch"], ["Menu sounds", "sounds"], ["Pod voice", "voice"], ["Pod companion", "pod"], ["Square pointer", "pointer"], ["Boot sequence", "boot"], ["Unit readouts", "readouts"], ["Block progress", "blocks"], ["Ink charts", "charts"], ["Map ticks", "ticks"], ["Machine glyphs", "glyphs"], ["Intel tooltips", "intel"], ["Square icon strokes", "icons"], ["Pod 042 in Chat", "pod042"], ["Quest banners", "quests"], ["Ink empty states", "empty"], ["Save signal", "save"]], o55k = [];
              for (var o55i = 0; o55i < o55all.length; o55i++) { if (!Array.isArray(o55pl) || o55pl.indexOf(o55all[o55i][0]) !== -1) { o55k.push(o55all[o55i][1]); } }
              o55b.nier = true; o55b.parts = o55k.join(' '); fam = 'basic';
            }
            var o55g = String(o55s['general.visual.glass-background-mode'] || 'Mesh').toLowerCase();
            o55b.glassBg = ['mesh', 'depth', 'minimal'].indexOf(o55g) === -1 ? 'mesh' : o55g;
            var o55a = Number(o55s['general.visual.glass-transparency'] == null ? 0.55 : o55s['general.visual.glass-transparency']);
            if (o55a > 1) { o55a /= 100; }
            o55b.glassN = isFinite(o55a) ? o55a : 0.55;
            o55b.reduced = !!o55s['general.visual.reduce-animations'];
          }
        } catch (eo55) { fam = 'basic'; tmode = 'dark'; o55b.nier = false; o55b.parts = ''; o55b.glassBg = ''; o55b.glassN = NaN; o55b.reduced = false; }
        window.PM_O55_BOOT = o55b;
        if (fams.indexOf(fam) === -1) { fam = leg ? leg[1] : 'friendly'; }
        if (tmodes.indexOf(tmode) === -1) { tmode = leg ? leg[2] : 'dark'; }
        var scheme = tmode === 'light' ? 'light' : 'dark';
        if (tmode === 'auto') {
          try { scheme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'; }
          catch (e2) { scheme = 'dark'; }
        }
        var t = fam + '-' + scheme;
        /* T44: project-scoped Settings owns persistence; no global theme write. */
        if (fam === 'glass') { d.setAttribute('data-lg', 'on'); d.setAttribute('data-lg-wall', 'ribbons'); }
        d.setAttribute('data-theme', t);
        if (o55b.nier) { d.setAttribute('data-o55-nier', 'on'); d.setAttribute('data-o55-nier-parts', o55b.parts); }
        if (o55b.reduced) { d.setAttribute('data-motion', 'reduced'); }
        var o55still = o55b.reduced; try { o55still = o55still || window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e4) {}
        o55b.boot = o55b.nier && (' ' + o55b.parts + ' ').indexOf(' boot ') !== -1 && !o55still && document.visibilityState !== 'hidden';
        if (o55b.boot) {
          d.setAttribute('data-o55-boot-wait', '');
          window.addEventListener('load', function () { setTimeout(function () { d.removeAttribute('data-o55-boot-wait'); }, 400); });
        }
        var modes = ['mesh', 'depth', 'minimal'];
        var g = o55b.glassBg || 'mesh';
        if (modes.indexOf(g) === -1) { g = 'mesh'; }
        d.setAttribute('data-glass-bg', g);
        var a = NaN;
        if (o55b.glassN === o55b.glassN) { d.style.setProperty('--glass-alpha', String(Math.max(/-light$/.test(t) ? 0.45 : 0.35, Math.min(1, o55b.glassN)))); }
        if (!isNaN(a)) {
          var light = /-light$/.test(t);
          var lo = light ? 0.45 : 0.35;
          var hi = light ? 0.88 : 0.85;
          d.style.setProperty('--glass-alpha', String(Math.min(hi, Math.max(lo, a))));
        }
        var bg = (o55b.nier && {"light": "#ccc8b1", "dark": "#2f2d26"}[scheme]) || BGS[t] || '#211E26';
        var isDark = /-dark$/.test(t);
        d.style.background = bg;
        d.style.colorScheme = isDark ? 'dark' : 'light';
        var s = document.createElement('style');
        s.id = 'pm-boot-paint';
        s.textContent = 'html,body{background:' + bg + ';color-scheme:' + (isDark ? 'dark' : 'light') + ';}'
          + 'html[data-o55-boot-wait] body::after{content:"";position:fixed;inset:0;z-index:2147483399;pointer-events:none;background:' + bg + ';}';
        (document.head || d).appendChild(s);
      } catch (e) { /* storage unavailable - keep markup defaults */ }
    })();
  