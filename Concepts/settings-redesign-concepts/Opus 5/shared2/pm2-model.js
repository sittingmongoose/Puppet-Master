/* Opus 5 — the Settings model concepts 05-11 are built on.
 *
 * This file owns the SHAPE of Settings: which domains exist, which pages and
 * sections a domain contains, which manager families live where, what a row's
 * state means, and who the current Project is. It owns no pixels. Seven concepts
 * read this and draw seven different applications from it.
 *
 * Why a second model at all, when `shared/pm-data.js` already has one: the
 * 2026-08-18 packet requires the real 828-record inventory and forbids every
 * inheritance and scope control. `shared/` is frozen evidence for concepts 01-04
 * and still speaks the older vocabulary ("Inherited · Global"), so the new work
 * sits beside it rather than editing it.
 *
 * Load order:
 *   shared/pm-icons.js  shared/pm-data*.js  shared/pm-manager-kit.js
 *   shared2/pm2-inventory.js
 *   shared2/pm2-model.js          <- here
 *   the rest of shared2, then the concept
 */
(function () {
  "use strict";

  var INV = window.PM2Inventory;
  if (!INV) throw new Error("pm2-model: pm2-inventory.js must load first");

  /* ------------------------------------------------------------- the Project */

  /* One concrete Project. There is no scope selector anywhere in these concepts:
   * the Project is context in the header, and every editable row belongs to it.
   * The other Projects exist only as sources for the one-time copy transaction —
   * they are never a place settings are edited from or synchronised with. */
  var project = {
    id: "proj-orion",
    name: "Orion Data Pipeline",
    kind: "Project",
    path: "~/work/orion-data-pipeline",
    opened: "Open since 9:12 this morning",
    settingsRevision: 148
  };

  var otherProjects = [
    { id: "proj-atlas-agency", name: "Atlas Agency", updated: "Updated 2 hours ago",
      categories: 12, settings: 828, note: "Most recently worked in." },
    { id: "proj-customer-support", name: "Customer Support Bot", updated: "Updated 6 May",
      categories: 12, settings: 828, note: "Uses a different provider mix." },
    { id: "proj-voiceforge", name: "VoiceForge", updated: "Updated 9 May",
      categories: 11, settings: 764, note: "Media-heavy; no container settings." },
    { id: "proj-starlight", name: "Starlight", updated: "Updated 12 days ago",
      categories: 12, settings: 828, note: "Archived last month." }
  ];

  /* ------------------------------------------------------------ the 12 domains */

  /* Titles and membership come from canon. Only the icon, the one-line purpose and
   * the ordering are authored here, because the inventory does not carry them. */
  var DOMAIN_META = {
    general:    { icon: "palette",  purpose: "How Puppet Master looks, sounds and behaves day to day." },
    ai:         { icon: "brain",    purpose: "Providers, accounts, models and what happens when usage runs out." },
    safety:     { icon: "shield",   purpose: "What the assistant may do on its own, and where it must ask first." },
    code:       { icon: "code",     purpose: "Terminal, editor, language tooling and where runs actually execute." },
    memory:     { icon: "layers",   purpose: "What goes into a run's context, what is remembered, and for how long." },
    planning:   { icon: "checkCircle", purpose: "How work is planned, verified and proved finished." },
    branching:  { icon: "branch",   purpose: "Worktrees, source control and running several agents together." },
    media:      { icon: "image",    purpose: "Generating, accepting and storing images, audio and video." },
    web:        { icon: "globe",    purpose: "Searching and reading the web, and the index of this Project." },
    personas:   { icon: "mask",     purpose: "The cast of personas and how each one is allowed to work." },
    extensions: { icon: "puzzle",   purpose: "Skills, plugins, tools and the commands that reach them." },
    system:     { icon: "sliders",  purpose: "Health, storage, backups and the advanced switches." }
  };

  var DOMAIN_ORDER = ["ai", "general", "safety", "code", "memory", "planning",
    "branching", "personas", "extensions", "web", "media", "system"];

  /* ---------------------------------------------------------- manager families */

  /* Exactly the packet's required list, in the packet's own words, so a coverage
   * report can be generated from the running concept instead of being asserted by
   * hand. `archetype` is the shape the packet allows a manager to take; concepts
   * read it so that a roster does not get flattened into preference rows. */
  var FAMILIES = [
    { family: "Settings Home", id: "home", surface: "home", domainId: null, archetype: "directory" },
    { family: "Settings Search", id: "search", surface: "search", domainId: null, archetype: "finder" },
    { family: "Settings Workspace", id: "workspace", surface: "workspace", domainId: null, archetype: "preference document" },
    { family: "Ordinary setting grammar", id: "rows", surface: "rows", domainId: null, archetype: "preference document" },

    { family: "Provider / Account / Model / Installation", managerId: "manager-providers", domainId: "ai", archetype: "resource roster and detail sheet", flagship: true },
    { family: "Context & Instructions", managerId: "manager-context", domainId: "memory", archetype: "preference document" },
    { family: "Memory", managerId: "manager-memory", domainId: "memory", archetype: "inventory catalogue" },
    { family: "Personas", managerId: "manager-personas", domainId: "personas", archetype: "resource roster and detail sheet" },
    { family: "Goal & Automation", managerId: "manager-goal", domainId: "planning", archetype: "preference document" },
    { family: "Crew", managerId: "manager-crew", domainId: "branching", archetype: "resource roster and detail sheet" },
    { family: "Permissions & FileSafe", managerId: "manager-filesafe", domainId: "safety", archetype: "preference document" },
    { family: "Back Seat Driver", managerId: "manager-bsd", domainId: "planning", archetype: "preference document" },
    { family: "Notifications & Sounds", managerId: "manager-notifications", domainId: "general", archetype: "inventory catalogue" },
    { family: "Sound Library / Uploads / Packs", managerId: "manager-sounds", domainId: "general", archetype: "inventory catalogue" },
    { family: "Appearance / themes / fonts / motion", managerId: "manager-appearance", domainId: "general", archetype: "preference document" },
    { family: "Spellcheck & Dictionaries", managerId: "manager-dictionaries", domainId: "general", archetype: "inventory catalogue" },
    { family: "Desktop / Tray / Window", managerId: "manager-desktop", domainId: "general", archetype: "preference document" },
    { family: "Teacher / Help", managerId: "manager-teacher", domainId: "system", archetype: "setup or repair sequence" },
    { family: "Doctor", managerId: "manager-doctor", domainId: "system", archetype: "read-only health projection" },
    { family: "File Manager / Editor", managerId: "manager-files", domainId: "code", archetype: "preference document" },
    { family: "Terminal", managerId: "manager-terminal", domainId: "code", archetype: "resource roster and detail sheet" },
    { family: "LSP", managerId: "manager-lsp", domainId: "code", archetype: "resource roster and detail sheet" },
    { family: "Formatters", managerId: "manager-formatters", domainId: "code", archetype: "inventory catalogue" },
    { family: "Commands & Shortcuts", managerId: "manager-commands", domainId: "extensions", archetype: "inventory catalogue" },
    { family: "MCP", managerId: "manager-mcp", domainId: "system", archetype: "resource roster and detail sheet" },
    { family: "Skills", managerId: "manager-skills", domainId: "extensions", archetype: "inventory catalogue" },
    { family: "Plugins", managerId: "manager-plugins", domainId: "extensions", archetype: "inventory catalogue" },
    { family: "Tools", managerId: "manager-tools", domainId: "extensions", archetype: "inventory catalogue" },
    { family: "Testing & Debug", managerId: "manager-testing", domainId: "planning", archetype: "diagnostic drawer" },
    { family: "Storage & Retention", managerId: "manager-storage", domainId: "system", archetype: "read-only health projection" },
    { family: "Backup & Restore", managerId: "manager-backup", domainId: "system", archetype: "preview and confirmation transaction" },
    { family: "Settings Lifecycle", managerId: "manager-settings-lifecycle", domainId: "system", archetype: "preview and confirmation transaction" },
    { family: "History & Sessions", managerId: "manager-history", domainId: "memory", archetype: "inventory catalogue" },
    { family: "Runtime Artifacts / Project Outputs", managerId: "manager-artifacts", domainId: "media", archetype: "inventory catalogue" },
    { family: "Source Control / Worktrees", managerId: "manager-sourcecontrol", domainId: "branching", archetype: "resource roster and detail sheet" },
    { family: "GitHub Actions", managerId: "manager-gh-actions", domainId: "branching", archetype: "read-only health projection" },
    { family: "Containers & Registries", managerId: "manager-containers", domainId: "code", archetype: "resource roster and detail sheet" },
    { family: "Web / Search / Fetch / Crawl", managerId: "manager-web", domainId: "web", archetype: "resource roster and detail sheet" },
    { family: "Project Search Index", managerId: "manager-index", domainId: "web", archetype: "read-only health projection" },
    { family: "Workspace Cleanup", managerId: "manager-cleanup", domainId: "system", archetype: "preview and confirmation transaction" },
    { family: "Media & Output", managerId: "manager-media", domainId: "media", archetype: "preference document" },
    { family: "DRY Method visible state where exposed", managerId: "manager-dry", domainId: "system", archetype: "read-only health projection" }
  ];

  /* Demonstrated in every concept but not on the required list: the resource
   * governor projection and the copy transaction. They are here so no concept
   * quietly invents a second scheduler or a second copy story. */
  var EXTRA_MANAGERS = [
    { family: "Resource use and performance", managerId: "manager-performance", domainId: "system", archetype: "read-only health projection" },
    { family: "Copy Settings From Another Project", managerId: "manager-copy", domainId: "system", archetype: "preview and confirmation transaction" }
  ];

  /* Genuinely separate owner modules. Each one is reachable from a real Settings
   * destination, names its owner, and states how it hands control back. None of
   * them fakes a backend. */
  var DEFERRED = [
    { family: "Product Onboarding", managerId: "owner-onboarding", domainId: "system",
      owner: "Product Onboarding",
      why: "First-run introduction is owned by Onboarding, which runs before a Project exists.",
      insertion: "Settings › System & Advanced › Getting started — opens Onboarding at its welcome step.",
      returns: "Onboarding returns to Settings › System & Advanced › Getting started when it finishes or is dismissed." },
    { family: "Installation / Deployment", managerId: "owner-installation", domainId: "system",
      owner: "Installation & Deployment",
      why: "Where Puppet Master itself is installed is decided outside any one Project.",
      insertion: "Settings › System & Advanced › Installation — opens the Installation owner for this host.",
      returns: "Returns to Settings › System & Advanced › Installation with the selected host still current." },
    { family: "Server Claim / Bootstrap", managerId: "owner-server-claim", domainId: "system",
      owner: "Server Claim",
      why: "Claiming an unclaimed Server is an ownership transaction, not a Project preference.",
      insertion: "Settings › System & Advanced › Servers and hosts › Claim a Server.",
      returns: "Returns to the Servers roster with the claimed Server selected." },
    { family: "Servers / Execution Hosts / Clients", managerId: "manager-server", domainId: "system",
      owner: "Server & Host owner",
      why: "Host inventory and health belong to the Server owner; Settings chooses how this Project uses a host.",
      insertion: "Settings › System & Advanced › Servers and hosts.",
      returns: "Returns to Settings › System & Advanced › Servers and hosts." },
    { family: "Project Hosting & Files", managerId: "owner-project-hosting", domainId: "system",
      owner: "Project Hosting",
      why: "Where a Project's files physically live is a hosting decision with its own migration flow.",
      insertion: "Settings › System & Advanced › Project location.",
      returns: "Returns to Settings › System & Advanced › Project location with the new location shown." },
    { family: "Remote Access", managerId: "owner-remote-access", domainId: "system",
      owner: "Remote Access",
      why: "Remote entry points are a security surface owned outside Settings.",
      insertion: "Settings › System & Advanced › Remote access.",
      returns: "Returns to Settings › System & Advanced › Remote access." },
    { family: "Project Sync / Move", managerId: "owner-project-move", domainId: "system",
      owner: "Project Move",
      why: "Moving or synchronising a whole Project is a transaction over files, not a settings edit.",
      insertion: "Settings › System & Advanced › Move this Project.",
      returns: "Returns to Settings Home for the Project at its new location." },
    { family: "Puppet Master application/content updates", managerId: "owner-updates", domainId: "system",
      owner: "Application Updates",
      why: "Product updates are staged and verified by the update owner for the whole installation.",
      insertion: "Settings › System & Advanced › Updates.",
      returns: "Returns to Settings › System & Advanced › Updates with the staged generation shown." },
    { family: "Full Server backup owner flow", managerId: "owner-server-backup", domainId: "system",
      owner: "Server Backup",
      why: "A whole-Server backup covers every Project and is owned by the Server, not by one Project.",
      insertion: "Settings › System & Advanced › Backup and restore › Whole-Server backup.",
      returns: "Returns to Backup and restore for this Project." },
    { family: "Usage", managerId: "manager-usage", domainId: "ai",
      owner: "Usage",
      why: "Measurement, history and projection belong to Usage. Settings configures what happens at the boundary.",
      insertion: "Settings › AI Brains & Providers › Usage and costs.",
      returns: "Usage returns to the Settings row that opened it." }
  ];

  /* -------------------------------------------------------------- exposure */

  /* The ladder every concept filters rows against. `standard` is what an ordinary
   * reader sees; everything else is behind a disclosure the reader opens. */
  var EXPOSURE = [
    { id: "standard", label: "Everyday", rank: 0 },
    { id: "advanced", label: "Advanced", rank: 1 },
    { id: "expert", label: "Expert", rank: 2 },
    { id: "diagnostic", label: "Diagnostic", rank: 3 }
  ];
  var EXPOSURE_RANK = {};
  EXPOSURE.forEach(function (e) { EXPOSURE_RANK[e.id] = e.rank; });

  /* --------------------------------------------------------- row vocabulary */

  /* Project-only. There is deliberately no "Inherited" state and no scope word:
   * a value in this Project came from the product default, from the reader, from
   * what the host reports, from a policy that genuinely overrides it, or it is not
   * set at all. Anything else would be an inheritance system in disguise. */
  /* "Effective value differs" is its own state, not a flavour of managed.
   * `02_MANAGER_GRAMMAR_AND_SETTING_MODEL` lists it among the explicit value states, and
   * the provider fixtures require a requested-versus-effective route. It is NOT
   * inheritance: nothing here says a value was inherited from a wider scope. It says the
   * Project asked for one thing and something intrinsic — a policy floor, a host that
   * cannot honour it, a run override — produced another, and names which. */
  function differs(state) {
    return !!(state && state.requested !== undefined && state.effective !== undefined &&
      String(state.requested) !== String(state.effective));
  }

  function stateLabel(state) {
    if (!state) return "Default";
    if (differs(state)) return "In effect: " + String(state.effective);
    switch (state.source) {
      case "unavailable": return "Unavailable";
      case "managed": return "Managed";
      case "notConfigured": return "Not set";
      case "auto": return "Automatic";
      case "recommended": return "Recommended";
      case "custom": return state.isDefault ? "Default" : "Changed";
      default: return "Default";
    }
  }

  function stateTone(state) {
    if (!state) return "quiet";
    if (differs(state)) return "managed";
    switch (state.source) {
      case "unavailable": return "unavailable";
      case "managed": return "managed";
      case "notConfigured": return "setup";
      case "custom": return state.isDefault ? "quiet" : "changed";
      default: return "quiet";
    }
  }

  /* One sentence a reader can act on, or null when the row needs no explanation.
   * Concepts put this behind "Why this value?" rather than on every row. */
  function stateReason(state) {
    if (!state) return null;
    if (differs(state)) {
      return "This Project asked for " + String(state.requested) + ". " +
        (state.effectiveWhy || "Something outside this Project decided the result.") +
        " What runs is " + String(state.effective) + ".";
    }
    if (state.source === "unavailable") return state.reason || "Not available on this host.";
    if (state.source === "managed") return state.managedNote || null;
    if (state.source === "auto") return state.autoNote || null;
    if (state.source === "custom" && !state.isDefault) {
      return "Changed for this Project" + (state.changedAt ? " " + state.changedAt : "") + ".";
    }
    if (state.source === "notConfigured") return "No value has been set for this Project yet.";
    return null;
  }

  function isEditable(state) {
    return !state || (state.source !== "managed" && state.source !== "unavailable");
  }

  /* ------------------------------------------------------------- lookups */

  var settingById = Object.create(null);
  var pageById = Object.create(null);
  var sectionById = Object.create(null);
  var domainById = Object.create(null);
  var rowsBySection = Object.create(null);
  var rowsByPage = Object.create(null);

  INV.settings.forEach(function (s) {
    settingById[s.id] = s;
    (rowsBySection[s.sectionId] || (rowsBySection[s.sectionId] = [])).push(s);
    (rowsByPage[s.pageId] || (rowsByPage[s.pageId] = [])).push(s);
  });

  var domains = INV.domains.map(function (d) {
    var meta = DOMAIN_META[d.id] || {};
    var out = {
      id: d.id,
      title: d.title,
      icon: meta.icon || "sliders",
      purpose: meta.purpose || "",
      count: d.count,
      order: DOMAIN_ORDER.indexOf(d.id),
      pages: d.pages.map(function (p) {
        var page = {
          id: p.id, domainId: d.id, title: p.title, summary: p.summary,
          count: p.count, sections: p.sections.map(function (s) {
            return { id: s.id, pageId: p.id, domainId: d.id, title: s.title, order: s.order, count: s.count };
          })
        };
        pageById[p.id] = page;
        page.sections.forEach(function (s) { sectionById[s.id] = s; });
        return page;
      }),
      families: []
    };
    domainById[d.id] = out;
    return out;
  });
  domains.sort(function (a, b) { return a.order - b.order; });

  /* Attach every manager destination to the domain that owns it, so a concept can
   * render "what lives in this domain" without a second table. */
  var familyByManager = Object.create(null);
  var allDestinations = FAMILIES.concat(EXTRA_MANAGERS).concat(DEFERRED.map(function (d) {
    return Object.assign({ deferred: true, archetype: "named owner insertion point" }, d);
  }));
  allDestinations.forEach(function (f) {
    if (f.managerId) familyByManager[f.managerId] = f;
    if (f.domainId && domainById[f.domainId]) domainById[f.domainId].families.push(f);
  });

  /* Manager title/purpose/icon come from whichever module actually describes the
   * manager, so the words are identical to the spec the concept will render. */
  function managerRecord(managerId) {
    var data = window.PMData;
    var rec = data && data.managers ? data.managers[managerId] : null;
    if (rec) return rec;
    var extra = window.PM2ManagerExtras && window.PM2ManagerExtras.record(managerId);
    return extra || { id: managerId, title: managerId, purpose: "", icon: "sliders" };
  }

  /* ------------------------------------------------------------------ API */

  window.PM2Model = {
    inventory: INV,
    project: project,
    otherProjects: otherProjects,

    domains: domains,
    domain: function (id) { return domainById[id] || null; },
    page: function (id) { return pageById[id] || null; },
    section: function (id) { return sectionById[id] || null; },
    setting: function (id) { return settingById[id] || null; },
    rowsInSection: function (id) { return rowsBySection[id] || []; },
    rowsInPage: function (id) { return rowsByPage[id] || []; },
    settings: INV.settings,

    FAMILIES: FAMILIES,
    EXTRA_MANAGERS: EXTRA_MANAGERS,
    DEFERRED: DEFERRED,
    destinations: allDestinations,
    familyOf: function (managerId) { return familyByManager[managerId] || null; },
    managerRecord: managerRecord,
    managerIds: function () {
      return allDestinations.filter(function (f) { return f.managerId; })
        .map(function (f) { return f.managerId; });
    },

    EXPOSURE: EXPOSURE,
    exposureRank: function (id) { return EXPOSURE_RANK[id] == null ? 1 : EXPOSURE_RANK[id]; },

    stateLabel: stateLabel,
    stateTone: stateTone,
    differs: differs,
    stateReason: stateReason,
    isEditable: isEditable,

    counts: {
      settings: INV.settingsCount,
      domains: INV.domainCount,
      pages: INV.pageCount,
      sections: INV.sectionCount,
      requiredFamilies: FAMILIES.length,
      deferredOwners: DEFERRED.length
    }
  };
})();
