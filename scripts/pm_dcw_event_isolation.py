#!/usr/bin/env python3
"""Whole-pool DCW guard-removal proof. All mutations are confined to a module copy.

The fixture declares the precise guards/schema rules for each invariant. Removing
an unrelated guard is never an allowed repair. Missing-observation controls use
only their frozen valid precursor, as the existing missing-pack oracle does.
"""
import argparse
import ast
import collections
import copy
import inspect
import io
import hashlib
from contextlib import redirect_stdout
import json
import sys
from pathlib import Path
from types import ModuleType

import pm_dcw_event_oracles as original
import pm_bundle_revision_events as legacy
from pm_dcw_event_regressions import scenario
from jsonschema import Draft202012Validator
from jsonschema.exceptions import ValidationError

class OpaqueKey:
    # A non-string that can reach the codec's unsupported-scalar refusal after
    # its separate key-type guard is removed. No JSON/schema input can contain it.
    def encode(self, *args):
        return b'opaque-key'


ROOT = original.ROOT
PATH = ROOT / 'scripts/pm_dcw_event_oracles.py'


def schema_leaves(error):
    if error.validator in ('oneOf', 'anyOf') and error.context:
        groups = collections.defaultdict(list)
        for child in error.context:
            groups[tuple(child.relative_schema_path)[0]].append(child)
        # An invalid ref representation must not contribute errors when the
        # caller selected the otherwise-valid inline branch, or vice versa.
        alternatives = error.schema.get(error.validator, [])
        if (error.validator == 'oneOf' and isinstance(error.instance, dict) and
                any(branch.get('$ref') == '#/$defs/inline' for branch in alternatives)):
            selected = 1 if 'source_payload_ref' in error.instance else 0
            if selected in groups:
                return sum((schema_leaves(c) for c in groups[selected]), [])
        options = [sum((schema_leaves(c) for c in group), []) for group in groups.values()]
        return min(options, key=len)
    return [error]


def signature(path, definition, error):
    parts = [path, definition, list(error.absolute_schema_path), error.validator]
    if error.validator == 'required':
        parts.append(error.message)
    return json.dumps(parts, separators=(',', ':'))


