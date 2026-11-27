"""Review-id registry and the three credit guards for the DG5 proof branch.

Constructed by dg5-wrongfam (2026-11-24, fix round 1) on head `3a5e7e16d4`; not a standing module.

G1 -- no self-mark.  A row may be CLOSED_BY_PROOF only when its proof entry carries two SOUND
      readings of the LIVE entry text (a read whose text_sha equals the live text's sha), no
      unlisted read of that text is NOT_SOUND/UNSOUND with material (a newer one revokes; the
      settlement's listed reads are the exception), and (rule 4) every declared dependency is
      CLOSED in the row's family.
G2 -- family.  The SOUND readings must have judged the row's family.
G3 -- source id.  A CLOSED row needs an own-family kill record, an own PASS probe table, or two
      SOUND same-family reads (`row_credit`).

Every rule-4 decision needs the family's closed rows.  `decide()` refuses with
`dependency_unknown` when a dependency exists and no closed set is supplied, so a caller can no
longer silently skip the gate.
"""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / 'scripts/dg5_proof_reviews/registry.json'
MIN_SOUND = 2
SOUND = 'SOUND'
REVOKING = ('NOT_SOUND', 'UNSOUND')


class RegistryError(SystemExit):
    """The registry is missing or malformed: fail closed, nothing credited."""


