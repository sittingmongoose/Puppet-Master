#!/usr/bin/env python3
"""Read-only DF guard-removal controls. Mutants exist only in memory.

Schema ingress, primitive predicates, complete materialization, payload resolution
and protocol steps are reported separately. Integration traces retain the full
unmodified checker; a prerequisite exception is never counted as acceptance.
"""
from __future__ import annotations
import argparse
import builtins
import ast
import copy
import hashlib
import json
import re
from collections import defaultdict
from contextlib import contextmanager
from pathlib import Path
from types import SimpleNamespace

from jsonschema import Draft202012Validator, FormatChecker
import pm_filesafe_event_authority as authority
import pm_filesafe_event_contracts as payload
import pm_filesafe_schema_graph as graph_owner

ROOT = Path(__file__).resolve().parents[1]


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False).encode()).hexdigest()


class Mutants(ast.NodeTransformer):
    """Remove one actual refusal predicate; preserve every other source byte/AST."""
    def __init__(self, module):
        self.module = module
        self.function = ''
        self.sites = {}
        self.disabled = None
        self.observed = {}
        self.executed = defaultdict(set)

    def accept(self, key, valid, site=None):
        if site is not None:
            self.executed[site].add(key)
        removed = (self.disabled,) if isinstance(self.disabled, str) else (self.disabled or ())
        result = True if key in removed else bool(valid)
        self.observed[key] = self.observed.get(key, True) and result
        return result

    def deny(self, key, invalid):
        return not self.accept(key, not invalid)

    def visit_FunctionDef(self, node):
        old = self.function
        if node.name != 'require':
            self.function = node.name
        self.generic_visit(node)
        self.function = old
        return node

    def visit_Call(self, node):
        self.generic_visit(node)
        if (self.function == 'application_original_failures' and isinstance(node.func, ast.Attribute)
            and isinstance(node.func.value, ast.Name) and node.func.value.id == 'failures' and node.func.attr == 'append'
            and ast.unparse(node.args[0]).startswith(("'application_body_role'", "'application_body_decode:"))):
            key = ast.BinOp(ast.Constant('authority:reported:'), ast.Add(), node.args[0])
            return ast.Call(ast.Name('_report', ast.Load()), [key, ast.Name('failures', ast.Load()), node.args[0]], [])
        if isinstance(node.func, ast.Name) and node.func.id == 'require':
            code = node.args[1]
            prefix = 'application_' if self.function == 'application_original_failures' else ''
            key = ast.BinOp(ast.Constant(self.module + ':require:' + prefix), ast.Add(), code)
            site = self.module + ':require-site:' + self.function + ':' + str(node.lineno)
            node.args[0] = ast.Call(ast.Name('_accept', ast.Load()), [key, node.args[0], ast.Constant(site)], [])
            self.sites[site] = ast.unparse(code)
        return node

    def visit_If(self, node):
        self.generic_visit(node)
        # Only immediate refusal returns. Dispatch branches are not guards.
        returned = [s.value for s in node.body if isinstance(s, ast.Return)]
        failure = False
        for value in returned:
            if isinstance(value, ast.Constant):
                failure |= value.value is False
                if isinstance(value.value, str):
                    failure |= value.value not in {
                        'original_history_no_effect', 'original_terminal',
                        'reader_fenced', 'writer_fenced', 'crashed_no_new_effect',
                        'retained_survivors_verified', 'reader_generation_published',
                    } or ast.unparse(node.test) == 'self.writer_fenced'
            elif isinstance(value, ast.List):
                failure |= bool(value.elts)
            elif isinstance(value, ast.Tuple):
                failure |= len(value.elts) == 2 and isinstance(value.elts[1], ast.List) and bool(value.elts[1].elts)
        if self.function == 'graph_failures' and any(isinstance(s, ast.Expr) and isinstance(s.value, ast.Call) and isinstance(s.value.func, ast.Attribute) and s.value.func.attr == 'append' for s in node.body):
            failure = True
        if self.function in ('decode_original', 'take', 'read') and any(isinstance(s, ast.Raise) for s in node.body):
            failure = True
        if failure:
            key = self.module + ':' + self.function + ':' + str(node.lineno)
            self.sites[key] = ast.unparse(node.test)
            node.test = ast.Call(ast.Name('_deny', ast.Load()), [ast.Constant(key), node.test], [])
        return node

    def visit_Raise(self, node):
        if (self.function == 'read' and isinstance(node.exc, ast.Call) and node.exc.args
            and isinstance(node.exc.args[0], ast.Constant) and node.exc.args[0].value == 'unsupported MessagePack type'):
            key = self.module + ':read:unsupported_tag'
            self.sites[key] = 'unsupported MessagePack type'
            return ast.Return(ast.Call(ast.Name('_tag_error', ast.Load()), [ast.Constant(key)], []))
        return node

    def tag_error(self, key):
        if self.accept(key, False): return None
        raise ValueError('unsupported MessagePack type')

    def visit_Return(self, node):
        self.generic_visit(node)
        if self.function in ('override_subset', 'coverage_valid') and not isinstance(node.value, ast.Constant):
            key = self.module + ':' + self.function + ':' + str(node.lineno)
            self.sites[key] = ast.unparse(node.value)
            node.value = ast.Call(ast.Name('_accept', ast.Load()), [ast.Constant(key), node.value], [])
        return node

    def visit_IfExp(self, node):
        self.generic_visit(node)
        if self.function in ('resolve_issued', 'retention_binding_failures'):
            key = self.module + ':' + self.function + ':' + str(node.lineno)
            self.sites[key] = ast.unparse(node.test)
            node.test = ast.Call(ast.Name('_deny', ast.Load()), [ast.Constant(key), node.test], [])
        return node

    def visit_ExceptHandler(self, node):
        self.generic_visit(node)
        if self.function == 'event_payload':
            for statement in node.body:
                if isinstance(statement, ast.Return):
                    key = self.module + ':payload_reference_unavailable'
                    self.sites[key] = 'typed reference bytes unavailable or noncanonical'
                    statement.value = ast.Call(ast.Name('_unavailable', ast.Load()),
                                               [ast.Constant(key), statement.value], [])
        return node

    def report(self, key, failures, code):
        if not self.accept(key, False): failures.append(code)

    def unavailable(self, key, result):
        return (None, []) if self.accept(key, False) else result

    def compile(self, source, names):
        tree = ast.parse(source)
        tree.body = [n for n in tree.body if isinstance(n, (ast.FunctionDef, ast.ClassDef)) and n.name in names]
        tree = self.visit(tree)
        ast.fix_missing_locations(tree)
        namespace = dict(authority.__dict__ if self.module == 'authority' else payload.__dict__)
        namespace.update(_accept=self.accept, _deny=self.deny, _unavailable=self.unavailable, _report=self.report, _tag_error=self.tag_error)
        exec(compile(tree, '<DF single-guard mutant>', 'exec'), namespace)
        return namespace


class CachedValidator:
    """Cache only immutable ingress validations during semantic matrix rows."""
    cache = {}
    schema_mutation_active = False
    failed_keywords = set()
    keyword_guard = None
    registry_families = {}
    affected_families = set()
    checked_schemas = set()
    @staticmethod
    def check_schema(schema):
        key = digest(schema)
        if key not in CachedValidator.checked_schemas:
            Draft202012Validator.check_schema(schema)
            CachedValidator.checked_schemas.add(key)
    def __init__(self, schema, *args, **kwargs):
        self.inner = Draft202012Validator(schema, *args, **kwargs)
        self.key = (digest(schema), id(kwargs.get('registry')))
        self.family = self.registry_families.get(id(kwargs.get('registry')))
    def __getattr__(self, name):
        return getattr(self.inner, name)
    def iter_errors(self, value):
        key = (self.key, digest(value))
        if key in self.cache and (not self.schema_mutation_active or (self.family is not None and self.family not in self.affected_families)):
            return iter(self.cache[key])
        errors = tuple(self.inner.iter_errors(value))
        def record(error):
            if CachedValidator.keyword_guard is not None:
                key = CachedValidator.keyword_guard(error)
                if key is not None: CachedValidator.failed_keywords.add(key)
            for child in error.context: record(child)
        for error in errors: record(error)
        # A cached success is reused only outside every mutated schema resource.
        # Revalidate affected registries, including alternate union branches.
        # Mutant successes never enter the baseline cache.
        if not errors and not self.schema_mutation_active:
            self.cache[key] = errors
        return iter(errors)


class Probe:
    def __init__(self, id, family, layer, guard, evaluate, detail=None):
        self.id, self.family, self.layer, self.guard = id, family, layer, guard
        self.evaluate, self.detail = evaluate, detail or {}


