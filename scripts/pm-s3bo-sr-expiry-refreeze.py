#!/usr/bin/env python3
"""C12-SR: refreeze the SP-275 restore_point.expired v5 package for DL-076.

The pinned v5 package (Plans/restore_point_expired_contract_fixtures.json
#/frozen_joined_subject, manifest SHA-256 b458da5c...) stored the ten-field live
SP-278 token, with redb_snapshot_id, in every expiry checkpoint. DL-076 / SP-311
keep that id a live transaction fence only: a stored checkpoint holds the
nine-field durable projection and every read joins the snapshot id of its own
live read. This script:

1. authenticates the archived v5 package byte-for-byte against its own manifest
   (90 entries) and the Plans pin;
2. copies the package lineage (v1..v5 and the build scripts) unchanged;
3. writes v6 = v5 plus exactly the DL-076 change: the expiry contract schema is
   today's Plans/restore_point_expired_contracts.schema.json (its only
   difference from v5 is the stored token), the standalone checkpoint schema and
   proposed family row follow it, and validate_v6.py stores token() = the
   nine-field durable projection while the live owner resolution and the
   read-time snapshot join keep the ten-field live token (live_token());
4. runs validate_v6.py and check_fidelity_v6.py inside v6 and writes the v6
   manifest.

Every other schema, codec, family and policy object, and every case's declared
validity, is unchanged. Native execution remains NOT_RUN.
"""
import argparse
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = Path('/mnt/Cursor/archive/PM-Experiments/vm-archive-20260925/event-authority-step08-restore-expired-20260911')
PINNED_PATH = '/home/sittingmongoose/PM-Experiments/event-authority-step08-restore-expired-20260911/v5/manifest.json'
PINNED_SHA = 'b458da5c7684dc7a4dcfc8f3f38bc7b09722ca0f1d3136dd34602d2f40038654'
TARGET = Path('/mnt/Cursor/PM-Experiments/ea-c12-sr-expiry-refreeze-20261114/event-authority-step08-restore-expired-20260911')
TOKEN_FIELDS = ['storage_instance_id', 'checkpoint_key', 'checkpoint_ref', 'generation_id', 'generation_anchor_sha256',
                'frontier_revision', 'frontier_sha256', 'index_dataset_name', 'source_selection']


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def authenticate():
    fixture = json.loads((ROOT / 'Plans/restore_point_expired_contract_fixtures.json').read_text())
    pin = fixture['frozen_joined_subject']
    manifest = ARCHIVE / 'v5' / 'manifest.json'
    checks = {'pin_path': pin['path'], 'pin_sha256': pin['sha256'], 'archive_manifest_sha256': sha(manifest)}
    if pin['path'] not in (PINNED_PATH,) and pin['sha256'] != PINNED_SHA:
        # Already repinned: authenticate the archived original by its own hash.
        checks['note'] = 'Plans already names the v6 refreeze; the v5 original is authenticated by its recorded hash'
    if sha(manifest) != PINNED_SHA:
        raise SystemExit('archived v5 manifest does not match the pinned SHA-256')
    entries = json.loads(manifest.read_text())['files']
    bad = []
    for entry in entries:
        relative = entry['path'].split('/v5/', 1)[1]
        if sha(ARCHIVE / 'v5' / relative) != entry['sha256']:
            bad.append(relative)
    if bad:
        raise SystemExit('archived v5 entries changed: ' + ', '.join(bad))
    checks['verified_entries'] = len(entries)
    return checks


def drop_stored_snapshot(node):
    """Remove redb_snapshot_id from every stored generic_read_token schema under node."""
    changed = 0
    if isinstance(node, dict):
        for key, value in node.items():
            if key == 'generic_read_token' and isinstance(value, dict) and 'redb_snapshot_id' in value.get('properties', {}):
                del value['properties']['redb_snapshot_id']
                value['required'] = [x for x in value['required'] if x != 'redb_snapshot_id']
                changed += 1
            changed += drop_stored_snapshot(value)
    elif isinstance(node, list):
        for value in node:
            changed += drop_stored_snapshot(value)
    return changed


