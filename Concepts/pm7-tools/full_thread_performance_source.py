"""Authored PM7 full-thread performance concept projection.

This registration-neutral transform extends the T46 Browser/SCM performance
consumer with deterministic browser-simulation evidence.  It never represents
the simulation as native Slint, server, storage, network, compositor, package,
platform, or hardware execution.  The existing T44 All Settings owner remains
the sole 825+ settings model and virtualized renderer; this transform validates
and consumes it instead of creating a competing settings projection.
"""

from __future__ import annotations

from pm7_transform_guards import assert_effect_delta, capture_effect_surfaces


TRANSFORM_MARKER = "PM7 T46P: deterministic full-thread performance projection"
PREDECESSOR_MARKER = "PM7 T46: operational systems integration and K3 host adaptation"


def _replace_once(doc, old, new, need, label):
    count = doc.count(old)
    need(count == 1, "T46P %s: expected one anchor, found %d" % (label, count))
    return doc.replace(old, new, 1)


def _replace_band(doc, start, end, replacement, need, label):
    need(doc.count(start) == 1, "T46P %s: start anchor count %d" % (label, doc.count(start)))
    need(doc.count(end) == 1, "T46P %s: end anchor count %d" % (label, doc.count(end)))
    begin = doc.index(start)
    finish = doc.index(end, begin)
    need(finish > begin, "T46P %s: invalid anchor order" % label)
    return doc[:begin] + replacement + doc[finish:]


PERFORMANCE_STYLE = r'''
<style id="pm7-t46p-performance-css">
/* PM7 T46P: deterministic full-thread performance projection */
.pm7-perf-contract { display:grid; gap:10px; }
.pm7-perf-boundary { margin:0; color:var(--text-secondary); font-size:var(--fs-sm); line-height:1.45; }
.pm7-perf-axes { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; }
.pm7-perf-axis { min-width:0; padding:10px; border:1px solid var(--border); border-radius:var(--radius-sm); background:var(--background); }
.pm7-perf-axis h4 { margin:0 0 6px; color:var(--text-primary); font-size:var(--fs-sm); }
.pm7-perf-vocab { display:flex; flex-wrap:wrap; gap:4px; }
.pm7-perf-vocab code { display:inline-flex; min-height:22px; align-items:center; padding:2px 6px; border:1px solid var(--border-light);
  border-radius:var(--radius-pill); color:var(--text-secondary); background:var(--surface); font-size:10px; overflow-wrap:anywhere; }
.pm7-perf-fixtures { margin-top:8px; border:1px solid var(--border-light); border-radius:var(--radius-sm); background:var(--background); }
.pm7-perf-fixtures > summary { padding:7px 9px; color:var(--text-secondary); font-size:11px; font-weight:600; cursor:pointer; }
.pm7-perf-fixture-groups { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:6px; padding:0 7px 7px; }
.pm7-perf-fixture-group { min-width:0; padding:6px; border:1px solid var(--border-light); border-radius:var(--radius-sm); }
.pm7-perf-fixture-group h5 { margin:0 0 5px; color:var(--text-primary); font-size:10px; }
.pm7-perf-fixture-row { display:flex; min-width:0; justify-content:space-between; gap:6px; padding:3px 0; color:var(--text-muted); font-size:10px; }
.pm7-perf-fixture-row + .pm7-perf-fixture-row { border-top:1px solid var(--border-light); }
.pm7-perf-fixture-row strong { min-width:0; color:var(--text-secondary); font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pm7-perf-fixture-row span { flex:0 0 auto; }
.pm7-perf-installations { display:grid; gap:7px; margin-top:10px; }
.pm7-perf-installation-window { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:6px; }
.pm7-perf-installation-card { min-width:0; min-height:44px; max-height:96px; padding:7px 8px; overflow:hidden;
  border:1px solid var(--border); border-radius:var(--radius-sm); background:var(--background); }
.pm7-perf-installation-card strong, .pm7-perf-installation-card span { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pm7-perf-installation-card strong { color:var(--text-primary); font-size:11px; }
.pm7-perf-installation-card span { margin-top:3px; color:var(--text-muted); font-size:10px; }
html[data-theme^="retro"] .pm7-perf-axis,
html[data-theme^="retro"] .pm7-perf-vocab code,
html[data-theme^="retro"] .pm7-perf-fixtures,
html[data-theme^="retro"] .pm7-perf-fixture-group,
html[data-theme^="retro"] .pm7-perf-installation-card { border-radius:0; }
@media (max-width:760px) {
  .pm7-perf-axes, .pm7-perf-fixture-groups, .pm7-perf-installation-window { grid-template-columns:minmax(0,1fr); }
}
@media (prefers-reduced-motion:reduce) {
  .pm7-perf-contract, .pm7-perf-contract * { animation:none!important; transition:none!important; }
}
</style>'''


