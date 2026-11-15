#!/usr/bin/env python3
"""C12-SS: refreeze the SP-270 seglog.event_appended v4-root package for DL-076.

The pinned v4-root package (Plans/seglog_append_observability_contract_fixtures.json
#/external_joined_subject, manifest SHA-256 1dbd8542...) stored the ten-field
live SP-278 token, with redb_snapshot_id, as the SP-270 reader checkpoint's
index_read_token, in reader_core and in every retired reader generation. DL-076
and SP-2210 keep that id a live transaction fence only: the stored checkpoint
holds the nine-field durable projection, and every commit and disclosure joins
the snapshot id of its own live read. This script:

1. authenticates the archived v4-root package byte-for-byte against its own
   manifest (44 entries) and the Plans pin;
2. copies the package lineage (v1, v2, v3, v4-root and the build scripts)
   unchanged;
3. writes v5 = v4-root plus exactly the DL-076 change: build_v5.py stores
   token() = the nine-field durable projection in the reader checkpoint and
   reader_core schemas and values, while the disclosure token and the reader's
   commit-transaction source token keep the live ten-field token (live_token());
   the old schema-valid negative that rewrote a stored redb_snapshot_id becomes
   the SP-2210 stored-snapshot negative, which the closed durable schema refuses;
4. runs check_v5_regressions.py (build, settlement prefix, retention and the
   twelve root regressions) and check_fidelity_v5.py inside v5, and writes the
   v5 manifest.

Every other schema, fixture, codec, family and policy object, and every case's
declared validity, is unchanged; check_fidelity_v5.py proves that every
difference between the v4-root and v5 outputs is a removed stored
redb_snapshot_id or a SHA-256 of a value that contains one. Native execution
remains NOT_RUN.
"""
import argparse
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = Path('/mnt/Cursor/archive/PM-Experiments/vm-archive-20260925/event-authority-step08-seglog-appended-20260911')
PINNED_PATH = '/home/sittingmongoose/PM-Experiments/event-authority-step08-seglog-appended-20260911/v4-root/manifest.json'
PINNED_SHA = '1dbd8542840086c1741d55cc2ada0edbc4b3c02affa552c60d4f13321251a171'
TARGET = Path('/mnt/Cursor/PM-Experiments/ea-c12-ss-seglog-refreeze-20261114/event-authority-step08-seglog-appended-20260911')
PLANS_SCHEMA = 'Plans/seglog_append_observability_contracts.schema.json'
# v4-root outputs that the v5 scripts regenerate under v5 names (not copied).
NOT_COPIED = {'manifest.json', 'README-v3.md', 'build_v3.py', 'check_retention.py', 'check_settlement_prefix.py',
              'check_v3_regressions.py', 'finish_v3.py', 'freeze_v3.py', 'v3-regression-fixtures.json',
              'v3-regression-results.json'}


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def authenticate():
    fixture = json.loads((ROOT / 'Plans/seglog_append_observability_contract_fixtures.json').read_text())
    pin = fixture['external_joined_subject']
    if pin['path'] != PINNED_PATH or pin['sha256'] != PINNED_SHA:
        raise SystemExit('Plans no longer pins the v4-root manifest: ' + json.dumps(pin))
    manifest = ARCHIVE / 'v4-root' / 'manifest.json'
    if sha(manifest) != PINNED_SHA:
        raise SystemExit('archived v4-root manifest does not match the pinned SHA-256')
    entries = json.loads(manifest.read_text())['files']
    bad = [e['path'] for e in entries if sha(ARCHIVE / 'v4-root' / e['path']) != e['sha256']]
    if bad:
        raise SystemExit('archived v4-root entries changed: ' + ', '.join(bad))
    return {'pin_path': pin['path'], 'pin_sha256': pin['sha256'], 'verified_entries': len(entries)}


