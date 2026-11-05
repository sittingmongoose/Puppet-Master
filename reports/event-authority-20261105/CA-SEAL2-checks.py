#!/usr/bin/env python3
"""DL-451 isolated input/receipt regressions; fixture trees stay outside the repo."""
import argparse
import ast
import dis
import types
import copy
import difflib
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

REL = 'Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py'
COUNT = 'c53e4199ae94ca853a197354f3f9e7f296cf1efc'
PREVIOUS = '5764ca809c0dcc8a161d4fcd45770abf6355f746'
SEAL_BASE = '17c842445a2623bb0334ba8d6932e7a6bf088967'
COVERAGE = 'reports/event-authority-20261105/CA-SEAL2-coverage.json'


def sha(raw): return hashlib.sha256(raw).hexdigest()
def encoded(doc): return (json.dumps(doc, indent=2) + '\n').encode()


def predicate_sites(source, before):
    """Astra 3 inventory rules, with touched functions/lines derived from the diff.

    Keep wrappers and children distinct. Expand chains, receipt fields, nested
    identities and call-instantiated authority requirements independently.
    """
    functions = {n.name: n for n in ast.parse(source).body if isinstance(n, ast.FunctionDef)}
    previous = {n.name: n for n in ast.parse(before).body if isinstance(n, ast.FunctionDef)}
    added_lines = set()
    for tag, _, _, start, end in difflib.SequenceMatcher(
            None, before.splitlines(), source.splitlines(), autojunk=False).get_opcodes():
        if tag in {'insert', 'replace'}:
            added_lines.update(range(start + 1, end + 1))
    rows = {}
    def add(function, node, expression, kind):
        row = {'function': function, 'line': node.lineno, 'column': node.col_offset,
               'expression': expression, 'kind': kind}
        key = (function, node.lineno, node.col_offset, expression, kind)
        rows[key] = row
    touched = {}
    for name, fn in functions.items():
        old = previous.get(name)
        if old is not None and ast.dump(old) == ast.dump(fn):
            continue
        touched[name] = fn
        for n in ast.walk(fn):
            if not hasattr(n, 'lineno'):
                continue
            # Astra includes the builder's returned record immediately after
            # its inserted gate, since that gate changes this record's pass.
            if old is not None and n.lineno not in added_lines and not (
                    name == 'build_receipt' and isinstance(n, ast.Return)):
                continue
            if isinstance(n, ast.Compare):
                for left, op, right in zip([n.left] + n.comparators[:-1], n.ops, n.comparators):
                    add(name, n, ast.unparse(ast.Compare(left=left, ops=[op], comparators=[right])), 'comparison')
            if isinstance(n, ast.If):
                add(name, n.test, ast.unparse(n.test), 'branch')
            if isinstance(n, ast.IfExp):
                add(name, n.test, ast.unparse(n.test), 'conditional expression')
            if isinstance(n, ast.BoolOp):
                for child in n.values:
                    if not isinstance(child, ast.BoolOp):
                        add(name, child, ast.unparse(child), 'Boolean clause')
            if (isinstance(n, ast.Call) and isinstance(n.func, ast.Attribute)
                    and n.func.attr in {'fullmatch', 'search', 'isfinite', 'startswith',
                                        'is_absolute', 'is_relative_to', 'is_file'}):
                add(name, n, ast.unparse(n), 'predicate call')
            if isinstance(n, ast.Return):
                add(name, n, ast.unparse(n.value) if n.value else 'None', 'return')
            # Astra's close_inventory adds this executable observer assignment.
            if (isinstance(n, ast.Assign) and isinstance(n.value, ast.Call)
                    and ast.unparse(n.value) == 'third_change_validator_pin()'):
                add(name, n, ast.unparse(n), 'changed observer call')
    syntax = sorted(rows.values(), key=lambda r: (r['line'], r['column'], r['kind']))
    for row in syntax:
        row['site_id'] = 'syntax:' + sha(json.dumps(row, sort_keys=True).encode())
    semantic = []
    def expand(label):
        semantic.append({'site_id': 'semantic:' + label, 'predicate': label})
    change = touched['recount_change_state']
    expected = next(n.value for n in ast.walk(change) if isinstance(n, ast.Assign)
                    and any(isinstance(t, ast.Name) and t.id == 'expected' for t in n.targets))
    for key in expected.keys:
        for clause in ['type', 'value']:
            expand('field_' + key.value + '_' + clause)
    authority = next(n for n in ast.walk(change) if isinstance(n, ast.Call)
                     and isinstance(n.func, ast.Name) and n.func.id == 'decision_section_bytes')
    for index, _ in enumerate(authority.args[2].elts):
        expand('authority_required_token_' + str(index))
    for key, value in zip(expected.keys, expected.values):
        if isinstance(value, ast.Dict):
            for clause in ['path', 'keys']:
                expand('nested_' + key.value + '_' + clause)
    flags = next(n for n in ast.walk(change) if isinstance(n, ast.GeneratorExp)
                 and isinstance(n.generators[0].iter, ast.Tuple))
    for flag in flags.generators[0].iter.elts:
        expand(flag.value + ' is False')
    for handler in (n for n in ast.walk(touched['recount_validation']) if isinstance(n, ast.ExceptHandler)):
        issue = next(n for n in ast.walk(handler) if isinstance(n, ast.Dict))
        error = next(value.value for key, value in zip(issue.keys, issue.values) if key.value == 'error')
        expand('collect ' + error + ' before completion')
    return syntax + semantic


