/* ============================================================================
   Kimi K3 — passive spellcheck (window.K3Spell). No CSS of its own: the
   context menu reuses the K3UI popup family and the native
   spellcheck="true" underline stays untouched (already themed in base.css).

   Behavior (packet 06):
   - Right-click a word in the composer textarea -> suggestion menu.
   - Suggestions come from a small demo dictionary only; an unknown word with
     no dictionary entry gets Ignore/Add rows and NO fake suggestions.
   - Actions: Replace once, Ignore once, Ignore for this draft, Add to
     personal dictionary, Add to project dictionary, Disable spell check in
     this thread, and an opt-in "Grammar suggestions" toggle
     (persisted at spell.grammar).
   - Skips: URLs, paths, shell-ish tokens, hashes, identifiers, code-ish
     tokens (camelCase / snake_case / digit mixes, ALL-CAPS), and known
     PM provider/model/Persona/tool names (catalog-derived + fixed list).
   - NO autocorrect, NO toolbar button. Dictionary/toggle writes emit
     'spell-changed' on the K3 data channel.
   ========================================================================== */
(function () {
  'use strict';

  // Demo misspelling map (lowercase word -> correction).
  var DICTIONARY = {
    'teh': 'the',
    'recieve': 'receive',
    'occured': 'occurred',
    'seperate': 'separate'
  };

  // Grammar fixture: when grammar is opted-in and the draft contains this
  // exact sentence, offer the single style fix 'need' -> 'needs'.
  var GRAMMAR_FIXTURE = 'The settings page need a route picker.';
  var GRAMMAR_WRONG = 'need';
  var GRAMMAR_FIX = 'needs';

  // Known PM/provider/model/Persona/tool vocabulary. The catalog-derived
  // names are merged in at attach time (see knownNames).
  var FIXED_KNOWN = [
    'puppet', 'master', 'kimi', 'moonshot', 'anthropic', 'openai', 'google',
    'xai', 'ollama', 'claude', 'sonnet', 'opus', 'haiku', 'gpt', 'codex',
    'gemini', 'grok', 'qwen', 'persona', 'worktree', 'cli', 'api', 'oauth',
    'mcp', 'localhost', 'truenas', 'json', 'css', 'html', 'tsx', 'typescript',
    'javascript', 'pdf', 'png', 'zip', 'mov', 'xlsx', 'bin', 'ui', 'pm'
  ];
  var SHELL_CMDS = [
    'npm', 'npx', 'node', 'python', 'python3', 'pip', 'git', 'cd', 'ls',
    'dir', 'mkdir', 'rm', 'del', 'docker', 'kubectl', 'curl', 'wget', 'ssh',
    'sudo', 'grep', 'cat', 'echo', 'chmod', 'brew'
  ];

  function emitChanged(threadId, extra) {
    if (!window.K3 || typeof window.K3.emit !== 'function') return;
    window.K3.emit('data', Object.assign({ type: 'spell-changed', threadId: threadId }, extra || {}));
  }

  // Lowercase set of every known name: fixed list + the provider catalog
  // (provider/account/model ids and labels, split into word parts).
  function knownNames(data) {
    var set = {};
    function addWord(w) {
      w = String(w || '').toLowerCase();
      if (w.length > 1) set[w] = true;
    }
    function addName(name) {
      addWord(name);
      String(name || '').toLowerCase().split(/[^a-z]+/).forEach(addWord);
    }
    FIXED_KNOWN.forEach(addWord);
    var catalog = [];
    try { catalog = (data && data.providerCatalog) ? data.providerCatalog() : []; } catch (e) { catalog = []; }
    catalog.forEach(function (p) {
      addName(p.id); addName(p.name);
      (p.accounts || []).forEach(function (a) { addName(a.id); addName(a.label); });
      (p.models || []).forEach(function (m) { addName(m.id); addName(m.label); addName(m.short); });
    });
    return set;
  }

  // --- skip rules ---------------------------------------------------------------
  function isSkippable(word, known) {
    if (!word || word.length < 2) return true;
    var lower = word.toLowerCase();
    if (known[lower]) return true;
    if (/:\/\//.test(word) || /^www\./i.test(word)) return true;          // URL
    if (/[\\/]/.test(word) || /^[A-Za-z]:$/.test(word)) return true;      // path
    if (/^[-$#~]/.test(word)) return true;                                 // shell-ish / hash-tag
    if (SHELL_CMDS.indexOf(lower) >= 0) return true;                       // shell command
    if (/^[0-9a-f]{7,}$/i.test(word)) return true;                         // hash / hex
    if (/^\d+$/.test(word)) return true;                                   // bare number
    if (word.indexOf('_') >= 0) return true;                               // snake_case
    if (/[a-z][A-Z]/.test(word)) return true;                              // camelCase
    if (/\d/.test(word) && /[a-z]/i.test(word)) return true;               // digit+letter mix
    if (word.length >= 2 && word === word.toUpperCase() && /[A-Z]/.test(word)) return true; // acronym
    return false;
  }

  // Word bounds around a caret position inside textarea.value.
  function wordAt(text, pos) {
    var isWordChar = function (ch) { return /[A-Za-z']/.test(ch); };
    var start = pos, end = pos;
    while (start > 0 && isWordChar(text.charAt(start - 1))) start--;
    while (end < text.length && isWordChar(text.charAt(end))) end++;
    if (start === end) return null;
    return { start: start, end: end, word: text.slice(start, end) };
  }

  // Whitespace-bounded token around the caret. Checked BEFORE wordAt so a
  // caret inside a URL/path/command never opens the menu on an inner
  // alphabetic fragment ('example' inside 'https://example.com').
  function tokenAt(text, pos) {
    var start = pos, end = pos;
    while (start > 0 && !/\s/.test(text.charAt(start - 1))) start--;
    while (end < text.length && !/\s/.test(text.charAt(end))) end++;
    return { start: start, end: end, token: text.slice(start, end) };
  }
  function isSkippableToken(token) {
    if (!token) return true;
    if (/:\/\//.test(token) || /^www\./i.test(token)) return true;      // URL
    if (/[\\/]/.test(token) || /^[A-Za-z]:/.test(token)) return true;   // path
    if (/^[-$#~]/.test(token)) return true;                             // shell-ish
    if (/^[{["'<(]/.test(token)) return true;                           // structured data
    if (/^[0-9a-f]{7,}$/i.test(token) && /\d/.test(token)) return true; // hash
    if (/^[\w-]+@[\w-]+\.[\w.]+$/.test(token)) return true;             // email-ish
    if (/=/.test(token)) return true;                                   // key=value
    return false;
  }
  // The token immediately before the current one (shell-command context:
  // right-clicking 'install' in 'npm install' stays silent).
  function previousToken(text, tokenStart) {
    var end = tokenStart;
    while (end > 0 && /\s/.test(text.charAt(end - 1))) end--;
    var start = end;
    while (start > 0 && !/\s/.test(text.charAt(start - 1))) start--;
    return text.slice(start, end);
  }

  function replaceInTextarea(textarea, start, end, replacement) {
    textarea.focus();
    if (typeof textarea.setRangeText === 'function') {
      textarea.setRangeText(replacement, start, end, 'end');
    } else {
      textarea.value = textarea.value.slice(0, start) + replacement + textarea.value.slice(end);
      textarea.selectionStart = textarea.selectionEnd = start + replacement.length;
    }
    // The composer saves drafts on 'input' — setRangeText does not fire one.
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function iconName(name) {
    var reg = window.K3Icons;
    return (reg && typeof reg.has === 'function' && reg.has(name)) ? name : null;
  }

  // --- public API -------------------------------------------------------------------
  var K3Spell = {
    attach: function (ctx, textarea) {
      var store = ctx.store;
      var data = ctx.data;
      var known = knownNames(data);

      function tid() { return store.get('activeThreadId', null); }
      function isDisabled() {
        var id = tid();
        return !!id && store.get('spell.threadDisabled.' + id, false) === true;
      }
      function inDictionary(lower) {
        var id = tid();
        if ((store.get('spell.personal', []) || []).indexOf(lower) >= 0) return true;
        if ((store.get('spell.project', []) || []).indexOf(lower) >= 0) return true;
        if (id && (store.get('spell.ignoredDraft.' + id, []) || []).indexOf(lower) >= 0) return true;
        return false;
      }
      function pushUnique(path, value) {
        var list = (store.get(path, []) || []).slice();
        if (list.indexOf(value) < 0) list.push(value);
        store.set(path, list);
      }

      function onContextMenu(e) {
        if (isDisabled()) return; // native menu, no PM spell menu
        var text = textarea.value || '';
        var hit = null;
        if (textarea.selectionStart !== textarea.selectionEnd) {
          var sel = text.slice(textarea.selectionStart, textarea.selectionEnd);
          if (/^[A-Za-z']+$/.test(sel)) {
            hit = { start: textarea.selectionStart, end: textarea.selectionEnd, word: sel };
          }
        }
        if (!hit) hit = wordAt(text, textarea.selectionStart || 0);
        if (!hit) return;
        // Token-level skip first: URLs, paths, shell-ish, hashes, structured
        // data — the caret may sit on an alphabetic fragment inside them.
        var tok = tokenAt(text, hit.start);
        if (isSkippableToken(tok.token)) return;
        if (SHELL_CMDS.indexOf(previousToken(text, tok.start).toLowerCase()) >= 0) return;
        var lower = hit.word.toLowerCase();
        if (isSkippable(hit.word, known) || inDictionary(lower)) return;

        e.preventDefault();
        var id = tid();
        var items = [];

        // Suggestion rows only when the demo dictionary actually has one —
        // unknown words never get invented corrections.
        var suggestion = DICTIONARY[lower] || null;
        if (suggestion) {
          items.push({
            icon: iconName('spell') || iconName('edit'),
            label: suggestion,
            hint: 'Replace once',
            testid: 'k3spell-replace',
            action: function () { replaceInTextarea(textarea, hit.start, hit.end, suggestion); }
          });
        }

        // Opt-in grammar: the fixture sentence earns exactly one style row.
        var grammarOn = store.get('spell.grammar', false) === true;
        if (grammarOn && text.indexOf(GRAMMAR_FIXTURE) >= 0) {
          var at = text.indexOf(GRAMMAR_FIXTURE) + GRAMMAR_FIXTURE.indexOf(' ' + GRAMMAR_WRONG + ' ') + 1;
          items.push({
            icon: iconName('spell') || iconName('edit'),
            label: GRAMMAR_FIX,
            hint: 'Style suggestion',
            testid: 'k3spell-grammar',
            action: function () { replaceInTextarea(textarea, at, at + GRAMMAR_WRONG.length, GRAMMAR_FIX); }
          });
        }

        items.push({ label: 'Ignore once', action: function () {} });
        items.push({
          label: 'Ignore for this draft',
          action: function () {
            if (!id) return;
            pushUnique('spell.ignoredDraft.' + id, lower);
            emitChanged(id, { kind: 'ignore-draft', word: lower });
          }
        });
        items.push({
          label: 'Add to personal dictionary',
          action: function () {
            pushUnique('spell.personal', lower);
            emitChanged(id, { kind: 'personal', word: lower });
          }
        });
        items.push({
          label: 'Add to project dictionary',
          action: function () {
            pushUnique('spell.project', lower);
            emitChanged(id, { kind: 'project', word: lower });
          }
        });
        items.push({ type: 'separator' });
        items.push({
          label: 'Disable spell check in this thread',
          action: function () { K3Spell.toggleThread(id, true); }
        });
        items.push({ type: 'separator' });
        items.push({
          label: 'Grammar suggestions',
          hint: grammarOn ? 'On' : 'Off',
          selected: grammarOn,
          testid: 'k3spell-grammar-toggle',
          action: function () {
            store.set('spell.grammar', !grammarOn);
            emitChanged(id, { kind: 'grammar', enabled: !grammarOn });
          }
        });

        window.K3UI.menu(textarea, items, { width: 250 });
      }

      textarea.addEventListener('contextmenu', onContextMenu);
      return {
        detach: function () { textarea.removeEventListener('contextmenu', onContextMenu); }
      };
    },

    // Window-kit "more" menu item: quiet per-thread opt-out (and re-enable).
    toggleThread: function (threadId, disabled) {
      if (!threadId) return false;
      var store = window.K3Store;
      if (store && typeof store.set === 'function') {
        store.set('spell.threadDisabled.' + threadId, !!disabled);
      }
      emitChanged(threadId, { kind: 'thread-disabled', disabled: !!disabled });
      return !!disabled;
    }
  };

  window.K3Spell = K3Spell;
})();
