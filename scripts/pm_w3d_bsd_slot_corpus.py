#!/usr/bin/env python3
"""Per-slot shared corpus through the complete W3D checker (PNC-019 lane s4d).

Numbers: every scalar value the shared number corpus materializes (Plans/event_number_recipe_corpus.json, the seven
scalar operations the phase-2 adapter selects), plus explicit edge vectors, is placed in EVERY integer slot the lane
owns and run through that slot's real boundary (append, settle, publish, retry or the sealed-original read). The
expected outcome is transcribed here from each slot's owner domain, independently of the shared helpers:

- uint64 (Storage-assigned and Storage control slots): an exact integer, not a boolean, in [0, 2**64 - 1];
- current (owner generation/epoch inputs that are not producer-projection fields): an exact integer >= 0;
- producer (producer-projection integers: payload integers and producer_sequence_id): an exact integer >= 0 whose
  RFC 8785 JSON form is exact, i.e. it survives binary64 and its shortest ECMAScript decimal spelling equals it.

A slot accepts exactly when the value is in its domain; otherwise the first refusal must be one of that slot's own
rows (never an unrelated row, never an exception). Date-time: every shared corpus date-time case with an explicit
outcome for a profile is placed in every timestamp slot of that owner profile, and must be accepted exactly when
the corpus accepts it, refusing at that slot's own row otherwise. No shared helper computes an expectation.

Usage: python3 -B scripts/pm_w3d_bsd_slot_corpus.py --json <out.json>
"""
import argparse
import copy
import json
import sys
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_w3d_bsd_events as m  # noqa: E402
import pm_w3d_bsd_numbers as runner  # noqa: E402
import pm_w3d_bsd_spec as spec  # noqa: E402
import pm_event_numbers as numbers  # noqa: E402

U64 = 2 ** 64 - 1
# Payload integers an owner transition predicate ties to a companion value (latest > raised, count = prior + 1,
# previous revision = expected prior, quarantine count selects the action). Their current-write slot cannot hold an
# arbitrary in-domain value alone; their number handling is covered on the sealed-original read slot and by the
# payload type/minimum rows.
SEMANTIC_INTEGERS = {('finding_reconfirmed', 'raised_against_generation'), ('finding_reconfirmed', 'latest_checked_generation'),
                     ('finding_reconfirmed', 'reconfirmation_count'), ('policy_changed', 'previous_policy_revision'),
                     ('output_quarantined', 'consecutive_quarantine_count')}


def exact_int(v):
    return type(v) is int


def es6_integer_text(v):
    """ECMAScript Number::toString of float(v) for an integral binary64 below 1e21 (RFC 8785 number form)."""
    f = float(v)
    text = repr(f)
    if 'e' in text or 'E' in text:
        mantissa, exponent = text.lower().split('e')
        digits = mantissa.replace('.', '').lstrip('-')
        point = len(mantissa.split('.')[0].lstrip('-'))
        exponent = int(exponent)
        whole = digits + '0' * max(0, point + exponent - len(digits))
        return whole[:point + exponent] if point + exponent < len(digits) else whole
    return text[:-2] if text.endswith('.0') else text


def in_domain(domain, v):
    if domain.endswith('?'):
        if v is None:
            return True
        domain = domain[:-1]
    if not exact_int(v) or v < 0:
        return False
    if domain == 'uint64':
        return v <= U64
    if domain == 'uint64_advance':
        return 1 <= v <= U64  # a nonempty advance needs a lawful prior revision v - 1
    if domain == 'current':
        return True
    if domain == 'producer':
        try:
            f = float(v)
        except OverflowError:
            return False
        if int(f) != v or v >= 10 ** 21:
            return False
        return Decimal(es6_integer_text(v)) == Decimal(v)
    raise KeyError(domain)


def _both(*setters):
    def fn(obj, W):
        for s in setters:
            s(obj, W)
    return fn


def _payload_int(field):
    return lambda v: {'payload': m.setp(field, v)}


def _native_fact_int(field):
    return lambda v: {'native': lambda n, W: n['facts'].__setitem__(field, v)}


def _retained(field, payload=False):
    def build(v):
        def mutate(R, W):
            record = copy.deepcopy(W['env'])
            (record['payload'] if payload else record)[field] = v
            try:
                m.retained_original_record(R, record)
            except m.Refusal:
                # The Storage profile cannot even encode it: the sealed bytes are unusable.
                R['stored'][R['original_ref']]['record'] = b''
        return {'read': mutate}
    return build


