#!/usr/bin/env python3
"""Check retained actual sources without new Goals or scientific/evaluation reads."""
import datetime, importlib.util, json
from pathlib import Path
h=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('passive',h/'export.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
idx=m.ROOT/'state/passive-receipts-index-v1.json';entries=json.loads(idx.read_text())['entries'];checks=[];stages={}
with m.ro(m.DB) as db:
 for entry in entries:
  raw=Path(entry['path']).read_bytes();assert m.sha(raw)==entry['sha256'];v=json.loads(raw);stages[v['stage']]=v
  checked=0
  for obs in v['observations']:
   src=obs['source'];body=None;original=None
   if src['type']=='t3_actual_native_goal_tool_response':
    row=db.execute('SELECT payload_json FROM orchestration_v2_projection_turn_items WHERE thread_id=? AND turn_item_id=?',(v['thread_id'],src['record_id'])).fetchone();assert row
    original=row[0].encode();item=json.loads(original)
    body=next(b for b in m.parse_output(item.get('output')) if m.sha(m.canonical(b))==obs['response_sha256'])
   elif src['type']=='muse_actual_native_goal_tool_response':
    line=src['time']['line']
    with Path(src['path']).open('rb') as fp:
     for n,data in enumerate(fp,1):
      if n==line:original=data;break
    j=json.loads(original);assert j['id']==src['record_id']
    result=next(x for x in j['payload']['event']['results'] if x.get('tool_call_id')==src['call_id'])
    body=next(b for b in m.parse_output(result['text']) if m.sha(m.canonical(b))==obs['response_sha256'])
   elif src['type']=='glm_installed_integration_driver_state' and '/state/' in src['path']:
    original=Path(src['path']).read_bytes();j=json.loads(original);body=j.get('actual_state',j)
   if original is not None:
    assert m.sha(original)==src['sha256'];assert m.redact(body)==obs['native_response'];checked+=1
   def inspect(x):
    if isinstance(x,dict):
     assert not any(k in x and x[k] is not None for k in ['objective','current_work','next_work','title','acceptance'])
     for a in x.values():inspect(a)
    elif isinstance(x,list):
     for a in x:inspect(a)
   inspect(obs['native_response'])
  assert v['scope_audit'].startswith('incomplete_unknown')
  assert all(v['usage'][k] is None for k in ['input','cached_input','generated_output','reasoning_subset','provider_billing'])
  checks.append({'stage':v['stage'],'artifact_sha256':entry['sha256'],'independently_rechecked_original_response_records':checked,'type_and_redaction_and_unknown_usage_checks':True,'states':v['lifecycle_observations']['states_in_source_order']})
 muse=stages['I-ANCHOR-MUSE/treatment/research-v1'];assert muse['lifecycle_observations']['active_get_response'];assert not muse['lifecycle_observations']['terminal_get_response']
 assert any(x['tool']=='update_goal' and x['native_response']['goal']['status']=='complete' for x in muse['observations'])
 assert any(x['source']['type']=='muse_native_goal_state' and x['native_response']['status']=='complete' for x in muse['observations'])
 glm=stages['I-ANCHOR-GLM/treatment/research-v2'];states=glm['lifecycle_observations']['states_in_source_order'];assert 'running' in states and 'paused' in states
 for stage in ['../outside/foreign','I-ANCHOR-MUSE/treatment/research-v1']:
  try:m.harvest(stage,db,set(),[],[],'qualification')
  except ValueError:pass
  else:raise AssertionError('unauthorized or traversal stage accepted')
report={'schema':'pm.er10.passive-receipts-qualification.v1','checked_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'index_sha256':m.sha(idx.read_bytes()),'checks':checks,'scope_rejection_checks':True,'result':'Engineering source/type/hash/redaction checks passed; no scientific admission or method/speed claim','limitations':['Muse actual post-terminal get response missing; complete update and native state observed separately','Luna T3 actual tool bodies missing; terminal projection only','GLM driver running/paused contradiction preserved; current state and historical snapshots distinguished by source path/time; ACP/backend alias mapping unknown','No generated/cached/billing fields exposed in selected sources; no further probes','Scope audit incomplete_unknown; file-access names/hashes unsupported']}
(h/'qualification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
