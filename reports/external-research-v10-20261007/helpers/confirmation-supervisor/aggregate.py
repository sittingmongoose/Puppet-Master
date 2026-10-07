#!/usr/bin/env python3
"""Aggregate immutable exact-pair mechanical results without scientific prose inspection."""
import json,hashlib,datetime,statistics
from pathlib import Path
B=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5');D=B/'reviews/confirmation';S=B/'state/confirmation-supervisor.json';s=json.loads(S.read_text())
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
cases=['C-01','C-02','C-03','C-04'];cs=[];refs=[]
for case in cases:
 p=D/case/'COMPARISON.json';assert sha(p)==s['pairs'][case]['comparison_sha256'];c=json.loads(p.read_text());cs.append(c);refs.append({'case':case,'path':str(p),'sha256':sha(p)})
 for a in c['arms'].values():
  h=a['host_review_freeze'];assert sha(h['path'])==h['sha256']
  for f in json.loads(Path(h['path']).read_text())['files']:assert sha(f['path'])==f['sha256']
  for t in a['stages']:
   for f in json.loads(Path(t['terminal_freeze_path']).read_text())['files']:assert sha(f['path'])==f['sha256']
quiet=json.loads((D/'FINAL_QUIET.json').read_text());assert quiet['task_count']==28 and quiet['no_pending_children']
counts={'mechanical_comparisons_frozen':4,'delivered_pair_assessments':sum(c['assessed_pair'] for c in cs),'both_arm_full_declared_source_coverage':sum(c['assessed_pair'] and all(a['full_declared_scope_assessed'] for a in c['arms'].values()) for c in cs),'unassessed_hold_pairs':sum(not c['assessed_pair'] for c in cs),'failed_native_pair_holds':1,'pending_pairs':0,'candidate_stage_tasks_terminal':20,'review_tasks_terminal':8,'review_tasks_completed':7,'review_tasks_interrupted':1,'qualified_confirmation_wins':0}
def stats(xs):return {'n':len(xs),'median':statistics.median(xs),'min':min(xs),'max':max(xs)}
metrics=['failure_inclusive_service_latency_seconds','failure_inclusive_host_closeout_latency_seconds','aggregate_stage_occupied_seconds','host_and_between_stage_elapsed_seconds']
repeats={}
for domain in ['A','B']:
 subset=[c for c in cs if c['domain']==domain];assert len(subset)==2
 repeats[domain]={}
 for arm in ['control','treatment']:
  values={m:stats([c['arms'][arm][m] for c in subset]) for m in metrics}
  for key,field in [('queue_startup_seconds','queue_startup_seconds'),('output_bytes','output_bytes'),('scientific_artifact_bytes','scientific_artifact_bytes'),('source_capture_bytes','source_capture_bytes')]:values[key]=stats([sum(t[field] for t in c['arms'][arm]['stages']) for c in subset])
  repeats[domain][arm]=values
summary=[]
for c in cs:
 arms={}
 for arm,a in c['arms'].items():
  arms[arm]={'original_scientific_grade':a['original_scientific_grade'],'full_declared_scope_assessed':a['full_declared_scope_assessed'],'source6_axes_original':a['source6_axes_original'],'obligations_original':a['obligations_original'],'original_remainder_reference':a['limitations_original_reference'],'review_freeze':a['review_freeze'],'host_review_freeze':a['host_review_freeze'],**{m:a[m] for m in metrics},'queue_startup_seconds':sum(t['queue_startup_seconds'] for t in a['stages']),'output_bytes':sum(t['output_bytes'] for t in a['stages']),'scientific_artifact_bytes':sum(t['scientific_artifact_bytes'] for t in a['stages']),'source_capture_bytes':sum(t['source_capture_bytes'] for t in a['stages']),'review_time_separate':a['review_time_separate'],'raw_cumulative_native_counters_per_stage_unsummed':[{'stage':t['stage'],'counters':t['native_counters_original_not_generated_or_billing']} for t in a['stages']],'usage':a['usage'],'source_operations':None}
 summary.append({'case':c['case'],'domain':c['domain'],'repetition':c['repetition'],'delivered_pair_assessment':c['assessed_pair'],'both_full_declared_source_coverage':c['assessed_pair'] and all(a['full_declared_scope_assessed'] for a in c['arms'].values()),'native_and_comparative_eligibility':'HOLD' if c['case'] in ['C-01','C-03'] else 'DIAGNOSTIC_UNQUALIFIED','arms':arms})
