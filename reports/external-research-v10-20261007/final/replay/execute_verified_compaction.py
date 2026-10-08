#!/usr/bin/env python3
"""Execute only explicit owned, hash-bound duplicate/reconstruction cleanup.

No directory-wide deletion, provider state mutation, or source qualification is
performed. Every changed file is checked immediately against retained evidence.
"""
from pathlib import Path
import argparse
import datetime
import hashlib
import json
import os
import re


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def load_bound(ref):
    p = Path(ref['path'])
    raw = p.read_bytes()
    assert sha(raw) == ref['sha256'], str(p)
    return json.loads(raw)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--config', type=Path, required=True)
    ap.add_argument('--receipt', type=Path, required=True)
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    assert not a.receipt.exists()
    cfg_body = a.config.read_bytes()
    cfg = json.loads(cfg_body)
    assert cfg['schema'] == 'ER10_ROOT_EXACT_VERIFIED_COMPACTION_CONFIG_V1'
    runtime = Path(cfg['owned_runtime_root']).resolve()
    checkout = Path(cfg['publication_checkout']).resolve()
    assert cfg['full_corpus_deletion_authorized'] is False
    quiet = load_bound(cfg['actual_quiet_receipt'])
    assert quiet['all_owned_candidate_review_helper_coordinator_task_trees_actual_quiet'] is True
    pub = load_bound(cfg['verified_publication_receipt'])
    assert pub['status'] == 'PASS' and pub['all_new_blobs_remote_git_identity_and_size_verified'] is True
    archive = load_bound(cfg['verified_private_archive_receipt'])
    assert archive['status'] == 'PASS' and archive['all_archive_members_exactly_verified'] is True
    archive_path = Path(archive['archive_path'])
    assert sha(archive_path.read_bytes()) == archive['archive_sha256']
    reconstruction = load_bound(cfg['fixed_source_reconstruction_catalog'])
    fixed = {(r['sha256'], r['bytes']): r for r in reconstruction['sources']}
    actions = load_bound(cfg['exact_action_plan'])['actions']
    assert len({x['original_path'] for x in actions}) == len(actions)
    changed, skipped = [], []
    for row in actions:
        path = Path(row['original_path'])
        # Lexical path and current resolved owner must both be within this run.
        if not path.is_absolute() or not path.is_relative_to(runtime):
            raise ValueError('Unowned cleanup path: ' + str(path))
        if path.is_symlink():
            skipped.append({'original_path': str(path), 'reason': 'Already an alias; unchanged'})
            continue
        if not path.is_file() or not path.resolve().is_relative_to(runtime):
            skipped.append({'original_path': str(path), 'reason': 'Absent or no longer owned; unchanged'})
            continue
        before = path.stat()
        raw = path.read_bytes()
        if sha(raw) != row['sha256'] or len(raw) != row['bytes']:
            skipped.append({'original_path': str(path), 'reason': 'Current bytes differ from explicit plan; unchanged'})
            continue
        action = row['action']
        if action == 'relative_alias':
            retained = Path(row['retained_path'])
            target = retained.resolve()
            assert target != path.resolve()
            assert target.is_relative_to(runtime) or target.is_relative_to(checkout / 'reports/external-research-v10-20261007')
            target_raw = target.read_bytes()
            assert sha(target_raw) == row['sha256'] and len(target_raw) == row['bytes']
            if a.dry_run:
                changed.append({**row, 'prospective_original_allocated_bytes': before.st_blocks * 512})
                continue
            # The staged alias replaces exactly one verified file atomically.
            tmp = path.with_name(path.name + '.er10-owned-relative-alias.tmp')
            assert not tmp.exists() and not tmp.is_symlink()
            os.symlink(os.path.relpath(target, path.parent), tmp)
            now = path.stat()
            assert (now.st_ino, now.st_size, now.st_mtime_ns) == (before.st_ino, before.st_size, before.st_mtime_ns)
            os.replace(tmp, path)
            assert path.resolve() == target and sha(path.read_bytes()) == row['sha256']
        elif action == 'remove_exact_reconstructible_source_cache':
            key = (row['sha256'], row['bytes'])
            assert key in fixed
            proof = fixed[key]
            assert proof['whole_original_body_identity_verified'] is True
            assert proof['url'].startswith('https://raw.githubusercontent.com/')
            assert re.fullmatch(r'https://raw\.githubusercontent\.com/[^/]+/[^/]+/[0-9a-f]{40}/[^?#]+', proof['url'])
            assert row['source_role'] == 'raw_source_cache'
            assert row['whole_original_source_reconstruction'] is True
            if a.dry_run:
                changed.append({**row, 'prospective_original_allocated_bytes': before.st_blocks * 512})
                continue
            now = path.stat()
            assert (now.st_ino, now.st_size, now.st_mtime_ns) == (before.st_ino, before.st_size, before.st_mtime_ns)
            path.unlink()
            assert not path.exists()
        else:
            raise ValueError('Unsupported cleanup action: ' + str(action))
        changed.append({**row, 'removed_original_allocated_bytes': before.st_blocks * 512,
                        'alias_allocated_bytes': path.lstat().st_blocks * 512 if path.is_symlink() else 0,
                        'exact_hash_and_owner_rechecked_immediately': True})
    out = {'schema': 'ER10_ROOT_EXECUTED_EXACT_VERIFIED_COMPACTION_RECEIPT_V1',
           'recorded_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'status': 'DRY_RUN_NO_MUTATIONS' if a.dry_run else 'PARTIAL_SAFE_COMPACTION_WITH_EXPLICIT_SOURCE_HOLDS',
           'config_sha256': sha(cfg_body), 'actions': changed, 'skipped': skipped,
           'changed_files': len(changed),
           'removed_duplicate_or_reconstructible_logical_bytes': 0 if a.dry_run else sum(x['bytes'] for x in changed),
           'removed_original_allocated_bytes': sum(x.get('removed_original_allocated_bytes', 0) for x in changed),
           'new_alias_allocated_bytes': sum(x.get('alias_allocated_bytes', 0) for x in changed),
           'planned_logical_bytes': sum(x['bytes'] for x in changed),
           'mutations_executed': not a.dry_run,
           'all_source_bodies_removed': False,
           'unqualified_original_unique_sources_kept': True,
           'shared_provider_state_or_other_owner_files_changed': False,
           'no_directory_wide_or_unbound_deletion': True,
           'limits': cfg['limits']}
    with a.receipt.open('x') as f:
        json.dump(out, f, indent=2)
        f.write('\n')
    print(json.dumps({k: out[k] for k in ['status', 'changed_files', 'removed_duplicate_or_reconstructible_logical_bytes', 'removed_original_allocated_bytes', 'new_alias_allocated_bytes']}))


if __name__ == '__main__':
    main()
