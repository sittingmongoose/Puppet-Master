#!/usr/bin/env python3
"""Root-selected DEC004 V10/V16 final integrated preparation, no native admission."""
import copy
import json
from pathlib import Path
import shutil
import prepare as p

HERE = Path(__file__).resolve().parent
LAB = HERE.parent.parent
ROOT = HERE / 'integrated-final-selections'
CASES = LAB / 'cases'

V10 = """# V10 early coherent release/API binding modifier

Once you select a consequential component, bind a coherent public release/artifact/documentation/API set before writing the recommendation. Verify consequential defaults, paths and compatibility at those exact pins and record the binding in the existing source/proposal artifacts. A deliberately selected development build is legitimate when explicit and justified. When new evidence changes a selected version, invalidate and re-check affected assumptions; do not needlessly discard unrelated supported findings. Choose sources yourself from the brief, with no repository or expected answer supplied. Control has the same normal source/code/tools and may pin coherently as it discovers sources; do not assume it must choose a mismatch. All full brief/discovery/independent-precedent/issue-chain duties remain.
"""
V16 = """# V16 decision-focused complete final delivery modifier

Deliver a concise current decision/proposal with complete evidence-backed required findings, conditions, choices, consequences, uncertainty and validation. Preserve useful opportunities and alternatives. The standalone proposal must contain all required meaning and critical dependencies; do not hide them in a lead appendix or reduce the brief's scope to achieve concision. Use the already required structured lead inventory for optional/deferred/rejected leads and relevant history. The host retains administrative execution history, so do not repeat that bookkeeping in the proposal. Keep the existing source/witness catalogs complete and honest. This is an organization/duplication contrast, not permission to omit facts, pad control or have Sol repair the research.
"""


def stage(name, seconds, prompts, required):
    return {'stage': name, 'max_native_seconds': seconds, 'max_parent_responses': seconds // 10,
            'native_goal': True, 'fresh_same_family': True,
            'prompt_paths': [str(x) for x in prompts], 'required_artifacts': required,
            'execution_enabled': True, 'public_get': True}


def artifacts(folder):
    return ['out/' + folder + '/' + name for name in ('proposal.md', 'sources.json', 'witnesses.json', 'leads.json')]


