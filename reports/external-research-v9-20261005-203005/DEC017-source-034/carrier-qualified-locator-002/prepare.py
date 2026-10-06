"""Additive exact carrier-qualification locator version; no native interfaces."""
from pathlib import Path
import copy,json,sys,importlib.util,hashlib
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parent
OLD=ROOT.parent
sys.path.insert(0,str(OLD))
import source_builder as owner
p=owner.p

def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
old_locator=load('old_locator',OLD/'locator.py')
qualified_locator=load('qualified_locator',ROOT/'locator.py')

def moved(value):
    if not isinstance(value,str):return value
    for sub in ['existing','four-finals']:
        prefix=str(OLD/sub)+'/'
        if value.startswith(prefix) and '/operator-profile/' not in value:return str(ROOT/sub)+'/'+value[len(prefix):]
    if value==str(OLD/'ALL_SOURCE_CLOSURE.json'):return str(ROOT/'ALL_SOURCE_CLOSURE.json')
    return value

def remap(obj):
    if isinstance(obj,list):return [remap(v) for v in obj]
    if isinstance(obj,dict):return {moved(k):remap(v) for k,v in obj.items()}
    return moved(obj)

def refresh(obj):
    if isinstance(obj,list):return [refresh(v) for v in obj]
    if not isinstance(obj,dict):return obj
    obj={k:refresh(v) for k,v in obj.items()}
    if 'path' in obj and 'sha256' in obj and str(obj['path']).startswith(str(ROOT)+'/') and Path(obj['path']).is_file():obj['sha256']=p.sha(obj['path'])
    for pathkey,shakey in [('stage_json','stage_sha256'),('card_path','card_sha256'),('prompt_file','prompt_sha256')]:
        if pathkey in obj and shakey in obj and str(obj[pathkey]).startswith(str(ROOT)+'/') and Path(obj[pathkey]).is_file():obj[shakey]=p.sha(obj[pathkey])
    return obj

def prepare():
    source=p.checked(p.ref(OLD/'SOURCE_PIN.json'))
    for relative,digest in source['files'].items():
        if p.sha(OLD/relative)!=digest:raise ValueError('Initial frozen source changed')
    for sub in ['existing','four-finals']:
        for path in sorted((OLD/sub).rglob('*')):
            if not path.is_file() or 'operator-profile' in path.parts:continue
            dest=ROOT/path.relative_to(OLD);dest.parent.mkdir(parents=True,exist_ok=True)
            raw=path.read_bytes()
            if path.name=='TASK.md':
                if raw.count(old_locator.render())!=1:raise ValueError('Exact original locator required once')
                raw=raw.replace(old_locator.render(),qualified_locator.render())
            if path.suffix=='.json' and 'workspace' not in path.parts:
                obj=remap(json.loads(raw))
                if path.name=='prepared-stage.json':
                    obj['own_prior_locator_ref']=p.ref(ROOT/'locator.py')
                    obj['own_prior_navigation_source_version']='DEC017-prospective-own-prior-index-v2-carrier-qualified-locator'
                    obj['carrier_qualified_locator_original_v1_source_ref']=p.ref(path)
                    obj['glm_resource']['bundle_profile']=json.loads(raw)['glm_resource'].get('bundle_profile')
                raw=(json.dumps(obj,indent=2,sort_keys=True)+'\n').encode()
            with dest.open('xb') as handle:handle.write(raw)
    p.put(ROOT/'ALL_SOURCE_CLOSURE.json',remap(p.checked(p.ref(OLD/'ALL_SOURCE_CLOSURE.json'))))
    box=remap(p.checked(p.ref(OLD/'OUTBOX.json')))
    box['source_locator_ref']=p.ref(ROOT/'locator.py')
    box.pop('tool_schema_permissions_and_INLINE_ONLY_unchanged',None)
    box['tool_schema_permissions_and_original_carrier_adoption_semantics_unchanged']=True
    box['carrier_qualified_locator_initial_source_pin']=p.ref(OLD/'SOURCE_PIN.json')
    box['existing_B_populated_or_empty_only_as_originally_authenticated']=True
    box['four_new_finals_explicit_INLINE_ONLY_empty']=True
    p.put(ROOT/'OUTBOX.json',box)
    paths=sorted(path for path in ROOT.rglob('*.json') if 'workspace' not in path.parts)
    for unused in range(8):
        changed=False
        for path in paths:
            before=path.read_bytes();after=(json.dumps(refresh(json.loads(before)),indent=2,sort_keys=True)+'\n').encode()
            if before!=after:path.write_bytes(after);changed=True
        if not changed:break
    if changed:raise ValueError('Reference closure did not stabilize')
    return p.ref(ROOT/'OUTBOX.json')

if __name__=='__main__':print(json.dumps(prepare()))
