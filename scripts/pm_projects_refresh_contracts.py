"""Read-only Projects refresh contract checks; no native or authority admission.

The reviewed fixture census and selected graph are finite. URI lookup is offline
and exact; historical banks are never selected by basename or newest version.
"""
from __future__ import annotations

import base64
import collections
import hashlib
import json
import math
import re
import struct
from datetime import datetime
from pathlib import Path
from urllib.parse import urldefrag, urljoin

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = (
    'Plans/assistant_chat_contract_fixtures.json',
    'Plans/assistant_memory_contract_fixtures.json',
    'Plans/assistant_plan_runtime_contract_fixtures.json',
    'Plans/automation_authority_contract_fixtures.json',
    'Plans/backup_restore_system_contract_fixtures.json',
    'Plans/collaborative_workflows_contract_fixtures.json',
    'Plans/computer_use_contract_fixtures.json',
    'Plans/cross_project_access_contract_fixtures.json',
    'Plans/forge_integration_contract_fixtures.json',
    'Plans/multi_account_contract_fixtures.json',
    'Plans/pm7_build_contracts.fixtures.json',
    'Plans/product_onboarding_contract_fixtures.json',
    'Plans/project_system_contract_fixtures.json',
    'Plans/projects_refresh_command_bindings.fixtures.json',
    'Plans/scheduling_and_quota_resume_contract_fixtures.json',
    'Plans/server_system_contract_fixtures.json',
    'Plans/settings_system_contract_fixtures.json',
    'tests/fixtures/goal_runtime_events/golden/application_scope_contract_cases.json',
    'tests/fixtures/runtime_artifacts/golden/application_scope_contract_cases.json',
)
SCHEMAS = tuple('Plans/' + name + '.schema.json' for name in (
    'application_workflow_contracts', 'application_workflow_sources',
    'assistant_attachment_contracts', 'assistant_chat_contracts', 'assistant_memory_contracts',
    'assistant_plan_runtime_contracts', 'automation_authority_contracts',
    'azure_devops_setup_contracts', 'backup_restore_system_contracts',
    'collaborative_workflows_contracts', 'computer_use_contracts',
    'coordination_event_admission', 'coordination_event_payloads', 'coordination_projection_contracts',
    'cross_project_access_contracts', 'editor_appearance', 'event_family_registry',
    'event_payload_context_compaction_completed', 'execution_unit_context',
    'final_gui_interaction_contracts', 'forge_integration_contracts', 'git_adapter_command_contracts',
    'guided_tour_contracts', 'home_layout_event_contracts', 'home_workspace_layout_v2',
    'jujutsu_integration_contracts', 'multi_account_contracts', 'plugin_contracts',
    'plugin_package_contracts', 'pm7_build_contracts', 'pm7_control_bindings',
    'product_onboarding_contracts', 'project_sync_backbone_contracts', 'project_system_contracts',
    'projects_refresh_command_bindings', 'protected_auth_browser_contracts',
    'remote_access_system_contracts', 'requested_effective_runtime',
    'runtime_artifact_context_snapshot', 'runtime_artifact_cost_usage', 'runtime_artifact_envelope',
    'runtime_artifact_restore_point', 'scheduling_and_quota_resume_contracts',
    'section15_browser_program_contracts', 'server_system_contracts', 'settings_inventory',
    'settings_system_contracts', 'shared_integration_runtime', 'shared_runtime_command_contracts',
    'source_control_contracts', 'touch_closure', 'ui_command_response', 'working_notebook_contracts',
))
REGISTRIES = (
    ('Plans/settings_inventory.schema.json', 'Plans/settings_inventory.json'),
    ('Plans/event_family_registry.schema.json', 'Plans/event_family_registry.json'),
    ('Plans/storage_value_registry.schema.json', 'Plans/storage_value_registry.json'),
    ('Plans/path_reference_registry.schema.json', 'Plans/path_reference_registry.json'),
)
SEMANTIC_KINDS = frozenset((
    'goal_body_currentness', 'goal_objective_revision', 'accepted_source', 'operation_intent',
    'thread_preview', 'schedule_target', 'conversion_manifest', 'source_graph',
))
COMPUTER_TOOLS = {
    'computer.screen': ('screen', 'ComputerScreen'),
    'computer.pointer': ('pointer', 'ComputerPointer'),
    'computer.keys': ('keys', 'ComputerKeys'),
}
PROJECT_TOOLS = frozenset('projects.' + x for x in ('list', 'status', 'search', 'read_file', 'read_chat', 'read_plans'))


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('duplicate JSON member: ' + key)
        result[key] = value
    return result


