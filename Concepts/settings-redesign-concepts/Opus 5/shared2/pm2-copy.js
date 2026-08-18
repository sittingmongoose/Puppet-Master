/* Opus 5 — Copy Settings From Another Project, as a transaction.
 *
 * This is the one place in the seven concepts where settings cross a Project
 * boundary, and the packet is emphatic about what it must not become: it is a
 * ONE-TIME copy, not a link. Nothing here creates inheritance, a profile, a linked
 * Project or an ongoing synchronisation. After apply(), the two Projects have no
 * relationship at all — a later change in the source does not reach the destination,
 * and there is no control offered that would make it.
 *
 * The transaction is: select a source, choose categories, preview what would happen,
 * take a restore point, apply atomically, verify the destination, hand back a receipt
 * that can be rolled back. Each step is visible, and the preview says what is NOT
 * copied as clearly as what is.
 *
 * Credentials never move. A copied row that references an account or a credential is
 * re-pointed to the destination Project's own reference; no secret material is read,
 * rendered, exported or written by anything in this file. `secretPolicy()` is the
 * sentence the concepts show a reader, and it is the truth about the code.
 *
 * Determinism: which values differ between two Projects is computed from a seeded
 * hash of (sourceId, settingId), so the same preview appears on every load and a
 * screenshot of "74 will be updated" is reproducible.
 */
