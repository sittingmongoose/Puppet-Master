#!/usr/bin/env python3
"""Preparation only. New M/Z configurations; originals and failed L receipts remain unchanged."""
import argparse
import importlib.util
import json
from pathlib import Path
import shutil
import sys

HERE = Path(__file__).resolve().parent
LAB = HERE.parent
OLD = LAB / 'methods-v1'
sys.path.insert(0, str(OLD))
import cards
import topology
from dependency_selector import sections, sha

H = LAB / 'dev/harness-v1-frozen/workspaces.py'
ms = importlib.util.spec_from_file_location('resume_workspaces', H)
workspaces = importlib.util.module_from_spec(ms)
ms.loader.exec_module(workspaces)
OME = LAB / 'evaluation/exports/ome-normative-dev-v1'
AZURE = LAB / 'evaluation/exports/azure-review-dev-v1'
SELECTOR = HERE / 'dependency_selector.py'


def write(path, value):
    Path(path).write_text(json.dumps(value, indent=2) + '\n')


def pins():
    return {str(p): sha(p) for p in (Path(__file__), SELECTOR, OLD / 'cards.py',
            OLD / 'mechanics.py', OLD / 'topology.py', H)}


def pair(method, family, case, pair_id, specs, changed, held, extra=None):
    dest = HERE / 'pairs' / pair_id
    dest.mkdir(parents=True, exist_ok=False)
    attempts = []
    for s in specs:
        name = s.get('assignment_id', s['arm'])
        write(dest / (name + '.spec.json'), s)
        attempt = dest / name
        workspaces.prepare(s, attempt)
        attempts.append({'job_id': s['job_id'], 'arm': s['arm'], 'assignment_id': name,
                         'attempt': str(attempt), 'spec': str(dest / (name + '.spec.json'))})
    value = {'schema': 'er7.method_pair.v1', 'pair_id': pair_id, 'method': method, 'family': family,
             'case_id': case.name, 'status': 'prepared-not-reviewed-not-started', 'attempts': attempts,
             'changed_variables': changed, 'held_fixed': held, 'caps': {s['job_id']: s['caps'] for s in specs},
             'versions': pins(), 'independent_review_required': True,
             'configuration_provenance': 'New M/Z configuration after independent L-route quarantine; no silent family replacement.',
             'L_history': 'All unused L cards and failed L receipts retained; no third carrier repair authorized.',
             'balance_limit': 'First-screen balance constrained by unavailable L route; M/Z results do not establish L behavior.',
             'candidate_starts_by_preparation': 0, 'measurement_status': 'No executed comparison claimed.'}
    value.update(extra or {})
    write(dest / 'pair.json', value)
    return value


def discovery(method, family, case):
    pid = f'{method.lower()}-{family.lower()}-{case.name.split("-")[0]}-discovery-resume-v1'
    inputs = cards.admitted(case, 'brief-only')
    specs = []
    for arm in ('control', 'treatment'):
        s = cards.base_spec(method, arm, family, case, pid, inputs)
        s['method_instruction'] = cards.POLICIES[method][arm] + ' ' + cards.COMMON
        specs.append(s)
    return pair(method, family, case, pid, specs, ['Scheduling/source-selection policy only.'],
                ['Exact brief bytes', 'Plan blindness', 'Source access', 'Same model/front end/Max effort',
                 '900s96 caps', 'Entire brief and all claims evaluated'],
                {'input_sha256': {x['target']: x['sha256'] for x in inputs},
                 'discovery_policy': 'Candidate-selected public primary sources; no source list, key, plan, findings or grade.'})


