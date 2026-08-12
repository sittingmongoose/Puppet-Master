/* PMX spellcheck — Opus 5
 *
 * Passive, local, advisory spellcheck for the composer. The packet
 * (06_COMPOSER_SPELLCHECK_AND_THREAD_LOCAL_STATE.md:5-32) allows exactly five explicit user
 * actions and forbids two things absolutely: automatic replacement, and a permanent Chat
 * toolbar button. Both prohibitions are structural here rather than a matter of discipline:
 *   - `replaceOnce` is the ONLY member that returns modified text, and it still does not write
 *     it anywhere. The composer owns the draft; this module never touches it. There is no code
 *     path that can rewrite a character the user did not ask to have rewritten.
 *   - There is no toolbar state to render, because the only enable/disable control is the quiet
 *     thread-overflow item that calls `setEnabledFor`.
 *
 * This file is logic only. The wavy underline layer and the suggestion popup belong to the
 * composer (Phase C); a Phase B service never touches the DOM. That split is why `check` returns
 * plain offsets — a renderer can mirror them onto a text layer, and a test can assert them
 * without a browser.
 *
 * `skipRanges` is exported rather than kept private because the ten skip categories are ten
 * separate requirements, and Phase G asserts each one directly against real text. Keeping the
 * rule set reachable is the difference between "we believe code blocks are skipped" and a
 * failing assertion when they are not.
 */
