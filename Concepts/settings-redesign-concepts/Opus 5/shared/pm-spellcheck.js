/* Opus 5 — passive spellcheck service.
 *
 * Contract from the packet and SPELLCHECK_COMBINED_CONTRACT:
 *   - subtle underline, never an automatic replacement;
 *   - suggestions through the context menu or a keyboard action;
 *   - replace once / ignore once / ignore for draft / add to personal /
 *     add to project;
 *   - no provider call, no usage, no permanent composer button;
 *   - skips code, inline code, URLs, paths, commands, hashes, identifiers,
 *     structured data, known product names, and text marked literal.
 *
 * Detection model: a word is flagged when it is NOT in the dictionary AND it is
 * within edit distance 2 of a dictionary word — i.e. it looks like a typo of
 * something known. An unknown word with no near neighbour is treated as a name
 * or jargon and left alone, which is what "Underline unknown names: Off"
 * (the packet default) means. Turning that option on also flags those.
 *
 * Slint portability: this file is the concept stand-in for a spelling-service
 * abstraction. Production selects an OS service or the PM-local dictionaries
 * behind the same four calls (check, suggest, learn, ignore). The browser's own
 * `spellcheck` attribute is deliberately switched OFF on these fields so that
 * what is on screen is this service, not Chrome's.
 */
