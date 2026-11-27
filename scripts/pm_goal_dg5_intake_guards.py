#!/usr/bin/env python3
"""Pre-landing intake guards: route/T371, identity dispatch and walk-bound alias checks.

    python3 -B scripts/pm_goal_dg5_intake_guards.py --intake INTAKE.json --evidence DIR \
        --alias-table ALIAS-TABLE.json [--reference reference.json.gz] [--repo TREE] \
        [--baseline PINNED-BASELINE-EDITION.json] [--nonliteral-identity-hold on|off] \
        [--hold-lifted-by "LEAD RULING"] [--json OUT]

Runs the guards that the intake builder must satisfy before a landing can cite walk credit:

  1. `pm_goal_dg5_walk_route_check.py` over the ledger and the evidence tree. It derives each
     piece's route from that piece's own evidence and refuses NOT FLAGGED on an unpinned walk,
     a CLEARED root with no qualifying replay/audit/pin, and every aggregate that disagrees
     with the rows.

  2. an identity dispatch over EVERY credited row, decided by the observed inventory, the
     root's own packet pin and the row's declared comparison evidence -- never by a
     `fix5c`-style flag or a source string:

       * the observed inventory digest is recomputed from the piece's own artifact (clause
         list, or the artifact's own built pin for pin-check artifacts) and must agree with
         the row's declared observed digest and packet pin;
       * observed == packet pin: a literal identity; the edition-11 literal route accepts it;
       * observed != packet pin: a nonliteral identity. It is credited only on its applicable
         proof:
           - the alias table holds an entry for the root: the entry must carry its own
             `packet.rule_inventory.sha256` and it must equal the row's packet pin, and the
             full walk-bound check `pm_goal_dg5_walk_alias_check.py` must pass on the piece's
             artifact, the root's own packet pin and the piece identifier (--walk-id); a
             fragment remapping without a matching walk-bound entry fails;
           - no entry: the historical replay route. The ledger's archive-provenance replay
             must hold an EQUAL row with disposition CLEARED for the root, the ledger must pin
             BOTH the deliverable's folder manifest and its provenance manifest (a missing pin
             refuses, naming it), AND the pinned
             replay deliverable that row was taken from must bind the proof to THIS walk: its
             row for the root must name this piece among the walks that produced the row, must
             agree with the ledger's copy, and one of that row's published observations must be
             this piece's own artifact and must pin the credited observed inventory digest. A
             replay row is never proof for another walk's observation of the same root;
           - neither: refusal. Missing proof never passes, whatever the row's flags or
             source prose say.

  3. the `nonliteral_identity_hold` switch (default ON, lead ruling pm-ea-lead 1126031138-2c38):
     a NEW nonliteral identity credit -- one whose applicable proof passed, alias or replay alike
     -- is recorded as HOLD with a named reason instead of being credited, until a lead ruling
     lifts it. "New" is measured against `--baseline`, which must be the pinned baseline
     edition in PINNED_BASELINES (INTAKE-r11-corr3.json), identified by the file's sha256 -- never a ledger the caller
     picks (a baseline whose digest is not pinned, the candidate itself included, exits 3).
     Its nonliteral credits are keyed by evidence (piece, root, declared observed digest,
     declared packet pin) and never by a flag; with no baseline nothing is grandfathered and
     every nonliteral credit is held. A literal credit always flows. A credit whose proof FAILED is
     refused by guard 2 and never reaches the hold. Lifting the switch requires
     `--nonliteral-identity-hold off --hold-lifted-by "<ruling>"`, and the ruling reference is
     recorded in the report.

Exit 0 when every guard passes and nothing is held, 2 when any guard refuses or a new nonliteral
credit is held, 3 when an input cannot be read, the --baseline is not a pinned baseline edition,
or the hold is lifted without a ruling reference.
Nothing is written but the optional --json report and a temporary directory.
"""
import argparse
import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path, PurePath

HERE = Path(__file__).resolve().parent


def load(path):
    with open(path, encoding='utf-8') as handle:
        return json.load(handle)


def run(argv):
    done = subprocess.run(argv, capture_output=True, text=True)
    return done.returncode, (done.stdout + done.stderr).strip()


def digest(ids):
    return hashlib.sha256('\n'.join(sorted(ids)).encode()).hexdigest()


def artifact_root_entry(document, root_id):
    roots = (document or {}).get('roots')
    if isinstance(roots, dict):
        return roots.get(root_id)
    if isinstance(roots, list):
        for row in roots:
            if isinstance(row, dict) and row.get('root') == root_id:
                return row
    return None