BUILD_REPLACEMENTS = [
    # Stored reader token schemas (reader_checkpoint, reader_core, retired cores) become the durable projection.
    ("props.pop('index_checkpoint_ref');props['index_read_token']=copy.deepcopy(contracts['$defs']['read_token'])",
     "props.pop('index_checkpoint_ref');props['index_read_token']=durable_token_schema()  # DL-076: nine-field durable projection"),
    # token() is the stored durable token; live_token() is the ten-field token of the actual read.
    ("def token(v):\n g=current(v);return dict(",
     "def durable_token_schema():\n"
     " t=copy.deepcopy(contracts['$defs']['read_token']);del t['properties']['redb_snapshot_id'];t['required']=[x for x in t['required'] if x!='redb_snapshot_id'];return t\n"
     "def token(v):\n"
     " # DL-076 / SP-2210: a stored token is the nine-field durable projection; redb_snapshot_id is never stored.\n"
     " return {k:x for k,x in live_token(v).items() if k!='redb_snapshot_id'}\n"
     "def live_token(v):\n g=current(v);return dict("),
    ("disclosure_token=token(v)", "disclosure_token=live_token(v)"),
    ("source_token=token(v),commit_order=5", "source_token=live_token(v),commit_order=5"),
    ("t['source_token']==token(v)", "t['source_token']==live_token(v)"),
    ("expect(r['index_read_token']==e['disclosure_token']==token(v),'full generic generation anchor frontier source snapshot token')",
     "expect(r['index_read_token']==token(v) and e['disclosure_token']==live_token(v) and {k:x for k,x in e['disclosure_token'].items() if k!='redb_snapshot_id'}==r['index_read_token'],'DL-076 durable nine-field stored token joined to the live snapshot token of the read')"),
    # The stored-snapshot rewrite is no longer schema-valid: it becomes the SP-2210 stored-snapshot negative below.
    ("('wrong_generic_snapshot',['reader','index_read_token','redb_snapshot_id'],'snapshot:other','reader'),", ""),
    ("wr('joined-fixtures.json',dict(positive=positive,negative=negative,native='NOT_RUN',depth_pass=False))",
     "stored_snapshot=[]\n"
     "for _name,_who in [('stored_snapshot_in_reader_token',None),('stored_snapshot_in_retired_reader_core','retired')]:\n"
     " b=copy.deepcopy(positive['app_retained'])\n"
     " if _who=='retired':\n"
     "  _old=core(b['reader']);_old.update(state='withdrawn',publication_id='publication:reader:fixture-old-0',published_at_utc=T2,updated_at_utc=T3);_old['index_read_token']=dict(_old['index_read_token'],redb_snapshot_id=b['evidence']['disclosure_token']['redb_snapshot_id'])\n"
     "  b['reader']['retired_generations']=[dict(checkpoint=_old,retired_at_utc=T3,successor_publication_id=b['reader']['publication_id'])]\n"
     " else:b['reader']['index_read_token']['redb_snapshot_id']=b['evidence']['disclosure_token']['redb_snapshot_id']\n"
     " repair_checkpoint(b,'reader')\n"
     " try:shape(b)\n"
     " except Exception as err:stored_snapshot.append(dict(id=_name,rejected_by='closed durable token schema: '+type(err).__name__+': '+str(err).split(chr(10))[0],schema_valid=False,bundle=b));continue\n"
     " raise AssertionError('stored redb_snapshot_id accepted: '+_name)\n"
     "wr('joined-fixtures.json',dict(positive=positive,negative=negative,stored_snapshot_negative=stored_snapshot,native='NOT_RUN',depth_pass=False))"),
    ("isolated_schema_valid_negatives=len(negative),", "isolated_schema_valid_negatives=len(negative),stored_snapshot_schema_negatives=len(stored_snapshot),"),
]


def replace_all(text, replacements, name):
    counts = []
    for old, new in replacements:
        n = text.count(old)
        if n != 1:
            raise SystemExit(name + ' anchor count ' + str(n) + ': ' + old[:70])
        counts.append(n)
        text = text.replace(old, new)
    return text, counts