def cache():
    pid = 't07-z-ome-cache-resume-v1'
    source_pair = OLD / 'pairs/t07-l-ome-cache-screen-v2'
    specs = []
    for arm in ('control', 'treatment'):
        s = json.loads((source_pair / (arm + '.spec.json')).read_text())
        s.update(family='Z', job_id=pid + '-' + arm)
        # Both prior question scopes/corpus/dependency bytes stay fixed; each new attempt starts cold.
        s['candidate_instructions'] = ('Before Q1 confirm out/source-cache does not exist; do not prepopulate. '
            'Run Q1 then Q2 serially. Record actual command invocation and native extra reads in acquisition.json. '
            'Warm reuse includes the same actual Q1 cold work. Read both complete generated source views. '
            'No prior semantic answer reuse or external fetch claims.')
        specs.append(s)
    return pair('T07', 'Z', OME, pid, specs,
        ['Two cold local acquisition/parses versus first cold parse followed by immutable warm reuse.'],
        ['Same complete source/case/two-question scope', 'Same prior Q1 workload', '900s96/Max effort',
         'Actual local acquisition/parse measured, network fetches zero', 'Full output/semantic evaluation'],
        {'postprocess': {'control_counts': {'local_acquisitions': 2, 'parses': 2, 'hits': 0},
                        'treatment_counts': {'local_acquisitions': 1, 'parses': 1, 'hits': 1},
                        'required': 'Check exact Q1/Q2 view bytes, command trace, dependency/hash and immutable cache bytes; counts alone are not proof.',
                        'cost': 'Include copying/preparation, Q1 cold and Q2 warm, cache creation/read, native reads, all corrections and starts. No network savings.'}})


def controlled_case():
    dest = HERE / 'bindings/t15-controlled-ome-v1'
    dest.mkdir(parents=True, exist_ok=False)
    for x in cards.admitted(OME, 'full'):
        target = dest / x['target']
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(x['source'], target)
    original = OME / 'plan/Viewer.md'
    paragraphs = original.read_text().strip().split('\n\n')
    before = paragraphs[0] + '\n\n' + '\n\n'.join('## Slice ' + f'{n:02d}' + '\n\n' + text
                                            for n, text in enumerate(paragraphs[1:], 1)) + '\n'
    target = dest / 'plan/Viewer.md'
    target.write_text(before)
    after = dest / 'after-plan.md'
    needle = 'Changing the selected view cancels work that is no longer needed.'
    if before.count(needle) != 1:
        raise ValueError('controlled fixture passage changed; adjudicate before preparing')
    after.write_text(before.replace(needle, needle + ' During replacement loading, the last successfully displayed view remains visible until the replacement is ready.'))
    b, a = sections(target), sections(after)
    changed = [key for key in b if b[key]['sha256'] != a[key]['sha256']]
    unchanged = [key for key in b if b[key]['sha256'] == a[key]['sha256']]
    if len(changed) != 1 or not unchanged:
        raise ValueError('one changed and multiple unchanged slices required')
    write(dest / 'plan_sections.json', {'plan_sha256': sha(target), 'sections': b})
    context = {'permissions': 'public frozen exports read-only; no external writes',
               'applicability': 'Entire Slide Scout synthetic brief and OME-Zarr0.5 frozen source S003',
               'comparison_policy': 'source-supported whole-finding-to-thin-plan comparison-v1',
               'instance_binding_prefix': 't15-z-ome-reuse-resume-v1'}
    write(dest / 'comparison-context.json', context)
    write(dest / 'controlled-change.json', {'original_plan_sha256': sha(original),
          'before_plan_sha256': sha(target), 'after_plan_sha256': sha(after), 'changed_slices': changed,
          'unchanged_slices': unchanged, 'construction': 'Original exact paragraphs retained; opaque headings added equally before/after; one declared generic plan requirement added. This is a product fixture mutation, not a source claim or supplied finding.'})
    for p in dest.rglob('*'):
        if p.is_file(): p.chmod(0o444)
    return dest


def extra(source, target):
    return {'source': str(source), 'target': target, 'sha256': sha(source)}


