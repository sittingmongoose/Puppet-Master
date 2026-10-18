
/* ============================================================
   PMConcept6 — Usage page demo wiring (owner: usage agent)
   Part 18 owns the renderers and exposes window.PM6_USAGE.
   This block registers every usage.* demo action with PM_DEMO
   and subscribes to the engine bus (usage.tick / usage.alert /
   page.changed). Defensive throughout: works standalone if the
   engine or the page surface is missing.
   ============================================================ */
(function () {
  'use strict';

  function U() { return window.PM7_USAGE || window.PM6_USAGE || null; }
  function PD() { return window.PM_DEMO || null; }
  var BRIDGE_STATE_KEY = '__PM7_USAGE_BRIDGE_STATE_V1__';
  var bridgeState = window[BRIDGE_STATE_KEY] || {
    initialized:false, side_effects_started:false, actions:{}, subscriptions:{},
    stats:{ init_count:0, init_attempt_count:0, action_registration_count:0, subscription_count:0, preferred_surface:null, failure_count:0, rejected_attempt_count:0, failures:[] }
  };
  window[BRIDGE_STATE_KEY] = bridgeState;
  var bridgeStats = bridgeState.stats;
  window.PM7_USAGE_BRIDGE_STATS = bridgeStats;
  function recordBridgeFailure(kind, name, error) {
    bridgeStats.failure_count += 1;
    bridgeStats.failures.push({ kind:kind, name:name, message:String(error && error.message || error) });
  }

  function init() {
    if (bridgeState.initialized) return true;
    if (bridgeState.side_effects_started) return false;
    var pd = PD(), u = U();
    if (!pd || !pd.actions || !pd.actions.register || typeof pd.on !== 'function' || !u) return false;

    /* ---------------- action handlers (delegated [data-demo-action] router) ---------------- */
    bridgeState.side_effects_started = true; bridgeStats.init_attempt_count += 1;
    bridgeStats.preferred_surface = window.PM7_USAGE ? 'PM7_USAGE' : 'PM6_USAGE';
    var reg = function (name, handler) {
      if (bridgeState.actions[name]) return bridgeState.actions[name] === 'registered';
      bridgeState.actions[name] = 'attempting';
      try { pd.actions.register(name, handler); bridgeState.actions[name] = 'registered'; bridgeStats.action_registration_count += 1; return true; }
      catch (error) { bridgeState.actions[name] = 'failed'; recordBridgeFailure('action', name, error); return false; }
    };
    var sub = function (name, handler) {
      if (bridgeState.subscriptions[name]) return bridgeState.subscriptions[name] === 'registered';
      bridgeState.subscriptions[name] = 'attempting';
      try { pd.on(name, handler); bridgeState.subscriptions[name] = 'registered'; bridgeStats.subscription_count += 1; return true; }
      catch (error) { bridgeState.subscriptions[name] = 'failed'; recordBridgeFailure('subscription', name, error); return false; }
    };

    reg('usage.refresh', function () {
      u.spinRefresh();
      return { toast: 'Re-reading usage from every provider route. Normalized UsageRecords also refresh on their own every 5 minutes.' };
    });

    reg('usage.export_json', function () {
      return u.exportJson('snapshot')
        ? { toast: 'Usage snapshot downloaded — tastebook-usage.json (demo data, normalized UsageRecords).' }
        : { toast: 'Export hiccuped — try it again.' };
    });

    reg('usage.ledger_json', function () {
      return u.exportJson('ledger')
        ? { toast: 'Filtered ledger downloaded — tastebook-usage-ledger.json. usage_event_refs are included per row.' }
        : { toast: 'Export hiccuped — try it again.' };
    });

    reg('usage.switch_account', function (ctx) {
      var identity = ctx && ctx.arg, d = u.data, target = null;
      (d.accounts || []).forEach(function (account) {
        if (account.id === identity || account.account_id === identity || account.connection_id === identity) target = target || account;
      });
      if (!target) return { toast: 'That stable account identity is not in the demo roster.' };
      if (target.setup_required) return { disabled:true, reason:'provider_setup_required', toast:'Provider setup is required before this account can be selected.' };
      u.active_account_id = target.account_id;
      u.rerender('stable_account_identity'); u.injectIcons();
      return { toast:'Selected ' + target.account_id + ' locally; requested and effective routes remain explicit and unchanged.' };
    });

    var acked = {};
    reg('usage.alert_ack', function (ctx) {
      var id = (ctx && ctx.arg) || 'alert';
      if (acked[id]) return { disabled: true, reason: 'already_done' };
      acked[id] = true;
      return { toast: 'Acknowledged — the warning stays visible here but stops raising a card on the Dashboard.' };
    });

    reg('usage.alert_snooze', function (ctx) {
      var id = (ctx && ctx.arg) || 'alert';
      if (acked['snooze:' + id]) return { disabled: true, reason: 'already_done' };
      acked['snooze:' + id] = true;
      return { toast: 'Snoozed for 1 hour — it returns if Copilot is still over the line at 15:42.' };
    });

    reg('usage.alert_route', function () {
      if (acked['route']) return { disabled: true, reason: 'already_done' };
      acked['route'] = true;
      return { toast: 'New frontend work now prefers Codex (Plus plan) until the Copilot window resets at 17:05.' };
    });

    reg('usage.anomaly_keep', function () {
      return { toast: 'Guard confirmed — token_spike on node n-19 stays blocked; the run continues from its safe point.' };
    });

    var allowedOnce = false;
    reg('usage.anomaly_allow', function () {
      if (allowedOnce) return { disabled: true, reason: 'already_done' };
      allowedOnce = true;
      return { toast: 'Allowed once — this local guard action does not fabricate a provider Usage attempt.' };
    });

    reg('usage.drill', function (ctx) {
      var ref = (ctx && ctx.arg) || '';
      try { if (window.PM_PAGES && window.PM_PAGES.go) window.PM_PAGES.go('orchestrator'); } catch (e) {}
      return { toast: 'Opened in Orchestrator — the drill-through kept usage_event_ref ' + (ref || '(unknown)') + '.' };
    });

    /* ---------------- bus subscriptions ---------------- */
    if (typeof pd.on === 'function') {
      /* engine ledger rows use normalized UsageRecord field names; map to the page row shape */
      var EV_MAP = { worker_turn: 'completion', auditor_review: 'completion', plan_compile: 'completion', chat_turn: 'completion', subagent_turn: 'completion', account_switch: 'switch' };
      function identitySlug(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
      function numericFact(value) { if (value == null || value === '') return NaN; var numeric = Number(value); return Number.isFinite(numeric) ? numeric : NaN; }
      function mapEngineRow(er) {
        var platform = String(er.platform || '').trim(), platformSlug = identitySlug(platform);
        var provider = (u.data.providers || []).filter(function (item) { return item.provider_id === er.provider_id || (platform && (item.id === platformSlug || String(item.name).toLowerCase() === platform.toLowerCase())); })[0];
        var providerId = typeof er.provider_id === 'string' && er.provider_id ? er.provider_id : provider ? provider.provider_id : '';
        var occurredAt = typeof er.occurred_at === 'string' && er.occurred_at ? er.occurred_at : typeof er.timestamp === 'string' ? er.timestamp : '';
        var settlement = typeof er.settlementStatus === 'string' ? er.settlementStatus.trim() : '';
        var observedCost = numericFact(er.cost), inputTokens = numericFact(er.tokensIn), outputTokens = numericFact(er.tokensOut), requestCount = numericFact(er.requestCount);
        var planEstimate = numericFact(er.planAllocationEstimate), cacheEstimate = numericFact(er.cacheAvoidedEstimate);
        var requiredIdentities = [er.id, er.usage_event_ref, er.usage_record_id, er.provider_attempt_ref, occurredAt, providerId, er.installation_id, er.account_id, er.connection_id, er.product_id, er.model_id, er.requested_route_id, er.effective_route_id, settlement];
        if (requiredIdentities.some(function (value) { return typeof value !== 'string' || !value.trim(); })) return null;
        if (er.scope !== 'work' && er.scope !== 'personal') return null;
        if (!Number.isFinite(new Date(occurredAt).getTime())) return null;
        if (![observedCost,inputTokens,outputTokens,requestCount,planEstimate,cacheEstimate].every(Number.isFinite)) return null;
        var normalizedSettlement = settlement.toLowerCase().trim();
        var finalSettlement = normalizedSettlement === 'settled' || normalizedSettlement === 'adjusted and settled';
        var settledCharge = finalSettlement && Number.isFinite(observedCost) ? observedCost : Number.isFinite(observedCost) && observedCost === 0 ? 0 : NaN;
        if (!Number.isFinite(settledCharge)) return null;
        return {
          attempt_id:String(er.id), usage_event_ref:er.usage_event_ref, usage_record_id:er.usage_record_id, provider_attempt_ref:er.provider_attempt_ref, occurred_at:occurredAt,
          provider_id:providerId, installation_id:er.installation_id,
          account_id:er.account_id, connection_id:er.connection_id,
          product_id:er.product_id, model_id:er.model_id,
          requested_route_id:er.requested_route_id, effective_route_id:er.effective_route_id,
          scope:er.scope,
          input_tokens:inputTokens, output_tokens:outputTokens, request_count:requestCount,
          charge:settledCharge, plan_allocation_estimate:planEstimate, cache_avoided_estimate:cacheEstimate,
          billing_basis:typeof er.billing_basis === 'string' && er.billing_basis ? er.billing_basis : provider ? provider.billing_basis : 'engine row; catalog enrichment unavailable',
          entitlement_class:typeof er.entitlement_class === 'string' && er.entitlement_class ? er.entitlement_class : provider ? provider.entitlement_class : 'engine row; catalog enrichment unavailable',
          settlement_status:settlement, settlement_authority:'engine UsageRecord',
          source_class:typeof er.source_class === 'string' && er.source_class ? er.source_class : 'provider_reported',
          source_confidence:typeof er.source_confidence === 'string' && er.source_confidence ? er.source_confidence : 'unknown',
          source_authority:typeof er.source_authority === 'string' && er.source_authority ? er.source_authority : 'engine UsageRecord',
          projection_freshness:typeof er.projection_freshness === 'string' && er.projection_freshness ? er.projection_freshness : 'current',
          projection_health:typeof er.projection_health === 'string' && er.projection_health ? er.projection_health : 'healthy',
          charge_authority:Number.isFinite(settledCharge) ? finalSettlement ? 'engine settled charge' : 'explicit zero; settlement not promoted' : 'not accepted without exact settlement and numeric cost',
          plan_allocation_authority:Number.isFinite(planEstimate) ? 'engine explicit estimate' : 'not exposed by engine',
          cache_avoided_authority:Number.isFinite(cacheEstimate) ? 'engine explicit estimate' : 'not exposed by engine',
          observed_unsettled_cost:Number.isFinite(observedCost) && !finalSettlement ? observedCost : null
        };
      }

      var seen = {};
      /* mark the engine's seed backlog as seen so we only append genuinely new rows */
      try {
        var s0 = pd.state && pd.state.usage && pd.state.usage.ledger;
        if (Array.isArray(s0)) s0.forEach(function (er) { if (er && er.id) seen[er.id] = true; });
      } catch (e0) {}

      var lastQuotaSig = '';
      sub('usage.tick', function (p) {
        try {
          if (!p || !U()) return;
          if (typeof p.cooldownSec === 'number') U().setCooldown(p.cooldownSec);
          if (Array.isArray(p.ledger)) {
            p.ledger.slice(-4).forEach(function (er) {
              if (!er || !er.id) { bridgeStats.rejected_attempt_count += 1; return; }
              if (seen[er.id]) return;
              var mapped = mapEngineRow(er);
              if (!mapped) { bridgeStats.rejected_attempt_count += 1; return; }
              seen[er.id] = true;
              if (!U().appendUsageAttempt(mapped)) bridgeStats.rejected_attempt_count += 1;
            });
          }
          /* The PM7 Usage workspace is fixture-record projected; PM_DEMO quota
             ticks do not mutate that projection. Preserve the latest compatibility
             signature for diagnostics, but never remount the board for ambient time. */
          if (Array.isArray(p.quotas)) {
            lastQuotaSig = p.quotas.map(function (q) { return q.id + ':' + Math.round(q.pct || 0); }).join('|');
            bridgeStats.last_quota_signature = lastQuotaSig;
          }
        } catch (e) { try { console.error('[pm6-js-usage] tick', e); } catch (e2) {} }
      });

      sub('usage.alert', function (p) {
        try {
          if (!U()) return;
          /* Compatibility alerts do not alter PM7's identity-bound fixture
             records. Record receipt state without replacing interactive DOM. */
          bridgeStats.last_alert_kind = p && p.kind ? String(p.kind) : 'unknown';
        } catch (e) { try { console.error('[pm6-js-usage] alert', e); } catch (e2) {} }
      });

      sub('page.changed', function (p) {
        try {
          if (p && p.page === 'usage' && U()) {
            if (U().pm7FlushCooldown) U().pm7FlushCooldown(); /* PM7 T08 */
            U().injectIcons();
          }
        } catch (e) {}
      });
    }

    /* icons may have loaded after part 18's inline script ran */
    try { u.injectIcons(); } catch (e1) { recordBridgeFailure('icons', 'injectIcons', e1); }
    bridgeState.initialized = bridgeStats.action_registration_count === 10 && bridgeStats.subscription_count === 3 && bridgeStats.failure_count === 0;
    bridgeStats.init_count = bridgeState.initialized ? 1 : 0;
    return bridgeState.initialized;
  }

  /* the engine block is assembled before this one, but stay defensive about order */
  if (!init()) {
    var tries = 0;
    var t = setInterval(function () {
      if (init() || ++tries > 20) clearInterval(t);
    }, 250);
  }
})();