class Probe:
    def __init__(self):
        self.disabled = set()
        self.schema_rules = set()
        self.failures = []
        self.schema_failures = []
        self.trace = []
        self.schema_cache = {}
        self.fallback = {}
        self.schema_defaults = []
        self.legacy_previous = None
        self.module = ModuleType('dcw_isolated_checker')
        self.module.__file__ = str(PATH)
        self.module.__dict__['_isolation'] = self
        source = ast.parse(PATH.read_text())
        probe = self

        class Instrument(ast.NodeTransformer):
            def visit_FunctionDef(self, node):
                previous = getattr(self, 'function', '')
                self.function = node.name
                result = self.generic_visit(node)
                self.function = previous
                return result

            def visit_Call(self, node):
                if isinstance(node.func, ast.Name) and node.func.id == 'require':
                    return ast.copy_location(ast.Call(
                        ast.Attribute(ast.Name('_isolation', ast.Load()), 'guard', ast.Load()),
                        [*node.args, ast.Constant(self.function + ':' + str(node.lineno))], node.keywords), node)
                return self.generic_visit(node)

            def visit_Raise(self, node):
                if (isinstance(node.exc, ast.Call) and isinstance(node.exc.func, ast.Name) and
                        node.exc.func.id == 'Refusal' and node.exc.args and
                        isinstance(node.exc.args[0], ast.Constant) and node.exc.args[0].value == 'codec_type'):
                    check = ast.Call(ast.Attribute(ast.Name('_isolation', ast.Load()), 'codec_fallback', ast.Load()),
                                     [ast.Name('value', ast.Load())], [])
                    return ast.copy_location(ast.If(check, [ast.Return(ast.Call(ast.Attribute(ast.Name('_isolation', ast.Load()), 'codec_bytes', ast.Load()), [ast.Name('value', ast.Load())], []))], [node]), node)
                return node

            def visit_Expr(self, node):
                transformed = self.generic_visit(node)
                call = node.value
                if not isinstance(call, ast.Call) or len(call.args) < 3 or not isinstance(call.args[1], ast.Constant):
                    return transformed
                code = call.args[1].value
                if code == 'codec_integer':
                    continuation = ast.parse("if _isolation.codec_fallback(value) and not 0 <= value <= 2**64 - 1: return b''").body[0]
                    return [transformed, ast.copy_location(continuation, node)]
                variable = {'event_payload_missing': 'payload', 'source_payload_missing': 'payload',
                            'original_custody_missing': 'custody' if self.function == 'original_receipt' else 'original_event',
                            'opened_original': 'opened', 'opened_source_missing': 'source'}.get(code)
                if self.function == 'original_receipt' and code == 'receipt_group' and node.lineno == 253:
                    variable = 'group'
                if self.function == 'bundle_source' and code == 'latest_source_event' and node.lineno == 304:
                    variable = 'matching'
                if variable is None:
                    return transformed
                site = self.function + ':' + str(node.lineno)
                assign = ast.parse(variable + ' = _isolation.absent(' + repr(site) + ', ' + repr(variable) + ', ' + variable + ', locals())').body[0]
                return [transformed, ast.copy_location(assign, node)]

        exec(compile(ast.fix_missing_locations(Instrument().visit(source)), str(PATH), 'exec'), self.module.__dict__)
        self.module.check_schema = self.schema
        tree = ast.parse(inspect.getsource(legacy.validate))

        class Legacy(ast.NodeTransformer):
            def visit_Assert(self, node):
                call = ast.Call(ast.Attribute(ast.Name('_isolation', ast.Load()), 'legacy_guard', ast.Load()),
                                [node.test, node.msg or ast.Constant(''), ast.Constant('legacy:' + str(node.lineno))], [])
                check = ast.copy_location(ast.Expr(call), node)
                if node.lineno == 22:
                    fallback = ast.parse("if 'legacy:22' in _isolation.disabled and previous is None: previous = _isolation.legacy_previous").body[0]
                    return [check, ast.copy_location(fallback, node)]
                return check

            def visit_Try(self, node):
                test = ast.Compare(ast.Constant('legacy:datetime_parse'), [ast.NotIn()],
                                   [ast.Attribute(ast.Name('_isolation', ast.Load()), 'disabled', ast.Load())])
                return ast.copy_location(ast.If(test, [node], []), node)

            def visit_Expr(self, node):
                if isinstance(node.value, ast.Call) and isinstance(node.value.func, ast.Attribute) and node.value.func.attr == 'validate':
                    return ast.copy_location(ast.Expr(ast.Call(ast.Attribute(ast.Name('_isolation', ast.Load()), 'schema', ast.Load()),
                        [ast.Subscript(ast.Name('row', ast.Load()), ast.Constant('schema'), ast.Load()), ast.Name('payload', ast.Load())], [])), node)
                return self.generic_visit(node)

        ns = dict(legacy.validate.__globals__, _isolation=self)
        exec(compile(ast.fix_missing_locations(Legacy().visit(tree)), '<DCW isolated legacy>', 'exec'), ns)
        self.validate = ns['validate']

    def guard(self, condition, code, site):
        self.trace.append(site)
        if not condition:
            self.failures.append(dict(site=site, code=code))
            if site in self.disabled or self.conditional(site, sys._getframe(1).f_locals):
                return
        self.module.require(condition, code)

    def codec_fallback(self, value):
        if type(value) is float:
            self.trace.append('canonical_msgpack:codec_type')
            self.failures.append(dict(site='canonical_msgpack:codec_type', code='codec_type'))
        return (('canonical_msgpack:codec_type:float' in self.disabled and type(value) is float) or
                ('canonical_msgpack:codec_type:integer' in self.disabled and type(value) is int) or
                ('canonical_msgpack:codec_type:key' in self.disabled and isinstance(value, OpaqueKey)))

    def codec_bytes(self, value):
        if type(value) is float:
            import msgpack
            return msgpack.packb(value)  # Named duplicate type-domain mutant only.
        return b''

    def conditional(self, site, local):
        if site + ':replay_only' in self.disabled:
            return local.get('policy') == 'projector_replay_only'
        if site + ':prepared' in self.disabled:
            return local.get('slot', {}).get('publication') == 'prepared'
        if site + ':snapshot' in self.disabled:
            return 'redb_snapshot_id' in local.get('reader', {}).get('durable_token', {})
        if site + ':duplicate_terminal' in self.disabled:
            row, payload, previous = local.get('row', {}), local.get('payload', {}), local.get('previous')
            return (row.get('phase') in ('completed', 'interrupted') and previous is not None and
                    previous.get('event_type') in ('bundle.revision_completed', 'bundle.revision_interrupted') and
                    payload.get('predecessor_event_id') == previous.get('predecessor_event_id'))
        return False

    def legacy_guard(self, condition, message, site):
        self.trace.append(site)
        if not condition:
            self.failures.append(dict(site=site, code=message))
            if site in self.disabled or self.conditional(site, sys._getframe(1).f_locals) or (site + ':replay_only' in self.disabled and
                    sys._getframe(1).f_locals.get('envelope', {}).get('replay_policy') == 'projector_replay_only'):
                return
        assert condition, message

    def schema(self, path, value, definition=None):
        key = json.dumps([path, definition, value], sort_keys=True, ensure_ascii=False)
        if key not in self.schema_cache:
            schema = self.module.load(path)
            if definition:
                schema = {'$ref': schema['$id'] + '#/$defs/' + definition}
            errors = list(Draft202012Validator(schema, registry=self.module.RESOURCES,
                                               format_checker=self.module.FORMAT).iter_errors(value))
            self.schema_cache[key] = errors
        errors = self.schema_cache[key]

        def active(error):
            rule = signature(path, definition, error)
            if rule in self.schema_rules:
                return False
            if error.validator in ('oneOf', 'anyOf') and error.context:
                groups = collections.defaultdict(list)
                for child in error.context:
                    groups[tuple(child.relative_schema_path)[0]].append(child)
                if any(not any(active(c) for c in group) for group in groups.values()):
                    return False
            return True

        pending = [e for e in errors if active(e)]
        if pending:
            self.schema_failures = [signature(path, definition, leaf) for error in pending for leaf in schema_leaves(error)]
            raise self.module.Refusal('schema')
        for default in self.schema_defaults:
            if path == default['path'] and definition == default.get('definition') and default['field'] not in value:
                value[default['field']] = copy.deepcopy(default['value'])

    def absent(self, site, variable, value, local):
        if site not in self.disabled or (type(value) is dict if variable == 'source' else value):
            return value
        # Removing a fail-closed absence predicate also needs a defined resolver
        # continuation. The positive's exact observation supplies that continuation;
        # no other field, guard or negative input is repaired.
        if variable == 'matching':
            return [local['source']['phases'][-1]]
        if variable == 'source':
            return copy.deepcopy(self.fallback['opened_source'])
        if variable == 'custody':
            return copy.deepcopy(self.fallback.get('custody', {}).get(local['event']['event_id']))
        if variable == 'group':
            return copy.deepcopy(self.fallback.get('durable_groups', {}).get(local['receipt']['commit_group_id']))
        if variable == 'opened':
            event_id = local['p']['predecessor_event_id']
            value = copy.deepcopy(self.fallback.get('events', {}).get(event_id))
            if value is not None:
                local['authority']['events'][event_id] = copy.deepcopy(value)
            return value
        if variable == 'original_event':
            event_id = local['event']['event_id']
            value = copy.deepcopy(self.fallback.get('events', {}).get(event_id))
            if value is not None:
                local['authority']['events'][event_id] = copy.deepcopy(value)
            return value
        kind = 'event_payloads' if site.startswith('event_body:') else 'payloads'
        return copy.deepcopy(self.fallback.get(kind, {}).get(local['ref']['blake3']))

    def outcome(self, row, value, operation):
        self.failures.clear(); self.schema_failures.clear(); self.trace.clear()
        try:
            actual = self.module.verify(row, copy.deepcopy(value), operation, self.validate)
        except self.module.Refusal as exc:
            actual = str(exc)
        except (AssertionError, ValidationError) as exc:
            actual = type(exc).__name__ + ': ' + str(exc).splitlines()[0]
        except Exception as exc:
            actual = type(exc).__name__ + ': ' + str(exc).splitlines()[0]
        return actual


