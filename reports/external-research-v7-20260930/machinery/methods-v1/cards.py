#!/usr/bin/env python3
"""Prospective experiment cards. Preparation only: no model dispatch and no answer facts."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
LAB = HERE.parent


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def write(path, value):
    Path(path).write_text(json.dumps(value, indent=2) + '\n')


COMMON = ('Deliver a standalone current report with complete independent finding identities, '
          'exact evidence locators and source versions, applicability/transfer limits, plan implications '
          'where a plan is admitted, unresolved areas and proposed validation labeled UNEXECUTED. '
          'Also write acquisition.json recording selected source URLs/versions, queries/reads and '
          'finding-to-source links; do not invent access or execution evidence. Source choice and '
          'interpretation are your own. A failed search proves only that search result, not absence.')

POLICIES = {
    'T08': {
        'control': 'Use your ordinary general discovery schedule. Select useful external sources and '
                   'deepen promising leads as you judge appropriate. Record your actual search/read '
                   'sequence and areas left unvisited in scheduling.json.',
        'treatment': 'Before searching, derive the relevant problem families from the admitted brief '
                     'alone and write them in scheduling.json. Protect initial exploration: within '
                     'the first half of your elapsed budget, give EVERY relevant family at least one '
                     'legitimate external query and one available primary-source inspection before '
                     'deepening favored leads. Record unavailable/dead-end families rather than '
                     'removing them. Then adapt depth toward useful leads, preserving unresolved and '
                     'unvisited status. Record query/read sequence and coverage; families are not '
                     'claims that an external capability exists.'},
    'T09': {
        'control': 'Research direct competitors and best practices using an ordinary generic product '
                   'research approach. Select sources independently; record actual query/read sequence '
                   'and unresolved opportunities in scheduling.json.',
        'treatment': 'Derive research questions from promises and assumptions in the brief before '
                     'searching. Probe missing/malformed/versioned/reordered inputs, recovery, size '
                     'and latency constraints, plus simpler alternatives and positive improvement '
                     'opportunities. Choose actual sources yourself; questions are hypotheses, not '
                     'facts. Record question-to-query-to-evidence links and dead ends in scheduling.json.'},
    'T10': {
        'control': 'Search primarily for whole-product competitors; inspect implementation evidence '
                   'where available. Select sources yourself and record search sequence, selection '
                   'reasons and unresolved areas in scheduling.json.',
        'treatment': 'Search both whole-product competitors and projects with analogous components. '
                     'Derive component questions from the brief; choose diverse implementations '
                     'yourself. Inspect primary implementation evidence and state concrete transfer '
                     'reasons and limits; reject irrelevant analogy. Record source selection and '
                     'query/read sequence in scheduling.json.'},
}


def admitted(case, mode):
    """Explicit allowlist; never glob the case for private keys or assessment material."""
    case = Path(case).resolve()
    names = ['brief.md'] if mode == 'brief-only' else ['brief.md', 'TASK.md', 'catalog.json']
    if mode != 'brief-only':
        catalog = json.loads((case / 'catalog.json').read_text())
        names += [s.get('file', s.get('path')) for s in catalog.get('sources', [])]
        # A plan is visible only when explicitly named in the safe export manifest.
        for p in sorted((case / 'plan').glob('*.md')) if (case / 'plan').exists() else []:
            names.append(str(p.relative_to(case)))
    result = []
    for name in names:
        if not name:
            raise ValueError('missing source path in safe catalog')
        p = Path(name)
        if p.is_absolute() or '..' in p.parts:
            raise ValueError('unsafe export path')
        source = case / p
        if source.is_symlink() or not source.is_file():
            raise ValueError(f'not a regular admitted export: {source}')
        result.append({'source': str(source), 'target': str(p), 'sha256': sha(source)})
    return result


def base_spec(method, arm, family, case, pair, inputs, seconds=900, responses=96):
    discovery = method in ('T08', 'T09', 'T10')
    return {
        'job_id': f'{pair}-{arm}', 'method': method, 'arm': arm, 'family': family,
        'case_id': Path(case).name,
        'scope': 'Entire admitted product brief; independently discover useful external unknowns.'
                 if discovery else 'Entire admitted case assignment and source corpus.',
        'inputs': [{'source': x['source'], 'target': x['target']} for x in inputs],
        'admitted_inputs': [{'source': x['source'], 'sha256': x['sha256']} for x in inputs],
        'caps': {'seconds': seconds, 'responses': responses},
        'output_files': ['report.md', 'acquisition.json'] + (['scheduling.json'] if discovery else []),
        'source_access': 'Public external search and read-only primary-source/repository inspection; '
                         'no supplied external source list. Local access only the isolated workspace.'
                         if discovery else 'Only admitted frozen source captures; no live external fetching.',
        'plan_visibility': 'Plan-blind: only brief.md is admitted; no plan/spec/key/history.'
                           if discovery else 'Admitted thin plan visible; no evaluator keys or historical outputs.',
        'evaluation_obligations': 'All material claims, full assigned scope including unvisited/dead-end '
                                  'areas, unsupported assertions, false dismissals, conditions, source '
                                  'fit, novelty, complete elapsed and usage costs.',
        'zcode_tools': ['Read', 'Write', 'Bash'] if not discovery else ['Read', 'Write', 'Bash', 'WebFetch', 'WebSearch'],
    }


def prep_module():
    p = LAB / 'dev/harness-v1/workspaces.py'
    module_spec = importlib.util.spec_from_file_location('er7_workspaces', p)
    module = importlib.util.module_from_spec(module_spec)
    module_spec.loader.exec_module(module)
    return module


def prepare_discovery(method, family, case, pair_id, destination, seconds=900, responses=96):
    if method not in POLICIES:
        raise ValueError('unsupported discovery method')
    dest = Path(destination).resolve()
    dest.mkdir(parents=True, exist_ok=False)
    inputs = admitted(case, 'brief-only')
    specs = []
    for arm in ('control', 'treatment'):
        s = base_spec(method, arm, family, case, pair_id, inputs, seconds, responses)
        s['method_instruction'] = POLICIES[method][arm] + ' ' + COMMON
        write(dest / f'{arm}.spec.json', s)
        specs.append(s)
    card = {
        'schema': 'er7.method_pair.v1', 'pair_id': pair_id, 'method': method,
        'status': 'prepared-not-reviewed-not-started', 'case_id': Path(case).name,
        'family': family, 'applicability': 'Brief-only independent source discovery; policy is the named variable.',
        'changed_variables': ['Research scheduling/query/source-selection policy only.'],
        'held_fixed': ['Exact brief bytes', 'Source access', 'Plan blindness', 'Model/front end/effort',
                       'Elapsed/response caps', 'Output/evaluation obligations'],
        'caps_per_arm': specs[0]['caps'], 'source_unique_bytes': sum(Path(x['source']).stat().st_size for x in inputs),
        'input_sha256': {x['target']: x['sha256'] for x in inputs},
        'order': 'control/treatment prepared together; operator records actual randomized order/load',
        'versions': {'cards.py': sha(HERE / 'cards.py')},
        'review_required': 'Independent review_gate before launch; no semantic case answers supplied.',
        'attempts': [],
    }
    for s in specs:
        attempt = dest / s['arm']
        prep_module().prepare(s, attempt)
        card['attempts'].append({'job_id': s['job_id'], 'arm': s['arm'], 'attempt': str(attempt),
                                 'spec': str(dest / f'{s["arm"]}.spec.json')})
    write(dest / 'pair.json', card)
    return card


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--method', choices=POLICIES, required=True)
    p.add_argument('--family', choices=['M', 'Z', 'L'], required=True)
    p.add_argument('--case', type=Path, required=True)
    p.add_argument('--pair-id', required=True)
    p.add_argument('--destination', type=Path, required=True)
    p.add_argument('--seconds', type=int, default=900)
    p.add_argument('--responses', type=int, default=96)
    a = p.parse_args()
    print(json.dumps(prepare_discovery(a.method, a.family, a.case, a.pair_id, a.destination,
                                       a.seconds, a.responses), indent=2))


if __name__ == '__main__':
    main()