def decimal_integer(value):
    """Canonical arbitrary-size integer text without Python's digit limit."""
    negative = value < 0
    value = abs(value)
    chunks = []
    while value:
        value, remainder = divmod(value, 1_000_000_000)
        chunks.append(remainder)
    if not chunks:
        return '0'
    return ('-' if negative else '') + str(chunks[-1]) + ''.join(f'{n:09d}' for n in reversed(chunks[:-1]))


def parse_integer(text):
    negative = text.startswith('-')
    digits = text[1:] if negative else text
    value = 0
    for start in range(0, len(digits), 9):
        chunk = digits[start:start + 9]
        value = value * (10 ** len(chunk)) + int(chunk)
    return -value if negative else value


def load(path):
    return json.loads(Path(path).read_text(encoding='utf-8'), object_pairs_hook=unique_object, parse_int=parse_integer,
                      parse_constant=lambda value: (_ for _ in ()).throw(ValueError(value)))


def typed_tree(value):
    if value is None:
        return ['null']
    if type(value) is bool:
        return ['bool', value]
    if type(value) is int:
        return ['int', decimal_integer(value)]
    if type(value) is float:
        if not math.isfinite(value):
            raise ValueError('non-finite semantic number')
        return ['float64', struct.pack('>d', value).hex()]
    if isinstance(value, str):
        value.encode('utf-8', errors='strict')
        return ['string', value]
    if isinstance(value, list):
        return ['array', [typed_tree(v) for v in value]]
    if isinstance(value, dict) and all(isinstance(k, str) for k in value):
        return ['object', [[k, typed_tree(value[k])] for k in sorted(value, key=lambda k: k.encode('utf-8'))]]
    raise ValueError('unsupported semantic value')


def semantic_hash(kind, value):
    if kind not in SEMANTIC_KINDS:
        raise ValueError('unknown application semantic kind')
    tree = json.dumps(typed_tree(value), ensure_ascii=False, separators=(',', ':'))
    return hashlib.sha256(('pm.application.semantic_hash.v1\0' + kind + '\0' + tree).encode()).hexdigest()


def pointer(document, fragment):
    if not fragment:
        return document
    if not fragment.startswith('/'):
        raise ValueError('only literal JSON pointers are supported: ' + fragment)
    for part in fragment.split('/')[1:]:
        part = part.replace('~1', '/').replace('~0', '~')
        document = document[int(part)] if isinstance(document, list) else document[part]
    return document


def reject_remote(uri):
    raise ValueError('unregistered offline schema URI: ' + uri)


class Corpus:
    def __init__(self, root=ROOT):
        self.root = Path(root).resolve()
        self.documents = {}
        self.owner_texts = {}
        self.uri_paths = {}
        self.registry = Registry(retrieve=reject_remote)
        # Only current top-level resources. Historical nested banks stay in
        # their own manifests and cannot win by sharing a logical schema ID.
        paths = sorted((self.root / 'Plans').glob('*.schema.json'))
        graph_path = self.root / 'Plans/application_workflow_source_graph.json'
        if graph_path.exists():
            paths += [self.path(r['path']) for r in load(graph_path)['resources']]
        for path in dict.fromkeys(paths):
            document = self.document(path.relative_to(self.root).as_posix())
            if not isinstance(document, dict) or '$schema' not in document:
                continue
            resource = Resource.from_contents(document)
            uris = ['https://puppetmaster.local/' + path.relative_to(self.root).as_posix()]
            if document.get('$id'):
                uris.append(document['$id'])
            for uri in uris:
                if uri in self.uri_paths and self.uri_paths[uri] != path:
                    raise ValueError('duplicate offline resource URI: ' + uri)
                self.uri_paths[uri] = path
                self.registry = self.registry.with_resource(uri, resource)

    def path(self, relative):
        path = self.root / relative
        if (not relative.startswith(('Plans/', 'tests/fixtures/'))
                or '..' in Path(relative).parts or not path.resolve().is_relative_to(self.root)):
            raise ValueError('noncanonical repository path: ' + relative)
        return path

    def document(self, relative):
        if relative not in self.documents:
            self.documents[relative] = load(self.path(relative))
        return self.documents[relative]

    def resolve(self, ref):
        relative, fragment = urldefrag(ref)
        if relative in self.uri_paths:
            relative = self.uri_paths[relative].relative_to(self.root).as_posix()
        return pointer(self.document(relative), fragment)

    def owner_exists(self, ref):
        relative, unit = urldefrag(ref)
        if relative not in self.owner_texts:
            self.owner_texts[relative] = self.path(relative).read_text(encoding='utf-8')
        return bool(re.fullmatch(r'[A-Z][A-Z0-9]*-\d+', unit)
                    and re.search(r'^plan_unit_id:\s*' + re.escape(unit) + r'\s*$', self.owner_texts[relative], re.M))

    def validator(self, ref):
        relative, fragment = urldefrag(ref)
        schema = self.document(relative)
        pointer(schema, fragment)
        uri = schema.get('$id', 'https://puppetmaster.local/' + relative)
        return Draft202012Validator({'$ref': uri + ('#' + fragment if fragment else '')}, registry=self.registry)


