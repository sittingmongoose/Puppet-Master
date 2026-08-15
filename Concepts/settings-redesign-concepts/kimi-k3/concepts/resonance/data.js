/* ============================================================================
   concepts/resonance/data.js — Resonance family fixtures (window.RES_DATA)
   ----------------------------------------------------------------------------
   Families: Notifications & Sounds, Sound Library/Uploads/Packs, Appearance,
   Spellcheck & Dictionaries, Desktop/Tray/Window, Teacher/Help.
   Plain object, no dependencies. Resonance seeds mutable slices into PMStore.
   ========================================================================== */
(function () {
  "use strict";

  window.RES_DATA = {
    managerMeta: {
      notifications: { id: "notifications", title: "Notifications", purpose: "Destinations, event routing, and quiet behavior", icon: "bell" },
      sounds: { id: "sounds", title: "Sound library", purpose: "Uploads, packs, mappings, and previews", icon: "spark" },
      appearance: { id: "appearance", title: "Appearance studio", purpose: "Themes, custom TOML, fonts, and scale", icon: "palette" },
      spellcheck: { id: "spellcheck", title: "Spellcheck and dictionaries", purpose: "Languages, dictionaries, and overrides", icon: "book" },
      desktop: { id: "desktop", title: "Desktop, tray, and window", purpose: "Tray behavior, restore, and window limits", icon: "grid" },
      teacher: { id: "teacher", title: "Teacher and help", purpose: "Guided explanation for the current screen", icon: "users" }
    },

    actions: [
      { id: "send-test", title: "Send a test notification", terms: "test notification destination receipt masked", kind: "action", target: { manager: "notifications", tab: "destinations" } },
      { id: "import-pack", title: "Import a sound pack", terms: "peonping openpeon pack import license", kind: "workflow", subtitle: "Setup workflow", target: { manager: "sounds", tab: "packs" } },
      { id: "theme-editor", title: "Open the custom TOML theme editor", terms: "theme toml custom editor validation", kind: "diagnostic", subtitle: "Diagnostics", target: { manager: "appearance", tab: "custom" } },
      { id: "grammar-status", title: "Grammar and style assistance status", terms: "grammar style opt-in privacy cost", kind: "status", subtitle: "Status", target: { manager: "spellcheck", tab: "overview" } },
      { id: "teacher-tour", title: "Start a guided tour of this screen", terms: "teacher help tour coachmarks guide", kind: "action", target: { manager: "teacher", tab: "overview" } }
    ],

    /* ---------- Notification destinations ---------- */
    destinations: [
      { id: "inbox", name: "Title-bar inbox", kind: "in-app", enabled: true,
        note: "The only in-app notification surface. There is no bottom-right stack, no status-bar bell, and no Activity Bar shortcut.",
        fields: [{ k: "Behavior", v: "Count + sprout panel" }, { k: "Grouping", v: "Related events collapse" }] },
      { id: "tray", name: "System / tray", kind: "system", enabled: true,
        note: "OS notification center banners; OS focus rules may still suppress.",
        fields: [{ k: "Priority", v: "Normal" }, { k: "Click target", v: "Open the notifying surface" }] },
      { id: "slack", name: "Slack", kind: "webhook", enabled: true,
        note: "Incoming webhook to a workspace channel.",
        fields: [{ k: "Channel", v: "#pm-runs" }, { k: "Thread", v: "Per Goal run" }, { k: "Mentions", v: "@jared on failure only" }, { k: "Parse mode", v: "mrkdwn" }, { k: "Retry", v: "3 with backoff" }, { k: "Credential", v: "••••••••x9T2 (vault reference)" }] },
      { id: "discord", name: "Discord", kind: "webhook", enabled: false,
        note: "Webhook to a server channel.",
        fields: [{ k: "Channel", v: "#automation" }, { k: "Mentions", v: "None" }, { k: "Parse mode", v: "markdown" }, { k: "Retry", v: "2" }, { k: "Credential", v: "••••••••4mQ8 (vault reference)" }] },
      { id: "webhook", name: "Generic webhook", kind: "webhook", enabled: true,
        note: "POST a JSON envelope to any HTTPS endpoint.",
        fields: [{ k: "URL", v: "https://hooks.northwind.internal/pm" }, { k: "Headers", v: "X-PM-Event, Authorization (vault)" }, { k: "Template", v: "Default envelope" }, { k: "Success predicate", v: "2xx within 5 s" }, { k: "Retry", v: "5 with backoff" }, { k: "Credential", v: "••••••••8f2a (vault reference)" }] },
      { id: "ntfy", name: "ntfy", kind: "push", enabled: true,
        note: "Push via your ntfy topic.",
        fields: [{ k: "Topic", v: "pm-jared" }, { k: "Priority", v: "high on failure" }, { k: "Tags", v: "goal, approval" }, { k: "Click target", v: "Deep link into the run" }, { k: "Credential", v: "••••••••1b7c (vault reference)" }] },
      { id: "pushover", name: "Pushover", kind: "push", enabled: false,
        note: "Pushover device notifications.",
        fields: [{ k: "Device", v: "Pixel 8" }, { k: "Priority", v: "Normal" }, { k: "Retry", v: "3" }, { k: "Credential", v: "••••••••77aa (vault reference)" }] },
      { id: "telegram", name: "Telegram", kind: "push", enabled: false,
        note: "Bot messages to a chat.",
        fields: [{ k: "Chat", v: "@jared_pm" }, { k: "Parse mode", v: "HTML" }, { k: "Retry", v: "3" }, { k: "Credential", v: "••••••••tk01 (vault reference)" }] }
    ],

    /* ---------- Event routing ---------- */
    events: [
      { id: "goal-complete", label: "Goal run completes", destinations: ["inbox", "tray", "slack"], sound: "chime-soft", note: "Sound pairs with the visual completion state — never the only indication" },
      { id: "goal-failed", label: "Goal run fails", destinations: ["inbox", "tray", "slack", "ntfy"], sound: "bell-desk", note: "Also raises a Needs-attention notice" },
      { id: "approval", label: "Approval requested", destinations: ["inbox", "ntfy"], sound: "none", note: "Always visible in the inbox even when quiet hours hold the rest" },
      { id: "blocked", label: "Work blocked", destinations: ["inbox", "tray"], sound: "knock-wood", note: "Pairs with the blocked banner" },
      { id: "update", label: "Provider update ready", destinations: ["inbox"], sound: "none", note: "Quiet by default" },
      { id: "verify-failed", label: "Update verification failed", destinations: ["inbox", "tray", "ntfy"], sound: "bell-desk", note: "Rollback state is always visible alongside" }
    ],

    /* ---------- Sound library ---------- */
    sounds: [
      { id: "chime-soft", name: "Soft Chime", origin: "built-in", source: "Puppet Master sound set", license: "PM License", version: "1.0", duration: "0.8 s", hash: "sha256:7c1e…a2", defaultMapping: "Goal run completes", bars: [4, 9, 14, 11, 7, 12, 15, 10, 5, 8, 13, 6] },
      { id: "bell-desk", name: "Desk Bell", origin: "built-in", source: "Puppet Master sound set", license: "PM License", version: "1.0", duration: "1.1 s", hash: "sha256:02bd…f7", defaultMapping: "Goal run fails", bars: [12, 15, 9, 4, 8, 14, 15, 11, 6, 3, 7, 5] },
      { id: "knock-wood", name: "Wood Knock", origin: "built-in", source: "Puppet Master sound set", license: "PM License", version: "1.0", duration: "0.5 s", hash: "sha256:4fa0…91", defaultMapping: "Work blocked", bars: [14, 6, 13, 5, 12, 4, 11, 3, 10, 2, 9, 1] },
      { id: "sonar-ping", name: "Sonar Ping (uploaded)", origin: "custom", source: "Uploaded 2026-08-06", license: "CC0 (user supplied)", version: "—", duration: "1.4 s", hash: "sha256:c81d…5e", defaultMapping: "Not mapped", bars: [2, 4, 8, 12, 15, 12, 8, 4, 6, 9, 5, 3] }
    ],
    packImportDemo: {
      valid: { file: "focus-pack.peonpack", result: "Format PeonPing v1 ✓ · License CC-BY-4.0 verified ✓ · 6 sounds staged" },
      wrongFormat: { file: "retro-sounds.zip", result: "Wrong format — expected a PeonPing/OpenPeon pack manifest (.peonpack / pack.json)" },
      unverified: { file: "midnight.peonpack", result: "License could not be verified — the pack is never bundled. Preview only, then discarded." }
    },

    /* ---------- Appearance studio ---------- */
    customTheme: {
      validToml: 'inherits = "friendly-dark"\n\n[colors]\naccent = "#7FB5C9"\n\n[fonts]\nui = "Inter, system-ui"',
      invalidToml: 'inherits = "friendly-dark"\n\n[colors]\naccent = #7FB5C9\n\n[typo]\nx = 1',
      diagnostics: [
        { line: 4, message: "accent must be a quoted string", severity: "error" },
        { line: 6, message: "Unknown table [typo] — did you mean [fonts]?", severity: "error" }
      ],
      fallbackNote: "The invalid theme never applies — the base theme (friendly-dark) stays active."
    },
    glassOnlyRow: {
      label: "Backdrop transparency",
      reason: "Available only in the Glass family — other themes have no translucent surfaces to tune."
    },

    /* ---------- Desktop / tray / window ---------- */
    desktopGroups: [
      { id: "tray", title: "Tray", rows: [
        ["Minimize to tray instead of closing", "On"],
        ["Close to tray", "Ask each time"],
        ["Tray state while automation runs", "Animated activity icon + run count"],
        ["Tray menu", "Show/Hide · Pause/Resume automation · Quit"]
      ]},
      { id: "window", title: "Window and restore", rows: [
        ["Launch destination", "Project picker"],
        ["Window restore", "Size, position, and panels from last session"],
        ["Tab restore", "Reopen editor tabs; terminals restart fresh"],
        ["Crash recovery", "Offer restore after an unclean exit"],
        ["Unsaved buffer protection", "Warn before closing with unsaved changes"]
      ]},
      { id: "bars", title: "Activity Bar and panels", rows: [
        ["Activity Bar order", "Files · Search · Goals · Tools · Settings (drag to reorder)"],
        ["Hidden rail entries", "None hidden"],
        ["Overflow", "Collapse into a More menu"],
        ["Side-panel restore", "Remember open state per project"]
      ]},
      { id: "limits", title: "Limits and history", rows: [
        ["Editor tab limit", "12 — oldest unpinned closes"],
        ["Terminal tab limit", "8"],
        ["File tree expansion limit", "500 entries per folder"],
        ["Closed-window history", "Keep 10 entries"],
        ["Archive behavior", "Archive projects after 90 days idle"]
      ]}
    ],

    /* ---------- Teacher ---------- */
    teacher: {
      intro: "Teacher explains the screen you are on, then can hand you into the real action safely.",
      steps: [
        { target: "search", title: "Search first", body: "Type what you want in plain words — results are typed so you can tell a setting from an action." },
        { target: "notices", title: "Notices", body: "Three groups: needs attention, continue setup, recommended. Each has one primary action and can be dismissed." },
        { target: "destinations", title: "Destinations", body: "Cards open workspaces or managers. Health lines tell you what needs you before you click." }
      ],
      handoff: { label: "Show me quiet hours", target: { category: "notifications", sub: "delivery", setting: "notifications.quiet-hours" } }
    },

    /* ---------- Demo scenarios ---------- */
    demoScenarios: [
      { id: "calm", label: "Calm state (all notices dismissed)" },
      { id: "slow-hydration", label: "Slow manager hydration (lazy load)" },
      { id: "reset", label: "Reset demo data" },
      { id: "test-send", label: "Test-send to Slack (masked, receipted)" },
      { id: "sound-upload", label: "Upload a custom sound (simulated pick)" },
      { id: "sound-preview", label: "Preview a sound (local WebAudio tone)" },
      { id: "pack-valid", label: "Pack import: valid PeonPing pack" },
      { id: "pack-wrong", label: "Pack import: wrong format" },
      { id: "pack-unverified", label: "Pack import: unverified license" },
      { id: "theme-hover", label: "Theme hover preview → commit" },
      { id: "theme-invalid", label: "Invalid TOML → diagnostics + fallback" },
      { id: "teacher-tour", label: "Teacher guided overlay" },
      { id: "changed-elsewhere", label: "Setting changed elsewhere (conflict bar)" },
      { id: "validation-error", label: "Validation error on Default shell" }
    ]
  };
})();
