/* ============================================================================
   ca-managers.js — CursorAuto-original shared manager builders
   ----------------------------------------------------------------------------
   window.CAManagers.defaultSeed(demo)  clone manager collections from demo
   window.CAManagers.mount(opts)        metaphor chrome + shared ca-mgr body

   For managerId === "providers", mount returns false so each concept keeps its
   own provider surface (CAViews.bindProviders). All other featured manager ids
   get a non-trivial shared body with data-ca-act / data-ca-id binders that
   mutate matching PMStore keys. Honest receipts only via PMStore.receipt.

   Depends on: PMStore, ca-components.css (.ca-mgr-*), optionally CAViews
   (mountSpellcheck). Demo extras may live on PM_SETTINGS_DEMO after
   pm-settings-demo-extra.js loads.
   ========================================================================== */
(function () {
  "use strict";

  /* Shell keys hydrate at Settings open. Manager keys hydrate lazily on open. */
  var SHELL_KEYS = ["meta", "providers"];
  var MANAGER_KEYS = [
    "memory", "personas", "crews", "contextSources", "contextBudget", "instructionChain", "mcp", "lsp",
    "skills", "plugins", "tools", "commands", "terminal", "notifications",
    "soundLibrary", "desktop", "teacher", "bsd", "permissionsRules", "goal",
    "fileManager", "formatters", "testing", "storage", "backup",
    "settingsLifecycle", "history", "artifacts", "worktrees", "githubActions",
    "containers", "web", "searchIndex", "cleanup", "serverShell",
    "appearanceThemes", "mediaProviders", "spell"
  ];
  var SEED_KEYS = SHELL_KEYS.concat(MANAGER_KEYS);
  var MANAGER_KEY_MAP = {
    memory: ["memory"], personas: ["personas"], crew: ["crews"], crews: ["crews"],
    context: ["contextSources", "contextBudget", "instructionChain"],
    mcp: ["mcp"], lsp: ["lsp"], skills: ["skills"], plugins: ["plugins"], tools: ["tools"],
    commands: ["commands"], terminal: ["terminal"], notifications: ["notifications"],
    soundLibrary: ["soundLibrary"], desktop: ["desktop"], teacher: ["teacher"],
    bsd: ["bsd"], permissions: ["permissionsRules"], goal: ["goal"],
    fileManager: ["fileManager"], formatters: ["formatters"], testing: ["testing"],
    storage: ["storage"], backup: ["backup"], settingsLifecycle: ["settingsLifecycle"],
    history: ["history"], artifacts: ["artifacts"], worktrees: ["worktrees"],
    githubActions: ["githubActions"], containers: ["containers"], web: ["web"],
    searchIndex: ["searchIndex"], cleanup: ["cleanup"], serverShell: ["serverShell"],
    appearance: ["appearanceThemes"], media: ["mediaProviders"], spellcheck: ["spell"]
  };
  var _hydrated = Object.create(null);
  var _activeScope = null;
  var _mounting = false;

  var TITLES = {
    memory: "Memory",
    personas: "Personas",
    crews: "Crew",
    contextSources: "Context sources",
    mcp: "MCP servers",
    lsp: "Language servers",
    skills: "Skills",
    plugins: "Plugins",
    tools: "Tools",
    commands: "Commands",
    terminal: "Terminal",
    notifications: "Notifications",
    soundLibrary: "Sound library",
    desktop: "Desktop",
    teacher: "Teacher tips",
    bsd: "Back Seat Driver",
    permissionsRules: "Permission rules",
    goal: "Goal ceilings",
    fileManager: "File manager",
    formatters: "Formatters",
    testing: "Testing",
    storage: "Storage",
    backup: "Backup",
    settingsLifecycle: "Settings lifecycle",
    history: "History",
    artifacts: "Artifacts",
    worktrees: "Worktrees",
    githubActions: "GitHub Actions",
    containers: "Containers",
    web: "Web",
    searchIndex: "Search index",
    cleanup: "Cleanup",
    serverShell: "Servers & hosts",
    appearanceThemes: "Appearance themes",
    mediaProviders: "Media providers",
    spell: "Spellcheck"
  };

  var ALIASES = {
    appearanceMgr: "appearanceThemes",
    appearance: "appearanceThemes",
    spellcheck: "spell",
    crew: "crews",
    context: "contextSources",
    permissions: "permissionsRules"
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function clone(o) {
    return o == null ? o : JSON.parse(JSON.stringify(o));
  }

  function storeGet(path, fb) {
    return window.PMStore ? PMStore.get(path, fb) : fb;
  }

  function storeSet(path, value) {
    if (window.PMStore) PMStore.set(path, value);
  }

  function receipt(text, kind) {
    if (window.PMStore) PMStore.receipt(text, kind || "info");
  }

  function resolveId(id) {
    return ALIASES[id] || id;
  }

  /* ---------- seed ---------- */

  function mapSpell(demo) {
    if (demo.spell) return clone(demo.spell);
    var sc = demo.spellcheck;
    if (!sc) return null;
    return {
      mode: "Normal",
      enabled: Boolean(sc.enabled),
      language: sc.language || "Automatic",
      dictionarySource: sc.dictionarySource || "Automatic",
      personal: (sc.personalDictionary || []).slice(),
      project: (sc.projectDictionary || []).slice(),
      checkTechnicalProse: Boolean(sc.checkTechnicalProse),
      underlineUnknownNames: Boolean(sc.underlineUnknownNames),
      neverAutoReplace: true,
      demoParagraph: sc.demoParagraph || ""
    };
  }

  function defaultSeed(demo, opts) {
    demo = demo || window.PM_SETTINGS_DEMO || {};
    opts = opts || {};
    var eager = !!opts.eagerAll;
    var keys = eager ? SEED_KEYS : SHELL_KEYS;
    var out = {};
    var i, k, v;
    for (i = 0; i < keys.length; i++) {
      k = keys[i];
      if (k === "spell") continue;
      if (Object.prototype.hasOwnProperty.call(demo, k) && demo[k] != null) {
        out[k] = clone(demo[k]);
      }
    }
    /* Home notices/search need light catalog pointers only — full manager bodies stay cold. */
    out._hydration = { mode: eager ? "eager-all" : "shell-first", hydrated: [] };
    if (!eager) {
      Object.keys(_hydrated).forEach(function (hk) { delete _hydrated[hk]; });
    }
    return out;
  }

  function quietSet(path, value) {
    if (window.PMStore && typeof PMStore.setQuiet === "function") PMStore.setQuiet(path, value);
    else storeSet(path, value);
  }

  function hydrateManager(managerId, demo) {
    demo = demo || window.PM_SETTINGS_DEMO || {};
    var id = resolveId(managerId);
    var keys = MANAGER_KEY_MAP[id] || MANAGER_KEY_MAP[managerId] || [];
    if (!keys.length) return [];
    var added = [];
    keys.forEach(function (k) {
      if (_hydrated[k]) return;
      if (k === "spell") {
        var mapped = mapSpell(demo);
        if (mapped != null) {
          quietSet("spell", mapped);
          _hydrated[k] = true;
          added.push(k);
        }
        return;
      }
      if (Object.prototype.hasOwnProperty.call(demo, k) && demo[k] != null) {
        quietSet(k, clone(demo[k]));
        _hydrated[k] = true;
        added.push(k);
      }
    });
    var hyd = storeGet("_hydration", { mode: "shell-first", hydrated: [] });
    hyd = clone(hyd) || { mode: "shell-first", hydrated: [] };
    hyd.hydrated = (hyd.hydrated || []).concat(added);
    quietSet("_hydration", hyd);
    return added;
  }

  function disposeActiveScope() {
    if (_activeScope && typeof _activeScope.dispose === "function") {
      try { _activeScope.dispose(); } catch (err) {}
    }
    _activeScope = null;
    if (window.CAObservableWork && CAObservableWork.disposeAll) {
      try { CAObservableWork.disposeAll(); } catch (err2) {}
    }
  }

  /* ---------- chrome + shared atoms ---------- */

  function healthStrip(text, kind) {
    return '<div class="ca-mgr-health" data-kind="' + esc(kind || "ok") + '">' +
      '<span class="ca-healthdot" data-state="' + esc(kind === "warn" ? "warn" : kind === "danger" ? "error" : "ok") + '">' +
      '<span class="ca-healthdot-dot"></span></span>' +
      '<span>' + esc(text) + "</span></div>";
  }

  function filterBar(placeholder, extra) {
    return '<div class="ca-mgr-filter">' +
      '<input type="search" data-ca-act="filter" placeholder="' + esc(placeholder || "Filter") + '" aria-label="Filter">' +
      (extra || "") +
      "</div>";
  }

  function muted(text) {
    return '<p class="ca-mgr-muted">' + esc(text) + "</p>";
  }

  function reqEff(req, eff) {
    return '<div class="ca-req-eff" title="Requested vs effective">' +
      '<span data-side="req">Requested: ' + esc(req) + "</span>" +
      '<span data-side="eff">Effective: ' + esc(eff) + "</span></div>";
  }

  function btn(act, id, label, variant) {
    return '<button type="button" class="ca-btn" data-variant="' + esc(variant || "quiet") +
      '" data-ca-act="' + esc(act) + '"' +
      (id != null ? ' data-ca-id="' + esc(id) + '"' : "") +
      ">" + esc(label) + "</button>";
  }

  function switchCtl(act, id, on, label) {
    return '<span class="ca-switch-wrap">' +
      '<button type="button" class="ca-switch" role="switch" aria-checked="' +
      (Boolean(on) ? "true" : "false") + '" data-ca-act="' + esc(act) +
      '" data-ca-id="' + esc(id) + '" aria-label="' + esc(label || act) + '"></button>' +
      (label ? '<span class="ca-switch-label">' + esc(label) + "</span>" : "") +
      "</span>";
  }

  function emptyState(title, guidance) {
    return '<div class="ca-empty"><div class="ca-empty-title">' + esc(title) +
      '</div><div class="ca-empty-guidance">' + esc(guidance || "") + "</div></div>";
  }

  function detailPane(html) {
    return '<div class="ca-mgr-detail-pane">' + (html || "") + "</div>";
  }

  function findById(list, id) {
    var i;
    for (i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return list[i];
    return null;
  }

  function rerender(opts) {
    if (typeof opts.rerender === "function") opts.rerender();
    else mount(opts);
  }

  function onAct(root, handler) {
    root.addEventListener("click", function (ev) {
      var t = ev.target.closest("[data-ca-act]");
      if (!t || !root.contains(t)) return;
      handler(t.getAttribute("data-ca-act"), t.getAttribute("data-ca-id"), t, ev);
    });
    root.addEventListener("change", function (ev) {
      var t = ev.target.closest("[data-ca-act]");
      if (!t || !root.contains(t)) return;
      handler(t.getAttribute("data-ca-act"), t.getAttribute("data-ca-id"), t, ev);
    });
  }

  /* ---------- manager bodies ---------- */

  function bodyMemory() {
    var mem = storeGet("memory", { gists: [] });
    var gists = mem.gists || mem || [];
    if (!Array.isArray(gists)) gists = mem.gists || [];
    var filter = storeGet("memory._filter", "all");
    var shown = gists.filter(function (g) {
      if (filter === "verified") return g.status === "verified";
      if (filter === "review") return g.status !== "verified";
      if (filter === "pinned") return Boolean(g.pinned);
      return true;
    });
    var segs = [["all", "All"], ["verified", "Verified"], ["review", "Awaiting review"], ["pinned", "Pinned"]].map(function (f) {
      return '<button type="button" role="radio" aria-checked="' + (filter === f[0] ? "true" : "false") +
        '" data-ca-act="mem-filter" data-ca-id="' + f[0] + '">' + f[1] + "</button>";
    }).join("");
    var cards = shown.map(function (g) {
      return '<div class="ca-mgr-card" data-ca-id="' + esc(g.id) + '">' +
        '<div class="ca-mgr-card-title">' + esc(g.text) + "</div>" +
        '<div class="ca-mgr-card-meta">' +
        '<span class="ca-badge" data-kind="scope">' + esc(g.kind) + "</span>" +
        '<span class="ca-badge" data-kind="scope">' + (g.scope === "assistant" ? "Assistant only" : "Project") + "</span>" +
        '<span class="ca-badge" data-kind="state" data-icon data-state="' + (g.status === "verified" ? "default" : "recommended") + '">' +
        (g.status === "verified" ? "Verified" : "Awaiting review") + "</span>" +
        (g.pinned ? '<span class="ca-badge" data-kind="state" data-icon data-state="managed">Pinned</span>' : "") +
        "</div>" +
        muted("Fades from active context after ~" + g.halfLifeDays + " days — it never becomes false. Last used " + (g.lastAccess || "—") + ".") +
        '<div class="ca-mgr-card-actions">' +
        (g.status !== "verified" ? btn("mem-verify", g.id, "Mark verified") : "") +
        btn("mem-pin", g.id, g.pinned ? "Unpin" : "Pin") +
        btn("mem-evidence", g.id, "Evidence") +
        btn("mem-discard", g.id, "Discard") +
        "</div>" +
        detailPane(
          "<strong>Evidence</strong><ul>" + (g.evidence || []).map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul>" +
          "<strong>Versions</strong> " + esc(String(g.versions || 1))
        ) +
        "</div>";
    }).join("") || emptyState("No Gists match", "Try another filter or rebuild the index.");
    return healthStrip(shown.length + " of " + gists.length + " Gists", "ok") +
      '<div class="ca-mgr-filter"><span class="ca-seg" role="radiogroup" aria-label="Filter Gists">' + segs + "</span>" +
      btn("mem-rebuild", null, "Rebuild index") + btn("mem-dedup", null, "Deduplicate") + "</div>" +
      muted("Assistant preference Gists stay Assistant-only. Thread history, Goal state, planning records, and artifacts are separate stores.") +
      '<div class="ca-mgr-grid">' + cards + "</div>";
  }

  function bindMemory(opts, root) {
    onAct(root, function (act, id) {
      var mem = storeGet("memory", { gists: [] });
      var gists = (mem.gists || []).slice();
      var g = findById(gists, id);
      if (act === "mem-filter") { storeSet("memory._filter", id); rerender(opts); return; }
      if (act === "mem-rebuild") { receipt("Memory index rebuild simulated — no corpus was rescanned", "info"); return; }
      if (act === "mem-dedup") { receipt("Deduplicate simulated — duplicate Gists were not merged", "info"); return; }
      if (!g) return;
      if (act === "mem-verify") { g.status = "verified"; storeSet("memory", { gists: gists }); receipt("Gist verified — its evidence stays attached", "ok"); rerender(opts); }
      else if (act === "mem-pin") { g.pinned = !g.pinned; storeSet("memory", { gists: gists }); receipt(g.pinned ? "Gist pinned — protected from fading" : "Gist unpinned", "ok"); rerender(opts); }
      else if (act === "mem-discard") { storeSet("memory", { gists: gists.filter(function (x) { return x.id !== id; }) }); receipt("Gist discarded from the demo store", "warn"); rerender(opts); }
      else if (act === "mem-evidence") { receipt("Evidence panel toggled in the card detail pane", "info"); }
    });
  }

  function bodyPersonas() {
    var personas = storeGet("personas", []);
    var scopeOpts = ["turn", "thread", "goal", "project", "global", "child"];
    var cards = personas.map(function (p) {
      var opts = (p.scopes || scopeOpts).map(function (s) {
        var disabled = p.childOnly && s !== "child";
        return '<option value="' + esc(s) + '"' + (p.scopeChoice === s || p.currentScope && String(p.currentScope).toLowerCase().indexOf(s) !== -1 ? " selected" : "") +
          (disabled ? " disabled" : "") + ">" + esc(s.charAt(0).toUpperCase() + s.slice(1)) + "</option>";
      }).join("");
      return '<div class="ca-mgr-card">' +
        '<div class="ca-mgr-card-title">' + esc(p.name) +
        (p.childOnly ? ' <span class="ca-badge" data-kind="exposure" data-icon data-exposure="managed">Child only</span>' : "") + "</div>" +
        muted(p.roleSummary || "") +
        '<div class="ca-panel"><div class="ca-panel-h">Capsule</div><p class="ca-mgr-muted">' + esc(p.capsule || "") + "</p></div>" +
        '<label class="ca-mgr-muted">Scope <span class="ca-select"><select data-ca-act="persona-scope" data-ca-id="' + esc(p.id) + '">' + opts + "</select></span></label>" +
        muted("Currently: " + (p.currentScope || "Unset") + ". Personas cannot widen Plan/Review mode, permissions, FileSafe, network, or parent ceilings.") +
        "</div>";
    }).join("") || emptyState("No personas", "Seed personas from the demo dataset.");
    return healthStrip(personas.length + " personas", "ok") + muted("A persona is a durable definition plus a compact model-facing capsule — not an account, model, or permission grant.") +
      '<div class="ca-mgr-grid">' + cards + "</div>";
  }

  function bindPersonas(opts, root) {
    onAct(root, function (act, id, el) {
      if (act !== "persona-scope") return;
      var personas = storeGet("personas", []).slice();
      personas.forEach(function (p) {
        if (p.id === id) {
          p.scopeChoice = el.value;
          p.currentScope = el.value.charAt(0).toUpperCase() + el.value.slice(1);
        }
      });
      storeSet("personas", personas);
      receipt("Persona scope set to " + el.value + " (simulated)", "ok");
      rerender(opts);
    });
  }

  function bodyCrews() {
    var crews = storeGet("crews", []);
    var cards = crews.map(function (c) {
      var seats = "";
      var i;
      for (i = 0; i < (c.membersEffective || 0); i++) seats += '<span class="ca-badge" data-kind="state" data-icon data-state="auto">Seat ' + (i + 1) + " running</span> ";
      for (i = 0; i < Math.max(0, (c.membersRequested || 0) - (c.membersEffective || 0)); i++) seats += '<span class="ca-badge" data-kind="scope">Queued wave</span> ';
      var roles = (c.roles || []).map(function (r) {
        return '<div class="ca-row"><div class="ca-row-main"><div class="ca-row-label">' + esc(r.role) +
          ' <span class="ca-badge" data-kind="scope">Persona: ' + esc(r.persona) + "</span></div>" +
          '<div class="ca-row-desc">Candidates: ' + esc((r.candidates || []).join(" · ")) + "</div></div></div>";
      }).join("");
      return '<div class="ca-mgr-card">' +
        '<div class="ca-mgr-card-title">' + esc(c.name) + "</div>" +
        muted(c.purpose || "") +
        reqEff(String(c.membersRequested || 0) + " members", String(c.membersEffective || 0) + " concurrent · " + String(c.queuedWaves || 0) + " queued") +
        '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-block:8px">' + seats + "</div>" +
        muted(c.capacityNote || "") +
        roles +
        '<div class="ca-mgr-card-actions">' +
        '<span class="ca-seg" role="radiogroup" data-ca-act="crew-policy-group" data-ca-id="' + esc(c.id) + '">' +
        ["adaptive", "strict"].map(function (pol) {
          return '<button type="button" role="radio" aria-checked="' + (c.routePolicy === pol ? "true" : "false") +
            '" data-ca-act="crew-policy" data-ca-id="' + esc(c.id) + '" data-value="' + pol + '">' + esc(pol) + "</button>";
        }).join("") + "</span>" +
        btn("crew-reserve", c.id, c.reserveForSynthesis ? "Release synthesis reserve" : "Hold synthesis reserve") +
        "</div></div>";
    }).join("") || emptyState("No crews", "Seed crews from the demo dataset.");
    return healthStrip(crews.length + " crew templates", "ok") +
      muted("Settings configures policy; the Orchestrator makes the live decision. A Crew picked in one thread never changes another.") +
      '<div class="ca-mgr-grid">' + cards + "</div>";
  }

  function bindCrews(opts, root) {
    onAct(root, function (act, id, el) {
      var crews = storeGet("crews", []).slice();
      var c = findById(crews, id);
      if (!c) return;
      if (act === "crew-policy") {
        c.routePolicy = el.getAttribute("data-value") || el.textContent;
        storeSet("crews", crews);
        receipt("Crew route policy set to " + c.routePolicy + " (simulated)", "ok");
        rerender(opts);
      } else if (act === "crew-reserve") {
        c.reserveForSynthesis = !c.reserveForSynthesis;
        storeSet("crews", crews);
        receipt(c.reserveForSynthesis ? "Synthesis reserve held" : "Synthesis reserve released", "ok");
        rerender(opts);
      }
    });
  }


  function bodyContext() {
    var sources = storeGet("contextSources", []);
    var budget = storeGet("contextBudget", (window.PM_SETTINGS_DEMO && PM_SETTINGS_DEMO.contextBudget) || {
      tokensAvailable: 12000, tokensProjected: 0, competitionNote: "Admitted sources still compete for budget."
    });
    var chain = storeGet("instructionChain", (window.PM_SETTINGS_DEMO && PM_SETTINGS_DEMO.instructionChain) || []);
    var projected = budget.tokensProjected || sources.reduce(function (n, s) {
      var m = String(s.provenance || "").match(/(\d+)\s*tokens/i);
      return n + (m ? Number(m[1]) : (s.admittedLastTurn ? 400 : 0));
    }, 0);
    var avail = budget.tokensAvailable || 12000;
    var pct = Math.min(100, Math.round((projected / avail) * 100));
    var chainHtml = (chain || []).map(function (c, idx) {
      return '<div class="ca-mgr-card ca-motion-stagger" style="--ca-stagger:' + (idx * 40) + 'ms">' +
        '<div class="ca-mgr-card-title">' + esc(c.title) +
        (c.wins ? ' <span class="ca-badge" data-kind="state" data-icon data-state="recommended">Nearest wins</span>' : "") +
        "</div>" + muted((c.tokens != null ? c.tokens + " tokens" : "") + (c.note ? " · " + c.note : "")) +
        "</div>";
    }).join("");
    var rows = sources.map(function (s, idx) {
      return '<div class="ca-mgr-card ca-motion-stagger" style="--ca-stagger:' + (Math.min(idx, 6) * 35) + 'ms" data-ca-id="' + esc(s.id) + '">' +
        '<div class="ca-mgr-card-title">' + esc(s.label || s.name || s.id) +
        ' <span class="ca-badge" data-kind="scope">' + esc(s.kind || "source") + "</span>" +
        ' <span class="ca-badge" data-kind="state" data-icon data-state="' + (s.admittedLastTurn ? "auto" : "not-configured") + '">' +
        (s.admittedLastTurn ? "Admitted last turn" : "Omitted last turn") + "</span></div>" +
        muted(s.detail || "") +
        muted("Provenance: " + (s.provenance || "—") + " · Budget: " + (s.budgetShare || (s.admittedLastTurn ? "competing" : "standby"))) +
        '<div class="ca-mgr-card-actions">' +
        switchCtl("ctx-admit", s.id, !!s.admittedLastTurn, "Prefer admitting") +
        btn("ctx-inspect", s.id, "Inspect provenance") +
        btn("ctx-pin", s.id, "Pin scope") +
        btn("ctx-omit", s.id, "Force omit next") +
        "</div></div>";
    }).join("") || emptyState("No context sources", "Seed contextSources from the demo dataset.");
    return healthStrip(sources.length + " sources · " + projected + "/" + avail + " tokens projected", pct > 85 ? "warn" : "ok") +
      muted(budget.competitionNote || "What may enter the next turn — prefer-admit is not a guarantee.") +
      '<div class="ca-budget" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" data-ca-budget="' + pct + '">' +
      '<div class="ca-budget-label">Turn budget projection</div>' +
      '<div class="ca-budget-track"><div class="ca-budget-fill" style="inline-size:' + pct + '%"></div></div>' +
      muted(projected + " projected of " + avail + " available") +
      "</div>" +
      (chainHtml ? '<div class="ca-panel"><div class="ca-panel-h">Instruction chain</div><div class="ca-mgr-grid">' + chainHtml + "</div></div>" : "") +
      '<div class="ca-mgr-filter">' + btn("ctx-add", null, "Add source") + btn("ctx-refresh", null, "Recompute budget") + "</div>" +
      '<div class="ca-mgr-grid" data-ca-motion="resource-grid">' + rows + "</div>" +
      detailPane('<div data-ca-phase class="ca-mgr-muted">Context receipts and provenance appear here.</div>');
  }



  function bindContext(opts, root) {
    onAct(root, function (act, id) {
      var pane = root.querySelector("[data-ca-phase]");
      function phase(msg, k) { if (pane) pane.textContent = msg; receipt(msg, k || "info"); }
      var sources = storeGet("contextSources", []).slice();
      if (act === "ctx-add") {
        sources.push({
          id: "ctx-" + Date.now(),
          label: "Pinned snippet",
          kind: "snippet",
          admittedLastTurn: false,
          detail: "Added in demo — not a real file read",
          provenance: "Manual pin · 0 tokens until admitted",
          budgetShare: "standby"
        });
        storeSet("contextSources", sources);
        phase("Add source receipt: pinned snippet appended (simulated)", "ok");
        rerender(opts); return;
      }
      if (act === "ctx-refresh") {
        root.setAttribute("data-ca-work", "refresh");
        window.setTimeout(function () { root.removeAttribute("data-ca-work");
          if (typeof __ow !== "undefined" && __ow) __ow.update({ state: "completed", human_phase: "Complete", progress_kind: "none", message: "Refresh finished (simulated)" }); }, 520);
        phase("Budget recomputed from admitted provenance lines (simulated)", "ok");
        rerender(opts); return;
      }
      var s = findById(sources, id);
      if (!s) return;
      if (act === "ctx-admit") {
        s.admittedLastTurn = !s.admittedLastTurn;
        s.budgetShare = s.admittedLastTurn ? "competing" : "standby";
        storeSet("contextSources", sources);
        phase((s.label || id) + (s.admittedLastTurn ? " marked prefer-admit" : " marked omit-prefer") + " (simulated)", "ok");
        rerender(opts);
      } else if (act === "ctx-inspect") {
        phase("Provenance: " + (s.provenance || "none") + " — no host files opened", "info");
      } else if (act === "ctx-pin") {
        s.detail = (s.detail || "") + (/\bPinned\b/.test(s.detail || "") ? "" : " · Pinned for this project");
        storeSet("contextSources", sources);
        phase("Pin scope receipt: " + (s.label || id) + " pinned in demo store", "ok");
        rerender(opts);
      } else if (act === "ctx-omit") {
        s.admittedLastTurn = false;
        s.budgetShare = "standby";
        storeSet("contextSources", sources);
        phase("Force omit receipt: " + (s.label || id) + " will sit out the next turn (simulated)", "warn");
        rerender(opts);
      }
    });
  }


  /* Resource-style managers: restart / logs / connect */

  function resourceCard(item, kind) {
    var name = item.name || item.label || item.id;
    var health = item.health || item.state || item.status || "unknown";
    var meta = item.transport || item.language || item.source || item.channel || item.owner || item.shortcut || "";
    return '<div class="ca-mgr-card" data-ca-id="' + esc(item.id) + '">' +
      '<div class="ca-mgr-card-title">' + esc(name) +
      ' <span class="ca-badge" data-kind="scope">' + esc(String(health)) + "</span></div>" +
      (meta ? muted(String(meta)) : "") +
      (item.lastError ? '<div class="ca-row-reason">' + esc(item.lastError) + "</div>" : "") +
      (item.note ? muted(item.note) : "") +
      (item.failureReason ? muted(item.failureReason) : "") +
      '<div class="ca-mgr-card-actions">' +
      btn(kind + "-restart", item.id, "Restart") +
      btn(kind + "-logs", item.id, "Logs") +
      btn(kind + "-connect", item.id, "Connect") +
      (kind === "skills" || kind === "plugins" || kind === "tools" ? switchCtl(kind + "-toggle", item.id, item.enabled !== false && item.state !== "failed" && item.projectEnabled !== false, "Enable " + name) : "") +
      "</div>" +
      detailPane(item.logs ? '<div class="ca-logs">' + (item.logs || []).map(function (l) {
        return '<div class="ca-log-line">' + esc(typeof l === "string" ? l : (l.at ? l.at + " — " + l.summary : JSON.stringify(l))) + "</div>";
      }).join("") + "</div>" : "") +
      "</div>";
  }

  function bindResourceList(opts, root, key, kind) {
    onAct(root, function (act, id) {
      var pane = root.querySelector("[data-ca-phase]");
      function phase(msg, k) {
        if (pane) {
          pane.textContent = msg;
          pane.setAttribute("data-ca-phase-kind", k || "info");
        }
        receipt(msg, k || "info");
      }
            if (act === key + "-virt-prev" || act === key + "-virt-next") {
        var virtKey = "_virt_" + key;
        var vs = storeGet(virtKey, { offset: 0 });
        var rawList = storeGet(key, []);
        var full = Array.isArray(rawList) ? rawList : (rawList && rawList.profiles) ? rawList.profiles : (rawList && rawList.items) ? rawList.items : [];
        var step = 40;
        vs.offset = act.indexOf("prev") >= 0 ? Math.max(0, (vs.offset || 0) - step) : Math.min(Math.max(0, full.length - 1), (vs.offset || 0) + step);
        storeSet(virtKey, vs);
        rerender(opts);
        return;
      }
      if (act === key + "-refresh") {
        root.setAttribute("data-ca-work", "refresh");
        var __owHost = (window.CAObservableWork && CAObservableWork.ensureHost) ? CAObservableWork.ensureHost(root) : null;
        var __ow = (__owHost && window.CAObservableWork) ? CAObservableWork.attach({ host: __owHost, receipt: false, snapshot: { title: "Manager work", human_phase: "Starting", state: "starting", progress_kind: "indeterminate", progress_source: "derived" } }) : null;
        ((opts && opts._caScope && opts._caScope.trackTimeout) ? opts._caScope.trackTimeout : window.setTimeout)(function () { root.removeAttribute("data-ca-work"); }, 520);
        phase("Refresh discovery receipt: rescanned " + kind + " (simulated)", "ok");
        return;
      }
      if (act === key + "-add") {
        phase("Add " + kind + " receipt: chooser opened (simulated)", "info");
        return;
      }
      if (act === key + "-open" || act === key + "-inspect") {
        phase((act.indexOf("inspect") !== -1 ? "Inspect" : "Open") + " receipt: " + id + " — no host process touched", "info");
        return;
      }
      if (act === key + "-restart") {
        phase("Restart receipt: " + id + " recycle queued (simulated)", "warn");
        return;
      }
      if (act === key + "-logs" || act === key + "-log") {
        phase("Logs receipt: " + id + " — last 40 lines attached to the demo pane (simulated)", "info");
        return;
      }
      if (act === key + "-connect" || act === key + "-configure") {
        phase("Configure receipt: " + id + " setup sheet opened (simulated)", "info");
        return;
      }
      if (act === key + "-toggle" || act === key + "-enable") {
        var rawT = storeGet(key, []);
        var arrT = Array.isArray(rawT) ? rawT : (rawT && (rawT.items || rawT.profiles || rawT.list)) || [];
        var rowT = findById(arrT, id);
        if (rowT) {
          if (typeof rowT.enabled === "boolean") rowT.enabled = !rowT.enabled;
          else if (typeof rowT.active === "boolean") rowT.active = !rowT.active;
          else rowT.enabled = true;
          if (Array.isArray(rawT)) storeSet(key, arrT);
          else {
            var objT = clone(rawT) || {};
            if (rawT.items) objT.items = arrT;
            else if (rawT.profiles) objT.profiles = arrT;
            else if (rawT.list) objT.list = arrT;
            storeSet(key, objT);
          }
          phase("Toggle receipt: " + id + " updated in demo store", "ok");
          rerender(opts);
        } else {
          phase("Toggle receipt: " + id + " (no mutable row — simulated)", "info");
        }
        return;
      }
      if (act === key + "-remove") {
        var raw = storeGet(key, []);
        if (Array.isArray(raw)) {
          storeSet(key, raw.filter(function (x) { return (x.id || x.name || x.title) !== id; }));
        } else if (raw && Array.isArray(raw.items)) {
          var obj = clone(raw); obj.items = (obj.items || []).filter(function (x) { return (x.id || x.name || x.title) !== id; }); storeSet(key, obj);
        } else if (raw && Array.isArray(raw.profiles)) {
          var obj2 = clone(raw); obj2.profiles = (obj2.profiles || []).filter(function (x) { return (x.id || x.name || x.title) !== id; }); storeSet(key, obj2);
        }
        phase("Remove receipt: " + id + " removed from demo store", "warn");
        rerender(opts);
      }
    });
  }


  function bodyMcp() {
    var list = storeGet("mcp", []);
    return healthStrip(list.length + " MCP servers", list.some(function (s) { return s.health === "degraded" || s.health === "connecting"; }) ? "warn" : "ok") +
      filterBar("Filter servers", btn("mcp-add", null, "Add a server")) +
      muted("Tools load lazily. This manager is the canonical state — provider projections are informational.") +
      '<div class="ca-mgr-grid">' + (list.map(function (s) {
        var tools = (s.tools || []).map(function (t) {
          return '<span class="ca-badge" data-kind="scope">' + esc(t.name) + " · " + esc(t.exposure || "lazy") + (t.invoked ? " · invoked" : "") + "</span>";
        }).join(" ");
        return '<div class="ca-mgr-card">' +
          '<div class="ca-mgr-card-title">' + esc(s.name) + ' <span class="ca-badge" data-kind="scope">' + esc(s.health) + "</span></div>" +
          muted((s.transport || "") + " · scope " + (s.scope || "project") +
            (s.protocol ? " · protocol requested " + s.protocol.requested + " / negotiated " + s.protocol.negotiated : "")) +
          '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-block:6px">' + tools + "</div>" +
          (s.lastError ? '<div class="ca-row-reason">' + esc(s.lastError) + "</div>" : "") +
          '<label class="ca-mgr-muted">Approval <span class="ca-select"><select data-ca-act="mcp-policy" data-ca-id="' + esc(s.id) + '">' +
          ["Ask each time", "Remember for this session", "Remember for this Goal", "Always for this server"].map(function (pol) {
            return '<option' + (pol === s.approvalPolicy ? " selected" : "") + ">" + esc(pol) + "</option>";
          }).join("") + "</select></span></label>" +
          '<div class="ca-mgr-card-actions">' + btn("mcp-restart", s.id, "Restart") + btn("mcp-logs", s.id, "Logs") + btn("mcp-connect", s.id, "Reconnect") + "</div>" +
          detailPane('<div class="ca-logs">' + (s.logs || []).map(function (l) { return '<div class="ca-log-line">' + esc(l) + "</div>"; }).join("") + "</div>") +
          "</div>";
      }).join("") || emptyState("No MCP servers", "Add a server to begin.")) + "</div>";
  }

  function bindMcp(opts, root) {
    bindResourceList(opts, root, "mcp", "mcp");
    onAct(root, function (act, id, el) {
      if (act === "mcp-add") { receipt("Add-server simulated — no server was installed or contacted", "info"); return; }
      if (act !== "mcp-policy") return;
      var list = storeGet("mcp", []).slice();
      var s = findById(list, id);
      if (!s) return;
      s.approvalPolicy = el.value;
      storeSet("mcp", list);
      receipt("Approval policy updated for " + s.name + " (simulated)", "ok");
    });
  }

  
  function windowedList(list, opts) {
    opts = opts || {};
    var threshold = opts.threshold || 24;
    var windowSize = opts.windowSize || 40;
    list = Array.isArray(list) ? list : [];
    if (list.length <= threshold) {
      return { items: list, offset: 0, total: list.length, windowed: false, htmlNote: "" };
    }
    var offset = Math.max(0, Math.min(list.length - 1, opts.offset || 0));
    var slice = list.slice(offset, offset + windowSize);
    var note = '<div class="ca-row-desc" data-ca-virt="1">Showing ' + (offset + 1) + "–" +
      (offset + slice.length) + " of " + list.length +
      " (virtualized for older hardware / large catalogs). " +
      '<button type="button" class="ca-btn" data-variant="quiet" data-ca-act="' + esc(opts.prevAct || "virt-prev") + '">Previous</button> ' +
      '<button type="button" class="ca-btn" data-variant="quiet" data-ca-act="' + esc(opts.nextAct || "virt-next") + '">Next</button></div>';
    return { items: slice, offset: offset, total: list.length, windowed: true, htmlNote: note };
  }

  function humanResourceDetail(item) {
    var parts = [item.version, item.scope, item.origin, item.note, item.detail];
    if (item.displayLabel) parts.unshift(item.displayLabel);
    else if (item.host || item.environment) parts.unshift([item.host, item.environment].filter(Boolean).join(" / "));
    /* Raw path/digest stay out of normal GUI. */
    return parts.filter(Boolean).join(" · ");
  }

function bodySimpleResources(key, kind, note) {
    var raw = storeGet(key, []);
    var list = Array.isArray(raw) ? raw : (raw && raw.profiles) ? raw.profiles : (raw && raw.items) ? raw.items : [];
    var virtKey = "_virt_" + key;
    var virtState = storeGet(virtKey, { offset: 0 });
    var win = windowedList(list, { offset: virtState.offset || 0, prevAct: key + "-virt-prev", nextAct: key + "-virt-next" });
    var cards = win.items.map(function (item, idx) {
      var name = item.title || item.name || item.label || item.id || (kind + " " + (idx + 1));
      var state = item.state || item.status || item.health || "ready";
      var detail = humanResourceDetail(item);
      var delay = Math.min(idx, 6) * 35;
      return '<div class="ca-mgr-card ca-motion-stagger" style="--ca-stagger:' + delay + 'ms">' +
        '<div class="ca-mgr-card-title">' + esc(name) +
        ' <span class="ca-badge" data-kind="state" data-icon data-state="' + esc((state === "ready" || state === "ok") ? "default" : "recommended") + '">' + esc(state) + "</span></div>" +
        muted(detail || note || "") +
        '<div class="ca-mgr-card-actions">' +
        btn(key + "-open", item.id || name, "Open") +
        btn(key + "-inspect", item.id || name, "Inspect") +
        btn(key + "-restart", item.id || name, "Restart") +
        btn(key + "-remove", item.id || name, "Remove") +
        "</div></div>";
    }).join("") || emptyState("No " + kind + " yet", note || ("Add or detect " + kind + " for this project."));
    return healthStrip(list.length + " " + kind, list.length ? "ok" : "warn") +
      muted(note || "") +
      (win.htmlNote || "") +
      '<div class="ca-mgr-filter">' +
      btn(key + "-refresh", null, "Refresh discovery") +
      btn(key + "-add", null, "Add") +
      "</div>" +
      '<div class="ca-mgr-grid" data-ca-motion="resource-grid">' + cards + "</div>" +
      detailPane('<div data-ca-phase class="ca-mgr-muted">Discovery and lifecycle receipts appear here.</div><div class="ca-ow-host" data-ca-ow-host="1" hidden></div>');
  }


  function stateBadge(state) {
    var s = String(state || "ready").toLowerCase();
    var kind = "default";
    if (/fail|error|unavail|blocked|attention|warn|conflict|detected|not-configured|connecting/.test(s)) kind = "recommended";
    if (/legal|hold|danger|quarantine/.test(s)) kind = "attention";
    if (/managed|active|healthy|ok|ready|default/.test(s)) kind = (kind === "recommended" ? kind : "default");
    return ' <span class="ca-badge" data-kind="state" data-icon data-state="' + esc(kind === "attention" ? "attention" : kind === "recommended" ? "recommended" : "default") + '">' + esc(state || "ready") + "</span>";
  }

  function bodyLsp() {
    var list = storeGet("lsp", []);
    if (!Array.isArray(list)) list = [];
    var cards = list.map(function (s, idx) {
      var caps = (s.capabilities || []).slice(0, 4).join(" · ");
      return '<div class="ca-mgr-card ca-motion-stagger" style="--ca-stagger:' + (Math.min(idx,6)*35) + 'ms">' +
        '<div class="ca-mgr-card-title">' + esc(s.name || s.id) + stateBadge(s.state) + "</div>" +
        muted((s.language || "") + (s.version ? " · v" + s.version : "") + (s.scope ? " · " + s.scope : "") + (s.startupMode ? " · " + s.startupMode : "")) +
        muted("Formatting: " + (s.formattingOwner || "—") + " · Diagnostics: " + (s.diagnosticsOwner || "—")) +
        (caps ? muted("Capabilities: " + caps) : "") +
        ((s.logs && s.logs.length) ? '<div class="ca-logs">' + s.logs.slice(-3).map(function (l) {
          return '<div class="ca-log-line">' + esc(l) + "</div>";
        }).join("") + "</div>" : "") +
        '<div class="ca-mgr-card-actions">' +
        btn("lsp-restart", s.id, "Restart") +
        btn("lsp-logs", s.id, "Logs") +
        btn("lsp-inspect", s.id, "Inspect") +
        (String(s.state).indexOf("detect") !== -1 || String(s.state).indexOf("not") !== -1 ? btn("lsp-connect", s.id, "Install / connect") : "") +
        "</div></div>";
    }).join("") || emptyState("No language servers", "Detect or connect language servers for this project.");
    var warn = list.some(function (s) { return /error|detect|fail|not/.test(String(s.state || "").toLowerCase()); });
    return healthStrip(list.length + " language servers", warn ? "warn" : "ok") +
      muted("Formatting and diagnostics ownership stay explicit per language. Restart and logs are simulated — no host LSP process is touched.") +
      '<div class="ca-mgr-filter">' + btn("lsp-refresh", null, "Rescan workspace") + btn("lsp-add", null, "Connect server") + "</div>" +
      '<div class="ca-mgr-grid" data-ca-motion="resource-grid">' + cards + "</div>" +
      detailPane('<div data-ca-phase class="ca-mgr-muted">LSP lifecycle receipts appear here.</div>');
  }
  function bodySkills() {
    var list = storeGet("skills", []);
    if (!Array.isArray(list)) list = [];
    var cards = list.map(function (s, idx) {
      var perms = (s.permissions || []).join(", ");
      return '<div class="ca-mgr-card ca-motion-stagger" style="--ca-stagger:' + (Math.min(idx,6)*35) + 'ms">' +
        '<div class="ca-mgr-card-title">' + esc(s.name || s.id) +
        (s.trusted ? ' <span class="ca-badge" data-kind="state" data-icon data-state="managed">Trusted</span>' : ' <span class="ca-badge" data-kind="state" data-icon data-state="recommended">Untrusted</span>') +
        (s.enabled ? "" : ' <span class="ca-badge" data-kind="scope">Off</span>') + "</div>" +
        muted((s.source || "Unknown source") + " · " + (s.scope || "project") + (s.updatedAt ? " · updated " + s.updatedAt : "")) +
        (perms ? muted("Permissions: " + perms) : muted("No extra permissions declared")) +
        '<div class="ca-mgr-card-actions">' +
        switchCtl("skills-toggle", s.id, !!s.enabled, s.enabled ? "Enabled" : "Enable") +
        btn("skills-inspect", s.id, "Inspect") +
        btn("skills-open", s.id, "Open source") +
        (!s.trusted ? btn("skills-trust", s.id, "Mark trusted") : "") +
        "</div></div>";
    }).join("") || emptyState("No skills", "Built-in and registry skills appear here once seeded.");
    return healthStrip(list.length + " skills", list.some(function (s) { return !s.trusted && s.enabled; }) ? "warn" : "ok") +
      muted("Skills are trusted capabilities with explicit permissions. Enabling never widens Plan/Review or FileSafe ceilings.") +
      '<div class="ca-mgr-filter">' + btn("skills-refresh", null, "Refresh registry") + btn("skills-add", null, "Add skill") + "</div>" +
      '<div class="ca-mgr-grid">' + cards + "</div>" +
      detailPane('<div data-ca-phase class="ca-mgr-muted">Skill receipts appear here.</div>');
  }
  function bodyPlugins() {
    var list = storeGet("plugins", []);
    if (!Array.isArray(list)) list = [];
    var cards = list.map(function (p, idx) {
      return '<div class="ca-mgr-card ca-motion-stagger" style="--ca-stagger:' + (Math.min(idx,6)*35) + 'ms">' +
        '<div class="ca-mgr-card-title">' + esc(p.name || p.id) + stateBadge(p.state) +
        (p.channel ? ' <span class="ca-badge" data-kind="scope">' + esc(p.channel) + "</span>" : "") + "</div>" +
        muted("v" + (p.version || "—") + ((p.requestedPermissions || []).length ? " · wants: " + (p.requestedPermissions || []).join(", ") : "")) +
        (p.failureReason ? muted("Failure: " + p.failureReason) : "") +
        '<div class="ca-mgr-card-actions">' +
        btn("plugins-inspect", p.id, "Inspect") +
        (p.state === "failed" ? btn("plugins-restart", p.id, "Retry") : btn("plugins-open", p.id, "Open")) +
        btn("plugins-remove", p.id, "Disable") +
        "</div></div>";
    }).join("") || emptyState("No plugins", "Installed plugins declare requested permissions and stay visible when failed.");
    return healthStrip(list.length + " plugins", list.some(function (p) { return p.state === "failed"; }) ? "warn" : "ok") +
      muted("Failed plugins stay listed with a reason. Disable removes them from the demo store only.") +
      '<div class="ca-mgr-filter">' + btn("plugins-refresh", null, "Check updates") + btn("plugins-add", null, "Install plugin") + "</div>" +
      '<div class="ca-mgr-grid">' + cards + "</div>" +
      detailPane('<div data-ca-phase class="ca-mgr-muted">Plugin receipts appear here.</div>');
  }
  function bodyTools() {
    var list = storeGet("tools", []);
    if (!Array.isArray(list)) list = (list && list.items) || [];
    var cards = list.map(function (t, idx) {
      var avail = t.availableThisTurn === false ? "Unavailable this turn" : "Available this turn";
      return '<div class="ca-mgr-card ca-motion-stagger" style="--ca-stagger:' + (Math.min(idx,6)*35) + 'ms">' +
        '<div class="ca-mgr-card-title">' + esc(t.name || t.id) +
        ' <span class="ca-badge" data-kind="scope">' + esc(t.risk || "risk?") + "</span>" +
        (t.projectEnabled === false ? ' <span class="ca-badge" data-kind="state" data-icon data-state="recommended">Project off</span>' : "") +
        "</div>" +
        muted("Owner " + (t.owner || "pm") + " · " + (t.approvalPolicy || "Ask") + " · " + avail + (t.invoked ? " · invoked" : "")) +
        '<div class="ca-mgr-card-actions">' +
        switchCtl("tools-toggle", t.id, t.projectEnabled !== false, "Project enabled") +
        btn("tools-inspect", t.id, "Inspect") +
        btn("tools-open", t.id, "Policy") +
        "</div></div>";
    }).join("") || emptyState("No tools", "The unified tool inventory appears here.");
    return healthStrip(list.length + " tools", list.some(function (t) { return t.risk === "high"; }) ? "warn" : "ok") +
      muted("MCP-owned tools stay attributed to their server. Approvals here are project policy — not a live grant.") +
      '<div class="ca-mgr-filter">' + btn("tools-refresh", null, "Rescan inventory") + "</div>" +
      '<div class="ca-mgr-grid">' + cards + "</div>" +
      detailPane('<div data-ca-phase class="ca-mgr-muted">Tool inventory receipts appear here.</div>');
  }

  function bodyCommands() {
    var list = storeGet("commands", []);
    if (!Array.isArray(list)) list = [];
    var rows = list.map(function (c, idx) {
      return '<div class="ca-mgr-card ca-motion-stagger" style="--ca-stagger:' + (Math.min(idx,6)*35) + 'ms"><div class="ca-mgr-card-title">' + esc(c.name) +
        (c.conflict ? ' <span class="ca-badge" data-kind="state" data-icon data-state="recommended">Shortcut conflict</span>' : "") +
        (c.custom ? ' <span class="ca-badge" data-kind="scope">Custom</span>' : "") + "</div>" +
        muted("Shortcut: " + (c.shortcut || "Unbound") + (c.command ? " · " + c.command : "") + (c.note ? " · " + c.note : "")) +
        '<div class="ca-mgr-card-actions">' +
        btn("commands-run", c.id, "Run") +
        btn("commands-history", c.id, "History") +
        btn("commands-rebind", c.id, "Rebind") +
        (c.conflict ? btn("commands-resolve", c.id, "Resolve conflict") : "") +
        "</div></div>";
    }).join("") || emptyState("No commands", "Seed commands from the demo dataset.");
    return healthStrip(list.length + " commands", list.some(function (c) { return c.conflict; }) ? "warn" : "ok") +
      muted("Conflicts stay visible until rebound. Bloom is marked as a provisional retire/alias candidate.") +
      '<div class="ca-mgr-filter">' + btn("commands-refresh", null, "Rescan shortcuts") + "</div>" +
      '<div class="ca-mgr-grid">' + rows + "</div>" +
      detailPane('<div data-ca-phase class="ca-mgr-muted">Command receipts appear here.</div>');
  }

  
  function bindCommands(opts, root) {
    onAct(root, function (act, id) {
      var pane = root.querySelector("[data-ca-phase]");
      function phase(msg, k) { if (pane) pane.textContent = msg; receipt(msg, k || "info"); }
      var list = storeGet("commands", []).slice();
      if (act === "commands-refresh") {
        root.setAttribute("data-ca-work", "refresh");
        window.setTimeout(function () { root.removeAttribute("data-ca-work"); }, 520);
        phase("Shortcut rescan receipt: conflicts revalidated (simulated)", "ok");
        return;
      }
      var c = findById(list, id);
      if (!c) return;
      if (act === "commands-run" || act === "commands-restart") {
        phase("Run receipt: " + (c.name || id) + " — no host command executed", "info"); return;
      }
      if (act === "commands-history" || act === "commands-logs") {
        phase("History receipt: " + (c.name || id) + " (simulated)", "info"); return;
      }
      if (act === "commands-rebind" || act === "commands-connect") {
        c.shortcut = c.shortcut && c.shortcut !== "Unbound" ? "Ctrl+Alt+" + String((c.name||"C").charAt(0)).toUpperCase() : "Ctrl+Shift+;";
        c.conflict = false;
        storeSet("commands", list);
        phase("Rebind receipt: " + (c.name || id) + " → " + c.shortcut, "ok");
        rerender(opts); return;
      }
      if (act === "commands-resolve") {
        c.conflict = false;
        c.note = (c.note || "") + ( /alias/.test(c.note||"") ? "" : " · Conflict cleared; bloom marked retire/alias");
        storeSet("commands", list);
        phase("Resolve conflict receipt: " + (c.name || id) + " cleared", "ok");
        rerender(opts);
      }
    });
  }

  function bodyTerminal() {
    var term = storeGet("terminal", { profiles: [] });
    var list = term.profiles || [];
    var cards = list.map(function (p) {
      return '<div class="ca-mgr-card"><div class="ca-mgr-card-title">' + esc(p.name) +
        ' <span class="ca-badge" data-kind="scope">' + esc(p.completeness || "profile") + "</span>" +
        (term.activeProfile === p.id ? ' <span class="ca-badge" data-kind="state" data-icon data-state="managed">Active</span>' : "") + "</div>" +
        muted("Shell " + (p.shell || "inherit") + " · font " + ((p.font && p.font.family) || "inherit") + " · cwd " + (p.cwdPolicy || "inherit")) +
        '<div class="ca-mgr-card-actions">' +
        btn("terminal-restart", p.id, "Restart session") + btn("terminal-logs", p.id, "Transcript") + btn("terminal-connect", p.id, "Make active") +
        "</div></div>";
    }).join("") || emptyState("No terminal profiles", "Seed terminal profiles from the demo dataset.");
    return healthStrip(list.length + " profiles", "ok") + muted("Profiles inherit unset fields from the app; tokens like inherit stay visible.") + '<div class="ca-mgr-grid">' + cards + "</div>";
  }
  function bodyFormatters() {
    var list = storeGet("formatters", []);
    if (!Array.isArray(list)) list = [];
    var cards = list.map(function (f, idx) {
      return '<div class="ca-mgr-card ca-motion-stagger" style="--ca-stagger:' + (Math.min(idx,6)*35) + 'ms">' +
        '<div class="ca-mgr-card-title">' + esc(f.language || f.name || f.id) + stateBadge(f.status || f.state) + "</div>" +
        muted("Owner: " + (f.owner || "not-configured") + (f.version ? " · " + f.version : "") + (f.scope ? " · " + f.scope : "")) +
        muted(f.note || (f.status === "not-configured" ? "No formatter claimed for this language yet." : "Detected formatter stays project-scoped unless marked global.")) +
        '<div class="ca-mgr-card-actions">' +
        btn("formatters-inspect", f.id, "Inspect") +
        (f.status === "not-configured" ? btn("formatters-connect", f.id, "Configure") : btn("formatters-restart", f.id, "Re-detect")) +
        btn("formatters-open", f.id, "Open settings") +
        "</div></div>";
    }).join("") || emptyState("No formatters detected", "Run discovery to detect formatters for this workspace.");
    return healthStrip(list.length + " formatters", list.some(function (f) { return f.status === "not-configured"; }) ? "warn" : "ok") +
      muted("Detected formatters with scope and version. Ownership stays explicit so LSP and formatter never silently fight.") +
      '<div class="ca-mgr-filter">' + btn("formatters-refresh", null, "Re-detect") + btn("formatters-add", null, "Add formatter") + "</div>" +
      '<div class="ca-mgr-grid">' + cards + "</div>" +
      detailPane('<div data-ca-phase class="ca-mgr-muted">Formatter receipts appear here.</div>');
  }

  function bodyFileManager() {
    var cfg = storeGet("fileManager", {});
    var tree = cfg.tree || {};
    var assoc = cfg.associations || [];
    var assocCards = assoc.map(function (a, idx) {
      return '<div class="ca-mgr-card ca-motion-stagger" style="--ca-stagger:' + (idx*35) + 'ms"><div class="ca-mgr-card-title">' + esc(a.pattern) +
        ' <span class="ca-badge" data-kind="state" data-icon data-state="' + (a.status === "ready" ? "default" : "not-configured") + '">' + esc(a.status || "ready") + "</span></div>" +
        muted("Editor: " + (a.editor || "—")) +
        '<div class="ca-mgr-card-actions">' + btn("fm-assoc", a.id, "Edit association") + "</div></div>";
    }).join("");
    return healthStrip("File manager", assoc.some(function (a) { return a.status === "not-configured"; }) ? "warn" : "ok") +
      '<div class="ca-mgr-grid">' +
      '<div class="ca-mgr-card"><div class="ca-mgr-card-title">Tree</div>' +
      muted("Hidden: " + (tree.showHidden ? "shown" : "hidden") + " · Respect ignored: " + (tree.respectIgnored !== false ? "yes" : "no")) +
      '<div class="ca-mgr-card-actions">' + switchCtl("fm-hidden", "tree", !!tree.showHidden, "Show hidden") +
      switchCtl("fm-ignored", "ignored", tree.respectIgnored !== false, "Respect ignore files") +
      btn("fileManager-restart", "tree", "Refresh") + "</div></div>" +
      '<div class="ca-mgr-card"><div class="ca-mgr-card-title">Large files</div>' +
      muted(((cfg.largeFile && cfg.largeFile.threshold) || "2 MB") + " — " + ((cfg.largeFile && cfg.largeFile.behavior) || "Ask")) +
      '<div class="ca-mgr-card-actions">' + btn("fileManager-connect", "large", "Adjust threshold") + "</div></div>" +
      '<div class="ca-mgr-card"><div class="ca-mgr-card-title">Recovery</div>' +
      muted((cfg.recovery && cfg.recovery.note) || "Unsaved buffers survive restarts.") +
      muted("Last test: " + ((cfg.recovery && cfg.recovery.lastTest) || "never")) +
      '<div class="ca-mgr-card-actions">' + btn("fileManager-restart", "recovery", "Test recovery") + btn("fileManager-logs", "recovery", "Recovery log") + "</div></div>" +
      '<div class="ca-mgr-card"><div class="ca-mgr-card-title">Diff / reveal</div>' +
      muted("Diff: " + (cfg.diffTool || "built-in") + " · Reveal: " + (cfg.revealPolicy || "project-relative")) +
      '<div class="ca-mgr-card-actions">' + btn("fm-diff", "diff", "Open diff tool") + "</div></div>" +
      "</div>" +
      (assocCards ? '<div class="ca-panel"><div class="ca-panel-h">Associations</div><div class="ca-mgr-grid">' + assocCards + "</div></div>" : "") +
      detailPane('<div data-ca-phase class="ca-mgr-muted">File manager receipts appear here.</div>');
  }

  
  function bindFileManager(opts, root) {
    onAct(root, function (act, id) {
      var pane = root.querySelector("[data-ca-phase]");
      function phase(msg, k) { if (pane) pane.textContent = msg; receipt(msg, k || "info"); }
      var cfg = clone(storeGet("fileManager", { tree: {}, largeFile: {}, recovery: {}, associations: [] }));
      cfg.tree = cfg.tree || {};
      if (act === "fm-hidden") {
        cfg.tree.showHidden = !cfg.tree.showHidden;
        storeSet("fileManager", cfg);
        phase("Show hidden → " + (cfg.tree.showHidden ? "on" : "off"), "ok");
        rerender(opts); return;
      }
      if (act === "fm-ignored") {
        cfg.tree.respectIgnored = !(cfg.tree.respectIgnored !== false);
        storeSet("fileManager", cfg);
        phase("Respect ignore files → " + (cfg.tree.respectIgnored ? "yes" : "no"), "ok");
        rerender(opts); return;
      }
      if (act === "fm-assoc") {
        phase("Edit association receipt: " + id + " (simulated chooser)", "info"); return;
      }
      if (act === "fm-diff") {
        phase("Diff tool receipt: " + (cfg.diffTool || "built-in") + " (simulated)", "info"); return;
      }
      if (act === "fileManager-connect") {
        cfg.largeFile = cfg.largeFile || {};
        cfg.largeFile.threshold = cfg.largeFile.threshold === "5 MB" ? "2 MB" : "5 MB";
        storeSet("fileManager", cfg);
        phase("Large-file threshold → " + cfg.largeFile.threshold, "ok");
        rerender(opts); return;
      }
      if (act === "fileManager-restart") {
        if (id === "recovery") {
          cfg.recovery = cfg.recovery || {};
          cfg.recovery.lastTest = "just now";
          storeSet("fileManager", cfg);
          phase("Recovery test receipt: buffers restored in demo (simulated)", "ok");
          rerender(opts); return;
        }
        root.setAttribute("data-ca-work", "refresh");
        window.setTimeout(function () { root.removeAttribute("data-ca-work"); }, 520);
        phase("Tree refresh receipt: listing rescanned (simulated)", "ok"); return;
      }
      if (act === "fileManager-logs") {
        phase("Log receipt: " + id + " (simulated)", "info");
      }
    });
  }

  function bodyTesting() {
    var t = storeGet("testing", { capabilities: [] });
    var caps = t.capabilities || [];
    if (!caps.length) {
      caps = [].concat(t.runners || [], t.debugAdapters || []).map(function (c) {
        return { id: c.id, name: c.name || c.title || c.id, global: c.global || "Auto", project: c.project || "Auto", status: c.status };
      });
    }
    var rows = caps.map(function (c) {
      return '<div class="ca-mgr-card"><div class="ca-mgr-card-title">' + esc(c.name) + "</div>" +
        reqEff("Global " + (c.global || "Auto"), "Project " + (c.project || "Auto")) +
        '<div class="ca-mgr-card-actions">' +
        btn("testing-restart", c.id, "Run probe") + btn("testing-logs", c.id, "Last report") + btn("testing-connect", c.id, "Configure") +
        "</div></div>";
    }).join("") || emptyState("No testing capabilities", "Seed testing from the demo dataset.");
    return healthStrip(caps.length + " capabilities", "ok") + muted("Modes: Auto / On / Off per scope.") + '<div class="ca-mgr-grid">' + rows + "</div>";
  }

  /* ---------- deep flows ---------- */

  function bodyNotifications() {
    var n = storeGet("notifications", { destinations: [], routing: [], inboxRule: "" });
    var dests = Array.isArray(n) ? n : (n.destinations || n.items || []);
    var cards = dests.map(function (d) {
      return '<div class="ca-mgr-card"><div class="ca-mgr-card-title">' + esc(d.name || d.title || d.id) +
        ' <span class="ca-badge" data-kind="scope">' + esc(d.kind || d.channel || "destination") + "</span>" +
        ' <span class="ca-badge" data-kind="state" data-icon data-state="' + (d.enabled ? "default" : "not-configured") + '">' +
        (d.enabled ? "Enabled" : "Disabled") + "</span></div>" +
        muted((d.channel || "") + (d.note ? " — " + d.note : "")) +
        (d.fields ? muted("Success: " + (d.fields.successPredicate || "n/a") + " · Retry: " + (d.fields.retry || "n/a")) : "") +
        '<div class="ca-mgr-card-actions">' +
        switchCtl("notif-enable", d.id, d.enabled, "Enable " + (d.name || d.title || d.id)) +
        btn("notif-test", d.id, "Test send") +
        "</div></div>";
    }).join("") || emptyState("No destinations", "Seed notifications from demo extras.");
    var routes = (n.routing || []).map(function (r) {
      if (typeof r === "string") return '<div class="ca-log-line">' + esc(r) + "</div>";
      return '<div class="ca-log-line">' + esc(r.event || r.name || "route") + " → " + esc(((r.destinations || []).join && (r.destinations || []).join(", ")) || "") + "</div>";
    }).join("");
    return healthStrip("Notification destinations", dests.some(function (d) { return d.state === "needs-auth" || d.state === "rate-limited"; }) ? "warn" : "ok") +
      muted("Title-bar inbox rule: " + (n.inboxRule || "The in-app title bar is the only in-app notification surface; destination cards feed that inbox and external channels. Quiet hours still apply except for critical-through events.")) +
      '<div class="ca-mgr-grid">' + cards + "</div>" +
      (routes ? '<div class="ca-panel"><div class="ca-panel-h">Event routing</div>' + routes + "</div>" : "");
  }

  function bindNotifications(opts, root) {
    onAct(root, function (act, id) {
      var n = clone(storeGet("notifications", { destinations: [] }));
      var dests = (n.destinations || []).slice();
      var d = findById(dests, id);
      if (!d) return;
      if (act === "notif-enable") {
        d.enabled = !d.enabled;
        n.destinations = dests;
        storeSet("notifications", n);
        receipt(d.name + (d.enabled ? " enabled" : " disabled") + " — delivery was not changed on the wire", "ok");
        rerender(opts);
      } else if (act === "notif-test") {
        if (!d.enabled) { receipt("Test send blocked — enable " + d.name + " first", "warn"); return; }
        if (d.state === "needs-auth") { receipt("Test send blocked — " + d.name + " needs reconnect", "danger"); return; }
        if (d.state === "rate-limited") { receipt("Test send receipt: rate-limited for " + d.name + " (masked)", "warn"); return; }
        receipt("Test send receipt: simulated notice queued for " + d.name + " (title-bar inbox rule noted)", "ok");
      }
    });
  }

  function bodySound() {
    var s = storeGet("soundLibrary", { masterVolume: 50, events: [], packs: [] });
    var events = s.events || [];
    if (!events.length && Array.isArray(s.items)) {
      events = s.items.map(function (it) {
        return {
          id: it.id,
          event: it.title || it.name || it.id,
          name: it.title || it.name || it.id,
          sound: it.sound || (it.id + ".wav"),
          source: it.pack || it.source || "",
          license: it.license || "",
          duration: it.duration || (it.durationMs != null ? (it.durationMs + " ms") : "—")
        };
      });
    }
    var packs = (s.packs || s.soundPacks || []).map(function (p) {
      var st = p.state || "verified";
      if (st === "valid") st = "verified";
      if (st === "license-blocked") st = "license-check-failed";
      if (st === "format-fail") st = "format-invalid";
      return Object.assign({}, p, { name: p.name || p.title || p.id, state: st });
    });
    var evRows = events.map(function (e) {
      return '<div class="ca-mgr-card"><div class="ca-mgr-card-title">' + esc(e.event || e.name) + "</div>" +
        muted((e.sound || "—") + " · " + (e.source || "") + " · " + (e.license || "") + " · " + (e.duration || "")) +
        '<div class="ca-mgr-card-actions">' + btn("snd-preview", e.id, "Preview") + btn("snd-test", e.id, "Test") + "</div></div>";
    }).join("");
    var packRows = packs.map(function (p) {
      var blocked = p.state === "license-check-failed" || p.state === "format-invalid" || p.imported === false && p.state !== "verified";
      return '<div class="ca-mgr-card"><div class="ca-mgr-card-title">' + esc(p.name) +
        ' <span class="ca-badge" data-kind="state" data-icon data-state="' + (p.state === "verified" ? "default" : "recommended") + '">' + esc(p.state || "pack") + "</span></div>" +
        muted((p.format || "") + " · " + (p.license || "") + (p.note ? " — " + p.note : "")) +
        '<div class="ca-mgr-card-actions">' + btn("snd-import", p.id, p.imported ? "Re-import pack" : "Import pack") + "</div></div>";
    }).join("");
    return healthStrip("Master volume " + (s.masterVolume != null ? s.masterVolume : 50) + "%", "ok") +
      '<div class="ca-mgr-filter"><label class="ca-mgr-muted">Volume <input type="range" min="0" max="100" data-ca-act="snd-volume" value="' + esc(String(s.masterVolume != null ? s.masterVolume : 50)) + '"></label></div>' +
      muted("Preview and test play locally in the demo; import packs that fail license or format checks stay blocked.") +
      '<div class="ca-mgr-grid">' + (evRows || emptyState("No sound events", "Seed soundLibrary.events")) + "</div>" +
      '<div class="ca-panel"><div class="ca-panel-h">Sound packs</div><div class="ca-mgr-grid">' + (packRows || emptyState("No packs", "")) + "</div></div>" +
      detailPane('<div data-ca-phase class="ca-mgr-muted">Preview / test receipts appear here.</div>');
  }

  function bindSound(opts, root) {
    onAct(root, function (act, id, el) {
      var s = clone(storeGet("soundLibrary", { events: [], packs: [], masterVolume: 50 }));
      if (act === "snd-volume") {
        s.masterVolume = Number(el.value);
        storeSet("soundLibrary", s);
        receipt("Master volume set to " + s.masterVolume + "% (simulated)", "ok");
        return;
      }
      if (act === "snd-preview") {
        root.setAttribute("data-ca-sound", "preview");
        window.setTimeout(function () { root.removeAttribute("data-ca-sound"); }, 720);
        var sp = root.querySelector("[data-ca-phase]");
        if (sp) sp.textContent = "Preview waveform for " + id + " (simulated)";
        receipt("Preview played for " + id + " (simulated audio)", "info"); return;
      }
      if (act === "snd-test") {
        root.setAttribute("data-ca-sound", "test");
        window.setTimeout(function () { root.removeAttribute("data-ca-sound"); }, 900);
        var st = root.querySelector("[data-ca-phase]");
        if (st) st.textContent = "Test cue at " + (s.masterVolume || 50) + "% (simulated)";
        receipt("Test cue fired for " + id + " at " + (s.masterVolume || 50) + "% (simulated)", "ok"); return;
      }
      if (act === "snd-import") {
        var packs = s.packs || [];
        var p = findById(packs, id);
        if (p && (p.state === "license-check-failed" || p.state === "format-invalid")) {
          receipt("Import pack blocked receipt: " + (p.note || p.state) + " — pack was not registered", "danger");
          return;
        }
        if (p) { p.imported = true; s.packs = packs; storeSet("soundLibrary", s); }
        receipt("Import pack receipt: " + (p ? p.name : id) + " verified and registered (simulated)", "ok");
        rerender(opts);
      }
    });
  }

  function bodyAppearance() {
    var a = storeGet("appearanceThemes", { themes: [], liveReload: true, loadAtStartup: true });
    if (Array.isArray(a)) a = { themes: a, liveReload: true, loadAtStartup: true };
    var themes = (a.themes || []).map(function (t) {
      return {
        id: t.id,
        name: t.name || t.title || t.id,
        state: t.state || "ready",
        file: t.file || "",
        base: t.base || "—",
        reloaded: t.reloaded || "—",
        diagnostic: t.diagnostic || t.diagnosis || "",
        note: t.note || "",
        source: t.source || ""
      };
    });
    var cards = themes.map(function (t) {
      var invalid = t.state === "schema-invalid" || t.state === "invalid";
      return '<div class="ca-mgr-card" data-ca-id="' + esc(t.id) + '">' +
        '<div class="ca-mgr-card-title">' + esc(t.name) +
        ' <span class="ca-badge" data-kind="state" data-icon data-state="' + (invalid ? "unavailable" : "default") + '">' + esc(t.state || "valid") + "</span></div>" +
        muted((t.file || "") + " · base " + (t.base || "—") + " · reloaded " + (t.reloaded || "—")) +
        (t.diagnostic ? '<div class="ca-row-reason">TOML diagnosis: ' + esc(t.diagnostic) + "</div>" : "") +
        (t.note ? muted(t.note) : "") +
        '<div class="ca-mgr-card-actions">' +
        btn("theme-hover", t.id, "Hover preview") +
        btn("theme-export", t.id, "Export") +
        (invalid ? btn("theme-diagnose", t.id, "Show diagnosis") : btn("theme-apply", t.id, "Apply")) +
        "</div></div>";
    }).join("") || emptyState("No custom themes", "Create or import a TOML theme.");
    return healthStrip(themes.length + " themes · live reload " + (a.liveReload ? "on" : "off"), themes.some(function (t) { return t.state === "schema-invalid"; }) ? "warn" : "ok") +
      '<div class="ca-mgr-filter">' + btn("theme-create", null, "Create theme") + btn("theme-import", null, "Import TOML") +
      switchCtl("theme-live", "live", a.liveReload, "Live reload") + "</div>" +
      muted("Invalid TOML falls back to the base theme and surfaces a line-level diagnosis — the app never crashes on a bad theme file.") +
      '<div class="ca-mgr-grid">' + cards + "</div>" +
      detailPane('<div data-ca-theme-preview class="ca-mgr-muted">Hover a theme to preview tokens here.</div>');
  }

  function bindAppearance(opts, root) {
    onAct(root, function (act, id) {
      var a = clone(storeGet("appearanceThemes", { themes: [], liveReload: true }));
      if (Array.isArray(a)) a = { themes: a, liveReload: true };
      var themes = (a.themes || []).slice();
      var t = findById(themes, id);
      if (act === "theme-create") {
        themes.push({ id: "ct-new-" + Date.now(), name: "Untitled theme", base: "Friendly Dark", file: "themes/untitled.toml", state: "valid", reloaded: "Just now", note: "Created in the demo store only." });
        a.themes = themes; storeSet("appearanceThemes", a);
        receipt("Theme create receipt: draft theme added (not written to disk)", "ok");
        rerender(opts); return;
      }
      if (act === "theme-import") { receipt("Theme import receipt: choose a TOML file — parse runs locally in a real app; demo only", "info"); return; }
      if (act === "theme-live") { a.liveReload = !a.liveReload; storeSet("appearanceThemes", a); receipt("Live reload " + (a.liveReload ? "on" : "off"), "ok"); rerender(opts); return; }
      if (!t) return;
      if (act === "theme-hover") {
        root.setAttribute("data-ca-theme-hot", id);
        var pane = root.querySelector("[data-ca-theme-preview]");
        if (pane) pane.textContent = "Hover preview: " + t.name + " (inherits " + (t.base || "base") + ")" + (t.diagnostic ? " — " + t.diagnostic : "");
        receipt("Hover preview armed for " + t.name, "info");
      } else if (act === "theme-export") {
        receipt("Theme export receipt: " + (t.file || t.name) + " would download (simulated)", "ok");
      } else if (act === "theme-diagnose") {
        receipt("Invalid TOML diagnosis: " + (t.diagnostic || t.state), "warn");
      } else if (act === "theme-apply") {
        receipt("Apply theme receipt: " + t.name + " selected for next paint (simulated)", "ok");
      }
    });
  }

  function bodySpell() {
    var spell = storeGet("spell", null) || mapSpell(window.PM_SETTINGS_DEMO || {}) || { mode: "Normal", personal: [], project: [], neverAutoReplace: true };
    var mode = spell.mode || "Normal";
    return healthStrip("Spellcheck · " + mode, spell.enabled === false ? "warn" : "ok") +
      '<div class="ca-mgr-filter"><span class="ca-seg" role="radiogroup" aria-label="Spellcheck mode">' +
      ["Normal", "Advanced"].map(function (m) {
        return '<button type="button" role="radio" aria-checked="' + (mode === m ? "true" : "false") + '" data-ca-act="spell-mode" data-ca-id="' + m + '">' + m + "</button>";
      }).join("") + "</span></div>" +
      muted("Spellcheck never auto-replaces text. Suggestions appear on demand; code tokens and paths are skipped.") +
      '<div class="ca-mgr-grid">' +
      '<div class="ca-mgr-card"><div class="ca-mgr-card-title">Personal dictionary</div>' +
      muted((spell.personal || []).join(", ") || "Empty") +
      '<div class="ca-mgr-card-actions">' + btn("spell-add-personal", null, "Add word") + btn("spell-clear-personal", null, "Clear") + "</div></div>" +
      '<div class="ca-mgr-card"><div class="ca-mgr-card-title">Project dictionary</div>' +
      muted((spell.project || []).join(", ") || "Empty") +
      '<div class="ca-mgr-card-actions">' + btn("spell-add-project", null, "Add word") + btn("spell-clear-project", null, "Clear") + "</div></div>" +
      "</div>" +
      (mode === "Advanced" ? muted("Advanced: technical prose and unknown-name underlines can be tuned per project.") : muted("Normal: underline unknown words in prose fields only.")) +
      '<div class="ca-panel"><div class="ca-panel-h">Live demo</div><div data-ca-spell-mount></div></div>';
  }

  function bindSpell(opts, root) {
    var mountEl = root.querySelector("[data-ca-spell-mount]");
    if (mountEl && window.CAViews && typeof CAViews.mountSpellcheck === "function") {
      try { CAViews.mountSpellcheck(mountEl, {}); } catch (err) { mountEl.textContent = "Spellcheck demo unavailable."; }
    } else if (mountEl) {
      mountEl.innerHTML = muted("CAViews.mountSpellcheck is not loaded; dictionary controls above still work.");
    }
    onAct(root, function (act, id) {
      var spell = clone(storeGet("spell", mapSpell(window.PM_SETTINGS_DEMO || {}) || { personal: [], project: [], mode: "Normal", neverAutoReplace: true }));
      if (act === "spell-mode") { spell.mode = id; storeSet("spell", spell); receipt("Spellcheck mode: " + id + " — still never auto-replaces", "ok"); rerender(opts); return; }
      if (act === "spell-add-personal") {
        var w = window.prompt("Add to personal dictionary", "FileSafe");
        if (!w) return;
        spell.personal = (spell.personal || []).concat([w]);
        storeSet("spell", spell);
        receipt("Added \"" + w + "\" to personal dictionary (simulated)", "ok");
        rerender(opts);
      } else if (act === "spell-add-project") {
        var w2 = window.prompt("Add to project dictionary", "worktree");
        if (!w2) return;
        spell.project = (spell.project || []).concat([w2]);
        storeSet("spell", spell);
        receipt("Added \"" + w2 + "\" to project dictionary (simulated)", "ok");
        rerender(opts);
      } else if (act === "spell-clear-personal") {
        spell.personal = []; storeSet("spell", spell); receipt("Personal dictionary cleared in demo store", "warn"); rerender(opts);
      } else if (act === "spell-clear-project") {
        spell.project = []; storeSet("spell", spell); receipt("Project dictionary cleared in demo store", "warn"); rerender(opts);
      }
    });
  }


  function bodyDesktop() {
    var d = storeGet("desktop", {});
    var trayConfigured = !(d.trayIcon === "not-configured" || d.trayIcon == null && d.tray === false);
    function row(key, label, desc, stateLabel) {
      var on = Boolean(d[key]);
      return '<div class="ca-mgr-card ca-motion-stagger"><div class="ca-mgr-card-title">' + esc(label) +
        (stateLabel ? ' <span class="ca-badge" data-kind="state" data-icon data-state="' + (on ? "default" : "not-configured") + '">' + esc(stateLabel) + "</span>" : "") +
        "</div>" + muted(desc) +
        '<div class="ca-mgr-card-actions">' + switchCtl("desk-toggle", key, on, label) + "</div></div>";
    }
    var meta = [
      '<div class="ca-mgr-card"><div class="ca-mgr-card-title">Tray icon</div>' +
      muted("Reported state: " + (d.trayIcon || (d.tray ? "present" : "not-configured"))) +
      muted("Menu: " + (d.trayMenu || "default") + " · Badges: " + (d.badges || "attention-only")) +
      '<div class="ca-mgr-card-actions">' + btn("desk-probe", "tray", "Probe native tray") + "</div></div>",
      '<div class="ca-mgr-card"><div class="ca-mgr-card-title">Window chrome</div>' +
      muted("Chrome: " + (d.windowChrome || (d.windowFrame ? "custom" : "system")) + " · Multi-monitor: " + (d.multiMonitor || "not-configured")) +
      '<div class="ca-mgr-card-actions">' + btn("desk-probe", "chrome", "Preview frame") + "</div></div>"
    ].join("");
    return healthStrip(trayConfigured ? "Desktop shell partially configured" : "Desktop shell — tray Not configured", trayConfigured ? "ok" : "warn") +
      muted(d.notes || "Tray and window toggles apply to the native shell demo only.") +
      '<div class="ca-mgr-grid">' + meta +
      row("tray", "Show tray icon", "Keeps Puppet Master reachable from the system tray.", d.tray ? "On" : "Off") +
      row("windowFrame", "Custom window frame", "Use the PM frame instead of the OS default.", d.windowFrame ? "Custom" : "System") +
      row("startMinimized", "Start minimized to tray", "Launch into the tray when the OS session starts.", d.startMinimized ? "On" : "Off") +
      row("retainOnClose", "Close keeps process in tray", "Closing the window does not quit when tray is enabled.", d.retainOnClose ? "Retain" : "Quit") +
      row("notificationsInTray", "Mirror notifications in tray", "Title-bar inbox items can also badge the tray.", d.notificationsInTray ? "Mirror" : "Inbox only") +
      row("launchAtLogin", "Launch at login", "Starts with the OS session (simulated).", d.launchAtLogin ? "On" : "Off") +
      "</div>" +
      detailPane('<div data-ca-phase class="ca-mgr-muted">Desktop probe receipts appear here.</div>');
  }



  function bindDesktop(opts, root) {
    onAct(root, function (act, id) {
      var pane = root.querySelector("[data-ca-phase]");
      function phase(msg, k) { if (pane) pane.textContent = msg; receipt(msg, k || "info"); }
      if (act === "desk-probe") {
        root.setAttribute("data-ca-work", "refresh");
        window.setTimeout(function () { root.removeAttribute("data-ca-work"); }, 520);
        phase("Probe receipt: native " + id + " inspected — no OS settings changed", "info");
        return;
      }
      if (act !== "desk-toggle") return;
      var d = clone(storeGet("desktop", {}));
      d[id] = !d[id];
      if (id === "tray") d.trayIcon = d.tray ? "present" : "not-configured";
      if (id === "windowFrame") d.windowChrome = d.windowFrame ? "custom" : "system";
      if (id === "startMinimized") d.minimizeToTray = !!d.startMinimized;
      storeSet("desktop", d);
      phase("Desktop: " + id + " → " + (d[id] ? "on" : "off") + " (simulated)", "ok");
      rerender(opts);
    });
  }



  function bodyTeacher() {
    var raw = storeGet("teacher", []);
    var tips = Array.isArray(raw) ? raw : (raw.tips || raw.moments || []);
    var tours = (!Array.isArray(raw) && raw.tours) ? raw.tours : [];
    var help = (!Array.isArray(raw) && raw.helpTopics) ? raw.helpTopics : [];
    var tipCards = tips.map(function (t, idx) {
      return '<div class="ca-mgr-card ca-motion-stagger" style="--ca-stagger:' + (idx * 35) + 'ms"><div class="ca-mgr-card-title">' + esc(t.title) +
        (t.status ? ' <span class="ca-badge" data-kind="state" data-icon data-state="' + (t.status === "ready" ? "default" : "not-configured") + '">' + esc(t.status) + "</span>" : "") +
        "</div>" + muted(t.screen ? ("Screen: " + t.screen) : "") + muted(t.body || "") +
        '<div class="ca-mgr-card-actions">' + btn("teach-open", t.id, "Open tip") + btn("teach-dismiss", t.id, "Dismiss") + "</div></div>";
    }).join("") || emptyState("No teacher tips", "Seed teacher tips from demo extras.");
    var tourCards = tours.map(function (t) {
      return '<div class="ca-mgr-card"><div class="ca-mgr-card-title">' + esc(t.title) +
        ' <span class="ca-badge" data-kind="state" data-icon data-state="' + (t.status === "ready" ? "default" : "not-configured") + '">' + esc(t.status || "ready") + "</span></div>" +
        '<div class="ca-mgr-card-actions">' + btn("teach-tour", t.id, "Start tour") + "</div></div>";
    }).join("");
    var helpCards = help.map(function (h) {
      return '<div class="ca-mgr-card"><div class="ca-mgr-card-title">' + esc(h.title) + "</div>" + muted(h.href || "") +
        '<div class="ca-mgr-card-actions">' + btn("teach-help", h.id, "Open help") + "</div></div>";
    }).join("");
    return healthStrip(tips.length + " tips · " + tours.length + " tours", "ok") +
      muted("Opening a tip records a receipt — it does not navigate away from Settings.") +
      '<div class="ca-panel"><div class="ca-panel-h">Tips</div><div class="ca-mgr-grid">' + tipCards + "</div></div>" +
      (tourCards ? '<div class="ca-panel"><div class="ca-panel-h">Tours</div><div class="ca-mgr-grid">' + tourCards + "</div></div>" : "") +
      (helpCards ? '<div class="ca-panel"><div class="ca-panel-h">Help topics</div><div class="ca-mgr-grid">' + helpCards + "</div></div>" : "") +
      detailPane('<div data-ca-phase class="ca-mgr-muted">Teacher receipts appear here.</div>');
  }


  function bindTeacher(opts, root) {
    onAct(root, function (act, id) {
      var raw = storeGet("teacher", []);
      var tips = Array.isArray(raw) ? raw.slice() : ((raw && (raw.moments || raw.tips)) || []).slice();
      var tours = (!Array.isArray(raw) && raw.tours) ? raw.tours.slice() : [];
      var help = (!Array.isArray(raw) && raw.helpTopics) ? raw.helpTopics.slice() : [];
      if (act === "teach-open") {
        var t = findById(tips, id);
        receipt("Open tip receipt: " + (t ? t.title : id) + " — shown as a teacher moment (simulated)", "ok");
        return;
      }
      if (act === "teach-dismiss") {
        var next = tips.filter(function (x) { return (x.id || x.title) !== id; });
        if (Array.isArray(raw)) storeSet("teacher", next);
        else {
          var obj = clone(raw) || {};
          if (raw.moments) obj.moments = next; else obj.tips = next;
          storeSet("teacher", obj);
        }
        receipt("Dismiss tip receipt: " + id + " hidden for this demo session", "ok");
        rerender(opts);
        return;
      }
      if (act === "teach-tour") {
        var tour = findById(tours, id);
        receipt("Start tour receipt: " + (tour ? tour.title : id) + " (simulated guided tour)", "info");
        return;
      }
      if (act === "teach-help") {
        var h = findById(help, id);
        receipt("Help topic receipt: " + (h ? h.title : id) + " — docs pane would open", "info");
      }
    });
  }

  function bodyBsd() {
    var b = storeGet("bsd", { mode: "Auto", riskTriggers: true, phaseTriggers: true, usageGuard: true, readOnly: true });
    function tog(key, label, desc) {
      return '<div class="ca-mgr-card"><div class="ca-mgr-card-title">' + esc(label) + "</div>" + muted(desc) +
        '<div class="ca-mgr-card-actions">' + switchCtl("bsd-toggle", key, Boolean(b[key]), label) + "</div></div>";
    }
    return healthStrip("BSD · " + (b.mode || "Auto") + " · route " + (b.route || "default"), "ok") +
      muted(b.note || "BSD is read-only by default, receives bounded deltas, cannot widen authority, and cannot block primary work merely because it failed.") +
      '<div class="ca-mgr-filter"><span class="ca-seg">' +
      ["Off", "Auto", "Always"].map(function (m) {
        return '<button type="button" role="radio" aria-checked="' + (b.mode === m ? "true" : "false") + '" data-ca-act="bsd-mode" data-ca-id="' + m + '">' + m + "</button>";
      }).join("") + "</span></div>" +
      '<div class="ca-mgr-grid">' +
      tog("riskTriggers", "Risk triggers", "Offer a second look when FileSafe or permissions fire.") +
      tog("phaseTriggers", "Phase triggers", "Comment at plan/review boundaries.") +
      tog("usageGuard", "Usage guard", "Stay inside the latency and privacy budget.") +
      tog("readOnly", "Read-only posture", "BSD cannot mutate project files.") +
      "</div>";
  }

  function bindBsd(opts, root) {
    onAct(root, function (act, id) {
      var b = clone(storeGet("bsd", {}));
      if (act === "bsd-mode") { b.mode = id; storeSet("bsd", b); receipt("BSD mode → " + id + " (simulated)", "ok"); rerender(opts); return; }
      if (act === "bsd-toggle") { b[id] = !b[id]; storeSet("bsd", b); receipt("BSD policy " + id + " → " + (b[id] ? "on" : "off"), "ok"); rerender(opts); }
    });
  }

  function bodyPermissions() {
    var rules = storeGet("permissionsRules", []);
    if (!Array.isArray(rules)) rules = [];
    rules = rules.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    var rows = rules.map(function (r, idx) {
      return '<div class="ca-mgr-card"><div class="ca-mgr-card-title">#' + esc(String(r.order || idx + 1)) + " · " + esc(r.match || r.pattern || '') +
        ' <span class="ca-badge" data-kind="scope">' + esc(r.effect || r.action || '') + "</span></div>" +
        muted((r.note || "") + " · origin " + (r.origin || "Custom") + (r.conflictsWith ? " · conflicts with " + r.conflictsWith : "")) +
        '<div class="ca-mgr-card-actions">' +
        btn("perm-up", r.id, "Move up") + btn("perm-down", r.id, "Move down") + btn("perm-remove", r.id, "Remove") +
        "</div></div>";
    }).join("") || emptyState("No rules", "Add a permission rule.");
    return healthStrip(rules.length + " rules · last match wins", rules.some(function (r) { return r.conflictsWith; }) ? "warn" : "ok") +
      '<div class="ca-mgr-filter">' + btn("perm-add", null, "Add rule") + "</div>" +
      muted("Rules run top to bottom; the last matching rule decides. Reordering is a first-class action.") +
      '<div class="ca-mgr-grid">' + rows + "</div>";
  }

  function bindPermissions(opts, root) {
    onAct(root, function (act, id) {
      var rules = storeGet("permissionsRules", []).slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
      if (act === "perm-add") {
        var next = rules.length + 1;
        rules.push({ id: "rule-" + Date.now(), order: next, match: "path/to/**", effect: "Ask for approval", note: "Added in demo", origin: "Custom" });
        storeSet("permissionsRules", rules);
        receipt("Add rule receipt: new ask-for-approval rule appended", "ok");
        rerender(opts); return;
      }
      var idx = -1, i;
      for (i = 0; i < rules.length; i++) if (rules[i].id === id) idx = i;
      if (idx < 0) return;
      if (act === "perm-up" && idx > 0) {
        var tmp = rules[idx - 1]; rules[idx - 1] = rules[idx]; rules[idx] = tmp;
        rules.forEach(function (r, j) { r.order = j + 1; });
        storeSet("permissionsRules", rules);
        receipt("Reorder rule receipt: moved up — last-match-wins order updated", "ok");
        rerender(opts);
      } else if (act === "perm-down" && idx < rules.length - 1) {
        var tmp2 = rules[idx + 1]; rules[idx + 1] = rules[idx]; rules[idx] = tmp2;
        rules.forEach(function (r, j) { r.order = j + 1; });
        storeSet("permissionsRules", rules);
        receipt("Reorder rule receipt: moved down — last-match-wins order updated", "ok");
        rerender(opts);
      } else if (act === "perm-remove") {
        rules.splice(idx, 1);
        rules.forEach(function (r, j) { r.order = j + 1; });
        storeSet("permissionsRules", rules);
        receipt("Rule removed from demo store", "warn");
        rerender(opts);
      }
    });
  }

  function bodyGoal() {
    var g = storeGet("goal", { concurrency: 8, spendCeiling: "$25.00", timeCeiling: "2 hours", softStop: true, reserveForSynthesis: true });
    if (g.concurrency == null && g.concurrencyCeiling != null) g.concurrency = g.concurrencyCeiling;
    function field(key, label, desc) {
      return '<div class="ca-mgr-card"><div class="ca-mgr-card-title">' + esc(label) + "</div>" + muted(desc) +
        '<div class="ca-mgr-card-actions"><span class="ca-text"><input type="text" data-ca-act="goal-edit" data-ca-id="' + esc(key) + '" value="' + esc(String(g[key])) + '" aria-label="' + esc(label) + '"></span>' +
        btn("goal-save", key, "Save ceiling") + "</div></div>";
    }
    return healthStrip("Goal ceilings", "ok") + muted("Ceilings bound concurrent work, spend, and time — they do not start Goals by themselves.") +
      '<div class="ca-mgr-grid">' +
      field("concurrency", "Concurrency ceiling", "Max concurrent Goal members across crews.") +
      field("spendCeiling", "Spend ceiling", "Soft budget before approval is required.") +
      field("timeCeiling", "Time ceiling", "Wall-clock budget for a Goal run.") +
      '<div class="ca-mgr-card"><div class="ca-mgr-card-title">Soft stop</div>' + muted("Pause and ask when a ceiling is hit instead of hard-failing.") +
      '<div class="ca-mgr-card-actions">' + switchCtl("goal-toggle", "softStop", Boolean(g.softStop), "Soft stop") + "</div></div>" +
      '<div class="ca-mgr-card"><div class="ca-mgr-card-title">Reserve for synthesis</div>' + muted("Keep capacity for a final synthesis seat.") +
      '<div class="ca-mgr-card-actions">' + switchCtl("goal-toggle", "reserveForSynthesis", Boolean(g.reserveForSynthesis), "Reserve") + "</div></div>" +
      "</div>";
  }

  function bindGoal(opts, root) {
    onAct(root, function (act, id, el) {
      var g = clone(storeGet("goal", {}));
      if (act === "goal-toggle") { g[id] = !g[id]; storeSet("goal", g); receipt("Goal " + id + " → " + (g[id] ? "on" : "off"), "ok"); rerender(opts); return; }
      if (act === "goal-save") {
        var input = root.querySelector('input[data-ca-act="goal-edit"][data-ca-id="' + id + '"]');
        if (input) g[id] = input.value;
        storeSet("goal", g);
        receipt("Ceiling edit receipt: " + id + " → " + g[id] + " (simulated)", "ok");
        rerender(opts);
      }
    });
  }

  /* Phased import / backup / lifecycle */

  function bodyStorage() {
    var s = storeGet("storage", { mode: "Local", pressure: "Unknown", retention: "—", quarantine: "—" });
    var buckets = (s.buckets || []).map(function (b) {
      return '<div class="ca-mgr-card"><div class="ca-mgr-card-title">' + esc(b.title || b.name || b.id) +
        (b.status ? ' <span class="ca-badge" data-kind="state" data-icon data-state="' + (b.status === "ready" ? "default" : "attention") + '">' + esc(b.status) + "</span>" : "") +
        "</div>" + muted((b.used || "—") + " · retention " + (b.retention || "—")) +
        '<div class="ca-mgr-card-actions">' + btn("storage-open", b.id, "Inspect") + btn("storage-reveal", b.id, "Reveal path") + "</div></div>";
    }).join("");
    return healthStrip((s.mode || "Storage") + " · " + (s.pressure || ""), s.pressure && /attention/i.test(String(s.pressure)) ? "warn" : "ok") +
      '<div class="ca-mgr-grid">' +
      '<div class="ca-mgr-card"><div class="ca-mgr-card-title">Health</div>' + muted((s.encryption || "Encryption status unknown") + " · Legal hold: " + (s.legalHold || "None")) +
      muted("Retention: " + (s.retention || "—")) + muted("Quarantine: " + (s.quarantine || "—")) +
      '<div class="ca-mgr-card-actions">' + btn("storage-preview", null, "Preview import") + btn("storage-apply", null, "Apply") + btn("storage-rollback", null, "Rollback") + "</div></div>" +
      (buckets || "") +
      "</div>" +
      detailPane('<div data-ca-phase class="ca-mgr-muted">Phased receipts appear here.</div>');
  }

  function bindPhased(opts, root, key, label) {
    onAct(root, function (act) {
      var pane = root.querySelector("[data-ca-phase]");
      function phase(msg, kind) {
        if (pane) pane.textContent = msg;
        receipt(msg, kind || "info");
      }
      if (act === key + "-preview" || act === "storage-preview" || act === "backup-preview" || act === "settingsLifecycle-preview") {
        if (key === "settingsLifecycle") {
          var life = clone(storeGet("settingsLifecycle", {}));
          life.status = "import-conflict";
          life.lastJob = life.lastJob || {};
          life.lastJob.phase = "preview";
          life.lastJob.conflicts = life.conflicts || life.lastJob.conflicts || [];
          life.lastJob.receipt = "Import preview ready — resolve conflicts before apply";
          storeSet("settingsLifecycle", life);
        }
        root.setAttribute("data-ca-work", "import-preview");
        phase(label + " import preview receipt: conflicts listed — nothing applied yet", "info");
        if (key === "settingsLifecycle") rerender(opts);
      } else if (act.indexOf("-apply") !== -1) {
        if (key === "settingsLifecycle") {
          var lifeA = clone(storeGet("settingsLifecycle", {}));
          lifeA.status = "applied";
          lifeA.lastJob = lifeA.lastJob || {};
          lifeA.lastJob.phase = "applied";
          lifeA.lastJob.receipt = "Import applied (simulated)";
          storeSet("settingsLifecycle", lifeA);
        }
        root.setAttribute("data-ca-work", "import-apply");
        phase(label + " apply receipt: phase 1/2 wrote demo keys; phase 2/2 pending confirmation", "ok");
        if (key === "settingsLifecycle") rerender(opts);
      } else if (act.indexOf("-rollback") !== -1) {
        if (key === "settingsLifecycle") {
          var lifeR = clone(storeGet("settingsLifecycle", {}));
          lifeR.status = "rollback-complete";
          lifeR.lastJob = { id: "job-import-demo", phase: "rolled-back", conflicts: [], receipt: "Import rolled back to the previous snapshot (simulated)" };
          storeSet("settingsLifecycle", lifeR);
        }
        root.setAttribute("data-ca-work", "import-rollback");
        phase(label + " rollback receipt: restored previous demo snapshot (simulated)", "warn");
        if (key === "settingsLifecycle") rerender(opts);
      }
    });
  }

  function bodyBackup() {
    var b = storeGet("backup", { runs: [] });
    var runs = b.runs || b || [];
    if (!Array.isArray(runs)) runs = b.runs || [];
    var rows = (Array.isArray(runs) ? runs : []).map(function (r) {
      return '<div class="ca-mgr-card"><div class="ca-mgr-card-title">' + esc(r.kind || r.name || r.id) +
        (r.verified ? ' <span class="ca-badge" data-kind="state" data-icon data-state="default">Verified</span>' : ' <span class="ca-badge" data-kind="state" data-icon data-state="recommended">Unverified</span>') + "</div>" +
        muted("Last " + (r.last || "—") + " · schedule " + (r.schedule || "—") + " · retain " + (r.retention || "—")) +
        (r.note ? muted(r.note) : "") +
        '<div class="ca-mgr-card-actions">' + btn("backup-preview", r.id, "Test restore preview") + btn("backup-apply", r.id, "Run backup") + btn("backup-rollback", r.id, "Rollback") + "</div></div>";
    }).join("") || emptyState("No backup runs", "Seed backup from demo extras.");
    return healthStrip("Backup schedules", "ok") + muted("Back Up Now is an action; schedule is a setting; last run is status.") +
      '<div class="ca-mgr-filter">' + btn("backup-preview", null, "Preview import") + btn("backup-apply", null, "Apply backup set") + btn("backup-rollback", null, "Rollback") + "</div>" +
      '<div class="ca-mgr-grid">' + rows + "</div>" + detailPane('<div data-ca-phase class="ca-mgr-muted">Phased receipts appear here.</div>');
  }

  function bodySettingsLifecycle() {
    var s = storeGet("settingsLifecycle", { fileName: "pm-settings-export.json", conflicts: [], legacy: [] });
    var conflictList = s.conflicts && s.conflicts.length ? s.conflicts : ((s.lastJob && s.lastJob.conflicts) || []);
    var conflicts = conflictList.map(function (c) {
      return '<div class="ca-row"><div class="ca-row-main"><div class="ca-row-label">' + esc(c.key) + "</div>" +
        '<div class="ca-row-desc">Current ' + esc(c.current || c.local || "") + " · Incoming " + esc(c.incoming) + " · " + esc(c.resolution || "Ask") + "</div></div></div>";
    }).join("");
    var legacy = (s.legacy || []).map(function (l) {
      return '<div class="ca-row"><div class="ca-row-main"><div class="ca-row-label">' + esc(l.key) + "</div>" +
        '<div class="ca-row-desc">' + esc(l.note || "") + " · " + esc(l.action || "Migrate") + "</div></div></div>";
    }).join("");
    return healthStrip("Import / export", "ok") +
      muted("Source: " + (s.source || s.fileName || "—")) +
      '<div class="ca-mgr-filter">' + btn("settingsLifecycle-preview", null, "Preview import") + btn("settingsLifecycle-apply", null, "Apply") + btn("settingsLifecycle-rollback", null, "Rollback") + "</div>" +
      '<div class="ca-panel"><div class="ca-panel-h">Conflicts</div>' + (conflicts || muted("No conflicts in fixture")) + "</div>" +
      '<div class="ca-panel"><div class="ca-panel-h">Legacy keys</div>' + (legacy || muted("No legacy remaps")) + "</div>" +
      detailPane('<div data-ca-phase class="ca-mgr-muted">Phased receipts appear here.</div>');
  }

  /* List-action managers */

  function listBody(key, titleNote, actions) {
    var list = storeGet(key, []);
    if (list && !Array.isArray(list)) {
      if (Array.isArray(list.items)) list = list.items;
      else if (Array.isArray(list.rows)) list = list.rows;
      else if (Array.isArray(list.worktrees)) list = list.worktrees;
      else if (Array.isArray(list.top)) list = list.top;
      else if (Array.isArray(list.pinned)) list = list.pinned;
      else list = [];
    }
    var act = actions || ["open", "reveal", "remove"];
    var cards = list.map(function (item, idx) {
      var name = item.title || item.name || item.what || item.workflow || item.label || item.id;
      var delay = Math.min(idx, 6) * 40;
      return '<div class="ca-mgr-card ca-motion-stagger" style="--ca-stagger:' + delay + 'ms"><div class="ca-mgr-card-title">' + esc(name) +
        (item.kind || item.type ? ' <span class="ca-badge" data-kind="scope">' + esc(item.kind || item.type) + "</span>" : "") +
        (item.state ? ' <span class="ca-badge" data-kind="scope">' + esc(item.state) + "</span>" : "") +
        "</div>" +
        muted([item.when, item.at, item.project, item.size, item.location, item.path, item.branch, item.last, item.detail, item.note].filter(Boolean).join(" · ")) +
        '<div class="ca-mgr-card-actions">' +
        act.map(function (a) { return btn(key + "-" + a, item.id || name, a.charAt(0).toUpperCase() + a.slice(1)); }).join("") +
        "</div></div>";
    }).join("") || emptyState("No " + key, "Seed " + key + " from demo extras.");
    return healthStrip(list.length + " items", list.length ? "ok" : "warn") + muted(titleNote || "") +
      '<div class="ca-mgr-grid" data-ca-motion="list-grid">' + cards + "</div>" +
      detailPane('<div data-ca-phase class="ca-mgr-muted">Lifecycle receipts appear here.</div>');
  }


  function bindList(opts, root, key) {
    onAct(root, function (act, id) {
      if (act.indexOf(key + "-") !== 0) return;
      var verb = act.slice(key.length + 1);
      var list = storeGet(key, []);
      var arr = Array.isArray(list) ? list.slice() : (list.items || list.rows || list.worktrees || list.top || list.pinned || []).slice();
      if (verb === "remove") {
        var next = arr.filter(function (x) { return (x.id || x.title || x.name) !== id; });
        if (Array.isArray(list)) storeSet(key, next);
        else {
          var obj = clone(list);
          if (obj.items) obj.items = next; else if (obj.rows) obj.rows = next; else if (obj.worktrees) obj.worktrees = next;
          storeSet(key, obj);
        }
        receipt(key + " remove receipt: " + id + " removed from demo store", "warn");
        rerender(opts);
      } else {
        receipt(key + " " + verb + " receipt: " + id + " (simulated)", "info");
      }
    });
  }

  function bodyHistory() {
    var list = storeGet("history", []);
    if (!Array.isArray(list)) list = (list && list.items) || [];
    var cards = list.map(function (item, idx) {
      var name = item.title || item.name || item.id;
      var acts = item.legalHold
        ? [btn("history-open", item.id || name, "Open"), btn("history-export", item.id || name, "Export")]
        : [btn("history-open", item.id || name, "Open"), btn("history-export", item.id || name, "Export"), btn("history-remove", item.id || name, "Remove")];
      return '<div class="ca-mgr-card ca-motion-stagger" style="--ca-stagger:' + (Math.min(idx,6)*40) + 'ms">' +
        '<div class="ca-mgr-card-title">' + esc(name) +
        (item.kind ? ' <span class="ca-badge" data-kind="scope">' + esc(item.kind) + "</span>" : "") +
        (item.legalHold ? ' <span class="ca-badge" data-kind="state" data-icon data-state="attention">Legal hold</span>' : "") +
        (item.status ? stateBadge(item.status) : "") + "</div>" +
        muted([item.at, item.project, item.detail, item.note].filter(Boolean).join(" · ")) +
        (item.legalHold ? muted("On legal hold — retained for audit; export remains available, delete is disabled.") : "") +
        '<div class="ca-mgr-card-actions">' + acts.join("") + "</div></div>";
    }).join("") || emptyState("No history", "Threads, Goal transcripts, and planning runs appear here.");
    return healthStrip(list.length + " records", list.some(function (i) { return i.legalHold; }) ? "warn" : "ok") +
      muted("Threads, Goal transcripts, and planning runs. Legal-hold rows cannot be removed.") +
      filterBar("Filter history", btn("history-refresh", null, "Refresh")) +
      '<div class="ca-mgr-grid" data-ca-motion="list-grid">' + cards + "</div>" +
      detailPane('<div data-ca-phase class="ca-mgr-muted">History receipts appear here.</div>');
  }
  function bodyArtifacts() {
    var list = storeGet("artifacts", []);
    if (!Array.isArray(list)) list = (list && list.items) || [];
    var cards = list.map(function (item, idx) {
      var name = item.title || item.name || item.id;
      var unavailable = /unavail/i.test(String(item.status || ""));
      return '<div class="ca-mgr-card ca-motion-stagger" style="--ca-stagger:' + (Math.min(idx,6)*40) + 'ms">' +
        '<div class="ca-mgr-card-title">' + esc(name) +
        (item.kind ? ' <span class="ca-badge" data-kind="scope">' + esc(item.kind) + "</span>" : "") +
        stateBadge(item.status || "ready") + "</div>" +
        muted([item.size, item.owner ? ("Owner " + item.owner) : "", item.retention ? ("Retain " + item.retention) : "", item.location || item.path].filter(Boolean).join(" · ")) +
        (unavailable ? muted("Unavailable capability — shown as a search/exemplar surface, not a live media studio.") : "") +
        '<div class="ca-mgr-card-actions">' +
        btn("artifacts-open", item.id || name, unavailable ? "Explain" : "Open") +
        btn("artifacts-reveal", item.id || name, "Reveal") +
        btn("artifacts-redact", item.id || name, "Redact") +
        (unavailable ? "" : btn("artifacts-remove", item.id || name, "Delete")) +
        "</div></div>";
    }).join("") || emptyState("No artifacts", "Screenshots, reports, and generated media appear with retention and ownership.");
    return healthStrip(list.length + " artifacts", list.some(function (i) { return /unavail|attention/i.test(String(i.status||"")); }) ? "warn" : "ok") +
      muted("Outputs, logs, and patches with retention and ownership. Redact is a phased simulated receipt.") +
      '<div class="ca-mgr-filter">' + btn("artifacts-refresh", null, "Rescan outputs") + "</div>" +
      '<div class="ca-mgr-grid" data-ca-motion="list-grid">' + cards + "</div>" +
      detailPane('<div data-ca-phase class="ca-mgr-muted">Artifact receipts appear here.</div>');
  }
  function bodyWorktrees() {
    var w = storeGet("worktrees", []);
    var trees = Array.isArray(w) ? w : (w && w.worktrees) || [];
    var toolsHtml = "";
    if (w && !Array.isArray(w) && w.tools) {
      toolsHtml = (w.tools || []).map(function (t) {
        return '<div class="ca-mgr-card"><div class="ca-mgr-card-title">' + esc(t.name) + ' <span class="ca-badge" data-kind="scope">' + esc(t.state) + "</span></div>" +
          muted((t.install || "") + " · confidence " + (t.confidence || "—")) +
          '<div class="ca-mgr-card-actions">' + btn("worktrees-open", t.name, "Probe") + btn("worktrees-reveal", t.name, "Reveal install") + "</div></div>";
      }).join("");
    }
    var cards = trees.map(function (item) {
      var name = item.name || item.id;
      return '<div class="ca-mgr-card"><div class="ca-mgr-card-title">' + esc(name) +
        (item.state ? ' <span class="ca-badge" data-kind="scope">' + esc(item.state) + "</span>" : "") + "</div>" +
        muted([item.path, item.branch].filter(Boolean).join(" · ")) +
        '<div class="ca-mgr-card-actions">' +
        btn("worktrees-open", item.id || name, "Open") +
        btn("worktrees-reveal", item.id || name, "Reveal") +
        btn("worktrees-remove", item.id || name, "Remove") +
        "</div></div>";
    }).join("") || emptyState("No worktrees", "Seed worktrees from demo extras.");
    var head = (w && !Array.isArray(w))
      ? healthStrip("Source control", "ok") + muted((w.forge && w.forge.name ? w.forge.name + " · " + w.forge.state : "Forge unset") + " · push " + (w.pushPolicy || "—"))
      : healthStrip(trees.length + " worktrees", "ok");
    return head + muted("Active worktrees are never cleaned without explicit inclusion.") +
      (toolsHtml ? '<div class="ca-mgr-grid">' + toolsHtml + "</div>" : "") +
      '<div class="ca-mgr-grid">' + cards + "</div>";
  }
  function bodyGithub() {
    var g = storeGet("githubActions", { pinned: [], currentRun: null });
    if (Array.isArray(g)) {
      g = {
        connected: true,
        pinned: g.map(function (w) {
          return { id: w.id, name: w.name || w.title || w.id, last: w.lastRun || w.last || "—", runs: w.runs || 0, status: w.status };
        }),
        currentRun: null
      };
    }
    var pinned = (g.pinned || []).map(function (w) {
      return '<div class="ca-mgr-card"><div class="ca-mgr-card-title">' + esc(w.name || w.title || w.id) + "</div>" + muted("Last " + (w.last || w.lastRun || "—") + " · " + (w.runs || 0) + " runs") +
        '<div class="ca-mgr-card-actions">' + btn("githubActions-open", w.id, "Open") + btn("githubActions-reveal", w.id, "Runs") + btn("githubActions-remove", w.id, "Unpin") + "</div></div>";
    }).join("");
    var jobs = ((g.currentRun && g.currentRun.jobs) || []).map(function (j) {
      return '<div class="ca-log-line">' + esc(j.name) + " — " + esc(j.conclusion || j.status) + " · " + esc(j.duration || "") + "</div>";
    }).join("");
    return healthStrip(g.connected ? "Connected" : "Not connected", g.connected ? "ok" : "warn") +
      muted(g.readiness || "") +
      '<div class="ca-mgr-grid">' + (pinned || emptyState("No pinned workflows", "")) + "</div>" +
      '<div class="ca-panel"><div class="ca-panel-h">Current run</div><div class="ca-logs">' + (jobs || muted("No run")) + "</div>" +
      '<div class="ca-mgr-card-actions">' + btn("githubActions-open", "current", "Refresh") + "</div></div>";
  }
    function stringSanitizeDigest(s) {
    s = String(s == null ? "" : s);
    return s.replace(/sha256:[a-f0-9]+/ig, "checksum (advanced)")
            .replace(/digest\s+sha256:[a-f0-9]+/ig, "checksum (advanced)");
  }

  function stringSanitizeDigestList(arr) {
    return (Array.isArray(arr) ? arr : []).map(function (x) {
      if (typeof x === "string") return stringSanitizeDigest(x);
      if (x && typeof x === "object") {
        var y = clone(x);
        if (y.text) y.text = stringSanitizeDigest(y.text);
        if (y.detail) y.detail = stringSanitizeDigest(y.detail);
        return y;
      }
      return x;
    });
  }

  function bodyContainers() {
    var c = storeGet("containers", { top: [] });
    if (Array.isArray(c)) {
      c = {
        note: "",
        top: c.map(function (t) {
          return { name: t.name || t.title || t.id, state: t.state || t.status || "ready", detail: t.detail || "", expanded: stringSanitizeDigestList(t.expanded) || [] };
        })
      };
    }
    var tops = (c.top || []).map(function (t) {
      return '<div class="ca-mgr-card"><div class="ca-mgr-card-title">' + esc(t.name || t.title || t.id) + ' <span class="ca-badge" data-kind="scope">' + esc(t.state || t.status || "ready") + "</span></div>" +
        muted(t.detail || "") +
        detailPane('<ul>' + (stringSanitizeDigestList(t.expanded) || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>") +
        '<div class="ca-mgr-card-actions">' + btn("containers-open", t.name, "Probe") + btn("containers-reveal", t.name, "Expand") + btn("containers-remove", t.name, "Forget") + "</div></div>";
    }).join("") || emptyState("No container tools", "Seed containers from demo extras.");
    return healthStrip("Container tools", "ok") + muted(c.note || "") + '<div class="ca-mgr-grid">' + tops + "</div>";
  }

  function bodyWeb() {
    var w = storeGet("web", {});
    var fetch = w.fetch || {};
    var search = w.search || {};
    var extract = w.extract || {};
    return healthStrip(w.readiness || ((fetch.status || "Fetch") + " · " + (search.status || "Search")), search.status === "not-configured" ? "warn" : "ok") +
      '<div class="ca-mgr-grid">' +
      '<div class="ca-mgr-card"><div class="ca-mgr-card-title">Provider priority</div>' + muted((w.providerPriority || []).join(" → ") || "—") +
      '<div class="ca-mgr-card-actions">' + btn("web-open", "priority", "Edit order") + btn("web-reveal", "priority", "Test search") + "</div></div>" +
      '<div class="ca-mgr-card"><div class="ca-mgr-card-title">Fetch</div>' +
      muted("Allowlist: " + (fetch.allowlist || "—") + " · " + (fetch.enabled ? "enabled" : "disabled")) +
      ' <span class="ca-badge" data-kind="state" data-icon data-state="' + (fetch.status === "ready" ? "default" : "not-configured") + '">' + esc(fetch.status || "ready") + "</span>" +
      '<div class="ca-mgr-card-actions">' + btn("web-open", "fetch", "Edit allowlist") + "</div></div>" +
      '<div class="ca-mgr-card"><div class="ca-mgr-card-title">Search</div>' +
      muted("Provider: " + (search.provider || "—")) +
      ' <span class="ca-badge" data-kind="state" data-icon data-state="' + (search.status === "ready" ? "default" : "not-configured") + '">' + esc(search.status || "not-configured") + "</span>" +
      '<div class="ca-mgr-card-actions">' + btn("web-open", "search", "Configure provider") + btn("web-reveal", "search", "Test query") + "</div></div>" +
      '<div class="ca-mgr-card"><div class="ca-mgr-card-title">Extract</div>' + muted("Route: " + (extract.route || "—")) +
      '<div class="ca-mgr-card-actions">' + btn("web-open", "extract", "Change route") + "</div></div>" +
      '<div class="ca-mgr-card"><div class="ca-mgr-card-title">Limits</div>' + muted(w.limits ? Object.keys(w.limits).map(function (k) { return k + ": " + w.limits[k]; }).join(" · ") : "—") +
      '<div class="ca-mgr-card-actions">' + btn("web-open", "limits", "Adjust") + "</div></div>" +
      '<div class="ca-mgr-card"><div class="ca-mgr-card-title">Guards</div>' + muted((w.creditGuard || "") + " · " + (w.airGap || "") + " · " + (w.browserSessions || "")) +
      '<div class="ca-mgr-card-actions">' + btn("web-reveal", "guards", "Show policy") + btn("web-remove", "cache", "Clear page cache") + "</div></div>" +
      "</div>" +
      detailPane('<div data-ca-phase class="ca-mgr-muted">Web capability receipts appear here.</div>');
  }


  function bodySearchIndex() {
    var s = storeGet("searchIndex", { enabled: true, rebuild: {} });
    var reb = s.rebuild || {};
    var docs = s.documents != null ? s.documents : "—";
    return healthStrip((s.enabled === false ? "Index off" : "Index on") + " · " + (reb.state || s.status || "idle") + " · " + docs + " docs", "ok") +
      muted("Last full rebuild: " + (reb.lastFull || s.lastBuild || "—") + " · disk " + (s.disk || "—") + " · lag " + (s.lag || "—")) +
      muted("Exclusions: " + ((s.exclusions || []).join(", ") || "—")) +
      muted(s.note || "") +
      '<div class="ca-mgr-filter">' +
      switchCtl("search-enable", "enabled", s.enabled !== false, "Enable index") +
      btn("search-rebuild", null, "Rebuild") +
      btn("search-phases", null, "Show phases") +
      btn("search-drop", null, "Drop cache") +
      "</div>" +
      detailPane('<div data-ca-phase class="ca-mgr-muted">Phases: ' + esc(((reb.phases || []).join(" → ") || "scan → tokenize → write")) + ". " + esc(reb.note || "Idle.") + "</div>");
  }


  
  function bindSearchIndex(opts, root) {
    onAct(root, function (act, id, el) {
      var pane = root.querySelector("[data-ca-phase]");
      function phase(msg, k) { if (pane) pane.textContent = msg; receipt(msg, k || "info"); }
      var s = clone(storeGet("searchIndex", { rebuild: {} }));
      s.rebuild = s.rebuild || {};
      if (act === "search-enable") {
        s.enabled = !s.enabled;
        storeSet("searchIndex", s);
        phase("Index " + (s.enabled ? "enabled" : "disabled") + " (simulated)", "ok");
        rerender(opts); return;
      }
      if (act === "search-rebuild" || act === "searchIndex-open") {
        root.setAttribute("data-ca-work", "refresh");
        var __owHost = (window.CAObservableWork && CAObservableWork.ensureHost) ? CAObservableWork.ensureHost(root) : null;
        var __ow = (__owHost && window.CAObservableWork) ? CAObservableWork.attach({ host: __owHost, receipt: false, snapshot: { title: "Manager work", human_phase: "Starting", state: "starting", progress_kind: "indeterminate", progress_source: "derived" } }) : null;
        s.rebuild.state = "rebuilding";
        storeSet("searchIndex", s);
        rerender(opts);
        ((opts && opts._caScope && opts._caScope.trackTimeout) ? opts._caScope.trackTimeout : window.setTimeout)(function () {
          var again = clone(storeGet("searchIndex", { rebuild: {} }));
          again.rebuild = again.rebuild || {};
          again.rebuild.state = "idle";
          again.rebuild.lastFull = "just now";
          again.rebuild.note = "Rebuild finished — last-known-good served during the run.";
          again.lastBuild = "just now";
          again.lag = "0s";
          storeSet("searchIndex", again);
          root.removeAttribute("data-ca-work");
          phase("Rebuild receipt: scan → tokenize → write complete (simulated)", "ok");
          rerender(opts);
        }, 700);
        phase("Rebuild started — serving last-known-good results", "info");
        return;
      }
      if (act === "search-phases" || act === "searchIndex-reveal") {
        phase("Phases: " + ((s.rebuild.phases || ["scan","tokenize","write"]).join(" → ")), "info"); return;
      }
      if (act === "search-drop" || act === "searchIndex-remove") {
        s.rebuild.note = "Cache dropped — next search rebuilds lazily.";
        storeSet("searchIndex", s);
        phase("Drop cache receipt: index cache cleared in demo store", "warn");
        rerender(opts);
      }
    });
  }

  function bodyCleanup() {
    var raw = storeGet("cleanup", []);
    var model = Array.isArray(raw) ? { mode: "dry-run", candidates: raw, reclaimable: "—", protectedNote: "Active worktrees stay protected." } : (raw || {});
    var list = model.candidates || model.items || [];
    var included = list.filter(function (c) { return c.included && !c.protected; }).length;
    var cards = list.map(function (c, idx) {
      var st = c.protected ? "managed" : (c.status || "ready");
      return '<div class="ca-mgr-card ca-motion-stagger" style="--ca-stagger:' + (Math.min(idx,6)*40) + 'ms">' +
        '<div class="ca-mgr-card-title">' + esc(c.title || c.name || c.id) +
        ' <span class="ca-badge" data-kind="state" data-icon data-state="' + (c.protected ? "managed" : c.included ? "default" : "not-configured") + '">' +
        esc(c.protected ? "Protected" : c.included ? "Included" : "Excluded") + "</span></div>" +
        muted((c.impact || "") + (c.detail ? " · " + c.detail : "")) +
        '<div class="ca-mgr-card-actions">' +
        (c.protected ? btn("cleanup-open", c.id, "Why protected") :
          (btn("cleanup-include", c.id, c.included ? "Exclude" : "Include") + btn("cleanup-open", c.id, "Inspect"))) +
        (!c.protected ? btn("cleanup-remove", c.id, "Drop candidate") : "") +
        "</div></div>";
    }).join("") || emptyState("No cleanup candidates", "Run a dry-run to discover reclaimable items.");
    return healthStrip((model.mode || "dry-run") + " · " + included + " included · " + (model.reclaimable || "—"), included ? "warn" : "ok") +
      muted(model.protectedNote || "Dry-run only — nothing is deleted until Apply cleanup.") +
      muted("Last dry-run: " + (model.lastDryRun || "—")) +
      '<div class="ca-mgr-filter">' +
      btn("cleanup-dry", null, "Run dry-run") +
      btn("cleanup-apply", null, "Apply cleanup") +
      btn("cleanup-rollback", null, "Undo last apply") +
      "</div>" +
      '<div class="ca-mgr-grid" data-ca-motion="list-grid">' + cards + "</div>" +
      detailPane('<div data-ca-phase class="ca-mgr-muted">Cleanup phases appear here.</div>');
  }


  
  function bindCleanup(opts, root) {
    onAct(root, function (act, id) {
      var pane = root.querySelector("[data-ca-phase]");
      function phase(msg, k) {
        if (pane) pane.textContent = msg;
        receipt(msg, k || "info");
      }
      var raw = clone(storeGet("cleanup", { candidates: [] }));
      var model = Array.isArray(raw) ? { mode: "dry-run", candidates: raw } : raw;
      model.candidates = model.candidates || [];
      if (act === "cleanup-dry") {
        root.setAttribute("data-ca-work", "refresh");
        var __owHost = (window.CAObservableWork && CAObservableWork.ensureHost) ? CAObservableWork.ensureHost(root) : null;
        var __ow = (__owHost && window.CAObservableWork) ? CAObservableWork.attach({ host: __owHost, receipt: false, snapshot: { title: "Manager work", human_phase: "Starting", state: "starting", progress_kind: "indeterminate", progress_source: "derived" } }) : null;
        model.lastDryRun = "just now";
        model.mode = "dry-run";
        storeSet("cleanup", model);
        ((opts && opts._caScope && opts._caScope.trackTimeout) ? opts._caScope.trackTimeout : window.setTimeout)(function () { root.removeAttribute("data-ca-work"); }, 600);
        phase("Dry-run complete — candidates refreshed; nothing deleted", "ok");
        rerender(opts); return;
      }
      if (act === "cleanup-apply") {
        root.setAttribute("data-ca-work", "import-apply");
        model.mode = "applied-simulated";
        storeSet("cleanup", model);
        phase("Apply cleanup receipt: phase 1/2 staged · phase 2/2 simulated — no disk deletes", "warn");
        ((opts && opts._caScope && opts._caScope.trackTimeout) ? opts._caScope.trackTimeout : window.setTimeout)(function () { root.removeAttribute("data-ca-work"); }, 700);
        rerender(opts); return;
      }
      if (act === "cleanup-rollback") {
        root.setAttribute("data-ca-work", "import-rollback");
        model.mode = "dry-run";
        storeSet("cleanup", model);
        phase("Undo receipt: restored previous dry-run selection (simulated)", "ok");
        ((opts && opts._caScope && opts._caScope.trackTimeout) ? opts._caScope.trackTimeout : window.setTimeout)(function () { root.removeAttribute("data-ca-work"); }, 700);
        rerender(opts); return;
      }
      var c = findById(model.candidates, id);
      if (!c) return;
      if (act === "cleanup-include") {
        if (c.protected) { phase("Protected candidate cannot be included", "warn"); return; }
        c.included = !c.included;
        storeSet("cleanup", model);
        phase((c.included ? "Included" : "Excluded") + ": " + (c.title || id), "ok");
        rerender(opts);
      } else if (act === "cleanup-open") {
        phase((c.protected ? "Protected: " : "Inspect: ") + (c.detail || c.impact || id), "info");
      } else if (act === "cleanup-remove") {
        if (c.protected) { phase("Protected candidate stays listed", "warn"); return; }
        model.candidates = model.candidates.filter(function (x) { return x.id !== id; });
        storeSet("cleanup", model);
        phase("Drop candidate receipt: " + id, "warn");
        rerender(opts);
      }
    });
  }

  function bodyServerShell() {
    var s = storeGet("serverShell", { cards: [], deferredModules: [], note: "" });
    var status = (s.cards || []).map(function (c) {
      return '<div class="ca-mgr-card"><div class="ca-mgr-card-title">' + esc(c.label) + "</div>" + muted(String(c.value)) + "</div>";
    }).join("");
    var deferred = (s.deferredModules || []).map(function (d) {
      return '<div class="ca-deferred-card" data-ca-id="' + esc(d.id) + '">' +
        '<div class="ca-mgr-card-title">' + esc(d.name) + "</div>" +
        muted("Owner: " + (d.owner || "Unassigned")) +
        muted("Insertion contract: " + (d.contract || "Reserved")) +
        '<div class="ca-mgr-card-actions">' + btn("server-deferred", d.id, "Open deferred module") + "</div></div>";
    }).join("") || emptyState("No deferred modules", "Seed serverShell.deferredModules.");
    return healthStrip("Reserved server surface", "ok") +
      muted(s.note || "Deferred cards only — named owner + insertion contract. No fake bootstrap.") +
      (status ? '<div class="ca-mgr-grid">' + status + "</div>" : "") +
      '<div class="ca-panel"><div class="ca-panel-h">Deferred modules</div><div class="ca-mgr-grid">' + deferred + "</div></div>";
  }

  function bindServerShell(opts, root) {
    onAct(root, function (act, id) {
      if (act !== "server-deferred") return;
      var s = storeGet("serverShell", { deferredModules: [] });
      var d = findById(s.deferredModules || [], id);
      var owner = d && d.owner ? d.owner : "named owner";
      receipt("deferred to " + owner, "info");
    });
  }

  function bodyMedia() {
    var list = storeGet("mediaProviders", []);
    var cards = list.map(function (m) {
      return '<div class="ca-mgr-card"><div class="ca-mgr-card-title">' + esc(m.name) +
        ' <span class="ca-badge" data-kind="scope">' + esc(m.health || "unknown") + "</span></div>" +
        muted((m.kinds || []).join(", ") + " · " + ((m.routePurposes || []).join(" · "))) +
        muted("Output " + (m.outputFormat || "—") + " → " + (m.outputLocation || "—") + " · " + (m.costRoute || "")) +
        muted(m.safetyStatus || "") +
        detailPane('<div class="ca-logs">' + (m.history || []).map(function (h) {
          return '<div class="ca-log-line">' + esc(h.at) + " — " + esc(h.summary) + "</div>";
        }).join("") + "</div>") +
        '<div class="ca-mgr-card-actions">' + btn("mediaProviders-open", m.id, "Open") + btn("mediaProviders-reveal", m.id, "History") + btn("mediaProviders-remove", m.id, "Disable") + "</div></div>";
    }).join("") || emptyState("No media providers", "Seed mediaProviders from the demo dataset.");
    return healthStrip(list.length + " media providers", "ok") + '<div class="ca-mgr-grid">' + cards + "</div>";
  }


  function bindSkills(opts, root) {
    bindResourceList(opts, root, "skills", "skills");
    onAct(root, function (act, id) {
      var list = storeGet("skills", []).slice();
      var s = findById(list, id);
      if (!s) return;
      if (act === "skills-toggle") {
        s.enabled = !s.enabled;
        storeSet("skills", list);
        receipt((s.enabled ? "Enabled" : "Disabled") + " skill " + (s.name || id) + " (demo)", "ok");
        rerender(opts); return;
      }
      if (act === "skills-trust") {
        s.trusted = true;
        storeSet("skills", list);
        receipt("Marked " + (s.name || id) + " trusted (demo)", "ok");
        rerender(opts);
      }
    });
  }

  function bindToolsDeep(opts, root) {
    bindResourceList(opts, root, "tools", "tools");
    onAct(root, function (act, id) {
      if (act !== "tools-toggle") return;
      var list = storeGet("tools", []).slice();
      var t = findById(list, id);
      if (!t) return;
      t.projectEnabled = !(t.projectEnabled !== false);
      storeSet("tools", list);
      receipt("Project tool " + (t.name || id) + " → " + (t.projectEnabled ? "enabled" : "off") + " (demo)", "ok");
      rerender(opts);
    });
  }

  function bindHistoryDeep(opts, root) {
    /* Dedicated handler — do not call bindList first; that mutates history-remove
       before any legal-hold guard can run. */
    onAct(root, function (act, id) {
      if (act.indexOf("history-") !== 0) return;
      var pane = root.querySelector("[data-ca-phase]");
      var verb = act.slice("history-".length);
      var list = storeGet("history", []);
      var arr = Array.isArray(list) ? list.slice() : ((list && list.items) || []).slice();
      var row = findById(arr, id);

      if (verb === "refresh") {
        if (pane) pane.textContent = "History refresh receipt: index revalidated (simulated)";
        receipt("History refresh receipt (simulated)", "ok");
        return;
      }
      if (verb === "export") {
        if (pane) pane.textContent = "Export receipt: " + id + " packaged (simulated)";
        receipt("Export history " + id + " (simulated)", "info");
        return;
      }
      if (verb === "remove") {
        if (row && row.legalHold) {
          if (pane) pane.textContent = "Remove blocked: legal hold on " + id;
          receipt("Cannot remove legal-hold history " + id, "warn");
          return;
        }
        var next = arr.filter(function (x) { return (x.id || x.title || x.name) !== id; });
        if (Array.isArray(list)) storeSet("history", next);
        else {
          var obj = clone(list) || {};
          obj.items = next;
          storeSet("history", obj);
        }
        if (pane) pane.textContent = "Remove receipt: " + id + " removed from demo store";
        receipt("history remove receipt: " + id + " removed from demo store", "warn");
        rerender(opts);
        return;
      }
      if (pane) pane.textContent = "History " + verb + " receipt: " + id + " (simulated)";
      receipt("history " + verb + " receipt: " + id + " (simulated)", "info");
    });
  }

  function bindArtifactsDeep(opts, root) {
    bindList(opts, root, "artifacts");
    onAct(root, function (act, id) {
      var pane = root.querySelector("[data-ca-phase]");
      function phase(msg, k) { if (pane) pane.textContent = msg; receipt(msg, k || "info"); }
      if (act === "artifacts-refresh") { phase("Artifact rescan receipt (simulated)", "ok"); return; }
      if (act === "artifacts-redact") {
        root.setAttribute("data-ca-work", "import-preview");
        phase("Redact preview: identifying sensitive spans in " + id, "info");
        ((opts && opts._caScope && opts._caScope.trackTimeout) ? opts._caScope.trackTimeout : window.setTimeout)(function () {
          root.setAttribute("data-ca-work", "import-apply");
          phase("Redact apply: placeholders written for " + id + " (simulated)", "ok");
          ((opts && opts._caScope && opts._caScope.trackTimeout) ? opts._caScope.trackTimeout : window.setTimeout)(function () { root.removeAttribute("data-ca-work"); }, 480);
        }, 420);
      }
    });
  }


  /* ---------- registry + mount ---------- */

  var BODIES = {
    memory: { html: bodyMemory, bind: bindMemory },
    personas: { html: bodyPersonas, bind: bindPersonas },
    crews: { html: bodyCrews, bind: bindCrews },
    contextSources: { html: bodyContext, bind: bindContext },
    mcp: { html: bodyMcp, bind: bindMcp },
    lsp: { html: bodyLsp, bind: function (o, r) { bindResourceList(o, r, "lsp", "lsp"); } },
    skills: { html: bodySkills, bind: bindSkills },
    plugins: { html: bodyPlugins, bind: function (o, r) { bindResourceList(o, r, "plugins", "plugins"); } },
    tools: { html: bodyTools, bind: bindToolsDeep },
    commands: { html: bodyCommands, bind: bindCommands },
    terminal: { html: bodyTerminal, bind: function (o, r) {
      onAct(r, function (act, id) {
        var term = clone(storeGet("terminal", { profiles: [] }));
        var list = (term.profiles || []).slice();
        var p = findById(list, id);
        var name = p ? p.name : id;
        if (act === "terminal-restart") { receipt("Restart simulated for terminal " + name, "info"); }
        else if (act === "terminal-logs") { receipt("Transcript opened for " + name + " (simulated)", "info"); }
        else if (act === "terminal-connect" && p) {
          term.activeProfile = p.id; term.profiles = list; storeSet("terminal", term);
          receipt("Active terminal profile → " + name, "ok"); rerender(o);
        }
      });
    } },
    notifications: { html: bodyNotifications, bind: bindNotifications },
    soundLibrary: { html: bodySound, bind: bindSound },
    desktop: { html: bodyDesktop, bind: bindDesktop },
    teacher: { html: bodyTeacher, bind: bindTeacher },
    bsd: { html: bodyBsd, bind: bindBsd },
    permissionsRules: { html: bodyPermissions, bind: bindPermissions },
    goal: { html: bodyGoal, bind: bindGoal },
    fileManager: { html: bodyFileManager, bind: bindFileManager },
    formatters: { html: bodyFormatters, bind: function (o, r) { bindResourceList(o, r, "formatters", "formatters"); } },
    testing: { html: bodyTesting, bind: function (o, r) {
      onAct(r, function (act, id) {
        var t = clone(storeGet("testing", { capabilities: [] }));
        var caps = (t.capabilities || []).slice();
        var c = findById(caps, id);
        var name = c ? c.name : id;
        if (act === "testing-restart") receipt("Run probe simulated for " + name, "info");
        else if (act === "testing-logs") receipt("Last report opened for " + name + " (simulated)", "info");
        else if (act === "testing-connect") receipt("Configure " + name + " (simulated)", "info");
      });
    } },
    storage: { html: bodyStorage, bind: function (o, r) { bindPhased(o, r, "storage", "Storage"); } },
    backup: { html: bodyBackup, bind: function (o, r) { bindPhased(o, r, "backup", "Backup"); } },
    settingsLifecycle: { html: bodySettingsLifecycle, bind: function (o, r) { bindPhased(o, r, "settingsLifecycle", "Settings lifecycle"); } },
    history: { html: bodyHistory, bind: bindHistoryDeep },
    artifacts: { html: bodyArtifacts, bind: bindArtifactsDeep },
    worktrees: { html: bodyWorktrees, bind: function (o, r) { bindList(o, r, "worktrees"); } },
    githubActions: { html: bodyGithub, bind: function (o, r) { bindList(o, r, "githubActions"); } },
    containers: { html: bodyContainers, bind: function (o, r) { bindList(o, r, "containers"); } },
    web: { html: bodyWeb, bind: function (o, r) { bindList(o, r, "web"); } },
    searchIndex: { html: bodySearchIndex, bind: bindSearchIndex },
    cleanup: { html: bodyCleanup, bind: bindCleanup },
    serverShell: { html: bodyServerShell, bind: bindServerShell },
    appearanceThemes: { html: bodyAppearance, bind: bindAppearance },
    mediaProviders: { html: bodyMedia, bind: function (o, r) { bindList(o, r, "mediaProviders"); } },
    spell: { html: bodySpell, bind: bindSpell }
  };

  function mount(opts) {
    if (!opts || !opts.root) return false;
    if (_mounting) return false;
    var managerId = resolveId(opts.managerId);
    if (managerId === "providers") {
      /* Concepts keep their custom provider surfaces (CAViews.bindProviders). */
      return false;
    }
    _mounting = true;
    try {
    disposeActiveScope();
    hydrateManager(managerId, window.PM_SETTINGS_DEMO);
    var entry = BODIES[managerId];
    if (!entry) return false;

    var chrome = opts.chrome || {};
    var wrapClass = chrome.wrapClass || "ca-mgr-wrap";
    var barClass = chrome.barClass || "ca-mgr-bar";
    var detailClass = chrome.detailClass || "ca-mgr-detail";
    var backId = chrome.backId || "ca-mgr-back";
    var title = chrome.title || TITLES[managerId] || managerId;

    var bodyHtml;
    try { bodyHtml = entry.html(opts); }
    catch (err) { bodyHtml = emptyState("Manager failed to render", String(err && err.message || err)); }

    opts.root.innerHTML =
      '<div class="' + esc(wrapClass) + '" data-ca-manager="' + esc(managerId) + '">' +
      '<div class="' + esc(barClass) + '">' +
      '<button type="button" class="ca-btn" data-variant="quiet" id="' + esc(backId) + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg> Back</button>' +
      "<h1>" + esc(title) + "</h1>" +
      "</div>" +
      '<div class="' + esc(detailClass) + ' ca-mgr-body">' + bodyHtml + "</div>" +
      "</div>";

    var back = document.getElementById(backId);
    if (back) {
      back.addEventListener("click", function () {
        if (typeof opts.onBack === "function") opts.onBack();
      });
    }

    var bodyRoot = opts.root.querySelector(".ca-mgr-body") || opts.root;
    var scopeTimers = [];
    var scope = {
      timers: scopeTimers,
      dispose: function () {
        while (scopeTimers.length) {
          try { window.clearTimeout(scopeTimers.pop()); } catch (e0) {}
        }
        if (window.CAObservableWork && CAObservableWork.disposeAll) {
          try { CAObservableWork.disposeAll(); } catch (e1) {}
        }
      },
      trackTimeout: function (fn, ms) {
        var id = window.setTimeout(fn, ms);
        scopeTimers.push(id);
        return id;
      }
    };
    _activeScope = scope;
    opts._caScope = scope;
    try { entry.bind(opts, bodyRoot); }
    catch (err2) { receipt("Binder error in " + managerId + ": " + (err2 && err2.message || err2), "danger"); }

    return true;
    } finally {
      _mounting = false;
    }
  }


  function handles(managerId) {
    var id = resolveId(managerId);
    if (id === "providers") return false;
    return !!BODIES[id];
  }

  window.CAManagers = {
    defaultSeed: defaultSeed,
    hydrateManager: hydrateManager,
    disposeActiveScope: disposeActiveScope,
    mount: mount,
    handles: handles,
    /* documented helpers for concepts / tests */
    SEED_KEYS: SEED_KEYS.slice(),
    SHELL_KEYS: SHELL_KEYS.slice(),
    MANAGER_KEYS: MANAGER_KEYS.slice(),
    TITLES: TITLES,
    resolveId: resolveId
  };
})();
