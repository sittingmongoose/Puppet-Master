"""Exact byte/type/state oracles for the review's representation conditions."""
import copy
import math
import base64
import pm_home_layout_v2_slot_receipt as h
import pm_event_authority_ds_round2 as ds


def cases():
    values=[None,False,True,0,1,127,128,255,256,65535,65536,2**32-1,2**32,2**64-1,
            -1,-32,-33,-128,-129,-32768,-32769,-2**31,-2**31-1,-2**63,0.0,-0.0,1.5,math.pi,1e100]
    values += ['x'*n for n in (0,1,31,32,255,256,65535,65536)]
    values += [b'x'*n for n in (0,255,256,65535,65536)]
    values += [[None]*n for n in (0,15,16,65535,65536)]
    values += [{str(i):None for i in range(n)} for n in (0,15,16)]
    rows=[]
    for ordinal,value in enumerate(values):
        expected=h.canonical_msgpack(value)
        def broken(value=value,expected=expected):
            try:
                encoded=h.canonical_msgpack(value)
                decoded=h.decode_canonical_msgpack(encoded)
                return encoded!=expected or type(decoded) is not type(value) or decoded!=value or (
                    type(value) is float and math.copysign(1.,decoded)!=math.copysign(1.,value))
            except Exception:
                return True
        rows.append(('CODEC:exact_bytes_and_type:'+str(ordinal),broken))
    for value in (float('inf'),-float('inf'),float('nan')):
        def invalid(value=value):
            try:
                h.canonical_msgpack(value)
            except ValueError:
                return False
            return True
        rows.append(('NEG-U149:nonfinite:'+repr(value),invalid))
    for source in (r'\$',r'[$]',r'\\$',r'[$a]$',r'^a\$b$',r'^[a-z]+$'):
        expected=h.ecma_regex(source)
        rows.append(('REGEX:exact_end_grammar:'+source,lambda s=source,e=expected:h.ecma_regex(s)!=e))
    for value in (b'bytes',[b'nested'],{'key':b'value'}):
        expected=h.to_projection(value)
        rows.append(('PROJECTION:'+repr(value),lambda v=value,e=expected:h.to_projection(v)!=e))
    for fixture in ds.load(h.FIXTURES)['valid']:
        if fixture['definition'] not in h.FAMILY:
            continue
        definition,value=fixture['definition'],fixture['value']
        expected=h.stored_bytes(definition,value)
        rows.append(('STORED_BIN:'+fixture['id'],lambda d=definition,v=value,e=expected:h.stored_bytes(d,v)!=e))
    checker=h.Checker(ds.ROOT)
    expected=(checker.refs,checker.patterns,checker.unresolved)
    def reference_walk():
        actual=h.Checker(ds.ROOT)
        return (actual.refs,actual.patterns,actual.unresolved)!=expected
    rows.append(('SCHEMA:complete_reference_traversal',reference_walk))
    # A decoder bounds failure must be a structured ValueError, never an
    # IndexError/struct crash that a refusal harness mistakes for acceptance.
    for data in (b'\xda\x00\x03x',b'\xc4\x02x',b'\xcd\x01'):
        def truncated(data=data):
            try:
                h.decode_canonical_msgpack(data)
            except ValueError:
                return False
            except Exception:
                return True
            return True
        rows.append(('FAULT-U159:structured_truncation:'+data.hex(),truncated))
    wrapped=[]
    def assertion(call):
        def asserted():
            try:return call()
            except Exception as exc:
                asserted.details='Valid representation/structured refusal failed: '+repr(exc)
                return True
        asserted.proof_kind='valid_representation_or_structured_codec_assertion'
        return asserted
    for name,call in rows:
        wrapped.append((name,assertion(call)))
    return wrapped
