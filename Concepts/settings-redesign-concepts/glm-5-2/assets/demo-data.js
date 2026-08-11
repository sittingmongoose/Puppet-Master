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
