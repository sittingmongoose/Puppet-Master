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
            "simulation_boundary": "browser concept simulation only; no native Slint, compositor, server, network, storage, packaging, platform, hardware, performance, security, or readiness certification",
            "browser_prototype_portability_check": "ordinary DOM, CSS grid/flex, bounded arrays, and synchronous typed records; no Canvas, WebGL, filters, network primitives, timers, or persistence",
            "effect_surface_set_diff": effect_receipt,
        }
    )
    return doc
