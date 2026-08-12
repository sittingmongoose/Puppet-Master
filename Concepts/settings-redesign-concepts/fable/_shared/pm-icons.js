/* fable Settings Bakeoff - shared icon set.
   window.PMIcons: get(name) -> raw SVG string, hydrate(root) fills every
   i[data-ico] descendant. 24-viewBox, stroke-current, stroke-width 1.8.
   Inline SVG only (project rule: no emoji glyphs anywhere). */
(function () {
  'use strict';

  var SVG_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var SVG_CLOSE = '</svg>';

  var ICONS = {
    rail: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
    chat: '<path d="M21 11.7a8.3 8.3 0 0 1-12 7.4L4 20l.9-5A8.3 8.3 0 1 1 21 11.7z"/>',
    motion: '<circle cx="15.5" cy="12" r="5"/><path d="M3 8.5h6M3 12h4.5M3 15.5h6"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2.1-.8 2.1-1.9 0-1.2-1-1.7-1-2.7 0-1 .8-1.6 2-1.6h1.9a4 4 0 0 0 4-4C21 6.4 16.9 3 12 3z"/><circle cx="7.6" cy="11.4" r="1"/><circle cx="10.2" cy="7.6" r="1"/><circle cx="14.8" cy="7.2" r="1"/>',
    more: '<circle cx="5" cy="12" r="1.1"/><circle cx="12" cy="12" r="1.1"/><circle cx="19" cy="12" r="1.1"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.6-4.6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>',
    brain: '<path d="M11.5 4.5A2.5 2.5 0 0 0 7 6.4 3.6 3.6 0 0 0 4.5 12 3.6 3.6 0 0 0 7 17.6a2.6 2.6 0 0 0 4.5 1.6V4.5z"/><path d="M12.5 4.5A2.5 2.5 0 0 1 17 6.4 3.6 3.6 0 0 1 19.5 12 3.6 3.6 0 0 1 17 17.6a2.6 2.6 0 0 1-4.5 1.6V4.5z"/>',
    shield: '<path d="M12 3l7 2.8v5.4c0 4.7-3.3 7.7-7 9.8-3.7-2.1-7-5.1-7-9.8V5.8L12 3z"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9.5l3 2.8-3 2.8M12.5 15.5H17"/>',
    puzzle: '<path d="M4 8.5h4V6a2 2 0 0 1 4 0v2.5h4v4H18a2 2 0 0 1 0 4h-2V20h-4v-3.2a2 2 0 0 0-4 0V20H4V8.5z"/>',
    clipboard: '<rect x="5" y="5" width="14" height="16" rx="2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>',
    branch: '<circle cx="6" cy="6" r="2.2"/><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="8" r="2.2"/><path d="M6 8.2v7.6"/><path d="M18 10.2a7.6 7.6 0 0 1-7.5 6"/>',
    film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7.5 4v16M16.5 4v16M3 9h4.5M3 15h4.5M16.5 9H21M16.5 15H21"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><ellipse cx="12" cy="12" rx="4" ry="9"/>',
    masks: '<path d="M5 4.5h14V11a7 7 0 0 1-14 0V4.5z"/><path d="M9 9h.01M15 9h.01"/><path d="M9 13.5a4.2 4.2 0 0 0 6 0"/>',
    toolbox: '<rect x="3" y="9" width="18" height="11" rx="2"/><path d="M8 9V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13.5h7M14 13.5h7M10 12v3h4v-3"/>',
    plug: '<path d="M9 3v5M15 3v5"/><path d="M6.5 8h11v3a5.5 5.5 0 0 1-11 0V8z"/><path d="M12 16.5V21"/>',
    bolt: '<path d="M13 2.5L5 13.2h5.5L10 21.5l8-10.7h-5.5l.5-8.3z"/>',
    warning: '<path d="M12 3.5l9.5 16.5h-19L12 3.5z"/><path d="M12 10v4.2M12 17.3h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6h.01"/>',
    check: '<path d="M4.5 12.5l5 5L19.5 6.5"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="M8 12.4l2.7 2.7 5.3-6"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 3.8v4.7h-4.7"/>',
    star: '<path d="M12 3.2l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9-5.3-2.9-5.3 2.9 1.1-5.9-4.3-4.1 5.9-.8L12 3.2z"/>',
    starFill: '<path fill="currentColor" stroke-width="1" d="M12 3.2l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9-5.3-2.9-5.3 2.9 1.1-5.9-4.3-4.1 5.9-.8L12 3.2z"/>',
    pin: '<path d="M9.5 3h5l-.8 6 3.3 3.5V14H7v-1.5L10.3 9l-.8-6z"/><path d="M12 14v7"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
    unlock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 7.8-1.3"/>',
    folder: '<path d="M3 6a2 2 0 0 1 2-2h4.2L11 6.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"/>',
    eye: '<path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/>',
    eyeOff: '<path d="M4 4l16 16"/><path d="M10.6 5.2A9.8 9.8 0 0 1 12 5.1c6 0 9.5 6.9 9.5 6.9a17 17 0 0 1-2.9 3.8M6.7 6.7C4 8.5 2.5 12 2.5 12S6 18.9 12 18.9c1.5 0 2.9-.4 4.1-1"/><path d="M10.2 10.3a2.5 2.5 0 0 0 3.5 3.5"/>',
    play: '<path d="M7.5 4.5l12 7.5-12 7.5v-15z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    chevR: '<path d="M9 5.5l6.5 6.5L9 18.5"/>',
    chevL: '<path d="M15 5.5L8.5 12l6.5 6.5"/>',
    chevD: '<path d="M5.5 9l6.5 6.5L18.5 9"/>',
    chevU: '<path d="M5.5 15L12 8.5l6.5 6.5"/>',
    arrowR: '<path d="M4 12h16M13.5 5.5L20 12l-6.5 6.5"/>',
    arrowL: '<path d="M20 12H4M10.5 5.5L4 12l6.5 6.5"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M10 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4"/>',
    doc: '<path d="M6 3h8l4 4v14H6V3z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    history: '<path d="M3.6 12a8.4 8.4 0 1 0 2.4-5.9"/><path d="M3.6 4v4.5h4.5"/><path d="M12 8v4.4l3 1.9"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 12.8l9 5 9-5"/><path d="M3 16.8l9 5 9-5"/>',
    gauge: '<path d="M4 18a9 9 0 1 1 16 0"/><path d="M12 14l4.2-4.2"/><circle cx="12" cy="14.5" r="1.2"/>',
    wave: '<path d="M2.5 12c1.9-4.8 3.9-4.8 5.8 0s3.9 4.8 5.8 0 3.9-4.8 5.8 0"/>',
    sparkle: '<path d="M11 3.5l1.6 4.9L17.5 10l-4.9 1.6L11 16.5l-1.6-4.9L4.5 10l4.9-1.6L11 3.5z"/><path d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z"/>',
    scales: '<path d="M12 4v16M7 20h10M5.5 4.8h13"/><path d="M5.5 4.8L3 11a2.7 2.7 0 0 0 5 0L5.5 4.8zM18.5 4.8L16 11a2.7 2.7 0 0 0 5 0l-2.5-6.2z"/>',
    key: '<circle cx="8" cy="16" r="3.6"/><path d="M10.7 13.3L20 4M15.8 8.2l3 3M18.2 5.8l2 2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
    users: '<circle cx="9" cy="9" r="3.4"/><path d="M2.8 19.5a6.2 6.2 0 0 1 12.4 0"/><path d="M15.8 5.9a3.4 3.4 0 0 1 0 6.2M17.6 14.5a6.2 6.2 0 0 1 3.6 5"/>',
    server: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
    cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18.2 10.6 3.9 3.9 0 0 1 17 18.5H7z"/>',
    wrench: '<path d="M20.5 6.7a5 5 0 0 1-6.6 6.3L7.2 19.7a2.1 2.1 0 0 1-3-3l6.7-6.7a5 5 0 0 1 6.3-6.6L14 6.6l3.4 3.4 3.1-3.3z"/>',
    trash: '<path d="M4 7h16M9.5 7V4.5h5V7"/><path d="M6 7l1 14h10l1-14"/><path d="M10 11v6M14 11v6"/>',
    edit: '<path d="M4 20l1-4L16.4 4.6a2.1 2.1 0 0 1 3 3L8 19l-4 1z"/><path d="M14.5 6.5l3 3"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"/>',
    filter: '<path d="M3.5 5h17l-6.5 7.6V19l-4 2v-8.4L3.5 5z"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
    list: '<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    link: '<path d="M10 14a5 5 0 0 0 7.1 0l2.4-2.4a5 5 0 0 0-7.1-7.1L11 5.9"/><path d="M14 10a5 5 0 0 0-7.1 0l-2.4 2.4a5 5 0 0 0 7.1 7.1L13 18.1"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>',
    camera: '<path d="M4 8h3.2L9 5.5h6L16.8 8H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.4 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    upload: '<path d="M12 16V4M6 10l6-6 6 6"/><path d="M4.5 20h15"/>',
    download: '<path d="M12 4v12M6 10l6 6 6-6"/><path d="M4.5 20h15"/>',
    /* Final cumulative packet additions (2026-08-08). Same grammar:
       24 viewBox, stroke-current, width 1.8, no fills except starFill. */
    bell: '<path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10z"/><path d="M10 19a2.2 2.2 0 0 0 4 0"/>',
    speaker: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4v-5z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.7a8 8 0 0 1 0 10.6"/>',
    package: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9M8 5.3l8 4.5"/>',
    box: '<rect x="3.5" y="8" width="17" height="12" rx="2"/><path d="M3.5 11h17M5 8l1.6-3.5h10.8L19 8M12 14.5h.01"/>',
    database: '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v13c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-13"/><path d="M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8"/>',
    disk: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.4"/><path d="M12 3a9 9 0 0 1 9 9"/>',
    undo: '<path d="M8 5L3.5 9.5 8 14"/><path d="M3.5 9.5H15a5.5 5.5 0 0 1 0 11h-3"/>',
    keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 9.5h.01M9.3 9.5h.01M12.6 9.5h.01M15.9 9.5h.01M6 12.7h.01M9.3 12.7h.01M12.6 12.7h.01M15.9 12.7h.01M7.5 15.5h9"/>',
    font: '<path d="M5 19L11 5h2l6 14"/><path d="M7.5 14h9"/>',
    tray: '<path d="M3.5 13.5V18a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-4.5"/><path d="M3.5 13.5h5l1.5 2.5h4l1.5-2.5h5"/><path d="M12 4v7M9 8.2l3 2.8 3-2.8"/>',
    windowIcon: '<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M3 9h18M6.2 6.8h.01M8.8 6.8h.01"/>',
    grad: '<path d="M12 4.5L22 9l-10 4.5L2 9l10-4.5z"/><path d="M6.5 11v5c0 1.4 2.5 2.6 5.5 2.6s5.5-1.2 5.5-2.6v-5M22 9v5"/>',
    beaker: '<path d="M9.5 3.5h5M10.5 3.5v5.2L4.9 18a2 2 0 0 0 1.8 3h10.6a2 2 0 0 0 1.8-3l-5.6-9.3V3.5"/><path d="M7.5 14.5h9"/>',
    bug: '<circle cx="12" cy="13.5" r="5.5"/><path d="M12 8V6M9.2 8.6L7 5.5M14.8 8.6L17 5.5M6.5 13.5h-3M20.5 13.5h-3M7.6 17.5L5 20M16.4 17.5L19 20M12 10.5V17"/>',
    broom: '<path d="M13.5 3l7.5 7.5"/><path d="M12 8.5L15.5 12 9 18.5a13 13 0 0 1-6 2.5 13 13 0 0 1 2.5-6L12 8.5z"/><path d="M7 14.5l2.5 2.5"/>',
    container: '<path d="M3 8.5l9-4 9 4v7l-9 4-9-4v-7z"/><path d="M7 10.3v5M12 12.5v5M17 10.3v5M3 8.5l9 4 9-4"/>',
    kube: '<circle cx="12" cy="12" r="8.5"/><path d="M12 6.5l4.6 2.3 1.1 5-3.2 4H9.5l-3.2-4 1.1-5L12 6.5z"/><circle cx="12" cy="12" r="1.2"/>',
    workflow: '<rect x="3" y="3.5" width="6" height="6" rx="1.5"/><rect x="15" y="14.5" width="6" height="6" rx="1.5"/><path d="M9 6.5h6a2 2 0 0 1 2 2v6"/><circle cx="6" cy="17.5" r="2.5"/><path d="M8.5 17.5H15"/>',
    worktree: '<circle cx="6" cy="5.5" r="2.2"/><circle cx="6" cy="18.5" r="2.2"/><circle cx="18" cy="12" r="2.2"/><path d="M6 7.7v8.6M6.5 12h9.3M15.8 12H8"/>',
    hourglass: '<path d="M6.5 3.5h11M6.5 20.5h11M8 3.5v3.2a4 4 0 0 0 8 0V3.5M8 20.5v-3.2a4 4 0 0 1 8 0v3.2"/><path d="M12 11v2"/>',
    route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" stroke-dasharray="0"/>',
    sliders: '<path d="M5 5v5M5 14v5M12 5v2M12 11v8M19 5v8M19 17v2"/><path d="M3 10h4M10 7h4M17 13h4"/>',
    certificate: '<circle cx="12" cy="9" r="5"/><path d="M12 6.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2L9.1 8.6l2-.3.9-1.8z" stroke-width="1.2"/><path d="M9 13.5L7.5 20.5l4.5-2.5 4.5 2.5L15 13.5"/>',
    coin: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M14.8 9.2a3.3 3.3 0 0 0-2.8-1.2c-1.7 0-3 .9-3 2.2s1.3 1.9 3 2.2 3 1 3 2.2-1.3 2.2-3 2.2a3.4 3.4 0 0 1-2.9-1.3"/>'
  };

  function get(name) {
    var body = ICONS[name];
    if (!body) { return ''; }
    return SVG_OPEN + body + SVG_CLOSE;
  }

  function hydrate(root) {
    var scope = root || document;
    if (!scope.querySelectorAll) { return; }
    var hosts = scope.querySelectorAll('i[data-ico]');
    for (var i = 0; i < hosts.length; i++) {
      var el = hosts[i];
      var name = el.getAttribute('data-ico');
      var svg = get(name);
      if (svg) { el.innerHTML = svg; }
    }
    /* If the root itself is an icon host (e.g. hydrating a single node). */
    if (scope !== document && scope.matches && scope.matches('i[data-ico]')) {
      var ownSvg = get(scope.getAttribute('data-ico'));
      if (ownSvg) { scope.innerHTML = ownSvg; }
    }
  }

  window.PMIcons = { get: get, hydrate: hydrate };
})();
