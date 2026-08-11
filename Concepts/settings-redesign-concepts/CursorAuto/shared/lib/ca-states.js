/* ============================================================================
   ca-states.js — demo States drawer for CursorAuto settings concepts
   ----------------------------------------------------------------------------
   Mounts a floating drawer with seeded fixtures: Baseline, Calm, Continue
   setup, Recommended, Attention-heavy, Usage exhausted, Invocation failed,
   Managed workspace, plus Refresh catalogs / Reconnect triggers.
   ========================================================================== */
(function () {
  "use strict";

  var STATES = [
    { id: "baseline", label: "Baseline", hint: "Seeded demo as shipped" },
    { id: "calm", label: "Calm", hint: "No notices on Home" },
    { id: "continue-setup", label: "Continue setup", hint: "Only setup notices" },
    { id: "recommended", label: "Recommended", hint: "Only recommended notices" },
    { id: "attention-heavy", label: "Attention-heavy", hint: "All attention notices" },
    { id: "usage-exhausted", label: "Usage exhausted", hint: "Pressure critical + projection" },
    { id: "invocation-failed", label: "Invocation failed", hint: "Auth ok, calls failing" },
    { id: "managed-workspace", label: "Managed workspace", hint: "Force managed overrides" }
  ];

  function applyState(id) {
    var DEMO = window.PM_SETTINGS_DEMO;
    var V = window.CAViews;
    if (!DEMO || !V || !window.PMStore) return;

    if (id === "baseline") {
      PMStore.resetDemo();
      PMStore.receipt("Baseline restored", "ok");
      return;
    }

    if (id === "calm") {
      PMStore.set("calmDemo", true);
      PMStore.set("dismissedNotices", DEMO.notices.map(function (n) { return n.id; }));
      PMStore.receipt("Calm state — Home shows the empty triage message", "ok");
      return;
    }

    PMStore.set("calmDemo", false);

    if (id === "continue-setup") {
      var setupOnly = DEMO.notices.filter(function (n) { return n.kind !== "setup"; }).map(function (n) { return n.id; });
      PMStore.set("dismissedNotices", setupOnly);
      PMStore.receipt("Continue-setup — only setup notices remain", "info");
      return;
    }

    if (id === "recommended") {
      var recOnly = DEMO.notices.filter(function (n) { return n.kind !== "recommended"; }).map(function (n) { return n.id; });
      PMStore.set("dismissedNotices", recOnly);
      PMStore.receipt("Recommended — only recommended notices remain", "info");
      return;
    }

    if (id === "attention-heavy") {
      var attnKeep = DEMO.notices.filter(function (n) { return n.kind !== "attention"; }).map(function (n) { return n.id; });
      PMStore.set("dismissedNotices", attnKeep);
      PMStore.receipt("Attention-heavy — attention notices only", "warn");
      return;
    }

    if (id === "usage-exhausted") {
      var providers = V.clone(PMStore.get("providers", DEMO.providers));
      providers.forEach(function (p) {
        if (p.usageSnapshot) {
          p.usageSnapshot.includedRemaining = "0%";
          p.usageSnapshot.pressure = "critical";
          p.usageSnapshot.projection = "Included usage is exhausted — extra balance or pause applies next.";
          p.usageSnapshot.extraBalance = "$0.00";
        }
        (p.accounts || []).forEach(function (a) { a.usagePressure = "critical"; });
      });
      PMStore.set("providers", providers);
      PMStore.receipt("Usage exhausted fixture applied to provider snapshots", "warn");
      return;
    }

    if (id === "invocation-failed") {
      var plist = V.clone(PMStore.get("providers", DEMO.providers));
      plist.forEach(function (p) {
        if (p.id === "anthropic" || (p.accounts && p.accounts.length)) {
          p.lastError = "Auth is valid, but the last model call failed a readiness check (simulated).";
          (p.accounts || []).forEach(function (a) {
            if (a.active || a.enabled) a.health = "auth-ok-invocation-failed";
          });
        }
      });
      PMStore.set("providers", plist);
      PMStore.receipt("Invocation-failed fixture — auth ≠ ready", "warn");
      return;
    }

    if (id === "managed-workspace") {
      var ov = V.overrides();
      Object.keys(DEMO.settings).forEach(function (sid) {
        var s = DEMO.settings[sid];
        if (s && (s.state === "managed" || s.managedReason)) {
          /* keep seeded managed truth; mark a few standard rows as overridden then managed-feel via receipt */
        }
      });
      var sample = ["permissions.filesafe-mode", "planning.goal-concurrency", "context.compaction-safeguard"];
      sample.forEach(function (sid) {
        if (DEMO.settings[sid]) ov[sid] = DEMO.settings[sid].defaultValue;
      });
      PMStore.set("overrides", ov);
      PMStore.receipt("Managed workspace — sample overrides set; managed rows stay non-editable where seeded", "info");
    }
  }

  function refreshCatalogs() {
    var V = window.CAViews;
    if (!V || !window.PMStore) return;
    var providers = V.clone(PMStore.get("providers", []));
    providers.forEach(function (p) {
      if (p.catalog) {
        p.catalog.refreshing = false;
        p.catalog.version = String(Number(p.catalog.version || 1) + 1);
        (p.accounts || []).forEach(function (a) {
          a.lastCatalogRefresh = "Just now (simulated)";
        });
      }
    });
    PMStore.set("providers", providers);
    PMStore.receipt("Catalog refresh simulated — last known good kept during refresh", "ok");
  }

  function reconnect() {
    var V = window.CAViews;
    if (!V || !window.PMStore) return;
    var providers = V.clone(PMStore.get("providers", []));
    providers.forEach(function (p) {
      p.lastError = null;
      (p.accounts || []).forEach(function (a) {
        if (a.health === "auth-ok-invocation-failed") a.health = "ready";
      });
    });
    PMStore.set("providers", providers);
    PMStore.receipt("Reconnect simulated — accounts marked ready where auth was already ok", "ok");
  }

  function mount(opts) {
    opts = opts || {};
    var host = opts.host || document.body;
    if (host.querySelector(".ca-states")) return;

    var drawer = document.createElement("div");
    drawer.className = "ca-states";
    drawer.innerHTML =
      '<button type="button" class="ca-states-fab" aria-expanded="false" aria-controls="ca-states-panel">States</button>' +
      '<div class="ca-states-panel" id="ca-states-panel" hidden>' +
      '<div class="ca-states-h">Demo states</div>' +
      '<p class="ca-states-note">Fixtures for review. Receipts are simulated.</p>' +
      '<div class="ca-states-list" role="list"></div>' +
      '<div class="ca-states-actions">' +
      '<button type="button" class="ca-btn" data-variant="quiet" data-ca-states="refresh">Refresh catalogs</button>' +
      '<button type="button" class="ca-btn" data-variant="quiet" data-ca-states="reconnect">Reconnect</button>' +
      "</div></div>";

    var list = drawer.querySelector(".ca-states-list");
    STATES.forEach(function (st) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "ca-states-item";
      b.setAttribute("data-state-id", st.id);
      b.innerHTML = "<b>" + st.label + "</b><span>" + st.hint + "</span>";
      list.appendChild(b);
    });

    var fab = drawer.querySelector(".ca-states-fab");
    var panel = drawer.querySelector(".ca-states-panel");
    fab.addEventListener("click", function () {
      var open = panel.hidden;
      panel.hidden = !open;
      fab.setAttribute("aria-expanded", String(open));
    });

    drawer.addEventListener("click", function (ev) {
      var item = ev.target.closest && ev.target.closest("[data-state-id]");
      if (item) {
        applyState(item.getAttribute("data-state-id"));
        return;
      }
      var act = ev.target.closest && ev.target.closest("[data-ca-states]");
      if (!act) return;
      var kind = act.getAttribute("data-ca-states");
      if (kind === "refresh") refreshCatalogs();
      if (kind === "reconnect") reconnect();
    });

    host.appendChild(drawer);
  }

  window.CAStates = { mount: mount, apply: applyState, refreshCatalogs: refreshCatalogs, reconnect: reconnect };
})();
