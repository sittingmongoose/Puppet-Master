#!/usr/bin/env python3
"""DT contract oracles: schema, original-source, transition, recovery and checkpoint vectors.

Models assume the named original-owner/SP-278 authentication adapters. They do not
execute native Storage, redb, provider or Git operations and never admit a family.
Sweep part 2B: numbers through the shared CV-1100/SP-1100 calls, timestamps through
the shared CV-1101 predicate with each owner's profile, and retained originals
through SP-1101's RetainedDispatcher over sealed custody (pm_event_numbers and
pm_event_datetime, merged unchanged from the gated NUMRULE head 58c2816ff3).
"""
import ast
import base64
import copy
import hashlib
import importlib
import json
import calendar
from decimal import Decimal
from pathlib import Path
from jsonschema import Draft202012Validator, validators
from jsonschema.exceptions import ValidationError
# Shared number rule (CV-1100, SP-1100, SP-1101) and CV-1101 date-time predicate,
# merged unchanged from the gated NUMRULE head 58c2816ff3 (sweep part 2B).
from pm_event_numbers import (
    APP_PHYSICAL, EVENT_VALUE, UINT64_MAX, FrozenRecipe, JsonNumber, OriginalBinding, OriginalCustody, RecipeTuple,
    Refusal, RetainedDispatcher, current_integer, decode_storage_value, storage_uint64, storage_value_bytes)
import pm_event_numbers
from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z, date_time, format_checker
from referencing import Registry, Resource
from referencing.exceptions import Unresolvable
from referencing.jsonschema import DRAFT202012
from urllib.parse import unquote, urlsplit
ROOT = Path(__file__).resolve().parents[1]
_BOUNDARY_INPUTS = {}
PRODUCER_FIELDS = (
    'event_type', 'scope_kind', 'project_id', 'thread_id', 'run_id', 'node_id',
    'attempt_id', 'actor_ref', 'requested_account_ref', 'effective_account_ref',
    'occurred_at_utc', 'producer_sequence_id', 'correlation_id', 'causation_event_id',
    'parent_event_id', 'idempotency_key', 'payload_schema_id', 'payload', 'payload_ref',
    'redaction_profile', 'migration',
)

# Method B guard tables (sweep part 2A). Every product refusal of this checker
# is one named row of one phase table (scripts/pm_dt_table_<phase>.py, generated
# by scripts/pm-dt-table-generate.py), evaluated in the table's declared order.
# Derivation code below computes observations only (canonical bytes, digests,
# recomputed identities, type names, presence, mismatch lists); a refusal is
# issued only by a row. A boundary is an ordered chain of phases.
TABLE_PHASES = (
    'src_envelope', 'src_replay', 'src_inline', 'src_definition', 'src_schema', 'src_size', 'src_stage', 'src_original',
    'src_scope', 'src_project_only', 'src_payload', 'src_join', 'src_identity', 'src_context', 'id_inputs',
    'append_types', 'append_retry',
    'rec_gate', 'rec_custody', 'rec_commit', 'rec_original', 'rec_receipt', 'rec_receipt_join',
    'cp_schema', 'cp_lifecycle', 'cp_cas', 'cp_token', 'cp_source', 'cp_rows', 'cp_prefix', 'cp_coverage', 'cp_state',
    'hr_flags_a', 'hr_flags_b', 'hr_original',
    'tool_request', 'tr_approval_requested', 'tr_approval_granted', 'tr_approval_denied', 'tr_approval_timeout',
    'tr_config_migrated', 'gate_score', 'tr_gate_started', 'tr_gate_failed_a', 'tr_gate_failed_b',
    'tr_gate_passed_a', 'tr_gate_passed_b', 'tr_requirements', 'tr_background', 'denial', 'tr_tool_denied',
    'tr_tool_completed', 'tr_tool_started', 'tr_tool_invoked', 'tr_usage_a', 'tr_usage_b',
    'usage_values_a', 'usage_values_b', 'tr_worktree_created', 'tr_worktree_deleted_a', 'tr_worktree_deleted_b',
    'batch_parent', 'batch_child', 'batch_success', 'source_codec', 'accounting', 'schema_verdict', 'references',
    'retention', 'projection_retention',
)
_TABLE_ROWS = {}
_TABLE_FIELDS = {}
# Set to a list only by the guard-table suite builder (scripts/pm_dt_guard_suites.py).
RECORDER = None
# Standing-check trials only (scripts/pm-dt-standing-checks.py): (phase, row)
# pairs swapped to always-pass for one trial. No checker path sets it.
CUT_ROWS = frozenset()


class TableRefusal(ValueError):
    """A refusal issued by one named table row (phase, row, code)."""
    def __init__(self, phase, row, code):
        self.phase, self.row, self.code = phase, row, code
        super().__init__(code)


def table_module(phase):
    return importlib.import_module('pm_dt_table_' + phase)


def table_rows(phase):
    """The phase's (row, predicate, context) list in declared table order."""
    rows = _TABLE_ROWS.get(phase)
    if rows is None:
        case = table_module(phase).case(None)
        rows = _TABLE_ROWS[phase] = [(name, guard.predicate, case.context) for name, guard in case.table.guards.items()]
        _TABLE_FIELDS[phase] = table_module(phase).FIELDS
    return rows


def table_refusal(phase, facts):
    """First refusing row of one phase, as (row, code), or None.

    The observation holds exactly the table's FIELDS; any other key set is a
    derivation fault, never a refusal.
    """
    rows = table_rows(phase)
    fields = _TABLE_FIELDS[phase]
    if set(facts) != set(fields):
        raise KeyError('observation fields differ from table FIELDS: ' + phase)
    observed = {k: facts[k] for k in fields}
    refusal = None
    for name, predicate, context in rows:
        if (phase, name) in CUT_ROWS:
            continue
        code = predicate(observed, context)
        if code is not None:
            refusal = (name, code)
            break
    if RECORDER is not None:
        RECORDER.append((phase, copy.deepcopy(observed), refusal))
    return refusal


def require(phase, facts):
    refusal = table_refusal(phase, facts)
    if refusal is not None:
        raise TableRefusal(phase, *refusal)


def run_steps(steps):
    """Require each (phase, facts) step in order; later facts are derived only after earlier phases pass."""
    for phase, facts in steps:
        require(phase, facts)


def table_order_errors():
    """Each factory's check() requires its rows in exactly the table order, and every phase is declared."""
    errors = []
    found = sorted(p.name[len('pm_dt_table_'):-3] for p in (ROOT / 'scripts').glob('pm_dt_table_*.py'))
    if found != sorted(TABLE_PHASES):
        errors.append('declared phases differ from table modules')
    for phase in TABLE_PHASES:
        tree = ast.parse((ROOT / ('scripts/pm_dt_table_' + phase + '.py')).read_text())
        factory = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'case')
        check = next(n for n in factory.body if isinstance(n, ast.FunctionDef) and n.name == 'check')
        required = [c.args[0].value for c in ast.walk(check) if isinstance(c, ast.Call) and ast.unparse(c.func) == 'table.require']
        if required != [name for name, _, _ in table_rows(phase)]:
            errors.append(phase)
    return errors


def type_name(value):
    return type(value).__name__


def nonbool(mapping, keys):
    return [k for k in keys if type(mapping[k]) is not bool]


def value_digest(value):
    """SHA-256 of pm.dt.source.json.v1 bytes; a value with no encoding raises, as the byte joins did."""
    return hashlib.sha256(canonical(value)).hexdigest()


def canonical_text(value):
    return canonical(value).decode('utf-8')


def source_digest(value):
    return hashlib.sha256(source_bytes(value)).hexdigest()


def schema_error_count(validator, value):
    """Schema errors of one value. jsonschema formats each error message with repr(instance),
    which raises ValueError for an integer past Python's 4,300-digit str() limit: that only
    happens while an error is being reported, so it counts as one more error, never a crash."""
    count = 0
    errors = validator.iter_errors(value)
    while True:
        try:
            next(errors)
        except StopIteration:
            return count
        except ValueError:
            return count + 1
        count += 1


def schema_valid(validator, value):
    return schema_error_count(validator, value) == 0


def schema_accepts(validator, value):
    """One complete schema occurrence, decided only by the schema_verdict row."""
    return table_refusal('schema_verdict', {'errors': schema_error_count(validator, value)}) is None


# CV-1101: every `format: date-time` this lane validates is a DT family field
# (payload ts, captured/occurrence/deadline/readiness/settlement times, checkpoint
# publication and withdrawal times) or the EventRecord occurred_at_utc, all on the
# broad EventRecord profile; no DT owner unit selects a stricter profile. The
# shared registered predicate runs through the validator (a bare FormatChecker()
# has no date-time checker in this environment and accepted any string).
DATE_TIME_FORMAT = format_checker(profile=EVENT_RECORD)


def exact_integer_type(checker, instance):
    """CV-1100: a schema integer slot holds an exact int (shared current_integer), never 1.0 or a bool."""
    try:
        current_integer(instance)
    except Refusal:
        return False
    return True


# Every schema integer slot (nested, nullable and alternative ones included)
# reaches the shared current_integer through the `type` keyword; the slot's own
# minimum/maximum stay in the owner schema. Number slots keep JSON Schema's number.
DTValidator = validators.extend(
    Draft202012Validator, type_checker=Draft202012Validator.TYPE_CHECKER.redefine('integer', exact_integer_type))


def lane_validator(schema):
    """The lane validator: owner schema, shared integer slots and the registered CV-1101 predicate."""
    return DTValidator(schema, format_checker=DATE_TIME_FORMAT)


STORAGE_TIME_FIELDS = ('observed_at_utc', 'persisted_at_utc')


class EventRecordValidator:
    """The complete current EventRecord envelope verdict.

    The pinned envelope schema with the shared integer slots and the broad
    CV-1101 predicate, then CV-253's storage_utc_z profile on the two
    Storage-assigned times and SP-1100's exact uint64 on Storage sequence_id.
    The schema bytes are unchanged; composition adds the owner constraints.
    """

    def __init__(self, schema):
        self.schema = schema
        self.base = lane_validator(schema)

    def iter_errors(self, event):
        yield from self.base.iter_errors(event)
        if type(event) is not dict:
            return
        for field in STORAGE_TIME_FIELDS:
            value = event.get(field)
            if isinstance(value, str):
                try:
                    date_time(value, profile=STORAGE_UTC_Z)
                except Refusal as refusal:
                    yield ValidationError('%r is not a storage_utc_z date-time (%s)' % (value, refusal.reason),
                                          validator='format', validator_value='date-time', instance=value, path=(field,))
        if 'sequence_id' in event and exact_integer_type(None, event['sequence_id']):
            try:
                storage_uint64(event['sequence_id'])
            except Refusal as refusal:
                yield ValidationError('sequence_id is not a Storage uint64 (%s)' % refusal.reason, validator='maximum',
                                      validator_value=UINT64_MAX, instance=event['sequence_id'], path=('sequence_id',))

    def is_valid(self, event):
        return schema_valid(self, event)


def event_schema_errors(event):
    return schema_error_count(EventRecordValidator(load('Plans/event_record.schema.json')), event)


def int_text(value):
    """Exact shortest signed decimal of an int of any length (no 4,300-digit str() limit)."""
    return str(value) if -10 ** 18 < value < 10 ** 18 else str(Decimal(value))


def exact_instant(value, profile=EVENT_RECORD):
    """CV-1101: (refusal, instant) for one timestamp under the shared date_time predicate.

    The instant is (POSIX seconds with the signed offset applied, leap-second
    flag, fractional digits without trailing zeros): tuple order is exact
    instant order, comparing offsets mathematically and every fractional digit,
    with no float, microsecond truncation or host datetime range. The string
    itself is never rewritten.
    """
    try:
        date_time(value, profile=profile)
    except Refusal as refusal:
        return refusal.reason, None
    year, month, day = int(value[0:4]), int(value[5:7]), int(value[8:10])
    hour, minute, second = int(value[11:13]), int(value[14:16]), int(value[17:19])
    rest = value[19:]
    fraction = ''
    if rest.startswith('.'):
        digits = len(rest) - len(rest[1:].lstrip('0123456789')) - 1
        fraction, rest = rest[1:1 + digits], rest[1 + digits:]
    offset = 0 if rest in ('Z', 'z') else (1 if rest[0] == '+' else -1) * (int(rest[1:3]) * 3600 + int(rest[4:6]) * 60)
    previous = year - 1
    days = (365 * previous + previous // 4 - previous // 100 + previous // 400
            + sum(calendar.monthrange(year, m)[1] for m in range(1, month)) + day)
    leap = 1 if second == 60 else 0
    seconds = days * 86400 + hour * 3600 + minute * 60 + (59 if leap else second) - offset
    return None, (seconds, leap, fraction.rstrip('0'))


def elapsed_days(later, earlier):
    """Whole POSIX days from one exact instant to another (floor); a leap second adds no POSIX second."""
    width = max(len(later[2]), len(earlier[2]))
    scale = 10 ** width
    total = (later[0] - earlier[0]) * scale + int(later[2].ljust(width, '0') or 0) - int(earlier[2].ljust(width, '0') or 0)
    return total // (86400 * scale)


def load(path):
    return json.loads((ROOT / path).read_text())


def schema_reference_errors(documents, mirrors=()):
    """Resolve every schema reference, including unused branches and resources.

    Resources retain their document root and nested $id/anchor context. Local
    external bundles are loaded without network access and walked in full too.
    Storage mirrors use their declared source schema's root, not the row object.
    """
    pending = []
    errors = []

    def resource(value):
        return Resource.from_contents(value, default_specification=DRAFT202012)

    def retrieve(uri):
        nonlocal registry
        parsed = urlsplit(uri)
        if parsed.scheme != 'file' or parsed.netloc not in ['', 'localhost']:
            raise ValueError('schema resource is not in the local bundle: ' + uri)
        path = Path(unquote(parsed.path)).resolve()
        relative = path.relative_to(ROOT.resolve()).as_posix()
        value = resource(load(relative))
        registry = registry.with_resource(uri, value)
        if value.id():
            registry = registry.with_resource(value.id(), value)
        registry = registry.crawl()
        pending.append((relative, value, uri))
        return value

    registry = Registry(retrieve=retrieve)
    for path, document in documents.items():
        value = resource(document)
        uri = (ROOT / path).as_uri()
        registry = registry.with_resource(uri, value)
        if value.id():
            registry = registry.with_resource(value.id(), value)
        pending.append((path, value, uri))
    registry = registry.crawl()
    for label, schema, source_ref in mirrors:
        source_path = source_ref.split('#', 1)[0]
        base = documents[source_path].get('$id', (ROOT / source_path).as_uri())
        pending.append((label, resource(schema), base))
    visited = set()

    def walk(label, value, resolver, enter=True):
        if enter:
            resolver = resolver.in_subresource(value)
        marker = (id(value.contents), resolver._base_uri)
        if marker in visited:
            return
        visited.add(marker)
        if isinstance(value.contents, dict):
            for keyword in ['$ref', '$dynamicRef']:
                if keyword not in value.contents:
                    continue
                ref = value.contents[keyword]
                try:
                    resolved = resolver.lookup(ref)
                    # A reference to a scalar is not a usable JSON Schema.
                    if not isinstance(resolved.contents, (dict, bool)):
                        raise ValueError('reference target is not a schema')
                    walk(label + ' -> ' + ref, resource(resolved.contents), resolved.resolver, enter=False)
                except (Unresolvable, ValueError, TypeError) as exc:
                    errors.append(label + ': ' + keyword + '=' + str(ref) + ': ' + type(exc).__name__)
            for index, child in enumerate(value.subresources()):
                walk(label + '/subschema/' + str(index), child, resolver)

    while pending:
        label, value, uri = pending.pop(0)
        walk(label, value, registry.resolver(uri))
    return errors


def canonical(value):
    """pm.dt.source.json.v1: exact integers, plain finite decimals, UTF-8 key order."""
    def encode(v):
        if v is None:
            return 'null'
        if isinstance(v, bool):
            return 'true' if v else 'false'
        if isinstance(v, int):
            return int_text(v)
        if isinstance(v, float) and v.is_integer():
            # An integral binary64 is an exact integer value. Decimal(str(v))
            # can instead choose a nearby shortest-round-trip decimal above
            # 2**53; never replace the validator's actual integer with it.
            return str(int(v))
        if isinstance(v, (float, Decimal)):
            d = Decimal(str(v))
            if not d.is_finite():
                raise ValueError('nonfinite number')
            if d == 0:
                return '0'
            s = format(d, 'f')
            return s.rstrip('0').rstrip('.') if '.' in s else s
        if isinstance(v, str):
            v.encode('utf-8', errors='strict')
            return json.dumps(v, ensure_ascii=False, separators=(',', ':'))
        if isinstance(v, list):
            return '[' + ','.join(encode(x) for x in v) + ']'
        if isinstance(v, dict) and all(isinstance(k, str) for k in v):
            return '{' + ','.join(encode(k) + ':' + encode(v[k]) for k in sorted(v, key=lambda x: x.encode('utf-8'))) + '}'
        raise ValueError('unsupported value')
    return encode(value).encode('utf-8')


def decode_source(raw):
    """Strict pm.dt.source.json.v1 decode; every refusal is a source_codec row (a ValueError)."""
    facts = {'size': len(raw), 'utf8': True, 'json': False, 'duplicate_keys': 0, 'nonfinite_constants': 0, 'canonical': False}
    counts = {'duplicate_keys': 0, 'nonfinite_constants': 0}
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                counts['duplicate_keys'] += 1
            result[key] = value
        return result
    def constant(_):
        counts['nonfinite_constants'] += 1
        return None
    value = None
    try:
        text = raw.decode('utf-8')
    except UnicodeDecodeError:
        facts['utf8'] = False
    else:
        try:
            # Shared integer-token carrier (CV-1100): every integer token is an
            # exact int of any length, never Python's 4,300-digit int().
            value = json.loads(text, object_pairs_hook=unique, parse_int=lambda token: JsonNumber(token, True).exact(),
                               parse_float=Decimal, parse_constant=constant)
            facts['json'] = True
        except json.JSONDecodeError:
            pass
    facts.update(counts)
    if facts['json'] and not counts['duplicate_keys'] and not counts['nonfinite_constants']:
        try:
            facts['canonical'] = canonical(value) == raw
        except ValueError:
            facts['canonical'] = False
    require('source_codec', facts)
    return value


def sha(value):
    return hashlib.sha256(canonical(value)).hexdigest()




def unsigned_integer_valid(value):
    """The owner's u64 slot (0..2^64-1) through the shared current_integer (CV-1100)."""
    try:
        current_integer(value, minimum=0, maximum=UINT64_MAX)
    except Refusal:
        return False
    return True


def storage_sequence_valid(value):
    """A Storage-assigned sequence: exact uint64 through the shared storage_uint64 (SP-1100)."""
    try:
        storage_uint64(value)
    except Refusal:
        return False
    return True


