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
          return [
            '<div class="conn-row" data-conn="' + it.id + '">',
              '<span class="sdot ' + st + '"></span>',
              '<div class="col grow gap-xs">',
                '<div class="row center gap-sm"><strong class="conn-name">' + it.name + '</strong>',
                  '<span class="chip ' + (st === "ok" ? "ok" : st === "warn" ? "warn" : "bad") + '">' + stLabel + '</span>',
                  it.credType ? '<span class="chip">' + it.credType + '</span>' : '',
                '</div>',
                '<span class="muted small">' + (it.authOwner ? 'Owner: ' + it.authOwner + ' · ' : '') + (it.profile ? it.profile : '') + (it.endpoint ? ' · ' + it.endpoint : '') + '</span>',
                remaining,
                it.note ? '<span class="mgr-note ' + st + '">' + it.note + '</span>' : '',
              '</div>',
              '<div class="row center gap-xs">',
                st === "warn" || st === "bad" ? '<button class="btn sm primary" data-conn-action="reconnect">' + PM.svg("refresh",13) + 'Reconnect</button>' : '',
                '<button class="btn sm ghost" data-conn-action="refresh">' + PM.svg("refresh",13) + '</button>',
                '<button class="btn sm ghost" data-conn-action="logs">Logs</button>',
                '<button class="btn sm ghost" data-conn-action="details">' + PM.svg("chevron",13) + '</button>',
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
        var roles = mm.role && mm.role !== "—" ? '<span class="chip accent">' + mm.role + '</span>' : "";
        var badges = [];
        if (mm.fav) badges.push('<span class="chip" title="Favorite">' + PM.svg("pin",11) + 'Favorite</span>');
        if (mm.alias) badges.push('<span class="chip">alias: ' + mm.alias + '</span>');
        if (mm.fast) badges.push('<span class="chip">Fast variant</span>');
        if (mm.effort) badges.push('<span class="chip">Effort</span>');
        if (mm.ctx) badges.push('<span class="chip mono">' + mm.ctx + ' ctx</span>');
        if (mm.tools) badges.push('<span class="chip">Tools</span>');
        return [
          '<div class="model-row" data-model="' + mm.id + '">',
            '<div class="row center gap">',
              '<button class="btn sm ghost icon" data-model-fav aria-label="Toggle favorite" aria-pressed="' + (mm.fav ? "true" : "false") + '">' + PM.svg("pin",13) + '</button>',
              '<div class="col grow gap-xs">',
                '<div class="row center gap-sm wrap"><strong>' + mm.name + '</strong>' + stChip + roles + '</div>',
                '<div class="row center gap-xs wrap muted small">',
                  '<span class="chip ' + capChip[0] + '">Capability: ' + capChip[1] + '</span>',
                  '<span class="chip">Evidence: ' + mm.evidence + '</span>',
                  '<span>' + mm.modalities.join(" · ") + '</span>',
                '</div>',
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
        '<span class="muted small">Checked ' + PM_DEMO.catalogMeta.lastChecked + '</span>',
        '<span class="muted small mono">' + PM_DEMO.catalogMeta.sourceVersion + '</span>',
        '<span class="grow"></span>',
        '<span class="muted small">' + PM_DEMO.catalogMeta.note + '</span>',
      '</div>'
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
    }, catalog + rows + roles);
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

  /* ---------- SKILLS / PLUGINS / TOOLS (deep-dive 02) ---------- */
  M.skills = function () {
    var kindLabel = { skill:"Skill", plugin:"Plugin", tool:"Tool", command:"Command" };
    var rows = PM_DEMO.skills.map(function (s) {
      var update = s.update ? '<span class="chip info">Update available</span>' : "";
      var stLabel = s.kind === "tool" ? (s.state === "available" ? "Available" : "Installed") : (s.enabled ? "Enabled" : "Disabled");
      var st = s.enabled ? "ok" : "neutral";
      return [
        '<div class="skill-row" data-skill="' + s.id + '">',
          '<span class="sdot ' + st + '"></span>',
          '<div class="col grow gap-xs">',
            '<div class="row center gap-sm wrap"><strong>' + s.name + '</strong>',
              '<span class="chip">' + kindLabel[s.kind] + '</span>',
              '<span class="chip ' + st + '">' + stLabel + '</span>',
              '<span class="chip">' + s.scope + '</span>',
              '<span class="chip">trust: ' + s.trust + '</span>',
              s.shortcut ? '<span class="chip mono">' + s.shortcut + '</span>' : '',
              update,
            '</div>',
            '<span class="muted small">Source: ' + s.source + (s.invoked ? ' · invoked ' + s.invoked : "") + '</span>',
          '</div>',
          '<div class="row center gap-xs">',
            '<button class="btn sm ghost" data-skill-toggle>' + (s.enabled ? "Disable" : "Enable") + '</button>',
            '<button class="btn sm ghost icon" data-skill-act="details">' + PM.svg("external",13) + '</button>',
          '</div>',
        '</div>'
      ].join("");
    }).join("");
    return M.shell({
      title: "Skills, Plugins & Tools", icon: "skills",
      addLabel: "Install", health: { text: "5 resources · 1 update", kind: "ok" },
      summary: "Skills, plugins, tools, and commands — distinct but related. Progressive disclosure enforced.",
      toolbar: [{id:"marketplace",label:"Marketplace",icon:"globe"}]
    }, '<div class="skill-list">' + rows + '</div>');
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

  /* ---------- TERMINAL (deep-dive 04) ---------- */
  M.terminal = function () {
    var rows = PM_DEMO.terminals.map(function (t) {
      return [
        '<div class="term-row" data-term="' + t.id + '">',
          '<div class="term-swatch" style="background:' + t.bg + ';color:' + t.fg + '">' + PM.svg("terminal",16) + '</div>',
          '<div class="col grow gap-xs">',
            '<div class="row center gap-sm"><strong>' + t.name + '</strong>',
              t.default ? '<span class="chip accent">Default</span>' : "",
              '<span class="chip">' + t.shell + '</span>',
              '<span class="chip mono">' + t.font + ' ' + t.size + 'px</span>',
              '<span class="chip">opacity ' + Math.round(t.opacity*100) + '%</span>',
            '</div>',
            '<span class="muted small">Sample</span>',
            '<div class="term-preview" style="background:' + t.bg + ';color:' + t.fg + ';opacity:' + t.opacity + '"><span class="mono">$ git status — clean</span></div>',
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
      summary: "Profiles, shell, font, palette, opacity, cursor, and transcript retention.",
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
        root.querySelectorAll("[data-conn],[data-model],[data-gist],[data-mcp],[data-skill],[data-persona],[data-lsp],[data-term],[data-media],[data-crew]").forEach(function (row) {
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
      btn.addEventListener("click", function () { this.textContent = this.textContent.trim() === "Disable" ? "Enable" : "Disable"; });
    });
    // generic add — simulated result or honest unavailable
    root.querySelectorAll('[data-manager-action="add"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var mgr = root.getAttribute("data-manager-id");
        PM.toast("Add " + (mgr || "resource") + " — simulated in concept");
      });
    });
  };

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