def scope_failures(record):
    failures = []
    contexts = []

    def visit(value):
        if isinstance(value, dict):
            s = value.get('scope')
            if isinstance(s, dict) and s.get('schema_id') == 'pm.workflow_scope.v2':
                contexts.append(s)
                if s.get('scope_kind') == 'application':
                    if s.get('scope_partition') != 'app' or any(s.get(k) is not None for k in ('project_id', 'project_home_server_id', 'named_plan_id')):
                        failures.append('application_scope_identity')
                    if 'project_id' in value and value['project_id'] is not None:
                        failures.append('outer_project_mismatch')
                else:
                    project = s.get('project_id')
                    expected = 'project~' + base64.urlsafe_b64encode(project.encode()).decode().rstrip('=') if isinstance(project, str) else None
                    if not project or s.get('scope_partition') != expected:
                        failures.append('project_partition_mismatch')
            if isinstance(s, dict) and 'server_id' in value and value['server_id'] != s.get('server_id'):
                failures.append('server_scope_mismatch')
            app = value.get('application_context')
            if isinstance(app, dict):
                if 'project_id' in value and value['project_id'] is not None:
                    failures.append('application_outer_project')
                if 'thread_id' in value and value['thread_id'] != app.get('thread_id'):
                    failures.append('application_thread_mismatch')
            # A physical wrapper and its logical record share exact custody.
            # Context-only records carry their logical scope inside application_context.
            inner = value.get('record')
            if isinstance(inner, dict):
                inner_context = inner.get('application_context', {})
                inner_scope = inner.get('scope', inner_context.get('scope'))
                if isinstance(s, dict) and isinstance(inner_scope, dict) and s != inner_scope:
                    failures.append('wrapper_record_scope_mismatch')
                for field in ('server_id', 'storage_instance_id'):
                    inner_value = inner.get(field, inner_context.get(field))
                    if field in value and inner_value is not None and value[field] != inner_value:
                        failures.append('wrapper_record_' + field + '_mismatch')
            for child in value.values():
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)
    visit(record)
    return failures


def coverage_failures(record):
    requested = record['requested']
    seen = [r['source_ref'] for key in ('looked_in', 'not_looked_in', 'partial') for r in record[key]]
    return [] if len(requested) == len(set(requested)) and collections.Counter(seen) == collections.Counter(requested) else ['coverage_partition']


def remote_sync_failures(record, owner):
    """Join the request to separately captured owner inputs, never request flags."""
    if not owner:
        return ['original_owner_source_unavailable']
    fields = (
        'project_id', 'backend', 'original_repository_ref', 'original_remote_ref',
        'original_binding_ref', 'original_fetched_revision', 'original_fetch_receipt_ref',
        'original_fetch_receipt_sha256', 'fork_repository_ref', 'fork_binding_ref',
        'fork_workspace_ref', 'fork_native_workspace_ref', 'expected_native_revision',
        'head_repository_ref', 'head_revision', 'base_repository_ref', 'base_revision',
        'contribution_binding_ref', 'review_binding_ref', 'reconciliation_strategy',
        'strategy_policy_id', 'strategy_policy_revision', 'strategy_policy_sha256',
        'source_generation', 'source_currentness_ref', 'source_currentness_sha256',
        'destination_generation', 'destination_currentness_ref', 'destination_currentness_sha256',
        'writer_lease_generation', 'scope_stop_epoch', 'task_stop_epoch',
        'preview_ref', 'preview_sha256', 'preview_expires_at', 'return_context_ref',
    )
    errors = [field for field in fields if field not in owner or record.get(field) != owner[field]]
    if record.get('push_targets') != [] or record.get('publish_performed') is not False:
        errors.append('local_reconciliation_publication')
    return errors


