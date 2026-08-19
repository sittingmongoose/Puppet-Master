(function () {
  "use strict";
  var INV = window.PMInventoryData, MD = window.PMManagers2Data, S2 = window.PMState2,
      SR = window.PMSearch2, M2 = window.PMManagers2, C2 = window.PMCopy2;
  var esc = M2.esc, ico = M2.ico;

  /* Curated family -> real inventory setting ids (computed from the 828-row
     inventory; empty array means the family is fixture-only, e.g. Spellcheck). */
  var FAMINV = {"providers":["ai.accounts.provider-connections","ai.accounts.github-connect","ai.accounts.default-account","ai.accounts.account-enabled","ai.accounts.account-name","ai.accounts.set-preferred-account","ai.accounts.claude-login-method","ai.accounts.codex-auth-family","ai.accounts.auth-mode","ai.accounts.multi-account-switching","ai.accounts.opencode-enable","ai.accounts.opencode-add-server","ai.accounts.opencode-endpoint","ai.accounts.anthropic-api-key","ai.accounts.openai-api-key","ai.accounts.gemini-api-key","ai.accounts.cursor-api-key","ai.accounts.minimax-api-key","ai.accounts.github-token","ai.accounts.github-host-policy","ai.accounts.github-oauth-loopback","ai.accounts.credential-storage","ai.accounts.auth-surface","ai.accounts.auth-family","ai.accounts.account-binding","ai.accounts.requested-account-id","ai.accounts.account-priority","ai.accounts.soft-switch","ai.accounts.soft-warning-level","ai.accounts.hard-switch-level","ai.accounts.account-threshold-override","ai.accounts.switch-mode-override","ai.accounts.cooldown-policy","ai.accounts.retry-budget","ai.accounts.quota-profile","ai.accounts.account-roles","ai.accounts.gcp-project-id","ai.accounts.billing-entity","ai.accounts.switch-history","ai.accounts.opencode-server-auth","ai.accounts.opencode-server-actions","ai.accounts.opencode-discovery-ttl","ai.accounts.opencode-cli-path","ai.accounts.opencode-disable-cc-skills","ai.models.default-model","ai.models.default-provider","ai.models.overseer-model","ai.models.worker-model","ai.models.gui-worker-model","ai.models.high-effort-worker-model","ai.models.auditor-model","ai.models.default-variant","ai.models.reasoning-effort","ai.models.teach-model","ai.models.provider-enabled","ai.models.goal-worker-model","ai.models.goal-verifier-model","ai.models.lane-bindings","ai.models.role-policy","ai.models.subagent-model","ai.models.subagent-effort","ai.models.per-lane-platform","ai.models.per-lane-model","ai.models.execution-role","ai.models.provider-priority","ai.models.provider-fallback","ai.models.resolution-policy","ai.models.custom-variants","ai.models.disable-builtin-variant","ai.models.model-alias","ai.models.temperature","ai.models.top-p","ai.models.max-output-tokens","ai.models.capability-overrides","ai.models.cache-strategy","ai.models.cache-with-oauth","ai.models.gemini-cache-ttl","ai.models.max-payload-size","ai.models.system-role-name","ai.models.provider-options","ai.models.requested-effective-inspector","ai.models.interleaved-thinking","ai.models.switch-sanitization","ai.models.synthetic-continue-attempts","ai.usage.provider-health","ai.usage.refresh-models","ai.usage.auto-refresh-discovery","ai.usage.free-models-auto-apply","ai.usage.usage-windows","ai.usage.platform-filters","ai.usage.reset-countdown","ai.usage.cooldown-timers","ai.usage.pressure-visibility","ai.usage.chart-type","ai.usage.ledger-export","ai.usage.ledger-page-size","ai.usage.tool-usage-window","ai.usage.monthly-spend-limit","ai.usage.monthly-token-budget","ai.usage.run-spend-budget","ai.usage.budget-policy","ai.usage.budget-warning-threshold","ai.usage.pressure-sensitivity","ai.usage.quota-management","ai.usage.subagent-wave-cost","ai.usage.max-tool-rounds","ai.usage.max-wall-clock","ai.usage.max-goal-turns","ai.usage.node-timeout","ai.usage.pressure-history","ai.usage.usage-retention","ai.usage.pricing-version"],"context":["memory.assembly.app-rules","memory.assembly.project-rules","memory.assembly.instruction-visibility","memory.assembly.rule-pack-display","memory.assembly.dry-method-guard","memory.assembly.instruction-budget-mode","memory.assembly.memory-capsule-budget","memory.assembly.max-injected-memories","memory.assembly.injected-context-breakdown","memory.assembly.compiled-prompt-preview","memory.assembly.integrity-tracking","memory.assembly.import-cycle-detection","memory.assembly.history-admission-gate","memory.assembly.volatile-quarantine","memory.assembly.cache-lineage","memory.assembly.context-dedup","memory.assembly.epoch-baseline"],"memory":["memory.retention.enabled","memory.retention.history-retention","memory.retention.retrieval-strategy","memory.retention.retrieval-mode","memory.retention.rehydration","memory.retention.retrieval-balance","memory.retention.half-life-by-kind","memory.retention.done-decay-multiplier","memory.retention.auto-save-unverified","memory.retention.verify-without-evidence","memory.retention.pinned-unverified-injection","memory.retention.gist-review-filter","memory.retention.subagent-access","memory.retention.maintenance"],"personas":["personas.library.default-persona","personas.library.persona-manager","personas.library.active-persona","personas.library.selection-mode","personas.library.ask-by-name","personas.library.core-personas","personas.library.lock-persona","personas.library.disabled-bundled","personas.library.custom-scope","personas.library.persona-name","personas.library.persona-description","personas.library.persona-id","personas.library.persona-tags","personas.library.persona-aliases","personas.tuning.default-model","personas.tuning.response-style","personas.tuning.talkativeness","personas.tuning.verbosity","personas.tuning.output-format","personas.tuning.default-mode","personas.tuning.default-platform","personas.tuning.default-variant","personas.tuning.temperature","personas.tuning.top-p","personas.tuning.reasoning-effort","personas.tuning.cost-budget","personas.tools.tool-posture","personas.tools.preferred-tools","personas.tools.discouraged-tools","personas.tools.tool-guidance","personas.tools.system-prompt","personas.tools.default-skills","personas.tools.permission-profile","personas.tools.disabled-plugins","personas.tools.support-badges","personas.tools.skipped-controls-audit"],"goal":["planning.verification.validation-pass","planning.verification.report-visibility","planning.verification.quality-preference","planning.verification.blocker-detail","planning.verification.goal-template","planning.verification.heartbeat-interval","planning.verification.stall-detection","planning.verification.cloud-local-display","planning.verification.strictness","planning.verification.independent-review","planning.verification.auditor-loop","planning.verification.repair-loop","planning.verification.repair-strategies","planning.verification.repair-budget-exhaustion","planning.verification.degraded-mode","planning.verification.certification-level","planning.verification.completion-receipts","planning.verification.receipt-type","planning.verification.evidence-span","planning.verification.source-evidence-layers","planning.verification.gate-enforcement","planning.verification.parallel-stage-enforcement","planning.verification.validators-by-node","planning.verification.invisible-goal-authority","planning.verification.lsp-gate","planning.verification.lsp-gate-scope","planning.verification.lsp-gate-severity","planning.verification.lsp-gate-boundaries","planning.verification.lsp-gate-timeout","planning.verification.lsp-gate-unavailable","planning.verification.goal-auto-resume","planning.verification.goal-checkpoint-cadence","planning.verification.goal-replan-behavior","planning.verification.goal-replan-events","planning.verification.goal-interruption","planning.verification.interrupt-settlement","planning.verification.true-blocker-escalation","planning.verification.goal-write-mode","planning.verification.worknode-activation","planning.verification.receipt-evidence-policy","planning.verification.evidence-retention-days","planning.verification.evidence-retain-runs","planning.verification.prune-on-cleanup","planning.verification.evidence-detail","planning.verification.evidence-redaction","planning.verification.back-seat-driver-mode","planning.interview.workflow-style","planning.interview.output-format","planning.interview.prompting-style","planning.interview.recommend-wizard","planning.interview.wizard-first-run","planning.interview.provider-setup-skip","planning.interview.auto-open-deep-plan","planning.interview.plan-panel-sticky","planning.interview.wizard-intent","planning.interview.wizard-project-path","planning.interview.requirements-max-files","planning.interview.requirements-max-file-size","planning.interview.requirements-upload-order","planning.interview.plan-thoroughness","planning.interview.web-research-mode","planning.interview.todo-auto-use","planning.interview.builder-topics","planning.interview.builder-preferences","planning.interview.prefer-gemini-gui","planning.interview.scope-probe-questions","planning.interview.topic-depth","planning.interview.max-questions-per-topic","planning.interview.min-questions-per-topic","planning.interview.run-all-topics","planning.interview.topic-checklist","planning.interview.require-arch-confirmation","planning.interview.vision-provider","planning.interview.builder-persona-mode","planning.interview.builder-intake-persona","planning.interview.builder-drafting-persona","planning.interview.builder-review-personas"],"crew":["branching.crew.crew-enabled","branching.crew.crew-members","branching.crew.max-crews-per-platform","branching.crew.max-agents-per-crew","branching.subagents.enable-subagents","branching.subagents.parallel-subagents","branching.subagents.max-parallel","branching.subagents.fanout-threshold","branching.subagents.input-token-limit","branching.subagents.retry-policy","branching.subagents.subagents-mandatory","branching.subagents.single-writer-lease","branching.subagents.write-isolation-mode","branching.subagents.per-node-overrides","branching.subagents.required-subagents","branching.subagents.disabled-subagents","branching.subagents.provider-concurrency-cap","branching.subagents.max-total-active-agents","branching.subagents.max-nesting-depth","branching.subagents.max-total-spawned","branching.subagents.delegation-depth","branching.subagents.agent-control-envelope","branching.subagents.child-agent-lease","branching.subagents.child-state-isolation","branching.subagents.external-agent-provenance"],"permissions":["safety.rules.permission-preset","safety.rules.default-tool-permission","safety.rules.chat-mode","safety.rules.per-tool-permissions","safety.rules.rule-editor","safety.rules.scope-selector","safety.rules.scoped-overrides","safety.rules.layer-origin-badge","safety.rules.capability-disclosure","safety.rules.ui-mode","safety.rules.storage-format","safety.approvals.autonomy-mode","safety.approvals.gate-seam","safety.approvals.gate-package","safety.approvals.gate-lane","safety.approvals.checkpoint-types","safety.approvals.require-plan-first","safety.approvals.external-publish-ask","safety.approvals.boundary-enforcement","safety.approvals.alert-channel","safety.approvals.pre-run-display","safety.approvals.approval-ladder-default","safety.approvals.recovery-actions","safety.approvals.timeout-mode","safety.approvals.auto-continue","safety.approvals.wake-scheduler","safety.approvals.doom-loop-action","safety.approvals.doom-loop-threshold","safety.approvals.loop-detection-mode","safety.approvals.max-shell-failures","safety.approvals.max-write-thrash","safety.approvals.max-retryable-errors","safety.approvals.debug-max-browser-branches","safety.approvals.debug-max-no-evidence-loops","safety.approvals.debug-grant-scope","safety.approvals.debug-profile-disclosure","safety.approvals.plan-mode-boundary","safety.approvals.lease-normalization","safety.approvals.hitl-aware-defaults","safety.approvals.history-visibility","safety.approvals.denial-audit-log","safety.approvals.preserve-skip-abort-history","safety.approvals.boundary-default-strictness","safety.protection.bash-guard","safety.protection.security-filter","safety.protection.file-guard","safety.protection.web-tool-permissions","safety.protection.strict-mode","safety.protection.allow-destructive","safety.protection.approved-commands","safety.protection.custom-patterns-path","safety.protection.external-dir-allowlist","safety.protection.external-dir-action","safety.protection.interview-relax","safety.protection.qa-gate-override","safety.protection.security-audit-override","safety.protection.governance-unlock","safety.protection.write-conflict-detection","safety.protection.safe-point-restore","safety.protection.redaction-profile","safety.protection.screenshot-redaction","safety.protection.filesafe-integration"],"bsd":["planning.verification.back-seat-driver-mode"],"notifications":["general.interaction.notifications-enabled","general.interaction.notification-method","general.interaction.tray-notifications","general.interaction.notification-severity","general.interaction.notification-destinations","general.interaction.notification-mapping","general.interaction.dismissal-rationale","general.interaction.alert-quiet-window"],"sounds":["general.interaction.sound-effects","general.interaction.sound-catalog","general.interaction.sound-management","general.interaction.sound-mapping"],"appearance":["general.visual.theme","general.visual.theme-mode","general.visual.basic-color-scheme","general.visual.theme-preview","general.visual.glass-background-mode","general.visual.glass-transparency","general.visual.retro-effects","general.visual.ui-scale","general.visual.font-size","general.visual.interface-density","general.visual.reduce-animations","general.visual.chat-layout-mode","general.visual.high-contrast","general.visual.app-font","general.visual.manage-custom-themes","general.visual.custom-theme-base","general.visual.pixel-grid-opacity","general.visual.scanline-opacity","general.visual.border-width","general.visual.border-radius","general.visual.line-height","general.visual.scrollbar-width","general.visual.padding-scale","general.visual.focus-indicator"],"spellcheck":[],"desktop":["general.interaction.minimize-to-tray","general.startup.window-state","general.startup.crash-restore","general.startup.restore-panel","general.startup.max-persisted-tabs","general.startup.unsaved-capture"],"teacher":["general.interaction.chat-eli5","general.interaction.explain-disabled","general.interaction.show-tooltips"],"doctor":["system.health.run-doctor","system.health.capability-provisioning","system.health.doctor-summary","system.health.auto-run","system.health.check-frequency","system.health.check-scope","system.health.readiness-badges","system.health.degraded-visibility","system.health.remediation-links","system.health.telemetry","system.health.platform-diagnostics"],"files":["code.editing.word-wrap","code.editing.line-numbers","code.editing.syntax-highlighting","code.editing.large-file-threshold","code.editing.max-file-size-mb","code.editing.goto-highlight-ms","general.interaction.hide-ignored-files","general.interaction.max-editor-tabs"],"terminal":["code.terminal.theme","code.terminal.font-family","code.terminal.font-size","code.terminal.shell","code.terminal.cwd","code.terminal.copy-on-select","code.terminal.right-click-paste","code.terminal.kill-confirm","code.terminal.explanations","code.terminal.readability-signals","code.terminal.search","code.terminal.layout-style","code.terminal.layout-restore","code.terminal.transcript-retention","code.terminal.scrollback-limit","code.terminal.copy-behavior","code.terminal.shortcuts","code.terminal.startup-command","code.terminal.allowed-profiles","code.terminal.rendering-mode","code.terminal.sticky-header","code.terminal.performance-mode","code.terminal.shell-integration","code.terminal.font-rendering","code.terminal.tab-role","code.terminal.auto-second-pane","code.terminal.diagnostics-logging"],"lsp":["code.editing.lsp-enabled","code.editing.diagnostics-visibility","code.editing.lsp-server-catalog","code.editing.lsp-custom-servers","code.editing.lsp-root-override","code.editing.lsp-host-attachment","code.editing.lsp-auto-restart","code.editing.lsp-restart","code.editing.lsp-hover-delay","code.editing.lsp-hover-timeout","code.editing.lsp-completion-timeout","code.editing.lsp-symbol-timeout","code.editing.lsp-change-debounce","code.editing.lsp-max-memory","code.editing.lsp-max-cpu","code.editing.lsp-subagent-bias"],"formatters":["code.editing.formatters-enabled","code.editing.formatter-catalog","code.editing.formatter-custom"],"commands":["extensions.commands.keyboard-shortcuts","extensions.commands.shortcut-hints","extensions.commands.search-shortcuts","extensions.commands.custom-commands","extensions.commands.conflict-handling","extensions.commands.text-editing-keys","extensions.commands.reset-shortcuts","extensions.commands.backup-shortcuts","extensions.commands.variant-cycling-key","extensions.commands.command-scope","extensions.commands.command-mode","extensions.commands.command-model","extensions.commands.command-persona","extensions.commands.command-permissions","extensions.commands.override-builtin","extensions.commands.git-routing"],"mcp":["system.mcp.server-list","system.mcp.server-enabled","system.mcp.tool-toggle","system.mcp.import-external","system.mcp.health-status","system.mcp.sign-out","system.mcp.transport","system.mcp.launch-config","system.mcp.remote-url","system.mcp.remote-headers","system.mcp.oauth-autodetect","system.mcp.oauth-refresh","system.mcp.server-scope","system.mcp.timeout","system.mcp.lazy-exposure","system.mcp.catalog-cache-ttl","system.mcp.header-secret-hooks","system.mcp.show-availability","system.mcp.debug-surface"],"skills":["extensions.skills.your-skills","extensions.skills.skill-on-off","extensions.skills.skills-panel","extensions.skills.discovery","extensions.skills.rescan","extensions.skills.info-badges","extensions.skills.registry-view","extensions.skills.sort","extensions.skills.search","extensions.skills.preview","extensions.skills.permissions","extensions.skills.pattern-permissions","extensions.skills.auto-invocation","extensions.skills.auto-enable-new","extensions.skills.validate","extensions.skills.projection","extensions.skills.projection-method","extensions.skills.context-budget-percent","extensions.skills.context-budget-chars"],"plugins":["extensions.plugins.plugin-on-off","extensions.plugins.add-from-catalog","extensions.plugins.add-local","extensions.plugins.remove","extensions.plugins.registry-view","extensions.plugins.auto-enable-new","extensions.plugins.packages","extensions.plugins.hook-timeout","extensions.plugins.tool-override"],"tools":["safety.rules.per-tool-permissions","safety.rules.default-tool-permission","safety.protection.web-tool-permissions"],"testing":["planning.testing.capability-policy","planning.testing.test-visibility","planning.testing.cap-built-in-browser","planning.testing.cap-visible-browser","planning.testing.cap-screenshot-compare","planning.testing.cap-online-research","planning.testing.cap-auto-install","planning.testing.cap-headed-browser","planning.testing.cap-hot-reload","planning.testing.cap-live-preview","planning.testing.cap-desktop-gui","planning.testing.cap-simulator","planning.testing.cap-physical-device","planning.testing.cap-accessibility","planning.testing.cap-api-contract","planning.testing.cap-database","planning.testing.cap-console-network","planning.testing.cap-performance","planning.testing.cap-security","planning.testing.session-actions","planning.testing.github-actions-template"],"storage":["system.advanced.chat-history-retention","system.advanced.runtime-history-days","system.advanced.diagnostic-history-days","system.advanced.released-safe-point-days","system.advanced.preserved-terminal-runs","system.advanced.request-storage-compaction","system.advanced.inspect-holds-quarantine","system.advanced.runtime-artifacts","media.io.artifact-retention"],"backup":["general.startup.restore-panel","general.startup.crash-restore","safety.protection.safe-point-restore","code.terminal.layout-restore","extensions.commands.backup-shortcuts"],"lifecycle":["system.advanced.export-settings","system.advanced.import-settings","system.advanced.reset-defaults","system.advanced.legacy-config-names","system.advanced.config-format"],"history":["general.interaction.history-scope","general.interaction.history-approved-only","general.interaction.history-archived","general.interaction.history-compare","general.interaction.history-export","general.interaction.history-rebuild","general.interaction.thread-archive-days","general.interaction.thread-retention-days","general.interaction.thread-lineage"],"artifacts":["media.io.artifact-retention","media.io.artifacts-location","system.advanced.runtime-artifacts","branching.worktrees.remove-build-artifacts"],"scm":["branching.worktrees.enable-git","branching.worktrees.default-branch","branching.worktrees.pre-merge-tests","branching.worktrees.auto-pr","branching.worktrees.worktree-cleanup","branching.worktrees.clean-untracked-before-run","branching.worktrees.clear-agent-output","branching.worktrees.clean-workspace-now","branching.worktrees.worktree-filter","branching.worktrees.source-control-sections","branching.worktrees.github-pinned-workflows","branching.worktrees.create-github-repo","branching.worktrees.new-repo-details","branching.worktrees.upstream-repo","branching.worktrees.create-fork","branching.worktrees.fork-location","branching.worktrees.feature-branch-name","branching.worktrees.merge-strategy","branching.worktrees.push-behavior","branching.worktrees.force-push-policy","branching.worktrees.git-policy-preset","branching.worktrees.branch-strategy","branching.worktrees.branch-naming-pattern","branching.worktrees.worktree-base-dir","branching.worktrees.auto-worktree-new-threads","branching.worktrees.assistant-worktree-base","branching.worktrees.thread-worktree-binding","branching.worktrees.file-manager-follows","branching.worktrees.pre-merge-test-command","branching.worktrees.pre-merge-test-timeout","branching.worktrees.pre-merge-test-target","branching.worktrees.worktree-count-warning","branching.worktrees.worktree-creation-timeout","branching.worktrees.recovery-tools","branching.worktrees.github-actions-auto-refresh","branching.worktrees.clean-ignored-files","branching.worktrees.remove-build-artifacts","branching.worktrees.clean-all-worktrees","branching.worktrees.evidence-retention-days","branching.worktrees.evidence-retain-last-runs"],"gha":["branching.worktrees.github-pinned-workflows","branching.worktrees.github-actions-auto-refresh","branching.worktrees.create-github-repo","planning.testing.github-actions-template"],"containers":["code.execution.docker-manager-visibility","code.execution.dockerhub-auth-method","code.execution.dockerhub-token","code.execution.dockerhub-signin","code.execution.dockerhub-namespace","code.execution.dockerhub-repository","code.execution.default-registry","code.execution.container-runtime","code.execution.docker-binary-path","code.execution.docker-display-context","code.execution.registry-credentials","code.execution.dockerfile-path","code.execution.container-shell-command","extensions.skills.registry-view","extensions.plugins.registry-view"],"web":["web.providers.web-search-enable","web.providers.provider-order","web.providers.provider-status","web.providers.health-disclosure","web.providers.duckduckgo-enable","web.providers.firecrawl-enable","web.providers.firecrawl-api-key","web.providers.firecrawl-url","web.providers.exa-enable","web.providers.tavily-enable","web.providers.tavily-fetch-mode","web.providers.brave-enable","web.providers.jina-enable","web.providers.model-native-enable","web.providers.capability-matrix","web.providers.web-api-keys","web.fetch.pdf-mode","web.fetch.search-max-results","web.fetch.research-max-sources","web.fetch.research-auto-read-pages","web.fetch.crawl-max-pages","web.fetch.crawl-max-depth","web.fetch.map-max-pages","web.fetch.map-max-depth","web.fetch.request-timeout","web.fetch.cost-warning-threshold","web.fetch.cost-hard-cap","web.fetch.provider-cache","web.fetch.cache-size","web.fetch.cache-ttl-search","web.fetch.cache-ttl-fetch","web.fetch.cache-ttl-crawl","web.fetch.firecrawl-proxy-mode","web.fetch.browser-session-profile","web.fetch.browser-save-session","web.fetch.redirect-policy","web.fetch.egress-timeout","web.fetch.proxy-mode","web.fetch.proxy-http-url","web.fetch.proxy-https-url","web.fetch.no-proxy-domains","web.fetch.proxy-credentials","web.fetch.ca-bundle","web.fetch.per-host-ca","web.fetch.air-gap-mode"],"searchindex":["web.index.enable","web.index.rebuild","web.index.disk-usage","web.index.large-file-threshold","web.index.exclusion-patterns","web.index.follow-symlinks","web.index.remote-cache-mode","web.index.evict-cache"],"cleanup":["code.execution.cleanup-aggressiveness","code.execution.cleanup-scan-cadence","code.execution.hide-ephemeral-cleanup-warnings","planning.verification.prune-on-cleanup","branching.worktrees.worktree-cleanup","branching.worktrees.clean-untracked-before-run","branching.worktrees.clear-agent-output"],"media":["media.image.provider","media.image.model","media.image.model-aliases","media.io.media-input","media.io.media-output","media.io.voice-input","media.io.vision-bridge","media.io.screenshot-source","media.io.image-source-order","media.io.vision-fallback-model","media.io.redaction-policy","media.io.artifact-retention","media.io.artifacts-location","media.capabilities.master","media.capabilities.enabled-types","media.capabilities.video","media.capabilities.tts","media.capabilities.music","media.capabilities.aspect-ratio","media.capabilities.image-size","media.capabilities.image-quality","media.capabilities.image-count","media.capabilities.video-duration","media.capabilities.video-resolution","media.capabilities.tts-voice","media.capabilities.image-format","media.capabilities.response-format","media.capabilities.seed","media.capabilities.prompt-optimizer","media.capabilities.music-bpm","media.capabilities.provider-params"],"dry":["memory.assembly.dry-method-guard"],"onboarding":["general.startup.onboarding","general.startup.reset-home-layout"],"updates":["system.advanced.auto-update","system.advanced.catalog-updates","system.advanced.update-frequency","system.advanced.release-channel"],"servers":["system.mcp.server-list","system.mcp.server-enabled","system.mcp.server-scope"],"hosting":["system.advanced.cli-path-cursor","system.advanced.cli-path-claude"]};

  S2.init("concept-06-directory-take-2");
  SR.register(MD.searchEntries());

  var shell = PMShell2.mount({ conceptName: "Directory Take 2", model: "Qwen 5.8", onHome: goHome, onTier: function () { render(); } });
  var content = shell.content;

  var scrollMem = {};          // route -> scrollTop
  var pending = null;          // {row: id, sec: id} focus after render
  var closed = false;
  var copyState = { source: null, cats: [], preview: null, applied: null };
  var fixtureVals = {};        // concept-local values for fixture rows
  var searchCtx = null;        // active dropdown controller

  function hash() { return location.hash || "#/home"; }
  function routeOf() { return hash().slice(1); }

  function parseRoute() {
    var h = routeOf();
    var qi = h.indexOf("?");
    var q = {};
    if (qi >= 0) {
      h.slice(qi + 1).split("&").forEach(function (kv) {
        var p = kv.split("="); q[p[0]] = decodeURIComponent(p[1] || "");
      });
      h = h.slice(0, qi);
    }
    var parts = h.split("/").filter(Boolean); // ["home"] | ["cat",id(,sub)] | ["mgr",fid(,obj)] | ...
    if (!parts.length || parts[0] === "home") return { view: "home", q: q };
    if (parts[0] === "q") return { view: "home", query: decodeURIComponent(parts.slice(1).join("/")), q: q };
    if (parts[0] === "cat") return { view: "cat", cat: parts[1], sub: parts[2] || null, q: q };
    if (parts[0] === "mgr") return { view: "mgr", fam: parts[1], obj: parts[2] || null, q: q };
    if (parts[0] === "all") return { view: "all", q: q };
    if (parts[0] === "copy") return { view: "copy", q: q };
    if (parts[0] === "lifecycle") return { view: "mgr", fam: "lifecycle", obj: null, q: q };
    return { view: "home", q: q };
  }

  function goHome() { closed = false; location.hash = "#/home"; }
  function nav(h) { location.hash = h; }

  function catById(id) { return INV.byCategory(id) ? INV.byCategory(id).category : null; }
  function famById(id) { for (var i = 0; i < MD.families.length; i++) if (MD.families[i].id === id) return MD.families[i]; return null; }
  function providerById(id) { for (var i = 0; i < MD.providers.length; i++) if (MD.providers[i].id === id) return MD.providers[i]; return null; }
  function deferredById(id) { for (var i = 0; i < MD.deferred.length; i++) if (MD.deferred[i].id === id) return MD.deferred[i]; return null; }
  function familiesInDomain(cat) { return MD.families.filter(function (f) { return f.domain === cat; }); }

  function backTarget(r) {
    if (r.view === "mgr") return { hash: "#/cat/" + famById(r.fam).domain, label: catById(famById(r.fam).domain).title };
    if (r.view === "cat") return { hash: "#/home", label: "Settings Home" };
    if (r.view === "all" || r.view === "copy") return { hash: "#/home", label: "Settings Home" };
    return null;
  }

  /* ---------- chrome pieces ---------- */
  function crumbHtml(r) {
    var parts = ["Settings"];
    if (r.view === "cat" || r.view === "mgr") {
      var cat = r.view === "cat" ? r.cat : famById(r.fam).domain;
      parts.push('<b>' + esc(catById(cat).title) + "</b>");
      if (r.view === "mgr") parts.push("<b>" + esc(famById(r.fam).title) + "</b>");
      if (r.obj) {
        var o = r.fam === "providers" ? providerById(r.obj) : objOf(famById(r.fam), r.obj);
        if (o) parts.push("<b>" + esc(o.label || o.name) + "</b>");
      }
    }
    if (r.view === "all") parts.push("<b>All Settings</b>");
    if (r.view === "copy") parts.push("<b>Copy Settings</b>");
    return '<div class="c6-crumb" data-test="breadcrumb">' + parts.join('<span class="sep">/</span>') + "</div>";
  }

  function topbar(r, extra) {
    var bt = backTarget(r);
    var back = bt ? '<button class="pm-btn pm-btn-quiet pm-btn-sm c6-back" data-test="back" data-nav="' + bt.hash + '">' + ico("arrowLeft", 13) + " Back to " + esc(bt.label) + "</button>" : "";
    return '<div class="c6-topline">' + back +
      '<span class="pm-spacer" style="flex:1"></span>' +
      '<span class="c6-project">' + ico("fileText", 12) + " Project · Orion Data Pipeline</span>" +
      '<button class="pm-btn pm-btn-sm" data-test="close" data-act="close">' + ico("x", 12) + " Close Settings</button>" +
      (extra || "") + "</div>";
  }

  function searchHtml(large, value) {
    return '<div class="c6-search' + (large ? " large" : "") + '">' +
      '<span class="mag">' + ico("search", large ? 16 : 14) + "</span>" +
      '<input data-test="search-input" type="text" autocomplete="off" spellcheck="false" placeholder="Search settings, providers, models, tools…" aria-label="Universal settings search" value="' + esc(value || "") + '">' +
      '<div class="c6-drop" data-test="search-results" hidden></div></div>';
  }

  /* ---------- search dropdown ---------- */
  var TYPE_ORDER = ["setting", "manager", "managed_object", "action", "setup", "diagnostic", "unavailable"];
  function bindSearch(container) {
    var input = container.querySelector("[data-test='search-input']");
    var drop = container.querySelector("[data-test='search-results']");
    if (!input || !drop) return;
    var activeIdx = -1, rows = [];
    function close() { drop.hidden = true; activeIdx = -1; rows = []; }
    function open(results, query) {
      drop.innerHTML = "";
      if (!query || !query.trim()) { close(); return; }
      if (!results.length) {
        drop.innerHTML = '<div class="c6-nores">No matches for “' + esc(query) + '”. Check the spelling — fuzzy matching is on, but this term is too far from anything indexed.</div>';
        drop.hidden = false; return;
      }
      TYPE_ORDER.forEach(function (t) {
        var group = results.filter(function (r) { return r.type === t; });
        if (!group.length) return;
        var cap = document.createElement("div");
        cap.className = "c6-drop-cap";
        cap.innerHTML = "<span>" + esc(t.replace(/_/g, " ")) + "s (" + group.length + ")</span>";
        drop.appendChild(cap);
        group.forEach(function (r) {
          var b = document.createElement("button");
          b.className = "c6-sr";
          b.setAttribute("data-rid", r.rid);
          b.innerHTML = '<span class="pm2-r-title">' + esc(r.label) + '</span>' +
            '<span class="pm-search-type" data-rt="' + esc(r.type) + '">' + esc(r.type.replace(/_/g, " ")) + "</span>" +
            '<span class="c6-path">' + esc((r.path || []).join("  ›  ")) + "</span>" +
            (r.note ? '<span class="c6-note">' + esc(r.note) + "</span>" : "");
          b.addEventListener("mousedown", function (ev) { ev.preventDefault(); });
          b.addEventListener("click", function () { pick(r, input.value); });
          drop.appendChild(b);
        });
      });
      drop.hidden = false;
      rows = Array.prototype.slice.call(drop.querySelectorAll(".c6-sr"));
    }
    function pick(entry, query) {
      // Push the query route FIRST so browser Back restores query + results.
      try { history.pushState(null, "", "#/q/" + encodeURIComponent(query || input.value)); } catch (e) {}
      routeToDest(entry.dest, entry);
    }
    input.addEventListener("input", function () {
      var q = input.value;
      SR.searchAsync(q, function (res) { if (input.value === q) open(res, q); });
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { close(); return; }
      if (drop.hidden && (e.key === "ArrowDown" || e.key === "Enter")) { open(SR.search(input.value), input.value); }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (!rows.length) return;
        e.preventDefault();
        activeIdx = e.key === "ArrowDown" ? (activeIdx + 1) % rows.length : (activeIdx - 1 + rows.length) % rows.length;
        rows.forEach(function (r, i) { r.classList.toggle("active", i === activeIdx); });
        rows[activeIdx].scrollIntoView({ block: "nearest" });
      }
      if (e.key === "Enter") {
        var rid = activeIdx >= 0 && rows[activeIdx] ? rows[activeIdx].getAttribute("data-rid") : (rows[0] ? rows[0].getAttribute("data-rid") : null);
        if (rid) { pick(SR.byRid(rid), input.value); }
      }
    });
    document.addEventListener("click", function (e) {
      if (!container.contains(e.target)) close();
    });
    searchCtx = { open: open, close: close, input: input };
    return { open: open, close: close };
  }

  function routeToDest(dest, entry) {
    if (!dest) { S2.receipt("Not available", entry ? entry.label + ": " + (entry.note || "this capability is not part of this product.") : "This capability is not part of this product.", "info"); return; }
    if (dest.kind === "setting") {
      pending = { row: dest.settingId };
      nav("#/cat/" + dest.category + "/" + (dest.subgroup || "") + "?row=" + encodeURIComponent(dest.settingId));
      return;
    }
    if (dest.kind === "manager") {
      pending = { row: dest.row || null, sec: dest.section || null };
      nav("#/mgr/" + dest.manager + (dest.object ? "/" + dest.object : "") +
        (dest.section || dest.row ? "?" + (dest.section ? "sec=" + dest.section : "") + (dest.row ? (dest.section ? "&" : "") + "row=" + encodeURIComponent(dest.row) : "") : ""));
    }
  }

  /* ---------- rows ---------- */
  function invRows(ids, cap) {
    var list = (ids || []).slice(0, cap || 8);
    if (!list.length) return '<div class="pm2-empty">No project settings are exposed here; this area is fixture-state only.</div>';
    return list.map(function (id) { return M2.row(INV.byId(id), S2.getSetting(id)); }).join("");
  }

  function fixtureRow(fam, r) {
    var v = fixtureVals.hasOwnProperty(r.id) ? fixtureVals[r.id] : r.value;
    var SCEN_BADGE = {
      "appearance.theme": { managed: ["Managed", "managed"], "changed-elsewhere": ["Changed elsewhere", "diff"] },
      "permissions.default-profile": { managed: ["Managed", "managed"] },
      "desktop.startup": { "restart-required": ["Restart required", "warn"] },
      "web.provider": { unavailable: ["Unavailable", "muted"] }
    };
    var scb = (SCEN_BADGE[r.id] || {})[S2.state.scenario];
    var scenOff = !!scb && (S2.state.scenario === "managed" || S2.state.scenario === "unavailable");
    var ctl = "";
    var badge = r.kind === "status" ? '<span class="pm-badge pm-badge-muted">status</span>' : r.kind === "diagnostic" ? '<span class="pm-badge pm-badge-warn">diagnostic</span>' : r.kind === "action" ? '<span class="pm-badge pm-badge-info">action</span>' : "";
    if (r.type === "toggle") ctl = '<button class="pm-toggle" role="switch" aria-checked="' + (v ? "true" : "false") + '" data-fix="' + esc(r.id) + '" data-ft="toggle"' + (scenOff ? " disabled" : "") + '><span class="pm-toggle-knob"></span></button>';
    else if (r.type === "select") ctl = '<select class="pm-select" data-fix="' + esc(r.id) + '" data-ft="select"' + (scenOff ? " disabled" : "") + ">" + ["Off", "Auto", "On", "Ask first", "Balanced", "Standard", "Weekly", "Stable", "This thread", "Ask at phase boundaries", "Auto accept edits", "Progressive", "Ask once per session", "Project when defined", "Language server", "Inline and panel", "30 days", "Date plus topic", "Project artifacts folder", "Forever", "Concise", "PowerShell 7", "UTF-8", "Keep existing", "Ask before reloading", "Minimize to tray", "Auto", "After merge", "Auto-shift to a free port", "Built-in", "30 seconds", "Enable for this project", "Scoped by role", "Home server", "Friendly Dark"].filter(function (o, i, a) { return a.indexOf(o) === i; }).map(function (o) { return '<option' + (o === v ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") + "</select>";
    else if (r.type === "number") ctl = '<input class="pm-input" type="number" style="width:96px" data-fix="' + esc(r.id) + '" data-ft="number" value="' + esc(v) + '"' + (scenOff ? " disabled" : "") + ">";
    else if (r.type === "action") ctl = '<button class="pm-btn pm-btn-sm" data-fix="' + esc(r.id) + '" data-ft="action"' + (scenOff ? " disabled" : "") + ">" + esc(r.value || "Run") + "</button>";
    else ctl = '<span class="c6-secret" style="border-style:none;padding:0">' + esc(v) + "</span>";
    if (scb) badge += ' <span class="pm-badge pm-badge-' + scb[1] + '">' + scb[0] + "</span>";
    return '<div class="c6-frow" data-frow="' + esc(r.id) + '"><div><div class="t">' + esc(r.label) + " " + badge + '</div><div class="d">' + esc(r.desc) + "</div></div><div>" + ctl + "</div></div>";
  }

  function bindFixture(container) {
    container.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-fix]") : null;
      if (!t) return;
      var id = t.getAttribute("data-fix"), ft = t.getAttribute("data-ft");
      var famRow = findFixtureRow(id);
      if (ft === "toggle") {
        var cur = fixtureVals[id] !== undefined ? fixtureVals[id] : (famRow ? famRow.value : false);
        fixtureVals[id] = !cur;
        S2.receipt("Setting changed", (famRow ? famRow.label : id) + " → " + (fixtureVals[id] ? "On" : "Off") + " (this Project only).", "ok");
        render(); return;
      }
      if (ft === "action") {
        var op = S2.beginOp({ title: famRow ? famRow.label : id, phase: "Running", determinate: false });
        setTimeout(function () { S2.finishOp(op, "completed", "Done"); S2.receipt("Action complete", (famRow ? famRow.label : id) + " finished for this Project.", "ok"); }, 700);
        return;
      }
    });
    container.addEventListener("change", function (e) {
      var t = e.target.closest ? e.target.closest("[data-fix]") : null;
      if (!t) return;
      var id = t.getAttribute("data-fix"), ft = t.getAttribute("data-ft");
      var famRow = findFixtureRow(id);
      if (ft === "select") { fixtureVals[id] = t.value; S2.receipt("Setting changed", (famRow ? famRow.label : id) + " → " + t.value + " (this Project only).", "ok"); }
      if (ft === "number") {
        var n = +t.value;
        if (!isFinite(n) || n < 0) { S2.receipt("Validation error", (famRow ? famRow.label : id) + " must be a non-negative number. The previous value was kept.", "warn"); return; }
        fixtureVals[id] = n; S2.receipt("Setting changed", (famRow ? famRow.label : id) + " → " + n + " (this Project only).", "ok");
      }
    });
  }
  function findFixtureRow(id) {
    for (var i = 0; i < MD.families.length; i++) {
      var rows = MD.families[i].rows || [];
      for (var j = 0; j < rows.length; j++) if (rows[j].id === id) return rows[j];
    }
    return null;
  }

  function objOf(fam, id) {
    if (fam.id === "providers") return providerById(id);
    var o = (fam.objects || []).filter(function (x) { return x.id === id; })[0];
    return o || null;
  }
  function healthDot(h) {
    var cls = h === "ok" ? "" : h === "attention" ? "warn" : "muted";
    return '<span class="pm2-health ' + cls + '"><i></i>' + esc(h || "ok") + "</span>";
  }

  /* ---------- views ---------- */
  function homeView(r) {
    var notices = S2.notices();
    var sc = S2.state.scenario;
    var banner = "";
    if (sc === "offline") banner = '<div class="c6-banner err" role="alert">' + ico("alertCircle", 15) + "<div><strong>Working offline.</strong> Catalogs and usage show last-known values; changes still apply locally.</div></div>";
    else if (sc === "import-conflict") banner = '<div class="c6-banner" role="alert">' + ico("alertTriangle", 15) + "<div><strong>Import needs review.</strong> 3 incoming values conflict with this Project's current settings. <button class='pm-btn pm-btn-sm' data-nav='#/lifecycle'>Review conflicts</button></div></div>";
    var attn = "";
    if (notices.length) {
      attn = '<div class="c6-attn"><div class="c6-attn-cap">Needs attention</div>' + notices.map(function (n) {
        return '<div class="c6-attn-row">' + ico(n.kind === "warn" ? "alertTriangle" : n.kind === "ok" ? "checkCircle" : "alertCircle", 14) +
          "<strong>" + esc(n.title) + '</strong><span class="why">' + esc(n.reason) + "</span>" +
          (n.action && n.dest ? '<button class="pm-btn pm-btn-sm" data-dest=\'' + JSON.stringify(n.dest) + '\'>' + esc(n.action) + "</button>" : "") + "</div>";
      }).join("") + "</div>";
    }
    var dests = INV.categories.map(function (c) {
      var fams = familiesInDomain(c.id);
      var attnCount = 0;
      fams.forEach(function (f) { (f.objects || []).forEach(function (o) { if (o.health === "attention") attnCount++; }); });
      var sum = INV.byCategory(c.id).settings.length + " settings · " + fams.length + " manager" + (fams.length === 1 ? "" : "s");
      if (attnCount) sum += ' · <span style="color:var(--warn)">' + attnCount + " need attention</span>";
      return '<button class="c6-dest" data-nav="#/cat/' + c.id + '">' +
        '<span class="ic">' + ico(c.icon, 18) + "</span>" +
        "<span><span class='t'>" + esc(c.title) + "</span><br><span class='d'>" + esc(c.description) + "</span></span>" +
        '<span class="sum">' + sum + "</span>" +
        '<span class="ch">' + ico("chevronRight", 15) + "</span></button>";
    }).join("");
    var recent = (S2.state.recent || []).slice(0, 5).map(function (rc) {
      return '<button data-recent="' + esc(rc.id || "") + '" data-kind="' + esc(rc.kind) + '">' + ico("history", 12) + esc(rc.label) + "</button>";
    }).join("");
    return '<div class="c6-view" data-test="home">' +
      '<div class="c6-crumb" data-test="breadcrumb"><b>Settings</b></div>' +
      topbar(r) +
      searchHtml(true, r.query || "") +
      banner + attn +
      '<h1 class="c6-h1">Settings</h1>' +
      '<p class="c6-lede">Configure how Puppet Master works for this Project. Every choice applies to the current Project only — no scope selectors, no inheritance.</p>' +
      '<div class="c6-dest-cap">Destinations</div>' + dests +
      '<div class="c6-util">' +
        '<button data-nav="#/all">' + ico("list", 13) + " All Settings</button>" +
        '<button data-nav="#/copy">' + ico("layers", 13) + " Copy Settings From Another Project</button>" +
        '<button data-act="recent-toggle">' + ico("history", 13) + " Recent</button>" +
      "</div>" +
      '<div class="c6-recent" id="c6-recent" hidden>' + (recent || '<span class="pm-note">Nothing touched yet in this demo.</span>') + "</div>" +
      "</div>";
  }

  function catView(r) {
    var c = catById(r.cat);
    if (!c) return homeView(r);
    var info = INV.byCategory(r.cat);
    var fams = familiesInDomain(r.cat);
    var subnav = c.subgroups.map(function (g) {
      return '<a href="#/cat/' + c.id + "/" + g.id + '" data-anchor="sec-' + g.id + '"' + (r.sub === g.id ? ' class="cur"' : "") + ">" + esc(g.title) + "</a>";
    }).join("");
    var sections = c.subgroups.map(function (g) {
      var rows = info.settings.filter(function (s) { return s.id.split(".")[1] === g.id; });
      return '<section class="c6-sect" id="sec-' + g.id + '"><h3>' + esc(g.title) + "</h3><p>" + esc(g.description) + "</p>" +
        rows.map(function (s) { return M2.row(s, S2.getSetting(s.id)); }).join("") + "</section>";
    }).join("");
    var mgrs = fams.length ? '<div class="c6-mgrs"><div class="c6-dest-cap">Managers in this domain</div>' + fams.map(function (f) {
      return '<button class="c6-mgr-row" data-nav="#/mgr/' + f.id + '"><span>' + ico(f.icon, 16) + "</span><span><span class='t'>" + esc(f.title) + "</span><br><span class='d'>" + esc(f.summary) + "</span></span><span class='a'>" + esc(f.archetype) + "</span><span>" + ico("chevronRight", 14) + "</span></button>";
    }).join("") + "</div>" : "";
    var deferred = MD.deferred.filter(function (d) { return deferredDomain(d) === r.cat; }).map(deferredShell).join("");
    return '<div class="c6-view wide-extra" data-test="cat">' +
      crumbHtml(r) + topbar(r) + searchHtml(false, "") +
      '<h1 class="c6-h1">' + esc(c.title) + '</h1><p class="lede c6-lede">' + esc(c.description) + "</p>" +
      '<div class="c6-domain-grid"><div>' +
      '<nav class="c6-subnav inline" aria-label="Subgroups">' + subnav + "</nav>" +
      sections + mgrs + deferred +
      '</div><nav class="c6-subnav side" aria-label="Subgroups">' + subnav + "</nav></div></div>";
  }
  function deferredDomain(d) {
    var map = { onboarding: "general", installation: "ai", "server-claim": "system", servers: "system", hosting: "system", "remote-access": "system", "sync-move": "system", updates: "system", "server-backup": "system" };
    return map[d.id] || "system";
  }
  function deferredShell(d) {
    return '<div class="c6-deferred" data-deferred="' + d.id + '"><div class="o">' + ico("lock", 13) + " " + esc(d.title) + ' <span class="pm-badge pm-badge-managed">reserved owner</span></div>' +
      "<p><strong>Owner:</strong> " + esc(d.owner) + ".</p><p><strong>Insertion:</strong> " + esc(d.insertion) + "</p><p><strong>Return contract:</strong> " + esc(d.returnContract) + "</p></div>";
  }

  /* manager view */
  function mgrView(r) {
    var fam = famById(r.fam);
    if (!fam) return homeView(r);
    var cat = catById(fam.domain);
    var head = '<div class="c6-mgr-head"><span class="ic">' + ico(fam.icon, 20) + "</span><div><h1 class='c6-h1' style='font-size:18px'>" + esc(fam.title) + ' <span class="c6-arch">' + esc(fam.archetype) + "</span></h1><p class='c6-lede'>" + esc(fam.summary) + "</p></div></div>";
    var body;
    if (fam.id === "providers") body = providersBody(r);
    else if (fam.archetype === "roster") body = rosterBody(r, fam);
    else body = sheetBody(r, fam, fam.rows || []);
    var relatedDeferred = { providers: ["installation"], servers: ["server-claim", "remote-access"], hosting: ["sync-move"], backup: ["server-backup"] }[fam.id] || [];
    var def = relatedDeferred.map(function (id) { var d = deferredById(id); return d ? deferredShell(d) : ""; }).join("");
    return '<div class="c6-view wide-extra" data-manager="' + esc(fam.id) + '">' +
      crumbHtml(r) + topbar(r) + searchHtml(false, "") + head + body + def + "</div>";
  }

  function rosterBody(r, fam) {
    var objs = fam.objects || [];
    var sel = r.obj || (objs[0] && objs[0].id);
    var o = objOf(fam, sel);
    var pushed = (windowTier() !== "wide" && windowTier() !== "mid") && r.obj ? " pushed" : "";
    var roster = '<div class="c6-roster"><div class="c6-roster-cap">' + esc(fam.title) + " (" + objs.length + ")</div>" +
      objs.map(function (ob) {
        return '<button class="c6-obj' + (ob.id === sel ? " sel" : "") + '" data-nav="#/mgr/' + fam.id + "/" + ob.id + '"><span class="n">' + esc(ob.label) + '</span><span class="s">' + healthDot(ob.health) + "</span></button>";
      }).join("") + "</div>";
    var detail = o ? '<div class="c6-sheet">' +
      (pushed ? '<button class="pm-btn pm-btn-quiet pm-btn-sm" data-test="back" data-nav="#/mgr/' + fam.id + '">' + ico("arrowLeft", 13) + " Back to " + esc(fam.title) + " list</button>" : "") +
      "<h4>" + esc(o.label) + "</h4><p class='sub'>" + esc(o.note) + "</p>" + healthDot(o.health) +
      '<div class="c6-cap">Settings</div>' + (fam.rows || []).map(function (x) { return fixtureRow(fam, x); }).join("") +
      '<div class="c6-cap">Project settings in this area</div>' + invRows(FAMINV[fam.id]) +
      "</div>" : '<div class="pm2-empty">Select an item.</div>';
    return '<div class="c6-cols' + pushed + '">' + roster + detail + "</div>";
  }

  function sheetBody(r, fam, rows) {
    return '<div class="c6-sheet">' +
      '<div class="c6-cap">State and controls</div>' +
      rows.map(function (x) { return fixtureRow(fam, x); }).join("") +
      '<div class="c6-cap">Project settings in this area</div>' + invRows(FAMINV[fam.id]) +
      (FAMINV[fam.id] && FAMINV[fam.id].length > 8 ? '<p class="pm-note">Plus ' + (FAMINV[fam.id].length - 8) + ' more in <button class="pm-btn pm-btn-quiet pm-btn-sm" data-nav="#/cat/' + fam.domain + '">' + esc(catById(fam.domain).title) + "</button>.</p>" : "") +
      "</div>";
  }

  /* providers — roster of 17 fixtures with detail sheet */
  function providersBody(r) {
    var sel = r.obj || "openai-cli";
    var p = providerById(sel) || MD.providers[0];
    var pushed = (windowTier() === "squeezed" || windowTier() === "narrow") && r.obj;
    var roster = '<div class="c6-roster"><div class="c6-roster-cap">Providers (' + MD.providers.length + ")</div>" +
      MD.providers.map(function (x) {
        var h = /not signed in|attention|update available|rollback|unknown|not installed|unavailable/i.test(x.state) ? "warn" : "ok";
        return '<button class="c6-obj' + (x.id === p.id ? " sel" : "") + '" data-nav="#/mgr/providers/' + x.id + '"><span class="n">' + esc(x.name) + '</span><span class="s"><span class="pm2-health ' + h + '"><i></i>' + esc(shortState(x.state)) + "</span></span></button>";
      }).join("") + "</div>";
    var secs = ["overview", "accounts", "models", "limits", "install", "logs"];
    var sec = r.q.sec && secs.indexOf(r.q.sec) >= 0 ? r.q.sec : "overview";
    var navH = '<div class="c6-subnav-h">' + secs.map(function (s) {
      return '<button class="' + (s === sec ? "cur" : "") + '" data-nav="#/mgr/providers/' + p.id + "?sec=" + s + '">' + s[0].toUpperCase() + s.slice(1) + "</button>";
    }).join("") + "</div>";
    var body = "";
    if (sec === "overview") {
      body = '<div class="c6-fact"><span class="k">Connected?</span><span class="v">' + esc(p.state) + "</span></div>" +
        '<div class="c6-fact"><span class="k">Sign-in kind</span><span class="v">' + esc(authLabel(p.authKind)) + "</span></div>" +
        '<div class="c6-fact"><span class="k">Update policy</span><span class="v">' + esc(p.updatePolicy) + (p.updatePolicy === "ask-first" ? " — nothing installs until you approve" : "") + "</span></div>" +
        '<div class="c6-fact"><span class="k">Readiness</span><span class="v">' + esc(p.readiness.join(" · ")) + "</span></div>" +
        '<div class="c6-fact"><span class="k">Default routing</span><span class="v">' + esc(p.accounts.filter(function (a) { return a.preferred; }).map(function (a) { return a.label; }).join(", ") || "—") + "</span></div>";
      if (p.id === "openai-update" || p.id === "openai-scheduled" || p.id === "openai-rollback") {
        body += '<div class="c6-cap">Update lifecycle</div>' + p.logs.map(function (l) { return '<div class="c6-fact"><span class="v">' + esc(l) + "</span><span></span></div>"; }).join("") +
          (p.id === "openai-update" ? '<div class="pm-mgr-actions"><button class="pm-btn pm-btn-primary pm-btn-sm" data-act="approve-update">Approve update</button><button class="pm-btn pm-btn-sm" data-act="defer-update">Defer</button></div>' : "") +
          (p.id === "openai-rollback" ? '<p class="pm-note">Verification failed after updating; the previous generation was restored. Receipt kept.</p>' : "");
      }
    } else if (sec === "accounts") {
      body = (p.accounts.length ? p.accounts.map(function (a) {
        return '<div class="c6-frow"><div><div class="t">' + esc(a.label) + " " + (a.preferred ? '<span class="pm-badge pm-badge-info">preferred</span>' : "") + (a.sticky ? '<span class="pm-badge pm-badge-muted">sticky</span>' : "") + '</div><div class="d">' + healthDot(a.health) + (a.enabled ? "" : " · disabled") + "</div></div>" +
          '<div><button class="pm-btn pm-btn-sm" data-act="acct-prefer" data-id="' + esc(a.id) + '">Use next</button></div></div>';
      }).join("") : '<div class="pm2-empty">No account connected yet.</div>') +
        '<div class="c6-cap">Credentials</div><div class="c6-fact"><span class="k">Secret storage</span><span class="v"><span class="c6-secret">' + ico("key", 12) + " PM secret / vault-ref — never rendered raw</span></span></div>" +
        (p.authKind === "cli-owned-oauth" ? '<p class="pm-note">Sign-in completes inside the provider CLI flow (CLI-owned OAuth). Puppet Master never sees the token.</p>' : "");
    } else if (sec === "models") {
      body = (p.models.length ? p.models.map(function (m) {
        return '<div class="c6-frow" data-frow="' + esc(m.id) + '"><div><div class="t">' + esc(m.label) + (m.free ? ' <span class="pm-badge pm-badge-ok">free</span>' : "") + '</div><div class="d">Effort ' + esc(m.effort) + " · context " + esc(m.context) + "</div></div><div class='v'>" + esc(m.context) + "</div></div>";
      }).join("") : '<div class="pm2-empty">No models until the CLI is installed.</div>') +
        '<div class="c6-cap">Project settings</div>' + invRows(FAMINV.providers ? FAMINV.providers.filter(function (id) { return id.indexOf("ai.models") === 0; }) : [], 6);
    } else if (sec === "limits") {
      var used = p.limits.used;
      body = '<div class="c6-fact"><span class="k">Requests / min</span><span class="v">' + p.limits.rpm + "</span></div>" +
        '<div class="c6-fact"><span class="k">Tokens / min</span><span class="v">' + p.limits.tpm + "</span></div>" +
        '<div class="c6-fact"><span class="k">Requests / day</span><span class="v">' + p.limits.rpd + "</span></div>" +
        '<div class="c6-fact"><span class="k">Usage</span><span class="v">' + (used === "unavailable" ? '<span class="pm-badge pm-badge-muted">usage unavailable</span> provider exposes no meters' : esc(used) + " of monthly window") + "</span></div>";
    } else if (sec === "install") {
      body = (p.installations.length ? p.installations.map(function (i2) {
        return '<div class="c6-frow"><div><div class="t">' + esc(i2.label) + " " + (i2.selected ? '<span class="pm-badge pm-badge-ok">selected</span>' : "") + (i2.shadowed ? '<span class="pm-badge pm-badge-muted">shadowed</span>' : "") + '</div><div class="d">Owner ' + esc(i2.owner) + " · confidence " + esc(i2.confidence) + " · " + esc(i2.host) + (i2.owner === "unknown" ? " — manual management only" : "") + "</div></div><div class='v'>" + (i2.selected ? "in use" : "not in use") + "</div></div>";
      }).join("") : '<div class="pm2-empty">Not installed.</div>') +
        '<div class="c6-banner" style="margin-top:10px">' + ico("download", 14) + "<div>New provider CLIs install only after you choose <strong>Install</strong>, from the official source, for the exact Host/Environment. <button class='pm-btn pm-btn-sm' data-act='install-cli' data-id='" + esc(p.id) + "'>Install…</button></div></div>" +
        '<div class="c6-cap">Runtime demand deep-link</div><div class="c6-fact"><span class="k">From chat</span><span class="v"><button class="pm-btn pm-btn-sm" data-act="runtime-demand">Simulate a runtime demand for this provider</button></span></div>';
    } else {
      body = p.logs.map(function (l) { return '<div class="c6-fact"><span class="v">' + esc(l) + "</span><span></span></div>"; }).join("");
    }
    var detail = '<div class="c6-sheet">' +
      (pushed ? '<button class="pm-btn pm-btn-quiet pm-btn-sm" data-test="back" data-nav="#/mgr/providers">' + ico("arrowLeft", 13) + " Back to provider list</button>" : "") +
      "<h4>" + esc(p.name) + "</h4><p class='sub'>" + esc(p.state) + "</p>" + navH + body +
      '<div class="c6-cap">Project settings in this area</div>' + invRows((FAMINV.providers || []).filter(function (id) { return id.indexOf("ai.accounts") === 0; }), 6) +
      "</div>";
    return '<div class="c6-cols' + (pushed ? " pushed" : "") + '">' + roster + detail + "</div>";
  }
  function shortState(s) { return s.length > 34 ? s.slice(0, 32) + "…" : s; }
  function authLabel(k) {
    return { "pm-direct-oauth": "PM-managed OAuth (tokens refresh automatically)", "cli-owned-oauth": "CLI-owned OAuth (sign-in inside the provider CLI)", "api-key": "API key (PM secret / vault-ref)", manual: "Manual — owner unknown", "external-server": "External server", none: "No credential required" }[k] || k;
  }

  /* all settings */
  var allState = { cat: "all", type: "all", tier: "all", changed: false, managed: false, synth: false, gen: 0 };
  function allView(r) {
    var v = '<div class="c6-view wide-extra" data-test="all">' + crumbHtml(r) + topbar(r) + searchHtml(false, "") +
      '<h1 class="c6-h1">All Settings</h1><p class="c6-lede">Every one of the ' + INV.count + ' real settings, faceted and virtualized. Synthetic stress rows append — they never replace real data.</p>' +
      '<div class="c6-facets">' +
      '<label>Category <select class="pm-select" data-facet="cat"><option value="all">All</option>' + INV.categories.map(function (c) { return '<option value="' + c.id + '">' + esc(c.title) + "</option>"; }).join("") + "</select></label>" +
      '<label>Type <select class="pm-select" data-facet="type"><option value="all">All</option>' + ["select", "toggle", "slider", "number", "action", "radio", "list", "multiselect", "keyvalue", "text", "path"].map(function (t) { return "<option>" + t + "</option>"; }).join("") + "</select></label>" +
      '<label>Tier <select class="pm-select" data-facet="tier"><option value="all">All</option><option>simple</option><option>advanced</option></select></label>' +
      '<label><input type="checkbox" data-facet="changed"> Changed from default</label>' +
      '<label><input type="checkbox" data-facet="managed"> Managed / unavailable</label>' +
      '<label><input type="checkbox" data-facet="synth"> Synthetic stress +2000</label>' +
      '<span class="c6-count" data-count></span></div>' +
      '<div class="c6-vlist" data-test="vlist" data-window="0:0:0"></div></div>';
    return v;
  }
  function synthRow(i) {
    return { id: "synthetic.stress-" + i, label: "Synthetic stress setting " + i, desc: "Generated row for scale testing; not a real product setting.", type: "toggle", tier: "advanced", synthetic: true };
  }
  function mountAll(root) {
    var host = root.querySelector("[data-test='vlist']");
    var countEl = root.querySelector("[data-count]");
    var vl = null, tickOn = false, lastTop = -1;
    function renderRow(s) {
      if (s.synthetic) return '<div class="pm2-row" data-row="' + s.id + '"><div class="pm2-row-main"><div class="pm2-row-title">' + esc(s.label) + ' <span class="pm-badge pm-badge-muted">synthetic</span></div><div class="pm2-row-desc">' + esc(s.desc) + '</div></div><div class="pm2-row-ctl"><button class="pm-toggle" disabled role="switch" aria-checked="false"><span class="pm-toggle-knob"></span></button></div></div>';
      return M2.row(INV.byId(s.id), S2.getSetting(s.id));
    }
    function tick() {
      var iv = setInterval(function () {
        if (!host.isConnected) { clearInterval(iv); return; }
        if (vl && host.scrollTop !== lastTop) { lastTop = host.scrollTop; vl.refresh(); }
      }, 120);
    }
    function filtered() {
      var g = ++allState.gen; // latest-request-wins
      setTimeout(function () {
        if (g !== allState.gen) return;
        var list = INV.settings.filter(function (s) {
          if (allState.cat !== "all" && s.id.split(".")[0] !== allState.cat) return false;
          if (allState.type !== "all" && s.type !== allState.type) return false;
          if (allState.tier !== "all" && s.tier !== allState.tier) return false;
          var st = S2.getSetting(s.id);
          if (allState.changed && (!st || st.source === "default")) return false;
          if (allState.managed && (!st || (st.source !== "managed" && st.source !== "unavailable"))) return false;
          return true;
        });
        var real = list.length;
        if (allState.synth) for (var i = 1; i <= 2000; i++) list.push(synthRow(i));
        countEl.textContent = real + " of " + INV.count + " real" + (allState.synth ? " + 2000 synthetic" : "");
        if (!vl) {
          vl = M2.virtualList({
            host: host, rowHeight: 64, data: list, render: renderRow,
            onWindow: function (a, b, total) { host.setAttribute("data-window", a + ":" + b + ":" + total); }
          });
          M2.bindRows(host);
          if (!tickOn) { tickOn = true; tick(); }
        } else {
          vl.set(list);
        }
        if (pending && pending.row) {
          var idx = -1;
          for (var k = 0; k < list.length; k++) if (list[k].id === pending.row) { idx = k; break; }
          if (idx >= 0) { vl.scrollToIndex(idx); locate(host, pending.row); }
          pending = null;
        }
      }, 30);
    }
    root.querySelectorAll("[data-facet]").forEach(function (el) {
      el.addEventListener("change", function () {
        var f = el.getAttribute("data-facet");
        allState[f] = el.type === "checkbox" ? el.checked : el.value;
        filtered();
      });
    });
    filtered();
  }

  /* copy */
  function copyView(r) {
    var srcSel = '<select class="pm-select" data-copy="source"><option value="">Choose a source project…</option>' + MD.sourceProjects.map(function (p) { return '<option value="' + p.id + '"' + (copyState.source === p.id ? " selected" : "") + ">" + esc(p.name) + " — updated " + esc(p.updated) + "</option>"; }).join("") + "</select>";
    var cats = INV.categories.map(function (c) {
      var cnt = copyState.source ? (MD.sourceProjects.filter(function (p) { return p.id === copyState.source; })[0].counts[c.id] || 0) : INV.byCategory(c.id).settings.length;
      return '<label class="cat"><input type="checkbox" data-copycat="' + c.id + '"' + (copyState.cats.indexOf(c.id) >= 0 ? " checked" : "") + "><span>" + esc(c.title) + '</span><span class="n">' + cnt + " items</span></label>";
    }).join("");
    var preview = "";
    if (copyState.preview) {
      var pv = copyState.preview;
      preview = '<div class="c6-sumgrid">' +
        '<div class="c6-sum"><b>' + pv.counts.add + "</b><span>add</span></div>" +
        '<div class="c6-sum"><b>' + pv.counts.replace + "</b><span>replace</span></div>" +
        '<div class="c6-sum"><b>' + pv.counts.same + "</b><span>unchanged</span></div>" +
        '<div class="c6-sum"><b>' + pv.counts.unavailable + "</b><span>unavailable</span></div>" +
        '<div class="c6-sum"><b>' + pv.counts.conflict + "</b><span>conflict</span></div></div>" +
        '<div class="c6-diff">' + pv.rows.slice(0, 40).map(function (row) {
          return '<div class="r"><span>' + esc(row.label) + ' <span class="pm-badge pm-badge-' + (row.status === "conflict" ? "danger" : row.status === "unavailable" ? "muted" : row.status === "credential" ? "managed" : "info") + '">' + esc(row.status) + "</span></span><span>" + (row.status === "credential" ? esc(row.note) : esc(String(row.current)) + " → " + esc(String(row.incoming))) + "</span></div>";
        }).join("") + (pv.rows.length > 40 ? '<div class="r"><span>…and ' + (pv.rows.length - 40) + " more</span><span></span></div>" : "") + "</div>" +
        '<p class="pm-note" style="margin:8px 0">Credential rows copy an account reference per Project-copy policy; raw secrets are never rendered or exported.</p>' +
        '<div class="pm-mgr-actions">' + (copyState.applied ?
          '<button class="pm-btn pm-btn-sm" data-copyact="rollback">Roll back this copy</button><span class="pm-note">Applied ' + copyState.applied.changed + " changes; restore point " + esc(copyState.applied.restorePoint.id) + " kept. Source and destination remain independent.</span>" :
          '<button class="pm-btn pm-btn-primary pm-btn-sm" data-copyact="apply">Create restore point & apply</button>') + "</div>";
    }
    return '<div class="c6-copyback"><div class="c6-copy" data-test="copy">' +
      crumbHtml(r) +
      '<h2>Copy Settings From Another Project</h2><p class="lede">A one-time transactional copy: preview every change, keep a restore point, verify after apply. Source and destination stay independent.</p>' +
      '<div class="c6-cap">1 · Source project</div>' + srcSel +
      '<div class="c6-cap">2 · Settings to copy</div>' + cats +
      '<div class="pm-mgr-actions"><button class="pm-btn pm-btn-primary pm-btn-sm" data-copyact="preview">Preview</button><button class="pm-btn pm-btn-quiet pm-btn-sm" data-nav="#/home">Cancel</button></div>' +
      (preview ? '<div class="c6-cap">3 · Preview</div>' + preview : "") +
      "</div></div>";
  }

  /* ---------- helpers ---------- */
  function windowTier() { return shell.app.getAttribute("data-wtier") || "wide"; }
  function locate(root, id) {
    var el = root.querySelector('[data-row="' + CSS.escape(id) + '"]') || root.querySelector('[data-frow="' + CSS.escape(id) + '"]');
    if (!el) return;
    el.scrollIntoView({ block: "center" });
    el.classList.remove("pm2-locate");
    void el.offsetWidth;
    el.classList.add("pm2-locate");
    var focusEl = el.querySelector("input,select,button");
    if (focusEl) focusEl.focus({ preventScroll: true });
  }

  function opsStrip() {
    var ops = Object.keys(S2.state.ops || {}).map(function (k) { return S2.state.ops[k]; }).filter(function (o) { return o.state === "starting" || o.state === "running"; });
    if (!ops.length) return "";
    return '<div class="c6-ops">' + ops.map(function (o) {
      return "<span>" + ico("refresh", 12) + ' <span class="ph">' + esc(o.title) + "</span> — " + esc(o.human_phase) + (o.wait_reason ? " (" + esc(o.wait_reason) + ")" : "") + (o.total ? " " + o.completed + "/" + o.total : "") + "</span>";
    }).join("") + "</div>";
  }

  /* ---------- render ---------- */
  function render() {
    var r = parseRoute();
    if (closed) {
      content.innerHTML = '<div class="c6-closed" data-route="/closed">' + ico("checkCircle", 26) + "<h1 class='c6-h1'>Settings closed</h1><p>Your changes are saved for this Project.</p><button class='pm-btn pm-btn-primary' data-act='reopen'>Reopen Settings</button></div>";
      bindCommon(content);
      return;
    }
    var html = "";
    if (r.view === "home") html = homeView(r);
    else if (r.view === "cat") html = catView(r);
    else if (r.view === "mgr") html = mgrView(r);
    else if (r.view === "all") html = allView(r);
    else if (r.view === "copy") html = copyView(r);
    content.innerHTML = '<div data-route="' + esc(routeOf()) + '" style="display:contents"><div class="c6-wrap">' + railHtml(r) + '<div class="c6-main">' + html + "</div></div>" + opsStrip() + "</div>";
    var rootEl = content.querySelector("[data-route]");
    if (S2.state.scenario === "refreshing") {
      var sk = rootEl.querySelector(".c6-main");
      if (sk && !sk.querySelector("[data-skeleton]")) sk.insertAdjacentHTML("beforeend", M2.skeleton("Refreshing cached values"));
      setTimeout(function () {
        var s2el = content.querySelector("[data-skeleton]");
        if (s2el) s2el.remove();
      }, 900);
    }
    bindCommon(rootEl);
    var sc = rootEl.querySelector(".c6-search");
    var ctl = bindSearch(sc);
    if (r.view === "all") mountAll(rootEl);
    if (r.view === "home" && r.query) { ctl.open(SR.search(r.query), r.query); }
    var key = routeOf();
    var mainEl = rootEl.querySelector(".c6-main");
    if (scrollMem[key]) mainEl.scrollTop = scrollMem[key];
    if (r.view === "cat" && r.sub) {
      var sec = rootEl.querySelector("#sec-" + r.sub);
      if (sec) sec.scrollIntoView();
    }
    if (r.q.row) pending = { row: r.q.row };
    if (pending && pending.row && r.view !== "all") {
      locate(rootEl, pending.row);
      pending = null;
    }
    if (pending && pending.sec && r.view === "mgr") {
      var sheetEl = rootEl.querySelector(".c6-sheet");
      if (sheetEl) { sheetEl.classList.remove("pm2-locate"); void sheetEl.offsetWidth; sheetEl.classList.add("pm2-locate"); }
      pending = null;
    }
  }

  function railHtml(r) {
    var activeCat = r.view === "cat" ? r.cat : r.view === "mgr" ? famById(r.fam).domain : null;
    return '<nav class="c6-rail" aria-label="Settings domains"><div class="c6-rail-cap">Settings</div>' +
      '<button class="c6-rail-item' + (r.view === "home" ? " active" : "") + '" data-nav="#/home">' + ico("home", 14) + " Home</button>" +
      INV.categories.map(function (c) {
        return '<button class="c6-rail-item' + (activeCat === c.id ? " active" : "") + '" data-nav="#/cat/' + c.id + '">' + ico(c.icon, 14) + " " + esc(c.title) + "</button>";
      }).join("") +
      '<div class="c6-rail-cap" style="margin-top:10px">Utilities</div>' +
      '<button class="c6-rail-item' + (r.view === "all" ? " active" : "") + '" data-nav="#/all">' + ico("list", 14) + " All Settings</button>" +
      '<button class="c6-rail-item' + (r.view === "copy" ? " active" : "") + '" data-nav="#/copy">' + ico("layers", 14) + " Copy Settings</button>" +
      "</nav>";
  }

  function bindCommon(root) {
  if (!root.querySelector("[data-test='vlist']")) M2.bindRows(root);
  bindFixture(root);
    root.querySelectorAll("[data-nav]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); nav(b.getAttribute("data-nav")); });
    });
    root.querySelectorAll("[data-dest]").forEach(function (b) {
      b.addEventListener("click", function () { routeToDest(JSON.parse(b.getAttribute("data-dest")), null); });
    });
    root.querySelectorAll("[data-anchor]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var el = root.querySelector("#" + a.getAttribute("data-anchor"));
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    root.querySelectorAll("[data-act='close']").forEach(function (b) {
      b.addEventListener("click", function () {
        closed = true;
        S2.receipt("Settings closed", "Returning to the Puppet Master workspace. Changes are saved for this Project.", "info");
        render();
      });
    });
    root.querySelectorAll("[data-act='reopen']").forEach(function (b) { b.addEventListener("click", function () { closed = false; render(); }); });
    root.querySelectorAll("[data-act='recent-toggle']").forEach(function (b) {
      b.addEventListener("click", function () { var el = root.querySelector("#c6-recent"); el.hidden = !el.hidden; });
    });
    root.querySelectorAll("[data-recent]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.getAttribute("data-kind") === "setting") {
          var id = b.getAttribute("data-recent");
          var inv = INV.byId(id);
          if (inv) { pending = { row: id }; nav("#/cat/" + id.split(".")[0] + "/" + id.split(".")[1] + "?row=" + id); }
        }
      });
    });
    root.querySelectorAll("[data-act='approve-update']").forEach(function (b) {
      b.addEventListener("click", function () {
        var op = S2.beginOp({ title: "Provider update", phase: "Waiting for approval", determinate: false, wait: "ask-first policy" });
        setTimeout(function () { S2.advanceOp(op, { human_phase: "Applying verified update" }); }, 400);
        setTimeout(function () { S2.finishOp(op, "completed", "Update applied"); S2.receipt("Update applied", "Provider CLI updated after explicit approval. Receipt kept.", "ok"); }, 1400);
      });
    });
    root.querySelectorAll("[data-act='defer-update']").forEach(function (b) { b.addEventListener("click", function () { S2.receipt("Update deferred", "The update stays available; nothing was installed.", "info"); }); });
    root.querySelectorAll("[data-act='install-cli']").forEach(function (b) {
      b.addEventListener("click", function () {
        var op = S2.beginOp({ title: "CLI install", phase: "Fetching from official source", determinate: true, total: 3 });
        setTimeout(function () { S2.advanceOp(op, { completed: 1, human_phase: "Verifying signature" }); }, 400);
        setTimeout(function () { S2.advanceOp(op, { completed: 2, human_phase: "Probing capability" }); }, 800);
        setTimeout(function () { S2.advanceOp(op, { completed: 3 }); S2.finishOp(op, "completed", "Installed"); S2.receipt("CLI installed", "Installed from the official source for this Host/Environment, after your explicit choice.", "ok"); }, 1200);
      });
    });
    root.querySelectorAll("[data-act='runtime-demand']").forEach(function (b) {
      b.addEventListener("click", function () { S2.receipt("Runtime demand", "A chat run requested this provider; routing honors account priority and fallbacks.", "info"); });
    });
    root.querySelectorAll("[data-act='acct-prefer']").forEach(function (b) {
      b.addEventListener("click", function () { S2.receipt("Preferred account", "The selected account will be used next. Sticky behavior unchanged.", "ok"); });
    });
    root.querySelectorAll("[data-copy='source']").forEach(function (sel) {
      sel.addEventListener("change", function () { copyState.source = sel.value || null; copyState.preview = null; copyState.applied = null; render(); });
    });
    root.querySelectorAll("[data-copycat]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        var id = cb.getAttribute("data-copycat");
        if (cb.checked && copyState.cats.indexOf(id) < 0) copyState.cats.push(id);
        if (!cb.checked) copyState.cats = copyState.cats.filter(function (x) { return x !== id; });
      });
    });
    root.querySelectorAll("[data-copyact='preview']").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!copyState.source) { S2.receipt("Choose a source", "Select a source project before previewing.", "warn"); return; }
        if (!copyState.cats.length) { S2.receipt("Choose categories", "Select at least one settings area to copy.", "warn"); return; }
        copyState.preview = C2.preview(copyState.source, copyState.cats);
        render();
      });
    });
    root.querySelectorAll("[data-copyact='apply']").forEach(function (b) {
      b.addEventListener("click", function () {
        var res = C2.apply(copyState.preview);
        copyState.applied = res;
        render();
      });
    });
    root.querySelectorAll("[data-copyact='rollback']").forEach(function (b) {
      b.addEventListener("click", function () { C2.rollbackLast(); copyState.applied = null; copyState.preview = null; render(); });
    });
  }

  /* escape order: popup -> row detail -> one level out -> home */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var pop = document.querySelector(".pm-pop-menu");
    if (pop) { pop.remove(); return; }
    if (searchCtx && !searchCtx.input.closest(".c6-search").querySelector("[data-test='search-results']").hidden) { searchCtx.close(); return; }
    var det = content.querySelector(".pm2-row-detail:not([hidden])");
    if (det) { det.setAttribute("hidden", ""); return; }
    var r = parseRoute();
    var bt = backTarget(r);
    if (bt) { nav(bt.hash); return; }
    // stop at Home; never close Settings on Escape
  });

  // width-tier fallback for environments where ResizeObserver is throttled
  function syncTier() {
    var w = shell.app.clientWidth;
    var tier = w < 860 ? "squeezed" : w < 1150 ? "narrow" : w < 1600 ? "mid" : "wide";
    if (shell.app.getAttribute("data-wtier") !== tier) { shell.app.setAttribute("data-wtier", tier); render(); }
  }
  window.addEventListener("resize", syncTier);
  setInterval(syncTier, 400);

  S2.subscribe(function (kind) {
    if (kind === "setting" || kind === "scenario" || kind === "rollback" || kind === "op") render();
  });

  content.addEventListener("scroll", function (e) { if (e.target.classList && e.target.classList.contains("c6-main")) scrollMem[routeOf()] = e.target.scrollTop; }, { passive: true, capture: true });
  window.addEventListener("hashchange", render);
  render();
})();
