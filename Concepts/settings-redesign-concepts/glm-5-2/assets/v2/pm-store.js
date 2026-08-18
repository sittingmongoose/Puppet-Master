/* pm-store.js — HEADLESS state, persistence, ObservableWork simulator for concepts 05–11.
   Project-scoped values, restore points, receipts, truthful operation states with
   denominator-gated determinate progress, deterministic fixture flags. No DOM. */
(function () {
  "use strict";
  var PM2 = window.PM2;

  function Store(ns) {
    this.ns = "pm2." + ns + ".";
    this.values = {};          // settingId -> {status, value, changedAt}
    this.receipts = [];        // {id, kind, when, summary, rollback?}
    this.restorePoints = [];   // {id, when, label, snapshot}
    this.flags = { offline: false, fixture: null };
    this.subs = {};
    this.works = [];
    this._wid = 0;
    this._rid = 7700;
    this._load();
  }
  Store.prototype._load = function () {
    try {
      var raw = localStorage.getItem(this.ns + "state");
      if (raw) {
        var d = JSON.parse(raw);
        this.values = d.values || {}; this.receipts = d.receipts || [];
        this.restorePoints = d.restorePoints || []; this.flags = d.flags || this.flags;
      }
    } catch (e) { /* fresh */ }
  };
  Store.prototype._save = function () {
    try {
      localStorage.setItem(this.ns + "state", JSON.stringify({
        values: this.values, receipts: this.receipts.slice(-40), restorePoints: this.restorePoints.slice(-10), flags: this.flags
      }));
    } catch (e) { /* storage unavailable — demo continues in-memory */ }
  };
  Store.prototype.get = function (sid) {
    if (this.values[sid]) return this.values[sid];
    return PM2.demoStateFor(sid);
  };
  Store.prototype.set = function (sid, value, status) {
    this.values[sid] = { status: status || "custom", value: value, changedAt: new Date().toISOString().slice(0, 10) };
    this._save(); this._pub("value:" + sid, this.values[sid]);
  };
  Store.prototype.reset = function (sid) { delete this.values[sid]; this._save(); this._pub("value:" + sid, null); };
  Store.prototype.changedCount = function () { return Object.keys(this.values).length; };
  Store.prototype.subscribe = function (topic, fn) { var arr = (this.subs[topic] = this.subs[topic] || []); arr.push(fn); return function () { var i = arr.indexOf(fn); if (i >= 0) arr.splice(i, 1); }; };
  Store.prototype._pub = function (topic, data) {
    (this.subs[topic] || []).forEach(function (f) { f(data); });
    (this.subs["*"] || []).forEach(function (f) { f(topic, data); });
  };

  /* receipts */
  Store.prototype.receipt = function (kind, summary, rollback) {
    var r = { id: "rcpt." + (++this._rid), kind: kind, when: new Date().toISOString().replace("T", " ").slice(0, 16), summary: summary, rollback: rollback || null };
    this.receipts.push(r); this._save(); this._pub("receipt", r);
    return r;
  };

  /* restore points + copy transaction */
  Store.prototype.restorePoint = function (label) {
    var rp = { id: "rp." + Date.now(), when: new Date().toISOString().replace("T", " ").slice(0, 16), label: label, snapshot: JSON.parse(JSON.stringify(this.values)) };
    this.restorePoints.push(rp); this._save();
    return rp;
  };
  Store.prototype.rollback = function (rpId) {
    var rp = this.restorePoints.filter(function (r) { return r.id === rpId; })[0];
    if (!rp) return null;
    this.values = JSON.parse(JSON.stringify(rp.snapshot));
    this.receipt("rollback", "Rolled back to restore point " + rp.label);
    this._save(); this._pub("values", null);
    return rp;
  };
  Store.prototype.applyCopy = function (preview, selectedCatIds) {
    var rp = this.restorePoint("Before Copy from " + preview.source.name);
    var counts = { applied: 0, skipped: 0 };
    preview.rows.forEach(function (row) {
      if (selectedCatIds.indexOf(row.category) < 0) return;
      if (row.kind === "additions" || row.kind === "replacements") { this.set(row.settingId, row.sourceValue, "custom"); counts.applied++; }
      else if (row.kind === "unavailable" || row.kind === "conflicts") counts.skipped++;
    }, this);
    var rec = this.receipt("copy-apply", "Copied " + counts.applied + " values from " + preview.source.name + " (" + counts.skipped + " skipped: unavailable/conflict)", rp.id);
    return { restorePoint: rp, counts: counts, receipt: rec,
      verify: { checked: counts.applied, mismatches: 0, note: "Destination verified against preview; source untouched." } };
  };

  /* ObservableWork — truthful phases; determinate progress only with a real denominator */
  Store.prototype.work = function (opts) {
    var self = this;
    var w = {
      id: "work." + (++this._wid), kind: opts.kind, label: opts.label,
      phases: opts.phases || ["preparing", "working", "verifying", "done"],
      phaseI: 0, state: "running", progress: null, denominator: opts.denominator || null,
      done: 0, note: opts.note || "", waitReason: opts.waitReason || null,
      seq: [], _timer: null, _i: 0
    };
    var total = opts.denominator ? Math.min(opts.denominator, opts.steps || 26) : (opts.steps || 8);
    var duration = opts.fast ? 900 : 2200;
    w._timer = setInterval(function () {
      w._i++;
      var frac = w._i / total;
      if (opts.failAt === w._i && opts.recover) { /* truthful failure → recovery */
        clearInterval(w._timer);
        w.state = "degraded"; w.note = opts.failNote || "Verification failed";
        self._pub("work", w);
        setTimeout(function () {
          w.state = opts.recoverState || "recovered"; w.note = opts.recoverNote || "Rolled back cleanly";
          w.phaseI = w.phases.length - 1; self._pub("work", w); self._finish(w, opts);
        }, 700);
        return;
      }
      if (opts.failAt === w._i && !opts.recover) {
        clearInterval(w._timer); w.state = "retryable"; w.note = opts.failNote || "Failed — retry available";
        self._pub("work", w); return;
      }
      if (opts.waitAt === w._i) { w.state = "waiting"; w.waitReason = opts.waitReason || "Waiting for current work to finish"; self._pub("work", w); return; }
      w.phaseI = Math.min(w.phases.length - 1, Math.floor(frac * w.phases.length));
      w.note = "Phase: " + w.phases[w.phaseI];
      if (w.denominator) { w.done = Math.min(w.denominator, Math.round(frac * w.denominator)); w.progress = Math.round(100 * w.done / w.denominator); }
      if (w._i >= total) {
        clearInterval(w._timer);
        w.state = "done"; w.note = "Complete"; w.progress = w.denominator ? 100 : null;
        self._pub("work", w); self._finish(w, opts);
        if (opts.receipt) self.receipt(opts.receipt.kind || w.kind, opts.receipt.summary || (w.label + " — completed"));
        return;
      }
      self._pub("work", w);
    }, Math.max(90, duration / total));
    this.works.push(w); this._pub("work", w);
    return w;
  };
  Store.prototype._finish = function (w, opts) {
    if (opts && opts.onDone) opts.onDone(w);
  };
  Store.prototype.cancelWork = function (w) { if (w && w._timer) { clearInterval(w._timer); w.state = "canceled"; w.note = "Canceled by you"; this._pub("work", w); } };

  /* fixture flags (deterministic states the concept can toggle for demonstration) */
  Store.prototype.setFlag = function (k, v) { this.flags[k] = v; this._save(); this._pub("flag:" + k, v); };

  PM2.Store = Store;
})();