def pointer(value, path):
    for key in path:
        value = value[int(key)] if isinstance(value, list) else value[key]
    return value


def locations(node, path=''):
    if isinstance(node, dict):
        yield node, path
        for key, child in node.items():
            yield from locations(child, path + '/' + key.replace('~', '~0').replace('/', '~1'))
    elif isinstance(node, list):
        for index, child in enumerate(node):
            yield from locations(child, path + '/' + str(index))


class Suite:
    def __init__(self):
        self.a = Mutants('authority')
        self.p = Mutants('payload')
        self.pns = self.p.compile((ROOT/'scripts/pm_filesafe_event_contracts.py').read_text(),
                                 {'semantic', 'override_scope_semantic', 'override_subset'})
        self.ans = self.a.compile((ROOT/'scripts/pm_filesafe_event_authority.py').read_text(),
                                 {'materialization_failures', 'application_original_failures',
                                  'event_payload', 'issued_failures', 'ProtocolOracle', 'graph_failures',
                                  'retention_binding_failures', 'decode_original'})
        self.ans['payload_owner'] = SimpleNamespace(**{
            **payload.__dict__, 'semantic': self.pns['semantic'],
            'override_scope_semantic': self.pns['override_scope_semantic'],
            'override_subset': self.pns['override_subset']})
        self.ans['Draft202012Validator'] = CachedValidator
        def cached_context(family):
            graph, selected = authority.context(family)
            def validator(root):
                original = selected(root)
                return CachedValidator(original.schema, registry=original._registry, format_checker=FormatChecker())
            return graph, validator
        self.ans['context'] = cached_context
        def memoized_value(fn):
            cache = {}
            def json_domain(value):
                if isinstance(value, dict):
                    return all(isinstance(k, str) and json_domain(v) for k, v in value.items())
                if isinstance(value, list): return all(json_domain(v) for v in value)
                return value is None or type(value) in (str, int, bool, float)
            def selected(value):
                if not json_domain(value): return fn(value)
                try: key = json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':'), allow_nan=False)
                except (TypeError, ValueError): return fn(value)
                if key not in cache: cache[key] = fn(value)
                return cache[key]
            return selected
        self.ans['source_commitment'] = memoized_value(authority.source_commitment)
        self.ans['full_commitment'] = memoized_value(authority.full_commitment)
        storage = authority.storage_owner()
        storage_proxy = SimpleNamespace(**storage.__dict__)
        for name in ('event_producer_semantic_digest', 'canonical_messagepack_bytes', 'jcs_bytes'):
            setattr(storage_proxy, name, memoized_value(getattr(storage, name)))
        self.ans['storage_owner'] = lambda: storage_proxy
        # Successful decode results are pure immutable test inputs. Reuse only
        # outside codec mutations, and replay the exact parser guard trace.
        decoder = self.ans['decode_original'];decoded = {}
        prefixes = ('authority:decode_original:', 'authority:take:', 'authority:read:')
        def decode(raw, codec):
            removed = (self.a.disabled,) if isinstance(self.a.disabled, str) else (self.a.disabled or ())
            if any(key.startswith(prefixes) for key in removed):
                return decoder(raw, codec)
            key = (raw, codec)
            if key in decoded:
                value, trace = decoded[key]
                for guard, valid in trace.items(): self.a.accept(guard, valid)
                return value
            before = {k: v for k, v in self.a.observed.items() if k.startswith(prefixes)}
            for k in before: del self.a.observed[k]
            try:
                value = decoder(raw, codec)
                trace = {k: v for k, v in self.a.observed.items() if k.startswith(prefixes)}
                decoded[key] = value, trace
                return value
            finally:
                for k, v in before.items(): self.a.observed[k] = self.a.observed.get(k, True) and v
        self.ans['decode_original'] = decode
        self.ans['load'] = __import__('functools').lru_cache(maxsize=None)(authority.load)
        reference_cache, negative_cache = {}, {}
        def cached_references(graph, docs, registry=None):
            key = (digest(graph['resources']), digest(docs), id(graph_owner.reference_failures))
            if key not in reference_cache:
                reference_cache[key] = graph_owner.reference_failures(graph, docs, registry)
            return reference_cache[key]
        def cached_negative_graphs(family, graph, docs):
            key = (family, digest(graph['resources']), digest(docs), id(graph_owner.reference_failures))
            if key not in negative_cache:
                negative_cache[key] = graph_owner.negative_case_failures(family, graph, docs)
            return negative_cache[key]
        self.ans['schema_graph'] = SimpleNamespace(context=graph_owner.context,
            reference_failures=cached_references, negative_case_failures=cached_negative_graphs)
        self.schemas = {}
        self.guard_groups = {}
        self.duplicate_groups = {}
        self.probes = []
        self.failures = []
        self.pack = authority.load('Plans/filesafe_event_authority_fixtures.json')
        self.node_locations = {}
        self.node_families = defaultdict(set)
        for family in authority.FAMILIES:
            graph, docs, registry = graph_owner.context(family)
            CachedValidator.registry_families[id(registry)] = family
            for resource in graph['resources']:
                for node, path in locations(docs[resource['path']]):
                    self.node_locations[id(node)] = (resource['uri'], path)
                    self.node_families[id(node)].add(family)

    def select(self, disabled):
        removed = self.guard_groups.get(disabled, disabled)
        self.a.disabled = self.p.disabled = removed
        self.a.observed.clear()
        self.p.observed.clear()

    def schema_boundary(self, family, value, validator, baseline_errors):
        """Evaluate the complete ingress; reuse only wholly unchanged schemas."""
        def evaluate():
            errors = (list(validator.iter_errors(value))
                      if CachedValidator.schema_mutation_active
                      and family in CachedValidator.affected_families else baseline_errors)
            def record(error):
                if CachedValidator.keyword_guard is not None:
                    key = CachedValidator.keyword_guard(error)
                    if key is not None: CachedValidator.failed_keywords.add(key)
                for child in error.context: record(child)
            for error in errors: record(error)
            return not errors
        return evaluate

    def add_schema(self, id, family, good, bad, validator, root=None):
        errors = list(validator.iter_errors(bad))
        if not errors or list(validator.iter_errors(good)):
            raise AssertionError((id, 'invalid schema controls'))
        # Prefer the exact primitive in the selected valid branch, rather than
        # removing a whole union and concealing a required-property guard.
        leaves = []
        def flatten(error):
            for child in error.context:
                flatten(child)
            leaves.append(error)
        for error in errors:
            flatten(error)
        for error in leaves:
            schema, key, value = error.schema, error.validator, error.instance
            if id.endswith('.app_fabricated_node') and key in ('oneOf', 'anyOf', 'allOf'):
                # Do not delete the enclosing Source union to hide duplicate
                # per-copy null constraints on one forbidden subject.
                continue
            try:
                control = pointer(good, error.absolute_path)
            except (KeyError, IndexError, TypeError):
                continue
            uri, fragment = self.node_locations.get(builtins.id(schema), (None, None))
            direct = (Draft202012Validator({'$ref': uri + '#' + fragment}, registry=validator._registry,
                                           format_checker=FormatChecker()) if uri else
                      Draft202012Validator(schema, registry=validator._registry, format_checker=FormatChecker()))
            if list(direct.iter_errors(control)):
                continue
            argument = None
            if key == 'required':
                missing = [name for name in schema[key] if name not in value]
                if len(missing) != 1:
                    continue
                argument = missing[0]
            old = copy.deepcopy(schema[key])
            try:
                if argument is None:
                    del schema[key]
                else:
                    schema[key] = [name for name in old if name != argument]
                accepted = not list(validator.iter_errors(bad))
            finally:
                schema[key] = old
            if not accepted:
                continue
            guard = 'schema:' + (uri + '#' + fragment if uri else digest(schema)) + ':' + key
            if argument is not None:
                guard += '(' + argument + ')'
            entries = self.schemas.setdefault(guard, [])
            if not any(node is schema for node, _, _ in entries):
                entries.append((schema, key, argument))
            self.probes.append(Probe(id, family, 'complete selected schema ingress', guard,
                self.schema_boundary(family, bad, validator, errors),
                {'root': root, 'instance_path': list(error.absolute_path),
                 'schema_uri': uri, 'schema_pointer': fragment, 'keyword': key,
                 'required_property': argument, 'complete_ingress_rejects_before': True,
                 'complete_ingress_accepts_after_removal': True}))
            return
        # A coherent application attempt subject is deliberately forbidden in
        # each original request/record copy. These are named duplicate type
        # guards for one fact, not unrelated malformed fields.
        duplicates = []
        for error in leaves:
            if (error.validator == 'type' and error.schema.get('type') == 'null'
                and error.instance == 'invented-attempt'
                and list(error.absolute_path)[-1:] == ['attempt_id']):
                schema = error.schema
                if not any(node is schema for node, _, _ in duplicates):
                    duplicates.append((schema, 'type', None))
        if len(duplicates) > 1:
            originals = [(schema, schema['type']) for schema, _, _ in duplicates]
            try:
                for schema, _ in originals: del schema['type']
                accepted = not list(validator.iter_errors(bad))
            finally:
                for schema, old in originals: schema['type'] = old
            if accepted:
                guard = 'duplicates:application_attempt_null:' + family
                members = ['schema:' + self.node_locations[builtins.id(node)][0] + '#'
                           + self.node_locations[builtins.id(node)][1] + ':type'
                           for node, _, _ in duplicates]
                self.schemas[guard] = duplicates
                self.duplicate_groups[guard] = {
                    'guards_removed_together': members,
                    'reason': 'The same forbidden application attempt subject in coherent original copies.',
                    'complete_ingress_rejects_before': True,
                    'complete_ingress_accepts_after_joint_removal': True}
                self.probes.append(Probe(id, family, 'complete ingress with named duplicate guards', guard,
                    self.schema_boundary(family, bad, validator, errors),
                    {'root': root, **self.duplicate_groups[guard]}))
                return
        raise AssertionError((id, 'no single schema guard', [e.message[:120] for e in errors]))

    def add_payloads(self):
        for row in authority.load('Plans/filesafe_event_contract_fixtures.json')['families']:
            f = row['event_type']
            _, docs, registry = graph_owner.context(f)
            schema = docs['Plans/event_payloads/' + f.replace('.', '_') + '_v2.schema.json']
            validator = Draft202012Validator(schema, registry=registry, format_checker=FormatChecker())
            for case in row['negative_payloads']:
                probe_id = 'payload:' + case['case_id']
                value = case['payload']
                good = next((v for v in row['positive_payloads'] if v.get('restore_outcome') == value.get('restore_outcome')
                             and v['scope']['scope_kind'] == value.get('scope', {}).get('scope_kind', 'project')),
                            row['positive_payloads'][0])
                if list(validator.iter_errors(value)):
                    self.add_schema(probe_id, f, good, value, validator, 'payload')
                    self.probes[-1].detail['fixture_case_id'] = case['case_id']
                else:
                    self.select(None)
                    assert not self.pns['semantic'](value), case['case_id']
                    failed = [k for k, accepted in self.p.observed.items() if not accepted]
                    # A helper and its calling assertion enforce the same rule;
                    # use the outer assertion so its mutant accepts the body.
                    choices = [k for k in failed if ':semantic:' in k]
                    if len(choices) != 1:
                        raise AssertionError((case['case_id'], failed))
                    guard = choices[0]
                    self.probes.append(Probe(probe_id, f, 'complete payload semantic', guard,
                        lambda x=value: self.pns['semantic'](x), {'fixture_case_id': case['case_id']}))
            # Source.original_result and the envelope payload each select this
            # schema independently. Prove the Result ingress explicitly even
            # when a coherent malformed copy is caught by materialization first.
            good = row['positive_payloads'][0]
            bad = copy.deepcopy(good);del bad['ts']
            _, selected = authority.context(f)
            self.add_schema(f.replace('.', '_') + '.fix5.Result_missing_ts', f,
                            good, bad, selected('Result'), 'Result')

    def add_authority(self):
        for row in self.pack['families']:
            f = row['event_type']
            graph, validator = authority.context(f)
            for case in row['negative']:
                base = row['positive'][case.get('positive_index', 0)]
                c, b = copy.deepcopy((base['candidate'], base['bank']))
                for edit in case['edits']:
                    authority.mutate(c if edit['target'] == 'candidate' else b,
                                     edit['path'], edit.get('value'), edit.get('remove', False))
                errors = list(validator('materialization').iter_errors(c))
                if errors:
                    self.add_schema(case['id'], f, base['candidate'], c, validator('materialization'), 'materialization')
                    ingress = self.probes[-1].guard
                    if ingress in self.duplicate_groups:
                        group = 'duplicates:application_attempt_authority:' + f
                        members = ['authority:require:application_orchestrator_ids',
                                   'authority:require:application_safe_point_subject']
                        self.guard_groups[group] = frozenset(
                            members + [ingress] + self.duplicate_groups[ingress]['guards_removed_together'])
                        self.schemas[group] = self.schemas[ingress]
                        self.duplicate_groups[group] = {
                            'guards_removed_together': self.duplicate_groups[ingress]['guards_removed_together'] + members,
                            'reason': 'Original-copy null types and the domain predicate enforce the same application attempt prohibition.'}
                        self.probes.append(Probe(case['id'] + '.duplicate_guards', f,
                            'complete materialization with named duplicate guards', group,
                            lambda family=f, candidate=c, bank=b: not self.ans['materialization_failures'](family, candidate, bank),
                            self.duplicate_groups[group]))
                    continue
                p, pe = authority.event_payload(f, c['event'], b)
                if not pe and list(validator('Result').iter_errors(p)):
                    good, _ = authority.event_payload(f, base['candidate']['event'], base['bank'])
                    self.add_schema(case['id'], f, good, p, validator('Result'), 'Result')
                    continue
                if case.get('isolation_layer') == 'application_body_schema':
                    role = case['body_role'];s = c['source']
                    member = next(v for v in s['body_members'] if v['role'] == role)
                    value = authority.decode_original(b['bodies'][member['ref']], graph['application_body_codecs'][role])
                    uri = authority.load('Plans/filesafe_event_sources/' + f.replace('.', '_') + '.schema.json')['$id']
                    selected = Draft202012Validator({'$ref': uri + graph['application_body_roots'][role]},
                        registry=validator('materialization')._registry, format_checker=FormatChecker())
                    self.add_schema(case['id'], f, base['candidate']['source']['application_records'][role], value, selected, role)
                    continue
                if pe:
                    # SP-337 schema fields have their own typed descriptor ingress.
                    descriptor = None
                    try:
                        descriptor = json.loads(c['event']['payload_ref'])
                    except (ValueError, TypeError):
                        pass
                    if descriptor is not None and list(validator('payload_reference').iter_errors(descriptor)):
                        good = json.loads(base['candidate']['event']['payload_ref'])
                        self.add_schema(case['id'], f, good, descriptor, validator('payload_reference'), 'payload_reference')
                        continue
                    self.select(None)
                    self.ans['event_payload'](f, c['event'], b)
                    keys = [k for k, valid in self.a.observed.items() if not valid]
                    if len(keys) != 1:
                        raise AssertionError((case['id'], pe, keys))
                    key = keys[0]
                    availability = pe == ['payload_reference_unavailable']
                    def resolved(family=f, e=c['event'], bank=b, availability=availability):
                        value, errors = self.ans['event_payload'](family, e, bank)
                        return not errors if availability else value is not None and not errors
                    self.probes.append(Probe(case['id'], f,
                        'reference availability refusal predicate' if availability else 'complete payload resolution', key, resolved,
                        {'acceptance_boundary': 'availability rejection signal; no complete decoded-value claim' if availability else 'complete non-null decoded value'}))
                    continue
                self.select(None)
                fn = self.ans['materialization_failures']
                found = fn(f, c, b)
                code = case.get('expected_error') or next(iter(dict.fromkeys(found)))
                key = ('authority:reported:' if code.startswith('application_body_decode:') else 'authority:require:') + code
                if code == 'replay_only_not_appendable':
                    keys = [k for k, valid in self.a.observed.items() if not valid]
                    key = next(k for k in keys if ':materialization_failures:' in k)
                    # Eligibility precedes typed materialization. Its duplicate
                    # envelope read policy is independently tested below.
                    layer = 'writer eligibility'
                    def eligibility(family=f, candidate=c, bank=b, target=key):
                        self.ans['materialization_failures'](family, candidate, bank)
                        return self.a.observed.get(target, False)
                    evaluate = eligibility
                elif case.get('isolation_layer'):
                    layer = 'owner predicate: ' + case['isolation_layer']
                    def boundary(family=f, candidate=c, bank=b, target=key):
                        self.ans['materialization_failures'](family, candidate, bank)
                        return self.a.observed.get(target, False)
                    evaluate = boundary
                else:
                    layer = 'complete materialization'
                    evaluate = lambda family=f, candidate=c, bank=b: not self.ans['materialization_failures'](family, candidate, bank)
                self.probes.append(Probe(case['id'], f, layer, key, evaluate,
                    {'baseline_errors': found, 'positive_id': base['id']}))
                duplicate_codes = set(found)
                if code == 'replay_only_not_appendable':
                    members = [key, 'authority:require:envelope_read_policy']
                    reason = 'Writer eligibility and envelope read policy both refuse a replay-only current writer.'
                elif duplicate_codes == {'payload_semantics', 'partial_worktree'}:
                    members = ['authority:require:' + v for v in sorted(duplicate_codes)]
                    reason = 'Payload and authority owners both require the complete worktree field set.'
                elif duplicate_codes == {'application_blob_inventory_unique', 'application_manifest_blob_inventory'}:
                    members = ['authority:require:' + v for v in sorted(duplicate_codes)]
                    reason = 'Unique blob identities and manifest cardinality both refuse the same duplicated blob.'
                elif duplicate_codes == {'application_operation_subject', 'application_operation_kind'}:
                    members = ['authority:require:' + v for v in sorted(duplicate_codes)]
                    reason = 'Journal kind and manifest subject joins both forbid a create against a live before-state or a delete against a live target.'
                else:
                    continue
                group = 'duplicates:' + ':'.join(members)
                self.guard_groups[group] = frozenset(members)
                self.duplicate_groups[group] = {'guards_removed_together': members, 'reason': reason}
                self.probes.append(Probe(case['id'] + '.duplicate_guards', f,
                    'complete materialization with named duplicate guards', group,
                    lambda family=f, candidate=c, bank=b: not self.ans['materialization_failures'](family, candidate, bank),
                    {'positive_id': base['id'], **self.duplicate_groups[group]}))

    def add_graphs(self):
        for row in authority.load('Plans/filesafe_schema_graph_fixtures.json')['families']:
            f = row['event_type']
            graph, documents, _ = graph_owner.context(f)
            for case in row['negative']:
                g, docs = copy.deepcopy(graph), dict(documents)
                path = case['resource_path']
                if case.get('remove_resource'):
                    g['resources'] = [r for r in g['resources'] if r['path'] != path]
                    del docs[path]
                else:
                    doc = copy.deepcopy(docs[path])
                    definition = {'$ref': case['unresolved_ref']}
                    if 'nested_id' in case:
                        definition['$id'] = case['nested_id']
                    doc.setdefault('$defs', {})['df_unexercised_negative'] = definition
                    docs[path] = doc
                self.probes.append(Probe(case['id'], f, 'complete offline reference closure',
                    'schema_graph:offline_reference_resolution',
                    lambda g=g, docs=docs: not graph_owner.reference_failures(g, docs)))

    def add_identifier_patterns(self):
        strings = {'0' * 64, 'a' * 40, 'blake3:' + '0' * 64, '00', 'project~cDE'}
        def collect(value):
            if isinstance(value, dict):
                for child in value.values(): collect(child)
            elif isinstance(value, list):
                for child in value: collect(child)
            elif isinstance(value, str) and len(value) < 200:
                strings.add(value)
        collect(self.pack)
        for family in authority.FAMILIES:
            _, docs, registry = graph_owner.context(family)
            for path in ('Plans/filesafe_event_sources/' + family.replace('.', '_') + '.schema.json',
                         'Plans/event_payloads/' + family.replace('.', '_') + '_v2.schema.json'):
                for node, fragment in locations(docs[path]):
                    pattern = node.get('pattern')
                    if not isinstance(pattern, str) or not pattern.startswith('^') or '$' not in pattern:
                        continue
                    validator = Draft202012Validator(node, registry=registry)
                    good = next((v for v in sorted(strings, key=lambda v: (len(v), v))
                                 if re.search(pattern, v) and not list(validator.iter_errors(v))), None)
                    assert good is not None, (path, fragment, 'missing identifier witness')
                    self.add_schema(family.replace('.', '_') + '.fix5.LF.' + path + '#' + fragment,
                                    family, good, good + '\n', validator, 'identifier pattern')

    def add_helpers(self):
        rows = {r['event_type']: r for r in self.pack['families']}
        granted = rows['filesafe.destructive_override_granted']
        requested = rows['filesafe.destructive_override_requested']
        def add(id, family, function, arguments, layer='complete helper'):
            self.select(None)
            assert not self.pns[function](*arguments), id
            failed = [k for k, valid in self.p.observed.items() if not valid]
            assert len(failed) == 1, (id, failed)
            self.probes.append(Probe(id, family, layer, failed[0],
                lambda fn=function, args=arguments: self.pns[fn](*args)))
        for row in (granted, requested):
            f = row['event_type']
            field = 'authorized_scope' if row is granted else 'requested_scope'
            for scope in ('project', 'application'):
                base = next(v for v in row['positive'] if v['candidate']['event']['scope_kind'] == scope)
                p = base['candidate']['source']['original_result']
                changes = [('project_id', 'other-project')]
                if scope == 'project':
                    changes += [('run_id', 'different-run'), ('worktree_id', 'different-worktree')]
                else:
                    changes += [(k, 'other-' + k) for k in ('server_id', 'computer_id', 'thread_id', 'run_id', 'host_id', 'environment_id')]
                    changes += [('recorded_roots', [{'root_id': 'different-root', 'root_generation': 'different-generation'}])]
                if 'normalized_command_identity' in p:
                    changes.append(('normalized_command_identity', 'different-command'))
                for key, value in changes:
                    q = copy.deepcopy(p[field]);q[key] = value
                    add(f.replace('.', '_') + '.fix5.scope.' + scope + '.' + key,
                        f, 'override_scope_semantic', (q, p))
        f = granted['event_type']
        for scope in ('project', 'application'):
            base = next(v for v in granted['positive'] if v['candidate']['event']['scope_kind'] == scope)
            g = base['candidate']['source']['original_result']['authorized_scope']
            r = base['candidate']['source']['original_request']['requested_scope']
            assert payload.override_subset(g, r)
            q = copy.deepcopy(g);q['project_id'] = 'other-project'
            add('filesafe_destructive_override_granted.fix5.subset.' + scope + '.scope', f,
                'override_subset', (q, r))
            q, t = copy.deepcopy((g, r))
            if scope == 'project':
                t['run_id'] = 'required-run';q['run_id'] = 'different-run'
            else:
                q['computer_id'] = 'different-computer'
            add('filesafe_destructive_override_granted.fix5.subset.' + scope + '.restriction', f,
                'override_subset', (q, t))

    def add_join_guards(self):
        source = ast.parse((ROOT/'scripts/pm_filesafe_event_authority.py').read_text())
        joins = {}
        for fn in source.body:
            if not isinstance(fn, ast.FunctionDef): continue
            for node in ast.walk(fn):
                if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == 'require':
                    code = ast.unparse(node.args[1])
                    for name in ('request_subject_join:', 'original_project_subject:', 'body_schema:'):
                        if code.startswith(repr(name)):
                            joins[name] = (compile(ast.Expression(node.args[0]), '<exact named join>', 'eval'), node.lineno)
        def alternative(value):
            if isinstance(value, bool): return not value
            if isinstance(value, int): return value + 1
            if isinstance(value, str): return value + '-different'
            if isinstance(value, dict):
                value = copy.deepcopy(value);value['normalized_command_identity'] = 'different-command';return value
            return 'different-subject'
        def add(id, family, key, expression, good, bad, line, layer):
            assert eval(expression, {**self.ans, **good}), (id, 'invalid positive control')
            assert not eval(expression, {**self.ans, **bad}), (id, 'accepted negative')
            self.probes.append(Probe(id, family, layer, key,
                lambda expression=expression, env=bad, key=key: self.a.accept(key, eval(expression, {**self.ans, **env})),
                {'positive_control_verified': True, 'source_line': line}))
        for row in self.pack['families']:
            f = row['event_type'];g, validator = authority.context(f)
            for scope in ('project', 'application'):
                base = next(p for p in row['positive'] if p['candidate']['event']['scope_kind'] == scope)
                c = base['candidate'];req = c['source']['original_request'];p = c['source']['original_result']
                expression, line = joins['request_subject_join:']
                for k in g['request_payload_joins']:
                    changed = copy.deepcopy(req);changed[k] = alternative(p.get(k))
                    add(f.replace('.', '_') + '.fix5.request_join.' + scope + '.' + k, f,
                        'authority:require:request_subject_join:' + k, expression,
                        {'req': req, 'p': p, 'k': k}, {'req': changed, 'p': p, 'k': k}, line,
                        'named request-subject predicate (typed ingress independent)')
                if scope == 'project' and 'native_project_record' in c['source']:
                    original = c['source']['native_project_record'];expression, line = joins['original_project_subject:']
                    for k in g['original_project_joins']:
                        expected = req['scope']['project_id'] if k == 'project_id' else p.get(k)
                        changed = copy.deepcopy(original);changed[k] = alternative(expected)
                        add(f.replace('.', '_') + '.fix5.project_join.' + k, f,
                            'authority:require:original_project_subject:' + k, expression,
                            {'original': original, 'key': k, 'expected': expected},
                            {'original': changed, 'key': k, 'expected': expected}, line,
                            'named original-Project predicate (typed ingress independent)')
                if scope != 'application' or not f.startswith('safe_point.'):
                    continue
                uri = authority.load('Plans/filesafe_event_sources/' + f.replace('.', '_') + '.schema.json')['$id']
                expression, line = joins['body_schema:']
                for role, fragment in g['application_body_roots'].items():
                    selected = CachedValidator({'$ref': uri + fragment}, registry=validator('materialization')._registry,
                                               format_checker=FormatChecker())
                    member = next(m for m in c['source']['body_members'] if m['role'] == role)
                    good = authority.decode_original(base['bank']['bodies'][member['ref']], g['application_body_codecs'][role])
                    if role.endswith('request'):
                        good = {**good, 'original_input_ref': req['original_input_ref'], 'original_input_sha256': req['original_input_sha256']}
                    assert isinstance(good, dict), role
                    bad = copy.deepcopy(good);del bad['schema_version' if 'schema_version' in bad else 'operation_id']
                    self.add_schema(f.replace('.', '_') + '.fix5.body_keyword.' + role, f, good, bad,
                        Draft202012Validator({'$ref': uri + fragment}, registry=validator('materialization')._registry,
                                             format_checker=FormatChecker()), role)
                    add(f.replace('.', '_') + '.fix5.body_typed.' + role, f,
                        'authority:require:application_body_schema:' + role, expression,
                        {'selected': selected, 'checked': good}, {'selected': selected, 'checked': bad}, line,
                        'decoded-original typed predicate')

    def add_codecs(self):
        fn = self.ans['decode_original']
        cases = [
            ('jcs', 'RFC8785', b'{"a":1}', b' {"a":1}', {'a': 1}),
            ('msgpack_integer', 'MessagePack', bytes.fromhex('01'), bytes.fromhex('cc01'), 1),
            ('msgpack_trailing', 'MessagePack', bytes.fromhex('01'), bytes.fromhex('0100'), 1),
        ]
        for name, codec, good, bad, expected in cases:
            self.select(None);assert fn(good.hex(), codec) == expected
            try:
                fn(bad.hex(), codec)
            except ValueError:
                pass
            else:
                raise AssertionError((name, 'bad codec accepted'))
            keys = [k for k, valid in self.a.observed.items() if not valid]
            assert len(keys) == 1, (name, keys)
            def evaluate(bad=bad, codec=codec, expected=expected):
                try: return fn(bad.hex(), codec) == expected
                except ValueError: return False
            self.probes.append(Probe('safe_point_created.fix5.codec.' + name, 'safe_point.created',
                'complete canonical decoder', keys[0], evaluate, {'positive_control_verified': True}))
        # Compile the exact nested token functions as a callable boundary. The
        # enclosing canonical-record check remains enabled in all integration
        # tests; short fragments and duplicate keys are never accepted there.
        definition = next(n for n in ast.parse((ROOT/'scripts/pm_filesafe_event_authority.py').read_text()).body
                          if isinstance(n, ast.FunctionDef) and n.name == 'decode_original')
        nested = [copy.deepcopy(n) for n in definition.body if isinstance(n, ast.FunctionDef)]
        wrapper = ast.parse('def token_reader(data, mode):\n offset=0\n return take if mode == "take" else read\n').body[0]
        wrapper.body[1:1] = nested
        tree = self.a.visit(ast.Module(body=[wrapper], type_ignores=[]));ast.fix_missing_locations(tree)
        ns = dict(self.ans);exec(compile(tree, '<exact MessagePack token boundary>', 'exec'), ns)
        reader = ns['token_reader']
        plans = [
            ('short_fragment', b'ab', b'a', 'take', 2, b'a'),
            ('duplicate_key', bytes.fromhex('81a16102'), bytes.fromhex('82a16101a16102'), 'read', None, {'a': 2}),
            ('unsupported_tag', bytes.fromhex('c0'), bytes.fromhex('c1'), 'read', None, None),
        ]
        for name, good, bad, mode, count, after in plans:
            self.select(None)
            good_fn = reader(good, mode)
            good_value = good_fn(count) if count is not None else good_fn()
            if mode == 'read': assert good_value == after
            else: assert good_value == good
            try:
                bad_fn = reader(bad, mode)
                bad_fn(count) if count is not None else bad_fn()
            except ValueError:
                pass
            else:
                raise AssertionError((name, 'bad token accepted'))
            keys = [k for k, valid in self.a.observed.items() if not valid]
            assert len(keys) == 1, (name, keys)
            def evaluate(bad=bad, mode=mode, count=count, after=after):
                try:
                    fn = reader(bad, mode)
                    return (fn(count) if count is not None else fn()) == after
                except ValueError: return False
            self.probes.append(Probe('safe_point_created.fix5.codec.' + name, 'safe_point.created',
                'MessagePack fragment/token predicate', keys[0], evaluate,
                {'positive_control_verified': True, 'valid_bytes': good.hex(), 'invalid_bytes': bad.hex()}))

    def add_application_role_guard(self):
        for row in self.pack['families']:
            f = row['event_type']
            if not f.startswith('safe_point.'): continue
            base = row['positive'][1];c, b = copy.deepcopy((base['candidate'], base['bank']))
            fn = self.ans['application_original_failures']
            self.select(None);assert not fn(f, c, b)
            source = c['source'];source['body_members'][0]['role'] = source['body_members'][1]['role']
            source['accepted_source_sha256'] = authority.source_commitment(source)
            b['sources'][source['source_ref']] = copy.deepcopy(source)
            self.select(None);assert fn(f, c, b) == ['application_body_role']
            key = 'authority:reported:application_body_role'
            self.probes.append(Probe(f.replace('.', '_') + '.fix5.application_missing_role', f,
                'complete application-original resolver', key,
                lambda f=f, c=c, b=b: not fn(f, c, b), {'positive_control_verified': True}))

    def add_owner_predicates(self):
        # These are overlapping typed ingress/owner predicates. Their complete
        # integration refusals remain in the authority pack. A separate direct
        # boundary test proves each assertion without disabling its neighbour.
        source = ast.parse((ROOT/'scripts/pm_filesafe_event_authority.py').read_text())
        expressions = {}
        for fn in source.body:
            if not isinstance(fn, ast.FunctionDef): continue
            for node in ast.walk(fn):
                if (isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == 'require'
                    and isinstance(node.args[1], ast.Constant)):
                    code = ('application_' if fn.name == 'application_original_failures' else '') + node.args[1].value
                    expressions[code] = (node.args[0], node.lineno)
        rows = {r['event_type']: r for r in self.pack['families']}
        def add(code, family, valid, invalid, name):
            expression, line = expressions[code]
            compiled = compile(ast.Expression(expression), '<exact owner predicate>', 'eval')
            assert eval(compiled, {**self.ans, **valid}) is True, (code, 'invalid positive')
            assert not eval(compiled, {**self.ans, **invalid}), (code, 'accepted negative')
            key = 'authority:require:' + code
            self.probes.append(Probe(family.replace('.', '_') + '.fix5.predicate.' + name,
                family, 'owner predicate (overlapping typed defenses)', key,
                lambda code=compiled, env=invalid, key=key: self.a.accept(key, eval(code, {**self.ans, **env})),
                {'source_line': line, 'predicate': ast.unparse(expression), 'positive_control_verified': True}))
        f = 'filesafe.policy_degraded';p = rows[f]['positive'][0]['candidate']['source']['original_result']
        q = copy.deepcopy(p);q['authoritative_enforcement_intact'] = False
        add('enforcement_not_intact', f, {'p': p}, {'p': q}, 'enforcement_not_intact')
        for f in ('safe_point.created', 'safe_point.restored'):
            c = rows[f]['positive'][0]['candidate'];original = c['source']['native_project_record'];scope = c['source']['original_request']['scope']
            q = copy.deepcopy(original);q['project_id'] = 'different-project'
            add('original_project_scope', f, {'original': original, 'scope': scope}, {'original': q, 'scope': scope}, 'original_project_scope')
        for f in ('safe_point.created', 'safe_point.restored'):
            p = rows[f]['positive'][1]['candidate']['source']['original_result'];q = copy.deepcopy(p);q['attempt_id'] = 'invented-attempt'
            add('application_orchestrator_ids', f, {'p': p}, {'p': q}, 'application_orchestrator_ids')
        f = 'safe_point.created';records = rows[f]['positive'][1]['candidate']['source']['application_records']
        blobs = records['snapshot_blobs']['blobs'];q = copy.deepcopy(blobs);q.append(copy.deepcopy(q[0]))
        add('application_blob_inventory_unique', f, {'blobs': blobs}, {'blobs': q}, 'blob_inventory_unique')
        entry = copy.deepcopy(records['snapshot_manifest']['entries'][0]);entry.update(ignored=True, authorized_write_set=True)
        q = copy.deepcopy(entry);q['authorized_write_set'] = False
        add('application_ignored_scope', f, {'entry': entry}, {'entry': q}, 'ignored_scope')
        entry = copy.deepcopy(entry);entry.update(kind='symlink', present=True, payload_id=None, symlink_target_hex='61')
        q = copy.deepcopy(entry);q['symlink_target_hex'] = None
        add('application_symlink_value', f, {'entry': entry}, {'entry': q}, 'symlink_value')
        entry = copy.deepcopy(entry);entry.update(kind='directory', payload_id=None, symlink_target_hex=None)
        q = copy.deepcopy(entry);q['payload_id'] = blobs[0]['payload_id']
        add('application_nonfile_payload', f, {'entry': entry}, {'entry': q}, 'nonfile_payload')

    def add_issued_guards(self):
        # Validate the actual retained-issued entry point independently of live
        # source controls, exactly as the historical-reader contract requires.
        for row in self.pack['families']:
            f = row['event_type']
            for scope in ('project', 'application'):
                base = next(p for p in row['positive'] if p['candidate']['event']['scope_kind'] == scope)
                original = {k: copy.deepcopy(base['candidate'][k]) for k in ('event', 'custody')}
                for name in ('changed_original', 'payload', 'schema', 'full_receipt', 'storage', 'coverage'):
                    c, b = copy.deepcopy((base['candidate'], base['bank']));value = copy.deepcopy(original);expected = copy.deepcopy(original)
                    fn = self.ans['issued_failures']
                    if name == 'changed_original': value['custody']['first_append_receipt']['acknowledged_at_utc'] = '2026-11-05T00:00:00Z'
                    elif name == 'payload':
                        del value['event']['payload']['ts']
                        value['custody']['producer_semantic_digest'] = authority.storage_owner().event_producer_semantic_digest(value['event'])
                        value['custody']['original_event_value_commitment']['sha256'] = authority.full_commitment(value['event'])
                        expected = copy.deepcopy(value)
                    elif name == 'schema':
                        del value['custody']['group_digest'];expected = copy.deepcopy(value)
                    elif name == 'full_receipt':
                        value['custody']['original_event_value_commitment']['sha256'] = '0' * 64;expected = copy.deepcopy(value)
                    if name in ('storage', 'coverage'):
                        o = self.ans['ProtocolOracle'](f, c, b)
                        if name == 'storage':
                            assert o.resolve_issued() == original
                            b['storage_instance_id'] = '22222222-2222-4222-8222-222222222222'
                            def evaluate(o=o, original=original): return o.resolve_issued() == original
                        else:
                            assert o.coverage_valid()
                            b['source_generation'] += 1
                            def evaluate(o=o): return o.coverage_valid()
                    else:
                        assert not authority.issued_failures(f, original, original, base['bank'])
                        def evaluate(value=value, expected=expected, b=b, f=f): return not self.ans['issued_failures'](f, value, expected, b)
                    self.select(None);assert not evaluate(), (f, scope, name)
                    keys = [k for k, valid in self.a.observed.items() if not valid]
                    assert len(keys) == 1, (f, scope, name, keys)
                    self.probes.append(Probe(f.replace('.', '_') + '.fix5.issued.' + scope + '.' + name,
                        f, 'complete retained-issued helper', keys[0], evaluate, {'positive_control_verified': True}))
        # The null/type boundary has no object to dereference after it is removed.
        # Prove its exact predicate separately; never count such a dereference
        # exception as acceptance by the complete issued resolver.
        definition = next(n for n in ast.parse((ROOT/'scripts/pm_filesafe_event_authority.py').read_text()).body
                          if isinstance(n, ast.FunctionDef) and n.name == 'issued_failures')
        shape = definition.body[1] if isinstance(definition.body[0], ast.Expr) else definition.body[0]
        assert isinstance(shape, ast.If)
        key = 'authority:issued_failures:' + str(shape.lineno)
        predicate = compile(ast.Expression(shape.test), '<issued shape predicate>', 'eval')
        self.probes.append(Probe('safe_point_created.fix5.issued.null_shape', 'safe_point.created',
            'issued nullable-object predicate', key, lambda key=key, predicate=predicate: not self.a.deny(key, eval(predicate, {'value': None})),
            {'valid_value': 'own complete issued result', 'negative_value': None, 'source_line': shape.lineno}))

    def add_graph_guards(self):
        for row in self.pack['families']:
            f = row['event_type'];g, selected = authority.context(f)
            mutations = [
                ('family', lambda q: q.update(event_type='filesafe.other')),
                ('hash', lambda q: q.update(graph_sha256='0' * 64)),
                ('stage_order', lambda q: q['ordered_stages'][0].update(role='wrong-role')),
                ('stage_ordinals', lambda q: q['ordered_stages'][0].update(ordinal=1)),
                ('method_count', lambda q: q['methods'].pop()),
                ('method_binding', lambda q: q['methods'][0].update(component='other-component')),
                ('native_adoption', lambda q: q['methods'][0].update(adoption_disposition='implemented')),
                ('resource_hash', lambda q: q['resources'][0].update(sha256='0' * 64)),
                ('resource_uri', lambda q: q['resources'][0].update(uri='https://wrong.local/schema')),
                ('admission', lambda q: q.update(native_admission='available')),
            ]
            for name, edit in mutations:
                q = copy.deepcopy(g);edit(q)
                if name != 'hash':
                    q['graph_sha256'] = authority.semantic_hash('source_graph', {k: v for k, v in q.items() if k != 'graph_sha256'})
                def evaluate(q=q, f=f, selected=selected):
                    original = self.ans['context']
                    self.ans['context'] = lambda family: (q, selected) if family == f else original(family)
                    try:
                        return not self.ans['graph_failures'](f)
                    finally:
                        self.ans['context'] = original
                self.select(None);assert not evaluate(), (f, name)
                failed = [k for k, accepted in self.a.observed.items() if not accepted]
                assert len(failed) == 1, (f, name, failed)
                key = failed[0];self.select(key)
                assert evaluate(), (f, name, 'full graph still rejects')
                self.select(None)
                line = int(key.rsplit(':', 1)[1])
                node = next(n for n in ast.walk(ast.parse((ROOT/'scripts/pm_filesafe_event_authority.py').read_text())) if isinstance(n, ast.If) and n.lineno == line)
                expression = compile(ast.Expression(node.test), '<exact source graph predicate>', 'eval')
                def environment(graph):
                    row = graph['resources'][0]
                    return dict(graph=graph, family=f, value={k: v for k, v in graph.items() if k != 'graph_sha256'},
                                method=graph['methods'][0], expected=g['methods'][0]['interface_id'],
                                row=row, doc=authority.load(row['path']))
                good, bad = environment(g), environment(q)
                assert not eval(expression, {**self.ans, **good}) and eval(expression, {**self.ans, **bad})
                def predicate(expression=expression, env=bad, key=key):
                    return not self.a.deny(key, eval(expression, {**self.ans, **env}))
                self.probes.append(Probe(f.replace('.', '_') + '.fix5.graph.' + name, f,
                                         'source graph predicate (complete graph preverified)', key, predicate,
                                         {'complete_graph_rejects_before': True, 'complete_graph_accepts_after_removal': True}))
            policies = ('PENDING_RETENTION_DECISION', 'RP-AUTHORITY-INDEFINITE', 'RP-OPERATIONAL-2555D', 'RP-RUNTIME-365D')
            for policy in policies:
                if policy == g['retention_policy_ref']:
                    continue
                self.select(None)
                assert self.ans['retention_binding_failures'](f, policy)
                failed = [k for k, accepted in self.a.observed.items() if not accepted]
                assert len(failed) == 1
                self.probes.append(Probe(f.replace('.', '_') + '.fix5.retention.' + policy, f,
                    'complete retention binding', failed[0],
                    lambda f=f, policy=policy: not self.ans['retention_binding_failures'](f, policy)))

    def add_protocols(self):
        # Rich valid snapshots let a phase/refusal guard be removed without an
        # unrelated missing prerequisite causing a Python exception.
        keys = {int(k.rsplit(':', 1)[1]): k for k in self.a.sites if ':step:' in k}
        plans = [
            (469, 4, 'retry', 'ORIGINAL_FULL_RESULT', 'replay'),
            (471, 4, 'withdraw_writer', 'writer_fenced', 'crashed'),
            (474, 0, 'owner_commit', 'owner_committed', 'writer_fenced'),
            (475, 0, 'owner_commit', 'owner_committed', 'source_epoch'),
            (476, 0, 'owner_commit', 'owner_committed', 'phase_committed'),
            (481, 1, 'prepare', 'prepared', 'already_prepared'),
            (482, 1, 'prepare', 'prepared', 'recovery_refused'),
            (483, 1, 'prepare', 'prepared', 'missing_reference'),
            (487, 2, 'append', 'appended', 'already_appended'),
            (488, 2, 'append', 'appended', 'recovery_refused'),
            (489, 2, 'append', 'appended', 'missing_reference'),
            (493, 3, 'receipt', 'receipted', 'already_receipted'),
            (494, 3, 'receipt', 'receipted', 'recovery_refused'),
            (498, 4, 'terminal', 'original_terminal', 'recovery_refused'),
            (499, 4, 'terminal', 'original_terminal', 'receipt_missing'),
            (500, 4, 'terminal', 'original_terminal', 'issued_missing'),
            (513, 1, 'recover', 'owner_committed', 'source_epoch_after_crash'),
            (522, 4, 'retry', 'ORIGINAL_FULL_RESULT', 'recovery_refused'),
            (525, 4, 'retry', 'ORIGINAL_FULL_RESULT', 'retry_thread'),
            (528, 4, 'retry', 'ORIGINAL_FULL_RESULT', 'receipt_missing'),
            (532, 5, 'withdraw_reader', 'reader_fenced', 'writer_not_cutoff'),
            (533, 1, 'withdraw_reader', 'reader_fenced', 'pending_cutoff'),
            (536, 5, 'rebuild', 'retained_survivors_verified', 'reader_not_fenced'),
            (538, 5, 'rebuild', 'retained_survivors_verified', 'source_generation'),
            (541, 5, 'publish_reader', 'reader_generation_published', 'missing_rebuild'),
            (547, 5, 'read', 'original_history_no_effect', 'reader_fenced'),
            (552, 5, 'read', 'original_history_no_effect', 'forged_reader'),
            (562, 5, 'read_body', 'original_history_no_effect', 'body_source_epoch'),
            (570, 5, 'read_body', 'original_history_no_effect', 'body_bytes'),
        ]
        for row in self.pack['families']:
            f = row['event_type']
            for scope in ('project', 'application'):
                for line, count, action, after, defect in plans:
                    use_ref = defect == 'missing_reference'
                    base = next(p for p in row['positive'] if
                                p['candidate']['event']['scope_kind'] == scope and
                                (p['candidate']['event']['payload_ref'] is not None) == use_ref)
                    self.select(None)
                    c, b = copy.deepcopy((base['candidate'], base['bank']))
                    o = self.ans['ProtocolOracle'](f, c, b)
                    for operation in ('owner_commit', 'prepare', 'append', 'receipt', 'terminal')[:count]:
                        o.step(operation, c)
                    if action in ('withdraw_reader', 'rebuild', 'publish_reader') or defect == 'reader_fenced': o.step('withdraw_writer', c)
                    if action in ('rebuild', 'publish_reader'): o.step('withdraw_reader', c)
                    if action == 'publish_reader': o.step('rebuild', c)
                    if defect == 'source_epoch_after_crash': o.step('crash', c)
                    expected = {k: base['candidate'][k] for k in ('event', 'custody')} if after == 'ORIGINAL_FULL_RESULT' else after
                    control = copy.deepcopy((c, b, o))
                    if defect == 'pending_cutoff':
                        for operation in ('prepare', 'append', 'receipt', 'terminal'): control[2].step(operation, control[0])
                    assert control[2].step(action, control[0]) == expected, (f, scope, line, 'invalid positive control')
                    if defect == 'replay':
                        c['event']['replay_policy'] = 'projector_replay_only'
                    elif defect == 'crashed': o.step('crash', c)
                    elif defect == 'writer_fenced': o.step('withdraw_writer', c)
                    elif defect in ('source_epoch', 'source_epoch_after_crash', 'body_source_epoch'):
                        b['writer_epoch'] += 1
                        if defect == 'body_source_epoch':
                            b['writer_epoch'] -= 1
                            b['sources'].clear()
                    elif defect == 'phase_empty': o.phase = 'empty'
                    elif defect == 'phase_committed': o.step('owner_commit', c)
                    elif defect == 'already_prepared': o.step('prepare', c)
                    elif defect == 'already_appended': o.step('append', c)
                    elif defect == 'already_receipted': o.step('receipt', c)
                    elif defect == 'writer_not_cutoff': o.writer_fenced = False
                    elif defect == 'reader_not_fenced': o.reader_fenced = False
                    elif defect == 'recovery_refused': o.durable['recovery_refused'] = True
                    elif defect == 'missing_reference': b['payloads'].clear()
                    elif defect == 'receipt_missing': o.receipt = None
                    elif defect == 'issued_missing': b['issued'].clear()
                    elif defect == 'durable_phase_prepared': o.durable['phase'] = 'prepared'
                    elif defect == 'retry_thread':
                        # The incoming retry differs from the immutable durable original.
                        c['event']['thread_id'] = 'different-thread'
                        c['custody']['producer_semantic_digest'] = authority.storage_owner().event_producer_semantic_digest(c['event'])
                        c['custody']['original_event_value_commitment']['sha256'] = authority.full_commitment(c['event'])
                    elif defect == 'pending_cutoff': pass
                    elif defect == 'source_generation': b['source_generation'] += 1
                    elif defect == 'pending_rebuild':
                        o.writer_fenced = o.reader_fenced = True
                        o.durable['pending'] = True
                    elif defect == 'missing_rebuild': o.rebuilt = None
                    elif defect == 'reader_fenced': o.step('withdraw_reader', c)
                    elif defect == 'forged_reader':
                        c['event']['thread_id'] = 'different-thread'
                        c['custody']['producer_semantic_digest'] = authority.storage_owner().event_producer_semantic_digest(c['event'])
                        c['custody']['original_event_value_commitment']['sha256'] = authority.full_commitment(c['event'])
                    elif defect == 'body_bytes':
                        member = c['source']['body_members'][0]
                        b['bodies'][member['ref']] = '00'
                    expected = {k: base['candidate'][k] for k in ('event', 'custody')} if after == 'ORIGINAL_FULL_RESULT' else after
                    snapshot = copy.deepcopy((c, b, o))
                    def evaluate(snapshot=snapshot, action=action, expected=expected):
                        c, b, o = copy.deepcopy(snapshot)
                        return o.step(action, c) == expected
                    self.probes.append(Probe(f.replace('.', '_') + '.fix5.protocol.' + scope + '.' + str(line),
                        f, 'complete protocol step', keys[line], evaluate,
                        {'defect': defect, 'action': action, 'setup_actions': count,
                         'valid_base': base['id'], 'positive_control_verified': True, 'source_line': line}))
                c, b = copy.deepcopy((base['candidate'], base['bank']))
                staged = self.ans['ProtocolOracle'](f, c, b)
                staged.step('owner_commit', c);staged.step('prepare', c)
                good_stage = copy.deepcopy(staged);good_stage.step('append')
                line = 523;key = keys[line]
                node = next(n for n in ast.walk(ast.parse((ROOT/'scripts/pm_filesafe_event_authority.py').read_text())) if isinstance(n, ast.If) and n.lineno == line)
                predicate = compile(ast.Expression(node.test), '<retry durable-stage predicate>', 'eval')
                assert not eval(predicate, {'self': good_stage}) and eval(predicate, {'self': staged})
                self.probes.append(Probe(f.replace('.', '_') + '.fix5.protocol.' + scope + '.523',
                    f, 'durable-stage predicate (reachable prepared/appended snapshots)', key,
                    lambda key=key, predicate=predicate, staged=staged: not self.a.deny(key, eval(predicate, {'self': staged})),
                    {'positive_control_verified': True, 'valid_phase': 'appended', 'invalid_phase': 'prepared', 'source_line': line}))
                # Nullable result is a typed result boundary. Running subsequent
                # dereferences after its guard is removed would test Python,
                # not acceptance; its exact predicate is tested directly.
                line = 527
                key = keys[line]
                node = next(n for n in ast.walk(ast.parse((ROOT/'scripts/pm_filesafe_event_authority.py').read_text())) if isinstance(n, ast.If) and n.lineno == line)
                predicate = compile(ast.Expression(node.test), '<retry issued-result predicate>', 'eval')
                self.probes.append(Probe(f.replace('.', '_') + '.fix5.protocol.' + scope + '.527',
                    f, 'nullable issued-result predicate', key,
                    lambda key=key, predicate=predicate: not self.a.deny(key, eval(predicate, {'value': None})),
                    {'valid_result': 'own original issued row', 'negative_result': None,
                     'source_line': line}))

    @contextmanager
    def removed(self, guard):
        self.select(guard)
        original_refs = graph_owner.reference_failures
        if guard == 'schema_graph:offline_reference_resolution':
            graph_owner.reference_failures = lambda *args: []
        selected = self.schemas.get(guard)
        originals = []
        CachedValidator.schema_mutation_active = bool(selected)
        CachedValidator.affected_families = set()
        for node, _, _ in selected or []:
            CachedValidator.affected_families.update(self.node_families.get(id(node), set(authority.FAMILIES) | {None}))
        for schema, key, argument in selected or []:
            old = copy.deepcopy(schema[key])
            originals.append((schema, key, old))
            if argument is None:
                del schema[key]
            else:
                schema[key] = [name for name in old if name != argument]
        try:
            yield
        finally:
            for schema, key, old in originals:
                schema[key] = old
            graph_owner.reference_failures = original_refs
            CachedValidator.schema_mutation_active = False
            CachedValidator.affected_families = set()
            self.select(None)

    def guard_row(self, guard, matrix, by_id, trace_proof):
        own = [p for p in self.probes if p.guard == guard]
        others = [p for p in self.probes if p.guard != guard]
        flip, stay, unexpected, exceptions, related = [], [], [], [], []
        executed = unchanged = 0
        with self.removed(guard):
            for probe in own + (others if matrix else []):
                if trace_proof and guard not in by_id[probe.id]:
                    # Removing an untriggered refusal cannot alter the path:
                    # all original conditions and every other guard remain.
                    stay.append(probe.id);unchanged += 1;continue
                executed += 1
                try:
                    self.a.observed.clear()
                    self.p.observed.clear()
                    accepted = probe.evaluate()
                except Exception as exc:
                    exceptions.append({'id': probe.id, 'error': repr(exc)})
                    continue
                if accepted:
                    if probe.guard == guard:
                        flip.append(probe.id)
                    else:
                        removed = set(self.guard_groups.get(guard, [guard]))
                        removed.add(guard)
                        (related if removed & by_id[probe.id] else unexpected).append(probe.id)
                else:
                    stay.append(probe.id)
        expected = {p.id for p in own}
        errors = []
        if set(flip) != expected or unexpected or exceptions:
            errors.append(guard + ': guard-removal isolation failed')
        row = {'guard': guard, 'layers': sorted({p.layer for p in own}),
                     'negatives_that_flip': flip, 'negatives_that_stay_rejected': stay,
                     'related_cross_layer_flips': related,
                     'executed_mutant_probes': executed, 'unchanged_refusal_traces': unchanged,
                     'unexpected_flips': unexpected, 'exceptions': exceptions,
                     'expected_flips': sorted(expected)}
        return row, errors

    def check(self, matrix=True, trace_proof=False, progress=False, jobs=1):
        failures, baseline, dependencies = [], [], []
        schema_keys = {}
        for guard, entries in self.schemas.items():
            for node, keyword, argument in entries:
                schema_keys[(id(node), keyword, argument)] = guard
        def keyword_guard(error):
            argument = None
            if error.validator == 'required':
                argument = next((v for v in error.schema['required'] if v not in error.instance), None)
            return schema_keys.get((id(error.schema), error.validator, argument))
        CachedValidator.keyword_guard = keyword_guard
        for probe in self.probes:
            self.select(None)
            CachedValidator.failed_keywords.clear()
            try:
                accepted = probe.evaluate()
                baseline.append(accepted)
                dependencies.append({probe.guard} | {k for k, v in self.a.observed.items() if not v} | {k for k, v in self.p.observed.items() if not v} | CachedValidator.failed_keywords)
                if accepted:
                    failures.append(probe.id + ': baseline accepted')
            except Exception as exc:
                baseline.append(True)
                dependencies.append({probe.guard})
                failures.append(probe.id + ': baseline exception: ' + repr(exc))
        if len({p.id for p in self.probes}) != len(self.probes):
            failures.append('duplicate guard probe ids')
        by_id = {p.id: deps for p, deps in zip(self.probes, dependencies)}
        rows = []
        guards = sorted({p.guard for p in self.probes})
        def consume(iterator):
            for number, (row, errors) in enumerate(iterator, 1):
                rows.append(row);failures.extend(errors)
                if progress and number % 25 == 0:
                    print('DF guard matrix ' + str(number) + '/' + str(len(guards)), file=__import__('sys').stderr, flush=True)
        if jobs > 1:
            import multiprocessing
            global _MATRIX_STATE
            _MATRIX_STATE = (self, matrix, by_id, trace_proof)
            with multiprocessing.get_context('fork').Pool(jobs) as pool:
                consume(pool.imap_unordered(_matrix_guard, guards, chunksize=1))
        else:
            consume(self.guard_row(guard, matrix, by_id, trace_proof) for guard in guards)
        rows.sort(key=lambda row: row['guard'])
        target_keys = {p.guard for p in self.probes}
        inventory = {**self.a.sites, **self.p.sites}
        delegated = {}
        for key, expression in inventory.items():
            root = None
            if ':materialization_failures:' in key:
                if "validator('materialization')" in expression: root = 'materialization'
                elif "validator('Result')" in expression: root = 'Result'
            if ':event_payload:' in key and "validator('payload_reference')" in expression: root = 'payload_reference'
            if root:
                delegated[key] = [p.id for p in self.probes if p.detail.get('root') == root]
        uncovered = []
        for site, expression in inventory.items():
            if ':require-site:' in site:
                missing = set(self.a.executed.get(site, set())) - target_keys
                if missing: uncovered.append({'site': site, 'missing_named_predicates': sorted(missing)})
            elif site not in target_keys and not delegated.get(site):
                uncovered.append({'site': site, 'expression': expression})
        if uncovered:
            failures.append('uncovered guard inventory sites')
        return {'status': 'fail' if failures else 'pass', 'failures': failures,
                'negative_count': len(self.probes), 'guard_count': len(guards),
                'matrix': matrix, 'processes': jobs, 'matrix_method': ('Execute every affected refusal trace; prove all other paths unchanged.' if trace_proof else 'Execute every probe against every single removed guard at its declared layer.'), 'table': rows,
                'guard_inventory': inventory, 'delegated_schema_guards': delegated, 'uncovered_guards': uncovered,
                'named_duplicate_guards': self.duplicate_groups,
                'executed_require_sites': {k: sorted(v) for k, v in self.a.executed.items()},
                'cases': [{'id': p.id, 'family': p.family, 'layer': p.layer, 'guard': p.guard,
                           **p.detail} for p in self.probes]}


