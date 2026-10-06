#!/usr/bin/env python3
"""Coordinator-only v1.3: one terminal research output plus terminal missing research proposal."""
import argparse
import json
import os
from pathlib import Path
import secrets
import build_blind_packet as base


def make(binding_path, output, private_sidecar):
    binding = json.loads(base.regular(binding_path).read_text())
    if len(binding.get('stage_freezes', [])) != 1 or len(binding.get('terminal_missing_stage_outputs', [])) != 1 or binding.get('assessed_stage') != 'research':
        raise ValueError('One real terminal research proposal and one terminal missing research partner required')
    freeze = binding['stage_freezes'][0]
    receipt = json.loads(base.read_pin(freeze))
    if receipt['schema'] != 'er9.stage-output-freeze.v1' or receipt['stage'] != 'research':
        raise ValueError('Actual research stage required; no designated final promotion')
    if receipt['pair_id'] != binding['pair_id'] or not receipt.get('native_quiescent'):
        raise ValueError('Same-pair terminal native quiescence required')
    missing = binding['terminal_missing_stage_outputs'][0]
    terminal = json.loads(base.read_pin(missing['terminal_record']))
    if terminal['schema'] != 'er9.terminal-missing-stage-proposal.v1' or terminal['pair_id'] != binding['pair_id']:
        raise ValueError('Same-pair pinned missing research proposal record required')
    if terminal.get('stage_terminal') is not True or terminal.get('assessed_stage') != 'research' or terminal.get('stage_proposal_present') is not False or terminal.get('native_quiescent') is not True:
        raise ValueError('An ongoing partner or authored proposal is not a terminal missing research proposal')
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
    selectors = ['research/proposal.md', 'research/sources.json', 'research/witnesses.json', 'research/leads.json']
    selectors += freeze.get('additional_evidence_relative_paths', [])
    artifacts = []
    for key in dict.fromkeys(selectors):
        base.relative(key)
        if key not in index:
            if key == 'research/proposal.md':
                raise ValueError('Actual research proposal required')
            continue
        artifacts.append((key, base.read_pin(index[key])))
    evidence = []
    if freeze.get('evidence_freeze'):
        ef = json.loads(base.read_pin(freeze['evidence_freeze']))
        if ef['schema'] != 'er9.blind-evidence-freeze.v1' or ef['candidate_output_freeze_sha256'] != freeze['sha256']:
            raise ValueError('External evidence must bind the actual same-arm research freeze')
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
    present = {'alias': present_alias, 'artifact_status': 'FROZEN_TERMINAL_RESEARCH_STAGE_PARTIAL',
               'assessed_stage': 'research', 'designated_final': None, 'stage_proposal': rows['research/proposal.md'], 'full_pipeline_quality': 'UNASSESSED', 'full_case_PASS_eligible': False, 'source_catalog': rows.get('research/sources.json'),
               'witness_catalog': rows.get('research/witnesses.json'), 'leads': rows.get('research/leads.json'),
               'additional_anonymous_evidence': [v for k, v in rows.items() if not k.startswith('research/')] + evidence_rows,
               'missing_stage_catalogs': [k for k in ('research/sources.json', 'research/witnesses.json', 'research/leads.json') if k not in rows]}
    absent = {'alias': missing_alias, 'artifact_status': 'TERMINAL_MISSING_RESEARCH_STAGE_PROPOSAL', 'assessed_stage': 'research', 'stage_proposal': None, 'designated_final': None, 'full_pipeline_quality': 'UNASSESSED', 'full_case_PASS_eligible': False,
              'operational_status': 'FAIL', 'quality_status': 'UNASSESSED',
              'phase1_notice': 'Research proposal artifact missing after terminal research stage. Temporary source material cannot substitute. No current-output semantic assessment is possible for this partner.'}
    manifest = {'protocol_version': 'ER9-independent-output-v1', 'dispatch_interface_version': '1.3',
                'evaluation_id': binding['evaluation_id'], 'scope': 'one_terminal_research_partial_with_terminal_missing_stage_partner', 'assessed_stage': 'research',
                'track': 'B', 'prepared_utc': base.now(), 'candidate_outputs_frozen_utc': binding['candidate_outputs_frozen_utc'],
                'requested_evaluator': {'model': 'gpt-6.1-sol', 'reasoning_effort': 'xhigh'}, 'observed_evaluator': None,
                'result_directory': binding['result_directory'], 'task': task,
                'anonymous_outputs': sorted([present, absent], key=lambda row: row['alias']),
                'common_predeclared_checks': [{'check_id': c['id'], 'obligation_ids': c['obligation_ids'], 'neutral_question': c['question']} for c in checks],
                'assessment_plan': binding['assessment_plan'],
                'comparison_boundary': 'INCOMPLETE_STAGE_PAIR. Assess actual research proposal under original brief/common criteria/important checks. Final delivery, later repair and full pipelines remain UNASSESSED. Missing partner quality UNASSESSED; no quality equivalence, winner, recipe qualification or mechanism effect.',
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
            'research_outputs': 1, 'terminal_missing_research_proposals': 1, 'designated_finals': 0, 'status': 'PREPARED_NOT_EVALUATED'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--coordinator-binding', required=True); parser.add_argument('--output', required=True)
    parser.add_argument('--private-sidecar', required=True); args = parser.parse_args()
    print(json.dumps(make(args.coordinator_binding, args.output, args.private_sidecar)))


if __name__ == '__main__':
    main()
