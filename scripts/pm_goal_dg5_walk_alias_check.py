#!/usr/bin/env python3
"""Walk-bound alias check for a C12 walk identity credit (DG5, Astra H2).

    python3 -B walk_alias_check.py --walk CLOSURE.json --root dg5:... --packet-pin SHA256
        --reference reference.json.gz --alias-table ALIAS-TABLE.json [--repo DIR]
        [--weak] [--json OUT]

Two stages, deliberately separated:

  fragment pairing (the edition-11 rule, `--weak` stops here): pair each observed URI base to a
  reference-capture base whose fragment multiset is equal and unique, require a bijection, and
  require the mapped clause-id set to hash to the packet pin. This stage alone proves only that
  a renaming exists; it is not walk-bound evidence and must not be used to grant identity.

  walk-bound gate (default): the alias table must hold an entry for the root whose
  `map.registry_sha256_recorded` equals its `map.registry_sha256_recomputed` and the packet's
  registry digest; every observed base that differs from its mapped reference base must have a
  row whose `equal` is true and whose `walk_raw_sha256` equals `canonical_pinned_sha256` (the
  document bytes the walk's own registry item carries), covering at least the observed ids; and
  each row's canonical bytes must equal `git show <row pin>:<path>` when --repo is given.
  A root with no alias-table entry refuses: absence of a walk-bound registration is not
  evidence of equality. The entry is bound by record AND walk: its native `record` field
  must equal the piece identifier supplied with `--walk-id` (an entry that names a record
  refuses when no piece identifier was supplied), and every `walk_sha256`, `walk_root` or
  `walk_id` it carries must name this walk. An entry that names no record refuses unless one
  of those three fields binds it: without one, nothing but the root id ties the entry to a
  walk, and a root id is shared by every walk that observed it.

Exit 0 pass, 2 refused, 3 unreadable input.
"""
import argparse
import collections
import gzip
import hashlib
import json
from pathlib import Path
import subprocess
import sys


def load(path):
    if str(path).endswith('.gz'):
        with gzip.open(path, 'rt', encoding='utf-8') as handle:
            return json.load(handle)
    with open(path, encoding='utf-8') as handle:
        return json.load(handle)


def base(clause):
    return clause.split('#', 1)[0]


def fragment(clause):
    return clause.split('#', 1)[1] if '#' in clause else ''


def digest(ids):
    return hashlib.sha256('\n'.join(sorted(ids)).encode()).hexdigest()


