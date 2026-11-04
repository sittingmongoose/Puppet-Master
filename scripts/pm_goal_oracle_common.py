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
_SCHEMA_CONTEXT = contextvars.ContextVar('goal_schema_guards', default=('', frozenset()))

def _keyword_guard(keyword, function):
    def guarded(v, expected, value, schema):
        prefix, disabled = _SCHEMA_CONTEXT.get()
        # Semantically duplicate closure keywords are one closed-member rule.
        name = 'closed_members' if keyword in ('additionalProperties','unevaluatedProperties') else keyword
        location=schema.get('x-pm-oracle-id')
        if location is None:location=json.dumps(schema,sort_keys=True)
        ident = prefix + '/schema/' + hashlib.sha256(location.encode()).hexdigest()[:16] + '/' + name
        _SCHEMA_LOCATIONS[ident]=location+'/'+name
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
    # These fixtures use string keys, integers and strings, no non-JCS floats.
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()


def sha(value):
    return hashlib.sha256(canonical(value)).hexdigest()


def schema_registry(paths, disabled=()):
    """Eagerly resolve every reference, including unused definitions. No network."""
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
    relevant=frozenset(g for g in disabled if g.startswith(prefix+'/schema/'))
    key=(id(v),sha(value),prefix,relevant)
    if key in _SCHEMA_CACHE:return set(_SCHEMA_CACHE[key])
    def errors_without(disabled):
        token=_SCHEMA_CONTEXT.set((prefix,frozenset(disabled)))
        try:return list(v.iter_errors(value))
        finally:_SCHEMA_CONTEXT.reset(token)
    errors=errors_without(relevant)
    if not errors:
        _SCHEMA_CACHE[key]=frozenset();return set()
    def candidates(error,depth=0):
        for child in error.context:yield from candidates(child,depth+1)
        if hasattr(error,'oracle_guard'):yield (depth,error.oracle_guard)
    # Identify the deepest actual predicate whose removal makes this input valid.
    # If none alone suffices, preserve all errors and flag the masked negative.
    options=sorted(set(x for e in errors for x in candidates(e)),reverse=True)
    causal=[]
    for depth,guard in options:
        if not errors_without(relevant|{guard}):causal.append((depth,guard))
    if causal:
        out={causal[0][1]}
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
        self.literal_guards=set()
        if source.is_file():
            tree=ast.parse(source.read_text())
            self.literal_guards={node.args[0].value for node in ast.walk(tree)
                if isinstance(node,ast.Call) and isinstance(node.func,ast.Attribute)
                and node.func.attr=='require' and node.args
                and isinstance(node.args[0],ast.Constant) and isinstance(node.args[0].value,str)}

    def case(self, name, evaluate, value, valid, *, base=None):
        self.cases.append((name, evaluate, copy.deepcopy(value), valid, copy.deepcopy(base)))

    def run(self):
        negatives = []
        seen=set()
        seen_token=_SEEN_GUARDS.set(seen)
        for name, evaluate, value, valid, base in self.cases:
            errors = evaluate(value, set())
            if bool(errors) == valid:
                self.failures.append(f"{name}: expected valid={valid}, guards={sorted(errors)}")
            if not valid:
                if len(errors) != 1:
                    self.failures.append(f"{name}: masked negative ({len(errors)} guards): {sorted(errors)}")
                if base is not None and evaluate(base, set()):
                    self.failures.append(f"{name}: negative's baseline is invalid")
                negatives.append((name, evaluate, value, errors))
        _SEEN_GUARDS.reset(seen_token)
        missing=(seen|self.literal_guards)-{g for _,_,_,errors in negatives for g in errors}
        if missing:self.failures.append("guards without isolated negatives: "+", ".join(sorted(missing)))
        table = []
        for guard in sorted({g for _, _, _, errors in negatives for g in errors}):
            flips, stays, masked = [], [], []
            for name, evaluate, value, errors in negatives:
                weakened = evaluate(value, {guard})
                if not weakened:
                    flips.append(name)
                else:
                    stays.append(name)
                if errors == {guard} and weakened:
                    masked.append(name)
                if guard not in errors and not weakened:
                    self.failures.append(f"{guard}: unrelated negative {name} passed")
            if not flips or masked:
                self.failures.append(f"{guard}: surviving guard mutant; masked={masked}")
            table.append({"guard": guard, "schema_location":_SCHEMA_LOCATIONS.get(guard), "negatives_that_flip": flips,
                          "negatives_that_stay_rejected": stays, "masked": masked})
        return {"status": "fail" if self.failures else "pass", "cases": len(self.cases),
                "negative_cases": len(negatives), "guard_removal": table, "unproved_guards":sorted(missing),
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
    if "append/admission" not in disabled and not case["admitted"]:
        return "refused_before_dedupe"
    if "append/inline_limit" not in disabled and case['event']['payload'] is not None and len(canonical(case['event']['payload']))>16*1024:
        return 'inline_payload_limit'
    if "append/dedupe_proof" not in disabled and not case["proof_available"]:
        return "dedupe_unavailable"
    if case["original"] is None:
        return "append_new"
    return "return_original_receipt" if "append/semantic_body" in disabled or semantic_digest(case["event"]) == semantic_digest(case["original"]) else "idempotency_conflict"


def print_result(result, argv):
    if "--guard-table" in argv:
        path = Path(argv[argv.index("--guard-table") + 1])
        path.write_text(json.dumps(result, indent=2) + "\n")
    small = {k: v for k, v in result.items() if k != "guard_removal"}
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
