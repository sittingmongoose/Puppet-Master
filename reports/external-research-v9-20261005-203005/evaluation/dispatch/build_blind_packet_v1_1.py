#!/usr/bin/env python3
"""Additive v1.1: one terminal frozen final plus one terminal missing partner."""
import argparse
import json
import os
from pathlib import Path
import secrets
import build_blind_packet as base


def make(binding_path, output, private_sidecar):
    binding = json.loads(base.regular(binding_path).read_text())
    if len(binding.get('final_freezes', [])) == 2 and not binding.get('terminal_missing_outputs'):
        return base.make(binding_path, output, private_sidecar)
    if len(binding.get('final_freezes', [])) != 1 or len(binding.get('terminal_missing_outputs', [])) != 1:
        raise ValueError('v1.1 requires one real designated final and one positively terminal missing final')
    freeze = binding['final_freezes'][0]
    receipt = json.loads(base.read_pin(freeze))
    if receipt['schema'] != 'er9.stage-output-freeze.v1' or receipt['stage'] not in ('final', 'revision', 'final_author', 'final_resolution'):
        raise ValueError('Real designated final required; research/critique artifacts cannot substitute')
    if receipt['pair_id'] != binding['pair_id'] or not receipt.get('native_quiescent'):
        raise ValueError('Same-pair terminal native quiescence required')
    missing = binding['terminal_missing_outputs'][0]
    terminal = json.loads(base.read_pin(missing['terminal_record']))
    if terminal['schema'] != 'er9.terminal-missing-final.v1' or terminal['pair_id'] != binding['pair_id']:
        raise ValueError('Same-pair pinned missing-final record required')
    if terminal.get('pipeline_terminal') is not True or terminal.get('designated_final_present') is not False:
        raise ValueError('An ongoing or merely pending partner is not a terminal missing final')
    if not terminal.get('terminal_evidence_refs'):
        raise ValueError('Positive terminal evidence refs required in coordinator-only record')
    for evidence_ref in terminal['terminal_evidence_refs']:
        base.read_pin(evidence_ref)
    output, private_sidecar = Path(output).absolute(), Path(private_sidecar).absolute()
    if output.exists() or private_sidecar.exists() or private_sidecar.is_relative_to(output):
        raise ValueError('New packet and external private sidecar required; no silent replacement')
    if any(p.is_symlink() for p in (*output.parents, *private_sidecar.parents)):
        raise ValueError('Destination aliases denied')
    index = {row['relative_path']: row for row in receipt['artifacts']}
    selectors = ['final/proposal.md', 'final/sources.json', 'final/witnesses.json', 'final/leads.json']
    selectors += freeze.get('additional_evidence_relative_paths', [])
    artifacts = []
    for key in dict.fromkeys(selectors):
        base.relative(key)
        if key not in index:
            if key == 'final/proposal.md':
                raise ValueError('No actual designated final proposal')
            continue
        artifacts.append((key, base.read_pin(index[key])))
    evidence = []
    if freeze.get('evidence_freeze'):
        ef = json.loads(base.read_pin(freeze['evidence_freeze']))
        if ef['schema'] != 'er9.blind-evidence-freeze.v1' or ef['candidate_output_freeze_sha256'] != freeze['sha256']:
            raise ValueError('External evidence must bind the actual same-arm final')
        seen = set()
        for row in ef['files']:
            key = row['relative_path']; base.relative(key)
            if key in seen or row['evidence_kind'] not in ('public_source_capture', 'candidate_execution_receipt', 'candidate_code', 'candidate_input', 'candidate_stdout', 'candidate_stderr', 'candidate_exit'):
                raise ValueError('Unique admitted Phase-1 evidence path/kind required')
            seen.add(key); evidence.append((key, base.read_pin(row), row))
    task_bytes = {name: base.read_pin(source) for name, source in binding['task'].items()}
    checks = json.loads(task_bytes['important_checks'])['checks']
    aliases = ['A', 'B']; secrets.SystemRandom().shuffle(aliases)
    present_alias, missing_alias = aliases
    output.mkdir(parents=True); (output / 'task').mkdir()
    task = {}
    for name, source in binding['task'].items():
        data = task_bytes[name]; dest = output / 'task' / (name + Path(source['path']).suffix)
        dest.write_bytes(data); task[name] = {'path': str(dest), 'sha256': base.sha(data)}
    directory = output / 'outputs' / present_alias; directory.mkdir(parents=True)
    rows = {}
    for key, data in artifacts:
        dest = directory / base.relative(key); dest.parent.mkdir(parents=True, exist_ok=True); dest.write_bytes(data)
        rows[key] = {'path': str(dest), 'sha256': base.sha(data)}
    evidence_rows = []
    for key, data, metadata in evidence:
        dest = directory / 'evidence' / base.relative(key); dest.parent.mkdir(parents=True, exist_ok=True); dest.write_bytes(data)
        evidence_rows.append({'path': str(dest), 'sha256': base.sha(data), 'evidence_kind': metadata['evidence_kind'],
                              'original_sha256': metadata.get('original_sha256'), 'redaction_policy': metadata.get('redaction_policy', 'exact bytes')})
    present = {'alias': present_alias, 'artifact_status': 'FROZEN_DESIGNATED_FINAL_PRESENT',
               'designated_final': rows['final/proposal.md'], 'source_catalog': rows.get('final/sources.json'),
               'witness_catalog': rows.get('final/witnesses.json'), 'leads': rows.get('final/leads.json'),
               'additional_anonymous_evidence': [v for k, v in rows.items() if not k.startswith('final/')] + evidence_rows,
               'missing_catalogs': [k for k in ('final/sources.json', 'final/witnesses.json', 'final/leads.json') if k not in rows]}
    absent = {'alias': missing_alias, 'artifact_status': 'TERMINAL_MISSING_DESIGNATED_FINAL', 'designated_final': None,
              'operational_status': 'FAIL', 'quality_status': 'UNASSESSED',
              'phase1_notice': 'Designated final artifact missing after terminal pipeline end. No current-output semantic assessment is possible.'}
    manifest = {'protocol_version': 'ER9-independent-output-v1', 'dispatch_interface_version': '1.1',
                'evaluation_id': binding['evaluation_id'], 'scope': 'one_current_final_with_terminal_missing_partner',
                'track': 'B', 'prepared_utc': base.now(), 'candidate_outputs_frozen_utc': binding['candidate_outputs_frozen_utc'],
                'requested_evaluator': {'model': 'gpt-6.1-sol', 'reasoning_effort': 'xhigh'}, 'observed_evaluator': None,
                'result_directory': binding['result_directory'], 'task': task,
                'anonymous_outputs': sorted([present, absent], key=lambda row: row['alias']),
                'common_predeclared_checks': [{'check_id': c['id'], 'obligation_ids': c['obligation_ids'], 'neutral_question': c['question']} for c in checks],
                'assessment_plan': binding['assessment_plan'],
                'comparison_boundary': 'INCOMPLETE_PAIR. Assess actual current final under all original obligations. Missing partner quality remains UNASSESSED; no matched semantic equivalence, winner or complete pair comparison.',
                'blinding': {'hidden_fields': ['arm_assignment', 'failure_cause', 'economics', 'prior_grades', 'method_history'],
                             'known_hints_at_dispatch': binding.get('known_hints_at_dispatch', []),
                             'byte_policy': 'Exact frozen substantive bytes retained; disclose incidental identity hints.',
                             'allocation_record': 'coordinator-only, excluded', 'phase2_material_release': 'only after immutable current-output judgment saved'},
                'outputs': ['current_output_judgment.json', 'report.json', 'REVIEW.md'],
                'private_expected_truth_policy': 'post-freeze evaluator-only; no candidate access'}
    base.save(output / 'dispatch.json', manifest)
    private_sidecar.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(private_sidecar, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'w') as file:
        json.dump({'evaluation_id': binding['evaluation_id'], 'created_utc': base.now(),
                   'alias_map': [{'alias': present_alias, 'freeze': freeze, 'job_id': receipt['job_id'], 'arm': receipt['arm'],
                                  'original_artifact_inventory': receipt['artifacts'], 'external_evidence_metadata': [row for key, data, row in evidence]},
                                 {'alias': missing_alias, 'terminal_missing_record': missing['terminal_record'], 'record': terminal}]}, file, indent=2)
        file.write('\n')
    return {'packet': str(output), 'dispatch_sha256': base.sha((output / 'dispatch.json').read_bytes()),
            'actual_finals': 1, 'terminal_missing_finals': 1, 'status': 'PREPARED_NOT_EVALUATED'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--coordinator-binding', required=True); parser.add_argument('--output', required=True)
    parser.add_argument('--private-sidecar', required=True); args = parser.parse_args()
    print(json.dumps(make(args.coordinator_binding, args.output, args.private_sidecar)))


if __name__ == '__main__':
    main()