def integer_slots(fam):
    """(slot id, route, builder(value) -> muts, domain, own rows) for every lane integer slot of this family."""
    backed = fam['assignment_backed']
    payload_schema = m.SCHEMAS['bsd_event_payloads']['$defs'][fam['slug']]['properties']
    slots = [
        ('envelope.sequence_id', 'append', lambda v: {'meta': m.setp('sequence_id', v)}, 'uint64',
         {'EN01_envelope_schema', 'EN05_sequence_uint64'}),
        ('envelope.producer_sequence_id', 'append', lambda v: {'envelope': m.setp('producer_sequence_id', v)}, 'producer?',
         {'EN01_envelope_schema', 'EN06_producer_sequence', 'EN07_producer_qualified'}),
        ('retry.producer_sequence_id', 'retry', lambda v: {'envelope': m.setp('producer_sequence_id', v)}, 'producer?',
         {'RT09_retry_envelope_schema', 'RT10_retry_producer_sequence', 'RT05_retry_digest_equal', 'RT04_retry_original_found'}),
        ('owner.writer_generation', 'append', lambda v: {'native': m.setp('writer_generation', v),
                                                        'admission': m.setp('live_writer_generation', v)}, 'current',
         {'AD09_current_writer_generation', 'AD09_writer_generation_domain'}),
        ('retained.sequence_id', 'read', _retained('sequence_id'), 'uint64', {'HI05_original_verifies'}),
        ('retained.producer_sequence_id', 'read', _retained('producer_sequence_id'), 'producer?', {'HI05_original_verifies'}),
    ]
    def receipt_setter(s):
        # RC17 relates the two offsets (durable end covers the appended byte); keep the companion lawful.
        companion = {'byte_offset': ('durable_end_offset', U64), 'durable_end_offset': ('byte_offset', 0)}.get(s)
        if companion is None:
            return lambda v: {'receipt': m.setp(s, v)}
        return lambda v: {'receipt': _both(m.setp(s, v), m.setp(companion[0], companion[1]))}
    for slot in m.rows_spec.RECEIPT_UINT[1:]:
        slots.append((f'receipt.{slot}', 'settle', receipt_setter(slot), 'uint64',
                      {'RC01_custody_schema', f'RC{12 + m.rows_spec.RECEIPT_UINT[1:].index(slot):02d}_receipt_{slot}_uint64',
                       'RC17_receipt_durability', 'RC27_head_schema', 'RC28_operation_complete_schema'}))
    # The record's Storage sequence is part of its full value: an unencodable sequence has no CV-339 commitment.
    slots.append(('receipt.sequence_id', 'settle', lambda v: {'meta': m.setp('sequence_id', v)}, 'uint64',
                  {'RC01_custody_schema', 'RC08_full_value', 'RC11_receipt_sequence_uint64', 'RC27_head_schema',
                   'RC28_operation_complete_schema'}))

    def frontier(v):
        # CS02 relates candidate and prior revisions (+1): keep the prior lawful when the candidate is an exact integer.
        prior = v - 1 if exact_int(v) and v >= 1 else v
        return {'cand': m.setp('index_read_token', 'frontier_revision', v), 'live': m.setp('frontier_revision', v),
                'pred': m.setp('index_read_token', 'frontier_revision', prior)}
    slots.append(('checkpoint.frontier_revision', 'publish', frontier, 'uint64_advance',
                  {'CP01_root_schema', 'CP26_token_uint64', 'CS02_revision_step', 'CZ01_checkpoint_size'}))
    for field in m.rows_spec.CHECKPOINT_INTEGERS:
        slots.append((f'checkpoint.{field}', 'publish',
                      (lambda f: lambda v: {'cand': m.setp('index_read_token', 'source_selection', f, v),
                                            'live': m.setp('source_selection', f, v)})(field),
                      'uint64', {'CP01_root_schema', 'CP26_uint64_' + field}))
    if backed:
        slots.append(('owner.epoch', 'append', lambda v: {'native': m.setp('epoch', v), 'admission': m.setp('live_epoch', v)},
                      'producer', {'AD11_current_epoch', 'AD11_epoch_domain', 'EN07_producer_qualified',
                                   'payload.epoch.type', 'payload.epoch.minimum'}))
    for field, schema in payload_schema.items():
        branches = schema.get('oneOf', [schema])
        if not any(b.get('type') == 'integer' for b in branches):
            continue
        if field == 'epoch':
            continue  # joined to the owner epoch; covered by owner.epoch with its live copy
        if (fam['slug'], field) in SEMANTIC_INTEGERS:
            continue  # an owner transition predicate relates it to a companion value; the retained slot below covers it
        own = {f'payload.{field}.type', f'payload.{field}.minimum', f'payload.{field}.maximum', 'EN07_producer_qualified',
               'EN01_envelope_schema', f'payload_{field}_source_join', f'OW_{field}_join'}
        if field in ('policy_revision', 'primary_generation'):
            setter = (lambda f: lambda v: {'native': m.setp(f, v)})(field)
        elif any(src == ('fact', field) for f2, src in fam['owner_sources'] if f2 == field):
            setter = _native_fact_int(field)
        else:
            setter = None
        if setter is None:
            # owner-joined to a stored body or mapped fact: substitute both the owner source and the copy
            src = next((s for f2, s in fam['owner_sources'] if f2 == field), None)
            if src and src[0] == 'fact':
                setter = _native_fact_int(src[1])
            elif src and src[0] == 'body':
                setter = (lambda f: lambda v: {'logical_body': m.setp(f, v), 'payload': m.setp(f, v)})(field)
            else:
                setter = _payload_int(field)
        slots.append((f'payload.{field}', 'append', setter, 'producer', own | {'SR09_sem_newer_generation',
                                                                                 'SR11_sem_count', 'SR08_sem_revision_cas',
                                                                                 'PK09_source_body_schema', 'PK05_pack_decodes',
                                                                                 'PK06_pack_intent'}))
        slots.append((f'retained.payload.{field}', 'read', _retained(field, payload=True), 'producer', {'HI05_original_verifies'}))
    return slots


