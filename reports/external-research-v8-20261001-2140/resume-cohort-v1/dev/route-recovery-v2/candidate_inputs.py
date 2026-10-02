"""Assigned prospective host paths. Nothing here is mounted as candidate input."""
import json
from pathlib import Path

HERE=Path(__file__).resolve().parent

def case_ids():
    return set(json.loads((HERE/'INPUT_MAP.json').read_text())['cases'])

def case_record(case,selection=None):
    item=(selection if selection is not None else json.loads((HERE/'INPUT_MAP.json').read_text())['cases']).get(case)
    if not item: raise ValueError('unreserved case source map')
    manifest=Path(item['manifest']);root=Path(item['root']);directory=Path(item['case_dir'])
    campaign=HERE.parents[1]
    if not root.is_relative_to(campaign/'cases') or any(t in str(manifest) for t in ('scoring-only','evaluation-scope')): raise ValueError('candidate source roots only')
    if not manifest.is_absolute() or manifest.parent!=directory or not directory.is_relative_to(root) or any(q.is_symlink() for q in (manifest,*manifest.parents)): raise ValueError('unaliased assigned sources required')
    value=json.loads(manifest.read_text())
    if value.get('case_id')!=case: raise ValueError('assigned case mismatch')
    for name in ('brief','thin_plan','source_access'):
        p=Path(value[name])
        if p.is_absolute() or '..' in p.parts: raise ValueError('assigned source alias')
    for stage in value['stages']:
        p=Path(stage['task_template'])
        if p.is_absolute() or '..' in p.parts: raise ValueError('assigned template alias')
    return item

def required_files(case,selection=None):
    item=case_record(case,selection);root=Path(item['root']);directory=Path(item['case_dir'])
    manifest=Path(item['manifest']);value=json.loads(manifest.read_text())
    return [HERE/'INPUT_MAP.json',Path(item['objectives']),manifest,
            root/value['brief'],root/value['thin_plan'],root/value['source_access'],
            directory/'METHOD.md',directory/'TASK.md',
            *(root[s['task_template']] for s in value['stages'])]

def source_access(case,selection=None):
    item=case_record(case,selection);value=json.loads(Path(item['manifest']).read_text())
    return Path(item['root'])/value['source_access']
