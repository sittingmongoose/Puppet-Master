"""Additional original DO board-output and independently copied Server witnesses."""
import copy

import pm_orchestrator_event_oracles as o
from pm_orchestrator_c12 import ROOT, c, specimen


def projection(case):
    docs = o.selected_documents(ROOT)
    registry = o.offline_registry(docs)
    resolver = registry.resolver(base_uri=docs['application_workflow_contracts']['$id'])
    target = resolver.lookup('#/$defs/CoordinationProjectionApplicationV1')
    value = specimen(target.contents, target.resolver)
    value['application_context']['scope'] = copy.deepcopy(case['source']['scope'])
    value['application_context']['thread_id'] = case['payload']['thread_id']
    value['application_context']['storage_instance_id'] = case['payload']['storage_instance_id']
    return value


def resync(case, sync_message=True):
    """Repair dependent hashes/copies; the selected independent bad copy stays bad."""
    source = case['source']
    if sync_message:
        case['wrapper']['record'] = copy.deepcopy(source['original_input'])
    source['original_input_semantic_sha256'] = o.semantic_hash('accepted_source', source['original_input'])
    source['accepted_source_sha256'] = source['original_input_semantic_sha256']
    case['accepted_source_witness']['value'] = copy.deepcopy(source['original_input'])
    source['original_output_semantic_sha256'] = (None if source['original_output'] is None else
                                                 o.semantic_hash('accepted_source', source['original_output']))
    case['physical_record_sha256'] = o.hashlib.sha256(o.app_packed(case['wrapper'])).hexdigest()
    case['wrapper_key'] = o.board_application_view(case)['expected_wrapper_key']
    o.refresh_stage_witnesses(case)
    return case


def additional_board_inputs(fixtures):
    controls, negatives = [], []
    for i, original in enumerate(fixtures['board_storage_cases']):
        if original['payload']['scope'] != 'application':
            continue
        base = copy.deepcopy(original)
        base['source']['original_output'] = projection(base)
        resync(base)
        cid = 'C12:board:' + str(i) + ':original-output'
        controls.append((cid, base))

        def add(name, edit, code):
            bad = copy.deepcopy(base)
            edit(bad)
            resync(bad)
            negatives.append((cid + ':' + name, bad, [code], cid, None))

        add('source_scope_server', lambda x: x['source']['scope'].update(server_id='c12-foreign-server'),
            'server_scope_mismatch')
        add('source_server', lambda x: (x['source'].update(server_id='c12-foreign-server'),
                                       x['source']['scope'].update(server_id='c12-foreign-server')), 'source_server_id')
        add('wrapper_server', lambda x: (x['wrapper'].update(server_id='c12-foreign-server'),
                                        x['wrapper']['scope'].update(server_id='c12-foreign-server'),
                                        x['source']['original_input']['scope'].update(server_id='c12-foreign-server')),
            'source_server_id')
        add('wrapper_scope_server', lambda x: (x['wrapper']['scope'].update(server_id='c12-foreign-server'),
                                              x['source']['original_input']['scope'].update(server_id='c12-foreign-server')),
            'server_scope_mismatch')
        add('wrapper_scope_join', lambda x: x['source']['original_input']['scope'].update(server_id='c12-foreign-server'),
            'source_original_join')
        add('output_thread', lambda x: x['source']['original_output'].update(thread_id='c12-foreign-thread'),
            'application_thread_mismatch')

        # Non-null output commitment is an independent copy, not a flag.
        add('output_digest', lambda x: None, 'source_output_digest')
        negatives[-1][1]['source']['original_output_semantic_sha256'] = 'f' * 64
        o.refresh_stage_witnesses(negatives[-1][1])
    return controls, negatives
