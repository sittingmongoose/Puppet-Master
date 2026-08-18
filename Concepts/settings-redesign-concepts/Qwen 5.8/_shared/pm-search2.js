/* PMSearch2 — headless universal search over the real 828-row inventory plus
 * registered manager/object/action/diagnostic entries. No rendering, no manager
 * hydration. Results carry immutable IDs and canonical destination objects;
 * concepts must route by rid, never by rendered position. */
(function () {
  "use strict";

  var D = window.PMInventoryData;
  var extra = [];
  var index = null;
  var generation = 0;

  function catTitle(id) { var c = D.byCategory(id); return c ? c.category.title : id; }
  function subInfo(id) {
    var parts = id.split(".");
    var c = D.byCategory(parts[0]);
    if (!c) return { cat: parts[0], sub: parts[1] || "" };
    var sub = null;
    c.category.subgroups.forEach(function (g) { if (g.id === parts[1]) sub = g; });
    return { cat: c.category.title, sub: sub ? sub.title : (parts[1] || ""), subId: parts[1] };
  }

  function buildIndex() {
    if (index) return index;
    var entries = [];
    D.settings.forEach(function (s) {
      var si = subInfo(s.id);
      entries.push({
        rid: "sr:setting:" + s.id,
        type: "setting",
        label: s.label,
        path: [si.cat, si.sub],
        dest: { kind: "setting", settingId: s.id, category: s.id.split(".")[0], subgroup: s.id.split(".")[1] },
        hay: (s.label + " " + (s.search || []).join(" ") + " " + si.cat + " " + si.sub).toLowerCase()
      });
    });
    extra.forEach(function (e) {
      entries.push({
        rid: e.rid,
        type: e.type,
        label: e.label,
        path: e.path || [],
        dest: e.dest,
        note: e.note || null,
        hay: (e.label + " " + (e.keywords || []).join(" ") + " " + (e.path || []).join(" ")).toLowerCase()
      });
    });
    index = entries;
    return index;
  }

  function register(list) {
    extra = extra.concat(list || []);
    index = null; // rebuild lazily
  }

  function lev(a, b, max) {
    var m = a.length, n = b.length;
    if (Math.abs(m - n) > max) return max + 1;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur[0] = i;
      var best = cur[0];
      for (j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (cur[j] < best) best = cur[j];
      }
      if (best > max) return max + 1;
      var t = prev; prev = cur; cur = t;
    }
    return prev[n];
  }

  function score(entry, terms) {
    var total = 0;
    var title = entry.label.toLowerCase();
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      var hit = 0;
      if (title.indexOf(t) === 0) hit = 6;
      else if (title.indexOf(t) >= 0) hit = 4;
      else if (entry.hay.indexOf(t) >= 0) hit = 2;
      else {
        // bounded fuzzy on title words
        var words = title.split(/[^a-z0-9]+/);
        for (var w = 0; w < words.length; w++) {
          if (words[w] && lev(t, words[w], 2) <= (t.length > 5 ? 2 : 1)) { hit = 1; break; }
        }
      }
      if (!hit) return 0; // all terms must match somewhere
      total += hit;
    }
    return total;
  }

  var CAP = 30;

  function search(query) {
    var q = (query || "").trim().toLowerCase();
    if (!q) return [];
    var terms = q.split(/\s+/).slice(0, 6);
    var es = buildIndex();
    var scored = [];
    for (var i = 0; i < es.length; i++) {
      var s = score(es[i], terms);
      if (s > 0) scored.push([s, es[i]]);
    }
    scored.sort(function (a, b) { return b[0] - a[0] || (a[1].label < b[1].label ? -1 : 1); });
    return scored.slice(0, CAP).map(function (p) { return p[1]; });
  }

  // latest-request-wins async wrapper
  function searchAsync(query, cb) {
    generation += 1;
    var g = generation;
    setTimeout(function () {
      if (g !== generation) return;
      cb(search(query), g);
    }, 30);
  }

  function byRid(rid) {
    var es = buildIndex();
    for (var i = 0; i < es.length; i++) if (es[i].rid === rid) return es[i];
    return null;
  }

  window.PMSearch2 = { register: register, search: search, searchAsync: searchAsync, byRid: byRid, cap: CAP };
})();
