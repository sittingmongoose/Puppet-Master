#!/usr/bin/env python3
"""Read-only mechanical verification; no prepare, runtime freezes, tools or inference."""
from pathlib import Path
import ast, hashlib, json, types
H=Path(__file__).resolve().parent
B=H.parent.parent
C=B/'role-cases-v2'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
load=lambda p:json.loads(p.read_text())
checks=[]
originals=load(H/'ORIGINAL_HASHES.json')
assert all(sha(Path(p))==v for p,v in originals.items())
assert all(sha(p)==sha(H/'baseline/role-v1'/p.relative_to(B/'helpers/role-v1')) for p in (B/'helpers/role-v1').rglob('*') if p.is_file())
checks.append('Original helper and all eight original fixture trees unchanged; baseline clone byte exact')
s=(H/'prepare-role.py').read_text(); old=(H/'baseline/role-v1/prepare-role.py').read_text()
compile(s,str(H/'prepare-role.py'),'exec')
m=types.ModuleType('role_v2'); exec(compile(s,str(H/'prepare-role.py'),'exec'),m.__dict__)
a=ast.parse(old); z=ast.parse(s)
for name in [n.name for n in a.body if isinstance(n,ast.FunctionDef) and n.name!='prepare']:
    before=next(n for n in a.body if isinstance(n,ast.FunctionDef) and n.name==name)
    after=next(n for n in z.body if isinstance(n,ast.FunctionDef) and n.name==name)
    assert ast.dump(before)==ast.dump(after),name
assert m.ROUTES=={'codex_authorized':{'providerInstanceId':'AUTHORIZED_PROVIDER_INSTANCE','model':'gpt-6-luna','options':{'reasoningEffort':'max','serviceTier':'priority'}},'muse_code':{'providerInstanceId':'AUTHORIZED_PROVIDER_INSTANCE','model':'muse-spark-1.3-contributor','options':{'reasoningEffort':'max'}},'AUTHORIZED_PROVIDER_INSTANCE':{'providerInstanceId':'AUTHORIZED_PROVIDER_INSTANCE','model':'builtin:zai-coding-plan\\GLM-5.3-Flash','options':{'mode':'yolo','thought':'max'}}}
checks.append('All functions except leaf preparation unchanged, including CLI, validation, retry verification and recording; route catalog unchanged')
prep_old=next(n for n in a.body if isinstance(n,ast.FunctionDef) and n.name=='prepare')
prep_new=next(n for n in z.body if isinstance(n,ast.FunctionDef) and n.name=='prepare')
def core(n):
    body=[]
    for v in n.body:
        if isinstance(v,ast.Assign) and any(isinstance(t,ast.Name) and t.id in {'wrapper','task','request_id'} for t in v.targets): continue
        if isinstance(v,ast.Expr) and isinstance(v.value,ast.Call) and isinstance(v.value.func,ast.Name) and v.value.func.id=='put_json' and 'protocol' in ast.unparse(v):
            text=ast.unparse(v).replace('role-v2; native Goal activation required before inference; advisory leaf controls','role-v1; advisory leaf controls')
            body.append(ast.dump(ast.parse(text).body[0])); continue
        body.append(ast.dump(v))
    return body
assert core(prep_old)==core(prep_new)
assert "request_id = f'er12-{slot}-{arm}-role-v2'" in s
assert 'exact unsupported diagnostic' in s and 'Never start a provider CLI, model or session in shell' in s
assert 'Before reading the common assignment/corpus or making any source/case inference, activate exactly ONE actual exposed native Goal' in s
checks.append('Preparation core unchanged outside wrapper/task/key/protocol; fixed 900/600/300 and immutable freezing mechanics retained')
index=load(C/'index.json'); r=load(B/'mechanics/REALLOCATIONS-v1.json'); pairs=[]; keys=[]
assert [x['slot_id'] for x in index['slots']]==['B-DISC-M-02','B-DISC-G-01','B-DISC-G-02','B-APPL-M-02','B-APPL-G-02','B-FINAL-M-01','B-FINAL-M-02','B-FINAL-G-02']
for row in index['slots']:
    slot=row['slot_id']; p=C/slot/'fixture.json'; f=load(p); orig=load(B/'role-cases'/slot/'fixture.json')
    expected=json.loads(json.dumps(orig))
    if slot in r['slots']:
        expected['treatment']['provider']='muse_code'; expected['prospective_reallocation']=f['prospective_reallocation']
        ref=f['prospective_reallocation']; assert ref['path']==str(B/'mechanics/REALLOCATIONS-v1.json') and ref['sha256']==sha(Path(ref['path'])) and ref['slot_id']==slot and ref['before_inference'] is True
    assert f==expected
    assert row['fixture']==str(p) and row['fixture_sha256']==sha(p)
    assert row['original_fixture_sha256']==sha(B/'role-cases'/slot/'fixture.json')
    assert f['status']=='READY_FROZEN_NOT_DISPATCHED'
    assert f['input_files']==orig['input_files'] and f['input_sha256']==orig['input_sha256']
    for q in (B/'role-cases'/slot).rglob('*'):
        if q.is_file() and q.name!='fixture.json': assert q.read_bytes()==(C/slot/q.relative_to(B/'role-cases'/slot)).read_bytes()
    identities=[]
    routes=[]
    for arm in ['control','treatment']:
        checked, files, target=m.validate_fixture(p,slot,arm)
        identities.append([(str(rel),digest) for rel,_,digest in files])
        routes.append(target)
        keys.append(f'er12-{slot}-{arm}-role-v2')
    assert identities[0]==identities[1]
    assert routes==[m.ROUTES['codex_authorized'],m.ROUTES['muse_code']]
    pairs.append({'slot_id':slot,'common_input_identity_equal':True,'input_sha256':f['input_sha256'],'individual_hashes_verified':True,'routes':routes,'native_goal_contract':'same shared helper contract for control and treatment'})
assert len(set(keys))==16
checks.append('All eight pair input identities equal, all original assignments/corpora/filehashes exact, sixteen routes authorized, sixteen unique v2 request keys')
for root in [H,C]:
    assert not any(p.name in {'freeze.json','request.json','dispatch.json','deadline.json'} for p in root.rglob('*'))
assert index['runtime_prepared'] is False and index['deadlines_created'] is False and index['inference_performed'] is False
checks.append('No runtime freezes, requests, deadlines, dispatches or science outputs created')
print(json.dumps({'schema':'er12-role-v2-mechanical-checks','passed':True,'checks':checks,'pairs':pairs,'request_keys':keys,'verification_kind':'syntax, read-only input validation and AST comparison; no runtime/deadline creation','inference_performed':False,'dispatch_performed':False},indent=2))
