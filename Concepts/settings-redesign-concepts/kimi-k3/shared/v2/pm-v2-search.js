/* ============================================================================
   pm-v2-search.js — headless universal search index for kimi-k3 concepts 05–11
   ----------------------------------------------------------------------------
   Packet contract (machine_readable/search_contract.json):
   - result types: setting | manager | managed_object | action |
     setup_or_repair_workflow | diagnostic_or_read_only_status |
     unavailable_capability | intentional_help_result
   - every result: immutableResultId, label, type, path (complete Settings
     path), destination {domain,page,manager,object,section,row},
     availability (or reason) when useful
   - routing happens ONLY by immutableResultId -> resolve(); never by rendered
     array index, grouped position, or label text
   - bounded results; latest-request-wins sessions; typo/fuzzy tolerance
   Headless only — concepts render their own dropdowns and highlights.
   ========================================================================== */
(function () {
  "use strict";

  /* 64-bit FNV-1a, hex — deterministic immutable result identity. */
  function fnv1a(str) {
    var h1 = 0x811c9dc5, h2 = 0x81053 ^ 0x7fffffff, i;
    // simple two-pass mixing to 64ish bits without BigInt cost in hot path
    h1 = 0x811c9dc5 >>> 0;
    for (i = 0; i < str.length; i++) {
      h1 ^= str.charCodeAt(i);
      h1 = (h1 + ((h1 << 1) + (h1 << 4) + (h1 << 7) + (h1 << 8) + (h1 << 24))) >>> 0;
    }
    h2 = 0x9e3779b9 >>> 0;
    for (i = str.length - 1; i >= 0; i--) {
      h2 ^= str.charCodeAt(i);
      h2 = (h2 + ((h2 << 1) + (h2 << 4) + (h2 << 7) + (h2 << 8) + (h2 << 24))) >>> 0;
    }
    return ("00000000" + h1.toString(16)).slice(-8) + ("00000000" + h2.toString(16)).slice(-8);
  }

  function dest(d) {
    d = d || {};
    return {
      domain: d.domain || null,
      page: d.page || null,
      manager: d.manager || null,
      object: d.object || null,
      section: d.section || null,
      row: d.row || null
    };
  }

  function canonicalKey(type, label, destination) {
    var d = dest(destination);
    return [type, label, d.domain, d.page, d.manager, d.object, d.section, d.row].join("");
  }

  function makeResult(type, label, path, destination, extra) {
    var d = dest(destination);
    var e = {
      immutableResultId: "r_" + fnv1a(canonicalKey(type, label, d)),
      label: label,
      type: type,
      path: path,
      destination: d,
      availability: null,
      terms: ""
    };
    if (extra) for (var k in extra) e[k] = extra[k];
    return e;
  }

  /* ---------- index construction ------------------------------------------ */
  function buildIndex(sources) {
    var inv = sources.inventory, reg = sources.registry;
    var core = sources.coreData || {};
    var entries = [];
    var byId = {};

    function push(e) {
      if (byId[e.immutableResultId]) return; // identical canonical destination
      byId[e.immutableResultId] = e;
      entries.push(e);
    }

    var domainTitle = {};
    reg.DOMAINS.forEach(function (d) { domainTitle[d.id] = d.title; });

    // Domains themselves (manager-type landing pages)
    reg.DOMAINS.forEach(function (d) {
      push(makeResult("manager", d.title, "Settings / " + d.title, { domain: d.id }, {
        terms: d.blurb + " " + d.id
      }));
    });

    // Settings (828 inventory rows)
    inv.categories.forEach(function (cat) {
      cat.subgroups.forEach(function (sub) {
        sub.settings.forEach(function (sid) {
          var s = inv.settings[sid];
          if (!s) return;
          var availability = s.state === "unavailable" ? (s.source || "Unavailable") : null;
          push(makeResult(
            availability ? "unavailable_capability" : "setting",
            s.label,
            "Settings / " + cat.title + " / " + sub.title + " / " + s.label,
            { domain: cat.id, page: sub.id, section: sub.id, row: sid },
            { terms: (s.search || []).join(" ") + " " + sid + " " + (s.desc || ""), availability: availability, settingId: sid }
          ));
        });
      });
    });

    // Manager families
    reg.MANAGERS.forEach(function (m) {
      push(makeResult("manager", m.title, "Settings / " + domainTitle[m.domain] + " / " + m.title,
        { domain: m.domain, manager: m.id }, { terms: m.summary + " " + m.family }));
      (m.subpages || []).forEach(function (sp) {
        push(makeResult("manager", m.title + " — " + sp,
          "Settings / " + domainTitle[m.domain] + " / " + m.title + " / " + sp,
          { domain: m.domain, manager: m.id, page: sp.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
          { terms: m.summary + " " + sp }));
      });
    });

    // Deferred named-owner shells (reachable destinations)
    reg.DEFERRED_OWNERS.forEach(function (o) {
      push(makeResult("manager", o.family, "Settings / System & Advanced / " + o.family,
        { domain: "system", manager: "owner-" + o.id },
        { terms: o.family + " " + o.owner, availability: "Runs inside the " + o.owner + " shell" }));
    });

    // Managed objects (providers etc.) — supplied by concept fixtures
    (sources.objects || []).forEach(function (o) {
      // o: {id, label, typeLabel, domain, manager, section?, availability?, terms?}
      push(makeResult("managed_object", o.label,
        "Settings / " + (domainTitle[o.domain] || o.domain) + " / " + o.managerTitle + " / " + o.label,
        { domain: o.domain, manager: o.manager, object: o.id, section: o.section || null },
        { terms: (o.terms || "") + " " + o.typeLabel, availability: o.availability || null, objectType: o.typeLabel }));
    });

    // Actions (from core data + universal flows)
    (core.actions || []).forEach(function (a) {
      var t = a.target || {};
      push(makeResult("action", a.title, "Settings / Action / " + a.title,
        { domain: t.category || null, page: t.sub || null, manager: t.manager || null, row: t.setting || null },
        { terms: a.terms || "" }));
    });
    push(makeResult("action", "Copy Settings From Another Project",
      "Settings / System & Advanced / Settings Lifecycle / Copy Settings From Another Project",
      { domain: "system", manager: "lifecycle", page: "copy", section: "copy" },
      { terms: "copy import duplicate clone another project settings transaction" }));

    // Setup / repair workflows (provider CLI acquisition: explicit, official source)
    (sources.workflows || []).forEach(function (w) {
      push(makeResult("setup_or_repair_workflow", w.label, w.path, w.destination, { terms: w.terms || "" }));
    });

    // Diagnostics / read-only statuses
    (sources.diagnostics || []).forEach(function (g) {
      push(makeResult("diagnostic_or_read_only_status", g.label, g.path, g.destination, { terms: g.terms || "", availability: g.availability || null }));
    });

    // Intentional help results
    (sources.help || []).forEach(function (h) {
      push(makeResult("intentional_help_result", h.label, h.path, h.destination, { terms: h.terms || "" }));
    });

    return { entries: entries, byId: byId };
  }

  /* ---------- matching ------------------------------------------------------ */
  function editDistance1(a, b) {
    if (a === b) return true;
    var la = a.length, lb = b.length;
    if (Math.abs(la - lb) > 1) return false;
    // adjacent transposition (Damerau) counts as one typo
    if (la === lb) {
      var diff = [];
      for (var d = 0; d < la; d++) if (a[d] !== b[d]) diff.push(d);
      if (diff.length === 2 && diff[1] === diff[0] + 1 &&
          a[diff[0]] === b[diff[1]] && a[diff[1]] === b[diff[0]]) return true;
    }
    var i = 0, j = 0, edits = 0;
    while (i < la && j < lb) {
      if (a[i] === b[j]) { i++; j++; continue; }
      edits++;
      if (edits > 1) return false;
      if (la > lb) i++;
      else if (lb > la) j++;
      else { i++; j++; }
    }
    return edits + (la - i) + (lb - j) <= 1;
  }

  function scoreEntry(e, tokens) {
    var label = e.label.toLowerCase();
    var path = (e.path || "").toLowerCase();
    var terms = (e.terms || "").toLowerCase();
    var total = 0;
    for (var t = 0; t < tokens.length; t++) {
      var tok = tokens[t];
      var best = 0;
      if (label.indexOf(tok) === 0) best = 120;
      else if (label.indexOf(" " + tok) >= 0) best = 100;
      else if (label.indexOf(tok) >= 0) best = 80;
      else if (terms.indexOf(tok) >= 0) best = 50;
      else if (path.indexOf(tok) >= 0) best = 40;
      else if (tok.length >= 4) {
        // typo tolerance against label words, then term words
        var words = label.split(/[^a-z0-9]+/).concat(terms.split(/[^a-z0-9]+/));
        for (var w = 0; w < words.length; w++) {
          if (words[w].length >= 3 && editDistance1(tok, words[w])) { best = 30; break; }
        }
      }
      if (!best) return 0;
      total += best;
    }
    // shorter, simpler labels read as better matches at equal score
    return total - Math.min(label.length, 60) * 0.1;
  }

  /* ---------- query sessions (latest-request-wins) ------------------------- */
  function createSession(index, opts) {
    opts = opts || {};
    var limit = opts.limit || 30;
    var seq = 0;
    return {
      /** query(text, cb): cb(results, meta) fires only for the latest query. */
      query: function (text, cb) {
        var my = ++seq;
        var run = function () {
          if (my !== seq) return; // superseded — latest request wins
          var q = (text || "").trim().toLowerCase();
          if (!q) { cb([], { query: text || "", total: 0, bounded: false }); return; }
          var tokens = q.split(/\s+/).filter(Boolean);
          var scored = [];
          for (var i = 0; i < index.entries.length; i++) {
            var e = index.entries[i];
            var s = scoreEntry(e, tokens);
            if (s > 0) scored.push({ e: e, s: s });
          }
          scored.sort(function (a, b) { return b.s - a.s || (a.e.label < b.e.label ? -1 : 1); });
          var total = scored.length;
          var out = scored.slice(0, limit).map(function (x) { return x.e; });
          cb(out, { query: text || "", total: total, bounded: total > limit, limit: limit });
        };
        // async turn models real async search; latest-request-wins is enforced
        // by the sequence guard even when calls resolve out of order.
        setTimeout(run, 0);
      }
    };
  }

  window.PM_V2_SEARCH = {
    buildIndex: buildIndex,
    createSession: createSession,
    /** resolve(index, immutableResultId) -> entry | null — THE ONLY ROUTE IN. */
    resolve: function (index, immutableResultId) {
      return index.byId[immutableResultId] || null;
    }
  };
})();
