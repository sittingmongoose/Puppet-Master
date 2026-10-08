#!/usr/bin/env python3
"""Combine already qualified necessary condition ranges with final quiet proof.

No source selection, network access, archive creation, or deletion occurs here.
Any late case-specific range must arrive as an independently qualified preview.
"""
from pathlib import Path
import argparse
import hashlib
import json


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--root', type=Path, required=True)
    ap.add_argument('--quiet-receipt', type=Path, required=True)
    ap.add_argument('--late-preview', type=Path, action='append', default=[])
    ap.add_argument('--output', type=Path, required=True)
    a = ap.parse_args()
    assert not a.output.exists()
    quiet_body = a.quiet_receipt.read_bytes()
    quiet = json.loads(quiet_body)
    assert quiet['all_owned_candidate_review_helper_coordinator_task_trees_actual_quiet'] is True
    rows, identities = [], []
    previews = [
        ('helpers/retention-root-witnesses-v1/APPROVED_FRAGMENT_SCOPE_PREVIEW_V2.json', 'ranges'),
        ('helpers/retention-root-witnesses-v4/QUALIFIED_COMPACT_PREVIEW_V2.json', 'witness_records'),
        ('helpers/retention-root-witnesses-v3-M07AB/CONDITION_QUALIFICATION_PREVIEW.json', 'witness_records'),
        ('helpers/retention-root-witnesses-v5-M09/CONDITION_QUALIFICATION_PREVIEW_V2.json', 'witness_records')]
    previews += [(str(p), 'witness_records') for p in a.late_preview]
    for relative, key in previews:
        path = Path(relative)
        path = path if path.is_absolute() else a.root / path
        raw = path.read_bytes()
        doc = json.loads(raw)
        identities.append({'path': str(path), 'sha256': sha(raw), 'bytes': len(raw)})
        for item in doc[key]:
            row = dict(item)
            row.setdefault('kind', 'literal_range')
            row.setdefault('root_necessity',
                           'Previously Root-qualified minimal governing condition range bound to the frozen original assertion; no whole-source or whole-assertion proof is inferred.')
            row.setdefault('full_assertion_coverage_verified', False)
            row['qualified_preview_path'] = str(path)
            row['qualified_preview_sha256'] = sha(raw)
            if row['kind'] == 'literal_range':
                size = Path(row['source_path']).stat().st_size
                assert not (row['start_byte'] == 0 and row['end_byte'] == size), 'Whole Source body is outside this minimal archive approval'
            rows.append(row)
    transform_path = a.root / 'helpers/retention-root-witnesses-v1/CISA_TRANSFORM_WITNESS.json'
    raw = transform_path.read_bytes()
    cisa = json.loads(raw)
    for item in cisa['fragments']:
        rows.append(dict(kind='derived_fragment', source_path=cisa['source_path'],
                         source_sha256=cisa['source_sha256'], source_bytes=cisa['source_bytes'],
                         source_url=cisa['url'], fragment_path=item['fragment_path'],
                         fragment_sha256=item['retained_fragment_sha256'], bytes=item['retained_fragment_bytes'],
                         physical_page=item['physical_page'], layout_line_start=item['layout_line_start'],
                         layout_line_end_inclusive=item['layout_line_end_inclusive'],
                         derived_byte_range=item['derived_byte_range'],
                         transform_receipt_path=str(transform_path), transform_receipt_sha256=sha(raw),
                         frozen_check_file=cisa['frozen_check_file'], frozen_check_file_sha256=cisa['frozen_check_file_sha256'],
                         frozen_check_pointers=cisa['frozen_check_pointers'],
                         root_necessity='Retain only the original bounded ransomware isolation, clean recovery and backup-independence guidance with its surrounding qualifiers; no executed recovery or configuration claim.',
                         context_limit=cisa['scope_limit'], full_assertion_coverage_verified=False))
    slint_path = a.root / 'helpers/retention-root-witnesses-v1/slint-HTML-exact-component-range-proposal.json'
    slint_raw = slint_path.read_bytes()
    slint = json.loads(slint_raw)
    for item in slint['components']:
        rows.append(dict(kind='literal_range', source_path=slint['source_path'], source_sha256=slint['source_sha256'],
                         start_byte=item['start_byte'], end_byte=item['end_byte_exclusive'],
                         fragment_sha256=item['sha256'], bytes=item['bytes'],
                         qualified_preview_path=str(slint_path), qualified_preview_sha256=sha(slint_raw),
                         root_necessity='Retain only the original reported timing and platform/version conditions needed to interpret the frozen Slint finding; this is not an independently executed benchmark.',
                         context_limit=slint['scope'], full_assertion_coverage_verified=False))
    objects = {x['fragment_sha256']: x['bytes'] for x in rows}
    assert sum(objects.values()) <= 131072
    cfg = dict(schema='ER10-ROOT-APPROVED-ESSENTIAL-WITNESS-PACK-v1',
               campaign_scientific_tasks_quiet_verified=True, maximum_private_archives=1,
               full_corpus_retention=False, maximum_unique_fragment_bytes=131072,
               approved_private_archive_directory='/mnt/Cursor/PuppetMaster-Evidence/tests/er10-20261007-5a126dd5',
               campaign_quiet_receipt={'path': str(a.quiet_receipt), 'sha256': sha(quiet_body)},
               reason='Preserve narrowly selected governing conditions underlying frozen original assessments, including version/applicability and transform limits. Preserve no source corpus or model transcript.',
               retention_policy='One private hash-verified fragment archive, metadata-only public locator, no new public source quotation. Unqualified unique original Sources remain explicit cleanup holds.',
               unresolved_coverage='The selection does not establish whole-assertion coverage or reconstruct mutable whole Sources. Existing missing bodies, locator limits, unopened package members, unknown runtime/provenance and body-identity mismatches remain unresolved.',
               immutable_source_alternatives='Use separately Root-verified fixed-commit whole-body identity catalog and reconstruction utility. Fragment validation does not certify full Source reconstruction.',
               qualification_previews=identities, witnesses=rows,
               unique_fragment_count=len(objects), unique_fragment_bytes=sum(objects.values()))
    with a.output.open('x') as f:
        json.dump(cfg, f, indent=2)
        f.write('\n')
    print(json.dumps({'witness_records': len(rows), 'unique_fragments': len(objects), 'unique_fragment_bytes': sum(objects.values()), 'archive_created': False}))


if __name__ == '__main__':
    main()
