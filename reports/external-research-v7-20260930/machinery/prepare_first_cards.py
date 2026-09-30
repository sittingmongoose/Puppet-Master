#!/usr/bin/env python3
"""Prospective equal-obligation T02 M / T06 Z screens; source bytes, never keys."""
import json
from pathlib import Path
from workspaces import prepare, sha, write_json
from source_index import build

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
CASE = ROOT / 'evaluation/exports/ome-normative-dev-v1'
CARDS = HERE / 'cards'


def main():
    CARDS.mkdir(exist_ok=True)
    pins = json.loads((CASE / 'MANIFEST.sha256.json').read_text())
    names = ['TASK.md', 'brief.md', 'plan/Viewer.md', 'sources/S003.txt', 'catalog.json']
    for name in names:
        if sha(CASE / name) != pins[name]:
            raise ValueError('candidate-safe source export changed: ' + name)
    index_path = CARDS / 'S003-index.json'
    if not index_path.exists():
        write_json(index_path, build(CASE / 'sources'))
    common = {'case_id': 'ome-normative-dev-v1', 'kind': 'component',
              'scope': 'Whole product brief within fixed normative capture S003; both brief-derived assignment groups together.',
              'inputs': [{'source': str(CASE / name), 'target': name} for name in names],
              'admitted_inputs': [{'source': str(CASE / name), 'sha256': pins[name]} for name in names],
              'caps': {'seconds': 900, 'responses': 96}, 'output_files': ['report.md'],
              'source_access': 'Fixed admitted S003 local capture only; no live fetch, historical reports, keys or other sources.',
              'plan_visibility': 'Thin synthetic plan inputs/plan/Viewer.md and product brief inputs/brief.md available throughout.',
              'evaluation_obligations': 'Deliver complete current source-supported findings, conditions, source line citations, plan implications/dispositions, unsupported-input limitations, counterevidence, uncertainty and unresolved areas for the whole brief. Distinguish obligations, optional capabilities and product decisions. Proposed validation stays UNEXECUTED unless execution was authorized and performed.',
              'candidate_instructions': 'Follow inputs/TASK.md for the full research assignment. Write standalone out/report.md and perform your own flash internal checking/correction before completing the Goal. No structural or semantic feedback is provided by the host during this screen.',
              'feedback_contract': 'No host semantic feedback; candidate self-correction inside original Goal only.',
              'tool_surface_variable': False,
              'zcode_tools': ['Read', 'Write', 'Edit', 'Grep', 'Glob']}
    pairs = []
    for method, family in [('T02', 'M'), ('T06', 'Z')]:
        jobs = []
        for arm in ['control', 'treatment']:
            spec = json.loads(json.dumps(common))
            spec.update(job_id=f'{method.lower()}-{family.lower()}-ome-dev1-{arm}-r1', method=method, family=family, arm=arm)
            if method == 'T02':
                spec['method_instruction'] = ('Use the inline functional research assignment, brief and thin plan below as initial context; read complete admitted S003 as needed.' if arm == 'control' else
                                              'Use this compact capsule and read the exact assignment, brief and thin plan from inputs/TASK.md, inputs/brief.md and inputs/plan/Viewer.md on demand; read complete admitted S003 as needed.')
                if arm == 'control':
                    spec['inline_context'] = '\n\n'.join(f'--- {name} ---\n' + (CASE / name).read_text() for name in ['TASK.md', 'brief.md', 'plan/Viewer.md'])
            else:
                spec['method_instruction'] = ('Read the complete inputs/sources/S003.txt before researching implications; ordinary complete-source navigation thereafter.' if arm == 'control' else
                                              'Start from inputs/S003-index.json and questions derived from the whole brief. Progressively read indexed sections from inputs/sources/S003.txt, expanding to governing headings, surrounding conditions and counterevidence. The entire source is available and must be expanded whenever needed; the index cannot prove absence or applicability.')
                if arm == 'treatment':
                    spec['inputs'].append({'source': str(index_path), 'target': 'S003-index.json'})
                    spec['admitted_inputs'].append({'source': str(index_path), 'sha256': sha(index_path)})
            path = CARDS / (spec['job_id'] + '.json')
            write_json(path, spec)
            jobs.append({'job_id': spec['job_id'], 'spec': str(path), 'attempt': str(ROOT / 'attempts' / spec['job_id'])})
        pairs.append({'method': method, 'family': family, 'comparison_stage': 'first development screen',
                      'caps_equal': True, 'changed_variables': 'inline functional context versus compact handles; tool surface held fixed' if method == 'T02' else 'full initial read versus deterministic numbered-heading index with progressive expansion',
                      'order': 'control,treatment simultaneously if both slots free; record account load',
                      'semantic_feedback': 'none', 'jobs': jobs, 'status': 'cards-ready-launch-held-for-independent-code-review'})
    write_json(CARDS / 'FIRST_READY.json', {'schema': 'er7.ready_pairs.v1', 'pairs': pairs})
    print(json.dumps({'ready': str(CARDS / 'FIRST_READY.json'), 'source_lines': 896,
                      'index_locators': len(build(CASE / 'sources')['files'][0]['locators']), 'candidate_started': False}))


if __name__ == '__main__':
    main()