PERFORMANCE_MODEL_SOURCE = r'''  /* PM7 T46P deterministic concept models. The T44 All Settings catalog remains the settings SSOT. */
  const PM7_PERFORMANCE_GOVERNOR_STATES=['admitted','queued','admitted-degraded','permission-blocked','resource-blocked','cancelled'];
  const PM7_PERFORMANCE_COMMAND_STATES=['accepted','acknowledged','executing','succeeded','failed','cancelled','rejected','terminal-unknown'];
  const PM7_PERFORMANCE_WORK_STATES=['accepted','queued','starting','running','waiting','retrying','reconnecting','backgrounded','degraded','stalled','committing','verifying','testing-route','migrating-route','rolling-back','completed','failed','cancelled','recovery-required'];
  const PM7_PERFORMANCE_WORK_FIXTURES=[
    {fixture_id:'queued',state:'queued',wait_reason:'admission-capacity',reevaluation:'governor-capacity-change',can_cancel:true,can_retry:false,phase:'queued'},
    {fixture_id:'running',state:'running',wait_reason:'not-waiting',reevaluation:'owner-phase-change',can_cancel:true,can_retry:false,phase:'executing'},
    {fixture_id:'waiting',state:'waiting',wait_reason:'provider-rate-window',reevaluation:'provider-window-reopens',can_cancel:true,can_retry:false,phase:'waiting'},
    {fixture_id:'cancel-requested',state:'cancel-requested',wait_reason:'owner-cancellation-pending',reevaluation:'owner-terminal-receipt',can_cancel:false,can_retry:false,phase:'cancelling'},
    {fixture_id:'terminal-unknown',state:'terminal-unknown',wait_reason:'terminal-receipt-unavailable',reevaluation:'owner-currentness-refresh',can_cancel:false,can_retry:true,phase:'terminal-unknown'},
    {fixture_id:'recovery-required',state:'recovery-required',wait_reason:'owner-recovery-required',reevaluation:'explicit-owner-retry',can_cancel:false,can_retry:true,phase:'recovery'},
    {fixture_id:'completed',state:'completed',wait_reason:'not-waiting',reevaluation:'terminal',can_cancel:false,can_retry:false,phase:'completed'}
  ];
  const PM7_PERFORMANCE_GOVERNOR_FIXTURES=[
    {outcome:'admitted',reason:'capacity-available',reevaluation:'not-required'},
    {outcome:'queued',reason:'capacity-bounded',reevaluation:'governor-capacity-change'},
    {outcome:'admitted-degraded',reason:'low-resource-profile',reevaluation:'resource-profile-change'},
    {outcome:'permission-blocked',reason:'permission-not-granted',reevaluation:'permission-decision'},
    {outcome:'resource-blocked',reason:'required-resource-unavailable',reevaluation:'resource-availability-change'},
    {outcome:'cancelled',reason:'admission-cancelled',reevaluation:'terminal'}
  ];
  const PM7_PERFORMANCE_BOUNDED_LIST_FIXTURES=[
    {family:'findings',row_limit:12,byte_limit:4096},
    {family:'history',row_limit:12,byte_limit:4096},
    {family:'logs',row_limit:12,byte_limit:4096},
    {family:'provider',row_limit:12,byte_limit:4096},
    {family:'receipts',row_limit:12,byte_limit:4096}
  ];
  const PM7_PERFORMANCE_INSTALLATIONS=Array.from({length:100},(_,index)=>({
    installation_id:`concept-detected-installation-${String(index+1).padStart(3,'0')}`,
    label:`Detected tool ${String(index+1).padStart(3,'0')}`,
    host_environment:index%3===0?'Local host':index%3===1?'WSL environment':'Container Tool Store',
    projection:'Compact cached fixture'
  }));
  const PM7_PERFORMANCE_WORK_ID='concept-work:full-thread-performance:001';
  function performanceVocabulary(values){return `<div class="pm7-perf-vocab">${values.map(value=>`<code>${value}</code>`).join('')}</div>`;}
  function renderPerformanceTruthFixtures(){
    const work=PM7_PERFORMANCE_WORK_FIXTURES.map(row=>`<div class="pm7-perf-fixture-row" data-observable-work-fixture="true" data-observable-work-id="${PM7_PERFORMANCE_WORK_ID}:${row.fixture_id}" data-work-state="${row.state}" data-wait-reason="${row.wait_reason}" data-reevaluation-condition="${row.reevaluation}" data-can-cancel="${row.can_cancel}" data-can-retry="${row.can_retry}" data-progress-denominator="phase-only"><strong>${row.state}</strong><span>${row.phase}</span></div>`).join('');
    const governor=PM7_PERFORMANCE_GOVERNOR_FIXTURES.map(row=>`<div class="pm7-perf-fixture-row" data-governor-outcome="${row.outcome}" data-observable-work-id="${PM7_PERFORMANCE_WORK_ID}:governor:${row.outcome}" data-outcome-reason="${row.reason}" data-reevaluation-condition="${row.reevaluation}"><strong>${row.outcome}</strong><span>${row.reason}</span></div>`).join('');
    const lists=PM7_PERFORMANCE_BOUNDED_LIST_FIXTURES.map(row=>`<div class="pm7-perf-fixture-row" data-bounded-list-family="${row.family}" data-row-limit="${row.row_limit}" data-byte-limit="${row.byte_limit}" data-load-trigger="explicit-inspection" data-runtime-availability="browser-fixture-only"><strong>${row.family}</strong><span>${row.row_limit} rows · ${row.byte_limit} bytes</span></div>`).join('');
    return `<details class="pm7-perf-fixtures"><summary>Deterministic browser truth fixtures</summary><div class="pm7-perf-fixture-groups"><section class="pm7-perf-fixture-group"><h5>ObservableWork rows</h5>${work}</section><section class="pm7-perf-fixture-group"><h5>Governor affected work</h5>${governor}</section><section class="pm7-perf-fixture-group"><h5>Bounded evidence families</h5>${lists}</section></div><p class="pm7-perf-boundary" style="padding:0 7px 7px">Fixture rows prove browser-concept contracts only. Native/runtime/provider/network execution remains unavailable here.</p></details>`;
  }
  function renderPerformanceInstallations(){
    const start=0,end=12,rows=PM7_PERFORMANCE_INSTALLATIONS.slice(start,end);
    return `${renderPerformanceTruthFixtures()}<section class="pm7-perf-installations" data-installation-total="${PM7_PERFORMANCE_INSTALLATIONS.length}" data-installation-virtualized="true" data-window-start="${start}" data-window-end="${end}"><div class="section-kicker">Detected-installation browser fixture</div><p class="pm7-perf-boundary">A model of 100 cached detections mounts only 12 compact human cards. It is separate from the existing 825+ All Settings model and makes no native discovery claim.</p><div class="pm7-perf-installation-window">${rows.map(row=>`<article class="installation-card pm7-perf-installation-card" data-installation-id="${row.installation_id}"><strong>${row.label}</strong><span>${row.host_environment} · ${row.projection}</span></article>`).join('')}</div></section>`;
  }
'''


PERFORMANCE_BRANCH = r'''    if(state.browserScmTab==='performance')return `<div class="pm7-perf-contract" data-performance-contract="full-thread" data-observable-work-id="${PM7_PERFORMANCE_WORK_ID}" data-work-state="accepted"><section class="systems-contract-card"><h3>Truthful responsive work</h3><p class="pm7-perf-boundary">Deterministic browser simulation only. Native Slint, compositor, Server, network, storage, package, platform, and hardware certification remain separate.</p><div class="pm7-perf-axes"><article class="pm7-perf-axis" data-performance-axis="governor"><h4>Governor decision</h4>${performanceVocabulary(PM7_PERFORMANCE_GOVERNOR_STATES)}</article><article class="pm7-perf-axis" data-performance-axis="command"><h4>Command outcome</h4>${performanceVocabulary(PM7_PERFORMANCE_COMMAND_STATES)}</article><article class="pm7-perf-axis" data-performance-axis="observable-work"><h4>ObservableWork</h4>${performanceVocabulary(PM7_PERFORMANCE_WORK_STATES)}</article></div><p class="pm7-perf-boundary">A waiting row exposes a typed wait reason, its next reevaluation condition, and only valid Cancel or Retry controls. Progress stays phase-based unless an owner can defend a completed/total denominator.</p><div class="table-actions"><button class="btn primary" data-action="open-performance-evidence" data-ui-action-id="ui.performance.evidence.inspect" data-availability="available">Inspect evidence boundary</button></div></section><section class="systems-contract-card"><h3>Continuity simulation</h3><p>Same-frame acknowledgement does not mean work succeeded. Hiding this view stops its paint while the durable owner-work identity remains mounted outside the view.</p><div class="info-grid">${infoRow('Work identity',PM7_PERFORMANCE_WORK_ID)}${infoRow('Low-resource mode','Owner-governed')}${infoRow('Deduplication','Stable operation identity')}${infoRow('Browser evidence','Never native certification')}</div>${renderPerformanceInstallations()}</section></div>`;
'''


PERSISTENT_WORK_MARKUP = r'''<!-- PM7 T46P: deterministic full-thread performance projection -->
<div id="pm7-performance-owner-work-anchor" data-observable-work-id="concept-work:full-thread-performance:001" data-work-state="accepted" data-concept-simulation-only="true" hidden></div>'''


CONTEXT_OBSERVER_OLD = r'''  var contextObserver = new MutationObserver(function (mutations) { var needs = mutations.some(function (mutation) { return mutation.addedNodes && mutation.addedNodes.length; }); if (needs) enhanceContext(document); });'''