def producer_semantic_bytes(event):
    """CV-EventRecord's exact caller-owned projection through the shared qualified RFC 8785 (CV-317, CV-1100).

    An exact integer the JCS route cannot preserve (beyond 2^53 where binary64
    loses it, or a mathematically different JCS decimal) raises Refusal; the
    current writer refuses it before append (SV36). pm.dt.source.json.v1 stays
    the separate exact source custody codec.
    """
    return pm_event_numbers.producer_semantic_bytes(event)


def producer_semantic_digest(event):
    return pm_event_numbers.producer_semantic_digest(event)


def producer_refusal(event):
    """The shared producer route's refusal reason for this event, or None."""
    try:
        producer_semantic_digest(event)
    except Refusal as refusal:
        return refusal.reason
    return None


def retry_digest(event):
    """The producer digest a retry compares, or None when the route refuses (AM02 then refuses)."""
    try:
        return producer_semantic_digest(event)
    except Refusal:
        return None


def patterned_values(schema, value, path=()):
    """Visit concrete identifier values, including nullable/alternative schemas."""
    if isinstance(value, str) and 'pattern' in schema:
        yield path, value, schema
    if isinstance(value, dict):
        for key, child in value.items():
            yield from patterned_values(schema.get('properties', {}).get(key, {}), child, path + (key,))
    if isinstance(value, list):
        for index, child in enumerate(value):
            yield from patterned_values(schema.get('items', {}), child, path + (index,))
    for keyword in ['anyOf', 'oneOf', 'allOf']:
        for branch in schema.get(keyword, []):
            yield from patterned_values(branch, value, path)


def set_path(value, path, replacement):
    for key in path[:-1]:
        value = value[key]
    value[path[-1]] = replacement


def identifier_checks(c, f, schemas, check):
    """F7: mutate every populated patterned value, not just one token hash."""
    name = c['event_type']; slug = name.replace('.', '_')
    cases = [(slug, f['valid_payload']), (slug + '_source', f['prepared_source']),
             (slug + '_source', f['completed_source']), (slug + '_checkpoint', f['checkpoint'])]
    for variant in f['positive_variants']:
        source = slug + ('_application_source' if variant['event']['scope_kind'] == 'application' else '_source')
        cases.extend([(source, variant['prepared']), (source, variant['completed'])])
    for definition, value in cases:
        validator = lane_validator(schemas[definition])
        for path, identifier, rule in patterned_values(schemas[definition], value):
            exact = rule.get('minLength') == rule.get('maxLength') and 'maxLength' in rule
            check(exact or rule['pattern'].endswith(r'(?![\s\S])'), name + ': full-string identifier guard ' + definition + str(path))
            bad = copy.deepcopy(value); set_path(bad, path, identifier + '\n')
            check(not schema_accepts(validator, bad), name + ': trailing-LF identifier refused ' + definition + str(path))
    # Keep all token witnesses coherent, so schema grammar alone must refuse.
    for path, identifier, _ in patterned_values(schemas[slug + '_checkpoint'], f['checkpoint']):
        case = copy.deepcopy(f['checkpoint_cases'][0])
        set_path(case['proposed'], path, identifier + '\n')
        case['context']['current_token'] = copy.deepcopy(case['proposed']['index_read_token'])
        case['context']['verified_prefix']['index_read_token'] = copy.deepcopy(case['proposed']['index_read_token'])
        check(checkpoint_result(c, case['previous'], case['proposed'], case['context'], schemas[slug + '_checkpoint']) == 'schema_refused',
              name + ': coherent trailing-LF checkpoint refused ' + str(path))
    # Coherently changed original hash plus payload must still fail grammar.
    hash_join = {'config.migrated': ('source_sha256', 'source_sha256'),
                 'usage.event': ('observation_sha256', 'provider_payload_hash')}.get(name)
    if hash_join:
        for variant in [dict(prepared=f['prepared_source'], completed=f['completed_source'], event=f['event_record'])] + f['positive_variants']:
            a, b, e = (copy.deepcopy(variant[k]) for k in ['prepared', 'completed', 'event'])
            before_field, payload_field = hash_join
            if a['before'][before_field] is None:
                continue
            a['before'][before_field] += '\n'; b['before'][before_field] += '\n'
            b['payload'][payload_field] += '\n'; e['payload'][payload_field] += '\n'
            b['prepared_sha256'] = hashlib.sha256(source_bytes(a)).hexdigest()
            check(source_valid(c, a, b, e, schemas) == 'schema_refused', name + ': coherent trailing-LF payload hash refused')


def partition_for(event):
    if event['scope_kind'] == 'application':
        return 'app' if event['project_id'] is None else None
    if not event['project_id']:
        return None
    return 'project~' + base64.urlsafe_b64encode(event['project_id'].encode()).decode().rstrip('=')


def application_bytes(value):
    """CV-366 app physical MessagePack: the shared storage_value_bytes APP_PHYSICAL profile (SP-1100).

    Finite binary64 as float64, exact integers in minimal width (int64..uint64),
    UTF-8 key order. An unsupported value raises Refusal (a ValueError).
    """
    return storage_value_bytes(value, profile=APP_PHYSICAL)


def inline_bytes(value):
    """An inline EventRecord body's stored bytes: SP-236 EVENT_VALUE through the shared storage_value_bytes."""
    return storage_value_bytes(value, profile=EVENT_VALUE)


def source_bytes(value):
    return application_bytes(value) if value['envelope_context']['scope_kind'] == 'application' else canonical(value)


def identity(contract, payload, partition='project~cHJvamVjdC0x', application=None):
    """Identity recipe; its input refusals are id_inputs rows (TableRefusal is a ValueError)."""
    blocked = 'blocked_sequence' in contract['identity_fields']
    app = partition == 'app'
    facts = {'blocked_in_identity': blocked,
             'blocked_valid': unsigned_integer_valid(payload['blocked_sequence']) if blocked else True,
             'application_partition': app, 'application_present': application is not None,
             'recomputed_operation': None, 'owner_operation_id': None}
    # CV-1100: blocked_sequence is an exact int (1.0 refuses at ID01); its
    # identity spelling is the shortest unsigned decimal string of any length.
    # Never convert an exact u64 through binary64.
    def subjects():
        return [canonical(payload[k]).decode('utf-8') if k == 'blocked_sequence' else payload[k]
                for k in contract['identity_fields']]
    if app and application is not None and facts['blocked_valid']:
        facts['recomputed_operation'] = sha([contract['event_type'], application['original_owner_operation_id']] + subjects())
        facts['owner_operation_id'] = application['owner_operation_id']
    require('id_inputs', facts)
    if app:
        operation = facts['recomputed_operation']
        key = 'application@1:' + application['application_scope']['server_id'].encode().hex() + ':' + operation.encode().hex()
    else:
        # Array elements are strings, without u64/IEEE-754 rounding.
        key = 'dt:' + sha([contract['event_type'], partition] + subjects())
    return key, 'evt_dt_' + hashlib.sha256(key.encode()).hexdigest()


def append_model(seen, key, digest, result):
    try:
        require('append_types', {'key_type': type_name(key), 'digest_type': type_name(digest)})
    except TableRefusal as refusal:
        return refusal.code, None
    if key in seen:
        old_digest, original = seen[key]
        try:
            require('append_retry', {'stored_digest_type': type_name(old_digest), 'stored_digest': old_digest, 'digest': digest})
        except TableRefusal as refusal:
            return refusal.code, None
        return 'original', original
    seen[key] = (digest, copy.deepcopy(result))
    return 'appended', result


def copy_mismatches(left, right, keys, missing=False):
    """Fields whose canonical bytes differ (left.get when the owner reads an optional field)."""
    return [k for k in keys if canonical(left.get(k) if missing else left[k]) != canonical(right[k])]


def tool_request_steps(payload, before):
    yield 'tool_request', {'request_kind': before['request_kind'], 'payload_tool_use_id': payload.get('tool_use_id'),
                           'payload_has_tool_use_id': 'tool_use_id' in payload, 'before_tool_use_id': before['tool_use_id']}


def gate_score_steps(payload, before, outcome):
    """Numeric gate results retain Executor's dispatch context, not a new score policy."""
    context = payload.get('dispatch_score_tuple')
    yield 'gate_score', {
        'payload_score': canonical_text(payload.get('score')), 'outcome_score': canonical_text(outcome['score']),
        'payload_threshold': canonical_text(payload.get('score_threshold')), 'before_threshold': canonical_text(before['score_threshold']),
        'payload_dispatch_ref': canonical_text(payload.get('dispatch_score_ref')), 'before_dispatch_ref': canonical_text(before['dispatch_score_ref']),
        'payload_dispatch_tuple': canonical_text(context), 'before_dispatch_tuple': canonical_text(before['dispatch_score_tuple']),
        'scored': 'score' in payload or 'score_threshold' in payload, 'tuple_present': context is not None,
        'payload_node_id': payload.get('node_id'), 'tuple_node_id': context['node_id'] if type(context) is dict else None,
        'dispatch_ref_truthy': bool(payload.get('dispatch_score_ref'))}


def denial_steps(before):
    # DL-430: FileSafe saves its dedicated refusal only, never tool.denied.
    yield 'denial', {'denial_origin': before['denial_origin'], 'policy_decision': before['policy_decision'],
                     'dispatch_state': before['dispatch_state']}


def usage_value_steps(p):
    cost = p['cost']
    yield 'usage_values_a', {
        'payload_cost': canonical_text(p['cost_microdollars']), 'record_cost': canonical_text(cost['cost_microdollars']),
        'cost_mismatches': copy_mismatches(p, cost, ['currency', 'cost_status', 'pricing_snapshot_id', 'pricing_source', 'pricing_effective_at', 'pricing_version']),
        'cost_status': cost['cost_status'], 'amount_present': cost['cost_microdollars'] is not None or cost.get('cost_minor_units') is not None,
        'display_cost_policy': p.get('display_cost_policy')}
    quota = p['quota']
    yield 'usage_values_b', {
        'cost_status': cost['cost_status'],
        'pricing_missing': [k for k in ['pricing_snapshot_id', 'pricing_source', 'pricing_effective_at', 'pricing_version'] if cost.get(k) is None],
        'quota_status': quota['quota_status'],
        'quota_values_present': [k for k in ['quota_remaining', 'quota_used', 'quota_limit', 'reset_at', 'cooldown_until'] if quota.get(k) is not None],
        'credits_status': quota.get('credits_status', 'unknown'), 'credits_remaining_present': quota.get('credits_remaining') is not None,
        'window_kind': quota['window_kind'], 'window_times_present': quota.get('reset_at') is not None or quota.get('cooldown_until') is not None}




def transition_steps(name, payload, before, outcome):
    """The separately authored owner predicates for each exact family, as ordered table phases."""
    if name.startswith('gate.'):
        yield from gate_score_steps(payload, before, outcome)
    if name == 'approval.requested':
        yield 'tr_approval_requested', {'episode_state': before['episode_state'], 'actions_truthy': bool(payload['allowed_action_ids']),
                                        'payload_actions': payload['allowed_action_ids'], 'before_actions': before['allowed_action_ids']}
        yield from tool_request_steps(payload, before)
    elif name == 'approval.granted':
        yield 'tr_approval_granted', {'episode_state': before['episode_state'], 'human_authenticated': before['human_authenticated'],
                                      'paused': before['paused'], 'revoked': before['revoked'],
                                      'action_listed': payload['allowed_action_id'] in before['allowed_action_ids']}
        yield from tool_request_steps(payload, before)
    elif name == 'approval.denied':
        yield 'tr_approval_denied', {'episode_state': before['episode_state']}
        yield from tool_request_steps(payload, before)
    elif name == 'approval.timeout':
        # CV-1101: both times pass the shared predicate, then compare as exact instants.
        ts_refusal, ts_instant = exact_instant(payload['ts'])
        deadline_refusal, deadline_instant = exact_instant(before['deadline_at_utc'])
        yield 'tr_approval_timeout', {'episode_state': before['episode_state'], 'ts_refusal': ts_refusal,
                                      'deadline_refusal': deadline_refusal, 'ts_instant': ts_instant,
                                      'deadline_instant': deadline_instant}
        yield from tool_request_steps(payload, before)
    elif name == 'config.migrated':
        yield 'tr_config_migrated', {
            'first_load': before['first_load'], 'payload_legacy': payload['legacy_value'], 'before_legacy': before['legacy_value'],
            'payload_source_ref': payload['source_ref'], 'before_source_ref': before['source_ref'],
            'payload_source_sha256': payload['source_sha256'], 'before_source_sha256': before['source_sha256'],
            'result_ref': payload['result_ref'], 'committed_settings_ref': outcome['committed_settings_ref'],
            'mapped_enum': {'single': 'None', 'per_phase': 'Phase', 'per_task': 'Task'}.get(payload['legacy_value']),
            'enum_value': payload['enum_value']}
    elif name == 'gate.evaluation_started':
        yield 'tr_gate_started', {'evaluation_state': before['evaluation_state'], 'payload_evaluation_id': payload['evaluation_id'],
                                  'before_evaluation_id': before['evaluation_id']}
    elif name in ['gate.failed', 'gate.passed']:
        gate = name.split('.')[1]
        yield 'tr_gate_' + gate + '_a', {
            'evaluation_state': before['evaluation_state'], 'payload_evaluation_id': payload['evaluation_id'],
            'before_evaluation_id': before['evaluation_id'], 'payload_gate_id': payload['gate_id'], 'before_gate_id': before['gate_id'],
            'report_status': outcome['report_status']}
        facts = {'questions_truthy': bool(outcome['question_ids']), 'evidence_truthy': bool(payload['evidence_refs']),
                 'payload_evidence': payload['evidence_refs'], 'outcome_evidence': outcome['evidence_refs']}
        if gate == 'failed':
            facts.update(payload_failure_code=payload['failure_reason_code'], outcome_failure_code=outcome['failure_reason_code'])
        else:
            facts['all_predicates_pass'] = outcome['all_predicates_pass']
        yield 'tr_gate_' + gate + '_b', facts
    elif name == 'requirements.clarification_requested':
        yield 'tr_requirements', {'report_status': before['report_status'], 'questions_truthy': bool(before['question_ids']),
                                  'copy_mismatches': copy_mismatches(payload, before, ['question_ids', 'report_ref', 'wizard_id', 'thread_id'])}
    elif name == 'run.background_enqueued':
        yield 'tr_background', {'queue_state': before['queue_state'],
                                'copy_mismatches': copy_mismatches(payload, before, ['enqueue_id', 'queue_record_ref', 'scope_ref', 'host_ref', 'root_ref'])}
    elif name == 'tool.denied':
        yield from denial_steps(before)
        fields = ['denial_reason_code', 'blocked_sequence', 'approval_scope_key', 'blocked_reason_code', 'failure_class', 'allowed_action_ids', 'headless_denied', 'permission_snapshot_id', 'executed_at_all']
        yield 'tr_tool_denied', {'copy_mismatches': copy_mismatches(payload, before, fields), 'executed_at_all': payload['executed_at_all'],
                                 'headless_denied': payload['headless_denied'], 'headless_reason': payload['blocked_reason_code'] == 'headless_ask_denied',
                                 'failure_class': payload['failure_class']}
    elif name == 'tool.execution_completed':
        yield 'tr_tool_completed', {'execution_state': before['execution_state'],
                                    'copy_mismatches': copy_mismatches(payload, outcome, ['result_ref', 'outcome', 'duration_ms'], missing=True)}
    elif name == 'tool.execution_started':
        yield 'tr_tool_started', {'execution_state': before['execution_state'], 'policy_decision': before['policy_decision'],
                                  'schema_valid': before['schema_valid'], 'hooks_pass': before['hooks_pass']}
    elif name == 'tool.invoked':
        request = before['web_request']
        meta = payload.get('meta')
        both = request is not None and meta is not None
        yield 'tr_tool_invoked', {
            'request_present': request is not None, 'meta_present': meta is not None,
            'tool_name': payload['tool_name'] if both else None, 'meta_tool_id': meta.get('tool_id') if both else None,
            'web_mismatches': [k for k, v in request.items() if k != 'parent_event_id' and canonical(meta.get(k)) != canonical(v)] if both else [],
            'dispatch_state': before['dispatch_state'], 'outcome_dispatch_state': outcome['dispatch_state'],
            'copy_mismatches': copy_mismatches(payload, outcome, ['success', 'latency_ms', 'index_used', 'meta'], missing=True)}
    elif name == 'usage.event':
        yield 'tr_usage_a', {'previous': before['prior_settlement_status'], 'state': payload['settlement_status'],
                             'prior_ref_truthy': bool(before['prior_usage_event_ref']),
                             'settled_at_truthy': bool(payload.get('settled_at_utc')), 'adjusted_at_truthy': bool(payload.get('adjusted_at_utc'))}
        yield 'tr_usage_b', {
            'payload_parent_run_id': payload.get('parent_run_id'), 'before_parent_run_id': before['parent_run_id'],
            'copy_mismatches': copy_mismatches(payload, before, ['usage_record_id', 'dedupe_key', 'provider_attempt_ref', 'parent_usage_record_id', 'account_id', 'billing_entity_id', 'provider_account_ref'], missing=True),
            'raw_payload_ref': payload['raw_payload_ref'], 'observation_ref': before['observation_ref'],
            'provider_payload_hash': payload['provider_payload_hash'], 'observation_sha256': before['observation_sha256']}
        yield from usage_value_steps(payload)
    elif name == 'worktree.created':
        yield 'tr_worktree_created', {'before_state': before['allocation_state'], 'outcome_state': outcome['allocation_state'],
                                      'copy_mismatches': copy_mismatches(payload, before, ['branch_name', 'worktree_path', 'repo_id', 'run_id', 'lane_id', 'package_id'], missing=True)}
    elif name == 'worktree.deleted':
        elapsed, grace = before['elapsed_grace_ms'], payload['grace_period_ms']
        yield 'tr_worktree_deleted_a', {'before_state': before['allocation_state'], 'outcome_state': outcome['allocation_state'],
                                        'elapsed_unsigned': unsigned_integer_valid(elapsed), 'grace_unsigned': unsigned_integer_valid(grace),
                                        'elapsed': elapsed, 'grace': grace}
        yield 'tr_worktree_deleted_b', {
            'before_file_lock_checked': before['file_lock_checked'], 'payload_file_lock_checked': payload['file_lock_checked'],
            'before_blockers': [k for k in ['active_lock_refs', 'safe_point_refs', 'terminal_session_refs', 'editor_session_refs', 'blocked_recovery_refs'] if before[k]],
            'active_locks_truthy': bool(payload.get('active_lock_refs')), 'safe_points_truthy': bool(payload.get('safe_point_refs')),
            'copy_mismatches': copy_mismatches(payload, before, ['repo_id', 'run_id', 'lane_id', 'package_id'], missing=True)}
    else:
        raise KeyError('no transition table for ' + name)