FIDELITY = r'''"""V5 (DL-076 refreeze) fidelity: v5 differs from v4-root only by the stored redb_snapshot_id.

Every difference between each v4-root output and its v5 counterpart must be one
of: a removed redb_snapshot_id key under a stored reader token (or the matching
schema property/required entry), a lowercase SHA-256 that changes because the
hashed value contains such a token, the one replaced stored-snapshot negative,
or the new stored-snapshot result counter. Live disclosure and commit tokens
keep redb_snapshot_id. The produced contract schema is today's Plans schema.
"""
import hashlib, json, re, sys
from pathlib import Path
P = Path(__file__).parent; V4 = P.parent / 'v4-root'
PLANS_SHA = '{plans_sha}'
J = lambda p: json.loads(Path(p).read_text())
H = lambda b: hashlib.sha256(b).hexdigest()
HEX = re.compile('^[0-9a-f]{64}$')
plans = P / 'plans-pin' / 'seglog_append_observability_contracts.schema.json'  # copy of today's Plans schema
assert H((P / 'proposed/Plans/seglog_append_observability_contracts.schema.json').read_bytes()) == H(plans.read_bytes()) == PLANS_SHA, 'v5 contract schema is the pinned Plans schema'
stored_removed = []; hashes = []; other = []
STORED = ('index_read_token', 'old_token', 'new_token')
OLD_MESSAGE = 'full generic generation anchor frontier source snapshot token'
NEW_MESSAGE = 'DL-076 durable nine-field stored token joined to the live snapshot token of the read'
renamed = []
# Only hashes of complete checkpoint values (which contain the stored reader token) may change.
HASHED_VALUE_FIELDS = ('value_sha256', 'committed_value_sha256', 'prior_value_hash', 'withdrawn_value_hash', 'after_value_hash')
def walk(a, b, path):
    if isinstance(a, dict) and isinstance(b, dict):
        for k in set(a) | set(b):
            if k not in b:
                parent = path[-1] if path else ''
                grand = path[-2] if len(path) >= 2 else ''
                if k == 'redb_snapshot_id' and (parent in STORED or (parent == 'properties' and grand in STORED)):
                    stored_removed.append(path + (k,)); continue
                other.append(('removed', path + (k,)))
            elif k not in a:
                other.append(('added', path + (k,)))
            else:
                walk(a[k], b[k], path + (k,))
    elif isinstance(a, list) and isinstance(b, list):
        if len(path) and path[-1] == 'required' and len(path) >= 2 and path[-2] in STORED and [x for x in a if x != 'redb_snapshot_id'] == b and len(a) == len(b) + 1:
            stored_removed.append(path); return
        if len(a) != len(b):
            other.append(('length', path)); return
        for i, (x, y) in enumerate(zip(a, b)):
            walk(x, y, path + (i,))
    elif a != b:
        if isinstance(a, str) and isinstance(b, str) and HEX.match(a) and HEX.match(b) and path[-1] in HASHED_VALUE_FIELDS:
            hashes.append(path); return
        if path and path[-1] == 'rejected_by' and a == OLD_MESSAGE and b == NEW_MESSAGE:
            renamed.append(path); return
        other.append(('value', path, repr(a)[:80], repr(b)[:80]))
pairs = [(n, n) for n in ['joined-evidence.schema.json', 'proposed/Plans/seglog_append_observability_contracts.schema.json',
                          'proposed-storage-families.json', 'settlement-prefix-evidence.schema.json', 'prefix-backed-settlement-read.schema.json',
                          'settlement-prefix-fixtures.json', 'settlement-prefix-results.json', 'pending-release-fixtures.json',
                          'append-reader-fixtures.json', 'retention-fixtures.json', 'retention-results.json']]
pairs.append(('v3-regression-fixtures.json', 'v5-regression-fixtures.json'))
pairs.append(('v3-regression-results.json', 'v5-regression-results.json'))
for old, new in pairs:
    walk(J(V4 / old), J(P / new), (new,))
a = J(V4 / 'joined-fixtures.json'); b = J(P / 'joined-fixtures.json')
walk(a['positive'], b['positive'], ('joined-fixtures.json', 'positive'))
old_neg = [n for n in a['negative'] if n['id'] != 'wrong_generic_snapshot']
assert len(old_neg) == len(a['negative']) - 1 and [n['id'] for n in old_neg] == [n['id'] for n in b['negative']], 'only the stored-snapshot rewrite left the schema-valid negatives'
walk(old_neg, b['negative'], ('joined-fixtures.json', 'negative'))
assert [n['id'] for n in b['stored_snapshot_negative']] == ['stored_snapshot_in_reader_token', 'stored_snapshot_in_retired_reader_core'] and all(not n['schema_valid'] for n in b['stored_snapshot_negative']), 'SP-2210 stored-snapshot negatives refused by the closed schema'
ra = J(V4 / 'results.json'); rb = J(P / 'results.json')
assert {k: v for k, v in rb.items() if k != 'stored_snapshot_schema_negatives'} == dict(ra, isolated_schema_valid_negatives=ra['isolated_schema_valid_negatives'] - 1) and rb['stored_snapshot_schema_negatives'] == 2
assert not other, other[:20]
assert stored_removed, 'no stored token changed'
def tokens(node, path=()):
    if isinstance(node, dict):
        for k, v in node.items():
            if k in ('index_read_token', 'old_token', 'new_token', 'disclosure_token', 'source_token') and isinstance(v, dict) and 'properties' not in v:
                yield k, path + (k,), v
            yield from tokens(v, path + (k,))
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from tokens(v, path + (i,))
stored = live = 0
for name in ['joined-fixtures.json', 'settlement-prefix-fixtures.json', 'append-reader-fixtures.json', 'retention-fixtures.json', 'pending-release-fixtures.json', 'v5-regression-fixtures.json']:
    for kind, path, value in tokens(J(P / name)):
        if kind in ('index_read_token', 'old_token', 'new_token') and 'stored_snapshot_negative' not in path:
            assert 'redb_snapshot_id' not in value, ('stored token keeps snapshot', name, path); stored += 1
        elif kind in ('disclosure_token', 'source_token'):
            assert 'redb_snapshot_id' in value, ('live token lost snapshot', name, path); live += 1
out = dict(status='PASS', stored_token_fields_removed=len(stored_removed), dependent_hashes_changed=len(hashes),
           token_join_message_renamed=len(renamed),
           stored_tokens_checked=stored, live_tokens_checked=live, other_differences=0, plans_schema_sha256=PLANS_SHA)
(P / 'fidelity-v5.json').write_text(json.dumps(out, indent=2) + '\n')
print('V5 DL-076 refreeze fidelity:', json.dumps(out))
'''

