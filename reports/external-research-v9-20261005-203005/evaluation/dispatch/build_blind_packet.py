#!/usr/bin/env python3
"""Coordinator-only: make an anonymous packet from pinned terminal final freezes."""
import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import secrets
from datetime import datetime, timezone


def now():
    return datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')


def sha(data):
    return hashlib.sha256(data).hexdigest()


def regular(path):
    path = Path(path).absolute()
    if any(part.is_symlink() for part in (path, *path.parents)) or not path.is_file():
        raise ValueError('Pinned regular file required')
    return path


def read_pin(binding):
    data = regular(binding['path']).read_bytes()
    if sha(data) != binding['sha256']:
        raise ValueError('Pinned bytes changed')
    return data


def relative(value):
    path = PurePosixPath(value)
    if value in ('', '.') or path.is_absolute() or '..' in path.parts or path.as_posix() != value:
        raise ValueError('Canonical relative artifact path required')
    return path


def save(path, value):
    path.write_text(json.dumps(value, indent=2) + '\n')


def make(binding_path, output, private_sidecar):
    binding = json.loads(regular(binding_path).read_text())
    if len(binding['final_freezes']) != 2:
        raise ValueError('This interface requires exactly two terminal final freezes')
    output = Path(output).absolute()
    private_sidecar = Path(private_sidecar).absolute()
    if output.exists() or private_sidecar.exists():
        raise ValueError('Original packet/alias sidecar already exists; do not silently replace')
    if private_sidecar.is_relative_to(output):
        raise ValueError('Alias sidecar must remain outside the evaluator packet')
    if any(p.is_symlink() for p in (*output.parents, *private_sidecar.parents)):
        raise ValueError('Destination aliases denied')
    finals = []
    for freeze in binding['final_freezes']:
        receipt = json.loads(read_pin(freeze))
        if receipt['schema'] != 'er9.stage-output-freeze.v1' or receipt['stage'] not in ('final', 'revision', 'final_author', 'final_resolution'):
            raise ValueError('Designated final stage freeze required; not a research/critic draft')
        if receipt['pair_id'] != binding['pair_id']:
            raise ValueError('Freeze belongs to another pair')
        if not receipt.get('native_quiescent'):
            raise ValueError('Terminal native quiescence must be established before packet copy')
        index = {row['relative_path']: row for row in receipt['artifacts']}
        selectors = ['final/proposal.md', 'final/sources.json', 'final/witnesses.json', 'final/leads.json']
        selectors += freeze.get('additional_evidence_relative_paths', [])
        artifacts = []
        for key in dict.fromkeys(selectors):
            relative(key)
            if key not in index:
                if key == 'final/proposal.md':
                    raise ValueError('No designated final proposal; report incomplete output separately')
                continue
            row = index[key]
            artifacts.append((key, read_pin(row)))
        evidence = []
        if freeze.get('evidence_freeze'):
            evidence_manifest = json.loads(read_pin(freeze['evidence_freeze']))
            if evidence_manifest['schema'] != 'er9.blind-evidence-freeze.v1':
                raise ValueError('Pinned positive evidence freeze required')
            if evidence_manifest['candidate_output_freeze_sha256'] != freeze['sha256']:
                raise ValueError('External evidence must bind this exact same-arm final freeze')
            evidence_names = set()
            for row in evidence_manifest['files']:
                key = row['relative_path']
                relative(key)
                if key in evidence_names:
                    raise ValueError('Duplicate anonymous evidence path')
                evidence_names.add(key)
                if row['evidence_kind'] not in ('public_source_capture', 'candidate_execution_receipt',
                        'candidate_code', 'candidate_input', 'candidate_stdout', 'candidate_stderr', 'candidate_exit'):
                    raise ValueError('Phase-1 evidence kind not admitted')
                evidence.append((key, read_pin(row), row))
        finals.append((freeze, receipt, artifacts, evidence))
    task_bytes = {name: read_pin(source) for name, source in binding['task'].items()}
    checks = json.loads(task_bytes['important_checks'])['checks']
    secrets.SystemRandom().shuffle(finals)
    output.mkdir(parents=True)
    (output / 'task').mkdir()
    task = {}
    for name, source in binding['task'].items():
        data = task_bytes[name]
        dest = output / 'task' / (name + Path(source['path']).suffix)
        dest.write_bytes(data)
        task[name] = {'path': str(dest), 'sha256': sha(data)}
    anonymous, private = [], []
    for alias, (freeze, receipt, artifacts, evidence) in zip(('A', 'B'), finals):
        directory = output / 'outputs' / alias
        directory.mkdir(parents=True)
        rows = {}
        for key, data in artifacts:
            dest = directory / relative(key)
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(data)
            rows[key] = {'path': str(dest), 'sha256': sha(data)}
        evidence_rows = []
        for key, data, metadata in evidence:
            dest = directory / 'evidence' / relative(key)
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(data)
            evidence_rows.append({'path': str(dest), 'sha256': sha(data),
                                  'evidence_kind': metadata['evidence_kind'],
                                  'original_sha256': metadata.get('original_sha256'),
                                  'redaction_policy': metadata.get('redaction_policy', 'exact bytes')})
        anonymous.append({
            'alias': alias,
            'designated_final': rows['final/proposal.md'],
            'source_catalog': rows.get('final/sources.json'),
            'witness_catalog': rows.get('final/witnesses.json'),
            'leads': rows.get('final/leads.json'),
            'additional_anonymous_evidence': [v for k, v in rows.items() if not k.startswith('final/')] + evidence_rows,
            'missing_catalogs': [k for k in ('final/sources.json', 'final/witnesses.json', 'final/leads.json') if k not in rows]
        })
        private.append({'alias': alias, 'freeze': freeze, 'job_id': receipt['job_id'], 'arm': receipt['arm'],
                        'operational_complete': receipt['operational_complete'],
                        'native_receipt': receipt['native_receipt'], 'original_artifact_inventory': receipt['artifacts'],
                        'external_evidence_metadata': [row for key, data, row in evidence]})
    manifest = {
        'protocol_version': 'ER9-independent-output-v1', 'evaluation_id': binding['evaluation_id'],
        'scope': 'one_coherent_pair', 'track': 'B', 'prepared_utc': now(),
        'candidate_outputs_frozen_utc': binding['candidate_outputs_frozen_utc'],
        'requested_evaluator': {'model': 'gpt-6.1-sol', 'reasoning_effort': 'xhigh'},
        'observed_evaluator': None, 'result_directory': binding['result_directory'],
        'task': task, 'anonymous_outputs': anonymous,
        'common_predeclared_checks': [{'check_id': c['id'], 'obligation_ids': c['obligation_ids'], 'neutral_question': c['question']} for c in checks],
        'assessment_plan': binding['assessment_plan'],
        'blinding': {
            'hidden_fields': ['arm_assignment', 'economics', 'prior_grades', 'method_history'],
            'known_hints_at_dispatch': binding.get('known_hints_at_dispatch', []),
            'byte_policy': 'Exact frozen output bytes retained. Incidental identity hints inside substantive artifacts must be disclosed by evaluator, not rewritten.',
            'allocation_record': 'coordinator-only sidecar, excluded from evaluator packet',
            'phase2_material_release': 'only after immutable current_output_judgment.json saved'
        },
        'outputs': ['current_output_judgment.json', 'report.json', 'REVIEW.md'],
        'private_expected_truth_policy': 'post-freeze evaluator-only; no candidate access; holdout notes withheld until locked block over'
    }
    save(output / 'dispatch.json', manifest)
    private_sidecar.parent.mkdir(parents=True, exist_ok=True)
    descriptor = os.open(private_sidecar, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, 'w') as file:
        json.dump({'evaluation_id': binding['evaluation_id'], 'created_utc': now(), 'alias_map': private}, file, indent=2)
        file.write('\n')
    return {'packet': str(output), 'dispatch_sha256': sha((output / 'dispatch.json').read_bytes()),
            'anonymous_outputs': len(anonymous), 'status': 'PREPARED_NOT_EVALUATED'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--coordinator-binding', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--private-sidecar', required=True)
    args = parser.parse_args()
    print(json.dumps(make(args.coordinator_binding, args.output, args.private_sidecar)))


if __name__ == '__main__':
    main()
