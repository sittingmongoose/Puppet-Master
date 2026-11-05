"""Shared static-oracle machinery; no native admission or runtime evidence.

Strict validation deliberately leaves retained schema bytes unchanged. Guard removal
disables a predicate, never changes the expected result or the input observation.
"""
from __future__ import annotations

import copy
import ast
import inspect
import contextvars
from functools import lru_cache
import datetime
import hashlib
import json
import re
import math
import sys
from pathlib import Path
from urllib.parse import urldefrag, unquote

import jsonschema
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

ROOT = Path(__file__).resolve().parents[1]
FORMATS = jsonschema.FormatChecker(formats=())


@FORMATS.checks("date-time")
def utc(value):
    if not isinstance(value, str):
        return True
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z", value) is None:
        return False
    try:
        datetime.datetime.fromisoformat(value.replace("Z", "+00:00"))
        return True
    except ValueError:
        return False


def strict_pattern(validator, pattern, value, schema):
    if isinstance(value, str) and re.fullmatch(pattern, value) is None:
        yield jsonschema.ValidationError(f"{value!r} does not fully match {pattern!r}")


_SCHEMA_LOCATIONS = {}
_SCHEMA_ASSERTION_LOCATIONS = {}
_SCHEMA_TYPES = {}
_SCHEMA_DUPLICATES = {}
_SCHEMA_SITES = {}
_INVENTORIED_VALIDATORS = set()
_SCHEMA_VALIDATOR_GUARDS = {}
_SCHEMA_INACTIVE_TYPES = {}
_SCHEMA_REGISTRY_PATHS = []
_SCHEMA_CONTEXT = contextvars.ContextVar('goal_schema_guards', default=('', frozenset()))


def schema_guard(schema, keyword):
    location = schema.get('x-pm-oracle-id')
    if location is None:
        location = json.dumps(schema, sort_keys=True)
    name = 'closed_members' if keyword in ('additionalProperties', 'unevaluatedProperties') else keyword
    ident = 'schema/' + hashlib.sha256(location.encode()).hexdigest()[:16] + '/' + name
    _SCHEMA_LOCATIONS[ident] = location + '/' + name
    _SCHEMA_ASSERTION_LOCATIONS.setdefault(ident, set()).add(location + '/' + keyword)
    return ident


def guard_for_location(location):
    node, keyword = location.rsplit('/', 1)
    return schema_guard({'x-pm-oracle-id': node}, keyword)


def schema_type_inventory(v):
    """Walk validation schemas and resolved refs, independently of instance errors.

    Definitions are entered through refs, not by guessing which name is live.
    An `if` subschema selects a branch; its assertions do not reject instances.
    Both validation branches are inventoried, even if no fixture visits them.
    """
    if id(v) in _INVENTORIED_VALIDATORS:
        return
    _INVENTORIED_VALIDATORS.add(id(v))
    visited = set()
    guards = set()
    def selectors(schema):
        if not isinstance(schema, dict):
            return
        guards.update(schema_guard(schema, key) for key in schema if key in _KEYWORDS)
        for key in ('properties', 'patternProperties'):
            for child in schema.get(key, {}).values(): selectors(child)
        for key in ('not', 'if', 'then', 'else', 'items'):
            selectors(schema.get(key))
        for key in ('allOf', 'anyOf', 'oneOf', 'prefixItems'):
            for child in schema.get(key, []): selectors(child)
    def visit(schema, resolver, empty_domain=None):
        if not isinstance(schema, dict):
            return
        location = schema.get('x-pm-oracle-id')
        if location is None:
            location = json.dumps(schema, sort_keys=True)
        if location in visited:
            return
        visited.add(location)
        guards.update(schema_guard(schema, key) for key in schema if key in _KEYWORDS)
        selectors(schema.get('if'))
        if 'type' in schema:
            ident = schema_guard(schema, 'type')
            _SCHEMA_TYPES[ident] = {'location': _SCHEMA_LOCATIONS[ident], 'type': schema['type']}
            if empty_domain is not None:
                _SCHEMA_INACTIVE_TYPES[ident] = {'reason':'items cannot occur in any schema-valid array',
                    'dominating_schema_guard':empty_domain, 'proof':'ancestor maxItems is exactly zero'}
            # Enum/const deliberately also enforce the type at this same node.
            duplicates = {schema_guard(schema, k) for k in ('enum', 'const') if k in schema}
            if duplicates:
                _SCHEMA_DUPLICATES[ident] = frozenset({ident} | duplicates | set(_SCHEMA_DUPLICATES.get(ident, ())))
        if '$ref' in schema:
            resolved = resolver.lookup(schema['$ref'])
            visit(resolved.contents, resolved.resolver)
        for key in ('properties', 'patternProperties', 'dependentSchemas'):
            for child in schema.get(key, {}).values():
                visit(child, resolver)
        for key in ('items', 'additionalProperties', 'unevaluatedProperties', 'contains', 'propertyNames', 'then', 'else', 'unevaluatedItems', 'additionalItems', 'contentSchema'):
            visit(schema.get(key), resolver, schema_guard(schema, 'maxItems') if key == 'items' and schema.get('maxItems') == 0 else empty_domain)
        for key in ('allOf', 'anyOf', 'oneOf', 'prefixItems'):
            for child in schema.get(key, []):
                visit(child, resolver)
    visit(v.schema, v._resolver)
    # A nullable declaration may be deliberately refined by both branches of
    # a conditional at the same property. Name those exact duplicate type
    # assertions together; never combine constraints on different properties.
    for name, prop in v.schema.get('properties', {}).items():
        branch_types = {schema_guard(branch['properties'][name], 'type')
            for clause in v.schema.get('allOf', []) for branch in (clause.get('then', {}), clause.get('else', {}))
            if 'type' in branch.get('properties', {}).get(name, {})}
        if branch_types:
            for alternative in prop.get('anyOf', []):
                if 'type' in alternative:
                    ident = schema_guard(alternative, 'type')
                    _SCHEMA_DUPLICATES[ident] = frozenset({ident} | branch_types | set(_SCHEMA_DUPLICATES.get(ident, ())))
    _SCHEMA_VALIDATOR_GUARDS[id(v)] = guards