def time_slots(fam):
    """(slot id, route, builder(value) -> muts, profile, own rows)."""
    out = [
        ('envelope.occurred_at_utc', 'append', lambda v: {'native': m.setp('occurred_at_utc', v)}, 'event_record',
         {'EN02_occurred_clock'}),
        ('envelope.observed_at_utc', 'append', lambda v: {'meta': m.setp('observed_at_utc', v)}, 'storage_utc_z',
         {'EN03_observed_clock'}),
        ('envelope.persisted_at_utc', 'append', lambda v: {'meta': m.setp('persisted_at_utc', v)}, 'storage_utc_z',
         {'EN04_persisted_clock'}),
        ('receipt.acknowledged_at_utc', 'settle', lambda v: {'receipt': m.setp('acknowledged_at_utc', v)}, 'event_record',
         {'RC16_ack_clock'}),
        ('retained.occurred_at_utc', 'read', _retained('occurred_at_utc'), 'event_record', {'HI05_original_verifies'}),
        ('retained.observed_at_utc', 'read', _retained('observed_at_utc'), 'storage_utc_z', {'HI05_original_verifies'}),
        ('retained.persisted_at_utc', 'read', _retained('persisted_at_utc'), 'storage_utc_z', {'HI05_original_verifies'}),
    ]
    if fam['source_kind'] in ('finding', 'review_cycle', 'quarantine', 'workflow_binding'):
        out.append(('source_body.created_at', 'append', lambda v: {'logical_body': m.setp('created_at', v)}, 'event_record',
                    {'PK10_source_body_clocks'}))
    if fam['source_kind'] == 'finding':
        out.append(('source_body.updated_at', 'append', lambda v: {'logical_body': m.setp('updated_at', v)}, 'event_record',
                    {'PK10_source_updated_clock'}))
    return out


def number_values(corpus):
    values, parser_only = [], 0
    for case in corpus['cases']:
        if case['op'] not in runner.OPS or case.get('date_time_profile'):
            continue
        try:
            values.append((case['id'], runner.extract(case)))
        except numbers.Refusal:
            parser_only += 1
    with m.exact_integer_digits():
        big = int('9' * 4400)
    edges = [('edge:0', 0), ('edge:1', 1), ('edge:2**53-1', 2 ** 53 - 1), ('edge:2**53', 2 ** 53), ('edge:2**53+1', 2 ** 53 + 1),
             ('edge:2**60', 2 ** 60), ('edge:2**64-1', U64), ('edge:2**64', 2 ** 64), ('edge:-1', -1), ('edge:7.0', 7.0),
             ('edge:-0.0', -0.0), ('edge:True', True), ('edge:str7', '7'), ('edge:None', None), ('edge:4400-digit', big)]
    return values + edges, parser_only