def guard_inventory(p, cases, table, supplemental):
    sites = []
    class Inventory(ast.NodeVisitor):
        def __init__(self):
            self.function = ''
        def visit_FunctionDef(self, node):
            old = self.function; self.function = node.name
            self.generic_visit(node); self.function = old
        def visit_Call(self, node):
            if isinstance(node.func, ast.Name) and node.func.id == 'require':
                sites.append(dict(site=self.function + ':' + str(node.lineno), code=ast.unparse(node.args[1])))
            self.generic_visit(node)
    Inventory().visit(ast.parse(PATH.read_text()))
    result = []
    for site in sites:
        witnesses = [i for i, entry in enumerate(table) if entry['after'] == 'accept' and
                     any(f['site'] == site['site'] for f in entry['remaining'])]
        extra = [s for s in supplemental if s['guard'] == site['site'] and s['passed']]
        row = dict(**site, witnesses=[table[i]['family'] + '/' + table[i]['case'] for i in witnesses],
                   supplemental=[s['family'] + '/' + s['case'] for s in extra],
                   passed=bool(witnesses or extra))
        if witnesses:
            i = witnesses[0]; entry = table[i]
            primary = entry['failure'][-1]['site'] if entry['failure'] else None
            if primary != site['site']:
                alone = entry['baseline']
            else:
                p.disabled = {site['site']}; p.schema_rules = set(); p.schema_defaults = []
                p.fallback = copy.deepcopy(entry['fallback'])
                owner, case, value, _ = cases[i]
                alone = p.outcome(owner, value, case['operation'])
            row.update(single_removal=alone, paired_removal=entry['after'],
                       duplicate_guards=[g for g in entry['guards'] if g != site['site']],
                       duplicate_schema_rules=entry['schema_rules'],
                       duplicate_reason=entry['duplicate_reason'])
        elif extra:
            row.update(single_removal=extra[0].get('single_removal', extra[0]['after']),
                       paired_removal=extra[0]['after'], duplicate_guards=extra[0].get('duplicates', []),
                       duplicate_schema_rules=[])
        result.append(row)
    return result