def clause_ids(entry):
    """The clause-id list an artifact root entry carries (list or dict keyed by id)."""
    for key in ('clauses', 'clause_ids'):
        value = entry.get(key)
        if isinstance(value, dict):
            return list(value)
        if isinstance(value, list) and value and all(isinstance(x, str) for x in value):
            return value
    return None


def observed_inventory(document, root_id):
    """(observed_sha256|None, artifact_packet_sha256|None, problem|None) from the artifact."""
    entry = artifact_root_entry(document, root_id)
    if not isinstance(entry, dict):
        return None, None, 'the artifact holds no entry for this root'
    ids = clause_ids(entry)
    if ids is not None:
        return digest(ids), None, None
    built = entry.get('built')
    if isinstance(built, dict) and built.get('sha256'):
        packet = entry.get('packet')
        return built['sha256'], (packet or {}).get('sha256'), None
    return None, None, 'the artifact entry carries no clause inventory and no built pin'


def file_sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def manifest_digest(manifest, name):
    """The sha256 a `sha256sum`-style manifest lists for `name`, or None."""
    try:
        text = Path(manifest).read_text(encoding='utf-8')
    except OSError:
        return None
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        parts = line.split(None, 1)
        if len(parts) == 2 and parts[1].lstrip('*').strip() == name:
            return parts[0]
    return None


# The two ledger digests a replay credit rests on: (file in the deliverable, ledger key, name).
REPLAY_PINS = (('SHA256SUMS', 'sha256', 'replay manifest digest'),
               ('SHA256SUMS-provenance', 'provenance_sha256', 'provenance manifest digest'))


def replay_deliverable(replay, evidence_dir):
    """(rows_by_root|None, problem|None) from the pinned replay deliverable behind the ledger.

    `edition11.t371.replay` names the deliverable's folder (`path`) and pins that folder's
    manifest (`sha256`) and provenance manifest (`provenance_sha256`). The folder is resolved
    under the evidence root, both manifests are checked against those pins, and `REPLAY.json`
    is read only when the folder manifest lists it with the digest the file actually has.
    """
    rel = (replay or {}).get('path')
    if not rel:
        return None, 'the ledger pins no replay deliverable path'
    missing = [f'{label} (edition11.t371.replay.{key} for {name})'
               for name, key, label in REPLAY_PINS if not (replay or {}).get(key)]
    if missing:
        return None, ('the ledger pins no ' + ' and no '.join(missing)
                      + ': both are required before any replay credit')
    folder = next((c for c in (evidence_dir / PurePath(str(rel)).name, evidence_dir / str(rel))
                   if c.is_dir()), None)
    if folder is None:
        return None, f'the replay deliverable {rel} is not under the evidence root'
    for name, key, _label in REPLAY_PINS:
        pinned = replay[key]
        try:
            got = file_sha256(folder / name)
        except OSError:
            return None, f'{name} is unreadable in the replay deliverable'
        if got != pinned:
            return None, (f'the replay deliverable {name} differs from the ledger pin '
                          f'({got[:12]} != {pinned[:12]})')
    document = folder / 'REPLAY.json'
    want = manifest_digest(folder / 'SHA256SUMS', document.name)
    if not want:
        return None, f'the replay deliverable manifest does not pin {document.name}'
    try:
        got = file_sha256(document)
        rows = json.loads(document.read_text(encoding='utf-8')).get('rows')
    except (OSError, ValueError):
        return None, f'{document.name} is unreadable in the replay deliverable'
    if got != want:
        return None, f'{document.name} differs from its manifest pin ({got[:12]} != {want[:12]})'
    return {row.get('root'): row for row in rows or [] if isinstance(row, dict)}, None


def replay_covers_walk(row, piece, observed):
    """(bound, detail, problem): is this replay row proof for THIS walk's own inventory?

    Two bindings, both required: the row must name the credited piece among the walks that
    produced it, and one of the row's published observations must be that piece's own artifact
    and must pin the credited observed inventory digest.
    """
    pieces = [p for p in row.get('pieces') or [] if isinstance(p, str)]
    published = [p for p in row.get('published') or [] if isinstance(p, dict)]
    detail = dict(replay_pieces=pieces,
                  replay_published_pins=[(p.get('pin') or {}).get('sha256') for p in published])
    if piece not in pieces:
        return False, detail, ('the replay row for this root was produced by '
                               f'{", ".join(pieces) or "no named walk"}, not by this piece: a '
                               'replay row keyed by the root alone is not proof for another '
                               "walk's observation of it")
    for entry in published:
        if (entry.get('pin') or {}).get('sha256') != observed:
            continue
        path = entry.get('path')
        if path and piece not in PurePath(str(path)).parts:
            continue
        return True, detail, None
    return False, detail, ('the replay row for this root pins no published observation of this '
                           'piece with the credited observed inventory digest')


