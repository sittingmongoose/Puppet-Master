#!/usr/bin/env python3
"""Bound actual method mechanics into isolated attempt specs; never launch models."""
import argparse
import json
from pathlib import Path
import cards

HERE = Path(__file__).resolve().parent
MECHANICS = HERE / 'mechanics.py'
WHOLE = ('Write each complete finding version as one JSON file in out/versions/ named '
         '<id>.<version:04d>.json. Fields: id (stable alphanumeric/underscore/hyphen), '
         'version (consecutive integer from1), previous_sha256 (null for1, otherwise SHA256 '
         'of the exact preceding version file bytes), state (current|unresolved|rejected), '
         'body (complete standalone Markdown finding including conditions, source locators, '
         'implications, uncertainty and proposed validation), validation (optional list of '
         '{status:"UNEXECUTED",text:"UNEXECUTED ..."} or {status:"executed",text,execution_evidence}). '
         'Every revision is a WHOLE finding, not a patch; retain earlier files unchanged. '
         'Write complete versions atomically using a temporary file outside versions then rename. '
         'After research run: python3 inputs/mechanics.py render --source out/versions '
         '--report out/report.md --history out/history.json. Do not rewrite the rendered report. '
         'The host separately retains valid version snapshots during your Goal; this is not '
         'a native Write submission protocol or acknowledgement.')


def mechanic_input():
    return {'source': str(MECHANICS), 'target': 'mechanics.py', 'sha256': cards.sha(MECHANICS)}


def commit_pair(dest, pair_id, method, family, case, specs, variable, held, postprocess=None):
    dest = Path(dest).resolve()
    dest.mkdir(parents=True, exist_ok=False)
    attempts = []
    for i, s in enumerate(specs):
        label = s.get('assignment_id', s['arm'])
        cards.write(dest / f'{label}.spec.json', s)
        attempt = dest / label
        cards.prep_module().prepare(s, attempt)
        attempts.append({'job_id': s['job_id'], 'arm': s['arm'], 'assignment_id': label,
                         'attempt': str(attempt), 'spec': str(dest / f'{label}.spec.json')})
    inputs = {x['source']: x['sha256'] for s in specs for x in s['admitted_inputs']}
    card = {'schema': 'er7.method_pair.v1', 'pair_id': pair_id, 'method': method, 'family': family,
            'case_id': Path(case).name, 'status': 'prepared-not-reviewed-not-started',
            'changed_variables': variable, 'held_fixed': held, 'attempts': attempts,
            'caps': {s['job_id']: s['caps'] for s in specs},
            'input_sha256': inputs, 'versions': {'prepare_methods.py': cards.sha(__file__),
                                             'mechanics.py': cards.sha(MECHANICS),
                                             'cards.py': cards.sha(HERE / 'cards.py')},
            'unique_admitted_source_bytes': sum(Path(p).stat().st_size for p in inputs),
            'cumulative_admitted_bytes': sum(Path(x['source']).stat().st_size
                                             for s in specs for x in s['admitted_inputs']),
            'postprocess': postprocess, 'evaluation': 'Entire assigned scope and all claims; '
             'include unfinished assignments, candidate corrections, cold host work and all starts.',
            'review_required': 'Independent review_gate must accept exact versions before dispatch.'}
    cards.write(dest / 'pair.json', card)
    return card


