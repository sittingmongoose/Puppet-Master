/* Inline SVG icons — no emoji. */
window.SPIcons = (function () {
  var paths = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    source: '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 15V9a3 3 0 0 0-3-3H9M6 9v6"/>',
    actions: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
    docker: '<path d="M4 14h16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4z"/><path d="M6 14V9h3v5M10 14V7h3v7M14 14V10h3v4"/><path d="M3 10h18"/>',
    tests: '<path d="M9 3h6v6l-3 3-3-3V3z"/><path d="M8 14h8M9 18h6M10 21h4"/>',
    agents: '<circle cx="12" cy="8" r="3"/><path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"/><circle cx="19" cy="7" r="2"/><circle cx="5" cy="7" r="2"/>',
    artifacts: '<path d="M9 3h6l4 4v14H5V3h4z"/><path d="M9 3v5h6"/>',
    files: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9l-.8-1.2A2 2 0 0 0 8 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z"/>',
    chev: '<path d="M6 9l6 6 6-6"/>',
    more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    play: '<path d="M8 5l12 7-12 7V5z"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/>',
    filter: '<path d="M4 6h16l-6 7v5l-4 2v-7L4 6z"/>',
    pin: '<path d="M12 17v5M8 3h8l-1 7h3l-6 6-6-6h3L8 3z"/>',
    branch: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="12" r="2.5"/><path d="M6 8.5v7M8.5 6h5a4 4 0 0 1 4 4"/>',
    container: '<rect x="3" y="8" width="18" height="10" rx="1"/><path d="M7 8V6h10v2"/>',
    check: '<path d="M5 12l5 5L20 7"/>',
    warn: '<path d="M12 4l9 16H3L12 4z"/><path d="M12 10v4M12 16h.01"/>',
    lineage: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M6 8v2a4 4 0 0 0 4 4h2M18 8v2a4 4 0 0 1-4 4h-2"/>'
  };

  function svg(name, size) {
    size = size || 14;
    var d = paths[name] || paths.search;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }

  return { svg: svg, paths: paths };
})();
