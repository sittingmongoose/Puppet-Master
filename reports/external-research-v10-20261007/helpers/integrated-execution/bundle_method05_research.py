import pathlib,json,hashlib,datetime,time,os
B=pathlib.Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5');started=datetime.datetime.now(datetime.timezone.utc).isoformat();tick=time.monotonic();rows=[]
for arm in ['control','treatment']:
 A=B/'jobs/I-METHOD-05'/arm;J=A/'research-v1';J.mkdir(exist_ok=True);assert not (J/'artifact.md').exists();roles=(['discovery'] if arm=='treatment' else [])+['research-topic-a','research-topic-b'];parts=[];maps=[]
 for role in roles:
  R=A/(role+'-v1');assert (R/'frozen-delivery.json').exists()
  for name in ['artifact.md','source-map.json']:
   p=R/name;raw=p.read_bytes();maps.append({'role':role,'path':str(p),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)})
  parts.append(('# Exact candidate-authored '+role+'\n\n').encode()+(R/'artifact.md').read_bytes()+b'\n\n')
 raw=b''.join(parts);(J/'artifact.md').write_bytes(raw);source={'schema':'er10.exact-mechanical-predecessor-bundle.v1','scope':'Verbatim candidate-authored inventory/topic drafts and exact original source-map references; no host scientific synthesis or quality judgment','stage_order':roles,'exact_original_files':maps,'captured_source_directories':[str(A/(r+'-v1')/'sources') for r in roles],'assembly_started_at':started,'assembly_completed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'output_sha256':hashlib.sha256(raw).hexdigest(),'output_bytes':len(raw),'originals_unchanged':True,'not_additional_candidate_work':True}
 (J/'source-map.json').write_text(json.dumps(source,indent=2)+'\n')
 for name in ['artifact.md','source-map.json']:os.chmod(J/name,0o444)
 rows.append({'arm':arm,'bundle':str(J),'bytes':len(raw),'source_map':str(J/'source-map.json')})
cost={'type':'mechanical_method05_exact_bundle_host_cost','started_at':started,'completed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsed_seconds':time.monotonic()-tick,'both_arm_outputs':rows,'science_judgment':None,'original_whole_deadlines_unchanged':True,'shared_cost_not_double_counted':True}
(B/'helpers/integrated-execution/method05-mechanical-bundle-cost-v1.json').write_text(json.dumps(cost,indent=2)+'\n')
with (B/'state/integrated-methods-dispatches.jsonl').open('a') as f:f.write(json.dumps(cost)+'\n')
print(json.dumps(cost))