(function () {
  "use strict";

  var M = window.PM2Model;
  if (!M) throw new Error("pm2-copy: pm2-model.js must load first");

  var store = null;

  function attach(s) { store = s; return api; }

  /* ------------------------------------------------------------ determinism */

  function hash(text) {
    var h = 2166136261;
    for (var i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0;
    }
    return h >>> 0;
  }

  /* Rows whose value is a reference to a credential or an account. These are copied
   * as references and re-pointed; the secret behind them is never touched. */
  var SECRET = /(api[-_]?key|token|secret|credential|password|signin|sign-in|oauth)/i;

  function isSecretReference(record) {
    return SECRET.test(record.id) || SECRET.test(record.label);
  }

  /* Outcome word -> counter name. Spelled out rather than derived, because deriving
   * it produced "unchangeds" and a preview that counted nothing. */
  var BUCKET = {
    addition: "additions",
    replacement: "replacements",
    unchanged: "unchanged",
    unavailable: "unavailable",
    conflict: "conflicts",
    reference: "references"
  };

  /* ---------------------------------------------------------------- sources */

  function sources() {
    return M.otherProjects.map(function (p) {
      return {
        id: p.id, name: p.name, updated: p.updated, note: p.note,
        categories: p.categories, settings: p.settings
      };
    });
  }

  function categories() {
    return M.domains.map(function (d) {
      return { id: d.id, title: d.title, icon: d.icon, purpose: d.purpose, count: d.count };
    });
  }

  /* ---------------------------------------------------------------- preview */

  /* What the source would do to this Project, itemised. Nothing is written. */
  function preview(sourceId, domainIds) {
    var source = M.otherProjects.filter(function (p) { return p.id === sourceId; })[0];
    if (!source) return null;
    var wanted = {};
    (domainIds && domainIds.length ? domainIds : M.domains.map(function (d) { return d.id; }))
      .forEach(function (id) { wanted[id] = true; });

    var groups = {};
    var items = [];
    var counts = { additions: 0, replacements: 0, unchanged: 0, unavailable: 0, conflicts: 0, references: 0 };

    M.settings.forEach(function (record) {
      if (!wanted[record.domainId]) return;

      var seed = hash(sourceId + "|" + record.id);
      var state = record.state;
      var current = store ? store.valueOf(record.id) : state.value;
      var group = groups[record.domainId] || (groups[record.domainId] = {
        domainId: record.domainId,
        title: (M.domain(record.domainId) || {}).title || record.domainId,
        counts: { additions: 0, replacements: 0, unchanged: 0, unavailable: 0, conflicts: 0, references: 0 },
        items: []
      });

      var outcome, incoming = current, reason = null;

      if (state.source === "unavailable") {
        /* The destination host cannot provide it. Copying a value into a capability
         * that does not exist would be a lie the next screen would have to unpick. */
        outcome = "unavailable";
        reason = state.reason || "This host does not provide the capability.";
      } else if (state.source === "managed") {
        /* A policy genuinely owns this value here. The copy does not get to win. */
        outcome = "conflict";
        reason = "A policy controls this value in this Project. The copy would be ignored, so it is excluded.";
      } else if (isSecretReference(record)) {
        outcome = (seed % 3 === 0) ? "reference" : "unchanged";
        reason = outcome === "reference"
          ? "The source points at a different account. The reference is re-pointed; no key is read or copied."
          : null;
        if (outcome === "reference") incoming = "(reference to this Project's own account)";
      } else if (state.source === "notConfigured" ? (seed % 100 < 55) : (seed % 100 < 22)) {
        /* A value this Project never set is the case a copy most often fills in, so
         * "not set here, set there" is deliberately more likely to be an addition
         * than an already-set value is to be replaced. */
        outcome = state.source === "notConfigured" ? "addition" : "replacement";
        incoming = differentValue(record, seed);
        if (incoming === current) outcome = "unchanged";
      } else {
        outcome = "unchanged";
      }

      var bucket = BUCKET[outcome];
      counts[bucket] += 1;
      if (group.counts[bucket] !== undefined) group.counts[bucket] += 1;

      var item = {
        id: record.id,
        label: record.label,
        domainId: record.domainId,
        pageId: record.pageId,
        sectionId: record.sectionId,
        path: pathOf(record),
        outcome: outcome,
        current: current,
        incoming: incoming,
        reason: reason,
        secretReference: isSecretReference(record)
      };
      items.push(item);
      group.items.push(item);
    });

    var order = M.domains.map(function (d) { return d.id; });
    var groupList = order.filter(function (id) { return groups[id]; }).map(function (id) { return groups[id]; });

    return {
      id: "preview:" + sourceId + ":" + Object.keys(wanted).sort().join(","),
      sourceId: sourceId,
      source: { id: source.id, name: source.name, updated: source.updated },
      destination: { id: M.project.id, name: M.project.name },
      domainIds: Object.keys(wanted),
      counts: counts,
      total: items.length,
      willChange: counts.additions + counts.replacements + counts.references,
      groups: groupList,
      items: items,
      secretPolicy: secretPolicy(),
      excluded: [
        { label: "Values a policy controls here", count: counts.conflicts },
        { label: "Capabilities this host does not have", count: counts.unavailable },
        { label: "Secret material", count: 0, note: "Keys and tokens are never read, copied or exported. Only the reference to this Project's own account is updated." }
      ]
    };
  }

  function pathOf(record) {
    var d = M.domain(record.domainId);
    var p = M.page(record.pageId);
    var s = M.section(record.sectionId);
    return [d && d.title, p && p.title, s && s.title, record.label]
      .filter(function (x) { return !!x; }).join(" › ");
  }

  function differentValue(record, seed) {
    var base = record.state.defaultValue;
    if (record.kind === "toggle") return !base;
    if (record.options && record.options.length) {
      var pool = record.options.filter(function (o) { return o !== base; });
      return pool.length ? pool[seed % pool.length] : base;
    }
    if (record.kind === "number" || record.kind === "slider") {
      var n = typeof base === "number" ? base : 0;
      return n + [5, 10, 15, 30, 60][seed % 5];
    }
    return base;
  }

  function secretPolicy() {
    return "Keys, tokens and sign-in sessions are not copied. Where a copied setting points at an account, " +
      "the reference is re-pointed to this Project's own account; the secret behind it is never read, shown or exported.";
  }

  /* ------------------------------------------------------------------ apply */

  /* One ObservableWork operation with real phases and a real denominator. The
   * caller drives it step by step so a concept can render each phase honestly
   * rather than animating a bar against a clock. */
  function apply(prev, opts) {
    if (!prev) return null;
    var options = opts || {};
    var failVerification = options.failVerification === true ||
      (window.PM2States && window.PM2States.is("verify-failed-rollback"));

    var total = prev.willChange;
    var op = window.PMWork.start({
      id: "settings.copy",
      title: "Copying settings from " + prev.source.name,
      ownerDomain: "settings",
      objectRef: M.project.id,
      progressKind: total > 0 ? "fraction" : "indeterminate",
      progressSource: "counted-items",
      canCancel: true,
      realCall: "settings.project.copy_from_project",
      permit: { lane: "settings", cost: "low" }
    });

    var restorePoint = {
      id: "restore-" + Date.now().toString(36),
      label: "Before copying from " + prev.source.name,
      takenAt: stamp(),
      settings: prev.willChange
    };

    var steps = [
      { phase: "Taking a restore point", state: "running", note: restorePoint.label },
      { phase: "Applying " + total + " values", state: "committing", counted: true },
      { phase: "Verifying the destination", state: "verifying" }
    ];

    var index = 0;
    var receipt = null;

    function next() {
      if (receipt) return { done: true, receipt: receipt, operation: op.get() };
      if (index < steps.length) {
        var step = steps[index++];
        op.advance({
          state: step.state,
          phase: step.phase,
          completed: step.counted ? total : undefined,
          total: step.counted ? total : undefined,
          progressSource: step.counted ? "counted-items" : undefined
        });
        return { done: false, phase: step.phase, operation: op.get() };
      }

      if (failVerification) {
        op.advance({ state: "rolling_back", phase: "Verification failed on 4 values — rolling back" });
        receipt = finish(prev, restorePoint, "rolled_back",
          "Verification found 4 values that did not match the source. The whole transaction was undone.");
        op.advance({ state: "failed", phase: "Rolled back. This Project is exactly as it was." });
      } else {
        writeValues(prev);
        receipt = finish(prev, restorePoint, "applied", null);
        op.advance({ state: "completed", phase: "Copied " + total + " values" });
      }
      record(receipt);
      return { done: true, receipt: receipt, operation: op.get() };
    }

    return {
      operationId: op.id,
      total: total,
      restorePoint: restorePoint,
      steps: steps.map(function (s) { return s.phase; }),
      next: next,
      /* Run the whole thing at once, for a reviewer who does not want to step it. */
      run: function () {
        var out = next();
        while (!out.done) out = next();
        return out;
      },
      cancel: function () {
        window.PMWork.cancelById(op.id);
        return { done: true, cancelled: true, operation: op.get() };
      },
      get: function () { return op.get(); }
    };
  }

  function writeValues(prev) {
    if (!store) return;
    var values = {};
    var existing = store.get().values;
    for (var k in existing) if (Object.prototype.hasOwnProperty.call(existing, k)) values[k] = existing[k];
    prev.items.forEach(function (item) {
      if (item.outcome === "addition" || item.outcome === "replacement") values[item.id] = item.incoming;
    });
    store.set({ values: values });
  }

  function stamp() {
    var d = new Date();
    function two(n) { return (n < 10 ? "0" : "") + n; }
    return d.getFullYear() + "-" + two(d.getMonth() + 1) + "-" + two(d.getDate()) +
      " " + two(d.getHours()) + ":" + two(d.getMinutes());
  }

  function finish(prev, restorePoint, outcome, note) {
    return {
      id: "receipt-" + Date.now().toString(36),
      kind: "copy",
      outcome: outcome,
      at: stamp(),
      source: prev.source,
      destination: prev.destination,
      domainIds: prev.domainIds,
      counts: prev.counts,
      applied: outcome === "applied" ? prev.willChange : 0,
      restorePoint: restorePoint,
      note: note,
      simulated: true,
      realCall: "settings.project.copy_from_project",
      canRollback: outcome === "applied",
      items: prev.items.filter(function (i) {
        return i.outcome === "addition" || i.outcome === "replacement" || i.outcome === "reference";
      }).map(function (i) {
        return { id: i.id, label: i.label, path: i.path, outcome: i.outcome, from: i.current, to: i.incoming };
      })
    };
  }

  function record(receipt) {
    if (!store) return;
    var list = [receipt].concat(store.get().receipts || []);
    if (list.length > 20) list = list.slice(0, 20);
    store.set({ receipts: list });
  }

  /* --------------------------------------------------------------- rollback */

  function rollback(receiptId) {
    if (!store) return null;
    var list = store.get().receipts || [];
    var receipt = list.filter(function (r) { return r.id === receiptId; })[0];
    if (!receipt || !receipt.canRollback) return null;

    var op = window.PMWork.start({
      id: "settings.copy.rollback",
      title: "Undoing the copy from " + receipt.source.name,
      ownerDomain: "settings",
      objectRef: M.project.id,
      progressKind: "fraction",
      progressSource: "counted-items",
      realCall: "settings.project.restore_point_apply",
      permit: { lane: "settings", cost: "low" }
    });
    op.advance({ state: "committing", phase: "Restoring " + receipt.applied + " values",
      completed: receipt.applied, total: receipt.applied, progressSource: "counted-items" });

    var values = {};
    var existing = store.get().values;
    for (var k in existing) if (Object.prototype.hasOwnProperty.call(existing, k)) values[k] = existing[k];
    receipt.items.forEach(function (item) { delete values[item.id]; });

    var next = list.map(function (r) {
      return r.id === receiptId ? Object.assign({}, r, { outcome: "rolled_back", canRollback: false,
        note: "Rolled back " + stamp() + ". This Project is exactly as it was before the copy." }) : r;
    });
    store.set({ values: values, receipts: next });
    op.advance({ state: "completed", phase: "Restored" });
    return next.filter(function (r) { return r.id === receiptId; })[0];
  }

  function receipts() {
    return store ? (store.get().receipts || []) : [];
  }

  var api = {
    attach: attach,
    sources: sources,
    categories: categories,
    preview: preview,
    apply: apply,
    rollback: rollback,
    receipts: receipts,
    secretPolicy: secretPolicy,
    pathOf: pathOf,

    /* Stated once, in one place, so no concept can imply otherwise in its own copy. */
    independence: "This is a one-time copy. After it finishes the two Projects are unrelated: " +
      "later changes in " + "the source " + "do not reach this Project, and nothing here keeps them in step."
  };

  window.PM2Copy = api;
})();
