/* Background activity concept (Opus 5.5): the host page frames the published PMConcept7 and injects this concept's
   layer (rw.css and the rw-*.js files) when it loads, the way Concepts/notifications/opus-5.5 does. PMConcept7 itself
   is never edited. html[data-rw-open] on the host page says which surface to open first: "thread" (the chat's Processes
   domain) or "platform" (the status bar's panel). The Concept Hub's look and Reduced Motion go to the framed page. */
(async function () {
  'use strict';
  var frame = document.getElementById('rw-frame'), msg = document.getElementById('rw-msg');
  var FILES = ['rw.css', 'rw-data.js', 'rw-glyphs.js', 'rw-thread.js', 'rw-platform.js', 'rw-lab.js'];
  var parts;
  try {
    parts = await Promise.all(FILES.map(function (f) {
      return fetch('src/' + f, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(f); return r.text(); });
    }));
  } catch (e) { msg.textContent = 'Open this page through the Concept Hub (http) so it can load its layer.'; return; }
  var open = document.documentElement.getAttribute('data-rw-open') || '';
  function inject() {
    var d = frame.contentDocument;
    if (!d || !d.body || d.readyState === 'loading' || !/PMConcept7\.html/.test(d.URL) || d.getElementById('rw-css')) return;
    var w = frame.contentWindow;
    if (!w.PMG || !d.getElementById('pm7GlobalStatusBar') || !d.querySelector('.pm56-activity-bar')) return; /* wait for boot */
    var st = d.createElement('style'); st.id = 'rw-css'; st.textContent = parts[0]; d.head.appendChild(st);
    var sc = d.createElement('script'); sc.id = 'rw-js';
    sc.textContent = 'window.RW_OPEN=' + JSON.stringify(open) + ';\n' + parts.slice(1).join('\n;\n');
    d.body.appendChild(sc);
  }
  frame.addEventListener('load', inject);
  setInterval(inject, 300);
})();
/* Concept Hub bridge: the Hub's look and Reduced Motion go to the framed page. */
(function () {
  'use strict';
  var frame = document.getElementById('rw-frame'), pending = null;
  function apply(state) {
    var w = frame.contentWindow, d = frame.contentDocument;
    if (!w || !d || !w.PM12_KIMI) { pending = state; return; }
    if (state.theme) {
      var name = state.theme.split('-').map(function (s) { return s.charAt(0).toUpperCase() + s.slice(1); }).join(' ');
      try { w.PM12_KIMI.setSettingFromHost('general.visual.theme', name); } catch (e) { d.documentElement.setAttribute('data-theme', state.theme); }
    }
    if (state.reducedMotion) d.documentElement.setAttribute('data-motion', 'reduced');
    else if (d.documentElement.getAttribute('data-motion') === 'reduced') d.documentElement.removeAttribute('data-motion');
  }
  window.addEventListener('message', function (event) {
    var m = event.data;
    if (!m || m.source !== 'pm-concept-hub' || m.type !== 'pm-concept-state') return;
    apply(m.state || {});
  });
  setInterval(function () { if (pending) { var s = pending; pending = null; apply(s); } }, 500);
  if (window.parent !== window) window.parent.postMessage({ source: 'pm-concept', type: 'pm-concept-ready', version: 1, capabilities: { theme: true, reducedMotion: true, testWidth: false } }, '*');
})();
