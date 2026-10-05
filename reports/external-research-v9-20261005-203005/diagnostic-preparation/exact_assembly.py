#!/usr/bin/env python3
"""Strict text-only unified-diff assembly; no native launches or semantic repair."""
import argparse
import json
import re
import time
from pathlib import Path
import prepare as p

MAX_BYTES = 2_000_000
HUNK = re.compile(r'^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(?:.*)\r?\n?$')


def apply_exact(original, diff):
    if len(original.encode()) > MAX_BYTES or len(diff.encode()) > MAX_BYTES or '\x00' in original + diff:
        raise ValueError('Bounded UTF-8 text only')
    src = original.splitlines(keepends=True)
    lines = diff.splitlines(keepends=True)
    if len(lines) < 3:
        raise ValueError('One strict unified diff required')
    old = lines[0].rstrip('\r\n').split('\t', 1)[0]
    new = lines[1].rstrip('\r\n').split('\t', 1)[0]
    if old not in ('--- proposal.md', '--- a/proposal.md') or new not in ('+++ proposal.md', '+++ b/proposal.md'):
        raise ValueError('Only declared proposal.md target allowed')
    result = []
    cursor = 0
    i = 2
    hunks = 0
    while i < len(lines):
        m = HUNK.match(lines[i])
        if not m:
            raise ValueError('Extra file/header or non-unified payload denied')
        old_start, old_n, new_start, new_n = m.groups()
        old_start, new_start = int(old_start), int(new_start)
        old_n, new_n = int(old_n) if old_n is not None else 1, int(new_n) if new_n is not None else 1
        at = old_start if old_n == 0 else old_start - 1
        new_at = new_start if new_n == 0 else new_start - 1
        if at < cursor or at > len(src):
            raise ValueError('Nonmonotonic/out-of-range original hunk')
        result.extend(src[cursor:at])
        cursor = at
        if len(result) != new_at:
            raise ValueError('New hunk location inconsistent; no offset permitted')
        i += 1
        seen_old = seen_new = 0
        while seen_old < old_n or seen_new < new_n:
            if i >= len(lines) or not lines[i] or lines[i][0] not in ' +-':
                raise ValueError('Incomplete hunk')
            operation = lines[i][0]
            payload = lines[i][1:]
            i += 1
            if i < len(lines) and lines[i].rstrip('\r\n') == '\\ No newline at end of file':
                if payload.endswith('\r\n'):
                    payload = payload[:-2]
                elif payload.endswith('\n'):
                    payload = payload[:-1]
                else:
                    raise ValueError('Invalid newline marker')
                i += 1
            if operation in ' -':
                if cursor >= len(src) or src[cursor] != payload:
                    raise ValueError('Original context differs; zero fuzz/offset required')
                cursor += 1
                seen_old += 1
            if operation in ' +':
                result.append(payload)
                seen_new += 1
            if seen_old > old_n or seen_new > new_n:
                raise ValueError('Hunk counts inconsistent')
        hunks += 1
    result.extend(src[cursor:])
    assembled = ''.join(result)
    if len(assembled.encode()) > MAX_BYTES:
        raise ValueError('Assembled text exceeds bound')
    return assembled, hunks


def assemble(original_ref, native_freeze_ref, destination, pair_id):
    start = time.monotonic()
    original = p.regular(original_ref['path'])
    freeze_path = p.regular(native_freeze_ref['path'])
    if p.sha(original) != original_ref['sha256'] or p.sha(freeze_path) != native_freeze_ref['sha256']:
        raise ValueError('Exact frozen original/native patch pins required')
    freeze = json.loads(freeze_path.read_text())
    if freeze.get('operational_complete') is not True or freeze.get('pair_id') != pair_id or freeze.get('arm') != 'treatment' or (freeze.get('native_goal_starts') or 0) < 1:
        raise ValueError('Actual complete same-pair treatment patch native freeze required')
    artifacts = {row['relative_path']: row for row in freeze['artifacts']}
    patch = artifacts.get('amendment.diff')
    if not patch:
        raise ValueError('Candidate patch absent')
    for row in artifacts.values():
        if p.sha(p.regular(row['path'])) != row['sha256']:
            raise ValueError('Frozen candidate artifact changed')
    # Decode exact bytes; no implicit newline conversion or source interpretation.
    final, hunks = apply_exact(original.read_bytes().decode('utf-8'), Path(patch['path']).read_bytes().decode('utf-8'))
    out = destination / 'out/final'
    out.mkdir(parents=True, exist_ok=False)
    (out / 'proposal.md').write_bytes(final.encode('utf-8'))
    for name in ('sources.json', 'witnesses.json', 'leads.json'):
        row = artifacts.get('final/' + name)
        if not row:
            raise ValueError('Candidate current supporting catalog absent: ' + name)
        body = Path(row['path']).read_bytes()
        json.loads(body.decode('utf-8'))
        (out / name).write_bytes(body)
    inventory = [{'path': str(path), 'relative_path': path.relative_to(destination / 'out').as_posix(),
                  'sha256': p.sha(path), 'bytes': path.stat().st_size} for path in sorted(out.iterdir())]
    result = {'schema': 'er9.mechanical-assembly-freeze.v1', 'pair_id': pair_id,
              'arm': 'treatment', 'stage': 'mechanical_exact_assembly',
              'operational_complete': True, 'semantic_quality': 'PENDING_INDEPENDENT_EVALUATION',
              'native_goal_starts': 0, 'mechanical_operation': 'STRICT_UNIFIED_DIFF_ZERO_FUZZ_ZERO_OFFSET',
              'original_proposal': original_ref, 'candidate_patch_native_freeze': native_freeze_ref,
              'hunks_applied': hunks, 'artifacts': inventory,
              'elapsed_seconds': time.monotonic() - start,
              'premium_semantic_changes': False, 'native_spawned': False}
    p.put(destination / 'ASSEMBLY_FREEZE.json', result)
    return result


def main():
    a = argparse.ArgumentParser(description=__doc__)
    a.add_argument('--original', type=Path, required=True)
    a.add_argument('--original-sha256', required=True)
    a.add_argument('--native-freeze', type=Path, required=True)
    a.add_argument('--native-freeze-sha256', required=True)
    a.add_argument('--pair-id', required=True)
    a.add_argument('--destination', type=Path, required=True)
    x = a.parse_args()
    result = assemble({'path': str(x.original.absolute()), 'sha256': x.original_sha256},
                      {'path': str(x.native_freeze.absolute()), 'sha256': x.native_freeze_sha256},
                      x.destination.absolute(), x.pair_id)
    print(json.dumps({'operational_complete': result['operational_complete'], 'native_goal_starts': 0,
                      'semantic_quality': result['semantic_quality']}))


if __name__ == '__main__':
    main()
