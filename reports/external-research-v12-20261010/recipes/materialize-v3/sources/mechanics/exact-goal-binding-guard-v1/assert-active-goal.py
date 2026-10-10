#!/usr/bin/env python3
"""Read-only exact native Goal binding check; never invokes a provider."""
import argparse
import json
from pathlib import Path


def fail(message):
    raise ValueError(message)


def exact_json(text):
    def pairs(items):
        obj = {}
        for key, value in items:
            if key in obj:
                fail('duplicate JSON key: ' + key)
            obj[key] = value
        return obj
    return json.loads(text, object_pairs_hook=pairs,
                      parse_constant=lambda value: fail('invalid JSON constant'))


def no_links(path):
    if not path.is_absolute():
        fail('absolute path required')
    if any(p.is_symlink() for p in (path, *path.parents)):
        fail('symlink path rejected')


def check(stage, response):
    no_links(stage)
    freeze_path = stage / 'freeze.json'
    no_links(freeze_path)
    if not stage.is_dir() or not freeze_path.is_file():
        fail('stage/freeze missing')
    for p in stage.rglob('*'):
        if p.is_symlink():
            fail('symlink stage member rejected')
    freeze = exact_json(freeze_path.read_text())
    objective = freeze.get('native_goal_objective')
    if not isinstance(objective, str) or not objective:
        fail('frozen objective missing')
    obj = exact_json(response)
    if not isinstance(obj, dict):
        fail('complete native response object required')
    # Native Codex envelope and Muse direct goal response. No extraction from
    # prose, no JSON-fragment recovery, no case folding or path normalization.
    if 'goal' in obj:
        goal = obj['goal']
        if isinstance(goal, dict) and 'threadId' in goal and not {'remainingTokens', 'completionBudgetReport'} <= obj.keys():
            fail('partial Codex native response')
    else:
        if 'goal_id' not in obj:
            fail('complete native envelope required; extracted Codex goal rejected')
        goal = obj
    if not isinstance(goal, dict):
        fail('native goal object missing')
    if not {'objective', 'status'} <= goal.keys():
        fail('partial native goal response')
    if 'threadId' in goal and not {'createdAt', 'updatedAt', 'tokensUsed', 'timeUsedSeconds'} <= goal.keys():
        fail('partial Codex native goal fields')
    identities = [goal[k] for k in ('threadId', 'goal_id') if k in goal]
    if not identities or any(not isinstance(v, str) or not v.strip() for v in identities):
        fail('exposed native identity required')
    if goal['status'] != 'active':
        fail('native Goal is not active')
    if goal['objective'] != objective:
        fail('native objective differs from freeze.native_goal_objective')
    return {'ok': True, 'provenance_independently_proved': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage-dir', required=True, type=Path)
    parser.add_argument('--json', required=True)
    args = parser.parse_args()
    try:
        print(json.dumps(check(args.stage_dir, args.json)))
    except (ValueError, OSError, TypeError, AttributeError) as exc:
        parser.exit(2, str(exc) + '\n')


if __name__ == '__main__':
    main()