TRANSITION_PHASES = frozenset({
    'tool_request', 'tr_approval_requested', 'tr_approval_granted', 'tr_approval_denied', 'tr_approval_timeout',
    'tr_config_migrated', 'gate_score', 'tr_gate_started', 'tr_gate_failed_a', 'tr_gate_failed_b', 'tr_gate_passed_a',
    'tr_gate_passed_b', 'tr_requirements', 'tr_background', 'denial', 'tr_tool_denied', 'tr_tool_completed',
    'tr_tool_started', 'tr_tool_invoked', 'tr_usage_a', 'tr_usage_b', 'usage_values_a', 'usage_values_b',
    'tr_worktree_created', 'tr_worktree_deleted_a', 'tr_worktree_deleted_b'})


def transition(name, payload, before, outcome):
    """True when every owner transition row of the exact family passes."""
    try:
        run_steps(transition_steps(name, payload, before, outcome))
    except TableRefusal:
        return False
    return True


def gate_score_join(payload, before, outcome):
    try:
        run_steps(gate_score_steps(payload, before, outcome))
    except TableRefusal:
        return False
    return True


def denial_emission(before):
    try:
        run_steps(denial_steps(before))
    except TableRefusal as refusal:
        return refusal.code
    return 'emit'


def tool_request_join(payload, before):
    try:
        run_steps(tool_request_steps(payload, before))
    except TableRefusal:
        return False
    return True


def usage_values_valid(p):
    try:
        run_steps(usage_value_steps(p))
    except TableRefusal:
        return False
    return True


def accounting_totals(p):
    properties = load('Plans/dt_event_contracts.schema.json')['$defs']['usage_event']['properties']
    numbers = ['input_total', 'output_total', 'cache_read', 'cache_write', 'reasoning', 'provider_total', 'cost_microdollars']
    flags = nonbool(p['counting_semantics'], ['cache_is_input_subset', 'reasoning_is_output_subset'])
    require('accounting', {'nonbool_flags': flags,
                           'invalid_fields': [k for k in numbers if not schema_valid(lane_validator(properties[k]), p[k])]})
    # cache_write_1h is a subset of cache_write, never a second bucket.
    incoming, outgoing = p['input_total'], p['output_total']
    if incoming is not None and not p['counting_semantics']['cache_is_input_subset']:
        parts = [p['cache_read'], p['cache_write']]
        incoming = incoming + sum(parts) if all(x is not None for x in parts) else None
    if outgoing is not None and not p['counting_semantics']['reasoning_is_output_subset']:
        outgoing = outgoing + p['reasoning'] if p['reasoning'] is not None else None
    return {'input': incoming, 'output': outgoing, 'provider_total': p['provider_total'], 'cost_microdollars': p['cost_microdollars']}


def source_steps(c, prepared, completed, event, schemas, resolved_payload, payload_ref_verified, historical):
    yield 'src_envelope', {'historical_type': type_name(historical), 'event_schema_errors': event_schema_errors(event)}
    yield 'src_replay', {'historical': historical, 'replay_policy': event['replay_policy'], 'producer_refusal': producer_refusal(event)}
    inline = event['payload_ref'] is None
    size = None
    if inline:
        try:
            size = len(inline_bytes(event['payload']))
        except Refusal:
            size = None
    yield 'src_inline', {'inline': inline, 'inline_size': size}
    slug = c['event_type'].replace('.', '_')
    source_is_app = completed['envelope_context']['scope_kind'] == 'application'
    source_definition = slug + ('_application_source' if source_is_app else '_source')
    yield 'src_definition', {'definition_present': source_definition in schemas}
    validator = lane_validator(schemas[source_definition])
    yield 'src_schema', {'prepared_errors': schema_error_count(validator, prepared), 'completed_errors': schema_error_count(validator, completed)}
    yield 'src_size', {'prepared_size': len(source_bytes(prepared)), 'completed_size': len(source_bytes(completed))}
    immutable = (['application_scope', 'original_owner_operation_id', 'owner_operation_id'] if source_is_app else []) + ['storage_instance_id', 'scope_partition', 'event_type', 'event_id', 'idempotency_key', 'producer', 'owner_ref', 'owner_revision', 'subject', 'before', 'captured_at_utc', 'runtime_context']
    a, b = prepared['envelope_context'], completed['envelope_context']
    yield 'src_stage', {'prepared_stage': prepared['stage'], 'completed_stage': completed['stage']}
    yield 'src_original', {'prepared_commitment': completed['prepared_sha256'], 'recomputed_commitment': source_digest(prepared),
                           'immutable_mismatches': copy_mismatches(prepared, completed, immutable),
                           'envelope_mismatches': [k for k in a if k != 'occurred_at_utc' and canonical(a[k]) != canonical(b[k])]}
    p = completed['payload']
    partition = partition_for(event)
    # Application partition='app' is enforced by its schema; the immutable
    # application_scope check binds the server, and SV18 binds the event partition.
    yield 'src_scope', {'event_scope_kind': event['scope_kind'], 'captured_scope_kind': b['scope_kind'],
                        'event_partition': partition, 'captured_partition': completed['scope_partition']}
    yield 'src_project_only', {'scope_policy': c['scope_policy'], 'event_scope_kind': event['scope_kind']}
    route = 'inline' if event['payload_ref'] is None else 'ref'
    yield 'src_payload', {'route': route, 'payload_ref_verified': payload_ref_verified if route == 'ref' else None,
                          'resolved_digest': value_digest(resolved_payload) if route == 'ref' else None,
                          'event_payload_digest': value_digest(event['payload']) if route == 'inline' else None,
                          'captured_payload_digest': value_digest(p)}
    # Scope has its own guard above; keep this join independent of that rule.
    yield 'src_join', {'envelope_copy_mismatches': [k for k in b if k != 'scope_kind' and canonical(event[k]) != canonical(b[k])],
                       'event_type': event['event_type'], 'contract_event_type': c['event_type'],
                       'payload_schema_id': event['payload_schema_id'], 'contract_payload_schema_id': c['payload_schema_id'],
                       'subject_mismatches': [k for k in c['identity_fields'] if canonical(p[k]) != canonical(completed['subject'][k])]}
    key, eid = identity(c, p, partition, completed if partition == 'app' else None)
    yield 'src_identity', {'key': key, 'eid': eid, 'event_key': event['idempotency_key'], 'event_id': event['event_id'],
                           'captured_key': completed['idempotency_key'], 'captured_event_id': completed['event_id']}
    web = completed['before'].get('web_request') if c['event_type'] == 'tool.invoked' else None
    yield 'src_context', {
        'payload_envelope_mismatches': [k for k in ['run_id', 'thread_id', 'node_id', 'attempt_id', 'project_id'] if k in p and p[k] != event[k]],
        'occurred_at_utc': event['occurred_at_utc'], 'payload_time': p.get('ts', p.get('observed_at_utc')),
        'runtime_mismatches': [k for k, v in completed['runtime_context'].items() if canonical(p.get(k)) != canonical(v)],
        'family': c['event_type'], 'usage_event_ref': p['usage_event_ref'] if c['event_type'] == 'usage.event' else None,
        'event_id': event['event_id'], 'web_parent_applies': web is not None, 'event_parent_event_id': event['parent_event_id'],
        'web_parent_event_id': web.get('parent_event_id') if web is not None else None}
    yield from transition_steps(c['event_type'], p, completed['before'], completed['owner_result'])


def source_valid(c, prepared, completed, event, schemas, resolved_payload=None, payload_ref_verified=False, *, historical=False):
    try:
        run_steps(source_steps(c, prepared, completed, event, schemas, resolved_payload, payload_ref_verified, historical))
    except TableRefusal as refusal:
        if refusal.phase == 'id_inputs':
            return 'identity_refused'
        if refusal.phase in TRANSITION_PHASES:
            return 'transition_refused'
        return refusal.code
    return 'accepted'


def batch_steps(parent, children):
    p = parent['event']['payload']; pm = p['meta']
    declared = pm['child_tool_use_ids']
    yield 'batch_parent', {'parent_role': pm.get('batch_role'), 'child_count': len(children),
                           'declared_child_ids': declared, 'child_ids': [v['event']['payload']['tool_use_id'] for v in children],
                           'distinct_declared': len(set(declared)),
                           'nonbool_success': [i for i, child in enumerate(children) if type(child['event']['payload']['success']) is not bool]}
    facts = {k: [] for k in ['role_bad', 'batch_id_bad', 'parent_tool_bad', 'parent_event_bad', 'attempt_ref_missing', 'tool_reused', 'envelope_bad']}
    for index, child in enumerate(children):
        e = child['event']; q = e['payload']; cm = q['meta']
        for key, bad in [('role_bad', cm.get('batch_role') != 'child'), ('batch_id_bad', cm['batch_id'] != pm['batch_id']),
                         ('parent_tool_bad', cm['parent_tool_use_id'] != p['tool_use_id']),
                         ('parent_event_bad', e['parent_event_id'] != parent['event']['event_id']),
                         ('attempt_ref_missing', not q.get('provider_attempt_ref')), ('tool_reused', q['tool_use_id'] == p['tool_use_id']),
                         ('envelope_bad', any(e[k] != parent['event'][k] for k in ['run_id', 'attempt_id', 'project_id', 'scope_kind']))]:
            if bad:
                facts[key].append(index)
    yield 'batch_child', facts
    yield 'batch_success', {'parent_success': p['success'], 'children_succeeded': all(v['event']['payload']['success'] for v in children)}


def batch_join(parent, children):
    try:
        run_steps(batch_steps(parent, children))
    except TableRefusal:
        return False
    return True


def recovery(c, f, case, schemas=None):
    """Original-owner/receipt adapters are supplied witnesses, not native authentication."""
    try:
        return recovery_flow(c, f, case, schemas)
    except TableRefusal as refusal:
        return {'result': refusal.code, 'external_effects': 0, 'append_count': 0, 'value': None}


def recovery_flow(c, f, case, schemas):
    admitted = case['admitted']
    require('rec_gate', {'replay_policy': case.get('replay_policy', f['event_record']['replay_policy']),
                         'admitted_type': type_name(admitted), 'admitted': admitted})
    flags = ['source_present', 'owner_proven', 'backup_coherent', 'permission', 'deleted']
    require('rec_custody', dict({'nonbool_flags': nonbool(case, flags)}, **{k: case[k] for k in flags}))
    schemas = load('Plans/dt_event_contracts.schema.json')['$defs'] if schemas is None else schemas
    prepared, completed, event = (f[key] for key in ['prepared_source', 'completed_source', 'event_record'])
    original = f['recovery_original']  # Frozen owner/Storage adapter observations.
    require('rec_commit', {'committed_type': type_name(case['outcome_committed']), 'outcome_committed': case['outcome_committed'],
                           'event_schema_errors': event_schema_errors(event)})
    # The complete source chain decides the candidate; its refusal is a source row.
    if source_valid(c, prepared, completed, event, schemas,
                    case.get('resolved_payload'), case.get('payload_ref_verified', False)) != 'accepted':
        return {'result': 'unavailable', 'external_effects': 0, 'append_count': 0, 'value': None}
    require('rec_original', {'prepared_digest': source_digest(prepared), 'original_prepared_digest': source_digest(original['prepared']),
                             'completed_digest': source_digest(completed), 'original_completed_digest': source_digest(original['completed']),
                             'event_digest': value_digest(event), 'original_event_digest': value_digest(original['event']),
                             'nonbool_stage_flags': nonbool(case, ['completed_present', 'append_issued'])})
    if not case['completed_present']:
        # Only finalize from the authenticated original outcome; never rerun it.
        return {'result': 'finalize_original', 'external_effects': 0, 'append_count': 0, 'value': f['completed_source']}
    if not case['append_issued']:
        return {'result': 'append_original', 'external_effects': 0, 'append_count': 1, 'value': f['event_record']}
    receipt_flags = ['receipt_custody', 'full_flush']
    require('rec_receipt', dict({'nonbool_receipt_flags': nonbool(case, receipt_flags)}, **{k: case[k] for k in receipt_flags}))
    receipt = f['first_append_receipt']
    require('rec_receipt_join', {'receipt_event_id': canonical_text(receipt['event_id']), 'event_event_id': canonical_text(event['event_id']),
                                 'receipt_sequence_id': canonical_text(receipt['sequence_id']), 'event_sequence_id': canonical_text(event['sequence_id']),
                                 'receipt_digest': value_digest(receipt), 'original_receipt_digest': value_digest(original['receipt'])})
    return {'result': 'original', 'external_effects': 0, 'append_count': 0, 'value': {'event': f['event_record'], 'receipt': f['first_append_receipt']}}


def checkpoint_steps(c, old, proposed, context, schema):
    validator = lane_validator(schema)
    yield 'cp_schema', {'previous_present': old is not None, 'previous_errors': schema_error_count(validator, old) if old is not None else 0,
                        'governed_type': type_name(context['governed_rebuild']), 'proposed_errors': schema_error_count(validator, proposed)}
    flags = ['admitted', 'reader_installed', 'withdrawn', 'permission', 'deleted']
    yield 'cp_lifecycle', dict({'nonbool_flags': nonbool(context, flags)}, **{k: context[k] for k in flags})
    yield 'cp_cas', {'lease_type': type_name(context['lease_current']), 'lease_current': context['lease_current'],
                     'expected_previous_digest': value_digest(context['expected_previous']), 'previous_digest': value_digest(old)}
    t = proposed['index_read_token']
    yield 'cp_token', {'token_digest': value_digest(t), 'current_token_digest': value_digest(context['current_token']),
                       'token_storage': t['storage_instance_id'], 'source_storage': context['source_storage_instance_id'],
                       'proposed_storage': proposed['storage_instance_id'], 'selection_storage': t['source_selection']['storage_instance_id'],
                       'checkpoint_key': t['checkpoint_key'], 'expected_key': 'event_record_index_checkpoint.v1:' + t['storage_instance_id'],
                       'checkpoint_ref': t['checkpoint_ref'], 'expected_ref': t['checkpoint_key'] + '#/generations/' + t['generation_id'],
                       'dataset_name': t['index_dataset_name'], 'expected_dataset': 'event_record_index.v2@' + t['generation_id']}
    flags = ['source_verified', 'coverage_complete', 'versions_supported']
    yield 'cp_source', dict({'nonbool_flags': nonbool(context, flags), 'proposed_partition': proposed['scope_partition'],
                             'context_partition': context['scope_partition']}, **{k: context[k] for k in flags})
    rows = context['source_rows']
    objects = [row for row in rows if type(row) is dict] if type(rows) is list else []
    yield 'cp_rows', {'rows_type': type_name(rows), 'non_object_rows': len(rows) - len(objects) if type(rows) is list else 0,
                      'bad_sequence_rows': sum(1 for row in objects if not storage_sequence_valid(row.get('sequence_id'))),
                      'bad_string_rows': sum(1 for row in objects if any(type(row.get(k)) is not str or not row[k] for k in ['event_type', 'event_id', 'scope_partition']))}
    expected_prefix = {'index_read_token': proposed['index_read_token'], 'row_set_sha256': sha(rows), 'row_count': len(rows), 'first_sequence_id': rows[0]['sequence_id'] if rows else None, 'through_sequence_id': rows[-1]['sequence_id'] if rows else None}
    yield 'cp_prefix', {'prefix_digest': value_digest(context['verified_prefix']), 'expected_prefix_digest': value_digest(expected_prefix)}
    through = rows[-1]['sequence_id'] if rows else None
    matches = [r for r in rows if r['event_type'] == c['event_type'] and r['scope_partition'] == proposed['scope_partition']]
    yield 'cp_coverage', {'examined_through': canonical_text(proposed['examined_through_sequence_id']), 'through': canonical_text(through),
                          'last_applied_event_id': proposed['last_applied_event_id'],
                          'last_matching_event_id': matches[-1]['event_id'] if matches else None,
                          'filter_complete_truthy': bool(proposed['filter_complete'])}
    yield 'cp_state', {'state': proposed['state'], 'health': proposed['health'], 'withdrawn_at_utc': proposed['withdrawn_at_utc'],
                       'previous_truthy': bool(old), 'previous_state': old['state'] if old else None,
                       'governed_rebuild': context['governed_rebuild'],
                       'previous_examined': old['examined_through_sequence_id'] if old else None, 'global_through': through}


def checkpoint_result(c, old, proposed, context, schema):
    try:
        run_steps(checkpoint_steps(c, old, proposed, context, schema))
    except TableRefusal as refusal:
        return refusal.code
    return 'published'


# ------------------------------------------------------------------ SP-1101 retained-original dispatch
# A retained original's recipe and frozen resources are selected by sealed
# custody, never by the request: the reader computes the expected binding from
# the record under inspection and asks the shared RetainedDispatcher for the
# original at its seglog ref. Finite fixtures model the native owner with a
# sealed lookup that only the lane's writer composition fills (seal_original);
# a context dict, historical flag or caller-supplied original selects nothing.
FROZEN_EDITION = '1.0.0'
_CUSTODY = {'worlds': [], 'dispatcher': None, 'contracts': {}, 'frozen': {}}


def original_ref(completed, event):
    """The seglog location key the SP-278 index gives for a record (storage instance and event id)."""
    return 'seglog:' + str(completed.get('storage_instance_id')) + '/' + str(event.get('event_id'))


def original_binding(completed, event):
    """SP-1101 binding computed from the record under inspection, never from custody."""
    app = event.get('scope_kind') == 'application'
    scope = completed.get('application_scope') if type(completed.get('application_scope')) is dict else {}
    operation = (completed.get('owner_operation_id') if app else
                 str(completed.get('owner_ref')) + '@' + canonical_text(completed.get('owner_revision')))
    return OriginalBinding(
        storage_instance_id=completed.get('storage_instance_id'), scope_kind=event.get('scope_kind'),
        server_id=scope.get('server_id') if app else completed.get('storage_instance_id'),
        project_id=event.get('project_id'), event_type=event.get('event_type'), event_id=event.get('event_id'),
        idempotency_key=event.get('idempotency_key'), owner_operation_id=operation,
        source_commitment=completed.get('prepared_sha256'))


def recipe_for(contract, scope_kind, frozen_sha256):
    """The frozen recipe tuple of one DT family edition and source scope."""
    app = scope_kind == 'application'
    return RecipeTuple(
        envelope_schema_id='pm.event.v0', envelope_schema_version='2.0.0',
        payload_schema_id=contract['payload_schema_id'], payload_schema_version=FROZEN_EDITION,
        owner_source_id=contract['event_type'].replace('.', '_') + ('_application_source' if app else '_source'),
        owner_edition=contract['event_type'] + '@' + FROZEN_EDITION, registry_revision='pm.dt.contracts@' + FROZEN_EDITION,
        identity_recipe='application@1' if app else 'dt:sha256-rfc8785-strings', producer_recipe='CV-317 RFC 8785 producer projection',
        physical_profile=EVENT_VALUE, full_value_profile='CV-339 original_event_value_commitment.v1',
        local_source_profile=APP_PHYSICAL if app else 'pm.dt.source.json.v1', payload_profile='SP-337',
        resource_manifest_sha256=frozen_sha256)


def closure_bytes(prepared, completed):
    """The original source closure in its own local profile (pm.dt.source.json.v1 or CV-366 app physical)."""
    if completed['envelope_context']['scope_kind'] == 'application':
        return storage_value_bytes([prepared, completed], profile=APP_PHYSICAL)
    return canonical([prepared, completed])