REPLACEMENTS = [
    ("def token(v):return {**selection(v),'redb_snapshot_id':'snapshot:'+current(v)['frontier']['redb_transaction_id']}",
     "def token(v):return selection(v)  # DL-076: stored checkpoint token is the nine-field durable projection\n"
     "def live_token(v):return {**selection(v),'redb_snapshot_id':'snapshot:'+current(v)['frontier']['redb_transaction_id']}\n"
     "def dl076_project(v):\n"
     " # The hash-pinned v4 review fixture predates DL-076: project only its STORED checkpoint tokens.\n"
     " v=copy.deepcopy(v);cp=v['checkpoint']\n"
     " for t in [cp]+[x['checkpoint'] for x in cp.get('retired_generations',[])]:t['generic_read_token'].pop('redb_snapshot_id',None)\n"
     " return v"),
    ("validate(J(review_repro_path));summary['independent_exact_post_E1_hold_repro']='PASS'",
     "validate(dl076_project(J(review_repro_path)));summary['independent_exact_post_E1_hold_repro']='PASS';"
     "summary['independent_repro_projection']='hash-pinned v4 review fixture, stored checkpoint tokens projected by DL-076 only'"),
    ("generic_read_token=token(generic),cursor=cursor(generic));v['snapshot_id']=token(generic)['redb_snapshot_id'];own.bind_current(v,mpdig,token)",
     "generic_read_token=token(generic),cursor=cursor(generic));v['snapshot_id']=live_token(generic)['redb_snapshot_id'];own.bind_current(v,mpdig,live_token)"),
    ("expect(cp['generic_read_token']==token(v['generic'])and v['snapshot_id']==token(v['generic'])['redb_snapshot_id'],'full generic snapshot token')",
     "expect(cp['generic_read_token']==token(v['generic'])and v['snapshot_id']==live_token(v['generic'])['redb_snapshot_id'],'durable nine-field token and live snapshot join')"),
    # Every owner-resolution make/check call: the transient owner resolution
    # holds the current LIVE token (its schema is the ten-field SP-278 read_token).
    (",gi.bdig,token)", ",gi.bdig,live_token)"),
    ("own.bind_current(b,mpdig,token)", "own.bind_current(b,mpdig,live_token)"),
]


def write_validator(v5, v6):
    text = (v5 / 'validate_v5.py').read_text()
    counts = []
    for old, new in REPLACEMENTS:
        n = text.count(old)
        if n == 0:
            raise SystemExit('validate_v5.py anchor missing: ' + old[:60])
        counts.append(n)
        text = text.replace(old, new)
    for name in ('joined', 'generation', 'retirement-publication'):
        text = text.replace(name + '-v5-fixtures.json', name + '-v6-fixtures.json')
    text = text.replace("'v5-static-validation.json'", "'v6-static-validation.json'")
    text = text.replace('"""Static expiry-only joins', '"""V6 (DL-076 refreeze). Static expiry-only joins', 1)
    (v6 / 'validate_v6.py').write_text(text)
    return counts


FIDELITY_OLD = "assert sc['$defs']['checkpoint']['properties']['generic_read_token']==J(S/'event_record_index_checkpoint.schema.json')['$defs']['read_token']"
FIDELITY_NEW = ("live=J(S/'event_record_index_checkpoint.schema.json')['$defs']['read_token'];durable=copy.deepcopy(live);del durable['properties']['redb_snapshot_id'];durable['required']=[k for k in durable['required'] if k!='redb_snapshot_id']\n"
                "assert sc['$defs']['checkpoint']['properties']['generic_read_token']==durable  # DL-076 nine-field durable projection")
