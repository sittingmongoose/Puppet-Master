/* The terminal's own shortcuts, scoped to a focused terminal. Chosen not to collide with shells (Ctrl+letter stays
   the shell's), with the panels host (CONTRACT.md section 9: Ctrl+Shift+Space, Ctrl+Shift+A, Ctrl+Shift+T,
   Ctrl+Shift+backtick, Ctrl+Tab, Ctrl+PgUp/PgDn, Ctrl+\\, F6), or with the browser where it matters. */
(function () {
  var mac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
  /* [action, other platforms, macOS] ; a binding is 'Mods+Key' with Mods from Ctrl Shift Alt Cmd */
  var MAP = [
    ['find', 'Ctrl+Shift+F', 'Cmd+F'],
    ['copy', 'Ctrl+Shift+C', 'Cmd+C'],
    ['paste', 'Ctrl+Shift+V', 'Cmd+V'],
    ['selectAll', '', 'Cmd+A'],
    ['prevCommand', 'Ctrl+ArrowUp', 'Cmd+ArrowUp'],
    ['nextCommand', 'Ctrl+ArrowDown', 'Cmd+ArrowDown'],
    ['pageUp', 'Shift+PageUp', 'Shift+PageUp'],
    ['pageDown', 'Shift+PageDown', 'Shift+PageDown'],
    ['top', 'Ctrl+Shift+Home', 'Cmd+Home'],
    ['bottom', 'Ctrl+Shift+End', 'Cmd+End'],
    ['copyMode', 'Ctrl+Shift+X', 'Cmd+Shift+X'],
    ['quickSelect', 'Ctrl+Shift+E', 'Cmd+Shift+E'],
    ['a11y', 'Alt+F2', 'Alt+F2'],
    ['zoomIn', 'Ctrl+=', 'Cmd+='],
    ['zoomOut', 'Ctrl+-', 'Cmd+-'],
    ['zoomReset', 'Ctrl+0', 'Cmd+0'],
    ['clear', 'Ctrl+Shift+K', 'Cmd+K'],
    ['split', 'Ctrl+Shift+5', 'Cmd+D']
  ];
  var LABEL = { find: 'Find', copy: 'Copy', paste: 'Paste', selectAll: 'Select all', prevCommand: 'Previous command',
    nextCommand: 'Next command', pageUp: 'Scroll up a page', pageDown: 'Scroll down a page', top: 'Scroll to top',
    bottom: 'Scroll to bottom', copyMode: 'Copy mode', quickSelect: 'Quick select', a11y: 'Plain-text buffer',
    zoomIn: 'Bigger text', zoomOut: 'Smaller text', zoomReset: 'Reset text size', clear: 'Clear', split: 'Split' };

  function parse(b) {
    if (!b) return null;
    var parts = b.split('+'), key = parts.pop();
    if (key === '') key = '+';
    return { key: key.toLowerCase(), ctrl: parts.indexOf('Ctrl') >= 0, shift: parts.indexOf('Shift') >= 0,
      alt: parts.indexOf('Alt') >= 0, meta: parts.indexOf('Cmd') >= 0 };
  }
  var BIND = MAP.map(function (r) { return { action: r[0], binding: mac ? r[2] : r[1], p: parse(mac ? r[2] : r[1]) }; });

  function keyName(e) {
    var k = e.key;
    if (k === '%' && e.shiftKey) k = '5';
    if (k === '+' ) k = '=';
    if (k === '_') k = '-';
    if (k === ')' && e.shiftKey) k = '0';
    if (/^[A-Z]$/.test(k)) k = k.toLowerCase();
    if (e.code === 'Digit5' && e.shiftKey) k = '5';
    return k.toLowerCase();
  }
  T.keys = {
    mac: mac,
    match: function (e) {
      var k = keyName(e);
      for (var i = 0; i < BIND.length; i++) {
        var p = BIND[i].p; if (!p) continue;
        if (p.key === k && p.ctrl === e.ctrlKey && p.shift === e.shiftKey && p.alt === e.altKey && p.meta === e.metaKey) return BIND[i].action;
      }
      return null;
    },
    label: function (action) {
      for (var i = 0; i < BIND.length; i++) if (BIND[i].action === action) return (BIND[i].binding || '').replace('ArrowUp', 'Up').replace('ArrowDown', 'Down');
      return '';
    },
    list: function () { return BIND.filter(function (b) { return b.binding; }).map(function (b) { return { action: b.action, label: LABEL[b.action], keys: T.keys.label(b.action) }; }); }
  };
})();
