/* ============================================================================
   ca-observable-work.js — CursorAuto ObservableWork projection (demo)
   ----------------------------------------------------------------------------
   Truthful progress/wait projection for Settings demos. Settings does NOT admit
   work and does NOT invent a second RuntimeResourceGovernor. This module only
   projects phase/state/wait/progress_kind for simulated operations.

   Authority: decision register §11 + DRY singular ObservableWork owner.
   Determinate progress only when completed+total are trustworthy numbers.
   No elapsed-time fake percentages. Instant work skips loader flash.
   Hidden/disposed hosts stop clocks. Reduced-motion uses static form.
   ========================================================================== */
(function () {
  "use strict";

  var STATES = {
    accepted: true,
    queued: true,
    starting: true,
    running: true,
    synchronizing: true,
    waiting_provider: true,
    waiting_host: true,
    waiting_network: true,
    waiting_resource: true,
    waiting_permission: true,
    waiting_for_sign_in: true,
    waiting_for_idle: true,
    waiting_user: true,
    retrying: true,
    backgrounded: true,
    degraded: true,
    stalled: true,
    committing: true,
    verifying: true,
    rolling_back: true,
    completed: true,
    failed: true,
    cancelled: true,
    recovery_required: true
  };

  var TERMINAL = {
    completed: true,
    failed: true,
    cancelled: true,
    recovery_required: true
  };

  var active = Object.create(null);
  var seq = 0;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function reducedMotion() {
    try {
      if (document.documentElement.getAttribute("data-motion") === "reduced") return true;
      return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (err) {
      return false;
    }
  }

  function normalize(snap) {
    snap = snap || {};
    var state = String(snap.state || "running");
    if (!STATES[state]) state = "running";
    var kind = snap.progress_kind || "unknown";
    if (kind !== "determinate" && kind !== "indeterminate" && kind !== "none") kind = "unknown";
    var completed = snap.completed;
    var total = snap.total;
    var determinate =
      kind === "determinate" &&
      typeof completed === "number" &&
      typeof total === "number" &&
      isFinite(completed) &&
      isFinite(total) &&
      total > 0;
    return {
      operation_id: snap.operation_id || ("ca-ow-" + (++seq)),
      owner_domain: snap.owner_domain || "settings",
      title: snap.title || "Working",
      human_phase: snap.human_phase || snap.phase || "Working",
      state: state,
      progress_kind: determinate ? "determinate" : kind === "none" ? "none" : "indeterminate",
      completed: determinate ? completed : null,
      total: determinate ? total : null,
      wait_reason: snap.wait_reason || snap.wait || "",
      progress_source: snap.progress_source || "unknown",
      can_cancel: !!snap.can_cancel,
      can_background: !!snap.can_background,
      can_retry: !!snap.can_retry,
      last_known_good: snap.last_known_good !== false,
      message: snap.message || "",
      receipt_kind: snap.receipt_kind || (state === "failed" ? "danger" : state === "completed" ? "ok" : "info")
    };
  }

  function renderInto(host, snap) {
    if (!host) return;
    var n = normalize(snap);
    var busy = !TERMINAL[n.state];
    var rm = reducedMotion();
    var wait = n.wait_reason ? '<div class="ca-ow-wait">Waiting: ' + esc(n.wait_reason) + "</div>" : "";
    var bar = "";
    if (n.progress_kind === "determinate") {
      var pct = Math.max(0, Math.min(100, Math.round((n.completed / n.total) * 100)));
      bar =
        '<div class="ca-ow-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' +
        esc(n.total) +
        '" aria-valuenow="' +
        esc(n.completed) +
        '"><span style="inline-size:' +
        pct +
        '%"></span></div>' +
        '<div class="ca-ow-units">' +
        esc(n.completed) +
        " / " +
        esc(n.total) +
        " · source " +
        esc(n.progress_source) +
        "</div>";
    } else if (n.progress_kind !== "none" && busy) {
      bar =
        '<div class="ca-ow-pulse' +
        (rm ? " is-static" : "") +
        '" data-ca-ow-pulse="1" aria-hidden="true"></div>' +
        '<div class="ca-ow-units">Progress unknown · source ' +
        esc(n.progress_source) +
        "</div>";
    }
    var actions = "";
    if (n.can_cancel && busy) {
      actions +=
        '<button type="button" class="ca-btn" data-variant="quiet" data-ca-ow-act="cancel">Cancel</button>';
    }
    if (n.can_retry && (n.state === "failed" || n.state === "cancelled" || n.state === "recovery_required")) {
      actions +=
        '<button type="button" class="ca-btn" data-variant="quiet" data-ca-ow-act="retry">Retry</button>';
    }
    if (n.can_background && busy) {
      actions +=
        '<button type="button" class="ca-btn" data-variant="quiet" data-ca-ow-act="background">Background</button>';
    }
    host.setAttribute("data-ca-ow", n.operation_id);
    host.setAttribute("data-ca-ow-state", n.state);
    host.hidden = false;
    host.innerHTML =
      '<div class="ca-ow" data-state="' +
      esc(n.state) +
      '" data-busy="' +
      (busy ? "1" : "0") +
      '">' +
      '<div class="ca-ow-title">' +
      esc(n.title) +
      "</div>" +
      '<div class="ca-ow-phase">' +
      esc(n.human_phase) +
      ' <span class="ca-badge" data-kind="state" data-state="' +
      (busy ? "custom" : n.state === "failed" ? "not-configured" : "default") +
      '">' +
      esc(n.state.replace(/_/g, " ")) +
      "</span></div>" +
      (n.message ? '<div class="ca-ow-msg">' + esc(n.message) + "</div>" : "") +
      wait +
      bar +
      (n.last_known_good
        ? '<div class="ca-ow-lkg">Cached values remain visible while this reconciles.</div>'
        : "") +
      (actions ? '<div class="ca-ow-actions">' + actions + "</div>" : "") +
      "</div>";
  }

  function attach(opts) {
    opts = opts || {};
    var host = opts.host;
    if (!host) return null;
    var timers = [];
    var disposed = false;
    var current = normalize(opts.snapshot || { state: "accepted", human_phase: "Accepted", progress_kind: "none" });

    function clearTimers() {
      while (timers.length) {
        var t = timers.pop();
        try {
          window.clearTimeout(t);
        } catch (err) {}
      }
    }

    function update(snapshot) {
      if (disposed) return current;
      current = normalize(Object.assign({}, current, snapshot || {}));
      /* Instant terminal with progress_kind none: no loader flash. */
      if (TERMINAL[current.state] && current.progress_kind === "none" && !opts.forcePaint) {
        host.hidden = true;
        host.innerHTML = "";
        host.removeAttribute("data-ca-ow-state");
      } else {
        renderInto(host, current);
      }
      if (opts.onUpdate) {
        try {
          opts.onUpdate(current);
        } catch (err) {}
      }
      if (TERMINAL[current.state] && opts.receipt !== false && current.message) {
        if (window.PMStore && PMStore.receipt) {
          PMStore.receipt(current.message, current.receipt_kind || "info");
        }
      }
      return current;
    }

    function runPhases(phases, done) {
      /* phases: [{delay, snapshot}] — delays are UX pacing only; progress never derived from time. */
      clearTimers();
      var i = 0;
      function step() {
        if (disposed) return;
        if (i >= phases.length) {
          if (typeof done === "function") done(current);
          return;
        }
        var stepSpec = phases[i++];
        update(stepSpec.snapshot || stepSpec);
        var delay = typeof stepSpec.delay === "number" ? stepSpec.delay : 0;
        if (reducedMotion()) delay = Math.min(delay, 40);
        if (i >= phases.length && delay <= 0) {
          if (typeof done === "function") done(current);
          return;
        }
        timers.push(
          window.setTimeout(function () {
            step();
          }, Math.max(0, delay))
        );
      }
      step();
    }

    function dispose() {
      disposed = true;
      clearTimers();
      try {
        host.hidden = true;
        host.innerHTML = "";
        host.removeAttribute("data-ca-ow");
        host.removeAttribute("data-ca-ow-state");
      } catch (err) {}
      delete active[current.operation_id];
    }

    if (opts.snapshot) update(opts.snapshot);
    active[current.operation_id] = { update: update, dispose: dispose, get: function () { return current; } };

    return {
      update: update,
      runPhases: runPhases,
      dispose: dispose,
      get: function () {
        return current;
      },
      host: host
    };
  }

  function ensureHost(root, selector) {
    if (!root) return null;
    var sel = selector || "[data-ca-ow-host]";
    var host = root.querySelector(sel);
    if (host) return host;
    host = document.createElement("div");
    host.className = "ca-ow-host";
    host.setAttribute("data-ca-ow-host", "1");
    host.hidden = true;
    var pane = root.querySelector("[data-ca-phase]");
    if (pane && pane.parentNode) pane.parentNode.insertBefore(host, pane.nextSibling);
    else root.insertBefore(host, root.firstChild);
    return host;
  }

  function disposeAll() {
    Object.keys(active).forEach(function (id) {
      try {
        active[id].dispose();
      } catch (err) {}
    });
  }

  window.CAObservableWork = {
    attach: attach,
    ensureHost: ensureHost,
    normalize: normalize,
    renderInto: renderInto,
    disposeAll: disposeAll,
    STATES: Object.keys(STATES),
    /* Explicit non-ownership: admission stays with RuntimeResourceGovernor. */
    admissionOwner: "RuntimeResourceGovernor",
    projectionOwner: "ObservableWork"
  };
})();
