#!/usr/bin/env python3
"""Card 6 owner-policy model. Scores are captured owner values, never identity inputs.

No serializer, score normalization, number cap or maintenance admission is defined here.
"""
from copy import deepcopy
from datetime import datetime, timedelta
from decimal import Decimal
import math

CUTOFFS = {'monthly_summary': (90, Decimal('0.10'), 'DL-446'),
           'prune_archive': (180, Decimal('0.05'), 'DL-447')}


def instant(core, value):
    core.require(type(value) is str and core.enforced_formats().conforms(value, 'date-time'),
                 'selection_timestamp')
    return datetime.fromisoformat(value.replace('t', 'T').replace('z', '+00:00').replace('Z', '+00:00'))


def selection_checks(core, snapshot, job):
    """Only selected, already resolved originals; no count trigger or cross-scope pool.

    Kind/pin/existence/uniqueness checks stay at the existing archive boundary. Pins are
    excluded here before reading a score. An absent edit/access independently falls back
    to creation, then the later instant wins. Fractional days are compared as durations.
    """
    days, score, _ = CUTOFFS[job]
    selected = [snapshot['memories'][key] for key in snapshot['selected_ids']
                if key in snapshot['memories'] and snapshot['memories'][key]['pinned'] is not True]
    yield 'selection_scope', (type(snapshot['project_id']) is str and bool(snapshot['project_id'])
                              and all(m['project_id'] == snapshot['project_id'] for m in selected))
    # Exact flag type belongs to archive.memory_flags; this predicate owns active vs archived.
    yield 'selection_active', all(not m['archived'] for m in selected if type(m['archived']) is bool)
    captured = instant(core, snapshot['captured_at'])
    starts = [max(instant(core, m['created_at'] if m.get('updated_at') is None else m['updated_at']),
                  instant(core, m['created_at'] if m.get('last_access_at') is None else m['last_access_at']))
              for m in selected]
    yield 'selection_age', all(captured - start >= timedelta(days=days) for start in starts)
    values = [m['usefulness_score'] for m in selected]
    valid = all(type(v) in (int, float, Decimal) and
                (v.is_finite() if type(v) is Decimal else math.isfinite(v) if type(v) is float else True)
                for v in values)
    yield 'selection_score_type', valid
    yield 'selection_score', all(v < score for v in values) if valid else True


def dedup_candidate(core, before):
    """One owner-eligible identical group; eligibility itself is supplied by the owner.

    Selection always uses the oldest original then stable note ID.
    """
    memories = before['memories']; ids = before['eligible_ids']
    core.require(len(ids) >= 2 and len(ids) == len(set(ids)) and all(k in memories for k in ids),
                 'dedup_eligible_group')
    group = [memories[k] for k in ids]
    core.require(all(type(m['pinned']) is bool and type(m['archived']) is bool for m in group), 'dedup_flags')
    # A pin cannot enter this group, even if its hash matches. No pin is scored or changed.
    core.require(all(not m['pinned'] and not m['archived'] for m in group
                     if type(m['pinned']) is bool and type(m['archived']) is bool), 'dedup_protected')
    core.require(type(before['project_id']) is str and bool(before['project_id'])
                 and all(m['project_id'] == before['project_id'] for m in group), 'dedup_scope')
    core.require(len({m['embed_text_hash'] for m in group}) == 1, 'dedup_identical')
    oldest = min(ids, key=lambda key: (instant(core, memories[key]['created_at']), key))
    survivor = oldest
    after = deepcopy(before)
    refs = sorted({ref for m in group for ref in m['evidence_refs']})
    after['memories'][survivor]['evidence_refs'] = refs
    for key in ids:
        if key != survivor:
            after['memories'][key]['archived'] = True
            after['memories'][key]['survivor_id'] = survivor
    after['merge_records'].append({'original_ids': sorted(ids), 'survivor_id': survivor,
                                    'original_evidence_refs': {k: deepcopy(memories[k]['evidence_refs']) for k in sorted(ids)}})
    return after


