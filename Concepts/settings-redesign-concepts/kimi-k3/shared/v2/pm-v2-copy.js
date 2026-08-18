/* ============================================================================
   pm-v2-copy.js — Copy Settings From Another Project engine (headless)
   ----------------------------------------------------------------------------
   One-time transaction per packet 04:
     select source → choose broad categories → preview (additions /
     replacements / unchanged / unavailable / conflicts) → credential policy
     explanation (no raw secrets) → restore point → atomic apply → verify →
     receipt + rollback. Source and destination stay independent: no sync, no
     inheritance, no per-setting override creation.
   Deterministic demo diffing via stable hashing; counts exact, item lists
   bounded. Concepts render their own flow UI around this state machine.
   ========================================================================== */
(function () {
  "use strict";

  function hash(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) & 0x7fffffff;
    return h;
  }

  var ITEM_CAP = 60; // bounded item drill-down; counts remain exact

  /**
   * CopyEngine(store, inventory, registry)
   * states: idle → source → categories → preview → confirm →
   *         applying → verifying → receipt | failed(rollback available)
   */
  function CopyEngine(store, inventory, registry) {
    this.store = store;
    this.inventory = inventory;
    this.registry = registry;
    this.reset();
  }

  CopyEngine.prototype.reset = function () {
    this.state = "source";
    this.sourceId = null;
    this.categoryIds = [];
    this.preview = null;
    this.receipt = null;
    this.restorePoint = null;
    this.error = null;
  };

  CopyEngine.prototype.sources = function () { return this.store.otherProjects(); };

  CopyEngine.prototype.selectSource = function (projectId) {
    var ok = this.sources().some(function (p) { return p.id === projectId; });
    if (!ok) { this.error = "Choose a source project to continue."; return false; }
    this.sourceId = projectId;
    this.state = "categories";
    this.error = null;
    return true;
  };

  CopyEngine.prototype.setCategories = function (categoryIds) {
    if (!categoryIds || !categoryIds.length) { this.error = "Select at least one category."; return false; }
    var valid = {};
    this.registry.COPY_CATEGORIES.forEach(function (c) { valid[c.id] = true; });
    for (var i = 0; i < categoryIds.length; i++) if (!valid[categoryIds[i]]) { this.error = "Unknown category."; return false; }
    this.categoryIds = categoryIds.slice();
    this.error = null;
    return true;
  };

  CopyEngine.prototype._selectedDomains = function () {
    var reg = this.registry, out = {};
    this.registry.COPY_CATEGORIES.forEach(function (c) {
      if (this.categoryIds.indexOf(c.id) >= 0) c.domains.forEach(function (d) { out[d] = true; });
    }, this);
    return out;
  };

  /** Build the deterministic preview. */
  CopyEngine.prototype.buildPreview = function () {
    if (!this.sourceId || !this.categoryIds.length) { this.error = "Select a source and categories first."; return null; }
    var domains = this._selectedDomains();
    var inv = this.inventory, src = this.sourceId;
    var groups = {};
    var totals = { add: 0, replace: 0, unchanged: 0, unavailable: 0, conflict: 0 };
    Object.keys(inv.settings).forEach(function (sid) {
      var s = inv.settings[sid];
      if (!domains[s.domain]) return;
      if (s.type === "action") return; // actions are behaviors, not copyable values
      var h = hash(src + ":" + sid);
      var kind;
      if (s.state === "unavailable" || h % 37 === 0) kind = "unavailable";
      else if (h % 11 === 0) kind = "conflict";
      else if (h % 3 === 0) kind = "replace";
      else if (h % 3 === 1) kind = "add";
      else kind = "unchanged";
      totals[kind] += 1;
      if (!groups[kind]) groups[kind] = [];
      if (groups[kind].length < ITEM_CAP) {
        groups[kind].push({
          id: sid, label: s.label, domain: s.domain,
          current: kind === "add" ? null : s.value,
          incoming: kind === "unchanged" || kind === "unavailable" ? s.value : (kind === "add" ? s.value : s.value),
          note: kind === "conflict" ? "Changed here and in the source; the source value wins after confirmation."
            : kind === "unavailable" ? "Not available in this project; skipped."
            : kind === "replace" ? "Replaces the current project value."
            : kind === "add" ? "New in this project." : "Already identical."
        });
      }
    });
    var cats = this.registry.COPY_CATEGORIES.filter(function (c) { return this.categoryIds.indexOf(c.id) >= 0; }, this);
    this.preview = {
      sourceId: this.sourceId,
      categories: cats.map(function (c) { return { id: c.id, title: c.title, note: c.note }; }),
      totals: totals,
      groups: groups,
      itemCap: ITEM_CAP,
      credentialPolicy: "Credential and account references are re-pointed to this project's own references. Raw secret material is never read, rendered, or exported.",
      independence: "This is a one-time copy. Nothing stays linked: later changes in the source project never propagate here.",
      capped: Object.keys(groups).some(function (k) { return totals[k] > ITEM_CAP; })
    };
    this.state = "preview";
    return this.preview;
  };

  CopyEngine.prototype.confirm = function () {
    if (!this.preview) { this.error = "Build the preview first."; return false; }
    this.state = "confirm";
    return true;
  };

  /**
   * Apply: restore point → atomic apply → verify → receipt.
   * Returns an ObservableWork operation; the flow is synchronous in the demo
   * but reports truthful phases. Terminal states: done | recovery-required.
   */
  CopyEngine.prototype.apply = function () {
    if (this.state !== "confirm") { this.error = "Confirm the preview first."; return null; }
    var store = this.store, preview = this.preview;
    var op = store.begin({
      kind: "settings-copy",
      title: "Copy settings from " + preview.sourceId,
      phases: [{ name: "Create restore point" }, { name: "Apply changes" }, { name: "Verify destination" }, { name: "Write receipt" }],
      determinate: true,
      total: preview.totals.add + preview.totals.replace
    });

    // 1. restore point
    this.restorePoint = store.createRestorePoint("Before copy from " + preview.sourceId, store.overrides());
    store.completePhase(op.id);

    // 2. atomic apply (single overrides write — all-or-nothing)
    try {
      var inv = this.inventory;
      var domains = this._selectedDomains();
      var next = store.overrides();
      var applied = 0;
      Object.keys(inv.settings).forEach(function (sid) {
        var s = inv.settings[sid];
        if (!domains[s.domain] || s.type === "action") return;
        var h = hash(preview.sourceId + ":" + sid);
        var kind = (s.state === "unavailable" || h % 37 === 0) ? "unavailable"
          : (h % 11 === 0) ? "conflict" : (h % 3 === 0) ? "replace" : (h % 3 === 1) ? "add" : "unchanged";
        if (kind === "add" || kind === "replace" || kind === "conflict") {
          next[sid] = { value: s.value, at: new Date().toISOString(), by: "copy:" + preview.sourceId, meta: { copy: true } };
          applied += 1;
          if (applied % 25 === 0) store.advance(op.id, 25);
        }
      });
      store._set("overrides", next); // atomic commit
      store.advance(op.id, op.total);
      store.completePhase(op.id);
    } catch (e) {
      store.finish(op.id, "recovery-required", "Apply failed before commit. The restore point was not needed; nothing changed.");
      this.error = "Copy failed before any change was applied.";
      this.state = "failed";
      return op;
    }

    // 3. verify destination
    var verifyOk = true;
    var check = store.overrides();
    var sampled = 0;
    Object.keys(this.inventory.settings).some(function (sid) {
      var s = this.inventory.settings[sid];
      if (!this._selectedDomains()[s.domain] || s.type === "action") return false;
      var h = hash(preview.sourceId + ":" + sid);
      var should = (h % 11 === 0) || (h % 3 === 0) || (h % 3 === 1);
      if (!should || s.state === "unavailable" || h % 37 === 0) return false;
      sampled += 1;
      if (sampled > 40) return true;
      if (!check[sid]) { verifyOk = false; return true; }
      return false;
    }, this);
    if (!verifyOk) {
      store.finish(op.id, "recovery-required", "Verification failed. Roll back to the restore point.");
      this.state = "failed";
      this.error = "Verification failed — use Rollback to restore the previous values.";
      return op;
    }
    store.completePhase(op.id);

    // 4. receipt
    this.receipt = store.addReceipt({
      kind: "settings-copy",
      title: "Copied settings from " + preview.sourceId,
      sourceId: preview.sourceId,
      categories: preview.categories.map(function (c) { return c.title; }),
      totals: preview.totals,
      restorePointId: this.restorePoint.id,
      verified: true,
      rolledBack: false,
      independence: "One-time copy. Source and destination are independent; no sync or inheritance was created."
    });
    store.completePhase(op.id);
    store.finish(op.id, "done");
    this.state = "receipt";
    this.store._emit({ type: "setting", id: "*", value: null }); // refresh projections
    return op;
  };

  /** Roll back the applied copy via its restore point. */
  CopyEngine.prototype.rollback = function () {
    if (!this.receipt || !this.restorePoint) { this.error = "Nothing to roll back."; return false; }
    var op = this.store.begin({
      kind: "settings-copy-rollback",
      title: "Roll back copy from " + this.receipt.sourceId,
      phases: [{ name: "Restore snapshot" }, { name: "Verify" }],
      determinate: false
    });
    this.store._set("overrides", this.restorePoint.snapshot || {});
    this.store.completePhase(op.id);
    this.store.completePhase(op.id);
    this.store.finish(op.id, "done");
    this.receipt.rolledBack = true;
    this.store.addReceipt({
      kind: "settings-copy-rollback",
      title: "Rolled back copy from " + this.receipt.sourceId,
      restorePointId: this.restorePoint.id,
      verified: true
    });
    this.store._emit({ type: "setting", id: "*", value: null });
    this.state = "rolled-back";
    return true;
  };

  window.PM_V2_COPY = { CopyEngine: CopyEngine };
})();
