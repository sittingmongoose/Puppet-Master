/* The concept page's host (index.html, liquid-glass.html): frames the published PMConcept7, injects the Notification
   lab, and with html[data-pmn-lg="1"] the Liquid Glass overlay; bridges the Concept Hub's look and Reduced Motion. */
(async function () {
  var frame = document.getElementById('pmn-frame'), msg = document.getElementById('msg');
  var withLg = document.documentElement.getAttribute('data-pmn-lg') === '1', parts;
  try {
    var asks = [fetch('src/lab.css').then(function (r) { return r.text(); }), fetch('src/lab.js').then(function (r) { return r.text(); })];
    if (withLg) asks.push(fetch('../../liquid-glass/opus-5.5/src/glass.css').then(function (r) { return r.text(); }), fetch('../../liquid-glass/opus-5.5/src/glass.js').then(function (r) { return r.text(); }));
    parts = await Promise.all(asks);
  } catch (e) { msg.textContent = 'Open this page through the Concept Hub (http), or open the share folder copy built by tools/build_preview.py.'; return; }
  function inject() {
    var d = frame.contentDocument;
    if (!d || !d.body || d.readyState === 'loading' || !/PMConcept7\.html/.test(d.URL) || d.getElementById('pmn-lab-css')) return;
    if (withLg) {
      var vars = '';
      ['ribbons', 'prism', 'orbs'].forEach(function (w) { ['dark', 'light'].forEach(function (m) { vars += '--lg-wall-' + w + '-' + m + ': url(' + new URL('../../liquid-glass/opus-5.5/src/walls/' + w + '-' + m + '.webp', location.href).href + ');\n'; }); });
      var gs = d.createElement('style'); gs.id = 'lg-css'; gs.textContent = 'html {\n' + vars + '\n}\n' + parts[2]; d.head.appendChild(gs);
      var gj = d.createElement('script'); gj.id = 'lg-js'; gj.textContent = parts[3]; d.body.appendChild(gj);
    }
    var st = d.createElement('style'); st.id = 'pmn-lab-css'; st.textContent = parts[0]; d.head.appendChild(st);
    var sc = d.createElement('script'); sc.id = 'pmn-lab-js'; sc.textContent = parts[1]; d.body.appendChild(sc);
  }
  frame.addEventListener('load', inject);
  setInterval(inject, 300);
})();
/* Concept Hub bridge: the Hub's look and Reduced Motion go to the framed page */
(function () {
  var frame = document.getElementById('pmn-frame'), pending = null;
  function apply(state) {
    var w = frame.contentWindow, d = frame.contentDocument;
    if (!w || !d || !w.PM12_KIMI) { pending = state; return; }
    if (state.theme) {
      var name = state.theme.split('-').map(function (s) { return s.charAt(0).toUpperCase() + s.slice(1); }).join(' ');
      try { w.PM12_KIMI.setSettingFromHost('general.visual.theme', name); } catch (e) { d.documentElement.setAttribute('data-theme', state.theme); }
    }
    if (state.reducedMotion) d.documentElement.setAttribute('data-motion', 'reduced'); else if (d.documentElement.getAttribute('data-motion') === 'reduced') d.documentElement.removeAttribute('data-motion');
  }
  window.addEventListener('message', function (event) {
    var m = event.data;
    if (!m || m.source !== 'pm-concept-hub' || m.type !== 'pm-concept-state') return;
    apply(m.state || {});
  });
  setInterval(function () { if (pending) { var s = pending; pending = null; apply(s); } }, 500);
  if (window.parent !== window) window.parent.postMessage({ source: 'pm-concept', type: 'pm-concept-ready', version: 1, capabilities: { theme: true, reducedMotion: true, testWidth: false } }, '*');
})();