def sealed_closure(custody):
    """Decode one sealed custody's original values (prepared, completed, event, receipt)."""
    if custody.recipe.local_source_profile == APP_PHYSICAL:
        prepared, completed = decode_storage_value(custody.result_bytes, profile=APP_PHYSICAL)
    else:
        prepared, completed = json.loads(custody.result_bytes.decode('utf-8'), parse_float=Decimal,
                                         parse_int=lambda token: JsonNumber(token, True).exact())
    event = decode_storage_value(custody.record_bytes, profile=EVENT_VALUE)
    receipt = decode_storage_value(custody.receipt_bytes, profile=EVENT_VALUE)
    return prepared, completed, event, receipt


def frozen_verifier(contract):
    """The family's frozen recipe: recompute identity, prepare commitment and binding joins from the sealed bytes."""
    def verify(custody):
        global RECORDER
        recorder, RECORDER = RECORDER, None  # recomputation inside custody is not a table witness
        try:
            prepared, completed, event, _ = sealed_closure(custody)
            binding = custody.binding
            partition = completed['scope_partition']
            key, eid = identity(contract, completed['payload'], partition, completed if partition == 'app' else None)
            return (event['event_type'] == contract['event_type'] == binding.event_type
                    and (key, eid) == (event['idempotency_key'], event['event_id']) == (binding.idempotency_key, binding.event_id)
                    and completed['prepared_sha256'] == binding.source_commitment == source_digest(prepared)
                    and original_binding(completed, event) == binding)
        except (Refusal, ValueError, KeyError, TypeError):
            return False
        finally:
            RECORDER = recorder
    return verify


def seal_original(store, prepared, completed, event, receipt=None):
    """Writer composition only: seal one original the lane's writer built, at its seglog ref."""
    contract = _CUSTODY['contracts'][event['event_type']]
    recipe = recipe_for(contract, completed['envelope_context']['scope_kind'], _CUSTODY['frozen_sha256'])
    store[original_ref(completed, event)] = OriginalCustody(
        binding=original_binding(completed, event), recipe=recipe,
        record_bytes=storage_value_bytes(event, profile=EVENT_VALUE),
        result_bytes=closure_bytes(prepared, completed),
        receipt_bytes=storage_value_bytes(receipt, profile=EVENT_VALUE))


class SealedOriginalOwner:
    """The finite model of the native original owner: the installed world's sealed originals only."""

    def authenticated_original(self, ref):
        return _CUSTODY['worlds'][-1].get(ref) if _CUSTODY['worlds'] else None


def install_original_custody(contracts, fixtures, schema_document, event_schema):
    """Composition, outside request data: frozen resources, recipe map and the committed originals."""
    frozen = {'schemas': schema_document['$defs'], 'event_schema': event_schema}
    frozen_sha256 = hashlib.sha256(canonical([schema_document, event_schema])).hexdigest()
    _CUSTODY['contracts'] = {c['event_type']: c for c in contracts}
    _CUSTODY['frozen'] = {frozen_sha256: frozen}
    _CUSTODY['frozen_sha256'] = frozen_sha256
    recipes = {recipe_for(c, scope, frozen_sha256): FrozenRecipe(frozen_verifier(c))
               for c in contracts for scope in ('project', 'application')}
    _CUSTODY['dispatcher'] = RetainedDispatcher(SealedOriginalOwner(), recipes)
    # The committed base original of every family. Positive variants reuse the base
    # event identity with other closures (separate scenarios), so each is sealed in
    # its own world by the writer composition that reads it (retained_world).
    store = {}
    for c in contracts:
        f = fixtures[c['event_type']]
        seal_original(store, f['prepared_source'], f['completed_source'], f['event_record'], f['first_append_receipt'])
    _CUSTODY['worlds'] = [store]


class retained_world:
    """Writer composition for one read: the committed originals plus these writer-built originals."""

    def __init__(self, *closures):
        self.closures = closures

    def __enter__(self):
        store = dict(_CUSTODY['worlds'][0])
        for closure in self.closures:
            seal_original(store, *closure)
        _CUSTODY['worlds'].append(store)
        return self

    def __exit__(self, *exc):
        _CUSTODY['worlds'].pop()
        return False


def resolve_original(completed, event):
    """(refusal reason, custody) from the shared RetainedDispatcher for this record's binding."""
    try:
        binding = original_binding(completed, event)
        custody = _CUSTODY['dispatcher'].resolve(original_ref(completed, event), binding, disclose=lambda b: True)
    except Refusal as refusal:
        return refusal.reason, None
    return None, custody


def historical_read(c, prepared, completed, event, schemas, context):
    """Inspect a retained original under SP-580..596 and SP-1101, without live admission.

    Disclosure (HR02..HR05) is decided first, then the shared dispatcher resolves
    the sealed original and its frozen recipe for the binding this record claims
    (HR13); the record must equal that original byte for byte (HR09..HR11) and is
    validated with the frozen resources custody selected (HR12 and the source
    chain in historical mode), never with a caller's flag or schemas. Live
    operation state is not evidence about the original occurrence.
    """
    unavailable = {'result': 'unavailable', 'value': None, 'external_effects': 0, 'append_count': 0}
    flags = ['reader_installed', 'withdrawn', 'permission', 'deleted', 'source_present', 'owner_proven', 'versions_supported']
    try:
        require('hr_flags_a', dict({'nonbool_flags': nonbool(context, flags)}, **{k: context[k] for k in flags[:4]}))
        custody_refusal, custody = resolve_original(completed, event)
        require('hr_flags_b', dict({k: context[k] for k in flags[4:]}, custody_refusal=custody_refusal))
        original_prepared, original_completed, original_event, _ = sealed_closure(custody)
        frozen = _CUSTODY['frozen'][custody.recipe.resource_manifest_sha256]
        require('hr_original', {'prepared_digest': source_digest(prepared), 'original_prepared_digest': source_digest(original_prepared),
                                'completed_digest': source_digest(completed), 'original_completed_digest': source_digest(original_completed),
                                'event_digest': value_digest(event), 'original_event_digest': value_digest(original_event),
                                'event_schema_errors': schema_error_count(EventRecordValidator(frozen['event_schema']), event)})
    except TableRefusal:
        return unavailable
    # The complete source chain in historical mode, on the frozen resources; its refusal is a source row.
    if source_valid(c, prepared, completed, event, frozen['schemas'],
                    context.get('resolved_payload'), context.get('payload_ref_verified', False), historical=True) != 'accepted':
        return unavailable
    return {'result': 'retained', 'value': event, 'external_effects': 0, 'append_count': 0}


def historical_results(c, f, schemas):
    """Check 10: authentic history survives later lifecycle changes only.

    Retained originals are sealed by the writer composition (retained_world);
    each read resolves its original through the SP-1101 dispatcher.
    """
    prepared, completed, event = (copy.deepcopy(f[key]) for key in ['prepared_source', 'completed_source', 'event_record'])
    context = dict(f['historical_reader_oracle']['context'],
                   live_before=copy.deepcopy(f['historical_reader_oracle']['live_before']))
    def read(a=prepared, b=completed, e=event, ctx=context, sealed=None):
        with retained_world(*([sealed] if sealed is not None else [])):
            result = historical_read(c, a, b, e, schemas, ctx)
        return {'result': result['result'], 'exact_value': result['value'] == e if result['result'] == 'retained' else result['value'] is None,
                'external_effects': result['external_effects'], 'append_count': result['append_count']}
    results = {'live_transition_no_longer_valid': not transition(c['event_type'], completed['payload'], context['live_before'], completed['owner_result']),
               'changed_live_state': read(), 'live_state_unavailable': read(ctx=dict(context, live_before=None))}
    for key in ['withdrawn', 'permission', 'deleted', 'source_present', 'owner_proven', 'reader_installed', 'versions_supported']:
        results[key] = read(ctx=dict(context, **{key: not context[key]}))
    forged_event = dict(event, correlation_id='forged-correlation')
    results['forged_event'] = read(e=forged_event)
    results['forged_storage_metadata'] = read(e=dict(event, sequence_id=event['sequence_id'] + 1))
    # The sealed original's own Storage field has the wrong type; the record read is the fixture event.
    results['forged_original_storage_type'] = read(sealed=(prepared, completed, dict(event, sequence_id=True)))
    forged_source = copy.deepcopy(completed); forged_source['owner_outcome_ref'] += '-forged'
    results['forged_source'] = read(b=forged_source)
    ref_event = dict(event, payload={}, payload_ref='payload:fixture-verified-pack-body')
    ref_context = dict(context, resolved_payload=completed['payload'], payload_ref_verified=True)
    ref_sealed = (prepared, completed, ref_event)
    results['verified_payload_ref'] = read(e=ref_event, ctx=ref_context, sealed=ref_sealed)
    results['unverified_payload_ref'] = read(e=ref_event, ctx=dict(ref_context, payload_ref_verified=False), sealed=ref_sealed)
    results['changed_payload_ref'] = read(e=ref_event, ctx=dict(ref_context, resolved_payload={}), sealed=ref_sealed)
    replay_event = dict(event, replay_policy='projector_replay_only')
    results['replay_only_changed_live_state'] = read(e=replay_event, sealed=(prepared, completed, replay_event))
    results['replay_only_live_state_unavailable'] = read(e=replay_event, ctx=dict(context, live_before=None),
                                                         sealed=(prepared, completed, replay_event))
    for policy in ['append_once', 'dedupe_by_event_id']:
        retained = dict(event, replay_policy=policy)
        results[policy + '_history'] = read(e=retained, sealed=(prepared, completed, retained))
    invalid_policy = dict(event, replay_policy='forged_replay_policy')
    results['invalid_replay_policy'] = read(e=invalid_policy, sealed=(prepared, completed, invalid_policy))
    # Also cover all Project/application/operation positives with their sealed originals.
    results['variants'] = []
    for variant in f['positive_variants']:
        a, b, e = (variant[key] for key in ['prepared', 'completed', 'event'])
        results['variants'].append({'case': variant['case'], **read(a, b, e, context, sealed=(a, b, e))})
    return results


def recommit(c, values):
    """Update observational identity copies after one semantic fixture change."""
    a, b, e = values
    if b['scope_partition'] == 'app':
        subjects = [canonical(b['payload'][k]).decode() if k == 'blocked_sequence' else b['payload'][k]
                    for k in c['identity_fields']]
        operation = sha([c['event_type'], b['original_owner_operation_id']] + subjects)
        a['owner_operation_id'] = b['owner_operation_id'] = operation
    key, eid = identity(c, b['payload'], b['scope_partition'], b if b['scope_partition'] == 'app' else None)
    for value in [a, b, e]:
        value['idempotency_key'] = key; value['event_id'] = eid
    if c['event_type'] == 'usage.event':
        b['payload']['usage_event_ref'] = eid
        if e['payload_ref'] is None:
            e['payload']['usage_event_ref'] = eid
    b['prepared_sha256'] = hashlib.sha256(source_bytes(a)).hexdigest()
    return a, b, e


def source_stage_boundary(c, variant, stage):
    """Schema-valid exact 1 MiB and 1 MiB+1 closures, with SP-337 pack routing.

    A prepared occurrence witness may precede the completed occurrence. For a
    completed stage, extend equal RFC 3339 fractional-zero witnesses together;
    the opaque outcome ref fills the final few codec bytes. No large fixture
    or arbitrary schema property is stored in the repository.
    """
    cache_key = (c['event_type'], stage, sha([variant[k] for k in ['prepared', 'completed', 'event']]))
    if cache_key in _BOUNDARY_INPUTS:
        return copy.deepcopy(_BOUNDARY_INPUTS[cache_key])
    original = copy.deepcopy([variant[k] for k in ['prepared', 'completed', 'event']])
    field = 'observed_at_utc' if c['event_type'] == 'usage.event' else 'ts'
    timestamp = original[1]['payload'][field]
    def extended(count):
        return timestamp[:-1] + ('' if '.' in timestamp else '.') + '0' * count + 'Z'
    def build(count):
        if stage == 'prepared':
            values = copy.deepcopy(original)
            values[0]['envelope_context']['occurred_at_utc'] = extended(count)
        else:
            def replace(value):
                if isinstance(value, dict):
                    return {k: replace(v) for k, v in value.items()}
                if isinstance(value, list):
                    return [replace(v) for v in value]
                return extended(count) if value == timestamp else value
            values = replace(original)
        a, b, e = recommit(c, values)
        e['payload'] = {}; e['payload_ref'] = 'payload:fixture-verified-pack-body'
        return a, b, e
    index = 0 if stage == 'prepared' else 1
    base = build(0); small = len(source_bytes(base[index]))
    slope = len(source_bytes(build(1)[index])) - small
    count = (1048576 - small) // slope
    good = build(count)
    while len(source_bytes(good[index])) > 1048576:
        count -= 1; good = build(count)
    gap = 1048576 - len(source_bytes(good[index]))
    if stage == 'prepared':
        good = build(count + gap)
    else:
        # MessagePack may change a string header at this boundary. Move the
        # timestamp back one unit so the filler never straddles that header.
        good = build(count - 1)
        prefix = good[1]['owner_outcome_ref']
        padding = 1048576 - len(source_bytes(good[index]))
        for _ in range(4):
            good[1]['owner_outcome_ref'] = prefix + 'x' * padding
            delta = 1048576 - len(source_bytes(good[index]))
            if not delta:
                break
            padding += delta
    assert len(source_bytes(good[index])) == 1048576
    bad = copy.deepcopy(good)
    if stage == 'prepared':
        bad[0]['envelope_context']['occurred_at_utc'] = bad[0]['envelope_context']['occurred_at_utc'][:-1] + '0Z'
        bad[1]['prepared_sha256'] = hashlib.sha256(source_bytes(bad[0])).hexdigest()
    else:
        bad[1]['owner_outcome_ref'] += 'x'
    assert len(source_bytes(bad[index])) == 1048577
    _BOUNDARY_INPUTS[cache_key] = good, bad  # Inputs only; never validation results.
    return good, bad


def recovery_mutations(c, f):
    """One-defect custody controls; adapter copies stay coherent when testing a join."""
    stages = [v for v in f['recovery_cases'] if v['expected']['result'] in ['original', 'append_original', 'finalize_original']]
    for stage in stages:
        for field, value in [('event_type', 'foreign.event'), ('event_id', 'evt_dt_forged')]:
            bad = copy.deepcopy(f); bad['event_record'][field] = value
            bad['recovery_original']['event'] = copy.deepcopy(bad['event_record'])
            if field == 'event_id':
                bad['first_append_receipt']['event_id'] = value
                bad['recovery_original']['receipt'] = copy.deepcopy(bad['first_append_receipt'])
                if c['event_type'] == 'usage.event':
                    bad['completed_source']['payload']['usage_event_ref'] = value
                    bad['event_record']['payload']['usage_event_ref'] = value
                    bad['recovery_original']['completed'] = copy.deepcopy(bad['completed_source'])
                    bad['recovery_original']['event'] = copy.deepcopy(bad['event_record'])
            yield stage['case'] + '/' + field, bad, stage['input']
        bad = copy.deepcopy(f); bad['completed_source']['prepared_sha256'] = 'f' * 64
        bad['recovery_original']['completed'] = copy.deepcopy(bad['completed_source'])
        yield stage['case'] + '/prepare_commitment', bad, stage['input']
        bad = copy.deepcopy(f); bad['completed_source']['owner_outcome_ref'] += '-forged'
        yield stage['case'] + '/authenticated_owner', bad, stage['input']
        bad = copy.deepcopy(f); bad['recovery_original']['prepared']['owner_revision'] = True
        yield stage['case'] + '/authenticated_owner_type', bad, stage['input']
        bad = copy.deepcopy(f); bad['recovery_original']['event']['sequence_id'] = True
        yield stage['case'] + '/authenticated_storage_type', bad, stage['input']
        for field, value in [('sequence_id', f['event_record']['sequence_id'] + 1),
                             ('observed_at_utc', '2026-11-05T00:00:00Z'),
                             ('persisted_at_utc', '2026-11-05T00:00:00Z')]:
            bad = copy.deepcopy(f); bad['event_record'][field] = value
            # The receipt agrees with the candidate event. Only comparison
            # with Storage's frozen event is supposed to detect this forgery.
            bad['first_append_receipt']['sequence_id'] = bad['event_record']['sequence_id']
            bad['recovery_original']['receipt'] = copy.deepcopy(bad['first_append_receipt'])
            yield stage['case'] + '/storage_' + field, bad, stage['input']
        bad = copy.deepcopy(f); bad['event_record']['sequence_id'] = 'invalid-sequence'
        bad['recovery_original']['event'] = copy.deepcopy(bad['event_record'])
        bad['first_append_receipt']['sequence_id'] = 'invalid-sequence'
        bad['recovery_original']['receipt'] = copy.deepcopy(bad['first_append_receipt'])
        yield stage['case'] + '/envelope_schema', bad, stage['input']
        if stage['input']['append_issued']:
            for field, value in [('event_id', 'evt_dt_wrong_receipt'), ('sequence_id', f['first_append_receipt']['sequence_id'] + 1), ('sequence_id', True)]:
                bad = copy.deepcopy(f); bad['first_append_receipt'][field] = value
                bad['recovery_original']['receipt'] = copy.deepcopy(bad['first_append_receipt'])
                yield stage['case'] + '/receipt_' + field + ('_boolean' if type(value) is bool else ''), bad, stage['input']
            for field in ['manifest_generation', 'byte_offset', 'durable_end_offset']:
                bad = copy.deepcopy(f); bad['first_append_receipt'][field] += 1
                yield stage['case'] + '/first_receipt_' + field, bad, stage['input']
            bad = copy.deepcopy(f); bad['first_append_receipt']['segment_generation'] = True
            yield stage['case'] + '/first_receipt_boolean_generation', bad, stage['input']


def payload_type_cases(f):
    """Change one payload leaf's JSON type while preserving Python's == value."""
    variants = [dict(prepared=f['prepared_source'], completed=f['completed_source'], event=f['event_record'])]
    variants += [v for v in f['positive_variants'] if v['event']['scope_kind'] == 'application'][:1]
    def leaves(value, path=()):
        if isinstance(value, dict):
            for key, child in value.items():
                yield from leaves(child, path + (key,))
        elif isinstance(value, list):
            for index, child in enumerate(value):
                yield from leaves(child, path + (index,))
        elif type(value) is bool or type(value) in [int, float] and value in [0, 1]:
            yield path, value
    for variant in variants:
        found = next(leaves(variant['event']['payload']), None)
        if found is None:
            continue
        path, value = found
        replacement = int(value) if type(value) is bool else bool(value)
        base = copy.deepcopy([variant[k] for k in ['prepared', 'completed', 'event']])
        bad = copy.deepcopy(base); set_path(bad[2]['payload'], path, replacement)
        yield variant['event']['scope_kind'] + '/inline', base, bad, {}
        packed = copy.deepcopy(base); packed[2]['payload'] = {}; packed[2]['payload_ref'] = 'payload:fixture-verified-pack-body'
        body = copy.deepcopy(base[1]['payload']); set_path(body, path, replacement)
        yield variant['event']['scope_kind'] + '/ref', base, packed, {'resolved_payload': body, 'payload_ref_verified': True}


