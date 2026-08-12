/* ============================================================================
   pm-search.js — fuzzy settings search (IIFE, no dependencies)
     PMSearch.buildIndex(demo) -> entries:
       { id, kind: "category|subcategory|setting|manager|action",
         title, subtitle (destination path, e.g. "Providers · Models"),
         terms, target: { category, sub, setting, manager, tab } }
     PMSearch.query(index, text, { limit = 30 }) -> scored, best-first.
       Subsequence fuzzy match (case-insensitive), weighted
       title > terms > subtitle, with consecutive-char and word-boundary
       bonuses plus a shorter-title bonus. Each result carries `ranges`
       (merged [start,end] title index pairs) for <mark> highlighting.
       Blank query -> [].
     PMSearch.highlight(title, ranges) -> HTML string with <mark>.
     PMSearch.deepLink(result) -> normalized
       { category, sub, setting, manager, tab } (missing keys are null).
   ========================================================================== */
(function () {
  "use strict";

  function target(t) {
    return {
      category: t.category || null,
      sub: t.sub || null,
      setting: t.setting || null,
      manager: t.manager || null,
      tab: t.tab || null
    };
  }

  function kindFromMeta(meta) {
    return (meta && meta.resultKind) || "manager";
  }

  function buildIndex(demo) {
    var index = [];
    (demo.categories || []).forEach(function (cat) {
      index.push({
        id: "category:" + cat.id,
        kind: "category",
        title: cat.title,
        subtitle: "Settings",
        terms: (cat.purpose || "") + " " + cat.id,
        target: target({ category: cat.id })
      });
      (cat.subcategories || []).forEach(function (sub) {
        index.push({
          id: "subcategory:" + cat.id + "/" + sub.id,
          kind: "subcategory",
          title: sub.title,
          subtitle: cat.title,
          terms: (sub.summary || "") + " " + sub.id,
          target: target({ category: cat.id, sub: sub.id })
        });
        (sub.settings || []).forEach(function (settingId) {
          var s = (demo.settings || {})[settingId];
          if (!s) return;
          index.push({
            id: "setting:" + settingId,
            kind: "setting",
            title: s.label,
            subtitle: cat.title + " · " + sub.title,
            terms: [s.description, s.search, settingId].filter(Boolean).join(" "),
            target: target({ category: cat.id, sub: sub.id, setting: settingId })
          });
        });
      });
    });

    var managerMeta = demo.managerMeta || {};
    Object.keys(managerMeta).forEach(function (managerId) {
      var meta = managerMeta[managerId] || {};
      index.push({
        id: "manager:" + managerId,
        kind: kindFromMeta(meta),
        title: meta.title || managerId,
        subtitle: meta.subtitle || "Managers",
        terms: [meta.purpose, meta.search, managerId, (meta.tags || []).join(" ")].filter(Boolean).join(" "),
        target: target({ manager: managerId, tab: meta.defaultTab || "overview" })
      });
      (meta.aliases || []).forEach(function (alias, ai) {
        index.push({
          id: "manager:" + managerId + ":alias:" + ai,
          kind: "manager",
          title: alias,
          subtitle: meta.subtitle || "Managers",
          terms: [meta.title, meta.purpose, meta.search, managerId].filter(Boolean).join(" "),
          target: target({ manager: managerId, tab: meta.defaultTab || "overview" })
        });
      });
    });

    function pushTyped(kind, id, title, subtitle, terms, tgt) {
      index.push({
        id: kind + ":" + id,
        kind: kind,
        title: title,
        subtitle: subtitle || kind,
        terms: terms || "",
        target: target(tgt || {})
      });
    }

    (function () {
      var notif = demo.notifications;
      var list = Array.isArray(notif) ? notif : ((notif && (notif.destinations || notif.items)) || []);
      list.forEach(function (n) {
        pushTyped("status", "notif-" + n.id, n.title || n.name || n.id, "Notifications",
          [n.channel, n.health, n.search, n.kind].filter(Boolean).join(" "),
          { manager: "notifications", tab: n.id });
      });
    })();
    var soundItems = (demo.soundLibrary && demo.soundLibrary.items) || demo.soundLibrary || [];
    if (Array.isArray(soundItems)) {
      soundItems.forEach(function (s) {
        if (!s || !s.id) return;
        pushTyped("diagnostic", "sound-" + s.id, s.title || s.id, "Sound library",
          [s.pack, s.state, s.search].filter(Boolean).join(" "),
          { manager: "soundLibrary", tab: s.id });
      });
    }
    (function () {
      var shell = demo.serverShell;
      var cards = Array.isArray(shell) ? shell : ((shell && shell.deferredModules) || []);
      cards.forEach(function (card) {
        pushTyped("unavailable", "server-" + card.id, card.title || card.name || card.id, "Future server shell",
          [card.namedOwner || card.owner, card.insertionContract || card.contract, "deferred"].filter(Boolean).join(" "),
          { manager: "serverShell", tab: card.id });
      });
    })();
    (demo.setupFixtures || []).forEach(function (fx) {
      pushTyped("setup", fx.id, fx.title, "Setup", fx.terms || "", fx.target || {});
    });

    [
      { id: "reset-demo", title: "Reset demo data", terms: "restore seed sample content" },
      { id: "open-home", title: "Open Settings Home", terms: "start landing overview" },
      { id: "refresh-catalog", title: "Refresh provider catalog", terms: "models.dev update check", target: { manager: "providers" } },
      { id: "import-preview", title: "Preview settings import", terms: "lifecycle conflict rollback", target: { manager: "settingsLifecycle" } },
      { id: "sound-preview", title: "Preview notification sound", terms: "PeonPing OpenPeon pack", target: { manager: "soundLibrary" } }
    ].forEach(function (action) {
      index.push({
        id: "action:" + action.id,
        kind: "action",
        title: action.title,
        subtitle: "Actions",
        terms: action.terms,
        target: target(action.target || {})
      });
    });

    return index;
  }

  /* Subsequence fuzzy match -> { score, idx } or null.
     Bonuses: consecutive chars, word boundaries, early first match. */
  function fuzzy(text, query) {
    if (!text) return null;
    var t = text.toLowerCase();
    var start = 0, last = -2, score = 0;
    var idx = [];
    for (var qi = 0; qi < query.length; qi++) {
      var found = t.indexOf(query[qi], start);
      if (found === -1) return null;
      idx.push(found);
      score += 1;
      if (found === last + 1) score += 2;
      if (found === 0 || /[\s\-·/.,()]/.test(t.charAt(found - 1))) score += 3;
      start = found + 1;
      last = found;
    }
    score += Math.max(0, 4 - idx[0]);
    return { score: score, idx: idx };
  }

  function mergeRanges(idx) {
    if (!idx || !idx.length) return [];
    var ranges = [];
    var start = idx[0], prev = idx[0];
    for (var i = 1; i < idx.length; i++) {
      if (idx[i] === prev + 1) {
        prev = idx[i];
      } else {
        ranges.push([start, prev + 1]);
        start = prev = idx[i];
      }
    }
    ranges.push([start, prev + 1]);
    return ranges;
  }

  function query(index, text, opts) {
    var q = String(text == null ? "" : text).trim().toLowerCase();
    if (!q) return [];
    var limit = (opts && opts.limit) || 30;
    var results = [];
    for (var i = 0; i < index.length; i++) {
      var entry = index[i];
      var titleLc = String(entry.title || "").toLowerCase();
      var onTitle = fuzzy(entry.title, q);
      var onTerms = fuzzy(entry.terms, q);
      var onSubtitle = fuzzy(entry.subtitle, q);
      var best = 0;
      var matchedOnTitle = false;
      if (onTitle && onTitle.score * 3 > best) { best = onTitle.score * 3; matchedOnTitle = true; }
      if (onTerms && onTerms.score * 2 > best) { best = onTerms.score * 2; matchedOnTitle = false; }
      if (onSubtitle && onSubtitle.score > best) { best = onSubtitle.score; matchedOnTitle = false; }
      if (!best) continue;

      var score = best + Math.max(0, 12 - entry.title.length) * 0.25;
      /* Prefer intentional manager destinations over broad category landings
         when the query is really naming that manager. */
      if (matchedOnTitle) {
        if (titleLc === q) score += 28;
        else if (titleLc.indexOf(q) === 0) score += 16;
        else if ((" " + titleLc + " ").indexOf(" " + q + " ") !== -1) score += 12;
      }
      if (entry.kind === "manager") {
        if (matchedOnTitle) score += 22;
        else if (onTerms) score += 14;
      }
      if (entry.kind === "setup" && entry.target && entry.target.manager && matchedOnTitle) score += 10;
      if (entry.kind === "category" && matchedOnTitle) score -= 6;
      if (entry.kind === "subcategory" && matchedOnTitle) score -= 4;

      results.push({
        id: entry.id,
        kind: entry.kind,
        title: entry.title,
        subtitle: entry.subtitle,
        target: entry.target,
        score: score,
        ranges: matchedOnTitle ? mergeRanges(onTitle.idx) : []
      });
    }
    results.sort(function (a, b) { return b.score - a.score; });
    return results.slice(0, limit);
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, function (c) {
      return c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&quot;";
    });
  }

  function highlight(title, ranges) {
    var out = "";
    var pos = 0;
    (ranges || []).forEach(function (range) {
      out += escapeHtml(title.slice(pos, range[0]));
      out += "<mark>" + escapeHtml(title.slice(range[0], range[1])) + "</mark>";
      pos = range[1];
    });
    return out + escapeHtml(title.slice(pos));
  }

  function deepLink(result) {
    return target((result && result.target) || {});
  }

  window.PMSearch = {
    buildIndex: buildIndex,
    query: query,
    highlight: highlight,
    deepLink: deepLink
  };
})();