README = '''# seglog.event_appended v5 DL-076 refreeze

Authoritative entrypoints: check_v5_regressions.py (runs build_v5.py, check_settlement_prefix_v5.py,
check_retention_v5.py and the twelve root regressions), check_fidelity_v5.py and this README. v1, v2, v3
and v4-root in the parent directory are unchanged lineage.

The only semantic change (DL-076, SP-2210): the SP-270 reader checkpoint stores `index_read_token` as the
nine-field durable SP-278 projection, in its root, in reader_core and in every retired generation.
`redb_snapshot_id` is never stored. The disclosure token and the reader commit transaction's source token
are the live ten-field token of the actual read (`live_token`). The old schema-valid negative that rewrote
a stored redb_snapshot_id is now the stored-snapshot negative, refused by the closed durable schema, for
the root token and a retired core. check_fidelity_v5.py proves every other v4-root output is unchanged
except SHA-256 values of checkpoints that contain the token, and that the produced contract schema equals
today's Plans schema. Built by scripts/pm-s3bo-ss-seglog-refreeze.py (C12-SS). Native execution remains
NOT_RUN.
'''


def run(v5, script):
    result = subprocess.run([sys.executable, '-B', script], cwd=v5, capture_output=True, text=True, timeout=1800)
    (v5 / (script[:-3] + '.log')).write_text(result.stdout + result.stderr)
    if result.returncode != 0:
        raise SystemExit(script + ' failed; see ' + str(v5 / (script[:-3] + '.log')))
    return result.stdout.strip().splitlines()[-1] if result.stdout.strip() else ''


