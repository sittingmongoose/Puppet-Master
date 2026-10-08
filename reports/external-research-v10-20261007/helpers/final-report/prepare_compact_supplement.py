#!/usr/bin/env python3
"""Materialize only preidentified, independently verified retention alternatives."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

R = Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
D = R / 'helpers/retention-final-gap-v1'
DEST = R / 'helpers/retention-root-witnesses-v2'


def sha(body):
    return hashlib.sha256(body).hexdigest()


def main():
    output = DEST / 'COMPACT_SUPPLEMENT_PREVIEW.json'
    assert not output.exists()
    (DEST / 'private/fragments').mkdir(parents=True, exist_ok=True)
    selections = json.loads((D / 'SELECTED_SUPPLEMENT.json').read_bytes())
    check_path = R / 'state/retention-final-gap-root-identity-validation-v1.json'
    check = json.loads(check_path.read_bytes())
    assert check['status'] == 'PASS'
    assert all(row['whole_original_selected_visible_text_equal'] for row in check['derived_alternative_checks'])
    replaced = {sid for row in selections['derived_compaction_alternatives'] for sid in row['replace_selection_ids']}
    records, fragments, new_private = [], {}, set()

    def store(piece):
        key = sha(piece)
        path = DEST / 'private/fragments' / (key + '.bin')
        if path.exists():
            assert path.read_bytes() == piece
        else:
            path.write_bytes(piece)
        new_private.add(path.name)
        fragments[key] = len(piece)
        return path

    for item in selections['selections']:
        if item['selection_id'] in replaced:
            continue
        piece = Path(item['private_path']).read_bytes()
        assert sha(piece) == item['fragment_sha256']
        fragments[sha(piece)] = len(piece)
        records.append({
            'kind': 'literal_range',
            'source_path': item.get('range_source_path', item['source_path']),
            'source_sha256': item.get('range_source_sha256', item['source_sha256']),
            'original_source_path': item['source_path'],
            'original_source_sha256': item['source_sha256'],
            'start_byte': item['start_byte'], 'end_byte': item['end_byte'],
            'bytes': item['bytes'], 'fragment_sha256': item['fragment_sha256'],
            'frozen_reviewer_refs': item['frozen_reviewer_refs'],
            'original_selection_id': item['selection_id'],
            'governing_qualifier_limit': item.get('governing_qualifier_limit'),
            'context_limit': item.get('context_limit'),
            'full_assertion_coverage_verified': False,
        })

    for index, alt in enumerate(selections['derived_compaction_alternatives']):
        body = Path(alt['derived_path']).read_bytes()
        assert sha(body) == alt['derived_source_sha256']
        piece = body[alt['start_byte']:alt['end_byte']]
        assert sha(piece) == alt['fragment_sha256']
        path = store(piece)
        originals = [row for row in selections['selections'] if row['selection_id'] in alt['replace_selection_ids']]
        records.append({
            'kind': 'derived_fragment', 'source_path': alt['raw_source_path'],
            'source_sha256': alt['source_sha256'], 'fragment_path': str(path),
            'fragment_sha256': sha(piece), 'bytes': len(piece),
            'derived_existing_path': alt['derived_path'],
            'derived_existing_sha256': alt['derived_source_sha256'],
            'derived_start_byte': alt['start_byte'], 'derived_end_byte': alt['end_byte'],
            'transform_receipt_path': str(check_path),
            'transform_receipt_sha256': sha(check_path.read_bytes()),
            'transform_receipt_pointer': '/derived_alternative_checks/' + str(index),
            'raw_visible_line_mapping': alt['raw_visible_line_mapping'],
            'replaced_original_selection_ids': alt['replace_selection_ids'],
            'replaced_literal_ranges': [{
                'source_path': row.get('range_source_path', row['source_path']),
                'source_sha256': row.get('range_source_sha256', row['source_sha256']),
                'start_byte': row['start_byte'], 'end_byte': row['end_byte'],
                'fragment_sha256': row['fragment_sha256'],
            } for row in originals],
            'frozen_reviewer_refs': [ref for row in originals for ref in row['frozen_reviewer_refs']],
            'visible_text_and_qualifiers_preserved_exactly_after_whitespace_normalization': True,
            'html_attributes_and_full_original_extraction_parser_replay_retained': False,
            'full_assertion_coverage_verified': False,
        })

    for item in selections['located_not_materialized_components']:
        body = Path(item['source_path']).read_bytes()
        assert sha(body) == item['source_sha256']
        piece = body[item['start_byte']:item['end_byte']]
        assert sha(piece) == item['fragment_sha256'] and len(piece) == item['bytes']
        store(piece)
        records.append({
            'kind': 'literal_range', 'source_path': item['source_path'],
            'source_sha256': item['source_sha256'],
            'start_byte': item['start_byte'], 'end_byte': item['end_byte'],
            'fragment_sha256': item['fragment_sha256'], 'bytes': len(piece),
            'frozen_reviewer_refs': item['frozen_reviewer_refs'],
            'original_helper_disposition': 'LOCATED_NOT_MATERIALIZED_BY_64KiB_BOUND',
            'root_prospective_scope': 'Seven preidentified ranges only; old helper bounds and results unchanged',
            'full_assertion_coverage_verified': False,
        })
    assert {path.name for path in (DEST / 'private/fragments').iterdir()} == new_private
    assert sum(fragments.values()) <= 65536
    report = {
        'schema': 'ER10-root-retention-prospective-compact-supplement-preview-v2',
        'at': datetime.now(timezone.utc).isoformat(),
        'original_helper_identity': sha((D / 'SELECTED_SUPPLEMENT.json').read_bytes()),
        'root_independent_identity_receipt': str(check_path),
        'root_independent_identity_receipt_sha256': sha(check_path.read_bytes()),
        'original_helper_bound_and_bytes_unchanged': True,
        'derived_equivalences_used': 13,
        'additional_previously_located_ranges_materialized': 7,
        'witness_records': records, 'unique_fragments': len(fragments),
        'deduplicated_fragment_bytes': sum(fragments.values()),
        'source_identities': len({row['source_sha256'] for row in records}),
        'archive_created': False, 'source_cleanup_authorized': False,
        'whole_assertion_or_science_quality_regraded': False,
        'private_fragments_publication_authorized': False,
        'final_late_M07_M09_M06_source_supplement_still_required': True,
    }
    output.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({key: value for key, value in report.items() if key != 'witness_records'}))


if __name__ == '__main__':
    main()
