/* Opus 5 — the universal search index concepts 05-11 all query.
 *
 * One headless index over everything a reader can look for: the 828 canonical
 * inventory rows, every manager family, the objects that live inside managers,
 * actions, setup and repair work, read-only projections, capabilities that are
 * not available on this host, and a small authored help set.
 *
 * Three decisions shape the whole file.
 *
 * 1. Nothing here hydrates a manager. The packet's rule is that search must not
 *    call `PM2Managers.spec()` (a manager wakes up when it is opened, not when
 *    it is typed at), so manager objects are read from the PMData fixtures that
 *    are already in memory, defensively, and `stats().hydratedManagers` is a
 *    literal zero that a test can assert.
 *
 * 2. A result id is the only routing key. The Qwen-generation bug the packet
 *    names was routing by list position; every id here is derived from the
 *    record's own identity ("r:setting:ai.models.default-model"), so it survives
 *    reordering, regrouping, truncation and a reload. `byId()` returns the very
 *    same object the query returned, not a copy, so identity comparisons hold.
 *
 * 3. Findability is never the same thing as invitation. An expert, diagnostic,
 *    managed or unavailable row is indexed exactly like an everyday one and is
 *    weighted down rather than dropped, and it carries its own kind and type
 *    words so a concept can draw it as the thing it actually is.
 *
 * Load order: after shared2/pm2-model.js. PM2Scale, PM2Managers and PM2States
 * may or may not be present; every use of them is guarded.
 */
