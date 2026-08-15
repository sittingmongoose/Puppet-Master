/* Opus 5 — honest simulation layer, expressed as ObservableWork.
 *
 * A standalone concept cannot sign in to a provider, install a CLI, buy extra
 * usage, or fetch models.dev. The packet forbids both pretending that it did
 * and leaving the button dead. Everything here therefore returns a visible,
 * dated receipt that names the operation a production build would actually
 * invoke, and marks itself as simulated.
 *
 * 2026-08-13 dependency correction: operations no longer advance on a private
 * timer with a hidden clock. Every operation is opened through `PMWork`, asks
 * `RuntimeResourceGovernor` for a permit, and moves through named states with a
 * stated wait reason. Progress is reported only when the caller supplies a real
 * denominator; otherwise the operation stays honestly indeterminate.
 * (`02_FULL_THREAD_CURRENT_DECISION_REGISTER.md` §11.)
 *
 * Timing is seeded, not random, so a demonstration repeats identically.
 */
(function () {
  "use strict";

  function seeded(seed) {
    var s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  function hashSeed(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  var receipts = [];
  var listeners = [];

  function onReceipt(fn) {
    listeners.push(fn);
    return function () { var i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); };
  }

  function emit(receipt) {
    receipts.unshift(receipt);
    /* Byte contract rather than a bare item count (register §8.2). */
    var used = 0;
    for (var i = 0; i < receipts.length; i++) {
      used += JSON.stringify(receipts[i]).length * 2;
      if (used > 48 * 1024 || i >= 60) { receipts.length = i; break; }
    }
    listeners.forEach(function (fn) { try { fn(receipt, receipts); } catch (e) {} });
  }

  function stamp() {
    var d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  /* Default choreography when a caller does not describe its own waits. Each
   * entry is a real state with a real reason, never "Loading…". */
  var DEFAULT_STEPS = [
    { state: "starting", phase: "Preparing" },
    { state: "running", phase: "Working" },
    { state: "verifying", phase: "Verifying the result" }
  ];

  /* run() drives an operation and resolves with a receipt.
   *
   * spec = {
   *   id, label,            what the user asked for, in plain language
   *   realCall,             the production call this stands in for
   *   steps: [{ state, phase, waitReason, completed, total, progressSource }]
   *   outcome: "ok" | "degraded" | "partial" | "error" | "unavailable" | "handoff"
   *   detail,               one plain sentence describing the result
   *   canCancel, canBackground, permit, ownerDomain, scope, objectRef
   *   onWork(projection)    called on every truthful transition
   * }
   */
  function run(spec) {
    var s = spec || {};
    var rand = seeded(hashSeed(s.id || s.label || "sim"));
    var steps = (s.steps && s.steps.length) ? s.steps : DEFAULT_STEPS;
    var reduced = document.documentElement.getAttribute("data-reduced-motion") === "1";
    var total = s.duration || 1100;
    if (reduced) total = Math.min(total, 320);

    var work = window.PMWork.start({
      id: s.id, title: s.label, realCall: s.realCall,
      ownerDomain: s.ownerDomain || "settings",
      scope: s.scope || null, objectRef: s.objectRef || null,
      canCancel: s.canCancel === true,
      canBackground: s.canBackground === true,
      permit: s.permit || {},
      state: "accepted"
    });

    var report = function () { if (s.onWork) { try { s.onWork(work.get()); } catch (e) {} } };
    report();

    return new Promise(function (resolve) {
      var slice = total / steps.length;

      function finish() {
        var outcome = s.outcome || "ok";
        var terminal = outcome === "error" ? "failed"
          : outcome === "unavailable" ? "failed"
          : outcome === "handoff" ? "completed"
          : "completed";
        var receipt = {
          at: stamp(),
          id: s.id,
          label: s.label,
          realCall: s.realCall,
          outcome: outcome,
          detail: s.detail || "",
          simulated: true,
          operation_id: work.id,
          permit: work.get().permit
        };
        work.finish(terminal, s.detail, receipt);
        report();
        emit(receipt);
        if (s.onDone) s.onDone(receipt);
        resolve(receipt);
      }

      function step(i) {
        var live = work.get();
        if (live.state === "cancelled") {
          var cancelled = {
            at: stamp(), id: s.id, label: s.label, realCall: s.realCall,
            outcome: "cancelled", detail: "Cancelled before it finished.",
            simulated: true, operation_id: work.id
          };
          emit(cancelled);
          report();
          resolve(cancelled);
          return;
        }
        if (i >= steps.length) { finish(); return; }

        var st = steps[i];
        work.advance({
          state: st.state || "running",
          phase: st.phase || null,
          waitReason: st.waitReason || null,
          blockingScope: st.blockingScope,
          completed: st.completed,
          total: st.total,
          progressKind: st.progressKind,
          progressSource: st.progressSource,
          canCancel: st.canCancel !== undefined ? st.canCancel : s.canCancel === true,
          canBackground: st.canBackground !== undefined ? st.canBackground : s.canBackground === true
        });
        report();

        var jitter = 0.85 + rand() * 0.3;
        window.setTimeout(function () { step(i + 1); }, Math.round(slice * jitter));
      }

      /* A permit that was refused outright never pretends to start. */
      var opened = work.get();
      if (opened.state === "failed") {
        var blocked = {
          at: stamp(), id: s.id, label: s.label, realCall: s.realCall,
          outcome: "unavailable", detail: opened.wait_reason || "Blocked by the resource governor.",
          simulated: true, operation_id: work.id, permit: opened.permit
        };
        emit(blocked);
        report();
        resolve(blocked);
        return;
      }
      step(0);
    });
  }

  /* Operations that cannot exist outside the real app get an immediate honest
   * refusal receipt rather than a fake success. No loader flash: the answer is
   * known in the same frame (register §11 "no loader flash for instant work"). */
  function unavailable(spec) {
    var s = spec || {};
    var work = window.PMWork.start({
      id: s.id, title: s.label, realCall: s.realCall,
      ownerDomain: s.ownerDomain || "settings", state: "accepted"
    });
    var receipt = {
      at: stamp(),
      id: s.id,
      label: s.label,
      realCall: s.realCall,
      outcome: "unavailable",
      detail: s.detail || "Not available inside a standalone concept.",
      simulated: true,
      operation_id: work.id
    };
    work.finish("failed", receipt.detail, receipt);
    emit(receipt);
    return Promise.resolve(receipt);
  }

  var OUTCOME_WORD = {
    ok: "Simulated",
    degraded: "Simulated · partial",
    partial: "Simulated · partial",
    error: "Simulated · failed",
    unavailable: "Not available here",
    handoff: "Simulated · handed off",
    cancelled: "Cancelled"
  };

  window.PMSim = {
    run: run,
    unavailable: unavailable,
    onReceipt: onReceipt,
    receipts: function () { return receipts.slice(); },
    outcomeWord: function (o) { return OUTCOME_WORD[o] || "Simulated"; },
    stamp: stamp
  };
})();
