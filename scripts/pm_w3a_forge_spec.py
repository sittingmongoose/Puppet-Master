"""W3A Forge family spec for the phase-2 oracles (wave 3, stream E).

Every family row is read from the lane's own phase-1 contract record
(reports/event-authority-20261105/W3A-contracts.json) and its closed payload
schema. The three semantic emission predicates per family are the conjuncts
FGI-1200..1234 state and W3A-oracle-plan.json names (semantic.<name>); each is
modelled as one exact-type predicate over the native owner's authenticated
result facts. The positive facts satisfy every conjunct; each negative changes
one fact to the plan's named non-emitting case. These are synthetic oracle
facts, never native provider results (native execution NOT_RUN).
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACTS = ROOT / 'reports/event-authority-20261105/W3A-contracts.json'
COMMON_PAYLOAD = ('schema_id', 'schema_version', 'event_type', 'fact_ref', 'provider', 'subject_ref', 'source_record_ref')
CONST_FIELDS = ('schema_id', 'schema_version', 'event_type')
LEVELS = ('none', 'read', 'write', 'admin')

# semantic: slug -> [(name, kind, args, negative (fact, value))]
# kinds: is (fact == value, exact type), eq (fact a == fact b), ne (a != b),
#        changed (a != b, before/after), within (LEVELS index a <= b),
#        member (fact a in list fact b), imp (a == va implies b == vb)
SEMANTIC = {
    'forge_api_compatibility_changed': [
        ('assessment_change', 'changed', ('before_assessment', 'after_assessment'), ('after_assessment', 'assessment-1')),
        ('endpoint_version', 'is', ('version_scope', 'endpoint'), ('version_scope', 'host_wide')),
        ('mutation_safety', 'imp', ('assessment_state', 'unknown', 'mutation_enabled', False), ('mutation_enabled', True)),
    ],
    'forge_connection_capabilities_changed': [
        ('capability_change', 'changed', ('before_capabilities', 'after_capabilities'), ('after_capabilities', 'capabilities-1')),
        ('capability_ceiling', 'within', ('review_entry', 'binding_ceiling'), ('review_entry', 'admin')),
        ('independent_actions', 'is', ('actions_evidence', 'actions_probe'), ('actions_evidence', 'api_probe')),
    ],
    'forge_connection_reauthorized': [
        ('completed_auth', 'is', ('auth_state', 'completed'), ('auth_state', 'waiting')),
        ('successful_auth', 'is', ('auth_outcome', 'succeeded'), ('auth_outcome', 'failed')),
        ('account_binding', 'eq', ('grant_account_ref', 'binding_account_ref'), ('grant_account_ref', 'pmref:account.other')),
    ],
    'forge_connection_validated': [
        ('settled_probe', 'is', ('probe_state', 'settled'), ('probe_state', 'running')),
        ('test_identity', 'eq', ('test_ref', 'requested_test_ref'), ('test_ref', 'pmref:test.other')),
        ('truthful_outcome', 'eq', ('reported_outcome', 'native_outcome'), ('reported_outcome', 'succeeded')),
    ],
    'forge_mirror_connected': [
        ('connect_settled', 'is', ('connect_state', 'connected'), ('connect_state', 'attempted')),
        ('source_destination', 'ne', ('source_binding_ref', 'destination_binding_ref'), ('destination_binding_ref', 'pmref:binding.source')),
        ('authority_binding', 'is', ('authority_verified', True), ('authority_verified', False)),
    ],
    'forge_mirror_degraded': [
        ('enter_degraded', 'changed', ('before_health', 'after_health'), ('before_health', 'degraded')),
        ('degradation_evidence', 'is', ('evidence_health', 'failing'), ('evidence_health', 'healthy')),
        ('no_transfer', 'eq', ('after_authority_ref', 'before_authority_ref'), ('after_authority_ref', 'pmref:authority.other')),
    ],
    'forge_mirror_detached': [
        ('effective_detached', 'is', ('detach_result', 'detached'), ('detach_result', 'unknown')),
        ('prior_topology', 'eq', ('prior_topology_ref', 'committed_topology_ref'), ('prior_topology_ref', 'pmref:topology.other')),
        ('disclosed_detach', 'is', ('disclosure_recorded', True), ('disclosure_recorded', False)),
    ],
    'forge_mirror_status_changed': [
        ('status_change', 'changed', ('before_status', 'after_status'), ('after_status', 'status-1')),
        ('truthful_lag', 'eq', ('reported_lag_state', 'native_lag_state'), ('reported_lag_state', 'current')),
        ('prior_snapshot', 'eq', ('predecessor_topology_ref', 'committed_topology_ref'), ('predecessor_topology_ref', 'pmref:topology.other')),
    ],
    'forge_mirror_sync_completed': [
        ('terminal_sync', 'is', ('sync_state', 'terminal'), ('sync_state', 'running')),
        ('same_start', 'eq', ('start_fact_ref', 'sync_start_ref'), ('start_fact_ref', 'pmref:start.other')),
        ('truthful_failure', 'eq', ('reported_success', 'native_success'), ('reported_success', True)),
    ],
    'forge_mirror_sync_started': [
        ('actual_start', 'is', ('start_state', 'started'), ('start_state', 'queued')),
        ('authority', 'is', ('binding_authoritative', True), ('binding_authoritative', False)),
        ('revision_fence', 'eq', ('source_revision_ref', 'fenced_revision_ref'), ('source_revision_ref', 'pmref:revision.other')),
    ],
    'forge_pipeline_cancelled': [
        ('terminal_cancelled', 'is', ('attempt_state', 'cancelled'), ('attempt_state', 'running')),
        ('same_attempt', 'eq', ('attempt_ref', 'start_attempt_ref'), ('attempt_ref', 'pmref:attempt.other')),
        ('independent_automation', 'is', ('selector_kind', 'automation_binding'), ('selector_kind', 'repository_hosting')),
    ],
    'forge_pipeline_completed': [
        ('terminal_state', 'is', ('attempt_state', 'completed'), ('attempt_state', 'waiting')),
        ('cancel_separation', 'ne', ('native_conclusion', 'cancelled_label'), ('native_conclusion', 'cancelled')),
        ('checks_completeness', 'eq', ('reported_checks_complete', 'native_checks_complete'), ('reported_checks_complete', True)),
    ],
    'forge_pipeline_retried': [
        ('created_retry_attempt', 'is', ('retry_state', 'created'), ('retry_state', 'requested')),
        ('earlier_attempt', 'eq', ('previous_attempt_ref', 'native_previous_attempt_ref'), ('previous_attempt_ref', 'pmref:attempt.wrong')),
        ('execution_revalidation', 'is', ('validation_fresh', True), ('validation_fresh', False)),
    ],
    'forge_pipeline_started': [
        ('provider_started', 'is', ('attempt_state', 'started'), ('attempt_state', 'queued')),
        ('attempt_identity', 'eq', ('attempt_ref', 'native_attempt_ref'), ('attempt_ref', 'pmref:attempt.other')),
        ('actual_work_relationship', 'eq', ('work_link_ref', 'native_work_ref'), ('work_link_ref', 'pmref:work.unrelated')),
    ],
    'forge_repository_authority_changed': [
        ('role_transfer', 'changed', ('before_role_assignment', 'after_role_assignment'), ('after_role_assignment', 'roles-1')),
        ('repository_role', 'is', ('change_kind', 'repository_function_role'), ('change_kind', 'actor_permission')),
        ('automation_separate', 'is', ('automation_selected_by_role', False), ('automation_selected_by_role', True)),
    ],
    'forge_repository_created': [
        ('verified_create', 'is', ('create_result', 'verified'), ('create_result', 'effect_unknown')),
        ('new_repository', 'is', ('preexisting', False), ('preexisting', True)),
        ('reviewed_target', 'eq', ('target_container_ref', 'reviewed_container_ref'), ('target_container_ref', 'pmref:container.other')),
    ],
    'forge_repository_discovered': [
        ('verified_identity', 'is', ('identity_verified', True), ('identity_verified', False)),
        ('authorized_scope', 'is', ('result_accessible', True), ('result_accessible', False)),
        ('truthful_coverage', 'eq', ('asserted_absence_complete', 'native_coverage_complete'), ('asserted_absence_complete', True)),
    ],
    'forge_repository_eligibility_changed': [
        ('assessment_change', 'changed', ('before_eligibility', 'after_eligibility'), ('after_eligibility', 'eligibility-1')),
        ('operation_bound', 'eq', ('operation_ref', 'requested_operation_ref'), ('operation_ref', 'pmref:operation.other')),
        ('admitted_provider', 'is', ('variant_admitted', True), ('variant_admitted', False)),
    ],
    'forge_review_approved': [
        ('approval_vote', 'is', ('vote_kind', 'approval'), ('vote_kind', 'comment')),
        ('revision_binding', 'member', ('binding_kind', 'binding_kinds'), ('binding_kind', 'none')),
        ('reviewer_identity', 'eq', ('vote_reviewer_ref', 'reviewer_ref'), ('vote_reviewer_ref', 'pmref:reviewer.other')),
    ],
    'forge_review_changes_requested': [
        ('changes_vote', 'is', ('vote_kind', 'changes_requested'), ('vote_kind', 'comment')),
        ('revision_binding', 'member', ('binding_kind', 'binding_kinds'), ('binding_kind', 'none')),
        ('native_mapping', 'is', ('native_vote_mapped', True), ('native_vote_mapped', False)),
    ],
    'forge_review_closed': [
        ('close_without_merge', 'is', ('merged', False), ('merged', True)),
        ('actual_close', 'is', ('close_state', 'closed'), ('close_state', 'requested')),
        ('prior_open', 'is', ('prior_state', 'open'), ('prior_state', 'closed')),
    ],
    'forge_review_created': [
        ('actual_create', 'is', ('create_verified', True), ('create_verified', False)),
        ('draft_policy', 'imp', ('created_as', 'ready', 'policy_exception', True), ('created_as', 'ready')),
        ('head_base', 'eq', ('base_repository_ref', 'reviewed_base_repository_ref'), ('base_repository_ref', 'pmref:repository.other')),
    ],
    'forge_review_marked_ready': [
        ('separate_action', 'is', ('action_kind', 'mark_ready'), ('action_kind', 'generic_edit')),
        ('request_false', 'is', ('requested_draft', False), ('requested_draft', True)),
        ('actual_transition', 'is', ('before_ready_state', 'draft'), ('before_ready_state', 'ready')),
    ],
    'forge_review_merged': [
        ('provider_merge', 'is', ('merge_state', 'merged'), ('merge_state', 'queued')),
        ('strategy', 'member', ('selected_strategy', 'supported_strategies'), ('selected_strategy', 'octopus')),
        ('exact_revision', 'eq', ('merge_triple_ref', 'expected_triple_ref'), ('merge_triple_ref', 'pmref:triple.other')),
    ],
    'forge_review_reopened': [
        ('prior_closed', 'is', ('prior_state', 'closed'), ('prior_state', 'open')),
        ('unmerged', 'is', ('prior_merged', False), ('prior_merged', True)),
        ('same_review', 'eq', ('review_ref', 'prior_review_ref'), ('review_ref', 'pmref:review.other')),
    ],
    'forge_review_thread_reopened': [
        ('prior_resolved', 'is', ('prior_thread_state', 'resolved'), ('prior_thread_state', 'unresolved')),
        ('same_thread', 'eq', ('thread_ref', 'prior_thread_ref'), ('thread_ref', 'pmref:thread.other')),
        ('anchor_window', 'eq', ('left_revision_ref', 'anchor_left_revision_ref'), ('left_revision_ref', 'pmref:revision.left.other')),
    ],
    'forge_review_thread_replied': [
        ('new_reply', 'is', ('reply_state', 'published'), ('reply_state', 'draft')),
        ('same_thread', 'eq', ('reply_thread_ref', 'thread_ref'), ('reply_thread_ref', 'pmref:thread.other')),
        ('native_reply_identity', 'is', ('reply_is_new_native', True), ('reply_is_new_native', False)),
    ],
    'forge_review_thread_resolved': [
        ('prior_unresolved', 'is', ('prior_thread_state', 'unresolved'), ('prior_thread_state', 'resolved')),
        ('resolution_actor', 'is', ('actor_permitted', True), ('actor_permitted', False)),
        ('complete_anchor', 'is', ('right_revision_present', True), ('right_revision_present', False)),
    ],
    'forge_review_updated': [
        ('typed_patch', 'is', ('patch_nonempty', True), ('patch_nonempty', False)),
        ('committed_change', 'is', ('result_changed', True), ('result_changed', False)),
        ('revision_expected', 'eq', ('expected_revision_ref', 'current_revision_ref'), ('expected_revision_ref', 'pmref:revision.other')),
    ],
    'forge_review_version_created': [
        ('changed_triple', 'changed', ('before_triple', 'after_triple'), ('after_triple', 'triple-1')),
        ('cause', 'eq', ('cause_label', 'derived_cause'), ('cause_label', 'stale_head_changed')),
        ('complete_axis', 'eq', ('reported_complete', 'contents_complete'), ('reported_complete', True)),
    ],
    'forge_webhook_delivery_failed': [
        ('verified_received', 'is', ('original_receive_verified', True), ('original_receive_verified', False)),
        ('actual_failure', 'is', ('processing_outcome', 'failed'), ('processing_outcome', 'succeeded')),
        ('truthful_failure', 'is', ('reported_exit_success', False), ('reported_exit_success', True)),
    ],
    'forge_webhook_delivery_recovered': [
        ('prior_failure', 'eq', ('failure_delivery_ref', 'delivery_ref'), ('failure_delivery_ref', 'pmref:delivery.other')),
        ('actual_recovery', 'is', ('recovery_state', 'processed'), ('recovery_state', 'queued')),
        ('original_effect', 'is', ('effect_redispatched', False), ('effect_redispatched', True)),
    ],
    'forge_webhook_received': [
        ('signature_before_parse', 'is', ('verification_order', 'verify_then_parse'), ('verification_order', 'parse_then_verify')),
        ('fresh_replay', 'is', ('within_window', True), ('within_window', False)),
        ('dedupe_new', 'is', ('delivery_new', True), ('delivery_new', False)),
    ],
    'forge_webhook_redelivery_queued': [
        ('actual_queue', 'is', ('queue_result', 'queued'), ('queue_result', 'unknown')),
        ('revalidated_signature', 'eq', ('signature_delivery_ref', 'original_delivery_ref'), ('signature_delivery_ref', 'pmref:delivery.other')),
        ('redelivery_identity', 'is', ('duplicate_queue_item', False), ('duplicate_queue_item', True)),
    ],
    'forge_webhook_rejected': [
        ('rejection_reason', 'is', ('ordinary_duplicate', False), ('ordinary_duplicate', True)),
        ('trusted_local_identity', 'is', ('identity_source', 'local_trusted'), ('identity_source', 'incoming_header')),
        ('no_parse', 'is', ('raw_parsed', False), ('raw_parsed', True)),
    ],
}

# Positive native facts for each semantic predicate's fact names (values chosen so
# every conjunct holds; 'changed' pairs differ, 'eq' pairs agree).
POSITIVE_FACTS = {
    'forge_api_compatibility_changed': dict(before_assessment='assessment-1', after_assessment='assessment-2', version_scope='endpoint', assessment_state='unknown', mutation_enabled=False),
    'forge_connection_capabilities_changed': dict(before_capabilities='capabilities-1', after_capabilities='capabilities-2', review_entry='read', binding_ceiling='write', actions_evidence='actions_probe'),
    'forge_connection_reauthorized': dict(auth_state='completed', auth_outcome='succeeded', grant_account_ref='pmref:account.alpha', binding_account_ref='pmref:account.alpha'),
    'forge_connection_validated': dict(probe_state='settled', test_ref='pmref:test.alpha', requested_test_ref='pmref:test.alpha', reported_outcome='failed', native_outcome='failed'),
    'forge_mirror_connected': dict(connect_state='connected', source_binding_ref='pmref:binding.source', destination_binding_ref='pmref:binding.destination', authority_verified=True),
    'forge_mirror_degraded': dict(before_health='healthy', after_health='degraded', evidence_health='failing', after_authority_ref='pmref:authority.alpha', before_authority_ref='pmref:authority.alpha'),
    'forge_mirror_detached': dict(detach_result='detached', prior_topology_ref='pmref:topology.alpha', committed_topology_ref='pmref:topology.alpha', disclosure_recorded=True),
    'forge_mirror_status_changed': dict(before_status='status-1', after_status='status-2', reported_lag_state='behind', native_lag_state='behind', predecessor_topology_ref='pmref:topology.alpha', committed_topology_ref='pmref:topology.alpha'),
    'forge_mirror_sync_completed': dict(sync_state='terminal', start_fact_ref='pmref:start.alpha', sync_start_ref='pmref:start.alpha', reported_success=False, native_success=False),
    'forge_mirror_sync_started': dict(start_state='started', binding_authoritative=True, source_revision_ref='pmref:revision.alpha', fenced_revision_ref='pmref:revision.alpha'),
    'forge_pipeline_cancelled': dict(attempt_state='cancelled', attempt_ref='pmref:attempt.alpha', start_attempt_ref='pmref:attempt.alpha', selector_kind='automation_binding'),
    'forge_pipeline_completed': dict(attempt_state='completed', native_conclusion='success', cancelled_label='cancelled', reported_checks_complete=False, native_checks_complete=False),
    'forge_pipeline_retried': dict(retry_state='created', previous_attempt_ref='pmref:attempt.alpha', native_previous_attempt_ref='pmref:attempt.alpha', validation_fresh=True),
    'forge_pipeline_started': dict(attempt_state='started', attempt_ref='pmref:attempt.alpha', native_attempt_ref='pmref:attempt.alpha', work_link_ref='pmref:work.alpha', native_work_ref='pmref:work.alpha'),
    'forge_repository_authority_changed': dict(before_role_assignment='roles-1', after_role_assignment='roles-2', change_kind='repository_function_role', automation_selected_by_role=False),
    'forge_repository_created': dict(create_result='verified', preexisting=False, target_container_ref='pmref:container.alpha', reviewed_container_ref='pmref:container.alpha'),
    'forge_repository_discovered': dict(identity_verified=True, result_accessible=True, asserted_absence_complete=False, native_coverage_complete=False),
    'forge_repository_eligibility_changed': dict(before_eligibility='eligibility-1', after_eligibility='eligibility-2', operation_ref='pmref:operation.alpha', requested_operation_ref='pmref:operation.alpha', variant_admitted=True),
    'forge_review_approved': dict(vote_kind='approval', binding_kind='provider-asserted', binding_kinds=['provider-asserted', 'observed_by_puppet_master'], vote_reviewer_ref='pmref:reviewer.alpha', reviewer_ref='pmref:reviewer.alpha'),
    'forge_review_changes_requested': dict(vote_kind='changes_requested', binding_kind='observed_by_puppet_master', binding_kinds=['provider-asserted', 'observed_by_puppet_master'], native_vote_mapped=True),
    'forge_review_closed': dict(merged=False, close_state='closed', prior_state='open'),
    'forge_review_created': dict(create_verified=True, created_as='draft', policy_exception=False, base_repository_ref='pmref:repository.alpha', reviewed_base_repository_ref='pmref:repository.alpha'),
    'forge_review_marked_ready': dict(action_kind='mark_ready', requested_draft=False, before_ready_state='draft'),
    'forge_review_merged': dict(merge_state='merged', selected_strategy='squash', supported_strategies=['merge', 'squash', 'rebase'], merge_triple_ref='pmref:triple.alpha', expected_triple_ref='pmref:triple.alpha'),
    'forge_review_reopened': dict(prior_state='closed', prior_merged=False, review_ref='pmref:review.alpha', prior_review_ref='pmref:review.alpha'),
    'forge_review_thread_reopened': dict(prior_thread_state='resolved', thread_ref='pmref:thread.alpha', prior_thread_ref='pmref:thread.alpha', left_revision_ref='pmref:revision.left', anchor_left_revision_ref='pmref:revision.left'),
    'forge_review_thread_replied': dict(reply_state='published', reply_thread_ref='pmref:thread.alpha', thread_ref='pmref:thread.alpha', reply_is_new_native=True),
    'forge_review_thread_resolved': dict(prior_thread_state='unresolved', actor_permitted=True, right_revision_present=True),
    'forge_review_updated': dict(patch_nonempty=True, result_changed=True, expected_revision_ref='pmref:revision.alpha', current_revision_ref='pmref:revision.alpha'),
    'forge_review_version_created': dict(before_triple='triple-1', after_triple='triple-2', cause_label='target_moved', derived_cause='target_moved', reported_complete=False, contents_complete=False),
    'forge_webhook_delivery_failed': dict(original_receive_verified=True, processing_outcome='failed', reported_exit_success=False),
    'forge_webhook_delivery_recovered': dict(failure_delivery_ref='pmref:delivery.alpha', delivery_ref='pmref:delivery.alpha', recovery_state='processed', effect_redispatched=False),
    'forge_webhook_received': dict(verification_order='verify_then_parse', within_window=True, delivery_new=True),
    'forge_webhook_redelivery_queued': dict(queue_result='queued', signature_delivery_ref='pmref:delivery.alpha', original_delivery_ref='pmref:delivery.alpha', duplicate_queue_item=False),
    'forge_webhook_rejected': dict(ordinary_duplicate=False, identity_source='local_trusted', raw_parsed=False),
}

VOTE_FAMILIES = {'forge_review_approved': 'approved', 'forge_review_changes_requested': 'changes_requested'}

# Retention cells bound to the decisions on main (W3-P2 step 5). Policy refs and
# the Project first-save anchor adapter are the landed Storage text at main
# a27594279e, Plans/storage-plan.md:17644-17690 (DL-453..DL-457); the two new
# application policy objects are Plans/storage_value_registry.json:686 and :702 there.
RETENTION_DL453 = (
    'forge.mirror.connected', 'forge.mirror.detached', 'forge.repository.authority_changed', 'forge.repository.created',
    'forge.review.changes_requested', 'forge.review.closed', 'forge.review.created', 'forge.review.marked_ready',
    'forge.review.merged', 'forge.review.reopened', 'forge.review.thread.reopened', 'forge.review.thread.replied',
    'forge.review.thread.resolved', 'forge.review.updated', 'forge.review.version_created')
RETENTION_DL454 = (
    'forge.api.compatibility_changed', 'forge.connection.capabilities_changed', 'forge.connection.validated',
    'forge.mirror.degraded', 'forge.mirror.status_changed', 'forge.mirror.sync_completed', 'forge.mirror.sync_started',
    'forge.repository.discovered', 'forge.repository.eligibility_changed', 'forge.webhook.delivery_failed',
    'forge.webhook.delivery_recovered', 'forge.webhook.received', 'forge.webhook.redelivery_queued', 'forge.webhook.rejected')
RETENTION_DL455 = {
    'forge.connection.reauthorized': 'change',
    'forge.pipeline.cancelled': 'finish',
    'forge.pipeline.completed': 'finish',
    'forge.pipeline.retried': 'retry',
    'forge.pipeline.started': 'start',
}


def retention_binding(event_type):
    if event_type == 'forge.review.approved':
        return dict(decision='Case L-3 Approval class (phase 1; E-CARDS-3 Appendix B settled)', project='RP-AUTHORITY-INDEFINITE@1.0.0',
                    application='RP-AUTHORITY-INDEFINITE@1.0.0', anchor='none (no age or count expiry)')
    if event_type in RETENTION_DL453:
        return dict(decision='DL-453 (E-CARDS-3 item 1.a)', project='RP-AUTHORITY-INDEFINITE@1.0.0',
                    application='RP-AUTHORITY-INDEFINITE@1.0.0', anchor='none (no age or count expiry, no new count allowance)')
    if event_type in RETENTION_DL454:
        return dict(decision='DL-454 (E-CARDS-3 item 2.a)', project='RP-TELEMETRY-90D@1.0.0',
                    application='RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0',
                    anchor='creation: first successful save that survives a restart (DL-415); 7,776,000 s; never restarted by retry, reprocessing or restore')
    if event_type in RETENTION_DL455:
        return dict(decision='DL-455 (E-CARDS-3 item 3.a)', project='RP-OPERATIONAL-2555D@1.0.0',
                    application='RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0',
                    anchor=f'{RETENTION_DL455[event_type]} entry under the Storage Project first-save anchor adapter (Project); creation (application); 220,752,000 s')
    return None


def _payload(slug):
    return json.loads((ROOT / f'Plans/event_payloads/forge/{slug}.schema.json').read_text())


def load_families():
    contracts = json.loads(CONTRACTS.read_text())['contracts']
    out = []
    for row in contracts:
        event_type = row['event_type']
        slug = event_type.replace('.', '_')
        schema = _payload(slug)
        domain = tuple(k for k in schema['required'] if k not in COMMON_PAYLOAD)
        b = row['bindings']
        out.append(dict(
            event_type=event_type, slug=slug, owner_unit=row['owner_unit'], envelope_unit=row['envelope_unit'],
            storage_unit=row['storage_unit'], producer=b['producer'], publisher=b['publisher'], consumer=b['consumer'],
            projector=b['projector'], source_family=b['source_family'], checkpoint_family=b['checkpoint_family'],
            payload_schema_path=f'Plans/event_payloads/forge/{slug}.schema.json',
            payload_schema_id=schema['properties']['schema_id']['const'], payload_fields=tuple(schema['required']),
            domain_refs=domain, semantic=SEMANTIC[slug], positive_facts=POSITIVE_FACTS[slug],
            vote=VOTE_FAMILIES.get(slug), retention=retention_binding(event_type),
        ))
    return out


FAMILIES = load_families()
SLUGS = tuple(f['slug'] for f in FAMILIES)
