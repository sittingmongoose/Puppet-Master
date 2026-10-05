#!/usr/bin/env python3
"""Root-selected V14/V08 default integrated preparation, no native admission."""
import copy
import json
from pathlib import Path
import shutil
import prepare as p

HERE = Path(__file__).resolve().parent
LAB = HERE.parent.parent
ROOT = HERE / 'integrated-defaults'
CASES = LAB / 'cases'

V14 = '''# V14 protected discovery modifier

Within the same1200-second research allowance, protect roughly30 percent of discovery effort for different relevant mechanism families, user promises and components outside obvious whole-product competitors before deepening the best leads. Keep an explicit useful opportunity/alternative lane as well as defect hunting. Select sources yourself from the brief; no repository or source answer is prescribed. Do not let breadth erase required-plan coverage. Record useful leads, actual source applicability and what was deferred. The effort allocation is a prospective method commitment; do not invent elapsed timings or claim every lead is verified. Both arms still require two independently useful implementation precedents and a real issue/fix/regression-test investigation.
'''
V08 = '''# V08 fresh critic with complete final delivery modifier

This same-family fresh native Goal performs full independent criticism and evidence-backed local correction, then delivers the complete standalone current proposal. Read the exact brief, full immutable research proposal/catalogs and applicable primary source context. Verify consequential facts, versions/conditions, derivations and implementation behavior, preserve supported findings and useful ideas, re-check changed dependencies and qualify remaining critical uncertainty. Do not rely on a source-link count, majority vote, closed finding ID or a passing isolated check as proof of the whole design.

For this stage, override the common critique review-path instruction: write the designated complete final at out/final/proposal.md and sources.json, witnesses.json and leads.json under out/final/. A critique note alone is insufficient. There is no subsequent final-author Goal in this treatment. Do not claim unexecuted checks or have Sol finish your result. All complete brief duties and evaluation obligations remain identical to control.
'''


def stage(name, seconds, prompts, required):
    return {'stage': name, 'max_native_seconds': seconds, 'max_parent_responses': seconds // 10,
            'native_goal': True, 'fresh_same_family': True,
            'prompt_paths': [str(x) for x in prompts], 'required_artifacts': required,
            'execution_enabled': True, 'public_get': True}


def artifacts(folder):
    return ['out/' + folder + '/' + name for name in ('proposal.md', 'sources.json', 'witnesses.json', 'leads.json')]


