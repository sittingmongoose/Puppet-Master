#!/usr/bin/env python3
"""Author a separate W1 physical successor, before imports or owner births.

Never edits a predecessor, changes a source class at runtime, substitutes a
private issuer map, or relabels a predecessor birth. No native certification.
"""
from __future__ import annotations
import argparse
import ast
import hashlib
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
PREDECESSOR = Path('/home/sittingmongoose/PM-Experiments/c3-w12-p2-20261105/approved-agent-source.v2.3')
PREDECESSOR_SHA = 'e22c3bee94c37a6853c61d1b18a0a2eb631174160ddbe38644ad2ada6dc53273'
DEST = Path('/home/sittingmongoose/PM-Experiments/c3-w12a-p2-20261105/physical-source.v3.11')
SELECTION = ROOT/'Plans/goal_own_c_contracts/w12a-successor-v3/selection.json'


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def replace(text, old, new, count=1):
    assert text.count(old) == count, (old[:100], text.count(old), count)
    return text.replace(old, new)


def physical_calls(text):
    """Change physical row sites only. Every semantic raw/h recipe stays exact."""
    tree = ast.parse(text)
    patches = []
    lines = text.splitlines(keepends=True)
    offsets = [0]
    for line in lines: offsets.append(offsets[-1]+len(line))
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call) or not isinstance(node.func, ast.Attribute): continue
        f = node.func
        if not isinstance(f.value, ast.Name) or f.value.id != 'U': continue
        physical = f.attr == 'decode'
        if f.attr == 'raw' and node.args:
            value = node.args[0]
            physical = (isinstance(value, ast.Dict) and any(isinstance(k, ast.Constant) and k.value == 'schema_id' for k in value.keys)) or (isinstance(value, ast.Call) and ((isinstance(value.func, ast.Name) and value.func.id == 'dict' and any(k.arg == 'schema_id' for k in value.keywords)) or (isinstance(value.func, ast.Attribute) and isinstance(value.func.value, ast.Name) and value.func.value.id == 'U' and value.func.attr == 'row')))
        if physical:
            start = offsets[f.lineno-1]+f.col_offset
            end = offsets[f.end_lineno-1]+f.end_col_offset
            patches.append((start,end,'U.stored_decode' if f.attr == 'decode' else 'U.stored_encode'))
    for start,end,value in sorted(patches, reverse=True): text = text[:start]+value+text[end:]
    return text, len(patches)