FIDELITY_TAIL = """
import json as _json
# Plans/restore_point_expired_contracts.schema.json at the refreeze (unchanged since DL-076 commit fe46283fc5).
assert H((P/'restore_point_expired_contracts.schema.json').read_bytes())=='{plans_sha}', 'v6 expiry contract schema is the pinned Plans schema'
_v5=_json.loads((P.parent/'v5'/'restore_point_expired_contracts.schema.json').read_text())
def _strip(n):
    if isinstance(n,dict):
        out={{k:_strip(v) for k,v in n.items()}}
        if 'properties' in out and isinstance(out.get('properties'),dict) and 'redb_snapshot_id' in out['properties'] and 'frontier_sha256' in out['properties']:
            del out['properties']['redb_snapshot_id']; out['required']=[k for k in out['required'] if k!='redb_snapshot_id']
        return out
    if isinstance(n,list):return [_strip(v) for v in n]
    return n
assert _strip(_v5)==sc, 'v6 differs from v5 only by the stored redb_snapshot_id'
for _name in ['expiry-owner-resolution.schema.proposed.json','summary-codec-admission.schema.proposed.json','retention-summary-v2.schema.proposed.json','expiry-commit.schema.json']:
    assert (P/_name).read_bytes()==(P.parent/'v5'/_name).read_bytes(),_name
print('V6 DL-076 refreeze: only the stored checkpoint token changed; live owner token and every other schema unchanged')
"""