def main():
    import argparse
    parser=argparse.ArgumentParser()
    parser.add_argument('--decision-file',type=Path,required=True)
    parser.add_argument('--decision-sha256',required=True)
    args=parser.parse_args()
    decision_path=p.regular(args.decision_file)
    if p.sha(decision_path)!=args.decision_sha256:raise ValueError('Frozen DEC004 pin mismatch')
    decision_ref={'path':str(decision_path),'sha256':args.decision_sha256}
    p.design_pins(LAB)
    p.put(ROOT / 'prompts/V10-release-binding.md', V10)
    p.put(ROOT / 'prompts/V16-complete-decision-delivery.md', V16)
    requests = []
    for n, method, domain in [(9, 'V10', 'A'), (10, 'V10', 'B'), (11, 'V16', 'A'), (12, 'V16', 'B')]:
        pair = f'I-{n:02d}'
        reservation = CASES / 'integrated' / (pair + '-reservation.json')
        card = copy.deepcopy(json.loads((CASES / 'integrated/I-01.json').read_text()))
        card.update({'pair_id': pair, 'card_version': 'DEC004-final-selection-preparation-v1',
                     'method_id': method, 'case_id': 'DEV-' + domain + '-v1', 'domain': domain,
                     'status': 'NOT_RUN', 'freeze_state': 'PROSPECTIVE_DEFAULT_SELECTED_NOT_ADMITTED',
                     'question': ('Does earlier coherent dependency/release/API binding improve source applicability and decision correctness without unnecessary churn under the same allowance?' if method == 'V10' else 'Does decision-focused complete delivery retain all required supported meaning and useful breadth while reducing duplication and reading/writing cost?'),
                     'candidate_family': 'GLM', 'requested_model': 'GLM 5.3 Flash', 'requested_effort': 'Max',
                     'requested_native_route': 'zcode genuine app-native /goal', 'observed_model': None, 'observed_effort': None,
                     'brief_path': 'briefs/development-' + domain + ('-biomedical.md' if domain == 'A' else '-notebook.md'),
                     'coverage_path': 'coverage/development-' + domain + '.json',
                     'important_checks_path': 'coverage/important-checks-' + domain + '.json',
                     'reservation_lineage': {'path': str(reservation), 'sha256': p.sha(reservation)},
                     'selection_authority': 'Root accepted Max DEC004 prospectively: I09/10 V10 and I11/12 V16, from partial uncertainty and delivery evidence; no efficacy claim or prior whole-case PASS required.',
                     'selection_decision_ref': decision_ref,
                     'contrast_slot': 5 if method == 'V10' else 6,
                     'control_label': 'Competent practical three-stage baseline',
                     'exact_factor': ('Earlier coherent component release/artifact/API binding in treatment research, compared with competent normal pinning as discovered; source/task/tools/family/effort/budget matched' if method == 'V10' else 'Treatment final author uses concise complete decision/proposal plus existing structured lead/history inventory, compared with competent normal standalone report; no padded control or reduced scope'),
                     'tool_binding_before_launch': {'retrieval_config_pin': None, 'execution_boundary_pin': None,
                                                  'control_execution_factor_verified': None,
                                                  'same_tool_access_in_both_arms': True,
                                                  'real_capacity_required': 'One sequential native Goal per arm; campaign GLM max2 including every stage/successor; concurrent pair only with capacity.'},
                     'root_admission_required': ['Record exact supported actual GLM Flash/max native identity and accepted v1.1 tools/runner pins',
                                                'Bind isolated per-arm brief-only candidate packet, no evaluator/sibling findings',
                                                'Seal this selected preparation card plus original reservation, brief, prompts, coverage and tool configuration before outputs',
                                                'Reserve independent blind evaluation of exact current final and all declared duties'],
                     'actual_public_source_pins_initial': [], 'source_pin_rule': 'Candidate independently discovers/captures exact public source identities during research. Freeze sources/artifacts between its own fresh stages, never leak discoveries across arms.',
                     'single_account_concurrency_requirement': 1})
        common = [stage('research', 1200, [CASES / 'prompts/research.md'], artifacts('research')),
                  stage('critique', 900, [CASES / 'prompts/critique-common.md'], ['out/critique/review.md']),
                  stage('revision', 600, [CASES / 'prompts/revision.md'], artifacts('final'))]
        card['control_stages'] = common
        treatment=copy.deepcopy(common)
        if method=='V10':
            treatment[0]['prompt_paths'].append(str(ROOT/'prompts/V10-release-binding.md'))
        else:
            treatment[2]['prompt_paths'].append(str(ROOT/'prompts/V16-complete-decision-delivery.md'))
        card['treatment_stages'] = treatment
        card['allocation']['per_stage_allocations_sum'] = 2700
        card_path = ROOT / 'cards' / (pair + '.json')
        p.put(card_path, card)
        inputs = {card_path, reservation, decision_path, CASES / card['brief_path'], CASES / card['coverage_path'],
                  CASES / card['important_checks_path'], CASES / card['source_access_path'],
                  CASES / card['common_criteria_path'], CASES / card['common_output_contract']}
        for arm in ('control', 'treatment'):
            for st in card[arm + '_stages']:
                inputs.update(Path(x) for x in st['prompt_paths'])
        freeze_path = ROOT / pair / 'PAIR_INPUT_FREEZE.json'
        p.put(freeze_path, {'schema': 'er9.integrated-default-input-freeze.v1',
                            'pair_id': pair, 'status': 'PROSPECTIVE_NOT_ADMITTED',
                            'requested_family': 'GLM', 'requested_model': card['requested_model'], 'requested_effort': 'Max',
                            'host_input_pins': {str(x): p.sha(x) for x in sorted(inputs)},
                            'selection_authority': card['selection_authority'], 'selection_decision_ref': decision_ref,
                            'reservation_lineage': card['reservation_lineage'],
                            'allocation': card['allocation'], 'designated_final': card['artifacts'],
                            'actual_source_pins_initial': [], 'actual_runtime_and_tools': None,
                            'source_access': 'Fresh brief-only primary-source discovery; no curated repository/answer/seed',
                            'launch_seal_required': True, 'native_starts': 0, 'created_utc': p.now()})
        pair_freeze = {'path': str(freeze_path), 'sha256': p.sha(freeze_path)}
        jobs = []
        for arm in ('control', 'treatment'):
            prior = []
            for index, st in enumerate(card[arm + '_stages']):
                job_id = f'{pair}-{arm}-{st["stage"]}-a001'
                run = ROOT / pair / job_id
                ws = run / 'workspace'
                incoming = ws / 'inputs'
                incoming.mkdir(parents=True, exist_ok=False)
                (ws / 'out').mkdir()
                shutil.copyfile(CASES / card['brief_path'], incoming / 'brief.md')
                shutil.copyfile(CASES / card['common_output_contract'], incoming / 'output_contract.md')
                text = ['# Assigned fresh native integrated candidate stage\n',
                        (incoming / 'brief.md').read_text(), (incoming / 'output_contract.md').read_text()]
                text += [Path(x).read_text() for x in st['prompt_paths']]
                if prior:
                    text.append('Read the exact complete frozen same-arm candidate predecessors provided under inputs/prior/ before this stage. They are not present until their actual output freezes exist. Never invent a missing predecessor or inspect another arm/evaluator.')
                task = ws / 'TASK.md'
                role='\n\n# Exact current native stage scope\n\nProduce the exact current stage artifacts below; this scope overrides generic references to later pipeline roles.\n\n'+'\n'.join('- '+x for x in st['required_artifacts'])
                if st['stage']=='research':
                    role+='\n\nThis Goal independently researches the complete brief and produces its research proposal/catalogs. Criticism and final-author delivery occur in later fresh native stages, so do not wait for them inside this Goal.\n'
                elif st['stage']=='critique':
                    role+='\n\nThis Goal independently verifies the frozen same-arm research and delivers a complete useful critique. A later fresh author owns the final proposal.\n'
                else:
                    role+='\n\nThis Goal resolves supported critique, preserves full required meaning, checks consequential changes and delivers the complete designated current final. A Goal terminal/artifact record is not independent semantic PASS.\n'
                text.append(role)
                task.write_text('\n\n'.join(text))
                spec = {'job_id': job_id, 'pair_id': pair, 'arm': arm, 'stage': st['stage'],
                        'workspace': str(ws), 'prompt_file': str(task), 'prompt_sha256': p.sha(task),
                        'out': str(run / 'native'), 'max_seconds': st['max_native_seconds'],
                        'max_responses': st['max_parent_responses'], 'tools_config': None, 'tools_config_sha256': None,
                        'required_artifacts': st['required_artifacts'], 'pair_freeze': pair_freeze,
                        'input_pins': {str(x): p.sha(x) for x in incoming.iterdir() if x.is_file()},
                        'freeze_out': str(run / 'OUTPUT_FREEZE.json'),
                        'runtime_binding_required': True, 'predecessor_binding_required': bool(prior)}
                spec_path = run / 'prepared-stage.json'
                p.put(spec_path, spec)
                jobs.append({'job_id': job_id, 'arm': arm, 'stage': st['stage'], 'stage_index': index,
                             'max_seconds': st['max_native_seconds'], 'max_responses': st['max_parent_responses'],
                             'prerequisite_job_ids': prior[-1:], 'all_same_arm_prior_job_ids': prior[:],
                             'stage_json': str(spec_path), 'stage_sha256': p.sha(spec_path),
                             'expected_freeze': str(run / 'OUTPUT_FREEZE.json'),
                             'pipeline_final': st['required_artifacts'][0] == 'out/final/proposal.md',
                             'execution_enabled': True, 'public_get': True,
                             'status': 'PREPARED_NOT_ADMITTED' if not prior else 'AWAITING_ACTUAL_PREDECESSOR_FREEZES',
                             'runtime_binding_required': True})
                prior.append(job_id)
        request = {'schema': 'er9.dispatch-registration.v1', 'request_id': pair + '-DEC004-selection-r001',
                   'pair_id': pair, 'family': 'Z', 'requested_model': card['requested_model'],
                   'requested_effort': 'Max', 'card_path': str(card_path), 'card_sha256': p.sha(card_path),
                   'stage_jobs': jobs, 'root_scope_required': True,
                   'status': 'PROSPECTIVE_ROOT_SELECTED_NOT_ADMITTED',
                   'selection_decision_ref': decision_ref, 'reservation_lineage': card['reservation_lineage'], 'same_original_comparison_slot': True,
                   'admission_owner': 'codex-er9-ops', 'automatic_retry': False,
                   'immutable_pair_input_freeze': pair_freeze, 'actual_launch_seal_required': True}
        path = ROOT / 'registration' / (request['request_id'] + '.json')
        p.put(path, request)
        requests.append({'path': str(path), 'sha256': p.sha(path), 'request_id': request['request_id']})
    p.put(ROOT / 'OUTBOX.json', {'schema': 'er9.integrated-default-registration-outbox.v1',
                                'status': 'PROSPECTIVE_ROOT_SELECTED_NOT_ADMITTED', 'pairs': 4,
                                'full_pipeline_arms': 8, 'planned_native_stages': 24,
                                'requests': requests, 'native_starts': 0,
                                'existing_I09_I12_reservations_preserved': True,
                                'no_new_campaign_comparisons': True, 'fresh_brief_only_discovery': True})
    files = [x for x in ROOT.rglob('*') if x.is_file()]
    p.put(ROOT / 'INPUT_MANIFEST.json', {'schema': 'er9.integrated-default-preparation-pins.v1',
                                        'files': [{'path': str(x), 'sha256': p.sha(x)} for x in sorted(files)],
                                        'status': 'PROSPECTIVE_NOT_RUN', 'native_starts': 0})
    print(json.dumps({'pairs': 4, 'full_pipeline_arms': 8, 'planned_native_stages': 24,
                      'status': 'PROSPECTIVE_ROOT_SELECTED_NOT_ADMITTED', 'outbox': str(ROOT / 'OUTBOX.json')}))


if __name__ == '__main__':
    main()
