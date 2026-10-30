  /* W1 (F3-660, DR-076, DL-235): Pip, Puppet Master's mark, beside the look's wordmark. Drawn here, just after the title
     bar, so the bar's first paint has it (the kit, PMLogo, is a head module). Static, 24 px, the painted look's own Pip
     (NieR keeps the plain band, X3). It never animates, carries no state and takes no click: the notification stack stays
     the bar's only notification affordance (F3-460). Redrawn only when the look changes. Its 24 px slot is sized in CSS
     (style-002.css), so drawing it never moves the project box or the tabs. A squeezed bar shows the mark only
     (pm6-js-panels.js applyDensity). The page's favicon is the app icon (A1: one fixed Basic Dark tile, static). */
  (function () {
    var L = window.PMLogo, host = document.querySelector('.title-bar .app-name .pm-brand-mark');
    if (!L || !host) return;
    function draw() {
      var k = L.look();
      if (host.getAttribute('data-look') === k && host.firstChild) return;
      host.setAttribute('data-look', k);
      host.innerHTML = L.mark({ look: k, px: 24, decorative: true });
    }
    draw();
    L.onLook(draw);
    /* the static link in shell.html's head is this same tile written out; the kit stays its source */
    try {
      var icon = document.querySelector('link[rel~="icon"]'), href = L.favicon(32);
      if (!icon) { icon = document.createElement('link'); icon.rel = 'icon'; icon.type = 'image/svg+xml'; document.head.appendChild(icon); }
      if (icon.getAttribute('href') !== href) icon.setAttribute('href', href);
    } catch (e) { /* a page without a favicon still works */ }
  })();
