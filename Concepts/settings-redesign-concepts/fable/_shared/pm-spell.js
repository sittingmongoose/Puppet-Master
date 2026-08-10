/* pm-spell.js — window.PMSpell
   fable Settings bakeoff shared demo spellchecker.
   Attaches to contenteditable fields, underlines demo misspellings from
   PM_DATA.spell.misspellings, offers a menu (right-click / Cmd+period) with
   replace and dictionary actions. NEVER auto-replaces. Skips code, links,
   paths, hashes, ALL-CAPS, and known provider/model/persona names.
   Slint note: maps to a TextEdit annotation layer plus a popup menu.
   No emoji anywhere. */
(function () {
  'use strict';

  var RESCAN_DEBOUNCE_MS = 350;
  var WORD_RE = /[A-Za-z][A-Za-z']*/g;
  var CSS_ID = 'pm-spell-css';

  var SPELL_CSS = [
    '.pm-spell-miss{',
    'text-decoration-line:underline;text-decoration-style:wavy;',
    'text-decoration-color:var(--accent-warning,#c9973b);',
    'text-decoration-thickness:1px;text-underline-offset:3px;',
    'text-decoration-skip-ink:none;}',
    '.pm-spell-menu{position:fixed;z-index:10000;min-width:230px;padding:4px;',
    'background:var(--surface-elevated,#26262b);color:var(--text-primary,#e8e8ec);',
    'border:1px solid var(--border,#3a3a42);border-radius:var(--radius-md,10px);',
    'box-shadow:var(--elev-3,0 12px 36px rgba(0,0,0,.4));',
    'font-family:var(--body-font,inherit);font-size:var(--fs-sm,13px);}',
    '.pm-spell-menu [role="menuitem"]{display:block;width:100%;text-align:left;',
    'padding:6px 10px;background:none;border:0;border-radius:var(--radius-sm,7px);',
    'color:inherit;font:inherit;cursor:pointer;}',
    '.pm-spell-menu [role="menuitem"]:hover{background:var(--surface-alt,#2e2e34);}',
    '.pm-spell-menu [role="menuitem"]:focus-visible{outline:2px solid var(--accent-primary,#7aa2f7);outline-offset:1px;}',
    '.pm-spell-menu .pm-spell-suggest{font-weight:600;}',
    '.pm-spell-menu .pm-spell-sep{height:1px;margin:4px 6px;',
    'background:var(--border-light,#44444c);}'
  ].join('');

  function injectCssOnce() {
    try {
      if (document.getElementById(CSS_ID)) return;
      var el = document.createElement('style');
      el.id = CSS_ID;
      el.textContent = SPELL_CSS;
      document.head.appendChild(el);
    } catch (e) { /* ignore */ }
  }

  function data() { return (window.PM_DATA && typeof window.PM_DATA === 'object') ? window.PM_DATA : {}; }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function str(x) { return (typeof x === 'string') ? x : ''; }

  function misspellings() {
    var spell = data().spell;
    var m = spell && spell.misspellings;
    return (m && typeof m === 'object') ? m : {};
  }

  /* Known names from the demo data: providers, models, personas. Multiword
     names contribute both the full name and each word. */
  function buildKnownNames() {
    var known = {};
    function addName(n) {
      var low = str(n).toLowerCase();
      if (!low) return;
      known[low] = true;
      low.split(/\s+/).forEach(function (w) { if (w.length > 1) known[w] = true; });
    }
    var d = data();
    arr(d.providers).forEach(function (p) {
      if (!p) return;
      addName(p.name); addName(p.family);
      arr(p.models).forEach(function (m) { if (m) { addName(m.name); addName(m.alias); } });
    });
    arr(d.personas).forEach(function (p) { if (p) addName(p.name); });
    return known;
  }

  /* Skip tests operate on whitespace-delimited chunks so paths and hashes
     are judged as whole tokens, not their letter runs. */
  function chunkIsSkippable(chunk, knownNames) {
    if (!chunk) return true;
    if (chunk.indexOf('/') >= 0 || chunk.indexOf('\\') >= 0) return true;    // path-like
    if ((chunk.match(/\./g) || []).length >= 2) return true;                  // dotted id / path-like
    if (/^#/.test(chunk)) return true;                                        // hash-like
    if (/^[0-9a-fA-F]{7,}$/.test(chunk)) return true;                         // hex hash
    var letters = chunk.replace(/[^A-Za-z]/g, '');
    if (letters.length > 1 && letters === letters.toUpperCase()) return true; // ALL-CAPS
    var bare = chunk.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, '').toLowerCase();
    if (bare && knownNames[bare]) return true;                                // known name
    return false;
  }

  function nodeInSkippedRegion(node, root) {
    var el = node.parentNode;
    while (el && el !== root) {
      if (el.nodeType === 1) {
        var tag = el.tagName;
        if (tag === 'CODE' || tag === 'PRE' || tag === 'KBD' || tag === 'A') return true;
        if (el.getAttribute && el.getAttribute('data-no-spell') != null) return true;
      }
      el = el.parentNode;
    }
    return false;
  }

  /* ----- caret save/restore by absolute character offset within root ----- */

  function textWalker(root) {
    return document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  }

  function caretOffset(root) {
    try {
      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return null;
      var range = sel.getRangeAt(0);
      if (!root.contains(range.startContainer)) return null;
      var pre = range.cloneRange();
      pre.selectNodeContents(root);
      pre.setEnd(range.startContainer, range.startOffset);
      return pre.toString().length;
    } catch (e) { return null; }
  }

  function restoreCaret(root, offset) {
    if (offset == null) return;
    try {
      var walker = textWalker(root);
      var remaining = offset;
      var node = walker.nextNode();
      var last = null;
      while (node) {
        last = node;
        var len = node.nodeValue.length;
        if (remaining <= len) {
          var range = document.createRange();
          range.setStart(node, remaining);
          range.collapse(true);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          return;
        }
        remaining -= len;
        node = walker.nextNode();
      }
      if (last) {
        var r2 = document.createRange();
        r2.setStart(last, last.nodeValue.length);
        r2.collapse(true);
        var s2 = window.getSelection();
        s2.removeAllRanges();
        s2.addRange(r2);
      }
    } catch (e) { /* caret restore is best-effort */ }
  }

  /* ---------------- attach ---------------- */

  function attach(el, opts) {
    if (!el || el.nodeType !== 1) return null;
    opts = opts || {};
    var store = opts.store || null;
    var projectDict = opts.projectDict !== false;

    injectCssOnce();
    try { el.setAttribute('spellcheck', 'false'); } catch (e) { /* ignore */ }

    var knownNames = buildKnownNames();
    var ignoredDraft = {};        // word -> true, for the life of this draft
    var ignoredOnceBudget = {};   // word -> occurrences to skip on scans
    var debounceTimer = 0;
    var menuEl = null;
    var detached = false;
    var enabled = true;

    function dictWords() {
      var out = {};
      var spell = data().spell || {};
      arr(spell.personal).forEach(function (w) { out[str(w).toLowerCase()] = true; });
      arr(spell.project).forEach(function (w) { out[str(w).toLowerCase()] = true; });
      if (store) {
        arr(store.get('spell.personal')).forEach(function (w) { out[str(w).toLowerCase()] = true; });
        arr(store.get('spell.project')).forEach(function (w) { out[str(w).toLowerCase()] = true; });
      }
      return out;
    }

    function unwrapSpan(span) {
      var parent = span.parentNode;
      if (!parent) return;
      while (span.firstChild) parent.insertBefore(span.firstChild, span);
      parent.removeChild(span);
      parent.normalize();
    }

    function unwrapAll(word) {
      var spans = el.querySelectorAll('.pm-spell-miss');
      for (var i = 0; i < spans.length; i++) {
        if (word == null || spans[i].getAttribute('data-word') === word) {
          unwrapSpan(spans[i]);
        }
      }
    }

    function scan() {
      if (detached || !enabled) return;
      var map = misspellings();
      var dicts = dictWords();
      var onceBudget = {};
      Object.keys(ignoredOnceBudget).forEach(function (k) { onceBudget[k] = ignoredOnceBudget[k]; });

      var hadFocus = el.contains(document.activeElement) || document.activeElement === el;
      var caret = hadFocus ? caretOffset(el) : null;

      unwrapAll();
      try { el.normalize(); } catch (e) { /* ignore */ }

      // Collect text nodes first; wrapping splits nodes and would confuse a live walker.
      var nodes = [];
      var walker = textWalker(el);
      var n = walker.nextNode();
      while (n) { nodes.push(n); n = walker.nextNode(); }

      nodes.forEach(function (node) {
        if (nodeInSkippedRegion(node, el)) return;
        var text = node.nodeValue;
        if (!text) return;

        var ranges = []; // {start, end, word, suggest}
        var chunkRe = /\S+/g;
        var chunk;
        while ((chunk = chunkRe.exec(text)) !== null) {
          if (chunkIsSkippable(chunk[0], knownNames)) continue;
          WORD_RE.lastIndex = 0;
          var m;
          while ((m = WORD_RE.exec(chunk[0])) !== null) {
            var word = m[0];
            var low = word.toLowerCase();
            var suggest = map[low];
            if (!suggest) continue;
            if (dicts[low] || ignoredDraft[low]) continue;
            if (onceBudget[low] > 0) { onceBudget[low]--; continue; }
            ranges.push({
              start: chunk.index + m.index,
              end: chunk.index + m.index + word.length,
              word: low,
              suggest: suggest
            });
          }
        }

        // Wrap right-to-left so earlier indices stay valid.
        for (var i = ranges.length - 1; i >= 0; i--) {
          var r = ranges[i];
          try {
            var tail = node.splitText(r.end); // eslint-disable-line no-unused-vars
            var mid = node.splitText(r.start);
            var span = document.createElement('span');
            span.className = 'pm-spell-miss';
            span.setAttribute('data-word', r.word);
            span.setAttribute('data-suggest', r.suggest);
            node.parentNode.insertBefore(span, mid);
            span.appendChild(mid);
          } catch (e) { /* skip this range on any DOM surprise */ }
        }
      });

      if (hadFocus) restoreCaret(el, caret);
    }

    function scheduleScan() {
      if (debounceTimer) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(function () {
        debounceTimer = 0;
        scan();
      }, RESCAN_DEBOUNCE_MS);
    }

    /* ---------------- persistence + receipts ---------------- */

    function persistAdd(kind, word) {
      var key = kind === 'project' ? 'spell.project' : 'spell.personal';
      if (store) {
        var list = arr(store.get(key)).slice();
        if (list.indexOf(word) < 0) list.push(word);
        store.set(key, list);
      }
      var label = kind === 'project' ? 'Add to project dictionary' : 'Add to personal dictionary';
      try {
        if (window.PMState && typeof window.PMState.receipt === 'function') {
          window.PMState.receipt(label, '"' + word + '" will no longer be flagged.');
        } else if (store) {
          store.emit('receipt', { simulated: true, message: 'Simulated: ' + label + ' — "' + word + '"' });
        }
      } catch (e) { /* ignore */ }
    }

    /* ---------------- menu ---------------- */

    function closeMenu(refocus) {
      if (!menuEl) return;
      var m = menuEl;
      menuEl = null;
      try { m.parentNode && m.parentNode.removeChild(m); } catch (e) { /* ignore */ }
      document.removeEventListener('mousedown', onDocDown, true);
      if (refocus) { try { el.focus(); } catch (e) { /* ignore */ } }
    }

    function onDocDown(e) {
      if (menuEl && !menuEl.contains(e.target)) closeMenu(false);
    }

    function menuItem(label, strong, onPick) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'menuitem');
      if (strong) b.className = 'pm-spell-suggest';
      b.textContent = label;
      b.addEventListener('click', function () {
        closeMenu(true);
        try { onPick(); } catch (e) { /* ignore */ }
      });
      return b;
    }

    function openMenu(span, x, y) {
      closeMenu(false);
      var word = span.getAttribute('data-word') || '';
      var suggest = span.getAttribute('data-suggest') || '';

      var menu = document.createElement('div');
      menu.className = 'pm-spell-menu';
      menu.setAttribute('role', 'menu');
      menu.setAttribute('aria-label', 'Spelling suggestions');

      if (suggest) {
        menu.appendChild(menuItem('Replace with "' + suggest + '"', true, function () {
          // Explicit user choice: the only path that changes text.
          span.textContent = suggest;
          unwrapSpan(span);
        }));
        var sep = document.createElement('div');
        sep.className = 'pm-spell-sep';
        sep.setAttribute('role', 'separator');
        menu.appendChild(sep);
      }
      menu.appendChild(menuItem('Ignore once', false, function () {
        ignoredOnceBudget[word] = (ignoredOnceBudget[word] || 0) + 1;
        unwrapSpan(span);
      }));
      menu.appendChild(menuItem('Ignore for draft', false, function () {
        ignoredDraft[word] = true;
        unwrapAll(word);
      }));
      menu.appendChild(menuItem('Add to personal dictionary', false, function () {
        persistAdd('personal', word);
        unwrapAll(word);
      }));
      if (projectDict) {
        menu.appendChild(menuItem('Add to project dictionary', false, function () {
          persistAdd('project', word);
          unwrapAll(word);
        }));
      }

      menu.addEventListener('keydown', function (e) {
        var items = Array.prototype.slice.call(menu.querySelectorAll('[role="menuitem"]'));
        var idx = items.indexOf(document.activeElement);
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeMenu(true); return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); items[(idx + 1) % items.length].focus(); return; }
        if (e.key === 'ArrowUp') { e.preventDefault(); items[(idx - 1 + items.length) % items.length].focus(); return; }
        if (e.key === 'Tab') { e.preventDefault(); closeMenu(true); }
      });

      document.body.appendChild(menu);
      // Clamp into the viewport after measuring.
      var rect = menu.getBoundingClientRect();
      var left = Math.min(x, window.innerWidth - rect.width - 8);
      var top = Math.min(y, window.innerHeight - rect.height - 8);
      menu.style.left = Math.max(8, left) + 'px';
      menu.style.top = Math.max(8, top) + 'px';

      menuEl = menu;
      document.addEventListener('mousedown', onDocDown, true);
      var first = menu.querySelector('[role="menuitem"]');
      if (first) first.focus();
    }

    function spanFromCaret() {
      try {
        var sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;
        var node = sel.getRangeAt(0).startContainer;
        var e = node.nodeType === 1 ? node : node.parentNode;
        while (e && e !== el) {
          if (e.nodeType === 1 && e.classList && e.classList.contains('pm-spell-miss')) return e;
          e = e.parentNode;
        }
      } catch (e2) { /* ignore */ }
      return null;
    }

    /* ---------------- listeners ---------------- */

    function onInput() { scheduleScan(); }

    function onContextMenu(e) {
      var t = e.target;
      var span = null;
      while (t && t !== el) {
        if (t.nodeType === 1 && t.classList && t.classList.contains('pm-spell-miss')) { span = t; break; }
        t = t.parentNode;
      }
      if (!span) return; // native menu elsewhere in the field
      e.preventDefault();
      openMenu(span, e.clientX, e.clientY);
    }

    function onKeyDown(e) {
      var wantsMenu = (e.key === '.' && (e.metaKey || e.ctrlKey)) || e.key === 'ContextMenu';
      if (!wantsMenu) return;
      var span = spanFromCaret();
      if (!span) return;
      e.preventDefault();
      var rect = span.getBoundingClientRect();
      openMenu(span, rect.left, rect.bottom + 4);
    }

    function onBlurCapture(e) {
      // Keep the menu open when focus moves into it.
      if (menuEl && e.relatedTarget && menuEl.contains(e.relatedTarget)) return;
    }

    el.addEventListener('input', onInput);
    el.addEventListener('contextmenu', onContextMenu);
    el.addEventListener('keydown', onKeyDown);
    el.addEventListener('blur', onBlurCapture);

    // Initial pass over any seeded content.
    scan();

    return {
      rescan: scan,
      setEnabled: function (on) {
        enabled = on !== false;
        if (!enabled) { closeMenu(false); unwrapAll(); }
        else scan();
      },
      detach: function () {
        detached = true;
        closeMenu(false);
        if (debounceTimer) window.clearTimeout(debounceTimer);
        el.removeEventListener('input', onInput);
        el.removeEventListener('contextmenu', onContextMenu);
        el.removeEventListener('keydown', onKeyDown);
        el.removeEventListener('blur', onBlurCapture);
        unwrapAll();
      }
    };
  }

  window.PMSpell = {
    attach: attach
  };
})();
