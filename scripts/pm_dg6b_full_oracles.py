"""DG6B complete-path oracle inputs, shared by the checker and removal proof.

A defect is applied to a valid source model, then observational copies and
identities are derived once. Proof execution never repairs an input, skips a
stage, substitutes a validator result, or catches a refusal to continue.
"""
import copy
import hashlib
import json
from dataclasses import dataclass

from pm_event_index_binding import binding_bytes


def clone(value):
    return copy.deepcopy(value)


def rebuild(m, name, case):
    """Derive observations before execution; not an admission/validation call."""
    c = clone(case)
    p, s, e = c['payload'], c['source'], c['event_record']
    s['frozen_payload'] = clone(p)
    if name.startswith('persona.'):
        for key in ('command_id', 'scope', 'client_id', 'persona_id', 'source_id', 'source_revision',
                    'source_sha256', 'project_version_id', 'reach_ref', 'expected_owner_revision', 'return_context_ref'):
            s['request'][key] = clone(p[key])
        s['request']['destination_home_ref'] = p['home_ref']
        s['request']['whole_record_sha256'] = p['content_sha256']
        for pk, rk in [('command_id', 'command_id'), ('operation_id', 'operation_id'),
                       ('persona_id', 'persona_id'), ('revision', 'owner_revision'),
                       ('content_sha256', 'content_sha256'), ('result_status', 'status'),
                       ('owner_result_ref', 'owner_result_ref'), ('owner_readback_ref', 'readback_ref'),
                       ('return_context_ref', 'return_context_ref')]:
            s['result'][rk] = clone(p[pk])
        s['owner_request_ref'] = p['owner_request_ref']
        if name == 'persona.selected':
            for key in s['resolution']:
                if key in p:
                    s['resolution'][key] = clone(p[key])
            s['resolution_value'], s['resolved_resolution'] = m['store_resolution'](s['resolution'])
    s['storage_instance_id'] = p['storage_instance_id']
    scope = s['request']['scope'] if 'request' in s else s['scope']
    sk = (json.dumps([scope['server_id'], scope['scope_partition']], ensure_ascii=False, separators=(',', ':'))
          if name.startswith('persona.') else
          'application' if scope['scope_kind'] == 'application' else 'project:' + scope['project_id'])
    preimage = [name, p['storage_instance_id'], sk, p['operation_id'], p['revision']]
    digest = hashlib.sha256(json.dumps(preimage, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
    e['event_id'] = 'evt_' + name.replace('.', '_') + '_' + digest
    e['idempotency_key'] = ('application@1:' + scope['server_id'].encode().hex() + ':' + p['operation_id'].encode().hex()
                            if scope['scope_kind'] == 'application' else name + ':' + digest)
    e['event_type'] = name
    e['occurred_at_utc'] = p['ts']
    e['scope_kind'], e['project_id'] = scope['scope_kind'], scope['project_id']
    for key in ('actor_ref', 'requested_account_ref', 'effective_account_ref'):
        e[key] = s[key]
    for key in ('thread_id', 'run_id', 'node_id', 'attempt_id'):
        e[key] = p.get('runtime_lineage', {}).get(key)
    c['scope_partition'] = scope['scope_partition']
    # Recompute transport bytes, including the new semantic defect. All
    # supported test values use the actual production codec here.
    from blake3 import blake3
    body = binding_bytes(p)
    if len(body) <= 16384:
        e['payload'], e['payload_ref'], c['resolved_payload'] = clone(p), None, None
    else:
        digest = blake3(body).hexdigest()
        e['payload'], e['payload_ref'] = {}, 'ref:payload/' + digest
        c['resolved_payload'] = {'ref': e['payload_ref'], 'blake3_id': digest, 'byte_size': len(body),
            'media_type': 'application/msgpack', 'bytes_hex': body.hex(), 'durable': True, 'access_current': True}
    token = c['durable_read_token']
    token['storage_instance_id'] = token['source_selection']['storage_instance_id'] = p['storage_instance_id']
    token['checkpoint_key'] = 'event_record_index_checkpoint.v1:' + p['storage_instance_id']
    return c


@dataclass
class Probe:
    id: str
    guard: str
    positive: dict
    negative: dict
    defect: str
    mode: str = 'append'

    def call(self, m, schema, positive=False):
        value = self.positive if positive else self.negative
        name = self.id.split(':', 1)[0]
        # These are the same complete boundaries the family checker uses.
        # No stage_contract, payload-only validator or semantic-only helper.
        if self.mode == 'history':
            return m['history_contract'](name, value, schema)
        if self.mode == 'retry':
            return m['complete_append_contract'](name, value['candidate'], schema, original=value['original'])
        if self.mode == 'operation':
            m['complete_append_contract'](name, value['append'], schema)
            return m['operation_contract'](name, value['value'], value['resolved'], value['logical'], schema)
        return m['complete_append_contract'](name, value, schema)


def expected_error(probe):
    if probe.id.split(':', 1)[1].startswith(('source/', 'history_type/', 'storage_type/', 'resolved_type/')):
        if not probe.id.endswith('/opposite_boolean'):
            return 'adapter_schema'
    if probe.guard.startswith('payload_') and probe.guard not in ('payload_transport_join','payload_ref_integrity','payload_ref_unavailable'):
        return 'payload_schema'
    if probe.id.endswith(('partition/coherent_source','semantic/null_override_owner')):
        return 'payload_schema'
    if probe.id.endswith('operation/ref_header_version'):
        return 'operation_schema'
    if probe.guard == 'observation_only_hook':
        return 'payload_schema'
    if probe.guard == 'original_server_required':
        return 'payload_schema' if probe.id.startswith('persona.') else 'adapter_schema'
    if probe.guard.startswith('owner_io_'):
        return 'source_io_schema'
    if probe.guard == 'resolution_closed_shape':
        return 'resolution_storage_schema'
    if probe.guard in ('envelope_schema_version','envelope_integer_type'):
        return 'event_record_schema'
    if probe.guard == 'operation_actor_ref_pattern':
        return 'operation_schema'
    if probe.guard == 'retry_immutability':
        return 'retry_identity' if probe.id.endswith('different_valid_original') else 'idempotency_conflict'
    if probe.guard == 'current_writer_policy':
        return 'replay_only_not_appendable' if probe.id.endswith('replay_only_append') else 'writer_replay_policy'
    return probe.guard


def changes(a, b, path=()):
    """Exact typed input diff, not Python's bool/int/float equality."""
    if type(a) is not type(b):
        return [list(path)]
    if isinstance(a, dict):
        return [p for k in sorted(set(a) | set(b)) for p in
                ([list(path + (k,))] if k not in a or k not in b else changes(a[k], b[k], path + (k,)))]
    if isinstance(a, list):
        if len(a) != len(b):
            return [list(path)]
        return [p for i, (x, y) in enumerate(zip(a, b)) for p in changes(x, y, path + (i,))]
    return [] if a == b else [list(path)]


def family_probes(m, row):
    """Finite proof corpus. Legacy boundary cases remain supplementary only."""
    name = row['event_type']
    base = clone(row['append_valid'][0])
    probes = []

    def add(label, guard, good, bad, defect, mode='append'):
        probes.append(Probe(name + ':' + label, guard, clone(good), clone(bad), defect, mode))

    # Existing complete append runtime cases retain their source operands.
    # Schema/type targets below are constructed from coherent source models.
    for original in row['append_invalid']:
        error = original['expected_error']
        if error in ('payload_schema', 'adapter_schema'):
            continue
        bad = clone(original); label = bad.pop('label'); bad.pop('expected_error')
        good = clone(min(row['append_valid'], key=lambda c: len(changes({k:v for k,v in c.items() if k != 'label'}, bad))))
        good.pop('label', None)
        add('append/' + label, 'current_writer_policy' if error in ('replay_only_not_appendable', 'writer_replay_policy') else error,
            good, bad, label)

    # Same semantic source field, with all observations derived before the
    # full call. Unknown/ill-typed subject refs do not alter any identity field.
    for label, value in [('boolean', True), ('string_boolean', 'false'), ('string_number', '0'),
                         ('integer', 0), ('null', None), ('array', []), ('nested_object', {'x': []})]:
        bad = clone(base); bad['payload']['subject_ref'] = value
        bad = rebuild(m, name, bad)
        add('payload_subject/' + label, 'payload_subject_domain', base, bad, 'payload.subject_ref')
    for label, edit in [('extension', lambda p: p.update(unexpected_secret='must-refuse')),
                        ('missing_subject', lambda p: p.pop('subject_ref'))]:
        bad = clone(base); edit(bad['payload']); bad = rebuild(m, name, bad)
        add('payload_shape/' + label, 'payload_shape_' + label, base, bad, 'payload.' + label)

    # C7's exact Python-equal integer field. Choose its valid source case,
    # including the separately valid revision-1 deletion.
    old = next(c for c in row['append_invalid'] if c['label'].startswith('inline_python_equal_bool/'))
    field = old['label'].split('/')[-1]
    good = clone(old); good.pop('expected_error'); good.pop('label')
    if type(good['payload'][field]) is bool:
        good['payload'][field] = int(good['payload'][field])
        if name == 'persona.deleted' and field == 'revision':
            good['payload']['expected_owner_revision'] = good['payload'][field]
    good['event_record']['payload'] = clone(good['payload'])
    good = rebuild(m, name, good)
    bad = clone(good)
    bad['payload'][field] = bool(good['payload'][field])
    bad = rebuild(m, name, bad)
    add('coherent_python_equal_bool/' + field, 'payload_integer_type', good, bad, 'payload.' + field)
    if name == 'persona.deleted':
        # The caller's CAS precondition is independent of the removed/result
        # revision. Python equality must not disguise either type defect.
        bad = clone(good)
        bad['payload']['expected_owner_revision'] = bool(good['payload']['expected_owner_revision'])
        bad = rebuild(m, name, bad)
        add('coherent_python_equal_bool/expected_owner_revision', 'payload_integer_type',
            good, bad, 'payload.expected_owner_revision')

    if name.startswith('persona.'):
        for kind in ('request','result'):
            bad=clone(base);bad['source'][kind]['unrecognized_owner_field']=True
            add('owner_schema/'+kind,'owner_io_'+kind,base,bad,'source.'+kind+'.unrecognized_owner_field')
    if name == 'persona.selected':
        for alias in ('requested_persona_id','effective_persona_id'):
            bad=clone(base);bad['source']['resolution'][alias]='forbidden'
            bad['source']['resolution_value'],bad['source']['resolved_resolution']=m['store_resolution'](bad['source']['resolution'])
            add('resolution_alias/'+alias,'resolution_closed_shape',base,bad,'source.resolution.'+alias)

    # Empty original Server has schema, explicit helper and derived CV-366
    # enforcers. Keep each same-field enforcement site in the duplicate set.
    bad=clone(base)
    if name.startswith('persona.'):
        bad['payload']['scope']['server_id']=''
    else:
        bad['source']['scope']['server_id']=''
    bad=rebuild(m,name,bad)
    add('identity/empty_original_server','original_server_required',base,bad,'source.scope.server_id')

    # Exact boolean flags: schema type and explicit grant/fence are deliberate
    # duplicates of one invariant. Unused flags retain schema-only groups.
    flag_guards = {'writer_current': 'writer', 'access_current': 'access',
        'definition_writer_current': 'definition_writer', 'protected_id': 'protected',
        'computer_mirror': 'mirror', 'confirmation_current': 'confirmation',
        'source_verified': 'source_trust', 'cas_current': 'cas', 'reach_allows_no_project': 'reach'}
    active = {'writer_current', 'access_current'}
    if name.startswith('persona.'):
        if name != 'persona.exported': active.add('definition_writer_current')
        if name in ('persona.created','persona.deleted','persona.imported','persona.updated'): active.update(('protected_id','computer_mirror'))
        if name == 'persona.deleted': active.add('confirmation_current')
        if name in ('persona.deleted','persona.updated','persona.imported'): active.add('cas_current')
        if name == 'persona.imported': active.add('source_verified')
        if name == 'persona.selected': active.add('reach_allows_no_project')
    for flag in flag_guards:
        if flag not in base['source']: continue
        guard = flag_guards[flag] if flag in active else 'source_type_' + flag
        for label, value in [('string_false','false'),('string_zero','0'),('integer',0),('null',None),
                             ('array',[]),('object',{'value':False})]:
            bad = clone(base); bad['source'][flag] = value
            add('source/' + flag + '/' + label, guard, base, bad, 'source.' + flag)
        if flag in active:
            bad = clone(base); bad['source'][flag] = not base['source'][flag]
            add('source/' + flag + '/opposite_boolean', guard, base, bad, 'source.' + flag)

    # Valid envelope schema target unrelated to identity/source joins.
    bad = clone(base); bad['event_record']['schema_version'] = '9.0.0'
    add('envelope/schema_version', 'envelope_schema_version', base, bad, 'event_record.schema_version')
    bad = clone(base); bad['event_record']['payload']['subject_ref'] = 'ref:subject/foreign'
    add('envelope/body_copy', 'payload_transport_join', base, bad, 'event_record.payload.subject_ref')
    bad = clone(base); bad['event_record']['event_id'] += '-foreign'
    add('envelope/identity', 'identity', base, bad, 'event_record.event_id')

    # Numeric spellings use a caller integer field with no observational copy.
    # Its exact-type rule can therefore be removed without a stale identity or
    # codec refusal hiding it. Signed zero is a separate canonical positive.
    numeric_good=clone(base); numeric_good['event_record']['producer_sequence_id']=1
    for label, text in [('decimal','1.0'),('exponent','1e0')]:
        bad=clone(numeric_good); bad['event_record']['producer_sequence_id']=json.loads(text)
        add('numeric/'+label,'envelope_integer_type',numeric_good,bad,'event_record.producer_sequence_id')

    # Family semantic guards are reached with shape-valid coherent records.
    if name == 'auth.github.token.polling':
        bad=clone(base); bad['payload']['poll_interval_seconds']=bad['payload']['previous_interval_seconds']
        bad=rebuild(m,name,bad)
        add('semantic/cadence','cadence',base,bad,'payload.poll_interval_seconds')
    if name == 'plugin.hook.blocked':
        for hook in ('post_tool_invoke','post_attempt_complete'):
            bad=clone(base); bad['payload']['hook_name']=hook; bad=rebuild(m,name,bad)
            add('semantic/'+hook,'observation_only_hook',base,bad,'payload.hook_name')
    if name.startswith('persona.'):
        for old in row['semantic_invalid']:
            if old['expected_error'] not in ('home_scope','override_lineage','cas','creation_source'): continue
            # Re-derive observations from the one changed logical field. Flags
            # were independently covered above and are not synchronized away.
            bad=clone(base); bad['payload']=clone(old['payload']); bad['source']=clone(old['source'])
            bad=rebuild(m,name,bad)
            good=clone(min(row['append_valid'],key=lambda x:len(changes(x['payload'],bad['payload']))))
            add('semantic/'+old['case_id'],old['expected_error'],good,bad,'payload semantic relationship')
        if name == 'persona.created':
            good=clone(next(c for c in row['append_valid'] if c['payload']['command_id']=='cmd.persona.duplicate'))
            bad=clone(good); bad['payload']['source_id']=bad['payload']['persona_id']; bad=rebuild(m,name,bad)
            add('semantic/creation_source','creation_source',good,bad,'payload.source_id')

    # Each independent runtime refusal site has its own complete-path target.
    # Similar diagnostic strings never make two different predicates a pair.
    bad=clone(base);bad['event_record']['thread_id']='thread-foreign'
    add('envelope/lineage_copy','envelope_source_join',base,bad,'event_record.thread_id')
    if not name.startswith('auth.'):
        project=clone(next(c for c in row['append_valid'] if m['source_scope'](c['source'])['scope_kind']=='project'))
        bad=clone(project);bad['scope_partition']='project:foreign'
        add('partition/envelope','partition',project,bad,'scope_partition')
        if name.startswith('persona.'):
            bad=clone(project);bad['payload']['scope']['scope_partition']='project:foreign';bad=rebuild(m,name,bad)
            bad['scope_partition']=project['scope_partition']
            add('partition/coherent_source','partition',project,bad,'payload.scope.scope_partition')
    if name == 'persona.deleted':
        bad=clone(base);bad['payload']['expected_owner_revision']=base['payload']['revision']-1;bad=rebuild(m,name,bad)
        add('semantic/delete_revision_cas','cas',base,bad,'payload.expected_owner_revision')
    if name == 'persona.updated':
        bad=clone(base);bad['payload']['source_id']='foreign-persona';bad=rebuild(m,name,bad)
        add('semantic/update_source_identity','cas',base,bad,'payload.source_id')
        bad=clone(base);bad['payload']['source_revision']=bad['payload']['expected_owner_revision']=bad['payload']['revision'];bad=rebuild(m,name,bad)
        add('semantic/update_revision_order','cas',base,bad,'source previous revision')
    if name == 'persona.imported':
        for key in ('source_id','source_revision','source_sha256'):
            bad=clone(base);bad['payload'][key]=None;bad=rebuild(m,name,bad)
            add('semantic/import_source_reference/'+key,'source_trust',base,bad,'payload.'+key)
    if name.startswith('persona.') and name!='persona.selected':
        project=clone(next(c for c in row['append_valid'] if m['source_scope'](c['source'])['scope_kind']=='project'))
        bad=clone(project);bad['payload']['home_kind']='library';bad['payload']['home_project_id']=None;bad['payload']['project_version_id']=None;bad=rebuild(m,name,bad)
        add('semantic/library_home_project_scope','home_scope',project,bad,'payload.home_kind')
    if name=='persona.selected':
        bad=clone(base);bad['payload']['persona_override_owner_id']='thread-foreign';bad=rebuild(m,name,bad)
        add('semantic/null_override_owner','override_lineage',base,bad,'payload.persona_override_owner_id')

    # Complete retry validates the original before comparing caller semantics.
    for c in row['retry_cases']:
        if 'expected_error' not in c: continue
        good = {'original': clone(c['original']), 'candidate': clone(c['original'])}
        bad = {'original': clone(c['original']), 'candidate': clone(c['candidate'])}
        add('retry/' + c['label'], 'retry_immutability', good, bad, 'candidate caller-semantic field', 'retry')

    other=clone(base);other['payload']['operation_id']+='-different-original';other=rebuild(m,name,other)
    good={'original':clone(base),'candidate':clone(base)}
    bad={'original':other,'candidate':clone(base)}
    add('retry/different_valid_original','retry_immutability',good,bad,'original operation identity','retry')

    # Historical originals deliberately keep the history policy boundary;
    # current append admission must never reach retained compatibility data.
    for c in row['history_cases']:
        if 'expected_error' not in c or c['expected_error'] in ('adapter_schema','payload_schema'): continue
        bad = clone(c); label = bad.pop('label'); bad.pop('expected_error')
        good = clone(min((x for x in row['history_cases'] if 'expected_error' not in x),
                         key=lambda x: len(changes({k:v for k,v in x.items() if k != 'label'}, bad))))
        good.pop('label', None)
        add('history/' + label, c['expected_error'], good, bad, label, 'history')
    hbase = clone(next(c for c in row['history_cases'] if c['label'] == 'retained_after_live_state_changed'))
    hbase.pop('label', None)
    for fields, guard in [(('retained','authentic','admitted_when_written'),'historical_provenance'),
                           (('reader_current','family_withdrawn'),'historical_withdrawn'),
                           (('access_current','body_deleted'),'historical_access')]:
        for field in fields:
            bad=clone(hbase); bad[field]=not hbase[field]
            add('history_flag/' + field, guard, hbase, bad, 'history.'+field, 'history')
            for label, value in [('false_string','false'),('zero_string','0'),('integer',0),('null',None),('array',[]),('object',{'x':False})]:
                bad=clone(hbase); bad[field]=value
                add('history_type/' + field + '/' + label, guard, hbase, bad, 'history.'+field, 'history')
    for label,value in [('false_string','false'),('zero_string','0'),('integer',0),('null',None),('array',[]),('object',{'x':False})]:
        bad=clone(hbase); bad['storage_record']['authenticated']=value
        add('storage_type/' + label, 'historical_storage_source', hbase,bad,'storage.authenticated','history')

    # Full append first, then the actual physical operation recovery path.
    # Both operands come from one valid append, never independently invented
    # expected operation data.
    logical=m['make_operation'](name,base)
    value,resolved=m['store_operation'](logical,True)
    opbase={'append':clone(base),'logical':logical,'value':value,'resolved':resolved}
    for field,value,error in [('durable',False,'payload_ref_unavailable'),('access_current',False,'payload_ref_unavailable'),
                              ('byte_size',resolved['byte_size']+1,'payload_ref_integrity'),
                              ('media_type','text/plain','payload_ref_integrity'),('blake3_id','0'*64,'payload_ref_integrity')]:
        bad=clone(opbase);bad['resolved'][field]=value
        add('operation/'+field,error,opbase,bad,'resolved.'+field,'operation')
    good=clone(base)
    bad=clone(base); bad['source']['actor_ref'] += '\n'; bad['event_record']['actor_ref'] = bad['source']['actor_ref']
    add('operation/actor_ref_LF','operation_actor_ref_pattern',good,bad,'source.actor_ref')
    for field in ('durable','access_current'):
        for label,value in [('false_string','false'),('zero_string','0'),('integer',0),('null',None),('array',[]),('object',{'x':False})]:
            bad=clone(opbase);bad['resolved'][field]=value
            add('resolved_type/'+field+'/'+label,'payload_ref_unavailable',opbase,bad,'resolved.'+field,'operation')
    bad=clone(opbase);bad['value']['schema_version']='9.0.0'
    add('operation/ref_header_version','operation_source_join',opbase,bad,'operation carrier schema_version','operation')
    # Corrupt encoding while retaining precisely the same logical operation.
    # Digest/size/transport are coherent, so only canonical-byte enforcement
    # refuses this case; a malformed decoded object would mask that guard.
    import msgpack
    from blake3 import blake3
    body=msgpack.packb(logical,use_bin_type=True)
    assert body!=binding_bytes(logical)
    bad=clone(opbase);ref={'blake3_id':blake3(body).hexdigest(),'byte_size':len(body),'media_type':'application/msgpack'}
    bad['value']['payload_ref']=clone(ref)
    bad['resolved']={'ref':'ref:payload/'+ref['blake3_id'],**ref,'bytes_hex':body.hex(),'durable':True,'access_current':True}
    add('operation/noncanonical_bytes','payload_ref_integrity',opbase,bad,'operation canonical byte ordering','operation')
    for field in ('effect_receipt_ref','payload'):
        bad=clone(opbase); foreign=clone(logical)
        if field=='payload': foreign['payload']['subject_ref']='ref:subject/foreign'
        else: foreign[field]='ref:receipt/foreign'
        bad['value'],bad['resolved']=m['store_operation'](foreign,True)
        add('operation/foreign_'+field,'operation_source_join',opbase,bad,'operation.'+field,'operation')
    for c in row['operation_cases']:
        if c.get('expected_error')!='operation_value_too_large': continue
        matching=next((a for a in row['append_valid'] if a['payload']==c['logical']['payload']),None)
        if matching is None: continue
        expected=m['make_operation'](name,matching)
        if expected!=c['logical']: continue
        physical,resolved=m['store_operation'](expected)
        good={'append':clone(matching),'logical':clone(expected),'value':physical,'resolved':resolved}
        bad=clone(good);bad['value']=clone(expected);bad['resolved']=None
        add('operation/'+c['label'],'operation_value_too_large',good,bad,'operation physical carrier','operation')
    if name == 'persona.selected':
        for c in row['resolution_cases']:
            if 'expected_error' not in c: continue
            matching=next((a for a in row['append_valid'] if a['source']['resolution']==c['logical']),None)
            if matching is None: continue
            good=clone(matching);bad=clone(matching)
            bad['source']['resolution_value']=clone(c['value']);bad['source']['resolved_resolution']=clone(c['resolved'])
            add('resolution/'+c['label'],c['expected_error'],good,bad,'source resolution physical carrier')
    return probes