def build(target):
    v4, v5 = target / 'v4-root', target / 'v5'
    shutil.copytree(v4, v5, ignore=lambda d, names: [n for n in names if n == '__pycache__' or (Path(d) == v4 and n in NOT_COPIED)])
    text, counts = replace_all((v4 / 'build_v3.py').read_text(), BUILD_REPLACEMENTS, 'build_v3.py')
    (v5 / 'build_v5.py').write_text(text)
    for old_name, new_name in [('check_settlement_prefix.py', 'check_settlement_prefix_v5.py'), ('check_retention.py', 'check_retention_v5.py')]:
        text = (v4 / old_name).read_text()
        if text.count('build_v3.py') != 1:
            raise SystemExit(old_name + ': build reference')
        (v5 / new_name).write_text(text.replace('build_v3.py', 'build_v5.py'))
    text, regression_counts = replace_all((v4 / 'check_v3_regressions.py').read_text(), [
        ("B/'build_v3.py'", "B/'build_v5.py'"), ("B/'check_settlement_prefix.py'", "B/'check_settlement_prefix_v5.py'"),
        ("B/'check_retention.py'", "B/'check_retention_v5.py'"), ("B/'v3-regression-fixtures.json'", "B/'v5-regression-fixtures.json'"),
        ("B/'v3-regression-results.json'", "B/'v5-regression-results.json'")], 'check_v3_regressions.py')
    (v5 / 'check_v5_regressions.py').write_text(text)
    plans = ROOT / PLANS_SCHEMA
    (v5 / 'plans-pin').mkdir()
    shutil.copyfile(plans, v5 / 'plans-pin' / plans.name)
    (v5 / 'check_fidelity_v5.py').write_text(FIDELITY.replace('{plans_sha}', sha(plans)))
    (v5 / 'README-v5.md').write_text(README)
    return counts + regression_counts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--target', type=Path, default=TARGET)
    parser.add_argument('--force', action='store_true', help='replace an existing unfinished target')
    args = parser.parse_args()
    auth = authenticate()
    target = args.target
    if (target / 'v5' / 'manifest.json').exists() and not args.force:
        raise SystemExit('v5 already frozen at ' + str(target / 'v5') + '; it is immutable')
    if target.exists():
        if not args.force:
            raise SystemExit('target exists without a v5 manifest; rerun with --force')
        shutil.rmtree(target)
    shutil.copytree(ARCHIVE, target, ignore=shutil.ignore_patterns('__pycache__'))
    counts = build(target)
    v5 = target / 'v5'
    regressions = run(v5, 'check_v5_regressions.py')
    fidelity = run(v5, 'check_fidelity_v5.py')
    shutil.rmtree(v5 / '__pycache__', ignore_errors=True)
    results = {name: json.loads((v5 / name).read_text()) for name in
               ('results.json', 'settlement-prefix-results.json', 'retention-results.json', 'v5-regression-results.json', 'fidelity-v5.json')}
    files = [{'path': str(p.relative_to(v5)), 'sha256': sha(p)} for p in sorted(v5.rglob('*'))
             if p.is_file() and p.name != 'manifest.json' and '__pycache__' not in p.parts and not p.name.endswith('.log')]
    manifest = {'status': 'EXTERNAL_V5_DL076_STORED_TOKEN_REFREEZE',
                'prior_immutable_manifest': {'path': PINNED_PATH, 'archived_at': str(ARCHIVE / 'v4-root' / 'manifest.json'),
                                             'sha256': PINNED_SHA, 'verified_entries': auth['verified_entries']},
                'authoritative_entrypoints': ['README-v5.md', 'check_v5_regressions.py', 'check_fidelity_v5.py'],
                'change': 'stored SP-270 reader index_read_token (root, reader_core, retired cores) = nine-field durable projection; live disclosure and commit tokens keep the snapshot of the read',
                'replacement_counts': counts, 'files': files, 'results': results,
                'last_lines': {'check_v5_regressions.py': regressions, 'check_fidelity_v5.py': fidelity},
                'native_runtime': 'NOT_RUN', 'canonical_edits': 0}
    (v5 / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    for log in v5.glob('*.log'):
        log.unlink()
    print(json.dumps({'manifest': str(v5 / 'manifest.json'), 'sha256': sha(v5 / 'manifest.json'), 'files': len(files),
                      'results': {k: v.get('status') for k, v in results.items()}, 'fidelity': results['fidelity-v5.json']}))
    return 0


if __name__ == '__main__':
    sys.exit(main())