def supplement(p, fixture, family=None):
    results = []
    real_load = p.module.load
    p.schema_defaults = []; p.schema_rules = set(); p.fallback = {}
    registry = copy.deepcopy(real_load('Plans/storage_value_registry.json'))
    # The codec domain guards duplicate the unsupported-domain fallback. Only
    # the same invalid type receives a defined sentinel continuation in the
    # mutant; floats/objects and the other codec negatives still refuse.
    codec_cases = [('negative_integer', -1, 'canonical_msgpack:116', 'integer'),
                   ('overflow_integer', 2**64, 'canonical_msgpack:116', 'integer'),
                   ('non_string_key', {OpaqueKey(): 'value'}, 'canonical_msgpack:128', 'key'),
                   ('float', 0.5, None, None), ('unsupported_object', object(), None, None)]
    def encoded(value):
        try:
            p.module.canonical_msgpack(value)
            return 'accept'
        except p.module.Refusal as exc:
            return str(exc)
        except (ValueError, TypeError) as exc:
            return type(exc).__name__ + ': ' + str(exc)
    p.disabled = set()
    baselines = {name: encoded(value) for name, value, _, _ in codec_cases}
    for name, value, site, kind in codec_cases:
        if site is None:
            continue
        p.disabled = {site}
        alone = encoded(value)
        p.disabled.add('canonical_msgpack:codec_type:' + kind)
        paired = encoded(value)
        rejected = {other: encoded(v) for other, v, _, other_kind in codec_cases if other_kind != kind}
        results.append(dict(family='codec domain', case=name, guard=site,
                            duplicates=['native packing/unsupported scalar refusal for the same ' + kind + ' domain'],
                            baseline=baselines[name], single_removal=alone, after=paired,
                            others_rejected=rejected, passed=paired == 'accept' and
                            all(result != 'accept' for result in rejected.values())))
    for row in (r for r in fixture['families'] if family is None or r['event_type'] == family):
        for field, value in [('redb_file', 'derived'), ('storage_group', 'foreign'), ('max_value_bytes', 16385)]:
            changed = copy.deepcopy(registry)
            changed['storage_profile']['family_profiles'][row['source_family']][field] = value
            p.module.load = lambda path, changed=changed: changed if path == 'Plans/storage_value_registry.json' else real_load(path)
            p.disabled = set()
            baseline = p.outcome(row, row['positive'], 'publish')
            p.disabled = {'source_storage:381'}
            after = p.outcome(row, row['positive'], 'publish')
            results.append(dict(family=row['event_type'], case='profile_' + field, guard='source_storage:381',
                                baseline=baseline, after=after, passed=baseline == 'source_storage_profile' and after == 'accept'))
    # Complete-runner input gates. Restrict the synthetic authored pool to one
    # valid retry per family; the runner's generated required-field negatives,
    # schema preflight, source binding and actual full verify path still run.
    short = copy.deepcopy(fixture)
    for row in short['families']:
        row['cases'] = [next(c for c in row['cases'] if c['case_id'] == 'valid_retry')]
    def runner(rows, reg, disabled):
        p.disabled = set(disabled); p.schema_rules = set(); p.schema_defaults = []
        p.module.load = lambda path: (rows if path == 'Plans/dcw_event_contract_fixtures.json' else
                                     reg if path == 'Plans/storage_value_registry.json' else real_load(path))
        try:
            with redirect_stdout(io.StringIO()):
                p.module.run(p.validate, family)
            return 'accept'
        except p.module.Refusal as exc:
            return str(exc)
    for row in (r for r in fixture['families'] if family is None or r['event_type'] == family):
        changed = copy.deepcopy(short)
        changed['families'] = [r for r in changed['families'] if r['event_type'] != row['event_type']]
        before = runner(changed, registry, [])
        after = runner(changed, registry, ['run:549'])
        results.append(dict(family=row['event_type'], case='missing_family', guard='run:549',
                            baseline=before, after=after, passed=before == 'family_inventory' and after == 'accept'))
        for field, value, code, site in [('status', 'deferred', 'materialized_source', 'run:557'),
                                        ('value_schema_ref', 'foreign-schema', 'materialized_source', 'run:557'),
                                        ('backup_required', False, 'original_backup_contract', 'run:558')]:
            changed = copy.deepcopy(registry)
            source = next(s for s in changed['families'] if s['family_id'] == row['source_family'])
            if field == 'backup_required':
                source['recovery_disposition'][field] = value
            else:
                source[field] = value
            before = runner(short, changed, [])
            after = runner(short, changed, [site])
            results.append(dict(family=row['event_type'], case=field, guard=site, baseline=before,
                                after=after, passed=before == code and after == 'accept'))
    p.module.load = real_load; p.disabled = set()
    return results


