#!/usr/bin/env python3
"""W3I checker mutations: each weakens or deletes one guard clause; the suite must fail for every one.

The recheck's 14 mutations (reviews/W3I-p2-recheck/evidence/w3i-mutate.py, M1..M14) are adapted to the restructured
checker: each now targets the code that carries the same clause (a row's inputs, a frozen-verifier component, an owner
schema keyword the checker validates in full, or the shared-call site). X1.. are this round's own mutations, each on a
different row. For every mutation a scratch tree gets a mutated copy of scripts/pm_w3i_continuity_oracles.py and fresh
copies of the lane's table generator; the shared modules and Plans/ are linked read-only. The suite is: regenerate the
tables from the mutated spec, then run the complete checker. A mutation is killed when the suite exits non-zero.

Usage: python3 scripts/pm-w3i-mutations.py --scratch DIR [--json OUT]
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORACLE = 'scripts/pm_w3i_continuity_oracles.py'

MUTATIONS = [
    # The recheck's 14, adapted.
    ('M1', 'id tokens: the owner $defs/id CR/LF guard dropped (full match falls back to anchored search)',
     'append_payload_schema',
     "CONTINUITY_SCHEMA = _load('continuity_event_contracts.schema.json')\n",
     "CONTINUITY_SCHEMA = _load('continuity_event_contracts.schema.json')\nCONTINUITY_SCHEMA['$defs']['id'].pop('not')\n"),
    ('M2', 'owner: ambiguous-receipt refusal removed', 'retained_receipt_unique',
     "        if len(matches) > 1:\n            raise Refusal('original_receipt_ambiguous')\n", ''),
    ('M3', 'Storage observed time checked on the event_record profile', 'append_observed_utc_z',
     "V(reason_of(date_time, E(c)['observed_at_utc'], profile=STORAGE_UTC_Z))",
     "V(reason_of(date_time, E(c)['observed_at_utc'], profile=EVENT_RECORD))"),
    ('M4', 'frozen verifier skips the payload schema', 'frozen_payload_schema',
     "        out['payload_schema'] = schema_errors(CONTINUITY_ID, '/$defs/' + PAYLOAD_DEFS[family], record['payload'])\n",
     "        out['payload_schema'] = []\n"),
    ('M5', 'frozen verifier skips the identity recompute', 'frozen_identity',
     "            out['identity'] = (record['event_id'], event_id)\n",
     "            out['identity'] = (record['event_id'], record['event_id'])\n"),
    ('M6', 'replay fact: prefix-membership clause dropped', 'append_fact_replay_prefix_member',
     "{'presented': P(c)['source_event_id'], 'collection': UP(c)['prefix_event_ids']}",
     "{'presented': P(c)['source_event_id'], 'collection': [P(c)['source_event_id']]}"),
    ('M7', 'replay fact: storage-instance clause dropped', 'append_fact_replay_instance',
     "EQ(UP(c)['token_storage_instance_id'], STORAGE_INSTANCE_ID)",
     "EQ(STORAGE_INSTANCE_ID, STORAGE_INSTANCE_ID)"),
    ('M8', 'retired-publication limit dropped (owner maxItems 2)', 'checkpoint_schema',
     "CONTINUITY_SCHEMA = _load('continuity_event_contracts.schema.json')\n",
     "CONTINUITY_SCHEMA = _load('continuity_event_contracts.schema.json')\n"
     "CONTINUITY_SCHEMA['$defs']['checkpoint']['properties']['retired_publications'].pop('maxItems')\n"),
    ('M9', 'custody partition join dropped', 'append_custody_partition',
     "EQ(CUSTODY(c)['scope_partition'], c['scope_partition'])", "EQ(c['scope_partition'], c['scope_partition'])"),
    ('M10', 'source self-reference clause dropped', 'append_source_not_self',
     "NE(P(c)['source_event_id'], E(c)['event_id'])", "NE(P(c)['source_event_id'], None)"),
    ('M11', 'token checkpoint_key join dropped', 'token_checkpoint_key',
     "EQ(TOK(c)['checkpoint_key'], CHECKPOINT_KEY_PREFIX + TOK(c)['storage_instance_id'])",
     "EQ(TOK(c)['checkpoint_key'], TOK(c)['checkpoint_key'])"),
    ('M12', 'cursor offset order dropped', 'cursor_offset_order',
     "{'start': CUR(c)['byte_offset'], 'end': CUR(c)['frame_end_offset']}",
     "{'start': 0, 'end': CUR(c)['frame_end_offset']}"),
    ('M13', 'producer_sequence_id null clause dropped', 'append_producer_sequence_null',
     "V(E(c)['producer_sequence_id'])", "V(None)"),
    ('M14', 'sequence slot accepts 2**64 (shared storage_uint64 bypassed at the row)', 'append_sequence_uint64',
     "V(reason_of(storage_uint64, E(c)['sequence_id']))",
     "V(reason_of(storage_uint64, min(E(c)['sequence_id'], UINT64_MAX) if type(E(c)['sequence_id']) is int "
     "else E(c)['sequence_id']))"),
    # This round's own, each on a different row.
    ('X1', 'payload created_at_utc no longer joined to the source occurrence time', 'append_created_source',
     "EQ(P(c)['created_at_utc'], c['source']['created_at_utc'])", "EQ(P(c)['created_at_utc'], P(c)['created_at_utc'])"),
    ('X2', 'no-receipt-on-read compares the store snapshot with itself', 'retained_no_receipt_creation',
     "EQ(m.get('retained')['store_after'], m.get('retained')['store_before'])",
     "EQ(m.get('retained')['store_before'], m.get('retained')['store_before'])"),
    ('X3', 'current-gate instrumentation removed', 'retained_no_current_gate',
     "    pm_event_numbers.current_append_policy = counting\n    module.current_append_policy = counting\n", ''),
    ('X4', 'caller override no longer passed to the shared dispatcher', 'retained_recipe_override',
     "recipe_override=case['retained_recipe_override'])", "recipe_override=None)"),
    ('X5', 'retained read consults live admission (the live-state control must fail)', 'retained_disclosure',
     "disclose=lambda binding: case['disclosure_allowed'] is True,",
     "disclose=lambda binding: case['disclosure_allowed'] is True and case['live']['admitted'] is True,"),
    ('X6', 'payload integers skipped by the physical-range row', 'append_event_physical',
     "lambda c, m: V(physical_reason(E(c))), gates=('seq_ok',))",
     "lambda c, m: V(physical_reason({k: v for k, v in E(c).items() if k != 'payload'})), gates=('seq_ok',))"),
    ('X7', 'frozen custody semantic digest compared with itself', 'frozen_receipt_semantic',
     "out['receipt_semantic'] = (receipt['producer_semantic_digest'], semantic)",
     "out['receipt_semantic'] = (semantic, semantic)"),
    ('X8', 'custody validated without the shared date-time format (acknowledged_at_utc)', 'append_custody_schema',
     "lambda c, m: V(schema_errors(RECEIPT_ID, '/$defs/custody_v2', c['custody_receipt'])), gates=('custody_phys_ok',))",
     "lambda c, m: V([e for e in schema_errors(RECEIPT_ID, '/$defs/custody_v2', c['custody_receipt']) "
     "if not e.endswith(':format')]), gates=('custody_phys_ok',))"),
    ('X9', 'retired cores: state-withdrawn clause dropped', 'retired_state',
     "EQ([core['state'] for core in CORES(c)], ['withdrawn'] * len(CORES(c)))",
     "EQ(['withdrawn'] * len(CORES(c)), ['withdrawn'] * len(CORES(c)))"),
    ('X10', 'inline limit doubled', 'append_inline_limit',
     "{'presented': len(pack_value(P(c))), 'limit': INLINE_LIMIT}, gates=('env_ok',),",
     "{'presented': len(pack_value(P(c))), 'limit': INLINE_LIMIT * 2}, gates=('env_ok',),"),
    ('X11', 'SP-337 pack bytes no longer compared with the logical body', 'append_pack_body',
     "EQ(PACK(c)['raw_hex'], pack_value(P(c)).hex())", "EQ(PACK(c)['raw_hex'], PACK(c)['raw_hex'])"),
    ('X12', 'receipt acknowledged_at_utc join dropped (Storage record)', 'append_receipt_acknowledged_at_utc',
     "(lambda k: lambda c, m: EQ(_receipt(c)[k], c['storage_record'][k]))(_k), gates=('custody_ok',))",
     "(lambda k: lambda c, m: EQ(_receipt(c)[k], c['storage_record'][k] if k != 'acknowledged_at_utc' "
     "else _receipt(c)[k]))(_k), gates=('custody_ok',))"),
    ('X13', 'eq template: type check dropped (1 == True, 0 == False)', 'withdrawal_once',
     "\"type(record['presented']) is not type(record['expected']) or record['presented'] != record['expected']\"",
     "\"record['presented'] != record['expected']\""),
]

LANE_COPIES = ('scripts/pm_w3i_continuity_oracles.py', 'scripts/pm-w3i-table-generate.py')


def scratch_tree(scratch):
    """A tree whose lane files are real copies and whose shared files are links (never written)."""
    if scratch.exists():
        shutil.rmtree(scratch)
    (scratch / 'scripts').mkdir(parents=True)
    os.symlink(ROOT / 'Plans', scratch / 'Plans')
    for path in sorted((ROOT / 'scripts').iterdir()):
        if path.name.startswith(('pm_w3i_', 'pm-w3i-')) or path.is_dir():
            continue
        os.symlink(path, scratch / 'scripts' / path.name)
    for rel in LANE_COPIES:
        shutil.copyfile(ROOT / rel, scratch / rel)


def run_suite(scratch):
    gen = subprocess.run([sys.executable, '-B', 'scripts/pm-w3i-table-generate.py'], cwd=scratch,
                         capture_output=True, text=True)
    chk = subprocess.run([sys.executable, '-B', ORACLE], cwd=scratch, capture_output=True, text=True)
    detail = ''
    try:
        out = json.loads(chk.stdout)
        detail = '%d failures; first: %s' % (len(out['failures']), json.dumps(out['failures'][:1], default=str)[:300])
    except (ValueError, KeyError):
        detail = (chk.stderr or chk.stdout)[-300:]
    return gen.returncode, chk.returncode, detail


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--scratch', type=Path, required=True)
    parser.add_argument('--json', type=Path)
    args = parser.parse_args()
    original = (ROOT / ORACLE).read_text()
    scratch = args.scratch.resolve()
    assert ROOT not in scratch.parents and scratch != ROOT, 'scratch must be outside the repository'
    scratch_tree(scratch)
    baseline = run_suite(scratch)
    results = [{'id': 'baseline', 'generator_exit': baseline[0], 'checker_exit': baseline[1], 'detail': baseline[2]}]
    print('baseline generator=%d checker=%d' % baseline[:2], flush=True)
    killed = 0
    for mid, words, row, old, new in MUTATIONS:
        count = original.count(old)
        if count != 1:
            results.append({'id': mid, 'row': row, 'words': words, 'error': 'anchor occurs %d times' % count})
            print('%-4s ANCHOR %d' % (mid, count), flush=True)
            continue
        scratch_tree(scratch)
        (scratch / ORACLE).write_text(original.replace(old, new))
        gen, chk, detail = run_suite(scratch)
        dead = gen != 0 or chk != 0
        killed += dead
        results.append({'id': mid, 'row': row, 'words': words, 'generator_exit': gen, 'checker_exit': chk,
                        'killed': dead, 'detail': detail})
        print('%-4s %-38s generator=%d checker=%d %s' % (mid, row, gen, chk, 'KILLED' if dead else 'SURVIVED'),
              flush=True)
    shutil.rmtree(scratch)
    summary = {'baseline_clean': baseline[0] == 0 and baseline[1] == 0, 'mutations': len(MUTATIONS), 'killed': killed,
               'own_rows': sorted({m[2] for m in MUTATIONS if m[0].startswith('X')}), 'results': results}
    if args.json:
        args.json.write_text(json.dumps(summary, indent=1) + '\n')
    print(json.dumps({k: v for k, v in summary.items() if k != 'results'}))
    return 0 if summary['baseline_clean'] and killed == len(MUTATIONS) else 1


if __name__ == '__main__':
    sys.exit(main())
