/* PMCopy2 — Copy Settings From Another Project: one-time transactional copy.
 * preview → restore point → atomic apply → verify → receipt → rollback.
 * Headless engine; concepts render their own flow over it. */
(function () {
  "use strict";

  var D = window.PMInventoryData;
  var S2 = null;
  function st() { if (!S2) S2 = window.PMState2; return S2; }

  // deterministic pseudo-source values per source project + setting id
  function hashStr(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h;
  }

  function sourceValueFor(sourceId, inv, current) {
    var h = hashStr(sourceId + ":" + inv.id);
    if (inv.type === "toggle") return (h & 1) === 1;
    if (inv.options && inv.options.length) return inv.options[h % inv.options.length];
    if (inv.type === "number") {
      var base = current && current.value !== "" && !isNaN(+current.value) ? +current.value : (typeof inv.default === "number" ? inv.default : 10);
      return base + (h % 5);
    }
    if (inv.type === "text" || inv.type === "path") return current ? current.value : (inv.default || "");
    return current ? current.value : (inv.default !== undefined ? inv.default : "");
  }

  function preview(sourceId, categoryIds) {
    var s2 = st();
    var rows = [];
    var counts = { add: 0, replace: 0, same: 0, unavailable: 0, conflict: 0 };
    D.settings.forEach(function (inv) {
      var cat = inv.id.split(".")[0];
      if (categoryIds.indexOf(cat) < 0) return;
      var cur = s2.getSetting(inv.id);
      var srcVal = sourceValueFor(sourceId, inv, cur);
      var curVal = cur ? cur.value : null;
      var status;
      if (inv.id.indexOf("ai.accounts") === 0 && (inv.search || []).join(" ").indexOf("secret") >= 0) status = "credential";
      else if (cur && cur.source === "unavailable") { status = "unavailable"; counts.unavailable++; }
      else if (curVal === null || curVal === "") { status = "add"; counts.add++; }
      else if (JSON.stringify(curVal) === JSON.stringify(srcVal)) { status = "same"; counts.same++; }
      else {
        status = "replace"; counts.replace++;
        if (cur && cur.source === "custom" && (hashStr(inv.id) & 7) === 3) { status = "conflict"; counts.conflict++; }
      }
      if (status === "credential") {
        rows.push({ id: inv.id, label: inv.label, category: cat, status: "credential", note: "Account reference copied per Project-copy policy; raw secret never rendered or exported." });
      } else if (status !== "same") {
        rows.push({ id: inv.id, label: inv.label, category: cat, status: status, current: curVal, incoming: srcVal });
      }
    });
    return { sourceId: sourceId, categories: categoryIds, rows: rows, counts: counts, total: rows.length + counts.same };
  }

  function apply(pv) {
    var s2 = st();
    var rp = s2.createRestorePoint("Before copying settings from " + pv.sourceId);
    var changed = 0;
    pv.rows.forEach(function (r) {
      if (r.status === "unavailable" || r.status === "credential") return;
      var set = s2.setSetting(r.id, r.incoming);
      if (set) changed++;
    });
    var verify = { ok: true, checked: 0, mismatched: [] };
    pv.rows.forEach(function (r) {
      if (r.status === "replace" || r.status === "add") {
        verify.checked++;
        var cur = s2.getSetting(r.id);
        if (cur && JSON.stringify(cur.value) !== JSON.stringify(r.incoming)) { verify.ok = false; verify.mismatched.push(r.id); }
      }
    });
    var receipt = s2.receipt(
      verify.ok ? "Copy applied" : "Copy applied with verification gaps",
      changed + " settings copied from " + pv.sourceId + " into this Project. Restore point " + rp.id + " kept. Source and destination remain independent.",
      verify.ok ? "ok" : "warn"
    );
    s2.state.copiedFrom = { source: pv.sourceId, at: new Date().toISOString(), changed: changed, restorePoint: rp.id, verify: verify };
    return { restorePoint: rp, changed: changed, verify: verify, receipt: receipt };
  }

  function rollbackLast() {
    var s2 = st();
    var cf = s2.state.copiedFrom;
    if (!cf || !cf.restorePoint) return false;
    return s2.rollbackTo(cf.restorePoint);
  }

  window.PMCopy2 = { preview: preview, apply: apply, rollbackLast: rollbackLast };
})();
