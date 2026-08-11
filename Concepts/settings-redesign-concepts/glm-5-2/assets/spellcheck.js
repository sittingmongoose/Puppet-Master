/* spellcheck.js — concept demo of the packet's spellcheck contract (file 04).
   - subtle underline for likely misspellings
   - suggestion menu: Replace once / Ignore once / Ignore for draft / Add to personal / Add to project
   - NO automatic word replacement (smoke #9)
   - NO ordinary LLM/provider call
   - skips code blocks, inline code, URLs, file paths, commands, hashes, identifiers,
     structured data, model/provider/persona/tool names
   Production uses a Slint-portable spelling-service abstraction; HTML `spellcheck`
   may be used only to simulate the concept. This is that simulation. */
(function () {
  "use strict";
  window.PM_SPELL = {};

  // lightweight local dictionary of common misspellings → [suggestions]
  // (deliberately small — this is a concept demo, not a real dictionary)
  PM_SPELL.dict = {
    "recieve": ["receive"], "definately": ["definitely"], "seperate": ["separate"],
    "occured": ["occurred"], "untill": ["until"], "wich": ["which"],
    "thier": ["their"], "recomend": ["recommend"], "occassion": ["occasion"],
    "neccessary": ["necessary"], "accross": ["across"], "begining": ["beginning"],
    "cuz": ["because"], "thru": ["through"], "tho": ["though"],
    "alot": ["a lot"], "cant": ["can't"], "wont": ["won't"], "doesnt": ["doesn't"],
    "teh": ["the"], "adn": ["and"], "taht": ["that"], "freind": ["friend"],
    "wierd": ["weird"], "calender": ["calendar"], "gramar": ["grammar"],
    "enviroment": ["environment"], "priviledge": ["privilege"], "tommorow": ["tomorrow"]
  };

  // technical names to never flag (model/provider/persona/tool names)
  PM_SPELL.knownNames = new Set([
    "puppet","master","puppetmaster","glm","opus","sonnet","haiku","gpt","vega",
    "claude","antigravity","openai","codex","qwen","deepseek","llama","ripgrep",
    "slack","github","docker","kubernetes","rust","pyright","prettier",
    "antigravity","glm-5.2","zai","overseer","persona","personas","mcp","lsp",
    "filesafe","worktree","worktrees","ledger","ledgers","planunit","planunits"
  ]);

  // skip patterns: code, urls, paths, commands, hashes, identifiers, structured data
  PM_SPELL.skipToken = function (tok) {
    if (!tok || tok.length < 2) return true;
    // inline code / backtick-wrapped
    if (/^`.*`$/.test(tok)) return true;
    // URLs
    if (/^https?:\/\//i.test(tok) || /^www\./i.test(tok)) return true;
    // file paths
    if (/^[\/~]/.test(tok) || /[\/\\]\w/.test(tok)) return true;
    // dot/colon identifiers (e.g. PM.theme, agents.accounts)
    if (/^[\w-]+[.:][\w.-]+/.test(tok)) return true;
    // hashes / commits
    if (/^[0-9a-f]{7,40}$/i.test(tok)) return true;
    // shell commands / flags
    if (/^--?[\w-]/.test(tok)) return true;
    // env vars, ALL_CAPS constants
    if (/^[A-Z][A-Z0-9_]{2,}=?/.test(tok)) return true;
    // numbers / units
    if (/^\d/.test(tok)) return true;
    // hyphen-name (glm-5.2, pyright-1.1.3) — treat as identifier
    if (/[\w]-[\w]/.test(tok) && /[0-9]/.test(tok)) return true;
    // known names
    var lower = tok.toLowerCase().replace(/[^a-z0-9.-]/g, "");
    if (PM_SPELL.knownNames.has(lower)) return true;
    return false;
  };

  PM_SPELL.ignoreSet = new Set();        // ignored once
  PM_SPELL.ignoreDraft = new Set();      // ignored for draft
  PM_SPELL.personalDict = new Set();     // added to personal
  PM_SPELL.projectDict = new Set();      // added to project

  PM_SPELL.checkWord = function (rawWord) {
    if (PM_SPELL.skipToken(rawWord)) return null;
    var word = rawWord.toLowerCase().replace(/^[^a-z']+|[^a-z']+$/gi, "");
    if (!word || word.length < 2) return null;
    if (PM_SPELL.ignoreSet.has(word) || PM_SPELL.ignoreDraft.has(word) ||
        PM_SPELL.personalDict.has(word) || PM_SPELL.projectDict.has(word)) return null;
    var suggestions = PM_SPELL.dict[word];
    if (!suggestions) return null;
    return { word: word, raw: rawWord, suggestions: suggestions };
  };

  /* ---------- live underline on a prose field ----------
     Wraps misspelled words in <span class="spell-miss"> with a subtle underline.
     Re-runs on input. Skips text inside <code>, <pre>, <a href>. */
  PM_SPELL.attach = function (textareaOrEditable) {
    var host = textareaOrEditable;
    if (!host) return;
    if (host.tagName === "TEXTAREA") return attachTextarea(host);
    return;
  };

  /* For contenteditable prose fields (richer demo): underline via spans. */
  function attachEditable(el) {
    el.setAttribute("spellcheck", "false"); // we simulate; turn off native
    el.addEventListener("input", function () { PM_SPELL.highlight(el); });
    el.addEventListener("contextmenu", function (e) { onContextMenu(e, el); });
    PM_SPELL.highlight(el);
  }
  PM_SPELL.attachEditable = attachEditable;

  PM_SPELL.highlight = function (el) {
    // Only highlight plain text regions (skip <code>/<pre> descendants).
    // Walk text nodes, wrap misspellings.
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var p = node.parentNode;
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        // skip code, pre, a, and already-wrapped spell-miss
        if (p.closest("code, pre, .spell-miss, a[href]")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (tn) {
      var text = tn.nodeValue;
      var tokens = text.split(/(\s+)/); // keep whitespace
      var missRanges = [];
      tokens.forEach(function (tok, i) {
        if (!tok.trim()) return;
        var hit = PM_SPELL.checkWord(tok);
        if (hit) {
          // compute char offset of this token within the text
          var off = 0;
          for (var j = 0; j < i; j++) off += tokens[j].length;
          missRanges.push({ start: off, end: off + tok.length, hit: hit });
        }
      });
      if (!missRanges.length) return;
      // build replacement fragment
      var frag = document.createDocumentFragment();
      var last = 0;
      missRanges.forEach(function (r) {
        if (r.start > last) frag.appendChild(document.createTextNode(text.slice(last, r.start)));
        var span = document.createElement("span");
        span.className = "spell-miss";
        span.setAttribute("data-word", r.hit.word);
        span.textContent = text.slice(r.start, r.end);
        frag.appendChild(span);
        last = r.end;
      });
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      tn.parentNode.replaceChild(frag, tn);
    });
  };

  /* For plain <textarea> we can't wrap spans; show misspellings as a quiet list beneath. */
  function attachTextarea(ta) {
    ta.setAttribute("spellcheck", "false"); // we simulate
    var mirror = document.createElement("div");
    mirror.className = "spell-mirror";
    ta.parentNode.insertBefore(mirror, ta.nextSibling);
    var list = document.createElement("div");
    list.className = "spell-list muted small";
    ta.parentNode.insertBefore(list, mirror.nextSibling);
    function refresh() {
      var hits = [];
      ta.value.split(/\s+/).forEach(function (tok) {
        var h = PM_SPELL.checkWord(tok);
        if (h && hits.indexOf(h.word) < 0) hits.push(h.word);
      });
      list.textContent = hits.length ? "Possibly misspelled: " + hits.join(", ") : "";
    }
    ta.addEventListener("input", refresh);
    ta.addEventListener("contextmenu", function (e) {
      // textarea contextmenu: if caret word is misspelled, show suggestions
      var pos = ta.selectionStart;
      var upto = ta.value.slice(0, pos);
      var rest = ta.value.slice(pos);
      var left = upto.split(/\s+/).pop() || "";
      var right = rest.split(/\s+/)[0] || "";
      var tok = (left + right).trim();
      var hit = PM_SPELL.checkWord(tok);
      if (hit) { e.preventDefault(); showSuggestionMenu(e, hit, ta, { token: tok, plain: true }); }
      else refresh();
    });
    refresh();
  }

  function onContextMenu(e, el) {
    var span = e.target.closest(".spell-miss");
    if (!span) return;
    e.preventDefault();
    var word = span.getAttribute("data-word");
    var hit = { word: word, suggestions: PM_SPELL.dict[word] || [], raw: span.textContent };
    showSuggestionMenu(e, hit, el, { span: span });
  }

  function showSuggestionMenu(e, hit, el, ctx) {
    var old = document.querySelector("[data-popover].spell-menu"); if (old) old.remove();
    var items = [];
    hit.suggestions.forEach(function (sug) {
      items.push('<button class="pm-menu-item" data-spell="replace" data-sug="' + sug + '">' + PM.svg("check", 12) + ' Replace with "' + sug + '"</button>');
    });
    if (!hit.suggestions.length) items.push('<div class="pm-menu-item muted">No suggestions</div>');
    items.push('<div class="pm-menu-sep"></div>');
    items.push('<button class="pm-menu-item" data-spell="ignore-once">' + PM.svg("close", 12) + ' Ignore once</button>');
    items.push('<button class="pm-menu-item" data-spell="ignore-draft">Ignore for this draft</button>');
    items.push('<button class="pm-menu-item" data-spell="add-personal">' + PM.svg("plus", 12) + ' Add to personal dictionary</button>');
    items.push('<button class="pm-menu-item" data-spell="add-project">Add to project dictionary</button>');
    var menu = PM.el("div", "pm-menu spell-menu", { "data-popover":"", role:"menu" }, items.join(""));
    document.body.appendChild(menu);
    menu.style.top = Math.min(e.clientY, window.innerHeight - 260) + "px";
    menu.style.left = Math.min(e.clientX, window.innerWidth - 280) + "px";

    menu.querySelectorAll("[data-spell]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = this.getAttribute("data-spell");
        var sug = this.getAttribute("data-sug");
        handleSpellAction(action, hit, sug, el, ctx);
        menu.remove();
      });
    });
    setTimeout(function () {
      document.addEventListener("click", function close () { menu.remove(); document.removeEventListener("click", close); }, { once: true });
    }, 0);
  }

  function handleSpellAction(action, hit, sug, el, ctx) {
    if (action === "replace") {
      // replace once — NEVER autocorrect; only this one instance
      if (ctx.plain) {
        var ta = el;
        var before = ta.value.slice(0, ta.selectionStart);
        var after = ta.value.slice(ta.selectionStart);
        var leftTok = before.split(/\s+/).pop() || "";
        var rightTok = after.split(/\s+/)[0] || "";
        var tokStart = before.length - leftTok.length;
        var tokEnd = before.length + rightTok.length;
        ta.value = ta.value.slice(0, tokStart) + sug + ta.value.slice(tokEnd);
        ta.focus();
        PM.toast("Replaced once — no autocorrect enabled");
      } else if (ctx.span) {
        ctx.span.replaceWith(document.createTextNode(sug));
        PM.toast("Replaced once — no autocorrect enabled");
        PM_SPELL.highlight(el);
      }
    } else if (action === "ignore-once") {
      PM_SPELL.ignoreSet.add(hit.word); PM.toast("Ignored once");
      if (!ctx.plain) PM_SPELL.highlight(el);
    } else if (action === "ignore-draft") {
      PM_SPELL.ignoreDraft.add(hit.word); PM.toast("Ignored for this draft");
      if (!ctx.plain) PM_SPELL.highlight(el);
    } else if (action === "add-personal") {
      PM_SPELL.personalDict.add(hit.word); PM.toast("Added to personal dictionary");
      if (!ctx.plain) PM_SPELL.highlight(el);
    } else if (action === "add-project") {
      PM_SPELL.projectDict.add(hit.word); PM.toast("Added to project dictionary");
      if (!ctx.plain) PM_SPELL.highlight(el);
    }
  }
})();
