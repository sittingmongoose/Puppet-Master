/* demo-data.js — single source of truth for all four GLM-5.2 settings concepts.
   Realistic data substantially richer than the legacy bloom modal.
   Faithful to packet 01–05: Provider→Account→Connection→Product→Model hierarchy,
   connection groups, multi-account + CLI profiles, Claude/Antigravity CLI-owned OAuth,
   continuously-refreshed catalogs, capability evidence, main/auxiliary roles,
   Memory Gist half-life, Personas w/ scope, Crew requested-vs-effective,
   Context breadth/narrow, MCP/LSP/Skills/Terminal/Media resources, settings row states. */
(function () {
  "use strict";
  window.PM_DEMO = {};

  /* ----- CATEGORIES + SUBCATEGORIES (humanized taxonomy, packet 01) ----- */
  PM_DEMO.categories = [
    { id: "general", title: "General", purpose: "Startup, defaults, updates, and identity.",
      sub: [
        { id: "startup", title: "Startup & window" },
        { id: "defaults", title: "Project defaults" },
        { id: "updates", title: "Updates & version" },
        { id: "identity", title: "Profile & identity" }
      ]},
    { id: "appearance", title: "Appearance & Motion", purpose: "Theme, layout, density, input, and motion.",
      sub: [
        { id: "theme", title: "Theme" },
        { id: "layout", title: "Layout & density" },
        { id: "motion", title: "Motion & reduced motion" },
        { id: "input", title: "Input & shortcuts" }
      ]},
    { id: "agents", title: "Agents & Models", purpose: "Providers, accounts, connections, models, and roles.",
      sub: [
        { id: "providers", title: "Providers", manager: "pam" },
        { id: "accounts", title: "Accounts & connections", manager: "pam" },
        { id: "models", title: "Models", manager: "pam" },
        { id: "roles", title: "Agent role assignments", manager: "pam" }
      ]},
    { id: "permissions", title: "Permissions & Approvals", purpose: "Approvals, FileSafe, sandboxes, and network.",
      sub: [
        { id: "approvals", title: "Approval policy" },
        { id: "filesafe", title: "FileSafe" },
        { id: "sandbox", title: "Sandboxes & network" }
      ]},
    { id: "code", title: "Code, Editor & Languages", purpose: "Editor, terminal, shell, and language servers.",
      sub: [
        { id: "editor", title: "Editor" },
        { id: "terminal", title: "Terminal & shell", manager: "terminal" },
        { id: "lsp", title: "Language servers", manager: "lsp" }
      ]},
    { id: "context", title: "Context, Memory & History", purpose: "What enters each turn, and for how long.",
      sub: [
        { id: "context", title: "Context & instructions", manager: "context" },
        { id: "memory", title: "Assistant memory", manager: "memory" },
        { id: "retention", title: "History & retention" }
      ]},
    { id: "planning", title: "Planning, Goals & Automation", purpose: "PRD, Goal Mode, testing, and verification.",
      sub: [
        { id: "goal", title: "Goal Mode runtime" },
        { id: "prd", title: "PRD & planning route" },
        { id: "testing", title: "Testing & verification" }
      ]},
    { id: "git", title: "Git, Worktrees & Crew", purpose: "Version control, worktrees, and multi-agent Crew.",
      sub: [
        { id: "git", title: "Git" },
        { id: "worktrees", title: "Worktrees" },
        { id: "ops", title: "Operational awareness" },
        { id: "crew", title: "Crew templates", manager: "crew" }
      ]},
    { id: "extensions", title: "MCP, Skills & Tools", purpose: "Servers, skills, plugins, tools, and commands.",
      sub: [
        { id: "mcp", title: "MCP servers", manager: "mcp" },
        { id: "skills", title: "Skills, plugins & tools", manager: "skills" }
      ]},
    { id: "media", title: "Media Providers", purpose: "Image, audio, and video routes.",
      sub: [
        { id: "media", title: "Media providers", manager: "media" }
      ]},
    { id: "system", title: "System & Diagnostics", purpose: "Health, logs, backups, snapshots, advanced.",
      sub: [
        { id: "health", title: "Health" },
        { id: "logs", title: "Logs" },
        { id: "backups", title: "Backups & snapshots" },
        { id: "advanced", title: "Advanced" }
      ]}
  ];

  /* map for fast lookup */
  PM_DEMO.subById = {};
  PM_DEMO.catById = {};
  PM_DEMO.categories.forEach(function (c) {
    PM_DEMO.catById[c.id] = c;
    c.sub.forEach(function (s) { PM_DEMO.subById[c.id + "." + s.id] = s; s.cat = c.id; });
  });

  /* ----- MANAGER REGISTRY (which subcategory opens which manager) ----- */
  PM_DEMO.managers = {
    pam:      { id:"pam",      title:"Provider / Agent / Model", managerCat:"agents",  icon:"pam",      mandatory:true },
    memory:   { id:"memory",   title:"Assistant Memory",         managerCat:"context", icon:"memory",   deepDive:["01"] },
    mcp:      { id:"mcp",      title:"MCP Servers",              managerCat:"extensions", icon:"mcp",  deepDive:["01"] },
    crew:     { id:"crew",     title:"Crew Templates",           managerCat:"git",     icon:"crew",     deepDive:["02"] },
    skills:   { id:"skills",   title:"Skills, Plugins & Tools",  managerCat:"extensions", icon:"skills", deepDive:["02"] },
    personas: { id:"personas", title:"Personas",                 managerCat:"agents",  icon:"personas", deepDive:["03"] },
    context:  { id:"context",  title:"Context & Instructions",   managerCat:"context", icon:"context",  deepDive:["03"] },
    lsp:      { id:"lsp",      title:"Language Servers",         managerCat:"code",    icon:"lsp",      deepDive:["04"] },
    terminal: { id:"terminal", title:"Terminal",                 managerCat:"code",    icon:"terminal", deepDive:["04"] },
    media:    { id:"media",    title:"Media Providers",          managerCat:"media",   icon:"media",    deepDive:["04"] }
  };

  /* ----- SETTINGS ROWS (one sample per state in packet 01) ----- */
  /* states: Default | Recommended | Inherited | Auto | Not configured | Managed | Custom | Unavailable | Effective differs
     exposure: Standard | Advanced | Expert/risky | Managed/read-only | Diagnostic | Unavailable */
  PM_DEMO.settingsBySub = {
    "general.startup": [
      { id:"open-on-launch", label:"Open on launch", expl:"Start Puppet Master when the system starts.",
        type:"switch", value:true, state:"default", source:"Default", exposure:"standard" },
      { id:"restore-session", label:"Restore last workspace", expl:"Reopen projects and panels from the last session.",
        type:"switch", value:true, state:"recommended", source:"Recommended", exposure:"standard" },
      { id:"splash-screen", label:"Show splash screen", expl:"Display the launch splash.",
        type:"switch", value:false, state:"managed", source:"Set by administrator", managed:true, exposure:"managed", unavailable:false }
    ],
    "general.defaults": [
      { id:"default-project", label:"Default project location", expl:"Where new projects are created.",
        type:"text", value:"~/PuppetMaster/projects", state:"custom", source:"You", exposure:"standard" },
      { id:"new-thread-model", label:"Model for new threads", expl:"Used when a thread does not pick one.",
        type:"select", value:"GLM-5.2 (ZAI)", options:["GLM-5.2 (ZAI)","Sonnet 4.5","Opus 5"], state:"recommended", source:"Recommended", exposure:"standard" }
    ],
    "general.updates": [
      { id:"update-channel", label:"Update channel", expl:"Stable receives tested releases.",
        type:"select", value:"Stable", options:["Stable","Beta","Disabled"], state:"default", source:"Default", exposure:"standard" },
      { id:"auto-update", label:"Download automatically", expl:"Install on next restart.",
        type:"switch", value:true, state:"inherited", source:"Inherited from System", exposure:"advanced" }
    ],
    "general.identity": [
      { id:"display-name", label:"Display name", expl:"Shown in collaboration surfaces.",
        type:"text", value:"Jared", state:"custom", source:"You", exposure:"standard" },
      { id:"telemetry", label:"Anonymous usage telemetry", expl:"Helps prioritize fixes. No code is sent.",
        type:"switch", value:false, state:"default", source:"Default", exposure:"expert",
        safety:"privacy" }
    ],
    "appearance.theme": [
      { id:"theme-family", label:"Theme family", expl:"Friendly, Glass, Retro, or Basic.",
        type:"select", value:"Friendly", options:["Friendly","Glass","Retro","Basic"], state:"custom", source:"You", exposure:"standard" },
      { id:"theme-mode", label:"Light or dark", expl:"Auto follows the system.",
        type:"select", value:"Dark", options:["Auto","Light","Dark"], state:"custom", source:"You", exposure:"standard" },
      { id:"reduced-motion", label:"Reduced motion", expl:"Same final states, short opacity transitions.",
        type:"switch", value:false, state:"default", source:"Default", exposure:"standard" }
    ],
    "appearance.layout": [
      { id:"density", label:"Density", expl:"Comfortable or compact rows.",
        type:"select", value:"Comfortable", options:["Comfortable","Compact"], state:"default", source:"Default", exposure:"standard" },
      { id:"rail-width", label:"Rail width", expl:"Width of the left project rail.",
        type:"slider", value:240, min:180, max:360, unit:"px", state:"custom", source:"You", exposure:"standard" }
    ],
    "appearance.motion": [
      { id:"motion-personality", label:"Motion personality", expl:"Confidence of easing and staging.",
        type:"select", value:"Film", options:["Film","Calm","Off"], state:"recommended", source:"Recommended", exposure:"advanced" }
    ],
    "appearance.input": [
      { id:"cmdk", label:"Command shortcut", expl:"Opens the omni-search.",
        type:"text", value:"⌘K", state:"default", source:"Default", exposure:"standard" },
      { id:"spellcheck", label:"Check spelling", expl:"Quiet underline in prose fields. No autocorrect.",
        type:"switch", value:true, state:"default", source:"Default", exposure:"standard" }
    ],
    "permissions.approvals": [
      { id:"approval-mode", label:"Approval mode", expl:"Full Access requires confirmation for risky acts.",
        type:"select", value:"Full Access", options:["Full Access","Confirm Edits","Yolo"], state:"custom", source:"You", exposure:"standard",
        safety:"safety" }
    ],
    "permissions.filesafe": [
      { id:"filesafe-enabled", label:"FileSafe", expl:"Guard against unwanted writes outside the workspace.",
        type:"switch", value:true, state:"recommended", source:"Recommended", exposure:"standard" },
      { id:"filesafe-rules", label:"Protected paths", expl:"Glob patterns never written without approval.",
        type:"text", value:"**/.env, **/secrets/**", state:"custom", source:"You", exposure:"advanced" }
    ],
    "permissions.sandbox": [
      { id:"network-mode", label:"Network mode", expl:"Determines outbound access for tools.",
        type:"select", value:"Workspace only", options:["Workspace only","Ask","Unrestricted"], state:"recommended", source:"Recommended", exposure:"expert",
        safety:"safety" },
      { id:"container-driver", label:"Container driver", expl:"Unavailable on this platform.",
        type:"select", value:"—", options:[], state:"unavailable", source:"—", unavailable:true,
        reason:"No supported container driver detected.", exposure:"unavailable" }
    ],
    "context.retention": [
      { id:"thread-retention", label:"Thread retention", expl:"How long completed threads are kept.",
        type:"select", value:"90 days", options:["30 days","90 days","Forever"], state:"default", source:"Default", exposure:"standard" },
      { id:"log-retention", label:"Log retention", expl:"Captured diagnostic logs.",
        type:"slider", value:14, min:3, max:90, unit:" days", state:"inherited", source:"Inherited from System", exposure:"advanced" }
    ],
    "planning.goal": [
      { id:"goal-default-route", label:"Default Goal worker route", expl:"High-quality conversational/planning agent.",
        type:"select", value:"Opus 5", options:["Opus 5","Sonnet 4.5","GLM-5.2 (ZAI)"], state:"recommended", source:"Recommended", exposure:"standard",
        note:"PRD/Planning discussion must use a high-quality route." },
      { id:"goal-concurrency", label:"Configured concurrency", expl:"Ceiling. Effective capacity is shown by the runtime.",
        type:"slider", value:8, min:1, max:16, unit:" agents", state:"custom", source:"You", exposure:"advanced",
        effective:2, effectiveNote:"Sustainable capacity is 2 now; 3 waves recommended.",
        warning:"Starting eight agents now is unlikely to finish before the provider resets. PM recommends two concurrent agents and three waves." },
      { id:"goal-reserve", label:"Reserve for synthesis", expl:"Keep budget for final integration and verification.",
        type:"switch", value:true, state:"recommended", source:"Recommended", exposure:"advanced" },
      { id:"goal-spend-guard", label:"Spend/time guard", expl:"Pause Goals before exceeding a budget ceiling.",
        type:"switch", value:true, state:"recommended", source:"Recommended", exposure:"advanced" },
      { id:"goal-checkpoint", label:"Automatic checkpoint + compact", expl:"Checkpoint long Goals and compact context safely.",
        type:"select", value:"Auto", options:["Off","Auto","Ask"], state:"default", source:"Default", exposure:"advanced" }
    ],
    "planning.prd": [
      { id:"prd-route", label:"PRD conversation route", expl:"Must stay high-quality by default.",
        type:"select", value:"Opus 5", options:["Opus 5","Sonnet 4.5"], state:"recommended", source:"Recommended", exposure:"standard" }
    ],
    "planning.testing": [
      { id:"verify-strength", label:"Default verification strength", expl:"Evidence/certification strictness.",
        type:"select", value:"Standard", options:["Light","Standard","Strict"], state:"default", source:"Default", exposure:"advanced" }
    ],
    "git.git": [
      { id:"git-author", label:"Git author name", expl:"Used for new commits.",
        type:"text", value:"Jared", state:"custom", source:"You", exposure:"standard" },
      { id:"auto-fetch", label:"Fetch on focus", expl:"Refresh remotes when Puppet Master gains focus.",
        type:"switch", value:true, state:"default", source:"Default", exposure:"standard" }
    ],
    "git.worktrees": [
      { id:"auto-provision", label:"Auto-provision worktrees", expl:"Create an isolated worktree per Goal.",
        type:"select", value:"Ask", options:["Never","Ask","Always"], state:"recommended", source:"Recommended", exposure:"advanced" }
    ],
    "git.ops": [
      { id:"port-collision", label:"Port-collision behavior", expl:"What happens when a dev server port is taken.",
        type:"select", value:"Ask", options:["Fail","Ask","Auto-increment"], state:"recommended", source:"Recommended", exposure:"advanced" },
      { id:"cross-project-read", label:"Cross-project read access", expl:"Off by default. Lets agents read other projects' threads and artifacts.",
        type:"select", value:"Off", options:["Off","Once","Thread","Goal","Persistent"], state:"default", source:"Default", exposure:"expert",
        safety:"privacy" },
      { id:"cross-project-write", label:"Cross-project write access", expl:"Separate from read. Never granted by default.",
        type:"select", value:"Off", options:["Off","Once","Thread","Goal","Persistent"], state:"default", source:"Default", exposure:"expert",
        safety:"safety" },
      { id:"test-automation", label:"Testing & debug automation", expl:"Whether children may run tests and capture diagnostics automatically.",
        type:"select", value:"Ask", options:["Never","Ask","Always"], state:"recommended", source:"Recommended", exposure:"advanced" },
      { id:"snapshot-access", label:"Snapshot & backup access", expl:"Whether agents may create/restore snapshots.",
        type:"select", value:"Ask", options:["Never","Ask","Always"], state:"default", source:"Default", exposure:"advanced" }
    ],
    "system.health": [
      { id:"health-status", label:"Overall health", expl:"Aggregated system status.",
        type:"readonly", value:"Degraded — 1 provider needs attention", state:"effective", source:"Computed", exposure:"standard" }
    ],
    "system.logs": [
      { id:"log-level", label:"Capture level", expl:"Diagnostic verbosity.",
        type:"select", value:"Info", options:["Error","Warn","Info","Debug"], state:"default", source:"Default", exposure:"diagnostic" }
    ],
    "system.backups": [
      { id:"snapshot-freq", label:"Snapshot frequency", expl:"How often project snapshots are taken.",
        type:"slider", value:15, min:5, max:60, unit:" min", state:"recommended", source:"Recommended", exposure:"advanced" }
    ],
    "system.advanced": [
      { id:"experimental", label:"Experimental features", expl:"Unstable, may change between releases.",
        type:"switch", value:false, state:"not-configured", source:"Not configured", exposure:"expert",
        safety:"risky" },
      { id:"feature-flag-x", label:"Internal flag", expl:"Internal — not exposed in ordinary UI.",
        type:"switch", value:false, state:"unavailable", source:"—", unavailable:true,
        reason:"Internal flag; reach via diagnostics only.", exposure:"unavailable" }
    ]
  };
  /* Ensure every subcategory has at least a placeholder so scrollspy/jump work */
  PM_DEMO.categories.forEach(function (c) {
    c.sub.forEach(function (s) {
      var key = c.id + "." + s.id;
      if (!PM_DEMO.settingsBySub[key]) PM_DEMO.settingsBySub[key] = [
        { id: key + ".placeholder", label:"Placeholder", expl:"(Demo row — wire canonical inventory here.)",
          type:"switch", value:false, state:"default", source:"Default", exposure:"standard" }
      ];
    });
  });

  /* ----- PROVIDER / AGENT / MODEL DATA (packet 02) ----- */
  /* Connection groups: Installed tools & signed-in apps | Connected accounts | API connections | Server connections | Free and community models */
  PM_DEMO.providers = [
    { id:"claude", name:"Anthropic Claude", family:"Claude", groups:[
      { kind:"installed-apps", label:"Installed tools & signed-in apps", items:[
        { id:"claude-cli", name:"Claude CLI", authOwner:"Claude CLI (own OAuth)", credType:"CLI-owned OAuth",
          status:"ready", health:"ok", lastRefresh:"2 min ago", lastGen:"just now",
          profile:"Isolated CLI home", multi:true, profileModel:"isolated-cli-home",
          note:"PM creates the profile root and invokes the CLI through it. PM never presents PM-direct OAuth for Claude." }
      ]},
      { kind:"connected-accounts", label:"Connected accounts", items:[
        { id:"claude-work", name:"Anthropic — Work", authOwner:"PM-direct OAuth", credType:"PM OAuth",
          status:"ready", health:"ok", lastRefresh:"4 min ago", lastGen:"1 min ago",
          profile:"PM-managed direct", plan:"Pro · included 45 messages", remaining:"31 of 45", remainingPct:69 }
      ]},
      { kind:"api-connections", label:"API connections", items:[
        { id:"claude-api", name:"Anthropic API key", authOwner:"API key", credType:"API key",
          status:"authed-not-ready", health:"warn", lastRefresh:"failed just now", lastGen:"3h ago",
          profile:"API credential pool", note:"Authenticated, but a model probe failed. Catalog holds last-known-good." }
      ]}
    ], models:[
      { id:"opus-5", name:"Opus 5", main:true, fav:true, alias:"planner", priority:1,
        modalities:["text","image"], ctx:"200k", tools:true, effort:true, fast:false,
        capability:"supported", evidence:"observed successful use · 2h ago", role:"PRD/Planning",
        status:"available" },
      { id:"sonnet-4-5", name:"Sonnet 4.5", main:true, fav:true, alias:"", priority:2,
        modalities:["text","image"], ctx:"200k", tools:true, effort:true, fast:true,
        capability:"supported", evidence:"catalog + account discovery", role:"Main Assistant",
        status:"available" },
      { id:"haiku-4", name:"Haiku 4", main:false, fav:false, alias:"", priority:5,
        modalities:["text"], ctx:"200k", tools:true, effort:false, fast:true,
        capability:"likely", evidence:"catalog declaration only", role:"—",
        status:"available" }
    ]},
    { id:"antigravity", name:"Antigravity", family:"Antigravity", groups:[
      { kind:"installed-apps", label:"Installed tools & signed-in apps", items:[
        { id:"antigravity-cli", name:"Antigravity CLI", authOwner:"Antigravity CLI (own Google/OAuth)", credType:"CLI-owned OAuth",
          status:"signed-out", health:"warn", lastRefresh:"—", lastGen:"—",
          profile:"Isolated CLI home", multi:true,
          note:"Signed out. PM can launch the native login inside the isolated profile." }
      ]}
    ], models:[
      { id:"ag-vega", name:"Vega", main:false, fav:false, alias:"", priority:9,
        modalities:["text","image","video"], ctx:"1M", tools:true, effort:true, fast:false,
        capability:"unverified", evidence:"awaiting first successful probe", role:"Vision/media",
        status:"available" }
    ]},
    { id:"openai", name:"OpenAI / Codex", family:"OpenAI", groups:[
      { kind:"connected-accounts", label:"Connected accounts", items:[
        { id:"openai-pm", name:"OpenAI — Personal", authOwner:"PM-direct OAuth", credType:"PM OAuth",
          status:"ready", health:"ok", lastRefresh:"5 min ago", lastGen:"30s ago",
          profile:"PM-managed direct", plan:"Plus · included", remaining:"unlimited (rate-limited)", remainingPct:100 }
      ]},
      { kind:"api-connections", label:"API connections", items:[
        { id:"openai-api", name:"OpenAI API key", authOwner:"API key", credType:"API key",
          status:"ready", health:"ok", lastRefresh:"5 min ago", lastGen:"8 min ago",
          profile:"API credential pool", plan:"Pay-as-you-go", remaining:"$42.10 credit", remainingPct:84 }
      ]}
    ], models:[
      { id:"gpt-5", name:"GPT-5", main:true, fav:true, alias:"", priority:3,
        modalities:["text","image"], ctx:"400k", tools:true, effort:true, fast:false, structuredOutput:true,
        capability:"supported", evidence:"observed successful use · 12 min ago", evidenceFresh:"fresh", role:"Approval review",
        status:"available" },
      { id:"gpt-5-effective", name:"GPT-5 (4o fallback)", main:false, fav:false, alias:"", priority:3, hidden:false,
        modalities:["text"], ctx:"128k", tools:true, effort:false, fast:true, structuredOutput:true,
        capability:"supported through another configured route", evidence:"effective route · GPT-5 quota pressured", evidenceFresh:"fresh",
        role:"Approval review",
        requestedModel:"gpt-5", effectiveNote:"Requested GPT-5; effective GPT-5 (4o fallback) because OpenAI — Personal hit its rate window.",
        status:"available" },
      { id:"gpt-5-mini", name:"GPT-5 mini", main:false, fav:false, alias:"", priority:6,
        modalities:["text"], ctx:"200k", tools:true, effort:false, fast:true,
        capability:"supported", evidence:"observed successful use", role:"Web extraction",
        status:"available" }
    ]},
    { id:"local", name:"Local server", family:"Local", groups:[
      { kind:"server-connections", label:"Server connections", items:[
        { id:"local-llama", name:"llama.cpp server", authOwner:"None (local)", credType:"Server endpoint",
          status:"ready", health:"ok", lastRefresh:"just now", lastGen:"20s ago",
          profile:"Local endpoint", endpoint:"http://localhost:8080" }
      ]}
    ], models:[
      { id:"local-qwen", name:"Qwen3 (local)", main:false, fav:false, alias:"", priority:7,
        modalities:["text"], ctx:"32k", tools:false, effort:false, fast:false,
        capability:"supported", evidence:"safe probe ok", role:"—",
        status:"available" }
    ]},
    { id:"free", name:"Free & community models", family:"Free", groups:[
      { kind:"free-community", label:"Free and community models", items:[
        { id:"free-glm", name:"GLM-5.2 free route", authOwner:"Keyless", credType:"No authentication",
          status:"ready", health:"ok", lastRefresh:"10 min ago", lastGen:"4 min ago",
          profile:"No authentication", plan:"Free · rate-limited", remaining:"48 / 60 per hour", remainingPct:80,
          note:"Keyless; promotional; data-sharing may apply." },
        { id:"free-needs-setup", name:"DeepSeek free", authOwner:"Account required", credType:"Account required",
          status:"needs-setup", health:"warn", lastRefresh:"—", lastGen:"—",
          profile:"Account required", note:"Create account, add credential, then return to this row." }
      ]}
    ], models:[
      { id:"glm-5-2-free", name:"GLM-5.2 (free route)", main:true, fav:true, alias:"cheap", priority:4,
        modalities:["text","image"], ctx:"128k", tools:true, effort:true, fast:false,
        capability:"supported through another configured route", evidence:"free route · keyless", role:"Background research",
        status:"available" },
      { id:"free-exhausted", name:"Promo-X free", main:false, fav:false, alias:"", priority:11,
        modalities:["text"], ctx:"64k", tools:false, effort:false, fast:false,
        capability:"temporarily unavailable", evidence:"included usage exhausted", role:"—",
        status:"unavailable", unavailableReason:"Included usage exhausted. Resets 09:00 UTC. Add an API key to continue." }
    ]}
  ];
  PM_DEMO.catalogMeta = {
    sources:["models.dev","Free Coding Models"],
    lastChecked:"just now",
    lastActivated:"5 min ago",
    sourceVersion:"models.dev @ a1b2c3d · FCM @ 2026-08-04",
    state:"last-known-good",
    validation:"validated · no quarantined entries",
    note:"Catalogs refresh in the background (stale-while-revalidate). A fresh catalog does not prove entitlement.",
    changes:[
      { id:"ch1", kind:"material", text:"Sonnet 4.5 context limit raised to 200k (models.dev a1b2c3d)", date:"2026-08-04" },
      { id:"ch2", kind:"removed-free", text:"Promo-X free tier reclassified to paid; included usage exhausted. Add an API key to continue.", date:"2026-07-30" }
    ]
  };

  /* Free-model setup flow steps (packet 02) */
  PM_DEMO.freeModelSetup = {
    modelId:"free-needs-setup",
    steps:[
      { id:"account", title:"Create account", detail:"Sign up at the provider; choose the free tier.", kind:"external" },
      { id:"credential", title:"Create credential", detail:"Generate an API key in the provider dashboard.", kind:"external" },
      { id:"scopes", title:"Required scopes", detail:"Allow: models:read, models:invoke. No billing scopes needed.", kind:"info" },
      { id:"verify", title:"Verify", detail:"PM runs a safe probe (readiness check, not a real generation).", kind:"pm" },
      { id:"quota", title:"Quota caveats", detail:"Free · rate-limited to 60/hour · promotional · data-sharing may apply.", kind:"warn" },
      { id:"return", title:"Return to model", detail:"Reopens the originating model row with the new route attached.", kind:"pm" }
    ]
  };

  /* roles (packet 02) */
  PM_DEMO.roles = [
    { id:"main", name:"Main Assistant", model:"Sonnet 4.5", route:"Claude — Work", effective:"Sonnet 4.5", diff:false },
    { id:"prd", name:"PRD / Planning", model:"Opus 5", route:"Claude — Work", effective:"Opus 5", diff:false,
      note:"Must stay high-quality." },
    { id:"goal", name:"Goal worker", model:"Opus 5", route:"Claude — Work", effective:"Opus 5", diff:false },
    { id:"verify", name:"Verifier / Auditor", model:"GPT-5", route:"OpenAI — Personal", effective:"GPT-5", diff:false },
    { id:"vision", name:"Vision / media analysis", model:"Vega", route:"Antigravity CLI", effective:"—", diff:true,
      effNote:"Requested Vega; effective — because Antigravity is signed out. Fallback applied." },
    { id:"research", name:"Background research", model:"GLM-5.2 (free route)", route:"Free — keyless", effective:"GLM-5.2 (free route)", diff:false }
  ];

  /* ----- MEMORY (packet 03) — Gists with half-life (fade, not expire) ----- */
  PM_DEMO.memory = [
    { id:"g1", text:"Prefers concise summaries over step-by-step walkthroughs.", kind:"preference",
      verified:true, scope:"project", half:"12d", strength:0.82, pinned:true, source:"thread 2026-07-19", versions:3 },
    { id:"g2", text:"Uses zsh; aliases gs=git status.", kind:"preference",
      verified:true, scope:"project", half:"30d", strength:0.94, pinned:false, source:"observed · shell", versions:1 },
    { id:"g3", text:"Rejects generated images that include watermarks.", kind:"preference",
      verified:false, scope:"thread", half:"6d", strength:0.41, pinned:false, source:"awaiting review", versions:1 },
    { id:"g4", text:"Project uses trunk-based development with short-lived branches.", kind:"project",
      verified:true, scope:"project", half:"60d", strength:0.97, pinned:true, source:"AGENTS.md", versions:2 },
    { id:"g5", text:"Old: preferred Tailwind — faded from active context.", kind:"preference",
      verified:true, scope:"project", half:"12d", strength:0.12, pinned:false, source:"half-life fade", versions:4 }
  ];

  /* ----- PERSONAS (packet 03) ----- */
  PM_DEMO.personas = [
    { id:"assistant", name:"Assistant", role:"Assistant", scope:"global default", desc:"The default high-quality helper.",
      capsule:"Concise, direct, asks before risky actions.", eligible:true, childOnly:false },
    { id:"collab", name:"Pair Programmer", role:"Collaborator", scope:"project default", desc:"Reviews and pushes back.",
      capsule:"Reads code first; suggests alternatives; explains tradeoffs.", eligible:true, childOnly:false },
    { id:"deep", name:"Deep Researcher", role:"Researcher/Deep Researcher", scope:"turn", desc:"Thorough, source-backed.",
      capsule:"Cites sources; distinguishes verified vs likely; never speculates.", eligible:true, childOnly:false },
    { id:"overseer", name:"Overseer", role:"Overseer", scope:"goal", desc:"Coordinates multi-step goals.",
      capsule:"Plans waves; reserves synthesis; reports effective vs requested.", eligible:true, childOnly:false },
    { id:"teacher", name:"Teacher", role:"Teacher", scope:"thread", desc:"Explains as it goes.",
      capsule:"Adds small lessons; checks understanding.", eligible:true, childOnly:false },
    { id:"child-only-1", name:"Junior Reviewer", role:"Reviewer", scope:"child only", desc:"Child-only; not a chat default.",
      capsule:"Light review pass.", eligible:true, childOnly:true }
  ];

  /* ----- CREW (packet 03) — Orchestrator-owned, requested vs effective ----- */
  PM_DEMO.crews = [
    { id:"crew-1", name:"Spec-to-PR", purpose:"Turn a spec into a reviewed pull request.",
      membersReq:5, membersEff:2, queued:3, policy:"adaptive",
      concurrencyReq:5, concurrencyEff:2, routePolicy:"strict",
      guard:"Usage reserve kept for synthesis + verification.",
      composition:[
        { role:"Planner", persona:"Overseer", model:"Opus 5", state:"admitted" },
        { role:"Coder", persona:"Pair Programmer", model:"Sonnet 4.5", state:"admitted" },
        { role:"Reviewer", persona:"Deep Researcher", model:"GPT-5", state:"queued" },
        { role:"Tester", persona:"Teacher", model:"Sonnet 4.5", state:"queued" },
        { role:"Verifier", persona:"Overseer", model:"Opus 5", state:"queued" }
      ] },
    { id:"crew-2", name:"Research Digest", purpose:"Produce a cited research digest.",
      membersReq:3, membersEff:3, queued:0, policy:"strict",
      concurrencyReq:3, concurrencyEff:3, routePolicy:"strict",
      guard:"Sources cited; no speculation.",
      composition:[
        { role:"Researcher", persona:"Deep Researcher", model:"GLM-5.2 (free route)", state:"admitted" },
        { role:"Editor", persona:"Teacher", model:"Sonnet 4.5", state:"admitted" },
        { role:"Citer", persona:"Deep Researcher", model:"GPT-5", state:"admitted" }
      ] }
  ];

  /* ----- CONTEXT (packet 03) ----- */
  PM_DEMO.contextSources = {
    admitted:[
      { id:"prev-chats", label:"Relevant previous chats", on:true, note:"2 threads matched" },
      { id:"project-code", label:"Relevant project code", on:true, note:"17 files" },
      { id:"agents-md", label:"Scoped AGENTS.md", on:true, note:"chain resolved" },
      { id:"current-attempt", label:"Current attempt journal", on:true, note:"turn 4" }
    ],
    omitted:[
      { id:"logs", label:"Relevant logs", on:false, note:"omitted: budget" },
      { id:"parent-handoff", label:"Parent-agent handoff", on:false, note:"omitted: no parent" }
    ]
  };

  /* ----- MCP (packet 04) ----- */
  PM_DEMO.mcp = [
    { id:"mcp-fs", name:"filesystem", transport:"stdio", scope:"project", health:"ok",
      tools:8, exposed:3, approval:"persistent", last:"2 min ago" },
    { id:"mcp-web", name:"web-search", transport:"http", scope:"global", health:"ok",
      tools:3, exposed:3, approval:"session", last:"just now" },
    { id:"mcp-db", name:"postgres", transport:"stdio", scope:"project", health:"warn",
      tools:12, exposed:0, approval:"once", last:"reconnect failed",
      note:"Reconnect failed; 12 tools not exposed." }
  ];

  /* ----- LSP (packet 04) ----- */
  PM_DEMO.lsp = [
    { id:"lsp-rust", name:"rust-analyzer", lang:"Rust", ver:"2026-07", mode:"auto", health:"ok", scope:"workspace", conflicts:0 },
    { id:"lsp-py", name:"pyright", lang:"Python", ver:"1.1.3", mode:"auto", health:"ok", scope:"workspace", conflicts:0 },
    { id:"lsp-ts", name:"typescript-language-server", lang:"TypeScript", ver:"4.3", mode:"auto", health:"warn", scope:"workspace", conflicts:1,
      note:"Formatting ownership conflict with Prettier." }
  ];

  /* ----- SKILLS / PLUGINS / TOOLS / COMMANDS (packet 04) — four distinct kinds ----- */
  PM_DEMO.skills = [
    // Skills: discover/install/update, source, permissions, trust, scope
    { id:"sk-1", name:"pm-bootstrap-ledger", kind:"skill", enabled:true, trust:"trusted", scope:"project", source:"local",
      perms:["read:Plans/**","write:Plans/ledgers/**"], update:"current" },
    { id:"sk-2", name:"frontend-design", kind:"skill", enabled:true, trust:"trusted", scope:"global", source:"marketplace",
      perms:["read:Concepts/**"], update:"current" },
    { id:"sk-3", name:"overdrive", kind:"skill", enabled:false, trust:"review", scope:"project", source:"marketplace",
      perms:["read:Concepts/**","write:scratchpad/**"], update:"available" },
    // Plugins: lifecycle, compatibility, requested permissions, update channel, failure state
    { id:"pl-1", name:"pdf-tools", kind:"plugin", enabled:true, trust:"review", scope:"global", source:"marketplace",
      compat:"PM ≥ 2026.7", channel:"stable", failure:"none", update:"available", perms:["read:*.pdf","write:*.docx"] },
    { id:"pl-2", name:"docx-export", kind:"plugin", enabled:true, trust:"trusted", scope:"project", source:"marketplace",
      compat:"PM ≥ 2026.6", channel:"stable", failure:"none", update:"current", perms:["write:*.docx"] },
    { id:"pl-3", name:"legacy-bridge", kind:"plugin", enabled:false, trust:"untrusted", scope:"global", source:"local",
      compat:"incompatible (needs PM ≤ 2025.x)", channel:"none", failure:"failed to load: API mismatch", update:"none", perms:[] },
    // Tools: installed / project-enabled / currently-available / selected-for-turn / actually-invoked
    { id:"tool-1", name:"ripgrep", kind:"tool", scope:"workspace", source:"system",
      installed:true, projectEnabled:true, available:true, selected:false, invoked:"6 min ago",
      risk:"read-only", trust:"trusted" },
    { id:"tool-2", name:"shell-exec", kind:"tool", scope:"project", source:"system",
      installed:true, projectEnabled:true, available:true, selected:true, invoked:"2 min ago",
      risk:"elevated", trust:"review", policy:"confirm on write outside workspace" },
    { id:"tool-3", name:"browser-control", kind:"tool", scope:"project", source:"plugin:browser-use",
      installed:true, projectEnabled:false, available:false, selected:false, invoked:"never",
      risk:"network + automation", trust:"review" },
    // Commands: search, shortcuts, conflicts, remap, reset, custom lifecycle
    { id:"cmd-1", name:"/seal", kind:"command", enabled:true, scope:"project", source:"custom", shortcut:"⌘⇧S", conflicts:[] },
    { id:"cmd-2", name:"/compile", kind:"command", enabled:true, scope:"global", source:"builtin", shortcut:"⌘⇧C", conflicts:["/compile (PM6 plugin)"] },
    { id:"cmd-3", name:"/audit", kind:"command", enabled:true, scope:"global", source:"builtin", shortcut:"", conflicts:[] }
  ];

  /* ----- TERMINAL (packet 04) ----- */
  PM_DEMO.terminals = [
    { id:"t-default", name:"Default", shell:"zsh", font:"SF Mono", fontFallback:"Menlo, monospace", size:13, lineheight:1.4,
      fg:"#e7e9ed", bg:"#15171b", opacity:0.92, cursor:"block", blink:false, copyLinks:true, cwd:"~",
      env:"inherit", retention:"90 days", default:true,
      ansi:["#000","#c00","#0a0","#aa0","#05f","#a0a","#0aa","#aaa","#555","#f55","#5f5","#ff5","#5cf","#f5f","#5ff","#fff"] },
    { id:"t-build", name:"Build", shell:"bash", font:"JetBrains Mono", fontFallback:"Cascadia Code, monospace", size:12, lineheight:1.3,
      fg:"#c8f7d0", bg:"#0e0e0e", opacity:1.0, cursor:"bar", blink:true, copyLinks:false, cwd:"project",
      env:"minimal", retention:"30 days", default:false,
      ansi:["#000","#e55","#5d5","#df5","#5af","#d5d","#5dd","#fff","#444","#f77","#7f7","#ff7","#7cf","#fff","#7ff","#fff"] }
  ];

  /* ----- MEDIA (packet 02) ----- */
  PM_DEMO.media = [
    { id:"media-img", name:"Image studio", route:"Generation", caps:["image"], native:false, transformed:true, policy:"open", cost:"credits", fallback:"Free route" },
    { id:"media-tts", name:"Narration", route:"Text to speech", caps:["audio"], native:true, transformed:false, policy:"open", cost:"included", fallback:"—" },
    { id:"media-vid", name:"Clip render", route:"Video", caps:["video"], native:true, transformed:true, policy:"review", cost:"credits", fallback:"—" }
  ];

  /* ----- HOME NOTICES (packet 01: needs-attention / continue-setup / recommended) ----- */
  PM_DEMO.notices = {
    attention: [
      { id:"n1", headline:"Claude API key cannot run a model probe", consequence:"Routing will skip this connection until it recovers.",
        action:"Reconnect", actionKind:"primary", secondary:"View logs", kind:"bad",
        target:"agents.accounts" }
    ],
    continue: [
      { id:"n2", headline:"Finish setting up Antigravity CLI", consequence:"Unlocks Vega for vision/media routes.",
        action:"Continue setup", actionKind:"primary", secondary:"Dismiss", kind:"warn",
        target:"agents.accounts" }
    ],
    recommended: [
      { id:"n3", headline:"Try Goal Mode reserve", consequence:"Keep budget for synthesis and verification on long Goals.",
        action:"Enable reserve", actionKind:"primary", secondary:"Learn more", kind:"info",
        target:"planning.goal" }
    ]
  };

  /* ----- PRIMARY DESTINATIONS (packet 01: places, not filters) ----- */
  PM_DEMO.destinations = [
    { id:"agents", title:"Agents & Models", purpose:"Providers, accounts, connections, models, and roles.",
      status:"3 connected · 1 needs attention", statusKind:"warn", target:"agents", manager:"pam" },
    { id:"context", title:"Context & Memory", purpose:"What enters each turn, and for how long.",
      status:"5 Gists active", statusKind:"ok", target:"context", manager:"context" },
    { id:"planning", title:"Goals & Automation", purpose:"PRD, Goal Mode, testing, and verification.",
      status:"Reserve on", statusKind:"info", target:"planning.goal" },
    { id:"git", title:"Git & Crew", purpose:"Version control, worktrees, and multi-agent Crew.",
      status:"2 Crew templates", statusKind:"ok", target:"git", manager:"crew" },
    { id:"extensions", title:"MCP, Skills & Tools", purpose:"Servers, skills, plugins, tools, and commands.",
      status:"1 unhealthy", statusKind:"warn", target:"extensions", manager:"mcp" },
    { id:"media", title:"Media Providers", purpose:"Image, audio, and video routes.",
      status:"3 routes", statusKind:"ok", target:"media", manager:"media" },
    { id:"appearance", title:"Appearance & Motion", purpose:"Theme, layout, density, input.",
      status:"Friendly · Dark", statusKind:"neutral", target:"appearance" },
    { id:"system", title:"System & Diagnostics", purpose:"Health, logs, backups, advanced.",
      status:"Degraded", statusKind:"warn", target:"system" }
  ];

  /* default shell + theme state */
  PM_DEMO.initialState = {
    theme: "friendly-dark",
    reducedMotion: false,
    density: "comfortable",
    rail: "open",
    chat: "closed"
  };

  /* THEMES list (for theme pickers inside concepts) */
  PM_DEMO.themes = [
    { id:"friendly-dark",  family:"Friendly", mode:"Dark" },
    { id:"friendly-light", family:"Friendly", mode:"Light" },
    { id:"glass-dark",    family:"Glass",   mode:"Dark" },
    { id:"glass-light",   family:"Glass",   mode:"Light" },
    { id:"retro-dark",    family:"Retro",   mode:"Dark" },
    { id:"retro-light",   family:"Retro",   mode:"Light" },
    { id:"basic-dark",    family:"Basic",   mode:"Dark" },
    { id:"basic-light",   family:"Basic",   mode:"Light" }
  ];
})();

