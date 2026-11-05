#!/usr/bin/env python3
"""Fill only the NEW DL-451 receipt, at the coordinated landing. Never seals."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path


def write(root, lander):
    relative = 'Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py'
    spec = importlib.util.spec_from_file_location('dl451_validator', root / relative)
    validator = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(validator)
    path = root / validator.RECOUNT_CHANGE
    receipt = validator.recount_object(path)
    if receipt.get('author_task') != validator.RECOUNT_AUTHOR:
        raise ValueError('wrong fourth-change receipt author')
    if not lander.strip():
        raise ValueError('actual lander task is required')
    receipt['lander_task'] = lander
    receipt['seal_applier_forbidden_tasks'] = sorted({validator.RECOUNT_AUTHOR, lander})
    receipt['validator_after_sha256'] = validator.sha256_file(root / relative)
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