def computer_failures(request, source):
    """Check one captured session/namespace/currentness fixture before any effect."""
    if not source:
        return ['native_session_source_unavailable']
    errors = []
    for key in ('tool_id', 'session_id', 'thread_id', 'server_id', 'execution_host_id',
                'execution_environment_id', 'desktop_session_ref', 'controller_generation', 'controller_lease_ref',
                'namespace_generation', 'namespace_receipt_ref', 'app_id', 'window_ref', 'window_generation',
                'permission_generation', 'permission_evidence_ref', 'disclosure_generation', 'disclosure_ref',
                'stop_epoch', 'return_context_ref', 'task_authority',
                'observation_ref', 'observation_generation', 'observation_sha256', 'geometry_ref',
                'geometry_generation', 'scale_generation', 'foreground_window_ref',
                'request_schema_sha256', 'result_schema_sha256'):
        if key not in source or request.get(key) != source[key]:
            errors.append(key)
    if request.get('scope') != source.get('scope'):
        errors.append('scope')
    if request.get('scope', {}).get('server_id') != request.get('server_id'):
        errors.append('scope_server_join')
    if request.get('app_id') not in source.get('allowed_app_ids', []):
        errors.append('app_not_allowed')
    if source.get('protected_surface') or source.get('stopped'):
        errors.append('protected_or_stopped')
    tool = request.get('tool_id')
    operation = request.get('operation')
    if operation not in source.get('native_operations', {}).get(tool, []):
        errors.append('native_operation_unavailable')
    if source.get('namespace_tools', {}).get(tool) != request.get('native_mapping_ref'):
        errors.append('namespace_mapping')
    points = [request.get('operation_data', {})]
    if operation == 'drag':
        points = [points[0]['from'], points[0]['to']]
    for point in points:
        if 'x' in point and not (0 <= point['x'] < source['width_px'] and 0 <= point['y'] < source['height_px']):
            errors.append('observation_coordinates')
    data = request.get('operation_data', {})
    if operation == 'click' and data.get('count', 0) > source['native_max_clicks']:
        errors.append('native_click_limit')
    if operation == 'type' and len(data['text'].encode()) > source['native_max_text_bytes']:
        errors.append('native_text_limit')
    return errors


def ssh_source_failures(request, source):
    """Compare modeled original owner sources, never caller confirmation flags."""
    if not source:
        return ['ssh_original_source_unavailable']
    errors = []
    target, observation = source['target'], source['host_key']
    preview, decision = source['preview'], source['decision']
    if request['scope']['scope_kind'] != 'application' or request['scope']['server_id'] != target['server_id']:
        errors.append('executing_server_scope')
    if request['target_ref'] != target['target_ref'] or observation['target_ref'] != target['target_ref']:
        errors.append('target_identity')
    for k in ('target_generation', 'topology_generation', 'auth_session_generation', 'permission_generation', 'stop_epoch'):
        if request['expected'][k] != target[k]:
            errors.append(k)
    if (observation['remote_host'], observation['remote_port'], observation['target_generation']) != (target['remote_host'], target['remote_port'], target['target_generation']):
        errors.append('host_observation_target')
    now = datetime.fromisoformat(source['now_utc'].replace('Z', '+00:00'))
    for item in (observation, preview, decision):
        if datetime.fromisoformat(item['expires_at_utc'].replace('Z', '+00:00')) <= now:
            errors.append('expired_source')
    if request['permission_snapshot_ref'] != source['permission_snapshot_ref']:
        errors.append('permission_snapshot')
    if request['expected']['trust_revision'] != observation['trust_revision']:
        errors.append('trust_revision')
    if request['phase'] == 'apply':
        if request['preview_ref'] != preview['preview_ref'] or request['human_decision_ref'] != decision['human_decision_ref']:
            errors.append('protected_original_sources')
        if any(request[k] != preview[k] for k in ('operation_id', 'target_ref', 'command_id', 'expected', 'return_context')):
            errors.append('preview_commitment')
        if (decision['operation_id'] != request['operation_id'] or decision['preview_ref'] != request['preview_ref']
                or decision['client_id'] != request['return_context']['client_id']
                or decision['actor'] != request['actor'] or decision['decision'] != 'approve'
                or decision['intent_sha256'] != preview['intent_sha256']
                or decision['session_generation'] != source['current_session_generation']):
            errors.append('protected_human_decision')
    if request['command_id'] == 'cmd.server.ssh.trust':
        if request['host_key_observation_ref'] != observation['observation_ref']:
            errors.append('host_key_observation')
        if request['expected_trust_revision'] != observation['trust_revision']:
            errors.append('trust_cas')
        if request['trust_action'] == 'add' and (observation['trust_revision'] is not None or request['trust_absence_ref'] != observation['absence_proof_ref']):
            errors.append('add_cannot_replace_trust')
        if request['trust_action'] == 'replace' and not observation['prior_trust_ref']:
            errors.append('replacement_prior_source')
    else:
        public, file, policy = source['public_key'], source['authorized_keys'], source['key_policy']
        if (request['public_key_ref'] != public['public_key_ref'] or request['expected']['public_key_revision'] != public['revision']
                or public['key_policy_ref'] != policy['policy_ref']
                or public['algorithm'] not in policy['allowed_algorithms']
                or public['strength_bits'] < policy['minimum_bits'].get(public['algorithm'], float('inf'))):
            errors.append('public_key_policy_before_reuse')
        if (request['authorized_keys_observation_ref'] != file['observation_ref']
                or request['expected']['authorized_keys_revision'] != file['file_revision']
                or file['target_ref'] != target['target_ref'] or file['remote_account_ref'] != target['remote_account_ref']
                or file['host_trust_ref'] != observation['prior_trust_ref']):
            errors.append('remote_account_file_join')
        if (file['file_kind'] not in ('regular', 'absent') or file['permissions_mode'] & 0o022
                or not file['atomic_compare_write_capability_ref']):
            errors.append('unsafe_remote_target')
    return errors