def author(destination=DEST):
    assert not destination.exists(), 'new successor destination must be absent'
    predecessor_raw = (PREDECESSOR/'manifest.json').read_bytes()
    assert sha(predecessor_raw) == PREDECESSOR_SHA
    predecessor = json.loads(predecessor_raw)
    for row in predecessor['files']:
        raw = (PREDECESSOR/row['path']).read_bytes()
        assert sha(raw) == row['sha256'] and len(raw) == row['bytes'], row['path']
    shutil.copytree(PREDECESSOR, destination, ignore=shutil.ignore_patterns('__pycache__'))
    (destination/'manifest.json').unlink()
    (destination/'w12a-v2.3-history-manifest.json').write_bytes(predecessor_raw)
    shutil.copyfile(ROOT/'scripts/pm_goal_own_c3_w12a_physical.py', destination/'physical_v3.py')
    shutil.copyfile(ROOT/'Plans/goal_own_c_contracts/w12a-successor-v3/physical.schema.json', destination/'physical-v3.schema.json')
    edits = []
    for name in ('goal_source.py','goal_command.py','shared_link.py','runtime/physical/source/model.py','runtime/physical/adapter.py'):
        p = destination/name
        text, count = physical_calls(p.read_text())
        if name == 'runtime/physical/source/model.py':
            text = replace(text, 'import goal_support as GS', 'import goal_support as GS\nimport physical_v3 as PC')
            text = replace(text, "expected_physical[(family,k)]=GS.raw(dict(schema_id=physical.family_schema_ids[family],schema_version='1.0.0',record=record))", "expected_physical[(family,k)]=PC.encode(dict(schema_id=physical.family_schema_ids[family],schema_version='1.0.0',record=record))")
            text = replace(text, "control_raw=C.A.encode(family,new_control);control_cell={'raw':control_raw}", "control_raw=C.A.encode(family,new_control);C.A.PC.stage(C.A.wrap(family,new_control));control_cell={'raw':control_raw}")
            text = replace(text, "raw=C.A.encode(family,body_record);cell={'raw':raw}", "raw=C.A.encode(family,body_record);C.A.PC.stage(C.A.wrap(family,body_record));cell={'raw':raw}")
        # Promotion follows each exact original atomic installation, under its
        # existing root. Pack bytes/index have already been synchronized.
        lines = text.splitlines(keepends=True)
        out = []
        for line in lines:
            out.append(line)
            if "=(prepared['cells'],prepared['issued']" in line or "physical._update_cells,physical._update_issued=prepared['cells'],prepared['issued']" in line or (line.lstrip().startswith('(self.canonical,') and "prepared['cells']" in line):
                indent = line[:len(line)-len(line.lstrip())]
                out.append(indent+"U.publish_stored(physical)\n")
        text = ''.join(out)
        if name == 'runtime/physical/adapter.py':
            text = replace(text, 'import goal_support as GS', 'import goal_support as GS\nimport physical_v3 as PC')
            text = replace(text, ' def read(self,family,key):\n', ' def read(self,family,key):\n  PC.bind(self)\n')
            text = replace(text, 'def encode(family,record):return M.encode(wrap(family,record))', 'def encode(family,record):return PC.encode(wrap(family,record))')
            a = text.index('def parse_canonical(raw):')
            b = text.index('\ndef dispatch(', a)
            text = text[:a]+"def parse_canonical(raw):return PC.decode(raw)\n"+text[b:]
            text = replace(text, "encoding='json_canonical'", "encoding='pm.goal.updated.physical.v3'")
            text = replace(text, "wrapper=parse_canonical(original_raw);GS.check(wrapper,'');record=wrapper['record']", "wrapper=json.loads(original_raw);GS.check(wrapper,'');record=wrapper['record']")
        p.write_text(text)
        edits.append(dict(path=name,physical_call_sites=count))
    p = destination/'goal_update_support.py'
    text = p.read_text()
    text = replace(text, 'from pathlib import Path', 'from pathlib import Path\nimport physical_v3 as PC')
    text = replace(text, "k=key(kind,record);b=raw(row(kind,record))", "k=key(kind,record);b=PC.stage(row(kind,record))")
    text += '''\n# Newly authored physical edition: do not use these for semantic hashes.
stored_encode=PC.encode
stored_decode=PC.decode

def publish_stored(physical):
 PC.bind(physical)
 PC.publish(physical,'body')
 PC.publish(physical,'update')
'''
    p.write_text(text)
    lineage = dict(status='NEWLY_AUTHORED_TEST_ONLY_PREPARED_WITHOUT_ADMISSION',
        event_type='goal.updated', source_package_edition='3.0', predecessor_manifest_sha256=PREDECESSOR_SHA,
        edits=edits, semantic_recipes='unchanged', native_execution='NOT_RUN')
    (destination/'W12A-SUCCESSOR-v3.json').write_text(json.dumps(lineage,indent=2)+'\n')
    rows = [dict(path=str(p.relative_to(destination)),bytes=p.stat().st_size,sha256=sha(p.read_bytes()))
            for p in sorted(destination.rglob('*')) if p.is_file()]
    manifest = dict(schema_id='pm.goal.updated.original_source_manifest.v3',**lineage,files=rows)
    raw = (json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode()
    (destination/'manifest.json').write_bytes(raw)
    selected = dict(schema_id='pm.goal.updated.original_source_selection.v3',**lineage,
        candidate_path=str(destination),manifest_sha256=sha(raw),members=len(rows),
        authoring_script='scripts/pm_goal_own_c3_w12a_successor.py',
        source_template='scripts/pm_goal_own_c3_w12a_physical.py',
        physical_schema='Plans/goal_own_c_contracts/w12a-successor-v3/physical.schema.json',
        predecessor_selection='Plans/goal_own_c_contracts/w12-successor-v2/approved-agent-source.v2.json',
        selection_rule='Every W12a p2 method verifies this whole manifest before imports. No ambient or predecessor fallback; fresh successor births only.',
        repository_support=[dict(path=name,sha256=sha((ROOT/name).read_bytes())) for name in (
            'scripts/pm_goal_own_c_oracles.py','scripts/pm_goal_oracle_common.py',
            'Plans/goal_own_c_contracts/contracts.schema.json',
            'scripts/pm_goal_own_c3_w12a_successor.py','scripts/pm_goal_own_c3_w12a_physical.py',
            'Plans/goal_own_c_contracts/w12a-successor-v3/physical.schema.json')])
    SELECTION.write_text(json.dumps(selected,indent=2)+'\n')
    return selected


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--destination', type=Path, default=DEST)
    args = parser.parse_args()
    print(json.dumps(author(args.destination),indent=2))