def prepare(method, family, case, pair_id, dest, seed=None):
    inputs = cards.admitted(case, 'full')
    specs = []
    postprocess = None
    held = ['Exact unique admitted corpus bytes', 'Full assigned scope', 'Model/effort/source access',
            'Aggregate elapsed/response budget', 'Source-supported evaluation obligations']
    if method == 'T01':
        if Path(case).name != 'ome-normative-dev-v1':
            raise ValueError('T01 first topology is bound to OME safe brief-derived group scope')
        groups = [('opening', 'Opening a fileset, listing/selecting images, and navigating multiresolution data.'),
                  ('display', 'Channel/time/plane display, coordinate details, and associated label overlays.')]
        for gid, scope in groups:
            s = cards.base_spec(method, 'control', family, case, pair_id, inputs, 450, 48)
            s['job_id'] += '-' + gid
            s['assignment_id'] = 'control-' + gid
            s['scope'] = scope + ' Other group is independently assigned; use full source for qualifications.'
            s['method_instruction'] = 'Research your assigned brief group as a separate bounded assignment. ' + cards.COMMON
            s['topology'] = ('Control: two independent fresh Goals, opening and display; no shared answers. '
                            'Host concatenates both complete reports verbatim into aggregate delivery. '
                            'Every control assignment counts, including capped/uncompleted.')
            specs.append(s)
        s = cards.base_spec(method, 'treatment', family, case, pair_id, inputs, 900, 96)
        s['scope'] = 'Both complete brief groups: ' + ' '.join(g[1] for g in groups)
        s['method_instruction'] = ('Research both related brief groups as one coherent bounded task. '
                                 'Keep independent finding IDs and every governing exception. ') + cards.COMMON
        s['topology'] = ('Treatment: one fresh Goal covering both full groups; aggregate900s96 responses '
                        'equals control2x450s48. Unique source corpus fixed; repeated input bytes measured.')
        specs.append(s)
        variable = ['Two separate bounded assignments versus one coherent combined assignment.']
        postprocess = {'control': 'Concatenate opening/display report bodies verbatim; no semantic synthesis.',
                       'treatment': 'One current report; evaluate complete aggregate scope, not completion subset.'}
    elif method == 'T03':
        for arm in ('control', 'treatment'):
            binding = inputs + ([mechanic_input()] if arm == 'treatment' else [])
            s = cards.base_spec(method, arm, family, case, pair_id, binding)
            s['output_files'] += ['history.json'] if arm == 'treatment' else ['observations.md']
            s['method_instruction'] = ('Record whole observations in out/observations.md as research proceeds, '
                                      'then separately author the complete final report. Keep earlier observations '
                                      'for temporal evaluation. ' if arm == 'control' else WHOLE + ' ') + cards.COMMON
            if arm == 'treatment':
                s['output_files'] += ['versions_manifest.json']
                s['candidate_instructions'] = 'At completion write versions_manifest.json listing all version filenames and exact SHA256s.'
            specs.append(s)
        variable = ['Separately authored report versus whole versioned findings with exact deterministic render.']
        postprocess = {'treatment': 'Operator runs mechanics.retain watcher during Goal, retaining snapshots '
                       'outside candidate workspace; after quiescence checks no retained mutations and renderer '
                       'exactness. Current report graded before retained/history inspection.',
                       'watch_template': 'python3 mechanics.py retain --source ATTEMPT/workspace/out/versions '
                       '--retained ATTEMPT/retained-versions --watch-seconds 930 --stop-file ATTEMPT/stop-retention'}
    elif method == 'T07':
        # A controlled two-question set derived from the already safe OME brief groups.
        if Path(case).name != 'ome-normative-dev-v1':
            raise ValueError('T07 first source-cache trial bound to OME source S003')
        source = Path(case) / 'sources/S003.txt'
        deps_dir = HERE / 'bindings' / pair_id
        deps_dir.mkdir(parents=True, exist_ok=False)
        dep = {'source_sha256': cards.sha(source), 'source_version': 'capture:' + cards.sha(source),
               'permissions': 'public frozen export read-only', 'parser': 'mechanics.parse_source-v1',
               'settings': {'encoding': 'utf-8'}, 'applicability': 'entire Slide Scout brief, OME-Zarr0.5',
               'corpus_membership_sha256': cards.sha(Path(case) / 'catalog.json'),
               'negative_scope_sha256': cards.sha(Path(case) / 'TASK.md')}
        cards.write(deps_dir / 'source_dependency.json', dep)
        extra = [mechanic_input(), {'source': str(deps_dir / 'source_dependency.json'),
                                   'target': 'source_dependency.json', 'sha256': cards.sha(deps_dir / 'source_dependency.json')}]
        for arm in ('control', 'treatment'):
            s = cards.base_spec(method, arm, family, case, pair_id, inputs + extra)
            reuse = ' --reuse' if arm == 'treatment' else ''
            s['method_instruction'] = ('Answer two question scopes in order: Q1 opening/listing/selecting '
              'images and multiresolution navigation; Q2 channel/time/plane display, calibrated coordinates '
              'and label overlays. For EACH scope first actually run the exact acquisition command '
              '(replace Q with Q1 then Q2): python3 inputs/mechanics.py acquire '
              '--source inputs/sources/S003.txt --dependency inputs/source_dependency.json '
              '--cache out/source-cache --counters out/acquisition-counters.json '
              '--output out/source-views/Q.json' + reuse + '. Read that complete source view and '
              'interpret the question independently; no prior semantic answers or external source lists '
              'are cached. Do not bypass or edit the source acquisition counters. '
              'Local acquisition and parsing are the tested workload, not network downloads. ') + cards.COMMON
            s['output_files'] += ['acquisition-counters.json', 'source-views/Q1.json', 'source-views/Q2.json']
            specs.append(s)
        variable = ['Two fresh local acquisitions/parses versus one cold parse plus immutable warm source-view reuse.']
        postprocess = {'checks': 'Control exactly2local acquisitions2parses0hits; treatment1acquisition1parse1hit; '
                        'both network_fetches0. Include cold+warm acquisition cost, per-question candidate meaning '
                        'and all dependency misses. No claim of live-network savings.'}
    elif method in ('T13', 'T14'):
        if not seed:
            raise ValueError('candidate-authored frozen seed required; Sol seeds prohibited')
        seed = Path(seed).resolve()
        binding = inputs + [{'source': str(seed), 'target': 'candidate_seed.json', 'sha256': cards.sha(seed)}]
        if method == 'T13':
            binding.append(mechanic_input())
        for arm in ('control', 'treatment'):
            s = cards.base_spec(method, arm, family, case, pair_id, binding)
            s['scope'] = 'Independently verify all frozen candidate seed findings against admitted evidence and plan.'
            if method == 'T13':
                s['method_instruction'] = ('Verify every seed finding, then write the final research report '
                  'afresh; retain verifier reasons in verification.json. ' if arm == 'control' else
                  'Write out/decisions.json with decisions:[{id,input_sha256,decision,reason,replacement_body?}] '
                  'and optional additions:[{id,decision,body}]. input_sha256 is SHA256 of the exact seed '
                  'finding encoded with json.dumps(sort_keys=True,separators=(\",\",\":\")). '
                  'decision must be supported|qualified|rejected|unresolved. Supported retains original '
                  'whole body; qualified requires complete standalone replacement_body with all necessary '
                  'amendments; rejection must explain source evidence; uncertainty remains unresolved. '
                  'No default confirmation of omitted decisions. Run python3 inputs/mechanics.py amendments '
                  '--seed inputs/candidate_seed.json --decisions out/decisions.json --report out/report.md '
                  '--history out/history.json. Do not semantically rewrite rendered report. ') + cards.COMMON
                s['output_files'] += ['verification.json'] if arm == 'control' else ['decisions.json', 'history.json']
            else:
                s['method_instruction'] = ('Perform normal source-grounded verification and report all '
                  'finding dispositions and reasons. ' if arm == 'control' else
                  'Apply scoped counterevidence/search checks to EVERY absence assertion in finding '
                  'dispositions, reasons, replacements, additions and non-findings. For every negative '
                  'claim record exact corpus/version/section scope, queries/reads, counterevidence and '
                  'limits in negative-checks.json. A searched field or failed keyword match cannot '
                  'justify corpus-wide denial; insufficient evidence leaves the dispute unresolved. '
                  'Distinguish missing-input behavior from absence-of-source evidence; preserve valid '
                  'unsupported-input validation proposals as UNEXECUTED. ') + cards.COMMON
                s['output_files'] += ['verification.json'] + (['negative-checks.json'] if arm == 'treatment' else [])
            specs.append(s)
        variable = ['Verifier whole-report rewrite versus explicit amendments/exact rendering.'] if method == 'T13' else ['Ordinary verification versus scope-aware absence/counterevidence policy.']
        postprocess = {'seed_provenance': 'Must cite candidate source job and frozen-output hash, not a Sol-authored answer.',
                       'evaluation': 'Grade current standalone report before seed/history preservation review.'}
    else:
        raise ValueError('method needs a bound repository or complete topology contract; do not fake readiness')
    return commit_pair(dest, pair_id, method, family, case, specs, variable, held, postprocess)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--method', choices=['T01', 'T03', 'T07', 'T13', 'T14'], required=True)
    p.add_argument('--family', choices=['M', 'Z', 'L'], required=True)
    p.add_argument('--case', type=Path, required=True)
    p.add_argument('--pair-id', required=True)
    p.add_argument('--destination', type=Path, required=True)
    p.add_argument('--seed', type=Path)
    a = p.parse_args()
    print(json.dumps(prepare(a.method, a.family, a.case, a.pair_id, a.destination, a.seed), indent=2))


if __name__ == '__main__':
    main()