def redacted_ssh_intent(request):
    """The ephemeral broker reference never crosses into durable intent/hash."""
    return {k: v for k, v in request.items() if k != 'protected_input_ref'}


def binding_failures(document, corpus, *, whole=True):
    errors = []
    groups = (('commands', 'command_id'), ('tools', 'tool_id'), ('local_actions', 'action_id'), ('non_dispatch_controls', 'control_id')) if whole else ()
    for group, identity in groups:
        rows = document[group]
        ids = [r[identity] for r in rows]
        if len(ids) != len(set(ids)):
            errors.append(group + ': duplicate identity')
        for row in rows:
            errors += binding_row_failures(row, corpus)
    if whole:
        tools = {r['tool_id'] for r in document['tools']}
        if tools != PROJECT_TOOLS | COMPUTER_TOOLS.keys():
            errors.append('finite tool census')
        if len(document['commands']) != 494 or sum(bool(r['new_primary']) for r in document['commands']) != 28:
            errors.append('finite primary command census')
        if len(document['local_actions']) != 62 or len(document['non_dispatch_controls']) != 1:
            errors.append('finite local/non-dispatch census')
    return errors


def binding_row_failures(row, corpus):
    errors = []
    for field in ('request_schema_ref', 'result_schema_ref', 'error_schema_ref'):
        if field in row:
            try:
                corpus.resolve(row[field])
            except (KeyError, ValueError, OSError, IndexError) as exc:
                errors.append(field + ': ' + str(exc))
    ids = row.get('request_ids', [])
    if len(ids) != len(set(ids)):
        errors.append('duplicate request_ids')
    identity = row.get('command_id', row.get('tool_id', row.get('action_id', '')))
    if not corpus.owner_exists(row['owner_ref']):
        errors.append('binding owner unit missing')
    if 'command_id' in row:
        production = corpus.document('Plans/Wiring_Matrix.production.json')['entries']
        if not hasattr(corpus, 'production_by_command'):
            corpus.production_by_command = collections.defaultdict(list)
            for entry in production.values():
                corpus.production_by_command[entry['ui_command_id']].append(entry)
        matches = corpus.production_by_command[identity]
        if not matches or {m['handler_location'] for m in matches} != {row['handler']}:
            errors.append('binding sole production handler mismatch: ' + identity)
        if any(m.get(field) != row[field] for m in matches for field in ('request_schema_ref', 'result_schema_ref')):
            errors.append('binding production schema mismatch: ' + identity)
    if identity in COMPUTER_TOOLS:
        suffix, definition = COMPUTER_TOOLS[identity]
        if row.get('handler') != 'tools::computer::' + suffix:
            errors.append('computer handler mismatch')
        for field, kind in (('request_schema_ref', 'Request'), ('result_schema_ref', 'Result')):
            if row.get(field) != 'Plans/computer_use_contracts.schema.json#/$defs/' + definition + kind + 'V1':
                errors.append('computer schema mismatch')
    elif identity in PROJECT_TOOLS and row.get('handler') != 'tools::projects::' + identity.split('.')[1]:
        errors.append('project tool handler mismatch')
    return errors


