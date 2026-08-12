/* managers.js — uniform manager shell + dedicated manager renderers.
   All dedicated managers share the same chrome (packet 04): search/filter, add/connect action,
   health summary, resource rows/cards, details, requested/effective state, loading/empty/error/
   managed/unavailable states, logs/diagnostics, consistent motion.
   This is the system proof: every manager renders through PM.managerShell(). */
(function () {
  "use strict";
  var M = window.PM.managers_lib = {};

  /* ---------- UNIFORM SHELL ---------- */
  /* opts: { title, icon, addLabel, health:{text,kind}, summary, toolbar(arr) } */
  M.shell = function (opts, bodyHTML) {
    var toolbar = (opts.toolbar || []).map(function (t) {
      return '<button class="btn sm" data-manager-toolbar="' + t.id + '">' + (t.icon ? PM.svg(t.icon, 14) : "") + t.label + '</button>';
    }).join("");
    return [
      '<div class="mgr">',
        '<header class="mgr-head">',
          '<div class="row center gap">',
            '<span class="mgr-icon">' + PM.svg(opts.icon || "grid", 20) + '</span>',
            '<div class="col grow">',
              '<h2 class="mgr-title">' + opts.title + '</h2>',
              (opts.summary ? '<span class="mgr-summary muted">' + opts.summary + '</span>' : ''),
            '</div>',
          '</div>',
          '<div class="row center gap-sm">',
            toolbar,
            '<span class="field sm mgr-search"><span class="muted">' + PM.svg("search", 14) + '</span>',
              '<input type="search" placeholder="Filter ' + opts.title.toLowerCase() + '" data-manager-search aria-label="Filter ' + opts.title + '"></span>',
            '<button class="btn primary sm" data-manager-action="add">' + PM.svg("plus", 14) + (opts.addLabel || "Add") + '</button>',
          '</div>',
        '</header>',
        '<div class="mgr-health ' + (opts.health ? opts.health.kind : "neutral") + '">',
          '<span class="sdot ' + (opts.health ? opts.health.kind : "") + '"></span>',
          '<span>' + (opts.health ? opts.health.text : "Healthy") + '</span>',
        '</div>',
        '<div class="mgr-body" data-scroller>', bodyHTML, '</div>',
      '</div>'
    ].join("");
  };

  /* ---------- PROVIDER / AGENT / MODEL (mandatory) ---------- */
  M.pam = function () {
    var rows = PM_DEMO.providers.map(function (p) {
      // connection groups
      var groups = p.groups.map(function (g) {
        var items = g.items.map(function (it) {
          var st = it.status === "ready" ? "ok" : (it.status === "signed-out" || it.status === "authed-not-ready" || it.status === "needs-setup") ? "warn" : "bad";
          var stLabel = ({
            ready:"Ready", "signed-out":"Signed out", "authed-not-ready":"Authenticated · not ready",
            "needs-setup":"Needs setup", signedin:"Signed in"
          })[it.status] || it.status;
          var remaining = it.remaining ? '<span class="chip">' + it.remaining + (it.remainingPct != null ? ' · ' + it.remainingPct + '%' : '') + '</span>' : "";
          var identity = it.identity ? ' · id: ' + it.identity : "";
          var lastGen = it.lastGen && it.lastGen !== "—" ? ' · last gen ' + it.lastGen : "";
          // free-model setup action (A8)
          var setupBtn = it.status === "needs-setup" ? '<button class="btn sm primary" data-conn-action="setup" data-setup-model="' + PM_DEMO.freeModelSetup.modelId + '">' + PM.svg("bolt",13) + 'Setup</button>' : "";
          return [
            '<div class="conn-row" data-conn="' + it.id + '">',
              '<span class="sdot ' + st + '"></span>',
              '<div class="col grow gap-xs">',
                '<div class="row center gap-sm wrap"><strong class="conn-name">' + it.name + '</strong>',
                  '<span class="chip ' + (st === "ok" ? "ok" : st === "warn" ? "warn" : "bad") + '">' + stLabel + '</span>',
                  it.credType ? '<span class="chip">' + it.credType + '</span>' : '',
                  it.multi ? '<span class="priority-badge" data-priority="' + (it.priority||1) + '">P' + (it.priority||1) + '</span>' : '',
                '</div>',
                '<span class="muted small">' + (it.authOwner ? 'Owner: ' + it.authOwner + ' · ' : '') + (it.profile ? it.profile : '') + (it.endpoint ? ' · ' + it.endpoint : '') + identity + lastGen + '</span>',
                remaining,
                it.note ? '<span class="mgr-note ' + st + '">' + it.note + '</span>' : '',
              '</div>',
              '<div class="row center gap-xs">',
                st === "warn" || st === "bad" ? '<button class="btn sm primary" data-conn-action="reconnect">' + PM.svg("refresh",13) + 'Reconnect</button>' : '',
                setupBtn,
                '<button class="btn sm ghost" data-conn-action="refresh" title="Refresh">' + PM.svg("refresh",13) + '</button>',
                '<button class="btn sm ghost" data-conn-action="overflow" title="More" aria-label="More actions">' + PM.svg("overflow", 16) + '</button>',
              '</div>',
            '</div>'
          ].join("");
        }).join("");
        return '<div class="conn-group"><div class="conn-group-label">' + g.label + '</div>' + items + '</div>';
      }).join("");

      // models
      var models = p.models.map(function (mm) {
        var capChip = ({
          supported:["ok","Supported"], likely:["info","Likely"], unverified:["warn","Unverified"],
          "temporarily unavailable":["bad","Temp. unavailable"], "supported through another configured route":["info","Via alt route"],
          "supported through PM transformation":["info","Via PM transform"]
        })[mm.capability] || ["neutral", mm.capability];
        var stChip = mm.status === "available"
          ? '<span class="chip ok">Available</span>'
          : '<span class="chip bad">Unavailable</span><span class="mgr-note bad small">' + (mm.unavailableReason || "") + '</span>';
        // requested-vs-effective model (A6)
        var effNote = mm.requestedModel ? '<span class="mgr-note warn small">Requested ' + mm.requestedModel + '; effective ' + mm.name + ' — ' + (mm.effectiveNote||"") + '</span>' : "";
        var roles = mm.role && mm.role !== "—" ? '<span class="chip accent">' + mm.role + '</span>' : "";
        var badges = [];
        if (mm.fav) badges.push('<span class="chip" title="Favorite">' + PM.svg("pin",11) + 'Favorite</span>');
        if (mm.alias) badges.push('<span class="chip">alias: ' + mm.alias + '</span>');
        if (mm.priority) badges.push('<span class="priority-badge">P' + mm.priority + '</span>');
        if (mm.fast) badges.push('<span class="chip">Fast variant</span>');
        if (mm.effort) badges.push('<span class="chip">Effort</span>');
        if (mm.structuredOutput) badges.push('<span class="chip">Structured output</span>');
        if (mm.ctx) badges.push('<span class="chip mono">' + mm.ctx + ' ctx</span>');
        if (mm.tools) badges.push('<span class="chip">Tools</span>');
        if (mm.evidenceFresh === "fresh") badges.push('<span class="chip ok">Evidence fresh</span>');
        return [
          '<div class="model-row" data-model="' + mm.id + '"' + (mm.hidden?' data-hidden="1" style="opacity:.5"':'') + '>',
            '<div class="row center gap">',
              '<button class="btn sm ghost icon" data-model-fav aria-label="Toggle favorite" aria-pressed="' + (mm.fav ? "true" : "false") + '">' + PM.svg("pin",13) + '</button>',
              '<div class="col grow gap-xs">',
                '<div class="row center gap-sm wrap"><strong>' + mm.name + '</strong>' + stChip + roles + '</div>',
                '<div class="row center gap-xs wrap muted small">',
                  '<span class="chip ' + capChip[0] + '">Capability: ' + capChip[1] + '</span>',
                  '<span class="chip">Evidence: ' + mm.evidence + '</span>',
                  '<span>' + mm.modalities.join(" · ") + '</span>',
                '</div>',
                effNote,
                badges.length ? '<div class="row center gap-xs wrap">' + badges.join("") + '</div>' : '',
              '</div>',
            '</div>',
            '<div class="row center gap-xs">',
              '<button class="btn sm" data-model-action="menu">' + PM.svg("chevronDown",13) + 'Options</button>',
              '<button class="btn sm ghost icon" data-model-action="details" aria-label="Details">' + PM.svg("external",13) + '</button>',
            '</div>',
          '</div>'
        ].join("");
      }).join("");

      return [
        '<section class="provider" data-provider="' + p.id + '">',
          '<div class="provider-head">',
            '<div class="col grow gap-xs">',
              '<div class="row center gap-sm"><h3>' + p.name + '</h3><span class="chip">' + p.family + '</span></div>',
            '</div>',
            '<div class="row center gap-xs">',
              '<button class="btn sm" data-provider-action="refresh">' + PM.svg("refresh",13) + 'Refresh catalog</button>',
              '<button class="btn sm" data-provider-action="account">Accounts</button>',
              '<button class="btn sm" data-provider-action="roles">Roles</button>',
            '</div>',
          '</div>',
          '<div class="provider-cols">',
            '<div class="col gap"><div class="provider-col-label">Connections</div>' + (groups || '<div class="empty muted">No connections yet.</div>') + '</div>',
            '<div class="col gap"><div class="provider-col-label">Models</div>' + (models || '<div class="empty muted">No models.</div>') + '</div>',
          '</div>',
        '</section>'
      ].join("");
    }).join("");

    var catalog = [
      '<div class="catalog-bar">',
        '<span class="chip info">Catalog</span>',
        '<span class="muted small">' + PM_DEMO.catalogMeta.sources.join(" + ") + ' · ' + PM_DEMO.catalogMeta.state + '</span>',
        '<span class="muted small">Checked ' + PM_DEMO.catalogMeta.lastChecked + ' · activated ' + PM_DEMO.catalogMeta.lastActivated + '</span>',
        '<span class="chip ok" title="' + PM_DEMO.catalogMeta.validation + '">' + PM_DEMO.catalogMeta.validation.split("·")[0].trim() + '</span>',
        '<span class="grow"></span>',
        '<span class="muted small mono">' + PM_DEMO.catalogMeta.sourceVersion + '</span>',
      '</div>',
      '<details class="catalog-history"><summary>Material-change notices &amp; removed-free history</summary><ul>',
        PM_DEMO.catalogMeta.changes.map(function (ch) {
          return '<li class="' + (ch.kind==="removed-free"?"removed":"") + '">' + ch.text + ' <span class="faint">(' + ch.date + ')</span></li>';
        }).join(""),
      '</ul></details>'
    ].join("");

    var roles = [
      '<section class="provider">',
        '<div class="provider-head"><h3>Agent role assignments</h3>',
        '<span class="chip info">requested → effective</span></div>',
        '<div class="role-list">',
          PM_DEMO.roles.map(function (r) {
            var diff = r.diff ? '<span class="mgr-note warn small">Effective differs: ' + r.effNote + '</span>' : '';
            return '<div class="role-row"><div class="col grow gap-xs"><strong>' + r.name + '</strong>' +
              '<span class="muted small">' + r.route + '</span>' + diff + '</div>' +
              '<div class="col gap-xs center"><span class="chip">req: ' + r.model + '</span>' +
              '<span class="chip ' + (r.diff ? "warn" : "ok") + '">eff: ' + r.effective + '</span></div></div>';
          }).join(""),
        '</div>',
      '</section>'
    ].join("");

    var health = { text: "1 connection needs attention · 1 model unavailable", kind: "warn" };
    return M.shell({
      title: "Provider / Agent / Model", icon: "pam",
      addLabel: "Add connection", health: health,
      summary: "Providers, accounts, connections, models, and agent role assignments.",
      toolbar: [{id:"refresh",label:"Refresh all",icon:"refresh"}]
    }, catalog + rows + roles + M.installations());
  };

  /* ---------- MEMORY (deep-dive 01) ---------- */
  M.memory = function () {
    var rows = PM_DEMO.memory.map(function (g) {
      var st = g.verified ? "ok" : "warn";
      var stLabel = g.verified ? "Verified" : "Awaiting review";
      var strengthPct = Math.round(g.strength * 100);
      return [
        '<div class="gist-row" data-gist="' + g.id + '">',
          '<span class="sdot ' + st + '"></span>',
          '<div class="col grow gap-xs">',
            '<div class="row center gap-sm wrap"><span class="gist-text">' + g.text + '</span></div>',
            '<div class="row center gap-xs wrap muted small">',
              '<span class="chip">' + g.kind + '</span>',
              '<span class="chip ' + st + '">' + stLabel + '</span>',
              '<span class="chip">scope: ' + g.scope + '</span>',
              '<span class="chip">half-life ' + g.half + '</span>',
              g.pinned ? '<span class="chip accent">' + PM.svg("pin",11) + 'Pinned</span>' : '',
              '<span class="chip">v' + g.versions + '</span>',
              '<span class="chip">recall ' + strengthPct + '%</span>',
            '</div>',
            '<span class="muted small">Source: ' + g.source + '</span>',
          '</div>',
          '<div class="row center gap-xs">',
            '<button class="btn sm ghost icon" data-gist-pin aria-label="Pin" aria-pressed="' + (g.pinned?"true":"false") + '">' + PM.svg("pin",13) + '</button>',
            '<button class="btn sm" data-gist-act="verify">Verify</button>',
            '<button class="btn sm ghost" data-gist-act="edit">Edit</button>',
            '<button class="btn sm ghost icon" data-gist-act="more">' + PM.svg("chevron",13) + '</button>',
          '</div>',
        '</div>'
      ].join("");
    }).join("");
    var strengthBar = [
      '<div class="mgr-strength">',
        '<span class="muted small">Active-context strength — half-life fades, never expires</span>',
        '<div class="strength-track">',
          PM_DEMO.memory.map(function(g){ return '<span class="strength-cell" style="height:'+(Math.max(8,Math.round(g.strength*100)))+'%" title="'+g.text.slice(0,40)+'… ('+Math.round(g.strength*100)+'%)"></span>'; }).join(""),
        '</div>',
      '</div>'
    ].join("");
    return M.shell({
      title: "Assistant Memory", icon: "memory",
      addLabel: "Add Gist", health: { text: "5 Gists · 1 awaiting review", kind: "ok" },
      summary: "Evidence-backed Gists with verification, half-life, scope, and version history.",
      toolbar: [{id:"rebuild",label:"Rebuild index",icon:"refresh"}]
    }, strengthBar + '<div class="gist-list">' + rows + '</div>');
  };

  /* ---------- MCP (deep-dive 01) ---------- */
  M.mcp = function () {
    var rows = PM_DEMO.mcp.map(function (s) {
      var st = s.health;
      var stLabel = s.health === "ok" ? "Healthy" : "Reconnect failed";
      var exposed = s.exposed + " of " + s.tools + " tools exposed";
      var note = s.note ? '<span class="mgr-note warn small">' + s.note + '</span>' : '';
      return [
        '<div class="mcp-row" data-mcp="' + s.id + '">',
          '<span class="sdot ' + st + '"></span>',
          '<div class="col grow gap-xs">',
            '<div class="row center gap-sm"><strong>' + s.name + '</strong>',
              '<span class="chip ' + (s.health==="ok"?"ok":"warn") + '">' + stLabel + '</span>',
              '<span class="chip mono">' + s.transport + '</span>',
              '<span class="chip">' + s.scope + '</span>',
            '</div>',
            '<span class="muted small">' + exposed + ' · approval ' + s.approval + ' · last ' + s.last + '</span>',
            note,
          '</div>',
          '<div class="row center gap-xs">',
            s.health !== "ok" ? '<button class="btn sm primary" data-mcp-act="reconnect">Reconnect</button>' : '',
            '<button class="btn sm ghost" data-mcp-act="tools">Tools</button>',
            '<button class="btn sm ghost" data-mcp-act="logs">Logs</button>',
          '</div>',
        '</div>'
      ].join("");
    }).join("");
    return M.shell({
      title: "MCP Servers", icon: "mcp",
      addLabel: "Connect server", health: { text: "1 server unhealthy", kind: "warn" },
      summary: "Server identity, transport, discovered tools, approval policy, and diagnostics.",
      toolbar: [{id:"rescan",label:"Rescan",icon:"refresh"}]
    }, '<div class="mcp-list">' + rows + '</div>');
  };

  /* ---------- CREW (deep-dive 02) — Orchestrator-owned, requested vs effective ---------- */
  M.crew = function () {
    var rows = PM_DEMO.crews.map(function (c) {
      var members = c.composition.map(function (m) {
        var st = m.state === "admitted" ? "ok" : "warn";
        var stLabel = m.state === "admitted" ? "Admitted" : "Queued";
        return '<div class="crew-member"><span class="sdot ' + st + '"></span>' +
          '<div class="col grow gap-xs"><div class="row center gap-xs"><strong>' + m.role + '</strong><span class="chip ' + st + '">' + stLabel + '</span></div>' +
          '<span class="muted small">' + m.persona + ' · ' + m.model + '</span></div></div>';
      }).join("");
      return [
        '<section class="crew-card" data-crew="' + c.id + '">',
          '<div class="crew-head">',
            '<div class="col grow gap-xs"><div class="row center gap-sm"><h3>' + c.name + '</h3>',
              '<span class="chip">' + c.routePolicy + ' route</span>',
              '<span class="chip">' + c.policy + '</span></div>',
              '<span class="muted small">' + c.purpose + '</span></div>',
            '<div class="row center gap-xs"><button class="btn sm">Edit</button><button class="btn sm ghost">Duplicate</button></div>',
          '</div>',
          '<div class="crew-stats">',
            '<div class="crew-stat"><span class="muted small">Requested members</span><strong>' + c.membersReq + '</strong></div>',
            '<div class="crew-stat"><span class="muted small">Effective members</span><strong>' + c.membersEff + '</strong></div>',
            '<div class="crew-stat"><span class="muted small">Queued</span><strong>' + c.queued + '</strong></div>',
            '<div class="crew-stat"><span class="muted small">Concurrency req → eff</span><strong>' + c.concurrencyReq + ' → ' + c.concurrencyEff + '</strong></div>',
          '</div>',
          '<div class="crew-reqeff mgr-note info small">Requested ' + c.membersReq + '; effective ' + c.membersEff + ' now. ' + c.queued + ' queued across waves. ' + c.guard + '</div>',
          '<div class="crew-members">' + members + '</div>',
        '</section>'
      ].join("");
    }).join("");
    return M.shell({
      title: "Crew Templates", icon: "crew",
      addLabel: "New Crew", health: { text: "2 templates · 1 over capacity", kind: "warn" },
      summary: "Reusable multi-agent compositions owned by Orchestrator. Requested vs effective preserved.",
      toolbar: [{id:"board",label:"Crew board"}]
    }, rows);
  };

  /* ---------- SKILLS / PLUGINS / TOOLS / COMMANDS (deep-dive 02) — four distinct kinds ---------- */
  M.skills = function () {
    var kindLabel = { skill:"Skill", plugin:"Plugin", tool:"Tool", command:"Command" };
    var kinds = ["all","skill","plugin","tool","command"];
    var tabs = kinds.map(function (k) {
      var count = k === "all" ? PM_DEMO.skills.length : PM_DEMO.skills.filter(function(s){return s.kind===k;}).length;
      return '<button class="kind-tab' + (k==="all"?" active":"") + '" data-kind-tab="' + k + '">' + (k==="all"?"All":kindLabel[k]) + ' <span class="faint">(' + count + ')</span></button>';
    }).join("");

    var rows = PM_DEMO.skills.map(function (s) {
      var stDot, stLabel, detail;
      if (s.kind === "skill") {
        stDot = s.enabled ? "ok" : "neutral";
        stLabel = s.enabled ? "Enabled" : "Disabled";
        var upd = s.update === "available" ? '<span class="chip info">Update available</span>' : "";
        detail = '<span class="muted small">Source: ' + s.source + ' · perms: ' + (s.perms||[]).join(", ") + '</span>' + upd;
      } else if (s.kind === "plugin") {
        stDot = s.failure && s.failure !== "none" ? "bad" : (s.enabled ? "ok" : "neutral");
        stLabel = s.failure && s.failure !== "none" ? "Failed" : (s.enabled ? "Enabled" : "Disabled");
        var fail = s.failure && s.failure !== "none" ? '<span class="mgr-note bad small">' + s.failure + '</span>' : "";
        var updP = s.update === "available" ? '<span class="chip info">Update available</span>' : "";
        detail = '<span class="muted small">compat: ' + s.compat + ' · channel: ' + s.channel + ' · perms: ' + (s.perms||[]).join(", ") + '</span>' + fail + updP;
      } else if (s.kind === "tool") {
        // five distinct states: installed / project-enabled / currently-available / selected-for-turn / actually-invoked
        stDot = s.available ? "ok" : "neutral";
        var states = [];
        states.push(s.installed ? "installed" : "not installed");
        states.push(s.projectEnabled ? "project-enabled" : "project-off");
        states.push(s.available ? "available" : "unavailable");
        states.push(s.selected ? "selected" : "not selected");
        states.push(s.invoked !== "never" ? "invoked " + s.invoked : "never invoked");
        stLabel = states.slice(0,3).join(" · ");
        detail = '<span class="muted small">risk: ' + (s.risk||"—") + ' · ' + states.slice(3).join(" · ") + '</span>' +
                 (s.policy ? '<span class="mgr-note info small">' + s.policy + '</span>' : "");
      } else { // command
        stDot = s.enabled ? "ok" : "neutral";
        stLabel = s.enabled ? "Enabled" : "Disabled";
        var conflicts = s.conflicts && s.conflicts.length ? '<span class="mgr-note warn small">Shortcut conflict: ' + s.conflicts.join("; ") + '</span>' : "";
        detail = '<span class="muted small">source: ' + s.source + (s.shortcut?' · ' + s.shortcut:' · no shortcut') + '</span>' + conflicts;
      }
      var actions;
      if (s.kind === "command") {
        actions = '<button class="btn sm ghost" data-cmd-act="remap">Remap</button><button class="btn sm ghost" data-cmd-act="reset">Reset</button>';
      } else if (s.kind === "tool") {
        actions = '<button class="btn sm ghost" data-tool-act="select">' + (s.selected?"Deselect":"Select for turn") + '</button>';
      } else {
        actions = '<button class="btn sm ghost" data-skill-toggle>' + (s.enabled ? "Disable" : "Enable") + '</button><button class="btn sm ghost icon" data-skill-act="details">' + PM.svg("external",13) + '</button>';
      }
      return [
        '<div class="skill-row" data-skill="' + s.id + '" data-kind="' + s.kind + '">',
          '<span class="sdot ' + stDot + '"></span>',
          '<div class="col grow gap-xs">',
            '<div class="row center gap-sm wrap"><strong>' + s.name + '</strong>',
              '<span class="chip">' + kindLabel[s.kind] + '</span>',
              '<span class="chip ' + (stDot==="ok"?"ok":stDot==="bad"?"bad":"") + '">' + stLabel + '</span>',
              '<span class="chip">' + s.scope + '</span>',
              '<span class="chip">trust: ' + s.trust + '</span>',
            '</div>',
            detail,
          '</div>',
          '<div class="row center gap-xs">' + actions + '</div>',
        '</div>'
      ].join("");
    }).join("");

    return M.shell({
      title: "Skills, Plugins & Tools", icon: "skills",
      addLabel: "Install", health: { text: PM_DEMO.skills.length + " resources · 1 update · 1 conflict · 1 failed", kind: "warn" },
      summary: "Skills, plugins, tools, and commands — four distinct kinds. Tools carry 5 lifecycle states.",
      toolbar: [{id:"marketplace",label:"Marketplace",icon:"globe"}]
    }, '<div class="kind-tabs" data-kind-tabs>' + tabs + '</div><div class="skill-list">' + rows + '</div>');
  };

  /* ---------- PERSONAS (deep-dive 03) ---------- */
  M.personas = function () {
    var rows = PM_DEMO.personas.map(function (p) {
      var childOnly = p.childOnly ? '<span class="chip warn">Child only · not a chat default</span>' : "";
      var eligible = p.eligible ? '<span class="chip ok">Eligible</span>' : '<span class="chip neutral">Inactive</span>';
      return [
        '<div class="persona-row" data-persona="' + p.id + '">',
          '<span class="sdot ' + (p.eligible?"ok":"neutral") + '"></span>',
          '<div class="col grow gap-xs">',
            '<div class="row center gap-sm wrap"><strong>' + p.name + '</strong>',
              '<span class="chip">' + p.role + '</span>',
              '<span class="chip accent">' + p.scope + '</span>',
              eligible, childOnly,
            '</div>',
            '<span class="muted small">' + p.desc + '</span>',
            '<span class="persona-capsule">' + p.capsule + '</span>',
          '</div>',
          '<div class="row center gap-xs">',
            '<button class="btn sm">Apply…</button>',
            '<button class="btn sm ghost icon">' + PM.svg("external",13) + '</button>',
          '</div>',
        '</div>'
      ].join("");
    }).join("");
    return M.shell({
      title: "Personas", icon: "users",
      addLabel: "New Persona", health: { text: "6 Personas · 1 child-only", kind: "ok" },
      summary: "A Persona is behavior, not an account, model, or permission. Scope is explicit.",
      toolbar: [{id:"scopes",label:"Scope matrix"}]
    }, '<div class="persona-list">' + rows + '</div>');
  };

  /* ---------- CONTEXT & INSTRUCTIONS (deep-dive 03) ---------- */
  M.context = function () {
    var admitted = PM_DEMO.contextSources.admitted.map(function (s) {
      return '<div class="ctx-row"><span class="switch" role="switch" aria-checked="' + s.on + '"></span>' +
        '<div class="col grow gap-xs"><strong>' + s.label + '</strong><span class="muted small">' + s.note + '</span></div></div>';
    }).join("");
    var omitted = PM_DEMO.contextSources.omitted.map(function (s) {
      return '<div class="ctx-row"><span class="switch" role="switch" aria-checked="' + s.on + '"></span>' +
        '<div class="col grow gap-xs"><strong class="muted">' + s.label + '</strong><span class="muted small">' + s.note + '</span></div></div>';
    }).join("");
    return M.shell({
      title: "Context & Instructions", icon: "brain",
      addLabel: "Add source", health: { text: "4 sources admitted last turn", kind: "ok" },
      summary: "Durable breadth, narrow turn context. FileSafe and policy enforced outside the model.",
      toolbar: [{id:"preview",label:"Capsule preview",icon:"doc"}]
    }, [
      '<div class="ctx-cols">',
        '<div class="col gap"><div class="provider-col-label">Admitted last turn</div>' + admitted + '</div>',
        '<div class="col gap"><div class="provider-col-label">Omitted</div>' + omitted + '</div>',
      '</div>',
      '<div class="mgr-note info small">Scoped AGENTS.md chain resolved. Persona footprint and selected tools admitted; installed schemas are not auto-injected.</div>'
    ].join(""));
  };

  /* ---------- LSP (deep-dive 04) ---------- */
  M.lsp = function () {
    var rows = PM_DEMO.lsp.map(function (l) {
      var st = l.health;
      var note = l.note ? '<span class="mgr-note warn small">' + l.note + '</span>' : "";
      return [
        '<div class="lsp-row" data-lsp="' + l.id + '">',
          '<span class="sdot ' + st + '"></span>',
          '<div class="col grow gap-xs">',
            '<div class="row center gap-sm wrap"><strong>' + l.name + '</strong>',
              '<span class="chip">' + l.lang + '</span>',
              '<span class="chip mono">v' + l.ver + '</span>',
              '<span class="chip">' + l.scope + '</span>',
              '<span class="chip ' + (l.conflicts?"warn":"ok") + '">' + l.conflicts + ' conflict' + (l.conflicts===1?"":"s") + '</span>',
            '</div>',
            '<span class="muted small">Startup: ' + l.mode + '</span>',
            note,
          '</div>',
          '<div class="row center gap-xs">',
            '<button class="btn sm ghost" data-lsp-act="restart">Restart</button>',
            '<button class="btn sm ghost" data-lsp-act="logs">Logs</button>',
          '</div>',
        '</div>'
      ].join("");
    }).join("");
    return M.shell({
      title: "Language Servers", icon: "lsp",
      addLabel: "Add server", health: { text: "1 formatting conflict", kind: "warn" },
      summary: "Language coverage, startup mode, capabilities, and formatting ownership.",
      toolbar: [{id:"rescan",label:"Detect",icon:"refresh"}]
    }, '<div class="lsp-list">' + rows + '</div>');
  };

  /* ---------- TERMINAL (deep-dive 04) — full profile depth (A11) ---------- */
  M.terminal = function () {
    var rows = PM_DEMO.terminals.map(function (t) {
      var ansi = (t.ansi||[]).map(function (c) { return '<span class="ansi-sw" style="background:' + c + '"></span>'; }).join("");
      return [
        '<div class="term-row" data-term="' + t.id + '">',
          '<div class="term-swatch" style="background:' + t.bg + ';color:' + t.fg + '">' + PM.svg("terminal",16) + '</div>',
          '<div class="col grow gap-xs">',
            '<div class="row center gap-sm wrap"><strong>' + t.name + '</strong>',
              t.default ? '<span class="chip accent">Default</span>' : "",
              '<span class="chip">' + t.shell + '</span>',
              '<span class="chip mono">' + t.font + ' ' + t.size + 'px / lh ' + t.lineheight + '</span>',
              '<span class="chip">fallback ' + (t.fontFallback||"inherit") + '</span>',
              '<span class="chip">opacity ' + Math.round(t.opacity*100) + '%</span>',
              '<span class="chip">cursor ' + t.cursor + (t.blink?" (blink)":"") + '</span>',
            '</div>',
            '<div class="row center gap-xs wrap muted small">',
              '<span class="chip">copy links: ' + (t.copyLinks?"on":"off") + '</span>',
              '<span class="chip">CWD: ' + t.cwd + '</span>',
              '<span class="chip">env: ' + t.env + '</span>',
              '<span class="chip">retention: ' + t.retention + '</span>',
            '</div>',
            '<span class="muted small">ANSI palette · sample</span>',
            '<div class="ansi-palette">' + ansi + '</div>',
            '<div class="term-preview" style="background:' + t.bg + ';color:' + t.fg + ';opacity:' + t.opacity + '"><span class="mono">$ git status<span style="color:' + (t.ansi&&t.ansi[2]||'#0a0')+ '"> — clean</span> <span style="color:' + (t.ansi&&t.ansi[4]||'#05f')+'">main</span></span></div>',
          '</div>',
          '<div class="row center gap-xs">',
            '<button class="btn sm">Edit</button>',
            '<button class="btn sm ghost">Duplicate</button>',
          '</div>',
        '</div>'
      ].join("");
    }).join("");
    return M.shell({
      title: "Terminal", icon: "terminal",
      addLabel: "New profile", health: { text: "2 profiles", kind: "ok" },
      summary: "Profiles, shell, font + fallback, ANSI palette, opacity, cursor, copy-paste, CWD/env, retention.",
      toolbar: [{id:"diagnostics",label:"Diagnostics"}]
    }, '<div class="term-list">' + rows + '</div>');
  };

  /* ---------- MEDIA (deep-dive 04) ---------- */
  M.media = function () {
    var rows = PM_DEMO.media.map(function (m) {
      var policyChip = m.policy === "review" ? '<span class="chip warn">Policy: review</span>' : '<span class="chip ok">Policy: ' + m.policy + '</span>';
      var caps = m.caps.map(function(c){ return '<span class="chip">' + c + '</span>'; }).join("");
      return [
        '<div class="media-row" data-media="' + m.id + '">',
          '<span class="sdot ok"></span>',
          '<div class="col grow gap-xs">',
            '<div class="row center gap-sm wrap"><strong>' + m.name + '</strong>',
              '<span class="chip">' + m.route + '</span>',
              caps,
              '<span class="chip">' + (m.native?"Native":"PM-transformed") + '</span>',
              '<span class="chip">cost: ' + m.cost + '</span>',
              policyChip,
            '</div>',
            '<span class="muted small">Fallback: ' + m.fallback + '</span>',
          '</div>',
          '<div class="row center gap-xs">',
            '<button class="btn sm">Routes</button>',
            '<button class="btn sm ghost" data-media-act="history">History</button>',
          '</div>',
        '</div>'
      ].join("");
    }).join("");
    return M.shell({
      title: "Media Providers", icon: "media",
      addLabel: "Connect provider", health: { text: "3 routes", kind: "ok" },
      summary: "Image, audio, and video routes with the same rigor as coding providers.",
      toolbar: [{id:"diagnostics",label:"Diagnostics"}]
    }, '<div class="media-list">' + rows + '</div>');
  };

  /* ---------- GENERIC RESOURCE ROW + FAMILY HELPER (final-cumulative families) ---------- */
  /* item: { title, dot, chips:[{label,kind}], detail, note:{text,kind}, actions:[{label,act,kind,icon}] } */
  M.resRow = function (it) {
    var chips = (it.chips || []).map(function (c) {
      return '<span class="chip ' + (c.kind || "") + '">' + c.label + '</span>';
    }).join("");
    var note = it.note ? '<span class="mgr-note ' + it.note.kind + ' small">' + it.note.text + '</span>' : "";
    var detail = it.detail ? '<span class="muted small">' + it.detail + '</span>' : "";
    var actions = (it.actions || []).map(function (a) {
      return '<button class="btn sm ' + (a.kind || "ghost") + '" data-mgr-act="' + a.act + '">' + (a.icon ? PM.svg(a.icon, 13) : "") + a.label + '</button>';
    }).join("");
    return [
      '<div class="res-row" data-res>',
        '<span class="sdot ' + (it.dot || "ok") + '"></span>',
        '<div class="col grow gap-xs">',
          '<div class="row center gap-sm wrap"><strong>' + it.title + '</strong>' + chips + '</div>',
          detail, note,
        '</div>',
        '<div class="row center gap-xs">' + actions + '</div>',
      '</div>'
    ].join("");
  };
  M.family = function (opts, rows, extra) {
    return M.shell(opts, (extra || "") + '<div class="res-list">' + (rows || []).map(M.resRow).join("") + '</div>');
  };

  /* ---------- C1: Context / Memory / Personas / Goal / Crew / Permissions / BSD ---------- */
  M.goal = function () {
    return M.family({ title:"Goals & Automation", icon:"target", addLabel:"New default",
      health:{text:"Defaults + ceilings only — runtime admits actual work",kind:"ok"},
      summary:"Settings owns defaults and ceilings. Usage reports capacity; orchestrator admits work.",
      toolbar:[{id:"routes",label:"Worker / reviewer routes"}] }, PM_DEMO.goalRows,
      '<div class="mgr-note info small">Requested vs effective preserved. High-quality planning route required by default.</div>');
  };
  M.permissions = function () {
    return M.family({ title:"Permissions & FileSafe", icon:"shield", addLabel:"Add rule",
      health:{text:"FileSafe enforced · non-bypassable",kind:"ok"},
      summary:"Ordered rules (last-match-wins), per-tool overrides, per-Persona profiles. FileSafe is the floor.",
      toolbar:[{id:"matrix",label:"Read-only / full matrix"}] }, PM_DEMO.permissionRows,
      '<div class="mgr-note warn small">FileSafe is the non-bypassable floor. Requested/effective/origin shown where policy differs.</div>');
  };
  M.bsd = function () {
    return M.family({ title:"Back Seat Driver", icon:"bsd", addLabel:"Configure trigger",
      health:{text:"Auto (default) · 1 review pending",kind:"warn"},
      summary:"Read-only observation. Auto engages only on risk/phase triggers. Cannot widen authority.",
      toolbar:[{id:"health",label:"BSD health"}] }, PM_DEMO.bsdRows,
      '<div class="mgr-note info small">BSD receives bounded deltas and cannot block primary work merely because it failed. Chat may override for one turn or thread.</div>');
  };

  /* ---------- C2: Notifications / Sounds / Appearance / Spellcheck / Desktop / Teacher ---------- */
  M.notifications = function () {
    return M.family({ title:"Notifications & Sounds", icon:"bell", addLabel:"Add destination",
      health:{text:"8 destinations · 1 failing",kind:"warn"},
      summary:"Delivery, event routing, sounds. The title-bar stack is the sole in-app surface.",
      toolbar:[{id:"test",label:"Test send",icon:"bell"}] }, PM_DEMO.notificationRows,
      '<div class="mgr-note info small">' + PM_DEMO.notificationMeta.routing + '. ' + PM_DEMO.notificationMeta.quiet + '. No bottom-right stack, bell, or dedicated panel.</div>');
  };
  M.sounds = function () {
    return M.family({ title:"Sound Library", icon:"sound", addLabel:"Upload sound",
      health:{text:PM_DEMO.soundMeta.mappings,kind:"ok"},
      summary:"Built-in + uploaded sounds and imported packs. PeonPing/OpenPeon-compatible.",
      toolbar:[{id:"export",label:"Export",icon:"external"}] }, PM_DEMO.soundRows,
      '<div class="mgr-note info small">' + PM_DEMO.soundMeta.master + '. Packs require format + license checks; unverified packs are never bundled. Preview is local-only.</div>');
  };
  M.appearance = function () {
    return M.family({ title:"Appearance", icon:"palette", addLabel:"Create theme",
      health:{text:"Beyond eight themes · live reload on",kind:"ok"},
      summary:"Families × light/dark/auto, custom TOML, fonts, UI scale, restart markers.",
      toolbar:[{id:"folder",label:"Open theme folder",icon:"external"}] }, PM_DEMO.appearanceRows,
      '<div class="mgr-note info small">Schema validation + base-theme inheritance + invalid-theme fallback. Live hover preview.</div>');
  };
  M.spellcheck = function () {
    return M.family({ title:"Spellcheck & Dictionaries", icon:"spellcheck", addLabel:"Add pack",
      health:{text:"Quiet underline · no autocorrect",kind:"ok"},
      summary:"Automatic / system / PM-local dictionary sources; personal + project dictionaries.",
      toolbar:[{id:"dict",label:"Manage dictionaries"}] }, PM_DEMO.spellcheckRows,
      '<div class="mgr-note warn small">No autocorrect. Grammar/style is a separate opt-in provider-backed feature (privacy, route, cost disclosed).</div>');
  };
  M.desktop = function () {
    return M.family({ title:"Desktop, Tray & Window", icon:"desktop", addLabel:"Profile",
      health:{text:"Tray on · 1 buffer unrecovered",kind:"warn"},
      summary:"Minimize-to-tray, automation badge, launch destination, restore, crash recovery, limits.",
      toolbar:[{id:"test",label:"Test crash recovery"}] }, PM_DEMO.desktopRows);
  };
  M.teacher = function () {
    return M.family({ title:"Teacher & Help", icon:"teacher", addLabel:"Tour",
      health:{text:"Guided transitions on",kind:"ok"},
      summary:"Explicit Teacher assistance and guided explanation — not only tooltips.",
      toolbar:[{id:"explain",label:"Explain this screen",icon:"spark"}] }, PM_DEMO.teacherRows,
      '<div class="mgr-note info small">Teacher explains the active surface and transitions safely into real actions.</div>');
  };

  /* ---------- C3: File Manager / Terminal / LSP / Formatters / Commands / MCP / Skills / Testing ---------- */
  M.filemanager = function () {
    return M.family({ title:"File Manager & Editor", icon:"folder", addLabel:"Add root",
      health:{text:"2 changed on disk · 1 transient",kind:"warn"},
      summary:"Tree, drag/drop, hidden/ignored, large-file thresholds, tabs, recovery.",
      toolbar:[{id:"ignore",label:"Edit ignored"}] }, PM_DEMO.filemanagerRows);
  };
  M.formatters = function () {
    return M.family({ title:"Formatters", icon:"format", addLabel:"Add formatter",
      health:{text:"1 ownership conflict",kind:"warn"},
      summary:"Global enable, built-in/custom table, detected/not-found, scope, health + test.",
      toolbar:[{id:"test",label:"Test all",icon:"bolt"}] }, PM_DEMO.formatterRows,
      '<div class="mgr-note info small">Single formatting ownership per language; resolves LSP vs formatter conflicts.</div>');
  };
  M.commands = function () {
    return M.family({ title:"Commands & Shortcuts", icon:"command", addLabel:"New command",
      health:{text:"1 shortcut conflict",kind:"warn"},
      summary:"Custom command lifecycle, parameters, shell-safety, shortcuts, conflicts, cheat sheet.",
      toolbar:[{id:"cheat",label:"Cheat sheet"},{id:"import",label:"Import"}] }, PM_DEMO.commandRows,
      '<div class="mgr-note warn small">Dry-run preview never sends work to an agent.</div>');
  };
  M.testing = function () {
    return M.family({ title:"Testing & Debug", icon:"beaker", addLabel:"Capability",
      health:{text:"Auto/On/Off per capability · 1 unavailable",kind:"warn"},
      summary:"Global/Project per-capability testing and debug toggles. DAP, capture, artifacts.",
      toolbar:[{id:"profiles",label:"Run profiles"}] }, PM_DEMO.testingRows,
      '<div class="mgr-note info small">PM-native Browser Program for built-in browser testing — no Playwright dependency.</div>');
  };

  /* ---------- C4: Storage / Backup / Lifecycle / History / Artifacts / Git / GitHub / Containers / Web / Index / Cleanup / Server ---------- */
  M.storage = function () {
    return M.family({ title:"Storage & Retention", icon:"database", addLabel:"Policy",
      health:{text:"78% used · 1 legal hold",kind:"warn"},
      summary:"Mode, retention, holds, pressure, compaction, quarantine, deletion, encryption, test restore.",
      toolbar:[{id:"test",label:"Test restore"}] }, PM_DEMO.storageRows,
      '<div class="mgr-note info small">Distinguishes internal snapshots, settings backup, project backup, full server backup, and workspace cleanup.</div>');
  };
  M.backup = function () {
    return M.family({ title:"Backup & Restore", icon:"archive", addLabel:"Restore point",
      health:{text:"Last backup today 02:00",kind:"ok"},
      summary:"Back-up-now (action) vs schedule (setting) vs last backup (status) vs manager vs log.",
      toolbar:[{id:"log",label:"Open log"}] }, PM_DEMO.backupRows,
      '<div class="mgr-note info small">Actions and values stay distinct. Restore points are receipted.</div>');
  };
  M.settingsLifecycle = function () {
    return M.family({ title:"Settings Lifecycle", icon:"lifecycle", addLabel:"Export",
      health:{text:"3 import conflicts previewed",kind:"warn"},
      summary:"Export/import/merge/conflict/validation/migration/rollback/receipt/reset.",
      toolbar:[{id:"receipt",label:"Receipts"}] }, PM_DEMO.lifecycleRows,
      '<div class="mgr-note warn small">Restore point before apply · atomic apply · rollback to snapshot · receipt + source disclosure. Copy Settings From is a one-time transactional copy — no universal inheritance system.</div>');
  };
  M.history = function () {
    return M.family({ title:"History & Sessions", icon:"history", addLabel:"Archive",
      health:{text:"3 sessions resumable",kind:"ok"},
      summary:"Project/all-project filters, compare/export/rebuild/archive/deletion. PM-owned vs provider-native identity.",
      toolbar:[{id:"rebuild",label:"Rebuild index"}] }, PM_DEMO.historyRows);
  };
  M.artifacts = function () {
    return M.family({ title:"Runtime Artifacts", icon:"package", addLabel:"Reveal",
      health:{text:"5 categories · 2.1 GB screenshots",kind:"warn"},
      summary:"Type, location, version, retention, receipts, redaction, open/reveal/export/cleanup.",
      toolbar:[{id:"cleanup",label:"Cleanup dry-run"}] }, PM_DEMO.artifactRows);
  };
  M.sourcecontrol = function () {
    return M.family({ title:"Source Control & Worktrees", icon:"branch", addLabel:"Worktree",
      health:{text:"Git healthy · force-push denied on main",kind:"ok"},
      summary:"Changes/history/graph/worktrees, Git/Jujutsu/LFS, forge, SSH, test-before-merge, leases.",
      toolbar:[{id:"graph",label:"Graph"}] }, PM_DEMO.sourcecontrolRows);
  };
  M.github = function () {
    return M.family({ title:"GitHub Actions", icon:"github", addLabel:"Pin workflow",
      health:{text:"Branch green · 1 approval pending",kind:"warn"},
      summary:"Pinned workflows, branch readiness, run/job/log, starter workflow, account health.",
      toolbar:[{id:"refresh",label:"Refresh",icon:"refresh"}] }, PM_DEMO.githubRows);
  };
  M.containers = function () {
    return M.family({ title:"Containers & Registries", icon:"container", addLabel:"Connect",
      health:{text:"Docker up · Podman stopped",kind:"warn"},
      summary:"Docker / Podman / Kubernetes tools top-level; detail: Engine/CLI/Compose/kubectl/Helm/registries.",
      toolbar:[{id:"health",label:"Health"}] }, PM_DEMO.containerRows,
      '<div class="mgr-note info small">Domain-specific capability probes reuse the shared tool lifecycle.</div>');
  };
  M.webfetch = function () {
    return M.family({ title:"Web, Search & Fetch", icon:"globe", addLabel:"Provider",
      health:{text:"Ready · API near quota",kind:"warn"},
      summary:"Provider priority, limits, credit guards, caches, sessions, proxies, air-gap, privacy.",
      toolbar:[{id:"clear",label:"Clear cache"}] }, PM_DEMO.webfetchRows,
      '<div class="mgr-note info small">PM-native Browser Program only. No Playwright runtime/facade/compatibility dependency.</div>');
  };
  M.searchindex = function () {
    return M.family({ title:"Project Search Index", icon:"searchindex", addLabel:"Rebuild",
      health:{text:"42k docs · 640 MB · 3 failures",kind:"warn"},
      summary:"Enable, rebuild, exclusions, file-size/symlink, disk, remote cache, failures.",
      toolbar:[{id:"rebuild",label:"Rebuild",icon:"refresh"}] }, PM_DEMO.searchindexRows);
  };
  M.cleanup = function () {
    return M.family({ title:"Workspace Cleanup", icon:"broom", addLabel:"Dry-run",
      health:{text:"2.7 GB reclaimable",kind:"warn"},
      summary:"Dry-run first, worktree safety, evidence retention, receipts.",
      toolbar:[{id:"dryrun",label:"Dry-run all"}] }, PM_DEMO.cleanupRows,
      '<div class="mgr-note warn small">Never deletes without a preview + receipt. Worktree safety enforced.</div>');
  };
  M.server = function () {
    return M.family({ title:"Server & Execution Hosts", icon:"server", addLabel:"Reserved",
      health:{text:"Deferred owners — insertion shell only",kind:"neutral"},
      summary:"Reserved manager grammar + semantic destinations for future owner modules.",
      toolbar:[] }, PM_DEMO.serverRows,
      '<div class="mgr-note info small">' + PM_DEMO.serverNote + '</div>');
  };

  /* ---------- PAM INSTALLATION LIFECYCLE (fixtures 3-8, 12, 14) ---------- */
  M.installations = function () {
    var updMap = {
      ready:["ok","Ready"], "Update available":["warn","Update available — Ask first"],
      "Waiting for work to finish":["info","Scheduled when idle"],
      "Rolled back":["bad","Verification failed · rolled back"],
      "Could not identify installation method":["bad","Could not identify method"],
      selected:["accent","Selected (primary)"], "managed externally":["neutral","Managed externally"],
      "Explicit install":["info","Explicit install — official source"]
    };
    var confMap = {
      Proven:["ok","Proven"], "Strongly identified":["ok","Strongly identified"],
      Probable:["info","Probable"], Ambiguous:["warn","Ambiguous"], Unknown:["bad","Unknown"],
      "Not installed":["neutral","Not installed"]
    };
    var rows = PM_DEMO.installations.map(function (i) {
      var conf = confMap[i.confidence] || ["neutral", i.confidence];
      var upd = updMap[i.update] || ["neutral", i.update];
      var note = i.note ? '<span class="mgr-note ' + (i.health === "bad" ? "bad" : i.health === "warn" ? "warn" : "info") + ' small">' + i.note + '</span>' : "";
      var actions = [
        '<button class="btn sm ghost" data-mgr-act="details">Details</button>',
        '<button class="btn sm ghost" data-mgr-act="logs">Logs</button>'
      ];
      if (i.update === "Update available") actions.unshift('<button class="btn sm primary" data-mgr-act="apply">Update (ask)</button>');
      if (i.update === "Explicit install") actions.unshift('<button class="btn sm primary" data-mgr-act="apply">Install (official)</button>');
      if (i.update === "Rolled back") actions.unshift('<button class="btn sm primary" data-mgr-act="reconnect">Repair</button>');
      if (i.update === "Could not identify installation method") actions.unshift('<button class="btn sm primary" data-mgr-act="open">Manual install</button>');
      if (i.confidence === "Ambiguous") actions.unshift('<button class="btn sm primary" data-mgr-act="details">Identify</button>');
      return [
        '<div class="res-row" data-res>',
          '<span class="sdot ' + i.health + '"></span>',
          '<div class="col grow gap-xs">',
            '<div class="row center gap-sm wrap"><strong>' + i.provider + '</strong>',
              '<span class="chip ' + conf[0] + '">' + conf[1] + '</span>',
              '<span class="chip ' + upd[0] + '">' + upd[1] + '</span>',
              '<span class="chip">owner: ' + i.owner + '</span>',
              '<span class="chip">auth: ' + i.auth + '</span>',
              '<span class="chip">' + i.multi + '</span>',
            '</div>',
            '<div class="row center gap-xs wrap muted small">',
              '<span class="chip mono">' + i.cmd + ' → ' + i.resolved + '</span>',
              '<span class="chip">' + i.method + '</span>',
              '<span class="chip">' + i.host + '</span>',
            '</div>',
            '<span class="muted small">evidence: ' + i.evidence + '</span>',
            note,
          '</div>',
          '<div class="row center gap-xs">' + actions.join("") + '</div>',
        '</div>'
      ].join("");
    }).join("");
    var usage = '<div class="mgr-note warn small">' + PM_DEMO.usageUnavailable.provider + ': ' + PM_DEMO.usageUnavailable.note + '</div>';
    return [
      '<section class="provider" style="margin-top:var(--gap)">',
        '<div class="provider-head"><div class="col gap-xs">',
          '<div class="row center gap-sm"><h3>Provider CLI installations</h3>',
          '<span class="chip info">5 confidence · 7 update states</span></div>',
          '<span class="muted small">Acquisition is explicit, official-source, Host/Environment-specific — never bundled or pre-seeded.</span>',
        '</div></div>',
        '<div class="res-list">' + rows + '</div>',
        '<div class="mgr-note info small">Auth boundary — CLI-owned OAuth: Claude CLI, Antigravity CLI. PM-direct OAuth: OpenAI/Codex, GitHub, Copilot. Success needs path + launch + auth/profile + catalog + adapter handshake + capabilities + dependent-route refresh — not installer exit code alone.</div>',
        usage,
      '</section>'
    ].join("");
  };

  /* ---------- ROUTER ---------- */
  M.render = function (managerId) {
    var fn = M[managerId];
    if (!fn) return '<div class="empty muted">Unknown manager.</div>';
    return fn();
  };

  /* ---------- MANAGER INTERACTIONS (functional, simulated) ---------- */
  M.wire = function (root) {
    if (!root) return;
    // search filter
    root.querySelectorAll('[data-manager-search]').forEach(function (inp) {
      inp.addEventListener("input", function () {
        var q = this.value.toLowerCase();
        root.querySelectorAll("[data-conn],[data-model],[data-gist],[data-mcp],[data-skill],[data-persona],[data-lsp],[data-term],[data-media],[data-crew],[data-res]").forEach(function (row) {
          var txt = row.textContent.toLowerCase();
          row.style.display = (!q || txt.indexOf(q) > -1) ? "" : "none";
        });
      });
    });
    // refresh preserves last-known-good rows during loading (packet: smoke #4)
    root.querySelectorAll('[data-manager-toolbar="refresh"], [data-provider-action="refresh"], [data-conn-action="refresh"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = this.closest("[data-provider]") || root;
        var overlay = PM.el("div", "refresh-overlay", {}, PM.svg("refresh",16) + '<span>Refreshing — last-known-good held</span>');
        target.style.position = "relative";
        target.appendChild(overlay);
        setTimeout(function () {
          overlay.remove();
          PM.toast("Catalog refreshed · last-known-good preserved");
        }, 900);
      });
    });
    // reconnect returns a visible simulated result (smoke #8)
    root.querySelectorAll('[data-conn-action="reconnect"], [data-mcp-act="reconnect"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var row = this.closest("[data-conn],[data-mcp]");
        var dot = row && row.querySelector(".sdot");
        btn.disabled = true; btn.textContent = "Reconnecting…";
        setTimeout(function () {
          btn.disabled = false; btn.outerHTML = "";
          if (dot) { dot.classList.remove("warn","bad"); dot.classList.add("ok"); }
          if (row) { row.querySelectorAll(".chip.bad,.chip.warn").forEach(function(c){ c.classList.remove("bad","warn"); c.classList.add("ok"); }); }
          PM.toast("Reconnected · probe ok");
        }, 1100);
      });
    });
    // model favorite toggle
    root.querySelectorAll('[data-model-fav]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var on = this.getAttribute("aria-pressed") === "true";
        this.setAttribute("aria-pressed", String(!on));
        this.style.color = on ? "" : "var(--accent)";
      });
    });
    // model options menu — exposes effort + Normal/Fast only when supported (smoke #6)
    root.querySelectorAll('[data-model-action="menu"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var row = this.closest("[data-model]");
        var mid = row && row.getAttribute("data-model");
        var model = null;
        PM_DEMO.providers.forEach(function(p){ p.models.forEach(function(m){ if (m.id===mid) model = m; }); });
        if (!model) return;
        var items = ['<button class="pm-menu-item" data-mm="favorite">' + (model.fav?"Unfavorite":"Favorite") + '</button>',
                     '<button class="pm-menu-item" data-mm="alias">Set alias…</button>'];
        if (model.effort) items.push('<button class="pm-menu-item" data-mm="effort">Effort…</button>');
        if (model.fast) items.push('<button class="pm-menu-item" data-mm="variant">Normal / Fast</button>');
        items.push('<button class="pm-menu-item" data-mm="hide">Hide</button>');
        PM.menu(btn, items.join(""), function (item) {
          if (item === "variant") PM.toast("Variant: Normal (Fast available)");
          else if (item === "effort") PM.toast("Effort: High");
          else PM.toast("Applied: " + item);
        });
      });
    });
    // gist pin toggle
    root.querySelectorAll('[data-gist-pin]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var on = this.getAttribute("aria-pressed") === "true";
        this.setAttribute("aria-pressed", String(!on));
        this.style.color = on ? "" : "var(--accent)";
      });
    });
    // skill toggle
    root.querySelectorAll('[data-skill-toggle]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        this.textContent = this.textContent.trim() === "Disable" ? "Enable" : "Disable";
        var row = this.closest(".skill-row");
        var dot = row && row.querySelector(".sdot");
        if (dot) { dot.classList.toggle("ok"); dot.classList.toggle("neutral"); }
      });
    });
    // kind-tabs (A12) — filter the skills list by kind
    var tabs = root.querySelector("[data-kind-tabs]");
    if (tabs) {
      tabs.querySelectorAll("[data-kind-tab]").forEach(function (tab) {
        tab.addEventListener("click", function () {
          tabs.querySelectorAll("[data-kind-tab]").forEach(function (t) { t.classList.remove("active"); });
          this.classList.add("active");
          var k = this.getAttribute("data-kind-tab");
          root.querySelectorAll("[data-skill]").forEach(function (row) {
            row.style.display = (k === "all" || row.getAttribute("data-kind") === k) ? "" : "none";
          });
        });
      });
    }
    // command remap/reset
    root.querySelectorAll('[data-cmd-act="remap"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var row = this.closest("[data-skill]");
        PM.toast("Remap shortcut for " + (row && row.querySelector("strong").textContent) + " — simulated");
      });
    });
    root.querySelectorAll('[data-cmd-act="reset"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var row = this.closest("[data-skill]");
        PM.toast("Reset " + (row && row.querySelector("strong").textContent) + " to default binding");
      });
    });
    // tool select-for-turn
    root.querySelectorAll('[data-tool-act="select"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var isSelect = this.textContent.indexOf("Select") > -1;
        this.textContent = isSelect ? "Deselect" : "Select for turn";
        PM.toast(isSelect ? "Tool selected for this turn only" : "Tool deselected");
      });
    });
    // account-overflow menu (A4) — Use first/next, priority, enable, sticky
    root.querySelectorAll('[data-conn-action="overflow"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var row = this.closest("[data-conn]");
        var items = [
          '<button class="pm-menu-item" data-acc="use-first">Use first</button>',
          '<button class="pm-menu-item" data-acc="use-next">Use next</button>',
          '<button class="pm-menu-item" data-acc="priority">Set priority…</button>',
          '<button class="pm-menu-item" data-acc="sticky">Sticky session</button>',
          '<div class="pm-menu-sep"></div>',
          '<button class="pm-menu-item" data-acc="repair">Repair</button>',
          '<button class="pm-menu-item" data-acc="install">Install / Update</button>',
          '<button class="pm-menu-item" data-acc="rescan">Rescan</button>',
          '<button class="pm-menu-item" data-acc="logs">Logs</button>'
        ].join("");
        PM.menu(btn, items, function (item) {
          if (item === "use-first") PM.toast("Use first — affects future requests only; in-flight requests are not migrated");
          else if (item === "use-next") PM.toast("Use next — queued for the next request");
          else if (item === "priority") { if (row) { var pb = row.querySelector("[data-priority]"); if (pb) pb.textContent = "P1"; } PM.toast("Priority set to P1"); }
          else if (item === "sticky") PM.toast("Sticky session enabled for this connection");
          else PM.toast(item + " — simulated receipt");
        });
      });
    });
    // free-model setup stepper (A8)
    root.querySelectorAll('[data-conn-action="setup"]').forEach(function (btn) {
      btn.addEventListener("click", function () { showSetupStepper(btn); });
    });
    // generic add — simulated result or honest unavailable
    root.querySelectorAll('[data-manager-action="add"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var mgr = root.getAttribute("data-manager-id");
        PM.toast("Add " + (mgr || "resource") + " — simulated in concept");
      });
    });
    // generic resource-row actions (final-cumulative families) — every control functional
    root.querySelectorAll('[data-mgr-act]').forEach(function (btn) {
      if (btn.dataset.wired) return; btn.dataset.wired = "1";
      btn.addEventListener("click", function () {
        var act = this.getAttribute("data-mgr-act");
        var row = this.closest("[data-res],[data-conn],[data-mcp]");
        if (act === "reconnect" || act === "retry") {
          var dot = row && row.querySelector(".sdot");
          var self = this, orig = this.textContent;
          self.disabled = true; self.textContent = "Working…";
          setTimeout(function () {
            self.disabled = false; self.textContent = orig;
            if (dot) dot.className = "sdot ok";
            if (row) row.querySelectorAll(".chip.bad,.chip.warn").forEach(function (c) { c.className = "chip ok"; });
            PM.toast("Recovered · probe ok · receipt kept");
          }, 900);
        } else if (act === "enable") {
          var enabling = this.textContent.indexOf("Enable") > -1;
          this.textContent = enabling ? "Enabled" : "Enable";
          PM.toast(enabling ? "Enabled" : "Disabled");
        } else if (act === "preview") { PM.toast("Preview — local only"); }
        else if (act === "test") { PM.toast("Test send — masked, rate-limited, receipted"); }
        else if (act === "run") { PM.toast("Started — ObservableWork phase shown"); }
        else if (act === "apply") { PM.toast("Applied · receipt kept · dependent routes refreshed"); }
        else if (act === "export") { PM.toast("Exported · source disclosed"); }
        else if (act === "delete") { PM.toast("Removed · receipt kept (no destructive call)"); }
        else if (act === "open") { PM.toast("Opened owner surface — simulated"); }
        else if (act === "logs") { PM.toast("Opened receipted log — simulated"); }
        else { PM.toast(act.charAt(0).toUpperCase() + act.slice(1) + " — simulated"); }
      });
    });
  };

  /* ---------- free-model setup stepper (A8) ---------- */
  function showSetupStepper(anchor) {
    var steps = PM_DEMO.freeModelSetup.steps;
    var old = document.querySelector("[data-popover].setup-modal"); if (old) old.remove();
    var stepHTML = steps.map(function (s, i) {
      var kindChip = { external:"info", info:"info", pm:"accent", warn:"warn" }[s.kind] || "neutral";
      return '<div class="setup-step" data-step="' + i + '"><span class="chip ' + kindChip + '">' + (i+1) + '</span>' +
        '<div class="col gap-xs"><strong>' + s.title + '</strong><span class="muted small">' + s.detail + '</span></div></div>';
    }).join("");
    var modal = PM.el("div", "setup-modal", { "data-popover":"", role:"dialog", "aria-label":"Free model setup" },
      '<div class="setup-modal-head"><strong>Set up free model</strong><button class="btn sm ghost icon" data-setup-close>' + PM.svg("close",14) + '</button></div>' +
      '<div class="muted small" style="margin-bottom:10px">PM-owned instructions. Steps open the underlying provider connection.</div>' +
      '<div class="setup-steps">' + stepHTML + '</div>' +
      '<div class="setup-modal-foot"><button class="btn sm ghost" data-setup-close>Cancel</button><button class="btn sm primary" data-setup-done>Mark complete · return to model</button></div>'
    );
    document.body.appendChild(modal);
    modal.querySelector("[data-setup-close]").addEventListener("click", function () { modal.remove(); });
    modal.querySelector("[data-setup-done]").addEventListener("click", function () {
      modal.remove();
      PM.toast("Setup complete · returned to model row");
    });
  }

  /* ---------- TOAST + MENU (shared overlays) ---------- */
  PM.toast = function (msg) {
    var old = document.querySelector(".pm-toast");
    if (old) old.remove();
    var t = PM.el("div", "pm-toast", { role:"status" }, msg);
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("show"); });
    setTimeout(function () { t.classList.remove("show"); setTimeout(function(){ t.remove(); }, 300); }, 2200);
  };
  PM.menu = function (anchor, innerHTML, onPick) {
    var old = document.querySelector("[data-popover]"); if (old) old.remove();
    var pop = PM.el("div", "pm-menu", { "data-popover":"", role:"menu" }, innerHTML);
    document.body.appendChild(pop);
    var r = anchor.getBoundingClientRect();
    pop.style.top = (r.bottom + 6) + "px";
    pop.style.left = Math.min(r.left, window.innerWidth - 220) + "px";
    pop.querySelectorAll(".pm-menu-item").forEach(function (it) {
      it.addEventListener("click", function () { onPick && onPick(it.getAttribute("data-mm")); pop.remove(); });
    });
    setTimeout(function () {
      document.addEventListener("click", function close () { pop.remove(); document.removeEventListener("click", close); }, { once:true });
    }, 0);
  };
})();
