"""Coherent single-defect witness construction for the DCN guard tables (sweep part 2A).

A witness starts from a named valid DCN positive, changes one fact, and moves every
observational copy that legitimately follows that fact: the Storage original's
recomputed idempotency key and event_id, the retry observation of the original,
the receipt copies Storage issued for it, and the retry result recomputed by the
shared producer digest. Changes are emitted as JSON-pointer replacements against
the base so pm_card2_events.mutate reproduces the scenario exactly.
"""
import copy
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pm_card2_events as dcn  # noqa: E402


def diff(base, new, pointer=''):
    """Minimal replacements turning base into new (a dict that gains or loses keys is replaced whole)."""
    if type(base) is dict and type(new) is dict and base.keys() <= new.keys() and (base.keys() == new.keys() or pointer == '' or
                                                                                 pointer.count('/') <= 1):
        out = []
        for k in new:
            out += diff(base[k], new[k], pointer + '/' + k) if k in base else [[pointer + '/' + k, copy.deepcopy(new[k])]]
        return out
    if pointer == '':
        raise ValueError('a witness may not remove a top-level scenario key')
    if type(base) is list and type(new) is list and len(base) == len(new) and \
            all([type(a) in (dict, list) for a in base]) and len(base) > 0:
        out = []
        for i, (a, b) in enumerate(zip(base, new)):
            out += diff(a, b, pointer + '/' + str(i))
        return out
    if dcn.strict_equal(base, new):
        return []
    return [[pointer, copy.deepcopy(new)]]


def refresh_identity(e):
    """Recompute the event's own idempotency key and event_id from its payload."""
    try:
        e['idempotency_key'] = dcn.expected_key(e)
        e['event_id'] = dcn.expected_event_id(e)
    except dcn.CAUGHT:
        pass


def sync_original(c, keep_identity=False):
    """After editing c['storage']['event'] in place: refresh its identity, copy it to the
    retry observation and the receipt, and recompute the retry result."""
    s = c['storage']['event']
    if not keep_identity:
        refresh_identity(s)
    if c.get('path') in ('retry', 'history') and 'receipt' in c['storage']:
        for key in ['event_id', 'sequence_id', 'observed_at_utc', 'persisted_at_utc']:
            c['storage']['receipt'][key] = copy.deepcopy(s[key])
    if 'retry' in c:
        c['retry']['original_event'] = copy.deepcopy(s)
        if c.get('path') == 'retry':
            try:
                if type(c['retry']['dedupe_available']) is bool and (not c['retry']['dedupe_available'] or dcn.digests_available(c)):
                    c['retry']['result'] = dcn.retry_expected(c)
            except dcn.CAUGHT:
                pass


def sync_candidate(c, keep_identity=False):
    """After editing c['event'] in place: refresh its identity and the retry result."""
    if not keep_identity:
        refresh_identity(c['event'])
    if c.get('path') == 'retry':
        try:
            if type(c['retry']['dedupe_available']) is bool and (not c['retry']['dedupe_available'] or dcn.digests_available(c)):
                c['retry']['result'] = dcn.retry_expected(c)
        except dcn.CAUGHT:
            pass
    if c.get('path') == 'history':
        c['storage']['event'] = copy.deepcopy(c['event'])
        for key in ['event_id', 'sequence_id', 'observed_at_utc', 'persisted_at_utc']:
            c['storage']['receipt'][key] = copy.deepcopy(c['event'][key])


def failing(c):
    first, rows = dcn.evaluate(c)
    return first, rows


def accepted_alone(c, target):
    """The scenario is refused first at target and every other refusing row is entailed by it."""
    first, rows = dcn.evaluate(c)
    if first is None or first[0] != target:
        return False
    return all([n == target or (n in dcn.ENTAILED and target in dcn.ENTAILED[n][0]) for n in rows])