def graph_failures(corpus):
    graph = corpus.document('Plans/application_workflow_source_graph.json')
    errors = []
    unhashed = {k: v for k, v in graph.items() if k != 'graph_sha256'}
    if semantic_hash('source_graph', unhashed) != graph['graph_sha256']:
        errors.append('source graph digest')
    if len(graph['methods']) != 15 or len(graph['resources']) != 10:
        errors.append('source graph method/resource census')
    for group, key in (('resources', 'retrieval_uri'), ('methods', 'interface_id'), ('graphs', 'graph_id')):
        ids = [r[key] for r in graph[group]]
        if ids != sorted(set(ids), key=lambda s: s.encode()):
            errors.append('source graph ordering/uniqueness: ' + group)
    for resource in graph['resources']:
        path = corpus.path(resource['path'])
        if hashlib.sha256(path.read_bytes()).hexdigest() != resource['whole_resource_sha256']:
            errors.append('source graph resource hash: ' + resource['path'])
        if corpus.uri_paths.get(resource['retrieval_uri']) != path:
            errors.append('source graph URI/path: ' + resource['retrieval_uri'])
        for fragment in resource['literal_root_pointers']:
            corpus.resolve(resource['path'] + fragment)
    methods = {m['interface_id']: m for m in graph['methods']}
    for method in methods.values():
        for field in ('source_root_ref', 'input_root_ref', 'output_root_ref'):
            corpus.resolve(method[field])
    # Validate every transitive reference from the selected roots using only
    # this manifest's exact resource URIs. The larger offline codec corpus is
    # not permission to import an undeclared Project/predecessor graph.
    resources = {r['retrieval_uri']: r for r in graph['resources']}
    visited = set()
    active = set()

    def visit(uri, fragment):
        key = (uri, fragment)
        if key in active:
            errors.append('undeclared recursive selected schema: ' + uri + '#' + fragment)
            return
        if key in visited:
            return
        if uri not in resources:
            errors.append('undeclared selected resource URI: ' + uri)
            return
        active.add(key)
        try:
            node = pointer(corpus.document(resources[uri]['path']), fragment)
        except (KeyError, IndexError, ValueError) as exc:
            errors.append('selected graph pointer: ' + uri + '#' + fragment + ': ' + str(exc))
            active.remove(key)
            return

        def walk(value, base_uri):
            if isinstance(value, dict):
                if '$id' in value:
                    base_uri = urljoin(base_uri, value['$id'])
                if '$ref' in value:
                    target, part = urldefrag(urljoin(base_uri, value['$ref']))
                    visit(target, part)
                for child in value.values():
                    walk(child, base_uri)
            elif isinstance(value, list):
                for child in value:
                    walk(child, base_uri)
        walk(node, uri)
        active.remove(key)
        visited.add(key)

    for resource in graph['resources']:
        for root in resource['literal_root_pointers']:
            visit(resource['retrieval_uri'], root.removeprefix('#'))
    for entry in graph['graphs']:
        if entry['adoption_disposition'] != 'specified_unimplemented':
            errors.append('unproved source adoption: ' + entry['graph_id'])
        if any(i not in methods for i in entry['participating_method_ids']):
            errors.append('unknown graph method: ' + entry['graph_id'])
        edges = entry['ordered_role_edges']
        for previous, current in zip(edges, edges[1:]):
            if previous['to_role'] != current['from_role']:
                errors.append('disconnected role edge: ' + entry['graph_id'])
        roles = [e['from_role'] for e in edges] + ([edges[-1]['to_role']] if edges else [])
        if len(roles) != len(set(roles)):
            errors.append('cyclic role graph: ' + entry['graph_id'])
        for edge in edges:
            m = methods.get(edge['interface_id'], {})
            if any(edge[f] != m.get(f) for f in ('input_root_ref', 'output_root_ref')):
                errors.append('role edge method root mismatch: ' + entry['graph_id'])
    return errors


def validate_shapes(corpus, fixture_paths=FIXTURES):
    errors = []
    counts = collections.Counter()
    for path in SCHEMAS:
        Draft202012Validator.check_schema(corpus.document(path))
        counts['schema_meta'] += 1
    for schema, path in REGISTRIES:
        for e in corpus.validator(schema).iter_errors(corpus.document(path)):
            errors.append(path + ':' + e.json_path + ': ' + e.message)
        counts['registries'] += 1
    for path in fixture_paths:
        pack = corpus.document(path)
        ids = set()
        for case in pack.get('projects_refresh_cases', pack.get('cases', [])):
            ident = case['case_id']
            if ident in ids:
                errors.append(path + ': duplicate case ' + ident)
            ids.add(ident)
            if case.get('native_runtime_executed', pack.get('native_runtime_executed')) is not False:
                errors.append(path + ': false native claim ' + ident)
            if 'schema_ref' not in case:
                counts['non_schema_golden_cases'] += 1
                continue
            valid = corpus.validator(case['schema_ref']).is_valid(case['record'])
            if valid != case['expected_schema_valid']:
                errors.append(path + ':' + ident + ': unexpected structural ' + str(valid))
            counts['cases'] += 1
            counts['positive' if case['expected_schema_valid'] else 'negative'] += 1
    return errors, counts