def expanded_guards(disabled):
    return set(disabled) | {member for guard in disabled for member in _SCHEMA_DUPLICATES.get(guard, ())}

def _keyword_guard(keyword, function):
    def guarded(v, expected, value, schema):
        prefix, disabled = _SCHEMA_CONTEXT.get()
        ident = schema_guard(schema, keyword)
        if ident in disabled:
            return
        for error in function(v, expected, value, schema):
            if not hasattr(error, "oracle_guard"):
                error.oracle_guard = ident
            yield error
    return guarded

_KEYWORDS = dict(jsonschema.Draft202012Validator.VALIDATORS)
_KEYWORDS['pattern'] = strict_pattern
StrictValidator = jsonschema.validators.extend(jsonschema.Draft202012Validator,
    {key:_keyword_guard(key, fn) for key,fn in _KEYWORDS.items()})


def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def canonical(value):
    # Preserve historical numeric values, but give equal JSON numbers one form.
    # In particular, integral floats/exponents and negative zero cannot fork a
    # digest. This bounded oracle is not a general RFC 8785 binary64 codec.
    def normalize(item):
        if isinstance(item, float):
            if not math.isfinite(item):
                raise ValueError('non-finite JSON number')
            return int(item) if item.is_integer() else item
        if isinstance(item, dict):
            return {key: normalize(child) for key, child in item.items()}
        if isinstance(item, list):
            return [normalize(child) for child in item]
        return item
    return json.dumps(normalize(value), sort_keys=True, ensure_ascii=False, separators=(",", ":"), allow_nan=False).encode()