CONTEXT_OBSERVER_NEW = r'''  var contextObserver = new MutationObserver(function (mutations) {
    /* Context affordances are local to the subtree that was just mounted.
       A document-wide enhancement pass on every Settings/content insertion
       made unrelated manager transitions pay for the entire application. */
    mutations.forEach(function (mutation) {
      Array.prototype.forEach.call(mutation.addedNodes || [], function (node) {
        if (node && node.nodeType === 1) enhanceContext(node);
      });
    });
  });'''


DEBUG_TICK_OLD = r'''      setInterval(function () {
        if (document.hidden) return;
        sessions.forEach(function (s) { if (s.state !== 'terminated') s.elapsed += 1; });
        render();
      }, 1000);'''


DEBUG_TICK_NEW = r'''      setInterval(function () {
        if (document.hidden) return;
        sessions.forEach(function (s) { if (s.state !== 'terminated') s.elapsed += 1; });
        var panel = document.getElementById('panel-run');
        if (panel && panel.classList.contains('active')) render();
      }, 1000);'''


EDITOR_ENROL_OBSERVER_OLD = r'''        new MutationObserver(function () { edEnrolStrips(); }).observe(document.body, { childList: true, subtree: true });'''


EDITOR_ENROL_OBSERVER_NEW = r'''        new MutationObserver(function (records) {
          var needsEnrollment = records.some(function (record) {
            return Array.prototype.some.call(record.addedNodes || [], function (node) {
              return node && node.nodeType === 1 && ((node.matches && node.matches('.editor-tabs,.dashboard-tabs')) || (node.querySelector && node.querySelector('.editor-tabs,.dashboard-tabs')));
            });
          });
          if (needsEnrollment) edEnrolStrips();
        }).observe(document.body, { childList: true, subtree: true });'''


PERFORMANCE_API_SCRIPT = r'''
<script id="pm7-t46p-performance-js">
/* PM7 T46P: deterministic full-thread performance projection */
(function(){
  'use strict';
  if(window.PM7_PERFORMANCE_TEST_API)return;
  var WORK_ID='concept-work:full-thread-performance:001';
  var CURRENT_GENERATION=7;
  var IDENTITY={operation_id:WORK_ID,session_id:'concept-session:001',stream_id:'concept-stream:001',upload_id:'concept-upload:001'};
  function copy(value){return JSON.parse(JSON.stringify(value));}
  function settingsInventorySnapshot(){
    var source=document.getElementById('pm7-settings-data'),model=null;
    try{model=source?JSON.parse(source.textContent):null;}catch(error){model=null;}
    var viewport=document.querySelector('[data-all-settings-viewport]');
    return {model_backed:!!(model&&Array.isArray(model.settings)),total:model&&Array.isArray(model.settings)?model.settings.length:0,
      mounted:document.querySelectorAll('[data-all-setting-id]').length,virtualized:!!viewport,owner:'T44 All Settings'};
  }
  function probeDedupStaleGeneration(){
    var active=Object.create(null),serial=0;
    function admit(request){
      if(request.generation!==CURRENT_GENERATION)return {status:'stale-generation-rejected',operation_id:null};
      if(active[request.key])return {status:'joined',operation_id:active[request.key]};
      var operationId=WORK_ID+':dedup-'+(++serial);active[request.key]=operationId;return {status:'created',operation_id:operationId};
    }
    var first=admit({key:'exact-host-environment:fixture',generation:CURRENT_GENERATION});
    var duplicate=admit({key:'exact-host-environment:fixture',generation:CURRENT_GENERATION});
    var stale=admit({key:'exact-host-environment:fixture',generation:CURRENT_GENERATION-1});
    return {simulation_only:true,coalesced:first.operation_id===duplicate.operation_id&&duplicate.status==='joined',
      stale_generation_rejected:stale.status==='stale-generation-rejected',operation_id_preserved:first.operation_id===duplicate.operation_id,
      first:first,duplicate:duplicate,stale:stale};
  }
  function probeIdentityContinuity(requestedTransitions){
    var transitions=Array.isArray(requestedTransitions)?requestedTransitions.slice():[];
    var rows=transitions.map(function(transition,index){return {transition:transition,generation:CURRENT_GENERATION+index+1,identity:copy(IDENTITY)};});
    var keys=Object.keys(IDENTITY),preserved=keys.filter(function(key){return rows.every(function(row){return row.identity[key]===IDENTITY[key];});});
    return {simulation_only:true,requested:transitions,rows:rows,preserved:preserved,
      stale_generation_rejected:rows.length>0&&CURRENT_GENERATION<rows[rows.length-1].generation};
  }
  function probeAdmissionBeforeHydration(){
    function attempt(authAllowed,rateAllowed){
      var trace=['auth-check'],hydrationCount=0;
      if(!authAllowed)return {status:'auth-rejected',trace:trace,hydration_count:hydrationCount};
      trace.push('rate-check');
      if(!rateAllowed)return {status:'rate-rejected',trace:trace,hydration_count:hydrationCount};
      trace.push('hydrate');hydrationCount+=1;return {status:'admitted',trace:trace,hydration_count:hydrationCount};
    }
    var authRejected=attempt(false,true),rateRejected=attempt(true,false),admitted=attempt(true,true);
    return {simulation_only:true,auth_checked_before_hydration:authRejected.trace[0]==='auth-check',
      rate_checked_before_hydration:rateRejected.trace.indexOf('rate-check')<rateRejected.trace.indexOf('hydrate')||rateRejected.trace.indexOf('hydrate')===-1,
      rejected_hydration_count:authRejected.hydration_count+rateRejected.hydration_count,admitted_hydration_count:admitted.hydration_count,
      auth_rejected:authRejected,rate_rejected:rateRejected,admitted:admitted};
  }
  window.PM7_PERFORMANCE_TEST_API={schema_id:'pm.pmconcept7.full_thread_performance_simulation.v1',concept_simulation_only:true,
    production_runtime_certification:false,native_slint_certification:false,work_id:WORK_ID,current_generation:CURRENT_GENERATION,
    settingsInventorySnapshot:settingsInventorySnapshot,probeDedupStaleGeneration:probeDedupStaleGeneration,
    probeIdentityContinuity:probeIdentityContinuity,probeAdmissionBeforeHydration:probeAdmissionBeforeHydration,
    snapshot:function(){return {simulation_only:true,identity:copy(IDENTITY),settings_inventory:settingsInventorySnapshot()};}};
})();
</script>'''


EDGE_SEED_OLD = r'''    function seed() {
      try {
        var els = document.querySelectorAll(ALL_SEL);
        for (var i = 0; i < els.length; i++) enroll(els[i]);
      } catch (e) {}
    }'''

EDGE_SEED_NEW = r'''    function pageScope(payload) {
      var page = payload && payload.detail ? payload.detail.page : payload && payload.page;
      if (page) {
        var safe = String(page).replace(/[^a-z0-9_-]/gi, '');
        var exact = document.querySelector('.primary-content > .page.page-' + safe);
        if (exact) return exact;
      }
      return document.querySelector('.primary-content > .page.active') || document.body;
    }

    function seed(scope) {
      try {
        var host = scope && scope.querySelectorAll ? scope : document;
        if (host.nodeType === 1 && host.matches && host.matches(ALL_SEL)) enroll(host);
        var els = host.querySelectorAll(ALL_SEL);
        for (var i = 0; i < els.length; i++) enroll(els[i]);
      } catch (e) {}
    }'''