/* ===== FINAL CUMULATIVE PACKET EXTENSION (2026-08-08) =====
   Adds the remaining manager families so the four concepts COLLECTIVELY prove the
   complete MANAGER_COVERAGE_MATRIX. Baseline data above is kept intact; this block
   only ADDS subcategories, manager registry entries, family data, the PAM installation
   lifecycle fixtures, and an ownerConcept map. Shared by all four concepts. */
(function () {
  "use strict";
  var D = window.PM_DEMO;

  /* ----- OWNERSHIP: which concept deeply demonstrates each family ----- */
  D.ownerConcept = {
    pam:"all",
    context:"c1", memory:"c1", personas:"c1", goal:"c1", crew:"c1", permissions:"c1", bsd:"c1",
    notifications:"c2", sounds:"c2", appearance:"c2", spellcheck:"c2", desktop:"c2", teacher:"c2",
    filemanager:"c3", terminal:"c3", lsp:"c3", formatters:"c3", commands:"c3", mcp:"c3", skills:"c3", testing:"c3",
    storage:"c4", backup:"c4", settingsLifecycle:"c4", history:"c4", artifacts:"c4",
    sourcecontrol:"c4", github:"c4", containers:"c4", webfetch:"c4", searchindex:"c4", cleanup:"c4", server:"c4",
    media:"none"
  };
  /* concept display meta for owned-family strips + coverage registers */
  D.concepts = {
    "c1": { id:"concept-01-control-room", name:"Control Room",  families:["context","memory","personas","goal","crew","permissions","bsd"] },
    "c2": { id:"concept-02-atlas",        name:"Atlas",         families:["notifications","sounds","appearance","spellcheck","desktop","teacher"] },
    "c3": { id:"concept-03-stack",        name:"Stack",         families:["filemanager","terminal","lsp","formatters","commands","mcp","skills","testing"] },
    "c4": { id:"concept-04-stream",       name:"Stream",        families:["storage","backup","settingsLifecycle","history","artifacts","sourcecontrol","github","containers","webfetch","searchindex","cleanup","server"] }
  };

  /* ----- register a subcategory (+ optional manager binding) ----- */
  function addSub(catId, sub) {
    var cat = D.catById[catId]; if (!cat) return;
    cat.sub.push(sub); sub.cat = catId;
    D.subById[catId + "." + sub.id] = sub;
    if (sub.manager && D.managers[sub.manager]) D.managers[sub.manager].managerCat = catId;
    var key = catId + "." + sub.id;
    if (!D.settingsBySub[key]) D.settingsBySub[key] = [
      { id: key + ".placeholder", label:"Managed in a dedicated surface", expl:"Open the " + sub.title + " manager for inventory, status, requested/effective state, and logs.",
        type:"readonly", value:"—", state:"default", source:"Default", exposure:"standard" }
    ];
  }

  /* ----- NEW MANAGER REGISTRY ENTRIES ----- */
  var MREG = {
    personas: { title:"Personas",              managerCat:"agents",   icon:"users",   ownerConcept:"c1" },
    goal:     { title:"Goals & Automation",     managerCat:"planning", icon:"target",  ownerConcept:"c1" },
    permissions:{ title:"Permissions & FileSafe", managerCat:"permissions", icon:"shield", ownerConcept:"c1" },
    bsd:      { title:"Back Seat Driver",       managerCat:"planning", icon:"bsd",     ownerConcept:"c1" },
    notifications:{ title:"Notifications & Sounds", managerCat:"general", icon:"bell",  ownerConcept:"c2" },
    sounds:   { title:"Sound Library",          managerCat:"general",  icon:"sound",   ownerConcept:"c2" },
    appearance:{ title:"Appearance",            managerCat:"appearance", icon:"palette", ownerConcept:"c2" },
    spellcheck:{ title:"Spellcheck & Dictionaries", managerCat:"appearance", icon:"spellcheck", ownerConcept:"c2" },
    desktop:  { title:"Desktop, Tray & Window", managerCat:"general",  icon:"desktop", ownerConcept:"c2" },
    teacher:  { title:"Teacher & Help",         managerCat:"general",  icon:"teacher", ownerConcept:"c2" },
    filemanager:{ title:"File Manager & Editor", managerCat:"code",    icon:"folder",  ownerConcept:"c3" },
    formatters:{ title:"Formatters",            managerCat:"code",     icon:"format",  ownerConcept:"c3" },
    commands: { title:"Commands & Shortcuts",   managerCat:"code",     icon:"command", ownerConcept:"c3" },
    testing:  { title:"Testing & Debug",        managerCat:"planning", icon:"beaker",  ownerConcept:"c3" },
    storage:  { title:"Storage & Retention",    managerCat:"system",   icon:"database", ownerConcept:"c4" },
    backup:   { title:"Backup & Restore",       managerCat:"system",   icon:"archive", ownerConcept:"c4" },
    settingsLifecycle:{ title:"Settings Lifecycle", managerCat:"system", icon:"lifecycle", ownerConcept:"c4" },
    history:  { title:"History & Sessions",     managerCat:"system",   icon:"history", ownerConcept:"c4" },
    artifacts:{ title:"Runtime Artifacts",      managerCat:"system",   icon:"package", ownerConcept:"c4" },
    sourcecontrol:{ title:"Source Control & Worktrees", managerCat:"git", icon:"branch", ownerConcept:"c4" },
    github:   { title:"GitHub Actions",         managerCat:"git",      icon:"github",  ownerConcept:"c4" },
    containers:{ title:"Containers & Registries", managerCat:"system", icon:"container", ownerConcept:"c4" },
    webfetch: { title:"Web, Search & Fetch",    managerCat:"system",   icon:"globe",   ownerConcept:"c4" },
    searchindex:{ title:"Project Search Index", managerCat:"system",   icon:"searchindex", ownerConcept:"c4" },
    cleanup:  { title:"Workspace Cleanup",      managerCat:"system",   icon:"broom",   ownerConcept:"c4" },
    server:   { title:"Server & Execution Hosts", managerCat:"system", icon:"server",  ownerConcept:"c4" }
  };
  Object.keys(MREG).forEach(function (id) {
    if (!D.managers[id]) D.managers[id] = Object.assign({ id:id }, MREG[id]);
    else Object.assign(D.managers[id], MREG[id]);
  });
  D.managers.pam.ownerConcept = "all";
  D.managers.context.ownerConcept = "c1"; D.managers.memory.ownerConcept = "c1"; D.managers.crew.ownerConcept = "c1";
  D.managers.mcp.ownerConcept = "c3"; D.managers.skills.ownerConcept = "c3";
  D.managers.lsp.ownerConcept = "c3"; D.managers.terminal.ownerConcept = "c3"; D.managers.media.ownerConcept = "none";

  /* ----- NEW SUBCATEGORIES ----- */
  addSub("agents",      { id:"personas",   title:"Personas",            manager:"personas" });
  addSub("permissions", { id:"rules",      title:"Rules & FileSafe",    manager:"permissions" });
  addSub("planning",    { id:"automation", title:"Goal & automation",   manager:"goal" });
  addSub("planning",    { id:"bsd",        title:"Back Seat Driver",    manager:"bsd" });
  addSub("general",     { id:"notifications", title:"Notifications & Sounds", manager:"notifications" });
  addSub("general",     { id:"sounds",     title:"Sound library",       manager:"sounds" });
  addSub("general",     { id:"desktop",    title:"Desktop, tray & window", manager:"desktop" });
  addSub("general",     { id:"teacher",    title:"Teacher & help",      manager:"teacher" });
  addSub("appearance",  { id:"customize",  title:"Custom themes",       manager:"appearance" });
  addSub("appearance",  { id:"dictionaries", title:"Dictionaries",      manager:"spellcheck" });
  addSub("code",        { id:"files",      title:"File manager & editor", manager:"filemanager" });
  addSub("code",        { id:"formatters", title:"Formatters",          manager:"formatters" });
  addSub("code",        { id:"commands",   title:"Commands & shortcuts", manager:"commands" });
  addSub("planning",    { id:"debug",      title:"Testing & debug",     manager:"testing" });
  addSub("git",         { id:"source-control", title:"Source control",  manager:"sourcecontrol" });
  addSub("git",         { id:"github",     title:"GitHub Actions",      manager:"github" });
  addSub("system",      { id:"storage",    title:"Storage & retention", manager:"storage" });
  addSub("system",      { id:"backup",     title:"Backup & restore",    manager:"backup" });
  addSub("system",      { id:"lifecycle",  title:"Settings lifecycle",  manager:"settingsLifecycle" });
  addSub("system",      { id:"history-mgr",title:"History & sessions",  manager:"history" });
  addSub("system",      { id:"artifacts",  title:"Runtime artifacts",   manager:"artifacts" });
  addSub("system",      { id:"containers", title:"Containers & registries", manager:"containers" });
  addSub("system",      { id:"web",        title:"Web, search & fetch", manager:"webfetch" });
  addSub("system",      { id:"search-index", title:"Project search index", manager:"searchindex" });
  addSub("system",      { id:"cleanup",    title:"Workspace cleanup",   manager:"cleanup" });
  addSub("system",      { id:"server",     title:"Server & execution hosts", manager:"server" });

  /* ----- FAMILY DATA (uniform shape consumed by M.resRow) -----
     row: { title, dot, chips:[{label,kind}], detail, note:{text,kind}, actions:[{label,act,kind,icon}] } */
  function R(title, dot, chips, detail, note, actions){ return {title:title, dot:dot, chips:chips, detail:detail, note:note, actions:actions}; }
  function C(label,kind){ return {label:label, kind:kind||""}; }
  function A(label,act,kind,icon){ return {label:label, act:act, kind:kind||"ghost", icon:icon||""}; }

  /* C1 — Context / Memory / Personas / Goal / Crew / Permissions / BSD */
  D.goalRows = [
    R("Goal worker route","ok",[C("Requested Opus 5"),C("Effective Opus 5","ok")],"High-quality conversational planning route.","",[A("Edit","edit"),A("History","logs")]),
    R("Reviewer route","warn",[C("Requested GPT-5"),C("Effective GPT-5 (4o fallback)","warn")],"Fallback applied — OpenAI — Personal rate window.","",[A("Why","details"),A("Edit","edit")]),
    R("Sustainable fan-out","info",[C("Ceiling 8"),C("Effective 2 now","warn")],"Three waves recommended before provider reset.","",[A("Plan","details")]),
    R("Capacity reserve","ok",[C("On")],"Keep budget for synthesis and verification.","",[A("Adjust","edit")]),
    R("Checkpoint + compact","ok",[C("Auto")],"Checkpoint long Goals; compact context safely.","",[A("Policy","edit")]),
    R("Cross-project policy","neutral",[C("Off")],"Children may not read other projects by default.","",[A("Edit","edit")])
  ];
  D.permissionRows = [
    R("Global wildcard default","ok",[C("Ask")],"Default approval before any consequential act.","",[A("Edit","edit")]),
    R("Ordered rules (last-match-wins)","info",[C("7 rules")],"Granular globs evaluated bottom-up; reorderable.","",[A("Reorder","edit"),A("Test","test")]),
    R("Per-tool overrides","ok",[C("shell-exec: confirm on write outside workspace")],"Elevated tools keep an explicit policy.","",[A("Edit","edit")]),
    R("External-directory allowlist","warn",[C("2 paths")],"Read-only by default; write needs approval.","",[A("Manage","edit")]),
    R("Doom-loop threshold","info",[C("8 repeated acts then pause")],"Stops tight tool-loop burn.","",[A("Adjust","edit")]),
    R("FileSafe floor","ok",[C("Enforced"),C("Non-bypassable","accent")],"Protected scopes: **/.env, **/secrets/**. Health OK.","",[A("Repair","details"),A("View","logs")]),
    R("Per-Persona profiles","info",[C("3 profiles")],"Tighter scope for Reviewer/Researcher personas.","",[A("Matrix","details")])
  ];
  D.bsdRows = [
    R("Back Seat Driver mode","ok",[C("Auto (default)")],"Runs only when risk/phase triggers justify it.","",[A("On","enable"),A("Off","edit")]),
    R("Route","info",[C("Reviewer persona")],"Read-only observation of in-flight work.","",[A("Edit","edit")]),
    R("Risk / phase triggers","ok",[C("Risky writes, long Goals")],"Auto engages on elevation and long-running work.","",[A("Edit","edit")]),
    R("Usage guard","ok",[C("Bounded deltas")],"Receives bounded deltas; cannot widen authority.","",[A("Policy","edit")]),
    R("Latency budget","info",[C("Up to 400ms")],"Never blocks primary work on its own failure.","",[A("Adjust","edit")]),
    R("Privacy boundary","ok",[C("No prompt exfiltration")],"Cannot ship turns or secrets off-host.","",[A("Details","details")]),
    R("Health","warn",[C("1 review pending")],"Chat may override BSD for one turn or thread.","",[A("Logs","logs")])
  ];

  /* C2 — Notifications / Sounds / Appearance / Spellcheck / Desktop / Teacher */
  D.notificationRows = [
    R("In-app title-bar stack","ok",[C("In-app"),C("Default surface")],"Sole in-app notification affordance.","",[A("Test","test"),A("Edit","edit")]),
    R("System / tray","ok",[C("Tray")],"Native OS notifications.","",[A("Test","test"),A("Edit","edit")]),
    R("Slack","ok",[C("channel: #pm-alerts"),C("mentions: @here")],"Template + parse mode configured.","",[A("Test","test"),A("Logs","logs")]),
    R("Discord","ok",[C("channel: 1234")],"Webhook with success predicate.","",[A("Test","test"),A("Edit","edit")]),
    R("Generic webhook","bad",[C("failing"),C("retry 3")],"Endpoint returning 502 — receipted.","",[A("Retry","reconnect", "primary"),A("Logs","logs")]),
    R("ntfy","ok",[C("topic: pm"),C("priority: high")],"Tags + click target set.","",[A("Test","test")]),
    R("Pushover","neutral",[C("Disabled")],"Paused by user.","",[A("Enable","enable","primary")]),
    R("Telegram","ok",[C("bot"),C("thread: 42")],"Rate-limited test-send only.","",[A("Test","test"),A("Edit","edit")])
  ];
  D.notificationMeta = { quiet:"Focus on from 22:00 to 07:00", routing:"12 events routed; sound is never the only signal" };
  D.soundRows = [
    R("Soft chime (built-in)","ok",[C("Built-in"),C("0.9s")],"Default for completion.","",[A("Preview","preview","primary"),A("Map","edit")]),
    R("ping-uploaded.wav","ok",[C("Uploaded"),C("CC0"),C("1.2s"),C("sha 4a91")],"Source + license + hash recorded.","",[A("Preview","preview","primary"),A("Replace","edit"),A("Export","export")]),
    R("PeonPing Pack","ok",[C("Imported pack"),C("format ok"),C("license verified")],"PeonPing/OpenPeon-compatible; format + license checked.","",[A("Preview","preview","primary"),A("Details","details")]),
    R("OpenPeon community","warn",[C("Imported pack"),C("unverified")],"License missing — not bundled until verified.","",[A("Verify","reconnect","primary"),A("Remove","delete")]),
    R("legacy-bell.wav","bad",[C("Unverified"),C("no license")],"Rejected on import; local preview only.","",[A("Preview","preview"),A("Discard","delete")])
  ];
  D.soundMeta = { master:"Master volume 80%", mappings:"9 events mapped; per-event plus master" };
  D.appearanceRows = [
    R("Theme family plus mode","ok",[C("Friendly"),C("Dark"),C("Auto-follow OS: on")],"Four families, light/dark/auto.","",[A("Preview","preview","primary"),A("Apply","apply")]),
    R("Custom TOML theme — dusk","ok",[C("Valid"),C("inherits Glass")],"Schema-validated; base-theme inheritance.","",[A("Edit","edit"),A("Export","export")]),
    R("Custom TOML theme — draft","bad",[C("Invalid: bad color token")],"Falls back to base; diagnosis shown.","",[A("Diagnose","details","primary"),A("Open folder","open")]),
    R("Custom and fallback fonts","info",[C("Cal Sans / Quicksand")],"Per-family font overrides.","",[A("Edit","edit")]),
    R("UI scale","info",[C("110%")],"Live hover preview; restart marker on extremes.","",[A("Adjust","edit")]),
    R("Live reload","ok",[C("On")],"Startup load plus live reload of custom themes.","",[A("Toggle","enable")]),
    R("Restart markers","neutral",[C("None pending")],"Some appearance changes need a restart.","",[A("Details","details")])
  ];
  D.spellcheckRows = [
    R("Check spelling","ok",[C("On")],"Quiet underline in prose fields.","",[A("Toggle","enable")]),
    R("Language","info",[C("Automatic")],"Detects per field.","",[A("Edit","edit")]),
    R("Dictionary source","info",[C("Automatic: OS service then PM local")],"No autocorrect — ever.","",[A("Configure","edit")]),
    R("Personal dictionary","ok",[C("214 words")],"Add via right-click in any field.","",[A("Manage","edit")]),
    R("Project dictionary","warn",[C("Use when available")],"Project list not found here.","",[A("Manage","edit")]),
    R("Check technical prose","ok",[C("On")],"Skips code, paths, identifiers.","",[A("Toggle","enable")]),
    R("Language packs","neutral",[C("2 installed: en-US, en-GB")],"Add more language packs.","",[A("Add","add")])
  ];
  D.desktopRows = [
    R("Minimize / close to tray","ok",[C("On")],"Hides window while automation runs.","",[A("Toggle","enable")]),
    R("Tray state while automation runs","info",[C("Badge: running")],"Pause/Resume/Quit from the tray.","",[A("Configure","edit")]),
    R("Launch destination","ok",[C("Last workspace")],"Where PM opens on launch.","",[A("Edit","edit")]),
    R("Window / panel / tab restore","ok",[C("Restore")],"Reopens prior layout.","",[A("Policy","edit")]),
    R("Crash recovery","ok",[C("Auto-resume")],"Restores unsaved buffers on relaunch.","",[A("Test","test")]),
    R("Unsaved buffer protection","warn",[C("1 buffer unrecovered")],"Prompts before destructive close.","",[A("Review","details")]),
    R("Activity bar reorder / hide / overflow","ok",[C("Custom order")],"Rail items reorderable; overflow folds.","",[A("Edit","edit")]),
    R("Side-panel restore","ok",[C("Per workspace")],"Remembers open/narrow/wide per space.","",[A("Edit","edit")]),
    R("Editor / tab / tree limits","info",[C("tabs: 12, tree: 8k nodes")],"Bounds prevent UI stall on big projects.","",[A("Adjust","edit")])
  ];
  D.teacherRows = [
    R("Teacher assistance","ok",[C("On")],"Guided explanation beyond tooltips.","",[A("Toggle","enable")]),
    R("Explain this screen","info",[C("On this screen: Settings Home")],"Teacher narrates the active surface.","",[A("Explain","run","primary")]),
    R("Guided transitions","ok",[C("On")],"Walks safe transitions into real actions.","",[A("Configure","edit")]),
    R("Tooltip detail","info",[C("Standard")],"What changes / when it takes effect / side effects.","",[A("Adjust","edit")]),
    R("Grammar and style assistance","neutral",[C("Opt-in: provider-backed")],"Separate feature; privacy, route, cost disclosed.","",[A("Configure","details")])
  ];

  /* C3 — File Manager / Terminal / LSP / Formatters / Commands / MCP / Skills / Testing */
  D.filemanagerRows = [
    R("Tree behavior","ok",[C("Virtualized, lazy")],"Handles large trees without blocking.","",[A("Configure","edit")]),
    R("Drag / drop","ok",[C("Workspace only")],"External drop asks; FileSafe enforced.","",[A("Policy","edit")]),
    R("Hidden / ignored","ok",[C("respects .gitignore")],"Plus user ignore globs.","",[A("Edit","edit")]),
    R("Large-file threshold","info",[C("5 MB then hex preview")],"Avoids loading huge blobs into the editor.","",[A("Adjust","edit")]),
    R("Tabs and split groups","ok",[C("4 groups")],"Per-group focus; max-tabs limit applies.","",[A("Configure","edit")]),
    R("Changed on disk","warn",[C("2 files changed externally")],"Reload / keep / compare offered.","",[A("Review","details","primary")]),
    R("Recovery and transient","warn",[C("1 transient: network mount unmounted")],"Unavailable reasons shown; not hidden.","",[A("Details","details")])
  ];
  D.formatterRows = [
    R("Global formatting","ok",[C("On")],"Single ownership per language.","",[A("Toggle","enable")]),
    R("rustfmt","ok",[C("Detected"),C("Rust"),C("edition 2024")],"command + env + extensions set.","",[A("Test","test"),A("Edit","edit")]),
    R("Prettier","warn",[C("Detected"),C("conflict w/ TS LSP")],"Formatting ownership conflict — resolve.","",[A("Resolve","reconnect","primary"),A("Logs","logs")]),
    R("black","ok",[C("Detected"),C("Python"),C("line-length 100")],"command + env set.","",[A("Test","test")]),
    R("shfmt","bad",[C("Not found")],"Install to enable shell formatting.","",[A("Install","add","primary")]),
    R("Custom formatter","info",[C("go: goreturns")],"Add / remove / reset; Global/Project scope.","",[A("Edit","edit")])
  ];
  D.commandRows = [
    R("/seal","ok",[C("Custom"),C("Cmd+Shift+S"),C("project")],"Parameters + includes; shell-safety checked.","",[A("Edit","edit"),A("Dry-run","run","primary")]),
    R("/compile","warn",[C("Built-in"),C("Cmd+Shift+C"),C("conflict: PM6 plugin")],"Shortcut conflict — remap.","",[A("Remap","edit","primary"),A("Reset","test")]),
    R("/audit","ok",[C("Built-in"),C("global"),C("no shortcut")],"Validation passes.","",[A("Bind","edit")]),
    R("/deploy","ok",[C("Custom"),C("Cmd+D"),C("project")],"Dry-run preview never sends to an agent.","",[A("Dry-run","run","primary"),A("Edit","edit")]),
    R("Shortcuts","info",[C("Cheat sheet"),C("import / export")],"Search, remap, reset, import, export.","",[A("Cheat sheet","details"),A("Import","add")])
  ];
  D.testingRows = [
    R("Unit / integration","ok",[C("Auto")],"Runs with verification.","",[A("Configure","edit")]),
    R("Built-in browser","ok",[C("On")],"PM-native Browser Program.","",[A("Configure","edit")]),
    R("Desktop / native","neutral",[C("Off")],"Off by default.","",[A("Enable","enable","primary")]),
    R("Hot reload / previews","ok",[C("On")],"Live preview capture.","",[A("Configure","edit")]),
    R("Simulator / emulator / device","bad",[C("Unavailable"),C("no toolchain")],"Install a toolchain to enable.","",[A("Install","add","primary")]),
    R("API / database","ok",[C("Auto")],"Fixtures + teardown.","",[A("Configure","edit")]),
    R("Console / network","ok",[C("On")],"Captured per run.","",[A("Configure","edit")]),
    R("Performance / security / a11y","neutral",[C("Off")],"Opt-in deep checks.","",[A("Enable","enable","primary")]),
    R("DAP debugger","ok",[C("On")],"Persistent eval supported.","",[A("Configure","edit")]),
    R("Capture / artifacts","ok",[C("On")],"Bounded retention.","",[A("Configure","edit")])
  ];

  /* C4 — Storage / Backup / Lifecycle / History / Artifacts / Git / GitHub / Containers / Web / Index / Cleanup / Server */
  D.storageRows = [
    R("Storage mode","info",[C("Server-anchored")],"One Project Home Server; physical Project Vault.","",[A("Details","details")]),
    R("Retention","ok",[C("90-day default")],"Per-class retention windows.","",[A("Edit","edit")]),
    R("Legal hold","warn",[C("1 hold active")],"Managed; suspends deletion/compaction.","",[A("View","details")]),
    R("Pressure","warn",[C("78% used")],"Compaction suggested at 80%.","",[A("Compact","run","primary")]),
    R("Compaction","ok",[C("Idle, safe")],"Non-destructive; preserves receipts.","",[A("Run","run"),A("Logs","logs")]),
    R("Quarantine","info",[C("2 items quarantined")],"Untrusted artifacts isolated.","",[A("Review","details")]),
    R("Project / data deletion","bad",[C("Irreversible: receipt required")],"Double-confirm; evidence retained.","",[A("Policy","edit")]),
    R("Encryption","ok",[C("At rest"),C("in transit")],"Verified.","",[A("Details","details")]),
    R("Test restore","ok",[C("Last verified 2d ago")],"Periodic restore verification.","",[A("Run","test"),A("Receipt","logs")])
  ];
  D.backupRows = [
    R("Back Up Now","info",[C("Action")],"Creates a restore point immediately.","",[A("Back up","run","primary")]),
    R("Backup schedule","ok",[C("Daily at 02:00")],"Setting — when automatic backups run.","",[A("Edit","edit")]),
    R("Last backup","ok",[C("Status: today 02:00")],"Read-only projection.","",[A("Receipt","logs")]),
    R("Backup and Restore","info",[C("Manager")],"Dedicated surface for restore points.","",[A("Open","open")]),
    R("Open backup log","neutral",[C("Diagnostic")],"Receipted operation history.","",[A("Open","logs")])
  ];
  D.lifecycleRows = [
    R("Export settings","ok",[C("Action")],"Snapshot of current settings bundle.","",[A("Export","export","primary")]),
    R("Import settings","warn",[C("3 conflicts previewed")],"Merge or replace; preview before apply.","",[A("Preview","preview","primary"),A("Cancel","test")]),
    R("Reset to defaults","bad",[C("Destructive: preview first")],"Requires confirmation + receipt.","",[A("Preview","preview","primary")]),
    R("Copy Settings From","info",[C("Transactional, one-time")],"About ten broad categories; destination independent after.","",[A("Preview","preview","primary")]),
    R("Restore point","ok",[C("auto: pre-import")],"Atomic apply; rollback to snapshot.","",[A("Rollback","reconnect","primary"),A("Receipt","logs")]),
    R("Legacy-key migration","info",[C("2 keys remapped")],"Validation on load.","",[A("Details","details")])
  ];
  D.historyRows = [
    R("Project history","ok",[C("Filtered to this project")],"Compare / export / rebuild / archive.","",[A("Open","open")]),
    R("All-project history","info",[C("Scope: all")],"Same actions, broader scope.","",[A("Open","open")]),
    R("Deletion policy","warn",[C("90 days")],"Archive before deletion; receipt kept.","",[A("Edit","edit")]),
    R("PM-owned vs provider-native identity","info",[C("Distinguished")],"Provider threads attributed correctly.","",[A("Details","details")]),
    R("Sessions","ok",[C("3 resumable")],"Crash-safe session restore.","",[A("Restore","run","primary")])
  ];
  D.artifactRows = [
    R("Build outputs","ok",[C("out/dist"),C("v2026.08.11"),C("retain 14d")],"Type + location + version + retention.","",[A("Reveal","open"),A("Export","export")]),
    R("Test reports","ok",[C("junit"),C("retain 30d")],"Open / reveal / export / cleanup.","",[A("Open","open"),A("Cleanup","run")]),
    R("Goal receipts","info",[C("PM-owned identity")],"Receipted; redactable.","",[A("Reveal","open"),A("Redact","edit")]),
    R("Captured screenshots","warn",[C("retain 7d"),C("2.1 GB")],"Bounded; cleanup dry-run available.","",[A("Cleanup","run","primary"),A("Logs","logs")]),
    R("Provider exports","info",[C("provider-native identity")],"Attributed to the originating provider.","",[A("Open","open"),A("Export","export")])
  ];
  D.sourcecontrolRows = [
    R("Git","ok",[C("tool healthy"),C("2.46")],"Identity + auto-fetch configured.","",[A("Configure","edit")]),
    R("Worktrees","ok",[C("4 active"),C("1 per Goal")],"Auto-provision policy: Ask.","",[A("Manage","open")]),
    R("Branch / bookmark / revision","info",[C("trunk-based")],"Short-lived branches.","",[A("Graph","details")]),
    R("Jujutsu / LFS","neutral",[C("Jujutsu not configured")],"Optional; LFS on for media.","",[A("Configure","edit")]),
    R("Forge connection","ok",[C("GitHub authenticated")],"SSH source verified.","",[A("Details","details")]),
    R("Test before merge","ok",[C("On")],"Gate merges on green tests.","",[A("Policy","edit")]),
    R("Push / force-push policy","warn",[C("force-push: deny main")],"Leases on protected branches.","",[A("Edit","edit")]),
    R("Recovery and cleanup","info",[C("prune weekly")],"Stale branches removed; receipts kept.","",[A("Run","run"),A("Logs","logs")])
  ];
  D.githubRows = [
    R("Current-branch readiness","ok",[C("green: 3 workflows")],"Pinned workflows tracked for this branch.","",[A("Refresh","refresh"),A("Open","open")]),
    R("CI build","ok",[C("passing"),C("4m12s")],"Run / job / log browsable.","",[A("Logs","logs")]),
    R("Release publish","warn",[C("approval pending")],"Account capability: publish allowed.","",[A("Approve","enable","primary"),A("Logs","logs")]),
    R("Starter workflow","info",[C("node-ci.yml")],"Scaffold for new repos.","",[A("Use","add")]),
    R("Account health","ok",[C("1 forge connected")],"Rate-limit + auth healthy.","",[A("Details","details")])
  ];
  D.containerRows = [
    R("Docker","ok",[C("Desktop"),C("Engine 27.1"),C("Compose")],"CLI + Buildx available.","",[A("Details","details"),A("Logs","logs")]),
    R("Podman","warn",[C("CLI 5.2"),C("machine stopped")],"Rootless; start machine to use.","",[A("Start","reconnect","primary")]),
    R("Kubernetes tools","info",[C("kubectl"),C("Helm"),C("2 contexts")],"kubeconfig contexts: default, staging.","",[A("Switch","edit"),A("Details","details")]),
    R("Registries","ok",[C("ghcr.io authed"),C("local:5000")],"Pull/push health OK.","",[A("Manage","edit")]),
    R("Unraid publishing","info",[C("configured")],"SSH remote publishing target.","",[A("Details","details")]),
    R("SSH remotes","ok",[C("build-host")],"Host/environment tracked per remote.","",[A("Details","details")])
  ];
  D.webfetchRows = [
    R("Provider priority","ok",[C("web-search MCP, then built-in fetch")],"Ordered fallback.","",[A("Reorder","edit")]),
    R("Search / fetch / crawl limits","info",[C("crawl: 200 pages")],"Per-operation caps.","",[A("Edit","edit")]),
    R("Credit guards","warn",[C("API near quota")],"Pauses before overage.","",[A("Details","details")]),
    R("Caches","ok",[C("on: 512 MB")],"Search + fetch cache TTL configured.","",[A("Clear","run")]),
    R("Browser sessions","info",[C("PM-native Browser Program")],"No Playwright dependency.","",[A("Details","details")]),
    R("Proxies / certificates","ok",[C("system proxy")],"Cert chain validated.","",[A("Edit","edit")]),
    R("Air-gap behavior","neutral",[C("offline ready")],"Degrades to cache; readiness shown.","",[A("Details","details")]),
    R("Privacy","ok",[C("no prompt exfiltration")],"Enforced.","",[A("Details","details")]),
    R("Readiness","ok",[C("ready")],"All probes green.","",[A("Details","details")])
  ];
  D.searchindexRows = [
    R("Search index","ok",[C("enabled"),C("42k docs")],"Cross-file fuzzy + symbol index.","",[A("Configure","edit")]),
    R("Rebuild","info",[C("last: 1h ago")],"Phase/progress shown; non-blocking.","",[A("Rebuild","run","primary"),A("Logs","logs")]),
    R("Exclusions","ok",[C("respects .gitignore + node_modules")],"Plus user exclusions.","",[A("Edit","edit")]),
    R("File-size / symlink policy","info",[C("skip more than 8 MB, follow symlinks")],"Configurable thresholds.","",[A("Edit","edit")]),
    R("Disk use","warn",[C("640 MB")],"Remote cache optional.","",[A("Clear","run")]),
    R("Failures","bad",[C("3 files failed: 2 binary, 1 encoding")],"Failures surfaced, not hidden.","",[A("Details","details"),A("Retry","reconnect","primary")])
  ];
  D.cleanupRows = [
    R("Workspace cleanup","info",[C("dry-run first")],"Never deletes without a preview + receipt.","",[A("Dry-run","preview","primary")]),
    R("Orphaned worktrees","warn",[C("2: 1.8 GB")],"Safe to remove; evidence retained.","",[A("Review","details"),A("Clean","run","primary")]),
    R("Stale builds","ok",[C("out/: 920 MB")],"Removable.","",[A("Clean","run")]),
    R("Caches","ok",[C("1.4 GB")],"Clearable per category.","",[A("Clear","run")]),
    R("Logs","info",[C("older than retention")],"Archived then pruned.","",[A("Archive","export"),A("Prune","run")]),
    R("Receipts","ok",[C("kept per policy")],"Every cleanup is receipted.","",[A("Logs","logs")])
  ];
  D.serverRows = [
    R("Servers","neutral",[C("Module reserved")],"Insertion contract: server catalog + claim.","",[A("Owner","details")]),
    R("Execution Hosts","neutral",[C("Module reserved")],"Home Server is default host when compatible.","",[A("Owner","details")]),
    R("Clients","neutral",[C("3 paired (shell reference)")],"Pairing handled by the owner module.","",[A("Owner","details")]),
    R("Project Hosting and Files","neutral",[C("Module reserved")],"Project Vault + file hosting.","",[A("Owner","details")]),
    R("Remote Access","neutral",[C("Module reserved")],"SSH + remote execution.","",[A("Owner","details")]),
    R("Updates","neutral",[C("Module reserved")],"PM app/content updates owner.","",[A("Owner","details")])
  ];
  D.serverNote = "These owners are deferred. The Settings framework accepts their manager modules, deep links, status cards, and command wiring later. No state machine is invented here.";

  /* ----- PAM INSTALLATION LIFECYCLE (fixtures 3-8, 12, 14) ----- */
  /* Provider CLI acquisition is explicit, official-source, host-specific; never bundled. */
  D.installations = [
    { id:"claude-cli", provider:"Claude CLI", owner:"Claude (official)", confidence:"Proven",
      cmd:"claude", resolved:"/usr/local/bin/claude", method:"Homebrew", root:"isolated CLI home",
      host:"macOS native", evidence:"package db + launch probe", multi:"native profile",
      update:"managed externally", auth:"CLI-owned OAuth", health:"ok" },
    { id:"claude-cli-shadow", provider:"Claude CLI", owner:"Claude (official)", confidence:"Strongly identified",
      cmd:"claude", resolved:"/opt/homebrew/Cellar/claude/1.4/bin/claude", method:"Homebrew", root:"shadow install",
      host:"macOS native", evidence:"symlink chain traced", multi:"isolated home (shadowed)",
      update:"selected", auth:"CLI-owned OAuth", health:"ok",
      note:"Multiple installations found. One selected, one shadowed. Shadowed install ignored unless explicitly chosen." },
    { id:"legacy-ai", provider:"Unknown AI helper", owner:"Unknown", confidence:"Ambiguous",
      cmd:"ai", resolved:"~/bin/ai", method:"unknown", root:"—", host:"macOS native",
      evidence:"bare command; no package record", multi:"single-active-login",
      update:"Could not identify installation method", auth:"manual only", health:"warn",
      note:"Unknown/ambiguous ownership — manual only. Never guessed from a bare path." },
    { id:"opencode", provider:"OpenCode", owner:"OpenCode (official)", confidence:"Probable",
      cmd:"opencode", resolved:"/usr/local/bin/opencode", method:"npm global", root:"external server",
      host:"Linux native", evidence:"npm metadata", multi:"auth-only profile",
      update:"ready", auth:"PM-direct OAuth", health:"ok",
      note:"External server connection. Distinct from bundled providers." },
    { id:"codex-cli", provider:"Codex CLI", owner:"OpenAI (official)", confidence:"Proven",
      cmd:"codex", resolved:"/usr/local/bin/codex", method:"npm global", root:"PM-managed direct",
      host:"macOS native", evidence:"npm + probe", multi:"PM-managed direct",
      update:"Update available", auth:"PM-direct OAuth", health:"warn",
      note:"Update available — Ask first. Latest-compatible policy." },
    { id:"antigravity-cli", provider:"Antigravity CLI", owner:"Antigravity (official)", confidence:"Proven",
      cmd:"antigravity", resolved:"/usr/local/bin/antigravity", method:".pkg installer", root:"isolated CLI home",
      host:"macOS native", evidence:"installer receipt", multi:"native profile",
      update:"Waiting for work to finish", auth:"CLI-owned OAuth", health:"warn",
      note:"Scheduled when idle: requires proven ownership, compatible target, no active requests, repair/rollback path." },
    { id:"ffmpeg", provider:"media helper", owner:"FFmpeg (official)", confidence:"Strongly identified",
      cmd:"ffmpeg", resolved:"/opt/homebrew/bin/ffmpeg", method:"Homebrew", root:"—",
      host:"macOS native", evidence:"package db", multi:"—",
      update:"Rolled back", auth:"—", health:"bad",
      note:"Verification failed after update; rollback succeeded. Path + launch + adapter handshake re-verified." }
  ];
  D.installations.push(
    { id:"gemini-cli", provider:"Gemini CLI", owner:"Google (official)", confidence:"Not installed",
      cmd:"gemini", resolved:"—", method:"—", root:"—", host:"macOS native",
      evidence:"not present; official source identified", multi:"native profile (on install)",
      update:"Explicit install", auth:"CLI-owned OAuth", health:"neutral",
      note:"Not installed. Explicit Install from the official package source, on this exact Host/Environment. Never bundled or pre-seeded; never silently demand-installed by Project/model/Goal/agent demand." }
  );
  /* fixture 14: usage unavailable but provider ready */
  D.usageUnavailable = { provider:"OpenAI — Personal", note:"Usage details unavailable right now; provider is ready and routing." };

  /* ===== POLISH PASS DATA (packet-complete) ===== */
  /* Home 4th job: resume recent Settings work */
  D.recent = [
    { id:"r1", label:"Provider / Account / Model", target:"agents.providers", manager:"pam", ago:"2 min ago" },
    { id:"r2", label:"Permissions rules", target:"permissions.rules", manager:"permissions", ago:"12 min ago" },
    { id:"r3", label:"Notifications & Sounds", target:"general.notifications", manager:"notifications", ago:"yesterday" }
  ];

  /* title-bar notification sprout inbox items */
  D.inbox = [
    { id:"i1", title:"Backup completed (daily 02:00)", kind:"ok", ago:"3h ago", target:"system.backup" },
    { id:"i2", title:"Claude API key probe failing", kind:"bad", ago:"12m ago", target:"agents.accounts" },
    { id:"i3", title:"Prettier / TS LSP formatting conflict", kind:"warn", ago:"just now", target:"code.formatters" }
  ];

  /* search result types — the 7 packet kinds beyond setting/manager/destination.
     Each entry routes to a canonical owner. visibly distinct from scalar settings. */
  D.searchExtra = [
    { kind:"action", label:"Back Up Now", expl:"One-shot action — creates a restore point.", route:{ manager:"backup" }, kw:"backup now export save snapshot" },
    { kind:"action", label:"Reconnect Claude API key", expl:"One-shot action — re-run the auth probe.", route:{ manager:"pam" }, kw:"reconnect retry auth claude api" },
    { kind:"status", label:"Last backup", expl:"Read-only status — today 02:00.", route:{ manager:"backup" }, kw:"last backup status when" },
    { kind:"status", label:"Overall health", expl:"Read-only status — degraded, 1 provider needs attention.", route:{ cat:"system", sub:"health" }, kw:"health status degraded" },
    { kind:"diagnostic", label:"Open backup log", expl:"Diagnostic — receipted operation history.", route:{ manager:"backup" }, kw:"log receipt diagnostic history" },
    { kind:"diagnostic", label:"MCP server logs", expl:"Diagnostic — reconnect failure detail.", route:{ manager:"mcp" }, kw:"mcp logs reconnect failed" },
    { kind:"workflow", label:"Set up free model", expl:"Setup workflow — account, credential, scopes, verify, return.", route:{ manager:"pam" }, kw:"free model setup install deepseek" },
    { kind:"workflow", label:"Import settings", expl:"Setup workflow — preview conflicts, apply, rollback.", route:{ manager:"settingsLifecycle" }, kw:"import settings merge replace conflict" },
    { kind:"unavailable", label:"Container driver", expl:"Unavailable capability — no supported driver on this platform.", route:{ cat:"permissions", sub:"sandbox" }, kw:"container docker driver sandbox" },
    { kind:"unavailable", label:"Simulator / emulator", expl:"Unavailable capability — install a toolchain to enable.", route:{ manager:"testing" }, kw:"simulator emulator device unavailable" }
  ];

  /* Secret value types (packet 02) — credentials are NOT ordinary text fields. */
  D.secrets = [
    { id:"sec-pm", type:"PM-owned secret", name:"Anthropic API key", mode:"secret-input", masked:"sk-ant-••••••9f2a", note:"PM-owned; reveal/copy/persist gated; never logged." },
    { id:"sec-vault", type:"Vault reference", name:"GitHub token", mode:"vault-ref", ref:"vault://secrets/github-pat", note:"Stored in the secure vault; UI holds a reference, not the value." },
    { id:"sec-cli", type:"CLI-owned authentication", name:"Claude CLI login", mode:"cli-owned", note:"PM launches the CLI's own OAuth inside an isolated profile. PM never presents PM-direct OAuth for Claude." },
    { id:"sec-pmoauth", type:"PM-direct OAuth", name:"OpenAI connection", mode:"pm-oauth", note:"PM-direct OAuth (allowed: OpenAI/Codex, GitHub, Copilot)." },
    { id:"sec-env", type:"Environment-backed secret", name:"Solver token", mode:"env", var:"PM_SOLVER_TOKEN", note:"Read from the process environment; never written by PM." },
    { id:"sec-cmd", type:"Command-helper / vault-backed", name:"Signing key", mode:"vault-cmd", ref:"op://Private/signing-key", note:"Resolved at use via a vault helper; not held in memory." },
    { id:"sec-text", type:"Non-secret text", name:"Display name", mode:"text", value:"Jared", note:"Ordinary non-secret text." }
  ];

  /* Import / Copy-Settings-From flow data (packet 01 + 09) */
  D.importConflicts = [
    { setting:"appearance.theme", current:"Friendly · Dark", incoming:"Glass · Light", resolution:"keep-current" },
    { setting:"planning.goal-concurrency", current:"8 agents", incoming:"4 agents", resolution:"take-incoming" },
    { setting:"permissions.approval-mode", current:"Full Access", incoming:"Confirm Edits", resolution:"conflict" },
    { setting:"context.retention", current:"90 days", incoming:"90 days", resolution:"same" }
  ];
  D.copyFromSources = [
    { id:"p1", name:"Puppet-Master (main)", categories:10, note:"Transactional one-time copy; destination becomes independent immediately after." },
    { id:"p2", name:"Puppet-Master (archive)", categories:10, note:"About ten broad categories; preview, restore point, atomic apply, receipt." }
  ];

  /* general fixtures (packet 08) surfaced as deterministic demo rows */
  D.generalFixtures = [
    { id:"gf-default", label:"Theme family", state:"default", expl:"Default — Friendly.", value:"Friendly" },
    { id:"gf-custom", label:"UI scale", state:"custom", expl:"Custom — you set 110%.", value:"110%" },
    { id:"gf-inherited", label:"Log retention", state:"inherited", expl:"Inherited from System.", value:"14 days" },
    { id:"gf-managed", label:"Telemetry", state:"managed", expl:"Managed by administrator.", value:"Off", managed:true },
    { id:"gf-unavailable", label:"Container driver", state:"unavailable", expl:"Unavailable on this platform.", value:"—", unavailable:true, reason:"No supported container driver detected." },
    { id:"gf-validation", label:"Custom theme draft", state:"custom", expl:"Validation error — bad color token.", value:"#zzz", error:"Invalid color token 'zzz' at line 4." },
    { id:"gf-restart", label:"Font family", state:"custom", expl:"Restart required to fully apply.", value:"Cal Sans", restart:true },
    { id:"gf-reconnect", label:"Postgres MCP", state:"effective", expl:"Reconnect required — probe failed.", value:"reconnect", reconnect:true },
    { id:"gf-elsewhere", label:"Approval mode", state:"effective", expl:"Setting changed elsewhere (another window).", value:"Confirm Edits", elsewhere:true },
    { id:"gf-long", label:"Configure the maximum sustainable concurrent Goal worker fan-out across provider routes before the rate window resets", state:"custom", expl:"Long explanation: this ceiling caps how many worker agents a Goal may admit simultaneously; the orchestrator still admits only what current provider capacity and your spend guard allow, and reserves budget for final synthesis and verification. Effective capacity is reported live by Usage, not stored here.", value:"8 agents" }
  ];

  /* surface the general-fixture states as real setting rows under System → Setting states */
  (function () {
    var cat = D.catById["system"]; if (!cat) return;
    var sub = { id: "states", title: "Setting states", cat: "system" };
    cat.sub.push(sub); D.subById["system.states"] = sub;
    D.settingsBySub["system.states"] = D.generalFixtures.map(function (f) {
      return {
        id: "gf-" + f.id, label: f.label, expl: f.expl, type: "readonly", value: f.value,
        state: f.state, source: f.state.charAt(0).toUpperCase() + f.state.slice(1), exposure: "standard",
        error: f.error, restart: f.restart, reconnect: f.reconnect, elsewhere: f.elsewhere,
        managed: f.managed, unavailable: f.unavailable, reason: f.reason
      };
    });
  })();

  /* ----- EXTENDED PRIMARY DESTINATIONS (cover all families; curated areas) ----- */
  var extraDest = [
    { id:"general", title:"General & Desktop", purpose:"Startup, desktop, tray, notifications, sounds, teacher, and updates.",
      status:"1 webhook failing", statusKind:"bad", target:"general.notifications", manager:"notifications" },
    { id:"permissions", title:"Permissions & FileSafe", purpose:"Approvals, ordered rules, sandboxes, and the non-bypassable floor.",
      status:"FileSafe enforced", statusKind:"ok", target:"permissions.rules", manager:"permissions" },
    { id:"code", title:"Code, Languages & Commands", purpose:"Editor, terminal, LSP, formatters, commands, and shortcuts.",
      status:"1 conflict", statusKind:"warn", target:"code.files", manager:"filemanager" },
    { id:"system", title:"System, Storage & Server", purpose:"Health, storage, backup, lifecycle, history, artifacts, containers, web, index, cleanup, and the future Server shell.",
      status:"78% used", statusKind:"warn", target:"system.storage", manager:"storage" }
  ];
  var have = {}; D.destinations.forEach(function (d) { have[d.id] = 1; });
  extraDest.forEach(function (d) { if (!have[d.id]) D.destinations.push(d); });
  [{id:"context",mgr:"memory"},{id:"planning",mgr:"goal"},{id:"git",mgr:"sourcecontrol"},{id:"extensions",mgr:"mcp"},{id:"appearance",mgr:"appearance"}].forEach(function (p){
    var d = D.destinations.filter(function(x){return x.id===p.id;})[0];
    if (d && !d.manager) d.manager = p.mgr;
  });
})();