def t15_seed():
    case = controlled_case()
    pid = 't15-z-ome-reuse-resume-v1'
    inputs = cards.admitted(case, 'full')
    s = cards.base_spec('T15', 'control', 'Z', case, pid, inputs, 600, 64)
    s.update(job_id=pid + '-seed', assignment_id='seed')
    s['output_files'] += ['findings.json']
    s['method_instruction'] = ('Independently research the entire admitted brief and source corpus. '
        'Write all whole findings, conditions, sources, implications and unresolved areas in the standalone report, '
        'and out/findings.json as {findings:[{id,body}]} with stable unique IDs and complete standalone Markdown bodies. '
        'Findings are your actual acquired research, not handpicked evaluator claims. This is the shared cold prerequisite; '
        'its complete time/start/tool/usage cost stays in both arm costs and the whole method total. ') + cards.COMMON
    value = pair('T15', 'Z', case, pid, [s],
        ['After shared candidate seed+witness: full recompare vs exact dependency reuse.'],
        ['Same source and segmented before/after plan', 'Fresh actual candidate seed+witness shared',
         'Matched after-arm900s96', 'No Sol semantic findings or covered verdicts'],
        {'status': 'seed-prepared; matched arms depend on actual candidate witness',
         'whole_case_caps': {'seconds': 3600, 'aggregate_slot_seconds': 5400},
         'declared_stages': {'seed': {'seconds': 600, 'responses': 64}, 'baseline': {'seconds': 600, 'responses': 64},
                             'control': {'seconds': 900, 'responses': 96}, 'treatment': {'seconds': 900, 'responses': 96}},
         'total_declared_candidate_seconds': 3000, 'starts': 4,
         'before_case': str(case), 'changed_plan': str(case / 'after-plan.md'),
         'selector_sha256': sha(SELECTOR), 'next': 'prepare_resume.py t15-baseline --seed-attempt <actual frozen seed>'})
    return value


def frozen_candidate(attempt, expected_job, family):
    attempt = Path(attempt).resolve()
    meta = json.loads((attempt / 'attempt.json').read_text())
    integrity = json.loads((attempt / 'output-integrity.json').read_text())
    native = json.loads((attempt / 'native/receipt.json').read_text())
    if (meta['spec']['job_id'] != expected_job or meta['spec']['family'] != family
        or not integrity.get('structural_complete') or native.get('goal_status_final') != 'complete'
        or native.get('native_quiescent') is not True or native.get('own_process_group_absent') is not True):
        raise ValueError('actual completed, quiescent, complete frozen candidate predecessor required')
    for x in integrity['files']:
        if sha(attempt / 'frozen-output' / x['target']) != x['sha256']:
            raise ValueError('frozen candidate bytes changed')
    return attempt, integrity


def t15_baseline(seed_attempt):
    pid = 't15-z-ome-reuse-resume-v1'
    attempt, receipt = frozen_candidate(seed_attempt, pid + '-seed', 'Z')
    seed = attempt / 'frozen-output/out/findings.json'
    findings = json.loads(seed.read_text())['findings']
    if not findings or len({x['id'] for x in findings}) != len(findings):
        raise ValueError('candidate seed must include unique findings')
    case = HERE / 'bindings/t15-controlled-ome-v1'
    inputs = cards.admitted(case, 'full') + [extra(seed, 'candidate_seed.json'),
              extra(case / 'plan_sections.json', 'plan_sections.json'),
              extra(case / 'comparison-context.json', 'comparison-context.json')]
    s = cards.base_spec('T15', 'control', 'Z', case, pid, inputs, 600, 64)
    s.update(job_id=pid + '-baseline', assignment_id='baseline')
    s['output_files'] += ['witnesses.json']
    s['method_instruction'] = ('Compare EVERY actual candidate seed finding against the entire before-plan and source evidence. '
        'Write complete out/witnesses.json: {witnesses:[{id,status:"verified"|"unresolved",semantic_ambiguity:bool, '
        'result:completeStandaloneMarkdown,negative_search:bool,verification_evidence:sourceAndPlanLocators, '
        'dependencies:{finding_sha256,source_versions,permissions,plan_owner_hashes,affected_neighbor_hashes, '
        'corpus_membership_sha256,negative_scope_sha256,applicability,comparison_policy,instance_binding}}]}. '
        'finding_sha256 is SHA256 of the exact seed object encoded json.dumps(sort_keys=True,separators=(",",":")); '
        'source_versions maps used source handles to exact catalog view_sha256; plan owner/neighbor maps enumerate '
        'EVERY relevant section with hashes from plan_sections.json. Negative search depends on whole before-plan hash. '
        'Use exact permissions/applicability/comparison_policy from comparison-context.json; instance_binding is '
        'its instance_binding_prefix+":"+findingID. Verify every dependency through actual review. Empty or guessed '
        'dependencies do not establish reuse. Ambiguity remains unresolved. This is the actual shared candidate witness '
        'prerequisite; all its costs and seed costs remain counted for both comparison arms. ') + cards.COMMON
    dest = HERE / 'pairs' / pid
    write(dest / 'baseline.spec.json', s)
    workspaces.prepare(s, dest / 'baseline')
    record = {'job_id': s['job_id'], 'attempt': str(dest / 'baseline'), 'seed_attempt': str(attempt),
              'seed_sha256': sha(seed), 'pins': pins(), 'status': 'prepared-not-reviewed-not-started'}
    write(dest / 'baseline-binding.json', record)
    return record