def check_coverage(repo, test_names):
    before = subprocess.check_output(['git', '-C', str(repo), 'show', SEAL_BASE + ':' + REL]).decode()
    actual = predicate_sites((repo / REL).read_text(), before)
    table = json.loads((repo / COVERAGE).read_bytes())
    expected = {row['site_id']: row for row in actual}
    rows = table['sites']
    recorded = {row['site_id']: row for row in rows}
    assert len(recorded) == len(rows), 'duplicate coverage site'
    missing, stale = set(expected) - set(recorded), set(recorded) - set(expected)
    assert not missing and not stale, ('coverage sites missing=' + repr(sorted(missing))
                                       + ' stale=' + repr(sorted(stale)))
    for site, identity in expected.items():
        row = recorded[site]
        assert all(row.get(k) == value for k, value in identity.items()), ('changed site', site)
        assert row['evidence'], ('missing evidence', site)
        if row['outcome'] == 'killed by':
            assert row['killed_by'] and set(row['killed_by']) <= test_names, ('unknown test', site)
            assert row['cut'], ('missing narrow cut', site)
        else:
            assert row['outcome'] in {'same-predicate duplicate', 'implied', 'frozen-input only', 'structural'}
            assert row['reason'], ('missing survivor explanation', site)
    assert len(table['prior_survivors']) == 84