def main():
    p.design_pins(LAB)
    p.put(ROOT / 'prompts/V14-protected-discovery.md', V14)
    p.put(ROOT / 'prompts/V08-critic-final.md', V08)
    requests = []
    for n, method, domain in [(5, 'V14', 'A'), (6, 'V14', 'B'), (7, 'V08', 'A'), (8, 'V08', 'B')]:
        pair = f'I-{n:02d}'
        reservation = CASES / 'integrated' / (pair + '-reservation.json')
        card = copy.deepcopy(json.loads((CASES / 'integrated/I-01.json').read_text()))
        card.update({'pair_id': pair, 'card_version': 'DEC002-default-preparation-v1',
                     'method_id': method, 'case_id': 'DEV-' + domain + '-v1', 'domain': domain,
                     'status': 'NOT_RUN', 'freeze_state': 'PROSPECTIVE_DEFAULT_SELECTED_NOT_ADMITTED',
                     'question': ('Does protecting discovery breadth improve verified useful novelty while preserving complete plan coverage under the same finite allowance?' if method == 'V14' else 'Can a fresh same-family critic verify/correct and deliver the complete final in two native stages with less duplication and comparable source-correct coverage?'),
                     'candidate_family': 'GLM', 'requested_model': 'GLM 5.3 Flash', 'requested_effort': 'Max',
                     'requested_native_route': 'zcode genuine app-native /goal', 'observed_model': None, 'observed_effort': None,
                     'brief_path': 'briefs/development-' + domain + ('-biomedical.md' if domain == 'A' else '-notebook.md'),
                     'coverage_path': 'coverage/development-' + domain + '.json',
                     'important_checks_path': 'coverage/important-checks-' + domain + '.json',
                     'reservation_lineage': {'path': str(reservation), 'sha256': p.sha(reservation)},
                     'selection_authority': 'Root accepted Max DEC002 prospective defaults: I05/06 V14 discovery and I07/08 V08 lower-overhead topology, no prior whole-case PASS required.',
                     'contrast_slot': 3 if method == 'V14' else 4,
                     'control_label': 'Competent practical three-stage baseline',
                     'exact_factor': ('Protected share of treatment research discovery effort; tools, full brief duties, same family/effort and total allocation matched' if method == 'V14' else 'Research -> fresh critic that verifies/corrects and writes complete final, compared with research -> fresh critic -> fresh final author; tools/task/total allowance matched'),
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
        if method == 'V14':
            treatment = copy.deepcopy(common)
            treatment[0]['prompt_paths'].append(str(ROOT / 'prompts/V14-protected-discovery.md'))
        else:
            treatment = [copy.deepcopy(common[0]), stage('critic_final', 1500,
                         [CASES / 'prompts/critique-common.md', ROOT / 'prompts/V08-critic-final.md'], artifacts('final'))]
        card['treatment_stages'] = treatment
        card['allocation']['per_stage_allocations_sum'] = 2700
        card_path = ROOT / 'cards' / (pair + '.json')
        p.put(card_path, card)
        inputs = {card_path, reservation, CASES / card['brief_path'], CASES / card['coverage_path'],
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
                            'selection_authority': card['selection_authority'],
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
        request = {'schema': 'er9.dispatch-registration.v1', 'request_id': pair + '-DEC002-default-r001',
                   'pair_id': pair, 'family': 'Z', 'requested_model': card['requested_model'],
                   'requested_effort': 'Max', 'card_path': str(card_path), 'card_sha256': p.sha(card_path),
                   'stage_jobs': jobs, 'root_scope_required': True,
                   'status': 'PROSPECTIVE_ROOT_SELECTED_NOT_ADMITTED',
                   'reservation_lineage': card['reservation_lineage'], 'same_original_comparison_slot': True,
                   'admission_owner': 'codex-er9-ops', 'automatic_retry': False,
                   'immutable_pair_input_freeze': pair_freeze, 'actual_launch_seal_required': True}
        path = ROOT / 'registration' / (request['request_id'] + '.json')
        p.put(path, request)
        requests.append({'path': str(path), 'sha256': p.sha(path), 'request_id': request['request_id']})
    p.put(ROOT / 'OUTBOX.json', {'schema': 'er9.integrated-default-registration-outbox.v1',
                                'status': 'PROSPECTIVE_ROOT_SELECTED_NOT_ADMITTED', 'pairs': 4,
                                'full_pipeline_arms': 8, 'planned_native_stages': 22,
                                'requests': requests, 'native_starts': 0,
                                'existing_I05_I08_reservations_preserved': True,
                                'no_new_campaign_comparisons': True, 'fresh_brief_only_discovery': True})
    files = [x for x in ROOT.rglob('*') if x.is_file()]
    p.put(ROOT / 'INPUT_MANIFEST.json', {'schema': 'er9.integrated-default-preparation-pins.v1',
                                        'files': [{'path': str(x), 'sha256': p.sha(x)} for x in sorted(files)],
                                        'status': 'PROSPECTIVE_NOT_RUN', 'native_starts': 0})
    print(json.dumps({'pairs': 4, 'full_pipeline_arms': 8, 'planned_native_stages': 22,
                      'status': 'PROSPECTIVE_ROOT_SELECTED_NOT_ADMITTED', 'outbox': str(ROOT / 'OUTBOX.json')}))


if __name__ == '__main__':
    main()
