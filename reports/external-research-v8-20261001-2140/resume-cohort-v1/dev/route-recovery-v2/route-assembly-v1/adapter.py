"""Operator-only packing/export. Birth is required before any actual setup."""
import hashlib
import json
from pathlib import Path
import shutil
import time
import re
import importlib.util

HERE=Path(__file__).resolve().parent
PLANNING=HERE.parents[2]/'cases/planning-v1'

def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def normalized(text): return text.replace('input/','inputs/')

def pack_stage(*,case_id,reservation_id,workspace,prompt_file,case_birth_ns,stage_birth_ns,
               prior_artifacts=None,prior_capture_store=None,assigned_sources=None):
    # The caller creates and freezes original authority/counters before this
    # function. No prospective template preparation is claimed as case work.
    now=time.monotonic_ns()
    if type(case_birth_ns) is not int or type(stage_birth_ns) is not int or not 0<case_birth_ns<=stage_birth_ns<=now:
        raise ValueError('original pre-preparation case and stage birth required')
    spec=importlib.util.spec_from_file_location('assigned_inputs',HERE.parent/'candidate_inputs.py')
    inputs=importlib.util.module_from_spec(spec);spec.loader.exec_module(inputs)
    selected=inputs.case_record(case_id,assigned_sources)
    planning=Path(selected['root']);case_dir=Path(selected['case_dir'])
    manifest=json.loads(Path(selected['manifest']).read_text())
    stages=[s for s in manifest['stages'] if s['reservation_id']==reservation_id]
    if len(stages)!=1: raise ValueError('exact reserved stage required')
    stage=stages[0]
    ws=Path(workspace); prompt=Path(prompt_file)
    if not ws.is_absolute() or not prompt.is_absolute() or ws.exists() or prompt.exists(): raise ValueError('fresh absolute operator paths required')
    sources={'BRIEF.md':planning/manifest['brief'],'THIN_PLAN.md':planning/manifest['thin_plan'],
             'METHOD.md':case_dir/'METHOD.md','TASK.md':planning/stage['task_template']}
    objective_source=json.loads((Path(selected['objectives'])).read_text())['objectives'][reservation_id]['objective']
    task_source=(case_dir/'TASK.md').read_text()+'\n\n'+sources['TASK.md'].read_text()
    ws.mkdir(parents=True,mode=0o700); (ws/'inputs').mkdir(mode=0o700); (ws/'out').mkdir(mode=0o700)
    changes=[]
    for name,path in sources.items():
        text=task_source if name=='TASK.md' else path.read_text()
        adapted=normalized(text); target=ws/'inputs'/name
        target.write_text(adapted)
        changes.append({'source_path':str(path),'source_sha256':sha(path),'target_path':str(target),
                        'target_sha256':sha(target),'path_delta':'input/ -> inputs/' if adapted!=text else 'none'})
    (ws/'TASK.md').write_text(normalized(task_source))
    prompt.parent.mkdir(parents=True,exist_ok=True)
    prompt.write_text(normalized(objective_source)+'\n')
    allowed={'PROPOSAL.md','CRITIQUE.md','UNRESOLVED_LEADS.md'}
    for name,record in (prior_artifacts or {}).items():
        if name not in allowed or set(record)!={'path','sha256','case_id'} or record['case_id']!=case_id:
            raise ValueError('same-case current artifact only')
        source=Path(record['path'])
        if source.is_symlink() or sha(source)!=record['sha256']: raise ValueError('frozen same-case artifact drift')
        shutil.copyfile(source,ws/'inputs'/name)
    if prior_capture_store is not None:
        if set(prior_capture_store)!={'case_id','workspace','files'} or prior_capture_store['case_id']!=case_id: raise ValueError('same-case capture store only')
        previous_workspace=Path(prior_capture_store['workspace'])
        store=ws/'public_captures'; store.mkdir(mode=0o700)
        for record in prior_capture_store['files']:
            source=Path(record['path'])
            if not source.is_absolute() or source.parent!=previous_workspace/'public_captures' or any(p.is_symlink() for p in (source,*source.parents)) or re.fullmatch(r'(?:[0-9a-f]{64}\.body|[0-9a-f]{32}\.json)',source.name) is None or sha(source)!=record['sha256']: raise ValueError('same-case capture drift')
            shutil.copyfile(source,store/source.name)
    immutable={str(p):sha(p) for p in [ws/'TASK.md',*(ws/'inputs').rglob('*')] if p.is_file()}
    return {'immutable_inputs':immutable,'prompt_sha256':sha(prompt),'normalized_input_receipts':changes,
            'normalization_authority':'root prospective input/ to inputs/ path-only authorization',
            'case_start_monotonic_ns':case_birth_ns,'stage_start_monotonic_ns':stage_birth_ns,
            'pack_complete_monotonic_ns':time.monotonic_ns()}

def export_manifest(workspace,case_id):
    """Hash only declared candidate artifacts and admitted public source stores."""
    ws=Path(workspace)
    allowed={'PROPOSAL.md','CRITIQUE.md','FINAL_PROPOSAL.md','UNRESOLVED_LEADS.md','RESULT.md'}
    artifacts=[]; captures=[]
    for p in sorted((ws/'out').glob('*')):
        if p.is_symlink() or not p.is_file() or p.name not in allowed: continue
        artifacts.append({'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)})
    for p in sorted((ws/'public_captures').glob('*')):
        if p.is_symlink() or not p.is_file() or p.suffix not in ('.body','.json'): raise ValueError('unsafe capture export')
        captures.append({'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)})
    operations=ws/'operation_receipts/events.jsonl'
    return {'schema':'er8.route.artifact-export.v1','case_id':case_id,'artifacts':artifacts,
            'same_case_capture_store':{'case_id':case_id,'workspace':str(ws),'files':captures},
            'operation_receipts':{'path':str(operations),'sha256':sha(operations)} if operations.is_file() and not operations.is_symlink() else None,
            'native_raw_paths_exported':False}
