/* Opus 5 — honest simulation layer.
 *
 * A standalone concept cannot sign in to a provider, install a CLI, buy extra
 * usage, or fetch models.dev. The packet forbids both pretending that it did and
 * leaving the button dead. Everything here therefore returns a visible, dated
 * receipt that names the operation a production build would actually invoke,
 * and marks itself as simulated.
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
    if (receipts.length > 60) receipts.length = 60;
    listeners.forEach(function (fn) { try { fn(receipt, receipts); } catch (e) {} });
  }

  function stamp() {
    var d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  /* run() drives a short multi-phase operation and resolves with a receipt.
   *
   * spec = {
   *   id, label,            what the user asked for, in plain language
   *   realCall,             the production call this stands in for
   *   phases: [{ label, weight }]
   *   outcome: "ok" | "degraded" | "error" | "unavailable" | "handoff"
   *   detail,               one plain sentence describing the result
   *   onPhase(phase, index) progress callback
   * }
   */
  function run(spec) {
    var rand = seeded(hashSeed(spec.id || spec.label || "sim"));
    var phases = spec.phases && spec.phases.length ? spec.phases : [{ label: spec.label, weight: 1 }];
    var reduced = document.documentElement.getAttribute("data-reduced-motion") === "1";
    var total = spec.duration || 1100;
    if (reduced) total = Math.min(total, 320);

    return new Promise(function (resolve) {
      var elapsed = 0;
      var sumWeight = phases.reduce(function (a, p) { return a + (p.weight || 1); }, 0);

      function step(i) {
        if (i >= phases.length) {
          var receipt = {
            at: stamp(),
            id: spec.id,
            label: spec.label,
            realCall: spec.realCall,
            outcome: spec.outcome || "ok",
            detail: spec.detail || "",
            simulated: true
          };
          emit(receipt);
          if (spec.onDone) spec.onDone(receipt);
          resolve(receipt);
          return;
        }
        var p = phases[i];
        var slice = total * ((p.weight || 1) / sumWeight);
        var jitter = 0.85 + rand() * 0.3;
        if (spec.onPhase) spec.onPhase(p, i, phases.length);
        window.setTimeout(function () { elapsed += slice; step(i + 1); }, Math.round(slice * jitter));
      }

      step(0);
    });
  }

  /* Operations that cannot exist outside the real app get an immediate honest
   * refusal receipt rather than a fake success. */
  function unavailable(spec) {
    var receipt = {
      at: stamp(),
      id: spec.id,
      label: spec.label,
      realCall: spec.realCall,
      outcome: "unavailable",
      detail: spec.detail || "Not available inside a standalone concept.",
      simulated: true
    };
    emit(receipt);
    return Promise.resolve(receipt);
  }

  var OUTCOME_WORD = {
    ok: "Simulated",
    degraded: "Simulated · partial",
    error: "Simulated · failed",
    unavailable: "Not available here",
    handoff: "Simulated · handed off"
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
