import json, hashlib, datetime
from pathlib import Path
P=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
CASES=['D-M07-A','D-M07-B','D-M08-A','D-M08-B','D-M09-A','D-M10-A']
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def save(p,x):
 p=Path(p); p.parent.mkdir(parents=True,exist_ok=True); p.write_text(json.dumps(x,indent=2)+'\n')
binding={'providerInstanceId':'codex_gmail','account':'sittingmongoose@gmail.com','driverKind':'codex','model':'gpt-6-luna','options':{'reasoningEffort':'max','serviceTier':'priority'},'runtimeMode':'full-access','interactionMode':'default'}
state={'schema':'er10.targeted-cohort3.v1','status':'IN_PROGRESS','capacity':{'Luna':2,'GLM':0,'Muse':0},'owned_tasks':[],'cases':{},'updated_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'provenance':'Path maps advisory, not a filesystem firewall; no inherited parent history supplied.'}
for c in CASES:
 d=P/'cases'/c; card=json.loads((d/'case-card.json').read_text()); im=json.loads((d/'INPUT_MAP.json').read_text()); sm=json.loads((d/'SEED_INPUT_MAP.json').read_text())
 h={str(d/n):sha(d/n) for n in ['case-card.json','INPUT_MAP.json','SEED_INPUT_MAP.json']}
 for s in im['sources']:
  assert sha(s['path'])==s['sha256'],s['path']
  h[s['path']]=sha(s['path'])
 for f in [im['brief'],im['source_manifest'],card['predecessor']['contract_path']]: h[f]=sha(f)
 b=binding if card['family_assignment']=='Luna' else {'providerInstanceId':'zcode','driverKind':'acpRegistry','model':'builtin:zai-coding-plan\\GLM-5.3-Flash','options':{'thought':'max','mode':'yolo'},'admission':'HELD: zero capacity; literal short /goal + general external assignment support required'}
 mapping={}
 for orig in sm['required_outputs']: mapping[orig]=str(P/'jobs'/c/'common'/('research-v1' if Path(orig).name=='draft.md' else 'critic-v1')/Path(orig).name)
 overlay={'version':'carrier-v1','case_id':c,'binding':b,'original_hashes':h,'seed_path_mapping':mapping,'original_card':str(d/'case-card.json'),'original_input_map':str(d/'INPUT_MAP.json'),'original_seed_input_map':str(d/'SEED_INPUT_MAP.json'),'budget':card['budget'],'output_scope':card['output_scope'],'carrier':'jobs/<case>/<arm>/<role>-v1/{draft.md,critique.md,final.md,native_activation_receipt.json,native_terminal_receipt.json,timings.json}; exact original meaning unchanged'}
 save(P/'jobs'/c/'BINDING_CARRIER_OVERLAY.json',overlay)
 state['cases'][c]={'disposition':'HELD_GLM_CAPACITY' if card['family_assignment']=='GLM' else 'QUEUED','overlay':str(P/'jobs'/c/'BINDING_CARRIER_OVERLAY.json')}
save(P/'state/targeted-cohort3.json',state)
print('six overlays frozen; source hashes verified')
