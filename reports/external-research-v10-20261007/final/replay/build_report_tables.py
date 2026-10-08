#!/usr/bin/env python3
"""Export the final metadata ledger to readable tables without regrading."""
import argparse
import csv
import io
import json
from pathlib import Path


def cell(v):
    if v['state'] == 'UNKNOWN':
        return 'UNKNOWN'
    if v['state'] == 'UNASSESSED':
        return 'UNASSESSED'
    if v['value'] is None:
        return 'NULL'
    if isinstance(v['value'], bool):
        return 'true' if v['value'] else 'false'
    return str(v['value'])


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--ledger', type=Path, required=True)
    p.add_argument('--output-directory', type=Path, required=True)
    a = p.parse_args()
    d = json.loads(a.ledger.read_bytes())
    assert d['campaign_terminal'] is True and d['logical_denominator']['closed'] == 40
    assert d['logical_denominator']['live_held'] == 0 and len(d['slots']) == 40
    a.output_directory.mkdir(exist_ok=False)
    fields = ['candidate_final_delivery', 'scientific_judgment_available',
              'original_grade_string', 'original_material_count', 'normalized_material_count',
              'review_formal_output_delivery', 'review_actual_timely_delivery',
              'full_scientific_coverage', 'full_declared_primary_source_coverage',
              'native_pipeline_qualified', 'time_eligible', 'provenance_eligible', 'method_eligible']
    stream = io.StringIO(newline='')
    writer = csv.writer(stream)
    writer.writerow(['slot_id', 'arm', 'closure'] + fields)
    lines = ['# All 40 original slots', '',
             'Original reviewer grade terms are copied exactly. NULL is an absent original aggregate grade; UNKNOWN is an unmapped explicit field. Neither is a scientific FAIL. Closed includes interrupted, incomplete and diagnostic dispositions.', '',
             '| Slot | Control original grade | Treatment original grade | Both scientific scope assessed | Both declared primary-source scope assessed | Method eligible |',
             '| --- | --- | --- | --- | --- | --- |']
    for row in d['slots']:
        for arm, v in row['arms'].items():
            writer.writerow([row['slot_id'], arm, row['closure']] + [cell(v[x]) for x in fields])
        c, t = row['arms']['control'], row['arms']['treatment']
        pair = row['paired']
        vals = [row['slot_id'], cell(c['original_grade_string']), cell(t['original_grade_string']),
                cell(pair['both_full_scientific_coverage']), cell(pair['both_full_declared_primary_source_coverage']),
                cell(pair['method_eligible'])]
        lines.append('| ' + ' | '.join(x.replace('|', '\\|') for x in vals) + ' |')
    (a.output_directory / 'ALL_80_ARMS.csv').write_text(stream.getvalue())
    (a.output_directory / 'ALL_40_SLOTS.md').write_text('\n'.join(lines) + '\n')
    lines = ['# Explicit assessment and eligibility fields', '',
             'These are metadata flag partitions with the stated denominator, not a count of universal requirement fulfillment or scientific successes. Unknown flags stay unknown even when an original reviewer delivered a qualified judgment.', '',
             '| Field | Denominator | Explicit true | Explicit false | Unknown |',
             '| --- | ---: | ---: | ---: | ---: |']
    for field, value in d['aggregates'].items():
        c = value['counts']
        lines.append(f"| {field} | {value['denominator']} | {c['TRUE']} | {c['FALSE']} | {c['UNKNOWN']} |")
    (a.output_directory / 'ASSESSMENT_FLAGS.md').write_text('\n'.join(lines) + '\n')
    (a.output_directory / 'ASSESSMENT_FLAGS.json').write_text(json.dumps(d['aggregates'], indent=2) + '\n')
    print(json.dumps({'slots': 40, 'arms': 80, 'original_terms_unchanged': True,
                      'counts': {k: v['counts'] for k, v in d['aggregates'].items()},
                      'no_new_scientific_grade': True}))


if __name__ == '__main__':
    main()