def decimal_gate(c, f):
    variant = next(v for v in f['positive_variants'] if v['completed']['payload'].get('score') is not None)
    def replace(value):
        if isinstance(value, dict):
            return {k: 0.1 if k == 'score' else (0.05 if c['event_type'] == 'gate.passed' else 0.2) if k == 'score_threshold' else replace(v) for k, v in value.items()}
        if isinstance(value, list):
            return [replace(v) for v in value]
        return value
    return recommit(c, replace([variant[k] for k in ['prepared', 'completed', 'event']]))


def technical_checks(c, f, schemas, check):
    """Cycle-5 regressions run inside the complete checker, never an acceptance stub."""
    name = c['event_type']; slug = name.replace('.', '_')
    variants = [dict(prepared=f['prepared_source'], completed=f['completed_source'], event=f['event_record'])]
    variants += [v for v in f['positive_variants'] if v['event']['scope_kind'] == 'application'][:1]
    for variant in variants:
        scope = variant['event']['scope_kind']
        for stage in ['prepared', 'completed']:
            good, bad = source_stage_boundary(c, variant, stage)
            check(source_valid(c, *good, schemas, good[1]['payload'], True) == 'accepted', name + ': exact source-stage boundary ' + scope + '/' + stage)
            check(source_valid(c, *bad, schemas, bad[1]['payload'], True) == 'source_stage_too_large', name + ': oversized source stage ' + scope + '/' + stage)
            if scope == 'project':
                raw = canonical(good[0 if stage == 'prepared' else 1])
                check(decode_source(raw) == good[0 if stage == 'prepared' else 1], name + ': exact source decode boundary ' + stage)
                try:
                    decode_source(canonical(bad[0 if stage == 'prepared' else 1])); refused = False
                except ValueError:
                    refused = True
                check(refused, name + ': oversized source decode ' + stage)
        # Historical reader accepts every supported original replay policy in
        # both scopes, including after all live state has disappeared.
        for policy in ['append_once', 'dedupe_by_event_id', 'dedupe_by_idempotency_key', 'projector_replay_only']:
            a, b, e = copy.deepcopy([variant[k] for k in ['prepared', 'completed', 'event']]); e['replay_policy'] = policy
            ctx = dict(f['historical_reader_oracle']['context'], live_before=None)
            with retained_world((a, b, e)):
                check(historical_read(c, a, b, e, schemas, ctx)['result'] == 'retained', name + ': historical policy ' + scope + '/' + policy)
    for label, bad, case in recovery_mutations(c, f):
        check(recovery(c, bad, case, schemas) == {'result': 'unavailable', 'external_effects': 0, 'append_count': 0, 'value': None}, name + ': recovery custody ' + label)
    for label, base, bad, kwargs in payload_type_cases(f):
        check(source_valid(c, *bad, schemas, **kwargs) == ('payload_unavailable' if label.endswith('/ref') else 'join_refused'), name + ': typed payload join ' + label)
    if name.startswith('gate.'):
        a, b, e = decimal_gate(c, f)
        aa, bb = [decode_source(canonical(v)) for v in [a, b]]
        check(source_valid(c, aa, bb, e, schemas) == 'accepted', name + ': decimal source with binary64 event body')
        check(gate_score_join(bb['payload'], a['before'], b['owner_result']), name + ': decimal/binary64 score joins')
        ctx = dict(f['historical_reader_oracle']['context'], live_before=None)
        with retained_world((a, b, e)):
            check(historical_read(c, aa, bb, e, schemas, ctx)['result'] == 'retained', name + ': decimal source historical round trip')
    if name.startswith('approval.'):
        def replace_sequence(value, number):
            if isinstance(value, dict):
                return {k: number if k == 'blocked_sequence' else replace_sequence(v, number) for k, v in value.items()}
            if isinstance(value, list):
                return [replace_sequence(v, number) for v in value]
            return value
        values = copy.deepcopy([f[k] for k in ['prepared_source', 'completed_source', 'event_record']])
        ctx = dict(f['historical_reader_oracle']['context'], live_before=None)
        # CV-1100 (F16): every exact u64 blocked_sequence keeps its exact identity
        # spelling; the current writer qualifies the producer projection through the
        # shared RFC 8785 route, so 2^53+1 and u64 max refuse number_domain (SV36)
        # before any append, and the retry route has no digest (AM02). The same
        # originals, once retained, stay readable through SP-1101 custody.
        for integer in [1, 9007199254740992, 9007199254740993, 18446744073709551615]:
            a, b, e = recommit(c, replace_sequence(values, integer))
            expected_key = 'dt:' + sha([name, b['scope_partition']] + [str(integer) if k == 'blocked_sequence' else b['payload'][k]
                                                                       for k in c['identity_fields']])
            check(identity(c, b['payload'], b['scope_partition'])[0] == expected_key, name + ': exact u64 identity spelling ' + str(integer))
            writer = 'accepted' if integer <= 2 ** 53 else 'number_domain'
            check(source_valid(c, a, b, e, schemas) == writer, name + ': exact u64 producer route ' + str(integer))
            decoded = [decode_source(canonical(v)) for v in [a, b, e]]
            check(source_valid(c, *decoded, schemas) == writer, name + ': exact u64 round trip ' + str(integer))
            retry = append_model({}, e['idempotency_key'], retry_digest(e), None)
            check(retry == (('appended', None) if writer == 'accepted' else ('schema_refused', None)), name + ': exact u64 retry route ' + str(integer))
            with retained_world((a, b, e)):
                check(historical_read(c, a, b, e, schemas, ctx)['result'] == 'retained', name + ': retained exact u64 original ' + str(integer))
        # CV-1100: an integral float at the integer slot is refused, never read as its integer.
        # The completed stage and the event carry the float; the prepared stage keeps the exact int,
        # so its commitment and every canonical copy still agree (one defect: the slot's type).
        for integer, number in [(1, 1.0), (9007199254740992, 9007199254740992.0), (18446744073709549568, 18446744073709549568.0)]:
            integers = recommit(c, replace_sequence(values, integer))
            floats = [copy.deepcopy(integers[0])] + replace_sequence(copy.deepcopy(list(integers[1:])), number)
            check([canonical(v) for v in floats] == [canonical(v) for v in integers], name + ': equal integer canonical bytes ' + str(integer))
            check(source_valid(c, *floats, schemas) == 'schema_refused', name + ': integral float blocked_sequence refused ' + str(integer))
            try:
                identity(c, floats[1]['payload']); refused = None
            except TableRefusal as refusal:
                refused = refusal.row
            check(refused == 'ID01_blocked_sequence', name + ': integral float identity refused ' + str(integer))
            check(not schema_accepts(lane_validator(schemas[slug]), floats[2]['payload']), name + ': integral float payload refused ' + str(integer))
        check(not schema_accepts(lane_validator(schemas[slug]), replace_sequence(values[2]['payload'], 1.25)), name + ': fractional identity refused')


def schema_value_kind(schema):
    kinds = schema.get('type', [])
    kinds = [kinds] if isinstance(kinds, str) else kinds
    declared = next((kind for kind in ['integer', 'number', 'boolean'] if kind in kinds), None)
    if declared is not None:
        return declared
    values = [schema['const']] if 'const' in schema else schema.get('enum', [])
    values = [value for value in values if value is not None]
    if values and all(type(value) is bool for value in values):
        return 'boolean'
    if values and all(type(value) in [int, float] for value in values):
        return 'integer' if all(type(value) is int for value in values) else 'number'
    return None


def typed_values(schema, value, path=()):
    """Every populated numeric/boolean slot, including nullable/observational copies."""
    if schema_value_kind(schema) is not None and value is not None:
        yield path, value, schema
    if isinstance(value, dict):
        for key, child in value.items():
            yield from typed_values(schema.get('properties', {}).get(key, {}), child, path + (key,))
    if isinstance(value, list):
        for index, child in enumerate(value):
            yield from typed_values(schema.get('items', {}), child, path + (index,))
    for keyword in ['anyOf', 'oneOf', 'allOf']:
        for branch in schema.get(keyword, []):
            yield from typed_values(branch, value, path)
    for keyword in ['then', 'else']:
        if keyword in schema:
            yield from typed_values(schema[keyword], value, path)


def schema_type_cases(c, f, schemas):
    slug = c['event_type'].replace('.', '_')
    variants = [(slug, f['valid_payload']), (slug + '_source', f['prepared_source']),
                (slug + '_source', f['completed_source']), (slug + '_checkpoint', f['checkpoint'])]
    for v in f['positive_variants']:
        definition = slug + ('_application_source' if v['event']['scope_kind'] == 'application' else '_source')
        variants.extend((definition, v[k]) for k in ['prepared', 'completed'])
    seen = set()
    for index, (definition, value) in enumerate(variants):
        for path, original, rule in typed_values(schemas[definition], value):
            for replacement in ['false', '0', 'true', '1', [], {}, [False], {'value': False},
                                *( [0, 1] if schema_value_kind(rule) == 'boolean' else [False, True] )]:
                changed = copy.deepcopy(value); set_path(changed, path, replacement)
                label = definition + '/' + str(index) + '/' + '/'.join(map(str, path)) + '/' + repr(replacement)
                if label in seen:
                    continue
                seen.add(label)
                # Expected negatives are fixed independently of the validator.
                # Null is tested at each nonnullable leaf and every authority
                # adapter, rather than misclassified at nullable union fields.
                yield definition, label, changed


def captured_scope_case(f):
    """One captured-scope fact, with its schema/metadata/commitment copies.

    The Project event stays unchanged. Changing the captured source role to a
    valid application role must refresh its carrier schema id and required
    application metadata; leaving those stale would mask the scope join.
    """
    app = next((variant for variant in f['positive_variants'] if variant['event']['scope_kind'] == 'application'), None)
    if app is None:
        return None
    prepared, completed, event = copy.deepcopy([f[key] for key in ['prepared_source', 'completed_source', 'event_record']])
    for record, observation in [(prepared, app['prepared']), (completed, app['completed'])]:
        record['envelope_context']['scope_kind'] = 'application'
        record['schema_id'] = observation['schema_id']
        for field in ['application_scope', 'owner_operation_id', 'original_owner_operation_id']:
            record[field] = copy.deepcopy(observation[field])
    completed['prepared_sha256'] = hashlib.sha256(source_bytes(prepared)).hexdigest()
    return prepared, completed, event


def round6_corpus(c, f, schemas):
    """One-defect numeric, boolean-authority and typed-envelope controls."""
    name = c['event_type']; slug = name.replace('.', '_'); cases = []
    a, b, e = copy.deepcopy([f[k] for k in ['prepared_source', 'completed_source', 'event_record']])
    for replacement in ['false', '0', 'true', '1', 0, 1, None, [], {}, [False], {'value': False}]:
        token = repr(replacement)
        recovery_base = next(v['input'] for v in f['recovery_cases'] if v['expected']['result'] == 'original')
        cp = f['checkpoint_cases'][0]
        ctx = dict(f['historical_reader_oracle']['context'], live_before=None)
        for model, base in [('recovery', recovery_base), ('checkpoint', cp['context']), ('history', ctx)]:
            for field, value in base.items():
                if type(value) is not bool:
                    continue
                bad = dict(base, **{field: replacement})
                if model == 'recovery':
                    call = lambda bad=bad: recovery(c, f, bad, schemas)['result']
                    accepting = {'original', 'append_original', 'finalize_original'}
                elif model == 'checkpoint':
                    call = lambda bad=bad, cp=cp: checkpoint_result(c, cp['previous'], cp['proposed'], bad, schemas[slug + '_checkpoint'])
                    accepting = 'published'
                else:
                    call = lambda bad=bad, ctx=ctx: historical_read(c, a, b, e, schemas, bad)['result']
                    accepting = 'retained'
                cases.append(('type/' + model + '/' + field + '/' + token, call, accepting))
        # A typed adapter must never accept string/number/container truthiness.
        ref = dict(e, payload={}, payload_ref='payload:fixture-verified-pack-body')
        cases.append(('type/payload_ref_verified/' + token,
                      lambda replacement=replacement, ref=ref: source_valid(c, a, b, ref, schemas, b['payload'], replacement), 'accepted'))
    # A boolean True type mutation must start at numeric one, rather than
    # introducing a second value mismatch for families whose base counter is 2+.
    type_a, type_b, type_e = copy.deepcopy([a, b, e])
    type_a['envelope_context']['producer_sequence_id'] = type_b['envelope_context']['producer_sequence_id'] = type_e['producer_sequence_id'] = 1
    type_b['prepared_sha256'] = hashlib.sha256(source_bytes(type_a)).hexdigest()
    assert source_valid(c, type_a, type_b, type_e, schemas) == 'accepted'
    for replacement in [True, '1', [], {}, [1], {'value': 1}]:
        bad = dict(type_e, producer_sequence_id=replacement)
        cases.append(('type/envelope/producer_sequence_id/' + repr(replacement),
                      lambda bad=bad: source_valid(c, type_a, type_b, bad, schemas), 'accepted'))
    zero_a, zero_b, zero_e = copy.deepcopy([a, b, e])
    zero_a['envelope_context']['producer_sequence_id'] = zero_b['envelope_context']['producer_sequence_id'] = zero_e['producer_sequence_id'] = 0
    zero_b['prepared_sha256'] = hashlib.sha256(source_bytes(zero_a)).hexdigest()
    assert source_valid(c, zero_a, zero_b, zero_e, schemas) == 'accepted'
    zero_bad = dict(zero_e, producer_sequence_id=False)
    cases.append(('type/envelope/producer_sequence_id/False',
                  lambda: source_valid(c, zero_a, zero_b, zero_bad, schemas), 'accepted'))
    bad = dict(e, unexpected='refused')
    cases.append(('type/envelope/extra_property', lambda bad=bad: source_valid(c, a, b, bad, schemas), 'accepted'))
    for replacement in [False, True, '1', None, [], {}, -1]:
        bad = dict(e, sequence_id=replacement)
        cases.append(('type/envelope/sequence_id/' + repr(replacement),
                      lambda bad=bad: source_valid(c, a, b, bad, schemas), 'accepted'))
    cp = f['checkpoint_cases'][0]
    prior = cp['previous']
    if prior is not None:
        paths = set()
        for path, value, rule in typed_values(schemas[slug + '_checkpoint'], prior):
            if path in paths:
                continue
            paths.add(path)
            bad = copy.deepcopy(cp)
            set_path(bad['previous'], path, 1 if schema_value_kind(rule) == 'boolean' else True)
            bad['context']['expected_previous'] = copy.deepcopy(bad['previous'])
            cases.append(('type/prior_checkpoint/' + '/'.join(map(str, path)),
                          lambda bad=bad: checkpoint_result(c, bad['previous'], bad['proposed'], bad['context'], schemas[slug + '_checkpoint']), 'published'))
    for value in [False, 0, [], {}]:
        bad = copy.deepcopy(cp); bad['previous'] = value; bad['context']['expected_previous'] = copy.deepcopy(value)
        cases.append(('type/prior_checkpoint_root/' + repr(value),
                      lambda bad=bad: checkpoint_result(c, bad['previous'], bad['proposed'], bad['context'], schemas[slug + '_checkpoint']), 'published'))
    if name == 'worktree.deleted':
        for field in ['elapsed_grace_ms', 'grace_period_ms']:
            # Sweep 2B (CV-1100): the integral float and a value past the u64 owner maximum too.
            for replacement in [True, 1.0, UINT64_MAX + 1]:
                p = copy.deepcopy(f['valid_payload']); before = copy.deepcopy(f['completed_source']['before']); outcome = copy.deepcopy(f['completed_source']['owner_result'])
                p['grace_period_ms'] = before['elapsed_grace_ms'] = 1
                assert transition(name, p, before, outcome)
                if field == 'elapsed_grace_ms':
                    before[field] = replacement
                else:
                    p[field] = replacement
                cases.append(('type/worktree_grace/' + field + ('' if replacement is True else '/' + repr(replacement)),
                              lambda p=p, before=before, outcome=outcome: transition(name, p, before, outcome), True))
    # Coherent prefix copies isolate the row's own type guard. Mutate the
    # first counter and nonmatching row strings without changing the cursor.
    for field, index, replacements in [
        ('sequence_id', 0, [True, '1', None, [], {}, {'value': False}, 1.0, UINT64_MAX + 1]),
        ('event_type', 1, [True, 1, None, [], {}, '']),
        ('event_id', 1, [True, 1, None, [], {}, '']),
        ('scope_partition', 1, [True, 1, None, [], {}, '']),
    ]:
        for value in replacements:
            bad = copy.deepcopy(f['checkpoint_cases'][0]); rows = bad['context']['source_rows']
            rows[index][field] = value
            bad['context']['verified_prefix'] = {
                'index_read_token': bad['proposed']['index_read_token'], 'row_set_sha256': sha(rows),
                'row_count': len(rows), 'first_sequence_id': rows[0]['sequence_id'], 'through_sequence_id': rows[-1]['sequence_id']}
            cases.append(('type/prefix_row/' + field + '/' + repr(value),
                          lambda bad=bad: checkpoint_result(c, bad['previous'], bad['proposed'], bad['context'], schemas[slug + '_checkpoint']), 'published'))
    for value in [{}, '']:
        bad = copy.deepcopy(next(v for v in f['checkpoint_cases'] if v['case'] == 'proven_empty_source'))
        bad['context']['source_rows'] = value
        bad['context']['verified_prefix']['row_set_sha256'] = sha(value)
        cases.append(('type/empty_prefix_container/' + repr(value),
                      lambda bad=bad: checkpoint_result(c, bad['previous'], bad['proposed'], bad['context'], schemas[slug + '_checkpoint']), 'published'))
    if name.startswith('approval.'):
        for replacement in [True, '1', -1, 1.25, None, [], {}, 1.0, 9007199254740992.0, UINT64_MAX + 1]:
            payload = dict(b['payload'], blocked_sequence=replacement)
            def identity_type(payload=payload):
                try:
                    identity(c, payload)
                    return True
                except ValueError:
                    return False
            cases.append(('type/identity_integer/' + repr(replacement), identity_type, True))
    for replacement in ['false', '0', 0, 1, True, None, [], {}, [False], {'value': False}]:
        if type(replacement) is not str:
            cases.append(('type/retry_digest/' + repr(replacement),
                          lambda replacement=replacement: append_model({}, e['idempotency_key'], replacement, None)[0], 'appended'))
        if name == 'tool.invoked' and type(replacement) is not bool:
            parent = copy.deepcopy(next(v for v in f['positive_variants'] if v['case'] == 'batch_parent'))
            children = [copy.deepcopy(next(v for v in f['positive_variants'] if v['case'] == label)) for label in ['batch_url_1', 'batch_url_2']]
            for record in [parent, children[0]]:
                for observation in [record['event']['payload'], record['completed']['payload'], record['completed']['owner_result']]:
                    observation['success'] = bool(replacement)
                if not bool(replacement):
                    for observation in [record['event']['payload']['meta'], record['completed']['payload']['meta'], record['completed']['owner_result']['meta']]:
                        observation['error_code'] = 'fixture-batch-failure'
                assert source_valid(c, record['prepared'], record['completed'], record['event'], schemas) == 'accepted'
            assert batch_join(parent, children)
            # This helper consumes event observations only; pass no stale
            # unused source snapshots alongside the one-field type defect.
            parent = {'event': parent['event']}; children = [{'event': v['event']} for v in children]
            children[0]['event']['payload']['success'] = replacement
            cases.append(('type/batch_child_success/' + repr(replacement),
                          lambda parent=parent, children=children: batch_join(parent, children), True))
        if name == 'usage.event':
            for field in ['cache_is_input_subset', 'reasoning_is_output_subset']:
                if type(replacement) is bool:
                    continue
                p = copy.deepcopy(f['valid_payload']); p['counting_semantics'][field] = replacement
                def accounting(p=p):
                    try:
                        accounting_totals(p)
                        return True
                    except ValueError:
                        return False
                cases.append(('type/accounting_flag/' + field + '/' + repr(replacement), accounting, True))
            for field in ['input_total', 'output_total', 'cache_read', 'cache_write', 'reasoning', 'provider_total', 'cost_microdollars']:
                if replacement is None or type(replacement) is int:
                    replacement_list = [1.0, UINT64_MAX + 1] if replacement == 0 else []  # Sweep 2B: integral float, past u64.
                else:
                    replacement_list = [replacement]
                for replacement_value in replacement_list:
                    p = copy.deepcopy(f['valid_payload']); p[field] = replacement_value
                    def accounting_number(p=p):
                        try:
                            accounting_totals(p)
                            return True
                        except ValueError:
                            return False
                    cases.append(('type/accounting_number/' + field + '/' + repr(replacement_value), accounting_number, True))
    for mode in ['false', 0, None, [], {}]:
        cases.append(('type/historical_mode/' + repr(mode),
                      lambda mode=mode: source_valid(c, a, b, e, schemas, historical=mode), 'accepted'))
    for value in [True, '0', None, [], {}, -1, 1.25, 1.0, UINT64_MAX + 1]:
        cases.append(('type/unsigned_integer/' + repr(value), lambda value=value: unsigned_integer_valid(value), True))
    scope_case = captured_scope_case(f)
    if scope_case is not None:
        assert source_valid(c, a, b, e, schemas) == 'accepted'
        source_schema = schemas[slug + '_application_source']
        assert all(schema_valid(lane_validator(source_schema), stage) for stage in scope_case[:2])
        cases.append(('scope/captured_source_kind',
                      lambda scope_case=scope_case: source_valid(c, *scope_case, schemas), 'accepted'))
    return cases