(function () {
  "use strict";

  var M = window.PM2Model;
  if (!M) throw new Error("pm2-index: pm2-model.js must load first");

  /* The path separator the packet's examples use:
   * "AI Brains & Providers > Models & Defaults > Model" with a single angle
   * quote. Concepts render `path` verbatim, so it is built once here. */
  var SEP = " › ";

  /* ------------------------------------------------------------------ kinds */

  /* Group order is fixed, not scored. A reader scanning a dropdown wants the
   * same shape every time: the thing they can change first, then where it
   * lives, then what is inside it, then the rarer honest answers. */
  var KIND_ORDER = ["setting", "manager", "object", "action", "setup",
    "diagnostic", "unavailable", "help"];

  var GROUP_LABEL = {
    setting: "Settings",
    manager: "Managers",
    object: "Resources inside managers",
    action: "Actions",
    setup: "Set up and repair",
    diagnostic: "Status and diagnostics",
    unavailable: "Not available here",
    help: "Help"
  };

  var KIND_RANK = {};
  for (var ki = 0; ki < KIND_ORDER.length; ki++) KIND_RANK[KIND_ORDER[ki]] = ki;

  /* Ranking weights, applied after the text score. They tilt ties; they never
   * remove a record from the answer. */
  var KIND_WEIGHT = {
    setting: 1.0,
    manager: 1.06,      /* a manager is a destination: slightly ahead on a tie */
    object: 1.0,
    action: 0.94,
    setup: 1.0,
    diagnostic: 0.8,    /* findable on purpose, never as inviting as a control */
    unavailable: 0.72,
    help: 0.85
  };

  var EXPOSURE_WEIGHT = { standard: 1.0, advanced: 0.92, expert: 0.8, diagnostic: 0.72 };
  var STATE_WEIGHT = { unavailable: 0.8, managed: 0.9 };

  /* ------------------------------------------------------------- small tools */

  function norm(s) { return String(s == null ? "" : s).toLowerCase(); }

  function trimText(s) { return String(s == null ? "" : s).replace(/^\s+|\s+$/g, ""); }

  function isArr(v) { return Object.prototype.toString.call(v) === "[object Array]"; }

  function pushAll(target, source) {
    if (!isArr(source)) return target;
    for (var i = 0; i < source.length; i++) if (source[i] != null) target.push(source[i]);
    return target;
  }

  /* A word list for the typo fallback. Long text is deliberately excluded: an
   * edit-distance pass over every word of a 300-character explanation costs far
   * more than it finds, and a reader's typo is nearly always in the name or a
   * synonym, not in the third sentence of the description. */
  function wordsOf(text, min, cap, seen, out) {
    var parts = norm(text).split(/[^a-z0-9]+/);
    for (var i = 0; i < parts.length && out.length < cap; i++) {
      var w = parts[i];
      if (w.length < min || seen[w]) continue;
      seen[w] = 1;
      out.push(w);
    }
    return out;
  }

  function clip(text, max) {
    var s = trimText(text);
    if (s.length <= max) return s;
    return s.slice(0, max - 3).replace(/\s+\S*$/, "") + "...";
  }

  /* camelCase and snake_case roster keys become human words, because a roster
   * key is an internal name and the packet forbids raw internal names in prose. */
  function humanise(key) {
    var s = String(key == null ? "" : key)
      .replace(/[-_.]+/g, " ")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/\s+/g, " ");
    s = trimText(s);
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  var SINGULAR_OVERRIDE = {
    "Memories": "Memory",
    "Per tool": "Tool rule",
    "Routing": "Routing rule",
    "Capsule text": "Capsule",
    "Built-in sounds": "Sound",
    "Personal words": "Word",
    "Project words": "Word",
    "Colour sample": "Colour"
  };

  function singular(label) {
    if (SINGULAR_OVERRIDE[label]) return SINGULAR_OVERRIDE[label];
    if (/ies$/.test(label)) return label.slice(0, -3) + "y";
    if (/ses$/.test(label)) return label.slice(0, -2);
    if (/[^s]s$/.test(label)) return label.slice(0, -1);
    return label;
  }

  /* ---------------------------------------------------------------- scoring */

  var BOUNDARY = /[\s\-\/·›:,.()\[\]]/;

  /* Subsequence scoring with word-start and contiguity bonuses, inherited from
   * the previous generation's scorer because it ranked the right things: an
   * exact prefix beats a mid-word hit, a hit at a word boundary beats one
   * inside a word, and consecutive characters beat scattered ones. */
  function fuzzyScore(q, t) {
    if (!q || !t) return -1;

    var exact = t.indexOf(q);
    if (exact === 0) return 1000 - t.length * 0.1;
    if (exact > 0) {
      var startsWord = BOUNDARY.test(t.charAt(exact - 1));
      return Math.max(120, (startsWord ? 780 : 640) - exact * 1.5 - t.length * 0.05);
    }

    var qi = 0, score = 0, run = 0, lastHit = -2;
    for (var i = 0; i < t.length && qi < q.length; i++) {
      if (t.charAt(i) === q.charAt(qi)) {
        var wordStart = i === 0 || BOUNDARY.test(t.charAt(i - 1));
        run = (i === lastHit + 1) ? run + 1 : 1;
        score += 12 + (wordStart ? 22 : 0) + Math.min(run, 5) * 6;
        lastHit = i;
        qi++;
      }
    }
    if (qi < q.length) return -1;
    return Math.max(40, score - t.length * 0.08);
  }

  /* Substring-only scoring, used for descriptions and for machine ids. Running
   * the subsequence scorer over those fields matches almost anything - "abc"
   * is a subsequence of most long sentences and of most dotted ids - which
   * produces confident-looking nonsense. Presence is the honest signal there. */
  function strictScore(q, t) {
    if (!q || !t) return -1;
    var at = t.indexOf(q);
    if (at < 0) return -1;
    if (at === 0) return 900 - t.length * 0.05;
    var wordStart = BOUNDARY.test(t.charAt(at - 1));
    return Math.max(60, (wordStart ? 700 : 520) - at * 0.6 - t.length * 0.04);
  }

  /* Damerau-Levenshtein with a band and an early exit. Bounded at two edits and
   * only ever run against short indexed words, so a typo query costs a small
   * multiple of an ordinary one instead of a full quadratic sweep. The
   * transposition row is what makes "recieve" one edit from "receive" rather
   * than two, which keeps a common finger-slip ranked above a genuine misspell. */
  function editWithin(a, b, max) {
    var la = a.length, lb = b.length;
    if (a === b) return 0;
    if (la - lb > max || lb - la > max) return -1;

    var prev2 = null, prev = [], cur = [], i, j;
    for (j = 0; j <= lb; j++) prev[j] = j;

    for (i = 1; i <= la; i++) {
      cur = [];
      cur[0] = i;
      var lo = Math.max(1, i - max), hi = Math.min(lb, i + max);
      if (lo > 1) cur[lo - 1] = max + 1;
      var best = max + 1;
      for (j = lo; j <= hi; j++) {
        var cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        var up = prev[j] == null ? max + 1 : prev[j] + 1;
        var left = cur[j - 1] == null ? max + 1 : cur[j - 1] + 1;
        var diag = prev[j - 1] == null ? max + 1 : prev[j - 1] + cost;
        var v = Math.min(up, Math.min(left, diag));
        if (i > 1 && j > 1 && prev2 &&
            a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) {
          var swap = prev2[j - 2] == null ? max + 1 : prev2[j - 2] + cost;
          if (swap < v) v = swap;
        }
        cur[j] = v;
        if (v < best) best = v;
      }
      for (j = hi + 1; j <= lb; j++) cur[j] = max + 1;
      if (best > max) return -1;
      prev2 = prev;
      prev = cur;
    }
    return prev[lb] <= max ? prev[lb] : -1;
  }

  /* How many edits a term of this length is allowed. One edit for short words,
   * because at four characters two edits reaches unrelated words entirely. */
  function budgetFor(term) {
    if (term.length < 4) return 0;
    if (term.length < 7) return 1;
    return 2;
  }

  function typoScore(term, rec) {
    var max = budgetFor(term);
    if (!max) return -1;
    var i, d, best = -1;
    for (i = 0; i < rec._lw.length; i++) {
      d = editWithin(term, rec._lw[i], max);
      if (d === 0) return 900;
      if (d > 0) best = Math.max(best, d === 1 ? 620 : 430);
    }
    if (best >= 0) return best;
    for (i = 0; i < rec._kw.length; i++) {
      d = editWithin(term, rec._kw[i], max);
      if (d === 0) return 560;
      if (d > 0) best = Math.max(best, d === 1 ? 430 : 300);
    }
    return best;
  }

  function weighted(score, w) { return score < 0 ? -1 : score * w; }

  function scoreRecord(terms, rec) {
    var total = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      var best = -1, s;

      /* Naming the exact id is not a fuzzy match, it is a direct address; a
       * deep link pasted into the field must land on its own record. */
      for (var k = 0; k < rec._idlist.length; k++) {
        if (rec._idlist[k] === t) { best = 4000; break; }
      }

      if (best < 0) {
        s = fuzzyScore(t, rec._label); if (s > best) best = s;
        s = weighted(fuzzyScore(t, rec._syn), 0.72); if (s > best) best = s;
        s = weighted(fuzzyScore(t, rec._path), 0.5); if (s > best) best = s;
        s = weighted(strictScore(t, rec._desc), 0.42); if (s > best) best = s;
        s = weighted(strictScore(t, rec._ids), 0.9); if (s > best) best = s;
      }
      if (best < 0) best = typoScore(t, rec);
      if (best < 0) return -1;          /* every term must land somewhere */
      total += best;
    }
    return total *
      (KIND_WEIGHT[rec.kind] || 1) *
      (EXPOSURE_WEIGHT[rec.exposure] || 1) *
      (STATE_WEIGHT[rec.stateSource] || 1);
  }

  /* ------------------------------------------------------------ the records */

  var IX = {
    built: false,
    records: [],
    byId: null,
    byKind: null,
    builtAt: null,
    order: 0,
    scaleSig: "",
    objectKeys: null,
    sources: null
  };

  function destinationOf(d) {
    d = d || {};
    var out = {
      domainId: d.domainId || null,
      pageId: d.pageId || null,
      sectionId: d.sectionId || null,
      settingId: d.settingId || null,
      managerId: d.managerId || null,
      objectId: d.objectId || null,
      sectionKey: d.sectionKey || null,
      /* The route grammar's fourth manager segment. Null everywhere except a
       * row inside a manager object - a model under a provider, an account
       * under a provider - where the object alone is not the destination. */
      rowId: d.rowId || null
    };
    if (Object.freeze) Object.freeze(out);
    return out;
  }

  function domainRankOf(domainId) {
    var list = M.domains || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === domainId) return i;
    return list.length;
  }

  function addResult(spec) {
    var kind = spec.kind;
    var key = spec.key;
    if (!kind || !key) return null;

    var id = "r:" + kind + ":" + key;
    if (IX.byId[id]) {
      /* Two fixtures can honestly name the same key (the same plugin listed by
       * two managers). The suffix is derived from insertion order over static
       * fixture files, so it is the same string on every reload, which is what
       * "stable across reloads" requires - it is not a random tiebreak. */
      var n = 2;
      while (IX.byId[id + "~" + n]) n += 1;
      id = id + "~" + n;
    }

    var parts = [];
    pushAll(parts, spec.pathParts);
    var path = parts.join(SEP);
    var label = trimText(spec.label) || key;

    var rec = {
      kind: kind,
      label: label,
      typeLabel: spec.typeLabel || "Result",
      path: path,
      pathParts: parts,
      fullPath: path ? path + SEP + label : label,
      disambiguator: spec.disambiguator || null,
      desc: trimText(spec.desc) || "",
      availability: spec.availability || null,
      destination: destinationOf(spec.destination),
      exposure: spec.exposure || "standard",
      stateSource: spec.stateSource || null,
      stateLabel: spec.stateLabel || null,
      changed: spec.changed === true,
      provenance: spec.provenance || "canonical-inventory",
      domainId: (spec.destination && spec.destination.domainId) || null,
      managerId: (spec.destination && spec.destination.managerId) || null,
      _order: IX.order++,
      _rank: 0
    };
    rec._rank = domainRankOf(rec.domainId) * 100000 + rec._order;

    /* The id is defined rather than assigned: routing is done from it, so a
     * concept that tries to "fix up" a result must fail loudly instead of
     * quietly breaking every deep link built from it. */
    if (Object.defineProperty) {
      Object.defineProperty(rec, "id", { value: id, enumerable: true, writable: false, configurable: false });
    } else {
      rec.id = id;
    }

    var syn = [];
    pushAll(syn, spec.search);
    if (spec.disambiguator) syn.push(spec.disambiguator);
    syn.push(rec.typeLabel);

    var ids = [];
    var d = rec.destination;
    if (d.settingId) ids.push(d.settingId);
    if (d.managerId) ids.push(d.managerId);
    if (d.objectId) ids.push(d.objectId);
    if (d.rowId) ids.push(d.rowId);
    ids.push(id);

    rec._label = norm(label);
    rec._syn = norm(syn.join(" "));
    rec._path = norm(path + " " + (spec.disambiguator || ""));
    rec._desc = norm(rec.desc);
    rec._ids = norm(ids.join(" "));
    rec._idlist = [];
    for (var q = 0; q < ids.length; q++) rec._idlist.push(norm(ids[q]));

    var seenL = {}, seenK = {};
    rec._lw = wordsOf(label, 3, 12, seenL, []);
    rec._kw = wordsOf(syn.join(" ") + " " + path, 4, 40, seenK, []);

    IX.byId[id] = rec;
    IX.records.push(rec);
    (IX.byKind[kind] || (IX.byKind[kind] = 0));
    IX.byKind[kind] += 1;
    IX.sources[rec.provenance] = (IX.sources[rec.provenance] || 0) + 1;
    return rec;
  }

  /* ------------------------------------------------------ inventory records */

  /* One inventory row can honestly be five different kinds of result. The
   * packet's failure case is a search that answers "backup" with eight
   * identical-looking rows, so the kind is derived from what the record IS:
   * an unavailable capability is not a control, a diagnostic reading is not a
   * preference, an action is not a value, and a row with nothing set yet is
   * work to do rather than a setting to change. */
  function inventoryKind(rec, st) {
    if (st.source === "unavailable") return "unavailable";
    if (rec.exposure === "diagnostic") return "diagnostic";
    if (rec.kind === "action") return "action";
    if (st.source === "notConfigured") return "setup";
    return "setting";
  }

  function inventoryTypeLabel(kind, st) {
    if (kind === "unavailable") return "Unavailable";
    if (kind === "diagnostic") return "Diagnostic";
    if (kind === "action") return "Action";
    if (kind === "setup") return "Needs setup";
    if (st.source === "managed") return "Read-only";
    return "Setting";
  }

  function titleOfPage(pageId, fallback) {
    var p = M.page(pageId);
    if (p && p.title) return p.title;
    return fallback || (pageId ? humanise(String(pageId).split(".").pop()) : "");
  }

  function titleOfSection(sectionId, fallback) {
    var s = M.section(sectionId);
    if (s && s.title) return s.title;
    return fallback || (sectionId ? humanise(String(sectionId).split(".").pop()) : "");
  }

  function titleOfDomain(domainId, fallback) {
    var d = M.domain(domainId);
    if (d && d.title) return d.title;
    return fallback || (domainId ? humanise(domainId) : "Settings");
  }

  function addInventoryRecord(s, provenance) {
    if (!s || !s.id) return;
    var st = s.state || {};
    var kind = inventoryKind(s, st);
    var domainTitle = titleOfDomain(s.domainId, s.domainTitle);
    var pageTitle = titleOfPage(s.pageId, s.pageTitle);
    var sectionTitle = titleOfSection(s.sectionId, s.sectionTitle);

    var search = [];
    pushAll(search, s.search);
    pushAll(search, s.badges);
    search.push(pageTitle);
    search.push(sectionTitle);

    addResult({
      kind: kind,
      key: s.id,
      label: s.label,
      typeLabel: inventoryTypeLabel(kind, st),
      /* The packet's example path is the container the row sits in -
       * "AI Brains & Providers > Models & Defaults > Model" - with the row's own
       * label carried separately. `fullPath` adds the leaf for concepts that
       * want the whole line. */
      pathParts: [domainTitle, pageTitle, sectionTitle],
      disambiguator: sectionTitle || pageTitle,
      desc: s.desc,
      availability: M.stateReason ? M.stateReason(st) : null,
      exposure: s.exposure,
      stateSource: st.source || "default",
      stateLabel: M.stateLabel ? M.stateLabel(st) : null,
      changed: st.source === "custom" && st.isDefault === false,
      provenance: provenance,
      search: search,
      destination: {
        domainId: s.domainId,
        pageId: s.pageId,
        sectionId: s.sectionId,
        settingId: s.id
      }
    });
  }

  /* --------------------------------------------------------------- managers */

  /* A manager record's human words come from whichever fixture describes it.
   * PM2Model.managerRecord falls back to the id itself when nothing does, which
   * would put "manager-doctor" on screen, so the family name from the model is
   * preferred over that fallback. */
  function managerWords(f) {
    var rec = null;
    try { rec = M.managerRecord ? M.managerRecord(f.managerId) : null; } catch (e) { rec = null; }
    var title = rec && rec.title && rec.title !== f.managerId ? rec.title : null;
    return {
      title: title || f.family || humanise(f.managerId),
      purpose: (rec && rec.purpose) || f.why || "",
      state: (rec && rec.state) || null,
      available: rec ? rec.available !== false : true
    };
  }

  function managerKind(f, words) {
    if (!words.available || (words.state && words.state.source === "unavailable")) return "unavailable";
    if (f.archetype === "read-only health projection") return "diagnostic";
    if (f.archetype === "setup or repair sequence") return "setup";
    return "manager";
  }

  function managerTypeLabel(f, kind) {
    if (kind === "unavailable") return "Unavailable";
    if (f.deferred) return "Separate owner";
    if (kind === "diagnostic") return "Read-only";
    if (kind === "setup") return "Set up or repair";
    return "Manager";
  }

  function buildManagers() {
    var list = M.destinations || [];
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      /* Settings Home, Search, the Workspace and the row grammar are surfaces,
       * not manager destinations: they have no managerId to route to, and the
       * authored help set covers them in words a reader would actually type. */
      if (!f || !f.managerId) continue;

      var words = managerWords(f);
      var kind = managerKind(f, words);
      var domainTitle = titleOfDomain(f.domainId, null);

      var search = [f.family, f.archetype, f.managerId];
      var availability = null;
      if (f.deferred) {
        availability = "Handled by the " + (f.owner || words.title) + " owner. " + (f.returns || "");
        search.push(f.owner);
        search.push("owner");
        search.push(f.insertion);
      } else if (kind === "unavailable") {
        availability = (words.state && words.state.reason) || "Not available on this host.";
      }

      addResult({
        kind: kind,
        key: f.managerId,
        label: words.title,
        typeLabel: managerTypeLabel(f, kind),
        pathParts: [domainTitle],
        disambiguator: domainTitle,
        desc: f.deferred ? (f.why || words.purpose) : words.purpose,
        availability: trimText(availability) || null,
        exposure: "standard",
        stateSource: kind === "unavailable" ? "unavailable" : null,
        provenance: "manager-registry",
        search: search,
        destination: { domainId: f.domainId, managerId: f.managerId }
      });
    }
  }

  /* ---------------------------------------------------- objects in managers */

  var ROSTER_LABEL = {
    sources: "Sources", profiles: "Profiles", personas: "Personas", skills: "Skills",
    plugins: "Plugins", notes: "Memories", otherStores: "Other stores", servers: "Servers",
    templates: "Templates", providers: "Providers", rules: "Rules", presets: "Presets",
    perTool: "Per tool", personaProfiles: "Persona profiles", packs: "Packs",
    commands: "Commands", shortcuts: "Shortcuts", defaults: "Defaults", routes: "Routes",
    triggers: "Triggers", destinations: "Destinations", routing: "Routing",
    builtIn: "Built-in sounds", themes: "Themes", formatters: "Formatters", tools: "Tools",
    capabilities: "Capabilities", copyGroups: "Groups", reserved: "Reserved",
    scopes: "Scopes", personalWords: "Personal words", projectWords: "Project words",
    eventNames: "Events", palettes: "Palettes", activityBar: "Activity bar",
    hiddenActivityItems: "Hidden items", capsuleText: "Capsule text", groups: "Groups",
    accounts: "Accounts", models: "Models", installations: "Installations",
    cliInstallations: "Command-line installations", hosts: "Hosts"
  };

  function rosterLabel(key) { return ROSTER_LABEL[key] || humanise(key); }

  var NAME_FIELDS = ["name", "label", "title", "nickname", "product", "configuredCommand", "pattern", "text"];
  var ID_FIELDS = ["id", "key", "installationId", "attemptId"];

  function fieldOf(o, names) {
    for (var i = 0; i < names.length; i++) {
      var v = o[names[i]];
      if (typeof v === "string" && trimText(v)) return trimText(v);
    }
    return null;
  }

  /* An entry earns a place in the index when it has both a stable id and a
   * human name. That pair is exactly what a destination needs, and it filters
   * out the statistics tables and colour samples that share a manager record
   * with the real rosters without pretending they are objects a reader can open. */
  function rosterEntries(arr) {
    if (!isArr(arr) || !arr.length) return null;
    if (arr.length > 200) return null;   /* bounded: volume belongs to PM2Scale */
    var probe = Math.min(arr.length, 3), ok = 0;
    for (var i = 0; i < probe; i++) {
      var o = arr[i];
      if (o && typeof o === "object" && fieldOf(o, ID_FIELDS) && fieldOf(o, NAME_FIELDS)) ok += 1;
    }
    return ok === probe ? arr : null;
  }

  function objectAvailability(o) {
    if (o.available === false) return "Not available on this account.";
    if (typeof o.statusWord === "string" && o.statusWord) return o.statusWord;
    if (typeof o.stateWord === "string" && o.stateWord) return o.stateWord;
    if (typeof o.readinessWord === "string" && o.readinessWord) return o.readinessWord;
    return null;
  }

  function objectKind(o) {
    if (o.available === false) return "unavailable";
    if (o.state === "unavailable" || o.status === "unavailable") return "unavailable";
    return "object";
  }

  function objectSearch(o) {
    var out = [];
    pushAll(out, o.keywords);
    pushAll(out, o.tags);
    var extra = ["summary", "purpose", "role", "note", "detail", "source", "transport",
      "version", "hostName", "hostLabel", "channel", "ownerIdentity", "resolvedPath",
      "command", "binding", "identity", "connection", "product"];
    for (var i = 0; i < extra.length; i++) {
      var v = o[extra[i]];
      if (typeof v === "string" && v) out.push(v);
    }
    return out;
  }

  function addObject(spec) {
    var o = spec.entry;
    var objectName = spec.label || fieldOf(o, NAME_FIELDS) || spec.objectId;
    var kind = objectKind(o);
    var parts = [titleOfDomain(spec.domainId, null), spec.managerTitle];
    if (spec.parentLabel) parts.push(spec.parentLabel);
    if (spec.rosterLabel) parts.push(spec.rosterLabel);

    addResult({
      kind: kind,
      key: spec.managerId + "/" + spec.key,
      label: clip(objectName, 74),
      typeLabel: spec.typeLabel,
      pathParts: parts,
      disambiguator: spec.parentLabel || spec.rosterLabel || spec.managerTitle,
      desc: spec.desc || o.summary || o.purpose || o.note || o.detail || "",
      availability: objectAvailability(o),
      exposure: "standard",
      stateSource: kind === "unavailable" ? "unavailable" : null,
      provenance: spec.provenance || "manager-fixture",
      search: objectSearch(o).concat(spec.search || []),
      destination: {
        domainId: spec.domainId,
        managerId: spec.managerId,
        objectId: spec.objectId,
        sectionKey: spec.sectionKey || null,
        rowId: spec.rowId || null
      }
    });
  }

  function managerContext(managerId) {
    var f = M.familyOf ? M.familyOf(managerId) : null;
    if (!f) return null;
    var words = managerWords(f);
    return { family: f, domainId: f.domainId, title: words.title };
  }

  function buildObjects(scaleOn) {
    var D = window.PMData;
    if (!D || typeof D !== "object") return;

    var contexts = {};
    var ids = M.managerIds ? M.managerIds() : [];
    for (var i = 0; i < ids.length; i++) {
      var ctx = managerContext(ids[i]);
      if (ctx) contexts[ids[i]] = ctx;
    }

    /* Every manager record PMData carries, harvested generically. Reading a
     * plain fixture object is not hydration: no spec is normalised, no
     * subscription is opened, and nothing here calls PM2Managers. */
    var managers = D.managers;
    if (managers && typeof managers === "object") {
      var mids = Object.keys(managers);
      for (var m = 0; m < mids.length; m++) {
        var mid = mids[m];
        var ctx2 = contexts[mid];
        if (!ctx2) continue;             /* no reachable destination, no result */
        var rec = managers[mid];
        if (!rec || typeof rec !== "object") continue;
        var keys = Object.keys(rec);
        for (var k = 0; k < keys.length; k++) {
          var rosterKey = keys[k];
          var entries = rosterEntries(rec[rosterKey]);
          if (!entries) continue;
          var label = rosterLabel(rosterKey);
          var type = singular(label);
          for (var e = 0; e < entries.length; e++) {
            var o = entries[e];
            if (!scaleOn && o.provenance === "scale-fixture") continue;
            var oid = fieldOf(o, ID_FIELDS);
            if (!oid) continue;
            addObject({
              entry: o,
              managerId: mid,
              managerTitle: ctx2.title,
              domainId: ctx2.domainId,
              key: rosterKey + "/" + oid,
              objectId: oid,
              sectionKey: rosterKey,
              rosterLabel: label,
              typeLabel: type,
              provenance: o.provenance === "scale-fixture" ? "scale-fixture" : "manager-fixture"
            });
          }
        }
      }
    }

    var providerCtx = contexts["manager-providers"];
    if (providerCtx && isArr(D.providers)) {
      for (var p = 0; p < D.providers.length; p++) {
        var prov = D.providers[p];
        if (!prov || !prov.id) continue;
        addObject({
          entry: prov,
          managerId: "manager-providers",
          managerTitle: providerCtx.title,
          domainId: providerCtx.domainId,
          key: prov.id,
          objectId: prov.id,
          sectionKey: null,
          rosterLabel: "Providers",
          typeLabel: "Provider",
          label: prov.name,
          desc: prov.summary,
          search: ["provider", prov.group, prov.isolation]
        });

        var accounts = isArr(prov.accounts) ? prov.accounts : [];
        for (var a = 0; a < accounts.length; a++) {
          var acc = accounts[a];
          if (!acc || !acc.id) continue;
          addObject({
            entry: acc,
            managerId: "manager-providers",
            managerTitle: providerCtx.title,
            domainId: providerCtx.domainId,
            key: "accounts/" + acc.id,
            objectId: prov.id,
            sectionKey: "accounts",
            rowId: acc.id,
            parentLabel: prov.name,
            rosterLabel: "Accounts",
            typeLabel: "Account",
            label: acc.nickname || acc.identity || acc.id,
            desc: [acc.product, acc.connection].join(" "),
            search: ["account", prov.name, acc.identity, acc.product]
          });
        }

        var models = isArr(prov.models) ? prov.models : [];
        for (var mo = 0; mo < models.length; mo++) {
          var mod = models[mo];
          if (!mod || !mod.id) continue;
          addObject({
            entry: mod,
            managerId: "manager-providers",
            managerTitle: providerCtx.title,
            domainId: providerCtx.domainId,
            key: "models/" + mod.id,
            objectId: prov.id,
            sectionKey: "models",
            rowId: mod.id,
            parentLabel: prov.name,
            rosterLabel: "Models",
            typeLabel: "Model",
            label: mod.alias || mod.name,
            desc: mod.summary,
            search: ["model", prov.name, mod.name, mod.context]
          });
        }
      }

      addInstallations(D.installations, providerCtx, "installations", "Installations", scaleOn);
      addInstallations(D.providerCliInstallations, providerCtx, "cliInstallations",
        "Command-line installations", scaleOn);
      if (scaleOn) {
        addInstallations(D.installationsScale, providerCtx, "installations", "Installations", scaleOn);
      }
    }

    var hostCtx = contexts["manager-server"];
    if (hostCtx && isArr(D.installationHosts)) {
      for (var h = 0; h < D.installationHosts.length; h++) {
        var host = D.installationHosts[h];
        if (!host || !host.id) continue;
        addObject({
          entry: host,
          managerId: "manager-server",
          managerTitle: hostCtx.title,
          domainId: hostCtx.domainId,
          key: "hosts/" + host.id,
          objectId: host.id,
          sectionKey: "hosts",
          rosterLabel: "Hosts",
          typeLabel: "Host",
          label: host.name,
          desc: humanise(host.kind),
          search: ["host", "server", "execution host"]
        });
      }
    }
  }

  function addInstallations(list, ctx, sectionKey, label, scaleOn) {
    if (!isArr(list)) return;
    for (var i = 0; i < list.length; i++) {
      var inst = list[i];
      if (!inst) continue;
      if (!scaleOn && inst.provenance === "scale-fixture") continue;
      var iid = inst.installationId || inst.id;
      if (!iid) continue;
      var name = inst.configuredCommand || inst.product || inst.id;
      var host = inst.hostLabel || inst.hostName || "";
      addObject({
        entry: inst,
        managerId: "manager-providers",
        managerTitle: ctx.title,
        domainId: ctx.domainId,
        key: sectionKey + "/" + iid,
        objectId: iid,
        sectionKey: sectionKey,
        rosterLabel: label,
        typeLabel: "Installation",
        label: name,
        /* Three installations can honestly be called "claude". The host is what
         * tells them apart, so it is the disambiguator a concept renders. */
        parentLabel: host || null,
        desc: [inst.ownerIdentity, inst.version, host].join(" "),
        search: ["installation", inst.providerFamilyId, inst.resolvedPath, inst.channel, host],
        provenance: inst.provenance === "scale-fixture" ? "scale-fixture" : "manager-fixture"
      });
    }
  }

  /* ------------------------------------- actions, workflows, projections */

  function taxonomyRecords() {
    var D = window.PMData;
    if (!D) return;

    addTaxonomy(D.actions, "action", "Action");
    addTaxonomy(D.setupWorkflows, "setup", "Set up or repair");
    addTaxonomy(D.unavailableCapabilities, "unavailable", "Unavailable");
    addTaxonomy(D.statuses, "diagnostic", "Read-only");
    addTaxonomy(D.diagnostics, "diagnostic", "Diagnostic");
  }

  function addTaxonomy(list, kind, typeLabel) {
    if (!isArr(list)) return;
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      if (!r || !r.id) continue;
      var f = r.managerId && M.familyOf ? M.familyOf(r.managerId) : null;
      /* These fixtures were written against the previous taxonomy, so their
       * category ids are not this model's domain ids and are deliberately
       * ignored. The manager they name is still real, and that is enough to
       * route: anything that cannot be placed is left out rather than guessed. */
      if (!f) continue;
      var words = managerWords(f);
      addResult({
        kind: kind,
        key: r.id,
        label: r.label,
        typeLabel: typeLabel,
        pathParts: [titleOfDomain(f.domainId, null), words.title],
        disambiguator: words.title,
        desc: r.explanation || r.reason || "",
        availability: kind === "unavailable" ? (r.reason || null) : (r.value || null),
        exposure: kind === "diagnostic" ? "diagnostic" : "standard",
        stateSource: kind === "unavailable" ? "unavailable" : null,
        provenance: "manager-fixture",
        search: (r.keywords || []).concat([words.title]),
        destination: { domainId: f.domainId, managerId: r.managerId }
      });
    }
  }

  /* -------------------------------------------------------------- help set */

  /* Intentional help results: the questions a reader types instead of a setting
   * name. Each one points at a destination that exists - the entry is dropped
   * when its manager is not in the model, so help can never be a dead end. */
  var HELP = [
    { key: "connect-a-provider", label: "How do I connect a provider account?",
      managerId: "manager-providers",
      desc: "Sign in to a provider, choose which account this Project uses, and see what each account is allowed to run.",
      search: ["sign in", "login", "account", "api key", "connect", "authenticate", "provider"] },
    { key: "install-a-provider-cli", label: "Install a provider command-line tool",
      managerId: "manager-providers",
      desc: "Nothing is installed until you choose it. Install for one exact host from the official source, then sign in as a separate step.",
      search: ["install", "cli", "command line", "setup", "missing", "not found", "acquire"] },
    { key: "usage-runs-out", label: "What happens when included usage runs out?",
      managerId: "manager-usage",
      desc: "Where usage is measured and what this Project does at the boundary: stop, ask, or move to another account.",
      search: ["usage", "quota", "limit", "credits", "cost", "budget", "runs out", "spend"] },
    { key: "copy-from-another-project", label: "Copy settings from another Project",
      managerId: "manager-copy",
      desc: "A one-time transaction: preview what would be added or replaced, apply it atomically, keep a receipt, and roll back if it was wrong.",
      search: ["copy", "import", "another project", "clone", "migrate", "bring over"] },
    { key: "what-did-i-change", label: "Where are the settings I changed?",
      managerId: "manager-settings-lifecycle",
      desc: "Everything this Project has moved away from its default, with when it changed and how to put it back.",
      search: ["changed", "modified", "not default", "reset", "revert", "history"] },
    { key: "why-read-only", label: "Why can I not change this setting?",
      managerId: "manager-settings-lifecycle",
      desc: "A row can be read-only because a policy owns it or because the host does not offer the capability at all. Both say which.",
      search: ["read only", "managed", "locked", "greyed out", "disabled", "cannot change", "policy"] },
    { key: "restore-earlier-settings", label: "Restore an earlier settings state",
      managerId: "manager-backup",
      desc: "Restore points, what each one covers, and what a restore would replace before it runs.",
      search: ["backup", "restore", "restore point", "undo", "snapshot", "recover"] },
    { key: "something-is-broken", label: "Something is not working - what should I check?",
      managerId: "manager-doctor",
      desc: "The read-only health projection: what was checked, what it found, and the exact Settings row behind each finding.",
      search: ["doctor", "health", "broken", "diagnose", "check", "repair", "troubleshoot"] },
    { key: "what-the-assistant-may-do", label: "Decide what the assistant may do on its own",
      managerId: "manager-filesafe",
      desc: "Permission rules, which tools they cover, and where the assistant must ask before it acts.",
      search: ["permissions", "approval", "ask first", "allow", "deny", "safety", "filesafe", "guard"] },
    { key: "persona-limits", label: "What can a persona do?",
      managerId: "manager-personas",
      desc: "Each persona's purpose, the tools it may reach and the permission profile it runs under.",
      search: ["persona", "role", "character", "voice", "profile"] },
    { key: "commands-and-shortcuts", label: "Find a command or change a shortcut",
      managerId: "manager-commands",
      desc: "Every command this Project exposes, what it runs, and the key that reaches it.",
      search: ["command", "shortcut", "keyboard", "keybinding", "hotkey", "palette"] },
    { key: "what-is-remembered", label: "What does Puppet Master remember between runs?",
      managerId: "manager-memory",
      desc: "What is kept, how long it lasts, and how to remove a memory this Project should not keep.",
      search: ["memory", "remember", "forget", "retention", "context", "history"] },
    { key: "where-notifications-go", label: "Where do notifications go?",
      managerId: "manager-notifications",
      desc: "Which events notify you, on which destination, and what stays quiet.",
      search: ["notifications", "alerts", "notify", "sounds", "desktop", "quiet"] }
  ];

  function buildHelp() {
    for (var i = 0; i < HELP.length; i++) {
      var h = HELP[i];
      var f = M.familyOf ? M.familyOf(h.managerId) : null;
      if (!f) continue;
      var words = managerWords(f);
      addResult({
        kind: "help",
        key: h.key,
        label: h.label,
        typeLabel: "Help",
        pathParts: [titleOfDomain(f.domainId, null), words.title],
        disambiguator: words.title,
        desc: h.desc,
        availability: null,
        exposure: "standard",
        provenance: "authored-help",
        search: h.search.concat([words.title, f.family]),
        destination: { domainId: f.domainId, managerId: h.managerId }
      });
    }
  }

  /* ---------------------------------------------------------- scale fixture */

  /* PM2Scale is written by another module and may be absent, may be present but
   * switched off, and may expose its rows under any of a few plausible names.
   * Its records are indexed exactly like real ones and marked so that evidence
   * can subtract them; nothing synthetic is ever silently counted as canon. */
  function scaleModule() {
    var S = window.PM2Scale;
    if (!S || typeof S !== "object") return null;
    try {
      if (typeof S.enabled === "function" && S.enabled() === false) return null;
      if (S.enabled === false) return null;
    } catch (e) { return null; }
    return S;
  }

  function scaleRecords() {
    var S = scaleModule();
    if (!S) return [];
    var list = null;
    try {
      if (isArr(S.settings)) list = S.settings;
      else if (isArr(S.records)) list = S.records;
      else if (isArr(S.rows)) list = S.rows;
      else if (typeof S.settings === "function") list = S.settings();
      else if (typeof S.all === "function") list = S.all();
      else if (typeof S.list === "function") list = S.list();
    } catch (e) { list = null; }
    return isArr(list) ? list : [];
  }

  /* A cheap signature so the index notices that the stress fixture arrived or
   * was switched off, without walking its rows on every query. */
  function scaleSignature() {
    var S = scaleModule();
    if (!S) return "off";
    var n = "?";
    if (isArr(S.settings)) n = S.settings.length;
    else if (isArr(S.records)) n = S.records.length;
    else if (isArr(S.rows)) n = S.rows.length;
    return "on:" + n;
  }

  /* ------------------------------------------------------------------ build */

  function build() {
    IX.records = [];
    IX.byId = {};
    IX.byKind = {};
    IX.sources = {};
    IX.order = 0;
    IX.scaleSig = scaleSignature();

    var scaleOn = IX.scaleSig !== "off";

    try {
      var inv = M.settings || [];
      for (var i = 0; i < inv.length; i++) addInventoryRecord(inv[i], "canonical-inventory");
    } catch (e) {}

    try { buildManagers(); } catch (e) {}
    try { buildObjects(scaleOn); } catch (e) {}
    try { taxonomyRecords(); } catch (e) {}
    try { buildHelp(); } catch (e) {}

    if (scaleOn) {
      try {
        var extra = scaleRecords();
        for (var s = 0; s < extra.length; s++) {
          var r = extra[s];
          if (r && r.id && r.label) addInventoryRecord(r, "scale-fixture");
        }
      } catch (e2) {}
    }

    IX.built = true;
    IX.builtAt = new Date().toISOString();
    cacheClear();
  }

  function ensure() {
    if (!IX.built) { build(); return; }
    if (scaleSignature() !== IX.scaleSig) build();
  }

  /* -------------------------------------------------------- query parsing */

  var TRUTHY = /^(1|true|yes|on|changed)$/i;

  var FILTER_KEYS = { domain: 1, kind: 1, changed: 1, state: 1, exposure: 1 };

  function emptyFilters() {
    return { domainIds: [], kinds: [], states: [], exposures: [], changed: null };
  }

  function hasFilters(f) {
    return f.domainIds.length > 0 || f.kinds.length > 0 || f.states.length > 0 ||
      f.exposures.length > 0 || f.changed !== null;
  }

  /* Filter tokens are lifted out of the typed text so that "domain:ai timeout"
   * narrows and then searches, rather than hunting for the literal word
   * "domain:ai". An unrecognised word:word pair is left alone - a reader typing
   * "note:" means it as text. */
  function parseQuery(text) {
    var raw = String(text == null ? "" : text);
    var parts = raw.split(/\s+/);
    var filters = emptyFilters();
    var tokens = [];
    var terms = [];

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (!p) continue;
      var m = /^([A-Za-z]+):(.+)$/.exec(p);
      if (m && FILTER_KEYS[m[1].toLowerCase()]) {
        var key = m[1].toLowerCase();
        var val = m[2];
        var low = norm(val);
        if (key === "domain") {
          filters.domainIds.push(low);
          tokens.push({ key: key, value: low, label: "Domain: " + titleOfDomain(low, null) });
        } else if (key === "kind") {
          filters.kinds.push(low);
          tokens.push({ key: key, value: low, label: "Kind: " + (GROUP_LABEL[low] || humanise(low)) });
        } else if (key === "state") {
          filters.states.push(low);
          tokens.push({ key: key, value: low, label: "State: " + stateWords(low) });
        } else if (key === "exposure") {
          filters.exposures.push(low);
          tokens.push({ key: key, value: low, label: "Level: " + exposureWords(low) });
        } else {
          filters.changed = TRUTHY.test(val);
          tokens.push({ key: "changed", value: filters.changed,
            label: filters.changed ? "Changed in this Project" : "Not changed" });
        }
        continue;
      }
      terms.push(norm(p));
    }

    return {
      raw: raw,
      text: terms.join(" "),
      terms: terms,
      filters: filters,
      tokens: tokens,
      key: terms.join(" ") + "#" + filters.domainIds.join(",") + "#" + filters.kinds.join(",") +
        "#" + filters.states.join(",") + "#" + filters.exposures.join(",") + "#" + filters.changed
    };
  }

  function stateWords(source) {
    var probe = { source: source, isDefault: source === "default" };
    var label = M.stateLabel ? M.stateLabel(probe) : null;
    return label || humanise(source);
  }

  function exposureWords(id) {
    var list = M.EXPOSURE || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].label;
    return humanise(id);
  }

  function inList(list, value) {
    if (!list.length) return true;
    for (var i = 0; i < list.length; i++) if (list[i] === value) return true;
    return false;
  }

  function passes(rec, f) {
    if (f.domainIds.length && !inList(f.domainIds, norm(rec.domainId))) return false;
    if (f.kinds.length && !inList(f.kinds, rec.kind)) return false;
    if (f.states.length && !inList(f.states, norm(rec.stateSource))) return false;
    if (f.exposures.length && !inList(f.exposures, norm(rec.exposure))) return false;
    if (f.changed === true && rec.changed !== true) return false;
    if (f.changed === false && rec.changed === true) return false;
    return true;
  }

  /* ---------------------------------------------------------------- caching */

  var CACHE_MAX = 24;
  var cacheKeys = [];
  var cacheMap = {};

  function cacheClear() { cacheKeys = []; cacheMap = {}; }

  function cacheGet(key) {
    var hit = cacheMap[key];
    if (!hit) return null;
    /* Touch: the least recently answered query is the one evicted. */
    var at = cacheKeys.indexOf(key);
    if (at >= 0) { cacheKeys.splice(at, 1); cacheKeys.push(key); }
    return hit;
  }

  function cachePut(key, value) {
    if (!cacheMap[key]) cacheKeys.push(key);
    cacheMap[key] = value;
    while (cacheKeys.length > CACHE_MAX) {
      var old = cacheKeys.shift();
      delete cacheMap[old];
    }
  }

  /* ------------------------------------------------------- latest-request-wins */

  var GEN = (window.PMVirtual && window.PMVirtual.generations)
    ? window.PMVirtual.generations("pm2-index")
    : (function () {
        var n = 0;
        return {
          next: function () { n += 1; return n; },
          current: function () { return n; },
          isCurrent: function (t) { return t === n; },
          guard: function (t, fn) { return function () { return t === n ? fn.apply(null, arguments) : undefined; }; }
        };
      })();

  /* --------------------------------------------------------------- matching */

  function collect(parsed) {
    var out = [];
    var terms = parsed.terms;
    var f = parsed.filters;
    var recs = IX.records;
    for (var i = 0; i < recs.length; i++) {
      var rec = recs[i];
      if (!passes(rec, f)) continue;
      var score;
      if (terms.length) {
        score = scoreRecord(terms, rec);
        if (score < 0) continue;
      } else {
        /* Filters with no text still browse. Document order keeps the answer
         * identical between two runs, which is what deterministic means here. */
        score = 1000000 - rec._rank;
      }
      out.push({ rec: rec, score: score });
    }
    return out;
  }

  function compareHits(a, b) {
    if (b.score !== a.score) return b.score - a.score;
    if (a.rec.label !== b.rec.label) return a.rec.label < b.rec.label ? -1 : 1;
    return a.rec.id < b.rec.id ? -1 : 1;
  }

  function positive(value, fallback) {
    var n = Number(value);
    if (!isFinite(n) || n <= 0) return fallback;
    return Math.floor(n);
  }

  function stamp(response, generation) {
    var out = {};
    for (var k in response) if (Object.prototype.hasOwnProperty.call(response, k)) out[k] = response[k];
    out.generation = generation;
    return out;
  }

  function query(text, opts) {
    ensure();
    var o = opts || {};
    var limit = positive(o.limit, 40);
    var perGroup = positive(o.perGroup, 8);
    var generation = GEN.next();

    var parsed = parseQuery(text);
    if (!parsed.terms.length && !hasFilters(parsed.filters)) {
      /* An empty field is not a query: a dropdown that answers everything the
       * moment it is focused is noise, not help. */
      return {
        generation: generation, query: parsed.raw, text: "", filters: parsed.filters,
        tokens: parsed.tokens, groups: [], total: 0, shown: 0, truncated: false,
        exhausted: true, scores: {}, top: null, limit: limit, perGroup: perGroup
      };
    }

    var cacheKey = parsed.key + "|" + limit + "|" + perGroup;
    var cached = cacheGet(cacheKey);
    if (cached) return stamp(cached, generation);

    var hits = collect(parsed);

    var pools = {};
    for (var i = 0; i < hits.length; i++) {
      var k = hits[i].rec.kind;
      (pools[k] || (pools[k] = [])).push(hits[i]);
    }

    var groups = [];
    for (var g = 0; g < KIND_ORDER.length; g++) {
      var kind = KIND_ORDER[g];
      var pool = pools[kind];
      if (!pool || !pool.length) continue;
      pool.sort(compareHits);
      groups.push({ kind: kind, label: GROUP_LABEL[kind], results: [], pool: pool,
        total: pool.length, shown: 0, truncated: false });
    }

    /* Round-robin fill rather than group-by-group. With eight kinds and a limit
     * of forty, filling the first group to its cap first would let a wall of
     * settings push the single Unavailable answer off the list entirely - and
     * that answer is often the reason the reader searched. */
    var scores = {};
    var shown = 0, slot = 0, top = null, topScore = -1;
    while (shown < limit && slot < perGroup) {
      var added = 0;
      for (var gi = 0; gi < groups.length && shown < limit; gi++) {
        var grp = groups[gi];
        if (slot >= grp.pool.length) continue;
        var hit = grp.pool[slot];
        grp.results.push(hit.rec);
        scores[hit.rec.id] = Math.round(hit.score);
        if (hit.score > topScore) { topScore = hit.score; top = hit.rec; }
        shown += 1;
        added += 1;
      }
      if (!added) break;
      slot += 1;
    }

    var total = 0;
    for (var gj = 0; gj < groups.length; gj++) {
      var gr = groups[gj];
      gr.shown = gr.results.length;
      gr.truncated = gr.shown < gr.total;
      total += gr.total;
      delete gr.pool;
    }

    var response = {
      generation: generation,
      query: parsed.raw,
      text: parsed.text,
      filters: parsed.filters,
      tokens: parsed.tokens,
      groups: groups,
      total: total,
      shown: shown,
      truncated: shown < total,
      exhausted: shown === total,
      scores: scores,
      top: top,
      limit: limit,
      perGroup: perGroup
    };

    cachePut(cacheKey, response);
    return response;
  }

  /* The one result a Home dropdown highlights before the reader presses Down.
   * It is the highest scoring record overall, not the first row of the first
   * group, and the tie-break chain ends in the id so two runs cannot disagree. */
  var lastSuggest = { key: null, result: null };

  function suggest(text) {
    ensure();
    var parsed = parseQuery(text);
    if (!parsed.terms.length && !hasFilters(parsed.filters)) return null;
    if (lastSuggest.key === parsed.key) return lastSuggest.result;

    var hits = collect(parsed);
    var best = null, bestScore = -1;
    for (var i = 0; i < hits.length; i++) {
      var h = hits[i];
      if (h.score > bestScore) { best = h; bestScore = h.score; continue; }
      if (h.score === bestScore && best) {
        var a = h.rec, b = best.rec;
        var ra = KIND_RANK[a.kind] == null ? 99 : KIND_RANK[a.kind];
        var rb = KIND_RANK[b.kind] == null ? 99 : KIND_RANK[b.kind];
        if (ra < rb || (ra === rb && (a.label < b.label || (a.label === b.label && a.id < b.id)))) best = h;
      }
    }
    lastSuggest = { key: parsed.key, result: best ? best.rec : null };
    return lastSuggest.result;
  }

  /* ------------------------------------------------------- the faceted feed */

  function asList(v) {
    if (v == null) return [];
    if (isArr(v)) {
      var out = [];
      for (var i = 0; i < v.length; i++) if (v[i] != null) out.push(norm(v[i]));
      return out;
    }
    return [norm(v)];
  }

  function facetArray(counts, order, labelFor) {
    var out = [];
    for (var i = 0; i < order.length; i++) {
      var id = order[i];
      if (!counts[id]) continue;
      out.push({ id: id, label: labelFor(id), count: counts[id] });
    }
    /* Anything the fixtures introduced that the known order does not name still
     * gets counted; a facet list that quietly drops a value would be a lie. */
    var keys = Object.keys(counts);
    for (var k = 0; k < keys.length; k++) {
      if (order.indexOf(keys[k]) >= 0) continue;
      out.push({ id: keys[k], label: labelFor(keys[k]), count: counts[keys[k]] });
    }
    return out;
  }

  function all(filter) {
    ensure();
    var f = filter || {};
    var domainIds = asList(f.domainIds || f.domains);
    var kinds = asList(f.kinds);
    var exposures = asList(f.exposures);
    var states = asList(f.states);
    var changedOnly = f.changedOnly === true;
    var text = trimText(f.text);
    var parsed = text ? parseQuery(text) : null;

    var limit = f.limit === 0 || f.limit === "all" ? Infinity : positive(f.limit, 500);
    var offset = Math.max(0, positive(f.offset, 0) === 0 ? 0 : positive(f.offset, 0));
    if (f.offset == null) offset = 0;

    var matched = [];
    var facets = { domains: {}, kinds: {}, exposures: {}, states: {}, provenance: {} };
    var changedCount = 0;

    var recs = IX.records;
    for (var i = 0; i < recs.length; i++) {
      var rec = recs[i];
      if (domainIds.length && !inList(domainIds, norm(rec.domainId))) continue;
      if (kinds.length && !inList(kinds, rec.kind)) continue;
      if (exposures.length && !inList(exposures, norm(rec.exposure))) continue;
      if (states.length && !inList(states, norm(rec.stateSource))) continue;
      if (changedOnly && rec.changed !== true) continue;
      if (parsed) {
        if (!passes(rec, parsed.filters)) continue;
        if (parsed.terms.length && scoreRecord(parsed.terms, rec) < 0) continue;
      }

      matched.push(rec);
      var dom = rec.domainId || "none";
      facets.domains[dom] = (facets.domains[dom] || 0) + 1;
      facets.kinds[rec.kind] = (facets.kinds[rec.kind] || 0) + 1;
      facets.exposures[rec.exposure] = (facets.exposures[rec.exposure] || 0) + 1;
      var src = rec.stateSource || "none";
      facets.states[src] = (facets.states[src] || 0) + 1;
      facets.provenance[rec.provenance] = (facets.provenance[rec.provenance] || 0) + 1;
      if (rec.changed) changedCount += 1;
    }

    var sort = f.sort || "path";
    matched.sort(function (a, b) {
      if (sort === "label") {
        if (a.label !== b.label) return a.label < b.label ? -1 : 1;
      } else if (sort === "kind") {
        var ra = KIND_RANK[a.kind] == null ? 99 : KIND_RANK[a.kind];
        var rb = KIND_RANK[b.kind] == null ? 99 : KIND_RANK[b.kind];
        if (ra !== rb) return ra - rb;
      } else if (sort === "changed") {
        var ca = a.changed ? 0 : 1, cb = b.changed ? 0 : 1;
        if (ca !== cb) return ca - cb;
      }
      /* Every sort ends in the same stable key, so paging is repeatable. */
      return a._rank - b._rank;
    });

    var total = matched.length;
    var rows = matched.slice(offset, limit === Infinity ? undefined : offset + limit);

    var domainOrder = [];
    var dlist = M.domains || [];
    for (var d = 0; d < dlist.length; d++) domainOrder.push(dlist[d].id);
    var exposureOrder = [];
    var elist = M.EXPOSURE || [];
    for (var e = 0; e < elist.length; e++) exposureOrder.push(elist[e].id);
    var stateOrder = ["default", "custom", "recommended", "auto", "notConfigured", "managed", "unavailable"];

    return {
      rows: rows,
      total: total,
      shown: rows.length,
      offset: offset,
      limit: limit === Infinity ? total : limit,
      truncated: rows.length < total,
      sort: sort,
      facets: {
        domains: facetArray(facets.domains, domainOrder, function (id) { return titleOfDomain(id, "Elsewhere"); }),
        kinds: facetArray(facets.kinds, KIND_ORDER, function (id) { return GROUP_LABEL[id] || humanise(id); }),
        exposures: facetArray(facets.exposures, exposureOrder, exposureWords),
        states: facetArray(facets.states, stateOrder, function (id) { return id === "none" ? "No state" : stateWords(id); }),
        provenance: facetArray(facets.provenance, ["canonical-inventory", "manager-registry", "manager-fixture", "authored-help", "scale-fixture"], humanise),
        changed: changedCount,
        total: total
      }
    };
  }

  /* ------------------------------------------------------------------- API */

  function byId(id) {
    ensure();
    if (id == null) return null;
    return IX.byId[String(id)] || null;
  }

  function objectExists(managerId, objectId) {
    ensure();
    if (!managerId || !objectId) return false;
    var recs = IX.records;
    for (var i = 0; i < recs.length; i++) {
      var d = recs[i].destination;
      if (d.managerId === managerId && (d.objectId === objectId || d.rowId === objectId)) return true;
    }
    return false;
  }

  /* The result a route landed on, so Back from a deep link can restore the
   * selection without the concept keeping a second table of its own. */
  function byDestination(dest) {
    ensure();
    if (!dest) return null;
    var recs = IX.records;
    for (var i = 0; i < recs.length; i++) {
      var d = recs[i].destination;
      if (dest.settingId) { if (d.settingId === dest.settingId) return recs[i]; continue; }
      if (dest.managerId && d.managerId === dest.managerId) {
        var wantObject = dest.objectId || null, wantRow = dest.rowId || null;
        if ((d.objectId || null) === wantObject && (d.rowId || null) === wantRow) return recs[i];
      }
    }
    return null;
  }

  function stats() {
    ensure();
    var byKind = {};
    for (var i = 0; i < KIND_ORDER.length; i++) byKind[KIND_ORDER[i]] = IX.byKind[KIND_ORDER[i]] || 0;
    var sources = {};
    var keys = Object.keys(IX.sources);
    for (var k = 0; k < keys.length; k++) sources[keys[k]] = IX.sources[keys[k]];
    return {
      records: IX.records.length,
      byKind: byKind,
      builtAt: IX.builtAt,
      /* Load-bearing zero: search reads fixtures, it never asks a manager to
       * normalise itself. A test asserts this stays at zero. */
      hydratedManagers: 0,
      sources: sources,
      scale: IX.scaleSig,
      cachedQueries: cacheKeys.length
    };
  }

  window.PM2Index = {
    KIND_ORDER: KIND_ORDER,
    GROUP_LABEL: GROUP_LABEL,
    kindLabel: function (kind) { return GROUP_LABEL[kind] || "Results"; },

    query: query,
    suggest: suggest,
    byId: byId,
    all: all,
    stats: stats,

    byDestination: byDestination,
    objectExists: objectExists,
    parseQuery: parseQuery,

    /* Building is lazy so that loading the page costs nothing; a concept that
     * wants the cost paid during its own first paint can ask for it. */
    ensure: ensure,
    invalidate: function () { IX.built = false; cacheClear(); lastSuggest = { key: null, result: null }; },
    records: function () { ensure(); return IX.records.slice(); },

    /* Exposed for tests and for a concept that wants to explain a ranking. */
    fuzzyScore: fuzzyScore,
    editWithin: editWithin
  };
})();
