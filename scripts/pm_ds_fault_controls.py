"""Single-fault fixture/loader controls through the original Home4 CLI main."""
import copy
import io
import json
import sys
from contextlib import ExitStack, redirect_stdout
from unittest.mock import patch
import pm_home_layout_v2_slot_receipt as home
import pm_event_authority_ds_round2 as ds


def cases():
    fixtures = ds.load(home.FIXTURES)
    slot = copy.deepcopy(next(c for c in fixtures['valid'] if c['id'] == 'home4_readback_verified_slot'))
    minimal = {'valid': [slot], 'invalid': [], 'payload_store': []}
    result = []
    def add(uid, name, pack, expected, *, dependency=None):
        def accepts():
            original_load = home.load
            def load(root, rel):
                return copy.deepcopy(pack) if rel == home.FIXTURES else original_load(root, rel)
            with ExitStack() as stack:
                stack.enter_context(patch.object(home, 'load', load))
                stack.enter_context(patch.object(sys, 'argv', [home.__file__]))
                if dependency is not None:
                    stack.enter_context(dependency())
                stream = io.StringIO()
                with redirect_stdout(stream):
                    code = home.main()
                report = json.loads(stream.getvalue())
            failures = report['failures']
            # This is failure-oracle escape, not product/event admission.
            return code == 0 or not any(expected(f) for f in failures)
        result.append(('FAULT-' + uid + ':' + name, accepts))

    original_refs = home.ref_closure
    def unresolved():
        def refs(*args):
            n, p, errors = original_refs(*args)
            return n + 1, p, errors + ['injected unavailable dormant resource']
        return patch.object(home, 'ref_closure', refs)
    add('U193', 'resolver_dependency', minimal, lambda f: f['id'] == '$ref', dependency=unresolved)
    unused = copy.deepcopy(minimal)
    unused['payload_store'] = [{'blake3_id': home.blake3_hex(b'unused'), 'media_type': 'application/msgpack',
                                'bytes': 'dW51c2Vk'}]
    # Match the fixture store's exact projection encoding.
    template = fixtures['payload_store'][0]
    unused['payload_store'][0] = copy.deepcopy(template)
    add('U194', 'unused_payload', unused, lambda f: f['id'] == 'payload_store')
    bad_positive = copy.deepcopy(minimal)
    bad_positive['valid'][0]['value']['undeclared'] = True
    add('U196', 'invalid_positive', bad_positive, lambda f: f['id'] == slot['id'] and f['expected'] == 'accept')
    accepted_negative = copy.deepcopy(minimal)
    accepted_negative['invalid'] = [{'id': 'accepted-negative', 'base': slot['id'], 'ops': [], 'rejected_by': 'schema'}]
    add('U200', 'accepted_schema_negative', accepted_negative, lambda f: f['id'] == 'accepted-negative')
    wrong_diagnostic = copy.deepcopy(minimal)
    wrong_diagnostic['invalid'] = [{'id': 'wrong-diagnostic', 'base': slot['id'],
        'ops': [{'op': 'replace', 'path': '/readback/canonical_key', 'value': 'home_workspace_layout.v2:other:workspace'}],
        'rejected_by': 'I2'}]
    add('U199', 'wrong_required_diagnostic', wrong_diagnostic, lambda f: f['id'] == 'wrong-diagnostic')
    shape_fault = copy.deepcopy(wrong_diagnostic)
    shape_fault['invalid'][0]['rejected_by'] = 'I3'
    shape_fault['invalid'][0]['ops'].append({'op': 'add', 'path': '/undeclared', 'value': True})
    add('U198', 'schema_fault_in_invariant_case', shape_fault,
        lambda f: f['id'] == 'wrong-diagnostic' and f['expected'] == 'schema-valid, I3 rejection')
    def bad_limit():
        original_load=home.load
        def load(root,rel):
            value=original_load(root,rel)
            if rel==home.STORAGE_REGISTRY:
                value=copy.deepcopy(value)
                profile=value['storage_profile']
                profile['family_profiles'][home.FAMILY['transaction_slot']]['max_value_bytes']=profile['value_limit_bytes']+1
            return value
        return patch.object(home,'load',load)
    add('U195','family_limit_above_store',minimal,lambda f:f['id']=='limit',dependency=bad_limit)
    proper_schema_negative=copy.deepcopy(minimal)
    proper_schema_negative['invalid']=[{'id':'one-schema-negative','base':slot['id'],'rejected_by':'schema',
        'ops':[{'op':'add','path':'/unexpected','value':True}]}]
    def route():
        old=home.load
        def load(root,rel):return copy.deepcopy(proper_schema_negative) if rel==home.FIXTURES else old(root,rel)
        with patch.object(home,'load',load),patch.object(sys,'argv',[home.__file__]):
            stream=io.StringIO()
            with redirect_stdout(stream):code=home.main()
            report=json.loads(stream.getvalue())
        return code!=0 or report['counts']['schema_negative']!=1 or report['counts']['invariant_negative']!=0
    result.append(('FAULT-U197:valid_schema_negative_dispatch',route))
    return result