def publication_outcome(record):
    """Model final dispatch fences; these fixture facts confer no authority."""
    if (record['captured_stop_epoch'] != record['current_stop_epoch']
            or record['plan_sha256'] != record['current_plan_sha256']
            or record['grant_revoked'] or not record['parent_ceiling_allows']
            or record['target_uid'] != record['current_target_uid']):
        return 'refuse'
    operation = record['operation']
    authority = record['authority']
    if authority['authority_kind'] == 'build_grant' and (not record['listed_operation'] or record['project_id'] is None):
        return 'refuse'
    if operation in ('paid_signup', 'export_secret'):
        return 'retained_ask'
    if operation == 'force_push':
        if (record['branch_kind'] in ('main', 'default', 'protected')
                or not record['lease_held'] or record['expected_remote_head'] != record['actual_remote_head']):
            return 'refuse'
        if authority['authority_kind'] == 'mode' and authority.get('mode') != 'yolo':
            return 'retained_ask'
        return 'allow' if record['branch_kind'] == 'pm_for_this_work' else 'retained_ask'
    if authority['authority_kind'] == 'build_grant':
        if not record['listed_operation']:
            return 'refuse'
        if operation == 'delete_resource' and record['created_resource_uid'] is None:
            return 'retained_ask'
        if operation == 'delete_resource' and record['created_resource_uid'] != record['target_uid']:
            return 'refuse'
        return 'allow'
    if authority['authority_kind'] == 'mode' and authority.get('mode') == 'yolo' and operation in ('push', 'publish'):
        return 'allow'
    return 'retained_ask'


def conversion_outcome(predicate, record):
    if predicate == 'conversion.cutover':
        required = ('new_project_listed', 'files_verified', 'active_goal_fenced',
                    'active_crew_fenced', 'active_plan_fenced', 'source_timers_fenced')
        ok = (all(record[k] for k in required) and not record['source_writer_live']
              and record['destination_writer_live'] and record['cutover_generation'] == record['observed_generation'])
        return 'accept' if ok else 'refuse'
    if predicate == 'conversion.undo':
        start = datetime.fromisoformat(record['move_committed_at_utc'].replace('Z', '+00:00'))
        now = datetime.fromisoformat(record['now_utc'].replace('Z', '+00:00'))
        ok = (record['first_new_work_at_utc'] is None and record['unchanged_destination_files']
              and 0 <= (now - start).total_seconds() < min(record['undo_max_seconds'], 604800))
        return 'accept' if ok else 'refuse'
    if predicate == 'conversion.undo_remote':
        return 'keep' if record['remote_repository_created'] else 'not_applicable'
    if predicate == 'conversion.independent_custody':
        return 'keep' if record['independent_goal_hold'] else 'owner_policy_required'
    if predicate == 'conversion.restore_lineage':
        return 'historical_only' if record['stale_app_backup_restore'] else 'current_lineage_required'
    raise ValueError('unknown conversion predicate: ' + predicate)


def pause_transition(before, desired, *, server_id, actor_ref, actor_kind, changed_at):
    """Static desired-value transition model; absent source is never off.

    Authentication, owner birth, internal CAS and durability remain native
    prerequisites. This function cannot create a record or clear a task latch.
    """
    if before is None:
        raise ValueError('app_automation_pause_unavailable')
    if actor_kind != 'user' or before['server_id'] != server_id or type(desired) is not bool:
        raise ValueError('invalid_pause_authority_or_target')
    after = dict(before)
    if before['paused'] != desired:
        after.update(paused=desired, revision=before['revision'] + 1,
                     user_stop_epoch=before['user_stop_epoch'] + int(desired),
                     changed_by_actor_ref=actor_ref, changed_by_actor_kind='user', changed_at=changed_at)
    return after