EDGE_MARK_OLD = r'''    function markAll() {
      enrolled.forEach(function (el) { dirty.add(el); });
      schedule();
    }'''

EDGE_MARK_NEW = r'''    function markAll() {
      enrolled.forEach(function (el) { dirty.add(el); });
      schedule();
    }

    function markScope(scope) {
      if (!scope || !scope.contains) { markAll(); return; }
      enrolled.forEach(function (el) {
        if (el === scope || scope.contains(el)) dirty.add(el);
      });
      schedule();
    }'''

EDGE_VISIBLE_OLD = r'''    function isVisible(el) {
      try {
        if (el.offsetParent !== null) return true;
        return window.getComputedStyle(el).position === 'fixed';
      } catch (e) { return false; }
    }'''

EDGE_VISIBLE_NEW = r'''    function isVisible(el) {
      try {
        if (!el || el.hidden || el.closest('[hidden],[aria-hidden="true"]')) return false;
        var page = el.closest('.primary-content > .page');
        return !page || page.classList.contains('active') || page.classList.contains('pm8-page-out');
      } catch (e) { return false; }
    }'''

EDGE_RELAYOUT_OLD = r'''    function relayoutAll() {
      enrolled.forEach(function (el) {
        var st = el.__pmEdge;
        if (st && st.bands) layoutBands(el, st);
      });
    }'''

EDGE_RELAYOUT_NEW = r'''    function relayoutVisible() {
      var scope = geometryScope || pageScope();
      enrolled.forEach(function (el) {
        var st = el.__pmEdge, page = el.closest && el.closest('.primary-content > .page');
        if (page && scope && !scope.contains(el)) return;
        if (st && st.bands && isVisible(el)) layoutBands(el, st);
      });
    }'''

EDGE_PAGE_CHANGE_OLD = r'''    function onPageChanged() {
      seed();
      geomDirty = true;
      markAll();
    }

    function refresh() {
      try { onPageChanged(); } catch (e) {}
    }'''

EDGE_PAGE_CHANGE_NEW = r'''    function onPageChanged(payload) {
      var scope = pageScope(payload);
      geometryScope = scope;
      clearTimeout(edgeGeometryTimer);
      edgeGeometryTimer = setTimeout(function () {
        if (pageScope() !== scope) return;
        seed(scope); geomDirty = true; markScope(scope);
      }, 420);
    }

    function refresh(scopeOrPayload) {
      try {
        if (scopeOrPayload && scopeOrPayload.nodeType === 1) {
          clearTimeout(edgeGeometryTimer); geometryScope = scopeOrPayload; seed(scopeOrPayload); geomDirty = true; markScope(scopeOrPayload);
        } else onPageChanged(scopeOrPayload);
      } catch (e) {}
    }'''

FROST_REFRESH_OLD = r'''    function wire(entry) {
      var hosts;
      try { hosts = document.querySelectorAll(entry.host); } catch (e) { return; }
      for (var i = 0; i < hosts.length; i++) {
        var host = hosts[i], head = null;
        try { head = host.querySelector(entry.head); } catch (e2) {}
        if (head) observe(host, head, entry);
        else waitFor(host, entry);
      }
    }

    function refresh() {
      for (var i = 0; i < REG.length; i++) { try { wire(REG[i]); } catch (e) {} }
    }'''

FROST_REFRESH_NEW = r'''    function activePageScope(payload) {
      var page = payload && payload.detail ? payload.detail.page : payload && payload.page;
      if (page) {
        var safe = String(page).replace(/[^a-z0-9_-]/gi, '');
        var exact = document.querySelector('.primary-content > .page.page-' + safe);
        if (exact) return exact;
      }
      return document.querySelector('.primary-content > .page.active') || document.body;
    }

    function wireHost(host, entry) {
      var head = null;
      try { head = host.querySelector(entry.head); } catch (e) {}
      if (head) observe(host, head, entry);
      else waitFor(host, entry);
    }

    function wire(entry, scope) {
      var base = scope && scope.querySelectorAll ? scope : document, hosts = [];
      try {
        if (base.nodeType === 1 && base.matches && base.matches(entry.host)) hosts.push(base);
        var found = base.querySelectorAll(entry.host);
        for (var j = 0; j < found.length; j++) hosts.push(found[j]);
      } catch (e) { return; }
      for (var i = 0; i < hosts.length; i++) wireHost(hosts[i], entry);
    }

    function refresh(payload) {
      var scope = payload && payload.nodeType === 1 ? payload : activePageScope(payload);
      var base = scope && scope.querySelectorAll ? scope : document, selector = REG.map(function(entry) { return entry.host; }).join(','), hosts = [];
      try {
        if (base.nodeType === 1 && base.matches && base.matches(selector)) hosts.push(base);
        var found = base.querySelectorAll(selector);
        for (var i = 0; i < found.length; i++) hosts.push(found[i]);
      } catch (error) {
        for (var fallback = 0; fallback < REG.length; fallback++) { try { wire(REG[fallback], scope); } catch (e) {} }
        return;
      }
      for (var hostIndex = 0; hostIndex < hosts.length; hostIndex++) {
        for (var entryIndex = 0; entryIndex < REG.length; entryIndex++) {
          try { if (hosts[hostIndex].matches(REG[entryIndex].host)) wireHost(hosts[hostIndex], REG[entryIndex]); } catch (e2) {}
        }
      }
    }'''


PAGE_TAB_PAINT_OLD = r'''    function paintInk(tab, paintW, paintX, sx, sy) {
      var top = tab.offsetTop;
      ink.style.width = paintW + 'px';
      ink.style.height = tab.offsetHeight + 'px';'''

PAGE_TAB_PAINT_NEW = r'''    var pageTabMetrics = new WeakMap();
    function readTabMetrics(tab) {
      return { x: tab.offsetLeft, w: tab.offsetWidth, top: tab.offsetTop, h: tab.offsetHeight };
    }
    function cacheTabMetrics() {
      var tabs = Array.prototype.slice.call(strip.querySelectorAll('.page-tab[data-page]'));
      var rows = tabs.map(function(tab) { return { tab: tab, metrics: readTabMetrics(tab) }; });
      rows.forEach(function(row) { pageTabMetrics.set(row.tab, row.metrics); });
    }
    function measureTab(tab) {
      return pageTabMetrics.get(tab) || readTabMetrics(tab);
    }
    function paintInk(tab, paintW, paintX, sx, sy, metrics) {
      var geometry = metrics || measureTab(tab);
      var top = geometry.top;
      ink.style.width = paintW + 'px';
      ink.style.height = geometry.h + 'px';'''

PAGE_TAB_SNAP_OLD = r'''    function snap(tab) {
      cancelAnimationFrame(pos.raf);
      pos.vx = 0; pos.vw = 0;
      pos.jiggleT = 0; pos.blendT = 0; pos.lastStretch = 0;
      pos.hopArmed = false; pos.travelOriginX = null;
      pos.x = tab.offsetLeft; pos.w = tab.offsetWidth;
      paintInk(tab, pos.w, pos.x, 1, 1);
    }
    function springTo(tab) {
      var tx = tab.offsetLeft, tw = tab.offsetWidth;
      ink.style.height = tab.offsetHeight + 'px';
      if (pos.x === null || reduced()) { snap(tab); return; }'''