def audit(author=False, family=None):
    fixture = original.load('Plans/dcw_event_contract_fixtures.json')
    p = Probe(); cases = []; table = []; unexpected = []
    for row in (r for r in fixture['families'] if family is None or r['event_type'] == family):
        generated = []
        # The complete runner also generates these exact single-field omissions.
        # The mutant removes the required-property rule and its downstream
        # availability precondition, continuing from the frozen positive value.
        for kind, body, prefix, schema_path in [
            ('payload', row['positive']['event']['payload'], '/event/payload/', row['schema']),
            ('envelope', row['positive']['event'], '/event/', 'Plans/event_record.schema.json'),
        ]:
            for field, value in body.items():
                generated.append(dict(case_id='generated_missing_' + kind + '_' + field,
                    operation='publish', expected='schema', mutations=[dict(path=prefix + field, op='remove')],
                    isolation=dict(guards=[], schema_rules=[], schema_defaults=[dict(path=schema_path, field=field, value=value)],
                                   duplicate_reason='Required property and downstream field availability; the mutation control resolves only that missing field from its frozen valid original.')))
        from pm_dcw_event_fixtures import writer_policy_fixture
        from pm_dcw_event_numeric_cases import cases as numeric_cases
        for valid_case in [*row['cases'], *numeric_cases(row)]:
            if valid_case['expected'] != 'accept' or valid_case['operation'] not in ('append', 'publish', 'retry'):
                continue
            valid_value = copy.deepcopy(valid_case['_value']) if '_value' in valid_case else scenario(row, valid_case)
            value = copy.deepcopy(valid_value)
            writer_policy_fixture(row, value)
            generated.append(dict(case_id='generated_event_policy_' + valid_case['case_id'],
                operation=valid_case['operation'], expected='replay_only_not_appendable', _value=value,
                isolation=dict(guards=['writer_policy:76', 'writer_policy:77:replay_only', 'legacy:17:replay_only'],
                               duplicate_reason='Reader-only exclusion and exact writer-policy admission repeat one policy invariant; original observations stay coherent.')))
            if valid_case['operation'] == 'retry':
                value = copy.deepcopy(valid_value)
                value.setdefault('retry_request', copy.deepcopy(value['event']))['replay_policy'] = 'projector_replay_only'
                generated.append(dict(case_id='generated_caller_policy_' + valid_case['case_id'],
                    operation='retry', expected='replay_only_not_appendable', _value=value,
                    isolation=dict(guards=['writer_policy:76', 'writer_policy:77:replay_only'],
                                   duplicate_reason='Only the incoming caller policy changes; its two admission guards repeat that predicate.')))
        from pm_dcw_event_numeric_cases import cases as numeric_cases
        for case in [*row['cases'], *generated, *numeric_cases(row)]:
            value = copy.deepcopy(case['_value']) if '_value' in case else scenario(row, case)
            p.disabled.clear(); p.schema_rules.clear(); p.schema_defaults = []
            actual = p.outcome(row, value, case['operation'])
            assert actual == case['expected'], (row['event_type'], case['case_id'], case['expected'], actual)
            if actual == 'accept':
                continue
            entry = dict(family=row['event_type'], case=case['case_id'], baseline=actual,
                         trace=list(p.trace), failure=copy.deepcopy(p.failures), schema=list(p.schema_failures))
            if case['case_id'].startswith('generated_missing_'):
                case['isolation']['schema_rules'] = list(p.schema_failures)
            cases.append((row, case, value, entry))
    for row, case, value, entry in cases:
        config = case.get('isolation', {})
        p.disabled = set(config.get('guards', ()))
        p.schema_rules = set(config.get('schema_rules', ()))
        p.schema_defaults = copy.deepcopy(config.get('schema_defaults', []))
        p.fallback = copy.deepcopy(row['positive']['authority'])
        p.fallback.update(copy.deepcopy(case.get('_fallback_authority', {})))
        if 'event_bytes' in case:
            valid = dict(case); valid.pop('event_defect', None); valid['mutations'] = []
            p.fallback.update(scenario(row, valid)['authority'])
        if 'source_bytes' in case:
            valid = dict(case, mutations=[], payload_body_mutations=[])
            p.fallback.update(scenario(row, valid)['authority'])
        if author and not p.disabled and not p.schema_rules:
            if entry['failure']:
                p.disabled.add(entry['failure'][-1]['site'])
            else:
                p.schema_rules.update(entry['schema'])
        actual = p.outcome(row, value, case['operation'])
        entry.update(guards=sorted(p.disabled), schema_rules=sorted(p.schema_rules), after=actual,
                     remaining=copy.deepcopy(p.failures), remaining_schema=list(p.schema_failures),
                     schema_defaults=copy.deepcopy(p.schema_defaults), fallback=copy.deepcopy(p.fallback),
                     duplicate_reason=config.get('duplicate_reason', ''))
        table.append(entry)
    cross = []
    configurations = {}
    for i, entry in enumerate(table):
        key = json.dumps([entry['family'], entry['guards'], entry['schema_rules'], entry['schema_defaults']], sort_keys=True)
        configurations.setdefault(key, i)
    for key, i in configurations.items():
        owner = table[i]
        p.disabled = set(owner['guards']); p.schema_rules = set(owner['schema_rules'])
        p.schema_defaults = copy.deepcopy(owner['schema_defaults']); p.fallback = copy.deepcopy(owner['fallback'])
        disabled_sites = {':'.join(s.split(':')[:2]) for s in p.disabled}
        flips = []; rejected = []; changed = []; unrelated = []
        for row, case, value, entry in cases:
            if row['event_type'] != owner['family']:
                continue
            first = entry['failure'][-1]['site'] if entry['failure'] else None
            affected = first in disabled_sites or bool(set(entry['schema']) & p.schema_rules)
            if not affected:
                rejected.append(case['case_id'])
                continue
            actual = p.outcome(row, value, case['operation'])
            if actual == 'accept':
                flips.append(case['case_id'])
                aliases = {frozenset(pair) for pair in [
                    ('schema', 'restore_members'), ('schema', 'source_payload_digest'),
                    ('schema', 'event_payload_digest'), ('schema', 'scope'),
                    ('source_identity', 'source_phase_identity'),
                    ('reader_effect_forbidden', 'effect_not_authorized'),
                    # Exact named SP-278 duplicates. These configurations still
                    # execute every other guard, and list every flipped ID.
                    ('index_row_source', 'index_row_digest'),
                    ('index_coverage', 'index_row_membership'),
                    ('index_currentness', 'index_source_binding'),
                    ('schema', 'index_source_coverage'),
                    ('restore_epoch', 'index_recovery_epoch'),
                ]}
                # These schema/type checks deliberately duplicate the exact
                # original-value or descriptor guard named in the configuration.
                # Its older witnesses therefore flip for that SAME invariant.
                named_numeric_duplicates = {
                    'round6_original_sequence_': ['original_full_value'],
                    'round6_custody_sequence_': ['receipt_event_sequence', 'original_receipt_equality'],
                    'round6_descriptor_': ['event_payload_reference_encoding'],
                    'round7_opened_prepared_sequence_': ['latest_source_event'],
                    'round7_opened_foreign_request_project_': ['original_request'],
                }
                for prefix, codes in named_numeric_duplicates.items():
                    if owner['case'].startswith(prefix):
                        if prefix == 'round7_opened_foreign_request_project_':
                            aliases.add(frozenset(('current_child_join', 'original_request')))
                        aliases.update(frozenset(('schema', code)) for code in codes)
                if owner['baseline'] != entry['baseline'] and frozenset((owner['baseline'], entry['baseline'])) not in aliases:
                    unrelated.append(case['case_id'])
            else:
                rejected.append(case['case_id'])
                if actual != entry['baseline']:
                    own_guards = {':'.join(s.split(':')[:2]) for s in entry['guards']}
                    own_reason = (bool(p.failures) and p.failures[-1]['site'] in own_guards) or bool(
                        set(p.schema_failures) & set(entry['schema_rules']))
                    changed.append(dict(case=case['case_id'], baseline=entry['baseline'], after=actual,
                                        still_own_invariant=own_reason))
        cross.append(dict(family=owner['family'], guards=owner['guards'], schema_rules=owner['schema_rules'],
                          schema_defaults=owner['schema_defaults'], flips=flips, rejected=rejected,
                          changed_refusals=changed, unrelated_acceptances=unrelated))
    supplemental = supplement(p, fixture, family)
    inventory = guard_inventory(p, cases, table, supplemental)
    reached = {site for entry in table for site in entry['trace']}
    for guard in inventory:
        guard['applicable'] = family is None or guard['site'] in reached or bool(guard['supplemental'])
    for entry in table:
        entry.pop('fallback')
    healthy = (all(e['after'] == 'accept' for e in table) and
               not any(not r['still_own_invariant'] for c in cross for r in c['changed_refusals']) and
               not any(c['unrelated_acceptances'] for c in cross) and all(s['passed'] for s in supplemental))
    complete = all(g['passed'] for g in inventory)
    # A family run cannot prove a shared site's witness owned by another family.
    # It remains explicitly partial until the lane aggregate proves EVERY site.
    status = 'PASS' if healthy and complete else ('PARTIAL' if healthy and family is not None else 'FAIL')
    result = dict(status=status, coverage_scope=family or 'whole_lane', complete_guard_coverage=complete,
                  production_source_sha256=hashlib.sha256(PATH.read_bytes()).hexdigest(),
                  fixtures_sha256=hashlib.sha256((ROOT / 'Plans/dcw_event_contract_fixtures.json').read_bytes()).hexdigest(),
                  require_sites=len(inventory), proved_require_sites=sum(g['passed'] for g in inventory),
                  unproved_require_sites=[g['site'] for g in inventory if g['applicable'] and not g['passed']],
                  negatives=len(table), flipped=sum(e['after'] == 'accept' for e in table),
                  configurations=len(cross), cross_tests=sum(len(c['flips']) + len(c['rejected']) for c in cross),
                  changed_refusals=sum(len(c['changed_refusals']) for c in cross),
                  unrelated_changed_refusals=sum(not r['still_own_invariant'] for c in cross for r in c['changed_refusals']),
                  unrelated_acceptances=sum(len(c['unrelated_acceptances']) for c in cross), table=table, cross=cross, supplemental=supplemental, guard_inventory=inventory,
                  noninterference='A pure passing or unreached guard cannot alter the baseline refusal. Every negative whose first failing guard/schema rule is removed is executed again; all others retain the identical earlier refusal trace.')
    return result


