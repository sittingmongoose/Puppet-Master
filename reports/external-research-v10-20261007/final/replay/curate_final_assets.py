#!/usr/bin/env python3
"""Copy an explicit final asset list without overwriting historical results."""
import argparse
import hashlib
import json
from pathlib import Path


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--config', type=Path, required=True)
    a = ap.parse_args()
    raw_cfg = a.config.read_bytes()
    cfg = json.loads(raw_cfg)
    assert cfg['schema'] == 'ER10_ROOT_FINAL_EXPLICIT_ASSET_CONFIG_V1'
    assert cfg['scientific_results_frozen'] is True
    checkout = Path(cfg['checkout']).resolve()
    base = Path(cfg['report_base'])
    assert not base.is_absolute() and '..' not in base.parts
    assert str(base) == 'reports/external-research-v10-20261007'
    rows, aliases, seen, new_targets = [], [], {}, []
    for item in cfg['files']:
        src = Path(item['source'])
        rel = Path(item['target'])
        assert not rel.is_absolute() and '..' not in rel.parts and rel.is_relative_to(base)
        body = src.read_bytes()
        assert sha(body) == item['sha256'] and len(body) == item['bytes']
        dest = checkout / rel
        target = str(rel)
        if target in seen:
            assert seen[target] == (sha(body), len(body))
            aliases.append(dict(source=str(src), target=target, sha256=sha(body), bytes=len(body)))
            continue
        seen[target] = (sha(body), len(body))
        if dest.exists():
            if dest.read_bytes() != body:
                raise ValueError('Refusing historical target overwrite: ' + target)
            kind = 'EXISTING_EXACT_REFERENCE'
        else:
            dest.parent.mkdir(parents=True, exist_ok=True)
            with dest.open('xb') as f:
                f.write(body)
            kind = 'NEW_EXACT_COPY'
            new_targets.append(target)
        assert dest.read_bytes() == body
        blob = hashlib.sha1(b'blob ' + str(len(body)).encode() + b'\0' + body).hexdigest()
        rows.append(dict(source=str(src), target=target, sha256=sha(body), bytes=len(body),
                         git_blob_sha1=blob, kind=kind, asset_role=item['asset_role']))
    manifest = dict(schema='ER10_ROOT_FINAL_ASSET_MANIFEST_V1', config_sha256=sha(raw_cfg),
                    campaign_scientific_results_frozen=True, original_results_overwritten=False,
                    raw_source_bodies_or_native_tickets_or_transcripts_included=False,
                    files=rows, equivalent_source_aliases=aliases,
                    scope=cfg['scope'], source_retention_limits=cfg['source_retention_limits'])
    manifest_rel = base / cfg['manifest_name']
    manifest_path = checkout / manifest_rel
    assert not manifest_path.exists()
    manifest_body = (json.dumps(manifest, indent=2, ensure_ascii=False) + '\n').encode()
    with manifest_path.open('xb') as f:
        f.write(manifest_body)
    new_targets.append(str(manifest_rel))
    receipt = dict(schema='ER10_ROOT_FINAL_ASSET_COPY_VALIDATION_V1', status='PASS',
                   config_sha256=sha(raw_cfg), manifest_path=str(manifest_rel),
                   manifest_sha256=sha(manifest_body), new_targets=new_targets,
                   new_files=len(new_targets), exact_asset_entries=len(rows),
                   equivalent_source_aliases=len(aliases), all_target_bytes_verified=True,
                   no_historical_overwrite=True)
    receipt_path = Path(cfg['copy_receipt'])
    assert not receipt_path.exists()
    with receipt_path.open('x') as f:
        json.dump(receipt, f, indent=2)
        f.write('\n')
    print(json.dumps({k: receipt[k] for k in ['status', 'new_files', 'exact_asset_entries', 'equivalent_source_aliases', 'manifest_sha256']}))


if __name__ == '__main__':
    main()
