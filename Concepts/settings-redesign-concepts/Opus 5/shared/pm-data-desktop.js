/* Opus 5 — notification, sound, appearance, desktop, input and help datasets.
 *
 * Owned by the Console concept (coverage group concept_2), loaded by every page
 * so cross-concept links resolve manager titles.
 *
 * The recurring idea here is that a message has a DESTINATION and a destination
 * has a RETURN VALUE. Most notification settings screens model delivery as a
 * checkbox, which is why nobody can tell the difference between "we did not
 * send it" and "we sent it and Slack said channel_not_found". Every destination
 * in this file therefore carries the provider's own last reply, and every
 * routing decision is a cell in one matrix rather than a switch hidden inside
 * eight separate forms.
 *
 * Sound is deliberately subordinate: it is an addition to a notification and
 * never the only indication of anything. The standing row in manager-sounds
 * says so and points at the destinations that carry the real signal.
 */
(function () {
  "use strict";

  var D = window.PMData;
  if (!D) return;

  var Q = (window.__pmManagerBuilders = window.__pmManagerBuilders || []);

  function reg(id, record, build) {
    D.managers[id] = Object.assign({ id: id }, D.managers[id] || {}, record);
    Q.push([id, build]);
  }

  /* A builder is a pure function of (data, state). A control that actually
   * drives rendered output reads its effective value back out of managerEdits
   * through here, rather than keeping state of its own somewhere the renderer
   * cannot see. */
  function eff(state, managerId, itemId, key, fallback) {
    var edits = (state && state.managerEdits) || {};
    var k = "edit-" + managerId + "-" + itemId + "-" + key;
    return edits[k] !== undefined ? edits[k] : fallback;
  }

  /* ========================================================= NOTIFICATIONS */

  /* Eight destinations, four health stories. The matrix below keys its columns
   * off `key`, so a destination cannot appear in routing without existing here. */
  var DESTINATIONS = [
    {
      key: "inbox", id: "dest-inbox", name: "In-app title-bar inbox",
      secondary: "The floor. Every other destination is an addition to this one.",
      status: "ok", statusWord: "Always on",
      transport: "In-app", endpoint: "Title bar of this window",
      lastReply: "Delivered 4 minutes ago", lastReplyKind: "ok",
      configured: true,
      note: "This destination cannot be switched off. If it could, a failure with every external destination down would be silent.",
      editable: [
        { key: "retain", label: "Entries kept", kind: "number", value: 40,
          help: "Older entries are dropped from the inbox. The receipt itself stays in the log." },
        { key: "clickTarget", label: "Click target", kind: "select",
          options: ["Open the thing that happened", "Open the log", "Do nothing"],
          value: "Open the thing that happened" }
      ]
    },
    {
      key: "tray", id: "dest-tray", name: "System notification and tray",
      secondary: "The operating system's own notification centre.",
      status: "ok", statusWord: "Delivering",
      transport: "OS", endpoint: "macOS Notification Centre",
      lastReply: "Accepted by the OS 4 minutes ago", lastReplyKind: "ok",
      configured: true,
      editable: [
        { key: "priority", label: "Priority", kind: "select",
          options: ["Passive", "Active", "Time sensitive"], value: "Active",
          help: "Time sensitive is allowed to break through a system focus mode." },
        { key: "clickTarget", label: "Click target", kind: "select",
          options: ["Focus the thread", "Focus the Goal", "Focus Settings"], value: "Focus the thread" },
        { key: "grouping", label: "Group by", kind: "select",
          options: ["Goal", "Project", "Do not group"], value: "Goal" },
        { key: "device", label: "Device selection", kind: "select",
          options: ["This computer only", "This computer and paired phone", "Paired phone only"],
          value: "This computer only",
          help: "Paired devices are listed by the Clients module, which owns pairing." }
      ]
    },
    {
      key: "slack", id: "dest-slack", name: "Slack",
      secondary: "Incoming webhook into a workspace channel.",
      status: "attention", statusWord: "Failing",
      transport: "Webhook", endpoint: "https://hooks.slack.com/services/" + "\u2022\u2022\u2022\u2022\u2022" + "/\u2026",
      lastReply: "channel_not_found", lastReplyKind: "error",
      lastReplyDetail: "Slack returned channel_not_found for #orchard-builds at 09:12. The webhook itself is still valid; the channel was archived on 6 August.",
      configured: true,
      failing: true,
      editable: [
        { key: "webhook", label: "Incoming webhook URL", kind: "secret", secretKind: "pmSecret",
          value: "https://hooks.slack.com/services/T0/B0/xxxxxxxx",
          help: "Stored in the Puppet Master secret store. Reveal shows the value once and is recorded." },
        { key: "channel", label: "Channel or thread", kind: "text", value: "#orchard-builds",
          help: "A webhook is bound to one channel at creation. Overriding it here only works if the workspace allows it." },
        { key: "mentions", label: "Mentions", kind: "chips", value: ["@jared", "@here on failure"],
          help: "Applied to the message text, not to the webhook identity." },
        { key: "template", label: "Message template", kind: "text",
          value: "{severity}: {headline} — {project}" },
        { key: "predicate", label: "Success predicate", kind: "select",
          options: ["HTTP 2xx", "HTTP 2xx and body is ok", "Any response"], value: "HTTP 2xx and body is ok",
          help: "Slack answers 200 with the body 'channel_not_found', so HTTP 2xx alone would report this failure as a success." },
        { key: "retry", label: "Retry", kind: "select",
          options: ["None", "3 attempts, backing off", "5 attempts, backing off"], value: "3 attempts, backing off" }
      ]
    },
    {
      key: "discord", id: "dest-discord", name: "Discord",
      secondary: "Channel webhook with an overridden display name.",
      status: "ok", statusWord: "Delivering",
      transport: "Webhook", endpoint: "https://discord.com/api/webhooks/" + "\u2022\u2022\u2022\u2022\u2022" + "/\u2026",
      lastReply: "HTTP 204", lastReplyKind: "ok",
      configured: true,
      editable: [
        { key: "webhook", label: "Webhook URL", kind: "secret", secretKind: "pmSecret",
          value: "https://discord.com/api/webhooks/1/xxxxxxxx" },
        { key: "username", label: "Display name override", kind: "text", value: "Puppet Master" },
        { key: "template", label: "Message template", kind: "text", value: "**{severity}** {headline}" },
        { key: "mentions", label: "Mentions", kind: "chips", value: ["<@&build-watch>"] },
        { key: "predicate", label: "Success predicate", kind: "select",
          options: ["HTTP 2xx", "Any response"], value: "HTTP 2xx" }
      ]
    },
    {
      key: "webhook", id: "dest-webhook", name: "Generic webhook",
      secondary: "Anything that accepts a JSON POST.",
      status: "ok", statusWord: "Delivering",
      transport: "Webhook", endpoint: "https://ops.orchard.internal/hooks/" + "\u2022\u2022\u2022\u2022\u2022",
      lastReply: "HTTP 202", lastReplyKind: "ok",
      configured: true,
      editable: [
        { key: "url", label: "Endpoint", kind: "text", value: "https://ops.orchard.internal/hooks/pm" },
        { key: "token", label: "Bearer token", kind: "secret", secretKind: "vaultReference",
          value: "vault://orchard/ops-webhook#token",
          help: "A reference, not a copy. The value is read at send time and never stored here." },
        { key: "method", label: "Method", kind: "select", options: ["POST", "PUT"], value: "POST" },
        { key: "headers", label: "Extra headers", kind: "chips",
          value: ["X-PM-Project: orchard-api", "Content-Type: application/json"] },
        { key: "template", label: "Body template", kind: "text",
          value: "{\"text\":\"{headline}\",\"severity\":\"{severity}\"}" },
        { key: "predicate", label: "Success predicate", kind: "select",
          options: ["HTTP 2xx", "HTTP 2xx and body contains ok", "Any response"], value: "HTTP 2xx" },
        { key: "retry", label: "Retry", kind: "select",
          options: ["None", "3 attempts, backing off"], value: "3 attempts, backing off" }
      ]
    },
    {
      key: "ntfy", id: "dest-ntfy", name: "ntfy",
      secondary: "Self-hosted or public ntfy topic.",
      status: "setup", statusWord: "Not configured",
      transport: "Push", endpoint: "No server set",
      lastReply: "Never sent", lastReplyKind: "none",
      configured: false,
      editable: [
        { key: "server", label: "Server", kind: "text", value: "", help: "For example https://ntfy.sh, or your own instance." },
        { key: "topic", label: "Topic", kind: "text", value: "" },
        { key: "priority", label: "Priority", kind: "select",
          options: ["Min", "Low", "Default", "High", "Max"], value: "Default" },
        { key: "tags", label: "Tags", kind: "chips", value: [] },
        { key: "clickTarget", label: "Click target", kind: "text", value: "",
          help: "A URL opened when the notification is tapped. Leave empty to open nothing." },
        { key: "token", label: "Access token", kind: "secret", secretKind: "pmSecret", value: "",
          help: "Only needed for a protected topic." }
      ]
    },
    {
      key: "pushover", id: "dest-pushover", name: "Pushover",
      secondary: "Per-device push with its own priority ladder.",
      status: "setup", statusWord: "Not configured",
      transport: "Push", endpoint: "No application key set",
      lastReply: "Never sent", lastReplyKind: "none",
      configured: false,
      editable: [
        { key: "appToken", label: "Application token", kind: "secret", secretKind: "pmSecret", value: "" },
        { key: "userKey", label: "User or group key", kind: "secret", secretKind: "pmSecret", value: "" },
        { key: "device", label: "Device selection", kind: "select",
          options: ["All devices", "Choose after connecting"], value: "Choose after connecting",
          help: "The real device list is only readable once the account is connected." },
        { key: "priority", label: "Priority", kind: "select",
          options: ["Lowest", "Low", "Normal", "High", "Emergency"], value: "Normal",
          help: "Emergency repeats until acknowledged, so it is refused for anything below a failure." },
        { key: "sound", label: "Pushover sound", kind: "select",
          options: ["Device default", "Pushover", "Bike", "None"], value: "Device default" }
      ]
    },
    {
      key: "telegram", id: "dest-telegram", name: "Telegram",
      secondary: "Bot message into a chat.",
      status: "unavailable", statusWord: "Blocked by policy",
      transport: "Bot", endpoint: "Not reachable from this device",
      lastReply: "Never sent", lastReplyKind: "none",
      configured: false,
      unavailable: {
        reason: "The organisation device policy blocks api.telegram.org on managed workstations, so a message could never leave this machine.",
        owner: "Organisation device policy 'orchard-workstations'"
      },
      editable: [
        { key: "botToken", label: "Bot token", kind: "secret", secretKind: "pmSecret", value: "",
          help: "Cannot be tested from this device while the policy is in force." },
        { key: "chatId", label: "Chat id", kind: "text", value: "" },
        { key: "parseMode", label: "Parse mode", kind: "select",
          options: ["Plain", "Markdown", "MarkdownV2", "HTML"], value: "MarkdownV2" },
        { key: "silent", label: "Send silently", kind: "toggle", value: false }
      ]
    }
  ];

  /* Events routed to destinations. Every cell is a real word, never a blank:
   * "Off" and "Owner" mean different things and an empty cell would hide both. */
  var ROUTING = [
    { id: "evt-approval", name: "Approval needed", secondary: "A run is waiting for a human decision.",
      cells: { inbox: "On", tray: "On", slack: "On", discord: "Off", webhook: "On", ntfy: "Not set up", pushover: "Not set up", telegram: "Blocked" } },
    { id: "evt-failed", name: "Run failed", secondary: "A Goal, task or verification stopped with an error.",
      cells: { inbox: "On", tray: "On", slack: "On", discord: "On", webhook: "On", ntfy: "Not set up", pushover: "Not set up", telegram: "Blocked" } },
    { id: "evt-finished", name: "Goal finished", secondary: "Everything the Goal was asked to do completed.",
      cells: { inbox: "On", tray: "On", slack: "Off", discord: "On", webhook: "On", ntfy: "Not set up", pushover: "Not set up", telegram: "Blocked" } },
    { id: "evt-blocked", name: "Work blocked", secondary: "A run cannot continue without something outside its control.",
      cells: { inbox: "On", tray: "On", slack: "On", discord: "Off", webhook: "On", ntfy: "Not set up", pushover: "Not set up", telegram: "Blocked" } },
    { id: "evt-signedout", name: "Provider signed out", secondary: "An account stopped being usable.",
      cells: { inbox: "On", tray: "On", slack: "On", discord: "Off", webhook: "Off", ntfy: "Not set up", pushover: "Not set up", telegram: "Blocked" } },
    { id: "evt-update", name: "Update available", secondary: "A provider CLI or Puppet Master itself has an update.",
      cells: { inbox: "On", tray: "Off", slack: "Off", discord: "Off", webhook: "Off", ntfy: "Not set up", pushover: "Not set up", telegram: "Blocked" } },
    { id: "evt-backup", name: "Backup finished", secondary: "A scheduled backup completed or failed.",
      cells: { inbox: "On", tray: "Off", slack: "Off", discord: "Off", webhook: "On", ntfy: "Not set up", pushover: "Not set up", telegram: "Blocked" } }
  ];

  reg("manager-notifications", {
    title: "Notifications, destinations and event routing",
    purpose: "Every place a notification can be delivered, which events go where, and what the last delivery actually returned.",
    icon: "bell",
    destinations: DESTINATIONS,
    routing: ROUTING
  }, function (data, state) {
    var mgr = data.managers["manager-notifications"];
    var dests = mgr.destinations || [];
    var failing = dests.filter(function (d) { return d.failing; }).length;
    var configured = dests.filter(function (d) { return d.configured; }).length;
    var blocked = dests.filter(function (d) { return d.unavailable; }).length;

    function destItem(d) {
      var badges = [{ kind: "source", text: d.transport, title: "Transport" }];
      if (d.configured) badges.push({ kind: "availability", text: "Configured", title: "Has everything it needs to send" });
      if (d.failing) badges.push({ kind: "evidence", text: "Provider returned an error", title: d.lastReplyDetail || d.lastReply });

      var fields = {
        Transport: d.transport,
        Endpoint: d.endpoint,
        "Last reply": d.lastReply
      };
      if (d.lastReplyDetail) fields["What that means"] = d.lastReplyDetail;
      if (d.note) fields["Why it works this way"] = d.note;

      var actions = [];
      if (d.unavailable) {
        actions.push({ id: "notification.test_send", label: "Test send is unavailable", kind: "quiet" });
      } else if (d.configured) {
        actions.push({ id: "notification.test_send", label: "Send a test", kind: "primary" });
        actions.push({ id: "notification.open_log", label: "Open the delivery log", kind: "quiet" });
      } else {
        actions.push({ id: "notification.connect", label: "Connect it", kind: "primary" });
      }
      if (d.failing) actions.push({ id: "notification.repair", label: "Choose another channel", kind: "quiet" });

      return {
        id: d.id, name: d.name, secondary: d.secondary,
        status: d.status, statusWord: d.statusWord,
        badges: badges,
        value: d.lastReply,
        valueSource: d.lastReplyKind === "none" ? "Nothing has been sent yet" : "Reported by the destination",
        availability: d.unavailable
          ? { available: false, reason: d.unavailable.reason, owner: d.unavailable.owner }
          : { available: true },
        fields: fields,
        editable: d.editable || [],
        actions: actions,
        detail: [{
          id: d.id + "-delivery", label: "Delivery record",
          rows: [
            { label: "Last attempt", value: d.lastReply, hint: d.lastReplyDetail || "" },
            { label: "Success predicate", value: (d.editable || []).reduce(function (a, e) {
              return e.key === "predicate" ? String(e.value) : a;
            }, "Not applicable"), hint: "What counts as delivered for this destination." },
            { label: "Masked in the interface", value: d.endpoint, hint: "The full value is never rendered, copied or logged." }
          ]
        }]
      };
    }

    return {
      title: "Notifications, destinations and event routing",
      purpose: "Every place a notification can be delivered, which events go where, and what the last delivery actually returned.",
      icon: "bell",
      health: {
        status: failing ? "attention" : "ok",
        statusWord: failing ? failing + " failing" : "Delivering",
        headline: configured + " of " + dests.length + " destinations are configured. Slack is returning channel_not_found.",
        detail: "A destination that answers with an error is a different state from one that was never set up, and both are different from one an administrator has blocked.",
        counts: [
          { label: "Destinations", value: dests.length },
          { label: "Configured", value: configured },
          { label: "Failing", value: failing },
          { label: "Blocked by policy", value: blocked }
        ]
      },
      search: { placeholder: "Search destinations and events", fields: ["name", "secondary"] },
      primary: { id: "notification.connect", label: "Connect a destination", kind: "connect" },
      sections: [
        {
          id: "notifications", label: "Notifications", kind: "rows",
          summary: "The master switches. Turning notifications off does not stop work, and does not stop the title-bar inbox recording it.",
          settings: ["notify-enabled", "notify-quiet", "notify-batch", "notify-retry"]
        },
        {
          id: "destinations", label: "Destinations", kind: "list",
          summary: "Each destination keeps its own form, its own success predicate and the provider's own last reply.",
          items: dests.map(destItem),
          actions: [{ id: "notification.test_all", label: "Test every configured destination", kind: "quiet" }]
        },
        {
          id: "routing", label: "Event routing", kind: "matrix",
          summary: "Which event reaches which destination. A cell is never blank: Off, Not set up and Blocked are three different answers.",
          columns: [
            { key: "inbox", label: "Inbox", weight: 1, align: "center" },
            { key: "tray", label: "System", weight: 1, align: "center" },
            { key: "slack", label: "Slack", weight: 1, align: "center" },
            { key: "discord", label: "Discord", weight: 1, align: "center" },
            { key: "webhook", label: "Webhook", weight: 1, align: "center" },
            { key: "ntfy", label: "ntfy", weight: 1, align: "center" },
            { key: "pushover", label: "Pushover", weight: 1, align: "center" },
            { key: "telegram", label: "Telegram", weight: 1, align: "center" }
          ],
          items: ROUTING.map(function (r) {
            return {
              id: r.id, name: r.name, secondary: r.secondary,
              status: "ok", statusWord: "Routed",
              fields: r.cells
            };
          })
        },
        {
          id: "quiet", label: "Quiet and focus", kind: "list",
          summary: "What still gets through when you have asked not to be disturbed.",
          items: [
            {
              id: "quiet-window", name: "Quiet hours", secondary: "Follows the system focus mode",
              status: "ok", statusWord: "Following the system",
              fields: { "In force now": "No — the system focus mode is off", "When active": "Only failures and approval requests are delivered outside the app" },
              editable: [
                { key: "mode", label: "Quiet hours", kind: "select",
                  options: ["Off", "22:00 to 08:00", "Match the system focus mode", "Custom"],
                  value: "Match the system focus mode" },
                { key: "breakthrough", label: "Always deliver", kind: "chips",
                  value: ["Approval needed", "Run failed"],
                  help: "These break through quiet hours because waiting on them costs more than the interruption." }
              ]
            },
            {
              id: "quiet-focus", name: "While a Goal is running", secondary: "Reduce interruptions during long automation",
              status: "ok", statusWord: "Summarise",
              fields: { Behaviour: "Collect step updates and deliver one summary when the Goal finishes or stops" },
              editable: [
                { key: "during", label: "During a Goal", kind: "select",
                  options: ["Deliver everything", "Summarise", "Only failures and approvals"], value: "Summarise" }
              ]
            },
            {
              id: "quiet-presence", name: "When the window is focused", secondary: "Avoid telling you what you are looking at",
              status: "ok", statusWord: "Inbox only",
              fields: { Behaviour: "External destinations are skipped for events you can already see on screen" },
              editable: [
                { key: "focused", label: "While Puppet Master is focused", kind: "select",
                  options: ["Inbox only", "Deliver everywhere", "Inbox and system"], value: "Inbox only" }
              ]
            }
          ]
        },
        {
          id: "testing", label: "Test and diagnostics", kind: "list",
          summary: "A test is an explicit, masked, rate-limited send that produces a receipt. It is never automatic.",
          items: [
            {
              id: "test-rules", name: "What a test send does", secondary: "One real message to one destination",
              status: "ok", statusWord: "Explicit only",
              fields: {
                Masked: "The endpoint is shown masked in the interface and in every receipt",
                "Rate limit": "One test per destination every 10 seconds",
                Receipt: "The result lands in the title-bar inbox, including a failure",
                Contents: "A fixed test payload. It never contains project content."
              }
            },
            {
              id: "test-history", name: "Recent delivery attempts", secondary: "Across every destination",
              status: "attention", statusWord: "1 failing",
              fields: {
                "09:12 · Slack": "channel_not_found — the webhook is valid, the channel was archived",
                "09:12 · Discord": "HTTP 204 — delivered",
                "09:11 · System": "Accepted by the OS notification centre",
                "08:40 · Generic webhook": "HTTP 202 — accepted"
              },
              actions: [{ id: "notification.open_log", label: "Open the delivery log", kind: "quiet" }]
            }
          ],
          empty: { headline: "Nothing has been sent yet", detail: "Send a test from any configured destination and the attempt appears here with the provider's own reply.", action: null }
        }
      ],
      diagnostics: [
        { id: "diag-notify-log", label: "Open the delivery log", kind: "log" },
        { id: "diag-notify-receipt", label: "Show the last delivery receipt", kind: "receipt" }
      ],
      notes: [
        "The title-bar inbox is the only in-app notification surface. There is no second toast stack, no status-bar bell and no Notifications side panel, because a second surface would quietly make the first one optional.",
        "A destination that returns an error keeps its configuration. Nothing is deleted because a channel was archived."
      ]
    };
  });

  /* ================================================================ SOUNDS */

  /* Every built-in row carries a duration, a waveform and a tone, because the
   * concept synthesises its preview from exactly those three values rather than
   * shipping audio it would then have to license. */
  var BUILT_IN = [
    { id: "snd-done", name: "Task complete", source: "Puppet Master built-in", licence: "CC0 1.0",
      version: "1.2.0", duration: 0.42, waveform: "triangle", tone: 660, hash: "sha256:9f2c1d\u2026", mapping: "Goal finished" },
    { id: "snd-fail", name: "Run failed", source: "Puppet Master built-in", licence: "CC0 1.0",
      version: "1.2.0", duration: 0.68, waveform: "sawtooth", tone: 220, hash: "sha256:41ba07\u2026", mapping: "Run failed" },
    { id: "snd-approve", name: "Approval needed", source: "Puppet Master built-in", licence: "CC0 1.0",
      version: "1.2.0", duration: 0.55, waveform: "square", tone: 520, hash: "sha256:c73e88\u2026", mapping: "Approval needed" },
    { id: "snd-blocked", name: "Work blocked", source: "Puppet Master built-in", licence: "CC0 1.0",
      version: "1.1.0", duration: 0.50, waveform: "sine", tone: 330, hash: "sha256:07dd52\u2026", mapping: "Work blocked" },
    { id: "snd-quiet", name: "Quiet acknowledgement", source: "Puppet Master built-in", licence: "CC0 1.0",
      version: "1.0.3", duration: 0.22, waveform: "sine", tone: 880, hash: "sha256:be1904\u2026", mapping: "Not mapped" }
  ];

  var PACKS = [
    { id: "pack-peonping", name: "PeonPing Classic", format: "peonping.v2", version: "2.1.0",
      licence: "CC BY 4.0", events: 6, mapped: 6, state: "Compatible", installedAt: "3 weeks ago", enabled: true },
    { id: "pack-openpeon", name: "OpenPeon Minimal", format: "openpeon.v1", version: "0.9.0",
      licence: "MIT", events: 8, mapped: 5, state: "Partially compatible", installedAt: "9 days ago", enabled: false }
  ];

  reg("manager-sounds", {
    title: "Sound library, uploads and packs",
    purpose: "Built-in sounds and their licences, your uploads, and imported PeonPing or OpenPeon compatible packs.",
    icon: "volume",
    builtIn: BUILT_IN,
    packs: PACKS,
    /* The event vocabulary a pack manifest is validated against. */
    eventNames: ["goal.finished", "run.failed", "approval.needed", "work.blocked", "provider.signedout", "update.available", "backup.finished"]
  }, function (data, state) {
    var mgr = data.managers["manager-sounds"];
    var master = eff(state, "manager-sounds", "sound-policy", "master", true);

    return {
      title: "Sound library, uploads and packs",
      purpose: "Built-in sounds and their licences, your uploads, and imported PeonPing or OpenPeon compatible packs.",
      icon: "volume",
      health: {
        status: "ok", statusWord: master ? "Sound on" : "Sound off",
        headline: (mgr.builtIn || []).length + " built-in sounds, " + (mgr.packs || []).length + " imported packs.",
        detail: "Sound is an addition to a notification. Turning it off never removes the notification itself.",
        counts: [
          { label: "Built in", value: (mgr.builtIn || []).length },
          { label: "Uploaded", value: 0 },
          { label: "Packs", value: (mgr.packs || []).length },
          { label: "Events mapped", value: 4 }
        ]
      },
      primary: { id: "sounds.upload", label: "Upload a sound", kind: "add" },
      sections: [
        {
          id: "master", label: "Master sound and volume", kind: "rows",
          summary: "One switch and one level, applied to every Puppet Master sound. The system volume still applies on top.",
          settings: ["sound-master", "sound-volume"]
        },
        {
          id: "boundary", label: "What sound is for", kind: "prose",
          summary: "The rule this manager is built around.",
          items: [
            { id: "sound-rule", name: "Sound is never the only indication of a failure, blocked work, an approval request or a completion. Every one of those also reaches the title-bar inbox, and reaches any destination you have configured for it." },
            { id: "sound-rule-2", name: "That is why the master switch is safe to turn off: it removes an addition, not the signal. If you want the signal somewhere else, configure a destination in Notifications, destinations and event routing." },
            { id: "sound-rule-3", name: "Preview is local only. Playing a sound here never contacts a destination and never sends a test message." }
          ]
        },
        {
          id: "mappings", label: "Per-event mappings", kind: "table",
          summary: "Which sound plays for which event, and when it is suppressed.",
          columns: [
            { key: "sound", label: "Sound", weight: 2, align: "start" },
            { key: "when", label: "When", weight: 2, align: "start" }
          ],
          items: [
            { id: "map-finished", name: "Goal finished", status: "ok", statusWord: "Mapped",
              fields: { sound: "Task complete", when: "Unless quiet hours are active" } },
            { id: "map-failed", name: "Run failed", status: "ok", statusWord: "Mapped",
              fields: { sound: "Run failed", when: "Always, including quiet hours" } },
            { id: "map-approval", name: "Approval needed", status: "ok", statusWord: "Mapped",
              fields: { sound: "Approval needed", when: "Always, including quiet hours" } },
            { id: "map-blocked", name: "Work blocked", status: "ok", statusWord: "Mapped",
              fields: { sound: "Work blocked", when: "Unless the window is focused" } },
            { id: "map-update", name: "Update available", status: "setup", statusWord: "No sound",
              fields: { sound: "None", when: "Never — this event is inbox only" } }
          ]
        },
        {
          id: "library", label: "Built-in library", kind: "list",
          summary: "Each built-in asset with its source, licence, version, duration and hash. Preview is synthesised locally from the duration and waveform.",
          items: (mgr.builtIn || []).map(function (s) {
            return {
              id: s.id, name: s.name, secondary: s.mapping === "Not mapped" ? "Not mapped to an event" : "Default for " + s.mapping,
              status: "ok", statusWord: s.mapping === "Not mapped" ? "Available" : "In use",
              badges: [{ kind: "source", text: s.source, title: "Where the asset came from" },
                { kind: "evidence", text: s.licence, title: "Licence" }],
              fields: {
                Source: s.source, Licence: s.licence, Version: s.version,
                Duration: s.duration.toFixed(2) + " s",
                Waveform: s.waveform,
                Tone: s.tone + " Hz",
                Hash: s.hash,
                "Default mapping": s.mapping
              },
              actions: [
                { id: "sounds.preview", label: "Preview", kind: "primary" },
                { id: "sounds.map", label: "Map to an event", kind: "quiet" }
              ]
            };
          })
        },
        {
          id: "uploads", label: "Uploaded sounds", kind: "list",
          summary: "Your own audio files. Name, size, duration and SHA-256 are read from the real file you choose.",
          items: [],
          empty: {
            headline: "You have not uploaded a sound yet",
            detail: "Choose an audio file and Puppet Master reads its real name, size, type, duration and SHA-256 digest. Nothing is uploaded anywhere; the file stays on this device.",
            action: { id: "sounds.upload", label: "Upload a sound", kind: "primary" }
          },
          actions: [{ id: "sounds.upload", label: "Upload a sound", kind: "primary" }]
        },
        {
          id: "packs", label: "Imported packs", kind: "list",
          summary: "PeonPing and OpenPeon compatible manifests. A pack is checked before it is imported and is never enabled automatically.",
          items: (mgr.packs || []).map(function (p) {
            return {
              id: p.id, name: p.name, secondary: p.format + " \u00b7 imported " + p.installedAt,
              status: p.state === "Compatible" ? "ok" : "setup",
              statusWord: p.state === "Compatible" ? "Compatible" : "Partially compatible \u2014 " + p.mapped + " of " + p.events + " events mapped",
              badges: [{ kind: "source", text: p.format, title: "Manifest format" },
                { kind: "evidence", text: p.licence, title: "Declared licence" }],
              fields: {
                Format: p.format, Version: p.version, Licence: p.licence,
                "Events in manifest": p.events,
                "Events mapped": p.mapped + " of " + p.events,
                Enabled: p.enabled ? "Yes" : "No \u2014 imported but not enabled"
              },
              editable: [{ key: "enabled", label: "Use this pack", kind: "toggle", value: p.enabled,
                help: "An imported pack is never enabled for you. Unmapped events keep the built-in sound." }],
              actions: [{ id: "sounds.pack_remove", label: "Remove the pack", kind: "risky" }]
            };
          }),
          actions: [
            { id: "sounds.pack_import", label: "Import a pack manifest", kind: "primary" },
            { id: "sounds.pack_sample", label: "Use the sample manifest", kind: "quiet" }
          ]
        }
      ],
      diagnostics: [{ id: "diag-sound-log", label: "Open the audio device log", kind: "log" }],
      notes: [
        "The shipped audio assets are not bundled in this concept. Preview synthesises a tone from each row's own duration, waveform and tone values, and says so on the row.",
        "An unverified pack is never bundled and never enabled on import."
      ]
    };
  });

  /* ============================================================ APPEARANCE */

  var THEMES = [
    { id: "friendly-dark", name: "Friendly Dark", family: "Friendly", mode: "Dark", builtIn: true },
    { id: "friendly-light", name: "Friendly Light", family: "Friendly", mode: "Light", builtIn: true },
    { id: "glass-dark", name: "Glass Dark", family: "Glass", mode: "Dark", builtIn: true },
    { id: "glass-light", name: "Glass Light", family: "Glass", mode: "Light", builtIn: true },
    { id: "retro-dark", name: "Retro Dark", family: "Retro", mode: "Dark", builtIn: true },
    { id: "retro-light", name: "Retro Light", family: "Retro", mode: "Light", builtIn: true },
    { id: "basic-dark", name: "Basic Dark", family: "Basic", mode: "Dark", builtIn: true },
    { id: "basic-light", name: "Basic Light", family: "Basic", mode: "Light", builtIn: true }
  ];

  reg("manager-appearance", {
    title: "Themes, fonts and custom appearance",
    purpose: "The eight built-in themes, custom TOML themes with validation and fallback, fonts, UI scale and live preview.",
    icon: "palette",
    themes: THEMES,
    /* A deliberately broken custom theme, so the invalid-theme diagnosis has
     * something real to diagnose and a named fallback to fall back to. */
    customTheme: {
      id: "orchard-night", name: "Orchard Night", base: "glass-dark",
      file: "~/.puppetmaster/themes/orchard-night.toml",
      state: "invalid",
      failingKey: "surface.blur",
      failingLine: 14,
      failingReason: "Expected a number between 0 and 40, found the string \"heavy\".",
      fallback: "Glass Dark",
      loadedAt: "Failed at startup, 09:04"
    }
  }, function (data, state) {
    var mgr = data.managers["manager-appearance"];
    var custom = mgr.customTheme;
    var active = eff(state, "manager-appearance", "theme-mode", "mode", "Follow the system");

    return {
      title: "Themes, fonts and custom appearance",
      purpose: "The eight built-in themes, custom TOML themes with validation and fallback, fonts, UI scale and live preview.",
      icon: "palette",
      health: {
        status: "attention", statusWord: "1 custom theme invalid",
        headline: "Eight built-in themes load. Orchard Night failed schema validation at startup and Glass Dark is in force instead.",
        detail: "An invalid theme is named, diagnosed and replaced by a named fallback. It is never silently ignored and never leaves the interface unstyled.",
        counts: [
          { label: "Built in", value: THEMES.length },
          { label: "Custom", value: 1 },
          { label: "Invalid", value: 1 },
          { label: "Mode", value: active }
        ]
      },
      search: { placeholder: "Search themes and fonts", fields: ["name"] },
      primary: { id: "appearance.create", label: "Create a theme", kind: "create" },
      sections: [
        {
          id: "theme-settings", label: "Theme and material", kind: "rows",
          summary: "The ordinary settings. Information architecture and status meaning are identical in every theme.",
          settings: ["app-theme", "app-theme-follow", "app-contrast", "app-accent"]
        },
        {
          id: "mode", label: "Light, dark and the system", kind: "list",
          summary: "Which variant is in force, and whether the operating system decides.",
          items: [
            {
              id: "theme-mode", name: "Appearance mode", secondary: "Light, Dark, or follow the operating system",
              status: "ok", statusWord: active,
              requested: active,
              effective: active === "Follow the system" ? "Dark" : active,
              effectiveWhy: active === "Follow the system" ? "The operating system currently reports a dark appearance." : null,
              fields: {
                "System reports": "Dark",
                "Changes live": "Yes \u2014 switching the system appearance re-themes the window without a restart"
              },
              editable: [
                { key: "mode", label: "Appearance mode", kind: "select",
                  options: ["Light", "Dark", "Follow the system"], value: active },
                { key: "liveFollow", label: "Follow live changes", kind: "toggle", value: true,
                  help: "Off means the appearance is read once at startup." }
              ]
            }
          ]
        },
        {
          id: "themes", label: "Built-in themes", kind: "cards",
          summary: "Hover a theme to preview it on the whole window; leaving the row restores what you had. Under reduced motion the preview is a static swatch instead.",
          items: THEMES.map(function (t) {
            return {
              id: "theme-" + t.id, name: t.name, secondary: t.family + " \u00b7 " + t.mode,
              status: "ok", statusWord: "Ready",
              badges: [{ kind: "source", text: "Built in", title: "Ships with Puppet Master" }],
              fields: { "Theme id": t.id, Family: t.family, Mode: t.mode },
              actions: [{ id: "appearance.apply", label: "Use this theme", kind: "primary" }]
            };
          })
        },
        {
          id: "custom", label: "Custom themes", kind: "list",
          summary: "A custom theme is TOML, inherits from a base theme, and is validated against the schema before it is allowed to load.",
          items: [
            {
              id: "custom-" + custom.id, name: custom.name,
              secondary: "Inherits from " + custom.base,
              status: "attention", statusWord: "Invalid \u2014 not loaded",
              badges: [
                { kind: "source", text: "Custom TOML", title: custom.file },
                { kind: "evidence", text: "Schema validation failed", title: custom.failingReason }
              ],
              availability: { available: false,
                reason: "Line " + custom.failingLine + ", key " + custom.failingKey + ": " + custom.failingReason + " Glass Dark is in force instead.",
                owner: null },
              fields: {
                File: custom.file,
                "Base theme": custom.base,
                "Failing key": custom.failingKey,
                "Failing line": String(custom.failingLine),
                Reason: custom.failingReason,
                "Fallback in force": custom.fallback,
                "Load attempt": custom.loadedAt
              },
              actions: [
                { id: "appearance.edit_theme", label: "Open the file", kind: "primary" },
                { id: "appearance.revalidate", label: "Validate again", kind: "quiet" }
              ],
              detail: [{
                id: "custom-diagnosis", label: "Why it did not load",
                rows: [
                  { label: "Line " + custom.failingLine, value: custom.failingKey + " = \"heavy\"", hint: custom.failingReason },
                  { label: "Fallback", value: custom.fallback, hint: "Named explicitly rather than reverting to an unspecified default." },
                  { label: "Live reload", value: "Watching the file", hint: "Saving a corrected file loads it without a restart." }
                ]
              }]
            },
            {
              id: "custom-lifecycle", name: "Create, import, export and open the folder",
              secondary: "Where custom themes live and how they move between machines",
              status: "ok", statusWord: "Available",
              fields: {
                Folder: "~/.puppetmaster/themes",
                "On startup": "Every .toml in the folder is read and validated",
                "Live reload": "On \u2014 a saved change is applied without a restart",
                Inheritance: "A theme names one base theme and overrides only the keys it lists"
              },
              actions: [
                { id: "appearance.create", label: "Create", kind: "primary" },
                { id: "appearance.import_toml", label: "Import TOML", kind: "quiet" },
                { id: "appearance.export", label: "Export", kind: "quiet" },
                { id: "appearance.open_folder", label: "Open the folder", kind: "quiet" }
              ]
            }
          ],
          actions: [{ id: "appearance.import_toml", label: "Import a TOML theme", kind: "primary" }]
        },
        {
          id: "fonts", label: "Fonts and scale", kind: "list",
          summary: "Interface font, monospace font, their fallbacks, and how large everything is drawn.",
          items: [
            {
              id: "font-ui", name: "Interface font", secondary: "Used for everything that is not code",
              status: "ok", statusWord: "System default",
              requested: "Inter",
              effective: "Inter",
              effectiveWhy: null,
              fields: { Fallback: "system-ui, Segoe UI, sans-serif", "Available on this device": "Yes" },
              editable: [
                { key: "family", label: "Font family", kind: "text", value: "Inter" },
                { key: "fallback", label: "Fallback stack", kind: "text", value: "system-ui, Segoe UI, sans-serif",
                  help: "Used when the first choice is missing on a device." }
              ]
            },
            {
              id: "font-mono", name: "Monospace font", secondary: "Code, terminals and identifiers",
              status: "attention", statusWord: "Requested font missing",
              requested: "Berkeley Mono",
              effective: "JetBrains Mono",
              effectiveWhy: "Berkeley Mono is not installed on this device, so the first available fallback is drawn.",
              fields: { Fallback: "JetBrains Mono, SF Mono, Consolas, monospace", "Available on this device": "No" },
              editable: [
                { key: "family", label: "Font family", kind: "text", value: "Berkeley Mono" },
                { key: "fallback", label: "Fallback stack", kind: "text", value: "JetBrains Mono, SF Mono, Consolas, monospace" }
              ]
            },
            {
              id: "ui-scale", name: "UI scale", secondary: "How large the whole interface is drawn",
              status: "ok", statusWord: "100%",
              fields: { "Applies to": "Every surface, including this one", "Takes effect": "Immediately" },
              editable: [{ key: "scale", label: "Scale", kind: "select",
                options: ["90%", "100%", "110%", "125%", "150%"], value: "100%" }]
            }
          ]
        },
        {
          id: "locked", label: "Locked and unavailable in this theme", kind: "list",
          summary: "Some appearance controls only mean something inside one theme family. They stay visible with the reason rather than disappearing.",
          items: [
            {
              id: "locked-blur", name: "Blur strength", secondary: "Glass family only",
              status: "unavailable", statusWord: "Unavailable outside Glass",
              availability: { available: false,
                reason: "Blur strength only exists in the Glass family, which draws translucent surfaces. Friendly, Retro and Basic paint opaque surfaces, so there is nothing to blur.",
                owner: null },
              fields: { "Available in": "Glass Dark, Glass Light", "Current theme family": "Glass", "Value when active": "18 px" },
              editable: [{ key: "blur", label: "Blur strength", kind: "number", value: 18,
                help: "Applies only while a Glass theme is in force." }]
            },
            {
              id: "locked-scanline", name: "Scanline intensity", secondary: "Retro family only",
              status: "unavailable", statusWord: "Unavailable outside Retro",
              availability: { available: false,
                reason: "Scanlines are part of the Retro family's material. No other family draws them.",
                owner: null },
              fields: { "Available in": "Retro Dark, Retro Light", "Current theme family": "Glass" }
            },
            {
              id: "locked-contrast", name: "Forced high contrast", secondary: "Set by the operating system",
              status: "managed", statusWord: "Managed by the system",
              availability: { available: false,
                reason: "The operating system is not currently requesting high contrast. When it does, every theme strengthens its borders and text and this row explains that it was not a Puppet Master decision.",
                owner: "Operating system accessibility settings" },
              fields: { "System requests high contrast": "No", "If it did": "Every theme raises border and text contrast automatically" }
            }
          ]
        },
        {
          id: "restart", label: "What needs a restart", kind: "list",
          summary: "Almost nothing. The two that do are named here rather than discovered later.",
          items: [
            {
              id: "restart-none", name: "Applied immediately", secondary: "Theme, mode, accent, contrast, fonts, scale",
              status: "ok", statusWord: "No restart",
              fields: { Behaviour: "Changing any of these re-draws the window straight away" }
            },
            {
              id: "restart-needed", name: "Needs a restart", secondary: "Two settings only",
              status: "setup", statusWord: "Restart to apply",
              fields: {
                "Window material": "Changing between an opaque and a translucent window frame is decided when the window is created",
                "Custom title bar": "Switching between the system title bar and the Puppet Master one replaces the window frame"
              },
              actions: [{ id: "appearance.restart", label: "Restart to apply", kind: "risky" }]
            }
          ]
        }
      ],
      diagnostics: [
        { id: "diag-theme-log", label: "Open the theme load log", kind: "log" },
        { id: "diag-theme-schema", label: "Show the theme schema", kind: "report" }
      ],
      notes: [
        "Hover preview changes only what is drawn. It never writes the setting, so leaving the row always restores exactly what you had.",
        "Under reduced motion the hover preview is suppressed and a static swatch is shown instead, because re-theming a whole window on pointer movement is itself motion."
      ]
    };
  });

  /* =============================================================== DESKTOP */

  var ACTIVITY_BAR = ["Threads", "Goals", "Projects", "Files", "Terminal", "Usage", "Settings"];

  reg("manager-desktop", {
    title: "Desktop behaviour, tray and Activity Bar",
    purpose: "Tray state while automation runs, launch destination, crash recovery, and the order of the Activity Bar.",
    icon: "window",
    activityBar: ACTIVITY_BAR,
    hiddenActivityItems: ["Media", "Extensions"]
  }, function (data, state) {
    var mgr = data.managers["manager-desktop"];
    /* The reorder control is real: the effective order is read back out of
     * managerEdits, so the up and down actions in the renderer change what this
     * builder returns on the next pass. */
    var order = eff(state, "manager-desktop", "activity-order", "order", mgr.activityBar || []);
    if (!Array.isArray(order) || !order.length) order = (mgr.activityBar || []).slice();

    return {
      title: "Desktop behaviour, tray and Activity Bar",
      purpose: "Tray state while automation runs, launch destination, crash recovery, and the order of the Activity Bar.",
      icon: "window",
      health: {
        status: "ok", statusWord: "Running in the tray",
        headline: "Closing the window keeps Puppet Master running so Goals continue. Two Activity Bar items are hidden.",
        detail: "A background application that quits when you close a window loses work you asked it to keep doing. The tray icon is what makes that state visible.",
        counts: [
          { label: "Activity Bar items", value: order.length },
          { label: "Hidden", value: (mgr.hiddenActivityItems || []).length },
          { label: "Unsaved buffers", value: 2 },
          { label: "Crash journal", value: "Healthy" }
        ]
      },
      sections: [
        {
          id: "desktop-settings", label: "Window and tray", kind: "rows",
          summary: "The ordinary settings behind this manager.",
          settings: ["desk-close", "desk-minimise", "desk-restore", "desk-unsaved", "desk-tabs-limit"]
        },
        {
          id: "tray", label: "Tray while automation runs", kind: "list",
          summary: "What the tray shows, and what you can do from it without reopening the window.",
          items: [
            {
              id: "tray-state", name: "Tray icon state", secondary: "What the icon means right now",
              status: "ok", statusWord: "2 Goals running",
              fields: {
                Idle: "Outline icon, no badge",
                Running: "Filled icon with the number of active Goals",
                "Needs you": "Filled icon with an attention mark when something is waiting for approval",
                Failed: "Filled icon with an attention mark until the failure is read"
              }
            },
            {
              id: "tray-menu", name: "Tray menu actions", secondary: "Available without restoring the window",
              status: "ok", statusWord: "4 actions",
              fields: {
                "Show and hide": "Restores or hides the window without changing what is running",
                "Pause and resume": "Pauses admission of new work; running steps finish rather than being killed",
                Quit: "Asks first when work is active, and names exactly what would stop"
              },
              editable: [
                { key: "showHide", label: "Show and hide", kind: "toggle", value: true },
                { key: "pauseResume", label: "Pause and resume automation", kind: "toggle", value: true },
                { key: "quitConfirm", label: "Confirm before quitting with work active", kind: "toggle", value: true,
                  help: "Off means Quit stops running Goals immediately." }
              ],
              actions: [
                { id: "desktop.tray_pause", label: "Pause automation", kind: "quiet" },
                { id: "desktop.tray_quit", label: "Quit with work active", kind: "risky" }
              ]
            }
          ]
        },
        {
          id: "launch", label: "Launch and restore", kind: "list",
          summary: "Where a new window opens, and how much of the last session comes back.",
          items: [
            {
              id: "launch-dest", name: "Launch destination", secondary: "The surface shown after startup",
              status: "ok", statusWord: "Last thread",
              fields: { "On startup": "Reopen the thread that was active", "If it is gone": "Fall back to the thread list rather than an empty window" },
              editable: [{ key: "destination", label: "Open to", kind: "select",
                options: ["Last thread", "Thread list", "Goal board", "Settings"], value: "Last thread" }]
            },
            {
              id: "launch-restore", name: "Window, panel and tab restore", secondary: "Layout from the previous session",
              status: "ok", statusWord: "Restoring",
              fields: {
                Windows: "Position and size per display, matched by display identity rather than index",
                Panels: "Rail and Assistant panel open state",
                Tabs: "Editor tabs and their group, up to the tab limit",
                "Missing display": "A window whose display is gone is moved to the primary display instead of opening off-screen"
              },
              editable: [
                { key: "windows", label: "Restore window layout", kind: "toggle", value: true },
                { key: "panels", label: "Restore side panels", kind: "toggle", value: true },
                { key: "tabs", label: "Restore editor tabs", kind: "toggle", value: true }
              ]
            }
          ]
        },
        {
          id: "recovery", label: "Crash recovery and unsaved work", kind: "list",
          summary: "What survives a forced quit, a power loss or a crash.",
          items: [
            {
              id: "recovery-journal", name: "Crash journal", secondary: "Unsaved editor content, written continuously",
              status: "ok", statusWord: "Healthy",
              badges: [{ kind: "evidence", text: "2 buffers held", title: "Unsaved content currently protected" }],
              fields: {
                Location: "~/.puppetmaster/journal",
                "Written": "On every pause in typing, and at least every 5 seconds",
                "Held now": "2 unsaved buffers",
                "On next start": "Recovered content is offered beside the on-disk version; neither is overwritten automatically"
              },
              actions: [{ id: "desktop.journal_open", label: "Open the journal folder", kind: "quiet" }]
            },
            {
              id: "recovery-unsaved", name: "Unsaved buffer protection", secondary: "What Quit does with unsaved work",
              status: "ok", statusWord: "Protected",
              fields: {
                "On quit": "Unsaved buffers are written to the journal before the process exits",
                "On tab limit": "The least recently used tab is closed, but never an unsaved one",
                "On crash": "The journal is the source of truth and is offered on next start"
              }
            }
          ]
        },
        {
          id: "activity", label: "Activity Bar", kind: "list",
          summary: "The order items appear in, which are hidden, and what happens when the window is too short to show them all.",
          items: [
            {
              id: "activity-order", name: "Order", secondary: "Drag-free reordering, so it works from the keyboard",
              status: "ok", statusWord: order.length + " items",
              fields: { "Current order": order.join(", ") },
              editable: [{ key: "order", label: "Activity Bar order", kind: "order", value: order,
                help: "Move an item with the up and down controls. The order here is the order in the rail." }],
              actions: [{ id: "desktop.activity_reset", label: "Reset the order", kind: "quiet" }]
            },
            {
              id: "activity-hidden", name: "Hidden items", secondary: "Still reachable from the overflow menu",
              status: "ok", statusWord: (mgr.hiddenActivityItems || []).length + " hidden",
              fields: { Hidden: (mgr.hiddenActivityItems || []).join(", "),
                "Still reachable": "Yes, from the overflow menu and from search" },
              editable: [{ key: "hidden", label: "Hidden items", kind: "chips",
                value: (mgr.hiddenActivityItems || []).slice(),
                help: "Hiding an item removes it from the rail. It never removes the feature." }]
            },
            {
              id: "activity-overflow", name: "Overflow behaviour", secondary: "When the window is too short",
              status: "ok", statusWord: "Collapse into a menu",
              fields: { Behaviour: "Items that do not fit move into an overflow menu at the bottom of the rail, in the same order",
                "Never dropped": "An item is never silently removed because the window got shorter" },
              editable: [{ key: "overflow", label: "When items do not fit", kind: "select",
                options: ["Collapse into a menu", "Scroll the rail", "Shrink the icons"], value: "Collapse into a menu" }]
            }
          ]
        },
        {
          id: "limits", label: "Editor, tab and tree limits", kind: "table",
          summary: "Ceilings that keep a long session responsive, and what happens at each one.",
          columns: [
            { key: "limit", label: "Limit", weight: 1, align: "start" },
            { key: "behaviour", label: "At the limit", weight: 3, align: "start" }
          ],
          items: [
            { id: "limit-tabs", name: "Open editor tabs", status: "ok", statusWord: "18 of 24",
              fields: { limit: "24", behaviour: "The least recently used saved tab is closed. An unsaved tab is never closed automatically." } },
            { id: "limit-groups", name: "Editor groups", status: "ok", statusWord: "2 of 4",
              fields: { limit: "4", behaviour: "A new split reuses the least recently used group instead of creating a fifth." } },
            { id: "limit-tree", name: "Tree nodes expanded", status: "ok", statusWord: "Under the limit",
              fields: { limit: "5000", behaviour: "Deeper expansion is loaded on demand rather than refused, and the tree says it is doing so." } },
            { id: "limit-history", name: "Session history entries", status: "ok", statusWord: "Under the limit",
              fields: { limit: "2000", behaviour: "Older entries move to the archive, which stays searchable." } }
          ]
        },
        {
          id: "history", label: "History and archive", kind: "list",
          summary: "What is kept after a thread or window is closed.",
          items: [
            {
              id: "history-behaviour", name: "Closing a thread", secondary: "Nothing is deleted by closing",
              status: "ok", statusWord: "Archived",
              fields: {
                "On close": "The thread moves to history and stays searchable",
                "On archive": "Older history is compacted, keeping the transcript and dropping cached previews",
                Deletion: "Only ever explicit. Closing, archiving and compacting never delete a transcript."
              },
              editable: [
                { key: "archiveAfter", label: "Archive threads after", kind: "select",
                  options: ["7 days", "30 days", "90 days", "Never"], value: "30 days" },
                { key: "keepPreviews", label: "Keep cached previews", kind: "toggle", value: false,
                  help: "Previews are regenerated on demand, so dropping them costs time, not content." }
              ]
            }
          ]
        }
      ],
      diagnostics: [
        { id: "diag-desktop-journal", label: "Open the crash journal", kind: "log" },
        { id: "diag-desktop-window", label: "Show the window layout record", kind: "report" }
      ],
      notes: ["Reordering the Activity Bar uses explicit up and down controls rather than drag only, so it is operable from the keyboard and under reduced motion."]
    };
  });

  /* =============================================================== TEACHER */

  reg("manager-teacher", {
    title: "Teacher and guided help",
    purpose: "What Teacher can explain, what it may do on your behalf, and the transition into the real action.",
    icon: "graduation"
  }, function (data, state) {
    var depth = eff(state, "manager-teacher", "teacher-explain", "depth", "Normal");

    return {
      title: "Teacher and guided help",
      purpose: "What Teacher can explain, what it may do on your behalf, and the transition into the real action.",
      icon: "graduation",
      health: {
        status: "ok", statusWord: "Local explanations",
        headline: "Teacher explains the screen you are on from that screen's own definition. No provider is involved unless you ask a free-form question.",
        detail: "A tooltip says what a control is called. Teacher says what the screen is for, what the current values mean, and then offers the action it just described.",
        counts: [
          { label: "Route", value: "Local only" },
          { label: "Depth", value: depth },
          { label: "Screens it can explain", value: "Every manager" }
        ]
      },
      sections: [
        {
          id: "teacher-settings", label: "Teacher settings", kind: "rows",
          summary: "The ordinary settings behind this manager.",
          settings: ["teach-enabled", "teach-depth", "teach-offer", "teach-route"]
        },
        {
          id: "assistance", label: "Explain this screen", kind: "list",
          summary: "Teacher reads the current screen's own definition and writes the explanation from it. Nothing is pre-written and nothing is guessed.",
          items: [
            {
              id: "teacher-explain", name: "Explain this screen", secondary: "Generated from the manager you are looking at",
              status: "ok", statusWord: "Ready",
              badges: [{ kind: "source", text: "Local", title: "No provider route is used" }],
              fields: {
                "What it reads": "The screen's title, purpose, every section and what each one contains, plus the current value of every row",
                "What it produces": "A structured explanation, then the real action it just described",
                "What it never does": "Change a value on your behalf without you choosing the action"
              },
              editable: [{ key: "depth", label: "Explanation depth", kind: "select",
                options: ["Short", "Normal", "Thorough"], value: depth,
                help: "Depth changes wording only. It never changes what an action does." }],
              actions: [{ id: "teacher.explain", label: "Explain this screen", kind: "primary" }]
            },
            {
              id: "teacher-offer", name: "Unfamiliar screens", secondary: "A quiet offer, not a tour",
              status: "ok", statusWord: "Off",
              fields: {
                Behaviour: "A single quiet line the first three times you open a manager you have not used",
                "Never": "No modal, no overlay, no sequence of numbered bubbles, and no repeat once dismissed"
              }
            }
          ]
        },
        {
          id: "boundary", label: "What Teacher may and may not do", kind: "list",
          summary: "Explanation and action are separate. Teacher can describe anything and change almost nothing.",
          items: [
            {
              id: "teacher-may", name: "It may", secondary: "Read and describe",
              status: "ok", statusWord: "Allowed",
              fields: {
                Read: "Any Settings screen and the current value of anything shown on it",
                Describe: "What a section is for, what a value means, and what an action would do",
                Offer: "The exact action it just described, as a normal control you choose"
              }
            },
            {
              id: "teacher-may-not", name: "It may not", secondary: "Act on your behalf",
              status: "managed", statusWord: "Refused by design",
              availability: { available: false,
                reason: "Teacher never applies a change, never widens an access profile, never signs in to a provider and never runs an irreversible action. It hands you the control and stops.",
                owner: null },
              fields: {
                "Apply a change": "No",
                "Widen access": "No",
                "Sign in": "No",
                "Run an irreversible action": "No",
                "Send the screen to a provider": "Only if you ask a free-form question, and it discloses the route first"
              }
            }
          ]
        },
        {
          id: "transition", label: "From explanation into the action", kind: "prose",
          summary: "The part that makes it Teacher rather than documentation.",
          items: [
            { id: "trans-1", name: "An explanation that ends with \"and you can change that in Settings\" has told you nothing you could not see. Teacher ends with the control itself." },
            { id: "trans-2", name: "The offered action is the same control the screen already has, in the same place, with the same confirmation. Teacher does not build a parallel path that behaves differently." },
            { id: "trans-3", name: "If the action is irreversible or would widen access, Teacher describes it and stops. It offers the screen, not the button." }
          ]
        }
      ],
      diagnostics: [{ id: "diag-teacher-transcript", label: "Show the last explanation", kind: "report" }],
      notes: ["Teacher assistance is explicit help, not tooltips. Both exist: hover still names a control, and Teacher explains the screen."]
    };
  });

  /* ========================================================== DICTIONARIES */

  reg("manager-dictionaries", {
    title: "Dictionaries",
    purpose: "Personal and project word lists, language packs, and where dictionaries come from.",
    icon: "book",
    personalWords: ["Puppet Master", "orchard", "worktree", "Jujutsu", "monorepo", "idempotent", "Slint", "PeonPing"],
    projectWords: ["orchard-api", "ledgerd", "PlanUnit", "seam", "lane"],
    packs: [
      { id: "pack-en-gb", name: "English (UK)", source: "Operating system service", version: "2024.1", words: 129000, state: "ready" },
      { id: "pack-de", name: "German", source: "Puppet Master local", version: "1.8.2", words: 214000, state: "ready" },
      { id: "pack-pt-br", name: "Portuguese (Brazil)", source: "Puppet Master local", version: "1.4.0", words: 187000, state: "downloading" }
    ]
  }, function (data, state) {
    var mgr = data.managers["manager-dictionaries"];
    var personal = eff(state, "manager-dictionaries", "dict-personal", "words", mgr.personalWords || []);
    if (!Array.isArray(personal)) personal = (mgr.personalWords || []).slice();

    return {
      title: "Dictionaries",
      purpose: "Personal and project word lists, language packs, and where dictionaries come from.",
      icon: "book",
      health: {
        status: "ok", statusWord: "Checking spelling",
        headline: personal.length + " personal words, " + (mgr.projectWords || []).length + " project words. Language is automatic and follows the text.",
        detail: "Spelling is checked locally. Nothing is ever replaced automatically and no draft leaves this device for a spelling check.",
        counts: [
          { label: "Personal words", value: personal.length },
          { label: "Project words", value: (mgr.projectWords || []).length },
          { label: "Language packs", value: (mgr.packs || []).length },
          { label: "Overrides", value: 1 }
        ]
      },
      search: { placeholder: "Search words and packs", fields: ["name"] },
      sections: [
        {
          id: "spelling", label: "Spelling", kind: "rows",
          summary: "The ordinary settings. Check spelling is on, language is automatic, and the dictionary source can be pinned.",
          settings: ["spell-enabled", "spell-language", "spell-source", "spell-technical", "spell-unknown-names", "spell-grammar"]
        },
        {
          id: "source", label: "Where dictionaries come from", kind: "list",
          summary: "Automatic prefers the operating system's own service and falls back to Puppet Master's local dictionaries.",
          items: [
            {
              id: "dict-source", name: "Dictionary source", secondary: "Automatic, system only, or local only",
              status: "ok", statusWord: "Automatic",
              requested: "Automatic",
              effective: "OS service (macOS) for English, PM local for German",
              effectiveWhy: "The operating system service has no German dictionary installed, so the local pack answers for that language.",
              fields: {
                "Automatic \u2014 OS service then PM local": "Preferred. Uses the system dictionary when it has the language, and the Puppet Master pack when it does not.",
                "System dictionaries only": "Never falls back. A language the system lacks is simply not checked.",
                "PM local dictionaries only": "Ignores the system service entirely, which makes behaviour identical across machines."
              },
              editable: [{ key: "source", label: "Dictionary source", kind: "select",
                options: ["Automatic \u2014 OS service then PM local", "System dictionaries only", "PM local dictionaries only"],
                value: "Automatic \u2014 OS service then PM local" }]
            }
          ]
        },
        {
          id: "personal", label: "Personal dictionary", kind: "list",
          summary: "Words you have added. They apply to every project on this device and are never shared.",
          items: [
            {
              id: "dict-personal", name: "Your words", secondary: personal.length + " words on this device",
              status: "ok", statusWord: personal.length + " words",
              badges: [{ kind: "scope", text: "This device", title: "Not shared with the project or with other machines" }],
              fields: { Location: "~/.puppetmaster/dictionaries/personal.txt", Shared: "No" },
              editable: [{ key: "words", label: "Words", kind: "chips", value: personal,
                help: "Adding a word here stops it being underlined anywhere in Puppet Master on this device." }],
              actions: [{ id: "dictionaries.export", label: "Export the list", kind: "quiet" }]
            }
          ]
        },
        {
          id: "project", label: "Project dictionary", kind: "list",
          summary: "Words shared with everyone working on this project, used when the project makes one available.",
          items: [
            {
              id: "dict-project", name: "orchard-api", secondary: (mgr.projectWords || []).length + " words, from the repository",
              status: "ok", statusWord: "Used when available",
              badges: [{ kind: "scope", text: "This project", title: "Checked into the repository" },
                { kind: "source", text: "Inherited", title: "Comes from the project, not from this device" }],
              fields: {
                File: ".puppetmaster/dictionary.txt",
                Words: (mgr.projectWords || []).join(", "),
                "When the project has none": "Only the personal dictionary is used. Nothing is created in the repository automatically."
              },
              editable: [
                { key: "use", label: "Use when available", kind: "toggle", value: true },
                { key: "contribute", label: "Offer to add new words to the project list", kind: "toggle", value: false,
                  help: "Off means a word you add goes to your personal list only, never into the repository." }
              ],
              actions: [{ id: "dictionaries.open_project", label: "Open the project list", kind: "quiet" }]
            }
          ]
        },
        {
          id: "packs", label: "Language packs", kind: "table",
          summary: "Dictionaries installed beyond the built-in set, and where each one came from.",
          columns: [
            { key: "source", label: "Source", weight: 2, align: "start" },
            { key: "version", label: "Version", weight: 1, align: "start" },
            { key: "words", label: "Words", weight: 1, align: "end" }
          ],
          items: (mgr.packs || []).map(function (p) {
            return {
              id: p.id, name: p.name,
              secondary: p.state === "downloading" ? "Downloading" : "Installed",
              status: p.state === "downloading" ? "loading" : "ok",
              statusWord: p.state === "downloading" ? "Downloading" : "Ready",
              fields: { source: p.source, version: p.version, words: p.words.toLocaleString() },
              actions: p.state === "downloading"
                ? [{ id: "dictionaries.cancel", label: "Cancel", kind: "quiet" }]
                : [{ id: "dictionaries.remove", label: "Remove", kind: "risky" }]
            };
          }),
          actions: [{ id: "dictionaries.add_pack", label: "Add a language pack", kind: "primary" }]
        },
        {
          id: "overrides", label: "Thread and project overrides", kind: "list",
          summary: "Places that have changed spellcheck away from the global default.",
          items: [
            {
              id: "override-thread", name: "Thread: migration notes", secondary: "Spelling language pinned",
              status: "ok", statusWord: "Overridden",
              badges: [{ kind: "scope", text: "This thread", title: "Applies to one thread only" }],
              requested: "Automatic",
              effective: "German",
              effectiveWhy: "This thread pins German, so automatic detection is not consulted inside it.",
              fields: { Scope: "One thread", "Set on": "4 days ago", "Everywhere else": "Unchanged" },
              actions: [{ id: "dictionaries.clear_override", label: "Clear the override", kind: "quiet" }]
            }
          ],
          empty: { headline: "No thread or project overrides", detail: "Every thread is using the global spelling settings.", action: null }
        },
        {
          id: "boundary", label: "What spellcheck is not", kind: "prose",
          summary: "Two things this deliberately does not do.",
          items: [
            { id: "dict-no-autocorrect", name: "There is no autocorrect. A likely misspelling is underlined and a suggestion is offered when you ask for one. Nothing you typed is ever replaced without you choosing the replacement." },
            { id: "dict-no-grammar", name: "Grammar and style assistance is a separate, optional feature and is off. It is provider-backed, so enabling it discloses the route it uses, sends the draft to that provider, costs usage, and is attributed in Usage like any other request. Spellcheck itself is local and sends nothing." },
            { id: "dict-composer", name: "The Assistant composer in this window is checked by the same local engine, so the behaviour you configure here is the behaviour you see when you type." }
          ]
        }
      ],
      diagnostics: [{ id: "diag-dict-source", label: "Show which dictionary answered", kind: "report" }],
      notes: []
    };
  });

  /* ------------------------------------------------- search entry points */

  /* Status projections and diagnostics for this domain, so searching a Console
   * word returns the same five visibly different kinds of row that searching
   * "backup" does. These are projections and log openers, never settings. */
  if (Array.isArray(D.statuses)) {
    D.statuses.push(
      { id: "status-last-notification", label: "Last notification delivered",
        explanation: "The most recent successful delivery, and to where.",
        value: "09:12 to Discord and the title-bar inbox",
        categoryId: "general", subcategoryId: "general-notifications", managerId: "manager-notifications",
        path: ["General", "Notifications & Sounds"], keywords: ["notification", "delivered", "last"] },
      { id: "status-slack-health", label: "Slack destination health",
        explanation: "What Slack returned on the last attempt.",
        value: "Failing \u2014 channel_not_found",
        categoryId: "general", subcategoryId: "general-notifications", managerId: "manager-notifications",
        path: ["General", "Notifications & Sounds"], keywords: ["slack", "failing", "channel"] },
      { id: "status-theme-active", label: "Theme in force",
        explanation: "Which theme is drawn right now, and why it is not the one that was requested.",
        value: "Glass Dark \u2014 fallback after Orchard Night failed validation",
        categoryId: "appearance", subcategoryId: "appearance-theme", managerId: "manager-appearance",
        path: ["Appearance", "Theme & material"], keywords: ["theme", "fallback", "invalid"] }
    );
  }

  if (Array.isArray(D.diagnostics)) {
    D.diagnostics.push(
      { id: "diag-notification-log", label: "Open the notification delivery log",
        explanation: "Every delivery attempt with the destination's own reply.",
        categoryId: "general", subcategoryId: "general-notifications", managerId: "manager-notifications",
        path: ["General", "Notifications & Sounds"], keywords: ["log", "delivery", "notification"] },
      { id: "diag-theme-load-log", label: "Open the theme load log",
        explanation: "Which theme files were read at startup, and why any of them were rejected.",
        categoryId: "appearance", subcategoryId: "appearance-theme", managerId: "manager-appearance",
        path: ["Appearance", "Theme & material"], keywords: ["theme", "log", "validation"] },
      { id: "diag-audio-device", label: "Open the audio device log",
        explanation: "Which output device sounds were sent to, and any device that refused.",
        categoryId: "general", subcategoryId: "general-notifications", managerId: "manager-sounds",
        path: ["General", "Notifications & Sounds"], keywords: ["audio", "device", "sound", "log"] }
    );
  }

  if (Array.isArray(D.actions)) {
    D.actions.push(
      { id: "act-test-slack", label: "Send a test notification to Slack",
        explanation: "One masked, rate-limited test message, receipted into the title-bar inbox.",
        categoryId: "general", subcategoryId: "general-notifications", managerId: "manager-notifications",
        path: ["General", "Notifications & Sounds"], keywords: ["test", "slack", "send", "notification"] },
      { id: "act-import-sound-pack", label: "Import a sound pack",
        explanation: "Check a PeonPing or OpenPeon manifest and import it if it passes.",
        categoryId: "general", subcategoryId: "general-notifications", managerId: "manager-sounds",
        path: ["General", "Notifications & Sounds"], keywords: ["pack", "import", "peonping", "sound"] },
      { id: "act-import-theme", label: "Import a custom TOML theme",
        explanation: "Validate a theme file against the schema and report the exact failing key and line.",
        categoryId: "appearance", subcategoryId: "appearance-theme", managerId: "manager-appearance",
        path: ["Appearance", "Theme & material"], keywords: ["theme", "toml", "import", "custom"] },
      { id: "act-explain-screen", label: "Explain this screen",
        explanation: "Teacher describes the current manager from its own definition, then offers the action.",
        categoryId: "general", subcategoryId: "general-teacher", managerId: "manager-teacher",
        path: ["General", "Help & Teacher"], keywords: ["teacher", "explain", "help", "guide"] }
    );
  }
})();