def time_values(corpus):
    """(id, value, {profile: accepted?}) from the shared corpus's explicit date-time outcomes."""
    out = {}
    for case in corpus['cases']:
        if case['op'] == 'envelope_datetime':
            profile = case['target_predicate'].split('.', 1)[1]
            out.setdefault((case['value'],), {})[profile] = 'error' not in case
        elif case['op'] == 'datetime' and case.get('target_predicate', '').startswith('date_time.'):
            profile = case['target_predicate'].split('.', 1)[1]
            out.setdefault((case['value'],), {})[profile] = 'error' not in case
    return [(f'dt:{i}', key[0], profiles) for i, (key, profiles) in enumerate(sorted(out.items(), key=lambda kv: repr(kv[0])))]


def run_one(fam, route, muts):
    W = m.build(fam, muts)
    outcome = m.run_path(route, W)
    agrees = route != 'read' or m.dispatcher_agrees(W)
    return (list(outcome[:3]) if outcome else None), agrees


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--json')
    ap.add_argument('--family', action='append')
    args = ap.parse_args(argv)
    corpus = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    nvalues, parser_only = number_values(corpus)
    tvalues = time_values(corpus)
    per_slot, problems = {}, []
    with m.exact_integer_digits():
        for fam in spec.FAMILIES:
            if args.family and fam['slug'] not in args.family:
                continue
            for slot, route, builder, domain, own in integer_slots(fam):
                c = per_slot.setdefault(f'{slot}', dict(kind='integer', domain=domain, route=route, runs=0, accepted=0,
                                                        refused=0, mismatches=0, exceptions=0, families=0))
                c['families'] += 1
                for cid, value in nvalues:
                    c['runs'] += 1
                    want = in_domain(domain, value)
                    try:
                        actual, agrees = run_one(fam, route, builder(value))
                    except Exception as error:  # noqa: BLE001 - every exception is a failure
                        c['exceptions'] += 1
                        problems.append(dict(family=fam['slug'], slot=slot, case=cid, exception=f'{type(error).__name__}: {error}'[:200]))
                        continue
                    c['accepted' if actual is None else 'refused'] += 1
                    good = agrees and ((actual is None) if want else (actual is not None and actual[1] in own))
                    if not good:
                        c['mismatches'] += 1
                        problems.append(dict(family=fam['slug'], slot=slot, case=cid, value=repr(value)[:60], expected_accept=want,
                                             actual=actual, dispatcher_agrees=agrees))
            for slot, route, builder, profile, own in time_slots(fam):
                c = per_slot.setdefault(f'{slot}', dict(kind='date-time', profile=profile, route=route, runs=0, accepted=0,
                                                        refused=0, mismatches=0, exceptions=0, families=0))
                c['families'] += 1
                for cid, value, profiles in tvalues:
                    if profile not in profiles:
                        continue
                    c['runs'] += 1
                    want = profiles[profile]
                    try:
                        actual, agrees = run_one(fam, route, builder(value))
                    except Exception as error:  # noqa: BLE001
                        c['exceptions'] += 1
                        problems.append(dict(family=fam['slug'], slot=slot, case=cid, exception=f'{type(error).__name__}: {error}'[:200]))
                        continue
                    c['accepted' if actual is None else 'refused'] += 1
                    good = agrees and ((actual is None) if want else (actual is not None and actual[1] in own))
                    if not good:
                        c['mismatches'] += 1
                        problems.append(dict(family=fam['slug'], slot=slot, case=cid, value=value, expected_accept=want,
                                             actual=actual, dispatcher_agrees=agrees))
    totals = dict(slots=len(per_slot), runs=sum(c['runs'] for c in per_slot.values()),
                  accepted=sum(c['accepted'] for c in per_slot.values()), refused=sum(c['refused'] for c in per_slot.values()),
                  mismatches=sum(c['mismatches'] for c in per_slot.values()),
                  exceptions=sum(c['exceptions'] for c in per_slot.values()))
    out = dict(status='pass' if not problems else 'fail', number_values=len(nvalues), parser_only_cases=parser_only,
               date_time_values=len(tvalues), totals=totals, per_slot=per_slot, problems=problems[:400])
    if args.json:
        Path(args.json).write_text(json.dumps(out, indent=1, default=str) + '\n')
    print(json.dumps({k: v for k, v in out.items() if k not in ('per_slot', 'problems')}, indent=1, default=str))
    for p in problems[:30]:
        print(json.dumps(p, default=str)[:300])
    return 0 if not problems else 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
