#!/usr/bin/env python3
"""Pack one explicitly approved essential witness set; never select scientific claims."""
import argparse
import gzip
import hashlib
import io
import json
import tarfile
from pathlib import Path


def sha(data):
    return hashlib.sha256(data).hexdigest()


VALIDATOR = '''#!/usr/bin/env python3
"""Check retained fragment identity. Full original sources are not reconstructed."""
import hashlib, json
from pathlib import Path
p = Path(__file__).resolve().parent
m = json.loads((p / "MANIFEST.json").read_text())
objects = {}
for r in m["witnesses"]:
    b = (p / "fragments" / (r["fragment_sha256"] + ".bin")).read_bytes()
    assert hashlib.sha256(b).hexdigest() == r["fragment_sha256"]
    assert len(b) == r["bytes"]
    objects[r["fragment_sha256"]] = len(b)
print(json.dumps({"status": "PASS", "witness_records": len(m["witnesses"]),
                  "unique_fragments": len(objects), "fragment_bytes": sum(objects.values()),
                  "full_original_source_reconstruction": False,
                  "source_correctness_regraded": False}))
'''


def make_manifest(config):
    assert config['schema'] == 'ER10-ROOT-APPROVED-ESSENTIAL-WITNESS-PACK-v1'
    assert config['campaign_scientific_tasks_quiet_verified'] is True
    assert config['maximum_private_archives'] == 1
    assert config['full_corpus_retention'] is False
    fragments, witnesses, source_cache = {}, [], {}
    for original in config['witnesses']:
        row = dict(original)
        kind = row.pop('kind')
        if kind == 'literal_range':
            path = Path(row['source_path'])
            key = (str(path), row['source_sha256'])
            if key not in source_cache:
                body = path.read_bytes()
                assert sha(body) == row['source_sha256'], str(path)
                source_cache[key] = body
            body = source_cache[key]
            assert 0 <= row['start_byte'] < row['end_byte'] <= len(body)
            piece = body[row['start_byte']:row['end_byte']]
        elif kind == 'derived_fragment':
            source_key = (row['source_path'], row['source_sha256'])
            if source_key not in source_cache:
                source_body = Path(row['source_path']).read_bytes()
                assert sha(source_body) == row['source_sha256']
                source_cache[source_key] = source_body
            piece = Path(row.pop('fragment_path')).read_bytes()
            assert row.get('transform_receipt_sha256') and row.get('transform_receipt_path')
            receipt = Path(row['transform_receipt_path']).read_bytes()
            assert sha(receipt) == row['transform_receipt_sha256']
        else:
            raise ValueError('Unsupported witness kind: ' + str(kind))
        assert len(piece) == row['bytes'] and sha(piece) == row['fragment_sha256']
        fragments[row['fragment_sha256']] = piece
        row['retention_kind'] = kind
        witnesses.append(row)
    assert sum(map(len, fragments.values())) <= config['maximum_unique_fragment_bytes']
    manifest = {
        'schema': 'ER10-essential-private-witness-archive-v1',
        'approval_config_sha256': config['_config_sha256'],
        'campaign_scientific_tasks_quiet_receipt': config['campaign_quiet_receipt'],
        'reason': config['reason'],
        'retention_policy': config['retention_policy'],
        'witnesses': witnesses,
        'unique_fragments': len(fragments),
        'unique_fragment_bytes': sum(map(len, fragments.values())),
        'full_original_sources_retained': False,
        'full_original_source_reconstruction': False,
        'source_correctness_regraded': False,
        'unresolved_coverage': config['unresolved_coverage'],
        'immutable_source_alternatives': config['immutable_source_alternatives'],
    }
    return manifest, fragments


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--config', required=True)
    ap.add_argument('--archive', required=True)
    ap.add_argument('--receipt', required=True)
    args = ap.parse_args()
    cfg_bytes = Path(args.config).read_bytes()
    cfg = json.loads(cfg_bytes)
    cfg['_config_sha256'] = sha(cfg_bytes)
    out, receipt_path = Path(args.archive), Path(args.receipt)
    assert out.is_absolute() and receipt_path.is_absolute()
    assert not out.exists() and not receipt_path.exists()
    assert out.parent.resolve() == Path(cfg['approved_private_archive_directory']).resolve()
    assert not list(out.parent.glob('*.tar.gz')), 'A private archive already exists'
    manifest, fragments = make_manifest(cfg)
    metadata = (json.dumps(manifest, indent=2, sort_keys=True) + '\n').encode()
    files = {'MANIFEST.json': metadata, 'validate.py': VALIDATOR.encode()}
    files.update({'fragments/' + key + '.bin': value for key, value in fragments.items()})
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open('xb') as stream:
        with gzip.GzipFile(filename='', fileobj=stream, mode='wb', mtime=0) as compressed:
            with tarfile.open(fileobj=compressed, mode='w|') as tar:
                for name, body in sorted(files.items()):
                    info = tarfile.TarInfo(name)
                    info.size = len(body)
                    info.mode = 0o600
                    info.mtime = 0
                    tar.addfile(info, io.BytesIO(body))
    with tarfile.open(out, 'r:gz') as tar:
        assert set(tar.getnames()) == set(files)
        for name, body in files.items():
            assert tar.extractfile(name).read() == body
    receipt = {
        'schema': 'ER10-essential-private-archive-verification-v1',
        'status': 'PASS', 'archive_path': str(out),
        'archive_sha256': sha(out.read_bytes()), 'archive_bytes': out.stat().st_size,
        'manifest_sha256': sha(metadata), 'approval_config_sha256': sha(cfg_bytes),
        'witness_records': len(manifest['witnesses']),
        'unique_fragments': len(fragments),
        'unique_fragment_bytes': sum(map(len, fragments.values())),
        'all_archive_members_exactly_verified': True,
        'full_original_source_reconstruction': False,
        'no_source_files_deleted': True,
        'unresolved_coverage': cfg['unresolved_coverage'],
    }
    receipt_path.write_text(json.dumps(receipt, indent=2, sort_keys=True) + '\n')
    print(json.dumps({k: v for k, v in receipt.items() if k != 'unresolved_coverage'}))


if __name__ == '__main__':
    main()