def round6_checks(c, f, schemas, check):
    name = c['event_type']; slug = name.replace('.', '_')
    for label, call, accepting in round6_corpus(c, f, schemas):
        actual = call()
        if label == 'scope/captured_source_kind':
            check(actual == 'scope_refused', name + ': isolated captured source scope')
        else:
            check(actual not in accepting if isinstance(accepting, set) else actual != accepting, name + ': round6 ' + label)
    for definition, label, value in schema_type_cases(c, f, schemas):
        check(not schema_accepts(lane_validator(schemas[definition]), value), name + ': numeric/boolean schema ' + label)


def table_witness_checks(c, f, schemas, check):
    """Sweep part 2A: single-defect witnesses for table rows no earlier case reached.

    Each case changes one fact of a valid base (refreshing only the derived
    commitments that observe it) and asserts the exact refusal of its own row.
    """
    name = c['event_type']; slug = name.replace('.', '_')
    a, b, e = copy.deepcopy([f[k] for k in ['prepared_source', 'completed_source', 'event_record']])
    # SV04: a current writer appends only dedupe_by_idempotency_key.
    for policy in ['append_once', 'dedupe_by_event_id']:
        check(source_valid(c, a, b, dict(e, replay_policy=policy), schemas) == 'join_refused', name + ': table SV04 current writer ' + policy)
    # SV36 (was the SV05 witness): a signed integer below int64 has no exact JCS route, so the
    # current writer's producer qualification refuses it first (number_domain).
    bad = copy.deepcopy(e); bad['payload'][next(iter(bad['payload']))] = -(2 ** 63) - 1
    check(source_valid(c, a, b, bad, schemas) == 'number_domain', name + ': table SV36 integer below int64 in the producer projection')
    # SV05: an exact decimal carrier has an exact JCS route but no SP-236 EVENT_VALUE encoding.
    bad = copy.deepcopy(e); bad['payload'][next(iter(bad['payload']))] = Decimal('0.5')
    check(source_valid(c, a, b, bad, schemas) == 'schema_refused', name + ': table SV05 inline body with no EVENT_VALUE encoding')
    # SV07: a project-only family has no application source definition.
    if c['scope_policy'] == 'project_only':
        bad = copy.deepcopy(b); bad['envelope_context']['scope_kind'] = 'application'
        check(source_valid(c, a, bad, e, schemas) == 'scope_refused', name + ': table SV07 application capture of a project-only family')
    # SV08/SV09: one stage only carries an unknown property.
    x, y = copy.deepcopy((a, b)); x['unexpected'] = 'refused'; y['prepared_sha256'] = source_digest(x)
    check(source_valid(c, x, y, e, schemas) == 'schema_refused', name + ': table SV08 prepared stage unknown property')
    y = copy.deepcopy(b); y['unexpected'] = 'refused'
    check(source_valid(c, a, y, e, schemas) == 'schema_refused', name + ': table SV09 completed stage unknown property')
    # SV29/SV30: the captured key or event id differs from the recomputed identity (both stages, coherent).
    for field, value in [('idempotency_key', b['idempotency_key'][:-1] + ('0' if b['idempotency_key'][-1] != '0' else '1')),
                         ('event_id', b['event_id'][:-1] + ('0' if b['event_id'][-1] != '0' else '1'))]:
        x, y = copy.deepcopy((a, b)); x[field] = y[field] = value; y['prepared_sha256'] = source_digest(x)
        check(source_valid(c, x, y, e, schemas) == 'identity_refused', name + ': table captured ' + field)
    # SV27/SV28: only the event copy differs.
    for field, value in [('idempotency_key', e['idempotency_key'][:-1] + ('0' if e['idempotency_key'][-1] != '0' else '1')),
                         ('event_id', e['event_id'][:-1] + ('0' if e['event_id'][-1] != '0' else '1'))]:
        bad = dict(e, **{field: value})
        check(source_valid(c, a, b, bad, schemas) == 'identity_refused', name + ': table event ' + field)
    # ID02: an application partition without its original application identity.
    try:
        identity(c, b['payload'], 'app', None); refused = None
    except TableRefusal as refusal:
        refused = refusal.row
    check(refused == 'ID02_application_present', name + ': table ID02 application identity absent')
    # AM01: a retry key that is not exactly a str.
    for value in [1, True, None, [], {}]:
        check(append_model({}, value, producer_semantic_digest(e), None) == ('schema_refused', None), name + ': table AM01 key ' + repr(value))
    # CP26: one verified source row is not an object.
    case = copy.deepcopy(f['checkpoint_cases'][0])
    if case['context']['source_rows']:
        case['context']['source_rows'][0] = 'row'
        check(checkpoint_result(c, case['previous'], case['proposed'], case['context'], schemas[slug + '_checkpoint']) == 'unavailable',
              name + ': table CP26 non-object source row')
    # HR09: only the prepared stage under inspection differs from its sealed original
    # (the completed stage, its prepare commitment and so the SP-1101 binding are unchanged).
    forged = copy.deepcopy(a); forged['owner_ref'] += '-forged'
    ctx = dict(f['historical_reader_oracle']['context'], live_before=None)
    check(historical_read(c, forged, b, e, schemas, ctx)['result'] == 'unavailable', name + ': table HR09 prepared stage differs from its sealed original')
    # DS02: source bytes that are not strict UTF-8.
    try:
        decode_source(b'\xff'); refused = None
    except TableRefusal as refusal:
        refused = refusal.row
    check(refused == 'DS02_utf8', name + ': table DS02 invalid UTF-8 source')
    # HR13: SP-1101 custody refuses a record with no sealed original at its ref, and a binding custody does not hold.
    ctx = dict(f['historical_reader_oracle']['context'], live_before=None)
    forged = dict(e, event_id='evt_dt_' + '0' * 64)
    check(historical_read(c, a, b, forged, schemas, ctx)['result'] == 'unavailable', name + ': table HR13 no sealed original at the ref')
    forged = dict(e, idempotency_key=e['idempotency_key'][:-1] + ('0' if e['idempotency_key'][-1] != '0' else '1'))
    check(historical_read(c, a, b, forged, schemas, ctx)['result'] == 'unavailable', name + ': table HR13 binding differs from custody')
    # RT02/RT04: an eligible retained record that is too young, or still has a dependent.
    for case in f['retention_cases']:
        if case['expected_eligible']:
            value = case['input']
            anchor = value.get('run_completed_at') or value.get('terminal_at')
            check(retention_eligible(dict(value, now=anchor)) is False, name + ': table RT02 too young ' + case['case'])
            check(retention_eligible(dict(value, dependent=True)) is False, name + ': table RT04 dependent ' + case['case'])
    if name == 'tool.invoked':
        parent = copy.deepcopy(next(v for v in f['positive_variants'] if v['case'] == 'batch_parent'))
        children = [copy.deepcopy(next(v for v in f['positive_variants'] if v['case'] == label)) for label in ['batch_url_1', 'batch_url_2']]
        check(batch_join(parent, children), name + ': table batch control')
        empty = copy.deepcopy(parent); empty['event']['payload']['meta']['child_tool_use_ids'] = []
        check(not batch_join(empty, []), name + ': table BJ02 parent with no children')
        twice = copy.deepcopy(parent); twice['event']['payload']['meta']['child_tool_use_ids'] = [children[0]['event']['payload']['tool_use_id']] * 2
        check(not batch_join(twice, [children[0], copy.deepcopy(children[0])]), name + ': table BJ04 child named twice')
        role = copy.deepcopy(children); role[0]['event']['payload']['meta']['batch_role'] = 'parent'
        check(not batch_join(parent, role), name + ': table BJ06 child role')
        reused = copy.deepcopy(children); same = copy.deepcopy(parent)
        reused[0]['event']['payload']['tool_use_id'] = parent['event']['payload']['tool_use_id']
        same['event']['payload']['meta']['child_tool_use_ids'][0] = parent['event']['payload']['tool_use_id']
        check(not batch_join(same, reused), name + ': table BJ11 child reuses the parent tool_use_id')


# ------------------------------------------------------------------ sweep part 2B witnesses
# CV-1101 forms. The broad EventRecord profile admits lowercase t/z, offsets,
# real (offset-adjusted) leap seconds, any fraction length and year 0000; CV-253
# Storage times take uppercase Z only. Every refused form is one defect.
BROAD_ACCEPTED = ('2026-11-04t00:00:00z', '2026-11-04T05:30:00+05:30', '2026-11-03T19:00:00-05:00', '2016-12-31T23:59:60Z',
                  '2017-01-01T05:29:60+05:30', '2026-11-04T00:00:00.000000000000000000001Z', '0000-01-01T00:00:00Z')
DATE_TIME_REFUSED = ('2026-11-04T24:00:00Z', '2026-11-04T00:00:00Z\n', 'not-a-date', '2026-11-04 00:00:00Z', '20261104T000000Z',
                     '2026-11-04T00:00:00', '2026-11-04T00:00:60Z', '2026-02-29T00:00:00Z', '2026-02-30T00:00:00Z',
                     '2026-11-04T00:00:00+24:00', '2026-11-04T00:00:00+05:60', '2026-11-04T00:00:00,5Z', '2026-11-04T00:00:00.Z',
                     ' 2026-11-04T00:00:00Z', '2016-12-31T23:59:60+01:00')
STORAGE_ACCEPTED = ('2026-11-04T00:00:00Z', '2026-11-04T00:00:00.123456789012Z', '2016-12-31T23:59:60Z')
STORAGE_REFUSED = ('2026-11-04T00:00:00+00:00', '2026-11-04T00:00:00-00:00', '2026-11-04T00:00:00z', '2026-11-04T05:30:00+05:30',
                   '2026-11-04T24:00:00Z', '2026-11-04T00:00:00Z\n')


def datetime_paths(schema, value, path=()):
    """Every populated `format: date-time` leaf of a value, including nullable/alternative schemas."""
    if schema.get('format') == 'date-time' and isinstance(value, str):
        yield path
    if isinstance(value, dict):
        for key, child in value.items():
            yield from datetime_paths(schema.get('properties', {}).get(key, {}), child, path + (key,))
    if isinstance(value, list):
        for index, child in enumerate(value):
            yield from datetime_paths(schema.get('items', {}), child, path + (index,))
    for keyword in ['anyOf', 'oneOf', 'allOf']:
        for branch in schema.get(keyword, []):
            yield from datetime_paths(branch, value, path)


def same_instant_forms(value):
    """Owner-valid spellings of one uppercase-Z second instant (test construction only, never validation)."""
    import datetime as host
    moment = host.datetime.strptime(value, '%Y-%m-%dT%H:%M:%SZ')
    plus = (moment + host.timedelta(hours=5, minutes=30)).strftime('%Y-%m-%dT%H:%M:%S') + '+05:30'
    minus = (moment - host.timedelta(hours=5)).strftime('%Y-%m-%dT%H:%M:%S') + '-05:00'
    return [value.replace('T', 't').replace('Z', 'z'), plus, minus, value[:-1] + '.000000000000000000000Z']


def replace_occurrence(value, original, replacement, top=True):
    """Replace one timestamp string everywhere except the event's Storage-assigned times."""
    if isinstance(value, dict):
        return {k: v if top and k in STORAGE_TIME_FIELDS else replace_occurrence(v, original, replacement, False)
                for k, v in value.items()}
    if isinstance(value, list):
        return [replace_occurrence(v, original, replacement, False) for v in value]
    return replacement if value == original else value


def coherent_producer_sequence(values, number):
    """One producer_sequence_id value on the event and both captured envelope copies, recommitted."""
    a, b, e = copy.deepcopy(values)
    a['envelope_context']['producer_sequence_id'] = b['envelope_context']['producer_sequence_id'] = e['producer_sequence_id'] = number
    b['prepared_sha256'] = hashlib.sha256(source_bytes(a)).hexdigest()
    return a, b, e


def datetime_checks(c, f, schemas, check):
    """CV-1101 at every DT timestamp field: the shared predicate through each validator, profiles per owner."""
    name = c['event_type']; slug = name.replace('.', '_')
    cases = [(slug, f['valid_payload']), (slug + '_source', f['prepared_source']), (slug + '_source', f['completed_source']),
             (slug + '_checkpoint', f['checkpoint'])]
    for variant in f['positive_variants']:
        source = slug + ('_application_source' if variant['event']['scope_kind'] == 'application' else '_source')
        cases.extend([(source, variant['prepared']), (source, variant['completed'])])
    seen = set()
    for definition, value in cases:
        rule = lane_validator(schemas[definition])
        for path in datetime_paths(schemas[definition], value):
            if (definition, path) in seen:
                continue
            seen.add((definition, path))
            label = name + ': CV-1101 ' + definition + '/' + '/'.join(map(str, path)) + ' '
            for form in BROAD_ACCEPTED:
                changed = copy.deepcopy(value); set_path(changed, path, form)
                check(schema_accepts(rule, changed), label + 'accepts ' + repr(form))
            for form in DATE_TIME_REFUSED:
                changed = copy.deepcopy(value); set_path(changed, path, form)
                check(not schema_accepts(rule, changed), label + 'refuses ' + repr(form))
    a, b, e = copy.deepcopy([f[k] for k in ['prepared_source', 'completed_source', 'event_record']])
    # EventRecord occurred_at_utc: broad profile; observed_at_utc/persisted_at_utc: CV-253 storage_utc_z.
    for form in BROAD_ACCEPTED:
        check(event_schema_errors(dict(e, occurred_at_utc=form)) == 0, name + ': EventRecord occurred_at_utc accepts ' + repr(form))
    for form in DATE_TIME_REFUSED:
        check(event_schema_errors(dict(e, occurred_at_utc=form)) > 0, name + ': EventRecord occurred_at_utc refuses ' + repr(form))
        check(source_valid(c, a, b, dict(e, occurred_at_utc=form), schemas) == 'schema_refused', name + ': writer refuses occurred_at_utc ' + repr(form))
    for field in STORAGE_TIME_FIELDS:
        for form in STORAGE_ACCEPTED:
            check(event_schema_errors(dict(e, **{field: form})) == 0, name + ': CV-253 ' + field + ' accepts ' + repr(form))
            check(source_valid(c, a, b, dict(e, **{field: form}), schemas) == 'accepted', name + ': writer accepts ' + field + ' ' + repr(form))
        for form in STORAGE_REFUSED:
            check(event_schema_errors(dict(e, **{field: form})) > 0, name + ': CV-253 ' + field + ' refuses ' + repr(form))
            check(source_valid(c, a, b, dict(e, **{field: form}), schemas) == 'schema_refused', name + ': writer refuses ' + field + ' ' + repr(form))
            # SP-1101: a sealed original with an owner-invalid Storage time is never authorized by a skipped check.
            bad = dict(e, **{field: form})
            with retained_world((a, b, bad)):
                check(historical_read(c, a, b, bad, schemas, dict(f['historical_reader_oracle']['context'], live_before=None))['result'] == 'unavailable',
                      name + ': retained original with invalid ' + field + ' ' + repr(form))
    # The whole occurrence closure in other owner-valid spellings of the same instant: writer and retained reader.
    original = e['occurred_at_utc']
    for form in same_instant_forms(original):
        x, y, z = recommit(c, replace_occurrence([a, b, e], original, form))
        check(source_valid(c, x, y, z, schemas) == 'accepted', name + ': occurrence closure accepted at ' + repr(form))
        with retained_world((x, y, z)):
            check(historical_read(c, x, y, z, schemas, dict(f['historical_reader_oracle']['context'], live_before=None))['result'] == 'retained',
                  name + ': retained occurrence closure keeps ' + repr(form))
            check(historical_read(c, x, y, z, schemas, dict(f['historical_reader_oracle']['context'], live_before=None))['value']['occurred_at_utc'] == form,
                  name + ': retained occurrence string preserved ' + repr(form))
    if name == 'approval.timeout':
        payload, before, outcome = (copy.deepcopy(f['completed_source'][k]) for k in ['payload', 'before', 'owner_result'])
        def timeout(ts, deadline):
            return transition(name, dict(payload, ts=ts), dict(before, deadline_at_utc=deadline), outcome)
        for ts, deadline, expected, why in [
                ('2026-11-04T05:30:00+05:30', '2026-11-04T00:00:00Z', True, 'equal instant at another offset'),
                ('2026-11-04t05:30:00.00000020+05:30', '2026-11-04T00:00:00.0000002Z', True, 'equal instant, complete fraction'),
                ('2026-11-04T00:00:00.0000001Z', '2026-11-04T00:00:00.0000002Z', False, 'one tenth-microsecond early (microseconds would tie)'),
                ('2026-11-04T05:29:59.9999999+05:30', '2026-11-04T00:00:00Z', False, 'early across an offset'),
                ('2016-12-31T23:59:60.25Z', '2016-12-31T23:59:60.5Z', False, 'early inside a leap second'),
                ('2016-12-31T23:59:60.5Z', '2016-12-31T23:59:60.5Z', True, 'equal leap-second instant'),
                ('2017-01-01T00:00:00Z', '2016-12-31T23:59:60.5Z', True, 'after a leap second'),
                ('2016-12-31T23:59:60Z', '2016-12-31T23:59:59.999Z', True, 'leap second after its preceding second'),
                ('2026-11-04T24:00:00Z', '2026-11-03T23:59:00Z', False, 'ts refused by the shared predicate (AT3)'),
                ('2026-11-04T00:00:00Z\n', '2026-11-03T23:59:00Z', False, 'ts with a trailing LF (AT3)'),
                ('2026-11-04T00:00:00Z', '2026-11-03T23:59:60Z', False, 'deadline at a false leap second (AT4)'),
                ('2026-11-04T00:00:00Z', '20261103T235900Z', False, 'deadline in basic form (AT4)')]:
            check(timeout(ts, deadline) is expected, name + ': exact timeout instant, ' + why)
    for case in f['retention_cases']:
        if not case['expected_eligible']:
            continue
        value = case['input']; anchor_key = 'run_completed_at' if 'run_completed_at' in value and value['run_completed_at'] else 'terminal_at'
        days = 365 if value['policy'] == 'RP-RUNTIME-365D' else 2555
        import datetime as host
        anchor = host.datetime(2019, 1, 1, 12, 0, 0)
        due = anchor + host.timedelta(days=days)
        anchor_text = (anchor - host.timedelta(hours=5)).strftime('%Y-%m-%dT%H:%M:%S') + '.5-05:00'
        due_text = (due + host.timedelta(hours=5, minutes=30)).strftime('%Y-%m-%dT%H:%M:%S') + '.5+05:30'
        early_text = (due + host.timedelta(hours=5, minutes=30)).strftime('%Y-%m-%dT%H:%M:%S') + '.4999999999+05:30'
        for now, anchored, expected, why in [
                (due_text, anchor_text, True, 'exactly the policy days at other offsets'),
                (early_text, anchor_text, False, 'a fraction of a second short of the policy days'),
                ('2026-11-04T24:00:00Z', anchor_text, False, 'now refused by the shared predicate (RT05)'),
                (due_text, '2019-01-01T07:00:00.5-05:60', False, 'anchor refused by the shared predicate (RT06)')]:
            check(retention_eligible(dict(value, now=now, **{anchor_key: anchored})) is expected, name + ': exact retention age, ' + why + ' ' + case['case'])