def entry_text_sha(proof):
    """Canonical sha256 of a proof entry's text: kind, argument, sorted depends_on, sorted sites."""
    payload = dict(kind=(proof or {}).get('kind'),
                   argument=(proof or {}).get('argument'),
                   depends_on=sorted((proof or {}).get('depends_on') or []),
                   sites=sorted([list(s) for s in ((proof or {}).get('sites') or [])]))
    return hashlib.sha256(json.dumps(payload, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def load(path=None):
    path = Path(path or REGISTRY)
    try:
        data = json.loads(path.read_text())
    except OSError as error:
        raise RegistryError(f'{path}: {error}; the proof branch needs its review registry '
                            f'(G1: no CLOSED_BY_PROOF without two SOUND readings)')
    except ValueError as error:
        raise RegistryError(f'{path}: {error}')
    for key_name in ('entries', 'credits'):
        if not isinstance(data.get(key_name), dict):
            raise RegistryError(f'{path}: missing {key_name!r} table')
    return data


def key(module, row):
    return f'{module} {row}'


def readings(registry, module, row):
    entry = registry['entries'].get(key(module, row))
    return list(entry.get('readings', [])) if entry else []


def _families(readings_):
    out = []
    for reading in readings_:
        for family in ([reading['family']] if reading.get('family') else []) + list(reading.get('families') or []):
            if family and family not in out:
                out.append(family)
    return out


def _order(reading):
    return (reading.get('read_at') or '', reading.get('review_path') or '')


def _is_live(reading, live_sha):
    """A read counts for the live text only when it read the same text (N1, fix round 1)."""
    if not reading.get('of_live_text'):
        return False
    return live_sha is None or reading.get('text_sha') == live_sha


def _revokes(reading, threshold):
    """N5: exact timestamps against the pair's completion boundary (the earlier of the two newest
    SOUND reads). A material NOT_SOUND after that boundary breaks the pair; one before both SOUND
    reads is superseded. A date-only record on the same day is a tie: no credit, never a guess."""
    a = reading.get('read_at') or ''
    b = threshold.get('read_at') or ''
    if a > b:
        return True
    if a == b:
        return True
    if reading.get('read_at_precision') == 'date' or threshold.get('read_at_precision') == 'date':
        return a[:10] == b[:10] and a[:10] >= b[:10]
    return False


def _declared(readings_):
    return [dict(review_path=r.get('review_path'), reader=r.get('reader'), family=r.get('family'),
                 material=r.get('material'), read_at=r.get('read_at'), mark=r.get('mark'),
                 why=r.get('why')) for r in readings_ if r.get('mark') in REVOKING]


def _settled_path(review_path, settled_ids):
    path = (review_path or '').split('/REVIEW')[0]
    for sid in settled_ids:
        sid = (sid or '').replace('D/', '')
        if not sid:
            continue
        if path == sid or sid.startswith(path + '/') or path.startswith(sid + '/'):
            return True
    return False


def _family_closed(closed_rows, family):
    """A caller may pass the whole {family: rows} table; the gate needs one family's rows (B2)."""
    if isinstance(closed_rows, dict):
        return set(closed_rows.get(family) or ())
    return closed_rows


def settle_dependency(depends_on, closed_rows):
    """The rule-4 gate: returns a refusal dict or None. A dependency with no closed set refuses."""
    if not depends_on:
        return None
    if closed_rows is None:
        return dict(credit=False, status='PENDING_READ',
                    reason='dependency_unknown: %d declared dependency row(s) and no closed set supplied'
                           % len(depends_on), details={})
    missing = [row for row in depends_on if row not in closed_rows]
    if missing:
        return dict(credit=False, status='PENDING_READ',
                    reason='dependency_not_closed: ' + ', '.join(missing), details={})
    return None


def decide(family, readings_, live_sha=None, settlement=None, withdrawal=None, entry_key=None,
           depends_on=(), closed_rows=None, row=None, depends_on_recorded=True):
    """The decision for one row family given the entry's recorded readings.

    Order: rule 4 (dependencies), a lead withdrawal, G2 (family), then the settlement (which
    outweighs only the reads it lists) or the normal G1 pair-and-revoke rule."""
    details = dict(judged_families=_families(readings_), sound=0, sound_live=0, not_sound=[],
                   credit_readings=[], revoked_by=[], settlement=None)
    closed_rows = _family_closed(closed_rows, family)
    if not depends_on_recorded:
        return dict(credit=False, status='PENDING_READ',
                    reason='dependency_unrecorded: the entry or credit states no dependency list; '
                           'refused rather than assumed empty', details=details)
    gate = settle_dependency(depends_on, closed_rows)
    if gate is not None:
        gate['details'] = details
        return gate
    if _withdrawn(withdrawal, family, entry_key, row):
        return dict(credit=False, status='PENDING_READ',
                    reason='withdrawn_by_lead: %s (%s)' % (withdrawal.get('decision'),
                                                           (withdrawal.get('reason') or '')[:160]),
                    details=details)
    sound_all = [r for r in readings_ if r.get('mark') == SOUND and _is_live(r, live_sha)]
    judged = _families(sound_all)
    details.update(sound=len(sound_all), judged_families=_families(readings_),
                   sound_live=len(sound_all), not_sound=_declared(readings_))
    if sound_all and family not in judged:
        return dict(credit=False, status='PENDING_READ',
                    reason='proof_family_differs: entry reviewed for %s, row family %s'
                           % (', '.join(judged) or '(none)', family), details=details)
    sound = [r for r in sound_all if family in _families([r])]
    details['sound'] = len(sound)
    details['credit_readings'] = [dict(review_path=r.get('review_path'), reader=r.get('reader'),
                                       family=r.get('family'), text_sha=r.get('text_sha'),
                                       read_at=r.get('read_at')) for r in sound]
    if settlement is not None and settlement.get('proof_text_sha') == live_sha \
            and settlement.get('family') == family:
        details['settlement'] = dict(id=settlement.get('id'), decision=settlement.get('decision'),
                                     majority=settlement.get('majority'),
                                     settled_utc=settlement.get('settled_utc'),
                                     readings=settlement.get('readings'))
        settled_ids = [r.get('id') for r in settlement.get('readings') or []]
        unlisted = [r for r in readings_ if r.get('mark') in REVOKING and family in _families([r])
                    and _is_live(r, live_sha) and r.get('material') is not False
                    and not _settled_path(r.get('review_path'), settled_ids)]
        if unlisted:
            details['revoked_by'] = [dict(review_path=r.get('review_path'), material=r.get('material'),
                                          read_at=r.get('read_at'), why=r.get('why')) for r in unlisted]
            return dict(credit=False, status='PENDING_READ',
                        reason='revoked_by_material_not_sound_not_in_settlement: %s at %s (settled %s)'
                               % (unlisted[0].get('review_path'), unlisted[0].get('read_at'),
                                  settlement.get('settled_utc')), details=details)
        if settlement.get('majority') != SOUND:
            return dict(credit=False, status='PENDING_READ',
                        reason='lead_settlement_not_credit: majority %s' % settlement.get('majority'),
                        details=details)
        return dict(credit=True, status='CREDIT', reason=None, details=details)
    if len(sound) < MIN_SOUND:
        return dict(credit=False, status='PENDING_READ',
                    reason='no_two_sound_readings: %d SOUND reading(s), %d of the live text (need %d)'
                           % (len(sound_all), len(sound), MIN_SOUND), details=details)
    ordered = sorted(sound, key=_order)
    newest = ordered[-1]
    threshold = ordered[-MIN_SOUND] if len(ordered) >= MIN_SOUND else newest
    later = [r for r in readings_ if r.get('mark') in REVOKING and family in _families([r])
             and _is_live(r, live_sha) and r.get('material') is not False
             and _revokes(r, threshold)]
    if later:
        details['revoked_by'] = [dict(review_path=r.get('review_path'), material=r.get('material'),
                                      read_at=r.get('read_at'), why=r.get('why')) for r in later]
        first = min(later, key=_order)
        return dict(credit=False, status='PENDING_READ',
                    reason=('revoked_by_material_not_sound: %s read %s at %s, not older (same day) '
                            'than the newest SOUND read (%s) of the same text'
                            % (first.get('review_path'), first.get('mark'), first.get('read_at'),
                               newest.get('read_at'))), details=details)
    return dict(credit=True, status='CREDIT', reason=None, details=details)


def _settlement_for(registry, family, row, live_sha):
    for settlement in registry.get('settlements') or []:
        if settlement.get('row') == row and settlement.get('family') == family \
                and settlement.get('proof_text_sha') == live_sha:
            return settlement
    return None


def _withdrawal_for(registry, family, entry_key, row=None):
    """A withdrawal scoped by entry key, or by row + family (the settlement-style scope)."""
    for withdrawal in registry.get('lead_withdrawals') or []:
        if withdrawal.get('family') not in (None, family):
            continue
        if withdrawal.get('entry') is not None:
            if withdrawal.get('entry') == entry_key:
                return withdrawal
            continue
        if row is not None and withdrawal.get('row') == row:
            return withdrawal
    return None


def _withdrawn(withdrawal, family, entry_key, row):
    if withdrawal is None:
        return False
    if withdrawal.get('family') not in (None, family):
        return False
    if withdrawal.get('entry') is not None:
        return withdrawal.get('entry') == entry_key
    return row is not None and withdrawal.get('row') == row


def credit_decision(family, row, proof, registry=None, closed_rows=None):
    """Builder path: the decision for a written proof record the builder is about to credit.

    Rule 4 gates on the UNION of the head module's depends_on and the registry entry's full
    recorded list (errata + lead additions + packet additions), so a dependency the registry
    records but the head blob omits is enforced here exactly as on the claims path (v9 B2)."""
    registry = registry if registry is not None else load()
    module = (proof or {}).get('module')
    if module is None or (proof or {}).get('kind') == 'presence':
        return dict(credit=False, status='PENDING_READ',
                    reason='presence_justification: no written proof entry to read',
                    details=dict(kind=(proof or {}).get('kind'), sound=0, sound_live=0))
    live = entry_text_sha(proof)
    entry_key = key(module, row)
    entry = registry['entries'].get(entry_key)
    depends_on = list(dict.fromkeys(list((proof or {}).get('depends_on') or ()) +
                                    list((entry or {}).get('depends_on') or ())))
    recorded = (entry or {}).get('depends_on_recorded', True)
    return decide(family, readings(registry, module, row), live,
                  _settlement_for(registry, family, row, live),
                  _withdrawal_for(registry, family, entry_key, row), entry_key,
                  depends_on=depends_on, closed_rows=closed_rows,
                  row=row, depends_on_recorded=recorded)


def row_credit(family, row, registry=None, closed_rows=None):
    """G3 path: the first entry record for this row whose family matches and which credits."""
    registry = registry if registry is not None else load()
    for entry_key in sorted(registry['entries']):
        entry = registry['entries'][entry_key]
        if entry.get('row') != row or family not in (entry.get('families') or []):
            continue
        decision = decide(family, entry.get('readings', []), entry.get('text_sha'),
                          _settlement_for(registry, family, row, entry.get('text_sha')),
                          _withdrawal_for(registry, family, entry_key, row), entry_key,
                          depends_on=list(entry.get('depends_on') or ()), closed_rows=closed_rows,
                          row=row, depends_on_recorded=entry.get('depends_on_recorded', True))
        if decision['credit']:
            return dict(entry=entry_key, credit_readings=decision['details'].get('credit_readings'),
                        class_=entry.get('class_'))
    return None


def claim_decision(family, record=None, row=None, entry=None, registry=None, closed_rows=None):
    """Recorded-credit path: a `credits` record (cycle-2 packet credit) or an `entries` key."""
    registry = registry if registry is not None else load()
    if entry is not None:
        claim = registry['entries'].get(entry)
        if claim is None:
            return dict(credit=False, status='PENDING_READ',
                        reason='no registry entry %s' % entry, details={})
        live = claim.get('text_sha')
        decision = decide(family, claim.get('readings', []), live,
                          _settlement_for(registry, family, claim.get('row'), live),
                          _withdrawal_for(registry, family, entry, claim.get('row')), entry,
                          depends_on=list(claim.get('depends_on') or ()), closed_rows=closed_rows,
                          row=claim.get('row'),
                          depends_on_recorded=claim.get('depends_on_recorded', True))
        decision['details']['claim'] = dict(entry=entry, family=family, row=claim.get('row'))
        return decision
    claim = registry['credits'].get(f'{record} {row}')
    if claim is None:
        return dict(credit=False, status='PENDING_READ',
                    reason='no registry record for %s at %s' % (record, row), details={})
    if claim.get('text_sha') is None:
        return dict(credit=False, status='PENDING_READ',
                    reason='unidentified_text: the credit record names no judged text (N1 backfill)',
                    details={})
    decision = decide(family, claim.get('readings', []), claim.get('text_sha'),
                      depends_on=list(claim.get('depends_on') or ()), closed_rows=closed_rows,
                      depends_on_recorded=claim.get('depends_on_recorded', True))
    decision['details']['claim'] = dict(record=record, row=row, family=family, entry=claim.get('entry'))
    return decision


def check_claims(path, registry=None, closed_rows=None):
    """Run claim_decision over {'claims': [{id, record|entry, row, family}]}."""
    registry = registry if registry is not None else load()
    data = json.loads(Path(path).read_text())
    results = []
    for claim in data['claims']:
        decision = claim_decision(claim['family'], claim.get('record'), claim.get('row'),
                                  claim.get('entry'), registry, closed_rows)
        results.append(dict(claim, credit=decision['credit'], status=decision['status'],
                            reason=decision['reason'], details=decision['details']))
    return results, [r for r in results if not r['credit']]


def load_closed_rows(path):
    """{'family': [rows]} from a JSON file; a list of {row, family} is also accepted."""
    data = json.loads(Path(path).read_text())
    if isinstance(data, dict):
        return {family: set(rows) for family, rows in data.items()}
    out = {}
    for item in data:
        out.setdefault(item['family'], set()).add(item['row'])
    return out


def main(argv=None):
    import argparse
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--registry', type=Path, default=REGISTRY)
    parser.add_argument('--closed-rows', type=Path, default=None,
                        help='JSON {family: [closed rows]}; required for any claim or entry with depends_on')
    parser.add_argument('--check-credits', type=Path, metavar='CLAIMS.json',
                        help='check recorded credits [{id, record|entry, row, family}]')
    parser.add_argument('--entry', nargs=3, metavar=('MODULE', 'ROW', 'FAMILY'),
                        help='decision for one head entry key as the builder would see it')
    args = parser.parse_args(argv)
    registry = load(args.registry)
    closed = load_closed_rows(args.closed_rows) if args.closed_rows else None
    if args.check_credits:
        results, refused = check_claims(args.check_credits, registry, closed)
        print(json.dumps(dict(claims=len(results), refused=len(refused),
                              pending_read=sum(1 for r in refused if r['status'] == 'PENDING_READ'),
                              results=results), indent=1))
        return 1 if refused else 0
    if args.entry:
        module, row, family = args.entry
        entry = registry['entries'].get(key(module, row))
        if entry is None:
            raise RegistryError(f'no registry entry for {module} {row}')
        proof = dict(kind=entry.get('kind'), argument=entry.get('argument'),
                     depends_on=entry.get('depends_on'), sites=entry.get('sites'),
                     module=module)
        print(json.dumps(credit_decision(family, row, proof, registry,
                                         (closed or {}).get(family)), indent=1))
        return 0
    counts = dict(entries=len(registry['entries']), credits=len(registry['credits']),
                  entries_rule1=sum(1 for e in registry['entries'].values() if e.get('class_') == 'RULE1_MET'))
    print(json.dumps(counts, indent=1))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
