#!/usr/bin/env python3
"""Read-only offline proposal checks. No imports of runners, approval writes or paid calls."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LAB = ROOT.parent


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def check():
    errors = []
    policy = json.loads((ROOT / 'proposal.json').read_text())
    if policy['launch_enabled'] or policy['authorized_schedules'] or policy['status'] != 'PREPARED_UNAUTHORIZED':
        errors.append('proposal must remain unauthorized and nondispatching')
    for path, digest in (policy['reused_files_sha256'] | policy['runtime_pins_sha256']).items():
        file = LAB / path
        if not file.is_file() or sha(file) != digest:
            errors.append(f'pinned dependency changed/missing: {path}')
    case = LAB / policy['case_manifest']['root']
    manifest_path = case / 'MANIFEST.sha256.json'
    if sha(manifest_path) != policy['case_manifest']['manifest_sha256']:
        errors.append('case manifest changed')
    manifest = json.loads(manifest_path.read_text())
    present = {p.relative_to(case).as_posix() for p in case.rglob('*') if p.is_file() or p.is_symlink()}
    if present != set(manifest) | {'MANIFEST.sha256.json'}:
        errors.append('case membership differs')
    for path, digest in manifest.items():
        file = case / path
        if file.is_symlink() or not file.is_file() or sha(file) != digest:
            errors.append(f'case file changed/missing/linked: {path}')
    common = (ROOT / 'prompts/common.txt').read_text()
    prompts = {}
    for name in ('control', 'maintained'):
        prompt = (ROOT / f'prompts/investigator-{name}.txt').read_text()
        expected = common + '\n' + (ROOT / f'prompts/{name}-carrier.txt').read_text()
        if prompt != expected:
            errors.append(f'{name}: common+carrier identity differs')
        # Hygiene check only, not a semantic leakage proof. Examples specific to
        # the historical known-answer diagnosis never belong in these prompts.
        for marker in ('OME05-C', 'O-010', 'O-020', 'O-048', 'O-074', 'B-081', 'S034', 'source.image', 'endianness', 'transpose', '1 TB'):
            if marker in prompt:
                errors.append(f'{name}: historical answer marker {marker!r}')
        prompts[name] = sha(ROOT / f'prompts/investigator-{name}.txt')
    limits = policy['limits']
    if len(policy['proposed_schedule']) != 4 or limits['candidate_assignments'] != 4 or limits['evaluation_assignments'] != 2:
        errors.append('schedule/evaluation allocation differs from one pair per app')
    if limits['candidate_seconds_total'] != 4 * limits['candidate_seconds_each'] or limits['evaluation_seconds_total'] != 2 * limits['evaluation_seconds_each']:
        errors.append('time-cap arithmetic differs')
    if limits['retries'] != 0 or limits['replacement_slots'] != 0:
        errors.append('retry/replacement scope changed')
    result = {'kind': 'offline preparation check; not run authorization or semantic quality proof',
              'errors': errors, 'ok': not errors, 'corpus_files': len(manifest),
              'candidate_prompt_sha256': prompts, 'calls_made': 0}
    return result


if __name__ == '__main__':
    result = check()
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result['ok'] else 1)
