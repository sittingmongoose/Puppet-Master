/* Opus 5 — icon set for the settings-redesign concepts.
 * SVG only. There is deliberately no emoji anywhere in this folder.
 * Every icon is a 16x16 stroke glyph that inherits currentColor.
 */
(function () {
  "use strict";

  var P = {
    search: '<circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 14 14"/>',
    chevronRight: '<path d="m6 3.5 5 4.5-5 4.5"/>',
    chevronLeft: '<path d="m10 3.5-5 4.5 5 4.5"/>',
    chevronDown: '<path d="m3.5 6 4.5 5 4.5-5"/>',
    chevronUp: '<path d="m3.5 10 4.5-5 4.5 5"/>',
    arrowRight: '<path d="M2.5 8h11"/><path d="m9.5 4 4 4-4 4"/>',
    arrowUpRight: '<path d="M5 11 11 5"/><path d="M5.5 5H11v5.5"/>',
    check: '<path d="m3 8.5 3.5 3.5L13 5"/>',
    checkCircle: '<circle cx="8" cy="8" r="6"/><path d="m5.3 8.2 1.9 1.9 3.5-3.9"/>',
    alert: '<path d="M8 2.2 14.4 13H1.6z"/><path d="M8 6.4v3"/><path d="M8 11.2h.01"/>',
    info: '<circle cx="8" cy="8" r="6"/><path d="M8 7.4v3.4"/><path d="M8 5.2h.01"/>',
    clock: '<circle cx="8" cy="8" r="6"/><path d="M8 4.6V8l2.3 1.6"/>',
    lightbulb: '<path d="M6 12.5h4"/><path d="M6.5 14.2h3"/><path d="M5 6.6a3 3 0 1 1 6 0c0 1.5-1.1 2.2-1.3 3.4H6.3C6.1 8.8 5 8.1 5 6.6Z"/>',
    lock: '<rect x="3.2" y="7" width="9.6" height="6.6" rx="1.2"/><path d="M5.6 7V5.2a2.4 2.4 0 0 1 4.8 0V7"/>',
    ban: '<circle cx="8" cy="8" r="6"/><path d="m4 12 8-8"/>',
    refresh: '<path d="M13.3 6.8A5.4 5.4 0 0 0 3.4 5.6"/><path d="M2.7 9.2a5.4 5.4 0 0 0 9.9 1.2"/><path d="M3.2 2.6v3h3"/><path d="M12.8 13.4v-3h-3"/>',
    plug: '<path d="M6 2v3.4"/><path d="M10 2v3.4"/><path d="M4.4 5.4h7.2v2.3a3.6 3.6 0 0 1-7.2 0z"/><path d="M8 11.3V14"/>',
    key: '<circle cx="5.4" cy="6.2" r="2.8"/><path d="m7.6 8 5 5"/><path d="m10.6 11-1.4 1.4"/>',
    server: '<rect x="2.4" y="2.6" width="11.2" height="4.6" rx="1"/><rect x="2.4" y="8.8" width="11.2" height="4.6" rx="1"/><path d="M5 4.9h.01"/><path d="M5 11.1h.01"/>',
    terminal: '<rect x="2" y="2.8" width="12" height="10.4" rx="1.4"/><path d="m5 6.6 2 1.8-2 1.8"/><path d="M8.6 10.6h2.8"/>',
    cpu: '<rect x="4.4" y="4.4" width="7.2" height="7.2" rx="1.2"/><path d="M6.6 2v2.4"/><path d="M9.4 2v2.4"/><path d="M6.6 11.6V14"/><path d="M9.4 11.6V14"/><path d="M2 6.6h2.4"/><path d="M2 9.4h2.4"/><path d="M11.6 6.6H14"/><path d="M11.6 9.4H14"/>',
    user: '<circle cx="8" cy="5.6" r="2.6"/><path d="M3.4 13.4a4.6 4.6 0 0 1 9.2 0"/>',
    users: '<circle cx="6.2" cy="5.6" r="2.4"/><path d="M2.2 13.2a4 4 0 0 1 8 0"/><path d="M10.6 3.5a2.4 2.4 0 0 1 0 4.5"/><path d="M11.4 9.6a4 4 0 0 1 2.4 3.6"/>',
    brain: '<path d="M6.6 2.6a2 2 0 0 0-2 2 2 2 0 0 0-1 3.6 2 2 0 0 0 1.2 3.4 2 2 0 0 0 3.8-.9V4.5a2 2 0 0 0-2-1.9Z"/><path d="M9.4 2.6a2 2 0 0 1 2 2 2 2 0 0 1 1 3.6 2 2 0 0 1-1.2 3.4 2 2 0 0 1-3.8-.9"/>',
    mask: '<path d="M2.6 4.2c3.6-1 7.2-1 10.8 0 .3 3.6-.6 6.4-2.6 8.2-1.5 1.3-4.1 1.3-5.6 0C3.2 10.6 2.3 7.8 2.6 4.2Z"/><path d="M6 7.4h.01"/><path d="M10 7.4h.01"/>',
    puzzle: '<path d="M6.2 2.4h3.6v1.9a1.3 1.3 0 1 0 2.6 0v-.1h1.2v3.6h-1.9a1.3 1.3 0 1 0 0 2.6h1.9v3.2H9.8v-1.9a1.3 1.3 0 1 0-2.6 0v1.9H2.4V9.8h1.9a1.3 1.3 0 1 0 0-2.6H2.4V4.2h1.9"/>',
    image: '<rect x="2.2" y="3" width="11.6" height="10" rx="1.4"/><circle cx="6" cy="6.4" r="1.1"/><path d="m3 11.4 3-3 2.6 2.6 2-1.8 2.4 2.2"/>',
    layers: '<path d="m8 2.2 5.8 3-5.8 3-5.8-3z"/><path d="m2.2 8.4 5.8 3 5.8-3"/><path d="m2.2 11.2 5.8 3 5.8-3"/>',
    sliders: '<path d="M2.6 4.6h10.8"/><path d="M2.6 11.4h10.8"/><circle cx="6" cy="4.6" r="1.6"/><circle cx="10.4" cy="11.4" r="1.6"/>',
    fileText: '<path d="M9 2.2H4.6a1.2 1.2 0 0 0-1.2 1.2v9.2a1.2 1.2 0 0 0 1.2 1.2h6.8a1.2 1.2 0 0 0 1.2-1.2V5.6z"/><path d="M9 2.2v3.4h3.6"/><path d="M5.8 9h4.4"/><path d="M5.8 11.2h3"/>',
    book: '<path d="M3 3.2a1.2 1.2 0 0 1 1.2-1.2H13v10.4H4.2A1.2 1.2 0 0 0 3 13.6z"/><path d="M3 12.4a1.2 1.2 0 0 1 1.2-1.2H13"/>',
    star: '<path d="m8 2.4 1.8 3.6 4 .6-2.9 2.8.7 4L8 11.5 4.4 13.4l.7-4-2.9-2.8 4-.6z"/>',
    zap: '<path d="M8.8 1.8 3.4 9h4l-.6 5.2L12.6 7h-4z"/>',
    gauge: '<path d="M3 12.2a6 6 0 1 1 10 0"/><path d="m8 9.4 2.6-2.8"/><circle cx="8" cy="10.4" r=".9"/>',
    shield: '<path d="M8 1.8 3.2 3.9v3.7c0 2.8 2 5.4 4.8 6.6 2.8-1.2 4.8-3.8 4.8-6.6V3.9z"/>',
    eye: '<path d="M1.8 8S4.2 3.9 8 3.9 14.2 8 14.2 8 11.8 12.1 8 12.1 1.8 8 1.8 8Z"/><circle cx="8" cy="8" r="1.9"/>',
    eyeOff: '<path d="M6.3 4.2A5.7 5.7 0 0 1 8 3.9C11.8 3.9 14.2 8 14.2 8a11 11 0 0 1-2 2.4"/><path d="M4.2 5.4A11.6 11.6 0 0 0 1.8 8S4.2 12.1 8 12.1a5.9 5.9 0 0 0 2.2-.4"/><path d="m2.4 2.4 11.2 11.2"/>',
    plus: '<path d="M8 3.2v9.6"/><path d="M3.2 8h9.6"/>',
    minus: '<path d="M3.2 8h9.6"/>',
    more: '<circle cx="3.6" cy="8" r="1"/><circle cx="8" cy="8" r="1"/><circle cx="12.4" cy="8" r="1"/>',
    undo: '<path d="M3 7.2h6.4a3.4 3.4 0 1 1 0 6.8H6"/><path d="m5.6 4 -2.6 3.2 2.6 3"/>',
    external: '<path d="M9.4 2.6H13.4v4"/><path d="M13.4 2.6 7.6 8.4"/><path d="M12.2 9.4v3.2a1 1 0 0 1-1 1H3.4a1 1 0 0 1-1-1V4.8a1 1 0 0 1 1-1h3.2"/>',
    folder: '<path d="M2.4 4.4a1.2 1.2 0 0 1 1.2-1.2h2.6l1.4 1.8h4.8a1.2 1.2 0 0 1 1.2 1.2v5.4a1.2 1.2 0 0 1-1.2 1.2H3.6a1.2 1.2 0 0 1-1.2-1.2z"/>',
    link: '<path d="M6.6 9.4a2.8 2.8 0 0 0 4 0l2-2a2.8 2.8 0 1 0-4-4l-1 1"/><path d="M9.4 6.6a2.8 2.8 0 0 0-4 0l-2 2a2.8 2.8 0 1 0 4 4l1-1"/>',
    download: '<path d="M8 2.6v7.2"/><path d="m5 7 3 3 3-3"/><path d="M2.8 12.2v.6a.8.8 0 0 0 .8.8h8.8a.8.8 0 0 0 .8-.8v-.6"/>',
    map: '<path d="m2.4 4 3.8-1.6 3.6 1.6 3.8-1.6v9.6L9.8 13.6 6.2 12 2.4 13.6z"/><path d="M6.2 2.4V12"/><path d="M9.8 4v9.6"/>',
    list: '<path d="M5.6 4.4h8"/><path d="M5.6 8h8"/><path d="M5.6 11.6h8"/><path d="M2.6 4.4h.01"/><path d="M2.6 8h.01"/><path d="M2.6 11.6h.01"/>',
    columns: '<rect x="2.2" y="2.8" width="11.6" height="10.4" rx="1.2"/><path d="M6.1 2.8v10.4"/><path d="M9.9 2.8v10.4"/>',
    table: '<rect x="2.2" y="2.8" width="11.6" height="10.4" rx="1.2"/><path d="M2.2 6.2h11.6"/><path d="M2.2 9.8h11.6"/><path d="M6.6 6.2v7"/>',
    panelLeft: '<rect x="2.2" y="2.8" width="11.6" height="10.4" rx="1.2"/><path d="M6.2 2.8v10.4"/>',
    panelRight: '<rect x="2.2" y="2.8" width="11.6" height="10.4" rx="1.2"/><path d="M9.8 2.8v10.4"/>',
    sun: '<circle cx="8" cy="8" r="3"/><path d="M8 1.4v1.6"/><path d="M8 13v1.6"/><path d="M1.4 8H3"/><path d="M13 8h1.6"/><path d="m3.4 3.4 1.1 1.1"/><path d="m11.5 11.5 1.1 1.1"/><path d="m12.6 3.4-1.1 1.1"/><path d="m4.5 11.5-1.1 1.1"/>',
    moon: '<path d="M13 9.6A5.6 5.6 0 0 1 6.4 3a5.8 5.8 0 1 0 6.6 6.6Z"/>',
    history: '<path d="M2.8 8a5.2 5.2 0 1 0 1.6-3.8"/><path d="M2.4 2.8v2.8h2.8"/><path d="M8 5.4V8l2 1.4"/>',
    pin: '<path d="M6 2.4h4l-.6 3.4 2.2 2.2H4.4l2.2-2.2z"/><path d="M8 8v5.6"/>',
    filter: '<path d="M2.6 3.4h10.8l-4.2 5v4.2l-2.4 1.2V8.4z"/>',
    dot: '<circle cx="8" cy="8" r="3"/>',

    /* Added for the manager families: every manager names a real glyph, so none
     * of them falls back to a generic dot. */
    bell: '<path d="M4.2 6.6a3.8 3.8 0 0 1 7.6 0c0 3 .9 4.2 1.4 4.8H2.8c.5-.6 1.4-1.8 1.4-4.8Z"/><path d="M6.6 13.2a1.6 1.6 0 0 0 2.8 0"/>',
    bellOff: '<path d="M5.2 4.6a3.8 3.8 0 0 1 6.6 2c0 3 .9 4.2 1.4 4.8H6.4"/><path d="M3.6 11.4c.5-.6 1.4-1.8 1.4-4.8v-.3"/><path d="M6.6 13.2a1.6 1.6 0 0 0 2.8 0"/><path d="m2.4 2.4 11.2 11.2"/>',
    volume: '<path d="M3.2 6.2h2.2L8.4 3.6v8.8L5.4 9.8H3.2z"/><path d="M10.6 6a2.8 2.8 0 0 1 0 4"/><path d="M12.4 4.2a5.2 5.2 0 0 1 0 7.6"/>',
    waveform: '<path d="M2.4 8h1.6"/><path d="M5.4 4.8v6.4"/><path d="M8 2.8v10.4"/><path d="M10.6 5.6v4.8"/><path d="M13.2 7.2v1.6"/>',
    palette: '<path d="M8 2.2a5.8 5.8 0 0 0 0 11.6c1 0 1.4-.7 1.1-1.4-.4-.9.2-1.7 1.2-1.7h1a2.5 2.5 0 0 0 2.5-2.6C13.8 4.7 11.2 2.2 8 2.2Z"/><circle cx="5.6" cy="7" r=".9"/><circle cx="8.4" cy="5.2" r=".9"/><circle cx="10.9" cy="6.9" r=".9"/>',
    type: '<path d="M3.4 4.4V3.2h9.2v1.2"/><path d="M8 3.2v9.6"/><path d="M6.2 12.8h3.6"/>',
    spellcheck: '<path d="m2.4 10.6 2.8-7 2.8 7"/><path d="M3.4 8.4h3.6"/><path d="m9.4 10.4 1.8 1.9 3.2-4"/>',
    window: '<rect x="2.2" y="3" width="11.6" height="10" rx="1.3"/><path d="M2.2 6h11.6"/><path d="M4.4 4.5h.01"/><path d="M6.2 4.5h.01"/>',
    tray: '<path d="M2.4 9.4h3l.9 1.6h3.4l.9-1.6h3"/><path d="M4.1 3.4h7.8l1.7 6v2.4a1.2 1.2 0 0 1-1.2 1.2H3.6a1.2 1.2 0 0 1-1.2-1.2V9.4z"/>',
    graduation: '<path d="M8 2.4 14.4 5.6 8 8.8 1.6 5.6z"/><path d="M4.4 7.2v3.4c0 1.2 1.6 2.2 3.6 2.2s3.6-1 3.6-2.2V7.2"/><path d="M14.4 5.6v3.6"/>',
    git: '<circle cx="4.6" cy="4.6" r="1.8"/><circle cx="4.6" cy="11.4" r="1.8"/><circle cx="11.4" cy="8" r="1.8"/><path d="M4.6 6.4v3.2"/><path d="M6.2 5.4a3.6 3.6 0 0 0 3.5 2.2"/>',
    branch: '<circle cx="4.6" cy="3.8" r="1.6"/><circle cx="4.6" cy="12.2" r="1.6"/><circle cx="11.4" cy="6.2" r="1.6"/><path d="M4.6 5.4v5.2"/><path d="M11.4 7.8c0 2-1.6 2.9-3.4 3.1"/>',
    container: '<path d="M8 2.2 13.6 5v6L8 13.8 2.4 11V5z"/><path d="M2.4 5 8 7.8 13.6 5"/><path d="M8 7.8v6"/>',
    globe: '<circle cx="8" cy="8" r="5.8"/><path d="M2.4 8h11.2"/><path d="M8 2.2c1.7 1.7 2.6 3.7 2.6 5.8S9.7 12.1 8 13.8C6.3 12.1 5.4 10.1 5.4 8s.9-4.1 2.6-5.8Z"/>',
    database: '<ellipse cx="8" cy="4" rx="5" ry="1.9"/><path d="M3 4v8c0 1 2.2 1.9 5 1.9s5-.9 5-1.9V4"/><path d="M3 8c0 1 2.2 1.9 5 1.9s5-.9 5-1.9"/>',
    archive: '<rect x="2.2" y="2.8" width="11.6" height="3" rx=".8"/><path d="M3.4 5.8v6.2a1.2 1.2 0 0 0 1.2 1.2h6.8a1.2 1.2 0 0 0 1.2-1.2V5.8"/><path d="M6.4 8.6h3.2"/>',
    beaker: '<path d="M6.2 2.2v4L2.8 11.6a1.2 1.2 0 0 0 1 1.9h8.4a1.2 1.2 0 0 0 1-1.9L9.8 6.2v-4"/><path d="M5.4 2.2h5.2"/><path d="M4.6 9.6h6.8"/>',
    bug: '<path d="M5.4 5.6a2.6 2.6 0 0 1 5.2 0v3.2a2.6 2.6 0 0 1-5.2 0z"/><path d="M6.2 4.2 5 3"/><path d="m9.8 4.2 1.2-1.2"/><path d="M5.4 7.2H2.8"/><path d="M10.6 7.2h2.6"/><path d="m5.6 10.4-1.8 1.6"/><path d="m10.4 10.4 1.8 1.6"/>',
    wrench: '<path d="M10.2 2.4a3.6 3.6 0 0 0-3.4 5.9L2.6 12.5l1.3 1.3 4.2-4.2a3.6 3.6 0 0 0 4.8-4.4L11 6.9 9.4 5.3z"/>',
    keyboard: '<rect x="1.8" y="4" width="12.4" height="8" rx="1.3"/><path d="M4.2 6.4h.01"/><path d="M6.6 6.4h.01"/><path d="M9 6.4h.01"/><path d="M11.4 6.4h.01"/><path d="M4.2 9.6h7.6"/>',
    code: '<path d="m5.4 5.4-3 2.6 3 2.6"/><path d="m10.6 5.4 3 2.6-3 2.6"/><path d="m9.2 3.4-2.4 9.2"/>',
    trash: '<path d="M2.8 4.4h10.4"/><path d="M6.2 4.4V3.2a.9.9 0 0 1 .9-.9h1.8a.9.9 0 0 1 .9.9v1.2"/><path d="M4.2 4.4l.7 8.1a1 1 0 0 0 1 .9h4.2a1 1 0 0 0 1-.9l.7-8.1"/><path d="M6.8 7v3.6"/><path d="M9.2 7v3.6"/>',
    hardDrive: '<rect x="1.8" y="8.4" width="12.4" height="4.4" rx="1.2"/><path d="m3.6 8.4 1.7-4.4a1 1 0 0 1 .9-.6h3.6a1 1 0 0 1 .9.6l1.7 4.4"/><path d="M4.4 10.6h.01"/><path d="M6.6 10.6h.01"/>',
    upload: '<path d="M8 13.4V6.2"/><path d="m5 9.2 3-3 3 3"/><path d="M2.8 3.8v-.6a.8.8 0 0 1 .8-.8h8.8a.8.8 0 0 1 .8.8v.6"/><path d="M2.8 12.6v.6a.8.8 0 0 0 .8.8h8.8a.8.8 0 0 0 .8-.8v-.6"/>',
    play: '<path d="M4.8 3.2 12.4 8l-7.6 4.8z"/>',
    pause: '<path d="M5.6 3.4v9.2"/><path d="M10.4 3.4v9.2"/>',
    route: '<circle cx="4" cy="4.2" r="1.8"/><circle cx="12" cy="11.8" r="1.8"/><path d="M4 6v2.4a2.4 2.4 0 0 0 2.4 2.4H10"/><path d="M8.4 9.2 10 10.8 8.4 12.4"/>',
    scale: '<path d="M8 2.6v10.8"/><path d="M4.4 4h7.2"/><path d="M4.4 4 2.4 8.4h4z"/><path d="M11.6 4l-2 4.4h4z"/><path d="M5.6 13.4h4.8"/>',
    shieldAlert: '<path d="M8 1.8 3.2 3.9v3.7c0 2.8 2 5.4 4.8 6.6 2.8-1.2 4.8-3.8 4.8-6.6V3.9z"/><path d="M8 5.6v3"/><path d="M8 10.4h.01"/>',
    sparkle: '<path d="M6 2.4 7 5.4l3 1-3 1-1 3-1-3-3-1 3-1z"/><path d="m11.6 8.6.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>'
  };

  function icon(name, size) {
    var body = P[name];
    if (!body) return "";
    var s = size || 16;
    return '<svg class="pm-icon" width="' + s + '" height="' + s + '" viewBox="0 0 16 16" ' +
      'fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  /* Status glyphs are paired with a word everywhere they are used, so that no
   * meaning is carried by colour or shape alone. */
  var STATUS_ICON = {
    attention: "alert",
    setup: "clock",
    recommended: "lightbulb",
    ok: "checkCircle",
    connected: "checkCircle",
    managed: "lock",
    unavailable: "ban",
    risky: "shield",
    inherited: "layers",
    auto: "refresh",
    notConfigured: "minus",
    custom: "sliders",
    loading: "refresh",
    degraded: "alert"
  };

  window.PMIcons = { icon: icon, has: function (n) { return !!P[n]; }, statusIcon: function (s) { return STATUS_ICON[s] || "dot"; } };
})();
