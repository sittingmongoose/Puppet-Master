#!/usr/bin/env python3
"""Fill only the NEW DL-451 receipt, at the coordinated landing. Never seals."""
import argparse
import hashlib
import json
from pathlib import Path
import sys
import types


def load_validator(path):
    """The validator module, compiled from the exact bytes read here, and those bytes (T45, cycle-13 H04).

    An import through the source loader can run a cached __pycache__ .pyc (an unchecked hash-based one is used
    without comparing it to the source, and .gitignore hides it), so the code that fills the receipt could differ
    from the bytes whose digest the receipt records. Here the bytes are read once, compiled and executed, and the
    same bytes are hashed; no .pyc is read or written."""
    raw = path.read_bytes()
    module = types.ModuleType('dl451_validator')
    module.__file__ = str(path)
    sys.modules['dl451_validator'] = module
    exec(compile(raw, str(path), 'exec', dont_inherit=True), module.__dict__)
    return module, raw


def write(root, lander):
    relative = 'Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py'
    validator, raw = load_validator(root / relative)
    executed_sha256 = hashlib.sha256(raw).hexdigest()
    path = root / validator.RECOUNT_CHANGE
    receipt = validator.recount_object(path)
    if receipt.get('author_task') != validator.RECOUNT_AUTHOR:
        raise ValueError('wrong fourth-change receipt author')
    if not lander.strip():
        raise ValueError('actual lander task is required')
    receipt['lander_task'] = lander
    receipt['seal_applier_forbidden_tasks'] = sorted({validator.RECOUNT_AUTHOR, lander})
    # the digest recorded is the digest of the bytes that ran, and the file still holds them
    if validator.sha256_file(root / relative) != executed_sha256:
        raise ValueError('validator bytes changed while the receipt was written')
    receipt['validator_after_sha256'] = executed_sha256
    receipt['authority_section_sha256'] = hashlib.sha256(validator.decision_section_bytes(
        root / 'Plans/Decision_Log.md', 'DL-451')).hexdigest()
    receipt['prior_receipt']['sha256'] = validator.sha256_file(root / validator.MULTI_FAMILY_RECEIPT)
    path.write_text(json.dumps(receipt, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(json.dumps({'path': validator.RECOUNT_CHANGE, 'sha256': validator.sha256_file(path),
                      'lander_task': lander, 'seal_authorized': False}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('landing_tree', type=Path)
    parser.add_argument('--lander', required=True)
    args = parser.parse_args()
    write(args.landing_tree.resolve(strict=True), args.lander)
