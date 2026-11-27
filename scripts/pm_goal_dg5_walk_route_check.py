#!/usr/bin/env python3
"""Mechanical T371 / route check over an intake walk-credit ledger (DG5 C12).

    python3 -B walk_route_check.py --intake INTAKE.json --evidence DIR [--json OUT]

The flag is derived from each piece's own walk evidence, never from the edition's route
prose:

  * a piece with `evidence/absent-root-route.json` is PINNED only when its route version is
    v2e/v2f (the pinned absent-root releases) or a component pin file carries `crawl_pin`;
    a v1/v2/v2b/v2c route, or a reused component whose pins file has no `crawl_pin`, is
    UNPINNED;
  * a piece with `evidence/coverage.json.crawl-pin.json` and no absent-root route is PINNED;
  * anything else is UNKNOWN, which may not carry NOT FLAGGED.

For every credited root:
  * NOT FLAGGED requires a PINNED route;
  * CLEARED requires a qualifying replay row (equal EQUAL, disposition CLEARED) or an
    audited root;
  * PENDING and HOLD are always allowed (conservative).

The ledger's own aggregates must agree with the rows: the pending-T371 list, its count,
the unique credited-root count and the credited-pair count.

Exit 0 when every check agrees, 2 when the ledger has a violation, 3 when an input cannot
be read. Nothing is written except the optional --json report.
"""
import argparse
import collections
import json
import os
from pathlib import Path
import sys

FLAGS = ('NOT FLAGGED', 'CLEARED', 'PENDING', 'HOLD')
PINNED_VERSIONS = ('v2e', 'v2f')


def load(path):
    with open(path, encoding='utf-8') as handle:
        return json.load(handle)


def component_pins(route, evidence_dir):
    """Every component pins document the route names, resolved under the evidence dir."""
    out = []
    for root in route.get('roots') or []:
        for component in (root.get('dump') or {}).get('components') or []:
            candidates = []
            if component.get('pins'):
                candidates.append(Path(component['pins']))
            sha = component.get('sha256')
            if sha:
                candidates.append(evidence_dir / 'fanout' / 'handover' / 'ca-component-v1'
                                  / 'component-ca.pkl.pins.json')
            for path in candidates:
                if path.is_file():
                    out.append((component, load(path)))
                    break
    return out


def pin_value(document):
    """The non-empty crawl-pin digest a pins/sidecar document carries, else None."""
    if not isinstance(document, dict):
        return None
    pin = document.get('crawl_pin')
    if isinstance(pin, str):
        return pin or None
    if isinstance(pin, dict):
        value = pin.get('pin_sha256') or pin.get('sha256') or pin.get('pin')
        return value if isinstance(value, str) and value else None
    return None