def t15_arms(seed_attempt, baseline_attempt):
    pid = 't15-z-ome-reuse-resume-v1'
    seed_attempt, _ = frozen_candidate(seed_attempt, pid + '-seed', 'Z')
    baseline_attempt, _ = frozen_candidate(baseline_attempt, pid + '-baseline', 'Z')
    seed = seed_attempt / 'frozen-output/out/findings.json'
    witness = baseline_attempt / 'frozen-output/out/witnesses.json'
    case = HERE / 'bindings/t15-controlled-ome-v1'
    from dependency_selector import select
    dest = HERE / 'pairs' / pid
    select(witness, case / 'plan/Viewer.md', case / 'catalog.json', seed,
           case / 'comparison-context.json', dest / 'before-witness-structural-check.json')
    inputs = [x for x in cards.admitted(case, 'full') if x['target'] != 'plan/Viewer.md']
    inputs += [extra(case / 'after-plan.md', 'plan/Viewer.md'), extra(seed, 'candidate_seed.json'),
               extra(witness, 'witnesses.json'), extra(SELECTOR, 'dependency_selector.py'),
               extra(case / 'comparison-context.json', 'comparison-context.json')]
    for arm in ('control', 'treatment'):
        s = cards.base_spec('T15', arm, 'Z', case, pid, inputs)
        cmd = 'python3 inputs/dependency_selector.py --witnesses inputs/witnesses.json --plan inputs/plan/Viewer.md --catalog inputs/catalog.json --seed inputs/candidate_seed.json --context inputs/comparison-context.json --output out/dependency-decisions.json'
        if arm == 'control': cmd += ' --all-changed'
        policy = ('Recompare EVERY seed finding against the entire after-plan and sources; prior results are evidence to inspect, not a covered shortcut.' if arm == 'control' else
                  'For reuse=true preserve the exact complete witnessed result verbatim, recording it in reuse-record.json. For reuse=false independently recompare and adjudicate every changed/ambiguous/negative-scope result. Invalidate any additional semantic dependency you detect. Exact IDs/citations alone never prove semantic coverage.')
        s['method_instruction'] = 'First actually run ' + cmd + '. ' + policy + ' All seed and baseline costs count; no Sol correction or semantic substitute. ' + cards.COMMON
        s['output_files'] += ['dependency-decisions.json', 'reuse-record.json']
        s['candidate_instructions'] = 'Record all reused and independently recomputed IDs in reuse-record.json; control reused list is empty. Preserve unresolved and UNEXECUTED status.'
        write(dest / (arm + '.spec.json'), s)
        workspaces.prepare(s, dest / arm)
    record = {'status': 'prepared-not-reviewed-not-started', 'seed_sha256': sha(seed), 'witness_sha256': sha(witness),
              'selector_sha256': sha(SELECTOR), 'before_plan_sha256': sha(case / 'plan/Viewer.md'),
              'after_plan_sha256': sha(case / 'after-plan.md'), 'pins': pins(),
              'attempts': [str(dest / x) for x in ('control', 'treatment')]}
    write(dest / 'arms-binding.json', record)
    return record


