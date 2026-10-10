#!/usr/bin/env python3
"""Bounded checks on existing raw examples referenced by the saved snapshot."""
import hashlib, json
from pathlib import Path
from extract import utc
root=Path(__file__).resolve().parent
s=json.loads((root/'current-snapshot.json').read_text())
gid='goal-01a123fb-eb55-7382-bd26-2458e5b0fb95'
groups=[g for g in s['native_goals'] if g['actual_goal_id']==gid]
assert len(groups)==1, 'same actual Muse Goal must occupy one identity group'
g=groups[0]
meters=[o['raw'].get('tokens_used') for o in g['observations']]
assert meters.count(1358661)>1, 'existing repeated terminal meter witness absent'
assert g['meters_summed'] is False and g['deduplicated_billable_usage']=='UNKNOWN'
rows=[t for t in s['declared_tasks'] if t['category']=='candidate' and t['occupied_context_seconds_including_waits']!='UNKNOWN']
seen=set();events=[];total=0
for t in rows:
 tid=t['declaration']['childThreadId']; assert tid not in seen;seen.add(tid)
 a,b=utc(t['context_created_at']),utc(t['quiet_final_at']);assert a is not None and b>=a
 events.extend([(a,1),(b,-1)]);total+=b-a
active=0;last=None;union=0
for time,delta in sorted(events):
 if last is not None and active:union+=time-last
 active+=delta;last=time
assert active==0
cat=s['accounting_by_category']['candidate']
assert abs(total-cat['observed_context_sum_seconds'])<0.00001
assert abs(union-cat['observed_context_union_seconds'])<0.00001
assert total>union, 'existing simultaneous host contexts must preserve overlap distinction'
witness=None
for i,a in enumerate(rows):
 for b in rows[i+1:]:
  if min(utc(a['quiet_final_at']),utc(b['quiet_final_at']))>max(utc(a['context_created_at']),utc(b['context_created_at'])):
   witness=[a['declaration']['taskId'],b['declaration']['taskId']];break
 if witness:break
assert witness
for goal in groups:
 for obs in goal['observations']:
  p=obs['provenance'];assert hashlib.sha256(Path(p['path']).read_bytes()).hexdigest()==p['sha256']
assert s['campaign_billable_tokens']=='UNKNOWN' and s['root_native_meter_is_campaign_aggregate'] is False
for a in s['logical_arms']:
 if a['slot'].startswith('A2-') and a['arm']=='treatment':assert a['final_role']=='investigator'
 if a['slot'].startswith('A7-') and a['arm']=='treatment':assert a['final_role']=='critic-finalizer'
result={'schema':'er12.accounting-extractor.sanity.v1','status':'MECHANICAL_CHECKS_PASSED','semantic_or_native_pass':False,'snapshot_sha256':hashlib.sha256((root/'current-snapshot.json').read_bytes()).hexdigest(),'repeated_actual_goal_id':gid,'terminal_meter_occurrences':meters.count(1358661),'overlap_witness_task_ids':witness,'observed_context_sum_seconds':round(total,6),'observed_context_union_seconds':round(union,6),'billing_inferred':False}
(root/'sanity-results.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