def classify(piece, evidence_dir):
    """('PINNED'|'UNPINNED'|'UNKNOWN', reason, version_or_None)."""
    route_path = evidence_dir / 'fanout' / piece / 'evidence' / 'absent-root-route.json'
    evidence = evidence_dir / 'fanout' / piece / 'evidence'
    pin_paths = sorted(evidence.glob('*.crawl-pin.json')) if evidence.is_dir() else []
    if route_path.is_file():
        route = load(route_path)
        version = route.get('version') or (route.get('step') or '').rsplit('-', 1)[-1]
        pins = component_pins(route, evidence_dir)
        has_crawl_pin = any(pin_value(pin) for _, pin in pins)
        if version in PINNED_VERSIONS:
            return 'PINNED', f'absent-root route {version}', version
        if has_crawl_pin:
            return 'PINNED', f'absent-root route {version or "?"} with a component crawl_pin', \
                version
        if pins:
            return 'UNPINNED', (f'absent-root route {version or "?"}; component '
                                f'{pins[0][0].get("sha256", "?")[:12]} built_by '
                                f'{pins[0][1].get("built_by", "?")} has no crawl_pin'), version
        return 'UNPINNED', f'absent-root route {version or "?"} with no component crawl_pin', \
            version
    valid, empty = [], []
    for path in pin_paths:
        try:
            value = pin_value(load(path))
        except (OSError, ValueError):
            value = None
        if value:
            valid.append((path.name, value))
        else:
            empty.append(path.name)
    if valid:
        return 'PINNED', f'crawl-pin sidecar ({valid[0][0]}, pin {valid[0][1][:12]})', None
    if empty:
        return 'UNPINNED', f'crawl-pin sidecar with an empty pin ({", ".join(empty[:3])})', None
    return 'UNKNOWN', 'no absent-root route, crawl-pin sidecar or wrapper pin', None


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--intake', type=Path, required=True)
    parser.add_argument('--evidence', type=Path, required=True,
                        help='the c12-dg5 evidence root that holds fanout/')
    parser.add_argument('--json', type=Path)
    args = parser.parse_args()
    intake = load(args.intake)
    walks = intake.get('ca_root_walks')
    if not isinstance(walks, dict):
        print('input is not an intake ledger: ca_root_walks missing', file=sys.stderr)
        return 3
    edition = walks.get('edition11') or {}
    t371 = intake.get('edition11', {}).get('t371') or {}
    walk_credit = intake.get('edition11', {}).get('walk_credit') or {}
    credit = walks.get('identity_credit') or {}

    replay_equal = {row['root'] for row in (t371.get('replay') or {}).get('rows') or []
                    if row.get('equal') == 'EQUAL' and row.get('disposition') == 'CLEARED'}
    audited = set(edition.get('audited_roots_cleared') or [])
    violations, warnings, rows = [], [], []
    credited = []
    pending = []
    verdicts = {}
    qualified_roots = set(replay_equal) | set(audited)
    for piece in walks.get('pieces') or []:
        name = piece.get('piece')
        verdict, reason, version = classify(name, args.evidence)
        if verdict == 'UNKNOWN' and (piece.get('pins') or {}).get('wrapper_sha256'):
            verdict, reason = 'PINNED', 'released closure-resume wrapper (pins.wrapper_sha256)'
        verdicts[name] = (verdict, reason, version)
        for root in piece.get('roots') or []:
            identity = root.get('identity_credit')
            if not isinstance(identity, dict) or not identity.get('credited'):
                continue
            if verdict == 'PINNED':
                qualified_roots.add(root.get('root'))
    for piece in walks.get('pieces') or []:
        name = piece.get('piece')
        verdict, reason, version = verdicts[name]
        route_text = piece.get('edition11_route') or ''
        for root in piece.get('roots') or []:
            identity = root.get('identity_credit')
            if not isinstance(identity, dict):
                continue
            flag = identity.get('t371')
            credited_here = bool(identity.get('credited'))
            if credited_here:
                credited.append((name, root.get('root')))
            if flag is None:
                continue
            if flag not in FLAGS:
                violations.append(dict(kind='unknown-flag', piece=name, root=root.get('root'),
                                       flag=flag))
                continue
            if credited_here and flag == 'NOT FLAGGED' and verdict != 'PINNED':
                violations.append(dict(kind='t371-not-flagged-on-unpinned', piece=name,
                                       root=root.get('root'), route=verdict,
                                       reason=reason))
            if flag == 'CLEARED' and root.get('root') not in qualified_roots:
                violations.append(dict(kind='cleared-without-qualifying-replay', piece=name,
                                       root=root.get('root'),
                                       reason='no credited row of this root has a pinned route, '
                                              'a replay EQUAL-CLEARED row or an audit'))
            if flag == 'PENDING':
                if credited_here:
                    pending.append(root.get('root'))
                else:
                    warnings.append(dict(kind='pending-but-not-credited', piece=name,
                                         root=root.get('root')))
            rows.append(dict(piece=name, root=root.get('root'), flag=flag,
                             credited=credited_here, route=verdict, route_reason=reason,
                             version=version))
        if version and route_text:
            if 'helper C (pinned crawl)' in route_text and version not in PINNED_VERSIONS:
                violations.append(dict(kind='route-mislabeled-pinned', piece=name,
                                       version=version, route_text=route_text))
            elif version not in route_text:
                violations.append(dict(kind='route-does-not-name-walk-version', piece=name,
                                       version=version, route_text=route_text))

    unique_credited = {root for _, root in credited}
    unique_pending = set(pending)
    flagged = (walks.get('edition11') or {}).get('flagged_30')
    if flagged is None:
        flagged = (walks.get('edition11') or {}).get('flagged_27')
    listed_pending = set((flagged or {}).get('pending_t371') or [])
    missing = sorted(unique_pending - listed_pending)
    extra = sorted(listed_pending - unique_pending)
    if missing or extra:
        violations.append(dict(kind='pending-list-mismatch', missing=missing, extra=extra))
    for label, got, want in (
            ('walk_credit.pending_t371', walk_credit.get('pending_t371'), len(unique_pending)),
            ('walk_credit.credited_unique_roots', walk_credit.get('credited_unique_roots'),
             len(unique_credited)),
            ('walk_credit.credited_pairs', walk_credit.get('credited_pairs'), len(credited)),
            ('identity_credit.credited_unique_roots', credit.get('credited_unique_roots'),
             len(unique_credited)),
            ('identity_credit.credited_pairs', credit.get('credited_pairs'), len(credited))):
        if got != want:
            violations.append(dict(kind='aggregate-mismatch', field=label, ledger=got,
                                   derived=want))
    counts = t371.get('counts') or {}
    if counts.get('pending') not in (None, len(unique_pending)):
        violations.append(dict(kind='aggregate-mismatch', field='t371.counts.pending',
                               ledger=counts.get('pending'), derived=len(unique_pending)))

    report = dict(status='violations' if violations else 'ok', intake=str(args.intake),
                  credited_pairs=len(credited), credited_unique_roots=len(unique_credited),
                  pending_t371=len(unique_pending), violations=violations,
                  warnings=warnings, rows=rows)
    if args.json:
        args.json.write_text(json.dumps(report, indent=1) + '\n')
    for item in violations:
        print('VIOLATION ' + json.dumps(item, sort_keys=True))
    for item in warnings:
        print('warning   ' + json.dumps(item, sort_keys=True))
    print(f"{report['status']}: {len(credited)} credited pairs / {len(unique_credited)} unique "
          f"roots, {len(unique_pending)} pending T371, {len(violations)} violations")
    return 2 if violations else 0


if __name__ == '__main__':
    sys.exit(main())
