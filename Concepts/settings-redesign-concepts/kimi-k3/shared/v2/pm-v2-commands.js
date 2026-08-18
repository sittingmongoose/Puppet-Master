/* ============================================================================
   pm-v2-commands.js — candidate command/wiring/DRY impact helpers (headless)
   ----------------------------------------------------------------------------
   Every semantic action a concept exposes must be inventoried against canon
   before an ID is proposed (packet 09). This module carries the candidate
   register (aligned with the base packet's CANDIDATE_COMMAND_ID_REGISTER) and
   builders that emit the per-concept delta files:
     candidate-command-delta.json, candidate-wiring-delta.json,
     candidate-dry-delta.json, impact-register.json
   Candidate IDs stay provisional; canon is never mutated.
   ========================================================================== */
(function () {
  "use strict";

  /* Candidate command families (base packet register, abridged to Settings). */
  var CANDIDATE_COMMANDS = {
    navigation: [
      "cmd.settings.open", "cmd.settings.navigate", "cmd.settings.search.focus",
      "cmd.settings.search.select_result", "cmd.settings.category.select",
      "cmd.settings.subcategory.select", "cmd.settings.setting.focus",
      "cmd.settings.manager.open", "cmd.settings.back", "cmd.settings.close"
    ],
    values: [
      "cmd.settings.value.set", "cmd.settings.default.restore",
      "cmd.settings.scope.inspect"
    ],
    lifecycle: [
      "cmd.settings.export", "cmd.settings.import.preview", "cmd.settings.import.apply",
      "cmd.settings.import.rollback", "cmd.settings.reset.preview", "cmd.settings.reset.apply",
      "cmd.settings.copy_from_project.preview", "cmd.settings.copy_from_project.apply",
      "cmd.settings.copy_from_project.rollback"
    ],
    providers: [
      "cmd.provider.install.begin", "cmd.provider.install.verify", "cmd.provider.repair",
      "cmd.provider.auth.begin", "cmd.provider.account.select", "cmd.provider.model.default",
      "cmd.provider.routing.set", "cmd.provider.usage.refresh", "cmd.provider.test_connection"
    ],
    managers: [
      "cmd.manager.hydrate", "cmd.manager.object.select", "cmd.manager.subpage.select",
      "cmd.manager.object.save", "cmd.manager.object.test", "cmd.manager.refresh"
    ],
    operations: [
      "cmd.op.cancel", "cmd.op.retry", "cmd.op.rollback"
    ]
  };

  var PRESERVE_OR_REUSE = [
    "cmd.account.select_profile", "cmd.provider.switch_route",
    "cmd.usage.refresh", "cmd.usage.export"
  ];
  var RETIRE_OR_ALIAS = [
    { id: "cmd.settings.bloom.open", reason: "old chip/bloom architecture; compatibility alias only" }
  ];

  /** Singular owners that must NOT be duplicated (DRY boundary, packet 09). */
  var SINGULAR_OWNERS = [
    "ResourceGovernor", "ObservableWork", "BinaryLocator",
    "shared integration lifecycle", "provider readiness/usage",
    "Project identity", "browser sessions",
    "Product Onboarding", "Installation/Deployment", "Server Claim/Bootstrap",
    "Servers/Execution Hosts/Clients", "Project Hosting & Files",
    "Remote Access", "Project Sync/Move", "App/Content Updates",
    "Full Server backup owner flow"
  ];

  function flatCommands() {
    var out = [];
    Object.keys(CANDIDATE_COMMANDS).forEach(function (family) {
      CANDIDATE_COMMANDS[family].forEach(function (id) { out.push({ id: id, family: family }); });
    });
    return out;
  }

  /**
   * Build the candidate-command delta for a concept.
   * used: [{id, family?, status, notes?}] where status is one of
   * reuse | alias | supersession | collision | missing-handler | new-candidate.
   * Concepts pass only the commands their UI actually performs.
   */
  function commandDelta(conceptId, used) {
    return {
      schema_id: "pm.settings_bakeoff.candidate_command_delta.v1",
      concept: conceptId,
      provisional: true,
      canon_mutated: false,
      preserve_or_reuse: PRESERVE_OR_REUSE,
      retire_or_alias: RETIRE_OR_ALIAS,
      actions: used.map(function (u) {
        return {
          candidate_id: u.id,
          family: u.family || null,
          status: u.status || "new-candidate",
          owner: u.owner || "unassigned (candidate)",
          typed_payload_result_error: u.typed || "payload/result/error typed in implementation pass",
          project_identity: "current Project only",
          availability_disabled_reason: u.availability || "computed from state; disabled reason shown when unavailable",
          idempotency_fencing: u.idempotency || "idempotent per setting revision; stale results dropped",
          persistence_event_receipt: u.receipts || "local demo persistence; receipt for transactions",
          observable_work_link: u.work || "operations projected via ObservableWork simulator",
          route_effect: u.route || null,
          equivalents: "GUI + command palette + natural-language + automation (candidate parity)",
          notes: u.notes || null
        };
      })
    };
  }

  /** Candidate wiring delta: route/deep-link/event wiring proposals. */
  function wiringDelta(conceptId, routes) {
    return {
      schema_id: "pm.settings_bakeoff.candidate_wiring_delta.v1",
      concept: conceptId,
      provisional: true,
      canon_mutated: false,
      routes: routes.map(function (r) {
        return {
          surface: r.surface,                 // e.g. "settings.search.result"
          destination_object: r.destination,  // {domain,page,manager,object,section,row}
          opens: r.opens || null,
          emits: r.emits || [],
          listens: r.listens || [],
          notes: r.notes || null
        };
      })
    };
  }

  /** Candidate DRY delta: data/semantic reuse vs concept-native presentation. */
  function dryDelta(conceptId, entries) {
    return {
      schema_id: "pm.settings_bakeoff.candidate_dry_delta.v1",
      concept: conceptId,
      provisional: true,
      canon_mutated: false,
      singular_owners_preserved: SINGULAR_OWNERS,
      entries: entries.map(function (e) {
        return {
          component: e.component,
          kind: e.kind, // "headless-data" | "headless-semantics" | "presentation-native"
          shared: !!e.shared,
          second_owner_created: false,
          notes: e.notes || null
        };
      })
    };
  }

  /** Impact register skeleton (packet template + packet 09 closure fields). */
  function impactRegister(conceptId, rows) {
    return {
      schema_id: "pm.settings_bakeoff.impact_register.v1",
      concept: conceptId,
      generated: "2026-08-18",
      canon_mutated: false,
      rows: rows.map(function (r) {
        return {
          area: r.area,
          interaction: r.interaction,
          canon_checked: r.canon_checked !== false,
          disposition: r.disposition || "new-candidate",
          candidate_id: r.candidate_id || null,
          owner: r.owner || null,
          closure_needed: r.closure_needed || [
            "canonical command ID and owner", "typed payload/result/error",
            "availability/disabled reason", "idempotency/fencing/stale-result handling",
            "persistence/event/receipt effect", "ObservableWork operation link",
            "route/deep-link/focus effect", "GUI/NL/palette/automation equivalence",
            "production wiring evidence and regression fixture"
          ],
          notes: r.notes || null
        };
      })
    };
  }

  window.PM_V2_COMMANDS = {
    CANDIDATE_COMMANDS: CANDIDATE_COMMANDS,
    PRESERVE_OR_REUSE: PRESERVE_OR_REUSE,
    SINGULAR_OWNERS: SINGULAR_OWNERS,
    flatCommands: flatCommands,
    commandDelta: commandDelta,
    wiringDelta: wiringDelta,
    dryDelta: dryDelta,
    impactRegister: impactRegister
  };
})();
