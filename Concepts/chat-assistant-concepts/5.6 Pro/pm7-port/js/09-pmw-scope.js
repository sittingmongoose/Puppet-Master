/* pm7-port/js/09-pmw-scope.js (looks lane, lead ruling 2026-10-22): every .pm56-host sits under an element that
   carries Home's .pmw-scope class and no data-theme, so Home's --pmw-* tokens (inks pulled to 4.5:1, grounds, corners,
   Glass's reading grounds, NieR's repaint) are computed from PMConcept7's own values and reach the chat; css/10-14
   alias the chat's tokens to them. The column frame takes the class; the overlay root moves into a display:contents
   wrapper (no box, no stacking context, still the last thing in <body>). Tab bodies already sit in #pm-home-centre. */
(function () {
  var doc = document;
  function scope() {
    var fr = doc.getElementById('pmw-chat56');
    if (fr && !fr.classList.contains('pmw-scope')) fr.classList.add('pmw-scope');
    var ov = doc.getElementById('pmOverlayRoot');
    if (!ov || !doc.body || (ov.parentElement && ov.parentElement.classList.contains('pm56-overlay-scope'))) return;
    var w = doc.querySelector('.pm56-overlay-scope');
    if (!w) { w = doc.createElement('div'); w.className = 'pmw-scope pm56-overlay-scope'; w.style.display = 'contents'; }
    if (w.parentNode !== doc.body) doc.body.appendChild(w);
    w.appendChild(ov);
  }
  scope();
  /* 00-host.js puts the overlay back on <body> if the page re-renders #chatPanel: wrap it again */
  if (typeof MutationObserver === 'function' && doc.body) new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) for (var j = 0; j < list[i].addedNodes.length; j++) {
      var n = list[i].addedNodes[j];
      if (n.id === 'pmOverlayRoot') { scope(); return; }
    }
  }).observe(doc.body, { childList: true });
})();
