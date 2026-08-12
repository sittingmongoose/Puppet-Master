/* ============================================================================
   Kimi K3 — inline SVG icon registry.

   window.K3Icons = { get(name), has(name), names() }
   - get(name) returns a FRESH <svg> element per call (cloned from an
     internal template); unknown names fall back to a neutral dot.
   - Style: 24x24 viewBox, fill none, stroke currentColor, stroke-width 1.7,
     round caps/joins. Status dots may fill. 1-4 primitives per icon.
   - No emoji, abstract glyphs only.
   ========================================================================== */
(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const DOT = '<circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>';

  // name -> inner SVG markup (1-4 primitives each)
  const MARKUP = {
    'copy': '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5.5 14.5V5.5a2 2 0 0 1 2-2h9"/>',
    'edit': '<path d="M12 20h8.5"/><path d="M16.6 3.6a2.1 2.1 0 0 1 3 3L8 18.2l-4.2 1.2 1.2-4.2Z"/>',
    'info': '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
    'chevron-right': '<path d="m9.5 6 6 6-6 6"/>',
    'chevron-down': '<path d="m6 9.5 6 6 6-6"/>',
    'chevron-up': '<path d="m6 14.5 6-6 6 6"/>',
    'chevron-left': '<path d="m14.5 6-6 6 6 6"/>',
    'search': '<circle cx="11" cy="11" r="6.8"/><path d="m20.2 20.2-4-4"/>',
    'send': '<path d="M21.5 2.5 11 13"/><path d="M21.5 2.5 14.8 21.5l-3.8-8.5-8.5-3.8Z"/>',
    'stop': '<rect x="6.5" y="6.5" width="11" height="11" rx="2"/>',
    'attach': '<path d="m20.4 11.2-8.3 8.3a5.4 5.4 0 0 1-7.6-7.6l7.8-7.8a3.6 3.6 0 0 1 5.1 5.1l-7.8 7.8a1.8 1.8 0 0 1-2.5-2.5l7.4-7.4"/>',
    'persona': '<circle cx="12" cy="8" r="3.6"/><path d="M4.8 19.8c1.2-3.4 3.9-5 7.2-5s6 1.6 7.2 5"/>',
    'model': '<path d="M12 2.7 20 7.3v9.4L12 21.3 4 16.7V7.3Z"/><path d="m4 7.3 8 4.6 8-4.6"/><path d="M12 11.9v9.4"/>',
    'mode': '<path d="M4 8h9M18 8h2M4 16h2.5M11 16h9"/><circle cx="15.2" cy="8" r="2.2"/><circle cx="8.4" cy="16" r="2.2"/>',
    'worktree': '<circle cx="6.5" cy="5.5" r="2.3"/><circle cx="6.5" cy="18.5" r="2.3"/><circle cx="17.5" cy="9" r="2.3"/><path d="M6.5 7.8v8.4M17.5 11.3c0 3.2-2.5 4-5 4.4"/>',
    'lens': '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
    'lens-mute': '<circle cx="12" cy="12" r="8"/><path d="M6.4 6.4l11.2 11.2"/>',
    'lens-focus': '<path d="M4.5 9V4.5H9M15 4.5h4.5V9M19.5 15v4.5H15M9 19.5H4.5V15"/><circle cx="12" cy="12" r="2.4"/>',
    'lens-subcompact': '<circle cx="12" cy="12" r="8"/><path d="m9 9.5 3 2.5 3-2.5M9 14.5l3-2.5 3 2.5"/>',
    'context-ring': '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 7.4 12.7"/>',
    'more': '<circle cx="5.5" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
    'pin': '<path d="M9.2 4h5.6l.9 6.8 3 2.9v1.8H5.3v-1.8l3-2.9Z"/><path d="M12 15.5V21"/>',
    'pin-off': '<path d="M9.2 4h5.6l.9 6.8 3 2.9v1.8H5.3v-1.8l3-2.9Z"/><path d="M12 15.5V21"/><path d="M4 4l16 16"/>',
    'archive': '<rect x="3.5" y="4" width="17" height="4.6" rx="1"/><path d="M5.5 8.6V19.5h13V8.6"/><path d="M10 12.6h4"/>',
    'unarchive': '<rect x="3.5" y="4" width="17" height="4.6" rx="1"/><path d="M5.5 8.6V19.5h13V8.6"/><path d="M12 17v-4.4M9.8 14.6 12 12.4l2.2 2.2"/>',
    'trash': '<path d="M4.5 6.5h15M9.5 6.5v-2h5v2M6.5 6.5l.9 13h9.2l.9-13"/><path d="M10.2 10.5v5M13.8 10.5v5"/>',
    'export': '<path d="M12 15V4.2M7.2 9 12 4.2 16.8 9"/><path d="M4.5 14V19a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-5"/>',
    'branch': '<circle cx="6.5" cy="5.5" r="2.3"/><circle cx="6.5" cy="18.5" r="2.3"/><circle cx="17.5" cy="7.5" r="2.3"/><path d="M6.5 7.8v8.4M17.5 9.8c0 4.2-5.5 3.2-8.5 5.4"/>',
    'rename': '<path d="M6.5 4.5h11M6.5 19.5h11M12 4.5v15"/>',
    'restore': '<path d="M2.5 2v6h6"/><path d="M2.66 15a9 9 0 1 0 2.31-9.36L2.5 8"/>',
    'plus': '<path d="M12 5v14M5 12h14"/>',
    'close': '<path d="M6 6l12 12M18 6 6 18"/>',
    'check': '<path d="m4.8 12.8 4.2 4.2L19.2 6.8"/>',
    'dot': '<circle cx="12" cy="12" r="3.4" fill="currentColor" stroke="none"/>',
    'goal': '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
    'todo': '<path d="m4 6.5 1.5 1.5L8 5.5"/><path d="m4 12.5 1.5 1.5L8 11.5"/><path d="m4 18.5 1.5 1.5L8 17.5"/><path d="M11 7h9M11 13h9M11 19h9"/>',
    'subagent': '<circle cx="12" cy="5.2" r="2.4"/><circle cx="6" cy="18.5" r="2.4"/><circle cx="18" cy="18.5" r="2.4"/><path d="M12 7.6v3.6M11.6 11.6 7 15.9M12.4 11.6l4.6 4.3"/>',
    'diff': '<circle cx="8" cy="8" r="4.5"/><circle cx="16" cy="16" r="4.5"/><path d="M8 6v4M6 8h4"/><path d="M13.8 16h4.4"/>',
    'activity': '<path d="M3 12h4.2l2.3-6.8 4 13.6 2.3-6.8H21"/>',
    'thought': '<path d="M8 18.5c-2.6 0-4.5-1.8-4.5-4.1 0-2 1.4-3.7 3.4-4.1.4-2.7 2.5-4.8 5.1-4.8 2.4 0 4.4 1.8 4.9 4.2 1.9.3 3.3 1.9 3.3 3.9 0 2.6-2.1 4.9-5 4.9Z"/>',
    'artifact': '<path d="M6.5 3.5h7L19 9v11.5h-12.5Z"/><path d="M13.5 3.5V9H19"/>',
    'browser': '<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 9.5h17"/><path d="M6.2 7.3h.01M8.6 7.3h.01"/>',
    'question': '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.5 2.3c-.8.35-1.1.9-1.1 1.7"/><path d="M12 16.8h.01"/>',
    'draft': '<path d="M6.5 3.5h11v17h-11Z"/><path d="M9.5 8h5M9.5 12h5M9.5 16h3"/>',
    'history': '<path d="M2.2 4.5v6h6"/><path d="M3.9 15.2a8.5 8.5 0 1 0 2-8.9L2.2 10.5"/><path d="M12 7.5V12l3 2"/>',
    'home': '<path d="m4 11.2 8-7.2 8 7.2"/><path d="M6.2 9.8V20h11.6V9.8"/><path d="M10 20v-5.5h4V20"/>',
    'folder': '<path d="M3.5 6.8A1.8 1.8 0 0 1 5.3 5h3.9l2.1 2.2h7.4a1.8 1.8 0 0 1 1.8 1.8v9a1.8 1.8 0 0 1-1.8 1.8H5.3a1.8 1.8 0 0 1-1.8-1.8Z"/>',
    'settings': '<circle cx="12" cy="12" r="3.1"/><path d="M12 2.8v2.8M12 18.4v2.8M4.9 6.6l2 1.2M17.1 16.2l2 1.2M2.8 12h2.8M18.4 12h2.8M4.9 17.4l2-1.2M17.1 7.8l2-1.2"/>',
    'docker': '<rect x="3.2" y="9.8" width="4.6" height="4.2"/><rect x="9.7" y="9.8" width="4.6" height="4.2"/><rect x="16.2" y="9.8" width="4.6" height="4.2"/><path d="M2.5 15h19l-1.4 3.3a4 4 0 0 1-3.7 2.4H7.6a4 4 0 0 1-3.7-2.4Z"/>',
    'tests': '<path d="M9.5 3h5"/><path d="M10.5 3v5.2L6 16.8A2.4 2.4 0 0 0 8.2 20.5h7.6a2.4 2.4 0 0 0 2.2-3.7L13.5 8.2V3"/><path d="M8 15h8"/>',
    'agents': '<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c.8-3.2 3-4.7 6-4.7s5.2 1.5 6 4.7"/><circle cx="17" cy="8.5" r="2.4"/><path d="M16.6 14.8c2.4.2 4 1.6 4.4 4.2"/>',
    'source': '<path d="m8.5 6.5-5 5.5 5 5.5M15.5 6.5l5 5.5-5 5.5"/>',
    'actions': '<path d="M12.8 2.8 5.5 13.2h4.7l-1.4 8 7.6-10.4h-4.7Z"/>',
    'warning': '<path d="M12 4.2 20.8 19.5H3.2Z"/><path d="M12 10v4.2M12 17.4h.01"/>',
    'pause': '<path d="M9 5.5v13M15 5.5v13"/>',
    'play': '<path d="M7.5 4.8v14.4L18.8 12Z"/>',
    'clear': '<circle cx="12" cy="12" r="8.5"/><path d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6"/>',
    'external': '<path d="M13.5 5H19v5.5"/><path d="M19 5l-8.5 8.5"/><path d="M16.5 13.5V18A1.5 1.5 0 0 1 15 19.5H6A1.5 1.5 0 0 1 4.5 18V9A1.5 1.5 0 0 1 6 7.5h4.5"/>',
    'collapse': '<path d="m6.5 5.5 5.5 5.5 5.5-5.5M6.5 18.5l5.5-5.5 5.5 5.5"/>',
    'expand': '<path d="m6.5 11 5.5-5.5 5.5 5.5M6.5 13l5.5 5.5 5.5-5.5"/>',
    'jump-latest': '<path d="M12 4v10.5M7.5 10 12 14.5 16.5 10"/><path d="M5 19.5h14"/>',
    'timer': '<circle cx="12" cy="13.2" r="7.6"/><path d="M12 9.6v3.6l2.4 2"/><path d="M9.5 2.6h5"/>',
    'skip': '<path d="M6.5 5.5v13l7.5-6.5Z"/><path d="M17 5.5v13"/>',
    'submit': '<path d="M12 15.5V4.5M6.8 9.2 12 4l5.2 5.2"/><path d="M4.5 20h15"/>',
    'back': '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
    'forward': '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    'spark': '<path d="M12 3.2l2.1 6.7 6.7 2.1-6.7 2.1L12 20.8l-2.1-6.7-6.7-2.1 6.7-2.1Z"/>',
    'rail-open': '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M10 4.5v15"/><path d="m13.5 9.5 2.8 2.5-2.8 2.5"/>',
    'rail-close': '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M10 4.5v15"/><path d="m16 9.5-2.8 2.5 2.8 2.5"/>',
    'popout': '<rect x="3.5" y="13" width="9.5" height="7.5" rx="1.5"/><path d="M14.5 9.5 19.5 4.5M14 4.5h5.5V10"/>',
    'dock': '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M15 4.5v15"/><path d="M6 12h5M8.8 9.8 11 12l-2.2 2.2"/>',
    'menu': '<path d="M4 7h16M4 12h16M4 17h16"/>',
    // --- final cumulative packet additions ------------------------------------
    'provider-anthropic': '<path d="M12 4.5v15"/><path d="M5.5 8.2l13 7.6"/><path d="M18.5 8.2l-13 7.6"/>',
    'provider-openai': '<path d="M12 3.5 18.9 7.5v9L12 20.5 5.1 16.5v-9Z"/><circle cx="12" cy="12" r="3.2"/>',
    'provider-google': '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M12 12h8"/>',
    'provider-xai': '<path d="M5.5 5.5l13 13"/><path d="M18.5 5.5l-13 13"/>',
    'provider-ollama': '<circle cx="12" cy="12" r="7.5"/><circle cx="9.4" cy="10.6" r="1.1" fill="currentColor" stroke="none"/><circle cx="14.6" cy="10.6" r="1.1" fill="currentColor" stroke="none"/><path d="M9.5 15.2c1.5 1 3.5 1 5 0"/>',
    'star': '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9Z"/>',
    'star-filled': '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9Z" fill="currentColor" stroke="none"/>',
    'shield': '<path d="M12 3l7 2.8v5.4c0 4.6-3 7.7-7 9.3-4-1.6-7-4.7-7-9.3V5.8Z"/><path d="m8.8 11.8 2.2 2.2 4.2-4.2"/>',
    'bsd': '<circle cx="12" cy="12" r="8.5"/><path d="M12 12l3.6-3.6"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
    'wifi': '<path d="M4.5 9.5a11 11 0 0 1 15 0"/><path d="M7.5 13a7 7 0 0 1 9 0"/><path d="M10.4 16.4a3 3 0 0 1 3.2 0"/><circle cx="12" cy="19" r="1.1" fill="currentColor" stroke="none"/>',
    'wifi-off': '<path d="M4.5 9.5a11 11 0 0 1 15 0"/><path d="M10.4 16.4a3 3 0 0 1 3.2 0"/><circle cx="12" cy="19" r="1.1" fill="currentColor" stroke="none"/><path d="M4 4l16 16"/>',
    'inbox': '<path d="M4 13.5 6.5 5h11L20 13.5V19H4Z"/><path d="M4 13.5h5l1.5 2h3l1.5-2h5"/>',
    'bell-stack': '<path d="M11 5a4.6 4.6 0 0 1 4.6 4.6v2.6l1.4 2.8H5l1.4-2.8V9.6A4.6 4.6 0 0 1 11 5Z"/><path d="M9.2 18a2 2 0 0 0 3.8 0"/><path d="M16.8 4.6a6.8 6.8 0 0 1 2.7 4.2"/>',
    'paperclip-zip': '<rect x="6" y="3.5" width="12" height="17" rx="2"/><path d="M12 3.5v2.5M10.5 6h3M12 8.5V11"/><path d="M9.5 15.5h5"/>',
    'paperclip-pdf': '<path d="M6.5 3.5h7L19 9v11.5h-12.5Z"/><path d="M13.5 3.5V9H19"/><path d="M9 13h6M9 16.5h4"/>',
    'paperclip-mov': '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M10.5 9.5v5l4.5-2.5Z"/>',
    'paperclip-xlsx': '<rect x="4.5" y="4.5" width="15" height="15" rx="2"/><path d="M4.5 9.5h15M4.5 14.5h15M10 4.5v15"/>',
    'paperclip-png': '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 16.8 4.5-4.5 4 4 3-3 4.5 4.5"/>',
    'paperclip-bin': '<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9Z"/><path d="M12 12 20 7.5M12 12 4 7.5M12 12v9"/>',
    'rewind': '<path d="M11 5.5 4.5 12l6.5 6.5Z"/><path d="M19 5.5 12.5 12l6.5 6.5Z"/>',
    'redirect': '<path d="M5 19V9a3 3 0 0 1 3-3h11"/><path d="m15.5 3 3.5 3-3.5 3"/>',
    'crew': '<circle cx="8" cy="8" r="2.6"/><circle cx="16.5" cy="8" r="2.6"/><path d="M3.5 19.5c.6-3 2.4-4.5 4.5-4.5s3.9 1.5 4.5 4.5M12.5 19.5c.6-3 2.1-4.5 4-4.5s3.5 1.5 4 4.5"/>',
    'capacity': '<path d="M5 19.5v-6M10 19.5v-10M15 19.5v-4M20 19.5v-13"/>',
    'port': '<rect x="4" y="7.5" width="16" height="9.5" rx="2"/><path d="M8 7.5V12M12 7.5V12M16 7.5V12"/>',
    'receipt': '<path d="M6 3.5h12V21l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21Z"/><path d="M9 8h6M9 12h6"/>',
    'spell': '<path d="M4 6.5h12M4 10.5h8"/><path d="m13 17.5 2.2 2.2 4.3-4.7"/>'
  };

  const templates = {}; // name -> pristine template <svg> (never inserted)

  function build(name) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.7');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.innerHTML = Object.prototype.hasOwnProperty.call(MARKUP, name) ? MARKUP[name] : DOT;
    return svg;
  }

  const K3Icons = {
    get(name) {
      const key = Object.prototype.hasOwnProperty.call(MARKUP, name) ? name : '__fallback__';
      if (!templates[key]) templates[key] = build(key === '__fallback__' ? '__none__' : key);
      return templates[key].cloneNode(true);
    },
    has(name) {
      return Object.prototype.hasOwnProperty.call(MARKUP, name);
    },
    names() {
      return Object.keys(MARKUP);
    }
  };

  window.K3Icons = K3Icons;
})();
