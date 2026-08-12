(function () {
  "use strict";

  function reducedMotion() {
    return document.documentElement.getAttribute("data-reduced-motion") === "1";
  }


  // Theme-specific locked rows (packet 06): a row may be locked by the active
  // theme (e.g. Window transparency in Basic themes, which have no translucency).
  function isThemeLocked(s) {
    return !!(s && s.themeLocked && document.documentElement.getAttribute("data-theme") &&
      document.documentElement.getAttribute("data-theme").indexOf("basic-") === 0);
  }
  // --- Search index with result types ----------------------------------------
  // resultType ∈ setting | manager | action | status | diagnostic | setup | unavailable
  function buildSearchIndex() {
    var st = window.PMState.state;
    var entries = [];
    window.PMDemoData.destinations.forEach(function (dest) {
      entries.push({ kind: "destination", resultType: "manager", title: dest.title, path: [dest.title], keywords: dest.purpose, target: { name: "workspace", category: dest.id }, dest: dest.id });
      dest.subcategories.forEach(function (sub) {
        entries.push({ kind: "subcategory", resultType: "setting", title: sub.title, path: [dest.title, sub.title], keywords: dest.title + " " + sub.title, target: { name: "workspace", category: dest.id, subcategory: sub.id }, dest: dest.id });
        if (sub.manager) {
          entries.push({ kind: "manager", resultType: "manager", title: managerTitle(sub.manager), path: [dest.title, sub.title], keywords: "manager " + sub.manager, target: { name: "workspace", category: dest.id, subcategory: sub.id, manager: sub.manager }, dest: dest.id });
        }
        sub.settings.forEach(function (s) {
          var rt = "setting";
          if (s.type === "action") rt = s.keywords && s.keywords.indexOf("diagnostic") >= 0 ? "diagnostic" : "action";
          if (s.type === "text" && s.source === "managed") rt = "status";
          entries.push({ kind: "setting", resultType: rt, title: s.label, path: [dest.title, sub.title, s.label], keywords: (s.keywords || "") + " " + s.desc, target: { name: "workspace", category: dest.id, subcategory: sub.id, setting: s.id }, dest: dest.id, settingId: s.id });
        });
      });
    });
    st.providers.forEach(function (p) {
      entries.push({ kind: "provider", resultType: "manager", title: p.name, path: ["Providers", p.name], keywords: p.group + " " + p.stateLabel, target: { name: "workspace", category: "models", manager: "providers", provider: p.id }, dest: "models" });
      p.models.forEach(function (m) {
        entries.push({ kind: "model", resultType: "setting", title: m.name, path: ["Providers", p.name, m.name], keywords: (m.alias || "") + " model " + (m.freeState || ""), target: { name: "workspace", category: "models", manager: "providers", provider: p.id, model: m.id }, dest: "models" });
      });
    });
    st.personas.forEach(function (pe) {
      entries.push({ kind: "persona", resultType: "manager", title: pe.name + " Persona", path: ["Personas", pe.name], keywords: pe.description, target: { name: "workspace", category: "behavior", manager: "personas", persona: pe.id }, dest: "behavior" });
    });
    // One-shot action, status, diagnostic, setup, and unavailable exemplars.
    entries.push({ kind: "action", resultType: "action", title: "Back Up Now", path: ["System & Data", "Backup & Restore"], keywords: "backup action one-shot", target: { name: "workspace", category: "system", manager: "backup" }, dest: "system" });
    entries.push({ kind: "status", resultType: "status", title: "Last backup", path: ["System & Data", "Backup & Restore"], keywords: "backup status read-only 14 days", target: { name: "workspace", category: "system", manager: "backup" }, dest: "system" });
    entries.push({ kind: "diagnostic", resultType: "diagnostic", title: "Open backup log", path: ["System & Data", "Backup & Restore"], keywords: "backup log diagnostic", target: { name: "workspace", category: "system", manager: "backup" }, dest: "system" });
    entries.push({ kind: "setup", resultType: "setup", title: "Mistral free-tier setup", path: ["Providers", "Mistral AI (free tier)"], keywords: "setup mistral free models needs-setup", target: { name: "workspace", category: "models", manager: "providers", provider: "mistral-free" }, dest: "models" });
    entries.push({ kind: "unavailable", resultType: "unavailable", title: "Video output", path: ["Retired capability"], keywords: "video output retired media unavailable", target: { name: "workspace", category: "models", subcategory: "continuation" }, dest: "models", unavailableReason: "Video output retired with the Media destination — kept searchable with a reason." });
    return entries;
  }

  function managerTitle(id) {
    var map = {
      providers: "Provider Manager", personas: "Persona Manager", terminal: "Terminal Manager", lsp: "LSP Manager",
      memory: "Assistant Memory Manager", "context-sources": "Context & Instruction Sources", crew: "Crew Template Manager",
      mcp: "MCP Server Manager", skills: "Skills Manager", plugins: "Plugins Manager", tools: "Tools Inventory",
      notifications: "Notification Destinations", sounds: "Sound Library", themes: "Custom Themes", permissions: "Permission Rules",
      files: "File Manager", formatters: "Formatters", commands: "Commands & Shortcuts", testing: "Testing & Debug Matrix",
      storage: "Storage & Retention", backup: "Backup & Restore", history: "History & Sessions", artifacts: "Runtime Artifacts",
      "source-control": "Source Control & Worktrees", containers: "Containers & Registries", web: "Web / Search / Fetch",
      "search-index": "Project Search Index"
    };
    return map[id] || id;
  }

  // Bounded Levenshtein with early exit.
  function levDist(a, b, max) {
    var m = a.length, n = b.length;
    if (Math.abs(m - n) > max) return max + 1;
    var prev = [], cur = [];
    for (var j = 0; j <= n; j++) prev[j] = j;
    for (var i = 1; i <= m; i++) {
      cur[0] = i;
      var rowMin = i;
      for (var k = 1; k <= n; k++) {
        var cost = a[i - 1] === b[k - 1] ? 0 : 1;
        cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + cost);
        if (cur[k] < rowMin) rowMin = cur[k];
      }
      if (rowMin > max) return max + 1;
      var tmp = prev; prev = cur; cur = tmp;
    }
    return prev[n];
  }

  function score(entry, terms) {
    var title = entry.title.toLowerCase();
    var hay = (title + " " + (entry.keywords || "") + " " + entry.path.join(" ")).toLowerCase();
    var total = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (!t) continue;
      var hit = false;
      if (title === t) { total += 120; hit = true; }
      else if (title.indexOf(t) === 0) { total += 70; hit = true; }
      else if (title.indexOf(t) >= 0) { total += 45; hit = true; }
      else if (hay.indexOf(t) >= 0) { total += 18; hit = true; }
      if (!hit) {
        // Typo tolerance: word-level edit distance (≤1; ≤2 for longer terms).
        var fuzzy = false;
        if (t.length >= 5) {
          var maxd = t.length >= 8 ? 2 : 1;
          var words = hay.split(/[^a-z0-9]+/);
          for (var w = 0; w < words.length && !fuzzy; w++) {
            if (words[w].length >= 4 && levDist(t, words[w], maxd) <= maxd) fuzzy = true;
          }
        }
        if (fuzzy) total += 55; else return 0;
      }
    }
    if (entry.kind === "setting") total += 4;
    if (entry.kind === "destination") total += 2;
    return total;
  }

  function search(query, index) {
    var q = (query || "").trim().toLowerCase();
    if (!q) return [];
    var terms = q.split(/\s+/);
    var out = [];
    index.forEach(function (e) {
      var s = score(e, terms);
      if (s > 0) out.push({ entry: e, score: s });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, 24).map(function (x) { return x.entry; });
  }

  // --- Hash router -------------------------------------------------------------
  // #/home | #/w/<category>[/<subcategory>][?setting=<id>|manager=<id>|provider=<id>|model=<id>]
  var routerReady = false;
  var suppressHash = false;

  function parseHash(hash) {
    var h = hash || "";
    if (h.charAt(0) === "#") h = h.slice(1);
    if (!h || h === "/home") return { name: "home" };
    var m = h.match(/^\/w\/([^/?]+)(?:\/([^/?]+))?(?:\?(.*))?$/);
    if (!m) return { name: "home" };
    var view = { name: "workspace", category: decodeURIComponent(m[1]), subcategory: m[2] ? decodeURIComponent(m[2]) : null };
    if (m[3]) {
      m[3].split("&").forEach(function (kv) {
        var eq = kv.indexOf("=");
        if (eq > 0) view[decodeURIComponent(kv.slice(0, eq))] = decodeURIComponent(kv.slice(eq + 1));
      });
    }
    return view;
  }

  function viewToHash(view) {
    if (!view || view.name === "home") return "#/home";
    var h = "#/w/" + encodeURIComponent(view.category);
    if (view.subcategory) h += "/" + encodeURIComponent(view.subcategory);
    var params = [];
    ["setting", "manager", "provider", "model"].forEach(function (k) {
      if (view[k]) params.push(k + "=" + encodeURIComponent(view[k]));
    });
    if (params.length) h += "?" + params.join("&");
    return h;
  }

  // Boot contract: PMState.init(id) → PMManagers.setPrefix(px) → PMShell.mount()
  // → subscribe renderer → PMCore.startRouter(). startRouter returns the initial
  // view for the caller to render synchronously; it never emits a navigate event
  // for it (the renderer subscribes AFTER this point would be too late otherwise).
  function startRouter() {
    if (!routerReady) {
      routerReady = true;
      window.addEventListener("hashchange", function () {
        if (suppressHash) { suppressHash = false; return; }
        window.PMState.navigate(parseHash(window.location.hash));
      });
      window.PMState.subscribe(function (kind, payload) {
        if (kind !== "navigate") return;
        var want = viewToHash(payload);
        if (want !== window.location.hash) {
          suppressHash = true;
          window.location.hash = want;
        }
      });
    }
    var initial = parseHash(window.location.hash);
    window.PMState.state.view = initial;
    return initial;
  }

  // --- Lazy manager hydration ----------------------------------------------------
  function hydrateManager(container, renderFn) {
    var skeleton = document.createElement("div");
    skeleton.className = "pm-mgr-skeleton";
    skeleton.setAttribute("data-skeleton", "1");
    skeleton.setAttribute("aria-hidden", "true");
    skeleton.innerHTML = '<div class="pm-skel-row"></div><div class="pm-skel-row short"></div><div class="pm-skel-row"></div><div class="pm-skel-row short"></div>';
    container.innerHTML = "";
    container.appendChild(skeleton);
    var delay = reducedMotion() ? 0 : 250 + Math.floor(Math.random() * 250);
    setTimeout(function () {
      renderFn(container);
      if (skeleton.parentNode) skeleton.parentNode.removeChild(skeleton);
    }, delay);
  }

  // --- Dialog primitive (replaces window.prompt) -----------------------------------
  var dialogHost = null;
  function closeDialog() {
    if (dialogHost && dialogHost.parentNode) dialogHost.parentNode.removeChild(dialogHost);
    dialogHost = null;
  }

  function promptDialog(title, initial, onOk) {
    closeDialog();
    dialogHost = document.createElement("div");
    dialogHost.className = "pm-dialog-overlay";
    dialogHost.setAttribute("role", "presentation");
    dialogHost.innerHTML =
      '<div class="pm-dialog" role="dialog" aria-modal="true" aria-label="">' +
        '<div class="pm-dialog-title"></div>' +
        '<input class="pm-input pm-dialog-input" type="text">' +
        '<div class="pm-dialog-actions">' +
          '<button class="pm-btn pm-btn-sm pm-dialog-cancel">Cancel</button>' +
          '<button class="pm-btn pm-btn-sm pm-btn-primary pm-dialog-ok">Save</button>' +
        '</div>' +
      '</div>';
    dialogHost.querySelector("[aria-label]").setAttribute("aria-label", title);
    dialogHost.querySelector(".pm-dialog-title").textContent = title;
    var input = dialogHost.querySelector(".pm-dialog-input");
    input.value = initial || "";
    document.body.appendChild(dialogHost);
    input.focus();
    input.select();

    function ok() {
      var v = input.value.trim();
      closeDialog();
      if (onOk) onOk(v);
    }
    dialogHost.querySelector(".pm-dialog-ok").addEventListener("click", ok);
    dialogHost.querySelector(".pm-dialog-cancel").addEventListener("click", closeDialog);
    dialogHost.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); ok(); }
      if (e.key === "Escape") { e.preventDefault(); closeDialog(); }
    });
    dialogHost.addEventListener("click", function (e) { if (e.target === dialogHost) closeDialog(); });
  }

  // --- Scrollspy --------------------------------------------------------------------
  function scrollspy(scroller, getSections, onActive, opts) {
    var o = opts || {};
    var offset = o.offset || 96;
    var lock = false;
    var current = null;
    var raf = null;

    function compute() {
      if (lock) return;
      var sections = getSections();
      if (!sections.length) return;
      var top = scroller.scrollTop + offset + 8;
      var active = sections[0].id;
      for (var i = 0; i < sections.length; i++) {
        var el = sections[i].el;
        if (!el) continue;
        if (el.offsetTop <= top) active = sections[i].id;
      }
      if (active !== current) {
        current = active;
        onActive(active);
      }
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        compute();
      });
    }

    function jumpTo(id, then) {
      var sections = getSections();
      var el = null;
      for (var i = 0; i < sections.length; i++) if (sections[i].id === id) el = sections[i].el;
      if (!el) { if (then) then(false); return; }
      lock = true;
      current = id;
      onActive(id);
      var target = Math.max(0, el.offsetTop - offset + 8);
      var behavior = reducedMotion() ? "auto" : "smooth";
      scroller.scrollTo({ top: target, behavior: behavior });
      var settle = function () {
        lock = false;
        if (then) then(true);
      };
      var idle = null;
      var watch = function () {
        if (Math.abs(scroller.scrollTop - target) < 2) {
          scroller.removeEventListener("scroll", watch);
          settle();
        } else {
          clearTimeout(idle);
          idle = setTimeout(function () {
            scroller.removeEventListener("scroll", watch);
            settle();
          }, 160);
        }
      };
      scroller.addEventListener("scroll", watch);
      setTimeout(function () {
        scroller.removeEventListener("scroll", watch);
        if (lock) settle();
      }, 1400);
    }

    scroller.addEventListener("scroll", onScroll, { passive: true });
    compute();

    return {
      jumpTo: jumpTo,
      refresh: compute,
      setActive: function (id) { current = id; onActive(id); },
      destroy: function () { scroller.removeEventListener("scroll", onScroll); }
    };
  }

  function focusFlash(el) {
    if (!el) return;
    el.classList.remove("pm-focus-wash");
    void el.offsetWidth;
    el.classList.add("pm-focus-wash");
    setTimeout(function () { el.classList.remove("pm-focus-wash"); }, reducedMotion() ? 500 : 1300);
  }

  var toastHost = null;
  function ensureToastHost() {
    if (toastHost && document.body.contains(toastHost)) return toastHost;
    toastHost = document.createElement("div");
    toastHost.className = "pm-toasts";
    toastHost.setAttribute("role", "status");
    document.body.appendChild(toastHost);
    return toastHost;
  }

  function toast(receipt) {
    var host = ensureToastHost();
    var el = document.createElement("div");
    el.className = "pm-toast pm-toast-" + receipt.kind;
    var ico = window.PMIcons.get(receipt.kind === "ok" ? "checkCircle" : receipt.kind === "blocked" ? "lock" : receipt.kind === "info" ? "info" : "spark", 15);
    el.innerHTML = '<span class="pm-toast-ico">' + ico + '</span><span class="pm-toast-body"><strong></strong><em></em></span>';
    el.querySelector("strong").textContent = receipt.title;
    el.querySelector("em").textContent = receipt.detail;
    host.appendChild(el);
    while (host.children.length > 3) host.removeChild(host.firstChild);
    requestAnimationFrame(function () { el.classList.add("in"); });
    var timer = setTimeout(dismiss, 5200);
    function dismiss() {
      clearTimeout(timer);
      el.classList.remove("in");
      el.classList.add("out");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, reducedMotion() ? 120 : 320);
    }
    el.addEventListener("click", dismiss);
  }

  function settingMeta(s) {
    var badges = [];
    var disabled = false;
    var sourceLabel = "Default";
    if (s.source === "custom") sourceLabel = "Custom";
    if (s.source === "inherited") { sourceLabel = "Inherited" + (s.inheritedFrom ? " — " + s.inheritedFrom : ""); }
    if (s.source === "auto") sourceLabel = "Auto";
    if (s.source === "not-configured") sourceLabel = "Not configured";
    if (s.source === "managed") { sourceLabel = "Managed"; disabled = true; }
    if (s.source === "unavailable") { sourceLabel = "Unavailable"; disabled = true; }
    if (s.source === "default") badges.push({ label: "Default", kind: "muted" });
    if (s.source === "inherited") badges.push({ label: sourceLabel, kind: "info" });
    if (s.source === "managed") badges.push({ label: s.managedBy ? "Managed by " + s.managedBy : "Managed", kind: "managed" });
    if (s.source === "not-configured") badges.push({ label: "Not configured", kind: "warn" });
    if (s.source === "unavailable") badges.push({ label: "Unavailable", kind: "warn" });
    if (s.changedElsewhere) badges.push({ label: "Changed elsewhere", kind: "info" });
    if (s.recommended) badges.push({ label: "Recommended: " + s.recommended, kind: "ok" });
    if (s.operational) badges.push({ label: s.operational, kind: "info" });
    if (s.requested && s.effective && s.requested !== s.effective) badges.push({ label: "Effective differs", kind: "diff" });
    if (s.restart) badges.push({ label: "Restart required", kind: "warn" });
    if (s.validationError) badges.push({ label: "Validation error", kind: "danger" });
    if (isThemeLocked(s)) { badges.push({ label: "Locked by theme", kind: "managed" }); disabled = true; }
    if (s.risky) badges.push({ label: "Risky", kind: "danger" });
    if (s.tier === "advanced") badges.push({ label: "Advanced", kind: "muted" });
    if (s.tier === "expert") badges.push({ label: "Expert", kind: "danger" });
    if (s.tier === "diagnostic") badges.push({ label: "Diagnostic", kind: "muted" });
    if (s.effect) badges.push({ label: s.effect === "cost" ? "Cost impact" : s.effect === "privacy" ? "Privacy impact" : s.effect === "safety" ? "Safety impact" : "Performance impact", kind: "effect" });
    return { sourceLabel: sourceLabel, badges: badges, disabled: disabled };
  }

  var SPELL_DICT = {
    recieve: ["receive"], seperate: ["separate"], definately: ["definitely"], occured: ["occurred"],
    wich: ["which"], teh: ["the"], prefered: ["preferred"], compactionn: ["compaction"]
  };
  var ignoredWords = {};

  function dicts() { return window.PMState ? window.PMState.state.collections : { personalDict: [], projectDict: [] }; }

  function attachSpellcheck(root) {
    var nodes = root.querySelectorAll("[data-spell-text]");
    nodes.forEach(function (el) { decorate(el); });
  }

  function spellEnabled() {
    if (window.PMState.state.ui.spellThreadDisabled) return false;
    var s = window.PMState.getSetting("general.language.spellcheck");
    return !s || s.value === true || s.value === "true";
  }

  function decorate(el) {
    var raw = el.getAttribute("data-spell-raw") || el.textContent;
    el.setAttribute("data-spell-raw", raw);
    el.innerHTML = "";
    if (!spellEnabled()) {
      el.textContent = raw;
      return;
    }
    var d = dicts();
    var re = /[A-Za-z']+/g;
    var last = 0;
    var m;
    while ((m = re.exec(raw)) !== null) {
      if (m.index > last) el.appendChild(document.createTextNode(raw.slice(last, m.index)));
      var word = m[0];
      var low = word.toLowerCase();
      if (SPELL_DICT[low] && !ignoredWords[low] && d.personalDict.indexOf(low) < 0 && d.projectDict.indexOf(low) < 0) {
        var span = document.createElement("span");
        span.className = "pm-spell";
        span.textContent = word;
        span.setAttribute("tabindex", "0");
        span.setAttribute("role", "button");
        span.setAttribute("aria-label", "Possible misspelling: " + word + ". Press Enter for suggestions.");
        el.appendChild(span);
      } else {
        el.appendChild(document.createTextNode(word));
      }
      last = m.index + word.length;
    }
    if (last < raw.length) el.appendChild(document.createTextNode(raw.slice(last)));
  }

  var spellPop = null;
  function closeSpellPop() {
    if (spellPop && spellPop.parentNode) spellPop.parentNode.removeChild(spellPop);
    spellPop = null;
  }

  function openSpellPop(span) {
    closeSpellPop();
    var word = span.textContent;
    var low = word.toLowerCase();
    var sugg = SPELL_DICT[low] || [word];
    spellPop = document.createElement("div");
    spellPop.className = "pm-spell-pop";
    spellPop.innerHTML = '<div class="pm-spell-pop-title">Suggestions for <b></b></div>';
    spellPop.querySelector("b").textContent = word;
    sugg.forEach(function (s) {
      var b = document.createElement("button");
      b.className = "pm-spell-sugg";
      b.textContent = s;
      b.addEventListener("click", function () {
        span.textContent = s;
        span.classList.remove("pm-spell");
        span.removeAttribute("tabindex");
        window.PMState.receipt("Replaced once", word + " changed to " + s + " in this draft only. The dictionary was not changed.", "ok");
        closeSpellPop();
      });
      spellPop.appendChild(b);
    });
    var actions = [
      ["Ignore once", function () { span.classList.remove("pm-spell"); span.removeAttribute("tabindex"); closeSpellPop(); }],
      ["Ignore for this draft", function () { ignoredWords[low] = true; document.querySelectorAll(".pm-spell").forEach(function (n) { if (n.textContent.toLowerCase() === low) { n.classList.remove("pm-spell"); n.removeAttribute("tabindex"); } }); closeSpellPop(); }],
      ["Add to personal dictionary", function () { window.PMState.addToDictionary("personal", low); refreshSpans(low); closeSpellPop(); }],
      ["Add to project dictionary", function () { window.PMState.addToDictionary("project", low); refreshSpans(low); closeSpellPop(); }]
    ];
    actions.forEach(function (a) {
      var b = document.createElement("button");
      b.className = "pm-spell-act";
      b.textContent = a[0];
      b.addEventListener("click", a[1]);
      spellPop.appendChild(b);
    });
    document.body.appendChild(spellPop);
    var r = span.getBoundingClientRect();
    var pw = 240;
    var left = Math.min(Math.max(8, r.left), window.innerWidth - pw - 8);
    var top = r.bottom + 6;
    if (top + 220 > window.innerHeight) top = Math.max(8, r.top - 226);
    spellPop.style.left = left + "px";
    spellPop.style.top = top + "px";
    spellPop.style.width = pw + "px";
  }

  function refreshSpans(low) {
    document.querySelectorAll(".pm-spell").forEach(function (n) {
      if (n.textContent.toLowerCase() === low) { n.classList.remove("pm-spell"); n.removeAttribute("tabindex"); }
    });
  }

  document.addEventListener("click", function (e) {
    var span = e.target.closest ? e.target.closest(".pm-spell") : null;
    if (span) { openSpellPop(span); return; }
    if (spellPop && !(e.target.closest && e.target.closest(".pm-spell-pop"))) closeSpellPop();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.classList && e.target.classList.contains("pm-spell")) {
      e.preventDefault();
      openSpellPop(e.target);
    }
    if (e.key === "Escape") closeSpellPop();
  });

  window.PMCore = {
    reducedMotion: reducedMotion,
    isThemeLocked: isThemeLocked,
    buildSearchIndex: buildSearchIndex,
    search: search,
    managerTitle: managerTitle,
    parseHash: parseHash,
    viewToHash: viewToHash,
    startRouter: startRouter,
    hydrateManager: hydrateManager,
    promptDialog: promptDialog,
    closeDialog: closeDialog,
    scrollspy: scrollspy,
    focusFlash: focusFlash,
    toast: toast,
    settingMeta: settingMeta,
    attachSpellcheck: attachSpellcheck,
    decorateSpell: decorate
  };
})();