def write_fidelity(v5, v6):
    text = (v5 / 'check_fidelity_v5.py').read_text()
    if text.count(FIDELITY_OLD) != 1:
        raise SystemExit('check_fidelity_v5.py token assertion anchor missing')
    text = text.replace(FIDELITY_OLD, FIDELITY_NEW)
    text = text.replace("for name in ['expiry-owner-resolution.schema.proposed.json','restore_point_expired_contracts.schema.json','summary-codec-admission.schema.proposed.json']:\n assert (P/name).read_bytes()==(P.parent/'v4'/name).read_bytes(),name\nprint('V5 all schemas unchanged; only original E3 held-point comparison corrected')",
                        "print('V5 lineage schema checks are carried by v5 itself; V6 checks follow')")
    text = text.replace("(P/'fidelity-v5.json')", "(P/'fidelity-v6.json')").replace("P/'fidelity-v5.json'", "P/'fidelity-v6.json'")
    text = text.replace("'fidelity-v5.json'", "'fidelity-v6.json'")
    if 'import copy' not in text.split('\n', 3)[2] and 'copy' not in text.split('\n')[2]:
        text = text.replace('import json,hashlib,ast,re,yaml,subprocess,copy', 'import json,hashlib,ast,re,yaml,subprocess,copy')
    # The v2..v4 lineage asserts compared the then-current directory with its
    # predecessors; in v6 they keep running against the unchanged v5 copy.
    lineage = "for name in ['checkpoint-family-row.proposed.json','expiry-commit-family-row.proposed.json','restore_point_expired_contracts.schema.json','retention-summary-v2.schema.proposed.json']:\n assert (P/name).read_bytes()==(prior_dir/name).read_bytes(),name"
    if text.count(lineage) != 1:
        raise SystemExit('check_fidelity_v5.py lineage anchor missing')
    text = text.replace(lineage, lineage.replace('(P/name)', "(P.parent/'v5'/name)"))
    text += FIDELITY_TAIL.format(plans_sha=sha(ROOT / 'Plans/restore_point_expired_contracts.schema.json'))
    (v6 / 'check_fidelity_v6.py').write_text(text)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--target', type=Path, default=TARGET)
    parser.add_argument('--force', action='store_true', help='replace an existing unfinished target')
    args = parser.parse_args()
    auth = authenticate()
    target = args.target
    if (target / 'v6' / 'manifest.json').exists() and not args.force:
        raise SystemExit('v6 already frozen at ' + str(target / 'v6') + '; it is immutable')
    if target.exists():
        if not args.force:
            raise SystemExit('target exists without a v6 manifest; rerun with --force')
        shutil.rmtree(target)
    shutil.copytree(ARCHIVE, target, ignore=shutil.ignore_patterns('__pycache__'))
    v5, v6 = target / 'v5', target / 'v6'
    shutil.copytree(v5, v6, ignore=shutil.ignore_patterns('__pycache__', 'manifest.json'))
    plans_schema = json.loads((ROOT / 'Plans/restore_point_expired_contracts.schema.json').read_text())
    (v6 / 'restore_point_expired_contracts.schema.json').write_text(
        (ROOT / 'Plans/restore_point_expired_contracts.schema.json').read_text())
    checkpoint = json.loads((v6 / 'checkpoint.schema.json').read_text())
    changed_checkpoint = drop_stored_snapshot({'generic_read_token': checkpoint['properties']['generic_read_token']})
    changed_checkpoint += drop_stored_snapshot(checkpoint['properties'])
    (v6 / 'checkpoint.schema.json').write_text(json.dumps(checkpoint, indent=2) + '\n')
    row = json.loads((v6 / 'checkpoint-family-row.proposed.json').read_text())
    row['value_schema'] = plans_schema['$defs']['checkpoint']
    (v6 / 'checkpoint-family-row.proposed.json').write_text(json.dumps(row, indent=2) + '\n')
    counts = write_validator(v5, v6)
    write_fidelity(v5, v6)
    (v6 / 'README-v6.md').write_text(
        '# restore_point.expired v6 DL-076 refreeze\n\n'
        'Authoritative entrypoints: validate_v6.py, check_fidelity_v6.py and this README. v1-v5 and every\n'
        'v5-named file in this directory are unchanged lineage.\n\n'
        'The only semantic change: every stored expiry checkpoint `generic_read_token` is the nine-field\n'
        'durable SP-278 projection (DL-076, SP-311). `redb_snapshot_id` is never stored; the live read joins\n'
        'the snapshot id of its own read (`live_token`) and the transient Storage expiry owner resolution\n'
        'keeps the live ten-field token. The contract schema equals current Plans; all other schemas, the\n'
        'shared codec, families and policy objects are unchanged, and every case keeps its declared validity.\n'
        'Built by scripts/pm-s3bo-sr-expiry-refreeze.py (C12-SR). Native execution remains NOT_RUN.\n')
    for script in ('validate_v6.py', 'check_fidelity_v6.py'):
        run = subprocess.run([sys.executable, '-B', script], cwd=v6, capture_output=True, text=True, timeout=1800)
        (v6 / (script[:-3] + '.log')).write_text(run.stdout + run.stderr)
        if run.returncode != 0:
            raise SystemExit(script + ' failed; see ' + str(v6 / (script[:-3] + '.log')))
    validation = json.loads((v6 / 'v6-static-validation.json').read_text())
    joined = json.loads((v6 / 'joined-v6-fixtures.json').read_text())
    stored = [case['id'] for case in joined if 'redb_snapshot_id' in case['value'].get('checkpoint', {}).get('generic_read_token', {})]
    if stored:
        raise SystemExit('stored token still carries redb_snapshot_id: ' + ', '.join(stored[:5]))
    files = [{'path': str(p.relative_to(v6)), 'sha256': sha(p)} for p in sorted(v6.rglob('*'))
             if p.is_file() and p.name != 'manifest.json' and '__pycache__' not in p.parts]
    manifest = {'status': 'EXTERNAL_V6_DL076_STORED_TOKEN_REFREEZE', 'prior_immutable_manifest':
                {'path': PINNED_PATH, 'archived_at': str(ARCHIVE / 'v5' / 'manifest.json'), 'sha256': PINNED_SHA,
                 'verified_entries': auth['verified_entries']},
                'authoritative_entrypoints': ['README-v6.md', 'validate_v6.py', 'check_fidelity_v6.py'],
                'change': 'stored expiry checkpoint generic_read_token = nine-field durable projection; live snapshot joined at read',
                'validator_replacements': counts, 'checkpoint_schema_tokens_changed': changed_checkpoint,
                'files': files, 'validation': validation, 'native_runtime': 'NOT_RUN', 'canonical_edits': 0}
    (v6 / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps({'manifest': str(v6 / 'manifest.json'), 'sha256': sha(v6 / 'manifest.json'), 'files': len(files),
                      'joined_cases': validation.get('joined_cases'), 'positive': validation.get('positive'),
                      'generation_cases': validation.get('generation_cases'), 'status': validation.get('status')}))
    return 0


if __name__ == '__main__':
    sys.exit(main())
