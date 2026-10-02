"""Synthetic scalar projection only; never invoke startup/private model-I/O readers."""
import hashlib,importlib.util,json
from pathlib import Path
BASE=Path(__file__).resolve().parent;P=BASE.parents[1]/'dev/route-assembly-v1/projector.py'
spec=importlib.util.spec_from_file_location('route_proj_offline',P);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
expected=['mcp__pm_boundary__read_file','mcp__pm_boundary__write_file','mcp__pm_boundary__mechanical','mcp__pm_boundary__public_https_get'];secret='SYNTHETIC-UNADMITTED-VALUE-NEVER-EMIT';sid='synthetic-session'
def model(text='synthetic source task'):
 return {'type':'model_io','requestId':'synthetic-request','attempt':0,'sessionId':sid,'model':{'providerId':'builtin:zai-coding-plan','variant':'max'},'request':{'body':{'model':'glm-5.3-flash','system':[{'type':'text','text':'synthetic system'}],'tools':[{'name':n} for n in expected]},'messages':[{'role':'user','content':text}],'headers':{'Authorization':secret}},'unknownSecret':secret}
rows=[]
r=m.model_row(model(),sid,expected);rows.append({'test':'mandatory-logical-request-projection-no-secret-output','pass':r['context_verified'] and secret not in json.dumps(r) and r['body_message_array_available'] is False and r['sdk_message_array_available'] is False})
for marker in ['# agentsMd',"(user's auto-memory, persists across conversations):",'Contents of /fresh/home/.zcode/AGENTS.md (user default instructions):']:
 r=m.model_row(model(marker),sid,expected);rows.append({'test':'rendered-instruction-marker-rejects-context','marker_kind':['agentsMd','auto-memory','fresh-HOME-default-instructions'][len(rows)-1],'pass':r['context_verified'] is False})
for name,change in [('missing-mandatory-logical-array',lambda o:o['request'].pop('messages')),('boolean-attempt',lambda o:o.update(attempt=True))]:
 o=model();change(o)
 try:m.model_row(o,sid,expected);ok=False
 except ValueError:ok=True
 rows.append({'test':name,'pass':ok})
r=m.event_projection({'event':'bootstrap.app.startup.runtime_config.completed','context':{'memoryUse':False,'memoryExtractionEnabled':True,'mode':'build','apiKey':secret,'headers':{'Authorization':secret}},'message':secret});rows.append({'test':'event-known-scalars-only-no-all-memory-off-claim','pass':secret not in json.dumps(r) and r[0]['fields']=={'memoryUse':False,'memoryExtractionEnabled':True,'mode':'build'}})
o={'schema':'er8.independent.route-synthetic-projection.v1','source_sha256':hashlib.sha256(P.read_bytes()).hexdigest(),'native_calls':0,'provider_calls':0,'private_reads':0,'scope':'synthetic direct pure functions only; actual native shape unestablished','all_pass':all(r['pass'] for r in rows),'rows':rows}
(BASE/'checker-route-projection-results.json').write_text(json.dumps(o,indent=2)+'\n');print(json.dumps(o,indent=2))
