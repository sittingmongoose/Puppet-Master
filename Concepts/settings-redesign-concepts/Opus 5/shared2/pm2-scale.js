/* Opus 5 — bounded synthetic volume for the performance matrix.
 *
 * The packet asks two separate questions and this file answers only the second:
 *
 *   1. Does the concept carry the REAL inventory?      -> shared2/pm2-inventory.js, 828 records
 *   2. Does it still behave at several thousand?       -> here
 *
 * Everything generated in this file is marked `provenance: "scale-fixture"`, lives
 * under the `scale.` id prefix, and is OFF until a reviewer turns it on. A screenshot
 * of a concept therefore never silently contains invented settings, and the evidence
 * reports can subtract this volume from the real coverage counts exactly.
 *
 * Generation is seeded, so the same reviewer sees the same 2,400 rows every time and
 * a performance measurement is comparable between runs.
 */
(function () {
  "use strict";

  var M = window.PM2Model;
  if (!M) throw new Error("pm2-scale: pm2-model.js must load first");

  var TARGET_SETTINGS = 2400;

  function seeded(seed) {
    var s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  /* Subjects drawn from families the product already has, so a search for "timeout"
   * or "retention" at scale returns plausible rows rather than "Setting 1,412". */
  var SUBJECT = [
    "Request timeout", "Retry limit", "Backoff ceiling", "Retention window", "Cache size",
    "Concurrency limit", "Queue depth", "Idle disconnect", "Warm-up requests", "Batch size",
    "Log verbosity", "Sample rate", "Snapshot interval", "Compaction threshold", "Prefetch depth",
    "Handshake timeout", "Keep-alive interval", "Read buffer", "Write buffer", "Flush interval",
    "Redirect limit", "Header budget", "Payload ceiling", "Chunk size", "Parse timeout",
    "Refresh cadence", "Stale tolerance", "Probe interval", "Failure threshold", "Recovery delay"
  ];

  var QUALIFIER = [
    "for background work", "for foreground work", "on this host", "for delegated runs",
    "when the network is slow", "during verification", "for large projects", "on first use",
    "while offline", "for repeated failures", "under memory pressure", "for parallel agents"
  ];

  var KIND = ["toggle", "number", "select", "text", "slider"];

  var built = null;
  var active = false;

  function build() {
    if (built) return built;
    var rand = seeded(20260818);
    var settings = [];
    var domains = M.domains;

    for (var i = 0; i < TARGET_SETTINGS; i++) {
      var domain = domains[i % domains.length];
      var page = domain.pages[Math.floor(rand() * domain.pages.length) % domain.pages.length];
      var section = page.sections[Math.floor(rand() * page.sections.length) % page.sections.length];
      var subject = SUBJECT[Math.floor(rand() * SUBJECT.length) % SUBJECT.length];
      var qualifier = QUALIFIER[Math.floor(rand() * QUALIFIER.length) % QUALIFIER.length];
      var kind = KIND[Math.floor(rand() * KIND.length) % KIND.length];
      var n = i + 1;

      settings.push({
        id: "scale." + domain.id + "." + n,
        label: subject + " " + qualifier,
        desc: "Volume fixture used to measure search and list behaviour at scale. It is not a product setting.",
        kind: kind,
        options: kind === "select" ? ["Off", "Conservative", "Balanced", "Aggressive"] : [],
        default: kind === "toggle" ? false : (kind === "number" || kind === "slider" ? 30 : ""),
        recommended: null,
        tier: "advanced",
        curated: false,
        badges: [],
        related: [],
        search: [subject.toLowerCase(), "scale", "fixture"],
        domainId: domain.id,
        pageId: page.id,
        sectionId: section.id,
        exposure: "diagnostic",
        legacyScope: [],
        provenance: "scale-fixture",
        state: {
          source: rand() < 0.18 ? "custom" : "default",
          value: kind === "toggle" ? false : (kind === "number" || kind === "slider" ? 30 : ""),
          defaultValue: kind === "toggle" ? false : (kind === "number" || kind === "slider" ? 30 : ""),
          isDefault: true,
          restart: "none"
        }
      });
    }

    /* Large rosters, so "render the cached list first" and "virtualize" are
     * measurable rather than rhetorical. */
    function roster(prefix, count, make) {
      var out = [];
      for (var j = 0; j < count; j++) out.push(make(j, prefix + "-" + (j + 1)));
      return out;
    }

    var installations = roster("scale-install", 140, function (j, id) {
      var hosts = ["This computer", "WSL · Ubuntu 24.04", "Container · build-runner", "SSH · orion-build-02"];
      return {
        id: id,
        name: "Provider CLI generation " + (j + 1),
        host: hosts[j % hosts.length],
        status: j % 11 === 0 ? "shadowed" : (j % 17 === 0 ? "unknown-owner" : "ready"),
        version: "2." + (j % 9) + "." + (j % 5),
        provenance: "scale-fixture"
      };
    });

    var tools = roster("scale-tool", 220, function (j, id) {
      return {
        id: id, name: "Catalogued tool " + (j + 1),
        state: j % 7 === 0 ? "available" : (j % 13 === 0 ? "needs-setup" : "enabled"),
        provenance: "scale-fixture"
      };
    });

    var servers = roster("scale-server", 60, function (j, id) {
      return {
        id: id, name: "Execution host " + (j + 1),
        state: j % 9 === 0 ? "unreachable" : "healthy",
        provenance: "scale-fixture"
      };
    });

    var models = roster("scale-model", 320, function (j, id) {
      return {
        id: id, name: "Catalogued model " + (j + 1),
        family: ["chat", "reasoning", "embedding", "vision"][j % 4],
        provenance: "scale-fixture"
      };
    });

    built = {
      settings: settings,
      installations: installations,
      tools: tools,
      servers: servers,
      models: models,
      counts: {
        settings: settings.length,
        installations: installations.length,
        tools: tools.length,
        servers: servers.length,
        models: models.length
      }
    };
    return built;
  }

  var api = {
    provenance: "scale-fixture",
    target: TARGET_SETTINGS,

    /* Always the full fixture, whether or not a reviewer has turned it on. Used by
     * the performance harness, which measures the worst case deliberately. */
    all: function () { return build(); },

    /* What the search index and the lists should actually see right now. */
    records: function () { return active ? build().settings : []; },
    objects: function (kind) { return active ? (build()[kind] || []) : []; },

    active: function () { return active; },
    setActive: function (on) {
      active = !!on;
      if (active) build();
      return active;
    },

    counts: function () { return build().counts; }
  };

  /* `PM2Scale.settings` reads as a plain array so a caller does not have to know
   * whether the fixture is on; when it is off, the array is simply empty. */
  if (Object.defineProperty) {
    Object.defineProperty(api, "settings", {
      get: function () { return api.records(); },
      enumerable: true
    });
  }

  window.PM2Scale = api;
})();