def number_checks(c, f, schemas, check):
    """CV-1100/SP-1100 at DT's number boundaries: producer route, Storage uint64 and integer slots."""
    name = c['event_type']; slug = name.replace('.', '_')
    base = copy.deepcopy([f[k] for k in ['prepared_source', 'completed_source', 'event_record']])
    ctx = dict(f['historical_reader_oracle']['context'], live_before=None)
    # F16: the complete producer projection is qualified through the shared JCS route before append.
    for number, writer in [(2 ** 53, 'accepted'), (2 ** 53 + 1, 'number_domain'), (2 ** 60, 'number_domain'),
                           (UINT64_MAX, 'number_domain'), (10 ** 4399, 'number_domain')]:
        a, b, e = coherent_producer_sequence(base, number)
        check(source_valid(c, a, b, e, schemas) == writer, name + ': producer route producer_sequence_id ' + int_text(number)[:24])
        check(append_model({}, e['idempotency_key'], retry_digest(e), None)[0] == ('appended' if writer == 'accepted' else 'schema_refused'),
              name + ': retry route producer_sequence_id ' + int_text(number)[:24])
        if number <= UINT64_MAX:
            with retained_world((a, b, e)):
                check(historical_read(c, a, b, e, schemas, ctx)['result'] == 'retained', name + ': retained producer_sequence_id ' + int_text(number))
        else:
            # No Storage value can hold it (SP-1100 physical range), so no such original is sealed: the
            # committed original at that ref differs and the read refuses with a code (HR11), never a crash.
            check(historical_read(c, a, b, e, schemas, ctx)['result'] == 'unavailable', name + ': unsealable producer_sequence_id refused')
    for number in [-1, -(10 ** 4399), float(base[2]['producer_sequence_id']), True]:
        a, b, e = base
        check(source_valid(c, a, b, dict(e, producer_sequence_id=number), schemas) == 'schema_refused',
              name + ': EventRecord producer_sequence_id refuses ' + (int_text(number) if type(number) is int else repr(number))[:24])
    # SP-1100: Storage sequence_id is an exact uint64.
    a, b, e = base
    for number, expected in [(UINT64_MAX, 'accepted'), (UINT64_MAX + 1, 'schema_refused'), (float(e['sequence_id']), 'schema_refused')]:
        check(source_valid(c, a, b, dict(e, sequence_id=number), schemas) == expected, name + ': Storage sequence_id ' + repr(number))
    # Every populated payload integer slot refuses its integral float and a value past its owner maximum.
    payload_rule = lane_validator(schemas[slug])
    for path, value, rule in typed_values(schemas[slug], f['valid_payload']):
        if schema_value_kind(rule) != 'integer' or type(value) is not int:
            continue
        changed = copy.deepcopy(f['valid_payload']); set_path(changed, path, float(value))
        check(not schema_accepts(payload_rule, changed), name + ': integral float refused at ' + '/'.join(map(str, path)))
        if 'maximum' in rule:
            changed = copy.deepcopy(f['valid_payload']); set_path(changed, path, rule['maximum'] + 1)
            check(not schema_accepts(payload_rule, changed), name + ': past the owner maximum at ' + '/'.join(map(str, path)))
    # The 4,400-digit integer is refused with a code (or encoded exactly), never a crash.
    big = 10 ** 4399
    raw = b'{"a":' + int_text(big).encode() + b'}'
    check(decode_source(raw) == {'a': big} and canonical({'a': big}) == raw, name + ': 4,400-digit source integer decodes and encodes exactly')
    try:
        producer_semantic_digest(dict(e, producer_sequence_id=big)); refused = None
    except Refusal as refusal:
        refused = refusal.reason
    check(refused == 'jcs_binary64', name + ': 4,400-digit producer digest refuses jcs_binary64')
    try:
        application_bytes(big); refused = None
    except Refusal as refusal:
        refused = refusal.reason
    check(refused == 'physical_integer_range', name + ': 4,400-digit physical value refuses physical_integer_range')
    if 'blocked_sequence' in c['identity_fields']:
        try:
            identity(c, dict(b['payload'], blocked_sequence=big)); row = None
        except TableRefusal as refusal:
            row = refusal.row
        check(row == 'ID01_blocked_sequence', name + ': 4,400-digit blocked_sequence refused at ID01')
        bad = copy.deepcopy(e); bad['payload']['blocked_sequence'] = big
        check(source_valid(c, a, b, bad, schemas) == 'number_domain', name + ': 4,400-digit inline blocked_sequence refused by the producer route (SV36)')


def number_corpus_checks(c, f, schemas, check):
    """The shared number corpus through this lane's raw source ingress, writer and retry routes.

    Every number-scope raw spelling and exact integer of Plans/event_number_recipe_corpus.json
    is written as raw JSON text at the captured producer_sequence_id of both source stages,
    decoded by decode_source, joined with the event, and run through source_valid and
    append_model. Expectations come from the shared helpers alone (loads_current_json,
    current_integer with the slot's minimum, producer_semantic_digest).
    """
    name = c['event_type']
    a, b, e = copy.deepcopy([f[k] for k in ['prepared_source', 'completed_source', 'event_record']])
    marker = 7777777777777777777
    template = [canonical(dict(x, envelope_context=dict(x['envelope_context'], producer_sequence_id=marker))) for x in (a, b)]
    for spelling in number_corpus_spellings():
        expected = 'accepted'
        try:
            parsed = pm_event_numbers.loads_current_json(spelling)
            current_integer(parsed, minimum=0)
            if producer_refusal_value(e, parsed) is not None:
                expected = 'number_domain'
            if spelling != int_text(parsed):
                # pm.dt.source.json.v1 (CV-600..616): whitespace outside strings is refused and the
                # complete canonical re-encode must equal the input, so only the shortest spelling reads.
                expected = 'refused'
        except Refusal:
            expected = 'refused'
        try:
            prepared = decode_source(template[0].replace(str(marker).encode(), spelling.encode()))
            completed_raw = canonical(dict(decode_source(template[1].replace(str(marker).encode(), spelling.encode())),
                                           prepared_sha256=hashlib.sha256(canonical(prepared)).hexdigest()))
            completed = decode_source(completed_raw)
        except TableRefusal:
            actual = 'refused'
        else:
            event = dict(e, producer_sequence_id=prepared['envelope_context']['producer_sequence_id'])
            result = source_valid(c, prepared, completed, event, schemas)
            actual = 'accepted' if result == 'accepted' else 'number_domain' if result == 'number_domain' else 'refused'
            retry = append_model({}, event['idempotency_key'], retry_digest(event), None)[0]
            check(retry == ('appended' if actual == 'accepted' else 'schema_refused' if actual == 'number_domain' else retry),
                  name + ': shared corpus retry ' + spelling[:40])
        check(actual == expected, name + ': shared corpus ' + spelling[:40] + ' expected ' + expected + ' got ' + actual)


def producer_refusal_value(event, number):
    try:
        pm_event_numbers.producer_semantic_digest(dict(event, producer_sequence_id=number))
    except Refusal as refusal:
        return refusal.reason
    return None


_CORPUS_SPELLINGS = []


def number_corpus_spellings():
    """Distinct number-scope raw spellings and exact integers of the shared corpus, plus 4,400-digit integers."""
    if not _CORPUS_SPELLINGS:
        corpus = load('Plans/event_number_recipe_corpus.json')['cases']
        spellings = []
        for case in corpus:
            if case.get('date_time_profile') is not None:
                continue
            if case.get('op') in ('token', 'parse', 'parse_token', 'slot') and type(case.get('raw')) is str:
                spellings.append(case['raw'])
            elif case.get('op') == 'json_number' and type(case.get('token')) is str:
                spellings.append(case['token'])
            elif case.get('op') in ('integer', 'uint64') and type(case.get('value')) is dict and '@int' in case['value']:
                spellings.append(case['value']['@int'])
        spellings += [int_text(10 ** 4399), '-' + int_text(10 ** 4399)]
        _CORPUS_SPELLINGS.extend(dict.fromkeys(spellings))
    return _CORPUS_SPELLINGS


def checker_exit_code(failures):
    return int(bool(failures))


def oversized_inline(c, f):
    """A valid original closure whose sole defect is crossing SP-337's limit.

    RFC 3339 permits arbitrary fractional precision. Zero extension preserves
    the timestamp's value while growing every observational copy consistently.
    Recompute identities and the prepare commitment after changing the closure.
    Keep the large bytes generated, rather than storing them in the fixture.
    """
    a, b, e = copy.deepcopy([f[k] for k in ['prepared_source', 'completed_source', 'event_record']])
    field = 'observed_at_utc' if c['event_type'] == 'usage.event' else 'ts'
    original = e['payload'][field]
    extended = original[:-1] + ('' if '.' in original else '.') + '0' * 17000 + 'Z'
    def replace(value):
        if isinstance(value, dict):
            return {key: replace(child) for key, child in value.items()}
        if isinstance(value, list):
            return [replace(child) for child in value]
        return extended if value == original else value
    a, b, e = replace([a, b, e])
    key, eid = identity(c, b['payload'], b['scope_partition'])
    for item in [a, b, e]:
        item['idempotency_key'] = key
        item['event_id'] = eid
    if c['event_type'] == 'usage.event':
        b['payload']['usage_event_ref'] = e['payload']['usage_event_ref'] = eid
    b['prepared_sha256'] = hashlib.sha256(source_bytes(a)).hexdigest()
    return a, b, e


def semantic_case(f, case):
    """Apply one defect to an explicitly valid base and recommit its witnesses."""
    a, b, e = copy.deepcopy([f[k] for k in ['prepared_source', 'completed_source', 'event_record']])
    for change in case.get('base_changes', []):
        set_path(a, change['path'], change['value'])
    b['before'] = copy.deepcopy(a['before'])
    b['prepared_sha256'] = hashlib.sha256(source_bytes(a)).hexdigest()
    base = copy.deepcopy((a, b, e))
    set_path(b if case['path'][0] == 'owner_result' else a, case['path'], case['value'])
    b['before'] = copy.deepcopy(a['before'])
    b['prepared_sha256'] = hashlib.sha256(source_bytes(a)).hexdigest()
    return base, (a, b, e)


def envelope_case(c, f, field, value):
    """One envelope-witness disagreement; all other identity joins agree."""
    a, b, e = copy.deepcopy([f[k] for k in ['prepared_source', 'completed_source', 'event_record']])
    original = e[field]
    def change(value_object):
        if isinstance(value_object, dict):
            return {key: value if key == field and child == original else change(child)
                    for key, child in value_object.items()}
        if isinstance(value_object, list):
            return [change(child) for child in value_object]
        return value_object
    a, b, e = change([a, b, e])
    a['scope_partition'] = b['scope_partition'] = partition_for(e)
    key, eid = identity(c, b['payload'], b['scope_partition'])
    for item in [a, b, e]:
        item['idempotency_key'] = key; item['event_id'] = eid
    if c['event_type'] == 'usage.event':
        b['payload']['usage_event_ref'] = e['payload']['usage_event_ref'] = eid
    b['prepared_sha256'] = hashlib.sha256(source_bytes(a)).hexdigest()
    base = copy.deepcopy((a, b, e))
    a['envelope_context'][field] = b['envelope_context'][field] = original
    b['prepared_sha256'] = hashlib.sha256(source_bytes(a)).hexdigest()
    return base, (a, b, e)


def standing_results(c, f, schemas):
    """Ten independent, per-family standing oracles; no admission/native proof."""
    name = c['event_type']; slug = name.replace('.', '_')
    a, b, e = (copy.deepcopy(f[k]) for k in ['prepared_source', 'completed_source', 'event_record'])
    replay = dict(e, replay_policy='projector_replay_only')
    results = {'1': {'writer': source_valid(c, a, b, replay, schemas),
                     'retry': recovery(c, f, dict(f['recovery_cases'][0]['input'], replay_policy='projector_replay_only'), schemas)}}
    app = [v for v in f['positive_variants'] if v['event']['scope_kind'] == 'application']
    app_results = []
    for variant in app:
        x, y, z = (copy.deepcopy(variant[k]) for k in ['prepared', 'completed', 'event'])
        sid = y['application_scope']['server_id']; oid = y['owner_operation_id']
        expected = 'application@1:' + sid.encode().hex() + ':' + oid.encode().hex()
        negatives = []
        for key in ['application@1:' + sid + ':' + oid,
                    'application@1:' + 'other-server'.encode().hex() + ':' + oid.encode().hex(),
                    expected.replace('application@1:', 'application:')]:
            aa, bb, ee = copy.deepcopy((x, y, z))
            ee['idempotency_key'] = key; ee['event_id'] = 'evt_dt_' + hashlib.sha256(key.encode()).hexdigest()
            for item in [aa, bb]:
                item['idempotency_key'] = key; item['event_id'] = ee['event_id']
            if name == 'usage.event':
                bb['payload']['usage_event_ref'] = ee['event_id']; ee['payload']['usage_event_ref'] = ee['event_id']
            bb['prepared_sha256'] = hashlib.sha256(source_bytes(aa)).hexdigest()
            negatives.append(source_valid(c, aa, bb, ee, schemas))
        app_results.append({'case': variant['case'], 'exact_key': z['idempotency_key'] == expected,
                            'positive': source_valid(c, x, y, z, schemas), 'bad_keys': negatives})
    results['2'] = {'application_cases': app_results}
    if not app:
        bad_source = copy.deepcopy(a); bad_source['envelope_context']['scope_kind'] = 'application'
        results['2']['forbidden_application_scope'] = 'schema_refused' if not schema_accepts(lane_validator(schemas[slug + '_source']), bad_source) else 'accepted'
    aa, bb = copy.deepcopy((a, b)); aa['scope_partition'] = bb['scope_partition'] = e['project_id']
    bb['prepared_sha256'] = hashlib.sha256(source_bytes(aa)).hexdigest()
    project_cases = [(b, e)] + [(v['completed'], v['event']) for v in f['positive_variants'] if v['event']['scope_kind'] == 'project']
    results['3'] = {'encoded_positives': all(done['scope_partition'] == partition_for(event) for done, event in project_cases),
                    'raw_id': source_valid(c, aa, bb, e, schemas)}
    ref = dict(e, payload={}, payload_ref='payload:fixture-verified-pack-body')
    results['4'] = {'oversized_inline': source_valid(c, *oversized_inline(c, f), schemas),
                    'verified_ref': source_valid(c, a, b, ref, schemas, b['payload'], True),
                    'unverified_ref': source_valid(c, a, b, ref, schemas, b['payload'], False),
                    'changed_ref': source_valid(c, a, b, ref, schemas, {}, True)}
    case = copy.deepcopy(f['checkpoint_cases'][0]); cp = schemas[slug + '_checkpoint']
    case['proposed']['index_read_token']['generation_anchor_sha256'] += '\n'
    for token_owner in [case['context'], case['context']['verified_prefix']]:
        token_owner['current_token' if token_owner is case['context'] else 'index_read_token'] = copy.deepcopy(case['proposed']['index_read_token'])
    results['5'] = {'coherent_trailing_lf': checkpoint_result(c, case['previous'], case['proposed'], case['context'], cp)}
    key = e['idempotency_key']; seen = {}; original = {'event': e, 'receipt': f['first_append_receipt']}
    append_model(seen, key, producer_semantic_digest(e), original)
    metadata = []; producer = []
    for mutation in f['retry_oracle']['storage_metadata_mutations']:
        changed = dict(e, **{mutation['field']: mutation['value']})
        metadata.append(append_model(seen, key, producer_semantic_digest(changed), None) == ('original', original) and len(seen) == 1)
    for mutation in f['retry_oracle']['producer_mutations']:
        changed = dict(e, **{mutation['field']: mutation['value']})
        producer.append(append_model(seen, key, producer_semantic_digest(changed), None) == ('idempotency_conflict', None) and len(seen) == 1)
    results['6'] = {'metadata_original': metadata, 'producer_conflicts': producer}
    mismatches = []
    for path in [('storage_instance_id',), ('index_read_token', 'storage_instance_id'),
                 ('index_read_token', 'source_selection', 'storage_instance_id')]:
        case = copy.deepcopy(f['checkpoint_cases'][0])
        set_path(case['proposed'], path, '22222222-2222-4222-8222-222222222222')
        mismatches.append(checkpoint_result(c, case['previous'], case['proposed'], case['context'], cp))
    case = copy.deepcopy(f['checkpoint_cases'][0]); proposed = case['proposed']; token = proposed['index_read_token']
    foreign = '22222222-2222-4222-8222-222222222222'
    proposed['storage_instance_id'] = token['storage_instance_id'] = token['source_selection']['storage_instance_id'] = foreign
    token['checkpoint_key'] = 'event_record_index_checkpoint.v1:' + foreign
    token['checkpoint_ref'] = token['checkpoint_key'] + '#/generations/' + token['generation_id']
    case['context']['current_token'] = copy.deepcopy(token)
    case['context']['verified_prefix']['index_read_token'] = copy.deepcopy(token)
    mismatches.append(checkpoint_result(c, case['previous'], proposed, case['context'], cp))
    results['7'] = {'positive_matches_event': all(v['proposed']['storage_instance_id'] == v['proposed']['index_read_token']['storage_instance_id'] == v['proposed']['index_read_token']['source_selection']['storage_instance_id'] == b['storage_instance_id'] for v in f['checkpoint_cases'] if v['expected'] == 'published'),
                    'mismatches': mismatches}
    results['8'] = {'clean_exit': checker_exit_code([]), 'failure_exit': checker_exit_code([name + ': negative case'])}
    results['9'] = {'all_schema_references_resolved': True}  # Whole-bundle preflight in main.
    results['10'] = historical_results(c, f, schemas)
    return results