_MATRIX_STATE = None

def _matrix_guard(guard):
    # Forked workers inherit the immutable controls and baseline caches. Every
    # guard and schema mutation stays in that process; no source file is edited.
    suite, matrix, by_id, trace_proof = _MATRIX_STATE
    return suite.guard_row(guard, matrix, by_id, trace_proof)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--jobs', type=int, default=1, help='Independent forked guard processes; default 1.')
    parser.add_argument('--progress', action='store_true')
    parser.add_argument('--trace-proof', action='store_true', help='Debug optimization; final delivery uses the literal matrix.')
    parser.add_argument('--own-only', action='store_true', help='Debug only; final proof requires the complete matrix.')
    args = parser.parse_args()
    if args.jobs < 1:
        parser.error('--jobs must be positive')
    if args.jobs > 1 and 'fork' not in __import__('multiprocessing').get_all_start_methods():
        parser.error('parallel controls require fork; use --jobs 1 on this platform')
    suite = Suite()
    if args.progress: print('DF guard matrix: construct payload and authority controls', file=__import__('sys').stderr, flush=True)
    suite.add_payloads()
    suite.add_authority()
    if args.progress: print('DF guard matrix: construct graph and predicate controls', file=__import__('sys').stderr, flush=True)
    suite.add_graphs()
    suite.add_identifier_patterns()
    suite.add_helpers()
    suite.add_graph_guards()
    suite.add_join_guards()
    suite.add_codecs()
    suite.add_application_role_guard()
    suite.add_owner_predicates()
    suite.add_issued_guards()
    suite.add_protocols()
    if args.progress: print('DF guard matrix: baseline ' + str(len(suite.probes)) + ' controls', file=__import__('sys').stderr, flush=True)
    result = suite.check(matrix=not args.own_only, trace_proof=args.trace_proof, progress=args.progress, jobs=args.jobs)
    if args.output:
        args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps({key: value for key, value in result.items() if key not in ('table', 'cases', 'guard_inventory', 'executed_require_sites', 'delegated_schema_guards')}, indent=2))
    return result['status'] != 'pass'


if __name__ == '__main__':
    raise SystemExit(main())
