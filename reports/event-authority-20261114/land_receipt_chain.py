#!/usr/bin/env python3
"""S1 landing writer for the frozen check's receipt chain: DL-412, then the fourth (DL-451), then the fifth (E9-1).

It fills only lander fields and the two prior-receipt pins, in chain order, and keeps every validator pin:
DL-412 stays at 319f6bff..., the fourth receipt at 3e98a165..., and the fifth receipt names the bytes that run.
It never writes Plans/Spec_Lock.json and never seals: it prints the three anchor entries P adds.
It replaces write_multifamily_receipt.py and write_recount_receipt.py at this landing. Both reset their
receipt's validator_after_sha256 to the live validator hash, which breaks the chain (PNC019-SCOPE finding 6).

  write:  python3 -I land_receipt_chain.py <landing-tree> --lander <actual-lander-task>
  verify: python3 -I land_receipt_chain.py <landing-tree> --verify   (after P's anchors are in Spec Lock)
"""
import argparse
import hashlib
import json
from pathlib import Path
import sys
import types

VALIDATOR = 'Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py'
DL077_AFTER = '190a86f23e06362bdb98e27eb23268c9691db46cc41bc9f97e1fbb6bde1abc20'
DL412_AFTER = '319f6bffddb07a36e633fd949146e4ce9149819ea5e817b13897a74314163a91'
FOURTH_AFTER = '3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72'


def load_validator(root):
    """The validator compiled from the exact bytes hashed here; no .pyc is read or written."""
    path = root / VALIDATOR
    raw = path.read_bytes()
    module = types.ModuleType('chain_validator')
    module.__file__ = str(path)
    sys.modules['chain_validator'] = module
    exec(compile(raw, str(path), 'exec', dont_inherit=True), module.__dict__)
    return module, hashlib.sha256(raw).hexdigest()


def read(path):
    """A receipt, strictly parsed, with the exact serialization that reproduces its bytes."""
    raw = path.read_bytes()
    value = json.loads(raw.decode('utf-8'), object_pairs_hook=strict_pairs)
    for indent in (1, 2):
        for ascii_only in (True, False):
            if (json.dumps(value, indent=indent, ensure_ascii=ascii_only) + '\n').encode('utf-8') == raw:
                return value, (indent, ascii_only)
    raise ValueError(str(path) + ': bytes are not a plain json.dumps serialization; refusing to rewrite them')


def strict_pairs(items):
    result = {}
    for key, value in items:
        if key in result:
            raise ValueError('duplicate receipt JSON key: ' + key)
        result[key] = value
    return result