(function (global) {
  'use strict';

  var store = null, data = null;

  /* Occurrence ignores are deliberately NOT persisted and NOT in the store.
   * "Ignore once" means this instance, at this offset, in the draft as it stands. The moment the
   * user types before it the offsets shift and the ignore lapses — which is the honest behavior,
   * because the second occurrence of a word is a different decision from the first. A persisted
   * offset would silently suppress an unrelated word later. Word-level suppression that should
   * survive editing is `ignoreForDraft`, which is stored. */
  var ignoredOccurrences = {};

  /* Twenty-four misspellings whose corrections are all words that occur in the fixture prose of
   * thread-01 (Tastebook planning) and thread-04 (Provider routing setup). Seeding from the
   * corpus rather than from a generic word list is what makes the demo and the Phase G probe
   * deterministic: a scripted draft that reuses the conversation's own vocabulary produces the
   * same hits every run, on every host, with no dictionary download. */
  var DICTIONARY = {
    seperate: ['separate', 'separated', 'desperate'],
    provder: ['provider', 'providers', 'provided'],
    converstaion: ['conversation', 'conversations'],
    assistent: ['assistant', 'assistants', 'assistance'],
    slector: ['selector', 'selectors', 'sector'],
    messsage: ['message', 'messages'],
    visable: ['visible', 'visibly', 'viable'],
    compleate: ['complete', 'completed', 'compete'],
    concpet: ['concept', 'concepts'],
    popuup: ['popup', 'popups'],
    menues: ['menus', 'menu'],
    reciepe: ['recipe', 'recipes', 'receipt'],
    ordinaray: ['ordinary', 'ordinarily'],
    presrve: ['preserve', 'preserved', 'preserves'],
    reveiw: ['review', 'reviews', 'revise'],
    minimun: ['minimum', 'minimal'],
    activty: ['activity', 'activities', 'active'],
    subagnet: ['subagent', 'subagents'],
    metdata: ['metadata'],
    narow: ['narrow', 'narrower', 'arrow'],
    contol: ['control', 'controls', 'contour'],
    serach: ['search', 'searches', 'searched'],
    widht: ['width', 'widths', 'wide'],
    avaliable: ['available', 'availability']
  };

  var SOURCES = ['automatic', 'system', 'pm-local'];

  function bind(s, d) {
    store = s || null;
    data = d || null;
    return api;
  }

  /* ------------------------------------------------------------------ store access
   * Every read tolerates an unbound or half-built store, because boot binds services before the
   * corpus resolves and a render must never crash on the gap. */

  function spellSlice() {
    var s = store && store.get ? store.get('session.spell') : null;
    if (!s) return { enabled: true, disabledThreads: {}, ignoredInDraft: {}, personal: [], project: [], source: 'automatic', language: 'en-US' };
    if (!s.disabledThreads) s.disabledThreads = {};
    if (!s.ignoredInDraft) s.ignoredInDraft = {};
    if (!s.personal) s.personal = [];
    if (!s.project) s.project = [];
    return s;
  }

  function announce() { if (store && store.touchView) store.touchView('spell'); }

  function draftText(threadId) {
    if (!store || !store.view || !threadId) return '';
    var v = store.view(threadId);
    return (v && v.draft && typeof v.draft.text === 'string') ? v.draft.text : '';
  }

  /* ------------------------------------------------------------------ enable / source */

  function enabledFor(threadId) {
    var s = spellSlice();
    if (!s.enabled) return false;
    return !s.disabledThreads[threadId];
  }

  function setEnabledFor(threadId, on) {
    if (!store || !threadId) return false;
    var s = spellSlice();
    if (on) delete s.disabledThreads[threadId];
    else s.disabledThreads[threadId] = true;
    store.set('session.spell.disabledThreads', s.disabledThreads);
    announce();
    return true;
  }

  /* 'automatic' is OS-then-PM-local, and the resolution is shown rather than guessed at
   * (06_...:34-40). This module implements only the PM-local list, so the source is recorded for
   * the surface that has to state which dictionary answered. */
  function setSource(src) {
    if (SOURCES.indexOf(src) === -1) return false;
    if (!store) return false;
    store.set('session.spell.source', src);
    announce();
    return true;
  }

  /* ------------------------------------------------------------------ dictionaries */

  function normalizeWord(w) { return String(w == null ? '' : w).toLowerCase(); }

  function inList(list, word) {
    for (var i = 0; i < list.length; i++) {
      if (normalizeWord(list[i]) === word) return true;
    }
    return false;
  }

  function addPersonal(word) {
    var w = normalizeWord(word);
    if (!w || !store) return false;
    var s = spellSlice();
    if (inList(s.personal, w)) return true;
    s.personal.push(w);
    store.set('session.spell.personal', s.personal);
    announce();
    return true;
  }

  /* The project dictionary is shared state owned by a project, so it is writable only from a
   * thread that actually belongs to one. Returning the reason alongside the verdict is the point:
   * 06_...:13 says "Add to project dictionary WHEN PERMITTED", and CONTRACT §8 forbids a control
   * that vanishes or sits disabled without saying why. Callers branch on `.ok` and render
   * `.reason` as the disabled hint. */
  function canAddProject() {
    if (!store || !data || !data.threadById) {
      return { ok: false, reason: 'The project dictionary is unavailable until the workspace finishes loading.' };
    }
    var tid = store.get('session.activeThreadId');
    var thread = tid ? data.threadById(tid) : null;
    if (!thread) {
      return { ok: false, reason: 'The project dictionary is unavailable until the workspace finishes loading.' };
    }
    if (!thread.project || thread.project === 'Personal project') {
      return { ok: false, reason: 'This chat is not in a project. Add the word to your personal dictionary instead.' };
    }
    return { ok: true, reason: null };
  }

  function addProject(word) {
    var permitted = canAddProject();
    if (!permitted.ok) return false;
    var w = normalizeWord(word);
    if (!w) return false;
    var s = spellSlice();
    if (inList(s.project, w)) return true;
    s.project.push(w);
    store.set('session.spell.project', s.project);
    announce();
    return true;
  }

  /* ------------------------------------------------------------------ ignores */

  function occurrenceKey(hit) {
    return normalizeWord(hit && hit.word) + '@' + (hit ? hit.start : -1);
  }

  function ignoreOnce(threadId, hit) {
    if (!threadId || !hit || typeof hit.start !== 'number') return false;
    if (!ignoredOccurrences[threadId]) ignoredOccurrences[threadId] = {};
    ignoredOccurrences[threadId][occurrenceKey(hit)] = true;
    announce();
    return true;
  }

  function ignoreForDraft(threadId, word) {
    var w = normalizeWord(word);
    if (!threadId || !w || !store) return false;
    var s = spellSlice();
    if (!s.ignoredInDraft[threadId]) s.ignoredInDraft[threadId] = {};
    s.ignoredInDraft[threadId][w] = true;
    store.set('session.spell.ignoredInDraft', s.ignoredInDraft);
    announce();
    return true;
  }

  function ignoredInDraft(threadId, word) {
    var s = spellSlice();
    var per = s.ignoredInDraft[threadId];
    return !!(per && per[word]);
  }

  /* ------------------------------------------------------------------ known names
   * Provider, account, model, Persona and tool names are proper nouns of the product, not of
   * English. Underlining `Anthropic` or `Qwen` would train the user to ignore the underline
   * entirely, which is how a passive signal dies. Names are read from the owning services through
   * guarded lookups so this module never holds a second copy of the route catalog. */

  function pushName(list, value) {
    var s = String(value == null ? '' : value).trim();
    if (!s) return;
    list.push(s);
    /* Multi-word labels also contribute their own tokens, so `Anthropic — Work` protects
     * `Anthropic` on its own and `GPT-5.6 Pro` protects `GPT`. */
    var parts = s.split(/[^A-Za-z0-9.+-]+/);
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].length >= 3) list.push(parts[i]);
    }
  }

  function knownNames() {
    var names = [], i, j, arr, acc;

    var route = global.PMXRoute;
    if (route) {
      if (route.providers) {
        arr = route.providers() || [];
        for (i = 0; i < arr.length; i++) { pushName(names, arr[i].name || arr[i].id); }
      }
      if (route.accounts) {
        acc = route.accounts() || [];
        for (i = 0; i < acc.length; i++) {
          pushName(names, acc[i].label || acc[i].id);
          if (route.models) {
            arr = route.models(acc[i].id) || [];
            for (j = 0; j < arr.length; j++) { pushName(names, arr[j].name || arr[j].id); }
          }
        }
      }
    }

    var sel = global.PMXSelectors;
    if (sel && sel.PERSONAS) {
      for (i = 0; i < sel.PERSONAS.length; i++) pushName(names, sel.PERSONAS[i]);
    }

    /* Tool names come from the operational-awareness service. It owns the environment vocabulary;
     * asking it beats hard-coding a list that drifts the moment a tool family is renamed. */
    var ops = global.PMXOps;
    if (ops) {
      if (typeof ops.toolNames === 'function') {
        arr = ops.toolNames() || [];
        for (i = 0; i < arr.length; i++) pushName(names, arr[i]);
      }
      if (typeof ops.ports === 'function') {
        arr = ops.ports() || [];
        for (i = 0; i < arr.length; i++) pushName(names, arr[i].service);
      }
      if (typeof ops.sessions === 'function') {
        arr = ops.sessions() || [];
        for (i = 0; i < arr.length; i++) pushName(names, arr[i].label || arr[i].kind);
      }
    }

    return names;
  }

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\\/-]/g, '\\$&'); }

  function byLengthDesc(a, b) { return b.length - a.length; }

  /* ------------------------------------------------------------------ skip ranges */

  var FENCED = /```[\s\S]*?```|```[\s\S]*$/g;
  var INLINE_CODE = /`[^`\n]*`/g;
  var URL = /\bhttps?:\/\/\S+/g;
  var PATH = /(?:[A-Za-z]:)?[\\\/][\w.\-\\\/]+/g;
  var SHELL_LINE = /^[ \t]*(?:\$|>) .*$/gm;
  var HEX = /\b[0-9a-f]{7,}\b/gi;
  var IDENTIFIER = /\b\w+(?:[_.][\w]+)+\b|\b[a-z]+[A-Z]\w*\b/g;
  var STRUCTURED = /^[ \t]*[[{].*$|^[ \t]*[\w.\-]+[ \t]*:[ \t]*\S.*$/gm;
  var QUOTED = /"[^"\n]*"|\u201C[^\u201D\n]*\u201D/g;

  /* Each category runs against a copy in which every range found so far has been blanked to
   * spaces (newlines kept, so the line-anchored rules still see line structure). Masking is what
   * makes the documented ORDER meaningful: a URL inside a fenced block is already gone by the
   * time the URL rule runs, so it is skipped once, not twice, and a stray backtick before a fence
   * cannot pair across the fence and swallow the prose in between. */
  function maskRange(masked, start, end) {
    var blank = '';
    for (var i = start; i < end; i++) blank += (masked.charAt(i) === '\n' ? '\n' : ' ');
    return masked.slice(0, start) + blank + masked.slice(end);
  }

  function collect(masked, re, ranges) {
    re.lastIndex = 0;
    var m, out = masked;
    while ((m = re.exec(masked)) !== null) {
      if (m[0].length === 0) { re.lastIndex++; continue; }
      ranges.push([m.index, m.index + m[0].length]);
      out = maskRange(out, m.index, m.index + m[0].length);
    }
    return out;
  }

  function collectNames(masked, names, ranges) {
    if (!names.length) return masked;
    var unique = {}, list = [], i;
    for (i = 0; i < names.length; i++) {
      var key = names[i].toLowerCase();
      if (!unique[key]) { unique[key] = true; list.push(names[i]); }
    }
    list.sort(byLengthDesc);
    var parts = [];
    for (i = 0; i < list.length; i++) parts.push(escapeRe(list[i]));
    var re = new RegExp(parts.join('|'), 'gi');
    var m, out = masked;
    while ((m = re.exec(masked)) !== null) {
      if (m[0].length === 0) { re.lastIndex++; continue; }
      var s = m.index, e = s + m[0].length;
      /* Only whole names, so `Opus` inside `Opuses` stays checkable. */
      var before = s > 0 ? masked.charAt(s - 1) : ' ';
      var after = e < masked.length ? masked.charAt(e) : ' ';
      if (/[A-Za-z0-9]/.test(before) || /[A-Za-z0-9]/.test(after)) continue;
      ranges.push([s, e]);
      out = maskRange(out, s, e);
    }
    return out;
  }

  function normalizeRanges(ranges) {
    ranges.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    var merged = [];
    for (var i = 0; i < ranges.length; i++) {
      var r = ranges[i];
      if (r[1] <= r[0]) continue;
      var last = merged.length ? merged[merged.length - 1] : null;
      if (last && r[0] <= last[1]) { if (r[1] > last[1]) last[1] = r[1]; }
      else merged.push([r[0], r[1]]);
    }
    return merged;
  }

  /* The ten categories of 06_...:19-30, in the packet's own order. Returns a sorted,
   * non-overlapping list of half-open [start, end) ranges. */
  function skipRanges(text) {
    var t = String(text == null ? '' : text);
    if (!t) return [];
    var ranges = [];
    var masked = t;
    masked = collect(masked, FENCED, ranges);        /* 1  code blocks */
    masked = collect(masked, INLINE_CODE, ranges);   /* 2  inline code */
    masked = collect(masked, URL, ranges);           /* 3  URLs */
    masked = collect(masked, PATH, ranges);          /* 4  paths */
    masked = collect(masked, SHELL_LINE, ranges);    /* 5  shell commands */
    masked = collect(masked, HEX, ranges);           /* 6  hashes */
    masked = collect(masked, IDENTIFIER, ranges);    /* 7  identifiers */
    masked = collect(masked, STRUCTURED, ranges);    /* 8  structured data */
    masked = collect(masked, QUOTED, ranges);        /* 9  literal text */
    collectNames(masked, knownNames(), ranges);      /* 10 known provider/model/Persona/tool names */
    return normalizeRanges(ranges);
  }

  function inRanges(ranges, start, end) {
    for (var i = 0; i < ranges.length; i++) {
      if (ranges[i][0] >= end) return false;   /* sorted: nothing further can overlap */
      if (start < ranges[i][1] && end > ranges[i][0]) return true;
    }
    return false;
  }

  /* ------------------------------------------------------------------ check */

  var WORD = /[A-Za-z][A-Za-z']*/g;

  function check(text, threadId) {
    var t = String(text == null ? '' : text);
    if (!t) return [];
    if (!enabledFor(threadId)) return [];

    var s = spellSlice();
    var ranges = skipRanges(t);
    var perThread = ignoredOccurrences[threadId] || {};
    var hits = [];

    WORD.lastIndex = 0;
    var m;
    while ((m = WORD.exec(t)) !== null) {
      var raw = m[0];
      var start = m.index;
      var end = start + raw.length;
      var word = raw.toLowerCase();
      var suggestions = DICTIONARY[word];
      if (!suggestions) continue;
      if (inRanges(ranges, start, end)) continue;
      if (inList(s.personal, word) || inList(s.project, word)) continue;
      if (ignoredInDraft(threadId, word)) continue;
      if (perThread[word + '@' + start]) continue;
      hits.push({ start: start, end: end, word: raw, suggestions: matchCase(raw, suggestions) });
    }
    return hits;
  }

  /* A suggestion offered for `Seperate` at the head of a sentence must read `Separate`, or
   * accepting it silently lowercases the user's sentence — a change they did not ask for. */
  function matchCase(raw, suggestions) {
    var leadingUpper = raw.charAt(0) === raw.charAt(0).toUpperCase() && raw.charAt(0) !== raw.charAt(0).toLowerCase();
    var out = [];
    for (var i = 0; i < suggestions.length; i++) {
      var sug = suggestions[i];
      out.push(leadingUpper ? sug.charAt(0).toUpperCase() + sug.slice(1) : sug);
    }
    return out;
  }

  /* ------------------------------------------------------------------ replacement
   * The single member in this module that produces changed text. It returns the new string and
   * writes nothing: the composer decides whether the user's draft becomes that string. If the
   * offsets no longer describe the word they were computed for — the user kept typing while the
   * popup was open — the original text is returned untouched rather than corrupting a different
   * word at the same index. */
  function replaceOnce(threadId, hit, suggestion) {
    var text = (hit && typeof hit.text === 'string') ? hit.text : draftText(threadId);
    if (!hit || typeof hit.start !== 'number' || typeof hit.end !== 'number') return text;
    if (hit.start < 0 || hit.end > text.length || hit.end <= hit.start) return text;
    if (typeof hit.word === 'string' && text.slice(hit.start, hit.end) !== hit.word) return text;
    return text.slice(0, hit.start) + String(suggestion == null ? '' : suggestion) + text.slice(hit.end);
  }

  var api = {
    bind: bind,
    check: check,
    replaceOnce: replaceOnce,
    ignoreOnce: ignoreOnce,
    ignoreForDraft: ignoreForDraft,
    addPersonal: addPersonal,
    addProject: addProject,
    canAddProject: canAddProject,
    setSource: setSource,
    enabledFor: enabledFor,
    setEnabledFor: setEnabledFor,
    skipRanges: skipRanges
  };

  global.PMXSpell = api;
})(window);