def merge_reports(paths):
    """Require complete lane coverage from six sequential family proofs.

    A selected-family proof is intentionally PARTIAL for global guard coverage.
    This merge refuses omitted families, corpus rows, sites or cross-test IDs;
    it does not execute another family or weaken any production predicate.
    """
    from pm_dcw_event_numeric_cases import cases as numeric_cases
    fixtures = original.load('Plans/dcw_event_contract_fixtures.json')['families']
    expected_families = {row['event_type'] for row in fixtures}
    reports = [json.loads(path.read_text()) for path in paths]
    assert len(reports) == len(expected_families)
    assert {p['coverage_scope'] for p in reports} == expected_families
    source_sha = hashlib.sha256(PATH.read_bytes()).hexdigest()
    fixture_sha = hashlib.sha256((ROOT / 'Plans/dcw_event_contract_fixtures.json').read_bytes()).hexdigest()
    inventory = {}
    all_table = []; all_cross = []; supplemental = []
    for row in fixtures:
        p = next(p for p in reports if p['coverage_scope'] == row['event_type'])
        assert p['status'] in ('PASS', 'PARTIAL')
        assert p['production_source_sha256'] == source_sha and p['fixtures_sha256'] == fixture_sha
        authored = [*row['cases'], *numeric_cases(row)]
        expected_ids = {c['case_id'] for c in authored if c['expected'] != 'accept'}
        for kind, body in [('payload', row['positive']['event']['payload']), ('envelope', row['positive']['event'])]:
            expected_ids.update('generated_missing_' + kind + '_' + key for key in body)
        for case in authored:
            if case['expected'] == 'accept' and case['operation'] in ('append', 'publish', 'retry'):
                expected_ids.add('generated_event_policy_' + case['case_id'])
                if case['operation'] == 'retry':
                    expected_ids.add('generated_caller_policy_' + case['case_id'])
        assert len(p['table']) == p['negatives'] == p['flipped'] == len(expected_ids)
        assert {e['case'] for e in p['table']} == expected_ids
        assert all(e['family'] == row['event_type'] and e['after'] == 'accept' for e in p['table'])
        assert all(s['passed'] for s in p['supplemental'])
        for cross in p['cross']:
            assert cross['family'] == row['event_type']
            assert set(cross['flips']).isdisjoint(cross['rejected'])
            assert set(cross['flips']) | set(cross['rejected']) == expected_ids
            assert not cross['unrelated_acceptances']
            assert all(r['still_own_invariant'] for r in cross['changed_refusals'])
        for guard in p['guard_inventory']:
            prior = inventory.get(guard['site'])
            if prior is None or (guard['passed'] and not prior['passed']):
                inventory[guard['site']] = copy.deepcopy(guard)
        all_table.extend(p['table']); all_cross.extend(p['cross']); supplemental.extend(p['supplemental'])
    # Inventory is extracted afresh, so an old export cannot hide a new guard.
    class Sites(ast.NodeVisitor):
        def __init__(self):
            self.function = ''; self.found = set()
        def visit_FunctionDef(self, node):
            previous = self.function; self.function = node.name
            self.generic_visit(node); self.function = previous
        def visit_Call(self, node):
            if isinstance(node.func, ast.Name) and node.func.id == 'require':
                self.found.add(self.function + ':' + str(node.lineno))
            self.generic_visit(node)
    sites = Sites(); sites.visit(ast.parse(PATH.read_text()))
    assert set(inventory) == sites.found and all(g['passed'] for g in inventory.values())
    return dict(status='PASS', coverage_scope='whole_lane', complete_guard_coverage=True,
                production_source_sha256=source_sha, fixtures_sha256=fixture_sha,
                require_sites=len(inventory), proved_require_sites=len(inventory), unproved_require_sites=[],
                negatives=len(all_table), flipped=len(all_table), configurations=len(all_cross),
                cross_tests=sum(len(c['flips']) + len(c['rejected']) for c in all_cross),
                changed_refusals=sum(len(c['changed_refusals']) for c in all_cross),
                unrelated_changed_refusals=0, unrelated_acceptances=0,
                table=all_table, cross=all_cross, supplemental=supplemental, guard_inventory=list(inventory.values()),
                inputs=[dict(path=str(path), sha256=hashlib.sha256(path.read_bytes()).hexdigest()) for path in paths],
                noninterference='Six sequential family proofs; complete corpus, site inventory and every named flip/reject complement verified before accepting the lane aggregate.')


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--output', type=Path, required=True)
    ap.add_argument('--author-diagnostics', action='store_true')
    ap.add_argument('--family', choices=[r['event_type'] for r in original.load('Plans/dcw_event_contract_fixtures.json')['families']])
    ap.add_argument('--merge', nargs=6, type=Path, metavar='FAMILY_REPORT')
    args = ap.parse_args()
    assert not args.merge or (not args.family and not args.author_diagnostics)
    result = merge_reports(args.merge) if args.merge else audit(args.author_diagnostics, args.family)
    args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({k: v for k, v in result.items() if k not in ('table', 'cross', 'supplemental', 'guard_inventory')}))
    sys.exit(0 if result['status'] in ('PASS', 'PARTIAL') else 1)
