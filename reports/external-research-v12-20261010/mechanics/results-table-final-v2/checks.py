#!/usr/bin/env python3
"""New synthetic semantic checks only; no campaign reads, fixture cleanup or old suite."""
import copy, json
from pathlib import Path
import join_final as j

def row(slot,arm,judgment, cost=10):
    return {'slot':slot,'arm':arm,'phase':'D','method':'G','role':'reviser','actual_provider':'actual-Muse','requested_tier':'UNKNOWN','source_judgment':judgment,'assessment_state':'ASSESSED' if judgment!='UNKNOWN' else 'UNASSESSED','delivery':'STARTED_NOT_FINAL_QUIET','attempts':[{'task_id':slot+'/'+arm+'/failed'}],'dimensions':{'protocol':{'label':'UNKNOWN','observations':[{'raw':{'facet':{'unmapped':'retained'},'label':'odd'},'provenance':{'path':'original','json_pointer':'/dimensions/protocol'}}]}},'resources':{'old_cost':cost},'schema_mismatches':['original mismatch retained']}
def arm(r,cost=10):
    return {'slot':r['slot'],'arm':r['arm'],'attempt_task_ids':[r['attempts'][0]['task_id']], 'observed_occupied_context_sum_seconds':cost,'complete_occupied_context_sum_seconds':cost,'missing_context_lifetimes':0,'attempt_terminal_latency_seconds':cost,'delivery_proxy_latency_seconds':'UNKNOWN' if j.identity(r)==j.MISSING else cost,'observed_native_or_host_failure':j.identity(r)==j.MISSING}
rows=[row('D-R1-03','treatment','UNKNOWN',197)]
rows += [row('X'+str(i),'control','PASS') for i in range(79)]
old={'rows':copy.deepcopy(rows)}; acct={'logical_arms':[arm(r,197 if j.identity(r)==j.MISSING else 10) for r in rows], '_snapshot_provenance':{'path':'fixture','sha256':'0'*64}}
out=j.enrich(old,acct)
assert out[0]['final_accounting']['attempt_terminal_latency_seconds']==197
assert out[0]['final_accounting']['observed_occupied_context_sum_seconds']==197
assert out[0]['source_judgment']=='UNKNOWN' and out[0]['assessment_state']=='UNASSESSED'
s=j.aggregate(out,'observed_occupied_context_sum_seconds')
assert s['complete_total']==987 and s['source_passing_outputs']==79 and s['cost_per_source_passing_output']==round(987/79,6)
assert old['rows']==rows and out[0]['dimensions']==rows[0]['dimensions']
assert out[1]['actual_provider']=='actual-Muse' and out[1]['method']=='G'
broken=copy.deepcopy(out); broken[1]['final_accounting']['complete_occupied_context_sum_seconds']='UNKNOWN'
s=j.aggregate(broken,'complete_occupied_context_sum_seconds')
assert s['complete_total']=='UNKNOWN' and s['cost_per_source_passing_output']=='UNKNOWN' and s['missing_rows']==1
pairs=[row('p1','control','PASS'),row('p1','treatment','FAIL'),row('p2','control','PASS'),row('p2','treatment','PASS_WITH_LIMITATIONS'),row('p3','control','PASS'),row('p3','treatment','UNKNOWN')]
for r in pairs:r['final_accounting']=arm(r)
broken[1]['final_accounting']['missing_context_lifetimes']=1
s=j.aggregate(broken,'observed_occupied_context_sum_seconds')
assert s['observed_partial_sum']==987 and s['complete_total']=='UNKNOWN' and s['cost_per_source_passing_output']=='UNKNOWN'
assert j.legacy_module().build.__name__=='build'
c=j.comparisons(pairs)
assert [p['slot'] for p in c['both_source_pass_pairs']]==['p2']
assert sum(g['metrics']['attempt_terminal_latency_seconds']['assigned_arms'] for g in c['all_assigned'])==6
assert len(c['both_source_pass_totals'])==1 and c['both_source_pass_totals'][0]['pair_count']==1
result={'status':'PASS','checks':['missing failed attempt 197s retained in failure-inclusive per-source-output cost','raw heterogeneous facets and legacy product unchanged; G actual Muse retained','incomplete aggregate and per-pass cost UNKNOWN','both-source-pass selection excludes FAIL and UNKNOWN; all-assigned keeps them'],'campaign_join_executed':False}
(Path(__file__).parent/'CHECKS.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