def write(path, value, style):
    path.write_text(json.dumps(value, indent=style[0], ensure_ascii=style[1]) + '\n', encoding='utf-8')


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def fill(root, lander):
    if type(lander) is not str or not lander.strip():
        raise ValueError('the actual lander task is required')
    v, live = load_validator(root)
    paths = [root / v.MULTI_FAMILY_RECEIPT, root / v.RECOUNT_CHANGE, root / v.DL_PATTERN_CHANGE]
    (third, s3), (fourth, s4), (fifth, s5) = (read(p) for p in paths)
    dl077 = v.load_json(root / v.POST_AUGUST_RECEIPT)
    # The chain this landing must carry; anything else is a wrong tree or a re-stamped receipt.
    checks = [
        (dl077.get('validator_after_sha256') == DL077_AFTER, 'DL-077 receipt after-hash moved'),
        (third.get('validator_before_sha256') == DL077_AFTER, 'DL-412 before-hash is not DL-077 after-hash'),
        (third.get('validator_after_sha256') == DL412_AFTER, 'DL-412 after-hash is not 319f6bff...: re-stamped?'),
        (fourth.get('validator_before_sha256') == DL412_AFTER, 'fourth before-hash is not 319f6bff...'),
        (fourth.get('validator_after_sha256') == FOURTH_AFTER, 'fourth after-hash is not 3e98a165...: re-stamped?'),
        (fifth.get('validator_before_sha256') == FOURTH_AFTER, 'fifth before-hash is not 3e98a165...'),
        (fifth.get('validator_after_sha256') == live, 'fifth after-hash is not the validator bytes on this tree'),
        (third.get('author_task') == v.MULTI_FAMILY_AUTHOR, 'wrong DL-412 author'),
        (fourth.get('author_task') == v.RECOUNT_AUTHOR, 'wrong fourth-change author'),
        (fifth.get('author_task') == v.DL_PATTERN_AUTHOR, 'wrong fifth-change author'),
        (lander not in (v.MULTI_FAMILY_AUTHOR, v.RECOUNT_AUTHOR, v.DL_PATTERN_AUTHOR), 'the lander cannot be an author'),
    ]
    for name, receipt, required in [('DL-412', third, v.MULTI_FAMILY_REQUIRED), ('DL-451', fourth, ())]:
        section = v.decision_section_bytes(root / 'Plans/Decision_Log.md', name, required)
        checks.append((receipt.get('authority_section_sha256') == hashlib.sha256(section).hexdigest(),
                       name + ' section changed since its receipt: re-adjudicate before landing'))
    failed = [message for ok, message in checks if not ok]
    if failed:
        raise ValueError('; '.join(failed))
    for receipt, author in [(third, v.MULTI_FAMILY_AUTHOR), (fourth, v.RECOUNT_AUTHOR), (fifth, v.DL_PATTERN_AUTHOR)]:
        receipt['lander_task'] = lander
        receipt['seal_applier_forbidden_tasks'] = sorted({author, lander})
    write(paths[0], third, s3)
    fourth['prior_receipt']['sha256'] = sha(paths[0])
    write(paths[1], fourth, s4)
    fifth['prior_receipt']['sha256'] = sha(paths[1])
    write(paths[2], fifth, s5)
    if sha(root / VALIDATOR) != live:
        raise ValueError('validator bytes changed while the receipts were written')
    anchors = [{'path': p.relative_to(root).as_posix(), 'sha256': sha(p)} for p in paths]
    print(json.dumps({'lander_task': lander, 'validator_sha256': live, 'seal_authorized': False,
                      'spec_lock_entries_for_P': anchors,
                      'then': 'the DL-300 step records pin the DL-412 receipt: run python3 scripts/pm-s2-dl300-step-records.py --repin '
                              'wherever those records are on the tree (s2), and commit them with this landing or with s2'}, indent=2))


def verify(root):
    """Every receipt state on this tree, as the validator itself judges them; Spec Lock must already anchor all three."""
    v, live = load_validator(root)
    states = {
        'fifth_link_pin': v.fourth_change_validator_pin(),
        'fourth_link_pin': v.third_change_validator_pin(),
        'third_link_pin': v.post_august_validator_pin(),
        'dl077_receipt_sha256': v.post_august_receipt_state()[1],
        'dl412_receipt_sha256': v.multi_family_receipt_state()[1],
        'fourth_receipt_sha256': v.recount_change_state()[1],
        'fifth_receipt_sha256': v.dl_pattern_change_state()[1],
    }
    expected = {'fifth_link_pin': FOURTH_AFTER, 'fourth_link_pin': DL412_AFTER, 'third_link_pin': DL077_AFTER}
    wrong = {k: states[k] for k in expected if states[k] != expected[k]}
    if wrong:
        raise ValueError('byte chain broken: ' + json.dumps(wrong))
    print(json.dumps({'validator_sha256': live, 'chain': 'ok', **states}, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('landing_tree', type=Path)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--lander')
    mode.add_argument('--verify', action='store_true')
    args = parser.parse_args()
    tree = args.landing_tree.resolve(strict=True)
    if args.verify:
        verify(tree)
    else:
        fill(tree, args.lander)
