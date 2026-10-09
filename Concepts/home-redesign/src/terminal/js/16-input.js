/* Keyboard, mouse, focus and paste encoding (xterm conventions, the kitty keyboard protocol's disambiguate and
   all-keys flags, SGR and SGR-pixel mouse, bracketed paste with the end marker stripped from pasted text). */
(function () {
  var CSI = '\x1b[', SS3 = '\x1bO';
  var KEYS = {
    ArrowUp: 'A', ArrowDown: 'B', ArrowRight: 'C', ArrowLeft: 'D', Home: 'H', End: 'F'
  };
  var TILDE = { Insert: 2, Delete: 3, PageUp: 5, PageDown: 6, F5: 15, F6: 17, F7: 18, F8: 19, F9: 20, F10: 21, F11: 23, F12: 24 };
  var SS3F = { F1: 'P', F2: 'Q', F3: 'R', F4: 'S' };
  var KITTY_FN = { Escape: 27, Enter: 13, Tab: 9, Backspace: 127, Insert: 2, Delete: 3, PageUp: 5, PageDown: 6 };

  function modBits(e) { return (e.shiftKey ? 1 : 0) | (e.altKey ? 2 : 0) | (e.ctrlKey ? 4 : 0) | (e.metaKey ? 8 : 0); }

  /* returns the bytes to send, or null when the key is not the terminal's (let the page have it) */
  function encodeKey(e, term, opts) {
    var md = term.modes, mods = modBits(e), key = e.key, kflags = term.kittyFlags ? term.kittyFlags() : 0;
    var optionMeta = !opts || opts.optionAsMeta !== false;
    if (e.isComposing || key === 'Dead' || key === 'Process' || key === 'Unidentified') return null;
    if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta' || key === 'CapsLock') return null;
    var m = mods ? ';' + (mods + 1) : '';
    if (KEYS[key]) {
      var f = KEYS[key];
      if (mods) return CSI + '1' + m + f;
      return (md.appCursor ? SS3 : CSI) + f;
    }
    if (TILDE[key] !== undefined) return CSI + TILDE[key] + m + '~';
    if (SS3F[key]) return mods ? CSI + '1' + m + SS3F[key] : SS3 + SS3F[key];
    if (kflags & 1) {
      /* disambiguate: keys that are ambiguous in legacy encoding become CSI u */
      if (key === 'Escape') return CSI + '27' + (mods ? ';' + (mods + 1) : '') + 'u';
      if (key.length === 1 && (e.ctrlKey || e.altKey) && !e.metaKey) {
        var cp = key.toLowerCase().codePointAt(0);
        return CSI + cp + ';' + (mods + 1) + 'u';
      }
      if ((key === 'Enter' || key === 'Tab' || key === 'Backspace') && mods) return CSI + KITTY_FN[key] + ';' + (mods + 1) + 'u';
    }
    switch (key) {
      case 'Enter': return e.altKey ? '\x1b\r' : '\r';
      case 'Tab': return e.shiftKey ? CSI + 'Z' : '\t';
      case 'Backspace': return e.ctrlKey ? '\x08' : (e.altKey ? '\x1b\x7f' : '\x7f');
      case 'Escape': return '\x1b';
    }
    if (key.length > 2) return null; /* other named keys */
    if (e.metaKey) return null; /* Cmd shortcuts belong to the page */
    if (e.ctrlKey && !e.altKey) {
      var c = key.length === 1 ? key.charCodeAt(0) : 0;
      if (c >= 97 && c <= 122) return String.fromCharCode(c - 96);
      if (c >= 65 && c <= 90) return String.fromCharCode(c - 64);
      if (key === ' ' || key === '@' || key === '2') return '\x00';
      if (key === '[' || key === '3') return '\x1b';
      if (key === '\\' || key === '4') return '\x1c';
      if (key === ']' || key === '5') return '\x1d';
      if (key === '^' || key === '6') return '\x1e';
      if (key === '_' || key === '-' || key === '7') return '\x1f';
      if (key === '?' || key === '8') return '\x7f';
      return null;
    }
    if (e.altKey && optionMeta) return '\x1b' + (e.ctrlKey && /^[a-z]$/i.test(key) ? String.fromCharCode(key.toLowerCase().charCodeAt(0) - 96) : key);
    return key;
  }

  /* mouse: type 'down'|'up'|'move'|'drag'|'wheel'; button 0 left 1 middle 2 right, wheel 64 up 65 down */
  function encodeMouse(type, button, mods, col, row, px, py, term) {
    var md = term.modes;
    if (!md.mouse) return null;
    if (type === 'move' && md.mouse !== 1003) return null;
    if (type === 'drag' && md.mouse < 1002) return null;
    if (md.mouse === 9 && type !== 'down') return null;
    var b = type === 'wheel' ? button : button;
    if (type === 'move') b = 35; else if (type === 'drag') b = button + 32;
    if (mods & 1) b |= 4; if (mods & 2) b |= 8; if (mods & 4) b |= 16;
    if (md.mouseSgr) {
      var x = md.mousePixels ? Math.round(px) : col + 1, y = md.mousePixels ? Math.round(py) : row + 1;
      return CSI + '<' + b + ';' + x + ';' + y + (type === 'up' ? 'm' : 'M');
    }
    if (type === 'up') b = 3 | (b & ~3);
    if (col > 222 || row > 222) return null;
    return CSI + 'M' + String.fromCharCode(32 + b, 33 + col, 33 + row);
  }

  /* Paste: normalise line endings, drop control characters other than tab and newline (so a pasted
     ESC[201~ cannot end bracketed paste early), wrap when the program asked for bracketed paste. */
  function encodePaste(text, term) {
    var t = String(text).replace(/\r\n?/g, '\n');
    t = t.replace(/[\x00-\x08\x0b-\x1f\x7f\x80-\x9f]/g, '');
    t = t.replace(/\n/g, '\r');
    if (term.modes.bracketedPaste) return CSI + '200~' + t + CSI + '201~';
    return t;
  }
  function focus(on, term) { return term.modes.focusEvents ? CSI + (on ? 'I' : 'O') : null; }

  T.Input = { encodeKey: encodeKey, encodeMouse: encodeMouse, encodePaste: encodePaste, focus: focus, modBits: modBits };
})();