def t16():
    pid = 't16-m-azure-topology-resume-v1'
    dest = HERE / 'pairs' / pid
    dest.mkdir(parents=True, exist_ok=False)
    admitted = cards.admitted(AZURE, 'brief-only') + topology.plan_inputs(AZURE)
    contract = {'schema': 'er7.complete_topology.v1', 'pair_id': pid, 'method': 'T16', 'family': 'M',
        'case': str(AZURE), 'destination': str(dest), 'layout': topology.LAYOUT,
        'status': 'prepared-not-reviewed-not-started', 'pins': pins(),
        'input_sha256': {x['source']: x['sha256'] for x in admitted},
        'changed_variables': 'Five-stage vs fused three-stage; both retain a fresh independent same-family candidate flash.',
        'held_fixed': 'Entire brief, independent source selection, source authority,2700s192/arm,model/front end/Max effort,whole final research-to-plan artifact.',
        'whole_case_caps': {'seconds': 3600, 'aggregate_slot_seconds': 5400},
        'whole_case_boundary': 'One complete matched comparison: both arms together, including every stage/retry/correction/cleanup/host wait; clock starts on first candidate stage.',
        'aggregate_caps_per_arm': {'seconds': 2700, 'responses': 192}, 'starts': {'control': 5, 'treatment': 3},
        'plan_boundary': 'Discovery, study and control reconcile are plan-blind; plan enters control compare and treatment reconcile-compare only.',
        'review_policy': 'Mandatory fresh independent same-family native candidate Goal, no author conversation or Sol semantic review substitute.',
        'accounting': 'Case clock never resets. Dispatcher must enforce whole caps and check remaining allowance before each stage. Absent/failed stage terminates arm; no skipping. Fixed aggregate matched caps cannot silently grow.',
        'candidate_starts_by_preparation': 0, 'L_history': 'L remains quarantined; no family balance inference.'}
    write(dest / 'topology.json', contract)
    first = [t16_stage(dest / 'topology.json', arm, 0) for arm in ('control', 'treatment')]
    write(dest / 'first-stage-bindings.json', first)
    return contract


def t16_stage(contract_path, arm, index, previous=None):
    contract = json.loads(Path(contract_path).read_text())
    for path, digest in contract['pins'].items():
        if sha(path) != digest: raise ValueError('implementation dependency changed')
    if index:
        expected = contract['pair_id'] + '-' + arm + '-' + contract['layout'][arm][index - 1][0]
        frozen_candidate(previous, expected, 'M')
    # Existing accepted stage constructor copies every prior frozen artifact; no semantic host synthesis.
    return topology.prepare_stage(contract_path, arm, index, previous)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('command', choices=['initial', 't15-baseline', 't15-arms', 't16-stage'])
    p.add_argument('--seed-attempt', type=Path)
    p.add_argument('--baseline-attempt', type=Path)
    p.add_argument('--contract', type=Path)
    p.add_argument('--arm', choices=['control', 'treatment'])
    p.add_argument('--index', type=int)
    p.add_argument('--previous', type=Path)
    a = p.parse_args()
    if a.command == 'initial':
        value = [discovery('T08', 'Z', OME), cache(), discovery('T10', 'M', AZURE), t15_seed(), t16()]
        write(HERE / 'prepared-queue.json', {'schema': 'er7.resume_method_queue.v1', 'methods': value,
              'candidate_caps': {'M': 2, 'Z': 2, 'L': 2}, 'L_route': 'quarantined-no-third-repair',
              'priority': ['T08-Z', 'T07-Z', 'T10-M', 'T15-Z-seed', 'T16-M-first-stages'],
              'status': 'Independent exact-binding review required; unexecuted methods are not comparisons.'})
    elif a.command == 't15-baseline': value = t15_baseline(a.seed_attempt)
    elif a.command == 't15-arms': value = t15_arms(a.seed_attempt, a.baseline_attempt)
    else: value = t16_stage(a.contract, a.arm, a.index, a.previous)
    print(json.dumps(value, indent=2))


if __name__ == '__main__':
    main()