def dedup_checks(core, before, after):
    """Independent postconditions; a malformed outcome can violate more than one."""
    source, result = before['memories'], after['memories']
    ids = before['eligible_ids']; common = set(source) & set(result)
    record = after['merge_records'][-1]; survivor = record['survivor_id']
    oldest = min(ids, key=lambda key: (instant(core, source[key]['created_at']), key))
    yield 'dedup_survivor', survivor == oldest
    yield 'dedup_originals', set(result) == set(source)
    yield 'dedup_lineage', (after['merge_records'][:-1] == before['merge_records']
                            and record['original_ids'] == sorted(ids)
                            and record['original_evidence_refs'] == {k: source[k]['evidence_refs'] for k in sorted(ids)})
    yield 'dedup_evidence', all(result[k]['evidence_refs'] ==
                                (sorted({r for i in ids for r in source[i]['evidence_refs']})
                                 if k == survivor else source[k]['evidence_refs']) for k in common)
    yield 'dedup_versions', all(result[k]['versions'] == source[k]['versions'] for k in common)
    yield 'dedup_disposition', all(result[k]['archived'] is (k != survivor) for k in set(ids) & common)
    yield 'dedup_links', all(result[k].get('survivor_id') == survivor for k in set(ids) & common - {survivor})
    yield 'dedup_original_fields', all(
        {f: v for f, v in result[k].items() if f not in ('evidence_refs', 'versions', 'archived', 'survivor_id')}
        == {f: v for f, v in source[k].items() if f not in ('evidence_refs', 'versions', 'archived', 'survivor_id')}
        for k in set(ids) & common)
    yield 'dedup_unselected', all(result[k] == source[k] for k in common - set(ids))


def dedup_validate(core, before, after):
    for name, valid in dedup_checks(core, before, after):
        core.require(valid, name)
    return True


def run(core, families, archive=None):
    fixtures = core.load('Plans/memory_card6_policy_fixtures.json')
    result = {}
    for event in families:
        job = event.split('.')[1]
        if job not in (*CUTOFFS, 'dedup_sweep'):
            continue
        counts = {'positives': 0, 'negatives': 0, 'one_defect_negatives': []}
        for case in fixtures['cases']:
            if case['job'] != job:
                continue
            before = deepcopy(case['before']); frozen = deepcopy(before)
            if job == 'dedup_sweep':
                if case.get('candidate_refusal'):
                    try:
                        dedup_candidate(core, before)
                    except core.Refusal as error:
                        assert str(error) == case['candidate_refusal'], case['name']
                    else:
                        raise AssertionError((case['name'], 'accepted invalid merge'))
                    errors = [case['candidate_refusal']]
                else:
                    after = case.get('after', dedup_candidate(core, before))
                    errors = [name for name, valid in dedup_checks(core, before, after) if not valid]
                    try:
                        dedup_validate(core, before, after)
                    except core.Refusal as error:
                        assert str(error) == case.get('refusal'), (case['name'], str(error))
                    else:
                        assert 'refusal' not in case, case['name']
                    if not errors:
                        assert after == case['expected'], case['name']
            else:
                assert archive is not None
                errors = []
                if any(before['memories'][key]['pinned'] for key in before['selected_ids']):
                    errors.append('selection_pinned')
                if job == 'monthly_summary' and any(before['memories'][key]['kind'] != 'Note'
                                                    for key in before['selected_ids']):
                    errors.append('selection_kind')
                try:
                    errors += [name for name, valid in selection_checks(core, before, job) if not valid]
                except core.Refusal as error:
                    errors.append(str(error))
                try:
                    after = archive.archive_candidate(before, job)
                    archive.archive_validate(before, after, job)
                except core.Refusal as error:
                    assert str(error) == case.get('refusal'), (case['name'], str(error))
                else:
                    assert 'refusal' not in case and after == case['expected'], case['name']
            assert before == frozen, (case['name'], 'mutated caller input')
            assert errors == ([case['refusal']] if 'refusal' in case else []), (case['name'], errors)
            counts['negatives' if errors else 'positives'] += 1
            if errors:
                counts['one_defect_negatives'].append(case['name'])
        result[event] = counts
    return result