def revision_text(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or int(value) != value:
        raise ValueError('revision must be an integer JSON number')
    return str(int(value))


def integer_number(value):
    return (not isinstance(value, bool) and isinstance(value, (int, float))
            and math.isfinite(value) and int(value) == value)


def same_json_value(left, right):
    # Python equates True with 1, including inside lists/dicts. JSON does not.
    return canonical(left) == canonical(right)


def number_codec_checks():
    """Raw JSON spelling vectors exercise the real digest/identity codecs."""
    failures = []
    for spelling, expected in [('1', b'1'), ('1.0', b'1'), ('1e0', b'1'),
                               ('-0', b'0'), ('-0.0', b'0'), ('0', b'0')]:
        value = json.loads(spelling)
        if canonical(value) != expected:
            failures.append('numeric canonical bytes: ' + spelling)
        if canonical({'nested': [value]}) != b'{"nested":[' + expected + b']}':
            failures.append('numeric nested digest bytes: ' + spelling)
        if revision_text(value) != expected.decode():
            failures.append('numeric identity text: ' + spelling)
    try:
        json.loads('01')
    except json.JSONDecodeError:
        pass
    else:
        failures.append('invalid JSON number 01 accepted')
    return failures


def sha(value):
    return hashlib.sha256(canonical(value)).hexdigest()


def schema_registry(paths, disabled=()):
    """Eagerly resolve every reference, including unused definitions. No network."""
    _SCHEMA_REGISTRY_PATHS[:] = list(paths)
    docs = [load(p) for p in paths]
    by_id = {d["$id"]: d for d in docs}
    by_name = {Path(p).name: d for p, d in zip(paths, docs)}
    for doc in docs:
        StrictValidator.check_schema(doc)
        def visit(node, base=None):
            base = doc if base is None else base
            if isinstance(node, dict):
                if "$id" in node: base=node
                if "$ref" in node:
                    uri, fragment = urldefrag(node["$ref"])
                    target = base if not uri else by_id.get(uri, by_name.get(uri))
                    if target is None:
                        raise ValueError(f"unresolved schema resource: {node['$ref']}")
                    if fragment:
                        if not fragment.startswith("/"):
                            raise ValueError(f"unsupported schema anchor: {node['$ref']}")
                        try:
                            for part in unquote(fragment)[1:].split("/"):
                                part = part.replace("~1", "/").replace("~0", "~")
                                target = target[int(part)] if isinstance(target, list) else target[part]
                        except (KeyError, IndexError, ValueError, TypeError) as exc:
                            raise ValueError(f"unresolved schema reference: {node['$ref']}") from exc
                for item in node.values():
                    visit(item,base)
            elif isinstance(node, list):
                for item in node:
                    visit(item,base)
        if "schema/references" not in disabled:visit(doc)
    return Registry().with_resources((d['$id'], Resource.from_contents(runtime_schema(d), default_specification=DRAFT202012)) for d in docs)


def runtime_schema(schema, path=None):
    """Annotate schema locations only, never enum/const/default instance data."""
    if not isinstance(schema,dict):return schema
    path=path or schema.get('$id','anonymous')
    out=copy.deepcopy(schema);out.pop('$schema',None);out['x-pm-oracle-id']=path
    for key in ('properties','patternProperties','$defs','definitions','dependentSchemas'):
        if key in out:out[key]={name:runtime_schema(value,path+'/'+key+'/'+name) for name,value in out[key].items()}
    for key in ('items','additionalProperties','unevaluatedProperties','contains','propertyNames','not','if','then','else','unevaluatedItems','additionalItems','contentSchema'):
        if key in out and isinstance(out[key],dict):out[key]=runtime_schema(out[key],path+'/'+key)
    for key in ('allOf','anyOf','oneOf','prefixItems'):
        if key in out:out[key]=[runtime_schema(value,path+'/'+key+'/'+str(i)) for i,value in enumerate(out[key])]
    return out


def validator(schema, registry=None):
    return StrictValidator(runtime_schema(schema), registry=registry or Registry(), format_checker=FORMATS)


_SCHEMA_CACHE = {}
def schema_guards(v, value, prefix, disabled=()):
    schema_type_inventory(v)
    _SCHEMA_SITES[(id(v), prefix)] = v
    relevant=frozenset(expanded_guards(disabled)&_SCHEMA_VALIDATOR_GUARDS[id(v)])
    # Cache instance bytes, not the normalized semantic digest: 1 and 1.0 may
    # have different schema/type observations even when their digests agree.
    encoded=json.dumps(value,sort_keys=True,separators=(',',':'),allow_nan=False)
    key=(id(v),hashlib.sha256(encoded.encode()).digest(),prefix,relevant)
    if key in _SCHEMA_CACHE:return set(_SCHEMA_CACHE[key])
    def errors_without(disabled):
        token=_SCHEMA_CONTEXT.set((prefix,frozenset(disabled)))
        try:return list(v.iter_errors(value))
        finally:_SCHEMA_CONTEXT.reset(token)
    errors=errors_without(relevant)
    if not errors:
        _SCHEMA_CACHE[key]=frozenset();return set()
    if relevant:
        # A removal run needs the actual rejection stream, not a second causal
        # search with additional guards disabled. The full validator above ran
        # with exactly the requested guard/set off. Baseline runs below still
        # prove each negative's independently sufficient removal witnesses.
        out={error.oracle_guard for error in errors}
        _SCHEMA_CACHE[key]=frozenset(out)
        return out
    def candidates(error,depth=0):
        for child in error.context:yield from candidates(child,depth+1)
        if hasattr(error,'oracle_guard'):yield (depth,error.oracle_guard)
    # Record every independently sufficient leaf removal. Union alternatives
    # can provide several witnesses for the same one-field defect.
    options=sorted(set(x for e in errors for x in candidates(e)),reverse=True)
    causal=[]
    for depth,guard in options:
        if not errors_without(relevant|{guard}):causal.append((depth,guard))
    for guard, members in _SCHEMA_DUPLICATES.items():
        if members.intersection(g for _,g in options) and not errors_without(relevant|members):
            causal.append((1,guard))
    if causal:
        # Composition keywords delegate rejection to their child assertions.
        out={g for _,g in causal if not g.endswith(('/anyOf','/oneOf'))}
        if not out:out={causal[0][1]}
    else:
        out={e.oracle_guard for e in errors}
    _SCHEMA_CACHE[key]=frozenset(out)
    return out


_SEEN_GUARDS = contextvars.ContextVar("goal_seen_guards", default=None)


class Gates:
    def __init__(self, disabled=()):
        self.disabled = set(disabled)
        self.errors = set()

    def require(self, name, condition):
        seen=_SEEN_GUARDS.get()
        if seen is not None:seen.add(name)
        if name not in self.disabled and not condition:
            self.errors.add(name)

    def schema(self, v, value, prefix):
        self.errors.update(schema_guards(v, value, prefix, self.disabled))


class Audit:
    """Check negatives and actually rerun the complete corpus with each guard off."""
    def __init__(self):
        self.cases = []
        self.failures = []
        source=Path(inspect.currentframe().f_back.f_code.co_filename)
        self.suite = source.stem
        fixture_path = ROOT / 'Plans/goal_oracle_schema_type_fixtures.json'
        self.explicit_duplicates = []
        if fixture_path.exists():
            self.explicit_duplicates = load(fixture_path).get('suites', {}).get(self.suite, {}).get('duplicate_sets', [])
            for pair in self.explicit_duplicates:
                target = guard_for_location(pair['type_location'])
                members = {target} | {guard_for_location(loc) for loc in pair['duplicate_locations']}
                _SCHEMA_DUPLICATES[target] = frozenset(members | set(_SCHEMA_DUPLICATES.get(target, ())))
        self.literal_guards=set()
        for guard_source in (source, Path(__file__)):
            if not guard_source.is_file():
                continue
            tree=ast.parse(guard_source.read_text())
            self.literal_guards.update(node.args[0].value for node in ast.walk(tree)
                if isinstance(node,ast.Call) and isinstance(node.func,ast.Attribute)
                and node.func.attr=='require' and node.args
                and isinstance(node.args[0],ast.Constant) and isinstance(node.args[0].value,str))
            uses_append = guard_source == source or 'append_result' in source.read_text()
            self.literal_guards.update(node.left.value for node in ast.walk(tree)
                if isinstance(node, ast.Compare) and isinstance(node.left, ast.Constant)
                and isinstance(node.left.value, str) and '/' in node.left.value
                and (uses_append or not node.left.value.startswith('append/'))
                and any(isinstance(rhs, ast.Name) and rhs.id == 'disabled' for rhs in node.comparators))

    def case(self, name, evaluate, value, valid, *, base=None):
        self.cases.append((name, evaluate, copy.deepcopy(value), valid, copy.deepcopy(base)))

    def run(self):
        self.failures.extend(number_codec_checks())
        paths = list(_SCHEMA_REGISTRY_PATHS)
        if paths:
            original_schema = load(paths[0]); reference_cache = {}
            def references(document, disabled):
                key = (sha(document), 'schema/references' in disabled)
                if key not in reference_cache:
                    original_load = globals()['load']
                    try:
                        globals()['load'] = lambda path: document if Path(path) == Path(paths[0]) else original_load(path)
                        try:
                            schema_registry(paths, disabled); errors = set()
                        except ValueError:
                            errors = {'schema/references'}
                    finally:
                        globals()['load'] = original_load
                    reference_cache[key] = errors
                return reference_cache[key]
            self.case('schema/eager_refs_valid', references, original_schema, True)
            dangling = copy.deepcopy(original_schema)
            dangling.setdefault('$defs', {})['unused_type_audit_dangling_ref'] = {'$ref':'#/$defs/DOES_NOT_EXIST'}
            self.case('schema/eager_refs_unused_dangling', references, dangling, False, base=original_schema)
        # Register schemas from the ordinary cases first; fixture witnesses use
        # exactly these full validators, including their actual ref registry.
        for _, evaluate, value, valid, _ in self.cases:
            if valid:
                evaluate(value, set())
        fixture_path = ROOT / 'Plans/goal_oracle_schema_type_fixtures.json'
        if fixture_path.exists():
            fixtures = load(fixture_path).get('suites', {}).get(self.suite, {})
            for case in fixtures.get('cases', []):
                site = next((v for (_, prefix), v in _SCHEMA_SITES.items() if prefix == case['site']), None)
                if site is None:
                    self.failures.append('unknown schema fixture site: ' + case['site'])
                    continue
                baseline = fixtures['bases'][case['base_id']]
                values = materialize_cases([{'id':'base', 'valid':True, 'input':baseline},
                    {'id':case['id'], 'base_id':'base', 'changes':case['changes'], 'valid':False}])
                def schema_case(value, disabled, v=site, prefix=case['site']):
                    g = Gates(disabled); g.schema(v, value, prefix); return g.errors
                self.case(case['id'], schema_case, values[1]['input'], False, base=baseline)
        negatives = []
        seen=set()
        seen_token=_SEEN_GUARDS.set(seen)
        for name, evaluate, value, valid, base in self.cases:
            errors = evaluate(value, set())
            if bool(errors) == valid:
                self.failures.append(f"{name}: expected valid={valid}, guards={sorted(errors)}")
            if not valid:
                if base is not None and evaluate(base, set()):
                    self.failures.append(f"{name}: negative's baseline is invalid")
                negatives.append((name, evaluate, value, errors))
        _SEEN_GUARDS.reset(seen_token)
        inventory=seen|self.literal_guards|(set(_SCHEMA_TYPES)-set(_SCHEMA_INACTIVE_TYPES))
        actual_schema_guards = set().union(*_SCHEMA_VALIDATOR_GUARDS.values())
        for pair in self.explicit_duplicates:
            target = guard_for_location(pair['type_location'])
            members = {target} | {guard_for_location(loc) for loc in pair['duplicate_locations']}
            if target not in _SCHEMA_TYPES or not members <= actual_schema_guards:
                self.failures.append('unknown actual schema assertion in named duplicate set: ' + pair['type_location'])
        missing=inventory-{g for _,_,_,errors in negatives for g in errors}
        if missing:self.failures.append("guards without isolated negatives: "+", ".join(sorted(missing)))
        table = []
        guards = sorted(inventory|{g for _, _, _, errors in negatives for g in errors})
        if '--guard-table' in sys.argv:
            print(f'{self.suite}: {len(negatives)} negatives, {len(guards)} guard rows; '
                  f'{len(self.failures)} baseline failures, {len(missing)} unproved guards', file=sys.stderr, flush=True)
        for index, guard in enumerate(guards):
            if '--guard-table' in sys.argv and index % 25 == 0:
                print(f'{self.suite}: guard row {index + 1}/{len(guards)}', file=sys.stderr, flush=True)
            flips, stays, masked = [], [], []
            for name, evaluate, value, errors in negatives:
                weakened = evaluate(value, {guard})
                if not weakened:
                    flips.append(name)
                else:
                    stays.append(name)
                if guard in errors and weakened:
                    masked.append(name)
                if guard not in errors and not weakened:
                    self.failures.append(f"{guard}: unrelated negative {name} passed")
            if not flips or masked:
                self.failures.append(f"{guard}: surviving guard mutant; masked={masked}")
            table.append({"guard": guard, "schema_location":_SCHEMA_LOCATIONS.get(guard),
                          "removed_together": sorted(_SCHEMA_DUPLICATES.get(guard, {guard})),
                          "removed_schema_assertions": sorted({location
                              for member in _SCHEMA_DUPLICATES.get(guard, {guard})
                              for location in _SCHEMA_ASSERTION_LOCATIONS.get(member, ())}),
                          "negatives_that_flip": flips,
                          "negatives_that_stay_rejected": stays, "masked": masked})
        return {"status": "fail" if self.failures else "pass", "cases": len(self.cases),
                "negative_cases": len(negatives), "guard_removal": table, "unproved_guards":sorted(missing),
                "schema_type_inventory": _SCHEMA_TYPES,
                "inactive_schema_type_guards": _SCHEMA_INACTIVE_TYPES,
                "failures": self.failures, "native_execution": "NOT_RUN"}


SEMANTIC_FIELDS = ("event_type", "scope_kind", "project_id", "thread_id", "run_id", "node_id", "attempt_id",
                   "actor_ref", "requested_account_ref", "effective_account_ref", "occurred_at_utc",
                   "producer_sequence_id", "correlation_id", "causation_event_id", "parent_event_id",
                   "idempotency_key", "payload_schema_id", "payload", "payload_ref", "redaction_profile", "migration")


def semantic_digest(event):
    return sha({key: event[key] for key in SEMANTIC_FIELDS})


def append_result(case, disabled=()):
    # Admission/policy always precedes lookup, including an equal-body retry.
    if "append/replay_policy" not in disabled and case["event"]["replay_policy"] == "projector_replay_only":
        return "replay_only_not_appendable"
    if "append/admission" not in disabled and case["admitted"] is not True:
        return "refused_before_dedupe"
    if "append/payload_type" not in disabled and not (case['event']['payload'] is None or isinstance(case['event']['payload'], dict)):
        return 'invalid_payload_type'
    if "append/inline_limit" not in disabled and case['event']['payload'] is not None and len(canonical(case['event']['payload']))>16*1024:
        return 'inline_payload_limit'
    if "append/dedupe_proof" not in disabled and case["proof_available"] is not True:
        return "dedupe_unavailable"
    if case["original"] is None:
        return "append_new"
    return "return_original_receipt" if "append/semantic_body" in disabled or semantic_digest(case["event"]) == semantic_digest(case["original"]) else "idempotency_conflict"


def print_result(result, argv):
    if "--guard-table" in argv:
        path = Path(argv[argv.index("--guard-table") + 1])
        path.write_text(json.dumps(result, indent=2) + "\n")
    small = {k: v for k, v in result.items() if k not in ("guard_removal", "schema_type_inventory")}
    small['schema_type_guards_inventoried'] = len(result.get('schema_type_inventory', {}))
    small["guards_removed"] = len(result["guard_removal"])
    print(json.dumps(small, indent=2))
    return 0 if result["status"] == "pass" else 1


def append_guards(case, disabled=()):
    result=append_result(case,disabled)
    guards={'replay_only_not_appendable':'append/replay_policy',
            'refused_before_dedupe':'append/admission',
            'dedupe_unavailable':'append/dedupe_proof',
            'idempotency_conflict':'append/semantic_body',
            'inline_payload_limit':'append/inline_limit'}
    guards['invalid_payload_type']='append/payload_type'
    return {guards[result]} if result in guards else set()


def materialize_cases(cases):
    """Apply explicit JSON-pointer edits to a prior valid fixture, without IO."""
    by_id={};out=[]
    for case in cases:
        c=copy.deepcopy(case)
        if 'base_id' in c:
            baseline=by_id[c['base_id']]
            if not baseline['valid']:raise ValueError('negative fixture base must be valid')
            value=copy.deepcopy(baseline['input'])
            for edit in c['changes']:
                if edit['path'] == '' and edit['op'] == 'replace':
                    value=copy.deepcopy(edit['value']);continue
                path=[x.replace('~1','/').replace('~0','~') for x in edit['path'].split('/')[1:]]
                parent=value
                for part in path[:-1]:parent=parent[int(part)] if isinstance(parent,list) else parent[part]
                key=int(path[-1]) if isinstance(parent,list) else path[-1]
                if edit['op']=='remove':del parent[key]
                elif edit['op'] in ('add','replace'):parent[key]=copy.deepcopy(edit['value'])
                else:raise ValueError('unknown fixture edit')
            c['input']=value;c['base']=copy.deepcopy(baseline['input'])
        if c['id'] in by_id:raise ValueError('duplicate fixture id: '+c['id'])
        by_id[c['id']]=c;out.append(c)
    return out
