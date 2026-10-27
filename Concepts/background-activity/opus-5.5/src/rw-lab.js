/* rw-lab.js — the concept's control panel (Background activity concept, Opus 5.5). It lives only on this concept's
   pages, never in PMConcept7: it switches the look, the scenario and the layout choices so they can be compared. */
(function () {
  'use strict';
  var RW = window.RW;
  if (!RW || document.getElementById('rw-lab')) return;
  var LOOKS = [['basic', 'Basic'], ['friendly', 'Friendly'], ['retro', 'Retro'], ['glass', 'Glass'], ['nier', 'NieR']];
  var GROUPS = [
    ['scenario', 'Scenario', [['busy', 'Busy'], ['working', 'No asks'], ['quiet', 'Quiet'], ['many', 'Many'], ['stale', 'Stale feed'], ['restart', 'After restart']]],
    ['threadVariant', 'Thread view', [['state', 'By state'], ['owner', 'By owner'], ['list', 'List + output']]],
    ['barVariant', 'Status item', [['words', 'Words'], ['marks', 'Marks'], ['single', 'One count']]],
    ['popVariant', 'Pop-out', [['surface', 'By surface'], ['triage', 'Needs you first'], ['table', 'Task manager']]],
    ['icon', 'Domain icon', [['pulse', 'Pulse'], ['terminal', 'Terminal'], ['gauge', 'Gauge'], ['layers', 'Layers']]]
  ];
  function setLook(fam, mode) {
    var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
    /* NieR goes off before the theme changes, or PM7 says the theme waits for NieR Mode to be turned off. */
    try { if (window.PM_NIER && fam !== 'nier') window.PM_NIER.set(false); } catch (e) {}
    try { window.PM12_KIMI.setSettingFromHost('general.visual.theme', (fam === 'nier' ? 'Basic' : cap(fam)) + ' ' + cap(mode)); } catch (e) {}
    try { if (window.PM_NIER && fam === 'nier') window.PM_NIER.set(true); } catch (e) {}
    /* Light or dark inside NieR still changes the saved theme under it; that note is for a person, not this lab. */
    var tries = 0, t = setInterval(function () {
      var ok = document.querySelector('.o55-nier-note [data-o55-nier-note="close"]');
      if (ok) ok.click();
      if (++tries > 30) clearInterval(t);
    }, 100);
    setTimeout(sync, 900);
  }
  function current() {
    var h = document.documentElement, t = (h.getAttribute('data-theme') || 'basic-dark').split('-');
    return { fam: h.getAttribute('data-o55-nier') === 'on' ? 'nier' : t[0], mode: t[1] || 'dark', reduced: h.getAttribute('data-motion') === 'reduced' };
  }
  var root = document.createElement('aside');
  root.id = 'rw-lab'; root.setAttribute('aria-label', 'Background activity lab'); root.setAttribute('data-pm-hover-exempt', 'true');
  var h = '<header><b>Background activity lab</b><span class="lab-model" data-concept-model="Opus 5.5">Opus 5.5</span><button type="button" data-lab="fold" aria-label="Fold">&#8211;</button></header><div class="lab-body">';
  h += '<div class="lab-row">' + LOOKS.map(function (l) { return '<button type="button" data-fam="' + l[0] + '">' + l[1] + '</button>'; }).join('') + '</div>';
  h += '<div class="lab-row"><button type="button" data-mode="dark">Dark</button><button type="button" data-mode="light">Light</button><label><input type="checkbox" data-lab="reduced"> Reduced Motion</label></div>';
  GROUPS.forEach(function (g) {
    h += '<div class="lab-row"><span>' + g[1] + '</span>' + g[2].map(function (o) { return '<button type="button" data-k="' + g[0] + '" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>';
  });
  h += '<div class="lab-row"><label><input type="checkbox" data-lab="always"> Show Running even when nothing has run</label></div>';
  h += '<div class="lab-row"><button type="button" data-lab="thread">Open thread view</button><button type="button" data-lab="pop">Open pop-out</button><button type="button" data-lab="quit">Quit…</button></div></div>';
  root.innerHTML = h;
  document.body.appendChild(root);
  function sync() {
    var c = current();
    root.querySelectorAll('[data-fam]').forEach(function (b) { b.toggleAttribute('data-on', b.getAttribute('data-fam') === c.fam); });
    root.querySelectorAll('[data-mode]').forEach(function (b) { b.toggleAttribute('data-on', b.getAttribute('data-mode') === c.mode); });
    root.querySelectorAll('[data-k]').forEach(function (b) { b.toggleAttribute('data-on', RW.state[b.getAttribute('data-k')] === b.getAttribute('data-v')); });
    root.querySelector('[data-lab="reduced"]').checked = c.reduced;
    root.querySelector('[data-lab="always"]').checked = !!RW.state.alwaysShow;
  }
  root.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    e.stopPropagation();
    if (b.hasAttribute('data-fam')) setLook(b.getAttribute('data-fam'), current().mode);
    else if (b.hasAttribute('data-mode')) setLook(current().fam, b.getAttribute('data-mode'));
    else if (b.hasAttribute('data-k')) {
      var k = b.getAttribute('data-k'), v = b.getAttribute('data-v');
      if (k === 'scenario') RW.load(v); else { RW.state[k] = v; RW.emit(k); }
      if (k === 'popVariant' && window.RW_PLATFORM) { window.RW_PLATFORM.ui.tab = null; if (!window.RW_PLATFORM.ui.open) window.RW_PLATFORM.open(); }
      if (k === 'threadVariant' && window.RW_THREAD && !window.RW_THREAD.ui.open) window.RW_THREAD.open();
      sync();
    }
    else if (b.getAttribute('data-lab') === 'thread') window.RW_THREAD && window.RW_THREAD.open();
    else if (b.getAttribute('data-lab') === 'pop') window.RW_PLATFORM && window.RW_PLATFORM.open();
    else if (b.getAttribute('data-lab') === 'quit') window.RW_PLATFORM && window.RW_PLATFORM.quit();
    else if (b.getAttribute('data-lab') === 'fold') root.toggleAttribute('data-folded');
  });
  root.addEventListener('change', function (e) {
    var k = e.target.getAttribute('data-lab');
    if (k === 'reduced') { if (e.target.checked) document.documentElement.setAttribute('data-motion', 'reduced'); else document.documentElement.removeAttribute('data-motion'); }
    if (k === 'always') { RW.state.alwaysShow = e.target.checked; RW.emit('always'); }
  });
  setTimeout(sync, 600);
  window.RW_LAB = { setLook: setLook, sync: sync };
})();
