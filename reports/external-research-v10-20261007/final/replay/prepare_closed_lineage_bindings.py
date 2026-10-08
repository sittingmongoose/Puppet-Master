#!/usr/bin/env python3
"""Freeze explicit closed records and lineage; never attest final campaign quiet."""
from pathlib import Path
import hashlib
import json
from datetime import datetime, timezone

ROOT = Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
OUT = ROOT / 'helpers/final-report/closed-lineage-preparation-v1'


def main():
    OUT.mkdir(exist_ok=False)
    files, docs, rules, patches = {}, {}, [], {}

    def freeze(rel):
        source = 'final_lineage/' + rel
        if source in files:
            return source
        p = ROOT / rel
        before = p.stat()
        raw = p.read_bytes()
        assert before.st_mtime_ns == p.stat().st_mtime_ns
        data = json.loads(raw)
        dest = 'inputs/' + hashlib.sha256(source.encode()).hexdigest() + '.json'
        q = OUT / dest
        q.parent.mkdir(exist_ok=True)
        with q.open('xb') as f:
            f.write(raw)
        files[source] = dict(source=source, original_path=str(p), bundle_path=dest,
                             sha256=hashlib.sha256(raw).hexdigest(), bytes=len(raw))
        docs[source] = data
        return source

    def original(source, pointer):
        cur = docs[source]
        for t in pointer.split('/')[1:] if pointer else []:
            t = t.replace('~1', '/').replace('~0', '~')
            cur = cur[int(t)] if isinstance(cur, list) else cur[t]
        return {**files[source], 'pointer': pointer}

    def rule(slot, field, source, pointer, transform='record_reference', **extra):
        rules.append(dict(output_pointer=f'/slots/{slot}/{field}',
                          original=original(source, pointer), transformation=transform,
                          scope='Exact original closed record; no scientific regrade, best-of selection, or final quiet inference.',
                          **extra))

    old = freeze('helpers/targeted-cohort2/COMPARISONS.json')
    failure = freeze('jobs/D-M06-A/V3_TERMINAL_DISPOSITION_GATE-final.json')
    assert docs[failure]['science'] == 'UNASSESSED requiredfullpairedfinal/nativeCOMPLETE gate failed'
    assert docs[failure]['source_review_dispatched'] is False
    assert docs[old]['cases'][4]['case_id'] == 'D-M06-A'
    patches['D-M06-A'] = {'version_history': [{}, {}], 'review_history': [{}],
                         'original_pair_context': [{}], 'shared_and_failed_cost_references': [{}, {}]}
    rule(10, 'version_history/0', old, '/cases/4')
    rule(10, 'version_history/1', failure, '')
    rule(10, 'review_history/0', failure, '/source_review_dispatched', 'identity')
    rule(10, 'original_pair_context/0', failure, '')
    rule(10, 'shared_and_failed_cost_references/0', old, '/cases/4/seed_attempt')
    rule(10, 'shared_and_failed_cost_references/1', failure, '')
    rule(10, 'final_authorized_version', failure, '/version', 'identity')
    rule(10, 'paired/scientific_judgment_available', failure, '/source_review_dispatched', 'explicit_bool', critical=True)
    hold = docs[failure]['qualified_native_provenance_comparative']
    rule(10, 'paired/method_eligible', failure, '/qualified_native_provenance_comparative',
         'enum_bool', enum_map={hold: False}, critical=True)
    rule(10, 'paired/quality_preserving_win_established', failure, '/science', 'unknown',
         reason='No scientific paired comparison; output absence does not establish a win.', critical=True)

    pair = freeze('reviews/targeted-cohort3/D-M07-B-v3/PAIR_COMPARISON.json')
    assert docs[pair]['case'] == 'D-M07-B' and docs[pair]['version'] == 'v3'
    assert docs[pair]['is_method_comparison'] is False
    patches['D-M07-B'] = {'version_history': [{}], 'review_history': [{}],
                         'original_pair_context': [{}], 'shared_and_failed_cost_references': [{}]}
    rule(13, 'version_history/0', pair, '')
    rule(13, 'review_history/0', pair, '/review_freezes', 'identity')
    rule(13, 'original_pair_context/0', pair, '')
    rule(13, 'shared_and_failed_cost_references/0', pair, '/economics', 'identity')
    rule(13, 'final_authorized_version', pair, '/version', 'identity')
    rule(13, 'paired/method_eligible', pair, '/is_method_comparison', 'explicit_bool', critical=True)
    rule(13, 'paired/quality_preserving_win_established', pair, '/conclusion', 'unknown',
         reason='Original diagnostic-only result and comparative seed HOLD establish no qualified method comparison.', critical=True)
    rules.append(dict(output_pointer='/slots/13/paired/scientific_judgment_available',
                      transformation='all_three_valued', critical=True,
                      components=['/slots/13/arms/control/scientific_judgment_available',
                                  '/slots/13/arms/treatment/scientific_judgment_available'],
                      scope='Both original independently delivered judgments are available; no method qualification follows.'))

    gate = freeze('jobs/D-M09-A/V3_TERMINAL_DISPOSITION_GATE.json')
    diag = freeze('reviews/targeted-cohort3/D-M09-A-v3/CONTROL_SOURCE_DIAGNOSTIC.json')
    assert docs[diag]['is_method_comparison'] is False
    patches['D-M09-A'] = {'version_history': [{}], 'review_history': [{}],
                         'original_pair_context': [{}, {}], 'shared_and_failed_cost_references': [{}],
                         'standalone_exception_assessments': [{}]}
    rule(16, 'version_history/0', gate, '')
    rule(16, 'review_history/0', diag, '/review_freeze', 'identity')
    rule(16, 'original_pair_context/0', gate, '')
    rule(16, 'original_pair_context/1', diag, '')
    rule(16, 'shared_and_failed_cost_references/0', diag, '/economics', 'identity')
    rule(16, 'standalone_exception_assessments/0', diag, '')
    rule(16, 'final_authorized_version', diag, '/version', 'identity')

    payload = {'schema': 'ER10_CLOSED_LINEAGE_PREPARATION_V1',
               'recorded_at': datetime.now(timezone.utc).isoformat(),
               'campaign_terminal': False, 'all_40_slots_actual_quiet': False,
               'entries': rules, 'template_list_patches': patches,
               'M06B_live_science_read': False, 'original_scientific_grade_written': False,
               'limits': 'Prepared original record references and costs only. M06B final bindings and actual descendant quiet proof remain required.'}
    manifest = {'schema': 'ER10_CLOSED_LINEAGE_FROZEN_INPUTS_V1', 'files': list(files.values()),
                'campaign_terminal': False}
    for name, value in [('PREPARED_LINEAGE_FIELD_BINDINGS.json', payload), ('INPUT_IDENTITIES.json', manifest)]:
        with (OUT / name).open('x') as f:
            json.dump(value, f, indent=2, ensure_ascii=False)
            f.write('\n')
    print(json.dumps({'files': len(files), 'bytes': sum(x['bytes'] for x in files.values()),
                      'explicit_rules': len(rules), 'campaign_terminal': False}))


if __name__ == '__main__':
    main()