def run(repo, output, source_map, apply_cut=None):
    results = []
    def record(name, action, rejects=False, message=None):
        try:
            value = action()
            if rejects:
                raise AssertionError('negative was accepted')
            results.append({'name': name, 'pass': True})
            return value
        except (ValueError, OSError, TypeError, KeyError, UnicodeError, subprocess.SubprocessError) as exc:
            if not rejects or (message is not None and message not in str(exc)):
                results.append({'name': name, 'pass': False, 'error': str(exc)})
            else:
                results.append({'name': name, 'pass': True, 'refusal': str(exc)[:240]})
        except AssertionError as exc:
            results.append({'name': name, 'pass': False, 'error': str(exc)})

    def git(spec):
        return subprocess.check_output(['git', '-C', str(repo), 'show', spec])

    base = Path.home() / 'PM-Experiments'
    base.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='CA-SEAL2-', dir=base) as directory:
        root = Path(directory)
        def put(path, raw):
            target = root / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(raw)
            return target
        put(REL, (repo / REL).read_bytes())
        spec = importlib.util.spec_from_file_location('dl451_fixture', root / REL)
        v = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(v)
        if apply_cut is not None:
            apply_cut(v)
        for path in [v.MULTI_FAMILY_RECEIPT, v.POST_AUGUST_RECEIPT, v.HOLDING_RECEIPT,
                     str(v.DENOM.relative_to(root)),
                     'Plans/.audits/event-authority-2026-08-12/closed-world-census/CURRENT_SOURCE_INVENTORY.json',
                     'Plans/.audits/event-authority-2026-08-12/independent-validator/receipts/event_authority_validator_receipt.json']:
            put(path, (repo / path).read_bytes())
        put('Plans/Decision_Log.md', git('origin/plans/ea-cards2-answers-20261105:Plans/Decision_Log.md'))
        frozen_receipt = git(COUNT + ':' + v.RECOUNT_RECEIPT)
        frozen_list = git(COUNT + ':' + v.RECOUNT_LIST)
        put(v.RECOUNT_RECEIPT, frozen_receipt)
        put(v.RECOUNT_LIST, frozen_list)
        change = json.loads((repo / v.RECOUNT_CHANGE).read_bytes())
        change['lander_task'] = 'fixture:lander'
        change['seal_applier_forbidden_tasks'] = sorted({v.RECOUNT_AUTHOR, 'fixture:lander'})
        put(v.RECOUNT_CHANGE, encoded(change))
        def anchors():
            put('Plans/Spec_Lock.json', encoded({'canonical_ssot_hashes': {'files': [
                {'path': p, 'sha256': sha((root / p).read_bytes())}
                for p in [v.MULTI_FAMILY_RECEIPT, v.RECOUNT_CHANGE]]}}))
        anchors()
        original_env = {k: os.environ.get(k) for k in ['GIT_DIR', 'PM_EA_RECOUNT_SOURCE_MAP']}
        try:
            os.environ['GIT_DIR'] = str(Path(subprocess.check_output(
                ['git', '-C', str(repo), 'rev-parse', '--absolute-git-dir']).decode().strip()))
            os.environ['PM_EA_RECOUNT_SOURCE_MAP'] = str(source_map)
            names, custody = record('positive_real_frozen_recount_597_sources', v.recount_frozen_inputs)
            # Astra 2 B03: mutate only the supplied map, retaining all 597 sources.
            real_map = json.loads(source_map.read_bytes())
            probe_map = put('real-map-probe.json', encoded(real_map))
            for label, mutate in [
                ('extra_root_key', lambda d: d.__setitem__('extra', 'not allowed')),
                ('wrong_schema', lambda d: d.__setitem__('schema_id', 'wrong.schema')),
                ('relative_location', lambda d: d['locations'].__setitem__(
                    next(iter(d['locations'])), os.path.relpath(next(iter(d['locations'].values()))))),
            ]:
                os.environ['PM_EA_RECOUNT_SOURCE_MAP'] = str(source_map)
                v.recount_frozen_inputs()  # The unchanged parent verifies all sources.
                bad = copy.deepcopy(real_map)
                mutate(bad)
                probe_map.write_bytes(encoded(bad))
                os.environ['PM_EA_RECOUNT_SOURCE_MAP'] = str(probe_map)
                record('negative_source_map_' + label, v.recount_frozen_inputs, True)
            os.environ['PM_EA_RECOUNT_SOURCE_MAP'] = str(source_map)
            record('positive_fourth_receipt', v.recount_change_state)
            record('positive_original_DL077_predicate_through_both_anchors', v.post_august_receipt_state)
            def august_snapshot():
                inventory = json.loads((v.CENSUS / 'CURRENT_SOURCE_INVENTORY.json').read_bytes())
                denominator = json.loads(v.DENOM.read_bytes())
                assert inventory['canonical_digest_sha256'] == denominator['freeze_digest_sha256']
                assert sha((v.CENSUS / 'CURRENT_SOURCE_INVENTORY.json').read_bytes()) == sha((repo / str((v.CENSUS / 'CURRENT_SOURCE_INVENTORY.json').relative_to(root))).read_bytes())
                pins = v.recount_snapshot_pins()
                assert pins['august']['inventory_sha256'] != pins['recount']['expected_list_sha256']
            record('positive_preserved_August_snapshot_own_digest', august_snapshot)

            # Every following negative starts from an independently passing synthetic
            # custody fixture. It uses the actual 249-name list and exact 597-source shape.
            sources = {}
            locations = {}
            for i in range(597):
                name = 'Plans/fixture_' + str(i) + '.json'
                raw = str(i % 10).encode()
                target = put('fixture-source-bytes/' + str(i), raw)
                sources[name] = {'sha256': sha(raw), 'bytes': len(raw)}
                locations[name] = str(target)
            synthetic = json.loads(frozen_receipt)
            synthetic['inputs'] = sources
            map_path = put('source-map.json', encoded({'schema_id': 'pm.event_authority.recount_source_locations.v1', 'locations': locations}))
            os.environ['PM_EA_RECOUNT_SOURCE_MAP'] = str(map_path)
            def reset_inputs(doc=None):
                raw = encoded(synthetic if doc is None else doc)
                put(v.RECOUNT_RECEIPT, raw)
                v.RECOUNT_RECEIPT_SHA = sha(raw)
                put(v.RECOUNT_LIST, frozen_list)
                coherent_locations = {k: locations[k] for k in (synthetic if doc is None else doc)['inputs']}
                map_path.write_bytes(encoded({'schema_id': 'pm.event_authority.recount_source_locations.v1', 'locations': coherent_locations}))
            reset_inputs()
            record('positive_isolated_source_fixture', v.recount_frozen_inputs)
            # Same-size JSON whitespace change: only the frozen receipt byte pin is stale.
            mutated_receipt = bytearray((root / v.RECOUNT_RECEIPT).read_bytes())
            mutated_receipt[mutated_receipt.index(32)] = 9
            put(v.RECOUNT_RECEIPT, bytes(mutated_receipt))
            record('negative_one_changed_receipt_byte', v.recount_frozen_inputs, True, 'receipt byte fingerprint')
            reset_inputs()
            mutated = bytearray(frozen_list)
            mutated[mutated.index(32)] = 9  # One whitespace byte; JSON and byte count stay valid.
            put(v.RECOUNT_LIST, bytes(mutated))
            record('negative_one_changed_list_byte', v.recount_frozen_inputs, True, 'list byte fingerprint')
            reset_inputs()
            source = Path(locations['Plans/fixture_0.json'])
            source.write_bytes(b'9')
            record('negative_one_changed_source_byte', v.recount_frozen_inputs, True, 'source fingerprint mismatch')
            source.write_bytes(b'0')
            for label, mutate, message in [
                ('wrong_source_byte_count', lambda d: d['inputs']['Plans/fixture_0.json'].__setitem__('bytes', 2), 'source fingerprint mismatch'),
                ('missing_fingerprint', lambda d: d['inputs']['Plans/fixture_0.json'].pop('sha256'), 'missing or noncanonical'),
                ('mismatched_fingerprint', lambda d: d['inputs']['Plans/fixture_0.json'].__setitem__('sha256', 'f' * 64), 'source fingerprint mismatch'),
                ('mixed_August_source_revision', lambda d: d.__setitem__('main_sha', '0' * 40), 'snapshot identity'),
                ('missing_source_member', lambda d: d['inputs'].pop('Plans/fixture_0.json'), 'fingerprint set incomplete'),
                ('string_byte_count', lambda d: d['inputs']['Plans/fixture_0.json'].__setitem__('bytes', '1'), 'missing or noncanonical'),
                ('boolean_byte_count', lambda d: d['inputs']['Plans/fixture_0.json'].__setitem__('bytes', True), 'missing or noncanonical'),
                ('float_byte_count', lambda d: d['inputs']['Plans/fixture_0.json'].__setitem__('bytes', 1.0), 'missing or noncanonical'),
                ('uppercase_source_sha', lambda d: d['inputs']['Plans/fixture_0.json'].__setitem__('sha256', d['inputs']['Plans/fixture_0.json']['sha256'].upper()), 'missing or noncanonical'),
            ]:
                doc = copy.deepcopy(synthetic)
                mutate(doc)
                reset_inputs(doc)  # Refresh only the fixture trust pin to isolate its inner predicate.
                record('negative_' + label, v.recount_frozen_inputs, True, message)
            reset_inputs()
            doc = copy.deepcopy(synthetic)
            doc['inputs']['Plans/fixture_0.json']['sha256'] = json.loads(
                (v.CENSUS / 'CURRENT_SOURCE_INVENTORY.json').read_bytes())['canonical_digest_sha256']
            reset_inputs(doc)
            record('negative_August_fingerprint_with_recount_membership', v.recount_frozen_inputs, True, 'source fingerprint mismatch')
            reset_inputs()

            reset_inputs()
            unknown_map = json.loads(map_path.read_bytes())
            unknown_map['locations']['Plans/unknown-source.json'] = locations['Plans/fixture_0.json']
            map_path.write_bytes(encoded(unknown_map))
            record('negative_source_map_unknown_member', v.recount_frozen_inputs, True,
                   'invalid explicit recount source locations')
            absolute_doc = copy.deepcopy(synthetic)
            absolute_doc['inputs'] = {locations[k]: pin for k, pin in sources.items()}
            put(v.RECOUNT_RECEIPT, encoded(absolute_doc))
            v.RECOUNT_RECEIPT_SHA = sha(encoded(absolute_doc))
            map_path.write_bytes(encoded({'schema_id': 'pm.event_authority.recount_source_locations.v1', 'locations': {}}))
            record('positive_absolute_sources_without_map_entries', v.recount_frozen_inputs)
            map_path.write_bytes(encoded({'schema_id': 'pm.event_authority.recount_source_locations.v1', 'locations': []}))
            record('negative_source_map_locations_array', v.recount_frozen_inputs, True,
                   'invalid explicit recount source locations')
            reset_inputs()

            # Semantic receipt faults retain a matching byte anchor, so integrity
            # rejection cannot mask the intended validator/authority predicate.
            v.RECOUNT_RECEIPT_SHA = sha(frozen_receipt)
            put(v.RECOUNT_RECEIPT, frozen_receipt)
            for field, value in [
                ('schema_id', 'wrong.schema'), ('authority_ref', 'Plans/Decision_Log.md#DL-450'),
                ('validator_before_sha256', '0' * 64), ('validator_after_sha256', '0' * 64),
                ('prior_receipt', {'path': v.MULTI_FAMILY_RECEIPT, 'sha256': '0' * 64}),
                ('recount_receipt', {'path': v.RECOUNT_RECEIPT, 'sha256': '0' * 64}),
                ('recount_list', {'path': v.RECOUNT_LIST, 'sha256': '0' * 64}),
                ('definition_writing_authorized', True), ('app_recording_authorized', True),
                ('contract_depth_complete', True),
                ('validator_id', 'another.validator'), ('validator_path', 'Plans/wrong.py'),
                ('authority_section_sha256', '0' * 64), ('author_task', 'another.author'),
                ('lander_task', None), ('seal_authorized', True), ('admission_authorized', 'false'),
                ('certification_scope', 'recount_only'),
            ]:
                doc = copy.deepcopy(change)
                doc[field] = value
                put(v.RECOUNT_CHANGE, encoded(doc))
                anchors()
                record('negative_change_' + field, v.recount_change_state, True, 'identity, authority')
                record('legacy_predicate_preserved_under_' + field, v.post_august_receipt_state,
                       field in {'validator_before_sha256', 'validator_after_sha256'})
            put(v.RECOUNT_CHANGE, encoded(change))
            anchors()
            # Astra 3 B01/B02: each parent passes; hashes follow changed bytes.
            decision_path = root / 'Plans/Decision_Log.md'
            decision_raw = decision_path.read_bytes()
            section = v.decision_section_bytes(decision_path, 'DL-451')
            authority_tokens = [b'i approve all of it', b'Approve a fourth recorded change',
                                b'Keep every per-name decision',
                                b'6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30']
            try:
                for index, token in enumerate(authority_tokens):
                    decision_path.write_bytes(decision_raw)
                    put(v.RECOUNT_CHANGE, encoded(change))
                    anchors()
                    v.recount_change_state()
                    edited = section.replace(token, b'[removed requirement]')
                    assert token not in edited
                    decision_path.write_bytes(decision_raw.replace(section, edited))
                    bad = copy.deepcopy(change)
                    bad['authority_section_sha256'] = sha(edited)
                    put(v.RECOUNT_CHANGE, encoded(bad))
                    anchors()
                    record('negative_authority_required_token_' + str(index), v.recount_change_state,
                           True, 'DL-451 authority text missing or changed')
            finally:
                decision_path.write_bytes(decision_raw)
                put(v.RECOUNT_CHANGE, encoded(change))
                anchors()
            for field in ['prior_receipt', 'recount_receipt', 'recount_list']:
                for clause in ['path', 'keys']:
                    put(v.RECOUNT_CHANGE, encoded(change))
                    anchors()
                    v.recount_change_state()
                    bad = copy.deepcopy(change)
                    if clause == 'path':
                        bad[field]['path'] = 'reports/substituted-path.json'
                    else:
                        bad[field]['unexpected'] = 'extra'
                    put(v.RECOUNT_CHANGE, encoded(bad))
                    anchors()
                    record('negative_nested_' + field + '_' + clause, v.recount_change_state,
                           True, 'fourth amendment identity, authority')
            put(v.RECOUNT_CHANGE, encoded(change))
            anchors()
            # B06: call the changed third semantic helper directly, from a
            # fully finalized third/fourth fixture. Every byte observation follows.
            third_raw = (root / v.MULTI_FAMILY_RECEIPT).read_bytes()
            try:
                third = json.loads(third_raw)
                third['lander_task'] = 'fixture:third-lander'
                third['seal_applier_forbidden_tasks'] = sorted({v.MULTI_FAMILY_AUTHOR, 'fixture:third-lander'})
                def sync_third(doc):
                    put(v.MULTI_FAMILY_RECEIPT, encoded(doc))
                    fourth = copy.deepcopy(change)
                    fourth['prior_receipt']['sha256'] = sha((root / v.MULTI_FAMILY_RECEIPT).read_bytes())
                    put(v.RECOUNT_CHANGE, encoded(fourth))
                    anchors()
                sync_third(third)
                v.multi_family_receipt_state()
                v.recount_change_state()
                bad = copy.deepcopy(third)
                bad['validator_after_sha256'] = 'e' * 64
                sync_third(bad)
                record('negative_third_semantic_after_hash', v.multi_family_receipt_state, True,
                       'multi-family step amendment receipt identity, authority or hash mismatch')
            finally:
                put(v.MULTI_FAMILY_RECEIPT, third_raw)
                put(v.RECOUNT_CHANGE, encoded(change))
                anchors()
            for label, raw, kind in [
                ('duplicate_root', b'{"a":1,"a":2}', dict),
                ('duplicate_nested', b'{"a":{"b":1,"b":2}}', dict),
                ('NaN', b'{"a":NaN}', dict), ('Infinity', b'{"a":Infinity}', dict),
                ('negative_Infinity', b'{"a":-Infinity}', dict), ('overflow', b'{"a":1e9999}', dict),
                ('BOM', b'\xef\xbb\xbf{}', dict), ('trailing', b'{}x', dict),
                ('wrong_root_array', b'[]', dict), ('wrong_root_bool', b'false', dict),
                ('wrong_root_null', b'null', dict), ('wrong_root_string', b'"0"', dict),
            ]:
                record('negative_strict_' + label, lambda raw=raw, kind=kind: v.recount_json(raw, kind), True)
            for raw in [b'{"a":1}', b'{} \n']:
                record('positive_strict_JSON_' + str(len(raw)), lambda raw=raw: v.recount_json(raw, dict))

            put('Plans/Spec_Lock.json', encoded({'canonical_ssot_hashes': {'files': [
                {'path': v.MULTI_FAMILY_RECEIPT, 'sha256': sha((root / v.MULTI_FAMILY_RECEIPT).read_bytes())}]}}))
            def broken_anchor():
                # Product call only: an observer assertion cannot prove a refusal.
                v.post_august_receipt_state()
            record('negative_missing_fourth_anchor', broken_anchor, True)
            anchors()
            lock = json.loads((root / 'Plans/Spec_Lock.json').read_bytes())
            lock['canonical_ssot_hashes']['files'].append(copy.deepcopy(lock['canonical_ssot_hashes']['files'][-1]))
            put('Plans/Spec_Lock.json', encoded(lock))
            record('negative_duplicate_fourth_anchor', broken_anchor, True)
            anchors()

            # Round 2: each control starts from the same valid complete receipt.
            # The list and whole-receipt anchor are observations of the changed
            # lander/receipt, so synchronize them rather than leave a second fault.
            for label in ['wrong_fourth_anchor_digest', 'blank_lander',
                          'missing_lander_from_seal_applier_list']:
                put(v.RECOUNT_CHANGE, encoded(change))
                anchors()
                v.recount_change_state()  # Prove the parent case passes first.
                doc = copy.deepcopy(change)
                if label == 'blank_lander':
                    doc['lander_task'] = ' '
                    doc['seal_applier_forbidden_tasks'] = sorted({v.RECOUNT_AUTHOR, ' '})
                elif label == 'missing_lander_from_seal_applier_list':
                    doc['seal_applier_forbidden_tasks'] = [v.RECOUNT_AUTHOR]
                put(v.RECOUNT_CHANGE, encoded(doc))
                anchors()
                if label == 'wrong_fourth_anchor_digest':
                    lock = json.loads((root / 'Plans/Spec_Lock.json').read_bytes())
                    fourth = next(entry for entry in lock['canonical_ssot_hashes']['files']
                                  if entry['path'] == v.RECOUNT_CHANGE)
                    fourth['sha256'] = '0' * 64  # Canonical, wrong; third anchor stays valid.
                    put('Plans/Spec_Lock.json', encoded(lock))
                record('negative_' + label, v.recount_change_state, True, 'identity, authority')
            put(v.RECOUNT_CHANGE, encoded(change))
            anchors()

            third_raw = (root / v.MULTI_FAMILY_RECEIPT).read_bytes()
            third_doc = json.loads(third_raw)
            third_doc['validator_after_sha256'] = '0' * 64
            put(v.MULTI_FAMILY_RECEIPT, encoded(third_doc))
            bridge_change = copy.deepcopy(change)
            bridge_change['prior_receipt']['sha256'] = sha(encoded(third_doc))
            put(v.RECOUNT_CHANGE, encoded(bridge_change))
            anchors()
            def bridge_refusal():
                if v.third_change_validator_pin() != v.RECOUNT_BEFORE_SHA:
                    raise ValueError('third executable pin refused')
            record('negative_third_bridge_executable_pin', bridge_refusal, True)
            record('negative_change_requires_valid_third_bridge', v.recount_change_state, True)
            put(v.MULTI_FAMILY_RECEIPT, third_raw)
            put(v.RECOUNT_CHANGE, encoded(change))
            anchors()

            # Outcome checks cannot supply admission: the accepted set is the
            # output of unchanged admission checks in main, explicitly injected here.
            outcome_doc = {'schema_id': 'pm.assurance.event_authority.recount_outcomes.v1',
                           'recount_receipt_sha256': v.RECOUNT_RECEIPT_SHA,
                           'recount_list_sha256': v.RECOUNT_LIST_SHA,
                           'rows': [{'event_type': n, 'outcome': 'registered'} for n in names]}
            def outcomes(doc, admitted=None):
                put(str(v.RECOUNT_OUTCOMES.relative_to(root)), encoded(doc))
                return v.recount_outcomes(names, set(names) if admitted is None else admitted)
            record('positive_complete_outcome_reader_with_injected_admitted_set', lambda: outcomes(outcome_doc))
            # Astra A01: one defect per case, from the same complete parent.
            # These helper positives inject prior admissions; they grant none.
            for label, mutate in [
                ('schema_id', lambda d: d.__setitem__('schema_id', 'wrong.schema')),
                ('receipt_sha256', lambda d: d.__setitem__('recount_receipt_sha256', '0' * 64)),
                ('registered_extra_field', lambda d: d['rows'][0].__setitem__('extra', 'not allowed')),
            ]:
                outcomes(outcome_doc)
                bad = copy.deepcopy(outcome_doc)
                mutate(bad)
                record('negative_outcome_' + label, lambda bad=bad: outcomes(bad), True)
            for label, mutate in [
                ('missing_name', lambda d: d['rows'].pop()),
                ('duplicate_name', lambda d: d['rows'].__setitem__(1, copy.deepcopy(d['rows'][0]))),
                ('extra_name', lambda d: d['rows'].append({'event_type': 'foreign.name', 'outcome': 'registered'})),
                ('mixed_snapshot', lambda d: d.__setitem__('recount_list_sha256', '0' * 64)),
                ('unknown_outcome', lambda d: d['rows'][0].__setitem__('outcome', 'PASS')),
            ]:
                doc = copy.deepcopy(outcome_doc)
                mutate(doc)
                record('negative_outcome_' + label, lambda doc=doc: outcomes(doc), True)
            put(str(v.RECOUNT_OUTCOMES.relative_to(root)), encoded(outcome_doc))
            record('negative_missing_complete_admission_record', lambda: v.recount_outcomes(names, set(names[1:])), True)
            card_raw = ('Decision required: ' + names[0]).encode()
            card_path = 'reports/card.md'
            put(card_path, card_raw)
            doc = copy.deepcopy(outcome_doc)
            doc['rows'][0] = {'event_type': names[0], 'outcome': 'decision_card', 'card': {'path': card_path, 'sha256': sha(card_raw)}}
            record('negative_complete_card_still_unresolved', lambda: outcomes(doc), True, 'cards unresolved')
            bad = copy.deepcopy(doc)
            bad['rows'][0]['card']['sha256'] = '0' * 64
            record('negative_card_fingerprint', lambda: outcomes(bad), True, 'card fingerprint')
            # Cycle 5 B02: require the malformed-card diagnostic while the
            # independent terminal unresolved-card rule remains enabled.
            card_parent = copy.deepcopy(doc)
            card_alias = root / 'Plans/fixture-card.md'
            card_alias.symlink_to(root / card_path)
            try:
                for label, mutate, message in [
                    ('extra_row_key', lambda d: d['rows'][0].__setitem__('extra', 'not allowed'),
                     'recount decision card incomplete: '),
                    ('Plans_symlink_path', lambda d: d['rows'][0]['card'].__setitem__(
                        'path', 'Plans/fixture-card.md'), 'recount decision card path invalid: '),
                    ('extra_pin_key', lambda d: d['rows'][0]['card'].__setitem__(
                        'extra', 'not allowed'), 'recount decision card path invalid: '),
                    ('missing_event_name', lambda d: d['rows'][0]['card'].__setitem__(
                        'sha256', sha(b'Decision required.')), 'recount decision card fingerprint/name mismatch: '),
                ]:
                    bad = copy.deepcopy(card_parent)
                    mutate(bad)
                    def malformed_card(bad=bad, label=label):
                        put(card_path, card_raw)
                        try:
                            outcomes(card_parent)
                        except ValueError as exc:
                            assert str(exc) == 'recount decision cards unresolved: ' + json.dumps([names[0]])
                        else:
                            raise AssertionError('valid diagnostic card must remain unresolved')
                        if label == 'missing_event_name':
                            put(card_path, b'Decision required.')  # Observational SHA follows the bytes.
                        return outcomes(bad)
                    record('negative_card_' + label, malformed_card,
                           True, message + names[0])
            finally:
                card_alias.unlink()
                put(card_path, card_raw)
            # Existing exclusion vocabulary: own decision and exact hashed owner span.
            own_section = ('### DL-998: Exclusion for ' + names[0] + '\n\n' + names[0] + ' is excluded.\n\n').encode()
            decision_path = root / 'Plans/Decision_Log.md'
            decision_path.write_bytes(decision_path.read_bytes() + own_section)
            evidence_raw = (names[0] + ' has no live persisted writer.\n').encode()
            put('Plans/fixture-owner.md', evidence_raw)
            excluded = copy.deepcopy(outcome_doc)
            excluded['rows'][0] = {
                'event_type': names[0], 'outcome': 'excluded', 'disposition': 'RECLASSIFY_TO_EXCLUDED',
                'decision_ref': 'Plans/Decision_Log.md#DL-998',
                'decision_section_sha256': sha(own_section), 'rationale': 'Fixture own exclusion.',
                'source_citations': [{'path': 'Plans/fixture-owner.md', 'sha256': sha(evidence_raw), 'line_start': 1, 'line_end': 1}]}
            admitted_rest = set(names[1:])
            record('positive_exclusion_own_decision_and_evidence', lambda: outcomes(excluded, admitted_rest))
            # Cycle 5 B01: a reversed negative slice end can retain the event
            # token. Only line_end changes from this coherent two-line parent.
            two_line_raw = evidence_raw + b'Second evidence line.\n'
            two_line_parent = copy.deepcopy(excluded)
            two_line_parent['rows'][0]['source_citations'][0]['sha256'] = sha(two_line_raw)
            put('Plans/fixture-owner.md', two_line_raw)
            try:
                record('positive_exclusion_two_line_order_parent',
                       lambda: outcomes(two_line_parent, admitted_rest))
                bad = copy.deepcopy(two_line_parent)
                bad['rows'][0]['source_citations'][0]['line_end'] = -1
                record('negative_exclusion_line_end_negative', lambda: outcomes(bad, admitted_rest),
                       True, 'recount exclusion evidence fingerprint/span mismatch: ' + names[0])
            finally:
                put('Plans/fixture-owner.md', evidence_raw)
            for label, mutate in [
                ('extra_field', lambda d: d['rows'][0].__setitem__('extra', 'not allowed')),
                ('disposition', lambda d: d['rows'][0].__setitem__('disposition', 'KEEP_REGISTERED')),
                ('citation_extra_field', lambda d: d['rows'][0]['source_citations'][0].__setitem__('extra', 'not allowed')),
            ]:
                outcomes(excluded, admitted_rest)
                bad = copy.deepcopy(excluded)
                mutate(bad)
                record('negative_exclusion_' + label, lambda bad=bad: outcomes(bad, admitted_rest), True)

            alias = root / 'alias-owner.md'
            alias.symlink_to(root / 'Plans/fixture-owner.md')
            try:
                for label, mutate in [
                    ('decision_ref_grammar', lambda d: d['rows'][0].__setitem__('decision_ref', 'Wrong/Decision_Log.md#DL-998')),
                    ('lexical_Plans_prefix', lambda d: d['rows'][0]['source_citations'][0].__setitem__('path', 'alias-owner.md')),
                    ('line_end_boolean', lambda d: d['rows'][0]['source_citations'][0].__setitem__('line_end', True)),
                    ('line_start_zero', lambda d: d['rows'][0]['source_citations'][0].__setitem__('line_start', 0)),
                ]:
                    outcomes(excluded, admitted_rest)
                    bad = copy.deepcopy(excluded)
                    mutate(bad)
                    record('negative_exclusion_' + label, lambda bad=bad: outcomes(bad, admitted_rest), True)
            finally:
                alias.unlink()

            # Change the decision token alone; synchronize its observational hash.
            # Own-name source evidence and every other decision field stay valid.
            outcomes(excluded, admitted_rest)
            decision_raw = decision_path.read_bytes()
            sibling_section = own_section.replace(names[0].encode(), (names[0] + '.other').encode())
            bad = copy.deepcopy(excluded)
            bad['rows'][0]['decision_section_sha256'] = sha(sibling_section)
            try:
                decision_path.write_bytes(decision_raw[:-len(own_section)] + sibling_section)
                record('negative_exclusion_decision_dotted_sibling',
                       lambda: outcomes(bad, admitted_rest), True, 'decision fingerprint/name mismatch')
            finally:
                decision_path.write_bytes(decision_raw)

            outcomes(excluded, admitted_rest)
            prefixed_section = own_section.replace(names[0].encode(), ('x' + names[0]).encode())
            bad = copy.deepcopy(excluded)
            bad['rows'][0]['decision_section_sha256'] = sha(prefixed_section)
            try:
                decision_path.write_bytes(decision_raw[:-len(own_section)] + prefixed_section)
                record('negative_exclusion_decision_prefix', lambda: outcomes(bad, admitted_rest),
                       True, 'decision fingerprint/name mismatch')
            finally:
                decision_path.write_bytes(decision_raw)

            # The relative spelling, bytes, digest, span and name remain valid.
            # Only the resolved evidence location moves outside Plans.
            outcomes(excluded, admitted_rest)
            evidence_path = root / 'Plans/fixture-owner.md'
            outside = put('fixture-source-bytes/exclusion-owner.md', evidence_raw)
            evidence_path.unlink()
            try:
                evidence_path.symlink_to(outside)
                record('negative_exclusion_evidence_symlink_outside_Plans',
                       lambda: outcomes(excluded, admitted_rest), True, 'evidence escapes Plans')
            finally:
                evidence_path.unlink()
                evidence_path.write_bytes(evidence_raw)
            for label, spelling in [('prefix', 'x' + names[0]), ('suffix', names[0] + '_other'),
                                     ('dotted_sibling', names[0] + '.other')]:
                raw = (spelling + ' has no live persisted writer.\n').encode()
                put('Plans/fixture-owner.md', raw)
                bad = copy.deepcopy(excluded)
                bad['rows'][0]['source_citations'][0]['sha256'] = sha(raw)
                record('negative_exclusion_' + label, lambda bad=bad: outcomes(bad, admitted_rest),
                       True, 'evidence fingerprint/span mismatch')
            put('Plans/fixture-owner.md', evidence_raw)
            for label, mutate in [
                ('decision_sha', lambda d: d['rows'][0].__setitem__('decision_section_sha256', '0' * 64)),
                ('evidence_sha', lambda d: d['rows'][0]['source_citations'][0].__setitem__('sha256', '0' * 64)),
                ('citation_boolean', lambda d: d['rows'][0]['source_citations'][0].__setitem__('line_start', True)),
                ('citation_float', lambda d: d['rows'][0]['source_citations'][0].__setitem__('line_start', 1.0)),
                ('citation_span', lambda d: d['rows'][0]['source_citations'][0].__setitem__('line_end', 2)),
                ('missing_evidence', lambda d: d['rows'][0].__setitem__('source_citations', [])),
                ('missing_rationale', lambda d: d['rows'][0].__setitem__('rationale', '')),
            ]:
                bad = copy.deepcopy(excluded)
                mutate(bad)
                record('negative_exclusion_' + label, lambda bad=bad: outcomes(bad, admitted_rest), True)
            record('negative_registered_and_excluded_contradiction', lambda: outcomes(excluded), True, 'contradictory')
            def single_snapshot():
                for named in [{}, {'recount': {'complete': True}}, {'august_result_before_recount': {'pass': True}}]:
                    assert v.build_receipt(True, True, [], {}, {}, named, True)['pass'] is False
                named = {'recount': {'complete': True}, 'august_result_before_recount': {'pass': True}}
                assert v.build_receipt(True, True, [], {}, {}, named, True)['pass'] is True
                assert v.build_receipt(True, True, [{'error': 'anything'}], {}, {}, named, True)['pass'] is False
                assert v.build_receipt(False, True, [], {}, {}, named, True)['pass'] is False
            record('combined_result_boolean_and_single_snapshot_refusals', single_snapshot)
            named_parent = {'recount': {'complete': True}, 'august_result_before_recount': {'pass': True}}
            for label, index, field in [
                ('explicit_overall_false', 6, 'pass'), ('depth_false', 1, 'pass'),
                ('recount_false', None, 'pass'), ('August_false', None, 'pass'),
                ('denominator_observation_false', 0, 'complete_denominator_known'),
                ('depth_observation_false', 1, 'contract_depth_complete'),
            ]:
                args = [True, True, [], {}, {}, copy.deepcopy(named_parent), True]
                assert v.build_receipt(*args)[field] is True
                if index is not None:
                    args[index] = False
                elif label == 'recount_false':
                    args[5]['recount']['complete'] = False
                else:
                    args[5]['august_result_before_recount']['pass'] = False
                def refuses_false(args=args, field=field):
                    if v.build_receipt(*args)[field] is False:
                        raise ValueError('builder false ' + field)
                record('negative_builder_' + label, refuses_false, True)

            # Execute the actual main bytecode at its recount seam, supplying
            # a passing August result. Preserve the four production clauses and
            # their jumps; bypass only the earlier August computation and later
            # receipt I/O. No live approval run or executable file is changed.
            def main_flags(complete, august_values=None):
                code = v.main.__code__
                instructions = list(dis.get_instructions(v.main))
                start = next(i.offset for i in instructions if i.positions.lineno == 2241)
                stop = next(i.offset for i in instructions if i.positions.lineno == 2250)
                body = bytearray(code.co_code)
                body[:start] = bytes([dis.opmap['NOP'], 0]) * (start // 2)
                fields = ['complete_denominator_known', 'contract_depth_complete', 'overall_pass', 'named']
                tail = bytearray()
                for field in fields:
                    index = code.co_varnames.index(field)
                    assert index < 256
                    tail.extend([dis.opmap['LOAD_FAST'], index])
                tail.extend([dis.opmap['BUILD_TUPLE'], 4, dis.opmap['RETURN_VALUE'], 0])
                body[stop:] = tail
                seam = types.FunctionType(code.replace(co_code=bytes(body),
                    co_argcount=code.co_nlocals, co_posonlyargcount=0,
                    co_kwonlyargcount=0, co_exceptiontable=b''), v.main.__globals__)
                args = [None] * code.co_nlocals
                supplied = {'named': {'seal_prerequisites_met': True,
                                      'seal_prerequisites_blocking_errors': []},
                            'overall_pass': True, 'complete_denominator_known': True,
                            'contract_depth_complete': True, 'failures': [], 'post_august_admitted': set()}
                supplied.update(copy.deepcopy(august_values or {}))
                for field, value in supplied.items():
                    args[code.co_varnames.index(field)] = value
                old_recount = v.recount_validation
                v.recount_validation = lambda admitted: (
                    {'complete': complete}, [] if complete else
                    [{'error': 'recount_change_receipt_invalid', 'detail': 'fixture receipt invalid'}])
                try:
                    return dict(zip(fields, seam(*args)))
                finally:
                    v.recount_validation = old_recount
            for field in ['complete_denominator_known', 'contract_depth_complete', 'overall_pass', 'seal_prerequisites_met']:
                def value(flags):
                    return flags['named'][field] if field == 'seal_prerequisites_met' else flags[field]
                assert value(main_flags(True)) is True
                def refuses_incomplete(field=field):
                    flags = main_flags(False)
                    result = flags['named'][field] if field == 'seal_prerequisites_met' else flags[field]
                    if result is False:
                        raise ValueError('main refuses incomplete recount: ' + field)
                record('negative_main_incomplete_' + field, refuses_incomplete, True)

            for field in ['complete_denominator_known', 'contract_depth_complete', 'overall_pass', 'seal_prerequisites_met']:
                def refuses_August_false(field=field):
                    assert (main_flags(True)['named'][field] if field == 'seal_prerequisites_met'
                            else main_flags(True)[field]) is True
                    supplied = ({'named': {'seal_prerequisites_met': False,
                                           'seal_prerequisites_blocking_errors': []}}
                                if field == 'seal_prerequisites_met' else {field: False})
                    flags = main_flags(True, supplied)
                    result = flags['named'][field] if field == 'seal_prerequisites_met' else flags[field]
                    if result is False:
                        raise ValueError('main refuses false August input: ' + field)
                record('negative_main_August_' + field, refuses_August_false, True)

            # The aggregate's positive uses the real frozen sources, coherent
            # fourth receipt and complete helper outcomes with prior admissions.
            os.environ['PM_EA_RECOUNT_SOURCE_MAP'] = str(source_map)
            put(v.RECOUNT_RECEIPT, frozen_receipt)
            v.RECOUNT_RECEIPT_SHA = sha(frozen_receipt)
            put(v.RECOUNT_CHANGE, encoded(change))
            anchors()

            outcomes(outcome_doc)
            state, issues = v.recount_validation(set(names))
            assert state['complete'] is True and issues == [], (state, issues)
            bad = copy.deepcopy(outcome_doc)
            bad['schema_id'] = 'wrong.schema'
            put(str(v.RECOUNT_OUTCOMES.relative_to(root)), encoded(bad))
            def refuses_aggregate_input_issue():
                state, issues = v.recount_validation(set(names))
                if state['complete'] is False and len(issues) == 1 and issues[0]['error'] == 'recount_input_or_outcome_invalid':
                    raise ValueError('aggregate complete is false with its one input/outcome issue')
            record('negative_aggregate_input_issue', refuses_aggregate_input_issue, True)
            outcomes(outcome_doc)
            state, issues = v.recount_validation(set(names))
            assert state['complete'] is True and issues == [], (state, issues)
            bad = copy.deepcopy(change)
            bad['authority_ref'] = 'Plans/Decision_Log.md#DL-450'
            put(v.RECOUNT_CHANGE, encoded(bad))
            anchors()
            def refuses_aggregate_issue():
                state, issues = v.recount_validation(set(names))
                assert len(issues) == 1 and issues[0]['error'] == 'recount_change_receipt_invalid', issues
                if state['complete'] is False:
                    raise ValueError('aggregate complete is false with its one receipt issue')
            record('negative_aggregate_receipt_issue', refuses_aggregate_issue, True)
            put(v.RECOUNT_CHANGE, encoded(change))
            anchors()

            for label, path in [('parent', '../Plans/x'), ('absolute', '/etc/passwd'),
                                ('empty_segment', 'Plans//x'), ('dot_segment', 'Plans/./x'),
                                ('control', 'Plans/x\n/y'), ('DEL', 'Plans/x\x7f/y'), ('backslash', 'Plans\\x'), ('colon', 'git:bad')]:
                record('negative_unsafe_source_path_' + label, lambda path=path: v.recount_relative(path), True)
        finally:
            for key, value in original_env.items():
                if value is None: os.environ.pop(key, None)
                else: os.environ[key] = value
    record('positive_complete_predicate_coverage', lambda: check_coverage(repo, {r['name'] for r in results}))
    summary = {'status': 'pass' if all(r['pass'] for r in results) else 'fail', 'checks': len(results),
               'passed': sum(r['pass'] for r in results), 'failed': sum(not r['pass'] for r in results),
               'real_frozen_source_custody': custody, 'results': results,
               'limits': ['No final approval, admission, live seal or all-green August main run is claimed.',
                          'Outcome positives inject the existing admitted set; they do not create or waive admission records.',
                          'Guard-removal inventory belongs to the shared-tool sweep; no lane-local proof engine is claimed.']}
    output.write_text(json.dumps(summary, indent=2) + '\n')
    print(json.dumps({k: summary[k] for k in ['status', 'checks', 'passed', 'failed']}))
    for row in results:
        if not row['pass']: print(json.dumps(row))
    return 0 if summary['status'] == 'pass' else 1


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument('--source-map', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    raise SystemExit(run(args.repo.resolve(), args.out, args.source_map.resolve()))