def retention_eligible(value):
    """Retention eligibility of one retained record; ineligibility is a retention row."""
    anchor, days = (value.get('run_completed_at'), 365) if value['policy'] == 'RP-RUNTIME-365D' else (value.get('terminal_at'), 2555) if value['policy'] == 'RP-OPERATIONAL-2555D' else (None, None)
    now_refusal, now = exact_instant(value['now'])
    anchor_refusal, anchored = exact_instant(anchor) if anchor is not None else (None, None)
    return table_refusal('retention', {
        'anchor_present': anchor is not None, 'now_refusal': now_refusal, 'anchor_refusal': anchor_refusal,
        'required_days': days, 'age_days': elapsed_days(now, anchored) if now is not None and anchored is not None else None,
        'held_truthy': bool(value['held']), 'dependent_truthy': bool(value['dependent'])}) is None


def projection_outcome(case):
    refusal = table_refusal('projection_retention', {'held_count': len(case['held_generations']),
                                                     'existing_generations': case['existing_generations']})
    return 'retire_unheld_derived_only' if refusal is None else refusal[1]


def references_refusal(errors):
    return table_refusal('references', {'unresolved': len(errors)})


def checker_inputs():
    schema_document = load('Plans/dt_event_contracts.schema.json')
    storage_schemas = {f['value_schema_ref']: f for f in load('Plans/storage_value_registry.json')['families']}
    event_schema = load('Plans/event_record.schema.json')
    contracts = load('Plans/dt_event_contracts.json')['families']
    fixtures = {f['event_type']: f for f in load('Plans/dt_event_contract_fixtures.json')['families']}
    # SP-1101 composition happens here, before any read and outside request data.
    install_original_custody(contracts, fixtures, schema_document, event_schema)
    return {'contracts': contracts, 'schema_document': schema_document,
            'schemas': schema_document['$defs'],
            'fixtures': fixtures,
            'registered': {f['event_type'] for f in load('Plans/event_family_registry.json')['families']},
            'storage_schemas': storage_schemas, 'event_schema': event_schema,
            'event_validator': EventRecordValidator(event_schema),
            'documents': {'Plans/dt_event_contracts.schema.json': schema_document, 'Plans/event_record.schema.json': event_schema},
            'mirrors': [(row['family_id'], row['value_schema'], ref) for ref, row in storage_schemas.items()
                        if ref.startswith('Plans/dt_event_contracts.schema.json#')]}


def family_checks(c, inputs, check):
    """Every per-family oracle check; returns the family's standing-check results."""
    schemas, storage_schemas, registered = inputs['schemas'], inputs['storage_schemas'], inputs['registered']
    event_validator = inputs['event_validator']
    name = c['event_type']; slug = name.replace('.', '_'); f = inputs['fixtures'][name]; p = f['valid_payload']
    for definition in [slug + '_checkpoint', slug + '_source', slug + '_application_source']:
        if definition in schemas:
            ref = 'Plans/dt_event_contracts.schema.json#/$defs/' + definition
            check(storage_schemas[ref]['value_schema'] == schemas[definition], name + ': exact Storage schema mirror ' + definition)
    identifier_checks(c, f, schemas, check)
    technical_checks(c, f, schemas, check)
    round6_checks(c, f, schemas, check)
    table_witness_checks(c, f, schemas, check)
    datetime_checks(c, f, schemas, check)
    number_checks(c, f, schemas, check)
    number_corpus_checks(c, f, schemas, check)
    standing = standing_results(c, f, schemas)
    for number in map(str, range(1, 11)):
        check(standing[number] == f['standing_check_oracles'][number], name + ': standing check ' + number)
    validator = lane_validator(schemas[slug])
    check(schema_accepts(validator, p), name + ': positive payload')
    check(name not in registered, name + ': no registry admission')
    for key in f['required_field_negatives']:
        negative = copy.deepcopy(p); del negative[key]
        check(not schema_accepts(validator, negative), name + ': missing payload ' + key)
    for key, val in [('unexpected', 'refused'), ('schema_id', 'wrong'), ('schema_version', '2.0.0')]:
        check(not schema_accepts(validator, dict(p, **{key: val})), name + ': invalid payload ' + key)
    prep, done, event = f['prepared_source'], f['completed_source'], f['event_record']
    check(schema_accepts(event_validator, event), name + ': complete current EventRecord envelope')
    check(source_valid(c, prep, done, event, schemas) == 'accepted', name + ': original source accepted')
    for stage in [prep, done]:
        check(decode_source(canonical(stage)) == stage, name + ': source canonical bytes')
        sc = schemas[slug + '_source']; Draft202012Validator.check_schema(sc)
        sv = lane_validator(sc)
        for key in sc['required']:
            bad = copy.deepcopy(prep if key == 'stage' else stage); del bad[key]
            check(not schema_accepts(sv, bad), name + ': missing source ' + key)
        check(not schema_accepts(sv, dict(stage, unexpected='refused')), name + ': closed source')
    check(sha(prep) == f['source_byte_oracle']['prepared_sha256'], name + ': pinned original source digest')
    check(canonical(prep).hex() == f['source_byte_oracle']['prepared_hex'], name + ': pinned original source bytes')
    for case in f['semantic_negatives']:
        base, negative = semantic_case(f, case)
        check(source_valid(c, *base, schemas) == 'accepted', name + ': valid semantic base ' + case['case'])
        check(source_valid(c, *negative, schemas) == case['expected'], name + ': ' + case['case'])
    ref_event = copy.deepcopy(event); ref_event['payload'] = {}; ref_event['payload_ref'] = 'payload:fixture-verified-pack-body'
    check(source_valid(c, prep, done, ref_event, schemas, p, True) == 'accepted', name + ': separately governed payload resolves before joins')
    check(source_valid(c, prep, done, ref_event, schemas, p, False) == 'payload_unavailable', name + ': unverified pack body unavailable')
    check(source_valid(c, prep, done, ref_event, schemas, {}, True) == 'payload_unavailable', name + ': changed pack body unavailable')
    bad_scope = copy.deepcopy(prep); bad_scope['envelope_context']['scope_kind'] = 'application'
    check(not schema_accepts(sv, bad_scope), name + ': source schema refuses wrong envelope scope')
    for field, value in [('project_id', 'wrong-project'), ('run_id', 'wrong-run'), ('actor_ref', 'wrong-actor')]:
        base, negative = envelope_case(c, f, field, value)
        check(source_valid(c, *base, schemas) == 'accepted', name + ': valid envelope base ' + field)
        check(source_valid(c, *negative, schemas) != 'accepted', name + ': wrong envelope ' + field)
    for field in c['identity_fields']:
        a, bad = copy.deepcopy((prep, done)); v = bad['subject'][field]
        a['subject'][field] = bad['subject'][field] = v + 1 if isinstance(v, int) else v + '-other'
        bad['prepared_sha256'] = hashlib.sha256(source_bytes(a)).hexdigest()
        check(source_valid(c, a, bad, event, schemas) != 'accepted', name + ': wrong source subject ' + field)
    for case in f['positive_variants']:
        check(schema_accepts(event_validator, case['event']), name + ': variant complete envelope ' + case['case'])
        check(source_valid(c, case['prepared'], case['completed'], case['event'], schemas) == 'accepted', name + ': ' + case['case'])
    for case in f.get('source_join_negatives', []):
        check(source_valid(c, case['prepared'], case['completed'], case['event'], schemas) == case['expected'], name + ': ' + case['case'])
    replay = copy.deepcopy(event); replay['replay_policy'] = 'projector_replay_only'
    check(source_valid(c, prep, done, replay, schemas) == 'replay_only_not_appendable', name + ': current writer refuses compatibility-only replay policy')
    retry = dict(f['recovery_cases'][0]['input'], replay_policy='projector_replay_only')
    check(recovery(c, f, retry, schemas) == {'result': 'replay_only_not_appendable', 'external_effects': 0, 'append_count': 0, 'value': None}, name + ': retry refuses compatibility-only replay policy')
    large = oversized_inline(c, f)
    check(schema_accepts(validator, large[2]['payload']) and schema_accepts(event_validator, large[2]), name + ': oversized closure retains valid payload/envelope schemas')
    check(source_valid(c, *large, schemas) == 'payload_ref_required', name + ': inline body over SP-337 limit requires payload ref')
    for case in f.get('application_identity_negatives', []):
        original = next(v for v in f['positive_variants'] if v['case'] == 'authenticated_application_source')
        a, b, e = (copy.deepcopy(original[k]) for k in ['prepared', 'completed', 'event'])
        for item in [a, b]:
            if '.' in case['field']:
                x, y = case['field'].split('.'); item[x][y] = case['value']
            else:
                item[case['field']] = case['value']
        b['prepared_sha256'] = hashlib.sha256(source_bytes(a)).hexdigest()
        check(source_valid(c, a, b, e, schemas) == case['expected'], name + ': app ' + case['case'])
    for case in f['retention_cases']:
        check(retention_eligible(case['input']) == case['expected_eligible'], name + ': retention ' + case['case'])
    check(f['retention_binding_oracle'] == c.get('retention_binding'), name + ': exact retention binding')
    if c.get('retention_binding'):
        binding = c['retention_binding']
        check('one Server-wide counterpart bucket' in binding['application_bucket'], name + ': SP-349 app counting boundary')
        if name == 'usage.event':
            check(binding['setting_key'] == 'ai.usage.usage-retention' and binding['default_days'] == 90 and not binding['deletion_enabled'] and not binding['admission_enabled'], name + ': decided Usage setting with adapter fenced')
    for case in f['projection_retention_cases']:
        check(projection_outcome(case) == case['expected'], name + ': ' + case['case'])
    key, eid = identity(c, p, done['scope_partition']); seen = {}; result = {'event': event, 'receipt': f['first_append_receipt']}
    check((key, eid) == (f['identity_oracle']['idempotency_key'], f['identity_oracle']['event_id']), name + ': pinned identity')
    check(identity(c, p, 'project~b3RoZXI') != (key, eid), name + ': scope identity isolation')
    digest = producer_semantic_digest(event)
    oracle = f['retry_oracle']
    check(producer_semantic_bytes(event).hex() == oracle['producer_semantic_bytes_hex'] and digest == oracle['producer_semantic_digest'], name + ': pinned caller semantic bytes/digest')
    check(append_model(seen, key, digest, result) == ('appended', result), name + ': first append')
    check(append_model(seen, key, digest, None) == ('original', result) and len(seen) == 1, name + ': duplicate returns original full value and receipt')
    for case in oracle['storage_metadata_mutations']:
        changed = copy.deepcopy(event); changed[case['field']] = case['value']
        check(schema_accepts(event_validator, changed), name + ': metadata retry valid envelope ' + case['field'])
        check(producer_semantic_digest(changed) == digest, name + ': metadata excluded from semantic digest ' + case['field'])
        check(append_model(seen, key, producer_semantic_digest(changed), None) == ('original', result) and len(seen) == 1,
              name + ': metadata retry returns original full event/receipt ' + case['field'])
    for case in oracle['producer_mutations']:
        changed = copy.deepcopy(event); changed[case['field']] = case['value']
        check(producer_semantic_digest(changed) != digest, name + ': producer field in semantic digest ' + case['field'])
        check(append_model(seen, key, producer_semantic_digest(changed), None) == ('idempotency_conflict', None) and len(seen) == 1,
              name + ': changed producer field conflicts ' + case['field'])
    check(append_model(seen, key, 'different', None) == ('idempotency_conflict', None), name + ': semantic conflict')
    for case in f['recovery_cases']:
        got = recovery(c, f, case['input'], schemas)
        check(got == case['expected'], name + ': ' + case['case'])
    cp = schemas[slug + '_checkpoint']; Draft202012Validator.check_schema(cp); cv = lane_validator(cp)
    check(len(cp['properties']['index_read_token']['required']) == 9, name + ': nine stored token fields')
    for key in cp['required']:
        bad = copy.deepcopy(f['checkpoint']); del bad[key]
        check(not schema_accepts(cv, bad), name + ': missing checkpoint ' + key)
    for case in f['checkpoint_cases']:
        got = checkpoint_result(c, case['previous'], case['proposed'], case['context'], cp)
        check(got == case['expected'], name + ': ' + case['case'])
        stored = case['proposed'] if got == 'published' else case['previous']
        check(stored == case['expected_stored'], name + ': exact checkpoint publication ' + case['case'])
    check(f['native_execution'] == 'NOT_RUN', name + ': native boundary')
    return standing


SHARED_BLOCKS = ('shared/source_codec', 'shared/messagepack', 'tool.denied', 'tool.invoked', 'usage.event')


def shared_checks(inputs, check, block=None):
    """Cross-case oracles; block selects one of SHARED_BLOCKS (None runs all)."""
    fixtures = inputs['fixtures']
    if block in (None, 'shared/source_codec'):
        for vector in load('Plans/dt_event_contract_fixtures.json')['source_codec_vectors']:
            try:
                value = decode_source(vector['bytes'].encode('utf-8')); accepted = True
            except (ValueError, UnicodeError, json.JSONDecodeError):
                value = None; accepted = False
            check(accepted == vector['accepted'], 'source codec: ' + vector['case'])
    if block in (None, 'shared/messagepack'):
        for vector in load('Plans/dt_event_contract_fixtures.json')['messagepack_integer_vectors']:
            try:
                actual = application_bytes(vector['value']).hex()
            except ValueError:
                actual = None
            check(actual == vector['expected_hex'], 'MessagePack integer: ' + vector['case'])
    if block in (None, 'tool.denied'):
        for case in fixtures['tool.denied']['non_emission_cases']:
            disposition = denial_emission(case['before'])
            check(disposition == case['expected'], 'tool.denied emission boundary: ' + case['case'])
            check((1 if disposition == 'emit' else 0) == case['append_count'], 'tool.denied append boundary: ' + case['case'])
    if block in (None, 'tool.invoked'):
        web = fixtures['tool.invoked']
        for case in web['batch_cases']:
            parent = copy.deepcopy(next(v for v in web['positive_variants'] if v['case'] == case['parent_case']))
            children = [copy.deepcopy(next(v for v in web['positive_variants'] if v['case'] == name)) for name in case['child_cases']]
            for change in case.get('changes', []):
                target = parent if change['target'] == 'parent' else children[change['target']]
                for field in change['path'][:-1]:
                    target = target[field]
                target[change['path'][-1]] = change['value']
            check(batch_join(parent, children) == case['expected'], 'tool.invoked batch: ' + case['case'])
    if block in (None, 'usage.event'):
        usage = fixtures['usage.event']
        for case in usage['accounting_cases']:
            check(accounting_totals(case['payload']) == case['expected'], 'usage accounting: ' + case['case'])
        for case in usage['usage_value_negatives']:
            check(not usage_values_valid(case['payload']), 'usage cost/quota: ' + case['case'])
        for case in usage['daily_total_cases']:
            original = case['daily_total']; backup = case['backup_captured_total']
            total = original if backup is None else backup
            actual = {'detail_retirement': 'eligible_under_owner_setting' if case['daily_committed'] else 'held', 'visible_total': total, 'canonical_total': total}
            if backup is not None:
                actual['lost_after_backup'] = original - backup
            check(actual == case['expected'], 'usage daily totals: ' + case['case'])
        # Replacement semantics: revisions replace one contribution, a new billed retry adds its own.
        for case in usage['settlement_accounting_cases']:
            contributions = {}
            for observation in case['observations']:
                if observation['settlement_status'] in ['settled', 'adjusted'] or observation['accepted_partial']:
                    contributions[observation['usage_record_id']] = observation['cost_microdollars']
            known = [v for v in contributions.values() if v is not None]
            check(sum(known) == case['expected_known_cost_microdollars'] and len(contributions) == case['expected_records'], 'usage replacement: ' + case['case'])


def main():
    inputs = checker_inputs()
    contracts = inputs['contracts']
    checks = 0
    failures = []
    counts = {}
    standing = {}
    def check(ok, message):
        nonlocal checks
        checks += 1
        if not ok:
            failures.append(message)
    reference_errors = schema_reference_errors(inputs['documents'], inputs['mirrors'])
    if references_refusal(reference_errors) is not None:
        # No fixture may hide an invalid schema behind a successful alternative.
        for c in contracts:
            check(False, c['event_type'] + ': unresolved schema reference; see schema_reference_errors')
        print(json.dumps({'status': 'fail', 'families': len(contracts), 'checks': checks,
                          'failures': failures, 'schema_reference_errors': reference_errors,
                          'native_execution': 'NOT_RUN'}, indent=2))
        return checker_exit_code(failures)
    order = table_order_errors()
    check(not order, 'shared: every table factory requires its rows in table order ' + ','.join(order))
    for c in contracts:
        start = checks
        standing[c['event_type']] = family_checks(c, inputs, check)
        counts[c['event_type']] = checks - start
    shared_checks(inputs, check)
    print(json.dumps({'status': 'pass' if not failures else 'fail', 'families': len(contracts), 'checks': checks,
                      'per_family_checks': counts, 'standing_checks': standing, 'failures': failures, 'native_execution': 'NOT_RUN',
                      'boundary': 'original-owner and SP-278 authentication are assumed adapters; no native proof'}, indent=2))
    return checker_exit_code(failures)


if __name__ == '__main__':
    raise SystemExit(main())