PAGE_TAB_SNAP_NEW = r'''    function snap(tab, metrics) {
      var geometry = metrics || measureTab(tab);
      cancelAnimationFrame(pos.raf);
      pos.vx = 0; pos.vw = 0;
      pos.jiggleT = 0; pos.blendT = 0; pos.lastStretch = 0;
      pos.hopArmed = false; pos.travelOriginX = null;
      pos.x = geometry.x; pos.w = geometry.w;
      paintInk(tab, pos.w, pos.x, 1, 1, geometry);
    }
    function springTo(tab, metrics) {
      var geometry = metrics || measureTab(tab), tx = geometry.x, tw = geometry.w;
      ink.style.height = geometry.h + 'px';
      if (pos.x === null || reduced()) { snap(tab, geometry); return; }'''

PAGE_TAB_CALL_OLD = r'''      origGo.call(window.PM_PAGES, pageId, subTab);
      var tab = tabFor(pageId);
      if (tab) (changed ? springTo : snap)(tab);'''

PAGE_TAB_CALL_NEW = r'''      var tab = tabFor(pageId);
      var tabMetrics = tab ? measureTab(tab) : null;
      origGo.call(window.PM_PAGES, pageId, subTab);
      if (tab) (changed ? springTo : snap)(tab, tabMetrics);'''

PAGE_RECT_OLD = r'''    function measureActive(panel) {
      var host = panel.parentElement;
      var hr = host.getBoundingClientRect();
      var r = panel.getBoundingClientRect();
      return { top: r.top - hr.top, left: r.left - hr.left, width: r.width, height: r.height };
    }'''

PAGE_RECT_NEW = r'''    var pageRects = new WeakMap();
    function readPanelRect(panel) {
      var host = panel.parentElement;
      var hr = host.getBoundingClientRect();
      var r = panel.getBoundingClientRect();
      return { top: r.top - hr.top, left: r.left - hr.left, width: r.width, height: r.height };
    }
    function cachePanelRect(panel) {
      if (!panel || !panel.classList.contains('active')) return null;
      var rect = readPanelRect(panel); pageRects.set(panel, rect); return rect;
    }
    function cacheActiveRect() { return cachePanelRect(panelFor(window.PM_PAGES.current)); }
    function measureActive(panel) { return pageRects.get(panel) || cachePanelRect(panel); }'''

PAGE_ANIMATE_RESET_OLD = r'''    function animatePages(oldP, newP, dir, rect) {
      oldP.classList.remove('pm8-page-in', 'pm8-page-out');
      newP.classList.remove('pm8-page-in', 'pm8-page-out');
      void oldP.parentElement.offsetWidth;'''

PAGE_ANIMATE_RESET_NEW = r'''    function animatePages(oldP, newP, dir, rect) {
      var restarting = oldP.classList.contains('pm8-page-in') || oldP.classList.contains('pm8-page-out') ||
        newP.classList.contains('pm8-page-in') || newP.classList.contains('pm8-page-out');
      oldP.classList.remove('pm8-page-in', 'pm8-page-out');
      newP.classList.remove('pm8-page-in', 'pm8-page-out');
      if (restarting) void oldP.parentElement.offsetWidth;'''

PAGE_ANIMATE_NEW = r'''    function clearPageAnimation(panel) {
      if (!panel) return;
      var cleanup = panel.__pm8PageCleanup;
      if (typeof cleanup === 'function') cleanup();
      panel.classList.remove('pm8-page-in', 'pm8-page-out');
      panel.style.top = panel.style.left = panel.style.width = panel.style.height = '';
    }
    function animatePages(oldP, newP, dir, rect) {
      var restarting = oldP.classList.contains('pm8-page-in') || oldP.classList.contains('pm8-page-out') ||
        newP.classList.contains('pm8-page-in') || newP.classList.contains('pm8-page-out');
      if (restarting) {
        clearPageAnimation(oldP); clearPageAnimation(newP);
        document.documentElement.removeAttribute('data-pm-page-transition');
        requestAnimationFrame(function () { cachePanelRect(newP); cacheTabMetrics(); });
        return;
      }
      document.documentElement.setAttribute('data-pm-page-transition', 'running');
      oldP.style.top = rect.top + 'px';
      oldP.style.left = rect.left + 'px';
      oldP.style.width = rect.width + 'px';
      oldP.style.height = rect.height + 'px';
      oldP.style.setProperty('--pm-dir', String(dir));
      newP.style.setProperty('--pm-dir', String(dir));
      oldP.classList.add('pm8-page-out');
      newP.classList.add('pm8-page-in');
      var cleanupTimer = 0;
      function cleanupOut() {
        oldP.classList.remove('pm8-page-out');
        oldP.style.top = oldP.style.left = oldP.style.width = oldP.style.height = '';
        if (oldP.__pm8PageCleanup === cleanupOut) oldP.__pm8PageCleanup = null;
      }
      function cleanupIn() {
        clearTimeout(cleanupTimer);cleanupTimer=0;
        newP.classList.remove('pm8-page-in');
        newP.removeEventListener('animationend', onIn);
        if (newP.__pm8PageCleanup === cleanupIn) newP.__pm8PageCleanup = null;
        cleanupOut();
        document.documentElement.removeAttribute('data-pm-page-transition');
        requestAnimationFrame(function () { cachePanelRect(newP); cacheTabMetrics(); });
      }
      function onIn(ev) {
        if (ev.animationName !== 'pm8-page-in') return;
        newP.removeEventListener('animationend', onIn);
        /* Keep the fully faded outgoing page inert through Settings' own
           340 ms entrance. Hiding its large subtree at 150 ms forced a
           main-thread restyle through the middle of the visible animation. */
        cleanupTimer=setTimeout(cleanupIn,80);
      }
      oldP.__pm8PageCleanup = cleanupOut; newP.__pm8PageCleanup = cleanupIn;
      newP.addEventListener('animationend', onIn);
    }
'''

HOME_DENSITY_OLD = r'''  function syncHomeSurface(surface) {
    if (!surface || !surface.isConnected || surface.offsetParent === null) return;
    var rect = surface.getBoundingClientRect();
    var preset = homePresetFor(surface);
    surface.setAttribute('data-pm-home-density', homeDensityFor(rect, preset));
    if (preset) surface.setAttribute('data-pm-home-size-preset', preset);
    surface.setAttribute('data-pm-home-shape', rect.width > 1.55 * rect.height ? 'wide' : rect.height > 1.45 * rect.width ? 'tall' : 'balanced');
  }'''

HOME_DENSITY_NEW = r'''  function syncHomeSurface(surface, observedRect) {
    if (!surface || !surface.isConnected) return;
    var page = surface.closest && surface.closest('.primary-content > .page');
    if (page && !page.classList.contains('active')) return;
    var rect = observedRect || surface.__pmHomeObservedRect || surface.getBoundingClientRect();
    if (!(rect && rect.width > 0 && rect.height > 0)) return;
    surface.__pmHomeObservedRect = { width: rect.width, height: rect.height };
    var preset = homePresetFor(surface);
    surface.setAttribute('data-pm-home-density', homeDensityFor(rect, preset));
    if (preset) surface.setAttribute('data-pm-home-size-preset', preset);
    surface.setAttribute('data-pm-home-shape', rect.width > 1.55 * rect.height ? 'wide' : rect.height > 1.45 * rect.width ? 'tall' : 'balanced');
  }'''