now=datetime.datetime.now(datetime.timezone.utc).isoformat();out={'schema':'pm.er10.confirmation-comparisons.v1','frozen_at':now,'exact_scope':cases,'qualification':'DIAGNOSTIC_UNQUALIFIED','counts':counts,'original_comparisons':refs,'pairs':summary,'repeat_median_range_all_original_repetitions':repeats,'final_quiet':{'path':str(D/'FINAL_QUIET.json'),'sha256':sha(D/'FINAL_QUIET.json')},'interpretation_limits':['No qualified comparative or confirmation win. C01 original required review absent/interrupted; unassessed HOLD. C03 treatment native BLOCKED remains original failed gate and comparative HOLD despite diagnostic science review.','C02 treatment original full-declared-scope assessment false; original grades and remainder unchanged.','Descriptive latency/work statistics include all original attempts and failed native disposition; no failed-native or output-absence speed win.','Usage input/cache/generated/reasoning/billing and source operations unknown; no affordability claim. Cumulative native counters retained unsummed, separate from generated tokens/billing.','Concurrent named-account/sibling contention not fully attributable. Input maps advisory, scope audit incomplete_unknown. Raw Goal API bodies and createdAt missing; actual active and terminal projections distinct.'],'candidate_feedback_sent':False,'outcome_tuning':False,'publication_and_retention_cleanup_owner':'root'}
p=D/'COMPARISONS.json';assert not p.exists();p.write_text(json.dumps(out,indent=2)+'\n')
lines=['# C01–C04 locked confirmation results','',f"Four pairs/eight logical arms closed. {counts['delivered_pair_assessments']} delivered pair assessments; {counts['both_arm_full_declared_source_coverage']} pairs with BOTH-arm full declared Source coverage. One original pair unassessed/HOLD; one failed-native pair retains comparative HOLD. No qualified confirmation win. All 28 owned tasks terminal, quiet and settled.",'','Original six-axis/obligation grades and remainder references are preserved in COMPARISONS.json and each immutable COMPARISON.json. No scientific prose was inspected by the supervisor.','', '| Case | Delivered assessment | BOTH arms full Source coverage | Eligibility |','|---|---|---|---|']
for c in summary:lines.append(f"| {c['case']} | {c['delivered_pair_assessment']} | {c['both_full_declared_source_coverage']} | {c['native_and_comparative_eligibility']} |")
lines+=['','C01/control original reviewer interrupted after original 40-minute absolute deadline and one delivery notice/grace; required review deliverables absent, 30 authored source files retained. C03/treatment actual native terminal BLOCKED remains unchanged; its two diagnostic reviews were admitted by a frozen root exception. C02/treatment original coverage remainder remains unchanged.','', '| Domain / arm | Service latency median [min, max], seconds | Aggregate occupied work median [min, max], seconds |','|---|---|---|']
for dom,v in repeats.items():
 for arm,m in v.items():
  x=m['failure_inclusive_service_latency_seconds'];y=m['aggregate_stage_occupied_seconds'];lines.append(f"| {dom} / {arm} | {x['median']:.2f} [{x['min']:.2f}, {x['max']:.2f}] | {y['median']:.2f} [{y['min']:.2f}, {y['max']:.2f}] |")
lines+=['','These are descriptive failure-inclusive measurements, with no failed-native speed-win inference. Exact startup/queue, host closeout, output/capture volume, original review times and unsummed native counters are in COMPARISONS.json. Source operations and input/cache/generated/billing usage remain unknown; no affordability claim.','', 'Recipe, input bytes and locked scope remained unchanged. No rescue, retesting, best-of or candidate feedback. Root owns publication and cleanup after verified retention.','', 'Immutable comparison references:']
for r in refs:lines.append(f"- {r['path']} — SHA-256 {r['sha256']}")
report=D/'REPORT.md';assert not report.exists();report.write_text('\n'.join(lines)+'\n')
s['assessment_counts']=counts;s['scope_status']='EXACT_C01_C04_CLOSED_RESULTS_FROZEN';s['updated_at']=now;s['final_results']={'comparisons':{'path':str(p),'sha256':sha(p)},'report':{'path':str(report),'sha256':sha(report)},'quiet':out['final_quiet']};S.write_text(json.dumps(s,indent=2)+'\n')
with (B/'state/confirmation-supervisor-log.jsonl').open('a') as f:f.write(json.dumps({'at':now,'event':'exact-four-pair-results-frozen','counts':counts,'results':s['final_results']})+'\n')
print(json.dumps({'counts':counts,'results':s['final_results']}))
