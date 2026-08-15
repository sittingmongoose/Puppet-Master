/* Opus 5 — bounded scale fixtures for the packet's performance test matrix.
 *
 * Added by the 2026-08-13 dependency correction. `PERFORMANCE_SETTINGS_RETURN`
 * §16 and the decision register §23 require evidence at scale that the authored
 * fixture cannot provide:
 *
 *   825+ settings searched without instantiating a manager
 *   100 detected installations collapsed to human summaries
 *   50 MCP/tool entries progressively disclosed
 *   a provider catalogue large enough that "render cached first" is meaningful
 *
 * Everything generated here is marked `provenance: "scale-fixture"` so a
 * reviewer can tell authored content from volume, and so a screenshot of a
 * concept is never mistaken for 800 hand-written settings. `05_DESKTOP...` is
 * explicit that a concept need not RENDER 825 rows; the index must be able to
 * SEARCH them, which is what this file provides.
 *
 * Loads after the domain modules and before pm-data-seal.js.
 */
(function () {
  "use strict";

  var D = window.PMData;
  if (!D) return;

  function st(o) {
    return Object.assign({ source: "default", scope: "global", isDefault: true, restart: "none", provenance: "scale-fixture" }, o);
  }

  function category(id) {
    var found = null;
    D.categories.forEach(function (c) { if (c.id === id) found = c; });
    return found;
  }

  /* Deterministic pseudo-random so the fixture is identical on every load. */
  function seeded(seed) {
    var s = seed >>> 0 || 1;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  var rand = seeded(20260813);
  function pick(list) { return list[Math.floor(rand() * list.length) % list.length]; }

  /* ============================================== 1. SEARCHABLE SETTING VOLUME */

  /* Real subjects drawn from the families the packet already requires, so a
   * search for "timeout" or "retention" returns plausible rows rather than
   * "Setting 412". */
  var SUBJECTS = [
    "Request timeout", "Retry limit", "Backoff ceiling", "Retention window", "Cache size",
    "Concurrent workers", "Log detail", "Diagnostic sampling", "Idle release", "Warm-up",
    "Batch size", "Poll interval", "Stale threshold", "Verification depth", "Snapshot count",
    "Compression level", "Index shard size", "Prefetch depth", "Queue depth", "Lease duration"
  ];
  var DOMAINS = [
    { cat: "system", sub: "sys-diagnostics", area: "Diagnostics" },
    { cat: "system", sub: "sys-storage", area: "Storage" },
    { cat: "extensions", sub: "ext-tools", area: "Tools" },
    { cat: "code", sub: "code-lsp", area: "Language servers" },
    { cat: "code", sub: "code-testing", area: "Testing" },
    { cat: "collab", sub: "collab-git", area: "Source control" },
    { cat: "media", sub: "media-output", area: "Media" },
    { cat: "agents", sub: "agents-advanced", area: "Routing" }
  ];
  var KINDS = ["toggle", "select", "number", "text"];
  var EXPOSURES = ["standard", "advanced", "expert", "diagnostic"];

  function subcategory(catId, subId) {
    var cat = category(catId);
    if (!cat) return null;
    var found = null;
    cat.subcategories.forEach(function (s) { if (s.id === subId) found = s; });
    return found;
  }

  /* The authored surface stays the authored surface. Volume rows go into one
   * clearly-labelled subcategory per domain so no concept accidentally renders
   * hundreds of generated rows inside a hand-designed screen. */
  var added = 0;
  DOMAINS.forEach(function (dom, di) {
    var cat = category(dom.cat);
    if (!cat) return;
    var rows = [];
    for (var i = 0; i < 70; i++) {
      var subject = SUBJECTS[(di * 7 + i) % SUBJECTS.length];
      var kind = KINDS[(di + i) % KINDS.length];
      var exposure = EXPOSURES[(i % 4 === 0) ? 0 : (i % 3)];
      var id = "scale-" + dom.cat + "-" + i;
      var value = kind === "toggle" ? (i % 3 !== 0)
        : kind === "number" ? (10 + (i * 7) % 300)
        : kind === "select" ? pick(["Automatic", "Conservative", "Aggressive"])
        : "Default";
      rows.push({
        id: id,
        label: dom.area + " — " + subject + " " + (i + 1),
        explanation: "Bounded " + subject.toLowerCase() + " for " + dom.area.toLowerCase() +
          ". Generated volume for the search and scale tests; the authored rows in this category are the designed surface.",
        kind: kind,
        exposure: exposure,
        options: kind === "select" ? ["Automatic", "Conservative", "Aggressive"] : undefined,
        keywords: [subject.toLowerCase(), dom.area.toLowerCase(), "scale"],
        state: st({ value: value, defaultValue: value, isDefault: true })
      });
      added += 1;
    }
    cat.subcategories.push({
      id: "scale-" + dom.cat,
      title: dom.area + " — bounded limits",
      summary: "Generated volume so search, virtualization and scale behaviour can be measured honestly. Not a designed screen.",
      keywords: ["scale", "limits", dom.area.toLowerCase()],
      provenance: "scale-fixture",
      settings: rows
    });
  });

  /* ================================================== 2. 100 INSTALLATIONS */

  var HOSTS = [
    { id: "host-this-computer", name: "This Windows computer" },
    { id: "host-wsl-ubuntu", name: "WSL Ubuntu" },
    { id: "host-home-truenas", name: "Home TrueNAS" },
    { id: "host-macbook-air", name: "MacBook Air" },
    { id: "host-linux-build", name: "Linux build server" }
  ];
  var PRODUCTS = [
    "Git", "Jujutsu", "GitHub CLI", "Node.js", "Bun", "Deno", "Python", "uv", "Ruff", "Go",
    "gopls", "rust-analyzer", "clangd", "Docker Engine", "Podman", "kubectl", "Helm",
    "ripgrep", "fd", "jq", "Pandoc", "ffmpeg", "ImageMagick", "SQLite tools", "Terraform"
  ];
  var READINESS = [
    { state: "ready", word: "Ready" },
    { state: "update", word: "Update available" },
    { state: "repair", word: "Needs repair" },
    { state: "external", word: "Installed and managed externally" },
    { state: "managed", word: "Managed by your organization" },
    { state: "shadowed", word: "Another installation is being used" }
  ];

  D.installationsScale = [];
  for (var n = 0; n < 100; n++) {
    var host = HOSTS[n % HOSTS.length];
    var product = PRODUCTS[n % PRODUCTS.length];
    var ready = READINESS[(n * 3) % READINESS.length];
    D.installationsScale.push({
      id: "scale-inst-" + n,
      provenance: "scale-fixture",
      product: product,
      /* Humanized identity only. The raw host id stays a key, never copy. */
      hostId: host.id,
      hostName: host.name,
      version: (1 + (n % 6)) + "." + (n % 12) + "." + (n % 5),
      readiness: ready.state,
      readinessWord: ready.word,
      /* An installation is never a provider CLI in this fixture: the
       * adjudication forbids pre-seeded provider CLIs, and a generated
       * hundred-row list is exactly where one would sneak in. */
      isProviderCli: false,
      acquisition: ready.state === "external" ? "installed_externally"
        : ready.state === "managed" ? "organization_managed"
        : "pm_tool_store",
      lastVerified: (1 + (n % 28)) + " days ago"
    });
  }

  /* ==================================================== 3. 50 MCP ENTRIES */

  var MCP_KINDS = ["stdio", "http", "sse"];
  var MCP_STATES = [
    { s: "connected", w: "Connected" },
    { s: "disconnected", w: "Disconnected" },
    { s: "setup", w: "Needs sign-in" },
    { s: "degraded", w: "Degraded" }
  ];
  D.mcpScale = [];
  for (var m = 0; m < 50; m++) {
    var ms = MCP_STATES[(m * 2) % MCP_STATES.length];
    D.mcpScale.push({
      id: "scale-mcp-" + m,
      provenance: "scale-fixture",
      name: ["Filesystem", "Search", "Issue tracker", "Docs", "Metrics", "Calendar", "Registry", "Analytics", "Notes", "Vault"][m % 10] + " " + (Math.floor(m / 10) + 1),
      transport: MCP_KINDS[m % MCP_KINDS.length],
      state: ms.s,
      stateWord: ms.w,
      tools: 2 + (m % 17),
      resources: m % 9,
      protocolRequested: "2025-06-18",
      protocolNegotiated: ms.s === "degraded" ? "2025-03-26" : "2025-06-18"
    });
  }

  /* ============================================ 4. PROVIDER CATALOGUE VOLUME */

  /* Display names follow the OMP catalogue reference convention: the product
   * and plan are part of the human identity, and a subscription route is a
   * different entry from an API route. Research baseline only. */
  D.providerCatalogScale = [];
  var CATALOG = [
    "Anthropic (Claude Pro/Max)", "Anthropic (API)", "ChatGPT Plus/Pro (Codex Subscription)", "OpenAI (API)",
    "Azure OpenAI", "Google (Gemini Code Assist)", "Google (Vertex AI)", "Z.AI (GLM Coding Plan)",
    "Kimi Code", "DeepSeek (API)", "Mistral (API)", "Groq", "Together", "Fireworks", "OpenRouter",
    "Ollama (local)", "LM Studio (local)", "llama.cpp (local)", "vLLM (self-hosted)", "Hugging Face"
  ];
  for (var q = 0; q < CATALOG.length; q++) {
    D.providerCatalogScale.push({
      id: "scale-provider-" + q,
      provenance: "scale-fixture",
      name: CATALOG[q],
      configured: q < 4,
      /* Unconfigured providers are never probed at startup and never rendered
       * as active accounts (register §13, PERFORMANCE §6). */
      probedAtStartup: false,
      models: 3 + (q % 14)
    });
  }

  D.scaleFixture = {
    provenance: "scale-fixture",
    note: "Generated for the packet's performance matrix. Authored content is unchanged and unmarked.",
    settingsAdded: added,
    installations: D.installationsScale.length,
    mcpEntries: D.mcpScale.length,
    providerCatalogEntries: D.providerCatalogScale.length
  };
})();