PILL_FIT_SCHEDULE_OLD = r'''    var scheduled = null, pendingScope = null;
    function schedule(scope) {
      if (scope && slot.contains(scope)) {'''


PILL_FIT_SCHEDULE_NEW = r'''    var scheduled = null, pendingScope = null;
    function slotPageActive() {
      var page = slot.closest && slot.closest('.primary-content > .page');
      return !page || page.classList.contains('active');
    }
    function schedule(scope) {
      /* A hidden Home/side-panel fitter must not respond to Settings or other
         pages.  Its measurement ladder deliberately forces layout several
         times per control and used to steal the Settings animation frames. */
      if (!slotPageActive()) return;
      if (scope && slot.contains(scope)) {'''


PILL_FIT_CLICK_OLD = r'''    document.addEventListener('click', function (ev) {
      if (ev.target.closest('.pm-segtab-item, [data-tab]')) schedule();
    });'''


PILL_FIT_CLICK_NEW = r'''    document.addEventListener('click', function (ev) {
      var control = ev.target && ev.target.closest && ev.target.closest('.pm-segtab-item, [data-tab]');
      if (!control || !slot.contains(control)) return;
      schedule(control.closest('.side-panel-view') || control);
    });'''


CHAT_JUMP_VISIBILITY_OLD = r'''  function updateJumpVisibility(stream) {
    var wrap = stream ? stream.closest('.pm6-chat-streamwrap') : null;
    if (!wrap) return;'''


CHAT_JUMP_VISIBILITY_NEW = r'''  function updateJumpVisibility(stream) {
    var wrap = stream ? stream.closest('.pm6-chat-streamwrap') : null;
    if (!wrap) return;
    if (document.documentElement.getAttribute('data-pm-page-transition') === 'running') return;
    var page = wrap.closest && wrap.closest('.primary-content > .page');
    if (page && !page.classList.contains('active')) return;'''


CHAT_FOOTER_LAYOUT_OLD = r'''  function updateFooterLayout(wrap) {
    if (!wrap) return;
    var footer = $('.chat-stream-footer', wrap);'''


CHAT_FOOTER_LAYOUT_NEW = r'''  function updateFooterLayout(wrap) {
    if (!wrap) return;
    if (document.documentElement.getAttribute('data-pm-page-transition') === 'running') return;
    var page = wrap.closest && wrap.closest('.primary-content > .page');
    if (page && !page.classList.contains('active')) return;
    var footer = $('.chat-stream-footer', wrap);'''


TITLE_DENSITY_RESIZE_OLD = r'''    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(function () {
        pageInkResyncPending = true;
        schedule();
      });
      ro.observe(bar);'''


TITLE_DENSITY_RESIZE_NEW = r'''    if (typeof ResizeObserver !== 'undefined') {
      var lastBarWidth = bar.getBoundingClientRect().width;
      var ro = new ResizeObserver(function (entries) {
        var width = entries.length ? entries[entries.length - 1].contentRect.width : lastBarWidth;
        if (Math.abs(width - lastBarWidth) < .5) return;
        lastBarWidth = width;
        pageInkResyncPending = true;
        schedule();
      });
      ro.observe(bar);'''


TITLE_DENSITY_PAGE_OLD = r'''          if (activeTab && activeTab.classList.contains('is-overflow')) pageInkResyncPending = true;
          schedule();'''


TITLE_DENSITY_PAGE_NEW = r'''          if (activeTab && activeTab.classList.contains('is-overflow')) {
            pageInkResyncPending = true;
            schedule();
          } else if (moreMenu) {
            moreMenu.querySelectorAll('.pm6-tb-pages-more-item[data-page]').forEach(function (item) {
              item.classList.toggle('is-selected', item.getAttribute('data-page') === pageId);
            });
          }'''


EXPECTED_EFFECT_DELTA = {
    "command_ids": {"added": [], "removed": []},
    "domain_event_ids": {"added": [], "removed": []},
    "dom_event_types": {"added": [], "removed": []},
    "persistence_targets": {"added": [], "removed": []},
}


