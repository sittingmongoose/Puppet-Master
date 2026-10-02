"""Independent pure host-entry fixture. Native execution is replaced by a sentinel."""
import hashlib,importlib.util,json,os,sys,time
from pathlib import Path
BASE=Path(__file__).resolve().parent
NEW=BASE.parents[1]/'dev/execution-path-v1'
FIX=BASE/'entry-fixture-offline-only';HERE=FIX/'execution-path-v1';HERE.mkdir(parents=True,exist_ok=True)
ROUTE=FIX/'route-assembly-v1';ROUTE.mkdir(exist_ok=True)
WS=FIX/'workspace';WS.mkdir(exist_ok=True)
SELECTED=ROUTE/'launch.py';SELECTED.write_text('# OFFLINE SENTINEL ONLY; never a dispatch route\n')
def put(name,obj):
 p=FIX/name;p.write_text(json.dumps(obj,sort_keys=True)+'\n');return {'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
def load(name):
 spec=importlib.util.spec_from_file_location(name,NEW/(name+'.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
snapshot=json.loads((NEW/'SNAPSHOT.json').read_text());(HERE/'SNAPSHOT.json').write_text(json.dumps(snapshot)+'\n')
accept=put('OFFLINE-boundary-acceptance.json',{'verdict':'accepted','snapshot_sha256':hashlib.sha256((HERE/'SNAPSHOT.json').read_bytes()).hexdigest(),'scope':'OFFLINE FIXTURE; NEVER DISPATCH'})
route=put('OFFLINE-route-snapshot.json',{'closure_sha256':{str(SELECTED):hashlib.sha256(SELECTED.read_bytes()).hexdigest()}})
routeaccept=put('OFFLINE-route-acceptance.json',{'verdict':'accepted','snapshot_sha256':route['sha256'],'scope':'OFFLINE FIXTURE; NEVER DISPATCH'})
now=time.monotonic_ns();sid='checker-entry-stage';unit='er8-'+sid+'.service';stop=now+57_000_000_000;deadline=now+60_000_000_000
clock={'case_id':'OFFLINE-checker-entry','case_start_monotonic_ns':now,'case_elapsed_cap_seconds':120,'case_occupied_cap_seconds':180,'outside_native_cap_seconds':30,'campaign_native_cutoff_monotonic_ns':now+180_000_000_000,'stages':{sid:{'stage_start_monotonic_ns':now,'cap_seconds':60,'response_cap':12}}}
authority={**put('OFFLINE-clock.json',clock),'clock':clock}
config=put('OFFLINE-config.json',{'scope':'OFFLINE FIXTURE; NEVER DISPATCH'})
lease=put('OFFLINE-lease.json',{'schema':'er8.route.lease.v1','owned_unit':unit,'deadline_monotonic_ns':deadline,'native_stop_monotonic_ns':stop,'case_authority':authority})
case={'schema':'er8.route.case-binding.v1','case_id':clock['case_id'],'case_start_monotonic_ns':now,'stage_id':sid,'stage_start_monotonic_ns':now,'max_seconds':60,'max_responses':12,'mode':'canary','public_get':True,'config_sha256':config['sha256'],'lease_sha256':lease['sha256'],'workspace':str(WS),'prompt_file':str(FIX/'OFFLINE-prompt.txt'),'native_out':str(FIX/'OFFLINE-native-out'),'label':'OFFLINE-entry'}
cb=put('OFFLINE-case-binding.json',case)
mp=load('make_plan');plan=mp.construct(stage_id=sid,start_ns=now,cap_seconds=60,response_cap=12,workspace=WS,prompt=FIX/'OFFLINE-prompt.txt',native_out=FIX/'OFFLINE-native-out',label='OFFLINE-entry',admission=FIX/'OFFLINE-admission.json',boundary_acceptance=accept,plan_path=FIX/'OFFLINE-plan.json',public_get=True,case_authority=authority,route_snapshot=route,route_acceptance=routeaccept,assembly_binding={'config':config,'lease':lease,'case_binding':cb,'acceptance':routeaccept})
plan['runtime_path']=str(SELECTED);p=Path(put('OFFLINE-plan.json',plan)['path'])
entry=load('entry');entry.HERE=HERE
calls=[];oldppid=os.getppid;oldread=Path.read_text;oldrun=entry.runpy.run_path;oldargv=sys.argv;oldenv=os.environ.get('PM_BOUND_DEADLINE_NS')
os.getppid=lambda:1
Path.read_text=lambda self,*a,**k:'0::/OFFLINE/'+unit if str(self)=='/proc/self/cgroup' else oldread(self,*a,**k)
entry.runpy.run_path=lambda path,**k:calls.append({'path':path,'argv':list(sys.argv)})
os.environ['PM_BOUND_DEADLINE_NS']=str(stop)
rows=[]
try:
 sys.argv=[str(NEW/'entry.py'),str(p)];rc=entry.main()
 rows.append({'test':'valid-full-host-bindings-reach-sentinel-once','pass':rc==126 and len(calls)==1 and calls[0]['argv']==[str(SELECTED),'--config',config['path'],'--lease',lease['path'],'--case-binding',cb['path'],'--acceptance',routeaccept['path']],'returncode':rc,'sentinel_calls':len(calls)})
 # Reuse of consumed positive enrollment must reject without reaching the sentinel.
 sys.argv=[str(NEW/'entry.py'),str(p)]
 try:entry.main();ok=False;kind='accepted'
 except FileExistsError as e:ok=True;kind=type(e).__name__
 rows.append({'test':'same-enrollment-not-replayed','pass':ok and len(calls)==1,'result':kind})
 # Binding disagreement in the original response cap must reject before enrollment/native.
 plan['enrollment_path']=str(FIX/'OFFLINE-second.enrollment.json');plan['runtime_argv'][plan['runtime_argv'].index('--max-responses')+1]='13';put('OFFLINE-plan.json',plan);sys.argv=[str(NEW/'entry.py'),str(p)]
 try:entry.main();ok=False;kind='accepted'
 except ValueError as e:ok=True;kind=type(e).__name__
 rows.append({'test':'native-response-cap-drift-denied-before-sentinel','pass':ok and len(calls)==1,'result':kind})
finally:
 os.getppid=oldppid;Path.read_text=oldread;entry.runpy.run_path=oldrun;sys.argv=oldargv
 if oldenv is None:os.environ.pop('PM_BOUND_DEADLINE_NS',None)
 else:os.environ['PM_BOUND_DEADLINE_NS']=oldenv
report={'schema':'er8.independent.entry-metadata.v1','source_sha256':hashlib.sha256((NEW/'entry.py').read_bytes()).hexdigest(),'native_calls':0,'provider_calls':0,'actual_private_reads':0,'proof_scope':'source-authenticated offline host binding with fake PID1/cgroup and sentinel; never actual native qualification','all_pass':all(r['pass'] for r in rows),'rows':rows}
(BASE/'checker-entry-metadata-results.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