def pair_bases(observed, reference):
    """One-to-one observed-base -> reference-base pairing by equal, unique fragment multiset."""
    obs = collections.defaultdict(collections.Counter)
    ref = collections.defaultdict(collections.Counter)
    for clause in observed:
        obs[base(clause)][fragment(clause)] += 1
    for clause in reference:
        ref[base(clause)][fragment(clause)] += 1
    unmatched, candidates = [], []
    for name, fragments in obs.items():
        matches = [other for other, other_fragments in ref.items() if other_fragments == fragments]
        if len(matches) == 1:
            candidates.append(dict(observed=name, reference=matches[0], ids=sum(fragments.values())))
        else:
            unmatched.append(dict(base=name, ids=sum(fragments.values()),
                                  candidates=[m for m in matches]))
    targets = collections.Counter(row['reference'] for row in candidates)
    non_bijective = [row for row in candidates if targets[row['reference']] != 1]
    return candidates, unmatched, non_bijective


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--walk', type=Path, required=True)
    parser.add_argument('--root', required=True)
    parser.add_argument('--packet-pin', required=True)
    parser.add_argument('--reference', type=Path, required=True)
    parser.add_argument('--alias-table', type=Path, required=True)
    parser.add_argument('--repo', type=Path)
    parser.add_argument('--walk-id', help='the walk identifier the alias-table entry must name')
    parser.add_argument('--weak', action='store_true',
                        help='stop after fragment pairing (the edition-11 rule)')
    parser.add_argument('--json', type=Path)
    args = parser.parse_args()

    walk = load(args.walk)
    root_entry = (walk.get('roots') or {}).get(args.root)
    if not isinstance(root_entry, dict) or not root_entry.get('clauses'):
        print(f'{args.root}: no clause map in the walk report', file=sys.stderr)
        return 3
    observed = list(root_entry['clauses'])
    reference_capture = load(args.reference)
    variants = (reference_capture.get('roots') or {}).get(args.root)
    if not isinstance(variants, dict):
        print(f'{args.root}: no reference variants', file=sys.stderr)
        return 3
    reference = None
    for variant in variants.values():
        ids = variant.get('clause_ids') or []
        if digest(ids) == args.packet_pin:
            reference = ids
            break
    if reference is None:
        print(f'{args.root}: no reference variant hashes to the packet pin', file=sys.stderr)
        return 3

    candidates, unmatched, non_bijective = pair_bases(observed, reference)
    mapping = {row['observed']: row['reference'] for row in candidates}
    mapped = {mapping.get(base(clause), base(clause)) + '#' + fragment(clause)
              for clause in observed}
    pair = dict(observed_ids=len(observed), mapped_ids=len(mapped),
                literal_pin=digest(observed), mapped_pin=digest(mapped),
                packet_pin=args.packet_pin, bases=len({base(c) for c in observed}),
                unmatched=unmatched, non_bijective=non_bijective,
                aliased=[row for row in candidates if row['observed'] != row['reference']])
    pair['pin_equal'] = pair['mapped_pin'] == args.packet_pin
    pair['bijective'] = not unmatched and not non_bijective and len(mapping) == len(
        {base(c) for c in observed})
    if not (pair['pin_equal'] and pair['bijective']):
        report = dict(status='refused', stage='fragment-pairing', root=args.root, pair=pair)
        if args.json:
            args.json.write_text(json.dumps(report, indent=1) + '\n')
        print('REFUSED fragment pairing: ' + json.dumps(pair, sort_keys=True)[:1500])
        return 2
    if args.weak:
        report = dict(status='pass', stage='fragment-pairing-only (weak)', root=args.root,
                      pair=pair)
        if args.json:
            args.json.write_text(json.dumps(report, indent=1) + '\n')
        print(f"pass (weak): {pair['mapped_ids']} ids, mapped pin {pair['mapped_pin'][:12]}")
        return 0

    table = load(args.alias_table)
    walk_digest = hashlib.sha256(args.walk.read_bytes()).hexdigest()
    entry = next((row for row in table.get('roots') or [] if row.get('root') == args.root), None)
    reasons = []
    tied_by = []
    if entry is None:
        reasons.append('the alias table holds no walk-bound entry for this root')
    else:
        if entry.get('root') == args.root:
            tied_by.append('root')
        record = entry.get('record')
        if record:
            if args.walk_id is None:
                reasons.append(f'the alias-table entry names record {record} but no piece '
                               'identifier was supplied (--walk-id)')
            elif record != args.walk_id:
                reasons.append(f'the alias-table entry names another piece (record {record} '
                               f'!= {args.walk_id})')
            else:
                tied_by.append('record')
        for field in ('walk_sha256',):
            value = entry.get(field)
            if value:
                if value != walk_digest:
                    reasons.append(f'the alias-table entry names another walk ({field} '
                                   f'{value[:12]} != {walk_digest[:12]})')
                else:
                    tied_by.append(field)
        for field in ('walk_root', 'walk_id'):
            value = entry.get(field)
            if not value:
                continue
            expected = args.root if field == 'walk_root' else args.walk_id
            if expected is None:
                reasons.append(f'the alias-table entry names a {field} but none was supplied')
            elif value != expected:
                reasons.append(f'the alias-table entry names another walk ({field} {value} != '
                               f'{expected})')
            else:
                tied_by.append(field)
        if not tied_by:
            reasons.append('the alias-table entry does not name this walk by root id or digest')
        if not record and not [f for f in ('walk_sha256', 'walk_root', 'walk_id')
                               if f in tied_by]:
            supplied = f'the supplied piece identifier ({args.walk_id})' if args.walk_id \
                else 'no piece identifier'
            reasons.append('the alias-table entry names no record and no walk digest or walk '
                           f'id: {supplied} is tied to it by the root alone')
        entry = dict(entry)
        registry = (entry.get('map') or {})
        recorded = registry.get('registry_sha256_recorded')
        recomputed = registry.get('registry_sha256_recomputed')
        packet_registry = (entry.get('packet') or {}).get('registry')
        if not recorded:
            reasons.append('the walk-bound entry records no registry_sha256')
        if recorded and recomputed and recorded != recomputed:
            reasons.append('recorded and recomputed registry digests differ')
        if packet_registry and recorded and packet_registry != recorded:
            reasons.append('the walk registry digest differs from the packet registry digest')
        rows = {row.get('alias_uri'): row for row in entry.get('rows') or []}
        for row in pair['aliased']:
            alias = rows.get(row['observed'])
            if alias is None:
                reasons.append(f'{row["ids"]} ids on {row["observed"]}: no alias-table row')
                continue
            if not alias.get('equal'):
                reasons.append(f'{row["observed"]}: alias row not equal')
            if alias.get('walk_raw_sha256') != alias.get('canonical_pinned_sha256'):
                reasons.append(f'{row["observed"]}: bound bytes differ from the canonical bytes')
            if (alias.get('inventory_ids_covered') or 0) < row['ids']:
                reasons.append(f'{row["observed"]}: alias row covers '
                               f'{alias.get("inventory_ids_covered")} of {row["ids"]} ids')
            if args.repo and alias.get('canonical_pinned_path') and \
                    alias.get('canonical_pinned_commit'):
                try:
                    raw = subprocess.check_output(
                        ['git', '-C', str(args.repo), 'show',
                         f"{alias['canonical_pinned_commit']}:{alias['canonical_pinned_path']}"],
                        stderr=subprocess.DEVNULL)
                except subprocess.CalledProcessError:
                    reasons.append(f'{row["observed"]}: canonical commit:path is unreadable')
                else:
                    if hashlib.sha256(raw).hexdigest() != alias.get('canonical_pinned_sha256'):
                        reasons.append(f'{row["observed"]}: pinned bytes do not match the row')
    unbound = list(pair['aliased'])
    report = dict(status='refused' if reasons else 'pass', stage='walk-bound', root=args.root,
                  walk=dict(path=str(args.walk), sha256=walk_digest), tied_by=tied_by,
                  pair=pair, alias_rows=len((entry or {}).get('rows') or []),
                  aliased_bases=len(unbound), reasons=reasons)
    if args.json:
        args.json.write_text(json.dumps(report, indent=1) + '\n')
    for reason in reasons:
        print('REFUSED ' + reason)
    print(f"{report['status']}: {pair['mapped_ids']} ids, {len(pair['aliased'])} aliased bases, "
          f"{len(reasons)} walk-bound failures")
    return 2 if reasons else 0


if __name__ == '__main__':
    sys.exit(main())