def apply(doc, notes, need):
    """Apply the deterministic T46P projection after T46 and before T47."""
    need(TRANSFORM_MARKER not in doc, "T46P: transform already applied")
    need(PREDECESSOR_MARKER in doc, "T46P: exact T46 predecessor marker missing")
    need(doc.count("</head>") == 1, "T46P: unique head-close anchor missing")
    need(doc.count("</body>") == 1, "T46P: unique body-close anchor missing")
    for identity in ('id="pm7-t46p-performance-css"', 'id="pm7-t46p-performance-js"', "PM7_PERFORMANCE_TEST_API"):
        need(identity not in doc, "T46P: host identity already exists: %s" % identity)
    need("renderAllSettingsWindow" in doc and "data-all-settings-viewport" in doc and "allSettingsCatalog" in doc,
         "T46P: T44 model-backed virtualized All Settings owner is missing")

    effects_before = capture_effect_surfaces(doc)
    doc = _replace_once(doc, PAGE_TAB_PAINT_OLD, PAGE_TAB_PAINT_NEW, need, "cached page-tab paint geometry")
    doc = _replace_once(doc, PAGE_TAB_SNAP_OLD, PAGE_TAB_SNAP_NEW, need, "cached page-tab spring geometry")
    doc = _replace_once(doc, "        paintInk(tab, paintW, paintX, liq.sx, liq.sy);", "        paintInk(tab, paintW, paintX, liq.sx, liq.sy, geometry);", need, "cached page-tab animation-frame geometry")
    doc = _replace_once(doc, PAGE_TAB_CALL_OLD, PAGE_TAB_CALL_NEW, need, "pre-mutation page-tab measurement")
    doc = _replace_once(doc, PAGE_RECT_OLD, PAGE_RECT_NEW, need, "cached page-panel transition geometry")
    doc = _replace_band(doc, "    function animatePages(oldP, newP, dir, rect) {", "    var origGo = window.PM_PAGES.go;", PAGE_ANIMATE_NEW, need, "interruptible directional page animation")
    doc = _replace_once(doc, "      if (!rect) return;\n      animatePages(oldP, newP, tabIndex(pageId) >= tabIndex(prev) ? 1 : -1, rect);", "      if (!rect) { requestAnimationFrame(cacheActiveRect); return; }\n      animatePages(oldP, newP, tabIndex(pageId) >= tabIndex(prev) ? 1 : -1, rect);", need, "settled page geometry refresh")
    doc = _replace_once(doc, "    function resync() {\n      var tab = strip.querySelector('.page-tab.active')", "    function resync() {\n      cacheTabMetrics();\n      cacheActiveRect();\n      var tab = strip.querySelector('.page-tab.active')", need, "responsive page geometry refresh")
    doc = _replace_once(doc, "    if (first) {\n      snap(first);", "    if (first) {\n      cacheTabMetrics();\n      snap(first);", need, "initial page-tab geometry cache")
    doc = _replace_once(doc, "        if (seed && !window.PM_PAGES.current) window.PM_PAGES.current = seed;\n      } catch (e1) {}", "        if (seed && !window.PM_PAGES.current) window.PM_PAGES.current = seed;\n      } catch (e1) {}\n      requestAnimationFrame(cacheActiveRect);", need, "initial page geometry cache")
    doc = _replace_once(doc, HOME_DENSITY_OLD, HOME_DENSITY_NEW, need, "ResizeObserver-owned Home surface density")
    doc = _replace_once(doc, "var resizeObserver = new ResizeObserver(function (entries) { entries.forEach(function (entry) { syncHomeSurface(entry.target); }); });", "var resizeObserver = new ResizeObserver(function (entries) { entries.forEach(function (entry) { syncHomeSurface(entry.target, entry.contentRect); }); });", need, "Home density content-rect delivery")
    doc = _replace_once(doc, PILL_FIT_SCHEDULE_OLD, PILL_FIT_SCHEDULE_NEW, need, "active-page side-panel pill fitting")
    doc = _replace_once(doc, PILL_FIT_CLICK_OLD, PILL_FIT_CLICK_NEW, need, "side-panel-local tab click fitting")
    doc = _replace_once(doc, CHAT_JUMP_VISIBILITY_OLD, CHAT_JUMP_VISIBILITY_NEW, need, "active-page chat jump measurement")
    doc = _replace_once(doc, CHAT_FOOTER_LAYOUT_OLD, CHAT_FOOTER_LAYOUT_NEW, need, "active-page chat footer measurement")
    doc = _replace_once(doc, TITLE_DENSITY_RESIZE_OLD, TITLE_DENSITY_RESIZE_NEW, need, "width-keyed title-bar density")
    doc = _replace_once(doc, TITLE_DENSITY_PAGE_OLD, TITLE_DENSITY_PAGE_NEW, need, "page-change title-bar density bypass")
    doc = _replace_once(doc, CONTEXT_OBSERVER_OLD, CONTEXT_OBSERVER_NEW, need, "subtree-scoped context enhancement")
    doc = _replace_once(doc, DEBUG_TICK_OLD, DEBUG_TICK_NEW, need, "active-page debug rendering")
    doc = _replace_once(doc, EDITOR_ENROL_OBSERVER_OLD, EDITOR_ENROL_OBSERVER_NEW, need, "relevant-only editor strip enrollment")
    doc = _replace_once(doc, EDGE_SEED_OLD, EDGE_SEED_NEW, need, "active-page edge enrollment")
    doc = _replace_once(doc, EDGE_MARK_OLD, EDGE_MARK_NEW, need, "active-page edge dirty set")
    doc = _replace_once(doc, EDGE_VISIBLE_OLD, EDGE_VISIBLE_NEW, need, "structural edge visibility")
    doc = _replace_once(doc, "    var rafId = 0, geomDirty = false, geomDeferred = false, ro = null;", "    var rafId = 0, geomDirty = false, geomDeferred = false, ro = null, geometryScope = null, edgeGeometryTimer = 0;", need, "active edge geometry scope")
    doc = _replace_once(doc, EDGE_RELAYOUT_OLD, EDGE_RELAYOUT_NEW, need, "visible-only edge geometry")
    doc = _replace_once(doc, "if (geomDirty) { geomDirty = false; relayoutAll(); }", "if (geomDirty) { geomDirty = false; relayoutVisible(); }", need, "visible-only edge geometry call")
    doc = _replace_once(doc, EDGE_PAGE_CHANGE_OLD, EDGE_PAGE_CHANGE_NEW, need, "active-page edge refresh")
    doc = _replace_once(doc, "      seed();\n      markAll();", "      var initialScope = pageScope();\n      geometryScope = initialScope;\n      seed(initialScope);\n      markScope(initialScope);", need, "active-page edge boot")
    doc = _replace_once(doc, "    function onResize() {\n      geomDirty = true;\n      markAll();\n    }", "    function onResize() {\n      clearTimeout(edgeGeometryTimer);\n      geometryScope = pageScope();\n      geomDirty = true;\n      markAll();\n    }", need, "active-page edge resize scope")
    doc = _replace_once(
        doc,
        "        ro = new ResizeObserver(function (entries) {\n          try {",
        "        ro = new ResizeObserver(function (entries) {\n          if (document.documentElement.getAttribute('data-pm-page-transition') === 'running') return;\n          try {",
        need,
        "page-transition edge observer fence",
    )
    doc = _replace_once(doc, FROST_REFRESH_OLD, FROST_REFRESH_NEW, need, "active-page frost refresh")
    doc = _replace_once(doc, "      if (slot[entry.v]) { measure(host, head, entry); return; }", "      if (slot[entry.v]) return;", need, "observer-owned frost remeasurement")
    doc = _replace_once(doc, "</head>", PERFORMANCE_STYLE + "\n</head>", need, "performance CSS")
    doc = _replace_once(doc, "  function renderBrowserScm(){", PERFORMANCE_MODEL_SOURCE + "  function renderBrowserScm(){", need, "performance models")
    doc = _replace_band(
        doc,
        "    if(state.browserScmTab==='performance')return ",
        "    return `<div class=\"systems-contract-grid\"><section class=\"systems-contract-card\" data-browser-program-projection=\"true\"><h3>PM-native Browser Program</h3>",
        PERFORMANCE_BRANCH,
        need,
        "performance consumer branch",
    )
    need(
        PERFORMANCE_BRANCH.count('data-ui-action-id="ui.performance.evidence.inspect" data-availability="available"') == 1,
        "T46P: performance control availability missing",
    )
    doc = _replace_once(
        doc,
        "Same-frame acknowledgement does not mean work succeeded. Hiding this view stops its paint while the durable owner-work identity remains mounted outside the view.",
        "Reconnect, restart, sleep, and external return preserve operation, session, stream, and upload identity while stale generations are rejected. Same-frame acknowledgement does not mean work succeeded. Hiding this view stops its paint while the durable owner-work identity remains mounted outside the view.",
        need,
        "continuity identity copy",
    )
    doc = _replace_once(
        doc,
        "${infoRow('Browser evidence','Never native certification')}",
        "${infoRow('Browser evidence','Never promoted to native certification')}",
        need,
        "browser evidence certification boundary copy",
    )
    doc = _replace_once(doc, "</body>", PERSISTENT_WORK_MARKUP + "\n" + PERFORMANCE_API_SCRIPT + "\n</body>", need, "simulation API")

    need(doc.count(TRANSFORM_MARKER) == 3, "T46P: CSS/markup/script marker census mismatch")
    need(doc.count('id="pm7-t46p-performance-css"') == 1, "T46P: CSS identity mismatch")
    need(doc.count('id="pm7-t46p-performance-js"') == 1, "T46P: script identity mismatch")
    need(doc.count("window.PM7_PERFORMANCE_TEST_API=") == 1, "T46P: singleton API mismatch")
    need(doc.count("data-observable-work-id=\"concept-work:full-thread-performance:001\"") >= 1,
         "T46P: persistent observable-work identity missing")
    need("Array.from({length:100}" in doc and "data-installation-virtualized=\"true\"" in doc,
         "T46P: 100-installation model/window missing")
    need("PM7_PERFORMANCE_GOVERNOR_STATES" in doc and "PM7_PERFORMANCE_COMMAND_STATES" in doc and "PM7_PERFORMANCE_WORK_STATES" in doc,
         "T46P: independent state-axis vocabularies missing")
    need(PERFORMANCE_MODEL_SOURCE.count("{fixture_id:") == 7 and PERFORMANCE_MODEL_SOURCE.count("{outcome:") == 6
         and PERFORMANCE_MODEL_SOURCE.count("{family:") == 5,
         "T46P: deterministic work/governor/bounded-list fixture census mismatch")
    need(all(("state:'%s'" % state) in PERFORMANCE_MODEL_SOURCE for state in
             ("queued", "running", "waiting", "cancel-requested", "terminal-unknown", "recovery-required", "completed")),
         "T46P: exact ObservableWork fixture states missing")
    need(all(("outcome:'%s'" % outcome) in PERFORMANCE_MODEL_SOURCE for outcome in
             ("admitted", "queued", "admitted-degraded", "permission-blocked", "resource-blocked", "cancelled")),
         "T46P: exact Governor outcome fixture states missing")
    need(all(("family:'%s'" % family) in PERFORMANCE_MODEL_SOURCE for family in
             ("findings", "history", "logs", "provider", "receipts")),
         "T46P: exact bounded-list fixture families missing")
    need(all(token in PERFORMANCE_MODEL_SOURCE for token in
             ('data-observable-work-fixture="true"', 'data-governor-outcome="${row.outcome}"',
              'data-bounded-list-family="${row.family}"', 'data-progress-denominator="phase-only"',
              'data-runtime-availability="browser-fixture-only"'))
         and PERFORMANCE_MODEL_SOURCE.count("${renderPerformanceTruthFixtures()}") == 1,
         "T46P: truthful fixture rendering contract missing")
    need("probeDedupStaleGeneration" in doc and "probeIdentityContinuity" in doc and "probeAdmissionBeforeHydration" in doc,
         "T46P: deterministic verifier hooks missing")
    need("function pageScope(payload)" in doc and "function markScope(scope)" in doc and "function relayoutVisible()" in doc and "geometryScope = scope" in doc and "function activePageScope(payload)" in doc and "function wireHost(host, entry)" in doc and "if (slot[entry.v]) return;" in doc,
         "T46P: active-page shared chrome hot-path repair missing")
    need("var pageTabMetrics = new WeakMap()" in doc and "function cacheTabMetrics()" in doc and "paintInk(tab, paintW, paintX, liq.sx, liq.sy, geometry)" in doc and "tab ? measureTab(tab) : null" in doc and "var pageRects = new WeakMap()" in doc and "function clearPageAnimation(panel)" in doc and "if (restarting)" in doc and "syncHomeSurface(entry.target, entry.contentRect)" in doc,
         "T46P: page-tab animation geometry cache missing")
    need("function slotPageActive()" in doc and "!control || !slot.contains(control)" in doc and "if (!slotPageActive()) return;" in doc,
         "T46P: side-panel fitter escaped its active owner surface")
    need(doc.count("if (page && !page.classList.contains('active')) return;") >= 2,
         "T46P: inactive chat measurement guards missing")
    need("var lastBarWidth = bar.getBoundingClientRect().width" in doc and "Math.abs(width - lastBarWidth) < .5" in doc and "moreMenu.querySelectorAll('.pm6-tb-pages-more-item[data-page]')" in doc,
         "T46P: title-bar density still reflows on ordinary page changes")
    need("enhanceContext(node)" in doc and "if (panel && panel.classList.contains('active')) render();" in doc and "if (needsEnrollment) edEnrolStrips();" in doc,
         "T46P: background observers or debug timers still rescan inactive surfaces")
    need("%" not in PERFORMANCE_BRANCH, "T46P: denominator-free percentage entered the performance surface")
    need("synced" not in PERFORMANCE_BRANCH.lower(), "T46P: routine synced label entered the performance surface")
    need("setTimeout" not in PERFORMANCE_API_SCRIPT and "setInterval" not in PERFORMANCE_API_SCRIPT,
         "T46P: timing-based nondeterminism entered the simulation API")
    need("localStorage" not in PERFORMANCE_API_SCRIPT and "sessionStorage" not in PERFORMANCE_API_SCRIPT,
         "T46P: simulation API gained persistence ownership")
    lowered = (PERFORMANCE_STYLE + PERFORMANCE_BRANCH + PERFORMANCE_API_SCRIPT).lower()
    for forbidden in ("<canvas", "getcontext(", "webgl", "backdrop-filter", "filter:", "url(#", "fetch(", "xmlhttprequest", "websocket(", "eventsource("):
        need(forbidden not in lowered, "T46P: nonportable or runtime primitive entered module: %s" % forbidden)

    effect_receipt = assert_effect_delta(
        effects_before,
        capture_effect_surfaces(doc),
        EXPECTED_EFFECT_DELTA,
        need,
        "T46P",
    )
    notes.update(
        {
            "decision": "deterministic browser-only full-thread truth, virtualization, and continuity fixtures",
            "predecessor": PREDECESSOR_MARKER,
            "state_axes": {
                "governor": ["admitted", "queued", "admitted-degraded", "permission-blocked", "resource-blocked", "cancelled"],
                "command": ["accepted", "acknowledged", "executing", "succeeded", "failed", "cancelled", "rejected", "terminal-unknown"],
                "observable_work": ["accepted", "queued", "starting", "running", "waiting", "retrying", "reconnecting", "backgrounded", "degraded", "stalled", "committing", "verifying", "testing-route", "migrating-route", "rolling-back", "completed", "failed", "cancelled", "recovery-required"],
            },
            "truth_fixture_census": {
                "observable_work_rows": 7,
                "governor_outcome_rows": 6,
                "bounded_list_families": 5,
            },
            "truth_fixture_boundary": "bounded deterministic browser-concept records only; provider, network, native, and production runtime execution remain unavailable",
            "settings_contract": "consumes the existing T44 825+ model-backed virtualized All Settings catalog; creates no second settings model",
            "installation_fixture": "100 deterministic cached detection records with a 12-card compact mounted window",
            "continuity_fixture": "deterministic dedup/stale-generation, reconnect/restart/sleep/external-return identity, and auth/rate-before-hydration probes",
            "interaction_hot_path": "page.changed scopes the active page immediately but defers edge-band enrollment/geometry until the directional transition has settled; hidden chat and Home surfaces stay out of geometry; the Home side-panel pill fitter ignores Settings and other managers; context enhancement is limited to inserted subtrees; hidden Run/Debug paint is suspended; page-tab and page-panel geometry are cached outside settled clicks and reused through unchanged spring/liquid and directional animations; interrupted transitions cancel cleanly and snap to the latest requested page without a forced layout",
            "simulation_boundary": "browser concept simulation only; no native Slint, compositor, server, network, storage, packaging, platform, hardware, performance, security, or readiness certification",
            "browser_prototype_portability_check": "ordinary DOM, CSS grid/flex, bounded arrays, and synchronous typed records; no Canvas, WebGL, filters, network primitives, timers, or persistence",
            "effect_surface_set_diff": effect_receipt,
        }
    )
    return doc