def semantic_outcome(predicate, record, corpus, pack, case):
    """Evaluate static cases. The returned outcome never admits native sources."""
    if predicate.startswith('settings.') or predicate.startswith('models.'):
        from pm_settings_layering import settings_predicate
        rows = {r['id']: r for r in corpus.document('Plans/settings_inventory.json')['settings']}
        rule = next(r for r in case['semantic_checks'] if r['predicate_id'] == predicate)
        return settings_predicate(predicate, record, rows, rule['expected'])
    if predicate.startswith(('project.', 'scm.', 'backup.')):
        from pm_project_forge_contract import setup_scenario_outcome
        return setup_scenario_outcome(predicate, record)
    if predicate == 'forge.admitted_profile_setup':
        admitted = {'github_dotcom', 'github_enterprise', 'gitlab_dotcom', 'gitlab_self_managed',
                    'azure_devops_services', 'azure_devops_server', 'bitbucket_cloud',
                    'bitbucket_data_center', 'forgejo_self_managed', 'gitea_self_managed'}
        return 'accept_with_provider_specific_fields' if record['admitted_profile'] in admitted else 'refuse'
    if predicate == 'assistant_plan.backend_strategy':
        expected = 'ledger_bound' if record['strategy'] in {'deep_thorough', 'deep_exhaustive', 'deep_brainstorm'} else 'direct'
        return 'accept' if record['backend'] == expected else 'refuse'
    if predicate.startswith('coverage.'):
        return 'refuse' if coverage_failures(record) else 'accept'
    if predicate == 'thread.receiver_ceiling':
        if record['receiver_policy'] == 'off' or record['automatic_round_trips'] > 3:
            return 'refuse'
        if record['receiver_policy'] == 'ask_me' and record['human_reviewed_message_evidence'] is None:
            return 'read_answer_only'
        return 'receiver_scoped_turn'
    if predicate.startswith('conversion.'):
        return conversion_outcome(predicate, record)
    if predicate == 'accounts.destination_local_readiness':
        if record['source_credentials_transferred'] or not record['selected_for_copy']:
            return 'refuse'
        if record['outcome'] == 'ready_here' and not record['destination_local_credential_ref'] and not record['destination_local_profile_ref']:
            return 'refuse'
        return record['outcome']
    if predicate == 'automation.final_dispatch':
        return publication_outcome(record)
    if predicate == 'scope.app_only_schema':
        schema = corpus.resolve(record['schema_ref'])
        scope = schema['properties']['scope']
        return 'accept' if any(part.get('properties', {}).get('scope_kind', {}).get('const') == 'application'
                               for part in scope.get('allOf', [])) else 'refuse'
    if predicate == 'scope.exact_owner_graph':
        return 'refuse_scope_join' if scope_failures(record) else 'native_unavailable_until_source_adoption'
    if predicate == 'bindings.unique_identity_owner_handler_pointer_scope_and_return':
        return 'refuse' if binding_row_failures(record, corpus) else 'required'
    if predicate == 'bindings.exact_finite_identity_census':
        errors = binding_failures(record, corpus)
        if any('duplicate request_ids' in e for e in errors):
            return 'refused: duplicate request_ids; Fd-Fb03'
        return 'refuse' if errors else 'accept'
    if predicate == 'plan.original_current_slot_source_scope_join':
        # This record supplies no original current-slot source. Only its
        # structural contract is checked; source authentication stays required.
        return 'required' if not scope_failures(record) else 'refuse'
    if predicate == 'source_control.original_fork_strategy_lease_preview_return_join':
        owner = pack.get('remote_sync_owner_sources', {}).get(case.get('owner_source_id'))
        return 'refused_before_effect' if remote_sync_failures(record, owner) else 'accepted_if_actual_owner_validates'
    if predicate == 'computer.session_source_join':
        owner = pack.get('owner_session_sources', {}).get(case.get('owner_source_id'))
        return 'refuse' if computer_failures(record, owner) else 'accept'
    if predicate == 'ssh.protected_original_source_join':
        owner = pack.get('ssh_owner_sources', {}).get(case.get('owner_source_id'))
        return 'refuse' if ssh_source_failures(record, owner) else 'accept'
    raise ValueError('unimplemented semantic predicate: ' + predicate)


def check(root=ROOT, *, schemas_only=False):
    corpus = Corpus(root)
    errors, counts = validate_shapes(corpus)
    unavailable = []
    for path in FIXTURES:
        pack = corpus.document(path)
        for case in pack.get('projects_refresh_cases', []):
            for rule in case['semantic_checks']:
                try:
                    got = semantic_outcome(rule['predicate_id'], case['record'], corpus, pack, case)
                    if type(got) is not type(rule['expected']) or got != rule['expected']:
                        errors.append(path + ':' + case['case_id'] + ': expected ' + repr(rule['expected']) + ', got ' + repr(got))
                    counts['static_semantic_expectations'] += 1
                    if rule['predicate_id'] in ('scope.exact_owner_graph', 'plan.original_current_slot_source_scope_join'):
                        unavailable.append(path + ':' + case['case_id'])
                except (ValueError, KeyError, TypeError) as exc:
                    errors.append(path + ':' + case['case_id'] + ': semantic check: ' + str(exc))
    errors += graph_failures(corpus)
    if not schemas_only:
        path = 'Plans/projects_refresh_command_bindings.json'
        data = corpus.document(path)
        errors += [path + ': ' + e.message for e in corpus.validator('Plans/projects_refresh_command_bindings.schema.json').iter_errors(data)]
        errors += binding_failures(data, corpus)
        fixtures = corpus.document('Plans/projects_refresh_command_bindings.fixtures.json')
        if hashlib.sha256(corpus.path(path).read_bytes()).hexdigest() != fixtures['source_companion_sha256']:
            errors.append('binding source fixture hash is stale')
    return {'check': 'projects-refresh-contracts', 'status': 'fail' if errors else 'pass',
            'claim_boundary': 'static_schema_and_semantic_model_only', 'counts': dict(counts),
            'failures': errors, 'native_source_joins_not_run': unavailable,
            'not_run': ['native source authentication', 'durable append and first receipt',
                        'CAS/restart/Stop races', 'backup restore', 'DAE', 'UI/render/motion',
                        'Event Authority', 'governance certification']}
