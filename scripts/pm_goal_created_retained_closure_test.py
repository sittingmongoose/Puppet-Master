#!/usr/bin/env python3
"""Test both closed-object rules on the credited Goal created retained-v2 definition."""
import argparse
import copy
import gzip
import hashlib
import json
from pathlib import Path
import pickle
import subprocess
from unittest.mock import patch

import pm_goal_go_created as goal
import pm_goal_go_schema as schema

ROOT = goal.ROOT
SCHEMA = goal.PKG / 'retained-v2.schema.json'
SCHEMA_ID = 'pm.goal_runtime_event.goal_created.schema.v2'
ROW = 'complete/owner_schema/Plans/goal_created_reader_contracts/retained-v2.schema.json#'
OLD_RULE = SCHEMA_ID + '/closed_members'
EXTRA = 'gc_extra_member'
KEYWORDS = {
    'additionalProperties': "Additional properties are not allowed ('gc_extra_member' was unexpected)",
    'unevaluatedProperties': "Unevaluated properties are not allowed ('gc_extra_member' was unexpected)",
}


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def current_main_sources(main, paths):
    checksums = {}
    for path in sorted(set(paths)):
        name = path.relative_to(ROOT).as_posix()
        raw = git('show', f'{main}:{name}')
        require(raw == path.read_bytes(), f'working source differs from main: {name}')
        checksums[name] = digest(raw)
    return checksums


def historical_records(directory):
    records = {}
    for filename in ('v3-a.json.gz', 'closure-merged.json.gz'):
        path = directory / filename
        raw = path.read_bytes()
        old = json.loads(gzip.decompress(raw))['roots']['go:' + ROW]['clauses'][OLD_RULE]
        require(old['path'] == [] and old['edit'] == "('add', 'gc_extra_member')" and old['cls'] == 'KILLED',
                f'historical document edit differs in {path}')
        records[filename] = dict(path=str(path), sha256=digest(raw), rule=OLD_RULE, result=old)
    return records


def messages(validator, document):
    return sorted((dict(keyword=error.validator, message=error.message,
                        instance_path=list(error.absolute_path), schema_path=list(error.absolute_schema_path))
                   for error in validator.iter_errors(document)), key=lambda error: error['keyword'])


def run(main, historical):
    registered = []
    original_registry = goal.c.schema_registry

    def capture(paths, *args, **kwargs):
        registered.extend(paths)
        return original_registry(paths, *args, **kwargs)

    with patch.object(goal.c, 'schema_registry', capture), patch.object(goal, 'CHECKS', None):
        check = goal.checks().payload_v2
        validator = check.validator
        require(check.root == 'go:' + ROW, 'the checker selected another retained schema row')
        source_paths = [*registered, *goal.RESOURCE_FILES.values(), *goal.PKG.glob('*.json'),
                        Path(goal.__file__), Path(goal.c.__file__), Path(schema.__file__)]
        source_hashes = current_main_sources(main, source_paths)
        raw = git('show', f'{main}:{SCHEMA.relative_to(ROOT).as_posix()}')
        document = json.loads(raw)
        node = validator._resolver.lookup(SCHEMA_ID + '#').contents
        require(node == goal.c.runtime_schema(document), 'installed definition differs from the current main schema')
        require(node['$id'] == SCHEMA_ID and all(node.get(word) is False for word in KEYWORDS),
                'the retained-v2 definition lacks the two independent closing keywords')
        require(goal.c.schema_guard(node, 'additionalProperties') == goal.c.schema_guard(node, 'unevaluatedProperties'),
                'the historical grouped ID is no longer present in this checkout')
        valid_world = goal.reader_world_v2()
        invalid_world = copy.deepcopy(valid_world)
        goal.coherent_frame(invalid_world, 1, lambda e: e['payload'].__setitem__(EXTRA, 'gc'))
        valid = valid_world['source']['frames'][1]['event']['payload']
        invalid = invalid_world['source']['frames'][1]['event']['payload']

        def observe():
            return dict(control_messages=messages(validator, valid), invalid_messages=messages(validator, invalid),
                        reader_control=sorted(goal.read(valid_world)), reader_invalid=sorted(goal.read(invalid_world)))

        before = observe()
        trials = {}
        original_contents = dict(node)
        for word in KEYWORDS:
            try:
                del node[word]
                disabled = observe()
            finally:
                node.clear()
                node.update(original_contents)
            restored = observe()
            other = next(keyword for keyword in KEYWORDS if keyword != word)
            expected = [item for item in before['invalid_messages'] if item['keyword'] == other]
            trials[word] = dict(disabled=disabled, restored=restored, independent=(
                bool(expected) and disabled['invalid_messages'] == expected and restored == before
                and not disabled['control_messages'] and not disabled['reader_control']
                and disabled['reader_invalid'] == [ROW]))
        expected = [dict(keyword=word, message=message, instance_path=[], schema_path=[word])
                    for word, message in sorted(KEYWORDS.items())]
        passed = (before['invalid_messages'] == expected and not before['control_messages']
                  and not before['reader_control'] and before['reader_invalid'] == [ROW]
                  and all(trial['independent'] for trial in trials.values()))
        require(node == goal.c.runtime_schema(document) and SCHEMA.read_bytes() == raw,
                'the retained definition did not restore exactly')
    return dict(status='both_effects_observed' if passed else 'unexpected_validation_result',
                main=main, schema_path=str(SCHEMA.relative_to(ROOT)), schema_sha256=digest(raw),
                schema_id=SCHEMA_ID, root='go:' + ROW, historical=historical, main_sources=source_hashes,
                valid=valid, invalid=invalid, extra_member=EXTRA,
                invalid_sha256=digest(pickle.dumps(invalid, protocol=5)), enabled=before, single_rule_tests=trials)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--main-ref', default='refs/remotes/origin/main')
    parser.add_argument('--historical-dir', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    revision = git('rev-parse', '--verify', args.main_ref + '^{commit}').decode().strip()
    result = run(revision, historical_records(args.historical_dir))
    require(all(record['result']['input_sha256'] == result['invalid_sha256']
                for record in result['historical'].values()),
            'the replayed invalid document differs from the historical reports')
    args.out.write_text(json.dumps(result, indent=2, sort_keys=True) + '\n')
    for word, trial in result['single_rule_tests'].items():
        print(word, 'independent validation message' if trial['independent'] else 'unexpected validation result')
    return 0 if result['status'] == 'both_effects_observed' else 1


if __name__ == '__main__':
    raise SystemExit(main())