HOLD_REASON = 'nonliteral identity credit held pending lead ruling'

# The only ledger --baseline may name, by the file's sha256 (lead rulings pm-ea-lead 1126203512:
# "--baseline must be the pinned ledger edition (by digest), never caller-chosen", and 1126205025:
# "corr3 be092418 as the only pinned baseline"). Adding an edition is a code change, never a
# command-line choice.
PINNED_BASELINES = {
    'be092418db8f3ee64948814e54ba319b2743e5e811094b1e4d1e097491368fd5':
        'INTAKE-r11-corr3.json (the corrected ledger this merge lands; 6 nonliteral credits)',
}


def baseline_nonliteral(path):
    """(keys|None, problem|None): the nonliteral credits already established in a ledger.

    A key is `(piece, root, declared observed digest, declared packet pin)` -- evidence the
    baseline ledger itself records, never a flag. Only credited rows whose two digests differ
    are nonliteral, so the literal majority of a ledger is not part of the baseline at all.
    """
    try:
        raw = Path(path).read_bytes()
    except OSError as exc:
        return None, f'the baseline ledger cannot be read ({exc})'
    got = hashlib.sha256(raw).hexdigest()
    if got not in PINNED_BASELINES:
        return None, (f'--baseline {path} (sha256 {got}) is not a pinned baseline edition; '
                      'the baseline must be one of: '
                      + '; '.join(f'{name} sha256 {pin}' for pin, name in PINNED_BASELINES.items()))
    try:
        ledger = json.loads(raw.decode('utf-8'))
    except ValueError as exc:
        return None, f'the baseline ledger cannot be read ({exc})'
    walks = ledger.get('ca_root_walks')
    if not isinstance(walks, dict):
        return None, 'the baseline is not an intake ledger: ca_root_walks missing'
    keys = set()
    for piece in walks.get('pieces') or []:
        name = piece.get('piece')
        for row in piece.get('roots') or []:
            credit = row.get('identity_credit')
            if not isinstance(credit, dict) or not credit.get('credited'):
                continue
            observed = (row.get('observed') or {}).get('sha256')
            packet_pin = (row.get('packet') or {}).get('sha256')
            if observed and packet_pin and observed != packet_pin:
                keys.add((name, row.get('root'), observed, packet_pin))
    return keys, None


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--intake', type=Path, required=True)
    parser.add_argument('--evidence', type=Path, required=True)
    parser.add_argument('--alias-table', type=Path, required=True)
    parser.add_argument('--reference', type=Path)
    parser.add_argument('--repo', type=Path, default=Path('.'))
    parser.add_argument('--baseline', type=Path,
                        help='a pinned baseline edition (PINNED_BASELINES, by sha256) whose '
                             'nonliteral credits are already established; any other file exits 3; '
                             'without it the hold grandfathers nothing')
    parser.add_argument('--nonliteral-identity-hold', dest='hold', choices=('on', 'off'),
                        default='on', help='HOLD every new nonliteral identity credit (default on)')
    parser.add_argument('--hold-lifted-by',
                        help='the lead ruling that lifts the hold; required with '
                             '--nonliteral-identity-hold off')
    parser.add_argument('--json', type=Path)
    args = parser.parse_args()
    ruling = (args.hold_lifted_by or '').strip()
    if args.hold == 'off' and not ruling:
        print('the nonliteral identity hold can only be lifted by an explicit lead ruling: '
              'pass --hold-lifted-by "<ruling>" with --nonliteral-identity-hold off',
              file=sys.stderr)
        return 3
    if args.hold == 'on' and args.hold_lifted_by is not None:
        print('--hold-lifted-by only applies with --nonliteral-identity-hold off',
              file=sys.stderr)
        return 3
    ledger = load(args.intake)
    table = load(args.alias_table)
    walks = ledger.get('ca_root_walks')
    if not isinstance(walks, dict):
        print('input is not an intake ledger: ca_root_walks missing', file=sys.stderr)
        return 3
    reference = args.reference or Path((table.get('inputs') or {}).get('reference', {}).get('path', ''))
    if not reference or not Path(reference).is_file():
        print('no reference capture: pass --reference', file=sys.stderr)
        return 3
    work = Path(tempfile.mkdtemp(prefix='dg5-intake-guards-'))
    results, failures = {}, []
    route_json = work / 'route.json'
    code, text = run([sys.executable, '-B', str(HERE / 'pm_goal_dg5_walk_route_check.py'),
                      '--intake', str(args.intake), '--evidence', str(args.evidence),
                      '--json', str(route_json)])
    results['route'] = dict(exit=code, output=text.splitlines()[-3:])
    if code != 0:
        failures.append(dict(guard='walk_route_check', exit=code, output=text.splitlines()[:8]))

    entries = {row.get('root'): row for row in table.get('roots') or []}
    replay = (ledger.get('edition11', {}).get('t371') or {}).get('replay') or {}
    replay_cleared = {row.get('root'): row for row in replay.get('rows') or []
                      if isinstance(row, dict) and row.get('equal') == 'EQUAL'
                      and row.get('disposition') == 'CLEARED'}
    deliverable = {}

    def replay_rows():
        """The pinned replay deliverable's rows, resolved and digest-checked once."""
        if 'rows' not in deliverable:
            deliverable['rows'] = replay_deliverable(replay, args.evidence)
        return deliverable['rows']

    hold_on = args.hold == 'on'
    baseline_keys = set()
    baseline_count = None
    baseline_sha = None
    if hold_on:
        if args.baseline:
            baseline_keys, problem = baseline_nonliteral(args.baseline)
            if problem:
                print(f'FATAL {problem}', file=sys.stderr)
                if args.json:
                    args.json.write_text(json.dumps(dict(
                        status='refused', intake=str(args.intake),
                        baseline=str(args.baseline), failures=[dict(
                            guard='nonliteral_identity_hold', error=problem)]),
                        indent=1) + '\n')
                return 3
            baseline_sha = file_sha256(args.baseline)
        baseline_count = len(baseline_keys)
    hold = dict(state='on' if hold_on else 'lifted', reason=HOLD_REASON,
                switch='--nonliteral-identity-hold',
                lifted_by=None if hold_on else ruling,
                baseline=str(args.baseline) if args.baseline else None,
                baseline_sha256=baseline_sha,
                baseline_edition=PINNED_BASELINES.get(baseline_sha),
                baseline_nonliteral_credits=baseline_count)
    held = []
    dispatch = dict(literal=0, alias_checked=0, replay=0)
    artifacts = {}
    for piece in walks.get('pieces') or []:
        name = piece.get('piece')
        artifact_rel = (piece.get('artifact') or {}).get('path')
        for root in piece.get('roots') or []:
            credit = root.get('identity_credit')
            if not isinstance(credit, dict) or not credit.get('credited'):
                continue
            root_id = root.get('root')

            def refuse(error, **extra):
                failures.append(dict(guard='identity_dispatch', piece=name, root=root_id,
                                     error=error, **extra))

            def credit_nonliteral(route_key):
                """Credit a proven nonliteral identity, or HOLD it when it is new.

                Only reached once the row's applicable proof passed. `route_key` is the dispatch
                counter the credit would have gone to ('alias_checked' or 'replay').
                """
                if hold_on and (name, root_id, observed, packet_pin) not in baseline_keys:
                    held.append(dict(guard='nonliteral_identity_hold', piece=name, root=root_id,
                                     route=route_key, reason=HOLD_REASON,
                                     observed=observed[:12], packet_pin=packet_pin[:12]))
                    return
                dispatch[route_key] += 1

            packet_pin = (root.get('packet') or {}).get('sha256')
            if not packet_pin:
                refuse('credited identity records no packet pin of its own')
                continue
            if not artifact_rel:
                refuse('piece names no artifact to observe the inventory on')
                continue
            if artifact_rel not in artifacts:
                try:
                    artifacts[artifact_rel] = load(args.evidence / 'fanout' / artifact_rel)
                except (OSError, ValueError):
                    artifacts[artifact_rel] = None
            observed, artifact_packet, problem = observed_inventory(artifacts[artifact_rel],
                                                                    root_id)
            if observed is None:
                refuse(f'no observed inventory to dispatch on: {problem}')
                continue
            declared_observed = (root.get('observed') or {}).get('sha256')
            if artifact_packet and artifact_packet != packet_pin:
                refuse('the artifact packet pin differs from the row packet pin',
                       artifact=artifact_packet[:12], row=packet_pin[:12])
                continue
            if declared_observed and declared_observed != observed:
                refuse('the ledger observed digest differs from the artifact inventory',
                       ledger=declared_observed[:12], artifact=observed[:12])
                continue
            declared = root.get('identity')
            if isinstance(declared, dict):
                if declared.get('literal_pin') and declared['literal_pin'] != observed:
                    refuse('the declared comparison evidence names a literal pin that is not '
                           'the observed inventory', declared=declared['literal_pin'][:12],
                           observed=observed[:12])
                    continue
                if declared.get('packet_pin') and declared['packet_pin'] != packet_pin:
                    refuse('the declared comparison evidence names a packet pin that is not '
                           'the row packet pin', declared=declared['packet_pin'][:12],
                           row=packet_pin[:12])
                    continue
            if observed == packet_pin:
                dispatch['literal'] += 1
                continue

            entry = entries.get(root_id)
            if entry is not None:
                table_pin = ((entry.get('packet') or {}).get('rule_inventory') or {}).get('sha256')
                if not table_pin:
                    refuse('alias-table entry has no rule-inventory pin')
                    continue
                if table_pin != packet_pin:
                    refuse('the alias-table rule-inventory pin differs from the row packet pin',
                           table=table_pin[:12], row=packet_pin[:12])
                    continue
                alias_json = work / (root_id.replace(':', '_') + '.json')
                code, text = run([sys.executable, '-B',
                                  str(HERE / 'pm_goal_dg5_walk_alias_check.py'),
                                  '--walk', str(args.evidence / 'fanout' / artifact_rel),
                                  '--root', root_id, '--packet-pin', packet_pin,
                                  '--reference', str(reference),
                                  '--alias-table', str(args.alias_table),
                                  '--repo', str(args.repo), '--walk-id', str(name),
                                  '--json', str(alias_json)])
                results.setdefault('alias', []).append(
                    dict(root=root_id, piece=name, exit=code,
                         walk=str(args.evidence / 'fanout' / artifact_rel)))
                if code != 0:
                    failures.append(dict(guard='walk_alias_check', piece=name, root=root_id,
                                         exit=code, output=text.splitlines()[:8]))
                else:
                    credit_nonliteral('alias_checked')
                continue
            if root_id in replay_cleared:
                rows_by_root, problem = replay_rows()
                if problem:
                    refuse(f'the replay proof cannot be read: {problem}',
                           observed=observed[:12], packet_pin=packet_pin[:12])
                    continue
                replay_row = rows_by_root.get(root_id)
                if not isinstance(replay_row, dict):
                    refuse('the pinned replay deliverable holds no row for this root',
                           observed=observed[:12], packet_pin=packet_pin[:12])
                    continue
                ledger_equal = replay_cleared[root_id].get('equal')
                if ledger_equal and replay_row.get('equal') != ledger_equal:
                    refuse('the pinned replay deliverable disagrees with the ledger replay row',
                           deliverable=str(replay_row.get('equal')), ledger=ledger_equal)
                    continue
                bound, detail, why = replay_covers_walk(replay_row, name, observed)
                if not bound:
                    refuse(why, observed=observed[:12], packet_pin=packet_pin[:12], **detail)
                    continue
                credit_nonliteral('replay')
                continue
            refuse('credited nonliteral identity without applicable proof: no walk-bound '
                   'alias-table entry and no EQUAL/CLEARED archive-provenance replay row'
                   + ('; the row declares a fragment-remapping comparison'
                      if isinstance(declared, dict) else ''),
                   observed=observed[:12], packet_pin=packet_pin[:12])

    results['identity_dispatch'] = dispatch
    hold['held_count'] = len(held)
    status = 'refused' if failures else ('held' if held else 'pass')
    report = dict(status=status, intake=str(args.intake),
                  evidence=str(args.evidence), alias_table=str(args.alias_table),
                  nonliteral_identity_hold=hold,
                  identity_dispatch=dispatch, results=results, failures=failures, held=held)
    if args.json:
        args.json.write_text(json.dumps(report, indent=1) + '\n')
    for failure in failures:
        print('REFUSED ' + json.dumps(failure, sort_keys=True)[:600])
    for held_credit in held:
        print('HELD ' + json.dumps(held_credit, sort_keys=True)[:600])
    summary = (f"{status}: route guard {results['route']['exit']}, "
               f"{dispatch['literal']} literal / {dispatch['alias_checked']} alias-checked / "
               f"{dispatch['replay']} replay credited identities, {len(failures)} refusal(s)")
    if held:
        summary += f", {len(held)} held nonliteral credit(s) pending lead ruling"
    print(summary)
    return 2 if (failures or held) else 0


if __name__ == '__main__':
    sys.exit(main())