(function () {
  "use strict";

  var DICT = ("the be to of and a in that have I it for not on with he as you do at this but his by from " +
    "they we say her she or an will my one all would there their what so up out if about who get which go me " +
    "when make can like time no just him know take people into year your good some could them see other than " +
    "then now look only come its over think also back after use two how our work first well way even new want " +
    "both tell told tells telling ask asks asked asking need needs needed needing help helps helped very much " +
    "many few more less same different next last next previous each every another such where why while until " +
    "before during between through against without within across around often always never sometimes usually " +
    "already still yet again once twice ever else here everything something nothing anything someone anyone " +
    "everyone must should might may shall cannot does did done doing being been am are was were has had having " +
    "let lets letting put puts putting keep keeps keeping keep find finds found finding show shows showed " +
    "shown showing tries tried trying try start starts started starting stop stops stopped stopping run runs " +
    "ran running open opens opened opening close closes closed closing turn turns turned turning move moves " +
    "moved moving read reads reading write writes writing written send sends sent sending leave leaves left " +
    "call calls called calling mean means meant meaning seem seems seemed feel feels felt become becomes " +
    "became bring brings brought hold holds held stand stands stood lose loses lost pay pays paid meet meets " +
    "met include includes included including continue continues continued set sets setting learn learns " +
    "learned change changes changing lead leads led understand understands understood watch watches watched " +
    "follow follows followed stop create creates creating remove removes removing choose chooses chose chosen " +
    "because any these give day most us setting settings model models provider providers account accounts " +
    "connection connections agent agents context memory persona personas crew skill skills plugin plugins " +
    "tool tools command commands terminal profile profiles server servers catalogue catalog refresh refreshed " +
    "connect connected connection disconnect available unavailable managed inherited default defaults " +
    "recommended advanced expert diagnostic scope project global thread turn planning verification verify " +
    "auditor worker assistant conversation chat request requests response responses reasoning effort " +
    "capability capabilities evidence usage balance reset cooldown pressure priority favourite favorite " +
    "alias hidden visible enable enabled disable disabled install installed update updated repair rescan " +
    "reconnect restart require required requires policy permission permissions approval approvals sandbox " +
    "worktree branch git media image audio video generation history diagnostics logs log retention " +
    "compaction compact instruction instructions precedence footprint capsule runtime orchestrator " +
    "concurrency wave waves guard guards reserve synthesis isolation consensus reducer template templates " +
    "member members composition dictionary dictionaries language languages spelling personal shared local " +
    "system automatic prefer fallback route routes routing billing plan plans entitlement quota keyless " +
    "free paid extra pack packs included measured projection forecast snapshot read write access grant " +
    "granted cross another between search find open jump scroll navigate navigation category categories " +
    "subcategory subcategories workspace home destination destinations manager managers notice notices " +
    "attention continue setup recommend theme themes light dark motion reduced width narrow squeezed " +
    "shell rail panel layout density disclosure progressive state states value values source sources " +
    "effective requested change changes changed apply applied save saved reason reasons detail details " +
    "help explanation summary purpose status health identity owner ownership token tokens secret " +
    "credential credentials sign login logout authenticate authenticated authentication ready readiness " +
    "probe discovery discovered stale revalidate quarantine version commit removed promotional " +
    "subscription temporarily rate limited account required transformation transformed native alternate " +
    "unsupported supported likely unverified administrator override overrides main auxiliary role roles " +
    "assignment assignments vision compression extraction classification research bounded repetitive " +
    "downgrade silently quality high low cost privacy safety performance restart reconnect note notes " +
    "field fields input output prose code block inline path paths hash identifier structured literal " +
    "marked draft ignore replace add manage manageable review reviewed pending awaiting verified pin " +
    "pinned protect discard delete restore rebuild deduplication redaction half life recall active " +
    "gist gists provenance excerpt excerpts").split(/\s+/);

  var DICT_SET = Object.create(null);
  DICT.forEach(function (w) { if (w) DICT_SET[w] = true; });

  /* Product, provider, persona and tool names are never flagged. */
  var KNOWN_NAMES = Object.create(null);
  function learnNames(list) {
    (list || []).forEach(function (n) {
      String(n).split(/[\s\/\-·]+/).forEach(function (part) {
        var p = part.toLowerCase().replace(/[^a-z0-9']/g, "");
        if (p) KNOWN_NAMES[p] = true;
      });
    });
  }

  var personal = Object.create(null);
  var project = Object.create(null);
  var draftIgnored = Object.create(null);

  var options = {
    enabled: true,
    checkTechnicalProse: false,
    underlineUnknownNames: false,
    useProjectDictionary: true
  };

  function setOptions(patch) { Object.assign(options, patch || {}); }
  function getOptions() { return Object.assign({}, options); }

  function known(word) {
    var w = word.toLowerCase();
    if (DICT_SET[w] || KNOWN_NAMES[w] || personal[w] || draftIgnored[w]) return true;
    if (options.useProjectDictionary && project[w]) return true;
    // Simple plural / past-tense folding before declaring a word unknown.
    if (/s$/.test(w) && DICT_SET[w.slice(0, -1)]) return true;
    if (/es$/.test(w) && DICT_SET[w.slice(0, -2)]) return true;
    if (/ed$/.test(w) && (DICT_SET[w.slice(0, -2)] || DICT_SET[w.slice(0, -1)])) return true;
    if (/ing$/.test(w) && (DICT_SET[w.slice(0, -3)] || DICT_SET[w.slice(0, -3) + "e"])) return true;
    return false;
  }

  /* Tokens that must never be checked. */
  function skipToken(token) {
    if (token.length < 3) return true;
    if (/\d/.test(token)) return true;                       // versions, hashes, numbers
    if (/[_\/\\.:@#]/.test(token)) return true;              // paths, identifiers, urls, emails
    if (/^[A-Z0-9]+$/.test(token)) return true;              // acronyms and enum-looking text
    if (/[a-z][A-Z]/.test(token)) return true;               // camelCase identifiers
    if (/^https?$/i.test(token)) return true;
    return false;
  }

  function editDistanceAtMost(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur[0] = i;
      var best = cur[0];
      for (j = 1; j <= b.length; j++) {
        var cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
        if (cur[j] < best) best = cur[j];
      }
      if (best > max) return max + 1;
      for (j = 0; j <= b.length; j++) prev[j] = cur[j];
    }
    return prev[b.length];
  }

  function suggest(word, limit) {
    var w = word.toLowerCase();
    var scored = [];
    for (var i = 0; i < DICT.length; i++) {
      var cand = DICT[i];
      if (!cand || Math.abs(cand.length - w.length) > 2) continue;
      var d = editDistanceAtMost(w, cand, 2);
      if (d <= 2) scored.push({ word: cand, d: d });
    }
    scored.sort(function (a, b) {
      if (a.d !== b.d) return a.d - b.d;
      return a.word.length - b.word.length;
    });
    var seen = Object.create(null), out = [];
    for (var k = 0; k < scored.length && out.length < (limit || 5); k++) {
      if (seen[scored[k].word]) continue;
      seen[scored[k].word] = true;
      out.push(scored[k].word);
    }
    return out;
  }

  function isMisspelled(token) {
    if (!options.enabled) return false;
    if (skipToken(token)) return false;
    if (known(token)) return false;
    var near = suggest(token, 1);
    if (near.length) return true;
    return !!options.underlineUnknownNames;
  }

  /* -------------------------------------------------------------- rendering */

  /* Segments of the text that are exempt: `inline code`, ```blocks```, urls,
   * paths, and anything inside <span data-literal>. */
  function protectedRanges(text) {
    var ranges = [];
    var re = /```[\s\S]*?```|`[^`]*`|https?:\/\/\S+|(?:^|\s)[~.]?\/[\w./-]+|\b[\w-]+\.(?:json|md|js|css|html|toml|yml|yaml|py|rs|slint)\b|\$\s*\S+/g;
    var m;
    while ((m = re.exec(text))) ranges.push([m.index, m.index + m[0].length]);
    return ranges;
  }

  function inRanges(pos, len, ranges) {
    for (var i = 0; i < ranges.length; i++) {
      if (pos < ranges[i][1] && pos + len > ranges[i][0]) return true;
    }
    return false;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function markup(text) {
    var ranges = protectedRanges(text);
    var out = "";
    /* Punctuation only joins a token when another word character follows it, so
     * "recommended." is a word plus a full stop, while "services/api" and
     * "AGENTS.md" stay single tokens and are skipped as technical text. */
    var re = /[A-Za-z][A-Za-z'’]*(?:[_\/\\.:@#-][A-Za-z0-9][A-Za-z0-9'’]*)*/g;
    var last = 0, m;
    while ((m = re.exec(text))) {
      var token = m[0];
      var start = m.index;
      out += escapeHtml(text.slice(last, start));
      if (!inRanges(start, token.length, ranges) && isMisspelled(token)) {
        out += '<span class="pm-misspell" data-word="' + escapeHtml(token) + '">' + escapeHtml(token) + "</span>";
      } else {
        out += escapeHtml(token);
      }
      last = start + token.length;
    }
    out += escapeHtml(text.slice(last));
    return out.replace(/\n/g, "<br>");
  }

  /* Caret is tracked as a plain character offset so the field can be re-marked
   * without the caret jumping. */
  function caretOffset(root) {
    var sel = window.getSelection();
    if (!sel || !sel.rangeCount) return null;
    var range = sel.getRangeAt(0);
    if (!root.contains(range.startContainer)) return null;
    var pre = range.cloneRange();
    pre.selectNodeContents(root);
    pre.setEnd(range.startContainer, range.startOffset);
    return pre.toString().length;
  }

  function setCaret(root, offset) {
    if (offset == null) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var seen = 0, node;
    while ((node = walker.nextNode())) {
      var len = node.nodeValue.length;
      if (seen + len >= offset) {
        var range = document.createRange();
        range.setStart(node, Math.max(0, offset - seen));
        range.collapse(true);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
      seen += len;
    }
    // Past the end: place at the very end.
    var r = document.createRange();
    r.selectNodeContents(root);
    r.collapse(false);
    var s = window.getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }

  function attach(el, opts) {
    var settings = opts || {};
    var timer = 0;
    // The browser's own checker is off: the underlines below are this service.
    el.setAttribute("spellcheck", "false");
    el.setAttribute("data-pm-spellcheck", "on");

    function remark() {
      var text = el.innerText.replace(/ /g, " ");
      var caret = caretOffset(el);
      var html = markup(text);
      if (html !== el.innerHTML) {
        el.innerHTML = html;
        setCaret(el, caret);
      }
    }

    function schedule() {
      window.clearTimeout(timer);
      timer = window.setTimeout(remark, 240);
    }

    el.addEventListener("input", schedule);
    el.addEventListener("blur", remark);

    el.addEventListener("contextmenu", function (e) {
      var target = e.target.closest ? e.target.closest(".pm-misspell") : null;
      if (!target) return;
      e.preventDefault();
      openMenu(target, el, remark, settings);
    });

    // Keyboard route, so suggestions are not hover- or mouse-only.
    el.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === ".") {
        var node = window.getSelection().anchorNode;
        var span = node && node.parentElement ? node.parentElement.closest(".pm-misspell") : null;
        if (!span) span = el.querySelector(".pm-misspell");
        if (span) { e.preventDefault(); openMenu(span, el, remark, settings); }
      }
    });

    remark();
    return { remark: remark, detach: function () { el.removeEventListener("input", schedule); } };
  }

  var openPanel = null;

  function closeMenu() {
    if (openPanel && openPanel.parentNode) openPanel.parentNode.removeChild(openPanel);
    openPanel = null;
    document.removeEventListener("mousedown", onDocDown, true);
    document.removeEventListener("keydown", onDocKey, true);
  }

  function onDocDown(e) { if (openPanel && !openPanel.contains(e.target)) closeMenu(); }
  function onDocKey(e) { if (e.key === "Escape") { closeMenu(); } }

  function openMenu(span, field, remark, settings) {
    closeMenu();
    var word = span.getAttribute("data-word");
    var list = suggest(word, 5);

    var panel = document.createElement("div");
    panel.className = "pm-spell-menu";
    panel.setAttribute("role", "menu");
    panel.setAttribute("aria-label", "Spelling suggestions for " + word);

    var head = document.createElement("div");
    head.className = "pm-spell-menu-head";
    head.textContent = list.length ? "Suggestions" : "No close match";
    panel.appendChild(head);

    list.forEach(function (s) {
      panel.appendChild(item(s, "suggestion", function () {
        // Replace once. Nothing is ever replaced without this explicit choice.
        span.textContent = s;
        span.classList.remove("pm-misspell");
        span.removeAttribute("data-word");
        closeMenu();
        remark();
        announce('Replaced "' + word + '" with "' + s + '".');
      }));
    });

    panel.appendChild(divider());
    panel.appendChild(item("Ignore once", "action", function () {
      span.classList.remove("pm-misspell");
      span.setAttribute("data-ignored", "once");
      closeMenu();
      announce('Ignored "' + word + '" once.');
    }));
    panel.appendChild(item("Ignore for this draft", "action", function () {
      draftIgnored[word.toLowerCase()] = true;
      closeMenu();
      remark();
      announce('Ignoring "' + word + '" for this draft.');
    }));
    panel.appendChild(item("Add to personal dictionary", "action", function () {
      personal[word.toLowerCase()] = true;
      closeMenu();
      remark();
      announce('Added "' + word + '" to the personal dictionary.');
    }));
    if (options.useProjectDictionary) {
      panel.appendChild(item("Add to project dictionary", "action", function () {
        project[word.toLowerCase()] = true;
        closeMenu();
        remark();
        announce('Added "' + word + '" to the project dictionary.');
      }));
    }

    document.body.appendChild(panel);
    var r = span.getBoundingClientRect();
    var top = r.bottom + 6;
    var left = r.left;
    var pw = panel.offsetWidth, ph = panel.offsetHeight;
    if (left + pw > window.innerWidth - 8) left = Math.max(8, window.innerWidth - pw - 8);
    if (top + ph > window.innerHeight - 8) top = Math.max(8, r.top - ph - 6);
    panel.style.top = Math.round(top) + "px";
    panel.style.left = Math.round(left) + "px";

    openPanel = panel;
    document.addEventListener("mousedown", onDocDown, true);
    document.addEventListener("keydown", onDocKey, true);
    var first = panel.querySelector("button");
    if (first) first.focus();
  }

  function item(label, kind, onClick) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "pm-spell-item" + (kind === "suggestion" ? " is-suggestion" : "");
    b.setAttribute("role", "menuitem");
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }

  function divider() {
    var d = document.createElement("div");
    d.className = "pm-spell-divider";
    return d;
  }

  function announce(message) {
    var live = document.getElementById("pm-live-region");
    if (live) live.textContent = message;
  }

  window.PMSpellcheck = {
    attach: attach,
    suggest: suggest,
    isMisspelled: isMisspelled,
    setOptions: setOptions,
    getOptions: getOptions,
    learnNames: learnNames,
    dictionaries: function () {
      return {
        personal: Object.keys(personal),
        project: Object.keys(project),
        draftIgnored: Object.keys(draftIgnored)
      };
    }
  };
})();
